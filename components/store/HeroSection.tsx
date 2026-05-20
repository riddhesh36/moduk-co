"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Leaf, Star, Heart, Clock, Sparkles, MapPin, ChevronRight,
} from "lucide-react";

/* ─── Stagger animation config ─────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─── How It Works steps ───────────────────────────────── */

const steps = [
  {
    num: "01",
    icon: Sparkles,
    title: "Choose Your Box",
    desc: "Classic or kesar-infused modaks for any occasion.",
  },
  {
    num: "02",
    icon: Clock,
    title: "Pick a Slot",
    desc: "Select a delivery window — today or tomorrow.",
  },
  {
    num: "03",
    icon: MapPin,
    title: "Delivered Fresh",
    desc: "Hand-delivered to your doorstep across Mumbai.",
  },
];

/* ─── Main Bento Hero ──────────────────────────────────── */

export default function HeroSection() {
  return (
    <section id="hero-section" className="w-full bg-cream px-3 sm:px-4 pt-6 pb-4">
      <motion.div
        className="w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 md:gap-4 auto-rows-[140px] sm:auto-rows-[155px] md:auto-rows-[165px]">

          {/* ═══════════════════════════════════════════
              ROW 1 — Hero text + Hero image + Delivery
              ═══════════════════════════════════════════ */}

          {/* ── CARD 1: Hero Text (large dark) ─────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-5 row-span-3 rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(145deg, #2C1A1D 0%, #4A2028 50%, #3D1920 100%)",
            }}
          >
            {/* Decorative blurs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-rose/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-pink/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between h-full p-7 md:p-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-cream/60 text-[10px] tracking-[0.2em] uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose pulse-dot" />
                  Moduk &amp; Co
                </span>
              </div>

              <div className="mt-auto">
                <h1 className="font-playfair text-cream leading-[0.92] tracking-tight">
                  <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold">Pure</span>
                  <span className="block text-5xl sm:text-6xl lg:text-7xl font-bold italic text-rose mt-1">Joy.</span>
                </h1>
                <p className="text-cream/50 font-dmsans text-sm md:text-base mt-4 max-w-xs leading-relaxed">
                  Freshly handcrafted Ukadiche modaks, delivered to your door.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Link href="/shop" passHref>
                    <Button
                      size="lg"
                      className="text-sm px-8 py-5 shadow-xl shadow-rose/20 hover:shadow-rose/40 transition-all duration-300 hover:scale-[1.03] group"
                    >
                      Order Now
                      <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/shop" className="text-cream/40 text-sm font-dmsans hover:text-cream/60 transition-colors hidden sm:block">
                    View menu →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── CARD 2: Hero Image (tall) ──────────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card bento-image-card col-span-2 md:col-span-2 lg:col-span-4 row-span-3 rounded-3xl overflow-hidden relative"
          >
            <Image
              src="/images/hero.png"
              alt="Ukadiche Modaks on a beautiful plate"
              fill
              className="object-cover bento-img"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5">
              <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-dark text-xs font-semibold font-dmsans shadow-lg float-gentle">
                ⭐ 500+ happy customers
              </span>
            </div>
          </motion.div>

          {/* ── CARD 3: Delivery info (right top) ──── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-3 row-span-1 rounded-3xl overflow-hidden relative bg-dark"
          >
            <div className="p-5 md:p-6 flex items-center justify-between h-full">
              <div>
                <p className="text-cream/40 text-[10px] tracking-[0.2em] uppercase font-semibold font-dmsans">
                  Mumbai &amp; Navi Mumbai
                </p>
                <p className="text-cream text-base md:text-lg font-playfair font-bold mt-1">
                  Same-day delivery
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 pulse-dot" />
                <span className="text-emerald-400 text-xs font-semibold font-dmsans">Live</span>
              </div>
            </div>
          </motion.div>

          {/* ── CARD 4: How It Works — 3 Steps ─────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-3 row-span-2 rounded-3xl overflow-hidden relative bg-blush border border-rose/10"
          >
            <div className="p-5 md:p-7 flex flex-col h-full">
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-rose/60 font-dmsans">
                How it works
              </span>
              <div className="mt-4 flex-1 flex flex-col justify-between gap-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                      <step.icon className="w-4 h-4 text-rose" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-dark text-sm font-semibold font-dmsans block leading-tight">
                        {step.title}
                      </span>
                      <span className="text-text-muted text-[11px] font-dmsans leading-snug">
                        {step.desc}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════
              ROW 2 — Brand story + Features + CTA
              ═══════════════════════════════════════════ */}

          {/* ── CARD 5: Handcrafted brand story ─────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-5 row-span-2 rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(145deg, #2C1A1D 0%, #3D1920 100%)",
            }}
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-rose/8 blur-2xl" />
            <div className="p-7 md:p-8 flex flex-col justify-between h-full relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose/15 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-rose" />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-cream/40 font-dmsans">
                  Our Promise
                </span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-cream leading-tight">
                  Handcrafted with<br />devotion.
                </h2>
                <p className="text-cream/45 font-dmsans text-sm mt-3 max-w-sm leading-relaxed">
                  We believe the best offerings are made entirely by hand, with the purest ingredients. No preservatives, no shortcuts.
                </p>
                <div className="flex items-center gap-5 mt-5">
                  <span className="flex items-center gap-1.5 text-rose text-xs font-semibold font-dmsans tracking-wide uppercase">
                    <Star className="w-3.5 h-3.5" /> 500+ Customers
                  </span>
                  <span className="flex items-center gap-1.5 text-rose text-xs font-semibold font-dmsans tracking-wide uppercase">
                    <Heart className="w-3.5 h-3.5" /> 100% Pure
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── CARD 6: Features grid (compact) ─────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-4 row-span-2 rounded-3xl overflow-hidden relative bg-white border border-dark/5"
          >
            <div className="p-5 md:p-7 flex flex-col h-full">
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-text-muted font-dmsans">
                Why Moduk &amp; Co
              </span>
              <div className="mt-4 grid grid-cols-2 gap-3 flex-1">
                {[
                  { icon: Leaf, label: "100% Pure", desc: "No preservatives ever" },
                  { icon: Heart, label: "Homemade", desc: "Made with love at home" },
                  { icon: Clock, label: "Same-day", desc: "Delivered in hours" },
                  { icon: Star, label: "Premium", desc: "Finest ingredients only" },
                ].map((f, i) => (
                  <motion.div
                    key={f.label}
                    className="flex flex-col items-start gap-2 p-3 rounded-2xl bg-cream/60 hover:bg-cream transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <f.icon className="w-4 h-4 text-rose" />
                    </div>
                    <div>
                      <span className="text-dark text-xs font-bold font-dmsans block">
                        {f.label}
                      </span>
                      <span className="text-text-muted text-[10px] font-dmsans leading-tight">
                        {f.desc}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── CARD 7: Our Story CTA (rose) ──────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-3 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #C4617A 0%, #E8A0B0 100%)",
            }}
          >
            <Link href="/about" className="block h-full">
              <div className="p-5 md:p-6 flex items-center justify-between h-full">
                <div>
                  <p className="text-white/70 text-[10px] tracking-[0.2em] uppercase font-semibold font-dmsans">
                    Est. Mumbai
                  </p>
                  <p className="text-white text-lg md:text-xl font-playfair font-bold mt-0.5">
                    Our Story
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── CARD 8: Quick stat accent ─────────── */}
          <motion.div
            variants={cardVariants}
            className="bento-card col-span-2 md:col-span-2 lg:col-span-3 row-span-1 rounded-3xl overflow-hidden relative bg-dark"
          >
            <div className="p-5 md:p-6 flex items-center justify-between h-full">
              <div>
                <p className="text-cream/40 text-[10px] tracking-[0.2em] uppercase font-semibold font-dmsans">
                  Handcrafted
                </p>
                <p className="text-cream text-2xl md:text-3xl font-playfair font-bold mt-0.5">
                  100% Pure
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose/15 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-rose" />
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
