import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as fleet from '../mods/one-piece/fleet.js';
import * as records from '../mods/one-piece/records.js';

// The native UI runtime is unavailable in Node; execute the real controller with a host fixture.
const source=readFileSync(new URL('../mods/one-piece/main.js',import.meta.url),'utf8')
  .replace(/^import .*;\n/gm,'').replace('export default class Fleet','globalThis.Fleet = class Fleet');
function host({failTab=false,remote=false,failCleanup=false,independent=false,registrations=[]}={}) {
  const prefix=remote?'hz-server/':'';
  const worker={address:prefix+'t2',created_ms:12,state:'live',labels:{'firstmate.home':'test','firstmate.task':'work'},keep:false};
  if(independent) worker.labels={};
  const sessions=[worker], workspaces=[], views=[], calls=[], errors=[];
  let placeholder;
  let cfg={coordinators:registrations,inspections:{}};
  let recordReads={};
  const context={ScrollHandle:{new:()=>({release(){},scroll_to_item(){}})},...fleet,...records,label:fleet.terminalLabel,View:class{},Date,JSON,Set,Error,
    focused:()=>null,coreTerminals:()=>sessions,spaces:()=>workspaces,panes:()=>views,
    machines:()=>[{name:remote?'hz-server':null,layout:'ready'}],
    shared:key=>key==='one-piece'?cfg:recordReads,setShared:(key,value)=>{if(key==='one-piece') cfg=value;else recordReads=value;},notify:value=>errors.push(value),
    openOverlay:spec=>calls.push(['overlay',spec]),
    run:(name,args)=>{
      calls.push([name,args]);
      if(name==='tab.new'&&!failTab) {
        const id=`new-${views.length}`;
        workspaces.find(s=>s.id===args.space).tabs.push({id,name:args.name});
        views.push({pane:`pane-${id}`,tab:id,mod:args.mod,terminal:null});
      }
      if(name==='pane.split'&&args.mod&&!failTab) {
        const anchor=views.find(p=>p.pane===args.pane);
        views.push({pane:`inspection-${views.length}`,tab:anchor.tab,mod:args.mod,terminal:null});
      }
      if(name==='terminal.park') {
        const target=sessions.find(t=>t.address===args.terminal);
        target.keep=false;
        delete target.labels['herdr.space'];delete target.labels['herdr.tab'];
        for(let i=views.length-1;i>=0;i--) if(views[i].terminal===args.terminal) views.splice(i,1);
      }
    },
    hc:async args=>{
      calls.push(['hc',args]);
      if(args[0]==='run') {
        const raw=args.find(v=>v.startsWith('herdr.space=')).split('=')[1];
        workspaces.push({id:prefix+raw,machine:remote?'hz-server':null,tabs:[{id:'placeholder'}]});
        const name=args[args.indexOf('--name')+1];
        placeholder={address:prefix+'t9',name,state:'live',labels:{'one-piece.placeholder':name}};
        return {code:0,stdout:JSON.stringify({address:prefix+'t9'})};
      }
      if(args[0]==='get') return {code:0,stdout:JSON.stringify(placeholder)};
      if(args[0]==='kill') return {code:failCleanup?1:0,stderr:'cleanup failed'};
      if(args[0]==='label') {
        worker.keep=true;worker.labels['herdr.space']=args[2].split('=')[1];
        views.push({terminal:worker.address,tab:'writable'});
        const id=prefix+worker.labels['herdr.space'];
        if(!workspaces.some(s=>s.id===id)) workspaces.push({id,machine:remote?'hz-server':null,tabs:[{id:'writable'}]});
        else views.at(-1).tab=workspaces.find(s=>s.id===id).tabs[0].id;
      }
      return {code:0,stdout:''};
    }};
  runInNewContext(source,context);
  return {context,controller:new context.Fleet(),worker,sessions,workspaces,views,calls,errors,config:()=>cfg,cx:{stop_propagation(){},notify(){},async sleep(){},spawn(fn){return fn(this);}}};
}

