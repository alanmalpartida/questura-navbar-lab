import { ChevronDown } from "lucide-react";
import type { AuthMode } from "./LabContext";

/** Shared bits of lab chrome. Deliberately not Questurian-styled, so it never reads as part of a navbar. */

export const AUTH_MODES: { id: AuthMode; label: string }[] = [
  { id: "anon", label: "Anon" },
  { id: "user", label: "User" },
  { id: "member", label: "Member" },
  { id: "loading", label: "Loading" },
];

/**
 * Compact dropdown for the lab bars. Native <select> underneath, so it gets
 * the platform picker on phones and full keyboard support for free.
 */
export function Select<T extends string>({
  options,
  value,
  onChange,
  label,
  prefix,
  className = "",
}: {
  options: { id: T; label: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Accessible name. */
  label: string;
  /** Short dim label shown inside the control, e.g. "Auth". */
  prefix?: string;
  className?: string;
}) {
  const current = options.find((o) => o.id === value);
  return (
    <span
      title={current?.title}
      className={`relative flex shrink-0 items-center gap-1.5 rounded-md bg-white/[0.07] py-1.5 pl-2.5 pr-2 text-white hover:bg-white/[0.12] has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-white/50 ${className}`}
    >
      {prefix ? <span className="text-white/45">{prefix}</span> : null}
      <span className="whitespace-nowrap">{current?.label}</span>
      <ChevronDown aria-hidden className="h-3 w-3 text-white/50" />
      {/* The real control, invisible and covering the whole pill. */}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/15" />;
}

export const chromeText = "font-[family-name:var(--font-geist-mono)] text-[11px] leading-none";
