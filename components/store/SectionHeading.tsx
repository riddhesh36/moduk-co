"use client";

import { motion } from "framer-motion";

/**
 * Shared section header so every band on the home page opens the same way:
 * eyebrow, serif headline, one line of support.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <span
        className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] ${
          dark ? "text-cream/45" : "text-rose/70"
        }`}
      >
        <span className="h-px w-6 bg-current opacity-50" />
        {eyebrow}
      </span>

      <h2
        className={`mt-4 font-playfair text-3xl font-bold leading-tight tracking-tight md:text-[2.6rem] ${
          dark ? "text-cream" : "text-dark"
        }`}
      >
        {title} {accent && <span className="italic text-rose">{accent}</span>}
      </h2>

      {body && (
        <p
          className={`mt-4 text-[15px] leading-relaxed md:text-base ${
            dark ? "text-cream/50" : "text-text-muted"
          } ${centered ? "mx-auto" : ""}`}
        >
          {body}
        </p>
      )}
    </motion.div>
  );
}
