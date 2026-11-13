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
  const context={ScrollHandle:{new:()=>({release(){},scroll_to_item(){}})},...fleet,...shells,label:fleet.terminalLabel,View:class{},Date,JSON,Set,Error,
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
        workspaces.push({id:prefix+worker.labels['herdr.space'],machine:remote?'hz-server':null,tabs:[{id:'writable'}]});
      }
      return {code:0,stdout:''};
    }};
  runInNewContext(source,context);
  return {context,controller:new context.Fleet(),worker,sessions,workspaces,views,calls,errors,config:()=>cfg,cx:{notify(){},async sleep(){},spawn(fn){return fn(this);}}};
}

test('a completed model turn does not claim that its firstmate task finished',()=>{
  const h=host();
  h.worker.status='done';
  h.context.observed=h.worker;
  assert.equal(runInNewContext('stateLabel(observed)',h.context),'Turn complete');
});

test('preset targets the coordinator tab on its machine without launching or moving terminals',async()=>{
  const h=host({remote:true,independent:true,registrations:[{terminal:'hz-server/t2',created:12,role:'firstmate'}]});
  h.workspaces.push({id:'hz-server/s',machine:'hz-server',tabs:[{id:'hz-server/tab'}]});
  h.views.push({pane:'hz-server/p2',tab:'hz-server/tab',terminal:'hz-server/t3'},
    {pane:'hz-server/p1',tab:'hz-server/tab',terminal:'hz-server/t2'});
  h.context.appHome=()=>'/app home';
  h.context.focused=()=>({tab:'elsewhere'});
  h.context.exec=async(...args)=>{h.calls.push(['exec',args]);return {code:0,stdout:'{"version":4}'};};
  await h.controller.arrangePreset('daily','hz-server/tab',h.cx);
  const invocation=h.calls.find(([name])=>name==='exec')[1];
  assert.equal(invocation[0],'python3');
  assert.equal(invocation[1][1],'/app home/mods/one-piece/presets.py');
  const request=JSON.parse(invocation[1][2]);
  assert.equal(request.machine,'hz-server');
  assert.equal(request.tab,'hz-server/tab');
  assert.equal(request.anchor,'hz-server/p1');
  assert.equal(request.panes.length,2);
  assert.deepEqual(h.calls.map(c=>c[0]),['exec']);
});

test('preset refuses worker workspaces and reports helper failures without retrying',async()=>{
  const h=host();
  h.workspaces.push({id:'s',machine:null,tabs:[{id:'tab'}]});
  h.views.push({pane:'p1',tab:'tab',terminal:'t2'},{pane:'p2',tab:'tab',terminal:'t3'});
  h.context.appHome=()=>'/app';
  h.context.exec=async(...args)=>{h.calls.push(['exec',args]);return {code:1,stderr:'Layout changed elsewhere'};};
  await h.controller.arrangePreset('equal','tab',h.cx);
  assert.ok(!h.calls.some(([name])=>name==='exec'));
  h.config().coordinators.push({terminal:'t2',created:12,role:'firstmate'});
  h.worker.labels={};
  await h.controller.arrangePreset('equal','tab',h.cx);
  assert.equal(h.calls.filter(([name])=>name==='exec').length,1);
  assert.ok(h.errors.some(e=>e.body.includes('changed elsewhere')));
});

for(const role of ['secondmate','worker']) test(`preset refuses a writable ${role} beside personal terminals`,async()=>{
  const h=host({independent:role==='secondmate',registrations:[{terminal:'t2',created:12,role:'secondmate'}]});
  h.config().inspections['t2:12']={space:'s'};
  h.workspaces.push({id:'s',machine:null,tabs:[{id:'tab'}]});
  h.views.push({pane:'supervised',tab:'tab',terminal:'t2'},
    {pane:'inspect',tab:'tab',mod:'one-piece'},
    {pane:'personal',tab:'tab',terminal:'t3',zoomed:true});
  h.context.appHome=()=>'/app';
  h.context.focused=()=>({tab:'tab'});
  h.context.exec=async()=>{h.calls.push(['exec']);return {code:0};};
  assert.equal(await h.controller.arrangePreset('equal','tab',h.cx),false);
  assert.deepEqual(h.calls,[]);
});

