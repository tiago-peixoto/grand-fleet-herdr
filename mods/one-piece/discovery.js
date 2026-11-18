import { createHash } from 'crypto';
import { machineOf } from './fleet.js';

// Firstmate labels every worker terminal with this tag (its bin/fm-backend-hometag-lib.sh):
// the role prefix plus the first eight hex digits of the SHA-256 of the home folder.
const homeTag = (folder, marker) =>
  `${marker ? `2ndmate-${marker}` : 'firstmate'}-${createHash('sha256').update(folder).digest('hex').slice(0, 8)}`;

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
  return {source:'session-lock', role:marker?.trim() ? 'secondmate' : 'firstmate', home:homeTag(folder, marker?.replace(/\s/g, ''))};
}
