"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
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
  );
}
