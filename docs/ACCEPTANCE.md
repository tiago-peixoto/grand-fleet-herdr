# Native acceptance review

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
| Offline machines show no stale live crew or unavailable actions | [Persistent machine navigation](NATIVE-INTEGRATION.md#persistent-machine-navigation) verifies unavailable presentation and foreground recovery | Passed; [automatic sidebar recovery](NATIVE-INTEGRATION.md#remote-recovery-without-window-input) observed, terminal wrapping unresolved |
| Worker attention and independent attention remain distinct and usable | [Native decision records](NATIVE-INTEGRATION.md#native-decision-records-connection) and [remote decisions](NATIVE-INTEGRATION.md#remote-decision-records-and-reconnect-validation) verify appearance, inspection, and clearing beside an independent entry | Passed for real local and [remote workers](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) |
| Worker identity and artwork survive changes in the fleet | Automated identity and assignment checks plus [generic Pirate state selection](NATIVE-INTEGRATION.md#native-generic-pirate-state-selection) | Passed within recorded cases |
| Sleeping, walking, and sitting artwork reflects worker status | [Chopper](NATIVE-INTEGRATION.md#native-worker-artwork-states), [Franky](NATIVE-INTEGRATION.md#native-franky-state-and-pause-checks), and [Pirate](NATIVE-INTEGRATION.md#native-generic-pirate-state-selection) native checks | State selection passed |
| Artwork animates continuously when enabled and stops when paused | [Animation observation limits](NATIVE-INTEGRATION.md#animation-observation-limits) found identical captures within each sample run | Sunny playback observed in the active native window; worker playback remains unverified |
| Labels and artwork remain visible after resizing and pane focus | [Rendering investigation](NATIVE-RESIZE-REPRO.md#live-drawable-pixels-and-foreground-comparison) found text in submitted frames but missing from native captures | Unresolved |
| Ordinary sessions remain usable and explicitly Unsupervised | [Native navigation](NATIVE-INTEGRATION.md#native-navigation-verification-after-unlocking) and controller routing tests | Passed within recorded cases |
| Removing the mod preserves sessions and fleet records | [Removal and reinstallation](NATIVE-INTEGRATION.md#native-removal-and-reinstallation) compares 39 live terminals and app-home files | Passed in the isolated home |
| Real firstmate delegation produces correctly discovered workers and preserves its authority and records | [Actual firstmate launch](NATIVE-INTEGRATION.md#actual-firstmate-worker-launch-and-inspection) verifies discovery, inspection, preserved records, backend input, and rejection of a mismatched task label | Passed for [fresh local delegation](NATIVE-INTEGRATION.md#fresh-delegation-through-the-native-firstmate-workspace) and the [fresh remote decision cycle](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) |
| Match the approved visual experience on the user's large-screen workflow | [Crew hierarchy](NATIVE-INTEGRATION.md#crew-hierarchy-against-the-prototype) covers 1280 × 820 and 1000 × 700 only | Partial; complete visual review remains open |

## Next acceptance gates

The [fresh remote workflow](NATIVE-INTEGRATION.md#fresh-remote-delegation-and-decision-cycle) verified coordinator registration, discovery, attention, inspection, direct return, and supervised confirmation.
Its report and project remained unchanged.
The isolated workflow establishes that integration path without establishing the remaining rendering and recovery requirements.

Resolve the difference between native captures and submitted drawing output before making another renderer change.
[Sunny now has visible runtime evidence](NATIVE-INTEGRATION.md#independent-split-recovery-and-visible-ship-motion) from consecutive native captures.
Worker animation still requires active-window evidence, not only correct image files.
Automatic sidebar recovery now has native evidence.
The latest isolated split recovery restored both terminal sizes within 2.14 seconds and preserved their processes.
A [transport trace](NATIVE-INTEGRATION.md#transient-size-during-transport-loss) explains the temporary resize as Core's configured size when no writable viewer remains.
Final native wrapping and input still require verification across the complete recovery scope.

Verify the new Arrange controls through native clicks, focus, close confirmation, workspace switching, and input.
The [core document implementation](NATIVE-INTEGRATION.md#core-document-preset-implementation) preserves actual pane identifiers and avoids modifying the installed layout.
The helper preserved five terminal identities across local and SSH layouts.
Conflict handling and missing confirmations have regression tests.
[Local native controls](NATIVE-INTEGRATION.md#native-preset-controls-and-worker-return) passed geometry, input, focus, close cancellation, and worker-return checks.
[Remote native controls](NATIVE-INTEGRATION.md#native-remote-preset-controls) passed preset selection, independent input, focus, and return to the split view.
Raising the window resolved that stale capture sufficiently to perform these checks.
The separate rendering and continuous-animation acceptance gates remain open.
The alternative terminal-block approach retains the [persistence and focus constraints](NATIVE-INTEGRATION.md#preset-persistence-and-focus-constraints).
The terminal-block proof establishes geometry and input, not safe lifecycle behavior.
Existing split creation and Focus pane controls do not prove preset switching.
Complete the large-screen visual comparison after the rendering discrepancy is resolved.

## Current automated check

The reviewed integration and worker-return update passed 120 JavaScript tests and 39 Python tests.
The native initial-render check passed.
These results do not close any runtime or visual gate marked incomplete above.
