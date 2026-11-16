import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverCaptain } from '../mods/one-piece/discovery.js';

const terminal = {address:'server/t5',created_ms:17,state:'live',foreground:{pid:8085,cwd:'/home/pirate'},cwd:'/home/pirate'};
const files = {
  '/home/pirate/state/.lock':'8085\n',
  '/home/pirate/bin/fm-session-start.sh':'# shellcheck source=bin/fm-session-lock-lib.sh',
  '/home/pirate/.fm-secondmate-home':'hello-mate\n'
};
const read = async (path, options) => {
  assert.equal(options.on, 'server');
  return files[path] ?? null;
};
test('recognizes a real secondmate without role labels or manual registration', async () => {
  assert.deepEqual(await discoverCaptain(terminal, read), {source:'session-lock',role:'secondmate'});
});
test('does not turn another agent in the same folder into a captain', async () => {
  assert.equal(await discoverCaptain({...terminal,foreground:{pid:9000,cwd:'/home/pirate'}},read), null);
  assert.equal(await discoverCaptain({...terminal,state:'finished'},read), null);
});
test('rejects ordinary projects and missing process evidence', async () => {
  assert.equal(await discoverCaptain(terminal, async () => null),null);
  assert.equal(await discoverCaptain({...terminal,foreground:null},read),null);
});
test('recognizes the primary without a secondmate marker', async () => {
  assert.deepEqual(await discoverCaptain(terminal,async (path, options) => path.endsWith('.fm-secondmate-home') ? null : read(path,options)),{source:'session-lock',role:'firstmate'});
});

test('rejects a session lock transferred while its evidence is being read', async () => {
  let lockReads = 0;
  const result = await discoverCaptain(terminal, async (path, options) => {
    if (path.endsWith('/state/.lock') && ++lockReads > 1) return '9999';
    return read(path, options);
  });
  assert.equal(result, null);
});
