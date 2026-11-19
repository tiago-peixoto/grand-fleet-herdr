# Artwork inventory

The selected direction is the custom One Piece pixel artwork used by the current preview.

## Current preview sources

| Asset | File | Coverage |
| --- | --- | --- |
| Thousand Sunny | `prototype/custom-trial/assets/sunny.png` | Four ship frames |
| Luffy | `prototype/custom-trial/assets/luffy.png` | Four idle and four working frames from the initial trial |
| Worker states | `prototype/flow/assets/worker-states-v1.png` | Three designs, three states each, four frames per state |
| Straw Hat flag | `prototype/flow/assets/straw-hat-flag.png` | Four flag frames |
| Machine islands | `prototype/flow/assets/machine-islands-v1.png` | Eight 32 × 32 islands, clear above fog, shown beside each machine name |

The worker atlas contains Chopper, Franky, and a generic Pirate.
Its rows contain Chopper sleeping, walking, and sitting, followed by the same states for Franky and Pirate.
That gives 36 worker frames and three distinct worker designs with all requested states.
The latest preview uses a single idle treatment for Luffy rather than the full worker state system.
Luffy does not have the complete sleep, walk, and sit coverage.
Completion, unavailable, unknown, and ended states need text and static fallback poses under the proposed specification.

Named artwork does not cap the number of workers.
The accepted overflow policy assigns numbered generic Pirates after the available named characters.
Stable assignment and visible worker labels must distinguish repeated artwork.
There is no complete Straw Hat crew or alternate ship catalog in the selected custom set.

## Source prompts and references

`prototype/custom-trial/prompts.json` records the initial ship and character prompts.
`prototype/flow/art-prompts.json` records the refined Franky, flag, and machine island prompts.
`prototype/flow/worker-states-prompt.json` records the worker atlas prompt and reference files.
The initial Chopper, Franky, and Pirate sheets remain in the trial assets as style evidence.
The refined `franky-v2.png` remains an atlas reference, not the current worker animation source.

The browser loader detects occupied row bands in the worker atlas before extracting frames.
That compensates for the generated sheet's imperfect alignment rather than establishing a production grid format.
Native export needs consistent cells, anchors, and inspection at actual sidebar sizes.
Animation quality, pixel alignment, and every native asset-loading path remain to be checked in Herdr.

## Historical references

Game sprite sheets, cropped characters, and ship illustrations were explored before custom artwork was selected.
Those reference files and the two pages that compared them were removed from the repository on 2026-11-18.
They were not part of the installed mod, and the repository asserted no license for them.
One Piece character rights remain with their respective owners.
The author approved publishing this repository on 2026-11-16.
Only `mods/one-piece/assets/` supplies the installed artwork.
