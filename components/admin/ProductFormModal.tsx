"use client";

import { useState } from "react";
import { addProduct, updateProduct } from "@/app/(admin)/admin/products/actions";
import { type Product } from "@/types";

export default function ProductFormModal({ isOpen, onClose, product }: { isOpen: boolean; onClose: () => void; product?: Product }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    if (product) {
      formData.set("id", product.id);
      const res = await updateProduct(formData);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        alert("Error: " + res.error);
      }
      return;
    }

    // Auto-generate slug from name if not provided
    if (!formData.get("slug")) {
      const name = formData.get("name") as string;
      const pieces = formData.get("pieces") as string;
      formData.set("slug", `${name.toLowerCase().replace(/\s+/g, '-')}-${pieces}`);
    }

    const res = await addProduct(formData);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden relative z-10">
        <div className="p-6 border-b border-[#FDF0F3] flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-playfair font-bold text-[#2C1A1D]">{product ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-[#777777] hover:text-[#2C1A1D] text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Product Name *</label>
              <input name="name" defaultValue={product?.name} required className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="Classic Box" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Slug</label>
              <input name="slug" defaultValue={product?.slug} disabled={!!product} className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A] disabled:bg-gray-50" placeholder="Auto-generated if empty" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Price (₹) *</label>
              <input name="price" type="number" defaultValue={product?.price} required className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="130" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Number of Pieces *</label>
              <input name="pieces" type="number" defaultValue={product?.pieces} required className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#777777] mb-1">Description *</label>
            <textarea name="description" defaultValue={product?.description} required rows={3} className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="A lovely assorted box..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#777777] mb-1">Ingredients (comma separated) *</label>
            <input name="ingredients" defaultValue={product?.ingredients?.join(", ")} required className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="Fresh Coconut, Rice Flour, Jaggery..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Image Upload (or Image URL)</label>
              <input name="image_file" type="file" accept="image/*" className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A] mb-2" />
              <input name="image_url" defaultValue={product?.image_url} className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="Or paste image URL here..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#777777] mb-1">Badge (Optional)</label>
              <input name="badge" defaultValue={product?.badge || ""} className="w-full border border-[#FDF0F3] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4617A]" placeholder="e.g. Best Value" />
              
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#777777]">
                  <input type="checkbox" name="is_active" value="true" defaultChecked={product ? product.is_active : true} className="rounded text-[#C4617A] focus:ring-[#C4617A]" />
                  Is Active?
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#FDF0F3] flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#777777] hover:bg-[#FDF0F3] rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-[#C4617A] hover:bg-[#C4617A]/90 rounded-lg shadow-sm transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
