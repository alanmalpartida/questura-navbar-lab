// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic Q: links bar on top, full wordmark below. The whole masthead
// scrolls away with the page while the wordmark fades out over the first
// collapsePx (same --navbar-collapse lerp as the original). Once it is fully
// gone, and after a short beat with no bar at all, a slim bar holding just
// the Q slides down and stays until the masthead is back in view.
// Motion constants come from the lab panel sliders (useTuning) so they can be
// tuned live; bake the final numbers back in when porting to Questura.

import Link from "@lab/stubs";
import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import { LogoMark } from "./shared/components";
import { useEffect, useRef, useState } from "react";
import { useTuning } from "@lab/LabContext";

// Scroll this far past the bottom of the masthead before the Q bar comes in:
// the "gone for a moment" beat. It leaves again as soon as any of the
// masthead is back on screen.
const COMPACT_GAP_PX = 80;

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);

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

  // Show the Q bar once the masthead is fully scrolled off (plus the gap).
  useEffect(() => {
    const onScroll = () => {
      const h = navRef.current?.offsetHeight ?? 0;
      const y = window.scrollY;
      setCompact((was) => (was ? y >= h : y > h + COMPACT_GAP_PX));
    };
    onScroll();
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
    <>
      {/* In normal flow, not sticky: it scrolls away with the page. */}
      <nav ref={navRef} className="relative z-40">
        <div className="hidden 1024:block">
          <DesktopNavbar />
        </div>
        <div className="1024:hidden">
          <MobileNavbar />
        </div>
      </nav>

      <div
        data-shown={compact || undefined}
        aria-hidden={!compact}
        className="group fixed inset-x-0 top-0 z-40 flex h-[48px] -translate-y-full items-center justify-center border-b border-black/10 bg-[#faf7f2]/95 backdrop-blur transition-[transform,box-shadow] data-[shown]:shadow-[0_1px_12px_rgba(0,0,0,0.06)] duration-[450ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] data-[shown]:translate-y-0 motion-reduce:transition-none 1024:h-[54px]"
      >
        <Link
          href="/"
          data-no-hover-underline
          tabIndex={compact ? undefined : -1}
          className="cursor-pointer scale-75 opacity-0 transition-[opacity,transform] duration-300 delay-150 ease-out group-data-[shown]:scale-100 group-data-[shown]:opacity-100 motion-reduce:transition-none"
        >
          <LogoMark className="text-[1.7rem] 1024:text-[1.95rem]" />
        </Link>
      </div>
    </>
  );
}
