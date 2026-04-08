import os
import base64
import hashlib
import hmac
from datetime import datetime, timezone
from typing import cast

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..core.db import get_db
from ..crud.lead import create_lead, upsert_missed_call_lead
from ..crud.reminder import create_lead_followup_reminder
from ..models.core import CoachingSnippet, CommunicationTenantProfile, HelpArticle, Lead, Organization, Reminder, SmsOptOut, User
from ..schemas.platform import (
    AIGuideSettingsOut,
    AIGuideSettingsUpdate,
    CoachingSnippetCreate,
    CoachingSnippetOut,
    HelpArticleCreate,
    HelpArticleOut,
    MarketingServicePackageOut,
    CommunicationTenantProfileOut,
    CommunicationTenantProfileUpdate,
    RetellCallEventIn,
    TwilioInboundMessageIn,
    TwilioStatusEventIn,
    TwilioVoiceCallEventIn,
    ZapierLeadIn,
    ZapierPushLeadIn,
)

router = APIRouter()

_REQUIRED_ADMIN_EMAIL = "support@frontdeskpro.com"
_DEFAULT_VISUAL_ADS_CHECKOUT_URL = "https://gofieldwise.com/contact?service=ai-visual-ads-growth"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _normalize_signature(value: str) -> str:
    compact = value.strip()
    if "=" in compact:
        _, tail = compact.split("=", 1)
        return tail.strip().lower()
    return compact.lower()


def _is_truthy_env(var_name: str) -> bool:
    return os.getenv(var_name, "").strip().lower() in {"1", "true", "yes", "on"}


def _get_scoped_env_value(base_var: str, org_id: int | None) -> str:
    if org_id is not None:
        scoped_name = f"{base_var}_ORG_{org_id}"
        scoped_value = os.getenv(scoped_name, "").strip()
        if scoped_value:
            return scoped_value
    return os.getenv(base_var, "").strip()


def _build_twilio_signature_url(request: Request) -> str:
    override_base = os.getenv("TWILIO_WEBHOOK_PUBLIC_BASE_URL", "").strip().rstrip("/")
    path = request.url.path
    query = request.url.query
    suffix = f"{path}?{query}" if query else path
    if override_base:
        return f"{override_base}{suffix}"
    return str(request.url)


def _compute_twilio_provider_signature(
    auth_token: str,
    url: str,
    params: dict[str, str],
) -> str:
    payload = url + "".join(f"{key}{params[key]}" for key in sorted(params.keys()))
    digest = hmac.new(
        auth_token.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha1,
    ).digest()
    return base64.b64encode(digest).decode("utf-8")


async def _require_twilio_provider_signature(request: Request, *, org_id: int | None = None) -> None:
    if not _is_truthy_env("TWILIO_PROVIDER_SIGNATURE_MODE"):
        return

    auth_token = _get_scoped_env_value("TWILIO_AUTH_TOKEN", org_id)
    if not auth_token:
        raise HTTPException(status_code=500, detail="TWILIO_AUTH_TOKEN is required in provider signature mode")

    provided = request.headers.get("x-twilio-signature", "").strip()
    if not provided:
        raise HTTPException(status_code=401, detail="Missing Twilio signature header")

    form_data = await request.form()
    normalized_form: dict[str, str] = {}
    for key, value in form_data.multi_items():
        normalized_form[str(key)] = str(value)

    expected = _compute_twilio_provider_signature(
        auth_token=auth_token,
        url=_build_twilio_signature_url(request),
        params=normalized_form,
    )
    if not hmac.compare_digest(expected, provided):
        raise HTTPException(status_code=401, detail="Invalid Twilio provider signature")


def _extract_bearer_token(request: Request) -> str:
    auth_header = request.headers.get("authorization", "").strip()
    if not auth_header:
        return ""
    parts = auth_header.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return ""
    return parts[1].strip()


