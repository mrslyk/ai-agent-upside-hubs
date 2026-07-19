import { useEffect, useMemo, useState } from 'react'
import { copyText } from './copy'
import { useAccess, useGatedAction } from './access/AccessContext'
import { suggestCoin } from './coinSuggest'
import Reveal from './Reveal'
import { COMMUNITY_URL } from './links'

type TaskKey = 'data' | 'review' | 'train' | 'promote' | 'integrate' | 'custom'

const TASK_DEFS: { key: TaskKey; label: string; hint: string; defaultReward: string }[] = [
  { key: 'data', label: 'Contribute data', hint: 'sources, documents, datasets, signals', defaultReward: '100' },
  { key: 'review', label: 'Review quality', hint: 'grade outputs, QC contributions', defaultReward: '50' },
  { key: 'train', label: 'Training & evals', hint: 'label edge cases, run evals, tune prompts', defaultReward: '75' },
  { key: 'promote', label: 'Promote the mission', hint: 'threads, videos, posts', defaultReward: '40' },
  { key: 'integrate', label: 'Build integrations', hint: 'plugins, MCP servers, workflows', defaultReward: '150' },
]

const OFFERING_TYPES = [
  'API / tool access',
  'AI-generated reports & briefs',
  'Give-to-get: data for model access',
  'Usage credits / compute',
  'Subscriptions & memberships',
  'Services & consulting',
  'Digital products',
]

const REDEMPTIONS = [
  'Product discounts (USD store)',
  'Usage credits',
  'Early access',
  'Coin-gated collaboration',
  'Founder-agent access',
]

type Spec = {
  operatorEmail: string
  agentName: string
  subdomain: string
  vertical: string
  pitch: string
  offeringType: string
  offeringName: string
  offeringPrice: string
  coinName: string
  coinSymbol: string
  coinTouched: boolean
  redemptions: string[]
  tasks: Record<TaskKey, { enabled: boolean; reward: string }>
  referralPct: number
  referralTier2Pct: number
}

const INITIAL: Spec = {
  operatorEmail: '',
  agentName: '',
  subdomain: '',
  vertical: '',
  pitch: '',
  offeringType: OFFERING_TYPES[0],
  offeringName: '',
  offeringPrice: '49',
  coinName: '',
  coinSymbol: '',
  coinTouched: false,
  redemptions: ['Product discounts (USD store)', 'Early access'],
  tasks: Object.fromEntries(
    TASK_DEFS.map((t) => [t.key, { enabled: t.key === 'data' || t.key === 'promote', reward: t.defaultReward }]),
  ) as Spec['tasks'],
  referralPct: 10,
  referralTier2Pct: 3,
}

const STEP_TITLES = ['Identity', 'Offer', 'Coin', 'Growth', 'Launch']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildProvisionPack(s: Spec) {
  const coin = s.coinSymbol ? `$${s.coinSymbol.toUpperCase()}` : '$COIN'
  const tasks = TASK_DEFS.filter((t) => s.tasks[t.key].enabled)
    .map((t) => `- ${t.label}: ${s.tasks[t.key].reward || '0'} ${coin} per confirmed completion`)
    .join('\n')
  return `AGENT UPSIDE — PROVISION REQUEST
================================
Operator:  ${s.operatorEmail || '(email)'}
Agent:     ${s.agentName || '(unnamed agent)'}
Hub:       ${s.subdomain || slugify(s.agentName) || 'your-agent'}.slyk.io
Vertical:  ${s.vertical || '(vertical)'}
Pitch:     ${s.pitch || '(one-line pitch)'}

ECOMM (USD via SlykPay — we operate Stripe)
- Offering: ${s.offeringName || '(offering name)'} (${s.offeringType})
- Price:    $${s.offeringPrice || '0'} USD
- Rails:    SlykPay on the hub (card via Stripe). Operator does NOT connect their own Stripe.

REWARD COIN (closed-loop — not an investment)
- Name:        ${s.coinName || '(coin name)'} (${coin})
- Redeems for: ${s.redemptions.join(', ') || '(select redemptions)'}
- Note:        Redemptions reduce eligible cash available for later revenue-share pools.

TASKS & REFERRALS (we configure these)
${tasks || '- (no tasks selected)'}
- Referral tier 1: ${s.referralPct}% of referred sales
- Referral tier 2: ${s.referralTier2Pct}% of second-degree sales

UPSIDE (LATER — separate regulated offering)
- Eligible human collaborators may access Reg D / Reg CF revenue participation
  funded from SlykPay (Stripe) net proceeds after redemptions / costs.
- Human principal required. Agents do not hold securities.

FULFILLMENT
We generate the Slyk hub + store + coin + tasks + referrals, deliver login / API key /
bootstrap prompt, and transfer the hub to the operator. No wizard plodding.
`
}

