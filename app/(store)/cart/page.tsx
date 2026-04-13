"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { MOCK_SLOTS } from "@/lib/constants";

export default function CartPage() {
  const { items, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[60vh] bg-cream flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-playfair font-bold text-dark mb-4">Your basket is empty</h1>
        <p className="text-text-muted mb-8 text-lg">Looks like you haven&apos;t added any joy to your cart yet.</p>
        <Link href="/shop" passHref>
          <Button size="lg" className="shadow-md shadow-rose/20">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen py-10 md:py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* CART ITEMS */}
        <div className="flex-1">
          <h1 className="text-3xl font-playfair font-bold text-dark mb-8">Your Cart</h1>
          
          <div className="flex flex-col gap-6">
            {items.map((item) => {
              const slotMap = MOCK_SLOTS.find(s => s.id === item.selectedSlotId);
              const label = slotMap ? slotMap.label : item.selectedSlotId;

              return (
                <div key={item.product.id} className="flex gap-4 bg-white p-4 rounded-xl border border-dark/5 shadow-sm">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-blush shrink-0">
                    <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover"/>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-dark">{item.product.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-text-muted hover:text-rose p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-text-muted mt-1">Qty: {item.quantity} · ₹{item.product.price} each</p>
                    
                    <div className="mt-auto inline-flex self-start bg-rose/10 text-rose border border-rose/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                      {item.selectedDate === "today" ? "Today" : "Tomorrow"} | {label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="w-full md:w-[340px] shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-dark/5 sticky top-24">
            <h2 className="text-lg font-bold text-dark mb-4">Order Summary</h2>
            
            <div className="flex flex-col gap-3 text-sm border-b border-dark/5 pb-4 mb-4">
              <div className="flex justify-between text-text-body">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-text-body">
                <span>Delivery Fee</span>
                <span className="text-text-muted italic">Calculated next</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-6">
              <span className="text-base font-semibold text-dark">Total</span>
              <span className="text-2xl font-bold text-rose">₹{totalPrice}</span>
            </div>

            <Link href="/checkout" passHref className="block w-full">
              <Button size="lg" className="w-full text-[16px] shadow-lg shadow-rose/20 h-12">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
