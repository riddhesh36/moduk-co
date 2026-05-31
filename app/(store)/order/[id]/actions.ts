"use server";

import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { razorpay } from "@/lib/razorpay";

export async function getOrder(displayId: string) {
  const cookieStore = cookies();
  
  // Use admin client to load order info bypassing RLS so we can check ownership server-side
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*, delivery_slots(label)")
    .eq("display_id", displayId)
    .single();

  if (error || !order) {
    return { error: "Order not found" };
  }

  const userEmail = cookieStore.get("customer_email")?.value;
  const userMobile = cookieStore.get("customer_mobile")?.value;

  // Security check: Match order customer_email/customer_mobile to client cookies
  if (order.customer_email && order.customer_email.toLowerCase() !== userEmail?.toLowerCase()) {
    return { success: false, error: "Unauthorized access", requiresAuth: true, authType: "email" };
  }
  if (!order.customer_email && order.customer_mobile && order.customer_mobile !== userMobile) {
    return { success: false, error: "Unauthorized access", requiresAuth: true, authType: "mobile" };
  }

  let orderData = order;

  // Fallback: If status is still payment_pending, check status with Razorpay
  if (orderData.status === "payment_pending" && orderData.payment_link_id) {
    try {
      const paymentLink = (await razorpay.paymentLink.fetch(orderData.payment_link_id)) as unknown as {
        status: string;
        payments?: Array<{ id: string }>;
      };
      
      if (paymentLink && paymentLink.status === "paid") {
        const { data: updatedOrder, error: updateErr } = await supabaseAdmin
          .from("orders")
          .update({
            status: "confirmed",
            payment_status: "paid",
            payment_id: paymentLink.payments?.[0]?.id || null
          })
          .eq("id", orderData.id)
          .select("*, delivery_slots(label)")
          .single();

        if (!updateErr && updatedOrder) {
          orderData = updatedOrder;

          // Trigger WhatsApp notifications (fallback)
          const host = headers().get('host') || 'localhost:3000';
          const protocol = host.includes('localhost') ? 'http' : 'https';
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

          // Send to customer if opted-in
          if (orderData.wa_opt_in && orderData.customer_mobile) {
            fetch(`${siteUrl}/api/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderDetails: { id: orderData.display_id, totalAmount: orderData.total_amount },
                waNumber: orderData.customer_mobile,
                customerName: orderData.customer_name
              })
            }).catch(e => console.error("Error triggering customer notification in fallback:", e));
          }

          // Send to admin
          if (process.env.ADMIN_PHONE) {
            fetch(`${siteUrl}/api/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderDetails: { id: orderData.display_id, totalAmount: orderData.total_amount },
                waNumber: process.env.ADMIN_PHONE,
                customerName: "Admin"
              })
            }).catch(e => console.error("Error triggering admin notification in fallback:", e));
          }

          // Process coupon usage if exists
          if (orderData.coupon_id) {
            try {
              // Log coupon use
              const { error: couponUseErr } = await supabaseAdmin
                .from('coupon_uses')
                .insert([{
                  coupon_id: orderData.coupon_id,
                  order_id: orderData.id,
                  user_phone: orderData.customer_mobile,
                  discount_applied: orderData.discount_amount || 0
                }]);

              if (couponUseErr) {
                console.error("Failed to insert coupon use record in fallback:", couponUseErr);
              }

              // Increment coupon uses count
              const { data: coupon } = await supabaseAdmin
                .from('coupons')
                .select('uses_count')
                .eq('id', orderData.coupon_id)
                .single();

              if (coupon) {
                await supabaseAdmin
                  .from('coupons')
                  .update({ uses_count: (coupon.uses_count || 0) + 1 })
                  .eq('id', orderData.coupon_id);
              }
            } catch (couponErr) {
              console.error("Error processing coupon state in fallback:", couponErr);
            }
          }
        }
      } else if (paymentLink && (paymentLink.status === "expired" || paymentLink.status === "cancelled")) {
        const { data: updatedOrder, error: updateErr } = await supabaseAdmin
          .from("orders")
          .update({
            status: "payment_failed",
            payment_status: "failed"
          })
          .eq("id", orderData.id)
          .select("*, delivery_slots(label)")
          .single();

        if (!updateErr && updatedOrder) {
          orderData = updatedOrder;
        }
      }
    } catch (err) {
      console.error("Error verifying payment link status with Razorpay in action:", err);
    }
  }

  return { success: true, order: orderData };
}
