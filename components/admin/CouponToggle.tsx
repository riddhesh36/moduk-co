"use client";

import { useTransition } from "react";
import { toggleCouponActive } from "@/app/(admin)/admin/coupons/actions";

interface CouponToggleProps {
  couponId: string;
  isActive: boolean;
}

export default function CouponToggle({ couponId, isActive }: CouponToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCouponActive(couponId, !isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        isActive ? "bg-green-500" : "bg-gray-300"
      }`}
      title={isActive ? "Deactivate coupon" : "Activate coupon"}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
