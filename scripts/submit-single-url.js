#!/usr/bin/env node
import dotenv from 'dotenv'
import { submitUrlToGSC } from './gsc-submit.js'

dotenv.config()

const url = process.argv[2]

if (!url) {
  console.error('Usage: node submit-single-url.js <url>')
  console.error('Example: node submit-single-url.js https://gofieldwise.com/hvac-seo')
  process.exit(1)
}

const serviceAccountKeyBase64 = process.env.GSC_SERVICE_ACCOUNT_KEY
if (!serviceAccountKeyBase64) {
  console.error(
    'Error: GSC_SERVICE_ACCOUNT_KEY env var not set. See docs/GSC_SETUP.md'
  )
  process.exit(1)
}

let serviceAccountKey
try {
  const keyJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8')
  serviceAccountKey = JSON.parse(keyJson)
} catch (err) {
  console.error('Error: Failed to parse GSC_SERVICE_ACCOUNT_KEY:', err.message)
  process.exit(1)
}

async function main() {
  const accessToken = serviceAccountKey.token
  console.log(`📤 Submitting ${url} to GSC...`)
  const result = await submitUrlToGSC(url, accessToken, 'URL_UPDATED')
  if (result.success) {
    console.log(`✓ Successfully submitted: ${result.url}`)
  } else {
    console.error(`✗ Failed: ${result.error}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
