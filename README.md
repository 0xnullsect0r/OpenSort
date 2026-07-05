# OpenSort

A nuts-and-bolts color sorting puzzle game, in the "Water Sort" family: tap a
screw, tap another, and the topmost run of same-colored nuts slides across if
it fits. Sort every screw to a single color to win.

OpenSort is a single self-contained website — no backend, no accounts, no
ads, no in-app purchases. Progress is saved locally in your browser.

## Run it

The whole game runs from one command:

```sh
docker compose up --build
```

Then open **http://localhost:8080**.

## Develop

```sh
npm install
npm run dev        # dev server with hot reload
npm test           # unit tests (vitest)
npm run e2e        # end-to-end tests (playwright)
npm run typecheck
npm run build       # production build to dist/
npm run generate-levels   # regenerate public/levels/levels.json
```

## How it's built

- **Game logic** (`src/game-core/`) is framework-free TypeScript: the
  screw/nut/board model, move legality rules, a BFS solver, and the
  relaxed-shuffle-then-solver-verify level generator. It has no dependency on
  the DOM, so it's unit-tested directly with Vitest.
- **UI** (`src/ui/`) is plain TypeScript + DOM/CSS — no framework. Tapping a
  screw selects it; tapping another attempts the move.
- **Levels** are generated offline (`scripts/generate-levels.ts`) and shipped
  as a static `public/levels/levels.json`, so nothing is computed at runtime
  except hints and the daily challenge (which runs the solver in a Web Worker
  so it never blocks the UI thread).
- **Accessibility**: every nut color also has a distinct glyph, since color
  is never the only signal a player needs (toggle "always on" in Settings).
- **PWA**: installable to a home screen on iOS/Android via the web manifest
  and service worker, for an app-like experience without an app store.
- **No monetization**: no ads SDK, no IAP, no analytics — by design, not by
  omission.

## Testing

- `npm test` — unit tests for the game engine, solver, level generator, and
  services. Includes a content-validation gate that re-solves every bundled
  level to guarantee nothing unsolvable ever ships.
- `npm run e2e` — Playwright tests covering the tap-to-move flow, invalid-move
  feedback, undo, and a full level solve computed via the real solver.
