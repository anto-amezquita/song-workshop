// Serves the static export in out/, for Playwright and for a local look at a build.
// Not for production: Vercel serves out/ itself, with the headers in vercel.json (decisions/0006).
// Node runs this file directly; it only uses syntax Node can strip types from.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * The files that could answer a request, in the order a static host tries them:
 * the path itself, then `<path>.html` (Next's export writes `/lessons/x` as
 * `lessons/x.html`), then `<path>/index.html`. Returns null for anything that
 * would leave `root`, so `/../secret` can't read outside the export.
 */
export function candidatesFor(root: string, urlPath: string): string[] | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(urlPath, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (pathname.includes("\0")) return null;
  const base = path.resolve(root);
  const target = path.resolve(base, "." + pathname);
  if (target !== base && !target.startsWith(base + path.sep)) return null;
  if (target === base) return [path.join(base, "index.html")];
  return [target, `${target}.html`, path.join(target, "index.html")];
}

async function firstFile(candidates: string[]): Promise<string | null> {
  for (const file of candidates) {
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      // Not there; try the next one.
    }
  }
  return null;
}

export function serve(root: string, port: number) {
  return createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const candidates = candidatesFor(root, req.url ?? "/");
    const file = candidates && (await firstFile(candidates));
    const status = file ? 200 : 404;
    const body = file ?? (await firstFile([path.join(root, "404.html")]));
    if (!body) {
      res.writeHead(404, { "Content-Type": TYPES[".txt"] }).end("Not found");
      return;
    }
    const type = TYPES[path.extname(body)] ?? "application/octet-stream";
    res.writeHead(status, { "Content-Type": type });
    res.end(req.method === "HEAD" ? undefined : await readFile(body));
  }).listen(port, "127.0.0.1", () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}`);
  });
}

if (import.meta.main) {
  serve(path.resolve("out"), Number(process.env.PORT ?? 4173));
}
