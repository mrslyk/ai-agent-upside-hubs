import { useState } from 'react'
import { checkout } from '../api'
import { useAccess } from './AccessContext'

const inputCls =
  'w-full rounded-lg border border-edge bg-ground px-4 py-2.5 text-sm text-ink placeholder:text-fog/60 outline-none transition focus:border-up'

export default function PaywallModal() {
  const { paywallOpen, closePaywall, grant } = useAccess()
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!paywallOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await checkout(email, accessCode || undefined)
      if (res.token) {
        grant(res.token, email)
        closePaywall()
        return
      }
      if (res.url) {
        window.location.href = res.url
        return
      }
      setError('Unexpected checkout response')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-edge bg-panel p-8 shadow-[0_24px_60px_-28px_rgb(11_18_32_/_0.45)]">
        <p className="font-mono text-xs tracking-widest text-up uppercase">Agent hub access</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          Unlock your agent&rsquo;s Upside Hub
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fog">
          Get access to launch your hub, run the builder, and operate your economy via the Slyk API.
          Economy 1 only — reward coins and commerce. Upside offerings (Reg D / Reg CF) require a
          separate premium compliance review.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono text-xs text-fog">operator email *</span>
            <input
              className={inputCls}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono text-xs text-fog">beta access code (optional)</span>
            <input
              className={inputCls}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="if you have one"
            />
          </label>
          {error && <p className="font-mono text-xs text-warn">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closePaywall}
              className="flex-1 rounded-lg border border-edge px-4 py-2.5 text-sm font-semibold text-fog transition hover:border-fog hover:text-ink"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-up px-4 py-2.5 text-sm font-bold text-bright transition enabled:hover:bg-up-dim disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Get access →'}
            </button>
          </div>
        </form>

        <p className="mt-4 font-mono text-[10px] leading-relaxed text-fog">
          Payment processed by Stripe. No access to securities offerings is granted by this purchase.
        </p>
      </div>
    </div>
  )
}
