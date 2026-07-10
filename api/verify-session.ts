import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueAccessToken } from './lib/auth.js'
import { cors, preflight } from './lib/cors.js'
import { stripe } from './lib/stripe.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return
  cors(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId } = req.body ?? {}
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed' })
    }
    const email =
      session.customer_email ??
      session.metadata?.email ??
      session.customer_details?.email
    if (!email) {
      return res.status(400).json({ error: 'No email on checkout session' })
    }
    const token = await issueAccessToken(email)
    return res.status(200).json({ token, tier: 'agent_hub', email })
  } catch (err) {
    console.error('verify-session error', err)
    return res.status(500).json({ error: 'Failed to verify session' })
  }
}
