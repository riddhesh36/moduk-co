import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Decode text back from URI-encoded form.
 * Handles both encoded and plain text gracefully.
 */
function decodeText(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("key", "notification_bar")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { text: "", bg_color: "#C4617A", is_active: false },
        {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
        }
      );
    }

    // Decode text to restore emojis/special characters
    const textRaw = data.value?.text || "";
    const textDecoded = decodeText(textRaw);
    const value = {
      ...data.value,
      text: textDecoded,
    };

    return NextResponse.json(value, {
      status: 200,
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    });
  } catch {
    return NextResponse.json(
      { text: "", bg_color: "#C4617A", is_active: false },
      { status: 200 }
    );
  }
}
