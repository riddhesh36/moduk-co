"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { createCoupon } from "@/app/(admin)/admin/coupons/actions";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CouponFormModal({ isOpen, onClose }: CouponFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "flat",
    value: "",
    min_order_amount: "",
    max_uses: "",
    valid_until: "",
    is_first_time_only: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) { setError("Coupon code is required"); return; }
    if (!formData.value || Number(formData.value) <= 0) { setError("Value must be greater than 0"); return; }

    startTransition(async () => {
      const result = await createCoupon({
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        is_first_time_only: formData.is_first_time_only,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setFormData({ code: "", type: "percentage", value: "", min_order_amount: "", max_uses: "", valid_until: "", is_first_time_only: false });
        setError("");
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#FDF0F3] overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#FDF0F3] bg-[#FDF8F0]">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#C4617A]" />
              <h2 className="text-lg font-bold text-[#2C1A1D] font-playfair">Create New Coupon</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-[#777777] hover:text-[#2C1A1D] rounded-lg hover:bg-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Coupon Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">Coupon Code</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. MODUK20"
                className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm font-mono uppercase outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
                required
              />
            </div>

            {/* Type + Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">
                  Value {formData.type === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  name="value"
                  type="number"
                  min="1"
                  step="any"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder={formData.type === "percentage" ? "e.g. 10" : "e.g. 50"}
                  className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
                  required
                />
              </div>
            </div>

            {/* Min Order + Max Uses */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">Min Order (₹)</label>
                <input
                  name="min_order_amount"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  placeholder="0 = no minimum"
                  className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">Max Uses</label>
                <input
                  name="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={handleChange}
                  placeholder="∞ unlimited"
                  className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
                />
              </div>
            </div>

            {/* Valid Until */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#777777] uppercase tracking-wider">Valid Until (optional)</label>
              <input
                name="valid_until"
                type="datetime-local"
                value={formData.valid_until}
                onChange={handleChange}
                className="border border-[#FDF0F3] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C4617A] transition-colors bg-[#FDF8F0]/50"
              />
            </div>

            {/* First-time User Only */}
            <div className="flex items-center gap-2 py-1">
              <input
                id="is_first_time_only"
                name="is_first_time_only"
                type="checkbox"
                checked={formData.is_first_time_only}
                onChange={(e) => setFormData(prev => ({ ...prev, is_first_time_only: e.target.checked }))}
                className="w-4 h-4 text-[#C4617A] rounded border-[#FDF0F3] focus:ring-[#C4617A]"
              />
              <label htmlFor="is_first_time_only" className="text-xs font-semibold text-[#2C1A1D] cursor-pointer select-none">
                First-time user only (checked by phone number)
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-[#FDF0F3] rounded-xl text-sm font-semibold text-[#777777] hover:bg-[#FDF8F0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 px-4 bg-[#C4617A] text-white rounded-xl text-sm font-bold hover:bg-[#C4617A]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#C4617A]/20"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
