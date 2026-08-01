import Head from "next/head";
import Link from "next/link";
import Footer from "../components/Footer";

export async function getServerSideProps() {
  return { props: {} };
}

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | GoFieldWise</title>
        <meta name="description" content="GoFieldWise Terms & Conditions - our service agreement and policies." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gofieldwise.com/terms" />
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
          <h1>Terms & Conditions</h1>
          <p className="last-updated">Last updated: July 15, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using GoFieldWise ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use our Service. We reserve the right to modify these terms at any time. Changes become effective upon posting to the Site.</p>

          <h2>2. Service Description</h2>
          <p>GoFieldWise provides an AI-powered receptionist and business management platform for home service businesses, including call handling, job booking, customer messaging, and invoicing. The Service is provided "as-is" and "as available."</p>

          <h2>3. User Eligibility</h2>
          <p>You represent and warrant that:</p>
          <ul>
            <li>You are at least 18 years old and legally able to enter into binding contracts</li>
            <li>You are the owner or authorized representative of a business registered in the United States</li>
            <li>You will use the Service only for lawful business purposes</li>
            <li>You will not use the Service to harass, threaten, or engage in illegal activity</li>
          </ul>

          <h2>4. Account Registration & Security</h2>
          <p>You are responsible for maintaining the confidentiality of your login credentials and are liable for all activities under your account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete registration information</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Maintain password security and change passwords regularly</li>
            <li>Accept all responsibility for activities under your account</li>
          </ul>

          <h2>5. Subscription & Billing</h2>
          <ul>
            <li><strong>Pricing:</strong> Subscription plans are billed monthly at the stated price ($200/month base plan + optional add-ons)</li>
            <li><strong>Automatic Renewal:</strong> Subscriptions renew automatically on your billing date unless canceled</li>
            <li><strong>Payment Method:</strong> You authorize us to charge your payment method on file</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription anytime. No refunds will be issued for unused portions of the billing period</li>
            <li><strong>Late Payment:</strong> Accounts with past-due balances may be suspended or terminated</li>
          </ul>

          <h2>6. Acceptable Use Policy</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service to send spam, phishing, or malicious communications</li>
            <li>Attempt to disrupt, hack, or compromise the Service's security</li>
            <li>Reverse engineer, decompile, or attempt to derive source code</li>
            <li>Violate any local, state, or federal laws</li>
            <li>Infringe on third-party intellectual property or privacy rights</li>
            <li>Use the Service for automated lead scraping or data harvesting</li>
            <li>Engage in fraudulent or deceptive practices</li>
            <li>Disclose confidential client information inappropriately</li>
          </ul>

          <h2>7. Intellectual Property Rights</h2>
          <p>GoFieldWise retains all rights to the Service, including software, design, content, and documentation. You retain ownership of your business data and customer information. By using the Service, you grant us a limited license to use your data to provide and improve the Service.</p>

          <h2>8. Data Handling & Privacy</h2>
          <p>Your use of the Service is governed by our Privacy Policy. By providing customer data, you represent that you have obtained necessary consents and comply with all applicable privacy laws, including TCPA (Telephone Consumer Protection Act), GDPR, and local regulations.</p>

          <h2>9. Call Recording & Compliance</h2>
          <p>You acknowledge that:</p>
          <ul>
            <li>You are responsible for obtaining proper consent before recording calls, as required by applicable law</li>
            <li>Twilio (our call tracking provider) may log call metadata and details</li>
            <li>You must comply with all telecommunications regulations and disclosure requirements in your jurisdiction</li>
            <li>We are not liable for non-compliance with recording consent laws</li>
          </ul>

          <h2>10. Service Availability & Uptime</h2>
          <p>While we strive for high availability, we make no guarantee of 99.9% uptime or uninterrupted service. We are not liable for:</p>
          <ul>
            <li>Service interruptions due to maintenance, updates, or security patches</li>
            <li>Lost calls, messages, or data due to technical failures beyond our reasonable control</li>
            <li>Third-party service failures (e.g., Twilio, payment processors)</li>
          </ul>

          <h2>11. Limitation of Liability</h2>
          <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
          <ul>
            <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
            <li>Our total liability for any claim shall not exceed the amount you paid in the 12 months preceding the claim</li>
            <li>We are not responsible for lost revenue, lost business opportunity, or loss of customers</li>
          </ul>

          <h2>12. Warranty Disclaimer</h2>
          <p>THE SERVICE IS PROVIDED "AS-IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

          <h2>13. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless GoFieldWise, its employees, and partners from any claims, damages, losses, and expenses (including attorney fees) arising from:</p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your infringement of third-party rights</li>
            <li>Inaccurate or misleading customer communications</li>
          </ul>

          <h2>14. Termination</h2>
          <p>We may suspend or terminate your account if:</p>
          <ul>
            <li>You violate these Terms</li>
            <li>Your payment is overdue</li>
            <li>We detect fraudulent activity or security breaches</li>
            <li>Required by law enforcement</li>
          </ul>
          <p>Upon termination, your access to the Service ceases, though you may request export of your data for 30 days.</p>

          <h2>15. Dispute Resolution</h2>
          <p>Any disputes shall be governed by the laws of the State of Oklahoma. You agree to resolve disputes through binding arbitration or small claims court rather than litigation, except for injunctive relief or enforcement of intellectual property rights.</p>

          <h2>16. SMS Terms</h2>
          <p>By opting into SMS communications:</p>
          <ul>
            <li>You consent to receive SMS messages at your provided number</li>
            <li>Standard message and data rates apply</li>
            <li>You can opt out anytime by replying STOP or updating account settings</li>
            <li>We use Twilio to send SMS and comply with TCPA regulations</li>
          </ul>

          <h2>17. Severability</h2>
          <p>If any provision of these Terms is found invalid, the remaining provisions continue in full effect.</p>

          <h2>18. Contact Information</h2>
          <p>For questions about these Terms & Conditions:</p>
          <ul>
            <li><strong>Email:</strong> support@gofieldwise.com</li>
            <li><strong>Phone:</strong> (855) 247-6985</li>
          </ul>

          <h2>19. Entire Agreement</h2>
          <p>These Terms & Conditions, along with our Privacy Policy, constitute the entire agreement between you and GoFieldWise regarding the Service and supersede all prior agreements and understandings.</p>
        </section>
      </main>

      <Footer />
    </>
  );
}
