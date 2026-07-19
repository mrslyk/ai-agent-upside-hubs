import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueAccessToken } from './lib/auth.js'
import { cors, preflight } from './lib/cors.js'
import {
  createCheckoutSession,
  stripeConfigured,
  stripePaymentLinkForPurpose,
} from './lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return
  cors(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, accessCode } = req.body ?? {}

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // Beta / comp access via shared code (no Stripe) — same as Naval/FAM local bypass
  const betaCode = process.env.BETA_ACCESS_CODE
  if (accessCode && betaCode && accessCode === betaCode) {
    const token = await issueAccessToken(normalizedEmail)
    return res.status(200).json({ token, tier: 'agent_hub', mode: 'beta' })
  }

  // Optional Payment Link shortcut (FAM pattern)
  const paymentLink = stripePaymentLinkForPurpose('hub_access')
  if (paymentLink && !stripeConfigured()) {
    return res.status(200).json({
      url: paymentLink,
      mode: 'stripe_payment_link',
      hint: 'Complete payment, then return with your receipt email if access is not automatic.',
    })
  }

  if (!stripeConfigured()) {
    return res.status(503).json({
      error:
        'Payments not configured. Set STRIPE_SECRET_KEY + STRIPE_PRICE_HUB_ACCESS, or use a beta access code.',
    })
  }

  try {
    const session = await createCheckoutSession({
      purpose: 'hub_access',
      customerEmail: normalizedEmail,
      metadata: {
        email: normalizedEmail,
        product: 'agent_hub_access',
      },
      successPath: 'access=success',
      cancelPath: 'access=cancelled',
    })
    return res.status(200).json({
      url: session.url,
      sessionId: session.sessionId,
      mode: session.mode,
    })
  } catch (err) {
    console.error('checkout error', err)
    const status = (err as { status?: number }).status || 500
    return res.status(status).json({
      error: err instanceof Error ? err.message : 'Failed to create checkout session',
      hint: 'Set STRIPE_SECRET_KEY and STRIPE_PRICE_HUB_ACCESS (run npm run stripe:setup).',
    })
  }
}
