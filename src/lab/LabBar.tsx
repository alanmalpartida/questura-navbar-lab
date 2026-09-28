import { useEffect, useState } from "react";
import { Columns3, Eye, EyeOff, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { DEFAULT_TUNING, useLab } from "./LabContext";
import { AUTH_MODES, Divider, Select, chromeText } from "./ui";
import { variants } from "../navbars/registry";

const HIDDEN_KEY = "navbar-lab:bar-hidden";

function readHidden() {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

export default function LabBar({ current }: { current: string }) {
  const { auth, setAuth, showGuides, setShowGuides } = useLab();
  const [hidden, setHidden] = useState(readHidden);
  const [tuneOpen, setTuneOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [hidden]);

  // 1–9 switch variants, C compare, G guides, H hide/show the bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "range") return;
      const n = Number(e.key);
      if (n >= 1 && n <= variants.length) window.location.hash = variants[n - 1].id;
      else if (e.key === "c") window.location.hash = "compare";
      else if (e.key === "g") setShowGuides(!showGuides);
      else if (e.key === "h") setHidden((h) => !h);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGuides, setShowGuides]);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className={`${chromeText} fixed bottom-4 right-4 z-50 flex cursor-pointer items-center gap-1.5 rounded-full bg-[#16181b] px-3 py-2 text-white shadow-lg`}
        aria-label="Show lab bar"
      >
        <Eye className="h-3.5 w-3.5" /> Lab
      </button>
    );
  }

  return (
    <div className={`${chromeText} fixed inset-x-2 bottom-3 z-50 flex flex-col items-center gap-2`}>
      {tuneOpen ? <TunePanel onClose={() => setTuneOpen(false)} /> : null}

      <div className="flex max-w-full items-center gap-1 overflow-x-auto [scrollbar-width:none] rounded-xl bg-[#16181b]/95 p-1.5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur">
        <Select
          label="Navbar variant"
          options={variants.map((v, i) => ({ id: v.id, label: `${i + 1} ${v.name}`, title: v.description }))}
          value={current}
          onChange={(id) => (window.location.hash = id)}
        />
        <Select label="Auth state" prefix="Auth" options={AUTH_MODES} value={auth} onChange={setAuth} />
        <Divider />
        <button
          onClick={() => (window.location.hash = "compare")}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          title="Compare two variants side by side (C)"
        >
          <Columns3 className="h-3.5 w-3.5" /> <span className="max-[479.98px]:sr-only">Compare</span>
        </button>
        <button
          onClick={() => setTuneOpen((o) => !o)}
          aria-pressed={tuneOpen}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 ${
            tuneOpen ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
          title="Motion tuning"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> <span className="max-[479.98px]:sr-only">Tune</span>
        </button>
        <button
          onClick={() => setHidden(true)}
          className="shrink-0 cursor-pointer rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Hide lab bar (H)"
          title="Hide (H)"
        >
          <EyeOff className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function TunePanel({ onClose }: { onClose: () => void }) {
  const { tuning, setTuning, showGuides, setShowGuides } = useLab();
  const live = useLiveReadout();
  return (
    <div className="w-[min(340px,100%)] rounded-xl bg-[#16181b]/95 p-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="uppercase tracking-[0.14em] text-white/50">Motion</span>
        <div className="flex gap-1">
          <button
            onClick={() => setTuning(DEFAULT_TUNING)}
            className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-white/60 hover:bg-white/10 hover:text-white"
            title="Reset to Questura's values"
          >
            <RotateCcw className="h-3 w-3" /> reset
          </button>
          <button onClick={onClose} className="cursor-pointer rounded p-1 text-white/60 hover:bg-white/10" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Slider
        label="Collapse distance"
        value={tuning.collapsePx}
        display={`${tuning.collapsePx}px`}
        min={20}
        max={800}
        step={10}
        onChange={(collapsePx) => setTuning({ ...tuning, collapsePx })}
      />
      <Slider
        label="Lerp (smoothing)"
        value={tuning.lerp}
        display={tuning.lerp.toFixed(2)}
        min={0.02}
        max={1}
        step={0.01}
        onChange={(lerp) => setTuning({ ...tuning, lerp })}
      />
      <p className="mb-3 mt-1 text-white/40">
        Sliders drive variants that read useTuning(). Original stays locked at 120px / 0.09.
      </p>

      <label className="flex cursor-pointer items-center gap-2 py-1">
        <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
        Show collapse guide (G)
      </label>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
        <Stat label="scrollY" value={`${live.scrollY}`} />
        <Stat label="collapse" value={live.collapse} />
        <Stat label="nav height" value={live.height} />
      </dl>
    </div>
  );
}

function Slider(props: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 flex justify-between">
        <span className="text-white/70">{props.label}</span>
        <span>{props.display}</span>
      </span>
      <input
        type="range"
        className="w-full accent-[#3B5BDB]"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/40">{label}</dt>
      <dd className="mt-1 text-[13px]">{value}</dd>
    </div>
  );
}

/** Reads the navbar's CSS variables every frame while mounted. */
function useLiveReadout() {
  const [s, set] = useState({ scrollY: 0, collapse: "0.000", height: "—" });
  useEffect(() => {
    let id = 0;
    const loop = () => {
      const root = document.documentElement.style;
      const c = Number(root.getPropertyValue("--navbar-collapse") || 0);
      set({
        scrollY: Math.round(window.scrollY),
        collapse: c.toFixed(3),
        height: root.getPropertyValue("--navbar-height") || "—",
      });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
  return s;
}
