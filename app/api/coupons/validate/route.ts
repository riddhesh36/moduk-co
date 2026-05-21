import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cart_total, customer_phone } = body;

    if (!code || typeof cart_total !== "number") {
      return NextResponse.json(
        { valid: false, message: "Missing coupon code or cart total" },
        { status: 400 }
      );
    }

    // Fetch coupon by code (RLS allows reading active coupons)
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid or expired coupon",
      });
    }

    // Check first-time user constraint
    if (coupon.is_first_time_only) {
      if (!customer_phone || !customer_phone.trim()) {
        return NextResponse.json({
          valid: false,
          message: "Please enter your mobile number to apply this coupon.",
          phone_required: true,
        });
      }

      const cleaned = customer_phone.trim().replace(/\D/g, "");
      const last10 = cleaned.length > 10 ? cleaned.slice(-10) : cleaned;

      if (last10.length < 10) {
        return NextResponse.json({
          valid: false,
          message: "Please enter a valid 10-digit mobile number.",
        });
      }

      // Check if there are any orders with this phone number that are active
      const { data: existingOrders, error: orderCheckErr } = await supabase
        .from("orders")
        .select("id")
        .or(`customer_mobile.eq.${last10},customer_mobile.eq.+91${last10},customer_mobile.eq.91${last10}`)
        .not("status", "in", '("cancelled","payment_failed")')
        .limit(1);

      if (orderCheckErr) {
        console.error("Order check error for first-time coupon:", orderCheckErr);
      }

      if (existingOrders && existingOrders.length > 0) {
        return NextResponse.json({
          valid: false,
          message: "This coupon is only valid for your first order.",
        });
      }
    }

    const now = new Date();

    // Check valid_from
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is not yet active",
      });
    }

    // Check valid_until (if set)
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    // Check max_uses (if set)
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check min_order_amount
    if (cart_total < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of ₹${coupon.min_order_amount} required for this coupon`,
      });
    }

    // Calculate discount
    let discount_amount: number;
    if (coupon.type === "percentage") {
      discount_amount = Math.round((coupon.value / 100) * cart_total);
    } else {
      // flat discount, cap at cart_total
      discount_amount = Math.min(coupon.value, cart_total);
    }

    const final_total = Math.max(0, cart_total - discount_amount);

    return NextResponse.json({
      valid: true,
      discount_amount,
      final_total,
      coupon_id: coupon.id,
      coupon_code: coupon.code,
      message:
        coupon.type === "percentage"
          ? `${coupon.value}% off applied!`
          : `₹${coupon.value} off applied!`,
    });
  } catch (err) {
    console.error("Coupon Validation Error:", err);
    return NextResponse.json(
      { valid: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
