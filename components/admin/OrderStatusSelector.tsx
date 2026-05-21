"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusSelector({ orderId, currentStatus }: OrderStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const statuses = [
    { value: 'payment_pending', label: 'PAYMENT PENDING', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'cod_pending', label: 'COD PENDING', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'confirmed', label: 'CONFIRMED', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'dispatched', label: 'DISPATCHED', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'delivered', label: 'DELIVERED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'cancelled', label: 'CANCELLED', color: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'payment_failed', label: 'PAYMENT FAILED', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { value: 'needs_verification', label: 'NEEDS REVIEW', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { value: 'pending', label: 'PENDING', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  const current = statuses.find(s => s.value === currentStatus) || { value: currentStatus, label: currentStatus.toUpperCase(), color: 'bg-gray-50 text-gray-700 border-gray-200' };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-full text-[10px] font-bold border cursor-pointer uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[#C4617A]/20 ${current.color} ${isPending ? "opacity-50 pointer-events-none" : ""}`}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value} className="bg-white text-gray-800">
            {s.label}
          </option>
        ))}
      </select>
      {/* Down arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#777777]">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}
