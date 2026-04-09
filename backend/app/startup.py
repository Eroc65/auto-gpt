from __future__ import annotations

from fastapi import FastAPI

from .core.db import Base, engine


def _assert_schema_compatibility() -> None:
    from sqlalchemy import inspect

    required_technician_columns = {
        "availability_start_hour_utc",
        "availability_end_hour_utc",
        "availability_weekdays",
    }
    required_job_columns = {
        "on_my_way_at",
        "started_at",
    }
    required_organization_columns = {
        "intake_key",
        "ai_guide_enabled",
        "ai_guide_stage",
    }
    required_user_columns = {
        "role",
    }
    required_reminder_columns = {
        "delivered_at",
        "responded_at",
        "external_message_id",
    }

    with engine.connect() as connection:
        inspector = inspect(connection)
        table_names = set(inspector.get_table_names())
        if "technicians" not in table_names:
            return

        existing_columns = {column["name"] for column in inspector.get_columns("technicians")}
        missing = sorted(required_technician_columns - existing_columns)
        if missing:
            missing_text = ", ".join(missing)
            raise RuntimeError(
                "Database schema mismatch for technicians table. "
                f"Missing columns: {missing_text}. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "jobs" in table_names:
            job_columns = {column["name"] for column in inspector.get_columns("jobs")}
            missing_job_columns = sorted(required_job_columns - job_columns)
            if missing_job_columns:
                missing_text = ", ".join(missing_job_columns)
                raise RuntimeError(
                    "Database schema mismatch for jobs table. "
                    f"Missing columns: {missing_text}. "
                    "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
                )

        if "job_activities" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: job_activities. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "lead_activities" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: lead_activities. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "user_role_audit_events" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: user_role_audit_events. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "marketing_campaigns" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: marketing_campaigns. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "marketing_campaign_recipients" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: marketing_campaign_recipients. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "help_articles" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: help_articles. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "coaching_snippets" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: coaching_snippets. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "communication_tenant_profiles" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: communication_tenant_profiles. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "sms_opt_outs" not in table_names:
            raise RuntimeError(
                "Database schema mismatch. Missing table: sms_opt_outs. "
                "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
            )

        if "organizations" in table_names:
            organization_columns = {column["name"] for column in inspector.get_columns("organizations")}
            missing_org_columns = sorted(required_organization_columns - organization_columns)
            if missing_org_columns:
                missing_text = ", ".join(missing_org_columns)
                raise RuntimeError(
                    "Database schema mismatch for organizations table. "
                    f"Missing columns: {missing_text}. "
                    "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
                )

        if "users" in table_names:
            user_columns = {column["name"] for column in inspector.get_columns("users")}
            missing_user_columns = sorted(required_user_columns - user_columns)
            if missing_user_columns:
                missing_text = ", ".join(missing_user_columns)
                raise RuntimeError(
                    "Database schema mismatch for users table. "
                    f"Missing columns: {missing_text}. "
                    "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
                )

        if "reminders" in table_names:
            reminder_columns = {column["name"] for column in inspector.get_columns("reminders")}
            missing_reminder_columns = sorted(required_reminder_columns - reminder_columns)
            if missing_reminder_columns:
                missing_text = ", ".join(missing_reminder_columns)
                raise RuntimeError(
                    "Database schema mismatch for reminders table. "
                    f"Missing columns: {missing_text}. "
                    "Run `alembic upgrade head` (or reset local sqlite test.db) before starting the API."
                )


async def startup_services(app: FastAPI) -> None:
    """
    Move startup side effects here so importing app.main stays side-effect free.
    """
    Base.metadata.create_all(bind=engine)
    _assert_schema_compatibility()


async def shutdown_services(app: FastAPI) -> None:
    """
    Stop anything started in startup_services().
    """
    return None
