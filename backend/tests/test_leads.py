"""Tests for the Lead intake vertical slice.

Covers:
- Public intake (no auth)
- Auth required for management routes
- State machine transitions (valid + invalid)
- Convert to Customer + Job
- Org scoping (cannot see other org's leads)
"""
import uuid
from typing import cast

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.db import Base, SessionLocal, engine
from app.core.auth import hash_password
from app.main import app
from app.models.core import Organization, User

_EMAIL = "leadstest@example.com"
_PASSWORD = "leadspass123"
_ORG_NAME = "Leads Test Org"

_OTHER_EMAIL = "other_leads@example.com"
_OTHER_PASSWORD = "otherpass123"
_OTHER_ORG = "Other Leads Org"


@pytest.fixture(scope="module", autouse=True)
def _setup_leads_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org = Organization(name=_ORG_NAME)
        other_org = Organization(name=_OTHER_ORG)
        db.add(org)
        db.add(other_org)
        db.flush()

        db.add(User(
            email=_EMAIL,
            hashed_password=hash_password(_PASSWORD),
            organization_id=org.id,
        ))
        db.add(User(
            email=_OTHER_EMAIL,
            hashed_password=hash_password(_OTHER_PASSWORD),
            organization_id=other_org.id,
        ))
        db.commit()
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def org_id():
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _ORG_NAME).first()
        assert org is not None
        return int(cast(int, org.id))
    finally:
        db.close()


@pytest.fixture(scope="module")
def org_intake_key():
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _ORG_NAME).first()
        assert org is not None
        return str(cast(str, org.intake_key))
    finally:
        db.close()


@pytest.fixture(scope="module")
def other_org_id():
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _OTHER_ORG).first()
        assert org is not None
        return int(cast(int, org.id))
    finally:
        db.close()


@pytest.fixture(scope="module")
def auth_headers(client):
    resp = client.post(
        "/api/auth/login",
        data={"username": _EMAIL, "password": _PASSWORD},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def other_auth_headers(client):
    resp = client.post(
        "/api/auth/login",
        data={"username": _OTHER_EMAIL, "password": _OTHER_PASSWORD},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Public intake
# ---------------------------------------------------------------------------

def test_public_intake_creates_lead(client, org_id):
    resp = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "John Plumber", "phone": "555-0100", "source": "web_form",
              "raw_message": "My basement is flooded"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "new"
    assert body["name"] == "John Plumber"
    assert body["organization_id"] == org_id
    assert body["source"] == "web_form"
    assert "source_tag:public_intake_org" in (body["raw_message"] or "")


def test_public_intake_unknown_org_returns_404(client):
    resp = client.post(
        "/api/leads/intake/99999",
        json={"name": "Ghost", "source": "web_form"},
    )
    assert resp.status_code == 404


def test_public_intake_no_auth_needed(client, org_id):
    """Intake endpoint must work without Authorization header."""
    resp = client.post(
        f"/api/leads/intake/{org_id}",
        json={"phone": "555-0101", "source": "missed_call"},
    )
    assert resp.status_code == 201


def test_public_intake_by_key_creates_lead(client, org_intake_key):
    resp = client.post(
        f"/api/leads/intake/by-key/{org_intake_key}",
        json={"name": "Key Routed", "phone": "555-0199", "source": "manual"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "new"
    assert body["name"] == "Key Routed"
    assert body["source"] == "web_form"
    assert "source_tag:public_intake_key" in (body["raw_message"] or "")


def test_public_intake_rejects_honeypot_spam(client, org_id):
    resp = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Spam Bot", "phone": "555-7777", "website": "https://spam.example"},
    )
    assert resp.status_code == 422


def test_public_intake_rejects_link_spam(client, org_id):
    resp = client.post(
        f"/api/leads/intake/{org_id}",
        json={
            "name": "Spam Links",
            "raw_message": "Visit https://a.example now and https://b.example fast",
        },
    )
    assert resp.status_code == 422


def test_public_intake_by_key_unknown_org_returns_404(client):
    resp = client.post(
        "/api/leads/intake/by-key/org_missing_key",
        json={"name": "Ghost", "source": "web_form"},
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Auth required on management routes
# ---------------------------------------------------------------------------

def test_list_leads_requires_auth(client):
    assert client.get("/api/leads").status_code == 401


def test_get_lead_requires_auth(client):
    assert client.get("/api/leads/1").status_code == 401


def test_patch_status_requires_auth(client):
    assert client.patch("/api/leads/1/status", json={"status": "contacted"}).status_code == 401


def test_convert_requires_auth(client):
    assert client.post("/api/leads/1/convert").status_code == 401


def test_activity_requires_auth(client):
    assert client.get("/api/leads/1/activity").status_code == 401


# ---------------------------------------------------------------------------
# Authenticated list / get
# ---------------------------------------------------------------------------

def test_list_leads(client, auth_headers):
    resp = client.get("/api/leads", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1


def test_get_lead_detail(client, auth_headers, org_id):
    # Create a lead to look up
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Detail Test", "phone": "555-0102", "source": "manual"},
    )
    assert created.status_code == 201
    lead_id = created.json()["id"]

    resp = client.get(f"/api/leads/{lead_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == lead_id


# ---------------------------------------------------------------------------
# State machine transitions
# ---------------------------------------------------------------------------

def test_valid_transition_new_to_contacted(client, auth_headers, org_id):
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Transition Test", "phone": "555-0200", "source": "web_form"},
    )
    lead_id = created.json()["id"]

    resp = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "contacted"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "contacted"


def test_invalid_transition_new_to_converted(client, auth_headers, org_id):
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Bad Transition", "phone": "555-0201", "source": "web_form"},
    )
    lead_id = created.json()["id"]

    resp = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "converted"},
        headers=auth_headers,
    )
    assert resp.status_code == 422
    assert "converted" in resp.json()["detail"].lower() or "new" in resp.json()["detail"].lower()


def test_terminal_state_rejects_further_transition(client, auth_headers, org_id):
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Terminal Test", "phone": "555-0202", "source": "web_form"},
    )
    lead_id = created.json()["id"]

    # Dismiss it
    client.patch(f"/api/leads/{lead_id}/status", json={"status": "dismissed"}, headers=auth_headers)

    # Try to move dismissed lead further
    resp = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "contacted"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_lead_activity_returns_lifecycle_events(client, auth_headers, org_id):
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Activity Test", "phone": "555-0203", "source": "web_form"},
    )
    assert created.status_code == 201
    lead_id = created.json()["id"]

    status_resp = client.patch(
        f"/api/leads/{lead_id}/status",
        json={"status": "contacted"},
        headers=auth_headers,
    )
    assert status_resp.status_code == 200

    activity = client.get(f"/api/leads/{lead_id}/activity", headers=auth_headers)
    assert activity.status_code == 200
    events = activity.json()
    assert len(events) >= 2
    actions = [event["action"] for event in events]
    assert "created" in actions
    assert "status_updated" in actions

    filtered = client.get(
        f"/api/leads/{lead_id}/activity?action=status_updated&since_hours=24",
        headers=auth_headers,
    )
    assert filtered.status_code == 200
    filtered_events = filtered.json()
    assert len(filtered_events) >= 1
    assert all(event["action"] == "status_updated" for event in filtered_events)
    assert any(event.get("actor_email") == _EMAIL for event in filtered_events)


