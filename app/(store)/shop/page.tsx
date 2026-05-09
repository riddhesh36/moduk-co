import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ProductGrid from "@/components/store/ProductGrid";
import { MOCK_PRODUCTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ShopGridPage() {
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
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: slots } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_active', true);

  // Fallback to mock products if none in DB (for initial dev)
  const displayProducts = (products && products.length > 0) ? products : MOCK_PRODUCTS;

  return (
    <div className="w-full bg-cream py-16 px-6 min-h-[70vh]">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-4">Our Modaks</h1>
          <p className="text-text-muted md:text-lg max-w-xl">
            Choose from our selection of premium, handcrafted modaks. Perfect for naivedya, gifting, or treating yourself.
          </p>
        </div>

        <ProductGrid products={displayProducts} slots={slots || []} />
      </div>
    </div>
  );
}
