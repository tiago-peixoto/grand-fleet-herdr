"""Build the presentation adapter against the user's installed Herdr interface."""
import copy
import json
import re


def generate(agents_source, main_layout):
    """Keep upstream logic intact and replace only the Agents layout slot."""
    required = ('init', 'render', 'status', 'subRow', 'tree')
    if ('export default class Agents extends View' not in agents_source
            or 'this.folded = new Set()' not in agents_source
            or any(not re.search(r'^  ' + name + r'\(', agents_source, re.M) for name in required)):
        raise ValueError('Unsupported Herdr Agents interface; keep the existing installation and update the One Piece adapter.')
    imports = re.findall(r'\bfrom\s+[\'"]([^\'"]+)', agents_source)
    if any(name not in ('herdr', 'gpui-kit', 'gpui-base') for name in imports):
        raise ValueError('Herdr Agents has new module dependencies; update the One Piece adapter before installing.')
    layout = copy.deepcopy(main_layout)
    slots = []

    def visit(node):
        if not isinstance(node, dict):
            raise ValueError('Invalid Herdr main layout node')
        if node.get('content', {}).get('mod') == 'agents':
            slots.append(node)
        for child in node.get('children', []):
            visit(child)

    visit(layout)
    if len(slots) != 1:
        raise ValueError('Expected one Agents slot in Herdr main layout; update the One Piece adapter before installing.')
    slots[0]['content']['mod'] = 'one-piece'
    return {
        'mods/one-piece/herdr-agents.js': agents_source.encode('utf-8'),
        'layouts/one-piece.json': (json.dumps(layout, indent=2) + '\n').encode('utf-8'),
    }
