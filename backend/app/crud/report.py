from datetime import date, datetime, timedelta
from typing import Any, cast

from sqlalchemy import func

from ..models.core import Invoice, Job, Lead, MarketingCampaign, Reminder, User, _utcnow


OPERATOR_QUEUE_ITEM_TYPES = {
    "invoice_collection",
    "job_completion",
    "reminder_followup",
    "lead_followup",
}


def _queue_ack_message(item_type: str, entity_id: int) -> str:
    return f"Queue ack: {item_type}#{entity_id}"


def _queue_unack_message(item_type: str, entity_id: int) -> str:
    return f"Queue unack: {item_type}#{entity_id}"


def _queue_parse_event(message: str) -> tuple[str, tuple[str, int]] | tuple[None, None]:
    if message.startswith("Queue ack: "):
        action = "ack"
        payload = message[len("Queue ack: "):]
    elif message.startswith("Queue unack: "):
        action = "unack"
        payload = message[len("Queue unack: "):]
    else:
        return None, None

    if "#" not in payload:
        return None, None
    item_type, entity_str = payload.split("#", 1)
    if item_type not in OPERATOR_QUEUE_ITEM_TYPES:
        return None, None
    try:
        entity_id = int(entity_str)
    except ValueError:
        return None, None
    return action, (item_type, entity_id)


def _queue_suppression_state(db, organization_id: int) -> dict[tuple[str, int], bool]:
    state: dict[tuple[str, int], bool] = {}
    events = (
        db.query(Reminder)
        .filter(
            Reminder.organization_id == organization_id,
            Reminder.message.like("Queue %:%"),
        )
        .order_by(Reminder.created_at.asc(), Reminder.id.asc())
        .all()
    )
    for evt in events:
        action, key = _queue_parse_event(evt.message)
        if not action or not key:
            continue
        state[key] = action == "ack"
    return state


def _queue_actor_user_id(reminder: Reminder) -> int | None:
    raw_val = cast(str | None, reminder.last_dispatch_error)
    if raw_val is None:
        return None
    raw = str(raw_val)
    prefix = "actor_user_id="
    if not raw.startswith(prefix):
        return None
    try:
        return int(raw[len(prefix):])
    except ValueError:
        return None


def get_revenue_path_report(db, organization_id: int) -> dict:
    now = _utcnow()

    leads_total = db.query(Lead).filter(Lead.organization_id == organization_id).count()
    leads_new = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "new").count()
    leads_contacted = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "contacted").count()
    leads_qualified = (
        db.query(Lead)
        .filter(Lead.organization_id == organization_id, Lead.qualified_at.isnot(None))
        .count()
    )
    leads_converted = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "converted").count()

    jobs_total = db.query(Job).filter(Job.organization_id == organization_id).count()
    jobs_dispatched = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "dispatched").count()

    invoices_total = db.query(Invoice).filter(Invoice.organization_id == organization_id).count()
    invoices_unpaid = db.query(Invoice).filter(Invoice.organization_id == organization_id, Invoice.status == "unpaid").count()
    invoices_overdue = (
        db.query(Invoice)
        .filter(
            Invoice.organization_id == organization_id,
            Invoice.status == "unpaid",
            Invoice.due_at.isnot(None),
            Invoice.due_at < now,
        )
        .count()
    )

    reminders_pending = (
        db.query(Reminder)
        .filter(Reminder.organization_id == organization_id, Reminder.status == "pending")
        .count()
    )
    reminders_overdue = (
        db.query(Reminder)
        .filter(
            Reminder.organization_id == organization_id,
            Reminder.status == "pending",
            Reminder.due_at <= now,
        )
        .count()
    )
    collection_reminders_pending = (
        db.query(Reminder)
        .filter(
            Reminder.organization_id == organization_id,
            Reminder.status == "pending",
            Reminder.message.like("Collect payment for invoice%"),
        )
        .count()
    )

    return {
        "organization_id": organization_id,
        "leads_total": leads_total,
        "leads_new": leads_new,
        "leads_contacted": leads_contacted,
        "leads_qualified": leads_qualified,
        "leads_converted": leads_converted,
        "jobs_total": jobs_total,
        "jobs_dispatched": jobs_dispatched,
        "invoices_total": invoices_total,
        "invoices_unpaid": invoices_unpaid,
        "invoices_overdue": invoices_overdue,
        "reminders_pending": reminders_pending,
        "reminders_overdue": reminders_overdue,
        "collection_reminders_pending": collection_reminders_pending,
    }


