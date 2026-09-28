import Link, { useAuth, useMembership } from "@lab/stubs";
import { AuthSlot, Logo, MenuIcon, SectionNav, SubscribeButton } from "../shared/components";

interface MobileNavbarProps {
  /** True once the masthead is fully under the top bar: show the small logo. */
  compact: boolean;
}

// Keep in step with the top bar's h-[55px]: the section row pins right under it.
const TOP_BAR_PX = 55;

// Same three pieces as the desktop bar; see DesktopNavbar. The small logo sits
// beside the menu here: centred, it would collide with Subscribe on phones.
export default function MobileNavbar({ compact }: MobileNavbarProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <>
      <div data-nav="topbar" className="sticky top-0 z-40 bg-[#faf7f2] px-4">
        <div className="flex h-[55px] items-center justify-between gap-3 border-b border-black max-[379.98px]:gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MenuIcon
              buttonClassName="h-8 w-8 shrink-0"
              iconClassName="!text-black block h-5 w-5 translate-y-px"
            />
            <Link
              href="/"
              data-no-hover-underline
              aria-hidden={!compact}
              tabIndex={compact ? undefined : -1}
              className={`inline-flex min-w-0 cursor-pointer items-center transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                compact ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
              }`}
            >
              <Logo
                variant="inline"
                className="whitespace-nowrap text-[1.02rem] tracking-[0.06em] 480:text-[1.35rem]"
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
              signInClassName="!text-black h-8 inline-flex items-center leading-none text-[0.69rem]"
              userIconClassName="shrink-0"
            />
          </div>
        </div>
      </div>

      <div data-nav="masthead" className="bg-[#faf7f2] px-4">
        <div className="flex justify-center border-b border-black pb-4 pt-5">
          <Link href="/" data-no-hover-underline className="cursor-pointer">
            <Logo className="text-[2rem] tracking-[0.06em] 380:text-[2.4rem] 550:text-[3.4rem] 768:text-[4.4rem]" />
          </Link>
        </div>
      </div>

      <div
        data-nav="sections"
        className="sticky z-30 bg-[#faf7f2] px-4"
        style={{ top: TOP_BAR_PX }}
      >
        <nav aria-label="Sections" className="flex h-[42px] items-center border-b border-black 768:justify-center">
          <SectionNav className="text-[0.95rem]" />
        </nav>
      </div>
    </>
  );
}
