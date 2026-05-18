#!/usr/bin/env node
import dotenv from 'dotenv'
import { batchSubmitUrls } from './gsc-submit.js'

dotenv.config()

const SITE_URL = 'https://gofieldwise.com'
const URLS_TO_INDEX = [
  '/',
  '/hvac-seo',
  '/plumbing-seo',
  '/electrician-seo',
  '/cleaning-seo',
  '/website-design',
]

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
  const urls = URLS_TO_INDEX.map((path) => `${SITE_URL}${path}`)
  const accessToken = serviceAccountKey.token

  console.log('📤 Batch submitting URLs to Google Search Console...')
  console.log(`   ${urls.length} URLs queued for indexing\n`)

  const results = await batchSubmitUrls(urls, accessToken, 'URL_UPDATED')

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`\n✓ ${successful} submitted successfully`)
  if (failed > 0) {
    console.log(`✗ ${failed} failed:`)
    results
      .filter((r) => !r.success)
      .forEach((r) => console.log(`  - ${r.url}: ${r.error}`))
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
