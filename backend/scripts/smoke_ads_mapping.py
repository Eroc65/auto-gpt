from __future__ import annotations

import json
from pathlib import Path

from ads_fetch_live import normalize_row


def run() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    fixture_map = {
        "google": repo_root / "docs" / "ads" / "sample_payloads" / "google_native.json",
        "microsoft": repo_root / "docs" / "ads" / "sample_payloads" / "microsoft_native.json",
        "meta": repo_root / "docs" / "ads" / "sample_payloads" / "meta_native.json",
    }

    config_path = repo_root / "docs" / "ads" / "CONNECTORS_CONFIG.json"
    cfg = json.loads(config_path.read_text(encoding="utf-8"))

    for channel, fixture_path in fixture_map.items():
        payload = json.loads(fixture_path.read_text(encoding="utf-8"))
        rows = payload.get("data", [])
        if not rows:
            print(f"[skip] {channel}: no sample rows")
            continue

        channel_cfg = cfg.get("channels", {}).get(channel, {})
        field_map = channel_cfg.get("field_map", {})

        normalized = normalize_row(rows[0], field_map=field_map)
        print(f"[{channel}] -> {normalized}")


if __name__ == "__main__":
    run()
