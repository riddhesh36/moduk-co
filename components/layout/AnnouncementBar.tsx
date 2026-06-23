"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NotificationSettings {
  text: string;
  bg_color: string;
  is_active: boolean;
}

export function AnnouncementBar() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("announcement_dismissed") === "true") {
      setDismissed(true);
      return;
    }

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/notification", {
          next: { revalidate: 30 },
        });
        if (res.ok) {
          const data: NotificationSettings = await res.json();
          if (data.is_active && data.text?.trim()) {
            setSettings(data);
            // Small delay for smooth entrance animation
            requestAnimationFrame(() => {
              setTimeout(() => setVisible(true), 50);
            });
          }
        }
      } catch {
        // Silently fail — no notification bar is fine
      }
    }

    fetchSettings();
  }, []);

  function handleDismiss() {
    setVisible(false);
    // Wait for exit animation before removing from DOM
    setTimeout(() => {
      setDismissed(true);
      sessionStorage.setItem("announcement_dismissed", "true");
    }, 300);
  }

  // Determine text color for contrast
  function getContrastColor(hex: string): string {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
    } catch {
      return "#ffffff";
    }
  }

  if (dismissed || !settings) return null;

  const textColor = getContrastColor(settings.bg_color);

  return (
    <div
      className="w-full text-center py-2 px-8 text-xs tracking-wide uppercase font-semibold relative transition-all duration-300 ease-out"
      style={{
        backgroundColor: settings.bg_color,
        color: textColor,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        maxHeight: visible ? "60px" : "0px",
        overflow: "hidden",
      }}
    >
      <span>{settings.text}</span>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-black/10"
        style={{ color: textColor }}
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
