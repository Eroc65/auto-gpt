#!/usr/bin/env python3
"""
Generate LeadLaunch KPI daily and weekly summaries.

Outputs:
- docs/ads/reports/leadlaunch_kpi_snapshot_YYYYMMDD.json
- docs/ads/reports/leadlaunch_kpi_daily_YYYYMMDD.md
- docs/ads/reports/leadlaunch_kpi_weekly_YYYYMMDD.md
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from statistics import mean
from typing import Any, Dict, Iterable, List, Optional

DEFAULT_INPUTS = [
    "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv",
    "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv",
]

FUNNEL_STAGES = [
    "to_contact",
    "contacted",
    "replied",
    "qualified",
    "booked",
    "proposal_sent",
    "closed_won",
    "closed_lost",
    "suppressed",
    "unmapped",
]


@dataclass
class FileMetrics:
    file_path: str
    city: str
    total_leads: int
    with_email: int
    without_email: int
    avg_lead_score: float
    segment_counts: Dict[str, int]
    status_counts: Dict[str, int]
    funnel_counts: Dict[str, int]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate LeadLaunch KPI summaries")
    parser.add_argument("--inputs", nargs="+", default=DEFAULT_INPUTS, help="Lead CSV inputs")
    parser.add_argument(
        "--suppression-list",
        default="docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
        help="Suppression list CSV",
    )
    parser.add_argument(
        "--filter-report",
        default="docs/ads/reports/suppression_report.json",
        help="Suppression filter JSON report",
    )
    parser.add_argument(
        "--output-dir",
        default="docs/ads/reports",
        help="Output directory",
    )
    parser.add_argument(
        "--window-days",
        type=int,
        default=7,
        help="Rolling window in days for weekly summary",
    )
    parser.add_argument(
        "--as-of",
        default="",
        help="As-of date in YYYY-MM-DD (defaults to today)",
    )
    return parser.parse_args()


def norm(value: str) -> str:
    return (value or "").strip()


def norm_lower(value: str) -> str:
    return norm(value).lower()


def classify_funnel(status: str) -> str:
    s = norm_lower(status)
    if not s:
        return "unmapped"

    if any(k in s for k in ["to contact", "new", "queued"]):
        return "to_contact"
    if any(k in s for k in ["contacted", "sent", "attempted", "emailed"]):
        return "contacted"
    if "repl" in s:
        return "replied"
    if "qualif" in s:
        return "qualified"
    if any(k in s for k in ["booked", "discovery", "scheduled"]):
        return "booked"
    if any(k in s for k in ["proposal", "quote sent"]):
        return "proposal_sent"
    if any(k in s for k in ["won", "closed won", "client"]):
        return "closed_won"
    if any(k in s for k in ["lost", "closed lost", "do not pursue"]):
        return "closed_lost"
    if "suppress" in s:
        return "suppressed"
    return "unmapped"


def safe_rate(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 2)


def load_csv_rows(path: Path) -> List[Dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


def calc_file_metrics(path: Path) -> FileMetrics:
    rows = load_csv_rows(path)
    total = len(rows)

    with_email = 0
    scores: List[float] = []
    segments: Counter[str] = Counter()
    statuses: Counter[str] = Counter()
    funnel: Counter[str] = Counter()
    city_name = "Unknown"

    for row in rows:
        email = norm(row.get("email", ""))
        if email:
            with_email += 1

        city_val = norm(row.get("city", ""))
        if city_val:
            city_name = city_val

        segment = norm(row.get("segment", "")).upper() or "UNKNOWN"
        segments[segment] += 1

        status = norm(row.get("status", "")) or "(blank)"
        statuses[status] += 1

        funnel[classify_funnel(status)] += 1

        raw_score = norm(row.get("lead_score", ""))
        if raw_score:
            try:
                scores.append(float(raw_score))
            except ValueError:
                pass

    avg_score = round(mean(scores), 2) if scores else 0.0

    # ensure all funnel stages are present
    for stage in FUNNEL_STAGES:
        funnel.setdefault(stage, 0)

    return FileMetrics(
        file_path=str(path),
        city=city_name,
        total_leads=total,
        with_email=with_email,
        without_email=max(total - with_email, 0),
        avg_lead_score=avg_score,
        segment_counts=dict(segments),
        status_counts=dict(statuses),
        funnel_counts=dict(funnel),
    )


def load_suppression_count(path: Path) -> int:
    if not path.exists():
        return 0
    rows = load_csv_rows(path)
    emails = {norm_lower(r.get("email", "")) for r in rows if norm_lower(r.get("email", ""))}
    return len(emails)


def load_filter_removed_count(path: Path) -> int:
    if not path.exists():
        return 0
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return 0

    removed_total = 0
    files = data.get("files", [])
    if isinstance(files, list):
        for item in files:
            if isinstance(item, dict):
                removed_total += int(item.get("removed_rows", 0) or 0)
    return removed_total


def aggregate(metrics: Iterable[FileMetrics]) -> Dict[str, Any]:
    overall = {
        "total_leads": 0,
        "with_email": 0,
        "without_email": 0,
        "segment_counts": Counter(),
        "status_counts": Counter(),
        "funnel_counts": Counter(),
        "avg_lead_score": 0.0,
    }

    score_values: List[float] = []
    per_city: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "total_leads": 0,
        "with_email": 0,
        "without_email": 0,
        "segment_counts": Counter(),
        "funnel_counts": Counter(),
    })

    for m in metrics:
        overall["total_leads"] += m.total_leads
        overall["with_email"] += m.with_email
        overall["without_email"] += m.without_email
        overall["segment_counts"].update(m.segment_counts)
        overall["status_counts"].update(m.status_counts)
        overall["funnel_counts"].update(m.funnel_counts)
        score_values.append(m.avg_lead_score)

        city = m.city or "Unknown"
        per_city[city]["total_leads"] += m.total_leads
        per_city[city]["with_email"] += m.with_email
        per_city[city]["without_email"] += m.without_email
        per_city[city]["segment_counts"].update(m.segment_counts)
        per_city[city]["funnel_counts"].update(m.funnel_counts)

    for stage in FUNNEL_STAGES:
        overall["funnel_counts"].setdefault(stage, 0)

    overall["avg_lead_score"] = round(mean(score_values), 2) if score_values else 0.0

    city_serialized: Dict[str, Dict[str, Any]] = {}
    for city, values in per_city.items():
        city_serialized[city] = {
            "total_leads": values["total_leads"],
            "with_email": values["with_email"],
            "without_email": values["without_email"],
            "segment_counts": dict(values["segment_counts"]),
            "funnel_counts": {stage: int(values["funnel_counts"].get(stage, 0)) for stage in FUNNEL_STAGES},
            "contactable_rate_pct": safe_rate(values["with_email"], values["total_leads"]),
        }

    return {
        "overall": {
            "total_leads": overall["total_leads"],
            "with_email": overall["with_email"],
            "without_email": overall["without_email"],
            "segment_counts": dict(overall["segment_counts"]),
            "status_counts": dict(overall["status_counts"]),
            "funnel_counts": {stage: int(overall["funnel_counts"].get(stage, 0)) for stage in FUNNEL_STAGES},
            "avg_lead_score": overall["avg_lead_score"],
            "contactable_rate_pct": safe_rate(overall["with_email"], overall["total_leads"]),
        },
        "cities": city_serialized,
    }


def load_recent_snapshots(output_dir: Path, as_of: date, window_days: int) -> List[Dict[str, Any]]:
    cutoff = as_of - timedelta(days=window_days - 1)
    snapshots: List[Dict[str, Any]] = []
    for path in sorted(output_dir.glob("leadlaunch_kpi_snapshot_*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            snap_date = datetime.strptime(payload.get("as_of", ""), "%Y-%m-%d").date()
        except Exception:
            continue
        if cutoff <= snap_date <= as_of:
            snapshots.append(payload)
    snapshots.sort(key=lambda s: s.get("as_of", ""))
    return snapshots


def build_daily_markdown(snapshot: Dict[str, Any]) -> str:
    overall = snapshot["summary"]["overall"]
    cities = snapshot["summary"]["cities"]
    funnel = overall["funnel_counts"]

    lines = [
        f"# LeadLaunch KPI Daily Summary ({snapshot['as_of']})",
        "",
        "## Overall",
        f"- Total leads: {overall['total_leads']}",
        f"- Contactable leads (email present): {overall['with_email']} ({overall['contactable_rate_pct']}%)",
        f"- Avg lead score: {overall['avg_lead_score']}",
        f"- Suppressed emails (list size): {snapshot['suppression_list_size']}",
        f"- Removed in latest suppression filter: {snapshot['latest_suppression_removed_rows']}",
        "",
        "## Funnel",
        f"- To contact: {funnel['to_contact']}",
        f"- Contacted: {funnel['contacted']}",
        f"- Replied: {funnel['replied']}",
        f"- Qualified: {funnel['qualified']}",
        f"- Booked: {funnel['booked']}",
        f"- Proposal sent: {funnel['proposal_sent']}",
        f"- Closed won: {funnel['closed_won']}",
        f"- Closed lost: {funnel['closed_lost']}",
        "",
        "## Cities",
    ]

    for city, values in sorted(cities.items()):
        lines.append(
            f"- {city}: leads={values['total_leads']}, contactable={values['with_email']} ({values['contactable_rate_pct']}%), A={values['segment_counts'].get('A', 0)}, B={values['segment_counts'].get('B', 0)}, C={values['segment_counts'].get('C', 0)}"
        )

    return "\n".join(lines) + "\n"


def build_weekly_markdown(snapshots: List[Dict[str, Any]], window_days: int, as_of: str) -> str:
    lines = [
        f"# LeadLaunch KPI Weekly Summary ({as_of})",
        "",
        f"Window: last {window_days} days",
        "",
        "| Date | Leads | Contactable | Contactable % | Replied | Booked | Closed Won |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]

    for snap in snapshots:
        overall = snap.get("summary", {}).get("overall", {})
        funnel = overall.get("funnel_counts", {})
        lines.append(
            "| {date} | {leads} | {contactable} | {rate}% | {replied} | {booked} | {won} |".format(
                date=snap.get("as_of", ""),
                leads=overall.get("total_leads", 0),
                contactable=overall.get("with_email", 0),
                rate=overall.get("contactable_rate_pct", 0),
                replied=funnel.get("replied", 0),
                booked=funnel.get("booked", 0),
                won=funnel.get("closed_won", 0),
            )
        )

    if len(snapshots) >= 2:
        first = snapshots[0].get("summary", {}).get("overall", {})
        last = snapshots[-1].get("summary", {}).get("overall", {})
        delta_leads = int(last.get("total_leads", 0)) - int(first.get("total_leads", 0))
        delta_contactable = int(last.get("with_email", 0)) - int(first.get("with_email", 0))
        lines.extend(
            [
                "",
                "## Trend vs Window Start",
                f"- Lead delta: {delta_leads}",
                f"- Contactable lead delta: {delta_contactable}",
            ]
        )

    return "\n".join(lines) + "\n"


def main() -> int:
    args = parse_args()

    as_of_date = datetime.strptime(args.as_of, "%Y-%m-%d").date() if args.as_of else date.today()
    as_of_str = as_of_date.isoformat()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    input_paths = [Path(p) for p in args.inputs]
    missing_inputs = [str(p) for p in input_paths if not p.exists()]
    if missing_inputs:
        raise FileNotFoundError("Missing KPI input files: " + ", ".join(missing_inputs))

    metrics = [calc_file_metrics(p) for p in input_paths]
    summary = aggregate(metrics)

    snapshot = {
        "generated_at": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "as_of": as_of_str,
        "window_days": args.window_days,
        "inputs": [str(p) for p in input_paths],
        "summary": summary,
        "suppression_list_size": load_suppression_count(Path(args.suppression_list)),
        "latest_suppression_removed_rows": load_filter_removed_count(Path(args.filter_report)),
    }

    snapshot_path = output_dir / f"leadlaunch_kpi_snapshot_{as_of_date.strftime('%Y%m%d')}.json"
    snapshot_path.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")

    recent_snapshots = load_recent_snapshots(output_dir, as_of_date, args.window_days)
    if not any(s.get("as_of") == as_of_str for s in recent_snapshots):
        recent_snapshots.append(snapshot)
        recent_snapshots.sort(key=lambda s: s.get("as_of", ""))

    daily_md = build_daily_markdown(snapshot)
    weekly_md = build_weekly_markdown(recent_snapshots, args.window_days, as_of_str)

    daily_path = output_dir / f"leadlaunch_kpi_daily_{as_of_date.strftime('%Y%m%d')}.md"
    weekly_path = output_dir / f"leadlaunch_kpi_weekly_{as_of_date.strftime('%Y%m%d')}.md"

    daily_path.write_text(daily_md, encoding="utf-8")
    weekly_path.write_text(weekly_md, encoding="utf-8")

    print(
        "LEADLAUNCH_KPI_OK: snapshot={snapshot} daily={daily} weekly={weekly}".format(
            snapshot=snapshot_path,
            daily=daily_path,
            weekly=weekly_path,
        )
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