def _require_static_provider_token(
    request: Request,
    *,
    mode_env_var: str,
    token_env_var: str,
    header_names: list[str],
    integration_name: str,
    org_id: int | None = None,
) -> None:
    if not _is_truthy_env(mode_env_var):
        return

    expected = _get_scoped_env_value(token_env_var, org_id)
    if not expected:
        raise HTTPException(status_code=500, detail=f"{token_env_var} is required in strict provider mode")

    provided = ""
    for header in header_names:
        raw = request.headers.get(header, "").strip()
        if raw:
            provided = raw
            break

    if not provided:
        provided = _extract_bearer_token(request)

    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail=f"Invalid {integration_name} provider token")


async def _require_signed_webhook(
    request: Request,
    *,
    secret_env_var: str,
    header_names: list[str],
    integration_name: str,
    org_id: int | None = None,
) -> None:
    signing_secret = _get_scoped_env_value(secret_env_var, org_id)
    if not signing_secret:
        return

    raw_body = await request.body()
    expected = hmac.new(
        signing_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    provided: str | None = None
    for header_name in header_names:
        raw_value = request.headers.get(header_name)
        if raw_value:
            provided = _normalize_signature(raw_value)
            break

    if not provided or not hmac.compare_digest(expected, provided):
        raise HTTPException(status_code=401, detail=f"Invalid {integration_name} webhook signature")


def _resolve_org_by_intake_key(db: Session, intake_key: str) -> Organization:
    org = db.query(Organization).filter(Organization.intake_key == intake_key).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


def _ensure_admin(user: User) -> None:
    normalized_email = str(cast(str, user.email)).strip().lower().replace(",", ".")
    if normalized_email != _REQUIRED_ADMIN_EMAIL:
        raise HTTPException(
            status_code=403,
            detail=f"Admin login requires email {_REQUIRED_ADMIN_EMAIL}",
        )


@router.get("/status")
def public_status() -> dict:
    return {
        "service": "frontdesk-pro",
        "status": "ok",
        "features": {
            "ai_guide": True,
            "contextual_help": True,
            "tribal_coaching": True,
            "marketing_service_packages": True,
        },
    }


@router.get("/org/ai-guide", response_model=AIGuideSettingsOut)
def get_ai_guide_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    org = (
        db.query(Organization)
        .filter(Organization.id == current_user.organization_id)
        .first()
    )
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {
        "organization_id": int(cast(int, org.id)),
        "enabled": bool(int(cast(int, org.ai_guide_enabled))),
        "stage": str(cast(str, org.ai_guide_stage)),
    }


@router.patch("/org/ai-guide", response_model=AIGuideSettingsOut)
def update_ai_guide_settings(
    payload: AIGuideSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    org = (
        db.query(Organization)
        .filter(Organization.id == current_user.organization_id)
        .first()
    )
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    setattr(org, "ai_guide_enabled", 1 if payload.enabled else 0)
    setattr(org, "ai_guide_stage", payload.stage.strip().lower())
    db.commit()
    db.refresh(org)

    return {
        "organization_id": int(cast(int, org.id)),
        "enabled": bool(int(cast(int, org.ai_guide_enabled))),
        "stage": str(cast(str, org.ai_guide_stage)),
    }


@router.get("/help/articles", response_model=list[HelpArticleOut])
def list_help_articles(
    context_key: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    q = db.query(HelpArticle).filter(HelpArticle.organization_id == current_user.organization_id)
    if context_key:
        q = q.filter(HelpArticle.context_key == context_key)
    return q.order_by(HelpArticle.updated_at.desc(), HelpArticle.id.desc()).all()


@router.post("/help/articles", response_model=HelpArticleOut, status_code=status.HTTP_201_CREATED)
def create_help_article(
    payload: HelpArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)

    slug = payload.slug.strip().lower()
    existing = (
        db.query(HelpArticle)
        .filter(
            HelpArticle.organization_id == current_user.organization_id,
            HelpArticle.slug == slug,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Help article slug already exists")

    article = HelpArticle(
        slug=slug,
        title=payload.title.strip(),
        category=payload.category.strip().lower(),
        context_key=payload.context_key.strip().lower(),
        body=payload.body.strip(),
        organization_id=int(cast(int, current_user.organization_id)),
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.get("/coaching/snippets", response_model=list[CoachingSnippetOut])
def list_coaching_snippets(
    trade: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    q = db.query(CoachingSnippet).filter(CoachingSnippet.organization_id == current_user.organization_id)
    if trade:
        q = q.filter(CoachingSnippet.trade == trade.strip().lower())
    return q.order_by(CoachingSnippet.updated_at.desc(), CoachingSnippet.id.desc()).all()


@router.post("/coaching/snippets", response_model=CoachingSnippetOut, status_code=status.HTTP_201_CREATED)
def create_coaching_snippet(
    payload: CoachingSnippetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    snippet = CoachingSnippet(
        title=payload.title.strip(),
        trade=payload.trade.strip().lower(),
        issue_pattern=payload.issue_pattern.strip(),
        senior_tip=payload.senior_tip.strip(),
        checklist=(payload.checklist.strip() if payload.checklist else None),
        organization_id=int(cast(int, current_user.organization_id)),
    )
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet


@router.get("/marketing/service-packages", response_model=list[MarketingServicePackageOut])
def list_marketing_service_packages(
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    visual_ads_checkout_url = os.getenv("GOFIELDWISE_VISUAL_ADS_CHECKOUT_URL", _DEFAULT_VISUAL_ADS_CHECKOUT_URL).strip() or _DEFAULT_VISUAL_ADS_CHECKOUT_URL
    return [
        {
            "code": "phase_b_starter",
            "name": "Done-for-You Marketing Starter",
            "monthly_price_usd": 500,
            "summary": "Managed local campaign setup and weekly optimizations.",
            "includes": [
                "Meta ad account setup",
                "Lead form tracking with UTM attribution",
                "Weekly budget and CPL review",
            ],
            "checkout_url": None,
        },
        {
            "code": "phase_b_growth",
            "name": "Done-for-You Marketing Growth",
            "monthly_price_usd": 750,
            "summary": "Managed campaign operations with multi-channel optimization.",
            "includes": [
                "Meta and search campaign management",
                "Lead quality review loop",
                "Biweekly performance reporting",
            ],
            "checkout_url": None,
        },
        {
            "code": "ai_visual_ads_growth",
            "name": "AI Visual Ads Growth Service",
            "monthly_price_usd": 1299,
            "summary": "Sell-ready visual ad production service for growth campaigns across image and video channels.",
            "includes": [
                "Image generation pipeline for product visuals, lifestyle scenes, and branded backgrounds",
                "Design and layout templates for Meta, TikTok, and Google ad placements",
                "Short-form video ad creation workflow with scene timing and overlays",
                "Competitor ad intelligence for creative pattern and format gap analysis",
                "Performance analytics linking creative attributes to ROI and refresh cadence",
            ],
            "checkout_url": visual_ads_checkout_url,
        },
    ]


@router.get("/org/comm-profile", response_model=CommunicationTenantProfileOut)
def get_comm_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    profile = (
        db.query(CommunicationTenantProfile)
        .filter(CommunicationTenantProfile.organization_id == current_user.organization_id)
        .first()
    )
    if not profile:
        return {
            "organization_id": int(cast(int, current_user.organization_id)),
            "active": False,
            "twilio_account_sid": None,
            "twilio_messaging_service_sid": None,
            "twilio_phone_number": None,
            "retell_agent_id": None,
            "retell_phone_number": None,
        }
    return {
        "organization_id": int(cast(int, profile.organization_id)),
        "active": bool(int(cast(int, profile.active))),
        "twilio_account_sid": cast(str | None, profile.twilio_account_sid),
        "twilio_messaging_service_sid": cast(str | None, profile.twilio_messaging_service_sid),
        "twilio_phone_number": cast(str | None, profile.twilio_phone_number),
        "retell_agent_id": cast(str | None, profile.retell_agent_id),
        "retell_phone_number": cast(str | None, profile.retell_phone_number),
    }


@router.patch("/org/comm-profile", response_model=CommunicationTenantProfileOut)
def update_comm_profile(
    payload: CommunicationTenantProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    org_id = int(cast(int, current_user.organization_id))

    profile = (
        db.query(CommunicationTenantProfile)
        .filter(CommunicationTenantProfile.organization_id == org_id)
        .first()
    )
    if not profile:
        profile = CommunicationTenantProfile(organization_id=org_id)
        db.add(profile)
        db.flush()

    setattr(profile, "active", 1 if payload.active else 0)
    setattr(profile, "twilio_account_sid", payload.twilio_account_sid)
    setattr(profile, "twilio_auth_token", payload.twilio_auth_token)
    setattr(profile, "twilio_messaging_service_sid", payload.twilio_messaging_service_sid)
    setattr(profile, "twilio_phone_number", payload.twilio_phone_number)
    setattr(profile, "retell_agent_id", payload.retell_agent_id)
    setattr(profile, "retell_phone_number", payload.retell_phone_number)
    db.commit()
    db.refresh(profile)

    return {
        "organization_id": int(cast(int, profile.organization_id)),
        "active": bool(int(cast(int, profile.active))),
        "twilio_account_sid": cast(str | None, profile.twilio_account_sid),
        "twilio_messaging_service_sid": cast(str | None, profile.twilio_messaging_service_sid),
        "twilio_phone_number": cast(str | None, profile.twilio_phone_number),
        "retell_agent_id": cast(str | None, profile.retell_agent_id),
        "retell_phone_number": cast(str | None, profile.retell_phone_number),
    }


@router.post("/integrations/twilio/inbound/{org_id}")
async def twilio_inbound_message(
    org_id: int,
    payload: TwilioInboundMessageIn,
    request: Request,
    db: Session = Depends(get_db),
):
    await _require_twilio_provider_signature(request, org_id=org_id)
    await _require_signed_webhook(
        request,
        secret_env_var="TWILIO_WEBHOOK_SIGNING_SECRET",
        header_names=["x-twilio-signature", "x-frontdesk-signature"],
        integration_name="Twilio",
        org_id=org_id,
    )

    normalized_phone = payload.from_phone.strip()
    text = payload.body.strip().upper()
    if text in {"STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"}:
        existing = (
            db.query(SmsOptOut)
            .filter(SmsOptOut.organization_id == org_id, SmsOptOut.phone == normalized_phone)
            .first()
        )
        if not existing:
            db.add(SmsOptOut(organization_id=org_id, phone=normalized_phone, source="twilio_inbound_stop"))
            db.commit()
        return {"ok": True, "action": "opted_out"}

    if text == "HELP":
        return {"ok": True, "action": "help_requested"}

    return {"ok": True, "action": "message_received"}


@router.post("/integrations/twilio/status")
async def twilio_message_status(
    payload: TwilioStatusEventIn,
    request: Request,
    db: Session = Depends(get_db),
):
    await _require_twilio_provider_signature(request)
    await _require_signed_webhook(
        request,
        secret_env_var="TWILIO_WEBHOOK_SIGNING_SECRET",
        header_names=["x-twilio-signature", "x-frontdesk-signature"],
        integration_name="Twilio",
    )

    reminder = (
        db.query(Reminder)
        .filter(Reminder.external_message_id == payload.message_sid)
        .first()
    )
    if not reminder:
        return {"ok": True, "matched": False}

    status = payload.message_status.strip().lower()
    if status in {"delivered", "sent"}:
        if cast(object, reminder.delivered_at) is None:
            setattr(reminder, "delivered_at", cast(object, reminder.sent_at) or _utcnow())
    if status in {"failed", "undelivered"}:
        setattr(reminder, "last_dispatch_error", f"delivery_status={status}")
        db.add(
            Reminder(
                message=(
                    f"ALERT: Twilio delivery failed for reminder #{int(cast(int, reminder.id))} "
                    f"with status={status}"
                ),
                channel="internal",
                status="pending",
                due_at=_utcnow(),
                organization_id=int(cast(int, reminder.organization_id)),
                customer_id=cast(int | None, reminder.customer_id),
            )
        )
    if status in {"received", "read"}:
        if cast(object, reminder.responded_at) is None:
            setattr(reminder, "responded_at", cast(object, reminder.sent_at) or _utcnow())
    db.commit()
    return {"ok": True, "matched": True}


@router.post("/integrations/twilio/voice/{org_id}")
async def twilio_voice_call_event(
    org_id: int,
    payload: TwilioVoiceCallEventIn,
    request: Request,
    db: Session = Depends(get_db),
):
    await _require_twilio_provider_signature(request, org_id=org_id)
    await _require_signed_webhook(
        request,
        secret_env_var="TWILIO_WEBHOOK_SIGNING_SECRET",
        header_names=["x-twilio-signature", "x-frontdesk-signature"],
        integration_name="Twilio",
        org_id=org_id,
    )

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    call_status = payload.call_status.strip().lower()
    is_missed = call_status in {"no-answer", "no_answer", "busy", "failed", "canceled"}

    if is_missed:
        raw_parts = [f"Twilio call SID: {payload.call_sid}", f"status={call_status}"]
        if payload.recording_url:
            raw_parts.append(f"recording_url={payload.recording_url.strip()}")
        raw_message = "\n".join(raw_parts)

        lead, created_new = upsert_missed_call_lead(
            db=db,
            organization_id=org_id,
            phone=payload.from_phone.strip(),
            name=payload.caller_name.strip() if payload.caller_name else None,
            raw_message=raw_message,
        )
        if created_new:
            create_lead_followup_reminder(
                db,
                int(cast(int, lead.id)),
                org_id,
                lead_name=cast(str | None, lead.name),
                hours=0,
            )

        return {
            "ok": True,
            "action": "missed_call_recovered",
            "lead_id": int(cast(int, lead.id)),
            "deduplicated": not created_new,
        }

    return {"ok": True, "action": "call_recorded", "missed_call": False}


@router.post("/integrations/retell/call-ended/{org_id}")
async def retell_call_ended(
    org_id: int,
    payload: RetellCallEventIn,
    request: Request,
    db: Session = Depends(get_db),
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    _require_static_provider_token(
        request,
        mode_env_var="RETELL_PROVIDER_SIGNATURE_MODE",
        token_env_var="RETELL_WEBHOOK_PROVIDER_TOKEN",
        header_names=["x-retell-signature", "x-retell-token"],
        integration_name="Retell",
        org_id=org_id,
    )
    await _require_signed_webhook(
        request,
        secret_env_var="RETELL_WEBHOOK_SIGNING_SECRET",
        header_names=["x-retell-signature", "x-frontdesk-signature"],
        integration_name="Retell",
        org_id=org_id,
    )

    call_status = payload.call_status.strip().lower()
    is_missed = bool(payload.missed_call) or call_status in {"missed", "no_answer", "busy", "failed"}

    if is_missed:
        raw_parts = [f"Retell call: {payload.call_id}", f"status={call_status}"]
        if payload.summary:
            raw_parts.append(payload.summary.strip())
        if payload.transcript:
            raw_parts.append(payload.transcript.strip())
        raw_message = "\n".join([p for p in raw_parts if p])

        lead, created_new = upsert_missed_call_lead(
            db=db,
            organization_id=org_id,
            phone=payload.from_phone.strip(),
            name=payload.caller_name.strip() if payload.caller_name else None,
            raw_message=raw_message,
        )
        if created_new:
            create_lead_followup_reminder(
                db,
                int(cast(int, lead.id)),
                org_id,
                lead_name=cast(str | None, lead.name),
                hours=0,
            )

        return {
            "ok": True,
            "action": "missed_call_recovered",
            "lead_id": int(cast(int, lead.id)),
            "deduplicated": not created_new,
        }

    return {
        "ok": True,
        "action": "call_recorded",
        "missed_call": False,
    }


@router.post("/integrations/zapier/leads/by-key/{intake_key}")
async def zapier_create_lead(
    intake_key: str,
    payload: ZapierLeadIn,
    request: Request,
    db: Session = Depends(get_db),
):
    org = _resolve_org_by_intake_key(db, intake_key)
    org_id = int(cast(int, org.id))

    _require_static_provider_token(
        request,
        mode_env_var="ZAPIER_PROVIDER_SIGNATURE_MODE",
        token_env_var="ZAPIER_WEBHOOK_PROVIDER_TOKEN",
        header_names=["x-zapier-signature", "x-zapier-token"],
        integration_name="Zapier",
        org_id=org_id,
    )
    await _require_signed_webhook(
        request,
        secret_env_var="ZAPIER_WEBHOOK_SIGNING_SECRET",
        header_names=["x-zapier-signature", "x-frontdesk-signature"],
        integration_name="Zapier",
        org_id=org_id,
    )

    message_lines: list[str] = []
    if payload.service:
        message_lines.append(f"Service: {payload.service.strip()}")
    if payload.notes:
        message_lines.append(payload.notes.strip())

    lead = create_lead(
        db,
        {
            "name": payload.name.strip() if payload.name else None,
            "phone": payload.phone.strip() if payload.phone else None,
            "email": payload.email.strip() if payload.email else None,
            "source": payload.source.strip().lower(),
            "raw_message": "\n".join(message_lines) if message_lines else None,
        },
        org_id,
    )
    create_lead_followup_reminder(
        db,
        int(cast(int, lead.id)),
        org_id,
        lead_name=cast(str | None, lead.name),
    )

    return {
        "ok": True,
        "lead_id": int(cast(int, lead.id)),
        "organization_id": org_id,
    }


@router.post("/integrations/zapier/push/lead/{lead_id}")
def zapier_push_lead(
    lead_id: int,
    payload: ZapierPushLeadIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_admin(current_user)
    org_id = int(cast(int, current_user.organization_id))

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id, Lead.organization_id == org_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    webhook_url = (payload.webhook_url or os.getenv("ZAPIER_LEAD_WEBHOOK_URL", "")).strip()
    if not webhook_url:
        raise HTTPException(status_code=400, detail="Zapier webhook URL is not configured")

    lead_message = cast(str | None, lead.raw_message)
    event_payload = {
        "event_type": payload.workflow.strip().lower(),
        "generated_at": f"{_utcnow().isoformat()}Z",
        "organization_id": org_id,
        "lead": {
            "id": int(cast(int, lead.id)),
            "name": cast(str | None, lead.name),
            "phone": cast(str | None, lead.phone),
            "email": cast(str | None, lead.email),
            "source": cast(str, lead.source),
            "status": cast(str, lead.status),
            "created_at": cast(datetime, lead.created_at).isoformat() if cast(object, lead.created_at) else None,
            "raw_message": lead_message if payload.include_raw_message else None,
        },
    }

    headers = {
        "Content-Type": "application/json",
    }
    outbound_secret = os.getenv("ZAPIER_OUTBOUND_SHARED_SECRET", "").strip()
    if outbound_secret:
        headers["X-FrontDesk-Secret"] = outbound_secret

    try:
        response = httpx.post(
            webhook_url,
            json=event_payload,
            headers=headers,
            timeout=20.0,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Zapier webhook request failed: {exc}") from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Zapier webhook failed with status {response.status_code}",
        )

    return {
        "ok": True,
        "lead_id": int(cast(int, lead.id)),
        "workflow": payload.workflow.strip().lower(),
        "status_code": int(response.status_code),
    }
