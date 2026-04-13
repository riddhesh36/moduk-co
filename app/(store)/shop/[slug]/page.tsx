"use client";

import Image from "next/image";
import { useState } from "react";
import { MOCK_PRODUCTS, MOCK_SLOTS } from "@/lib/constants";
import { notFound, useRouter } from "next/navigation";
import { SlotSelector } from "@/components/ui/SlotSelector";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown, Info } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = MOCK_PRODUCTS.find(p => p.slug === params.slug);
  const { addToCart } = useCart();
  const router = useRouter();

  if (!product) {
    notFound();
  }

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("19th April");
  const [quantity, setQuantity] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSlot) {
      alert("Please select a delivery slot to continue.");
      return;
    }
    
    addToCart({
      product,
      quantity,
      selectedSlotId: selectedSlot,
      selectedDate
    });
    
    router.push("/cart");
  };

  return (
    <div className="w-full bg-cream min-h-screen pb-32">
      <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12 md:px-6 md:pt-12">
        
        {/* MOBILE IMAGE SET */}
        <div className="relative w-full aspect-square md:rounded-2xl overflow-hidden bg-blush shadow-sm">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* DETAILS SECTION */}
        <div className="px-6 py-8 md:p-0 flex flex-col">
          <h1 className="text-3xl md:text-5xl font-playfair font-bold text-dark">{product.name}</h1>
          <p className="text-[22px] font-bold text-rose mt-4">₹{product.price}</p>
          <p className="text-sm text-text-muted mt-1 uppercase tracking-widest">{product.price_label.split("·")[1]?.trim()}</p>

          <p className="mt-6 text-text-body text-base leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8 border-t border-dark/10 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-dark mb-4">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map(ing => (
                <span key={ing} className="px-3 py-1 bg-white border border-dark/5 rounded-full text-sm text-text-body shadow-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-rose" /> {ing}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 bg-blush/50 p-4 rounded-xl border border-rose/10">
            <Info className="text-rose shrink-0" size={20} />
            <div className="text-sm text-dark/80">
              <p><strong>Freshness:</strong> {product.shelf_life}</p>
              <p><strong>Storage:</strong> {product.storage_instructions}</p>
            </div>
          </div>

          {/* ACCORDION */}
          <div className="mt-8 border border-dark/10 rounded-xl overflow-hidden bg-white shadow-sm">
            <button 
              className="w-full flex justify-between items-center p-4 text-left font-semibold"
              onClick={() => setAccordionOpen(!accordionOpen)}
            >
              Why Moduk & Co?
              <ChevronDown className={`transition-transform ${accordionOpen ? "rotate-180" : ""}`} size={20}/>
            </button>
            {accordionOpen && (
              <div className="px-4 pb-4 text-sm text-text-muted space-y-2 border-t border-dark/5 pt-4">
                <p>✓ 100% Handcrafted</p>
                <p>✓ Pure, authentic ingredients</p>
                <p>✓ Same-day delivery across Mumbai</p>
              </div>
            )}
          </div>

          {/* DESKTOP SLOT SELECTOR - Shown inline here */}
          <div className="hidden md:block mt-8">
            <h3 className="text-lg font-bold text-dark mb-4">Select Delivery Slot</h3>
            <SlotSelector 
              slots={MOCK_SLOTS} 
              selectedSlotId={selectedSlot} 
              onSelectSlot={(slotId, d) => { setSelectedSlot(slotId); setSelectedDate(d); }} 
            />
            
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center border border-dark/20 rounded-lg bg-white overflow-hidden h-12">
                <button className="px-4 hover:bg-black/5 text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button className="px-4 hover:bg-black/5 text-lg" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <Button size="lg" className="flex-1 text-lg h-12 shadow-md shadow-rose/20" onClick={handleAddToCart}>
                Add to Cart — ₹{product.price * quantity}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark/10 p-4 shadow-2xl z-40 rounded-t-2xl flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div>
          <h3 className="text-sm font-bold text-dark mb-3">Select Delivery Slot</h3>
          <SlotSelector 
            slots={MOCK_SLOTS} 
            selectedSlotId={selectedSlot} 
            onSelectSlot={(slotId, d) => { setSelectedSlot(slotId); setSelectedDate(d); }} 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-dark/20 rounded-lg bg-white overflow-hidden h-12 shrink-0">
            <button className="px-3 hover:bg-black/5 text-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
            <button className="px-3 hover:bg-black/5 text-lg" onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <Button className="flex-1 h-12 font-bold shadow-md shadow-rose/20" onClick={handleAddToCart}>
            Add ₹{product.price * quantity}
          </Button>
        </div>
      </div>
    </div>
  );
}
