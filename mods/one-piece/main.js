import Agents from './herdr-agents.js';
import Menu from './herdr-menu.js';
import Spaces, { glyph, tone } from './herdr-spaces.js';
import { div, image, svg } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, spaces, layout, shared, setShared, props, openOverlay, closeOverlay, theme, run, hc, readTextFile } from 'herdr';
import { identity, crews, assignCrew, releaseCrew, selectDefaultCrews, selectFleetCrews } from './artwork.js';
import { discoverCaptain } from './discovery.js';
import { captainSpaces, crewmembers, genericFleets, managedCrew, machineOf } from './fleet.js';

const displayName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const captainLinks = () => ({...(shared('one-piece.captains') ?? {}), ...(shared('one-piece.discovered') ?? {})});
const save = patch => setShared('one-piece.art', { ...appearance(), ...patch });
const crewFor = terminal => crews[appearance().crews[identity(terminal)]] ?? crews.strawhat;

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
  return image(`mods/one-piece/assets/${name}${ship ? '' : `-${state}`}.${appearance().paused ? 'png' : 'gif'}`)
    .w(size).h(size).flex_none();
}

function appearanceMenu(key) {
  openOverlay({mod:'one-piece', kind:'popup', width:390, height:430, props:{appearance:key}});
}

class FleetMenu extends Menu {
  items() {
    const items = super.items();
    items.splice(1, 0, ['Choose ship and crew', 'one-piece.appearance', {}]);
    return items;
  }

  choose(index, cx) {
    if (this.items()[index]?.[1] !== 'one-piece.appearance') return super.choose(index, cx);
    closeOverlay(props().overlay);
    if (props().shipSpace) openOverlay({mod:'one-piece', kind:'popup', width:390, height:430, props:{shipSpace:props().shipSpace}});
    else appearanceMenu(props().captain);
  }
}

class OnePieceSpaces extends Spaces {
  menu(space) {
    const captain = this.captain(space);
    if (!captain && !this.fleet(space)) return super.menu(space);
    openOverlay({mod:'one-piece', kind:'popup', width:230, height:300,
      props:{fleetMenu:true, tab:'space', target:{id:space.id}, ...(captain ? {captain:identity(captain)} : {shipSpace:space.id})}});
  }

  captain(space) {
    return captainSpaces(terminals(), agents(), captainLinks()).get(space.id);
  }

  fleet(space) {
    return genericFleets(terminals(), agents(), captainLinks()).get(space.id);
  }

  ship(space) {
    const captain = this.captain(space);
    if (captain) return crewFor(captain);
    return this.fleet(space) ? crews[appearance().spaceCrews?.[space.id]] : null;
  }

  portrait(terminal, art, label, t) {
    return Button.new(`portrait-${identity(terminal)}`).tab_index(0).w(24).h(24).flex_none().rounded(4)
      .accessibility_label(`Open ${label}`).tooltip(label)
      .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_mouse_down('left', (_e, cx) => cx.stop_propagation())
      .on_mouse_up('left', (_e, cx) => cx.stop_propagation())
      .on_click((_e, cx) => { cx.stop_propagation(); run('agent.focus', {terminal:terminal.address}); })
      .child(sprite(art, terminal.status, 24));
  }

