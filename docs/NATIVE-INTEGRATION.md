# Native verification

The native mod is experimental and has not passed the complete acceptance policy in VISION.md.
Verification uses Herdr App 0.1.15 and hc 0.1.20, the command-line interface to Herdr's terminal service.
The installed Herdr guidance and declarations define the integration contract.
The browser prototype remains the visual baseline, with VISION.md resolving behavioral conflicts.

## Session ownership

Core terminal records do not identify current spaces or tabs.
The mod derives terminal locations from panes and spaces.
Terminal labels can describe stale locations and do not establish current ownership.

Firstmate workers carry firstmate.home and firstmate.task labels without a core parent relationship.
Coordinator registration explicitly supplies the role and home on a specific machine.
Registration also records terminal creation time to reject reused terminal identifiers.
Ambiguous home registrations do not assign workers to an arbitrary coordinator.

Herdr does not document an input-disabled terminal block.
Worker and secondmate inspection therefore uses a read-only text editor populated through hc read.
The implementation parks the original terminal before opening or selecting inspection.
Herdr cannot create an empty workspace through its documented commands.
A temporary shell creates the workspace, and the mod ends that shell after creating the inspection tab.
The worker never receives workspace labels during this operation.
If creating inspection fails, the worker stays parked and its process continues.
Parking preserves the process while removing its writable pane.
Native selection, clipboard copying, and long-output scrolling passed in worker inspection.
Hidden inspection polling and interrupted inspection creation passed the runtime checks recorded below.
Native presentation across those transitions remains unverified.

## Observed in the isolated application

The test application uses a separate app home and terminal service.
All terminals in these checks are disposable shells, not the user's working sessions.

- Firstmate navigation restored a three-pane arrangement containing its terminal and two personal terminals.
- Process identifiers, creation times, commands, and states matched before and after worker navigation and grid restoration.
- Worker inspection rejected typed input, pasted commands, Return, and interrupt input.
- Secondmate inspection rejected typed input, pasted commands, Return, and interrupt input.
- Captured terminal output remained byte-identical across both inspection input checks.
- The secondmate process remained alive after parking and inspection.
- Adding a personal terminal beside secondmate inspection created a separate terminal pane.
- Secondmate workspaces remained associated with their coordinator after the coordinator terminal was parked.
- A personal terminal accepted a test command while the secondmate output remained byte-identical.
- Restarting the isolated application preserved both secondmate and personal terminal process identities.
- The personal terminal Close dialog identified its machine and explained process termination without changing firstmate obligations.
- Confirming Close ended that personal process while the secondmate retained its process identifier, creation time, and live state.
- The header restored the zoomed inspection pane even when the personal terminal retained focus.
- Injecting an inspection creation failure preserved the worker process without writable adoption and ended the temporary shell.
- Retrying opened inspection successfully and ended its temporary shell.
- Typed input, Return, and interrupt input after retry left the worker output byte-identical.
- An independent blocker appeared with an Independent label and an Open session action.
- Opening an unplaced independent session created its own workspace and preserved its process identity.
- Input reached that independent session while the worker output stayed byte-identical.

These checks establish the tested interactions, not every keyboard route or lifecycle transition.
Native initial-render validation also passes with `herdr-app check mods/one-piece`.
That command does not establish runtime input isolation or process preservation.

## Automated coverage

Run the pure session-model checks with `npm test`.
They cover machine boundaries, offline filtering, reused identifiers, ambiguous registration, stable artwork assignment, and inspection eligibility.
They also cover actual pane ownership and exclusion of registered secondmates from worker lists.
Controller tests execute the real inspection method against a simulated native host.
They cover creation failure, remote placeholder routing, visible cleanup failures, and independent workspace ownership.
Attention checks distinguish independent blockers from supervised sessions and omit unavailable machines.
Firstmate navigation tests require an explicit choice between live firstmates and skip stale or offline registrations.
The shortcut and inspection return button share the same navigation method.
Two controller checks cover disconnection while an inspection read remains pending and disconnection before its response arrives.
Both require clearing prior output and rejecting the late response.
These checks reproduce the timing conditions through a simulated host, not a live remote disconnection.
Simulated routing does not establish live remote behavior.
Setup callback checks reproduce stale registrations blocking replacement and selections ending after the dialog renders.
Linking now validates the selected terminal identity and machine availability again before saving.
An explicit link replaces stale registrations for that home on that machine while preserving live conflicts and other machines.
Additional checks reject reused terminal identifiers and machines that disconnect before linking.
Local coordinator replacement subsequently passed native click-through verification, as recorded below.
Replacement through a physical remote connection remains unverified.

Run artwork and installer checks with `python3 -B -m unittest discover -s tests -p 'test_*.py' -v`.
Installer tests use temporary directories and do not modify the user's Herdr configuration.
See docs/INSTALL.md for ownership checks, rollback behavior, and interrupted-operation limits.

