# Red Hair, Big Mom, and Beasts crew expansion

The expansion adds 38 approved character designs to the three existing crews.
The first implementation batch was merged into main through [PR #7](https://github.com/tiago-peixoto/herdr-one-piece/pull/7).
All 38 designs are enabled in the runtime roster after each crew's original three members.
The Lavish catalog marks every added character NEW.

| Crew | Original crewmembers | Additions | Available crewmembers |
| --- | ---: | ---: | ---: |
| Red Hair Pirates | 3 | 7 | 10 |
| Big Mom Pirates | 3 | 16 | 19 |
| Beasts Pirates | 3 | 15 | 18 |

Counts exclude captains.
The runtime roster and complete catalog now contain 147 unique named designs across eight crews, including captains.
Four shared historical designs bring the number of crew entries to 151.
Existing named characters and numbered generic pirates keep their saved assignments.
New agents receive the added characters before further generic pirates.

## Red Hair Pirates

Add Limejuice, Bonk Punch, Monster, Building Snake, Hongo, Howling Gab, and Rockstar.
These additions complement Benn Beckman, Yasopp, and Lucky Roux.
Monster receives his own monkey design rather than sharing Bonk Punch's sprite.
Rockstar is a crew member outside the core officer group.

The [official Film Red crew guide](https://www.onepiece-film.jp/red/en/info-en/528/) supports this selection.
The [official Building Snake profile](https://one-piece.com/character/Building_Snake/index.html) provides an additional character reference.

## Big Mom Pirates

Add Charlotte Perospero, Charlotte Compote, Charlotte Daifuku, Charlotte Oven, Charlotte Snack, Charlotte Brulee, Charlotte Mont-d'Or, and Charlotte Amande.
Add Charlotte Galette, Charlotte Opera, Charlotte Pudding, Charlotte Flampe, Baron Tamago, Pekoms, Streusen, and Bobbin.
This selection broadens the crew beyond the three implemented Sweet Commanders, Big Mom's highest-ranking combat officers.

Use Whole Cake Island-era appearances and affiliations.
Snack is a former Sweet Commander, which does not itself mean he left the crew.
Pekoms, Opera, and Bobbin retain era labels because this selection does not establish their later survival or loyalty.
Perospero's artwork depicts his earlier appearance with both natural arms.

The [official Charlotte family guide](https://one-piece.com/greg/o20180730_0897/index.html) provides family context.
The [Big Mom Pirates reference](https://onepiece.fandom.com/wiki/Big_Mom_Pirates) supports the broader crew selection.
The [Charlotte Snack reference](https://onepiece.fandom.com/wiki/Charlotte_Snack) explains his former commander position.

## Beasts Pirates

Add Who's-Who, Sasaki, Black Maria, Ulti, Page One, and X Drake.
These characters form the historical Tobiroppo, the six senior officers below Kaido's three highest commanders.
Add Basil Hawkins, Sheepshead, Ginrummy, Holed'em, Speed, Babanuki, Daifugo, Solitaire, and Bao Huang.

Use Wano-era affiliations rather than asserting present loyalty.
X Drake is an undercover Marine and receives that label.
Ulti, Page One, and Basil Hawkins receive historical affiliation labels.
Speed, Babanuki, and Daifugo receive labels identifying their later association with Tama.
Yamato and Scratchmen Apoo are outside this selection.

The [Beasts Pirates reference](https://onepiece.fandom.com/wiki/Beasts_Pirates) supports the historical roster.
The [X Drake reference](https://onepiece.fandom.com/wiki/X_Drake) explains his undercover position.
The [Speed reference](https://onepiece.fandom.com/wiki/Speed) explains her later allegiance.
The [official Daifugo profile](https://one-piece.com/character/Daifugo/index.html) provides his character reference.

## Artwork and verification

Each design has twelve source frames in a four-column, three-row sheet.
The rows contain sleeping, walking, and sitting poses.
The existing exporter produces a transparent PNG and four-frame GIF for each pose.
The expansion therefore adds 38 source sheets and 228 exported files.

Sources live in `prototype/crew-artwork/` as `<character>-study-v1.png`.
Exports live in `mods/one-piece/assets/` as `crew-<character>-<state>.png` and `.gif`.
The [prompt manifest](../prototype/crew-artwork/emperor-expansion-prompts.json) records the built-in generation prompts, revisions, crew assignments, and historical labels.
The [existing exporter](../tools/build-artwork.py) generates all outputs without manually editing generated artwork.
Some walking poses cross a third of their sheet, so the exporter cuts each row at the nearest empty scanline instead, as [ARTWORK-NATIVE.md](ARTWORK-NATIVE.md) describes.
That exporter fix also re-exported five characters merged in PR 7: CB Gallant, Izo, Blamenco, Petermoo, and Wire.
It resolves issue 8, which tracked pieces of walking poses under their sleeping sprites.

The new illustrations match the existing Shanks reference and use the project's established palette and proportions.
Stylized details and interpreted colors are not official color references.
This is an expanded selection, not a claim to include every canonical member established by the story or official references.

The Lavish catalog remains outside the repository at `/Users/tiago/Workspace/.lavish/grand-fleet-crew-catalog/index.html`.
Its review surface includes all eight crews, search, three pose controls, animation playback, and visible NEW badges.

Verification on 2026-11-17 passed `npm test` with 26 JavaScript tests.
Assignment tests cover the expanded rosters, generic overflow, saved assignments from the original three-member crews, and returning to a previous crew.
`python3 -m unittest discover -s tests -p 'test_*.py'` passed all 47 Python tests.
Artwork tests rebuilt all exports and compared pixels, dimensions, animation frames, and repeatability.
A pixel regression test checks that every crew animation frame is one unbroken pose resting on the baseline.
An isolated installation passed `herdr-app check` and `node tools/check-parity.mjs` against Herdr 0.1.16.
`git diff --check` passed for staged and unstaged changes.
The catalog loaded 167 images for all three poses without missing files.
Browser checks passed search, empty results, ship navigation, and animation pause.
Desktop and mobile layouts showed no horizontal overflow at widths of 1440 and 390 pixels.
The native check covers initial rendering, and the parity check compares simulated native actions.
These checks do not establish live session preservation, remote recovery, or terminal adoption.
