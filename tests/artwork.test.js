import test from 'node:test';
import assert from 'node:assert/strict';
const terminal = address => ({address,created_ms:12});
const registration = {terminal:'t1',created:12};

test('crew assignments use named characters before varied pirates and preserve identities',async()=>{
  const {assignCrew}=await import('../mods/one-piece/artwork.js');
  const coordinator={...registration,crew:'redhair'};
  const workers=Array.from({length:6},(_,i)=>terminal(`t${i+20}`));
  const assigned=assignCrew(workers,{},coordinator);
  assert.deepEqual(Object.values(assigned).map(a=>a.art),['crew-benn-beckman','crew-yasopp','crew-lucky-roux','crew-pirate-blue','crew-pirate-amber','crew-pirate-green']);
  const next=assignCrew(workers.slice(1),assigned,coordinator);
  assert.deepEqual(next,assigned);
  const changed=assignCrew(workers,next,{...coordinator,crew:'beasts'});
  assert.equal(changed['t20:12'].art,'crew-king');
  assert.equal(assigned['t20:12'].art,'crew-benn-beckman');
});

test('returning to a crew preserves characters after worker departure and reordering',async()=>{
  const {assignCrew}=await import('../mods/one-piece/artwork.js');
  const coordinator={...registration,crew:'redhair'},workers=[terminal('t20'),terminal('t21'),terminal('t22')];
  const original=assignCrew(workers,{},coordinator);
  const changed=assignCrew(workers,original,{...coordinator,crew:'beasts'});
  const restored=assignCrew([workers[2],workers[1]],changed,coordinator);
  assert.equal(restored['t21:12'].art,original['t21:12'].art);
  assert.equal(restored['t22:12'].art,original['t22:12'].art);
});

test('named characters return after their terminals end on an online machine',async()=>{
  const {assignCrew,releaseCrew}=await import('../mods/one-piece/artwork.js');
  const unassigned={terminal:'unassigned',created:0,crew:'strawhat'},online=[{name:null,layout:'ready'}];
  let characters={};
  for(let i=0;i<10;i++) {
    const worker={address:`t${i}`,created_ms:i,state:'live'};
    characters=assignCrew([worker],releaseCrew(characters,[worker],online),unassigned);
    assert.equal(characters[`t${i}:${i}`].art,'crew-chopper');
  }
  assert.equal(Object.keys(characters).length,1);
});

test('a freed slot is reused without duplicating surviving characters',async()=>{
  const {assignCrew,releaseCrew}=await import('../mods/one-piece/artwork.js');
  const coordinator={...registration,crew:'redhair'},online=[{name:null,layout:'ready'}];
  const workers=[0,1,2,3].map(i=>({...terminal(`t${i+20}`),state:'live'}));
  const before=assignCrew(workers,{},coordinator);
  const survivors=[workers[0],workers[2],workers[3]],late={...terminal('t30'),state:'live'};
  const after=assignCrew([...survivors,late],releaseCrew(before,[...survivors,late],online),coordinator);
  assert.equal(after['t21:12'],undefined);
  for(const w of survivors) assert.deepEqual(after[`${w.address}:12`],before[`${w.address}:12`]);
  assert.equal(after['t30:12'].art,'crew-yasopp');
  const ended={...workers[1],state:'ended'};
  assert.equal(releaseCrew(before,[...survivors,ended],online)['t21:12'],undefined);
});

test('assignments on an unavailable machine survive until it reconnects',async()=>{
  const {assignCrew,releaseCrew}=await import('../mods/one-piece/artwork.js');
  const coordinator={terminal:'hz/t1',created:12,crew:'redhair'};
  const workers=[{address:'hz/t20',created_ms:12,state:'live'},{address:'hz/t21',created_ms:12,state:'live'}];
  const local={address:'t5',created_ms:5,state:'live'};
  const before=assignCrew(workers,assignCrew([local],{},{terminal:'unassigned',created:0}),coordinator);
  for(const layout of ['unavailable','loading']) {
    const kept=releaseCrew(before,[local],[{name:null,layout:'ready'},{name:'hz',layout}]);
    assert.deepEqual(kept,before);
  }
  const reconnected=assignCrew(workers,releaseCrew(before,[local,...workers],[{name:null,layout:'ready'},{name:'hz',layout:'ready'}]),coordinator);
  assert.deepEqual(reconnected,before);
});

