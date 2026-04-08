# Domain Cutover Runbook (Post-Release Email)

Use this runbook after Render confirms the old domain binding has been released.

## Manual Render Steps

1. Open your production frontend service in Render.
2. Add custom domains:
   - `gofieldwise.com`
   - `www.gofieldwise.com`
3. Wait until both domains show verified/active and SSL issued.

## Executable Validation Sequence

Run from repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\readiness_check.ps1
```

If the production deploy hook should be triggered as part of cutover, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\post_release_cutover_verify.ps1 -DeployHookUrl "<RENDER_PRODUCTION_DEPLOY_HOOK_URL>"
```

If deploy was already triggered manually, skip hook trigger and run verification only:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\post_release_cutover_verify.ps1 -SkipDeployTrigger
```

## Expected Success Signals

- Script prints `READINESS_OK`.
- Script prints `CUTOVER_OK`.
- `WWW_RESOLVED` points to `https://gofieldwise.com/...`.
- `WWW_CNAME` equals `gofieldwise.onrender.com`.

## Failure Handling

- If readiness fails in backend tests or auth smoke, fix code/tests first.
- If cutover DNS checks fail, verify Namecheap records and wait for propagation.
- If HTTP checks fail but DNS is correct, confirm Render SSL issuance and deployment completion.