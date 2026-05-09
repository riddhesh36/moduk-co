"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { QuickAddDialog } from "@/components/ui/QuickAddDialog";
import { type Product, type Slot } from "@/types";

export default function ProductGrid({ products, slots }: { products: Product[], slots: Slot[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
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
        slots={slots}
      />
    </>
  );
}
