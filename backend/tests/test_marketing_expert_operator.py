from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.core.db import Base
from app.core.db import SessionLocal
from app.core.db import engine
from app.main import app
from app.models.core import Organization
from app.models.core import User


_EMAIL = "marketing-expert-owner@example.com"
_PASSWORD = "marketingexpertpass"
_ORG = "Marketing Expert Org"


def setup_module() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org = Organization(name=_ORG)
        db.add(org)
        db.flush()
        db.add(
            User(
                email=_EMAIL,
                hashed_password=hash_password(_PASSWORD),
                role="owner",
                organization_id=org.id,
            )
        )
        db.commit()
    finally:
        db.close()


def _auth_headers() -> dict[str, str]:
    with TestClient(app) as client:
        resp = client.post("/api/auth/login", data={"username": _EMAIL, "password": _PASSWORD})
        assert resp.status_code == 200
        token = resp.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}


def test_marketing_expert_operator_requires_auth() -> None:
    with TestClient(app) as client:
        resp = client.post(
            "/api/marketing/expert/operator",
            json={
                "business_name": "GoFieldwise",
                "vertical": "plumbing",
                "service_area": "Phoenix, AZ",
                "weekly_ad_budget_usd": 25,
            },
        )
        assert resp.status_code == 401


def test_marketing_expert_operator_returns_structured_plan(monkeypatch) -> None:
    headers = _auth_headers()

    def fake_operator(payload):
        return {
            "strategy_summary": "Focus on one city, one offer, one conversion flow.",
            "positioning": "AI front desk growth engine for small trades businesses.",
            "offers": [
                {
                    "title": "14-Day Trial + Free Revenue Leak Audit",
                    "audience": "owner-operators",
                    "hook": "Stop losing jobs from missed calls",
                    "cta": "Start free trial",
                }
            ],
            "channel_plan": [
                {
                    "channel": "meta",
                    "objective": "landing_page_views",
                    "weekly_budget_usd": 25,
                    "campaign_structure": ["1 campaign", "2 creatives", "1 audience"],
                }
            ],
            "content_plan": {
                "blog_titles": ["How Trades Teams Stop Missing Calls"],
                "ad_concepts": ["Missed Calls Cost Jobs"],
                "social_posts": ["Before/after booking workflow"],
            },
            "competitor_gaps": ["No trades-specific funnel mapping"],
            "lead_sources": ["Meta click-to-landing", "Google local intent"],
            "kpi_targets": ["CTR > 1.5%", "Trial starts >= 2/week"],
            "execution": {
                "week_1": ["Launch landing page"],
                "week_2": ["Test two hooks"],
                "week_3": ["Refresh lowest CTR creative"],
                "week_4": ["Double down on winner"],
            },
        }

    monkeypatch.setattr("app.api.marketing.run_marketing_expert_operator", fake_operator)

    with TestClient(app) as client:
        resp = client.post(
            "/api/marketing/expert/operator",
            json={
                "business_name": "GoFieldwise",
                "website_url": "https://gofieldwise.com",
                "vertical": "plumbing",
                "service_area": "Phoenix, AZ",
                "weekly_ad_budget_usd": 25,
                "primary_goal": "book_more_jobs",
                "current_channels": ["meta"],
            },
            headers=headers,
        )

        assert resp.status_code == 200
        body = resp.json()
        assert "strategy_summary" in body
        assert isinstance(body["offers"], list)
        assert len(body["offers"]) >= 1
        assert isinstance(body["channel_plan"], list)
        assert body["channel_plan"][0]["weekly_budget_usd"] == 25