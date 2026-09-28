import type { ComponentType } from "react";
import type { VariantMeta } from "./types";

/**
 * Every folder under src/navbars/ with a Navbar.tsx is a variant. Its id is
 * the folder name; meta.ts (optional) gives it a display name and tab order.
 * Add one with `pnpm new-variant <name>`.
 */
const navbars = import.meta.glob<{ default: ComponentType }>("./*/Navbar.tsx", { eager: true });
const metas = import.meta.glob<{ default: VariantMeta }>("./*/meta.ts", { eager: true });

export interface Variant extends VariantMeta {
  id: string;
  Navbar: ComponentType;
}

export const variants: Variant[] = Object.entries(navbars)
  .map(([path, mod]) => {
    const id = path.split("/")[1];
    const meta = metas[`./${id}/meta.ts`]?.default ?? { name: id };
    return { id, ...meta, Navbar: mod.default };
  })
  .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.id.localeCompare(b.id));

export function findVariant(id: string | null | undefined): Variant {
  return variants.find((v) => v.id === id) ?? variants[0];
}

// Where "back" from the compare view returns to.
let lastViewed = variants[0]?.id;
export const rememberViewed = (id: string) => void (lastViewed = id);
export const lastViewedVariant = () => lastViewed;
