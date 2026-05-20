"use client";

import { useState, useEffect } from "react";
import { Megaphone, Truck, Clock, MessageSquare } from "lucide-react";

export function DeliveryAdvisoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeen = localStorage.getItem("moduk_delivery_notice_seen");
    if (!hasSeen) {
      setIsOpen(true);
      // Lock scroll
      document.body.style.overflow = "hidden";
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("moduk_delivery_notice_seen", "true");
    setIsOpen(false);
    // Restore scroll
    document.body.style.overflow = "unset";
  };

  // Prevent SSR rendering hydration mismatch by returning null until mounted
  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-[#2C1A1D]/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl md:rounded-3xl shadow-[0_20px_50px_rgba(44,26,29,0.15)] border border-[#FDF0F3] overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">

        {/* Decorative Top Accent Bar */}
        <div className="h-2 bg-[#C4617A] w-full" />

        {/* Content Section */}
        <div className="p-6 sm:p-8 md:p-10 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-[#2C1A1D]">
              Delivery Information
            </h2>
            <p className="text-sm font-dmsans text-[#777777]">
              Please review our delivery guidelines before placing your order
            </p>
          </div>

          {/* Rule Cards Grid */}
          <div className="space-y-4 pt-2">

            {/* Rule 1 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-[#FDF8F0] border border-[#FDF0F3] hover:bg-[#FDF8F0]/80 transition-colors">
              <div className="flex-shrink-0 p-2.5 rounded-lg bg-[#FDF0F3] text-[#C4617A]">
                <Megaphone size={20} className="stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-dmsans font-semibold text-sm text-[#2C1A1D]">
                  Porter Delivery
                </h4>
                <p className="font-dmsans text-xs sm:text-sm text-[#555555] leading-relaxed">
                  We deliver via Porter. The delivery fee will apply upon delivery.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-[#FDF8F0] border border-[#FDF0F3] hover:bg-[#FDF8F0]/80 transition-colors">
              <div className="flex-shrink-0 p-2.5 rounded-lg bg-[#FDF0F3] text-[#C4617A]">
                <Truck size={20} className="stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-dmsans font-semibold text-sm text-[#2C1A1D]">
                  Third-Party Handover
                </h4>
                <p className="font-dmsans text-xs sm:text-sm text-[#555555] leading-relaxed">
                  We do not take responsibility or guarantee delivery once the order has been handed over to the third-party service.
                </p>
              </div>
            </div>

            {/* Rule 33 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-[#FDF8F0] border border-[#FDF0F3] hover:bg-[#FDF8F0]/80 transition-colors">
              <div className="flex-shrink-0 p-2.5 rounded-lg bg-[#FDF0F3] text-[#C4617A]">
                <Clock size={20} className="stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-dmsans font-semibold text-sm text-[#2C1A1D]">
                  Driver Waiting Time
                </h4>
                <p className="font-dmsans text-xs sm:text-sm text-[#555555] leading-relaxed">
                  If the driver cannot reach you, they will wait for 15 minutes before the order is returned.
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-[#FDF8F0] border border-[#FDF0F3] hover:bg-[#FDF8F0]/80 transition-colors">
              <div className="flex-shrink-0 p-2.5 rounded-lg bg-[#FDF0F3] text-[#C4617A]">
                <MessageSquare size={20} className="stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-dmsans font-semibold text-sm text-[#2C1A1D]">
                  Tracking & Communication
                </h4>
                <p className="font-dmsans text-xs sm:text-sm text-[#555555] leading-relaxed">
                  You will receive an SMS or WhatsApp message with a tracking link. Please verify your contact number is correct.
                </p>
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleClose}
              className="w-full bg-[#C4617A] text-white hover:bg-[#C4617A]/95 py-3.5 px-6 rounded-xl font-dmsans font-bold tracking-wide transition-all shadow-[0_4px_12px_rgba(196,97,122,0.2)] active:scale-[0.98]"
            >
              I Understand & Continue
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
