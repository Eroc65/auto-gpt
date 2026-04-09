from typing import List, cast
from datetime import datetime
import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..api.auth import normalize_user_role
from ..core.db import get_db
from ..crud.lead import (
    book_lead,
    convert_lead,
    create_lead,
    get_lead,
    get_leads,
    list_lead_activities,
    qualify_lead,
    transition_lead_status,
    upsert_missed_call_lead,
)
from ..crud.reminder import create_lead_booking_reminder, create_lead_followup_reminder
from ..models.core import Organization, User
from ..schemas.lead import (
    LeadBookInput,
    LeadBookOut,
    LeadActivityOut,
    LeadConvertOut,
    LeadIntake,
    LeadOut,
    LeadQualificationInput,
    LeadQualificationOut,
    LeadStatusUpdate,
    MissedCallIntake,
    MissedCallRecoveryOut,
)

router = APIRouter()

LEAD_QUALIFY_ROLES = {"owner", "admin", "dispatcher"}
LEAD_BOOK_ROLES = {"owner", "admin", "dispatcher"}
_URL_PATTERN = re.compile(r"https?://", re.IGNORECASE)
_SPAM_PHRASES = (
    "viagra",
    "casino",
    "crypto",
    "loan approval",
)


def _ensure_user_role(current_user: User, allowed_roles: set[str], action: str) -> None:
    user_role = normalize_user_role(cast(str | None, current_user.role))
    if user_role not in allowed_roles:
        allowed = ", ".join(sorted(allowed_roles))
        raise HTTPException(
            status_code=403,
            detail=f"Role '{user_role}' cannot {action}. Allowed roles: {allowed}.",
        )


def _resolve_org_for_intake(db: Session, *, org_id: int | None = None, intake_key: str | None = None) -> Organization:
    query = db.query(Organization)
    organization = None
    if org_id is not None:
        organization = query.filter(Organization.id == org_id).first()
    elif intake_key is not None:
        organization = query.filter(Organization.intake_key == intake_key).first()

    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


def _is_non_empty(value: str | None) -> bool:
    return bool(value and value.strip())


def _assert_intake_not_spam(*, name: str | None, phone: str | None, email: str | None, raw_message: str | None, website: str | None) -> None:
    if _is_non_empty(website):
        raise HTTPException(status_code=422, detail="Rejected as spam.")

    if not any((_is_non_empty(name), _is_non_empty(phone), _is_non_empty(email), _is_non_empty(raw_message))):
        raise HTTPException(status_code=422, detail="Provide at least one contact detail or message.")

    if raw_message:
        if len(_URL_PATTERN.findall(raw_message)) >= 2:
            raise HTTPException(status_code=422, detail="Rejected as spam.")
        lowered = raw_message.lower()
        if any(phrase in lowered for phrase in _SPAM_PHRASES):
            raise HTTPException(status_code=422, detail="Rejected as spam.")


def _append_source_tag(raw_message: str | None, tag: str) -> str:
    marker = f"source_tag:{tag}"
    if raw_message and marker in raw_message:
        return raw_message
    if raw_message and raw_message.strip():
        return f"{raw_message.strip()}\n{marker}"
    return marker


def _create_intake_lead(db: Session, payload: LeadIntake, org_id: int, *, source: str, source_tag: str):
    _assert_intake_not_spam(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        raw_message=payload.raw_message,
        website=payload.website,
    )
    data = payload.model_dump()
    data["source"] = source
    data["raw_message"] = _append_source_tag(payload.raw_message, source_tag)
    data.pop("website", None)
    lead = create_lead(db, data, org_id)
    # Auto-schedule a follow-up reminder so the lead doesn't slip through the cracks.
    create_lead_followup_reminder(
        db,
        int(cast(int, lead.id)),
        org_id,
        lead_name=cast(str | None, lead.name),
    )
    return lead


def _recover_missed_call_lead(db: Session, payload: MissedCallIntake, org_id: int) -> MissedCallRecoveryOut:
    _assert_intake_not_spam(
        name=payload.name,
        phone=payload.phone,
        email=None,
        raw_message=payload.raw_message,
        website=payload.website,
    )
    raw_message = payload.raw_message
    if payload.call_sid:
        sid_line = f"Call SID: {payload.call_sid}"
        raw_message = f"{sid_line}\n{raw_message}" if raw_message else sid_line
    raw_message = _append_source_tag(raw_message, "public_missed_call")

    lead, created_new = upsert_missed_call_lead(
        db=db,
        organization_id=org_id,
        phone=payload.phone,
        name=payload.name,
        raw_message=raw_message,
    )
    reminder_created = False
    if created_new:
        # Missed calls are high urgency; nudge team immediately.
        create_lead_followup_reminder(
            db,
            int(cast(int, lead.id)),
            org_id,
            lead_name=cast(str | None, lead.name),
            hours=0,
        )
        reminder_created = True

    return MissedCallRecoveryOut(
        lead=lead,
        deduplicated=not created_new,
        reminder_created=reminder_created,
    )


# ---------------------------------------------------------------------------
# Public intake — no auth required.
# org_id routes the lead to the correct organization (e.g. from a web form
# embed or missed-call webhook). In production, harden with a per-org
# webhook token; for now org_id is the routing key.
# ---------------------------------------------------------------------------

