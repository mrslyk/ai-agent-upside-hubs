/**
 * Stripe Checkout wiring — pattern from mrslyk/naval-quest + mrslyk/fam.
 * USD payments only. Reward coin ($AI) stays on the Slyk ledger.
 */
import Stripe from 'stripe'

let client: Stripe | null = null

export function stripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_PRICE_HUB_ACCESS || process.env.STRIPE_PRICE_ID),
  )
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!client) client = new Stripe(key)
  return client
}

/** @deprecated use getStripe() — kept for existing call sites */
export function stripe() {
  const s = getStripe()
  if (!s) throw new Error('STRIPE_SECRET_KEY is not configured')
  return s
}

export function appOrigin() {
  const fallback = 'http://localhost:5173'
  const raw = String(process.env.SITE_URL || process.env.VITE_SITE_URL || fallback).trim()

  for (const candidate of [raw, raw.match(/https?:\/\/[^\s]+/)?.[0]]) {
    if (!candidate) continue
    try {
      const u = new URL(candidate.replace(/\/$/, ''))
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.origin
    } catch {
      /* try next */
    }
  }
  return fallback
}

/** @deprecated use appOrigin() */
export function siteUrl() {
  return appOrigin()
}

export type CheckoutPurpose = 'hub_access'

export function priceIdForPurpose(purpose: CheckoutPurpose) {
  if (purpose === 'hub_access') {
    return process.env.STRIPE_PRICE_HUB_ACCESS || process.env.STRIPE_PRICE_ID || ''
  }
  return ''
}

/** Optional Stripe Payment Link shortcut (buy.stripe.com) — FAM pattern. */
export function stripePaymentLinkForPurpose(purpose: CheckoutPurpose) {
  if (purpose === 'hub_access') {
    return (
      process.env.STRIPE_LINK_HUB_ACCESS ||
      process.env.VITE_STRIPE_LINK_HUB_ACCESS ||
      ''
    ).trim()
  }
  return ''
}

type CreateCheckoutOpts = {
  purpose: CheckoutPurpose
  priceId?: string
  metadata: Record<string, string>
  customerEmail?: string
  successPath?: string
  cancelPath?: string
}

/**
 * Create a Stripe Checkout Session (Naval/FAM style).
 * Success URL uses query-string session_id={CHECKOUT_SESSION_ID} — not hash.
 */
export async function createCheckoutSession(opts: CreateCheckoutOpts) {
  const s = getStripe()
  if (!s) {
    const err = new Error('STRIPE_SECRET_KEY not set') as Error & { status?: number }
    err.status = 503
    throw err
  }

  const price = opts.priceId || priceIdForPurpose(opts.purpose)
  if (!price) {
    const err = new Error(
      `No Stripe price for ${opts.purpose} — set STRIPE_PRICE_HUB_ACCESS (or STRIPE_PRICE_ID)`,
    ) as Error & { status?: number }
    err.status = 503
    throw err
  }

  const origin = appOrigin().replace(/\/$/, '')
  const successQs = (opts.successPath || 'access=success').replace(/^\?/, '')
  const cancelQs = (opts.cancelPath || 'access=cancelled').replace(/^\?/, '')

  const session = await s.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/?${successQs}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?${cancelQs}`,
    customer_email: opts.customerEmail || undefined,
    client_reference_id: opts.metadata.email || opts.metadata.userId || undefined,
    metadata: {
      app: 'upside-hubs',
      purpose: opts.purpose,
      ...opts.metadata,
    },
    payment_intent_data: {
      metadata: {
        app: 'upside-hubs',
        purpose: opts.purpose,
        ...opts.metadata,
      },
    },
  })

  return {
    sessionId: session.id,
    url: session.url,
    mode: 'stripe_checkout' as const,
  }
}

export async function retrieveCheckoutSession(sessionId: string) {
  const s = getStripe()
  if (!s || !sessionId) return null
  return s.checkout.sessions.retrieve(sessionId)
}

export function constructWebhookEvent(rawBody: string | Buffer, signature: string) {
  const s = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!s || !secret) {
    const err = new Error('Stripe webhook not configured (STRIPE_WEBHOOK_SECRET)') as Error & {
      status?: number
    }
    err.status = 503
    throw err
  }
  return s.webhooks.constructEvent(rawBody, signature, secret)
}
