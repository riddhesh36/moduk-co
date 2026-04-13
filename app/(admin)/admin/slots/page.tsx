"use client";

import { useState } from "react";
import { MOCK_SLOTS } from "@/lib/constants";
import { Power, PowerOff } from "lucide-react";

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState(MOCK_SLOTS);

  const toggleSlot = (id: string) => {
    setSlots(slots.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Slot Management</h1>
        <p className="text-[#777777] mt-2">Activate or disable logistics slots dynamically for today and tomorrow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slots.map(slot => {
          const isFull = slot.confirmed_orders >= slot.max_capacity;

          return (
            <div key={slot.id} className="border border-[#FDF0F3] p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold font-playfair">{slot.label}</h3>
                <p className="text-sm text-[#777777]">Cut-off: {slot.cutoff_time}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold bg-[#FDF8F0] px-3 py-1 rounded-md">
                    {slot.confirmed_orders} / {slot.max_capacity} booked
                  </span>
                  {isFull && <span className="text-xs font-bold text-[#C4617A] bg-[#C4617A]/10 px-2 py-1 rounded uppercase tracking-wider">Capacity Full</span>}
                </div>
              </div>
              
              <button 
                onClick={() => toggleSlot(slot.id)}
                className={`p-4 rounded-xl transition-all ${slot.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                aria-label="Toggle active status"
              >
                {slot.is_active ? <Power size={24} /> : <PowerOff size={24} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
