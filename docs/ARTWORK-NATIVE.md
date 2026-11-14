# Native artwork exports

These assets mechanically export the approved prototype artwork.
No source artwork or generated prototype page is edited.

## Rebuild and verify

Run from the repository root:

```sh
python3 tools/build-artwork.py
python3 -m unittest discover -s tests -p test_artwork.py -v
git diff --check
```

Python 3.10 or later and ImageMagick 7's `magick` command are required.
The exporter and tests use only Python's standard library and the installed ImageMagick executable.
Pillow and additional dependencies are unnecessary.
Use `python3 tools/build-artwork.py --output /tmp/one-piece-artwork` to export elsewhere.
The default destination is `mods/one-piece/assets/`.
The exporter replaces its named output files and leaves unrelated files intact.
All source frames are validated before output starts.
A conversion failure stops the build, but previously written output files are not rolled back.

## Approved sources

The source selection follows [prototype/flow/build.py](../prototype/flow/build.py).
Frame extraction, scale, placement, and timing follow [prototype/flow/app.js](../prototype/flow/app.js), specifically `ready`, `paint`, and `animationFrame`.

| Output stem | Source | Frames in playback order | Duration per frame, milliseconds |
| --- | --- | --- | --- |
| `sunny` | `prototype/custom-trial/assets/sunny.png` | 0, 1, 2, 3, 2, 1 | 520 each |
| `luffy-idle` | `prototype/custom-trial/assets/luffy.png` | 0, 1, 2, 3 | 1750, 250, 200, 400 |
| `luffy-working` | Same Luffy sheet | 4, 5, 6, 7 | 330 each |
| `flag` | `prototype/flow/assets/straw-hat-flag.png` | 0, 1, 2, 3 | 240 each |
| `chopper-idle`, `franky-idle`, `pirate-idle` | `prototype/flow/assets/worker-states-v1.png` | Four sleeping frames per character | 850 each |
| `chopper-working`, `franky-working`, `pirate-working` | Same worker sheet | Four walking frames per character | 220 each |
| `chopper-blocked`, `franky-blocked`, `pirate-blocked` | Same worker sheet | Four sitting frames per character | 700 each |

Each stem has an animated `.gif` and a static `.png` containing its first playback frame.
Worker rows are ordered Chopper, Franky, Pirate, with idle, working, blocked rows for each character.
Every row has four columns.

## Extraction and placement

Worker rows are detected from the alpha channel, which records pixel opacity.
A qualifying scanline contains at least eight pixels with alpha greater than 160 out of 255.
Qualifying scanlines separated by at most eight pixels belong to one band.
Exactly nine bands must exist.
The current bands, with both endpoints included, are:

```text
41-174, 218-403, 447-609,
653-792, 820-1028, 1051-1245,
1298-1434, 1467-1666, 1694-1867
```

Equal-height worker rows would cut across these bands and can include neighboring poses.
Sunny and flag use one row, while Luffy uses two equal-height rows.
Column boundaries and equal-height row boundaries use JavaScript's positive-number rounding behavior.
Within each cell, the bounding box includes pixels whose alpha exceeds 160.
The crop retains the original pixels inside that box, including partial transparency.

| Artwork | Logical canvas | Maximum artwork width or height |
| --- | --- | --- |
| Sunny | 128 × 128 | 116 |
| Flag | 32 × 32 | 28 |
| Chopper | 64 × 64 | 44 |
| Luffy, Franky, Pirate | 64 × 64 | 56 |

Scale is shared across every source frame for a character, including all its states.
This avoids changing character size when its state changes.
Rounded dimensions preserve the prototype's calculation.
Artwork is horizontally centered, except the flag starts two pixels from the left.
The crop bottom sits three pixels above the canvas bottom.
Transparent source pixels at the crop edge can leave additional visible space after downsampling.

[ImageMagick documents `-sample`](https://imagemagick.org/command-line-options/#sample) as direct pixel sampling without introducing new colors.
This matches the prototype's request for unsmoothed pixel artwork, although browser sampling can differ at fractional boundaries.
[ImageMagick's animation options](https://imagemagick.org/command-line-options/#delay) express delays in hundredths of a second by default.
Every prototype duration converts exactly to those units.
The GIF files loop indefinitely and clear each full frame before drawing the next through `Background` disposal.
This prevents transparent regions from retaining previous poses.

## Native use and limits

The native mod can load these GIF files through `image(path)` and use the PNG files when motion is disabled.
The installed `~/.config/herdr-app/gpui-kit.d.ts` documents `image(path)` as loading from the application's directory.
The neighboring `../herdr-pokemon-agents/mods/pokemon-agents/sprites.js` provides the native GIF generation precedent.
Use an application-relative path such as `mods/one-piece/assets/luffy-idle.gif` after installing the mod there.
These exports require no script animation timer.
This work supplies assets only and does not connect motion preferences or change the native interface.

GIF supports a limited color palette and binary transparency.
Its alpha conversion uses a 50% threshold, without dithering.
PNG preserves partial transparency and the sampled source colors.
Palette conversion can change GIF colors slightly, and no artwork correction is attempted.
The nominal prototype durations are preserved, rather than its browser timer's 80-millisecond polling jitter.

Metadata is stripped so timestamps do not change the generated bytes.
Two builds are byte-identical with ImageMagick 7.1.2-34 Q16-HDRI on this machine.
Byte identity across different ImageMagick versions is not guaranteed.
The tests also compare freshly generated files with the checked-in exports.
An intentional encoder upgrade therefore requires regeneration and review.

The tests check all 13 animations for frame counts, canvas sizes, delays, infinite looping, transparency, distinct frames, and disposal.
They compare every frame's transparency with independently derived source crops to detect neighboring-row contamination and placement errors.
They compare static PNG pixels with the first source frame and reject empty cells or missing worker bands.
The worker test bands record this approved sheet and must be reviewed if the source changes.
The tests rebuild twice to check byte identity.
Native playback in a running Herdr window remains an integration check for the parent mod work.

## Approved crew expansion, 2026-11-14

The native mod includes the 33 approved sheets in `prototype/crew-artwork`.
Thirty character sheets contain four frames for each of sleeping, walking, and sitting.
These cover four coordinators, eighteen named workers, and eight generic pirate colors.
Three ship sheets cover Red Force, Queen Mama Chanter, and Mammoth.
Sunny retains its existing source.
Mammoth represents the Beasts crew through Jack’s ship, not Kaido’s flagship.

Straw Hats support nine named workers before generic pirates.
Each other crew supports three named workers before generic pirates.
Generic pirates cycle through eight colors and retain individual numbers.
This imposes no worker limit, but colors repeat beyond eight generic workers per crew.
Assignments persist separately for each worker identity and selected crew.
Changing crews and returning does not exchange surviving workers’ appearances.
Unknown status uses a static standing frame instead of claiming sleep, work, or a request for attention.
