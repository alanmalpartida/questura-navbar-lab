import { User, ChevronDown } from "lucide-react";
import { useUserModalStore } from "@lab/stubs";

interface UserIconProps {
  buttonClassName?: string;
  isMember?: boolean;
}

// Member pill palette (light bar).
const GOLD_TEXT = "linear-gradient(100deg, #8a6420 0%, #c9982f 45%, #8f6a22 100%)";
const GOLD_RING = "conic-gradient(from 210deg, #8f6a22, #e8c877, #b8892f, #e8c877, #8f6a22)";
const MEDALLION = "radial-gradient(circle at 35% 30%, #2a47b8 0%, #14237a 45%, #05092e 100%)";

export default function UserIcon({ buttonClassName = "", isMember = false }: UserIconProps) {
  const { openUserModal } = useUserModalStore();

  if (isMember) {
    /* Member: same pill footprint, dressed up. A gold hairline and warm fill,
       a gold-ringed Q medallion, a small-caps MEMBER label in metallic gold,
       and a light sweep across the pill on hover. Members never see
       Subscribe, so the extra width here doesn't move anything. */
    return (
      <button
        onClick={openUserModal}
        className={`group inline-flex shrink-0 cursor-pointer items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1 ${buttonClassName}`}
        aria-label="Open member menu"
      >
        <span
          className="relative flex h-8 items-center gap-2 overflow-hidden rounded-full pl-[4px] pr-3 transition-[box-shadow,filter] duration-200 group-hover:brightness-[1.03] 480:h-10 480:gap-2.5 480:pl-[5px] 480:pr-3.5"
          style={{
            background: "linear-gradient(180deg, #fbf6ea 0%, #f1e6cf 100%)",
            boxShadow: "inset 0 0 0 1px rgba(176, 137, 62, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 1px 3px rgba(90, 64, 20, 0.14)",
          }}
        >
          {/* Medallion: navy Q inside a thin gold ring. */}
          <span
            className="relative flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full p-[1.5px] 480:h-[30px] 480:w-[30px]"
            style={{ background: GOLD_RING }}
          >
            <span
              className="flex h-full w-full items-center justify-center rounded-full"
              style={{ background: MEDALLION, boxShadow: "inset 0 1px 1px rgba(255,255,255,0.18)" }}
            >
              <span className="font-display text-[10px] font-semibold leading-none text-[#f3e2b3] 480:text-[12.5px]">
                Q
              </span>
            </span>
          </span>

          <span
            className="bg-clip-text font-[family-name:var(--font-dm-sans)] text-[9.5px] font-semibold uppercase leading-none tracking-[0.16em] text-transparent 480:text-[10.5px]"
            style={{ backgroundImage: GOLD_TEXT }}
          >
            Member
          </span>

          <ChevronDown
            aria-hidden
            strokeWidth={2.5}
            className="h-[9px] w-[9px] shrink-0 480:h-[10px] 480:w-[10px]"
            style={{ color: "rgba(143, 106, 34, 0.75)" }}
          />

          {/* Hover sheen: sweeps once on hover-in, resets instantly on leave. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full skew-x-[-20deg] transition-none group-hover:translate-x-[400%] group-hover:transition-transform group-hover:duration-700 group-hover:ease-out motion-reduce:hidden"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent)" }}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={openUserModal}
      className={`group inline-flex shrink-0 cursor-pointer items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-1 ${buttonClassName}`}
      aria-label="Open user menu"
    >
      <span className="flex h-8 items-center gap-2 rounded-full bg-[#e2ded8] pl-[5px] pr-3.5 transition-colors duration-150 group-hover:bg-[#d8d4cd] 480:h-10 480:pl-[6px] 480:pr-4">
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#f5f3ef] to-[#e0dcd6] ring-1 ring-black/[0.04] 480:h-[28px] 480:w-[28px]">
          <User
            aria-hidden
            strokeWidth={1.75}
            className="h-[9px] w-[9px] text-stone-900 480:h-[11px] 480:w-[11px]"
          />
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={2.5}
          className="h-[9px] w-[9px] shrink-0 text-stone-500/70 480:h-[10px] 480:w-[10px]"
        />
      </span>
    </button>
  );
}
