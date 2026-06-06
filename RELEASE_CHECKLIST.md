# GoFieldwise Release Checklist

Use this checklist for every production release.

Role of this repo:
- This is the canonical source for gofieldwise.com production behavior.
- Vercel previews or non-canonical repo previews are not release truth for gofieldwise.com.

1. Confirm Canonical Target
- Confirm change belongs to this repo (`auto-gpt`) for `gofieldwise.com` production behavior.
- Confirm branch is `main` and working tree is clean enough for an intentional commit.
- Route ownership lookup:
- If route is user-facing (`/`, `/field-notes`, `/connect`) or production API (`/api/health`, webhooks), it belongs here.
- If unsure, verify production headers first: `curl -I https://gofieldwise.com/` should include `x-render-origin-server: Render`.

2. Validate Changes Locally
- Run targeted tests for changed areas (example: `cd frontend && npm run test` if tests exist).
- Run app build from repo root: `npm run build` (or `cd frontend && npm run build` if the change is frontend-only).
- Fix lint/type/runtime errors in changed files before pushing.

3. Verify Config And Secrets
- Confirm required env vars exist in Render (`oklahoma-seo-growth-engine`).
- For auth or admin tokens, verify header/key names match runtime code.
- Never print secret values in logs or commit history.

4. Push And Deploy
- Commit with clear scope in message.
- Push to `origin/main`.
- Confirm Render auto-deploy starts for latest commit SHA.

5. Smoke Test Production
- Check `https://gofieldwise.com/api/health` returns `200`.
- Verify these minimum routes return expected content:
- `https://gofieldwise.com/`
- `https://gofieldwise.com/field-notes`
- `https://gofieldwise.com/field-notes/never-miss-after-hours-call`
- `https://gofieldwise.com/field-notes/real-dispatch-summary`
- `https://gofieldwise.com/field-notes/software-for-one-van-shops`
- Verify changed endpoints/pages (example: `/field-notes`, key API routes) return expected behavior.

6. Post-Deploy Record
- Capture commit SHA, deploy ID/time, and smoke-test results.
- If rollback is needed, use Render rollback to last known-good deploy.
- Update docs only if release changed operational behavior.
