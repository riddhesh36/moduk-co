"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Star, Sparkles, MapPin, Clock } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { type Product } from "@/types";

import { MOCK_PRODUCTS } from "@/lib/constants";

export default function Home() {
  return (
    <div className="w-full">
      {/* DELIVERY NUDGE */}
      <div className="w-full bg-rose text-white text-center py-2 px-4 text-xs tracking-wide uppercase font-semibold">
        Same-day delivery across Mumbai & Navi Mumbai · Today&apos;s slots available
      </div>

      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="Premium Modaks"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-balance drop-shadow-lg leading-tight">
              Pure Joy. <br className="md:hidden" />
              Delivered to <br className="hidden md:block"/> Your Door.
            </h1>
            <p className="mt-6 text-cream/90 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
              Freshly handcrafted Ukadiche modaks made with love, tradition, and the purest ingredients.
            </p>
            <div className="mt-10">
              <Link href="/shop" passHref>
                <Button size="lg" className="w-full sm:w-auto text-lg shadow-xl shadow-rose/20">
                  Order Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 md:py-32 px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-dark">Our Signature Modaks</h2>
            <p className="mt-4 text-text-muted">Freshly steamed today, delivered to you in hours.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PRODUCTS.map((p, idx) => (
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
                  onAddToCart={() => alert('Add to cart clicked')} 
                />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/shop" passHref>
              <Button variant="secondary" size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-blush px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-dark">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Sparkles, title: "1. Choose Your Box", desc: "Select our classic or kesar infused modaks for your occasion." },
              { icon: Clock, title: "2. Pick a Slot", desc: "Choose a delivery window for today or tomorrow." },
              { icon: MapPin, title: "3. Delivered Fresh", desc: "Hand-delivered fresh to your doorstep across Mumbai." },
            ].map((step, i) => (
              <motion.div 
                key={i}
                className="flex flex-col items-center text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-rose shadow-sm">
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-bold font-dmsans text-dark">{step.title}</h3>
                <p className="text-text-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
