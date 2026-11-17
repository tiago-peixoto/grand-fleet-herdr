# Native acceptance review

## Generic fleets in the isolated lab, 2026-11-17

The isolated home ran Herdr App 0.1.16 with private Core 0.1.21 and disposable probe agents.
`herdr-app check` and `node tools/check-parity.mjs` passed against that home.

| Check | Result |
| --- | --- |
| One agent without a captain | The Space showed a ship, its name above the crew strip, and one crewmate |
| Two agents without a captain | The Space showed a ship and two crewmates from that ship's crew |
| Captain Space | A detected primary kept Sunny, Luffy, and its crewmate without a visible Space name |
| Crew choice at startup | After clearing stored discovery and crews, the captain received Straw Hats and the two fleets received Red Hair and Big Mom |
| Startup regression | Without the discovery wait, the same relaunch gave Straw Hats to a generic fleet while the captain was live |
| Compact sidebar | At 120 pixels, all three Spaces showed their ships with native status dots |
| Firstmate-style worker Space | Two terminals started with `herdr.space=fm-labtag` labels formed a Beasts fleet without a captain |
| Core restart | `hc server restart` kept all four Space identifiers, seven live terminals, and every stored fleet crew |
| Remote Space | A second local Core added with `hc machine add --via` produced a `gfr/` Space that received the Heart crew |
| Unavailable machine | Removing that machine kept the Heart crew, and adding it back restored the same Space with the same crew |
| Closed Space | Closing a local fleet Space released its stored crew |

The simulated parity check exercises the Choose ship and crew menu, the ship picker, and crew changes for generic fleets.
That menu was not opened physically, because posting mouse events would take focus from the person using the computer.
The second Core used a local command transport, not SSH to a separate host.

## Current release verification, 2026-11-17

