import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json(); // order_id is display_id

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // 1. Fetch order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('display_id', order_id)
      .single();

    if (error || !order) {
      console.error("Fetch order for recreate payment link error:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    const cookieStore = cookies();
    const userEmail = cookieStore.get("customer_email")?.value;
    const userMobile = cookieStore.get("customer_mobile")?.value;

    if (order.customer_email && order.customer_email.toLowerCase() !== userEmail?.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 401 });
    }
    if (!order.customer_email && order.customer_mobile && order.customer_mobile !== userMobile) {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 401 });
    }

    // 2. Call Razorpay Payment Links API
    let paymentLink;
    try {
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
      const contactNo = `+91${order.customer_mobile.replace(/\D/g, '').slice(-10)}`;

      paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(Number(order.total_amount) * 100), // in paise
        currency: "INR",
        accept_partial: false,
        description: `Moduk & Co — Order #${order.display_id}`,
        customer: {
          name: order.customer_name,
          contact: contactNo
        },
        notify: {
          sms: true,
          email: false
        },
        reminder_enable: false,
        notes: {
          order_id: order.display_id,
          delivery_slot: order.slot_id
        },
        callback_url: `${siteUrl}/order/success?order_id=${order.display_id}`,
        callback_method: "get"
      });
    } catch (rzpErr: unknown) {
      console.error("Razorpay Payment Link re-creation error:", rzpErr);
      const errObj = rzpErr as { error?: { description?: string; message?: string }; description?: string; message?: string };
      const errorMessage = errObj.error?.description || errObj.error?.message || errObj.description || errObj.message || "Failed to recreate payment link";
      return NextResponse.json({ error: `Razorpay error: ${errorMessage}` }, { status: 500 });
    }

    // 3. Update order row using admin client (bypasses RLS)
    const { error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({ 
        payment_link_id: paymentLink.id,
        status: 'payment_pending',
        payment_status: 'pending'
      })
      .eq('id', order.id);

    if (updateErr) {
      console.error("Failed to update recreated payment_link_id in order:", updateErr);
      // We still return the url as the link is active on Razorpay
    }

    // 4. Return new payment_url
    return NextResponse.json({
      payment_url: paymentLink.short_url
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Recreate Payment API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
