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
        setAll() { },
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

  // Real SMS via Fast2SMS using pre-approved OTP template route
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.log(`[DEV MODE] API Key missing. OTP for ${mobile} is ${otp}`);
      return { success: true };
    }

    const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&variables_values=${otp}&route=otp&numbers=${mobile}`, {
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
        setAll() { },
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

export async function sendEmailOTP(email: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { },
      },
    }
  );

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Store in DB, using 'mobile' column for storing the email identifier
  const { error: dbError } = await supabase
    .from("login_otps")
    .insert([{ mobile: email, otp, expires_at: expiresAt }]);

  if (dbError) {
    console.error("OTP DB Store Error:", dbError);
    return { success: false, error: "Failed to generate OTP. Please try again." };
  }

  // Send Email via Resend
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[DEV MODE] Resend API Key missing. OTP for ${email} is ${otp}`);
      return { success: true };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Moduk & Co <otp@modukandco.in>', // Make sure to verify modukandco.in on Resend Dashboard
        to: email,
        subject: 'Your Moduk & Co Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #c4617a; text-align: center; font-family: 'Playfair Display', Georgia, serif; margin-bottom: 20px;">Moduk & Co.</h2>
            <p style="font-size: 16px; color: #2c1a1d; line-height: 1.5;">Hello,</p>
            <p style="font-size: 16px; color: #2c1a1d; line-height: 1.5;">Use the following verification code to track your orders:</p>
            <div style="background-color: #fdf8f0; padding: 15px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #c4617a; margin: 25px auto; width: fit-content; border: 1px solid #fdf0f3;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #777777; line-height: 1.5; text-align: center; margin-top: 25px;">This verification code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #fdf0f3; margin: 25px 0;" />
            <p style="font-size: 12px; color: #999999; text-align: center;">© ${new Date().getFullYear()} Moduk & Co. All rights reserved.</p>
          </div>
        `,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Resend API Error:", result);
      return { success: false, error: result.message || "Failed to deliver email." };
    }

    return { success: true };
  } catch (err) {
    console.error("Email Delivery Exception:", err);
    return { success: false, error: "Email service temporarily unavailable." };
  }
}

export async function verifyEmailOTP(email: string, otp: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { },
      },
    }
  );

  const { data, error } = await supabase
    .from("login_otps")
    .select("*")
    .eq("mobile", email)
    .eq("otp", otp)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid or expired OTP." };
  }

  // Success! Set a cookie to remember the user
  cookieStore.set("customer_email", email, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  // Clean up used OTPs for this email
  await supabase.from("login_otps").delete().eq("mobile", email);

  return { success: true };
}

export async function logoutCustomer() {
  const cookieStore = cookies();
  cookieStore.delete("customer_mobile");
  cookieStore.delete("customer_email");
  return { success: true };
}

export async function getCustomerOrders() {
  const cookieStore = cookies();
  const mobile = cookieStore.get("customer_mobile")?.value;
  const email = cookieStore.get("customer_email")?.value;

  if (!mobile && !email) return { success: false, error: "Not logged in" };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { },
      },
    }
  );

  let query = supabase.from("orders").select("*, delivery_slots(label)");

  if (email) {
    query = query.eq("customer_email", email);
  } else if (mobile) {
    query = query.eq("customer_mobile", mobile);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  return { success: true, orders: data };
}

