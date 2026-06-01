"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

function InstagramIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface Review {
  title: string;
  name: string;
  handle: string;
  text: string;
  source: string;
  date: string;
  initials: string;
  bgGradient: string; // for the avatar initials bubble
  textColor: string;
}

const REVIEWS: Review[] = [
  {
    title: "Too Yummy! 🌟",
    name: "Sarvesh S.",
    handle: "@sarveshhh__s",
    text: "Got these amazing modaks and trust me, they are too yummy! Beautiful packaging, perfect texture, and absolutely delicious taste. Highly recommended! 🌟",
    source: "Instagram Story",
    date: "2024 year",
    initials: "SS",
    bgGradient: "from-rose-100 to-pink-200 text-rose-700",
    textColor: "text-rose-600",
  },
  {
    title: "Absolutely Loved Them",
    name: "Omkar",
    handle: "Omkar M.",
    text: "The modaks were really wonderful—everyone absolutely loved them! They are also perfect to pack and carry along when traveling out to Konkan.",
    source: "WhatsApp Chat",
    date: "2024 year",
    initials: "OM",
    bgGradient: "from-emerald-100 to-teal-200 text-emerald-800",
    textColor: "text-emerald-600",
  },
  {
    title: "Melt-in-the-Mouth",
    name: "Piyush & Shreya",
    handle: "@piyushjadhav412",
    text: "Fresh, soft, and super delicious modaks. Every bite was a melt-in-the-mouth flavor—absolutely loved them!",
    source: "Instagram DM",
    date: "2024 year",
    initials: "PS",
    bgGradient: "from-amber-100 to-orange-200 text-amber-800",
    textColor: "text-amber-600",
  },
  {
    title: "Mango Modak is THE BEST! 🥭",
    name: "Poorvi I.",
    handle: "@_poorvi.i",
    text: "We truly enjoyed them, and the mango modak was THE BEST! My brother loved it a lot and so did my mom. I'll definitely be ordering another batch soon! 🥭✨",
    source: "WhatsApp Chat",
    date: "2024 year",
    initials: "PI",
    bgGradient: "from-yellow-100 to-amber-200 text-amber-800",
    textColor: "text-amber-600",
  },
  {
    title: "Just Amazing!",
    name: "Pranav M.",
    handle: "@prxnxv_1306",
    text: "Tried these modaks and they were just amazing! Each one was delicious, but the mango modak truly stole the show. Big shoutout for delivering such fresh and flavorful treats!",
    source: "Instagram Story",
    date: "2024 year",
    initials: "PM",
    bgGradient: "from-sky-100 to-blue-200 text-sky-800",
    textColor: "text-sky-600",
  },
  {
    title: "Melt In Your Mouth",
    name: "Pim Pom Photography",
    handle: "@pimpomphotography5",
    text: "They taste wonderful and completely melt in your mouth the moment you eat them. I absolutely love the tagline—it truly stays true to its word! ❤️",
    source: "Instagram Story",
    date: "2024 year",
    initials: "PP",
    bgGradient: "from-pink-100 to-rose-200 text-pink-700",
    textColor: "text-pink-600",
  },
  {
    title: "Best Stuff Ever! 10/10",
    name: "Abhilash Mudadi",
    handle: "@abhilashmudadi",
    text: "Modaks should be in season 365 days a year! Got the absolute best stuff from here. 10/10 🌟",
    source: "Instagram Story",
    date: "2024 year",
    initials: "AM",
    bgGradient: "from-violet-100 to-purple-200 text-violet-800",
    textColor: "text-violet-600",
  },
  {
    title: "One of the Best! 🔥",
    name: "Manool Thakur",
    handle: "@manoolthakur",
    text: "One of the best modaks you can order! 🔥",
    source: "Instagram Story",
    date: "2024 year",
    initials: "MT",
    bgGradient: "from-fuchsia-100 to-pink-200 text-fuchsia-800",
    textColor: "text-fuchsia-600",
  },
  {
    title: "Highly Special Celebrations 🙏",
    name: "Aniket Badekar",
    handle: "@aniketbadekar4699",
    text: "Thank you so much for making our Angarki Sankashti Chaturthi celebrations so incredibly special with these treats! 🙏✨",
    source: "Instagram Story",
    date: "2024 year",
    initials: "AB",
    bgGradient: "from-orange-100 to-amber-200 text-orange-800",
    textColor: "text-orange-600",
  },
  {
    title: "Whole Family Loved It!",
    name: "Vishakha & Avinash",
    handle: "Avinash M.",
    text: "We absolutely love your modaks! The whole family was there together to enjoy them, and everyone was incredibly happy.",
    source: "Instagram DM",
    date: "2024 year",
    initials: "VA",
    bgGradient: "from-cyan-100 to-sky-200 text-cyan-800",
    textColor: "text-cyan-600",
  },
];

