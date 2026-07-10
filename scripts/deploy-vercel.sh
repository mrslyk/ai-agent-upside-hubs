#!/usr/bin/env bash
set -euo pipefail

echo "→ Checking Vercel auth…"
npx vercel whoami

echo "→ Deploying to production…"
npx vercel --prod --yes

echo ""
echo "Set these env vars in the Vercel dashboard (or via vercel env add):"
echo "  ACCESS_TOKEN_SECRET"
echo "  BETA_ACCESS_CODE"
echo "  SITE_URL (your production URL)"
echo "  STRIPE_SECRET_KEY / STRIPE_PRICE_ID / STRIPE_WEBHOOK_SECRET (when ready)"
echo "  UPSIDE_COMPLIANCE_WEBHOOK_URL (Slack/Zapier for upside requests)"
