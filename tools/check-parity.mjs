// Execute both implementations against the same host and compare user actions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { discoverCaptain } from '../mods/one-piece/discovery.js';
import * as fleet from '../mods/one-piece/artwork.js';
import { captainSpaces, crewmembers, managedCrew, machineOf } from '../mods/one-piece/fleet.js';
const home=process.argv[2];
if(!home) throw new Error('Usage: node tools/check-parity.mjs HERDR_APP_HOME');
const native=readFileSync(resolve(home,'mods/agents/main.js'),'utf8');
const nativeSpaces=readFileSync(resolve(home,'mods/spaces/main.js'),'utf8');
const nativeMenu=readFileSync(resolve(home,'mods/one-piece/herdr-menu.js'),'utf8');
const adapter=readFileSync(new URL('../mods/one-piece/main.js',import.meta.url),'utf8');
const compile=(source,name)=>'(()=>{'+source.replace(/^import .*;\n/gm,'').replace(/export default class \w+/,`globalThis.${name} = class ${name}`).replace(/export function (\w+)/g,'globalThis.$1 = function $1')+'})();';

function host(decorated,sort='priority',width=310,overlayProps={},remoteLayout='ready') {
  const calls=[], nodes=new Map(), state=new Map([['agents.sort',sort]]);
  function element() {
    let proxy;
    const node={kids:[], scrolls:false, path:null};
    proxy=new Proxy(node,{get(target,key){
      if(key in target) return target[key];
      return (...args)=>{
        if(key==='accessibility_label') target.label=args[0];
        if(key==='tooltip') target.tip=args[0];
        if(key==='text_color') target.color=args[0];
        if(key==='bg') target.background=args[0];
        if(key==='w') target.width=args[0];
        if(key==='overflow_y_scrollbar') target.scrolls=true;
        if(key==='flex_1') target.grows=true;
        if(key==='track_focus') target.focusHandle=args[0];
        if(key==='child') target.kids.push(args[0]);
        if(key==='children') target.kids.push(...args[0]);
        if(key==='id') nodes.set(args[0],proxy);
        if(key==='on_click') target.click=args[0];
        if(key==='on_key_down') target.keydown=args[0];
        if(key==='on_mouse_down') target[args[0]]=args[1];
        if(key==='on_mouse_move') target.move=args[0];
        if(key==='on_mouse_up') target[args[0]+'Up']=args[1];
        if(key==='when'&&args[0]) args[1](proxy);
        return proxy;
      };
    }});
    return proxy;
  }
  const program={key:'claude',name:'Claude',agent:true,icon:'icons/claude.svg'};
  const all=[
    {address:'shell',created_ms:0,state:'live',labels:{}},
    {address:'t1',parent:'shell',created_ms:1,state:'live',status:'working',program,labels:{}},
    {address:'t2',created_ms:2,state:'live',status:'blocked',parent:'t1',program,labels:{}},
    {address:'t3',created_ms:3,state:'live',status:'idle',parent:'t1',program,labels:{}},
    {address:'remote/t1',created_ms:4,state:'live',status:'idle',program,labels:{}},
    {address:'t4',created_ms:5,state:'live',labels:{}},
    {address:'t5',created_ms:6,state:'live',name:'unregistered-child',parent:'t1',program,labels:{}},
    {address:'t6',created_ms:7,state:'live',status:'done',program,labels:{}}];
  state.set('one-piece.art', {crews:{}, characters:{'t3:3':{art:'crew-chopper'},'t6:7':{art:'crew-franky'}}, paused:false});
  state.set('one-piece.captains', {'t1:1':{home:'local'}, 'remote/t1:4':{home:'remote'}});
  all[2].labels={'firstmate.task':'fm-1','firstmate.home':'local'};
  all[3].labels={'firstmate.task':'fm-2','firstmate.home':'local'};
  const agents=[all[1],all[3],all[4],all[7]].map((t,i)=>({...t,pane:`p${i}`,space:i===2?'remote/s':'s',space_name:'project',tab:i===2?'remote/tab':'tab',seq:i,pinned:false}));
  const panes=agents.map(a=>({terminal:a.address,pane:a.pane,tab:a.tab,program}));
  const cx={spawn(){},notify(){},stop_propagation(){},timer:{every(){}},focus_handle:()=>({focus:()=>calls.push(['focus'])})};
  const context={...fleet,discoverCaptain,captainSpaces,crewmembers,managedCrew,machineOf,View:class{},ScrollHandle:{new:()=>({scroll_to_item(){}})},Button:{new:id=>element().id(id)},div:element,image:path=>{const el=element();el.path=path;return el;},svg:path=>{const el=element();el.path=path;return el;},h_flex:element,v_flex:element,
    keys:()=>[],machines:()=>[{name:null,layout:'ready'},{name:'remote',layout:remoteLayout}],agents:()=>agents,terminals:()=>all,panes:()=>panes,focused:()=>({agent:'t1'}),
    spaces:()=>[{id:'s',name:'project',status:'blocked',tabs:[{id:'tab',name:'project'}]},{id:'personal',name:'Personal',tabs:[]},{id:'remote/s',machine:'remote',name:'Remote project',tabs:[{id:'remote/tab',name:'remote'}]}],
    layout:()=>({id:'sidebar',size:{px:width}}),window:()=>({platform:'macos'}),props:()=>overlayProps,
    theme:()=>({blocked:'#ff0000',done:'#00ff00',dim:'#888888'}),shared:key=>state.get(key),setShared:(key,value)=>state.set(key,value),
    setAgentOrder:order=>calls.push(['order',order]),run:(name,args)=>calls.push([name,args]),
    openOverlay:args=>calls.push(['overlay',args]),closeOverlay:id=>calls.push(['closeOverlay',id]),
    localStorage:{getItem:()=>null,setItem(){},removeItem(){}},Date,Set,Map,JSON};
  runInNewContext(compile(native,'Agents'),context);
  runInNewContext(compile(nativeSpaces,'Spaces'),context);
  if(decorated) runInNewContext(compile(nativeMenu,'Menu'),context);
  if(decorated) runInNewContext(compile(adapter,'OnePieceAgents'),context);
  const controller=new context[decorated?'OnePieceAgents':overlayProps.region==='spaces'?'Spaces':'Agents']();
  const discover=controller.discover;
  if(discover) controller.discover=()=>{};
  controller.init({},cx);controller.hovered='t1';const root=controller.render(cx);
  if(discover) controller.discover=discover;
  return {calls,nodes,cx,controller,state,all,panes,root,context};
}

