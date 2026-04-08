from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict


class VoiceExtractedFieldsOut(BaseModel):
    caller_name: str | None = None
    service_type: str | None = None
    urgency: str | None = None
    address: str | None = None
    callback_phone: str | None = None
    preferred_time: str | None = None


class VoiceTranscriptOut(BaseModel):
    id: int
    organization_id: int
    created_by_user_id: int
    source: str
    audio_filename: str
    audio_content_type: str | None = None
    caller_phone: str | None = None
    call_id: str | None = None
    transcription_model: str
    transcript_text: str
    extracted: VoiceExtractedFieldsOut
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)