import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, MenuIcon, SubscribeButton } from "../shared/components";

const c = "var(--navbar-collapse, 0)";

interface MobileNavbarProps {
  /** Header fully collapsed: the menu slides into the small bar. */
  locked: boolean;
}

// Same setup as DesktopNavbar, with the menu alone on the left: no section
// links on phones. In the locked bar the wordmark lands beside the menu
// (Navbar.tsx --x1).
export default function MobileNavbar({ locked }: MobileNavbarProps) {
  return (
    <>
      <div
        inert={locked}
        className="absolute left-0 top-0 h-[var(--row)] px-4"
        style={{ transform: `translateY(calc(${c} * -1 * var(--d)))` }}
      >
        <Menu />
      </div>
      <div
        inert={!locked}
        className={`absolute left-0 top-0 h-[var(--bar)] px-4 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none ${
          locked ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <Menu />
      </div>
      <div
        className="absolute right-0 z-20 px-4"
        style={{
          top: `max(var(--bar) / 2, var(--row) / 2 - ${c} * var(--d))`,
          transform: "translateY(-50%)",
        }}
      >
        <Account />
      </div>
    </>
  );
}

function Menu() {
  return (
    <div className="flex h-full items-center">
      <MenuIcon
        buttonClassName="h-8 w-8 shrink-0"
        iconClassName="!text-black block h-5 w-5 translate-y-px"
      />
    </div>
  );
}

function Account() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div className="flex shrink-0 items-center gap-2 max-[379.98px]:gap-2.5">
      {(loading || shouldShowSubscribe) ? (
        <Link
          href="/join"
          className="nav-subscribe flex h-8 items-center max-[379.98px]:h-auto"
          data-pending={loading || undefined}
        >
          <SubscribeButton />
        </Link>
      ) : null}
      <AuthSlot
        loading={loading}
        isAuthenticated={isAuthenticated}
        isMember={isActive}
        signInClassName="!text-black h-8 inline-flex items-center leading-none text-[0.69rem]"
        align="start"
        userIconClassName="shrink-0"
      />
    </div>
  );
}