test('secondmate preset retains inspection as its anchor and restores only the visible tab grid',async()=>{
  const h=host({registrations:[{terminal:'t2',created:12,role:'secondmate'}]});
  h.config().inspections['t2:12']={space:'s'};
  h.workspaces.push({id:'s',machine:null,tabs:[{id:'tab'}]});
  h.views.push({pane:'inspect',tab:'tab',terminal:null,mod:'one-piece'},
    {pane:'personal',tab:'tab',terminal:'t3',zoomed:true});
  h.context.appHome=()=>'/app';
  h.context.focused=()=>({tab:'tab'});
  let request;
  h.context.exec=async(_command,args)=>{request=JSON.parse(args[2]);return {code:0};};
  assert.equal(await h.controller.arrangePreset('equal','tab',h.cx),true);
  assert.equal(request.anchor,'inspect');
  assert.equal(request.panes[0].terminal,null);
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls)),[['pane.zoom',{pane:'personal'}]]);
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  assert.equal(h.controller.presetTarget('tab'),null);
});

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

test('cleanup reports an actionable unavailable machine without exposing raw JSON',async()=>{
  const h=host({remote:true,failCleanup:true});
  await h.controller.inspect(h.worker,h.cx);
  h.errors.length=0;
  h.context.hc=async()=>({code:3,stderr:JSON.stringify({error:{kind:'unavailable',message:'hz-server is unreachable',hint:'hc machine ls shows when it comes back'}})});
  await h.controller.cleanupPlaceholders(h.cx);
  assert.equal(h.errors[0].body,'Reconnect hz-server, then retry cleanup.');
  assert.equal(h.config().placeholders.length,1);
});

test('inspection displays structured command error messages and preserves plain errors',async()=>{
  for(const stderr of [JSON.stringify({error:{kind:'failed',message:'The remote shell could not start.'}}),'The remote shell could not start.']) {
    const h=host({remote:true});
    const original=h.context.hc;
    h.context.hc=async args=>args[0]==='run'?{code:1,stderr}:original(args);
    await h.controller.inspect(h.worker,h.cx);
    assert.equal(h.errors[0].body,'The remote shell could not start.');
  }
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

test('shared close ends only the personal pane identified by its confirmation',()=>{
  const h=closeRoutesHost();
  h.views.push({pane:'neighbor',tab:'probe',mod:'one-piece',terminal:null});
  h.controller.requestClose('pane','probe-pane');h.confirm();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='pane.close'&&args.pane==='probe-pane'));
});

test('stale shared close cannot end a replacement, supervised, or unavailable session',()=>{
  for(const change of [
    h=>{h.worker.created_ms=13;},
    h=>{h.worker.labels={'firstmate.home':'home','firstmate.task':'task'};},
    h=>{h.config().coordinators.push({terminal:'t2',created:12,role:'secondmate'});},
    h=>{h.context.machines=()=>[{name:null,layout:'unavailable'}];}
  ]) {
    const h=closeRoutesHost();
    h.controller.requestClose('pane','probe-pane');change(h);h.confirm();
    assert.ok(!h.calls.some(([cmd])=>cmd==='pane.close'||cmd==='tab.close'));
    assert.ok(h.errors.length);
  }
});

