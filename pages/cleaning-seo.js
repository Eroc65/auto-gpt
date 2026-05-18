// ============================================================
// FILE: pages/cleaning-seo.js
// URL:  gofieldwise.com/cleaning-seo
// ============================================================

import Head from 'next/head';
import Link from 'next/link';

export default function CleaningSeo() {
  return (
    <>
      <Head>
        <title>Cleaning Company SEO Oklahoma | Get More Clients | GoFieldWise</title>
        <meta name="description" content="Rank higher on Google for house cleaning near me in Oklahoma. GoFieldWise helps cleaning companies get steady organic client inquiries without ad spend." />
        <link rel="canonical" href="https://gofieldwise.com/cleaning-seo" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Service',
          name: 'Cleaning Company SEO Services Oklahoma',
          provider: { '@type': 'LocalBusiness', name: 'GoFieldWise', url: 'https://gofieldwise.com' },
          areaServed: { '@type': 'State', name: 'Oklahoma' },
        })}} />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
          <Link href="/">GoFieldWise</Link> &rsaquo; Cleaning Company SEO Oklahoma
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px' }}>
          Local SEO for Oklahoma Cleaning Companies — More Clients From Google
        </h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#444', marginBottom: '32px' }}>
          People searching &ldquo;house cleaning near me&rdquo; or &ldquo;maid service Tulsa&rdquo; are ready to book.
          GoFieldWise makes sure your cleaning company is who they find — not your competitors.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Keywords we target</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {['house cleaning Tulsa', 'maid service Oklahoma City', 'cleaning company near me',
            'deep cleaning service Broken Arrow', 'move out cleaning Oklahoma', 'office cleaning Edmond',
            'recurring house cleaning Norman', 'eco-friendly cleaning service Tulsa'].map((kw, i) => (
            <span key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>{kw}</span>
          ))}
        </div>
        <div style={{ background: '#1B5E20', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Free Cleaning Company SEO Audit</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px' }}>We&apos;ll show you which searches your ideal clients are using and why they&apos;re finding your competitors.</p>
          <a href="mailto:support@gofieldwise.com?subject=Free Cleaning SEO Audit"
            style={{ display: 'inline-block', background: '#fff', color: '#1B5E20', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Get your free audit →
          </a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[{ label: 'HVAC SEO', href: '/hvac-seo' }, { label: 'Plumbing SEO', href: '/plumbing-seo' },
            { label: 'Electrician SEO', href: '/electrician-seo' }, { label: 'Contractor Websites', href: '/website-design' }]
            .map((l, i) => <Link key={i} href={l.href} style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}>{l.label}</Link>)}
        </div>
      </main>
    </>
  );
}
