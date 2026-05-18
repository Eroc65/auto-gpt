// components/SEOHead.js
// Drop this file into your components/ folder
// Usage: import SEOHead from '../components/SEOHead'
// Then add <SEOHead title="..." description="..." /> to any page

import Head from 'next/head';

export default function SEOHead({
  title = 'GoFieldWise | Local SEO & Websites for Oklahoma Trades',
  description = 'GoFieldWise helps HVAC, plumbing, electrical & cleaning companies in Oklahoma rank #1 on Google, get more calls, and grow without paid ads. Free audit.',
  canonical,
  schema,
}) {
  const baseUrl = 'https://gofieldwise.com';
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;

  // Default LocalBusiness schema for GoFieldWise
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'GoFieldWise',
    description: 'Local SEO and website design for Oklahoma trades businesses',
    url: 'https://gofieldwise.com',
    email: 'support@gofieldwise.com',
    telephone: '+18552476985',
    areaServed: {
      '@type': 'State',
      name: 'Oklahoma',
    },
    serviceType: [
      'Local SEO',
      'Website Design',
      'Google Business Profile Optimization',
      'Content Marketing',
    ],
    knowsAbout: [
      'HVAC SEO',
      'Plumbing SEO',
      'Electrician SEO',
      'Cleaning Company SEO',
      'Roofing SEO',
      'Local SEO Oklahoma',
    ],
  };

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GoFieldWise" />
      <meta property="og:image" content={`${baseUrl}/social/home-og.svg`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema || defaultSchema),
        }}
      />
    </Head>
  );
}
