import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { razorpay } from '@/lib/razorpay';
import { MOCK_PRODUCTS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract details
    const {
      customer_name,
      customer_phone,
      delivery_address,
      delivery_slot,
      items,
      coupon_id,
      discount_amount,
      original_total,
      final_total,
      pincode,
      notes,
      wa_opt_in,
      delivery_option
    } = body;

    // Basic validation
    if (!customer_name || !customer_phone || !delivery_address || !delivery_slot || !items || !items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine slot date
    const firstItem = items && items.length > 0 ? items[0] : null;
    const selectedDate = body.slot_date || body.selected_date || (firstItem && firstItem.selectedDate) || 'today';
    
    let slotDate = selectedDate;
    if (selectedDate === 'today') {
      slotDate = new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      slotDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    }

    // 1. Validate slot availability from Supabase
    const { data: slot, error: slotErr } = await supabase
      .from('delivery_slots')
      .select('*')
      .eq('id', delivery_slot)
      .single();

    if (slotErr || !slot) {
      return NextResponse.json({ error: "Selected delivery slot does not exist" }, { status: 400 });
    }

    if (!slot.is_active) {
      return NextResponse.json({ error: "Selected delivery slot is inactive" }, { status: 400 });
    }

    // Count confirmed/pending orders for this slot and date
    const { count, error: countErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('slot_id', delivery_slot)
      .eq('slot_date', slotDate)
      .not('status', 'in', '("cancelled","payment_failed")');

    if (countErr) {
      console.error("Error counting orders for capacity:", countErr);
    } else if (count !== null && count >= slot.max_capacity) {
      return NextResponse.json({ error: "Selected delivery slot is fully booked for this date" }, { status: 400 });
    }

    // 2. Fetch products to enrich the items array for DB persistence
    const { data: dbProducts } = await supabase.from('products').select('*');
    const productsMap = new Map(dbProducts?.map(p => [p.id, p]) || []);

    const enrichedItems = items.map((item: { product_id: string; quantity: number }) => {
      const pId = item.product_id;
      const product = productsMap.get(pId) || MOCK_PRODUCTS.find(p => p.id === pId);
      return {
        product: product || { id: pId, name: pId, price: 0 },
        quantity: item.quantity,
        selectedSlotId: delivery_slot,
        selectedDate: selectedDate
      };
    });

    // 3. Create order row in Supabase with status = 'payment_pending'
    const displayId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      display_id: displayId,
      customer_name,
      customer_mobile: customer_phone,
      address_line1: delivery_address,
      address_area: notes ? `Notes: ${notes}` : 'N/A',
      address_city: 'Mumbai',
      address_pincode: pincode || '400001',
      items: enrichedItems,
      slot_id: delivery_slot,
      slot_date: slotDate,
      payment_method: 'razorpay',
      payment_status: 'pending',
      razorpay_order_id: null,
      payment_link_id: null,
      payment_id: null,
      wa_opt_in: wa_opt_in || false,
      order_notes: notes || "",
      status: 'payment_pending',
      total_amount: final_total,
      coupon_id: coupon_id || null,
      discount_amount: discount_amount || 0,
      original_total: original_total || final_total,
      final_total: final_total,
      delivery_option: delivery_option || 'delivery',
    };

    const { data: newOrder, error: insertErr } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (insertErr || !newOrder) {
      console.error("Order insertion error:", insertErr);
      return NextResponse.json({ error: "Failed to create order record" }, { status: 500 });
    }

    // 4. Call Razorpay Payment Links API
    let paymentLink;
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      
      paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(final_total * 100), // in paise
        currency: "INR",
        accept_partial: false,
        description: `Moduk & Co — Order #${displayId}`,
        customer: {
          name: customer_name,
          contact: `+91${customer_phone}`
        },
        notify: {
          sms: true,
          email: false
        },
        reminder_enable: false,
        notes: {
          order_id: displayId,
          delivery_slot: delivery_slot
        },
        callback_url: `${siteUrl}/order/success?order_id=${displayId}`,
        callback_method: "get"
      });
    } catch (rzpErr: any) {
      console.error("Razorpay Payment Link creation error:", rzpErr);
      // Update order to payment_failed if link generation fails
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_failed', payment_status: 'failed' })
        .eq('id', newOrder.id);

      return NextResponse.json({ error: `Razorpay error: ${rzpErr.description || rzpErr.message || "Failed to create payment link"}` }, { status: 500 });
    }

    // 5. Update order row with payment_link_id using admin client (bypasses RLS)
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ payment_link_id: paymentLink.id })
      .eq('id', newOrder.id);

    if (updateErr) {
      console.error("Failed to update payment_link_id in order:", updateErr);
      // Continue even if update fails, as the customer has the payment link URL
    }

    // 6. Return payment_url and displayId (order_id)
    return NextResponse.json({
      payment_url: paymentLink.short_url,
      order_id: displayId
    });
  } catch (err: any) {
    console.error("Create Order Route API Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
