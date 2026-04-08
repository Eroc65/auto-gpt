from __future__ import annotations

import json

from ..schemas.marketing import MarketingExpertOperatorRequest
from .openai_sdk_client import get_default_model
from .openai_sdk_client import get_openai_client


def _strip_json_fences(text: str) -> str:
    value = text.strip()
    if value.startswith("```"):
        value = value.removeprefix("```json").removeprefix("```").strip()
        if value.endswith("```"):
            value = value[:-3].strip()
    return value


def _extract_json_object(text: str) -> dict:
    cleaned = _strip_json_fences(text)
    if cleaned.startswith("{") and cleaned.endswith("}"):
        return json.loads(cleaned)

    start = cleaned.find("{")
    if start < 0:
        raise RuntimeError("AI marketing operator returned no JSON object")

    depth = 0
    end = -1
    for i, ch in enumerate(cleaned[start:], start=start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end < 0:
        raise RuntimeError("AI marketing operator returned malformed JSON")
    return json.loads(cleaned[start : end + 1])


def run_marketing_expert_operator(payload: MarketingExpertOperatorRequest) -> dict:
    model = get_default_model()
    client = get_openai_client()

    instructions = (
        "You are an autonomous AI revenue and marketing orchestration system. "
        "Return ONLY valid JSON with keys: strategy_summary, positioning, offers, channel_plan, "
        "content_plan, competitor_gaps, lead_sources, kpi_targets, execution. "
        "Optimize for practical SMB growth execution with constrained budget."
    )

    budget = payload.weekly_ad_budget_usd
    input_text = (
        f"Business name: {payload.business_name}\n"
        f"Website URL: {payload.website_url or 'n/a'}\n"
        f"Vertical: {payload.vertical}\n"
        f"Service area: {payload.service_area}\n"
        f"Weekly ad budget (USD): {budget}\n"
        f"Primary goal: {payload.primary_goal}\n"
        f"Current channels: {', '.join(payload.current_channels) if payload.current_channels else 'none'}\n"
        f"Notes: {payload.notes or 'none'}\n\n"
        "Requirements:\n"
        "1) Build channel_plan with weekly budget allocation that sums exactly to weekly ad budget.\n"
        "2) Include at least 2 offers and at least 3 ad concepts.\n"
        "3) Provide a practical 4-week execution checklist.\n"
        "4) Keep recommendations conversion-focused and sales-oriented."
    )

    response = client.responses.create(
        model=model,
        instructions=instructions,
        input=input_text,
        max_output_tokens=1400,
    )
    output_text = (response.output_text or "").strip()
    if not output_text:
        raise RuntimeError("AI marketing operator returned empty output")

    data = _extract_json_object(output_text)
    if not isinstance(data, dict):
        raise RuntimeError("AI marketing operator returned invalid output format")
    return data