# AI Chat Setup Guide

This guide will help you set up the Google Gemini-powered AI Chat module for the Noble Extranet application.

## Overview

The AI Chat module uses:
- **Google Gemini 1.5 Flash** - Stable AI model with excellent free tier (15 RPM vs 2 RPM for experimental models)
- **RAG (Retrieval-Augmented Generation)** - Retrieves relevant hotel data from your Supabase database
- **Supabase Edge Functions** - Serverless backend for chat processing
- **PostgreSQL Database** - Stores conversation history and messages

## Features

- **Intelligent Hotel Queries**: Ask questions about any hotel in the Noble portfolio
- **Multi-Source Data**: Pulls from partner notes, top accounts, initiatives, hotel tracker, and projects
- **Access Control**: Respects user permissions (internal vs external users)
- **Conversation History**: Saves and retrieves past conversations
- **Optional Web Grounding**: Enable Google Search for industry insights
- **Source Attribution**: Shows which data sources were used in responses

## Prerequisites

1. Active Supabase project
2. Supabase CLI installed ([Installation Guide](https://supabase.com/docs/guides/cli))
3. Google Cloud account for Gemini API access
4. Node.js and npm (for local development)

---

## Step 1: Get Your Google Gemini API Key

### Option A: Google AI Studio (Recommended - Free Tier Available)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Select **"Create API key in new project"** or choose an existing project
5. Copy the API key (starts with `AIza...`)
6. **Important**: Keep this key secure and never commit it to version control

### Option B: Google Cloud Console (For Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Generative Language API**:
   - Go to APIs & Services → Library
   - Search for "Generative Language API"
   - Click "Enable"
4. Create credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. (Recommended) Restrict the API key:
   - Click on the key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Generative Language API"
   - Under "Application restrictions", add your Supabase Edge Function URL

---

## Step 2: Run the Database Migration

This creates the necessary tables for chat conversations and messages.

### Using Supabase CLI

```bash
# Navigate to your project directory
cd "Noble Extranet"

# Login to Supabase (if not already logged in)
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
supabase db push

# Or manually run the migration file
supabase db push --file supabase/migrations/025_create_chat_module.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/025_create_chat_module.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"**

### Verify Migration

Run this query in the SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('chat_conversations', 'chat_messages');
```

You should see both tables listed.

---

## Step 3: Configure the Gemini API Key in Supabase

You need to add your Gemini API key as a secret in Supabase Edge Functions.

### Using Supabase CLI (Recommended)

```bash
# Set the Gemini API key as a secret
supabase secrets set GEMINI_API_KEY=your_actual_api_key_here

# Verify the secret was set
supabase secrets list
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll to **"Secrets"** section
4. Click **"Add secret"**
5. Name: `GEMINI_API_KEY`
6. Value: Your Google Gemini API key (the one starting with `AIza...`)
7. Click **"Save"**

---

## Step 4: Deploy the Edge Function

### Using Supabase CLI

```bash
# Deploy the gemini-chat function
supabase functions deploy gemini-chat

# Verify deployment
supabase functions list
```

### Manual Deployment via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **"New Function"**
4. Name it: `gemini-chat`
5. Copy the contents of `supabase/functions/gemini-chat/index.ts`
6. Paste into the editor
7. Click **"Deploy"**

---

## Step 5: Test the Integration

### Test from the UI

1. Deploy your frontend (the HTML/JS files) to your hosting service (Vercel, Netlify, etc.)
2. Log in to the Noble Extranet
3. Click **"AI Chat"** in the sidebar
4. Click **"+ New Conversation"**
5. Type a test query like:
   - "What are the keys to success for Renaissance Raleigh?"
   - "Tell me about the top accounts for Hyatt House Raleigh"
   - "What new supply is coming to the Raleigh market?"
6. You should receive an AI-generated response with source citations

### Test the Edge Function Directly

Use curl or Postman to test the Edge Function:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-chat' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What are the top hotels in the portfolio?",
    "useGrounding": false
  }'
```

Replace:
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_ANON_KEY` with your Supabase anon/public key (found in Project Settings → API)

---

## Step 6: Configure Optional Features

### Enable Web Grounding

To allow the AI to use Google Search for additional context:

1. The UI already has a checkbox for "Enable web search for industry insights"
2. When checked, the Edge Function will use Gemini's grounding feature
3. This pulls in real-time web data about hotel industry trends

### Adjust RAG Settings

You can customize the RAG behavior in `supabase/functions/gemini-chat/index.ts`:

- **Query Limits**: Change `.limit(5)` to retrieve more or fewer records
- **Search Keywords**: Modify `extractHotelKeywords()` to recognize more hotel names
- **Context Size**: Adjust `.substring(0, 500)` to include more/less text per source
- **Model**: Change `GEMINI_MODEL` constant to use a different Gemini model

---

## Troubleshooting

### Error: "You exceeded your current quota" (429)

**This is the most common error!** It means you've hit the free tier rate limit.

**Symptoms**:
```
Gemini API error: 429 - quota exceeded for metric:
generativelanguage.googleapis.com/generate_content_free_tier_requests
```

**Solutions**:
1. **Wait 60 seconds** - Free tier limits reset every minute
2. **Check your model**: Ensure you're using `gemini-1.5-flash` (15 RPM) not experimental models (2 RPM)
3. **Upgrade to paid tier**: Get higher limits in Google Cloud Console
4. **Monitor usage**: Visit [https://ai.dev/usage](https://ai.dev/usage?tab=rate-limit)

**Rate Limits by Model**:
- `gemini-1.5-flash`: **15 requests/min** (recommended for free tier)
- `gemini-1.5-pro`: **2 requests/min** (free tier)
- `gemini-2.0-flash-exp`: **2 requests/min** (experimental, unstable)

### Error: "Missing authorization header"

- Ensure you're logged in and your session is active
- Check that the `Authorization` header is being sent in requests

### Error: "Gemini API error" (general)

- Verify your API key is correct and active
- Ensure the Generative Language API is enabled in Google Cloud
- Check API key restrictions aren't blocking requests

### Error: "No response from Gemini API"

- Check your internet connection
- Verify the Gemini API endpoint is accessible
- Review Supabase Edge Function logs for detailed errors

### No Data in Responses

- Ensure you've run the database migrations for all modules (partner notes, tracker, etc.)
- Verify you have data in the tables (partner_notes, hotel_tracker, etc.)
- Check that RLS policies allow the user to access the data

### View Edge Function Logs

```bash
# Using Supabase CLI
supabase functions logs gemini-chat

# Or in the Dashboard
# Navigate to Edge Functions → gemini-chat → Logs
```

---

## Architecture Overview

```
User Query (Frontend)
    ↓
Supabase Edge Function (gemini-chat)
    ↓
┌─────────────────────────────────────┐
│  RAG Context Builder                │
│  - Query hotel_partner_notes        │
│  - Query hotel_tracker              │
│  - Query hotel_top_accounts         │
│  - Query initiatives                │
│  - Query hotel_projects             │
└─────────────────────────────────────┘
    ↓
Google Gemini API
    ↓
AI-Generated Response
    ↓
Save to Database (chat_messages)
    ↓
Return to Frontend with Sources
```

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Implement rate limiting** to prevent API abuse
4. **Monitor usage** to avoid unexpected costs
5. **Rotate API keys** periodically
6. **Use RLS policies** to protect sensitive data
7. **Validate user input** before processing

---

## Cost Considerations

### Google Gemini Pricing (as of 2025)

- **Gemini 2.0 Flash**: Free tier available
  - 1,500 requests per day (free)
  - $0.075 per 1M input tokens
  - $0.30 per 1M output tokens

### Supabase Costs

- **Free Tier**: Includes 500,000 Edge Function invocations/month
- **Pro Plan**: Additional usage is metered

### Optimization Tips

- Use caching for repeated queries
- Limit the number of database queries in RAG
- Use smaller context windows when possible
- Monitor and set quotas in Google Cloud Console

---

## Next Steps

1. **Customize the UI**: Modify `ai-chat.html` to match your branding
2. **Add More Data Sources**: Extend the RAG function to include additional tables
3. **Implement Streaming**: Add real-time streaming responses for better UX
4. **Fine-tune Prompts**: Adjust the system prompt in the Edge Function for better responses
5. **Add Analytics**: Track popular queries and user engagement

---

## Support

For issues specific to:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Google Gemini**: [Gemini API Documentation](https://ai.google.dev/docs)
- **Noble Extranet**: Contact your development team

---

## Changelog

- **v1.0** (2025-01-XX): Initial release with Google Gemini RAG integration
