-- Add archive functionality to hotel projects

-- Add archived column to hotel_projects
ALTER TABLE hotel_projects
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for archived status
CREATE INDEX IF NOT EXISTS idx_hotel_projects_archived ON hotel_projects(archived);

-- Update the existing delete policy to also allow creators
DROP POLICY IF EXISTS "Only admins can delete hotel projects" ON hotel_projects;

CREATE POLICY "Admins and creators can delete hotel projects"
    ON hotel_projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );
