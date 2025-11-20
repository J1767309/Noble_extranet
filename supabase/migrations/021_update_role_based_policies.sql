-- Migration: Update all table policies to support role-based permissions
-- This aligns database policies with the frontend role-based access control

-- ========================================
-- HOTEL TRACKER POLICIES
-- ========================================

-- Drop old policies
DROP POLICY IF EXISTS "Internal users can insert hotel tracker" ON public.hotel_tracker;
DROP POLICY IF EXISTS "Internal users can update hotel tracker" ON public.hotel_tracker;
DROP POLICY IF EXISTS "Internal users can delete hotel tracker" ON public.hotel_tracker;
DROP POLICY IF EXISTS "Admins can insert hotel tracker" ON public.hotel_tracker;
DROP POLICY IF EXISTS "Admins can update hotel tracker" ON public.hotel_tracker;
DROP POLICY IF EXISTS "Admins can delete hotel tracker" ON public.hotel_tracker;

-- Admins and Creators can insert
CREATE POLICY "Admins and Creators can insert hotel tracker"
ON public.hotel_tracker
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
CREATE POLICY "Admins, Creators, and Editors can update hotel tracker"
ON public.hotel_tracker
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
CREATE POLICY "Admins can delete hotel tracker"
ON public.hotel_tracker
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
-- MANAGEMENT TRACKER POLICIES
-- ========================================

DROP POLICY IF EXISTS "Internal users can insert management tracker" ON public.management_tracker;
DROP POLICY IF EXISTS "Internal users can update management tracker" ON public.management_tracker;
DROP POLICY IF EXISTS "Internal users can delete management tracker" ON public.management_tracker;
DROP POLICY IF EXISTS "Admins can insert management tracker" ON public.management_tracker;
DROP POLICY IF EXISTS "Admins can update management tracker" ON public.management_tracker;
DROP POLICY IF EXISTS "Admins can delete management tracker" ON public.management_tracker;

-- Admins and Creators can insert
CREATE POLICY "Admins and Creators can insert management tracker"
ON public.management_tracker
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
CREATE POLICY "Admins, Creators, and Editors can update management tracker"
ON public.management_tracker
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
CREATE POLICY "Admins can delete management tracker"
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

-- ========================================
-- BI TOOLS POLICIES
-- ========================================

DROP POLICY IF EXISTS "Internal users can insert bi tools" ON public.bi_tools;
DROP POLICY IF EXISTS "Internal users can update bi tools" ON public.bi_tools;
DROP POLICY IF EXISTS "Internal users can delete bi tools" ON public.bi_tools;
DROP POLICY IF EXISTS "Admins can insert bi tools" ON public.bi_tools;
DROP POLICY IF EXISTS "Admins can update bi tools" ON public.bi_tools;
DROP POLICY IF EXISTS "Admins can delete bi tools" ON public.bi_tools;

-- Admins and Creators can insert
CREATE POLICY "Admins and Creators can insert bi tools"
ON public.bi_tools
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
CREATE POLICY "Admins, Creators, and Editors can update bi tools"
ON public.bi_tools
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
CREATE POLICY "Admins can delete bi tools"
ON public.bi_tools
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
-- UPDATE HOTEL TOP ACCOUNTS POLICIES (if needed)
-- ========================================

DROP POLICY IF EXISTS "Admins can insert hotel top accounts" ON public.hotel_top_accounts;
DROP POLICY IF EXISTS "Admins can update hotel top accounts" ON public.hotel_top_accounts;

-- These should already exist from migration 016, but we'll ensure they're correct
DROP POLICY IF EXISTS "Admins and Creators can insert hotel top accounts" ON public.hotel_top_accounts;
CREATE POLICY "Admins and Creators can insert hotel top accounts"
ON public.hotel_top_accounts
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'creator')
    )
);

DROP POLICY IF EXISTS "Admins, Creators, and Editors can update hotel top accounts" ON public.hotel_top_accounts;
CREATE POLICY "Admins, Creators, and Editors can update hotel top accounts"
ON public.hotel_top_accounts
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'creator', 'editor')
    )
);

-- ========================================
-- UPDATE INITIATIVES POLICIES (if needed)
-- ========================================

DROP POLICY IF EXISTS "Admins can insert initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can update initiatives" ON public.initiatives;

-- These should already exist from migration 018, but we'll ensure they're correct
DROP POLICY IF EXISTS "Admins and Creators can insert initiatives" ON public.initiatives;
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

DROP POLICY IF EXISTS "Admins, Creators, and Editors can update initiatives" ON public.initiatives;
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