const descendants = node => !node || typeof node !== 'object' ? [] : [node, ...node.kids.flatMap(descendants)];
const paths = host => descendants(host.root).map(node => node.path).filter(Boolean);
const scrolls = host => descendants(host.root).filter(node => node.scrolls).length;
const sameCall = (left,right) => assert.equal(JSON.stringify(left.calls.at(-1)), JSON.stringify(right.calls.at(-1)));

for (const width of [310, 120]) {
  for (const sort of ['priority', 'grouped']) {
    const standard=host(false,sort,width), decorated=host(true,sort,width);
    assert.equal(scrolls(standard),1);
    assert.equal(scrolls(decorated),1,'Agents must retain one scrolling list');
    if (width === 120) assert.ok(descendants(decorated.root).filter(n => n.path?.includes('crew-')).every(n => n.width <= 14), 'compact characters must fit native status slots');
    if (width === 120) {
      const cells = descendants(decorated.root).filter(n => n.kids.some(kid => kid?.path?.includes('crew-')));
      const doneDot = cell => cell.kids.some(kid => kid?.background === '#00ff00');
      assert.ok(descendants(standard.root).some(n => n.background === '#00ff00'), 'native rail shows done');
      assert.equal(cells.filter(doneDot).length, 1, 'compact rail keeps the done indicator only for the done crewmember');
      assert.ok(cells.filter(doneDot).every(cell => cell.kids.some(kid => kid?.path?.endsWith('-idle.gif'))), 'done crewmember keeps its artwork');
    }
    for (const id of ['ag-t1','ag-remote/t1', ...(width===310 ? ['sub-t2','sub-t3'] : ['ag-t3'])]) {
      assert.ok(decorated.nodes.has(id),`missing native agent ${id}`);
      standard.nodes.get(id).click(null,standard.cx);
      decorated.nodes.get(id).click(null,decorated.cx);
      sameCall(standard,decorated);
    }
    assert.ok(paths(decorated).some(path=>path.includes('crew-luffy-working.gif')),'captain artwork');
    assert.ok(paths(decorated).some(path=>path.includes('crew-')&&path.endsWith('-idle.gif')),'idle artwork');
    if(width===310) {
      assert.ok(paths(decorated).some(path=>path.endsWith('-blocked.gif')),'blocked subagent artwork');
      standard.nodes.get('pin-t1').click(null,standard.cx);
      decorated.nodes.get('pin-t1').click(null,decorated.cx);
      sameCall(standard,decorated);
      standard.nodes.get('ag-sort').click(); decorated.nodes.get('ag-sort').click(); sameCall(standard,decorated);
    }
    const nativeSpaces=host(false,sort,width,{region:'spaces'});
    const ships=host(true,sort,width,{region:'spaces'});
    if (width === 120) assert.ok(descendants(ships.nodes.get('ship-s')).some(n => n.kids.includes('●') && n.color === '#ff0000'), 'compact ship preserves blocked status');
    assert.equal(scrolls(ships),1,'Spaces must retain one scrolling list');
    assert.equal(scrolls(nativeSpaces),1);
    assert.ok(ships.nodes.has('space-personal'),'ordinary spaces remain reachable');
    const rowId = width === 310 ? 'space-s' : 'ship-s';
    assert.ok(ships.nodes.has(rowId));
    assert.ok(ships.nodes.has(width === 310 ? 'space-remote/s' : 'ship-remote/s'));
    if (width === 310) {
      ships.nodes.get(rowId).left();
      ships.nodes.get(rowId).leftUp(null, ships.cx);
      const row = descendants(ships.nodes.get(rowId));
      assert.ok(row.some(n => n.path?.endsWith('crew-luffy-working.gif')));
      assert.ok(row.some(n => n.path?.endsWith('crew-chopper-idle.gif')));
      assert.ok(row.some(n => n.path?.endsWith('crew-franky-idle.gif')), 'every agent in the captain Space is its crew');
      assert.ok(!row.some(n => n.kids.includes('project')), 'captain replaces the visible Space name');
      const strip = row.find(n => n.kids.includes(ships.nodes.get('portrait-t3:3')));
      assert.ok(!descendants(strip).some(n => n.path?.includes('crew-luffy')), 'captain is above the crew strip');
      assert.ok(!row.some(n => n.kids.includes('P')), 'space initial must not duplicate crew artwork');
      assert.ok(!ships.nodes.has('ship-s'), 'expanded ship belongs to the native row');
      const worktree = view => descendants(view.row({w:{id:'s',name:'project',status:'idle',tabs:[]}, i:0, g:null, tree:'└─'}, {dim:'#888888'}));
      const branch = nodes => nodes.filter(n => n.path === 'mods/workspace-chrome/branch.svg').map(n => n.color);
      assert.deepEqual(branch(worktree(ships.controller.spacesView)), branch(worktree(nativeSpaces.controller)), 'worktree rows keep the native branch icon');
      assert.equal(branch(worktree(nativeSpaces.controller)).length, 1);
    } else ships.nodes.get(rowId).click();
    if(width===310) {
      nativeSpaces.nodes.get('space-s').left();
      nativeSpaces.nodes.get('space-s').leftUp(null,nativeSpaces.cx);
    } else nativeSpaces.nodes.get('space-s').click();
    sameCall(nativeSpaces,ships);
    assert.ok(paths(ships).some(path=>path.endsWith('/sunny.gif')));
    if (width === 310) {
      for (const [key, terminal] of [['t1:1', 't1'], ['t3:3', 't3'], ['remote/t1:4', 'remote/t1']]) {
        const portrait = ships.nodes.get(`portrait-${key}`);
        let stopped = 0;
        const cx = {...ships.cx, stop_propagation() { stopped++; }};
        portrait.left(null, cx);
        portrait.leftUp(null, cx);
        portrait.click(null, cx);
        assert.equal(stopped, 3, 'portrait events must not select or drag the containing Space');
        assert.equal(ships.calls.at(-1)[0], 'agent.focus');
        assert.equal(ships.calls.at(-1)[1].terminal, terminal);
      }
    }

    if (width === 310) {
      for (const view of [nativeSpaces, ships]) {
        view.nodes.get('space-s').left();
        view.nodes.get('space-personal').move(null, view.cx);
        view.nodes.get('space-personal').leftUp(null, view.cx);
      }
      sameCall(nativeSpaces, ships);
      assert.equal(ships.calls.at(-1)[0], 'space.move');
      nativeSpaces.nodes.get('space-s').right(); ships.nodes.get('space-s').right();
      assert.equal(ships.calls.at(-1)[1].props.fleetMenu, true);
      assert.equal(ships.calls.at(-1)[1].props.captain, 't1:1');
    }
  }
}

