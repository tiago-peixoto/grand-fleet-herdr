import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import * as fleet from '../mods/one-piece/fleet.js';
import * as shells from '../mods/one-piece/shells.js';

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
  const context={...fleet,...shells,View:class{},Date,JSON,Set,Error,
    coreTerminals:()=>sessions,spaces:()=>workspaces,panes:()=>views,
    machines:()=>[{name:remote?'hz-server':null,layout:'ready'}],
    shared:()=>cfg,setShared:(_key,value)=>{cfg=value;},notify:value=>errors.push(value),
    openOverlay:spec=>calls.push(['overlay',spec]),
    run:(name,args)=>{
      calls.push([name,args]);
      if(name==='tab.new'&&!failTab) {
        const id=`inspection-${views.length}`;
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
        workspaces.push({id:prefix+worker.labels['herdr.space'],tabs:[{id:'writable'}]});
      }
      return {code:0,stdout:''};
    }};
  runInNewContext(source,context);
  return {context,controller:new context.Fleet(),worker,sessions,workspaces,views,calls,errors,config:()=>cfg,cx:{notify(){},async sleep(){}}};
}

test('failed inspection creation never adopts a worker into a writable pane',async()=>{
  const h=host({failTab:true});
  await h.controller.inspect(h.worker,h.cx);
  assert.equal(h.worker.keep,false);
  assert.equal(h.worker.labels['herdr.space'],undefined);
  assert.ok(h.errors.some(e=>e.body.includes('inspection')));
  assert.ok(h.calls.some(([cmd,args])=>cmd==='hc'&&args[0]==='kill'&&args[1].startsWith('op-view-')));
});

test('remote inspection uses a temporary shell on the worker machine and removes only that shell',async()=>{
  const h=host({remote:true});
  await h.controller.inspect(h.worker,h.cx);
  const spawn=h.calls.find(([cmd,args])=>cmd==='hc'&&args[0]==='run')?.[1];
  assert.ok(spawn);
  assert.equal(spawn[spawn.indexOf('--on')+1],'hz-server');
  assert.ok(h.calls.some(([cmd,args])=>cmd==='hc'&&args[0]==='kill'&&args[1].startsWith('hz-server/op-view-')));
  assert.ok(h.config().inspections['hz-server/t2:12']);
  assert.equal(h.worker.keep,false);
});

test('failed placeholder cleanup persists its identity and can be retried after reconnection',async()=>{
  const h=host({remote:true,failCleanup:true});
  await h.controller.inspect(h.worker,h.cx);
  assert.equal(h.config().placeholders.length,1);
  const record=h.config().placeholders[0];
  assert.equal(record.machine,'hz-server');
  const original=h.context.hc;
  h.context.hc=async args=>args[0]==='kill'?{code:0,stdout:''}:original(args);
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.config().placeholders.length,0);
});

test('cleanup refuses a terminal without the recorded ownership label',async()=>{
  const h=host({failCleanup:true});
  await h.controller.inspect(h.worker,h.cx);
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
  await h.controller.inspect(h.worker,h.cx);
  h.calls.length=0;
  h.context.hc=async args=>{h.calls.push(['hc',args]);return {code:3,stderr:JSON.stringify({error:{kind:'not_found'}})};};
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.config().placeholders.length,0);
  assert.ok(!h.calls.some(([_cmd,args])=>args[0]==='kill'));
});

test('orphaned placeholders are rediscovered from their ownership labels after interruption',()=>{
  const h=host();
  h.sessions.push({address:'t9',name:'op-view-123-456',state:'live',labels:{'one-piece.placeholder':'op-view-123-456'}});
  h.sessions.push({address:'t8',name:'op-view-123-999',state:'live',labels:{}});
  h.controller.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,1);
  assert.equal(h.config().placeholders[0].name,'op-view-123-456');
  h.controller.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,1);
});

test('cleanup errors stay visible without discarding a usable inspection',async()=>{
  const h=host({failCleanup:true});
  await h.controller.inspect(h.worker,h.cx);
  assert.ok(h.errors.some(e=>e.body.includes('cleanup failed')));
  assert.ok(h.config().inspections['t2:12']);
  assert.equal(h.worker.keep,false);
});


