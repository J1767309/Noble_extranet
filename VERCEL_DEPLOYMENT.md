# Vercel Deployment Guide

## ✅ GitHub Deployment Complete

Your code has been successfully pushed to GitHub:
- **Repository**: `J1767309/Noble_extranet`
- **Branch**: `main`
- **Commit**: AI Chat module with Google Gemini RAG integration

---

## 🚀 Deploy to Vercel

### Option 1: Automatic Deployment (If Already Connected)

If your GitHub repo is already connected to Vercel:

1. **Vercel will auto-deploy** when it detects the push to main
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Find your `noble-extranet` project
4. Click on it to see the deployment status
5. Wait for the build to complete (usually 1-2 minutes)

---

### Option 2: Manual Setup (First Time)

If this is your first deployment:

#### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Find and select: `J1767309/Noble_extranet`
5. Click **"Import"**

#### Step 2: Configure Project Settings

**Framework Preset**: None (or "Other")

**Build & Output Settings**:
- Build Command: Leave empty (static site)
- Output Directory: `.` (current directory)
- Install Command: Leave default

**Root Directory**: `.` (root)

#### Step 3: Environment Variables

You don't need to add environment variables in Vercel for this project because:
- Supabase config is in `js/supabase-config.js`
- Gemini API key is stored in Supabase Secrets (not Vercel)

#### Step 4: Deploy

Click **"Deploy"**

Vercel will:
- Build your project
- Deploy the static HTML/JS/CSS files
- Provide a production URL

---

## 🔧 Deploy Supabase Edge Functions

**Important**: Vercel only deploys your frontend files. You still need to deploy the Supabase Edge Function separately.

### Deploy the Edge Function

```bash
# Navigate to your project
cd "/Users/johnjimenez/Library/CloudStorage/Dropbox/Noble Investment Group/Noble Projects/Noble Extranet"

# Make sure you're logged in to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the Edge Function
supabase functions deploy gemini-chat

# Verify deployment
supabase functions list
```

### Set Gemini API Key (If Not Done)

```bash
# Set the secret
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key

# Verify
supabase secrets list
```

---

## 📋 Post-Deployment Checklist

After Vercel deployment completes:

### 1. Test Your Deployment

Visit your Vercel URL and test:
- [ ] Login/signup works
- [ ] Dashboard loads
- [ ] AI Chat page loads
- [ ] AI Chat link appears in sidebar
- [ ] Can create a conversation
- [ ] Can send messages and get responses
- [ ] Source citations appear

### 2. Custom Domain (Optional)

If you have a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `extranet.nobleinvestmentgroup.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-10 minutes)

### 3. Update CORS in Supabase (If Needed)

If you have a custom domain, update Supabase CORS:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel/custom domain to "Site URL"
3. Add to "Redirect URLs" as well

---

## 🔍 Verify Deployment

### Check Vercel Deployment

```bash
# View deployment URL
vercel --prod
```

Or visit: https://vercel.com/dashboard

### Check Supabase Function

```bash
# View function logs
supabase functions logs gemini-chat

# Test the function
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-chat' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Test message"}'
```

---

## 🐛 Troubleshooting

### Vercel Build Fails

**Error**: "Build failed"
- Check the build logs in Vercel dashboard
- Ensure `vercel.json` is properly configured
- Try rebuilding: Click "Redeploy" in Vercel

### AI Chat Not Working After Deployment

1. **Check Edge Function is deployed**:
   ```bash
   supabase functions list
   ```
   Should show `gemini-chat` as deployed

2. **Check Gemini API key**:
   ```bash
   supabase secrets list
   ```
   Should show `GEMINI_API_KEY`

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors
   - Check Network tab for failed requests

### CORS Errors

If you see CORS errors:
1. Add your Vercel domain to Supabase URL configuration
2. Check that Edge Function has correct CORS headers
3. Clear browser cache and hard refresh

---

## 📊 Monitoring

### Vercel Analytics

Enable analytics to track usage:
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable analytics
3. View page views, response times, etc.

### Supabase Monitoring

Monitor Edge Function usage:
1. Go to Supabase Dashboard → Edge Functions
2. Click on `gemini-chat`
3. View invocations, errors, logs

### Gemini API Usage

Monitor Gemini usage:
- [Google AI Studio Usage Dashboard](https://ai.dev/usage?tab=rate-limit)
- Track requests per day
- Monitor token usage

---

## 🔐 Security Checklist

Before going to production:

- [ ] All API keys are in Supabase Secrets (not hardcoded)
- [ ] Row Level Security (RLS) is enabled on all tables
- [ ] HTTPS is enabled (Vercel does this automatically)
- [ ] Custom domain has SSL certificate
- [ ] Rate limiting is configured in Supabase
- [ ] User authentication is required for all pages
- [ ] Admin functions require admin role

---

## 🎯 Next Steps

1. **Set up monitoring**: Enable Vercel Analytics and Supabase monitoring
2. **Test thoroughly**: Have multiple users test the AI Chat
3. **Monitor costs**: Track Gemini API usage for first week
4. **Gather feedback**: Ask users about AI Chat experience
5. **Iterate**: Improve based on usage patterns

---

## 📚 Deployment URLs

After deployment, you'll have:

- **Frontend**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)
- **Edge Function**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-chat`
- **Supabase Dashboard**: `https://app.supabase.com/project/YOUR_PROJECT_REF`

---

## 🆘 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Support**: support@vercel.com
- **Setup Guide**: [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md)
- **Quick Deploy**: [DEPLOY_AI_CHAT.md](DEPLOY_AI_CHAT.md)

---

## ✨ Success!

Once deployed, users can:
- Navigate to AI Chat from any page
- Ask questions about hotels in the portfolio
- Get AI-powered responses with source citations
- View conversation history
- Use optional web grounding for industry insights

Enjoy your new AI-powered hotel intelligence assistant! 🎉
