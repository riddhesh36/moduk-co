"use client";

import { MessageCircle } from "lucide-react";
import React from "react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  className?: string;
  variant?: "floating" | "link";
}

export function WhatsAppButton({
  phoneNumber = "918591781695", // Default number, should be replaced with real one
  message = "Hi Moduk & Co! I'd like to ask about...",
  className = "",
  variant = "floating"
}: WhatsAppButtonProps) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  if (variant === "link") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:text-rose transition-colors ${className}`}
      >
        WhatsApp Us
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-2 ${className}`}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle size={24} fill="white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-semibold whitespace-nowrap">
        Chat with us
      </span>
    </a>
  );
}
