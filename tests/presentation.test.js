import test from 'node:test';
import assert from 'node:assert/strict';
import { captainSpaces, crewmembers } from '../mods/one-piece/fleet.js';

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
