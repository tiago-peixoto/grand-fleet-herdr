import { machineOf } from './fleet.js';

export const recordKey=(machine,home)=>JSON.stringify([machine,home]);

export function validRecordRows(rows) {
  return Array.isArray(rows)&&rows.every(row=>row&&typeof row==='object'
    &&typeof row.address==='string'&&/^t[0-9a-z]+$/.test(row.address)
    &&Number.isSafeInteger(row.created_ms)&&row.created_ms>0&&typeof row.task==='string'
    &&['working','parked','done','blocked','paused','failed','unknown'].includes(row.state)
    &&Array.isArray(row.decisions)&&row.decisions.every(d=>d&&typeof d.key==='string'
      &&typeof d.summary==='string'&&['needs-decision','blocked'].includes(d.verb)));
}

export function withRecords(terminals,sources,reads,now=Date.now()) {
  return terminals.map(terminal=>{
    const machine=machineOf(terminal.address);
    const key=recordKey(machine,terminal.labels?.['firstmate.home']);
    if(!sources[key]) return terminal;
    const read=reads[key],age=now-read?.at;
    const valid=read?.source===JSON.stringify(sources[key])&&age>=0&&age<=30000&&validRecordRows(read.rows);
    const address=machine?terminal.address.slice(machine.length+1):terminal.address;
    const rows=valid?(read.rows??[]).filter(r=>r.address===address&&r.created_ms===terminal.created_ms&&r.task===terminal.labels?.['firstmate.task']):[];
    const taskRecord=rows.length===1?rows[0]:null;
    const blocked=taskRecord&&(taskRecord.decisions.length>0||['blocked','failed'].includes(taskRecord.state));
    return {...terminal,taskRecord,status:blocked?'blocked':terminal.status};
  });
}