The daily installation now includes the 38 new crewmembers from merged revision `c1603a3b5794e2f3f42bc32751407242c0ab7b43`.
Installation and the completed checks do not establish full release acceptance because [native text loss after pane zoom](https://github.com/tiago-peixoto/herdr-one-piece/issues/2) remains reproducible.
The [signed-application verification record](NATIVE-INTEGRATION.md#signed-application-and-daily-installation-2026-11-17) identifies the tested versions, commands, and limits.

| Check | Result |
| --- | --- |
| Daily installation | All 979 owned files matched their receipt, including 975 copied source files matching the checkout |
| Daily reopening | Settings, shortcuts, workspace inventory, terminal inventory, and machine inventory matched their pre-installation values |
| Application provenance | The installed Herdr App 0.1.16 passed strict signature verification without copying or signing the application again |
| Repository checks | 26 JavaScript tests and 47 Python tests passed |
| Native loading and command behavior | Both checks passed in the isolated home and daily home |
| Isolated interactions | Discovery, direct typing, manual crew selection, and reopening passed with disposable fixtures |
| Remote recovery | A 28-second transport interruption recovered automatically with the original terminal identity and final dimensions |
| Core foreground checks | All seven tests passed against clean upstream Core v0.1.21 |
| Native rendering | The minimal panel lost both text labels after zoom while its rectangle remained visible in native window capture |

The daily home had no live terminals before installation, so that refresh does not prove preservation of active daily conversations.
Today's isolated fixtures do not repeat the actual Firstmate delegation checks recorded on 2026-11-16.
The multiple-viewer recovery regression in [issue 3](https://github.com/tiago-peixoto/herdr-one-piece/issues/3) was not retested, so that issue stays open.
The complete upstream Core suite and every native control were not tested.
The rendering issue remains a release blocker rather than an accepted exception.

## Historical objective audit: native regions, 2026-11-15

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
| No mod-specific Firstmate patches or hooks | Adapter reads existing session evidence through Herdr file reads, plus mod settings and Herdr snapshots | Complete hc fleets need generic hc support; evidence identifies the tested revision |
| Unsupported installations fail safely | Python tests cover compatibility rejection and transactional installation | Future Herdr releases require validation |
| Reviewable implementation | Independent follow-up review found no further concrete defects | Review pipeline and updated pull request |

At this revision, all 24 JavaScript tests and the 9 compatibility tests pass, and the native behavior verifier passes against a disposable app home.
The suites define 46 Python tests, and the pipeline's test step runs the remaining installation and artwork tests.
Its native loading check and command comparison passed against `/private/tmp/op-app-31618`.
[Native interaction evidence](NATIVE-INTEGRATION.md#native-spaces-and-agents-verification-2026-11-15) records exact terminal and workspace identities.
Herdr reported no runtime errors after the recorded navigation checks.

## Historical release limitations, 2026-11-16

The project remained experimental and had not been installed into the user's daily configuration by that work.
The [installation guide](INSTALL.md#core-build-used-for-current-recovery-verification) records the isolated recovery build used for historical checks.
Current local Core release provenance and candidate recovery evidence are recorded in the installation guide.
Exact pixel equivalence with the historical browser prototype is not the current contract because the author replaced its sidebar model.
Historical native input checks used disposable interface fixtures.
The later local physical harness check below reached an actual delegated worker.
The candidate remote lifecycle passed, including the primary acknowledgment of completion marker 3.
The isolated app retains a different signature and bundle identity.
Final post-restart reconciliation completed at 20:55:14 UTC with all five terminals alive, but remote file bytes were not reread.

## Local physical harness evidence, 2026-11-16

The [local delegation trial](THIN-MOD.md#fork-main-acceptance-2026-11-16) used Firstmate fork main `653744ef90aad29eb4c65e3cbba59827b2d1690e`.
A later isolated harness verified physical ship and character navigation, direct input to the actual worker, and persistence of a manual crew choice.
The worker returned `LOCAL_UI_ACCEPTANCE_20261116_BENN_OK`, and working artwork appeared in both native regions.
Big Mom remained selected after reopening the isolated application.
The core and terminal creation identities, shell processes, foreground processes, and lifetime fields remained unchanged.
All 22 executable sections and all bundle resources matched the source application.
The harness had a different signature and bundle identity, so this does not establish exact signed-release or final merged-main acceptance.
Input stopped when computer control reported that the user changed the application.
Restoring Straw Hats and physical overflow scrolling remained outstanding in that report.
The report did not induce a blocked state or resolve the historical blocked-Luffy symptom.
The later candidate remote lifecycle passed delegation, direct input, acknowledgment, and transport recovery.
Historical remote worker fixtures do not establish that current lifecycle.

Private evidence is stored outside this repository under the workspace's `.task-notes/grand-fleet-multimachine-20261116/` directory.
`candidate-refresh/physical-report.md` records the physical checks and points to `adhoc-parity.json` for executable and resource comparisons.
`physical-preservation-receipt.md` supersedes the earlier outstanding scrolling, crew restoration, reopening, and reconnection checks.
All five terminal identities survived, and the remote worker replied `REMOTE_RECONNECT_20261116_KING_OK`.
`model-update-final-main.log` records successful normal source updates to final Firstmate main at 20:49:12 UTC.
`final-main-runtime-state/receipt.json` records four clean checkouts at `00311fea94041f7794f3b2690f7df70f6942687d`.
Its sequential snapshots also confirm matching private remote worker code and process-lock identities.
`remote-core-provenance-20261116T204958Z/receipt.md` establishes the running remote executable matches the official Linux 0.1.20 release.
`model-restart-final-main.log` records two successful secondmate restarts, zero nudged or unreachable targets, and exit code 0 at 20:51:34 UTC.
`final-mod-install/receipt.md` records installed mod main `436678c561bf42f0a39951f9ed574af003134d9d`, matching source files, passing checks, and five preserved terminal identities.
`final-mod-install/actual-primary-blocked-both-regions.png` shows seated Luffy in Spaces and Agents during a real primary approval prompt.
This closes current physical attention-state verification without explaining the historical capture failure.
`final-update-preservation-20261116T205246Z/receipt.md` confirms all 19 protected remote records and four original local process identities matched.
Default Core and holder socket ownership also matched.
The earlier timeout log and absent SSH socket remain explicit differences, not unchanged original metadata.
The protected remote comparison excluded private code and homes undergoing authorized updates.
`final-main-supervision/receipt.md` records final post-restart reconciliation at 20:55:14 UTC.
The actual primary resolved all six pending reply records, and the remote reply watcher reported zero pending messages.
All five terminals kept their address, creation time, shell PID, parent, keep, and die_with_parent values.
Only the two secondmate Claude processes changed, as expected from normal restart.
Session-lock discovery found the primary and both secondmates after restart, with crew choices and worker assignments unchanged.
The local worker's `hello.txt` was reread after restart, but remote file bytes were not reread in this reconciliation.
Both tasks remain open intentionally, with no merge, push, cleanup, or repeat dispatch.

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
