-- Fix infinite recursion in project_users RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view relevant project assignments" ON project_users;

-- Create corrected policy: Users can see assignments where they are admin/creator, or their own assignments
CREATE POLICY "Users can view project assignments"
    ON project_users FOR SELECT
    TO authenticated
    USING (
        -- Admins and creators can see all assignments
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
        OR
        -- Other users can only see their own assignments
        user_id = auth.uid()
    );