def get_lead_conversion_metrics(db, organization_id: int, days: int = 7) -> dict:
    now = _utcnow()
    start_day = (now - timedelta(days=max(0, days - 1))).date()

    lead_rows = (
        db.query(Lead)
        .filter(Lead.organization_id == organization_id)
        .all()
    )

    source_breakdown = {
        "web_form": 0,
        "missed_call": 0,
        "sms": 0,
        "manual": 0,
        "other": 0,
    }
    intake_route_breakdown = {
        "public_intake_org": 0,
        "public_intake_key": 0,
        "public_missed_call": 0,
        "unknown": 0,
    }

    buckets: dict[str, dict[str, Any]] = {}
    for offset in range(days):
        day = start_day + timedelta(days=offset)
        key = day.isoformat()
        buckets[key] = {
            "date": key,
            "intakes": 0,
            "qualified": 0,
            "booked": 0,
            "qualification_rate": 0.0,
            "booking_rate": 0.0,
        }

    for lead in lead_rows:
        created_day = cast(str, lead.created_at.date().isoformat())
        if created_day in buckets:
            buckets[created_day]["intakes"] = int(cast(int, buckets[created_day]["intakes"])) + 1
            lead_source = cast(str, lead.source)
            if lead_source in source_breakdown:
                source_breakdown[lead_source] = int(cast(int, source_breakdown[lead_source])) + 1
            else:
                source_breakdown["other"] = int(cast(int, source_breakdown["other"])) + 1

            raw_message = cast(str | None, lead.raw_message) or ""
            if "source_tag:public_intake_org" in raw_message:
                intake_route_breakdown["public_intake_org"] = int(cast(int, intake_route_breakdown["public_intake_org"])) + 1
            elif "source_tag:public_intake_key" in raw_message:
                intake_route_breakdown["public_intake_key"] = int(cast(int, intake_route_breakdown["public_intake_key"])) + 1
            elif "source_tag:public_missed_call" in raw_message:
                intake_route_breakdown["public_missed_call"] = int(cast(int, intake_route_breakdown["public_missed_call"])) + 1
            else:
                intake_route_breakdown["unknown"] = int(cast(int, intake_route_breakdown["unknown"])) + 1

        qualified_at = cast(datetime | None, lead.qualified_at)
        if qualified_at is not None:
            qualified_day = qualified_at.date().isoformat()
            if qualified_day in buckets:
                buckets[qualified_day]["qualified"] = int(cast(int, buckets[qualified_day]["qualified"])) + 1

        lead_status = cast(str, lead.status)
        if lead_status == "converted" and cast(object, lead.updated_at) is not None:
            booked_day = cast(str, lead.updated_at.date().isoformat())
            if booked_day in buckets:
                buckets[booked_day]["booked"] = int(cast(int, buckets[booked_day]["booked"])) + 1

    timeline: list[dict] = []
    for day_key in sorted(buckets.keys()):
        day = buckets[day_key]
        intakes = int(cast(int, day["intakes"]))
        qualified = int(cast(int, day["qualified"]))
        booked = int(cast(int, day["booked"]))
        day["qualification_rate"] = round((qualified / intakes * 100.0) if intakes > 0 else 0.0, 1)
        day["booking_rate"] = round((booked / intakes * 100.0) if intakes > 0 else 0.0, 1)
        timeline.append(day)

    totals_intakes = sum(int(cast(int, row["intakes"])) for row in timeline)
    totals_qualified = sum(int(cast(int, row["qualified"])) for row in timeline)
    totals_booked = sum(int(cast(int, row["booked"])) for row in timeline)
    qualification_rate = round((totals_qualified / totals_intakes * 100.0) if totals_intakes > 0 else 0.0, 1)
    booking_rate = round((totals_booked / totals_intakes * 100.0) if totals_intakes > 0 else 0.0, 1)

    if totals_intakes == 0:
        recommended_action = "Drive more top-of-funnel intake volume this week."
    elif qualification_rate < 40.0:
        recommended_action = "Tighten first-response and qualification scripts to lift conversion quality."
    elif booking_rate < 25.0:
        recommended_action = "Focus on speed-to-booking for qualified leads and offer tighter appointment windows."
    elif totals_booked < 3:
        recommended_action = "Increase follow-up cadence for contacted leads to improve booked jobs."
    else:
        recommended_action = "Maintain current process and monitor booked volume for consistency."

    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "days": days,
        "totals": {
            "intakes": totals_intakes,
            "qualified": totals_qualified,
            "booked": totals_booked,
            "qualification_rate": qualification_rate,
            "booking_rate": booking_rate,
        },
        "source_breakdown": source_breakdown,
        "intake_route_breakdown": intake_route_breakdown,
        "recommended_next_action": recommended_action,
        "timeline": timeline,
    }


