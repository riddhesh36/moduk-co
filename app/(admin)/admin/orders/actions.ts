"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
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

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updatePaymentStatus(orderId: string, payment_status: string) {
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

  const { error } = await supabase
    .from("orders")
    .update({ payment_status })
    .eq("id", orderId);

  if (error) {
    console.error("Update Payment Status Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  return { success: true };
}
