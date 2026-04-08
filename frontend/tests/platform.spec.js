const { test, expect } = require("@playwright/test");

test("platform campaign orchestrator flow works", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "test-token", token_type: "bearer" }),
    });
  });

  await page.route("**/api/org/ai-guide", async (route) => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: route.request().postData() || "{}",
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ enabled: true, stage: "onboarding" }),
    });
  });

  await page.route("**/api/help/articles**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: 1, title: "How to Follow Up", context_key: "general" }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 1, title: "How to Follow Up", context_key: "general" }]),
    });
  });

  await page.route("**/api/coaching/snippets**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: 1, trade: "hvac", title: "Reassure And Rebook" }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 1, trade: "hvac", title: "Reassure And Rebook" }]),
    });
  });

  await page.route("**/api/marketing/service-packages", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          code: "growth-core",
          name: "Growth Core",
          monthly_price_usd: 1499,
          summary: "Core demand generation ops.",
          includes: ["Baseline creative ops"],
          checkout_url: null,
        },
        {
          code: "ai_visual_ads_growth",
          name: "AI Visual Ads Growth Service",
          monthly_price_usd: 1299,
          summary: "Sell-ready visual ad production service.",
          includes: ["Image generation", "Video creation", "Performance analytics"],
          checkout_url: "https://gofieldwise.com/contact?service=ai-visual-ads-growth",
        },
      ]),
    });
  });

  await page.route("**/api/marketing/reactivation/run", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ queued_count: 3, candidate_count: 9 }),
    });
  });

  await page.route("**/api/org/comm-profile", async (route) => {
    if (route.request().method() === "PATCH") {
      const payload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ active: false }),
    });
  });

  await page.route("**/api/voice/transcriptions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.route("**/api/marketing/campaigns**", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      const payload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          id: 502,
          name: payload.name,
          kind: payload.kind,
          status: "draft",
          channel: payload.channel,
          template: payload.template || null,
          lookback_days: payload.lookback_days,
          launched_at: null,
          organization_id: 11,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 401,
          name: "Review Push",
          kind: "review_harvester",
          status: "draft",
          channel: "sms",
          template: "Please leave a review",
          lookback_days: 90,
          organization_id: 11,
          launched_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]),
    });
  });

  await page.route("**/api/marketing/campaigns/*/launch", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ campaign_id: 502, status: "launched", generated_recipients: 7 }),
    });
  });

  await page.route("**/api/marketing/expert/operator", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        strategy_summary: "Build a local lead machine with paid + organic intent capture.",
        positioning: "Fast response, transparent pricing, and same-day reliability.",
        offers: [
          {
            title: "Drain Rescue Special",
            audience: "Homeowners with urgent clogs",
            hook: "Dispatch in 60 minutes",
            cta: "Call now",
          },
        ],
        channel_plan: [
          {
            channel: "google_ads",
            objective: "Capture high-intent search demand",
            weekly_budget_usd: 350,
            campaign_structure: ["Emergency", "Water Heater", "General Plumbing"],
          },
        ],
        content_plan: {
          blog_titles: ["What to do before plumber arrives"],
          ad_concepts: ["Before/after drain clean"],
          social_posts: ["Crew in the field same-day"],
        },
        competitor_gaps: ["No after-hours offer on competitor sites"],
        lead_sources: ["Google Search", "Local Service Ads"],
        kpi_targets: ["CPL under $55", "Booking rate above 25%"],
        execution: {
          week_1: ["Launch core search campaigns"],
          week_2: ["A/B test ad hooks"],
          week_3: ["Publish local proof content"],
          week_4: ["Reallocate budget to winners"],
        },
      }),
    });
  });

  await page.goto("/platform");

  await expect(page.getByRole("heading", { name: "Operator Access" })).toBeVisible();
  const accessCard = page.locator("section.dispatch-card", { has: page.getByRole("heading", { name: "Operator Access" }) });

  await accessCard.getByLabel("Email").fill("owner@example.com");
  await accessCard.getByLabel("Password").fill("testpass123");
  await accessCard.getByRole("button", { name: "Login" }).click();

  await page.getByRole("button", { name: "Refresh Platform Data" }).click();
  await expect(page.getByText("Review Push")).toBeVisible();
  await expect(page.getByText("AI Visual Ads Growth Service")).toBeVisible();

  const campaignCard = page.locator("section.dispatch-card", { has: page.getByRole("heading", { name: "Campaign Orchestrator" }) });
  await campaignCard.getByLabel("Campaign Name").fill("Spring Reactivation");
  await campaignCard.getByLabel("Kind").selectOption("reactivation");
  await campaignCard.getByLabel("Channel").selectOption("sms");
  await campaignCard.getByLabel("Lookback Days").fill("120");
  await campaignCard.getByLabel("Template").fill("We can get you on the schedule this week.");
  await campaignCard.getByRole("button", { name: "Create Campaign" }).click();

  await expect(page.getByText("Campaign created: Spring Reactivation")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Spring Reactivation", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Launch Spring Reactivation" }).click();
  await expect(page.getByText("Campaign launched with 7 queued recipients.")).toBeVisible();
  await expect(page.locator("tr", { hasText: "Spring Reactivation" }).getByText("launched")).toBeVisible();

  await page.getByLabel("Business Name").fill("GoFieldwise Plumbing");
  await page.getByLabel("Service Area").fill("Dallas Fort Worth");
  await page.getByRole("button", { name: "Generate Growth Plan" }).click();
  await expect(page.getByText("AI Marketing Expert plan generated.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Strategy Summary" })).toBeVisible();
  await expect(page.getByText("Drain Rescue Special")).toBeVisible();
});
