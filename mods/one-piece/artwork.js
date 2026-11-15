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
  const live=new Set(terminals.filter(t=>t.state==='live').map(identity));
  const online=new Set(machines.filter(m=>m.layout==='ready').map(m=>m.name??null));
  return Object.fromEntries(Object.entries(characters).filter(([key])=>{
    const address=key.slice(0,key.lastIndexOf(':'));
    return live.has(key)||!online.has(address.includes('/')?address.split('/')[0]:null);
  }));
}

export function assignCrew(workers,previous,coordinator) {
  const assigned={...previous},crew=coordinator.crew??'strawhat';
  const owner=`${coordinator.terminal}:${coordinator.created}:${crew}`;
  const roster=crewOf(coordinator).workers;
  const slot=a=>a.number?roster.length+a.number-1:roster.indexOf(a.art.replace(/^crew-/,''));
  const taken=new Set(Object.values(assigned).map(a=>a.owner===owner?a:a.history?.[owner]).filter(Boolean).map(slot));
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
