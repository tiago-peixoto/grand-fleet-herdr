# Install the native One Piece interface

The thin adapter adds artwork to Herdr's native Agents interface while retaining ordinary Spaces and terminal controls.
Worker, secondmate, and personal terminals remain directly writable through Herdr.
The adapter does not create worker spaces, adopt terminals, connect firstmate task records, or add shortcut bindings.
Read the [thin presentation design](THIN-MOD.md) for the current contract.

This implementation remains experimental.
Use a separate test home while current native interaction and visual verification remain incomplete.
The [acceptance review](ACCEPTANCE.md) and [native verification record](NATIVE-INTEGRATION.md) contain historical evidence with narrower scopes.
They do not establish acceptance of the current thin adapter.

## Choose an app home

An app home is Herdr's configuration directory.
The destination must contain supported `mods/agents/main.js` and `layouts/main.json` files supplied by Herdr.
If either file is missing, initialize the separate test home with Herdr before installation.
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

The installer calls `tools/compat.py` with the destination's `mods/agents/main.js` source and parsed `layouts/main.json` layout.
The compatibility check requires `export default class Agents extends View` and the methods `init`, `render`, `status`, `subRow`, and `tree`.
It also requires the native folded-group set used by the ship control.
It rejects detected module imports outside `herdr`, `gpui-kit`, and `gpui-base`.
The layout must contain exactly one node whose `content.mod` value is `agents`.
Unsupported source or layout structures stop installation before destination writes.

The generated `mods/one-piece/herdr-agents.js` preserves the installed Agents source contents, including line endings.
The adapter imports that local module to retain Herdr's existing agent behavior.
The generated `layouts/one-piece.json` changes only that Agents node's `content.mod` value to `one-piece`.
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
A parent agent receives ship and captain artwork, and nested agents receive crewmate artwork.
Artwork assignment does not change terminal parent relationships or workspace labels.
The ship control folds its crew.
Native agent selection and child actions remain in use.

Type directly into worker, secondmate, or personal terminals through Herdr's normal terminal input.
Native new-terminal actions retain Herdr's folder inheritance.
Nested terminals without panes use Herdr's terminal preview and its native option to keep the terminal.
The adapter does not replace that action with workspace creation.
Disposable local and remote sessions passed direct typing and new-terminal folder checks in the isolated lab.
The [candidate verification record](THIN-MOD.md#candidate-verification-on-2026-11-14) describes the exact checks and remaining limits.

## Refresh after updates

Run the install command again from the updated checkout, using the same destination.
Repeat installation after Herdr updates to inherit changes to Agents and the main layout.
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
Compatibility tests check source preservation and the single layout replacement.
These tests do not install into your real configuration or verify a running window.

Historical recovery checks used a candidate Herdr Core build, the component that manages terminal sessions, containing a recovery patch.
The historical review recorded that Core 0.1.21 lacked that patch.
Those observations do not establish the contents or behavior of your installed Core version.
The installer neither supplies nor updates Core.

Earlier native captures omitted text and terminal output without independently proving a physical display failure.
A historical default/mod comparison preserved output through reconnection in both layouts.
The earlier capture discrepancies remain unexplained.
Historical passing navigation, rendering, and recovery checks do not validate the current thin adapter.
The candidate passed native input, ordinary terminal creation, expanded and compact sidebar inspection, appearance controls, and reconnection after reopening the app.
These checks used disposable test programs, not production worker conversations.
The remote test processes survived a transport interruption, but offline presentation and direct typing after transport recovery remain unverified.
