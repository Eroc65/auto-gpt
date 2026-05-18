const SITE_URL = 'https://gofieldwise.com';
const PAGES = [
  {path:'/',priority:'1.0',changefreq:'weekly'},
  {path:'/hvac-seo',priority:'0.9',changefreq:'monthly'},
  {path:'/plumbing-seo',priority:'0.9',changefreq:'monthly'},
  {path:'/electrician-seo',priority:'0.9',changefreq:'monthly'},
  {path:'/cleaning-seo',priority:'0.9',changefreq:'monthly'},
  {path:'/website-design',priority:'0.9',changefreq:'monthly'},
  {path:'/demo',priority:'0.8',changefreq:'monthly'},
  {path:'/pricing',priority:'0.8',changefreq:'monthly'},
  {path:'/connect',priority:'0.7',changefreq:'monthly'},
];
function generateSitemap(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p=>`  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}
export async function getServerSideProps({res}) {
  res.setHeader('Content-Type','text/xml');
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate');
  res.write(generateSitemap(PAGES));
  res.end();
  return {props:{}};
}
export default function Sitemap() { return null; }