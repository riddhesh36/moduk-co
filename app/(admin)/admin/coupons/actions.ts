"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
}

export async function createCoupon(data: {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  valid_until: string | null;
  is_first_time_only?: boolean;
}) {
  const supabase = getSupabase();

  const couponData = {
    code: data.code.toUpperCase().trim(),
    type: data.type,
    value: data.value,
    min_order_amount: data.min_order_amount || 0,
    max_uses: data.max_uses || null,
    valid_until: data.valid_until || null,
    is_first_time_only: data.is_first_time_only || false,
    is_active: true,
    uses_count: 0,
  };

  const { data: result, error } = await supabase
    .from('coupons')
    .insert([couponData])
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true, data: result };
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', couponId)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Operation blocked. Check RLS policies." };

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCoupon(couponId: string) {
  const supabase = getSupabase();

  // Delete associated coupon_uses first
  await supabase.from('coupon_uses').delete().eq('coupon_id', couponId);

  const { data, error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Operation blocked. Check RLS policies." };

  revalidatePath('/admin/coupons');
  return { success: true };
}