## Remaining acceptance work

- Resolve the display-versus-capture discrepancy documented in docs/NATIVE-RESIZE-REPRO.md.
- Verify native error presentation and retry interaction for the remote interruption cases covered below.
- Verify cleanup retries when a temporary shell cannot be removed.
- Finish the close-route audit against the installed layout and key bindings.
  Native pane Close and keyboard routes have evidence below, while host commands can bypass the mod's guards.
- Verify attention navigation and visible error reporting during remote transitions.
- Verify animation timing in the running native interface.
  Chopper, Franky, generic Pirate, and the pause control have native state-selection evidence below.
- Compare the native layout with the approved prototype at the target screen sizes.

Local-transport Restore interaction, hidden-window directory tracking, and physical SSH process recovery have passed the checks recorded below.
Those results do not establish recovery after physical host failure.
Do not report the mod as production-ready until the remaining checks and the complete vision acceptance review pass.

## Layout restoration capability check

An isolated native test created an anchor shell in /tmp and a personal shell in the repository directory.
The documented terminal.open command accepted an explicit folder and placed the personal shell beside the focused anchor.
An explicit nonexistent directory failed without silently substituting another directory.
After ending only the disposable personal shell, another terminal.open recreated it in the recorded directory and original workspace and tab.
The replacement had a different process identifier and creation time.
The adjacent anchor retained its address, process identifier, creation time, and live state.
Evidence is recorded in the isolated test workspace as restore-anchor-before/after.json and restore-shell-before/after.json.
This verifies the creation primitive, not the Restore layout interaction or remote recovery.
The documented pane API exposes neither split geometry nor an operation that restores a saved tab tree.
Herdr itself preserves splits for kept terminals lost during a core restart, replacing their programs with shells at the same addresses.
The mod must distinguish that host recovery from surviving processes and must not replay an agent command.

The header now opens an explicit Restore layout dialog listing missing personal shells on connected machines.
Shell records use actual pane directories, workspace and tab ownership, and process creation times.
Known finished terminals are removed from restoration records, and surviving terminals are never recreated.
Registered coordinators and supervised workers are excluded.
Restoration starts the machine's default shell with explicit directory and placement labels, without replaying previous commands.
The pane header labels replacement processes New shell.
A persisted unique shell name prevents an uncertain request from creating duplicates while that shell remains live.
The controller waits for pane attachment before recording successful placement.
An isolated native harness executed the actual controller with a recorded disposable shell that had been ended and removed.
The replacement appeared in its recorded workspace, tab, and directory with the new-process marker persisted.
The adjacent anchor retained its process identifier, creation time, and live state.
The harness required a local copy because Herdr rejects imports outside a mod's directory.
Its test tab was closed afterward to prevent the fixture from running again.
Fifty-two JavaScript checks cover the model, controller, and shell records.
The dialog rendered in the native application.
Restoration through its buttons remains unverified.
Arbitrary split dimensions are not exposed by the documented API and are not restored by this action.


## Firstmate navigation validation in progress

The original shortcut selected the first registration when two live firstmates were registered.
The isolated app reproduced this by moving from the independent workspace to `op-captain` without asking which firstmate to open.
The controller now opens a chooser when multiple firstmates are available and opens the sole available firstmate directly.
When none is available, the chooser explains how to reconnect or register a session.
Fifty-two JavaScript checks, seventeen Python checks, and the native initial-render check pass.
The running app reports the chooser overlay without errors after the change.
Native computer control displayed both firstmate choices with their machine names.
Selecting test-captain opened its coordinator workspace with two personal terminals.

## Separate-machine transport check

A second disposable terminal service uses its own session, socket, and configuration directories.
The isolated app connects to it through hc machine add with a local command transport.
Herdr adopted op-remote-lab/t1 into a machine-qualified workspace without confusing it with local t1.
Blocking new transport connections and ending only the verified connection process changed the machine to unreachable.
A direct query to the separate service confirmed that its shell retained its process identifier and creation time while disconnected.
After restoring transport, the machine returned to connected and its workspace exposed the same live shell.
Before, disconnected, and after records are stored under .superpowers/native/remote-*.json.
This exercises the remote protocol on one computer, not SSH or a separate physical host.
Native inspection showed the remote worker before disconnection.
Disconnection replaced its machine list with Machine unavailable and cleared the worker output.
Both Focus controls disappeared while the machine was unavailable.
Reconnection restored the worker output and controls.
The worker retained process identifier 6041 and creation time 1794522709429 across that transition.

## Remote inspection and cleanup recovery

The actual inspection controller opened a worker view on the separate terminal service.
The worker retained its process identifier and creation time without writable workspace labels.
The temporary shell ended after the inspection tab opened.
A test view recorded the actual editor value and machine state through the inherited refresh method.
Disconnecting transport changed the machine to unavailable and replaced prior output with the unavailable message.
Reconnection restored fresh output from the same worker process.
Native screenshots subsequently confirmed the disconnected and reconnected presentations.
Remote input rejection still requires its own interaction check.

