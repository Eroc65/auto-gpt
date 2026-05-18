// pages/hvac-seo.js
// Save this file as-is into your pages/ folder
// URL will be: gofieldwise.com/hvac-seo

import Head from 'next/head';
import Link from 'next/link';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'HVAC SEO Services Oklahoma',
  provider: {
    '@type': 'LocalBusiness',
    name: 'GoFieldWise',
    url: 'https://gofieldwise.com',
  },
  areaServed: { '@type': 'State', name: 'Oklahoma' },
  description: 'Local SEO services that get Oklahoma HVAC companies to page 1 of Google for AC repair, furnace repair, and HVAC service near me searches.',
};

export default function HvacSeo() {
  return (
    <>
      <Head>
        <title>HVAC SEO Services Oklahoma | Rank #1 on Google | GoFieldWise</title>
        <meta
          name="description"
          content="GoFieldWise gets Oklahoma HVAC companies to page 1 of Google for AC repair near me and HVAC service searches — no ad spend. Free website audit included."
        />
        <link rel="canonical" href="https://gofieldwise.com/hvac-seo" />
        <meta property="og:title" content="HVAC SEO Services Oklahoma | GoFieldWise" />
        <meta property="og:description" content="Get your HVAC company to page 1 of Google in Oklahoma. No ads. Free audit." />
        <meta property="og:url" content="https://gofieldwise.com/hvac-seo" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
        <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
          <Link href="/">GoFieldWise</Link> &rsaquo; HVAC SEO Oklahoma
        </nav>

        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '16px' }}>
          HVAC SEO Services in Oklahoma — Get More AC Repair Calls From Google
        </h1>

        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#444', marginBottom: '32px' }}>
          When someone in Tulsa searches &ldquo;AC repair near me&rdquo; or &ldquo;HVAC company Oklahoma City,&rdquo;
          your competitors are showing up on page 1 and you&apos;re not. GoFieldWise fixes that — without running ads.
        </p>

        <div style={{ background: '#f0f7ff', border: '1px solid #bdd6f7', borderRadius: '12px', padding: '24px', marginBottom: '40px' }}>
          <p style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 8px' }}>
            What we typically find on HVAC sites in Oklahoma:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 2 }}>
            <li>Title tag doesn&apos;t include the city name — Google doesn&apos;t know where you serve</li>
            <li>No dedicated page for each service (AC repair, furnace repair, maintenance plans)</li>
            <li>Google Business Profile incomplete — missing photos, services, and weekly posts</li>
            <li>30–60% of pages not indexed by Google</li>
          </ul>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>
          What GoFieldWise does for HVAC companies in Oklahoma
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { title: 'Keyword research', desc: 'We find the exact searches your customers use and map them to your pages.' },
            { title: 'On-page optimization', desc: 'Title tags, H1s, meta descriptions, and content rewritten with local keywords.' },
            { title: 'Google Business Profile', desc: 'Complete setup, weekly posts, photo strategy, and review generation.' },
            { title: 'Local citations', desc: 'Get listed on Angi, Yelp, BBB, and 50+ directories with consistent NAP.' },
            { title: 'Content creation', desc: 'Monthly blog posts targeting high-intent HVAC keywords in your service area.' },
            { title: 'Monthly reporting', desc: 'Plain-English report showing your ranking improvements every month.' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontWeight: '700', marginBottom: '6px', margin: '0 0 6px' }}>{item.title}</p>
              <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>
          HVAC keywords we target for Oklahoma companies
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
          {[
            'AC repair Tulsa', 'HVAC service Oklahoma City', 'furnace repair near me',
            'air conditioning company Broken Arrow', 'HVAC maintenance Oklahoma',
            'emergency AC repair', 'heat pump installation Tulsa', 'HVAC company Edmond',
          ].map((kw, i) => (
            <span key={i} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '20px', padding: '4px 12px', fontSize: '13px' }}>
              {kw}
            </span>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>
          How fast will I see results?
        </h2>
        <p style={{ lineHeight: 1.7, color: '#444', marginBottom: '40px' }}>
          Most Oklahoma HVAC companies we work with see measurable ranking improvements within 30–60 days.
          Page 1 results typically follow within 60–90 days for local keywords. Results depend on your
          starting position, competition level in your city, and how consistently we can publish new content.
        </p>

        <div style={{ background: '#0f1a2e', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>
            Free HVAC SEO Audit for Oklahoma Companies
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '24px', fontSize: '1rem' }}>
            We&apos;ll check your Google rankings, Maps listing, website, and show you exactly what&apos;s holding you back.
            No cost. No commitment.
          </p>
          <a
            href="mailto:support@gofieldwise.com?subject=Free HVAC SEO Audit"
            style={{ display: 'inline-block', background: '#FF6B35', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '1rem' }}
          >
            Get your free audit →
          </a>
        </div>

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontWeight: '600', marginBottom: '12px' }}>Also serving:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { label: 'Plumbing SEO', href: '/plumbing-seo' },
              { label: 'Electrician SEO', href: '/electrician-seo' },
              { label: 'Cleaning Company SEO', href: '/cleaning-seo' },
              { label: 'Contractor Websites', href: '/website-design' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '14px' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
