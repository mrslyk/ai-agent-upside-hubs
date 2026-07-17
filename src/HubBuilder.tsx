import { useMemo, useState } from 'react'
import { copyText } from './copy'
import { useAccess, useGatedAction } from './access/AccessContext'
import Reveal from './Reveal'
import { COMMUNITY_URL, WIZARD_URL } from './links'

type TaskKey = 'data' | 'review' | 'train' | 'promote' | 'integrate'

const TASK_DEFS: { key: TaskKey; label: string; hint: string; defaultReward: string }[] = [
  { key: 'data', label: 'Contribute data', hint: 'sources, documents, datasets, signals', defaultReward: '100' },
  { key: 'review', label: 'Review quality', hint: 'grade outputs, QC contributions', defaultReward: '50' },
  { key: 'train', label: 'Training & evals', hint: 'label edge cases, run evals, tune prompts', defaultReward: '75' },
  { key: 'promote', label: 'Promote the mission', hint: 'threads, videos, posts', defaultReward: '40' },
  { key: 'integrate', label: 'Build integrations', hint: 'plugins, MCP servers, workflows', defaultReward: '150' },
]

const OFFERING_TYPES = [
  'AI-generated reports',
  'Tool / API access',
  'Usage credits',
  'Services & consulting',
  'Subscriptions & memberships',
  'Digital products',
  'Physical products',
]

const REDEMPTIONS = [
  'Product discounts',
  'Usage credits',
  'Early access',
  'Coin-gated collaboration',
  'Founder-agent access',
]

type Spec = {
  agentName: string
  subdomain: string
  vertical: string
  pitch: string
  offeringType: string
  offeringName: string
  offeringPrice: string
  coinName: string
  coinSymbol: string
  redemptions: string[]
  tasks: Record<TaskKey, { enabled: boolean; reward: string }>
  referralPct: number
}

const INITIAL: Spec = {
  agentName: '',
  subdomain: '',
  vertical: '',
  pitch: '',
  offeringType: OFFERING_TYPES[0],
  offeringName: '',
  offeringPrice: '49',
  coinName: '',
  coinSymbol: '',
  redemptions: ['Product discounts', 'Early access'],
  tasks: Object.fromEntries(
    TASK_DEFS.map((t) => [t.key, { enabled: t.key === 'data' || t.key === 'promote', reward: t.defaultReward }]),
  ) as Spec['tasks'],
  referralPct: 10,
}

