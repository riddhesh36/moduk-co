-- Add slot_date column to delivery_slots
ALTER TABLE public.delivery_slots ADD COLUMN IF NOT EXISTS slot_date date;

-- Update existing slots to a default date if needed, or just leave null
-- UPDATE public.delivery_slots SET slot_date = CURRENT_DATE WHERE slot_date IS NULL;
