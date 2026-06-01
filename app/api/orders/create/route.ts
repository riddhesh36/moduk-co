import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { razorpay } from '@/lib/razorpay';
import { MOCK_PRODUCTS } from '@/lib/constants';
import { checkDeliveryZone } from '@/lib/deliveryZones';

function parseSlotDate(dateStr: string) {
  if (!dateStr || dateStr === 'today') {
    return new Date().toISOString().split('T')[0];
  } else if (dateStr === 'tomorrow') {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  return new Date().toISOString().split('T')[0];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract details
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_slot,
      items,
      coupon_id,
      discount_amount,
      pincode,
      notes,
      wa_opt_in,
      delivery_option
    } = body;

    // Basic validation
    if (!customer_name || !customer_phone || !delivery_address || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine slot date fallback
    const firstItem = items && items.length > 0 ? items[0] : null;
    const selectedDate = body.slot_date || body.selected_date || (firstItem && firstItem.selectedDate) || 'today';

    // 1. Fetch products to enrich the items array for DB persistence
    const { data: dbProducts } = await supabase.from('products').select('*');
    const productsMap = new Map(dbProducts?.map(p => [p.id, p]) || []);

    const enrichedItems = items.map((item: { product_id: string; quantity: number; selectedSlotId?: string; selectedDate?: string }) => {
      const pId = item.product_id;
      const product = productsMap.get(pId) || MOCK_PRODUCTS.find(p => p.id === pId);
      return {
        product: product || { id: pId, name: pId, price: 0 },
        quantity: item.quantity,
        selectedSlotId: item.selectedSlotId || delivery_slot,
        selectedDate: item.selectedDate || selectedDate
      };
    });

    // 2. Group enriched items by slotId + date
    const slotsMap = new Map<string, typeof enrichedItems>();
    enrichedItems.forEach((item: typeof enrichedItems[0]) => {
      const key = `${item.selectedSlotId}_${item.selectedDate}`;
      if (!slotsMap.has(key)) {
        slotsMap.set(key, []);
      }
      slotsMap.get(key)!.push(item);
    });

    const groupedSlots = Array.from(slotsMap.entries()).map(([key, slotItems]) => {
      const slotId = slotItems[0].selectedSlotId;
      const originalDate = slotItems[0].selectedDate;
      const slotDate = parseSlotDate(originalDate);
      const subtotal = slotItems.reduce((acc: number, item: typeof enrichedItems[0]) => acc + (item.product.price * item.quantity), 0);
      return {
        key,
        slotId,
        originalDate,
        slotDate,
        subtotal,
        items: slotItems
      };
    });

    // 3. Validate slot availability for each slot group
    for (const group of groupedSlots) {
      const { data: slot, error: slotErr } = await supabase
        .from('delivery_slots')
        .select('*')
        .eq('id', group.slotId)
        .single();

      if (slotErr || !slot) {
        return NextResponse.json({ error: `Selected delivery slot ${group.slotId} does not exist` }, { status: 400 });
      }

      if (!slot.is_active) {
        return NextResponse.json({ error: `Selected delivery slot ${slot.label} is inactive` }, { status: 400 });
      }

      // Count confirmed/pending orders for this slot and date
      const { count, error: countErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('slot_id', group.slotId)
        .eq('slot_date', group.slotDate)
        .not('status', 'in', '("cancelled","payment_failed")');

      if (countErr) {
        console.error("Error counting orders for capacity:", countErr);
      } else if (count !== null && count >= slot.max_capacity) {
        return NextResponse.json({ error: `Selected delivery slot ${slot.label} is fully booked for ${group.slotDate}` }, { status: 400 });
      }
    }

    // 4. Calculate delivery fees per slot group
    let validatedZone: { zone: 1 | 2; fee: number; label: string } | null = null;
    if (delivery_option === "delivery") {
      const zoneResult = checkDeliveryZone(pincode || "");
      if (zoneResult.status === "out_of_zone") {
        return NextResponse.json({ error: "Delivery not available for this pincode" }, { status: 400 });
      }
      if (zoneResult.status !== "serviceable") {
        return NextResponse.json({ error: "Invalid or missing pincode for delivery" }, { status: 400 });
      }
      validatedZone = zoneResult;
    }

    const groupsWithFee = groupedSlots.map(group => {
      let slotDeliveryFee = 0;
      let slotDeliveryZone = null;

      if (delivery_option === "delivery" && validatedZone) {
        slotDeliveryFee = group.subtotal > 399 ? 0 : validatedZone.fee;
        slotDeliveryZone = validatedZone.zone;
      }

      return {
        ...group,
        deliveryFee: slotDeliveryFee,
        deliveryZone: slotDeliveryZone
      };
    });

    // 5. Split coupon discount proportionally
    const totalSubtotal = groupsWithFee.reduce((acc, g) => acc + g.subtotal, 0);
    let remainingDiscount = discount_amount || 0;

    const groupsWithDiscount = groupsWithFee.map((group, idx) => {
      let slotDiscount = 0;
      if (remainingDiscount > 0) {
        if (idx === groupsWithFee.length - 1) {
          slotDiscount = remainingDiscount;
        } else {
          slotDiscount = Math.round((group.subtotal / totalSubtotal) * (discount_amount || 0));
          remainingDiscount -= slotDiscount;
        }
      }

      const slotOriginalTotal = group.subtotal + group.deliveryFee;
      const slotFinalTotal = Math.max(0, slotOriginalTotal - slotDiscount);

      return {
        ...group,
        discount: slotDiscount,
        originalTotal: slotOriginalTotal,
        finalTotal: slotFinalTotal
      };
    });

    const grandFinalTotal = groupsWithDiscount.reduce((acc, g) => acc + g.finalTotal, 0);

    // 6. Create order rows in Supabase
    const createdOrders = [];
    for (const group of groupsWithDiscount) {
      const displayId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
      const orderData = {
        display_id: displayId,
        customer_name,
        customer_mobile: customer_phone,
        customer_email,
        address_line1: delivery_address,
        address_area: notes ? `Notes: ${notes}` : 'N/A',
        address_city: 'Mumbai',
        address_pincode: pincode || '400001',
        items: group.items,
        slot_id: group.slotId,
        slot_date: group.slotDate,
        payment_method: 'razorpay',
        payment_status: 'pending',
        razorpay_order_id: null,
        payment_link_id: null,
        payment_id: null,
        wa_opt_in: wa_opt_in || false,
        order_notes: notes || "",
        status: 'payment_pending',
        total_amount: group.finalTotal,
        coupon_id: coupon_id || null,
        discount_amount: group.discount,
        original_total: group.originalTotal,
        final_total: group.finalTotal,
        delivery_option: delivery_option || 'delivery',
        delivery_fee: group.deliveryFee,
        delivery_zone: group.deliveryZone,
      };

      const { data: newOrder, error: insertErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (insertErr || !newOrder) {
        console.error("Order insertion error:", insertErr);
        // Mark previously created orders in this request as failed
        if (createdOrders.length > 0) {
          const prevIds = createdOrders.map(o => o.id);
          await supabaseAdmin.from('orders').update({ status: 'payment_failed', payment_status: 'failed' }).in('id', prevIds);
        }
        return NextResponse.json({ error: "Failed to create order record" }, { status: 500 });
      }
      createdOrders.push(newOrder);
    }

    // 7. Call Razorpay Payment Links API for consolidated total
    let paymentLink;
    const firstDisplayId = createdOrders[0].display_id;
    const allDisplayIds = createdOrders.map(o => o.display_id).join(', ');

    try {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
      
      paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(grandFinalTotal * 100), // in paise
        currency: "INR",
        accept_partial: false,
        description: `Moduk & Co — Order ${allDisplayIds}`,
        customer: {
          name: customer_name,
          contact: `+91${customer_phone.replace(/\D/g, '').slice(-10)}`,
          email: customer_email || undefined
        },
        notify: {
          sms: true,
          email: customer_email ? true : false
        },
        reminder_enable: false,
        notes: {
          order_id: firstDisplayId,
          all_order_ids: allDisplayIds,
          delivery_slot: delivery_slot
        },
        callback_url: `${siteUrl}/order/success?order_id=${firstDisplayId}`,
        callback_method: "get"
      });
    } catch (rzpErr: unknown) {
      console.error("Razorpay Payment Link creation error:", rzpErr);
      const orderIdsToUpdate = createdOrders.map(o => o.id);
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed', payment_status: 'failed' })
        .in('id', orderIdsToUpdate);

      const errObj = rzpErr as { error?: { description?: string; message?: string }; description?: string; message?: string };
      const errorMessage = errObj.error?.description || errObj.error?.message || errObj.description || errObj.message || "Failed to create payment link";
      return NextResponse.json({ error: `Razorpay error: ${errorMessage}` }, { status: 500 });
    }

    // 8. Update all order rows with payment_link_id using admin client
    const orderIdsToUpdate = createdOrders.map(o => o.id);
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ payment_link_id: paymentLink.id })
      .in('id', orderIdsToUpdate);

    if (updateErr) {
      console.error("Failed to update payment_link_id in orders:", updateErr);
    }

    // Set customer_email cookie in headers so success page can access it
    if (customer_email) {
      cookies().set("customer_email", customer_email, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      });
    }

    // Return payment_url and the primary displayId
    return NextResponse.json({
      payment_url: paymentLink.short_url,
      order_id: firstDisplayId
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Create Order Route API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

