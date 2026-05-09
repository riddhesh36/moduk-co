import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Star } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MOCK_PRODUCTS } from "@/lib/constants";
import HomeProducts from "@/components/store/HomeProducts";
import HeroSection from "@/components/store/HeroSection";
import HowItWorksSection from "@/components/store/HowItWorksSection";

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
        Same-day delivery across Mumbai & Navi Mumbai · Today&apos;s slots available
      </div>

      {/* HERO SECTION */}
      <HeroSection />

      {/* FEATURED PRODUCTS */}
      <section className="py-20 md:py-32 px-6 bg-cream">
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

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* TRUST STRIP / BRAND STORY */}
      <section className="py-24 px-6 bg-dark text-cream relative">
        <div className="max-w-4xl mx-auto text-center">
          <Leaf className="w-10 h-10 mx-auto text-rose mb-8" />
          <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-8 leading-tight">
            Handcrafted with devotion.
          </h2>
          <p className="text-lg md:text-xl text-cream/70 leading-relaxed mb-6 font-dmsans">
            At Moduk & Co, we believe the best offerings are made entirely by hand, with the purest ingredients. No preservatives, no shortcuts. Just pure joy, made at home.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold tracking-wider uppercase text-rose mt-10">
            <span className="flex items-center gap-2"><Star size={16}/> 500+ Happy Customers</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-2"><Heart size={16}/> 100% Pure Ingredients</span>
          </div>
          <div className="mt-12">
            <Link href="/about" passHref>
              <Button variant="secondary" className="border-cream/20 text-cream hover:bg-white/5">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
