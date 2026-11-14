# Herdr One Piece

Grand Fleet presents firstmate coordinators as ships and captains, with their workers nested as crewmates.
Machines appear as islands while retaining their actual names.
Herdr supplies writable terminals, workspaces, tabs, splits, panels, and session management.
Ships only fold their characters, and selecting a character uses native terminal focus or writable preview.
Personal terminals remain ordinary Herdr terminals.

The mod works with unmodified Firstmate and requires no upstream patch or additional hooks.
Choose a coordinator terminal through Link captain on its machine.
Associate its existing worker group using Firstmate's `firstmate.home` and `firstmate.task` labels.
The mod stores this choice without changing Firstmate or terminal metadata.
It does not infer relationships from names, folders, or process parenting.

This project remains experimental.
Unmodified Firstmate completed local and physical remote tasks, direct input, navigation, reconnection, and normal cleanup in the isolated lab.
The [acceptance review](docs/ACCEPTANCE.md) records test coverage and remaining release limitations.
Use a separate test home before considering your daily configuration.

## Start here

- [Thin presentation design](docs/THIN-MOD.md) describes the current implementation contract.
- [Installation](docs/INSTALL.md) explains generation, refresh, legacy cleanup, and removal.
- [VISION.md](VISION.md) records the approved acceptance policy and its relationship to firstmate.
- [Artwork inventory](docs/ARTWORK.md) records artwork sources and coverage.
- [Native verification](docs/NATIVE-INTEGRATION.md) records current checks and clearly separated historical observations.
- [Acceptance review](docs/ACCEPTANCE.md) lists current acceptance gaps and historical evidence.

## Installation model

The installer reads `mods/agents/main.js` and `layouts/main.json` from the destination app home, Herdr's configuration directory.
It validates the installed Agents interface and requires one Spaces slot and one Agents slot under the same parent.
It generates `mods/one-piece/herdr-agents.js` from the installed source without changing its contents.
It replaces the Spaces slot with the fleet sidebar and removes the sibling Agents slot to avoid duplicate navigation.
It supplies teal and gold palette defaults while preserving explicit source color overrides.
Other native controls remain in the generated layout.
Both generated files belong to the destination installation, not the source checkout.

Run installation again after Herdr updates to refresh the generated Agents module and layout.
Unsupported source or layout structures fail before installation writes.
New installations never read or change `keys.json`.
Upgrading a version 2 installation removes its owned shortcuts while preserving unrelated bindings.
The [installation guide](docs/INSTALL.md) explains checks that block unsafe cleanup or replacement.

## Development and verification

Read [AGENTS.md](AGENTS.md) and [the thin presentation design](docs/THIN-MOD.md) before changing the project.
Run installer and compatibility tests from the repository:

```sh
python3 -B -m unittest discover -s tests -p test_install.py -v
python3 -B -m unittest discover -s tests -p test_compat.py -v
```

Installer tests use temporary homes.
Compatibility tests check source preservation and layout changes.
These checks do not establish behavior inside a running Herdr window.
Run `npm test` for fleet membership and artwork checks.
Run `node tools/check-parity.mjs <app-home>` for simulated native command comparisons.
The [current verification record](docs/NATIVE-INTEGRATION.md#current-verification-2026-11-14) distinguishes live checks from simulations and historical results.

## Historical prototype

Open `prototype/index.html` in a browser to inspect the historical simulation.
It contains simulated replies and terminals without connecting to machines or executing commands.
Its historical behaviors are superseded by the approved native-flow prototype linked in the thin presentation design.
[Prototype inventory](docs/PROTOTYPE.md) and [prototype specification](docs/PROTOTYPE-SPEC.md) preserve earlier design context.

Rebuild the preview from its editable sources:

```sh
python3 prototype/flow/build.py
```

Edit `prototype/flow/app.js` and `prototype/flow/screen.html`, then rebuild.
Do not edit the generated `prototype/index.html` directly.
Browser simulation checks cannot verify native terminal behavior.

## Repository boundary

Review boards and author verdict transcripts stay outside this repository.
The project does not claim ownership of One Piece characters or grant rights to historical third-party reference artwork.
