import type { ReactNode } from "react";
import type { AuthMode } from "./LabContext";

/** Shared bits of lab chrome. Deliberately not Questurian-styled, so it never reads as part of a navbar. */

export const AUTH_MODES: { id: AuthMode; label: string }[] = [
  { id: "anon", label: "Anon" },
  { id: "user", label: "User" },
  { id: "member", label: "Member" },
  { id: "loading", label: "Loading" },
];

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 gap-0.5 rounded-lg bg-white/[0.06] p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 transition-colors ${
            value === o.id ? "bg-white text-[#16181b]" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/15" />;
}

export const chromeText = "font-[family-name:var(--font-geist-mono)] text-[11px] leading-none";
