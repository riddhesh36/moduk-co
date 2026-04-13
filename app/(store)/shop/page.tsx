"use client";

import { useState } from "react";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { ProductCard } from "@/components/ui/ProductCard";
import { QuickAddDialog } from "@/components/ui/QuickAddDialog";
import { type Product } from "@/types";

export default function ShopGridPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="w-full bg-cream py-16 px-6 min-h-[70vh]">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-4">Our Modaks</h1>
          <p className="text-text-muted md:text-lg max-w-xl">
            Choose from our selection of premium, handcrafted modaks. Perfect for naivedya, gifting, or treating yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              slotsAvailable={true}
              onAddToCart={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>

        <QuickAddDialog 
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      </div>
    </div>
  );
}
