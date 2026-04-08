import base64
import hashlib
import hmac
import json
from typing import cast

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.core.db import Base, SessionLocal, engine
from app.main import app
from app.models.core import Lead, Organization, User


_AUTH_EMAIL = "support@frontdeskpro.com"
_AUTH_PASSWORD = "platformpass"
_AUTH_ORG = "Platform Features Org"


def setup_module() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org = Organization(name=_AUTH_ORG)
        db.add(org)
        db.flush()

        owner = User(
            email=_AUTH_EMAIL,
            hashed_password=hash_password(_AUTH_PASSWORD),
            role="owner",
            organization_id=org.id,
        )
        db.add(owner)
        db.commit()
    finally:
        db.close()


def _auth_headers() -> dict[str, str]:
    with TestClient(app) as client:
        resp = client.post(
            "/api/auth/login",
            data={"username": _AUTH_EMAIL, "password": _AUTH_PASSWORD},
        )
        assert resp.status_code == 200
        token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_public_status_endpoint() -> None:
    with TestClient(app) as client:
        resp = client.get("/api/status")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["features"]["ai_guide"] is True


def test_ai_guide_toggle_roundtrip() -> None:
    headers = _auth_headers()
    with TestClient(app) as client:
        get_before = client.get("/api/org/ai-guide", headers=headers)
        assert get_before.status_code == 200

        update = client.patch(
            "/api/org/ai-guide",
            json={"enabled": True, "stage": "phase_1"},
            headers=headers,
        )
        assert update.status_code == 200
        assert update.json()["enabled"] is True
        assert update.json()["stage"] == "phase_1"

        get_after = client.get("/api/org/ai-guide", headers=headers)
        assert get_after.status_code == 200
        assert get_after.json()["enabled"] is True


def test_contextual_help_articles_create_and_filter() -> None:
    headers = _auth_headers()
    with TestClient(app) as client:
        create = client.post(
            "/api/help/articles",
            json={
                "slug": "jobs-dispatch-basics",
                "title": "Dispatch Basics",
                "category": "scheduling",
                "context_key": "jobs_dispatch",
                "body": "Use dispatch to assign techs quickly and avoid overlaps.",
            },
            headers=headers,
        )
        assert create.status_code == 201

        listed = client.get("/api/help/articles?context_key=jobs_dispatch", headers=headers)
        assert listed.status_code == 200
        assert len(listed.json()) >= 1


def test_tribal_coaching_snippets_create_and_list() -> None:
    headers = _auth_headers()
    with TestClient(app) as client:
        create = client.post(
            "/api/coaching/snippets",
            json={
                "title": "No Heat Winter Triage",
                "trade": "hvac",
                "issue_pattern": "No heat call in winter",
                "senior_tip": "Verify thermostat mode, power, then ignition path before replacing parts.",
                "checklist": "Thermostat;Breaker;Ignition;Airflow",
            },
            headers=headers,
        )
        assert create.status_code == 201

        listed = client.get("/api/coaching/snippets?trade=hvac", headers=headers)
        assert listed.status_code == 200
        assert len(listed.json()) >= 1


