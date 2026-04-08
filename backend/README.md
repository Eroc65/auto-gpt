# FrontDesk Pro Backend

This is the FastAPI backend for FrontDesk Pro.

- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic (migrations)
- PostgreSQL


## Structure
- `app/` — Main application code
- `alembic/` — DB migrations
- `tests/` — Backend tests
- `agent_runtime/` — Autonomous orchestration loop primitives (state, policies, dispatch contract, orchestrator)

## Auth & Organization Vertical Slice

- **User model/schema:** `app/schemas/user.py`, `app/models/user.py`
- **Organization model/schema:** `app/schemas/organization.py`, `app/models/organization.py`
- **Membership:** `organization_id` field on user
- **Storage:** signup, login, and current-organization resolution are DB-backed through SQLAlchemy
- **Signup/Login endpoints:** `/api/auth/signup`, `/api/auth/login`
- **Protected route pattern:** `/api/protected` (requires Bearer token)
- **Current-organization context:** `/api/auth/org` (returns org for current user)
- **Authenticated test endpoint:** `/api/protected`

### Example Usage

**Signup:**
POST `/api/auth/signup` { email, password, organization_name }

**Login:**
POST `/api/auth/login` (OAuth2 form: username=email, password)

**Get current user:**
GET `/api/auth/me` (Bearer token)
- includes `role` (`owner`, `admin`, `dispatcher`, `technician`)

**Organization users (role admins only):**
- GET `/api/auth/users` (Bearer token; owner/admin only)
- PATCH `/api/auth/users/{user_id}/role` with `{ role }` (owner/admin only)
	- safety guard: cannot demote the last `owner` in an organization
- GET `/api/auth/users/role-audit` (Bearer token; owner/admin only)
	- supports filters: `limit`, `actor_user_id`, `target_user_id`, `days`
- GET `/api/auth/users/role-audit/export.csv` (Bearer token; owner/admin only)
	- CSV export with the same filters for compliance/audit handoff

**Get current org:**
GET `/api/auth/org` (Bearer token)

**Protected test route:**
GET `/api/protected` (Bearer token)

**Lead booking workflow:**
POST `/api/leads/{lead_id}/book` (Bearer token) with `{ scheduled_time, technician_id }`
- role-gated to `owner`, `admin`, `dispatcher`

**Lead qualification workflow:**
POST `/api/leads/{lead_id}/qualify` (Bearer token)
- role-gated to `owner`, `admin`, `dispatcher`

**Lead activity audit trail:**
- GET `/api/leads/{lead_id}/activity` (Bearer token)
	- optional query filters: `action`, `since_hours` (1-720)

**Public intake routing options:**
- POST `/api/leads/intake/{org_id}`
- POST `/api/leads/intake/by-key/{intake_key}`
- POST `/api/leads/intake/missed-call/{org_id}`
- POST `/api/leads/intake/missed-call/by-key/{intake_key}`
- GET `/api/auth/org` returns `intake_key` for authenticated org admins

**Operator metrics reporting:**
- GET `/api/reports/lead-conversion?days=7` (auth required, days 1-30)
	- includes `recommended_next_action` for operator prioritization

**Schedule readiness workflow:**
- GET `/api/jobs/scheduling/conflict` with query: `technician_id`, `scheduled_time`, optional `exclude_job_id`, `buffer_minutes`
- GET `/api/jobs/scheduling/next-slot` with query: `technician_id`, `requested_time`, optional `search_hours`, `step_minutes`, `exclude_job_id`, `buffer_minutes`
- PATCH `/api/jobs/{job_id}/dispatch` with `{ technician_id, scheduled_time }` and optional query `buffer_minutes`
- technician availability defaults: 8:00 AM to 7:00 PM Central, Monday to Friday

**Job lifecycle quick-actions (Sprint A):**
- PATCH `/api/jobs/{job_id}/on-my-way`
- PATCH `/api/jobs/{job_id}/start`
- PATCH `/api/jobs/{job_id}/complete` with optional `{ completion_notes }`
- GET `/api/jobs/{job_id}/timeline`

