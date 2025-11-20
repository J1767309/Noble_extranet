-- Create initiatives table
CREATE TABLE IF NOT EXISTS public.initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_name TEXT NOT NULL,
    initiative_type TEXT NOT NULL CHECK (initiative_type IN ('Expense', 'Revenue')),
    initiative_text TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On Hold', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Internal users can view initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can insert initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can update initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can delete initiatives" ON public.initiatives;

-- Initiatives policies: Internal users can view, role-based permissions for actions
CREATE POLICY "Internal users can view initiatives"
ON public.initiatives
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.user_type = 'internal'
    )
);

-- Admins and Creators can insert
CREATE POLICY "Admins and Creators can insert initiatives"
ON public.initiatives
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'creator')
    )
);

-- Admins, Creators, and Editors can update
CREATE POLICY "Admins, Creators, and Editors can update initiatives"
ON public.initiatives
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'creator', 'editor')
    )
);

-- Only Admins can delete
CREATE POLICY "Admins can delete initiatives"
ON public.initiatives
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
DROP INDEX IF EXISTS idx_initiatives_hotel_name;
DROP INDEX IF EXISTS idx_initiatives_type;
DROP INDEX IF EXISTS idx_initiatives_status;

CREATE INDEX idx_initiatives_hotel_name ON public.initiatives(hotel_name);
CREATE INDEX idx_initiatives_type ON public.initiatives(initiative_type);
CREATE INDEX idx_initiatives_status ON public.initiatives(status);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_initiatives_updated_at ON public.initiatives;

CREATE TRIGGER update_initiatives_updated_at
    BEFORE UPDATE ON public.initiatives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
