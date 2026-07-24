import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { trackIntentClick } from "../lib/analytics";
import Footer from "../components/Footer";

const MODES = [
  {
    id: "sidecar",
    title: "Sidecar Mode",
    subtitle: "Keep your existing CRM as the source of truth.",
    summary:
      "GoFieldWise captures calls, qualifies opportunities, and sends summaries while Jobber, Housecall Pro, or your current system keeps jobs and invoices.",
    bestFor: "Teams already running dispatch in another platform and wanting AI without operational disruption.",
    detailCards: [
      {
        label: "How it works",
        text: "AI handles the first touch and qualification, then syncs structured details into your existing CRM for dispatch and invoicing.",
      },
      {
        label: "What sets it apart",
        text: "You keep existing software and staff habits, while upgrading lead capture speed and consistency.",
      },
      {
        label: "Value added",
        text: "More booked jobs and fewer missed opportunities without retraining the whole office.",
      },
    ],
    outcomes: [
      "No rip-and-replace migration risk.",
      "Faster speed-to-lead with existing office workflow unchanged.",
      "Owner visibility improves without retraining the whole team.",
    ],
  },
  {
    id: "hybrid",
    title: "Hybrid Mode",
    subtitle: "AI handles routine volume, people handle edge cases.",
    summary:
      "GoFieldWise automates first response, qualification, and missed-call recovery, while your team or CRM handles escalations and special workflows.",
    bestFor: "Shops with frequent call spikes that still need human review for high-complexity jobs.",
    detailCards: [
      {
        label: "How it works",
        text: "AI handles routine calls, lead capture, and recovery while complex scenarios route to your team with context.",
      },
      {
        label: "What sets it apart",
        text: "It balances automation with operator control, so your team stays in charge where judgment matters.",
      },
      {
        label: "Value added",
        text: "Lower admin load, cleaner prioritization, and faster response under heavy call volume.",
      },
    ],
    outcomes: [
      "Balanced automation and operator control.",
      "Lower admin load during busy windows.",
      "Cleaner handoffs for urgent or unusual requests.",
    ],
  },
  {
    id: "standalone",
    title: "Standalone Mode",
    subtitle: "Run front office operations in one AI-first stack.",
    summary:
      "GoFieldWise handles the full front office path from first call to follow-up, giving small teams one workflow for intake, updates, and closeout.",
    bestFor: "Growing operators replacing fragmented tools and manual admin routines.",
    detailCards: [
      {
        label: "How it works",
        text: "GoFieldWise becomes the front-office system for intake, booking motion, customer updates, and closeout follow-up.",
      },
      {
        label: "What sets it apart",
        text: "One stack replaces scattered workflows, reducing tool overlap and handoff friction.",
      },
      {
        label: "Value added",
        text: "Higher operational clarity, faster onboarding, and less time lost in tool switching.",
      },
    ],
    outcomes: [
      "Unified workflow for calls, customer messaging, and follow-up.",
      "Less context switching across disconnected tools.",
      "Faster operator ramp for new team members.",
    ],
  },
];

const SERVICES = [
  {
    id: "jobber",
    name: "Jobber",
    works: "GoFieldWise handles intake and qualification, then syncs customer and job context into Jobber for dispatch execution.",
    apart: "Best fit for teams already operating day-to-day in Jobber with established workflows and permissions.",
    value: "Cuts missed-lead loss while preserving Jobber as the operating system.",
    modes: ["sidecar", "hybrid"],
  },
  {
    id: "housecall",
    name: "Housecall Pro",
    works: "GoFieldWise captures call intent, urgency, and notes, then feeds structured context back to Housecall Pro.",
    apart: "Strong for teams that already rely on Housecall scheduling and technician flow.",
    value: "Improves booking speed and consistency without changing field-team behavior.",
    modes: ["sidecar", "hybrid"],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    works: "GoFieldWise enriches customer and job outcomes so your invoicing and accounting handoff is cleaner.",
    apart: "Finance-first fit for operators who want better front-office capture before billing.",
    value: "Reduces billing friction and missing context at invoice time.",
    modes: ["sidecar", "hybrid", "standalone"],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    works: "GoFieldWise books and confirms appointment windows while keeping owner and team calendars aligned.",
    apart: "Lean scheduling option for smaller teams not ready for a heavy dispatch platform.",
    value: "Improves on-time scheduling and cuts manual back-and-forth.",
    modes: ["sidecar", "hybrid", "standalone"],
  },
];

