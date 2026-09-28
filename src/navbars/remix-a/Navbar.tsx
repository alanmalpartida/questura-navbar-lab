// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic-style: a tall masthead that condenses into a thin bar over the
// first collapsePx of scroll (same --navbar-collapse lerp as the original),
// then gets out of the way — it slides up while you scroll down and comes
// back the moment you scroll up.
// Motion constants come from the lab panel sliders (useTuning) so they can be
// tuned live; bake the final numbers back in when porting to Questura.

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import { useEffect, useRef, useState } from "react";
import { useTuning } from "@lab/LabContext";

// Scroll past the collapse by this much before the bar is allowed to hide,
// so it never disappears while it is still visibly condensing.
const HIDE_AFTER_PX = 160;
// Ignore scroll jitter smaller than this when deciding direction.
const DIRECTION_SLOP_PX = 6;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

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

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < DIRECTION_SLOP_PX) return;
      lastY = y;
      setHidden(dy > 0 && y > tuningRef.current.collapsePx + HIDE_AFTER_PX);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <nav
      ref={navRef}
      data-hidden={hidden || undefined}
      className="sticky top-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] data-[hidden]:-translate-y-full motion-reduce:transition-none"
    >
      <div className="hidden 1024:block">
        <DesktopNavbar />
      </div>
      <div className="h-[55px] 1024:hidden">
        <MobileNavbar />
      </div>
    </nav>
  );
}
