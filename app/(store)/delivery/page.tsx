import { Leaf, Truck, Clock } from "lucide-react";
import { MOCK_SLOTS } from "@/lib/constants";

export default function DeliveryPage() {
  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-4">Delivery Information</h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            Everything you need to know about our same-day delivery coverage and slots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-rose/10 text-rose rounded-xl flex items-center justify-center mb-6">
              <Truck size={24} />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Delivery Zones</h2>
            <p className="text-text-body mb-4">
              We currently hand-deliver our premium modaks directly to your doorstep across the following regions:
            </p>
            <ul className="list-disc list-inside text-text-muted space-y-2 mt-2">
              <li>Mumbai City</li>
              <li>Mumbai Suburban</li>
              <li>Navi Mumbai</li>
            </ul>
            <p className="text-sm mt-6 text-rose font-semibold bg-rose/5 inline-block py-1.5 px-3 rounded-md">
              Check pincode at checkout
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-rose/10 text-rose rounded-xl flex items-center justify-center mb-6">
              <Clock size={24} />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Today&apos;s Slots</h2>
            <p className="text-text-body mb-4">
              We offer multiple delivery slots to ensure maximum freshness.
            </p>
            <div className="space-y-3 w-full">
              {MOCK_SLOTS.map(slot => (
                <div key={slot.id} className="flex justify-between items-center border-b border-dark/5 pb-2">
                  <span className="font-semibold text-dark">{slot.label}</span>
                  <span className="text-xs text-text-muted bg-cream px-2 py-1 rounded">Cut-off: {slot.cutoff_time.slice(0,5)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="bg-dark text-cream rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Leaf size={120} />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl font-playfair font-bold mb-4">Freshness Guarantee</h2>
            <p className="text-cream/80 text-lg leading-relaxed">
              Because our modaks are made entirely without preservatives, they must be delivered fast and consumed fresh. Every modak is steamed on the day of delivery — never frozen, never stored.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
