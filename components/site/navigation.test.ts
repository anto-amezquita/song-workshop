import { describe, expect, it } from "vitest";
import { currentLinkHref } from "./navigation";

const links = [
  { href: "/lessons/nashville-numbers", label: "Nashville Number Lab" },
  { href: "/lessons/melody", label: "Melody" },
];
const root = "/lessons/nashville-numbers";

describe("currentLinkHref", () => {
  it("marks the lesson being viewed", () => {
    expect(currentLinkHref("/lessons/melody", links, root)).toBe("/lessons/melody");
  });

  it("treats / as the lesson it shows", () => {
    expect(currentLinkHref("/", links, root)).toBe("/lessons/nashville-numbers");
  });

  it("ignores a trailing slash", () => {
    expect(currentLinkHref("/lessons/melody/", links, root)).toBe("/lessons/melody");
  });

  it("marks nothing on a page that isn't a lesson, or before the path is known", () => {
    expect(currentLinkHref("/no-such-lesson", links, root)).toBeUndefined();
    expect(currentLinkHref(null, links, root)).toBeUndefined();
  });
});