Disconnecting during workspace creation reproduced a leaked temporary shell.
The previous implementation forgot cleanup after its kill request failed.
Temporary shells now receive unique names and ownership labels, with their cleanup records persisted before launch.
Cleanup rechecks the name, label, and machine before ending a process by its unique name.
A Retry cleanup action retains failed records and removes successful ones.
The sidebar also discovers labeled temporary shells left by an interrupted launch.
A native failure fixture confirmed that the new record survived disconnection.
After reconnection, the actual cleanup controller ended only the named temporary shell and cleared its pending record.
The worker remained live.
The Retry cleanup button's appearance and click-through remain unverified.

## Additional review corrections

A disposable personal shell running Vim reproduced the loss of its restoration record.
Herdr classifies the foreground editor separately from the underlying shell.
Existing records now follow the same live process while it runs a foreground program.
New processes still require shell classification before being recorded.
The native application retained the personal-shell record while Vim ran after the correction.

Controller review reproduced a stale confirmation targeting a replacement at the same terminal address.
The mod now carries creation time in its own Close dialog and rechecks process identity before ending it.
The check also rejects sessions that became supervised or whose machine became unavailable.
These rejection cases pass in the simulated native host.
Native clicking confirmed that Close ended disposable terminal t1b.
The firstmate, worker, secondmate, and two existing personal terminals retained their process identifiers, creation times, and live states.


## Inspection interaction and cleanup corrections

Native selection copied a marker from worker inspection into a separate personal terminal.
Scrolling exposed lines 70 through 90 of a 100-line fixture.
Typing into inspection left the worker prompt unchanged.
The pasted marker was cleared from the personal terminal without execution.

Temporary inspection shells are excluded from personal restoration records.
A regression test reproduced their accidental inclusion before the correction.
Cleanup retries now skip inspection operations still creating their workspaces.
Successful cleanup suppresses rediscovery from a stale terminal snapshot until the snapshot catches up.
Offline pane controls are hidden, and their callbacks recheck machine availability.
Six controller regressions cover these guards, including controller closure and identical names on separate machines.
These timing checks use a simulated host and still need native interaction validation.

## Current verification limits

The initial draft passed 63 JavaScript checks and 17 Python checks.
Review reproduced secondmate registration leaving its original terminal writable.
Linking now parks that terminal before registration and waits for inspection before closing setup.
Failed inspection leaves the process running without direct input, and setup retains the registered session for retry.
Cancellation guards prevent later setup actions after its view closes.
Review also reproduced navigation selecting a surviving personal terminal after its neighboring inspection pane closed.
Inspection records now include the pane identity and rebuild missing inspection beside the surviving personal terminal.
Regression checks exercise these cases through the simulated host.
Native initial rendering passes.
An isolated runtime harness subsequently invoked the actual linking and inspection methods against Herdr's live command interface.
Linking secondmate t1c removed its writable pane and created inspection.
Closing only inspection preserved personal terminal t1f beside it.
Reopening inspection created a new pane in the same workspace and tab.
Both processes retained their identifiers, creation times, and live states.
The secondmate remained parked without a writable pane, and Herdr reported no errors or remaining overlays.
The evidence is recorded in .superpowers/native/pane-recovery-result.json.
This verifies live controller behavior, not clicking setup or visually inspecting the recovered layout.

The offline inspection caption now says terminal output is unavailable instead of describing disconnected output as live.
Initial rendering passed after that change, but its disconnected appearance has not been inspected again.
Native window access subsequently returned cgWindowNotFound while the isolated application remained running and responsive through its command interface.
That observation failure does not invalidate previously recorded interactions or establish a new native pass.
The application was not restarted to work around it.

## Built-in tab closure gap

The original layout included Herdr's shipped tab bar, whose close control calls tab.close directly.
The installed global Cmd-W binding calls the same command.
A disposable non-final tab held terminal t1g with process identifier 62989 and creation time 1794525281611.
Calling tab.close ended that shell with reason killed and showed no confirmation overlay.
The custom pane-header confirmation therefore does not satisfy the Close requirement for every normal entry point.
Layout-specific shortcut bindings are documented, but live in the shared keys.json file.
Editing that file also stops Herdr from automatically replacing untouched default shortcuts during upgrades.
The implementation must account for that installation consequence and preserve unrelated user bindings.

The layout now uses One Piece tab controls and one shared confirmation flow for tab and pane closure.
The dialog identifies affected terminals and machines, distinguishes preserved inspection processes, and revalidates identities before closing.
The installer adds layout-specific Cmd-W and Cmd-Shift-W bindings while preserving unrelated bindings.
Ownership records support upgrades, rollback, and removal without claiming ownership of the entire keys file.
See docs/INSTALL.md for shortcut precedence and the effect on automatic default-shortcut updates.
Direct host commands and more-specific user bindings can still bypass the mod.
Native click-through and shortcut delivery for the new controls remain unverified because window capture is unavailable.

