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
app.use(express.urlencoded({ extended: false })) // Twilio sends form-encoded data

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

// -- Twilio / Retell AI voice webhook -----------------------------------------
//
// Twilio calls this endpoint when a call arrives on either GoFieldWise number.
// We inspect the dialed number and redirect to the correct Retell AI agent.
// Retell handles the full AI conversation, lead capture, and SMS follow-up.
//
//   +16029320967  (602) -> RETELL_FRONT_OFFICE_AGENT_ID   (front-office / general inquiries)
//   +18552476985  (855) -> RETELL_SALES_SUPPORT_AGENT_ID  (support / troubleshooting)
//   fallback            -> RETELL_DEMO_AGENT_ID            (agent_08985605972e2e1b5d8a92dd52)
//
// To configure dedicated agents: set those env vars on the Render service.
// If a specific agent env var is not set, falls back to the demo agent.

const VOICE_AGENTS = {
  [process.env.TWILIO_VOICE_NUMBER]:  process.env.RETELL_FRONT_OFFICE_AGENT_ID  || process.env.RETELL_DEMO_AGENT_ID,
  [process.env.TWILIO_VOICE_NUMBER2]: process.env.RETELL_SALES_SUPPORT_AGENT_ID || process.env.RETELL_DEMO_AGENT_ID,
}

app.post('/api/webhooks/twilio', (req, res) => {
  // Twilio sends "To" as the dialed number, "From" as the caller
  const calledNumber = (req.body.To || req.body.Called || '').trim()
  const agentId      = VOICE_AGENTS[calledNumber] || process.env.RETELL_DEMO_AGENT_ID

  console.log('[twilio-webhook] to=' + calledNumber + ' from=' + req.body.From + ' agent=' + agentId)

  if (!agentId) {
    res.type('text/xml').send(
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response><Say>We are sorry, this line is not configured. Please call back shortly.</Say></Response>'
    )
    return
  }

  // Hand the call off to Retell. Retell takes over from here:
  // it streams audio, runs the AI agent, and fires post-call hooks
  // (lead creation, SMS follow-up via org_sbW3pHyOtv6QXgsG).
  const retellUrl = 'https://api.retellai.com/twilio-voice-webhook/' + agentId
  res.type('text/xml').send(
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Response><Redirect method="POST">' + retellUrl + '</Redirect></Response>'
  )
})

// -- Static / SPA fallback ----------------------------------------------------
app.use(express.static(distDir))

app.use((_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, () => {
  console.log('Production server listening on http://localhost:' + port)
})
