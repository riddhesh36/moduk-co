"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════════
   Frame sequence
   ═══════════════════════════════════════════════════════════ */

const TOTAL_FRAMES = 115;

const frameSrc = (n: number) =>
  `/animation-frames/frame-${String(n).padStart(3, "0")}.jpg`;

/**
 * Full sequence on desktop; every 2nd frame on phones. 115 decoded 720×1120
 * bitmaps is more than a mid-range phone wants to hold at once, and at phone
 * scroll lengths the thinned sequence is indistinguishable.
 */
function buildFrameList(stride: number): number[] {
  const out: number[] = [];
  for (let n = 1; n <= TOTAL_FRAMES; n += stride) out.push(n);
  if (out[out.length - 1] !== TOTAL_FRAMES) out.push(TOTAL_FRAMES);
  return out;
}

/* ═══════════════════════════════════════════════════════════
   Chapters — each one owns a slice of the sequence
   ═══════════════════════════════════════════════════════════ */

type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  accent?: string;
  body: string;
  chips?: string[];
  /** Inclusive 1-based frame range this chapter plays through. */
  from: number;
  to: number;
  cta?: "primary" | "closing";
  /** The sequence ends on an empty backdrop; this chapter hands the stage to
      the wordmark instead of running another block of copy. */
  outro?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    id: "joy",
    eyebrow: "Moduk & Co · Mumbai",
    title: "Pure joy,",
    accent: "made by hand.",
    body: "Ukadiche modaks steamed fresh every morning and delivered warm to your door — the way they were always meant to arrive.",
    from: 1,
    to: 28,
    cta: "primary",
  },
  {
    id: "offering",
    eyebrow: "The offering",
    title: "Made first",
    accent: "for Bappa.",
    body: "The ukadiche modak is what Ganpati is offered before anyone else eats. We make it the way that tradition asks for — and no faster.",
    chips: ["Rice flour", "No moulds"],
    from: 29,
    to: 58,
  },
  {
    id: "filling",
    eyebrow: "The filling",
    title: "Coconut and jaggery,",
    accent: "nothing else.",
    body: "Whole coconuts grated the same morning, folded through slow-melted jaggery with cardamom and a thread of saffron. No sugar, no preservatives.",
    chips: ["Fresh coconut", "Jaggery, no sugar", "Saffron"],
    from: 59,
    to: 84,
  },
  {
    id: "steam",
    eyebrow: "The finish",
    title: "Pleated by thumb,",
    accent: "steamed, never fried.",
    body: "Every shell is gathered into petals and drawn up to a single peak, then given minutes over steam and boxed while it is still warm.",
    chips: ["Hand-pleated", "Steamed"],
    from: 85,
    to: 104,
  },
  {
    id: "delivery",
    eyebrow: "The delivery",
    title: "Home in time",
    accent: "for the aarti.",
    body: "Hand-delivered warm across Mumbai and Navi Mumbai, in the slot you pick.",
    chips: ["Same-day slots", "Delivered warm"],
    from: 105,
    to: 115,
    cta: "closing",
    outro: true,
  },
];

/* ═══════════════════════════════════════════════════════════
   Maths helpers
   ═══════════════════════════════════════════════════════════ */

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Progress through [a, b], clamped to 0..1. */
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Where each chapter sits in its own scroll span: the sequence plays across the
 * first 62% and then *holds* on the closing frame. The hold is the whole point —
 * it parks the animation on the chapter's best frame while the copy is readable.
 */
const PLAY_SPAN = 0.62;

/** Height of the sticky navbar the pinned stage parks beneath (Tailwind h-16). */
const STICKY_TOP = 64;

/* ═══════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════ */

type Mode = "booting" | "sequence" | "static";

