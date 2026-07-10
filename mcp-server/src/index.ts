#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const SLYK_API_KEY = process.env.SLYK_API_KEY
const SLYK_BASE = 'https://api.slyk.io'
const UPSIDE_SITE = process.env.UPSIDE_SITE_URL ?? 'https://ai-agent-upside-hubs.vercel.app'
const ACCESS_TOKEN = process.env.UPSIDE_ACCESS_TOKEN

async function slyk<T>(path: string, init?: RequestInit): Promise<T> {
  if (!SLYK_API_KEY) throw new Error('SLYK_API_KEY is not set')
  const res = await fetch(`${SLYK_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SLYK_API_KEY}`,
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data as T
}

const server = new McpServer({ name: 'upsidehubs', version: '1.0.0' })

server.tool(
  'hub_onboarding',
  'Read machine-readable Upside Hub onboarding (agents.md summary)',
  {},
  async () => ({
    content: [{
      type: 'text',
      text: `Upside Hub operator guide:
1. Human launches hub via wizard: https://app.slyk.io/wizard/sign-up/get-started
2. Set SLYK_API_KEY for this MCP server
3. Use slyk_* tools for Economy 1 (products, coins, tasks, payouts)
4. NEVER market reward coins as investments
5. For Economy 2 (Reg D/CF upside), use request_upside_compliance_review — requires human principal

Manifest: ${UPSIDE_SITE}/hub.json
Full guide: ${UPSIDE_SITE}/agents.md`,
    }],
  }),
)

server.tool(
  'slyk_list_products',
  'List products in your Upside Hub store',
  { pageSize: z.number().optional() },
  async ({ pageSize }) => {
    const q = pageSize ? `?page[size]=${pageSize}` : ''
    const data = await slyk(`/products${q}`)
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

server.tool(
  'slyk_create_product',
  'Create a product in your hub store',
  {
    name: z.string(),
    description: z.string(),
    price: z.string().describe('Price as decimal string, e.g. 49.00'),
  },
  async (args) => {
    const data = await slyk('/products', { method: 'POST', body: JSON.stringify(args) })
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

server.tool(
  'slyk_create_task',
  'Post a help-wanted task priced in your hub coin',
  {
    name: z.string(),
    description: z.string(),
    amount: z.string().describe('Reward amount in hub coin'),
    type: z.string().default('system'),
  },
  async (args) => {
    const data = await slyk('/tasks', { method: 'POST', body: JSON.stringify(args) })
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

server.tool(
  'slyk_complete_task',
  'Pay a contributor for completing a task',
  { taskId: z.string(), userId: z.string() },
  async ({ taskId, userId }) => {
    const data = await slyk(`/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

server.tool(
  'slyk_transfer_coin',
  'Transfer hub coin to a contributor wallet',
  {
    amount: z.string(),
    assetCode: z.string(),
    originWalletId: z.string(),
    destinationWalletId: z.string(),
    description: z.string().optional(),
  },
  async (args) => {
    const data = await slyk('/transactions/transfer', { method: 'POST', body: JSON.stringify(args) })
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

server.tool(
  'request_upside_compliance_review',
  'Submit a Reg D / Reg CF upside offering request (Economy 2 — premium compliance gate). Requires human principal.',
  {
    hubName: z.string(),
    hubSubdomain: z.string(),
    humanPrincipal: z.string(),
    email: z.string().email(),
    offeringType: z.enum(['reg_cf', 'reg_d_506b', 'reg_d_506c']),
    entityType: z.enum(['individual', 'llc', 'corp', 'other']).default('individual'),
    accreditedInvestor: z.boolean().optional(),
    agentOperator: z.string().optional(),
    contributionSummary: z.string().optional(),
  },
  async (args) => {
    if (!ACCESS_TOKEN) throw new Error('UPSIDE_ACCESS_TOKEN is not set')
    const res = await fetch(`${UPSIDE_SITE}/api/upside-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        ...args,
        riskAcknowledged: true,
        disclosuresAcknowledged: true,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data))
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
