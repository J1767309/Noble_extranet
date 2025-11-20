# Daily Project Email Updates - Setup Guide

This guide will help you set up automated daily email updates for hotel opening projects.

## Overview

The system sends a daily email to each user assigned to a project, containing:
- Project name, status, and target opening date
- Overall progress percentage
- Task breakdown by status (Complete, In Progress, Not Started, Need Resources)
- Direct link to view the project

---

## Step 1: Set Up Resend (Email Service)

### 1.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Add and Verify Your Domain
1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `your-domain.com`)
4. Add the DNS records shown to your domain's DNS settings:
   - **SPF Record** (TXT)
   - **DKIM Records** (TXT)
   - **DMARC Record** (TXT)
5. Wait for verification (usually takes a few minutes to a few hours)

**Note:** Until domain is verified, you can use Resend's test domain for development, but emails will only go to your verified email address.

### 1.3 Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **"Create API Key"**
3. Give it a name like "Hotel Openings Daily Emails"
4. Select **"Full access"** permission
5. Click **"Add"**
6. **Copy the API key** (starts with `re_`) - you'll need this in the next step

⚠️ **Important:** Save this key securely - you won't be able to see it again!

---

## Step 2: Configure Supabase Environment Variables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/settings/functions
2. Click on **"Edge Functions"** in the left sidebar
3. Go to **"Manage Secrets"** or **"Environment Variables"**
4. Add the following secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key from Step 1.3 (e.g., `re_123abc...`)
5. Click **"Save"**

---

## Step 3: Update Email Configuration

Before deploying, you need to update the email sender address in the Edge Function:

1. Open `supabase/functions/send-daily-project-updates/index.ts`
2. Find line 93 (the "from" field):
   ```typescript
   from: 'Noble Hotel Openings <noreply@your-domain.com>',
   ```
3. Replace `your-domain.com` with your actual verified domain from Resend
   ```typescript
   from: 'Noble Hotel Openings <noreply@nobleinvestmentgroup.com>',
   ```
4. Also update line 107 (the projectUrl):
   ```typescript
   projectUrl: `https://your-actual-domain.com/hotel-opening-detail.html?id=${project.id}`
   ```
   Replace with your actual app URL (could be your domain or the Supabase URL)

---

## Step 4: Deploy the Edge Function

### Option A: Deploy via Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions
2. Click **"Create a new function"**
3. Name it: `send-daily-project-updates`
4. Copy all the code from `supabase/functions/send-daily-project-updates/index.ts`
5. Paste it into the code editor
6. Click **"Deploy function"**

### Option B: Deploy via CLI

```bash
# Make sure you're in the project directory
cd "/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/Noble Extranet"

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref gfsusmsstpjqwrvcxjzt