@router.post(
    "/leads/intake/{org_id}",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
    tags=["intake"],
)
def intake(org_id: int, payload: LeadIntake, db: Session = Depends(get_db)):
    org = _resolve_org_for_intake(db, org_id=org_id)
    return _create_intake_lead(
        db,
        payload,
        int(cast(int, org.id)),
        source="web_form",
        source_tag="public_intake_org",
    )


@router.post(
    "/leads/intake/by-key/{intake_key}",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
    tags=["intake"],
)
def intake_by_key(intake_key: str, payload: LeadIntake, db: Session = Depends(get_db)):
    org = _resolve_org_for_intake(db, intake_key=intake_key)
    return _create_intake_lead(
        db,
        payload,
        int(cast(int, org.id)),
        source="web_form",
        source_tag="public_intake_key",
    )


@router.post(
    "/leads/intake/missed-call/{org_id}",
    response_model=MissedCallRecoveryOut,
    status_code=status.HTTP_200_OK,
    tags=["intake"],
)
def intake_missed_call(
    org_id: int,
    payload: MissedCallIntake,
    db: Session = Depends(get_db),
):
    """Recover missed calls quickly with dedupe to avoid duplicate lead spam."""
    org = _resolve_org_for_intake(db, org_id=org_id)
    return _recover_missed_call_lead(db, payload, int(cast(int, org.id)))


@router.post(
    "/leads/intake/missed-call/by-key/{intake_key}",
    response_model=MissedCallRecoveryOut,
    status_code=status.HTTP_200_OK,
    tags=["intake"],
)
def intake_missed_call_by_key(
    intake_key: str,
    payload: MissedCallIntake,
    db: Session = Depends(get_db),
):
    org = _resolve_org_for_intake(db, intake_key=intake_key)
    return _recover_missed_call_lead(db, payload, int(cast(int, org.id)))


# ---------------------------------------------------------------------------
# Authenticated lead management
# ---------------------------------------------------------------------------

@router.get("/leads", response_model=List[LeadOut])
def list_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = int(cast(int, current_user.organization_id))
    return get_leads(db, org_id)


@router.get("/leads/{lead_id}", response_model=LeadOut)
def get_lead_api(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.patch("/leads/{lead_id}/status", response_model=LeadOut)
def update_lead_status(
    lead_id: int,
    update: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead, error = transition_lead_status(
        db,
        lead,
        update.status,
        actor_user_id=int(cast(int, current_user.id)),
    )
    if error:
        raise HTTPException(status_code=422, detail=error)
    return lead


@router.post("/leads/{lead_id}/convert", response_model=LeadConvertOut)
def convert_lead_api(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    try:
        lead, customer, job = convert_lead(
            db,
            lead,
            org_id,
            actor_user_id=int(cast(int, current_user.id)),
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    return LeadConvertOut(
        lead_id=int(cast(int, lead.id)),
        customer_id=int(cast(int, customer.id)),
        job_id=int(cast(int, job.id)),
    )


@router.post("/leads/{lead_id}/qualify", response_model=LeadQualificationOut)
def qualify_lead_api(
    lead_id: int,
    payload: LeadQualificationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_user_role(current_user, LEAD_QUALIFY_ROLES, "qualify leads")

    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead, error = qualify_lead(
        db,
        lead,
        emergency=payload.emergency,
        budget_confirmed=payload.budget_confirmed,
        requested_within_48h=payload.requested_within_48h,
        service_category=payload.service_category,
        actor_user_id=int(cast(int, current_user.id)),
    )
    if error:
        raise HTTPException(status_code=422, detail=error)

    create_lead_booking_reminder(
        db,
        lead_id=int(cast(int, lead.id)),
        organization_id=org_id,
        lead_name=cast(str | None, lead.name),
    )
    return LeadQualificationOut(lead=lead, booking_reminder_created=True)


@router.post("/leads/{lead_id}/book", response_model=LeadBookOut)
def book_lead_api(
    lead_id: int,
    payload: LeadBookInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_user_role(current_user, LEAD_BOOK_ROLES, "book leads")

    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    booked_lead, customer, job, dismissed_count, error = book_lead(
        db,
        lead,
        org_id,
        payload.technician_id,
        payload.scheduled_time,
        actor_user_id=int(cast(int, current_user.id)),
    )
    if error:
        raise HTTPException(status_code=422, detail=error)
    if not booked_lead or not customer or not job:
        raise HTTPException(status_code=500, detail="Lead booking failed unexpectedly")

    return LeadBookOut(
        lead_id=int(cast(int, booked_lead.id)),
        customer_id=int(cast(int, customer.id)),
        job_id=int(cast(int, job.id)),
        job_status=str(cast(str, job.status)),
        scheduled_time=cast(datetime, job.scheduled_time),
        technician_id=int(cast(int, job.technician_id)),
        booking_reminders_dismissed=dismissed_count,
    )


@router.get("/leads/{lead_id}/activity", response_model=List[LeadActivityOut])
def get_lead_activity_api(
    lead_id: int,
    action: str | None = Query(None),
    since_hours: int | None = Query(None, ge=1, le=720),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = int(cast(int, current_user.organization_id))
    lead = get_lead(db, lead_id, org_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return list_lead_activities(
        db,
        lead_id,
        org_id,
        action=action,
        since_hours=since_hours,
    )
