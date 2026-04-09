#!/usr/bin/env python3
"""
Apply suppression list to outreach CSV files.

This script removes rows whose email exists in the suppression list,
writing filtered CSV files and a small JSON report.
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set


def _normalize_email(value: str) -> str:
    return (value or "").strip().lower()


def load_suppressed_emails(path: Path) -> Set[str]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if "email" not in (reader.fieldnames or []):
            raise ValueError(f"Suppression list missing required 'email' header: {path}")
        return {
            _normalize_email(row.get("email", ""))
            for row in reader
            if _normalize_email(row.get("email", ""))
        }


def filter_csv(input_path: Path, output_path: Path, suppressed: Set[str]) -> Dict[str, int]:
    with input_path.open("r", encoding="utf-8", newline="") as src:
        reader = csv.DictReader(src)
        fieldnames = reader.fieldnames or []
        if "email" not in fieldnames:
            raise ValueError(f"Input list missing required 'email' header: {input_path}")

        rows = list(reader)

    kept_rows: List[dict] = []
    removed = 0

    for row in rows:
        email = _normalize_email(row.get("email", ""))
        if email and email in suppressed:
            removed += 1
            continue
        kept_rows.append(row)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as dst:
        writer = csv.DictWriter(dst, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(kept_rows)

    return {
        "input_rows": len(rows),
        "output_rows": len(kept_rows),
        "suppressed_rows": removed,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Apply email suppression list to outreach CSV files.")
    parser.add_argument(
        "--suppression-list",
        default="docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
        help="Path to suppression CSV with an 'email' column",
    )
    parser.add_argument(
        "--inputs",
        nargs="+",
        required=True,
        help="Input CSV files to filter",
    )
    parser.add_argument(
        "--suffix",
        default="_filtered",
        help="Suffix appended to output filename before .csv",
    )
    parser.add_argument(
        "--report",
        default="docs/ads/reports/suppression_report.json",
        help="Path to JSON report",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    suppression_path = Path(args.suppression_list)
    suppressed = load_suppressed_emails(suppression_path)

    report: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "suppression_list": str(suppression_path),
        "suppressed_emails": len(suppressed),
        "files": {},
    }

    files_report: Dict[str, Dict[str, Any]] = {}
    report["files"] = files_report

    for input_file in args.inputs:
        input_path = Path(input_file)
        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")

        output_path = input_path.with_name(f"{input_path.stem}{args.suffix}{input_path.suffix}")
        stats = filter_csv(input_path=input_path, output_path=output_path, suppressed=suppressed)
        files_report[str(input_path)] = {
            "output": str(output_path),
            **stats,
        }

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"SUPPRESSION_FILTER_OK: report={report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
