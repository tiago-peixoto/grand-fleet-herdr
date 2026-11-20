import Agents from './herdr-agents.js';
import Chrome from './herdr-chrome.js';
import Menu from './herdr-menu.js';
import Pane from './herdr-pane.js';
import Spaces, { glyph, tone } from './herdr-spaces.js';
import Tabs from './herdr-tabs.js';
import { div, image, svg } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, spaces, shared, setShared, props, openOverlay, closeOverlay, theme, run, hc, readTextFile, notify, setBadge, nextCommand } from 'herdr';
import { identity, crews, assignCrew, assignIslands, islandOf, releaseCrew, selectDefaultCrews, selectFleetCrews } from './artwork.js';
import CrewLookup from './lookup-view.js';
import { discoverCaptain } from './discovery.js';
import { captainSpaces, crewmembers, followedCaptains, genericFleets, managedCrew, machineOf } from './fleet.js';

const CREW_COLORS = {strawhat:'#e8b04b', redhair:'#d4483f', bigmom:'#e98fb8', beasts:'#9b7bd1', heart:'#e5d14a', whitebeard:'#6fb0e6', roger:'#d9a62b', kid:'#c9443a'};
const displayName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const captainLinks = () => ({...(shared('one-piece.captains') ?? {}), ...(shared('one-piece.discovered') ?? {})});
const save = patch => setShared('one-piece.art', { ...appearance(), ...patch });
const crewFor = terminal => crews[appearance().crews[identity(terminal)]] ?? crews.strawhat;
const live = address => terminals().find(terminal => terminal.address === address && terminal.state === 'live');
// The crewmember test from fleet.js, applied to one terminal so each icon avoids copying the terminal list.
const art = terminal => !terminal || !(terminal.program?.agent || agents().some(agent => agent.address === terminal.address)) ? null :
  captainLinks()[identity(terminal)] ? `crew-${crewFor(terminal).captain}` : appearance().characters[identity(terminal)]?.art ?? null;

function crewName(terminal) {
  const assigned = appearance().characters[identity(terminal)];
  return assigned?.number && !captainLinks()[identity(terminal)] ? `Pirate ${assigned.number}` : displayName(art(terminal).replace(/^crew-/, ''));
}

function describe(terminal, status) {
  const state = status === 'blocked' ? 'Needs you' : status === 'error' ? 'Error' : status === 'done' ? 'Done' : status ?? 'Unknown';
  return `${crewName(terminal)}${captainLinks()[identity(terminal)] ? ' · Firstmate captain' : ''} · ${state}`;
}

// Herdr's agents() reports an agent's own error as blocked, so only the terminal's word tells the two apart.
const statusOf = (terminal, listed) => terminal.status === 'error' ? 'error' : listed ?? terminal.status;

function portraitProgram(pane) {
  const face = art(live(pane?.terminal));
  return face ? {...pane.program, icon:`mods/one-piece/assets/portrait-${face}.png`, tint:false} : pane?.program;
}

class OnePieceTabs extends Tabs {
  program(pane) { return portraitProgram(pane); }
}

class OnePiecePane extends Pane {
  me() {
    const pane = super.me();
    return pane && {...pane, program:portraitProgram(pane)};
  }
}

class OnePieceChrome extends Chrome {
  logo() { return image(`mods/one-piece/assets/flag.${appearance().paused ? 'png' : 'gif'}`).size(32).flex_none(); }
  title() { return 'Grand Fleet'; }
}

function sprite(name, status, size, ship = false) {
  const state = ['working', 'blocked', 'error', 'done'].includes(status) ? status : 'idle';
  return image(`mods/one-piece/assets/${name}${ship ? '' : `-${state}`}.${appearance().paused ? 'png' : 'gif'}`)
    .w(size).h(size).flex_none();
}

function appearanceMenu(key) {
  openOverlay({mod:'one-piece', kind:'popup', width:390, height:430, props:{appearance:key}});
}

function flagDialog(flag) {
  openOverlay({mod:'one-piece', kind:'dialog', width:760, height:572, props:{flag}});
}

