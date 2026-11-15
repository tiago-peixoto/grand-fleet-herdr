# Native acceptance review

## Current objective audit: native regions, 2026-11-15

The current objective preserves native Spaces and Agents and decorates their existing navigation.
The implementation remains under verification.
Historical nested-fleet evidence does not establish acceptance of the current adapter.

| Requirement | Evidence | Remaining proof |
| --- | --- | --- |
| Two independent sidebar scrolls | Executed native modules each contain one scroll at two widths and two sort modes; physical Spaces scrolling leaves Agents fixed | No known gap in tested layouts |
| Ships identify spaces containing captains | Mapping tests cover explicit identity, remote addresses, and multiple captains; Sunny and Red Force observed locally and remotely | No known gap in tested inventory |
| Clicking a ship selects its space | Physical Sunny and Red Force selection matches native space identifiers | No known gap in tested inventory |
| Every agent receives crewmember artwork | Generic membership tests and native rendering include agents without Firstmate labels; expanded and compact artwork inspected | No known gap in tested inventory |
| Native agent navigation and direct input | Command comparison covers selection, pinning, sorting, and previews; local captain, crewmember, and remote captain acknowledged typed input | Other native controls were not exhaustively retested |
| Firstmate remains unmodified | Adapter uses explicit mod settings and Herdr snapshots only | No Firstmate dependency added |
| Unsupported installations fail safely | 43 Python tests pass, including compatibility rejection and transactional installation | Future Herdr releases require validation |
| Reviewable implementation | Independent follow-up review found no further concrete defects | Review pipeline and updated pull request |

The current implementation passed 12 JavaScript tests and 43 Python tests.
Its native loading check and command comparison passed against `/private/tmp/op-app-31618`.
[Native interaction evidence](NATIVE-INTEGRATION.md#native-spaces-and-agents-verification-2026-11-15) records exact terminal and workspace identities.
Herdr reported no runtime errors after the recorded navigation checks.

## Release limitations

The project remains experimental and is not installed into the user's daily configuration by this work.
The [installation guide](INSTALL.md#core-build-used-for-current-recovery-verification) records the isolated recovery build used for historical checks.
A published Core build still needs separate recovery verification before release acceptance.
Exact pixel equivalence with the historical browser prototype is not the current contract because the author replaced its sidebar model.
Current native input checks use disposable interface fixtures rather than a new Firstmate delegation lifecycle.

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
