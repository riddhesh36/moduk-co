"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClosingCTA() {
  return (
    <section className="bg-cream px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] px-8 py-16 text-center md:px-16 md:py-20"
        style={{ background: "linear-gradient(140deg, #2C1A1D 0%, #4A2028 55%, #3D1920 100%)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose/12 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink/12 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/60 backdrop-blur-sm">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-rose" />
            Slots open now
          </span>

          <h2 className="mt-6 font-playfair text-3xl font-bold leading-tight text-cream md:text-5xl">
            Order today.
            <br />
            <span className="italic text-rose">Eat them warm.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-cream/50">
            We steam against the day&apos;s orders, so slots close as they fill. Pick yours before
            it&apos;s gone.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" passHref>
              <Button
                size="lg"
                className="group px-9 py-5 text-sm shadow-xl shadow-rose/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-rose/40"
              >
                Browse the boxes
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link
              href="/delivery"
              className="text-sm font-medium text-cream/50 underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              Where we deliver →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] font-medium text-cream/40">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-rose" /> Same-day &amp; next-day slots
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-rose" /> Mumbai &amp; Navi Mumbai
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
