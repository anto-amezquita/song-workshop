// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCROLL_LOCK_CLASS, SiteBar } from "./SiteBar";

const pathname = vi.hoisted(() => ({ current: "/lessons/nashville-numbers" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

afterEach(cleanup);

const links = [
  { href: "/lessons/nashville-numbers", label: "Nashville Number Lab" },
  { href: "/lessons/melody", label: "Melody" },
];

function renderBar(path = "/lessons/nashville-numbers") {
  pathname.current = path;
  return render(<SiteBar links={links} rootHref="/lessons/nashville-numbers" />);
}

describe("SiteBar", () => {
  it("is the page's banner, with the Lessons button and the site's name linking home", () => {
    renderBar();
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("button", { name: "Lessons" })).toBeTruthy();
    expect(within(banner).getByRole("link", { name: "Song Workshop" }).getAttribute("href")).toBe(
      "/",
    );
  });

  it("opens a Lessons drawer listing every lesson, with the current one marked", async () => {
    renderBar();
    await userEvent.click(screen.getByRole("button", { name: "Lessons" }));
    const dialog = screen.getByRole("dialog", { name: "Lessons" });
    const nav = within(dialog).getByRole("navigation", { name: "Lessons" });
    const items = within(nav).getAllByRole("link");
    expect(items.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Nashville Number Lab", "/lessons/nashville-numbers"],
      ["Melody", "/lessons/melody"],
    ]);
    expect(items.map((a) => a.getAttribute("aria-current"))).toEqual(["page", null]);
  });

  it("marks the lesson / shows when on /", async () => {
    renderBar("/");
    await userEvent.click(screen.getByRole("button", { name: "Lessons" }));
    expect(
      screen.getByRole("link", { name: "Nashville Number Lab" }).getAttribute("aria-current"),
    ).toBe("page");
  });

  it("puts focus on the first lesson, and back on Lessons when Escape closes it", async () => {
    renderBar();
    const button = screen.getByRole("button", { name: "Lessons" });
    await userEvent.click(button);
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Nashville Number Lab" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("locks page scroll only while the drawer is open", async () => {
    renderBar();
    const root = document.documentElement;
    expect(root.classList.contains(SCROLL_LOCK_CLASS)).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: "Lessons" }));
    expect(root.classList.contains(SCROLL_LOCK_CLASS)).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(root.classList.contains(SCROLL_LOCK_CLASS)).toBe(false);
  });

  it("closes when a lesson is chosen", async () => {
    renderBar();
    await userEvent.click(screen.getByRole("button", { name: "Lessons" }));
    // jsdom doesn't navigate; the click still closes the drawer.
    await userEvent.click(screen.getByRole("link", { name: "Melody" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
