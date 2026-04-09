const { test, expect } = require("@playwright/test");

test("leadlaunch intake form submits and shows confirmation", async ({ page }) => {
  await page.route("**/api/leads/intake/by-key/**", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        id: 901,
        name: "Alex Owner",
        phone: "(555) 010-2024",
        email: "owner@example.com",
        source: "web_form",
        status: "new",
        raw_message: "City: Dallas, TX",
        notes: null,
        priority_score: null,
        qualified_at: null,
        organization_id: 11,
        customer_id: null,
        job_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  });

  await page.goto("/leadlaunch");

  await page.getByLabel("Full Name").fill("Alex Owner");
  await page.getByLabel("Phone").fill("(555) 010-2024");
  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Company").fill("Precision Plumbing");
  await page.getByLabel("City / Service Area").fill("Dallas, TX");
  await page.getByLabel("Trade").selectOption("Plumbing");
  await page.getByLabel("Monthly Lead Volume").fill("90");
  await page.getByLabel("Notes").fill("Need faster response after hours.");

  await page.getByRole("button", { name: "Send My Rollout Plan Request" }).click();

  await expect(page.getByText("LeadLaunch request received. We will contact you with a rollout plan shortly.")).toBeVisible();
});
