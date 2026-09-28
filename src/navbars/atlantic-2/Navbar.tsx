// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic 2, Monocle-style flow: a pinned top bar (menu · account), a big
// masthead wordmark under it, and a section row under that. Scrolling slides
// the masthead up underneath the top bar; the section row rides up and pins
// under the top bar; only once the masthead is 100% covered does the small
// wordmark fade into the top bar.
//
// All native sticky, no transforms. The pieces are siblings of the page
// content (the wrappers below are display: contents), so porting back needs
// Navbar rendered directly inside the page's tall layout box, as it is here.
//
// The collapse distance is the masthead's own height, so the lab's collapse
// slider doesn't apply. --navbar-collapse still reports 0 → 1 progress.

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import { useEffect, useState } from "react";

// Whichever of the desktop/mobile copies is on screen at this breakpoint.
function visible(name: string): HTMLElement | undefined {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-nav="${name}"]`)).find(
    (el) => el.offsetHeight > 0
  );
}

export default function Navbar() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const root = document.documentElement.style;
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const topbar = visible("topbar");
      const masthead = visible("masthead");
      const sections = visible("sections");
      if (!topbar || !masthead) return;

      const barBottom = topbar.getBoundingClientRect().bottom;
      const { bottom, height } = masthead.getBoundingClientRect();
      // How much of the masthead is still showing below the top bar.
      const showing = Math.min(1, Math.max(0, (bottom - barBottom) / height));

      setCompact(showing === 0);
      root.setProperty("--navbar-collapse", String(1 - showing));
      root.setProperty(
        "--navbar-height",
        `${topbar.offsetHeight + (sections?.offsetHeight ?? 0)}px`
      );
    };

    const schedule = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="hidden 1024:contents">
        <DesktopNavbar compact={compact} />
      </div>
      <div className="contents 1024:hidden">
        <MobileNavbar compact={compact} />
      </div>
    </>
  );
}
