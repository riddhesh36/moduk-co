"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ProductFormModal from "./ProductFormModal";

export default function ProductFormButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-[#C4617A] text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#C4617A]/90 flex items-center gap-2"
      >
        <Plus size={20} /> Add Product
      </button>

      <ProductFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
