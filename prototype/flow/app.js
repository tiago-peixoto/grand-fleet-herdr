const $=s=>document.querySelector(s);
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let elapsed=0,lastTick=performance.now(),toastTimer;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reducedMotion.matches;
const loaded={},frames={};
const sessions=[
{id:'firstmate',name:'firstmate',host:'local',kind:'coordinator',role:'Firstmate',draft:'',messages:[{role:'user',text:'Keep the mod moving. I’ll work in my own terminals alongside you.'},{role:'assistant',text:'Aye. I’ll coordinate the fleet here. Add your own terminals in this workspace whenever you need them. Each coordinator keeps its own chat and terminals.'},{role:'assistant',text:'Chopper is checking navigation. Franky needs your choice on the crew panel. Open his card below to inspect the task.'}],workers:[{id:1,name:'Chopper',art:'chopper',status:'working',task:'Validate fleet navigation',detail:'Checking that every ship opens its coordinator and workers stay with their assigned crew.',draft:'',notes:[]},{id:2,name:'Franky',art:'franky',status:'blocked',task:'Refine the crew panel',detail:'Keep the crew visible below the firstmate conversation by default?',draft:'',notes:[]},{id:3,name:'Pirate',art:'pirate',status:'idle',task:'Check compact view',detail:'Waiting for the crew panel decision.',draft:'',notes:[]}]},
{id:'artemis',name:'artemis-mate',host:'hz-server',kind:'coordinator',role:'Second mate',draft:'',messages:[{role:'assistant',text:'I’m coordinating Artemis work on hz-server. Chopper is checking geometry. Your own terminals are separate from this conversation.'}],workers:[{id:4,name:'Chopper',art:'chopper',status:'working',task:'Check roof geometry',detail:'Checking roof intersections and the edit preview.',draft:'',notes:[]}]},
{id:'trade',name:'trade-tool-mate',host:'local',kind:'coordinator',role:'Second mate',draft:'',messages:[{role:'assistant',text:'I’m coordinating the trade tool on local. Franky is checking the save flow.'}],workers:[{id:5,name:'Franky',art:'franky',status:'working',task:'Verify saved trades',detail:'Reviewing the save flow and empty states.',draft:'',notes:[]}]}
];
const machines=[{id:'local',name:'Water 7'},{id:'hz-server',name:'Wano'}];
for(const coordinator of [...sessions]) {
 coordinator.panes=[coordinator.id];coordinator.layout='daily';coordinator.expanded=coordinator.id==='firstmate';
 for(const worker of coordinator.workers) sessions.push({id:'worker'+worker.id,name:worker.name,host:coordinator.host,kind:'worker',role:'Worker',owner:coordinator.id,art:worker.art,worker, draft:'',messages:[{role:'assistant',text:worker.detail}],panes:['worker'+worker.id],layout:'daily'});
}
let active='firstmate',focused='firstmate',maximized=null,nextTerminal=1;
const get=id=>sessions.find(s=>s.id===id);
const workspace=()=>get(active);
const visible=()=>workspace().panes.filter(id=>!maximized||id===maximized);
const machineName=id=>machines.find(m=>m.id===id).name;
function art(name,status='idle'){const size=name==='sunny'?128:name==='flag'?32:64;return `<canvas width="${size}" height="${size}" data-art="${name}" data-status="${status}" aria-hidden="true"></canvas>`}
function host(s){return `<span class="host ${s.host==='hz-server'?'remote':''}">${machineName(s.host)} · ${s.host}</span>`}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;toastTimer=setTimeout(()=>$('#toast').textContent='',4000)}
function saveScroll(){document.querySelectorAll('.history').forEach(el=>get(el.dataset.history).scroll=el.scrollTop)}
function nav(s){return `<button class="nav ship-toggle" data-ship="${s.id}" aria-expanded="${s.expanded}" aria-controls="crew-${s.id}" aria-label="${s.expanded?'Collapse':'Expand'} Sunny crew for ${escapeHTML(s.name)}">${art('sunny')}<span><strong>Thousand Sunny</strong><small>${escapeHTML(s.name)} · ${s.workers.length} ${s.workers.length===1?'worker':'workers'}</small></span><span class="chevron">${s.expanded?'⌄':'›'}</span></button><div class="worker-nav" id="crew-${s.id}" ${s.expanded?'':'hidden'}><button class="captain-session" data-open="${s.id}" aria-current="${active===s.id}">${art('luffy')}<span><strong>Luffy · ${escapeHTML(s.name)}</strong><small>${s.role} · pinned first</small></span></button>${s.workers.map(w=>`<button data-open="worker${w.id}" aria-current="${active==='worker'+w.id}">${art(w.art,w.status)}<span>${w.name}<small>${w.status==='blocked'?'Needs you · sitting':w.status==='working'?'Working · walking':'Idle · sleeping'}</small></span></button>`).join('')}</div>`}
function pane(s){const terminal=s.kind==='terminal',isWorker=s.kind==='worker';return `<section class="pane ${focused===s.id?'focused':''}" data-pane="${s.id}" aria-label="${escapeHTML(s.name)} on ${s.host}"><header class="pane-head">${terminal?'<span class="prompt">›_</span>':art(isWorker?s.art:'luffy',isWorker?s.worker.status:'idle')}<div class="pane-title"><strong>${escapeHTML(s.name)}</strong><small>${terminal?'YOUR TERMINAL · '+escapeHTML(s.path):isWorker?'WORKER · '+escapeHTML(get(s.owner).name):s.role.toUpperCase()+' · LUFFY / THOUSAND SUNNY'}</small></div>${host(s)}<button class="icon" data-max="${s.id}" aria-label="${maximized?'Restore grid':'Maximize '+escapeHTML(s.name)}">${maximized?'⊟':'⊞'}</button>${terminal?`<button class="icon" data-hide="${s.id}" aria-label="Hide ${escapeHTML(s.name)} pane">×</button>`:''}</header><div class="history ${terminal?'terminal-history':''}" data-history="${s.id}" tabindex="0" aria-label="${escapeHTML(s.name)} history">${terminal?'<div class="terminal-banner">Your shell · '+s.host+'\nSample output · type help for demo commands</div>'+s.lines.map(l=>'<div class="command">'+s.host+' ❯ '+escapeHTML(l.command)+'</div><div class="output">'+escapeHTML(l.output)+'</div>').join(''):s.messages.map(m=>'<article class="message '+m.role+'"><b>'+(m.role==='user'?'You':(isWorker?'':'Luffy · ')+escapeHTML(s.name))+'</b>'+escapeHTML(m.text)+'</article>').join('')}</div><form class="input-form" data-form="${s.id}"><span class="prompt">${terminal?'❯':'↗'}</span><input data-input="${s.id}" aria-label="${terminal?'Command in':'Message'} ${escapeHTML(s.name)} on ${s.host}" value="${escapeHTML(s.draft)}" maxlength="4000" autocomplete="off" placeholder="${terminal?'Type a command…':'Message '+escapeHTML(s.name)+'…'}"><button class="btn ${terminal?'':'primary'}" type="submit">${terminal?'Run ↵':'Send ↑'}</button></form>${terminal?'':isWorker?`<div class="worker-context"><span class="eyebrow gold">${escapeHTML(s.worker.task)}</span><p>${escapeHTML(s.worker.detail)}</p>${s.worker.status==='blocked'?'<button class="btn primary" data-approve="'+s.id+'">Keep crew visible →</button>':''}<button class="btn" data-open="${s.owner}">← Back to ${escapeHTML(get(s.owner).name)}</button></div>`:`<div class="crew"><div class="crew-title"><span class="eyebrow gold">Crew aboard Sunny</span><small>${s.workers.length} workers</small></div><div class="crew-row">${s.workers.map(w=>`<button class="worker ${w.status}" data-worker="${w.id}">${art(w.art,w.status)}<span><strong>${w.name}</strong><small>${w.status==='blocked'?'! Needs you':w.status==='working'?'Working':'Idle'} ↗</small></span></button>`).join('')}</div></div>`}</section>`}
function render(){
 $('#machines').innerHTML=machines.map(m=>`<section class="machine-group"><div class="machine-heading"><div><strong>${escapeHTML(m.name)}</strong><small>${m.id}</small></div><button class="icon" data-rename="${m.id}" aria-label="Rename ${escapeHTML(m.name)}">✎</button></div>${sessions.filter(s=>s.kind==='coordinator'&&s.host===m.id).map(nav).join('')}</section>`).join('');
 const current=workspace();
 $('#terminals').innerHTML=sessions.filter(s=>s.kind==='terminal'&&s.owner===active).map(s=>`<button class="nav terminal-nav" data-open="${s.id}"><span class="terminal-icon">›_</span><span><strong>${escapeHTML(s.name)}</strong><small>${current.panes.includes(s.id)?'Open':'Hidden'} · ${s.host}</small></span></button>`).join('')||'<p class="sidebar-note">No secondary terminals yet.</p>';
 $('#terminalSection').hidden=current.kind==='worker';
 $('#workspaceName').textContent=current.name;
 $('#grid').className='grid '+current.layout+(maximized?' maximized':'')+(visible().length===1?' single':'');
 $('#grid').innerHTML=visible().map(id=>pane(get(id))).join('');
 $('#paneCount').textContent=' / '+(current.kind==='worker'?'worker workspace':current.panes.length+(current.panes.length===1?' pane':' panes'));$('#restore').hidden=!maximized;
 $('#daily').classList.toggle('layout-active',current.layout==='daily');$('#equal').classList.toggle('layout-active',current.layout==='equal');
 $('#addPane').hidden=current.kind==='worker';$('#daily').hidden=current.kind==='worker';$('#equal').hidden=current.kind==='worker';
 $('#workspaceHint').textContent=machineName(current.host)+' / '+current.host+' · '+(current.kind==='worker'?'Worker for '+get(current.owner).name:'Coordinator workspace · chat + your terminals');
 document.querySelectorAll('.history').forEach(el=>{el.scrollTop=get(el.dataset.history).scroll??el.scrollHeight});paint();
}
function openPane(id){saveScroll();const target=get(id);if(!target)return;
 if(target.kind==='terminal'){active=target.owner;if(!workspace().panes.includes(id))workspace().panes.push(id)}else active=id;
 if(target.kind==='worker')get(target.owner).expanded=true;else if(target.kind==='coordinator')target.expanded=true;
 focused=id;maximized=null;$('#body').classList.remove('nav-open');$('#menu').setAttribute('aria-expanded','false');render();document.querySelector(`[data-input="${id}"]`)?.focus({preventScroll:true});
}
function runCommand(s,text){if(text==='clear'){s.lines=[];return}const outputs={help:'Demo commands: pwd, ls, hostname, git status, clear, help\nCommands are simulated. Nothing runs on either machine.',hostname:s.host,pwd:(s.host==='local'?'/Users/captain':'/home/captain')+s.path.slice(1),ls:'artemis/   firstmate/   trade-tool/','git status':'On branch prototype\nNothing to commit, working tree clean (sample)'};s.lines.push({command:text,output:outputs[text]??'Preview only: this command was not executed. Type help for sample commands.'})}
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.open)openPane(b.dataset.open);
 if(b.dataset.ship){saveScroll();const s=get(b.dataset.ship);s.expanded=!s.expanded;render();document.querySelector(`[data-ship="${s.id}"]`).focus({preventScroll:true})}
 if(b.dataset.max){saveScroll();maximized=maximized?null:b.dataset.max;focused=b.dataset.max;render()}
 if(b.dataset.hide){saveScroll();workspace().panes=workspace().panes.filter(id=>id!==b.dataset.hide);if(maximized===b.dataset.hide)maximized=null;focused=active;render();toast('Terminal hidden. Reopen it in this workspace with its history and draft intact.')}
 if(b.dataset.worker)openPane('worker'+b.dataset.worker);
 if(b.dataset.rename){$('#machineId').value=b.dataset.rename;$('#machineName').value=machineName(b.dataset.rename);$('#machineError').textContent='';$('#machineDialog').showModal()}
 if(b.dataset.approve){const s=get(b.dataset.approve);s.worker.status='working';s.worker.detail='Decision received. Keeping the crew visible and continuing the refinement.';s.messages.push({role:'assistant',text:'Demo approval recorded. Continuing the refinement.'});saveScroll();render()}
 if(b.dataset.close)document.getElementById(b.dataset.close).close();

});
document.addEventListener('focusin',event=>{const el=event.target.closest('[data-pane]');if(!el)return;focused=el.dataset.pane;document.querySelectorAll('[data-pane]').forEach(p=>p.classList.toggle('focused',p.dataset.pane===focused));});
document.addEventListener('input',event=>{if(event.target.dataset.input)get(event.target.dataset.input).draft=event.target.value});
document.addEventListener('submit',event=>{
 if(event.target.dataset.form){event.preventDefault();const s=get(event.target.dataset.form),text=s.draft.trim();if(!text)return;saveScroll();if(s.kind==='terminal')runCommand(s,text);else s.messages.push({role:'user',text},{role:'assistant',text:'Scripted preview reply: your message stays with '+s.name+' on '+s.host+'. Your own terminals remain independent.'});s.draft='';s.scroll=null;render();document.querySelector(`[data-input="${s.id}"]`).focus({preventScroll:true})}

});
$('#daily').onclick=()=>{saveScroll();workspace().layout='daily';maximized=null;render()};
$('#equal').onclick=()=>{saveScroll();workspace().layout='equal';maximized=null;render()};
$('#restore').onclick=()=>{saveScroll();maximized=null;render()};
function newTerminal(){if(workspace().kind!=='coordinator')return;$('#terminalName').value='';$('#terminalError').textContent='';$('#terminalDestination').textContent=workspace().name+' · '+machineName(workspace().host)+' / '+workspace().host;$('#terminalDialog').showModal();$('#terminalName').focus()}
$('#newTerminal').onclick=newTerminal;$('#addPane').onclick=newTerminal;
$('#terminalForm').onsubmit=event=>{event.preventDefault();const name=$('#terminalName').value.trim(),owner=workspace();if(owner.kind!=='coordinator')return;if(!name||sessions.some(s=>s.kind==='terminal'&&s.owner===active&&s.name.toLowerCase()===name.toLowerCase())){$('#terminalError').textContent='Use a unique terminal name in this workspace.';return}const s={id:'terminal'+nextTerminal++,name,owner:active,host:owner.host,kind:'terminal',draft:'',path:'~/Workspace',lines:[]};sessions.push(s);$('#terminalDialog').close();openPane(s.id)};
$('#machineForm').onsubmit=event=>{event.preventDefault();const name=$('#machineName').value.trim(),machine=machines.find(m=>m.id===$('#machineId').value);if(!name||machines.some(m=>m!==machine&&m.name.toLowerCase()===name.toLowerCase())){$('#machineError').textContent='Use a unique machine name.';return}machine.name=name;$('#machineDialog').close();saveScroll();render()};
$('#menu').onclick=()=>$('#menu').setAttribute('aria-expanded',String($('#body').classList.toggle('nav-open')));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('dialog[open]')){$('#body').classList.remove('nav-open');$('#menu').setAttribute('aria-expanded','false')}});
function motionLabel() {
  $('#motion').textContent=paused?'Resume motion':'Pause motion';
  $('#motion').setAttribute('aria-pressed',String(paused));
}
$('#motion').onclick=()=>{paused=!paused;lastTick=performance.now();motionLabel();paint()};
reducedMotion.addEventListener('change',event=>{paused=event.matches;motionLabel();paint()});
function animationFrame(name,status) {
  if(['chopper','franky','pirate'].includes(name)){const row=status==='working'?1:status==='blocked'?2:0;return row*4+Math.floor(elapsed/(status==='working'?220:status==='blocked'?700:850))%4;}
  if (status!=='idle'&&status!=='working') return 0;
  if (name==='flag') return Math.floor(elapsed/240)%4;
  if (name==='sunny') return [0,1,2,3,2,1][Math.floor(elapsed/520)%6];
  if (status==='working') return 4+Math.floor(elapsed/330)%4;
  const time=elapsed%2600;
  return time<1750?0:time<2000?1:time<2200?2:3;
}
function paint() {
  document.querySelectorAll('canvas[data-art]').forEach(canvas=>{
    const name=canvas.dataset.art, sheet=loaded[name];
    if (!sheet) return;
    const index=animationFrame(name,canvas.dataset.status),f=frames[name][index];
    if (canvas.dataset.frame===String(index)) return;
    canvas.dataset.frame=String(index);
    const context=canvas.getContext('2d');
    context.clearRect(0,0,canvas.width,canvas.height);
    context.imageSmoothingEnabled=false;
    const scale=frames[name].scale,width=Math.round(f.w*scale),height=Math.round(f.h*scale);
    context.drawImage(sheet,f.x,f.y,f.w,f.h,(name==='flag'?2:Math.round((canvas.width-width)/2)),canvas.height-3-height,width,height);
  });
}
const ready=Promise.all(Object.entries(urls).map(async([name,url])=>{
  const img=new Image();img.src=url;await img.decode();
  const rows=name==='workerStates'?9:['sunny','flag'].includes(name)?1:2,cw=img.width/4,ch=img.height/rows;
  const sheet=document.createElement('canvas');sheet.width=img.width;sheet.height=img.height;
  const ctx=sheet.getContext('2d');ctx.drawImage(img,0,0);
  const data=ctx.getImageData(0,0,img.width,img.height).data;
  let rowBands=[];
  if(name==='workerStates'){
    for(let y=0;y<img.height;y++){
      let count=0;for(let x=0;x<img.width;x++)if(data[(y*img.width+x)*4+3]>160)count++;
      if(count<8)continue;
      const last=rowBands.at(-1);if(last&&y-last[1]<=8)last[1]=y;else rowBands.push([y,y]);
    }
    if(rowBands.length!==9)throw Error('Expected nine worker animation rows, found '+rowBands.length);
  }
  frames[name]=[];
  let maxW=0,maxH=0;
  for(let row=0;row<rows;row++)for(let col=0;col<4;col++){
    const x0=Math.round(col*cw),x1=Math.round((col+1)*cw),y0=rowBands.length?rowBands[row][0]:Math.round(row*ch),y1=rowBands.length?rowBands[row][1]+1:Math.round((row+1)*ch);
    let left=x1,right=x0,top=y1,bottom=y0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*img.width+x)*4+3]>160){
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(right<left)throw Error('Empty frame: '+name);
    const box={x:left,y:top,w:right-left+1,h:bottom-top+1};
    frames[name].push(box);maxW=Math.max(maxW,box.w);maxH=Math.max(maxH,box.h);
  }
  const limit=name==='sunny'?116:name==='flag'?28:name==='chopper'?44:56;
  frames[name].scale=Math.min(limit/maxH,limit/maxW);
  if(name==='workerStates'){
    ['chopper','franky','pirate'].forEach((character,index)=>{
      frames[character]=frames[name].slice(index*12,index*12+12);
      const limit=character==='chopper'?44:56;
      frames[character].scale=Math.min(limit/Math.max(...frames[character].map(f=>f.w)),limit/Math.max(...frames[character].map(f=>f.h)));
      loaded[character]=img;
    });
    delete frames[name];
  }else loaded[name]=img;
})).then(()=>{document.body.dataset.ready='true';paint()}).catch(error=>{document.body.dataset.ready='error';toast('Artwork could not load. '+error.message)});
motionLabel();render();
setInterval(()=>{
  const tick=performance.now();
  if(!paused&&!document.hidden){elapsed+=Math.min(tick-lastTick,100);paint()}
  lastTick=tick;
},80);
