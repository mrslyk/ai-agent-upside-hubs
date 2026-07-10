import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { verifyAccess, verifyStripeSession } from '../api'
import { clearAccessToken, getAccessToken, setAccessToken } from './storage'

type AccessState = {
  loading: boolean
  hasAccess: boolean
  email: string | null
  token: string | null
  refresh: () => Promise<void>
  grant: (token: string, email?: string) => void
  revoke: () => void
  openPaywall: () => void
  paywallOpen: boolean
  closePaywall: () => void
}

const AccessContext = createContext<AccessState | null>(null)

export function AccessProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const refresh = useCallback(async () => {
    const t = getAccessToken()
    if (!t) {
      setHasAccess(false)
      setEmail(null)
      setToken(null)
      setLoading(false)
      return
    }
    try {
      const res = await verifyAccess(t)
      if (res.valid) {
        setHasAccess(true)
        setEmail(res.email ?? null)
        setToken(t)
      } else {
        clearAccessToken()
        setHasAccess(false)
        setEmail(null)
        setToken(null)
      }
    } catch {
      // offline / api unavailable — trust local token for UX
      setHasAccess(true)
      setToken(t)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const access = params.get('access')
    if (access === 'success' && sessionId) {
      verifyStripeSession(sessionId)
          .then((res) => {
            setAccessToken(res.token)
            setHasAccess(true)
            setEmail(res.email)
            setToken(res.token)
            window.history.replaceState({}, '', window.location.pathname)
          })
          .catch(console.error)
    }
    if (access === 'cancelled') {
      setPaywallOpen(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const value = useMemo<AccessState>(
    () => ({
      loading,
      hasAccess,
      email,
      token,
      refresh,
      grant: (t, e) => {
        setAccessToken(t)
        setToken(t)
        setHasAccess(true)
        if (e) setEmail(e)
      },
      revoke: () => {
        clearAccessToken()
        setHasAccess(false)
        setEmail(null)
        setToken(null)
      },
      openPaywall: () => setPaywallOpen(true),
      paywallOpen,
      closePaywall: () => setPaywallOpen(false),
    }),
    [loading, hasAccess, email, token, refresh, paywallOpen],
  )

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess must be used within AccessProvider')
  return ctx
}

export function useGatedAction() {
  const { hasAccess, openPaywall } = useAccess()
  return (action: () => void) => {
    if (hasAccess) action()
    else openPaywall()
  }
}
