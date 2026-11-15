"""Build the presentation adapter against the user's installed Herdr interface."""
import copy
import json
import re


def generate(agents_source, main_layout, spaces_source):
    """Decorate both native sidebar regions without merging their scroll containers."""
    required = ('init', 'render', 'status', 'subRow', 'tree')
    if ('export default class Agents extends View' not in agents_source
            or 'this.folded = new Set()' not in agents_source
            or any(not re.search(r'^  ' + name + r'\(', agents_source, re.M) for name in required)):
        raise ValueError('Unsupported Herdr Agents interface; keep the existing installation and update the One Piece adapter.')
    imports = re.findall(r'\bfrom\s+[\'"]([^\'"]+)', agents_source)
    if any(name not in ('herdr', 'gpui-kit', 'gpui-base') for name in imports):
        raise ValueError('Herdr Agents has new module dependencies; update the One Piece adapter before installing.')
    if ('export default class Spaces extends View' not in spaces_source
            or any(not re.search(r'^  ' + name + r'\(', spaces_source, re.M)
                   for name in ('init', 'render', 'row', 'compact', 'grouped', 'menu'))
            or any(not re.search(r'^export function ' + name + r'\(', spaces_source, re.M)
                   for name in ('glyph', 'tone'))):
        raise ValueError('Unsupported Herdr Spaces interface; keep the existing installation and update the One Piece adapter.')
    imports = re.findall(r'\bfrom\s+[\'"]([^\'"]+)', spaces_source)
    if any(name not in ('herdr', 'gpui-kit', 'gpui-base') for name in imports):
        raise ValueError('Herdr Spaces has new module dependencies; update the One Piece adapter before installing.')
    layout = copy.deepcopy(main_layout)
    layout['colors'] = {
        'background': '#101f25', 'canvas': '#102128', 'chrome': '#14272d',
        'surface': '#14272d', 'popover': '#203238', 'raised': '#203238',
        'hover': '#29454c', 'selected': '#29454c', 'border': '#344c51',
        'foreground': '#dce6e3', 'muted': '#9eb4b3', 'dim': '#9eb4b3',
        'accent': '#e8bd70', 'accent_foreground': '#101f25',
        **layout.get('colors', {}),
    }
    slots = []
    space_slots = []

    def visit(node, parent=None):
        if not isinstance(node, dict):
            raise ValueError('Invalid Herdr main layout node')
        if node.get('content', {}).get('mod') == 'agents':
            slots.append((node, parent))
        if node.get('content', {}).get('mod') == 'spaces':
            space_slots.append((node, parent))
        for child in node.get('children', []):
            visit(child, node)

    visit(layout)
    if len(slots) != 1 or len(space_slots) != 1 or slots[0][1] is not space_slots[0][1] or slots[0][1] is None:
        raise ValueError('Expected adjacent Spaces and Agents slots in Herdr main layout; update the One Piece adapter before installing.')
    for region, entries in (('spaces', space_slots), ('agents', slots)):
        content = entries[0][0]['content']
        content['mod'] = 'one-piece'
        content['props'] = {**content.get('props', {}), 'region': region}
    return {
        'mods/one-piece/herdr-agents.js': agents_source.encode('utf-8'),
        'mods/one-piece/herdr-spaces.js': spaces_source.encode('utf-8'),
        'layouts/one-piece.json': (json.dumps(layout, indent=2) + '\n').encode('utf-8'),
    }
