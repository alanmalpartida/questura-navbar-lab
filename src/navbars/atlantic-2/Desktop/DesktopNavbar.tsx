import Link, { useAuth, useMembership } from "@lab/stubs";
import {
  AuthSlot,
  MenuIcon,
  Logo,
  SectionNav,
  SubscribeButton,
} from "../shared/components";

interface DesktopNavbarProps {
  /** True once the masthead is fully under the top bar: show the small logo. */
  compact: boolean;
}

// Keep in step with the top bar's h-[64px]: the section row pins right under it.
const TOP_BAR_PX = 64;

/**
 * Three stacked pieces, returned as siblings so each can be sticky against
 * the whole page:
 *   top bar   — pinned at the top, always
 *   masthead  — normal flow; scrolls up underneath the top bar
 *   sections  — pins right under the top bar once it gets there
 */
export default function DesktopNavbar({ compact }: DesktopNavbarProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const { isActive } = useMembership(user);
  const shouldShowSubscribe = !isAuthenticated || !isActive;

  return (
    <>
      <div data-nav="topbar" className="sticky top-0 z-40 bg-[#faf7f2] px-4">
        <div className="grid h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-black">
          <div className="justify-self-start">
            <MenuIcon iconClassName="!text-black h-6 w-6" />
          </div>
          {/* Small logo: only fades in after the big one is fully covered. */}
          <Link
            href="/"
            data-no-hover-underline
            aria-hidden={!compact}
            tabIndex={compact ? undefined : -1}
            className={`cursor-pointer transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
              compact ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
            }`}
          >
            <Logo className="text-[1.95rem] tracking-[0.08em]" />
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

      <div data-nav="masthead" className="bg-[#faf7f2] px-4">
        <div className="flex justify-center border-b border-black pb-5 pt-6">
          <Link href="/" data-no-hover-underline className="cursor-pointer">
            <Logo className="text-[5.6rem] tracking-[0.06em]" />
          </Link>
        </div>
      </div>

      <div
        data-nav="sections"
        className="sticky z-30 bg-[#faf7f2] px-4"
        style={{ top: TOP_BAR_PX }}
      >
        <nav aria-label="Sections" className="flex h-[46px] items-center justify-center border-b border-black">
          <SectionNav className="text-[1.02rem]" />
        </nav>
      </div>
    </>
  );
}
