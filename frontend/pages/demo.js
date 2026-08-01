import Head from "next/head";
import Link from "next/link";
import { useState } from "react"; // Importing useState for managing form state

import { trackEvent, trackIntentClick } from "../lib/analytics";
import { getAttributionSnapshot } from "../lib/attribution";
import { submitPublicDemoCallIntake, fetchDemoCallTranscript, sendDemoCallSmsSummary } from "../lib/api";
import Footer from "../components/Footer";


const BASE_URL = "https://gofieldwise.com";
const DEFAULT_DEMO_VIDEO_URL = `${BASE_URL}/demo/gofieldwise-demo.mp4`;
const DEFAULT_DEMO_VIDEO_THUMBNAIL_URL = `${BASE_URL}/demo/gofieldwise-demo-thumbnail.png`;
const INTAKE_KEY = process.env.NEXT_PUBLIC_INTAKE_KEY || "";
const LEGACY_INTAKE_ORG_ID = process.env.NEXT_PUBLIC_INTAKE_ORG_ID || "";
const hasRemoteDemoConfig = Boolean(INTAKE_KEY || LEGACY_INTAKE_ORG_ID);

const secondaryCtaStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid #d4a72c",
  background: "#fff4bf",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  opacity: 1,
  filter: "none",
  WebkitTextFillColor: "#0f172a",
};

  export default function DemoPage() {
    const [form, setForm] = useState({
      name: "",
      email: "",
      phone: "",
      details: "",
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [submittedData, setSubmittedData] = useState(null);
    const [callSid, setCallSid] = useState(null);
    const [transcript, setTranscript] = useState([]);
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [smsStatus, setSmsStatus] = useState("");
    const demoVideoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || DEFAULT_DEMO_VIDEO_URL;
    const demoVideoThumbnailUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_THUMBNAIL_URL || DEFAULT_DEMO_VIDEO_THUMBNAIL_URL;
    const hasVideoAsset = Boolean(demoVideoUrl && demoVideoThumbnailUrl);
    const isDirectVideoFile = /\.(mp4|webm|m4v|mov)(\?.*)?$/i.test(demoVideoUrl);
    const demoSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "GoFieldwise",
      url: "https://gofieldwise.com",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "12",
      },
      publisher: {
        "@type": "Organization",
        name: "GoFieldwise",
        url: "https://gofieldwise.com",
      },
      "@id": "https://gofieldwise.com#software",
    };
    const videoSchema =
      hasVideoAsset
        ? {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "GoFieldwise Demo",
            description: "See how GoFieldwise automates lead capture and dispatching.",
            thumbnailUrl: demoVideoThumbnailUrl,
            uploadDate: "2026-04-12T09:00:00-05:00",
            ...(isDirectVideoFile ? { contentUrl: demoVideoUrl } : { embedUrl: demoVideoUrl }),
          }
        : null;

    async function onDemoSubmit(event) {
      event.preventDefault();
      setError("");
      setNote("");
      setSmsStatus("");
      setTranscript([]);
      setCallSid(null);

      const trimmedName = form.name.trim();
      const trimmedEmail = form.email.trim();
      const trimmedPhone = form.phone.trim();

      if (!trimmedName || !trimmedEmail || !trimmedPhone) {
        setError("Name, email, and phone are required to start the live demo call.");
        return;
      }

      setBusy(true);
      try {
        const snapshot = getAttributionSnapshot();
        setFieldErrors({});

        const out = await submitPublicDemoCallIntake({
          intakeKey: INTAKE_KEY,
          orgId: LEGACY_INTAKE_ORG_ID,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          details: form.details.trim() || null,
          attribution: snapshot?.last_touch || null,
          ctaName: "demo_call_request",
        });

        trackEvent("demo_call_requested", { call_started: Boolean(out?.call_started) });

        setSubmittedData({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
        });
        setNote("Perfect. We are calling you now and connecting you to Adrian.");
        setForm({ name: "", email: "", phone: "", details: "" });

        if (out?.call_sid) {
          setCallSid(out.call_sid);
          fetchTranscriptLoop(out.call_sid);
        }
      } catch (err) {
        if (!hasRemoteDemoConfig) {
          setError("");
          setNote("Local demo simulation started successfully. (No real call will be placed.)");
          setSubmittedData({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
          });
          setTranscript([
            { speaker: "system", text: "This is a local demo simulation. No real call is being placed." },
            { speaker: "ai", text: "Perfect. We are calling you now and connecting you to Adrian." },
          ]);
          setCallSid("LOCAL-DEMO-SIM");
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setBusy(false);
      }
    }

    async function fetchTranscriptLoop(sid) {
      setTranscriptLoading(true);
      try {
        const res = await fetchDemoCallTranscript(sid);
        setTranscript(res.transcript || []);
      } catch (err) {
        // optionally handle error
      } finally {
        setTranscriptLoading(false);
      }
    }

    async function onSendSmsSummary() {
      setSmsStatus("Sending...");
      try {
        const leadId = 1;
        const res = await sendDemoCallSmsSummary(leadId);
        setSmsStatus("SMS sent to " + res.to);
      } catch (err) {
        setSmsStatus("Failed: " + (err instanceof Error ? err.message : String(err)));
      }
    }

    return (
      <>
        <Head>
          <title>GoFieldWise Demo | AI Receptionist for Contractors</title>
          <meta
            name="description"
            content="Try the GoFieldWise AI receptionist demo for contractors. See how missed calls, lead capture, booking, dispatch notes, and follow-up work in one flow."
          />
          <meta property="og:title" content="GoFieldWise Demo | AI Receptionist for Contractors" />
          <meta
            property="og:description"
            content="Try the GoFieldWise AI receptionist demo for contractors. See call answering, lead capture, booking, dispatch notes, and follow-up in one flow."
          />
          <meta property="og:url" content="https://gofieldwise.com/demo" />
          <meta property="og:image" content="https://gofieldwise.com/images/og/gofieldwise-og-demo.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://gofieldwise.com/images/og/gofieldwise-og-demo.webp" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="GoFieldwise live demo social preview" />
          <meta name="twitter:title" content="GoFieldWise Demo | AI Receptionist for Contractors" />
          <meta
            name="twitter:description"
            content="Try the GoFieldWise AI receptionist demo for contractors. See call answering, lead capture, booking, dispatch notes, and follow-up in one flow."
          />
          <meta name="twitter:image" content="https://gofieldwise.com/social/demo-og.svg" />
          <meta name="twitter:image:alt" content="GoFieldwise live demo social preview" />
          <link rel="canonical" href="https://gofieldwise.com/demo" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(demoSchema) }}
          />
          {videoSchema && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
            />
          )}
        </Head>
        <main className="page-shell">
          <section className="hero">
            <p className="eyebrow">Live Demo</p>
            <h1>Try the AI receptionist flow before you subscribe.</h1>
            <p>
              See how GoFieldWise answers a contractor lead, captures the job details, prepares a
              dispatch summary, and sends follow-up without making your team chase voicemail.
            </p>
          </section>

          <section className="dispatch-card">
            <h2>What the demo shows</h2>
            <div className="results-grid">
              <article className="panel">
                <h3>Missed-call recovery</h3>
                <p>The AI responds when your team is on a job, after hours, or away from the phone.</p>
              </article>
              <article className="panel">
                <h3>Lead qualification</h3>
                <p>It captures service type, urgency, address, contact details, and the next best action.</p>
              </article>
              <article className="panel">
                <h3>Dispatch-ready notes</h3>
                <p>Your technician gets a clean summary instead of a vague voicemail or scattered text thread.</p>
              </article>
            </div>
          </section>

          <section className="dispatch-card">
            <h2>Start a demo call</h2>
            <p>
              Enter your details and GoFieldWise will run the same intake flow a home service lead
              would experience. In local development, this falls back to a safe simulation.
            </p>
            <form className="lead-form" onSubmit={onDemoSubmit}>
              <label>
                Name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
              </label>
              <label>
                Phone
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="(555) 555-0100" />
              </label>
              <label>
                What should the demo know?
                <textarea value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Example: HVAC company with after-hours calls" />
              </label>
              <button className="hero-cta-primary" type="submit" disabled={busy}>
                {busy ? "Starting demo..." : "Start Demo Call"}
              </button>
            </form>
            {error ? <p className="form-error">{error}</p> : null}
            {note ? <p className="form-success">{note}</p> : null}
            {submittedData ? (
              <div className="panel demo-status">
                <h3>Demo request captured</h3>
                <p>{submittedData.name} | {submittedData.email} | {submittedData.phone}</p>
                {callSid ? <p>Call ID: {callSid}</p> : null}
                {transcriptLoading ? <p>Loading transcript...</p> : null}
                {transcript.length ? (
                  <div className="transcript">
                    {transcript.map((row, index) => (
                      <p key={`${row.speaker}-${index}`}><strong>{row.speaker}:</strong> {row.text}</p>
                    ))}
                  </div>
                ) : null}
                {callSid ? <button className="ghost-button" type="button" onClick={onSendSmsSummary}>Send SMS Summary</button> : null}
                {smsStatus ? <p>{smsStatus}</p> : null}
              </div>
            ) : null}
          </section>

          <section className="dispatch-card">
            <h2>Built for the calls contractors actually miss</h2>
            <p>
              HVAC, plumbing, electrical, roofing, cleaning, and landscaping businesses lose jobs
              when customers hit voicemail. GoFieldWise gives small teams a 24/7 front office that
              answers quickly, asks the right questions, and keeps every new opportunity moving.
            </p>
            <div className="actions">
              <Link href="/pricing" className="hero-cta-primary" onClick={() => trackIntentClick("see_pricing_from_demo", "demo")}>See Pricing</Link>
              <Link href="/support" className="ghost-link" onClick={() => trackIntentClick("support_from_demo", "demo")}>Talk to Support</Link>
            </div>
          </section>
        </main>

        <style jsx>{`
          .lead-form {
            display: grid;
            gap: 12px;
            max-width: 680px;
          }
          .lead-form label {
            display: grid;
            gap: 6px;
            color: rgba(248, 250, 252, 0.88);
            font-weight: 700;
          }
          .lead-form input,
          .lead-form textarea {
            width: 100%;
            border: 1px solid rgba(245, 197, 66, 0.28);
            border-radius: 10px;
            padding: 11px 12px;
            color: #f8fafc;
            background: rgba(11, 15, 26, 0.78);
          }
          .lead-form textarea { min-height: 110px; resize: vertical; }
          .form-error { color: #fecaca; }
          .form-success { color: #bbf7d0; }
          .demo-status { margin-top: 14px; }
          .transcript {
            margin: 10px 0;
            padding: 10px;
            border-radius: 10px;
            background: rgba(15, 23, 42, 0.7);
          }
          .ghost-button {
            border: 1px solid rgba(245, 197, 66, 0.5);
            border-radius: 10px;
            padding: 10px 12px;
            color: #f5c542;
            background: transparent;
            font-weight: 700;
          }
        `}</style>

        <Footer />
      </>
    );
  }

