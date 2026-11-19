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
                   for name in ('init', 'render', 'row', 'compact', 'grouped', 'menu', 'gitTail'))
            or any(not re.search(r'^export function ' + name + r'\(', spaces_source, re.M)
                   for name in ('glyph', 'tone'))):
        raise ValueError('Unsupported Herdr Spaces interface; keep the existing installation and update the One Piece adapter.')
    imports = re.findall(r'\bfrom\s+[\'"]([^\'"]+)', spaces_source)
    if any(name not in ('herdr', 'gpui-kit', 'gpui-base') for name in imports):
        raise ValueError('Herdr Spaces has new module dependencies; update the One Piece adapter before installing.')
    agents_source = hook(agents_source, 'export default class Agents extends View {',
                         'icon(agent, size, color) { return icon(agent.program, size, color); }\n'
                         '  showsStatus(agent) { return true; }',
                         {'icon(a.program, 16, t.foreground)': 'this.icon(a, 16, t.foreground)',
                          'icon(k.program, 14, t.foreground)': 'this.icon(k, 14, t.foreground)',
                          # A skipped child, not an empty one, so the row's gap does not leave space at its end.
                          '.child(this.status(t, a, byPriority && !isPinned))':
                          '.when(this.showsStatus(a), el => el.child(this.status(t, a, byPriority && !isPinned)))',
                          '.child(this.status(t, { status: st }, compact))':
                          '.when(this.showsStatus(k), el => el.child(this.status(t, { status: st }, compact)))'},
                         'Unsupported Herdr Agents rows; keep the existing installation and update the One Piece adapter.')
    spaces_source = hook(spaces_source, 'export default class Spaces extends View {',
                         'machineIcon(m, connected) { return svg(`mods/workspace-chrome/${m ? "server" : "monitor"}.svg`).size(13).flex_none(); }',
                         {'const icon = svg(`mods/workspace-chrome/${m ? "server" : "monitor"}.svg`).size(13).flex_none();':
                          'const icon = this.machineIcon(m, connected);'},
                         'Unsupported Herdr machine headers; keep the existing installation and update the One Piece adapter.')
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
    portrait_slots = []

    def visit(node, parent=None):
        if not isinstance(node, dict):
            raise ValueError('Invalid Herdr main layout node')
        if node.get('content', {}).get('mod') == 'tabs':
            portrait_slots.append((node['content'], 'tabs'))
        header = node.get('content', {}).get('pane', {}).get('header', {})
        if header.get('content', {}).get('mod') == 'pane':
            portrait_slots.append((header['content'], 'pane'))
        # The same native mod also draws the sidebar footer, which keeps Herdr's look.
        if node.get('content', {}).get('mod') == 'workspace-chrome' and not node['content'].get('props', {}).get('footer'):
            portrait_slots.append((node['content'], 'brand'))
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
    for content, region in portrait_slots:
        content['mod'] = 'one-piece'
        content['props'] = {**content.get('props', {}), 'region': region}
    return {
        'mods/one-piece/herdr-agents.js': agents_source.encode('utf-8'),
        'mods/one-piece/herdr-spaces.js': spaces_source.encode('utf-8'),
        'layouts/one-piece.json': (json.dumps(layout, indent=2) + '\n').encode('utf-8'),
    }


def generate_menu(source):
    """Expose native menu items for the additive fleet menu subclass."""
    marker = 'export default class Menu extends View {'
    if source.count(marker) != 1 or source.count('items(props(), this.git)') != 2:
        raise ValueError('Unsupported Herdr Menu interface; preserving installation')
    imports = re.findall(r"\bfrom\s+['\"]([^'\"]+)", source)
    if any(name not in ('herdr', 'gpui-kit', 'gpui-base') for name in imports):
        raise ValueError('Unsupported Herdr Menu dependencies; preserving installation')
    return source.replace('items(props(), this.git)', 'this.items()').replace(
        marker, marker + '\n  items() { return items(props(), this.git); }').encode('utf-8')


def hook(source, marker, method, replacements, error):
    """Route one native call through an overridable method, refusing sources that changed shape."""
    if source.count(marker) != 1 or any(source.count(old) != 1 for old in replacements):
        raise ValueError(error)
    for old, new in replacements.items():
        source = source.replace(old, new)
    return source.replace(marker, marker + '\n  ' + method)


def generate_portraits(tabs_source, pane_source):
    """Let tab and pane titles show each agent's crewmember instead of its program icon."""
    error = 'Unsupported Herdr {} interface; preserving installation'
    for name, source in (('Tabs', tabs_source), ('Pane', pane_source)):
        imports = re.findall(r"\bfrom\s+['\"]([^'\"]+)", source)
        if any(module not in ('herdr', 'gpui-kit', 'gpui-base') for module in imports):
            raise ValueError(error.format(name))
    if not re.search(r'^  me\(\) \{', pane_source, re.M) or pane_source.count('const p = this.me();') != 1:
        raise ValueError(error.format('Pane'))
    tabs = hook(tabs_source, 'export default class Tabs extends View {',
                'program(pane) { return pane?.program; }',
                {'const program = lead?.program;': 'const program = this.program(lead);'}, error.format('Tabs'))
    if 'export default class Pane extends View {' not in pane_source:
        raise ValueError(error.format('Pane'))
    return {'mods/one-piece/herdr-tabs.js': tabs.encode('utf-8'),
            'mods/one-piece/herdr-pane.js': pane_source.encode('utf-8')}


def generate_brand(chrome_source):
    """Let the sidebar header show the fleet's flag and name instead of Herdr's."""
    error = 'Unsupported Herdr workspace chrome interface; preserving installation'
    imports = re.findall(r"\bfrom\s+['\"]([^'\"]+)", chrome_source)
    if any(module not in ('herdr', 'gpui-kit', 'gpui-base') for module in imports):
        raise ValueError(error)
    logo = 'image("frame/welcome/herdr.png").size(20).rounded(5)'
    chrome = hook(chrome_source, 'export default class WorkspaceChrome extends View {',
                  'logo() { return ' + logo + '; }\n  title() { return "Herdr"; }',
                  {logo: 'this.logo()', '.child("Herdr")': '.child(this.title())'}, error)
    return {'mods/one-piece/herdr-chrome.js': chrome.encode('utf-8')}
