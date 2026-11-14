import { identity } from './artwork.js';

export const machineOf = terminal => terminal.address.includes('/') ? terminal.address.split('/')[0] : null;
export const workerHome = terminal => {
  const home = terminal.labels?.['firstmate.home'], task = terminal.labels?.['firstmate.task'];
  return typeof home === 'string' && home.trim() && typeof task === 'string' && task.trim() ? home : null;
};

export function groupFleet(terminals, links = {}) {
  const live = terminals.filter(terminal => terminal.state === 'live');
  const groups = live.filter(terminal => links[identity(terminal)] && !terminal.labels?.['firstmate.task'])
    .map(captain => ({captain, workers: [], machine: machineOf(captain)}));
  const homes = new Map(), ambiguous = [], assigned = new Set(groups.map(group => group.captain));
  for (const group of groups) {
    const home = links[identity(group.captain)].home;
    if (typeof home !== 'string' || !home.trim()) continue;
    const key = JSON.stringify([group.machine, home]);
    if (!homes.has(key)) homes.set(key, []);
    homes.get(key).push(group);
  }
  for (const [key, owners] of homes) {
    const [machine, home] = JSON.parse(key);
    if (owners.length !== 1) {
      ambiguous.push({machine, home});
      continue;
    }
    const group = owners[0];
    group.workers = live.filter(terminal => machineOf(terminal) === machine && workerHome(terminal) === home && !assigned.has(terminal));
    group.workers.forEach(worker => assigned.add(worker));
  }
  return {groups, ambiguous, ungrouped: live.filter(terminal => !assigned.has(terminal))};
}
