# Edge Functions Setup - User Management

This guide shows you how to set up the Edge Functions that manage users in both Authentication and the Database.

## Why We Need These Functions

When you create or delete users from the User Management page, we need to manage them in TWO places:
1. **Supabase Authentication** - The auth account
2. **Database (users table)** - The user record

For security, clients can't create or delete auth accounts directly. That's why we need server-side Edge Functions.

## Setup Instructions

You need to create TWO Edge Functions: `create-user` and `delete-user`

### Function 1: Create User

#### Step 1: Create the create-user Function

1. Go to your Supabase dashboard: [https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt](https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt)

2. Click **"Edge Functions"** in the left sidebar

3. Click **"Create a new function"** button

4. Enter function name: `create-user`

5. **Copy and paste this code:**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, name, userType, role } = await req.json()

    if (!email || !password || !name || !userType || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, password, name, user type, and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name,
        user_type: userType,
        role: role
      }
    })

    if (authError) {
      throw authError
    }

    // Create user in database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        name: name,
        email: email,
        user_type: userType,
        role: role,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw dbError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: email,
          name: name,
          user_type: userType,
          role: role
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

6. Click **"Deploy"** button

7. Wait for deployment to complete

### Function 2: Delete User

#### Step 1: Create the delete-user Function

1. In the same **Edge Functions** section, click **"Create a new function"** again

2. Enter function name: `delete-user`

3. **Copy and paste this code:**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete from users table first
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      throw dbError
    }

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      throw authError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

4. Click **"Deploy"** button

5. Wait for deployment to complete (should take 10-30 seconds)

## Verify Deployment

After deploying both functions:
1. Go to **Edge Functions** in Supabase dashboard
2. You should see both functions listed:
   - `create-user` - Status: **Active**
   - `delete-user` - Status: **Active**
3. Function URLs:
   - Create: `https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/create-user`
   - Delete: `https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/delete-user`

## Testing It

### Test 1: Create a New User (Edge Function)

1. Log in to your website as admin (john.jimenez@nobleinvestment.com)
2. Go to **User Management**
3. Click the **"Create New User"** button
4. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
   - User Type: `Internal User`
5. Click **"Create User"**
6. You should see "User created successfully!" message
7. The new user should appear in the table immediately! ✅

### Test 2: Verify User Was Created in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see `test@example.com` in the list ✅
3. Go to Supabase Dashboard → **Table Editor** → **users** table
4. You should see the test user there too! ✅

### Test 3: Delete the Test User (Edge Function)

1. In **User Management**, find the test user
2. Click the **Delete** button (trash icon)
3. Confirm the deletion
4. You should see "User deleted successfully!" message
5. The user should disappear from the table ✅

### Test 4: Verify Complete Deletion

1. Check User Management - test user should be gone ✅
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. The test user should be gone from there too! ✅
4. Check **Table Editor** → **users** table
5. The test user should be gone from the database! ✅

If all tests pass, everything is working perfectly!

## How It Works

### Creating a User

When you click "Create New User" and submit the form:

1. **Frontend** calls the `create-user` Edge Function with email, password, name, and user type
2. **Edge Function** (server-side) does two things:
   - Creates the account in Supabase Authentication
   - Creates the record in the `users` table
3. **Frontend** updates the UI to add the new user to the list

If the database insert fails, the Edge Function automatically deletes the auth account to keep everything in sync!

### Deleting a User

When you click "Delete User" and confirm:

1. **Frontend** calls the `delete-user` Edge Function with the user ID
2. **Edge Function** (server-side) does two things:
   - Deletes the record from the `users` table
   - Deletes the account from Supabase Authentication
3. **Frontend** updates the UI to remove the user from the list

## Troubleshooting

### Error: "Function not found"
- Make sure you deployed the function
- Check the function name is exactly `delete-user` (with a dash, not underscore)
- Wait a few minutes and try again

### Error: "Missing or insufficient permissions"
- This shouldn't happen with Edge Functions (they use service role)
- If you see this, check that the function was deployed correctly

### Delete button shows "Deleting..." forever
- Open browser console (F12) to see the error
- The Edge Function might not be deployed yet
- Check Supabase Dashboard → Edge Functions → Logs for errors

### User deleted from database but not from auth (or vice versa)
- Check the Edge Function logs in Supabase Dashboard
- The function might have failed partway through
- You can manually delete the remaining user from Supabase Dashboard

## Security Note

The Edge Function uses the **service role key** which has full admin permissions. This is safe because:
- ✅ The function runs on Supabase servers (not in the browser)
- ✅ The service role key is never exposed to users
- ✅ Only authenticated users can call the function

For production, you should add additional checks:
- Verify the requesting user is an admin
- Add rate limiting
- Log all deletions for audit trail

## Next Steps

After setting up both functions, user management will be seamless:
- ✅ Create users directly from the admin panel
- ✅ Users are created in both auth and database automatically
- ✅ Delete users with one click (from both auth and database)
- ✅ No orphaned records
- ✅ Clean, professional user management experience

---

**Need help?** Check the Supabase Edge Functions docs: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