After the close-control changes, all 78 JavaScript tests and 30 Python tests pass.
Herdr's initial-render check also passes for the updated mod.
These checks do not establish native shortcut delivery or click behavior.

## Live shared Close controller

An isolated runtime harness loaded the production controller and invoked closeScope with captured target records.
The first attempt rejected an incomplete app record while a new terminal was still appearing.
No process was closed during that rejection.
After both terminal records became available, pane closure ended only the selected disposable process.
The neighboring process retained its identifier, creation time, and live state.
Tab closure then ended the remaining disposable process.

Closing secondmate inspection through the same method preserved secondmate t1c and neighboring personal terminal t1f.
Their process identifiers remained 59304 and 64244, respectively, with unchanged creation times.
Reopening inspection restored a new pane in the original tab without exposing a writable secondmate pane.
Herdr reported no remaining overlays or errors.
The captured records are in .superpowers/native/close-runtime-result.json and .superpowers/native/close-inspection-result.json.
These checks invoke the actual controller against the live terminal service.
They do not establish button rendering, click delivery, or keyboard delivery.

## Hidden inspection polling

A disposable worker emitted numbered lines every quarter second without accepting input.
A test view used the production inspection initialization, read-only editor, timer, and refresh method.
Its instrumentation recorded editor contents and whether its tab was selected in the active space.
The editor reached line 124 while selected, then line 202 while another tab was selected.
After reselection, the editor reached line 251 without a read error.
The worker retained process identifier 65671 and its original creation time throughout the test.
Closing the test view did not target the worker process.
The fixture exits after 120 seconds rather than leaving a permanent test process.
Records are saved in .superpowers/native/hidden-fixture.json and .superpowers/native/hidden-result.json.
This verifies hidden-tab polling and process preservation through the live runtime.
It does not verify native presentation after reselection while window capture remains unavailable.

## Workspace and inspection closure corrections

Controller review reproduced personal-terminal creation inside a writable worker workspace through the header.
The header now uses the same ownership guard as the tab bar during rendering and activation.
Firstmate registration rejects parked sessions without a writable workspace and rechecks worker labels before saving.
Inspection closure validates the actual view independently of a removed or replaced inspected process.
Its confirmation does not claim an unavailable process remains preserved.

A live regression found that pane.close on a tab's final inspection pane opened Herdr's own confirmation after the mod's confirmation.
After validating the target, final-pane closure now uses confirmed tab.close.
When sibling panes exist, closure still targets only the selected pane.
Regression checks include a sibling appearing after confirmation opens and preservation of unrelated tabs.

The isolated runtime rejected promotion of parked secondmate t1c without changing coordinator registration.
It created inspection for disposable worker t21, ended and removed that worker, and closed the remaining inspection successfully.
No second confirmation or error remained after closure.
The record is saved in .superpowers/native/audit-runtime-result.json.
All 86 JavaScript checks and Herdr's initial-render check pass after these corrections.
Header click delivery remains unverified while native window capture is unavailable.

## Directory tracking without sidebar rendering

A live test changed a disposable personal terminal's directory after selecting another tab.
Herdr reported the new directory, but the saved shell record retained the previous directory for the full observation period.
The native window was unavailable for capture during this test.
The controller only updated these records while rendering its sidebar.
The installed guide describes live-data invalidation, but that did not produce a fresh saved record in this observed state.

The sidebar now records shell directories on a one-second timer as well as during rendering.
It writes shared state only when the records differ and does not request repeated window redraws.
The retry updated terminal t2f's saved directory to /private/tmp/op-cwd-verification/changed directory while its tab remained unselected.
The process retained identifier 61090, its creation time, and its live state.
The test then closed only its disposable tab.
The result is saved in .superpowers/native/cwd-runtime-result.json.
All 87 JavaScript tests and Herdr's initial-render check pass after this correction.
This establishes directory tracking without sidebar rendering, not native Restore button delivery or recovery after app termination.

## Remote restoration controller

An isolated runtime test supplied a missing-shell record for op-remote-lab beside a surviving disposable shell.
The test invoked the production restoreShell method through Herdr's live command interface.
The record was deliberately supplied to test restoration, rather than produced by a simulated machine failure.
Herdr created op-remote-lab/t8 in the recorded remote tab and directory, including a directory name containing a space.
The remote labels used local workspace identifiers without duplicating the machine prefix.
The saved record identified the shell as a new process on op-remote-lab.
Calling restoration again with the original missing record created no duplicate shell.
The neighboring remote shell and local firstmate retained their process identifiers, creation times, and live states throughout restoration.
The test then closed its disposable remote tab and confirmed both disposable shells finished.
Herdr reported no remaining overlays or errors.
The captured evidence is saved in .superpowers/native/remote-restore-result.json.

