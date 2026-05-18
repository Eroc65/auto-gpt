import Head from 'next/head';
import Link from 'next/link';
export default function CleaningSeo() {
  return (<>
    <Head>
      <title>Cleaning Company SEO Oklahoma | Get More Clients | GoFieldWise</title>
      <meta name="description" content="Rank higher on Google for house cleaning near me in Oklahoma. GoFieldWise helps cleaning companies get steady organic inquiries without ad spend." />
      <link rel="canonical" href="https://gofieldwise.com/cleaning-seo" />
    </Head>
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'60px 24px'}}>
      <nav style={{marginBottom:'24px',fontSize:'14px',color:'#666'}}><Link href="/">GoFieldWise</Link> &rsaquo; Cleaning Company SEO Oklahoma</nav>
      <h1 style={{fontSize:'2.25rem',fontWeight:'800',lineHeight:1.2,marginBottom:'16px'}}>Local SEO for Oklahoma Cleaning Companies — More Clients From Google</h1>
      <p style={{fontSize:'1.125rem',lineHeight:1.7,color:'#444',marginBottom:'32px'}}>People searching &ldquo;house cleaning near me&rdquo; are ready to book. GoFieldWise makes sure your cleaning company is who they find.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'32px'}}>
        {['house cleaning Tulsa','maid service Oklahoma City','cleaning company near me','deep cleaning Broken Arrow','move out cleaning Oklahoma','office cleaning Edmond'].map((kw,i)=>(
          <span key={i} style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'20px',padding:'4px 12px',fontSize:'13px'}}>{kw}</span>
        ))}
      </div>
      <div style={{background:'#1B5E20',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontSize:'1.75rem',fontWeight:'800',marginBottom:'12px'}}>Free Cleaning Company SEO Audit</h2>
        <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'24px'}}>We show you which searches clients use and why they are finding your competitors.</p>
        <a href="mailto:biz@gofieldwise.com?subject=Free Cleaning SEO Audit" style={{display:'inline-block',background:'#fff',color:'#1B5E20',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',textDecoration:'none'}}>Get your free audit &rarr;</a>
      </div>
    </main>
  </>);
}