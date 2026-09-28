import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type AuthMode = "loading" | "anon" | "user" | "member";

export interface Tuning {
  /** Scroll distance (px) over which the navbar goes expanded → collapsed. */
  collapsePx: number;
  /** Lerp factor per frame. Lower = smoother / more lag. */
  lerp: number;
}

export const DEFAULT_TUNING: Tuning = { collapsePx: 120, lerp: 0.09 };

interface LabState {
  auth: AuthMode;
  setAuth: (a: AuthMode) => void;
  tuning: Tuning;
  setTuning: (t: Tuning) => void;
  showGuides: boolean;
  setShowGuides: (v: boolean) => void;
  /** True inside a compare-view iframe: no lab chrome, settings come from the URL. */
  embed: boolean;
}

const LabContext = createContext<LabState | null>(null);

const STORAGE_KEY = "navbar-lab:settings";
const params = new URLSearchParams(window.location.search);
const EMBED = params.get("embed") === "1";

function readStored(): Partial<{ auth: AuthMode; tuning: Tuning; showGuides: boolean }> {
  if (EMBED) {
    return {
      auth: (params.get("auth") as AuthMode) ?? undefined,
      tuning: {
        collapsePx: Number(params.get("collapse")) || DEFAULT_TUNING.collapsePx,
        lerp: Number(params.get("lerp")) || DEFAULT_TUNING.lerp,
      },
      showGuides: params.get("guides") === "1",
    };
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function LabProvider({ children }: { children: ReactNode }) {
  const stored = useMemo(readStored, []);
  const [auth, setAuth] = useState<AuthMode>(stored.auth ?? "anon");
  const [tuning, setTuning] = useState<Tuning>(stored.tuning ?? DEFAULT_TUNING);
  const [showGuides, setShowGuides] = useState(stored.showGuides ?? false);

  useEffect(() => {
    if (EMBED) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ auth, tuning, showGuides }));
    } catch {
      /* private mode etc. — settings just won't persist */
    }
  }, [auth, tuning, showGuides]);

  const value = { auth, setAuth, tuning, setTuning, showGuides, setShowGuides, embed: EMBED };
  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabState {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab must be used inside <LabProvider>");
  return ctx;
}

/** Live-tunable motion values from the lab panel. Remix variants read these. */
export function useTuning(): Tuning {
  return useLab().tuning;
}
