from secrets import token_urlsafe
from typing import List, cast

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..api.auth import normalize_user_role
from ..core.db import get_db
from ..crud.marketing import create_campaign
from ..crud.marketing import get_campaign
from ..crud.marketing import launch_campaign
from ..crud.marketing import list_campaigns
from ..crud.reminder import run_reactivation_engine
from ..models.core import User
from ..models.core import MarketingImageCampaignPack
from ..schemas.marketing import MarketingCampaignCreate
from ..schemas.marketing import MarketingCampaignLaunchOut
from ..schemas.marketing import MarketingCampaignOut
from ..schemas.marketing import MarketingImageGenerateOut
from ..schemas.marketing import MarketingImageGenerateRequest
from ..schemas.marketing import MarketingImageChannelOut
from ..schemas.marketing import MarketingImageCampaignPackOut
from ..schemas.marketing import MarketingImageTemplateOut
from ..schemas.marketing import MarketingImageCustomCampaignPackCreate
from ..schemas.marketing import MarketingImageCustomCampaignPackOut
from ..schemas.marketing import MarketingImageCustomCampaignPackUpdate
from ..schemas.marketing import MarketingImageTradeTemplateOut
from ..schemas.marketing import MarketingExpertOperatorOut
from ..schemas.marketing import MarketingExpertOperatorRequest
from ..schemas.marketing import ReactivationRunOut
from ..schemas.marketing import ReactivationRunRequest
from ..services.ai_image_service import generate_marketing_image
from ..services.marketing_expert_service import run_marketing_expert_operator


router = APIRouter()


_ALLOWED_MARKETING_ROLES = {"owner", "admin", "dispatcher"}
_MARKETING_IMAGE_TEMPLATES: list[dict[str, str]] = [
    {
        "code": "social_promo",
        "name": "Social Promo",
        "recommended_size": "1024x1024",
        "description": "General social ad creative with offer headline and clear CTA",
    },
    {
        "code": "seasonal_offer",
        "name": "Seasonal Offer",
        "recommended_size": "1536x1024",
        "description": "Landscape campaign image for seasonal promotions and bundles",
    },
    {
        "code": "review_push",
        "name": "Review Push",
        "recommended_size": "1024x1024",
        "description": "Review and reputation campaign creative with trust cues",
    },
    {
        "code": "reactivation_offer",
        "name": "Reactivation Offer",
        "recommended_size": "1024x1536",
        "description": "Portrait creative for win-back and dormant customer outreach",
    },
]
_MARKETING_IMAGE_CHANNELS: list[dict[str, str]] = [
    {
        "code": "instagram_feed",
        "name": "Instagram Feed",
        "recommended_size": "1024x1024",
        "description": "Square layout optimized for social feed posts",
    },
    {
        "code": "facebook_landscape",
        "name": "Facebook Landscape",
        "recommended_size": "1536x1024",
        "description": "Landscape layout optimized for Facebook ads and boosted posts",
    },
    {
        "code": "story_vertical",
        "name": "Story Vertical",
        "recommended_size": "1024x1536",
        "description": "Vertical creative for stories and mobile-first placements",
    },
]
_MARKETING_IMAGE_TRADE_TEMPLATES: list[dict[str, str]] = [
    {
        "code": "general_home_services",
        "name": "General Home Services",
        "description": "Practical, trustworthy home service visual style with clean iconography",
    },
    {
        "code": "hvac",
        "name": "HVAC",
        "description": "Heating and cooling visuals, seasonal comfort messaging, reliability-first tone",
    },
    {
        "code": "plumbing",
        "name": "Plumbing",
        "description": "Fast-response plumbing visuals, urgency + trust, clear service promise",
    },
    {
        "code": "electrical",
        "name": "Electrical",
        "description": "Professional electrical service visuals with safety-focused messaging",
    },
]
_MARKETING_IMAGE_CAMPAIGN_PACKS: list[dict[str, str]] = [
    {
        "code": "spring_tuneup_hvac",
        "name": "Spring Tune-Up HVAC",
        "description": "Seasonal lead-generation campaign for HVAC tune-ups",
        "template_code": "seasonal_offer",
        "channel_code": "facebook_landscape",
        "trade_code": "hvac",
        "service_type": "HVAC",
        "offer_text": "Spring Tune-Up Special - Save 20% This Week",
        "cta_text": "Book Tune-Up",
        "primary_color": "#0f172a",
        "prompt": "Use a trustworthy residential HVAC scene, highlight comfort and reliability, and keep the CTA area highly visible.",
    },
    {
        "code": "emergency_plumbing_fast",
        "name": "Emergency Plumbing Fast Response",
        "description": "Urgency-focused creative for emergency plumbing calls",
        "template_code": "social_promo",
        "channel_code": "instagram_feed",
        "trade_code": "plumbing",
        "service_type": "Plumbing",
        "offer_text": "24/7 Emergency Plumbing - Fast Local Response",
        "cta_text": "Call Now",
        "primary_color": "#0b3b5a",
        "prompt": "Use a clean modern style with urgent but professional tone, emphasizing speed and trust.",
    },
    {
        "code": "electrical_safety_check",
        "name": "Electrical Safety Check",
        "description": "Safety and inspection campaign for electrical services",
        "template_code": "review_push",
        "channel_code": "instagram_feed",
        "trade_code": "electrical",
        "service_type": "Electrical",
        "offer_text": "Home Electrical Safety Check - Limited Slots",
        "cta_text": "Schedule Inspection",
        "primary_color": "#111827",
        "prompt": "Use reassuring visuals and clear hierarchy, emphasizing safety, expertise, and easy booking.",
    },
]


