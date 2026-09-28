import Link from "@lab/stubs";

const SECTIONS = [
  { label: "Neighbourhoods", href: "/neighbourhoods" },
  { label: "Eat", href: "/eat" },
  { label: "Stay", href: "/stay" },
  { label: "Itineraries", href: "/itineraries" },
  { label: "Culture", href: "/culture" },
  { label: "Maps", href: "/maps" },
  { label: "Newsletters", href: "/newsletters" },
];

interface SectionNavProps {
  className?: string;
}

/**
 * Monocle-style section row: serif caps split by thin rules. Centred when it
 * fits; on narrow screens it scrolls sideways instead of wrapping.
 */
export default function SectionNav({ className = "" }: SectionNavProps) {
  return (
    <ul
      className={`flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden font-[family-name:var(--font-editorial-serif)] font-medium uppercase leading-none tracking-[0.03em] text-black ${className}`}
    >
      {SECTIONS.map((s, i) => (
        <li key={s.href} className={`shrink-0 px-3.5 ${i > 0 ? "border-l border-black" : "pl-0 1024:pl-3.5"} last:pr-0 1024:last:pr-3.5`}>
          <Link
            href={s.href}
            className="whitespace-nowrap underline-offset-4 hover:underline"
          >
            {s.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
