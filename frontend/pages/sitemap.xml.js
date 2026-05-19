const SITE = 'https://gofieldwise.com';
const URLS = [
  { path: '/',           priority: '1.0', freq: 'weekly'  },
  { path: '/hvac',       priority: '0.9', freq: 'monthly' },
  { path: '/plumbing',   priority: '0.9', freq: 'monthly' },
  { path: '/electrical', priority: '0.9', freq: 'monthly' },
  { path: '/roofing',    priority: '0.9', freq: 'monthly' },
  { path: '/cleaning',   priority: '0.9', freq: 'monthly' },
  { path: '/pricing',    priority: '0.8', freq: 'monthly' },
  { path: '/demo',       priority: '0.8', freq: 'monthly' },
  { path: '/connect',    priority: '0.7', freq: 'monthly' },
];
function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`  <url>
    <loc>${SITE}${u.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}
export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap(URLS));
  res.end();
  return { props: {} };
}
export default function Sitemap() { return null; }
