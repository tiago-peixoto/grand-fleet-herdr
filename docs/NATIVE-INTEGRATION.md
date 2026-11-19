# Native verification

The current fleet sidebar uses automatic Firstmate captain discovery, native Space membership, and native terminal controls.
Read [Thin mod design](THIN-MOD.md) for the implementation contract.
Historical observations below do not establish acceptance of the current implementation.

## Signed application and daily installation, 2026-11-17

Revision `c1603a3b5794e2f3f42bc32751407242c0ab7b43` contains the merged 38-character expansion.
Verification used the installed `/Applications/Herdr.app` version 0.1.16 with its original Developer ID signature.
`codesign --verify --deep --strict --verbose=2 /Applications/Herdr.app` passed.
The local Core was official 0.1.21, and the remote Core was official Linux 0.1.20.
The isolated home and private Core session kept disposable verification terminals separate from daily sessions.

`node --test tests/*.test.js` passed all 26 tests.
`python3 -B -m unittest discover -s tests` passed all 47 tests.
`herdr-app check <app-home>/mods/one-piece` and `node tools/check-parity.mjs <app-home>` passed for both the isolated home and daily home.
These commands verify initial loading and retained command behavior, while the interactions below provide separate runtime evidence.

Disposable fixtures supplied Firstmate session evidence and terminal status without running actual Firstmate delegation.
Automatic discovery displayed the primary as Luffy and the secondmate as Shanks.
Direct typing into the local secondmate returned `ACK SIGNED_APP_INPUT_1117`.
Selecting Big Mom through the crew menu displayed Big Mom and Queen Mama Chanter in the native sidebar.
Reopening the signed application retained that choice, Shanks, and the three local and remote terminal identities.
Terminal addresses, creation times, shell processes, foreground processes, parents, and lifetime settings matched before and after reopening.

The remote recovery test interrupted only the disposable session's transport for 28 seconds.
Herdr displayed an unavailable machine and reconnecting terminal, then recovered automatically before any click or typing.
The terminal briefly reported 200 by 120 cells before automatically returning to its original 113 by 36 cells.
The recovered native capture showed correctly wrapped output, and subsequent typing returned `ACK REMOTE_RECOVERED_1117`.
The terminal identity, shell process, foreground process, parent, and lifetime settings remained unchanged.
Native recovery passed for this single trial, but [issue 3](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/3) stays open.
The historical two-viewer reproduction was intermittent, so one passing trial cannot show that the ordering defect is fixed.
Clean Core v0.1.21 still collects relayed attachments without sorting, marks returning viewers resumed, and starts them without activity timestamps.
That source comparison is a reason for further regression testing, not a fresh reproduction of the failure.

The clean upstream Core v0.1.21 checkout was `1b0393f80c35b1dae34f37934d33d0144a8fc8d7`.
Using Zig 0.16.0, `cargo test --locked -p herdr-core --test foreground -- --test-threads=1` passed all seven tests.
This resolves the current baseline check in [issue 4](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/4), without identifying the historical failure's cause or testing the full Core suite.

