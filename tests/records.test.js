import test from 'node:test';
import assert from 'node:assert/strict';
import { withRecords, recordKey } from '../mods/one-piece/records.js';

test('an authoritative decision overrides a completed turn only on its exact machine and identity',()=>{
  const terminal={address:'hz/t30',created_ms:12,status:'done',labels:{'firstmate.home':'home','firstmate.task':'fm-check'}};
  const key=recordKey('hz','home'), source={root:'/firstmate',home:'/fleet'};
  const row={address:'t30',created_ms:12,task:'fm-check',state:'parked',decisions:[{key:'confirm',summary:'Proceed?',verb:'needs-decision'}]};
  const sources={[key]:source}, reads={[key]:{source:JSON.stringify(source),at:1000,rows:[row]}};
  assert.equal(withRecords([terminal],sources,reads,2000)[0].status,'blocked');
  for(const modified of [{...terminal,address:'t30'},{...terminal,created_ms:13}])
    assert.equal(withRecords([modified],sources,reads,2000)[0].status,'done');
  assert.equal(withRecords([terminal],sources,reads,50000)[0].taskRecord,null);
  assert.equal(withRecords([terminal],{[key]:{...source,home:'/other'}},reads,2000)[0].taskRecord,null);
  reads[key].rows[0]={...row,decisions:[],state:'done'};
  assert.equal(withRecords([terminal],sources,reads,2000)[0].status,'done');
});

test('malformed cached rows become unavailable instead of crashing rendering',()=>{
  const terminal={address:'t1',created_ms:12,status:'done',labels:{'firstmate.home':'home','firstmate.task':'fm-check'}};
  const key=recordKey(null,'home'),source={root:'/firstmate',home:'/fleet'};
  for(const rows of [[null],[{address:'t1',created_ms:12,task:'fm-check',state:'done'}],{},[[]]]) {
    const reads={[key]:{source:JSON.stringify(source),at:1000,rows}};
    assert.equal(withRecords([terminal],{[key]:source},reads,2000)[0].taskRecord,null);
  }
});
