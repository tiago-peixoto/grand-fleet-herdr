import copy
import importlib.util
import pathlib
import unittest


spec = importlib.util.spec_from_file_location('records', pathlib.Path(__file__).parents[1] / 'mods/one-piece/records.py')
records = importlib.util.module_from_spec(spec)
spec.loader.exec_module(records)


class RecordsTest(unittest.TestCase):
    def test_decision_requires_exact_live_endpoint_identity(self):
        request = {'root': '/firstmate', 'home': '/home/fleet', 'label': 'firstmate-test',
                   'workers': [{'address': 't30', 'created_ms': 12, 'task': 'fm-check'}]}
        snapshot = {'schema': 'fm-fleet-snapshot.v1', 'fm_home': '/home/fleet', 'tasks': [
            {'id': 'check', 'backend': 'hc', 'remote': None, 'current_state': {'state': 'parked'},
             'endpoint': {'target': 'session:t30'},
             'hints': {'open_decisions': [{'key': 'confirm', 'verb': 'needs-decision', 'summary': 'Proceed?'}]}}]}
        endpoint = {'address': 't30', 'created_ms': 12, 'state': 'live',
                    'labels': {'firstmate.home': 'firstmate-test', 'firstmate.task': 'fm-check'}}
        calls = []

        def call(argv, env):
            calls.append((argv, env))
            return snapshot if argv[-1] == '--json' else endpoint

        result = records.collect(request, call)
        self.assertEqual(result[0]['decisions'][0]['key'], 'confirm')
        self.assertEqual(result[0]['created_ms'], 12)
        self.assertEqual(calls[0][1]['FM_HOME'], '/home/fleet')
        for field, value in [('created_ms', 13), ('state', 'finished'), ('address', 't31')]:
            with self.subTest(field=field):
                previous = endpoint[field]
                endpoint[field] = value
                self.assertEqual(records.collect(request, call), [])
                endpoint[field] = previous
        endpoint['labels']['firstmate.home'] = 'another-home'
        self.assertEqual(records.collect(request, call), [])

    def test_rejects_malformed_nested_records(self):
        request = {'root': '/firstmate', 'home': '/home/fleet', 'label': 'home',
                   'workers': [{'address': 't1', 'created_ms': 12, 'task': 'fm-check'}]}
        task = {'id': 'check', 'backend': 'hc', 'endpoint': {'target': 'session:t1'},
                'current_state': {'state': 'parked'}, 'hints': {'open_decisions': []}}
        snapshot = {'schema': 'fm-fleet-snapshot.v1', 'fm_home': '/home/fleet', 'tasks': [task]}
        endpoint = {'address': 't1', 'created_ms': 12, 'state': 'live',
                    'labels': {'firstmate.home': 'home', 'firstmate.task': 'fm-check'}}
        for field, value in [('endpoint', None), ('current_state', None), ('hints', None),
                             ('hints', {'open_decisions': [{'verb': 'needs-decision'}]})]:
            with self.subTest(field=field, value=value):
                broken = copy.deepcopy(snapshot)
                broken['tasks'][0][field] = value
                with self.assertRaises(ValueError):
                    records.collect(request, lambda argv, _: broken if argv[-1] == '--json' else endpoint)
        for broken in [None, [], {'labels': None}]:
            with self.subTest(endpoint=broken), self.assertRaises(ValueError):
                records.collect(request, lambda argv, _: snapshot if argv[-1] == '--json' else broken)
        snapshot['tasks'] = [None]
        with self.assertRaises(ValueError):
            records.collect(request, lambda *_: snapshot)

    def test_rejects_wrong_home_schema_and_nonobject_snapshot(self):
        request = {'root': '/firstmate', 'home': '/home/fleet', 'label': 'home', 'workers': []}
        for snapshot in [None, [], {'schema': 'other', 'fm_home': '/home/fleet', 'tasks': []},
                         {'schema': 'fm-fleet-snapshot.v1', 'fm_home': '/other', 'tasks': []}]:
            with self.assertRaises(ValueError):
                records.collect(request, lambda *_: snapshot)


if __name__ == '__main__':
    unittest.main()
