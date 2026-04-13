"use client";

import { CheckCircle2, ChevronRight, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  // In a real app we would fetch the exact order details from Supabase using params.id

  return (
    <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6">
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-dark/5 p-8 md:p-12 text-center">
        
        <div className="w-20 h-20 bg-rose/10 text-rose rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-rose" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-dark mb-4">Order Confirmed!</h1>
        <p className="text-lg text-text-muted mb-8">
          Thank you for choosing Moduk & Co. Pure joy is on its way to you.
        </p>

        <div className="bg-blush/30 rounded-xl p-6 text-left border border-dark/10 mb-8 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-dark uppercase tracking-widest mb-4">Order Details</h3>
          <div className="flex flex-col gap-3 text-sm text-text-body">
            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Order Number</span>
              <span className="font-bold font-mono">{params.id}</span>
            </div>
            <div className="flex justify-between border-b border-dark/5 pb-2">
              <span className="text-text-muted">Total Paid</span>
              <span className="font-bold">₹798</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-text-muted">Expected Delivery</span>
              <span className="font-bold text-rose text-right">Today<br/>11:00 AM – 1:00 PM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 mb-8 text-left text-sm max-w-sm mx-auto">
          <MessageCircle size={24} className="shrink-0 text-green-600" />
          <p>
            We&apos;ve sent a confirmation message with your receipt to your WhatsApp.
          </p>
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
