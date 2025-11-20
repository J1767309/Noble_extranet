# How to Get Your Supabase Access Token

The token you provided isn't working for CLI deployment. You need a **Personal Access Token** from your Supabase account settings.

## Step-by-Step Instructions:

### 1. Go to your Supabase Account Tokens page
**Direct link:** https://supabase.com/dashboard/account/tokens

### 2. Generate a new token
- Click the **"Generate New Token"** button
- Give it a name like: `Edge Functions Deploy`
- Click **"Generate Token"**

### 3. Copy the token
- The token will look like: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- It should be MUCH LONGER than the one you provided (around 100+ characters)
- **IMPORTANT:** This is NOT the same as your project API key or service role key!

### 4. Use the token
Once you have the token, run this in your terminal:

```bash
export SUPABASE_ACCESS_TOKEN='paste-the-long-token-here'
./deploy-functions.sh
```

---

## Alternative: Manual Dashboard Deployment

If you prefer not to use the CLI, you can deploy manually through the dashboard:

### Deploy create-user function:

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions
2. Click **"Deploy a new function"** or **"New function"**
3. Name it: `create-user`
4. Copy the code from: `supabase/functions/create-user/index.ts`
5. Paste it into the editor
6. Click **"Deploy"**
7. Wait for it to show as "Active"

### Deploy delete-user function:

1. Click **"Deploy a new function"** again
2. Name it: `delete-user`
3. Copy the code from: `supabase/functions/delete-user/index.ts`
4. Paste it into the editor
5. Click **"Deploy"**
6. Wait for it to show as "Active"

---

## The code files are ready to copy:

I've created both function files locally:
- [supabase/functions/create-user/index.ts](supabase/functions/create-user/index.ts)
- [supabase/functions/delete-user/index.ts](supabase/functions/delete-user/index.ts)

You can open these files and copy/paste them into the Supabase dashboard.

---

## After Deployment

Once both functions are deployed (via CLI or dashboard), test user creation:

1. Open: http://localhost:8000
2. Log in as admin
3. Go to **User Management**
4. Click **"Create New User"**
5. Fill in the form and submit
6. Should work without CORS errors! ✅
