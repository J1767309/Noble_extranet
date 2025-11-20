-- Update RLS policies to restrict project visibility based on role and assignment

-- Drop the existing "All users can view hotel projects" policy
DROP POLICY IF EXISTS "All users can view hotel projects" ON hotel_projects;

-- Create new policy: Admins and creators see all projects, editors and read-only see only assigned projects
CREATE POLICY "Users can view projects based on role and assignment"
    ON hotel_projects FOR SELECT
    TO authenticated
    USING (
        -- Admins and creators can see all projects
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
        OR
        -- Editors and read-only can only see projects they're assigned to
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = hotel_projects.id
            AND project_users.user_id = auth.uid()
        )
    );

-- Drop the existing "All users can view project tasks" policy
DROP POLICY IF EXISTS "All users can view project tasks" ON project_tasks;

-- Create new policy: Users can only view tasks for projects they have access to
CREATE POLICY "Users can view tasks based on project access"
    ON project_tasks FOR SELECT
    TO authenticated
    USING (
        -- Admins and creators can see all tasks
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
        OR
        -- Editors and read-only can only see tasks for assigned projects
        EXISTS (
            SELECT 1 FROM project_users
            WHERE project_users.project_id = project_tasks.project_id
            AND project_users.user_id = auth.uid()
        )
    );

-- Update project_users view policy to allow users to see their own assignments
DROP POLICY IF EXISTS "All users can view project assignments" ON project_users;

CREATE POLICY "Users can view relevant project assignments"
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
        -- Other users can only see assignments for projects they're assigned to
        project_id IN (
            SELECT project_id FROM project_users
            WHERE user_id = auth.uid()
        )
    );