function firstmateHost(registrations) {
  const h=host({independent:true,registrations});
  h.sessions.push({address:'t3',created_ms:13,state:'live',labels:{}});
  h.workspaces.push({id:'captain',machine:null,tabs:[{id:'captain-tab'}]});
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
  persistentCommands(h);
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

test('pane callbacks recheck readiness after rendering and work after reconnection',async()=>{
  const h=paneControlsHost();
  h.render();
  h.context.machines=()=>[{name:'hz-server',layout:'unavailable'}];
  for(const id of paneControlIds) await h.clicks.get(id)(null,h.cx);
  assert.equal(h.calls.length,0);
  h.context.machines=()=>[{name:'hz-server',layout:'ready'}];
  h.render();
  for(const id of paneControlIds) await h.clicks.get(id)(null,h.cx);
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

function closeRoutesHost() {
  const h=host({independent:true});
  const actions=new Map(),texts=[];
  function element() {
    let id;
    const node=new Proxy({}, {get:(_target,key)=>(...args)=>{
      if(key==='id') id=args[0];
      if(key==='on_click') actions.set(id,args[0]);
      if(key==='child'&&typeof args[0]==='string') texts.push(args[0]);
      if(key==='when'&&args[0]) args[1](node);
      return node;
    }});
    return node;
  }
  h.workspaces.push({id:'captain',machine:null,active:true,tabs:[{id:'probe',name:'Close route probe',active:true},{id:'other',name:'Other'}]});
  h.views.push({pane:'probe-pane',tab:'probe',terminal:'t2',focused:true});
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    if(cmd==='tab.close'||cmd==='pane.close') {
      h.calls.push([cmd,args]);
      const removed=h.views.filter(p=>cmd==='tab.close'?p.tab===args.id:p.pane===args.pane);
      for(const pane of removed) {
        const terminal=h.sessions.find(t=>t.address===pane.terminal);
        if(terminal) terminal.state='finished';
        h.views.splice(h.views.indexOf(pane),1);
      }
      return;
    }
    if(cmd==='tab.new'&&!args.mod) {h.calls.push([cmd,args]);return;}
    run(cmd,args);
  };
  Object.assign(h.context,{props:()=>({view:'tabs'}),focused:()=>({pane:'probe-pane',tab:'probe',space:'captain'}),
    div:element,h_flex:element,v_flex:element,image:element,
    closeOverlay:id=>h.calls.push(['close-overlay',id])});
  return {...h,actions,texts,render:()=>h.controller.render(h.cx),confirm:()=>{
    const spec=h.calls.findLast(([cmd])=>cmd==='overlay')[1];
    h.context.props=()=>({...spec.props,overlay:'confirmation'});
    h.controller.render(h.cx);
    actions.get('confirm-close')(null,h.cx);
  }};
}

test('owned tabs route the live Close probe through confirmation before ending its process',()=>{
  const layout=JSON.parse(readFileSync(new URL('../layouts/one-piece.json',import.meta.url)));
  const content=layout.children[1].children.find(n=>n.id==='fleet-tabs').content;
  assert.equal(content.mod,'one-piece');
  assert.equal(content.props.view,'tabs');
  const h=closeRoutesHost();h.render();
  h.actions.get('close-tab-probe')(null,h.cx);
  assert.ok(!h.calls.some(([cmd])=>cmd==='tab.close'));
  h.confirm();
  assert.ok(h.texts.some(t=>t.includes('t2')&&t.includes('local')));
  assert.ok(h.texts.some(t=>t.includes('process')&&t.includes('obligations')));
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
});

test('close commands reach the same confirmation flow from nextCommand',async()=>{
  for(const command of ['close-tab','close-pane']) {
    const h=closeRoutesHost();let count=0,pending;
    h.context.props=()=>({});
    h.context.nextCommand=async()=>{if(count++) throw new Error('fixture stopped');return command;};
    h.cx.timer={every(){}};h.cx.focus_handle=()=>({});h.cx.spawn=fn=>{pending=fn(h.cx).catch(e=>assert.equal(e.message,'fixture stopped'));};
    h.controller.init({},h.cx);await pending;
    assert.equal(h.calls.filter(([cmd])=>cmd==='overlay').length,1);
    assert.ok(!h.calls.some(([cmd])=>cmd==='tab.close'||cmd==='pane.close'));
  }
});

test('tab confirmation rejects replacement, added pane, moved pane and offline machine',()=>{
  for(const change of [
    h=>{h.worker.created_ms++;},
    h=>{h.views.push({pane:'new',tab:'probe',terminal:'t3'});h.sessions.push({address:'t3',created_ms:13,state:'live',labels:{}});},
    h=>{h.views[0].tab='other';},
    h=>{h.context.machines=()=>[{name:null,layout:'unavailable'}];}
  ]) {
    const h=closeRoutesHost();h.controller.requestClose('tab','probe');change(h);h.confirm();
    assert.ok(!h.calls.some(([cmd])=>cmd==='tab.close'||cmd==='pane.close'||cmd==='terminal.kill'));
    assert.ok(h.errors.length);
  }
});

test('tab close lists personal processes and preserves the parked inspection worker',()=>{
  const h=closeRoutesHost();
  h.sessions.push({address:'t4',created_ms:14,state:'live',labels:{'firstmate.home':'test','firstmate.task':'worker'}});
  h.views.push({pane:'viewer',tab:'probe',mod:'one-piece',terminal:null});
  h.config().inspections['t4:14']={space:'captain',tab:'probe',pane:'viewer'};
  h.controller.requestClose('tab','probe');h.confirm();
  assert.ok(h.texts.some(t=>t.includes('t4')&&t.includes('preserved')));
  assert.ok(h.texts.some(t=>t.includes('t2')&&t.includes('local')));
  assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.kill'||cmd==='hc'));
  assert.equal(h.sessions.find(t=>t.address==='t4').state,'live');
  assert.equal(h.worker.state,'finished');
});

test('owned tabs retain select and rename and restrict new personal tabs in worker spaces',()=>{
  const h=closeRoutesHost();h.render();
  h.actions.get('select-tab-other')(null,h.cx);
  h.actions.get('rename-tab-probe')(null,h.cx);
  h.actions.get('add-tab')(null,h.cx);
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.select'&&args.id==='other'));
  assert.ok(h.calls.some(([cmd,args])=>cmd==='overlay'&&args.props.view==='rename-tab'));
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.new'&&args.space==='captain'));
  h.config().inspections['t2:12']={space:'captain',tab:'probe',pane:'viewer'};
  h.calls.length=0;
  h.actions.get('add-tab')(null,h.cx);
  assert.ok(!h.calls.some(([cmd])=>cmd==='tab.new'));
});

test('pane confirmation ends only the captured pane and cancellation ends nothing',()=>{
  const h=closeRoutesHost();
  h.sessions.push({address:'t3',created_ms:13,state:'live',labels:{}});
  h.views.push({pane:'neighbor',tab:'probe',terminal:'t3'});
  h.controller.requestClose('pane','probe-pane');
  const spec=h.calls.at(-1)[1];h.context.props=()=>({...spec.props,overlay:'confirmation'});
  h.controller.render(h.cx);h.actions.get('cancel-close')();
  assert.equal(h.worker.state,'live');
  h.controller.requestClose('pane','probe-pane');
  h.confirm();
  assert.equal(h.worker.state,'finished');
  assert.equal(h.sessions.find(t=>t.address==='t3').state,'live');
  assert.ok(h.views.some(p=>p.pane==='neighbor'));
});

test('remote tab confirmation identifies every process and its machine',()=>{
  const h=closeRoutesHost();
  h.worker.address='hz-server/t2';h.views[0].terminal=h.worker.address;
  h.sessions.push({address:'hz-server/t3',created_ms:13,state:'live',labels:{}});
  h.views.push({pane:'second',tab:'probe',terminal:'hz-server/t3'});
  h.workspaces[0].machine='hz-server';
  h.context.machines=()=>[{name:'hz-server',layout:'ready'}];
  h.controller.requestClose('tab','probe');
  h.confirm();
  assert.ok(h.texts.some(t=>t.includes('hz-server/t2 on hz-server')&&t.includes('hz-server/t3 on hz-server')));
  assert.ok(h.sessions.every(t=>t.state==='finished'));
});

test('inspection-only close targets only its pane even if the worker reattaches or is replaced',()=>{
  for(const change of [null,
    h=>h.views.push({pane:'writable',tab:'other',terminal:'t2'}),
    h=>{h.worker.created_ms++;}
  ]) {
    const h=closeRoutesHost();
    h.worker.labels={'firstmate.home':'test','firstmate.task':'worker'};
    h.views[0]={pane:'viewer',tab:'probe',mod:'one-piece',terminal:null};
    h.config().inspections['t2:12']={space:'captain',tab:'probe',pane:'viewer'};
    h.controller.requestClose('pane','viewer');
    if(change) change(h);
    h.confirm();
    assert.equal(h.worker.state,'live');
    assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
    if(!change) {
      assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
      assert.ok(h.texts.some(t=>t.includes('No terminal process ends.')&&t.includes('preserved')));
    }
  }
});

test('worker spaces without an inspection record cannot add personal tabs',()=>{
  const h=closeRoutesHost();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'worker'};
  assert.equal(h.controller.canAddTab('captain'),false);
});

test('secondmate inspection spaces can add personal tabs and reject addition after disconnection',()=>{
  const h=closeRoutesHost();
  h.config().coordinators.push({terminal:'t2',created:12,role:'secondmate'});
  h.config().inspections['t2:12']={space:'captain',tab:'probe',pane:'viewer'};
  h.render();h.actions.get('add-tab')();
  assert.ok(h.calls.some(([cmd])=>cmd==='tab.new'));
  h.calls.length=0;
  h.context.machines=()=>[{name:null,layout:'unavailable'}];
  h.actions.get('add-tab')();
  assert.equal(h.calls.length,0);
});

test('pane confirmation rejects a replacement process and direct supervised closure',()=>{
  const h=closeRoutesHost();
  h.controller.requestClose('pane','probe-pane');
  h.worker.created_ms++;h.confirm();
  assert.ok(!h.calls.some(([cmd])=>cmd==='pane.close'||cmd==='tab.close'));
  h.calls.length=0;
  h.worker.labels={'firstmate.home':'test','firstmate.task':'worker'};
  h.controller.requestClose('pane','probe-pane');
  assert.ok(!h.calls.some(([cmd])=>cmd==='overlay'));
});

test('finished terminal panes close with already-ended wording and reject replacement identities',()=>{
  for(const kind of ['tab','pane']) for(const replaced of [false,true]) {
    const h=closeRoutesHost();
    h.worker.state='finished';
    h.controller.requestClose(kind,kind==='tab'?'probe':'probe-pane');
    assert.ok(h.calls.some(([cmd])=>cmd==='overlay'));
    if(replaced) {h.worker.created_ms++;h.worker.state='live';}
    h.confirm();
    assert.ok(h.texts.some(t=>t.includes('t2 on local: already ended')));
    assert.ok(h.texts.includes('Close view'));
    assert.ok(!h.texts.includes('End processes and close'));
    assert.equal(h.calls.some(([cmd])=>cmd==='tab.close'),!replaced);
  }
});

test('pane-header Close uses the shared pane confirmation',()=>{
  const h=closeRoutesHost();
  h.context.props=()=>({view:'pane',pane:'probe-pane'});
  h.render();h.actions.get('close-probe-pane')();
  const spec=h.calls.find(([cmd])=>cmd==='overlay')[1];
  assert.equal(spec.props.view,'close-scope');
  assert.equal(spec.props.snapshot.kind,'pane');
  assert.equal(spec.props.snapshot.id,'probe-pane');
  h.confirm();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
  assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.kill'));
});

function finishedInspectionCloseHost() {
  const h=closeRoutesHost();
  h.worker.state='finished';
  h.worker.labels={'firstmate.home':'test','firstmate.task':'worker'};
  h.views[0]={pane:'viewer',tab:'probe',mod:'one-piece',terminal:null};
  h.config().inspections['t2:12']={space:'captain',tab:'probe',pane:'viewer'};
  return h;
}

test('finished worker inspection closes with already-ended copy for pane and tab',()=>{
  for(const kind of ['pane','tab']) {
    const h=finishedInspectionCloseHost();
    h.controller.requestClose(kind,kind==='pane'?'viewer':'probe');
    assert.ok(h.calls.some(([cmd])=>cmd==='overlay'));
    h.confirm();
    assert.ok(h.texts.some(t=>t.includes('t2 on local: already ended; only its view closes.')));
    assert.ok(!h.texts.some(t=>t.includes('parked inspection process preserved')));
    assert.ok(h.texts.includes('Close view'));
    assert.ok(h.calls.some(([cmd])=>cmd==='tab.close'));
    assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.kill'||cmd==='hc'));
    assert.equal(h.worker.state,'finished');
  }
});

test('inspection closure ignores removed or replaced targets before and after confirmation',()=>{
  for(const kind of ['pane','tab']) for(const before of [false,true]) for(const change of [
    h=>{h.worker.created_ms++;},
    h=>{h.sessions.splice(0,1);}
  ]) {
    const h=finishedInspectionCloseHost();
    if(before) change(h);
    h.controller.requestClose(kind,kind==='pane'?'viewer':'probe');
    assert.ok(h.calls.some(([cmd])=>cmd==='overlay'));
    if(!before) change(h);
    h.confirm();
    assert.ok(h.calls.some(([cmd])=>cmd==='tab.close'));
    assert.ok(h.texts.some(t=>t.includes('only its view closes')&&t.includes('no terminal targeted')));
    assert.ok(!h.texts.some(t=>t.includes('process preserved')));
    assert.equal(h.errors.length,0);
  }
});

test('inspection target may be offline while its actual pane remains on an available machine',()=>{
  const h=finishedInspectionCloseHost();
  h.worker.address='remote/t2';
  delete h.config().inspections['t2:12'];
  h.config().inspections['remote/t2:12']={space:'captain',tab:'probe',pane:'viewer'};
  h.context.machines=()=>[{name:null,layout:'ready'},{name:'remote',layout:'unavailable'}];
  h.controller.requestClose('pane','viewer');h.confirm();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
  assert.ok(!h.texts.some(t=>t.includes('process preserved')));
});

test('inspection closure still rejects unavailable host or changed actual pane',()=>{
  for(const change of [
    h=>{h.context.machines=()=>[{name:null,layout:'unavailable'}];},
    h=>{h.views[0].pane='replacement';},
    h=>{h.views[0].terminal='t2';},
    h=>{h.views[0].tab='other';}
  ]) {
    const h=finishedInspectionCloseHost();
    h.controller.requestClose('pane','viewer');change(h);h.confirm();
    assert.ok(!h.calls.some(([cmd])=>cmd==='pane.close'||cmd==='tab.close'));
    assert.ok(h.errors.length);
  }
});

test('firstmate registration rejects a parked secondmate without changing its role or input',async()=>{
  const h=host({independent:true,registrations:[{terminal:'t2',created:12,home:'test',role:'secondmate'}]});
  await h.controller.inspect(h.worker,h.cx);
  h.context.closeOverlay=id=>h.calls.push(['close',id]);
  h.calls.length=0;
  await h.controller.linkCoordinator(h.worker,'test','firstmate','setup',h.cx);
  assert.equal(h.config().coordinators[0].role,'secondmate');
  assert.match(h.controller.error,/Open it in Herdr before linking as firstmate/);
  assert.equal(h.calls.length,0);
  assert.ok(!h.views.some(p=>p.terminal==='t2'));
});

test('firstmate registration rechecks worker labels after setup rendered',async()=>{
  const h=registrationHost([]);
  h.sessions.find(t=>t.address==='t3').labels={'firstmate.home':'test','firstmate.task':'worker'};
  await h.link();
  assert.equal(h.config().coordinators.length,0);
  assert.match(h.controller.error,/worker/i);
  assert.ok(!h.calls.some(([cmd])=>cmd==='close'));
});

test('worker ownership blocks header personal terminals at render and after render',()=>{
  for(const before of [false,true]) {
    const h=closeRoutesHost();
    const makeWorker=()=>{h.worker.labels={'firstmate.home':'test','firstmate.task':'worker'};};
    if(before) makeWorker();
    h.controller.header();
    if(before) assert.ok(!h.actions.has('new-terminal'));
    else {makeWorker();h.actions.get('new-terminal')();}
    assert.ok(!h.calls.some(([cmd])=>cmd==='pane.split'));
  }
});

test('orphan inspection in the final tab closes without a second native confirmation',()=>{
  const h=finishedInspectionCloseHost();
  h.sessions.length=0;
  h.workspaces[0].tabs.splice(1);
  const nativeRun=h.context.run;
  let nativeConfirmation=false;
  h.context.run=(cmd,args)=>{
    if(cmd==='pane.close') {nativeConfirmation=true;return;}
    nativeRun(cmd,args);
  };
  h.controller.requestClose('pane','viewer');h.confirm();
  assert.equal(nativeConfirmation,false);
  assert.ok(!h.views.some(p=>p.pane==='viewer'));
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
});

test('sole-pane closure preserves terminals in other tabs',()=>{
  const h=finishedInspectionCloseHost();
  h.sessions.push({address:'t5',created_ms:15,state:'live',labels:{}});
  h.views.push({pane:'other-pane',tab:'other',terminal:'t5'});
  h.controller.requestClose('pane','viewer');h.confirm();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='tab.close'&&args.id==='probe'&&args.confirmed===true));
  assert.ok(h.views.some(p=>p.pane==='other-pane'));
  assert.equal(h.sessions.find(t=>t.address==='t5').state,'live');
});

