"use client";

import { useTransition, useState } from "react";
import { CheckCircle, Clock, Trash2, Edit3, X } from "lucide-react";
import { updateOrderStatus, deleteOrder } from "@/app/(admin)/admin/actions";

export default function OrderActionButtons({ orderId, status }: { orderId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleUpdate = (newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
      setShowStatusMenu(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteOrder(orderId);
      setShowDeleteConfirm(false);
    });
  };

  const statusOptions = [
    { value: "payment_pending", label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
    { value: "cod_pending", label: "COD Pending", color: "bg-orange-100 text-orange-800" },
    { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
    { value: "dispatched", label: "Dispatched", color: "bg-blue-100 text-blue-800" },
    { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    { value: "payment_failed", label: "Payment Failed", color: "bg-rose-100 text-rose-800" },
    { value: "needs_verification", label: "Needs Verification", color: "bg-yellow-100 text-yellow-800" },
    { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  ];

  // Primary action button based on current status
  const renderPrimaryAction = () => {
    if (status === "payment_pending") {
      return (
        <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 font-semibold text-[11px] py-1 px-2.5 rounded-full whitespace-nowrap">
          <Clock size={12} className="animate-pulse" /> Awaiting Payment
        </span>
      );
    }

    if (status === "cod_pending") {
      return (
        <button 
          onClick={() => handleUpdate("confirmed")}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#C4617A] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-[#C4617A]/90 whitespace-nowrap disabled:opacity-50"
        >
          {isPending ? "Confirming..." : "Confirm COD Order"}
        </button>
      );
    }

    if (status === "confirmed" || status === "pending") {
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

    if (status === "delivered") {
      return (
        <span className="flex items-center gap-2 text-green-600 font-semibold text-xs py-1.5 px-3 whitespace-nowrap">
          <CheckCircle size={14} /> Delivered
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className="flex items-center gap-2 text-red-500 font-semibold text-xs py-1.5 px-3 whitespace-nowrap">
          <X size={14} /> Cancelled
        </span>
      );
    }

    if (status === "payment_failed") {
      return (
        <span className="flex items-center gap-2 text-red-600 font-semibold text-xs py-1.5 px-3 whitespace-nowrap">
          <X size={14} /> Payment Failed
        </span>
      );
    }

    if (status === "needs_verification") {
      return (
        <button 
          onClick={() => handleUpdate("confirmed")}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#C4617A] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-[#C4617A]/90 whitespace-nowrap disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Verify Payment"}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center gap-1.5 relative">
      {/* Primary status action */}
      {renderPrimaryAction()}

      {/* Edit status dropdown */}
      <div className="relative">
        <button
          onClick={() => { setShowStatusMenu(!showStatusMenu); setShowDeleteConfirm(false); }}
          className="p-1.5 text-[#777777] hover:text-[#2C1A1D] hover:bg-[#FDF8F0] rounded transition-colors"
          title="Change status"
        >
          <Edit3 size={14} />
        </button>

        {showStatusMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-[#FDF0F3] rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#777777] uppercase tracking-wider">Set Status</div>
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdate(opt.value)}
                  disabled={isPending || opt.value === status}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#FDF8F0] transition-colors disabled:opacity-40 flex items-center gap-2 ${opt.value === status ? 'bg-[#FDF8F0]' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color.split(' ')[0]}`} />
                  {opt.label}
                  {opt.value === status && <span className="ml-auto text-[10px] text-[#777777]">current</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete button */}
      <div className="relative">
        <button
          onClick={() => { setShowDeleteConfirm(!showDeleteConfirm); setShowStatusMenu(false); }}
          className="p-1.5 text-[#777777] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete order"
        >
          <Trash2 size={14} />
        </button>

        {showDeleteConfirm && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDeleteConfirm(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-red-200 rounded-lg shadow-lg z-50 p-3 min-w-[200px]">
              <p className="text-xs font-semibold text-[#2C1A1D] mb-2">Delete this order?</p>
              <p className="text-[10px] text-[#777777] mb-3">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-xs py-1.5 px-3 rounded border border-[#FDF0F3] text-[#777777] hover:bg-[#FDF8F0] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex-1 text-xs py-1.5 px-3 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