test('independent attention creates a dedicated workspace instead of using the focused worker space',async()=>{
  const h=host({independent:true});
  await h.controller.openIndependent(h.worker,h.cx);
  assert.equal(h.worker.labels['herdr.space'],'op-independent-t2-12');
  assert.ok(h.calls.some(([cmd,args])=>cmd==='space.select'&&args.id==='op-independent-t2-12'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.keep'));
});

test('independent attention cannot adopt a supervised worker',async()=>{
  const h=host();
  await h.controller.openIndependent(h.worker,h.cx);
  assert.equal(h.calls.length,0);
  assert.ok(h.errors.some(e=>e.body.includes('no longer available')));
});

function closeHost() {
  const h=host({independent:true});
  h.context.props=()=>({overlay:'close-test',target:{terminal:'t2',created:12}});
  h.context.closeOverlay=id=>h.calls.push(['close-overlay',id]);
  return h;
}

test('close ends only the personal process identified by its confirmation',()=>{
  const h=closeHost();
  h.controller.closeTerminal();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='terminal.kill'&&args.terminal==='t2'));
});

test('stale close cannot end a replacement, supervised, or unavailable session',()=>{
  for(const change of [
    h=>{h.worker.created_ms=13;},
    h=>{h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};},
    h=>{h.config().coordinators.push({terminal:'t2',created:12});},
    h=>{h.context.machines=()=>[{name:null,layout:'unavailable'}];}
  ]) {
    const h=closeHost();change(h);
    h.controller.closeTerminal();
    assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.kill'));
    assert.ok(h.errors.length);
  }
});

function firstmateHost(registrations) {
  const h=host({independent:true,registrations});
  h.sessions.push({address:'t3',created_ms:13,state:'live',labels:{}});
  h.workspaces.push({id:'captain',tabs:[{id:'captain-tab'}]});
  h.views.push({terminal:'t3',tab:'captain-tab'});
  return h;
}

test('firstmate navigation skips stale and offline registrations',()=>{
  const h=firstmateHost([
    {terminal:'t1',created:1,role:'firstmate'},
    {terminal:'hz-server/t1',created:1,role:'firstmate'},
    {terminal:'t3',created:13,role:'firstmate'}
  ]);
  h.controller.openFirstmate();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='pane.focus'&&args.terminal==='t3'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='overlay'));
});

test('multiple live firstmates require an explicit choice without changing the workspace',()=>{
  const h=firstmateHost([
    {terminal:'t2',created:12,role:'firstmate'},
    {terminal:'t3',created:13,role:'firstmate'}
  ]);
  h.controller.openFirstmate();
  assert.equal(h.calls.length,1);
  assert.equal(h.calls[0][0],'overlay');
  assert.equal(h.calls[0][1].props.view,'firstmates');
});

test('no available firstmate opens the chooser without selecting another role',()=>{
  const h=firstmateHost([{terminal:'t3',created:13,role:'secondmate'}]);
  h.controller.openFirstmate();
  assert.equal(h.calls.length,1);
  assert.equal(h.calls[0][0],'overlay');
});

function pendingInspectionRead() {
  const h=host();
  let value='Old terminal output',resolve;
  const response=new Promise(done=>{resolve=done;});
  h.context.hc=()=>response;
  h.context.props=()=>({target:{terminal:h.worker.address,created:h.worker.created_ms}});
  h.controller.editor={value:()=>value,set_value:text=>{value=text;}};
  h.controller.updated=123;
  h.controller.error='';
  h.cx.spawn=task=>{h.pending=task(h.cx);};
  h.controller.refresh(h.cx);
  return {...h,value:()=>value,resolve};
}

test('disconnect clears cached inspection output even while a read is pending',async()=>{
  const h=pendingInspectionRead();
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  h.controller.refresh(h.cx);
  const cleared=h.value();
  h.resolve({code:0,stdout:JSON.stringify({text:'Late terminal output'})});
  await h.pending;
  assert.match(cleared,/unavailable/);
  assert.equal(h.controller.updated,null);
  assert.doesNotMatch(h.value(),/Old terminal|Late terminal/);
});

test('a read that finishes after disconnection clears prior output immediately',async()=>{
  const h=pendingInspectionRead();
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  h.resolve({code:0,stdout:JSON.stringify({text:'Late terminal output'})});
  await h.pending;
  assert.match(h.value(),/unavailable/);
  assert.equal(h.controller.updated,null);
});

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

