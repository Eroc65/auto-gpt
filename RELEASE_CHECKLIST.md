# GoFieldwise Release Checklist

Use this checklist for every production release.

1. Confirm Canonical Target
- Confirm change belongs to this repo (`auto-gpt`) for `gofieldwise.com` production behavior.
- Confirm branch is `main` and working tree is clean enough for an intentional commit.

2. Validate Changes Locally
- Run targeted tests for changed areas.
- Run app build (`frontend`/root as applicable).
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
- Verify homepage and primary nav routes load.
- Verify changed endpoints/pages (example: `/field-notes`, key API routes) return expected behavior.

6. Post-Deploy Record
- Capture commit SHA, deploy ID/time, and smoke-test results.
- If rollback is needed, use Render rollback to last known-good deploy.
- Update docs only if release changed operational behavior.
