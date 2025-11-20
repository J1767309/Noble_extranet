-- Migration: Create hotel_partner_notes table for mid-year review notes
-- Captures key information from partner meeting notes by hotel
-- Role-based access: Internal users only

-- ========================================
-- CREATE HOTEL PARTNER NOTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.hotel_partner_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_name TEXT NOT NULL,
    review_date DATE DEFAULT CURRENT_DATE,
    review_period TEXT, -- e.g., "2025 Mid-Year", "Q2 2025"

    -- Main content fields (rich text)
    keys_to_success TEXT,
    new_supply TEXT,
    market_updates TEXT,
    str_revenue_market TEXT, -- STR/Revenue - Market section
    str_revenue_hotel TEXT, -- STR/Revenue - Hotel section
    accounts_top TEXT, -- Top Accounts
    accounts_target TEXT, -- Target Accounts
    expense_gop_update TEXT,
    capital TEXT,

    -- Additional context
    notes TEXT, -- General notes/comments

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add indexes for faster queries
CREATE INDEX idx_hotel_partner_notes_hotel_name ON public.hotel_partner_notes(hotel_name);
CREATE INDEX idx_hotel_partner_notes_review_date ON public.hotel_partner_notes(review_date DESC);
CREATE INDEX idx_hotel_partner_notes_created_at ON public.hotel_partner_notes(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_hotel_partner_notes_updated_at
    BEFORE UPDATE ON public.hotel_partner_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.hotel_partner_notes ENABLE ROW LEVEL SECURITY;

-- Internal users can view all partner notes
CREATE POLICY "Internal users can view partner notes"
ON public.hotel_partner_notes
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

-- Admins and Creators can insert partner notes
CREATE POLICY "Admins and Creators can insert partner notes"
ON public.hotel_partner_notes
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
        AND users.role IN ('admin', 'creator')
    )
);

-- Admins, Creators, and Editors can update partner notes
CREATE POLICY "Admins, Creators, and Editors can update partner notes"
ON public.hotel_partner_notes
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
        AND users.role IN ('admin', 'creator', 'editor')
    )
);

-- Only Admins can delete partner notes
CREATE POLICY "Admins can delete partner notes"
ON public.hotel_partner_notes
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
        AND users.role = 'admin'
    )
);

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_partner_notes TO authenticated;
