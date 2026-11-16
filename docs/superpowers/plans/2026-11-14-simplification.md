# Simplified Grand Fleet Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the approved single-home controls while preserving existing sessions and machine ownership.

**Architecture:** Keep the native controller and fleet model.
Move occasional controls into native popup menus and remove personal-shell recovery bookkeeping.

**Tech Stack:** Herdr native JavaScript, Node controller tests, Python installation checks.

**Spec:** `docs/UI-SIMPLIFICATION.md`, approved by the author on 2026-11-14.

## Global constraints

Preserve running terminals, registrations, layouts, aliases, and inspection-only authority.
Never use real worker processes for destructive checks.
Do not edit generated Herdr files.

## Review focus

- Offline machines must not permit shell creation.
- Workers without linked coordinators must remain inspectable.
- Multiple coordinators must remain under their actual machine.
- Closing a menu must not change the target of a destructive action.
- Removing recovery metadata must not create or end processes.

## Tasks

- [x] Remove recovery in `mods/one-piece/main.js` and `shells.js`, retire its tests, and update `VISION.md`.
  Add controller tests for migration without process operations and one Add terminal path, including empty and unavailable workspaces.
  Run `npm test` and `herdr-app check mods/one-piece`.
- [x] Move workspace, tab, pane, and motion actions into scoped native menus in `main.js`.
  Preserve close confirmation and ownership validation.
  Test one visible home per action and changed targets before execution.
- [x] Replace sidebar shortcuts and duplicate attention cards with pinned machine sections and filtering.
  Test blocked coordinators, unmatched workers, independent sessions, and offline machines through the fleet model and controller.
- [x] Integrate approved custom artwork and crew choice with persistent identities.
  Verify assets and unique named assignments before generic palettes.
- [x] Run installation checks and native render checks, inspect the isolated running app, and record exact evidence in `docs/NATIVE-INTEGRATION.md`.
  Review the complete diff before declaring implementation finished.

## Execution record

The author explicitly approved implementation and replacement of Restore layout with Add terminal.
No further approval is needed for these changes.
The existing feature branch contains the ongoing native implementation and remains the work location.
