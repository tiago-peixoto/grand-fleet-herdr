import test from 'node:test';
import assert from 'node:assert/strict';
import { fleet, assignCharacters, inspectionTarget } from '../mods/one-piece/fleet.js';

const machines = [{name:null,layout:'ready'},{name:'hz-server',layout:'ready'}];
const terminal = (address, labels = {}, extra = {}) => ({address,created_ms:12,state:'live',labels,status:null,name:address,space:'space',tab:'tab',...extra});
const registration = {terminal:'t1',created:12,home:'home-a',role:'firstmate'};

test('worker home labels bind only on the coordinator machine', () => {
  const result = fleet([terminal('t1'),terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'}),terminal('hz-server/t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'})], machines, [registration]);
  assert.deepEqual(result[0].coordinators[0].workers.map(t=>t.address),['t2']);
  assert.deepEqual(result[1].unassigned.map(t=>t.address),['hz-server/t2']);
});

test('offline machines never expose stale sessions or live worker actions', () => {
  const result=fleet([terminal('hz-server/t1')],[{name:'hz-server',layout:'unavailable'}],[{...registration,terminal:'hz-server/t1'}]);
  assert.deepEqual(result[0].coordinators,[]);
  assert.deepEqual(result[0].independent,[]);
  assert.equal(result[0].state,'unavailable');
});

test('reused terminal ids do not inherit coordinator authority', () => {
  const result=fleet([terminal('t1',{}, {created_ms:99})], machines,[registration]);
  assert.equal(result[0].coordinators.length,0);
  assert.equal(result[0].independent.length,1);
  assert.equal(result[0].missing.length,1);
});

test('ambiguous home registration never assigns workers to an arbitrary coordinator', () => {
  const result=fleet([terminal('t1'),terminal('t3'),terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'})],machines,[registration,{...registration,terminal:'t3'}]);
  assert.equal(result[0].unassigned.length,1);
  assert.equal(result[0].coordinators.flatMap(c=>c.workers).length,0);
});

test('character assignments survive departures and support unlimited numbered pirates', () => {
  const original=assignCharacters([terminal('t2'),terminal('t3'),terminal('t4')],{});
  const next=assignCharacters([terminal('t3'),terminal('t4'),terminal('t5')],original);
  assert.deepEqual(next['t3:12'],original['t3:12']);
  assert.deepEqual(next['t5:12'],{art:'pirate',number:2});
});

test('inspection rejects stale identities, unavailable machines, and ordinary shells', () => {
  const worker=terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'});
  assert.equal(inspectionTarget([worker],machines,[],{terminal:'t2',created:12})?.address,'t2');
  assert.equal(inspectionTarget([worker],machines,[],{terminal:'t2',created:13}),null);
  assert.equal(inspectionTarget([terminal('t2')],machines,[],{terminal:'t2',created:12}),null);
  assert.equal(inspectionTarget([worker],[{name:null,layout:'unavailable'}],[],{terminal:'t2',created:12}),null);
});

test('native terminal locations come from panes and spaces, not terminal fields or stale labels', async () => {
  const { withLocations } = await import('../mods/one-piece/fleet.js');
  const raw=[{address:'hz-server/t1',labels:{'herdr.space':'old'}},{address:'t2',labels:{'herdr.space':'old'}}];
  const result=withLocations(raw,[{terminal:'hz-server/t1',tab:'hz-server/tab-a'}],[{id:'hz-server/space-a',tabs:[{id:'hz-server/tab-a'}]}]);
  assert.equal(result[0].space,'hz-server/space-a');
  assert.equal(result[0].tab,'hz-server/tab-a');
  assert.equal(result[1].space,undefined);
  assert.equal(raw[0].space,undefined);
});

test('a registered secondmate is not also listed as a worker', () => {
  const mate=terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'});
  const result=fleet([terminal('t1'),mate],machines,[registration,{terminal:'t2',created:12,home:'home-b',role:'secondmate'}]);
  assert.deepEqual(result[0].coordinators[0].workers,[]);
  assert.equal(result[0].coordinators[1].session.address,'t2');
});

test('missing creation identities never authorize inspection', () => {
  const worker=terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'},{created_ms:undefined});
  assert.equal(inspectionTarget([worker],machines,[],{terminal:'t2'}),null);
});

test('grid restoration targets the zoomed pane even when another pane retains focus', async () => {
  const { zoomTarget } = await import('../mods/one-piece/fleet.js');
  const inspection={pane:'inspection',tab:'active',zoomed:true,focused:false};
  const terminal={pane:'personal',tab:'active',zoomed:false,focused:true};
  const other={pane:'elsewhere',tab:'other',zoomed:true,focused:false};
  assert.equal(zoomTarget([other,terminal,inspection],'active'),inspection);
  assert.equal(zoomTarget([other,terminal],'active'),terminal);
  assert.equal(zoomTarget([other],'active'),undefined);
});

test('attention identifies independent agents separately from supervised sessions', async()=>{
  const { attention }=await import('../mods/one-piece/fleet.js');
  const sessions=[terminal('t1',{}, {status:'blocked'}),terminal('t2',{'firstmate.home':'home-a','firstmate.task':'fm-1'},{status:'blocked'}),terminal('t3',{}, {status:'blocked'}),terminal('hz-server/t4',{}, {status:'blocked'})];
  const world=fleet(sessions,[{name:null,layout:'ready'},{name:'hz-server',layout:'unavailable'}],[registration]);
  assert.deepEqual(attention(world).map(a=>[a.terminal.address,a.kind,a.inspect]),[
    ['t1','Firstmate',false],['t2','Worker',true],['t3','Independent',false]
  ]);
});
