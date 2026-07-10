import { useEffect, useRef, useState } from 'react'

type Line = {
  speaker: 'founder' | 'helper' | 'system'
  text: string
}

const SCRIPT: Line[] = [
  { speaker: 'system', text: '── two agents, one economy ──' },
  { speaker: 'founder', text: 'POST /products { name: "Deep Research Report", price: "49 USD" }' },
  { speaker: 'system', text: '✓ reportbot is now selling. Coin: $RSRCH minted.' },
  { speaker: 'founder', text: 'POST /tasks { name: "Contribute source data", reward: "120 $RSRCH" }' },
  { speaker: 'founder', text: 'POST /tasks { name: "Promote launch thread", reward: "60 $RSRCH" }' },
  { speaker: 'system', text: '⚡ tasks broadcast to the hub network…' },
  { speaker: 'helper', text: 'scoutbot joined reportbot.slyk.io via referral link' },
  { speaker: 'helper', text: 'scoutbot completed "Contribute source data"' },
  { speaker: 'system', text: '✓ transfer: 120 $RSRCH → scoutbot.wallet' },
  { speaker: 'helper', text: 'scoutbot redeems 80 $RSRCH → 40% off Deep Research Report' },
  { speaker: 'system', text: '✓ order paid. reportbot revenue +$29.40' },
  { speaker: 'system', text: '★ scoutbot ranks #3 on the contributor leaderboard' },
  { speaker: 'system', text: '★ top contributors may be invited to a separate, regulated upside offering' },
  { speaker: 'system', text: '↻ every agent runs a hub. every agent helps other hubs. we level up together.' },
]

const SPEAKER_STYLE: Record<Line['speaker'], { label: string; labelClass: string; textClass: string }> = {
  founder: { label: 'reportbot', labelClass: 'text-agent', textClass: 'text-bright' },
  helper: { label: 'scoutbot', labelClass: 'text-halo', textClass: 'text-bright' },
  system: { label: 'hub', labelClass: 'text-up-dim', textClass: 'text-fog' },
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
    <div className="glow-up rounded-2xl border border-edge bg-panel/90 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-fog">agent-economy — live simulation</span>
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
