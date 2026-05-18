/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/cleaning-services', destination: '/api/gone' },
      { source: '/cleaning-services/:path*', destination: '/api/gone' },
      { source: '/dispatch-assistant', destination: '/api/gone' },
      { source: '/dispatch-assistant/:path*', destination: '/api/gone' },
      { source: '/electrical', destination: '/api/gone' },
      { source: '/electrical/:path*', destination: '/api/gone' },
      { source: '/growth', destination: '/api/gone' },
      { source: '/growth/:path*', destination: '/api/gone' },
      { source: '/hvac', destination: '/api/gone' },
      { source: '/hvac/:path*', destination: '/api/gone' },
      { source: '/landscaping', destination: '/api/gone' },
      { source: '/landscaping/:path*', destination: '/api/gone' },
      { source: '/leadlaunch', destination: '/api/gone' },
      { source: '/leadlaunch/:path*', destination: '/api/gone' },
      { source: '/leads', destination: '/api/gone' },
      { source: '/leads/:path*', destination: '/api/gone' },
      { source: '/marketing-ai', destination: '/api/gone' },
      { source: '/marketing-ai/:path*', destination: '/api/gone' },
      { source: '/metrics', destination: '/api/gone' },
      { source: '/metrics/:path*', destination: '/api/gone' },
      { source: '/platform', destination: '/api/gone' },
      { source: '/platform/:path*', destination: '/api/gone' },
      { source: '/plumbing', destination: '/api/gone' },
      { source: '/plumbing/:path*', destination: '/api/gone' },
      { source: '/status', destination: '/api/gone' },
      { source: '/status/:path*', destination: '/api/gone' },
      { source: '/admin/leads', destination: 'https://fieldwise-duhl.polsia.app/admin/leads' },
      { source: '/admin/outreach', destination: 'https://fieldwise-duhl.polsia.app/admin/outreach' },
      { source: '/admin/telephony', destination: 'https://fieldwise-duhl.polsia.app/admin/telephony' },
      { source: '/admin/sms-compliance', destination: 'https://fieldwise-duhl.polsia.app/admin/sms-compliance' },
      { source: '/admin/ads', destination: 'https://fieldwise-duhl.polsia.app/admin/ads' },
      { source: '/admin/health', destination: 'https://fieldwise-duhl.polsia.app/admin/health' },
      { source: '/admin/settings', destination: 'https://fieldwise-duhl.polsia.app/admin/settings' },
      { source: '/admin/billing', destination: 'https://fieldwise-duhl.polsia.app/admin/billing' },
      { source: '/admin/tenant-config', destination: 'https://fieldwise-duhl.polsia.app/admin/tenant-config' }
    ];
  },
  async redirects() {
    return [
      { source: '/help-center', destination: '/support', permanent: true },
      { source: '/help/articles', destination: '/support', permanent: true },
      { source: '/help/articles/:slug*', destination: '/support', permanent: true }
    ];
  }
};

module.exports = nextConfig;
