# Grand Fleet

Turn Herdr's Spaces and Agents sidebar into a One Piece fleet with animated ships and crewmembers.
Every agent has a character, and running Firstmate instances become captains automatically.
Keep ordinary terminals, machine grouping, and native navigation.

![Grand Fleet montage: Spaces and Agents beside four flag choices and five Straw Hat status poses](preview.png)

The preview combines native interface captures and production artwork.
In the app, Agents sits below Spaces, and Raise your flag opens as a separate dialog.

## What you see

Spaces occupy the upper sidebar region, grouped by actual machine name.
Agents occupy the lower region with Herdr's status groups and session labels.
Each region scrolls independently.
A captain's expanded Space row is 64 pixels high with a 6-pixel gap below it.
Its 48-pixel ship sits beside a 24-pixel captain portrait, with 24-pixel crewmates underneath.
A Space with agents but no captain uses the same row with its Space name in place of the captain portrait.
Compact fleet rows show a 32-pixel ship in a 36-pixel row.
The Crew button opens appearance controls below Agents.
Settings and Add machine remain native controls.
The generated layout supplies dark teal backgrounds and gold accents while preserving explicit user colors.
Defaults include background `#101f25`, selected `#29454c`, foreground `#dce6e3`, and accent `#e8bd70`.

## How it behaves

Working characters walk, idle characters sleep, and done characters rest with their chin up.
Blocked characters sit with folded arms, and characters that report an error sit with a hand to the face.
Herdr lists an error as blocked, so the mod reads the terminal's own status word to tell them apart.
Crewmember rows show no Herdr status mark: no working spinner, idle ring, Needs you cue, or done dot.
Other statuses use the sleeping pose.
Ships animate without changing session state.
Pause animation selects static PNG frames instead of GIF animation.
Clicking a ship selects its existing Space.
Clicking a portrait focuses that agent's existing terminal.
Right-click any Space with a ship to choose a ship and crew directly below Rename.
Right-click a character or use Crew for appearance controls and manual captain designation.
Crew lookup opens from a ship, a mate, or a miniature as a centered dialog.
Fleet tabs sit above character tabs, with Left, Right, Home, and End navigation in each bar.
Five equal 128-pixel tiles show Idle, Working, Done, Blocked, and Error with 28-pixel sidebar previews.
Frame buttons hold frames 1 through 4, and Play loops uses the original GIF timing.
A mate may apply a named character from its effective roster, but captain artwork stays exclusive to Firstmate.
A named swap shows both mates and both resulting assignments before one confirmation saves both.
Returning mates keep their saved characters reserved, and Apply rejects a changed or unavailable target or holder.
Switching fleets only browses their catalogs until Inspect explicitly selects a holder.
Escape discards an unconfirmed selection without changing assignments, live status, or workspace membership.
A primary Firstmate defaults to Straw Hats.
Secondmates receive unused secondary crews before crews repeat.
A Space without a captain receives the least-used crew, and Straw Hats only while no captain is live.
When several captains share a Space, the primary and then the oldest terminal supply its ship.
Manual choices survive discovery and do not transfer to replacement terminal identities.
Extra workers receive numbered generic Pirates after named artwork is exhausted.
Unavailable machines retain Herdr's connection behavior without fabricated live activity.
Worker terminals accept direct typing, and personal terminals retain native controls.
No shortcut bindings are required.

## Built from

The gallery package contains `layouts/one-piece.json` and the complete `mods/one-piece/`, including six generated `herdr-*.js` modules.
`mod.json` declares `place: none`, so copying the mod does not dock it into the current layout.
The layout's root row contains a 268-pixel sidebar and the remaining work area.
The sidebar contains the 46-pixel brand, one column holding Spaces above Agents, and the 69-pixel native footer.
The work area contains 42-pixel tabs, the active tab with 30-pixel pane headers, an optional Files/Changes panel, and a 28-pixel status bar.
The module's `region` property selects `brand`, `spaces`, `agents`, `tabs`, or `pane` in those blocks.
The layout retains shipped `workspace-chrome` for its footer, plus `files`, `changes`, and `workspace-status`.
Other menus and terminal controls remain native.

