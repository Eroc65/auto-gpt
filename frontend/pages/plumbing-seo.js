import Head from 'next/head';
import Link from 'next/link';
export default function PlumbingSeo() {
  return (<>
    <Head>
      <title>Plumbing SEO Oklahoma | Get More Calls From Google | GoFieldWise</title>
      <meta name="description" content="We get Oklahoma plumbers to page 1 for emergency plumber near me and drain cleaning searches without ads. Free audit." />
      <link rel="canonical" href="https://gofieldwise.com/plumbing-seo" />
    </Head>
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'60px 24px'}}>
      <nav style={{marginBottom:'24px',fontSize:'14px',color:'#666'}}><Link href="/">GoFieldWise</Link> &rsaquo; Plumbing SEO Oklahoma</nav>
      <h1 style={{fontSize:'2.25rem',fontWeight:'800',lineHeight:1.2,marginBottom:'16px'}}>Plumbing SEO Services Oklahoma - Page 1 Rankings Without Paid Ads</h1>
      <p style={{fontSize:'1.125rem',lineHeight:1.7,color:'#444',marginBottom:'32px'}}>When a pipe bursts at 2am, homeowners call whoever shows up first on Google. GoFieldWise makes sure that&apos;s your plumbing company.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'40px'}}>
        {['emergency plumber Tulsa','drain cleaning Oklahoma City','water heater repair near me','slab leak Oklahoma','plumber Broken Arrow','clogged drain Edmond'].map((kw,i)=>(
          <span key={i} style={{background:'#f3f4f6',border:'1px solid #d1d5db',borderRadius:'20px',padding:'4px 12px',fontSize:'13px'}}>{kw}</span>
        ))}
      </div>
      <div style={{background:'#083344',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontSize:'1.75rem',fontWeight:'800',marginBottom:'12px'}}>Free Plumbing SEO Audit</h2>
        <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'24px'}}>We show you exactly why competitors get calls you should be getting.</p>
        <a href="mailto:biz@gofieldwise.com?subject=Free Plumbing SEO Audit" style={{display:'inline-block',background:'#D4A017',color:'#083344',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',textDecoration:'none'}}>Get your free audit &rarr;</a>
      </div>
    </main>
  </>);
}