# A quieter Grand Fleet

The mod should provide one navigation tree and one terminal workspace.
The daily actions are choosing a session, adding a personal terminal, and enlarging a pane.
Setup and layout management should appear only in their relevant context.
Remove the mod-specific recovery workflow rather than giving it another location.
This is a proposed design, not an installed change or an approved revision of VISION.md.

## Evidence from the actual setup

Read-only `herdr api snapshot` calls on 2026-11-14 found 13 local workspaces, 13 tabs, and 16 panes.
The active local firstmate workspace has four panes in one tab.
Its saved layout is a roughly equal two-by-two grid.
The latest 20 saved snapshots also contain that four-pane firstmate layout.
These snapshots establish repeated layout state, not interaction frequency.
A read-only snapshot of `hz-server` found 27 workspaces, 29 tabs, and 29 panes.
The remote workspace `2ndmate-opensourcerer-hz` has three tabs.
The other 26 remote workspaces have one tab each.
The actual setup therefore supports conditional tab presentation, not removal of tabs.
The current conversation identifier occurs in a pane of the saved local firstmate workspace.
No terminal transcript was needed for this analysis.
Computer Use denied Ghostty access, so this audit does not claim direct observation of the screen or clicking habits.
No custom keybindings appeared in the inspected Herdr configuration.
That does not prove which default shortcuts the captain uses.

## Recommendation

Keep machine headings visible and give each machine its own scrolling session list.
For the current two-machine setup, share the available sidebar height between the lists.
Large crew counts must not push the other machine heading out of reach.
At constrained heights, prioritize headings and the selected machine list without hiding other machine identities.
Use the existing custom artwork and dark teal palette.
Ships only expand and collapse characters.
Luffy remains the first character beneath Sunny.
Worker and secondmate selections retain separate inspection workspaces and cannot accept commands.
The firstmate row returns to the same grid with running personal sessions preserved.

Replace the duplicate attention list with a conditional filter of the original navigation rows.
Keep firstmate visible during filtering so returning to command remains easy.
Show blocked counts on collapsed ships and machines.
Activating the filter temporarily reveals matching descendants without overwriting the captain's normal collapse state.
Unknown records remain unknown and offline machines remain offline.
An independent agent needing attention retains its Independent label.
If no sessions need attention, remove the filter and restore the normal list.

Keep Add terminal in the workspace header.
Keep Focus or Grid in each pane header as the single visible zoom action.
Move Close terminal into that personal pane's menu.
Put arrangement and New tab in the workspace menu.
When multiple tabs exist, show a tab strip with tab-specific menus.
When one tab exists, hide the strip and place that tab's rename and close actions under Current tab in the workspace menu.
These homes are mutually exclusive, not duplicated entries.

Use equal grid as the recommended preset for new arrangements, reflecting the current four-pane setup.
Preserve existing geometry when opening the mod or switching sessions.
Do not automatically change grids just because workers, tabs, or machines change.
Keep Chat + terminals available as the alternative preset.
Do not add personal terminal creation to worker inspection.
The existing secondmate workspace may retain independent personal terminals without enabling input to the secondmate.

Move setup to the relevant machine menu and global motion preference to the fleet menu.
Remove the missing-shell dialog, recreation buttons, saved-shell tracking, and recovery command from the proposed mod.
Herdr owns reconnection, while Add terminal remains the single place to create a new personal shell.
Do not equate an offline machine with an ended terminal.
Do not claim that a new terminal restores a previous directory, process, command, or conversation.
Whether Herdr offers directory preservation for this operation remains unverified.
The approved vision currently requires Restore layout.
Adoption must explicitly replace that requirement, not silently reinterpret it.
Retire the recovery command with a migration notice rather than mapping it to process creation.
Keep the pirate flag at the top-left and honor the same global motion preference as other artwork.

## Alternatives considered

Keeping every button while reducing its visual size does not remove competing action locations.
Removing tabs entirely conflicts with the live remote three-tab workspace.
A command-only interface would hide discoverable access to adding terminals, inspecting workers, and changing motion.
The recommendation keeps direct navigation and frequent controls visible while giving occasional actions a scoped menu.

## Complete control audit

The audit covers every button family, clickable row, input, and dispatched command in `mods/one-piece/main.js`.
Repeated per-worker, per-machine, and per-tab instances share a row below.
Herdr's own global menus are outside this mod inventory.

