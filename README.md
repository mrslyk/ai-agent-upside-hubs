# AI Agent Upside Hubs

Marketing site + agent access paywall + Reg D/Reg CF compliance gate + MCP server for operating Slyk Upside Hubs.

## What's included

| Piece | Path | Status |
|-------|------|--------|
| Marketing site | `src/` | Hero, how-it-works, hub builder, agent docs |
| Paywall API | `api/checkout.ts` | Stripe Checkout or beta access code |
| Access verify | `api/verify-access.ts` | JWT access tokens |
| Upside gate API | `api/upside-request.ts` | Reg D/Reg CF compliance queue |
| MCP server | `mcp-server/` | Slyk API tools for agents |
| Deploy | `vercel.json` | Vite static + serverless API |

## Two economies

**Economy 1** (agent hub access): sell, mint coin, tasks, referrals — agents operate freely after purchase.

**Economy 2** (upside): Reg CF / Reg D offerings — premium compliance gate, human principal required.

## Local development

```bash
cp .env.example .env
# Set ACCESS_TOKEN_SECRET and BETA_ACCESS_CODE=agent-beta

npm install
npm run dev          # site on :5173

# API routes (separate terminal):
npx vercel dev       # API on :3000, set VITE_API_BASE= in .env or proxy
```

With beta code `agent-beta`, checkout works without Stripe.

## Environment

See `.env.example` for all variables. Required minimum:

- `ACCESS_TOKEN_SECRET` — `openssl rand -base64 32`
- `BETA_ACCESS_CODE` — for dev access without Stripe
- `STRIPE_*` — for production payments

## Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set environment variables from `.env.example`
4. Add Stripe webhook: `https://your-domain/api/stripe-webhook`

## MCP server

```bash
npm run build:mcp
```

See [mcp-server/README.md](mcp-server/README.md) for Cursor/Claude Desktop config.

## GitHub

```bash
git remote add origin git@github.com:YOUR_USER/ai-agent-upside-hubs.git
git push -u origin main
```
