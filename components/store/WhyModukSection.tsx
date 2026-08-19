"use client";

import { motion } from "framer-motion";
import { Leaf, Heart, Clock, Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

const REASONS = [
  {
    icon: Leaf,
    label: "100% pure",
    desc: "Jaggery, fresh coconut, rice flour, cardamom. Nothing else — no preservatives, no colour, no essence.",
  },
  {
    icon: Heart,
    label: "Made at home",
    desc: "Cooked in a home kitchen in small batches, by the same hands, every single morning.",
  },
  {
    icon: Clock,
    label: "Made to order",
    desc: "Nothing sits in a freezer. We steam against the day's orders, which is why slots close early.",
  },
  {
    icon: Star,
    label: "Loved by 500+",
    desc: "Repeat orders through the season from families across Mumbai and Navi Mumbai.",
  },
];

const STATS = [
  { value: "500+", label: "Happy customers" },
  { value: "0", label: "Preservatives" },
  { value: "24h", label: "Fresh window" },
  { value: "2", label: "Cities served" },
];

export default function WhyModukSection() {
  return (
    <section className="bg-blush px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why Moduk & Co"
          title="The shortcuts everyone takes,"
          accent="we don't."
          body="Modak is a festival sweet with a 24-hour life. Every decision we make protects that."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-3xl border border-rose/10 bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-rose/25 hover:shadow-[0_20px_50px_-24px_rgba(44,26,29,0.35)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush text-rose transition-colors duration-500 group-hover:bg-rose group-hover:text-white">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-playfair text-lg font-bold text-dark">{r.label}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-muted">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid grid-cols-2 gap-y-8 rounded-3xl border border-rose/10 bg-white/60 px-6 py-8 backdrop-blur-sm sm:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-playfair text-3xl font-bold text-dark md:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
