import { useEffect, useMemo, useState } from "react";

import {
  acknowledgeOperatorQueueItem,
  getLeadConversionMetrics,
  getOperationalDashboard,
  getOperatorQueue,
  getOperatorQueueHistory,
  login,
  unacknowledgeOperatorQueueItem,
} from "../lib/api";

export default function MetricsPage() {
  const [token, setToken] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [operatorQueue, setOperatorQueue] = useState(null);
  const [queueHistory, setQueueHistory] = useState(null);
  const [queueNotice, setQueueNotice] = useState("");
  const [queueBusyKey, setQueueBusyKey] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const totals = useMemo(() => metrics?.totals || {}, [metrics]);
  const sourceBreakdown = useMemo(() => metrics?.source_breakdown || {}, [metrics]);
  const intakeRouteBreakdown = useMemo(() => metrics?.intake_route_breakdown || {}, [metrics]);
  const invoiceSummary = useMemo(() => dashboard?.invoice_summary || {}, [dashboard]);
  const overdueInvoices = useMemo(() => dashboard?.overdue_invoices || {}, [dashboard]);
  const agingBuckets = useMemo(() => overdueInvoices.aging_buckets || {}, [overdueInvoices]);
  const prioritizedAgingBuckets = useMemo(
    () => [
      {
        key: "days_31_plus",
        label: "31 Plus Days",
        topAction: true,
        guidance: "Call today and secure payment commitment before close.",
      },
      {
        key: "days_15_30",
        label: "15 To 30 Days",
        topAction: true,
        guidance: "Prioritize outbound follow-up this shift.",
      },
      { key: "days_8_14", label: "8 To 14 Days" },
      { key: "days_1_7", label: "1 To 7 Days" },
      { key: "current_not_due", label: "Current Not Due" },
    ],
    [],
  );

  function money(value) {
    const amount = Number(value || 0);
    return `$${amount.toFixed(2)}`;
  }

  function bucketCount(key) {
    return agingBuckets?.[key]?.count ?? 0;
  }

  function bucketAmount(key) {
    return money(agingBuckets?.[key]?.amount ?? 0);
  }

  useEffect(() => {
    const savedToken = window.localStorage.getItem("fdp.dispatch.token") || "";
    const savedEmail = window.localStorage.getItem("fdp.dispatch.email") || "";
    if (savedToken) setToken(savedToken);
    if (savedEmail) setAuthEmail(savedEmail);
  }, []);

  async function withAction(name, fn) {
    setError("");
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
      const result = await login({ email: authEmail, password: authPassword });
      if (!result.access_token) {
        throw new Error("Login succeeded but no access token was returned.");
      }
      setToken(result.access_token);
      window.localStorage.setItem("fdp.dispatch.token", result.access_token);
    });
  }

  async function onLoadMetrics() {
    await withAction("metrics", async () => {
      if (!token) throw new Error("Login first to load metrics.");
      const [metricsData, dashboardData, operatorQueueData, queueHistoryData] = await Promise.all([
        getLeadConversionMetrics({ token, days }),
        getOperationalDashboard({ token }),
        getOperatorQueue({ token, limit: 5 }),
        getOperatorQueueHistory({ token, limit: 20 }),
      ]);
      setMetrics(metricsData);
      setDashboard(dashboardData);
      setOperatorQueue(operatorQueueData);
      setQueueHistory(queueHistoryData);
      setQueueNotice("");
    });
  }

  async function refreshQueueData() {
    const [queueData, historyData] = await Promise.all([
      getOperatorQueue({ token, limit: 5 }),
      getOperatorQueueHistory({ token, limit: 20 }),
    ]);
    setOperatorQueue(queueData);
    setQueueHistory(historyData);
  }

  async function onAcknowledgeQueueItem(item) {
    setError("");
    setQueueNotice("");
    const queueKey = `${item.item_type}-${item.entity_id}`;
    setQueueBusyKey(queueKey);
    try {
      await acknowledgeOperatorQueueItem({
        token,
        itemType: item.item_type,
        entityId: item.entity_id,
      });
      await refreshQueueData();
      setQueueNotice(`Acknowledged: ${item.title}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setQueueBusyKey("");
    }
  }

  async function onRestoreQueueItem(event) {
    setError("");
    setQueueNotice("");
    const queueKey = `restore-${event.item_type}-${event.entity_id}`;
    setQueueBusyKey(queueKey);
    try {
      await unacknowledgeOperatorQueueItem({
        token,
        itemType: event.item_type,
        entityId: event.entity_id,
      });
      await refreshQueueData();
      setQueueNotice(`Restored: ${event.item_type} #${event.entity_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setQueueBusyKey("");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Operator Metrics</p>
        <h1>Lead Conversion Dashboard</h1>
        <p>Track daily intake, qualification, and booking conversion over time.</p>
      </section>

      <section className="dispatch-card">
        <header className="dispatch-head">
          <h2>Access</h2>
          <p>Authenticate with your organization user.</p>
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
          <label>
            Days
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </label>
        </div>

        <div className="actions">
          <button type="button" onClick={onLogin} disabled={busyAction !== "" || !authEmail || !authPassword}>
            {busyAction === "auth" ? "Authorizing..." : "Login"}
          </button>
          <button type="button" onClick={onLoadMetrics} disabled={busyAction !== "" || !token}>
            {busyAction === "metrics" ? "Loading..." : "Load Metrics"}
          </button>
          <a className="ghost-link" href="/leads">Open Lead Inbox</a>
          <a className="ghost-link" href="/growth">Growth Infrastructure</a>
          <a className="ghost-link" href="/platform">Platform Console</a>
          <a className="ghost-link" href="/status">Status</a>
        </div>
      </section>

      {error ? <div className="panel error">{error}</div> : null}

      {metrics ? (
        <>
          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Recommended Next Action</h2>
              <p>{metrics.recommended_next_action || "No recommendation available yet."}</p>
            </header>
          </section>

          <section className="results-grid">
            <article className="panel">
              <h3>Intakes</h3>
              <p>{totals.intakes ?? 0}</p>
            </article>
            <article className="panel">
              <h3>Qualified</h3>
              <p>{totals.qualified ?? 0}</p>
            </article>
            <article className="panel">
              <h3>Booked</h3>
              <p>{totals.booked ?? 0}</p>
            </article>
            <article className="panel">
              <h3>Qualification Rate</h3>
              <p>{totals.qualification_rate ?? 0}%</p>
            </article>
            <article className="panel">
              <h3>Booking Rate</h3>
              <p>{totals.booking_rate ?? 0}%</p>
            </article>
          </section>

          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Intake Source Mix</h2>
              <p>Where recent lead volume is coming from and how it entered intake.</p>
            </header>
            <div className="results-grid">
              <article className="panel">
                <h3>Web Form</h3>
                <p>{sourceBreakdown.web_form ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Missed Call</h3>
                <p>{sourceBreakdown.missed_call ?? 0}</p>
              </article>
              <article className="panel">
                <h3>SMS</h3>
                <p>{sourceBreakdown.sms ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Manual</h3>
                <p>{sourceBreakdown.manual ?? 0}</p>
              </article>
            </div>
            <div className="results-grid">
              <article className="panel">
                <h3>Org Route</h3>
                <p>{intakeRouteBreakdown.public_intake_org ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Key Route</h3>
                <p>{intakeRouteBreakdown.public_intake_key ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Missed Call Route</h3>
                <p>{intakeRouteBreakdown.public_missed_call ?? 0}</p>
              </article>
              <article className="panel">
                <h3>Unknown Route</h3>
                <p>{intakeRouteBreakdown.unknown ?? 0}</p>
              </article>
            </div>
          </section>

          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Collections Snapshot</h2>
              <p>Unpaid exposure and overdue aging buckets in highest-risk-first order.</p>
            </header>
            <div className="results-grid">
              <article className="panel">
                <h3>Unpaid Total</h3>
                <p>{money(invoiceSummary.unpaid_total_amount)}</p>
              </article>
              <article className="panel">
                <h3>Overdue Count</h3>
                <p>{invoiceSummary.overdue_count ?? 0}</p>
              </article>
            </div>
            <div className="results-grid collections-aging-grid">
              {prioritizedAgingBuckets.map((bucket) => (
                <article className="panel" key={bucket.key}>
                  <h3>
                    {bucket.label}
                    {bucket.topAction ? " (Top Action)" : ""}
                  </h3>
                  <p>{bucketCount(bucket.key)}</p>
                  <small>{bucketAmount(bucket.key)}</small>
                  {bucket.guidance ? <p>{bucket.guidance}</p> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Daily Timeline</h2>
              <p>Most recent conversion activity by day.</p>
            </header>
            <div className="metric-table-wrap">
              <table className="metric-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Intakes</th>
                    <th>Qualified</th>
                    <th>Booked</th>
                    <th>Qual %</th>
                    <th>Book %</th>
                  </tr>
                </thead>
                <tbody>
                  {(metrics.timeline || []).map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.intakes}</td>
                      <td>{row.qualified}</td>
                      <td>{row.booked}</td>
                      <td>{row.qualification_rate}%</td>
                      <td>{row.booking_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Operator Priority Queue</h2>
              <p>Top ranked actions to reduce cash risk and close operational gaps.</p>
            </header>
            {queueNotice ? <div className="panel">{queueNotice}</div> : null}
            {(operatorQueue?.items || []).length > 0 ? (
              <div className="metric-table-wrap">
                <table className="metric-table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Task</th>
                      <th>Urgency</th>
                      <th>Action</th>
                      <th>Queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(operatorQueue?.items || []).map((item, index) => (
                      <tr key={`${item.item_type}-${item.entity_id}`}>
                        <td>#{index + 1} ({item.priority_score})</td>
                        <td>{item.title}</td>
                        <td>{item.urgency}</td>
                        <td>{item.action}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => onAcknowledgeQueueItem(item)}
                            disabled={busyAction !== "" || queueBusyKey === `${item.item_type}-${item.entity_id}`}
                            aria-label={`Acknowledge ${item.title}`}
                          >
                            {queueBusyKey === `${item.item_type}-${item.entity_id}` ? "Saving..." : "Acknowledge"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No operator queue items right now.</p>
            )}
          </section>

          <section className="dispatch-card">
            <header className="dispatch-head">
              <h2>Queue History</h2>
              <p>Recent acknowledgement and restore activity for operator queue items.</p>
            </header>
            {(queueHistory?.events || []).length > 0 ? (
              <div className="metric-table-wrap">
                <table className="metric-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Item</th>
                      <th>When</th>
                      <th>Queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(queueHistory?.events || []).map((event) => (
                      <tr key={`${event.action}-${event.item_type}-${event.entity_id}-${event.timestamp}`}>
                        <td>{event.action}</td>
                        <td>{event.item_type} #{event.entity_id}</td>
                        <td>{event.timestamp}</td>
                        <td>
                          {event.action === "ack" ? (
                            <button
                              type="button"
                              aria-label={`Restore ${event.item_type} #${event.entity_id}`}
                              onClick={() => onRestoreQueueItem(event)}
                              disabled={busyAction !== "" || queueBusyKey === `restore-${event.item_type}-${event.entity_id}`}
                            >
                              {queueBusyKey === `restore-${event.item_type}-${event.entity_id}` ? "Saving..." : "Restore"}
                            </button>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No queue history yet.</p>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
