# Questura Navbar Lab

Sandbox for remixing the Questurian navbar. Read README.md first.

- Never edit `src/navbars/original/`. It is the reference copy of the live navbar.
- New design idea → `pnpm new-variant <id>` and work in that folder; don't pile ideas into one variant.
- Keep each variant's folder layout matching Questura's `features/Navigation/` so it ports back cleanly.
- App dependencies (auth, stores, Link) come from `@lab/stubs`, never real network calls.
- Verify with `pnpm build` (typecheck + bundle). Pushing to `main` deploys to GitHub Pages.
