from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MarketingCampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    kind: str = Field(default="review_harvester")
    channel: str = Field(default="sms")
    template: Optional[str] = None
    lookback_days: int = Field(default=90, ge=7, le=730)


class MarketingCampaignOut(BaseModel):
    id: int
    name: str
    kind: str
    status: str
    channel: str
    template: Optional[str] = None
    lookback_days: int
    launched_at: Optional[datetime] = None
    organization_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MarketingCampaignLaunchOut(BaseModel):
    campaign_id: int
    status: str
    generated_recipients: int


class ReactivationRunRequest(BaseModel):
    lookback_days: int = Field(default=180, ge=30, le=1460)
    limit: int = Field(default=250, ge=1, le=1000)
    dry_run: bool = False


class ReactivationRunOut(BaseModel):
    organization_id: int
    lookback_days: int
    dry_run: bool
    candidate_count: int
    queued_count: int
    queued_customer_ids: list[int]


class MarketingImageGenerateRequest(BaseModel):
    prompt: str = Field(min_length=8, max_length=2000)
    size: str = Field(default="1024x1024")
    quality: str = Field(default="high")
    template_code: str = Field(default="social_promo")
    channel_code: str = Field(default="instagram_feed")
    trade_code: str = Field(default="general_home_services")
    business_name: Optional[str] = Field(default=None, max_length=120)
    service_type: Optional[str] = Field(default=None, max_length=80)
    offer_text: Optional[str] = Field(default=None, max_length=180)
    cta_text: Optional[str] = Field(default=None, max_length=120)
    primary_color: Optional[str] = Field(default=None, max_length=32)


class MarketingImageGenerateOut(BaseModel):
    model: str
    mime_type: str
    image_base64: str
    revised_prompt: Optional[str] = None


class MarketingImageTemplateOut(BaseModel):
    code: str
    name: str
    recommended_size: str
    description: str


class MarketingImageChannelOut(BaseModel):
    code: str
    name: str
    recommended_size: str
    description: str


class MarketingImageTradeTemplateOut(BaseModel):
    code: str
    name: str
    description: str


class MarketingImageCampaignPackOut(BaseModel):
    code: str
    name: str
    description: str
    template_code: str
    channel_code: str
    trade_code: str
    service_type: str
    offer_text: str
    cta_text: str
    primary_color: str
    prompt: str


class MarketingImageCustomCampaignPackCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="Custom saved preset", min_length=2, max_length=240)
    template_code: str = Field(default="social_promo")
    channel_code: str = Field(default="instagram_feed")
    trade_code: str = Field(default="general_home_services")
    service_type: str = Field(min_length=2, max_length=80)
    offer_text: str = Field(min_length=2, max_length=180)
    cta_text: str = Field(min_length=2, max_length=120)
    primary_color: str = Field(min_length=2, max_length=32)
    prompt: str = Field(min_length=8, max_length=2000)


class MarketingImageCustomCampaignPackUpdate(MarketingImageCustomCampaignPackCreate):
    pass


class MarketingImageCustomCampaignPackOut(MarketingImageCampaignPackOut):
    id: int
    organization_id: int
    model_config = ConfigDict(from_attributes=True)


class MarketingExpertOperatorRequest(BaseModel):
    business_name: str = Field(min_length=2, max_length=120)
    website_url: Optional[str] = Field(default=None, max_length=240)
    vertical: str = Field(min_length=2, max_length=80)
    service_area: str = Field(min_length=2, max_length=160)
    weekly_ad_budget_usd: int = Field(ge=1, le=50000)
    primary_goal: str = Field(default="book_more_jobs", min_length=4, max_length=120)
    current_channels: list[str] = Field(default_factory=list)
    notes: Optional[str] = Field(default=None, max_length=4000)


class MarketingExpertOfferOut(BaseModel):
    title: str
    audience: str
    hook: str
    cta: str


class MarketingExpertChannelPlanOut(BaseModel):
    channel: str
    objective: str
    weekly_budget_usd: int
    campaign_structure: list[str]


class MarketingExpertContentPlanOut(BaseModel):
    blog_titles: list[str]
    ad_concepts: list[str]
    social_posts: list[str]


class MarketingExpertExecutionOut(BaseModel):
    week_1: list[str]
    week_2: list[str]
    week_3: list[str]
    week_4: list[str]


class MarketingExpertOperatorOut(BaseModel):
    strategy_summary: str
    positioning: str
    offers: list[MarketingExpertOfferOut]
    channel_plan: list[MarketingExpertChannelPlanOut]
    content_plan: MarketingExpertContentPlanOut
    competitor_gaps: list[str]
    lead_sources: list[str]
    kpi_targets: list[str]
    execution: MarketingExpertExecutionOut
