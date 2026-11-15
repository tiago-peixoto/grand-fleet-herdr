import Agents from './herdr-agents.js';
import Spaces, { glyph, tone } from './herdr-spaces.js';
import { div, image } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, layout, shared, setShared, props, openOverlay, closeOverlay, theme, run } from 'herdr';
import { identity, crews, assignCrew, releaseCrew } from './artwork.js';
import { captainSpaces, crewmembers, machineOf } from './fleet.js';

const displayName = name => name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
const appearance = () => shared('one-piece.art') ?? { crews: {}, characters: {}, paused: false };
const captainLinks = () => shared('one-piece.captains') ?? {};
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
  openOverlay({mod:'one-piece', kind:'popup', width:250, height:290, props:{appearance:key}});
}

class OnePieceSpaces extends Spaces {
  captain(space) {
    return captainSpaces(terminals(), agents(), captainLinks()).get(space.id);
  }

  row(info, t) {
    const native = super.row(info, t), captain = this.captain(info.w);
    if (!captain) return native;
    const crew = crewFor(captain);
    return h_flex().id(`ship-row-${info.w.id}`).flex_none().items_center().gap(2)
      .child(Button.new(`ship-${info.w.id}`).tab_index(0).w(64).h(56).rounded(8)
        .accessibility_label(`${crew.title}, select workspace ${info.w.name}`)
        .tooltip(`${crew.title} · ${info.w.name}`)
        .when(info.w.active, el => el.bg(t.selected)).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
        .on_click(() => run('space.select', {id:info.w.id}))
        .on_mouse_down('right', () => this.menu(info.w))
        .child(sprite(crew.ship, 'idle', 56, true)))
      .child(native.flex_1().min_w(0).h(56));
  }

  compact(info, t) {
    const captain = this.captain(info.w);
    if (!captain) return super.compact(info, t);
    const crew = crewFor(captain);
    return Button.new(`ship-${info.w.id}`).tab_index(0).h(36).flex_none().rounded(6).relative()
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
    if (props()?.region === 'spaces') {
      this.spacesView = new OnePieceSpaces();
      this.spacesView.init(p, cx);
      return;
    }
    if (props()?.appearance || props()?.setup) {
      this.menuFocus = cx.focus_handle();
      this.menuFocus.focus();
      return;
    }
    if (props()?.view) return;
    super.init(p, cx);
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
    const menu = v_flex().size_full().p(8).gap(4).bg(t.popover).text_color(t.foreground).text_size(13);
    if (!terminal) return menu.child(div().child('This terminal is no longer available.'));
    if (captainLinks()[key]) {
      for (const [id, crew] of Object.entries(crews)) menu.child(Button.new(`crew-${id}`).accessibility_label(crew.name).tab_index(0).p(7).rounded(5)
        .when(id === 'strawhat', el => el.track_focus(this.menuFocus)).focus(el => el.bg(t.selected)).hover(el => el.bg(t.hover)).child(crew.name)
        .on_click(() => { save({crews:{...appearance().crews, [key]:id}}); closeOverlay(props().overlay); }));
      menu.child(Button.new('unlink-captain').accessibility_label('Remove captain designation').tab_index(0).p(7).child('Remove captain designation')
        .on_click(() => { const links = {...captainLinks()}; delete links[key]; setShared('one-piece.captains', links); closeOverlay(props().overlay); }));
    } else {
      menu.child(Button.new('mark-captain').accessibility_label('This agent runs Firstmate').tab_index(0).track_focus(this.menuFocus).p(7)
        .child('This agent runs Firstmate')
        .on_click(() => { setShared('one-piece.captains', {...captainLinks(), [key]:{}}); closeOverlay(props().overlay); }));
    }
    return menu.child(Button.new('motion').accessibility_label('Toggle animation').tab_index(0).p(7).child(appearance().paused ? 'Resume animation' : 'Pause animation')
      .on_click(() => { save({paused:!appearance().paused}); closeOverlay(props().overlay); }));
  }

  setupMenu() {
    const t = theme();
    const menu = v_flex().size_full().p(16).gap(8).bg(t.popover).text_color(t.foreground).text_size(13)
      .child(div().font_semibold().child('Crew appearance'))
      .child(div().child('Choose an agent to identify its Firstmate instance or change its ship.'));
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
    if (this.spacesView) return this.spacesView.render(cx);
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
    const members = crewmembers(terminals(), agents());
    let characters = releaseCrew(appearance().characters, terminals(), machines());
    const survivors = members.map(terminal => characters[identity(terminal)]).filter(Boolean);
    characters = assignCrew(members.filter(terminal => !characters[identity(terminal)]), characters,
      {terminal:'crewmembers', created:0, crew:'strawhat'}, survivors);
    if (JSON.stringify(characters) !== JSON.stringify(appearance().characters)) save({characters});
    return super.render(cx).child(Button.new('crew-appearance').tab_index(0).flex_none().h(28)
      .accessibility_label('Crew appearance').tooltip('Choose captain and ship artwork').child('Crew')
      .on_click(() => openOverlay({mod:'one-piece', kind:'dialog', width:480, height:480, props:{setup:true}})));
  }
}
