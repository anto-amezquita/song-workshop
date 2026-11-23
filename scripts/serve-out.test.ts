import path from "node:path";
import { describe, expect, it } from "vitest";
import { candidatesFor } from "./serve-out";

const root = path.resolve("/srv/out");

describe("candidatesFor", () => {
  it("serves index.html for the root", () => {
    expect(candidatesFor(root, "/")).toEqual([path.join(root, "index.html")]);
  });

  it("tries the path, then .html, then index.html", () => {
    expect(candidatesFor(root, "/lessons/nashville-numbers?x=1")).toEqual([
      path.join(root, "lessons/nashville-numbers"),
      path.join(root, "lessons/nashville-numbers.html"),
      path.join(root, "lessons/nashville-numbers/index.html"),
    ]);
  });

  it("keeps dot segments inside the export", () => {
    // The URL parser folds these before the server sees them, so they land inside root.
    for (const url of ["/../etc/passwd", "/%2e%2e/etc/passwd", "/a/%2e%2e/%2e%2e/etc/passwd"]) {
      const candidates = candidatesFor(root, url) ?? [];
      expect(candidates.length).toBeGreaterThan(0);
      for (const file of candidates) expect(file.startsWith(root + path.sep)).toBe(true);
    }
  });

  it("refuses encoded slashes that would leave the export", () => {
    expect(candidatesFor(root, "/..%2F..%2Fetc%2Fpasswd")).toBeNull();
    expect(candidatesFor(root, "/a%2F..%2F..%2Fout-private%2Fsecret")).toBeNull();
  });

  it("refuses null bytes and broken escapes", () => {
    expect(candidatesFor(root, "/index.html%00.png")).toBeNull();
    expect(candidatesFor(root, "/%E0%A4%A")).toBeNull();
  });
});
