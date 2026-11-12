# Herdr One Piece

Grand Fleet is an optional One Piece interface specifically for firstmate in Herdr.
Support for other session managers is outside this repository's scope.
Its vision extends [firstmate's governing vision](https://github.com/kunchenguid/firstmate/blob/main/VISION.md).
It keeps coordinators, workers, and personal terminals clear across machines.
It also supports ordinary Herdr sessions in an explicitly unsupervised mode.
This repository currently contains the approved vision, prototype, custom artwork, and design specification.
It does not contain an installable native Herdr mod yet.

## Start here

- [VISION.md](VISION.md) defines the approved acceptance policy.
- [Prototype specification](docs/PROTOTYPE-SPEC.md) records accepted choices, proposed operating rules, and native integration checks.
- [Prototype inventory](docs/PROTOTYPE.md) maps every retained design stage and explains what differs from the accepted decisions.
- [Artwork inventory](docs/ARTWORK.md) records current coverage, source prompts, and historical reference assets.

## Development

Read [AGENTS.md](AGENTS.md) before changing the project.
Start with the [native integration plan](docs/superpowers/plans/2026-11-12-native-integration.md).
It tests the session guarantees that the browser prototype cannot establish.

## Open the current prototype

Open `prototype/index.html` in a browser.
It is a portable preview with embedded artwork, simulated replies, and simulated terminals.
It does not connect to machines or execute commands.

Rebuild the preview from its editable sources:

```sh
python3 prototype/flow/build.py
```

Edit `prototype/flow/app.js` and `prototype/flow/screen.html`, then rebuild.
Do not edit the generated `prototype/index.html` directly.
The exported preview preserves the reviewed design, including behavior that the later specification replaces.

## Verify the browser preview

The browser checks require `chrome-devtools-axi` on PATH.
Open the rebuilt HTML with that tool before running the check script:

```sh
chrome-devtools-axi open "file://$(pwd)/prototype/index.html"
python3 prototype/flow/check-browser.py
```

These checks exercise the simulation, not Herdr's native behavior.
Worker placement into separate spaces and grid preservation require native verification before implementation can promise them.

## Repository boundary

Review boards and author verdict transcripts stay outside this repository.
The author approved the vision on 2026-11-12.
The project does not claim ownership of One Piece characters or grant rights to historical third-party reference artwork.
