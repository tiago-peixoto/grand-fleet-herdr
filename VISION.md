# Vision

`herdr-one-piece` exists so that Tiago can coordinate work across machines while working independently beside it.
It serves a user who usually talks to firstmate and keeps one or two personal terminals open.
It owns exactly one thing: the One Piece interface through which that user finds and enters Herdr workspaces.

## The fleet makes ownership visible

Machines remain visible together in the sidebar, with island aliases beside their real identities.
A coordinator appears under the machine where its session runs.
A ship groups its characters and only expands or collapses them.
Luffy stays first beneath Sunny and opens the coordinator session.
Selecting a worker opens that worker's own workspace.
Artwork never substitutes for the session name, machine, or coordinator relationship.
A change preserves this navigation even when several coordinators share the same ship artwork.

## Independent work stays independent

A coordinator workspace begins with one coordinator session.
Personal terminals belong to the coordinator workspace where the user creates them.
Their commands do not become messages to the coordinator or its workers.
Workers have separate workspaces rather than borrowing the user's personal terminals.
A grid lets the user keep the coordinator and personal work visible together.
Changing the selected workspace or enlarging a pane does not terminate a session.
Close explicitly means ending a terminal, rather than hiding it behind an ambiguous cross.
The close action identifies its terminal and explains that its process ends.

## Herdr remains the session system

Coordinator and worker conversations use real agent terminals inside the themed interface.
The interface does not invent replies, permissions, or successful actions.
Herdr remains responsible for terminal execution and workspace structure.
The visual prototype explains the intended experience but does not prove native integration.
Separate worker workspaces and grid changes must preserve the existing running sessions.
A native implementation change that cannot establish those guarantees remains incomplete, however convincing its preview looks.

## Artwork carries meaning without limiting work

Custom One Piece pixel artwork gives the fleet a consistent visual language.
Idle workers sleep, working workers walk, and workers needing the user sit.
Sunny and Luffy establish the first version without pretending that other crews are already complete.
Chopper and Franky fill the available named worker roles, followed by numbered generic Pirates.
Assignments persist by worker identity and do not reshuffle surviving workers when another worker exits.
Each character appears beside the actual worker name or task.
Additional workers do not require additional named character artwork.
More ships and crews are welcome when their artwork and session behavior fit the same interface.

## The prototype preserves intent, not implementation authority

Accepted user decisions take precedence over older prototype behavior.
The prototype retains the visual design and interactions so future changes can be compared with concrete examples.
Its simulated messages, temporary state, and earlier Hide action are not promises to reproduce those mechanisms.
A future implementation proves the workflow against native Herdr behavior instead of treating browser checks as sufficient evidence.

## Scope

This project is a Herdr interface, not an agent scheduler, a replacement terminal system, or a custom chat protocol.
A broader ship catalog is an extension of the interface, not a prerequisite for using the first version.
Historical sprite comparisons document exploration and do not define the selected art direction.
This document is the sole project alignment surface and remains a draft until its author approves it.

A change aligns when it makes the correct session easier to reach while preserving machine identity, workspace ownership, and independent terminal work.
A change should be resisted when themed presentation obscures those boundaries or substitutes a simulated interaction for a real session guarantee.
