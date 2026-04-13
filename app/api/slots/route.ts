import { NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase";
import { MOCK_SLOTS } from "@/lib/constants";

export async function GET() {
  try {
    // Simulated DB query for Phase 1 where keys might not be present
    // const { data: slots, error } = await supabase.from('slots').select('*').order('cutoff_time');
    // if (error) throw error;
    
    // For now we will return mock slots to simulate the database
    return NextResponse.json(MOCK_SLOTS);
  } catch (err: unknown) {
    const errorBody = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorBody }, { status: 500 });
  }
}
