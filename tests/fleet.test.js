import test from 'node:test';
import assert from 'node:assert/strict';
import { groupFleet } from '../mods/one-piece/fleet.js';

const terminal = (address, labels = {}, extra = {}) => ({address, labels, state: 'live', created_ms: 12, ...extra});
const captain = (address, home = 'home-a') => terminal(address, {'firstmate.home.path': home, 'firstmate.role': 'coordinator'});
const worker = (address, home = 'home-a') => terminal(address, {'firstmate.home.path': home, 'firstmate.task': 'fm-1'});

test('explicit labels group independent workers without changing terminal records', () => {
  const leader = captain('t1'), mate = worker('t2');
  const personal = terminal('t3', {}, {parent: 't1', name: 'Luffy'});
  const source = [mate, personal, leader];
  const before = structuredClone(source);
  const result = groupFleet(source);
  assert.deepEqual(result.groups, [{captain: leader, workers: [mate], machine: null}]);
  assert.deepEqual(result.ungrouped, [personal]);
  assert.deepEqual(source, before);
});

test('identical home and task labels stay within their machine', () => {
  const local = captain('t1'), remote = captain('hz-server/t1');
  const localWorker = worker('t2'), remoteWorker = worker('hz-server/t2');
  const result = groupFleet([local, remote, remoteWorker, localWorker]);
  assert.deepEqual(result.groups, [
    {captain: local, workers: [localWorker], machine: null},
    {captain: remote, workers: [remoteWorker], machine: 'hz-server'},
  ]);
});

test('multiple coordinators leave their home ungrouped instead of guessing', () => {
  const source = [captain('t1'), captain('t2'), worker('t3')];
  const result = groupFleet(source);
  assert.deepEqual(result.groups, []);
  assert.deepEqual(result.ungrouped, source);
  assert.deepEqual(result.ambiguous, [{machine: null, home: 'home-a'}]);
});

test('exited coordinators cannot capture workers after restart', () => {
  const old = {...captain('t1'), state: 'exited'};
  const current = {...captain('t1'), created_ms: 20};
  const mate = worker('t2');
  assert.deepEqual(groupFleet([old, current, mate]).groups, [{captain: current, workers: [mate], machine: null}]);
});

test('missing labels and conflicting roles do not imply membership', () => {
  const leader = captain('t1');
  const source = [
    leader,
    terminal('t2', {'firstmate.home.path': 'home-a', 'firstmate.task': ''}),
    terminal('t3', {'firstmate.task': 'fm-1'}),
    worker('t4', 'other-home'),
    terminal('t5', {'firstmate.home.path': 'home-a', 'firstmate.role': 'coordinator', 'firstmate.task': 'fm-2'}),
  ];
  const result = groupFleet(source);
  assert.deepEqual(result.groups, [{captain: leader, workers: [], machine: null}]);
  assert.deepEqual(result.ungrouped, source.slice(1));
});


test('legacy home tags cannot claim a coordinator or its workers', () => {
  const source = [
    terminal('t1', {'firstmate.home': 'shared-root', 'firstmate.role': 'coordinator'}),
    terminal('t2', {'firstmate.home': 'shared-root', 'firstmate.task': 'fm-1'}),
  ];
  assert.deepEqual(groupFleet(source), {groups: [], ambiguous: [], ungrouped: source});
});

test('distinct canonical homes remain separate despite identical legacy tags', () => {
  const first = captain('t1', '/homes/first'), second = captain('t2', '/homes/second');
  const firstWorker = worker('t3', '/homes/first'), secondWorker = worker('t4', '/homes/second');
  const source = [first, second, firstWorker, secondWorker];
  for (const record of source) record.labels['firstmate.home'] = 'shared-root';
  assert.deepEqual(groupFleet(source).groups, [
    {captain: first, workers: [firstWorker], machine: null},
    {captain: second, workers: [secondWorker], machine: null},
  ]);
});
