-- Migration: Add type field to bug_reports table
-- Allows distinguishing between bug reports and feature requests

-- Add type column to bug_reports table
ALTER TABLE public.bug_reports
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'bug' CHECK (type IN ('bug', 'feature'));

-- Update existing records to have type 'bug'
UPDATE public.bug_reports
SET type = 'bug'
WHERE type IS NULL;

-- Add index for faster queries on type
CREATE INDEX IF NOT EXISTS idx_bug_reports_type ON public.bug_reports(type);

-- Add comment to table
COMMENT ON TABLE public.bug_reports IS 'Stores bug reports and feature requests submitted by users';
COMMENT ON COLUMN public.bug_reports.type IS 'Type of report: bug or feature';