def get_operational_dashboard(db, organization_id: int) -> dict:
    """Comprehensive operational dashboard with pipeline visibility and urgent metrics."""
    now = _utcnow()
    
    # Lead pipeline
    leads_new = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "new").count()
    leads_contacted = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "contacted").count()
    leads_qualified = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.qualified_at.isnot(None)).count()
    leads_converted = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "converted").count()
    leads_dismissed = db.query(Lead).filter(Lead.organization_id == organization_id, Lead.status == "dismissed").count()
    
    # Job breakdown
    jobs_pending = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "pending").count()
    jobs_approved = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "approved").count()
    jobs_dispatched = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "dispatched").count()
    jobs_on_my_way = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "on_my_way").count()
    jobs_in_progress = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "in_progress").count()
    jobs_completed = db.query(Job).filter(Job.organization_id == organization_id, Job.status == "completed").count()
    jobs_completed_today = db.query(Job).filter(
        Job.organization_id == organization_id,
        Job.status == "completed",
        Job.completed_at.isnot(None),
        func.date(Job.completed_at) == now.date().isoformat(),
    ).count()
    
    # Invoice breakdown
    invoices_unpaid = db.query(Invoice).filter(Invoice.organization_id == organization_id, Invoice.status == "unpaid").count()
    invoices_paid = db.query(Invoice).filter(Invoice.organization_id == organization_id, Invoice.status == "paid").count()
    invoices_void = db.query(Invoice).filter(Invoice.organization_id == organization_id, Invoice.status == "void").count()

    unpaid_invoice_rows = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
    ).all()
    unpaid_total_amount = sum(float(cast(float, inv.amount)) for inv in unpaid_invoice_rows)
    overdue_count = 0
    aging_buckets = {
        "current_not_due": {"count": 0, "amount": 0.0},
        "days_1_7": {"count": 0, "amount": 0.0},
        "days_8_14": {"count": 0, "amount": 0.0},
        "days_15_30": {"count": 0, "amount": 0.0},
        "days_31_plus": {"count": 0, "amount": 0.0},
    }
    for invoice in unpaid_invoice_rows:
        amount = float(cast(float, invoice.amount))
        due_at = cast(datetime | None, invoice.due_at)
        if due_at is None or due_at >= now:
            bucket_key = "current_not_due"
        else:
            overdue_count += 1
            age_days = (now - due_at).days
            if age_days <= 7:
                bucket_key = "days_1_7"
            elif age_days <= 14:
                bucket_key = "days_8_14"
            elif age_days <= 30:
                bucket_key = "days_15_30"
            else:
                bucket_key = "days_31_plus"

        aging_buckets[bucket_key]["count"] += 1
        aging_buckets[bucket_key]["amount"] = round(float(cast(float, aging_buckets[bucket_key]["amount"])) + amount, 2)
    
    # Overdue invoices by escalation level
    invoices_initial_due = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.payment_reminder_stage == "initial",
    ).count()
    invoices_3days_overdue = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.payment_reminder_stage == "first_overdue",
    ).count()
    invoices_7days_overdue = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.payment_reminder_stage == "second_overdue",
    ).count()
    invoices_14days_overdue = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.payment_reminder_stage == "final",
    ).count()
    stale_dispatched_jobs = db.query(Job).filter(
        Job.organization_id == organization_id,
        Job.status == "dispatched",
        Job.scheduled_time.isnot(None),
        Job.scheduled_time <= (now - timedelta(days=2)),
    ).count()
    severe_overdue_invoices = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.due_at.isnot(None),
        Invoice.due_at <= (now - timedelta(days=14)),
    ).count()
    
    # Urgent reminders
    reminders_pending_total = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
    ).count()
    reminders_overdue_total = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.due_at <= now,
    ).count()
    reminders_due_today = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        func.date(Reminder.due_at) == now.date().isoformat(),
    ).count()
    
    # Collection reminders
    collection_reminders_pending = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.message.like("Collect payment for invoice%"),
    ).count()
    
    collection_reminders_overdue = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.due_at <= now,
        Reminder.message.like("Collect payment for invoice%"),
    ).count()
    sla_job_alerts_pending = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.message.like("SLA breach: dispatched job%"),
    ).count()
    sla_invoice_alerts_pending = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.message.like("SLA breach: invoice%"),
    ).count()
    
    # Estimated revenue metrics
    total_revenue_invoiced = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status.in_(["paid", "unpaid"]),
    ).scalar() or 0.0
    
    total_revenue_paid = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "paid",
    ).scalar() or 0.0
    
    outstanding_revenue = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
    ).scalar() or 0.0
    
    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "lead_pipeline": {
            "new": leads_new,
            "contacted": leads_contacted,
            "qualified": leads_qualified,
            "converted": leads_converted,
            "dismissed": leads_dismissed,
            "total": leads_new + leads_contacted + leads_qualified + leads_converted + leads_dismissed,
        },
        "job_status": {
            "pending": jobs_pending,
            "approved": jobs_approved,
            "dispatched": jobs_dispatched,
            "on_my_way": jobs_on_my_way,
            "in_progress": jobs_in_progress,
            "completed": jobs_completed,
            "completed_today": jobs_completed_today,
            "total": (
                jobs_pending
                + jobs_approved
                + jobs_dispatched
                + jobs_on_my_way
                + jobs_in_progress
                + jobs_completed
            ),
        },
        "invoice_summary": {
            "unpaid": invoices_unpaid,
            "paid": invoices_paid,
            "void": invoices_void,
            "total": invoices_unpaid + invoices_paid + invoices_void,
            "unpaid_total_amount": round(unpaid_total_amount, 2),
            "overdue_count": overdue_count,
        },
        "overdue_invoices": {
            "due_today": invoices_initial_due,
            "3_days_overdue": invoices_3days_overdue,
            "7_days_overdue": invoices_7days_overdue,
            "14_plus_days_overdue": invoices_14days_overdue,
            "total_overdue": invoices_3days_overdue + invoices_7days_overdue + invoices_14days_overdue,
            "aging_buckets": aging_buckets,
        },
        "sla_breaches": {
            "stale_dispatched_jobs": stale_dispatched_jobs,
            "severe_overdue_invoices": severe_overdue_invoices,
            "pending_job_alerts": sla_job_alerts_pending,
            "pending_invoice_alerts": sla_invoice_alerts_pending,
            "pending_total_alerts": sla_job_alerts_pending + sla_invoice_alerts_pending,
        },
        "reminders": {
            "pending_total": reminders_pending_total,
            "pending_overdue": reminders_overdue_total,
            "collection_pending": collection_reminders_pending,
            "collection_overdue": collection_reminders_overdue,
        },
        "revenue_metrics": {
            "total_invoiced": round(total_revenue_invoiced, 2),
            "total_paid": round(total_revenue_paid, 2),
            "outstanding": round(outstanding_revenue, 2),
            "collection_rate_percent": round((total_revenue_paid / total_revenue_invoiced * 100) if total_revenue_invoiced > 0 else 0, 1),
        },
        "action_priorities": {
            "urgent_now": reminders_overdue_total + invoices_14days_overdue + collection_reminders_overdue,
            "today": reminders_due_today + invoices_initial_due,
            "this_week": jobs_dispatched + invoices_3days_overdue + invoices_7days_overdue,
            "total_open_actions": (
                reminders_pending_total + invoices_unpaid + jobs_dispatched
            ),
        },
    }


