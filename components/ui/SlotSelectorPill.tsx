import * as React from "react"
import { type Slot } from "@/types"
import { cn } from "@/lib/utils"

interface SlotSelectorPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  slotItem: Slot;
  isSelected?: boolean;
}

export function SlotSelectorPill({ slotItem, isSelected, className, ...props }: SlotSelectorPillProps) {
  // PRD logic for past cut-off
  const isPastCutoff = isSlotPastCutoff(slotItem.cutoff_time);
  const isFull = slotItem.confirmed_orders >= slotItem.max_capacity;
  
  // Note: if is_active is false from admin toggles, we probably don't render it at all or render it closed
  const isAvailable = slotItem.is_active && !isPastCutoff && !isFull;
  
  let labelText = slotItem.label;
  if (isPastCutoff) labelText = "Closed";
  else if (isFull) labelText = "Full";

  return (
    <button
      disabled={!isAvailable}
      className={cn(
        "min-w-[90px] h-[40px] rounded-full px-4 text-[14px] font-semibold transition-all transition-colors flex items-center justify-center",
        // Available (Not Selected)
        isAvailable && !isSelected && "bg-white border border-rose text-rose hover:bg-rose/5",
        // Available (Selected)
        isAvailable && isSelected && "bg-rose border border-rose text-white shadow-sm",
        // Unavailable (Full or Closed)
        !isAvailable && "bg-[#E0E0E0] text-[#777777] border border-transparent cursor-not-allowed",
        className
      )}
      {...props}
    >
      {labelText}
    </button>
  );
}

// Client-side helper check assuming IST (since we only care about Today's slots for cutoff)
// For tomorrow's slots we probably don't run the cutoff check, so this should ideally take a "date" context
function isSlotPastCutoff(cutoffTimeString: string): boolean {
  // Basic implementation to be fleshed out with actual Date checking
  // Time format expected e.g., "09:30:00"
  const now = new Date();
  const [hours, minutes] = cutoffTimeString.split(':').map(Number);
  
  // Create a Date object for the cut-off time today
  const cutoffDateTime = new Date();
  cutoffDateTime.setHours(hours, minutes, 0, 0);

  // Return true only if current time > cutoff time. 
  // (Note: This is basic. Higher-level component should pass boolean prop if this is tomorrow to skip check)
  return now > cutoffDateTime;
}
