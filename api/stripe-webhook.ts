import type Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueAccessToken } from './lib/auth.js'
import { stripe } from './lib/stripe.js'

export const config = { api: { bodyParser: false } }

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return res.status(503).json({ error: 'Webhook not configured' })
  }

  const sig = req.headers['stripe-signature']
  if (!sig || Array.isArray(sig)) {
    return res.status(400).json({ error: 'Missing stripe-signature' })
  }

  let event: Stripe.Event
  try {
    const body = await rawBody(req)
    event = stripe().webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    console.error('webhook signature error', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email =
      session.customer_email ??
      session.metadata?.email ??
      session.customer_details?.email
    if (email) {
      const token = await issueAccessToken(email)
      console.log('issued access for', email, 'token prefix', token.slice(0, 12))
    }
  }

  return res.status(200).json({ received: true })
}
