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

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = getSupabase();

  const updates: Record<string, string> = { status: newStatus };
  
  // If moving from needs_verification -> pending, mark payment as successful
  if (newStatus === "pending") {
    updates.payment_status = "successful";
  }

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the admin dashboard so changes reflect immediately
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateSlotAction(slotId: string, updates: Record<string, unknown>) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('delivery_slots')
    .update(updates)
    .eq('id', slotId)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Operation blocked or slot not found. You may not have adequate permissions (RLS blocked it)." };
  
  revalidatePath('/admin/slots');
  return { success: true };
}

export async function deleteSlotAction(slotId: string) {
  const supabase = getSupabase();

  await supabase.from('orders').update({ slot_id: null }).eq('slot_id', slotId);

  const { data, error } = await supabase
    .from('delivery_slots')
    .delete()
    .eq('id', slotId)
    .select();

  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: "Operation blocked. RLS policy prevents this action." };
  
  revalidatePath('/admin/slots');
  return { success: true };
}

export async function createSlotAction(slotData: { id: string, label: string, cutoff_time: string, max_capacity: number, slot_date: string }) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('delivery_slots')
    .insert([{ ...slotData, is_active: true }])
    .select();

  if (error) return { error: error.message };
  revalidatePath('/admin/slots');
  return { success: true, data };
}

export async function fetchAdminSlotsAction() {
  const supabase = getSupabase();
  
  const { data: slots, error: slotsError } = await supabase
    .from('delivery_slots')
    .select('*')
    .order('cutoff_time');

  if (slotsError) return { error: slotsError.message, data: [] };

  const { data: orders } = await supabase
    .from('orders')
    .select('slot_id, slot_date')
    .neq('status', 'cancelled');

  const counts: Record<string, number> = {};
  orders?.forEach(order => {
    const key = `${order.slot_id}_${order.slot_date}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  const enrichedSlots = slots?.map(slot => ({
    ...slot,
    confirmed_orders: counts[`${slot.id}_${slot.slot_date}`] || 0
  })) || [];

  return { success: true, data: enrichedSlots };
}
