# Thin One Piece presentation

Grand Fleet decorates Herdr's native Spaces and Agents regions.
The author’s 2026-11-15 decision supersedes the nested fleet in the historical prototype.
Herdr owns terminal processes, workspaces, input, arrangement, and reconnection.

## Current design

Each sidebar region retains one native scrolling list.
Machine groups share the Spaces scroll, and native agent groups share the Agents scroll.
No machine or ship introduces a nested scroll container.
Every live Herdr agent receives crewmember artwork without Firstmate worker metadata or captain ownership.
Personal terminals retain ordinary native presentation.

Crew appearance lets the user explicitly identify an agent running Firstmate as a captain.
The mod records its terminal address and creation timestamp without modifying Firstmate or terminal metadata.
An ended captain designation cannot transfer to a reused terminal address.
The captain chooses its crew artwork through the appearance menu.
A space containing a captain shows that crew's ship.
Clicking the ship selects the space through Herdr's native command.
If several captains share a space, the first captain in native agent order supplies its ship.
All captains remain independently accessible in Agents.
Spaces without captains retain native presentation.

Selecting a crewmember retains native focus or writable preview behavior.
Native sorting, pinning, grouping, terminal creation, tabs, splits, and panels remain available.
Character assignments remain stable for surviving sessions.
Idle characters sleep, working characters walk, and blocked characters sit.
Done characters sleep beside Herdr's done label, or under its done dot in the collapsed sidebar.
Appearance settings can pause animation without changing session state.
There is no custom workspace ownership, worker association, task polling, or terminal recovery flow.

## Compatibility approach

Herdr rejects imports outside a mod directory.
The installer copies the installed Spaces and Agents modules unchanged into the mod directory.
The adapter subclasses their rendering methods and retains their native controllers.
The generated layout retains both sidebar slots and selects their presentation with region properties.
Teal and gold defaults preserve explicit layout color overrides.
Unsupported source methods, imports, or layout structure fail before installation writes files.
Refresh the installation after Herdr updates to inherit native module changes.
The adapter still requires compatibility verification against each new upstream structure.

## Verification

Compare emitted navigation commands with native Herdr and test captain identity separately.
Count scrolling containers in both native and decorated regions.
Verify generated module contents and preservation of unrelated layout properties.
Exercise installation, upgrade, removal, and rejection of unsupported or modified installations.
Use disposable local and remote sessions for physical navigation and direct input checks.
Initial rendering and simulated command checks do not prove reconnection or pixel accuracy.
The [acceptance review](ACCEPTANCE.md) distinguishes current evidence from historical checks.

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
The initial unavailable-state screenshot was inconclusive.
A subsequent isolated transport interruption showed Wano as unavailable with its live character rows removed.
Local terminals remained intact, and the remote crew returned after reconnection.
Later nested candidates kept machine headings visible while their contents scrolled independently.
They scrolled crews beneath their ship and captain, matching the approved native-flow prototype.
The current design replaces these nested scrolls with one scrolling list per native region.
Firstmate starts workers with `--no-parent`, so its workers do not acquire native nesting automatically.
A later candidate resolved that design choice through explicit mod-owned associations, which the current design removes.
Current stock verification supersedes this historical candidate record.
See [Native verification](NATIVE-INTEGRATION.md#stock-firstmate-tasks-and-direct-input-2026-11-14) for its evidence and limits.
