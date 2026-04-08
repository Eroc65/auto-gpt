from uuid import uuid4

from app.core.db import Base, engine


def setup_module() -> None:
	Base.metadata.drop_all(bind=engine)
	Base.metadata.create_all(bind=engine)

def test_auth_signup_login_and_protected_routes(client) -> None:

	email = f"testclientuser-{uuid4().hex[:8]}@example.com"
	password = "testpass123"
	org_name = "TestClientOrg"

	# Signup
	signup_resp = client.post(
		"/api/auth/signup",
		json={
			"email": email,
			"password": password,
			"organization_name": org_name,
		},
	)
	assert signup_resp.status_code == 200
	assert signup_resp.json()["email"] == email
	assert signup_resp.json()["role"] == "owner"

	# Login
	login_resp = client.post(
		"/api/auth/login",
		data={"username": email, "password": password},
	)
	assert login_resp.status_code == 200
	access_token = login_resp.json()["access_token"]

	# Protected route rejects unauthenticated
	unauth_resp = client.get("/api/protected")
	assert unauth_resp.status_code == 401

	# Protected route succeeds with valid auth
	headers = {"Authorization": f"Bearer {access_token}"}
	auth_resp = client.get("/api/protected", headers=headers)
	assert auth_resp.status_code == 200

	# Current-organization endpoint returns expected org
	org_resp = client.get("/api/auth/org", headers=headers)
	assert org_resp.status_code == 200
	assert org_resp.json()["name"] == org_name
	assert org_resp.json().get("intake_key", "").startswith("org_")


def test_user_role_management_endpoints(client) -> None:
	org_name = f"RoleOrg-{uuid4().hex[:6]}"
	owner_email = f"owner-{uuid4().hex[:6]}@example.com"
	tech_email = f"tech-{uuid4().hex[:6]}@example.com"
	admin_email = f"admin-{uuid4().hex[:6]}@example.com"
	password = "testpass123"

	owner_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_email,
			"password": password,
			"organization_name": org_name,
			"role": "owner",
		},
	)
	assert owner_signup.status_code == 200

	tech_signup = client.post(
		"/api/auth/signup",
		json={
			"email": tech_email,
			"password": password,
			"organization_name": org_name,
			"role": "technician",
		},
	)
	assert tech_signup.status_code == 200
	tech_id = tech_signup.json()["id"]

	admin_signup = client.post(
		"/api/auth/signup",
		json={
			"email": admin_email,
			"password": password,
			"organization_name": org_name,
			"role": "admin",
		},
	)
	assert admin_signup.status_code == 200

	owner_login = client.post("/api/auth/login", data={"username": owner_email, "password": password})
	tech_login = client.post("/api/auth/login", data={"username": tech_email, "password": password})
	admin_login = client.post("/api/auth/login", data={"username": admin_email, "password": password})
	assert owner_login.status_code == 200
	assert tech_login.status_code == 200
	assert admin_login.status_code == 200

	owner_headers = {"Authorization": f"Bearer {owner_login.json()['access_token']}"}
	tech_headers = {"Authorization": f"Bearer {tech_login.json()['access_token']}"}
	admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

	list_as_owner = client.get("/api/auth/users", headers=owner_headers)
	assert list_as_owner.status_code == 200
	emails = [u["email"] for u in list_as_owner.json()]
	assert owner_email in emails
	assert tech_email in emails
	assert admin_email in emails

	list_as_tech = client.get("/api/auth/users", headers=tech_headers)
	assert list_as_tech.status_code == 403

	update_as_admin = client.patch(
		f"/api/auth/users/{tech_id}/role",
		json={"role": "dispatcher"},
		headers=admin_headers,
	)
	assert update_as_admin.status_code == 200
	assert update_as_admin.json()["role"] == "dispatcher"

	bad_role = client.patch(
		f"/api/auth/users/{tech_id}/role",
		json={"role": "superhero"},
		headers=owner_headers,
	)
	assert bad_role.status_code == 422


