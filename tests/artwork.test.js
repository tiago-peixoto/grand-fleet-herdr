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
