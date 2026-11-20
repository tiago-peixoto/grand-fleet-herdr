import test from 'node:test';
import assert from 'node:assert/strict';
import { assignCrew, identity } from '../mods/one-piece/artwork.js';
import { lookupFleets, lookupPlan, applyLookup } from '../mods/one-piece/lookup.js';

function fixture() {
  const terminals = ['chart-room', 'lookout', 'stores'].map((name, index) =>
    ({address:`t${index}`, created_ms:10, name, state:'live', program:{agent:true}}));
  const home = {terminal:'space:sunny', created:0, crew:'strawhat'};
  return {terminals, agents:terminals.map((terminal, index) => ({address:terminal.address, space:index === 2 ? 'dock' : 'sunny'})),
    spaces:[{id:'sunny', name:'Thousand Sunny'}, {id:'dock', name:'Dry Dock'}], machines:[{name:null, layout:'ready'}], captains:{},
    appearance:{crews:{}, spaceCrews:{sunny:'strawhat', dock:'strawhat'},
      characters:assignCrew([terminals[2]], assignCrew(terminals.slice(0, 2), {}, home), {...home, terminal:'space:dock'})}};
}
const selection = {target:'t0:10', fleet:'sunny', character:'franky'};

test('a named swap shows both outcomes and applies both without changing another fleet', () => {
  const data = fixture(), before = structuredClone(data);
  const plan = lookupPlan(data, selection);
  assert.deepEqual(plan.changes, [
    {key:'t0:10', name:'chart-room', from:{art:'crew-chopper', number:null}, to:{art:'crew-franky', number:null}},
    {key:'t1:10', name:'lookout', from:{art:'crew-franky', number:null}, to:{art:'crew-chopper', number:null}},
  ]);
  const applied = applyLookup(data, selection, plan).characters;
  assert.equal(applied['t0:10'].art, 'crew-franky');
  assert.equal(applied['t1:10'].art, 'crew-chopper');
  assert.deepEqual(applied['t2:10'], data.appearance.characters['t2:10']);
  assert.deepEqual(data, before, 'browsing and previewing never mutate saved assignments');
});

test('free choices have one result, and swapping transfers the complete numbered Pirate', () => {
  const data = fixture();
  assert.equal(lookupPlan(data, {...selection, character:'nami'}).changes.length, 1);
  data.appearance.characters['t0:10'] = {...data.appearance.characters['t0:10'], art:'crew-pirate-cyan', number:6};
  const plan = lookupPlan(data, selection), result = applyLookup(data, selection, plan).characters;
  assert.deepEqual(plan.changes[1].to, {art:'crew-pirate-cyan', number:6});
  assert.equal(result['t1:10'].number, 6);
  assert.equal(result['t1:10'].art, 'crew-pirate-cyan');
});

test('captains, another fleet, unknown characters, and ship browsing cannot assign worker artwork', () => {
  const data = fixture();
  for (const other of [{target:null}, {fleet:'dock'}, {character:'luffy'}, {character:'pirate-blue'}, {character:'not-a-sprite'}]) {
    const picked = {...selection, ...other}, plan = lookupPlan(data, picked);
    assert.ok(plan.reason);
    assert.equal(applyLookup(data, picked, plan).characters, undefined);
  }
  data.captains[selection.target] = {};
  assert.match(lookupPlan(data, selection).reason, /Firstmate captain/);
});

