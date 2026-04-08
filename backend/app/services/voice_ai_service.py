from __future__ import annotations

import re

from .openai_sdk_client import get_openai_client


def transcribe_audio_bytes(
    *,
    audio_bytes: bytes,
    filename: str,
    content_type: str | None,
    language: str | None = None,
) -> tuple[str, str]:
    if not audio_bytes:
        raise RuntimeError("Audio payload is empty")

    model = "gpt-4o-mini-transcribe"
    file_tuple = (filename, audio_bytes, content_type or "application/octet-stream")

    client = get_openai_client()
    payload: dict[str, object] = {
        "model": model,
        "file": file_tuple,
    }
    if language:
        payload["language"] = language

    response = client.audio.transcriptions.create(**payload)
    text = (getattr(response, "text", "") or "").strip()
    if not text:
        raise RuntimeError("Transcription returned empty text")
    return text, model


def extract_intake_fields(transcript_text: str) -> dict[str, str | None]:
    text = transcript_text.strip()
    lower = text.lower()

    caller_name = None
    name_match = re.search(r"(?:my name is|this is)\s+([A-Za-z][A-Za-z\s\-']{1,60})", text, flags=re.IGNORECASE)
    if name_match:
        caller_name = name_match.group(1).strip()

    callback_phone = None
    phone_match = re.search(r"(?:\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}", text)
    if phone_match:
        callback_phone = phone_match.group(0).strip()

    address = None
    address_match = re.search(
        r"\b\d{1,6}\s+[A-Za-z0-9\s.'-]{3,80}\s(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd)\b",
        text,
        flags=re.IGNORECASE,
    )
    if address_match:
        address = address_match.group(0).strip()

    service_type = None
    service_keywords = {
        "plumbing": ["plumb", "pipe", "drain", "water heater", "leak"],
        "hvac": ["hvac", "ac", "air conditioning", "furnace", "heat pump", "heating"],
        "electrical": ["electrical", "breaker", "panel", "outlet", "wiring"],
        "cleaning": ["cleaning", "deep clean", "janitorial"],
        "landscaping": ["landscaping", "lawn", "yard", "sprinkler"],
    }
    for label, keywords in service_keywords.items():
        if any(keyword in lower for keyword in keywords):
            service_type = label
            break

    urgency = "normal"
    if any(token in lower for token in ["emergency", "urgent", "asap", "right now", "immediately"]):
        urgency = "urgent"

    preferred_time = None
    time_match = re.search(
        r"\b(today|tomorrow|this afternoon|this morning|this evening|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        lower,
    )
    if time_match:
        preferred_time = time_match.group(1)

    return {
        "caller_name": caller_name,
        "service_type": service_type,
        "urgency": urgency,
        "address": address,
        "callback_phone": callback_phone,
        "preferred_time": preferred_time,
    }