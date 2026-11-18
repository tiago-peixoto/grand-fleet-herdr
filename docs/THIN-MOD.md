# Thin One Piece presentation

Grand Fleet decorates Herdr's native Spaces and Agents regions.
The author’s 2026-11-15 decision supersedes the nested fleet in the historical prototype.
Herdr owns terminal processes, workspaces, input, arrangement, and reconnection.

## Current design

Each sidebar region retains one native scrolling list.
Machine groups share the Spaces scroll, and native agent groups share the Agents scroll.
Each machine heading shows an island in place of Herdr's computer or server icon.
The mod gives each machine the least-used of eight islands and saves that choice, so a machine keeps its island across restarts and while it is away.
A machine that is not connected shows its island in fog, following the same state as Herdr's own status dot.
The installer routes only that icon through a method and refuses a Herdr version whose machine heading no longer contains it exactly once.
Herdr draws machine headings only when at least one remote machine exists.
No machine or ship introduces a nested scroll container.
Every live Herdr agent receives crewmember artwork without Firstmate worker metadata or captain ownership.
Personal terminals retain ordinary native presentation.

The mod automatically identifies Firstmate captains using their existing session lock and live foreground process.
It checks the Firstmate startup script and secondmate marker without executing either file.
The mod records its terminal address and creation timestamp without modifying Firstmate or terminal metadata.
A detected primary Firstmate defaults to Straw Hats, regardless of discovery order.
Detected secondmates use the least-used secondary crew.
Ties follow this order: Red Hair, Big Mom, Beasts, Heart, Whitebeard, Roger, then Kid.
This selects unused crews first across machines and reserves assignments on disconnected machines.
Manual selections, including duplicates, remain unchanged.
Firstmate sends no artwork commands and requires no mod-specific registration.
Manual designation remains available for instances whose session evidence cannot be read.
An ended captain designation cannot transfer to a reused terminal address.
Right-click a Space with a ship and choose “Raise a new flag…” directly below Rename.
The flag dialog shows all eight crews, and arrow keys, Enter, and Esc work as well as the pointer.
For a generic fleet, the Straw Hats show as reserved while a Firstmate captain is live, the same rule that automatic choice follows.
Set sail posts a notification that names the ship and the Space.
The picker changes the ship, its captain if one is aboard, and the crewmates in that Space together.
New agents in that Space receive artwork from the selected crew.
Right-click a crewmate to choose its character from the members of its fleet's crew.
If another crewmate of that fleet holds the chosen character, the two swap, so a fleet never shows the same character twice.
The choice lasts while the terminal lives and returns when the fleet flies that crew again.
Fleet cards have six pixels of bottom spacing.
The sidebar header shows the Straw Hat flag and the name Grand Fleet in place of Herdr's logo and name.
The flag is drawn at 32 pixels, its artwork size, and keeps the native search and fold buttons beside it.
The Dock icon, the welcome screen, and Settings keep Herdr's own logo, because no mod can change them.
The macOS Dock badge shows how many agents Herdr reports as blocked, and clears at zero.
The `one-piece.attention` command shows the unfocused blocked agent that changed most recently, or else the newest finished one.
It runs Herdr's native `agent.focus` and does nothing when no agent waits.
The Dock badge and the `one-piece.attention` command work only while the One Piece layout is shown, because the Agents list owns both.
Switching to another layout closes that list, which clears the badge.
A space containing a captain shows that crew's ship.
An agent's crewmember takes the program icon's place in the Agents row, its tab, and its pane title.
The narrow sidebar rail has no icon column, so there the crewmember stays in the status cell.
A space with live agents and no captain is a generic fleet.
A generic fleet shows a ship, keeps its Space name above the crew strip, and has no captain artwork.
Each generic fleet receives the least-used crew, counting live captains and other fleets.
Straw Hats are eligible only while no captain is live.
A new fleet waits for the first discovery check of each agent, for at most five seconds, before choosing its crew.
The mod stores generic crews by Space identifier and releases them when the Space is gone from an online machine.
Generic fleet crewmates come from that fleet's crew, so an agent moved to another Space takes that Space's crew.
When a captain arrives, the Space follows the captain presentation and keeps its stored generic crew for later.
Clicking the ship selects the space through Herdr's native command.
If several captains share a space, the primary supplies its ship, followed by the oldest terminal.
Manual designation is unavailable for an agent whose Space already has a captain.
All captains remain independently accessible in Agents.
Expanded Spaces with agents show their miniature crewmembers below the name, replacing the letter avatar.
Worktree Spaces keep Herdr's indent and branch icon.
Rows with crew artwork are 64 pixels tall, compared with Herdr's 30-pixel Space rows and 28-pixel worktree rows.
A captain Space combines its ship, captain sprite, and miniature managed crew on one continuous row background.
The captain sprite replaces the visible Space name, which remains available in its tooltip and accessibility label.
Every captain uses native Space membership for the lower crew strip, whether detected or manually designated.
A Space whose crewmates all carry one detected captain's `firstmate.home` label follows that captain: it flies the captain's ship and its crewmates come from the captain's roster.
The mod derives each detected captain's home tag from its home folder, as Firstmate's `bin/fm-backend-hometag-lib.sh` does, and compares it only on the captain's machine.
That Space keeps its own row, its name, and its native membership, and shows no captain artwork.
That Space stores no crew of its own: the mod drops any stored crew once the Space follows, so the captain always wins.
Choosing a flag on that Space changes the captain's crew, exactly as on the captain's own Space.
A captain marked by hand has no home tag, so Spaces of its workers stay generic fleets.
The mod reads no other Firstmate label and never detects a captain from a label.
The entire row selects the Space and retains native drag ordering and the workspace menu.
Every fleet shows only agents placed in its Space.
Spaces without agents retain native presentation.