const menu=host(true,'priority',310,{appearance:'t1:1',overlay:'menu'});
assert.equal(scrolls(menu),1,'the expanded crew picker must scroll when constrained');
for (const [id, crew] of Object.entries(fleet.crews)) {
  const picker=host(true,'priority',310,{appearance:'t1:1',overlay:'menu'});
  const button=picker.nodes.get(`crew-${id}`);
  assert.ok(button,`missing crew choice: ${id}`);
  button.click();
  assert.equal(picker.state.get('one-piece.art').crews['t1:1'],id);
  assert.equal(picker.state.get('one-piece.art').characters['t3:3'].art,`crew-${crew.workers[0]}`);
  const ships=host(true,'priority',310,{region:'spaces'});
  ships.state.set('one-piece.art',picker.state.get('one-piece.art'));
  ships.root=ships.controller.render(ships.cx);
  assert.ok(paths(ships).some(path=>path.endsWith(`/${crew.ship}.gif`)));
  assert.ok(paths(ships).some(path=>path.endsWith(`/crew-${crew.captain}-working.gif`)));
}
menu.nodes.get('crew-redhair').click();
assert.equal(menu.state.get('one-piece.art').manualCrews['t1:1'],true,'the picker records an explicit choice');
assert.equal(menu.state.get('one-piece.art').crews['t1:1'],'redhair');
assert.equal(menu.state.get('one-piece.art').characters['t3:3'].art,'crew-benn-beckman');
assert.equal(menu.state.get('one-piece.art').characters['t6:7'].art,'crew-yasopp','the picker restyles every agent in the captain Space');
menu.nodes.get('motion').click();
assert.equal(menu.state.get('one-piece.art').paused,true);
menu.nodes.get('unlink-captain').click();
assert.ok(!menu.state.get('one-piece.captains')['t1:1']);
const ordinary=host(true,'priority',310,{appearance:'t2:2',overlay:'menu'});
ordinary.nodes.get('mark-captain').click();
assert.ok(ordinary.state.get('one-piece.captains')['t2:2'],'any agent can be explicitly identified as Firstmate');

