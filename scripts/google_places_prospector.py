#!/usr/bin/env python3
"""
Compliant local business prospector using Google Places API.

What it does:
- Finds local businesses by query (example: "plumber in Dallas, TX").
- Writes a CRM-ready CSV with business metadata.

What it does not do:
- Does not scrape emails from websites.
- Does not bypass Google Maps terms.

Usage example:
python scripts/google_places_prospector.py \
  --query "plumber in Dallas, TX" \
  --state TX \
  --city Dallas \
  --trade Plumbing \
  --output docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST_REAL.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Dict, List, Optional

TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

CSV_HEADERS = [
    "company_name",
    "contact_first_name",
    "contact_last_name",
    "role",
    "email",
    "phone",
    "website",
    "city",
    "state",
    "zip",
    "trade",
    "employees_est",
    "revenue_band",
    "google_rating",
    "reviews_count",
    "website_quality",
    "has_online_booking",
    "has_chat_widget",
    "has_service_area_pages",
    "last_site_update",
    "lead_score",
    "segment",
    "pain_point",
    "offer_angle",
    "status",
    "next_step",
    "next_touch_date",
    "notes",
]


@dataclass
class PlaceRecord:
    name: str
    website: str
    phone: str
    rating: str
    reviews_count: str
    city: str
    state: str
    zip_code: str


def _http_get_json(url: str, params: Dict[str, str]) -> Dict:
    query = urllib.parse.urlencode(params)
    full_url = f"{url}?{query}"
    req = urllib.request.Request(full_url, headers={"User-Agent": "GoFieldWiseProspector/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def _extract_city_state_zip(formatted_address: str) -> tuple[str, str, str]:
    if not formatted_address:
        return "", "", ""

    parts = [p.strip() for p in formatted_address.split(",")]
    if len(parts) < 3:
        return "", "", ""

    city = parts[-3] if len(parts) >= 3 else ""
    state_zip = parts[-2] if len(parts) >= 2 else ""

    state = ""
    zip_code = ""
    state_zip_parts = state_zip.split()
    if len(state_zip_parts) >= 1:
        state = state_zip_parts[0]
    if len(state_zip_parts) >= 2:
        zip_code = state_zip_parts[1]

    return city, state, zip_code


def _fetch_place_details(api_key: str, place_id: str) -> Dict:
    params = {
        "key": api_key,
        "place_id": place_id,
        "fields": "name,website,formatted_phone_number,rating,user_ratings_total,formatted_address",
    }
    data = _http_get_json(DETAILS_URL, params)
    return data.get("result", {})


def fetch_places(api_key: str, query: str, max_results: int) -> List[PlaceRecord]:
    records: List[PlaceRecord] = []
    seen_names = set()
    page_token: Optional[str] = None

    while len(records) < max_results:
        params = {"key": api_key, "query": query}
        if page_token:
            params["pagetoken"] = page_token
            # Google can require a short delay before next_page_token becomes valid.
            time.sleep(2)

        data = _http_get_json(TEXT_SEARCH_URL, params)
        status = data.get("status")
        if status not in {"OK", "ZERO_RESULTS"}:
            raise RuntimeError(f"Google Places API error: {status} - {data.get('error_message', '')}")

        results = data.get("results", [])
        for result in results:
            if len(records) >= max_results:
                break

            place_id = result.get("place_id")
            if not place_id:
                continue

            details = _fetch_place_details(api_key, place_id)
            name = details.get("name", "").strip()
            if not name or name.lower() in seen_names:
                continue

            seen_names.add(name.lower())

            address = details.get("formatted_address", "")
            city, state, zip_code = _extract_city_state_zip(address)

            record = PlaceRecord(
                name=name,
                website=details.get("website", ""),
                phone=details.get("formatted_phone_number", ""),
                rating=str(details.get("rating", "")) if details.get("rating") is not None else "",
                reviews_count=str(details.get("user_ratings_total", ""))
                if details.get("user_ratings_total") is not None
                else "",
                city=city,
                state=state,
                zip_code=zip_code,
            )
            records.append(record)

        page_token = data.get("next_page_token")
        if not page_token:
            break

    return records


def _score_lead(rating: str, reviews_count: str, website: str) -> int:
    score = 60
    if website:
        score += 10

    try:
        r = float(rating)
        if r < 4.3:
            score += 8
        elif r < 4.6:
            score += 5
    except ValueError:
        pass

    try:
        rc = int(reviews_count)
        if rc < 40:
            score += 12
        elif rc < 80:
            score += 8
        else:
            score += 4
    except ValueError:
        score += 6

    return min(score, 95)


def _segment_from_score(score: int) -> str:
    if score >= 85:
        return "A"
    if score >= 75:
        return "B"
    return "C"


def write_csv(output_path: str, records: List[PlaceRecord], default_city: str, default_state: str, trade: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()

        for r in records:
            score = _score_lead(r.rating, r.reviews_count, r.website)
            segment = _segment_from_score(score)

            writer.writerow(
                {
                    "company_name": r.name,
                    "contact_first_name": "",
                    "contact_last_name": "",
                    "role": "Owner",
                    "email": "",
                    "phone": r.phone,
                    "website": r.website,
                    "city": r.city or default_city,
                    "state": r.state or default_state,
                    "zip": r.zip_code,
                    "trade": trade,
                    "employees_est": "",
                    "revenue_band": "",
                    "google_rating": r.rating,
                    "reviews_count": r.reviews_count,
                    "website_quality": "Needs review",
                    "has_online_booking": "Unknown",
                    "has_chat_widget": "Unknown",
                    "has_service_area_pages": "Unknown",
                    "last_site_update": "Unknown",
                    "lead_score": score,
                    "segment": segment,
                    "pain_point": "Website conversion and follow-up gap",
                    "offer_angle": "LeadLaunch Starter",
                    "status": "To Contact",
                    "next_step": "Research best contact path",
                    "next_touch_date": "",
                    "notes": "Generated from Google Places API. Add contact manually.",
                }
            )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build a compliant local business prospect list.")
    parser.add_argument("--query", required=True, help='Search query, e.g. "plumber in Dallas, TX"')
    parser.add_argument("--city", required=True, help="Default city for records missing city")
    parser.add_argument("--state", required=True, help="Default state for records missing state")
    parser.add_argument("--trade", default="Plumbing", help="Trade label in output CSV")
    parser.add_argument("--max-results", type=int, default=60, help="Maximum records to fetch")
    parser.add_argument("--output", required=True, help="Output CSV path")
    parser.add_argument(
        "--api-key-env",
        default="GOOGLE_MAPS_API_KEY",
        help="Environment variable name containing the Google Places API key",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    api_key = os.getenv(args.api_key_env, "").strip()
    if not api_key:
        print(
            f"Missing API key. Set environment variable {args.api_key_env} with a valid Google Places API key.",
            file=sys.stderr,
        )
        return 1

    try:
        records = fetch_places(api_key=api_key, query=args.query, max_results=args.max_results)
        write_csv(
            output_path=args.output,
            records=records,
            default_city=args.city,
            default_state=args.state,
            trade=args.trade,
        )
    except Exception as exc:  # noqa: BLE001
        print(f"Failed: {exc}", file=sys.stderr)
        return 1

    print(f"Wrote {len(records)} records to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
