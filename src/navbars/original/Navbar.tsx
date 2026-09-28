// Copied verbatim from questura client: features/Navigation/Navbar.tsx
// (primeIdentity() dropped: the lab has no session request.)
// THIS IS THE REFERENCE. Leave it alone; remix in a copied folder instead.

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import { useEffect, useRef } from "react";

// Scroll distance over which the navbar goes from expanded to collapsed. It is
// read off the real scroll position: the navbar never consumes input to
// animate itself, so the page moves at full speed from the first flick (#589).
const COLLAPSE_PX = 120;

// Lerp factor: how fast the rendered value chases the target each frame.
// Lower = smoother / more lag. 0.09 gives a nice trailing feel.
const LERP = 0.09;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const collapseFromScroll = () =>
      Math.min(1, Math.max(0, window.scrollY / COLLAPSE_PX));

    let rafId = 0;
    let targetVal = collapseFromScroll();
    let currentVal = targetVal;

    const tick = () => {
      currentVal += (targetVal - currentVal) * LERP;
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
        <DesktopNavbar />
      </div>
      <div className="h-[55px] 1024:hidden">
        <MobileNavbar />
      </div>
    </nav>
  );
}
