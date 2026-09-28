// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic 3, modelled on theatlantic.com's homepage header:
//
//   1. Top: a row of links / account controls, and a big wordmark centred
//      across a hairline rule that stops short of it on both sides.
//   2. Scrolling: the top row scrolls away with the page, the wordmark
//      shrinks, and the rule rises until it sits under the small wordmark,
//      where the bar locks.
//   3. Locked: the controls fade into the small bar.
//
// The header is fixed with an in-flow spacer the height of its expanded
// state, and it shrinks by exactly the distance scrolled. So its bottom edge
// moves with the page until it locks, and nothing slides at a different speed
// from the content. For the same reason there is no lerp: collapse is
// scrollY / --d, frame-exact. The lab's motion sliders don't apply.
//
// All geometry is CSS variables set per breakpoint on the wrapper below, and
// everything is a calc() off --navbar-collapse:
//   --row    top-row height (its controls are centred in it)
//   --bar    locked bar height; also where the rule ends up
//   --line0  where the rule starts
//   --d      scroll distance to lock (spacer = --bar + --d)
//   --f0/f1  wordmark size, expanded / locked
//   --cy0    wordmark centre, expanded; a little above --line0 so the rule
//            points at the body of the letters (locked centre is --bar / 2)
//   --x1/tx1 wordmark position when locked: centred on desktop, beside the
//            menu on phones

import DesktopNavbar from "./Desktop/DesktopNavbar";
import MobileNavbar from "./Mobile/MobileNavbar";
import Link from "@lab/stubs";
import { Logo } from "./shared/components";
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
        [--row:55px] [--bar:55px] [--line0:84px] [--d:77px]
        [--f0:2.1rem] [--f1:1.02rem] [--cy0:78px]
        [--x1:56px] [--tx1:50%]
        380:[--f0:2.5rem] 480:[--f1:1.35rem]
        1024:[--row:100px] 1024:[--bar:64px] 1024:[--line0:108px] 1024:[--d:124px]
        1024:[--f0:4.25rem] 1024:[--f1:1.9rem] 1024:[--cy0:100px]
        1024:[--x1:50%] 1024:[--tx1:0%]
        1280:[--f0:5.25rem]
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

        {/* The rule: starts through the wordmark, ends under the locked bar. */}
        <div
          aria-hidden
          className="absolute inset-x-0 h-px bg-black/45"
          style={{ top: `calc(var(--line0) - ${c} * (var(--line0) - var(--bar)) - 1px)` }}
        />

        {/* The wordmark. Its page-coloured padding is what breaks the rule
            either side of it; the padding scales with the type. */}
        <Link
          href="/"
          data-no-hover-underline
          className="absolute z-10 cursor-pointer whitespace-nowrap bg-[#F5F0E8] px-[0.3em] leading-none"
          style={{
            top: `calc(var(--cy0) - ${c} * (var(--cy0) - var(--bar) / 2))`,
            left: `calc((1 - ${c}) * 50% + ${c} * var(--x1))`,
            transform: `translate(calc(-50% + ${c} * var(--tx1)), -50%)`,
            fontSize: `calc(var(--f0) - ${c} * (var(--f0) - var(--f1)))`,
            letterSpacing: "-0.01em",
          }}
        >
          <Logo />
        </Link>
      </nav>
    </div>
  );
}