const legacy = host(true, 'priority', 310, {view:'inspection', target:{terminal:'t1', created:1}});
assert.equal(scrolls(legacy),0,'retired panes must not become another Agents region');
legacy.nodes.get('legacy-open').click();
assert.equal(JSON.stringify(legacy.calls.at(-1)),JSON.stringify(['terminal.peek',{terminal:'t1'}]));
const staleLegacy = host(true, 'priority', 310, {view:'inspection', target:{terminal:'t1', created:0}});
assert.ok(!staleLegacy.nodes.has('legacy-open'),'retired panes must not target recycled terminals');
for (const source of ['session-lock', 'manual']) {
  const view = host(true, 'priority', 310, {region:'spaces'});
  view.state.set('one-piece.captains', {
    't1:1':{home:'local', source}, 't3:3':{home:'local', source},
    'remote/t1:4':{home:'remote', source}
  });
  view.state.get('one-piece.art').crews = {'t1:1':'strawhat', 't3:3':'redhair'};
  view.nodes.clear();
  view.root = view.controller.render(view.cx);
  const row = descendants(view.nodes.get('space-s'));
  const portrait = view.nodes.get('portrait-t3:3');
  assert.ok(portrait && row.includes(portrait), `${source}: additional captain remains visible in its Space`);
  assert.ok(descendants(portrait).some(n => n.path?.endsWith('crew-shanks-idle.gif')));
  assert.equal(row.filter(n => n === view.nodes.get('portrait-t1:1')).length, 1);
  assert.ok(row.some(n => n.path?.endsWith('/sunny.gif')), 'first captain still selects the ship');
  assert.ok(!row.some(n => n.path?.endsWith('crew-red-force.gif')));
  let stopped = 0;
  const cx = {...view.cx, stop_propagation() { stopped++; }};
  view.calls.length = 0;
  portrait.left(null, cx);
  portrait.leftUp(null, cx);
  portrait.click(null, cx);
  assert.equal(stopped, 3);
  assert.equal(view.calls.length, 1);
  assert.equal(view.calls[0][0], 'agent.focus');
  assert.equal(view.calls[0][1].terminal, 't3');
}

