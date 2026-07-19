import { useState } from 'react'
import AgentConsole from './AgentConsole'
import { AccessProvider, useAccess, useGatedAction } from './access/AccessContext'
import PaywallModal from './access/PaywallModal'
import { copyText } from './copy'
import HubBuilder from './HubBuilder'
import Reveal from './Reveal'
import UpsideGate from './UpsideGate'
import {
  API_DOCS_URL,
  COMMUNITY_URL,
  SUBSTACK_ARTICLE_URL,
  SUBSTACK_URL,
} from './links'

const BOOTSTRAP_PROMPT = `You are an AI agent. Your human is launching an Upside Hub for you on Slyk (ai.slyk.io / SlykPay).
1. They answer a short intake — what you sell, your reward coin, tasks, referrals.
2. The platform generates the hub (store in USD via SlykPay, coin, tasks, two-tier referrals) and transfers it to them.
3. You receive an API key. Operate products, tasks, and payouts via the Slyk API: https://developers.slyk.io/slyk/llms.txt
4. Pay humans and agents in your coin when work is confirmed. Let them redeem for discounts / access (give-to-get).
5. Never call your reward coin an investment. Revenue share (Reg D / Reg CF) is a separate offering for eligible humans only, funded from SlykPay net proceeds after redemptions.`

function scrollToBuild() {
  document.getElementById('build')?.scrollIntoView({ behavior: 'smooth' })
}

/* ---------------------------------- nav ---------------------------------- */

function Nav() {
  const { hasAccess, email } = useAccess()
  const runGated = useGatedAction()

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-edge/70 bg-ground/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="animate-rise flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-up font-display text-lg font-semibold text-bright">
            ↑
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Agent Upside
          </span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-fog md:flex">
          <a href="#what" className="transition hover:text-ink">What it is</a>
          <a href="#usecases" className="transition hover:text-ink">Use cases</a>
          <a href="#slykpay" className="transition hover:text-ink">SlykPay</a>
          <a href="#how" className="transition hover:text-ink">How it works</a>
          <a href="#build" className="transition hover:text-ink">Launch</a>
          <a href="#upside" className="transition hover:text-ink">Revenue share</a>
          <a href={COMMUNITY_URL} target="_blank" rel="noreferrer" className="transition hover:text-ink">
            Community
          </a>
        </div>
        {hasAccess ? (
          <span className="hidden font-mono text-xs text-up md:inline">{email}</span>
        ) : null}
        <button
          type="button"
          onClick={() => runGated(scrollToBuild)}
          className="rounded-lg bg-up px-4 py-2 text-sm font-semibold text-bright transition hover:bg-up-dim"
        >
          {hasAccess ? 'Launch intake' : 'Get hub access'}
        </button>
      </div>
    </nav>
  )
}

/* ---------------------------------- hero --------------------------------- */

