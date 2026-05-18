import Head from 'next/head';
import Link from 'next/link';
export default function ElectricianSeo() {
  return (<>
    <Head>
      <title>Electrician SEO Oklahoma | Google Page 1 Rankings | GoFieldWise</title>
      <meta name="description" content="GoFieldWise helps Oklahoma electricians rank for electrician near me and panel upgrade searches organically. Free ranking audit." />
      <link rel="canonical" href="https://gofieldwise.com/electrician-seo" />
    </Head>
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'60px 24px'}}>
      <nav style={{marginBottom:'24px',fontSize:'14px',color:'#666'}}><Link href="/">GoFieldWise</Link> &rsaquo; Electrician SEO Oklahoma</nav>
      <h1 style={{fontSize:'2.25rem',fontWeight:'800',lineHeight:1.2,marginBottom:'16px'}}>Electrician SEO Services Oklahoma — Get Found on Google Without Ads</h1>
      <p style={{fontSize:'1.125rem',lineHeight:1.7,color:'#444',marginBottom:'32px'}}>Panel upgrades, EV charger installs, whole-home rewiring — high-value jobs that start with a Google search. GoFieldWise puts your electrical company in front of Oklahoma homeowners when they are ready to hire.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'32px'}}>
        {['electrician near me Oklahoma','panel upgrade Tulsa','EV charger OKC','electrician Broken Arrow','whole home rewiring Oklahoma','licensed electrician OKC'].map((kw,i)=>(
          <span key={i} style={{background:'#f3f4f6',border:'1px solid #d1d5db',borderRadius:'20px',padding:'4px 12px',fontSize:'13px'}}>{kw}</span>
        ))}
      </div>
      <div style={{background:'#111827',borderRadius:'12px',padding:'40px',textAlign:'center',color:'#fff'}}>
        <h2 style={{fontSize:'1.75rem',fontWeight:'800',marginBottom:'12px'}}>Free Electrician SEO Audit</h2>
        <p style={{color:'rgba(255,255,255,0.75)',marginBottom:'24px'}}>See which searches your competitors are winning right now.</p>
        <a href="mailto:biz@gofieldwise.com?subject=Free Electrician SEO Audit" style={{display:'inline-block',background:'#F5C518',color:'#111827',padding:'14px 32px',borderRadius:'8px',fontWeight:'700',textDecoration:'none'}}>Get your free audit &rarr;</a>
      </div>
    </main>
  </>);
}