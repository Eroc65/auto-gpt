import Head from 'next/head';
export default function SEOHead({
  title = 'GoFieldWise | Local SEO & Websites for Oklahoma Trades',
  description = 'GoFieldWise helps HVAC, plumbing, electrical & cleaning companies in Oklahoma rank #1 on Google without paid ads.',
  canonical, schema,
}) {
  const baseUrl = 'https://gofieldwise.com';
  const url = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const defaultSchema = {
    '@context':'https://schema.org','@type':'LocalBusiness',
    name:'GoFieldWise',url:'https://gofieldwise.com',email:'biz@gofieldwise.com',
    areaServed:{'@type':'State',name:'Oklahoma'},
    serviceType:['Local SEO','Website Design','Google Business Profile Optimization'],
  };
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema||defaultSchema)}} />
    </Head>
  );
}