const FLOW = [
  { step: "01", title: "Call answered", body: "Every inbound call is answered instantly, including after hours." },
  { step: "02", title: "Lead qualified", body: "AI captures intent, urgency, service type, and location context." },
  { step: "03", title: "Owner notified", body: "Your team gets the right summary and next-action prompt immediately." },
  { step: "04", title: "System updated", body: "CRM or calendar records are updated based on your selected mode." },
  { step: "05", title: "Follow-up sent", body: "Automated texts and reminders keep momentum until closeout." },
];

const QUICK_QUESTIONS = [
  "Should I use Sidecar or Hybrid with Jobber?",
  "How does Housecall Pro differ from QuickBooks setup?",
  "What value does Standalone mode add for a 3-tech team?",
  "What should we configure first during onboarding?",
  "How does GoFieldWise reduce missed-call revenue loss?",
];

function resolveQuestionTag(question, activeService) {
  const q = String(question || "").toLowerCase();
  const hasModeIntent = q.includes("sidecar") || q.includes("hybrid") || q.includes("standalone");

  if (q.includes("jobber")) return "jobber";
  if (q.includes("housecall")) return "housecall";
  if (q.includes("quickbooks")) return "quickbooks";
  if (q.includes("google calendar") || q.includes("calendar")) return "google-calendar";

  // Do not force connector filtering on pure mode questions.
  if (hasModeIntent) return null;

  return activeService || null;
}

function resolveQuestionCategory(question) {
  const q = String(question || "").toLowerCase();
  if (q.includes("sidecar") || q.includes("hybrid") || q.includes("standalone") || q.includes("mode")) {
    return "mode";
  }
  if (q.includes("jobber") || q.includes("housecall") || q.includes("quickbooks") || q.includes("calendar")) {
    return "service";
  }
  if (q.includes("onboard") || q.includes("setup") || q.includes("activate")) {
    return "onboarding";
  }
  if (q.includes("follow-up") || q.includes("qualification") || q.includes("call") || q.includes("feature")) {
    return "feature";
  }
  return null;
}

