// pages/plumbing-seo.js
// Save into your pages/ folder → gofieldwise.com/plumbing-seo

import Head from 'next/head';
import Link from 'next/link';

export default function PlumbingSeo() {
  return (
    <>
      <Head>
        <title>Plumbing SEO Oklahoma | Get More Calls From Google | GoFieldWise</title>
        <meta name="description" content="We get Oklahoma plumbers to page 1 for emergency plumber near me and drain cleaning searches — without running ads. Free audit shows exactly what's holding you back." />
        <link rel="canonical" href="https://gofieldwise.com/plumbing-seo" />
        <meta property="og:title" content="Plumbing SEO Oklahoma | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/plumbing-seo" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Service',
          name: 'Plumbing SEO Services Oklahoma',
          provider: { '@type': 'LocalBusiness', name: 'GoFieldWise', url: 'https://gofieldwise.com' },
          areaServed: { '@type': 'State', name: 'Oklahoma' },
          description: 'Local SEO for Oklahoma plumbers. Rank for emergency plumber near me and drain cleaning searches without ads.',
        })}} />
      </Head>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
          <Link href="/">GoFieldWise</Link> &rsaquo; Plumbing SEO Oklahoma
        </nav>

        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px' }}>
          Plumbing SEO Services Oklahoma — Page 1 Rankings Without Paid Ads
        </h1>

        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#444', marginBottom: '32px' }}>
          When a pipe bursts at 2am, homeowners call whoever shows up first on Google. GoFieldWise makes sure
          that&apos;s your plumbing company — in Tulsa, Oklahoma City, Broken Arrow, and across Oklahoma.
        </p>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
          <p style={{ fontWeight: '600', margin: '0 0 8px' }}>Why Oklahoma plumbers lose calls online:</p>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 2 }}>
            <li>No page targeting &ldquo;emergency plumber [city]&rdquo; — the highest-intent search in plumbing</li>
            <li>Google Maps listing missing service areas and key services like slab leak repair</li>
            <li>Under 20 Google reviews — below the trust threshold most homeowners need</li>
            <li>Competitor pages ranking because they have city-specific landing pages</li>
          </ul>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Keywords we target for Oklahoma plumbers</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
          {['emergency plumber Tulsa', 'drain cleaning Oklahoma City', 'water heater repair near me',
            'slab leak detection Oklahoma', 'plumber Broken Arrow', 'clogged drain Edmond',
            'pipe repair Norman OK', 'tankless water heater installation Tulsa'].map((kw, i) => (
            <span key={i} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>{kw}</span>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>What GoFieldWise does for your plumbing business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { title: 'Emergency keyword pages', desc: 'Dedicated pages for emergency plumber, burst pipe, and after-hours searches.' },
            { title: 'Maps optimization', desc: 'Complete GBP with all services, weekly posts, and review generation strategy.' },
            { title: 'Service area pages', desc: 'City-specific pages for Tulsa, OKC, Broken Arrow, Norman, and more.' },
            { title: 'Review generation', desc: 'System to get 2-4 new Google reviews per week from happy customers.' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontWeight: '700', margin: '0 0 6px' }}>{item.title}</p>
              <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#083344', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Free Plumbing SEO Audit</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px' }}>
            We&apos;ll show you exactly why your competitors are getting calls you should be getting.
          </p>
          <a href="mailto:support@gofieldwise.com?subject=Free Plumbing SEO Audit"
            style={{ display: 'inline-block', background: '#D4A017', color: '#083344', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Get your free audit →
          </a>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[{ label: 'HVAC SEO', href: '/hvac-seo' }, { label: 'Electrician SEO', href: '/electrician-seo' },
            { label: 'Cleaning SEO', href: '/cleaning-seo' }, { label: 'Contractor Websites', href: '/website-design' }]
            .map((l, i) => <Link key={i} href={l.href} style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}>{l.label}</Link>)}
        </div>
      </main>
    </>
  );
}
