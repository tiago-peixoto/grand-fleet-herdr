# Native Integration Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish whether native Herdr supports the approved session boundaries before implementing the fleet interface.

**Architecture:** Keep firstmate responsible for supervision and Herdr responsible for running terminals.
Use disposable sessions to verify navigation, inspection, and workspace layout behavior.
Implement the interface only against capabilities demonstrated by those checks.

**Tech Stack:** Herdr's installed native JavaScript APIs, herdr-app, and herdr-core.

**Spec:** [Approved vision](../../../VISION.md) and [historical prototype specification](../../PROTOTYPE-SPEC.md).
The approved vision overrides conflicting prototype behavior.

## Global Constraints

This implementation targets firstmate in Herdr only.
Supervised worker and secondmate views permit inspection, not direct commands.
Personal terminals remain independently usable.
The mod must not replace existing layouts, terminate real sessions, or modify generated Herdr files.

## Review Focus

- An inspection surface must not forward typing, paste, or shortcuts to a supervised worker.
- Matching terminal identifiers on different machines must not select the wrong session.
- Worker adoption must not create another process or lose the coordinator relationship.
- Layout changes must preserve personal shell processes and workspace ownership.
- Unavailable machines must not display cached worker activity as live state or redirect actions locally.

## Task 1: Establish the installed contract

**Files:** Create docs/NATIVE-INTEGRATION.md as a record of observed capabilities and limitations.

**Interfaces:** Consume the installed Herdr guide, type declarations, command help, and firstmate's actual Herdr integration.
Produce a versioned capability record with exact commands and evidence.

- [ ] Record the installed Herdr version and applicable firstmate revision.
- [ ] Read the documented terminal, machine, space, pane, and input APIs.
- [ ] Identify the actual firstmate role and parent metadata instead of adopting the snapshot's proposed registry automatically.
- [ ] Determine whether native terminal inspection can disable all input paths while preserving scrollback and copy.
- [ ] Record any missing capability as a blocker, not an invented API or a substituted interaction.

## Task 2: Verify session boundaries with disposable processes

**Files:** Add tests/native-session-boundaries only after the supported command contract is known.
Record reproducible commands and results in docs/NATIVE-INTEGRATION.md.

**Interfaces:** Consume the verified commands from Task 1.
Produce behavioral evidence for inspection, placement, grids, and machine isolation.

- [ ] Create a disposable coordinator, worker, and two personal shells with distinguishable process identities.
- [ ] Attempt typing, paste, and keyboard shortcuts through worker inspection and verify the worker receives no input.
- [ ] Place or adopt the worker into its own workspace twice and verify one process, one workspace, and the original relationship.
- [ ] Switch workspaces, focus a pane, and restore the grid while verifying personal shell identities and output remain intact.
- [ ] Exercise machine-qualified selection with matching terminal identifiers and verify the intended target.
- [ ] Simulate unavailable machine data without disconnecting the user's machines and verify the explicit unavailable presentation and disabled remote actions.
- [ ] Recreate a missing disposable personal shell only through explicit restoration and verify it is labeled as a new process.
- [ ] Clean up only test-owned resources and record any failures or unsupported behavior.

## Task 3: Begin the native interface against verified capabilities

**Files:** Create mods/one-piece/main.js, mods/one-piece/mod.json, and a separate layouts/one-piece.json when Tasks 1 and 2 pass.

**Interfaces:** Consume Herdr's verified machine, workspace, and session APIs and the imported custom artwork.
Produce a separately selectable native layout without changing the user's active layout automatically.

- [ ] Implement all-machine navigation, ship collapse, pinned firstmate access, and inspection-only supervised session selection.
- [ ] Retain independent terminal input and explicit Unsupervised labeling.
- [ ] Use local artwork with text labels and native animation primitives.
- [ ] Run herdr-app check on the mod and inspect the rendered layout in a disposable test environment.
- [ ] Compare native navigation and visuals with the approved prototype and document remaining differences before expanding scope.