# ---------------------------------------------------------------------------
# Convert to Customer + Job
# ---------------------------------------------------------------------------

def test_convert_lead_creates_customer_and_job(client, auth_headers, org_id):
    phone = f"555-{uuid.uuid4().hex[:4]}"
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={
            "name": "Convert Me",
            "phone": phone,
            "source": "web_form",
            "raw_message": "Leaky faucet in kitchen",
        },
    )
    lead_id = created.json()["id"]

    resp = client.post(f"/api/leads/{lead_id}/convert", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["lead_id"] == lead_id
    assert body["customer_id"] > 0
    assert body["job_id"] > 0


def test_convert_deduplicates_customer_by_phone(client, auth_headers, org_id):
    """Converting two leads with the same phone reuses the same customer."""
    phone = f"555-{uuid.uuid4().hex[:4]}"

    lead1 = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Duplicate Phone A", "phone": phone, "source": "web_form"},
    ).json()
    lead2 = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Duplicate Phone B", "phone": phone, "source": "web_form"},
    ).json()

    out1 = client.post(f"/api/leads/{lead1['id']}/convert", headers=auth_headers).json()
    out2 = client.post(f"/api/leads/{lead2['id']}/convert", headers=auth_headers).json()

    assert out1["customer_id"] == out2["customer_id"]
    assert out1["job_id"] != out2["job_id"]


def test_convert_already_converted_returns_422(client, auth_headers, org_id):
    phone = f"555-{uuid.uuid4().hex[:4]}"
    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Double Convert", "phone": phone, "source": "web_form"},
    )
    lead_id = created.json()["id"]

    client.post(f"/api/leads/{lead_id}/convert", headers=auth_headers)
    resp = client.post(f"/api/leads/{lead_id}/convert", headers=auth_headers)
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Org scoping
# ---------------------------------------------------------------------------

def test_org_scoping_cannot_see_other_org_leads(client, auth_headers, other_auth_headers, other_org_id):
    """A user cannot see leads belonging to another organization."""
    # Create a lead in the OTHER org
    other_lead = client.post(
        f"/api/leads/intake/{other_org_id}",
        json={"name": "Secret Lead", "phone": "555-9999", "source": "web_form"},
    ).json()
    other_lead_id = other_lead["id"]

    # Authenticated user from the primary org should NOT see it
    resp = client.get(f"/api/leads/{other_lead_id}", headers=auth_headers)
    assert resp.status_code == 404

    activity_resp = client.get(f"/api/leads/{other_lead_id}/activity", headers=auth_headers)
    assert activity_resp.status_code == 404