test('a sibling added after pane confirmation prevents tab closure and survives',()=>{
  const h=finishedInspectionCloseHost();
  h.controller.requestClose('pane','viewer');
  h.sessions.push({address:'t5',created_ms:15,state:'live',labels:{}});
  h.views.push({pane:'new-sibling',tab:'probe',terminal:'t5'});
  h.confirm();
  assert.ok(h.calls.some(([cmd,args])=>cmd==='pane.close'&&args.pane==='viewer'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='tab.close'));
  assert.ok(h.views.some(p=>p.pane==='new-sibling'));
  assert.equal(h.sessions.find(t=>t.address==='t5').state,'live');
});

test('sidebar records hidden terminal directory changes without a render',()=>{
  const h=host({independent:true});
  h.worker.program={shell:true};
  h.workspaces.push({id:'personal',machine:null,tabs:[{id:'personal-tab'}]});
  h.views.push({pane:'personal-pane',terminal:h.worker.address,tab:'personal-tab',cwd:'/initial'});
  h.context.props=()=>({});
  let tick;
  h.cx.focus_handle=()=>({});
  h.cx.spawn=()=>{};
  h.cx.timer={every(_ms,callback){tick=callback;}};
  h.controller.init({},h.cx);
  assert.equal(typeof tick,'function');
  tick(h.cx);
  assert.equal(h.config().shells[0].cwd,'/initial');
  h.views[0].cwd='/changed directory';
  tick(h.cx);
  assert.equal(h.config().shells[0].cwd,'/changed directory');
  assert.equal(h.calls.length,0);
});

