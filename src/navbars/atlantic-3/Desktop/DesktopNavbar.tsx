import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, MenuIcon, SubscribeButton } from "../shared/components";

const SECTIONS = [
  { label: "Eat", href: "/eat" },
  { label: "Stay", href: "/stay" },
  { label: "Itineraries", href: "/itineraries" },
];

interface DesktopNavbarProps {
  /** Header fully collapsed: the controls show in the small bar. */
  locked: boolean;
}

/**
 * The controls, twice: in the top row, which scrolls away with the page, and
 * in the locked bar, where they fade in once the header has fully collapsed.
 * The wordmark and rule live in Navbar.tsx; geometry comes from its CSS vars.
 */
export default function DesktopNavbar({ locked }: DesktopNavbarProps) {
  return (
    <>
      <div
        inert={locked}
        className="absolute inset-x-0 top-0 h-[var(--row)] px-6"
        style={{ transform: "translateY(calc(var(--navbar-collapse, 0) * -1 * var(--d)))" }}
      >
        <Controls />
      </div>
      <div
        inert={!locked}
        className={`absolute inset-x-0 top-0 h-[var(--bar)] px-6 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          locked ? "opacity-100" : "opacity-0"
        }`}
      >
        <Controls />
      </div>
    </>
  );
}

function Controls() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div className="flex h-full items-center justify-between">
      <div className="flex items-center gap-8">
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
      <div className="flex items-center gap-4">
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
  );
}
