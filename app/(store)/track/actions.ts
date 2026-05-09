"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Simple helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(mobile: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Store in DB
  const { error: dbError } = await supabase
    .from("login_otps")
    .insert([{ mobile, otp, expires_at: expiresAt }]);

  if (dbError) {
    console.error("OTP DB Store Error:", dbError);
    return { success: false, error: "Failed to generate OTP. Please try again." };
  }

  // Real SMS via Fast2SMS
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.log(`[DEV MODE] API Key missing. OTP for ${mobile} is ${otp}`);
      return { success: true }; 
    }

    const message = `Your Moduk & Co. login code is: ${otp}. Pure joy is just a step away!`;
    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=q&message=${encodeURIComponent(message)}&numbers=${mobile}`, {
      method: 'GET',
    });

    const result = await response.json();
    
    if (!result.return) {
      console.error("Fast2SMS API Error:", result);
      return { success: false, error: result.message || "Failed to deliver SMS." };
    }

    return { success: true };
  } catch (err) {
    console.error("SMS Delivery Exception:", err);
    return { success: false, error: "SMS service temporarily unavailable." };
  }
}

export async function verifyOTP(mobile: string, otp: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase
    .from("login_otps")
    .select("*")
    .eq("mobile", mobile)
    .eq("otp", otp)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid or expired OTP." };
  }

  // Success! Set a cookie to remember the user
  cookieStore.set("customer_mobile", mobile, { 
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  // Clean up used OTPs for this mobile
  await supabase.from("login_otps").delete().eq("mobile", mobile);

  return { success: true };
}

export async function logoutCustomer() {
  const cookieStore = cookies();
  cookieStore.delete("customer_mobile");
  return { success: true };
}

export async function getCustomerOrders() {
  const cookieStore = cookies();
  const mobile = cookieStore.get("customer_mobile")?.value;

  if (!mobile) return { success: false, error: "Not logged in" };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase
    .from("orders")
    .select("*, delivery_slots(label)")
    .eq("customer_mobile", mobile)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  return { success: true, orders: data };
}