def escalate_sla_breaches(
    db,
    organization_id: int,
    job_breach_days: int = 2,
    invoice_breach_days: int = 14,
) -> dict:
    """Create internal reminders for SLA-breached jobs and invoices (idempotent)."""
    now = _utcnow()
    stale_job_cutoff = now - timedelta(days=job_breach_days)
    stale_invoice_cutoff = now - timedelta(days=invoice_breach_days)

    stale_jobs = (
        db.query(Job)
        .filter(
            Job.organization_id == organization_id,
            Job.status == "dispatched",
            Job.scheduled_time.isnot(None),
            Job.scheduled_time <= stale_job_cutoff,
        )
        .all()
    )
    severe_overdue_invoices = (
        db.query(Invoice)
        .filter(
            Invoice.organization_id == organization_id,
            Invoice.status == "unpaid",
            Invoice.due_at.isnot(None),
            Invoice.due_at <= stale_invoice_cutoff,
        )
        .all()
    )

    created_job_alerts = 0
    created_invoice_alerts = 0

    for job in stale_jobs:
        message = f"SLA breach: dispatched job #{job.id} is stale"
        existing = (
            db.query(Reminder)
            .filter(
                Reminder.organization_id == organization_id,
                Reminder.job_id == job.id,
                Reminder.status == "pending",
                Reminder.message == message,
            )
            .first()
        )
        if existing:
            continue

        reminder = Reminder(
            message=message,
            channel="internal",
            status="pending",
            due_at=now,
            job_id=job.id,
            customer_id=job.customer_id,
            organization_id=organization_id,
        )
        db.add(reminder)
        created_job_alerts += 1

    for invoice in severe_overdue_invoices:
        message = f"SLA breach: invoice #{invoice.id} is 14+ days overdue"
        existing = (
            db.query(Reminder)
            .filter(
                Reminder.organization_id == organization_id,
                Reminder.job_id == invoice.job_id,
                Reminder.status == "pending",
                Reminder.message == message,
            )
            .first()
        )
        if existing:
            continue

        reminder = Reminder(
            message=message,
            channel="internal",
            status="pending",
            due_at=now,
            job_id=invoice.job_id,
            customer_id=invoice.job.customer_id if invoice.job else None,
            organization_id=organization_id,
        )
        db.add(reminder)
        created_invoice_alerts += 1

    db.commit()

    return {
        "organization_id": organization_id,
        "stale_dispatched_jobs": len(stale_jobs),
        "severe_overdue_invoices": len(severe_overdue_invoices),
        "job_sla_alerts_created": created_job_alerts,
        "invoice_sla_alerts_created": created_invoice_alerts,
        "total_alerts_created": created_job_alerts + created_invoice_alerts,
    }


