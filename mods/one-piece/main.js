import Agents from './herdr-agents.js';
import { div, image } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, spaces, panes, focused, layout, setAgentOrder, shared, setShared, props, openOverlay, closeOverlay, theme, run } from 'herdr';
import { identity, crews, assignCrew } from './artwork.js';
import { groupFleet, machineOf, workerHome } from './fleet.js';

const displayName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const captainLinks = () => shared('one-piece.captains') ?? {};
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
    if (props()?.appearance || props()?.setup) {
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
    const location = space?.name ?? agent?.space_name ?? 'Not in a workspace';
    const status = terminal.status === 'error' ? 'blocked' : terminal.status;
    const state = status === 'blocked' ? 'Needs you' : status === 'done' ? 'Done' : status ?? 'Unknown';
    return Button.new(`character-${terminal.address}`).tab_index(0).h(compact ? 42 : 58).px(compact ? 0 : 8).rounded(7)
      .accessibility_label(`${name}, ${state}, ${terminal.name || terminal.address}, ${location}`)
      .tooltip(`${name} · ${terminal.name || terminal.address} · ${state} · ${location}`)
      .when(selected, el => el.bg(t.selected)).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => {
        if (captain && agent) run('pane.focus', { pane: agent.pane });
        else if (placed) run('pane.focus', { terminal: terminal.address });
        else run('terminal.peek', { terminal: terminal.address });
      })
      .on_mouse_down('right', workspaceMenu)
      .on_key_down(event => { if (event.keystroke === 'shift-f10') workspaceMenu(); })
      .child(h_flex().w_full().items_center().gap(compact ? 0 : 8).when(compact, el => el.justify_center())
        .child(sprite(art, status, compact ? 32 : 44))
        .when(!compact, el => el.child(v_flex().flex_1().min_w(0).gap(3)
          .child(div().truncate().font_semibold().child(`${name} · ${terminal.name || terminal.address}`))
          .child(div().truncate().text_size(11).text_color(t.muted).child(location))))
        .when(!compact && (status === 'blocked' || status === 'done'), el => el.child(div().text_color(t[status]).child(state))));
  }

  fleet() {
    const compact = sidebarWidth() < 160;
    const t = theme(), model = groupFleet(terminals(), captainLinks());
    const allSpaces = spaces(), allPanes = panes();
    const nativeAgents = new Set(agents().map(agent => agent.address));
    const unassigned = model.ungrouped.filter(terminal =>
      workerHome(terminal) || terminal.program?.agent || terminal.status || nativeAgents.has(terminal.address));
    const unassignedAddresses = new Set(unassigned.map(terminal => terminal.address));
    const represented = new Set();
    const order = [];
    const content = v_flex().id('fleet-content').size_full().min_h(0).p(compact ? 4 : 8).gap(8);
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
    characters = assignCrew(unassigned.filter(terminal => !characters[identity(terminal)]), characters, {terminal: 'unassigned', created: 0, crew: 'strawhat'});
    for (const terminal of unassigned) {
      const pane = allPanes.find(p => p.terminal === terminal.address);
      const space = allSpaces.find(s => s.tabs?.some(tab => tab.id === pane?.tab));
      if (space) represented.add(space.id);
    }
    if (JSON.stringify(characters) !== JSON.stringify(appearance().characters)) save({characters});
    const known = machines();
    for (const machine of known) {
      const id = machine.name ?? null;
      const online = machine.layout === 'ready';
      const island = shared('one-piece.islands')?.[id ?? 'local'] ?? (id === null ? 'Water 7' : 'Wano');
      const section = v_flex().id(`fleet-machine-${id ?? 'local'}`).gap(4).flex_1().min_h(0)
        .child(h_flex().flex_none().px(compact ? 0 : 8).py(8).gap(8).items_center().when(compact, el => el.justify_center())
          .tooltip(`${island} · ${id ?? 'local'}`)
          .child(div().truncate().font_semibold().child(compact ? island.split(' ').map(word => word[0]).join('') : island))
          .when(!compact, el => el.child(div().text_color(t.dim).text_size(11).child(id ?? 'local'))));
      const body = v_flex().id(`fleet-machine-body-${id ?? 'local'}`).flex_1().min_h(0).gap(4).overflow_y_scrollbar();
      if (online) body.child(Button.new(`link-captain-${id ?? 'local'}`).tab_index(0).px(8).py(4)
        .accessibility_label(`Link captain on ${id ?? 'local'}`).tooltip('Link captain').child(compact ? '+' : 'Link captain')
        .on_click(() => openOverlay({mod:'one-piece',kind:'dialog',width:480,height:480,props:{setup:true,machine:id}})));
      if (!online) body.child(div().px(8).text_color(t.muted).tooltip(machine.layout === 'loading' ? 'Connecting' : 'Unavailable').child(compact ? (machine.layout === 'loading' ? '…' : 'Offline') : (machine.layout === 'loading' ? 'Connecting…' : 'Unavailable')));
      if (online) for (const group of model.groups.filter(g => g.machine === id)) {
        const key = identity(group.captain), crew = crews[appearance().crews[key]] ?? crews.strawhat;
        const open = !this.folded.has(group.captain.address);
        body.child(Button.new(`ship-${group.captain.address}`).tab_index(0).rounded(8).p(compact ? 0 : 6)
          .accessibility_label(`${crew.title}, ${open ? 'collapse' : 'expand'} crew`).tooltip(`${crew.title}; right-click to choose ship`)
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
          .on_click((_e, cx) => {
            open ? this.folded.add(group.captain.address) : this.folded.delete(group.captain.address);
            cx.notify();
          })
          .on_mouse_down('right', () => openOverlay({mod:'one-piece', kind:'popup', width:230, height:310, props:{appearance:key}}))
          .on_key_down((event) => { if (event.keystroke === 'shift-f10') openOverlay({mod:'one-piece', kind:'popup', width:230, height:310, props:{appearance:key}}); })
          .child(h_flex().w_full().items_center().gap(compact ? 0 : 8).when(compact, el => el.justify_center()).child(sprite(crew.ship, 'idle', compact ? 32 : 72, true))
            .when(!compact, el => el.child(v_flex().min_w(0).gap(4).child(div().truncate().font_semibold().child(crew.title))
              .child(div().text_color(t.dim).text_size(11).child(`${open ? '▾' : '▸'} ${group.workers.length} crewmates`))))));
        order.push(group.captain.address, ...group.workers.map(w => w.address));
        if (open) {
          body.child(this.character(group.captain, `crew-${crew.captain}`, displayName(crew.captain), true));
          for (const worker of group.workers) {
            const assigned = characters[identity(worker)];
            body.child(v_flex().pl(compact ? 0 : 18).child(this.character(worker, assigned.art,
              assigned.number ? `Pirate ${assigned.number}` : displayName(assigned.art.replace(/^crew-/, '')))));
          }
        }
      }
      const machineCrew = unassigned.filter(terminal => machineOf(terminal) === id);
      if (online && machineCrew.length) {
        if (!compact) body.child(div().px(8).py(4).text_color(t.muted).child('Unassigned crewmates'));
        for (const terminal of machineCrew) {
          const assigned = characters[identity(terminal)];
          body.child(this.character(terminal, assigned.art,
            assigned.number ? `Pirate ${assigned.number}` : displayName(assigned.art.replace(/^crew-/, ''))));
          order.push(terminal.address);
        }
      }
      for (const space of allSpaces.filter(s => (s.machine ?? null) === id && (!online || !represented.has(s.id)))) {
        body.child(Button.new(`space-${space.id}`).tab_index(0).px(compact ? 0 : 10).py(8).rounded(6).when(!compact, el => el.justify_start())
          .accessibility_label(`Workspace ${space.name}`).tooltip(space.name).when(space.active, el => el.bg(t.selected))
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected)).child(div().truncate().child(compact ? space.name.slice(0, 2) : space.name))
          .on_click(() => run('space.select', {id:space.id}))
          .on_mouse_down('right', () => openOverlay({mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:space.id}}})));
      }
      if (online) for (const terminal of model.ungrouped.filter(terminal =>
        machineOf(terminal) === id && !unassignedAddresses.has(terminal.address) &&
        !allPanes.some(pane => pane.terminal === terminal.address))) {
        const name = terminal.name || terminal.title || terminal.address;
        body.child(Button.new(`terminal-${terminal.address}`).tab_index(0).px(compact ? 0 : 10).py(8).rounded(6)
          .accessibility_label(`Terminal ${name}`).tooltip(name).when(!compact, el => el.justify_start())
          .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
          .child(div().truncate().child(compact ? name.slice(0, 2) : name))
          .on_click(() => run('terminal.peek', {terminal: terminal.address})));
        order.push(terminal.address);
      }
      for (const issue of model.ambiguous.filter(a => a.machine === id)) body.child(div().px(8).text_color(t.blocked).child(`Coordinator conflict: ${issue.home}`));
      section.child(body);
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
    menu.child(Button.new('edit-captain').accessibility_label('Edit captain link').tab_index(0).p(7).child('Edit captain link')
      .on_click(() => {
        const captain = terminals().find(terminal => identity(terminal) === key);
        closeOverlay(props().overlay);
        if (captain) openOverlay({mod:'one-piece',kind:'dialog',width:480,height:480,props:{setup:true,machine:machineOf(captain),captain:key}});
      }));
    menu.child(Button.new('unlink-captain').accessibility_label('Unlink captain').tab_index(0).p(7).child('Unlink captain')
      .on_click(() => { const links = {...captainLinks()}; delete links[key]; setShared('one-piece.captains',links); closeOverlay(props().overlay); }));
    return menu.child(Button.new('motion').accessibility_label('Toggle animation').tab_index(0).p(7).child(appearance().paused ? 'Resume animation' : 'Pause animation')
      .on_click(() => { save({ paused: !appearance().paused }); closeOverlay(props().overlay); }));
  }

  setupMenu() {
    const t = theme(), machine = props().machine ?? null;
    const available = terminals().filter(terminal => terminal.state === 'live' && machineOf(terminal) === machine);
    const key = this.selectedCaptain ?? props().captain;
    const captain = available.find(terminal => identity(terminal) === key && !terminal.labels?.['firstmate.task']);
    const menu = v_flex().size_full().p(16).gap(8).bg(t.popover).text_color(t.foreground).text_size(13)
      .child(div().font_semibold().child(`Link captain · ${machine ?? 'local'}`));
    const list = v_flex().id('captain-choices').flex_1().min_h(0).gap(4).overflow_y_scrollbar();
    let firstAction = true;
    const choose = (id, label, action) => {
      const button = Button.new(id).tab_index(0).p(8).rounded(5)
        .accessibility_label(label).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected)).child(label).on_click(action);
      if (firstAction) button.track_focus(this.menuFocus);
      firstAction = false;
      return button;
    };
    if (!captain) {
      menu.child(div().child('Choose the terminal running your coordinator.'));
      for (const terminal of available.filter(terminal => !terminal.labels?.['firstmate.task'])) {
        list.child(choose(`captain-${identity(terminal)}`, `${terminal.name || terminal.title || 'Terminal'} · ${terminal.address}`,
          (_event, cx) => { this.selectedCaptain = identity(terminal); this.setupError = null; this.menuFocus.focus(); cx.notify(); }));
      }
    } else {
      menu.child(div().child(`${captain.name || captain.address} · ${captain.address}`))
        .child(div().child('Choose its worker group, or link the captain alone.'))
        .child(div().text_color(t.muted).child('A group includes all workers with this label on this machine.'))
        .child(div().text_color(t.muted).child('If separate coordinators share a label, leave that group unlinked.'));
      const link = (home, cx) => {
        const current = terminals().find(terminal => identity(terminal) === key && terminal.state === 'live');
        const online = machines().some(item => (item.name ?? null) === machine && item.layout === 'ready');
        const conflict = groupFleet(terminals(), captainLinks()).groups.some(group =>
          identity(group.captain) !== key && group.machine === machine && home && captainLinks()[identity(group.captain)]?.home === home);
        const exists = home === null || terminals().some(terminal => terminal.state === 'live' && machineOf(terminal) === machine && workerHome(terminal) === home);
        if (!online || !current || current.labels?.['firstmate.task'] || conflict || !exists) {
          this.setupError = 'The selection changed or this group already has a captain. Choose again.';
          cx.notify();
          return;
        }
        setShared('one-piece.captains', {...captainLinks(), [key]:{home}});
        closeOverlay(props().overlay);
      };
      list.child(choose('captain-only', 'Captain only', (_event, cx) => link(null, cx)));
      for (const home of new Set(available.map(workerHome).filter(Boolean))) {
        const workers = available.filter(terminal => workerHome(terminal) === home);
        list.child(choose(`home-${home}`, `${home} · ${workers.length} workers`, (_event, cx) => link(home, cx)));
        list.child(div().px(8).text_color(t.muted).child(workers.map(worker => `${worker.labels['firstmate.task']} (${worker.address})`).join(', ')));
      }
      menu.child(choose('choose-other-captain', 'Choose another terminal', (_event, cx) => {
        this.selectedCaptain = ''; this.setupError = null; this.menuFocus.focus(); cx.notify();
      }));
    }
    menu.child(list);
    if (this.setupError) menu.child(div().text_color(t.blocked).child(this.setupError));
    return menu.child(choose('cancel-link', 'Cancel', () => closeOverlay(props().overlay)));
  }

  render(cx) {
    if (props()?.setup) return this.setupMenu();
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