const STEP_TITLES = ['Identity', 'Offer', 'Coin', 'Rewards', 'Launch']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function buildSpecText(s: Spec) {
  const coin = s.coinSymbol ? `$${s.coinSymbol.toUpperCase()}` : '$COIN'
  const tasks = TASK_DEFS.filter((t) => s.tasks[t.key].enabled)
    .map((t) => `- ${t.label}: ${s.tasks[t.key].reward || '0'} ${coin} per completion`)
    .join('\n')
  return `UPSIDE HUB SPEC v1
==================
Agent:     ${s.agentName || '(unnamed agent)'}
Hub:       ${s.subdomain || slugify(s.agentName) || 'your-agent'}.slyk.io
Vertical:  ${s.vertical || '(vertical)'}
Pitch:     ${s.pitch || '(one-line pitch)'}

STORE
- Offering: ${s.offeringName || '(offering name)'} (${s.offeringType})
- Price:    $${s.offeringPrice || '0'} USD

REWARD COIN
- Name:        ${s.coinName || '(coin name)'} (${coin})
- Redeems for: ${s.redemptions.join(', ') || '(select redemptions)'}
- Status:      closed-loop community reward — not an investment, no promise of profit

TASKS & REWARDS
${tasks || '- (no tasks selected)'}
- Referral sales reward: ${s.referralPct}% (two-tier earn recommended)

UPSIDE PATH (LATER)
- Eligible top contributors may be invited to a separate, regulated
  offering (Reg CF / Reg D) tied to hub cash flows. Configure only with
  compliance tooling in place.

EXECUTE
1. Human founder: run the setup wizard and enter the values above:
   ${WIZARD_URL}
2. Create an API key in the hub dashboard.
3. Agent: read https://developers.slyk.io/slyk/llms.txt and operate
   the economy (products, tasks, payouts) via the Slyk API.`
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
  const { hasAccess } = useAccess()
  const runGated = useGatedAction()

  const specText = useMemo(() => buildSpecText(spec), [spec])
  const set = <K extends keyof Spec>(k: K, v: Spec[K]) => setSpec((s) => ({ ...s, [k]: v }))

  const canNext =
    step !== 0 || spec.agentName.trim().length > 0

  return (
    <section id="build" className="relative overflow-hidden border-y border-edge bg-panel py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-up uppercase">Build your hub</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Five questions. One launch-ready spec.
          </h2>
          <p className="mt-4 max-w-2xl text-fog">
            Answer these and we&rsquo;ll assemble everything the setup wizard needs — a spec you can
            execute yourself, hand to your agent, or bring to the community for a concierge setup.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-xl border border-edge bg-ground">
            {/* step indicator */}
            <div className="flex border-b border-edge">
              {STEP_TITLES.map((t, i) => (
                <button
                  key={t}
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
                      className={inputCls}
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
                        <option key={o} value={o} className="bg-panel">
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
                    You can add more products later — the wizard just needs your first offering. Payments
                    can be card, PayPal, bank, or crypto.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="coin name">
                    <input
                      className={inputCls}
                      placeholder="Research Coin"
                      value={spec.coinName}
                      onChange={(e) => set('coinName', e.target.value)}
                    />
                  </Field>
                  <Field label="coin symbol">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-fog">$</span>
                      <input
                        className={inputCls}
                        placeholder="RSRCH"
                        value={spec.coinSymbol}
                        onChange={(e) => set('coinSymbol', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
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
                            onClick={() =>
                              set(
                                'redemptions',
                                on ? spec.redemptions.filter((x) => x !== r) : [...spec.redemptions, r],
                              )
                            }
                            className={`rounded-full border px-4 py-1.5 text-sm transition ${
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
                    Your coin is a closed-loop community reward — earned through contribution, redeemed
                    inside your economy. Never market it as an investment.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <span className="mb-3 block font-mono text-xs text-fog">
                    what help does your agent need? (reward per completion, in your coin)
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
                  <div className="mt-6">
                    <span className="mb-2 block font-mono text-xs text-fog">
                      referral sales reward: <span className="text-up">{spec.referralPct}%</span> of every
                      sale a member brings
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={spec.referralPct}
                      onChange={(e) => set('referralPct', Number(e.target.value))}
                      className="w-full accent-up"
                    />
                    <p className="mt-1.5 text-xs text-fog">
                      The wizard slider goes to 20% — you can raise it further (and enable two-tier earn)
                      from the founder admin panel after setup.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="relative min-w-0 rounded-xl border border-edge bg-ink">
                    <button
                      onClick={async () => {
                        if (await copyText(specText)) {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 1800)
                        }
                      }}
                      className="absolute right-3 top-3 rounded-md border border-bright/15 bg-ink px-2.5 py-1 font-mono text-xs text-bright/70 transition hover:text-bright"
                    >
                      {copied ? 'copied' : 'copy spec'}
                    </button>
                    <pre className="max-h-96 overflow-auto p-5 font-mono text-xs leading-relaxed text-bright/75">
                      {specText}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        runGated(() => window.open(WIZARD_URL, '_blank', 'noopener,noreferrer'))
                      }
                      className="rounded-xl bg-up px-5 py-4 text-center font-bold text-bright transition hover:bg-up-dim"
                    >
                      Do it yourself:
                      <br />
                      open the wizard →
                    </button>
                    <a
                      href={COMMUNITY_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-edge bg-panel-2 px-5 py-4 text-center text-sm font-semibold transition hover:border-fog"
                    >
                      Done for you: post your spec in the community and earn your setup →
                    </a>
                    {!hasAccess && (
                      <p className="text-xs text-warn">Hub access required to open the setup wizard.</p>
                    )}
                    <p className="text-xs leading-relaxed text-fog">
                      Or paste the spec into your own agent — it has everything needed to run the wizard
                      values and operate the hub via the Slyk API.
                    </p>
                  </div>
                </div>
              )}

              {/* nav buttons */}
              {step < 4 && (
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="rounded-lg border border-edge px-5 py-2.5 text-sm font-semibold text-fog transition enabled:hover:border-fog enabled:hover:text-ink disabled:opacity-40"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() =>
                      runGated(() => {
                        if (canNext) setStep((s) => s + 1)
                      })
                    }
                    disabled={!canNext}
                    className="rounded-lg bg-up px-6 py-2.5 text-sm font-bold text-bright transition enabled:hover:bg-up-dim disabled:opacity-40"
                  >
                    {step === 3 ? (hasAccess ? 'Generate my spec →' : 'Unlock to generate spec →') : 'Next →'}
                  </button>
                </div>
              )}
              {step === 4 && (
                <div className="mt-8">
                  <button
                    onClick={() => setStep(3)}
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
