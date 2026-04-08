from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any


@dataclass
class ChannelMetrics:
    channel: str
    impressions: float = 0.0
    clicks: float = 0.0
    spend: float = 0.0
    revenue: float = 0.0
    leads: float = 0.0
    qualified_leads: float = 0.0

    @property
    def ctr(self) -> float:
        return (self.clicks / self.impressions * 100.0) if self.impressions else 0.0

    @property
    def cpc(self) -> float:
        return (self.spend / self.clicks) if self.clicks else 0.0

    @property
    def cpl(self) -> float:
        return (self.spend / self.leads) if self.leads else 0.0

    @property
    def roas(self) -> float:
        return (self.revenue / self.spend) if self.spend else 0.0

    @property
    def click_to_lead_rate(self) -> float:
        return (self.leads / self.clicks * 100.0) if self.clicks else 0.0


def parse_float(value: str | None) -> float:
    if value is None:
        return 0.0
    text = str(value).strip().replace("$", "").replace(",", "")
    if not text:
        return 0.0
    try:
        return float(text)
    except ValueError:
        return 0.0


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    text = value.strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def normalize_channel_name(path: Path) -> str:
    return path.stem.lower().replace(" ", "_")


def load_channel_metrics(csv_path: Path, start: date, end: date) -> ChannelMetrics:
    metrics = ChannelMetrics(channel=normalize_channel_name(csv_path))
    with csv_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row_date = parse_date(row.get("date"))
            if row_date and not (start <= row_date <= end):
                continue

            metrics.impressions += parse_float(row.get("impressions"))
            metrics.clicks += parse_float(row.get("clicks"))
            metrics.spend += parse_float(row.get("spend"))
            metrics.revenue += parse_float(row.get("revenue"))
            metrics.leads += parse_float(row.get("leads"))
            metrics.qualified_leads += parse_float(row.get("qualified_leads"))

    return metrics


def load_config(config_path: Path) -> dict[str, Any]:
    with config_path.open("r", encoding="utf-8") as f:
        return json.load(f)


def budget_recommendation(metrics: ChannelMetrics, config: dict[str, Any]) -> dict[str, Any]:
    targets = config["targets"]
    rules = config["rules"]
    current_budget = float(config["channel_budgets_usd"].get(metrics.channel, 0.0))

    default_cpl = float(targets.get("default_cpl", 75.0))
    channel_targets = targets.get("cpl_by_channel", {})
    target_cpl = float(channel_targets.get(metrics.channel, default_cpl))

    scale_roas = float(rules.get("scale_if_roas_gte", 3.0))
    cut_roas = float(rules.get("cut_if_roas_lte", 1.5))
    scale_pct = float(rules.get("scale_budget_pct", 15.0))
    cut_pct = float(rules.get("cut_budget_pct", 20.0))
    min_leads = float(rules.get("min_leads_for_decision", 15.0))
    cpl_over_target_multiplier = float(rules.get("cpl_over_target_multiplier", 1.4))

    action = "hold"
    change_pct = 0.0
    reason = "Insufficient signal"

    if metrics.leads < min_leads:
        action = "hold"
        reason = f"Leads below decision threshold ({metrics.leads:.0f} < {min_leads:.0f})"
    elif metrics.roas >= scale_roas and metrics.cpl <= target_cpl:
        action = "increase"
        change_pct = scale_pct
        reason = f"ROAS {metrics.roas:.2f} and CPL ${metrics.cpl:.2f} beat targets"
    elif metrics.roas <= cut_roas or metrics.cpl >= (target_cpl * cpl_over_target_multiplier):
        action = "decrease"
        change_pct = -cut_pct
        reason = f"ROAS/CPL under target (ROAS {metrics.roas:.2f}, CPL ${metrics.cpl:.2f})"
    else:
        action = "hold"
        reason = "Performance within acceptable range"

    next_budget = current_budget * (1.0 + (change_pct / 100.0))

    return {
        "channel": metrics.channel,
        "current_budget_usd": round(current_budget, 2),
        "recommended_budget_usd": round(max(next_budget, 0.0), 2),
        "action": action,
        "change_pct": round(change_pct, 2),
        "reason": reason,
    }


