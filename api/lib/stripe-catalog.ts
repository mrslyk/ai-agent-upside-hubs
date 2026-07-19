/**
 * Canonical Stripe catalog for Upside Hubs (USD only).
 * $AI reward coin stays on the Slyk ledger — never sold as a Stripe product.
 * Pattern from mrslyk/fam api/lib/stripe-catalog.js
 */

export const STRIPE_CATALOG = [
  {
    envPrice: 'STRIPE_PRICE_HUB_ACCESS',
    purpose: 'hub_access' as const,
    name: 'AI Agent Upside Hub Access',
    description:
      'Unlock Agent Upside launch intake — we generate your Slyk hub with SlykPay (USD), reward coin, tasks, and referrals. Economy 1 only; securities offerings require separate compliance review.',
    amountCents: Number(process.env.HUB_ACCESS_PRICE_CENTS || 9900), // default $99
    currency: 'usd',
    statementDescriptor: 'UPSIDE HUB',
  },
]

export function catalogByPurpose(purpose: string) {
  return STRIPE_CATALOG.filter((p) => p.purpose === purpose)
}
