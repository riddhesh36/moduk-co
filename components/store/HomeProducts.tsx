"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ui/ProductCard";
import { QuickAddDialog } from "@/components/ui/QuickAddDialog";
import { type Product, type Slot } from "@/types";

export default function HomeProducts({ products, slots }: { products: Product[], slots: Slot[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
          >
            <ProductCard 
              product={p} 
              slotsAvailable={true} 
              onAddToCart={() => handleOpenDialog(p)} 
            />
          </motion.div>
        ))}
      </div>

      <QuickAddDialog 
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        slots={slots}
      />
    </>
  );
}
