// Remix of questura client: features/Navigation/Navbar.tsx
// Atlantic 4: Atlantic 3's broken-rule header with a pixel globe as the mark.
//
//   1. Top: menu + section links on the left, account controls on the right,
//      a pixel globe centred across a hairline rule that stops short of it,
//      and a small "Questurian" wordmark underneath.
//   2. Scrolling: the rule moves with the page until it reaches the bottom
//      of the bar, then stays there. The globe, the menu and the section
//      links scroll away; the wordmark keeps its size and rises through the
//      rule into the bar. The account controls move up with the page until
//      they are centred in the bar, ahead of the rule, and stay. The gap
//      in the rule never closes on the way: it clears the whole globe
//      drawing (clouds included), eases to the wordmark's width as the one
//      hands over to the other, holds while the wordmark passes through,
//      then seals once it is above the rule.
//   3. Locked: the menu and section links slide back down into the bar.
//
// Same scroll mechanics as Atlantic 3: the header is fixed with an in-flow
// spacer the height of its expanded state, and it shrinks by exactly the
// distance scrolled, so collapse is scrollY / --d with no lerp. The lab's
// motion sliders don't apply.
//
// The rule is the one piece placed from JS (--rule-y, --rule-h, --gap-l,
// --gap-r on the nav): its gap follows two elements in turn. A hairline that
// creeps slowly across the screen flickers thick/thin wherever CSS pixels
// don't land on device pixels (browser zoom, scaled displays), so it never
// creeps: it moves 1:1 with the page, like any line in the content, then
// parks. Its position and thickness are also snapped to device pixels.
//
// All geometry is CSS variables set per breakpoint on the wrapper below, and
// everything is a calc() off --navbar-collapse:
//   --row    top-row height (its controls are centred in it)
//   --bar    locked bar height; also where the rule parks
//   --d      scroll distance to lock (spacer = --bar + --d)
//   --g      globe height; a multiple of its 32-row pixel grid that lands on
//            whole device pixels at 2x
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
import { Logo, PIXEL_GLOBE_ASPECT, PixelGlobe } from "./shared/components";
import { useEffect, useRef, useState } from "react";

const c = "var(--navbar-collapse, 0)";

/** The rule's gap around the globe, as a multiple of its height: the whole
 *  drawing, clouds included, plus a little air either side. */
const GLOBE_GAP = PIXEL_GLOBE_ASPECT + 0.16;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** First collapse in 0..1 at which f goes from positive to <= 0 (f is
 *  positive while the edge is still below the rule). */
const crossing = (f: (k: number) => number) => {
  if (f(0) <= 0) return 0;
  if (f(1) > 0) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  return hi;
};
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

    // Hand-over points, each the collapse at which an edge meets the rule:
    //   cGlobe  the globe's bottom edge rises past it
    //   cIn     the wordmark's top edge reaches it
    //   cOut    the wordmark's bottom edge clears it
    // Gap: globe-wide until cGlobe, eases to the wordmark's box by cIn, holds
    // to cOut, then closes on the wordmark's centre by the time the bar locks.
    const placeRule = (collapse: number) => {
      const nav = navRef.current;
      const mark = markRef.current;
      if (!nav || !mark) return;
      const { g, gy0, ty0, bar } = geo;
      const dpr = window.devicePixelRatio || 1;
      const snap = (v: number) => Math.round(v * dpr) / dpr;

      const ruleAt = (k: number) => Math.max(bar, gy0 - k * d);
      const th = mark.offsetHeight;
      const markY = (k: number) => ty0 - k * (ty0 - bar / 2);
      const cGlobe = crossing((k) => gy0 + g / 2 - k * (gy0 + g / 2) - ruleAt(k));
      const cIn = crossing((k) => markY(k) - th / 2 - ruleAt(k));
      const cOut = crossing((k) => markY(k) + th / 2 - ruleAt(k));

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

      // One device pixel at 1x, two at 2x: 1 CSS px wherever that is whole.
      const h = Math.max(1, Math.round(dpr)) / dpr;
      nav.style.setProperty("--rule-h", `${h}px`);
      nav.style.setProperty("--rule-y", `${snap(ruleAt(collapse)) - h}px`);
      nav.style.setProperty("--gap-l", `${Math.floor(left * dpr) / dpr}px`);
      nav.style.setProperty("--gap-r", `${Math.ceil(right * dpr) / dpr}px`);
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
        [--row:64px] [--bar:55px] [--d:129px]
        [--g:80px] [--gy0:100px] [--gfade:4] [--ty0:160px] [--fs:1.2rem]
        [--x1:56px] [--tx1:50%]
        480:[--fs:1.55rem] 480:[--ty0:162px] 480:[--d:135px]
        1024:[--row:112px] 1024:[--bar:64px] 1024:[--d:164px]
        1024:[--g:128px] 1024:[--gy0:94px] 1024:[--gfade:0] 1024:[--ty0:190px] 1024:[--fs:2.3rem]
        1024:[--x1:50%] 1024:[--tx1:0%]
        1280:[--row:120px] 1280:[--d:196px]
        1280:[--g:160px] 1280:[--gy0:108px] 1280:[--ty0:220px]
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

        {/* The rule: starts through the globe's centre, parks under the locked
            bar. Two segments either side of the gap placed by placeRule();
            the fallbacks are its resting state, for the frame before it runs. */}
        <div
          aria-hidden
          className="absolute left-0 h-[var(--rule-h,1px)] bg-black/45"
          style={{
            top: "var(--rule-y, calc(var(--gy0) - 1px))",
            width: `var(--gap-l, calc(50% - var(--g) * ${GLOBE_GAP / 2}))`,
          }}
        />
        <div
          aria-hidden
          className="absolute right-0 h-[var(--rule-h,1px)] bg-black/45"
          style={{
            top: "var(--rule-y, calc(var(--gy0) - 1px))",
            left: `var(--gap-r, calc(50% + var(--g) * ${GLOBE_GAP / 2}))`,
          }}
        />

        {/* The globe scrolls away with the page, clearing the top edge exactly
            as the bar locks (--d is set so that is close to page speed).
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
          className="absolute z-10 whitespace-nowrap px-[0.4em] leading-none"
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
