// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic 4: Atlantic 3's broken-rule header with a pixel globe as the mark.
//
//   1. Top: menu + section links on the left, account controls on the right,
//      a pixel globe centred across a hairline rule that stops short of it,
//      and a small "Questurian" wordmark underneath.
//   2. Scrolling: the globe, the menu and the section links scroll away with
//      the page. The wordmark keeps its size and rises into the bar; the
//      account controls travel with it and land beside it.
//   3. Locked: the menu and section links slide back down into the bar.
//
// Same scroll mechanics as Atlantic 3: the header is fixed with an in-flow
// spacer the height of its expanded state, and it shrinks by exactly the
// distance scrolled, so collapse is scrollY / --d with no lerp. The lab's
// motion sliders don't apply.
//
// All geometry is CSS variables set per breakpoint on the wrapper below, and
// everything is a calc() off --navbar-collapse:
//   --row    top-row height (its controls are centred in it)
//   --bar    locked bar height; also where the rule ends up
//   --line0  where the rule starts
//   --d      scroll distance to lock (spacer = --bar + --d)
//   --g      globe height; kept to whole multiples of its 32px pixel grid
//   --gy0    globe centre
//   --gfade  how fast the globe fades as it goes: on phones it passes the
//            account controls, so it is gone a quarter of the way in
//   --ty0    wordmark centre, expanded (locked centre is --bar / 2)
//   --fs     wordmark size, the same expanded and locked
//   --x1/tx1 wordmark position when locked: centred on desktop, beside the
//            menu on phones

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import Link from "@lab/stubs";
import { Logo, PixelGlobe } from "./shared/components";
import { useEffect, useRef, useState } from "react";

const c = "var(--navbar-collapse, 0)";

export default function Navbar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const root = document.documentElement.style;
    let d = 100;
    let rafId = 0;

    const readDistance = () => {
      const el = wrapRef.current;
      if (el) d = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || d;
    };

    const update = () => {
      rafId = 0;
      const collapse = Math.min(1, Math.max(0, window.scrollY / d));
      root.setProperty("--navbar-collapse", String(collapse));
      root.setProperty("--navbar-height", `${navRef.current?.offsetHeight ?? 0}px`);
      setLocked(collapse === 1);
    };

    const schedule = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };
    const onResize = () => {
      readDistance();
      schedule();
    };

    readDistance();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="
        [--row:64px] [--bar:55px] [--line0:110px] [--d:109px]
        [--g:64px] [--gy0:90px] [--gfade:4] [--ty0:141px] [--fs:1.02rem]
        [--x1:56px] [--tx1:50%]
        480:[--fs:1.35rem] 480:[--ty0:144px] 480:[--d:115px]
        1024:[--row:112px] 1024:[--bar:64px] 1024:[--line0:118px] 1024:[--d:136px]
        1024:[--g:96px] 1024:[--gy0:88px] 1024:[--gfade:0] 1024:[--ty0:166px] 1024:[--fs:1.9rem]
        1024:[--x1:50%] 1024:[--tx1:0%]
        1280:[--row:120px] 1280:[--line0:138px] 1280:[--d:164px]
        1280:[--g:128px] 1280:[--gy0:100px] 1280:[--ty0:194px]
      "
    >
      {/* Holds the expanded header's place in the page. */}
      <div aria-hidden style={{ height: "calc(var(--bar) + var(--d))" }} />

      <nav
        ref={navRef}
        className="fixed inset-x-0 top-0 z-40 overflow-hidden bg-[#F5F0E8]"
        style={{ height: `calc(var(--bar) + var(--d) * (1 - ${c}))` }}
      >
        <div className="hidden 1024:contents">
          <DesktopNavbar locked={locked} />
        </div>
        <div className="contents 1024:hidden">
          <MobileNavbar locked={locked} />
        </div>

        {/* The rule: starts through the globe, ends under the locked bar. */}
        <div
          aria-hidden
          className="absolute inset-x-0 h-px bg-black/45"
          style={{ top: `calc(var(--line0) - ${c} * (var(--line0) - var(--bar)) - 1px)` }}
        />

        {/* The globe scrolls away with the page, clearing the top edge exactly
            as the bar locks (on desktop --d is set so that is page speed).
            Its page-coloured padding is what breaks the rule either side of
            it. The wordmark below is the home link for keyboards and screen
            readers, so this one is not. */}
        <Link
          href="/"
          aria-hidden
          tabIndex={-1}
          data-no-hover-underline
          className="absolute left-1/2 z-10 cursor-pointer bg-[#F5F0E8] px-[calc(var(--g)*0.12)]"
          style={{
            top: `calc(var(--gy0) - ${c} * (var(--gy0) + var(--g) / 2))`,
            transform: "translate(-50%, -50%)",
            opacity: `max(0, 1 - ${c} * var(--gfade))`,
          }}
        >
          <PixelGlobe className="h-[var(--g)] w-auto" />
        </Link>

        {/* The wordmark keeps its size and rises into the bar. Its padding
            breaks the rule as it passes through it. */}
        <Link
          href="/"
          data-no-hover-underline
          className="absolute z-10 cursor-pointer whitespace-nowrap bg-[#F5F0E8] px-[0.3em] leading-none"
          style={{
            top: `calc(var(--ty0) - ${c} * (var(--ty0) - var(--bar) / 2))`,
            left: `calc((1 - ${c}) * 50% + ${c} * var(--x1))`,
            transform: `translate(calc(-50% + ${c} * var(--tx1)), -50%)`,
            fontSize: "var(--fs)",
            letterSpacing: "-0.01em",
          }}
        >
          <Logo />
        </Link>
      </nav>
    </div>
  );
}
