from __future__ import annotations

import os

from openai import OpenAI


def get_openai_api_key() -> str:
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return api_key


def get_openai_client() -> OpenAI:
    return OpenAI(api_key=get_openai_api_key())


def get_default_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip() or "gpt-4.1-mini"