import Link from "next/link";
import { useState } from "react";

function isConfiguredSocialProfile(url) {
  if (!/^https:\/\/.+\..+/.test(url)) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    if (["facebook.com", "x.com", "twitter.com"].includes(host) && !path) return false;
    return true;
  } catch {
    return false;
  }
}

export default function Footer() {
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "";
  const xUrl = process.env.NEXT_PUBLIC_X_URL || process.env.NEXT_PUBLIC_TWITTER_URL || "";
  const socialLinks = [
    {
      key: "facebook",
      href: facebookUrl,
      label: "Facebook",
      title: "Follow GoFieldWise on Facebook",
      path: "M13.5 9H16V6h-2.5C10.9 6 9 7.9 9 10.5V13H7v3h2v5h3v-5h2.3l.7-3H12v-2.5c0-.8.7-1.5 1.5-1.5z",
    },
    {
      key: "x",
      href: xUrl,
      label: "X",
      title: "Follow GoFieldWise on X",
      path: "M18.2 3H21l-6.5 7.4L22 21h-6.2l-4.9-6.4L5.3 21H3l7-8L2 3h6.3l4.5 5.9L18.2 3zm-1.1 16h1.7L7.2 4.9H5.4L17.1 19z",
    },
  ].filter((link) => isConfiguredSocialProfile(link.href));
  
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
            By subscribing, you agree to receive recurring automated marketing and service text messages from
            GoFieldWise at the number provided. Consent is not a condition of purchase. Msg frequency
            varies, up to 6 msgs/month. Msg &amp; data rates may apply. Reply HELP for help, STOP to cancel.
            See our <Link href="/privacy">Privacy Policy</Link>, <Link href="/terms">Terms</Link>, and{" "}
            <Link href="/sms">SMS Alerts page</Link>.
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
            {socialLinks.length ? (
              <div className="footer-socials" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a key={link.key} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} title={link.title}>
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" width="18" height="18" focusable="false">
                      <path d={link.path} />
                    </svg>
                  </a>
                ))}
              </div>
            ) : null}
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
              <li><Link href="/sms">SMS Alerts &amp; Opt-In</Link></li>
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
