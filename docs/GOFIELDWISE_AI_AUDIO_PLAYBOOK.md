# GoFieldwise AI Audio Playbook

## Purpose

This playbook defines how GoFieldwise should use modern audio and speech capabilities for small trades businesses. It is the default reference for voice intake, transcription, and spoken responses.

## Product Goals For Audio

- Answer calls faster with AI-assisted voice handling.
- Capture accurate job details from speech with minimal operator effort.
- Keep conversation quality high while preserving deterministic business actions.
- Stay organization-scoped and auditable for all voice-derived data.

## Audio Capability Map

### 1) Live Voice Agent (Low-Latency)
- Use a realtime audio stack when the caller is actively talking with the agent.
- Best for urgent call handling, triage, and live scheduling conversations.
- Prioritize natural turn-taking and interruption handling.

### 2) Controlled Voice Workflow (Deterministic)
- Use speech-to-text -> LLM text reasoning -> text-to-speech when exact wording and policy control matter.
- Best for payment reminders, appointment confirmations, and compliance-sensitive messages.
- Tradeoff: higher latency than speech-to-speech.

### 3) Async Transcription Pipeline
- Use dedicated transcription APIs for voicemail, recorded calls, and post-call analysis.
- Best for quality review, extraction, tagging, and reporting.

## API Selection Matrix

Use this as the default decision rule:

- Realtime API:
  - Choose for live, low-latency call interactions and streaming transcription.
  - Supports audio in/out and streaming paths.

- Chat Completions API with audio modalities:
  - Choose for non-realtime voice assistants that still need model reasoning, tool use, and function calling.
  - Supports audio input/output in a single multimodal conversation flow.

- Audio Transcription API:
  - Choose for speech-to-text tasks only.
  - Use diarization-capable models when speaker labels and timestamps are required.

- Audio Speech API:
  - Choose for text-to-speech tasks only.
  - Use for deterministic outbound scripts and controlled spoken responses.

## Model Guidance

- Speech-to-text candidates:
  - gpt-4o-transcribe
  - gpt-4o-mini-transcribe
  - whisper-1
  - gpt-4o-transcribe-diarize (batch-style workloads needing speaker labels/timestamps)

- Text-to-speech candidates:
  - gpt-4o-mini-tts
  - tts-1
  - tts-1-hd

- Multimodal audio conversation:
  - gpt-audio and realtime-capable model families for audio-in/audio-out conversational behavior.

## GoFieldwise Implementation Pattern

### Intake Calls
- Default to realtime for interactive intake.
- Fall back to STT -> LLM -> TTS if low-latency transport is unavailable.

### Dispatch And Follow-Up
- Use controlled script mode (STT/LLM/TTS) for exact messaging and policy consistency.
- Keep templates organization-scoped and role-audited.

### Voicemail And QA
- Send recordings to transcription.
- Extract structured entities: caller name, service type, urgency, address, preferred time, callback number.

## Data Safety And Compliance

- Store only required voice artifacts and transcripts.
- Preserve organization boundaries on every transcript, summary, and extracted entity.
- Log model version and API path used per interaction for auditability.
- Maintain clear redaction policy for sensitive PII in logs and analytics.

## Rollout Plan

### Phase 1: Audio Foundation
- Add backend voice service abstraction with provider-agnostic interfaces.
- Add transcription endpoint for uploaded/recorded audio.
- Add transcript storage model with organization_id and call metadata.

### Phase 2: Controlled Voice Agent
- Add STT -> LLM -> TTS pipeline endpoint for deterministic spoken workflows.
- Add tool-calling integration for customer lookup, scheduling, and reminders.
- Add guardrails for policy-safe and role-safe responses.

### Phase 3: Realtime Voice Agent
- Add realtime session broker and streaming transport.
- Add interruption handling and transfer-to-human logic.
- Add latency and handoff metrics.

## Validation Requirements

- Auth and org-scoped tests for all voice endpoints.
- Deterministic transcript parsing tests (entity extraction, timestamp handling).
- Latency budget checks for realtime flows.
- Smoke tests for transcription, speech generation, and controlled voice roundtrip.

## Current Backend Scaffold

- Protected transcription ingest endpoint: `/api/voice/transcriptions`.
- Organization-scoped transcript list endpoint: `/api/voice/transcriptions` (GET).
- Stored metadata: source, filename, call_id, caller_phone, model used, extracted intake fields.

## Definition Of Done For Voice Features

- All data is organization-scoped.
- Voice flows are observable (logs, metrics, failure reasons).
- At least one deterministic smoke script validates end-to-end behavior.
- Clear fallback path exists when realtime transport is unavailable.