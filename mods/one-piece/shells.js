import { isWorker, machineOf, matches } from './fleet.js';

export function rememberShells(previous, terminals, panes, spaces, machines, registrations) {
  const records=previous.filter(record=>{
    if(!machines.some(m=>m.name===record.machine&&m.layout==='ready')) return true;
    const current=terminals.find(t=>t.address===record.terminal||(record.restoreName&&t.name===record.restoreName&&machineOf(t.address)===record.machine));
    return !current||(current.state==='live'&&(current.program?.shell||matches(current,record))&&!current.labels?.['one-piece.placeholder']&&!isWorker(current)&&!registrations.some(r=>matches(current,r)));
  });
  for(const pane of panes) {
    const terminal=terminals.find(t=>t.address===pane.terminal);
    const space=spaces.find(s=>s.tabs.some(t=>t.id===pane.tab));
    if(!terminal||!space||!pane.cwd||!Number.isFinite(terminal.created_ms)||terminal.state!=='live'||(!terminal.program?.shell&&!records.some(r=>matches(terminal,r)))||terminal.labels?.['one-piece.placeholder']||isWorker(terminal)||registrations.some(r=>matches(terminal,r))) continue;
    if(!machines.some(m=>m.name===space.machine&&m.layout==='ready')||machineOf(terminal.address)!==space.machine) continue;
    const index=records.findIndex(r=>r.terminal===terminal.address||(r.restoreName&&r.restoreName===terminal.name&&r.machine===space.machine));
    const prior=records[index];
    const record={terminal:terminal.address,created:terminal.created_ms,space:space.id,tab:pane.tab,cwd:pane.cwd,machine:space.machine};
    if(terminal.labels?.['one-piece.restored']==='true'||prior&&(prior.newProcess||prior.created!==terminal.created_ms||prior.terminal!==terminal.address)) record.newProcess=true;
    if(index<0) records.push(record);else records[index]=record;
  }
  return records;
}

export function missingShells(records,terminals,machines) {
  return records.filter(r=>machines.some(m=>m.name===r.machine&&m.layout==='ready')&&!terminals.some(t=>t.address===r.terminal||(r.restoreName&&t.name===r.restoreName&&machineOf(t.address)===r.machine)));
}
