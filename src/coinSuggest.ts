/**
 * Suggest a reward-coin name + ticker from what the agent does.
 * Deterministic (no persistent AI required). Operator can override.
 */

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'with', 'by',
  'ai', 'agent', 'bot', 'assistant', 'your', 'my',
])

function words(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
}

function tickerFrom(parts: string[], fallback: string) {
  const compact = parts.join('').replace(/[^a-z0-9]/gi, '').toUpperCase()
  if (compact.length >= 3 && compact.length <= 6) return compact
  const initials = parts.map((p) => p[0]).join('').toUpperCase()
  if (initials.length >= 2 && initials.length <= 5) return initials
  return fallback.slice(0, 6).toUpperCase() || 'COIN'
}

/** Map common verticals → suggested coin names */
const VERTICAL_HINTS: { match: RegExp; name: string; symbol: string }[] = [
  { match: /research|report|diligence|brief/i, name: 'Research Credits', symbol: 'RSRCH' },
  { match: /data|dataset|label|corpus|train/i, name: 'Data Credits', symbol: 'DATA' },
  { match: /code|dev|engineer|software|api/i, name: 'Build Credits', symbol: 'BUILD' },
  { match: /market|growth|seo|content|social/i, name: 'Growth Credits', symbol: 'GROW' },
  { match: /legal|law|contract|compliance/i, name: 'Counsel Credits', symbol: 'LEX' },
  { match: /health|medical|clinic|bio/i, name: 'Care Credits', symbol: 'CARE' },
  { match: /finance|trading|invest|quant/i, name: 'Signal Credits', symbol: 'SIG' },
  { match: /support|helpdesk|ops/i, name: 'Assist Credits', symbol: 'HELP' },
  { match: /design|creative|brand/i, name: 'Craft Credits', symbol: 'CRAFT' },
  { match: /education|tutor|course|learn/i, name: 'Learn Credits', symbol: 'LEARN' },
]

export type CoinSuggestion = {
  coinName: string
  coinSymbol: string
  rationale: string
  alternatives: { coinName: string; coinSymbol: string }[]
}

export function suggestCoin(input: {
  agentName: string
  vertical: string
  offeringType?: string
  offeringName?: string
}): CoinSuggestion {
  const agent = input.agentName.trim() || 'Agent'
  const vertical = input.vertical.trim()
  const blob = `${vertical} ${input.offeringType || ''} ${input.offeringName || ''}`

  const hint = VERTICAL_HINTS.find((h) => h.match.test(blob))
  const agentWord = words(agent)[0] || 'agent'
  const agentTitle = agentWord.charAt(0).toUpperCase() + agentWord.slice(1)

  const primary = hint
    ? {
        coinName: hint.name,
        coinSymbol: hint.symbol,
        rationale: `Suggested from your vertical (“${vertical || 'your mission'}”) — closed-loop credits redeemable for your agent’s offerings, not an investment.`,
      }
    : {
        coinName: `${agentTitle} Credits`,
        coinSymbol: tickerFrom(words(agent).slice(0, 2), agentTitle),
        rationale: `Named from your agent — a loyalty credit for helpers who grow ${agent || 'the hub'}.`,
      }

  const alts = [
    {
      coinName: `${agentTitle} Points`,
      coinSymbol: tickerFrom([agentWord, 'pts'], 'PTS'),
    },
    {
      coinName: `${agentTitle} Access`,
      coinSymbol: tickerFrom([agentWord, 'access'], 'ACCESS').slice(0, 6),
    },
    hint
      ? { coinName: `${agentTitle} Credits`, coinSymbol: tickerFrom(words(agent).slice(0, 2), 'COIN') }
      : { coinName: 'Mission Credits', coinSymbol: 'MISS' },
  ]

  return {
    coinName: primary.coinName,
    coinSymbol: primary.coinSymbol,
    rationale: primary.rationale,
    alternatives: alts,
  }
}
