import TradePage from "../components/TradePage";

export default function CleaningSeo() {
  return (
    <TradePage
      title="Cleaning Company SEO Oklahoma | Get More Clients | GoFieldWise"
      description="Rank higher on Google for house cleaning near me in Oklahoma. GoFieldWise helps cleaning companies get steady organic inquiries without ad spend."
      canonical="https://gofieldwise.com/cleaning-seo"
      ogTitle="Cleaning Company SEO Oklahoma | GoFieldWise"
      breadcrumb="Cleaning Company SEO Oklahoma"
      ogImage="/images/og/gofieldwise-og-cleaning-seo.webp"
      eyebrow="Local SEO for Cleaners"
      h1="Local SEO for Oklahoma Cleaning Companies — More Clients From Google"
      intro="People searching “house cleaning near me” are ready to book. GoFieldWise makes sure your cleaning company is who they find."
      chips={["house cleaning Tulsa", "maid service Oklahoma City", "cleaning company near me", "deep cleaning Broken Arrow", "move out cleaning Oklahoma", "office cleaning Edmond"]}
      cta={{
        title: "Free Cleaning Company SEO Audit",
        text: "We show you which searches clients use and why they're finding your competitors.",
        href: "mailto:biz@gofieldwise.com?subject=Free Cleaning SEO Audit",
        label: "Get your free audit →",
      }}
      related={[
        { label: "HVAC SEO", href: "/hvac-seo" },
        { label: "Plumbing SEO", href: "/plumbing-seo" },
        { label: "Electrician SEO", href: "/electrician-seo" },
        { label: "Contractor Websites", href: "/website-design" },
      ]}
    />
  );
}
