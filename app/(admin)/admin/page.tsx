import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Package, Banknote, ShoppingBag, MapPin } from "lucide-react";
import OrderActionButtons from "@/components/admin/OrderActionButtons";

export const dynamic = "force-dynamic";

// Helper to extract item display text from order items JSONB
// Items can be stored as { product: { name }, quantity } (from cart) or { name, qty } (legacy)
function formatItemText(item: Record<string, unknown>): string {
  const qty = (item.quantity as number) || (item.qty as number) || 1;
  const product = item.product as Record<string, unknown> | undefined;
  const name = product?.name || (item.name as string) || 'Unknown Item';
  return `${qty}x ${name}`;
}

export default async function AdminOrderInbox() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const today = new Date().toISOString().split('T')[0];

  const { data: allOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const orders = allOrders || [];
  
  // KPI Calculations
  const todayOrders = orders.filter(o => o.slot_date === today);
  
  const revenueToday = todayOrders
    .filter(o => o.status !== 'cancelled' && (o.payment_status === 'paid' || o.payment_method === 'cod'))
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  // Modak Count Calculation
  // Classic = 5, Delight = 7, Celebration = 11
  let totalModaks = 0;
  todayOrders.filter(o => o.status !== 'cancelled').forEach(order => {
    order.items.forEach((item: { product_id: string; name: string; qty: number; product?: { name: string }; quantity?: number }) => {
      const itemName = item.product?.name || item.name || '';
      const itemQty = item.quantity || item.qty || 1;
      if (item.product_id === 'classic-box' || itemName.toLowerCase().includes('classic')) {
        totalModaks += (5 * itemQty);
      } else if (item.product_id === 'delight-box' || itemName.toLowerCase().includes('delight')) {
        totalModaks += (7 * itemQty);
      } else if (item.product_id === 'celebration-box' || itemName.toLowerCase().includes('celebration')) {
        totalModaks += (11 * itemQty);
      }
    });
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Order Management</h1>
          <p className="text-[#777777] mt-1">Real-time overview of your incoming orders and daily targets.</p>
        </div>
        <button className="bg-[#C4617A] text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#C4617A]/90 self-start sm:self-auto">
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-[#FDF0F3] p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-[#777777] font-semibold">Orders Today</p>
            <h3 className="text-2xl font-bold font-playfair">{todayOrders.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#FDF0F3] p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-sm text-[#777777] font-semibold">Revenue Today</p>
            <h3 className="text-2xl font-bold font-playfair">₹{revenueToday.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white border border-[#FDF0F3] p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-[#777777] font-semibold">Modaks to Prepare (Today)</p>
            <h3 className="text-2xl font-bold font-playfair">{totalModaks} Pieces</h3>
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block md:hidden space-y-4 mb-6">
        {orders.length === 0 && (
          <div className="px-6 py-10 text-center text-[#777777] bg-white border border-[#FDF0F3] rounded-xl">
            No orders found in the database.
          </div>
        )}
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-[#FDF0F3] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-[#C4617A] text-sm">{order.display_id}</span>
                {order.payment_method === 'cod' && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    COD
                  </span>
                )}
                {order.payment_method === 'razorpay' && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    RAZORPAY
                  </span>
                )}
              </div>
              <span className="font-semibold text-[#C4617A]">₹{order.total_amount}</span>
            </div>

            <div className="text-sm border-t border-[#FDF0F3] pt-2">
              <div className="font-bold text-[#2C1A1D]">{order.customer_name}</div>
              <div className="text-xs text-[#777777]">{order.customer_mobile}</div>
            </div>

            <div className="text-xs text-[#777777] bg-[#FDF8F0]/50 p-2 rounded-lg">
              <span className="font-semibold text-[#2C1A1D]">Items: </span>
              {order.items.map((it: Record<string, unknown>) => formatItemText(it)).join(", ")}
            </div>

            {/* Delivery Address */}
            <div className="text-xs text-[#777777] bg-blue-50/50 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <MapPin size={12} className="text-blue-500 shrink-0" />
                <span className="font-semibold text-[#2C1A1D]">Delivery Address</span>
              </div>
              <div className="text-[11px] leading-relaxed">
                {order.address_line1}
                {order.address_area && order.address_area !== 'N/A' && !order.address_area.startsWith('Notes:') && `, ${order.address_area}`}
                {order.address_city && `, ${order.address_city}`}
                {order.address_pincode && ` - ${order.address_pincode}`}
              </div>
              {order.order_notes && (
                <div className="mt-1 text-[11px] italic text-[#555]">📝 {order.order_notes}</div>
              )}
            </div>

            <div className="text-xs text-[#777777] flex justify-between items-center border-t border-[#FDF0F3] pt-2">
              <div>
                <span className="font-semibold text-[#2C1A1D]">Slot:</span> {order.slot_id}
                <div className="text-[10px] text-[#777777] mt-0.5">{order.slot_date}</div>
              </div>
              <div>
                <OrderActionButtons orderId={order.id} status={order.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block bg-white border text-sm border-[#FDF0F3] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDF8F0] text-[#777777] uppercase tracking-wider text-xs border-b border-[#FDF0F3]">
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Delivery Address</th>
              <th className="px-6 py-4 font-semibold">Slot Info</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FDF0F3]">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[#777777]">No orders found in the database.</td>
              </tr>
            )}
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-[#FDF8F0]/30 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">{order.display_id}
                  {order.payment_method === 'cod' && <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">COD</span>}
                  {order.payment_method === 'razorpay' && <span className="ml-2 bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">RAZORPAY</span>}
                </td>
                <td className="px-6 py-4 font-medium">
                  {order.customer_name}
                  <div className="text-xs text-[#777777] mt-0.5">{order.customer_mobile}</div>
                </td>
                <td className="px-6 py-4 text-[#777777]">
                  {order.items.map((it: Record<string, unknown>) => formatItemText(it)).join(", ")}
                </td>
                <td className="px-6 py-4 text-[#777777] max-w-[200px]">
                  <div className="text-xs leading-relaxed">
                    {order.address_line1}
                    {order.address_pincode && ` - ${order.address_pincode}`}
                  </div>
                  {order.order_notes && (
                    <div className="text-[10px] italic text-[#999] mt-1">📝 {order.order_notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-[#777777]">
                  <div className="font-medium text-[#2C1A1D]">{order.slot_id}</div>
                  <div className="text-xs mt-0.5">{order.slot_date}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-[#C4617A]">₹{order.total_amount}</td>
                <td className="px-6 py-4">
                  <OrderActionButtons orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