## Setup
1. Install Python 3.11+
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload --port 8001`
	- API docs: http://localhost:8001/docs

## OpenAI SDK Setup (Python)
- This backend now includes the official OpenAI Python SDK.
- Configure your API key as an environment variable.

PowerShell (current shell only):
- `$env:OPENAI_API_KEY="your_api_key_here"`

PowerShell (persistent on Windows):
- `setx OPENAI_API_KEY "your_api_key_here"`

Optional model override:
- `$env:OPENAI_MODEL="gpt-4.1-mini"`

SDK smoke validation:
- `python scripts/smoke_openai_sdk.py`
- Expected output includes: `OPENAI_SDK_SMOKE_OK`

## Validation
- `pytest -q`
- `pytest -q tests/test_dispatch_flow_integration.py tests/test_dispatch.py -k "lifecycle_quick_actions_require_valid_order or conflict_next_slot_then_dispatch"`
- `python scripts/smoke_auth.py`
- `python scripts/smoke_openai_sdk.py`
- `python scripts/smoke_schedule_readiness.py`
- `python scripts/smoke_collections_readiness.py`

## AI Marketing Expert Operator
- Endpoint: `POST /api/marketing/expert/operator`
- Purpose: generate structured autonomous growth strategy output (offers, channel plan, content plan, KPI targets, and 4-week execution checklist).
- Auth: owner/admin/dispatcher roles via existing marketing access policy.
- Requires `OPENAI_API_KEY` for live model orchestration.

## Integration Webhooks (Twilio, Retell, Zapier)

Communication profile management:
- GET `/api/org/comm-profile`
- PATCH `/api/org/comm-profile`

Twilio:
- POST `/api/integrations/twilio/inbound/{org_id}` (inbound SMS keywords)
- POST `/api/integrations/twilio/status` (message delivery callbacks)
- POST `/api/integrations/twilio/voice/{org_id}` (voice call events and missed-call recovery)

Retell:
- POST `/api/integrations/retell/call-ended/{org_id}` (call outcomes, missed-call recovery)

Zapier:
- POST `/api/integrations/zapier/leads/by-key/{intake_key}` (create lead via intake key)
- POST `/api/integrations/zapier/push/lead/{lead_id}` (push org-scoped lead to Zapier webhook; auth required)

Webhook signature verification (optional but recommended in production):
- `TWILIO_WEBHOOK_SIGNING_SECRET`
- `RETELL_WEBHOOK_SIGNING_SECRET`
- `ZAPIER_WEBHOOK_SIGNING_SECRET`

Twilio provider signature mode (optional strict mode):
- `TWILIO_PROVIDER_SIGNATURE_MODE=true`
- `TWILIO_AUTH_TOKEN` (required when provider signature mode is enabled)
- Optional URL normalization for reverse proxy setups: `TWILIO_WEBHOOK_PUBLIC_BASE_URL`

Retell provider strict mode (optional):
- `RETELL_PROVIDER_SIGNATURE_MODE=true`
- `RETELL_WEBHOOK_PROVIDER_TOKEN` (accepted via `x-retell-token`, `x-retell-signature`, or `Authorization: Bearer`)
- `RETELL_API_KEY` (for Retell API operations; can also be scoped as `RETELL_API_KEY_ORG_<organization_id>`)

Zapier provider strict mode (optional):
- `ZAPIER_PROVIDER_SIGNATURE_MODE=true`
- `ZAPIER_WEBHOOK_PROVIDER_TOKEN` (accepted via `x-zapier-token`, `x-zapier-signature`, or `Authorization: Bearer`)
- `ZAPIER_API_KEY` (for Zapier API operations; can also be scoped as `ZAPIER_API_KEY_ORG_<organization_id>`)

Signature behavior:
- If a signing secret is set, the corresponding inbound webhook requires a valid HMAC-SHA256 signature.
- Signature is computed over the raw request body and accepted via provider-specific header or `x-frontdesk-signature`.
- If `TWILIO_PROVIDER_SIGNATURE_MODE` is enabled, Twilio inbound endpoints also require a valid Twilio-style auth-token signature in `x-twilio-signature`.
- If Retell or Zapier strict provider mode is enabled, those endpoints also require a valid provider token header (or bearer token) before HMAC checks.

Organization-scoped secret/token override pattern:
- For any global variable `X`, you can define `X_ORG_<organization_id>`.
- If present, the org-scoped value is used instead of the global value.
- Examples: `TWILIO_AUTH_TOKEN_ORG_12`, `RETELL_WEBHOOK_PROVIDER_TOKEN_ORG_12`, `ZAPIER_WEBHOOK_SIGNING_SECRET_ORG_12`.

Outbound Zapier webhook configuration:
- `ZAPIER_LEAD_WEBHOOK_URL` (default destination for lead push endpoint)
- `ZAPIER_OUTBOUND_SHARED_SECRET` (optional header `X-FrontDesk-Secret`)

Webhook env audit helper:
- `python scripts/webhook_env_audit.py`
	- lists expected org-scoped variable names and whether values resolve from scoped/global env.
- `python scripts/webhook_env_audit.py --check`
	- fails if strict provider modes are enabled and required values are missing.
- `python scripts/webhook_env_audit.py --check --require-signing-secrets`
	- also requires HMAC signing secrets to be present for each organization (scoped or global fallback).
- `python scripts/webhook_env_audit.py --check --require-retell-api-key`
	- requires `RETELL_API_KEY` (or `RETELL_API_KEY_ORG_<id>`) to be present.
- `python scripts/webhook_env_audit.py --check --require-zapier-api-key`
	- requires `ZAPIER_API_KEY` (or `ZAPIER_API_KEY_ORG_<id>`) to be present.

One-command webhook security readiness wrapper:
- `powershell -ExecutionPolicy Bypass -File ..\scripts\webhook_security_readiness.ps1`
- Optional strict check for signing secrets: `-RequireSigningSecrets`
- Optional Retell key check: `-RequireRetellApiKey`
- Optional Zapier key check: `-RequireZapierApiKey`
- Optional org-only scope: `-OrgId <organization_id>`

## Google Ads Specialist Helper

Date-window utility for audit/reporting workflows:
- `python scripts/google_ads_specialist_helper.py --timeframe "last week"`
- Supports: `yesterday`, `last week`, `last month`, `last 28 days`, `last quarter`, `last year`
- Returns current and previous-period windows for comparative analysis.

## Agent Runtime Invocation
- Runtime entrypoints:
	- `python -m agent_runtime`
	- `python -m agent_runtime.run_once`
- Model backend is OpenAI-compatible chat completions and uses these env vars:
	- `AGENT_MODEL_BASE_URL` (example: `http://localhost:1234/v1` or `https://api.openai.com/v1`)
	- `AGENT_MODEL_API_KEY`
	- `AGENT_MODEL_NAME` (example: `gpt-4.1-mini`)
	- `AGENT_MODEL_TIMEOUT_SECONDS` (optional, default `120`)
	- `AGENT_MODEL_TEMPERATURE` (optional, default `0.1`)
	- `AGENT_MODEL_MAX_TOKENS` (optional, default `4000`)
	- `AGENT_MODEL_AUTORECOVER` (optional, default `1`)
	- `AGENT_MODEL_HEALTH_PATH` (optional, default `/models`)
	- `AGENT_MODEL_PRECHECK_TIMEOUT_SECONDS` (optional, default `4`)
	- `AGENT_MODEL_RECOVERY_SCRIPT_TIMEOUT_SECONDS` (optional, default `60`)
	- `AGENT_MODEL_START_CMD` (optional bootstrap command for backend start)
