// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic 4: Atlantic 3's broken-rule header with a pixel globe as the mark.
//
//   1. Top: menu + section links on the left, account controls on the right,
//      a pixel globe centred across a hairline rule that stops short of it,
//      and a small "Questurian" wordmark underneath.
//   2. Scrolling: the globe, the menu and the section links scroll away with
//      the page. The wordmark keeps its size and rises into the bar; the
//      account controls travel with it and land beside it. The gap in the
//      rule never closes on the way: it eases from the globe's width to the
//      wordmark's while the one hands over to the other, holds while the
//      wordmark passes through the rule, then seals once it is above it.
//   3. Locked: the menu and section links slide back down into the bar.
//
// Same scroll mechanics as Atlantic 3: the header is fixed with an in-flow
// spacer the height of its expanded state, and it shrinks by exactly the
// distance scrolled, so collapse is scrollY / --d with no lerp. The lab's
// motion sliders don't apply.
//
// The rule is the one piece placed from JS (--rule-y, --gap-l, --gap-r on
// the nav): its gap follows two elements in turn, and it is snapped to whole
// pixels so a 1px line never smears across two rows mid-scroll.
//
// All geometry is CSS variables set per breakpoint on the wrapper below, and
// everything is a calc() off --navbar-collapse:
//   --row    top-row height (its controls are centred in it)
//   --bar    locked bar height; also where the rule ends up
//   --d      scroll distance to lock (spacer = --bar + --d)
//   --g      globe height; kept to whole multiples of its 32px pixel grid
//   --gy0    globe centre; the rule starts here, through the middle of the disc
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

/** The rule's gap around the globe, as a multiple of its height (= the
 *  disc's diameter): the disc plus a little air either side. The clouds
 *  overhang it and sit over the rule. */
const GLOBE_GAP = 1.12;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export default function Navbar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const root = document.documentElement.style;
    let d = 100;
    let geo = { g: 64, gy0: 90, ty0: 141, bar: 55 };
    let rafId = 0;

    const readGeometry = () => {
      const el = wrapRef.current;
      if (!el) return;
      const css = getComputedStyle(el);
      const px = (name: string, fallback: number) =>
        parseFloat(css.getPropertyValue(name)) || fallback;
      d = px("--d", d);
      geo = { g: px("--g", geo.g), gy0: px("--gy0", geo.gy0), ty0: px("--ty0", geo.ty0), bar: px("--bar", geo.bar) };
    };

    const update = () => {
      rafId = 0;
      const collapse = Math.min(1, Math.max(0, window.scrollY / d));
      root.setProperty("--navbar-collapse", String(collapse));
      root.setProperty("--navbar-height", `${navRef.current?.offsetHeight ?? 0}px`);
      placeRule(collapse);
      setLocked(collapse === 1);
    };

    // Everything moves linearly in collapse, so the hand-over points can be
    // solved for directly:
    //   cGlobe  the globe's bottom edge rises past the rule
    //   cIn     the wordmark's top edge reaches the rule
    //   cOut    the wordmark's bottom edge clears it
    // Gap: globe-wide until cGlobe, eases to the wordmark's box by cIn, holds
    // to cOut, then closes on the wordmark's centre by the time the bar locks.
    const placeRule = (collapse: number) => {
      const nav = navRef.current;
      const mark = markRef.current;
      if (!nav || !mark) return;
      const { g, gy0, ty0, bar } = geo;

      const ruleY = Math.round(gy0 - collapse * (gy0 - bar));
      const th = mark.offsetHeight;
      const rate = ty0 - gy0 + bar / 2; // wordmark's speed relative to the rule
      const cGlobe = g / 2 / (g / 2 + bar);
      const cIn = (ty0 - th / 2 - gy0) / rate;
      const cOut = (ty0 + th / 2 - gy0) / rate;

      const mid = nav.clientWidth / 2;
      const half = g * GLOBE_GAP / 2;
      const box = mark.getBoundingClientRect();
      const centre = (box.left + box.right) / 2;

      const toMark = ease((collapse - cGlobe) / Math.max(cIn - cGlobe, 1e-6));
      const seal = ease((collapse - cOut) / Math.max(1 - cOut, 1e-6));
      let left = lerp(mid - half, box.left, toMark);
      let right = lerp(mid + half, box.right, toMark);
      left = lerp(left, centre, seal);
      right = lerp(right, centre, seal);

      nav.style.setProperty("--rule-y", `${ruleY - 1}px`);
      nav.style.setProperty("--gap-l", `${Math.round(left)}px`);
      nav.style.setProperty("--gap-r", `${Math.round(right)}px`);
    };

    const schedule = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };
    const onResize = () => {
      readGeometry();
      schedule();
    };

    readGeometry();
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
        [--row:64px] [--bar:55px] [--d:109px]
        [--g:64px] [--gy0:90px] [--gfade:4] [--ty0:141px] [--fs:1.02rem]
        [--x1:56px] [--tx1:50%]
        480:[--fs:1.35rem] 480:[--ty0:144px] 480:[--d:115px]
        1024:[--row:112px] 1024:[--bar:64px] 1024:[--d:136px]
        1024:[--g:96px] 1024:[--gy0:88px] 1024:[--gfade:0] 1024:[--ty0:166px] 1024:[--fs:1.9rem]
        1024:[--x1:50%] 1024:[--tx1:0%]
        1280:[--row:120px] 1280:[--d:164px]
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

        {/* The rule: starts through the globe's centre, ends under the locked
            bar. Two segments either side of the gap placed by placeRule();
            the fallbacks are its resting state, for the frame before it runs. */}
        <div
          aria-hidden
          className="absolute left-0 h-px bg-black/45"
          style={{
            top: "var(--rule-y, calc(var(--gy0) - 1px))",
            width: `var(--gap-l, calc(50% - var(--g) * ${GLOBE_GAP / 2}))`,
          }}
        />
        <div
          aria-hidden
          className="absolute right-0 h-px bg-black/45"
          style={{
            top: "var(--rule-y, calc(var(--gy0) - 1px))",
            left: `var(--gap-r, calc(50% + var(--g) * ${GLOBE_GAP / 2}))`,
          }}
        />

        {/* The globe scrolls away with the page, clearing the top edge exactly
            as the bar locks (on desktop --d is set so that is page speed).
            The wordmark below is the home link for keyboards and screen
            readers, so this one is not. */}
        <Link
          href="/"
          aria-hidden
          tabIndex={-1}
          data-no-hover-underline
          className="absolute left-1/2 z-10 cursor-pointer"
          style={{
            top: `calc(var(--gy0) - ${c} * (var(--gy0) + var(--g) / 2))`,
            transform: "translate(-50%, -50%)",
            opacity: `max(0, 1 - ${c} * var(--gfade))`,
          }}
        >
          <PixelGlobe className="h-[var(--g)] w-auto" />
        </Link>

        {/* The wordmark keeps its size and rises into the bar. Its padding is
            the breathing room either side of it in the rule's gap. */}
        <div
          ref={markRef}
          className="absolute z-10 whitespace-nowrap px-[0.3em] leading-none"
          style={{
            top: `calc(var(--ty0) - ${c} * (var(--ty0) - var(--bar) / 2))`,
            left: `calc((1 - ${c}) * 50% + ${c} * var(--x1))`,
            transform: `translate(calc(-50% + ${c} * var(--tx1)), -50%)`,
            fontSize: "var(--fs)",
            letterSpacing: "-0.01em",
          }}
        >
          <Link href="/" data-no-hover-underline className="cursor-pointer">
            <Logo />
          </Link>
        </div>
      </nav>
    </div>
  );
}
