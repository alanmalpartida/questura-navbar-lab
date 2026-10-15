
interface LogoMarkProps {
  className?: string;
}

/** The single-letter mark for tight spaces: the compact bar, avatars, favicons. */
export default function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <span
      role="img"
      aria-label="Questurian"
      className={`block font-display font-bold leading-none text-[#16181b] ${className}`}
    >
      Q
    </span>
  );
}
