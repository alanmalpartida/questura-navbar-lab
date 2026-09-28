// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic-style: a tall masthead that condenses into a thin bar over the
// first collapsePx of scroll (same --navbar-collapse lerp as the original)
// and stays pinned at the top from then on. Once it has fully collapsed, the
// section links slide into the thin bar beside the menu (Atlantic 3's trick).
// Motion constants come from the lab panel sliders (useTuning) so they can be
// tuned live; bake the final numbers back in when porting to Questura.

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import { useEffect, useRef, useState } from "react";
import { useTuning } from "@lab/LabContext";

// The lerp's last few percent is invisible but slow (~0.5s from 0.97 to 1 at
// the default smoothing), so the bar counts as locked once it is this close
// to fully collapsed and still headed there.
const LOCK_AT = 0.97;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  // True once the rendered collapse has settled at 1.
  const [locked, setLocked] = useState(false);
  // True while the bar is fully expanded and not heading anywhere: the only
  // time the divider above the section row shows.
  const [atRest, setAtRest] = useState(true);

  // collapsePx: scroll distance over which the navbar goes expanded → collapsed.
  // lerp: how fast the rendered value chases the target each frame.
  const tuning = useTuning();
  const tuningRef = useRef(tuning);
  tuningRef.current = tuning;
  const resyncRef = useRef<() => void>(() => {});

  // A slider move changes where the collapse should be without a scroll event.
  useEffect(() => resyncRef.current(), [tuning.collapsePx]);

  useEffect(() => {
    const collapseFromScroll = () =>
      Math.min(1, Math.max(0, window.scrollY / tuningRef.current.collapsePx));

    let rafId = 0;
    let targetVal = collapseFromScroll();
    let currentVal = targetVal;

    const tick = () => {
      currentVal += (targetVal - currentVal) * tuningRef.current.lerp;
      if (targetVal === 1 && currentVal > 0.995) currentVal = 1;
      if (targetVal === 0 && currentVal < 0.005) currentVal = 0;

      setLocked(targetVal === 1 && currentVal >= LOCK_AT);
      setAtRest(targetVal === 0 && currentVal < 0.02);
      const borderAlpha = currentVal === 0 || currentVal === 1 ? 0.1 : 0;
      document.documentElement.style.setProperty(
        "--navbar-collapse",
        String(currentVal)
      );
      document.documentElement.style.setProperty(
        "--navbar-border-alpha",
        String(borderAlpha)
      );

      if (currentVal === targetVal) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (rafId === 0) rafId = requestAnimationFrame(tick);
    };

    wake();

    const handleScroll = () => {
      const next = collapseFromScroll();
      if (next === targetVal) return;
      targetVal = next;
      wake();
    };

    resyncRef.current = handleScroll;
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const setHeight = (h: number) =>
      document.documentElement.style.setProperty("--navbar-height", `${h}px`);

    setHeight(el.offsetHeight);

    const ro = new ResizeObserver((entries) => {
      const h =
        entries[0]?.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight;
      setHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <nav ref={navRef} className="sticky top-0 z-40">
      <div className="hidden 1024:block">
        <DesktopNavbar locked={locked} atRest={atRest} />
      </div>
      <div className="h-[55px] 1024:hidden">
        <MobileNavbar />
      </div>
    </nav>
  );
}
