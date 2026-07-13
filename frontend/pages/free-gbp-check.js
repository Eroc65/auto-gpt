import Head from "next/head";

import FreeSeoToolPage from "../components/FreeSeoToolPage";

export default function FreeGbpCheckPage() {
  return (
    <>
      <Head>
        <title>Free Google Business Profile Health Check | GoFieldWise Oklahoma SEO</title>
        <meta
          name="description"
          content="Find out if your Google Business Profile is costing you leads. Get a free health check and practical next steps."
        />
        <link rel="canonical" href="https://gofieldwise.com/free-gbp-check" />
      </Head>
      <FreeSeoToolPage
        badge="Free GBP Health Check"
        title="Is your Google Maps listing"
        highlight="losing jobs?"
        subhead="Most local businesses have GBP gaps that suppress visibility. Get a free check in under a minute."
        source="gofieldwise.com/free-gbp-check"
        toolType="free_gbp_check"
        canonical="https://gofieldwise.com/free-gbp-check"
        submitLabel="Check my Google profile"
        ctaDefault={{
          title: "Want us to optimize your GBP?",
          text: "Reply to your report email and we will prioritize the fixes that drive map visibility first.",
          subject: "GBP Check Results - I want profile optimization",
        }}
        extraFields={[
          { key: "city", label: "City", type: "text", placeholder: "Tulsa" },
        ]}
      />
    </>
  );
}