test('a completed model turn does not claim that its firstmate task finished',()=>{
  const h=host();
  h.worker.status='done';
  h.context.observed=h.worker;
  assert.equal(runInNewContext('stateLabel(observed)',h.context),'Turn complete');
});

test('record reads use the registered machine and discard a result after its source changes',async()=>{
  const h=host({remote:true}),key=records.recordKey('hz-server','test');
  h.config().recordSources={[key]:{root:'/firstmate',home:'/home/fleet'}};
  h.context.appHome=()=>'/app';
  h.context.readTextFile=async()=> 'reader';
  let pending;
  h.cx.spawn=fn=>{pending=fn(h.cx);};
  h.context.exec=async(cmd,args,options)=>{
    assert.equal(cmd,'python3');
    assert.equal(options.on,'hz-server');
    const request=JSON.parse(args[2]);
    assert.equal(request.workers[0].address,'t2');
    assert.equal(request.workers[0].created_ms,12);
    h.config().recordSources[key]={root:'/firstmate',home:'/replacement'};
    return {code:0,stdout:'[]'};
  };
  h.controller.refreshRecords(h.cx);
  await pending;
  assert.equal(h.context.shared('one-piece-records')[key],undefined);
  h.context.exec=async()=>({code:1,stderr:'Cannot read home'});
  h.controller.refreshRecords(h.cx);
  await pending;
  assert.equal(h.context.shared('one-piece-records')[key].error,'Cannot read home');
  assert.equal(h.calls.length,0);
});

test('sidebar copies share in-flight record reads and publish invalid data as unavailable',async()=>{
  const h=host(),key=records.recordKey(null,'test');
  h.config().recordSources={[key]:{root:'/firstmate',home:'/fleet'}};
  h.context.appHome=()=>'/app';h.context.readTextFile=async()=> 'reader';
  const pending=[],responses=[];
  h.cx.spawn=fn=>pending.push(fn(h.cx));
  h.context.exec=()=>new Promise(resolve=>responses.push(resolve));
  h.controller.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  new h.context.Fleet().refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(responses.length,1);
  responses[0]({code:0,stdout:'[null]'});
  await Promise.all(pending);
  assert.match(h.context.shared('one-piece-records')[key].error,/invalid data/);
  assert.equal(h.context.shared('one-piece-records')[key].rows.length,0);
});

test('reopening a sidebar refreshes records after its previous owner closes during a read',async()=>{
  const h=host(),key=records.recordKey(null,'test');
  h.config().recordSources={[key]:{root:'/firstmate',home:'/fleet'}};
  h.context.appHome=()=>'/app';h.context.readTextFile=async()=> 'reader';
  const tasks=[],responses=[];
  h.cx.spawn=fn=>tasks.push(fn(h.cx));
  h.context.exec=()=>new Promise(resolve=>responses.push(resolve));
  h.controller.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  h.controller.close();
  const reopened=new h.context.Fleet();
  reopened.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(responses.length,2);
  responses[1]({code:0,stdout:JSON.stringify([{address:'t2',created_ms:12,task:'work',state:'done',decisions:[]}])});
  await tasks[1];
  assert.equal(records.withRecords(h.sessions,h.config().recordSources,h.context.shared('one-piece-records'))[0].taskRecord.state,'done');
});

test('a closed reader cannot clear or publish over a replacement read',async()=>{
  const h=host(),key=records.recordKey(null,'test');
  h.config().recordSources={[key]:{root:'/firstmate',home:'/fleet'}};
  h.context.appHome=()=>'/app';h.context.readTextFile=async()=> 'reader';
  const tasks=[],responses=[];
  h.cx.spawn=fn=>tasks.push(fn(h.cx));
  h.context.exec=()=>new Promise(resolve=>responses.push(resolve));
  h.controller.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  new h.context.Fleet().close();
  new h.context.Fleet().refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(responses.length,1);
  h.controller.close();
  const reopened=new h.context.Fleet();
  reopened.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  responses[0]({code:1,stderr:'Old reader failed'});
  await tasks[0];
  assert.equal(h.context.shared('one-piece-records')[key],undefined);
  reopened.refreshRecords(h.cx);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(responses.length,2);
  responses[1]({code:0,stdout:'[]'});
  await tasks[1];
  assert.equal(h.context.shared('one-piece-records')[key].error,undefined);
});

