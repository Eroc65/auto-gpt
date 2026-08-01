import { getAllPosts } from "../lib/posts";

const SITE = 'https://gofieldwise.com';
const URLS = [
  { path: '/',                priority: '1.0', freq: 'weekly'  },
  { path: '/hvac',            priority: '0.9', freq: 'monthly' },
  { path: '/plumbing',        priority: '0.9', freq: 'monthly' },
  { path: '/electrical',      priority: '0.9', freq: 'monthly' },
  { path: '/roofing',         priority: '0.9', freq: 'monthly' },
  { path: '/cleaning',        priority: '0.9', freq: 'monthly' },
  { path: '/hvac-seo',        priority: '0.9', freq: 'monthly' },
  { path: '/plumbing-seo',    priority: '0.9', freq: 'monthly' },
  { path: '/electrician-seo', priority: '0.9', freq: 'monthly' },
  { path: '/cleaning-seo',    priority: '0.9', freq: 'monthly' },
  { path: '/website-design',  priority: '0.9', freq: 'monthly' },
  { path: '/pricing',         priority: '0.8', freq: 'monthly' },
  { path: '/demo',            priority: '0.8', freq: 'monthly' },
  { path: '/support',         priority: '0.7', freq: 'monthly' },
  { path: '/connect',         priority: '0.7', freq: 'monthly' },
  { path: '/free-seo-audit',   priority: '0.7', freq: 'monthly' },
  { path: '/free-rank-checker', priority: '0.7', freq: 'monthly' },
  { path: '/free-gbp-check',   priority: '0.7', freq: 'monthly' },
  { path: '/free-competitor-peek', priority: '0.7', freq: 'monthly' },
  { path: '/field-notes',     priority: '0.7', freq: 'weekly'  },
];

function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`  <url>
    <loc>${SITE}${u.path}</loc>
    <lastmod>${u.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const postUrls = getAllPosts().map(p => ({
    path: `/field-notes/${p.slug}`,
    priority: '0.6',
    freq: 'monthly',
    lastmod: (p.date || '').split('T')[0] || undefined,
  }));
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap([...URLS, ...postUrls]));
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
