#!/bin/bash

echo "=========================================="
echo "Deploying Supabase Edge Functions"
echo "=========================================="
echo ""

# Check if SUPABASE_ACCESS_TOKEN is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "ERROR: SUPABASE_ACCESS_TOKEN environment variable is not set."
    echo ""
    echo "To get your access token:"
    echo "1. Go to https://supabase.com/dashboard/account/tokens"
    echo "2. Click 'Generate New Token'"
    echo "3. Give it a name like 'CLI Deploy'"
    echo "4. Copy the token"
    echo "5. Run: export SUPABASE_ACCESS_TOKEN='your-token-here'"
    echo "6. Then run this script again"
    echo ""
    exit 1
fi

echo "Linking project to Supabase..."
npx supabase link --project-ref gfsusmsstpjqwrvcxjzt

echo ""
echo "Deploying create-user function..."
npx supabase functions deploy create-user

echo ""
echo "Deploying delete-user function..."
npx supabase functions deploy delete-user

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your Edge Functions are now live at:"
echo "- https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/create-user"
echo "- https://gfsusmsstpjqwrvcxjzt.supabase.co/functions/v1/delete-user"
echo ""
