import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { updatePaymentStatus } from "./actions";
import OrderStatusSelector from "@/components/admin/OrderStatusSelector";
import OrderItemsModal from "@/components/admin/OrderItemsModal";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
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

  const { data: orders } = await supabase
    .from("orders")
    .select("*, delivery_slots(label)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark font-playfair">Order Management</h1>
          <p className="text-text-muted mt-1">Track and manage your customer orders.</p>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="block md:hidden space-y-4 mb-6">
        {(!orders || orders.length === 0) && (
          <div className="px-6 py-10 text-center text-[#777777] bg-white border border-dark/5 rounded-xl">
            No orders found.
          </div>
        )}
        {orders?.map((order) => (
          <div key={order.id} className="bg-white border border-dark/5 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-rose text-sm">{order.display_id}</span>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <span className="font-bold text-dark text-base">₹{order.total_amount}</span>
            </div>

            <div className="text-sm border-t border-[#FDF0F3] pt-2">
              <div className="font-semibold text-dark">{order.customer_name}</div>
              <div className="text-xs text-text-muted">{order.customer_mobile}</div>
            </div>

            <div className="text-xs text-text-muted bg-cream/30 p-2.5 rounded-lg space-y-1">
              <div>
                <span className="font-bold text-dark">Date:</span> {new Date(order.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
              <div>
                <span className="font-bold text-dark">Slot:</span> {order.delivery_slots?.label || order.slot_id}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#FDF0F3] pt-3">
              <div className="flex flex-wrap gap-2 items-center">
                <PaymentStatusBadge status={order.payment_status} orderId={order.id} />
                <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
              </div>
              <div>
                <OrderItemsModal order={order} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-dark/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cream/50 text-text-muted text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Delivery Date / Slot</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark/5">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-cream/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-rose">{order.display_id}</span>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-dark">{order.customer_name}</div>
                    <div className="text-xs text-text-muted">{order.customer_mobile}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      {new Date(order.slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-text-muted">
                      {order.delivery_slots?.label || order.slot_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-dark">₹{order.total_amount}</td>
                  <td className="px-6 py-4">
                    <PaymentStatusBadge status={order.payment_status} orderId={order.id} />
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2">
                       <OrderItemsModal order={order} />
                    </div>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status, orderId }: { status: string, orderId: string }) {
  const isPaid = status === 'paid' || status === 'successful';
  return (
    <form action={async () => {
      "use server";
      await updatePaymentStatus(orderId, isPaid ? 'pending' : 'paid');
    }}>
      <button type="submit" className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
        isPaid 
          ? "bg-green-50 text-green-700 border-green-200" 
          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      }`}>
        {isPaid ? "PAID" : "MARK AS PAID"}
      </button>
    </form>
  );
}
