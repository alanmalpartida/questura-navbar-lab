import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, MenuIcon, SubscribeButton } from "../shared/components";

const SECTIONS = [
  { label: "Eat", href: "/eat" },
  { label: "Stay", href: "/stay" },
  { label: "Itineraries", href: "/itineraries" },
];

const c = "var(--navbar-collapse, 0)";

interface DesktopNavbarProps {
  /** Header fully collapsed: the menu and sections slide into the small bar. */
  locked: boolean;
}

/**
 * The menu and section links, twice: in the top row, which scrolls away with
 * the page (and the globe), and in the locked bar, where they slide back down
 * once the header has fully collapsed. The account controls are a single copy
 * that rides down with the header from the top row into the bar, level with
 * the wordmark the whole way. The globe, wordmark and rule live in Navbar.tsx;
 * geometry comes from its CSS vars.
 */
export default function DesktopNavbar({ locked }: DesktopNavbarProps) {
  return (
    <>
      <div
        inert={locked}
        className="absolute left-0 top-0 h-[var(--row)] px-6"
        style={{ transform: `translateY(calc(${c} * -1 * var(--d)))` }}
      >
        <Sections />
      </div>
      <div
        inert={!locked}
        className={`absolute left-0 top-0 h-[var(--bar)] px-6 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none ${
          locked ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <Sections />
      </div>
      <div
        className="absolute right-0 z-20 px-6"
        style={{
          top: `calc(var(--row) / 2 - ${c} * (var(--row) - var(--bar)) / 2)`,
          transform: "translateY(-50%)",
        }}
      >
        <Account />
      </div>
    </>
  );
}

function Sections() {
  return (
    <div className="flex h-full items-center gap-8">
      <MenuIcon iconClassName="!text-black h-6 w-6" />
      <ul className="flex items-center gap-8 font-[family-name:var(--font-dm-sans)] text-[0.92rem] text-black">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="whitespace-nowrap hover:underline underline-offset-4">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Account() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div className="flex items-center gap-3">
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
  );
}
