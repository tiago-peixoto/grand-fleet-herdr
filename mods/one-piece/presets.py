"""Rearrange existing Herdr panes with a version-checked document write."""
import copy
import json
import math
import subprocess
import sys
import uuid


def arrange(document, request):
    machine = request.get('machine')
    if machine is not None and (not isinstance(machine, str) or not machine):
        raise ValueError('Invalid machine.')

    def local(value):
        if not isinstance(value, str) or not value:
            raise ValueError('Missing pane or workspace identifier.')
        if machine:
            if not value.startswith(machine + '/'):
                raise ValueError('The pane belongs to another machine.')
            return value[len(machine) + 1:]
        return value

    if request.get('preset') not in ('daily', 'equal'):
        raise ValueError('Unknown grid preset.')
    result = copy.deepcopy(document)
    spaces = [s for s in result['spaces'] if s['id'] == local(request['space'])]
    tabs = [t for s in spaces for t in s['tabs'] if t['id'] == local(request['tab'])]
    if len(spaces) != 1 or len(tabs) != 1:
        raise ValueError('The workspace changed. Choose the preset again.')
    tab, leaves, ids = tabs[0], [], set()

    def visit(node):
        key = node.get('id')
        if not isinstance(key, str) or not key or key in ids:
            raise ValueError('The layout has missing or duplicate pane identifiers.')
        ids.add(key)
        if node.get('hidden') or node.get('min') is not None or node.get('max') is not None:
            raise ValueError('This layout has custom visibility or size constraints.')
        if node.get('type') == 'block':
            content = node.get('content', {})
            if bool(content.get('terminal')) == bool(content.get('mod')):
                raise ValueError('This pane type does not support grid presets.')
            leaf = copy.deepcopy(node)
            leaf.pop('size', None)
            leaves.append(leaf)
        elif node.get('type') in ('row', 'column') and set(node) <= {'id', 'type', 'children', 'size'}:
            for child in node['children']:
                visit(child)
        else:
            raise ValueError('This custom layout does not support grid presets.')

    visit(tab['root'])
    expected = {}
    for pane in request['panes']:
        key = local(pane['pane'])
        if key in expected:
            raise ValueError('Duplicate pane in the requested grid.')
        expected[key] = (local(pane['terminal']) if pane.get('terminal') else None, pane.get('mod'))
    actual = {leaf['id']: (leaf['content'].get('terminal'), leaf['content'].get('mod')) for leaf in leaves}
    if actual != expected or len(leaves) < 2:
        raise ValueError('The panes changed. Choose the preset again.')
    anchor = local(request['anchor'])
    if anchor not in actual:
        raise ValueError('The coordinator pane is no longer present.')
    leaves.sort(key=lambda leaf: leaf['id'] != anchor)

    def group(axis, children):
        return {'id': 'op-grid-' + uuid.uuid4().hex, 'type': axis, 'children': children}

    if request['preset'] == 'daily':
        tree = group('row', [leaves[0], group('column', leaves[1:])])
    else:
        columns = math.ceil(math.sqrt(len(leaves)))
        cells = list(leaves)
        while len(cells) % columns:
            cells.append(group('column', []))
        tree = group('column', [group('row', cells[i:i + columns]) for i in range(0, len(cells), columns)])
    tree['id'] = tab['root']['id']
    tab['root'] = tree
    return result


def rpc(method, params):
    requests = [{'jsonrpc': '2.0', 'id': 1, 'method': 'hello', 'params': {}},
                {'jsonrpc': '2.0', 'id': 2, 'method': method, 'params': params}]
    process = subprocess.run(['hc', 'connect'], text=True, capture_output=True, timeout=10,
                             input=''.join(json.dumps(r) + '\n' for r in requests))
    for line in process.stdout.splitlines():
        response = json.loads(line)
        if response.get('id') == 2:
            if 'error' in response:
                raise ValueError(response['error'].get('message', 'Herdr rejected the layout change.'))
            if process.returncode == 0:
                return response['result']
    raise ValueError('Herdr did not confirm the layout change. Check the workspace before trying again.')


def apply(request, call=rpc):
    params = {'name': 'herdr-app', 'on': request.get('machine')}
    current = call('doc.get', params)
    value = arrange(current['value'], request)
    result = call('doc.set', {**params, 'version': current['version'], 'value': value})
    version = result.get('version') if isinstance(result, dict) else None
    if type(version) is not int or not 0 <= version < 2**64:
        raise ValueError('Herdr did not confirm the layout change. Check the workspace before trying again.')
    return result


if __name__ == '__main__':
    try:
        print(json.dumps(apply(json.loads(sys.argv[1]))))
    except subprocess.TimeoutExpired:
        sys.exit('Herdr did not confirm the layout change in time. Check the workspace before trying again.')
    except (ValueError, KeyError, TypeError, IndexError, OSError) as error:
        sys.exit(str(error))
