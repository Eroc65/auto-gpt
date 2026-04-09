const { test, expect } = require("@playwright/test");

test("dispatch assistant full flow works", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "test-token", token_type: "bearer" }),
    });
  });

  await page.route("**/api/jobs", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 101, title: "Water Heater Replace", status: "pending" },
      ]),
    });
  });

  await page.route("**/api/technicians", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: 7, name: "Sam Tech" },
      ]),
    });
  });

  await page.route("**/api/jobs/scheduling/conflict**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        conflict: false,
        conflicting_job_id: null,
        message: "No scheduling conflict detected",
      }),
    });
  });

  await page.route("**/api/jobs/scheduling/next-slot**", async (route) => {
    const requested = new URL(route.request().url()).searchParams.get("requested_time");
    const suggested = requested
      ? new Date(new Date(requested).getTime() + 30 * 60 * 1000).toISOString()
      : new Date().toISOString();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        technician_id: 7,
        requested_time: requested,
        search_hours: 24,
        step_minutes: 30,
        next_available_time: suggested,
        conflicting_job_ids: [],
      }),
    });
  });

  await page.route("**/api/jobs/101/dispatch", async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        title: "Water Heater Replace",
        status: "dispatched",
        technician_id: payload.technician_id,
        scheduled_time: payload.scheduled_time,
      }),
    });
  });

  await page.route("**/api/jobs/101/on-my-way", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        title: "Water Heater Replace",
        status: "on_my_way",
        technician_id: 7,
      }),
    });
  });

  await page.route("**/api/jobs/101/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        title: "Water Heater Replace",
        status: "in_progress",
        technician_id: 7,
      }),
    });
  });

  await page.route("**/api/jobs/101/complete", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        title: "Water Heater Replace",
        status: "completed",
        technician_id: 7,
      }),
    });
  });

  await page.route("**/api/jobs/101/timeline", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: 501,
          action: "dispatched",
          from_status: "approved",
          to_status: "dispatched",
          created_at: new Date().toISOString(),
        },
      ]),
    });
  });

  await page.goto("/dispatch-assistant");

  await expect(page.getByRole("heading", { name: "Dispatch Assistant", level: 1 })).toBeVisible();

  await page.getByLabel("Auth Email").fill("operator@example.com");
  await page.getByLabel("Auth Password").fill("testpass123");
  await page.getByRole("button", { name: "Login And Set Token" }).click();

  await expect(page.getByLabel("Pick Job")).toContainText("#101 Water Heater Replace (pending)");
  await expect(page.getByLabel("Pick Technician")).toContainText("#7 Sam Tech");

  await page.getByLabel("Pick Job").selectOption("101");
  await page.getByLabel("Pick Technician").selectOption("7");

  await page.getByRole("button", { name: "Check Conflict" }).click();
  await expect(page.getByText("Conflict: false")).toBeVisible();

  await page.getByRole("button", { name: "Suggest Next Slot" }).click();
  await expect(page.getByText("Conflicts seen: none")).toBeVisible();

  await page.getByRole("button", { name: "Dispatch At Suggested Time" }).click();
  await expect(page.getByText("Status: dispatched")).toBeVisible();
  await expect(page.getByText("Job ID: 101")).toBeVisible();

  await page.getByRole("button", { name: "Mark On My Way", exact: true }).click();
  await expect(page.getByText("Status: on_my_way")).toBeVisible();

  await page.getByRole("button", { name: "Mark Started", exact: true }).click();
  await expect(page.getByText("Status: in_progress")).toBeVisible();

  await page.getByRole("button", { name: "Mark Completed", exact: true }).click();
  await expect(page.getByText("Status: completed")).toBeVisible();

  await page.getByRole("button", { name: "Load Timeline" }).click();
  await expect(page.getByText("dispatched (approved to dispatched)")).toBeVisible();
});


test("dispatch assistant mobile lifecycle can complete in three taps", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "test-token", token_type: "bearer" }),
    });
  });

  await page.route("**/api/jobs", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 101, title: "Water Heater Replace", status: "pending" }]),
    });
  });

  await page.route("**/api/technicians", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: 7, name: "Sam Tech" }]),
    });
  });

  await page.route("**/api/jobs/101/dispatch", async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 101,
        title: "Water Heater Replace",
        status: "dispatched",
        technician_id: payload.technician_id,
        scheduled_time: payload.scheduled_time,
      }),
    });
  });

  await page.route("**/api/jobs/101/on-my-way", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 101, title: "Water Heater Replace", status: "on_my_way", technician_id: 7 }),
    });
  });

  await page.route("**/api/jobs/101/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 101, title: "Water Heater Replace", status: "in_progress", technician_id: 7 }),
    });
  });

  await page.route("**/api/jobs/101/complete", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 101, title: "Water Heater Replace", status: "completed", technician_id: 7 }),
    });
  });

  await page.route("**/api/jobs/101/timeline", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.goto("/dispatch-assistant");

  await page.getByLabel("Auth Email").fill("operator@example.com");
  await page.getByLabel("Auth Password").fill("testpass123");
  await page.getByRole("button", { name: "Login And Set Token" }).click();

  await page.getByLabel("Pick Job").selectOption("101");
  await page.getByLabel("Pick Technician").selectOption("7");

  await page.getByRole("button", { name: "Dispatch At Selected Time" }).click();
  await expect(page.getByText("Status: dispatched")).toBeVisible();

  const advance = page.getByRole("button", { name: /Advance Lifecycle/i });

  // Three taps from dispatched -> on_my_way -> in_progress -> completed.
  await advance.click();
  await expect(page.getByText("Status: on_my_way")).toBeVisible();

  await advance.click();
  await expect(page.getByText("Status: in_progress")).toBeVisible();

  await advance.click();
  await expect(page.getByText("Status: completed")).toBeVisible();
});
