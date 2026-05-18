// ============================================================
// FILE: pages/electrician-seo.js
// URL:  gofieldwise.com/electrician-seo
// ============================================================

import Head from 'next/head';
import Link from 'next/link';

export default function ElectricianSeo() {
  return (
    <>
      <Head>
        <title>Electrician SEO Oklahoma | Google Page 1 Rankings | GoFieldWise</title>
        <meta name="description" content="GoFieldWise helps Oklahoma electricians rank for electrician near me and panel upgrade searches organically. See your ranking opportunities free." />
        <link rel="canonical" href="https://gofieldwise.com/electrician-seo" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Service',
          name: 'Electrician SEO Services Oklahoma',
          provider: { '@type': 'LocalBusiness', name: 'GoFieldWise', url: 'https://gofieldwise.com' },
          areaServed: { '@type': 'State', name: 'Oklahoma' },
        })}} />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
          <Link href="/">GoFieldWise</Link> &rsaquo; Electrician SEO Oklahoma
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px' }}>
          Electrician SEO Services Oklahoma — Get Found on Google Without Ads
        </h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#444', marginBottom: '32px' }}>
          Panel upgrades, EV charger installs, whole-home rewiring — these are high-value jobs that start with a Google search.
          GoFieldWise puts your electrical company in front of Oklahoma homeowners when they&apos;re ready to hire.
        </p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Target keywords for Oklahoma electricians</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {['electrician near me Oklahoma', 'panel upgrade Tulsa', 'EV charger installation OKC',
            'electrician Broken Arrow', 'whole home rewiring Oklahoma', 'electrical repair Edmond',
            'licensed electrician Oklahoma City', 'generator installation Tulsa'].map((kw, i) => (
            <span key={i} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>{kw}</span>
          ))}
        </div>
        <div style={{ background: '#111827', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Free Electrician SEO Audit</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px' }}>See exactly which panel upgrade and EV charger searches your competitors are winning.</p>
          <a href="mailto:support@gofieldwise.com?subject=Free Electrician SEO Audit"
            style={{ display: 'inline-block', background: '#F5C518', color: '#111827', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Get your free audit →
          </a>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[{ label: 'HVAC SEO', href: '/hvac-seo' }, { label: 'Plumbing SEO', href: '/plumbing-seo' },
            { label: 'Cleaning SEO', href: '/cleaning-seo' }, { label: 'Contractor Websites', href: '/website-design' }]
            .map((l, i) => <Link key={i} href={l.href} style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}>{l.label}</Link>)}
        </div>
      </main>
    </>
  );
}