function persistentCommands(h) {
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    if(!cmd.startsWith('one-piece.')) return run(cmd,args);
    const owner=new h.context.Fleet();
    const props=h.context.props;
    let count=0,pending;
    h.context.props=()=>({});
    h.context.nextCommand=async()=>{if(count++) throw new Error('fixture stopped');return cmd.slice('one-piece.'.length);};
    const cx={...h.cx,timer:{every(){}},focus_handle:()=>({}),spawn:fn=>{
      pending=fn(cx).catch(error=>assert.equal(error.message,'fixture stopped'));
    }};
    owner.init({},cx);
    h.context.props=props;
    return pending;
  };
}

function navigationHost() {
  const h=closeRoutesHost();
  h.cx.spawn=fn=>fn(h.cx);
  h.config().characters={};h.config().aliases={};
  h.context.theme=()=>({foreground:'#fff'});
  h.controller.collapsed={};h.controller.handle={};
  persistentCommands(h);
  h.context.props=()=>({pane:'probe-pane'});
  return h;
}

for(const route of ['tab','space','select','header focus','pane focus']) test(`supervised navigation via ${route} opens inspection and preserves mixed personal panes`,async()=>{
  const h=navigationHost();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'work'};
  const personal={address:'t3',created_ms:13,state:'live',labels:{}};
  h.sessions.push(personal);
  h.views.push({pane:'personal',tab:'probe',terminal:'t3'});
  const before=JSON.stringify(personal);
  h.controller.tabsView();h.controller.sidebar(h.cx);h.controller.header();h.controller.paneHeader();
  if(route==='select') await h.controller.select(personal,h.cx);
  else await h.actions.get({'tab':'select-tab-probe','space':'space-captain','header focus':'zoom-grid','pane focus':'zoom-probe-pane'}[route])(null,h.cx);
  assert.ok(h.config().inspections['t2:12'],'worker must open in inspection');
  assert.ok(!h.views.some(p=>p.terminal==='t2'),'worker writable pane must be removed');
  assert.ok(h.views.some(p=>p.terminal==='t3'&&p.tab==='probe'));
  assert.equal(JSON.stringify(personal),before);
  assert.ok(!h.calls.some(([cmd,args])=>cmd==='pane.zoom'||cmd==='tab.select'&&args.id==='probe'));
});

