"use client";

import { Star, MessageCircle } from "lucide-react";

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
  name: string;
  text: string;
  source: string;
  color: string;
  width: string;
  rating: number;
}

const row1: Review[] = [
  {
    name: "@sarveshhh__s",
    text: "Got these amazing modaks and trust me, they are too yummy! Beautiful packaging, perfect texture, and absolutely delicious taste. Highly recommended! 🌟",
    source: "Instagram Story",
    color: "bg-[#FFF2F4] border-[#FDF0F3]", // blush
    width: "w-[320px]",
    rating: 5,
  },
  {
    name: "Omkar",
    text: "The modaks were really wonderful—everyone absolutely loved them! They are also perfect to pack and carry along when traveling out to Konkan.",
    source: "WhatsApp Chat",
    color: "bg-[#F0F7F4] border-[#E2F0E9]", // sage
    width: "w-[360px]",
    rating: 5,
  },
  {
    name: "@piyushjadhav412 & @shreya.t_007",
    text: "Fresh, soft, and super delicious modaks. Every bite was a melt-in-the-mouth flavor—absolutely loved them!",
    source: "Instagram DM",
    color: "bg-[#FCF6EA] border-[#FAF0DD]", // soft gold
    width: "w-[300px]",
    rating: 5,
  },
  {
    name: "@_poorvi.i",
    text: "We truly enjoyed them, and the mango modak was THE BEST! My brother loved it a lot and so did my mom. I'll definitely be ordering another batch soon! 🥭✨",
    source: "WhatsApp Chat",
    color: "bg-[#F5F3F7] border-[#EDE9F0]", // lavender
    width: "w-[380px]",
    rating: 5,
  },
  {
    name: "@prxnxv_1306",
    text: "Tried these modaks and they were just amazing! Each one was delicious, but the mango modak truly stole the show. Big shoutout for delivering such fresh and flavorful treats!",
    source: "Instagram Story",
    color: "bg-[#EBF3F6] border-[#DFECF1]", // pale blue
    width: "w-[410px]",
    rating: 5,
  },
];

const row2: Review[] = [
  {
    name: "@pimpomphotography5",
    text: "They taste wonderful and completely melt in your mouth the moment you eat them. I absolutely love the tagline—it truly stays true to its word! ❤️",
    source: "Instagram Story",
    color: "bg-[#FFF6EE] border-[#FDF0E4]", // warm peach
    width: "w-[360px]",
    rating: 5,
  },
  {
    name: "@abhilashmudadi",
    text: "Modaks should be in season 365 days a year! Got the absolute best stuff from here. 10/10 🌟",
    source: "Instagram Story",
    color: "bg-[#F0F7F4] border-[#E2F0E9]", // soft sage
    width: "w-[300px]",
    rating: 5,
  },
  {
    name: "@manoolthakur",
    text: "One of the best modaks you can order! 🔥",
    source: "Instagram Story",
    color: "bg-[#FFF2F4] border-[#FDF0F3]", // blush
    width: "w-[260px]",
    rating: 5,
  },
  {
    name: "@aniketbadekar4699",
    text: "Thank you so much for making our Angarki Sankashti Chaturthi festival celebrations so incredibly special with these treats! 🙏✨",
    source: "Instagram Story",
    color: "bg-[#FCF6EA] border-[#FAF0DD]", // gold
    width: "w-[380px]",
    rating: 5,
  },
  {
    name: "Vishakha / Avinash M.",
    text: "We absolutely love your modaks! The whole family was there together to enjoy them, and everyone was incredibly happy.",
    source: "Instagram DM",
    color: "bg-[#F5F3F7] border-[#EDE9F0]", // lavender
    width: "w-[390px]",
    rating: 5,
  },
];

export default function TestimonialsMarquee() {
  const renderCard = (review: Review, idx: number) => {
    const isInstagram = review.source.toLowerCase().includes("instagram");
    return (
      <div
        key={idx}
        className={`${review.width} shrink-0 p-5 rounded-2xl border ${review.color} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between mb-3.5">
            {/* Stars */}
            <div className="flex gap-0.5">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={13} className="fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            {/* Source Badge */}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted bg-white/70 px-2 py-0.5 rounded-full border border-dark/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {isInstagram ? <InstagramIcon size={11} className="text-rose" /> : <MessageCircle size={10} className="text-green-600" />}
              {review.source}
            </span>
          </div>
          <p className="text-xs md:text-sm text-dark font-medium leading-relaxed italic">
            &ldquo;{review.text}&rdquo;
          </p>
        </div>
        <div className="mt-4 border-t border-dark/5 pt-3 flex items-center justify-between">
          <span className="text-xs font-bold text-dark">{review.name}</span>
          <span className="text-[10px] font-bold text-rose/70 tracking-wider uppercase">Verified Customer</span>
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 bg-cream/30 overflow-hidden border-t border-dark/5">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-dark">Loved by Modak Lovers</h2>
        <p className="mt-4 text-text-muted max-w-lg mx-auto">Here is what our lovely community has to say about our handcrafted modaks.</p>
      </div>

      <div className="w-full flex flex-col gap-6 pause-on-hover cursor-grab active:cursor-grabbing">
        {/* Track 1: Left scrolling */}
        <div className="w-full overflow-hidden flex">
          <div className="animate-marquee-left flex gap-6">
            {row1.map((rev, i) => renderCard(rev, i))}
            {/* Duplicate for infinite loop */}
            {row1.map((rev, i) => renderCard(rev, i + row1.length))}
          </div>
        </div>

        {/* Track 2: Right scrolling */}
        <div className="w-full overflow-hidden flex">
          <div className="animate-marquee-right flex gap-6">
            {row2.map((rev, i) => renderCard(rev, i))}
            {/* Duplicate for infinite loop */}
            {row2.map((rev, i) => renderCard(rev, i + row2.length))}
          </div>
        </div>
      </div>
    </section>
  );
}
