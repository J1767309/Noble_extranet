# Hotel Tracker Module - Setup Guide

## What Was Built

I've created a comprehensive **Hotel Tracker** module for tracking issues and tactics across all Noble hotels. This module follows the same architecture as your Business Intelligence Tools module.

### Features

✅ **Hotel and Management Company Management**
- Admin interface to add/edit/delete hotels
- Admin interface to add/edit/management companies
- Pick lists ensure uniformity across all entries

✅ **Issue and Tactic Tracking**
- Track issues and tactics by hotel
- Date reported tracking
- Current/Not Current status
- Short and long descriptions
- Full CRUD operations (Create, Read, Update, Delete)

✅ **Advanced Filtering**
- Search by hotel name or description
- Filter by type (Issue/Tactic)
- Filter by status (Current/Not Current)
- Filter by hotel

✅ **Access Control**
- **Internal users only** - Only internal Noble users can view the Hotel Tracker
- **Admin edit capabilities** - Only admins can create, edit, or delete entries
- **Admin list management** - Only admins can manage the hotel and management company lists

✅ **Pre-populated Data**
- 54 hotels from your CSV file
- 9 management companies (McKibbon, Dunn hospitality, Concord, etc.)

## Files Created

### Database Migration
- `supabase/migrations/010_create_hotel_tracker.sql` - Creates all tables and policies

### HTML Pages
- `hotel-tracker.html` - Main tracker page with data grid

### JavaScript
- `js/hotel-tracker.js` - All CRUD operations and UI logic

### Updated Files
- `dashboard.html` - Added Hotel Tracker card for internal users
- `dashboard.js` - Shows Hotel Tracker card/link for internal users
- `bi-tools.html` - Added Hotel Tracker to sidebar
- `hotel-openings.html` - Added Hotel Tracker to sidebar
- `hotel-opening-detail.html` - Added Hotel Tracker to sidebar
- `user-management.html` - Added Hotel Tracker to sidebar
- All corresponding JavaScript files updated to show Hotel Tracker link for internal users

## How to Deploy

### Step 1: Run the Database Migration (2 minutes)

**Part A: Create the tables**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your `noble-extranet` project
3. Go to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Open the file `supabase/migrations/010_create_hotel_tracker.sql`
6. Copy the **entire contents** of that file
7. Paste it into the SQL Editor
8. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see a success message. This creates:
- `hotels` table (54 hotels pre-populated)
- `management_companies` table (9 companies pre-populated)
- `hotel_tracker` table (main tracking table)
- All Row Level Security policies
- All indexes for performance

**Part B: Import the existing data (97 entries)**

1. In the same **SQL Editor**, click **"New query"**
2. Open the file `supabase/migrations/011_import_hotel_tracker_data.sql`
3. Copy the **entire contents** of that file
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

This imports **97 issues and tactics** from your existing CSV file, including:
- All existing issues and tactics
- Dates, descriptions, current status
- Correct hotel and management company associations
- "Tatic" is automatically corrected to "Tactic"

### Step 2: Verify the Data Was Imported (30 seconds)

1. In Supabase Dashboard, go to **Table Editor**
2. You should see three new tables:
   - `hotels`
   - `management_companies`
   - `hotel_tracker`
3. Click on `hotels` - you should see 54 hotels listed
4. Click on `management_companies` - you should see 9 companies listed
5. Click on `hotel_tracker` - you should see **97 entries** from your CSV file!

### Step 3: Test the Module (2 minutes)

1. Start your local server (if not already running):
   ```bash
   python3 -m http.server 8080
   ```

2. Go to http://localhost:8080

3. **Log in as an internal user** (admins are internal by default)

4. You should see a new **"Hotel Tracker"** card on the dashboard

5. Click on the Hotel Tracker card

6. You should see:
   - The Hotel Tracker page with search/filter options
   - **97 tracker entries** from your CSV file!
   - Color-coded badges for Issues (red) and Tactics (blue)
   - Current status badges (green for Yes, gray for No)
   - If you're an admin, you'll see **"New Entry"** and **"Manage Lists"** buttons

### Step 4: Test Admin Features (if you're an admin)

1. Click **"Manage Lists"** button
2. You should see:
   - List of 54 hotels
   - List of 9 management companies
   - Ability to add new hotels/companies
   - Ability to delete hotels/companies

3. Click **"New Entry"** button
4. Fill out the form:
   - Select a hotel from dropdown
   - Select a management company from dropdown
   - Enter a date
   - Select type (Issue or Tactic)
   - Select current status
   - Enter descriptions
