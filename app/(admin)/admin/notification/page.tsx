"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, Save, Eye, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  getNotificationBarSettings,
  updateNotificationBarSettings,
} from "./actions";

const PRESET_COLORS = [
  { name: "Rose", value: "#C4617A" },
  { name: "Dark", value: "#2C1A1D" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#D97706" },
  { name: "Ocean Blue", value: "#2563EB" },
  { name: "Royal Purple", value: "#7C3AED" },
  { name: "Crimson", value: "#DC2626" },
  { name: "Teal", value: "#0D9488" },
];

export default function NotificationSettingsPage() {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#C4617A");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Load current settings
  useEffect(() => {
    async function load() {
      const result = await getNotificationBarSettings();
      if (result.data) {
        setText(result.data.text);
        setBgColor(result.data.bg_color);
        setIsActive(result.data.is_active);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Auto-clear save status
  useEffect(() => {
    if (saveStatus !== "idle") {
      const timer = setTimeout(() => setSaveStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotificationBarSettings(text, bgColor, isActive);
      if (result.success) {
        setSaveStatus("success");
        setErrorMsg("");
      } else {
        setSaveStatus("error");
        setErrorMsg(result.error || "Something went wrong");
      }
    });
  }

  // Determine if text is light or dark for contrast
  function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4617A]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">
            Notification Bar
          </h1>
          <p className="text-[#777777] mt-1">
            Control the announcement bar shown at the top of your website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#C4617A] text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-[#C4617A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all self-start sm:self-auto"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Save Status Toast */}
      {saveStatus === "success" && (
        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Notification bar updated successfully! Changes are live.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Active Toggle */}
          <div className="bg-white border border-[#FDF0F3] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C1A1D]">Bar Visibility</h3>
                  <p className="text-xs text-[#777777]">
                    {isActive ? "Visible on the storefront" : "Hidden from visitors"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    isActive ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Message Text */}
          <div className="bg-white border border-[#FDF0F3] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#2C1A1D] mb-2">
              Notification Message
            </label>
            <p className="text-xs text-[#777777] mb-3">
              Use emojis to make it eye-catching! Supports any text.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 🎉 Free delivery on orders above ₹500!"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 border border-[#FDF0F3] rounded-xl text-sm text-[#2C1A1D] placeholder:text-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#C4617A]/30 focus:border-[#C4617A] transition-all resize-none"
            />
            <div className="text-right text-[10px] text-[#999] mt-1">
              {text.length}/200 characters
            </div>
          </div>

          {/* Background Color */}
          <div className="bg-white border border-[#FDF0F3] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#2C1A1D] mb-2">
              Background Color
            </label>
            <p className="text-xs text-[#777777] mb-4">
              Pick a preset or choose a custom color.
            </p>

            {/* Preset Swatches */}
            <div className="flex flex-wrap gap-3 mb-4">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBgColor(color.value)}
                  title={color.name}
                  className={`group relative w-10 h-10 rounded-xl shadow-sm transition-all hover:scale-110 ${
                    bgColor === color.value
                      ? "ring-2 ring-offset-2 ring-[#2C1A1D] scale-110"
                      : "hover:shadow-md"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {bgColor === color.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle
                        className="w-4 h-4"
                        style={{ color: getContrastColor(color.value) }}
                      />
                    </span>
                  )}
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#777] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#FDF0F3]">
              <div className="relative">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-2 border-[#FDF0F3] bg-transparent"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                      setBgColor(val);
                    }
                  }}
                  className="w-full px-3 py-2 border border-[#FDF0F3] rounded-lg text-sm font-mono text-[#2C1A1D] focus:outline-none focus:ring-2 focus:ring-[#C4617A]/30 uppercase"
                  placeholder="#C4617A"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div>
          <div className="bg-white border border-[#FDF0F3] rounded-2xl p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-[#C4617A]" />
              <h3 className="text-sm font-semibold text-[#2C1A1D]">Live Preview</h3>
            </div>

            <p className="text-xs text-[#777777] mb-4">
              This is how the bar will appear on your website.
            </p>

            {/* Preview Frame */}
            <div className="border border-[#eee] rounded-xl overflow-hidden shadow-inner bg-[#f9f9f9]">
              {/* Simulated notification bar */}
              {isActive && text.trim() ? (
                <div
                  className="w-full text-center py-2.5 px-4 text-xs tracking-wide uppercase font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: bgColor,
                    color: getContrastColor(bgColor),
                  }}
                >
                  {text}
                </div>
              ) : (
                <div className="w-full text-center py-2.5 px-4 text-xs text-[#aaa] bg-[#f0f0f0] italic">
                  {!isActive
                    ? "Bar is currently hidden"
                    : "Type a message to see the preview"}
                </div>
              )}

              {/* Simulated navbar */}
              <div className="bg-[#2C1A1D] text-white px-4 py-3 flex items-center justify-between">
                <span className="font-playfair text-sm font-bold tracking-wide">
                  MODUK & CO
                </span>
                <div className="flex gap-4 text-[10px] text-white/60">
                  <span>Shop</span>
                  <span>My Orders</span>
                  <span>FAQs</span>
                </div>
              </div>

              {/* Simulated hero placeholder */}
              <div className="h-28 bg-gradient-to-br from-[#FDF8F0] to-[#FDF0F3] flex items-center justify-center">
                <span className="text-[#ccc] text-xs italic">Hero Section</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive && text.trim() ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span className="text-[11px] text-[#777]">
                {isActive && text.trim()
                  ? "Bar is active and will be visible to visitors"
                  : isActive
                  ? "Add a message to activate the bar"
                  : "Bar is hidden from visitors"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
