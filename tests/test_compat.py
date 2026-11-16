import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('compat', Path(__file__).resolve().parents[1] / 'tools/compat.py')
compat = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compat)

SOURCE = '''import { View } from "gpui-kit";
export default class Agents extends View {
  init() { this.folded = new Set(); }
  render() {}
  status() {}
  subRow() {}
  tree() {}
  newHerdrFeature() {}
}
'''


SPACES_SOURCE = '''export function glyph() {}
export function tone() {}
import { View } from "gpui-kit";
export default class Spaces extends View {
  init() {}
  render() {}
  row() {}
  compact() {}
  grouped() {}
  gitTail() {}
  menu() {}
}
'''


class CompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.layout = {'id': 'root', 'children': [
            {'id': 'spaces', 'content': {'mod': 'spaces'}},
            {'id': 'agents', 'content': {'mod': 'agents', 'props': {'future': True}}},
            {'id': 'future', 'content': {'mod': 'future-herdr-feature'}}]}

    def test_preserves_two_sidebar_regions_and_native_sources(self):
        files = compat.generate(SOURCE, self.layout, SPACES_SOURCE)
        self.assertEqual(files['mods/one-piece/herdr-agents.js'].decode(), SOURCE)
        self.assertEqual(files['mods/one-piece/herdr-spaces.js'].decode(), SPACES_SOURCE)
        layout = json.loads(files['layouts/one-piece.json'])
        self.assertEqual(len(layout['children']), 3)
        for index, region in enumerate(('spaces', 'agents')):
            content = layout['children'][index]['content']
            self.assertEqual(content['mod'], 'one-piece')
            self.assertEqual(content['props']['region'], region)
            content['mod'] = region
            del content['props']['region']
        del layout['children'][0]['content']['props']
        colors = layout.pop('colors')
        self.assertEqual(colors['chrome'], '#14272d')
        self.assertEqual(colors['accent'], '#e8bd70')
        self.assertEqual(layout, self.layout)

    def test_rejects_missing_git_tail(self):
        with self.assertRaisesRegex(ValueError, "Unsupported Herdr Spaces"):
            compat.generate(SOURCE, self.layout, SPACES_SOURCE.replace("  gitTail()", "  renamedGitTail()"))

    def test_rejects_unsupported_spaces_interface(self):
        for source in (SPACES_SOURCE.replace('  compact()', '  rail()'),
                       SPACES_SOURCE.replace('  menu()', '  renamedMenu()'),
                       SPACES_SOURCE.replace('export function tone()', 'function tone()'),
                       SPACES_SOURCE + '\nimport x from "./new-module.js";'):
            with self.subTest(source=source), self.assertRaises(ValueError):
                compat.generate(SOURCE, self.layout, source)

    def test_rejects_separated_sidebar_slots(self):
        layout = {'children': [self.layout['children'][0], {'children': [self.layout['children'][1]]}]}
        with self.assertRaises(ValueError):
            compat.generate(SOURCE, layout, SPACES_SOURCE)

    def test_rejects_missing_methods_and_new_module_dependencies(self):
        for source in (SOURCE.replace('  subRow()', '  childRow()'),
                       SOURCE.replace('this.folded', 'this.collapsed'),
                       SOURCE + '\nimport x from "./new-module.js";'):
            with self.subTest(source=source), self.assertRaises(ValueError):
                compat.generate(source, self.layout, SPACES_SOURCE)

    def test_rejects_missing_or_ambiguous_agent_slots(self):
        for children in ([], [self.layout['children'][1]] * 2):
            with self.subTest(children=children), self.assertRaises(ValueError):
                compat.generate(SOURCE, {'children': children}, SPACES_SOURCE)

    def test_preserves_explicit_source_color_preferences(self):
        self.layout['colors'] = {'accent': '#123456'}
        result = json.loads(compat.generate(SOURCE, self.layout, SPACES_SOURCE)['layouts/one-piece.json'])
        self.assertEqual(result['colors']['accent'], '#123456')
        self.assertEqual(result['colors']['chrome'], '#14272d')


class MenuCompatibilityTests(unittest.TestCase):
    SOURCE = (
        'import { View } from "gpui-kit";\n'
        'export default class Menu extends View {\n'
        '  choose(i) { return items(props(), this.git)[i]; }\n'
        '  render() { return items(props(), this.git).map(item => item[0]); }\n'
        '}\n')
    RUN = r"""
const vm = require('node:vm');
const source = require('node:fs').readFileSync(0, 'utf8')
  .replace(/^import .*;\n/gm, '').replace('export default class Menu', 'globalThis.Menu = class Menu');
const context = {View: class {}, props: () => ({}), items: () => [['Rename', 'space.rename']]};
vm.runInNewContext(source, context);
class Fleet extends context.Menu { items() { return [...super.items(), ['Choose ship and crew', 'one-piece.appearance']]; } }
const menu = new Fleet();
process.stdout.write(JSON.stringify({chosen: menu.choose(1), rendered: menu.render()}));
"""

    def test_subclass_items_drive_rendering_and_activation(self):
        generated = compat.generate_menu(self.SOURCE)
        result = subprocess.run(['node', '-e', self.RUN], input=generated, capture_output=True, check=True)
        self.assertEqual(json.loads(result.stdout), {
            'chosen': ['Choose ship and crew', 'one-piece.appearance'],
            'rendered': ['Rename', 'Choose ship and crew']})

    def test_rejects_changed_native_menu_interface(self):
        with self.assertRaises(ValueError):
            compat.generate_menu(self.SOURCE.replace('items(props(), this.git)', 'changed()'))
