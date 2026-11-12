# Prototype specification snapshot

This document records the prototype design and technical acceptance checks.
VISION.md is the sole local alignment document and extends firstmate's governing vision.
This prototype snapshot does not authorize exceptions to firstmate's command or reporting rules.
Status: the prototype predates the vision review and retains historical interaction proposals.
The current vision restricts supervised worker and secondmate views to inspection and adds explicit offline and unsupervised states.
The remaining operating rules are proposed, and native integration checks remain open.
Reviewed 2026-11-12 against the current prototype and installed Herdr documentation.
The visual direction is accepted, but the browser prototype is not a working Herdr mod.

## Intent

Make firstmate easy to reach while the user works independently in terminal panes across local and remote machines.
Keep every coordinator's personal terminals together and every worker in a separate workspace.
Use custom One Piece artwork to communicate identity and activity without replacing terminal functionality.

## Accepted requirements

- Show all configured, non-temporary machines in the left sidebar.
- Show an island display name and the real machine name without decorative island icons.
- Group coordinators under the machine where their sessions actually run.
- Clicking Sunny only expands or collapses its characters and never changes the selected session.
- Pin Luffy first beneath Sunny as the selectable coordinator session.
This means fixed presentation order in this mod, not changing Herdr’s shared terminal pin state.
- Selecting Luffy opens the coordinator workspace with one agent session by default.
- Add personal shell terminals inside that coordinator workspace.
- Personal terminals run independently and never send their input to the coordinator.
- Each worker opens a separate workspace with a clear return action to its coordinator.
- Idle workers sleep, working workers walk, and workers needing the user sit.
- Preserve the approved dark teal and gold visuals and custom artwork.
- Start with Sunny and the existing artwork, then add other ships and crews later.

## Accepted experience decisions

All three choices were received through Lavish without additional notes.

### D1 - Agent session surface

Accepted: embed the real Herdr terminal inside the themed frame.
Luffy opens the actual firstmate program with its existing input, output, permission prompts, attachments, and keyboard behavior.
The prototype's message bubbles, Send button, scripted replies, and invented approval button are visual demonstrations only.

### D2 - Personal terminal visibility

Accepted: offer Focus, Restore grid, and an explicitly destructive Close terminal action in v1.
Switching workspaces or focusing a pane never ends a terminal.
Before closing through the mod, identify the terminal and explain that its process will end.
Remove the ambiguous cross-shaped Hide control from the prototype.
Herdr's terminal.park removes a pane but also disables keep, so it is not an equivalent implementation of our demo's durable Hide.

### D3 - Worker artwork overflow

Accepted: assign Chopper and Franky first, then numbered generic Pirate workers when those characters are occupied.
Persist assignments by worker identity and do not reshuffle surviving workers when another worker exits.
Always show the actual worker name or task beside the character.
There are three worker designs with complete sleep, walk, and sit sequences, not a complete Straw Hat crew.
The number of workers is not capped by artwork if repeated generic art is accepted.

## Proposed behavior and acceptance criteria

### G1 - Roles, identity, and discovery

Herdr exposes terminals and parent relationships, not a documented firstmate or secondmate role.
Store explicit coordinator registrations with machine-qualified terminal identity and role.
Select one fleet-wide firstmate explicitly, independent of its machine.
Do not infer roles from terminal titles, Luffy artwork, or folder names.
Map workers to registered coordinators through verified parent relationships or an explicit assignment.
A registered secondmate stays a coordinator even if firstmate launched it.
Resolve worker descendants to their nearest registered coordinator.
Unresolved relationships appear under Unassigned on the actual machine and never receive a guessed owner.
Keep ordinary, unassigned workspaces accessible through an Other workspaces section.
Provide Add coordinator and Assign existing session actions through a scoped setup interface.
Creating a coordinator must name its role, machine, folder, and installed agent program.
Choosing a program must not launch a second copy of an existing session accidentally.
Acceptance: identical terminal IDs on two machines remain distinct, and renaming a terminal preserves its role and artwork.
Acceptance: registering a child as secondmate does not also list it as a firstmate worker.

### G2 - Worker workspace lifecycle