def _ensure_marketing_access(current_user: User) -> None:
    role = normalize_user_role(cast(str | None, current_user.role))
    if role not in _ALLOWED_MARKETING_ROLES:
        raise HTTPException(status_code=403, detail="Role cannot manage marketing campaigns")


def _compose_marketing_prompt(payload: MarketingImageGenerateRequest) -> str:
    template = next((item for item in _MARKETING_IMAGE_TEMPLATES if item["code"] == payload.template_code), None)
    if not template:
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_TEMPLATES)
        raise HTTPException(status_code=400, detail=f"template_code must be one of: {allowed}")

    channel = next((item for item in _MARKETING_IMAGE_CHANNELS if item["code"] == payload.channel_code), None)
    if not channel:
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_CHANNELS)
        raise HTTPException(status_code=400, detail=f"channel_code must be one of: {allowed}")

    trade_template = next((item for item in _MARKETING_IMAGE_TRADE_TEMPLATES if item["code"] == payload.trade_code), None)
    if not trade_template:
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_TRADE_TEMPLATES)
        raise HTTPException(status_code=400, detail=f"trade_code must be one of: {allowed}")

    service_type = (payload.service_type or "home service").strip()
    business_name = (payload.business_name or "local business").strip()
    offer_text = (payload.offer_text or "Limited-time savings").strip()
    cta_text = (payload.cta_text or "Book today").strip()
    primary_color = (payload.primary_color or "#0f172a").strip()

    guardrails = (
        "Design must be conversion-focused and mobile-friendly. "
        "Use bold, high-contrast typography. "
        "Do not include logos, trademarks, or copyrighted characters. "
        "Do not include photo-real likenesses of real people."
    )

    return (
        f"Template: {template['name']}. "
        f"Channel: {channel['name']} ({channel['recommended_size']}). "
        f"Trade style: {trade_template['name']} - {trade_template['description']}. "
        f"Create a marketing image for {business_name} in the {service_type} industry. "
        f"Primary offer text: {offer_text}. CTA text: {cta_text}. "
        f"Primary color: {primary_color}. "
        f"User prompt guidance: {payload.prompt.strip()}. "
        f"{guardrails}"
    )


def _validate_pack_codes(template_code: str, channel_code: str, trade_code: str) -> None:
    if not any(item["code"] == template_code for item in _MARKETING_IMAGE_TEMPLATES):
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_TEMPLATES)
        raise HTTPException(status_code=400, detail=f"template_code must be one of: {allowed}")
    if not any(item["code"] == channel_code for item in _MARKETING_IMAGE_CHANNELS):
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_CHANNELS)
        raise HTTPException(status_code=400, detail=f"channel_code must be one of: {allowed}")
    if not any(item["code"] == trade_code for item in _MARKETING_IMAGE_TRADE_TEMPLATES):
        allowed = ", ".join(item["code"] for item in _MARKETING_IMAGE_TRADE_TEMPLATES)
        raise HTTPException(status_code=400, detail=f"trade_code must be one of: {allowed}")


