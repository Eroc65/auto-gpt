from __future__ import annotations

import json
from typing import cast

from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import Form
from fastapi import HTTPException
from fastapi import Query
from fastapi import Response
from fastapi import UploadFile
from fastapi import status
from sqlalchemy.orm import Session

from ..api.auth import get_current_user
from ..core.db import get_db
from ..crud.lead import create_lead
from ..crud.reminder import create_lead_followup_reminder
from ..models.core import Lead
from ..schemas.lead import LeadOut
from ..models.core import User
from ..models.core import VoiceTranscript
from ..schemas.voice import VoiceExtractedFieldsOut
from ..schemas.voice import VoiceTranscriptOut
from ..services.voice_ai_service import extract_intake_fields
from ..services.voice_ai_service import transcribe_audio_bytes

router = APIRouter()

MAX_AUDIO_BYTES = 10 * 1024 * 1024


def _as_out(record: VoiceTranscript) -> VoiceTranscriptOut:
    extracted_raw = str(cast(str | None, record.extraction_json) or "{}")
    extracted_dict = json.loads(extracted_raw)
    extracted = VoiceExtractedFieldsOut(**extracted_dict)
    return VoiceTranscriptOut(
        id=int(cast(int, record.id)),
        organization_id=int(cast(int, record.organization_id)),
        created_by_user_id=int(cast(int, record.created_by_user_id)),
        source=str(cast(str, record.source)),
        audio_filename=str(cast(str, record.audio_filename)),
        audio_content_type=cast(str | None, record.audio_content_type),
        caller_phone=cast(str | None, record.caller_phone),
        call_id=cast(str | None, record.call_id),
        transcription_model=str(cast(str, record.transcription_model)),
        transcript_text=str(cast(str, record.transcript_text)),
        extracted=extracted,
        created_at=record.created_at,
    )


@router.post(
    "/voice/transcriptions",
    response_model=VoiceTranscriptOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_voice_transcription(
    audio_file: UploadFile = File(...),
    source: str = Form("call_recording"),
    caller_phone: str | None = Form(None),
    call_id: str | None = Form(None),
    language: str | None = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content_type = (audio_file.content_type or "").lower()
    if content_type and not content_type.startswith("audio/") and content_type != "application/octet-stream":
        raise HTTPException(status_code=422, detail="Uploaded file must be audio content")

    audio_bytes = await audio_file.read()
    if not audio_bytes:
        raise HTTPException(status_code=422, detail="Uploaded audio file is empty")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Uploaded audio exceeds 10MB limit")

    try:
        transcript_text, model_used = transcribe_audio_bytes(
            audio_bytes=audio_bytes,
            filename=audio_file.filename or "voice_input.wav",
            content_type=audio_file.content_type,
            language=language,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Voice transcription failed: {exc}")

    extracted = extract_intake_fields(transcript_text)

    record = VoiceTranscript(
        organization_id=int(cast(int, current_user.organization_id)),
        created_by_user_id=int(cast(int, current_user.id)),
        source=source,
        audio_filename=audio_file.filename or "voice_input.wav",
        audio_content_type=audio_file.content_type,
        caller_phone=caller_phone,
        call_id=call_id,
        transcription_model=model_used,
        transcript_text=transcript_text,
        extraction_json=json.dumps(extracted),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _as_out(record)


@router.get("/voice/transcriptions", response_model=list[VoiceTranscriptOut])
def list_voice_transcriptions(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    organization_id = int(cast(int, current_user.organization_id))
    rows = (
        db.query(VoiceTranscript)
        .filter(VoiceTranscript.organization_id == organization_id)
        .order_by(VoiceTranscript.id.desc())
        .limit(limit)
        .all()
    )
    return [_as_out(row) for row in rows]


@router.post(
    "/voice/transcriptions/{transcript_id}/create-lead",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
)
def create_lead_from_voice_transcript(
    transcript_id: int,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    organization_id = int(cast(int, current_user.organization_id))
    transcript = (
        db.query(VoiceTranscript)
        .filter(
            VoiceTranscript.id == transcript_id,
            VoiceTranscript.organization_id == organization_id,
        )
        .first()
    )
    if not transcript:
        raise HTTPException(status_code=404, detail="Voice transcript not found")

    extracted_raw = str(cast(str | None, transcript.extraction_json) or "{}")
    extracted = json.loads(extracted_raw)
    marker = f"Voice transcript ID: {transcript_id}"

    existing_lead = (
        db.query(Lead)
        .filter(
            Lead.organization_id == organization_id,
            Lead.source == "voice_transcript",
            Lead.notes.isnot(None),
            Lead.notes.like(f"%{marker}%"),
        )
        .order_by(Lead.id.asc())
        .first()
    )
    if existing_lead:
        response.status_code = status.HTTP_200_OK
        return existing_lead

    lead_name = extracted.get("caller_name") or None
    lead_phone = extracted.get("callback_phone") or cast(str | None, transcript.caller_phone)
    transcript_text = str(cast(str, transcript.transcript_text))

    notes_parts = []
    service_type = extracted.get("service_type")
    urgency = extracted.get("urgency")
    address = extracted.get("address")
    preferred_time = extracted.get("preferred_time")
    if service_type:
        notes_parts.append(f"Service type: {service_type}")
    if urgency:
        notes_parts.append(f"Urgency: {urgency}")
    if address:
        notes_parts.append(f"Address: {address}")
    if preferred_time:
        notes_parts.append(f"Preferred time: {preferred_time}")
    if transcript.call_id:
        notes_parts.append(f"Call ID: {transcript.call_id}")
    notes_parts.append(marker)

    lead_payload = {
        "name": lead_name,
        "phone": lead_phone,
        "source": "voice_transcript",
        "raw_message": transcript_text,
        "notes": "\n".join(notes_parts) if notes_parts else None,
    }
    lead = create_lead(db, lead_payload, organization_id)
    create_lead_followup_reminder(
        db,
        int(cast(int, lead.id)),
        organization_id,
        lead_name=cast(str | None, lead.name),
    )
    return lead