# Native sidebar implementation plan

**Goal:** Present spaces as ships where they contain captains and present every agent as a crewmember.

**Architecture:** Subclass copies of the installed Spaces and Agents modules through their validated rendering methods.
Retain native controllers, actions, grouping, and one scrollbar per region.
Replace the custom fleet renderer and worker association flow with artwork and explicit captain identification.

**Tech Stack:** Herdr native JavaScript views and Python transactional installer.

**Spec:** VISION.md, updated for the author’s 2026-11-15 decision.

## Global constraints

Firstmate remains unmodified.
Personal terminals retain native controls and process lifetimes.
Generated destination files are produced by the installer, never edited manually.
Unsupported upstream source must fail before installation changes any files.

## Review focus

Remote terminal addresses and recreated terminal identities must not inherit incorrect captain artwork.
Multiple captains in one space must select a deterministic ship without hiding agents.
Ordinary spaces and personal terminals must remain reachable.
Compact sidebar rows and nested native agents must retain artwork and navigation.
Offline machines must retain native availability and recovery controls.

## Task 1: Native presentation hooks and installation

Files: tools/compat.py, tools/install.py, tests/test_compat.py, tests/test_install.py.
Interface: generate(agents_source, main_layout, spaces_source) returns owned generated files.

- [x] Assert both native layout slots survive and unrelated layout fields remain unchanged.
- [x] Assert source hook mismatches and new module dependencies reject installation.
- [x] Generate native module copies and validate the subclass interfaces.
- [x] Run Python installer and compatibility tests.

## Task 2: Generic artwork and native navigation

Files: mods/one-piece/main.js, mods/one-piece/fleet.js, tests/presentation.test.js, tools/check-parity.mjs.
Interface: Override Agents.status/subRow and Spaces.row/compact to add artwork while retaining native controllers.

- [x] Test captain identity, generic agents, remote addresses, and deterministic space artwork.
- [x] Replace custom fleet rendering with native region controllers.
- [x] Simplify captain selection to explicit agent identification without worker-group association.
- [x] Preserve existing crew choices and stable character assignments.
- [x] Compare native and themed navigation, pinning, grouping, compact rows, and scroll counts.

## Task 3: Runtime acceptance and review

Files: docs/THIN-MOD.md, docs/ACCEPTANCE.md, README.md as needed.

- [x] Install into the isolated Grand Fleet Lab and run its native loading check.
- [x] Inspect both sidebar regions with local and remote sessions.
- [x] Verify ship selection, crewmember selection, direct typing, and personal terminals.
- [ ] Complete the repository review pipeline after passing local tests and diff checks.
- [x] Record verified evidence and limitations before reporting completion.