def get_daily_digest(db, organization_id: int) -> dict:
    """Operator-focused morning snapshot of urgent work and cash-risk."""
    now = _utcnow()

    reminders_overdue = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.due_at <= now,
    ).count()
    reminders_due_today = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        func.date(Reminder.due_at) == now.date().isoformat(),
    ).count()
    collection_overdue = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.due_at <= now,
        Reminder.message.like("Collect payment for invoice%"),
    ).count()

    unpaid_invoices = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
    ).count()
    severe_overdue_invoices = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
        Invoice.due_at.isnot(None),
        Invoice.due_at <= (now - timedelta(days=14)),
    ).count()
    outstanding_amount = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "unpaid",
    ).scalar() or 0.0

    stale_dispatched_jobs = db.query(Job).filter(
        Job.organization_id == organization_id,
        Job.status == "dispatched",
        Job.scheduled_time.isnot(None),
        Job.scheduled_time <= (now - timedelta(days=2)),
    ).count()
    dispatched_jobs = db.query(Job).filter(
        Job.organization_id == organization_id,
        Job.status == "dispatched",
    ).count()
    new_leads = db.query(Lead).filter(
        Lead.organization_id == organization_id,
        Lead.status == "new",
    ).count()

    pending_sla_alerts = db.query(Reminder).filter(
        Reminder.organization_id == organization_id,
        Reminder.status == "pending",
        Reminder.message.like("SLA breach:%"),
    ).count()
    weekly_cutoff = now - timedelta(days=7)
    new_leads_last_7d = db.query(Lead).filter(
        Lead.organization_id == organization_id,
        Lead.created_at >= weekly_cutoff,
    ).count()
    jobs_completed_last_7d = db.query(Job).filter(
        Job.organization_id == organization_id,
        Job.status == "completed",
        Job.completed_at.isnot(None),
        Job.completed_at >= weekly_cutoff,
    ).count()
    payments_collected_last_7d_count = db.query(Invoice).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "paid",
        Invoice.paid_at.isnot(None),
        Invoice.paid_at >= weekly_cutoff,
    ).count()
    payments_collected_last_7d_amount = db.query(func.sum(Invoice.amount)).filter(
        Invoice.organization_id == organization_id,
        Invoice.status == "paid",
        Invoice.paid_at.isnot(None),
        Invoice.paid_at >= weekly_cutoff,
    ).scalar() or 0.0

    urgent_now = reminders_overdue + severe_overdue_invoices + collection_overdue
    today_actions = reminders_due_today + new_leads
    this_week_actions = dispatched_jobs + stale_dispatched_jobs

    recommendations: list[str] = []
    if severe_overdue_invoices > 0:
        recommendations.append("Call customers with 14+ day overdue invoices first.")
    if stale_dispatched_jobs > 0:
        recommendations.append("Close or reschedule stale dispatched jobs before noon.")
    if new_leads > 0:
        recommendations.append("Contact all new leads today to avoid missed revenue.")
    if not recommendations:
        recommendations.append("No urgent actions right now. Keep follow-ups current.")

    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "summary": {
            "urgent_now": urgent_now,
            "today_actions": today_actions,
            "this_week_actions": this_week_actions,
        },
        "cash_risk": {
            "unpaid_invoices": unpaid_invoices,
            "severe_overdue_invoices": severe_overdue_invoices,
            "collection_overdue_reminders": collection_overdue,
            "outstanding_amount": round(outstanding_amount, 2),
        },
        "sla": {
            "stale_dispatched_jobs": stale_dispatched_jobs,
            "pending_sla_alerts": pending_sla_alerts,
        },
        "pipeline": {
            "new_leads": new_leads,
            "dispatched_jobs": dispatched_jobs,
        },
        "weekly_trends": {
            "new_leads_last_7d": new_leads_last_7d,
            "jobs_completed_last_7d": jobs_completed_last_7d,
            "payments_collected_last_7d_count": payments_collected_last_7d_count,
            "payments_collected_last_7d_amount": round(payments_collected_last_7d_amount, 2),
        },
        "recommended_actions": recommendations,
    }


