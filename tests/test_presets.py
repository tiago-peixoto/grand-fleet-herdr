import copy
import importlib.util
from pathlib import Path
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'mods/one-piece/presets.py'
spec = importlib.util.spec_from_file_location('presets', SCRIPT)
presets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(presets)


class PresetTests(unittest.TestCase):
    def setUp(self):
        self.leaves = [{'id': f'p{i}', 'type': 'block',
                        'content': {'terminal': f't{i}'}, 'title': f'Personal {i}'}
                       for i in range(3)]
        self.doc = {'spaces': [{'id': 's', 'custom': 7, 'tabs': [
            {'id': 'tab', 'name': 'Work', 'custom': {'keep': True},
             'root': {'id': 'tab', 'type': 'row', 'children': copy.deepcopy(self.leaves)}}]}],
                    'future': {'keep': True}}
        self.request = {'machine': None, 'space': 's', 'tab': 'tab', 'preset': 'equal',
                        'anchor': 'p0', 'panes': [
                            {'pane': f'p{i}', 'terminal': f't{i}', 'mod': None} for i in range(3)]}

    def test_round_trip_preserves_leaves_and_unrelated_data(self):
        original = copy.deepcopy(self.doc)
        equal = presets.arrange(self.doc, self.request)
        self.assertEqual(self.doc, original)
        root = equal['spaces'][0]['tabs'][0]['root']
        self.assertEqual(root['type'], 'column')
        self.assertEqual(len(root['children']), 2)
        self.assertEqual(root['children'][1]['children'][1]['children'], [])
        self.request['preset'] = 'daily'
        daily = presets.arrange(equal, self.request)
        root = daily['spaces'][0]['tabs'][0]['root']
        self.assertEqual(root['children'][0], self.leaves[0])
        self.assertEqual(root['children'][1]['children'], self.leaves[1:])
        daily['spaces'][0]['tabs'][0]['root'] = original['spaces'][0]['tabs'][0]['root']
        self.assertEqual(daily, original)

    def test_remote_ids_and_inspection_props_are_preserved(self):
        leaf = self.doc['spaces'][0]['tabs'][0]['root']['children'][0]
        leaf['content'] = {'mod': 'one-piece', 'props': {'view': 'inspect', 'terminal': 'hz/t9'}}
        self.request.update(machine='hz', space='hz/s', tab='hz/tab', anchor='hz/p0')
        for i, pane in enumerate(self.request['panes']):
            pane.update(pane=f'hz/p{i}', terminal=f'hz/t{i}')
        self.request['panes'][0].update(terminal=None, mod='one-piece')
        result = presets.arrange(self.doc, self.request)
        self.assertEqual(result['spaces'][0]['tabs'][0]['root']['children'][0]['children'][0], leaf)

    def test_refuses_changed_panes_and_unsupported_trees(self):
        for change in ('terminal', 'hidden', 'container', 'duplicate', 'machine'):
            with self.subTest(change=change):
                doc, request = copy.deepcopy(self.doc), copy.deepcopy(self.request)
                root = doc['spaces'][0]['tabs'][0]['root']
                if change == 'terminal': root['children'][0]['content']['terminal'] = 't99'
                if change == 'hidden': root['children'][0]['hidden'] = True
                if change == 'container': root['type'] = 'stack'
                if change == 'duplicate': root['children'][1]['id'] = 'p0'
                if change == 'machine': request['machine'] = 'other'
                with self.assertRaises(ValueError): presets.arrange(doc, request)

    def test_conflict_is_not_retried_and_write_uses_fresh_version(self):
        calls = []
        def rpc(method, params):
            calls.append((method, params))
            if method == 'doc.get': return {'value': self.doc, 'version': 73}
            raise ValueError('Layout changed elsewhere. Try again.')
        self.request['machine'] = None
        with self.assertRaisesRegex(ValueError, 'changed elsewhere'):
            presets.apply(self.request, rpc)
        self.assertEqual([c[0] for c in calls], ['doc.get', 'doc.set'])
        self.assertEqual(calls[1][1]['version'], 73)
        self.assertEqual(calls[1][1]['name'], 'herdr-app')

    def test_missing_or_invalid_write_confirmation_is_not_success_or_retried(self):
        for response in ({}, None, {'version': True}, {'version': -1}, {'version': '74'}):
            with self.subTest(response=response):
                calls = []
                def rpc(method, params):
                    calls.append(method)
                    return {'value': self.doc, 'version': 73} if method == 'doc.get' else response
                with self.assertRaisesRegex(ValueError, 'did not confirm'):
                    presets.apply(self.request, rpc)
                self.assertEqual(calls, ['doc.get', 'doc.set'])

    def test_remote_request_routes_both_operations_to_the_same_machine(self):
        calls = []
        self.request.update(machine='hz', space='hz/s', tab='hz/tab', anchor='hz/p0')
        for pane in self.request['panes']:
            pane['pane'] = 'hz/' + pane['pane']
            pane['terminal'] = 'hz/' + pane['terminal']
        def rpc(method, params):
            calls.append((method, params))
            return {'value': self.doc, 'version': 73} if method == 'doc.get' else {'version': 74}
        self.assertEqual(presets.apply(self.request, rpc), {'version': 74})
        self.assertEqual([params['on'] for _, params in calls], ['hz', 'hz'])


if __name__ == '__main__':
    unittest.main()
