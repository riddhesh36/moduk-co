"use client";

import { CheckCircle, Clock } from "lucide-react";

export default function AdminOrderInbox() {
  // Mock data representing recent orders
  const mockOrders = [
    { id: "ORD-123456", customer: "Priya Sharma", items: "1x Classic Ukadiche", slot: "SLOT-AM (Today)", status: "pending", type: "upi", total: "₹349" },
    { id: "ORD-987654", customer: "Rahul Verma", items: "2x Kesar Delight", slot: "SLOT-PM (Today)", status: "dispatched", type: "cod", total: "₹898" },
    { id: "ORD-456789", customer: "Sneha Iyer", items: "1x Classic, 1x Kesar", slot: "SLOT-EVE (Tomorrow)", status: "pending", type: "upi", total: "₹798" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Order Inbox</h1>
        <button className="bg-[#C4617A] text-white px-5 py-2 rounded-lg font-semibold shadow-sm hover:bg-[#C4617A]/90">
          Export CSV
        </button>
      </div>

      <div className="bg-white border text-sm border-[#FDF0F3] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FDF8F0] text-[#777777] uppercase tracking-wider text-xs border-b border-[#FDF0F3]">
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Items</th>
              <th className="px-6 py-4 font-semibold">Slot</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FDF0F3]">
            {mockOrders.map(order => (
              <tr key={order.id} className="hover:bg-[#FDF8F0]/30 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">{order.id}
                  {order.type === 'cod' && <span className="ml-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">COD</span>}
                </td>
                <td className="px-6 py-4 font-medium">{order.customer}</td>
                <td className="px-6 py-4 text-[#777777]">{order.items}</td>
                <td className="px-6 py-4 text-[#777777]">{order.slot}</td>
                <td className="px-6 py-4 font-semibold text-[#C4617A]">{order.total}</td>
                <td className="px-6 py-4">
                  {order.status === "pending" ? (
                    <button className="flex items-center gap-2 bg-[#2C1A1D] text-white py-1.5 px-3 rounded text-xs font-semibold hover:bg-black">
                      <Clock size={14} /> Mark Dispatched
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-green-600 font-semibold text-xs py-1.5 px-3">
                      <CheckCircle size={14} /> Dispatched
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