function restoreHost(remote=false) {
  const h=host({remote});
  const record={terminal:remote?'hz-server/t20':'t20',created:20,space:remote?'hz-server/captain':'captain',tab:remote?'hz-server/chat':'chat',cwd:'/work/project',machine:remote?'hz-server':null};
  h.context.setShared('one-piece',{...h.config(),shells:[record]});
  const hc=h.context.hc;
  h.context.hc=async args=>{
    const result=await hc(args);
    if(args[0]==='run') {
      const address=JSON.parse(result.stdout).address;
      h.sessions.push({address,created_ms:21,state:'live',program:{shell:true},name:args[args.indexOf('--name')+1],labels:{'one-piece.restored':'true'}});
      h.workspaces.at(-1).tabs[0].id=record.tab;
      h.views.push({terminal:address,tab:record.tab,cwd:record.cwd});
    }
    return result;
  };
  return {...h,record};
}

test('restoration starts only a new default shell in the recorded machine, directory and tab',async()=>{
  const h=restoreHost(true);
  await h.controller.restoreShell(h.record,h.cx);
  const args=h.calls.find(([cmd,args])=>cmd==='hc'&&args[0]==='run')[1];
  assert.equal(args[args.indexOf('--on')+1],'hz-server');
  assert.equal(args[args.indexOf('--cwd')+1],'/work/project');
  assert.ok(args.includes('herdr.space=captain'));
  assert.ok(args.includes('herdr.tab=chat'));
  assert.ok(args.includes('one-piece.restored=true'));
  assert.ok(!args.includes('--'));
  assert.equal(h.config().shells[0].newProcess,true);
  assert.equal(h.errors.filter(e=>e.level==='error').length,0);
  assert.ok(!h.calls.some(([cmd])=>cmd==='pane.focus'||cmd==='terminal.kill'));
});

test('restoration does nothing when the original process survives or the machine disconnects',async()=>{
  const h=restoreHost();
  h.sessions.push({address:'t20',created_ms:20,state:'live'});
  await h.controller.restoreShell(h.record,h.cx);
  assert.equal(h.calls.length,0);
  h.sessions.pop();
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  await h.controller.restoreShell(h.record,h.cx);
  assert.equal(h.calls.length,0);
});

test('restoration retries use the same unique name after an uncertain response',async()=>{
  const h=restoreHost();
  h.context.hc=async args=>{h.calls.push(['hc',args]);throw new Error('Connection lost');};
  await h.controller.restoreShell(h.record,h.cx);
  await h.controller.restoreShell(h.record,h.cx);
  const requests=h.calls.filter(([cmd])=>cmd==='hc').map(([,args])=>args);
  assert.equal(requests.length,2);
  assert.equal(requests[0][requests[0].indexOf('--name')+1],requests[1][requests[1].indexOf('--name')+1]);
  assert.ok(h.errors.some(e=>e.body.includes('Connection lost')));
});

test('retry from another controller leaves an active inspection placeholder alone',async()=>{
  const h=host({remote:true});
  const original=h.context.hc;
  let release,started;
  const gate=new Promise(resolve=>{release=resolve;});
  const launching=new Promise(resolve=>{started=resolve;});
  h.context.hc=async args=>{
    const result=await original(args);
    if(args[0]==='run') {started();await gate;}
    return result;
  };
  const pending=h.controller.inspect(h.worker,h.cx);
  await launching;
  const other=new h.context.Fleet();
  try {
    await other.cleanupPlaceholders(h.cx);
    assert.equal(h.config().placeholders.length,1);
    assert.ok(!h.calls.some(([cmd,args])=>cmd==='hc'&&args[0]==='kill'));
  } finally {release();await pending;}
  assert.ok(h.config().inspections['hz-server/t2:12']);
  assert.equal(h.config().placeholders.length,0);
});

test('successful cleanup is not rediscovered while the terminal cache catches up',async()=>{
  const h=host({remote:true});
  const original=h.context.hc;
  h.context.hc=async args=>{
    const result=await original(args);
    if(args[0]==='get') h.sessions.push(JSON.parse(result.stdout));
    return result;
  };
  await h.controller.inspect(h.worker,h.cx);
  assert.equal(h.config().placeholders.length,0);
  const other=new h.context.Fleet();
  other.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,0);
  h.sessions.splice(1);
  other.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,0);
  h.sessions.push({address:'hz-server/t10',name:'op-view-123-456',state:'live',labels:{'one-piece.placeholder':'op-view-123-456'}});
  other.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,1);
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
  Object.assign(h.context,{h_flex:element,v_flex:element,div:element,
    focused:()=>({tab:'hz-server/tab'}),props:()=>({pane:'hz-server/p1'})});
  h.workspaces.push({id:'hz-server/space',machine:'hz-server',active:true,tabs:[{id:'hz-server/tab'}]});
  h.views.push({pane:'hz-server/p1',terminal:h.worker.address,tab:'hz-server/tab',focused:true});
  return {...h,clicks,render(){clicks.clear();h.controller.header();h.controller.paneHeader();}};
}

