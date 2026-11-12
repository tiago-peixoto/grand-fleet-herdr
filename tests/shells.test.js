import test from 'node:test';
import assert from 'node:assert/strict';
import { rememberShells, missingShells } from '../mods/one-piece/shells.js';
const machine=[{name:null,layout:'ready'}];
const space=[{id:'captain',machine:null,tabs:[{id:'chat'}]}];
const shell={address:'t3',created_ms:3,state:'live',program:{shell:true},labels:{}};
const pane={terminal:'t3',tab:'chat',cwd:'/work'};
const saved={terminal:'t3',created:3,space:'captain',tab:'chat',cwd:'/work',machine:null};

test('record personal shells with the actual pane directory and ownership',()=>{
  assert.deepEqual(rememberShells([], [shell], [pane],space,machine,[]),[saved]);
});
test('never record registered coordinators or supervised workers',()=>{
  assert.deepEqual(rememberShells([], [shell], [pane],space,machine,[{terminal:'t3',created:3}]),[]);
  assert.deepEqual(rememberShells([], [{...shell,labels:{'firstmate.home':'x','firstmate.task':'y'}}], [pane],space,machine,[]),[]);
});
test('temporary inspection shells never enter personal restoration history',()=>{
  const placeholder={...shell,labels:{'one-piece.placeholder':'op-view-123-456'}};
  assert.deepEqual(rememberShells([], [placeholder], [pane],space,machine,[]),[]);
  assert.deepEqual(rememberShells([saved], [placeholder], [pane],space,machine,[]),[]);
});
test('offline snapshots retain directories but never offer restoration',()=>{
  const offline=[{name:null,layout:'unavailable'}];
  assert.deepEqual(rememberShells([saved],[],[],[],offline,[]),[saved]);
  assert.deepEqual(missingShells([saved],[],offline),[]);
});
test('surviving or deliberately ended terminals are not missing shells',()=>{
  assert.deepEqual(missingShells([saved],[shell],machine),[]);
  assert.deepEqual(missingShells([saved],[{...shell,state:'finished'}],machine),[]);
  assert.deepEqual(rememberShells([saved],[{...shell,state:'finished'}],[],space,machine,[]),[]);
  assert.deepEqual(missingShells([saved],[],machine),[saved]);
});
test('host replacement at the same address is labeled as a new process',()=>{
  const records=rememberShells([saved],[{...shell,created_ms:4}],[pane],space,machine,[]);
  assert.equal(records.length,1);
  assert.equal(records[0].created,4);
  assert.equal(records[0].newProcess,true);
});
test('a restored shell replaces its missing record instead of offering a duplicate',()=>{
  const pending={...saved,restoreName:'op-shell-test'};
  const records=rememberShells([pending],[{...shell,address:'t4',created_ms:4,name:'op-shell-test'}],[{...pane,terminal:'t4'}],space,machine,[]);
  assert.equal(records.length,1);
  assert.equal(records[0].terminal,'t4');
  assert.equal(records[0].newProcess,true);
  assert.deepEqual(missingShells(records,[{...shell,address:'t4'}],machine),[]);
});
test('new agent sessions cannot inherit a missing shell record',()=>{
  assert.deepEqual(rememberShells([saved],[{...shell,created_ms:4,program:{agent:true}}],[pane],space,machine,[]),[]);
});

test('a foreground editor preserves the personal shell record and its current directory',()=>{
  const editor={...shell,program:{shell:false,name:'vim'}};
  const records=rememberShells([saved],[editor],[{...pane,cwd:'/work/subdir'}],space,machine,[]);
  assert.deepEqual(records,[{...saved,cwd:'/work/subdir'}]);
  assert.deepEqual(missingShells(records,[],machine),records);
  assert.deepEqual(rememberShells([], [editor], [pane],space,machine,[]),[]);
});

test('a replacement that exits before attachment clears its pending record',()=>{
  const record={...saved,restoreName:'op-shell-test'};
  const ended={...shell,address:'t4',name:'op-shell-test',state:'finished'};
  assert.deepEqual(rememberShells([record],[ended],[],space,machine,[]),[]);
});
