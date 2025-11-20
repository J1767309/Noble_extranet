-- Create project_users junction table for assigning users to projects
CREATE TABLE IF NOT EXISTS project_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES hotel_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view project assignments
CREATE POLICY "All users can view project assignments"
    ON project_users FOR SELECT
    TO authenticated
    USING (true);

-- Admins and creators can assign users to projects
CREATE POLICY "Admins and creators can assign users"
    ON project_users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );

-- Admins and creators can remove user assignments
CREATE POLICY "Admins and creators can remove assignments"
    ON project_users FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );

-- Create index for better performance
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
