
interface LogoProps {
  className?: string;
  subtitle?: string;
  subtitleClassName?: string;
  /** Use in toolbars: single line, no centered block wrapper (pairs cleanly with icons). */
  variant?: "default" | "inline";
}

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
        style={
          isInline
            ? undefined
            : {
                // The wordmark doesn't shrink here: it rides away with the
                // masthead and fades as --navbar-collapse goes 0 → 1, handing
                // over to the Q in the compact bar (Navbar.tsx).
                opacity: "calc(1 - var(--navbar-collapse, 0))",
                transform: "scale(calc(1 - var(--navbar-collapse, 0) * 0.06))",
              }
        }
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
