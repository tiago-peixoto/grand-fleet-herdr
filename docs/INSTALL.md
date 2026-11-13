# Install the native One Piece interface

Run commands below from this repository with Python 3.9 or newer.
The installer uses only Python's standard library.
Grid presets also require `python3` on the local application's PATH at runtime.
The helper uses the local `hc connect` command to address either machine, so remote machines do not need Python for presets.
It copies `mods/one-piece/` and `layouts/one-piece.json` from the checkout containing the script, regardless of your current directory.
It also adds two close shortcuts to the existing `keys.json`, scoped to the One Piece layout.
It excludes hidden source entries, `node_modules`, Python bytecode caches, `jsconfig.json`, and `.d.ts` declarations that Herdr generates.
It does not build artwork or validate the mod's runtime behavior.

## Choose an app home

Initialize the chosen home with Herdr before installation, so it contains the app's complete `keys.json`.
Then close its window.
The installer refuses a missing keys file instead of creating a partial file that would omit shipped shortcuts.
It never starts Herdr to initialize a home.

For an initialized separate test home, run:

```sh
python3 tools/install.py install --app-home /absolute/path/to/test-herdr-home
```

For your actual Herdr configuration, explicitly run:

```sh
python3 tools/install.py install
```

An explicit `--app-home` takes priority over the `HERDR_APP_HOME` environment variable.
Without either, the destination is `~/.config/herdr-app`.
Running the script without an action, importing it, or requesting `--help` does not install anything.
Paths containing symbolic links are refused.
Use a physical path without symbolic links for the destination.
The destination must not contain the source checkout or sit inside it.

Close the Herdr window before installing, upgrading, or removing files.
Do not edit the destination during an operation.
Herdr's installed guidance says terminals continue running when its window closes.
The installer does not run Herdr commands or access terminal sessions.

## Select the layout yourself

Installation never selects a layout.
It does not edit shipped mods, other layouts, settings, session records, or Herdr's bookkeeping files.
The source mod must declare `"place":"none"`, which prevents automatic docking into the active layout.

After installation, open Herdr and select One Piece with the documented command:

```sh
herdr-app do layout.switch '{"name":"one-piece"}'
```

To return to the shipped main layout, run:

```sh
herdr-app do layout.switch '{"name":"main"}'
```

