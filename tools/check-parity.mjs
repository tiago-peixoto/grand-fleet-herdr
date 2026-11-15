// Execute both implementations against the same host and compare user actions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import * as fleet from '../mods/one-piece/artwork.js';
import { captainSpaces, crewmembers, machineOf } from '../mods/one-piece/fleet.js';
const home=process.argv[2];
if(!home) throw new Error('Usage: node tools/check-parity.mjs HERDR_APP_HOME');
const native=readFileSync(resolve(home,'mods/agents/main.js'),'utf8');
const nativeSpaces=readFileSync(resolve(home,'mods/spaces/main.js'),'utf8');
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
  state.set('one-piece.captains', {'t1:1':{home:'local'}, 'remote/t1:4':{home:'remote'}});
  all[2].labels={'firstmate.task':'fm-1','firstmate.home':'local'};
  all[3].labels={'firstmate.task':'fm-2','firstmate.home':'local'};
  const agents=[all[1],all[3],all[4],all[7]].map((t,i)=>({...t,pane:`p${i}`,space:i===2?'remote/s':'s',space_name:'project',tab:i===2?'remote/tab':'tab',seq:i,pinned:false}));
  const panes=agents.map(a=>({terminal:a.address,pane:a.pane,tab:a.tab,program}));
  const cx={spawn(){},notify(){},stop_propagation(){},timer:{every(){}},focus_handle:()=>({focus:()=>calls.push(['focus'])})};
  const context={...fleet,captainSpaces,crewmembers,machineOf,View:class{},Button:{new:id=>element().id(id)},div:element,image:path=>{const el=element();el.path=path;return el;},svg:element,h_flex:element,v_flex:element,
    machines:()=>[{name:null,layout:'ready'},{name:'remote',layout:remoteLayout}],agents:()=>agents,terminals:()=>all,panes:()=>panes,focused:()=>({agent:'t1'}),
    spaces:()=>[{id:'s',name:'project',status:'blocked',tabs:[{id:'tab',name:'project'}]},{id:'personal',name:'Personal',tabs:[]},{id:'remote/s',machine:'remote',name:'Remote project',tabs:[{id:'remote/tab',name:'remote'}]}],
    layout:()=>({id:'sidebar',size:{px:width}}),window:()=>({platform:'macos'}),props:()=>overlayProps,
    theme:()=>({blocked:'#ff0000',done:'#00ff00',dim:'#888888'}),shared:key=>state.get(key),setShared:(key,value)=>state.set(key,value),
    setAgentOrder:order=>calls.push(['order',order]),run:(name,args)=>calls.push([name,args]),
    openOverlay:args=>calls.push(['overlay',args]),closeOverlay:id=>calls.push(['closeOverlay',id]),
    localStorage:{getItem:()=>null,setItem(){},removeItem(){}},Date,Set,Map,JSON};
  runInNewContext(compile(native,'Agents'),context);
  runInNewContext(compile(nativeSpaces,'Spaces'),context);
  if(decorated) runInNewContext(compile(adapter,'OnePieceAgents'),context);
  const controller=new context[decorated?'OnePieceAgents':overlayProps.region==='spaces'?'Spaces':'Agents']();
  controller.init({},cx);controller.hovered='t1';const root=controller.render(cx);
  return {calls,nodes,cx,controller,state,all,panes,root};
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
    assert.ok(ships.nodes.has('ship-s'));
    assert.ok(ships.nodes.has('ship-remote/s'));
    ships.nodes.get('ship-s').click();
    if(width===310) {
      nativeSpaces.nodes.get('space-s').left();
      nativeSpaces.nodes.get('space-s').leftUp(null,nativeSpaces.cx);
    } else nativeSpaces.nodes.get('space-s').click();
    sameCall(nativeSpaces,ships);
    assert.ok(paths(ships).some(path=>path.endsWith('/sunny.gif')));
  }
}

const menu=host(true,'priority',310,{appearance:'t1:1',overlay:'menu'});
menu.nodes.get('crew-redhair').click();
assert.equal(menu.state.get('one-piece.art').crews['t1:1'],'redhair');
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
console.log('Native parity passed: two scroll regions, ship selection, ordinary spaces, captain and crewmember artwork, agent focus/preview, pinning, sorting, compact view, and appearance settings.');