test('cleanup refuses a terminal without the recorded ownership label',async()=>{
  const h=host({failCleanup:true});
  h.config().placeholders=[{name:'op-view-123-456',machine:fleet.machineOf(h.worker.address)}];
  const record=h.config().placeholders[0];
  h.calls.length=0;
  h.context.hc=async args=>{h.calls.push(['hc',args]);return {code:0,stdout:JSON.stringify({address:'t9',name:record.name,state:'live',labels:{}})};};
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.config().placeholders.length,1);
  assert.ok(!h.calls.some(([_cmd,args])=>args[0]==='kill'));
  assert.ok(h.errors.some(e=>e.body.includes('ownership')));
});

test('cleanup forgets an absent placeholder without killing another process',async()=>{
  const h=host({failCleanup:true});
  h.config().placeholders=[{name:'op-view-123-456',machine:fleet.machineOf(h.worker.address)}];
  h.calls.length=0;
  h.context.hc=async args=>{h.calls.push(['hc',args]);return {code:3,stderr:JSON.stringify({error:{kind:'not_found'}})};};
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.config().placeholders.length,0);
  assert.ok(!h.calls.some(([_cmd,args])=>args[0]==='kill'));
});

test('cleanup reports an actionable unavailable machine without exposing raw JSON',async()=>{
  const h=host({remote:true,failCleanup:true});
  h.config().placeholders=[{name:'op-view-123-456',machine:fleet.machineOf(h.worker.address)}];
  h.errors.length=0;
  h.context.hc=async()=>({code:3,stderr:JSON.stringify({error:{kind:'unavailable',message:'hz-server is unreachable',hint:'hc machine ls shows when it comes back'}})});
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.errors[0].body,'Reconnect hz-server, then retry cleanup.');
  assert.equal(h.config().placeholders.length,1);
});

function firstmateHost(registrations) {
  const h=host({independent:true,registrations});
  h.sessions.push({address:'t3',created_ms:13,state:'live',labels:{}});
  h.workspaces.push({id:'captain',machine:null,tabs:[{id:'captain-tab'}]});
  h.views.push({terminal:'t3',tab:'captain-tab'});
  return h;
}

function registrationHost(registrations) {
  const h=firstmateHost(registrations);
  const actions=new Map();
  function element() {
    let id;
    const node=new Proxy({}, {get:(_target,key)=>(...args)=>{
      if(key==='id') id=args[0];
      if(key==='on_click') actions.set(id,args[0]);
      return node;
    }});
    return node;
  }
  Object.assign(h.context,{props:()=>({machine:null,overlay:'setup'}),
    div:element,h_flex:element,v_flex:element,Input:{new:element},
    closeOverlay:id=>h.calls.push(['close',id])});
  h.controller.role='firstmate';
  h.controller.selected='t3';
  h.controller.homeInput={value:()=> 'test'};
  h.controller.aliasInput={value:()=> 'Water 7'};
  h.controller.setupView(h.cx);
  h.cx.spawn=task=>task(h.cx);
  return {...h,link:()=>actions.get('save-firstmate')(null,h.cx)};
}

test('setup replaces an ended coordinator with the selected live session',async()=>{
  const h=registrationHost([{terminal:'t1',created:1,home:'test',role:'firstmate'}]);
  await h.link();
  assert.equal(h.controller.error,undefined);
  assert.equal(h.config().coordinators.length,1);
  assert.equal(h.config().coordinators[0].terminal,'t3');
});