- Tool executor policy env var:
	- `AGENT_TOOL_MODE` (default `dev`): `readonly`, `test`, `dev`, `deploy`, `production_safe`
	- `AGENT_ALLOWED_COMMAND_PREFIXES` (comma-separated command prefixes)
	- default allowlist includes: `python`, `pytest`, `alembic`, `git status`, `git rev-parse`, `git branch`, `rg`, `grep`, `cat`, `head`, `tail`, `sed`, `make`, and test/run commands for npm/pnpm/yarn.
	- mode behavior:
		- `readonly`: inspect/list/search only
		- `test`: read/list/search + test commands
		- `dev`: read/write/append + safe dev commands
		- `deploy`: dev capabilities plus deployment-related command prefixes (`docker compose`, `render`)
		- `production_safe`: read/list/search + non-destructive validate/check commands
- Automatic mode resolver picks mode per step based on role and objective:
	- `planner`, `architect`, `reviewer` -> `readonly`
	- `backend_engineer`, `frontend_engineer`, `docs_engineer` -> `dev`
	- `qa_engineer` -> `test` for validation objectives
	- deploy/release objectives -> `deploy`
	- live/prod/health/metrics/reconcile objectives -> `production_safe`
- Example (bash):
	- `export AGENT_MODEL_BASE_URL="http://localhost:1234/v1"`
	- `export AGENT_MODEL_API_KEY="lm-studio"`
	- `export AGENT_MODEL_NAME="gpt-4.1-mini"`
	- `export AGENT_MODEL_TIMEOUT_SECONDS="120"`
	- `export AGENT_MODEL_TEMPERATURE="0.1"`
	- `export AGENT_MODEL_MAX_TOKENS="4000"`
	- `export AGENT_MODEL_AUTORECOVER="1"`
	- `export AGENT_MODEL_HEALTH_PATH="/models"`
	- `export AGENT_MODEL_PRECHECK_TIMEOUT_SECONDS="4"`
	- `export AGENT_MODEL_RECOVERY_SCRIPT_TIMEOUT_SECONDS="60"`
	- `export AGENT_TOOL_MODE="dev"`
	- `export AGENT_ALLOWED_COMMAND_PREFIXES="python,pytest,alembic,git status,git rev-parse,git branch,ls,pwd,rg,grep,cat,head,tail,sed,make,npm test,npm run,pnpm test,pnpm run,yarn test,yarn run"`
	- `python -m agent_runtime.run_once`
