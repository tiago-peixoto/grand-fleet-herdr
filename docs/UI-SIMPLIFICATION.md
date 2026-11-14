# A quieter Grand Fleet

The mod should provide one navigation tree and one terminal workspace.
The daily actions are choosing a session, adding a personal terminal, and enlarging a pane.
Setup and layout management should appear only in their relevant context.
Remove the mod-specific recovery workflow rather than giving it another location.
The author approved this design on 2026-11-14.
VISION.md now records Add terminal as the replacement for Restore layout.
The native implementation is available in Grand Fleet Lab.

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
Show blocked counts on collapsed ships.
Expanded ships and machine headings do not repeat the fleet attention total.
Affected worker rows retain their status labels.
Activating the filter temporarily reveals matching descendants without overwriting the captain's normal collapse state.
Unknown records remain unknown and offline machines remain offline.
An independent agent needing attention retains its Independent label.
If no sessions need attention, remove the filter and restore the normal list.

Keep Add terminal in the workspace header.
Keep Focus or Grid in each pane header as the single visible zoom action.
Move Close terminal into that personal pane's menu.
Put arrangement and New tab in the workspace menu.
Hide New tab when the workspace has no tabs.
In that state, Add terminal already creates the first tab and terminal.
When multiple tabs exist, show a tab strip with tab-specific menus.
When one tab exists, hide the strip and place that tab's rename and close actions in the workspace menu.
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
The approved vision now replaces Restore layout with Add terminal.
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
The table includes 42 existing control families and one proposed crew appearance action.

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
| W01 | Add terminal | Keep | Workspace header | The only visible add-shell action. Creates an independent shell in this coordinator workspace. Never available inside worker inspection. |
| W02 | Header Focus pane / Restore grid | Remove | Pane Focus / Grid | It duplicates each pane action and makes the target less clear. |
| W03 | Pane Focus / Grid | Keep | Each pane header | One control per target. Keep visible on keyboard focus, not hover-only. Zoom must retain the other sessions. |
| W04 | Arrange | Move | Workspace ··· > Arrangement | Secondary layout choice. Keep one grid by default, preserve custom layouts, and do not rearrange on navigation. |
| W05 | Chat + terminals / Equal grid / Cancel | Keep | Arrangement dialog | Equal grid is the proposed default for newly arranged workspaces. Existing layouts retain their geometry. Both presets retain all sessions. |
| W06 | Always-visible Restore layout | Remove | No separate recovery action | Herdr owns reconnection. For a terminal that ended, use Add terminal. Do not create a second shell-creation workflow. |
| W07 | Tab selection buttons | Conditional | Tab strip | Hide the entire strip for one tab. Show existing tabs when there are two or more, including the remote three-tab workspace. |
| W08 | + New tab | Move | Workspace ··· > New tab | Show only when a tab exists. In an empty workspace, Add terminal is the only creation action. Preserve existing multi-tab use. |
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
| R01 | Create new shell / Retry new shell | Remove | Add terminal | Remove dedicated recreation and retry actions. Do not promise the previous directory or conversation is restored. |
| R02 | Restore dialog Done | Remove | No recovery dialog | Delete the recovery dialog rather than renaming it. Preserve clear unavailable and ended states. |
| R03 | Retry cleanup / Cleaning temporary shells | Move | Conditional notice under the affected machine | Temporary shell cleanup may fail before its workspace exists. Keep retry and exact temporary-shell identity on that machine, separate from ended personal terminals. |
| R04 | Offline / Connecting / disconnected coordinator | Keep | Affected machine or row | Do not display cached workers as live or enable unavailable actions. Read-only failure text remains visible. |
| R05 | Inspection selection and copy | Keep | Inspection content | No input or takeover. Retain stale/error information and the existing 2,000-line limit disclosure. |
| K01 | Focus sidebar / setup / inspect-focused commands | Keep | Existing command bindings | Keyboard access invokes the same action. Setup resolves an explicit machine. Do not invent unverified default shortcuts. |
| K02 | Firstmate / focus-pane / restore-layout commands | Keep | Existing firstmate and focus commands | Keep navigation and zoom. Retire restore-layout with an explicit migration notice; never silently map it to process creation. |
| K03 | Close-tab / close-pane commands | Keep | Existing guarded command bindings | Keep confirmations and scope checks. Keyboard access must not bypass ownership or end processes silently. |
| A01 | Crew appearance (proposed) | Keep | Coordinator workspace menu > Crew appearance | Choose one ship and crew per coordinator. Preserve machine, sessions, and layout. Disable crews already used by another coordinator. |

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
Native validation is recorded in docs/NATIVE-INTEGRATION.md.

