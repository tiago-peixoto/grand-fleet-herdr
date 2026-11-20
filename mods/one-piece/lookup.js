import { identity, crews, characterHolders, chooseCharacter } from './artwork.js';
import { captainSpaces, crewmembers, followedCaptains, machineOf } from './fleet.js';

export const characterName = assignment => assignment?.number ? `Pirate ${assignment.number} · ${characterName({art:assignment.art}).replace(/^Pirate /, '')}` :
  (assignment?.art ?? '').replace(/^crew-/, '').split('-').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
export const mateName = terminal => terminal.name || terminal.title || terminal.address;

export function lookupFleets(snapshot) {
  const { agents, spaces, machines, captains, appearance } = snapshot;
  const online = new Set(machines.filter(machine => machine.layout === 'ready').map(machine => machine.name ?? null));
  const terminals = snapshot.terminals.filter(terminal => online.has(machineOf(terminal)));
  const members = crewmembers(terminals, agents);
  const leaders = captainSpaces(terminals, agents, captains);
  const followers = followedCaptains(terminals, agents, captains);
  const fleets = [];
  const placed = new Set();
  for (const space of spaces) {
    const aboard = members.filter(terminal => agents.some(agent => agent.address === terminal.address && agent.space === space.id));
    if (!aboard.length) continue;
    aboard.forEach(terminal => placed.add(identity(terminal)));
    const captain = leaders.get(space.id), leader = captain ?? followers.get(space.id);
    const crew = leader ? appearance.crews[identity(leader)] ?? 'strawhat' : appearance.spaceCrews?.[space.id];
    if (!crews[crew]) continue;
    fleets.push({id:space.id, name:`${space.name} · ${space.machine ?? 'local'}`, crew,
      owner:leader ? `${identity(leader)}:${crew}` : `space:${space.id}:0:${crew}`, members:aboard, captain});
    for (const other of aboard.filter(terminal => captains[identity(terminal)] && terminal !== captain)) {
      const key = identity(other), ownCrew = appearance.crews[key] ?? 'strawhat';
      if (crews[ownCrew]) fleets.push({id:`captain:${key}`, name:`${mateName(other)} · ${space.name}`, crew:ownCrew,
        owner:`${key}:${ownCrew}`, members:[other], captain:other});
    }
  }
  for (const terminal of members.filter(terminal => !placed.has(identity(terminal)))) {
    const key = identity(terminal), captain = captains[key] && terminal;
    const crew = captain ? appearance.crews[key] ?? 'strawhat' : appearance.characters[key]?.owner?.split(':').pop() ?? 'strawhat';
    const owner = captain ? `${key}:${crew}` : appearance.characters[key]?.owner ?? 'crewmembers:0:strawhat';
    if (!crews[crew]) continue;
    const id = `unplaced:${owner}`, existing = fleets.find(fleet => fleet.id === id);
    if (existing) existing.members.push(terminal);
    else fleets.push({id, name:`Unplaced · ${crews[crew].name}`, crew, owner, members:[terminal], captain});
  }
  return fleets;
}

export function lookupPlan(snapshot, {target, fleet: fleetId, character}) {
  const fleets = lookupFleets(snapshot), fleet = fleets.find(fleet => fleet.id === fleetId);
  const deny = reason => ({reason});
  if (!fleet) return deny('This fleet is no longer available.');
  if (!target) return deny('Browsing only. Inspect a mate to choose their character.');
  const targetFleet = fleets.find(fleet => fleet.members.some(terminal => identity(terminal) === target));
  if (!targetFleet) return deny('This mate is no longer available.');
  if (snapshot.captains[target]) return deny('Firstmate captain artwork follows the flag. Use Raise a new flag to change it.');
  if (fleet.owner !== targetFleet.owner) return deny('Browsing another fleet. Inspect one of its mates to change their character.');
  const crew = crews[fleet.crew];
  if (character === crew.captain) return deny('Reserved for Firstmate.');
  if (!crew.workers.includes(character)) return deny('Pirate colors are references. Choose a named crewmate to apply.');
  const characters = snapshot.appearance.characters, mine = characters[target];
  if (!mine || mine.owner !== targetFleet.owner) return deny('Crew assignments are updating. Try again.');
  if (mine.art === `crew-${character}`) return deny('Current character.');
  const holders = characterHolders(characters, mine.owner, `crew-${character}`).filter(key => key !== target);
  if (holders.length > 1) return deny('Multiple saved holders. Choose another character.');
  const holder = holders[0];
  const active = key => fleets.filter(fleet => fleet.owner === mine.owner).flatMap(fleet => fleet.members)
    .find(terminal => identity(terminal) === key && !snapshot.captains[key]);
  if (holder && (characters[holder].owner !== mine.owner || !active(holder))) return deny('Reserved for returning mate.');
  const changed = chooseCharacter(characters, target, character);
  const changes = [target, ...(holder ? [holder] : [])].map(key => ({key, name:mateName(active(key)),
    from:{art:characters[key].art, number:characters[key].number ?? null},
    to:{art:changed[key].art, number:changed[key].number ?? null}}));
  return {owner:mine.owner, changes};
}

export function applyLookup(snapshot, selection, expected) {
  const plan = lookupPlan(snapshot, selection);
  if (plan.reason || JSON.stringify(plan) !== JSON.stringify(expected)) return {plan};
  return {plan, characters:chooseCharacter(snapshot.appearance.characters, selection.target, selection.character)};
}
