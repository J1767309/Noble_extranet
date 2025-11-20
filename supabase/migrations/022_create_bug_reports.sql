-- Migration: Create bug_reports table with role-based access control
-- Allows any authenticated user to submit bug reports
-- Admins can view all reports and manage them

-- ========================================
-- CREATE BUG REPORTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    page_url TEXT,
    browser TEXT,
    screenshot_url TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
    admin_notes TEXT,
    reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Add index for faster queries
CREATE INDEX idx_bug_reports_reported_by ON public.bug_reports(reported_by);
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_priority ON public.bug_reports(priority);
CREATE INDEX idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert (submit bugs)
CREATE POLICY "All authenticated users can submit bug reports"
ON public.bug_reports
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reported_by
);

-- Admins can view all bug reports
CREATE POLICY "Admins can view all bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Users can view their own bug reports
CREATE POLICY "Users can view their own bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (
    reported_by = auth.uid()
);

-- Only Admins can update bug reports (status, priority, notes, assignment)
CREATE POLICY "Admins can update bug reports"
ON public.bug_reports
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Only Admins can delete bug reports
CREATE POLICY "Admins can delete bug reports"
ON public.bug_reports
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- ========================================
-- COMMENTS
-- ========================================

-- Grant permissions
GRANT SELECT, INSERT ON public.bug_reports TO authenticated;
GRANT UPDATE, DELETE ON public.bug_reports TO authenticated;
