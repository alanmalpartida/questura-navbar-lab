import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, Logo, MenuIcon, SubscribeButton } from "../shared/components";

export default function MobileNavbar() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <nav className="h-[55px] min-h-[55px] w-full border-b border-white/10 bg-[#16181b] px-4 py-0">
      <div className="flex h-[55px] min-h-[55px] items-center justify-between gap-3 max-[379.98px]:gap-2.5">
        <div className="flex min-h-8 min-w-0 flex-1 items-center gap-2 max-[379.98px]:gap-2.5">
          <MenuIcon
            buttonClassName="h-8 w-8 shrink-0"
            iconClassName="!text-[#F5F0E8] block h-5 w-5 translate-y-px"
          />
          <Link
            href="/"
            data-no-hover-underline
            className="inline-flex min-w-0 cursor-pointer items-center self-center"
          >
            <Logo
              variant="inline"
              className="whitespace-nowrap font-bold leading-none text-[1.2rem] tracking-[-0.01em] 480:text-[1.5rem]"
            />
          </Link>
        </div>

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
            signInClassName="!text-[#F5F0E8] h-8 inline-flex items-center leading-none text-[0.69rem]"
            userIconClassName="shrink-0"
          />
        </div>
      </div>
    </nav>
  );
}
