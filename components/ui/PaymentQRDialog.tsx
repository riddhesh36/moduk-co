"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "./button";
import Image from "next/image";

interface PaymentQRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  isLoading?: boolean;
}

export function PaymentQRDialog({
  isOpen,
  onClose,
  onConfirm,
  amount,
  isLoading,
}: PaymentQRDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md p-4 outline-none"
          >
            <div className="bg-cream rounded-3xl shadow-2xl overflow-hidden border-2 border-rose/20">
              <div className="p-8 relative text-center">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute top-6 right-6 text-text-muted hover:text-dark transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-playfair font-bold text-dark mb-2">Scan to Pay</h2>
                <p className="text-text-muted text-sm mb-6">
                  Please scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to pay <span className="font-bold text-rose">₹{amount}</span>
                </p>

                <div className="bg-white p-4 rounded-2xl border border-rose/10 shadow-inner mb-6 flex justify-center">
                  <div className="relative w-64 h-64">
                    <Image
                      src="/images/qr-code.jpg"
                      alt="UPI QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-rose/5 p-4 rounded-xl border border-rose/10 text-left">
                    <CheckCircle2 className="text-rose shrink-0" size={20} />
                    <p className="text-xs text-dark/80 leading-snug">
                      Once the payment is successful, click the <strong>&quot;I have paid&quot;</strong> button below to confirm your order.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={onConfirm}
                      disabled={isLoading}
                      className="w-full h-14 text-base shadow-lg shadow-rose/20"
                    >
                      {isLoading ? "Confirming payment..." : `I have paid ₹${amount}`}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      disabled={isLoading}
                      className="text-text-muted hover:text-dark disabled:opacity-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