This verifies controller behavior across two isolated Herdr cores connected through the local command transport.
It does not verify an SSH connection, a separate physical machine, failure detection, or clicking the native Restore button.

## Native controls after unlocking the Mac

Native screenshots and clicks worked again in the isolated Grand Fleet Lab window.
The active layout was stale and contained a docked diagnostic panel.
Applying the repository layout through layout.set restored the custom tab bar and removed that diagnostic panel from the layout.

Clicking the worker opened its inspection workspace without offering a personal-terminal creation button.
Back to firstmate opened the chooser because the test fleet contains two firstmates.
Choosing test-captain returned to its existing three-pane grid.
Clicking Your terminal created disposable terminal t2g inside that coordinator workspace.
Its pane Close button displayed the terminal address, machine, process-ending consequence, and unchanged firstmate obligations.
Confirming closed t2g and preserved t1, t2, t3, and t4.

The isolated home had no installer receipt or scoped close shortcuts.
After closing its window, the prior mod and layout were moved to a temporary backup.
The installer then installed the repository assets and scoped shortcuts into the initialized home.
The closed application process needed relaunching before its window accepted commands again.
No core process was restarted.

In the installed layout, Command-Shift-W opened the custom pane confirmation for newly created terminal t2h.
Confirming closed only t2h.
Command-W on the firstmate tab listed t1, t3, and t4 with their machine and process-ending consequences.
Cancelling retained the original grid.
A subsequent hc ls --all --json reported t2g and t2h finished and all four preserved terminals live.
The captured terminal states are saved in .superpowers/native/native-close-resume.json.
Command-W also closed disposable tab Native close verification after confirmation, without a second confirmation dialog.
Sprite motion was resumed after these checks.

Focusing worker inspection reproduced missing static text and artwork in the first captured frame.
A later native frame showed the missing content again without another interaction.
These control checks do not resolve that intermittent rendering defect or establish every remaining acceptance criterion.

## Native worker artwork states

A disposable status program ran inside the existing isolated test-worker terminal.
It emitted Herdr's status escape sequence for idle, working, and blocked in turn.
Native screenshots showed sleeping Chopper for Idle, upright walking artwork for Working, and seated Chopper for Needs you.
Both the sidebar and inspection header changed with the reported status.
The blocked state also added the worker to the attention list and increased the count from one to two.
The program was then exited and its test status reset.
This verifies live state-to-art selection for Chopper, not every character or every animation frame.

## Native Restore interaction

Clicking Restore layout opened the list of missing personal terminals in Grand Fleet Lab.
The dialog explained that restoration creates new shells without resuming commands or conversations.
Clicking Create new shell for the isolated op-remote-lab/t5 record created op-remote-lab/t9 in /Users/tiago.
The completed record disappeared from the list and a success notification identified the new terminal.
Comparing hc ls --all before and after showed exactly one added terminal and no changed existing terminal records.
This verifies native restoration through the local command transport, not SSH or recovery after physical machine failure.
The observations are saved in .superpowers/native/before-native-restore.json and .superpowers/native/after-native-restore.json.

## Navigation gaps found during native verification

Selecting a supervised worker through the mod's tab bar opened a writable terminal instead of inspection.
Typing a marker into disposable worker t2p confirmed that the shell received input.
A separate live independent session, t2n, had no pane and no sidebar entry while working.

The navigation change routes mod-owned tab, workspace, session, and Focus actions through inspection when the destination tab contains a supervised session.
It preserves neighboring personal panes.
Independent sessions without workspaces now appear under Unsupervised and reuse the existing workspace attachment flow.
This guard does not cover startup selection, host shortcuts, direct terminal clicks, or command-line navigation.
It is presentation behavior, not a security boundary.

Fresh verification passed 101 JavaScript tests, 30 Python tests, native initial rendering, and git diff --check.
The controller tests cover late supervision changes, unavailable machines, parking failure, mixed personal panes, and independent workspace attachment.
Native click verification initially stopped because window capture failed for both isolated applications.

Review reproduced cancellation when parking destroyed the pane header that initiated inspection.
Both Focus controls now dispatch to the persistent sidebar controller before opening inspection.
Two regression tests reproduced the cancellation before this correction and pass afterward.
A separate review found no further concrete issue.

A live controller test opened inspection for t2p and attached the existing independent session t2n to a workspace.
Their process identifiers, 6648 and 62063, and creation times remained unchanged.
Comparison also preserved all 28 unrelated live sessions.
Evidence is saved in .superpowers/native/navigation-independent-runtime-result.json and .superpowers/native/navigation-independent-preservation-result.json.
These controller checks do not verify native Focus command delivery or clicks.
The corrected source was subsequently installed and checked through native interactions, as recorded below.

## Native navigation verification after unlocking

The installer upgraded the isolated Grand Fleet Lab home to commit 8c571bb with its window closed.
Only the isolated application was relaunched.
The terminal core remained running.

