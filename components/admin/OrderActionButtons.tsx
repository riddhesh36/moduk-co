"use client";

import { useTransition } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";

export default function OrderActionButtons({ orderId, status }: { orderId: string, status: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  if (status === "needs_verification") {
    return (
      <button 
        onClick={() => handleUpdate("pending")}
        disabled={isPending}
        className="flex items-center gap-2 bg-[#C4617A] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-[#C4617A]/90 whitespace-nowrap disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Verify Payment"}
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button 
        onClick={() => handleUpdate("dispatched")}
        disabled={isPending}
        className="flex items-center gap-2 bg-[#2C1A1D] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-black whitespace-nowrap disabled:opacity-50"
      >
        <Clock size={14} /> {isPending ? "Dispatching..." : "Mark Dispatched"}
      </button>
    );
  }

  if (status === "dispatched") {
    return (
      <button 
        onClick={() => handleUpdate("delivered")}
        disabled={isPending}
        className="flex items-center gap-2 bg-blue-600 text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Mark Delivered"}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-green-600 font-semibold text-xs py-1.5 px-3 whitespace-nowrap">
      <CheckCircle size={14} /> Delivered
    </span>
  );
}
