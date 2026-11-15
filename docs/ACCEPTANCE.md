# Native acceptance review

The implementation objective is verified for the recorded isolated workflows.
Release acceptance remains separate and subject to the limitations below.
Read [current native verification](NATIVE-INTEGRATION.md#mod-only-association-2026-11-14) for observed behavior and limits.
The historical table describes retired implementations and must not be used as the current acceptance verdict.

## Current objective audit

This audit covers the approved native-flow objective, not the retired inspection model.
The approved native-flow reference is `/Users/tiago/Workspace/.lavish/grand-fleet-native-prototype/index.html` and its Lavish session `0782435952d24d57`.
The browser simulation in `prototype/flow` predates that reference and does not decide acceptance.
Recorded runtime evidence applies to its tested source and fixtures only.
Current stock checks supersede the rejected registration fixtures.

| Requirement | Current evidence | Status or remaining proof |
| --- | --- | --- |
| Machines retain actual identities beneath island names | Current sidebar source and recorded local/remote navigation | Local and remote captures confirm the hierarchy and identities |
| Explicit coordinator and worker relationships | Mod-owned captain choice and stock worker labels pass automated checks | Stock local and remote tasks, association, direct typing, navigation, reconnect, and normal cleanup passed |
| Ship folds only; captain appears first | Recorded native collapse/expand and captain selection | No known functional gap in tested inventory |
| Characters open existing writable terminals | Recorded captain focus, worker focus, and unplaced captain preview | Stock local and remote task flows passed without path corrections |
| Ordinary workspaces and terminals remain accessible | Native reproduction and fixes for unplaced terminals and workspace menus | No known functional gap in tested inventory |
| Native Settings, Add machine, plus, Files, and Changes | Recorded pointer checks in the current native window | No known functional gap in tested controls |
| Personal terminals inherit folder and machine without character assignment | Four-case default/mod comparison on local and physical remote machines | No known functional gap in tested cases |
| Native tabs, splits, grids, zoom, resizing, and closing | Twelve disposable shells plus local/remote pointer resizing | No known functional gap in tested arrangements |
| Navigation and reconnect preserve sessions and output | Process identity and output comparisons against default Herdr | Published recovery build remains unverified |
| No custom ownership or recovery workflows | Current thin-mod design and native command routing | Current main.js and fleet.js retain native commands and explicit metadata grouping |
| Approved artwork and sleeping/walking/seated states | Native local captures with simulated terminal status reports | Real local and remote tasks showed working and Done; coordinator approval showed Needs you |
| Surviving characters keep their assignments | Recorded Franky identity after closing Chopper | No known gap in tested removal case |
| Unavailable machines do not imply live activity | Recorded transport interruption hides captain artwork and shows Unavailable | No known gap for transport loss with a live remote service |
| Tested code, documentation, and reviewable pull request | Mod pull request exists; current review fixes have regression checks | Firstmate PR 8484 is closed; stock lifecycle checks passed and review corrections have regression coverage |

All 9 JavaScript tests and the command comparison passed on commit `97e0b40`.
All 42 Python tests passed before its presentation-only error-status correction.
The installed native loading check and command parity comparison also passed.
These checks cover grouping, artwork, installation, compatibility, and emitted native actions.
They do not replace the recorded interactive workflow checks.

Final visible verification against the approved native-flow reference remains pending.
Crew assignment and release changed after the last complete native comparison.
[Crew scrolling verification](NATIVE-INTEGRATION.md#crew-scrolling-verification) records direct input after scrolling with simulated fixtures only.
The published-Core release limitations below still apply.

See [current native verification](NATIVE-INTEGRATION.md#mod-only-association-2026-11-14) for the runtime observations and their limits.
See [local discovery](NATIVE-INTEGRATION.md#local-automatic-discovery-and-animated-states) for the simulated startup and state checks.
Stock cleanup and reconnect completed the tested lifecycle without modifying Firstmate.

## Remaining verification limits

- Before release acceptance, validate a published Herdr Core build containing the recovery fix.
  The [installation guide](INSTALL.md#core-build-used-for-current-recovery-verification) identifies the exact tested source build and checksum.
  The implementation goal delivers a reviewable pull request and does not authorize a release or daily installation.
- Complete pointer and keyboard comparisons for all native terminal controls remain unverified.
  Native keyboard checks now cover local and physical remote splitting, zoom, tab creation, and closing.
  The remote keyboard sequence also passed in default Herdr.
  Recorded pointer checks cover mod plus-menu creation, panels in both layouts, and resizing locally and remotely in both layouts.
- Captures establish the approved palette, artwork, hierarchy, and native controls, but not exact pixel equivalence with the prototype.
- Error-state artwork passed a physical native-window check with a simulated status producer.
  A real Firstmate failure was not induced.
- Independent coordinators can share a stock worker-group label.
  Leave such groups unlinked and use native worker navigation rather than assigning ambiguous workers to a captain.

Historical local and remote Claude tasks used the rejected Firstmate patch.
Their automatic grouping does not establish acceptance of the mod-only replacement.
Remote normal cleanup released the worktree lease and removed the worker terminal.
Local cleanup passed after correcting only the disposable task record to the pool path spelling.
The original failure remains tracked by [Firstmate issue 4708](https://github.com/kunchenguid/firstmate/issues/4708).
Pointer resizing passed locally and remotely in Grand Fleet and default Herdr with preserved processes and output.
Sleeping, walking, and seated animations passed with simulated status reports, and real tasks exercised corresponding status changes.
Local and remote captures confirm the approved sidebar hierarchy and artwork alongside native terminal controls.

## Historical acceptance review

The 2026-11-14 [terminal simplification](UI-SIMPLIFICATION.md) supersedes inspection-only input, presets, restoration, and custom close confirmation below.
The table records historical checks, not acceptance of the current terminal model.
Current validation and its limits are recorded above and in [Native verification](NATIVE-INTEGRATION.md#stock-cleanup-and-final-review-2026-11-14).

Reviewed on 2026-11-13 against VISION.md, the approved prototype, the current source, and the native verification record.
The implementation is not ready for final acceptance.
Passing checks below establish their stated scope only.
The native scenarios use isolated test terminals, including a physical remote server and a local supervised decision cycle.
Fresh local and remote delegation passed within the isolated workflows described below.

## Requirements and evidence

| Requirement | Evidence | Verdict |
| --- | --- | --- |
| Keep every machine accessible and identify each coordinator's machine | [Persistent machine navigation](NATIVE-INTEGRATION.md#persistent-machine-navigation) covers three machines, scrolling, disconnection, and reconnection | Passed for the tested inventory |
| Sunny only collapses its crew, with Luffy first | [Crew hierarchy](NATIVE-INTEGRATION.md#crew-hierarchy-against-the-prototype) verifies selection and grid preservation at two window sizes | Passed |
| Keep firstmate reachable from worker inspection | [Navigation verification](NATIVE-INTEGRATION.md#native-navigation-verification-after-unlocking) and [inspection reselection](NATIVE-INTEGRATION.md#native-inspection-reselection) cover return and repeated selection | Passed with test coordinators, [local ownership](NATIVE-INTEGRATION.md#direct-return-to-the-owning-firstmate), and [remote ownership](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) |
| Workers own separate inspection workspaces | [Session ownership](NATIVE-INTEGRATION.md#session-ownership) and [remote inspection](NATIVE-INTEGRATION.md#physical-ssh-inspection-controller) cover creation, reuse, and cleanup | Passed with labeled test workers |
| Supervised workers and secondmates cannot receive direct input through inspection | [Observed behavior](NATIVE-INTEGRATION.md#observed-in-the-isolated-application) and [remote input rejection](NATIVE-INTEGRATION.md#native-physical-server-worker-input-rejection) cover typing, paste, Return, and interrupt | Passed |
| Personal terminals remain independent inside coordinator workspaces | [Native controls](NATIVE-INTEGRATION.md#native-controls-after-unlocking-the-mac) and [remote restoration](NATIVE-INTEGRATION.md#native-physical-server-personal-shell-restoration) verify separate input and process identity | Passed |
| Focus and workspace changes preserve the existing grid and sessions | [Observed behavior](NATIVE-INTEGRATION.md#observed-in-the-isolated-application) and [crew hierarchy](NATIVE-INTEGRATION.md#crew-hierarchy-against-the-prototype) verify the existing three-pane arrangement | Passed for that arrangement |
| Switch between the prototype's equal-grid and chat-plus-terminals presets | [Native preset controls](NATIVE-INTEGRATION.md#native-preset-controls-and-worker-return) verify local geometry and input; [helper checks](NATIVE-INTEGRATION.md#core-document-preset-implementation) verify process identity locally and remotely | Passed for the tested three-pane local and two-pane remote inventories |
| Restore missing personal shells explicitly without claiming conversation recovery | [Remote restoration](NATIVE-INTEGRATION.md#native-physical-server-personal-shell-restoration) verifies the native action, directory, new process, and surviving neighbor | Passed over SSH, the remote shell connection |
| Close identifies its target and process-ending consequence | [Installed close routes](NATIVE-INTEGRATION.md#installed-close-routes) and [native controls](NATIVE-INTEGRATION.md#native-controls-after-unlocking-the-mac) cover buttons and installed shortcuts | Passed within the installed layout and shortcut scope |
| Offline machines show no stale live crew or unavailable actions | [Persistent machine navigation](NATIVE-INTEGRATION.md#persistent-machine-navigation) verifies unavailable presentation and foreground recovery | Passed; automatic sidebar recovery and native wrapping verified with the isolated candidate Core |
| Worker attention and independent attention remain distinct and usable | [Native decision records](NATIVE-INTEGRATION.md#native-decision-records-connection) and [remote decisions](NATIVE-INTEGRATION.md#remote-decision-records-and-reconnect-validation) verify appearance, inspection, and clearing beside an independent entry | Passed for real local and [remote workers](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) |
| Worker identity and artwork survive changes in the fleet | Automated identity and assignment checks plus [generic Pirate state selection](NATIVE-INTEGRATION.md#native-generic-pirate-state-selection) | Passed within recorded cases |
| Sleeping, walking, and sitting artwork reflects worker status | [Chopper](NATIVE-INTEGRATION.md#native-worker-artwork-states), [Franky](NATIVE-INTEGRATION.md#native-franky-state-and-pause-checks), and [Pirate](NATIVE-INTEGRATION.md#native-generic-pirate-state-selection) native checks | State selection passed |
| Artwork animates continuously when enabled and stops when paused | [Active native animation](NATIVE-INTEGRATION.md#native-wrapping-recovery-and-active-worker-motion) distinguishes playing, paused, and resumed worker frames | Sunny and Franky playback observed; Franky pause/resume passed in the active native window |
| Labels and artwork remain visible after resizing and pane focus | [Earlier rendering investigation](NATIVE-RESIZE-REPRO.md#live-drawable-pixels-and-foreground-comparison) found missing captured text; [current resize checks](NATIVE-INTEGRATION.md#compact-attention-cards-and-current-resize-checks) retain it | Unresolved |
| Ordinary sessions remain usable and explicitly Unsupervised | [Native navigation](NATIVE-INTEGRATION.md#native-navigation-verification-after-unlocking) and controller routing tests | Passed within recorded cases |
| Removing the mod preserves sessions and fleet records | [Removal and reinstallation](NATIVE-INTEGRATION.md#native-removal-and-reinstallation) compares 39 live terminals and app-home files | Passed in the isolated home |
| Real firstmate delegation produces correctly discovered workers and preserves its authority and records | [Actual firstmate launch](NATIVE-INTEGRATION.md#actual-firstmate-worker-launch-and-inspection) verifies discovery, inspection, preserved records, backend input, and rejection of a mismatched task label | Passed for [fresh local delegation](NATIVE-INTEGRATION.md#fresh-delegation-through-the-native-firstmate-workspace) and the [fresh remote decision cycle](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) |
| Match the approved visual experience on the user's large-screen workflow | [Visual comparison conclusion](NATIVE-INTEGRATION.md#visual-comparison-conclusion) covers hierarchy, artwork, terminal arrangements, controls, and attention at 1000 × 700 through 1728 × 994 | Appearance review passed for the recorded inventories; rendering reliability remains unresolved |

Task records also recover after closing a sidebar during a read, as verified by [the native lifecycle reproduction](NATIVE-INTEGRATION.md#task-record-refresh-after-closing-a-sidebar).

## Historical acceptance gates

1. Resolve the earlier native rendering discrepancy.
   Current resize checks pass in both isolated applications, but the earlier missing captured text remains unexplained.
   The [controlled comparison](NATIVE-INTEGRATION.md#controlled-default-and-mod-reconnection-comparison) preserved output through reconnection in both layouts.
   The user confirmed that clearing occurred only before the mod counter began.
   An explicit `clear` in the test command explains that clearing.
   The historical captures do not independently establish a physical display failure.
   Do not introduce a renderer change without a reproducible cause.
   The restored text-only probe also passes its latest split and enlargement checks.
   The unresolved evidence is tracked in [herdr-app issue 1022](https://github.com/herdrdev/herdr-app/issues/1022).

2. Resolve the unexplained first machine shortcut miss.
   Later selections worked, including immediately after switching applications and cancelling Fleet setup.
   Those passing samples do not explain the original unchanged viewport.
   Do not claim a navigation fix without reproducing its cause.

3. Verify delivery of the accepted external Core recovery patch.
   Native remote recovery preserves process identity, readable wrapping, settled dimensions, and independent input with the isolated candidate.
   The complete suite, formatting, dependency checks, and native and Windows Clippy checks passed on the isolated 0.1.21 checkout.
   Upstream Linux, macOS, and Windows test jobs passed, alongside lint, upgrade, and the aggregate check.
   The native application was not manually tested on Windows.
   The mod alone cannot supply this Core fix.
   [Herdr Core PR 271](https://github.com/herdrdev/herdr-core/pull/271) merged on 2026-11-13 at 19:52:25 UTC with all six checks passing.
   Upstream acceptance is complete.
   The official Core update manifest still advertises 0.1.21, whose tagged source lacks the recovery patch.
   Release validation therefore awaits a newer published Core build containing the fix.
   The merged-source build now preserves existing sessions and settles remote dimensions after transport recovery.
   The measured transition is recorded in [merged-source reconnection](NATIVE-INTEGRATION.md#merged-source-remote-reconnection).
   A subsequent native input check reached the shell, but an application capture did not display its output.
   [The stale-output capture](NATIVE-INTEGRATION.md#merged-source-input-reaches-the-shell-but-the-existing-view-stays-stale) remains unexplained.
   A later read-only observer received the output, but these observations were not simultaneous.
   A later [fresh-prompt recovery](NATIVE-INTEGRATION.md#fresh-prompt-recovery-on-the-merged-build) passed native input, visible output, and settled dimensions on the merged build.
   That passing case does not explain the earlier render interruption or corrupted terminal history.

The local and remote Arrange controls already passed native checks for presets, input, focus, and returning to the existing split view.
Those completed checks are recorded in the requirements table rather than repeated as outstanding work.

## Historical automated check

These counts describe the retired sidebar lifecycle implementation.
The sidebar lifecycle fix passed 122 JavaScript tests and 39 Python tests.
The native initial-render check passed.
These results do not close any runtime or visual gate marked incomplete above.
