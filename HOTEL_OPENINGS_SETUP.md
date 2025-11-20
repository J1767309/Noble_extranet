# Hotel Openings Module - Setup Instructions

I've created a complete "Hotel Openings" module for managing hotel opening projects and their critical paths. Here's what's been built and what you need to do to activate it.

## What's Been Created

### 1. Database Schema
- **hotel_projects** table - Stores hotel opening projects
- **project_tasks** table - Stores all tasks for each project with department organization
- Row Level Security (RLS) policies for role-based access
- Indexes for performance

### 2. New Pages
- [hotel-openings.html](hotel-openings.html) - Main projects list page
- [hotel-opening-detail.html](hotel-opening-detail.html) - Project detail page with task management

### 3. JavaScript Files
- [js/hotel-openings.js](js/hotel-openings.js) - Projects list functionality
- [js/hotel-opening-detail.js](js/hotel-opening-detail.js) - Task management functionality

### 4. Dashboard Integration
- Added "Hotel Openings" card to [dashboard.html](dashboard.html) (visible to all users)
- Added "Hotel Openings" link to sidebar on all pages

### 5. Sample Data
- RS Jacksonville Southwest project with 60+ tasks from your Tasks.pdf
- Tasks organized by 13 departments
- Various statuses (Complete, In Progress, Not Started, etc.)

---

## Setup Steps

### Step 1: Run Database Migrations

You need to run two SQL files in your Supabase SQL Editor:

#### A. Create the tables (Migration 003)

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/sql/new
2. Copy all the contents from [supabase/migrations/003_create_hotel_projects.sql](supabase/migrations/003_create_hotel_projects.sql)
3. Paste into the SQL Editor
4. Click **"Run"**
5. You should see: "Success. No rows returned"

#### B. Import sample data (Migration 004)

1. Stay in the SQL Editor or create a new query
2. Copy all the contents from [supabase/migrations/004_import_rs_jacksonville_southwest.sql](supabase/migrations/004_import_rs_jacksonville_southwest.sql)
3. Paste into the SQL Editor
4. Click **"Run"**
5. You should see: "Success. No rows returned"

---

### Step 2: Test the Module

1. Open your application: http://localhost:8000
2. Log in as admin (john.jimenez@nobleinvestment.com)
3. You should see the **"Hotel Openings"** card on the dashboard
4. Click on it to view the projects list
5. You should see **"RS Jacksonville Southwest"** project
6. Click on the project to see all 60+ tasks organized by department

---

## Features

### For All Users
- ✅ View all hotel opening projects
- ✅ View project details and task lists
- ✅ Filter tasks by status and department
- ✅ Track progress (percentage complete)

### For Admins, Creators, and Editors
- ✅ Edit task details (click any task row)
- ✅ Update task status
- ✅ Add new tasks to projects

### For Admins and Creators Only
- ✅ Create new hotel projects
- ✅ Delete projects

---

## Task Organization

Tasks are organized by these departments:
- **Opening - Brand** (Marriott standards, uniforms, key cards, etc.)
- **Opening - Engineering** (ADA compliance, systems setup)
- **Opening - Finance** (Accounting, budgets, banking)
- **Opening - Front Office** (PMS, credit cards, training)
- **Opening - Human Resources** (Hiring, payroll, orientation)
- **Opening - Management Company** (Agreements, GM assignment)
- **Opening - Marketing** (Website, social media, events)
- **Opening - Marketing Products** (Google, TripAdvisor, booking engine)
- **Opening - Revenue Management** (Pricing, rate strategy)
- **Opening - Sales** (Sales plans, corporate accounts)
- **Opening - Sales + Pricing Products** (GDS, channel manager)
- **Opening - Sales Advisory Tracking** (CRM, procedures)
- **Opening - Total Hotel** (Final walk-through, opening events)

---

## Task Statuses

Each task can have one of these statuses:
- **Not Started** - Task hasn't been started yet
- **In Progress** - Task is currently being worked on
- **Complete** - Task is finished
- **Need Resources** - Task is blocked, needs resources
- **Not Applicable** - Task doesn't apply to this project

---

## Sample Project: RS Jacksonville Southwest

The imported project includes:
- **Project Name**: RS Jacksonville Southwest
- **Target Opening**: December 1, 2025
- **Status**: In Progress
- **60+ Tasks** across all departments
- **Mix of statuses** showing realistic project progress

---

## Next Steps

After running the SQL migrations:

1. **Test the functionality** - Create a new project, add tasks, update statuses
2. **Customize if needed** - Add more departments, change statuses, etc.
3. **Train your team** - Show them how to use the module
4. **Add more projects** - Create additional hotel opening projects as needed

---

## File Structure

```
Noble Extranet/
├── hotel-openings.html              # Projects list page
├── hotel-opening-detail.html        # Project detail page
├── dashboard.html                   # Updated with Hotel Openings card
├── js/
│   ├── hotel-openings.js           # Projects functionality
│   └── hotel-opening-detail.js     # Task management
├── supabase/
│   └── migrations/
│       ├── 003_create_hotel_projects.sql      # Database schema
│       └── 004_import_rs_jacksonville_southwest.sql  # Sample data
└── Supporting Documents/
    └── Tasks.pdf                   # Original template (RS Jacksonville Southwest)
```

---

## Questions?

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Verify the SQL migrations ran successfully
3. Confirm you're logged in as a user with appropriate role
4. Check that the tables were created in Supabase

The module is ready to use once you run the two SQL migrations!
