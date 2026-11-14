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


class CompatibilityTests(unittest.TestCase):
    def setUp(self):
        self.layout = {'id': 'root', 'children': [
            {'id': 'spaces', 'content': {'mod': 'spaces'}},
            {'id': 'agents', 'content': {'mod': 'agents', 'props': {'future': True}}},
            {'id': 'future', 'content': {'mod': 'future-herdr-feature'}}]}

    def test_preserves_upstream_source_and_every_other_layout_field(self):
        files = compat.generate(SOURCE, self.layout)
        self.assertEqual(files['mods/one-piece/herdr-agents.js'].decode(), SOURCE)
        layout = json.loads(files['layouts/one-piece.json'])
        self.assertEqual(layout['children'][1]['content']['mod'], 'one-piece')
        layout['children'][1]['content']['mod'] = 'agents'
        self.assertEqual(layout, self.layout)

    def test_rejects_missing_methods_and_new_module_dependencies(self):
        for source in (SOURCE.replace('  subRow()', '  childRow()'),
                       SOURCE.replace('this.folded', 'this.collapsed'),
                       SOURCE + '\nimport x from "./new-module.js";'):
            with self.subTest(source=source), self.assertRaises(ValueError):
                compat.generate(source, self.layout)

    def test_rejects_missing_or_ambiguous_agent_slots(self):
        for children in ([], [self.layout['children'][1]] * 2):
            with self.subTest(children=children), self.assertRaises(ValueError):
                compat.generate(SOURCE, {'children': children})
