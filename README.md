# Herdr One Piece

Grand Fleet presents Herdr agents as crewmembers in the native Agents region.
Explicitly identify an agent running Firstmate as a captain through Crew appearance.
Its space displays the selected ship in the native Spaces region.
Clicking the ship selects that workspace, while clicking a crewmember uses native terminal navigation.
Spaces and Agents each retain one scrolling list and native machine identities.
Personal terminals remain ordinary Herdr terminals.

The mod works with unmodified Firstmate and requires no upstream patch or additional hooks.
Captain choices use terminal addresses and creation timestamps without changing session metadata.
Crewmembers require no captain association or Firstmate worker labels.

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

The installer reads the installed Spaces and Agents modules and `layouts/main.json` from the destination app home, Herdr's configuration directory.
It validates both module interfaces and requires one Spaces slot and one Agents slot under the same parent.
It copies their source unchanged to `mods/one-piece/herdr-spaces.js` and `mods/one-piece/herdr-agents.js`.
The generated layout retains both slots and selects the appropriate One Piece presentation through their region properties.
It supplies teal and gold palette defaults while preserving explicit source color overrides.
Other native controls remain in the generated layout.
Generated files belong to the destination installation, not the source checkout.

Run installation again after Herdr updates to refresh both native modules and the layout.
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

GitHub Actions runs the JavaScript, Python, and artwork tests on macOS for pull requests and pushes to main.
Native Herdr interaction checks still run locally because hosted runners do not have the application installed.
Installer tests use temporary homes.
Compatibility tests check source preservation and layout changes.
These checks do not establish behavior inside a running Herdr window.
Run `npm test` for generic crewmember, captain identity, and artwork checks.
Run `node tools/check-parity.mjs <app-home>` for simulated native command comparisons.
The [current verification record](docs/NATIVE-INTEGRATION.md#native-spaces-and-agents-verification-2026-11-15) distinguishes live checks from simulations and historical results.

## Historical prototype

Open `prototype/index.html` in a browser to inspect the historical simulation.
It contains simulated replies and terminals without connecting to machines or executing commands.
Its historical behaviors are superseded by the [thin presentation design](docs/THIN-MOD.md).
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