def get_operator_queue(db, organization_id: int, limit: int = 10) -> dict:
    """Return top actionable items ranked by urgency and revenue impact."""
    now = _utcnow()
    capped_limit = max(1, min(limit, 50))
    items: list[dict] = []
    suppression_state = _queue_suppression_state(db, organization_id)

    severe_overdue_invoices = (
        db.query(Invoice)
        .filter(
            Invoice.organization_id == organization_id,
            Invoice.status == "unpaid",
            Invoice.due_at.isnot(None),
            Invoice.due_at <= (now - timedelta(days=14)),
        )
        .all()
    )
    for invoice in severe_overdue_invoices:
        if suppression_state.get(("invoice_collection", invoice.id), False):
            continue
        days_overdue = max(0, (now - invoice.due_at).days)
        revenue_impact = float(invoice.amount or 0.0)
        priority_score = 100 + days_overdue + min(int(revenue_impact / 20), 60)
        items.append(
            {
                "item_type": "invoice_collection",
                "entity_id": invoice.id,
                "title": f"Collect invoice #{invoice.id}",
                "urgency": "critical",
                "priority_score": priority_score,
                "revenue_impact": round(revenue_impact, 2),
                "due_at": invoice.due_at.isoformat() if invoice.due_at else None,
                "action": "Call customer and collect payment today.",
            }
        )

    stale_jobs = (
        db.query(Job)
        .filter(
            Job.organization_id == organization_id,
            Job.status == "dispatched",
            Job.scheduled_time.isnot(None),
            Job.scheduled_time <= (now - timedelta(days=2)),
        )
        .all()
    )
    for job in stale_jobs:
        if suppression_state.get(("job_completion", job.id), False):
            continue
        days_stale = max(0, (now - job.scheduled_time).days)
        priority_score = 80 + (days_stale * 2)
        items.append(
            {
                "item_type": "job_completion",
                "entity_id": job.id,
                "title": f"Close dispatched job #{job.id}",
                "urgency": "high",
                "priority_score": priority_score,
                "revenue_impact": None,
                "due_at": job.scheduled_time.isoformat() if job.scheduled_time else None,
                "action": "Confirm outcome and mark complete or reschedule.",
            }
        )

    overdue_reminders = (
        db.query(Reminder)
        .filter(
            Reminder.organization_id == organization_id,
            Reminder.status == "pending",
            Reminder.due_at <= now,
        )
        .all()
    )
    for reminder in overdue_reminders:
        if suppression_state.get(("reminder_followup", reminder.id), False):
            continue
        days_late = max(0, (now - reminder.due_at).days)
        is_collection = reminder.message.startswith("Collect payment for invoice")
        priority_score = 70 + days_late + (15 if is_collection else 0)
        items.append(
            {
                "item_type": "reminder_followup",
                "entity_id": reminder.id,
                "title": reminder.message,
                "urgency": "high" if is_collection else "medium",
                "priority_score": priority_score,
                "revenue_impact": None,
                "due_at": reminder.due_at.isoformat(),
                "action": "Complete or dismiss this overdue reminder.",
            }
        )

    new_leads = (
        db.query(Lead)
        .filter(Lead.organization_id == organization_id, Lead.status == "new")
        .all()
    )
    for lead in new_leads:
        if suppression_state.get(("lead_followup", lead.id), False):
            continue
        age_hours = max(0, int((now - lead.created_at).total_seconds() / 3600))
        priority_score = 60 + min(age_hours, 24)
        items.append(
            {
                "item_type": "lead_followup",
                "entity_id": lead.id,
                "title": f"Follow up with lead #{lead.id}",
                "urgency": "medium",
                "priority_score": priority_score,
                "revenue_impact": None,
                "due_at": lead.created_at.isoformat(),
                "action": "Call or text lead and book the job.",
            }
        )

    items.sort(key=lambda i: (-i["priority_score"], i["due_at"] or "9999-12-31T23:59:59"))

    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "limit": capped_limit,
        "total_candidates": len(items),
        "items": items[:capped_limit],
    }