test('setup rejects a selection that ended after the dialog rendered',async()=>{
  const h=registrationHost([]);
  h.sessions.find(t=>t.address==='t3').state='dead';
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.match(h.controller.error,/live session/);
});

test('setup preserves a different live coordinator with the same home',async()=>{
  const h=registrationHost([{terminal:'t2',created:12,home:'test',role:'firstmate'}]);
  await h.link();
  assert.equal(h.config().coordinators[0].terminal,'t2');
  assert.match(h.controller.error,/already linked/);
});

test('setup rejects a machine that disconnects after rendering',async()=>{
  const h=registrationHost([]);
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.match(h.controller.error,/live session/);
});

test('setup rejects a terminal identifier reused after rendering',async()=>{
  const h=registrationHost([]);
  h.sessions.find(t=>t.address==='t3').created_ms=14;
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.match(h.controller.error,/live session/);
});

test('replacing a stale home preserves registrations on other machines',async()=>{
  const h=registrationHost([
    {terminal:'t1',created:1,home:'test',role:'firstmate'},
    {terminal:'hz-server/t1',created:1,home:'test',role:'firstmate'}
  ]);
  await h.link();
  assert.equal(h.config().coordinators.length,2);
  assert.ok(h.config().coordinators.some(r=>r.terminal==='hz-server/t1'));
  assert.ok(h.config().coordinators.some(r=>r.terminal==='t3'));
});

function paneControlsHost() {
  const h=host({remote:true,independent:true});
  const clicks=new Map();
  function element() {
    let id,proxy;
    proxy=new Proxy({}, {get:(_target,key)=>(...args)=>{
      if(key==='id') id=args[0];
      if(key==='on_click') clicks.set(id,args[0]);
      if(key==='when'&&args[0]) args[1](proxy);
      return proxy;
    }});
    return proxy;
  }
  Object.assign(h.context,{h_flex:element,v_flex:element,div:element,image:element,svg:element,
    focused:()=>({tab:'hz-server/tab'}),props:()=>({pane:'hz-server/p1'})});
  h.workspaces.push({id:'hz-server/space',machine:'hz-server',active:true,tabs:[{id:'hz-server/tab'}]});
  h.views.push({pane:'hz-server/p1',terminal:h.worker.address,tab:'hz-server/tab',focused:true},{pane:'hz-server/p2',tab:'hz-server/tab',mod:'probe'});

  return {...h,clicks,render(){clicks.clear();h.controller.header();h.controller.paneHeader();}};
}


for(const remote of [false,true]) test(`opening a ${remote?'remote':'local'} worker adopts the same process only once`,async()=>{
  const h=host({remote});
  await h.controller.select(h.worker,h.cx);
  await h.controller.select(h.worker,h.cx);
  assert.equal(h.calls.filter(([name])=>name==='hc').length,1);
  assert.equal(h.calls[0][1][0],'label');
  assert.equal(h.calls.filter(([name])=>name==='pane.focus').length,2);
  assert.equal(h.views.filter(p=>p.terminal===h.worker.address).length,1);
  assert.deepEqual(h.errors,[]);
});

test('legacy inspection adoption preserves the workspace and removes only its old mod pane',async()=>{
  const h=host({remote:true});
  h.config().inspections[fleet.identity(h.worker)]={space:'hz-server/old',tab:'old-tab',pane:'old-view'};
  h.workspaces.push({id:'hz-server/old',machine:'hz-server',tabs:[{id:'old-tab'}]});
  h.views.push({pane:'old-view',mod:'one-piece',tab:'old-tab'}, {pane:'personal',terminal:'hz-server/t9',tab:'old-tab'});
  await h.controller.select(h.worker,h.cx);
  const close=h.calls.filter(([name])=>name==='pane.close');
  assert.equal(close.length,1);
  assert.equal(close[0][1].pane,'old-view');
  assert.equal(h.config().inspections[fleet.identity(h.worker)],undefined);
  assert.ok(h.views.some(p=>p.pane==='personal'));
});

