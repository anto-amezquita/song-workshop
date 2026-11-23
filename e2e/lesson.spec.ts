import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LESSON = "/lessons/nashville-numbers";
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Counts what the page asks Web Audio for. Tests don't listen (architecture.md §10).
async function countSound(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { audio: { contexts: number; oscillators: number } };
    w.audio = { contexts: 0, oscillators: 0 };
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options);
        w.audio.contexts++;
      }
      createOscillator() {
        w.audio.oscillators++;
        return super.createOscillator();
      }
    };
  });
}

const sound = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { audio: { contexts: number; oscillators: number } }).audio,
  );

const panel = (page: Page, name: string) => page.getByRole("region", { name });
const path = (page: Page, name: RegExp) =>
  page.getByRole("complementary", { name: "Lesson path" }).getByRole("button", { name });
const playButton = (page: Page) => page.getByRole("button", { name: /^(Play|Stop) progression$/ });
const litChord = (page: Page) => page.locator(".chord-grid__chord[data-lit]");
const litNotes = (page: Page) => page.locator(".scale-row__note[data-lit]");
const keyName = (page: Page) => page.locator(".nashville-lab__key-name");

test.describe("the lesson path", () => {
  test.beforeEach(async ({ page }) => {
    await countSound(page);
    await page.goto(LESSON);
  });

  test("1: plays the scale, lighting each note in turn", async ({ page }) => {
    await path(page, /Play the scale/).click();
    await expect(panel(page, "Scale")).toHaveAttribute("data-highlighted");
    await expect(litNotes(page)).toHaveCount(1);
    const first = await litNotes(page).first().textContent();
    await expect.poll(async () => litNotes(page).first().textContent()).not.toBe(first);
    expect((await sound(page)).oscillators).toBeGreaterThan(0);
    await expect(page.locator(".lesson-path__step").first()).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  test("2: plays all seven chords, lighting each", async ({ page }) => {
    await path(page, /Play all seven/).click();
    await expect(panel(page, "Chords")).toHaveAttribute("data-highlighted");
    await expect(litChord(page)).toHaveAccessibleName("Chord 1, C major");
    await expect(litChord(page)).toHaveAccessibleName("Chord 2m, Dm minor");
    await expect(page.locator(".lesson-path__step").first()).toHaveAttribute("data-state", "done");
  });

  test("3: plays 1–5–6m–4 from bar 1", async ({ page }) => {
    await path(page, /Play 1–5–6m–4/).click();
    await expect(playButton(page)).toHaveAccessibleName("Stop progression");
    await expect(page.getByRole("button", { name: /^Pop anthem/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".progression__slot[data-lit]")).toContainText("Bar 1");
    await expect(panel(page, "Progressions")).toHaveAttribute("data-highlighted");
  });

  test("4: moves to the next key while the numbers stay put", async ({ page }) => {
    await path(page, /Change the key/).click();
    await expect(keyName(page)).toHaveText("G major");
    await expect(playButton(page)).toHaveAccessibleName("Stop progression");
    const slots = page.getByRole("list", { name: "Progression" });
    await expect(slots.locator(".progression__secondary").first()).toHaveText("G");
    await expect(slots.locator(".progression__primary")).toHaveText(["1", "5", "6m", "4"]);
    await path(page, /Change the key/).click();
    await expect(keyName(page)).toHaveText("D major");
  });

  test("5: switches to the relative minor and plays Minor pop", async ({ page }) => {
    await path(page, /Switch to minor/).click();
    await expect(page.locator(".nashville-lab")).toHaveAttribute("data-tonality", "minor");
    await expect(keyName(page)).toHaveText("A minor");
    await expect(page.getByRole("radio", { name: "Relative minor" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByRole("button", { name: /^Minor pop/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(playButton(page)).toHaveAccessibleName("Stop progression");
    await expect(panel(page, "Key")).toHaveAttribute("data-highlighted");
  });
});

test("the whole lesson works by keyboard alone", async ({ page }) => {
  await countSound(page);
  await page.goto(LESSON);
  const focused = () =>
    page.evaluate(
      () =>
        document.activeElement?.getAttribute("aria-label") ??
        document.activeElement?.textContent?.trim(),
    );

  // Tonality switch: the first stop. Arrow keys move the choice (C-01).
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("Major");
  await page.keyboard.press("ArrowRight");
  await expect(keyName(page)).toHaveText("A minor");
  await page.keyboard.press("ArrowLeft");
  await expect(keyName(page)).toHaveText("C major");

  // Key picker: one tab stop, arrows go round the circle.
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("C major");
  await page.keyboard.press("ArrowRight");
  await expect(keyName(page)).toHaveText("G major");

  // Play scale, then the label switch.
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("Play scale");
  await page.keyboard.press("Enter");
  await expect(litNotes(page)).toHaveCount(1);
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Chord names" })).toHaveAttribute(
    "aria-checked",
    "true",
  );

  // A chord card, by Enter.
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("Chord G, 1 major"); // names first now (C-15)
  await page.keyboard.press("Enter");
  await expect(litChord(page)).toHaveAccessibleName("Chord G, 1 major");

  // Build your own, add two chords, remove one, all by keyboard (R3).
  await page.getByRole("button", { name: "Build your own" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Tap chords above to add them, up to eight.")).toBeVisible();
  await page.getByRole("button", { name: "Chord C, 4 major" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Tab"); // chord 3m
  await page.keyboard.press("Enter");
  const removeButtons = page.getByRole("list", { name: "Progression" }).getByRole("button");
  await expect(removeButtons).toHaveCount(2);
  await removeButtons.first().focus();
  await page.keyboard.press("Enter");
  await expect(removeButtons).toHaveCount(1);
  expect(await focused()).toBe("Remove bar 1: Bm, 3m (B minor)");
  await page.keyboard.press("Enter");
  expect(await focused()).toBe("Chord G, 1 major");

  // Transport: play and stop, tempo, Loop.
  await page.getByRole("button", { name: /^Rock & folk/ }).focus();
  await page.keyboard.press("Enter");
  await expect(playButton(page)).toHaveAccessibleName("Stop progression");
  await playButton(page).focus();
  await page.keyboard.press("Space");
  await expect(playButton(page)).toHaveAccessibleName("Play progression");
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".transport__tempo output")).toHaveText("101");
  await page.keyboard.press("Tab");
  expect(await focused()).toBe("Loop");
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Loop" })).toHaveAttribute("aria-pressed", "false");

  // A lesson-path step.
  await path(page, /Switch to minor/).focus();
  await page.keyboard.press("Enter");
  await expect(keyName(page)).toHaveText("E minor");

  expect((await sound(page)).oscillators).toBeGreaterThan(0);
});

test.describe("sound", () => {
  test("starts only with a gesture", async ({ page }) => {
    await countSound(page);
    await page.goto(LESSON);
    await page.waitForTimeout(500);
    expect(await sound(page)).toEqual({ contexts: 0, oscillators: 0 });
    await page.getByRole("button", { name: "Chord 5, G major" }).click();
    expect(await sound(page)).toMatchObject({ contexts: 1 });
    // A chord is a bass and a triad, each voice two oscillators; 1.4s strikes again.
    expect((await sound(page)).oscillators).toBe(14);
  });

  test("says so when it isn't available, and everything else still works", async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error: simulating a browser without Web Audio
      delete window.AudioContext;
      // @ts-expect-error: and without the old prefixed one
      delete window.webkitAudioContext;
    });
    await page.goto(LESSON);
    await page.getByRole("button", { name: "Chord 5, G major" }).click();
    await expect(
      page.getByText("Sound isn't available in this browser. Everything else still works.").first(),
    ).toBeVisible();
    await expect(page.locator('div[role="status"]')).toHaveText(
      "Sound isn't available in this browser. Everything else still works.",
    );
    await expect(litChord(page)).toHaveAccessibleName("Chord 5, G major");
  });
});

// Reduced motion makes every colour change finish at once, so axe sees the final colours.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe in ${colorScheme}`, () => {
    test.use({ colorScheme, reducedMotion: "reduce" });

    const check = async (page: Page) => {
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(results.violations).toEqual([]);
    };

    test("major: idle, playing and building", async ({ page }) => {
      await page.goto(LESSON);
      await check(page);
      await playButton(page).click();
      await expect(litChord(page)).toHaveCount(1);
      await check(page);
      await page.getByRole("button", { name: "Build your own" }).click();
      await page.getByRole("button", { name: "Chord 1, C major" }).click();
      await page.getByRole("button", { name: "Chord 6m, Am minor" }).click();
      await check(page);
    });

    test("minor: idle, playing and building", async ({ page }) => {
      await page.goto(LESSON);
      await page.getByRole("radio", { name: "Relative minor" }).click();
      await expect(page.locator(".nashville-lab")).toHaveAttribute("data-tonality", "minor");
      await check(page);
      await playButton(page).click();
      await expect(litChord(page)).toHaveCount(1);
      await check(page);
      await page.getByRole("button", { name: "Build your own" }).click();
      await page.getByRole("button", { name: "Chord 1m, Am minor" }).click();
      await check(page);
    });
  });
}