## Review feedback and current coverage

The reviewer requested the pirate flag and challenged the separate missing-shell recovery workflow.
The proposal restores the flag and removes recovery as a distinct mod feature.
The author approved removal, and both the native mod and VISION.md now reflect that decision.

The reviewer requested ships and named workers for Luffy, Shanks, Big Mom, and Kaido.
The reviewer also requested varied generic pirates after named characters are exhausted.
The preview now offers four crews through one Crew appearance action in the coordinator workspace menu.
A crew assigned to another coordinator is unavailable in that menu.
Changing appearance preserves the simulated machine, workspace, and layout.
Only active workers appear in the daily sidebar.
The artwork gallery is a review aid, not another list of running sessions.

| Crew | Ship in preview | Coordinator | Available named worker artwork |
| --- | --- | --- | --- |
| Straw Hats | Thousand Sunny | Luffy | Chopper, Franky, Zoro, Nami, Usopp, Sanji, Robin, Brook, Jinbe |
| Red Hair Pirates | Red Force | Shanks | Benn Beckman, Yasopp, Lucky Roux |
| Big Mom Pirates | Queen Mama Chanter | Big Mom | Katakuri, Smoothie, Cracker |
| Beasts Pirates | Mammoth, Jack’s ship representing the crew | Kaido | King, Queen, Jack |

Mammoth is not presented as Kaido’s flagship.
The preview contains 30 character sheets with four frames each for sleeping, walking, and sitting.
These comprise four coordinators, eighteen named workers, and eight generic pirates.
Red Force, Queen Mama Chanter, and Mammoth have separate four-frame ship studies.
Sunny retains its existing artwork.
The approved sheets now live in prototype/crew-artwork and export into the native artwork library.

The nine Straw Hat workers have distinct appearances before generic pirates are needed.
The other three crews use generics after their currently illustrated workers, before their full named rosters are available.
That temporary behavior does not yet satisfy the requested complete named coverage.
The larger organizations still need a bounded roster before their collections can be called complete.
Eight generic palettes are available: blue, amber, green, violet, red, cyan, pink, and silver.
Palettes repeat beyond eight generic workers per crew.
The prototype therefore supports additional workers but does not guarantee unlimited unique appearances.

## Prototype verification

The browser suite passed 149 checks on 2026-11-14.
These checks exercise the external review prototype, not running Herdr terminals.
They cover navigation, tab creation and closure, personal terminals, renaming, offline visibility, compact scrolling, artwork dimensions, and motion controls.
They also cover crew selection, named artwork priority, eight generic palettes, and stable worker identities.

The firstmate workspace returns to its four-pane grid after worker inspection.
Selecting firstmate reveals its chat when a personal terminal was enlarged, without closing that terminal.
Both machine headings remain visible with long crews.
Ships and coordinators stay above each machine’s scrolling worker list.
Selecting a session preserves the worker list position.
The crowded remote fixture uses Benn Beckman, Yasopp, and Lucky Roux.
Selecting Yasopp opens the matching remote worker inspection.

New tabs contain personal terminals inside their coordinator workspace.
Tab actions appear in the tab strip only when multiple tabs exist.
With one tab, those actions move to the workspace menu.
Remote personal terminals remain separate from secondmate inspection.
Worker inspection excludes personal terminal creation.
Arrangement is available when a coordinator shares a tab with personal terminals.

Personal terminal closure names the simulated machine and terminal and supports cancellation.
Remaining terminals retain their identifiers.
New terminals receive new identifiers instead of reusing closed ones.
Closing an inspection view does not represent ending its supervised process.
Creating another personal terminal does not represent restarting firstmate.
These simulated consequences require independent verification in Herdr.