5. Click **"Save Entry"**

6. You should see your new entry in the table with:
   - Color-coded badges for type (Issue = red, Tactic = blue)
   - Current status badge (Yes = green, No = gray)
   - Edit and Delete buttons (admin only)

### Step 5: Test Filtering

1. Try the search box - type a hotel name
2. Try the filter dropdowns:
   - Filter by Type (Issue/Tactic)
   - Filter by Status (Current/Not Current)
   - Filter by Hotel

## Database Schema

### `hotels` Table
```sql
- id (UUID, Primary Key)
- name (TEXT, UNIQUE)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `management_companies` Table
```sql
- id (UUID, Primary Key)
- name (TEXT, UNIQUE)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `hotel_tracker` Table
```sql
- id (UUID, Primary Key)
- hotel_id (UUID, Foreign Key → hotels.id)
- management_company_id (UUID, Foreign Key → management_companies.id)
- date_reported (DATE)
- is_current (BOOLEAN)
- type (TEXT: 'Issue' or 'Tactic')
- description_short (TEXT)
- description_long (TEXT, optional)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## Access Control (Row Level Security)

### Hotels & Management Companies Tables
- **View**: All internal users
- **Create/Edit/Delete**: Admins only

### Hotel Tracker Table
- **View**: All internal users
- **Create/Edit/Delete**: Admins only

### External Users
- Cannot access Hotel Tracker at all
- Link is hidden from navigation
- Attempting to access the page directly redirects to dashboard with access denied message

## Pre-populated Data

### Hotels (54 total)
From your CSV file, including:
- AC BY MARRIOTT GAINES DOWNTOWN
- Courtyard By Marriot Indianapolis Fishers
- Hampton Inn & Suites Charlottesville
- Hilton Garden Inn Charlotte Uptown
- And 50 more...

### Management Companies (9 total)
- McKibbon
- Dunn hospitality
- Concord
- Aimbridge
- Apature
- Corp IHG
- Schulte Hospitality
- Raines
- Inter Mountain

## Usage Tips

### For Admins

**Managing Hotels and Companies:**
1. Click "Manage Lists" to add/remove hotels or companies
2. Hotels and companies are shared across all entries
3. Deleting a hotel/company will delete all associated tracker entries (CASCADE delete)

**Creating Entries:**
1. Click "New Entry"
2. Pick lists ensure consistent hotel and company names
3. Use "Current: Yes" for active issues/tactics
4. Use "Current: No" for resolved/completed items

**Best Practices:**
- Keep description short concise (one line summary)
- Use description long for detailed notes, action items, etc.
- Update "Current" status when issues are resolved or tactics completed
- Use consistent date format (the date picker handles this)

### For Internal Users (Non-Admins)

**Viewing and Filtering:**
1. Use search to find specific hotels or keywords
2. Use filters to narrow down by type, status, or hotel
3. Click column headers to sort (if implemented)
4. View all details in the description columns

## Troubleshooting

### "Access denied" message
- You must be logged in as an **internal user**
- External users cannot access Hotel Tracker
- Check your user_type in the users table

### Can't see "New Entry" or "Manage Lists" buttons
- These buttons are only visible to **admins**
- Check your role in the users table
- Regular internal users can only view, not edit

### Hotels or companies not showing in dropdowns
- Check that the migration ran successfully
- Go to Supabase Dashboard → Table Editor → hotels/management_companies
- Verify data exists

### Entries not saving
- Check browser console (F12) for errors
- Verify you're logged in as an admin
- Check that hotel_id and management_company_id are valid UUIDs

### Can't delete a hotel/company
- If it has associated tracker entries, those will be deleted too (CASCADE)
- You'll get a confirmation dialog to prevent accidents
- Check that you're logged in as an admin

## Next Steps (Optional Enhancements)

### Possible Future Additions:
1. **Export to CSV** - Download filtered results
2. **Bulk Import** - Import entries from your Google Sheet
3. **Email Notifications** - Alert stakeholders when new issues are logged
4. **Comments/Notes** - Add threaded comments to entries
5. **Attachments** - Upload files/screenshots for issues
6. **History Tracking** - See who edited what and when
7. **Dashboard Widgets** - Show summary stats (# current issues, etc.)

## Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check Supabase Dashboard → Table Editor to inspect data
3. Check Supabase Dashboard → Authentication to verify user access
4. Review RLS policies in Supabase Dashboard → Authentication → Policies

---

**You're all set!** The Hotel Tracker module is ready to use. Just run the migration and start tracking your hotel issues and tactics. 🏨✅