export default function ConnectPage() {
  const [activeMode, setActiveMode] = useState("sidecar");
  const [activeService, setActiveService] = useState("jobber");
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [showTelemetryPanel, setShowTelemetryPanel] = useState(false);
  const [telemetryToken, setTelemetryToken] = useState("");
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState("");
  const [telemetrySummary, setTelemetrySummary] = useState(null);
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: "assistant",
      text: "Ask me any GoFieldWise configuration question. I will answer using the product knowledge base.",
    },
  ]);

  const selectedMode = useMemo(() => MODES.find((mode) => mode.id === activeMode) || MODES[0], [activeMode]);
  const selectedService = useMemo(
    () => SERVICES.find((service) => service.id === activeService) || SERVICES[0],
    [activeService]
  );

  const compatibleServices = useMemo(
    () => SERVICES.filter((service) => service.modes.includes(activeMode)),
    [activeMode]
  );

  useEffect(() => {
    const stillCompatible = compatibleServices.some((service) => service.id === activeService);
    if (!stillCompatible) {
      setActiveService(compatibleServices[0]?.id || "quickbooks");
    }
  }, [activeMode, activeService, compatibleServices]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const telemetryEnabled = params.get("telemetry") === "1";
    setShowTelemetryPanel(telemetryEnabled);
  }, []);

  async function submitAssistantQuestion(question) {
    if (!question || assistantLoading) return;

    setAssistantInput("");
    setAssistantMessages((current) => [...current, { role: "user", text: question }]);
    setAssistantLoading(true);

    try {
      const response = await fetch("/api/help/kb-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          limit: 5,
          tag: resolveQuestionTag(question, activeService),
          category: resolveQuestionCategory(question),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Knowledge base lookup failed.");
      }

      const first = Array.isArray(payload.items) && payload.items[0] ? payload.items[0] : null;
      const answer = first
        ? [
            `${first.title}: ${first.body}`,
            `Value: ${first.value}`,
            `Best for: ${first.bestFor || "General use"}`,
          ].join("\n")
        : payload.clarifyingQuestion
        ? `I want to make sure I answer correctly. ${payload.clarifyingQuestion}`
        : payload.context || "I could not find a direct match. Ask about Sidecar, Hybrid, Standalone, or a connector.";

      setAssistantMessages((current) => [...current, { role: "assistant", text: answer }]);
    } catch (error) {
      setAssistantMessages((current) => [
        ...current,
        { role: "assistant", text: `Error: ${error?.message || "Could not retrieve KB answer."}` },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  }

  async function handleAssistantAsk(event) {
    event.preventDefault();
    await submitAssistantQuestion(assistantInput.trim());
  }

  async function selectQuickQuestion(question) {
    await submitAssistantQuestion(question);
  }

  async function loadTelemetrySummary() {
    if (telemetryLoading) return;

    if (!telemetryToken.trim()) {
      setTelemetryError("Enter admin token to load telemetry summary.");
      return;
    }

    setTelemetryLoading(true);
    setTelemetryError("");

    try {
      const response = await fetch("/api/help/kb-telemetry-summary?lookbackHours=24&limit=10", {
        method: "GET",
        headers: {
          "x-kb-telemetry-admin-token": telemetryToken.trim(),
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Could not load telemetry summary.");
      }
      setTelemetrySummary(payload);
    } catch (error) {
      setTelemetryError(error?.message || "Could not load telemetry summary.");
    } finally {
      setTelemetryLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>GoFieldWise Connect | Keep Your CRM, Add an AI Front Office</title>
        <meta
          name="description"
          content="Explore GoFieldWise Connect modes and integrations. Click Sidecar, Hybrid, or Standalone to see how each connector works and what value it adds."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gofieldwise.com/connect" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GoFieldWise Connect | Keep Your CRM, Add an AI Front Office" />
        <meta
          property="og:description"
          content="Explore GoFieldWise Connect modes and integrations. Click Sidecar, Hybrid, or Standalone to see how each connector works and what value it adds."
        />
        <meta property="og:url" content="https://gofieldwise.com/connect" />
        <meta property="og:image" content="https://gofieldwise.com/images/og/gofieldwise-og-connect.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="GoFieldWise Connect — keep your CRM and add an AI front office" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GoFieldWise Connect | Keep Your CRM, Add an AI Front Office" />
        <meta
          name="twitter:description"
          content="Explore GoFieldWise Connect modes and integrations. Click Sidecar, Hybrid, or Standalone to see how each connector works and what value it adds."
        />
        <meta name="twitter:image" content="https://gofieldwise.com/images/og/gofieldwise-og-connect.webp" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "AI Front Office Integration",
              name: "GoFieldWise Connect",
              description:
                "Explore GoFieldWise Connect modes and integrations. Click Sidecar, Hybrid, or Standalone to see how each connector works and what value it adds.",
              provider: { "@type": "Organization", name: "GoFieldwise", url: "https://gofieldwise.com" },
              url: "https://gofieldwise.com/connect",
            }),
          }}
        />
      </Head>

      <main className="connect-shell">
        <section className="hero">
          <p className="eyebrow">GoFieldWise Connect</p>
          <h1>Keep your stack. Upgrade your response speed.</h1>
          <p className="hero-copy">
            Choose how GoFieldWise should run across your business. Click any mode to see detailed behavior,
            connector fit, and value before setup.
          </p>
          <div className="hero-actions">
            <Link href="/demo" className="cta-primary" onClick={() => trackIntentClick("connect_demo", "connect_page")}>
              Try the live demo
            </Link>
            <Link href="/pricing" className="cta-secondary" onClick={() => trackIntentClick("connect_pricing", "connect_page")}>
              Talk through setup
            </Link>
          </div>
        </section>

        <section className="mode-section">
          <div className="mode-tabs" role="tablist" aria-label="Connection mode tabs">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={mode.id === activeMode ? "mode-tab active" : "mode-tab"}
                onClick={() => setActiveMode(mode.id)}
                aria-pressed={mode.id === activeMode}
              >
                <strong>{mode.title}</strong>
                <span>{mode.subtitle}</span>
              </button>
            ))}
          </div>

          <article className="mode-detail" aria-live="polite" key={selectedMode.id}>
            <h2>{selectedMode.title}</h2>
            <p>{selectedMode.summary}</p>
            <p className="best-for"><strong>Best for:</strong> {selectedMode.bestFor}</p>
            <div className="mode-metric-grid">
              {selectedMode.detailCards.map((item) => (
                <article key={item.label} className="mode-metric-card">
                  <h3>{item.label}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <ul>
              {selectedMode.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="service-section">
          <div className="section-head">
            <h2>Connect service explorer</h2>
            <p>Click a service to see exactly how it works and what sets it apart in {selectedMode.title.toLowerCase()}.</p>
          </div>

          <div className="service-grid">
            {compatibleServices.map((service) => (
              <button
                key={service.id}
                type="button"
                className={service.id === selectedService.id ? "service-card active" : "service-card"}
                onClick={() => setActiveService(service.id)}
                aria-pressed={service.id === selectedService.id}
              >
                <strong>{service.name}</strong>
                <span>{service.value}</span>
              </button>
            ))}
          </div>

          <article className="service-detail" aria-live="polite" key={`${selectedMode.id}-${selectedService.id}`}>
            <h3>{selectedService.name}</h3>
            <div className="detail-grid">
              <div>
                <h4>How it works</h4>
                <p>{selectedService.works}</p>
              </div>
              <div>
                <h4>What sets it apart</h4>
                <p>{selectedService.apart}</p>
              </div>
              <div>
                <h4>Value added</h4>
                <p>{selectedService.value}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="flow-section">
          <div className="section-head">
            <h2>What happens when a customer calls</h2>
            <p>Interactive handoff flow from first ring to follow-up.</p>
          </div>
          <div className="flow-grid">
            {FLOW.map((item) => (
              <article className="flow-card" key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="assistant-section">
          <div className="section-head">
            <h2>Connect Assistant</h2>
            <p>
              This assistant is grounded in the GoFieldWise configuration knowledge base and can explain modes,
              connectors, and feature value.
            </p>
          </div>

          <div className="assistant-history" aria-live="polite">
            {assistantMessages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={message.role === "assistant" ? "assistant-bubble assistant" : "assistant-bubble user"}
              >
                <strong>{message.role === "assistant" ? "Assistant" : "You"}</strong>
                <p>{message.text}</p>
              </article>
            ))}
            {assistantLoading ? (
              <article className="assistant-bubble assistant">
                <strong>Assistant</strong>
                <p>Looking that up in the configuration knowledge base…</p>
              </article>
            ) : null}
          </div>

          <form className="assistant-form" onSubmit={handleAssistantAsk}>
            <textarea
              value={assistantInput}
              onChange={(event) => setAssistantInput(event.target.value)}
              placeholder="Example: Should a 3-tech HVAC team use Sidecar or Hybrid with Jobber?"
              rows={3}
            />
            <div className="assistant-chip-row" aria-label="Suggested questions">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="assistant-chip"
                  onClick={() => selectQuickQuestion(question)}
                  disabled={assistantLoading}
                >
                  {question}
                </button>
              ))}
            </div>
            <button type="submit" disabled={assistantLoading || !assistantInput.trim()}>
              Ask Connect Assistant
            </button>
          </form>
        </section>

        {showTelemetryPanel ? (
          <section className="telemetry-section">
            <div className="section-head">
              <h2>KB telemetry summary</h2>
              <p>Admin view of low-confidence KB events from the current app instance.</p>
            </div>

            <div className="telemetry-controls">
              <label className="telemetry-token-field">
                <span>Admin token</span>
                <input
                  type="password"
                  value={telemetryToken}
                  onChange={(event) => setTelemetryToken(event.target.value)}
                  placeholder="Enter telemetry admin token"
                  autoComplete="off"
                />
              </label>
              <button type="button" className="telemetry-refresh" onClick={loadTelemetrySummary} disabled={telemetryLoading}>
                {telemetryLoading ? "Loading telemetry..." : "Refresh telemetry summary"}
              </button>
              <span>Source: /api/help/kb-telemetry-summary</span>
            </div>

            {telemetryError ? <p className="telemetry-error">{telemetryError}</p> : null}

            {telemetrySummary ? (
              <div className="telemetry-content">
                <div className="telemetry-stat-grid">
                  <article className="telemetry-stat-card">
                    <strong>Total low-confidence events</strong>
                    <p>{telemetrySummary.totalEventsInWindow || 0}</p>
                  </article>
                  <article className="telemetry-stat-card">
                    <strong>Lookback window</strong>
                    <p>{telemetrySummary.lookbackHours || 24}h</p>
                  </article>
                  <article className="telemetry-stat-card">
                    <strong>Unique fingerprints</strong>
                    <p>{(telemetrySummary.topFingerprints || []).length}</p>
                  </article>
                </div>

                <div className="telemetry-list-grid">
                  <article className="telemetry-list-card">
                    <h3>Top query fingerprints</h3>
                    <ul>
                      {(telemetrySummary.topFingerprints || []).map((item) => (
                        <li key={item.queryFingerprint}>
                          <strong>{item.queryFingerprint}</strong>
                          <span>{item.count} events, avg confidence {item.avgTopConfidence}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="telemetry-list-card">
                    <h3>Top categories</h3>
                    <ul>
                      {(telemetrySummary.topCategories || []).map((item) => (
                        <li key={item.category}>
                          <strong>{item.category}</strong>
                          <span>{item.count} events</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="telemetry-list-card">
                    <h3>Top tags</h3>
                    <ul>
                      {(telemetrySummary.topTags || []).map((item) => (
                        <li key={item.tag}>
                          <strong>{item.tag}</strong>
                          <span>{item.count} events</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            ) : (
              <p className="telemetry-empty">No telemetry loaded yet. Click refresh to fetch the latest summary.</p>
            )}
          </section>
        ) : null}
      </main>

      <style jsx>{`
        .connect-shell {
          min-height: 100vh;
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 18px 42px;
          color: #123245;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 28px 24px;
          background: linear-gradient(130deg, #0f3f56, #105f73 62%, #2f8da2);
          color: #f5fbff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 24px 48px rgba(15, 63, 86, 0.24);
        }

        .hero::after {
          content: "";
          position: absolute;
          inset: auto -48px -72px auto;
          width: 280px;
          height: 280px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 219, 145, 0.26), rgba(255, 219, 145, 0));
          pointer-events: none;
        }

        .eyebrow {
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.11em;
          font-weight: 800;
          font-size: 0.78rem;
          color: #ffdc97;
        }

        h1 {
          margin: 0;
          font-size: clamp(2.05rem, 5vw, 3.3rem);
          line-height: 1.04;
          max-width: 720px;
        }

        .hero-copy {
          margin: 12px 0 0;
          max-width: 760px;
          font-size: 1.04rem;
          color: rgba(245, 251, 255, 0.93);
          line-height: 1.7;
        }

        .hero-actions {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .cta-primary,
        .cta-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          padding: 0 15px;
          transition: transform 140ms ease, box-shadow 140ms ease;
        }

        .cta-primary {
          background: linear-gradient(120deg, #f0c54f, #ffe08f);
          color: #152432;
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);
        }

        .cta-secondary {
          color: #f5fbff;
          border: 1px solid rgba(245, 251, 255, 0.44);
          background: rgba(15, 63, 86, 0.35);
        }

        .cta-primary:hover,
        .cta-secondary:hover {
          transform: translateY(-1px);
        }

        .mode-section,
        .service-section,
        .flow-section,
        .assistant-section,
        .telemetry-section {
          margin-top: 18px;
          border: 1px solid #d4e3ea;
          border-radius: 14px;
          background: linear-gradient(180deg, #ffffff, #f6fbfd);
          padding: 18px;
        }

        .mode-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .mode-tab {
          text-align: left;
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          padding: 12px;
          background: #ffffff;
          color: #23485c;
          cursor: pointer;
          display: grid;
          gap: 4px;
        }

        .mode-tab strong {
          font-size: 1.03rem;
        }

        .mode-tab span {
          color: #4a6473;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .mode-tab.active {
          border-color: #3d849b;
          background: linear-gradient(180deg, #eaf7fc, #f8fdff);
          box-shadow: inset 0 0 0 1px rgba(61, 132, 155, 0.2);
        }

        .mode-detail {
          margin-top: 12px;
          border-radius: 10px;
          border: 1px solid #d4e3ea;
          background: #ffffff;
          padding: 14px;
          animation: reveal 220ms ease;
        }

        .mode-detail h2 {
          margin: 0;
          font-size: 1.45rem;
          color: #133e54;
        }

        .mode-detail p {
          margin: 10px 0 0;
          color: #294f62;
          line-height: 1.7;
        }

        .mode-detail .best-for {
          color: #173e52;
        }

        .mode-metric-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .mode-metric-card {
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          background: linear-gradient(180deg, #ffffff, #f8fdff);
          padding: 11px;
        }

        .mode-metric-card h3 {
          margin: 0;
          color: #1c4c62;
          font-size: 0.87rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .mode-metric-card p {
          margin: 8px 0 0;
          color: #3c6174;
          line-height: 1.6;
          font-size: 0.92rem;
        }

        .mode-detail ul {
          margin: 12px 0 0;
          padding-left: 20px;
        }

        .mode-detail li {
          color: #294f62;
          line-height: 1.65;
        }

        .section-head h2 {
          margin: 0;
          font-size: 1.58rem;
          color: #133e54;
        }

        .section-head p {
          margin: 8px 0 0;
          color: #3a5e70;
          line-height: 1.65;
        }

        .service-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .service-card {
          text-align: left;
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          background: #ffffff;
          padding: 12px;
          cursor: pointer;
          display: grid;
          gap: 6px;
        }

        .service-card strong {
          color: #173e52;
          font-size: 1rem;
        }

        .service-card span {
          color: #47687a;
          line-height: 1.52;
          font-size: 0.9rem;
        }

        .service-card.active {
          border-color: #3d849b;
          background: linear-gradient(180deg, #eaf7fc, #f8fdff);
          box-shadow: inset 0 0 0 1px rgba(61, 132, 155, 0.2);
        }

        .service-detail {
          margin-top: 12px;
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          background: #ffffff;
          padding: 14px;
          animation: reveal 220ms ease;
        }

        .service-detail h3 {
          margin: 0;
          color: #173e52;
          font-size: 1.3rem;
        }

        .detail-grid {
          margin-top: 10px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .detail-grid h4 {
          margin: 0;
          color: #1b4a61;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .detail-grid p {
          margin: 8px 0 0;
          color: #355a6d;
          line-height: 1.65;
        }

        .flow-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .flow-card {
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          padding: 11px;
          background: #ffffff;
        }

        .flow-card span {
          color: #1f6b83;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .flow-card h3 {
          margin: 6px 0 0;
          color: #173e52;
          font-size: 1.05rem;
        }

        .flow-card p {
          margin: 8px 0 0;
          color: #44667a;
          line-height: 1.56;
          font-size: 0.92rem;
        }

        .assistant-history {
          margin-top: 12px;
          display: grid;
          gap: 9px;
          max-height: 320px;
          overflow: auto;
          padding-right: 4px;
        }

        .assistant-bubble {
          border-radius: 10px;
          padding: 10px 12px;
          border: 1px solid #d4e3ea;
        }

        .assistant-bubble strong {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .assistant-bubble p {
          margin: 8px 0 0;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .assistant-bubble.assistant {
          background: #ffffff;
          color: #224a5f;
        }

        .assistant-bubble.user {
          background: #eaf7fc;
          border-color: #b8d6e3;
          color: #173f54;
        }

        .assistant-form {
          margin-top: 12px;
          display: grid;
          gap: 10px;
        }

        .assistant-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .assistant-chip {
          border: 1px solid #bfd5de;
          background: #ffffff;
          color: #1b4a61;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.86rem;
          line-height: 1.4;
          cursor: pointer;
        }

        .assistant-chip:hover {
          background: #eaf7fc;
          border-color: #9ec4d2;
        }

        .assistant-chip:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .assistant-form textarea {
          border: 1px solid #bfd5de;
          border-radius: 10px;
          padding: 10px 11px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          min-height: 86px;
        }

        .assistant-form button {
          justify-self: start;
          min-height: 42px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(120deg, #0d3e56, #1b7288);
          color: #ffffff;
          font-weight: 700;
          padding: 0 14px;
          cursor: pointer;
        }

        .assistant-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .telemetry-controls {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          color: #47687a;
          font-size: 0.9rem;
        }

        .telemetry-token-field {
          display: grid;
          gap: 4px;
          min-width: 260px;
        }

        .telemetry-token-field span {
          color: #23485c;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .telemetry-token-field input {
          border: 1px solid #bfd5de;
          border-radius: 9px;
          padding: 8px 10px;
          font-size: 0.9rem;
          font-family: inherit;
          min-height: 38px;
          width: 100%;
          max-width: 320px;
        }

        .telemetry-refresh {
          min-height: 40px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(120deg, #1b7288, #2b8e8f);
          color: #ffffff;
          font-weight: 700;
          padding: 0 14px;
          cursor: pointer;
        }

        .telemetry-refresh:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .telemetry-error {
          margin: 10px 0 0;
          color: #912f2f;
          background: #fff0f0;
          border: 1px solid #f2c7c7;
          border-radius: 8px;
          padding: 9px 10px;
        }

        .telemetry-empty {
          margin: 12px 0 0;
          color: #47687a;
        }

        .telemetry-content {
          margin-top: 12px;
          display: grid;
          gap: 12px;
        }

        .telemetry-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .telemetry-stat-card {
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          background: #ffffff;
          padding: 11px;
        }

        .telemetry-stat-card strong {
          display: block;
          color: #1b4a61;
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .telemetry-stat-card p {
          margin: 8px 0 0;
          font-size: 1.24rem;
          color: #173e52;
          font-weight: 700;
        }

        .telemetry-list-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .telemetry-list-card {
          border: 1px solid #d4e3ea;
          border-radius: 10px;
          background: #ffffff;
          padding: 12px;
        }

        .telemetry-list-card h3 {
          margin: 0;
          color: #173e52;
          font-size: 1rem;
        }

        .telemetry-list-card ul {
          margin: 10px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 7px;
        }

        .telemetry-list-card li {
          color: #355a6d;
          line-height: 1.55;
        }

        .telemetry-list-card li strong {
          display: block;
          color: #173e52;
          font-size: 0.92rem;
          font-family: Consolas, "Courier New", monospace;
        }

        .telemetry-list-card li span {
          font-size: 0.88rem;
          color: #4a6a7d;
        }

        @media (max-width: 980px) {
          .mode-tabs {
            grid-template-columns: 1fr;
          }

          .service-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mode-metric-grid,
          .detail-grid,
          .telemetry-stat-grid,
          .telemetry-list-grid {
            grid-template-columns: 1fr;
          }

          .flow-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .connect-shell {
            padding: 16px 12px 30px;
          }

          .hero {
            padding: 22px 16px;
          }

          .service-grid,
          .flow-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @keyframes reveal {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Footer />
    </>
  );
}