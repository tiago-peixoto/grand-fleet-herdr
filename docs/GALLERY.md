# Layout package verification

The gallery package was generated from official Herdr App 0.1.17 with Core 0.1.22 on Linux x86_64 on 2026-11-23.
The [installation guide](INSTALL.md#supported-snapshot) records the official archive and executable fingerprints.
The layout and six native modules come from `tools/gallery.py`, which calls the existing installer and compatibility generator.
The checked-in snapshot is not a replacement for destination-aware installation after Herdr changes.

## Package contents

- `layouts/one-piece.json` retains the native layout tree with Grand Fleet's presentation regions and palette.
- `mods/one-piece/` includes the adapter, artwork, and all six generated native modules.
- `mods/one-piece/HERDR-LICENSE` retains Herdr's Apache-2.0 license.
- `RECIPE.md` covers compatibility, copying, collisions, and the refresh and removal cautions.
- `docs/INSTALL.md` holds the fingerprints, the complete refresh and removal steps, and regeneration.
- `preview.png` is the approved refined C image, copied without changing its bytes.

The preview measures 2880 by 1800 pixels.
Its SHA-256 fingerprint is `463356d39fb21c01f267b6979b80bb40957fb6e4c60598c703d4b3631bd29228`.
The preview combines native interface captures and production poses rather than depicting one window arrangement.
Spaces and Agents remain stacked in the installed layout.

## Isolated desktop checks

The trial used official downloaded binaries with private HOME, configuration, storage, temporary files, and app home under one temporary root.
Xvfb, a virtual display server, allocated a private display with `-displayfd`.
A unique nondefault Core session contained only two disposable Python programs.
No legacy Herdr command ran.
The daily app configuration and live fleet terminals were not used.

The recipe's fresh-copy shell block ran directly, with only its example destination replaced by the lab app home.
The same trial exercised refresh over an existing copy and the destination-aware installer.

| Check | Result |
| --- | --- |
| Read-only snapshot check | Matched the official destination's generated layout and six modules |
| Fresh gallery copy | Copied the complete package without creating an installer receipt |
| Existing gallery copy | Refused before writes, with the entire app-home file inventory unchanged |
| Installer on an unowned gallery copy | Refused before writes rather than adopting it |
| Gallery refresh | Backed up both paths, copied anew, and preserved unrelated settings and layout files |
| Local modifications | Preserved an added file in the backup instead of silently deleting it |
| Gallery removal | Moved only the mod and layout aside, then reopened the native layout without errors |
| Conversion to installer management | Installed after moving the gallery copy aside, refreshed, and uninstalled successfully |
| Copy over installer-managed content | Refused without changing files or invalidating the ownership receipt |
| Initial rendering | `herdr-app check` passed for fresh, refreshed, and installer-managed copies |
| Native behavior comparison | `tools/check-parity.mjs` passed for all three copies |
| Layout switching | Switched to `one-piece` and back to `main`, with an empty app error list |
| Live appearance | Native screenshots showed ships, crewmembers, tabs, pane headers, and distinct Spaces and Agents regions |
| Local fixture continuity | Both terminal addresses, creation times, shell processes, and foreground processes survived gallery refresh and reopening |
| Fresh terminal response | Both disposable programs echoed a new message sent through Core after refresh |
| Cleanup | Closed the app, ended only private terminals, stopped the private Core and display, and deleted the lab root |
| Fleet safety | The live fleet socket, inode, and owning process start remained unchanged |

Raw logs, screenshots, and the reproducible lab script stay outside this repository in the task's evidence directory.

## Automated checks

`npm test` passed all 43 JavaScript tests.
`python3 -B -m unittest discover -s tests -v` passed all 65 Python tests with ImageMagick 7.1.2-36.
The new tests cover snapshot generation, read-only checking, rejection before writes, presence of the six generated modules, and destination-derived installer refresh.
`git diff --check` and `git diff --cached --check` passed.
These tests complement the live trial rather than replacing it.

## Limits

These checks establish package copying and layout switching on the recorded Linux releases, not full fleet acceptance.
They do not establish remote recovery, terminal adoption, real Firstmate discovery, or behavior on other platforms and releases.
The native check exercises initial rendering only.
Its output also included Herdr's warning about script tasks stranded during reload, despite returning success.
Live app status reported no errors.

The software-rendered captures retained the previously observed dark terminal text.
The welcome overlay remained visible over the work area, while both sidebar regions were unobstructed.
This trial did not test pane zoom, terminal painting, physical pointer input, or remote transport interruption.
The [current release limits](ACCEPTANCE.md#current-release-verification-2026-11-17) therefore remain separate from these packaging results.

The repository topic remains unchanged.
Merge and public gallery submission still require separate approval.
Herdr's acceptance of the montage as a gallery image remains unverified.
