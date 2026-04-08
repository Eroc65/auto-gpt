from datetime import datetime, timezone
from secrets import token_urlsafe

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..core.db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _new_intake_key() -> str:
    return f"org_{token_urlsafe(12)}"

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    intake_key = Column(String, unique=True, index=True, nullable=False, default=_new_intake_key)
    ai_guide_enabled = Column(Integer, nullable=False, default=0)
    ai_guide_stage = Column(String, nullable=False, default="off")
    users = relationship("User", back_populates="organization")
    customers = relationship("Customer", back_populates="organization")
    jobs = relationship("Job", back_populates="organization")
    technicians = relationship("Technician", back_populates="organization")
    estimates = relationship("Estimate", back_populates="organization")
    invoices = relationship("Invoice", back_populates="organization")
    reminders = relationship("Reminder", back_populates="organization")
    notes = relationship("Note", back_populates="organization")
    leads = relationship("Lead", back_populates="organization")
    job_activities = relationship("JobActivity", back_populates="organization")
    lead_activities = relationship("LeadActivity", back_populates="organization")
    user_role_events = relationship("UserRoleAuditEvent", back_populates="organization")
    marketing_campaigns = relationship("MarketingCampaign", back_populates="organization")
    marketing_campaign_recipients = relationship("MarketingCampaignRecipient", back_populates="organization")
    marketing_image_campaign_packs = relationship("MarketingImageCampaignPack", back_populates="organization")
    help_articles = relationship("HelpArticle", back_populates="organization")
    coaching_snippets = relationship("CoachingSnippet", back_populates="organization")
    comm_profile = relationship("CommunicationTenantProfile", back_populates="organization", uselist=False)
    sms_opt_outs = relationship("SmsOptOut", back_populates="organization")
    voice_transcripts = relationship("VoiceTranscript", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="owner")
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="users")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True)
    phone = Column(String)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="customers")
    jobs = relationship("Job", back_populates="customer")
    notes = relationship("Note", back_populates="customer")
    reminders = relationship("Reminder", back_populates="customer")
    marketing_campaign_recipients = relationship("MarketingCampaignRecipient", back_populates="customer")

JOB_VALID_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"approved", "estimate_rejected", "dispatched"},
    "approved": {"dispatched"},
    "estimate_rejected": {"pending"},
    "dispatched": {"on_my_way", "in_progress", "completed"},
    "on_my_way": {"in_progress", "completed"},
    "in_progress": {"completed"},
    "completed": set(),
}


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pending")
    scheduled_time = Column(DateTime)
    on_my_way_at = Column(DateTime)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    completion_notes = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("technicians.id"))
    organization = relationship("Organization", back_populates="jobs")
    customer = relationship("Customer", back_populates="jobs")
    technician = relationship("Technician", back_populates="jobs")
    estimates = relationship("Estimate", back_populates="job")
    invoices = relationship("Invoice", back_populates="job")
    reminders = relationship("Reminder", back_populates="job")
    notes = relationship("Note", back_populates="job")
    activities = relationship("JobActivity", back_populates="job")


class JobActivity(Base):
    __tablename__ = "job_activities"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    from_status = Column(String)
    to_status = Column(String, nullable=False)
    note = Column(Text)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="job_activities")
    job = relationship("Job", back_populates="activities")

class Technician(Base):
    __tablename__ = "technicians"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    availability_start_hour_utc = Column(Integer, nullable=False, default=8)
    availability_end_hour_utc = Column(Integer, nullable=False, default=19)
    availability_weekdays = Column(String, nullable=False, default="0,1,2,3,4")
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="technicians")
    jobs = relationship("Job", back_populates="technician")

class Estimate(Base):
    __tablename__ = "estimates"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    status = Column(String, nullable=False, default="draft")
    issued_at = Column(DateTime, default=_utcnow, nullable=False)
    approved_at = Column(DateTime)
    rejected_at = Column(DateTime)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="estimates")
    job = relationship("Job", back_populates="estimates")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String, default="unpaid")
    issued_at = Column(DateTime, default=_utcnow, nullable=False)
    due_at = Column(DateTime, index=True)
    paid_at = Column(DateTime)
    payment_reminder_stage = Column(String, default="none")  # none | initial | first_overdue | second_overdue | final
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="invoices")
    job = relationship("Job", back_populates="invoices")

REMINDER_STATUSES = ("pending", "sent", "dismissed")
REMINDER_CHANNELS = ("sms", "email", "call", "internal")


class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    channel = Column(String, nullable=False, default="internal")  # sms | email | call | internal
    status = Column(String, nullable=False, default="pending")    # pending | sent | dismissed
    due_at = Column(DateTime, nullable=False, index=True)          # when the follow-up is due
    sent_at = Column(DateTime)                                     # set when status → sent
    delivered_at = Column(DateTime)
    responded_at = Column(DateTime)
    external_message_id = Column(String)
    dispatch_attempts = Column(Integer, nullable=False, default=0)
    last_dispatch_error = Column(Text)
    # Optional context links — a reminder may be for a lead, job, or standalone
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="reminders")
    job = relationship("Job", back_populates="reminders")
    lead = relationship("Lead", back_populates="reminders")
    customer = relationship("Customer", back_populates="reminders")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="notes")
    job = relationship("Job", back_populates="notes")
    customer = relationship("Customer", back_populates="notes")