# Deploy the function
supabase functions deploy send-daily-project-updates
```

---

## Step 5: Set Up Daily Cron Job

You have two options for scheduling:

### Option A: Using pg_cron (PostgreSQL Extension)

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/database/extensions
2. Enable the **"pg_cron"** extension
3. Go to SQL Editor: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/sql/new
4. Run this SQL to schedule daily emails at 8:00 AM UTC:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily project update emails at 8:00 AM UTC
SELECT cron.schedule(
  'send-daily-project-updates',
  '0 8 * * *',  -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/send-daily-project-updates',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY_HERE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

**Important:** Replace `YOUR_ANON_KEY_HERE` with your actual Supabase anon key:
- Find it at: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/settings/api
- Copy the **"anon" "public"** key

### Option B: Using External Cron Service (Easier - Recommended)

Use a service like **cron-job.org** or **EasyCron**:

1. Go to [https://cron-job.org](https://cron-job.org) (free)
2. Create an account
3. Click **"Create cronjob"**
4. Configure:
   - **Title:** "Hotel Openings Daily Emails"
   - **URL:** `https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/send-daily-project-updates`
   - **Schedule:** Every day at 8:00 AM (your timezone)
   - **Request Method:** POST
   - **Headers:**
     - Add header: `Authorization` = `Bearer YOUR_ANON_KEY_HERE`
     - Add header: `Content-Type` = `application/json`
5. Click **"Create"**

**To change the time:**
- Adjust the schedule in cron-job.org dashboard
- Or change the cron expression in pg_cron (e.g., `0 9 * * *` for 9 AM)

---

## Step 6: Test the Function

### Manual Test

1. Go to: https://supabase.com/dashboard/project/gfsusmsstpjqwrvcxjzt/functions/send-daily-project-updates
2. Click **"Invoke function"** or **"Test"**
3. Use empty request body: `{}`
4. Click **"Run"**
5. Check the response - you should see:
   ```json
   {
     "success": true,
     "emailsSent": 3,
     "projectsProcessed": 2,
     "results": [...]
   }
   ```

### Check Your Inbox

1. Make sure you're assigned to at least one project
2. Run the manual test above
3. Check your email inbox for the daily update
4. If using Resend test domain, check the email associated with your Resend account

---

## Step 7: View Cron Job Logs (Optional)

### For pg_cron:

```sql
-- View cron job history
SELECT * FROM cron.job_run_details
WHERE jobname = 'send-daily-project-updates'
ORDER BY start_time DESC
LIMIT 10;

-- View all scheduled jobs
SELECT * FROM cron.job;
```

### For cron-job.org:
- Check the execution history in your cron-job.org dashboard

---

## Customization Options

### Change Email Send Time

**pg_cron format:**
- `0 8 * * *` = 8:00 AM UTC daily
- `0 9 * * *` = 9:00 AM UTC daily
- `0 17 * * 1-5` = 5:00 PM UTC, Monday-Friday only

**cron-job.org:**
- Use the visual schedule picker in the dashboard

### Customize Email Template

Edit the `generateEmailHtml()` function in `supabase/functions/send-daily-project-updates/index.ts` to:
- Change colors
- Add your logo
- Modify layout
- Add additional project information

After changes, re-deploy the function (Step 4).

### Exclude Archived Projects

The function already filters out archived projects. If you want to include them:

1. In `index.ts`, find line 28:
   ```typescript
   .eq('archived', false)
   ```
2. Remove that line or change to `.eq('archived', true)` for archived only

---

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key:**
   - Verify it's correctly set in Supabase secrets
   - Try creating a new API key

2. **Check Domain Verification:**
   - Make sure your domain is verified in Resend
   - Check DNS records are properly configured

3. **Check Function Logs:**
   - Go to Edge Functions → send-daily-project-updates → Logs
   - Look for error messages

4. **Check User Assignments:**
   - Users must be assigned to projects to receive emails
   - Check `project_users` table has assignments

### Wrong Time Zone

- pg_cron uses UTC time
- Convert your local time to UTC
- Example: 8 AM EST = 1 PM UTC, so use `0 13 * * *`

### Emails Going to Spam

- Make sure SPF, DKIM, and DMARC records are properly configured
- Use a verified domain (not Resend test domain)
- Add your domain to email safe sender lists

---

## Pausing or Stopping Emails

### To Pause Temporarily:

**pg_cron:**
```sql
SELECT cron.unschedule('send-daily-project-updates');
```

**cron-job.org:**
- Disable the job in the dashboard

### To Restart:

**pg_cron:**
- Run the schedule command from Step 5 again

**cron-job.org:**
- Enable the job in the dashboard

---

## Summary

Once set up, the system will:
1. ✅ Run automatically every day at your chosen time
2. ✅ Send emails only to users assigned to active projects
3. ✅ Include real-time project statistics
4. ✅ Provide a direct link to view the project
5. ✅ Skip archived projects
6. ✅ Handle errors gracefully

**Next Steps:**
1. Complete Steps 1-6 above
2. Test the function manually
3. Verify you receive an email
4. Set up the daily schedule
5. Monitor for a few days to ensure it's working correctly
