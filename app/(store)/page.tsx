import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MOCK_PRODUCTS } from "@/lib/constants";
import HomeProducts from "@/components/store/HomeProducts";
import HeroSection from "@/components/store/HeroSection";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    .limit(3)
    .order('created_at', { ascending: false });

  const { data: slots } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_active', true);

  const displayProducts = (products && products.length > 0) ? products : MOCK_PRODUCTS;

  return (
    <div className="w-full">
      {/* DELIVERY NUDGE */}
      <div className="w-full bg-rose text-white text-center py-2 px-4 text-xs tracking-wide uppercase font-semibold">
        Same-day delivery across Mumbai &amp; Navi Mumbai · Today&apos;s slots available
      </div>

      {/* BENTO HERO — includes How It Works + Brand Story */}
      <HeroSection />

      {/* FEATURED PRODUCTS */}
      <section className="py-20 md:py-28 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-dark">Our Signature Modaks</h2>
            <p className="mt-4 text-text-muted">Freshly steamed today, delivered to you in hours.</p>
          </div>
          
          <HomeProducts products={displayProducts} slots={slots || []} />
          
          <div className="mt-16 text-center">
            <Link href="/shop" passHref>
              <Button variant="secondary" size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
