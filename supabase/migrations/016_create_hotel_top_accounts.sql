-- Create hotel_top_accounts table
CREATE TABLE IF NOT EXISTS public.hotel_top_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('Top', 'Target')),

    -- Fields for Top accounts
    rns_sold_2025 INTEGER,
    adr_2025 DECIMAL(10,2),
    rns_forecasted_2026 INTEGER,
    adr_2026 DECIMAL(10,2),

    -- Fields for Target accounts
    segment_type TEXT,

    -- Common fields
    description_long TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Lost', 'Pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hotel_top_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Internal users can view hotel top accounts" ON public.hotel_top_accounts;
DROP POLICY IF EXISTS "Admins can insert hotel top accounts" ON public.hotel_top_accounts;
DROP POLICY IF EXISTS "Admins can update hotel top accounts" ON public.hotel_top_accounts;
DROP POLICY IF EXISTS "Admins can delete hotel top accounts" ON public.hotel_top_accounts;

-- Hotel top accounts policies: Internal users can view, admins can manage
CREATE POLICY "Internal users can view hotel top accounts"
ON public.hotel_top_accounts
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

CREATE POLICY "Admins can insert hotel top accounts"
ON public.hotel_top_accounts
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update hotel top accounts"
ON public.hotel_top_accounts
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete hotel top accounts"
ON public.hotel_top_accounts
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
DROP INDEX IF EXISTS idx_hotel_top_accounts_hotel_name;
DROP INDEX IF EXISTS idx_hotel_top_accounts_account_type;
DROP INDEX IF EXISTS idx_hotel_top_accounts_status;

CREATE INDEX idx_hotel_top_accounts_hotel_name ON public.hotel_top_accounts(hotel_name);
CREATE INDEX idx_hotel_top_accounts_account_type ON public.hotel_top_accounts(account_type);
CREATE INDEX idx_hotel_top_accounts_status ON public.hotel_top_accounts(status);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_hotel_top_accounts_updated_at ON public.hotel_top_accounts;

CREATE TRIGGER update_hotel_top_accounts_updated_at
    BEFORE UPDATE ON public.hotel_top_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