export default function Testimonials3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Track window resizing for responsive offsets
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  
  // Responsive spacing between card centers
  const spacing = isMobile ? 220 : isTablet ? 300 : 370;

  // Autoplay functionality
  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  // Helper to calculate circular shortest distance
  const getCircularDistance = (index: number, currentActive: number, total: number) => {
    let diff = index - currentActive;
    while (diff < -total / 2) diff += total;
    while (diff > total / 2) diff -= total;
    return diff;
  };

  return (
    <section 
      className="py-20 md:py-28 bg-cream/30 overflow-hidden border-t border-dark/5 flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-dark tracking-tight">
          What our clients say
        </h2>
        <p className="mt-4 text-text-muted max-w-md mx-auto text-sm md:text-base">
          Here is what our lovely community has to say about our handcrafted modaks.
        </p>
      </div>

      {/* CAROUSEL VIEWPORT */}
      <div className="relative w-full h-[400px] md:h-[440px] flex items-center justify-center overflow-visible">
        <motion.div
          className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            const swipeThreshold = 55;
            if (info.offset.x < -swipeThreshold) {
              handleNext();
            } else if (info.offset.x > swipeThreshold) {
              handlePrev();
            }
          }}
        >
          {REVIEWS.map((review, idx) => {
            const distance = getCircularDistance(idx, activeIndex, REVIEWS.length);
            const absDist = Math.abs(distance);
            
            // Render only cards that are close to the center to prevent clutter
            const isVisible = absDist <= (isMobile ? 1 : 2);
            
            // Curved arrangement math
            const xVal = distance * spacing;
            const yVal = Math.pow(absDist, 1.8) * (isMobile ? 14 : 20); // arch bend downward on edges
            const scaleVal = 1 - absDist * (isMobile ? 0.08 : 0.06);
            const rotateVal = distance * (isMobile ? 5 : 6);
            const opacityVal = absDist === 0 ? 1 : absDist === 1 ? 0.85 : absDist === 2 ? 0.35 : 0;
            const zIndexVal = 10 - Math.round(absDist);

            return (
              <motion.div
                key={idx}
                className={`absolute w-[280px] sm:w-[320px] md:w-[350px] h-[280px] md:h-[300px] p-6 md:p-8 rounded-[24px] border bg-[#FDFBF9] shadow-[0_10px_35px_rgba(44,26,29,0.03)] flex flex-col justify-between transition-shadow duration-300 ${
                  distance === 0 
                    ? "border-rose/20 shadow-[0_15px_40px_rgba(196,97,122,0.08)]" 
                    : "border-dark/[0.04]"
                }`}
                style={{
                  pointerEvents: distance === 0 ? "auto" : "none",
                }}
                animate={{
                  x: xVal,
                  y: yVal,
                  scale: scaleVal,
                  rotate: rotateVal,
                  opacity: isVisible ? opacityVal : 0,
                  zIndex: zIndexVal,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                }}
                onClick={() => {
                  if (distance !== 0) {
                    setActiveIndex(idx);
                  }
                }}
              >
                {/* Review Content */}
                <div>
                  <h3 className="font-dmsans font-bold text-dark text-base md:text-lg mb-3 tracking-tight">
                    {review.title}
                  </h3>
                  <p className="text-[12px] md:text-sm text-text-muted leading-relaxed font-medium font-dmsans italic line-clamp-5 md:line-clamp-6">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-dark/[0.04]">
                  {/* Initials Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.bgGradient} flex items-center justify-center font-bold text-[13px] tracking-wider shrink-0 shadow-inner`}>
                    {review.initials}
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-dmsans font-bold text-dark text-[13px] md:text-[14px] truncate leading-tight">
                      {review.name}
                    </h4>
                    <p className="text-[10px] md:text-[11px] text-text-muted truncate mt-0.5 flex items-center gap-1 font-medium">
                      {review.handle}
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5">
                        {review.source.toLowerCase().includes("instagram") ? (
                          <InstagramIcon size={9} className="text-rose" />
                        ) : (
                          <MessageCircle size={8} className="text-emerald-500" />
                        )}
                        {review.source}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* CONTROLS (Arrows & Dash Indicators) */}
      <div className="flex flex-col items-center gap-6 mt-8">
        {/* Navigation buttons + Dash indicator container */}
        <div className="flex items-center justify-center gap-6">
          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-dark/15 flex items-center justify-center text-dark/70 hover:border-rose hover:bg-rose/5 hover:text-rose transition-all duration-300 active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dash line indicators */}
          <div className="flex items-center gap-1.5 h-6 px-1">
            {REVIEWS.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    isActive 
                      ? "w-8 bg-rose" 
                      : "w-4 bg-dark/10 hover:bg-dark/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-rose flex items-center justify-center text-rose hover:bg-rose/5 transition-all duration-300 active:scale-95"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
