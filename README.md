# CraftPace

A pixel-accurate, browser-based **Minecraft inventory & crafting trainer** for speedrunners. Drill the
overworld craft routes (buried-treasure loot, iron tools, boat + bucket + doors) with faithful Minecraft
inventory mechanics, full hotkeys + remapping, custom challenges, replays, and optional cloud leaderboards.

See [PRD.md](PRD.md) for the full product spec.

## Features

- **Faithful inventory engine** — left/right click, shift-click quick-move (with Minecraft's exact ordering),
  shift-craft-max, double-click gather, left/right/middle drag distribution, number-key hotbar swaps, Q / Ctrl+Q
  drop, F off-hand, and instant-smelt. Fully unit-tested.
- **Crafting + furnace GUIs** — 2x2 inventory grid, 3x3 crafting table, furnace, and chest, with shaped/shapeless/
  tag-based recipes.
- **WebGL renderer (PixiJS)** — coalesced 60 FPS rendering with object pools; placeholder textures generated from
  item metadata (drop an open-license Faithful-style atlas into `/assets` to swap them in).
- **Full keybinds + remapping** — every inventory-relevant control, multiple profiles, conflict detection,
  import/export. Mouse / Shift / Ctrl are fixed exactly as in Minecraft.
- **Challenges** — built-in BT loot, iron tools, boat+bucket+doors, inventory sort, and full overworld craft, with a
  millisecond timer, splits, scoring, and personal bests.
- **Challenge builder** — a large creative-style block palette, drag-to-fill setup editor, goal/splits config, and
  share-via-URL.
- **Replays + history** — every completed attempt is recorded (input timeline) to IndexedDB with trends and replay
  playback.
- **Multi-version** — ships 1.16.1 (MCSR standard) and 1.21, architected via per-version data + behavior flags.
- **Optional Firebase** — accounts, cloud settings sync, global leaderboards (with anti-cheat rules), and analytics.
  The app is fully functional offline without it.
- **Accessibility** — adjustable GUI scale, high-contrast theme, and reduced-motion.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the engine/data/challenge test suite
npm run build    # type-check + production build
```

## Optional: Firebase (accounts, leaderboards, sync, analytics)

Copy `.env.example` to `.env.local` and fill in your Firebase web-app config. Deploy the included
`firestore.rules`. Without this, all local features still work.

## Architecture

```
engine/   Pure, framework-agnostic simulation (no React/Pixi). Unit-tested parity matrix.
data/     Versioned item/recipe/smelting/loot/preset data (1.16.1, 1.21).
src/
  render/      PixiJS WebGL GUI renderer + slot geometry + texture cache.
  input/       Keybind profiles, remapping store, and keyboard handler.
  challenges/  Goal evaluation, built-in challenges, timing/scoring store, custom challenges.
  recorder/    Attempt timeline + replay.
  firebase/    Lazy-loaded auth, leaderboard, sync, analytics (optional).
  components/   Canvas, item sprites, setup editor, challenge panel, auth.
  pages/        Practice, Builder, Leaderboard, Keybinds, History.
```

The data flow is: input → keybind mapper → pure engine → game state store → renderer / UI / attempt recorder.

## Assets & licensing

This project ships **programmatic placeholder sprites** generated from item colors — no Mojang textures are
included. To use real textures, add an open/CC-licensed (Faithful-style) atlas under `/assets` and update
`src/render/textures.ts` to read `def.texture`.
