import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Footer from "../components/Footer";

// Cloudflare's Email Address Obfuscation rewrites plain-text addresses into
// "[email protected]" links. That is fine in prose, but the HELP sample below has
// to render literally so it matches the help message filed with the toll-free
// registration. These comments tell Cloudflare to leave the address alone.
const SUPPORT_EMAIL_HTML = "<!--email_off-->support@gofieldwise.com<!--email_on-->";

export async function getServerSideProps() {
  return { props: {} };
}

export default function SmsOptIn() {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = phone.trim();
    if (trimmed.replace(/\D/g, "").length < 10) {
      setStatus("error");
      setMessage("Please enter a valid 10-digit US mobile number.");
      return;
    }
    if (!consent) {
      setStatus("error");
      setMessage("Please check the consent box to opt in to text messages.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Subscribing...");
      const response = await fetch("/api/sms-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmed, consent: true, source: "sms_optin_page" }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Failed to subscribe. Please try again.");
        return;
      }

      setStatus("success");
      setMessage(payload.message || "You're opted in.");
      setPhone("");
      setConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please retry.");
    }
  }

  return (
    <>
      <Head>
        <title>SMS Alerts Opt-In | GoFieldWise</title>
        <meta
          name="description"
          content="Opt in to GoFieldWise SMS alerts. Message frequency varies, up to 6 messages per month. Msg & data rates may apply. Reply HELP for help, STOP to cancel."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gofieldwise.com/sms" />
      </Head>

      <main className="page-shell legal-page">
        <nav className="top-nav">
          <Link href="/" className="brand">GoFieldwise</Link>
          <div className="nav-links">
            <Link href="/demo">Demo</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/connect">Connect</Link>
            <Link href="/field-notes">Field Notes</Link>
          </div>
        </nav>

        <section className="legal-content">
          <h1>GoFieldWise SMS Alerts</h1>
          <p className="last-updated">Last updated: August 27, 2026</p>

          <p>
            GoFieldWise sends text messages to customers and prospects who ask for them. Opting in is
            always optional, is never a condition of purchase, and you can stop the messages at any time.
          </p>

          <h2>Sign up for text messages</h2>

          <form className="optin-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="sms-phone">Mobile number</label>
            <input
              id="sms-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={status === "loading"}
              required
            />

            <label className="consent-row" htmlFor="sms-consent">
              <input
                id="sms-consent"
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                disabled={status === "loading"}
                required
              />
              <span>
                By checking this box, I agree to receive recurring automated marketing and service text
                messages from GoFieldWise at the mobile number provided. Consent is not a condition of
                purchase. Message frequency varies, up to 6 messages per month. Msg &amp; data rates may
                apply. Reply HELP for help, STOP to cancel. See our{" "}
                <Link href="/privacy">Privacy Policy</Link> and{" "}
                <Link href="/terms">Terms &amp; Conditions</Link>.
              </span>
            </label>

            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Opt in to text messages"}
            </button>
          </form>

          {message ? (
            <p className={`form-message ${status === "success" ? "success" : "error"}`} role="status">
              {message}
            </p>
          ) : null}

          <h2>Program details</h2>
          <ul>
            <li><strong>Program name:</strong> GoFieldWise SMS Alerts</li>
            <li><strong>Sender:</strong> GoFieldWise, (855) 247-6985</li>
            <li>
              <strong>Message types:</strong> appointment and job status updates, account and billing
              notices, and occasional marketing tips and offers for home-service businesses
            </li>
            <li><strong>Message frequency:</strong> message frequency varies, up to 6 messages per month</li>
            <li><strong>Cost:</strong> Msg &amp; data rates may apply. GoFieldWise does not charge for the messages themselves</li>
            <li><strong>Supported carriers:</strong> most major US carriers, including AT&amp;T, Verizon, T-Mobile, and their affiliates</li>
          </ul>

          <h2>How to opt in</h2>
          <p>
            You can opt in by checking the consent box in the form above and submitting your mobile number,
            or by texting <strong>START</strong> to <strong>(855) 247-6985</strong>. After you opt in, we
            send a confirmation message:
          </p>
          <blockquote className="sample-message">
            GoFieldWise: You are now opted in to receive text messages. Msg frequency varies, up to 6
            msgs/month. Msg &amp; data rates may apply. Reply HELP for help, STOP to cancel.
          </blockquote>

          <h2>How to get help</h2>
          <p>
            Reply <strong>HELP</strong> to any message, or email{" "}
            <span dangerouslySetInnerHTML={{ __html: SUPPORT_EMAIL_HTML }} />. You will receive:
          </p>
          <blockquote className="sample-message">
            GoFieldWise: Help at <span dangerouslySetInnerHTML={{ __html: SUPPORT_EMAIL_HTML }} /> or (855)
            247-6985. Msg frequency varies, up to 6 msgs/month. Msg &amp; data rates may apply. Reply STOP to
            cancel.
          </blockquote>

          <h2>How to opt out</h2>
          <p>
            Reply <strong>STOP</strong> to any message at any time. You will receive one final confirmation
            and no further messages:
          </p>
          <blockquote className="sample-message">
            GoFieldWise: You have been unsubscribed and will receive no further messages. Reply START to
            rejoin.
          </blockquote>
          <p>
            You can also opt out by updating your communication preferences in your GoFieldWise account or
            by emailing support@gofieldwise.com.
          </p>

          <h2>Privacy</h2>
          <p>
            No mobile information will be shared with third parties or affiliates for marketing or
            promotional purposes. All other categories exclude text messaging originator opt-in data and
            consent; this information will not be shared with any third parties. Full details are in our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>Carrier disclaimer</h2>
          <p>
            Carriers are not liable for delayed or undelivered messages. Message delivery is subject to
            effective transmission by your wireless carrier and is not guaranteed.
          </p>

          <h2>Questions</h2>
          <ul>
            <li><strong>Email:</strong> support@gofieldwise.com</li>
            <li><strong>Phone:</strong> (855) 247-6985</li>
          </ul>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .optin-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 560px;
          margin: 18px 0 8px;
        }
        .field-label {
          font-weight: 600;
        }
        .optin-form input[type="tel"] {
          padding: 12px 14px;
          border: 1px solid #c9d4dd;
          border-radius: 8px;
          font-size: 1rem;
          width: 100%;
        }
        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.55;
          font-size: 0.95rem;
        }
        .consent-row input[type="checkbox"] {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }
        .optin-form button {
          align-self: flex-start;
          padding: 12px 22px;
          border: 0;
          border-radius: 8px;
          background: #0b6bcb;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }
        .optin-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .form-message {
          font-weight: 600;
        }
        .form-message.success {
          color: #1a7f4b;
        }
        .form-message.error {
          color: #b3261e;
        }
        .sample-message {
          margin: 12px 0;
          padding: 12px 16px;
          border-left: 4px solid #0b6bcb;
          background: rgba(11, 107, 203, 0.06);
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
