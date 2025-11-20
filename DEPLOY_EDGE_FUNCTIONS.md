# Deploy Edge Functions - Quick Guide

Your Edge Functions are now created locally and ready to deploy! Choose one of the methods below:

## ✅ Method 1: Automated CLI Deployment (Recommended)

This is the fastest and most reliable method.

### Step 1: Get Your Supabase Access Token

1. Go to: [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **"Generate New Token"**
3. Name it: `CLI Deploy`
4. Copy the token (it will look like: `sbp_xxxxxxxxxxxxx...`)

### Step 2: Set the Environment Variable

In your terminal, run:
```bash
export SUPABASE_ACCESS_TOKEN='your-token-here'
```
(Replace `your-token-here` with the actual token you copied)

### Step 3: Run the Deployment Script

```bash
./deploy-functions.sh
```

That's it! The script will:
- ✅ Link your local project to Supabase
- ✅ Deploy the `create-user` function
- ✅ Deploy the `delete-user` function
- ✅ Confirm both functions are live

### Step 4: Test User Creation

1. Open your website at `http://localhost:8000`
2. Log in as admin (`john.jimenez@nobleinvestment.com`)
3. Go to **User Management**
4. Click **"Create New User"**
5. Fill in the form and click **"Create User"**
6. You should see: **"User created successfully!"** ✅

---

## 🔄 Method 2: Manual Dashboard Deployment (Alternative)

If you prefer using the Supabase dashboard:

### For create-user function:

1. Go to: [https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions](https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions)
2. Click **"Deploy a new function"** or **"New function"**
3. Function name: `create-user`
4. Click **"Continue"** or **"Next"**
5. Copy the contents of `supabase/functions/create-user/index.ts` and paste into the editor
6. Click **"Deploy"**
7. Wait for deployment to complete (usually 10-30 seconds)

### For delete-user function:

1. In the same **Edge Functions** section, click **"Deploy a new function"** again
2. Function name: `delete-user`
3. Click **"Continue"** or **"Next"**
4. Copy the contents of `supabase/functions/delete-user/index.ts` and paste into the editor
5. Click **"Deploy"**
6. Wait for deployment to complete

---

## 🔍 Verify Deployment

After deploying (using either method), verify the functions are live:

1. Go to: [https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions](https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions)
2. You should see both functions listed:
   - ✅ `create-user` - Status: **Active**
   - ✅ `delete-user` - Status: **Active**

---

## 🐛 Troubleshooting

### "Access token not provided"
- Make sure you ran: `export SUPABASE_ACCESS_TOKEN='your-token'`
- The token should start with `sbp_`
- Run the export command in the same terminal window where you run the script

### "CORS error" after deployment
- Wait 1-2 minutes for the functions to fully deploy
- Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check that both functions show as "Active" in the dashboard

### Functions show as "Active" but still getting errors
- Check the function logs in the Supabase dashboard
- Verify the code was pasted correctly (especially the `corsHeaders` at the top)
- Make sure you deployed BOTH functions (create-user AND delete-user)

---

## 📁 Files Created

The following files were created in your project:

```
supabase/
├── config.toml                          # Supabase configuration
├── functions/
│   ├── create-user/
│   │   └── index.ts                     # Create user function (with CORS)
│   └── delete-user/
│       └── index.ts                     # Delete user function (with CORS)
deploy-functions.sh                      # Automated deployment script
DEPLOY_EDGE_FUNCTIONS.md                 # This file
```

---

## ✨ What's Next?

Once deployed, you'll be able to:
- ✅ Create new users from the User Management page
- ✅ Users are automatically created in BOTH Supabase Auth and Database
- ✅ Delete users with one click (removed from both Auth and Database)
- ✅ Assign roles: admin, creator, editor, read-only
- ✅ No more CORS errors!
- ✅ Professional user management system

---

Need help? Check the function logs at:
[https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/logs/edge-functions](https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/logs/edge-functions)
