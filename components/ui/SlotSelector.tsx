"use client";

import { useState } from "react";
import { type Slot } from "@/types";
import { SlotSelectorPill } from "./SlotSelectorPill";
import { cn } from "@/lib/utils";

interface SlotSelectorProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, dateType: string) => void;
}

export function SlotSelector({ slots, selectedSlotId, onSelectSlot }: SlotSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>("19th April");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedDate("19th April")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold border-b-2 transition-colors",
            selectedDate === "19th April" ? "border-rose text-rose" : "border-cream/20 text-text-muted hover:text-dark"
          )}
        >
          19th April
        </button>
        <button
          onClick={() => setSelectedDate("5th May")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold border-b-2 transition-colors",
            selectedDate === "5th May" ? "border-rose text-rose" : "border-cream/20 text-text-muted hover:text-dark"
          )}
        >
          5th May
        </button>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 pt-2">
        {slots.map((slot) => (
          <SlotSelectorPill
            key={slot.id}
            slotItem={slot}
            isSelected={selectedSlotId === slot.id}
            onClick={() => onSelectSlot(slot.id, selectedDate)}
            // If tomorrow, we can bypass cutoff checks dynamically if needed.
            // For now relies on SlotSelectorPill's internal logic
          />
        ))}
        {slots.length === 0 && (
          <p className="text-sm text-text-muted col-span-full">No slots available.</p>
        )}
      </div>
    </div>
  );
}
