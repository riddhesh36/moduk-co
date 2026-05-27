import { Leaf, Truck, Clock } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: slots } = await supabase
    .from('delivery_slots')
    .select('*')
    .eq('is_active', true)
    .order('cutoff_time');

  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-4">Delivery Information</h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            Everything you need to know about our delivery coverage and pre-order slots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-rose/10 text-rose rounded-xl flex items-center justify-center mb-6">
              <Truck size={24} />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Delivery Zones</h2>
            <p className="text-text-body mb-4 leading-relaxed">
              We hand-deliver our fresh modaks across selected zones in Mumbai:
            </p>
            
            <div className="space-y-4 w-full">
              <div className="p-3 bg-[#FBF0DC]/30 border border-[#B69141]/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B69141] block mb-1">Zone 1 — ₹50 Delivery Fee</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Parel, Lalbaug, Dadar, Matunga, Sion, Mahim, Byculla, Mazgaon
                </p>
              </div>

              <div className="p-3 bg-[#FBF0DC]/30 border border-[#B69141]/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B69141] block mb-1">Zone 2 — ₹80 Delivery Fee</span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Worli, Prabhadevi, Wadala, Santacruz, Chembur, Vile Parle, Andheri
                </p>
              </div>

              <div className="p-3 border border-dashed border-dark/10 rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">Outside these zones?</span>
                <p className="text-xs text-text-body leading-relaxed">
                  Self-pickup is available from our Lalbaug kitchen, or you can arrange your own Borzo delivery. 
                  {" "}
                  <a href="https://wa.me/918591781695" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#B69141] hover:text-[#C4617A] underline">
                    WhatsApp us to coordinate
                  </a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-rose/10 text-rose rounded-xl flex items-center justify-center mb-6">
              <Clock size={24} />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-dark mb-4">Available Slots</h2>
            <p className="text-text-body mb-4">
              We offer multiple delivery slots to ensure maximum freshness.
            </p>
            <div className="space-y-3 w-full">
              {slots?.map(slot => (
                <div key={slot.id} className="flex justify-between items-center border-b border-dark/5 pb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-dark">{slot.label}</span>
                    {slot.slot_date && <span className="text-[10px] text-text-muted">Date: {new Date(slot.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                  <span className="text-xs text-text-muted bg-cream px-2 py-1 rounded">Cut-off: {slot.cutoff_time.slice(0,5)}</span>
                </div>
              ))}
              {(!slots || slots.length === 0) && (
                <p className="text-sm text-text-muted">No active delivery slots available.</p>
              )}
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
