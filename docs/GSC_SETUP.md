# Google Search Console Indexing Setup

This guide helps you submit URLs to Google Search Console (GSC) for faster indexing.

## Prerequisites

1. **Google Cloud Project** with the Indexing API enabled
2. **Service Account** with credentials JSON
3. **Property verified** in Google Search Console

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name it `gofieldwise-gsc` or similar)
3. Enable the **Indexing API**:
   - Search for "Indexing API" 
   - Click Enable

### 2. Create a Service Account

1. In Cloud Console, go to **Service Accounts** (left menu)
2. Click **Create Service Account**
3. Name: `gsc-indexing`
4. Click Create and Continue
5. Grant role: **Editor** (for indexing permissions)
6. Click Continue → Done

### 3. Create and Download JSON Key

1. Click the service account you just created
2. Go to **Keys** tab
3. Click **Add Key → Create new key**
4. Choose **JSON**
5. Save the file as `gsc-service-account.json`

### 4. Add Service Account to GSC

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (gofieldwise.com)
3. Go to **Settings → Users and permissions**
4. Click **Add user**
5. Enter the service account email (from your JSON file: `client_email` field)
6. Role: **Full**

### 5. Submit URLs to Indexing

Use the scripts:

```bash
# Single URL
node scripts/submit-single-url.js https://gofieldwise.com/hvac-seo

# Batch submit from sitemap
node scripts/submit-batch-urls.js
```

## Files

- **gsc-submit.js** — Core API functions for URL submission
- **submit-single-url.js** — CLI to submit one URL
- **submit-batch-urls.js** — CLI to batch submit all SEO pages
- **.env** — Store `GSC_SERVICE_ACCOUNT_KEY` (base64-encoded JSON)

## Troubleshooting

- **"Not verified"**: Make sure the service account email is added to GSC property
- **"Rate limit"**: Batching has 500ms delay between requests; reduce if needed
- **"Invalid credentials"**: Verify JSON key file exists and env var is correct

## Auto-Submit on Deploy

Add this to your CI/CD pipeline to auto-submit new pages after each deploy:

```yaml
# .github/workflows/submit-urls.yml
- name: Submit URLs to GSC
  run: node scripts/submit-batch-urls.js
  env:
    GSC_SERVICE_ACCOUNT_KEY: ${{ secrets.GSC_SERVICE_ACCOUNT_KEY }}
```

## References

- [Google Indexing API Docs](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [GSC Property Setup](https://support.google.com/webmasters/answer/9128668)
