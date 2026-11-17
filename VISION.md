# Vision

`herdr-one-piece` exists so that one captain can use firstmate's crew with confidence while keeping independent work close at hand.
It serves the individual captain through an optional One Piece interface for supervised fleets and independent Herdr sessions.
It owns the One Piece presentation of Herdr's Spaces and Agents in the fleet sidebar.
The sidebar retains two native regions, Spaces and Agents, while Herdr owns workspace and terminal behavior.

## Firstmate supplies the governing vision

This vision extends [firstmate's vision](https://github.com/kunchenguid/firstmate/blob/main/VISION.md).
Its baseline is [this revision](https://github.com/kunchenguid/firstmate/blob/90cd351ac8b828d7074fe4a432acda246355bec7/VISION.md).
Firstmate's commitments to one captain, explicit authority, durable obligations, supervised delegation, and vendor independence govern this extension.
This document adds presentation commitments and does not replace those rules with a second command policy.
Changes to the upstream vision require an explicit compatibility review.
The extension remains optional, and removing it leaves firstmate's contracts and records intact.

## A calm fleet keeps firstmate within reach

The primary path leads to firstmate, which carries the captain's direction and gathers worker reports.
Herdr supplies terminal attention, focus, writable previews, and session management.
The fleet sidebar retains native machine identities and grouping.
Every Herdr agent is a crewmember, regardless of who started it.
The mod automatically identifies running Firstmate instances as captains from existing session evidence.
Every space containing at least one live agent displays ship artwork and remains an ordinary Herdr workspace.
Captain artwork appears only for a Firstmate instance that the mod detects or that the captain marks by hand in the appearance menu.
A space with agents but no such captain is a generic fleet, and its ship carries no captain artwork.
A generic fleet keeps the space name above the crew strip, and every agent in it is a crewmate, even when it holds one agent.
When a captain appears in a generic fleet, the space becomes that captain's fleet and the existing captain presentation applies.
Selecting a ship selects its space rather than collapsing a crew group.
Captain and crewmember artwork appears in the Agents region and in the Space containing their terminals.
Expanded captain Space rows combine the ship, captain, and miniature managed crew on one background without a letter avatar or visible Space name.
The captain replaces the name above the crew strip.
Automatically detected captains show the other agents in their native Space as crewmates.
This visual summary does not move terminals or change native Space membership.
Spaces and Agents each have one scrolling list, without scrolling inside individual machines or ships.
Ordinary crewmember artwork requires no coordinator association or worker ownership metadata.
Native agent grouping, sorting, pinning, and terminal navigation remain available.
Selecting the captain or a crewmate uses the corresponding native agent action.
An unplaced crewmate opens in Herdr's writable preview with Herdr's option to keep its terminal.
The mod does not create a workspace merely because a crewmate was selected.
Worker and secondmate terminals accept direct typing.
Firstmate remains the usual conversation, while the captain can type directly into any crewmate terminal.

## Independent work stays independent

Spaces and terminals follow Herdr's ordinary creation and arrangement rules.
Personal terminal commands do not become messages or delegated tasks for firstmate or its workers.
Herdr supplies attention counts without the mod inventing supervision or ownership labels.
A grid keeps independent work beside the coordinator without transferring ownership between them.
Changing selection or enlarging a pane preserves running sessions.
Herdr owns terminal reconnection.
Add terminal uses Herdr's native folder inheritance and machine selection.
Herdr supplies the tab bar, terminal input, splitting, resizing, zoom, and closing behavior.
Terminal headers, tabs, and personal terminal controls remain Herdr's shipped interface.
The mod does not track missing personal shells or offer a separate Restore layout workflow.
A new shell is a new process and does not restore a previous command or conversation.
Native Herdr close controls end terminal processes according to Herdr's normal behavior.
Closing a view or session does not claim that firstmate's durable obligations have been completed or discarded.

## Presentation reflects authority and durable truth

Herdr executes terminals and manages workspaces, while firstmate owns delegation, supervision, and the records of work.
The mod neither grants autonomy nor interprets a status indicator as authorization.
It does not invent replies, permissions, completed work, or restored agent conversations.
The mod reads Herdr's live session state and leaves durable task records to firstmate.
Herdr supplies machine availability and reconnection behavior.
The mod does not replace unavailable sessions with a cached fleet or invent live worker activity.
Themed navigation preserves machine identity, workspace ownership, and existing running sessions.
Native integration must verify these guarantees before the implementation promises them.
Appearance settings never change terminal parent relationships, process lifetimes, or workspace ownership.
The mod retains shipped behavior instead of maintaining its own navigation, task polling, recovery, or terminal system.
The mod owns fleet navigation presentation and artwork while reusing native terminal commands and controls.
Compatibility checks must reject unsupported upstream structures before replacing an existing installation.
Herdr-specific capabilities are legitimate, including firstmate's existing Herdr integration.
Vendor independence does not require identical interfaces or a portable display abstraction.

## Artwork conveys state without creating work

Custom One Piece pixel artwork provides one consistent visual language.
Idle workers sleep, working workers walk, and workers needing attention sit.
A sitting worker indicates that its terminal needs the captain's attention.
Each character retains Herdr's actual session label beside it.
Character assignments remain stable for surviving workers as other workers enter or leave.
Sunny and Luffy establish the initial crew, with Chopper, Franky, and numbered generic Pirates supporting workers.
Additional workers never depend on completing a named character catalog, and new crews preserve the same ownership and navigation rules.
Animation supports recognition without concealing failures, decisions, or risks.

## Scope

This project is an optional One Piece presentation of Herdr agents and spaces, with captain artwork for Firstmate instances.
The mod must require no mod-specific Firstmate patches or hooks.
Complete hc fleets may require generic hc compatibility support in Firstmate.
Acceptance evidence must identify the tested Firstmate revision rather than imply compatibility with every unmodified revision.
Captain identification belongs to the mod and requires no manual registration or artwork commands from Firstmate.
The primary defaults to Straw Hats, while secondmates receive unused secondary crews before crews repeat.
Each generic fleet receives the least-used crew, and Straw Hats are eligible when no Firstmate captain is live.
A Firstmate primary still receives Straw Hats when a generic fleet already shows them.
The captain can choose the ship and crew of any fleet, and that choice persists for the space.
User selections remain unchanged by automatic discovery.
Support for other session managers is outside this repository's scope.
It is not a scheduler, a replacement terminal system, or a second firstmate implementation.
Ordinary Herdr workspaces remain accessible without firstmate registration.
Character artwork does not establish a coordinator relationship.
Unregistered terminals do not acquire a coordinator relationship from their names, folders, or process parents.
This mod adds no command hierarchy, merge authority, or automatic delegation policy.
Personal preferences, credentials, and fleet records remain private to the captain's home.
The imported prototype records visual intent, and this vision takes precedence over simulated behavior.
Workers retain their own workspaces, and personal terminals retain native behavior.

A change aligns when it reduces the captain's attention burden while preserving firstmate's authority, durable truth, and independent terminal work.
A change should be resisted when visual convenience hides uncertainty, assumes consent, or makes firstmate depend on this interface.
