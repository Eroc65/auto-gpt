import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com";
  const xUrl = process.env.NEXT_PUBLIC_X_URL || "https://x.com";
  const twitterUrl = "https://twitter.com";
  
  const [smsState, setSmsState] = useState({ phone: "", status: "idle", message: "" });

  async function handleSmsOptIn(event) {
    event.preventDefault();
    const phone = smsState.phone.trim();

    if (!phone || phone.length < 10) {
      setSmsState(prev => ({ ...prev, status: "error", message: "Please enter a valid phone number." }));
      return;
    }

    try {
      setSmsState(prev => ({ ...prev, status: "loading", message: "Subscribing..." }));
      const response = await fetch("/api/sms-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSmsState(prev => ({
          ...prev,
          status: "error",
          message: payload.error || "Failed to subscribe. Please try again.",
        }));
        return;
      }

      setSmsState(prev => ({
        ...prev,
        status: "success",
        message: "Subscribed! Check your phone for a confirmation message.",
        phone: "",
      }));

      setTimeout(() => {
        setSmsState({ phone: "", status: "idle", message: "" });
      }, 5000);
    } catch (error) {
      setSmsState(prev => ({ ...prev, status: "error", message: "Network error. Please retry." }));
    }
  }

  return (
    <footer className="gfw-footer">
      {/* SMS Opt-In Section */}
      <section className="footer-sms-section">
        <div className="sms-content">
          <h3>Get Exclusive Tips via SMS</h3>
          <p>Stay updated with quick wins and playbooks delivered straight to your phone.</p>
          <form className="sms-form" onSubmit={handleSmsOptIn}>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={smsState.phone}
              onChange={(e) => setSmsState(prev => ({ ...prev, phone: e.target.value }))}
              disabled={smsState.status === "loading"}
              required
            />
            <button type="submit" disabled={smsState.status === "loading"}>
              {smsState.status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {smsState.message && (
            <p className={`sms-message ${smsState.status === "success" ? "success" : "error"}`}>
              {smsState.message}
            </p>
          )}
          <p className="sms-disclaimer">
            By subscribing, you agree to receive SMS messages from GoFieldWise. Msg & data rates may apply. 
            Reply STOP to unsubscribe.
          </p>
        </div>
      </section>

      {/* Main Footer Content */}
      <section className="footer-main">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-column">
            <h4>GoFieldWise</h4>
            <p>AI receptionist and business management for home service teams.</p>
            <div className="footer-socials">
              <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" title="Follow GoFieldWise on Facebook">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v5h3v-5h2.3l.7-3H12v-2.5c0-.8.7-1.5 1.5-1.5z" /></svg>
              </a>
              <a href={xUrl} target="_blank" rel="noreferrer" aria-label="X" title="Follow GoFieldWise on X">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M18.2 3H21l-6.5 7.4L22 21h-6.2l-4.9-6.4L5.3 21H3l7-8L2 3h6.3l4.5 5.9L18.2 3zm-1.1 16h1.7L7.2 4.9H5.4L17.1 19z" /></svg>
              </a>
              <a href={twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter" title="Follow GoFieldWise on Twitter">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.2 1.7-2.2-.8.4-1.7.8-2.6.9A4 4 0 0 0 12 8.5c0 .3 0 .6.1.9-3.3-.2-6.3-1.8-8.2-4.3-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.6 1.8 3.3-.7 0-1.3-.2-1.8-.5 0 1.9 1.3 3.5 3.1 3.8-.3.1-.7.1-1 .1-.2 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8A8 8 0 0 1 3 18.3 11.2 11.2 0 0 0 9.1 20c7.3 0 11.3-6.2 11.3-11.5v-.5c.8-.5 1.4-1.2 1.9-2.1z" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="footer-column">
            <h4>Product</h4>
            <ul>
              <li><Link href="/demo">Live Demo</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/connect">GoFieldWise Connect</Link></li>
              <li><Link href="/field-notes">Field Notes</Link></li>
              <li><a href="https://support.gofieldwise.com" target="_blank" rel="noreferrer">Help Center</a></li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="footer-column">
            <h4>By Trade</h4>
            <ul>
              <li><Link href="/hvac">HVAC</Link></li>
              <li><Link href="/plumbing">Plumbing</Link></li>
              <li><Link href="/electrical">Electrical</Link></li>
              <li><Link href="/roofing">Roofing</Link></li>
              <li><Link href="/cleaning">Cleaning</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Support */}
          <div className="footer-column">
            <h4>Legal & Support</h4>
            <ul>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><a href="mailto:support@gofieldwise.com">Contact Support</a></li>
              <li><a href="tel:+18552476985">(855) 247-6985</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GoFieldWise. All rights reserved.</p>
          <p className="footer-compliance">
            GoFieldWise uses Twilio for call tracking and SMS communications. 
            By using our service, you agree to our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms & Conditions</Link>.
          </p>
        </div>
      </section>
    </footer>
  );
}