test('navigation rechecks supervision after rendering and does not touch other tabs',async()=>{
  const h=navigationHost();h.controller.tabsView();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'work'};
  h.sessions.push({address:'t4',created_ms:14,state:'live',labels:{'firstmate.home':'test','firstmate.task':'other'}});
  h.views.push({pane:'other-worker',tab:'other',terminal:'t4'});
  await h.actions.get('select-tab-probe')(null,h.cx);
  assert.ok(h.config().inspections['t2:12']);
  assert.ok(h.views.some(p=>p.terminal==='t4'));
});

for(const status of ['idle','working']) test(`unplaced independent ${status} session has an opening row instead of an empty message`,async()=>{
  const h=navigationHost();h.views.length=0;h.workspaces.length=0;
  h.worker.status=status;
  h.controller.sidebar(h.cx);
  assert.ok(!h.texts.includes('No sessions on this machine.'));
  assert.ok(h.texts.includes('UNSUPERVISED'));
  const before=JSON.stringify(h.worker);
  const action=h.actions.get('session-t2');
  assert.ok(action,'unplaced independent session needs a navigation row');
  await action(null,h.cx);
  assert.ok(h.calls.some(([cmd,args])=>cmd==='space.select'&&args.id==='op-independent-t2-12'));
  assert.equal(h.worker.created_ms,JSON.parse(before).created_ms);
  assert.ok(!h.calls.some(([cmd,args])=>cmd==='hc'&&['run','kill'].includes(args[0])));
});