test('a ready machine whose terminals are not listed yet keeps its characters',async()=>{
  const {assignCrew,releaseCrew}=await import('../mods/one-piece/artwork.js');
  const coordinator={terminal:'hz/t1',created:12,crew:'redhair'};
  const workers=[{address:'hz/t20',created_ms:12,state:'live'},{address:'hz/t21',created_ms:12,state:'live'}];
  const local={address:'t5',created_ms:5,state:'live'};
  const before=assignCrew(workers,assignCrew([local],{},{terminal:'unassigned',created:0}),coordinator);
  const ready=[{name:null,layout:'ready'},{name:'hz',layout:'ready'}];
  let characters=releaseCrew(before,[local],ready);
  assert.deepEqual(characters,before);
  characters=releaseCrew(characters,[],ready);
  assert.deepEqual(characters,before);
  characters=assignCrew(workers,releaseCrew(characters,[local,...workers],ready),coordinator);
  assert.deepEqual(characters,before);
  const remaining=releaseCrew(characters,[local,workers[0]],ready);
  assert.equal(remaining['hz/t21:12'],undefined);
  assert.deepEqual(remaining['hz/t20:12'],before['hz/t20:12']);
});

test('a newcomer never takes the character of a surviving unassigned crewmate',async()=>{
  const {assignCrew}=await import('../mods/one-piece/artwork.js');
  const unassigned={terminal:'unassigned',created:0,crew:'strawhat'};
  const formerCaptain=assignCrew([terminal('t2')],{},{terminal:'t1',created:5,crew:'strawhat'});
  const survivor=formerCaptain['t2:12'];
  assert.equal(survivor.art,'crew-chopper');
  const after=assignCrew([terminal('t3')],formerCaptain,unassigned,[survivor]);
  assert.deepEqual(after['t2:12'],survivor);
  assert.equal(after['t3:12'].art,'crew-franky');
  const redhair=assignCrew([1,2,3,4].map(i=>terminal(`r${i}`)),{},{terminal:'t9',created:5,crew:'redhair'});
  const pirate=redhair['r4:12'];
  assert.equal(pirate.number,1);
  const many=Array.from({length:10},(_,i)=>terminal(`u${i}`));
  const crowded=assignCrew(many,redhair,unassigned,[pirate]);
  assert.equal(crowded['u9:12'].number,2);
});

test('crewmates that lose their captain keep their characters beside unassigned crewmates',async()=>{
  const {assignCrew}=await import('../mods/one-piece/artwork.js');
  const unassigned={terminal:'unassigned',created:0,crew:'strawhat'};
  const unlinked=assignCrew([terminal('wu')],{},unassigned);
  const linked=assignCrew([terminal('wa'),terminal('wb')],unlinked,{terminal:'t1',created:5,crew:'strawhat'});
  assert.equal(linked['wu:12'].art,'crew-chopper');
  assert.equal(linked['wa:12'].art,'crew-chopper');
  const crew=['wu','wa','wb','wn'].map(terminal);
  const survivors=crew.map(w=>linked[`${w.address}:12`]).filter(Boolean);
  const after=assignCrew(crew.filter(w=>!linked[`${w.address}:12`]),linked,unassigned,survivors);
  for(const w of ['wu','wa','wb']) assert.deepEqual(after[`${w}:12`],linked[`${w}:12`]);
  assert.equal(after['wn:12'].art,'crew-zoro');
});


test('captains default to Straw Hats then unused secondary crews without changing manual choices', async () => {
  const {selectDefaultCrews, identity} = await import('../mods/one-piece/artwork.js');
  const terminals = ['t1','t2','remote/t1','t4','t5'].map(address => ({address, created_ms:1, state:'live'}));
  const captains = Object.fromEntries(terminals.map(t => [identity(t), {}]));
  const machines = [{name:null,layout:'ready'},{name:'remote',layout:'ready'}];
  const selected = selectDefaultCrews(terminals,captains,{},machines);
  assert.deepEqual(Object.values(selected),['strawhat','redhair','bigmom','beasts','redhair']);
  const manual = {...selected, 't2:1':'beasts'};
  assert.deepEqual(selectDefaultCrews(terminals,captains,manual,machines),manual);
  assert.deepEqual(selectDefaultCrews([...terminals].reverse(),captains,manual,machines),manual);
});

