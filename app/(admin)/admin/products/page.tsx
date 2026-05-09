import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Plus, Trash2, Edit2, Package } from "lucide-react";
import { deleteProduct } from "./actions";
import ProductFormButton from "@/components/admin/ProductFormButton";
import EditProductButton from "./EditProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Product CMS</h1>
          <p className="text-[#777777] mt-1">Manage your storefront products, pricing, and inventory.</p>
        </div>
        <ProductFormButton />
      </div>

      <div className="bg-white border text-sm border-[#FDF0F3] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDF8F0] text-[#777777] uppercase tracking-wider text-xs border-b border-[#FDF0F3]">
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Pricing</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FDF0F3]">
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[#777777]">No products found in the database.</td>
              </tr>
            )}
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-[#FDF8F0]/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden border border-[#FDF0F3] relative">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-300">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#2C1A1D]">{product.name}</div>
                      <div className="text-xs text-[#777777]">{product.pieces} Pieces</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-[#C4617A]">₹{product.price}</div>
                  <div className="text-xs text-[#777777]">Slug: {product.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <EditProductButton product={product as any} />
                    <form action={async () => {
                      "use server";
                      await deleteProduct(product.id);
                    }}>
                      <button type="submit" className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
