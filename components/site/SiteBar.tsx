"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@amezquita/design-system/components/composition/Drawer";
import { Button } from "@amezquita/design-system/components/primitives/Button";
import { LessonList } from "./LessonList";
import { currentLinkHref, type SiteLink } from "./navigation";
import "./SiteBar.css";

/** TEMPORARY OVERRIDE (decisions/0007): set on <html> while the drawer is open; styles/global.css locks scroll under it. */
export const SCROLL_LOCK_CLASS = "site-scroll-locked";

type Props = {
  /** Every lesson, in registry order. */
  links: readonly SiteLink[];
  /** The lesson `/` shows, marked as current there. */
  rootHref: string;
};

/**
 * The thin bar across the top of every page: a Lessons button that opens the
 * lessons drawer from the left at every width (spec D-B, D-C), and the site's
 * name, linking home. CUSTOM, built from design system tokens and components.
 */
export function SiteBar({ links, rootHref }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentHref = currentLinkHref(pathname, links, rootHref);

  // Close whenever the page changes, however it changed: a lesson chosen in the
  // drawer, the Back button, or anything else. Adjusted during render, not in an
  // effect, so the drawer never paints open on the new page.
  const [shownPathname, setShownPathname] = useState(pathname);
  if (pathname !== shownPathname) {
    setShownPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add(SCROLL_LOCK_CLASS);
    return () => root.classList.remove(SCROLL_LOCK_CLASS);
  }, [open]);

  return (
    <header className="site-bar">
      <div className="site-bar__inner">
        <Drawer
          open={open}
          onOpenChange={setOpen}
          side="left"
          size="sm"
          title="Lessons"
          trigger={
            <Button variant="ghost" className="site-bar__lessons">
              Lessons
            </Button>
          }
        >
          <LessonList
            links={links}
            currentHref={currentHref}
            onChooseCurrent={() => setOpen(false)}
          />
        </Drawer>
        <NextLink href="/" className="site-bar__name">
          Song Workshop
        </NextLink>
      </div>
    </header>
  );
}
