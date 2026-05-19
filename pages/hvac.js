import Head from 'next/head';

export default function HvacPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GoFieldWise AI Receptionist for HVAC",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "200", "priceCurrency": "USD" },
    "description": "AI answering service built for HVAC companies. Answers calls 24/7, books service appointments, and follows up automatically."
  };
  return (
    <>
      <Head>
        <title>AI Answering Service for HVAC Companies | GoFieldWise — $200/mo</title>
        <meta name="description" content="GoFieldWise answers every HVAC call 24/7, captures job details, and books appointments automatically. No missed calls. No after-hours voicemail. $200/month flat." />
        <link rel="canonical" href="https://gofieldwise.com/hvac" />
        <meta property="og:title" content="AI Answering Service for HVAC Companies | GoFieldWise" />
        <meta property="og:url" content="https://gofieldwise.com/hvac" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          <a href="/" style={{ color: '#888' }}>GoFieldWise</a> &rsaquo; HVAC
        </nav>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', lineHeight: 1.15, marginBottom: '16px', color: '#0a1628' }}>
          AI Answering Service for HVAC Companies
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
          When your tech is under a house and a new customer calls, GoFieldWise answers. It qualifies the lead,
          captures job details, and books the appointment — automatically, 24/7.
        </p>
        <div style={{ background: '#f0f7ff', border: '1px solid #bdd6f7', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontWeight: '700', marginBottom: '12px', color: '#0a1628' }}>What GoFieldWise does for HVAC companies:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: 2.2, color: '#333' }}>
            <li>Answers every call instantly — no voicemail, no hold music</li>
            <li>Qualifies AC repair, furnace, install, and maintenance calls</li>
            <li>Captures address, system type, urgency, and preferred time</li>
            <li>Books directly into your calendar or dispatches to your CRM</li>
            <li>Sends confirmation texts to customers automatically</li>
            <li>Follows up on missed quotes and incomplete bookings</li>
          </ul>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { stat: '< 3 sec', label: 'Average answer time' },
            { stat: '24/7', label: 'Coverage including weekends' },
            { stat: '$200/mo', label: 'Flat pricing, no per-call fees' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ff6a00', margin: '0 0 4px' }}>{item.stat}</p>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#0a1628', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>Stop losing HVAC jobs to voicemail</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '15px' }}>
            Homeowners call whoever answers first. GoFieldWise makes sure that&apos;s you — every time.
          </p>
          <a href="/demo" style={{ display: 'inline-block', background: '#ff6a00', color: '#fff', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
            Try live demo →
          </a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>No contract. Cancel anytime.</p>
        </div>
        <div style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[{l:'Plumbing',h:'/plumbing'},{l:'Electrical',h:'/electrical'},{l:'Roofing',h:'/roofing'},{l:'Cleaning',h:'/cleaning'},{l:'See Pricing',h:'/pricing'}]
            .map((x,i)=><a key={i} href={x.h} style={{color:'#2563eb',fontSize:'14px',textDecoration:'underline'}}>{x.l}</a>)}
        </div>
      </main>
    </>
  );
}
