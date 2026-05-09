import Image from "next/image";
import { Leaf, Heart, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-6">Our Story</h1>
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto">
            Pure joy, made at home. How a family tradition blossomed into Mumbai&apos;s most loved modak kitchen.
          </p>
        </div>

        <div className="w-full aspect-[21/12] bg-blush rounded-2xl overflow-hidden mb-16 relative flex items-center justify-center border border-rose/10">
          <Image src="/images/about-img.png" alt="About" fill className="object-cover" />
          <div className="absolute inset-0 bg-rose/5" />

        </div>

        <div className="prose prose-lg prose-rose prose-p:text-text-body font-dmsans max-w-3xl text-lg leading-relaxed">
          <p className="mb-6">
            Some people start businesses after spotting a <strong>gap in the market</strong>.
          </p>
          <p className="mb-6">
            I started mine after spotting a <strong>gap in my plate</strong> where <strong>better modaks clearly belonged</strong>.
          </p>
          <p className="mb-6">
            Because every time I craved one, it was the same tragic pattern <strong>too dry, too sweet, too artificial</strong>, or somehow achieving all three with remarkable confidence. Some looked beautiful, but one bite later felt like <strong>personal betrayal</strong>.
          </p>
          <p className="mb-6">
            So naturally, I did what any perfectly reasonable girl would do.
          </p>
          <p className="mb-6">
            I decided to <strong>fix modaks myself</strong>.
          </p>
          <p className="mb-6">
            What began as <strong>one craving and a little kitchen chaos</strong> soon turned into endless batches, flour-covered counters, recipe experiments, and loved ones who supported me through every step of it.
          </p>
          <p className="mb-6">
            They believed in me, encouraged me, and very generously offered to <strong>&quot;taste just one&quot; six times in a row</strong>.
          </p>
          <p className="mb-6">
            With their love behind me and a whisk in my hand, a <strong>small idea slowly became something real</strong>.
          </p>
          <p className="mb-6">
            And that&apos;s how, after a little drama and a lot of deliciousness… <em>drum roll please</em> … <strong>𝑀𝑜𝒹𝓊𝓀 &amp; 𝒞𝑜.</strong> was born.
          </p>
          <p className="mb-6">
            Now we make modaks the way they always should have been made — <strong>fresh, authentic, pure, and free from adulteration</strong>. <strong>No shortcuts, no nonsense, no pretending to be premium… because we are.</strong>
          </p>
          <p className="mb-6">
            Just <strong>handmade sweetness</strong>, <strong>honest ingredients</strong>, and <strong>flavours that speak for themselves</strong>.
          </p>
          <p className="mb-8">
            What started as a craving became a reality.
          </p>

          <blockquote className="border-l-4 border-rose pl-6 my-12 italic text-xl text-dark font-playfair bg-rose/5 p-6 rounded-r-2xl">
            &quot;We believe the best offerings are made entirely by hand, with the purest ingredients. That&apos;s our promise.&quot;
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl pt-16 border-t border-dark/10">
          <div className="flex flex-col items-center text-center space-y-3">
            <Leaf size={32} className="text-rose mb-2" />
            <h3 className="font-bold text-dark text-lg">Pure Ingredients</h3>
            <p className="text-sm text-text-muted">No preservatives or artificial flavours.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <Heart size={32} className="text-rose mb-2" />
            <h3 className="font-bold text-dark text-lg">Hand-pleated</h3>
            <p className="text-sm text-text-muted">Every piece is folded by skilled hands.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <Sparkles size={32} className="text-rose mb-2" />
            <h3 className="font-bold text-dark text-lg">Made Fresh</h3>
            <p className="text-sm text-text-muted">Steamed hours before your delivery.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
