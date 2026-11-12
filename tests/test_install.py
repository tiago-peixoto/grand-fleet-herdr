"""Run the installer as a user would, with all writes in temporary homes."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'tools/install.py'


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.repo = self.root / 'repo'
        self.home = self.root / 'app'
        (self.repo / 'tools').mkdir(parents=True)
        if SCRIPT.exists():
            shutil.copyfile(SCRIPT, self.repo / 'tools/install.py')
        self.put(self.repo, 'mods/one-piece/main.js', 'version one')
        self.put(self.repo, 'mods/one-piece/mod.json', '{"place":"none"}')
        self.put(self.repo, 'mods/one-piece/assets/image.png', b'\x00\xffPNG')
        self.put(self.repo, 'layouts/one-piece.json', '{"content":{"mod":"one-piece"}}')
        for name in ('settings.json', 'shared.json', 'view.json', 'sessions.json',
                     'mods/tabs/main.js', 'layouts/main.json'):
            self.put(self.home, name, 'keep ' + name)
        self.original = self.files(self.home)

    def put(self, root, name, content):
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content.encode() if isinstance(content, str) else content)
        return path

    def files(self, root):
        return {p.relative_to(root).as_posix(): p.read_bytes()
                for p in root.rglob('*') if p.is_file()}

    def run_cli(self, action='install', ok=True, extra=(), env=None):
        result = subprocess.run(
            [sys.executable, '-B', str(self.repo / 'tools/install.py'), action,
             '--app-home', str(self.home), *extra], capture_output=True, text=True, env=env)
        self.assertEqual(result.returncode == 0, ok, result.stdout + result.stderr)
        return result

    def test_install_upgrade_and_remove_only_owned_files(self):
        self.put(self.repo, 'mods/one-piece/gpui-kit.d.ts', 'generated')
        self.put(self.repo, 'mods/one-piece/jsconfig.json', '{}')
        self.put(self.repo, 'mods/unrelated/main.js', 'not ours')
        self.run_cli()
        self.assertEqual((self.home / 'mods/one-piece/main.js').read_text(), 'version one')
        self.assertFalse((self.home / 'mods/one-piece/gpui-kit.d.ts').exists())
        self.assertFalse((self.home / 'mods/unrelated').exists())
        self.put(self.home, 'mods/one-piece/gpui-kit.d.ts', 'app generated')
        self.put(self.home, 'mods/one-piece/notes.txt', 'my notes')
        self.put(self.repo, 'mods/one-piece/main.js', 'version two')
        (self.repo / 'mods/one-piece/assets/image.png').unlink()
        self.run_cli()
        self.run_cli()
        self.assertEqual((self.home / 'mods/one-piece/main.js').read_text(), 'version two')
        self.assertFalse((self.home / 'mods/one-piece/assets/image.png').exists())
        self.run_cli('uninstall')
        expected = dict(self.original, **{'mods/one-piece/gpui-kit.d.ts': b'app generated',
                                         'mods/one-piece/notes.txt': b'my notes'})
        self.assertEqual(self.files(self.home), expected)

    def test_clean_uninstall_is_repeatable_and_needs_no_sources(self):
        self.run_cli()
        shutil.rmtree(self.repo / 'mods')
        shutil.rmtree(self.repo / 'layouts')
        self.run_cli('uninstall')
        self.run_cli('uninstall')
        self.assertEqual(self.files(self.home), self.original)
        self.assertFalse((self.home / 'mods/one-piece').exists())

    def test_unknown_content_is_never_adopted(self):
        for target in ('mods/one-piece/main.js', 'layouts/one-piece.json'):
            with self.subTest(target=target):
                path = self.put(self.home, target, 'unknown')
                before = self.files(self.home)
                self.run_cli(ok=False)
                self.run_cli('uninstall', ok=False)
                self.assertEqual(self.files(self.home), before)
                path.unlink()
                if target.startswith('mods/'):
                    path.parent.rmdir()

    def test_changed_or_missing_owned_files_block_both_actions(self):
        self.run_cli()
        for target in ('mods/one-piece/main.js', 'layouts/one-piece.json'):
            path = self.home / target
            original = path.read_bytes()
            for content in (b'user changes', None):
                with self.subTest(target=target, content=content):
                    if content is None:
                        path.unlink()
                    else:
                        path.write_bytes(content)
                    before = self.files(self.home)
                    self.run_cli(ok=False)
                    self.run_cli('uninstall', ok=False)
                    self.assertEqual(self.files(self.home), before)
                    path.write_bytes(original)

    def test_upgrade_cannot_overwrite_unowned_file(self):
        self.run_cli()
        self.put(self.home, 'mods/one-piece/new.js', 'user file')
        self.put(self.repo, 'mods/one-piece/new.js', 'new release')
        before = self.files(self.home)
        self.run_cli(ok=False)
        self.assertEqual(self.files(self.home), before)

    def test_symlinks_are_refused_without_touching_referent(self):
        outside = self.put(self.root, 'outside.txt', 'private')
        link = self.repo / 'mods/one-piece/link'
        link.symlink_to(outside)
        self.run_cli(ok=False)
        link.unlink()
        (self.home / 'mods/one-piece').symlink_to(self.repo / 'mods/one-piece')
        self.run_cli(ok=False)
        self.run_cli('uninstall', ok=False)
        self.assertEqual(outside.read_text(), 'private')
        self.assertEqual((self.repo / 'mods/one-piece/main.js').read_text(), 'version one')

    def test_corrupt_receipt_cannot_authorize_removal(self):
        self.run_cli()
        receipt = self.home / '.one-piece-install.json'
        for value in ('{', '[]', '{"owner":"someone else"}',
                      json.dumps({'owner': 'herdr-one-piece', 'version': 1,
                                  'files': {'../settings.json': '0' * 64}})):
            receipt.write_text(value)
            before = self.files(self.home)
            self.run_cli('uninstall', ok=False)
            self.run_cli(ok=False)
            self.assertEqual(self.files(self.home), before)

    def test_no_action_and_help_do_not_write_default_home(self):
        env = dict(os.environ, HOME=str(self.root), HERDR_APP_HOME=str(self.home))
        for args in ([], ['--help']):
            subprocess.run([sys.executable, '-B', str(self.repo / 'tools/install.py'), *args],
                           env=env, capture_output=True, check=False)
        self.assertEqual(self.files(self.home), self.original)
        self.assertFalse((self.root / '.config').exists())

    def test_default_home_and_environment_override(self):
        env = dict(os.environ, HOME=str(self.root))
        env.pop('HERDR_APP_HOME', None)
        command = [sys.executable, '-B', str(self.repo / 'tools/install.py'), 'install']
        subprocess.run(command, env=env, capture_output=True, check=True)
        self.assertTrue((self.root / '.config/herdr-app/mods/one-piece/main.js').is_file())
        env['HERDR_APP_HOME'] = str(self.home)
        subprocess.run(command, env=env, capture_output=True, check=True)
        self.assertTrue((self.home / 'mods/one-piece/main.js').is_file())

    def test_interrupted_operation_blocks_new_writes(self):
        self.put(self.home, '.one-piece-install-work/old/saved', 'backup')
        before = self.files(self.home)
        self.run_cli(ok=False)
        self.assertEqual(self.files(self.home), before)

    def test_parent_symlink_and_invalid_source_are_refused(self):
        shutil.rmtree(self.home / 'mods')
        (self.home / 'mods').symlink_to(self.repo / 'mods')
        self.run_cli(ok=False)
        (self.home / 'mods').unlink()
        for metadata in ('{', '{}', '{"place":"left"}'):
            self.put(self.repo, 'mods/one-piece/mod.json', metadata)
            before = self.files(self.home)
            self.run_cli(ok=False)
            self.assertEqual(self.files(self.home), before)

    def test_destination_directory_cannot_replace_owned_file(self):
        self.run_cli()
        path = self.home / 'mods/one-piece/main.js'
        path.unlink()
        path.mkdir()
        self.put(path, 'user.txt', 'keep')
        before = self.files(self.home)
        self.run_cli(ok=False)
        self.run_cli('uninstall', ok=False)
        self.assertEqual(self.files(self.home), before)

    def test_write_failure_restores_installation(self):
        self.run_cli()
        before = self.files(self.home)
        self.put(self.repo, 'mods/one-piece/main.js', 'upgrade')
        spec = importlib.util.spec_from_file_location('installer', SCRIPT)
        installer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(installer)
        rename = Path.rename

        for action in ('install', 'uninstall'):
            def fail_layout(source, destination):
                if source == self.home / 'layouts/one-piece.json':
                    raise OSError('simulated disk failure')
                return rename(source, destination)

            with self.subTest(action=action), mock.patch.object(Path, 'rename', fail_layout):
                with self.assertRaisesRegex(OSError, 'simulated disk failure'):
                    installer.apply(action, self.home, self.repo)
            self.assertEqual(self.files(self.home), before)
            self.assertFalse((self.home / '.one-piece-install-work').exists())

    def test_failed_rollback_keeps_originals_for_recovery(self):
        self.run_cli()
        self.put(self.repo, 'mods/one-piece/main.js', 'upgrade')
        spec = importlib.util.spec_from_file_location('installer', SCRIPT)
        installer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(installer)
        rename = Path.rename

        def fail_and_block_rollback(source, destination):
            if source == self.home / 'layouts/one-piece.json':
                raise OSError('simulated disk failure')
            if source == self.home / 'mods/one-piece':
                if (self.home / '.one-piece-install-work/old/mods/one-piece').exists():
                    raise OSError('rollback unavailable')
            return rename(source, destination)

        with mock.patch.object(Path, 'rename', fail_and_block_rollback):
            with self.assertRaisesRegex(OSError, 'rollback unavailable'):
                installer.apply('install', self.home, self.repo)
        backup = self.home / '.one-piece-install-work/old/mods/one-piece/main.js'
        self.assertEqual(backup.read_text(), 'version one')
        before = self.files(self.home)
        self.run_cli(ok=False)
        self.assertEqual(self.files(self.home), before)

    def test_actual_checkout_copies_assets_and_removes_cleanly(self):
        before = self.files(self.home)
        for action in ('install', 'uninstall'):
            result = subprocess.run([sys.executable, '-B', str(SCRIPT), action,
                                     '--app-home', str(self.home)],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            if action == 'install':
                for name in ('main.js', 'fleet.js', 'assets/sunny.gif'):
                    self.assertEqual((self.home / 'mods/one-piece' / name).read_bytes(),
                                     (ROOT / 'mods/one-piece' / name).read_bytes())
        self.assertEqual(self.files(self.home), before)


if __name__ == '__main__':
    unittest.main()