The [minimal resize probe](NATIVE-RESIZE-REPRO.md#signed-release-reproduction-2026-11-17) reproduced missing text in the signed application without One Piece artwork.
Both labels disappeared after pane zoom while the yellow rectangle remained visible in native window capture.
The last-frame `herdr-app shot` command was not used for this observation.
[Issue 2](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/2) therefore remains a release blocker.

After backing up the daily home, the installer refreshed `~/.config/herdr-app` from the merged revision.
All 979 owned files matched the installation receipt, and all 975 copied source files matched the checkout.
Reopening the daily application preserved settings, shortcuts, workspace inventory, terminal inventory, and machine inventory.
Herdr reported no runtime errors, and native capture showed the empty Spaces and Agents regions with both machines available.
The daily home had no live terminals before installation, so this refresh cannot establish preservation of active daily conversations.

Private screenshots, test logs, the backup, and comparison receipts remain outside this repository under `.task-notes/grand-fleet-release-20261117/` in the workspace.
Disposable terminals were closed after verification, and the isolated application and local Core were stopped.
These fixture checks complement the actual Firstmate lifecycle evidence below without repeating it.
Every native control and the full upstream Core suite were not tested.
Installation is complete, but final release acceptance remains blocked by the rendering failure.

## Candidate completion and final-main transition, 2026-11-16

The actual remote secondmate lifecycle completed with the primary acknowledging completion marker 3.
The physical preservation receipt records independent sidebar scrolling, persisted crew choices, app reopening, and remote transport recovery.
All five terminal identities survived, and direct remote input returned `REMOTE_RECONNECT_20261116_KING_OK`.
The local Core executable matches the official 0.1.21 macOS ARM64 release, as recorded in [Installation](INSTALL.md#core-build-used-for-current-recovery-verification).
The remote running Core executable also matches the official Linux x86_64 0.1.20 release.
The historical debug binary below is different from this acceptance runtime.
Mod main `436678c561bf42f0a39951f9ed574af003134d9d` has the exact reviewed `200896b298b389c3589edbf21da0caa7f76fd599` tree.
Normal `fm-update` completed with exit code 0 at 20:49:12 UTC.
It updated the primary and both secondmates to Firstmate main `00311fea94041f7794f3b2690f7df70f6942687d`.
Independent snapshots at 20:50:09-10 UTC found the primary, local secondmate, remote code checkout, and remote secondmate clean at that commit.
The private remote job worker matched its recorded process lock and current code hashes.
These snapshots were sequential, not atomic.
The updater requested an instruction reread and restarts of `fm-main-hello-mate` and `fm-grand-hz-mate`, with no nudges.
The normal restart completed at 20:51:34 UTC with exit code 0: two of two restarted, zero nudged, and zero unreachable.
`final-main-supervision/receipt.md` records final post-restart reconciliation at 20:55:14 UTC.
The actual primary resolved all six pending reply records, and the remote reply watcher reported zero pending messages.
All five terminals kept their address, creation time, shell PID, parent, keep, and die_with_parent values.
Only the two secondmate Claude processes changed, as expected from normal restart.
Session-lock discovery found the primary and both secondmates after restart, with crew choices and worker assignments unchanged.
The local worker's `hello.txt` was reread after restart, but remote file bytes were not reread in this reconciliation.
Both tasks remain open intentionally, with no merge, push, cleanup, or repeat dispatch.
The final mod installation preserved all five terminal identities and matched all 217 copied source files.
Its native loading and asynchronous parity checks passed without app errors.
A real primary approval prompt displayed seated Luffy in both Spaces and Agents after the restart.
The saved `final-mod-install/actual-primary-blocked-both-regions.png` closes the physical attention-state check without establishing the historical capture failure cause.
The final protected-state comparison retained all 19 remote baseline records.
Four original local process identities and the default Core and holder socket ownership also matched.
The earlier 57-byte timeout log and missing SSH socket remained recorded differences.
The remote comparison excluded private code and homes undergoing authorized updates.
The isolated app signature and incomplete comparison of every native control remain limitations.

## Mod-only association, 2026-11-14

The author rejected any requirement to modify Firstmate.
Firstmate PR 8484 is closed, and its validation process was cancelled.
The current mod uses existing worker labels and an explicit captain choice saved through Herdr's documented `shared` and `setShared` APIs.
It no longer reads `firstmate.role` or `firstmate.home.path`.

All nine JavaScript tests passed after replacing the patched-label fixtures with stock-label fixtures.
All 42 Python tests passed for artwork, compatibility, and installation.
The command comparison passed with explicit mod-owned captain associations.
It also checked stale selections, competing captain choices, captain-only setup, and unlinking without terminal commands.
The isolated installation passed Herdr's initial loading check.
The first installation attempt used the `/tmp` symlink and correctly refused it.
Installation succeeded using the canonical `/private/tmp` path.

In Grand Fleet Lab, the remote Link captain menu displayed actual terminal choices and existing worker groups.
Selecting Captain only for the disposable `op-hz-lab/t27` displayed Thousand Sunny and Luffy.
The ship's appearance menu exposed Edit captain link and Unlink captain.
Unlinking restored the ordinary terminal entry without closing the session.
This verifies the menu interaction, not a complete lifecycle with unmodified Firstmate.
The stock task and direct-input checks below supersede that limited setup check.
Stock reconnection passed in both layouts as recorded below.
Stock cleanup passed locally and remotely as recorded below.

## Stock Firstmate tasks and direct input, 2026-11-14

The local fixture used unchanged Firstmate commit `83d84e631a8eaea05fefb35caf002e876e87d2a9`.
All 859 archived source files still matched after task completion and direct input.
The physical remote fixture used unchanged commit `427056c4181c41074ad24f051f79919330df0fa5`.
Its verification receipt confirmed all 876 source files matched.
Neither fixture used the rejected registration patch.

Local captain `t42` launched worker `t43` through stock Firstmate.
The worker reported `mandarin` at `README.md:3`, wrote its report, and passed its completion gate.
The coordinator read the report and left the worker alive.
The mod linked the explicitly selected captain to stock group `firstmate-464374bd`.
Selecting Chopper opened the existing worker workspace.
Direct native keyboard input produced the exact response `STOCK-LOCAL-DIRECT-731`.
Opening Luffy and closing its native preview restored the worker workspace with its report and marker intact.
The worker retained creation time `1794693024856`, shell process `27380`, and Claude process `52756`.

Remote captain `op-hz-lab/t29` launched worker `op-hz-lab/t2b` through stock Firstmate.
The worker reported the same disposable project's verification word and passed its completion gate.
The mod linked the explicitly selected captain to stock group `firstmate-569ce04a`.
Selecting Chopper opened the existing remote worker workspace.
Direct native keyboard input produced the exact response `STOCK-REMOTE-DIRECT-731`.
Selecting Luffy opened the existing coordinator's native preview, including its real approval prompt.
Closing the preview restored the worker's report and marker.
The worker retained creation time `1794693174015`, shell process `3756210`, and Claude process `3760813`.
Native application status showed the expected remote workspace, tab, pane, and no errors.

Review also found that Link captain initially focused its container instead of an actionable button.
Pressing Enter reproduced the failure in Grand Fleet Lab before the correction.
The correction attaches the existing focus handle to the first available action.
After installing the correction in the isolated home, Enter selected the first terminal and opened the worker-group stage.
Captain only received focus in that stage, and Tab visibly moved focus to the next group.
Cancel dismissed the dialog without changing the stored associations.
The command comparison covers both stages, returning to terminal choices, editing, and an empty terminal list.

## Stock transport recovery, 2026-11-14

The same stock local and remote captains and workers survived an isolated remote transport interruption in each layout.
Both comparisons retained all four terminal creation timestamps, shell processes, and foreground processes.
The remote worker retained its report and `STOCK-REMOTE-DIRECT-731` response.
During disconnection, Grand Fleet displayed Unavailable and removed remote character artwork.
After recovery, the ship, captain, and worker returned.
Direct native keyboard input produced `STOCK-RECOVERED-731` in Grand Fleet and `STOCK-DEFAULT-RECOVERED-731` in default Herdr.
The native window displayed the retained transcript and each new response.
Application status reported no errors after recovery.
Receipts are stored in the ignored `.superpowers/native/stock-fleet-reconnect.json` and `stock-default-reconnect.json` files.
These checks cover connection loss while the remote service remains alive.
They do not cover service restart or machine shutdown.
The isolated lab uses the recovery source build documented in [Installation](INSTALL.md#core-build-used-for-current-recovery-verification).
A published recovery build remains unverified.

## Stock cleanup and final review, 2026-11-14

Normal stock teardown removed local worker `t43` and remote worker `op-hz-lab/t2b` after the completed task and reconnect checks.
Neither teardown required a force option, source patch, or path correction.
Both released the disposable worktree reservation and retained the completed report.
The local receipt confirms unchanged source, home configuration, report bytes, and all 94 other terminal identities.
Local teardown reported inactive monitoring in this disposable fixture.
The remote receipt confirms 876 matching source files, an empty wake queue, and the surviving captain at turn 43.
The remote Claude launcher hash, target, and inode numbers remained unchanged.
The native sidebar retained both captains and removed both workers after cleanup.
Receipts remain in `.superpowers/native/stock-local-cleanup.json` and `/tmp/grandfleet-stock-evidence-stLZKnv2/cleanup-receipt.json` in the test environment.

Final review reproduced raw error status selecting sleeping artwork in the rendering harness.
The adapter now normalizes error to native blocked presentation before choosing artwork, attention text, color, and accessibility labels.
The regression failed before the correction and passed afterward at normal and compact widths.
All nine JavaScript tests and the native command comparison passed on commit `97e0b40`.
The refreshed isolated installation passed its native loading check and reopened without application errors.
The 42 Python tests passed before this presentation-only correction.

The reviewed evidence supports the implementation objective and its reviewable pull request.
It does not establish exact pixel equivalence with the browser prototype.
Creation, splits, zoom, and closing comparisons primarily used native commands.
Pointer checks covered plus-menu creation in the mod, panels in both layouts, and local and remote resizing in both layouts.
A complete pointer and keyboard comparison of every native terminal control remains unverified.
The final error-status correction also passed the physical native-window check recorded below.
No release or installation into the daily application was performed.

## Native keyboard checks, 2026-11-14

The disposable local workspace `pointer-audit-local` exposed stale lab configuration during keyboard verification.
Its `layout:one-piece` shortcuts still called retired `one-piece.close-tab` and `one-piece.close-pane` commands.
Direct typing and keyboard splitting worked, but the close-pane shortcut did nothing.
Switching the same workspace to default Herdr made the same shortcut close the selected pane.
The lab had replaced an experimental installation without retaining its version 2 ownership receipt.
The current installer deliberately preserves unowned keyboard settings.

After backing up the lab keys file, verification removed only the two exact obsolete bindings and restarted the isolated application.
No implementation or Firstmate changes were needed.
In Grand Fleet, Command-D and Command-Shift-D created a three-pane grid.
Direct typing displayed `FLEET-GRID-731` in the third pane.
Command-Shift-Return visibly zoomed that pane.
After toggling zoom back, Command-Shift-W removed only that pane.
The two surviving terminals retained their creation timestamps and shell processes.
Command-T created ordinary terminal `t48` in the inherited `/private/tmp` folder without Firstmate labels.
Command-W removed that new tab and preserved the original two-pane tab.
The receipt is `.superpowers/native/keyboard-audit.json` in the isolated test environment.
These checks extend the native-command evidence with actual keyboard input.
They do not establish a complete remote keyboard or pointer comparison.

## Remote keyboard comparison, 2026-11-14

A new disposable workspace on physical machine `op-hz-lab` started in `/tmp`.
Actual Command-D and Command-Shift-D input created three remote panes in Grand Fleet.
Direct typing visibly printed `REMOTE-KEYBOARD-731`.
Command-Shift-Return visibly zoomed the selected pane.
After toggling zoom back, Command-Shift-W closed only that pane.
Command-T created a remote ordinary terminal that inherited `/tmp`.
Command-W removed the new tab while preserving the original two-pane tab.

The same workspace then ran the equivalent split, direct typing, zoom-toggle, pane-close, new-tab, and tab-close keyboard sequence in default Herdr.
The default terminal transcript contained `DEFAULT-REMOTE-731`.
Both surviving remote terminals retained their original creation timestamps and shell processes throughout both layouts.
The receipt is `.superpowers/native/remote-keyboard-audit.json` in the isolated test environment.
This comparison covers these keyboard paths, not every native control.

A separate disposable shell exiting with code 1 did not reproduce a live agent error state.
Herdr reported it as finished with a null status, and the fleet correctly omitted it.
That exit-only fixture did not verify error artwork; the subsequent status-reporting fixture below did.

## Native error artwork, 2026-11-14

A disposable Python program emitted Herdr's documented OSC 7501 status report with `state=error` and stayed alive awaiting input.
Terminal `t4b` used explicit fixture labels for the existing local stock group.
Herdr reported a live terminal with `status.state` equal to `error`.
The native sidebar displayed seated Franky with the visible text Needs you.
Its accessibility button read `Franky, Needs you, artwork-error-live`.
The program was then killed without touching the stock captain or remote shells.
This verifies error-to-attention presentation using a simulated status producer, not a real Firstmate failure.
No Firstmate source or configuration changed.

## Historical patched-producer evidence

All producer and lifecycle observations below predate the mod-only association correction.
They are retained as historical evidence, not current acceptance or an upstream dependency.
References to pending Firstmate checks are obsolete because PR 8484 is closed.

## Producer delivery verification, 2026-11-14

[Firstmate PR 8484](https://github.com/kunchenguid/firstmate/pull/8484) publishes the explicit coordinator registration and worker home labels.
Its implementation commit is `cfc867b4c3a25938282906ab457a75ff542035de` on upstream base `427056c4181c41074ad24f051f79919330df0fa5`.
The delivered head `cad75badf2fce48efea7d769f01abbbab9108ed4` adds two timeout documentation corrections without changing implementation.
The implementation patch matches the producer used for the recorded local and remote tasks.
Both patches have stable patch ID `598a89a33349880126316f06f7952d1b9c27c31c`.
Patch equivalence establishes the change, not identical behavior across different bases.

The publication pipeline independently passed review and live tests on the upstream base.
Real Claude primaries exercised successful registration, inherited-marker refusal, worker home labels, and timeout cleanup in a disposable local core.
Stale-role cleanup preserved task terminals and terminals with different homes.
Registration failure warned while startup continued.
Timeout cleanup released the claim lock and terminated its descendants.
The pipeline did not repeat the remote lifecycle on the upstream base.
Remote evidence remains the recorded physical-server workflow with the equivalent implementation patch.

Disposable Claude processes disabled updates for this validation.
The user launcher retained its target and inode before and after lab cleanup, and its version command succeeded afterward.
Documentation checks corrected two stale timeout references, and lint passed.
GitHub's full-suite check currently requires a maintainer to apply the `full-ci` label for this fork contribution.
The gated test jobs did not run, so their result remains unverified.

## Real remote terminal verification, 2026-11-14

The patched producer automatically registered a real Claude coordinator on `firstmate-vps` as `op-hz-lab/t27`.
Its real worker, `op-hz-lab/t28`, appeared as Chopper beneath Sunny in the Wano machine group.
The worker read the disposable project's README, reported its verification word, and completed its completion gate.
Selecting Luffy displayed the coordinator's native terminal preview and seated attention artwork.
Selecting Chopper opened its existing remote workspace and terminal.
Native status confirmed the remote workspace, tab, pane, and terminal address without errors.
The native screenshot showed the remote Claude transcript and matching project folder.
Direct keyboard input requested `REMOTE_CREWMATE_DIRECT_20261114`, and the worker returned that exact marker.
The sidebar changed from Done to working while processing the input.
The final native screenshot and terminal history both retained the response and earlier task output.
Evidence lives in `.superpowers/native/real-remote-lifecycle-evidence/` in the isolated worktree.

These observations establish real remote discovery, navigation, and direct input.
Cleanup was verified separately, with the local fixture correction described below.
Local normal teardown stopped while releasing its worktree because paths differed between `/var` and `/private/var`.
Claude exited locally, but its terminal remained a live shell and its worktree lease remained allocated.
Remote normal teardown subsequently removed worker `op-hz-lab/t28` and released its worktree lease.
The cleanup receipt retained the report and showed an empty notification queue.
An independent terminal lookup confirmed that `t28` no longer existed.
The local discrepancy matches existing [Firstmate issue 4708](https://github.com/kunchenguid/firstmate/issues/4708).
Both spellings refer to the same directory, but Treehouse stores the `/var` spelling while Firstmate records `/private/var`.
After verifying directory identity, lease ownership, and task ownership, the test backed up the local task metadata.
Only its worktree path spelling changed to match the pool record.
The coordinator then ran normal teardown without its force option.
Independent checks confirmed that terminal `t41` no longer existed, the lease was released, and the notification queue was empty.
This recovered the disposable fixture without changing shared source or pool records manually.
It does not establish that the upstream path defect is fixed.

## Historical registration fixtures

A separate live fixture invoked patched Firstmate startup with genuine terminal identities supplied by the lab terminal service.
The coordinator acquired its lock and published canonical registration labels automatically.
A competing process entered read-only mode without receiving registration labels.
A successor acquired the lock and removed only the stale coordinator role while preserving the old terminal.
All 25 recorded assertions passed when independently rerun.
The fixture used a compiled Codex simulator, not the actual Codex application.
It did not verify sidebar rendering of automatic registration.
A separate private local terminal service then exercised the unchanged worker-creation producer.
Fourteen assertions covered canonical home labels, task identity, duplicate refusal, and worker survival after its creator exited.
Independent inspection confirmed the recorded home label, lifetime flags, creator exit, and surviving worker process.
This exercised the producer API, not the full Firstmate task lifecycle.
A remote fixture on firstmate-vps passed 22 assertions with the same patched producer source.
It verified coordinator registration, matching worker home labels, duplicate refusal, and worker survival after coordinator exit.
Independent inspection confirmed those metadata and lifetime assertions.
Both remote terminals exited successfully before cleanup, and the private terminal service stopped.
This remote fixture also used a simulated Codex process and the producer API rather than the full task lifecycle.
The producer change is now published in [Firstmate PR 8484](https://github.com/kunchenguid/firstmate/pull/8484).

A subsequent run of `tests/fm-backend-hc-appdetect-smoke.test.sh` passed against the producer worktree containing the registration review fixes.
It created the private core `fm-hclab-appdetect-91874-8748` and exercised actual `fm-spawn.sh` execution with harmless shell commands.
All four cases passed: app-terminal detection, marker-less app-window refusal, missing-core refusal, and explicit backend selection.
The test verified worker metadata and existing ownership labels, then completed its guarded teardown with exit code zero.
This establishes spawn compatibility, not automatic coordinator registration, interactive crew discovery, or a complete agent task lifecycle.

Fresh local registration then passed with the ancestry guard and bounded startup registration in place.
The lab created terminal `t3z` with genuine injected identity and a compiled Codex simulator beneath its terminal process.
Unchanged Firstmate startup published the canonical home and coordinator role automatically, completed its digest, and exited zero without a registration warning.
Recorded SHA-256 hashes matched both producer files in the worktree after startup.
Releasing the simulator and its parent ended the disposable terminal with exit code zero.
Evidence is recorded in `firstmate-registration-evidence-2bhnulu2/phases/review-registration` outside the repository.
This confirms successful registration after the review fixes, but not live refusal of inherited identity or the complete agent task lifecycle.

## Current verification, 2026-11-14

Disposable local and physical remote shells passed a four-case comparison between default Herdr and the current One Piece layout.
Native terminal creation inherited the focused terminal's machine and folder in each case.
New shells received no Firstmate character labels.
Printed output, creation timestamps, and process identities survived worker navigation, zoom, and layout changes.
These comparisons invoked native commands through the command-line interface rather than pointer controls.

In the native window, selecting Luffy focused the registered coordinator terminal.
Selecting Chopper focused the worker's separate workspace.
Direct keyboard input produced a printed marker in each terminal.
Collapsing the ship hid its characters without changing the selected terminal.
Expanding the ship restored those characters.

A pointer click on the native plus menu created an ordinary terminal in the coordinator workspace.
The new terminal inherited the focused coordinator's current folder and accepted directly typed input.
The test closed only that disposable terminal through the native close command.
Files displayed repository files, and Changes displayed the actual eleven changed files and a diff.
A later pointer comparison opened Files and Changes in both default Herdr and the One Piece layout.
Both layouts displayed the same repository files and fifteen changed files after the documentation updates.
The Changes button also closed its panel in both layouts.
Pointer clicks opened the native Settings and Add machine dialogs in the One Piece layout.
Escape dismissed each dialog without changing settings or adding a connection.

The current sidebar also passed a physical remote transport interruption and recovery comparison against default Herdr.
The disposable remote test program retained creation timestamp, shell process, foreground process, and earlier output in both layouts.
Direct keyboard input produced a new echo after each recovery, visible in the native window and terminal history.
During disconnection, the fleet sidebar showed Unavailable and removed the remote captain artwork.
The ship and captain returned after reconnection.
Temporary coordinator labels were removed after the test, and the lab returned to its local captain.
This tests connection loss while the remote service remains alive, not remote machine shutdown or service restart.
The lab uses an isolated recovery build of Herdr Core, so these results do not establish behavior of every published version.

A further four-case comparison created three-terminal grids in both layouts on local and physical remote machines.
Native commands split each grid right and down, swapped panes, toggled zoom, and navigated away and back.
All twelve disposable shells inherited the expected machine and folder without Firstmate labels.
Each shell retained its creation timestamp, shell process, foreground process, and printed output throughout the comparison.
Inspected screenshots showed all three terminals and their markers in the local and remote One Piece grids.
The checks closed only the twelve created terminals and restored the original layout and focus.
Evidence lives in the ignored `.superpowers/native/grid-evidence.json` beside its verification script.
A later local pointer comparison dragged the split boundary in Grand Fleet and default Herdr.
Grand Fleet changed the terminal widths to 105 and 56 columns.
Default Herdr changed them back to 81 and 80 columns.
Both shells retained their process identities and visible printed markers.
A matching physical remote pointer comparison resized two disposable shells in both layouts.
Grand Fleet changed their widths to 105 and 56 columns, and default Herdr changed them to 81 and 80 columns.
Both shells retained their creation timestamps, shell processes, foreground processes, and printed markers.
Native captures showed the markers and resized boundaries in both layouts.
Only those disposable shells were closed, and the original layout and captain focus were restored without reported errors.
Evidence lives in the ignored `.superpowers/native/remote-pointer-evidence.json`.

The patched task lifecycle is historical evidence only.
Current stock task and reconnect evidence appears above.
Native control comparisons remain applicable because the mod delegates those controls to Herdr.

Independent review found two navigation regressions, both reproduced in the native lab before changing code.
The native sidebar showed the unregistered `thin-child` terminal, while the fleet sidebar omitted it.
The fleet sidebar now exposes unplaced, ungrouped terminals as ordinary entries without character assignments.
Selecting `thin-child` opened Herdr's writable preview with its existing output.
Right-clicking Luffy previously did nothing because its workspace row was hidden.
Character rows now expose their actual workspace's native menu through right-click or Shift-F10.
The inspected native menu contained Rename, New worktree, Open worktree, Remove worktree, and Close.
Unplaced characters do not invent a workspace menu.
Command regression checks failed before each fix and passed afterward.
The installed mod passed the native check, all nine JavaScript tests passed, and the lab reported no errors.
Historical recovery checks below cannot substitute for those checks.

## Local automatic discovery and animated states

Patched Firstmate startup registered a coordinator automatically in the active Grand Fleet Lab terminal service.
The unchanged worker producer then created two local workers with matching canonical home labels.
The sidebar discovered Luffy, Chopper, and Franky without manual registration labels or presentation placement commands.
Selecting Chopper focused its native terminal, where direct keyboard input printed the expected marker.
Selecting the unplaced Luffy opened Herdr's native terminal preview.
The producer placed both workers in separate native tabs within its normal worker workspace.
The mod did not assign workspace ownership or create additional workspaces.

A disposable status program reported idle, working, and blocked terminal states through Herdr's terminal protocol.
Native captures showed sleeping, walking, and seated Chopper artwork respectively.
Two captures per state contained visibly different sprite frames, confirmed by cropped image comparisons.
This verifies state selection and animation for the simulated reports, not the meaning of a real Firstmate decision.
After closing Chopper's terminal, the surviving worker retained Franky artwork and the same process identity.

The fixture used a compiled Codex simulator with genuine terminal identity and unchanged Firstmate startup and worker producer code.
It verifies local automatic registration through sidebar discovery, but not actual Codex or the complete Firstmate task lifecycle.
The coordinator exited successfully after release, and native close actions ended both disposable worker shells.
The lab returned to its original captain with no overlays or reported errors.
Local evidence remains outside the repository in `firstmate-registration-evidence-2bhnulu2/phases/ui-discovery`.

## Remote automatic discovery after registration review

The physical remote machine `op-hz-lab` ran patched Firstmate startup in disposable terminal `t25`.
The fixture used the same producer hashes as the fresh local registration check.
Startup published the canonical home and coordinator role without manual labels.
The unchanged worker producer created terminal `t26` with matching home metadata and native workspace labels.
Grand Fleet Lab discovered Luffy and Chopper beneath Wano automatically.
Selecting Chopper focused its existing remote workspace and terminal.
Direct keyboard input printed `REMOTE_DISCOVERY_DIRECT_20261114`, visible in the native capture and terminal history.
Selecting Luffy opened its native terminal preview.

The fixture used a compiled Codex simulator and a worker shell, not actual agent execution.
It establishes remote automatic discovery and writable navigation, but does not establish the complete Firstmate task lifecycle.
Evidence is stored privately in `.superpowers/native/remote-discovery`, including producer hashes, terminal records, screenshots, and captured output.

Cleanup closed only the fixture worker workspace after verifying its sole terminal was `t26`.
Releasing the coordinator fixture ended `t25` with exit code zero.
A subsequent terminal query confirmed both terminals had finished.
The lab returned to its original local captain workspace with no overlays or reported errors.

## Real Claude coordinator and worker

A fresh plain source copy contains the same two producer hashes used by the remote discovery fixture.
The existing isolated core launched actual Claude Code 2.1.325 in terminal `t40` with a disposable Firstmate home.
Claude's project startup hook acquired the home lock and published coordinator labels automatically.
Grand Fleet Lab displayed Luffy for `op-real-firstmate` without manual registration.
Selecting Luffy opened the existing terminal in Herdr's writable preview.
A lifecycle instruction typed through that preview reached Claude, which began preparing the scout task.
The coordinator invoked actual `fm-spawn.sh` and created Claude worker `t41` with the same canonical home label.
Grand Fleet automatically displayed that worker as Chopper beneath the coordinator.
Selecting Chopper opened its separate native workspace with the existing report output.
The worker read the disposable project, reported the expected word `mandarin`, passed its completion gate, and recorded done.
Its terminal remained live after task completion.
A second instruction typed directly through the native worker terminal produced the exact response `LOCAL_CREWMATE_DIRECT_20261114`.
The accessibility tree reported working during that interaction and Done before it.
Native captures showed the sleeping Chopper artwork when Done and the coordinator's Needs you state during manual approval.
These observations establish real local task execution, automatic grouping, writable navigation, and status changes.
The later remote verification is recorded above.
Local cleanup initially failed because worktree release rejected the aliased path.
The documented fixture correction allowed normal cleanup to finish.
Evidence is stored privately in `.superpowers/native/real-lifecycle-evidence`.

## Current visual comparison

The approved native-flow prototype was inspected alongside the current Grand Fleet Lab captures.
Both retain the dark fleet palette, island and machine labels, ship rows, captain-first ordering, and indented crewmates.
Both keep ordinary workspaces and the native terminal area beside the fleet sidebar.
The implementation uses the approved custom Sunny, Luffy, and Chopper artwork for the tested local crew.
The prototype's sample Zoro, Nami, and Sanji roster does not expand the initial artwork commitment in `VISION.md`.
Native terminal headers, tabs, panels, and controls intentionally retain Herdr's shipped appearance, as required by that vision.
The browser reference and native captures use different window dimensions, so this comparison does not establish exact pixel equivalence.
The remote lifecycle captures also show the Wano machine identity, Sunny group, Luffy attention state, and Chopper terminal.
They confirm the same hierarchy and artwork in the physical remote workflow.

## Historical verification before simplification

The evidence below describes older versions and does not verify the current terminal model.
Read-only inspection, presets, restoration, and custom close confirmation are retired.

The native mod is experimental and has not passed the complete acceptance policy in VISION.md.
A real firstmate worker exposed a failing attention check: an unresolved decision appeared as Finished and did not enter the attention list.
Earlier blocked-status fixture checks do not establish correct presentation of durable firstmate decisions.
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

## Workspace header at reduced width

Resizing Grand Fleet Lab from 1280 × 820 to 1000 × 700 logical pixels reduced the three-letter workspace name `tmp` to `t...`.
The workspace name, context label, and four actions previously competed within one horizontal row.
The header now stacks the name and context label in one flexible column within the existing header height.
The installed mod displayed the complete name and `Coordinator workspace · op-hz-lab` at 1000 × 700.
All four header actions remained visible at that size and after returning to 1280 × 820.
The remote coordinator prompt remained visible in both captures.
Native initial-render validation and whitespace checks passed.
This check covers the observed short name and machine label, not every label length or smaller window size.

## Automated coverage

The machine shortcut check requires local and offline remote navigation to request the correct scroll group without selecting a workspace or sending terminal commands.

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
Replacement through a physical remote connection also passed the native check recorded below.

Run artwork and installer checks with `python3 -B -m unittest discover -s tests -p 'test_*.py' -v`.
Installer tests use temporary directories and do not modify the user's Herdr configuration.
See docs/INSTALL.md for ownership checks, rollback behavior, and interrupted-operation limits.

## Remaining acceptance work

The requirement-by-requirement verdict is maintained in [Native acceptance review](ACCEPTANCE.md).
Historical sections below retain the limits that applied when each check ran.

- Resolve the display-versus-capture discrepancy documented in docs/NATIVE-RESIZE-REPRO.md.
- Verify animation timing in the running native interface.
  Chopper, Franky, generic Pirate, and the pause control have native state-selection evidence below.
- Verify automatic background redraw after remote reconnection.
- Verify a complete isolated firstmate workflow, beyond labeled shell fixtures.
- Complete the large-screen visual comparison, including the implemented grid presets.

Native cleanup retry and remote attention navigation passed the later checks recorded below.

Local-transport Restore interaction, hidden-window directory tracking, and physical SSH process recovery have passed the checks recorded below.
Those results do not establish recovery after physical host failure.
Do not report the mod as production-ready until the remaining checks and the complete vision acceptance review pass.

### Installed close routes

The installed layout uses mod-owned tab controls and pane headers.
The installed keys file maps Cmd-W to `one-piece.close-tab` and Cmd-Shift-W to `one-piece.close-pane` in `layout:one-piece`.
Its terminal section contains no overrides for those shortcuts.
Herdr's installed documentation states that layout bindings override global bindings, while terminal bindings override both.

Native keyboard delivery was checked with the independent terminal selected on 2026-11-13.
Cmd-W visibly opened “Close tab?” and Cmd-Shift-W visibly opened “Close pane?”.
Both dialogs identified `t11 on local`, said its process ends, and stated that firstmate obligations remain unchanged.
Cancel dismissed each dialog.
After both cancellations, `hc get t11 --json` reported the original live process 48951 and creation time 1794521171090.
The native button closure and inspection-preservation checks remain recorded below.
This completes the route audit for the installed layout and shortcut configuration.
Direct Herdr commands and more-specific user shortcuts remain outside these guards, as documented in docs/INSTALL.md.

### Animation observation limits

Native screenshot sampling on 2026-11-13 did not establish continuous animation playback.
Three sample runs covered approximately 2.05, 3.45, and 3.73 seconds.
Sunny and flag crops remained byte-identical within each run, although separate interaction screenshots showed different poses.
The final run followed keyboard activation, and the window controls had appeared active in the preceding screenshot.
The unknown-status worker crop also stayed unchanged, consistent with its static PNG selection.
These observations do not distinguish capture behavior from foreground-dependent playback or a renderer defect.
The user was asked to observe Sunny directly with the window in the foreground.
Raw captures, timestamps, and crop analyses remain under `.superpowers/native/animation-captures/` and are excluded from the repository.
Do not infer a playback pass from GIF metadata or state-selection checks.

A source audit on 2026-11-13 narrowed the remaining runtime checks.
The diagnostic Herdr checkout is based on revision `9950887361af3ba218b9ce7a347cb8ec7b66c71d`, with local rendering instrumentation.
Its `vendor/gpui-kit/crates/shell/src/materialize.rs` gives every image an element identity, including images without an explicit JavaScript ID.
Its `vendor/gpui-pre/src/elements/img.rs` advances frames and requests another frame only while the window is active and reduced motion is disabled.
The active flag represents operating-system keyboard focus, not merely a raised window.
Its `vendor/gpui-kit/crates/base/src/reduce_motion.rs` reads the macOS accessibility preference at initialization.
The CLI status response does not expose either runtime condition.
Reading `com.apple.universalaccess reduceMotion` returned an absent preference, which does not establish the value returned by the native accessibility API.
The existing `animated_images_advance_with_explicit_and_implicit_ids` test explicitly simulates frame delivery and draws the window.
That test cannot establish that the native frame scheduler continues delivering frames without input.
A fresh native Raise and title-bar click left the window controls visually inactive in captures while the mod displayed Pause motion.
The next distinguishing observation is continuous playback on the physical display with confirmed keyboard focus.
No sprite workaround or redraw timer was added.

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
Clicking Create new shell for the isolated op-remote-lab/t5 record created op-remote-lab/t9 in the home folder.
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

## Native remote inspection tab closure

Clicking the tab's Close button for hz-interrupt-worker opened the mod's confirmation dialog.
The dialog identified op-hz-lab/t5 and stated that only the inspection view would close.
Clicking Close view dismissed the dialog and displayed another worker's inspection.
A core query confirmed that t5 remained live with process identifier 2654548 and creation time 1794573798108.
This verifies the native tab button's preservation path over physical SSH.

Reopening through the sidebar briefly displayed a temporary-shell cleanup notice.
The persisted cleanup list subsequently became empty without clicking Retry cleanup.
The inspection record acquired a new workspace, tab, and pane.
However, subsequent window status selected op-remote-lab/op-remote-probe, and the settled capture showed that unrelated terminal.
Reopening is therefore not accepted as passing, even though the worker survived and cleanup completed.
Evidence is saved in .superpowers/native/native-inspection-close-after.json.

The installed one-piece layout matches the repository layout exactly.
The running window reports that layout as active.
Its tab and pane headers use the mod's controls rather than the shipped tab controls.

## Native reopening follow-up

Retrying the remote worker's sidebar entry opened hz-interrupt-worker and displayed its original shell output.
A second native Close view and sidebar reopen cycle also succeeded without a code change.
Twelve consecutive window-status samples retained the newly created remote inspection workspace and reported no errors.
The settled native capture displayed the matching worker name, inspection-only notice, and original terminal history.
The worker retained its original process identifier and creation time, and the temporary-shell cleanup list was empty.
Evidence is saved in .superpowers/native/reopen-status-samples.json and native-inspection-reopen-after.json.

The previous unrelated-workspace observation was not reproduced during this follow-up.
Its cause remains unknown, so these successful cycles do not establish a fix for that observation.
Clicking the independent attention entry subsequently displayed independent-probe in its local workspace.
Both window status and the settled native capture agreed on that destination.
This adds visual evidence for independent attention navigation that the earlier state-selection check lacked.

## Native cleanup retry after remote disconnection

A disposable remote shell carried the mod's temporary-shell ownership label and a persisted cleanup record.
Disabling only the lab transport left the remote worker running.
Clicking Retry cleanup initially displayed truncated raw error data.
The error handler now extracts command messages and gives offline cleanup a short recovery instruction.
Two regression tests cover structured errors, plain errors, and preservation of the pending cleanup record.
All 104 JavaScript tests and the native initial-render check passed.

After installation, clicking Retry cleanup while disconnected displayed the complete instruction: Reconnect op-hz-lab, then retry cleanup.
The pending cleanup record remained available.
Restoring the transport and clicking Retry cleanup displayed Cleaning temporary shells, then removed the control.
The pending list became empty and the owned temporary shell op-hz-lab/t19 was finished.
Worker op-hz-lab/t5 remained live with process identifier 2654548 and creation time 1794573798108.
Evidence is saved in .superpowers/native/native-cleanup-after.json.
Motion was reenabled through the native control after this check.
This verifies the native cleanup retry path, but does not settle continuous animation playback or other remote error paths.

## Native remote attention navigation through reconnection

A disposable status program in op-hz-lab/t5 reported a blocker and printed REMOTE_ATTENTION_PROBE_READY.
The attention list gained Worker · hz-interrupt-worker alongside the independent local blocker.
Clicking its Inspect entry displayed the named worker, seated artwork, Needs you, and the probe's output in inspection.

Stopping only the isolated transport made the core report the remote machine unreachable.
After scrolling the sidebar, the native view displayed Machine unavailable under the retained op-hz-lab heading.
The worker attention entry disappeared while the independent entry remained.
Inspection displayed Session unavailable and replaced prior output with an explicit unavailable message.
The earlier captures stayed unchanged until scrolling, so this does not prove automatic redraw timing.

The independent attention entry opened the local personal terminal while the remote machine was unavailable.
After restoring the transport, the worker attention entry returned.
Clicking it reopened the same worker inspection with the probe output and Needs you state.
Typing a marker and Return into inspection left the core's terminal output byte-identical.
The worker process 2654548 and the blocking program process 3484374 both survived the connection interruption.
Window status reported the worker inspection workspace with no errors after reconnection.
Evidence is saved in .superpowers/native/attention-reconnect-after.json.

The test program then exited through a direct fixture command.
The worker returned to its original shell with no reported status and the same process identifier.
This closes the native attention destination check for this disconnection cycle.
Automatic repaint, other interruption timings, and continuous animation remain separate acceptance gaps.

## Native physical-server coordinator replacement

Fleet setup linked disposable remote shell hz-registration-old, op-hz-lab/t1b, to home native-ssh-replacement.
After that shell ended, the setup dialog excluded it and offered hz-registration-new, op-hz-lab/t1c.
Linking the replacement to the same home closed the dialog and replaced the stale registration.
Exactly one registration remained for that home, with the replacement's creation time, 1794583025575.
All six unrelated coordinator registrations remained identical.

Back to firstmate opened the chooser, whose scrollable list included hz-registration-new with its remote machine identity.
Selecting it displayed the remote coordinator workspace, Luffy header, and shell prompt in /tmp.
Window status confirmed op-hz-lab/op-hz-registration with no errors or open overlays.
Four unrelated local and remote coordinator and worker processes retained their process identifiers, creation times, and live state.
Evidence is saved in .superpowers/native/ssh-registration-before.json, ssh-registration-linked.json, and ssh-registration-after.json.
This verifies replacement and navigation over the physical server connection while connected.
It does not establish replacement during a connection interruption or resolve the rendering and animation acceptance gaps.

## Persistent machine navigation

The populated native lab pushed remote machine headings below the visible sidebar while the local fleet remained expanded.
Machine shortcuts now remain above the scrolling fleet and show each alias with its actual machine identity.
Connecting and offline machines retain shortcuts with explicit state labels.
Selecting a shortcut scrolls to its machine group without selecting a session.
Herdr's installed `ScrollHandle` declaration documents revealing a direct child with the smallest necessary scroll.
Each machine group is one direct child so its ships and workers appear together when space permits.

Native verification used the installed mod in Grand Fleet Lab at 1280 × 820 logical pixels.
All three machines remained visible above the scrolling list.
Clicking `op-hz-lab` revealed its heading, Sunny, coordinator, and workers.
Clicking Water 7 returned to the local heading and crew.
The remote `hz-registration-new` terminal and its prompt remained displayed throughout both clicks.
The 105 JavaScript tests and native initial-render check passed.
The isolated SSH transport was disconnected to verify the native offline shortcut.
The shortcut displayed `op-hz-lab · Offline`, and selecting it revealed `Machine unavailable` without stale remote crew.
The selected terminal retained its explicit lost-connection message.
After restoring the transport, `hc machine ls` reported connected and the original shell retained PID 3928533 and creation time 1794583025575.
The capture initially retained the offline view after reconnection, including after a shortcut click.
Raising Grand Fleet Lab then showed the recovered crew, terminal prompt, and enabled terminal controls.
Recovery is verified, but automatic background redraw remains unproven.
This check does not establish layout behavior for an arbitrarily large machine inventory.

## Crew hierarchy against the prototype

The approved browser prototype was rendered at 1280 × 820 for comparison with Grand Fleet Lab.
Its indented crew and selected-row outline made the ship relationship clearer than the native flat list.
The native sidebar now groups each expanded crew under a vertical guide and reduces ship artwork from 84 to 64 logical pixels.
Selected coordinator and worker rows use a gold outline without changing their dimensions on selection.
Luffy remains first in each crew.

The installed change passed native inspection at 1280 × 820 and 1000 × 700 logical pixels.
Selecting the local test captain showed its existing three-pane workspace and the gold row outline.
Collapsing Sunny hid only its crew while the same coordinator and two personal terminal panes remained visible.
Expanding Sunny restored the crew in the same order.
The window was returned to 1280 × 820 after the size check.
All 105 JavaScript tests and the native initial-render check passed.
This comparison verifies the changed sidebar hierarchy, not every visual requirement or continuous animation playback.

## Native removal and reinstallation

Grand Fleet Lab switched to Herdr's shipped `terminals` layout and closed before removal.
The installer removed its owned mod files, layout, shortcut bindings, and receipt.
A complete regular-file comparison of the isolated app home found no changes outside those owned paths and `keys.json`.
The `shared.json` fleet records remained byte-identical.
Herdr reopened without the mod and displayed the existing coordinator and two personal terminals in their grid.

All 39 live test terminals retained their process identifiers, creation times, commands, parents, placement labels, and keep flags.
The inventory included local terminals and both remote test machines.
This verifies preservation of the isolated session inventory, not arbitrary external firstmate databases.
The installer never accesses external firstmate contract files.

Reinstallation initially refused the remaining mod folder because it contained Herdr-generated `gpui-kit.d.ts` and `jsconfig.json` without an ownership receipt.
Those files were preserved in `.superpowers/native/removal-editor-files` outside the app home.
Installation then succeeded and left the shared fleet records unchanged.
After reopening and switching to `one-piece`, the native fleet and existing grid returned with no application errors.
A second comparison confirmed that all 39 original live terminals still retained their process identity and placement.
The before, removed, and reinstalled inventories are stored in `.superpowers/native/removal-*.json`.
The installation guide now explains the required backup step when generated editor files remain after removal.
Since 2026-11-19 the installer accepts a folder that holds only those editor files, so that backup step is no longer needed for them.

## Actual firstmate worker launch and inspection

Firstmate's actual `bin/fm-spawn.sh` launched `native-discovery` through its `hc` backend in an isolated home and local test repository.
The launch used a shell diagnostic command that printed `native-firstmate-discovery-ok`.
The test disabled the spawn watcher guard in its isolated environment, following firstmate's existing backend smoke-test pattern.
This tests the launch and terminal integration, not an AI worker completing a supervised task.

The launcher created terminal `t2y` without a parent and assigned its own `firstmate.home` and `firstmate.task` labels.
Grand Fleet Lab discovered `fm-native-discovery` without manually adding worker labels.
Because no coordinator was registered for this isolated home, the sidebar correctly placed it under `WORKERS · LINK FIRSTMATE IN SETUP`.
Selecting the worker opened its separate inspection workspace and visibly displayed the diagnostic output.
The view showed `Inspection only`, `Status unavailable`, and the direct-input-disabled explanation.

Inspection removed the worker's Herdr placement labels and cleared its keep flag as designed.
Its process identifier, creation time, live state, and both firstmate ownership labels remained unchanged.
All 19 files under the isolated firstmate state and data directories retained identical hashes.
After inspection, firstmate's own `fm_backend_hc_capture` accepted the worker's ownership labels and read the diagnostic marker successfully.
The before-and-after records and assertions are retained in `.superpowers/native/firstmate-integration.json`.

A follow-up exercised firstmate's own `fm_backend_hc_send_text_line` against the same inspected worker.
The helper accepted the matching task label and the worker printed a unique marker, observed through `fm_backend_hc_capture`.
The same helper rejected a mismatched task label before submission, and its marker never appeared in captured output.
The worker retained process 18995, creation time 1794584371599, ownership labels, and its parked placement.
All 19 firstmate state and data files retained identical hashes.
This confirms that inspection preserves firstmate's input authority for the shell diagnostic worker.
It does not establish an AI worker's permission handling, attention transitions, or task completion.
The assertions and result are retained in `.superpowers/native/verify-firstmate-authority.py` and `.superpowers/native/firstmate-authority-verification.json`.

Coordinator registration, supervised attention transitions, return navigation for this home, and task completion remain unverified in a complete firstmate workflow.

## Terminal block preset feasibility

The installed documentation exposes `layout.set` for replacing a personal layout tree and terminal blocks for displaying existing terminal addresses.
This provides an alternative to changing the tab's internal split tree.
A cloned `one-piece-preset-proof` layout tested that alternative in Grand Fleet Lab.
It displayed the existing test coordinator `t1` beside personal shells `t3` and `t4`.

The first arrangement showed a full-height coordinator on the left and two stacked personal shells on the right.
The second showed three equal cells in a two-by-two grid with an empty fourth cell.
Both arrangements were visibly verified in native captures.
Typing `printf 'preset-block-input-ok\n'` into the upper-right personal block produced the marker in `t3`.
All 94 terminal inventory records retained their process identifiers, creation times, state, parents, keep flags, and labels after both layout changes.
That inventory includes finished records and is not a claim of 94 live terminals.
The original `one-piece` layout was restored with no reported application errors.
Proof layouts and before-and-after inventories remain under `.superpowers/native/preset-proof/`.

This proves that both geometries can render without moving or restarting terminals.
It does not yet establish a safe product integration.
They remain unimplemented in the product.
The installed `focused()` documentation says a layout terminal block has no model pane identifier.
Implicit pane commands and split placement therefore cannot be reused unchanged for these blocks.
Integration must target the original model panes explicitly and retain pane headers, close confirmation, focus restoration, and personal-terminal creation.
It must also reconcile blocks on workspace changes, worker inspection, process exit, and machine disconnection.
The proof uses fixed terminal addresses and does not verify those dynamic requirements.

### Preset persistence and focus constraints

The installed `focused()` documentation distinguishes terminal blocks from model panes.
A focused terminal block returns its terminal address but a null pane identifier.
The current header resolves the model's focused pane, while the close shortcut uses `focused().pane`.
A preset integration must resolve the selected block back to its original pane before creating or closing personal terminals.
It must retain the existing supervised-navigation check before focusing any coordinator or worker.

Inspection of Herdr's `layout.set` implementation confirmed that it atomically writes the replacement tree to the personal layout file.
Reading the proof file after returning to the normal layout confirmed that `t1`, `t3`, and `t4` remained embedded on disk.
The current installer checks each owned file against its recorded hash and refuses changed files.
Calling `layout.set` on the installed `one-piece` layout would therefore prevent normal upgrades and removal.
The proof used a separate clone, and the installed layout still matches its ownership receipt.

Before product integration, establish ownership and removal for a separate generated layout or another host-supported arrangement mechanism.
A generated layout must also reconcile persisted terminal addresses before exposing writable sessions after restart.
Do not weaken installation ownership checks or treat static addresses as current session identities to make the preset proof shippable.
These constraints remain open alongside the dynamic navigation requirements above.


## Core document preset feasibility

The installed `hc schema` exposes version-checked `doc.get` and `doc.set` operations.
Herdr stores each machine's workspace tree in the `herdr-app` document.
Its `mirror_sync.rs` implementation reads updated documents and replaces the corresponding machine's model.
This offers a route to rearrange real panes without writing the installed layout file or substituting terminal blocks.

In Grand Fleet Lab, the `op-captain` tab's three existing leaves were rearranged into two rows.
The test preserved all three pane identifiers and terminal references and added an empty fourth container.
The document changed from version 186 to 187 through a version-checked write.
A read returned the exact new tree.
Renaming that tab through `herdr-app do tab.rename` then produced version 188 with the new name and the exact new tree.
That round trip proves the running app consumed the external tree and retained it in its next model write.
The tab name and focused pane were restored through the app commands.
The original root was restored at version 190 after checking that the current root still matched the experiment.
Only that root changed in the fresh document, and a final read matched the submitted restoration.

Visual verification remains open.
Native window capture returned `cgWindowNotFound`.
The app's own frame capture returned identical image hashes before and after a successful focus change.
Its status correctly reported the changed focused pane, so the retained image cannot establish current geometry.
Do not infer a synchronization failure or successful rendering from that stale frame.
Evidence remains in `.superpowers/native/preset-core-{before,written,readback,app-sync,restored}.json`.

Before exposing preset controls, verify native geometry and input, remote document routing, conflict handling, and preservation of pane-specific behavior.
The document API accepts opaque JSON, so the integration must validate the workspace schema and refuse unsupported structures.
Use fresh versions and preserve unrelated document fields rather than replacing a document captured earlier.
The prototype presets remain unimplemented.


## Core document preset implementation

The coordinator header now exposes Arrange when its available tab contains the coordinator and at least one personal terminal.
The dialog offers Chat + terminals and Equal grid.
Secondmate inspection remains a mod pane with its original properties, rather than becoming a writable terminal.
Worker workspaces and unavailable machines cannot invoke the controller action.
The action captures pane identifiers, addresses, and machine identity before starting the local Python helper.
The helper reads the current document, validates that the same panes remain, and submits one version-checked write.
It preserves unrelated fields and never retries a rejected or unconfirmed write automatically.
Custom container structures, hidden panes, and constrained pane sizes are refused rather than silently discarded.
The installed layout and installer receipt remain untouched by preset changes.

The helper's command-line path was exercised with both presets on three local panes and two physical SSH-server panes.
Local document writes returned versions 191 and 192, and the remote writes returned 40 and 41.
After both arrangements, every tested terminal retained its process identifier, creation time, state, parent, keep flag, and labels.
Each original root was restored against a fresh document version and read back successfully.
Evidence is in `.superpowers/native/preset-helper-verification.json`.
This check exercises the real helper and core operations, not native clicks or current rendering.
The native control and visual acceptance gates remain open.

The reviewed implementation rejects every writable supervised terminal in the requested tab, including registered secondmates.
Regression tests reproduced the missing guard before the fix.
A write must return an unsigned integer version before the helper reports success.
Missing or invalid confirmation produces an uncertain-result error without retrying or removing pane zoom.
The final checks passed 110 JavaScript tests, 36 Python tests, and the native initial-render check.
The corrected helper repeated both presets against local versions 194/195 and SSH versions 43/44.
All five terminal identities remained unchanged, and the check restored both original arrangements.
The reviewed changes were installed into Grand Fleet Lab only.
Native click, input, continuous animation, and large-screen visual acceptance remain open.


## Native preset controls and worker return

Native clicks in Grand Fleet Lab exercised Equal grid on the local coordinator's three existing panes.
The resulting view placed t1 and t3 across the top row, with t4 below and an empty fourth cell.
Typing a unique marker into t4 produced its output there, while t1 remained at its untouched shell prompt.
Focus enlarged t4.
Choosing Chat + terminals from that enlarged view restored t1 on the left and stacked t3 and t4 on the right.
The t4 close dialog named the terminal and machine and explained that its process would end.
Cancel preserved the terminal.
Selecting test-worker opened inspection with direct input disabled.
Back to firstmate opened the coordinator chooser because the test inventory contains multiple firstmates.
Choosing test-captain restored the same three-pane arrangement and retained the personal terminal output.
The before and after inventory records for t1, t3, and t4 match exactly.
Those inventory records do not contain process identifiers, so this comparison alone does not prove process identity.
The earlier helper verification supplies the separate process-identity evidence for preset writes.
Evidence remains in `.superpowers/native/preset-ui-before.json` and `.superpowers/native/preset-ui-after.json`.

Remote native verification encountered a discrepancy before any preset was selected.
Clicking hz-captain changed the app status to `op-hz-lab/op-hz-captain` with no reported errors.
Native captures continued to show the local test-captain workspace with t3 and t4.
A subsequent click on an empty header area did not update that captured content.
No remote preset action was attempted against the mismatched view.
This is not evidence of successful remote visual navigation or a diagnosed mod defect.
Physical-display comparison remains necessary to distinguish stale capture from stale presentation.


## Native remote preset controls

Raising the existing Grand Fleet Lab window brought its capture into agreement with the reported remote workspace.
No restart or offscreen rendering command was used.
This recovery allowed remote preset testing, but does not resolve the separate resize and continuous-animation discrepancies.

Native clicks selected Equal grid for hz-captain and personal terminal op-hz-lab/t14.
The dialog closed and both panes remained visible in equal columns.
Typing `printf 'native-remote-preset-ok\n'` into the personal shell produced the expected output there.
Reading both terminals through hc confirmed that the marker reached only t14.
The coordinator remained at its unchanged prompt.
Focus enlarged t14 and showed its output across the workspace.
Choosing Chat + terminals from Arrange removed the enlargement and restored the coordinator left and personal shell right.
The two presets share the same visible two-column geometry for this two-pane inventory.
The local three-pane check establishes their different geometry with additional personal terminals.
Both remote terminals retained their process identifiers, creation times, states, parents, keep flags, and labels.
The identity comparison used hc get before the first preset and after the second preset.
Evidence remains in `.superpowers/native/preset-remote-ui-before.json` and `.superpowers/native/preset-remote-ui-after.json`.

## Real worker decision and turn completion

Firstmate launched the isolated `native-ai-flow` scout through `fm-spawn.sh` with Claude's auto permission mode.
The worker read the fixture README, wrote its report, and recorded a keyed needs-decision event before returning to its prompt.
Herdr reported the terminal as done while that decision remained unresolved.
Grand Fleet showed Finished and omitted the worker from attention.
This fails the vision's immediate blocker visibility requirement.
The earlier blocked-status fixtures exercised native reporting, not reconciliation with firstmate's durable decisions.

Firstmate's `fm-send.sh --resolve-key native-checkpoint` durably delivered the instruction to finalize the report.
The message moved into the handled inbox and the status record gained resolved and done events.
The worker remained in its fixture repository.
The supervision watcher was disabled for this isolated test, so this is not a complete supervised workflow acceptance result.

The mod now describes Herdr's done status as Turn complete in every shared status label.
A regression check failed against Finished and passed after this correction.
All 111 JavaScript tests and Herdr's initial-render check passed.
After installation into Grand Fleet Lab, native capture showed Turn complete in the real worker inspection.
The worker's shell identifier, Claude process identifier, creation time, ownership label, and disabled keep flag survived the app upgrade.
The correction does not fix the missing attention entry.

Firstmate already exposes authoritative task state and open decisions through `fm-fleet-snapshot.sh --json`.
Its documented schema is `fm-fleet-snapshot.v1`.
The command returned the completed fixture task, its exact endpoint, and an empty open-decision set after resolution.
The mod still needs an explicit connection to this source and verification while a decision remains open.
It must preserve machine and task identity and disclose unavailable evidence instead of guessing task completion from terminal state.
Evidence remains in `.superpowers/native/ai-flow-authoritative-snapshot.json` and `.superpowers/native/ai-flow-after-label-upgrade.json`.

## Authoritative open-decision source

A second instruction reached the same isolated worker through `fm-send.sh`.
The worker read its final report and opened decision `snapshot-checkpoint` without changing the project or report.
The snapshot reported current state parked, pending_decision true, and the exact keyed question in open_decisions.
At the same time, the native terminal reported done.
This establishes that the structured firstmate source distinguishes the condition that the native terminal status loses.

The snapshot named endpoint `fm-hclab-onepiece-32447-23158:t30`.
Reading that endpoint through firstmate's own hc adapter verified its creation time and both ownership labels against the live worker.
The task metadata, status record, and final report retained their byte hashes across the snapshot and endpoint reads.
Evidence remains in `.superpowers/native/ai-flow-open-decision-snapshot.json` and `.superpowers/native/ai-flow-open-decision-identity.json`.
The isolated decision remains open for native attention verification after integration.

The connection must retain executable root, operational home, and machine separately from a coordinator's display name.
Herdr's installed exec contract supports execution on a named machine through its existing core connection.
Firstmate's snapshot supplies authoritative decisions; its hc adapter supplies exact endpoint identity.
The renderer must verify machine, home label, task label, and terminal creation identity before attaching a decision to a live worker.
It must expose an unavailable source and reject stale results after configuration changes or disconnection.
Reading the last status-log line or matching only a task name does not satisfy this contract.

### Native decision records connection

The mod now reads firstmate's authoritative snapshot through a configured root and operational home on each machine.
Each task must match the live terminal address, creation timestamp, home label, and task label before its decisions affect the UI.
The reader uses firstmate's own backend adapter to resolve the endpoint.

Grand Fleet Lab connected the isolated `firstmate-bbb16e1f` home through Fleet setup.
The real `native-ai-flow` worker changed from Turn complete to Needs you, displayed a sitting character, and gained an attention entry.
Answering `snapshot-checkpoint` through `fm-send.sh --resolve-key` removed the decision from the next native reader result.
The worker attention entry disappeared and its character returned to sleeping after the turn ended.
The snapshot then reported unknown task state, so the UI correctly retained Turn complete rather than claiming Task complete.
The snapshot and screenshot observations establish local decision presentation and clearance, not a supervised workflow acceptance pass.

Validation passed 113 JavaScript tests, 38 Python tests, and `herdr-app check mods/one-piece`.
Remote record connections, large-home setup layout, and malformed nested snapshot objects still require additional validation before this change is finalized.
The native lab runner preserves its explicit firstmate socket override only inside its ignored test environment.
Grand Fleet Render Lab and the user's normal Herdr application were not changed during this check.

### Remote decision records and reconnect validation

The records reader ran through the existing op-hz-lab connection against an isolated firstmate home on the remote machine.
The test used terminal t1d, its exact creation timestamp, and task fm-records-check.
Firstmate's status writer opened the remote-check decision.
Grand Fleet Lab showed an attention entry for that remote worker.
Clicking the entry opened inspection on op-hz-lab with Needs you and the sitting character.
Resolving the decision through firstmate's status writer removed the attention entry and restored the sleeping character.
The remote reader then returned no pending decisions.
This fixture used a shell with firstmate task metadata, not an autonomous remote worker.
It proves remote record transport, identity matching, and native presentation, not a complete supervised remote workflow.

Review reproduced malformed records and overlapping reads across sidebar copies.
Validation now rejects malformed snapshot fields and cached rows without crashing the sidebar.
Sidebar copies share pending reads, while different configured homes read independently.
A separate regression reproduced disconnection followed by reconnection before an earlier read returned.
Observing disconnection now clears cached records and cancels publication from that pending read.
The next read after reconnection supplies fresh records.
This timing regression uses a simulated host and does not establish physical disconnection timing.

Validation passed 116 JavaScript tests, 39 Python tests, the native mod check, and whitespace checks.
Independent review found no remaining concrete bugs in the records changes.
The updated mod was installed into the closed Grand Fleet Lab home and inspected after relaunch.
The remote inspection remained available without restoring the resolved attention entry.
The ordinary Herdr application and Grand Fleet Render Lab were not modified.

### Local supervised decision cycle

On 2026-11-13, Grand Fleet Lab ran an isolated firstmate primary in terminal t32 against the existing native-ai-flow worker in t30.
The primary used the documented Claude Stop hook watcher with the headless supervision host disabled for this test home.
Native Fleet setup linked the primary to firstmate-bbb16e1f and displayed Luffy with op-firstmate-primary.
The primary sent steering message 004 through firstmate's own command, asking the worker to open supervised-native-checkpoint.
The worker opened that decision and waited.
The native attention entry opened inspection with Needs you, the sitting character, and disabled input.
Back to firstmate opened a coordinator chooser because the lab contains multiple registered firstmates.
Selecting op-firstmate-primary returned to its workspace.

The watcher automatically delivered the decision notification to the primary.
Captain confirmation was submitted through the isolated terminal controller, not proven through native keyboard input.
The primary used fm-send.sh with --resolve-key to deliver steering message 005 and record the resolution.
The worker consumed that message and recorded done.
The worker's native attention entry cleared.
A second automatic Stop hook notification delivered completion to the primary.
The primary acknowledged those notifications successfully, leaving the wake queue empty.
Individual command approvals retained manual permission mode throughout this cycle.

SHA-256 comparisons confirmed that the report and project README matched their saved baseline after resolution.
The status history contained the needs-decision, resolved, and done events in order.
This establishes local supervision of an existing worker, including automatic decision and completion notifications.
It does not establish fresh delegation by this primary, remote autonomous supervision, or reliable native keyboard submission.
No application code changed during this verification.
Grand Fleet Render Lab and the ordinary Herdr application were not modified.

### Fresh delegation through the native firstmate workspace

The same isolated primary then created native-fresh-flow through fm-brief.sh and fm-spawn.sh on 2026-11-13.
Firstmate launched the scout in terminal t33 with its own worktree at ~/.treehouse/project-671758/2/project.
The scout read the fixture README, wrote its report, and opened fresh-native-checkpoint.
The mod discovered Worker · fm-native-fresh-flow without another registration or records connection.
Its attention entry remained separate from Independent · independent-probe.
Clicking that entry opened a separate worker inspection workspace with Needs you and a sitting Pirate.
The view explicitly disabled direct input and offered selection and copying.
Back to firstmate opened the existing coordinator chooser, and selecting op-firstmate-primary returned to Luffy's terminal.

Confirmation typed and submitted through the native firstmate terminal appeared in the primary's conversation.
The automatic Stop hook notification delivered the new worker's decision.
The primary relayed confirmation using fm-send.sh with --resolve-key and acknowledged the drained notifications.
The worker consumed the steering message, passed its scout completion gate, and recorded done.
The durable history contains needs-decision, resolved, and done in order.
SHA-256 comparisons confirmed that the report and project README were unchanged across resolution.
The new worktree remained clean.
The worker attention entry cleared, leaving the independent attention entry visible.
The Stop hook automatically delivered the new worker completion notification to the primary.
This verifies fresh local delegation, automatic discovery, decision presentation, inspection, return navigation, and native coordinator input.
It does not establish the corresponding autonomous remote workflow or close the rendering and animation gates.

## Direct return to the owning firstmate

The fresh local delegation exposed an unnecessary chooser when returning from worker inspection.
Four local firstmates were registered, although the inspected worker belonged uniquely to `op-firstmate-primary`.
The return action now uses the existing fleet grouping to select that worker's live firstmate directly.
Grouping retains machine boundaries and rejects duplicate home registrations.
Unknown ownership, secondmate inspection, and the global firstmate command retain the existing selection behavior.

In Grand Fleet Lab, selecting `fm-native-fresh-flow` opened its inspection workspace with direct input disabled.
Clicking **Back to firstmate** then opened `op-firstmate-primary` without displaying a chooser.
The native application status confirmed terminal `t32`, workspace `op-independent-t32-1794592321467`, no overlays, and no reported errors.
The worker and firstmate sessions remained running.
All 120 JavaScript tests and the native mod check passed.
The regression tests cover direct ownership, a different machine with the same home, stale terminal identity, and duplicate home registrations.
This navigation check does not close the outstanding animation, resize, or autonomous remote workflow acceptance gates.

## Fresh remote delegation and decision cycle

On 2026-11-13, Grand Fleet Lab ran a new firstmate in `op-hz-lab/t1g` on the physical remote server.
The primary used `/tmp/op-supervised-e3qvrys8/home` and a disposable project with one README heading.
Native Fleet setup registered `op-remote-firstmate` under `firstmate-cc65e0cb` and connected that home's task records.
The primary retained manual command approvals throughout the test.
Its normal Stop hook supplied supervision notifications.

Firstmate created `remote-native-flow` through its brief and spawn commands.
The worker ran in `op-hz-lab/t1h` with its own worktree at `/home/firstmate/.treehouse/project-146149/1/project`.
It wrote a report and opened `remote-native-checkpoint`.
The mod discovered its separate Worker attention entry after connecting the records.
Clicking that entry opened worker inspection with Needs you, a sitting Pirate, and explicitly disabled direct input.
Back to firstmate returned directly to `op-remote-firstmate` without a chooser.

Captain confirmation was pasted and submitted through the native firstmate terminal.
Firstmate delivered message `001.msg` through `fm-send.sh --resolve-key`.
The worker consumed that message, passed its completion gate, and recorded done.
The durable status history contains needs-decision, resolved, and done in that order.
The worker attention entry cleared while the separate Independent entry remained.
The Stop hook automatically notified firstmate of completion, and firstmate acknowledged the delivered events.

SHA-256 comparisons matched the report and project README against their pre-confirmation values.
The worktree remained clean, and the project, report, worktree, and terminal were preserved.
This verifies fresh remote delegation, native coordinator input, discovery, attention, inspection, direct return, and supervised resolution in the isolated fleet.
It does not verify continuous animation, resize presentation, background connection recovery, or the complete large-screen visual experience.

## Remote recovery without window input

A fresh check disconnected only the isolated `op-hz-lab` transport while its firstmate workspace was visible.
The transport wrapper refused reconnection for 28 seconds and then resumed automatically.
No clicks, key presses, window raising, or forced application snapshots occurred between disconnection and the recovery capture.
Native captures showed Offline and Machine unavailable during the interruption.
The terminal displayed its lost-connection notice.
After transport restoration, a native capture showed the machine and its crew again without further input.
The core reported connected, and both `t1g` and `t1h` retained their original process identifiers and creation timestamps.
This establishes automatic sidebar recovery for the tested connection cycle.

The recovered firstmate terminal also showed malformed wrapping, including short fragments along opposite edges.
A subsequent core query reported 200 columns and 120 rows for `t1g`.
Those dimensions alone do not establish whether the malformed output originated in terminal reflow, application rendering, or capture.
Full terminal recovery remains unresolved until that discrepancy is reproduced and isolated.
The transport override was removed by the test's cleanup block.

### Recovered terminal dimension comparison

The saved pre-disconnection record reports 109 columns and 33 rows for the remote firstmate.
The post-reconnection record reports 200 columns and 120 rows.
A direct query on the remote machine confirmed the larger dimensions.
The core's text read had normal wrapping at that size while the native capture retained malformed fragments.
Clicking the native terminal restored 109 columns and 33 rows without changing the process identifier or creation timestamp.
The immediate capture still showed malformed text.
This establishes a dimension change independently of the static-label capture discrepancy.
It does not yet identify which connection or replay component changed the dimensions.

### Independent connection control

A disposable test used the installed core 0.1.20 with two isolated local core sessions and a framed viewer.
The viewer attached at 100 columns and 30 rows, then sent a resize to 109 columns and 33 rows.
Interrupting its connection changed the remote terminal to the documented headless default of 200 columns and 120 rows.
Restoring the connection returned the terminal to 109 columns and 33 rows without another viewer resize or focus event.
The test asserted that final size and passed.
Both disposable cores were stopped after the check.

The [0.1.20 relay implementation](https://github.com/herdrdev/herdr-core/blob/v0.1.20/crates/herdr-core/src/remote/viewers.rs) records resize frames and reuses those parameters when reconnecting.
The control verifies that path with the installed binary, independently of native terminal rendering.
It does not reproduce the persistent 200-by-120 size seen in Grand Fleet Lab.
Further investigation must compare native viewer traffic or terminal replies against this passing control before changing the relay implementation.

### Multiple-viewer recovery reproduction

A metadata-only trace found two resumed attachments for the remote firstmate, requesting 109-by-33 and 200-by-120 respectively.
The original transport wrapper was restored afterward, and machine status confirmed reconnection.
A disposable two-core test added a second viewer at 200-by-120 before resizing the first viewer to 109-by-33.
The fourth repeated attempt recovered at 200-by-120 and failed the expected-size assertion.
This reproduces the size failure without the mod or native application.
Each attempt stopped both disposable cores afterward.

The core stores relayed viewers in a HashMap and marks all resumed attachments with no activity timestamp.
Its size selection therefore cannot preserve their previous activity ordering when those viewers return.
The resulting tie depends on attachment order.
A correction must also preserve the existing rule that a returning viewer cannot displace a viewer active during the outage.
The native output still requires verification after correcting size ownership.
The investigation is tracked in [issue 3](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/3).

### Isolated core correction

A separate core checkout now contains a candidate correction that reattaches viewers from oldest to newest activity.
An eight-viewer integration test reproduced the defect before that correction, recovering at 200-by-120 instead of 109-by-33.
With the correction, all 24 remote integration tests passed.
That includes the existing test requiring a viewer active during the outage to retain size ownership.
Formatting and whitespace checks passed.
The full core suite stopped at two library failures: SSH agent socket refresh and process cleanup.
Repeating the library suite on unchanged core code reproduced the process cleanup failure, while the socket test passed.
The socket failure remains unexplained, so the full validation gate has not passed.
The candidate was subsequently installed only in Grand Fleet Lab's isolated core session.
Grand Fleet Render Lab and the ordinary Herdr installation were not changed.
The restart preserved all 33 live terminals.
An interruption then changed the test machine to unreachable before automatic reconnection.
The remote firstmate retained process 17778, creation timestamp 1794593609763, and its 109-column by 33-row dimensions without further input.
The saved comparison is `.superpowers/native/candidate-core-recovery.json`.
This verifies dimension preservation for that native recovery cycle.
The later native capture was readable, but the window dimensions had changed between captures.
A fixed-window comparison is still required to establish visual recovery.

Running the core suite serially passed all 157 library tests, with one ignored test.
That run later failed two foreground-status tests, each receiving no status instead of working.
Both foreground-status failures also reproduce on unchanged v0.1.20 code.
They are tracked separately in [issue 4](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/4).
The remaining integration suites finished with 265 passing tests, one failure, and two ignored tests.
The failure came from a disposable Git repository inheriting commit signing without its fixture identity's signing key.
Disabling signing only in the test process passed all six command execution tests on both unchanged and candidate code.
No global Git settings were changed.
The full core validation gate, continuous animation, and the separate resize rendering discrepancy remain open.

### Fixed-window recovery follow-up

A subsequent cycle kept both native captures at 3456 by 1988 pixels and sent no window input during reconnection.
The dimension assertion failed: the remote firstmate changed from 113 columns by 36 rows to 161 columns by 43 rows.
Its process identifier and creation timestamp remained unchanged.
The evidence is `.superpowers/native/candidate-fixed-viewport-recovery.json`.
Overlapping terminal text was already present before this interruption.
The before and after captures were nearly identical despite the changed core dimensions.
This does not establish whether the viewer changed its requested size during reconnection or whether replay selected another viewer.
The candidate therefore remains insufficiently verified for native recovery, despite its passing controlled integration test.
No production core installation includes it.

The candidate passed macOS Clippy with warnings treated as errors using Homebrew Rust 1.99.1.
Dependency advisory, license, source, and ban checks passed with cargo-deny 0.20.2.
Windows Clippy also passed with warnings treated as errors using the isolated Rust 1.95.0 toolchain.
Cross-compilation does not establish Windows runtime behavior.

### Native animation activity trace

Grand Fleet Render Lab now includes Sunny beside its static text reproduction.
Its isolated diagnostic build logs image identity, decoded frame count, selected frame, window activity, and reduced-motion preference.
The image decoded all six frames with reduced motion disabled.
The trace recorded 234 active-window layout passes across frames zero through three.
After the window became inactive, the image retained frame three and stopped requesting continuous updates.
The renderer explicitly pauses animated images in inactive windows.
The evidence is `.superpowers/native/image-animation-activity.log`.
This proves frame advancement in the renderer while active, but does not prove continuous visible playback.
Raising and clicking through the automation tool did not leave this window active in the subsequent trace.
A focused-window visual comparison remains pending.
The diagnostic build and probe do not change the production mod.

### Renderer lab interference isolated

The fixed-window recovery failure was retested with Grand Fleet Render Lab closed.
Grand Fleet Lab remained open on the remote firstmate, with no terminal input sent.
The remote process remained PID 17778 with creation time 1794593609763.
Its dimensions remained 161 columns by 43 rows across the forced SSH interruption.
The recovery observation is saved locally in `.superpowers/native/candidate-single-app-recovery.json`.
A native screenshot after recovery showed readable terminal output and the pending approval without overlapping text.

Reopening Grand Fleet Render Lab changed that same remote terminal to 113 columns by 36 rows without another interruption.
Eight consecutive observations recorded the smaller dimensions and unchanged process identity.
Those observations are saved locally in `.superpowers/native/candidate-renderer-reopened.json`.
Both apps used the same isolated core, so the renderer lab was not independent of the workflow lab.
This establishes interference from reopening the renderer lab, but does not identify the exact hidden viewer responsible.
Grand Fleet Render Lab was closed again after this experiment.
Future rendering experiments must use a separate core session before their results can establish workflow recovery behavior.
The earlier two-app failure remains recorded, but cannot establish failure of single-app recovery.
One passing single-app cycle does not establish reliable recovery across all supported layouts and viewers.

Grand Fleet Render Lab now uses its own core session, `op-render-isolated`.
Its socket is `/var/tmp/op-render-core-isolated/core.sock`, with separate configuration and state directories.
The new core initially reported zero terminals and zero remote machines.
A disposable local shell and the existing Sunny/text probe were then opened in that core.
The native window shows only the independent renderer workspace and no fleet agents.
The workflow terminal remained 161 columns by 43 rows after the independent renderer opened.
The environment overrides are saved locally in `.superpowers/native/render-isolated-environment.json`.

### Independent split recovery and visible ship motion

Grand Fleet Lab opened a personal remote terminal beside the remote firstmate through the native `Your terminal` control.
The personal shell printed a marker, its working directory, and its terminal dimensions without sending input to firstmate.
Both panes reported 79 columns by 43 rows before interruption.
An immediate recovery check observed 200 columns by 120 rows and initially failed its dimension assertion.
A timed follow-up established that this mismatch was temporary in that cycle.
Both terminals reported 200 columns by 120 rows at 1.11 seconds, then restored 79 columns by 43 rows at 2.14 seconds.
All subsequent observations through 20.8 seconds retained the restored dimensions and original process identities.
The evidence is `.superpowers/native/candidate-split-recovery-timeline.json`.
A native screenshot after settling showed readable firstmate output and the personal shell marker in separate panes.
The temporary resize remains a recovery concern, but this cycle does not demonstrate persistent dimension loss.

With Grand Fleet Lab active, forty consecutive native screenshots captured Sunny changing without terminal input or a forced renderer redraw.
The Sunny region contained four distinct captured images and seven transitions across the sequence.
The sampled Luffy region remained unchanged.
The evidence is `.superpowers/native/active-workflow-frame-comparison.json` and its numbered JPEG captures.
This establishes visible ship motion in the active workflow window during the sample.
It does not establish worker animation, inactive-window playback, or correctness after resizing.
Grand Fleet Render Lab remained on its independent core throughout this observation.

### Worker animation follow-up

The existing disposable Franky worker ran the same status program used for the earlier native state checks.
The core reported idle, then working, and the native sidebar displayed the corresponding artwork and text.
Thirty-five idle captures and thirty-five working captures each contained one distinct image within the worker region.
Another forty captures after clicking the workspace header also contained one distinct worker image.
The native window controls appeared inactive during the working sample.
These observations do not establish active-window worker playback or an animation defect.
The comparison is saved in `.superpowers/native/worker-animation-comparison.json`.
Exiting the program restored the original shell, process 21083, with no reported status.

The large-screen capture also exposes two visible `Your terminal` controls, one in the workspace header and one in the tab strip.
The prototype repeats its terminal creation action in the sidebar and workspace toolbar.
The native controls instead perform different operations: splitting the active pane and creating a tab.
The native layout uses a 310-point sidebar, compared with the prototype's final 255-pixel sidebar rule.
These differences require a deliberate visual review before claiming fidelity to the approved prototype.

### Distinguish terminal creation from tab creation

The native tab strip now labels its creation action `New tab`.
The workspace toolbar retains `Your terminal`, which splits the active view.
Both controls keep their existing availability checks and commands.
The installed Herdr declarations document `tab.new` separately from `pane.split`.
The change passed all 120 JavaScript tests and the native initial-render check.
After installing the file in Grand Fleet Lab, a native screenshot showed both distinct labels beside the existing remote split.
The wider native sidebar remains under visual review rather than being changed without checking long machine and worker names.

## Recovery candidate against Core 0.1.21

The isolated checkout `/tmp/op-core-current-source` uses upstream tag `v0.1.21`, commit `1b0393f80c35b1dae34f37934d33d0144a8fc8d7`.
The existing reconnect patch applies without conflicts.
Upstream left `src/remote/viewers.rs` unchanged between 0.1.20 and 0.1.21.

With the candidate, all seven foreground-status tests and all 24 remote integration tests passed.
The two foreground-status failures recorded against 0.1.20 no longer reproduce in this run.
The upstream release fixes those tests by waiting for the initial status report before checking its persistence.

The regression was then run with unchanged 0.1.21 relay code and the added test.
It failed because recovery selected a hidden viewer's 200 × 120 size instead of the visible viewer's 109 × 33 size.
The candidate source was restored after that comparison.
This establishes that the released update alone does not fix the reproduced recovery defect.
Logs are saved locally as `.superpowers/native/core-0.1.21-candidate-tests.log` and `.superpowers/native/core-0.1.21-baseline-regression.log`.

Neither application nor the user's installed core was upgraded during this comparison.
These tests do not verify native transient resizing, continuous worker animation, or text visibility after resizing.
Those acceptance gates remain open.

## Transient size during transport loss

A disposable diagnostic on Core 0.1.21 with the candidate patch attached eight writable viewers through one transport.
The most recently active viewer selected 109 × 33, while the others requested 200 × 120.
A local observer on the remote core recorded every resize notification without acquiring resize authority.
The test killed only its isolated transport process and kept the remote core running.

The observer recorded exactly `[(200, 120), (109, 33)]` through disconnection and recovery.
The self-contained diagnostic passed in 1.44 seconds.
Its source and log are saved locally as `.superpowers/native/recovery-size-timeline-probe.rs` and `.superpowers/native/recovery-size-timeline.log`.
The diagnostic was removed from the candidate checkout after collecting evidence.

Core's `detach` calls `apply_size` when writable viewers leave.
With no writable viewer, `apply_size` selects the configured headless size, which defaults to 200 × 120.
The [released implementation](https://github.com/herdrdev/herdr-core/blob/v0.1.21/crates/herdr-core/src/viewers.rs) therefore explains the temporary dimensions without requiring another mod workaround.
The candidate restores the last active viewer's size once attachment completes.

This trace does not prove correct repainting in the native application.
The earlier malformed output still requires a native reproduction with independently isolated applications.
The remaining recovery check concerns final dimensions, readable output, process identity, and working input after reconnect.

## Native wrapping recovery and active worker motion

The native split contained remote firstmate `op-hz-lab/t1g` and personal shell `op-hz-lab/t1k`.
Both used 79 columns and 43 rows before disconnection.
Native keyboard input printed a 125-character wrapping marker in the personal shell.
Only the isolated SSH transport process was terminated.
The firstmate process received no keyboard input or approval.

Four recovery samples confirmed three consecutive settled sizes by 4.285 seconds.
Both process identifiers and creation times matched their pre-disconnection values.
The capture before additional input showed readable wrapped text and both marker boundaries.
Native typing then printed `RECOVERY-INPUT-OK` and `stty size` returned `43 79`.
The original personal shell remained PID 1040875, created at 1794596816772.
Evidence is saved locally in `.superpowers/native/native-wrap-recovery.json` and `.superpowers/native/native-wrap-after-reconnect.jpg`.
This run used the existing 0.1.20-based candidate core, not the separate 0.1.21 test checkout.
The earlier malformed output did not reproduce with the two applications using independent core sessions.

The application stayed active during the subsequent worker animation check.
The existing disposable worker `t8` reported working through its status probe, selecting Franky's walking artwork.
Thirty-six consecutive native captures produced 11 distinct worker crops over approximately 2.9 seconds.
Clicking Pause motion produced one identical worker crop across 36 captures.
Clicking Play motion produced 10 distinct worker crops across 24 captures.
No keyboard input or forced redraw occurred within each capture series.
The 80 × 100 pixel crop at (95, 820) contained the worker artwork, excluding its text and neighboring ships.
The comparison files use the `worker-active-final`, `worker-paused-final`, and `worker-resumed-final` prefixes under `.superpowers/native/`.
The status probe was exited after measurement, and motion was left enabled.
This verifies working animation and pause/resume for Franky, alongside the earlier Sunny playback evidence.
It does not close the separate resize visibility defect or the complete visual review.

## Mod window resize follow-up

Grand Fleet Lab was captured at 1280 × 820 points and then expanded to 1728 × 994 points through its native zoom action.
Both captures showed readable sidebar labels, controls, artwork, and both remote terminal panes.
The terminal text reflowed without overlapping rows.
No terminal input or forced CLI screenshot redraw occurred during this resize check.
The captures are saved locally as `.superpowers/native/mod-resize-small.jpg` and `.superpowers/native/mod-resize-large.jpg`.
This successful mod-window sample does not resolve the independently reproduced Render Lab visibility defect.

## Core 0.1.21 complete test run

The candidate patch passed `cargo test --locked` on the isolated 0.1.21 checkout with exit code zero.
The suite retained its explicitly ignored test.
The run disabled Git commit signing only through process environment variables for disposable test repositories.
Formatting, dependency checks, native Clippy, and Windows Clippy also passed.
Native tests and Clippy used Homebrew Rust 1.99.1.
Windows Clippy used the isolated Rust 1.95.0 toolchain, which contains the Windows standard library target.
An initial Windows check selected Homebrew Rust without that target and failed before checking project code.
Selecting the isolated toolchain resolved the environment failure.
The final logs are saved locally as `.superpowers/native/core-0.1.21-{full-tests,deny,clippy,windows-clippy}.log`.
These checks do not constitute Windows runtime testing or resolve the native renderer defect.
The candidate still requires final review and delivery before users can rely on this recovery behavior.

## Compact attention cards and current resize checks

The attention cards now use less padding and spacing, leaving more sidebar room for the fleet hierarchy.
Their session label, machine identity, action label, and click handlers remain unchanged.
Native captures at 1728 × 994 and 1280 × 820 points show all three current attention cards without clipping.
Both terminal panes remain readable after resizing without terminal input or a forced CLI screenshot redraw.
The installed mod passed `Herdr check mods/one-piece` after the final spacing adjustment.
Evidence is saved locally as `.superpowers/native/compact-attention-{large,small}.jpg`.

The separate Grand Fleet Render Lab also retained its static text when expanded and reduced through native window zoom.
Evidence is saved locally as `.superpowers/native/render-resize-current-{large,small}.jpg`.
The earlier text disappearance did not reproduce in these checks, but its cause remains unexplained.
These observations do not establish a renderer fix or complete the full visual review.

## Core recovery patch submitted upstream

The candidate is committed as `e4b913e` on the isolated Core 0.1.21 checkout.
An independent code review found no introduced blockers and confirmed activity parity with local viewers.
The reviewer noted that unmodified hash iteration can occasionally restore the correct viewer last, making the baseline failure probabilistic.
The existing cloned-record replacement after an awaited reattachment request remains unchanged.
The reviewer inspected the passing test and lint logs but did not rerun native tests.

The patch is submitted as [herdr-core PR 271](https://github.com/herdrdev/herdr-core/pull/271).
The upstream master branch had one additional unrelated logging fix and no changes to the patched recovery files at submission.
Upstream review, automated checks, and release remain pending.
The mod does not bundle or install the candidate Core.

## Setup scrolling and worker inspection

The setup dialog reproduced a crowded session list at 1280 × 820 points when several firstmate homes were available.
The form now scrolls while its title, status message, and action buttons remain visible.
The session list has its own fixed-height scrolling region.
Native inspection reached every home and task-record button without changing registrations.
The Cancel and Link buttons stayed visible throughout scrolling.
Evidence is saved locally as `.superpowers/native/setup-crowded-before.jpg` and `.superpowers/native/setup-scroll-{top,bottom}.jpg`.

Worker inspection remained readable at 1280 × 820 and 1728 × 994 points.
The worker artwork, inspection-only notice, terminal text, and Back to firstmate button remained visible after resizing.
No terminal input or forced CLI screenshot redraw occurred during these checks.
Evidence is saved locally as `.superpowers/native/visual-worker-{small,large}.jpg`.
The installed mod check and all 120 JavaScript tests passed after the setup layout change.
These checks do not resolve the earlier intermittent text disappearance or complete the remaining visual review.

## Large-screen comparison after setup correction

The native coordinator workspace was compared with the approved prototype at 1728 × 994 points.
The comparison used the existing remote firstmate and its independent terminal.
Clicking Focus enlarged firstmate, and clicking Grid restored both panes with their existing contents.
Luffy, the coordinator label, toolbar labels, and terminal text remained visible throughout this sample.
No terminal input or forced CLI screenshot redraw occurred.
Evidence is saved locally as `.superpowers/native/visual-firstmate-{focused,grid}.jpg`.

| Area | Native comparison | Remaining decision or check |
| --- | --- | --- |
| Color and artwork | Dark teal surfaces, gold selection borders, Sunny, and Luffy preserve the prototype's visual language | No change indicated by this sample |
| Sidebar hierarchy | Ships group indented characters, and the machine shortcuts remain visible while the inventory scrolls | Compare the 310-point width with a narrower candidate using long names |
| Coordinator content | Real terminal output replaces the prototype's simulated conversation | Keep the actual session and its permission prompts intact |
| Independent work | The restored grid shows firstmate and the personal terminal side by side | Already verified for this two-pane inventory |
| Workspace controls | Arrange groups the prototype's two preset actions, while New tab distinguishes tab creation from terminal splitting | Check toolbar density at the smallest supported window |
| Crew access | Workers remain available in the sidebar rather than a second strip beneath the coordinator | Review discoverability when the active coordinator is below the sidebar viewport |
| Worker inspection | The separate workspace displays artwork, task identity, read-only output, and Back to firstmate | Small and large captures passed in the preceding section |

Window resizing and pane enlargement are distinct checks.
This successful pane enlargement does not explain the earlier minimal-probe failure.

## Sidebar width and compact toolbar decision

A disposable 255-point sidebar was compared with the 310-point default in Grand Fleet Lab.
The narrower candidate wrapped three machine shortcuts onto two rows and truncated the existing `inspection-failure-probe` worker name.
The 310-point default was restored because it preserves more fleet rows and readable task identity for this inventory.
The comparison is saved locally as `.superpowers/native/sidebar-width-255.jpg`.
No repository layout change was retained.

Resizing the native window to 1000 × 700 reproduced a separate toolbar problem.
Its duplicate Fleet setup button squeezed the workspace subtitle until the coordinator's machine name disappeared.
Removing that duplicate restored the complete machine identity while retaining all terminal and arrangement controls.
The sidebar's Set up fleet button opened the same setup dialog at this size.
Cancel closed it without changing registrations.
The final capture is saved locally as `.superpowers/native/toolbar-1000-after.jpg`.
All 120 JavaScript tests and the installed mod check passed.

## Remote worker navigation at compact size

Grand Fleet Lab remained at 1000 × 700 while the remote coordinator was below the visible sidebar.
The first machine shortcut attempt left the viewport unchanged.
After manual scrolling, the remote shortcut revealed its machine heading and crew.
Subsequent local and remote shortcut selections worked without changing the coordinator's two-pane workspace.
The initial unchanged result remains unexplained, so this check does not establish reliable first-click behavior after activation.
No speculative scrolling change was made.

Selecting `hz-worker` opened its separate inspection workspace with readable output and direct input disabled.
Back to firstmate returned to `hz-captain` and its existing personal terminal split.
Selecting the remote firstmate attention card restored the recovery workspace and its personal terminal output.
No terminal input was sent during this navigation check.
The inspection capture is saved locally as `.superpowers/native/remote-worker-navigation.jpg`.

All six upstream checks for herdr-core PR 271 passed, including Linux, macOS, Windows, lint, upgrade, and the aggregate check.
This confirms the upstream automated checks, not acceptance or release of the patch.

An explicit switch from Grand Fleet Render Lab back to Grand Fleet Lab did not reproduce the missed machine shortcut.
The first local-machine click revealed Water 7 while preserving the remote coordinator workspace.
Application switching alone is therefore insufficient to reproduce the initial unchanged viewport.

Opening Fleet setup, cancelling it, and selecting the remote machine shortcut also revealed its heading and crew on the first click.
The coordinator workspace stayed unchanged.
Closing Fleet setup alone therefore did not reproduce the missed shortcut either.

## Upstream recovery patch accepted

The GitHub pull request query now reports [Herdr Core PR 271](https://github.com/herdrdev/herdr-core/pull/271) as merged.
Its merge timestamp is 2026-11-13 at 19:52:25 UTC, with all six checks passing.
This closes upstream acceptance of the recovery patch.
Release queries for `herdrdev/herdr-core` and `herdrdev/herdr-app` returned no entries.
Those responses do not establish whether another distribution channel contains the fix.
The isolated application still uses the previously verified candidate binary.
Validation of an installable release remains open.

The subsequent distribution check identified the actual update channel in Herdr's source.
Core reads `https://releases.herdr.dev/core/latest.json`, and the application reads `https://releases.herdr.dev/app/latest.json`.
Those manifests currently advertise Core 0.1.21 and App 0.1.15.
The remote tag query resolves Core 0.1.21 to `1b0393f80c35b1dae34f37934d33d0144a8fc8d7`.
Comparing its `crates/herdr-core/src/remote/viewers.rs` with the submitted patch confirms that the tag lacks activity tracking and ordered reattachment.
The GitHub release list was therefore not the authoritative distribution check.
The published Core update cannot close recovery acceptance yet.
No application or Core binary was replaced during this check.

## Visual comparison conclusion

The current native layout was reviewed against the saved 1728 × 994 prototype capture and the preceding native captures at both supported review sizes.
The compact Arrange dialog was also opened at 1000 × 700.
Both preset names, their explanations, and Cancel remained visible without clipping.
Cancel returned to the existing workspace without sending terminal input.
The capture is saved locally as `.superpowers/native/visual-arrange-compact.jpg`.

| Prototype area | Native conclusion |
| --- | --- |
| Palette and artwork | Dark teal surfaces, gold emphasis, and the custom Sunny and character artwork retain the approved visual language. |
| Machine and crew hierarchy | Persistent machine shortcuts and indented crew preserve navigation across a scrolling inventory. |
| Sidebar width | Keep 310 points because the tested narrower version wraps shortcuts and truncates task names sooner. |
| Coordinator content | The actual terminal preserves real permission prompts instead of reproducing simulated chat bubbles. |
| Personal terminals | Existing local three-pane and remote two-pane checks establish the reviewed grid and focused arrangements. |
| Workspace controls | The compact toolbar exposes machine identity, and Arrange presents both prototype presets with readable explanations. |
| Crew inspection | Sidebar selection opens a separate read-only workspace with artwork, task identity, and return to the owning firstmate. |
| Attention | Three compact cards remain readable without consuming the whole crew viewport. |

This completes the appearance comparison for the recorded inventories and window sizes.
It does not establish arbitrary fleet sizes, every keyboard interaction, or reliable rendering across every resize.
The initial missed machine shortcut remains unexplained despite successful subsequent navigation checks.
The rendering discrepancy and released Core verification remain separate acceptance gates.

## Merged-source Core verification

The official merged commit `e12fee23768764e8c85699f30ce520e53fcffb32` built successfully with the pinned Ghostty submodule and Zig 0.16.0.
The focused `returning_viewers_keep_the_last_active_viewers_size` regression passed with one test and no failures.
Grand Fleet Lab then received that build through Core's atomic `update --from` command.
The update targeted only `/tmp/op-core-recovery-source/target/debug/herdr-core` in the isolated session.
A backup of the previous binary remains at `/tmp/op-core-before-merged-backup`.

The running Core changed from process 87194 to 90655 and reports version 0.1.21.
The installed binary and merged build have identical SHA-256 hashes: `ba1e95793d976e1314eb3c1592a4d24ddf7caf0ca6eaee5239dd980fd20245d0`.
The existing Core identity and all 33 local live terminals survived the update.
All 47 listed local and remote terminals returned identical `get` metadata before and after the update.
That comparison includes process identifiers, creation timestamps, dimensions, and terminal screens.
The remote firstmate and personal terminal retained their original processes and their current 36-column by 27-row dimensions.
No terminal input was sent.

The native capture shows both remote panes readable after the update.
Local evidence is saved in `.superpowers/native/merged-core-before.json`, `.superpowers/native/merged-core-after.json`, and `.superpowers/native/merged-core-window.jpg`.
This verifies the merged build's installation and preservation of existing sessions.
It does not replace a fresh native transport interruption check or verification of an officially released build containing the patch.

## Merged-source remote reconnection

Two isolated transport interruptions exercised the merged Core build against the physical remote test server.
The first check asserted dimensions immediately after the machine reported connected and observed 200 columns instead of 36.
A later read found the original dimensions restored without terminal input.
The second check recorded the transition rather than treating connection readiness as completed viewer reattachment.
Both remote terminals measured 200 by 120 at 2.72 seconds and recovered to 36 by 27 at 3.81 seconds.
Every remaining recorded sample retained the baseline dimensions through 13.47 seconds.
All samples preserved process identifiers, creation timestamps, and live state.
The timeline is saved locally as `.superpowers/native/merged-core-reconnect-timeline.json`.

The native capture after recovery showed readable firstmate and personal terminal panes.
This confirms settled recovery, not absence of transient resizing during reattachment.
The source reattaches viewers sequentially from oldest to newest activity, so machine connection readiness precedes completion of that sequence.
A follow-up attempt to focus the personal terminal failed with computer-control error `windowNotFoundAtPosition`.
No typing followed that error, and UI actions stopped.
Independent input after recovery remains unverified for this merged-source attempt.
The control error alone does not establish user interference or an application defect.

## Merged-source input reaches the shell but the existing view stays stale

After native window control resumed, Grand Fleet Lab focused the personal terminal `op-hz-lab/t1k`.
Native paste and typing reached Bash, but neither appeared in the application capture.
A read-only `hc read` confirmed both unsubmitted commands, so the duplicate was cleared with native Control-U.
After confirming the replacement command through `hc read`, native Return executed `printf 'MERGED-CORE-INPUT-OK\n'; stty size`.
The remote output contains the marker and `27 36`, followed by the shell prompt.
The personal shell retained process 1040875 and creation timestamp 1794596816772.
The firstmate retained process 17778 and its unchanged manual Bash approval.

The native view continued showing the earlier empty prompt.
Scrolling down did not expose the new output.
Clicking the personal pane's Focus button produced no visible layout change, and its dimensions remained 36 columns by 27 rows.
A fresh read-only protocol observer received 1,264 terminal bytes including the missing marker immediately after attaching.
The capture, Core read, and fresh observer were sampled at different times.
They do not establish what the application received when the capture was taken.
The physical display was not independently confirmed at the missing-output moment, so the cause remains unknown.
A one-second process sample found the application's connection reader reading frames and its main thread processing events.
No product code was changed, and no user interference was established.

Evidence is saved locally as `.superpowers/native/merged-core-stale-output.jpg`, `.superpowers/native/merged-core-stale-output.json`, and `.superpowers/native/merged-core-fresh-observer.json`.
The process sample is `/tmp/grand-fleet-stale-output.sample.txt`.
Input delivery passed this attempt, but the application capture did not show the output.
This does not establish a failure on the physical display.
The earlier candidate pass does not establish working recovery for this merged-source application session.

## Fresh prompt recovery on the merged build

Native window enlargement exposed the previously requested focus and sidebar changes, along with a transient `interrupted` render-error banner.
The application's `status` command still reported an empty errors array.
The banner subsequently cleared without a restart, and the personal pane's Grid button visibly restored both panes.
Earlier prompt corruption also appeared in a direct remote `hc read`, so that corruption was not confined to the native capture.
These observations do not establish a common cause for the stale view, render interruption, and corrupted history.

Native Control-L redrew the personal shell's prompt before another transport recovery check.
The baseline command printed `RECOVERY-BASELINE` and `48 79` correctly.
Only the verified SSH child of the isolated Core process was terminated.
The first measured size was 200 columns by 120 rows at 1.26 seconds.
Dimensions returned to 79 columns by 48 rows at 2.53 seconds and remained there through 10.12 seconds.
Both the personal shell and firstmate retained their process identifiers, creation timestamps, and live state.

Native typing and Return then printed `RECOVERY-FRESH-INPUT` and `48 79` visibly in the personal pane.
Firstmate's manual approval remained pending, with no input sent to that pane.
This establishes one successful native recovery from a fresh prompt on the merged build.
It does not explain the earlier failures or prove that clearing the screen is a required workaround.
No product code changed.

Evidence is saved locally in `.superpowers/native/fresh-prompt-reconnect.json` and `fresh-prompt-{before,after}-reconnect.jpg`.
The official Core manifest still advertised version 0.1.21, generation 1, during this check.

## Controlled default and mod reconnection comparison

The user watched the reserved screen while the isolated release application exercised default and One Piece layouts.
The default counter ran from 22:52:16 through 22:53:15 UTC on 2026-11-13.
Its isolated remote connection was interrupted at 22:52:31 UTC, and captured output advanced through `060` and `DEFAULT DONE`.

The mod reconnection counter ran from 22:55:08 through 22:56:07 UTC.
Its isolated remote connection was interrupted at 22:55:15 UTC.
Captured output advanced through `060` and `FLEET-RECONNECT DONE` after resizing and pane enlargement.
The shell retained process 3333565 and creation timestamp 1794610094987.
A later native scrollback check showed continuous lines `001` through `048`, including output around the interruption.

The user initially reported clearing in the mod, then confirmed it occurred only before `001` appeared.
Both mod counter commands explicitly began with `clear`, while the default counter did not.
That difference explains the initial clearing and invalidates it as evidence of a mod reconnection defect.
No reconnection display defect was reproduced in this controlled trial.
This short passing trial does not resolve the historical intermittent capture discrepancies.
No product code changed.

Local evidence is stored under `.superpowers/native/controlled-comparison/`, including `physical-observation.json` and `fleet-final-output.json`.

## Machine shortcut follow-up after the controlled comparison

The isolated release application displayed the remote `Render comparison` terminal throughout this check.
Selecting `op-remote-lab` revealed that machine's heading and workers.
Selecting Water 7 returned to the local heading and first coordinator.
Manual scrolling then hid the local heading while leaving the lower local section visible.
Selecting Water 7 again returned directly to the local heading.
The terminal selection and its visible counter output remained unchanged throughout these actions.
No terminal input was sent.

This rejects the hypothesis that a partially visible machine section prevents returning to its hidden heading in the tested state.
A follow-up resize produced a 2004 × 1404 pixel capture, approximately 1002 × 702 logical points.
The first `op-hz-lab` shortcut click then revealed its heading and first coordinator.
The application status reported no errors.
Restoring the terminal grid and enlarging the window retained both terminal panes and readable output.
These checks did not reproduce the historical first-click miss at compact size.
The installed Herdr guidance documents `scroll_to_item` as revealing a direct child with the smallest necessary movement.
The mod supplies one direct child per machine and uses that child's index.
No navigation code change is justified by these passing samples.

### Source check of machine scrolling

The local Herdr source checkout identifies commit `9950887361af3ba218b9ce7a347cb8ec7b66c71d` as tag `v0.1.15`.
Its `vendor/gpui-kit/crates/shell/src/scroll.rs` and `entities.rs` have no local changes.
The scrollbar wrapper consumes each pending child index once during rendering.
It measures the requested direct child before painting and schedules any offset change for the next frame.
Its `reveal_delta` function aligns oversized children to the viewport's start, including partially visible machine sections.
This supports the observed return to the local heading and rejects partial visibility as an explanation for the historical miss.

If child bounds are unavailable, the callback returns after consuming the request.
That is a possible failure path in the source, not an observed cause of the historical miss.
No evidence currently shows that this path ran in the installed application.
Further diagnosis needs a failing click correlated with request consumption, child bounds, and the scheduled offset change.
Repeated passing clicks cannot provide that evidence, and no retry workaround was added.

## Task record refresh after closing a sidebar

The remote worker `fm-remote-native-flow` displayed `Task records unavailable` while all three cached sources were more than three hours old.
Invoking the installed reader directly on the remote machine returned the worker's completed task successfully.
The installed mod matched the repository before the investigation.

Herdr retains module state across layout closure.
Its installed mod guide documents cancellation of unfinished tasks when their view closes.
The v0.1.15 scheduler source states that cancelled promises remain unsettled.
Consequently, the reader's `finally` block cannot release its module-level pending entry after cancellation.
Reopened sidebars then skip that source indefinitely.

A temporary 15-second delay before executing the reader made layout closure during a pending read reproducible in Grand Fleet Lab.
The original implementation retained pending entries after cycling through layouts and returning to One Piece.
The corrected implementation releases entries owned by the closing sidebar.
An identity check prevents a late completion from removing a replacement entry.
The cancellation flag also prevents that completion from publishing stale results.
Closing another sidebar leaves the active reader unchanged.

Repeating the same native layout sequence refreshed all three sources without errors.
Temporary diagnostics were then removed from the installed mod.
The installed production file and repository file had matching hashes.
Selecting `op-hz-lab` visibly showed `Task complete` for `fm-remote-native-flow` with that production file installed.
The two personal terminal panes remained visible with their existing output.
No terminal input was sent during this check.

Two regression tests failed before the fix and passed afterward.
They cover a promise that never settles and a late response arriving after a replacement read starts.
The existing test still covers shared reads between live sidebar copies.
Local diagnostic evidence remains in `.superpowers/native/record-lifecycle-before.json` and `record-lifecycle-after.json`.
This fix addresses stale task records, not the historical text-capture discrepancy or machine shortcut miss.

## Isolated source-build fallback and rollback

A private delivery folder now preserves the tested merged-source binary, its source commit, checksums, license notices, and the preceding test binary.
Neither binary is presented as an official release.
Both report version 0.1.21, so checksums identify the actual builds.
The candidate checksum still matches the binary installed in Grand Fleet Lab.

A separate disposable Core session used its own executable, socket, state directory, and configuration directory.
One Python terminal acknowledged input before updating, after updating to the merged build, and after restoring the preceding test binary.
Core's `update --from` command performed both replacements without `--force`.
The terminal retained identical metadata across all three observations, including process 38744 and creation timestamp 1794626252326.
Its final screen retained all three acknowledgement lines.
The executable checksum changed to the candidate and returned to the backup checksum.
The disposable terminal was then ended and its Core server stopped successfully.
Grand Fleet Lab and daily Herdr were not restarted or updated during this check.

This establishes rollback between those two test binaries for one local terminal.
It does not verify remote rollback, arbitrary saved-state compatibility, or downgrade to an official release.
The upstream update command warns that saved state only moves forward when describing forced downgrades.
The local evidence is `.superpowers/native/core-fallback-validation.json`.
The source-build fallback does not resolve the historical capture discrepancy, machine shortcut miss, or official-release acceptance gate.

## Traced machine navigation after compact resizing

A temporary handler trace recorded machine identity, child index, and time for each machine shortcut click.
The initial remote selection succeeded in the large Grand Fleet Lab window.
After resizing to 1000 × 700 logical points, the first Water 7 click revealed the local heading.
The first subsequent op-hz-lab click revealed the remote heading.
All three clicks reached the handler with the expected child indices.
The local machine identity was null with index zero, consistent with the local entry.
Both personal terminal panes remained visible throughout these selections.
No terminal input was sent.

The trace is preserved privately in `.superpowers/native/navigation-click-trace.json`.
Temporary tracing was removed, and the installed mod matched the repository file by SHA256.
After reload, the sidebar returned to Water 7 while both terminal panes retained visible output.
These observations establish successful delivery and navigation for these samples only.
They do not reproduce or explain the historical missed click.
No navigation workaround was added.

## Approved simplification, 2026-11-14

The author approved replacing Restore layout with Add terminal and implementing the reviewed scoped controls.
This section supersedes earlier missing-shell recovery requirements.
Herdr owns reconnection, and the mod no longer stores missing-shell recovery metadata.
Migration removes only that metadata, without creating or ending terminals.
The retired restore-layout command displays a migration notice without creating a process.

Workspace, tab, pane, machine, and fleet actions now appear in their relevant menus.
The tab strip appears only for multiple tabs.
Machine headings remain visible above separate scrolling session lists.
The attention control filters the original rows and includes blocked personal sessions in coordinator workspaces.
Crew appearance selects one of four approved crews and preserves worker assignments when switching back.

Validation used the isolated Grand Fleet Lab installation at `/private/tmp/op-app-31618`.
Its old files were backed up before updating the lab copy.
The normal Herdr installation and Grand Fleet Render Lab were not updated.
The lab installer receipt was already inconsistent, so this validation used a controlled file copy rather than changing that receipt.

Native clicks verified Crew appearance changed the remote coordinator to Red Force and Shanks with Benn Beckman and Yasopp.
Add terminal created `op-hz-lab/t1q` in `op-hz-lab/op-hz-captain`.
Existing coordinator `op-hz-lab/t1g` and personal terminal `op-hz-lab/t14` remained present.
The existing personal terminal retained its displayed `native-remote-preset-ok` output.
Focus enlarged the new pane, and Grid returned to the three-pane arrangement.
Selecting hz-worker opened its separate inspection workspace without Add terminal.
Selecting hz-captain returned to the preserved three-pane arrangement.
The attention filter changed the sidebar without changing the active workspace.
Native status reported no errors during these checks.

The JavaScript suite passed 116 tests, including stale pane ownership and crew assignment preservation.
The Python suite passed 39 tests, including installation checks and reproducible artwork exports.
The native loading check passed with `herdr-app check mods/one-piece`.
The code review findings were addressed with regression tests.
This validation did not repeat the historical reconnection or flicker investigation.

## Sidebar correction in progress on 2026-11-15

The previous completion assessment did not cover the full visible sidebar requirement.
Captain links controlled artwork eligibility, leaving other live agents as ordinary terminal or workspace rows.
The corrected renderer gives live Herdr agents character artwork independently of captain setup.
Unknown coordinator relationships remain explicitly unassigned instead of being inferred from process ancestry or names.
Character rows expose their native workspace and suppress its duplicate workspace entry.
Ordinary shells retain native presentation.

The regression failed on the missing unregistered character before the renderer changed.
The command comparison now passes with all captain links removed, including local and remote agents, native focus, and ordinary shells.
All nine JavaScript tests and 42 Python tests passed.
The installed candidate passed Herdr's initial-render check in `/private/tmp/op-app-31618`.
An initial check against repository sources failed because the generated base module exists only in the installed mod.
The corrected command checks the installed directory.

Grand Fleet Lab's accessibility tree and screenshot showed the previously omitted characters.
A subsequent label adjustment puts workspace names on their own line.
Clicking Sanji for terminal `t35` focused its existing `thin-mod-check` workspace.
The app status reported `t35` and no runtime errors after that click.
This is partial evidence, not completion of the approved workflow.
The complete nested ship workflow, final visual comparison, and updated input checks remain outstanding.

The follow-up review found two additional cases in the unassigned section.
Removing a captain link reassigned surviving workers to different characters.
Stock worker labels without a recognized program or status did not receive artwork.
The regression reproduced the identity change before the correction.
The renderer now preserves existing character assignments while unassigned and recognizes valid stock worker labels independently of native recognition.
The command comparison covers both cases and a workspace containing a crewmate and a personal terminal.
All nine JavaScript tests, the expanded command comparison, and the installed native loading check passed after these corrections.
The Python suite was not repeated because these corrections only changed JavaScript rendering and its comparison checks.

Five disposable Python terminals were created for the pending visual checks.
They are simulated UI fixtures, not evidence of stock Firstmate delegation.
The native app renders, but the current accessibility tree exposes only window controls.
The app accepted a native `terminal.peek` command for fixture `t4d`, but accessibility inspection still did not expose its controls.
Direct typing and full hierarchy interaction remain unverified in this session.


### Resumed visible verification

Native controls became reachable again in Grand Fleet Lab.
The accessibility tree exposes sidebar controls but omits the visible setup and terminal preview dialogs.
Screenshot inspection confirmed those dialogs and allowed direct interaction.

The local captain fixture `t4c` was linked through the visible dialog to the `sidebar-check` worker group.
The sidebar displayed Luffy followed by Chopper (`t4d`) and Franky (`t4f`) beneath Thousand Sunny.
Clicking Chopper opened the native terminal preview.
Typing `FLEET_LOCAL_DIRECT_INPUT` produced the visible response `ACK FLEET_LOCAL_DIRECT_INPUT` from process 78282.
The native Keep control placed that terminal in the current `thin-mod-check` workspace.
Collapsing Sunny hid its character rows without changing the active terminal, workspace, tab, or focused pane.
Native status reported no errors.

The remote captain fixture `op-hz-lab/t2k` was linked through the visible dialog to its machine's `sidebar-check` group.
The sidebar displayed Luffy and Chopper beneath a separate Thousand Sunny.
The remote group contained only `op-hz-lab/t2m`, despite the identical local group label.
Clicking the remote Chopper opened its native terminal preview with process 1988401.
Typing `FLEET_REMOTE_DIRECT_INPUT` produced the visible response `ACK FLEET_REMOTE_DIRECT_INPUT`.
These checks prove direct local and remote input through the corrected sidebar using simulated fixtures.
The remote ship appearance was changed through its context menu to Red Hair Pirates.
The sidebar changed to Red Force, Shanks, and Benn Beckman.
Selecting Shanks opened the remote captain fixture with process 1988054.

The native plus menu opened a regular zsh terminal in the current `thin-mod-check` workspace.
Its new tab was `tb384bb52af3d105c47cf8d462cb033f95`.
Direct input printed `FLEET_PERSONAL_SHELL` and the inherited folder `<checkout>-native`, a separate worktree of this repository.
The personal terminal retained Herdr's ordinary shell header without character artwork.
Selecting the crewmate's native tab returned to terminal `t4d`, its original tab, and its original focused pane.
Native status reported no errors after both transitions.
The shell printed existing mise trust warnings, which did not prevent command execution.
No trust settings were changed.

The repository's imported prototype is older than the approved native-flow prototype.
The approved reference is `~/Workspace/.lavish/grand-fleet-native-prototype/index.html`.
It keeps machine headings visible and scrolls crewmates beneath ships and captains.
The earlier comparison against the imported prototype did not establish fidelity to that reference.

### Machine visibility and offline recovery

A fresh native check interrupted only the disposable `op-hz-lab` SSH transport.
During the interruption, Wano displayed `Unavailable` and removed its live character rows.
Local terminal `t4d` retained its visible output, and the other remote machine remained available.
After transport recovery, both remote machine aliases reported connected and the remote crew returned.
This supersedes the earlier inconclusive offline screenshot.

The sidebar now gives each machine a fixed heading and independently scrolling contents.
Native screenshots confirmed Water 7 and both Wano headings remained visible while the local section scrolled.
The active terminal, tab, workspace, and focused pane retained their identifiers.
The approved prototype also keeps ships and captains above scrolling crewmates.
At the time of this check, the machine body scrolled those rows together.
The crew scrolling verification below supersedes that gap.

After the machine-heading change, all nine JavaScript tests and native command comparisons passed.
Herdr's installed-mod rendering check passed for `/private/tmp/op-app-31618/mods/one-piece`.
Native status reported no errors and still selected terminal `t4d`.
The complete visual workflow is not yet verified.


### Crew scrolling verification

The candidate now places each crew in a separate scrolling area below its ship and captain.
A native wheel scroll changed the visible local crewmate from Chopper to Franky.
Sunny and Luffy stayed at the same positions, and all three machine headings remained visible.
The active terminal retained its output and original workspace, tab, and pane identifiers.
Herdr reported no runtime errors.
The layout keeps an outer machine scroll for fleets whose ships exceed the available height.
This preserves access to multiple ships without shrinking character rows.
The regression check first failed against the shared scrolling layout and passed after the change.
All nine JavaScript tests and the installed-mod rendering check also passed.

A further native check exercised direct input after crew scrolling.
The local worker list was scrolled from Chopper to Franky while Sunny, Luffy, and all machine headings stayed fixed.
Selecting Franky opened the native preview for terminal `t4f`, process 78357.
Typing `FLEET_SCROLLED_CREW_INPUT` visibly produced `ACK FLEET_SCROLLED_CREW_INPUT`.
Closing the preview returned to terminal `t4d`.
Its space `spe38ea04a6e6dd1cb2705ec1df009236c`, tab `tb7dbaf894cd59581f77b38e9f02ca3ede`, and pane `p032841298671917225c6f66a4fac194b` were unchanged.
Native status reported no overlays and no errors.
`hc get` confirmed that `t4f` remained live with process 78357.
These terminals were simulated interface fixtures, not a new stock Firstmate lifecycle test.

Later review rounds changed how crew characters are assigned and released.
The complete visible workflow has not been verified again since those changes.
Final visible verification against the approved native-flow prototype remains pending.


## Native Spaces and Agents verification, 2026-11-15

This section supersedes the nested machine and crew scrolling checks above for the current presentation contract.
The author requested native Spaces and Agents, each with one scrolling list.
The checks used Grand Fleet Lab with isolated home `/private/tmp/op-app-31618`.
The user's daily configuration was not changed.

### Local navigation and input

Sunny selection opened space `spe38ea04a6e6dd1cb2705ec1df009236c` and the existing captain terminal `t4c`.
Typing `NATIVE_REGIONS_CAPTAIN_CHECK` produced `ACK NATIVE_REGIONS_CAPTAIN_CHECK` without removing earlier output.
Selecting the crewmember row opened terminal `t4d` in tab `tb7dbaf894cd59581f77b38e9f02ca3ede`.
The focused pane remained `p032841298671917225c6f66a4fac194b`.
Typing `NATIVE_REGIONS_CREWMEMBER_CHECK` produced its matching acknowledgement and preserved prior output.
Spaces scrolling left the Agents region fixed.
These checks used disposable interface fixtures, not a new Firstmate delegation lifecycle.
The earlier native personal-terminal creation check remains applicable because terminal controls and folder inheritance are unchanged.

### Remote ship selection and input

The remote captain fixture `op-hz-lab/t2k` was initially unplaced, so native Agents did not give it a workspace row.
Herdr rejected keeping its preview in a local workspace because a terminal must remain on its own machine.
Keeping it in existing remote space `op-hz-lab/sp4620b5663daf783c98a0015c5791cace` succeeded.
Red Force and Shanks appeared in their respective sidebar regions.
Clicking Red Force selected that remote space and tab `op-hz-lab/tb3ecdda2c03ce3e1548e5aeddc1ce3dd0`.
The selected pane was `op-hz-lab/p225719cd166a240067696010c5ea5d14`.
Typing `NATIVE_REGIONS_REMOTE_CHECK` produced `ACK NATIVE_REGIONS_REMOTE_CHECK`.
The fixture retained process 1988054 and its earlier output.
Native status reported no runtime errors.

### Compact presentation and review

An 83-pixel sidebar displayed ship artwork, native space attention indicators, and crewmember artwork within the native status cells.
The Crew button remained visible without clipping.
Independent review found three defects before this verification: oversized compact crewmembers, missing compact ship attention, and an unchecked native menu dependency.
The adapter now uses 14-pixel artwork below Herdr's compact threshold and native ship status glyphs and colors.
Compatibility validation now requires the Spaces menu method and status exports.
Regression checks failed before the corresponding fixes and passed afterward.
Follow-up review found no further concrete defect.

The native loading check and all 43 Python tests passed after the fixes.
All 12 JavaScript tests passed with `npm test`.
A later review found that the collapsed rail showed done crewmembers with the same sleeping artwork as idle ones, hiding Herdr's done dot.
The adapter now keeps the artwork and overlays a 6-pixel dot in the native done color at the sprite's top-right corner in compact rows.
The executed comparison now includes a done agent and failed on the earlier adapter before passing with this change.
`herdr-app check` passed on the reinstalled mod in /private/tmp/op-app-31618.
The executed native-module comparison covers two widths, priority and grouped sorting, ship selection, agent focus and previews, pinning, and appearance settings.
It also verifies that retired inspection panes cannot create a third agent list or open a recycled terminal identity.
Simulation does not establish every keyboard interaction, published Core recovery, or pixel fidelity across all displays.

## Crew batch one verification, 2026-11-16

Grand Fleet Lab displayed Heart, Whitebeard, Roger, and Kid in an isolated app home at `/private/tmp/op-crew-batch-20261116/app`.
The check used Herdr app 0.1.16 and a separate local Herdr Core 0.1.21 instance.
Four disposable spaces each contained a manually designated captain and three fixtures reporting idle, working, and blocked status.
All four ships and their captain artwork rendered without clipping.
The character strips displayed sleeping, walking, and sitting artwork beside the existing native workspace and terminal interface.
The native Agents region retained its attention and working groups.

The crew picker displayed all eight choices and its animation controls.
Seven Tab presses reached Kid Pirates from the first choice.
Return selected Kid and updated the captain and all three worker portraits.
Selecting Heart again restored Law, Bepo, Shachi, and Penguin.
Keyboard navigation reached Pause animation, and saved state recorded `paused: true`.
Reopening the picker showed Resume animation, which restored motion.
The final native status reported no overlays and no runtime errors.
Screenshots remain outside the repository under the isolated lab directory.

All 25 JavaScript tests and all 46 Python tests passed.
The artwork checks cover every source sheet, export dimensions, frame timing, transparency, static companions, and reproducible generation.
The expanded allocation test exhausts every named roster before assigning generic pirates and checks surviving assignments after crew changes.
`herdr-app check` passed for the generated native mod in this isolated app home.
`node tools/check-parity.mjs` passed against the same installed Herdr modules, including all eight crew selections and their rendered assets.

This batch did not repeat live Firstmate discovery, terminal adoption, app-restart preservation, or remote recovery acceptance.
Manual captain designations and disposable status fixtures establish presentation behavior only.
The native loading check exercises initial rendering, while the command comparison simulates native behavior.
The earlier recovery evidence and its recorded limits remain unchanged.
