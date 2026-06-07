import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { trackEvent } from "../lib/analytics";
import { submitPublicIntentIntake, submitPublicSupportChat } from "../lib/api";
import { getAttributionSnapshot } from "../lib/attribution";

const INTAKE_KEY = process.env.NEXT_PUBLIC_INTAKE_KEY || "";
const LEGACY_INTAKE_ORG_ID = process.env.NEXT_PUBLIC_INTAKE_ORG_ID || "";
const INTAKE_API_URL = process.env.NEXT_PUBLIC_INTAKE_API_URL || "";
const SUPPORT_CHAT_ENDPOINT = process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENDPOINT || "";

const SUPPORT_TOPICS = [
  {
    id: "onboarding",
    question: "How fast can we get live after signup?",
  },
  {
    id: "phone",
    question: "Do I need to configure Twilio or Retell myself?",
  },
  {
    id: "roles",
    question: "Can techs use this from their phones in the field?",
  },
  {
    id: "billing",
    question: "Is pricing really flat at $200/month?",
  },
  {
    id: "integrations",
    question: "Do you support QuickBooks, Zapier, or Xero today?",
  },
];

export default function SupportPage() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !SUPPORT_CHAT_ENDPOINT) {
      console.warn(
        "[support.js] NEXT_PUBLIC_SUPPORT_CHAT_ENDPOINT is missing. " +
        "Support chat endpoint calls may fail. Set it in your .env.local file."
      );
    }

    if (process.env.NODE_ENV === "development" && !INTAKE_API_URL) {
      console.warn(
        "[support.js] NEXT_PUBLIC_INTAKE_API_URL is missing. " +
        "Support intake requests may fail. Set it in your .env.local file."
      );
    }

    if (process.env.NODE_ENV === "development" && !INTAKE_KEY && !LEGACY_INTAKE_ORG_ID) {
      console.warn(
        "[support.js] NEXT_PUBLIC_INTAKE_KEY and NEXT_PUBLIC_INTAKE_ORG_ID are both missing. " +
        "Intent intake will be skipped. Set at least one in your .env.local file."
      );
    }
  }, []);

  const router = useRouter();
  const source = typeof router.query.from === "string" ? router.query.from : "direct";
  const [submitting, setSubmitting] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [chatError, setChatError] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "onboarding",
    details: "",
  });

  const topicLabel = useMemo(() => {
    const row = SUPPORT_TOPICS.find((item) => item.id === form.topic);
    return row ? row.question : form.topic;
  }, [form.topic]);

  const supportSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "GoFieldwise Support",
    url: "https://gofieldwise.com/support",
    description: "Support, onboarding help, and product guidance for GoFieldwise.",
    mainEntity: {
      "@type": "Organization",
      name: "GoFieldwise",
      email: "support@gofieldwise.com",
      telephone: "+1-469-200-3331",
    },
  };

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name || !form.email || !form.details) {
      setError("Name, email, and support details are required.");
      return;
    }

    setSubmitting(true);
    try {
      trackEvent("support_request_submitted", {
        topic: form.topic,
        source,
      });

      const snapshot = getAttributionSnapshot();
      const canCaptureIntent = Boolean(INTAKE_KEY || LEGACY_INTAKE_ORG_ID);

      if (canCaptureIntent) {
        await submitPublicIntentIntake({
          intakeKey: INTAKE_KEY,
          orgId: LEGACY_INTAKE_ORG_ID,
          ctaName: "support_request",
          landingPage: typeof window !== "undefined" ? window.location.href : null,
          referrerUrl: typeof document !== "undefined" ? document.referrer || null : null,
          attribution: snapshot?.last_touch || null,
          rawMessage: [
            `Source: ${source}`,
            `Topic: ${topicLabel}`,
            `Name: ${form.name}`,
            `Email: ${form.email}`,
            `Phone: ${form.phone || "n/a"}`,
            `Details: ${form.details}`,
          ].join("\n"),
        });
      }

      setMessage("Support request received. We will follow up shortly.");
      setForm({
        name: "",
        email: "",
        phone: "",
        topic: "onboarding",
        details: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onSupportChat(event) {
    event.preventDefault();
    setChatError("");

    if (!chatInput.trim()) {
      setChatError("Ask a question so the assistant can look up the right guidance.");
      return;
    }

    const canCaptureIntent = Boolean(INTAKE_KEY || LEGACY_INTAKE_ORG_ID);
    if (!canCaptureIntent) {
      setChatError("Support assistant is not configured for this environment yet.");
      return;
    }

    setChatBusy(true);
    try {
      const response = await submitPublicSupportChat({
        intakeKey: INTAKE_KEY,
        orgId: LEGACY_INTAKE_ORG_ID,
        message: chatInput.trim(),
        contextKey: form.topic,
        trade: form.topic === "phone" ? "general" : null,
        limit: 3,
      });
      setChatReply(response);
      trackEvent("support_chat_asked", {
        topic: form.topic,
        citations: Array.isArray(response?.citations) ? response.citations.length : 0,
      });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : String(err));
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>GoFieldwise Support</title>
        <meta
          name="description"
          content="Get help with your GoFieldwise account, setup, and troubleshooting."
        />
        <meta property="og:title" content="GoFieldwise Support" />
        <meta
          property="og:description"
          content="Get help with your GoFieldwise account, setup, and troubleshooting."
        />
        <meta property="og:url" content="https://gofieldwise.com/support" />
        <meta property="og:image" content="https://gofieldwise.com/social/support-og.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="GoFieldwise support social preview" />
        <meta name="twitter:title" content="GoFieldwise Support" />
        <meta
          name="twitter:description"
          content="Get help with your GoFieldwise account, setup, and troubleshooting."
        />
        <meta name="twitter:image" content="https://gofieldwise.com/social/support-og.svg" />
        <meta name="twitter:image:alt" content="GoFieldwise support social preview" />
        <link rel="canonical" href="https://gofieldwise.com/support" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(supportSchema) }}
        />
      </Head>

      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">Support</p>
          <h1>Get help with setup, rollout, and troubleshooting.</h1>
          <p>
            Reach the GoFieldwise team for onboarding questions, product support, and account help.
          </p>
          <div className="hero-actions">
            <a className="ghost-link" href="tel:+14692003331">Call Support</a>
            <a className="ghost-link" href="mailto:support@gofieldwise.com">Email Support</a>
            <Link className="ghost-link" href="/help">Open Help Center</Link>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Support Response Times</h2>
          <div className="results-grid">
            <article className="panel">
              <h3>Email support</h3>
              <p>support@gofieldwise.com</p>
            </article>
            <article className="panel">
              <h3>Phone support</h3>
              <p>Call +1 (469) 200-3331 for rollout and account questions.</p>
            </article>
            <article className="panel">
              <h3>Typical response</h3>
              <p>Most requests receive a same-day response during business hours.</p>
            </article>
          </div>
        </section>

        <section className="dispatch-card">
          <h2>Ask The Support Assistant</h2>
          <p>Get instant guidance from your configured help articles and coaching playbooks.</p>
          <form className="lead-form" onSubmit={onSupportChat}>
          <label>
            Your Question
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Example: How should we handle no-heat calls after hours?"
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={chatBusy}>
              {chatBusy ? "Thinking..." : "Ask Support Assistant"}
            </button>
          </div>
          {chatReply ? (
            <article className="chat-reply" aria-live="polite">
              <h3>Assistant Reply</h3>
              <p>{chatReply.reply}</p>
              {Array.isArray(chatReply.citations) && chatReply.citations.length > 0 ? (
                <ul>
                  {chatReply.citations.map((row, idx) => (
                    <li key={`${row.title}-${idx}`}>
                      <strong>{row.title}</strong>: {row.snippet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ) : null}
          {chatError ? <p className="submit-error">{chatError}</p> : null}
          </form>
        </section>

        <section className="dispatch-card">
          <h2>Contact Support</h2>
          <form className="lead-form" onSubmit={onSubmit}>
          <label>
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </label>
          <label>
            Topic
            <select
              value={form.topic}
              onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
            >
              <option value="onboarding">Onboarding</option>
              <option value="phone">Phone and AI receptionist</option>
              <option value="roles">Team workflows</option>
              <option value="billing">Billing</option>
              <option value="integrations">Integrations</option>
            </select>
          </label>
          <label>
            Details
            <textarea
              value={form.details}
              onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Send Support Request"}
            </button>
          </div>
          {message ? <p className="submit-note">{message}</p> : null}
          {error ? <p className="submit-error">{error}</p> : null}
          </form>
        </section>

      <style jsx>{`
        .lead-form {
          display: grid;
          gap: 10px;
        }

        .lead-form label {
          display: grid;
          gap: 6px;
          font-weight: 700;
        }

        .lead-form input,
        .lead-form select,
        .lead-form textarea {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 0.95rem;
          background: #fff;
          font-family: inherit;
        }

        .lead-form textarea {
          resize: vertical;
          min-height: 90px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-start;
        }

        .chat-reply {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px;
          background: #f8fafc;
          display: grid;
          gap: 10px;
        }

        .chat-reply h3,
        .chat-reply p {
          margin: 0;
        }
      `}</style>
      </main>
    </>
  );
}
