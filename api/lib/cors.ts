import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED = process.env.ALLOWED_ORIGIN ?? '*'

export function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function preflight(req: VercelRequest, res: VercelResponse): boolean {
  cors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}
