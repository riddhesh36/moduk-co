"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════════════════════════
   Frame sequence
   ═══════════════════════════════════════════════════════════ */

const TOTAL_FRAMES = 200;

const frameSrc = (n: number) =>
  `/animation-frames/ezgif-frame-${String(n).padStart(3, "0")}.jpg`;

/**
 * Full sequence on desktop; every 3rd frame on phones. 200 decoded 1920×1080
 * bitmaps is well past what a mid-range phone will hold, and at phone scroll
 * lengths the thinned sequence is indistinguishable.
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
  step: string;
  eyebrow: string;
  title: string;
  accent?: string;
  body: string;
  chips?: string[];
  /** Inclusive 1-based frame range this chapter plays through. */
  from: number;
  to: number;
  cta?: "primary" | "closing";
};

const CHAPTERS: Chapter[] = [
  {
    id: "joy",
    step: "",
    eyebrow: "Moduk & Co · Mumbai",
    title: "Pure joy,",
    accent: "made by hand.",
    body: "Ukadiche modaks steamed fresh every morning and delivered warm to your door — the way they were always meant to arrive.",
    from: 1,
    to: 32,
    cta: "primary",
  },
  {
    id: "rice",
    step: "01",
    eyebrow: "The dough",
    title: "It begins",
    accent: "with rice.",
    body: "Fine rice flour, scalded and kneaded while still hot, then pressed out by hand into shells thin enough to see light through.",
    chips: ["Rice flour", "No moulds"],
    from: 33,
    to: 58,
  },
  {
    id: "coconut",
    step: "02",
    eyebrow: "The filling",
    title: "Coconut,",
    accent: "grated that morning.",
    body: "Whole coconuts cracked and grated the same day they're used. Never desiccated, never out of a packet.",
    chips: ["Fresh coconut", "Same-day"],
    from: 59,
    to: 86,
  },
  {
    id: "jaggery",
    step: "03",
    eyebrow: "The sweetness",
    title: "Golden jaggery.",
    accent: "No sugar.",
    body: "Slow-melted jaggery folded through the coconut with cardamom and a thread of saffron, cooked down until it holds together on its own.",
    chips: ["Jaggery", "Cardamom", "Saffron"],
    from: 87,
    to: 118,
  },
  {
    id: "pleat",
    step: "04",
    eyebrow: "The fold",
    title: "Pleated and sealed",
    accent: "by thumb.",
    body: "Every shell is gathered into petals and drawn up to a single peak. It's the part that takes years to learn, and the part we refuse to shortcut.",
    chips: ["Hand-pleated", "No preservatives"],
    from: 119,
    to: 158,
  },
  {
    id: "steam",
    step: "05",
    eyebrow: "The finish",
    title: "Steamed, then",
    accent: "straight to you.",
    body: "Minutes over steam, boxed while still warm, and hand-delivered across Mumbai and Navi Mumbai in the slot you pick.",
    chips: ["Steamed, never fried", "Delivered warm"],
    from: 159,
    to: 200,
    cta: "closing",
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
  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railFillRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("booting");
  const [progressPct, setProgressPct] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  /* ── Mutable render state (never triggers a re-render) ──── */
  const framesRef = useRef<number[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentIndexRef = useRef(0);
  const drawnIndexRef = useRef(-1);
  /** shiftX/shiftY are fractions of the canvas box: +x slides the subject right,
      -y lifts it. `zoom` oversamples so there is room to slide without exposing
      an edge of the frame. */
  const layoutRef = useRef({ zoom: 1.02, shiftX: 0, shiftY: 0, dpr: 1 });

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

    const { zoom, shiftX, shiftY, dpr } = layoutRef.current;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;

    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    // Centre first, then slide; clamp so we never expose an edge of the frame.
    const dx = Math.min(0, Math.max(cw - dw, (cw - dw) / 2 + shiftX * cw));
    const dy = Math.min(0, Math.max(ch - dh, (ch - dh) / 2 + shiftY * ch));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

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

    // The modak is centred in a 16:9 frame, so it can't be shoved sideways by
    // cropping without also being blown up. Desktop instead hands the canvas its
    // own right-hand column and draws cover-fit inside it — the subject lands
    // right of the copy at its natural size. Phones keep the frame full-bleed
    // and lift the subject above the copy.
    layoutRef.current = desktop
      ? { zoom: 1.02, shiftX: 0, shiftY: 0, dpr }
      : { zoom: 1.3, shiftX: 0, shiftY: -0.13, dpr };

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

    const stride = window.innerWidth < 768 ? 3 : 1;
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
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < frames.length; i += step) {
        if (!taken.has(i)) { taken.add(i); order.push(i); }
      }
    }

    const coarseCount = Math.ceil(frames.length / 8);
    let coarseDone = 0;
    let cursor = 0;
    const CONCURRENCY = 6;

    const pump = () => {
      while (cursor < order.length) {
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

    // Safety net: if the network stalls, show the stage anyway.
    const failsafe = window.setTimeout(() => !cancelled && setMode("sequence"), 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
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

      /* Copy: fade each chapter in early, hold, fade out at the seam */
      for (let i = 0; i < n; i++) {
        const el = chapterRefs.current[i];
        if (!el) continue;
        let opacity = 0;
        let y = 24;

        if (i === index) {
          const enter = i === 0 ? 1 : range(local, 0.04, 0.24);
          const exit = 1 - range(local, 0.82, 0.97);
          opacity = enter * exit;
          y = (1 - enter) * 26 - (1 - exit) * 18;
        }

        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      }

      /* Rail */
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleY(${(index + local) / n})`;
      }
      if (index !== lastActive) {
        lastActive = index;
        railRefs.current.forEach((b, i) => b?.setAttribute("data-active", String(i === index)));
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

  /* ── Rail navigation ────────────────────────────────────── */
  const goToChapter = useCallback((i: number) => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    if (!section || !panel) return;
    const travel = section.offsetHeight - panel.offsetHeight;
    const start = window.scrollY + section.getBoundingClientRect().top - STICKY_TOP;
    const top = start + ((i + 0.42) / CHAPTERS.length) * travel;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top, behavior: "smooth" });
  }, []);

  /* ═══════════════════════════════════════════════════════
     Reduced-motion / no-JS-sequence fallback: the same story,
     told as a plain stack of sections.
     ═══════════════════════════════════════════════════════ */
  if (mode === "static") {
    return (
      <section className="story-stage-bg w-full">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <StaticCopy chapter={CHAPTERS[0]} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frameSrc(200)}
              alt="A freshly steamed ukadiche modak"
              className="w-full rounded-3xl"
              loading="eager"
            />
          </div>
          <div className="mt-20 grid md:grid-cols-2 gap-x-12 gap-y-14">
            {CHAPTERS.slice(1).map((c) => (
              <StaticCopy key={c.id} chapter={c} compact />
            ))}
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
      <div ref={panelRef} className="sticky top-16 h-[calc(100svh-4rem)] w-full overflow-hidden">
        {/* Frame sequence. Anchored to the same max-w-7xl container as the copy
            and then bled out to the right viewport edge, so the gap between the
            two columns holds at any width instead of collapsing on wide screens.
            Its left edge is feathered away in CSS into a stage gradient sampled
            from the frames themselves — hence no visible seam. */}
        <div className="absolute inset-0 mx-auto max-w-7xl">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="story-canvas absolute inset-0 h-full w-full lg:left-[34%] lg:w-auto lg:right-[calc((100%_-_100vw)/2)]"
          />

          {/* Loading shade — covers only the sequence, so the headline is
              readable from the first paint. */}
          <div
            className="story-canvas pointer-events-none absolute inset-0 flex items-center justify-center bg-[#CBC5BB] transition-opacity duration-700 lg:left-[34%] lg:right-[calc((100%_-_100vw)/2)]"
            style={{ opacity: mode === "booting" ? 1 : 0 }}
            aria-hidden={mode !== "booting"}
          >
            <span className="font-playfair text-sm tracking-[0.3em] text-dark/40">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Readability scrim, tinted with the sequence's own background colour */}
        <div className="story-scrim absolute inset-0" aria-hidden="true" />
        <div className="story-grain absolute inset-0" aria-hidden="true" />

        {/* ── Chapter copy ──────────────────────────────── */}
        <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 pb-16 lg:items-center lg:px-10 lg:pb-0">
          {/* Chapter rail */}
          <div className="absolute left-10 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative flex flex-col gap-5 pl-1">
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-dark/15" aria-hidden="true" />
              <div
                ref={railFillRef}
                className="absolute left-[5px] top-1 bottom-1 w-px origin-top bg-dark/55"
                style={{ transform: "scaleY(0)" }}
                aria-hidden="true"
              />
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  ref={(el) => { railRefs.current[i] = el; }}
                  type="button"
                  onClick={() => goToChapter(i)}
                  data-active={i === activeChapter}
                  aria-current={i === activeChapter ? "step" : undefined}
                  className="story-rail-dot group relative flex items-center gap-3"
                >
                  <span className="story-rail-mark" />
                  <span className="story-rail-label">{c.step || "00"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stacked chapters — every one occupies the same grid cell, so the
              column is always as tall as the longest chapter and nothing jumps. */}
          <div className="grid w-full lg:ml-14 lg:w-[34%] lg:max-w-md">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => { chapterRefs.current[i] = el; }}
                className="col-start-1 row-start-1 will-change-[opacity,transform]"
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              >
                <ChapterBody chapter={c} lead={i === 0} />
              </div>
            ))}
          </div>

          {/* Scroll cue — sits under the copy, and only in the opening chapter */}
          <div
            className="pointer-events-none absolute bottom-8 left-10 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-dark/45 transition-opacity duration-500 lg:flex"
            style={{ opacity: activeChapter === 0 ? 1 : 0 }}
          >
            Scroll <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
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
  // otherwise the page ships six competing h1s.
  const Heading = lead ? "h1" : "h2";
  return (
    <div>
      <span className="inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-dark/50">
        {chapter.step && (
          <span className="font-playfair text-[11px] tracking-normal text-rose">{chapter.step}</span>
        )}
        {chapter.eyebrow}
      </span>

      <Heading className="mt-4 font-playfair text-4xl font-bold leading-[1.02] tracking-tight text-dark sm:text-5xl lg:text-[3.7rem]">
        {chapter.title}
        {chapter.accent && (
          <>
            <br />
            <span className="italic text-rose">{chapter.accent}</span>
          </>
        )}
      </Heading>

      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-dark/65 md:text-base">
        {chapter.body}
      </p>

      {chapter.chips && (
        <div className="mt-6 flex flex-wrap gap-2">
          {chapter.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-dark/12 bg-white/45 px-3 py-1.5 text-[11px] font-semibold text-dark/70 backdrop-blur-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {chapter.cta && (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/shop" passHref>
            <Button size="lg" className="group px-8 py-5 text-sm shadow-xl shadow-rose/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-rose/40">
              {chapter.cta === "primary" ? "Order Now" : "Order a box"}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link
            href={chapter.cta === "primary" ? "/shop" : "/delivery"}
            className="text-sm font-medium text-dark/55 underline-offset-4 transition-colors hover:text-rose hover:underline"
          >
            {chapter.cta === "primary" ? "View the menu →" : "Check delivery areas →"}
          </Link>
        </div>
      )}
    </div>
  );
}

function StaticCopy({ chapter, compact }: { chapter: Chapter; compact?: boolean }) {
  const Heading = compact ? "h2" : "h1";
  return (
    <div className={compact ? "border-l-2 border-rose/30 pl-5" : ""}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-dark/50">
        {chapter.step ? `${chapter.step} · ` : ""}{chapter.eyebrow}
      </span>
      <Heading className={`mt-3 font-playfair font-bold leading-tight text-dark ${compact ? "text-2xl" : "text-4xl lg:text-5xl"}`}>
        {chapter.title} {chapter.accent && <span className="italic text-rose">{chapter.accent}</span>}
      </Heading>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-dark/65">{chapter.body}</p>
      {!compact && (
        <Link href="/shop" passHref>
          <Button size="lg" className="mt-6 px-8 py-5 text-sm">Order Now</Button>
        </Link>
      )}
    </div>
  );
}
