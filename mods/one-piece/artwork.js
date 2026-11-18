export const identity = terminal => `${terminal.address}:${terminal.created_ms}`;

export const crews = {
  strawhat:{name:'Straw Hat Pirates',ship:'sunny',title:'Thousand Sunny',captain:'luffy',workers:['chopper','franky','zoro','nami','usopp','sanji','robin','brook','jinbe']},
  redhair:{name:'Red Hair Pirates',ship:'crew-red-force',title:'Red Force',captain:'shanks',workers:['benn-beckman','yasopp','lucky-roux','limejuice','bonk-punch','monster','building-snake','hongo','howling-gab','rockstar']},
  bigmom:{name:'Big Mom Pirates',ship:'crew-queen-mama-chanter',title:'Queen Mama Chanter',captain:'big-mom',workers:['katakuri','smoothie','cracker','perospero','compote','daifuku','oven','snack','brulee','mont-d-or','amande','galette','opera','pudding','flampe','tamago','pekoms','streusen','bobbin']},
  beasts:{name:'Beasts Pirates',ship:'crew-mammoth',title:'Mammoth',captain:'kaido',workers:['king','queen','jack','whos-who','sasaki','black-maria','ulti','page-one','x-drake','basil-hawkins','sheepshead','ginrummy','holedem','speed','babanuki','daifugo','solitaire','bao-huang']},
  heart:{name:'Heart Pirates',ship:'crew-polar-tang',title:'Polar Tang',captain:'law',workers:['bepo','shachi','penguin','jean-bart','ikkaku','uni','clione','hakugan']},
  whitebeard:{name:'Whitebeard Pirates',ship:'crew-moby-dick',title:'Moby Dick',captain:'whitebeard',workers:['marco','ace','jozu','thatch','vista','blamenco','rakuyo','namur','blenheim','curiel','kingdew','haruta','atmos','speed-jiru','fossa','izo','tate','oden','toki','young-inuarashi','young-nekomamushi','young-teach','young-whitey-bay','young-andre','young-epoida','young-kinga','islewan']},
  roger:{name:'Roger Pirates',ship:'crew-oro-jackson',title:'Oro Jackson',captain:'roger',workers:['rayleigh','gaban','crocus','oden','seagull-guns-nozdon','sunbell','spencer','moon-isaac-jr','donquino','millet-pine','rowing','erio','petermoo','jacksonbanner','blumarine','max-marx','taro','doringo','ganryu','cb-gallant','mr-momora','yui','rangram','mugren','bankuro','yamon','young-shanks','young-buggy','young-inuarashi','young-nekomamushi','toki']},
  kid:{name:'Kid Pirates',ship:'crew-victoria-punk',title:'Victoria Punk',captain:'kid',workers:['killer','heat','wire','gig','dive','uk','pomp','bubblegum','reck','house','boogie','mosh','hip','papas','jaguar','quincy','moai','hop','emma','compo','disc-j']}
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

// Whoever held the chosen character takes the one given up, so a crew never shows two of the same.
export function chooseCharacter(characters, key, name) {
  const mine = characters[key], art = `crew-${name}`;
  if (!mine || mine.art === art) return characters;
  const holder = Object.keys(characters).find(other => characters[other].owner === mine.owner && characters[other].art === art);
  return {...characters, [key]:{...mine, art, number:null},
    ...(holder ? {[holder]:{...characters[holder], art:mine.art, number:mine.number}} : {})};
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
    const candidates = primary ? ['strawhat'] : Object.keys(crews).filter(id => id !== 'strawhat');
    const crew = candidates.reduce((best, id) => counts[id] < counts[best] ? id : best);
    assigned[key] = crew;
    counts[crew]++;
  }
  return assigned;
}

export function selectFleetCrews(fleets, selected, captainCrews, retained) {
  const assigned = Object.fromEntries(Object.entries(selected).filter(([id, crew]) => crews[crew] && (fleets.includes(id) || retained(id))));
  const counts = Object.fromEntries(Object.keys(crews).map(id => [id, 0]));
  for (const crew of [...captainCrews, ...Object.values(assigned)]) if (crew in counts) counts[crew]++;
  const candidates = Object.keys(crews).filter(id => id !== 'strawhat' || !captainCrews.length);
  for (const id of fleets) {
    if (assigned[id]) continue;
    const crew = candidates.reduce((best, candidate) => counts[candidate] < counts[best] ? candidate : best);
    assigned[id] = crew;
    counts[crew]++;
  }
  return assigned;
}

// Each machine keeps its island for good, so a machine that is away keeps its place on the map.
export function assignIslands(islands, names) {
  let result = islands;
  for (const name of [...new Set(names)].sort()) {
    if (result[name] != null) continue;
    const used = Object.values(result);
    const count = index => used.filter(island => island === index).length;
    result = {...result, [name]:[0, 1, 2, 3, 4, 5, 6, 7].reduce((best, index) => count(index) < count(best) ? index : best)};
  }
  return result;
}