  row(info, t) {
    const {w, i, g, tree} = info, captain = this.captain(w);
    const live = new Map(terminals().filter(terminal => terminal.state === 'live').map(terminal => [terminal.address, terminal]));
    const members = captain ? managedCrew(captain, terminals(), agents(), captainLinks()) : [...(this.fleet(w) ?? [])];
    if (captain) {
      for (const agent of agents()) {
        const terminal = live.get(agent.address);
        if (agent.space === w.id && terminal && terminal.address !== captain.address && captainLinks()[identity(terminal)] && !members.includes(terminal)) {
          members.push(terminal);
        }
      }
    }
    if (!captain && !members.length) return super.row(info, t);
    const crew = this.ship(w);
    const portraits = h_flex().gap(2).items_center().overflow_hidden();
    for (const terminal of members) {
      const key = identity(terminal);
      const art = captainLinks()[key] ? `crew-${crewFor(terminal).captain}` : appearance().characters[key]?.art;
      if (art) portraits.child(this.portrait(terminal, art,
        `${displayName(art.replace(/^crew-/, ''))} · ${terminal.title || terminal.address}`, t));
    }
    const fromIndex = this.pressed === null ? -1 : spaces().findIndex(space => space.id === this.pressed);
    return v_flex().id(`space-${w.id}`).relative().px(8).h(64).mb(6).flex_none().justify_center().rounded(8)
      .accessibility_label(`${crew ? `${crew.title}, ` : ''}${w.name}, ${members.length} crewmembers`)
      .when(w.active, el => el.bg(t.selected)).when(!w.active, el => el.hover(s => s.bg(t.hover)))
      .when(this.pressed === w.id && this.over !== w.id, el => el.opacity(0.5))
      .when(this.pressed !== null && this.over === w.id && this.pressed !== w.id, el => el.child(
        div().absolute().left(0).right(0).h(2).bg(t.accent)
          .when(fromIndex < i, line => line.bottom(0)).when(fromIndex > i, line => line.top(0))))
      .on_mouse_down('left', () => { this.pressed = w.id; this.over = w.id; })
      .on_mouse_move((_e, cx) => {
        const source = spaces().find(space => space.id === this.pressed);
        const over = source && (source.machine ?? null) === (w.machine ?? null) ? w.id : null;
        if (this.pressed !== null && this.over !== over) { this.over = over; cx.notify(); }
      })
      .on_mouse_up('left', (_e, cx) => {
        const from = this.pressed, over = this.over;
        this.pressed = null; this.over = null;
        if (from !== null && over === w.id && from !== w.id) {
          const index = spaces().findIndex(space => space.id === w.id);
          if (index !== -1) run('space.move', {id:from, index:index + 1});
        } else if (from === w.id) run('space.select', {id:w.id});
        cx.notify();
      })
      .on_mouse_down('right', () => this.menu(w))
      .child(h_flex().gap(10).items_center()
        .when(Boolean(tree), el => el.pl(22).child(svg('mods/workspace-chrome/branch.svg').size(13).text_color(t.dim)))
        .when(Boolean(crew), el => el.child(sprite(crew.ship, 'idle', 48, true)))
        .child(v_flex().flex_1().min_w(0).gap(2)
          .child(h_flex().items_center().gap(8)
            .child(captain ? this.portrait(captain, `crew-${crew.captain}`, `${displayName(crew.captain)} · ${w.name}`, t) :
              div().flex_initial().min_w(48).truncate().text_color(t.foreground).child(w.name))
            .child(g ? this.gitTail(g, tree, w.name, t) : div().flex_1()))
          .child(portraits)));
  }

  compact(info, t) {
    const crew = this.ship(info.w);
    if (!crew) return super.compact(info, t);
    return Button.new(`ship-${info.w.id}`).tab_index(0).h(36).mb(6).flex_none().rounded(6).relative()
      .accessibility_label(`${crew.title}, select workspace ${info.w.name}`)
      .tooltip(`${crew.title} · ${info.w.name}`)
      .when(info.w.active, el => el.bg(t.selected)).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => run('space.select', {id:info.w.id}))
      .on_mouse_down('right', () => this.menu(info.w))
      .child(sprite(crew.ship, 'idle', 32, true))
      .child(div().absolute().right(5).text_color(tone(t, info.w.status)).child(glyph(info.w.status)));
  }
}

export default class OnePieceAgents extends Agents {
  init(p, cx) {
    if (props()?.fleetMenu) {
      this.fleetMenu = new FleetMenu();
      this.fleetMenu.init(p, cx);
      return;
    }
    if (props()?.region === 'spaces') {
      this.spacesView = new OnePieceSpaces();
      this.spacesView.init(p, cx);
      return;
    }
    if (props()?.appearance || props()?.setup || props()?.shipSpace) {
      this.menuFocus = cx.focus_handle();
      this.menuFocus.focus();
      return;
    }
    if (props()?.view) return;
    super.init(p, cx);
    this.discover(cx);
    cx.timer.every(10000, cx => this.discover(cx));
  }

