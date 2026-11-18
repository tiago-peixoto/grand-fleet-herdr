// Execute both implementations against the same host and compare user actions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { discoverCaptain } from '../mods/one-piece/discovery.js';
import * as fleet from '../mods/one-piece/artwork.js';
import { captainSpaces, crewmembers, followedCaptains, genericFleets, managedCrew, machineOf } from '../mods/one-piece/fleet.js';
const home=process.argv[2];
if(!home) throw new Error('Usage: node tools/check-parity.mjs HERDR_APP_HOME');
const native=readFileSync(resolve(home,'mods/agents/main.js'),'utf8');
const nativeSpaces=readFileSync(resolve(home,'mods/spaces/main.js'),'utf8');
// The decorated host runs the copies the installer generated, so their hooks are exercised too.
const generated=name=>readFileSync(resolve(home,`mods/one-piece/${name}`),'utf8');
const nativeMenu=generated('herdr-menu.js'), hookedAgents=generated('herdr-agents.js');
const nativeTabs=generated('herdr-tabs.js'), nativePane=generated('herdr-pane.js'), nativeChrome=generated('herdr-chrome.js');
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
    {address:'t6',created_ms:7,state:'live',status:'done',program,labels:{}},
    {address:'t7',created_ms:8,state:'live',status:'error',parent:'t1',program,labels:{}},
    {address:'t8',created_ms:9,state:'live',status:'done',parent:'t1',program,labels:{}}];
  state.set('one-piece.art', {crews:{}, characters:{'t3:3':{art:'crew-chopper'},'t6:7':{art:'crew-franky'}}, paused:false});
  state.set('one-piece.captains', {'t1:1':{home:'local'}, 'remote/t1:4':{home:'remote'}});
  all[2].labels={'firstmate.task':'fm-1','firstmate.home':'local'};
  all[3].labels={'firstmate.task':'fm-2','firstmate.home':'local'};
  const agents=[all[1],all[3],all[4],all[7]].map((t,i)=>({...t,pane:`p${i}`,space:i===2?'remote/s':'s',space_name:'project',tab:i===2?'remote/tab':'tab',seq:i,pinned:false}));
  const panes=agents.map(a=>({terminal:a.address,pane:a.pane,tab:a.tab,program}));
  const cx={spawn(){},notify(){},stop_propagation(){},timer:{every(){},after(){}},focus_handle:()=>({focus:()=>calls.push(['focus'])})};
  const context={...fleet,discoverCaptain,captainSpaces,crewmembers,followedCaptains,genericFleets,managedCrew,machineOf,View:class{},ScrollHandle:{new:()=>({scroll_to_item(){}})},Button:{new:id=>element().id(id)},div:element,image:path=>{const el=element();el.path=path;return el;},svg:path=>{const el=element();el.path=path;return el;},h_flex:element,v_flex:element,
    keys:()=>[],machines:()=>[{name:null,layout:'ready'},{name:'remote',layout:remoteLayout}],agents:()=>agents,terminals:()=>all.map(t=>({...t})),panes:()=>panes,focused:()=>({agent:'t1'}),
    spaces:()=>[{id:'s',name:'project',status:'blocked',active:true,tabs:[{id:'tab',name:'project',active:true}]},{id:'personal',name:'Personal',tabs:[]},{id:'remote/s',machine:'remote',name:'Remote project',tabs:[{id:'remote/tab',name:'remote'}]}],
    layout:()=>({id:'sidebar',size:{px:width}}),window:()=>({platform:'macos'}),props:()=>overlayProps,
    theme:()=>({blocked:'#ff0000',done:'#00ff00',dim:'#888888'}),shared:key=>state.get(key),setShared:(key,value)=>state.set(key,value),
    setAgentOrder:order=>calls.push(['order',order]),run:(name,args)=>calls.push([name,args]),
    openOverlay:args=>calls.push(['overlay',args]),closeOverlay:id=>calls.push(['closeOverlay',id]),notify:args=>calls.push(['notify',args]),setBadge:text=>state.set('test.badge',text),nextCommand:()=>new Promise(()=>{}),
    settings:()=>({zoom:1}),home:()=>'/home/pirate',
    localStorage:{getItem:()=>null,setItem(){},removeItem(){}},Date,Set,Map,JSON};
  runInNewContext(compile(decorated?hookedAgents:native,'Agents'),context);
  runInNewContext(compile(nativeSpaces,'Spaces'),context);
  if(decorated) for (const [source,name] of [[nativeMenu,'Menu'],[nativeTabs,'Tabs'],[nativePane,'Pane'],[nativeChrome,'Chrome']]) runInNewContext(compile(source,name),context);
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

