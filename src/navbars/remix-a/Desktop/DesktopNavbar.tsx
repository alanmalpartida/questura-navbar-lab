import Link, { useAuth, useMembership } from "@lab/stubs";
import {
  AuthSlot,
  MenuIcon,
  Logo,
  SubscribeButton,
} from "../shared/components";

// Section row under the masthead. Folds away as --navbar-collapse → 1.
const SECTIONS = [
  { label: "Neighbourhoods", href: "/neighbourhoods" },
  { label: "Eat", href: "/eat" },
  { label: "Stay", href: "/stay" },
  { label: "Itineraries", href: "/itineraries" },
  { label: "Culture", href: "/culture" },
  { label: "Maps", href: "/maps" },
  { label: "Newsletters", href: "/newsletters" },
];

export default function DesktopNavbar() {
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
          <div className="justify-self-start">
            <MenuIcon iconClassName="!text-black h-6 w-6" />
          </div>
          <Link
            href="/"
            data-no-hover-underline
            className="cursor-pointer justify-self-center"
          >
            <Logo />
          </Link>
          <div className="flex items-center justify-self-end gap-4">
            <AuthSlot
              loading={loading}
              isAuthenticated={isAuthenticated}
              isMember={isActive}
              signInClassName="!text-black"
            />
            {(loading || shouldShowSubscribe) ? (
              <Link
                href="/join"
                className="nav-subscribe inline-flex items-center"
                data-pending={loading || undefined}
              >
                <SubscribeButton />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Section row: its height, opacity and rule all ride --navbar-collapse,
          so it folds shut while the wordmark shrinks. */}
      <div
        className="overflow-hidden px-6"
        style={{
          height: "calc(44px - var(--navbar-collapse, 0) * 44px)",
          opacity: "calc(1 - var(--navbar-collapse, 0) * 1.6)",
        }}
      >
        <ul className="mx-auto flex h-[44px] max-w-[1100px] items-center justify-center gap-8 border-t border-black/15 font-[family-name:var(--font-dm-sans)] text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#25292d]">
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