# ---------------------------------------------------------------------------
# Lead — inbound contact before it becomes a customer/job
# ---------------------------------------------------------------------------

LEAD_VALID_TRANSITIONS: dict[str, set[str]] = {
    "new": {"contacted", "qualified", "dismissed"},
    "contacted": {"qualified", "dismissed"},
    "qualified": {"converted", "dismissed"},
    "converted": set(),
    "dismissed": set(),
}


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, index=True)
    email = Column(String)
    source = Column(String, nullable=False, default="manual")  # web_form | missed_call | sms | manual
    status = Column(String, nullable=False, default="new")     # new | contacted | qualified | converted | dismissed
    raw_message = Column(Text)   # voicemail transcript, form body, SMS text, etc.
    notes = Column(Text)
    priority_score = Column(Integer)  # 0-100 score used for qualification ranking
    qualified_at = Column(DateTime)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="leads")
    reminders = relationship("Reminder", back_populates="lead")
    activities = relationship("LeadActivity", back_populates="lead")


class LeadActivity(Base):
    __tablename__ = "lead_activities"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    from_status = Column(String)
    to_status = Column(String, nullable=False)
    note = Column(Text)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="lead_activities")
    lead = relationship("Lead", back_populates="activities")


class UserRoleAuditEvent(Base):
    __tablename__ = "user_role_audit_events"
    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    from_role = Column(String, nullable=False)
    to_role = Column(String, nullable=False)
    note = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="user_role_events")


MARKETING_CAMPAIGN_KINDS = ("review_harvester", "reactivation")
MARKETING_CAMPAIGN_STATUSES = ("draft", "launched")
MARKETING_RECIPIENT_STATUSES = ("queued", "sent", "failed", "responded")


class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False, default="review_harvester")
    status = Column(String, nullable=False, default="draft")
    channel = Column(String, nullable=False, default="sms")
    template = Column(Text)
    lookback_days = Column(Integer, nullable=False, default=90)
    launched_at = Column(DateTime)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="marketing_campaigns")
    recipients = relationship("MarketingCampaignRecipient", back_populates="campaign")


class MarketingCampaignRecipient(Base):
    __tablename__ = "marketing_campaign_recipients"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("marketing_campaigns.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(String, nullable=False, default="queued")
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    sent_at = Column(DateTime)
    campaign = relationship("MarketingCampaign", back_populates="recipients")
    customer = relationship("Customer", back_populates="marketing_campaign_recipients")
    organization = relationship("Organization", back_populates="marketing_campaign_recipients")


class MarketingImageCampaignPack(Base):
    __tablename__ = "marketing_image_campaign_packs"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False, default="Custom saved preset")
    template_code = Column(String, nullable=False, default="social_promo")
    channel_code = Column(String, nullable=False, default="instagram_feed")
    trade_code = Column(String, nullable=False, default="general_home_services")
    service_type = Column(String, nullable=False)
    offer_text = Column(String, nullable=False)
    cta_text = Column(String, nullable=False)
    primary_color = Column(String, nullable=False)
    prompt = Column(Text, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="marketing_image_campaign_packs")


class HelpArticle(Base):
    __tablename__ = "help_articles"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False, default="general")
    context_key = Column(String, nullable=False, default="general")
    body = Column(Text, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="help_articles")


class CoachingSnippet(Base):
    __tablename__ = "coaching_snippets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    trade = Column(String, nullable=False, default="general")
    issue_pattern = Column(String, nullable=False)
    senior_tip = Column(Text, nullable=False)
    checklist = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="coaching_snippets")


class CommunicationTenantProfile(Base):
    __tablename__ = "communication_tenant_profiles"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, unique=True)
    active = Column(Integer, nullable=False, default=1)
    twilio_account_sid = Column(String)
    twilio_auth_token = Column(String)
    twilio_messaging_service_sid = Column(String)
    twilio_phone_number = Column(String)
    retell_agent_id = Column(String)
    retell_phone_number = Column(String)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="comm_profile")


class SmsOptOut(Base):
    __tablename__ = "sms_opt_outs"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    phone = Column(String, nullable=False, index=True)
    source = Column(String, nullable=False, default="customer_reply")
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="sms_opt_outs")


class VoiceTranscript(Base):
    __tablename__ = "voice_transcripts"
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String, nullable=False, default="call_recording")
    audio_filename = Column(String, nullable=False)
    audio_content_type = Column(String)
    caller_phone = Column(String)
    call_id = Column(String, index=True)
    transcription_model = Column(String, nullable=False)
    transcript_text = Column(Text, nullable=False)
    extraction_json = Column(Text)
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    organization = relationship("Organization", back_populates="voice_transcripts")
