"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { type Product } from "@/types";

export default function EditProductButton({ product }: { product: Product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
        title="Edit"
      >
        <Edit2 size={18} />
      </button>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={product}
      />
    </>
  );
}
