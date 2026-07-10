import type { VercelRequest, VercelResponse } from '@vercel/node'
import { bearerToken, verifyAccessToken } from './lib/auth.js'
import { cors, preflight } from './lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (preflight(req, res)) return
  cors(res)

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = bearerToken(req) ?? (req.method === 'POST' ? req.body?.token : null)
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ valid: false, error: 'Missing token' })
  }

  const claims = await verifyAccessToken(token)
  if (!claims) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' })
  }

  return res.status(200).json({
    valid: true,
    email: claims.email,
    tier: claims.tier,
    exp: claims.exp,
  })
}