`tools/gallery.py` uses `tools/install.py` and `tools/compat.py` to generate the snapshot from an initialized Herdr home.
The six copies come from Herdr's Spaces, Agents, Menu, Tabs, Pane, and Workspace Chrome modules.
The mod subclasses those copies instead of replacing Herdr's terminal system.
The generated files carry modification notices, with Herdr's Apache-2.0 license in `mods/one-piece/HERDR-LICENSE`.
Do not hand-edit generated files.

The destination-aware installer remains available for compatible variations and later Herdr releases.
It regenerates all six modules and the layout, ignoring the bundled snapshot, and records ownership for refresh and removal.
It never selects the layout, changes shipped modules, or starts terminal sessions.
It preserves ordinary settings and shortcuts.

The native module reads `agents`, `terminals`, `machines`, `spaces`, `layout`, and `theme` from Herdr.
It stores appearance and captain choices through `shared` and `setShared`.
It uses `openOverlay` and `closeOverlay` for native menus and the centered Crew lookup dialog.
`lookup.js` validates assignments against the current snapshot, and `lookup-view.js` draws the dialog.
Navigation uses native `agent.focus`, `space.select`, and `space.move` commands.
The retired view fallback can use native `terminal.peek`.
Inherited Spaces and Agents controls retain their shipped behavior.
Artwork consists of the custom pixel PNG and GIF files in `mods/one-piece/assets/`.

Before installation, tell the user that automatic captain discovery calls Herdr's `hc get` interface and reads files outside the mod folder.
It reads the foreground process folder's `state/.lock`, `bin/fm-session-start.sh`, and `.fm-secondmate-home` on the corresponding machine.
Remote reads use Herdr's existing machine connection.
The mod does not download artwork, call external web services, or execute task commands.
Discovery checks every ten seconds and when terminal identities change.
Its reads verify process and terminal identity before accepting a captain.
A manual designation is available when this evidence cannot be read.

