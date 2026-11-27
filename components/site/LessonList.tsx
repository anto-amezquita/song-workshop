import NextLink from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import type { SiteLink } from "./navigation";
import "./LessonList.css";

type Props = {
  links: readonly SiteLink[];
  currentHref: string | undefined;
  /**
   * Called when the current lesson is chosen. The page doesn't change then, so
   * the drawer has to close itself. Every other link closes it by changing the
   * page (SiteBar closes the drawer on any pathname change).
   */
  onChooseCurrent: () => void;
};

/** A click that opens the link somewhere else (new tab or window), not here. */
const opensElsewhere = (e: MouseEvent) =>
  e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

/**
 * The lessons inside the site bar's drawer. CUSTOM until AME-100: the design
 * system's SideNav would draw this list, but it can't be a drawer at 1024px and
 * wider yet (spec N-1). Its look follows SideNav's links.
 */
export function LessonList({ links, currentHref, onChooseCurrent }: Props) {
  const ref = useRef<HTMLElement>(null);

  // The drawer would put focus on its close button; the first lesson is what
  // people came for. This runs before the dialog's focus scope mounts, and the
  // scope leaves focus alone when it's already inside, as in SideNav's drawer.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("a[href]")?.focus();
  }, []);

  return (
    <nav ref={ref} aria-label="Lessons" className="lesson-list">
      <ul className="lesson-list__items">
        {links.map((link) => {
          const isCurrent = link.href === currentHref;
          return (
            <li key={link.href}>
              <NextLink
                href={link.href}
                className="lesson-list__link"
                aria-current={isCurrent ? "page" : undefined}
                onClick={(e) => {
                  if (isCurrent && !opensElsewhere(e)) onChooseCurrent();
                }}
              >
                {link.label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
