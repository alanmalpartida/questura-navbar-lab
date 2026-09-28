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
      className="w-full border-b bg-[#faf7f2]"
      style={{
        // Hairline shows once the bar has condensed, the Atlantic tell that
        // you are now in the thin sticky header.
        borderBottomColor: "rgba(0, 0, 0, calc(var(--navbar-collapse, 0) * 0.14))",
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
            {/* The section links again, in the thin bar: they slide in once
                the bar has fully collapsed and out as soon as it expands.
                Newsletters only fits beside the wordmark from 1280px. */}
            <ul
              inert={!locked}
              className={`flex items-center gap-6 font-[family-name:var(--font-dm-sans)] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#25292d] transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                locked ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
              }`}
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

      {/* Section row: its height, opacity and rule all ride --navbar-collapse,
          so it folds shut while the wordmark shrinks. The rule above it runs
          edge to edge. */}
      <div
        className="overflow-hidden"
        style={{
          height: "calc(44px - var(--navbar-collapse, 0) * 44px)",
          opacity: "calc(1 - var(--navbar-collapse, 0) * 1.6)",
        }}
      >
        <ul className="flex h-[44px] items-center justify-center gap-8 border-t border-black/15 px-6 font-[family-name:var(--font-dm-sans)] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#25292d]">
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
