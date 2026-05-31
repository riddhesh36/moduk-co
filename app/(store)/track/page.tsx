"use client";

import { useState, useEffect, Suspense } from "react";
import { ShoppingBag, CheckCircle2, ChevronRight, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEmailOTP, verifyEmailOTP, getCustomerOrders, logoutCustomer } from "./actions";
import Link from "next/link";
import { type Order } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

function TrackOrdersContent() {
  const [step, setStep] = useState<"email" | "otp" | "list">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [timer, setTimer] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Check if already "logged in"
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const res = await getCustomerOrders();
      if (res.success && res.orders) {
        if (orderId) {
          const hasOrder = res.orders.some(o => o.display_id === orderId);
          if (hasOrder) {
            router.replace(`/order/success?order_id=${orderId}`);
            return;
          } else {
            // Force logout wrong email for this specific order
            await logoutCustomer();
            setStep("email");
          }
        } else {
          setOrders(res.orders || []);
          if (res.orders.length > 0) {
            setEmail(res.orders[0].customer_email || res.orders[0].customer_mobile || "");
          }
          setStep("list");
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, [orderId, router]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (loading || timer > 0) return; // Prevent multi-clicks

    setLoading(true);
    setError("");
    const res = await sendEmailOTP(email);
    if (res.success) {
      setStep("otp");
      setTimer(30); // 30 seconds wait
    } else {
      setError(res.error || "Failed to send OTP.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await verifyEmailOTP(email, otp);
    if (res.success) {
      if (orderId) {
        router.replace(`/order/success?order_id=${orderId}`);
      } else {
        const ordersRes = await getCustomerOrders();
        if (ordersRes.success) {
          setOrders(ordersRes.orders || []);
          setStep("list");
        }
      }
    } else {
      setError(res.error || "Verification failed.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutCustomer();
    setStep("email");
    setOrders([]);
    setEmail("");
    setOtp("");
  };

  if (loading && step === "email") {
    return (
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-rose mb-4" size={32} />
        <p className="text-text-muted font-medium">Checking your account...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">

        {step === "email" && (
          <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-rose/10 text-center">
            <div className="w-16 h-16 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-dark mb-2">
              {orderId ? "Verify Email to View Order" : "Track Your Orders"}
            </h1>
            <p className="text-text-muted mb-8">
              {orderId 
                ? `Please enter the email address used for order ${orderId} to verify your identity and view its status.`
                : "Enter your email address used during checkout to view your orders."}
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full h-14 bg-cream/30 border border-dark/10 rounded-xl px-4 outline-none focus:border-rose transition-all text-lg font-semibold tracking-wide"
                  required
                />
              </div>
              {error && <p className="text-rose text-sm font-medium">{error}</p>}
              <Button size="lg" className="w-full h-14 shadow-lg shadow-rose/20 text-base" disabled={loading}>
                {loading ? "Sending..." : "Send OTP via Email"}
              </Button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-rose/10 text-center relative">
            <button onClick={() => setStep("email")} className="absolute top-8 left-8 text-text-muted hover:text-dark">
              <ArrowLeft size={20} />
            </button>
            <div className="w-16 h-16 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-dark mb-2">Verify OTP</h1>
            <p className="text-text-muted mb-8">We&apos;ve sent a 6-digit code to <span className="font-bold text-dark">{email}</span></p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-left">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 block">One-Time Password</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full h-14 bg-cream/30 border border-dark/10 rounded-xl px-4 outline-none focus:border-rose transition-all text-2xl font-bold tracking-[0.5em] text-center"
                  required
                />
              </div>
              {error && <p className="text-rose text-sm font-medium">{error}</p>}
              <Button size="lg" className="w-full h-14 shadow-lg shadow-rose/20 text-base" disabled={loading}>
                {loading ? "Verifying..." : "Confirm & View Orders"}
              </Button>
              <button
                type="button"
                onClick={() => handleSendOTP()}
                disabled={timer > 0 || loading}
                className="text-sm text-rose font-semibold hover:underline mt-4 block mx-auto disabled:text-text-muted disabled:no-underline"
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
              </button>
            </form>
          </div>
        )}

        {step === "list" && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-playfair font-bold text-dark mb-2">My Orders</h1>
                <p className="text-text-muted">Welcome back! Showing orders for <span className="font-bold text-dark">{email}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-text-muted hover:text-rose transition-colors text-sm font-semibold py-2 px-4 border border-dark/5 rounded-full hover:bg-rose/5"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-dark/5 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-rose/10 text-rose text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-text-muted text-sm font-medium">Order #{order.display_id}</span>
                      </div>

                      <div className="space-y-4 mb-6">
                        {order.items?.map((item: { product?: { name: string; price: number }; quantity: number }, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center shrink-0">
                              <ShoppingBag size={20} className="text-rose/50" />
                            </div>
                            <div>
                              <div className="font-bold text-dark">{item.quantity}x {item.product?.name || 'Box of Joy'}</div>
                              <div className="text-xs text-text-muted">₹{item.product?.price} each</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-y-4 gap-x-8 pt-6 border-t border-dark/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Delivery Slot</span>
                          <span className="text-sm font-semibold text-dark">
                            {new Date(order.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} | {order.delivery_slots?.label || order.slot_id}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Payment</span>
                          <span className="text-sm font-semibold text-dark capitalize">{order.payment_status} ({order.payment_method})</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Paid</span>
                          <span className="text-sm font-bold text-rose">₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-48 flex items-center justify-center bg-cream/30 rounded-2xl p-6 border border-dark/5">
                      <Link href={`/order/${order.display_id}`} className="w-full">
                        <Button variant="ghost" className="w-full flex items-center justify-center gap-2 font-bold hover:bg-rose/10 hover:text-rose transition-all">
                          Full Receipt <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-dark/20">
                  <ShoppingBag size={48} className="text-rose/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark">No orders found</h3>
                  <p className="text-text-muted mt-2 mb-8">You haven&apos;t placed any orders with this email address yet.</p>
                  <Link href="/shop">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrdersPage() {
  return (
    <Suspense fallback={
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-rose mb-4" size={32} />
        <p className="text-text-muted font-medium">Loading tracker...</p>
      </div>
    }>
      <TrackOrdersContent />
    </Suspense>
  );
}
