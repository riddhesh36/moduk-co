"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface NotificationBarSettings {
  text: string;
  bg_color: string;
  is_active: boolean;
}

const DEFAULT_SETTINGS: NotificationBarSettings = {
  text: "",
  bg_color: "#C4617A",
  is_active: false,
};

/**
 * Encode text to preserve emojis and special Unicode characters
 * that may be stripped by some database configurations.
 */
function encodeText(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Decode text back from URI-encoded form.
 * Handles both encoded and plain text gracefully.
 */
function decodeText(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    // If it's not encoded (legacy data), return as-is
    return text;
  }
}

export async function getNotificationBarSettings(): Promise<{ data: NotificationBarSettings; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "notification_bar")
      .single();

    if (error || !data) {
      return { data: DEFAULT_SETTINGS, error: error?.message };
    }

    return {
      data: {
        text: decodeText(data.value?.text || ""),
        bg_color: data.value?.bg_color || "#C4617A",
        is_active: data.value?.is_active ?? false,
      },
    };
  } catch (err) {
    console.error("Failed to fetch notification bar settings:", err);
    return { data: DEFAULT_SETTINGS, error: "Failed to fetch settings" };
  }
}

export async function updateNotificationBarSettings(
  text: string,
  bgColor: string,
  isActive: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    const value = {
      text: encodeText(text.trim()),
      bg_color: bgColor,
      is_active: isActive,
    };

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        {
          key: "notification_bar",
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/notification");
    return { success: true };
  } catch (err) {
    console.error("Failed to update notification bar settings:", err);
    return { error: "Failed to save settings" };
  }
}