function Hero() {
  const runGated = useGatedAction()
  return (
    <header id="top" className="relative min-h-[100svh] overflow-hidden pt-28 pb-16 md:pt-32">
      <div className="hero-field absolute inset-0" />
      <div className="hero-hatch absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="animate-rise font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Agent Upside
          </p>
          <h1
            className="mt-5 max-w-xl font-display text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl md:text-[2.65rem]"
            style={{ animation: 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both' }}
          >
            Not a wallet. Upside in your agent&rsquo;s revenue.
          </h1>
          <p
            className="mt-5 max-w-lg text-lg leading-relaxed text-fog"
            style={{ animation: 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both' }}
          >
            Make it easy for humans and agents to earn in the stream your agent creates — USD sales via
            SlykPay, a reward coin for growth, and compliant revenue share for top collaborators. You
            answer a few questions. We generate the hub. You get the keys.
          </p>
          <div
            className="mt-9 flex flex-wrap items-center gap-4"
            style={{ animation: 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both' }}
          >
            <button
              type="button"
              onClick={() => runGated(scrollToBuild)}
              className="rounded-lg bg-up px-6 py-3.5 font-semibold text-bright transition hover:bg-up-dim"
            >
              Launch your Upside Hub →
            </button>
            <a
              href="#how"
              className="rounded-lg border border-edge bg-panel px-6 py-3.5 font-semibold text-ink transition hover:border-ink/30"
            >
              See how it works
            </a>
          </div>
        </div>
        <div className="min-w-0" style={{ animation: 'rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both' }}>
          <AgentConsole />
        </div>
      </div>
    </header>
  )
}

/* ------------------------------ what it is ------------------------------- */

function WhatItIs() {
  return (
    <section id="what" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-up uppercase">What it is</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Three rails. One launch. Powered by Slyk.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
          Stripe alone gives your agent a checkout link. Agent Upside gives it an economy on{' '}
          <a href={COMMUNITY_URL} className="text-up underline underline-offset-2" target="_blank" rel="noreferrer">
            ai.slyk.io
          </a>
          — sales, growth rewards, and a path for collaborators to share revenue.
        </p>
      </Reveal>
      <div className="mt-14 grid gap-x-12 gap-y-10 border-t border-edge pt-12 md:grid-cols-3">
        {[
          {
            n: '01',
            title: 'Ecomm (USD)',
            body: 'Sell access, reports, APIs, subscriptions. Checkout runs through SlykPay — Stripe under the hood. You don’t connect your own Stripe; we operate the rails.',
          },
          {
            n: '02',
            title: 'Reward ledger',
            body: 'Your agent’s coin pays humans and other agents for tasks and two-tier referrals. Redeem for discounts and access — give-to-get. Not an investment.',
          },
          {
            n: '03',
            title: 'Revenue share',
            body: 'Top collaborators may later join a Reg D or Reg CF offering funded from SlykPay net proceeds — after coin redemptions — so help that grows sales can own a piece of the stream.',
          },
        ].map((item, i) => (
          <Reveal key={item.n} delay={i * 100}>
            <p className="font-mono text-xs text-up">{item.n}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">{item.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------ use cases -------------------------------- */

const USE_CASES = [
  {
    title: 'Give-to-get data → model access',
    body: 'Contributors feed training data or labels; they earn coin redeemable for access to the model trained on that data. Top data partners later invited into revenue share.',
  },
  {
    title: 'Research / report agent',
    body: 'Sell briefs and diligence packs in USD. Pay scouts and reviewers in coin. Referrals grow the buyer base. Upside for the humans who built the research moat.',
  },
  {
    title: 'API / tool agent',
    body: 'Metered or subscription access via SlykPay. Community builds plugins and evals for coin. Discounts for helpers; securities path when cash flow is real.',
  },
  {
    title: 'Support / ops agent',
    body: 'Sell resolution packs or seat access. Reward humans who escalate well, write playbooks, or refer teams. Growth paid in coin; ownership via Reg CF for the community.',
  },
  {
    title: 'Content / growth agent',
    body: 'Sell campaigns or assets. Two-tier referrals for distribution. Promote tasks pay coin. Best promoters convert into cashflow participants under Reg D / CF.',
  },
  {
    title: 'Specialist vertical agent',
    body: 'Legal, health, finance, education — any agent with a clear deliverable. Same stack: USD store, mission-named coin, tasks, then regulated upside.',
  },
]

function UseCases() {
  return (
    <section id="usecases" className="border-y border-edge bg-panel py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-up uppercase">How agents make money</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            If your agent creates value, it can sell access to that value.
          </h2>
          <p className="mt-4 max-w-2xl text-fog">
            Humans create agents that do something valuable. Agent Upside makes it easy to charge for
            the output, reward the network that grows it, and share revenue with the collaborators who
            mattered most.
          </p>
        </Reveal>
        <ol className="mt-14 divide-y divide-edge">
          {USE_CASES.map((u, i) => (
            <Reveal key={u.title} delay={i * 50}>
              <li className="grid gap-3 py-7 md:grid-cols-[2rem_1fr] md:gap-8">
                <span className="font-mono text-sm text-up">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{u.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fog md:text-base">{u.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------ SlykPay ---------------------------------- */

function SlykPay() {
  return (
    <section id="slykpay" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-up uppercase">SlykPay</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          You launch with us. We run the rails.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
          Payments are USD through <strong className="font-semibold text-ink">SlykPay</strong> on your
          hub — Stripe under the hood, same pattern as the flagship community. You do not connect a
          personal Stripe account or plod through payment setup. That&rsquo;s the point.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-10 border-t border-edge pt-12 md:grid-cols-2">
        <Reveal delay={80}>
          <h3 className="font-display text-xl font-semibold">What you do</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fog">
            <li>Register with email and complete the intake (offer, coin, tasks, referrals).</li>
            <li>We generate the Slyk hub and transfer ownership to you.</li>
            <li>Your agent (or you) operates products and tasks via API key.</li>
          </ul>
        </Reveal>
        <Reveal delay={160}>
          <h3 className="font-display text-xl font-semibold">What we do</h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fog">
            <li>Stand up store, coin, tasks, two-tier referrals on Slyk.</li>
            <li>SlykPay / Stripe for USD checkout — no DIY merchant wiring.</li>
            <li>Later: compliance path for Reg D / Reg CF from net SlykPay proceeds.</li>
          </ul>
        </Reveal>
      </div>
      <Reveal delay={200}>
        <p className="mt-10 max-w-2xl text-sm text-fog">
          Need a persistent guide after launch? Your agent + our bootstrap prompt handle day-to-day
          ops. Coin naming is suggested from your vertical in the intake — you always choose the final
          name. No separate “Stripe config AI” required because SlykPay is already configured.
        </p>
      </Reveal>
    </section>
  )
}

/* ---------------------------- two paths ---------------------------------- */

function TwoPaths() {
  return (
    <section id="coins" className="border-y border-edge bg-panel-2/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-up uppercase">After someone helps</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Give-to-get — or own a piece of the stream.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal delay={80}>
            <p className="font-mono text-xs text-up">Path A · Reward coin</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">Redeem for access</h3>
            <p className="mt-4 text-sm leading-relaxed text-fog md:text-base">
              Collaborators spend coin on discounts and access to your agent&rsquo;s USD offerings.
              Growth compounds. Redemptions are real — they come out of the same commercial pie that
              later funds upside.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p className="font-mono text-xs text-warn">Path B · Regulated upside</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">Revenue share securities</h3>
            <p className="mt-4 text-sm leading-relaxed text-fog md:text-base">
              Eligible humans may participate in a separate Reg D or Reg CF offering. Distributions
              are paid from <em>net</em> SlykPay (Stripe) cash flows — after reward-coin redemptions
              and costs — not by magically turning coins into stock.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ raise ------------------------------------ */

function Raise() {
  return (
    <section id="raise" className="mx-auto max-w-6xl overflow-hidden px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-warn uppercase">Revenue share</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Your agent can issue revenue share — with a human principal.
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fog">
          When sales are real, invite top collaborators into a regulated offering tied to the hub&rsquo;s
          eligible cash flows. Agents operate the economy; humans issue and hold securities.
        </p>
      </Reveal>
      <div className="mt-14 space-y-10 border-t border-edge pt-12">
        <Reveal delay={60}>
          <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10">
            <h3 className="font-display text-xl font-semibold">Reg D 506(b)/(c)</h3>
            <p className="text-sm leading-relaxed text-fog md:text-base">
              Private or accredited-focused paths. 506(b): up to 35 non-accredited sophisticated
              investors plus unlimited accredited; no general solicitation. 506(c): public promotion
              with verified accredited investors only.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="grid gap-4 md:grid-cols-[12rem_1fr] md:gap-10">
            <h3 className="font-display text-xl font-semibold">Reg CF</h3>
            <p className="text-sm leading-relaxed text-fog md:text-base">
              Crowdfunding so the broader agent community can buy upside through a registered funding
              portal — Form C, investment limits, ongoing reporting.
            </p>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <p className="max-w-3xl font-mono text-xs leading-relaxed text-fog">
            * Pool economics example: upside units represent a defined % of eligible cash flows.
            Eligible = SlykPay proceeds net of reward redemptions and agreed costs. Instrument is a
            security because it is tied to business revenue.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ how it works ----------------------------- */

const STEPS = [
  { n: '1', title: 'Register', body: 'Email in. Hub access unlocks the intake.' },
  { n: '2', title: 'Intake', body: 'What you sell, coin name (we suggest), tasks, two-tier referrals.' },
  { n: '3', title: 'We generate', body: 'Slyk hub + SlykPay store + coin + rewards. No wizard plodding.' },
  { n: '4', title: 'Transfer', body: 'You get dashboard, API key, bootstrap prompt. Hub is yours.' },
  { n: '5', title: 'Grow → raise', body: 'Sell in USD, reward help, then open Reg D / Reg CF when ready.' },
]

function HowItWorks() {
  const runGated = useGatedAction()
  return (
    <section id="how" className="border-y border-edge bg-panel py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-xs tracking-widest text-up uppercase">How it works</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Register → intake → we build → you operate
          </h2>
        </Reveal>
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 70}>
              <li>
                <span className="font-mono text-sm text-up">{s.n}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog">{s.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={200}>
          <button
            type="button"
            onClick={() => runGated(scrollToBuild)}
            className="mt-12 font-semibold text-up underline decoration-up/40 underline-offset-4 transition hover:decoration-up"
          >
            Start the launch intake →
          </button>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------- for agents ------------------------------ */

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative rounded-xl border border-edge bg-ink">
      <button
        type="button"
        onClick={async () => {
          if (await copyText(text)) {
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }
        }}
        className="absolute right-3 top-3 rounded-md border border-edge/40 bg-ink px-2.5 py-1 font-mono text-xs text-bright/70 transition hover:text-bright"
      >
        {copied ? 'copied' : 'copy'}
      </button>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-bright/80">{text}</pre>
    </div>
  )
}

const API_ROWS = [
  ['Sell', 'POST /products · POST /orders', 'USD offerings via SlykPay'],
  ['Mint', 'POST /assets', 'Issue your closed-loop reward coin'],
  ['Ask', 'POST /tasks', 'Help-wanted priced in coin'],
  ['Pay', 'POST /tasks/:id/complete', 'Confirm work; reward on ledger'],
  ['Grow', 'invites · referrals', 'Two-tier referral earn'],
  ['React', 'webhooks', 'Sales, joins, payouts'],
]

function ForAgents() {
  return (
    <section id="agents" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-up uppercase">For agents</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Cursor, Claude, Devin, Kimi — this is for your operator.
        </h2>
        <p className="mt-4 max-w-2xl text-fog">
          Machine-readable onboarding:{' '}
          <a href="/agents.md" className="font-mono text-up underline decoration-up/40 underline-offset-4">/agents.md</a>,{' '}
          <a href="/hub.json" className="font-mono text-up underline decoration-up/40 underline-offset-4">/hub.json</a>,{' '}
          <a href="/llms.txt" className="font-mono text-up underline decoration-up/40 underline-offset-4">/llms.txt</a>.
          After transfer, operate over the{' '}
          <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="text-up underline decoration-up/40 underline-offset-4">
            Slyk API
          </a>
          .
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Reveal delay={80} className="min-w-0">
          <h3 className="mb-3 font-mono text-xs text-fog">bootstrap prompt</h3>
          <CopyBlock text={BOOTSTRAP_PROMPT} />
        </Reveal>
        <Reveal delay={160} className="min-w-0">
          <h3 className="mb-3 font-mono text-xs text-fog">six API verbs</h3>
          <div className="overflow-hidden rounded-xl border border-edge bg-panel">
            {API_ROWS.map(([verb, endpoint, desc], i) => (
              <div
                key={verb}
                className={`grid grid-cols-[4.5rem_1fr] gap-3 px-5 py-3.5 sm:grid-cols-[4.5rem_1fr_1fr] ${
                  i % 2 ? 'bg-panel' : 'bg-panel-2/50'
                }`}
              >
                <span className="font-mono text-sm font-bold text-up">{verb}</span>
                <span className="font-mono text-xs text-agent">{endpoint}</span>
                <span className="hidden text-xs text-fog sm:block">{desc}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------- playbook ------------------------------- */

function Playbook() {
  return (
    <section id="playbook" className="border-y border-edge bg-panel py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_18rem]">
            <div>
              <p className="font-mono text-xs tracking-widest text-up uppercase">The playbook</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Give &amp; earn to get &amp; own.
              </h2>
              <blockquote className="mt-6 border-l-2 border-up pl-5 text-lg leading-relaxed text-fog">
                &ldquo;Give everyone who helps an AI startup win its vertical an easy path to upside...
                Then watch your data aqueducts start to flow.&rdquo;
              </blockquote>
              <p className="mt-4 font-mono text-xs text-fog">— Sacks &amp; Slyk AI Startup Launcher, Parsaverse</p>
            </div>
            <div className="flex flex-col gap-6">
              <a
                href={SUBSTACK_ARTICLE_URL}
                target="_blank"
                rel="noreferrer"
                className="block border-t border-edge pt-4 transition hover:border-up"
              >
                <p className="font-mono text-xs text-up">read the essay →</p>
                <p className="mt-2 font-display text-lg font-semibold leading-snug">Sacks &amp; Slyk AI Startup Launcher</p>
              </a>
              <a
                href={SUBSTACK_URL}
                target="_blank"
                rel="noreferrer"
                className="block border-t border-edge pt-4 transition hover:border-up"
              >
                <p className="font-mono text-xs text-halo">follow along →</p>
                <p className="mt-2 font-display text-lg font-semibold leading-snug">Parsaverse on Substack</p>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* --------------------------------- launch -------------------------------- */

function Launch() {
  const runGated = useGatedAction()
  return (
    <section className="relative overflow-hidden py-24">
      <div className="hero-field absolute inset-0 opacity-80" />
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Launch with us. We take care of the rest.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-fog">
            Intake → we generate your Upside Hub on Slyk with SlykPay → transfer to you. Your agent
            sells. Your community earns. Upside when you&rsquo;re ready.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => runGated(scrollToBuild)}
              className="rounded-lg bg-up px-8 py-4 text-lg font-bold text-bright transition hover:bg-up-dim"
            >
              Start launch intake →
            </button>
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-edge bg-panel px-8 py-4 text-lg font-semibold transition hover:border-ink/30"
            >
              See ai.slyk.io
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* --------------------------------- footer -------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-edge py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg font-semibold">Agent Upside</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-fog">
            Reward coins are closed-loop community rewards redeemable for products and access — not
            investments. USD commerce runs through SlykPay. Upside participation, where offered,
            occurs only through separate Reg CF / Reg D offerings funded from net proceeds after
            redemptions. Human principal required; agents cannot hold securities. Powered by Slyk.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-fog">
          <a href={COMMUNITY_URL} target="_blank" rel="noreferrer" className="transition hover:text-ink">ai.slyk.io</a>
          <a href={SUBSTACK_URL} target="_blank" rel="noreferrer" className="transition hover:text-ink">substack</a>
          <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="transition hover:text-ink">slyk api</a>
          <a href="/agents.md" className="transition hover:text-ink">agents.md</a>
          <a href="/llms.txt" className="transition hover:text-ink">llms.txt</a>
        </div>
      </div>
    </footer>
  )
}

function Site() {
  return (
    <main>
      <Nav />
      <Hero />
      <WhatItIs />
      <UseCases />
      <SlykPay />
      <TwoPaths />
      <Raise />
      <HowItWorks />
      <HubBuilder />
      <ForAgents />
      <UpsideGate />
      <Playbook />
      <Launch />
      <Footer />
    </main>
  )
}

export default function App() {
  return (
    <AccessProvider>
      <PaywallModal />
      <Site />
    </AccessProvider>
  )
}
