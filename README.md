# Herdr One Piece

Herdr One Piece adds One Piece artwork to Herdr's native Agents interface through a small adapter, a module that customizes presentation.
The adapter presents parent agents as ships and captains, with nested agents as crewmates.
Herdr retains Spaces, agent relationships, sorting, pinning, attention, menus, and keyboard navigation.
Worker, secondmate, and personal terminals use Herdr's native controls and accept direct input.
The adapter does not create separate worker spaces, adopt terminals, or interpret firstmate task records.
It adds no shortcut bindings.

This project remains experimental.
Current native interaction and visual verification are incomplete.
Use a separate test home before considering your daily configuration.

## Start here

- [Thin presentation design](docs/THIN-MOD.md) describes the current implementation contract.
- [Installation](docs/INSTALL.md) explains generation, refresh, legacy cleanup, and removal.
- [VISION.md](VISION.md) records the approved acceptance policy and its relationship to firstmate.
- [Artwork inventory](docs/ARTWORK.md) records artwork sources and coverage.
- [Native verification](docs/NATIVE-INTEGRATION.md) records historical observations and unresolved checks.
- [Acceptance review](docs/ACCEPTANCE.md) records historical evidence, not completed verification of the thin adapter.

## Installation model

The installer reads `mods/agents/main.js` and `layouts/main.json` from the destination app home, Herdr's configuration directory.
It validates the installed Agents interface and requires exactly one Agents slot in the main layout.
It generates `mods/one-piece/herdr-agents.js` from that source without changing its contents.
It generates `layouts/one-piece.json` by replacing only the Agents slot's `content.mod` value with `one-piece`.
Other layout values remain unchanged, although formatting changes.
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
The [candidate verification record](docs/THIN-MOD.md#candidate-verification-on-2026-11-14) covers native typing, terminal creation, artwork controls, sidebar sizes, and app reconnection.
The remote test processes survived a transport interruption, but offline presentation and direct typing after transport recovery remain unverified.
Historical passing tests do not establish those guarantees for the current adapter.

## Historical prototype

Open `prototype/index.html` in a browser to inspect the historical simulation.
It contains simulated replies and terminals without connecting to machines or executing commands.
Its custom fleet navigation does not describe the current thin adapter.
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
