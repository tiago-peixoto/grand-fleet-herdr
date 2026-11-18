# Grand Fleet Native Implementation Plan

> Use the executing-plans skill to implement and verify each task.

**Goal:** Implement the approved fleet sidebar while retaining native Herdr terminals and session management.

**Architecture:** The mod reads live terminal metadata and renders island, ship, captain, and crewmate navigation.
Herdr retains terminal input, placement, creation, panels, and process lifetime.
Explicit Firstmate labels establish display relationships without changing native parents.

**Tech stack:** Herdr native JavaScript views, existing custom GIF artwork, Python installation tooling, and Node tests.

**Spec:** [Approved interactive prototype](http://tiagos-macbook-pro-1.tail707c05.ts.net:4387/session/0782435952d24d57) and the active goal attachment.

## Constraints and evidence

- Ship clicks only collapse or expand.
- Captains appear first, followed by their crewmates.
- Personal terminals retain native controls and no character identity.
- Ordinary workspaces remain reachable without duplicate character destinations.
- Settings, Add machine, plus menu, Files, and Changes remain native.
- Workers launch with `--no-parent --outlive-parent --no-notify` in Firstmate's `bin/backends/hc.sh`.
- Existing `firstmate.home` and `firstmate.task` labels identify worker groups, but not coordinator terminals.
- Existing home tags hash `FM_ROOT`, not `FM_HOME`, so separate homes can share a tag.
- Never choose a coordinator from a name, directory, artwork, or process parent.
- Do not poll task files or change worker lifetime to obtain display grouping.
- Do not modify generated Herdr modules directly.

## Tasks

### 1. Establish explicit grouping

- [x] Add `mods/one-piece/fleet.js` with pure grouping logic and `tests/fleet.test.js` with relationship tests.
- [x] Test local and remote isolation, absent labels, conflicting coordinators, and terminated records.
- [ ] Verify the live inventory's machine and core-session boundaries before connecting grouping to the view.
- [ ] Supply coordinator registration through an explicit Firstmate integration, including stale registration handling.
- [ ] Resolve home-tag collisions before claiming automatic grouping works for distinct homes.
- [ ] Test registration with disposable Firstmate homes and live local and remote terminals.

### 2. Render the approved sidebar

- [x] Update `mods/one-piece/main.js` to render island headings, ships, captains, and nested crewmates.
- [x] Reuse `artwork.js` assignments and native focus or writable preview commands.
- [ ] Keep unavailable machines visible without activity animation.
- [x] Update `tools/compat.py` and its tests to replace the sidebar lists while retaining native chrome and work controls.
- [ ] Preserve ordinary workspace navigation and native keyboard navigation order.
- [ ] Check narrow widths, keyboard access, collapse behavior, and character assignment stability.

### 3. Verify native behavior and deliver

- [x] Update `tools/check-parity.mjs` to check preserved commands against the new sidebar.
- [ ] Run the repository tests, installer checks, native mod check, and `git diff --check`.
- [ ] Inspect the rendered interface in isolated Grand Fleet Lab against the approved prototype.
- [ ] Compare typing, creation, folder inheritance, navigation, splits, zoom, closing, Files, and Changes with default Herdr.
- [ ] Verify local and remote process identities and output across navigation and reconnecting.
- [ ] Verify idle, working, attention, and unavailable presentations using disposable sessions.
- [ ] Update VISION.md, AGENTS.md, README.md, and integration documentation to describe the final implementation.
- [ ] Review the complete diff and update the draft pull request with evidence and remaining limitations.

## Acceptance boundary

Passing model tests proves grouping behavior only.
Passing a native render check does not prove terminal preservation or remote recovery.
Completion requires live workflow evidence and a reviewable pull request covering the full goal.

## Current verification

The grouping module now drives the native sidebar.
Its `firstmate.role=coordinator` label is a proposed integration contract, not an existing Firstmate label.
The seven JavaScript tests, four compatibility tests, and thirty-five installer tests passed on 2026-11-14.
The isolated core answered a read-only inventory request and reported both configured test machines connected.
The updated installer generated the sidebar layout and installed it in `/private/tmp/op-app-31618`.
The native mod check passed and the running lab reported no errors.
Disposable local terminals `t39` and `t3b` carry explicit test labels for coordinator and worker display.
The screenshot `/tmp/grand-fleet-sidebar.png` shows Sunny, Luffy, and Chopper in the live sidebar.
These labels verify rendering only, not automatic Firstmate registration.
Native command comparisons pass for captain focus, worker preview, placed worker focus, remote focus, and ship collapse.
Visual alignment, automatic registration, unavailable machines, and complete local and remote workflows remain unfinished.


## Canonical home identity verification

The consumer now groups by `firstmate.home.path`, scoped to the machine address.
It never falls back to the legacy `firstmate.home` tag because that tag can collide across distinct homes.
The producer must publish the canonical physical `FM_HOME` path after coordinator authority is established.
Coordinator registration remains under implementation in an isolated Firstmate worktree.
Multiple live coordinators for one canonical home remain ungrouped rather than choosing one arbitrarily.

Seven grouping tests first failed against the legacy consumer and then passed after changing the label key.
All nine JavaScript tests now pass, including existing artwork assignment coverage.
Native command parity also passes with the canonical fixtures.
Additional command checks verify ordinary workspace selection, the shipped workspace menu, and loading/unavailable machine presentation.
These checks execute the JavaScript view against a simulated host and do not prove remote reconnection behavior.

Only disposable lab terminals `t39` and `t3b` received the canonical test label.
The updated mod installed successfully and passed the native check in `/private/tmp/op-app-31618`.
The inspected screenshot `/tmp/grand-fleet-canonical-home.png` shows Sunny, Luffy, and Chopper under Water 7.
The screenshot also shows native tabs, Files, Changes, Settings, and Add machine controls.
The existing lab terminal process identifiers remained unchanged during label updates.
This does not establish automatic registration or output preservation across reconnects.

The previous conversational turn supplied a goal prompt without implementation progress.
This continuation resumed from the working tree and changed the consumer, tests, and lab installation.
Automatic registration, visual refinement, and full native workflow verification remain required.

## Narrow sidebar verification

The native `layout.resize` command reproduced clipped artwork and text at a 76-pixel sidebar width.
The failing command test measured character artwork at 44 pixels instead of the intended 32 pixels.
The sidebar now follows Herdr's width-based compact behavior below 160 pixels.
Compact rows retain character sprites, accessible labels, tooltips, and native selection commands.
Expanded rows align their content to the left instead of centering each label independently.
Machine and workspace abbreviations retain their full names in tooltips.

The command test passed after the change, and all nine JavaScript tests passed.
The installed mod passed the native check.
The inspected `/tmp/grand-fleet-narrow-after.png` screenshot shows ships and characters inside the narrow rail without clipping.
The inspected `/tmp/grand-fleet-aligned.png` screenshot shows the restored 268-pixel sidebar with aligned rows.
The isolated lab is back at its original sidebar width.
The Firstmate producer implementation is in `~/Workspace/firstmate-hc-home-registration` on branch `hc-home-registration`.
Its changes and tests are still in progress and are not yet accepted as verified integration evidence.

## Native palette verification

The generated layout now supplies the approved prototype's teal surfaces and gold accent through Herdr's native `colors` field.
Explicit color overrides in the source layout retain precedence over the fleet defaults.
No terminal controls or terminal drawing code changed.
The compatibility tests cover the palette and preservation of explicit source preferences.
The inspected screenshot `/tmp/grand-fleet-palette.png` shows the native controls using the fleet palette.
The installed mod passed its native check, command parity passed, and the app reported no errors.
The complete Python suite passed all 42 tests after the palette change.

## Native terminal comparison after canonical grouping

The live isolated Grand Fleet Lab passed four command-driven cases on 2026-11-14.
Both `main` and `one-piece` layouts created ordinary terminals from local and remote focused terminals.
Local terminals inherited `/private/tmp`, and remote terminals inherited `/tmp` on `op-hz-lab`.
None received Firstmate labels.
Each shell printed a unique marker that remained in terminal history after navigation, two zoom toggles, and layout switching.
Creation timestamps, shell process identifiers, and foreground process identifiers remained unchanged.
The original focused terminals also retained their process identities.
The checks closed only the four newly created terminals through native pane controls.
A setup probe created one additional terminal, which was also closed through its exact pane identifier.
The lab returned to the `one-piece` layout with no reported errors.

The script and raw evidence remain in ignored `.superpowers/native/verify-current-flow.py` and `.superpowers/native/current-flow-evidence.json`.
These checks used native app commands and `hc send`, not physical typing or sidebar clicks.
They do not establish pointer routing, panel behavior, or transport reconnection for the current implementation.
All seven grouping tests and the native command simulation passed again after the documentation update.
The registration implementation now exists in the separate Firstmate worktree, but live startup remains unverified.

## Live character interaction

Native accessibility activation selected Luffy and opened `op-fleet-ui-20261114` with terminal `t39`.
Direct keyboard input printed `FLEET_LUFFY_DIRECT_20261114` in that terminal.
Selecting Chopper opened its separate `op-fleet-worker-20261114` workspace with terminal `t3b`.
Direct keyboard input printed `FLEET_CHOPPER_DIRECT_20261114` there.
Both markers were confirmed in the corresponding core terminal histories.
Collapsing Sunny removed both character controls while preserving Chopper's focused pane and workspace.
Expanding Sunny restored both controls.
The native screenshot at `/tmp/grand-fleet-interaction.png` shows the worker output and shipped terminal controls.
The initial coordinate attempts appeared ineffective before the lab window was raised.
A later native screenshot confirmed the plus menu open, and selecting Terminal through pointer input created terminal `t3g`.
That terminal inherited the captain's current repository folder in its existing workspace without any Firstmate labels.
Direct keyboard input printed `FLEET_PLUS_DIRECT_20261114`.
The native pane-close command then closed only that new terminal.
The Files panel listed the current repository files.
The Changes panel loaded all eleven current changes and displayed a diff.
Panel opening used native layout commands, so the Files and Changes pointer targets still need a direct click check.
Evidence screenshots are `/tmp/grand-fleet-files.png` and `/tmp/grand-fleet-changes-loaded.png`.

## Native pointer panel comparison

Files and Changes opened through pointer clicks in both default Herdr and the current One Piece layout.
Both displayed the same repository contents and fifteen changed files.
Clicking Changes again closed the panel in each layout.
Settings and Add machine opened through their native footer buttons in the One Piece layout.
Escape dismissed both dialogs without configuration changes.
The coordinator terminal retained its visible earlier output throughout.
Screenshots are preserved in `/tmp/fleet-*-pointer.png` and `/tmp/fleet-default-*.png`.
The lab returned to the One Piece layout with panels hidden.

## Current remote recovery comparison

The disposable `op-hz-lab/t1r` echo program received temporary canonical coordinator labels for the sidebar check.
Only the verified SSH transport for `op-hz-native-31618` was interrupted, with automatic retries temporarily held by the lab transport flag.
The sidebar removed the remote ship and captain and displayed Unavailable.
Removing the flag restored the connection and the same character.
Creation time, shell process 420912, and foreground process 420997 remained unchanged.
Both historical output and a fresh directly typed echo appeared in the native window after recovery.
The same transport comparison passed in default Herdr, including another directly typed echo.
Evidence lives in `.superpowers/native/reconnect-*.json`, `.superpowers/native/default-reconnect-*.json`, matching text captures, and `/tmp/fleet-*-recovered*.png`.
Temporary Firstmate labels were removed, and the lab returned to the local captain in the One Piece layout.
This verifies connection loss against the isolated Core recovery build, not server shutdown or every published release.

## Current grid comparison

A fresh four-case check created three-terminal grids using native commands in default Herdr and Grand Fleet.
Both layouts passed on the local machine and physical remote `op-hz-lab` machine.
Each case split right and down, swapped panes, toggled zoom, navigated to the worker, and returned.
All twelve shells retained their process identities and printed markers with the expected folder and machine.
Screenshots of both Grand Fleet cases showed the three terminals and their output.
The check closed only its twelve disposable shells and restored the original focus and layout.
Pointer dragging of split boundaries remains unverified.
The script and evidence are `.superpowers/native/verify-grid.py` and `.superpowers/native/grid-evidence.json`.

All nine JavaScript tests and all 42 Python tests passed on the current worktree.
The native command simulation and `git diff --check` also passed.
An independent read-only review of native reachability is running against the current changes.


## Navigation review fixes and local pointer resizing

Independent review identified omitted unregistered terminals and inaccessible workspace menus for grouped characters.
Both differences were reproduced in the native lab before changing the sidebar.
The existing disposable `thin-child` terminal appeared under default Agents but not Grand Fleet.
The sidebar now lists unplaced, ungrouped terminals without character assignments and opens native writable previews.
The lab opened `thin-child` through its new entry and showed its preserved output.
Character rows now open the native menu for their actual workspace through right-click or Shift-F10.
A native screenshot confirmed Luffy's menu contains the workspace actions.
Command regression checks failed before the fixes and passed afterward.
Nine JavaScript tests, the installed native check, and diff validation passed.

Local pointer dragging changed the split widths to 105 and 56 columns in Grand Fleet.
Dragging in default Herdr restored widths of 81 and 80 columns.
Both shells retained their identities and displayed the existing output markers.
Only disposable terminals `t3t` and `t3v` were closed afterward.
The lab returned to `t39` with no overlays or reported errors.
Remote pointer resizing, automatic producer-to-sidebar discovery, and animation transitions remain open.

## Current checkpoint

The current sidebar has passed local automatic coordinator and worker discovery using the patched Firstmate producer.
Native captures verified sleeping, walking, and seated artwork from simulated terminal reports, including motion in each state.
A surviving Franky retained its identity after Chopper's terminal closed.
Local and remote pointer resizing passed against default Herdr while preserving process identities and printed output.
The current acceptance document supersedes incomplete historical observations earlier in this progress log.

Independent review identified two remaining producer defects: inherited terminal identifiers can select an unrelated terminal, and registration can stall the startup digest.
Those fixes are in progress in the separate Firstmate worktree.
The full Firstmate lifecycle and remote automatic discovery require verification after those changes.
The installation guide now identifies the exact tested Core recovery commit and binary checksum.
The official release manifest still advertises 0.1.21, so published-build recovery acceptance remains open.
