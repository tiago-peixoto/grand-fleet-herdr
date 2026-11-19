# Prototype inventory

The repository imported all 61 files from the prototype tree, excluding the separate specification review board.
It keeps 20 of them.
The 39 sourced reference images and the two pages that compared them were removed on 2026-11-18.
The import manifest records the original SHA-256 checksum of each kept file before repository maintenance changes.
The original Lavish workspace remains untouched.

## Current experience

`prototype/index.html` is the latest interactive preview.
Its editable source is `prototype/flow/screen.html` and `prototype/flow/app.js`.
`prototype/flow/build.py` embeds the source and artwork into that portable HTML file.
`prototype/flow/check.js` exercises 49 simulated interactions.
`prototype/flow/check-browser.py` runs those checks in an already-open browser preview.

The left sidebar groups coordinators under Water 7, representing local, and Wano, representing hz-server.
Those names and assignments are sample data rather than a verified machine inventory.
Sunny expands its characters without selecting a session.
Luffy is the first selectable character and opens the coordinator workspace.
Workers open their own simulated workspaces and can return to their coordinator.
Personal terminals belong to their coordinator workspace and keep independent sample command histories.
The preview supports adding terminals, workspace switching, equal grids, a coordinator-plus-terminals arrangement, maximize, restore, and machine aliases.
It displays worker sleep, walk, and sit states and offers a motion toggle.

## Accepted changes after the preview

Native agent terminals replace the prototype's scripted message bubbles and invented approval action.
Focus and explicit Close replace the prototype's non-destructive Hide and Reopen behavior.
Chopper and Franky receive the available named worker assignments, followed by numbered generic Pirates.
Those decisions are captured in the specification snapshot and the draft vision.
The imported preview remains a reference snapshot rather than claiming those changes are already implemented.

## Remaining native questions

Herdr normally places child workers in their parent's tab without a pane.
Separate worker spaces therefore need verified creation and adoption without launching duplicate workers.
Grid presets must preserve running terminals and geometry when using native panes.
The demo hardcodes terminal folders, keeps state only in memory, and has no loading or unavailable machine states.
It also lacks completion attention, unresolved parent relationships, ended-worker cleanup, and native recovery behavior.
The specification snapshot records proposed rules and acceptance checks for these cases.

## Historical stages

| Path | Purpose | Status |
| --- | --- | --- |
| `prototype/functional-v1.html` | Earlier custom-art fleet, worker lifecycle, and status controls | Historical behavior reference |
| `prototype/custom-trial/index.html` | First custom artwork comparison | Selected visual direction, older interface |
| `prototype/preview.png` | Earlier static reference | Historical visual reference |
| `prototype/custom-trial/assets/` | Initial custom sheets | Current Sunny and Luffy plus worker style references |
| `prototype/flow/assets/` | Refined custom sheets | Current worker atlas and flag, plus Franky reference |

Older pages may contain links to the original private Lavish sessions.
Those links are preserved as historical context and are not required to open the current portable preview.
The review board itself and verdict transcripts are not committed.

## Functional model

A machine hosts workspaces.
A coordinator owns its session and the personal terminals created in its workspace.
A worker belongs to a coordinator but has its own workspace.
A ship groups navigation entries and never stands in for a selectable session.
A character represents session identity and activity, not a new execution system.
The exact mapping from these identities to native Herdr records still requires integration verification.
