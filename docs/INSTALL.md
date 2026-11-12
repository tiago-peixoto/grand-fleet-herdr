# Install the native One Piece interface

Run commands below from this repository with Python 3.9 or newer.
The installer uses only Python's standard library.
It copies `mods/one-piece/` and `layouts/one-piece.json` from the checkout containing the script, regardless of your current directory.
It excludes hidden source entries, `node_modules`, `jsconfig.json`, and `.d.ts` declarations that Herdr generates.
It does not build artwork or validate the mod's runtime behavior.

## Choose an app home

For a separate test home, run:

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
It does not edit shipped mods, existing layouts, settings, keys, session records, or Herdr's bookkeeping files.
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
An existing mod folder or layout without a valid receipt is unknown content, even if its bytes match this checkout.
The installer refuses to adopt or overwrite unknown content.
There is no force option.

Before any upgrade or removal, every owned file must still match the receipt.
A changed, missing, or replaced owned file blocks the entire operation and leaves the installation intact.
The error names the conflicting path.
Save your edits elsewhere before restoring the exact installed version and retrying.
Do not edit the receipt to bypass this protection.

Added files remain unowned and survive upgrades and removal, including editor support files written by Herdr.
If a new release needs an unowned file's path, installation refuses the collision.
Move that file somewhere safe before retrying.
Removal deletes only unchanged owned files and the receipt.
A mod folder containing unowned files remains in place.
Empty parent folders such as `mods/` and `layouts/` may remain.
The receipt prevents accidental replacement, but it is not protection against someone who can deliberately rewrite your files and receipt.

## Failures and recovery

The installer stages changes in `<app-home>/.one-piece-install-work` before replacing the mod, layout, and receipt.
This directory also prevents simultaneous installer operations.
Ordinary write failures trigger rollback to the previous files.
If rollback fails, backups remain in that directory.

Each rename is atomic on the same filesystem, as documented by [Python](https://docs.python.org/3/library/os.html#os.rename).
The complete operation spans several renames and is not atomic across a power loss or forced termination.
It also cannot protect against another program editing files during replacement.
Closing Herdr avoids live reload seeing an intermediate installation.

If an operation is interrupted, keep Herdr closed and inspect `.one-piece-install-work` before retrying.
Save a copy of that directory and the current mod, layout, and receipt before recovery.
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
They do not install into your real Herdr configuration or establish the native interface's behavior inside a running window.
