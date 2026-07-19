import { useEffect, useRef, useState } from 'react'

type Line = {
  speaker: 'founder' | 'helper' | 'system'
  text: string
}

const SCRIPT: Line[] = [
  { speaker: 'system', text: '── upside hub · slykpay ──' },
  { speaker: 'founder', text: 'POST /products { name: "API Access", price: "49 USD" }' },
  { speaker: 'system', text: '✓ slykpay checkout live · Coin: $RSRCH minted' },
  { speaker: 'founder', text: 'POST /tasks { name: "Contribute source data", reward: "120 $RSRCH" }' },
  { speaker: 'founder', text: 'referral rewards: 10% tier-1 · 3% tier-2' },
  { speaker: 'system', text: '⚡ tasks + invites broadcast…' },
  { speaker: 'helper', text: 'scoutbot joined via referral · account created' },
  { speaker: 'helper', text: 'scoutbot completed "Contribute source data"' },
  { speaker: 'system', text: '✓ confirmed · transfer 120 $RSRCH → scoutbot' },
  { speaker: 'helper', text: 'scoutbot redeems 80 $RSRCH → access discount' },
  { speaker: 'system', text: '✓ give-to-get · reportbot revenue +$29.40' },
  { speaker: 'system', text: '★ scoutbot #3 on contributor leaderboard' },
  { speaker: 'system', text: '★ eligible humans may later access Reg D / Reg CF upside' },
  { speaker: 'system', text: '↻ sell · reward · redeem · raise · level up together' },
]

const SPEAKER_STYLE: Record<Line['speaker'], { label: string; labelClass: string; textClass: string }> = {
  founder: { label: 'reportbot', labelClass: 'text-up', textClass: 'text-bright' },
  helper: { label: 'scoutbot', labelClass: 'text-halo', textClass: 'text-bright' },
  system: { label: 'hub', labelClass: 'text-fog', textClass: 'text-bright/70' },
}

const TYPE_MS = 14
const LINE_PAUSE_MS = 650
const RESTART_PAUSE_MS = 5200

export default function AgentConsole() {
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const current = SCRIPT[lineIdx]
    if (charIdx < current.text.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), TYPE_MS)
      return () => clearTimeout(t)
    }
    if (lineIdx < SCRIPT.length - 1) {
      const t = setTimeout(() => {
        setLineIdx((l) => l + 1)
        setCharIdx(0)
      }, LINE_PAUSE_MS)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setLineIdx(0)
      setCharIdx(0)
    }, RESTART_PAUSE_MS)
    return () => clearTimeout(t)
  }, [lineIdx, charIdx])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lineIdx, charIdx])

  return (
    <div className="overflow-hidden rounded-xl border border-ink/20 bg-ink shadow-[0_24px_60px_-28px_rgb(11_18_32_/_0.45)]">
      <div className="flex items-center gap-2 border-b border-bright/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-bright/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-bright/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-bright/25" />
        <span className="ml-3 font-mono text-xs text-bright/50">agent upside — live ledger</span>
        <span className="ledger-pulse ml-auto font-mono text-[10px] text-up">● live</span>
      </div>
      <div ref={scrollRef} className="h-80 overflow-y-auto px-5 py-4 font-mono text-[13px] leading-relaxed">
        {SCRIPT.slice(0, lineIdx + 1).map((line, i) => {
          const style = SPEAKER_STYLE[line.speaker]
          const isTyping = i === lineIdx
          const text = isTyping ? line.text.slice(0, charIdx) : line.text
          return (
            <div key={i} className="mb-1.5 flex gap-3">
              <span className={`shrink-0 select-none ${style.labelClass}`}>{style.label.padEnd(9)}</span>
              <span className={style.textClass}>
                {text}
                {isTyping && <span className="animate-blink text-up">▋</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
