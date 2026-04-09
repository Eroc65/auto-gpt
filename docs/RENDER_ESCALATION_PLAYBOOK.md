# Render Escalation Playbook

Use this when the Render production issue is still unresolved after normal retries.

## 1) Escalate with a clear severity
- Sev 1: Production down, customers blocked.
- Sev 2: Production degraded (partial failures, SSL/domain/cutover blocked).
- Sev 3: Deployment or config issue with workaround.

## 2) Collect deterministic evidence first
Run from repo root and save outputs.

1. Readiness gate:
powershell -ExecutionPolicy Bypass -File .\scripts\readiness_check.ps1

2. Cutover verification:
powershell -ExecutionPolicy Bypass -File .\scripts\post_release_cutover_verify.ps1 -SkipDeployTrigger

If you need to trigger deploy hook as part of evidence:
powershell -ExecutionPolicy Bypass -File .\scripts\post_release_cutover_verify.ps1 -DeployHookUrl "<RENDER_PRODUCTION_DEPLOY_HOOK_URL>"

3. Capture DNS snapshots:
Resolve-DnsName -Name gofieldwise.com -Type A
Resolve-DnsName -Name www.gofieldwise.com -Type CNAME

4. Capture HTTPS checks:
Invoke-WebRequest -Uri https://gofieldwise.com -UseBasicParsing
Invoke-WebRequest -Uri https://www.gofieldwise.com -UseBasicParsing

5. Capture Render deploy timeline:
- Latest deploy ID
- Start/end timestamps
- Build logs and runtime logs for the affected service

## 3) Escalate in Render support with full context
Primary channel:
- Render Dashboard -> Support -> Contact Support

Secondary channel:
- support@render.com

Subject line format:
[SEV2] Domain/SSL cutover blocked for gofieldwise.com on production

## 4) Copy-paste escalation template
Issue summary:
Production cutover for gofieldwise.com remains unresolved after deterministic checks.

Business impact:
- Public website reliability is degraded
- Customer acquisition flow is impacted
- Launch timeline risk: [insert hours/days]

Environment:
- Workspace: [insert workspace]
- Service name: [insert exact service]
- Service URL: [insert onrender URL]
- Region/plan: [insert]

What we already validated:
- Local readiness: [PASS/FAIL + timestamp]
- DNS checks: [results]
- HTTPS checks: [results]
- Deploy hook trigger: [yes/no + response]
- Most recent deploy ID: [insert]

Expected behavior:
- gofieldwise.com and www.gofieldwise.com both active with valid SSL
- www resolves/canonicalizes correctly

Actual behavior:
- [insert exact failure message/status]

Attachments:
- readiness_check output
- post_release_cutover_verify output
- DNS command outputs
- Relevant build/runtime logs
- Screenshot of Render custom domain status

Request:
Please prioritize investigation and provide:
1) root cause
2) immediate workaround
3) permanent fix ETA

## 5) Internal escalation rhythm
- If no response in 30 minutes for Sev 1 or 2, follow up in same ticket with updated impact.
- Post updates every 60 minutes with new evidence.
- Keep one owner for Render comms and one owner for technical validation.

## 6) Common blocker to verify before escalating
In this repo, render config currently defines multiple frontend-like services in render.yaml:
- fieldwise-web
- frontend

Before opening the ticket, confirm which exact service owns the active custom domains and attach that service name in the escalation.

## 7) Latest Evidence Packet
- Dated packet: `docs/RENDER_ESCALATION_PACKET_2026-04-08.md`
