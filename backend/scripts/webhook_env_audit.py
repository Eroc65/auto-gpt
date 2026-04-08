from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from sqlalchemy.exc import SQLAlchemyError

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.db import SessionLocal
from app.models.core import Organization


SCOPABLE_VARS = [
    "TWILIO_WEBHOOK_SIGNING_SECRET",
    "RETELL_WEBHOOK_SIGNING_SECRET",
    "ZAPIER_WEBHOOK_SIGNING_SECRET",
    "TWILIO_AUTH_TOKEN",
    "RETELL_WEBHOOK_PROVIDER_TOKEN",
    "ZAPIER_WEBHOOK_PROVIDER_TOKEN",
    "RETELL_API_KEY",
    "ZAPIER_API_KEY",
]


@dataclass
class EnvVarStatus:
    key: str
    source: str
    present: bool


@dataclass
class OrgAudit:
    organization_id: int
    organization_name: str
    intake_key: str
    vars: list[EnvVarStatus]


def _is_truthy(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_present(key: str) -> bool:
    return bool(os.getenv(key, "").strip())


def _resolve_presence(base_key: str, org_id: int) -> EnvVarStatus:
    scoped_key = f"{base_key}_ORG_{org_id}"
    if _env_present(scoped_key):
        return EnvVarStatus(key=scoped_key, source="scoped", present=True)
    if _env_present(base_key):
        return EnvVarStatus(key=base_key, source="global", present=True)
    return EnvVarStatus(key=scoped_key, source="missing", present=False)


def _required_keys(
    require_signing_secrets: bool,
    require_retell_api_key: bool,
    require_zapier_api_key: bool,
) -> list[str]:
    keys: list[str] = []

    if require_signing_secrets:
        keys.extend(
            [
                "TWILIO_WEBHOOK_SIGNING_SECRET",
                "RETELL_WEBHOOK_SIGNING_SECRET",
                "ZAPIER_WEBHOOK_SIGNING_SECRET",
            ]
        )

    if _is_truthy(os.getenv("TWILIO_PROVIDER_SIGNATURE_MODE", "")):
        keys.append("TWILIO_AUTH_TOKEN")

    if _is_truthy(os.getenv("RETELL_PROVIDER_SIGNATURE_MODE", "")):
        keys.append("RETELL_WEBHOOK_PROVIDER_TOKEN")

    if _is_truthy(os.getenv("ZAPIER_PROVIDER_SIGNATURE_MODE", "")):
        keys.append("ZAPIER_WEBHOOK_PROVIDER_TOKEN")

    if require_retell_api_key:
        keys.append("RETELL_API_KEY")

    if require_zapier_api_key:
        keys.append("ZAPIER_API_KEY")

    return keys


def _load_orgs(org_id: int | None) -> list[Organization]:
    db = SessionLocal()
    try:
        q = db.query(Organization)
        if org_id is not None:
            q = q.filter(Organization.id == org_id)
        return q.order_by(Organization.id.asc()).all()
    except SQLAlchemyError as exc:
        raise RuntimeError(f"Failed to query organizations: {exc}") from exc
    finally:
        db.close()


def _audit(orgs: list[Organization], keys: list[str]) -> list[OrgAudit]:
    audits: list[OrgAudit] = []
    for org in orgs:
        org_id = int(org.id)
        var_rows = [_resolve_presence(key, org_id) for key in keys]
        audits.append(
            OrgAudit(
                organization_id=org_id,
                organization_name=str(org.name),
                intake_key=str(org.intake_key),
                vars=var_rows,
            )
        )
    return audits


def _print_text(audits: list[OrgAudit], required_keys: list[str], missing_count: int, check_mode: bool) -> None:
    print("Webhook Env Audit")
    print("================")
    print(f"Required key bases: {', '.join(required_keys) if required_keys else 'none (strict modes disabled)'}")
    print("")

    if not audits:
        print("No organizations found.")
        return

    for audit in audits:
        print(f"Org #{audit.organization_id} | {audit.organization_name} | intake_key={audit.intake_key}")
        for row in audit.vars:
            status = "OK" if row.present else "MISSING"
            print(f"  - {status:7} {row.key} ({row.source})")
        print("")

    if check_mode:
        if missing_count:
            print(f"CHECK FAILED: {missing_count} missing required organization-scoped/global env values")
        else:
            print("CHECK OK: all required environment values are present")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit organization-scoped webhook env vars and optionally fail if required values are missing.",
    )
    parser.add_argument("--org-id", type=int, default=None, help="Limit audit to one organization id")
    parser.add_argument("--check", action="store_true", help="Exit non-zero if required values are missing")
    parser.add_argument(
        "--require-signing-secrets",
        action="store_true",
        help="Also require Twilio/Retell/Zapier HMAC signing secrets per org/global",
    )
    parser.add_argument(
        "--require-retell-api-key",
        action="store_true",
        help="Require Retell API key per org/global (RETELL_API_KEY or RETELL_API_KEY_ORG_<id>)",
    )
    parser.add_argument(
        "--require-zapier-api-key",
        action="store_true",
        help="Require Zapier API key per org/global (ZAPIER_API_KEY or ZAPIER_API_KEY_ORG_<id>)",
    )
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    required_keys = _required_keys(
        require_signing_secrets=args.require_signing_secrets,
        require_retell_api_key=args.require_retell_api_key,
        require_zapier_api_key=args.require_zapier_api_key,
    )
    orgs = _load_orgs(args.org_id)

    keys_for_audit = required_keys if required_keys else SCOPABLE_VARS
    audits = _audit(orgs, keys_for_audit)

    missing_count = 0
    if required_keys:
        for audit in audits:
            for row in audit.vars:
                if not row.present:
                    missing_count += 1

    if args.json:
        payload: dict[str, Any] = {
            "required_key_bases": required_keys,
            "organizations": [
                {
                    "organization_id": audit.organization_id,
                    "organization_name": audit.organization_name,
                    "intake_key": audit.intake_key,
                    "vars": [asdict(v) for v in audit.vars],
                }
                for audit in audits
            ],
            "missing_required_values": missing_count,
            "check_mode": bool(args.check),
        }
        print(json.dumps(payload, indent=2))
    else:
        _print_text(audits, required_keys, missing_count, check_mode=bool(args.check))

    if args.check and missing_count > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