function lookupDialog(lookup) {
  openOverlay({mod:'one-piece', kind:'dialog', width:1000, height:720, props:{lookup}});
}

class FleetMenu extends Menu {
  items() {
    const items = super.items();
    items.splice(1, 0, ['Raise a new flag…', 'one-piece.appearance', {}], ['Crew lookup…', 'one-piece.lookup', {}]);
    return items;
  }

  choose(index, cx) {
    const action = this.items()[index]?.[1];
    if (!['one-piece.appearance', 'one-piece.lookup'].includes(action)) return super.choose(index, cx);
    closeOverlay(props().overlay);
    if (action === 'one-piece.lookup') lookupDialog({space:props().target.id});
    else flagDialog(props().shipSpace ? {space:props().shipSpace} : {captain:props().captain});
  }
}

class OnePieceSpaces extends Spaces {
  machineIcon(m, connected) {
    const island = islandOf(appearance().islands, m ?? '');
    // The margin keeps the 13 point box of Herdr's own icon, so the machine name and the rail's status badge stay where Herdr puts them.
    return island == null ? super.machineIcon(m, connected) :
      image(`mods/one-piece/assets/island-${island}${connected ? '' : '-fog'}.png`).size(16).m(-1.5).flex_none();
  }

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
    const leader = followedCaptains(terminals(), agents(), captainLinks()).get(space.id);
    if (leader) return crewFor(leader);
    return this.fleet(space) ? crews[appearance().spaceCrews?.[space.id]] : null;
  }

  portrait(terminal, art, label, t, listed) {
    return Button.new(`portrait-${identity(terminal)}`).tab_index(0).w(24).h(24).flex_none().rounded(4)
      .accessibility_label(`Open ${label}`).tooltip(label)
      .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_mouse_down('left', (_e, cx) => cx.stop_propagation())
      .on_mouse_up('left', (_e, cx) => cx.stop_propagation())
      .on_mouse_down('right', (_e, cx) => { cx.stop_propagation(); appearanceMenu(identity(terminal)); })
      .on_click((_e, cx) => { cx.stop_propagation(); run('agent.focus', {terminal:terminal.address}); })
      .child(sprite(art, statusOf(terminal, listed.get(terminal.address)), 24));
  }

  row(info, t) {
    const {w, i, g, tree} = info, captain = this.captain(w);
    const live = new Map(terminals().filter(terminal => terminal.state === 'live').map(terminal => [terminal.address, terminal]));
    const listed = new Map(agents().map(agent => [agent.address, agent.status]));
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
      const face = art(terminal);
      if (face) portraits.child(this.portrait(terminal, face,
        `${displayName(face.replace(/^crew-/, ''))} · ${terminal.title || terminal.address}`, t, listed));
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
            .child(captain ? this.portrait(captain, `crew-${crew.captain}`, `${displayName(crew.captain)} · ${w.name}`, t, listed) :
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
    if (props()?.lookup) {
      this.lookup = new CrewLookup();
      this.lookup.init(p, cx);
      return;
    }
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
    const Portraits = {tabs:OnePieceTabs, pane:OnePiecePane, brand:OnePieceChrome}[props()?.region];
    if (Portraits) {
      this.portraitView = new Portraits();
      // Herdr's workspace chrome has no init.
      this.portraitView.init?.(p, cx);
      return;
    }
    if (props()?.appearance || props()?.setup || props()?.flag) {
      this.flagPick = null;
      this.menuFocus = cx.focus_handle();
      this.menuFocus.focus();
      return;
    }
    if (props()?.view) return;
    super.init(p, cx);
    // Every shown copy of the mod receives key commands, so only the Agents list acts on them.
    cx.spawn(async () => { for (;;) if (await nextCommand() === 'attention') this.attend(); });
    this.discover(cx);
    cx.timer.every(10000, cx => this.discover(cx));
  }

  async close() {
    if (this.badge) setBadge(null);
  }

  attend() {
    const newest = status => agents().filter(agent => agent.status === status && !agent.focused).sort((a, b) => b.seq - a.seq)[0];
    const agent = newest('blocked') ?? newest('done');
    if (agent) run('agent.focus', {terminal:agent.address});
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

  icon(agent, size, color) {
    const terminal = live(agent.address), face = art(terminal);
    if (!face) return super.icon(agent, size, color);
    const status = statusOf(terminal, this.listed?.get(agent.address) ?? agent.status), label = describe(terminal, status);
    // The crewmember is drawn larger than the program icon it replaces so its pose stays readable.
    // The label keeps the status a screen reader used to get from Herdr's status mark.
    return div().flex_none().tooltip(label).accessibility_label(label)
      .on_mouse_down('right', (_e, cx) => { cx.stop_propagation(); appearanceMenu(identity(terminal)); })
      .child(sprite(face, status, size + 12));
  }

  showsStatus(agent) { return !art(live(agent.address)); }

  status(t, agent, compact = false) {
    // Only the rail, which has no icon column, still asks a crewmember's row for its mark, so there the crewmember is the mark.
    const terminal = live(agent.address), face = art(terminal);
    if (!face) return super.status(t, agent, compact);
    const status = statusOf(terminal, agent.status), label = describe(terminal, status);
    return h_flex().flex_none().items_center()
      .tooltip(label).accessibility_label(label)
      .on_mouse_down('right', (_e, cx) => { cx.stop_propagation(); appearanceMenu(identity(terminal)); })
      .child(sprite(face, status, 14));
  }

  appearanceMenu() {
    const t = theme(), key = props().appearance;
    const terminal = terminals().find(terminal => identity(terminal) === key && terminal.state === 'live');
    const menu = v_flex().size_full().p(8).gap(4).overflow_y_scrollbar().bg(t.popover).text_color(t.foreground).text_size(13);
    if (!terminal) return menu.child(div().child('This terminal is no longer available.'));
    if (captainLinks()[key]) {
      menu.child(Button.new('raise-flag').flex_none().accessibility_label('Raise a new flag').tab_index(0).p(7).rounded(5)
        .track_focus(this.menuFocus).focus(el => el.bg(t.selected)).hover(el => el.bg(t.hover)).child('Raise a new flag…')
        .on_click(() => { closeOverlay(props().overlay); flagDialog({captain:key}); }));
      if (!shared('one-piece.discovered')?.[key]) menu.child(Button.new('unlink-captain').flex_none().accessibility_label('Remove captain designation').tab_index(0).p(7).child('Remove captain designation')
        .on_click(() => { const links = {...(shared('one-piece.captains') ?? {})}; delete links[key]; setShared('one-piece.captains', links); closeOverlay(props().overlay); }));
    } else if (!this.spaceHasCaptain(terminal)) {
      menu.child(Button.new('mark-captain').flex_none().accessibility_label('This agent runs Firstmate').tab_index(0).track_focus(this.menuFocus).p(7)
        .child('This agent runs Firstmate')
        .on_click(() => { setShared('one-piece.captains', {...(shared('one-piece.captains') ?? {}), [key]:{}}); closeOverlay(props().overlay); }));
    }
    menu.child(Button.new('motion').flex_none().accessibility_label('Toggle animation').tab_index(0).p(7).child(appearance().paused ? 'Resume animation' : 'Pause animation')
      .on_click(() => { save({paused:!appearance().paused}); closeOverlay(props().overlay); }));
    return menu.child(Button.new('crew-lookup').flex_none().tab_index(0).p(7).rounded(5)
      .when(!captainLinks()[key] && this.spaceHasCaptain(terminal), el => el.track_focus(this.menuFocus))
      .accessibility_label('Crew lookup').child('Crew lookup…').hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => { closeOverlay(props().overlay); lookupDialog({target:key}); }));
  }

  spaceHasCaptain(terminal) {
    const space = agents().find(agent => agent.address === terminal.address)?.space;
    return space !== undefined && captainSpaces(terminals(), agents(), captainLinks()).has(space);
  }

  flagMenu() {
    const t = theme(), flag = props().flag, ids = Object.keys(crews);
    // A Space that follows a captain flies the captain's flag, so its flag menu changes the captain's crew.
    const captain = flag.captain ? terminals().find(terminal => identity(terminal) === flag.captain && terminal.state === 'live') :
      followedCaptains(terminals(), agents(), captainLinks()).get(flag.space);
    const captainKey = captain && identity(captain);
    const valid = captain ? captainLinks()[captainKey] : genericFleets(terminals(), agents(), captainLinks()).has(flag.space);
    const shell = v_flex().size_full().bg(t.popover).text_color(t.foreground).text_size(13);
    if (!valid) return shell.p(16).child(flag.captain ? 'This captain is no longer available.' : 'This space no longer has a fleet without a captain.');
    const spaceId = captain ? agents().find(agent => agent.address === captain.address)?.space : flag.space;
    const spaceName = spaces().find(space => space.id === spaceId)?.name ?? 'this fleet';
    const flying = captain ? ids.find(id => crews[id] === crewFor(captain)) : appearance().spaceCrews?.[flag.space];
    const captainCrews = crewmembers(terminals(), agents()).filter(terminal => captainLinks()[identity(terminal)])
      .map(terminal => appearance().crews[identity(terminal)]).filter(Boolean);
    // Generic fleets give the Straw Hats to Firstmate captains, the same rule selectFleetCrews applies.
    const locked = id => !captain && id === 'strawhat' && captainCrews.length > 0;
    const others = id => [...genericFleets(terminals(), agents(), captainLinks()).keys()]
      .filter(space => space !== spaceId && appearance().spaceCrews?.[space] === id).length +
      [...captainSpaces(terminals(), agents(), captainLinks())].filter(([space, terminal]) => space !== spaceId && appearance().crews[identity(terminal)] === id).length;
    // Key events can arrive before the next render, so handlers read the choice live instead of this render's copy.
    const picked = () => this.flagPick ?? (ids.includes(flying) && !locked(flying) ? flying : ids.find(id => !locked(id)));
    const pick = picked();
    const sail = id => {
      if (locked(id)) return;
      if (captain) {
        const characters = assignCrew(managedCrew(captain, terminals(), agents(), captainLinks()), appearance().characters,
          {terminal:captain.address, created:captain.created_ms, crew:id});
        save({crews:{...appearance().crews, [captainKey]:id}, manualCrews:{...appearance().manualCrews, [captainKey]:true}, characters});
      } else save({spaceCrews:{...appearance().spaceCrews, [flag.space]:id}});
      const crew = crews[id];
      notify({title:`The ${crew.title} sets sail`, body:`${crew.name} now fly over ${spaceName}`,
        icon:`mods/one-piece/assets/portrait-crew-${crew.captain}.png`});
      closeOverlay(props().overlay);
    };
    const badge = (text, bg, color) => div().absolute().top(8).px(8).h(19).flex().items_center().rounded(10)
      .text_size(11).font_semibold().bg(bg).text_color(color).child(text);
    const card = id => {
      const crew = crews[id], color = CREW_COLORS[id], chosen = id === pick, used = others(id);
      return v_flex().id(`flag-${id}`).flex_1().min_w(0).relative().rounded(12).overflow_hidden()
        .border(chosen ? 2 : 1).border_color(chosen ? color : t.border).bg(t.raised)
        .accessibility_label(`${crew.name}, ${crew.title}${locked(id) ? ', reserved for the captain' : ''}`)
        .when(locked(id), el => el.opacity(0.45))
        .when(!locked(id), el => el.cursor_pointer().hover(card => card.border_color(color))
          .on_click((_event, cx) => { this.flagPick = id; cx.notify(); }))
        .child(div().h(92).relative().flex().justify_center().items_end().overflow_hidden().bg('#0f3b55')
          .child(div().absolute().left(0).right(0).bottom(0).h(46).bg('#0b2737'))
          .child(div().absolute().left(0).right(0).top(0).bottom(0).bg(color + '30'))
          .child(sprite(crew.ship, 'idle', 84, true).relative()
            .when(!appearance().paused, ship => ship.loop('top', {from:3, to:-3, period:chosen ? 1200 : 2400}))))
        .child(h_flex().h(40).mt(-6).justify_center().relative()
          .children([crew.captain, ...crew.workers.slice(0, 3)].map(name => sprite(`crew-${name}`, 'working', 40).mx(-4))))
        .child(v_flex().px(12).pt(4).pb(10).gap(1)
          .child(div().truncate().font_semibold().text_size(14).child(crew.name))
          .child(div().truncate().text_size(12).text_color(t.muted).child(crew.title)))
        .when(id === flying && !locked(id), el => el.child(badge('Flying now', color, '#111111').left(8)))
        .when(locked(id), el => el.child(badge('Reserved for the captain', '#00000099', t.foreground).left(8)))
        .when(used > 0 && id !== flying && !locked(id), el => el.child(badge(`${used} fleet${used > 1 ? 's' : ''}`, '#00000099', t.foreground).right(8)));
    };
    const move = step => {
      let index = ids.indexOf(picked());
      do index = (index + step + ids.length) % ids.length; while (locked(ids[index]));
      this.flagPick = ids[index];
    };
    const key = kbd => div().px(5).rounded(4).border(1).border_b(2).border_color(t.border).text_color(t.foreground).text_size(12).child(kbd);
    return shell.id('flag-dialog').track_focus(this.menuFocus)
      .on_key_down((event, cx) => {
        const step = {right:1, left:-1, down:4, up:-4}[event.key];
        if (step) move(step);
        else if (event.key === 'enter') return sail(picked());
        else return;
        cx.notify();
      })
      .child(v_flex().px(22).pt(18).pb(10).gap(2)
        .child(div().text_size(12).text_color(t.accent).child(`${captain ? 'CAPTAIN' : 'FLEET'} · ${spaceName.toUpperCase()}`))
        .child(div().text_size(22).font_bold().child('Raise your flag')))
      .child(v_flex().id('flag-cards').flex_1().min_h(0).px(22).pt(8).pb(18).gap(12).overflow_y_scrollbar()
        .child(h_flex().gap(12).children(ids.slice(0, 4).map(card)))
        .child(h_flex().gap(12).children(ids.slice(4).map(card))))
      .child(h_flex().flex_none().px(22).py(12).gap(16).items_center().border_t(1).border_color(t.border).bg(t.chrome).text_color(t.muted)
        .child(h_flex().flex_1().min_w(0).gap(4).items_center()
          .children(['←', '→', '↑', '↓'].map(key)).child('choose ·').child(key('Enter')).child('set sail ·').child(key('Esc')).child('stay'))
        .child(Button.new('set-sail').tab_index(0).px(16).py(8).rounded(8).bg(t.accent).text_color('#1a1a1a').font_bold()
          .accessibility_label(`Set sail with the ${crews[pick].name}`).child('Set sail').on_click(() => sail(picked()))));
  }

  setupMenu() {
    const t = theme();
    const menu = v_flex().size_full().p(16).gap(8).bg(t.popover).text_color(t.foreground).text_size(13)
      .child(div().font_semibold().child('Crew appearance'))
      .child(div().child('Firstmate captains are detected automatically. Choose an agent to change its appearance.'));
    const active = spaces().find(space => space.active);
    const browse = active && (captainSpaces(terminals(), agents(), captainLinks()).has(active.id) || genericFleets(terminals(), agents(), captainLinks()).has(active.id));
    if (browse) menu.child(Button.new('lookup-selected-fleet').tab_index(0).track_focus(this.menuFocus).p(8).rounded(5)
      .accessibility_label(`Browse crew of ${active.name}`).child(`Crew lookup · ${active.name}`)
      .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => { closeOverlay(props().overlay); lookupDialog({space:active.id}); }));
    const list = v_flex().flex_1().min_h(0).gap(4).overflow_y_scrollbar();
    for (const [index, terminal] of crewmembers(terminals(), agents()).entries()) {
      const label = `${terminal.name || terminal.title || terminal.address} · ${machineOf(terminal) ?? 'local'}`;
      list.child(Button.new(`choose-${identity(terminal)}`).tab_index(0).p(8).rounded(5)
        .when(index === 0 && !browse, el => el.track_focus(this.menuFocus)).accessibility_label(label).child(label)
        .hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
        .on_click(() => { closeOverlay(props().overlay); appearanceMenu(identity(terminal)); }));
    }
    return menu.child(list).child(Button.new('close-appearance').tab_index(0).p(8).child('Close').on_click(() => closeOverlay(props().overlay)));
  }

  render(cx) {
    if (this.lookup) return this.lookup.render(cx);
    // Tab and pane copies only read the appearance, so they skip the crew bookkeeping below.
    if (this.portraitView) return this.portraitView.render(cx);
    if (!this.spacesView && !this.fleetMenu && !props()?.setup && !props()?.appearance && !props()?.flag && !props()?.view &&
        crewmembers(terminals(), agents()).map(identity).join('|') !== this.discoverySignature) this.discover(cx);
    const selected = selectDefaultCrews(terminals(), captainLinks(), appearance().crews, machines(), appearance());
    const roles = {...appearance().roles};
    for (const [key, captain] of Object.entries(captainLinks())) if (captain.role) roles[key] = captain.role;
    if (JSON.stringify(selected) !== JSON.stringify(appearance().crews) || JSON.stringify(roles) !== JSON.stringify(appearance().roles)) save({crews:selected,roles});
    if (this.fleetMenu) return this.fleetMenu.render(cx);
    if (this.spacesView) return this.spacesView.render(cx);
    if (props()?.setup) return this.setupMenu();
    if (props()?.appearance) return this.appearanceMenu();
    if (props()?.flag) return this.flagMenu();
    if (props()?.view) {
      const target = props().target;
      const terminal = terminals().find(t => t.address === target?.terminal && t.created_ms === target?.created && t.state === 'live');
      return v_flex().size_full().p(16).gap(8)
        .child(div().child('This older fleet view is retired. Use Herdr Spaces and Agents.'))
        .when(Boolean(terminal), el => el.child(Button.new('legacy-open').accessibility_label('Open terminal').tab_index(0).p(8).child('Open terminal')
          .on_click(() => run('terminal.peek', { terminal: terminal.address }))));
    }
    const blocked = agents().filter(agent => agent.status === 'blocked').length;
    if (blocked !== this.badge) setBadge((this.badge = blocked) ? String(blocked) : null);
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
    const followed = followedCaptains(terminals(), agents(), captainLinks());
    const spaceCrews = selectFleetCrews(settled ? [...fleets.keys()].filter(id => !followed.has(id)) : [], appearance().spaceCrews ?? {}, captainCrews,
      id => !followed.has(id) && retained(id));
    if (JSON.stringify(spaceCrews) !== JSON.stringify(appearance().spaceCrews ?? {})) save({spaceCrews});
    const islands = assignIslands(appearance().islands ?? {}, machines().map(machine => machine.name ?? ''));
    if (JSON.stringify(islands) !== JSON.stringify(appearance().islands ?? {})) save({islands});
    let characters = releaseCrew(appearance().characters, terminals(), machines());
    for (const [id, fleet] of fleets) {
      if (spaceCrews[id]) characters = assignCrew(fleet, characters, {terminal:`space:${id}`, created:0, crew:spaceCrews[id]});
    }
    for (const captain of members.filter(terminal => captainLinks()[identity(terminal)] && appearance().crews[identity(terminal)])) {
      // Workers in a following Space draw from the captain's roster, so both Spaces never show one character twice.
      const workers = [...fleets].filter(([id]) => followed.has(id) && identity(followed.get(id)) === identity(captain)).flatMap(([, fleet]) => fleet);
      characters = assignCrew([...managedCrew(captain, terminals(), agents(), captainLinks()), ...workers], characters,
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
