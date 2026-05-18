import fetch from 'node-fetch'

/**
 * Google Search Console URL Submission Utility
 * Submits URLs to GSC for immediate indexing using the Indexing API
 */

const GSC_INDEXING_API = 'https://www.googleapis.com/indexing/v3/urlNotifications:publish'

export async function submitUrlToGSC(url, accessToken, type = 'URL_UPDATED') {
  try {
    const response = await fetch(GSC_INDEXING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`GSC API error: ${error.error.message}`)
    }

    return { success: true, url, type }
  } catch (err) {
    console.error(`Failed to submit ${url}:`, err.message)
    return { success: false, url, error: err.message }
  }
}

export async function batchSubmitUrls(urls, accessToken, type = 'URL_UPDATED') {
  const results = []

  for (const url of urls) {
    const result = await submitUrlToGSC(url, accessToken, type)
    results.push(result)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const successful = results.filter((r) => r.success).length
  console.log(
    `✓ Submitted ${successful}/${urls.length} URLs to Google Search Console`
  )

  return results
}

export async function getAccessToken(serviceAccountKey) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: serviceAccountKey.token,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    const data = await response.json()
    return data.access_token
  } catch (err) {
    console.error('Auth error:', err.message)
    throw err
  }
}
