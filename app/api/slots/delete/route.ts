import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key";
    
    // Server-side auth check
    const authClient = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    });

    const { data: { user } } = await authClient.auth.getUser();

    // Dev fail-safe if keys aren't set
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // Delete single slot
    const { data, error } = await authClient
      .from('delivery_slots')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const errorBody = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorBody }, { status: 500 });
  }
}
