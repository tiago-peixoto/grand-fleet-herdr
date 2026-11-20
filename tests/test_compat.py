import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('compat', Path(__file__).resolve().parents[1] / 'tools/compat.py')
compat = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compat)

SOURCE = '''import { View } from "gpui-kit";
function icon(p, size) { return [p, size]; }
export default class Agents extends View {
  init() { this.folded = new Set(); }
  render() {
    const a = {program: 'A'}, k = {program: 'K'}, t = {foreground: '#fff'};
    return [icon(a.program, 16, t.foreground), icon(k.program, 14, t.foreground)];
  }
  rows() {
    const a = {address: 'a'}, k = {address: 'k'}, t = {}, st = 'idle', byPriority = true, isPinned = false, compact = true;
    const row = {marks: [], when(on, add) { return on ? add(this) : this; }, child(mark) { this.marks.push(mark); return this; }};
    return row.child(this.status(t, a, byPriority && !isPinned)).child(this.status(t, { status: st }, compact)).marks;
  }
  status(t, a) { return a.address ?? a.status; }
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
  grouped(m, connected) {
    const icon = svg(`mods/workspace-chrome/${m ? "server" : "monitor"}.svg`).size(13).flex_none();
    return icon;
  }
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
        # Only the machine icon is routed through a method; every other native line is kept.
        generated = files['mods/one-piece/herdr-spaces.js'].decode().splitlines()
        self.assertEqual(len(set(generated) - set(SPACES_SOURCE.splitlines())), 2)
        self.assertEqual(len(set(SPACES_SOURCE.splitlines()) - set(generated)), 1)
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


def run_class(source, name, subclass, method='render'):
    script = (
        "const vm = require('node:vm');\n"
        "const source = require('node:fs').readFileSync(0, 'utf8').replace(/^import .*;\\n/gm, '')"
        f".replace('export default class {name}', 'globalThis.{name} = class {name}');\n"
        "const context = {View: class {}};\n"
        "vm.runInNewContext(source, context);\n"
        f"const Custom = {subclass};\n"
        f"process.stdout.write(JSON.stringify([new context.{name}().{method}(), new Custom().{method}()]));\n")
    result = subprocess.run(['node', '-e', script], input=source, capture_output=True, check=True)
    return json.loads(result.stdout)


class PortraitCompatibilityTests(unittest.TestCase):
    TABS = ('import { View } from "gpui-kit";\n'
            'export default class Tabs extends View {\n'
            '  render() { const lead = {program: {icon: "icons/claude.svg"}};\n'
            '    const program = lead?.program;\n    return program.icon; }\n}\n')
    PANE = ('import { View } from "gpui-kit";\n'
            'export default class Pane extends View {\n'
            '  me() { return {program: {icon: "icons/claude.svg"}}; }\n'
            '  render() { const p = this.me();\n    return p.program.icon; }\n}\n')

    def test_agent_icons_route_through_an_overridable_method(self):
        generated = compat.generate(SOURCE, {'children': [
            {'content': {'mod': 'spaces'}}, {'content': {'mod': 'agents'}}]}, SPACES_SOURCE)
        native, custom = run_class(generated['mods/one-piece/herdr-agents.js'], 'Agents',
                                   'class extends context.Agents { icon(agent, size) { return `portrait-${agent.program}-${size}`; } }')
        self.assertEqual(native, [['A', 16], ['K', 14]])
        self.assertEqual(custom, ['portrait-A-16', 'portrait-K-14'])

    def test_agent_and_subagent_rows_can_leave_out_their_status_mark(self):
        generated = compat.generate(SOURCE, self.LAYOUT, SPACES_SOURCE)
        native, custom = run_class(generated['mods/one-piece/herdr-agents.js'], 'Agents',
                                   'class extends context.Agents { showsStatus(agent) { return agent.address !== "a"; } }', 'rows')
        self.assertEqual(native, ['a', 'idle'])
        self.assertEqual(custom, ['idle'])
        for changed in ('{ status: st }, compact', 'byPriority && !isPinned'):
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                compat.generate(SOURCE.replace(changed, 'true'), self.LAYOUT, SPACES_SOURCE)

    def test_tab_and_pane_icons_can_be_replaced(self):
        files = compat.generate_portraits(self.TABS, self.PANE)
        self.assertEqual(run_class(files['mods/one-piece/herdr-tabs.js'], 'Tabs',
                                   'class extends context.Tabs { program() { return {icon: "portrait.png"}; } }'),
                         ['icons/claude.svg', 'portrait.png'])
        self.assertEqual(run_class(files['mods/one-piece/herdr-pane.js'], 'Pane',
                                   'class extends context.Pane { me() { return {program: {icon: "portrait.png"}}; } }'),
                         ['icons/claude.svg', 'portrait.png'])

    def test_rejects_changed_icon_sources(self):
        for tabs, pane in ((self.TABS.replace('lead?.program;', 'lead.program;'), self.PANE),
                           (self.TABS, self.PANE.replace('  me()', '  current()')),
                           (self.TABS.replace('"gpui-kit"', '"./helpers.js"'), self.PANE)):
            with self.subTest(tabs=tabs, pane=pane), self.assertRaises(ValueError):
                compat.generate_portraits(tabs, pane)
        with self.assertRaises(ValueError):
            compat.generate(SOURCE.replace('icon(k.program', 'icon(k.other'), {'children': [
                {'content': {'mod': 'spaces'}}, {'content': {'mod': 'agents'}}]}, SPACES_SOURCE)

    LAYOUT = {'children': [{'content': {'mod': 'spaces'}}, {'content': {'mod': 'agents'}}]}

    def test_machine_header_icon_can_be_replaced(self):
        spaces = compat.generate(SOURCE, self.LAYOUT, SPACES_SOURCE)['mods/one-piece/herdr-spaces.js'].decode()
        script = spaces.replace('import { View } from "gpui-kit";', 'class View {}').replace('export default ', '').replace('export ', '') + '''
