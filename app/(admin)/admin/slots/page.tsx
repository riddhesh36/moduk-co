"use client";

import { useState, useEffect } from "react";
import { Power, PowerOff, Edit, X, Trash2, Plus } from "lucide-react";
import { Slot } from "@/types";
import { updateSlotAction, deleteSlotAction, createSlotAction, fetchAdminSlotsAction } from "../actions";

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminSlotsAction();
      if (res.success) {
        setSlots(res.data as Slot[]);
      } else {
        console.error(res.error);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const updateSlot = async (slotId: string, updates: Partial<Slot>) => {
    try {
      const res = await updateSlotAction(slotId, updates);
      if (res.success) {
        await fetchSlots();
        setEditingSlot(null);
      } else {
        alert("Failed to update slot: " + res.error);
      }
    } catch {
      alert("Error updating slot");
    }
  };

  const toggleSlot = (slot: Slot) => {
    updateSlot(slot.id, { is_active: !slot.is_active });
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this slot permanently?")) return;
    try {
      const res = await deleteSlotAction(slotId);
      if (res.success) {
        await fetchSlots();
      } else {
        alert("Failed to delete slot: " + res.error);
      }
    } catch {
      alert("Error deleting slot");
    }
  };

  return (
    <div>
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-[#2C1A1D]">Slot Management</h1>
          <p className="text-[#777777] mt-2">Adjust physical logistics constraints safely. Storefront will hide sold-out slots.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-[#2C1A1D] text-white px-5 py-3 rounded-xl font-semibold hover:bg-black transition-colors"
        >
          <Plus size={20} /> Create Slot
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 border border-[#FDF0F3] bg-white p-6 rounded-2xl shadow-sm animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-[#2C1A1D]">New Delivery Slot</h4>
            <button onClick={() => setShowCreate(false)} className="text-[#777777] hover:text-[#2C1A1D]"><X size={20}/></button>
          </div>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const res = await createSlotAction({
                id: formData.get("id") as string,
                label: formData.get("label") as string,
                cutoff_time: formData.get("cutoff_time") as string,
                max_capacity: parseInt(formData.get("max_capacity") as string),
                slot_date: formData.get("slot_date") as string,
              });
              if (res.success) {
                setShowCreate(false);
                await fetchSlots();
              } else {
                alert("Failed to create: " + res.error);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-semibold mb-1">ID Code (e.g. SLOT-MORNING)</label>
              <input name="id" type="text" placeholder="SLOT-1" className="w-full border px-3 py-2 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Display Label</label>
              <input name="label" type="text" placeholder="10:00 AM - 1:00 PM" className="w-full border px-3 py-2 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Max Capacity</label>
              <input name="max_capacity" type="number" defaultValue={20} className="w-full border px-3 py-2 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Cutoff Time (24h)</label>
              <input name="cutoff_time" type="time" defaultValue="09:00" className="w-full border px-3 py-2 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Slot Date</label>
              <input name="slot_date" type="date" className="w-full border px-3 py-2 rounded-lg text-sm" required />
            </div>
            <button type="submit" className="w-full bg-[#E8A0B0] text-white rounded-lg py-2 h-[38px] text-sm font-bold hover:bg-[#D48A9A] transition-colors lg:col-span-4 mt-2">
              Add Slot to Schedule
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-[#777777] animate-pulse">Loading Live Slots...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {slots.map(slot => {
            const isFull = (slot.confirmed_orders || 0) >= slot.max_capacity;

            return (
              <div key={slot.id} className="border border-[#FDF0F3] bg-white p-6 rounded-2xl flex flex-col justify-between shadow-sm relative">
                {!slot.is_active && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
                    <span className="bg-red-100 text-red-800 font-bold px-4 py-2 rounded-lg rotate-[-5deg] tracking-widest uppercase">Disabled</span>
                  </div>
                )}
                <div className="flex justify-between items-start z-20">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold font-playfair text-[#2C1A1D]">{slot.label}</h3>
                    <p className="text-sm text-[#777777]">Date: {slot.slot_date} | Cut-off: {slot.cutoff_time}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-semibold bg-[#FDF8F0] px-3 py-1 rounded-md text-[#2C1A1D]">
                        {slot.confirmed_orders} / {slot.max_capacity} booked
                      </span>
                      {isFull && <span className="text-xs font-bold text-white bg-[#C4617A] px-2 py-1 rounded shadow-sm">SOLD OUT</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 relative z-20">
                    <button 
                      onClick={() => setEditingSlot(slot)}
                      className="p-3 rounded-xl transition-all bg-amber-50 text-amber-700 hover:bg-amber-100"
                      aria-label="Edit Slot"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => deleteSlot(slot.id)}
                      className="p-3 rounded-xl transition-all bg-gray-50 text-gray-700 hover:bg-gray-100"
                      aria-label="Delete Slot"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => toggleSlot(slot)}
                      className={`p-3 rounded-xl transition-all ${slot.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      aria-label="Toggle Active"
                    >
                      {slot.is_active ? <PowerOff size={20} /> : <Power size={20} /> }
                    </button>
                  </div>
                </div>

                {/* Edit Modal / Inline Edit */}
                {editingSlot?.id === slot.id && (
                  <div className="mt-6 pt-6 border-t border-[#FDF0F3] z-20 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-[#777777]">Edit {slot.id}</h4>
                      <button onClick={() => setEditingSlot(null)} className="text-[#777777] hover:text-[#2C1A1D]"><X size={16}/></button>
                    </div>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateSlot(slot.id, {
                          max_capacity: parseInt(formData.get("max_capacity") as string),
                          cutoff_time: formData.get("cutoff_time") as string,
                          slot_date: formData.get("slot_date") as string,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold mb-1">Max Capacity</label>
                        <input name="max_capacity" type="number" defaultValue={slot.max_capacity} className="w-full border px-3 py-2 rounded-lg text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Cutoff Time</label>
                        <input name="cutoff_time" type="time" defaultValue={slot.cutoff_time} className="w-full border px-3 py-2 rounded-lg text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Slot Date</label>
                        <input name="slot_date" type="date" defaultValue={slot.slot_date} className="w-full border px-3 py-2 rounded-lg text-sm" required />
                      </div>
                      <button type="submit" className="w-full bg-[#2C1A1D] text-white rounded-lg py-2 text-sm font-semibold hover:bg-black transition-colors">
                        Save Changes
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