test('secondmate navigation cannot fall back to writable selection when parking fails',async()=>{
  const h=navigationHost();
  h.config().coordinators.push({terminal:'t2',created:12,role:'secondmate'});
  const run=h.context.run;
  h.context.run=(cmd,args)=>{if(cmd!=='terminal.park') run(cmd,args);};
  h.controller.tabsView();
  await h.actions.get('select-tab-probe')(null,h.cx);
  assert.ok(h.errors.some(e=>e.body.includes('writable pane')));
  assert.ok(!h.calls.some(([cmd])=>['tab.select','space.select','pane.focus','pane.zoom'].includes(cmd)));
  assert.equal(h.worker.state,'live');
});

test('tab navigation rejects disconnection after rendering without parking or selecting',async()=>{
  const h=navigationHost();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'work'};
  h.controller.tabsView();h.context.machines=()=>[{name:null,layout:'unavailable'}];
  await h.actions.get('select-tab-probe')(null,h.cx);
  assert.equal(h.calls.length,0);
});

test('personal navigation works after inspecting its supervised neighbor',async()=>{
  const h=navigationHost();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'work'};
  const personal={address:'t3',created_ms:13,state:'live',labels:{}};
  h.sessions.push(personal);h.views.push({pane:'personal',tab:'probe',terminal:'t3'});
  await h.controller.select(personal,h.cx);
  h.calls.length=0;
  await h.controller.select(personal,h.cx);
  assert.ok(h.calls.some(([cmd,args])=>cmd==='pane.focus'&&args.terminal==='t3'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='terminal.park'));
});

