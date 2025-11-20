-- Add impact column to hotel_tracker table
ALTER TABLE public.hotel_tracker
ADD COLUMN impact TEXT CHECK (impact IN ('Low', 'Medium', 'High')) DEFAULT 'Medium';

-- Update existing rows to have a default impact value if NULL
UPDATE public.hotel_tracker
SET impact = 'Medium'
WHERE impact IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.hotel_tracker
ALTER COLUMN impact SET NOT NULL;
