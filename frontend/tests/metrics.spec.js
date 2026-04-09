const { test, expect } = require("@playwright/test");

test("metrics dashboard flow works", async ({ page }) => {
  const nowIso = new Date().toISOString();
  const queueItems = [
    {
      item_type: "invoice_collection",
      entity_id: 401,
      title: "Collect invoice #401",
      urgency: "critical",
      priority_score: 148,
      revenue_impact: 900,
      due_at: "2026-03-20T10:00:00",
      action: "Call customer and collect payment today.",
    },
    {
      item_type: "job_completion",
      entity_id: 77,
      title: "Close dispatched job #77",
      urgency: "high",
      priority_score: 96,
      revenue_impact: null,
      due_at: "2026-03-31T14:00:00",
      action: "Confirm outcome and mark complete or reschedule.",
    },
  ];
  const archivedItems = {};
  const historyEvents = [];

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "test-token", token_type: "bearer" }),
    });
  });

  await page.route("**/api/reports/lead-conversion**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        timestamp: new Date().toISOString(),
        days: 7,
        totals: {
          intakes: 12,
          qualified: 9,
          booked: 5,
          qualification_rate: 75.0,
          booking_rate: 41.7,
        },
        source_breakdown: {
          web_form: 7,
          missed_call: 4,
          sms: 1,
          manual: 0,
          other: 0,
        },
        intake_route_breakdown: {
          public_intake_org: 6,
          public_intake_key: 2,
          public_missed_call: 4,
          unknown: 0,
        },
        recommended_next_action: "Maintain current process and monitor booked volume for consistency.",
        timeline: [
          {
            date: "2026-04-01",
            intakes: 2,
            qualified: 1,
            booked: 1,
            qualification_rate: 50.0,
            booking_rate: 50.0,
          },
          {
            date: "2026-04-02",
            intakes: 3,
            qualified: 2,
            booked: 1,
            qualification_rate: 66.7,
            booking_rate: 33.3,
          },
        ],
      }),
    });
  });

  await page.route("**/api/reports/operational-dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        timestamp: new Date().toISOString(),
        lead_pipeline: { total: 1 },
        job_status: { total: 1 },
        invoice_summary: {
          unpaid: 3,
          paid: 4,
          void: 0,
          total: 7,
          unpaid_total_amount: 1450.5,
          overdue_count: 2,
        },
        overdue_invoices: {
          due_today: 1,
          "3_days_overdue": 1,
          "7_days_overdue": 0,
          "14_plus_days_overdue": 1,
          total_overdue: 2,
          aging_buckets: {
            current_not_due: { count: 1, amount: 200.0 },
            days_1_7: { count: 1, amount: 150.0 },
            days_8_14: { count: 1, amount: 450.0 },
            days_15_30: { count: 0, amount: 0.0 },
            days_31_plus: { count: 0, amount: 0.0 },
          },
        },
      }),
    });
  });

  await page.route("**/api/reports/operator-queue?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        timestamp: nowIso,
        limit: 5,
        total_candidates: queueItems.length,
        items: queueItems,
      }),
    });
  });

  await page.route("**/api/reports/operator-queue/history?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        timestamp: nowIso,
        limit: 20,
        events: historyEvents,
      }),
    });
  });

  await page.route("**/api/reports/operator-queue/ack", async (route) => {
    const payload = route.request().postDataJSON();
    const itemIndex = queueItems.findIndex(
      (item) => item.item_type === payload.item_type && item.entity_id === payload.entity_id,
    );
    if (itemIndex >= 0) {
      const [removed] = queueItems.splice(itemIndex, 1);
      archivedItems[`${removed.item_type}-${removed.entity_id}`] = removed;
      historyEvents.unshift({
        action: "ack",
        item_type: removed.item_type,
        entity_id: removed.entity_id,
        timestamp: new Date().toISOString(),
      });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        item_type: payload.item_type,
        entity_id: payload.entity_id,
        acknowledged: true,
        already_acknowledged: false,
        acknowledged_at: new Date().toISOString(),
      }),
    });
  });

  await page.route("**/api/reports/operator-queue/unack", async (route) => {
    const payload = route.request().postDataJSON();
    const key = `${payload.item_type}-${payload.entity_id}`;
    const restored = archivedItems[key];
    if (restored) {
      queueItems.unshift(restored);
      delete archivedItems[key];
    }
    historyEvents.unshift({
      action: "unack",
      item_type: payload.item_type,
      entity_id: payload.entity_id,
      timestamp: new Date().toISOString(),
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        organization_id: 11,
        item_type: payload.item_type,
        entity_id: payload.entity_id,
        unacknowledged: true,
        already_unacknowledged: false,
        unacknowledged_at: new Date().toISOString(),
      }),
    });
  });

  await page.goto("/metrics");

  await expect(page.getByRole("heading", { name: "Lead Conversion Dashboard" })).toBeVisible();

  await page.getByLabel("Auth Email").fill("owner@example.com");
  await page.getByLabel("Auth Password").fill("testpass123");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByLabel("Days").fill("7");
  await page.getByRole("button", { name: "Load Metrics" }).click();

  await expect(page.getByRole("heading", { name: "Recommended Next Action" })).toBeVisible();
  await expect(page.getByText("Maintain current process and monitor booked volume for consistency.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Daily Timeline" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Intake Source Mix" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Collections Snapshot" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operator Priority Queue" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Queue History" })).toBeVisible();
  await expect(page.getByText("Intakes").first()).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Intakes" }).getByText("12", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Qualification Rate" }).getByText("75%", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Web Form" }).getByText("7", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Missed Call Route" }).getByText("4", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Unpaid Total" }).getByText("$1450.50", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "Overdue Count" }).getByText("2", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "8 To 14 Days" }).getByText("1", { exact: true })).toBeVisible();
  await expect(page.locator(".results-grid .panel").filter({ hasText: "8 To 14 Days" }).getByText("$450.00", { exact: true })).toBeVisible();
  const bucketHeadings = page.locator(".collections-aging-grid .panel h3");
  await expect(bucketHeadings.nth(0)).toHaveText("31 Plus Days (Top Action)");
  await expect(bucketHeadings.nth(1)).toHaveText("15 To 30 Days (Top Action)");
  await expect(bucketHeadings.nth(2)).toHaveText("8 To 14 Days");
  await expect(bucketHeadings.nth(3)).toHaveText("1 To 7 Days");
  await expect(bucketHeadings.nth(4)).toHaveText("Current Not Due");
  await expect(page.getByText("Call today and secure payment commitment before close.")).toBeVisible();
  await expect(page.getByText("Prioritize outbound follow-up this shift.")).toBeVisible();
  await expect(page.getByText("Collect invoice #401")).toBeVisible();
  await expect(page.getByText("#1 (148)")).toBeVisible();
  await expect(page.getByText("Call customer and collect payment today.")).toBeVisible();
  await page.getByRole("button", { name: "Acknowledge Collect invoice #401" }).click();
  await expect(page.getByText("Acknowledged: Collect invoice #401")).toBeVisible();
  const queueRows = page.locator("section.dispatch-card:has(h2:has-text('Operator Priority Queue')) tbody tr");
  await expect(queueRows.filter({ hasText: "Collect invoice #401" })).toHaveCount(0);
  await expect(page.getByText("invoice_collection #401")).toBeVisible();
  await page.getByRole("button", { name: "Restore invoice_collection #401" }).click();
  await expect(page.getByText("Restored: invoice_collection #401")).toBeVisible();
  await expect(queueRows.filter({ hasText: "Collect invoice #401" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "8 To 14 Days (Top Action)" })).toHaveCount(0);
  await expect(page.getByText("2026-04-01")).toBeVisible();
});
