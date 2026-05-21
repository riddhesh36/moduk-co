import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Trash2, Ticket } from "lucide-react";
import { deleteCoupon } from "./actions";
import CouponToggle from "@/components/admin/CouponToggle";
import CouponFormButton from "./CouponFormButton";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
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

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No expiry";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Coupon Management</h1>
          <p className="text-[#777777] mt-1">Create and manage discount coupons for your customers.</p>
        </div>
        <div className="self-start sm:self-auto">
          <CouponFormButton />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block md:hidden space-y-4 mb-6">
        {(!coupons || coupons.length === 0) && (
          <div className="px-6 py-10 text-center text-[#777777] bg-white border border-[#FDF0F3] rounded-xl">
            <Ticket size={32} className="mx-auto text-[#C4617A]/30 mb-3" />
            <p>No coupons created yet.</p>
          </div>
        )}
        {coupons?.map((coupon) => (
          <div key={coupon.id} className="bg-white border border-[#FDF0F3] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#C4617A] text-base tracking-wide">{coupon.code}</span>
                  {coupon.is_first_time_only && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100">
                      1st Time Only
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#777777] mt-0.5">
                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                </div>
              </div>
              <CouponToggle couponId={coupon.id} isActive={coupon.is_active} />
            </div>

            <div className="text-xs text-[#777777] bg-[#FDF8F0]/50 p-2.5 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C1A1D]">Usage:</span>
                <span>{coupon.uses_count} / {coupon.max_uses ?? '∞'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C1A1D]">Min Order:</span>
                <span>₹{coupon.min_order_amount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C1A1D]">Expires:</span>
                <span>{formatDate(coupon.valid_until)}</span>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#FDF0F3] pt-3">
              <form action={async () => {
                "use server";
                await deleteCoupon(coupon.id);
              }}>
                <button type="submit" className="p-2 text-[#C4617A] hover:bg-red-50 rounded-lg transition-colors" title="Delete coupon">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border text-sm border-[#FDF0F3] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-[#777777] uppercase tracking-wider text-xs border-b border-[#FDF0F3]">
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Min Order</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Valid Until</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDF0F3]">
              {(!coupons || coupons.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#777777]">
                    <Ticket size={28} className="mx-auto text-[#C4617A]/30 mb-2" />
                    No coupons found. Create your first coupon!
                  </td>
                </tr>
              )}
              {coupons?.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#FDF8F0]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C4617A] tracking-wide">{coupon.code}</span>
                      {coupon.is_first_time_only && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100">
                          1st Time
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.type === 'percentage' 
                        ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {coupon.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#2C1A1D]">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 text-[#777777]">
                    ₹{coupon.min_order_amount || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2C1A1D]">{coupon.uses_count}</span>
                      <span className="text-[#777777]">/</span>
                      <span className="text-[#777777]">{coupon.max_uses ?? '∞'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#777777] text-xs">
                    {formatDate(coupon.valid_until)}
                  </td>
                  <td className="px-6 py-4">
                    <CouponToggle couponId={coupon.id} isActive={coupon.is_active} />
                  </td>
                  <td className="px-6 py-4">
                    <form action={async () => {
                      "use server";
                      await deleteCoupon(coupon.id);
                    }}>
                      <button type="submit" className="p-2 text-[#C4617A] hover:bg-red-50 rounded-lg transition-colors" title="Delete coupon">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