test('every changed exchange requires a fresh confirmation, including an unseen third holder', () => {
  for (const change of [
    data => { data.terminals[0].created_ms++; },
    data => { data.terminals[0].state = 'finished'; },
    data => { data.terminals[0].program = {shell:true}; data.agents.shift(); },
    data => { data.machines[0].layout = 'unavailable'; },
    data => { data.agents[0].space = 'dock'; },
    data => { data.appearance.spaceCrews.sunny = 'redhair'; },
    data => { data.captains['t0:10'] = {}; },
    data => { data.terminals[1].state = 'finished'; },
    data => { data.agents[1].space = 'dock'; },
    data => { data.appearance.characters['t0:10'].art = 'crew-zoro'; },
    data => {
      data.terminals.push({...data.terminals[1], address:'t3', name:'rigging'});
      data.agents.push({address:'t3', space:'sunny'});
      data.appearance.characters['t3:10'] = {...data.appearance.characters['t1:10']};
      data.appearance.characters['t1:10'].art = 'crew-nami';
    },
  ]) {
    const data = fixture(), plan = lookupPlan(data, selection);
    change(data);
    const before = structuredClone(data);
    assert.equal(applyLookup(data, selection, plan).characters, undefined);
    assert.deepEqual(data, before);
  }
});

test('a changed original character can be confirmed only after showing the new result', () => {
  const data = fixture(), original = lookupPlan(data, selection);
  data.appearance.characters['t0:10'].art = 'crew-zoro';
  const revised = applyLookup(data, selection, original);
  assert.equal(revised.characters, undefined);
  assert.equal(revised.plan.changes[1].to.art, 'crew-zoro');
  assert.equal(applyLookup(data, selection, revised.plan).characters['t1:10'].art, 'crew-zoro');
});

test('a returning or offline holder reserves its character without preventing active named swaps', () => {
  const data = fixture(), before = lookupPlan(data, selection);
  data.appearance.characters = assignCrew([data.terminals[1]], data.appearance.characters,
    {terminal:'space:dock', created:0, crew:'strawhat'});
  data.agents[1].space = 'dock';
  assert.match(lookupPlan(data, selection).reason, /Reserved for returning mate/);
  assert.equal(applyLookup(data, selection, before).characters, undefined);
  data.terminals[1].state = 'finished';
  assert.match(lookupPlan(data, selection).reason, /Reserved for returning mate/);
});

test('captains sharing a Space retain separate catalogs, and unplaced mates keep their saved roster', () => {
  const data = fixture(), [first, second, unplaced] = data.terminals;
  data.captains = {[identity(first)]:{role:'firstmate'}, [identity(second)]:{role:'secondmate'}};
  data.appearance.crews = {[identity(first)]:'strawhat', [identity(second)]:'redhair'};
  data.agents = data.agents.filter(agent => agent.address !== unplaced.address);
  const fleets = lookupFleets(data);
  assert.deepEqual(fleets.map(fleet => [fleet.id, fleet.crew]), [
    ['sunny', 'strawhat'], ['captain:t1:10', 'redhair'], ['unplaced:space:dock:0:strawhat', 'strawhat'],
  ]);
  assert.equal(fleets[1].captain, second);
  assert.equal(fleets[2].members[0], unplaced);
  const picked = {target:identity(unplaced), fleet:fleets[2].id, character:'nami'};
  const plan = lookupPlan(data, picked);
  assert.equal(applyLookup(data, picked, plan).characters[identity(unplaced)].art, 'crew-nami');
});

test('following Spaces share the captain roster, with captain-free and offline fleets kept distinct', () => {
  const data = fixture();
  const captain = {...data.terminals[0], address:'captain', name:'Firstmate'};
  data.terminals.push(captain);
  data.agents.push({address:'captain', space:'dock'});
  data.captains[identity(captain)] = {home:'firstmate-abc', source:'session-lock'};
  data.appearance.crews[identity(captain)] = 'redhair';
  data.terminals.slice(0, 2).forEach(terminal => { terminal.labels = {'firstmate.home':'firstmate-abc'}; });
  const fleets = lookupFleets(data);
  assert.deepEqual(fleets.map(fleet => [fleet.id, fleet.crew, fleet.owner, fleet.captain?.address]), [
    ['sunny', 'redhair', 'captain:10:redhair', undefined], ['dock', 'redhair', 'captain:10:redhair', 'captain'],
  ]);
  data.machines[0].layout = 'unavailable';
  assert.deepEqual(lookupFleets(data), []);
});
