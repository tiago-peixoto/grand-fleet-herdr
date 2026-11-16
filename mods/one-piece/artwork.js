export const identity = terminal => `${terminal.address}:${terminal.created_ms}`;

export const crews = {
  strawhat:{name:'Straw Hat Pirates',ship:'sunny',title:'Thousand Sunny',captain:'luffy',workers:['chopper','franky','zoro','nami','usopp','sanji','robin','brook','jinbe']},
  redhair:{name:'Red Hair Pirates',ship:'crew-red-force',title:'Red Force',captain:'shanks',workers:['benn-beckman','yasopp','lucky-roux']},
  bigmom:{name:'Big Mom Pirates',ship:'crew-queen-mama-chanter',title:'Queen Mama Chanter',captain:'big-mom',workers:['katakuri','smoothie','cracker']},
  beasts:{name:'Beasts Pirates',ship:'crew-mammoth',title:'Mammoth',captain:'kaido',workers:['king','queen','jack']}
};
const pirateColors=['blue','amber','green','violet','red','cyan','pink','silver'];
export const crewOf = coordinator => crews[coordinator?.crew]??crews.strawhat;

export function releaseCrew(characters,terminals,machines) {
  const machineOf=address=>address.includes('/')?address.split('/')[0]:null;
  const live=new Set(terminals.filter(t=>t.state==='live').map(identity));
  const listed=new Set(terminals.map(t=>machineOf(t.address)));
  const online=new Set(machines.filter(m=>m.layout==='ready').map(m=>m.name??null));
  return Object.fromEntries(Object.entries(characters).filter(([key])=>{
    const machine=machineOf(key.slice(0,key.lastIndexOf(':')));
    return live.has(key)||!online.has(machine)||!listed.has(machine);
  }));
}

export function assignCrew(workers,previous,coordinator,reserved=[]) {
  const assigned={...previous},crew=coordinator.crew??'strawhat';
  const owner=`${coordinator.terminal}:${coordinator.created}:${crew}`;
  const roster=crewOf(coordinator).workers;
  const slot=a=>a.number?roster.length+a.number-1:roster.indexOf(a.art.replace(/^crew-/,''));
  const taken=new Set([...Object.values(assigned).map(a=>a.owner===owner?a:a.history?.[owner]).filter(Boolean),...reserved].map(slot));
  for(const worker of workers) {
    const key=identity(worker);
    if(assigned[key]?.owner===owner) continue;
    const previous=assigned[key];
    const history={...previous?.history};
    if(previous?.owner) history[previous.owner]={art:previous.art,number:previous.number,owner:previous.owner};
    if(history[owner]) {assigned[key]={...history[owner],history};continue;}
    let free=0;
    while(taken.has(free)) free++;
    taken.add(free);
    const number=free<roster.length?null:free-roster.length+1;
    const name=number===null?roster[free]:`pirate-${pirateColors[(number-1)%pirateColors.length]}`;
    assigned[key]={art:`crew-${name}`,number,owner,...(Object.keys(history).length?{history}:{})};
  }
  return assigned;
}

export function selectDefaultCrews(terminals, captains, selected, machines, preferences = {}) {
  const assigned = {...selected};
  for (const [key, captain] of Object.entries(captains)) {
    if (captain.role && captain.role !== preferences.roles?.[key] && !preferences.manualCrews?.[key]) delete assigned[key];
  }
  const live = new Set(terminals.filter(t => t.state === 'live').map(identity));
  const online = new Set(machines.filter(m => m.layout === 'ready').map(m => m.name ?? null));
  const present = key => {
    const address = key.slice(0, key.lastIndexOf(':'));
    const machine = address.includes('/') ? address.split('/')[0] : null;
    return live.has(key) || !online.has(machine);
  };
  const active = Object.keys(captains).filter(present).sort((a, b) =>
    Number(captains[b]?.role === 'firstmate') - Number(captains[a]?.role === 'firstmate'));
  const counts = Object.fromEntries(Object.keys(crews).map(id => [id, 0]));
  for (const key of active) if (crews[assigned[key]]) counts[assigned[key]]++;
  for (const key of active) {
    if (assigned[key] || !live.has(key)) continue;
    const role = captains[key]?.role;
    const primary = role === 'firstmate' || (!role && !Object.values(counts).some(Boolean));
    const candidates = primary ? ['strawhat'] : ['redhair', 'bigmom', 'beasts'];
    const crew = candidates.reduce((best, id) => counts[id] < counts[best] ? id : best);
    assigned[key] = crew;
    counts[crew]++;
  }
  return assigned;
}
