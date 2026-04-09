from datetime import datetime, timedelta, timezone
from typing import cast

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.core.db import Base, SessionLocal, engine
from app.main import app
from app.models.core import Organization, User

_EMAIL = "report@example.com"
_PASSWORD = "reportpass"
_ORG = "Report Org"


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


def _auth_headers(client: TestClient):
    resp = client.post("/api/auth/login", data={"username": _EMAIL, "password": _PASSWORD})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _org_id() -> int:
    db: Session = SessionLocal()
    try:
        org = db.query(Organization).filter(Organization.name == _ORG).first()
        assert org is not None
        return int(cast(int, org.id))
    finally:
        db.close()


def _past_iso(hours: int = 1) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()


def test_report_requires_auth():
    client = TestClient(app)
    resp = client.get("/api/reports/revenue-path")
    assert resp.status_code == 401


def test_revenue_path_report_counts():
    client = TestClient(app)
    headers = _auth_headers(client)
    org_id = _org_id()

    # Lead funnel
    lead_new = client.post(f"/api/leads/intake/{org_id}", json={"name": "New", "phone": "555-6000", "source": "web_form"})
    assert lead_new.status_code == 201
    lead_new_id = lead_new.json()["id"]

    lead_q = client.post(f"/api/leads/intake/{org_id}", json={"name": "Qualify", "phone": "555-6001", "source": "missed_call"})
    lead_q_id = lead_q.json()["id"]
    q = client.post(
        f"/api/leads/{lead_q_id}/qualify",
        json={"emergency": True, "budget_confirmed": True, "requested_within_48h": True, "service_category": "hvac"},
        headers=headers,
    )
    assert q.status_code == 200

    conv = client.post(f"/api/leads/{lead_q_id}/convert", headers=headers)
    assert conv.status_code == 200
    job_id = conv.json()["job_id"]

    # Dispatch
    tech = client.post(
        "/api/technicians",
        json={
            "name": "Reporter Tech",
            "availability_start_hour_utc": 0,
            "availability_end_hour_utc": 24,
            "availability_weekdays": "0,1,2,3,4,5,6",
        },
        headers=headers,
    )
    assert tech.status_code == 201
    dispatch = client.patch(
        f"/api/jobs/{job_id}/dispatch",
        json={"technician_id": tech.json()["id"], "scheduled_time": _past_iso(2)},
        headers=headers,
    )
    assert dispatch.status_code == 200

    # Invoice + overdue unpaid
    inv = client.post(
        "/api/invoices",
        json={"amount": 250.0, "job_id": job_id, "due_at": _past_iso(4)},
        headers=headers,
    )
    assert inv.status_code == 201

    # Force one reminder overdue and keep pending
    client.post(
        "/api/reminders",
        json={"message": "Manual overdue", "channel": "internal", "due_at": _past_iso(3), "lead_id": lead_new_id},
        headers=headers,
    )

    report = client.get("/api/reports/revenue-path", headers=headers)
    assert report.status_code == 200
    body = report.json()

    assert body["leads_total"] >= 2
    assert body["leads_qualified"] >= 1
    assert body["leads_converted"] >= 1
    assert body["jobs_dispatched"] >= 1
    assert body["invoices_total"] >= 1
    assert body["invoices_overdue"] >= 1
    assert body["reminders_overdue"] >= 1
    assert body["collection_reminders_pending"] >= 1


def test_lead_conversion_metrics_daily_series():
    client = TestClient(app)
    headers = _auth_headers(client)
    org_id = _org_id()

    created = client.post(
        f"/api/leads/intake/{org_id}",
        json={"name": "Metrics Lead", "phone": "555-6010", "source": "web_form"},
    )
    assert created.status_code == 201
    lead_id = created.json()["id"]

    qualified = client.post(
        f"/api/leads/{lead_id}/qualify",
        json={
            "emergency": True,
            "budget_confirmed": True,
            "requested_within_48h": True,
            "service_category": "plumbing",
        },
        headers=headers,
    )
    assert qualified.status_code == 200

    converted = client.post(f"/api/leads/{lead_id}/convert", headers=headers)
    assert converted.status_code == 200

    missed = client.post(
        f"/api/leads/intake/missed-call/{org_id}",
        json={"phone": "555-6011", "name": "Missed Metrics", "call_sid": "CAMETRICS1"},
    )
    assert missed.status_code == 200

    report = client.get("/api/reports/lead-conversion?days=7", headers=headers)
    assert report.status_code == 200
    body = report.json()

    assert body["organization_id"] == org_id
    assert body["days"] == 7
    assert body["totals"]["intakes"] >= 1
    assert body["totals"]["qualified"] >= 1
    assert body["totals"]["booked"] >= 1
    assert isinstance(body["recommended_next_action"], str)
    assert len(body["recommended_next_action"]) > 10
    assert len(body["timeline"]) == 7
    assert body["source_breakdown"]["web_form"] >= 1
    assert body["source_breakdown"]["missed_call"] >= 1
    assert body["intake_route_breakdown"]["public_intake_org"] >= 1
    assert body["intake_route_breakdown"]["public_missed_call"] >= 1
