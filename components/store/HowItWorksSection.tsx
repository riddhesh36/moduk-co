"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, MapPin, CreditCard } from "lucide-react";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    num: "01",
    icon: Sparkles,
    title: "Choose your box",
    desc: "Classic or kesar-infused modaks, in boxes of five, seven or eleven.",
  },
  {
    num: "02",
    icon: Clock,
    title: "Pick a slot",
    desc: "Same-day and next-day windows. They fill up fast during the season.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Add details & pay",
    desc: "Delivery address, a note if it's a gift, and a secure online payment.",
  },
  {
    num: "04",
    icon: MapPin,
    title: "Delivered fresh",
    desc: "Hand-delivered across Mumbai and Navi Mumbai, still warm from the steamer.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="border-y border-dark/5 bg-white px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Ordering"
          title="Four steps,"
          accent="start to doorstep."
          body="No app, no subscription. Pick a box, pick a time, and we handle the rest."
        />

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="group relative"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Connector — desktop only, and not after the last step */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(3.5rem+8px)] top-7 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-rose/25 to-transparent lg:block"
                />
              )}

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blush text-rose transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-rose group-hover:text-white">
                <step.icon className="h-6 w-6" />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-dark font-playfair text-[10px] font-bold text-cream">
                  {step.num}
                </span>
              </div>

              <h3 className="mt-5 font-playfair text-xl font-bold text-dark">{step.title}</h3>
              <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-text-muted">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