{
  const standard=host(false,'grouped',310), decorated=host(true,'grouped',310);
  const nativeIcon=descendants(standard.nodes.get('agent-fold-t6')).find(n=>n.path);
  assert.equal(nativeIcon.path,'icons/claude.svg');
  const icon=descendants(decorated.nodes.get('agent-fold-t6')).find(n=>n.path);
  assert.equal(icon.path,'mods/one-piece/assets/crew-franky-idle.gif','the animated crewmember takes the program icon slot');
  assert.equal(icon.width,28);
  const row=descendants(decorated.nodes.get('ag-t6'));
  assert.equal(row.filter(n=>n.path?.includes('crew-')).length,1,'no second crewmember at the end of the row');
  assert.ok(row.some(n=>n.background==='#00ff00'),'the native done mark stays at the end of the row');
  row.find(n=>n.kids.includes(icon)).right();
  assert.equal(JSON.stringify(decorated.calls.at(-1)[1].props),JSON.stringify({appearance:'t6:7'}),'right-clicking the crewmember opens its appearance menu');
  const sub=descendants(decorated.nodes.get('sub-t2')).find(n=>n.path?.includes('crew-'));
  assert.ok(sub.path.endsWith('-blocked.gif')&&sub.width===26,'a subagent row shows its crewmember in the icon slot');
  const failed=descendants(decorated.nodes.get('sub-t7')).find(n=>n.path?.includes('crew-'));
  assert.ok(failed.path.endsWith('-blocked.gif'),'a failed subagent needs attention like the native blocked row');
  assert.ok(descendants(decorated.nodes.get('sub-t8')).some(n=>typeof n.tip==='string'&&n.tip.endsWith(' · idle')),'a finished subagent reads idle like the native row');
}
for (const [props, terminal, face, name] of [[{region:'tabs'}, null, 'crew-luffy', null], [{region:'pane', pane:'p3', terminal:'t6'}, 't6', 'crew-franky', 'Claude']]) {
  const view=host(true,'grouped',310,props);
  const nodes=descendants(view.root);
  assert.ok(nodes.some(n=>n.path===`mods/one-piece/assets/portrait-${face}.png`),`${props.region} shows the crewmember portrait`);
  assert.ok(!nodes.some(n=>n.path==='icons/claude.svg'),`${props.region} drops the program icon for a crewmember`);
  if (name) assert.ok(nodes.some(n=>n.kids.includes(name)),'the pane title keeps its native name');
  assert.equal(view.state.get('one-piece.art').characters['t2:2'],undefined,`${props.region} copies leave crew bookkeeping to the Agents list`);
}
{
  const view=host(true);
  assert.equal(view.state.get('test.badge'),null,'the Dock badge is clear while no agent is blocked');
  view.controller.attend();
  assert.equal(JSON.stringify(view.calls.at(-1)),JSON.stringify(['agent.focus',{terminal:'t6'}]),'with no blocked agent, the attention key shows the finished one');
  const waiting=view.context.agents();
  waiting[1].status='blocked';waiting[2].status='blocked';
  view.controller.render(view.cx);
  assert.equal(view.state.get('test.badge'),'2','the Dock badge counts blocked agents');
  view.controller.attend();
  assert.equal(JSON.stringify(view.calls.at(-1)),JSON.stringify(['agent.focus',{terminal:'remote/t1'}]),'the attention key shows the blocked agent that changed most recently');
  await view.controller.close();
  assert.equal(view.state.get('test.badge'),null,'closing the Agents list clears the Dock badge it set');
}
for (const region of ['tabs','pane','brand','spaces']) {
  const view=host(true,'grouped',310,{region});
  view.state.set('test.badge','2');
  await view.controller.close();
  assert.equal(view.state.get('test.badge'),'2',`closing the ${region} copy leaves the Agents list's Dock badge alone`);
}
{
  const view=host(true,'grouped',310,{region:'brand'}), nodes=descendants(view.root);
  assert.ok(nodes.some(n=>n.path==='mods/one-piece/assets/flag.gif'),'the sidebar header flies the Straw Hat flag');
  assert.ok(nodes.some(n=>n.kids.includes('Grand Fleet'))&&!nodes.some(n=>n.kids.includes('Herdr')),'the sidebar header names the fleet');
  assert.ok(!nodes.some(n=>n.path==='frame/welcome/herdr.png'),'the Herdr logo leaves the sidebar header');
  assert.ok(['search','sidebar-toggle'].every(id=>view.nodes.has(id)),'the header keeps its native search and fold buttons');
}
{
  const view=host(true,'grouped',310,{region:'pane', pane:'p3', terminal:'t6'});
  view.state.set('one-piece.art',{crews:{},characters:{},paused:false});
  view.state.delete('one-piece.captains');
  view.nodes.clear();
  const nodes=descendants(view.controller.render(view.cx));
  assert.ok(nodes.some(n=>n.path==='icons/claude.svg'),'an agent without a crewmember keeps its program icon');
  assert.ok(nodes.some(n=>n.kids.includes('Claude')));
}
const menu=host(true,'priority',310,{appearance:'t1:1',overlay:'menu'});
assert.equal(scrolls(menu),1,'the expanded crew picker must scroll when constrained');
menu.nodes.get('raise-flag').click();
assert.equal(JSON.stringify(menu.calls.at(-1)[1].props),JSON.stringify({flag:{captain:'t1:1'}}), 'a captain raises its flag in the gallery dialog');
assert.equal(menu.calls.at(-1)[1].kind, 'dialog');
for (const [id, crew] of Object.entries(fleet.crews)) {
  const picker=host(true,'priority',310,{flag:{captain:'t1:1'},overlay:'flag'});
  const button=picker.nodes.get(`flag-${id}`);
  assert.ok(button,`missing crew choice: ${id}`);
  assert.ok('click' in button,`a captain may raise any flag, including ${id}`);
  button.click(null,picker.cx);
  picker.nodes.clear(); picker.root=picker.controller.render(picker.cx);
  picker.nodes.get('set-sail').click();
  assert.equal(picker.calls.at(-2)[0],'notify');
  assert.equal(picker.calls.at(-2)[1].title,`The ${crew.title} sets sail`);
  assert.equal(picker.calls.at(-2)[1].body,`${crew.name} now fly over project`);
  assert.equal(picker.calls.at(-2)[1].icon,`mods/one-piece/assets/portrait-crew-${crew.captain}.png`);
  assert.equal(JSON.stringify(picker.calls.at(-1)),JSON.stringify(['closeOverlay','flag']));
  assert.equal(picker.state.get('one-piece.art').crews['t1:1'],id);
  assert.equal(picker.state.get('one-piece.art').characters['t3:3'].art,`crew-${crew.workers[0]}`);
  const ships=host(true,'priority',310,{region:'spaces'});
  ships.state.set('one-piece.art',picker.state.get('one-piece.art'));
  ships.root=ships.controller.render(ships.cx);
  assert.ok(paths(ships).some(path=>path.endsWith(`/${crew.ship}.gif`)));
  assert.ok(paths(ships).some(path=>path.endsWith(`/crew-${crew.captain}-working.gif`)));
}
const flagKeys=host(true,'priority',310,{flag:{captain:'t1:1'},overlay:'flag'});
assert.ok(descendants(flagKeys.nodes.get('flag-strawhat')).some(n=>n.kids.includes('Flying now')),'the current crew is marked');
flagKeys.nodes.get('flag-dialog').keydown({key:'right'},flagKeys.cx);
flagKeys.nodes.get('flag-dialog').keydown({key:'enter'},flagKeys.cx);
assert.equal(flagKeys.state.get('one-piece.art').manualCrews['t1:1'],true,'the picker records an explicit choice');
assert.equal(flagKeys.state.get('one-piece.art').crews['t1:1'],'redhair');
assert.equal(flagKeys.state.get('one-piece.art').characters['t3:3'].art,'crew-benn-beckman');
assert.equal(flagKeys.state.get('one-piece.art').characters['t6:7'].art,'crew-yasopp','the picker restyles every agent in the captain Space');
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

