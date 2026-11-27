/** One link in the lessons menu. The root layout builds these from `lessons/registry.ts`. */
export type SiteLink = { href: string; label: string };

const withoutTrailingSlash = (path: string) =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

/**
 * The menu link for the page being viewed, if there is one. `/` shows a lesson
 * until there's a lesson index (architecture.md §4), so it counts as `rootHref`.
 */
export function currentLinkHref(
  pathname: string | null,
  links: readonly SiteLink[],
  rootHref: string,
): string | undefined {
  if (pathname === null) return undefined;
  const path = withoutTrailingSlash(pathname);
  const target = path === "/" ? rootHref : path;
  return links.find((link) => link.href === target)?.href;
}
