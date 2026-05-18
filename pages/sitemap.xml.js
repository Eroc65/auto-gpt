// ============================================================
// FILE: pages/sitemap.xml.js
// URL:  gofieldwise.com/sitemap.xml  (auto-generated, updates when you add pages)
// ============================================================

const SITE_URL = 'https://gofieldwise.com';

const PAGES = [
  { path: '/',                  priority: '1.0', changefreq: 'weekly'  },
  { path: '/hvac-seo',          priority: '0.9', changefreq: 'monthly' },
  { path: '/plumbing-seo',      priority: '0.9', changefreq: 'monthly' },
  { path: '/electrician-seo',   priority: '0.9', changefreq: 'monthly' },
  { path: '/cleaning-seo',      priority: '0.9', changefreq: 'monthly' },
  { path: '/website-design',    priority: '0.9', changefreq: 'monthly' },
  { path: '/demo',              priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing',           priority: '0.8', changefreq: 'monthly' },
  { path: '/connect',           priority: '0.7', changefreq: 'monthly' },
  { path: '/help',              priority: '0.6', changefreq: 'monthly' },
];

function generateSitemap(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(generateSitemap(PAGES));
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }


// ============================================================
// FILE: public/robots.txt
// Just create this file at public/robots.txt with this content:
// ============================================================

/*
User-agent: *
Allow: /

Sitemap: https://gofieldwise.com/sitemap.xml
*/
