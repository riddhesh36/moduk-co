import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Package, ShoppingBag } from "lucide-react";
import { updateOrderStatus, updatePaymentStatus } from "./actions";
import { type Order, type OrderItem } from "@/types";

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark">Order Management</h1>
          <p className="text-text-muted">Track and manage your customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-dark/5 overflow-hidden">
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
                    <OrderStatusBadge status={order.status} orderId={order.id} />
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
      <button type="submit" className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
        isPaid 
          ? "bg-green-50 text-green-700 border-green-200" 
          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      }`}>
        {isPaid ? "PAID" : "MARK AS PAID"}
      </button>
    </form>
  );
}

function OrderStatusBadge({ status, orderId }: { status: string, orderId: string }) {
  const statuses = [
    { value: 'needs_verification', label: 'NEEDS REVIEW', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'pending', label: 'PENDING', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'out_for_delivery', label: 'OUT FOR DELIVERY', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'delivered', label: 'DELIVERED', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'cancelled', label: 'CANCELLED', color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  const current = statuses.find(s => s.value === status) || statuses[1];

  return (
    <div className="relative group">
      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${current.color}`}>
        {current.label}
      </div>
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 bg-white border border-dark/10 shadow-xl rounded-lg p-1 min-w-[150px]">
        {statuses.map(s => (
          <form key={s.value} action={async () => {
            "use server";
            await updateOrderStatus(orderId, s.value);
          }}>
            <button type="submit" className="w-full text-left px-3 py-1.5 text-xs hover:bg-cream rounded transition-colors uppercase font-bold">
              {s.label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function OrderItemsModal({ order }: { order: Order }) {
  // Simple "details" view
  return (
    <div className="group relative">
      <button className="p-2 text-text-muted hover:bg-dark/5 rounded-lg transition-colors">
        <ShoppingBag size={18} />
      </button>
      <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-30 bg-white border border-dark/10 shadow-2xl rounded-2xl p-6 min-w-[300px] text-left">
        <h3 className="font-bold text-dark mb-4 border-b border-dark/5 pb-2 flex items-center gap-2">
          <Package size={16} /> Order Details
        </h3>
        <div className="space-y-4 mb-4">
          {order.items?.map((item: OrderItem, idx: number) => (
            <div key={idx} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-bold text-sm text-dark">{item.product?.name || 'Product'}</div>
                <div className="text-[10px] text-text-muted">Qty: {item.quantity} · Slot: {item.selectedSlotId}</div>
              </div>
              <div className="font-bold text-sm text-rose">₹{item.product?.price * item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-text-muted border-t border-dark/5 pt-4">
          <div className="font-bold text-dark mb-1">Address:</div>
          <p>{order.address_line1}, {order.address_pincode}</p>
          {order.order_notes && (
            <div className="mt-2 text-amber-600 bg-amber-50 p-2 rounded italic font-medium">
              Note: {order.order_notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
