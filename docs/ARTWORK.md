# Artwork inventory

The selected direction is the custom One Piece pixel artwork used by the current preview.
Historical game sprites and illustrated ships remain archived for reference, not as the selected production assets.

## Current preview sources

| Asset | File | Coverage |
| --- | --- | --- |
| Thousand Sunny | `prototype/custom-trial/assets/sunny.png` | Four ship frames |
| Luffy | `prototype/custom-trial/assets/luffy.png` | Four idle and four working frames from the initial trial |
| Worker states | `prototype/flow/assets/worker-states-v1.png` | Three designs, three states each, four frames per state |
| Straw Hat flag | `prototype/flow/assets/straw-hat-flag.png` | Four flag frames |

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
`prototype/flow/art-prompts.json` records the refined Franky and flag prompts.
`prototype/flow/worker-states-prompt.json` records the worker atlas prompt and reference files.
The initial Chopper, Franky, and Pirate sheets remain in the trial assets as style evidence.
The refined `franky-v2.png` remains an atlas reference, not the current worker animation source.

The browser loader detects occupied row bands in the worker atlas before extracting frames.
That compensates for the generated sheet's imperfect alignment rather than establishing a production grid format.
Native export needs consistent cells, anchors, and inspection at actual sidebar sizes.
Animation quality, pixel alignment, and every native asset-loading path remain to be checked in Herdr.

## Historical references

`prototype/assets/` includes game sprite sheets, cropped characters, and ship illustrations explored before custom artwork was selected.
`prototype/sprite-options.html` and `prototype/sourced-art-prototype.html` retain their comparison context and source links.
Their historical completeness, availability, and pricing claims were not reverified during repository creation.
No blanket license is asserted for these reference files.
One Piece character rights remain with their respective owners.
The author approved publishing this repository on 2026-11-16.
Only `mods/one-piece/assets/` supplies the installed artwork.
Historical reference files are not part of the installed mod.
