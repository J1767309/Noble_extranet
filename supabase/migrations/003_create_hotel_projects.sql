-- Create hotel_projects table
CREATE TABLE IF NOT EXISTS hotel_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'In Progress',
    opening_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES hotel_projects(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    department TEXT NOT NULL,
    additional_info TEXT,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'Not Started',
    responsible TEXT,
    project_reference TEXT,
    steps_done TEXT,
    tag TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hotel_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel_projects
-- All authenticated users can view hotel projects
CREATE POLICY "All users can view hotel projects"
    ON hotel_projects FOR SELECT
    TO authenticated
    USING (true);

-- Only admins and creators can insert hotel projects
CREATE POLICY "Admins and creators can create hotel projects"
    ON hotel_projects FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );

-- Only admins and creators can update hotel projects
CREATE POLICY "Admins and creators can update hotel projects"
    ON hotel_projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );

-- Only admins can delete hotel projects
CREATE POLICY "Only admins can delete hotel projects"
    ON hotel_projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- RLS Policies for project_tasks
-- All authenticated users can view tasks
CREATE POLICY "All users can view project tasks"
    ON project_tasks FOR SELECT
    TO authenticated
    USING (true);

-- Admins, creators, and editors can insert tasks
CREATE POLICY "Admins, creators, and editors can create tasks"
    ON project_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator', 'editor')
        )
    );

-- Admins, creators, and editors can update tasks
CREATE POLICY "Admins, creators, and editors can update tasks"
    ON project_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator', 'editor')
        )
    );

-- Only admins and creators can delete tasks
CREATE POLICY "Admins and creators can delete tasks"
    ON project_tasks FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'creator')
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_department ON project_tasks(department);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_hotel_projects_created_at ON hotel_projects(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_hotel_projects_updated_at BEFORE UPDATE ON hotel_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
