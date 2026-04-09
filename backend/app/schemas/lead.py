from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class LeadIntake(BaseModel):
    """Public intake — used by webhook, form, or missed-call handler."""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: str = "web_form"
    raw_message: Optional[str] = None
    website: Optional[str] = None


class MissedCallIntake(BaseModel):
    phone: str
    name: Optional[str] = None
    raw_message: Optional[str] = None
    call_sid: Optional[str] = None
    website: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: str


class LeadQualificationInput(BaseModel):
    emergency: bool = False
    budget_confirmed: bool = False
    requested_within_48h: bool = False
    service_category: Optional[str] = None


class LeadOut(BaseModel):
    id: int
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    source: str
    status: str
    raw_message: Optional[str] = None
    notes: Optional[str] = None
    priority_score: Optional[int] = None
    qualified_at: Optional[datetime] = None
    organization_id: int
    customer_id: Optional[int] = None
    job_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LeadConvertOut(BaseModel):
    lead_id: int
    customer_id: int
    job_id: int


class MissedCallRecoveryOut(BaseModel):
    lead: LeadOut
    deduplicated: bool
    reminder_created: bool


class LeadQualificationOut(BaseModel):
    lead: LeadOut
    booking_reminder_created: bool


class LeadBookInput(BaseModel):
    scheduled_time: datetime
    technician_id: int


class LeadBookOut(BaseModel):
    lead_id: int
    customer_id: int
    job_id: int
    job_status: str
    scheduled_time: datetime
    technician_id: int
    booking_reminders_dismissed: int


class LeadActivityOut(BaseModel):
    id: int
    action: str
    from_status: Optional[str] = None
    to_status: str
    note: Optional[str] = None
    actor_user_id: Optional[int] = None
    actor_email: Optional[str] = None
    lead_id: int
    organization_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
