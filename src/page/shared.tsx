import type { ReactNode } from "react";

/** Gradient stand-ins for photography. Pick one by index. */
export const tones = [
  "linear-gradient(135deg,#c65d3b 0%,#d4a574 100%)", // 0 terracotta
  "linear-gradient(135deg,#2d4a3e 0%,#8aa38f 100%)", // 1 forest
  "linear-gradient(135deg,#3b5bdb 0%,#9db0f2 100%)", // 2 azulejo
  "linear-gradient(135deg,#25292d 0%,#6b6a68 100%)", // 3 slate
  "linear-gradient(135deg,#d4a574 0%,#f5f0e8 100%)", // 4 limestone
  "linear-gradient(135deg,#7a3b2e 0%,#c65d3b 100%)", // 5 roof tile
  "linear-gradient(160deg,#031522 0%,#3b5bdb 100%)", // 6 night
  "linear-gradient(170deg,#f5f0e8 0%,#d4a574 50%,#c65d3b 100%)", // 7 sunset
  "linear-gradient(135deg,#8aa38f 0%,#efe9de 100%)", // 8 sage
  "linear-gradient(135deg,#9db0f2 0%,#f5f0e8 100%)", // 9 river sky
];

export function Photo({ i, className = "", children }: { i: number; className?: string; children?: ReactNode }) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ background: tones[i % tones.length] }}
      aria-hidden={children ? undefined : true}
    >
      {children}
    </div>
  );
}

export function Kicker({ children, className = "text-accent" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </p>
  );
}
