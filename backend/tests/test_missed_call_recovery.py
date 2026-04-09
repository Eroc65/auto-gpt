from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from typing import cast

from app.core.auth import hash_password
from app.core.db import Base, SessionLocal, engine
from app.main import app
from app.models.core import Organization, User

_EMAIL = "missedcall@example.com"
_PASSWORD = "missedcallpass"
_ORG = "Missed Call Org"


def _auth_headers(client: TestClient):
    resp = client.post("/api/auth/login", data={"username": _EMAIL, "password": _PASSWORD})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def setup_module():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org = Organization(name=_ORG)
        db.add(org)
        db.flush()
        db.add(User(email=_EMAIL, hashed_password=hash_password(_PASSWORD), organization_id=org.id))
        db.commit()
    finally:
        db.close()


def _get_org_id() -> int:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _ORG).first()
        assert org is not None
        return int(cast(int, org.id))
    finally:
        db.close()


def _get_org_intake_key() -> str:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _ORG).first()
        assert org is not None
        return str(cast(str, org.intake_key))
    finally:
        db.close()


def test_missed_call_creates_lead_and_immediate_reminder():
    client = TestClient(app)
    org_id = _get_org_id()
    headers = _auth_headers(client)

    resp = client.post(
        f"/api/leads/intake/missed-call/{org_id}",
        json={"phone": "555-4000", "name": "Caller A", "call_sid": "CA123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["deduplicated"] is False
    assert body["reminder_created"] is True
    assert body["lead"]["source"] == "missed_call"
    assert "source_tag:public_missed_call" in (body["lead"]["raw_message"] or "")

    lead_id = body["lead"]["id"]
    reminders = client.get(f"/api/reminders?lead_id={lead_id}", headers=headers)
    assert reminders.status_code == 200
    assert len(reminders.json()) >= 1


def test_missed_call_deduplicates_recent_phone_and_no_extra_reminder():
    client = TestClient(app)
    org_id = _get_org_id()
    headers = _auth_headers(client)

    first = client.post(
        f"/api/leads/intake/missed-call/{org_id}",
        json={"phone": "555-4001", "name": "Caller B", "call_sid": "CA200"},
    )
    assert first.status_code == 200
    lead_id = first.json()["lead"]["id"]

    before = client.get(f"/api/reminders?lead_id={lead_id}", headers=headers).json()

    second = client.post(
        f"/api/leads/intake/missed-call/{org_id}",
        json={"phone": "555-4001", "raw_message": "Second missed call", "call_sid": "CA201"},
    )
    assert second.status_code == 200
    body = second.json()
    assert body["deduplicated"] is True
    assert body["reminder_created"] is False
    assert body["lead"]["id"] == lead_id

    after = client.get(f"/api/reminders?lead_id={lead_id}", headers=headers).json()
    assert len(after) == len(before)


def test_missed_call_unknown_org_404():
    client = TestClient(app)
    resp = client.post(
        "/api/leads/intake/missed-call/99999",
        json={"phone": "555-4999"},
    )
    assert resp.status_code == 404


def test_missed_call_by_key_creates_lead():
    client = TestClient(app)
    intake_key = _get_org_intake_key()

    resp = client.post(
        f"/api/leads/intake/missed-call/by-key/{intake_key}",
        json={"phone": "555-4555", "name": "Caller Key", "call_sid": "CAKEY1"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["deduplicated"] is False
    assert body["lead"]["source"] == "missed_call"


def test_missed_call_rejects_honeypot_spam():
    client = TestClient(app)
    org_id = _get_org_id()

    resp = client.post(
        f"/api/leads/intake/missed-call/{org_id}",
        json={"phone": "555-4998", "website": "https://spam.example"},
    )
    assert resp.status_code == 422