def write_markdown_report(
    output_path: Path,
    as_of: date,
    start: date,
    end: date,
    metrics_rows: list[ChannelMetrics],
    recommendations: list[dict[str, Any]],
) -> None:
    total = ChannelMetrics(channel="total")
    for row in metrics_rows:
        total.impressions += row.impressions
        total.clicks += row.clicks
        total.spend += row.spend
        total.revenue += row.revenue
        total.leads += row.leads
        total.qualified_leads += row.qualified_leads

    lines: list[str] = []
    lines.append(f"# Weekly Ads Automation Report ({as_of.isoformat()})")
    lines.append("")
    lines.append(f"Window: {start.isoformat()} to {end.isoformat()}")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(f"- Spend: ${total.spend:,.2f}")
    lines.append(f"- Revenue: ${total.revenue:,.2f}")
    lines.append(f"- ROAS: {total.roas:.2f}x")
    lines.append(f"- Clicks: {total.clicks:,.0f}")
    lines.append(f"- Leads: {total.leads:,.0f}")
    lines.append(f"- Click-to-Lead Rate: {total.click_to_lead_rate:.2f}%")
    lines.append("")
    lines.append("## Channel Performance")
    lines.append("")
    lines.append("| Channel | Impressions | Clicks | Spend | Revenue | Leads | CTR | CPL | ROAS |")
    lines.append("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    for row in metrics_rows:
        lines.append(
            f"| {row.channel} | {row.impressions:,.0f} | {row.clicks:,.0f} | ${row.spend:,.2f} | ${row.revenue:,.2f} | {row.leads:,.0f} | {row.ctr:.2f}% | ${row.cpl:.2f} | {row.roas:.2f}x |"
        )

    lines.append("")
    lines.append("## Budget Recommendations")
    lines.append("")
    lines.append("| Channel | Current Budget | Recommended Budget | Action | Change | Reason |")
    lines.append("|---|---:|---:|---|---:|---|")
    for rec in recommendations:
        lines.append(
            f"| {rec['channel']} | ${rec['current_budget_usd']:,.2f} | ${rec['recommended_budget_usd']:,.2f} | {rec['action']} | {rec['change_pct']:.2f}% | {rec['reason']} |"
        )

    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_csv_report(
    output_path: Path,
    metrics_rows: list[ChannelMetrics],
    recommendations: list[dict[str, Any]],
) -> None:
    rec_by_channel = {r["channel"]: r for r in recommendations}
    fields = [
        "channel",
        "impressions",
        "clicks",
        "spend",
        "revenue",
        "leads",
        "qualified_leads",
        "ctr_pct",
        "cpc_usd",
        "cpl_usd",
        "roas",
        "current_budget_usd",
        "recommended_budget_usd",
        "action",
        "change_pct",
        "reason",
    ]

    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in metrics_rows:
            rec = rec_by_channel.get(row.channel, {})
            writer.writerow(
                {
                    "channel": row.channel,
                    "impressions": round(row.impressions, 2),
                    "clicks": round(row.clicks, 2),
                    "spend": round(row.spend, 2),
                    "revenue": round(row.revenue, 2),
                    "leads": round(row.leads, 2),
                    "qualified_leads": round(row.qualified_leads, 2),
                    "ctr_pct": round(row.ctr, 4),
                    "cpc_usd": round(row.cpc, 4),
                    "cpl_usd": round(row.cpl, 4),
                    "roas": round(row.roas, 4),
                    "current_budget_usd": rec.get("current_budget_usd", 0.0),
                    "recommended_budget_usd": rec.get("recommended_budget_usd", 0.0),
                    "action": rec.get("action", "hold"),
                    "change_pct": rec.get("change_pct", 0.0),
                    "reason": rec.get("reason", ""),
                }
            )


def run(args: argparse.Namespace) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    input_dir = (repo_root / args.input_dir).resolve()
    config_path = (repo_root / args.config).resolve()
    report_dir = (repo_root / args.report_dir).resolve()

    as_of = date.fromisoformat(args.as_of) if args.as_of else date.today()
    start = as_of - timedelta(days=max(args.window_days - 1, 0))
    end = as_of

    config = load_config(config_path)
    report_dir.mkdir(parents=True, exist_ok=True)

    csv_files = sorted(input_dir.glob("*.csv"))
    if not csv_files:
        raise SystemExit(f"No channel CSV files found in: {input_dir}")

    metrics_rows = [load_channel_metrics(path, start, end) for path in csv_files]
    recommendations = [budget_recommendation(m, config) for m in metrics_rows]

    stamp = as_of.strftime("%Y%m%d")
    md_path = report_dir / f"ads_weekly_report_{stamp}.md"
    csv_path = report_dir / f"ads_weekly_report_{stamp}.csv"

    write_markdown_report(md_path, as_of, start, end, metrics_rows, recommendations)
    write_csv_report(csv_path, metrics_rows, recommendations)

    print(f"Report written: {md_path}")
    print(f"Report written: {csv_path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Ingest channel CSV exports, apply budget rules, and generate weekly reports."
    )
    parser.add_argument("--input-dir", default="docs/ads/channel_exports")
    parser.add_argument("--config", default="docs/ads/AUTOMATION_CONFIG.json")
    parser.add_argument("--report-dir", default="docs/ads/reports")
    parser.add_argument("--window-days", type=int, default=7)
    parser.add_argument("--as-of", default="", help="YYYY-MM-DD. Defaults to today.")
    return parser


if __name__ == "__main__":
    parser = build_parser()
    args = parser.parse_args()
    run(args)
