from __future__ import annotations

import argparse
import os
import re
import smtplib
from datetime import date
from email.message import EmailMessage
from pathlib import Path

import requests


def latest_report(report_dir: Path, as_of: str | None) -> Path | None:
    if as_of:
        stamp = as_of.replace("-", "")
        candidate = report_dir / f"ads_weekly_report_{stamp}.md"
        if candidate.exists():
            return candidate
        return None

    reports = sorted(report_dir.glob("ads_weekly_report_*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    return reports[0] if reports else None


def parse_summary(markdown_text: str) -> dict[str, str]:
    summary = {
        "spend": "n/a",
        "revenue": "n/a",
        "roas": "n/a",
        "clicks": "n/a",
        "leads": "n/a",
        "click_to_lead_rate": "n/a",
    }

    patterns = {
        "spend": r"- Spend: (.+)",
        "revenue": r"- Revenue: (.+)",
        "roas": r"- ROAS: (.+)",
        "clicks": r"- Clicks: (.+)",
        "leads": r"- Leads: (.+)",
        "click_to_lead_rate": r"- Click-to-Lead Rate: (.+)",
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, markdown_text)
        if match:
            summary[key] = match.group(1).strip()

    return summary


def send_slack(webhook_url: str, report_name: str, summary: dict[str, str]) -> None:
    text = (
        "GoFieldwise Ads Daily Summary\n"
        f"Report: {report_name}\n"
        f"Spend: {summary['spend']}\n"
        f"Revenue: {summary['revenue']}\n"
        f"ROAS: {summary['roas']}\n"
        f"Clicks: {summary['clicks']}\n"
        f"Leads: {summary['leads']}\n"
        f"Click-to-Lead Rate: {summary['click_to_lead_rate']}"
    )
    response = requests.post(webhook_url, json={"text": text}, timeout=20)
    response.raise_for_status()


def send_email(report_name: str, summary: dict[str, str]) -> None:
    smtp_host = os.getenv("ADS_SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("ADS_SMTP_PORT", "587").strip() or "587")
    smtp_user = os.getenv("ADS_SMTP_USERNAME", "").strip()
    smtp_pass = os.getenv("ADS_SMTP_PASSWORD", "").strip()
    smtp_from = os.getenv("ADS_SMTP_FROM", "").strip()
    email_to = os.getenv("ADS_NOTIFY_EMAIL_TO", "").strip()
    use_tls = os.getenv("ADS_SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes"}

    if not all([smtp_host, smtp_from, email_to]):
        raise RuntimeError("Missing email settings: ADS_SMTP_HOST, ADS_SMTP_FROM, ADS_NOTIFY_EMAIL_TO")

    msg = EmailMessage()
    msg["Subject"] = f"GoFieldwise Ads Summary - {report_name}"
    msg["From"] = smtp_from
    msg["To"] = email_to
    msg.set_content(
        "\n".join(
            [
                "GoFieldwise Ads Daily Summary",
                f"Report: {report_name}",
                f"Spend: {summary['spend']}",
                f"Revenue: {summary['revenue']}",
                f"ROAS: {summary['roas']}",
                f"Clicks: {summary['clicks']}",
                f"Leads: {summary['leads']}",
                f"Click-to-Lead Rate: {summary['click_to_lead_rate']}",
            ]
        )
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        if use_tls:
            server.starttls()
        if smtp_user:
            server.login(smtp_user, smtp_pass)
        server.send_message(msg)


def run(args: argparse.Namespace) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    report_dir = (repo_root / args.report_dir).resolve()

    report = latest_report(report_dir, args.as_of)
    if not report:
        print("[skip] notify: no report found")
        return

    markdown = report.read_text(encoding="utf-8")
    summary = parse_summary(markdown)

    slack_webhook = os.getenv("ADS_SLACK_WEBHOOK_URL", "").strip()
    sent_any = False

    if slack_webhook:
        try:
            send_slack(slack_webhook, report.name, summary)
            print("[ok] notify: sent Slack summary")
            sent_any = True
        except requests.RequestException as err:
            print(f"[error] notify slack: {err}")

    if os.getenv("ADS_NOTIFY_EMAIL_TO", "").strip():
        try:
            send_email(report.name, summary)
            print("[ok] notify: sent email summary")
            sent_any = True
        except Exception as err:  # noqa: BLE001
            print(f"[error] notify email: {err}")

    if not sent_any:
        print("[skip] notify: no notification channels configured")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send ads pipeline summary notifications.")
    parser.add_argument("--report-dir", default="docs/ads/reports")
    parser.add_argument("--as-of", default=date.today().isoformat())
    run(parser.parse_args())
