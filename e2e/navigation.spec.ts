import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { lessonPath, lessons } from "../lessons/registry";

// The site bar and its lessons drawer (AME-97, specs/2026-11-27-lesson-navigation.md).
// Run against the built site under the production CSP (scripts/serve-out.ts).

const lessonTitles = lessons.map((l) => l.title);
const nashville = lessonPath("nashville-numbers");

/** Records CSP violations and any <style> element added to the page from the start. */
async function watchPage(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { violations: string[]; addedStyles: number };
    w.violations = [];
    w.addedStyles = 0;
    document.addEventListener(
      "securitypolicyviolation",
      (e) => w.violations.push(`${e.effectiveDirective}: ${e.blockedURI}`),
      true,
    );
    new MutationObserver((records) => {
      for (const r of records)
        for (const node of r.addedNodes) if (node.nodeName === "STYLE") w.addedStyles++;
    }).observe(document, { childList: true, subtree: true });
  });
}

const watched = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { violations: string[]; addedStyles: number };
    return { violations: w.violations, addedStyles: w.addedStyles };
  });

async function openLessons(page: Page) {
  await page.getByRole("banner").getByRole("button", { name: "Lessons" }).click();
  const dialog = page.getByRole("dialog", { name: "Lessons" });
  await expect(dialog).toBeVisible();
  return dialog;
}

const pages = [
  { path: "/", current: lessons[0].title },
  { path: nashville, current: lessons[0].title },
  { path: "/no-such-lesson", current: null },
];

const lessonsButton = (page: Page) =>
  page.getByRole("banner").getByRole("button", { name: "Lessons" });

// F1–F7 on each of the three pages (spec §10).
for (const { path, current } of pages) {
  test.describe(`on ${path}`, () => {
    test("the bar opens a drawer of every lesson, with the current one marked", async ({
      page,
    }) => {
      await page.goto(path);
      const banner = page.getByRole("banner");
      await expect(banner).toHaveCount(1);
      await expect(banner.getByRole("link", { name: "Song Workshop" })).toHaveAttribute(
        "href",
        "/",
      );

      const dialog = await openLessons(page);
      const links = dialog.getByRole("navigation", { name: "Lessons" }).getByRole("link");
      await expect(links).toHaveText(lessonTitles);
      const marked = dialog.locator('a[aria-current="page"]');
      if (current) await expect(marked).toHaveText(current);
      else await expect(marked).toHaveCount(0);
    });

    for (const width of [375, 1280]) {
      test(`at ${width}px the drawer opens under the CSP, adds no <style> and holds the page still`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 720 });
        await watchPage(page);
        await page.goto(path);
        await openLessons(page);

        const overflow = await page.evaluate(
          () => getComputedStyle(document.documentElement).overflow,
        );
        expect(overflow).toBe("hidden");
        await page.mouse.move(width - 5, 400);
        await page.mouse.wheel(0, 800);
        await page.keyboard.press("PageDown");
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        expect(
          await page.evaluate(() => getComputedStyle(document.documentElement).overflow),
        ).not.toBe("hidden");
        expect(await watched(page)).toEqual({ violations: [], addedStyles: 0 });
      });
    }

    test("works by keyboard alone: open, land on the first lesson, close, back on Lessons", async ({
      page,
    }) => {
      await page.goto(path);
      // The bar comes first on the page: Lessons, then the site's name.
      await page.keyboard.press("Tab");
      await expect(lessonsButton(page)).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("link", { name: lessonTitles[0] })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(lessonsButton(page)).toBeFocused();
    });

    test("the close button closes it, and focus goes back to Lessons", async ({ page }) => {
      await page.goto(path);
      const dialog = await openLessons(page);
      await dialog.getByRole("button", { name: "Close drawer" }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(lessonsButton(page)).toBeFocused();
    });

    test.describe("on a touch screen", () => {
      test.use({ hasTouch: true });

      test("tapping outside closes it, and focus goes back to Lessons", async ({ page }) => {
        await page.goto(path);
        await openLessons(page);
        // The drawer opens from the left, so the right edge is the backdrop.
        const { width, height } = page.viewportSize()!;
        await page.touchscreen.tap(width - 40, height / 2);
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(lessonsButton(page)).toBeFocused();
      });
    });
  });
}

test("both controls in the bar meet the touch target", async ({ page }) => {
  await page.goto(nashville);
  const banner = page.getByRole("banner");
  const target = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-touch-target")),
  );
  for (const control of [
    banner.getByRole("button", { name: "Lessons" }),
    banner.getByRole("link", { name: "Song Workshop" }),
  ]) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(target);
  }
});

/** Marks the current document, to tell a client-side page change from a full reload. */
const markDocument = (page: Page) =>
  page.evaluate(() => {
    (window as unknown as { marked: boolean }).marked = true;
  });
const sameDocument = (page: Page) =>
  page.evaluate(() => (window as unknown as { marked?: boolean }).marked === true);

test("the Back button closes the drawer", async ({ page }) => {
  await page.goto("/");
  await markDocument(page);
  const dialog = await openLessons(page);
  await dialog.getByRole("link", { name: lessonTitles[0] }).click();
  await expect(page).toHaveURL(nashville);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await openLessons(page);
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Still the same document: the page changed on the client, and that closed the drawer.
  expect(await sameDocument(page)).toBe(true);
});

test("choosing a lesson goes there and closes the drawer", async ({ page }) => {
  await page.goto("/no-such-lesson");
  const dialog = await openLessons(page);
  await dialog.getByRole("link", { name: lessonTitles[0] }).click();
  await expect(page).toHaveURL(nashville);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: lessonTitles[0] })).toBeVisible();
});

for (const mode of ["light", "dark"] as const) {
  test.describe(`in ${mode}`, () => {
    test.use({ colorScheme: mode });

    test("passes axe with the drawer open", async ({ page }) => {
      await page.goto(nashville);
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState === "finished"),
      );
      await openLessons(page);
      // Let the drawer finish sliding in, so axe measures the settled colours.
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => a.playState === "finished"),
      );
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
