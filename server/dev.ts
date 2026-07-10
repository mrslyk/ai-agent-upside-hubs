import express, { type Request, type Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import checkout from '../api/checkout.ts'
import verifyAccess from '../api/verify-access.ts'
import verifySession from '../api/verify-session.ts'
import upsideRequest from '../api/upside-request.ts'

function wrap(handler: (req: VercelRequest, res: VercelResponse) => Promise<unknown>) {
  return async (req: Request, res: Response) => {
    const vRes = {
      status(code: number) {
        res.status(code)
        return vRes
      },
      json(body: unknown) {
        res.json(body)
      },
      end(body?: string) {
        res.end(body)
      },
      setHeader(name: string, value: string) {
        res.setHeader(name, value)
        return vRes
      },
    } as VercelResponse

    const vReq = {
      method: req.method,
      body: req.body,
      headers: req.headers as VercelRequest['headers'],
      query: req.query as VercelRequest['query'],
    } as VercelRequest

    try {
      await handler(vReq, vRes)
    } catch (err) {
      console.error(err)
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' })
    }
  }
}

const app = express()
app.use(express.json())

app.options('/api/*', (_req, res) => res.sendStatus(204))
app.post('/api/checkout', wrap(checkout))
app.post('/api/verify-session', wrap(verifySession))
app.get('/api/verify-access', wrap(verifyAccess))
app.post('/api/verify-access', wrap(verifyAccess))
app.post('/api/upside-request', wrap(upsideRequest))

const port = Number(process.env.API_PORT ?? 3000)
app.listen(port, () => {
  console.log(`API dev server → http://localhost:${port}`)
})
