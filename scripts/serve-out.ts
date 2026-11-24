// Serves the static export in out/, for Playwright and for a local look at a build.
// Not for production: Vercel serves out/ itself (decisions/0006). This sends the same
// headers from vercel.json, so the e2e tests run under the production CSP.
// Node runs this file directly; it only uses syntax Node can strip types from.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

type HeaderRule = { source: string; headers: { key: string; value: string }[] };

/**
 * Turns a vercel.json `source` into a RegExp. Only literal paths and `(.*)` are
 * understood, which is all vercel.json uses. Anything else (`:param`, other
 * groups) throws, so a rule can't be skipped here while Vercel applies it.
 */
export function sourcePattern(source: string): RegExp {
  const parts = source.split("(.*)");
  for (const part of parts) {
    if (/[:()*+?{}[\]]/.test(part)) {
      throw new Error(`serve-out can't match the vercel.json source "${source}" yet`);
    }
  }
  const escaped = parts.map((part) => part.replace(/[.\\^$|/]/g, "\\$&"));
  return new RegExp(`^${escaped.join("(.*)")}$`);
}

/** The headers vercel.json sets for a URL path, in file order. */
export function headersFor(rules: HeaderRule[], urlPath: string): Record<string, string> {
  const pathname = urlPath.split(/[?#]/)[0];
  const headers: Record<string, string> = {};
  for (const rule of rules) {
    if (!sourcePattern(rule.source).test(pathname)) continue;
    for (const { key, value } of rule.headers) headers[key] = value;
  }
  return headers;
}

export function readHeaderRules(file: string): HeaderRule[] {
  const config = JSON.parse(readFileSync(file, "utf8")) as { headers?: HeaderRule[] };
  return config.headers ?? [];
}

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

export function serve(root: string, port: number, rules: HeaderRule[] = []) {
  return createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const url = req.url ?? "/";
    const candidates = candidatesFor(root, url);
    const file = candidates && (await firstFile(candidates));
    const status = file ? 200 : 404;
    const body = file ?? (await firstFile([path.join(root, "404.html")]));
    // Like Vercel, the headers go on every response, the 404 page included.
    const headers = headersFor(rules, url);
    if (!body) {
      res.writeHead(404, { ...headers, "Content-Type": TYPES[".txt"] }).end("Not found");
      return;
    }
    const type = TYPES[path.extname(body)] ?? "application/octet-stream";
    res.writeHead(status, { ...headers, "Content-Type": type });
    res.end(req.method === "HEAD" ? undefined : await readFile(body));
  }).listen(port, "127.0.0.1", () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}, with the headers in vercel.json`);
  });
}

if (import.meta.main) {
  serve(
    path.resolve("out"),
    Number(process.env.PORT ?? 4173),
    readHeaderRules(path.resolve("vercel.json")),
  );
}