const paneControlIds=['new-terminal','zoom-grid','zoom-hz-server/p1','close-hz-server/p1'];

test('unavailable and loading remote panes offer no split, zoom or close controls',()=>{
  for(const layout of ['unavailable','loading']) {
    const h=paneControlsHost();
    h.context.machines=()=>[{name:'hz-server',layout}];
    h.render();
    for(const id of paneControlIds) assert.equal(h.clicks.has(id),false,id);
  }
});

test('pane callbacks recheck readiness after rendering and work after reconnection',()=>{
  const h=paneControlsHost();
  h.render();
  h.context.machines=()=>[{name:'hz-server',layout:'unavailable'}];
  for(const id of paneControlIds) h.clicks.get(id)();
  assert.equal(h.calls.length,0);
  h.context.machines=()=>[{name:'hz-server',layout:'ready'}];
  h.render();
  for(const id of paneControlIds) h.clicks.get(id)();
  assert.equal(h.calls.filter(([cmd])=>cmd==='pane.split').length,1);
  assert.equal(h.calls.filter(([cmd])=>cmd==='pane.zoom').length,2);
  assert.equal(h.calls.filter(([cmd])=>cmd==='overlay').length,1);
});

test('closing the inspection controller releases its placeholder for another copy to clean',async()=>{
  const h=host({remote:true});
  const original=h.context.hc;
  let release,started;
  const gate=new Promise(resolve=>{release=resolve;});
  const launching=new Promise(resolve=>{started=resolve;});
  h.context.hc=async args=>{
    const result=await original(args);
    if(args[0]==='run') {started();await gate;throw new Error('inspection cancelled');}
    return result;
  };
  const pending=h.controller.inspect(h.worker,h.cx);
  await launching;
  try {
    h.controller.close();
    await new h.context.Fleet().cleanupPlaceholders(h.cx);
    assert.equal(h.config().placeholders.length,0);
    assert.ok(h.calls.some(([cmd,args])=>cmd==='hc'&&args[0]==='kill'));
  } finally {release();await pending;}
});

test('cleanup acknowledgement does not hide an orphan with the same name on another machine',async()=>{
  const h=host({remote:true});
  const original=h.context.hc;
  h.context.hc=async args=>{
    const result=await original(args);
    if(args[0]==='get') {
      const remote=JSON.parse(result.stdout);
      h.sessions.push(remote,{...remote,address:'t9'});
    }
    return result;
  };
  await h.controller.inspect(h.worker,h.cx);
  h.controller.rememberPlaceholders();
  assert.equal(h.config().placeholders.length,1);
  assert.equal(h.config().placeholders[0].machine,null);
});


test('linking secondmate parks before registration and closes setup only after inspection cleanup',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const save=h.context.setShared;
  h.context.setShared=(key,value)=>{
    if(value.coordinators.some(r=>r.role==='secondmate'))
      assert.ok(!h.views.some(p=>p.terminal==='t3'),'registered secondmate must not retain a writable pane');
    save(key,value);
  };
  const original=h.context.hc;
  let release,started;
  const gate=new Promise(resolve=>{release=resolve;});
  const launching=new Promise(resolve=>{started=resolve;});
  h.context.hc=async args=>{
    if(args[0]==='run') {started();await gate;}
    return original(args);
  };
  const pending=h.link();
  // Give synchronous implementations a chance to fail without waiting for a launch.
  await Promise.race([launching,Promise.resolve(pending)]);
  try {
    assert.ok(h.calls.some(([cmd])=>cmd==='terminal.park'));
    assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
  } finally {release();await pending;}
  const inspection=h.config().inspections['t3:13'];
  assert.ok(h.views.some(p=>p.pane===inspection.pane&&p.mod==='one-piece'));
  assert.equal(h.config().placeholders.length,0);
  assert.equal(h.calls.at(-1)[0],'close');
  assert.equal(h.sessions.find(t=>t.address==='t3').state,'live');
});

test('cancelled setup while parking never publishes a secondmate registration',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  h.context.run=(cmd,args)=>h.calls.push([cmd,args]);
  h.cx.sleep=async()=>{h.controller.close();throw new Error('context closed');};
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
});

