import { div, image } from 'gpui-kit';
import { Button, h_flex, v_flex } from 'gpui-base';
import { agents, terminals, machines, spaces, shared, setShared, props, closeOverlay, theme } from 'herdr';
import { identity, crews, pirateColors, characterHolders } from './artwork.js';
import { lookupFleets, lookupPlan, applyLookup, characterName, mateName } from './lookup.js';

const states = ['idle', 'working', 'done', 'blocked', 'error'];
const snapshot = () => ({terminals:terminals(), agents:agents(), machines:machines(), spaces:spaces(),
  captains:{...(shared('one-piece.captains') ?? {}), ...(shared('one-piece.discovered') ?? {})},
  appearance:shared('one-piece.art') ?? {crews:{}, characters:{}, paused:false}});
const asset = name => `mods/one-piece/assets/${name}`;

export default class CrewLookup {
  init(_p, cx) {
    this.target = props().lookup.target;
    const data = snapshot(), fleets = lookupFleets(data);
    const fleet = fleets.find(fleet => fleet.id === props().lookup.space) ??
      fleets.find(fleet => fleet.captain && identity(fleet.captain) === this.target) ??
      fleets.find(fleet => fleet.members.some(terminal => identity(terminal) === this.target)) ?? fleets[0];
    this.fleet = fleet?.id;
    this.character = this.initialCharacter(fleet, data, this.target);
    this.frame = data.appearance.paused ? 0 : null;
    this.width = 1000;
    this.fleetFocus = cx.focus_handle();
    this.characterFocus = cx.focus_handle();
    this.fleetFocus.focus();
  }

  initialCharacter(fleet, data, target) {
    if (!fleet) return null;
    const key = target ?? (fleet.captain && identity(fleet.captain)) ?? identity(fleet.members[0]);
    const crew = crews[fleet.crew];
    if (data.captains[key]) return crew.captain;
    const current = data.appearance.characters[key]?.art.replace(/^crew-/, '');
    return [...crew.workers, ...pirateColors.map(color => `pirate-${color}`)].includes(current) ? current : crew.workers[0];
  }

  selection() { return {target:this.target, fleet:this.fleet, character:this.character}; }

  apply(expected, cx) {
    const data = snapshot(), result = applyLookup(data, this.selection(), expected);
    if (result.characters) {
      setShared('one-piece.art', {...data.appearance, characters:result.characters});
      this.message = 'Characters updated.';
    } else this.message = 'Assignments changed. Review the current result before confirming again.';
    cx.notify();
  }

  tabs(id, items, selected, focus, choose, t) {
    const move = (event, cx) => {
      const index = items.findIndex(item => item.id === (id === 'fleet-tabs' ? this.fleet : this.character));
      const next = event.key === 'home' ? 0 : event.key === 'end' ? items.length - 1 :
        event.key === 'left' ? (index - 1 + items.length) % items.length : event.key === 'right' ? (index + 1) % items.length : null;
      if (next === null || !items.length) return;
      choose(items[next].id);
      cx.stop_propagation();
      cx.notify();
    };
    return h_flex().id(id).role('tab_list').accessibility_label(id === 'fleet-tabs' ? 'Fleets' : 'Characters')
      .flex_none().flex_wrap().gap(4).p(5).rounded(8).border(1).border_color(t.border).bg(t.chrome)
      .on_key_down(move).children(items.map((item, index) => Button.new(`${id}-${item.id}`).role('tab')
        .tab_index(item.id === selected ? 0 : -1).selected(item.id === selected).set_position(index + 1, items.length)
        .when(item.id === selected, el => el.track_focus(focus).bg(t.selected))
        .px(9).py(6).rounded(5).border(1).border_color('#00000000').accessibility_label(item.label).child(item.label)
        .hover(el => el.bg(t.hover)).focus(el => el.border_color(t.accent))
        .on_click((_event, cx) => { choose(item.id); focus.focus(); cx.notify(); })));
  }

  preview(character, state, size) {
    if (this.frame === null) return image(asset(`crew-${character}-${state}.gif`)).w(size).h(size).flex_none();
    return div().w(size).h(size).flex_none().relative().overflow_hidden()
      .child(image(asset(`lookup/crew-${character}.png`)).absolute().w(size * 4).h(size * 5)
        .left(-this.frame * size).top(-states.indexOf(state) * size));
  }

