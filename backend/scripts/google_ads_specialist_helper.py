from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from datetime import date, timedelta


@dataclass
class DateWindow:
    label: str
    start_date: str
    end_date: str
    previous_start_date: str
    previous_end_date: str


def _monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _sunday(d: date) -> date:
    return _monday(d) + timedelta(days=6)


def _month_bounds(year: int, month: int) -> tuple[date, date]:
    start = date(year, month, 1)
    if month == 12:
        next_start = date(year + 1, 1, 1)
    else:
        next_start = date(year, month + 1, 1)
    end = next_start - timedelta(days=1)
    return start, end


def _quarter_start(year: int, quarter: int) -> date:
    month = (quarter - 1) * 3 + 1
    return date(year, month, 1)


def _quarter_bounds(year: int, quarter: int) -> tuple[date, date]:
    start = _quarter_start(year, quarter)
    if quarter == 4:
        next_start = date(year + 1, 1, 1)
    else:
        next_start = _quarter_start(year, quarter + 1)
    return start, next_start - timedelta(days=1)


def resolve_window(timeframe: str, today: date | None = None) -> DateWindow:
    today = today or date.today()
    key = timeframe.strip().lower()

    if key == "yesterday":
        start = today - timedelta(days=1)
        end = start
    elif key == "last 28 days":
        end = today - timedelta(days=1)
        start = end - timedelta(days=27)
    elif key == "last week":
        this_week_start = _monday(today)
        end = this_week_start - timedelta(days=1)
        start = end - timedelta(days=6)
    elif key == "last month":
        first_this_month = date(today.year, today.month, 1)
        last_day_prev = first_this_month - timedelta(days=1)
        start = date(last_day_prev.year, last_day_prev.month, 1)
        end = last_day_prev
    elif key == "last quarter":
        current_quarter = ((today.month - 1) // 3) + 1
        if current_quarter == 1:
            year = today.year - 1
            q = 4
        else:
            year = today.year
            q = current_quarter - 1
        start, end = _quarter_bounds(year, q)
    elif key == "last year":
        start = date(today.year - 1, 1, 1)
        end = date(today.year - 1, 12, 31)
    else:
        raise ValueError(
            "Unsupported timeframe. Use: yesterday, last week, last month, last 28 days, last quarter, last year"
        )

    length = (end - start).days + 1
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=length - 1)

    return DateWindow(
        label=key,
        start_date=start.isoformat(),
        end_date=end.isoformat(),
        previous_start_date=prev_start.isoformat(),
        previous_end_date=prev_end.isoformat(),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Resolve Google Ads reporting date windows with previous period.")
    parser.add_argument("--timeframe", required=True)
    parser.add_argument("--today", default="", help="Optional YYYY-MM-DD override")
    args = parser.parse_args()

    today = date.fromisoformat(args.today) if args.today else None
    window = resolve_window(args.timeframe, today=today)
    print(json.dumps(asdict(window), indent=2))


if __name__ == "__main__":
    main()
