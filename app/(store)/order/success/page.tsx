"use client";

import { CheckCircle2, ChevronRight, Home, RefreshCw, Clock, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";
import { getOrder } from "../[id]/actions";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [retryLoading, setRetryLoading] = useState(false);

  const fetchOrder = async (isManual = false) => {
    if (!orderId) return;
    if (isManual) setRefreshing(true);
    const res = await getOrder(orderId);
    if (res.success) {
      setOrder(res.order);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Polling logic for payment verification
  useEffect(() => {
    if (!order || order.status !== "payment_pending" || pollCount >= 5 || !orderId) {
      return;
    }

    const timer = setTimeout(async () => {
      setRefreshing(true);
      const res = await getOrder(orderId);
      if (res.success) {
        setOrder(res.order);
        if (res.order.status !== "payment_pending") {
          setRefreshing(false);
          return;
        }
      }
      setPollCount((prev) => prev + 1);
      setRefreshing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [order, pollCount, orderId]);

  const handleManualRefresh = () => {
    fetchOrder(true);
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetryLoading(true);
    try {
      const res = await fetch("/api/orders/recreate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.display_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.payment_url) {
        throw new Error(data.error || "Failed to recreate payment link");
      }
      window.location.href = data.payment_url;
    } catch (err: any) {
      alert(err.message || "An error occurred while retrying the payment.");
    } finally {
      setRetryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6 justify-center">
        <Loader2 className="text-rose animate-spin mb-4" size={32} />
        <p className="text-dark font-medium">Loading your order details...</p>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-dark/5 p-8 md:p-12 text-center">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-playfair text-dark">Order Not Found</h1>
          <p className="text-text-muted mt-2">We couldn&apos;t locate this order.</p>
          <Link href="/" className="mt-6 inline-block">
            <Button className="bg-rose hover:bg-rose/90 text-white">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = ["confirmed", "dispatched", "delivered"].includes(order.status);
  const isCodPending = order.status === "cod_pending";
  const isPaymentPending = order.status === "payment_pending";
  const isFailed = ["payment_failed", "cancelled"].includes(order.status);

  // Status-specific badges
  let statusBadge = null;
  if (isConfirmed) {
    statusBadge = (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl border bg-green-50 border-green-200 text-green-700 text-sm max-w-sm mx-auto mb-6">
        <CheckCircle2 size={20} className="shrink-0 text-green-600" />
        <div className="text-left">
          <div className="font-bold">Payment Successful</div>
          <div className="text-xs opacity-90">We have received your payment and confirmed your order!</div>
        </div>
      </div>
    );
  } else if (isCodPending) {
    statusBadge = (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 text-sm max-w-sm mx-auto mb-6">
        <Clock size={20} className="shrink-0 text-amber-600 animate-pulse" />
        <div className="text-left">
          <div className="font-bold">COD Order Placed</div>
          <div className="text-xs opacity-90">Your Cash on Delivery order is awaiting confirmation from our team.</div>
        </div>
      </div>
    );
  } else if (isPaymentPending) {
    statusBadge = (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-800 text-sm max-w-sm mx-auto mb-6">
        <Loader2 size={20} className="shrink-0 text-blue-600 animate-spin" />
        <div className="text-left">
          <div className="font-bold">Verifying Payment</div>
          <div className="text-xs opacity-90">
            {pollCount < 5 
              ? "We are checking with Razorpay for your payment status..." 
              : "Payment verification is taking longer than usual. Please refresh."}
          </div>
        </div>
      </div>
    );
  } else if (isFailed) {
    statusBadge = (
      <div className="flex items-center justify-center gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 text-sm max-w-sm mx-auto mb-6">
        <AlertTriangle size={20} className="shrink-0 text-red-600" />
        <div className="text-left">
          <div className="font-bold">Payment Unsuccessful</div>
          <div className="text-xs opacity-90">The payment was not completed or failed. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-[85vh] flex flex-col items-center py-12 md:py-20 px-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-md border border-dark/5 p-8 md:p-12 text-center relative overflow-hidden">
        {/* Absolute Warm Decorative Top Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-rose" />

        {isPaymentPending && (
          <button 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="absolute top-6 right-6 p-2 text-text-muted hover:bg-dark/5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> 
            {refreshing ? "Checking..." : "Refresh Status"}
          </button>
        )}

        <div className="w-20 h-20 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-6">
          {isFailed ? (
            <AlertTriangle size={40} className="text-rose" />
          ) : isPaymentPending ? (
            <Clock size={40} className="text-rose animate-pulse" />
          ) : (
            <CheckCircle2 size={40} className="text-rose" />
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-dark mb-4">
          {isFailed 
            ? "Payment Failed" 
            : isPaymentPending 
              ? "Awaiting Payment" 
              : "Order Received!"}
        </h1>
        
        <p className="text-lg text-text-muted mb-8 max-w-md mx-auto">
          {isFailed
            ? "Your order has been saved, but we couldn't confirm the payment."
            : isPaymentPending
              ? "We are verifying your transaction with Razorpay. Hang tight!"
              : "Thank you for choosing Moduk & Co. Pure joy is on its way to you."}
        </p>

        {/* Dynamic Status Badge */}
        {statusBadge}

        {/* Order Details Summary */}
        <div className="bg-blush/20 rounded-2xl p-6 text-left border border-dark/5 mb-8 max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-dark uppercase tracking-widest mb-4 border-b border-dark/10 pb-2">
            Order Summary
          </h3>
          <div className="flex flex-col gap-3 text-sm text-text-body">
            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Order Number</span>
              <span className="font-bold font-mono">{order.display_id}</span>
            </div>
            
            {/* Render Items */}
            {order.items && order.items.length > 0 && (
              <div className="border-b border-dark/5 pb-2 flex flex-col gap-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Items</span>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between pl-1">
                    <span className="text-text-body font-medium">
                      {item.product?.name || "Modak"} <span className="text-text-muted text-xs">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-dark">
                      ₹{(item.product?.price || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {order.discount_amount > 0 && (
              <div className="flex justify-between border-b border-dark/5 pb-2 text-green-700">
                <span>Discount Applied</span>
                <span className="font-bold">-₹{order.discount_amount}</span>
              </div>
            )}

            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Total Amount</span>
              <span className="font-bold text-rose">₹{order.total_amount}</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-text-muted">Expected Delivery</span>
              <span className="font-bold text-dark text-right">
                {new Date(order.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}<br/>
                <span className="text-rose text-xs">{order.delivery_slots?.label || order.slot_id}</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isFailed ? (
            <Button 
              onClick={handleRetryPayment}
              disabled={retryLoading}
              className="w-full sm:w-auto h-12 bg-rose hover:bg-rose/90 text-white shadow-md shadow-rose/20 flex items-center justify-center gap-2"
            >
              {retryLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Preparing Payment...</span>
                </>
              ) : (
                <>
                  <span>Try Payment Again</span>
                  <ChevronRight size={16} />
                </>
              )}
            </Button>
          ) : (
            <Link href="/shop" passHref className="w-full sm:w-auto">
              <Button className="w-full h-12 bg-rose hover:bg-rose/90 text-white shadow-md shadow-rose/20">
                Continue Shopping <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
          
          <Link href="/" passHref className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full h-12 border border-dark/15 hover:bg-dark/5">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6 justify-center">
        <Loader2 className="text-rose animate-spin mb-4" size={32} />
        <p className="text-dark font-medium">Loading page...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
