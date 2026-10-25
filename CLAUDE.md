# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static, hand-written marketing site for LIMONI Boutique Hotel (Phú Quốc), served at `limoniboutiquehotel.com` (see `CNAME`; looks intended for GitHub Pages). No framework, no bundler in actual use, no tests, not a git repo. Content is Vietnamese-first with a full English mirror.

## Running

Open `index.html` in a browser, or serve the folder statically (e.g. `python3 -m http.server`). Pages use relative paths, so keep `assets/`, `en/`, `styles.css`, `script.js`, `rooms-data*.js` side by side.

## Build scripts are stale

`package.json` defines `pnpm build` (clean-css, terser, html-minifier, sharp → `docs/`), but it references `css/style.css`, `js/script.js`, `scripts/optimize-images.js` and `assets/img/dist`, none of which exist (the real files are `styles.css`/`script.js` at the root). The build will fail as-is; the site is currently shipped unbuilt. It also only minifies `index.html`. Don't assume `docs/` output exists; fix the paths first if a build is needed.

## Architecture

- **Pages**: `index`, `about`, `rooms`, `anfora`, `contact`, `offer` `.html` in the root (Vietnamese, `<html lang="vi">`), and the same six in `en/` (`lang="en"`, assets referenced via `../`). **Every change to a page must be made in both the root and `en/` copies**; they are separate full files, not generated from a template. Each page carries `hreflang` alternates and a VN/ENG switch in the menu panel.
- **`styles.css`** (~140KB): single shared stylesheet for all pages.
- **`script.js`** (~54KB): single shared script, one IIFE-style module per feature, loaded on every page; each feature guards on its DOM existing. Language is derived from `document.documentElement.lang` into `LIMONI_EN`, and UI strings use `T(vi, en)` — use this for any string added in JS.
- **Rooms data**: `rooms-data.js` (VI) and `rooms-data-en.js` (EN) each define `window.LIMONI_ROOMS` (20 "Love Archive" rooms: id, name, couple, story, floor/room, type, plan, photos). Only pages that render rooms (`index`, `rooms`, `contact`) include them; EN pages include the `-en` file. Edit both files together. `#phong-<id>` URLs open a room popup directly (logic in `script.js`).
- **Page transitions**: a curtain effect uses `sessionStorage['limoni-pt']`, an inline `html.pt-enter` style in each page `<head>`, and a `<meta name="limoni-heroes">` JSON map (page → hero image) that is duplicated in every page's head. Adding or renaming a page or hero image means updating that meta tag in all 12 files.
- **Assets**: `assets/` holds page imagery; `assets/rooms/{art,plans,types}` holds per-room images referenced from the rooms data.
