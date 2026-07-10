import { SignJWT, jwtVerify } from 'jose'
import type { AccessClaims, AccessTier } from './types.js'

const SECRET = () => {
  const s = process.env.ACCESS_TOKEN_SECRET
  if (!s) throw new Error('ACCESS_TOKEN_SECRET is not configured')
  return new TextEncoder().encode(s)
}

const TTL_DAYS = Number(process.env.ACCESS_TOKEN_TTL_DAYS ?? '365')

export async function issueAccessToken(email: string, tier: AccessTier = 'agent_hub') {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ email, tier })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt(now)
    .setExpirationTime(now + TTL_DAYS * 86400)
    .sign(SECRET())
}

export async function verifyAccessToken(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET())
    return {
      sub: String(payload.sub ?? ''),
      email: String(payload.email ?? payload.sub ?? ''),
      tier: (payload.tier as AccessTier) ?? 'agent_hub',
      iat: Number(payload.iat ?? 0),
      exp: Number(payload.exp ?? 0),
    }
  } catch {
    return null
  }
}

export function bearerToken(req: { headers: Record<string, string | string[] | undefined> }) {
  const h = req.headers.authorization
  if (!h || Array.isArray(h)) return null
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}
