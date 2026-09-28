import Link, { useAuth, useMembership } from "@lab/stubs";
import {
  AuthSlot,
  MenuIcon,
  Logo,
  SubscribeButton,
} from "../shared/components";

// Section links in the top bar. They share the row with the menu and the
// Subscribe button, so fewer fit on narrower screens.
const SECTIONS = [
  { label: "Neighbourhoods", href: "/neighbourhoods", className: "" },
  { label: "Eat", href: "/eat", className: "" },
  { label: "Stay", href: "/stay", className: "" },
  { label: "Itineraries", href: "/itineraries", className: "hidden 1280:list-item" },
  { label: "Culture", href: "/culture", className: "hidden 1280:list-item" },
  { label: "Maps", href: "/maps", className: "hidden 1536:list-item" },
  { label: "Newsletters", href: "/newsletters", className: "hidden 1536:list-item" },
];

export default function DesktopNavbar() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div className="w-full bg-[#faf7f2]">
      {/* Top bar: menu · sections · account */}
      <div className="border-b border-black/10 px-6">
        <div className="grid h-[60px] w-full grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="justify-self-start">
            <MenuIcon iconClassName="!text-black h-6 w-6" />
          </div>
          <ul className="flex items-center gap-6 font-[family-name:var(--font-dm-sans)] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#25292d]">
            {SECTIONS.map((s) => (
              <li key={s.href} className={s.className}>
                <Link href={s.href} className="whitespace-nowrap hover:text-[#3B5BDB]">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
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

      {/* Masthead: the full wordmark, under the bar. */}
      <div className="flex justify-center border-b border-black/10 px-6 pb-6 pt-7">
        <Link href="/" data-no-hover-underline className="cursor-pointer">
          <Logo className="text-[3.6rem] tracking-[-0.02em]" />
        </Link>
      </div>
    </div>
  );
}
