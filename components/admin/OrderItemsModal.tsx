"use client";

import { useState } from "react";
import { ShoppingBag, Package, X } from "lucide-react";
import { type Order, type OrderItem } from "@/types";

export default function OrderItemsModal({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-[#777777] hover:bg-[#FDF0F3] hover:text-[#C4617A] rounded-lg transition-colors border border-[#FDF0F3] flex items-center justify-center bg-white shadow-sm"
        title="View details"
      >
        <ShoppingBag size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-left relative z-10 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b border-[#FDF0F3] pb-3">
              <h3 className="font-bold text-lg text-[#2C1A1D] flex items-center gap-2 font-playfair">
                <Package size={20} className="text-[#C4617A]" /> Order Details ({order.display_id})
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-[#777777] hover:text-[#2C1A1D] p-1 rounded-lg hover:bg-[#FDF0F3] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2">Customer Info</h4>
                <div className="bg-[#FDF8F0] p-3 rounded-xl border border-[#FDF0F3] text-sm">
                  <div className="font-semibold text-[#2C1A1D]">{order.customer_name}</div>
                  <div className="text-[#777777]">{order.customer_mobile}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2">Items</h4>
                <div className="space-y-3 bg-white border border-[#FDF0F3] p-3 rounded-xl">
                  {order.items?.map((item: OrderItem, idx: number) => {
                    const price = item.product?.price || 0;
                    return (
                      <div key={idx} className="flex justify-between items-start gap-4 text-sm">
                        <div className="flex-1">
                          <div className="font-bold text-[#2C1A1D]">{item.product?.name || 'Product'}</div>
                          <div className="text-[11px] text-[#777777]">
                            Qty: {item.quantity} · Slot: {item.selectedSlotId}
                          </div>
                        </div>
                        <div className="font-bold text-[#C4617A]">
                          ₹{price * item.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2">Delivery Details</h4>
                <div className="border border-[#FDF0F3] rounded-xl p-3 space-y-2">
                  <div>
                    <span className="font-semibold text-xs text-[#777777]">Slot:</span>
                    <p className="font-medium text-[#2C1A1D]">{order.delivery_slots?.label || order.slot_id}</p>
                    <p className="text-xs text-[#777777]">{order.slot_date}</p>
                  </div>
                  <div className="border-t border-[#FDF0F3] pt-2">
                    <span className="font-semibold text-xs text-[#777777]">Address:</span>
                    <p className="text-xs text-[#2C1A1D] mt-0.5 leading-relaxed">
                      {order.address_line1}, {order.address_pincode}
                    </p>
                  </div>
                  {order.order_notes && (
                    <div className="mt-2 text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-xs italic font-medium">
                      Note: {order.order_notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#FDF0F3] pt-3 mt-4 flex justify-between items-center text-sm font-semibold">
              <span className="text-[#777777]">Total Amount:</span>
              <span className="text-xl font-bold text-[#C4617A] font-playfair">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
