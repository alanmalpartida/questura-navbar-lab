/**
 * Stand-ins for the Questura app pieces the navbar imports. Same shapes as the
 * real hooks/components, so porting a variant back means swapping these
 * imports for the real ones:
 *
 *   Link              -> @/components/navigation/PublicLink
 *   useAuth           -> @/lib/user/hooks
 *   useMembership     -> @/features/Payments/hooks/useMembership
 *   useMenuModalStore -> @/lib/stores/menuModalStore
 *   useUserModalStore -> @/lib/stores/userModalStore
 *   useLoginModalStore-> @/lib/stores/loginModalStore
 */
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useLab } from "./LabContext";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function Link({ onClick, ...rest }: LinkProps) {
  // Navigation is out of scope in the lab: links look and behave like links
  // but go nowhere.
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);
  };
  return <a {...rest} onClick={handle} />;
}

export function useAuth() {
  const { auth } = useLab();
  return {
    user: auth === "user" || auth === "member" ? { id: "lab-user", member: auth === "member" } : null,
    loading: auth === "loading",
    isAuthenticated: auth === "user" || auth === "member",
  };
}

export function useMembership(user: { member: boolean } | null) {
  return { isActive: Boolean(user?.member) };
}

const noop = () => {};
export const useMenuModalStore = () => ({ openMenuModal: noop });
export const useUserModalStore = () => ({ openUserModal: noop });
export function useLoginModalStore<T>(select: (s: { openLoginModal: () => void }) => T): T {
  return select({ openLoginModal: noop });
}