  discover(cx) {
    const pendingCaptains = this.pendingCaptains ??= new Set();
    const candidates = crewmembers(terminals(), agents());
    this.discoverySignature = candidates.map(identity).join('|');
    const eligible = new Set(candidates.map(identity));
    const found = {...(shared('one-piece.discovered') ?? {})};
    for (const terminal of terminals()) {
      if (!eligible.has(identity(terminal))) delete found[identity(terminal)];
    }
    if (JSON.stringify(found) !== JSON.stringify(shared('one-piece.discovered') ?? {})) setShared('one-piece.discovered', found);
    for (const candidate of candidates) {
      const key = identity(candidate);
      if (pendingCaptains.has(key)) continue;
      pendingCaptains.add(key);
      if (!this.checkedCaptains?.has(key) && !this.firstChecks?.has(key)) {
        (this.firstChecks ??= new Map()).set(key, Date.now());
        cx.timer.after(5000, cx => cx.notify());
      }
      cx.spawn(async cx => {
        try {
          const result = await hc(['get', candidate.address, '--json']);
          if (result.code !== 0) return;
          const terminal = JSON.parse(result.stdout);
          if (terminal.created_ms !== candidate.created_ms) return;
          const link = await discoverCaptain({...terminal, address:candidate.address}, readTextFile);
          const latest = await hc(['get', candidate.address, '--json']);
          if (latest.code !== 0) return;
          const current = JSON.parse(latest.stdout);
          if (current.created_ms !== terminal.created_ms || current.foreground?.pid !== terminal.foreground?.pid ||
              current.foreground?.cwd !== terminal.foreground?.cwd ||
              !crewmembers(terminals(), agents()).some(t => identity(t) === key)) return;
          const discovered = {...(shared('one-piece.discovered') ?? {})};
          if (link) discovered[key] = link;
          else delete discovered[key];
          if (JSON.stringify(discovered) !== JSON.stringify(shared('one-piece.discovered') ?? {})) setShared('one-piece.discovered', discovered);
        } catch (_) { /* Keep the last evidence when a machine cannot be read. */ }
        finally {
          pendingCaptains.delete(key);
          (this.checkedCaptains ??= new Set()).add(key);
          cx.notify();
        }
      });
    }
  }

  subRow(t, entry, shown, compact) {
    // Native subrows pass only status, so retain identity while their status cell renders.
    this.subTerminal = entry.t;
    try { return super.subRow(t, entry, shown, compact); }
    finally { this.subTerminal = null; }
  }

  status(t, agent, compact = false) {
    const terminal = this.subTerminal ?? terminals().find(terminal => terminal.address === agent.address && terminal.state === 'live');
    if (!terminal) return super.status(t, agent, compact);
    const captain = captainLinks()[identity(terminal)];
    const assigned = appearance().characters[identity(terminal)];
    const art = captain ? `crew-${crewFor(terminal).captain}` : assigned?.art;
    if (!art) return super.status(t, agent, compact);
    const name = assigned?.number && !captain ? `Pirate ${assigned.number}` : displayName(art.replace(/^crew-/, ''));
    const state = agent.status === 'blocked' ? 'Needs you' : agent.status === 'done' ? 'Done' : agent.status ?? 'Unknown';
    return h_flex().flex_none().items_center().gap(4).relative()
      .tooltip(`${name}${captain ? ' · Firstmate captain' : ''} · ${state}`)
      .on_mouse_down('right', () => appearanceMenu(identity(terminal)))
      .child(sprite(art, agent.status, sidebarWidth() < 160 ? 14 : 24))
      .when(compact && agent.status === 'done', el => el.child(div().absolute().top(0).right(0).size(6).rounded(3).bg(t.done)))
      .when(!compact && (agent.status === 'blocked' || agent.status === 'done'), el => el.child(div().text_size(10.5).text_color(t[agent.status]).child(state)));
  }

