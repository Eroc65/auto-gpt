import Head from "next/head";

import FreeSeoToolPage from "../components/FreeSeoToolPage";

export default function FreeSeoAuditPage() {
  return (
    <>
      <Head>
        <title>Free SEO Audit for Local Businesses | GoFieldWise Oklahoma SEO</title>
        <meta
          name="description"
          content="Get a free SEO audit for your local service business. See exactly what is holding you back from page 1 of Google."
        />
        <link rel="canonical" href="https://gofieldwise.com/free-seo-audit" />
      </Head>
      <FreeSeoToolPage
        badge="Free SEO Audit"
        title="Find out why you are not on"
        highlight="Page 1"
        subhead="Enter your website and business details. We will scan your SEO and show the top fixes that move rankings."
        source="gofieldwise.com/free-seo-audit"
        toolType="free_seo_audit"
        canonical="https://gofieldwise.com/free-seo-audit"
        submitLabel="Get my free SEO audit"
        ctaDefault={{
          title: "Want us to fix all of this for you?",
          text: "Reply to your report email and we will map the highest-impact fixes first. Email-only follow-up.",
          subject: "SEO Audit Results - I want help",
        }}
        extraFields={[
          { key: "website", label: "Business Website", type: "url", placeholder: "https://yoursite.com" },
        ]}
      />
    </>
  );
}
