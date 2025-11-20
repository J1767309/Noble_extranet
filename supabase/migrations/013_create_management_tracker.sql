-- Create management_tracker table for management-level issues (not tied to specific hotels)
CREATE TABLE IF NOT EXISTS public.management_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    management_company_id UUID NOT NULL REFERENCES public.management_companies(id) ON DELETE CASCADE,
    date_reported DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT true,
    type TEXT NOT NULL CHECK (type IN ('Issue', 'Tactic')),
    description_short TEXT NOT NULL,
    description_long TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate any existing hotel_tracker entries with NULL hotel_id to management_tracker
-- This handles entries created before splitting the tables
INSERT INTO public.management_tracker (
    id,
    management_company_id,
    date_reported,
    is_current,
    type,
    description_short,
    description_long,
    created_at,
    updated_at
)
SELECT
    id,
    management_company_id,
    date_reported,
    is_current,
    type,
    description_short,
    description_long,
    created_at,
    updated_at
FROM public.hotel_tracker
WHERE hotel_id IS NULL;

-- Delete the migrated entries from hotel_tracker
DELETE FROM public.hotel_tracker WHERE hotel_id IS NULL;

-- Now make hotel_id NOT NULL again (since all NULL values have been moved)
ALTER TABLE public.hotel_tracker
ALTER COLUMN hotel_id SET NOT NULL;

-- Drop the constraint we added before (if it exists)
ALTER TABLE public.hotel_tracker
DROP CONSTRAINT IF EXISTS hotel_or_management_required;

-- Remove the comment
COMMENT ON COLUMN public.hotel_tracker.hotel_id IS NULL;

-- Enable RLS on management_tracker
ALTER TABLE public.management_tracker ENABLE ROW LEVEL SECURITY;

-- Management tracker policies: Internal users can view, admins can manage
CREATE POLICY "Internal users can view management tracker"
ON public.management_tracker
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

CREATE POLICY "Admins can insert management tracker entries"
ON public.management_tracker
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update management tracker entries"
ON public.management_tracker
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete management tracker entries"
ON public.management_tracker
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_management_tracker_management_company_id ON public.management_tracker(management_company_id);
CREATE INDEX idx_management_tracker_date_reported ON public.management_tracker(date_reported DESC);
CREATE INDEX idx_management_tracker_is_current ON public.management_tracker(is_current);
CREATE INDEX idx_management_tracker_type ON public.management_tracker(type);

-- Create updated_at trigger
CREATE TRIGGER update_management_tracker_updated_at
    BEFORE UPDATE ON public.management_tracker
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
