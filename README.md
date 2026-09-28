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

### Auto-pull while a cloud session works

```bash
pnpm dev:sync            # dev server + pulls the current branch every 4s
pnpm dev:sync --latest   # also jumps to the newest claude/* branch (each cloud session makes its own)
```

Anything pushed from a Claude cloud session shows up in the open browser tab within a few seconds;
Vite hot-reloads it. If `package.json` or the lockfile changed it reinstalls and restarts the server.
It only ever fast-forwards: local edits or local commits in the way make it pause and tell you,
never overwrite. `--interval <s>` and `--port <n>` are optional.

## How it's laid out

```
src/navbars/
  original/     exact copy of the live navbar. Reference only, don't edit.
  remix-a/      first remix: same code, motion wired to the lab sliders
  atlantic/     Atlantic-style masthead: condenses to a thin bar, hides on scroll down
  atlantic-q/   Atlantic remix: links bar above the wordmark; scrolls away, then a Q-only bar slides in
  atlantic-2/   Monocle-style: big wordmark scrolls under a pinned top bar, small one fades in once covered
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
