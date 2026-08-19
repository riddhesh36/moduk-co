import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MOCK_PRODUCTS } from "@/lib/constants";
import HomeProducts from "@/components/store/HomeProducts";
import HeroSection from "@/components/store/HeroSection";
import SectionHeading from "@/components/store/SectionHeading";
import HowItWorksSection from "@/components/store/HowItWorksSection";
import WhyModukSection from "@/components/store/WhyModukSection";
import PromiseSection from "@/components/store/PromiseSection";
import ClosingCTA from "@/components/store/ClosingCTA";
import Testimonials3D from "@/components/store/Testimonials3D";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { },
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
      {/* 1 — SCROLL STORY HERO (frame sequence) */}
      <HeroSection />

      {/* 2 — FEATURED PRODUCTS */}
      <section className="bg-cream px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The boxes"
            title="Our signature"
            accent="modaks."
            body="Steamed this morning, boxed while warm, and on their way to you within hours."
          />

          <div className="mt-16">
            <HomeProducts products={displayProducts} slots={slots || []} />
          </div>

          <div className="mt-16 text-center">
            <Link href="/shop" passHref>
              <Button variant="secondary" size="lg">View all products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 — HOW IT WORKS */}
      <HowItWorksSection />

      {/* 4 — WHY MODUK & CO */}
      <WhyModukSection />

      {/* 5 — BRAND STORY / PROMISE */}
      <PromiseSection />

      {/* 6 — TESTIMONIALS */}
      <Testimonials3D />

      {/* 7 — CLOSING CTA */}
      <ClosingCTA />
    </div>
  );
}
