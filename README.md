# Questura Navbar Lab

A sandbox for remixing the [Questurian](https://github.com/Questurian/questura) navbar: its look, and the
expanded → thin transition as you scroll. When a design wins, it gets ported back into
`apps/client/src/features/Navigation/` on a Questura branch.

**Live:** https://alanmalpartida.github.io/questura-navbar-lab/

## Run it

```bash
pnpm install
pnpm dev
```

## How it's laid out

```
src/navbars/
  original/     exact copy of the live navbar. Reference only, don't edit.
  remix-a/      first remix: same code, motion wired to the lab sliders
  <your-id>/    every folder with a Navbar.tsx becomes a tab automatically
src/lab/        lab chrome (tab bar, compare view, tuning) + stubs for app pieces
src/page/       the long fake city page the navbar scrolls over
```

Each variant folder mirrors Questura's `features/Navigation/` layout (`Navbar.tsx`, `Desktop/`, `Mobile/`,
`shared/components/`), so porting back means copying the folder over and swapping the `@lab/stubs` imports
for the real ones (the mapping is listed at the top of `src/lab/stubs.tsx`).

## New variant

```bash
pnpm new-variant remix-b                     # copies remix-a
pnpm new-variant glass --from original --name "Glass"
```

## Using the lab

- **Tabs** at the bottom switch variants. Each has its own URL (`#remix-a`), so you can open several browser tabs.
- **Compare** shows every variant side by side in iframes at Desktop / Laptop / Tablet / Phone widths.
  Sync scroll mirrors one frame's scroll to the others, so you can watch the transitions together.
- **Auth** switches between Anon / User / Member / Loading, which change the right-hand controls.
- **Tune** has live sliders for collapse distance and lerp smoothing (variants that call `useTuning()`),
  a guide line marking where the collapse finishes, and a live readout of `--navbar-collapse`.
- Keys: `1`–`9` variants, `C` compare, `G` guide, `H` hide the lab bar.

## How the collapse works (same as Questura)

`Navbar.tsx` maps `scrollY / collapsePx` to a 0→1 target and lerps a rendered value toward it each frame,
writing it to `--navbar-collapse` on `<html>`. Everything else (padding, logo size, letter-spacing) is a
`calc()` off that variable, so any element can join the transition without new JS.
