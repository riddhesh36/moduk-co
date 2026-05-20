"use client";

import { CheckCircle2, ChevronRight, Home, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getOrder } from "./actions";

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setRefreshing(true);
      const res = await getOrder(params.id);
      if (res.success) {
        setOrder(res.order);
      }
      setLoading(false);
      setRefreshing(false);
    };

    fetchOrder();
  }, [params.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const res = await getOrder(params.id);
    if (res.success) {
      setOrder(res.order);
    }
    setLoading(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6 justify-center">
        <p className="text-dark animate-pulse font-semibold">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6">
        <h1 className="text-2xl font-bold font-playfair text-dark">Order Not Found</h1>
        <p className="text-text-muted mt-2">We couldn&apos;t locate this order.</p>
        <Link href="/" className="mt-6"><Button>Return Home</Button></Link>
      </div>
    );
  }

  const isPaymentPending = order.payment_status === "pending" || order.payment_status === "pending_cod" || order.payment_status === "needs_verification";
  const statusColor = isPaymentPending ? "text-amber-600" : "text-green-600";
  const statusBg = isPaymentPending ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  return (
    <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6">
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-dark/5 p-8 md:p-12 text-center relative">
        
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="absolute top-6 right-6 p-2 text-text-muted hover:bg-dark/5 rounded-full transition-colors flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh Status"}
        </button>

        <div className="w-20 h-20 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-rose" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-dark mb-4">Order Confirmed!</h1>
        <p className="text-lg text-text-muted mb-8">
          Thank you for choosing Moduk & Co. Pure joy is on its way to you.
        </p>

        <div className={`flex items-center justify-center gap-3 p-4 rounded-lg border mb-8 max-w-sm mx-auto ${statusBg} ${statusColor} text-sm`}>
          {isPaymentPending ? <Clock size={24} className="shrink-0" /> : <CheckCircle2 size={24} className="shrink-0" />}
          <div className="text-left">
            <div className="font-bold">{isPaymentPending ? "Payment Pending Verification" : "Payment Successful"}</div>
            <div className="text-xs opacity-80">{isPaymentPending ? "Your payment is currently being reviewed." : "We've received your payment!"}</div>
          </div>
        </div>

        <div className="bg-blush/30 rounded-xl p-6 text-left border border-dark/10 mb-8 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-dark uppercase tracking-widest mb-4">Order Details</h3>
          <div className="flex flex-col gap-3 text-sm text-text-body">
            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Order Number</span>
              <span className="font-bold font-mono">{order.display_id}</span>
            </div>
            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Total Amount</span>
              <span className="font-bold">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-text-muted">Expected Delivery</span>
              <span className="font-bold text-rose text-right">
                {new Date(order.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}<br/>
                {order.delivery_slots?.label || order.slot_id}
              </span>
            </div>
          </div>
        </div>




        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" passHref>
            <Button variant="secondary" className="w-full sm:w-auto h-12">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Link href="/shop" passHref>
            <Button className="w-full sm:w-auto h-12 shadow-md shadow-rose/20">
              Continue Shopping <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
