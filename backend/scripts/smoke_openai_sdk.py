from __future__ import annotations

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.openai_sdk_client import get_default_model
from app.services.openai_sdk_client import get_openai_client


def main() -> int:
    try:
        client = get_openai_client()
    except RuntimeError as exc:
        if "OPENAI_API_KEY" in str(exc):
            print("OPENAI_API_KEY_NOT_SET")
            return 2
        raise

    model = get_default_model()

    response = client.responses.create(
        model=model,
        input="Reply with exactly: OPENAI_SDK_OK",
        max_output_tokens=20,
    )
    output = (response.output_text or "").strip()

    if "OPENAI_SDK_OK" not in output:
        raise RuntimeError(f"Unexpected model output: {output}")

    print("OPENAI_SDK_SMOKE_OK")
    print(f"MODEL={model}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())