Use the same `HERDR_APP_HOME` environment variable when addressing a window with a custom home.
The documented `ctrl-shift-l` shortcut also cycles layouts, unless you changed that binding.
These mechanisms come from [Herdr's installed guidance](/Users/tiago/.config/herdr-app/AGENTS.md), under Layouts and Commands.
The installer never executes either command.

## Scoped close shortcuts

The installer adds these entries inside `keys.json`:

```json
{
  "layout:one-piece": {
    "cmd-w": "one-piece.close-tab",
    "cmd-shift-w": "one-piece.close-pane"
  }
}
```

This snippet describes the additions, not a replacement keys file.
The commands route close requests through the One Piece mod.
The installer preserves global, terminal, other-layout, and custom bindings.
Herdr gives layout bindings precedence over global bindings.
Applicable terminal and mod-specific bindings take precedence over these layout shortcuts.
An existing terminal or mod-specific override can therefore bypass these close commands.
The installer preserves those overrides.
It does not guarantee confirmation for other commands, menus, or direct `tab.close` calls.

**Editing `keys.json` stops Herdr from automatically replacing shipped shortcuts on upgrades.**
Herdr considers any edit, including whitespace, to make the entire file user-maintained.
Installing these bindings has that consequence even when all existing bindings remain unchanged.
Add future shipped shortcut changes manually while keeping the custom file.
See [Herdr's installed shortcut contract](/Users/tiago/.config/herdr-app/AGENTS.md:487).

An existing binding at either exact One Piece shortcut blocks installation, even if its command matches.
Other custom bindings within `layout:one-piece` remain intact.
There is no automatic adoption or replacement of an existing binding.
Missing keys files, symbolic links, malformed JSON, duplicate JSON keys, and non-object binding sections are refused before installation changes.

## Upgrade and remove

To upgrade, run the install command again from the updated checkout, using the same destination.
Unchanged installations can be installed repeatedly.

Before removal, switch to another layout yourself and close the Herdr window.
Then run:

```sh
python3 tools/install.py uninstall --app-home /absolute/path/to/test-herdr-home
```

For the default destination, omit `--app-home`.
Removal needs the script but does not need the source mod or layout.
Removing an already absent installation succeeds without creating an app home.

## Ownership and preservation

The installer records file paths and SHA-256 hashes, which identify file contents, in `<app-home>/.one-piece-install.json`.
Keep this ownership receipt with the installation.
Version 2 records the two owned shortcut bindings separately from owned files.
The receipt also retains the original keys text and a fingerprint of the initially installed keys file.
That fingerprint permits exact restoration; it does not claim ownership of other bindings.
An existing mod folder or layout without a valid receipt is unknown content, even if its bytes match this checkout.
The installer refuses to adopt or overwrite unknown content.
There is no force option.

Before any upgrade or removal, every owned file must still match the receipt.
A changed, missing, or replaced owned file blocks the entire operation and leaves the installation intact.
The error names the conflicting path.
Save your edits elsewhere before restoring the exact installed version and retrying.
Changed or missing owned shortcut bindings likewise block upgrades and removal before any installation changes.
Unrelated shortcut edits do not block either operation.
Do not edit the receipt to bypass this protection.

Added files remain unowned and survive upgrades and removal, including editor support files written by Herdr.
If a new release needs an unowned file's path, installation refuses the collision.
Move that file somewhere safe before retrying.
Removal deletes unchanged owned files, the two owned shortcut bindings, and the receipt.
If the keys file still matches its initially installed bytes, removal restores its exact original bytes, including whitespace and line endings.
Upgrades retain this original restoration point.
Otherwise, removal changes only the owned bindings semantically and serializes the remaining JSON.
This preserves unrelated values but can change formatting.
An empty One Piece section is removed only if installation originally created it.
Exact restoration can restore eligibility for Herdr's default-shortcut replacement when the original bytes match a recognized shipped file.
Semantic removal does not guarantee that eligibility.

Version 1 receipts own only mod and layout files.
Upgrading a version 1 installation acquires shortcut ownership only after the same initialization and conflict checks.
Removing a version 1 installation leaves `keys.json` untouched, including any manually added One Piece bindings.
Keep using this installer version after upgrading the receipt; older installers cannot interpret version 2.
A mod folder containing unowned files remains in place.
This can include `gpui-kit.d.ts` and `jsconfig.json` generated by Herdr.
A later installation refuses that remaining folder because removal also deleted its ownership receipt.
Before reinstalling, inspect the remaining folder and move it to a backup outside `<app-home>/mods/`.
Keep that backup until you have checked any custom files it contains.
Then run the normal install command.
Do not recreate an ownership receipt or delete unknown files to bypass the check.
Empty parent folders such as `mods/` and `layouts/` may remain.
The receipt prevents accidental replacement, but it is not protection against someone who can deliberately rewrite your files and receipt.

## Failures and recovery

The installer stages changes in `<app-home>/.one-piece-install-work` before replacing the mod, layout, keys, and receipt.
This directory also prevents simultaneous installer operations.
All participating destinations, including keys, are checked for concurrent changes after staging and before replacement.
Ordinary write failures trigger rollback to the previous files.
If rollback fails, backups remain in that directory.

Each rename is atomic on the same filesystem, as documented by [Python](https://docs.python.org/3/library/os.html#os.rename).
The complete operation spans several renames and is not atomic across a power loss or forced termination.
It also cannot protect against another program editing files during replacement.
Closing Herdr avoids live reload seeing an intermediate installation.

If an operation is interrupted, keep Herdr closed and inspect `.one-piece-install-work` before retrying.
Save a copy of that directory and the current mod, layout, keys, and receipt before recovery.
The `old/` directory contains originals already moved aside, and `new/` contains staged replacements not yet installed.
Restore the saved originals to their matching app-home paths without overwriting files you have since edited.
Only remove the work directory after preserving its contents and resolving the interrupted operation.
Automatic crash recovery is intentionally not provided.

## Tests

Run the installer tests from the repository:

```sh
python3 -B -m unittest discover -s tests -p test_install.py -v
```

The tests install only into temporary directories, including tests of the default home through an isolated `HOME` environment variable.
They cover upgrades, removal, unknown content, changed files, generated files, symbolic links, invalid receipts, collisions, rollback, and actual checkout assets.
Shortcut tests cover scoped additions, conflicts, unrelated edits, exact restoration, semantic removal, missing initialization, version 1 migration, and concurrent staging edits.
They do not install into your real Herdr configuration or establish the native interface's behavior inside a running window.
