# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project owns

Two things, and they must always be in sync:

1. **`cockpit.ahk`** -- the AutoHotkey v2 numpad command deck. Every key binding, the header diagram, and the ritual functions (Cleanse, Relayout) live here.
2. **`src/App.jsx`** -- the Muscle Memory web app, which is the visual reference for the same bindings.

The canonical data in the app is `SEED_SHORTCUTS` (the array at the top of `App.jsx`). The canonical visual map is `NUMPAD_LAYOUT` (just below it). Both must reflect exactly what `cockpit.ahk` declares.

## Sync rules

**When making AHK changes:**
1. Edit the hotkey binding in the `HOTKEYS` section.
2. Update the header diagram comment at the top of the file.
3. Update the matching entry in `SEED_SHORTCUTS` and, if the key label or hint changes, `NUMPAD_LAYOUT` in `App.jsx`.

**When making Muscle Memory app changes:**
1. Edit `SEED_SHORTCUTS` and/or `NUMPAD_LAYOUT` in `App.jsx`.
2. Check whether the corresponding AHK binding needs updating.

**Never make partial changes.** Both files must agree with each other before any commit.

## After any change to `src/`

> Run `wrangler deploy` from this folder to push the app live.

## Commands

```
npm run dev      # Vite dev server at localhost:5173
npm run build    # builds to ./dist (required before wrangler deploy)
npx wrangler deploy  # ships ./dist to Cloudflare as a static Worker
```

No test runner is configured. Verify changes in the browser via `npm run dev`.

## Architecture

This is a single-file React app. There is no API, no backend, and no build-time data pipeline.

**Data layer:** `SEED_SHORTCUTS` in `App.jsx` is the source of truth for deployment. User edits are persisted to `localStorage` under the key `one-all-over.vault.v1`, but the seed array is what gets deployed. Resetting the vault restores from `SEED_SHORTCUTS`.

**Numpad widget:** `NUMPAD_LAYOUT` drives the rendered keyboard grid. Each entry has a `match` field that must equal the `keys[0]` value of the corresponding `SEED_SHORTCUTS` entry for hover/pin highlighting to work.

**Deployment:** `wrangler.toml` configures Cloudflare Workers static asset serving from `./dist`. There is no Pages project -- it deploys as a Worker. Build first (`npm run build`), then deploy.

**AHK config block:** The `gURLs` and `gApps` maps at the top of `cockpit.ahk` are the only place app targets are defined. `gSplit` controls the ultrawide thirds ratio. `FindMonitors()` auto-detects the widest landscape monitor as `gMonUltra` and routes all snapping there.
