import { identity } from './artwork.js';

export const machineOf = terminal => terminal.address.includes('/') ? terminal.address.split('/')[0] : null;
export function crewmembers(terminals, agents) {
  const reported = new Set(agents.map(agent => agent.address));
  return terminals.filter(terminal => terminal.state === 'live' &&
    (terminal.program?.agent || reported.has(terminal.address)));
}

export function managedCrew(captain, terminals, agents, captains) {
  if (!captains[identity(captain)] || captain.state !== 'live') return [];
  const space = agents.find(agent => agent.address === captain.address)?.space;
  if (captainSpaces(terminals, agents, captains).get(space)?.address !== captain.address) return [];
  const members = new Set(agents.filter(agent => agent.space === space).map(agent => agent.address));
  return crewmembers(terminals, agents).filter(terminal => members.has(terminal.address) && !captains[identity(terminal)]);
}

export function captainSpaces(terminals, agents, captains) {
  const live = new Map(terminals.filter(terminal => terminal.state === 'live')
    .map(terminal => [terminal.address, terminal]));
  // Native order changes when tabs are dragged, so the primary and then the oldest captain supply the ship.
  const rank = terminal => [captains[identity(terminal)].role === 'firstmate' ? 0 : 1, terminal.created_ms];
  const before = (a, b) => rank(a)[0] - rank(b)[0] || rank(a)[1] - rank(b)[1];
  const result = new Map();
  for (const agent of agents) {
    const terminal = live.get(agent.address);
    if (!terminal || !captains[identity(terminal)]) continue;
    const current = result.get(agent.space);
    if (!current || before(terminal, current) < 0) result.set(agent.space, terminal);
  }
  return result;
}

export function genericFleets(terminals, agents, captains) {
  const led = captainSpaces(terminals, agents, captains);
  const members = new Map(crewmembers(terminals, agents).map(terminal => [terminal.address, terminal]));
  const result = new Map();
  for (const agent of agents) {
    const terminal = members.get(agent.address);
    if (terminal && !led.has(agent.space)) result.set(agent.space, [...(result.get(agent.space) ?? []), terminal]);
  }
  return result;
}

// Firstmate starts workers in a Space of their own, so a fleet whose crewmates all carry one
// captain's home tag follows that captain. The tag only pairs an already detected captain with its workers.
export function followedCaptains(terminals, agents, captains) {
  const homes = new Map(crewmembers(terminals, agents).filter(terminal => captains[identity(terminal)]?.home)
    .map(terminal => [`${machineOf(terminal)}|${captains[identity(terminal)].home}`, terminal]));
  const result = new Map();
  for (const [space, fleet] of genericFleets(terminals, agents, captains)) {
    const leaders = new Set(fleet.map(terminal => homes.get(`${machineOf(terminal)}|${terminal.labels?.['firstmate.home']}`)));
    if (leaders.size === 1 && !leaders.has(undefined)) result.set(space, [...leaders][0]);
  }
  return result;
}
