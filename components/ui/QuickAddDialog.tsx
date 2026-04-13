"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "./button";
import { SlotSelector } from "./SlotSelector";
import { MOCK_SLOTS } from "@/lib/constants";
import { type Product } from "@/types";
import { useCart } from "@/components/cart/CartContext";

interface QuickAddDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddDialog({
  product,
  isOpen,
  onClose,
}: QuickAddDialogProps) {
  const { addToCart } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("19th April");
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSlot) {
      alert("Please select a delivery slot.");
      return;
    }

    addToCart({
      product,
      quantity,
      selectedSlotId: selectedSlot,
      selectedDate,
    });
    
    onClose();
  };

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
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-lg p-4 outline-none"
          >
            <div className="bg-cream rounded-2xl shadow-xl overflow-hidden border border-rose/10 flex flex-col max-h-[90vh]">
              <div className="p-6 relative overflow-y-auto">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 text-text-muted hover:text-dark transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 bg-blush rounded-xl overflow-hidden shrink-0 relative">
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <h2 className="text-xl font-playfair font-bold text-dark leading-tight">{product.name}</h2>
                    <p className="text-rose font-bold mt-1">₹{product.price}</p>
                    <p className="text-[12px] text-text-muted mt-0.5 tracking-wide uppercase">{product.price_label.split("·")[1]?.trim() || "per box"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-dark mb-3 uppercase tracking-wider">Select Delivery Slot</h3>
                    <SlotSelector 
                      slots={MOCK_SLOTS}
                      selectedSlotId={selectedSlot}
                      onSelectSlot={(slotId, date) => {
                        setSelectedSlot(slotId);
                        setSelectedDate(date);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark/5">
                    <span className="text-sm font-bold text-dark uppercase tracking-wider">Quantity</span>
                    <div className="flex items-center border border-dark/20 rounded-lg bg-white overflow-hidden h-10">
                      <button 
                        className="px-3 hover:bg-black/5 text-dark/60 transition-colors"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                      <button 
                        className="px-3 hover:bg-black/5 text-dark/60 transition-colors"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleAddToCart}
                    className="flex-[2] gap-2 shadow-lg shadow-rose/20"
                  >
                    <ShoppingCart size={18} />
                    Add — ₹{product.price * quantity}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
