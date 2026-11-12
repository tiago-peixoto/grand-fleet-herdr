#!/usr/bin/env python3
"""Install One Piece files and scoped close shortcuts, with ownership checks."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import sys

MOD = Path('mods/one-piece')
LAYOUT = Path('layouts/one-piece.json')
RECEIPT = Path('.one-piece-install.json')
WORK = '.one-piece-install-work'
OWNER = 'herdr-one-piece'
KEYS = Path('keys.json')
KEY_SECTION = 'layout:one-piece'
BINDINGS = {'cmd-w': 'one-piece.close-tab', 'cmd-shift-w': 'one-piece.close-pane'}


def strict_json(content):
    def object_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate JSON key: {key}')
            result[key] = value
        return result

    def invalid_constant(value):
        raise ValueError(f'Invalid JSON constant: {value}')

    return json.loads(content, object_pairs_hook=object_pairs, parse_constant=invalid_constant)


def keys_document(content):
    data = strict_json(content)
    if not isinstance(data, dict) or any(not isinstance(v, dict) for v in data.values()):
        raise ValueError('keys.json must be an object of binding sections')
    return data


def encode_json(data):
    return (json.dumps(data, indent=2, ensure_ascii=True) + '\n').encode('utf-8')


def add_bindings(data):
    section = data.setdefault(KEY_SECTION, {})
    for key in BINDINGS:
        if key in section:
            raise ValueError(f'Unknown existing binding: keys.json / {KEY_SECTION} / {key}')
    section.update(BINDINGS)


def validate_keys_receipt(data):
    if (not isinstance(data, dict)
            or set(data) != {'bindings', 'original', 'installed_sha256'}
            or data['bindings'] != BINDINGS or not isinstance(data['original'], str)):
        raise ValueError('Invalid shortcut ownership receipt')
    original = keys_document(data['original'])
    add_bindings(original)
    if hashlib.sha256(encode_json(original)).hexdigest() != data['installed_sha256']:
        raise ValueError('Invalid shortcut receipt fingerprint')


def plan_keys(action, home, receipt):
    if not (home / KEYS).exists():
        raise ValueError('Missing keys.json: initialize this app home with Herdr first; '
                         'refusing to omit shipped shortcuts')
    raw = (home / KEYS).read_bytes()
    data = keys_document(raw.decode('utf-8'))
    ownership = receipt.get('keys') if receipt else None
    if ownership is None:
        add_bindings(data)
        replacement = encode_json(data)
        ownership = {'bindings': dict(BINDINGS), 'original': raw.decode('utf-8'),
                     'installed_sha256': hashlib.sha256(replacement).hexdigest()}
        return replacement, ownership
    section = data.get(KEY_SECTION, {})
    for key, command in ownership['bindings'].items():
        if section.get(key) != command:
            raise ValueError(f'Owned binding changed or missing: keys.json / {KEY_SECTION} / {key}')
    if action == 'install':
        return raw, ownership
    if hashlib.sha256(raw).hexdigest() == ownership['installed_sha256']:
        return ownership['original'].encode('utf-8'), None
    for key in ownership['bindings']:
        del section[key]
    if not section and KEY_SECTION not in keys_document(ownership['original']):
        del data[KEY_SECTION]
    return encode_json(data), None


def inventory(path):
    """Reject links and special files before reading or copying a tree."""
    mode = path.lstat().st_mode
    if stat.S_ISREG(mode):
        return hashlib.sha256(path.read_bytes()).hexdigest()
    if stat.S_ISDIR(mode):
        return {p.name: inventory(p) for p in sorted(path.iterdir())}
    raise ValueError(f'Refusing symlink or special file: {path}')


def check_parents(path):
    for parent in (path, *path.parents):
        if parent.is_symlink():
            raise ValueError(f'Refusing symlink: {parent}')
        if parent.exists() and not parent.is_dir():
            raise ValueError(f'Expected directory: {parent}')


def read_receipt(home):
    path = home / RECEIPT
    if not path.exists():
        return None
    data = strict_json(path.read_bytes())
    if (not isinstance(data, dict)
            or data.get('owner') != OWNER or type(data.get('version')) is not int
            or data['version'] not in (1, 2)
            or set(data) != ({'owner', 'version', 'files'} if data['version'] == 1
                             else {'owner', 'version', 'files', 'keys'})
            or not isinstance(data['files'], dict)):
        raise ValueError(f'Invalid ownership receipt: {path}')
    files = data['files']
    required = {'mods/one-piece/main.js', 'mods/one-piece/mod.json', str(LAYOUT)}
    if not required <= files.keys():
        raise ValueError(f'Incomplete ownership receipt: {path}')
    for name, digest in files.items():
        parts = name.split('/')
        if (any(p in ('', '.', '..') for p in parts) or '\\' in name
                or not (name == str(LAYOUT) or name.startswith('mods/one-piece/'))
                or not isinstance(digest, str) or not re.fullmatch('[0-9a-f]{64}', digest)):
            raise ValueError(f'Invalid ownership entry: {name}')
    if data['version'] == 2:
        validate_keys_receipt(data['keys'])
    return data


def source_files(repo):
    mod = repo / MOD
    check_parents(mod)
    inventory(mod)
    check_parents((repo / LAYOUT).parent)
    inventory(repo / LAYOUT)
    files = {}
    for path in sorted(mod.rglob('*')):
        relative = path.relative_to(mod)
        if (any(p.startswith('.') or p == 'node_modules' for p in relative.parts)
                or path.name == 'jsconfig.json' or path.name.endswith('.d.ts')):
            continue
        if path.is_file():
            files[path.relative_to(repo).as_posix()] = path.read_bytes()
    files[str(LAYOUT)] = (repo / LAYOUT).read_bytes()
    if not {'mods/one-piece/main.js', 'mods/one-piece/mod.json'} <= files.keys():
        raise ValueError('Source mod needs main.js and mod.json')
    metadata = json.loads(files['mods/one-piece/mod.json'])
    if not isinstance(metadata, dict) or metadata.get('place') != 'none':
        raise ValueError('mod.json must use place=none to avoid docking into the active layout')
    if not isinstance(json.loads(files[str(LAYOUT)]), dict):
        raise ValueError('Source layout must be a JSON object')
    return files


def apply(action, home, repo):
    home = Path(os.path.abspath(Path(home).expanduser()))
    repo = Path(repo).resolve()
    check_parents(home)
    if home == repo or repo in home.parents or home in repo.parents:
        raise ValueError('App home and source checkout must not overlap')
    for directory in (home / 'mods', home / 'layouts'):
        check_parents(directory)
    if (home / WORK).exists() or (home / WORK).is_symlink():
        raise ValueError(f'Another operation or interrupted operation exists; inspect {home / WORK}')
    targets = (MOD, LAYOUT, RECEIPT)
    before = {str(p): inventory(home / p) if (home / p).exists()
              or (home / p).is_symlink() else None for p in targets}
    receipt = read_receipt(home)
    owned = receipt['files'] if receipt else None
    if owned is None and any(before[str(p)] is not None for p in (MOD, LAYOUT)):
        raise ValueError('Unknown existing One Piece content; no ownership receipt, refusing changes')
    for name, digest in (owned or {}).items():
        path = home / name
        check_parents(path.parent)
        if not path.exists() or inventory(path) != digest:
            raise ValueError(f'Owned file changed or missing; preserving installation: {path}')
    if action == 'uninstall' and owned is None:
        return
    keys_content = None
    keys_ownership = None
    if action == 'install' or receipt.get('version') == 2:
        targets = (MOD, LAYOUT, KEYS, RECEIPT)
        path = home / KEYS
        before[str(KEYS)] = inventory(path) if path.exists() or path.is_symlink() else None
        keys_content, keys_ownership = plan_keys(action, home, receipt)
    files = source_files(repo) if action == 'install' else {}
    for name in files:
        path = home / name
        check_parents(path.parent)
        if (path.exists() or path.is_symlink()) and name not in (owned or {}):
            raise ValueError(f'New release conflicts with unowned file: {path}')
    home.mkdir(parents=True, exist_ok=True)
    work = home / WORK
    try:
        work.mkdir()
    except FileExistsError:
        raise ValueError(f'Another operation or interrupted operation exists; inspect {work}') from None
    moved = []
    installed = []
    try:
        stage = work / 'new'
        stage.mkdir()
        if (home / MOD).exists():
            shutil.copytree(home / MOD, stage / MOD)
        for name in owned or {}:
            if name == str(LAYOUT):
                continue
            path = stage / name
            path.unlink()
            parent = path.parent
            while parent != stage / 'mods':
                if any(parent.iterdir()):
                    break
                parent.rmdir()
                parent = parent.parent
        for name, content in files.items():
            path = stage / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        if keys_content is not None:
            (stage / KEYS).write_bytes(keys_content)
        if action == 'install':
            receipt = {'owner': OWNER, 'version': 2, 'keys': keys_ownership,
                       'files': {name: hashlib.sha256(data).hexdigest()
                                 for name, data in files.items()}}
            (stage / RECEIPT).write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
        for target in targets:
            path = home / target
            current = inventory(path) if path.exists() or path.is_symlink() else None
            if current != before[str(target)]:
                raise ValueError(f'Destination changed while staging: {path}')
        for target in targets:
            path = home / target
            backup = work / 'old' / target
            if path.exists():
                backup.parent.mkdir(parents=True, exist_ok=True)
                path.rename(backup)
                moved.append(target)
            replacement = stage / target
            if replacement.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                replacement.rename(path)
                installed.append(target)
    except BaseException:
        # Keep backups if rollback itself fails, so recovery never deletes the originals.
        for target in reversed(installed):
            path = home / target
            path.rename(work / 'new' / target)
        for target in reversed(moved):
            (work / 'old' / target).rename(home / target)
        shutil.rmtree(work)
        raise
    shutil.rmtree(work)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('install', 'uninstall'))
    parser.add_argument('--app-home', default=os.environ.get('HERDR_APP_HOME')
                        or '~/.config/herdr-app', help='Herdr app home (default: HERDR_APP_HOME or ~/.config/herdr-app)')
    args = parser.parse_args()
    try:
        apply(args.action, args.app_home, Path(__file__).resolve().parents[1])
    except (OSError, ValueError) as error:
        parser.exit(1, f'Error: {error}\n')
    print(f'{args.action.capitalize()} complete: {Path(args.app_home).expanduser()}')


if __name__ == '__main__':
    main()
