-- Migration: 028_create_hotel_fact_sheets.sql
-- Create hotel_fact_sheets table for storing property information

-- Create hotel_fact_sheets table
CREATE TABLE IF NOT EXISTS public.hotel_fact_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Information (from A6)
    hotel_name TEXT NOT NULL,

    -- Ownership Information (from A9, A10)
    owner_llc TEXT,
    operating_company_llc TEXT,

    -- Location Information
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    phone TEXT,
    website TEXT,
    county TEXT,
    submarket TEXT,

    -- Property History
    year_built INTEGER,
    parking_spaces INTEGER,
    parking_type TEXT,

    -- Property Data
    num_buildings INTEGER,
    num_stories INTEGER,
    total_sq_ft INTEGER,
    acreage DECIMAL(10,2),

    -- Key Dates
    purchase_date TEXT,
    open_date TEXT,

    -- Property Identifiers
    marsha_code TEXT,
    str_code TEXT,
    fein TEXT,

    -- Room Information
    total_rooms INTEGER,
    room_mix JSONB,
    meeting_rooms JSONB,
    oceanfront_rooms INTEGER,

    -- Features/Facilities/Amenities
    features_amenities TEXT,

    -- Renovations
    renovations TEXT,

    -- Franchise Information
    franchise_brand TEXT,
    franchise_fees TEXT,

    -- Common Area/Retail
    common_area_retail TEXT,

    -- Lender Information
    lender_info TEXT,

    -- Competitive Set
    competitive_set TEXT[],
    management_company TEXT,

    -- Reference
    excel_sheet_name TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_hotel_fact_sheets_hotel_name ON public.hotel_fact_sheets(hotel_name);
CREATE INDEX IF NOT EXISTS idx_hotel_fact_sheets_address_state ON public.hotel_fact_sheets(address_state);
CREATE INDEX IF NOT EXISTS idx_hotel_fact_sheets_franchise_brand ON public.hotel_fact_sheets(franchise_brand);

-- Enable RLS
ALTER TABLE public.hotel_fact_sheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Internal users only can view
DROP POLICY IF EXISTS "Internal users can view hotel fact sheets" ON public.hotel_fact_sheets;
CREATE POLICY "Internal users can view hotel fact sheets"
ON public.hotel_fact_sheets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

-- Only admins can insert
DROP POLICY IF EXISTS "Admins can insert hotel fact sheets" ON public.hotel_fact_sheets;
CREATE POLICY "Admins can insert hotel fact sheets"
ON public.hotel_fact_sheets
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Only admins can update
DROP POLICY IF EXISTS "Admins can update hotel fact sheets" ON public.hotel_fact_sheets;
CREATE POLICY "Admins can update hotel fact sheets"
ON public.hotel_fact_sheets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Only admins can delete
DROP POLICY IF EXISTS "Admins can delete hotel fact sheets" ON public.hotel_fact_sheets;
CREATE POLICY "Admins can delete hotel fact sheets"
ON public.hotel_fact_sheets
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Create updated_at trigger (reuse existing function if available)
DROP TRIGGER IF EXISTS update_hotel_fact_sheets_updated_at ON public.hotel_fact_sheets;
CREATE TRIGGER update_hotel_fact_sheets_updated_at
    BEFORE UPDATE ON public.hotel_fact_sheets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.hotel_fact_sheets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hotel_fact_sheets TO authenticated;
