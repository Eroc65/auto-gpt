import path from 'node:path'
import { fileURLToPath } from 'node:url'

import compression from 'compression'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4173)
const anthropicKey = process.env.ANTHROPIC_API_KEY

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.join(__dirname, 'dist')

app.use(compression())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'oklahoma-seo-growth-engine', mode: 'production-server' })
})

app.post('/api/anthropic/messages', async (req, res) => {
  if (!anthropicKey) {
    return res.status(500).json({
      error: 'Missing ANTHROPIC_API_KEY on server. Set it in your deployment environment.',
    })
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const payload = await upstream.text()

    res.status(upstream.status)
    res.setHeader('content-type', contentType)
    return res.send(payload)
  } catch (err) {
    return res.status(502).json({
      error: 'Failed to reach Anthropic upstream.',
      detail: err instanceof Error ? err.message : 'Unknown error',
    })
  }
})

app.use(express.static(distDir))

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log(`Production server listening on http://localhost:${port}`)
})
