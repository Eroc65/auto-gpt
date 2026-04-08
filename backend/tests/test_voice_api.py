from __future__ import annotations

from typing import cast

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.core.db import Base
from app.core.db import SessionLocal
from app.core.db import engine
from app.main import app
from app.models.core import Organization
from app.models.core import User


_ORG_A = "Voice Org A"
_ORG_B = "Voice Org B"
_OWNER_A_EMAIL = "voice-owner-a@example.com"
_OWNER_A_PASSWORD = "voicepassA123"
_OWNER_B_EMAIL = "voice-owner-b@example.com"
_OWNER_B_PASSWORD = "voicepassB123"


@pytest.fixture(scope="module", autouse=True)
def _setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        org_a = Organization(name=_ORG_A)
        org_b = Organization(name=_ORG_B)
        db.add(org_a)
        db.add(org_b)
        db.flush()

        db.add(
            User(
                email=_OWNER_A_EMAIL,
                hashed_password=hash_password(_OWNER_A_PASSWORD),
                organization_id=org_a.id,
                role="owner",
            )
        )
        db.add(
            User(
                email=_OWNER_B_EMAIL,
                hashed_password=hash_password(_OWNER_B_PASSWORD),
                organization_id=org_b.id,
                role="owner",
            )
        )
        db.commit()
    finally:
        db.close()


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="module")
def auth_headers_a(client: TestClient) -> dict[str, str]:
    resp = client.post("/api/auth/login", data={"username": _OWNER_A_EMAIL, "password": _OWNER_A_PASSWORD})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def auth_headers_b(client: TestClient) -> dict[str, str]:
    resp = client.post("/api/auth/login", data={"username": _OWNER_B_EMAIL, "password": _OWNER_B_PASSWORD})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_voice_transcription_requires_auth(client: TestClient):
    resp = client.post(
        "/api/voice/transcriptions",
        files={"audio_file": ("sample.wav", b"bytes", "audio/wav")},
    )
    assert resp.status_code == 401


def test_voice_transcription_create_success(client: TestClient, auth_headers_a: dict[str, str], monkeypatch: pytest.MonkeyPatch):
    def fake_transcribe_audio_bytes(**kwargs):
        return (
            "My name is John. I have a leaking pipe at 123 Main Street. Call me at 555-111-2222 tomorrow.",
            "gpt-4o-mini-transcribe",
        )

    monkeypatch.setattr("app.api.voice.transcribe_audio_bytes", fake_transcribe_audio_bytes)

    resp = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_a,
        data={"source": "voicemail", "caller_phone": "555-111-2222", "call_id": "CALL-1"},
        files={"audio_file": ("call.wav", b"fake-audio", "audio/wav")},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["source"] == "voicemail"
    assert body["transcription_model"] == "gpt-4o-mini-transcribe"
    assert body["extracted"]["caller_name"] == "John"
    assert body["extracted"]["service_type"] == "plumbing"
    assert body["extracted"]["urgency"] == "normal"


def test_voice_transcriptions_are_org_scoped(
    client: TestClient,
    auth_headers_a: dict[str, str],
    auth_headers_b: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
):
    def fake_transcribe_audio_bytes(**kwargs):
        filename = str(cast(str, kwargs.get("filename")))
        if filename.startswith("a"):
            return ("This is org A audio", "gpt-4o-mini-transcribe")
        return ("This is org B audio", "gpt-4o-mini-transcribe")

    monkeypatch.setattr("app.api.voice.transcribe_audio_bytes", fake_transcribe_audio_bytes)

    create_a = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_a,
        files={"audio_file": ("a-call.wav", b"a", "audio/wav")},
    )
    assert create_a.status_code == 201

    create_b = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_b,
        files={"audio_file": ("b-call.wav", b"b", "audio/wav")},
    )
    assert create_b.status_code == 201

    list_a = client.get("/api/voice/transcriptions", headers=auth_headers_a)
    assert list_a.status_code == 200
    transcripts_a = list_a.json()
    assert transcripts_a
    assert all(item["transcript_text"] != "This is org B audio" for item in transcripts_a)

    list_b = client.get("/api/voice/transcriptions", headers=auth_headers_b)
    assert list_b.status_code == 200
    transcripts_b = list_b.json()
    assert transcripts_b
    assert all(item["transcript_text"] != "This is org A audio" for item in transcripts_b)


def test_create_lead_from_voice_transcript_success(
    client: TestClient,
    auth_headers_a: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
):
    def fake_transcribe_audio_bytes(**kwargs):
        return (
            "My name is Sarah. Emergency electrical issue at 321 Pine Street. Call me at 555-333-4444.",
            "gpt-4o-mini-transcribe",
        )

    monkeypatch.setattr("app.api.voice.transcribe_audio_bytes", fake_transcribe_audio_bytes)

    created_transcript = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_a,
        data={"source": "voicemail", "call_id": "CALL-LEAD"},
        files={"audio_file": ("lead-call.wav", b"audio", "audio/wav")},
    )
    assert created_transcript.status_code == 201
    transcript_id = created_transcript.json()["id"]

    create_lead = client.post(
        f"/api/voice/transcriptions/{transcript_id}/create-lead",
        headers=auth_headers_a,
    )
    assert create_lead.status_code == 201
    body = create_lead.json()
    assert body["source"] == "voice_transcript"
    assert body["phone"] == "555-333-4444"
    assert body["name"] == "Sarah"
    assert body["status"] == "new"
    assert "Emergency electrical issue" in (body.get("raw_message") or "")


def test_create_lead_from_voice_transcript_cross_org_blocked(
    client: TestClient,
    auth_headers_a: dict[str, str],
    auth_headers_b: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
):
    def fake_transcribe_audio_bytes(**kwargs):
        return ("My name is Mike. Plumbing leak.", "gpt-4o-mini-transcribe")

    monkeypatch.setattr("app.api.voice.transcribe_audio_bytes", fake_transcribe_audio_bytes)

    created_transcript = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_a,
        files={"audio_file": ("org-a.wav", b"audio", "audio/wav")},
    )
    assert created_transcript.status_code == 201
    transcript_id = created_transcript.json()["id"]

    blocked = client.post(
        f"/api/voice/transcriptions/{transcript_id}/create-lead",
        headers=auth_headers_b,
    )
    assert blocked.status_code == 404


def test_create_lead_from_voice_transcript_is_idempotent(
    client: TestClient,
    auth_headers_a: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
):
    def fake_transcribe_audio_bytes(**kwargs):
        return (
            "My name is Dana. I need AC repair at 900 Elm Street. Call me at 555-666-7777.",
            "gpt-4o-mini-transcribe",
        )

    monkeypatch.setattr("app.api.voice.transcribe_audio_bytes", fake_transcribe_audio_bytes)

    created_transcript = client.post(
        "/api/voice/transcriptions",
        headers=auth_headers_a,
        files={"audio_file": ("dup.wav", b"audio", "audio/wav")},
    )
    assert created_transcript.status_code == 201
    transcript_id = created_transcript.json()["id"]

    first = client.post(
        f"/api/voice/transcriptions/{transcript_id}/create-lead",
        headers=auth_headers_a,
    )
    assert first.status_code == 201
    first_lead_id = first.json()["id"]

    second = client.post(
        f"/api/voice/transcriptions/{transcript_id}/create-lead",
        headers=auth_headers_a,
    )
    assert second.status_code == 200
    assert second.json()["id"] == first_lead_id