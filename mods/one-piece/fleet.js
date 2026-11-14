export const machineOf = address => address.includes('/') ? address.slice(0,address.indexOf('/')) : null;
export const identity = terminal => `${terminal.address}:${terminal.created_ms}`;
export const isWorker = terminal => Boolean(terminal.labels?.['firstmate.home'] && terminal.labels?.['firstmate.task']);
export const matches = (terminal, registration) => Number.isFinite(registration.created) && terminal.address === registration.terminal && terminal.created_ms === registration.created && terminal.state === 'live';

export function terminalLabel(terminal) {
  const recoveryName=terminal.labels?.['one-piece.restored']==='true' && /^op-shell-\d+-\d+$/.test(terminal.name);
  return (!recoveryName && terminal.name) || terminal.labels?.['firstmate.task'] || terminal.address;
}

export function withLocations(terminals, panes, spaces) {
  const locations=new Map(spaces.flatMap(space=>space.tabs.map(tab=>[tab.id,space.id])));
  const tabs=new Map(panes.filter(p=>p.terminal).map(p=>[p.terminal,p.tab]));
  return terminals.map(terminal=>({...terminal,tab:tabs.get(terminal.address),space:locations.get(tabs.get(terminal.address))}));
}

export function fleet(terminals, machines, registrations) {
  return machines.map(machine => {
    const base = {machine:machine.name,state:machine.layout,coordinators:[],independent:[],unassigned:[],missing:[]};
    if (machine.layout !== 'ready') return base;
    const local = terminals.filter(t=>machineOf(t.address)===machine.name && t.state==='live');
    const bindings = registrations.filter(r=>machineOf(r.terminal)===machine.name);
    base.missing = bindings.filter(r=>!local.some(t=>matches(t,r)));
    base.coordinators = bindings.flatMap(r=>{
      const terminal=local.find(t=>matches(t,r));
      if (!terminal) return [];
      const unique=bindings.filter(other=>other.home===r.home).length===1;
      const workers=unique ? local.filter(t=>isWorker(t)&&t.labels['firstmate.home']===r.home&&!bindings.some(other=>matches(t,other))) : [];
      return [{...r,session:terminal,workers}];
    });
    const known=new Set(base.coordinators.flatMap(c=>[c.terminal,...c.workers.map(t=>t.address)]));
    base.unassigned=local.filter(t=>isWorker(t)&&!known.has(t.address));
    base.independent=local.filter(t=>!isWorker(t)&&!known.has(t.address));
    return base;
  });
}

export function assignCharacters(workers, previous) {
  const assigned={...previous};
  let count=Object.keys(assigned).length;
  for (const worker of workers) {
    const key=identity(worker);
    if (!assigned[key]) {
      assigned[key]=count===0 ? {art:'chopper',number:null} : count===1 ? {art:'franky',number:null} : {art:'pirate',number:count-1};
      count++;
    }
  }
  return assigned;
}

export function inspectionTarget(terminals, machines, registrations, target) {
  if (!target) return null;
  const terminal=terminals.find(t=>matches(t,target));
  if (!terminal || !machines.some(m=>m.name===machineOf(terminal.address)&&m.layout==='ready')) return null;
  if (isWorker(terminal) || registrations.some(r=>r.role==='secondmate'&&matches(terminal,r))) return terminal;
  return null;
}

export function zoomTarget(panes, tab) {
  const visible=panes.filter(p=>p.tab===tab);
  return visible.find(p=>p.zoomed)??visible.find(p=>p.focused);
}

export function attention(world) {
  return world.flatMap(machine=>[
    ...machine.coordinators.flatMap(c=>[
      {terminal:c.session,kind:c.role==='firstmate'?'Firstmate':'Secondmate',inspect:c.role!=='firstmate'},
      ...c.workers.map(terminal=>({terminal,kind:'Worker',inspect:true}))
    ]),
    ...machine.unassigned.map(terminal=>({terminal,kind:'Worker',inspect:true})),
    ...machine.independent.map(terminal=>({terminal,kind:'Independent',inspect:false}))
  ]).filter(item=>item.terminal.status==='blocked');
}

export const crews = {
  strawhat:{name:'Straw Hat Pirates',ship:'sunny',title:'Thousand Sunny',captain:'luffy',workers:['chopper','franky','zoro','nami','usopp','sanji','robin','brook','jinbe']},
  redhair:{name:'Red Hair Pirates',ship:'crew-red-force',title:'Red Force',captain:'shanks',workers:['benn-beckman','yasopp','lucky-roux']},
  bigmom:{name:'Big Mom Pirates',ship:'crew-queen-mama-chanter',title:'Queen Mama Chanter',captain:'big-mom',workers:['katakuri','smoothie','cracker']},
  beasts:{name:'Beasts Pirates',ship:'crew-mammoth',title:'Mammoth',captain:'kaido',workers:['king','queen','jack']}
};
const pirateColors=['blue','amber','green','violet','red','cyan','pink','silver'];
export const crewOf = coordinator => crews[coordinator?.crew]??crews.strawhat;

export function assignCrew(workers,previous,coordinator) {
  const assigned={...previous},crew=coordinator.crew??'strawhat';
  const owner=`${coordinator.terminal}:${coordinator.created}:${crew}`;
  let count=Object.values(assigned).filter(a=>a.owner===owner||a.history?.[owner]).length;
  for(const worker of workers) {
    const key=identity(worker);
    if(assigned[key]?.owner===owner) continue;
    const previous=assigned[key];
    const history={...previous?.history};
    if(previous?.owner) history[previous.owner]={art:previous.art,number:previous.number,owner:previous.owner};
    if(history[owner]) {assigned[key]={...history[owner],history};continue;}
    const roster=crewOf(coordinator).workers;
    const number=count<roster.length?null:count-roster.length+1;
    const name=number===null?roster[count]:`pirate-${pirateColors[(number-1)%pirateColors.length]}`;
    assigned[key]={art:`crew-${name}`,number,owner,...(Object.keys(history).length?{history}:{})};
    count++;
  }
  return assigned;
}
