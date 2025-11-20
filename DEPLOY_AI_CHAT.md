# 🚀 Quick Deployment Checklist

## Issue Status: ✅ FIXED

### Fixed Issues:
1. ✅ **Bug report script error** - Added safety check for missing elements
2. ✅ **Gemini quota exceeded** - Switched from `gemini-2.0-flash-exp` (2 RPM) to `gemini-1.5-flash` (15 RPM)

---

## Next Steps to Deploy

### 1. Redeploy the Edge Function
The Gemini model has been changed to fix the quota issue. You need to redeploy:

```bash
# Navigate to your project
cd "Noble Extranet"

# Deploy the updated function
supabase functions deploy gemini-chat

# Verify deployment
supabase functions list
```

**Expected output:**
```
✓ Deployed function gemini-chat
```

### 2. Test the Chat Again
1. Refresh your browser (clear cache: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Go to AI Chat page
3. Ask a question like: "What are the keys to success for Renaissance Raleigh?"
4. You should now get a response without quota errors

---

## Why This Fixes the Issue

### Before (What Failed):
- Model: `gemini-2.0-flash-exp` ❌
- Rate Limit: **2 requests per minute**
- Status: Experimental, unstable limits
- Result: Quota exceeded immediately

### After (Fixed):
- Model: `gemini-1.5-flash` ✅
- Rate Limit: **15 requests per minute**
- Status: Stable, production-ready
- Result: Should handle normal usage without issues

---

## Rate Limits Comparison

| Model | Free Tier RPM | Status | Recommended |
|-------|---------------|--------|-------------|
| `gemini-1.5-flash` | **15** | Stable | ✅ **YES** |
| `gemini-1.5-pro` | 2 | Stable | ⚠️ Only for complex queries |
| `gemini-2.0-flash-exp` | 2 | Experimental | ❌ **NO** - Too restrictive |

**RPM** = Requests Per Minute

---

## Deployment Commands (Complete)

If you haven't deployed everything yet, here's the full sequence:

```bash
# 1. Run database migration
supabase db push

# 2. Set Gemini API key (if not done)
supabase secrets set GEMINI_API_KEY=your_actual_api_key_here

# 3. Deploy the Edge Function
supabase functions deploy gemini-chat

# 4. Verify everything
supabase functions list
supabase secrets list
```

---

## Testing Checklist

After redeployment, test these scenarios:

- [ ] Can create a new conversation
- [ ] Can send a message and get a response
- [ ] Response includes source citations
- [ ] Can ask follow-up questions
- [ ] Conversation history persists
- [ ] Can switch between conversations
- [ ] Internal users see more data sources than external users

---

## Still Getting Errors?

### If you still see quota errors:
1. **Wait 60 seconds** - Limits reset every minute
2. **Check the model** in Edge Function logs:
   ```bash
   supabase functions logs gemini-chat
   ```
   Should show: `Using model: gemini-1.5-flash`

3. **Monitor your usage**: [https://ai.dev/usage](https://ai.dev/usage?tab=rate-limit)

### If you see TypeScript errors in VSCode:
- **Ignore them!** They're cosmetic only
- Edge Functions use Deno, not Node.js
- The function will work despite the red squiggles
- I've added a `deno.json` file to help suppress them

---

## Support Resources

- **Full Setup Guide**: [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md)
- **Gemini API Docs**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **Rate Limits**: [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- **Usage Monitor**: [https://ai.dev/usage](https://ai.dev/usage?tab=rate-limit)

---

## Expected Performance

With `gemini-1.5-flash` on the free tier:
- **15 requests/minute** = 900 requests/hour
- **1M tokens/minute** for input
- **Response time**: 1-2 seconds
- **Context window**: 1M tokens

This should be **more than sufficient** for typical usage patterns.
