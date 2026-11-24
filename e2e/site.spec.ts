import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { headersFor, readHeaderRules } from "../scripts/serve-out";

const pages = ["/", "/lessons/nashville-numbers"];
const modes = ["light", "dark"] as const;

for (const path of pages) {
  for (const mode of modes) {
    test.describe(`${path} in ${mode}`, () => {
      test.use({ colorScheme: mode });

      test("passes axe", async ({ page }) => {
        await page.goto(path);
        // The lesson rolls its labels in on load. Mid-roll, text is partly faded,
        // which axe would measure as low contrast; check the page people settle on.
        await page.waitForFunction(() =>
          document.getAnimations().every((a) => a.playState === "finished"),
        );
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      test("sets the colour mode before first paint", async ({ page }) => {
        // Recorded the moment <body> exists, before anything can paint. The init
        // script runs before <html> exists, so it watches the whole document.
        await page.addInitScript(() => {
          new MutationObserver((_, observer) => {
            if (document.body) {
              (window as unknown as { modeAtBody: string | undefined }).modeAtBody =
                document.documentElement.dataset.mode;
              observer.disconnect();
            }
          }).observe(document, { childList: true, subtree: true });
        });
        await page.goto(path);
        const modeAtBody = await page.evaluate(
          () => (window as unknown as { modeAtBody: string | undefined }).modeAtBody,
        );
        expect(modeAtBody).toBe(mode);
        await expect(page.locator("html")).toHaveAttribute("data-mode", mode);
      });
    });
  }

  test(`${path} loads its fonts and nothing from elsewhere`, async ({ page, baseURL }) => {
    const elsewhere: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.startsWith(baseURL!) && !url.startsWith("data:")) elsewhere.push(url);
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => ({
      bricolage: document.fonts.check('760 48px "Bricolage Grotesque Variable"'),
      inter: document.fonts.check('400 15px "Inter"'),
    }));
    expect(loaded).toEqual({ bricolage: true, inter: true });
    expect(elsewhere).toEqual([]);
  });
}

for (const path of pages) {
  test(`${path} points search engines at the lesson's own address`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://song-workshop.amezquita.dk/lessons/nashville-numbers",
    );
  });
}

// The e2e server sends the headers in vercel.json (scripts/serve-out.ts), so these
// pages run under the production CSP. Anything it blocks fails here, not in production.
const policy = headersFor(readHeaderRules(path.resolve("vercel.json")), "/")[
  "Content-Security-Policy"
];

for (const path of [...pages, "/no-such-lesson"]) {
  test(`${path} works under the CSP without breaking it`, async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { violations: string[] };
      w.violations = [];
      document.addEventListener(
        "securitypolicyviolation",
        (event) => w.violations.push(`${event.effectiveDirective}: ${event.blockedURI}`),
        true,
      );
    });
    const response = await page.goto(path);
    expect(response?.headers()["content-security-policy"]).toBe(policy);
    // The roll-in sets its delays through inline style attributes; let it finish.
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.playState === "finished"),
    );
    if (path !== "/no-such-lesson") {
      // Proves React started: Play lights a chord.
      await page.getByRole("button", { name: "Play progression" }).click();
      await expect(page.locator(".chord-grid__chord[data-lit]")).toHaveCount(1);
    }
    const violations = await page.evaluate(
      () => (window as unknown as { violations: string[] }).violations,
    );
    expect(violations).toEqual([]);
  });
}

test("a missing page gets a 404 on the page colour, not white", async ({ page }) => {
  const response = await page.goto("/no-such-lesson");
  expect(response?.status()).toBe(404);
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).toBe("rgb(237, 241, 239)"); // song-workshop-page, #EDF1EF
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
