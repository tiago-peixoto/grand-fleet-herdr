// Execute both implementations against the same host and compare user actions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import * as fleet from '../mods/one-piece/artwork.js';
import { groupFleet } from '../mods/one-piece/fleet.js';
const home=process.argv[2];
if(!home) throw new Error('Usage: node tools/check-parity.mjs HERDR_APP_HOME');
const native=readFileSync(resolve(home,'mods/agents/main.js'),'utf8');
const adapter=readFileSync(new URL('../mods/one-piece/main.js',import.meta.url),'utf8');
const compile=(source,name)=>source.replace(/^import .*;\n/gm,'').replace(/export default class \w+/,`globalThis.${name} = class ${name}`);

function host(decorated,sort='priority',width=310,overlayProps={},remoteLayout='ready') {
  const calls=[], nodes=new Map(), state=new Map([['agents.sort',sort]]);
  function element() {
    let proxy;
    const node={};
    proxy=new Proxy(node,{get(target,key){
      if(key in target) return target[key];
      return (...args)=>{
        if(key==='w') target.width=args[0];
        if(key==='track_focus') target.focusHandle=args[0];
        if(key==='child') (target.children??=[]).push(args[0]);
        if(key==='id') nodes.set(args[0],proxy);
        if(key==='on_click') target.click=args[0];
        if(key==='on_key_down') target.keydown=args[0];
        if(key==='on_mouse_down') target[args[0]]=args[1];
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
    {address:'t5',created_ms:6,state:'live',name:'unregistered-child',parent:'t1',program,labels:{}}];
  all[1].labels={'firstmate.role':'coordinator','firstmate.home.path':'local'};
  all[2].labels={'firstmate.task':'fm-1','firstmate.home.path':'local'};
  all[3].labels={'firstmate.task':'fm-2','firstmate.home.path':'local'};
  all[4].labels={'firstmate.role':'coordinator','firstmate.home.path':'remote'};
  const agents=[all[1],all[3],all[4]].map((t,i)=>({...t,pane:`p${i}`,space:i===2?'remote/s':'s',space_name:'project',tab:i===2?'remote/tab':'tab',seq:i,pinned:false}));
  const panes=agents.map(a=>({terminal:a.address,pane:a.pane,tab:a.tab,program}));
  const cx={notify(){},stop_propagation(){},timer:{every(){}},focus_handle:()=>({focus:()=>calls.push(['focus'])})};
  const context={...fleet,groupFleet,View:class{},Button:{new:id=>element().id(id)},div:element,image:element,svg:element,h_flex:element,v_flex:element,
    machines:()=>[{name:null,layout:'ready'},{name:'remote',layout:remoteLayout}],agents:()=>agents,terminals:()=>all,panes:()=>panes,focused:()=>({agent:'t1'}),
    spaces:()=>[{id:'s',name:'project',tabs:[{id:'tab',name:'project'}]},{id:'personal',name:'Personal',tabs:[]},{id:'remote/s',machine:'remote',name:'Remote project',tabs:[{id:'remote/tab',name:'remote'}]}],
    layout:()=>({id:'sidebar',size:{px:width}}),window:()=>({platform:'macos'}),props:()=>overlayProps,
    theme:()=>({blocked:'#ff0000',dim:'#888888'}),shared:key=>state.get(key),setShared:(key,value)=>state.set(key,value),
    setAgentOrder:order=>calls.push(['order',order]),run:(name,args)=>calls.push([name,args]),
    openOverlay:args=>calls.push(['overlay',args]),closeOverlay:id=>calls.push(['closeOverlay',id]),
    localStorage:{getItem:()=>null,setItem(){},removeItem(){}},Date,Set,Map,JSON};
  runInNewContext(compile(native,'Agents'),context);
  if(decorated) runInNewContext(compile(adapter,'OnePieceAgents'),context);
  const controller=new context[decorated?'OnePieceAgents':'Agents']();
  controller.init({},cx);controller.hovered='t1';controller.render(cx);
  return {calls,nodes,cx,controller,state};
}

const standard=host(false), decorated=host(true);
for(const [nativeId,fleetId] of [['ag-t1','character-t1'],['sub-t2','character-t2'],['sub-t3','character-t3'],['ag-remote/t1','character-remote/t1']]) {
  assert.ok(decorated.nodes.has(fleetId), `missing fleet control ${fleetId}`);
  standard.nodes.get(nativeId).click(null,standard.cx);
  decorated.nodes.get(fleetId).click(null,decorated.cx);
  assert.equal(JSON.stringify(decorated.calls.at(-1)), JSON.stringify(standard.calls.at(-1)),fleetId);
}
const before=decorated.calls.length;
decorated.nodes.get('ship-t1').click(null,decorated.cx);
assert.equal(decorated.calls.length,before,'ship folding must not issue terminal commands');
decorated.nodes.clear();
decorated.controller.render(decorated.cx);
assert.ok(!decorated.nodes.has('character-t1'),'folded ship hides captain');
assert.ok(!decorated.nodes.has('character-t2'),'folded ship hides workers');
assert.ok(decorated.nodes.has('character-remote/t1'),'folding is local to one ship');
assert.ok(!decorated.nodes.has('space-s'),'character workspace must not be duplicated');
console.log('Native parity passed: captain focus, worker preview, placed worker focus, remote focus, and ship collapse.');

const menu=host(true,'priority',310,{appearance:'t1:1',overlay:'menu'});
assert.deepEqual(menu.calls,[['focus']],'appearance menu must take keyboard focus');
assert.equal(menu.nodes.get('crew-strawhat').focusHandle,menu.controller.menuFocus,
  'the first crew button must attach the focused handle');
menu.nodes.get('crew-redhair').click();
assert.equal(menu.state.get('one-piece.art').crews['t1:1'],'redhair');
menu.nodes.get('motion').click();
assert.equal(menu.state.get('one-piece.art').paused,true);
assert.deepEqual(menu.calls,[['focus'],['closeOverlay','menu'],['closeOverlay','menu']],
  'appearance choices must only save artwork and close the popup');
console.log('Appearance passed: initial keyboard focus, crew selection, animation toggle, and no terminal commands.');


const ordinary=host(true);
ordinary.nodes.get('space-personal').click();
assert.equal(JSON.stringify(ordinary.calls.at(-1)), JSON.stringify(['space.select',{id:'personal'}]));
ordinary.nodes.get('space-personal').right();
assert.equal(JSON.stringify(ordinary.calls.at(-1)), JSON.stringify(['overlay',{
  mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:'personal'}},
}]));
for (const availability of ['unavailable','loading']) {
  const offline=host(true,'priority',310,{},availability);
  assert.ok(!offline.nodes.has('ship-remote/t1'),`${availability} machine must not show animated ship`);
  assert.ok(!offline.nodes.has('character-remote/t1'),`${availability} machine must not imply a live captain`);
  assert.ok(offline.nodes.has('ship-t1'),'local ship remains reachable');
  assert.ok(offline.nodes.has('space-remote/s'),'native workspace remains reachable');
}
console.log('Workspace commands and unavailable/loading machine presentation passed.');

const rail=host(true,'priority',76);
for (const id of ['character-t1','character-t2']) {
  const row=rail.nodes.get(id).children[0];
  assert.equal(row.children[0].width,32,'narrow character artwork must fit the rail');
  assert.equal(row.children.length,1,'narrow characters use their accessible label and tooltip');
}
assert.equal(rail.nodes.get('ship-t1').children[0].children[0].width,32,'narrow ship must fit the rail');
rail.nodes.get('character-t2').click();
assert.equal(JSON.stringify(rail.calls.at(-1)),JSON.stringify(['terminal.peek',{terminal:'t2'}]));
console.log('Narrow sidebar keeps character artwork and native selection.');

const reachable=host(true);
assert.ok(reachable.nodes.has('terminal-t5'),'unregistered unplaced terminal must remain reachable');
reachable.nodes.get('terminal-t5').click();
assert.equal(JSON.stringify(reachable.calls.at(-1)),JSON.stringify(['terminal.peek',{terminal:'t5'}]));
assert.ok(!reachable.nodes.has('terminal-t1'),'grouped captain must not gain an ordinary terminal entry');
assert.ok(!reachable.nodes.has('terminal-t3'),'placed worker must not gain an ordinary terminal entry');
assert.equal(typeof reachable.nodes.get('character-t1').right,'function','captain retains its workspace menu');
reachable.nodes.get('character-t1').right();
assert.equal(JSON.stringify(reachable.calls.at(-1)),JSON.stringify(['overlay',{
  mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:'s'}},
}]));
reachable.nodes.get('character-t3').keydown({keystroke:'shift-f10'});
assert.equal(JSON.stringify(reachable.calls.at(-1)),JSON.stringify(['overlay',{
  mod:'menu',kind:'popup',width:200,height:260,props:{tab:'space',target:{id:'s'}},
}]));
assert.equal(typeof reachable.nodes.get('character-t2').right,'function');
const beforeUnplacedMenu=reachable.calls.length;
reachable.nodes.get('character-t2').right();
assert.equal(reachable.calls.length,beforeUnplacedMenu,'unplaced terminal must not invent a workspace');
console.log('Ungrouped terminal reachability and character workspace menus passed.');
