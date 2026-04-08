from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path
from typing import Any

import requests


REQUIRED_COLUMNS = [
    "date",
    "impressions",
    "clicks",
    "spend",
    "revenue",
    "leads",
    "qualified_leads",
]


def get_path_value(data: dict[str, Any], path: str) -> Any:
    current: Any = data
    for part in path.split("."):
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return ""
    return current


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def normalize_row(
    row: dict[str, Any],
    field_map: dict[str, str] | None = None,
    static_values: dict[str, Any] | None = None,
) -> dict[str, Any]:
    field_map = field_map or {}
    static_values = static_values or {}

    out: dict[str, Any] = {}
    for col in REQUIRED_COLUMNS:
        if col in static_values:
            out[col] = static_values[col]
            continue

        source = field_map.get(col, col)
        if isinstance(source, str) and source.startswith("const:"):
            out[col] = source.replace("const:", "", 1)
            continue

        if isinstance(source, str) and "." in source:
            out[col] = get_path_value(row, source)
        else:
            out[col] = row.get(str(source), "")
    return out


def fetch_http_json(channel_name: str, channel_cfg: dict[str, Any]) -> list[dict[str, Any]]:
    endpoint_env = channel_cfg.get("endpoint_env")
    token_env = channel_cfg.get("token_env")
    method = str(channel_cfg.get("method", "GET")).upper()

    endpoint = os.getenv(str(endpoint_env or ""), "").strip()
    token = os.getenv(str(token_env or ""), "").strip()

    if not endpoint:
        print(f"[skip] {channel_name}: missing endpoint env {endpoint_env}")
        return []

    headers = {
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    timeout_seconds = int(channel_cfg.get("timeout_seconds", 30))
    field_map = channel_cfg.get("field_map") if isinstance(channel_cfg.get("field_map"), dict) else {}
    static_values = (
        channel_cfg.get("static_values") if isinstance(channel_cfg.get("static_values"), dict) else {}
    )

    if method == "POST":
        body = channel_cfg.get("body", {})
        response = requests.post(endpoint, headers=headers, json=body, timeout=timeout_seconds)
    else:
        response = requests.get(endpoint, headers=headers, timeout=timeout_seconds)

    response.raise_for_status()
    payload = response.json()

    if isinstance(payload, dict):
        data_key = channel_cfg.get("data_key")
        if data_key and isinstance(payload.get(data_key), list):
            rows = payload[data_key]
        elif isinstance(payload.get("data"), list):
            rows = payload["data"]
        else:
            rows = []
    elif isinstance(payload, list):
        rows = payload
    else:
        rows = []

    normalized = [
        normalize_row(r, field_map=field_map, static_values=static_values)
        for r in rows
        if isinstance(r, dict)
    ]
    print(f"[ok] {channel_name}: fetched {len(normalized)} rows")
    return normalized


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=REQUIRED_COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def run(args: argparse.Namespace) -> None:
    repo_root = Path(__file__).resolve().parents[2]
    config_path = (repo_root / args.config).resolve()
    output_dir = (repo_root / args.output_dir).resolve()

    config = load_json(config_path)
    channels = config.get("channels", {})

    if not isinstance(channels, dict) or not channels:
        raise SystemExit("No channels configured in connectors config.")

    for channel_name, channel_cfg in channels.items():
        if not isinstance(channel_cfg, dict):
            continue

        mode = str(channel_cfg.get("mode", "http_json"))
        if mode != "http_json":
            print(f"[skip] {channel_name}: unsupported mode '{mode}'")
            continue

        try:
            rows = fetch_http_json(channel_name, channel_cfg)
        except requests.RequestException as err:
            print(f"[error] {channel_name}: {err}")
            continue

        if not rows:
            continue

        out_csv = output_dir / f"{channel_name}.csv"
        write_csv(out_csv, rows)
        print(f"[write] {out_csv}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetch live channel metrics into local CSV files for ads automation."
    )
    parser.add_argument("--config", default="docs/ads/CONNECTORS_CONFIG.json")
    parser.add_argument("--output-dir", default="docs/ads/channel_exports")
    run(parser.parse_args())