Selecting a crewmember retains native focus or writable preview behavior.
Native sorting, pinning, grouping, terminal creation, tabs, splits, and panels remain available.
Character assignments remain stable for surviving sessions.
Idle characters sleep, working characters walk, and blocked characters sit.
Done characters sleep beside Herdr's done label, or under its done dot in the collapsed sidebar.
Appearance settings can pause animation without changing session state.
The picker supports eight crews and scrolls when its choices exceed the available height.
[The crew catalog](CREW-CATALOG.md) lists the expanded rosters and historical membership.
The managed crew strip is a visual summary only, without custom workspace ownership, task polling, or terminal recovery.

## Compatibility approach

Herdr rejects imports outside a mod directory.
The installer copies the installed Spaces and Agents modules unchanged into the mod directory.
The adapter subclasses their rendering methods and retains their native controllers.
The installer also generates a copy of the native menu with an overridable item method.
The fleet menu inserts its picker after Rename while retaining native actions and keyboard navigation.
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


## Captain discovery verification on 2026-11-15

This section is historical, and the automatic discovery trial on 2026-11-16 supersedes it.
At that time, automatic startup discovery was not implemented or claimed.
A read of the running lab captain through `hc get t42` showed only Herdr placement labels, without a Firstmate role or home label.
The stock `bin/backends/hc.sh` creates worker terminals with `firstmate.task` and `firstmate.home`, but these do not identify the captain terminal.
The stock `bin/fm-spawn.sh` explicitly refuses `--backend hc --secondmate` before launching a terminal.
An isolated invocation using disposable home directories reproduced exit status 1 with `error: backend=hc does not support --secondmate spawns yet`.
The upstream [hc backend documentation](https://github.com/kunchenguid/firstmate/blob/main/docs/hc-backend.md) inspected during that historical trial confirmed that limitation.
The documented `herdr` backend is the older multiplexer and is not interchangeable with Herdr Core.

Automatic crew allocation is covered for explicitly registered captains, including cross-machine assignments, disconnected machines, exhausted rosters, and manual overrides.
This does not make a simulated captain a real delegated secondmate.
Closing the remaining gap requires a supported secondmate launch path and a reliable captain identity supplied through that path.
No Firstmate source changes, process-name guesses, or folder-based role inference were introduced.

## Automatic discovery trial, 2026-11-16

The isolated local trial detected a real primary and delegated secondmate with no manual captain records.
A fresh app launch showed Sunny with Luffy, Red Force with Shanks, and Benn Beckman for the secondmate worker.
The mod matches the foreground process to `state/.lock` and verifies `bin/fm-session-start.sh` before reading `.fm-secondmate-home`.
Remote file reads use the terminal machine, but a real remote trial remains unverified.
Custom state directories and harnesses whose foreground process differs from the lock owner remain unverified.
The compatibility findings above describe the earlier stock integration, not proof of this trial’s remote behavior.

Discovery probes run independently per terminal, so a slow machine does not delay other captains.
Each sidebar owns its pending probes, matching Herdr’s cancellation lifetime.
Repeated scans do not queue duplicate probes for that sidebar.
Discovery rereads the session lock and foreground process before publishing a captain.
A failed machine read preserves the last known record until evidence can be read again.
A verified role correction updates automatic crew choices while preserving explicit picker selections.
When captains share a Space, its first native captain determines both the ship and the crew artwork.
The local acceptance run passed 23 JavaScript tests, 44 Python tests, the installed native render check, and the native behavior verifier.
The behavior verifier also exercised asynchronous discovery, stale records, a held remote request, and replacement sidebar instances.

## Fork main acceptance, 2026-11-16

Firstmate fork PR #122 merged as `653744ef90aad29eb4c65e3cbba59827b2d1690e`.
A fresh isolated primary and secondmate both ran that exact commit from `tiago-peixoto/firstmate` main.
The primary automatically detected hc, provisioned a secondmate, and routed a disposable task through it.
The secondmate dispatched a real Claude worker, which committed the requested `hello.txt` locally.
The mod automatically displayed Sunny/Luffy, Red Force/Shanks, and Benn Beckman without manual captain records.
Native agent navigation reached all three terminals without app errors.
An app-only restart preserved their creation identities, shell and agent processes, ownership, placement, and artwork assignments.
The merged commit passed seven routing cases and the real-core secondmate dispatch test.
The fresh mod installation passed its native render check and behavior comparison.
Physical pointer and crew-picker interactions were initially unverified because native accessibility access timed out.
The later [local physical harness check](ACCEPTANCE.md#local-physical-harness-evidence-2026-11-16) verified navigation, actual worker input, and manual crew persistence.
Physical overflow scrolling remains unverified by that report.
The later candidate remote lifecycle passed, including normal primary acknowledgment and physical input after transport recovery.
Mod PR 1 subsequently merged as `436678c561bf42f0a39951f9ed574af003134d9d`.
Its tree exactly matches reviewed revision `200896b298b389c3589edbf21da0caa7f76fd599`.
Firstmate main `00311fea94041f7794f3b2690f7df70f6942687d` has the tested combined candidate tree.
Normal `fm-update` completed successfully at 20:49:12 UTC.
Independent snapshots confirmed four clean final-main checkouts and matching private remote worker code and process-lock identities.
The prescribed restart completed two of two secondmates with zero nudged or unreachable targets.
Final post-restart reconciliation completed at 20:55:14 UTC with all five terminals alive, but remote file bytes were not reread.