Clicking the pane header Focus control on worker t2m opened its inspection workspace.
Typing a distinctive shell command into the inspection did not deliver it to the terminal.
A subsequent terminal read contained no marker.
The worker retained process identifier 61998 and creation time 1794538606650.
The temporary cleanup indicator disappeared when the asynchronous transition completed.

A fresh independent terminal, t2s, appeared in the sidebar without an existing workspace.
Clicking its row attached that same session to a personal workspace.
The native pane displayed its name and Your terminal.
Its process identifier 37460 and creation time 1794568707485 remained unchanged.

Clicking the native tab button for fresh supervised worker t2t opened inspection instead of retaining a writable pane.
Its process identifier 90042 and creation time 1794568744644 remained unchanged.
The inspection displayed the direct-input-disabled explanation.
These checks verify native command delivery for the pane header Focus control, the tab button, and the unplaced independent row.
They do not establish every navigation entry point or eliminate the documented host-navigation limitations.
The before-and-after terminal records are saved under .superpowers/native/ with focus-worker, unplaced-click, and tab-click prefixes.

## Native inspection reselection

The installed mod displayed test-worker inspection after raising the Grand Fleet Lab window.
Selecting the pinned test-captain row displayed its existing three-pane grid with terminals t1, t3, and t4.
Selecting test-worker again displayed its inspection text, Chopper artwork, and direct-input-disabled explanation.
The native accessibility field disappeared during firstmate selection and returned during worker selection.
Separate screenshots showed the coordinator grid and the subsequent inspection view.
This verifies visible inspection after leaving and returning through the sidebar in the tested layout.
It does not resolve the separate enlargement discrepancy or prove every animation frame.

## Native coordinator registration replacement

The Fleet setup dialog linked disposable firstmate t2w to home native-registration-replacement on the local machine.
The saved registration recorded its creation time, 1794572628250.
After disabling shell recovery for this fixture, hc kill ended t2w.
A fresh shell, t2x, appeared in the same workspace.
The setup dialog excluded the ended shell and offered the replacement.
Linking t2x to the same home closed the dialog and replaced the old registration.
Exactly one registration remained for that home, with creation time 1794572813097.
All four unrelated coordinator registrations remained identical.
All 32 unrelated live terminal summaries from hc ls --all remained identical.
Those summaries omit process identifiers, so this comparison does not independently prove process preservation.
Evidence is saved in .superpowers/native/registration-before.json, registration-after.json, and registration-preservation-result.json.
This verifies replacement on the local machine through native setup controls.
It does not establish replacement across a physical remote connection.

## Native Franky state and pause checks

The existing isolated worker t8 ran the disposable status program used for Chopper verification.
Native screenshots showed sleeping Franky for Idle, upright Franky for Working, and seated Franky for Needs you.
Both inspection headers and the sidebar reflected each transition.
The blocked transition added an attention entry and changed the count from one to two.
Clicking Pause motion changed the control to Play motion and persisted paused=true.
While paused, changing the worker to Working updated its artwork and text and removed its attention entry.
The pause preference therefore leaves status updates active.
The production art selector uses static PNG assets while this preference is enabled.
These observations verify state selection and the native pause control, not frame-by-frame animation timing.
Clicking Play motion restored paused=false.
Exiting the status program returned t8 to its original shell with process identifier 21083 and creation time 1794520892484.


## Physical SSH recovery

The isolated lab connected to the separate firstmate-hz machine through SSH, the encrypted remote connection protocol.
Its test service used a dedicated session, op-hz-native-31618, and the local machine registration op-hz-lab.
No production machine registration or remote service was replaced.
Herdr exposed both disposable shells through its live machine and terminal data.
A temporary machine registration was initially invisible because Herdr excludes temporary machines from its app documents.
Registering this test connection without the temporary flag made it eligible for display.
The app exposed it after reopening the isolated lab.
This observation does not establish that reopening is necessary for discovery.

The recovery test blocked new connections through its dedicated transport and ended only the SSH client for op-hz-native-31618.
The test did not terminate the shared SSH connection or the remote terminal service.
The local core reported unreachable, and the app's machines() result changed from ready to unavailable.
A separate SSH query confirmed that both remote shells stayed live during the interruption.
Removing the test block restored the connection, and the app reported ready again.
The captain fixture retained process identifier 2000812 and creation time 1794573083296.
The worker fixture retained process identifier 2001284 and creation time 1794573083999.
Assertions checked both identities before disconnection, during disconnection, and after reconnection.

Evidence is saved under .superpowers/native/ssh-before-disconnect.json, ssh-disconnected.json, and ssh-reconnected.json.
The test script is .superpowers/native/check-ssh-recovery.py.
This proves recovery of the real SSH transport and preservation of both remote processes.
It does not prove native offline presentation, inspection creation, or remote coordinator registration through the setup dialog.
Native captures continued showing an older view while the app command interface reported the newly selected observation tab.
That capture mismatch remains unresolved.