- Example (PowerShell):
	- `$env:AGENT_MODEL_BASE_URL="http://localhost:1234/v1"`
	- `$env:AGENT_MODEL_API_KEY="lm-studio"`
	- `$env:AGENT_MODEL_NAME="gpt-4.1-mini"`
	- `$env:AGENT_MODEL_TIMEOUT_SECONDS="120"`
	- `$env:AGENT_MODEL_TEMPERATURE="0.1"`
	- `$env:AGENT_MODEL_MAX_TOKENS="4000"`
	- `$env:AGENT_MODEL_AUTORECOVER="1"`
	- `$env:AGENT_MODEL_HEALTH_PATH="/models"`
	- `$env:AGENT_MODEL_PRECHECK_TIMEOUT_SECONDS="4"`
	- `$env:AGENT_MODEL_RECOVERY_SCRIPT_TIMEOUT_SECONDS="60"`
	- `$env:AGENT_TOOL_MODE="dev"`
	- `$env:AGENT_ALLOWED_COMMAND_PREFIXES="python,pytest,alembic,git status,git rev-parse,git branch,ls,pwd,rg,grep,cat,head,tail,sed,make,npm test,npm run,pnpm test,pnpm run,yarn test,yarn run"`
	- `python -m agent_runtime.run_once`

- Runtime preflight behavior:
	- Probes `AGENT_MODEL_BASE_URL + AGENT_MODEL_HEALTH_PATH` before each model request.
	- If unavailable and autorecover is enabled, executes `scripts/ensure_model_backend.ps1`.
	- Retries connection failures once after recovery.

## VS Code Tasks
- `backend: test (backend dir)`
- `backend: run`
- `backend: smoke auth`
- `backend: stop`
- `security: webhook readiness`
- `security: webhook readiness (strict)`
- `security: webhook readiness (strict + retell key)`
- `security: webhook readiness (strict + retell + zapier keys)`