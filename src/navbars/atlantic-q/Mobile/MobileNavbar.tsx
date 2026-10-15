import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, Logo, MenuIcon, SubscribeButton } from "../shared/components";

export default function MobileNavbar() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <div className="w-full bg-[#faf7f2]">
      {/* Top bar: menu · account */}
      <div className="h-[55px] min-h-[55px] w-full border-b border-black/10 px-4">
        <div className="flex h-[55px] items-center justify-between gap-3 max-[379.98px]:gap-2.5">
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
              userIconClassName="shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="flex justify-center border-b border-black/10 px-4 pb-4 pt-5">
        <Link href="/" data-no-hover-underline className="cursor-pointer">
          <Logo className="text-[2.2rem] tracking-[-0.02em] 480:text-[2.6rem]" />
        </Link>
      </div>
    </div>
  );
}