  appearanceMenu() {
    const t = theme(), key = props().appearance;
    const terminal = terminals().find(terminal => identity(terminal) === key && terminal.state === 'live');
    const menu = v_flex().size_full().p(8).gap(4).overflow_y_scrollbar().bg(t.popover).text_color(t.foreground).text_size(13);
    if (!terminal) return menu.child(div().child('This terminal is no longer available.'));
    if (captainLinks()[key]) {
      for (const [id, crew] of Object.entries(crews)) menu.child(Button.new(`crew-${id}`).flex_none().accessibility_label(crew.name).tab_index(0).p(7).rounded(5)
        .when(id === 'strawhat', el => el.track_focus(this.menuFocus)).focus(el => el.bg(t.selected)).hover(el => el.bg(t.hover)).child(`${crew.title} · ${crew.name}`)
        .on_click(() => {
          const characters = assignCrew(managedCrew(terminal, terminals(), agents(), captainLinks()), appearance().characters,
            {terminal:terminal.address, created:terminal.created_ms, crew:id});
          save({crews:{...appearance().crews, [key]:id}, manualCrews:{...appearance().manualCrews,[key]:true}, characters});
          closeOverlay(props().overlay);
        }));
      if (!shared('one-piece.discovered')?.[key]) menu.child(Button.new('unlink-captain').flex_none().accessibility_label('Remove captain designation').tab_index(0).p(7).child('Remove captain designation')
        .on_click(() => { const links = {...(shared('one-piece.captains') ?? {})}; delete links[key]; setShared('one-piece.captains', links); closeOverlay(props().overlay); }));
    } else if (!this.spaceHasCaptain(terminal)) {
      menu.child(Button.new('mark-captain').flex_none().accessibility_label('This agent runs Firstmate').tab_index(0).track_focus(this.menuFocus).p(7)
        .child('This agent runs Firstmate')
        .on_click(() => { setShared('one-piece.captains', {...(shared('one-piece.captains') ?? {}), [key]:{}}); closeOverlay(props().overlay); }));
    }
    return menu.child(Button.new('motion').flex_none().accessibility_label('Toggle animation').tab_index(0).p(7).child(appearance().paused ? 'Resume animation' : 'Pause animation')
      .on_click(() => { save({paused:!appearance().paused}); closeOverlay(props().overlay); }));
  }

  spaceHasCaptain(terminal) {
    const space = agents().find(agent => agent.address === terminal.address)?.space;
    return space !== undefined && captainSpaces(terminals(), agents(), captainLinks()).has(space);
  }

  shipMenu() {
    const t = theme(), id = props().shipSpace;
    const menu = v_flex().size_full().p(8).gap(4).overflow_y_scrollbar().bg(t.popover).text_color(t.foreground).text_size(13);
    if (!genericFleets(terminals(), agents(), captainLinks()).has(id)) return menu.child(div().child('This space no longer has a fleet without a captain.'));
    const current = appearance().spaceCrews?.[id];
    for (const [crewId, crew] of Object.entries(crews)) menu.child(Button.new(`ship-crew-${crewId}`).flex_none().accessibility_label(crew.name).tab_index(0).p(7).rounded(5)
      .when(crewId === (current ?? 'strawhat'), el => el.track_focus(this.menuFocus)).focus(el => el.bg(t.selected)).hover(el => el.bg(t.hover)).child(`${crew.title} · ${crew.name}`)
      .on_click(() => {
        save({spaceCrews:{...appearance().spaceCrews, [id]:crewId}});
        closeOverlay(props().overlay);
      }));
    return menu;
  }

  setupMenu() {
    const t = theme();
    const menu = v_flex().size_full().p(16).gap(8).bg(t.popover).text_color(t.foreground).text_size(13)
      .child(div().font_semibold().child('Crew appearance'))
      .child(div().child('Firstmate captains are detected automatically. Choose an agent to change its appearance.'));
    const list = v_flex().flex_1().min_h(0).gap(4).overflow_y_scrollbar();
    for (const [index, terminal] of crewmembers(terminals(), agents()).entries()) {
      const label = `${terminal.name || terminal.title || terminal.address} · ${machineOf(terminal) ?? 'local'}`;
      list.child(Button.new(`choose-${identity(terminal)}`).tab_index(0).p(8).rounded(5)
        .when(index === 0, el => el.track_focus(this.menuFocus)).accessibility_label(label).child(label)
        .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
        .on_click(() => { closeOverlay(props().overlay); appearanceMenu(identity(terminal)); }));
    }
    return menu.child(list).child(Button.new('close-appearance').tab_index(0).p(8).child('Close').on_click(() => closeOverlay(props().overlay)));
  }

