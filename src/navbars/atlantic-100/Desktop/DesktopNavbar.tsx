import Link, { useAuth, useMembership } from "@lab/stubs";
import {
  AuthSlot,
  MenuIcon,
  Logo,
  SubscribeButton,
} from "../shared/components";

// Section row under the masthead. Folds away as --navbar-collapse → 1.
const SECTIONS = [
  { label: "Eat", href: "/eat" },
  { label: "Stay", href: "/stay" },
  { label: "Itineraries", href: "/itineraries" },
  { label: "Newsletters", href: "/newsletters" },
];

// Collapse progress at which the thin-bar links start coming in.
const LINKS_IN_FROM = 0.7;

interface DesktopNavbarProps {
  /** Fully collapsed: the section links show in the thin bar. */
  locked: boolean;
}

export default function DesktopNavbar({ locked }: DesktopNavbarProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div
      className="w-full border-b bg-[#F5F0E8]"
      style={{
        // One constant bottom rule. As the bar shrinks it rises over the
        // section row and eats it from the bottom up.
        borderBottomColor: "rgba(0, 0, 0, 0.14)",
        boxShadow:
          "0 1px 12px rgba(0, 0, 0, calc(var(--navbar-collapse, 0) * 0.06))",
      }}
    >
      <div
        className="w-full px-6"
        style={{
          // 28px (masthead) → 10px (thin bar).
          paddingTop: "calc(28px - var(--navbar-collapse, 0) * 18px)",
          paddingBottom: "calc(20px - var(--navbar-collapse, 0) * 10px)",
        }}
      >
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-8 justify-self-start">
            <MenuIcon iconClassName="!text-black h-6 w-6" />
            {/* The section links again, in the thin bar. Part of the scroll
                animation itself, not a timed fade: over the last 30% of the
                collapse they drop in from 8px above and fade up, landing
                exactly as the wordmark reaches its final size (and leaving
                the same way on the way back). Clickable once locked.
                Newsletters only fits beside the wordmark from 1280px. */}
            <ul
              inert={!locked}
              className={`flex items-center gap-6 font-[family-name:var(--font-dm-sans)] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#25292d] ${
                locked ? "" : "pointer-events-none"
              }`}
              style={{
                opacity: `calc((var(--navbar-collapse, 0) - ${LINKS_IN_FROM}) / ${1 - LINKS_IN_FROM})`,
                transform: `translateY(calc(clamp(0, (1 - var(--navbar-collapse, 0)) / ${1 - LINKS_IN_FROM}, 1) * -8px))`,
              }}
            >
              {SECTIONS.map((s) => (
                <li key={s.href} className={s.href === "/newsletters" ? "hidden 1280:list-item" : ""}>
                  <Link href={s.href} className="whitespace-nowrap hover:text-[#3B5BDB]">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/"
            data-no-hover-underline
            className="cursor-pointer justify-self-center"
          >
            <Logo />
          </Link>
          <div className="flex items-center justify-self-end gap-3">
            {(loading || shouldShowSubscribe) ? (
              <Link
                href="/join"
                className="nav-subscribe inline-flex items-center"
                data-pending={loading || undefined}
              >
                <SubscribeButton />
              </Link>
            ) : null}
            <AuthSlot
              loading={loading}
              isAuthenticated={isAuthenticated}
              isMember={isActive}
              signInClassName="!text-black"
              align="start"
            />
          </div>
        </div>
      </div>

      {/* Section row. A divider sits on top of it when the bar is fully
          expanded and fades out over the first 1/8 of the collapse, so by
          the time anything visibly moves only one rule is left: the bar's
          bottom rule, which climbs over the row as it shrinks from the
          bottom (links anchored to the top) and fades them as it covers
          them. Scroll-linked like everything else, so it comes back over
          the last 1/8 of the expand, in step with the wordmark. */}
      <div
        className="relative overflow-hidden"
        style={{
          height: "calc(44px - var(--navbar-collapse, 0) * 44px)",
          opacity: "calc(1 - var(--navbar-collapse, 0) * 1.5)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-black/[0.14]"
          style={{ opacity: "calc(1 - var(--navbar-collapse, 0) * 8)" }}
        />
        <ul className="flex h-[44px] items-center justify-center gap-8 px-6 font-[family-name:var(--font-dm-sans)] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#25292d]">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="hover:text-[#3B5BDB]">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
