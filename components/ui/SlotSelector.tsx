"use client";

import { useState, useEffect } from "react";
import { type Slot } from "@/types";
import { SlotSelectorPill } from "./SlotSelectorPill";
import { cn } from "@/lib/utils";

interface SlotSelectorProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, dateType: string) => void;
}

export function SlotSelector({ slots, selectedSlotId, onSelectSlot }: SlotSelectorProps) {
  // Extract unique dates from slots and sort them
  const uniqueDates = Array.from(new Set(slots.map(s => s.slot_date).filter(Boolean))) as string[];
  uniqueDates.sort();

  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const filteredSlots = slots.filter(s => s.slot_date === selectedDate);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {uniqueDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold border-b-2 transition-colors",
              selectedDate === date ? "border-rose text-rose" : "border-cream/20 text-text-muted hover:text-dark"
            )}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 pt-2">
        {filteredSlots.map((slot) => (
          <SlotSelectorPill
            key={slot.id}
            slotItem={slot}
            isSelected={selectedSlotId === slot.id}
            onClick={() => onSelectSlot(slot.id, selectedDate)}
          />
        ))}
        {filteredSlots.length === 0 && (
          <p className="text-sm text-text-muted col-span-full py-4 text-center">No slots available for this date.</p>
        )}
      </div>
    </div>
  );
}