const inputCls =
  'w-full rounded-lg border border-edge bg-ground px-4 py-2.5 text-sm text-ink placeholder:text-fog/60 outline-none transition focus:border-up'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs text-fog">{label}</span>
      {children}
    </label>
  )
}

export default function HubBuilder() {
  const [step, setStep] = useState(0)
  const [spec, setSpec] = useState<Spec>(INITIAL)
  const [copied, setCopied] = useState(false)
  const [queued, setQueued] = useState(false)
  const { hasAccess } = useAccess()
  const runGated = useGatedAction()

  const suggestion = useMemo(
    () =>
      suggestCoin({
        agentName: spec.agentName,
        vertical: spec.vertical,
        offeringType: spec.offeringType,
        offeringName: spec.offeringName,
      }),
    [spec.agentName, spec.vertical, spec.offeringType, spec.offeringName],
  )

  // Auto-suggest coin until the operator edits it
  useEffect(() => {
    if (spec.coinTouched) return
    if (!spec.agentName && !spec.vertical) return
    setSpec((s) => ({
      ...s,
      coinName: suggestion.coinName,
      coinSymbol: suggestion.coinSymbol,
    }))
  }, [suggestion.coinName, suggestion.coinSymbol, spec.agentName, spec.vertical, spec.coinTouched])

  const pack = useMemo(() => buildProvisionPack(spec), [spec])
  const set = <K extends keyof Spec>(k: K, v: Spec[K]) => setSpec((s) => ({ ...s, [k]: v }))

  const canNext =
    step === 0
      ? spec.agentName.trim().length > 0 && spec.operatorEmail.includes('@')
      : true

  return (
    <section id="build" className="relative overflow-hidden border-y border-edge bg-panel py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-up uppercase">Launch intake</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Answer. We generate. You get the keys.
          </h2>
          <p className="mt-4 max-w-2xl text-fog">
            No wizard slog. Tell us what your agent sells, name its reward coin, pick tasks and
            referrals — we stand up the Slyk, wire SlykPay (USD), and transfer the hub to you.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-xl border border-edge bg-ground">
            <div className="flex border-b border-edge">
              {STEP_TITLES.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex-1 border-r border-edge px-2 py-3 font-mono text-xs transition last:border-r-0 ${
                    i === step ? 'bg-panel text-up' : i < step ? 'text-ink' : 'text-fog/50'
                  }`}
                >
                  <span className="hidden sm:inline">{String(i + 1).padStart(2, '0')} · </span>
                  {t}
                </button>
              ))}
            </div>

            <div className="p-6 md:p-10">
              {step === 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="your email *">
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="you@company.com"
                      value={spec.operatorEmail}
                      onChange={(e) => set('operatorEmail', e.target.value)}
                    />
                  </Field>
                  <Field label="agent name *">
                    <input
                      className={inputCls}
                      placeholder="reportbot"
                      value={spec.agentName}
                      onChange={(e) => {
                        set('agentName', e.target.value)
                        set('subdomain', slugify(e.target.value))
                      }}
                    />
                  </Field>
                  <Field label="hub address">
                    <div className="flex items-center gap-2">
                      <input
                        className={inputCls}
                        placeholder="reportbot"
                        value={spec.subdomain}
                        onChange={(e) => set('subdomain', slugify(e.target.value))}
                      />
                      <span className="font-mono text-sm text-fog">.slyk.io</span>
                    </div>
                  </Field>
                  <Field label="vertical / mission">
                    <input
                      className={inputCls}
                      placeholder="deep research reports for VCs"
                      value={spec.vertical}
                      onChange={(e) => set('vertical', e.target.value)}
                    />
                  </Field>
                  <Field label="one-line pitch">
                    <input
                      className={`${inputCls} md:col-span-2`}
                      placeholder="Institutional-grade research, agent speed."
                      value={spec.pitch}
                      onChange={(e) => set('pitch', e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="what does your agent sell?">
                    <select
                      className={inputCls}
                      value={spec.offeringType}
                      onChange={(e) => set('offeringType', e.target.value)}
                    >
                      {OFFERING_TYPES.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="offering name">
                    <input
                      className={inputCls}
                      placeholder="Deep Research Report"
                      value={spec.offeringName}
                      onChange={(e) => set('offeringName', e.target.value)}
                    />
                  </Field>
                  <Field label="price (USD)">
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      value={spec.offeringPrice}
                      onChange={(e) => set('offeringPrice', e.target.value)}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-fog md:col-span-3">
                    Checkout runs in <strong className="text-ink">USD through SlykPay</strong> (Stripe
                    under the hood on your hub) — same model as{' '}
                    <a href={COMMUNITY_URL} className="text-up underline underline-offset-2" target="_blank" rel="noreferrer">
                      ai.slyk.io
                    </a>
                    . You launch with us; you do not wire your own Stripe account.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2 rounded-lg border border-up/30 bg-up/5 px-4 py-3">
                    <p className="font-mono text-xs text-up">suggested from what your agent does</p>
                    <p className="mt-1 text-sm text-ink">
                      {suggestion.coinName} ({suggestion.coinSymbol}) — {suggestion.rationale}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestion.alternatives.map((a) => (
                        <button
                          key={a.coinSymbol}
                          type="button"
                          onClick={() => {
                            set('coinName', a.coinName)
                            set('coinSymbol', a.coinSymbol)
                            set('coinTouched', true)
                          }}
                          className="rounded border border-edge bg-panel px-2.5 py-1 font-mono text-xs text-fog transition hover:border-up hover:text-ink"
                        >
                          {a.coinName} · ${a.coinSymbol}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          set('coinName', suggestion.coinName)
                          set('coinSymbol', suggestion.coinSymbol)
                          set('coinTouched', true)
                        }}
                        className="rounded border border-up/40 bg-panel px-2.5 py-1 font-mono text-xs text-up"
                      >
                        use suggestion
                      </button>
                    </div>
                  </div>
                  <Field label="coin name (yours to name)">
                    <input
                      className={inputCls}
                      placeholder="Research Credits"
                      value={spec.coinName}
                      onChange={(e) => {
                        set('coinName', e.target.value)
                        set('coinTouched', true)
                      }}
                    />
                  </Field>
                  <Field label="coin symbol">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-fog">$</span>
                      <input
                        className={inputCls}
                        placeholder="RSRCH"
                        value={spec.coinSymbol}
                        onChange={(e) => {
                          set('coinSymbol', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                          set('coinTouched', true)
                        }}
                      />
                    </div>
                  </Field>
                  <div className="md:col-span-2">
                    <span className="mb-2 block font-mono text-xs text-fog">coin redeems for</span>
                    <div className="flex flex-wrap gap-2.5">
                      {REDEMPTIONS.map((r) => {
                        const on = spec.redemptions.includes(r)
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() =>
                              set(
                                'redemptions',
                                on ? spec.redemptions.filter((x) => x !== r) : [...spec.redemptions, r],
                              )
                            }
                            className={`rounded-lg border px-4 py-1.5 text-sm transition ${
                              on ? 'border-up/60 bg-up/10 text-up' : 'border-edge text-fog hover:border-fog'
                            }`}
                          >
                            {r}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-fog md:col-span-2">
                    Closed-loop loyalty — not an investment. When helpers redeem for discounts, that
                    reduces net cash available for any later revenue-share pool.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <span className="mb-3 block font-mono text-xs text-fog">
                    tasks we will configure (reward per confirmed completion — human or AI)
                  </span>
                  <div className="space-y-2.5">
                    {TASK_DEFS.map((t) => {
                      const st = spec.tasks[t.key]
                      return (
                        <div
                          key={t.key}
                          className={`flex flex-wrap items-center gap-4 rounded-xl border px-5 py-3.5 transition ${
                            st.enabled ? 'border-up/40 bg-panel' : 'border-edge bg-panel'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              set('tasks', { ...spec.tasks, [t.key]: { ...st, enabled: !st.enabled } })
                            }
                            className={`flex h-5 w-5 items-center justify-center rounded border text-xs transition ${
                              st.enabled ? 'border-up bg-up text-bright' : 'border-edge text-transparent'
                            }`}
                            aria-label={t.label}
                          >
                            ✓
                          </button>
                          <div className="min-w-40 flex-1">
                            <p className="text-sm font-semibold">{t.label}</p>
                            <p className="text-xs text-fog">{t.hint}</p>
                          </div>
                          <input
                            className={`${inputCls} w-28`}
                            type="number"
                            min="0"
                            disabled={!st.enabled}
                            value={st.reward}
                            onChange={(e) =>
                              set('tasks', { ...spec.tasks, [t.key]: { ...st, reward: e.target.value } })
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div>
                      <span className="mb-2 block font-mono text-xs text-fog">
                        referral tier 1: <span className="text-up">{spec.referralPct}%</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={spec.referralPct}
                        onChange={(e) => set('referralPct', Number(e.target.value))}
                        className="w-full accent-up"
                      />
                      <p className="mt-1 text-xs text-fog">Share of a sale when a member’s recruit buys.</p>
                    </div>
                    <div>
                      <span className="mb-2 block font-mono text-xs text-fog">
                        referral tier 2: <span className="text-up">{spec.referralTier2Pct}%</span>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={spec.referralTier2Pct}
                        onChange={(e) => set('referralTier2Pct', Number(e.target.value))}
                        className="w-full accent-up"
                      />
                      <p className="mt-1 text-xs text-fog">Second-degree — when their recruits’ recruits earn.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="relative min-w-0 rounded-xl border border-edge bg-ink">
                    <button
                      type="button"
                      onClick={async () => {
                        if (await copyText(pack)) {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 1800)
                        }
                      }}
                      className="absolute right-3 top-3 rounded-md border border-bright/15 bg-ink px-2.5 py-1 font-mono text-xs text-bright/70 transition hover:text-bright"
                    >
                      {copied ? 'copied' : 'copy pack'}
                    </button>
                    <pre className="max-h-96 overflow-auto p-5 font-mono text-xs leading-relaxed text-bright/75">
                      {pack}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        runGated(() => {
                          setQueued(true)
                        })
                      }
                      className="rounded-xl bg-up px-5 py-4 text-center font-bold text-bright transition hover:bg-up-dim"
                    >
                      {queued ? 'Request queued ✓' : 'Submit — we build your hub →'}
                    </button>
                    {queued && (
                      <p className="text-xs leading-relaxed text-up">
                        Provision pack ready. We&rsquo;ll generate the Slyk, configure SlykPay, tasks, and
                        referrals, then transfer the hub to {spec.operatorEmail || 'your email'}.
                      </p>
                    )}
                    {!hasAccess && (
                      <p className="text-xs text-warn">Hub access required to submit a provision request.</p>
                    )}
                    <p className="text-xs leading-relaxed text-fog">
                      You never walk the public wizard. We generate everything and hand you the keys —
                      dashboard, API access, and a bootstrap prompt for your agent.
                    </p>
                  </div>
                </div>
              )}

              {step < 4 && (
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="rounded-lg border border-edge px-5 py-2.5 text-sm font-semibold text-fog transition enabled:hover:border-fog enabled:hover:text-ink disabled:opacity-40"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runGated(() => {
                        if (canNext) setStep((s) => s + 1)
                      })
                    }
                    disabled={!canNext}
                    className="rounded-lg bg-up px-6 py-2.5 text-sm font-bold text-bright transition enabled:hover:bg-up-dim disabled:opacity-40"
                  >
                    {step === 3 ? (hasAccess ? 'Build my provision pack →' : 'Unlock to continue →') : 'Next →'}
                  </button>
                </div>
              )}
              {step === 4 && (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3)
                      setQueued(false)
                    }}
                    className="rounded-lg border border-edge px-5 py-2.5 text-sm font-semibold text-fog transition hover:border-fog hover:text-ink"
                  >
                    ← Edit answers
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
