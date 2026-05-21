import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Generate a pretty display ID
    const displayId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const firstItem = body.items && body.items.length > 0 ? body.items[0] : null;
    const selectedDate = firstItem ? firstItem.selectedDate : 'today';
    
    let slotDate = selectedDate;
    if (selectedDate === 'today') {
      slotDate = new Date().toISOString().split('T')[0];
    } else if (selectedDate === 'tomorrow') {
      slotDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    }

    // Calculate totals
    const finalTotal = body.finalTotal || body.totalAmount;
    const originalTotal = body.originalTotal || body.totalAmount;
    const discountAmount = body.discountAmount || 0;

    const orderData = {
      display_id: displayId,
      customer_name: body.name,
      customer_mobile: body.mobile,
      address_line1: body.address,
      address_area: body.notes ? `Notes: ${body.notes}` : 'N/A',
      address_city: 'Mumbai',
      address_pincode: body.pincode,
      items: body.items,
      slot_id: firstItem ? firstItem.selectedSlotId : null,
      slot_date: slotDate,
      payment_method: 'cod',
      payment_status: 'pending_cod',
      razorpay_order_id: null,
      wa_opt_in: body.waOptIn || false,
      order_notes: body.notes || "",
      status: 'cod_pending',
      total_amount: finalTotal,
      coupon_id: body.couponId || null,
      discount_amount: discountAmount,
      original_total: originalTotal,
      final_total: finalTotal,
      delivery_option: body.deliveryOption || 'delivery',
    };

    const { error } = await supabase.from('orders').insert([orderData]).select();
    
    if (error) {
      console.error("Supabase Insertion Error:", error);
      return NextResponse.json({ success: false, error: error.message || JSON.stringify(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, order_id: displayId });
  } catch (err) {
    console.error("Place Order API Error:", err);
    const errorBody = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorBody }, { status: 500 });
  }
}
