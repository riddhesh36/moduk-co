"use client";

import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { MOCK_SLOTS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [loading, setLoading] = useState(false);

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Place the order in the database
      const orderResponse = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          totalAmount: totalPrice + deliveryFee,
          paymentMethod
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to place order");
      }

      const orderId = orderData.order_id;

      // 2. Send WhatsApp notification if opted-in
      if (formData.waOptIn) {
        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderDetails: { id: orderId, totalAmount: totalPrice + deliveryFee },
              waNumber: formData.mobile,
              customerName: formData.name
            }),
          });
        } catch (notifyErr) {
          console.error("Failed to send WhatsApp notification:", notifyErr);
          // We don't block the user if notification fails
        }
      }

      // 3. Success! Clear cart and redirect
      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      console.error("Checkout Error:", err.message);
      alert("Something went wrong while placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const deliveryFee = 50; // Mock delivery fee

  return (
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

            {/* Delivery Address */}
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5">
              <h2 className="text-xl font-bold text-dark mb-4">Payment Method</h2>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-rose bg-blush/30' : 'border-dark/10'}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-4 h-4 text-rose focus:ring-rose" />
                  <div className="flex-1 text-sm font-semibold">UPI via Razorpay (GPay, PhonePe, Paytm)</div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-rose bg-blush/30' : 'border-dark/10'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-rose focus:ring-rose" />
                  <div className="flex-1 text-sm font-semibold">Cash on Delivery</div>
                </label>
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
                const slotMap = MOCK_SLOTS.find(s => s.id === item.selectedSlotId);
                const label = slotMap ? slotMap.label : item.selectedSlotId;
                return (
                  <div key={idx} className="flex flex-col gap-1.5 border border-dark/5 rounded-lg p-3 bg-cream/30">
                    <div className="flex justify-between font-semibold">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>₹{item.product.price * item.quantity}</span>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-rose"/> 
                      {item.selectedDate === "today" ? "Today" : "Tomorrow"} | {label}
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
            </div>
            
            <div className="flex justify-between items-end mb-6">
              <span className="text-base font-semibold text-dark">Total</span>
              <span className="text-2xl font-bold text-rose">₹{totalPrice + deliveryFee}</span>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              size="lg" 
              className="w-full text-[16px] shadow-lg shadow-rose/20 h-12"
              disabled={loading}
            >
              {loading ? "Placing Order..." : `Place Order • ₹${totalPrice + deliveryFee}`}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