def acknowledge_operator_queue_item(
    db,
    organization_id: int,
    item_type: str,
    entity_id: int,
    actor_user_id: int | None = None,
) -> tuple[dict | None, str | None]:
    """Acknowledge a queue item without mutating underlying domain entities."""
    if item_type not in OPERATOR_QUEUE_ITEM_TYPES:
        valid = ", ".join(sorted(OPERATOR_QUEUE_ITEM_TYPES))
        return None, f"Invalid item_type '{item_type}'. Must be one of: {valid}"

    now = _utcnow()
    suppression_state = _queue_suppression_state(db, organization_id)
    if suppression_state.get((item_type, entity_id), False):
        existing = (
            db.query(Reminder)
            .filter(
                Reminder.organization_id == organization_id,
                Reminder.message == _queue_ack_message(item_type, entity_id),
            )
            .order_by(Reminder.created_at.desc(), Reminder.id.desc())
            .first()
        )
        return {
            "organization_id": organization_id,
            "item_type": item_type,
            "entity_id": entity_id,
            "acknowledged": True,
            "already_acknowledged": True,
            "acknowledged_at": existing.created_at.isoformat() if existing.created_at else now.isoformat(),
        }, None

    ack = Reminder(
        message=_queue_ack_message(item_type, entity_id),
        channel="internal",
        status="sent",
        due_at=now,
        sent_at=now,
        last_dispatch_error=(f"actor_user_id={actor_user_id}" if actor_user_id is not None else None),
        organization_id=organization_id,
    )
    db.add(ack)
    db.commit()
    db.refresh(ack)

    return {
        "organization_id": organization_id,
        "item_type": item_type,
        "entity_id": entity_id,
        "acknowledged": True,
        "already_acknowledged": False,
        "acknowledged_at": ack.created_at.isoformat(),
    }, None


def unacknowledge_operator_queue_item(
    db,
    organization_id: int,
    item_type: str,
    entity_id: int,
    actor_user_id: int | None = None,
) -> tuple[dict | None, str | None]:
    """Add queue unack marker so the item can appear again."""
    if item_type not in OPERATOR_QUEUE_ITEM_TYPES:
        valid = ", ".join(sorted(OPERATOR_QUEUE_ITEM_TYPES))
        return None, f"Invalid item_type '{item_type}'. Must be one of: {valid}"

    now = _utcnow()
    suppression_state = _queue_suppression_state(db, organization_id)
    if not suppression_state.get((item_type, entity_id), False):
        return {
            "organization_id": organization_id,
            "item_type": item_type,
            "entity_id": entity_id,
            "unacknowledged": True,
            "already_unacknowledged": True,
            "unacknowledged_at": now.isoformat(),
        }, None

    unack = Reminder(
        message=_queue_unack_message(item_type, entity_id),
        channel="internal",
        status="sent",
        due_at=now,
        sent_at=now,
        last_dispatch_error=(f"actor_user_id={actor_user_id}" if actor_user_id is not None else None),
        organization_id=organization_id,
    )
    db.add(unack)
    db.commit()

    return {
        "organization_id": organization_id,
        "item_type": item_type,
        "entity_id": entity_id,
        "unacknowledged": True,
        "already_unacknowledged": False,
        "unacknowledged_at": now.isoformat(),
    }, None


def get_operator_queue_ack_history(db, organization_id: int, limit: int = 100) -> dict:
    """Return ack/unack audit events for operator queue suppression actions."""
    now = _utcnow()
    capped_limit = max(1, min(limit, 200))
    events = (
        db.query(Reminder)
        .filter(
            Reminder.organization_id == organization_id,
            Reminder.message.like("Queue %:%"),
        )
        .order_by(Reminder.created_at.desc(), Reminder.id.desc())
        .limit(capped_limit)
        .all()
    )

    out: list[dict] = []
    actor_ids: set[int] = set()
    parsed: list[tuple[Reminder, str, str, int]] = []
    for evt in events:
        action, key = _queue_parse_event(evt.message)
        if not action or not key:
            continue
        item_type, entity_id = key
        parsed.append((evt, action, item_type, entity_id))
        actor_id = _queue_actor_user_id(evt)
        if actor_id is not None:
            actor_ids.add(actor_id)

    actor_email_by_id: dict[int, str] = {}
    if actor_ids:
        users = (
            db.query(User)
            .filter(
                User.organization_id == organization_id,
                User.id.in_(actor_ids),
            )
            .all()
        )
        actor_email_by_id = {u.id: u.email for u in users}

    for evt, action, item_type, entity_id in parsed:
        actor_id = _queue_actor_user_id(evt)
        created_at = evt.created_at
        out.append(
            {
                "action": action,
                "item_type": item_type,
                "entity_id": entity_id,
                "timestamp": created_at.isoformat() if created_at is not None else now.isoformat(),
                "actor_user_id": actor_id,
                "actor_email": actor_email_by_id.get(actor_id) if actor_id is not None else None,
            }
        )

    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "limit": capped_limit,
        "events": out,
    }


