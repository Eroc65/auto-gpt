// ============================================================
// FILE: pages/website-design.js
// URL:  gofieldwise.com/website-design
// ============================================================

import Head from 'next/head';
import Link from 'next/link';

export default function WebsiteDesign() {
  return (
    <>
      <Head>
        <title>Website Design for Contractors Oklahoma | GoFieldWise | From $497</title>
        <meta name="description" content="Professional websites built for HVAC, plumbing, electrical & cleaning companies in Oklahoma. SEO built in from day one. Live in 2 weeks. Starting at $497." />
        <link rel="canonical" href="https://gofieldwise.com/website-design" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Service',
          name: 'Contractor Website Design Oklahoma',
          provider: { '@type': 'LocalBusiness', name: 'GoFieldWise', url: 'https://gofieldwise.com' },
          areaServed: { '@type': 'State', name: 'Oklahoma' },
          offers: { '@type': 'Offer', price: '497', priceCurrency: 'USD', description: 'Starter website + SEO setup' },
        })}} />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
          <Link href="/">GoFieldWise</Link> &rsaquo; Contractor Website Design Oklahoma
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px' }}>
          Contractor Website Design in Oklahoma — Built to Rank on Google From Day One
        </h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#444', marginBottom: '32px' }}>
          Most contractor websites look good but don&apos;t rank. GoFieldWise builds websites for Oklahoma
          trades businesses that are engineered to show up on Google — click-to-call, mobile-first, and
          SEO-ready from the first day they go live.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { price: '$497', label: 'One-time build', desc: 'Site design, copy, SEO setup, and launch' },
            { price: '$197/mo', label: 'SEO retainer', desc: 'Monthly optimization and maintenance' },
            { price: '2 weeks', label: 'Time to live', desc: 'From deposit to your site going live' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 4px', color: '#111' }}>{item.price}</p>
              <p style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '14px' }}>{item.label}</p>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Every GoFieldWise site includes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          {[
            'Custom domain setup', 'Mobile-responsive design', 'Click-to-call button',
            'Optimized title tags & meta', 'Google Analytics connected', 'Google Search Console connected',
            'Google Business Profile linked', 'Fast load time (under 2s)', '"Website by GoFieldWise" branded footer',
            'City & service keywords in copy', 'SSL certificate included', 'Sitemap submitted to Google',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ color: '#16a34a', fontWeight: '700', flexShrink: 0 }}>✓</span> {item}
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Sites we build for Oklahoma trades</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
          {['HVAC companies', 'Plumbers', 'Electricians', 'Cleaning companies', 'Roofers', 'Landscapers', 'Handymen', 'Pest control'].map((t, i) => (
            <span key={i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', padding: '4px 14px', fontSize: '13px', color: '#1d4ed8' }}>{t}</span>
          ))}
        </div>

        <div style={{ background: '#0f1a2e', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Get a free website mockup</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px' }}>
            We&apos;ll build a custom preview with your business name in 24 hours. No cost, no commitment.
            See exactly what your new site will look like before you pay anything.
          </p>
          <a href="mailto:support@gofieldwise.com?subject=Free Website Mockup Request"
            style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Request free mockup →
          </a>
        </div>
      </main>
    </>
  );
}