console.log('Native parity passed: two scroll regions, ship selection, ordinary spaces, captain and crewmember artwork, agent focus/preview, pinning, sorting, compact view, and appearance settings.');

for (const git of [null, 'main', 'linked']) {
  const fleetMenu=host(true,'priority',310,{fleetMenu:true,tab:'space',target:{id:'s'},captain:'t1:1',overlay:'fleet'});
  const controller=fleetMenu.controller.fleetMenu;
  controller.git=git;
  const items=controller.items();
  assert.equal(items[0][0],'Rename');
  assert.equal(items[1][0],'Choose ship and crew');
  assert.equal(items.at(-1)[1],'space.close');
  assert.equal(items.length,git==='linked'?6:git?5:3);
  controller.choose(0,fleetMenu.cx);
  assert.equal(fleetMenu.calls.at(-1)[0],'space.rename');
  controller.choose(1,fleetMenu.cx);
  assert.equal(fleetMenu.calls.at(-1)[1].props.appearance,'t1:1');
  if (git) {
    controller.choose(2,fleetMenu.cx);
    assert.equal(fleetMenu.calls.at(-1)[1].mod,'worktree');
  }
}

const selectedCrew=host(true);
selectedCrew.state.get('one-piece.art').crews['t1:1']='beasts';
selectedCrew.controller.render(selectedCrew.cx);
assert.equal(selectedCrew.state.get('one-piece.art').characters['t3:3'].art,'crew-king');
assert.equal(selectedCrew.state.get('one-piece.art').characters['t6:7'].art,'crew-queen');
selectedCrew.all.push({address:'new',created_ms:8,state:'live',program:selectedCrew.all[1].program,labels:{}});
selectedCrew.context.agents().push({address:'new',space:'s'});
selectedCrew.controller.render(selectedCrew.cx);
assert.equal(selectedCrew.state.get('one-piece.art').characters['new:8'].art,'crew-jack');