## Physical SSH inspection controller

A disposable test view loaded the current production controller and opened inspection for op-hz-lab/t2.
The controller created a machine-qualified inspection workspace and saved its pane identity.
The editor received the remote shell prompt, and the app reported no writable pane for this worker.
The worker retained process identifier 2001284 and creation time 1794573083999.
This invokes the actual controller in Herdr, but it does not verify a native sidebar click.

Reloading the test view left one labeled temporary shell with a persisted cleanup record.
Calling the production cleanup controller ended that owned temporary shell and cleared the pending record.
The native Retry cleanup button was not exercised.

A second physical SSH interruption tested the inspection editor through the inherited production refresh method.
Its value changed to This session is unavailable. No cached output is shown.
Reconnection restored the remote shell prompt.
Assertions confirmed no writable worker pane and unchanged captain and worker process identities.
The recovery evidence files now include the inspection editor values for both connection states.
Additional records are ssh-inspection-created.json and ssh-inspection-cleanup.json in .superpowers/native/.
Subsequent native appearance and input-rejection checks on this physical connection are recorded below.
The following sections verify interruptions during inspection creation.


## Application termination during physical SSH inspection creation

A dedicated remote worker, op-hz-lab/t5, exercised the current inspection controller through the disposable test view.
The test stopped only Grand Fleet Lab after the controller persisted a temporary-shell record.
The saved state contained no completed inspection result.
The remote terminal service continued running while the app was stopped.
The worker remained live with process identifier 2654548 and creation time 1794573798108.

After reopening the app, the cleanup record remained present.
Its labeled temporary shell, op-hz-lab/t6, was still live.
Invoking the production cleanup controller ended that shell and removed its pending record.
The worker retained the same process identity.
A subsequent inspection attempt succeeded and saved a machine-qualified workspace, tab, and pane.
The worker remained unplaced, with keep=false and no herdr.space label.
No pending temporary-shell record remained after the successful retry.

The assertions and process-stop sequence are in .superpowers/native/check-ssh-interruption.py.
Evidence files use the ssh-interrupt prefix in the same directory.
This verifies real application termination during remote inspection creation, persisted cleanup, and successful controller retry.
It does not establish native Retry cleanup interaction or termination of the remote machine itself.
The app was deliberately terminated for this lifecycle test, not restarted to address the stale native capture.


## Physical SSH loss during inspection creation

A separate disposable worker exercised connection loss after the inspection controller persisted its temporary-shell record.
The test blocked its dedicated SSH transport and ended only that session's connection process.
The controller returned failure and did not save a completed inspection for the worker.
Its unresolved cleanup record remained persisted while the machine was unavailable.
A separate connection confirmed that the worker remained live with its original process identity.

After restoring the connection, the cleanup controller checked the recorded temporary-shell name.
The remote service returned not_found, so cleanup removed the record without ending a process.
This interruption occurred before a temporary shell could be confirmed, unlike the application-termination test that left a live temporary shell.
Retrying inspection succeeded for the same worker and saved its machine-qualified inspection workspace.
No pending cleanup record remained.

The assert-based test is .superpowers/native/check-ssh-launch-disconnect.py.
Its evidence files use the ssh-launch-disconnect prefix in the same directory.
This verifies the controller's failure result, durable cleanup obligation, process preservation, and retry across a real SSH interruption.
Native notification appearance and clicking Retry cleanup remain unverified.


## Physical SSH personal-shell restoration attempt

The test view started with token ssh-restore-physical-1 and created the dedicated anchor shell op-hz-lab/t10.
The app lists that shell in its machine-qualified test workspace.
No restoration result was saved, and no second test shell appeared in the terminal inventory.
The app remained running, and no hc child command remained active when inspected.
This does not establish whether the test task was cancelled or its continuation stopped advancing.
Do not count this attempt as successful restoration or restart it solely because its result is absent.
Native capture showed an older inspection tab while the command interface selected Physical SSH restoration.
The unresolved task and display discrepancy require investigation before this acceptance item can pass.


## Instrumented physical SSH personal-shell restoration

The author confirmed that Grand Fleet Lab displayed the restoration test while Grand Fleet Render Lab displayed the separate resize probe.
A subsequent native capture matched the restoration test screen.
The two applications have separate bundle identities and processes.
This observation confirms the earlier stale capture, but does not explain its cause.

The diagnostic fixture now retains its task handle and saves each command stage.
Reloading that fixture cancelled its previous build according to Herdr's documented lifecycle.
A new diagnostic test reused the original anchor shell rather than creating another anchor.
The fixture called the unchanged production restoration controller after ending a dedicated personal shell.
It completed with PASS and a task handle reporting done=true.

