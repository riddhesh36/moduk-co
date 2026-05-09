import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export async function GET() {
  try {
    // Fetch active slots
    const { data: slots, error: slotsError } = await supabase
      .from('delivery_slots')
      .select('*')
      .order('cutoff_time');
      
    if (slotsError) {
      throw slotsError;
    }

    // Fetch today's orders to calculate confirmed capacity
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('slot_id, slot_date')
      .neq('status', 'cancelled');

    if (ordersError) throw ordersError;

    // Calculate counts
    const counts: Record<string, number> = {};
    orders?.forEach(order => {
      const key = `${order.slot_id}_${order.slot_date}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const enrichedSlots = slots.map(slot => ({
      ...slot,
      confirmed_orders: counts[`${slot.id}_${slot.slot_date}`] || 0
    }));

    return NextResponse.json(enrichedSlots);
  } catch (err: unknown) {
    const errorBody = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorBody }, { status: 500 });
  }
}
