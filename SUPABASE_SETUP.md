# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Noble Extranet application.

## Why Supabase?

Supabase is much simpler than Firebase:
- ✅ **No complex security rules** - Just SQL-based Row Level Security
- ✅ **PostgreSQL database** - Powerful, reliable, and well-documented
- ✅ **Better error messages** - Clearer feedback when something goes wrong
- ✅ **Instant setup** - No waiting for rule propagation

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (or **"New Project"** if you're signed in)
3. Sign in with GitHub (recommended) or create an account
4. Click **"New Project"**
5. Fill in the details:
   - **Name**: `noble-extranet`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
6. Click **"Create new project"**
7. Wait 1-2 minutes for your project to be provisioned

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Click **"API"** in the left menu
3. You'll see two important values:
   - **Project URL** - Something like `https://xxxxx.supabase.co`
   - **anon public** key - A long string starting with `eyJ...`
4. **IMPORTANT**: Copy both of these values!

## Step 3: Update Your Configuration File

1. Open `js/supabase-config.js` in your project
2. Replace the placeholder values:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';  // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';  // Replace with your anon public key
```

Example:
```javascript
const supabaseUrl = 'https://abcdefghijklm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Step 4: Create the Users Table

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('internal', 'external')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read all users
CREATE POLICY "Authenticated users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert their own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update all users (for admin functionality)
CREATE POLICY "Authenticated users can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete all users (for admin functionality)
CREATE POLICY "Authenticated users can delete all users"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster email lookups
CREATE INDEX users_email_idx ON users(email);
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" - that's perfect!

## Step 5: Enable Email Authentication

1. In your Supabase dashboard, click **"Authentication"** in the left sidebar
2. Click **"Providers"** tab
3. **Email** should already be enabled by default
4. Scroll down to **Email Auth** settings:
   - ✅ Make sure **"Enable email confirmations"** is **DISABLED** for development
   - This allows users to sign up without email verification
5. Click **"Save"** if you made any changes

## Step 6: Test Your Setup

1. Make sure your configuration file is updated with your actual keys
2. Start your local server: `python3 -m http.server 8000`
3. Open your browser to [http://localhost:8000](http://localhost:8000)
4. Try creating a new account:
   - Enter your name
   - Enter an email
   - Create a password (at least 6 characters)
   - Select user type (Internal or External)
   - Click "Create Account"
5. You should be automatically logged in and see the dashboard!

## Step 7: Verify Users in Supabase

1. Go to **Authentication** in your Supabase dashboard
2. You should see your new user in the **"Users"** tab
3. Go to **Table Editor** in the sidebar
4. Click on the **"users"** table
5. You should see your user with name, email, user_type, and created_at

## Migrating Existing Firebase Users (Optional)

If you want to migrate your existing Firebase users to Supabase:

### Option 1: Have Users Re-register
The simplest option - just have your users create new accounts. Since you only have 2 users (john.jimenez@nobleinvestment.com and jimenez.john09@gmail.com), this is the easiest approach.

### Option 2: Manual Migration
1. Go to **Table Editor** → **users** in Supabase
2. Click **"Insert"** → **"Insert row"**
3. For each user, you'll need to:
   - First create the auth user in **Authentication** → **"Add user"**
   - Copy the generated UUID
   - Then create the database record with that UUID as the `id`

## Security Note

The current Row Level Security policies allow any authenticated user to manage other users. This is fine for initial development.

For production, you should:
1. Add an `is_admin` boolean column to the users table
2. Update the UPDATE and DELETE policies to check for admin status:

```sql
-- Future production policy example
CREATE POLICY "Only admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );
```

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the **anon public** key, not the service_role key
- Make sure there are no extra spaces in the configuration file

### "relation 'users' does not exist"
- Make sure you ran the SQL script in Step 4
- Check the **Table Editor** to verify the table was created

### Users can't sign up
- Check that email authentication is enabled
- Make sure email confirmations are disabled for development
- Check the browser console (F12) for specific error messages

### "new row violates row-level security policy"
- Make sure RLS policies were created correctly
- Run the policy creation SQL again if needed

## Need Help?

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **SQL Editor**: Use this to run queries and check your data
- **Logs**: Check **Logs** in the sidebar for detailed error messages
- **Browser Console**: Press F12 to see client-side errors
