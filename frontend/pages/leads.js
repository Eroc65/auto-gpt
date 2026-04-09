import { useEffect, useState } from "react";

import {
  bookLead,
  getCurrentUser,
  getLeadActivity,
  getRoleAuditExportUrl,
  getRoleAuditLog,
  getLeadConversionMetrics,
  listLeads,
  listOrganizationUsers,
  listTechnicians,
  login,
  qualifyLead,
  updateUserRole,
  updateLeadStatus,
} from "../lib/api";

function toLocalInputValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function prettyDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function LeadInboxPage() {
  const [token, setToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [leads, setLeads] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [leadActivity, setLeadActivity] = useState([]);
  const [activityActionFilter, setActivityActionFilter] = useState("");
  const [activityWindowHours, setActivityWindowHours] = useState("168");
  const [roleDrafts, setRoleDrafts] = useState({});
  const [roleAuditEvents, setRoleAuditEvents] = useState([]);
  const [roleAuditActorFilter, setRoleAuditActorFilter] = useState("");
  const [roleAuditTargetFilter, setRoleAuditTargetFilter] = useState("");
  const [roleAuditDays, setRoleAuditDays] = useState("30");
  const [conversionSummary, setConversionSummary] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [scheduledTime, setScheduledTime] = useState(toLocalInputValue(new Date(Date.now() + 2 * 60 * 60 * 1000)));
  const [bookTechId, setBookTechId] = useState("");
  const [actionResult, setActionResult] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem("fdp.dispatch.token") || "";
    const savedEmail = window.localStorage.getItem("fdp.dispatch.email") || "";
    if (savedToken) setToken(savedToken);
    if (savedEmail) setAuthEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem("fdp.dispatch.token", token);
      void refreshInbox();
    }
  }, [token]);

  async function withAction(name, fn) {
    setError("");
    setActionResult("");
    setBusyAction(name);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyAction("");
    }
  }

  async function onLogin() {
    await withAction("auth", async () => {
      if (!authEmail || !authPassword) {
        throw new Error("Email and password are required for login.");
      }
      const result = await login({ email: authEmail, password: authPassword });
      if (!result.access_token) {
        throw new Error("Login succeeded but no access token was returned.");
      }
      setToken(result.access_token);
    });
  }

  async function refreshInbox() {
    await withAction("refresh", async () => {
      const [leadRows, techRows, me] = await Promise.all([
        listLeads({ token }),
        listTechnicians({ token }),
        getCurrentUser({ token }),
      ]);
      setLeads(Array.isArray(leadRows) ? leadRows : []);
      setTechnicians(Array.isArray(techRows) ? techRows : []);
      setCurrentUser(me || null);
      const normalizedRole = String(me?.role || "").toLowerCase();
      if (["owner", "admin"].includes(normalizedRole)) {
        try {
          const users = await listOrganizationUsers({ token });
          const rows = Array.isArray(users) ? users : [];
          setOrgUsers(rows);
          setRoleDrafts((prev) => {
            const next = { ...prev };
            for (const user of rows) {
              if (!next[user.id]) {
                next[user.id] = user.role;
              }
            }
            return next;
          });

          const audit = await getRoleAuditLog({
            token,
            limit: 100,
            actorUserId: roleAuditActorFilter || undefined,
            targetUserId: roleAuditTargetFilter || undefined,
            days: Number(roleAuditDays || "30"),
          });
          setRoleAuditEvents(Array.isArray(audit?.events) ? audit.events : []);
        } catch {
          setOrgUsers([]);
          setRoleAuditEvents([]);
        }
      } else {
        setOrgUsers([]);
        setRoleAuditEvents([]);
      }
      if (!selectedLeadId && Array.isArray(leadRows) && leadRows.length > 0) {
        setSelectedLeadId(String(leadRows[0].id));
      }
      if (!bookTechId && Array.isArray(techRows) && techRows.length > 0) {
        setBookTechId(String(techRows[0].id));
      }

      try {
        const summary = await getLeadConversionMetrics({ token, days: 7 });
        setConversionSummary(summary);
      } catch {
        setConversionSummary(null);
      }

      const activeLeadId = Number(selectedLeadId || leadRows?.[0]?.id || 0);
      if (activeLeadId > 0) {
        try {
          const events = await getLeadActivity({
            token,
            leadId: activeLeadId,
            action: activityActionFilter || undefined,
            sinceHours: Number(activityWindowHours || "168"),
          });
          setLeadActivity(Array.isArray(events) ? events : []);
        } catch {
          setLeadActivity([]);
        }
      } else {
        setLeadActivity([]);
      }
    });
  }

  useEffect(() => {
    if (!token || !selectedLeadId) {
      return;
    }
    let cancelled = false;
    async function loadLeadTimeline() {
      try {
        const events = await getLeadActivity({
          token,
          leadId: Number(selectedLeadId),
          action: activityActionFilter || undefined,
          sinceHours: Number(activityWindowHours || "168"),
        });
        if (!cancelled) {
          setLeadActivity(Array.isArray(events) ? events : []);
        }
      } catch {
        if (!cancelled) {
          setLeadActivity([]);
        }
      }
    }
    void loadLeadTimeline();
    return () => {
      cancelled = true;
    };
  }, [token, selectedLeadId, activityActionFilter, activityWindowHours]);

  const role = String(currentUser?.role || "owner").toLowerCase();
  const canQualify = ["owner", "admin", "dispatcher"].includes(role);
  const canBook = ["owner", "admin", "dispatcher"].includes(role);
  const canManageRoles = ["owner", "admin"].includes(role);

  useEffect(() => {
    if (!token || !canManageRoles) {
      return;
    }
    let cancelled = false;
    async function loadRoleAudit() {
      try {
        const audit = await getRoleAuditLog({
          token,
          limit: 100,
          actorUserId: roleAuditActorFilter || undefined,
          targetUserId: roleAuditTargetFilter || undefined,
          days: Number(roleAuditDays || "30"),
        });
        if (!cancelled) {
          setRoleAuditEvents(Array.isArray(audit?.events) ? audit.events : []);
        }
      } catch {
        if (!cancelled) {
          setRoleAuditEvents([]);
        }
      }
    }
    void loadRoleAudit();
    return () => {
      cancelled = true;
    };
  }, [token, canManageRoles, roleAuditActorFilter, roleAuditTargetFilter, roleAuditDays]);

  async function onUpdateUserRole(userId) {
    await withAction(`role-${userId}`, async () => {
      const roleValue = roleDrafts[userId];
      if (!roleValue) {
        throw new Error("Select a role before saving.");
      }
      await updateUserRole({ token, userId: Number(userId), role: roleValue });
      const users = await listOrganizationUsers({ token });
      setOrgUsers(Array.isArray(users) ? users : []);
      const audit = await getRoleAuditLog({ token, limit: 100, days: Number(roleAuditDays || "30") });
      setRoleAuditEvents(Array.isArray(audit?.events) ? audit.events : []);
      setActionResult(`Updated role for user #${userId} to ${roleValue}.`);
    });
  }

  async function onMarkContacted() {
    await withAction("contacted", async () => {
      if (!selectedLeadId) throw new Error("Select a lead first.");
      const updated = await updateLeadStatus({ token, leadId: Number(selectedLeadId), status: "contacted" });
      await refreshInbox();
      setActionResult(`Lead #${updated.id} moved to contacted.`);
    });
  }

  async function onQualifyLead() {
    await withAction("qualify", async () => {
      if (!selectedLeadId) throw new Error("Select a lead first.");
      const result = await qualifyLead({
        token,
        leadId: Number(selectedLeadId),
        emergency: true,
        budgetConfirmed: true,
        requestedWithin48h: true,
        serviceCategory,
      });
      await refreshInbox();
      setActionResult(`Lead #${result.lead.id} qualified with score ${result.lead.priority_score ?? "n/a"}.`);
    });
  }

  async function onBookLead() {
    await withAction("book", async () => {
      if (!selectedLeadId) throw new Error("Select a lead first.");
      if (!bookTechId) throw new Error("Pick a technician for booking.");
      const result = await bookLead({
        token,
        leadId: Number(selectedLeadId),
        technicianId: Number(bookTechId),
        scheduledTime: new Date(scheduledTime).toISOString(),
      });
      await refreshInbox();
      setActionResult(`Lead booked. Job #${result.job_id} scheduled ${prettyDate(result.scheduled_time)}.`);
    });
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Lead Inbox</p>
        <h1>Review, Qualify, And Book New Leads Fast</h1>
        <p>Single-screen operator workflow to move inbound leads from new to booked without context switching.</p>
        <div className="hero-actions">
          <a className="ghost-link" href="/metrics">Open Metrics</a>
          <a className="ghost-link" href="/platform">Platform Console</a>
          <a className="ghost-link" href="/status">Status</a>
        </div>
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Operator Access</h2>
          <p>Use an existing account from your organization. Current role: <strong>{currentUser?.role || "unknown"}</strong></p>
        </header>

        <div className="form-grid">
          <label>
            Auth Email
            <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="owner@shop.com" />
          </label>
          <label>
            Auth Password
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="password" />
          </label>
          <label className="span-2">
            Bearer Token
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste JWT access token" />
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={onLogin} disabled={busyAction !== "" || !authEmail || !authPassword}>
            {busyAction === "auth" ? "Authorizing..." : "Login"}
          </button>
          <button type="button" onClick={refreshInbox} disabled={busyAction !== "" || !token}>
            {busyAction === "refresh" ? "Refreshing..." : "Refresh Inbox"}
          </button>
        </div>
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Lead Actions</h2>
          <p>Quickly move selected lead toward dispatch.</p>
        </header>

        {conversionSummary ? (
          <>
            <div className="panel">
              <h3>Recommended Next Action</h3>
              <p>{conversionSummary.recommended_next_action || "No recommendation available yet."}</p>
            </div>
            <div className="results-grid">
              <article className="panel">
                <h3>7 Day Intakes</h3>
                <p>{conversionSummary.totals?.intakes ?? 0}</p>
              </article>
              <article className="panel">
                <h3>7 Day Qualified</h3>
                <p>{conversionSummary.totals?.qualified ?? 0}</p>
              </article>
              <article className="panel">
                <h3>7 Day Booked</h3>
                <p>{conversionSummary.totals?.booked ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Qualification Rate</h3>
                <p>{conversionSummary.totals?.qualification_rate ?? 0}%</p>
              </article>
              <article className="panel">
                <h3>Booking Rate</h3>
                <p>{conversionSummary.totals?.booking_rate ?? 0}%</p>
              </article>
              <article className="panel">
                <h3>Web Form</h3>
                <p>{conversionSummary.source_breakdown?.web_form ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Missed Call</h3>
                <p>{conversionSummary.source_breakdown?.missed_call ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Org Route</h3>
                <p>{conversionSummary.intake_route_breakdown?.public_intake_org ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Missed Call Route</h3>
                <p>{conversionSummary.intake_route_breakdown?.public_missed_call ?? 0}</p>
              </article>
            </div>
          </>
        ) : null}

        <div className="form-grid">
          <label>
            Pick Lead
            <select value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}>
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={String(lead.id)}>
                  #{lead.id} {lead.name || lead.phone || "Unnamed"} ({lead.status})
                </option>
              ))}
            </select>
          </label>

          <label>
            Service Category
            <input value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} placeholder="plumbing, hvac, dental..." />
          </label>

          <label>
            Booking Technician
            <select value={bookTechId} onChange={(e) => setBookTechId(e.target.value)}>
              <option value="">Select a technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={String(tech.id)}>#{tech.id} {tech.name}</option>
              ))}
            </select>
          </label>

          <label>
            Booking Time
            <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={onMarkContacted} disabled={busyAction !== "" || !token || !selectedLeadId}>
            {busyAction === "contacted" ? "Updating..." : "Mark Contacted"}
          </button>
          <button type="button" onClick={onQualifyLead} disabled={busyAction !== "" || !token || !selectedLeadId || !canQualify}>
            {busyAction === "qualify" ? "Qualifying..." : "Qualify Lead"}
          </button>
          <button type="button" onClick={onBookLead} disabled={busyAction !== "" || !token || !selectedLeadId || !bookTechId || !canBook}>
            {busyAction === "book" ? "Booking..." : "Book Lead"}
          </button>
        </div>

        {!canQualify || !canBook ? (
          <div className="panel error">
            <p>Your role has limited lead-action permissions. Contact an owner/admin if you need qualification or booking access.</p>
          </div>
        ) : null}

        {actionResult ? <div className="panel"><p>{actionResult}</p></div> : null}
        {error ? <div className="panel error">{error}</div> : null}
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Live Queue</h2>
          <p>Newest leads first.</p>
        </header>

        <div className="lead-list">
          {leads.length === 0 ? (
            <p>No leads loaded yet.</p>
          ) : (
            leads.map((lead) => (
              <article key={lead.id} className="panel">
                <h3>#{lead.id} {lead.name || "Unnamed Lead"}</h3>
                <ul>
                  <li>Status: {lead.status}</li>
                  <li>Phone: {lead.phone || "-"}</li>
                  <li>Email: {lead.email || "-"}</li>
                  <li>Source: {lead.source}</li>
                  <li>Priority: {lead.priority_score ?? "-"}</li>
                  <li>Created: {prettyDate(lead.created_at)}</li>
                </ul>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Lead Activity Timeline</h2>
          <p>Audit trail for the currently selected lead.</p>
        </header>
        <div className="form-grid">
          <label>
            Action Filter
            <select value={activityActionFilter} onChange={(e) => setActivityActionFilter(e.target.value)}>
              <option value="">All actions</option>
              <option value="created">created</option>
              <option value="status_updated">status_updated</option>
              <option value="qualified">qualified</option>
              <option value="converted">converted</option>
              <option value="booked">booked</option>
            </select>
          </label>
          <label>
            Time Window
            <select value={activityWindowHours} onChange={(e) => setActivityWindowHours(e.target.value)}>
              <option value="24">Last 24 hours</option>
              <option value="72">Last 3 days</option>
              <option value="168">Last 7 days</option>
              <option value="720">Last 30 days</option>
            </select>
          </label>
        </div>
        <div className="lead-list">
          {leadActivity.length === 0 ? (
            <p>No activity available for this lead yet.</p>
          ) : (
            leadActivity.map((event) => (
              <article key={event.id} className="panel">
                <h3>{event.action}</h3>
                <ul>
                  <li>From: {event.from_status || "-"}</li>
                  <li>To: {event.to_status}</li>
                  <li>Actor User ID: {event.actor_user_id ?? "system"}</li>
                  <li>Actor Email: {event.actor_email || "-"}</li>
                  <li>When: {prettyDate(event.created_at)}</li>
                  <li>Note: {event.note || "-"}</li>
                </ul>
              </article>
            ))
          )}
        </div>
      </section>

      {canManageRoles ? (
        <section className="dispatch-card">
          <header className="dispatch-head">
            <h2>Role Management</h2>
            <p>Assign operator permissions for users in your organization.</p>
          </header>
          <div className="lead-list">
            {orgUsers.length === 0 ? (
              <p>No users available.</p>
            ) : (
              orgUsers.map((user) => (
                <article key={user.id} className="panel">
                  <h3>#{user.id} {user.email}</h3>
                  <div className="form-grid">
                    <label>
                      Role
                      <select
                        value={roleDrafts[user.id] || user.role}
                        onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      >
                        <option value="owner">owner</option>
                        <option value="admin">admin</option>
                        <option value="dispatcher">dispatcher</option>
                        <option value="technician">technician</option>
                      </select>
                    </label>
                  </div>
                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => onUpdateUserRole(user.id)}
                      disabled={busyAction !== "" || !token || roleDrafts[user.id] === user.role}
                    >
                      {busyAction === `role-${user.id}` ? "Saving..." : "Save Role"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      {canManageRoles ? (
        <section className="dispatch-card">
          <header className="dispatch-head">
            <h2>Role Audit History</h2>
            <p>Review role changes and export CSV for compliance records.</p>
          </header>
          <div className="form-grid">
            <label>
              Actor User ID
              <input value={roleAuditActorFilter} onChange={(e) => setRoleAuditActorFilter(e.target.value)} placeholder="optional" />
            </label>
            <label>
              Target User ID
              <input value={roleAuditTargetFilter} onChange={(e) => setRoleAuditTargetFilter(e.target.value)} placeholder="optional" />
            </label>
            <label>
              Days
              <select value={roleAuditDays} onChange={(e) => setRoleAuditDays(e.target.value)}>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last 365 days</option>
              </select>
            </label>
          </div>
          <div className="actions">
            <a
              className="ghost-link"
              href={getRoleAuditExportUrl({
                limit: 500,
                actorUserId: roleAuditActorFilter || undefined,
                targetUserId: roleAuditTargetFilter || undefined,
                days: Number(roleAuditDays || "30"),
              })}
              target="_blank"
              rel="noreferrer"
            >
              Export Role Audit CSV
            </a>
          </div>
          <div className="lead-list">
            {roleAuditEvents.length === 0 ? (
              <p>No role audit events found for the selected filter.</p>
            ) : (
              roleAuditEvents.map((event) => (
                <article key={event.id} className="panel">
                  <h3>#{event.id} {event.from_role} → {event.to_role}</h3>
                  <ul>
                    <li>Actor: {event.actor_email || `user #${event.actor_user_id}`}</li>
                    <li>Target: {event.target_email || `user #${event.target_user_id}`}</li>
                    <li>When: {prettyDate(event.created_at)}</li>
                    <li>Note: {event.note || "-"}</li>
                  </ul>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