const captainless = (view, art) => {
  view.state.delete('one-piece.captains');
  if (art) view.state.set('one-piece.art', art);
  view.nodes.clear();
  view.root = view.controller.render(view.cx);
  return view;
};
{
  const view=host(true);
  view.context.agents()[1].space='personal';
  view.controller.render(view.cx);
  const art=view.state.get('one-piece.art'), crew=art.crews['t1:1'];
  assert.equal(art.spaceCrews?.personal,undefined,'a worker Space stores no crew of its own while it follows its captain');
  assert.equal(art.characters['t3:3'].owner,`t1:1:${crew}`,'workers in a following Space draw from their captain roster');
  assert.notEqual(art.characters['t3:3'].art,art.characters['t6:7'].art,'the captain Space and its worker Space never share a character');
  const ships=host(true,'priority',310,{region:'spaces'});
  ships.context.agents()[1].space='personal';
  ships.state.set('one-piece.art',structuredClone(art));
  ships.nodes.clear();
  ships.controller.render(ships.cx);
  const row=descendants(ships.nodes.get('space-personal'));
  assert.ok(row.some(n=>n.path===`mods/one-piece/assets/${fleet.crews[crew].ship}.gif`),'a worker Space flies its captain ship');
  assert.ok(row.some(n=>n.kids.includes('Personal')),'a worker Space keeps its own name and row');
  ships.state.set('one-piece.art',{...structuredClone(art),spaceCrews:{personal:'heart'}});
  ships.nodes.clear();
  ships.controller.render(ships.cx);
  assert.ok(descendants(ships.nodes.get('space-personal')).some(n=>n.path?.endsWith('/crew-polar-tang.gif')),'a flag raised by hand on a worker Space outranks its captain');
}
const waiting = host(true);
waiting.controller.pendingCaptains = new Set(['t9:9']);
captainless(waiting);
assert.deepEqual(waiting.state.get('one-piece.art').spaceCrews ?? {}, {}, 'new fleets wait for pending captain discovery');
const unsettled = structuredClone(waiting.state.get('one-piece.art'));
waiting.controller.checkedCaptains = new Set(waiting.controller.pendingCaptains);
captainless(waiting);
assert.ok(waiting.state.get('one-piece.art').spaceCrews?.s, 'repeated discovery of a checked crewmember does not hold back new fleets');
waiting.state.set('one-piece.art', unsettled);
delete waiting.controller.checkedCaptains;
const startedAgo = ms => new Map([...waiting.controller.pendingCaptains].map(key => [key, Date.now() - ms]));
waiting.controller.firstChecks = startedAgo(4000);
captainless(waiting);
assert.deepEqual(waiting.state.get('one-piece.art').spaceCrews ?? {}, {}, 'a new fleet waits while a first discovery is under five seconds old');
waiting.controller.firstChecks = startedAgo(5000);
captainless(waiting);
assert.ok(waiting.state.get('one-piece.art').spaceCrews?.s, 'an unanswered first discovery holds back new fleets for at most five seconds');
waiting.state.set('one-piece.art', unsettled);
delete waiting.controller.firstChecks;
waiting.controller.pendingCaptains.clear();
captainless(waiting);
const fleetArt = waiting.state.get('one-piece.art');
assert.deepEqual(fleetArt.spaceCrews, {s:'strawhat', 'remote/s':'redhair'}, 'fleets without a live captain take the least-used crews, Straw Hats first');
assert.ok(['t1:1', 't3:3', 't6:7'].every(key => fleetArt.characters[key].owner === 'space:s:0:strawhat'), 'every agent in a generic fleet is its crewmate');
for (const width of [310, 120]) {
  const fleetView = captainless(host(true, 'priority', width, {region:'spaces'}), structuredClone(fleetArt));
  const nativeView = host(false, 'priority', width, {region:'spaces'});
  assert.equal(scrolls(fleetView), 1, 'generic fleets keep one Spaces scroll');
  assert.ok(fleetView.nodes.has('space-personal'), 'the Space without agents is rendered');
  assert.ok(!descendants(fleetView.nodes.get('space-personal')).some(n => n.path?.endsWith('.gif')), 'a Space without agents keeps native presentation');
  if (width === 310) {
    const row = descendants(fleetView.nodes.get('space-s'));
    assert.ok(row.some(n => n.path?.endsWith('/sunny.gif')), 'a generic fleet shows its ship');
    assert.ok(row.some(n => n.kids.includes('project')), 'a generic fleet keeps its Space name');
    assert.ok(!row.some(n => n.path?.includes('crew-luffy')), 'a generic fleet has no captain artwork');
    assert.ok(['t1:1', 't3:3', 't6:7'].every(key => fleetView.nodes.has(`portrait-${key}`)));
    assert.ok(descendants(fleetView.nodes.get('space-remote/s')).some(n => n.path?.endsWith('/crew-red-force.gif')));
    for (const view of [nativeView, fleetView]) { view.nodes.get('space-s').left(); view.nodes.get('space-s').leftUp(null, view.cx); }
    sameCall(nativeView, fleetView);
    fleetView.nodes.get('space-s').right();
    assert.equal(fleetView.calls.at(-1)[1].props.fleetMenu, true);
    assert.equal(fleetView.calls.at(-1)[1].props.shipSpace, 's');
    assert.equal(fleetView.calls.at(-1)[1].props.captain, undefined);
  } else {
    assert.ok(descendants(fleetView.nodes.get('ship-s')).some(n => n.path?.endsWith('/sunny.gif')), 'compact generic fleet shows its ship');
    fleetView.nodes.get('ship-s').click();
    assert.equal(JSON.stringify(fleetView.calls.at(-1)), JSON.stringify(['space.select', {id:'s'}]));
  }
}
const shipFleetMenu = host(true, 'priority', 310, {fleetMenu:true, tab:'space', target:{id:'s'}, shipSpace:'s', overlay:'fleet'});
shipFleetMenu.controller.fleetMenu.choose(1, shipFleetMenu.cx);
assert.equal(JSON.stringify(shipFleetMenu.calls.at(-1)[1].props),JSON.stringify({flag:{space:'s'}}), 'Raise a new flag opens the gallery for a generic fleet');
const picker = captainless(host(true, 'priority', 310, {flag:{space:'s'}, overlay:'picker'}), structuredClone(fleetArt));
assert.equal(scrolls(picker), 1, 'the flag gallery scrolls when constrained');
assert.ok(Object.keys(fleet.crews).every(id => picker.nodes.has(`flag-${id}`)));
assert.ok(descendants(picker.nodes.get('flag-redhair')).some(n => n.kids.includes('1 fleet')), 'a card counts the other fleets flying its crew');
assert.ok(descendants(picker.nodes.get('flag-redhair')).some(n => n.path === 'mods/one-piece/assets/crew-shanks-working.gif'), 'the crew lines up standing');
picker.nodes.get('flag-kid').click(null, picker.cx);
assert.equal(picker.state.get('one-piece.art').spaceCrews.s, 'strawhat', 'choosing a card does not set sail yet');
picker.nodes.clear(); picker.root = picker.controller.render(picker.cx);
picker.nodes.get('set-sail').click();
assert.equal(picker.state.get('one-piece.art').spaceCrews.s, 'kid');
assert.equal(picker.calls.at(-2)[1].body, 'Kid Pirates now fly over project');
const reserved = captainless(host(true, 'priority', 310, {flag:{space:'s'}, overlay:'picker'}), structuredClone(fleetArt));
reserved.state.set('one-piece.captains', {'remote/t1:4':{home:'remote'}});
reserved.state.get('one-piece.art').crews = {'remote/t1:4':'strawhat'};
reserved.state.get('one-piece.art').spaceCrews.s = 'redhair';
reserved.nodes.clear(); reserved.root = reserved.controller.render(reserved.cx);
assert.ok(descendants(reserved.nodes.get('flag-strawhat')).some(n => n.kids.includes('Reserved for the captain')), 'Straw Hats stay with a live Firstmate captain');
assert.ok(!('click' in reserved.nodes.get('flag-strawhat')) && 'click' in reserved.nodes.get('flag-kid'), 'a reserved crew cannot be chosen');
reserved.nodes.get('flag-dialog').keydown({key:'left'}, reserved.cx);
reserved.nodes.get('flag-dialog').keydown({key:'enter'}, reserved.cx);
assert.equal(reserved.state.get('one-piece.art').spaceCrews.s, 'kid', 'keyboard choice skips the reserved crew');
const restyled = captainless(host(true), picker.state.get('one-piece.art'));
assert.equal(restyled.state.get('one-piece.art').spaceCrews.s, 'kid', 'a chosen fleet crew persists');
assert.equal(restyled.state.get('one-piece.art').characters['t3:3'].owner, 'space:s:0:kid', 'crewmates follow the chosen fleet crew');
const ledPicker = host(true, 'priority', 310, {flag:{space:'s'}, overlay:'picker'});
assert.ok(!ledPicker.nodes.has('flag-kid'), 'a Space with a captain is not offered generic fleet crews');
const retainedArt = {...structuredClone(fleetArt), spaceCrews:{...fleetArt.spaceCrews, gone:'kid', 'remote/gone':'heart'}};
const offline = captainless(host(true, 'priority', 310, {}, 'offline'), retainedArt);
assert.equal(offline.state.get('one-piece.art').spaceCrews.gone, undefined, 'a crew is released when its Space is gone from an online machine');
assert.equal(offline.state.get('one-piece.art').spaceCrews['remote/gone'], 'heart', 'a crew is kept while its machine is offline');
assert.ok(!host(true, 'priority', 310, {appearance:'t3:3', overlay:'menu'}).nodes.has('mark-captain'), 'manual designation is unavailable in a Space that has a captain');
console.log('Generic fleets passed: ship, name, crewmates, compact ship, selection, menu, ship picker, crew persistence, offline retention, and discovery wait.');

