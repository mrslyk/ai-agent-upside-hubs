#!/usr/bin/env node
/**
 * Create Upside Hub Stripe product + price (FAM stripe:setup pattern).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_… npm run stripe:setup
 *   npm run stripe:setup -- --dry-run
 *
 * Prints env lines to paste into .env / Vercel.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnvFile() {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] == null) process.env[key] = val
  }
}

loadEnvFile()

const dryRun = process.argv.includes('--dry-run')
const secret = process.env.STRIPE_SECRET_KEY
const amountCents = Number(process.env.HUB_ACCESS_PRICE_CENTS || 9900)

const CATALOG_ITEM = {
  envPrice: 'STRIPE_PRICE_HUB_ACCESS',
  purpose: 'hub_access',
  name: 'AI Agent Upside Hub Access',
  description:
    'Unlock a fully set-up Upside Hub on ai.slyk.io — store, reward coin, tasks, referrals, and wizard onboarding.',
  amountCents,
  currency: 'usd',
}

if (!secret && !dryRun) {
  console.error('Missing STRIPE_SECRET_KEY. Add it to .env or pass it in the environment.')
  process.exit(1)
}

async function stripeForm(method, urlPath, params) {
  const body = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') body.set(k, String(v))
  }
  const res = await fetch(`https://api.stripe.com/v1${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method === 'GET' ? undefined : body,
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.error?.message || JSON.stringify(json))
  }
  return json
}

async function main() {
  console.log(`Upside Hubs Stripe setup — hub access $${(amountCents / 100).toFixed(2)}`)
  if (dryRun) {
    console.log('[dry-run] would create product + price')
    console.log(`  ${CATALOG_ITEM.name}`)
    return
  }

  const list = await fetch('https://api.stripe.com/v1/products?limit=100&active=true', {
    headers: { Authorization: `Bearer ${secret}` },
  }).then((r) => r.json())

  let product = (list.data || []).find(
    (p) => p.metadata?.upside_purpose === 'hub_access' && p.name === CATALOG_ITEM.name,
  )

  if (product) {
    console.log(`  product exists: ${product.id}`)
  } else {
    product = await stripeForm('POST', '/products', {
      name: CATALOG_ITEM.name,
      description: CATALOG_ITEM.description,
      'metadata[upside_purpose]': 'hub_access',
      'metadata[upside_env_price]': 'STRIPE_PRICE_HUB_ACCESS',
    })
    console.log(`  created product: ${product.id}`)
  }

  const prices = await fetch(
    `https://api.stripe.com/v1/prices?product=${encodeURIComponent(product.id)}&active=true&limit=20`,
    { headers: { Authorization: `Bearer ${secret}` } },
  ).then((r) => r.json())

  let price = (prices.data || []).find(
    (p) =>
      p.unit_amount === amountCents && p.currency === 'usd' && p.type === 'one_time',
  )

  if (price) {
    console.log(`  price exists: ${price.id}`)
  } else {
    price = await stripeForm('POST', '/prices', {
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
      'metadata[upside_purpose]': 'hub_access',
    })
    console.log(`  created price: ${price.id}`)
  }

  console.log('\nPaste into .env / Vercel:')
  console.log(`STRIPE_PRICE_HUB_ACCESS=${price.id}`)
  console.log('# (STRIPE_PRICE_ID still accepted as alias)')
  console.log(`STRIPE_PRICE_ID=${price.id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