Machine settings open from the machine heading.
Island renaming preserves actual machine identity.
The coordinator linking form requires a role, eligible session, and work identity.
Changing roles clears the session selection.
Blank and duplicate work identities are rejected.
The form does not connect real sessions or remove writable views.

Task records remain accessible without linking a coordinator.
Their form separates machine and work identities, rejects relative paths, and disables connection while offline.
Saving preview settings does not establish a real connection.
Temporary cleanup failures appear beneath the affected machine, with details and one retry action.
The compact cleanup scenario keeps firstmate visible.

Unknown task states show no character pose.
Idle workers sleep, working workers walk, and workers needing attention sit.
Pausing animation survives navigation and replacement of artwork elements.
Motion controls cover the gallery and active ship and character studies.
The sheets require visual animation review before production use.

## Stable worker appearances

The original simulation assigned characters and inspection targets by array position.
Removing one worker changed surviving workers’ appearances and targets.
The defect was reproduced through the rendered sidebar before changing the implementation.
A regression check failed before the fix.

Workers now carry explicit identifiers.
Each coordinator and crew retain assignments from those identifiers to appearances.
Removing or reordering workers preserves surviving assignments and inspection destinations.
New workers receive unused named artwork before a least-used generic palette.
Removing the selected worker shows an unavailable state instead of another worker.
Filtering preserves assignments.
These assignments live in browser memory only.
Native restart persistence remains unverified.

## Evidence limits and adoption gates

### Native cases the preview does not establish

Source review found three native behaviors absent from the preview fixtures.
These are existing capabilities to preserve, not new features to add.
The 149 passing browser checks do not verify them.

| Existing behavior | Evidence | Required simplification behavior |
| --- | --- | --- |
| Several coordinators on one machine | `fleet.js` collects every matching registration, and `main.js` renders each coordinator. | Keep each coordinator under its actual machine with separate ship disclosure and workspace navigation. |
| Workers without a linked coordinator | `fleet.js` retains unmatched supervised workers in `unassigned`; `main.js` exposes inspection rows. | Keep those workers visible and inspection-only. Point to the existing machine settings action without adding another setup button. |
| Coordinators can need attention | `attention()` includes firstmates, secondmates, workers, unmatched workers, and independent sessions. | Count all eligible sessions. Filtering must retain affected coordinator rows and the firstmate return destination. |

The preview hardcodes two machines with one coordinator each.
Its attention total counts worker blockers and the sample independent session, but neither coordinator can become blocked.
Its passing tests must not be used to replace the broader native fleet model with those sample assumptions.
Native acceptance must exercise several coordinators together, unmatched workers, and blocked coordinators before claiming parity.
Crew availability must remain an appearance choice and must never prevent an existing coordinator from appearing.

### Remaining verification

Browser keyboard checks opened Workspace actions with Enter and reached Arrangement with Tab.
The focused action had a visible outline.
Escape closed the arrangement dialog and returned focus to Arrangement.
These observations do not establish native keyboard behavior.

Clipping measurements cover the original thirteen character sheets and the later Yasopp, Lucky Roux, Smoothie, Cracker, Queen, and Jack sheets.
At an alpha threshold of 128, their characters do not touch cell boundaries.
The original thirteen sheets had baseline shifts below 0.46 pixels at the 42-pixel sidebar size.
Their horizontal center shifts stayed below 0.81 pixels at that size.
Those measurements do not establish anatomy, character accuracy, or natural motion.
They must not be generalized to all 30 sheets.

The control audit supports one visible home per action in each applicable state.
Live workspace structure supports the four-pane grid and conditional tabs.
Neither saved layouts nor browser checks establish which controls the captain clicks most frequently.

Design adoption remains unconfirmed.
Named artwork coverage remains incomplete for three crews.
Native integration must preserve terminal identities and verify process consequences against real sessions.
The browser suite cannot prove session preservation, remote reconnection, inspection-only access, or native keyboard handling.
VISION.md remains authoritative and includes the approved recovery simplification.
