-- Migration: Lock user_type and role fields to admin-only changes
-- This prevents users from escalating their own privileges

-- Drop ALL existing update policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can update all users" ON users;
DROP POLICY IF EXISTS "Users can update their own name only" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

-- Create a new policy that only allows users to update their own name
CREATE POLICY "Users can update their own name only"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Only allow updating the name field
      -- User cannot change their email, user_type, or role
      (SELECT user_type FROM users WHERE id = auth.uid()) = user_type
      AND (SELECT role FROM users WHERE id = auth.uid()) = role
      AND (SELECT email FROM users WHERE id = auth.uid()) = email
    )
  );

-- Create a new policy for admins to update any user
-- This uses a custom function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update the delete policy to be admin-only as well
DROP POLICY IF EXISTS "Authenticated users can delete all users" ON users;
DROP POLICY IF EXISTS "Admins can delete any user" ON users;

CREATE POLICY "Admins can delete any user"
  ON users
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Add a comment to document the security model
COMMENT ON TABLE users IS 'Users table with admin-only access to user_type and role fields. Regular users can only update their own name.';