| ID | Current control | Decision | Single home | Reason and safeguards |
| --- | --- | --- | --- | --- |
| N01 | Machine shortcut chips | Remove | Machine sections | They repeat the same machine names and only scroll to existing sections. Keep each machine heading visible above its own scrolling list. |
| N02 | Machine headings and actual identity | Keep | Sidebar | Water 7 · local and Wano · hz-server stay visible. No decorative island icon. Offline headings stay visible. |
| N03 | Machine ··· | Keep | Machine heading | The only entry for island alias, coordinator linking, and record-source settings on this machine. |
| N04 | Sunny expand/collapse | Keep | Ship row | Only disclosure. Show coordinator identity and blocked count while collapsed. Never select a session. |
| N05 | Luffy coordinator row | Keep | First character beneath ship | The single visible destination for opening firstmate. Preserve its grid and focus its existing session. |
| N06 | Worker and secondmate rows | Keep | Their machine and ship | Open their own read-only inspection workspaces. Show actual task name and textual state beside the sprite. |
| N07 | Unsupervised workspace and unplaced terminal rows | Keep | Unsupervised group on machine | Ordinary sessions remain directly usable. Do not silently convert independent agents to workers. |
| N08 | Duplicate attention cards | Replace | Filter on the sidebar list | One conditional Needs attention filter shows matching original rows, ancestors, and firstmate. No second list of session links. |
| N09 | No reported blockers footer | Remove | No separate control | Absence of a badge is quiet. Unknown or unavailable records must still be identified on affected rows. |
| N10 | Back to firstmate button | Remove | Luffy in sidebar | Keep the firstmate destination within reach while inspecting. Preserve the firstmate keyboard command as an alternate input method. |
| N11 | Choose firstmate dialog and Cancel | Conditional | Firstmate keyboard command only | Only when several valid firstmates exist and ownership cannot resolve the target. Never guess or hide offline ownership. |
| W01 | + Your terminal | Keep | Workspace header | The only visible add-shell action. Creates an independent shell in this coordinator workspace. Never available inside worker inspection. |
| W02 | Header Focus pane / Restore grid | Remove | Pane Focus / Grid | It duplicates each pane action and makes the target less clear. |
| W03 | Pane Focus / Grid | Keep | Each pane header | One control per target. Keep visible on keyboard focus, not hover-only. Zoom must retain the other sessions. |
| W04 | Arrange | Move | Workspace ··· > Arrangement | Secondary layout choice. Keep one grid by default, preserve custom layouts, and do not rearrange on navigation. |
| W05 | Chat + terminals / Equal grid / Cancel | Keep | Arrangement dialog | Equal grid is the proposed default for newly arranged workspaces. Existing layouts retain their geometry. Both presets retain all sessions. |
| W06 | Always-visible Restore layout | Remove | No separate recovery action | Herdr owns reconnection. For a terminal that ended, use + Your terminal. Do not create a second shell-creation workflow. |
| W07 | Tab selection buttons | Conditional | Tab strip | Hide the entire strip for one tab. Show existing tabs when there are two or more, including the remote three-tab workspace. |
| W08 | + New tab | Move | Workspace ··· > New tab | Preserve the capability for existing multi-tab use. Do not compete with adding a terminal in the daily grid. |
| W09 | Rename button per tab | Move | Tab menu | When only one tab exists, its menu lives in Workspace ··· > Current tab. No extra strip for renaming. |
| W10 | Close button per tab | Move | Tab menu | Close the named tab, with explicit process consequences. Current-tab commands stay under the workspace menu when the strip is hidden. |
| W11 | Rename input / Save / Cancel | Keep | Rename dialog | Name the selected tab. Validate its current identity and machine before saving. |
| W12 | Pane Close | Move | Personal pane ··· > Close terminal | Destructive action leaves the daily row. Keep unavailable for supervised workers and coordinator panes. |
| W13 | Close confirmation / Cancel | Keep | Close dialog | List exact targets and machines. Say End processes and close versus Close view accurately. Preserve obligations and parked inspection processes. |
| S01 | Set up fleet footer | Remove | Machine ··· | Duplicate entry without clear machine context. Initial empty machine shows explanatory text pointing to its heading menu. |
| S02 | Pause / Play motion footer | Move | Fleet ··· > Animate artwork | One global motion preference. Static frames retain state labels. Do not hide an accessibility preference entirely. |
| S03 | Island alias input / Save island name | Keep | Machine settings | Do not bundle alias changes into linking a coordinator. Show actual identity beside the alias. |
| S04 | Firstmate / Secondmate role choices | Keep | Machine settings > Link coordinator | Explicit authority choice, never inferred from names. Explain secondmate inspection-only behavior before linking. |
| S05 | Existing terminal choices | Keep | Link coordinator form | Select a live terminal on this machine. Preserve eligibility checks and safe parking before secondmate inspection. |
| S06 | firstmate.home input | Keep | Link coordinator form > Work identity | Explain that the value associates workers with their coordinator. Suggest observed labels without claiming a match automatically. |
| S07 | Link firstmate / Link secondmate / Cancel | Keep | Link coordinator form | A deliberate action with identity checks. Does not launch an agent or delegate work. |
| S08 | Task records · home | Move | Machine settings > Records > Work identity | One machine-scoped records entry includes observed worker identities without linked coordinators. Show linking status; do not require linking first. |
| S09 | Executable root / Operational home fields | Keep | Records form | Machine-specific paths. Read-only task records must remain separate from terminal activity guesses. |
| S10 | Records Connect / Cancel | Keep | Records form | Preserve path validation and visible errors. Missing records must not imply a worker is idle. |
| R01 | Create new shell / Retry new shell | Remove | + Your terminal | Remove dedicated recreation and retry actions. Do not promise the previous directory or conversation is restored. |
| R02 | Restore dialog Done | Remove | No recovery dialog | Delete the recovery dialog rather than renaming it. Preserve clear unavailable and ended states. |
| R03 | Retry cleanup / Cleaning temporary shells | Move | Conditional notice under the affected machine | Temporary shell cleanup may fail before its workspace exists. Keep retry and exact temporary-shell identity on that machine, separate from ended personal terminals. |
| R04 | Offline / Connecting / disconnected coordinator | Keep | Affected machine or row | Do not display cached workers as live or enable unavailable actions. Read-only failure text remains visible. |
| R05 | Inspection selection and copy | Keep | Inspection content | No input or takeover. Retain stale/error information and the existing 2,000-line limit disclosure. |
| K01 | Focus sidebar / setup / inspect-focused commands | Keep | Existing command bindings | Keyboard access invokes the same action. Setup resolves an explicit machine. Do not invent unverified default shortcuts. |
| K02 | Firstmate / focus-pane / restore-layout commands | Keep | Existing firstmate and focus commands | Keep navigation and zoom. Retire restore-layout with an explicit migration notice; never silently map it to process creation. |
| K03 | Close-tab / close-pane commands | Keep | Existing guarded command bindings | Keep confirmations and scope checks. Keyboard access must not bypass ownership or end processes silently. |