const svg = path => ({size: () => ({flex_none: () => path})});
class Islands extends Spaces { machineIcon(m, connected) { return connected ? 'island' : super.machineIcon(m, connected); } }
console.log(JSON.stringify([new Islands().grouped('vps', true), new Islands().grouped('vps', false), new Spaces().grouped(null, true)]));
'''
        result = subprocess.run(['node', '-e', script], capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout),
                         ['island', 'mods/workspace-chrome/server.svg', 'mods/workspace-chrome/monitor.svg'])
        with self.assertRaises(ValueError):
            compat.generate(SOURCE, self.LAYOUT, SPACES_SOURCE.replace('.size(13)', '.size(14)'))

    CHROME = ('import { View } from "gpui-kit";\n'
              'export default class WorkspaceChrome extends View {\n'
              '  render() { return [image("frame/welcome/herdr.png").size(20).rounded(5), label().child("Herdr")]; }\n}\n')

    def test_brand_logo_and_title_can_be_replaced(self):
        source = compat.generate_brand(self.CHROME)['mods/one-piece/herdr-chrome.js'].decode()
        self.assertIn('logo() { return image("frame/welcome/herdr.png").size(20).rounded(5); }', source)
        self.assertIn('[this.logo(), label().child(this.title())]', source)
        for changed in (self.CHROME.replace('.rounded(5)', '.rounded(6)'), self.CHROME.replace('"Herdr"', '"Herdr 2"'),
                        self.CHROME.replace('"gpui-kit"', '"./helpers.js"')):
            with self.subTest(changed=changed), self.assertRaises(ValueError):
                compat.generate_brand(changed)

    def test_layout_hosts_the_brand_but_not_the_footer(self):
        layout = {'children': [
            {'content': {'mod': 'spaces'}}, {'content': {'mod': 'agents'}},
            {'content': {'mod': 'workspace-chrome'}},
            {'content': {'mod': 'workspace-chrome', 'props': {'footer': True}}}]}
        result = json.loads(compat.generate(SOURCE, layout, SPACES_SOURCE)['layouts/one-piece.json'])
        self.assertEqual(result['children'][2]['content'], {'mod': 'one-piece', 'props': {'region': 'brand'}})
        self.assertEqual(result['children'][3]['content'], {'mod': 'workspace-chrome', 'props': {'footer': True}})

    def test_layout_hosts_tabs_and_pane_headers(self):
        layout = {'children': [
            {'content': {'mod': 'spaces'}}, {'content': {'mod': 'agents'}},
            {'content': {'mod': 'tabs', 'props': {'keep': 1}}},
            {'content': {'tab': 'active', 'pane': {'header': {'content': {'mod': 'pane'}, 'height': 30}}}}]}
        result = json.loads(compat.generate(SOURCE, layout, SPACES_SOURCE)['layouts/one-piece.json'])
        self.assertEqual(result['children'][2]['content'], {'mod': 'one-piece', 'props': {'keep': 1, 'region': 'tabs'}})
        self.assertEqual(result['children'][3]['content']['pane']['header'],
                         {'content': {'mod': 'one-piece', 'props': {'region': 'pane'}}, 'height': 30})


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
