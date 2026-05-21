"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or declined
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show the banner with a slight delay for smooth entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-[#FDF0F3] flex flex-col gap-4 relative overflow-hidden">
        {/* Subtle decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4617A]" />

        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FDF0F3] text-[#C4617A] rounded-xl shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#2C1A1D] font-playfair mb-1">Cookie & Storage Settings</h4>
            <p className="text-xs text-[#777777] leading-relaxed">
              We use cookies and local storage to keep items in your cart, remember your delivery details, and provide a seamless checkout experience.
            </p>
          </div>
          <button 
            onClick={handleDecline} 
            className="text-[#777777] hover:text-[#2C1A1D] p-1 rounded-lg transition-colors shrink-0"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-3 mt-1">
          <button
            onClick={handleDecline}
            className="flex-1 py-2 px-3 border border-[#FDF0F3] text-[#777777] hover:bg-[#FDF8F0]/50 rounded-xl text-xs font-semibold transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 bg-[#C4617A] text-white hover:bg-[#C4617A]/95 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#C4617A]/10"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
