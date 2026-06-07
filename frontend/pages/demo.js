import Head from "next/head";
import Link from "next/link";
import { useState } from "react"; // Importing useState for managing form state

import { trackEvent, trackIntentClick } from "../lib/analytics";
import { getAttributionSnapshot } from "../lib/attribution";
import { submitPublicDemoCallIntake, fetchDemoCallTranscript, sendDemoCallSmsSummary } from "../lib/api";


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
            uploadDate: "2026-04-12",
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
          <title>GoFieldwise Demo — See AI Dispatching And Lead Capture In Action</title>
          <meta
            name="description"
            content="Watch how GoFieldwise automates lead capture, dispatching, scheduling, and customer communication."
          />
          <meta property="og:title" content="GoFieldwise Demo — See AI Dispatching And Lead Capture In Action" />
          <meta
            property="og:description"
            content="Watch how GoFieldwise automates lead capture, dispatching, scheduling, and customer communication."
          />
          <meta property="og:url" content="https://gofieldwise.com/demo" />
          <meta property="og:image" content="https://gofieldwise.com/social/demo-og.svg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="GoFieldwise live demo social preview" />
          <meta name="twitter:title" content="GoFieldwise Demo — See AI Dispatching And Lead Capture In Action" />
          <meta
            name="twitter:description"
            content="Watch how GoFieldwise automates lead capture, dispatching, scheduling, and customer communication."
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
        {/* Add your main demo JSX here, wrapped in a single parent element */}
        <main>
          {/* ...rest of your demo page... */}
        </main>
      </>
    );
  }

