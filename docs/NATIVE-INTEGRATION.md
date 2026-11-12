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
Hidden inspection and lifecycle transitions still require acceptance checks.

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
Native replacement click-through remains unverified.

Run artwork and installer checks with `python3 -B -m unittest discover -s tests -p 'test_*.py' -v`.
Installer tests use temporary directories and do not modify the user's Herdr configuration.
See docs/INSTALL.md for ownership checks, rollback behavior, and interrupted-operation limits.

## Remaining acceptance work

- Resolve the native repaint defect documented in docs/NATIVE-RESIZE-REPRO.md.
- Verify hidden inspection behavior.
- Extend remote disconnection coverage to SSH and a separate physical host.
- Verify Restore layout click-through, hidden-window directory tracking, and live remote recovery.
- Verify stale registration replacement.
- Test inspection creation across remote disconnects and application termination.
- Verify cleanup retries when a temporary shell cannot be removed.
- Check every close route, including Herdr's built-in tab controls.
- Verify attention navigation and visible error reporting during remote transitions.
- Verify animation transitions against actual worker state and paused motion.
- Compare the native layout with the approved prototype at the target screen sizes.

Do not report the mod as production-ready until these checks and the complete vision acceptance review pass.

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
