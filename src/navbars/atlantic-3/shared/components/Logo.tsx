
interface LogoProps {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
  /** Use in toolbars: single line, no centered block wrapper (pairs cleanly with icons). */
  variant?: "default" | "inline";
}

/**
 * Title-case serif wordmark. It has no size of its own: it inherits
 * font-size from its parent, which in this variant is driven by scroll.
 */
export default function Logo({
  className = "",
  subtitle = "",
  subtitleClassName = "",
  variant = "default",
}: LogoProps) {
  const isInline = variant === "inline";
  const wrapClass = isInline ? "inline-flex min-w-0 items-center" : "text-center";

  return (
    <div className={wrapClass}>
      {/* The wordmark is a link home, not a heading. It renders in the desktop
          navbar, the mobile navbar and the footer at once, so an <h1> here put
          three "Questurian" headings on every page ahead of the real one. A
          page gets its single <h1> from its own content. */}
      <span
        className={`
          block font-display text-[#16181b] font-bold leading-none m-0 p-0
          ${isInline ? "text-left" : ""}
          ${className}
        `}
      >
        Questurian
      </span>
      {subtitle ? (
        <p
          className={`
            font-display italic text-[#6b6a68] mt-1
            text-[0.82rem]
            550:text-[0.95rem]
            1024:text-[1.4rem]
            ${subtitleClassName}
          `}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
