# Crew batch one implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan.

**Goal:** Add Heart, Whitebeard, Roger, and Kid with expanded canonical rosters and matching animated artwork.

**Architecture:** Extend the existing crew catalog and sprite exporter.
Keep native navigation and saved character assignments intact.

**Tech Stack:** Native Herdr JavaScript, Python standard library, and installed ImageMagick.

**Spec:** VISION.md and the approved crew research at /Users/tiago/Workspace/.lavish/grand-fleet-crew-research/index.html.

## Global constraints

- Use canonical named members beyond the first three.
- Keep the existing three animation states and four frames per state.
- Generate exports through tools/build-artwork.py.
- Preserve terminal sessions and native commands.
- Keep review boards outside the repository.

## Review focus

- Every selectable character and ship must have animated and static assets.
- All eight crews must fit the picker and remain reachable by keyboard.
- New secondmates must exhaust unused secondary crews before repeating.
- Existing manual choices and surviving character assignments must stay stable.
- Historical members must be documented as historical, not simultaneous membership.

## Task 1: Source artwork

**Files:** prototype/crew-artwork and docs/ARTWORK-NATIVE.md.
**Interfaces:** Four-column ship sheets and three-row character sheets feed the existing exporter.

- [x] Generate character and ship sheets using existing artwork as the style reference.
- [x] Inspect every sheet for canonical identity, transparent padding, and distinct animation frames.
- [x] Record the prompt set and roster sources.

## Task 2: Catalog and exports

**Files:** mods/one-piece/artwork.js, tools/build-artwork.py, tests/artwork.test.js, tests/test_artwork.py, mods/one-piece/assets.
**Interfaces:** crews supplies the picker, character allocator, and default selector.

- [x] Add coverage checks for every named character's three states and each ship.
- [x] Extend the default-selection test to exhaust all seven secondary crews before repeating.
- [x] Run the changed checks and confirm missing catalog entries or assets cause failure.
- [x] Extend the catalog, default selection, and exporter ship recognition.
- [x] Generate exports and run both test suites.

## Task 3: Native presentation and verification

**Files:** mods/one-piece/main.js, tools/check-parity.mjs, docs/THIN-MOD.md.
**Interfaces:** The existing native picker receives all eight catalog entries.

- [x] Verify all crew buttons, saved selections, animation controls, and native commands through parity checks.
- [x] Size the picker for all eight choices using the installed native declarations.
- [x] Install in an isolated app home and run herdr-app check and node tools/check-parity.mjs against that version.
- [x] Inspect all four new ships and representative character states in Grand Fleet Lab.
- [x] Run git diff --check.
- [x] Perform a fresh implementation review.
- [x] Record verification limits without claiming session recovery was retested.
