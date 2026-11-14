# Thin One Piece presentation

Grand Fleet presents firstmate coordinators and workers through the approved fleet sidebar.
The [native-flow prototype](http://tiagos-macbook-pro-1.tail707c05.ts.net:4387/session/0782435952d24d57) supplies the visual reference.
Herdr owns terminal processes, workspaces, input, arrangement, and reconnection.

## Current design

Machines appear as islands with their actual machine names retained.
Each registered coordinator has a ship row and a captain beneath it.
The ship only folds its characters, and its appearance menu selects artwork without changing sessions.
Workers appear below their coordinator using explicit Firstmate metadata.
Personal terminals keep native controls and have no character assignment.
Ordinary workspaces remain accessible without duplicate destinations for represented characters.

Firstmate requires no modifications, extra hooks, or special fork.
Link captain selects an existing terminal explicitly and stores its address and creation timestamp in the mod's settings.
A captain can be linked before its first worker exists.
Edit captain link later selects a worker group from existing `firstmate.home` and `firstmate.task` labels on that machine.
New workers with the selected home label join automatically.
Unlink captain removes presentation grouping without changing any terminal, workspace, or Firstmate record.
An ended captain's association cannot transfer to a reused terminal identifier.

A home label identifies a worker group, not a canonical directory.
Independent Firstmate homes can share that label when they use the same installation.
The setup menu displays the label, tasks, and terminal addresses for explicit selection.
Do not associate a shared label when its workers belong to separate coordinators.
Those workers remain accessible through native Herdr.
The menu refuses a group already associated with another live captain.
Conflicting saved associations keep captains visible and leave workers ungrouped.
The mod does not guess a relationship from names, directories, or process parents.

[Firstmate PR 8484](https://github.com/kunchenguid/firstmate/pull/8484) was rejected as an architectural dependency and closed.
Earlier patched-producer evidence is historical and does not validate this replacement.
Unmodified Firstmate passed local and physical remote task, input, navigation, reconnect, and cleanup checks.

Selecting a placed character focuses its native terminal.
An unplaced character opens Herdr's writable preview, including its native keep action.
Selection does not silently create workspaces or adopt terminals.
Native controls continue to supply creation, folder inheritance, machine selection, tabs, splits, resizing, zoom, closing, and panels.
There is no custom Restore layout or terminal recovery flow.

The sidebar uses the approved teal and gold palette while retaining explicit layout color overrides.
Narrow sidebars use compact artwork with terminal identities available through tooltips and accessibility labels.
Unavailable machines display connection state instead of animated characters.
Surviving sessions keep character assignments when other workers enter or leave.

## Compatibility approach

A native loading probe confirmed that Herdr rejects imports outside a mod directory.
Herdr exposes no documented status-artwork hook in the shipped Agents mod.
The installer therefore generates a local base module from the installed Agents source and derives the layout from the installed main layout.
The repository maintains the fleet sidebar and artwork adapter while delegating terminal actions to native commands.
Installation checks the methods and layout slots used by the adapter before writing files.
Unsupported structures fail with a useful message and preserve the existing installation.
Refresh the installation after a Herdr update to inherit changes to Agents and the main layout.
Directly referenced shipped mods receive their normal updates.
No promise of compatibility with every future Herdr version is possible without a supported extension hook.

Generating the base from installed source avoids maintaining a static fork of native initialization.
The custom sidebar still requires compatibility verification when Herdr changes.

## Verification

Compare emitted terminal commands with native Herdr and verify fleet membership separately.
Verify that the generated layout changes only approved sidebar slots and palette defaults.
Test installation, upgrade, removal, modified files, unsupported upstream source, and legacy shortcut cleanup.
Use disposable local and remote sessions to verify navigation, typing, native creation, and preservation of process identities.
Inspect the native layout at compact and large sizes.
Keep interactive validation stopped if user input changes the test window.

## Historical candidate verification on 2026-11-14

These observations describe the earlier parent-based candidate, not complete verification of the current fleet sidebar.

The isolated Grand Fleet Lab loaded the candidate through a separate `one-piece-probe` layout.
The default layout and the previous installed mod remained available.
Herdr's initial rendering check passed.
The command comparison passed for priority sorting, grouped sorting, local selection, remote selection, child previews, kept children, pinning, and ship folding.
The collapsed sidebar used a single character inside Herdr's 14-pixel status slot.
Native screenshots showed the expanded ship, captain, and nested worker without overlapping rows.

Direct keyboard input reached a disposable remote terminal and a disposable nested worker through the native window.
Both programs echoed the entered text.
The same worker accepted another line through default Herdr's preview.
Its original process identifier and earlier output remained visible across layout switches.
These checks used test programs reporting Herdr activity, not real worker conversations.

Native Add terminal created ordinary shells on the focused terminal's machine and in its folder.
Both default Herdr and the candidate passed this comparison on local and remote machines.
The four disposable shells were closed using native tab controls after checking their folders.
No direct input was sent to existing user terminals.

The lab's older edited installation correctly failed its ownership check without replacing files.
That installation was preserved outside the app home before a clean candidate installation.
A subsequent candidate refresh succeeded through the installer.
The installed candidate passed Herdr's rendering check and reported no runtime errors.

Native pointer actions opened the artwork menu, changed crews, and toggled animation.
Keyboard testing exposed missing popup focus, which was corrected using Herdr's documented focus handle.
Enter selected the first choice, Tab followed by Enter selected the next crew, and four Tab presses reached the animation control.
Shift-F10 opened the menu after a physical click focused the ship.
The lab's original Straw Hat artwork and active animation were restored after these tests.
Accessibility activation alone did not focus the ship, so it cannot substitute for the physical keyboard test.

After closing and reopening the lab during installation, the remote fixture accepted another directly typed line.
Its earlier output and original program marker remained visible alongside the new echo.
This verifies app reconnection to the surviving session, not recovery from a machine or network outage.
A separate transport interruption disconnected the isolated remote machine and then restored its connection.
The remote terminal retained its creation identity, shell process, and foreground program after reconnection.
After the lab window became available, a screenshot showed the earlier terminal output preserved after transport recovery.
Raising the lab window allowed direct typing, and the remote test program echoed `AFTER_TRANSPORT_RECOVERY`.
The unavailable-state screenshot remains inconclusive, so offline presentation remains unverified.
Firstmate starts workers with `--no-parent`, so its workers do not acquire native nesting automatically.
The current coordinator model resolves that design choice through explicit mod-owned associations.
Current stock verification supersedes this historical candidate record.
See [Native verification](NATIVE-INTEGRATION.md#stock-firstmate-tasks-and-direct-input-2026-11-14) for its evidence and limits.
