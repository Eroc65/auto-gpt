"""
Integration test: conflict-check → next-slot → dispatch in one flow.

Scenario
--------
1. Tech is dispatched to Job-1 at T+2h.
2. GET /conflict for the same tech + same time  → conflict: True.
3. GET /next-slot starting from T+2h            → returns a slot ≥ T+2h+step.
4. PATCH /dispatch Job-2 using the returned slot → status 200, status == "dispatched".
5. GET /conflict for the new slot               → conflict: False (no double-booking).

This mirrors the Dispatch-Assistant frontend e2e path.
"""

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.core.db import Base, SessionLocal, engine
from app.main import app
from app.models.core import Organization, User

_EMAIL = "schedflow@example.com"
_PASSWORD = "schedflowpass"
_ORG = "SchedFlow Org"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org = Organization(name=_ORG)
        db.add(org)
        db.flush()
        db.add(
            User(
                email=_EMAIL,
                hashed_password=hash_password(_PASSWORD),
                organization_id=org.id,
            )
        )
        db.commit()
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def auth_headers(client):
    resp = client.post("/api/auth/login", data={"username": _EMAIL, "password": _PASSWORD})
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _utc(hours: float = 0) -> str:
    """Return an ISO-8601 UTC datetime offset from now by *hours*."""
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


# ---------------------------------------------------------------------------
# End-to-end scheduling flow
# ---------------------------------------------------------------------------


def test_conflict_next_slot_dispatch_flow(client, auth_headers):
    """Full conflict → next-slot → dispatch integration flow."""

    # ------------------------------------------------------------------
    # 1. Setup: one technician (always available) + two jobs
    # ------------------------------------------------------------------
    customer = client.post(
        "/api/customers",
        json={"name": "Flow Customer", "phone": "555-9000"},
        headers=auth_headers,
    )
    assert customer.status_code == 201
    customer_id = customer.json()["id"]

    tech = client.post(
        "/api/technicians",
        json={
            "name": "Flow Tech",
            "availability_start_hour_utc": 0,
            "availability_end_hour_utc": 24,
            "availability_weekdays": "0,1,2,3,4,5,6",
        },
        headers=auth_headers,
    )
    assert tech.status_code == 201
    tech_id = tech.json()["id"]

    job1 = client.post(
        "/api/jobs",
        json={"title": "Flow Job 1", "customer_id": customer_id},
        headers=auth_headers,
    )
    assert job1.status_code == 201
    job1_id = job1.json()["id"]

    job2 = client.post(
        "/api/jobs",
        json={"title": "Flow Job 2", "customer_id": customer_id},
        headers=auth_headers,
    )
    assert job2.status_code == 201
    job2_id = job2.json()["id"]

    # ------------------------------------------------------------------
    # 2. Dispatch Job-1 to the technician at T+2h
    # ------------------------------------------------------------------
    busy_time = _utc(hours=2)
    dispatch1 = client.patch(
        f"/api/jobs/{job1_id}/dispatch",
        json={"technician_id": tech_id, "scheduled_time": busy_time},
        headers=auth_headers,
    )
    assert dispatch1.status_code == 200, dispatch1.text
    assert dispatch1.json()["status"] == "dispatched"

    # ------------------------------------------------------------------
    # 3. Conflict check: same tech, same time → conflict detected
    # ------------------------------------------------------------------
    conflict_resp = client.get(
        "/api/jobs/scheduling/conflict",
        params={"technician_id": tech_id, "scheduled_time": busy_time},
        headers=auth_headers,
    )
    assert conflict_resp.status_code == 200, conflict_resp.text
    conflict_body = conflict_resp.json()
    assert conflict_body["conflict"] is True
    assert conflict_body["conflicting_job_id"] == job1_id

    # ------------------------------------------------------------------
    # 4. Next-slot: ask for the first free slot from the busy time
    # ------------------------------------------------------------------
    next_slot_resp = client.get(
        "/api/jobs/scheduling/next-slot",
        params={
            "technician_id": tech_id,
            "requested_time": busy_time,
            "step_minutes": 30,
            "search_hours": 24,
        },
        headers=auth_headers,
    )
    assert next_slot_resp.status_code == 200, next_slot_resp.text
    next_slot_body = next_slot_resp.json()
    assert next_slot_body["next_available_time"] is not None, (
        "Expected a free slot to be found within the search window"
    )
    assert job1_id in next_slot_body["conflicting_job_ids"], (
        "Expected conflicting_job_ids to include the already scheduled job"
    )
    free_slot = next_slot_body["next_available_time"]

    # The next available time must be strictly after the busy slot.
    # Normalise both to UTC-aware for comparison.
    def _as_utc(s: str) -> datetime:
        dt = datetime.fromisoformat(s)
        return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

    free_dt = _as_utc(free_slot)
    busy_dt = _as_utc(busy_time)
    assert free_dt > busy_dt, (
        f"next-slot {free_dt} must be after the occupied slot {busy_dt}"
    )

    # ------------------------------------------------------------------
    # 5. Dispatch Job-2 at the suggested free slot
    # ------------------------------------------------------------------
    dispatch2 = client.patch(
        f"/api/jobs/{job2_id}/dispatch",
        json={"technician_id": tech_id, "scheduled_time": free_slot},
        headers=auth_headers,
    )
    assert dispatch2.status_code == 200, dispatch2.text
    body2 = dispatch2.json()
    assert body2["status"] == "dispatched"
    assert body2["technician_id"] == tech_id

    # ------------------------------------------------------------------
    # 6. The newly dispatched slot should be occupied unless we exclude Job-2.
    # ------------------------------------------------------------------
    conflict_at_new_slot = client.get(
        "/api/jobs/scheduling/conflict",
        params={
            "technician_id": tech_id,
            "scheduled_time": free_slot,
        },
        headers=auth_headers,
    )
    assert conflict_at_new_slot.status_code == 200, conflict_at_new_slot.text
    occupied = conflict_at_new_slot.json()
    assert occupied["conflict"] is True
    assert occupied["conflicting_job_id"] == job2_id

    # ------------------------------------------------------------------
    # 7. Confirm self-excluding conflict check works for edit-like flows.
    # ------------------------------------------------------------------
    conflict_after = client.get(
        "/api/jobs/scheduling/conflict",
        params={
            "technician_id": tech_id,
            "scheduled_time": free_slot,
            "exclude_job_id": job2_id,
        },
        headers=auth_headers,
    )
    assert conflict_after.status_code == 200, conflict_after.text
    # Excluding job2 itself → no other job at this slot, so no conflict
    assert conflict_after.json()["conflict"] is False
