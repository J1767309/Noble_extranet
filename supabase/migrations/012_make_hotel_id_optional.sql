-- Make hotel_id nullable to allow tracking management-level issues
-- that are not tied to a specific hotel
ALTER TABLE public.hotel_tracker
ALTER COLUMN hotel_id DROP NOT NULL;

-- Add a check constraint to ensure at least one of hotel_id or management_company_id is provided
-- (This ensures entries are meaningful and tied to something)
ALTER TABLE public.hotel_tracker
ADD CONSTRAINT hotel_or_management_required
CHECK (hotel_id IS NOT NULL OR management_company_id IS NOT NULL);

-- Add comment to explain the change
COMMENT ON COLUMN public.hotel_tracker.hotel_id IS 'Optional - can be null for management-level issues not tied to a specific hotel';
