import Agents from './herdr-agents.js';
import { div, image } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, shared, setShared, props, openOverlay, closeOverlay, theme, run, layout } from 'herdr';
import { identity, crews, assignCrew } from './artwork.js';

const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const save = patch => setShared('one-piece.art', { ...appearance(), ...patch });

function sidebar(node) {
  if (node?.id === 'sidebar') return node;
  for (const child of node?.children ?? []) {
    const found = sidebar(child);
    if (found) return found;
  }
}

function sprite(name, status, size, ship = false) {
  const state = status === 'working' ? 'working' : status === 'blocked' ? 'blocked' : 'idle';
  const suffix = ship ? '' : `-${state}`;
  return image(`mods/one-piece/assets/${name}${suffix}.${appearance().paused ? 'png' : 'gif'}`)
    .w(size).h(size).flex_none();
}

export default class OnePieceAgents extends Agents {
  init(p, cx) {
    if (props()?.appearance) {
      this.menuFocus = cx.focus_handle();
      this.menuFocus.focus();
      return;
    }
    if (props()?.view) return;
    super.init(p, cx);
  }

  root(terminal) {
    const visited = new Set();
    let root = terminal;
    while (terminal?.parent && !visited.has(terminal.address)) {
      visited.add(terminal.address);
      const parent = this.byAddress.get(terminal.parent);
      if (!parent) break;
      if (this.agentAddresses.has(parent.address)) root = parent;
      terminal = parent;
    }
    return root;
  }

  subRow(t, child, shown, compact) {
    this.child = child.t;
    try { return super.subRow(t, child, shown, compact); }
    finally { this.child = null; }
  }

  status(t, agent, compact = false) {
    const terminal = this.child ?? this.byAddress?.get(agent.address);
    if (!terminal || !['idle', 'working', 'blocked', 'done'].includes(agent.status)) return super.status(t, agent, compact);
    const root = this.root(terminal);
    const key = identity(root);
    const crew = crews[appearance().crews[key]] ?? crews.strawhat;
    const child = root.address !== terminal.address;
    const character = child ? appearance().characters[identity(terminal)]?.art ?? 'crew-pirate-blue' : `crew-${crew.captain}`;
    const status = agent.status === 'blocked' ? 'Needs you' : agent.status === 'done' ? 'Done' : agent.status;
    const row = h_flex().flex_none().gap(2).items_center()
      .tooltip(`${child ? 'Crewmate' : crew.name} · ${status}`)
      .accessibility_label(`${child ? 'Crewmate' : crew.name}, ${status}`);
    const rail = (sidebar(layout())?.size?.px ?? Infinity) < 160;
    if (!child && !rail) row.child(Button.new(`ship-${terminal.address}`).flex_none()
      .tooltip(`${crew.title}: fold crew; right-click to choose artwork`)
      .accessibility_label(`${crew.title}, toggle crew; Shift F10 chooses artwork`).tab_index(0)
      .on_key_down((event, cx) => {
        if (event.keystroke !== 'shift-f10') return;
        cx.stop_propagation();
        openOverlay({ mod: 'one-piece', kind: 'popup', width: 230, height: 230, props: { appearance: key } });
      })
      .on_click((_e, cx) => {
        cx.stop_propagation();
        this.folded.has(terminal.address) ? this.folded.delete(terminal.address) : this.folded.add(terminal.address);
        cx.notify();
      })
      .on_mouse_down('right', (_e, cx) => {
        cx.stop_propagation();
        openOverlay({ mod: 'one-piece', kind: 'popup', width: 230, height: 230, props: { appearance: key } });
      })
      .child(sprite(crew.ship, agent.status, 28, true)));
    return row.child(sprite(character, agent.status, rail ? 14 : 24)
      .when(agent.status === 'done', el => el.border_b(2).border_color(t.done)));
  }

  appearanceMenu() {
    const t = theme(), key = props().appearance;
    const menu = v_flex().size_full().p(8).gap(4).bg(t.popover).text_color(t.foreground).text_size(13);
    for (const [id, crew] of Object.entries(crews)) menu.child(Button.new(`crew-${id}`).accessibility_label(crew.name).tab_index(0).p(7).rounded(5)
      .when(id === 'strawhat', el => el.track_focus(this.menuFocus))
      .focus(el => el.bg(t.selected))
      .hover(el => el.bg(t.hover)).child(crew.name)
      .on_click(() => { save({ crews: { ...appearance().crews, [key]: id } }); closeOverlay(props().overlay); }));
    return menu.child(Button.new('motion').accessibility_label('Toggle animation').tab_index(0).p(7).child(appearance().paused ? 'Resume animation' : 'Pause animation')
      .on_click(() => { save({ paused: !appearance().paused }); closeOverlay(props().overlay); }));
  }

  render(cx) {
    if (props()?.appearance) return this.appearanceMenu();
    if (props()?.view) {
      const target = props().target;
      const terminal = terminals().find(t => t.address === target?.terminal && t.created_ms === target?.created && t.state === 'live');
      return v_flex().size_full().p(16).gap(8)
        .child(div().child('This older fleet view is retired. Use Herdr Spaces and Agents.'))
        .when(Boolean(terminal), el => el.child(Button.new('legacy-open').accessibility_label('Open terminal').tab_index(0).p(8).child('Open terminal')
          .on_click(() => run('terminal.peek', { terminal: terminal.address }))));
    }
    const all = terminals().filter(t => t.state === 'live');
    this.agentAddresses = new Set(agents().map(t => t.address));
    this.byAddress = new Map(all.map(t => [t.address, t]));
    let characters = appearance().characters;
    for (const root of all.filter(t => this.agentAddresses.has(t.address) && this.root(t) === t)) {
      const children = all.filter(t => t !== root && this.root(t) === root);
      if (!children.length) continue;
      characters = assignCrew(children, characters, { terminal: root.address, created: root.created_ms, crew: appearance().crews[identity(root)] ?? 'strawhat' });
    }
    if (JSON.stringify(characters) !== JSON.stringify(appearance().characters)) save({ characters });
    return super.render(cx);
  }
}
