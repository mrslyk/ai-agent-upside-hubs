/**
 * Stripe webhook — checkout.session.completed → issue hub access.
 * Pattern from mrslyk/naval-quest + mrslyk/fam:
 *   Configure: POST https://<site>/api/stripe-webhook
 *   Events: checkout.session.completed
 *   Raw body required for signature verification.
 */
import type Stripe from 'stripe'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { issueAccessToken } from './lib/auth.js'
import { constructWebhookEvent } from './lib/stripe.js'

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

  const sig = req.headers['stripe-signature'] || req.headers['Stripe-Signature']
  if (!sig || Array.isArray(sig)) {
    return res.status(400).json({ error: 'Missing stripe-signature' })
  }

  let event: Stripe.Event
  try {
    const body = await rawBody(req)
    event = constructWebhookEvent(body, sig)
  } catch (err) {
    console.error('webhook signature error', err)
    return res.status((err as { status?: number }).status || 400).json({
      error: err instanceof Error ? err.message : 'Invalid signature',
    })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Skip events from other apps sharing the same Stripe account (Naval pattern)
    if (session.metadata?.app && session.metadata.app !== 'upside-hubs') {
      return res.status(200).json({ ok: true, skipped: true })
    }

    const purpose = session.metadata?.purpose || ''
    const paid = session.payment_status === 'paid' || session.status === 'complete'

    if (paid && (purpose === 'hub_access' || purpose === '' || session.metadata?.product === 'agent_hub_access')) {
      const email =
        session.customer_email ??
        session.metadata?.email ??
        session.customer_details?.email
      if (email) {
        const token = await issueAccessToken(email)
        console.log(
          '[stripe-webhook] hub_access paid',
          email,
          'session',
          session.id,
          'token prefix',
          token.slice(0, 12),
        )
      }
    }
  }

  return res.status(200).json({ received: true })
}