const discovery=host(true);
discovery.state.delete('one-piece.captains');
discovery.state.set('one-piece.art',{crews:{},characters:{},paused:false});
discovery.context.hc=async ([command,address])=>({code:0,stdout:JSON.stringify({
  ...discovery.all.find(t=>t.address===address),foreground:{pid:101,cwd:`/fleet/${address}`}
})});
discovery.context.readTextFile=async path=>{
  if(!path.startsWith('/fleet/t1/')&&!path.startsWith('/fleet/remote/t1/')) return null;
  if(path.endsWith('/state/.lock')) return '101';
  if(path.endsWith('/bin/fm-session-start.sh')) return 'source fm-session-lock-lib.sh';
  if(path.endsWith('/.fm-secondmate-home')&&path.includes('/remote/')) return 'secondmate';
  return null;
};
const pending=[];
discovery.cx.spawn=fn=>{pending.push(fn(discovery.cx));};
discovery.controller.discovering=false;
discovery.controller.discover(discovery.cx);
await Promise.all(pending.splice(0));
assert.equal(discovery.state.get('one-piece.discovered')['t1:1'].role,'firstmate');
assert.equal(discovery.state.get('one-piece.discovered')['remote/t1:4'].role,'secondmate');
discovery.controller.render(discovery.cx);
assert.equal(discovery.state.get('one-piece.art').crews['t1:1'],'strawhat');
assert.equal(discovery.state.get('one-piece.art').crews['remote/t1:4'],'redhair');
discovery.context.readTextFile=async()=>null;
discovery.controller.discover(discovery.cx);
await Promise.all(pending.splice(0));
assert.equal(discovery.state.get('one-piece.discovered')['t1:1'],undefined,'an agent that no longer owns a Firstmate lock loses captain status');
console.log('Automatic discovery passed: primary, remote secondmate, default crews, and loss of session evidence.');

discovery.state.set('one-piece.discovered',{'shell:0':{source:'session-lock',role:'firstmate'}});
discovery.controller.discover(discovery.cx);
await Promise.all(pending.splice(0));
assert.equal(discovery.state.get('one-piece.discovered')['shell:0'],undefined,'a live personal shell cannot retain an automatic captain record');
console.log('Discovery lifecycle passed: stale captain records are removed from personal shells.');

let releaseRemote;
const remoteGate=new Promise(resolve=>{releaseRemote=resolve;});
const getTerminal=discovery.context.hc;
let remoteCalls=0;
discovery.context.hc=async args=>{
  if(args[1]==='remote/t1') {remoteCalls++;await remoteGate;}
  return getTerminal(args);
};
discovery.context.readTextFile=async path=>path.endsWith('/state/.lock')?'101':
  path.endsWith('/bin/fm-session-start.sh')?'source fm-session-lock-lib.sh':
  path.includes('/remote/')?'secondmate':null;
discovery.controller.discover(discovery.cx);
await pending[0];
assert.equal(discovery.state.get('one-piece.discovered')['t1:1'].role,'firstmate','local discovery finishes while the remote request is unresolved');
assert.equal(discovery.state.get('one-piece.discovered')['remote/t1:4'],undefined);
discovery.controller.discover(discovery.cx);
assert.equal(remoteCalls,1,'repeated scans do not accumulate unresolved remote probes');
const replacement=new discovery.context.OnePieceAgents();
replacement.discover(discovery.cx);
assert.equal(remoteCalls,2,'a replacement view retries independently of a prior view’s unfinished request');
releaseRemote();
await Promise.all(pending.splice(0));
assert.equal(discovery.state.get('one-piece.discovered')['remote/t1:4'].role,'secondmate','remote discovery recovers after the request completes');
console.log('Independent discovery passed: slow remote does not block local progress or accumulate duplicate probes.');
