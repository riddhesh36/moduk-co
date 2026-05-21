"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CouponFormModal from "@/components/admin/CouponFormModal";

export default function CouponFormButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#C4617A] text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#C4617A]/90 flex items-center gap-2 transition-colors"
      >
        <Plus size={18} />
        New Coupon
      </button>
      <CouponFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
