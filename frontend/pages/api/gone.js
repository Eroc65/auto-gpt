export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(410).send('Gone');
}