test('failed secondmate inspection leaves the session parked and setup open',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const run=h.context.run;
  h.context.run=(cmd,args)=>{if(cmd!=='tab.new') run(cmd,args);};
  await h.link();
  assert.ok(!h.views.some(p=>p.terminal==='t3'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
  assert.equal(h.config().coordinators[0].role,'secondmate');
  assert.equal(h.sessions.find(t=>t.address==='t3').state,'live');
  assert.ok(h.errors.some(e=>e.body.includes('inspection')));
});

test('setup cancellation during inspection preserves the parked session and skips overlay closure',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const original=h.context.hc;
  h.context.hc=async args=>{
    const result=await original(args);
    if(args[0]==='run') h.controller.close();
    return result;
  };
  await h.link();
  assert.ok(!h.views.some(p=>p.terminal==='t3'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='tab.new'));
});

test('reopening a closed inspection pane rebuilds beside the surviving personal terminal',async()=>{
  const h=host();
  const personal={address:'t3',created_ms:13,state:'live',labels:{}};
  const pane={pane:'personal',terminal:'t3',tab:'remaining-tab'};
  h.sessions.push(personal);
  h.views.push(pane);
  h.workspaces.push({id:'old-view',machine:null,tabs:[{id:'remaining-tab'}]});
  h.config().inspections['t2:12']={space:'old-view',tab:'remaining-tab',pane:'closed-inspection'};
  await h.controller.inspect(h.worker,h.cx);
  assert.equal(h.views.find(p=>p.pane==='personal'),pane);
  assert.equal(personal.state,'live');
  const saved=h.config().inspections['t2:12'];
  assert.equal(saved.tab,'remaining-tab');
  assert.ok(h.views.some(p=>p.pane===saved.pane&&p.mod==='one-piece'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.kill'||cmd==='pane.close'||cmd==='tab.close'));
  h.calls.length=0;
  await h.controller.inspect(h.worker,h.cx);
  assert.ok(!h.calls.some(([cmd])=>cmd==='pane.split'||cmd==='tab.new'||cmd==='hc'));
});

test('async context cancellation after parking cannot publish registration',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    run(cmd,args);
    if(cmd==='terminal.park') h.cx.notify=()=>{throw new Error('context cancelled');};
  };
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
  assert.ok(!h.views.some(p=>p.terminal==='t3'));
});

test('registration rechecks machine readiness after parking',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    run(cmd,args);
    if(cmd==='terminal.park') h.context.machines=()=>[{name:null,layout:'unavailable'}];
  };
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
});

test('failed inspection split preserves the adjacent personal pane and process',async()=>{
  const h=host({failTab:true});
  const personal={address:'t3',created_ms:13,state:'live',labels:{}};
  const pane={pane:'personal',terminal:'t3',tab:'remaining-tab'};
  h.sessions.push(personal);
  h.views.push(pane);
  h.workspaces.push({id:'old-view',machine:null,tabs:[{id:'remaining-tab'}]});
  const record={space:'old-view',tab:'remaining-tab',pane:'closed-inspection'};
  h.config().inspections['t2:12']=record;
  assert.equal(await h.controller.inspect(h.worker,h.cx),undefined);
  assert.equal(h.views[0],pane);
  assert.equal(personal.state,'live');
  assert.equal(h.config().inspections['t2:12'],record);
  assert.ok(!h.calls.some(([cmd])=>cmd==='hc'||cmd==='pane.close'||cmd==='tab.close'));
  assert.ok(h.errors.some(e=>e.body.includes('inspection')));
});

test('a pane reattached before registration prevents inspection-only publication',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    run(cmd,args);
    if(cmd==='terminal.park') queueMicrotask(()=>h.views.push({pane:'reattached',terminal:'t3',tab:'personal-tab'}));
  };
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
});

test('an awaited parking failure refreshes the visible setup error',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  h.context.run=(cmd,args)=>h.calls.push([cmd,args]);
  h.cx.sleep=async()=>{throw new Error('parking unavailable');};
  const rendered=[];
  h.cx.notify=()=>rendered.push(h.controller.error);
  await h.link();
  assert.equal(rendered.at(-1),'parking unavailable');
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
});

test('failed inspection can be retried after setup rerenders with a parked secondmate',async()=>{
  const h=registrationHost([]);
  h.controller.role='secondmate';
  const run=h.context.run;
  h.context.run=(cmd,args)=>{if(cmd!=='tab.new') run(cmd,args);};
  await h.link();
  assert.equal(h.config().inspections['t3:13'],undefined);
  h.context.run=run;
  h.controller.setupView(h.cx);
  await h.link();
  assert.ok(h.config().inspections['t3:13']);
  assert.equal(h.calls.at(-1)[0],'close');
});
