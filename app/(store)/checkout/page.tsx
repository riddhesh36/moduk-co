"use client";

import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { type Slot } from "@/types";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Loader2, X, Gift, Tag, Sparkles } from "lucide-react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    supabase.from('delivery_slots').select('*').then(({ data }) => {
      if (data) setSlots(data);
    });
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr === "today") return "Today";
    if (dateStr === "tomorrow") return "Tomorrow";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const router = useRouter();

  const paymentMethod = "upi";
  const [loading, setLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [errorAlertOpen, setErrorAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    coupon_id: string;
    discount_amount: number;
    code: string;
    message: string;
  } | null>(null);

  // Delivery Option State
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery");
  const deliveryFee = deliveryOption === "delivery" ? 50 : 0;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
    notes: "",
    waOptIn: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Confetti burst on successful coupon apply
  const fireCouponConfetti = useCallback(() => {
    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7, x: 0.5 },
      colors: ['#C4617A', '#E8A0B0', '#FDF0F3', '#FFD700', '#FF6B6B', '#4CAF50'],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.9,
      shapes: ['circle', 'square'],
    });
    // Delayed second burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.65, x: 0.45 },
        colors: ['#C4617A', '#FFD700', '#4CAF50'],
        ticks: 80,
        gravity: 1.4,
        scalar: 0.7,
      });
    }, 150);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          cart_total: totalPrice + deliveryFee,
          customer_phone: formData.mobile,
        }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          coupon_id: data.coupon_id,
          discount_amount: data.discount_amount,
          code: data.coupon_code,
          message: data.message,
        });
        setCouponError("");
        // 🎉 Confetti!
        fireCouponConfetti();
      } else {
        setCouponError(data.message || "Invalid or expired coupon");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Clear applied coupon if mobile changes (prevents first-time validation bypass)
  useEffect(() => {
    if (appliedCoupon) {
      handleRemoveCoupon();
    }
  }, [formData.mobile]);

  // Re-validate coupon if deliveryOption changes (recalculates min_order / flat cap discount)
  useEffect(() => {
    if (appliedCoupon) {
      const reapply = async () => {
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: appliedCoupon.code,
              cart_total: totalPrice + deliveryFee,
              customer_phone: formData.mobile,
            }),
          });
          const data = await res.json();
          if (data.valid) {
            setAppliedCoupon({
              coupon_id: data.coupon_id,
              discount_amount: data.discount_amount,
              code: data.coupon_code,
              message: data.message,
            });
          } else {
            setAppliedCoupon(null);
            setCouponError(data.message || "Coupon is no longer valid for this delivery option");
          }
        } catch {
          setAppliedCoupon(null);
        }
      };
      reapply();
    }
  }, [deliveryOption]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    executeOnlinePayment();
  };

  // Derived totals
  const originalTotal = totalPrice + deliveryFee;
  const discountAmount = appliedCoupon?.discount_amount || 0;
  const finalTotal = originalTotal - discountAmount;

  const executeOnlinePayment = async () => {
    setLoading(true);
    try {
      const firstItem = items && items.length > 0 ? items[0] : null;
      const selectedSlotId = firstItem ? firstItem.selectedSlotId : "";

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.mobile,
          delivery_address: deliveryOption === "pickup" ? "Self-Pickup from Kitchen (Lalbaug)" : formData.address,
          delivery_slot: selectedSlotId,
          items: items.map(item => ({ product_id: item.product.id, quantity: item.quantity })),
          coupon_id: appliedCoupon?.coupon_id || null,
          discount_amount: discountAmount,
          original_total: originalTotal,
          final_total: finalTotal,
          pincode: deliveryOption === "pickup" ? "400025" : formData.pincode,
          notes: formData.notes,
          wa_opt_in: formData.waOptIn,
          delivery_option: deliveryOption
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_url) {
        throw new Error(data.error || "Something went wrong, please try again");
      }

      // Success! Clear cart and redirect to Razorpay Payment Link hosted page
      clearCart();
      window.location.href = data.payment_url;
    } catch (err: unknown) {
      const errorBody = err instanceof Error ? err.message : String(err);
      console.error("Online Payment Error:", errorBody);
      setErrorMessage(errorBody || "Something went wrong, please try again");
      setErrorAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-cream min-h-screen py-8 md:py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">

          {/* CHECKOUT FORM */}
          <div className="flex-1">
            <h1 className="text-3xl font-playfair font-bold text-dark mb-8">Checkout</h1>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">

              {/* Contact Details */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5">
                <h2 className="text-xl font-bold text-dark mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-text-body">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="border border-dark/20 rounded-md px-3 py-2 outline-none focus:border-rose transition-colors" placeholder="e.g. Priya Sharma" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-text-body">Mobile Number</label>
                    <input required name="mobile" value={formData.mobile} onChange={handleInputChange} type="tel" className="border border-dark/20 rounded-md px-3 py-2 outline-none focus:border-rose transition-colors" placeholder="e.g. 9876543210" />
                  </div>
                </div>
              </div>

              {/* Delivery Option Selector */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5">
                <h2 className="text-xl font-bold text-dark mb-4">Delivery Option</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDeliveryOption("delivery")}
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${deliveryOption === 'delivery'
                        ? 'border-rose bg-blush/10 shadow-sm'
                        : 'border-dark/10 hover:border-dark/20'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-dark">Home Delivery</span>
                      <span className="text-xs font-bold text-rose bg-rose/10 px-2 py-0.5 rounded-full">₹50</span>
                    </div>
                    <p className="text-xs text-text-muted">Porter or Dunzo delivery straight to your doorstep.</p>
                  </div>

                  <div
                    onClick={() => setDeliveryOption("pickup")}
                    className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${deliveryOption === 'pickup'
                        ? 'border-rose bg-blush/10 shadow-sm'
                        : 'border-dark/10 hover:border-dark/20'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-dark">Self-Pickup</span>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Free</span>
                    </div>
                    <p className="text-xs text-text-muted">Pick up from our kitchen in Kalachowki, Mumbai.</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address or Pickup Location */}
              {deliveryOption === "delivery" ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5">
                  <h2 className="text-xl font-bold text-dark mb-4">Delivery Address</h2>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-text-body">Full Address</label>
                      <textarea required name="address" value={formData.address} onChange={handleInputChange} rows={3} className="border border-dark/20 rounded-md px-3 py-2 outline-none focus:border-rose transition-colors resize-none" placeholder="Flat No, Building, Street, Area" />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full md:w-1/2">
                      <label className="text-sm font-semibold text-text-body">Pincode</label>
                      <input required name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" className="border border-dark/20 rounded-md px-3 py-2 outline-none focus:border-rose transition-colors" placeholder="e.g. 400050" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5 bg-gradient-to-br from-white to-[#FDF8F0]/30">
                  <h2 className="text-xl font-bold text-dark mb-3">Pickup Location</h2>
                  <div className="border border-[#FDF0F3] rounded-xl p-4 bg-[#FDF8F0]/50 space-y-2">
                    <p className="text-sm font-bold text-dark">Moduk & Co. Kitchen</p>
                    <p className="text-sm text-text-body">
                      Aakash chs, building no.34, opposite of kalachowki police station<br />
                      Lalbaug, MUMBAI - 400033
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-xs font-semibold text-text-muted">Available for pickup during your selected slot</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5">
                <h2 className="text-xl font-bold text-dark mb-4">Order Notes (Optional)</h2>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full border border-dark/20 rounded-md px-3 py-2 outline-none focus:border-rose transition-colors resize-none" placeholder="Personalise your box — add a message or request" />

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="waOptIn"
                    checked={formData.waOptIn}
                    onChange={(e) => setFormData(p => ({ ...p, waOptIn: e.target.checked }))}
                    className="w-4 h-4 text-rose rounded border-dark/20 focus:ring-rose"
                  />
                  <label htmlFor="waOptIn" className="text-sm text-text-muted">Send my order updates on WhatsApp</label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5 bg-gradient-to-br from-white to-[#FDF8F0]/20">
                <h2 className="text-xl font-bold text-dark mb-3">Payment</h2>
                <div className="flex items-center gap-3 p-4 border border-rose/30 bg-blush/10 rounded-xl">
                  <span className="text-rose font-bold text-lg">💳</span>
                  <div>
                    <div className="text-sm font-semibold text-dark">Pay Online (Secure Razorpay)</div>
                    <div className="text-xs text-text-muted mt-0.5">Supports UPI, Cards, Netbanking & Wallets</div>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* ORDER SUMMARY */}
          <div className="w-full md:w-[380px] shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5 sticky top-24">
              <h2 className="text-lg font-bold text-dark mb-4">Order Details</h2>

              <div className="flex flex-col gap-3 text-sm pb-4 border-b border-dark/5 mb-4">
                {items.map((item, idx) => {
                  const slotMap = slots.find(s => s.id === item.selectedSlotId);
                  const label = slotMap ? slotMap.label : "Morning Slot";
                  return (
                    <div key={idx} className="flex flex-col gap-1.5 border border-dark/5 rounded-lg p-3 bg-cream/30">
                      <div className="flex justify-between font-semibold">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>₹{item.product.price * item.quantity}</span>
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-rose" />
                        {formatDate(item.selectedDate)} | {label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 text-sm border-b border-dark/5 pb-4 mb-4">
                <div className="flex justify-between text-text-body">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-text-body">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>

                {/* Coupon Discount Line (if applied) */}
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-green-700 bg-green-50 -mx-2 px-2 py-1.5 rounded-lg transition-all animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-green-600" />
                      <span className="text-xs font-semibold">Coupon {appliedCoupon.code}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-green-700">−₹{appliedCoupon.discount_amount}</span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-0.5 rounded-full hover:bg-green-100 text-green-500 transition-colors"
                        title="Remove coupon"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mb-5">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Gift size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose/50" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponError) setCouponError("");
                          }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                          placeholder="Have a coupon? 🎁"
                          className="w-full border border-dashed border-rose/30 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-rose focus:border-solid bg-blush/20 placeholder:text-text-muted/60 transition-all"
                          id="coupon-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 bg-rose text-white text-sm font-semibold rounded-xl hover:bg-rose/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-rose/20"
                      >
                        {couponLoading ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 font-medium pl-1 animate-in slide-in-from-top-1 fade-in">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-sm">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="text-green-800 font-medium text-xs flex-1">{appliedCoupon.message}</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/60"
                      title="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-base font-semibold text-dark">Total</span>
                <div className="text-right">
                  {appliedCoupon && (
                    <span className="text-sm text-text-muted line-through mr-2">₹{originalTotal}</span>
                  )}
                  <span className="text-2xl font-bold text-rose">₹{finalTotal}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full text-[16px] shadow-lg shadow-rose/20 h-12 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Preparing Payment...</span>
                  </>
                ) : (
                  "Proceed to Pay →"
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>

      <AlertDialog
        isOpen={errorAlertOpen}
        onClose={() => setErrorAlertOpen(false)}
        title="Order Failed"
        description={errorMessage || "Something went wrong while placing your order. Please try again."}
      />
    </>
  );
}
