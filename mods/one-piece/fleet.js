import { identity } from './artwork.js';

export const machineOf = terminal => terminal.address.includes('/') ? terminal.address.split('/')[0] : null;
export function crewmembers(terminals, agents) {
  const reported = new Set(agents.map(agent => agent.address));
  return terminals.filter(terminal => terminal.state === 'live' &&
    (terminal.program?.agent || reported.has(terminal.address)));
}

export function captainSpaces(terminals, agents, captains) {
  const live = new Map(terminals.filter(terminal => terminal.state === 'live')
    .map(terminal => [terminal.address, terminal]));
  const result = new Map();
  for (const agent of agents) {
    const terminal = live.get(agent.address);
    if (terminal && captains[identity(terminal)] && !result.has(agent.space)) {
      result.set(agent.space, terminal);
    }
  }
  return result;
}
