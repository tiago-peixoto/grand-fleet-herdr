# Native artwork exports

These assets mechanically export the approved prototype artwork and the crew sheets described below.
The exporter never edits source artwork or the generated prototype page.

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
Crew character sheets start from equal thirds, but each row line that crosses a pose moves to the nearest scanline with no alpha above 160.
Some walking poses cross a third, and cutting there leaves pieces of them under the sleeping sprites.
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

Each crew character also receives a static 28 × 28 `portrait-crew-<name>.png`.
The default portrait crops the top of the static working frame, centered on the opaque pixels in its top 22 rows.
Twelve characters with tall hats or hair use measured crop origins to keep their faces visible.
The exporter records those origins, and the portrait tests check them against independent crop coordinates.
At twice the display density, it reads as a 14-point face in tabs and pane titles.

The exporter cuts `prototype/flow/assets/machine-islands-v1.png` into `island-<0..7>.png` and `island-<0..7>-fog.png`, one 32 × 32 cell each.
The sheet carries a stray 32 × 32 canvas entry, so the exporter resets it before cropping and leaves the sheet itself unchanged.
At twice the display density, each island reads as a 16-point machine icon.

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
That comparison uses decoded pixels, canvas sizes, frame delays, disposal, and looping, not encoded bytes.
An ImageMagick version that changes only the encoding therefore passes.
An encoder upgrade that changes decoded frames requires regeneration and review.

The tests check all 13 animations for frame counts, canvas sizes, delays, infinite looping, transparency, distinct frames, and disposal.
They compare every frame's transparency with independently derived source crops to detect neighboring-row contamination and placement errors.
They compare static PNG pixels with the first source frame and reject empty cells or missing worker bands.
The worker test bands record this approved sheet and must be reviewed if the source changes.
The tests rebuild twice to check byte identity.
Native playback in a running Herdr window remains an integration check for the parent mod work.

## Approved crew expansion, 2026-11-14

The initial native expansion included 33 approved sheets in `prototype/crew-artwork`.
Thirty character sheets contain four frames for each of sleeping, walking, and sitting.
These cover four coordinators, eighteen named workers, and eight generic pirate colors.
Three ship sheets cover Red Force, Queen Mama Chanter, and Mammoth.
Sunny retains its existing source.
Mammoth represents the Beasts crew through Jack’s ship, not Kaido’s flagship.

Straw Hats support nine named workers before generic pirates.
The initial Red Hair, Big Mom, and Beasts rosters each support three named workers before generic pirates.
Generic pirates cycle through eight colors and retain individual numbers.
This imposes no worker limit, but colors repeat beyond eight generic workers per crew.
Assignments persist separately for each worker identity and selected crew.
Changing crews and returning does not exchange surviving workers’ appearances.
Unknown status uses the idle sheet, consistent with the current native renderer.

## Crew batch one, 2026-11-16

Batch one brought the source directory to 124 sheets: 117 characters and seven ships.
Sunny still uses its existing source outside that directory.
The 117 characters cover eight captains, 101 unique named workers, and eight generic pirate colors.
This batch adds 87 unique character sheets and four ship sheets.
Oden, Toki, young Inuarashi, and young Nekomamushi share artwork between the Whitebeard and Roger rosters.

| Crew | Captain | Named worker slots | Ship |
| --- | --- | ---: | --- |
| Heart | Trafalgar Law | 8 | Polar Tang |
| Whitebeard | Edward Newgate | 27 | Moby Dick |
| Roger | Gol D. Roger | 31 | Oro Jackson |
| Kid | Eustass Kid | 21 | Victoria Punk |

Every character sheet has four columns and three rows: sleeping, walking, then sitting.
Every ship sheet has four columns and one row.
The exporter uses 64-pixel character canvases and 128-pixel ship canvases.
Character artwork fits within 56 pixels, except Chopper uses the original smaller limit of 44 pixels.
Ship artwork fits within 116 pixels.
Sleeping frames last 850 milliseconds, walking frames last 220 milliseconds, and sitting frames last 700 milliseconds.
Ship frames last 520 milliseconds.

[The prompt record](../prototype/crew-artwork/batch-one-prompts.json) records the subjects, distinguishing features, style references, and ship correction.
[The crew catalog](CREW-CATALOG.md) records membership sources and historical distinctions.
These are stylized interpretations of canonical characters, not official character renders.
Colors for members known primarily through monochrome author sketches are artistic choices.

## Emperor crew expansion, 2026-11-17

The approved expansion adds seven Red Hair, sixteen Big Mom, and fifteen Beasts characters to their runtime rosters.
The crews now assign ten, nineteen, and eighteen named workers respectively before generic pirates.
The original three entries remain first, and saved named and numbered assignments remain unchanged.
New agents can fill the added named slots while existing generic pirates retain their numbers.

The source directory now contains 162 sheets: 155 characters and seven ships.
Characters comprise eight captains, 139 unique named workers, and eight generic pirate colors.
The 38 new sheets produce 228 exports through the existing exporter.
The canvas sizes, pose order, timing, and assignment logic are unchanged.

The [expansion record](EMPEROR-CREW-EXPANSION.md) lists every addition, provenance, historical affiliation, and verification result.

## Sprite refinement, 2026-11-18

The visual audit selected 50 characters for polish, eight characters for redraw, and four ships for polish.
The changes replace 56 character source sheets and four ship source sheets.
Chopper keeps his source drawing and returns to the original smaller export scale.
Oden keeps his source drawing and body exports, with only his portrait crop corrected.
The 97 characters and four ships rated as matching the original benchmark remain unchanged.

The redraws cover Smoothie, Perospero, Amande, Islewan, Millet Pine, Doringo, Yamon, and Emma.
The ship refinements cover Polar Tang, Moby Dick, Oro Jackson, and Victoria Punk.
The revised drawings use broader color shapes, clearer dark outlines, and lower seated poses.
Twelve measured portrait crops keep faces visible beneath tall hats and hair.
The [refinement prompt record](../prototype/crew-artwork/refinement-prompts.json) preserves the exact prompts and source hashes.

Runtime assets are generated with the existing exporter.
Canvas sizes, frame counts, playback timing, crew membership, and assignment behavior remain unchanged.
The comparison board includes all changed characters and ships at display size and enlarged.
That board and its review images remain outside this repository.
Native Herdr playback and display-density behavior still require an integration check.
