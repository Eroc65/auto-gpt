from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AIGuideSettingsUpdate(BaseModel):
    enabled: bool
    stage: str = Field(default="onboarding", min_length=2, max_length=40)


class AIGuideSettingsOut(BaseModel):
    organization_id: int
    enabled: bool
    stage: str


class HelpArticleCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=140)
    category: str = Field(default="general", min_length=2, max_length=40)
    context_key: str = Field(default="general", min_length=2, max_length=60)
    body: str = Field(min_length=10)


class HelpArticleOut(BaseModel):
    id: int
    slug: str
    title: str
    category: str
    context_key: str
    body: str
    organization_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CoachingSnippetCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    trade: str = Field(default="general", min_length=2, max_length=40)
    issue_pattern: str = Field(min_length=4, max_length=200)
    senior_tip: str = Field(min_length=10)
    checklist: Optional[str] = None


class CoachingSnippetOut(BaseModel):
    id: int
    title: str
    trade: str
    issue_pattern: str
    senior_tip: str
    checklist: Optional[str] = None
    organization_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MarketingServicePackageOut(BaseModel):
    code: str
    name: str
    monthly_price_usd: int
    summary: str
    includes: list[str]
    checkout_url: Optional[str] = None


class CommunicationTenantProfileUpdate(BaseModel):
    active: bool = True
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_messaging_service_sid: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    retell_agent_id: Optional[str] = None
    retell_phone_number: Optional[str] = None


class CommunicationTenantProfileOut(BaseModel):
    organization_id: int
    active: bool
    twilio_account_sid: Optional[str] = None
    twilio_messaging_service_sid: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    retell_agent_id: Optional[str] = None
    retell_phone_number: Optional[str] = None


class TwilioInboundMessageIn(BaseModel):
    from_phone: str = Field(min_length=7, max_length=32)
    body: str = Field(min_length=1, max_length=1600)
    message_sid: Optional[str] = None


class TwilioStatusEventIn(BaseModel):
    message_sid: str
    message_status: str


class TwilioVoiceCallEventIn(BaseModel):
    call_sid: str = Field(min_length=2, max_length=120)
    from_phone: str = Field(min_length=7, max_length=32)
    call_status: str = Field(default="completed", min_length=2, max_length=40)
    caller_name: Optional[str] = Field(default=None, max_length=120)
    recording_url: Optional[str] = Field(default=None, max_length=500)


class RetellCallEventIn(BaseModel):
    call_id: str = Field(min_length=2, max_length=120)
    from_phone: str = Field(min_length=7, max_length=32)
    caller_name: Optional[str] = Field(default=None, max_length=120)
    call_status: str = Field(default="completed", min_length=2, max_length=40)
    transcript: Optional[str] = Field(default=None, max_length=10000)
    summary: Optional[str] = Field(default=None, max_length=2000)
    missed_call: bool = False


class ZapierLeadIn(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    email: Optional[str] = Field(default=None, max_length=255)
    service: Optional[str] = Field(default=None, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=4000)
    source: str = Field(default="zapier", min_length=2, max_length=40)


class ZapierPushLeadIn(BaseModel):
    workflow: str = Field(default="lead_created", min_length=2, max_length=80)
    webhook_url: Optional[str] = Field(default=None, max_length=500)
    include_raw_message: bool = True