The restored shell used /home/firstmate and returned to its original machine-qualified tab on op-hz-lab.
Its stored record distinguished it as a new process.
Remote routing labels omitted the local machine prefix as required by the remote service.
Calling restoration again with the original missing-shell record created no duplicate.
The remote anchor and local firstmate fixture retained their process identifiers, creation times, and live state throughout restoration.
Closing the dedicated test tab then ended only its test shells.
Independent core queries confirmed that the anchor, ended original shell, and restored shell were finished after cleanup.

Evidence is saved in .superpowers/native/ssh-restore-result.json and ssh-restore-cleanup.json.
This verifies the production controller over physical SSH, not native Restore button delivery.
The original fixture's missing completion result remains unexplained.

## Native physical-server worker input rejection

Grand Fleet Lab opened hz-interrupt-worker through its sidebar and displayed the physical server's live shell prompt.
The inspection view identified op-hz-lab and stated that direct input was disabled.
Clicking the output area and sending typed and pasted marker commands, Return, and Ctrl-C did not change the worker's terminal output.
Independent core queries confirmed the original process identifier, creation time, and live state.
An assertion compared terminal output with the saved baseline and found an exact match.

Evidence files use the ssh-native-input-before and ssh-native-input-after prefixes in .superpowers/native.
This verifies input rejection through the native inspection view over physical SSH.
It does not establish a security boundary against direct host or command-interface access.

## Native physical-server disconnection presentation

With hz-interrupt-worker open in Grand Fleet Lab, the test disabled only its dedicated transport and ended that transport's connection process.
The native sidebar retained op-hz-lab and displayed Machine unavailable.
The inspection showed Session unavailable, Disconnected, and Terminal output unavailable.
It replaced the prompt with an explicit statement that no cached output was shown.
The footer indicated that it was waiting for reconnection.

Restoring the dedicated transport returned the worker list and live prompt without navigating away or restarting the app.
An independent core query confirmed that the worker retained its original process identifier, creation time, and live state.
This establishes native disconnection and reconnection presentation for the physical server.
It does not establish recovery after physical host failure.

## Native physical-server coordinator registration

Fleet setup opened for op-hz-lab and listed its existing hz-captain session.
Submitting a home label without selecting the session displayed a validation message and kept the dialog open.
Selecting hz-captain and linking home op-hz-test displayed Thousand Sunny with Luffy pinned before its three workers.
Back to firstmate opened an explicit chooser because the lab contains multiple live firstmates.
Choosing hz-captain opened its existing terminal in the coordinator workspace on op-hz-lab.
This verifies initial registration and navigation, not replacement of an ended remote coordinator.

## Native physical-server personal-shell restoration

Clicking Your terminal beside hz-captain created op-hz-lab/t13 in the same coordinator tab.
Typing cd /tmp changed that personal shell's working directory without sending input to firstmate.
The saved restoration record captured /tmp and the machine-qualified workspace and tab.
After disabling keep for this disposable shell, typing exit removed its pane.

Restore layout listed the missing shell with its physical machine and recorded directory.
Clicking Create new shell displayed Creating shell and then removed the completed entry.
The new op-hz-lab/t14 pane appeared beside firstmate with a /tmp prompt and a New shell label.
Core queries confirmed a different process and creation time, the correct directory, and the original tab's routing label.
The saved record identified the result as a new process.
An assertion confirmed that the neighboring remote firstmate retained its original process identity and live state.

Evidence is saved in .superpowers/native/ssh-native-restore-record.json and ssh-native-restore-after.json.
This verifies native restoration controls over physical SSH, not continuation of an ended process or conversation.
The first restored pane exposed its generated recovery name in the header.
The shared display helper now hides that generated name only for terminals marked as restored.
User-chosen names remain visible, and recovery keeps its internal name for duplicate prevention.
After installing into the closed lab and relaunching, the native header displayed op-hz-lab/t14 with New shell beside it.
Both the original coordinator and restored shell retained their process identifiers, creation times, and live state.
The 102 JavaScript tests and the native mod check passed.
Process evidence is saved in .superpowers/native/ssh-label-polish-after.json.

## Native generic Pirate state selection

The disposable remote hz-interrupt-worker ran a status program inside its existing shell.
Its stable character assignment remained Pirate 7 through idle, working, and blocked transitions.
Native captures showed sleeping, walking, and seated artwork in both the sidebar and inspection header.
The blocked transition displayed Needs you and increased the attention count from one to two.

Clicking the independent attention entry selected its local workspace according to herdr-app status.
Clicking the remote worker attention entry then selected its existing remote inspection workspace and pane.
Herdr reported no errors or overlays for either selection.
The screenshot remained on inspection during navigation, so this establishes command routing but not correct visual presentation after each selection.
The display-versus-capture discrepancy remains unresolved.

Exiting the status program returned the worker to its original shell and cleared the reported status.
Its process identifier 2654548 and creation time 1794573798108 remained unchanged.
The final core record is saved in .superpowers/native/pirate-state-after.json.
These observations establish state selection, not frame timing or continuous animation playback.