A workspace means a Herdr space, which owns tabs and panes on one machine.
A coordinator space starts with one tab containing its agent terminal.
Each worker requires a separate space on the worker's actual machine.
Herdr normally places a spawned worker in its parent's tab without a pane.
The integration must create or adopt a worker space without spawning another copy of the worker or losing its parent relationship.
Prefer creating the worker with its destination space labels already attached.
Adopting existing workers requires a verified, idempotent operation, meaning retries cannot create duplicate spaces.
Do not silently replace the separate workspace requirement with a peek overlay or another coordinator pane.
A worker running on another machine appears beneath that machine, with its coordinator relationship visible in text.
A coordinator may link to that worker from its crew strip with the worker's machine shown.
Acceptance: selecting a worker changes to its own space, while the coordinator's terminals and geometry remain intact.
Acceptance: simultaneous discovery and repeated refresh create only one workspace per worker.
Integration gate: prove launch-time placement and existing-session adoption before considering the mod buildable.

### G3 - Native agent behavior

Embed native agent terminals consistently for coordinators and workers.
Do not manufacture task descriptions or permission choices from the blocked status alone.
A blocked worker opens its actual prompt for the user to answer there.
Copy, paste, scrollback, search, multiline input, attachments, and keyboard shortcuts retain native behavior as accepted in D1.
Acceptance: a permission request is answered once in the correct worker terminal, and no input reaches another machine or session.

### G4 - Personal terminals and grids

A new personal terminal inherits its coordinator's machine and defaults to that coordinator terminal's current folder.
Display machine and folder before creation, and allow an explicit folder override.
Never silently substitute the local machine when a remote operation fails.
A personal shell remains a personal terminal if the user launches an agent inside it, unless explicitly registered as a coordinator or worker.
Use native split panes for resizing, rearrangement, focus, maximize, and restore.
Offer the approved chat-plus-terminals and equal-grid arrangements without recreating running sessions.
Integration gate: prove preset switching, explicit pane targeting, and geometry persistence with native pane composition.
The documented commands do not by themselves establish arbitrary conversion between those preset arrangements.
Preserve layouts per workspace and preserve session input and output through workspace changes.
Only coordinator workspaces expose Add personal terminal in the v1 mod interface.
That last restriction is a proposed scope default, not a user requirement or a restriction on Herdr's native commands.
Acceptance: one coordinator with two personal terminals switches to another coordinator and back without losing geometry or processes.
Acceptance: a focused remote personal terminal cannot cause Add personal terminal to target the wrong workspace.

### G5 - Machine availability

Keep configured machine headings visible when their layout is loading or unavailable.
Herdr exposes loading, ready, and unavailable layout states, not a definitive network diagnosis.
Use those labels rather than claiming every unavailable machine is offline.
Keep previously known sessions visible with a stale-data label while unavailable.
Disable creation and other structural operations until the target machine is ready.
Never queue terminal input for automatic delivery after reconnect.
Show the target machine on errors and use Herdr's machine setup for connection management.
An empty ready machine offers Add coordinator and access to its other workspaces.
Acceptance: losing Wano does not hide Water 7, create local duplicates, or present stale workers as currently working.

### G6 - Status and attention

Map working to walking, idle to sleeping, and blocked to sitting with Needs you text.
Herdr also reports done, meaning work finished while unseen.
Show done as a static pose with a New result label until Herdr clears that attention state.
Do not map done to ordinary idle or clear it merely by expanding Sunny.
Unknown status or unavailable data uses a static sprite with explicit text, never a guessed sleep state.
Exited sessions show Session ended when that event is known, rather than pretending the worker completed successfully.
Aggregate blocked and unseen-result counts on the ship and machine headings.
Opening a count navigates to an affected session through a separate button, not the ship's collapse control.
Opening a coordinator does not acknowledge a worker's unseen result.
Match keyboard agent navigation to the visible fleet order.
Acceptance: a worker needing input remains discoverable with its ship collapsed, motion paused, or artwork missing.

### G7 - Persistence and recovery

