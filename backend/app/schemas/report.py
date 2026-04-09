from pydantic import BaseModel


class RevenuePathReportOut(BaseModel):
    organization_id: int
    leads_total: int
    leads_new: int
    leads_contacted: int
    leads_qualified: int
    leads_converted: int
    jobs_total: int
    jobs_dispatched: int
    invoices_total: int
    invoices_unpaid: int
    invoices_overdue: int
    reminders_pending: int
    reminders_overdue: int
    collection_reminders_pending: int


class LeadConversionDayOut(BaseModel):
    date: str
    intakes: int
    qualified: int
    booked: int
    qualification_rate: float
    booking_rate: float


class LeadConversionMetricsOut(BaseModel):
    organization_id: int
    timestamp: str
    days: int
    totals: dict
    source_breakdown: dict
    intake_route_breakdown: dict
    recommended_next_action: str
    timeline: list[LeadConversionDayOut]


class OperationalDashboardOut(BaseModel):
    organization_id: int
    timestamp: str
    lead_pipeline: dict
    job_status: dict
    invoice_summary: dict
    overdue_invoices: dict
    sla_breaches: dict
    reminders: dict
    revenue_metrics: dict
    action_priorities: dict


class SLABreachEscalationOut(BaseModel):
    organization_id: int
    stale_dispatched_jobs: int
    severe_overdue_invoices: int
    job_sla_alerts_created: int
    invoice_sla_alerts_created: int
    total_alerts_created: int


class DailyDigestOut(BaseModel):
    organization_id: int
    timestamp: str
    summary: dict
    cash_risk: dict
    sla: dict
    pipeline: dict
    weekly_trends: dict
    recommended_actions: list[str]


class OperatorQueueItemOut(BaseModel):
    item_type: str
    entity_id: int
    title: str
    urgency: str
    priority_score: int
    revenue_impact: float | None = None
    due_at: str | None = None
    action: str


class OperatorQueueOut(BaseModel):
    organization_id: int
    timestamp: str
    limit: int
    total_candidates: int
    items: list[OperatorQueueItemOut]


class OperatorQueueAckIn(BaseModel):
    item_type: str
    entity_id: int


class OperatorQueueAckOut(BaseModel):
    organization_id: int
    item_type: str
    entity_id: int
    acknowledged: bool
    already_acknowledged: bool
    acknowledged_at: str


class OperatorQueueUnackIn(BaseModel):
    item_type: str
    entity_id: int


class OperatorQueueUnackOut(BaseModel):
    organization_id: int
    item_type: str
    entity_id: int
    unacknowledged: bool
    already_unacknowledged: bool
    unacknowledged_at: str


class OperatorQueueHistoryEventOut(BaseModel):
    action: str
    item_type: str
    entity_id: int
    timestamp: str
    actor_user_id: int | None = None
    actor_email: str | None = None


class OperatorQueueHistoryOut(BaseModel):
    organization_id: int
    timestamp: str
    limit: int
    events: list[OperatorQueueHistoryEventOut]


class GrowthControlTowerCampaignsOut(BaseModel):
    total: int
    draft: int
    launched: int
    last_launched_at: str | None = None


class GrowthControlTowerKpisOut(BaseModel):
    lead_intakes: int
    lead_booked: int
    lead_booking_rate: float
    unpaid_total_amount: float
    overdue_invoice_count: int
    urgent_now: int


class GrowthControlTowerQueueOut(BaseModel):
    total_candidates: int
    items: list[OperatorQueueItemOut]


class GrowthControlTowerOut(BaseModel):
    organization_id: int
    timestamp: str
    campaigns: GrowthControlTowerCampaignsOut
    kpis: GrowthControlTowerKpisOut
    recommended_next_action: str
    operator_queue: GrowthControlTowerQueueOut


class OperationalHistoryDayOut(BaseModel):
    date: str
    leads_created: int
    jobs_completed: int
    invoices_issued_count: int
    invoices_issued_amount: float
    payments_collected_count: int
    payments_collected_amount: float
    reminders_due: int


class OperationalHistoryOut(BaseModel):
    organization_id: int
    start_date: str
    end_date: str
    days: int
    rows: list[OperationalHistoryDayOut]
