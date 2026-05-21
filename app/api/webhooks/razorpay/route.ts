import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Missing webhook signature or secret");
      return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
    }

    const body = await req.text();

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error("Signature verification failed");
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    }

    // 2. Parse payload
    const payload = JSON.parse(body);
    const event = payload.event;
    
    console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

    const entityContainer = payload.payload || payload;
    const paymentLinkEntity = entityContainer.payment_link?.entity;

    if (!paymentLinkEntity) {
      console.warn("No payment link entity found in payload, skipping");
      return NextResponse.json({ success: true, message: "Skipped (no payment link entity)" });
    }

    const orderId = paymentLinkEntity.notes?.order_id; // display_id (ORD-XXXXXX)
    
    if (!orderId) {
      console.warn("No order_id found in payment link notes, skipping");
      return NextResponse.json({ success: true, message: "Skipped (no order_id)" });
    }

    // 3. Handle Events
    if (event === 'payment_link.paid') {
      const razorpay_payment_id = entityContainer.payment?.entity?.id;
      
      console.log(`[RAZORPAY WEBHOOK] Processing paid order: ${orderId}, payment_id: ${razorpay_payment_id}`);

      // Fetch the order from Supabase
      const { data: order, error: fetchErr } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('display_id', orderId)
        .single();

      if (fetchErr || !order) {
        console.error(`Order ${orderId} not found in Supabase:`, fetchErr);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Prevent duplicate processing if already confirmed
      if (order.status === 'confirmed') {
        console.log(`Order ${orderId} is already confirmed. Skipping.`);
        return NextResponse.json({ success: true, message: "Already confirmed" });
      }

      // Update Order Status and Payment Status
      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: razorpay_payment_id || null
        })
        .eq('id', order.id);

      if (updateErr) {
        console.error(`Failed to update order ${orderId} status:`, updateErr);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      // Process Coupon Usage if coupon exists
      if (order.coupon_id) {
        try {
          // Log coupon use
          const { error: couponUseErr } = await supabaseAdmin
            .from('coupon_uses')
            .insert([{
              coupon_id: order.coupon_id,
              order_id: order.id, // UUID
              user_phone: order.customer_mobile,
              discount_applied: order.discount_amount || 0
            }]);

          if (couponUseErr) {
            console.error("Failed to insert coupon use record:", couponUseErr);
          }

          // Increment coupon uses count
          const { data: coupon } = await supabaseAdmin
            .from('coupons')
            .select('uses_count')
            .eq('id', order.coupon_id)
            .single();

          if (coupon) {
            await supabaseAdmin
              .from('coupons')
              .update({ uses_count: (coupon.uses_count || 0) + 1 })
              .eq('id', order.coupon_id);
          }
        } catch (couponErr) {
          console.error("Error processing coupon state:", couponErr);
        }
      }

      // Trigger WhatsApp Notifications
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Send to customer if opted-in
      if (order.wa_opt_in && order.customer_mobile) {
        fetch(`${siteUrl}/api/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderDetails: { id: order.display_id, totalAmount: order.total_amount },
            waNumber: order.customer_mobile,
            customerName: order.customer_name
          })
        }).catch(err => console.error("Error triggering customer notification:", err));
      }

      // Send to admin
      if (process.env.ADMIN_PHONE) {
        fetch(`${siteUrl}/api/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderDetails: { id: order.display_id, totalAmount: order.total_amount },
            waNumber: process.env.ADMIN_PHONE,
            customerName: "Admin"
          })
        }).catch(err => console.error("Error triggering admin notification:", err));
      }

    } else if (event === 'payment_link.expired') {
      console.log(`[RAZORPAY WEBHOOK] Processing expired payment link for order: ${orderId}`);

      const { error: updateErr } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'payment_failed',
          payment_status: 'failed'
        })
        .eq('display_id', orderId);

      if (updateErr) {
        console.error(`Failed to mark order ${orderId} as failed:`, updateErr);
        return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    // Always return 200/204 to Razorpay for unexpected errors to stop retries, but log it
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 200 });
  }
}
