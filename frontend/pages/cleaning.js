import Head from 'next/head';

export default function CleaningPage() {
  return (
    <>
      <Head>
        <title>AI Answering Service for Cleaning Companies | GoFieldWise — $200/mo</title>
        <meta name="description" content="GoFieldWise answers every cleaning inquiry, qualifies the job, and books the appointment automatically. Residential, commercial, move-out — handled 24/7." />
        <link rel="canonical" href="https://gofieldwise.com/cleaning" />
        <meta property="og:title" content="AI Answering Service for Cleaning Companies | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/cleaning" />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#888' }}>GoFieldWise</a> &rsaquo; Cleaning
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px', color: '#1B5E20' }}>
          AI Answering Service for Cleaning Companies
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
          People searching for a cleaning service want to book fast. If they call and hit voicemail,
          they move on. GoFieldWise answers instantly, qualifies the job, and gets them booked.
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontWeight: '700', marginBottom: '12px', color: '#1B5E20' }}>GoFieldWise for cleaning businesses:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2.2, color: '#333' }}>
            <li>Answers inquiry calls and texts — including nights and weekends</li>
            <li>Qualifies home size, service type, frequency, and preferred schedule</li>
            <li>Books standard, deep clean, and move-out appointments automatically</li>
            <li>Sends confirmation and reminder texts to reduce no-shows</li>
            <li>Follows up on quotes that didn&apos;t convert</li>
          </ul>
        </div>
        <div style={{ background: '#1B5E20', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Turn every inquiry into a booked appointment</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>GoFieldWise works while you clean — answering, qualifying, and booking on autopilot.</p>
          <a href="/demo" style={{ display: 'inline-block', background: '#fff', color: '#1B5E20', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            Try the demo →
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>$200/month. No contracts.</p>
        </div>
      </main>
    </>
  );
}
