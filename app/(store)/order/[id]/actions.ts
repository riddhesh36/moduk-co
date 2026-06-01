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

  // Load related orders sharing the same payment link ID
  let relatedOrders = [order];
  if (order.payment_link_id) {
    const { data: fetchRelated } = await supabaseAdmin
      .from("orders")
      .select("*, delivery_slots(label)")
      .eq("payment_link_id", order.payment_link_id)
      .order("created_at", { ascending: true });
    if (fetchRelated && fetchRelated.length > 0) {
      relatedOrders = fetchRelated;
    }
  }

  // Fallback: If status is still payment_pending, check status with Razorpay
  if (order.status === "payment_pending" && order.payment_link_id) {
    try {
      const paymentLink = (await razorpay.paymentLink.fetch(order.payment_link_id)) as unknown as {
        status: string;
        payments?: Array<{ id: string }>;
      };
      
      if (paymentLink && paymentLink.status === "paid") {
        const payment_id = paymentLink.payments?.[0]?.id || null;
        const updatedOrders = [];
        
        for (const rOrder of relatedOrders) {
          const { data: updated, error: updateErr } = await supabaseAdmin
            .from("orders")
            .update({
              status: "confirmed",
              payment_status: "paid",
              payment_id
            })
            .eq("id", rOrder.id)
            .select("*, delivery_slots(label)")
            .single();

          if (!updateErr && updated) {
            updatedOrders.push(updated);

            // Trigger WhatsApp notifications (fallback)
            const host = headers().get('host') || 'localhost:3000';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

            if (updated.wa_opt_in && updated.customer_mobile) {
              fetch(`${siteUrl}/api/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderDetails: { id: updated.display_id, totalAmount: updated.total_amount },
                  waNumber: updated.customer_mobile,
                  customerName: updated.customer_name
                })
              }).catch(e => console.error("Error triggering customer notification in fallback:", e));
            }

            if (process.env.ADMIN_PHONE) {
              fetch(`${siteUrl}/api/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderDetails: { id: updated.display_id, totalAmount: updated.total_amount },
                  waNumber: process.env.ADMIN_PHONE,
                  customerName: "Admin"
                })
              }).catch(e => console.error("Error triggering admin notification in fallback:", e));
            }

            // Process coupon usage if exists
            if (updated.coupon_id) {
              try {
                const { error: couponUseErr } = await supabaseAdmin
                  .from('coupon_uses')
                  .insert([{
                    coupon_id: updated.coupon_id,
                    order_id: updated.id,
                    user_phone: updated.customer_mobile,
                    discount_applied: updated.discount_amount || 0
                  }]);

                if (couponUseErr) {
                  console.error("Failed to insert coupon use record in fallback:", couponUseErr);
                }

                const { data: coupon } = await supabaseAdmin
                  .from('coupons')
                  .select('uses_count')
                  .eq('id', updated.coupon_id)
                  .single();

                if (coupon) {
                  await supabaseAdmin
                    .from('coupons')
                    .update({ uses_count: (coupon.uses_count || 0) + 1 })
                    .eq('id', updated.coupon_id);
                }
              } catch (couponErr) {
                console.error("Error processing coupon state in fallback:", couponErr);
              }
            }
          } else {
            updatedOrders.push(rOrder);
          }
        }
        relatedOrders = updatedOrders;
      } else if (paymentLink && (paymentLink.status === "expired" || paymentLink.status === "cancelled")) {
        const updatedOrders = [];
        for (const rOrder of relatedOrders) {
          const { data: updated, error: updateErr } = await supabaseAdmin
            .from("orders")
            .update({
              status: "payment_failed",
              payment_status: "failed"
            })
            .eq("id", rOrder.id)
            .select("*, delivery_slots(label)")
            .single();

          if (!updateErr && updated) {
            updatedOrders.push(updated);
          } else {
            updatedOrders.push(rOrder);
          }
        }
        relatedOrders = updatedOrders;
      }
    } catch (err) {
      console.error("Error verifying payment link status with Razorpay in action:", err);
    }
  }

  const primaryOrder = relatedOrders.find(o => o.display_id === displayId) || order;

  return { success: true, order: primaryOrder, orders: relatedOrders };
}