test('unused crews exclude ended captains but reserve disconnected machines and allow manual duplicates', async () => {
  const {selectDefaultCrews, identity} = await import('../mods/one-piece/artwork.js');
  const terminals = ['t1','t2','t3'].map(address => ({address,created_ms:1,state:'live'}));
  const captains = {'t1:1':{},'remote/t1:1':{},'ended:1':{},'t2:1':{},'t3:1':{}};
  const selected = {'t1:1':'strawhat','remote/t1:1':'redhair','ended:1':'bigmom'};
  const assigned = selectDefaultCrews(terminals,captains,selected,[{name:null,layout:'ready'}]);
  assert.equal(assigned['t2:1'],'bigmom');
  assert.equal(assigned['t3:1'],'beasts');
  const duplicates = {...selected,'t2:1':'strawhat','t3:1':'strawhat'};
  assert.deepEqual(selectDefaultCrews(terminals,captains,duplicates,[]),duplicates);
  assert.deepEqual(selectDefaultCrews(terminals,{},selected,[]),selected);
});

test('automatic roles select the right crews even when secondmates appear first', async () => {
  const {selectDefaultCrews} = await import('../mods/one-piece/artwork.js');
  const second = {address:'t2',created_ms:1,state:'live'};
  const primary = {address:'t1',created_ms:1,state:'live'};
  const captains = {'t2:1':{role:'secondmate'},'t1:1':{role:'firstmate'}};
  const machines = [{name:null,layout:'ready'}];
  const before = selectDefaultCrews([second],{'t2:1':captains['t2:1']},{},machines);
  assert.equal(before['t2:1'],'redhair');
  const after = selectDefaultCrews([second,primary],captains,before,machines);
  assert.equal(after['t1:1'],'strawhat');
  assert.equal(after['t2:1'],'redhair');
  const chosen = {...after,'t1:1':'beasts','t2:1':'strawhat'};
  const saved = {roles:{'t1:1':'firstmate','t2:1':'secondmate'}};
  assert.deepEqual(selectDefaultCrews([second,primary],captains,chosen,machines,saved),chosen);
});

test('a corrected role updates automatic artwork but preserves a user selection', async () => {
  const {selectDefaultCrews} = await import('../mods/one-piece/artwork.js');
  const live = [{address:'t1',created_ms:1,state:'live'}];
  const captains = {'t1:1':{role:'secondmate'}};
  const selected = {'t1:1':'strawhat'};
  const preferences = {roles:{'t1:1':'firstmate'}};
  assert.equal(selectDefaultCrews(live,captains,selected,[],preferences)['t1:1'],'redhair');
  assert.equal(selectDefaultCrews(live,captains,selected,[],{...preferences,manualCrews:{'t1:1':true}})['t1:1'],'strawhat');
});

test('a manually designated captain that later gains a role leaves Straw Hats to the primary', async () => {
  const {selectDefaultCrews} = await import('../mods/one-piece/artwork.js');
  const live = [{address:'t1',created_ms:1,state:'live'},{address:'remote/t2',created_ms:2,state:'live'}];
  const machines = [{name:null,layout:'ready'},{name:'remote',layout:'ready'}];
  const manual = selectDefaultCrews(live,{'remote/t2:2':{}},{},machines);
  assert.deepEqual(manual,{'remote/t2:2':'strawhat'});
  const discovered = {'t1:1':{role:'firstmate'},'remote/t2:2':{role:'secondmate'}};
  assert.deepEqual(selectDefaultCrews(live,discovered,manual,machines,{roles:{}}),{'t1:1':'strawhat','remote/t2:2':'redhair'});
  const picked = selectDefaultCrews(live,discovered,manual,machines,{roles:{},manualCrews:{'remote/t2:2':true}});
  assert.equal(picked['remote/t2:2'],'strawhat');
});
