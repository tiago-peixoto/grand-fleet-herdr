export const identity = terminal => `${terminal.address}:${terminal.created_ms}`;

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