test('remote unplaced rows preserve machine identity and exclude offline sessions and temporary shells',async()=>{
  const h=navigationHost();h.views.length=0;h.workspaces.length=0;
  h.worker.address='remote/t2';
  h.sessions.push({address:'remote/t9',created_ms:9,state:'live',labels:{'one-piece.placeholder':'op-view-1-2'}});
  h.context.machines=()=>[{name:'remote',layout:'ready'}];
  h.controller.sidebar(h.cx);
  assert.ok(h.actions.has('session-remote/t2'));
  assert.ok(!h.actions.has('session-remote/t9'));
  h.context.machines=()=>[{name:'remote',layout:'unavailable'}];
  await h.actions.get('session-remote/t2')(null,h.cx);
  assert.equal(h.calls.length,0);
  h.actions.clear();h.controller.sidebar(h.cx);
  assert.ok(!h.actions.has('session-remote/t2'));
});

for(const route of ['pane focus','header focus']) test(`${route} completes inspection after parking closes the pane header`,async()=>{
  const h=navigationHost();
  h.worker.labels={'firstmate.home':'test','firstmate.task':'work'};
  const personal={address:'t3',created_ms:13,state:'live',labels:{}};
  h.sessions.push(personal);h.views.push({pane:'personal',tab:'probe',terminal:'t3'});
  const run=h.context.run;
  h.context.run=(cmd,args)=>{
    const result=run(cmd,args);
    if(cmd==='terminal.park') h.controller.close();
    return result;
  };
  h.controller.paneHeader();h.controller.header();
  await h.actions.get(route==='pane focus'?'zoom-probe-pane':'zoom-grid')(null,h.cx);
  assert.equal(h.controller.closed,true,'parking must destroy the initiating header');
  assert.ok(h.config().inspections['t2:12'],'inspection must survive header destruction');
  assert.ok(h.views.some(p=>p.terminal==='t3'),'personal pane must survive');
  assert.ok(!h.views.some(p=>p.terminal==='t2'),'worker must remain parked');
  assert.equal(h.errors.length,0);
});

test('machine shortcuts reveal local and offline remote groups without selecting sessions',()=>{
  const h=navigationHost(),revealed=[];
  h.context.machines=()=>[{name:null,layout:'ready'},{name:'hz-server',layout:'unavailable'}];
  h.controller.machineScroll={scroll_to_item:index=>revealed.push(index)};
  h.controller.sidebar(h.cx);
  assert.ok(h.actions.has('jump-machine-hz-server'));
  h.actions.get('jump-machine-hz-server')(null,h.cx);
  h.actions.get('jump-machine-local')(null,h.cx);
  assert.deepEqual(revealed,[1,0]);
  assert.ok(h.texts.includes('Wano'));
  assert.ok(!h.calls.some(([cmd])=>cmd==='space.select'||cmd==='pane.focus'||cmd==='hc'));
});