export default function ScrollStoryHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const outroArtRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("booting");
  const [progressPct, setProgressPct] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  /* ── Mutable render state (never triggers a re-render) ──── */
  const framesRef = useRef<number[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentIndexRef = useRef(0);
  const drawnIndexRef = useRef(-1);
  /** Scratch canvas holding the averaged backdrop edge (see paint). */
  const edgeRef = useRef<HTMLCanvasElement | null>(null);
  /** `fit` is cover on phones (the frame owns the whole stage) and contain on
      desktop, where the column is far shorter than the frame is tall — contain
      shows the subject whole and lets the stage gradient, which is the same
      backdrop, fill what is left over. shiftX/shiftY are fractions of the
      canvas box and only apply under cover. */
  const layoutRef = useRef<{
    fit: "cover" | "contain";
    zoom: number;
    shiftX: number;
    shiftY: number;
    dpr: number;
  }>({ fit: "cover", zoom: 1.01, shiftX: 0, shiftY: 0, dpr: 1 });

  /* ── Draw one frame, cover-fit, subject biased to the right ── */
  const paint = useCallback((listIndex: number, force = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Walk outward for the closest frame that has actually decoded, so an
    // in-flight download never leaves a blank stage.
    const images = imagesRef.current;
    let found = -1;
    for (let d = 0; d < images.length; d++) {
      const a = listIndex - d;
      const b = listIndex + d;
      if (a >= 0 && images[a]?.complete) { found = a; break; }
      if (b < images.length && images[b]?.complete) { found = b; break; }
    }
    if (found < 0) return;
    if (found === drawnIndexRef.current && !force) return;

    const img = images[found]!;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx || !img.naturalWidth) return;

    // The source is 1280×720 and the desktop column asks for roughly twice that,
    // so the resampler is doing real work on every frame — the browser default
    // ("low") is what makes an upscaled sequence read as soft.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { fit, zoom, shiftX, shiftY, dpr } = layoutRef.current;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;

    const contain = fit === "contain";
    const ratio = contain
      ? Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
      : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const scale = ratio * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    // Contain: flush to the column's left edge, centred vertically — the gap it
    // leaves is stage gradient, which is this frame's own backdrop.
    // Cover: centre, then slide, clamped so no edge of the frame is exposed.
    const dx = contain
      ? 0
      : Math.min(0, Math.max(cw - dw, (cw - dw) / 2 + shiftX * cw));
    const dy = contain
      ? (ch - dh) / 2
      : Math.min(0, Math.max(ch - dh, (ch - dh) / 2 + shiftY * ch));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    // Continue the backdrop past the frame by stretching its own right-hand
    // edge across the rest of the canvas. The subject never reaches that
    // column, so this is pure cloth — and because it is the frame's actual
    // pixels, the hand-off to the stage gradient has no colour step in it.
    // A gradient alone could never match: the backdrop is lit in two
    // dimensions and a CSS gradient only varies in one.
    // Only the last two columns: the trunk comes within ~10px of the right edge
    // at the midpoint of the sequence, and those two stay pure cloth in every
    // frame. They are averaged down into a 1×96 strip first — stretching raw
    // JPEG pixels several hundred px wide turns their per-row noise into
    // visible horizontal streaks; resampling them small kills that.
    const gap = cw - (dx + dw);
    if (gap > 0.5) {
      let edge = edgeRef.current;
      if (!edge) {
        edge = document.createElement("canvas");
        edge.width = 1;
        edge.height = 96;
        edgeRef.current = edge;
      }
      const ectx = edge.getContext("2d");
      if (ectx) {
        ectx.imageSmoothingEnabled = true;
        ectx.imageSmoothingQuality = "high";
        ectx.clearRect(0, 0, 1, 96);
        ectx.drawImage(img, img.naturalWidth - 2, 0, 2, img.naturalHeight, 0, 0, 1, 96);
        ctx.drawImage(edge, 0, 0, 1, 96, dx + dw - 1, dy, gap + 1, dh);
      }
    }

    drawnIndexRef.current = found;
  }, []);

  /* ── Size the canvas to its box, at device resolution ───── */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const desktop = window.innerWidth >= 1024;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Phones give the portrait frame a portrait screen, so cover-fit wastes
    // almost nothing. The desktop column is far shorter than the frame is tall,
    // and cover there cut the modak off at the knees — contain shows it whole
    // and hands the leftover space back to the stage gradient.
    layoutRef.current = desktop
      ? { fit: "contain", zoom: 1, shiftX: 0, shiftY: 0, dpr }
      : { fit: "cover", zoom: 1.01, shiftX: 0, shiftY: 0, dpr };

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    paint(drawnIndexRef.current >= 0 ? drawnIndexRef.current : 0, true);
  }, [paint]);

  /* ── Load the sequence, coarse-to-fine ──────────────────── */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("static");
      return;
    }

    const stride = window.innerWidth < 768 ? 2 : 1;
    const frames = buildFrameList(stride);
    framesRef.current = frames;
    imagesRef.current = new Array(frames.length).fill(null);

    let cancelled = false;
    let settled = 0;

    // Four passes: every 8th, then 4th, 2nd, and finally the rest. Each pass
    // sharpens the whole timeline rather than filling it left to right, so an
    // early scroll still lands on something close to the right frame.
    const order: number[] = [];
    const taken = new Set<number>();
    const pass = (step: number) => {
      for (let i = 0; i < frames.length; i += step) {
        if (!taken.has(i)) { taken.add(i); order.push(i); }
      }
    };
    pass(8);
    pass(4);
    // The first two passes are enough to light the stage and scrub roughly.
    // Everything after them is ~6 MB of in-between frames, so it waits for the
    // page's load event rather than racing the fonts, the product photography
    // and the first paint for bandwidth. A fast scroll into a not-yet-loaded
    // gap still paints — `paint` walks outward to the nearest decoded frame.
    const eagerCount = order.length;
    pass(2);
    pass(1);

    const coarseCount = Math.ceil(frames.length / 8);
    let coarseDone = 0;
    let cursor = 0;
    const CONCURRENCY = 6;

    let tailOpen = false;

    const pump = () => {
      while (cursor < order.length) {
        // Hold at the wave boundary until the page has finished loading.
        if (cursor >= eagerCount && !tailOpen) return;
        const slot = order[cursor++];
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(frames[slot]);
        imagesRef.current[slot] = img;

        const done = () => {
          if (cancelled) return;
          settled++;
          // Throttled — this is the only thing in the loader that re-renders.
          if (settled % 4 === 0 || settled === frames.length) {
            setProgressPct(Math.round((settled / frames.length) * 100));
          }
          if (settled <= coarseCount) {
            coarseDone++;
            if (coarseDone >= coarseCount) setMode("sequence");
          }
          // Repaint if this frame is a better match than what's on screen.
          paint(currentIndexRef.current);
          next();
        };

        if (img.complete) { done(); }
        else { img.onload = done; img.onerror = done; }
        return;
      }
      // Everything queued — make sure we un-gate even on a short sequence.
      if (settled >= Math.min(coarseCount, frames.length)) setMode("sequence");
    };

    let inFlight = 0;
    const next = () => {
      inFlight--;
      if (!cancelled && inFlight < CONCURRENCY) { inFlight++; pump(); }
    };
    for (let i = 0; i < CONCURRENCY; i++) { inFlight++; pump(); }

    // Release the in-between frames once the page has loaded — or after three
    // seconds, so a page that never fires `load` (a stalled third-party script,
    // say) still ends up with a complete sequence.
    const openTail = () => {
      if (tailOpen || cancelled) return;
      tailOpen = true;
      inFlight = 0;
      for (let i = 0; i < CONCURRENCY; i++) { inFlight++; pump(); }
    };
    const tailTimer = window.setTimeout(openTail, 3000);
    if (document.readyState === "complete") openTail();
    else window.addEventListener("load", openTail, { once: true });

    // Safety net: if the network stalls, show the stage anyway.
    const failsafe = window.setTimeout(() => !cancelled && setMode("sequence"), 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      window.clearTimeout(tailTimer);
      window.removeEventListener("load", openTail);
      imagesRef.current.forEach((img) => { if (img) { img.onload = null; img.onerror = null; } });
    };
  }, [paint]);

  /* ── Scroll driver ──────────────────────────────────────── */
  useEffect(() => {
    if (mode !== "sequence") return;

    resize();
    window.addEventListener("resize", resize);

    const frames = framesRef.current;
    const n = CHAPTERS.length;
    let raf = 0;
    let smoothed = -1; // -1 = not primed yet
    let lastActive = -1;

    const tick = () => {
      const section = sectionRef.current;
      const panel = panelRef.current;
      if (!section || !panel) { raf = requestAnimationFrame(tick); return; }

      /* The panel pins at STICKY_TOP and unpins when the section runs out, so
         progress is measured against the section's own rect rather than
         window.innerHeight — which drifts on mobile as the URL bar hides. */
      const rect = section.getBoundingClientRect();
      const travel = rect.height - panel.offsetHeight;
      const p = travel > 0 ? clamp((STICKY_TOP - rect.top) / travel) : 0;

      /* Which chapter, and how far into it */
      const scaled = p * n;
      const index = Math.min(n - 1, Math.floor(scaled));
      const local = clamp(scaled - index);
      const chapter = CHAPTERS[index];

      /* Frame target: play across PLAY_SPAN, then hold */
      const played = easeInOutSine(clamp(local / PLAY_SPAN));
      const absFrame = chapter.from + (chapter.to - chapter.from) * played;

      // Absolute frame number → nearest slot in the (possibly thinned) list.
      const targetSlot = clamp(
        Math.round(((absFrame - 1) / (TOTAL_FRAMES - 1)) * (frames.length - 1)),
        0,
        frames.length - 1
      );

      // Extra damping on top of Lenis so fast flicks still read as motion.
      // First tick snaps, so a reload part-way down doesn't play a catch-up reel.
      if (smoothed < 0) smoothed = targetSlot;
      else smoothed += (targetSlot - smoothed) * 0.22;
      const slot = Math.round(smoothed);
      currentIndexRef.current = slot;
      paint(slot);

      /* Copy: the chapter rises in from below, holds, then lifts away as the
         next one takes over. The wrapper only publishes two numbers — how far
         in it is (--p) and how far off its resting line (--y); the per-line
         stagger that makes it read as a sentence assembling is CSS. */
      for (let i = 0; i < n; i++) {
        const el = chapterRefs.current[i];
        if (!el) continue;
        let p = 0;
        let y = 52;

        if (i === index) {
          const enter = i === 0 ? 1 : range(local, 0.03, 0.30);
          const exit = 1 - range(local, 0.78, 0.96);
          p = enter * exit;
          y = (1 - enter) * 52 - (1 - exit) * 46;
        }

        el.style.setProperty("--p", p.toFixed(3));
        el.style.setProperty("--y", `${y.toFixed(2)}px`);
        el.style.visibility = p < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = p > 0.6 ? "auto" : "none";
      }

      /* Outro. The sequence ends on an empty backdrop, so the last chapter
         hands over in three overlapping beats rather than all at once: the
         canvas dissolves, the gift box settles into the space it leaves, and
         the wordmark comes up beside it. All three are scroll-driven, so
         scrubbing backwards runs the hand-over in reverse. */
      const last = index === n - 1;
      const frameOut = last ? easeInOutSine(range(local, 0.12, 0.40)) : 0;
      const artIn = last ? easeInOutSine(range(local, 0.28, 0.60)) : 0;
      const wordIn = last ? easeInOutSine(range(local, 0.38, 0.72)) : 0;

      if (mediaRef.current) {
        mediaRef.current.style.opacity = (1 - frameOut).toFixed(3);
      }
      if (outroArtRef.current) {
        outroArtRef.current.style.setProperty("--p", artIn.toFixed(3));
        outroArtRef.current.style.setProperty("--y", `${((1 - artIn) * 56).toFixed(2)}px`);
        outroArtRef.current.style.visibility = artIn < 0.01 ? "hidden" : "visible";
      }
      if (outroRef.current) {
        outroRef.current.style.setProperty("--p", wordIn.toFixed(3));
        outroRef.current.style.setProperty("--y", `${((1 - wordIn) * 44).toFixed(2)}px`);
        outroRef.current.style.visibility = wordIn < 0.01 ? "hidden" : "visible";
        outroRef.current.style.pointerEvents = wordIn > 0.6 ? "auto" : "none";
      }

      if (index !== lastActive) {
        lastActive = index;
        setActiveChapter(index);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [mode, paint, resize]);

  /* ═══════════════════════════════════════════════════════
     Reduced-motion / no-JS-sequence fallback: the same story,
     told as a plain stack of sections.
     ═══════════════════════════════════════════════════════ */
  if (mode === "static") {
    return (
      <section
        className="story-stage-bg w-full"
        aria-label="How a Moduk & Co modak is made"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          {/* The opening beat, paired with the product rather than a still from
              the sequence — one frame of it out of context is just a dark
              rectangle at this size. */}
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <StaticCopy chapter={CHAPTERS[0]} />
            <NextImage
              src="/images/moduk-gift-box.png"
              alt="A Moduk & Co gift box of six handmade modaks, tied with a ribbon"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="h-auto w-full max-w-lg justify-self-center drop-shadow-[0_28px_36px_rgba(18,10,4,0.5)]"
              priority
            />
          </div>

          <div className="mt-20 grid gap-x-12 gap-y-14 md:grid-cols-2">
            {CHAPTERS.filter((c) => !c.outro)
              .slice(1)
              .map((c) => (
                <StaticCopy key={c.id} chapter={c} compact />
              ))}
          </div>

          {/* Same closing lockup the scrolling version ends on. Outside a
              .story-chapter wrapper, so none of the scroll-driven transforms
              apply and it simply renders. */}
          <div className="mt-24 border-t border-cream/10 pt-14">
            <Outro />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      aria-label="How a Moduk & Co modak is made"
      className="story-stage-bg relative w-full"
      style={{ height: `calc(${CHAPTERS.length} * var(--story-chapter-vh))` }}
    >
      {/* ── Pinned stage ─────────────────────────────────── */}
      <div ref={panelRef} className="story-stage-panel sticky top-16 h-[calc(100svh-4rem)] w-full overflow-hidden">
        {/* Frame sequence. The footage is a portrait studio shot on a brown
            backdrop, and the stage behind it is a gradient sampled from that
            same backdrop — so the frame has no visible edge. It takes a
            left-hand column on desktop and the whole stage on phones. */}
        <div ref={mediaRef} className="story-media">
          <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
          <div className="story-media-veil" aria-hidden="true" />

          {/* Loading shade — the backdrop's own darkest tone, so the boot
              state is just an unlit stage rather than a grey box. */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#2C1E13] transition-opacity duration-700"
            style={{ opacity: mode === "booting" ? 1 : 0 }}
            aria-hidden={mode !== "booting"}
          >
            <span className="font-playfair text-sm tracking-[0.3em] text-cream/40">
              {progressPct}%
            </span>
          </div>
        </div>

        <div className="story-grain absolute inset-0" aria-hidden="true" />

        {/* ── Chapter copy ──────────────────────────────── */}
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-20 lg:items-center lg:px-10 lg:pb-0">
          {/* Stacked chapters — every one occupies the same grid cell, so the
              column is always as tall as the longest chapter and nothing jumps. */}
          <div className="grid w-full lg:ml-auto lg:w-[44%] lg:max-w-lg">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => { chapterRefs.current[i] = el; }}
                className="story-chapter col-start-1 row-start-1"
                style={
                  {
                    "--p": i === 0 ? 1 : 0,
                    "--y": "0px",
                    visibility: i === 0 ? "visible" : "hidden",
                  } as React.CSSProperties
                }
              >
                {c.outro ? null : <ChapterBody chapter={c} lead={i === 0} />}
              </div>
            ))}
          </div>

          {/* The box that arrives once the frame has emptied — it lands in the
              column the sequence just vacated, so the stage never goes bare. */}
          <div
            ref={outroArtRef}
            className="story-outro-art"
            style={{ "--p": 0, "--y": "56px", visibility: "hidden" } as React.CSSProperties}
          >
            <div className="story-outro-art-float">
              <NextImage
                src="/images/moduk-gift-box.png"
                alt="A Moduk & Co gift box of six handmade modaks, tied with a ribbon"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 42vw, 88vw"
                className="h-auto max-h-full w-auto max-w-full object-contain"
              />
            </div>
          </div>

          {/* Closing wordmark. Lives outside the copy column because it owns the
              whole stage once the frame has emptied. */}
          <div
            ref={outroRef}
            className="story-chapter story-outro pointer-events-none absolute bottom-20 left-6 right-6 lg:bottom-auto lg:left-auto lg:right-10 lg:top-1/2 lg:w-[44%] lg:max-w-lg lg:-translate-y-1/2"
            style={{ "--p": 0, "--y": "44px", visibility: "hidden" } as React.CSSProperties}
          >
            <Outro />
          </div>

          {/* Where you are in the story. Deliberately just numerals — a filling
              track next to five dots reads as a loading bar, not a chapter.
              Bottom-left, because bottom-right is where the chat widget lives. */}
          <div
            className="story-count pointer-events-none absolute bottom-8 left-6 font-playfair text-[13px] tracking-[0.18em] text-cream/35 lg:left-10"
            aria-hidden="true"
          >
            <span className="text-cream/80">{String(activeChapter + 1).padStart(2, "0")}</span>
            {" ⁄ "}
            {String(CHAPTERS.length).padStart(2, "0")}
          </div>

        </div>


      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Chapter copy
   ═══════════════════════════════════════════════════════════ */

function ChapterBody({ chapter, lead }: { chapter: Chapter; lead?: boolean }) {
  // Only the opening chapter is the page's h1; the rest are section headings,
  // otherwise the page ships one h1 per chapter.
  const Heading = lead ? "h1" : "h2";
  // data-line + --i drive the stagger: each line trails the one above it, so
  // the block assembles from the bottom rather than arriving in one slab.
  const line = (i: number) => ({ "--i": i, "--m": 1 + i * 0.16 } as React.CSSProperties);
  return (
    <div>
      <span
        data-line
        style={line(0)}
        className="inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/55"
      >
        {chapter.eyebrow}
      </span>

      <Heading
        data-line
        style={line(1)}
        className="mt-4 font-playfair text-4xl font-bold leading-[1.02] tracking-tight text-cream sm:text-5xl lg:text-[3.5rem]"
      >
        {chapter.title}
        {chapter.accent && (
          <>
            <br />
            <span className="italic text-pink">{chapter.accent}</span>
          </>
        )}
      </Heading>

      <p
        data-line
        style={line(2)}
        className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/70 md:text-base"
      >
        {chapter.body}
      </p>

      {chapter.chips && (
        <div data-line style={line(3)} className="mt-6 flex flex-wrap gap-2">
          {chapter.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 text-[11px] font-semibold text-cream/75 backdrop-blur-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {chapter.cta && (
        <div data-line style={line(4)} className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/shop" passHref>
            <Button size="lg" className="group px-8 py-5 text-sm shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.03]">
              {chapter.cta === "primary" ? "Order Now" : "Order a box"}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link
            href={chapter.cta === "primary" ? "/shop" : "/delivery"}
            className="text-sm font-medium text-cream/60 underline-offset-4 transition-colors hover:text-pink hover:underline"
          >
            {chapter.cta === "primary" ? "View the menu →" : "Check delivery areas →"}
          </Link>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Closing wordmark
   ═══════════════════════════════════════════════════════════ */

function Outro() {
  const line = (i: number) => ({ "--i": i, "--m": 1 + i * 0.16 } as React.CSSProperties);
  return (
    <div>
      <h2
        data-line
        style={line(0)}
        className="font-playfair text-[clamp(2.35rem,4.4vw,3.5rem)] font-bold uppercase leading-[0.98] tracking-[0.1em] text-cream"
      >
        Moduk <span className="italic tracking-normal text-pink">&amp;</span> Co
      </h2>

      <div data-line style={line(1)} className="story-flourish" aria-hidden="true">
        <svg viewBox="0 0 10 10" className="h-2 w-2 shrink-0 fill-pink">
          <path d="M5 0 L10 5 L5 10 L0 5 Z" />
        </svg>
        <span />
      </div>

      <p
        data-line
        style={line(2)}
        className="font-playfair text-[clamp(1.05rem,1.6vw,1.35rem)] italic leading-relaxed text-cream/80"
      >
        Pure joy. Made at home.
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>
        Delivered to yours.
      </p>

      <p
        data-line
        style={line(3)}
        className="mt-5 max-w-sm text-[13px] leading-relaxed text-cream/50"
      >
        Hand-delivered warm across Mumbai and Navi Mumbai, in the slot you pick.
      </p>

      <div data-line style={line(4)} className="mt-9 flex flex-wrap items-center gap-4">
        <Link href="/shop" passHref>
          <Button size="lg" className="group px-8 py-5 text-sm shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.03]">
            Order a box
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link
          href="/delivery"
          className="text-sm font-medium text-cream/60 underline-offset-4 transition-colors hover:text-pink hover:underline"
        >
          Check delivery areas →
        </Link>
      </div>
    </div>
  );
}

function StaticCopy({ chapter, compact }: { chapter: Chapter; compact?: boolean }) {
  const Heading = compact ? "h2" : "h1";
  return (
    <div className={compact ? "border-l-2 border-pink/30 pl-5" : ""}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cream/55">
        {chapter.eyebrow}
      </span>
      <Heading className={`mt-3 font-playfair font-bold leading-tight text-cream ${compact ? "text-2xl" : "text-4xl lg:text-5xl"}`}>
        {chapter.title} {chapter.accent && <span className="italic text-pink">{chapter.accent}</span>}
      </Heading>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-cream/70">{chapter.body}</p>
      {chapter.chips && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chapter.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-cream/15 bg-cream/[0.06] px-3 py-1.5 text-[11px] font-semibold text-cream/75"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
      {!compact && (
        <Link href="/shop" passHref>
          <Button size="lg" className="mt-6 px-8 py-5 text-sm">Order Now</Button>
        </Link>
      )}
    </div>
  );
}
