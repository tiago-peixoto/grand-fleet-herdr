import test from 'node:test';
import assert from 'node:assert/strict';
import { groupFleet } from '../mods/one-piece/fleet.js';
import { identity } from '../mods/one-piece/artwork.js';

const terminal = (address, labels = {}, extra = {}) => ({address, labels, state: 'live', created_ms: 12, ...extra});
const worker = (address, home = 'firstmate-root') => terminal(address, {'firstmate.home': home, 'firstmate.task': 'fm-1'});
const links = (...pairs) => Object.fromEntries(pairs.map(([captain, home]) => [identity(captain), {home}]));

test('explicit mod choice groups stock Firstmate workers without mutating terminals', () => {
  const captain = terminal('t1'), mate = worker('t2'), personal = terminal('t3', {}, {parent:'t1', name:'Luffy'});
  const source = [mate, personal, captain], before = structuredClone(source);
  const result = groupFleet(source, links([captain, 'firstmate-root']));
  assert.deepEqual(result.groups, [{captain, workers:[mate], machine:null}]);
  assert.deepEqual(result.ungrouped, [personal]);
  assert.deepEqual(source, before);
});

test('stock labels alone cannot identify a captain', () => {
  const source = [terminal('t1'), worker('t2')];
  assert.deepEqual(groupFleet(source), {groups:[], ambiguous:[], ungrouped:source});
});

test('identical labels on different machines stay separate', () => {
  const local = terminal('t1'), remote = terminal('hz-server/t1');
  const a = worker('t2'), b = worker('hz-server/t2');
  assert.deepEqual(groupFleet([local, remote, b, a], links([local,'firstmate-root'],[remote,'firstmate-root'])).groups, [
    {captain:local, workers:[a], machine:null}, {captain:remote, workers:[b], machine:'hz-server'},
  ]);
});

test('competing captain choices preserve captains but leave workers ungrouped', () => {
  const a = terminal('t1'), b = terminal('t2'), mate = worker('t3');
  const result = groupFleet([a,b,mate], links([a,'firstmate-root'],[b,'firstmate-root']));
  assert.deepEqual(result.groups, [{captain:a,workers:[],machine:null},{captain:b,workers:[],machine:null}]);
  assert.deepEqual(result.ungrouped,[mate]);
  assert.deepEqual(result.ambiguous,[{machine:null,home:'firstmate-root'}]);
});

test('ended and reused terminal identities cannot inherit captain associations', () => {
  const old = terminal('t1'), replacement = terminal('t1', {}, {created_ms:20}), mate = worker('t2');
  assert.deepEqual(groupFleet([{...old,state:'exited'},replacement,mate], links([old,'firstmate-root'])).ungrouped,[replacement,mate]);
});

test('captain without a worker group stays usable and malformed workers remain ordinary', () => {
  const captain = terminal('t1'), mate = worker('t2');
  assert.deepEqual(groupFleet([captain,mate], links([captain,null])).groups,[{captain,workers:[],machine:null}]);
  const invalid = [terminal('t3',{'firstmate.home':'firstmate-root','firstmate.task':''}),worker('t4','other')];
  assert.deepEqual(groupFleet([captain,...invalid],links([captain,'firstmate-root'])).ungrouped, invalid);
});

test('a task terminal cannot become a captain through stale settings', () => {
  const mate = worker('t1');
  assert.deepEqual(groupFleet([mate],links([mate,'firstmate-root'])).ungrouped,[mate]);
});
