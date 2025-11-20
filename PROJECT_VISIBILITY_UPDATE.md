# Project Visibility Update - Role-Based Access

I've updated the Hotel Openings module to restrict project visibility based on user roles and assignments.

## New Permission Structure

### Admins & Creators
✅ **Can see ALL hotel projects**
✅ Can create new projects
✅ Can assign users to projects
✅ Can view and edit all tasks across all projects

### Editors
⚠️ **Can ONLY see projects they're assigned to**
✅ Can add tasks to assigned projects
✅ Can edit tasks in assigned projects
✅ Can update task status, responsible parties, dates, etc.
❌ Cannot create new projects
❌ Cannot assign users to projects
❌ Cannot see projects they're not assigned to

### Read-Only Users
⚠️ **Can ONLY see projects they're assigned to**
✅ Can view tasks in assigned projects
✅ Can filter and search tasks
❌ Cannot create projects
❌ Cannot assign users
❌ Cannot add or edit tasks
❌ Cannot see projects they're not assigned to

---

## What Changed

### Database Level (RLS Policies)
- **hotel_projects table**: Now filters projects based on role and assignment
- **project_tasks table**: Users can only see tasks for projects they have access to
- **project_users table**: Users can only see assignments for projects they have access to

### UI Level
- **Empty state messages**: Different messages for editors/read-only vs admins/creators
- **Page subtitle**: Shows "Your assigned hotel opening projects" for editors/read-only
- **Automatic filtering**: Projects list automatically shows only accessible projects

---

## Setup - Run the Migration

You need to run ONE more SQL migration to enable this feature:

### Run Migration 006

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/sql/new
2. Copy all contents from [supabase/migrations/006_update_project_visibility.sql](supabase/migrations/006_update_project_visibility.sql)
3. Paste into the SQL Editor
4. Click **"Run"**

---

## How It Works

### For Admins & Creators:
1. Log in → See ALL projects on the Hotel Openings page
2. Can create new projects
3. Can assign any user to any project
4. Full access to all tasks

### For Editors & Read-Only:
1. Log in → See ONLY projects they're assigned to
2. If not assigned to any projects, they see: "No assigned projects - Contact an admin to be added to a project"
3. Once assigned to a project, it appears in their list
4. They can only view/edit tasks within their assigned projects

---

## Testing the New Permissions

### Test Case 1: Create an Editor User
1. As admin, create a new user with "editor" role
2. Log in as that editor
3. You should see "No assigned projects" message
4. Log back in as admin, assign the editor to a project
5. Log in as editor again → Now you see that one project

### Test Case 2: Verify Admins See Everything
1. Log in as admin
2. You should see ALL projects (including RS Jacksonville Southwest)
3. You can create new projects
4. You can assign users

### Test Case 3: Verify Task Access
1. As editor assigned to Project A
2. Go to Project A → You can see and edit tasks ✅
3. Try accessing a different project URL directly → Access denied ❌

---

## Migration History

1. **003_create_hotel_projects.sql** - Created hotel_projects and project_tasks tables
2. **004_import_rs_jacksonville_southwest.sql** - Imported sample project data
3. **005_add_project_users.sql** - Created user assignment functionality
4. **006_update_project_visibility.sql** - ⭐ NEW: Restricted visibility based on roles

---

## After Running the Migration

1. **Test with your admin account** - You should see all projects (no change)
2. **Create a test editor account** - They should see no projects initially
3. **Assign the editor to a project** - They should now see only that project
4. **Verify read-only access** - Same behavior as editors for viewing

The RLS policies ensure data security at the database level, so even if someone tries to access data directly via the API, they'll only get projects they're allowed to see.
