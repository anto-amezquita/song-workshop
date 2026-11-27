import NextLink from "next/link";
import { useEffect, useRef } from "react";
import type { SiteLink } from "./navigation";
import "./LessonList.css";

type Props = {
  links: readonly SiteLink[];
  currentHref: string | undefined;
  /** Called when a link is chosen, so the drawer closes as the page changes. */
  onNavigate: () => void;
};

/**
 * The lessons inside the site bar's drawer. CUSTOM until AME-100: the design
 * system's SideNav would draw this list, but it can't be a drawer at 1024px and
 * wider yet (spec N-1). Its look follows SideNav's links.
 */
export function LessonList({ links, currentHref, onNavigate }: Props) {
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
        {links.map((link) => (
          <li key={link.href}>
            <NextLink
              href={link.href}
              className="lesson-list__link"
              aria-current={link.href === currentHref ? "page" : undefined}
              onClick={onNavigate}
            >
              {link.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