for (const git of [null, 'main', 'linked']) {
  const fleetMenu=host(true,'priority',310,{fleetMenu:true,tab:'space',target:{id:'s'},captain:'t1:1',overlay:'fleet'});
  const controller=fleetMenu.controller.fleetMenu;
  controller.git=git;
  const items=controller.items();
  assert.equal(items[0][0],'Rename');
  assert.equal(items[1][0],'Raise a new flag…');
  assert.equal(items.at(-1)[1],'space.close');
  assert.equal(items.length,git==='linked'?6:git?5:3);
  controller.choose(0,fleetMenu.cx);
  assert.equal(fleetMenu.calls.at(-1)[0],'space.rename');
  controller.choose(1,fleetMenu.cx);
  assert.equal(JSON.stringify(fleetMenu.calls.at(-1)[1].props),JSON.stringify({flag:{captain:'t1:1'}}));
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
const bounds=[];
discovery.cx.timer={...discovery.cx.timer,after(ms,handler){bounds.push(ms);let notified=false;handler({notify(){notified=true;}});assert.ok(notified,'the discovery bound redraws the sidebar');}};
discovery.controller.discovering=false;
discovery.controller.discover(discovery.cx);
assert.ok(bounds.length>0&&bounds.every(ms=>ms===5000),'each first discovery schedules a redraw when its five-second wait ends');
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