for(const change of ['offline','replaced','ended']) test(`selection does nothing when target is ${change}`,async()=>{
  const h=host(),target={...h.worker};
  if(change==='offline') h.context.machines=()=>[{name:null,layout:'unavailable'}];
  if(change==='replaced') h.worker.created_ms++;
  if(change==='ended') h.worker.state='finished';
  await h.controller.select(target,h.cx);
  assert.equal(h.calls.length,0);
});

test('Add terminal uses launch folder and remote workspace, without relaunching worker argv',()=>{
  const h=paneControlsHost();
  h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};
  h.worker.cwd='/original';h.worker.foreground={cwd:'/changed'};
  h.worker.argv=['claude'];
  h.controller.addTerminal(h.worker,'hz-server/space');
  assert.equal(h.calls.length,1);
  assert.equal(h.calls[0][0],'tab.new');
  assert.equal(h.calls[0][1].space,'hz-server/space');
  assert.equal(h.calls[0][1].folder,'/original');
  assert.equal(h.calls[0][1].argv,undefined);
});

test('Add terminal refuses a replaced worker and a missing original folder',()=>{
  const h=paneControlsHost(),target={...h.worker};
  h.worker.created_ms++;
  h.controller.addTerminal(target,'hz-server/space');
  h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};
  h.controller.addTerminal(h.worker,'hz-server/space');
  assert.equal(h.calls.length,0);
  assert.equal(h.errors.length,1);
});

test('worker headers use the same native split, zoom, and close commands as regular terminals',()=>{
  const h=paneControlsHost();
  h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};
  h.render();
  for(const id of ['split-right','split-down','zoom','close']) h.clicks.get(`${id}-hz-server/p1`)(null,h.cx);
  assert.deepEqual(h.calls.map(([name])=>name),['pane.split','pane.split','pane.zoom','pane.close']);
  h.calls.length=0;
  h.context.machines=()=>[{name:'hz-server',layout:'unavailable'}];
  for(const id of ['split-right','split-down','zoom','close']) h.clicks.get(`${id}-hz-server/p1`)(null,h.cx);
  assert.equal(h.calls.length,0);
});

test('linking secondmate keeps its live terminal writable',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  await h.controller.linkCoordinator(h.sessions.find(t=>t.address==='t3'),'test','secondmate','setup',h.cx);
  assert.equal(h.config().coordinators[0].role,'secondmate');
  assert.ok(h.views.some(p=>p.terminal==='t3'));
  assert.equal(h.calls.filter(([name])=>name==='terminal.park'||name==='hc').length,0);
});

test('Add terminal retains the workspace crewmate launch folder after personal focus',()=>{
  const h=paneControlsHost();
  h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};
  h.worker.cwd='/original';
  const personal={address:'hz-server/t9',created_ms:19,state:'live',labels:{},cwd:'/personal',foreground:{cwd:'/changed'}};
  h.sessions.push(personal);
  h.views.push({pane:'personal',terminal:personal.address,tab:'hz-server/tab'});
  h.controller.addTerminal(personal,'hz-server/space');
  assert.equal(h.calls[0][1].folder,'/original');
});

test('newer selection wins when an earlier terminal adoption is pending',async()=>{
  const h=host();
  let finish;
  const original=h.context.hc;
  h.context.hc=async args=>{await new Promise(resolve=>{finish=resolve;});return original(args);};
  const pending=h.controller.select(h.worker,h.cx);
  const other={address:'t3',created_ms:13,state:'live',labels:{}};
  h.sessions.push(other);
  h.workspaces.push({id:'other',machine:null,tabs:[{id:'other-tab'}]});
  h.views.push({pane:'other-pane',terminal:other.address,tab:'other-tab'});
  await h.controller.select(other,h.cx);
  finish();await pending;
  assert.deepEqual(h.calls.filter(([name])=>name==='pane.focus').map(([,args])=>args.terminal),['t3']);
});
