import test from 'node:test';
import assert from 'node:assert/strict';
import { captainSpaces, crewmembers, followedCaptains, genericFleets, managedCrew } from '../mods/one-piece/fleet.js';

const terminal = (address, extra = {}) => ({address, created_ms: 10, state: 'live', program: {agent: true}, ...extra});

test('all agents are crewmembers without ownership labels, excluding personal shells', () => {
  const a = terminal('t1'), b = terminal('remote/t1');
  const reported = terminal('t2', {program: {agent: false}});
  const shell = terminal('t3', {program: {shell: true}});
  assert.deepEqual(crewmembers([a, b, reported, shell, terminal('t4', {state: 'exited'})], [{address: 't2'}]), [a, b, reported]);
});

test('explicit Firstmate captain identifies its native space without associating workers', () => {
  const a = terminal('t1', {labels: {'firstmate.task': 'nested-instance'}});
  const source = [a, terminal('t2')], before = structuredClone(source);
  const agents = [{address: 't1', space: 's1'}, {address: 't2', space: 's2'}];
  assert.deepEqual([...captainSpaces(source, agents, {'t1:10': {home: 'legacy'}})], [['s1', a]]);
  assert.deepEqual(source, before);
});

test('captain mapping requires current live identity and an agent placement', () => {
  const agents = [{address: 't1', space: 's1'}];
  assert.equal(captainSpaces([terminal('t1', {created_ms: 11})], agents, {'t1:10': {}}).size, 0);
  assert.equal(captainSpaces([terminal('t1', {state: 'exited'})], agents, {'t1:10': {}}).size, 0);
  assert.equal(captainSpaces([terminal('t1')], [], {'t1:10': {}}).size, 0);
});

test('remote addresses remain distinct and the first native captain determines the ship', () => {
  const a = terminal('t1'), b = terminal('remote/t1'), c = terminal('t2');
  const agents = [{address:'t2',space:'s'}, {address:'t1',space:'s'}, {address:'remote/t1',space:'remote/s'}];
  assert.deepEqual([...captainSpaces([a,b,c], agents, {'t1:10':{}, 'remote/t1:10':{}, 't2:10':{}})], [['s',c], ['remote/s',b]]);
});

test('every captain summarizes its native Space, never labelled workers in other Spaces', () => {
  const captain = terminal('t1');
  const labels = {'firstmate.home':'crew', 'firstmate.task':'scout'};
  const neighbour = terminal('t2'), elsewhere = terminal('t3', {labels});
  const source = [captain, neighbour, elsewhere];
  const agents = [{address:'t1',space:'s'}, {address:'t2',space:'s'}, {address:'t3',space:'other'}];
  const before = structuredClone(source);
  for (const link of [{}, {home:'crew'}, {source:'session-lock'}]) {
    assert.deepEqual(managedCrew(captain, source, agents, {'t1:10':link}), [neighbour]);
  }
  assert.deepEqual(managedCrew({...captain,created_ms:11}, source, agents, {'t1:10':{}}), []);
  assert.deepEqual(managedCrew(captain, source, agents, {}), []);
  assert.deepEqual(source, before);
});

test('discovered captains use native Space membership, excluding other captains and personal shells', () => {
  const captain = terminal('t1'), worker = terminal('t2'), other = terminal('t3');
  const coCaptain = terminal('t4'), shell = terminal('t5');
  const agents = [{address:'t1',space:'s'}, {address:'t2',space:'s'}, {address:'t3',space:'other'}, {address:'t4',space:'s'}];
  const captains = {'t1:10':{source:'session-lock'},'t4:10':{source:'session-lock'}};
  assert.deepEqual(managedCrew(captain,[captain,worker,other,coCaptain,shell],agents,captains),[worker]);
  assert.deepEqual(managedCrew(coCaptain,[captain,worker,other,coCaptain,shell],agents,captains),[]);
});

test('the primary and then the oldest captain supply a shared ship regardless of tab order', () => {
  const old = terminal('t1', {created_ms: 5}), young = terminal('t2', {created_ms: 9}), primary = terminal('t3', {created_ms: 20});
  const agents = [{address:'t2',space:'s'}, {address:'t1',space:'s'}];
  assert.equal(captainSpaces([old, young], agents, {'t1:5':{}, 't2:9':{}}).get('s'), old);
  const withPrimary = [...agents, {address:'t3',space:'s'}];
  const captains = {'t1:5':{role:'secondmate'}, 't2:9':{}, 't3:20':{role:'firstmate'}};
  assert.equal(captainSpaces([old, young, primary], withPrimary, captains).get('s'), primary);
});

test('a space with one or more agents and no captain is a generic fleet', () => {
  const solo = terminal('t1'), pair = [terminal('t2'), terminal('t3')], captain = terminal('t4'), worker = terminal('t5');
  const shell = terminal('t6', {program: {shell: true}}), ended = terminal('t7', {state: 'exited'});
  const agents = [{address:'t1',space:'a'}, {address:'t2',space:'b'}, {address:'t3',space:'b'},
    {address:'t4',space:'c'}, {address:'t5',space:'c'}, {address:'t7',space:'d'}];
  const fleets = genericFleets([solo, ...pair, captain, worker, shell, ended], agents, {'t4:10':{}});
  assert.deepEqual([...fleets], [['a', [solo]], ['b', pair]]);
  assert.deepEqual([...genericFleets([solo, ...pair, captain, worker], agents, {})].map(([id]) => id), ['a', 'b', 'c']);
});

test('a Space of workers follows the detected captain whose home tag every worker carries', () => {
  const worker = (address, home) => terminal(address, {labels:{'firstmate.home':home, 'firstmate.task':'scout'}});
  const captain = terminal('t1'), own = worker('t2', 'firstmate-aa'), other = worker('t3', 'firstmate-bb'), plain = terminal('t4');
  const remote = terminal('vps/t1', {labels:{'firstmate.home':'firstmate-aa'}});
  const captains = {'t1:10':{source:'session-lock', home:'firstmate-aa'}};
  const follows = agents => [...followedCaptains([captain, own, other, plain, remote], agents, captains)].map(([space, leader]) => [space, leader.address]);
  const led = {address:'t1', space:'s'};
  assert.deepEqual(follows([led, {address:'t2', space:'fm-aa'}]), [['fm-aa', 't1']]);
  assert.deepEqual(follows([led, {address:'t2', space:'fm-aa'}, {address:'t4', space:'fm-aa'}]), [], 'one crewmate without the tag keeps the fleet generic');
  assert.deepEqual(follows([led, {address:'t3', space:'fm-bb'}]), [], 'another home stays a generic fleet');
  assert.deepEqual(follows([led, {address:'vps/t1', space:'vps/fm-aa'}]), [], 'the same tag on another machine is another home');
  assert.deepEqual(follows([led, {address:'t2', space:'s'}]), [], 'the captain Space itself is not a follower');
  assert.deepEqual([...followedCaptains([captain, own], [led, {address:'t2', space:'fm-aa'}], {'t1:10':{}})], [], 'a captain marked by hand has no home tag to match');
});
