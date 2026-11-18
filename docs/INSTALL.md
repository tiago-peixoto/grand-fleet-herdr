# Install the native One Piece interface

Grand Fleet decorates native Spaces and Agents regions while retaining native terminal controls.
Worker, secondmate, and personal terminals remain directly writable through Herdr.
The adapter does not create worker spaces, adopt terminals, connect firstmate task records, or add shortcut bindings.
Read the [thin presentation design](THIN-MOD.md) for the current contract.

This implementation remains experimental.
Use a separate test home before considering your daily configuration.
The authorized daily installation was refreshed and reopened on 2026-11-17 with the 38 new crewmembers.
The [signed-application checks](NATIVE-INTEGRATION.md#signed-application-and-daily-installation-2026-11-17) passed installation, reopening, and remote recovery.
[Native text loss after pane zoom](https://github.com/tiago-peixoto/grand-fleet-herdr/issues/2) still blocks full release acceptance.
The [acceptance review](ACCEPTANCE.md) and [native verification record](NATIVE-INTEGRATION.md) distinguish current checks from historical evidence.
Historical isolated worker checks used unchanged Firstmate revisions locally and remotely, including normal cleanup.
The current local fleet has separate delegation and physical interaction evidence.
The candidate remote lifecycle and physical recovery passed in the isolated acceptance app.
Normal final-main source updates passed.
Both prescribed secondmate restarts completed successfully.
Final post-restart reconciliation completed at 20:55:14 UTC with all five terminals alive, but remote file bytes were not reread.
The documented path and Core release limitations still apply.

## Choose an app home

An app home is Herdr's configuration directory.
The destination must contain supported `mods/agents/main.js`, `mods/spaces/main.js`, `mods/menu/main.js`, and `layouts/main.json` files supplied by Herdr.
If any required file is missing, initialize the separate test home with Herdr before installation.
A valid source and layout are sufficient without `keys.json`.
The installer never starts Herdr or initializes shortcut files.

Close the destination's Herdr window before installing, refreshing, or removing the mod.
Do not edit destination files during an operation.
The installer does not execute Herdr commands or access terminal sessions.

Run commands below from this repository with Python 3.9 or newer.
Keep `tools/install.py` and `tools/compat.py` together in the checkout.
The installer uses Python's standard library.

```sh
python3 tools/install.py install --app-home /absolute/path/to/test-herdr-home
```

An explicit `--app-home` takes priority over the `HERDR_APP_HOME` environment variable.
Without either, the destination is `~/.config/herdr-app`.
Running without an action or requesting `--help` does not install anything.
The destination and source checkout must not overlap.
Use a destination path without symbolic links.

## What installation generates

The installer copies adapter files and artwork from `mods/one-piece/` beside the script's checkout, regardless of the current working directory.
It excludes hidden entries, `node_modules`, Python bytecode caches, `jsconfig.json`, and `.d.ts` declarations.
It requires `main.js` and `mod.json` with `"place":"none"`, which prevents automatic docking into the active layout.
It does not build artwork or validate runtime behavior.

The installer calls `tools/compat.py` with both installed module sources and the parsed main layout.
It validates the Agents and Spaces classes, their overridden rendering methods, and supported module imports.
The layout must contain exactly one Spaces node and one Agents node under the same parent.
Unsupported source or layout structures stop installation before destination writes.

Generated `herdr-pane.js` preserves the installed source contents, including line endings.
Generated `herdr-spaces.js` changes only the line that draws the machine icon, so the adapter can supply an island instead.
Generated `herdr-agents.js` and `herdr-tabs.js` files change only the lines that read a program icon, so the adapter can supply a crewmember instead.
The installer refuses a Herdr version whose source no longer contains each of those lines exactly once.
Generated `herdr-chrome.js` changes only the logo and the name in the sidebar header, under the same rule.
The sidebar footer keeps Herdr's own module.
The adapter subclasses these local modules to retain native behavior.
The generated `layouts/one-piece.json` retains both sidebar nodes, the tab bar, and the pane header, and assigns their presentation through region properties.
It adds the approved palette defaults while preserving explicit source color overrides.
Other layout values remain unchanged, but serialization changes formatting.
The installer does not read a repository `layouts/one-piece.json`.
The generated files exist only in the destination installation.

Installation never selects a layout or changes shipped mods, other layouts, settings, or session records.
New installations never read, edit, or add bindings to `keys.json`.
Existing custom shortcuts remain untouched.
Only a legacy version 2 receipt authorizes shortcut cleanup, as described below.

## Use native terminals

After installation, open the destination's Herdr window and select One Piece through Herdr's layout selector.
Use Herdr's existing Spaces, Agents, menus, and terminal controls.
Every live Herdr agent appears in Agents with crewmember artwork.
To jump to the crewmate who needs you, add a key such as `"cmd-j": "one-piece.attention"` to the `global` section of `keys.json` yourself.
The installer never adds that key.
Crewmember artwork needs no Firstmate labels, worker metadata, or captain ownership.
Personal terminals that are not agents keep their native presentation.
The mod requires no mod-specific Firstmate patches or hooks.
Complete hc fleets require compatible generic hc support in Firstmate.
The [acceptance evidence](THIN-MOD.md#fork-main-acceptance-2026-11-16) records the tested fork revision.

The mod detects captains automatically from Firstmate's existing session lock, startup script, and secondmate marker.
Detected captains need no manual step, and Firstmate sends no registration or artwork commands.
A detected primary defaults to Straw Hats, and secondmates default to unused secondary crews.
To choose a different ship and crew, right-click the captain's artwork in Agents.
You can also right-click the captain's Space and choose Raise a new flag….
The same menu item chooses the ship and crew of a Space without a captain.
Your choice stays in place when discovery runs again.

If the mod cannot read a captain's session evidence, designate the captain manually.
Choose Crew in the Agents region and pick the agent running Firstmate, or right-click that agent's artwork.
Choose This agent runs Firstmate in the menu that opens.
The item is hidden when the agent's Space already has a captain.
Choose Remove captain designation to return a manually designated agent to ordinary crewmember artwork.
The mod saves manual designations in Herdr's persisted settings under `one-piece.captains`.
A designation includes the terminal creation timestamp and never transfers to a replacement session.
Do not use terminal names, folders, or native process parenting as substitutes for an explicit choice.

Every space containing a live agent shows a ship in Spaces.
A space without a captain is a generic fleet, which shows its name above the crew strip instead of a captain.
A space containing a captain shows that captain's ship.
Clicking the ship selects that space through Herdr's native command.
The captain's Space row shows the other agents in that Space as its crew.
This summary does not move terminals or change native Space membership.
A Space with agents but no captain shows their artwork in place of the letter avatar.
Spaces without agents keep their native presentation.
Artwork assignment does not change terminal parent relationships or workspace labels.
Native agent selection, sorting, pinning, grouping, and previews remain in use.

Type directly into worker, secondmate, or personal terminals through Herdr's normal terminal input.
Native new-terminal actions retain Herdr's folder inheritance.
Nested terminals without panes use Herdr's terminal preview and its native option to keep the terminal.
The adapter does not replace that action with workspace creation.
Disposable local and remote sessions passed direct typing and ship selection checks in the isolated lab.
The [current verification record](NATIVE-INTEGRATION.md#native-spaces-and-agents-verification-2026-11-15) describes the exact checks and remaining limits.

## Refresh after updates

Run the install command again from the updated checkout, using the same destination.
Repeat installation after Herdr updates to inherit changes to Spaces, Agents, and the main layout.
The generated files capture the destination's source and layout at installation time.
Other shipped mods referenced by the layout receive their normal updates directly.
Compatibility checks do not promise support for every future Herdr version.
If compatibility checks fail, keep the existing installation until the adapter supports the installed Herdr version.

## Legacy shortcut cleanup

The installer accepts ownership receipts from versions 1, 2, and 3.
A receipt records which files or shortcuts the installer owns.
New installations and successful upgrades write version 3 receipts without shortcut ownership.
Version 1 upgrades and removals leave `keys.json` untouched.

Version 2 receipts own `cmd-w` and `cmd-shift-w` inside `layout:one-piece`.
Those bindings call the retired `one-piece.close-tab` and `one-piece.close-pane` commands.
Upgrading or removing a version 2 installation removes those owned bindings.
The installer adds no replacement bindings.

The installer first validates the legacy receipt and both owned bindings.
Changed or missing owned bindings block the entire operation before writes.
A missing keys file, symbolic link, invalid JSON, duplicate JSON keys, or invalid binding section also blocks version 2 cleanup.
Unrelated custom bindings do not block cleanup.

If `keys.json` still matches its originally installed contents, cleanup restores its exact original bytes, including whitespace and line endings.
Otherwise, cleanup removes only the two owned bindings and preserves unrelated values while rewriting JSON formatting.
An empty One Piece section disappears only if the legacy installation originally created it.
Existing empty sections remain.
After successful migration, subsequent version 3 operations leave `keys.json` untouched.
Cleanup does not guarantee that Herdr will resume replacing default shortcuts during updates.

If an experimental installation was replaced without its version 2 receipt, obsolete shortcuts can remain unowned.
Version 3 deliberately leaves those settings untouched.
If closing works in default Herdr but fails in Grand Fleet, inspect `layout:one-piece` in the isolated application's `keys.json`.
Back up that file before editing it.
Remove only bindings that still call `one-piece.close-tab` or `one-piece.close-pane`, then restart that application.
Preserve unrelated custom bindings.

## Ownership and removal

The installer records owned paths and SHA-256 hashes, fingerprints of file contents, in `<app-home>/.one-piece-install.json`.
Version 3 includes both generated files alongside the copied adapter files.
Keep this receipt with the installation.
Older installers cannot interpret version 3 receipts.

Every owned file must match its recorded contents before an upgrade or removal.
A changed, missing, or replaced owned file blocks the entire operation.
An existing One Piece folder or layout without a valid receipt is unknown content.
The installer refuses to adopt unknown content, even when its bytes match the checkout.
There is no force option.
Symbolic links and special files within inspected installation trees are refused.

Added files remain unowned and survive upgrades and removal.
If a new release needs an unowned file's path, installation refuses the collision.
Preserve conflicting files elsewhere before restoring the exact owned contents or retrying installation.
Do not edit the receipt to bypass protection.
The receipt prevents accidental replacement, not deliberate tampering by someone who can rewrite files and receipts.

Before removal, select another layout and close the destination's Herdr window.
Then run:

```sh
python3 tools/install.py uninstall --app-home /absolute/path/to/test-herdr-home
```

Removal deletes unchanged owned files and the receipt.
Version 2 removal also performs the legacy shortcut cleanup described above.
Removal requires the installer and its compatibility module, but no source mod or upstream layout files.
Removing an absent installation succeeds without creating an app home.
Empty parent directories can remain.

A mod folder containing unowned files remains in place after removal.
This can include editor files generated by Herdr.
A later installation refuses that folder because its ownership receipt no longer exists.
Before reinstalling, inspect the remaining folder and move it to a backup outside `<app-home>/mods/`.
Keep the backup until you have checked its custom files.

## Failures and recovery

The installer stages replacements in `<app-home>/.one-piece-install-work` before changing installed files.
That directory also blocks another installer operation until the first operation finishes or recovery resolves it.
The installer checks participating destinations for concurrent changes after staging.
Keys participate only during version 2 cleanup.
Ordinary write failures trigger rollback to previous files.
If rollback fails, backups remain in the work directory.

Replacement spans several renames rather than one indivisible operation.
Power loss, forced termination, or another program editing files during replacement can leave an incomplete installation.
Closing Herdr prevents its live reload from observing intermediate files.
Automatic crash recovery is not provided.

If an operation is interrupted, keep Herdr closed and inspect `<app-home>/.one-piece-install-work` before retrying.
Save that directory and the current mod, layout, and receipt before recovery.
For interrupted version 2 cleanup, also save `keys.json`.
The `old/` directory contains originals already moved aside.
The `new/` directory contains staged replacements not yet installed.
Restore saved originals to matching app-home paths without overwriting subsequent edits.
Remove the work directory only after preserving its contents and resolving the interrupted operation.

## Verification and historical limits

Run the current installer and compatibility tests from the repository:

```sh
python3 -B -m unittest discover -s tests -p test_install.py -v
python3 -B -m unittest discover -s tests -p test_compat.py -v
```

Installer tests use temporary homes, including an isolated `HOME` environment variable for default-destination checks.
They cover generation, refresh, unsupported inputs, absent keys, legacy cleanup, ownership conflicts, symbolic links, receipt validation, concurrent edits, and rollback.
Compatibility tests check source preservation, combined sidebar slots, palette defaults, and retained native controls.
These tests do not install into your real configuration or verify a running window.

### Core build used for current recovery verification

The 2026-11-16 acceptance socket belongs to local Core process `24694`, which maps the installed Core executable.
That executable reports `hc 0.1.21` and has SHA-256 `8df48976b421aa60c0508e0807017f1cea75ca8d6ef43dd8d439786b3724e929`.
It exactly matches the executable in the official macOS ARM64 0.1.21 archive.
The archive matches the [official manifest](https://releases.herdr.dev/core/latest.json) checksum `1ab38dd9270f63a8f794d6d60e8702eb0d1c85a72bda85d735e5eea43f05ffed`.
The candidate physical recovery receipt records preserved terminal identities and a fresh typed remote response on this installation.
The remote Core process `1099249` reports `hc 0.1.20` and owns the private `fm-remote` listening socket.
Its running executable has SHA-256 `0e4a0c2f7ddfd9eb083f8ff3256968376b24f7577e172cd6c66f9ab0aa53c95e`.
It exactly matches the official Linux x86_64 0.1.20 archive executable.
That archive matches the [versioned manifest](https://releases.herdr.dev/core/0.1.20/manifest.json) checksum `ac6b86890c451a37584620aaa438b71bc0d0bd430a2e7c1d7e095f052c414e74`.
These comparisons establish the tested release binaries, not their source commits.
The isolated app reports 0.1.16 and retains its separate ad-hoc signature limitation.

The following source-build evidence is historical and does not identify the current acceptance runtime.

Herdr Core is the component that manages terminal sessions.
Historical recovery verification on 2026-11-14 used a macOS Apple Silicon debug build from [commit e12fee23768764e8c85699f30ce520e53fcffb32](https://github.com/herdrdev/herdr-core/commit/e12fee23768764e8c85699f30ce520e53fcffb32).
That commit contains the active-viewer recovery fix merged in [Core pull request 271](https://github.com/herdrdev/herdr-core/pull/271).
The lab binary's SHA-256 checksum is `ba1e95793d976e1314eb3c1592a4d24ddf7caf0ca6eaee5239dd980fd20245d0`.
A fresh checksum comparison on 2026-11-14 matched the lab executable, the clean merged-source build, and the preserved fallback artifact.

The [official release manifest](https://releases.herdr.dev/core/latest.json) still listed 0.1.21 when checked on 2026-11-14.
The tested source build also reports 0.1.21, so that version string alone cannot establish recovery support.
Do not treat the test build as an official release or assume that a published binary contains the fix.
A compatible published build must contain that commit and pass the relevant recovery checks before release acceptance.
The installer neither supplies nor updates Core.
These checks do not establish the contents or behavior of your installed Core version.

Earlier native captures omitted text and terminal output without independently proving a physical display failure.
A historical default/mod comparison preserved output through reconnection in both layouts.
The earlier capture discrepancies remain unexplained.
Historical passing navigation, rendering, and recovery checks do not validate the current thin adapter.
The candidate passed native input, ordinary terminal creation, expanded and compact sidebar inspection, appearance controls, and reconnection after reopening the app.
These checks used disposable test programs, not production worker conversations.
The remote test processes survived a transport interruption and accepted direct typing after recovery.
The current sidebar also passed unavailable presentation and connection-loss recovery against the isolated Core recovery build.
These results do not establish behavior on every published Core version.
