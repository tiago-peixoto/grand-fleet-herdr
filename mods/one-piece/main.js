import Agents from './herdr-agents.js';
import { div, image } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, spaces, panes, focused, layout, setAgentOrder, shared, setShared, props, openOverlay, closeOverlay, theme, run } from 'herdr';
import { identity, crews, assignCrew } from './artwork.js';
import { groupFleet } from './fleet.js';

const displayName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const save = patch => setShared('one-piece.art', { ...appearance(), ...patch });

function sidebarWidth(node = layout()) {
  if (node?.id === 'sidebar') return node.size?.px ?? Infinity;
  for (const child of node?.children ?? []) {
    const width = sidebarWidth(child);
    if (width !== Infinity) return width;
  }
  return Infinity;
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

  character(terminal, art, name, captain = false) {
    const compact = sidebarWidth() < 160;
    const t = theme(), agent = agents().find(a => a.address === terminal.address);
    const placed = panes().find(p => p.terminal === terminal.address);
    const space = spaces().find(space => space.tabs?.some(tab => tab.id === placed?.tab));
    const workspaceMenu = () => {
      if (space) openOverlay({mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:space.id}}});
    };
    const selected = focused()?.terminal === terminal.address;
    const state = terminal.status === 'blocked' ? 'Needs you' : terminal.status === 'done' ? 'Done' : terminal.status ?? 'Unknown';
    return Button.new(`character-${terminal.address}`).tab_index(0).h(compact ? 42 : 58).px(compact ? 0 : 8).rounded(7)
      .accessibility_label(`${name}, ${state}, ${terminal.name || terminal.address}`)
      .tooltip(`${name} · ${terminal.name || terminal.address} · ${state}`)
      .when(selected, el => el.bg(t.selected)).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => {
        if (captain && agent) run('pane.focus', { pane: agent.pane });
        else if (placed) run('pane.focus', { terminal: terminal.address });
        else run('terminal.peek', { terminal: terminal.address });
      })
      .on_mouse_down('right', workspaceMenu)
      .on_key_down(event => { if (event.keystroke === 'shift-f10') workspaceMenu(); })
      .child(h_flex().w_full().items_center().gap(compact ? 0 : 8).when(compact, el => el.justify_center())
        .child(sprite(art, terminal.status, compact ? 32 : 44))
        .when(!compact, el => el.child(v_flex().flex_1().min_w(0).gap(3)
          .child(div().truncate().font_semibold().child(name))
          .child(div().truncate().text_size(11).text_color(t.muted).child(terminal.name || terminal.address))))
        .when(!compact && (terminal.status === 'blocked' || terminal.status === 'done'), el => el.child(div().text_color(t[terminal.status]).child(state))));
  }

  fleet() {
    const compact = sidebarWidth() < 160;
    const t = theme(), model = groupFleet(terminals());
    const allSpaces = spaces(), allPanes = panes();
    const represented = new Set();
    const order = [];
    const content = v_flex().id('fleet-content').size_full().min_h(0).p(compact ? 4 : 8).gap(8).overflow_y_scrollbar().mode('always');
    let characters = appearance().characters;
    for (const group of model.groups) {
      const key = identity(group.captain), crew = appearance().crews[key] ?? 'strawhat';
      characters = assignCrew(group.workers, characters, {terminal: group.captain.address, created: group.captain.created_ms, crew});
      for (const terminal of [group.captain, ...group.workers]) {
        const pane = allPanes.find(p => p.terminal === terminal.address);
        const space = allSpaces.find(s => s.tabs?.some(tab => tab.id === pane?.tab));
        if (space) represented.add(space.id);
      }
    }
    if (JSON.stringify(characters) !== JSON.stringify(appearance().characters)) save({characters});
    const known = machines();
    for (const machine of known) {
      const id = machine.name ?? null;
      const online = machine.layout === 'ready';
      const island = shared('one-piece.islands')?.[id ?? 'local'] ?? (id === null ? 'Water 7' : 'Wano');
      const section = v_flex().gap(4).flex_none()
        .child(h_flex().px(compact ? 0 : 8).py(8).gap(8).items_center().when(compact, el => el.justify_center())
          .tooltip(`${island} · ${id ?? 'local'}`)
          .child(div().truncate().font_semibold().child(compact ? island.split(' ').map(word => word[0]).join('') : island))
          .when(!compact, el => el.child(div().text_color(t.dim).text_size(11).child(id ?? 'local'))));
      if (!online) section.child(div().px(8).text_color(t.muted).tooltip(machine.layout === 'loading' ? 'Connecting' : 'Unavailable').child(compact ? (machine.layout === 'loading' ? '…' : 'Offline') : (machine.layout === 'loading' ? 'Connecting…' : 'Unavailable')));
      if (online) for (const group of model.groups.filter(g => g.machine === id)) {
        const key = identity(group.captain), crew = crews[appearance().crews[key]] ?? crews.strawhat;
        const open = !this.folded.has(group.captain.address);
        section.child(Button.new(`ship-${group.captain.address}`).tab_index(0).rounded(8).p(compact ? 0 : 6)
          .accessibility_label(`${crew.title}, ${open ? 'collapse' : 'expand'} crew`).tooltip(`${crew.title}; right-click to choose ship`)
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
          .on_click((_e, cx) => {
            open ? this.folded.add(group.captain.address) : this.folded.delete(group.captain.address);
            cx.notify();
          })
          .on_mouse_down('right', () => openOverlay({mod:'one-piece', kind:'popup', width:230, height:230, props:{appearance:key}}))
          .on_key_down((event) => { if (event.keystroke === 'shift-f10') openOverlay({mod:'one-piece', kind:'popup', width:230, height:230, props:{appearance:key}}); })
          .child(h_flex().w_full().items_center().gap(compact ? 0 : 8).when(compact, el => el.justify_center()).child(sprite(crew.ship, 'idle', compact ? 32 : 72, true))
            .when(!compact, el => el.child(v_flex().min_w(0).gap(4).child(div().truncate().font_semibold().child(crew.title))
              .child(div().text_color(t.dim).text_size(11).child(`${open ? '▾' : '▸'} ${group.workers.length} crewmates`))))));
        order.push(group.captain.address, ...group.workers.map(w => w.address));
        if (open) {
          section.child(this.character(group.captain, `crew-${crew.captain}`, displayName(crew.captain), true));
          for (const worker of group.workers) {
            const assigned = characters[identity(worker)];
            section.child(v_flex().pl(compact ? 0 : 18).child(this.character(worker, assigned.art,
              assigned.number ? `Pirate ${assigned.number}` : displayName(assigned.art.replace(/^crew-/, '')))));
          }
        }
      }
      for (const space of allSpaces.filter(s => (s.machine ?? null) === id && (!online || !represented.has(s.id)))) {
        section.child(Button.new(`space-${space.id}`).tab_index(0).px(compact ? 0 : 10).py(8).rounded(6).when(!compact, el => el.justify_start())
          .accessibility_label(`Workspace ${space.name}`).tooltip(space.name).when(space.active, el => el.bg(t.selected))
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected)).child(div().truncate().child(compact ? space.name.slice(0, 2) : space.name))
          .on_click(() => run('space.select', {id:space.id}))
          .on_mouse_down('right', () => openOverlay({mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:space.id}}})));
      }
      if (online) for (const terminal of model.ungrouped.filter(terminal =>
        (terminal.address.includes('/') ? terminal.address.split('/')[0] : null) === id &&
        !allPanes.some(pane => pane.terminal === terminal.address))) {
        const name = terminal.name || terminal.title || terminal.address;
        section.child(Button.new(`terminal-${terminal.address}`).tab_index(0).px(compact ? 0 : 10).py(8).rounded(6)
          .accessibility_label(`Terminal ${name}`).tooltip(name).when(!compact, el => el.justify_start())
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
          .child(div().truncate().child(compact ? name.slice(0, 2) : name))
          .on_click(() => run('terminal.peek', {terminal: terminal.address})));
        order.push(terminal.address);
      }
      for (const issue of model.ambiguous.filter(a => a.machine === id)) section.child(div().px(8).text_color(t.blocked).child(`Coordinator conflict: ${issue.home}`));
      content.child(section);
    }
    setAgentOrder(order);
    return v_flex().size_full().min_h(0).bg(t.chrome).text_color(t.foreground).text_size(13).child(content);
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
    return this.fleet();
  }
}