## Safe adoption and verification

Do not migrate, merge, close, or recreate existing workspaces to simplify their presentation.
Retain coordinator registrations, aliases, tab identifiers, terminal identities, and running sessions.
Retiring saved-shell bookkeeping must not terminate or recreate any session.
Keep explicit machine ownership and process consequences in every destructive confirmation.
Do not relabel a directory or a familiar agent name as a trusted coordinator automatically.

Verify the local four-pane grid returns unchanged after firstmate, worker, secondmate, and machine navigation.
Verify all three remote tabs remain reachable and keep their original processes.
Verify every existing audited action has exactly its stated visible home in each applicable state.
Verify the firstmate row and both machine headings remain reachable with long crews and a compact window.
Verify the attention filter handles collapsed crews, independent agents, disappearing blockers, unavailable records, and offline machines.
Verify menus and focus controls are accessible with keyboard navigation, not hover alone.
Verify closing a terminal names its process and machine and never targets a supervised inspection process.
Verify disconnected machines show no stale live crew or enabled recovery controls.
Verify no separate missing-shell control, dialog, or background recreation remains.
Verify Add terminal remains available for independent work without promising process recovery.
Verify motion-off artwork preserves all textual status information.

The review board simulates navigation and layout changes with sample text.
It does not connect to running terminals or prove native behavior.
The native mod remains unchanged until the design is accepted.

## Review feedback and outstanding work

The reviewer requested the pirate flag and challenged the separate missing-shell recovery workflow.
The revised proposal restores the flag and removes recovery as a distinct mod feature.
The native mod and approved vision are unchanged while the revised design is reviewed.

The reviewer also requested complete crews and ships for Luffy, Shanks, Big Mom, and Kaido.
Complete membership needs an explicit boundary for the larger organizations.
The artwork expansion remains unfinished and must not be described as complete.
The existing custom library contains Luffy, Chopper, Franky, generic Pirates, Sunny, and the flag.
Luffy has idle and working artwork, but no dedicated needs-attention animation.
Named crew expansion must preserve actual session names and stable worker assignments.
Crew selection belongs to coordinator appearance settings, not a second navigation or command system.
Do not show a crew selector while only one crew is available.
Add that selector when a second crew has usable artwork, with explicit coverage for its named workers.
Only active workers appear in the daily sidebar; an available character catalog is not a list of running sessions.

## Prototype verification