  render(cx) {
    if (!this.spacesView && !this.fleetMenu && !props()?.setup && !props()?.appearance && !props()?.shipSpace && !props()?.view &&
        crewmembers(terminals(), agents()).map(identity).join('|') !== this.discoverySignature) this.discover(cx);
    const selected = selectDefaultCrews(terminals(), captainLinks(), appearance().crews, machines(), appearance());
    const roles = {...appearance().roles};
    for (const [key, captain] of Object.entries(captainLinks())) if (captain.role) roles[key] = captain.role;
    if (JSON.stringify(selected) !== JSON.stringify(appearance().crews) || JSON.stringify(roles) !== JSON.stringify(appearance().roles)) save({crews:selected,roles});
    if (this.fleetMenu) return this.fleetMenu.render(cx);
    if (this.spacesView) return this.spacesView.render(cx);
    if (props()?.setup) return this.setupMenu();
    if (props()?.appearance) return this.appearanceMenu();
    if (props()?.shipSpace) return this.shipMenu();
    if (props()?.view) {
      const target = props().target;
      const terminal = terminals().find(t => t.address === target?.terminal && t.created_ms === target?.created && t.state === 'live');
      return v_flex().size_full().p(16).gap(8)
        .child(div().child('This older fleet view is retired. Use Herdr Spaces and Agents.'))
        .when(Boolean(terminal), el => el.child(Button.new('legacy-open').accessibility_label('Open terminal').tab_index(0).p(8).child('Open terminal')
          .on_click(() => run('terminal.peek', { terminal: terminal.address }))));
    }
    const members = crewmembers(terminals(), agents());
    const fleets = genericFleets(terminals(), agents(), captainLinks());
    const known = new Set(spaces().map(space => space.id));
    const online = new Set(machines().filter(machine => machine.layout === 'ready').map(machine => machine.name ?? null));
    const retained = id => known.has(id) || !online.has(id.includes('/') ? id.split('/')[0] : null);
    const captainCrews = members.map(terminal => captainLinks()[identity(terminal)] && selected[identity(terminal)]).filter(Boolean);
    // Straw Hats belong to a live captain, so new fleets wait for each crewmember's first discovery,
    // but no longer than five seconds, because one unanswered check would otherwise hold back every new fleet.
    const settled = [...this.pendingCaptains ?? []].every(key =>
      this.checkedCaptains?.has(key) || Date.now() - (this.firstChecks?.get(key) ?? Date.now()) >= 5000);
    const spaceCrews = selectFleetCrews(settled ? [...fleets.keys()] : [], appearance().spaceCrews ?? {}, captainCrews, retained);
    if (JSON.stringify(spaceCrews) !== JSON.stringify(appearance().spaceCrews ?? {})) save({spaceCrews});
    let characters = releaseCrew(appearance().characters, terminals(), machines());
    for (const [id, fleet] of fleets) {
      if (spaceCrews[id]) characters = assignCrew(fleet, characters, {terminal:`space:${id}`, created:0, crew:spaceCrews[id]});
    }
    for (const captain of members.filter(terminal => captainLinks()[identity(terminal)] && appearance().crews[identity(terminal)])) {
      characters = assignCrew(managedCrew(captain, terminals(), agents(), captainLinks()), characters,
        {terminal:captain.address, created:captain.created_ms, crew:appearance().crews[identity(captain)]});
    }
    const survivors = members.map(terminal => characters[identity(terminal)]).filter(Boolean);
    characters = assignCrew(members.filter(terminal => !characters[identity(terminal)]), characters,
      {terminal:'crewmembers', created:0, crew:'strawhat'}, survivors);
    if (JSON.stringify(characters) !== JSON.stringify(appearance().characters)) save({characters});
    return super.render(cx).child(Button.new('crew-appearance').tab_index(0).flex_none().h(28)
      .accessibility_label('Crew appearance').tooltip('Choose captain and ship artwork').child('Crew')
      .on_click(() => openOverlay({mod:'one-piece', kind:'dialog', width:480, height:480, props:{setup:true}})));
  }
}
