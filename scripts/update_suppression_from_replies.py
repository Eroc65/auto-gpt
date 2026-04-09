#!/usr/bin/env python3
"""
Update suppression list from reply export CSV files.

This script parses one or more reply exports, detects unsubscribe intent,
and appends unique emails to the suppression list with audit metadata.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence, Set

UNSUBSCRIBE_PATTERNS: Sequence[re.Pattern[str]] = [
    re.compile(r"\bunsubscribe\b", re.IGNORECASE),
    re.compile(r"\bunsubscribed\b", re.IGNORECASE),
    re.compile(r"\bopt\s*-?\s*out\b", re.IGNORECASE),
    re.compile(r"\bremove\s+me\b", re.IGNORECASE),
    re.compile(r"\bstop\b", re.IGNORECASE),
    re.compile(r"\bdo\s+not\s+contact\b", re.IGNORECASE),
    re.compile(r"\bno\s+more\s+emails?\b", re.IGNORECASE),
]

DEFAULT_EMAIL_COLUMNS = ["email", "from", "sender", "contact_email", "reply_from"]
DEFAULT_TEXT_COLUMNS = ["body", "message", "reply_text", "text", "content", "subject"]
DEFAULT_STATUS_COLUMNS = ["status", "reply_type", "intent"]

SUPPRESSION_HEADERS = ["email", "reason", "source", "added_at", "notes"]


def _normalize(value: str) -> str:
    return (value or "").strip()


def _normalize_email(value: str) -> str:
    return _normalize(value).lower()


def _first_non_empty(row: Dict[str, str], columns: Iterable[str]) -> str:
    row_lookup = {k.lstrip("\ufeff").strip().lower(): v for k, v in row.items()}
    for column in columns:
        value = _normalize(row_lookup.get(column.lower(), ""))
        if value:
            return value
    return ""


def _combine_fields(row: Dict[str, str], columns: Iterable[str]) -> str:
    row_lookup = {k.lstrip("\ufeff").strip().lower(): v for k, v in row.items()}
    values = [_normalize(row_lookup.get(col.lower(), "")) for col in columns]
    return "\n".join(v for v in values if v)


def _is_unsubscribe_intent(text_blob: str, status_blob: str) -> bool:
    haystack = f"{text_blob}\n{status_blob}".strip()
    if not haystack:
        return False
    for pattern in UNSUBSCRIBE_PATTERNS:
        if pattern.search(haystack):
            return True
    return False


def _ensure_suppression_file(path: Path) -> None:
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=SUPPRESSION_HEADERS)
        writer.writeheader()


def _load_existing_suppressed(path: Path) -> Set[str]:
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if "email" not in (reader.fieldnames or []):
            raise ValueError(f"Suppression file missing 'email' column: {path}")
        return {
            _normalize_email(row.get("email", ""))
            for row in reader
            if _normalize_email(row.get("email", ""))
        }


def _append_suppression_rows(path: Path, rows: List[Dict[str, str]]) -> None:
    if not rows:
        return
    with path.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=SUPPRESSION_HEADERS)
        writer.writerows(rows)


def _parse_reply_file(
    input_path: Path,
    email_columns: Sequence[str],
    text_columns: Sequence[str],
    status_columns: Sequence[str],
) -> Dict[str, Any]:
    with input_path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    extracted: List[str] = []
    unmatched_rows = 0

    for row in rows:
        email = _normalize_email(_first_non_empty(row, email_columns))
        if not email:
            unmatched_rows += 1
            continue

        text_blob = _combine_fields(row, text_columns)
        status_blob = _combine_fields(row, status_columns)

        if _is_unsubscribe_intent(text_blob=text_blob, status_blob=status_blob):
            extracted.append(email)

    return {
        "rows": len(rows),
        "emails_detected": len(extracted),
        "rows_without_email": unmatched_rows,
        "emails": extracted,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Update suppression list from reply CSV exports.")
    parser.add_argument(
        "--inputs",
        nargs="+",
        required=True,
        help="Reply export CSV files",
    )
    parser.add_argument(
        "--suppression-list",
        default="docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
        help="Suppression list CSV path",
    )
    parser.add_argument(
        "--source",
        default="reply_export",
        help="Source value written to suppression rows",
    )
    parser.add_argument(
        "--reason",
        default="unsubscribe",
        help="Reason value written to suppression rows",
    )
    parser.add_argument(
        "--email-columns",
        nargs="+",
        default=DEFAULT_EMAIL_COLUMNS,
        help="Column priority for finding email",
    )
    parser.add_argument(
        "--text-columns",
        nargs="+",
        default=DEFAULT_TEXT_COLUMNS,
        help="Columns scanned for unsubscribe intent",
    )
    parser.add_argument(
        "--status-columns",
        nargs="+",
        default=DEFAULT_STATUS_COLUMNS,
        help="Additional status/intention columns scanned",
    )
    parser.add_argument(
        "--report",
        default="docs/ads/reports/suppression_update_report.json",
        help="JSON report output path",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    suppression_path = Path(args.suppression_list)
    _ensure_suppression_file(suppression_path)
    existing = _load_existing_suppressed(suppression_path)

    per_file: Dict[str, Dict[str, Any]] = {}
    all_new_rows: List[Dict[str, str]] = []

    for raw_input in args.inputs:
        input_path = Path(raw_input)
        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")

        parsed = _parse_reply_file(
            input_path=input_path,
            email_columns=args.email_columns,
            text_columns=args.text_columns,
            status_columns=args.status_columns,
        )

        unique_new = []
        for email in parsed["emails"]:
            if email in existing:
                continue
            existing.add(email)
            unique_new.append(email)

        now_iso = datetime.now(timezone.utc).isoformat()
        for email in unique_new:
            all_new_rows.append(
                {
                    "email": email,
                    "reason": args.reason,
                    "source": args.source,
                    "added_at": now_iso,
                    "notes": f"Auto-added from {input_path.name}",
                }
            )

        per_file[str(input_path)] = {
            "rows": parsed["rows"],
            "rows_without_email": parsed["rows_without_email"],
            "emails_flagged_unsubscribe": parsed["emails_detected"],
            "new_suppressions_added": len(unique_new),
        }

    _append_suppression_rows(suppression_path, all_new_rows)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "suppression_list": str(suppression_path),
        "new_rows_added": len(all_new_rows),
        "files": per_file,
    }

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"SUPPRESSION_UPDATE_OK: added={len(all_new_rows)} report={report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
