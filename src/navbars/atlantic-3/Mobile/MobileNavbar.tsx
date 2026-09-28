import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, MenuIcon, SubscribeButton } from "../shared/components";

interface MobileNavbarProps {
  /** Header fully collapsed: the controls show in the small bar. */
  locked: boolean;
}

// Same two-copies setup as DesktopNavbar. No section links on phones; in the
// locked bar the wordmark lands beside the menu instead (Navbar.tsx --x1).
export default function MobileNavbar({ locked }: MobileNavbarProps) {
  return (
    <>
      <div
        inert={locked}
        className="absolute inset-x-0 top-0 h-[var(--row)] px-4"
        style={{ transform: "translateY(calc(var(--navbar-collapse, 0) * -1 * var(--d)))" }}
      >
        <Controls />
      </div>
      <div
        inert={!locked}
        className={`absolute inset-x-0 top-0 h-[var(--bar)] px-4 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
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
    <div className="flex h-full items-center justify-between gap-3 max-[379.98px]:gap-2.5">
      <MenuIcon
        buttonClassName="h-8 w-8 shrink-0"
        iconClassName="!text-black block h-5 w-5 translate-y-px"
      />
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
    </div>
  );
}
