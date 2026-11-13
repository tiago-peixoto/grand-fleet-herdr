"""Read firstmate's authoritative snapshot and verify its live hc endpoints."""
import json
import os
import re
import subprocess
import sys


def read_json(argv, env):
    result = subprocess.run(argv, env=env, capture_output=True, text=True, timeout=25)
    if result.returncode:
        raise ValueError(result.stderr.strip() or 'Firstmate records could not be read.')
    return json.loads(result.stdout)


def collect(request, call=read_json):
    root, home, label = (request.get(key) for key in ('root', 'home', 'label'))
    if not all(isinstance(path, str) and os.path.isabs(path) for path in (root, home)):
        raise ValueError('Firstmate root and operational home must be absolute paths.')
    if not isinstance(label, str) or not label:
        raise ValueError('Missing firstmate home label.')
    env = {k: v for k, v in os.environ.items() if not k.startswith('FM_')}
    # The isolated native lab pins its core explicitly through firstmate's supported overrides.
    env.update({k: os.environ[k] for k in ('FM_HC_BIN', 'FM_HC_SOCKET') if k in os.environ})
    env.update(FM_HOME=home, FM_ROOT_OVERRIDE=root, FM_CREW_STATE_NO_FORGE='1')
    snapshot = call([root + '/bin/fm-fleet-snapshot.sh', '--json'], env)
    if (not isinstance(snapshot, dict) or snapshot.get('schema') != 'fm-fleet-snapshot.v1'
            or os.path.realpath(snapshot.get('fm_home', '')) != os.path.realpath(home)
            or not isinstance(snapshot.get('tasks'), list)
            or any(not isinstance(task, dict) for task in snapshot['tasks'])):
        raise ValueError('Firstmate returned an unexpected snapshot schema or home.')
    rows = []
    for worker in request['workers']:
        tasks = [task for task in snapshot['tasks'] if 'fm-' + str(task.get('id')) == worker['task']
                 and task.get('backend') == 'hc' and not task.get('remote')]
        if len(tasks) != 1:
            continue
        task = tasks[0]
        if any(not isinstance(task.get(key), dict) for key in ('endpoint', 'current_state', 'hints')):
            raise ValueError('Firstmate returned invalid task details.')
        target = task['endpoint'].get('target')
        if not isinstance(target, str) or not re.fullmatch(r'[A-Za-z0-9_.-]+:t[0-9a-z]+', target):
            continue
        session, terminal = target.split(':')
        if terminal != worker['address']:
            continue
        script = ('source "$1/bin/fm-backend.sh"; source "$1/bin/backends/hc.sh"; '
                  'fm_backend_hc_cli "$2" get "$3"')
        endpoint = call(['bash', '-e', '-c', script, 'firstmate-records', root, session, terminal], env)
        if not isinstance(endpoint, dict) or not isinstance(endpoint.get('labels'), dict):
            raise ValueError('Firstmate returned an invalid terminal record.')
        labels = endpoint['labels']
        if (endpoint.get('address') != terminal or endpoint.get('state') != 'live'
                or endpoint.get('created_ms') != worker['created_ms']
                or labels.get('firstmate.home') != label or labels.get('firstmate.task') != worker['task']):
            continue
        state = task.get('current_state', {}).get('state')
        decisions = task.get('hints', {}).get('open_decisions')
        if state not in ('working', 'parked', 'done', 'blocked', 'paused', 'failed', 'unknown'):
            raise ValueError('Firstmate returned an unknown task state.')
        if not isinstance(decisions, list) or any(
                not isinstance(d, dict) or d.get('verb') not in ('needs-decision', 'blocked')
                or not all(isinstance(d.get(k), str) for k in ('key', 'summary')) for d in decisions):
            raise ValueError('Firstmate returned invalid open decisions.')
        rows.append({'address': terminal, 'created_ms': worker['created_ms'], 'task': worker['task'],
                     'state': state, 'decisions': decisions})
    return rows


if __name__ == '__main__':
    try:
        print(json.dumps(collect(json.loads(sys.argv[1]))))
    except (ValueError, KeyError, TypeError, OSError, subprocess.TimeoutExpired) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
