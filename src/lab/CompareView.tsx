import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Link2, Link2Off } from "lucide-react";
import { useLab } from "./LabContext";
import { AUTH_MODES, Divider, Segmented, chromeText } from "./ui";
import { lastViewedVariant, variants } from "../navbars/registry";

/**
 * Every variant at once, each in its own iframe so each gets its own scroll
 * position, its own --navbar-* variables and its own media queries (a
 * phone-width frame really renders the mobile navbar).
 */

const WIDTHS = [
  { id: "1440", label: "Desktop 1440" },
  { id: "1024", label: "Laptop 1024" },
  { id: "768", label: "Tablet 768" },
  { id: "390", label: "Phone 390" },
] as const;
type WidthId = (typeof WIDTHS)[number]["id"];

const MIN_SCALE = 0.4;
const GAP = 16;

export default function CompareView() {
  const { auth, setAuth, tuning, showGuides } = useLab();
  const [width, setWidth] = useState<WidthId>("1440");
  const [shown, setShown] = useState<string[]>(() => variants.map((v) => v.id));
  const [sync, setSync] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Measure now; the observer's first report can lag a frame (or never come
    // in a background tab), which would render every frame at MIN_SCALE.
    const cs = getComputedStyle(el);
    setStage({
      w: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      h: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
    });
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const frameW = Number(width);
  const cols = variants.filter((v) => shown.includes(v.id));
  const fitW = (stage.w - GAP * Math.max(0, cols.length - 1)) / Math.max(1, cols.length);
  const scale = Math.min(1, Math.max(MIN_SCALE, fitW / frameW));
  const labelH = 28;
  const frameH = Math.max(0, (stage.h - labelH) / scale);

  const query = new URLSearchParams({
    embed: "1",
    auth,
    collapse: String(tuning.collapsePx),
    lerp: String(tuning.lerp),
    guides: showGuides ? "1" : "0",
  }).toString();

  const frames = useScrollSync(sync);

  return (
    <div className={`${chromeText} flex h-dvh flex-col bg-[#0e0f11] text-white`}>
      <header className="flex shrink-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] border-b border-white/10 p-2">
        <button
          onClick={() => (window.location.hash = lastViewedVariant() ?? "")}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Single view
        </button>
        <Divider />
        <Segmented label="Frame width" options={[...WIDTHS]} value={width} onChange={setWidth} />
        <Divider />
        <Segmented label="Auth state" options={AUTH_MODES} value={auth} onChange={setAuth} />
        <Divider />
        <button
          onClick={() => setSync((s) => !s)}
          aria-pressed={sync}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 ${
            sync ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
          }`}
          title="Scroll one frame, the others follow"
        >
          {sync ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />} Sync scroll
        </button>
        <Divider />
        {variants.map((v) => (
          <label key={v.id} className="flex shrink-0 cursor-pointer items-center gap-1.5 px-2 py-1.5 text-white/80">
            <input
              type="checkbox"
              checked={shown.includes(v.id)}
              onChange={(e) =>
                setShown((s) => (e.target.checked ? [...s, v.id] : s.filter((id) => id !== v.id)))
              }
            />
            {v.name}
          </label>
        ))}
      </header>

      <div ref={stageRef} className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex h-full" style={{ gap: GAP }}>
          {cols.map((v) => (
            <section key={v.id} className="flex h-full shrink-0 flex-col" style={{ width: frameW * scale }}>
              <div className="flex items-center justify-between text-white/60" style={{ height: labelH }}>
                <a href={`#${v.id}`} className="text-white hover:underline">
                  {v.name}
                </a>
                <span>
                  {frameW}px · {Math.round(scale * 100)}%
                </span>
              </div>
              <div className="relative flex-1 overflow-hidden rounded-md bg-[#F5F0E8]">
                <iframe
                  ref={frames.register(v.id)}
                  title={v.name}
                  src={`${window.location.pathname}?${query}#${v.id}`}
                  className="absolute left-0 top-0 origin-top-left border-0"
                  style={{ width: frameW, height: frameH, transform: `scale(${scale})` }}
                />
              </div>
            </section>
          ))}
          {cols.length === 0 ? <p className="m-auto text-white/50">Pick at least one variant above.</p> : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Mirrors scroll position across same-origin iframes. A frame we just moved
 * reports that scroll back to us; `expected` tells those echoes apart from a
 * real scroll so the frames don't fight.
 */
function useScrollSync(enabled: boolean) {
  const frames = useRef(new Map<string, HTMLIFrameElement>());
  const expected = useRef(new Map<string, number>());
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const listeners = useRef(new Map<string, () => void>());

  const attach = (id: string, el: HTMLIFrameElement) => {
    const hook = () => {
      listeners.current.get(id)?.();
      const win = el.contentWindow;
      if (!win) return;
      const onScroll = () => {
        const y = win.scrollY;
        const exp = expected.current.get(id);
        if (exp !== undefined && Math.abs(exp - y) < 2) {
          expected.current.delete(id);
          return;
        }
        if (!enabledRef.current) return;
        for (const [other, frame] of frames.current) {
          if (other === id || !frame.contentWindow) continue;
          expected.current.set(other, y);
          frame.contentWindow.scrollTo(0, y);
        }
      };
      win.addEventListener("scroll", onScroll, { passive: true });
      listeners.current.set(id, () => win.removeEventListener("scroll", onScroll));
    };
    el.addEventListener("load", hook);
    if (el.contentDocument?.readyState === "complete") hook();
  };

  useEffect(() => () => listeners.current.forEach((off) => off()), []);

  // One stable ref callback per id, so React doesn't detach/reattach every render.
  const refs = useRef(new Map<string, (el: HTMLIFrameElement | null) => void>());
  const register = (id: string) => {
    let ref = refs.current.get(id);
    if (!ref) {
      ref = (el) => {
        if (el) {
          frames.current.set(id, el);
          attach(id, el);
        } else {
          frames.current.delete(id);
          listeners.current.get(id)?.();
          listeners.current.delete(id);
        }
      };
      refs.current.set(id, ref);
    }
    return ref;
  };

  return { register };
}
