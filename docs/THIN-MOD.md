# Thin One Piece presentation

The author clarified that the previous fleet sidebar should remain on 2026-11-14.
Replacing that sidebar with Herdr's default Spaces and Agents sections was an incorrect interpretation of the requested simplification.
The intended sidebar keeps islands, large ship rows, captains, and nested crewmates while representing Herdr's Spaces and Agents.
Herdr continues to own terminals, workspace state, process relationships, and terminal commands.
Whether each ship represents a Space or a coordinator remains under discussion.
The implementation and verification below describe the published candidate, which does not yet satisfy this corrected visual requirement.

## Published candidate design, pending sidebar revision

Spaces remain Herdr spaces, including machine grouping, worktrees, menus, ordering, and creation.
Agents remain Herdr agents, including native parent relationships, sorting, pinning, attention, and keyboard navigation.
A parent agent is presented as a ship and captain.
Its nested agents are crewmates.
Character assignment changes appearance only and never writes terminal parent relationships or workspace labels.
Ordinary terminals remain ordinary terminals.
Native new-terminal actions inherit folders exactly as default Herdr does.
The mod does not create separate worker spaces, adopt terminals, reinterpret task status, or add shortcut bindings.

The shipped Spaces, tabs, menus, terminal controls, and workspace status remain in use.
The adapter changes agent status artwork and adds a ship fold control beside its captain.
Herdr retains the existing agent row and child row actions.
A nested terminal without a pane opens through native terminal.peek, including its native option to keep the terminal.
The mod must not silently convert that action into workspace creation.

## Compatibility approach

A native loading probe confirmed that Herdr rejects imports outside a mod directory.
Herdr exposes no documented status-artwork hook in the shipped Agents mod.
The installer therefore generates a local base module from the installed Agents source and derives the layout from the installed main layout.
The repository maintains the small artwork adapter, not another implementation of Herdr navigation.
Installation checks the methods and layout slots used by the adapter before writing files.
Unsupported structures fail with a useful message and preserve the existing installation.
Refresh the installation after a Herdr update to inherit changes to Agents and the main layout.
Directly referenced shipped mods receive their normal updates.
No promise of compatibility with every future Herdr version is possible without a supported extension hook.

A handwritten replacement would keep duplicating navigation and miss new Herdr features.
A static fork would require manual merging of those features.
Generating from the installed source keeps the required difference small and reviewable.

## Verification

Compare commands emitted by default and decorated Agents for selection, nesting, pinning, sorting, and keyboard order.
Verify that the generated layout differs only at approved presentation slots.
Test installation, upgrade, removal, modified files, unsupported upstream source, and legacy shortcut cleanup.
Use disposable local and remote sessions to verify navigation, typing, native creation, and preservation of process identities.
Inspect the native layout at compact and large sizes.
Keep interactive validation stopped if user input changes the test window.

## Candidate verification on 2026-11-14

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
The author must choose whether presentation should add firstmate grouping before that behavior is finalized.
