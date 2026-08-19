"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PromiseSection() {
  return (
    <section className="relative overflow-hidden bg-dark px-6 py-20 md:py-28">
      {/* Soft brand glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-rose/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-pink/10 blur-3xl" />

      <motion.div
        className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* ── Copy ─────────────────────────────────────── */}
        <motion.div variants={reveal}>
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/45">
            <span className="h-px w-6 bg-current opacity-50" />
            Our promise
          </span>

          <h2 className="mt-4 font-playfair text-3xl font-bold leading-tight text-cream md:text-[2.6rem]">
            Handcrafted <span className="italic text-rose">with devotion.</span>
          </h2>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-cream/55 md:text-base">
            Moduk &amp; Co started in a home kitchen in Mumbai, making the modaks we grew up
            eating during Ganeshotsav — the pleated, steamed kind that takes an afternoon and
            can&apos;t be rushed. We still make them exactly that way, and we still make them by hand.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Steamed the same morning they reach you.",
              "Jaggery and fresh coconut — never sugar or desiccate.",
              "No preservatives, so eat them within the day.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3 text-[14px] text-cream/60">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-rose/90"
            >
              Read our story
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <a
              href="https://instagram.com/modukandco"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full border border-cream/15 px-6 py-3 text-sm font-semibold text-cream/70 transition-all duration-300 hover:border-cream/35 hover:text-cream"
            >
              <InstagramIcon className="h-4 w-4" />
              @modukandco
            </a>
          </div>
        </motion.div>

        {/* ── Image ────────────────────────────────────── */}
        <motion.div variants={reveal} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/about-img.jpg"
              alt="Modaks being shaped by hand in the Moduk & Co kitchen"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/55 via-transparent to-transparent" />
          </div>

          {/* Floating credential */}
          <div className="absolute -bottom-5 left-5 rounded-2xl bg-cream px-5 py-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:left-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Est. Mumbai
            </p>
            <p className="mt-0.5 font-playfair text-lg font-bold text-dark">
              Made at home, by hand
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
