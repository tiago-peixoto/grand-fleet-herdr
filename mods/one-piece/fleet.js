export function groupFleet(terminals) {
  const live = terminals.filter(terminal => terminal.state === 'live');
  const homes = new Map();
  for (const terminal of live) {
    const home = terminal.labels?.['firstmate.home.path'];
    if (typeof home !== 'string' || !home.trim()) continue;
    const machine = terminal.address.includes('/') ? terminal.address.split('/')[0] : null;
    const key = JSON.stringify([machine, home]);
    if (!homes.has(key)) homes.set(key, {machine, home, captains: [], workers: []});
    const group = homes.get(key);
    const role = terminal.labels['firstmate.role'];
    const task = terminal.labels['firstmate.task'];
    if (role === 'coordinator' && !task) group.captains.push(terminal);
    else if (!role && typeof task === 'string' && task.trim()) group.workers.push(terminal);
  }
  const groups = [], ambiguous = [], assigned = new Set();
  for (const {machine, home, captains, workers} of homes.values()) {
    if (captains.length > 1) ambiguous.push({machine, home});
    if (captains.length !== 1) continue;
    groups.push({captain: captains[0], workers, machine});
    assigned.add(captains[0]);
    workers.forEach(worker => assigned.add(worker));
  }
  return {groups, ambiguous, ungrouped: live.filter(terminal => !assigned.has(terminal))};
}
