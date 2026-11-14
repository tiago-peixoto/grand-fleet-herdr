// Execute both implementations against the same host and compare user actions.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import * as fleet from '../mods/one-piece/artwork.js';
const home=process.argv[2];
if(!home) throw new Error('Usage: node tools/check-parity.mjs HERDR_APP_HOME');
const native=readFileSync(resolve(home,'mods/agents/main.js'),'utf8');
const adapter=readFileSync(new URL('../mods/one-piece/main.js',import.meta.url),'utf8');
const compile=(source,name)=>source.replace(/^import .*;\n/gm,'').replace(/export default class \w+/,`globalThis.${name} = class ${name}`);

function host(decorated,sort='priority',width=310,overlayProps={}) {
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
    {address:'t4',created_ms:5,state:'live',labels:{}}];
  const agents=[all[1],all[3],all[4]].map((t,i)=>({...t,pane:`p${i}`,space:i===2?'remote/s':'s',space_name:'project',tab:i===2?'remote/tab':'tab',seq:i,pinned:false}));
  const panes=agents.map(a=>({terminal:a.address,pane:a.pane,tab:a.tab,program}));
  const cx={notify(){},stop_propagation(){},timer:{every(){}},focus_handle:()=>({focus:()=>calls.push(['focus'])})};
  const context={...fleet,View:class{},Button:{new:id=>element().id(id)},div:element,image:element,svg:element,h_flex:element,v_flex:element,
    agents:()=>agents,terminals:()=>all,panes:()=>panes,focused:()=>({agent:'t1'}),
    spaces:()=>[{id:'s',tabs:[{id:'tab',name:'project'}]},{id:'remote/s',tabs:[{id:'remote/tab',name:'remote'}]}],
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

for(const sort of ['priority','grouped']) {
  const standard=host(false,sort),decorated=host(true,sort);
  assert.equal(JSON.stringify(decorated.calls),JSON.stringify(standard.calls),'agent keyboard order');
  for(const id of ['ag-t1','sub-t2','sub-t3','ag-remote/t1','pin-t1','ag-sort']) {
    assert.ok(standard.nodes.has(id)&&decorated.nodes.has(id),`missing control ${id}`);
    standard.nodes.get(id).click(null,standard.cx);
    decorated.nodes.get(id).click(null,decorated.cx);
    assert.equal(JSON.stringify(decorated.calls),JSON.stringify(standard.calls),`${sort}: ${id}`);
  }
  const before=decorated.calls.length;
  decorated.nodes.get('ship-t1').click(null,decorated.cx);
  assert.equal(decorated.controller.folded.has('t1'),true);
  assert.equal(decorated.calls.length,before,'ship folding must not issue terminal commands');
}
console.log('Native parity passed: priority/grouped order, local/remote focus, child peek, kept child focus, pin, sort, and ship folding.');

const rail=host(true,'priority',76);
const status=rail.controller.status({}, {address:'t1',status:'working'},true);
assert.ok(status.children.every(child=>child.width<=14),'collapsed status artwork must fit native 14px slot');

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