  render(cx) {
    const data = snapshot(), fleets = lookupFleets(data), fleet = fleets.find(fleet => fleet.id === this.fleet), t = theme();
    const shell = v_flex().id('crew-lookup').size_full().bg(t.popover).text_color(t.foreground).text_size(13)
      .on_size_change((size, cx) => { this.width = size.width; cx.notify(); });
    const close = Button.new('lookup-close').tab_index(0).px(12).py(7).rounded(6).child('Close')
      .accessibility_label('Close crew lookup').hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click(() => closeOverlay(props().overlay));
    const body = v_flex().id('lookup-body').flex_1().min_h(0).overflow_y_scrollbar().p(20).gap(12);
    body.child(h_flex().items_center().justify_between().gap(12)
      .child(v_flex().gap(2).child(div().text_size(22).font_bold().child('Crew lookup'))
        .child(div().text_color(t.muted).child('128 px frames · preview only, never the live status'))).child(close));
    body.child(this.tabs('fleet-tabs', fleets.map(fleet => ({id:fleet.id, label:fleet.name})), this.fleet, this.fleetFocus,
      id => { this.fleet = id; this.character = this.initialCharacter(fleets.find(fleet => fleet.id === id), data); this.message = null; }, t));
    if (!fleet) return shell.child(body.child(div().child('This fleet is no longer available.')));
    const crew = crews[fleet.crew], names = [crew.captain, ...crew.workers, ...pirateColors.map(color => `pirate-${color}`)];
    if (!names.includes(this.character)) this.character = this.initialCharacter(fleet, data);
    body.child(this.tabs('character-tabs', names.map(id => ({id, label:characterName({art:`crew-${id}`})})), this.character, this.characterFocus,
      id => { this.character = id; this.message = null; }, t));
    const held = characterHolders(data.appearance.characters, fleet.owner, `crew-${this.character}`);
    const holders = fleets.filter(other => other.owner === fleet.owner).flatMap(other => other.members)
      .filter(terminal => held.includes(identity(terminal)) && data.appearance.characters[identity(terminal)]?.owner === fleet.owner && !data.captains[identity(terminal)]);
    const target = data.terminals.find(terminal => identity(terminal) === this.target);
    const wearing = holders.find(terminal => identity(terminal) === this.target) ?? (holders.length === 1 ? holders[0] : null);
    const name = characterName(wearing ? data.appearance.characters[identity(wearing)] : {art:`crew-${this.character}`});
    body.child(h_flex().flex_wrap().gap(8).items_center()
      .child(div().font_semibold().text_size(18).child(name))
      .child(div().text_color(t.muted).child(this.character === crew.captain ? 'Reserved for Firstmate' :
        held.length && !holders.length ? 'Reserved for returning mate' : holders.map(mateName).join(', ') || 'Available in this fleet')));
    const columns = Math.max(1, Math.min(5, Math.floor((this.width - 28) / 156)));
    const tileWidth = Math.floor((this.width - 40 - (columns - 1) * 12) / columns);
    body.child(h_flex().flex_wrap().gap(12).children(states.map(state => v_flex().w(tileWidth).flex_none().p(8).gap(6)
      .rounded(8).border(1).border_color(t.border).bg(t.raised).items_center()
      .child(div().font_semibold().child(state[0].toUpperCase() + state.slice(1)))
      .child(this.preview(this.character, state, 128))
      .child(h_flex().gap(6).items_center().child(this.preview(this.character, state, 28))
        .child(div().text_size(11).text_color(t.muted).child('Sidebar · 28 px'))))));
    const controls = h_flex().flex_none().flex_wrap().gap(6).items_center().child(div().text_color(t.muted).child('Hold frame'));
    for (const frame of [0, 1, 2, 3, null]) controls.child(Button.new(`lookup-frame-${frame}`).tab_index(0).px(12).py(7).rounded(5)
      .accessibility_label(frame === null ? 'Play loops' : `Hold frame ${frame + 1}`).selected(this.frame === frame)
      .when(this.frame === frame, el => el.bg(t.selected)).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .child(frame === null ? 'Play loops' : String(frame + 1))
      .on_click((_event, cx) => { this.frame = frame; cx.notify(); }));
    body.child(controls);
    const plan = lookupPlan(data, this.selection());
    const footer = v_flex().flex_none().p(16).gap(6).border_t(1).border_color(t.border).bg(t.chrome);
    if (target) footer.child(div().font_semibold().child(`Choosing for ${mateName(target)}`));
    if (this.message) footer.child(div().text_color(t.accent).child(this.message));
    if (plan.reason) footer.child(div().text_color(t.muted).child(plan.reason));
    for (const change of plan.changes ?? []) footer.child(div().child(`${change.name}: ${characterName(change.from)} → ${characterName(change.to)}`));
    const actions = h_flex().flex_wrap().gap(8);
    for (const holder of holders.filter(terminal => identity(terminal) !== this.target)) actions.child(Button.new(`lookup-inspect-${identity(holder)}`)
      .tab_index(0).px(12).py(8).rounded(6).border(1).border_color(t.border).child(`Inspect ${mateName(holder)}`)
      .accessibility_label(`Inspect ${mateName(holder)}`).hover(el => el.bg(t.hover)).focus(el => el.bg(t.selected))
      .on_click((_event, cx) => { this.target = identity(holder); this.message = null; cx.notify(); }));
    if (plan.changes) actions.child(Button.new('lookup-apply').tab_index(0).px(14).py(8).rounded(6).bg(t.accent).text_color(t.accent_foreground)
      .font_semibold().accessibility_label(plan.changes.length === 2 ? 'Confirm named swap' : `Use ${name}`)
      .child(plan.changes.length === 2 ? 'Confirm named swap' : `Use ${name}`).on_click((_event, cx) => this.apply(plan, cx)));
    return shell.child(body).child(footer.child(actions));
  }
}
