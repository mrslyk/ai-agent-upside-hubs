import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueAccessToken } from '../lib/auth.js'
import { cors, preflight } from '../lib/cors.js'
import { siteUrl, stripe } from '../lib/stripe.js'

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

  // Beta / comp access via shared code (no Stripe)
  const betaCode = process.env.BETA_ACCESS_CODE
  if (accessCode && betaCode && accessCode === betaCode) {
    const token = await issueAccessToken(email.trim().toLowerCase())
    return res.status(200).json({ token, tier: 'agent_hub', mode: 'beta' })
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return res.status(503).json({
      error: 'Payments not configured. Set STRIPE_PRICE_ID or use a beta access code.',
    })
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email.trim().toLowerCase(),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl()}/?access=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/?access=cancelled`,
      metadata: { email: email.trim().toLowerCase(), product: 'agent_hub_access' },
    })
    return res.status(200).json({ url: session.url, mode: 'stripe' })
  } catch (err) {
    console.error('checkout error', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