def test_cannot_demote_last_owner(client) -> None:
	org_name = f"LastOwnerOrg-{uuid4().hex[:6]}"
	owner_email = f"solo-owner-{uuid4().hex[:6]}@example.com"
	password = "testpass123"

	owner_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_email,
			"password": password,
			"organization_name": org_name,
			"role": "owner",
		},
	)
	assert owner_signup.status_code == 200
	owner_id = owner_signup.json()["id"]

	owner_login = client.post("/api/auth/login", data={"username": owner_email, "password": password})
	assert owner_login.status_code == 200
	owner_headers = {"Authorization": f"Bearer {owner_login.json()['access_token']}"}

	resp = client.patch(
		f"/api/auth/users/{owner_id}/role",
		json={"role": "admin"},
		headers=owner_headers,
	)
	assert resp.status_code == 422
	assert "last owner" in resp.json()["detail"].lower()


def test_role_audit_log_and_csv_export(client) -> None:
	org_name = f"AuditOrg-{uuid4().hex[:6]}"
	owner_email = f"audit-owner-{uuid4().hex[:6]}@example.com"
	dispatcher_email = f"audit-disp-{uuid4().hex[:6]}@example.com"
	password = "testpass123"

	owner_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_email,
			"password": password,
			"organization_name": org_name,
			"role": "owner",
		},
	)
	assert owner_signup.status_code == 200

	dispatcher_signup = client.post(
		"/api/auth/signup",
		json={
			"email": dispatcher_email,
			"password": password,
			"organization_name": org_name,
			"role": "dispatcher",
		},
	)
	assert dispatcher_signup.status_code == 200
	dispatcher_id = dispatcher_signup.json()["id"]

	owner_login = client.post("/api/auth/login", data={"username": owner_email, "password": password})
	assert owner_login.status_code == 200
	headers = {"Authorization": f"Bearer {owner_login.json()['access_token']}"}

	change = client.patch(
		f"/api/auth/users/{dispatcher_id}/role",
		json={"role": "admin"},
		headers=headers,
	)
	assert change.status_code == 200

	log_resp = client.get("/api/auth/users/role-audit?limit=20", headers=headers)
	assert log_resp.status_code == 200
	log_body = log_resp.json()
	assert log_body["total"] >= 1
	assert any(evt["target_email"] == dispatcher_email and evt["to_role"] == "admin" for evt in log_body["events"])

	csv_resp = client.get("/api/auth/users/role-audit/export.csv?limit=20", headers=headers)
	assert csv_resp.status_code == 200
	assert csv_resp.headers["content-type"].startswith("text/csv")
	assert "target_email" in csv_resp.text
	assert dispatcher_email in csv_resp.text


def test_cross_org_role_update_is_blocked(client) -> None:
	password = "testpass123"
	org_a_name = f"OrgA-{uuid4().hex[:6]}"
	org_b_name = f"OrgB-{uuid4().hex[:6]}"

	owner_a_email = f"owner-a-{uuid4().hex[:6]}@example.com"
	owner_b_email = f"owner-b-{uuid4().hex[:6]}@example.com"
	tech_b_email = f"tech-b-{uuid4().hex[:6]}@example.com"

	owner_a_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_a_email,
			"password": password,
			"organization_name": org_a_name,
			"role": "owner",
		},
	)
	assert owner_a_signup.status_code == 200

	owner_b_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_b_email,
			"password": password,
			"organization_name": org_b_name,
			"role": "owner",
		},
	)
	assert owner_b_signup.status_code == 200

	tech_b_signup = client.post(
		"/api/auth/signup",
		json={
			"email": tech_b_email,
			"password": password,
			"organization_name": org_b_name,
			"role": "technician",
		},
	)
	assert tech_b_signup.status_code == 200

	owner_a_login = client.post("/api/auth/login", data={"username": owner_a_email, "password": password})
	assert owner_a_login.status_code == 200
	headers_a = {"Authorization": f"Bearer {owner_a_login.json()['access_token']}"}

	resp = client.patch(
		f"/api/auth/users/{tech_b_signup.json()['id']}/role",
		json={"role": "dispatcher"},
		headers=headers_a,
	)
	assert resp.status_code == 404