@router.get("/marketing/ai-images/templates", response_model=List[MarketingImageTemplateOut])
def list_marketing_image_templates(
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return _MARKETING_IMAGE_TEMPLATES


@router.get("/marketing/ai-images/channels", response_model=List[MarketingImageChannelOut])
def list_marketing_image_channels(
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return _MARKETING_IMAGE_CHANNELS


@router.get("/marketing/ai-images/trade-templates", response_model=List[MarketingImageTradeTemplateOut])
def list_marketing_image_trade_templates(
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return _MARKETING_IMAGE_TRADE_TEMPLATES


@router.get("/marketing/ai-images/campaign-packs", response_model=List[MarketingImageCampaignPackOut])
def list_marketing_image_campaign_packs(
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return _MARKETING_IMAGE_CAMPAIGN_PACKS


@router.get("/marketing/ai-images/custom-packs", response_model=List[MarketingImageCustomCampaignPackOut])
def list_marketing_image_custom_campaign_packs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    org_id = int(cast(int, current_user.organization_id))
    return (
        db.query(MarketingImageCampaignPack)
        .filter(MarketingImageCampaignPack.organization_id == org_id)
        .order_by(MarketingImageCampaignPack.updated_at.desc(), MarketingImageCampaignPack.id.desc())
        .all()
    )


@router.post("/marketing/ai-images/custom-packs", response_model=MarketingImageCustomCampaignPackOut, status_code=status.HTTP_201_CREATED)
def create_marketing_image_custom_campaign_pack(
    payload: MarketingImageCustomCampaignPackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    _validate_pack_codes(payload.template_code, payload.channel_code, payload.trade_code)
    org_id = int(cast(int, current_user.organization_id))

    pack = MarketingImageCampaignPack(
        code=f"custom_{token_urlsafe(8)}",
        name=payload.name.strip(),
        description=payload.description.strip(),
        template_code=payload.template_code,
        channel_code=payload.channel_code,
        trade_code=payload.trade_code,
        service_type=payload.service_type.strip(),
        offer_text=payload.offer_text.strip(),
        cta_text=payload.cta_text.strip(),
        primary_color=payload.primary_color.strip(),
        prompt=payload.prompt.strip(),
        organization_id=org_id,
    )
    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack


@router.patch("/marketing/ai-images/custom-packs/{pack_id}", response_model=MarketingImageCustomCampaignPackOut)
def update_marketing_image_custom_campaign_pack(
    pack_id: int,
    payload: MarketingImageCustomCampaignPackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    _validate_pack_codes(payload.template_code, payload.channel_code, payload.trade_code)
    org_id = int(cast(int, current_user.organization_id))
    pack = (
        db.query(MarketingImageCampaignPack)
        .filter(
            MarketingImageCampaignPack.id == pack_id,
            MarketingImageCampaignPack.organization_id == org_id,
        )
        .first()
    )
    if not pack:
        raise HTTPException(status_code=404, detail="Custom campaign pack not found")

    updates = {
        "name": payload.name.strip(),
        "description": payload.description.strip(),
        "template_code": payload.template_code,
        "channel_code": payload.channel_code,
        "trade_code": payload.trade_code,
        "service_type": payload.service_type.strip(),
        "offer_text": payload.offer_text.strip(),
        "cta_text": payload.cta_text.strip(),
        "primary_color": payload.primary_color.strip(),
        "prompt": payload.prompt.strip(),
    }
    for field, value in updates.items():
        setattr(pack, field, value)

    db.add(pack)
    db.commit()
    db.refresh(pack)
    return pack


@router.delete("/marketing/ai-images/custom-packs/{pack_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_marketing_image_custom_campaign_pack(
    pack_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    org_id = int(cast(int, current_user.organization_id))
    pack = (
        db.query(MarketingImageCampaignPack)
        .filter(
            MarketingImageCampaignPack.id == pack_id,
            MarketingImageCampaignPack.organization_id == org_id,
        )
        .first()
    )
    if not pack:
        raise HTTPException(status_code=404, detail="Custom campaign pack not found")

    db.delete(pack)
    db.commit()
    return None


@router.get("/marketing/campaigns", response_model=List[MarketingCampaignOut])
def list_marketing_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return list_campaigns(db, int(cast(int, current_user.organization_id)))


@router.post("/marketing/campaigns", response_model=MarketingCampaignOut, status_code=status.HTTP_201_CREATED)
def create_marketing_campaign(
    payload: MarketingCampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    return create_campaign(db, payload.model_dump(), int(cast(int, current_user.organization_id)))


@router.post("/marketing/campaigns/{campaign_id}/launch", response_model=MarketingCampaignLaunchOut)
def launch_marketing_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    campaign = get_campaign(db, campaign_id, int(cast(int, current_user.organization_id)))
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    generated = launch_campaign(db, campaign)
    return {
        "campaign_id": campaign.id,
        "status": campaign.status,
        "generated_recipients": generated,
    }


@router.post("/marketing/reactivation/run", response_model=ReactivationRunOut)
def run_reactivation_engine_api(
    payload: ReactivationRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    org_id = int(cast(int, current_user.organization_id))
    return run_reactivation_engine(
        db,
        organization_id=org_id,
        lookback_days=payload.lookback_days,
        limit=payload.limit,
        dry_run=payload.dry_run,
    )


@router.post("/marketing/ai-images/generate", response_model=MarketingImageGenerateOut)
def generate_marketing_image_api(
    payload: MarketingImageGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    composed_prompt = _compose_marketing_prompt(payload)
    try:
        image = generate_marketing_image(
            prompt=composed_prompt,
            size=payload.size,
            quality=payload.quality,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "model": image.model,
        "mime_type": image.mime_type,
        "image_base64": image.image_base64,
        "revised_prompt": image.revised_prompt,
    }


@router.post("/marketing/expert/operator", response_model=MarketingExpertOperatorOut)
def run_marketing_expert_operator_api(
    payload: MarketingExpertOperatorRequest,
    current_user: User = Depends(get_current_user),
):
    _ensure_marketing_access(current_user)
    try:
        data = run_marketing_expert_operator(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return data
