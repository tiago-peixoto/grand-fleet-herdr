import importlib.util
import json
from pathlib import Path
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
