"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Global smooth-scroll driver.
 *
 * Lenis takes over wheel / touchpad scrolling and eases it, which is what makes
 * the frame-sequence hero feel like video instead of a slideshow. It scrolls the
 * real window (no transform hack), so `position: sticky` keeps working.
 *
 * Opted out for users who ask for reduced motion, and for coarse pointers where
 * native momentum scrolling already feels better than anything we can emulate.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    // Published so in-page navigation (e.g. the hero's chapter rail) can hand
    // scroll targets back to Lenis instead of fighting it with window.scrollTo.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return null;
}
