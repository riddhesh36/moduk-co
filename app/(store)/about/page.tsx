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

        <div className="w-full aspect-[21/9] bg-blush rounded-2xl overflow-hidden mb-16 relative flex items-center justify-center border border-rose/10">
          {/* Placeholder for real team/kitchen photo */}
          <div className="absolute inset-0 bg-rose/5" />
          <Heart size={48} className="text-rose opacity-50"/>
        </div>

        <div className="prose prose-lg prose-rose prose-p:text-text-body font-dmsans max-w-3xl">
          <h2 className="font-playfair text-3xl font-bold text-dark mb-4">The Ganesha Connection</h2>
          <p className="mb-8">
            Our journey began out of a pure devotion to Lord Ganesha. Every year during Ganesh Chaturthi, our home kitchen would transform into a sacred space, filled with the aroma of freshly grated coconut, melting jaggery, and the floral notes of cardamom and ghee. We spent hours meticulously pleating the rice flour dough to create the perfect <em>Ukadiche Modaks</em> — Ganesha&apos;s favourite sweet.
          </p>
          <p className="mb-8">
            What started as a labor of love for naivedya (offerings) soon became the most anticipated treat among our friends and extended family. Year after year, the requests grew. The feedback was always the same: &quot;We haven&apos;t tasted anything this pure in the market.&quot;
          </p>

          <h2 className="font-playfair text-3xl font-bold text-dark mb-4 mt-12">Care in Every Piece</h2>
          <p className="mb-8">
            When we launched Moduk & Co, our promise was simple: never compromise on the purity of our ingredients. We source the finest Kashmir saffron, the most aromatic Indian cardamom, and freshly harvest coconuts daily.
          </p>
          <p className="mb-8">
            Every modak you order is steamed fresh on the day of delivery. There are no preservatives, no artificial colors, and no shortcuts. We pack them with care in beautiful clear boxes with our signature blush Ganesha insert, making them the perfect offering for your pooja or a joyful gift for loved ones.
          </p>

          <blockquote className="border-l-4 border-rose pl-6 my-12 italic text-xl text-dark font-playfair bg-rose/5 p-6 rounded-r-2xl">
            &quot;We believe the best offerings are made entirely by hand, with the purest ingredients. That&apos;s our promise.&quot;
          </blockquote>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl pt-16 border-t border-dark/10">
          <div className="flex flex-col items-center text-center space-y-3">
            <Leaf size={32} className="text-rose mb-2"/>
            <h3 className="font-bold text-dark text-lg">Pure Ingredients</h3>
            <p className="text-sm text-text-muted">No preservatives or artificial flavours.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <Heart size={32} className="text-rose mb-2"/>
            <h3 className="font-bold text-dark text-lg">Hand-pleated</h3>
            <p className="text-sm text-text-muted">Every piece is folded by skilled hands.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <Sparkles size={32} className="text-rose mb-2"/>
            <h3 className="font-bold text-dark text-lg">Made Fresh</h3>
            <p className="text-sm text-text-muted">Steamed hours before your delivery.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