def test_marketing_service_packages_endpoint() -> None:
    headers = _auth_headers()
    with TestClient(app) as client:
        resp = client.get("/api/marketing/service-packages", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 3
        package_codes = {pkg["code"] for pkg in data}
        assert "ai_visual_ads_growth" in package_codes
        visual_ads_pkg = next(pkg for pkg in data if pkg["code"] == "ai_visual_ads_growth")
        assert visual_ads_pkg["monthly_price_usd"] == 1299
        assert isinstance(visual_ads_pkg.get("checkout_url"), str)


def test_retell_call_ended_missed_call_creates_or_updates_lead() -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    with TestClient(app) as client:
        resp = client.post(
            f"/api/integrations/retell/call-ended/{org_id}",
            json={
                "call_id": "retell-call-1",
                "from_phone": "+16025550101",
                "caller_name": "Retell Caller",
                "call_status": "missed",
                "summary": "Customer called after hours",
                "transcript": "Need emergency plumbing help",
                "missed_call": True,
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["action"] == "missed_call_recovered"
        assert isinstance(body["lead_id"], int)


def test_zapier_lead_by_key_creates_lead() -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        intake_key = str(org.intake_key)
    finally:
        db.close()

    with TestClient(app) as client:
        resp = client.post(
            f"/api/integrations/zapier/leads/by-key/{intake_key}",
            json={
                "name": "Zapier Lead",
                "phone": "+16025550102",
                "email": "zapier@example.com",
                "service": "water heater",
                "notes": "Requested same-day service",
                "source": "zapier",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["ok"] is True

    db = SessionLocal()
    try:
        created = (
            db.query(Lead)
            .filter(Lead.name == "Zapier Lead")
            .order_by(Lead.id.desc())
            .first()
        )
        assert created is not None
    finally:
        db.close()


def test_twilio_voice_missed_call_creates_or_updates_lead() -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    with TestClient(app) as client:
        resp = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            json={
                "call_sid": "CA123456789",
                "from_phone": "+16025550103",
                "call_status": "no-answer",
                "caller_name": "Twilio Caller",
                "recording_url": "https://recordings.example/test.wav",
            },
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["action"] == "missed_call_recovered"
        assert isinstance(body["lead_id"], int)


def test_twilio_voice_signature_required_when_secret_is_set(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    payload = {
        "call_sid": "CA-SIGNED-1",
        "from_phone": "+16025550104",
        "call_status": "no-answer",
        "caller_name": "Signed Caller",
    }
    body = json.dumps(payload, separators=(",", ":"))

    monkeypatch.setenv("TWILIO_WEBHOOK_SIGNING_SECRET", "twilio-test-secret")
    signature = hmac.new(
        b"twilio-test-secret",
        body.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    with TestClient(app) as client:
        missing_sig = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            content=body,
            headers={"Content-Type": "application/json"},
        )
        assert missing_sig.status_code == 401

        ok_resp = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            content=body,
            headers={
                "Content-Type": "application/json",
                "X-Twilio-Signature": f"sha256={signature}",
            },
        )
        assert ok_resp.status_code == 200


def test_twilio_provider_signature_mode_requires_valid_signature(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    payload = {
        "call_sid": "CA-PROVIDER-1",
        "from_phone": "+16025550106",
        "call_status": "no-answer",
        "caller_name": "Provider Signature Caller",
    }

    monkeypatch.setenv("TWILIO_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "provider-token-123")

    with TestClient(app) as client:
        missing_sig = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            json=payload,
        )
        assert missing_sig.status_code == 401

        url = str(client.base_url) + f"/api/integrations/twilio/voice/{org_id}"
        expected = base64.b64encode(
            hmac.new(
                b"provider-token-123",
                url.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("utf-8")

        ok_resp = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            json=payload,
            headers={
                "X-Twilio-Signature": expected,
            },
        )
        assert ok_resp.status_code == 200


def test_retell_provider_mode_requires_provider_token(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    monkeypatch.setenv("RETELL_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("RETELL_WEBHOOK_PROVIDER_TOKEN", "retell-provider-token")

    payload = {
        "call_id": "retell-provider-call",
        "from_phone": "+16025550107",
        "call_status": "missed",
        "missed_call": True,
    }

    with TestClient(app) as client:
        missing = client.post(
            f"/api/integrations/retell/call-ended/{org_id}",
            json=payload,
        )
        assert missing.status_code == 401

        ok_resp = client.post(
            f"/api/integrations/retell/call-ended/{org_id}",
            json=payload,
            headers={
                "X-Retell-Token": "retell-provider-token",
            },
        )
        assert ok_resp.status_code == 200


def test_zapier_provider_mode_requires_provider_token(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        intake_key = str(org.intake_key)
    finally:
        db.close()

    monkeypatch.setenv("ZAPIER_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("ZAPIER_WEBHOOK_PROVIDER_TOKEN", "zapier-provider-token")

    payload = {
        "name": "Zapier Strict Lead",
        "phone": "+16025550108",
        "source": "zapier",
    }

    with TestClient(app) as client:
        missing = client.post(
            f"/api/integrations/zapier/leads/by-key/{intake_key}",
            json=payload,
        )
        assert missing.status_code == 401

        ok_resp = client.post(
            f"/api/integrations/zapier/leads/by-key/{intake_key}",
            json=payload,
            headers={
                "X-Zapier-Token": "zapier-provider-token",
            },
        )
        assert ok_resp.status_code == 200


def test_twilio_provider_mode_uses_org_scoped_auth_token(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    payload = {
        "call_sid": "CA-PROVIDER-SCOPED-1",
        "from_phone": "+16025550109",
        "call_status": "no-answer",
    }

    monkeypatch.setenv("TWILIO_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "global-token-should-not-match")
    monkeypatch.setenv(f"TWILIO_AUTH_TOKEN_ORG_{org_id}", "org-scoped-token")

    with TestClient(app) as client:
        url = str(client.base_url) + f"/api/integrations/twilio/voice/{org_id}"
        expected = base64.b64encode(
            hmac.new(
                b"org-scoped-token",
                url.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("utf-8")

        ok_resp = client.post(
            f"/api/integrations/twilio/voice/{org_id}",
            json=payload,
            headers={
                "X-Twilio-Signature": expected,
            },
        )
        assert ok_resp.status_code == 200


def test_retell_provider_mode_uses_org_scoped_token(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
    finally:
        db.close()

    monkeypatch.setenv("RETELL_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("RETELL_WEBHOOK_PROVIDER_TOKEN", "wrong-global-token")
    monkeypatch.setenv(f"RETELL_WEBHOOK_PROVIDER_TOKEN_ORG_{org_id}", "retell-org-token")

    payload = {
        "call_id": "retell-provider-scoped",
        "from_phone": "+16025550110",
        "call_status": "missed",
        "missed_call": True,
    }

    with TestClient(app) as client:
        ok_resp = client.post(
            f"/api/integrations/retell/call-ended/{org_id}",
            json=payload,
            headers={
                "X-Retell-Token": "retell-org-token",
            },
        )
        assert ok_resp.status_code == 200


def test_zapier_provider_mode_uses_org_scoped_token(monkeypatch) -> None:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        org_id = int(cast(int, org.id))
        intake_key = str(org.intake_key)
    finally:
        db.close()

    monkeypatch.setenv("ZAPIER_PROVIDER_SIGNATURE_MODE", "true")
    monkeypatch.setenv("ZAPIER_WEBHOOK_PROVIDER_TOKEN", "wrong-global-token")
    monkeypatch.setenv(f"ZAPIER_WEBHOOK_PROVIDER_TOKEN_ORG_{org_id}", "zapier-org-token")

    payload = {
        "name": "Zapier Scoped Lead",
        "phone": "+16025550111",
        "source": "zapier",
    }

    with TestClient(app) as client:
        ok_resp = client.post(
            f"/api/integrations/zapier/leads/by-key/{intake_key}",
            json=payload,
            headers={
                "X-Zapier-Token": "zapier-org-token",
            },
        )
        assert ok_resp.status_code == 200


def test_zapier_push_lead_sends_outbound_webhook(monkeypatch) -> None:
    headers = _auth_headers()

    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _AUTH_ORG).first()
        assert org is not None
        lead = Lead(
            name="Outbound Zapier Lead",
            phone="+16025550105",
            email="outbound-zapier@example.com",
            source="manual",
            status="new",
            raw_message="Needs urgent repair",
            organization_id=int(cast(int, org.id)),
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        lead_id = int(cast(int, lead.id))
    finally:
        db.close()

    monkeypatch.setenv("ZAPIER_LEAD_WEBHOOK_URL", "https://hooks.zapier.com/mock/lead")
    monkeypatch.setenv("ZAPIER_OUTBOUND_SHARED_SECRET", "outbound-secret")

    captured: dict[str, object] = {}

    class _Resp:
        status_code = 200
        text = "ok"

    def _fake_post(url: str, *, json: object, headers: dict[str, str], timeout: float):
        captured["url"] = url
        captured["json"] = json
        captured["headers"] = headers
        captured["timeout"] = timeout
        return _Resp()

    monkeypatch.setattr("app.api.platform.httpx.post", _fake_post)

    with TestClient(app) as client:
        resp = client.post(
            f"/api/integrations/zapier/push/lead/{lead_id}",
            json={"workflow": "lead_created", "include_raw_message": True},
            headers=headers,
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["ok"] is True
        assert body["lead_id"] == lead_id

    assert captured["url"] == "https://hooks.zapier.com/mock/lead"
    payload = cast(dict[str, object], captured["json"])
    assert payload["event_type"] == "lead_created"
    lead_payload = cast(dict[str, object], payload["lead"])
    assert lead_payload["id"] == lead_id
    assert lead_payload["raw_message"] == "Needs urgent repair"
    outbound_headers = cast(dict[str, str], captured["headers"])
    assert outbound_headers.get("X-FrontDesk-Secret") == "outbound-secret"