Ninety browser checks pass for the current interactive preview.
They cover navigation, tab creation and closure, local and remote personal terminals, renaming, offline visibility, and compact-window scrolling.
They also verify all eleven artwork sheets load with the expected frame grid and obey Pause artwork.
The sheets still need visual animation approval before production use.

The long-crew preview originally scrolled Luffy out of view with the workers.
The revised preview keeps the ship and coordinator above a separate scrolling worker list.
Selecting a session preserves the worker list position.
A screenshot confirms both machine headings and Luffy remain visible with the local workers scrolled to the bottom.

Selecting Luffy reveals the firstmate chat tab.
If a personal terminal was enlarged, selecting Luffy reveals firstmate instead of leaving that personal terminal in front.
The personal terminal remains open.
The ordinary four-pane arrangement remains intact when returning from worker inspection.

New tabs contain personal terminals inside their coordinator workspace.
Tab actions appear in the tab strip only when multiple tabs exist.
With one tab, those actions move to the workspace menu.
Remote personal terminals can sit beside secondmate inspection without providing direct input to secondmate.
Closing an inspection view preserves its supervised process, matching the native closure code.
Selecting secondmate reopens its inspection view when necessary.
Closing firstmate's actual terminal ends its simulated session.
Creating another personal terminal does not imply that firstmate has restarted.

Tab renaming updates only the selected local or remote tab.
Personal terminal closure names its machine and terminal, supports cancellation, and retains the identities of remaining terminals.
New personal terminals receive new identities instead of reusing a closed terminal's identity.
The selected session has a visible highlight.
Machine settings open directly from the machine heading.
Island renaming preserves the actual machine identity.

The preview uses the existing project colors and artwork.
Luffy, Zoro, Nami, Usopp, Sanji, Chopper, Robin, Franky, Brook, and Jinbe now have separate four-frame studies for sleeping, walking, and sitting.
These studies are not production-approved additions to the native library.

These results concern the browser prototype only.
Coordinator linking now has a form trial under machine settings.
It requires an explicit role, an eligible session, and a work identity.
Changing roles clears the session selection.
The trial rejects blank and duplicate work identities and excludes supervised workers from firstmate selection.
It does not validate actual sessions, remove writable views, or alter the preview fleet.
Crew appearance remains unfinished.
The task-record form simulates separate machine and work identities, including workers without a linked coordinator.
It rejects relative paths, preserves each identity’s settings, and disables connection while its machine is offline.
Saving preview settings does not claim a real connection succeeded.
Artwork expansion remains unfinished.
The native mod and approved vision remain unchanged.


## Review corrections

Worker inspection retains Rename and Close, while excluding personal terminal creation.
Arrangement is available only when a coordinator shares a tab with personal terminals.
Temporary inspection cleanup failures appear under the affected machine because its workspace might not exist yet.
Task records remain accessible through machine settings without requiring a linked coordinator.
The browser checks cover these corrections, unknown records, quiet fleets, and independent session navigation.

The compact cleanup scenario exposed a notice that hid Luffy beneath the ship.
A one-line machine notice now opens cleanup details with the exact temporary shell and a single retry action.
The browser check verifies Luffy remains visible while cleanup is pending.

Luffy’s new study includes a dedicated sitting state without replacing his installed artwork.
All ten Straw Hats now have matching studies integrated into the browser preview.
The long-crew scenario assigns nine distinct named workers before using generic Pirates for additional workers.
The checks verify sleeping for idle, walking for working, and sitting for needs-attention states.
Unknown task states show no character pose.
Animation pause survives navigation and replacement of character elements.
Animation quality still needs visual review before native integration.

## Keyboard verification and remaining gates

Browser keyboard input opens Workspace actions with Enter and reaches Arrangement with Tab.
The focused action has a visible outline.
Enter opens the arrangement dialog with focus on Equal grid.
Escape closes that dialog and returns focus to Arrangement.
These checks cover the browser prototype, not native keyboard handling.

The native control scan covers button construction, clickable rows, input fields, and dispatched commands in `mods/one-piece/main.js`.
The 42 audit families account for these controls without counting repeated worker or tab instances as separate actions.
The review does not establish which controls the captain clicks most frequently.
Saved layouts and live workspace structure support the four-pane and conditional-tab recommendations.

The design proposal is ready for review, but adoption remains unconfirmed.
The larger requested crew collections still need a membership boundary and artwork.
Native integration must preserve terminal identities and verify process consequences against real sessions before claiming completion.

Shanks now has a matching three-state study in the review gallery.
His crew remains unavailable because its worker and ship artwork are missing.
Captain artwork alone does not satisfy crew coverage.
