# Render Escalation Packet - 2026-04-08

## Current Evidence Snapshot

### Final Validation (Resolved)
- `scripts/readiness_check.ps1` result: `READINESS_OK`
   - backend pytest: `226 passed in 44.21s`
   - auth smoke: signup/login/protected/org all returned `200`
   - live apex/www check passed
- `scripts/post_release_cutover_verify.ps1 -SkipDeployTrigger` result: `CUTOVER_OK`
   - `APEX_RESOLVED=https://gofieldwise.com/`
   - `WWW_RESOLVED=https://gofieldwise.com/`
   - `WWW_CNAME=gofieldwise.onrender.com`

### Update (Post-Fix)
- Import-time hang fix applied in `backend/app/factory.py` by deferring heavy imports to app lifespan.
- Verification: `cd backend; ..\\.venv\\Scripts\\python.exe -m pytest tests/test_import_app_main.py -q` => `1 passed`.
- Verification: `cd backend; ..\\.venv\\Scripts\\python.exe -m pytest tests/test_import_app_main.py tests/test_auth_flow.py -q` => passed in current session.
- Render cutover re-check: `CUTOVER_OK`, `WWW_CNAME=gofieldwise.onrender.com`.

### Command 1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\readiness_check.ps1

Result:
- FAILED at backend test gate, not at Render DNS/SSL gate.
- Failing test: tests/test_import_app_main.py::test_import_app_main_is_side_effect_free
- Error: import app.main timed out after 5 seconds (subprocess.TimeoutExpired)
- Pytest summary: 1 failed, 225 passed

### Command 2
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\post_release_cutover_verify.ps1 -SkipDeployTrigger

Result:
- CUTOVER_OK
- APEX_RESOLVED=https://gofieldwise.com/
- WWW_RESOLVED=https://gofieldwise.com/
- WWW_CNAME=gofieldwise.onrender.com

## Triage Conclusion
- Current deterministic evidence does not show an active Render domain cutover failure.
- The previous application/test blocker (import app.main timeout) is now fixed and no longer reproduces in focused verification.
- Full readiness gate has now completed successfully; current status is resolved.

## Recommended Escalation Route
1. No active escalation required at this time.
   - Keep this packet as incident history and evidence.
   - Re-open Render escalation only if new user-facing symptoms reappear.

2. Render support escalation (only if user-facing Render symptoms persist):
   - Use the template below.
   - Attach timestamps and any intermittent 5xx/SSL/domain mismatches if they occur.

## Render Support Ticket Draft (Use if production symptoms persist)
Subject:
[SEV2] Intermittent production reliability issue for gofieldwise.com (verification attached)

Body:
Hello Render Support,

We are seeing intermittent production reliability concerns and need assistance validating platform-side behavior.

Environment:
- Domain: gofieldwise.com
- www: www.gofieldwise.com
- Expected CNAME: gofieldwise.onrender.com
- Service name: [FILL IN exact service from Render dashboard]
- Workspace: [FILL IN]

Deterministic checks run:
1) post_release_cutover_verify.ps1 -SkipDeployTrigger
- Result: CUTOVER_OK
- APEX_RESOLVED=https://gofieldwise.com/
- WWW_RESOLVED=https://gofieldwise.com/
- WWW_CNAME=gofieldwise.onrender.com

2) readiness_check.ps1
- Prior failure: app-level test reliability (import app.main timeout), not DNS/SSL mismatch.
- Current status: focused import-side-effect test now passes after fix.

Request:
- Confirm there are no platform-side incidents for our service in the attached timeframe.
- Confirm domain/SSL/cert renewal and edge routing status for our service.
- Share any infrastructure-side anomalies that could cause intermittent behavior.

Attachments:
- Command outputs from both checks
- Render deploy logs around incident windows
- Screenshot of custom domain status page

Thank you.

## Internal Engineering Ticket Draft (Recommended Now)
Title:
Fix import-time hang in app.main causing readiness gate failure

Description:
readiness_check.ps1 fails because test_import_app_main_is_side_effect_free times out after 5 seconds while importing app.main in subprocess.

Acceptance criteria:
- tests/test_import_app_main.py passes consistently.
- readiness_check.ps1 returns READINESS_OK.
- No regression in auth smoke or API startup behavior.
