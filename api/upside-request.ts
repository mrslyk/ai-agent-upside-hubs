import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { bearerToken, verifyAccessToken } from '../lib/auth.js'
import { cors, preflight } from '../lib/cors.js'
import type { UpsideOfferingType, UpsideRequest } from '../lib/types.js'

const VALID_OFFERINGS: UpsideOfferingType[] = ['reg_cf', 'reg_d_506b', 'reg_d_506c']

async function notifyCompliance(request: UpsideRequest) {
  const url = process.env.UPSIDE_COMPLIANCE_WEBHOOK_URL
  if (!url) {
    console.log('upside request (no webhook configured):', JSON.stringify(request))
    return
  }
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return
  cors(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = bearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Agent hub access required' })
  }
  const claims = await verifyAccessToken(token)
  if (!claims) {
    return res.status(401).json({ error: 'Invalid or expired access token' })
  }

  const body = req.body ?? {}
  const {
    hubName,
    hubSubdomain,
    humanPrincipal,
    email,
    entityType,
    offeringType,
    accreditedInvestor,
    agentOperator,
    contributionSummary,
    riskAcknowledged,
    disclosuresAcknowledged,
  } = body

  if (!hubName || !hubSubdomain || !humanPrincipal || !email) {
    return res.status(400).json({ error: 'hubName, hubSubdomain, humanPrincipal, and email are required' })
  }
  if (!VALID_OFFERINGS.includes(offeringType)) {
    return res.status(400).json({ error: 'offeringType must be reg_cf, reg_d_506b, or reg_d_506c' })
  }
  if (!riskAcknowledged || !disclosuresAcknowledged) {
    return res.status(400).json({ error: 'Risk and disclosure acknowledgments are required' })
  }
  if (offeringType === 'reg_d_506c' && !accreditedInvestor) {
    return res.status(400).json({
      error: 'Reg D 506(c) requires accredited investor attestation for all purchasers',
    })
  }

  const request: UpsideRequest = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending_review',
    hubName: String(hubName),
    hubSubdomain: String(hubSubdomain),
    humanPrincipal: String(humanPrincipal),
    email: String(email).toLowerCase(),
    entityType: entityType ?? 'individual',
    offeringType,
    accreditedInvestor: Boolean(accreditedInvestor),
    agentOperator: agentOperator ? String(agentOperator) : undefined,
    contributionSummary: contributionSummary ? String(contributionSummary) : undefined,
    riskAcknowledged: true,
    disclosuresAcknowledged: true,
  }

  try {
    await notifyCompliance(request)
    return res.status(201).json({
      id: request.id,
      status: request.status,
      message:
        'Upside offering request received. A regulated onboarding flow will contact the human principal. Reward coins remain utility credits until this process completes.',
    })
  } catch (err) {
    console.error('upside notify error', err)
    return res.status(500).json({ error: 'Failed to submit upside request' })
  }
}