def get_growth_control_tower(db, organization_id: int, days: int = 7, queue_limit: int = 5) -> dict:
    """Return a consolidated growth/operator snapshot for a single-request control tower view."""
    now = _utcnow()
    lead_metrics = get_lead_conversion_metrics(db, organization_id, days=days)
    dashboard = get_operational_dashboard(db, organization_id)
    queue = get_operator_queue(db, organization_id, limit=queue_limit)

    campaigns = (
        db.query(MarketingCampaign)
        .filter(MarketingCampaign.organization_id == organization_id)
        .all()
    )
    campaigns_total = len(campaigns)
    campaigns_draft = sum(1 for c in campaigns if c.status == "draft")
    campaigns_launched = sum(1 for c in campaigns if c.status == "launched")
    last_launched = max(
        (c.launched_at for c in campaigns if c.launched_at is not None),
        default=None,
    )

    invoice_summary = cast(dict[str, Any], dashboard["invoice_summary"])
    action_priorities = cast(dict[str, Any], dashboard["action_priorities"])
    lead_totals = cast(dict[str, Any], lead_metrics["totals"])

    return {
        "organization_id": organization_id,
        "timestamp": now.isoformat(),
        "campaigns": {
            "total": campaigns_total,
            "draft": campaigns_draft,
            "launched": campaigns_launched,
            "last_launched_at": last_launched.isoformat() if last_launched else None,
        },
        "kpis": {
            "lead_intakes": int(cast(int, lead_totals.get("intakes", 0))),
            "lead_booked": int(cast(int, lead_totals.get("booked", 0))),
            "lead_booking_rate": float(cast(float, lead_totals.get("booking_rate", 0.0))),
            "unpaid_total_amount": float(cast(float, invoice_summary.get("unpaid_total_amount", 0.0))),
            "overdue_invoice_count": int(cast(int, invoice_summary.get("overdue_count", 0))),
            "urgent_now": int(cast(int, action_priorities.get("urgent_now", 0))),
        },
        "recommended_next_action": lead_metrics["recommended_next_action"],
        "operator_queue": {
            "total_candidates": queue["total_candidates"],
            "items": queue["items"],
        },
    }


def get_operational_history(
    db,
    organization_id: int,
    start_date: date,
    end_date: date,
) -> dict:
    """Return daily operational metrics for a bounded date range."""
    days = (end_date - start_date).days + 1
    rows: list[dict[str, Any]] = []

    for offset in range(days):
        day = start_date + timedelta(days=offset)
        day_start = datetime.combine(day, datetime.min.time(), tzinfo=_utcnow().tzinfo)
        day_end = day_start + timedelta(days=1)

        leads_created = db.query(Lead).filter(
            Lead.organization_id == organization_id,
            Lead.created_at >= day_start,
            Lead.created_at < day_end,
        ).count()

        jobs_completed = db.query(Job).filter(
            Job.organization_id == organization_id,
            Job.completed_at.isnot(None),
            Job.completed_at >= day_start,
            Job.completed_at < day_end,
        ).count()

        invoices_issued_count = db.query(Invoice).filter(
            Invoice.organization_id == organization_id,
            Invoice.issued_at >= day_start,
            Invoice.issued_at < day_end,
        ).count()
        invoices_issued_amount = db.query(func.sum(Invoice.amount)).filter(
            Invoice.organization_id == organization_id,
            Invoice.issued_at >= day_start,
            Invoice.issued_at < day_end,
        ).scalar() or 0.0

        payments_collected_count = db.query(Invoice).filter(
            Invoice.organization_id == organization_id,
            Invoice.status == "paid",
            Invoice.paid_at.isnot(None),
            Invoice.paid_at >= day_start,
            Invoice.paid_at < day_end,
        ).count()
        payments_collected_amount = db.query(func.sum(Invoice.amount)).filter(
            Invoice.organization_id == organization_id,
            Invoice.status == "paid",
            Invoice.paid_at.isnot(None),
            Invoice.paid_at >= day_start,
            Invoice.paid_at < day_end,
        ).scalar() or 0.0

        reminders_due = db.query(Reminder).filter(
            Reminder.organization_id == organization_id,
            Reminder.due_at >= day_start,
            Reminder.due_at < day_end,
        ).count()

        rows.append(
            {
                "date": day.isoformat(),
                "leads_created": leads_created,
                "jobs_completed": jobs_completed,
                "invoices_issued_count": invoices_issued_count,
                "invoices_issued_amount": round(float(invoices_issued_amount), 2),
                "payments_collected_count": payments_collected_count,
                "payments_collected_amount": round(float(payments_collected_amount), 2),
                "reminders_due": reminders_due,
            }
        )

    return {
        "organization_id": organization_id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "days": days,
        "rows": rows,
    }