def test_role_audit_endpoints_require_manager_role(client) -> None:
	password = "testpass123"
	org_name = f"AuditRoleGate-{uuid4().hex[:6]}"
	owner_email = f"audit-owner-{uuid4().hex[:6]}@example.com"
	tech_email = f"audit-tech-{uuid4().hex[:6]}@example.com"

	owner_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_email,
			"password": password,
			"organization_name": org_name,
			"role": "owner",
		},
	)
	assert owner_signup.status_code == 200

	tech_signup = client.post(
		"/api/auth/signup",
		json={
			"email": tech_email,
			"password": password,
			"organization_name": org_name,
			"role": "technician",
		},
	)
	assert tech_signup.status_code == 200

	tech_login = client.post("/api/auth/login", data={"username": tech_email, "password": password})
	assert tech_login.status_code == 200
	tech_headers = {"Authorization": f"Bearer {tech_login.json()['access_token']}"}

	audit_resp = client.get("/api/auth/users/role-audit?limit=5", headers=tech_headers)
	assert audit_resp.status_code == 403

	csv_resp = client.get("/api/auth/users/role-audit/export.csv?limit=5", headers=tech_headers)
	assert csv_resp.status_code == 403


def test_role_audit_log_does_not_leak_other_org_events(client) -> None:
	password = "testpass123"

	org_a_name = f"AuditOrgA-{uuid4().hex[:6]}"
	owner_a_email = f"audit-a-owner-{uuid4().hex[:6]}@example.com"
	dispatcher_a_email = f"audit-a-disp-{uuid4().hex[:6]}@example.com"

	org_b_name = f"AuditOrgB-{uuid4().hex[:6]}"
	owner_b_email = f"audit-b-owner-{uuid4().hex[:6]}@example.com"
	dispatcher_b_email = f"audit-b-disp-{uuid4().hex[:6]}@example.com"

	owner_a_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_a_email,
			"password": password,
			"organization_name": org_a_name,
			"role": "owner",
		},
	)
	assert owner_a_signup.status_code == 200

	dispatcher_a_signup = client.post(
		"/api/auth/signup",
		json={
			"email": dispatcher_a_email,
			"password": password,
			"organization_name": org_a_name,
			"role": "dispatcher",
		},
	)
	assert dispatcher_a_signup.status_code == 200

	owner_b_signup = client.post(
		"/api/auth/signup",
		json={
			"email": owner_b_email,
			"password": password,
			"organization_name": org_b_name,
			"role": "owner",
		},
	)
	assert owner_b_signup.status_code == 200

	dispatcher_b_signup = client.post(
		"/api/auth/signup",
		json={
			"email": dispatcher_b_email,
			"password": password,
			"organization_name": org_b_name,
			"role": "dispatcher",
		},
	)
	assert dispatcher_b_signup.status_code == 200

	owner_a_login = client.post("/api/auth/login", data={"username": owner_a_email, "password": password})
	owner_b_login = client.post("/api/auth/login", data={"username": owner_b_email, "password": password})
	assert owner_a_login.status_code == 200
	assert owner_b_login.status_code == 200

	headers_a = {"Authorization": f"Bearer {owner_a_login.json()['access_token']}"}
	headers_b = {"Authorization": f"Bearer {owner_b_login.json()['access_token']}"}

	change_a = client.patch(
		f"/api/auth/users/{dispatcher_a_signup.json()['id']}/role",
		json={"role": "admin"},
		headers=headers_a,
	)
	change_b = client.patch(
		f"/api/auth/users/{dispatcher_b_signup.json()['id']}/role",
		json={"role": "admin"},
		headers=headers_b,
	)
	assert change_a.status_code == 200
	assert change_b.status_code == 200

	log_a = client.get("/api/auth/users/role-audit?limit=50", headers=headers_a)
	assert log_a.status_code == 200
	body_a = log_a.json()
	assert body_a["total"] >= 1
	assert all(evt["organization_id"] == owner_a_signup.json()["organization_id"] for evt in body_a["events"])
	assert all(evt["target_email"] != dispatcher_b_email for evt in body_a["events"])

	csv_a = client.get("/api/auth/users/role-audit/export.csv?limit=50", headers=headers_a)
	assert csv_a.status_code == 200
	assert dispatcher_a_email in csv_a.text
	assert dispatcher_b_email not in csv_a.text
