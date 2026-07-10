const BASE = import.meta.env.VITE_API_BASE ?? ''

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return data as T
}

export function checkout(email: string, accessCode?: string) {
  return api<{ url?: string; token?: string; mode: string }>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ email, accessCode }),
  })
}

export function verifyStripeSession(sessionId: string) {
  return api<{ token: string; email: string }>('/api/verify-session', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
}

export function verifyAccess(token: string) {
  return api<{ valid: boolean; email?: string; tier?: string }>('/api/verify-access', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export type UpsidePayload = {
  hubName: string
  hubSubdomain: string
  humanPrincipal: string
  email: string
  entityType: string
  offeringType: string
  accreditedInvestor?: boolean
  agentOperator?: string
  contributionSummary?: string
  riskAcknowledged: boolean
  disclosuresAcknowledged: boolean
}

export function submitUpsideRequest(token: string, payload: UpsidePayload) {
  return api<{ id: string; status: string; message: string }>('/api/upside-request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
