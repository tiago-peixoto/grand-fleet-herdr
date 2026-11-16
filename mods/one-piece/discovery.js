import { machineOf } from './fleet.js';

export async function discoverCaptain(terminal, read) {
  const process = terminal.foreground;
  const folder = process?.cwd ?? terminal.cwd;
  if (terminal.state !== 'live' || !Number.isSafeInteger(process?.pid) || !folder?.startsWith('/')) return null;
  const options = {on:machineOf(terminal)};
  const lock = await read(`${folder}/state/.lock`, options);
  if (lock?.trim() !== String(process.pid)) return null;
  const startup = await read(`${folder}/bin/fm-session-start.sh`, options);
  if (!startup?.includes('fm-session-lock-lib.sh')) return null;
  const marker = await read(`${folder}/.fm-secondmate-home`, options);
  if ((await read(`${folder}/state/.lock`, options))?.trim() !== String(process.pid)) return null;
  return {source:'session-lock', role:marker?.trim() ? 'secondmate' : 'firstmate'};
}
