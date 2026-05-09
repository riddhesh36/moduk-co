"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getOrder(displayId: string) {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key";
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });

  const { data, error } = await supabase
    .from("orders")
    .select("*, delivery_slots(label)")
    .eq("display_id", displayId)
    .single();

  if (error || !data) {
    return { error: "Order not found" };
  }

  return { success: true, order: data };
}
