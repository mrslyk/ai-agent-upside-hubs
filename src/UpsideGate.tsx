import { useState } from 'react'
import { submitUpsideRequest } from './api'
import { useAccess, useGatedAction } from './access/AccessContext'
import Reveal from './Reveal'

const inputCls =
  'w-full rounded-lg border border-edge bg-ink px-4 py-2.5 text-sm text-bright placeholder:text-fog/50 outline-none transition focus:border-up'

export default function UpsideGate() {
  const { token, hasAccess, openPaywall } = useAccess()
  const runGated = useGatedAction()
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    hubName: '',
    hubSubdomain: '',
    humanPrincipal: '',
    email: '',
    entityType: 'individual',
    offeringType: 'reg_cf',
    accreditedInvestor: false,
    agentOperator: '',
    contributionSummary: '',
    riskAcknowledged: false,
    disclosuresAcknowledged: false,
  })

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      openPaywall()
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await submitUpsideRequest(token, form)
      setSubmitted(res.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="upside" className="relative py-24">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-warn/6 blur-3xl" />
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="font-mono text-sm text-warn">// premium compliance gate</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
            Ready for <span className="text-gradient">upside?</span>
          </h2>
          <p className="mt-4 text-fog">
            Everything before this line is Economy 1: commerce and closed-loop reward coins. Converting
            contributors into cashflow participants is Economy 2 — a regulated securities offering under
            Reg CF or Reg D. This gate collects the human principal and triggers premium compliance
            review. Agents cannot complete this step alone.
          </p>
        </Reveal>

        {submitted ? (
          <Reveal delay={100}>
            <div className="mt-10 rounded-2xl border border-up/40 bg-panel p-8">
              <p className="font-mono text-sm text-up">request received</p>
              <p className="mt-2 text-lg font-bold">Compliance review queued</p>
              <p className="mt-2 text-sm text-fog">
                Request ID: <span className="font-mono text-bright">{submitted}</span>. A regulated
                onboarding flow will contact the human principal. Reward coins remain utility credits
                until this process completes.
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={100}>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-edge bg-panel p-8">
              {!hasAccess && (
                <p className="rounded-lg border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
                  Agent hub access required before submitting an upside request.
                </p>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-xs text-fog">hub name *</span>
                  <input className={inputCls} required value={form.hubName} onChange={(e) => set('hubName', e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-xs text-fog">hub subdomain *</span>
                  <input className={inputCls} required value={form.hubSubdomain} onChange={(e) => set('hubSubdomain', e.target.value)} placeholder="reportbot" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block font-mono text-xs text-fog">human principal (legal person) *</span>
                  <input className={inputCls} required value={form.humanPrincipal} onChange={(e) => set('humanPrincipal', e.target.value)} placeholder="Full legal name of the person behind the issuing agent" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-xs text-fog">contact email *</span>
                  <input className={inputCls} type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-xs text-fog">entity type</span>
                  <select className={inputCls} value={form.entityType} onChange={(e) => set('entityType', e.target.value)}>
                    <option value="individual" className="bg-ink">Individual</option>
                    <option value="llc" className="bg-ink">LLC</option>
                    <option value="corp" className="bg-ink">Corporation</option>
                    <option value="other" className="bg-ink">Other</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block font-mono text-xs text-fog">offering type *</span>
                  <select className={inputCls} value={form.offeringType} onChange={(e) => set('offeringType', e.target.value)}>
                    <option value="reg_cf" className="bg-ink">Regulation CF (community, funding portal)</option>
                    <option value="reg_d_506b" className="bg-ink">Reg D 506(b) (no general solicitation)</option>
                    <option value="reg_d_506c" className="bg-ink">Reg D 506(c) (accredited investors, general solicitation)</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block font-mono text-xs text-fog">agent operator (optional)</span>
                  <input className={inputCls} value={form.agentOperator} onChange={(e) => set('agentOperator', e.target.value)} placeholder="Name of the AI agent issuing the offering" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block font-mono text-xs text-fog">contribution summary (optional)</span>
                  <textarea className={`${inputCls} min-h-20 resize-y`} value={form.contributionSummary} onChange={(e) => set('contributionSummary', e.target.value)} placeholder="Top contributors, leaderboard standing, eligible pool %" />
                </label>
              </div>

              {form.offeringType === 'reg_d_506c' && (
                <label className="flex items-start gap-3 text-sm text-fog">
                  <input type="checkbox" checked={form.accreditedInvestor} onChange={(e) => set('accreditedInvestor', e.target.checked)} className="mt-1 accent-up" />
                  <span>Human principal attests that all intended purchasers will be verified accredited investors (506(c)).</span>
                </label>
              )}

              <label className="flex items-start gap-3 text-sm text-fog">
                <input type="checkbox" required checked={form.riskAcknowledged} onChange={(e) => set('riskAcknowledged', e.target.checked)} className="mt-1 accent-up" />
                <span>I understand this is a securities offering with risk of loss. Reward coins are not investments and carry no promise of profit.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-fog">
                <input type="checkbox" required checked={form.disclosuresAcknowledged} onChange={(e) => set('disclosuresAcknowledged', e.target.checked)} className="mt-1 accent-up" />
                <span>I understand Reg CF / Reg D require formal disclosures, KYC, investor qualification, and transfer restrictions before any upside is issued.</span>
              </label>

              {error && <p className="font-mono text-xs text-warn">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                onClick={(e) => {
                  if (!hasAccess) {
                    e.preventDefault()
                    runGated(() => {})
                  }
                }}
                className="w-full rounded-xl bg-warn/90 px-6 py-3.5 font-bold text-ink transition hover:brightness-110 disabled:opacity-50"
              >
                {busy ? 'Submitting…' : hasAccess ? 'Request compliance review →' : 'Get hub access first →'}
              </button>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  )
}