The checked-in snapshot targets official **Herdr App 0.1.17 and Core 0.1.22**, checked on Linux x86_64 and generated on 2026-11-23.
The official [App manifest](https://releases.herdr.dev/app/0.1.17/manifest.json) and [Core manifest](https://releases.herdr.dev/core/0.1.22/manifest.json) identify the source releases.
[Installation](docs/INSTALL.md#supported-snapshot) records the archive and executable fingerprints.
Check `herdr-app --version` and `hc --version` in the destination's own environment before copying.

To copy the package, close the window of an initialized, separate test app home, not your daily installation.
Run this block from the downloaded repository, with the app-home value replaced by that home's absolute path.
Use a destination without symbolic links, and do not edit its files during copying.
The check needs Python 3.9 or newer.
It regenerates the seven snapshot files in memory from the destination and requires byte-for-byte agreement with the package.
The block refuses existing One Piece files, ownership receipts, and interrupted installer operations instead of overwriting them.

```sh
set -eu
APP_HOME=/absolute/path/to/test-herdr-home
python3 -B tools/gallery.py check --app-home "$APP_HOME"
for path in "$APP_HOME/mods/one-piece" "$APP_HOME/layouts/one-piece.json" \
            "$APP_HOME/.one-piece-install.json" "$APP_HOME/.one-piece-install-work"; do
  if [ -e "$path" ] || [ -L "$path" ]; then
    printf 'Refusing existing path: %s\n' "$path" >&2
    exit 1
  fi
done
cp -R mods/one-piece "$APP_HOME/mods/one-piece"
cp layouts/one-piece.json "$APP_HOME/layouts/one-piece.json"
```

Do not copy the recipe or preview into the app home.
If the check fails, do not copy the snapshot or alter the shipped files to make it pass.
Run `python3 tools/install.py install --app-home "$APP_HOME"` instead, which generates from the destination and rejects unsupported structures before writing.

With the destination's display environment selected, verify the copy:

```sh
HERDR_APP_HOME="$APP_HOME" herdr-app check "$APP_HOME/mods/one-piece"
node tools/check-parity.mjs "$APP_HOME"
```

Open that destination window, then select One Piece in the layout selector or run:

```sh
HERDR_APP_HOME="$APP_HOME" herdr-app do layout.switch '{"name":"one-piece"}'
HERDR_APP_HOME="$APP_HOME" herdr-app status
```

Require layout `one-piece`, an empty error list, and visible Spaces and Agents regions.
Select another layout to return to the original window arrangement.
These commands select an app home, not an isolated Core server.
[Installation](docs/INSTALL.md#gallery-layout-package) covers the gallery request, refresh, removal, the installer, and package regeneration.

## Watch out

Copy both `mods/one-piece/` and `layouts/one-piece.json`; the complete mod alone has no automatic placement.
Do not invent replacements for missing native dependencies or overwrite an existing unknown One Piece installation.
A gallery copy has no installer receipt, so the installer neither adopts, refreshes, nor removes it.
Never overwrite a name collision or rename only the mod folder, because the mod contains its own asset paths and persistent setting names.
To refresh or remove a gallery copy, select another layout and close the destination window.
Then move `mods/one-piece/` and `layouts/one-piece.json` together to a backup outside the app home.
For a refresh, repeat the copy block with the new revision and keep the backup until the checks pass.
Leave `shared.json`, `view.json`, `keys.json`, settings, and terminal records untouched.
If `.one-piece-install.json` exists, the installer manages that copy, so do not paste gallery files over it.
[Gallery refresh and removal](docs/INSTALL.md#gallery-refresh-and-removal) gives the complete steps.
The destination needs compatible Agents, Spaces, and Menu sources and exactly one Spaces and one Agents slot under the same parent.
The mod never moves workers between Spaces or changes process ownership.
It identifies captains from existing Firstmate evidence, not names or folders alone.
Ships, crews, and character artwork work without Firstmate.
Complete Firstmate fleets need the generic hc support available in the tested fork revision documented in [Acceptance](docs/ACCEPTANCE.md).
This is not a promise that every Firstmate revision supports hc fleets.
Historical fleet acceptance used Herdr 0.1.16, local Core 0.1.21, and remote Linux Core 0.1.20.
The gallery snapshot's isolated Linux checks do not establish remote recovery, terminal adoption, or macOS behavior.
The native rendering check exercises initial rendering only.
The preview is a montage, not a single window or a promise of a side-by-side sidebar.
The historical prototype is not installed by the mod.
This is an unofficial fan project and does not grant rights to One Piece characters.

## Done when

- The gallery snapshot matches its declared Herdr release and passes the read-only destination check.
- A fresh copy and a refreshed gallery copy both switch to One Piece without errors.
- An existing installation blocks a fresh copy without changing any files.
- Refresh and removal preserve unrelated files and retain backups of unknown or modified content.
- The installer rejects unsupported source or layout structures before changing the destination.
- The installed mod passes `herdr-app check` and the repository's native parity check.
- Spaces and Agents scroll independently and show agents on their actual machines.
- Clicking a ship selects its Space, while clicking a portrait reaches that character's existing writable terminal.
- A real Firstmate is detected without manual registration, and secondary captains receive distinct default crews.
- User crew choices survive discovery and app reopening.
- Crew lookup shows five 128-pixel states and four selectable frames for every catalog character.
- A named swap updates both displayed assignments together and cannot take a returning mate's reserved character.
- Idle, working, done, blocked, and error poses match the actual native statuses, and crewmember rows show no status mark.
- App reopening and remote transport reconnection preserve running terminal identities and accept fresh typed input.
- Ordinary personal terminals, native menus, Settings, and Add machine remain available.
