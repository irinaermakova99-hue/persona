# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal-brand site for Irina Ermakova (business events / business education, Minsk, brand "Ermakova Business Events"), plus the Russian-language source texts it is written from. There is no build system, package manager, tests, linter, or git repo: the site is plain static HTML. To preview, open `index.html` in a browser (or `python3 -m http.server` in this directory).

## Structure

- `index.html` and `index-brand.html` — two self-contained single-page variants (inline `<style>`, no scripts, no external deps). They are near-identical copies: `index-brand.html` only adds a `.brand` CSS rule and a `<div class="brand">Ermakova Business Events</div>` line in the hero. Any content or style change must be applied to **both** files by hand, or the variants drift.
- `images/` — all photos, referenced by relative path (`images/*.jpg`) from the HTML. Alt text is in Russian.
- `profile.md`, `про-меня.md`, `проекты.md`, `факты.md` — first-person source copy (bio, projects/assets, verified facts). `profile.md` is the most recently updated and most complete. The page text is derived from these; they are not rendered by anything.

Page sections in order (anchor ids): hero → `#approach` → `#formats` → `#experience` → `#work` → `#facts` → `#personal` → `#contact`. Theming is via CSS variables in `:root` (`--accent`, `--accent-2`, etc.).

## Conventions

- All user-facing copy is in Russian, written in the first person ("Я…"). Keep that voice and language when editing.
- Facts (years, audience sizes, revenue, speaker names, employers) must stay consistent across the markdown sources and the HTML. `факты.md` states it contains only verifiable claims — don't add or inflate numbers; check them against `profile.md` before changing.
- Contact details (email, Telegram, phone) appear in the `#contact` section and footer of the HTML; update every occurrence if they change.
