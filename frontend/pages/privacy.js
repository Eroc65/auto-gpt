import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

export async function getServerSideProps() {
  return { props: {} };
}

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | GoFieldWise</title>
        <meta name="description" content="GoFieldWise privacy policy - how we protect your data." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gofieldwise.com/privacy" />
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
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: July 15, 2026</p>

          <h2>1. Introduction</h2>
          <p>GoFieldWise ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website gofieldwise.com (the "Site") and use our services.</p>

          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li><strong>Contact Information:</strong> Name, email address, phone number, and business details</li>
            <li><strong>Account Information:</strong> Login credentials, billing address, and subscription preferences</li>
            <li><strong>Service Usage Data:</strong> Call logs, message transcripts, customer interactions, and booking records (as part of our service)</li>
            <li><strong>Communication Preferences:</strong> Your SMS opt-in/opt-out status and contact frequency preferences</li>
            <li><strong>Device & Browser Information:</strong> IP address, browser type, device type, and usage analytics via cookies and similar technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our AI receptionist and business management services</li>
            <li>Process payments and send billing information</li>
            <li>Send service-related announcements and customer support messages</li>
            <li>Send marketing communications (only with your consent via SMS opt-in or email subscription)</li>
            <li>Monitor and analyze usage patterns to optimize service performance</li>
            <li>Comply with legal obligations and enforce our Terms & Conditions</li>
            <li>Detect and prevent fraud, abuse, and security threats</li>
          </ul>

          <h2>4. SMS Communications</h2>
          <p><strong>SMS Opt-In:</strong> By opting into SMS communications, you consent to receive promotional and transactional messages from GoFieldWise at the phone number you provide. Consent is not a condition of purchase. Message frequency varies, up to 6 messages per month. Msg &amp; data rates may apply. Reply HELP for help, STOP to cancel. Full program details are on our <Link href="/sms">SMS Alerts page</Link>.</p>
          <p><strong>Mobile information sharing:</strong> No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</p>
          <p><strong>SMS Opt-Out:</strong> You can opt out of SMS communications at any time by:</p>
          <ul>
            <li>Replying STOP to any SMS message</li>
            <li>Updating your communication preferences in your GoFieldWise account settings</li>
            <li>Contacting us at support@gofieldwise.com with your request</li>
          </ul>
          <p>Once you opt out, you will no longer receive SMS messages, though transactional messages (e.g., account alerts) may still be sent.</p>

          <h2>5. Data Sharing & Third Parties</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Payment processors, email providers, SMS providers (e.g., Twilio), and hosting providers</li>
            <li><strong>Legal Requirements:</strong> Law enforcement or government agencies if required by law</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or bankruptcy</li>
          </ul>
          <p>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties. Text messaging originator opt-in data is used solely to deliver the messages you requested.</p>

          <h2>6. Data Security</h2>
          <p>We implement industry-standard security measures, including encryption, secure API connections, and access controls, to protect your information. However, no method of transmission over the Internet is 100% secure. We are not liable for unauthorized disclosure due to factors beyond our reasonable control.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data by contacting support@gofieldwise.com.</p>

          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct or update inaccurate information</li>
            <li>Delete your information (subject to legal requirements)</li>
            <li>Opt out of marketing communications</li>
            <li>Data portability (receive your data in a portable format)</li>
          </ul>
          <p>To exercise these rights, contact us at support@gofieldwise.com.</p>

          <h2>9. Cookies & Tracking</h2>
          <p>We use cookies and similar technologies to enhance your browsing experience and analyze site usage. You can control cookie preferences through your browser settings. Disabling cookies may limit certain site functionality.</p>

          <h2>10. Children's Privacy</h2>
          <p>Our services are intended for business owners and operators, not children under 18. We do not knowingly collect information from children under 18. If we become aware of such collection, we will take steps to delete the information promptly.</p>

          <h2>11. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our privacy practices, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> support@gofieldwise.com</li>
            <li><strong>Phone:</strong> (855) 247-6985</li>
            <li><strong>Mailing Address:</strong> GoFieldWise, PO Box [TBD], [City, State ZIP]</li>
          </ul>

          <h2>12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or a prominent notice on the Site. Your continued use of the Site constitutes acceptance of the updated policy.</p>
        </section>
      </main>

      <Footer />
    </>
  );
}