Herdr owns spaces, tabs, panes, process lifecycle, and native terminal history.
The mod persists display aliases, explicit role assignments, worker artwork assignments, and its own navigation preferences.
Use stable machine-qualified identifiers, not display names, as keys.
Do not edit Herdr's generated files or maintain a competing copy of its workspace model.
Window closure does not imply session termination.
A core restart may restore a shell at the previous address rather than rerun the original agent command.
Reconcile session identity and program state before restoring a coordinator role to a live-looking Luffy session.
Preserve the saved role for recovery, but show Agent unavailable until the intended program is verified or explicitly restarted.
Acceptance: restarting the window preserves aliases and assignments without launching duplicate agents.
Acceptance: a shell restored after a core loss does not appear as a healthy coordinator.

### G8 - Ended workers and removals

Do not automatically delete workspaces containing terminal history or unrelated panes when a worker ends.
An ended worker becomes a static Session ended entry with access to whatever history Herdr retains.
An agent may exit into a still-running shell, so terminal liveness alone does not establish agent liveness.
Show Agent inactive when the agent program exits, even if its shell remains open.
Verify how agent exit is detected before promising that status transition.
Do not promise history restoration beyond Herdr's actual retention behavior.
Offer explicit removal from fleet navigation separately from ending a process or closing a workspace.
Unregistering a coordinator does not terminate its workers or personal terminals.
Acceptance: removing a fleet registration leaves any surviving Herdr workspace accessible under Other workspaces.
An ended entry is historical navigation, not proof that its previous space or terminal still exists.

### G9 - Art and accessibility

Available art includes Sunny, Luffy, and three worker designs: Chopper, Franky, and Pirate.
Each worker design has twelve frames, four each for sleep, walk, and sit, totaling thirty-six worker frames.
Luffy does not yet have the same complete three-state treatment.
For v1, Luffy uses existing art with a textual status label, unless that art is expanded before implementation.
Use a static pose and text for done, unknown, unavailable, and ended states.
Do not add new ship choices with missing artwork.
Package artwork locally and avoid runtime asset downloads for basic navigation.
Normalize frame dimensions and anchor points before native export, then inspect actual target sizes for jitter and legibility.
Support motion pause, reduced motion, visible keyboard focus, accessible labels, and text independent of color or animation.
Fallback to session initials and status text when artwork cannot load.
Acceptance: every session remains selectable without artwork and without motion.

### G10 - Scale, installation, and compatibility

Use scrollable lists with stable order and full names available when truncated.
Test a large desktop with two machines, three coordinators, twenty workers, and four personal terminals in one workspace.
This is a test scenario, not a product capacity limit.
Long names and duplicate character art must not hide machine identity or session actions.
Deliver a separate custom layout and mod, preserving the user's existing layouts and key bindings.
Use Herdr's native UI elements because HTML, CSS, and browser canvas cannot run inside a mod.
Use native animations and native terminal blocks, with native pane composition where grid behavior is required.
Provide a reversible switch back to the previous layout without ending sessions.
Acceptance: herdr-app check passes and the installed mod is visually inspected in the running app.
A passing static mod check does not validate deferred UI, machine reconnection, or later status changes.

## Scope boundaries

V1 includes one art family, multiple coordinators, multiple configured machines, worker navigation, and personal terminal grids.
V1 excludes a ship catalog, an agent scheduler, a new machine connection manager, and a promise of cross-machine process migration.
V1 excludes a custom chat protocol, following the accepted native terminal decision.
Desktop is the primary target.
Responsive browser preview behavior does not establish mobile Herdr support.

## Evidence and remaining gates

The browser prototype has forty-nine previously passing interaction checks, but no native Herdr integration has been tested.
This audit inspected its source rather than repeating those unchanged checks.
D1, D2, and D3 are accepted through Lavish.
Those responses do not approve every other proposed operating rule.
Worker placement, existing-session adoption, and native grid presets remain unverified despite the three accepted experience decisions.
The installed machine inventory and actual firstmate launch conventions were not inspected.
The compatibility baseline must be recorded from the installed application version during implementation.

Sources:

- Installed guide: ~/.config/herdr-app/AGENTS.md, especially the model and command sections.
- Installed API declarations: ~/.config/herdr-app/herdr.d.ts, especially run, machines, terminals, and focused.
- Public guide: https://herdr.dev/guide/
- Public model and mod documentation: https://github.com/herdrdev/herdr-app/blob/master/defaults/AGENTS.md
- Reference mod: https://github.com/mathieucroset/herdr-pokemon-agents/blob/main/mods/pokemon-agents/main.js
- Prototype: prototype/flow/app.js
