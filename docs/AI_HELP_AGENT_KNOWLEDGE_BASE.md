# GoFieldWise AI Help Agent Knowledge Base

## Purpose
This knowledge base is a structured source of truth for customer-facing configuration help.
It is focused on:
- connection modes (Sidecar, Hybrid, Standalone)
- connector differences (Jobber, Housecall Pro, QuickBooks, Google Calendar)
- feature value messaging
- onboarding sequence
- common troubleshooting and policy boundaries

## Files
- `frontend/lib/gofieldwise-config-kb.js`
  - contains KB entries
  - includes retrieval helpers for query-based matching
- `frontend/lib/gofieldwise-service-registry.js`
  - canonical service inventory for SEO offers, lead-gen tools, core services, and rank-and-rent assets
- `frontend/pages/api/help/service-registry.js`
  - GET endpoint for the management-facing service inventory
- `frontend/pages/api/help/kb-search.js`
  - POST endpoint for AI help agent lookup

## API Usage
Endpoint:
- `POST /api/help/kb-search`

Request body:
```json
{
  "query": "how does sidecar mode work with jobber",
  "limit": 5,
  "category": null,
  "tag": null
}
```

Response shape:
```json
{
  "ok": true,
  "version": "2026-05-22",
  "query": "how does sidecar mode work with jobber",
  "confident": true,
  "topConfidence": 0.61,
  "confidenceThreshold": 0.34,
  "clarifyingQuestion": null,
  "count": 2,
  "items": [
    {
      "id": "mode-sidecar",
      "category": "mode",
      "title": "Sidecar Mode",
      "tags": ["sidecar", "crm"],
      "body": "...",
      "value": "...",
      "bestFor": "..."
    }
  ],
  "context": "1. Sidecar Mode [mode] ..."
}
```

## Agent Prompt Pattern
Recommended runtime prompt sequence:
1. Receive customer question.
2. Query `/api/help/kb-search` with customer text.
3. Use `context` and `items` to generate answer:
   - How it works
   - What sets it apart
   - Value added
4. If `confident` is false, ask `clarifyingQuestion` and do not guess.
5. If no strong match, ask one clarifying question about:
   - mode
   - connector
   - feature

## Telemetry
- Low-confidence searches are logged from `frontend/pages/api/help/kb-search.js`.
- Logs are structured JSON events with:
  - `event`: `gofieldwise_kb_low_confidence`
  - `queryFingerprint`: SHA-256 fingerprint prefix (no raw query text)
  - `topConfidence`, `confidenceThreshold`, `category`, `tag`
  - `clarifyingQuestion`
- Purpose: identify recurring low-confidence topics and expand KB entries safely.

## Telemetry Summary Endpoint
Endpoint:
- `GET /api/help/kb-telemetry-summary`

Auth:
- Requires request header: `x-kb-telemetry-admin-token`
- Header value must match server env var `KB_TELEMETRY_ADMIN_TOKEN`

Query params:
- `lookbackHours` (optional, default `24`, max `168`)
- `limit` (optional, default `10`, max `50`)

Example:
```http
GET /api/help/kb-telemetry-summary?lookbackHours=24&limit=10
```

Response shape:
```json
{
  "ok": true,
  "lookbackHours": 24,
  "totalEventsInWindow": 8,
  "topFingerprints": [
    {
      "queryFingerprint": "a1b2c3d4e5f67890",
      "count": 3,
      "lastSeenAt": "2026-05-22T20:40:00.000Z",
      "avgTopConfidence": 0.19,
      "lastCategory": "service",
      "lastTag": "none",
      "lastClarifyingQuestion": "Which connector are you configuring right now: Jobber, Housecall Pro, QuickBooks, or Google Calendar?"
    }
  ],
  "topCategories": [{ "category": "service", "count": 5 }],
  "topTags": [{ "tag": "none", "count": 6 }],
  "topClarifyingQuestions": [
    {
      "clarifyingQuestion": "Which connector are you configuring right now: Jobber, Housecall Pro, QuickBooks, or Google Calendar?",
      "count": 4
    }
  ]
}
```

Notes:
- This summary is in-memory per running app instance.
- Data resets when the Next.js server restarts.

## Maintenance
- Add or update entries in `frontend/lib/gofieldwise-config-kb.js`.
- Add or update service inventory in `frontend/lib/gofieldwise-service-registry.js`.
- Keep tags simple and keyword-oriented.
- Keep each entry customer-readable and support-ready.
- Update `GOFIELDWISE_CONFIG_KB_VERSION` on meaningful content changes.