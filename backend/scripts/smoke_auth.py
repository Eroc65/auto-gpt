import os
from uuid import uuid4

import requests

BASE = os.getenv("SMOKE_AUTH_BASE_URL", "http://localhost:8001").rstrip("/")
EMAIL = f"smoketestuser-{uuid4().hex[:8]}@example.com"
PASSWORD = os.getenv("SMOKE_AUTH_PASSWORD", "smoketestpass123")
ORG = f"SmokeTestOrg-{uuid4().hex[:6]}"
TIMEOUT_SECONDS = float(os.getenv("SMOKE_AUTH_TIMEOUT_SECONDS", "15"))


def require_ok(response: requests.Response) -> None:
	if response.status_code != 200:
		raise SystemExit(1)


print("1. Signup...")
r = requests.post(
	f"{BASE}/api/auth/signup",
	json={"email": EMAIL, "password": PASSWORD, "organization_name": ORG},
	timeout=TIMEOUT_SECONDS,
)
print("/api/auth/signup", r.status_code, r.json())
require_ok(r)

print("2. Login...")
r = requests.post(
	f"{BASE}/api/auth/login",
	data={"username": EMAIL, "password": PASSWORD},
	timeout=TIMEOUT_SECONDS,
)
print("/api/auth/login", r.status_code, r.json())
require_ok(r)

token = r.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"} if token else {}

print("3. Protected endpoint...")
r = requests.get(f"{BASE}/api/protected", headers=headers, timeout=TIMEOUT_SECONDS)
print("/api/protected", r.status_code, r.json())
require_ok(r)

print("4. Current organization...")
r = requests.get(f"{BASE}/api/auth/org", headers=headers, timeout=TIMEOUT_SECONDS)
print("/api/auth/org", r.status_code, r.json())
require_ok(r)
