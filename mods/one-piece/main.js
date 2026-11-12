import { View, div, image } from 'gpui-kit';
import { h_flex, v_flex, Editor, EditorState, Input, InputState } from 'gpui-base';
import { terminals as coreTerminals, machines, spaces, panes, focused, props, shared, setShared, run, hc, theme, settings, openOverlay, closeOverlay, nextCommand, notify } from 'herdr';
import { fleet, identity, matches, machineOf, isWorker, assignCharacters, inspectionTarget, withLocations, zoomTarget, attention } from './fleet.js';
import { rememberShells, missingShells } from './shells.js';

const terminals=()=>withLocations(coreTerminals(),panes(),spaces());

const KEY='one-piece';
// Copies share lifecycle guards because Retry cleanup can run in another sidebar.
const activePlaceholders=new Set();
const cleanedPlaceholders=new Set();
const placeholderKey=record=>JSON.stringify([record.machine,record.name]);
function paneReady(id) {
  const pane=panes().find(p=>p.pane===id);
  const space=pane&&spaces().find(s=>s.tabs.some(t=>t.id===pane.tab));
  return Boolean(space&&machines().some(m=>m.name===space.machine&&m.layout==='ready'));
}
const config=()=>shared(KEY)??{coordinators:[],aliases:{},characters:{},inspections:{},paused:false};
function save(patch) { setShared(KEY,{...config(),...patch}); }
const label=t=>t.name||t.labels?.['firstmate.task']||t.address;
const stateLabel=t=>t.status==='working'?'Working':t.status==='blocked'?'Needs you':t.status==='done'?'Finished':t.status==='idle'?'Idle':'Status unavailable';
const machineLabel=name=>config().aliases[name??'local']||(name===null?'Water 7':name==='hz-server'?'Wano':name);
const button=(id,text,action,primary=false)=>h_flex().id(id).px(12).h(30).items_center().rounded(6).border_1().border_color(primary?'#e8bd70':'#344c51').bg(primary?'#e8bd70':'#203238').text_color(primary?'#14242a':'#dce6e3').text_size(12).cursor_pointer().hover(s=>s.opacity(0.85)).on_mouse_down('left',(_e,cx)=>cx.stop_propagation()).on_click(action).child(text);

function art(name,status='idle',size=48) {
  const motion=config().paused||(!['sunny','flag'].includes(name)&&!['idle','working','blocked'].includes(status))?'png':'gif';
  const suffix=['sunny','flag'].includes(name)?'':`-${status==='working'?'working':status==='blocked'&&name!=='luffy'?'blocked':'idle'}`;
  return image(`mods/one-piece/assets/${name}${suffix}.${motion}`).w(size).h(size).flex_none();
}

function notifyError(error) { notify({title:'Grand Fleet',body:String(error.message??error),level:'error'}); }
async function checked(args) {
  const result=await hc(args);
  if(result.code!==0) throw new Error(result.stderr||result.stdout||'Herdr could not complete the operation.');
  return result;
}

export default class Fleet extends View {
  init(_props,cx) {
    this.collapsed={}; this.busy=false; this.error=''; this.updated=null;
    this.handle=cx.focus_handle();
    const view=props()?.view;
    if(view==='inspect') {
      this.editor=EditorState.new({readonly:true,line_numbers:false,folding:false,soft_wrap:false,font_family:settings().font_family,font_size:14,value:'Connecting to terminal output…'});
      this.refresh(cx);
      cx.timer.every(1000,c=>this.refresh(c));
    }
    if(view==='rename-tab') this.tabName=InputState.new({value:props().name});
    if(view==='setup') {
      this.homeInput=InputState.new({placeholder:'firstmate.home label, such as a1b2c3'});
      this.aliasInput=InputState.new({value:machineLabel(props().machine??null)});
      this.selected=null; this.role='firstmate';
    }
    // Hidden windows can stop rendering while terminal directories keep changing.
    if(!view) cx.timer.every(1000,()=>this.rememberShells());
    if(!view) cx.spawn(async c=>{
      for(;;) {
        const command=await nextCommand();
        if(command==='focus') this.handle.focus();
        if(command==='setup') this.setup();
        if(command==='inspect-focused') {
          const t=terminals().find(t=>t.address===focused()?.terminal);
          if(t) await this.inspect(t,c);
        }
        if(command==='close-tab') this.requestClose('tab',focused()?.tab);
        if(command==='close-pane') this.requestClose('pane',focused()?.pane);
        if(command==='firstmate') this.openFirstmate();
        if(command==='restore-layout') this.openRestore();
        c.notify();
      }
    });
  }

  setup(machine=focused()?.space?spaces().find(s=>s.id===focused().space)?.machine??null:null) {
    openOverlay({mod:'one-piece',props:{view:'setup',machine},kind:'dialog',width:600,height:560});
  }

  rememberShells() {
    const previous=config().shells??[];
    const shells=rememberShells(previous,terminals(),panes(),spaces(),machines(),config().coordinators);
    if(JSON.stringify(previous)!==JSON.stringify(shells)) save({shells});
  }

  openRestore() {
    this.rememberShells();
    openOverlay({mod:'one-piece',props:{view:'restore'},kind:'dialog',width:620,height:460});
  }

  async restoreShell(record,cx) {
    if(this.busy) return;
    const current=missingShells(config().shells??[],terminals(),machines()).find(r=>r.terminal===record.terminal&&r.created===record.created);
    if(!current) return;
    this.busy=true;cx.notify();
    try {
      const restoreName=current.restoreName??`op-shell-${Date.now()}-${Math.floor(Math.random()*1000000)}`;
      save({shells:config().shells.map(r=>r.terminal===current.terminal&&r.created===current.created?{...r,restoreName}:r)});
      const localId=id=>current.machine&&id.startsWith(current.machine+'/')?id.slice(current.machine.length+1):id;
      const args=['run','--json','--bg','--keep','--no-parent','--no-notify','--name',restoreName,'--cwd',current.cwd,
        '--label',`herdr.space=${localId(current.space)}`,'--label',`herdr.tab=${localId(current.tab)}`,'--label','one-piece.restored=true'];
      if(current.machine) args.push('--on',current.machine);
      const launched=JSON.parse((await checked(args)).stdout);
      if(typeof launched.address!=='string'||machineOf(launched.address)!==current.machine) throw new Error('Herdr returned an unexpected machine for the new shell.');
      for(let attempt=0;attempt<40&&!panes().some(p=>p.terminal===launched.address);attempt++) await cx.sleep(100);
      if(!panes().some(p=>p.terminal===launched.address)) throw new Error(`Shell ${launched.address} started, but its pane is not available yet. It will appear after the machine reconnects.`);
      this.rememberShells();
      notify({title:'New personal shell',body:`Created ${launched.address} in ${current.cwd}. This is a new process, not the previous conversation.`});
    } catch(error) {notifyError(error);}
    finally {this.busy=false;cx.notify();}
  }

  restoreView() {
    const missing=missingShells(config().shells??[],terminals(),machines());
    const list=v_flex().flex_1().min_h(0).gap(12).overflow_y_scrollbar();
    for(const record of missing) list.child(v_flex().p(12).gap(8).rounded(8).bg('#20383e')
      .child(div().text_size(12).child(`${machineLabel(record.machine)} (${record.machine??'local'}) · ${record.terminal}`))
      .child(div().text_size(12).text_color('#a4bbb8').child(record.cwd))
      .child(button(`restore-${record.terminal}`,this.busy?'Creating shell…':record.restoreName?'Retry new shell':'Create new shell',(_e,c)=>c.spawn(a=>this.restoreShell(record,a)),true)));
    return v_flex().size_full().p(24).gap(16).bg('#192f35').text_color('#dce6e3')
      .child(div().text_size(22).font_semibold().child('Restore layout'))
      .child(div().text_size(12).text_color('#a4bbb8').child('Create missing personal shells in their recorded directories and tabs. Existing processes stay running. Previous commands and agent conversations are not resumed.'))
      .when(!missing.length,el=>el.child(div().text_size(12).child('No missing personal shells on connected machines.')))
      .child(list)
      .child(h_flex().justify_end().child(button('close-restore','Done',()=>closeOverlay(props().overlay))));
  }

  firstmates() {
    return fleet(terminals(),machines(),config().coordinators)
      .flatMap(m=>m.coordinators).filter(c=>c.role==='firstmate');
  }

  openFirstmate() {
    const choices=this.firstmates();
    if(choices.length===1) this.select(choices[0].session);
    else openOverlay({mod:'one-piece',props:{view:'firstmates'},kind:'dialog',width:480,height:340});
  }

  firstmatesView() {
    const choices=this.firstmates();
    const list=v_flex().flex_1().min_h(0).gap(10).overflow_y_scrollbar();
    for(const choice of choices) {
      const machine=machineOf(choice.terminal);
      list.child(button(`choose-${choice.terminal}`,`${label(choice.session)} · ${machineLabel(machine)} (${machine??'local'})`,()=>{
        this.select(choice.session);
        closeOverlay(props().overlay);
      }));
    }
    return v_flex().size_full().p(24).gap(16).bg('#192f35').text_color('#dce6e3')
      .child(div().text_size(22).font_semibold().child('Choose your firstmate'))
      .child(div().text_size(12).text_color('#a4bbb8').child(choices.length?'Choose the coordinator you want to talk to.':'No registered firstmate is online. Check its machine or link a running session in Fleet setup.'))
      .child(list)
      .child(h_flex().justify_end().child(button('cancel-firstmates','Cancel',()=>closeOverlay(props().overlay))));
  }

  select(terminal) {
    if(!machines().some(m=>m.name===machineOf(terminal.address)&&m.layout==='ready')) return;
    const current=terminals().find(t=>t.address===terminal.address&&t.created_ms===terminal.created_ms&&t.state==='live');
    if(!current?.space||!current.tab) { notifyError(new Error('This session has no workspace. Open it in Herdr before registering it.')); return; }
    run('space.select',{id:current.space});
    run('tab.select',{id:current.tab});
    run('pane.focus',{terminal:current.address});
  }

  async openIndependent(terminal,cx) {
    const current=fleet(terminals(),machines(),config().coordinators).flatMap(m=>m.independent)
      .find(t=>identity(t)===identity(terminal));
    if(!current) {notifyError(new Error('This independent session is no longer available.'));return;}
    if(current.space) {this.select(current);return;}
    try {
      const rawSpace=`op-independent-${current.address.split('/').pop()}-${current.created_ms}`;
      await checked(['label',current.address,`herdr.space=${rawSpace}`,`herdr.tab=${rawSpace}`]);
      for(let attempt=0;attempt<40;attempt++) {
        const placed=terminals().find(t=>identity(t)===identity(current)&&t.space&&t.tab);
        if(placed) {this.select(placed);return;}
        await cx.sleep(100);
      }
      throw new Error('Herdr has not opened the independent workspace. Try again after it reconnects.');
    } catch(error) {notifyError(error);}
  }

  async inspect(terminal,cx) {
    if(this.busy) return;
    const target={terminal:terminal.address,created:terminal.created_ms};
    if(!inspectionTarget(terminals(),machines(),config().coordinators,target)) return;
    this.busy=true;cx.notify();
    let temporary;
    try {
      const key=identity(terminal);
      if(panes().some(p=>p.terminal===terminal.address)||terminal.keep) await this.park(terminal,cx);
      this.checkContext(cx);
      if(!inspectionTarget(terminals(),machines(),config().coordinators,target)) throw new Error('The session became unavailable while opening inspection.');
      const existing=config().inspections[key];
      const existingSpace=existing&&spaces().find(s=>s.id===existing.space);
      const existingTab=existingSpace?.tabs.find(t=>t.id===existing.tab);
      const existingPane=existingTab&&panes().find(p=>p.pane===existing.pane&&p.tab===existing.tab&&p.mod==='one-piece');
      if(existingPane) {
        run('space.select',{id:existing.space});run('tab.select',{id:existing.tab});
        run('pane.focus',{pane:existingPane.pane});
        return true;
      }
      const machine=machineOf(terminal.address);
      const rawSpace=`op-${terminal.address.split('/').pop()}-${terminal.created_ms}-${Date.now()}`;
      const fullSpace=existingSpace?.id??(machine?`${machine}/${rawSpace}`:rawSpace);
      if(!existingSpace) {
        // Herdr cannot create an empty space; only this disposable shell is ever adopted.
        temporary={name:`op-view-${Date.now()}-${Math.floor(Math.random()*1000000)}`,machine};
        this.activePlaceholder=placeholderKey(temporary);
        activePlaceholders.add(this.activePlaceholder);
        save({placeholders:[...(config().placeholders??[]),temporary]});
        const args=['run','--json','--bg','--no-parent','--no-notify','--name',temporary.name,'--label',`one-piece.placeholder=${temporary.name}`,'--label',`herdr.space=${rawSpace}`,'--label',`herdr.tab=${rawSpace}`];
        if(machine) args.push('--on',machine);
        const launched=JSON.parse((await checked(args)).stdout);
        if(typeof launched.address!=='string'||launched.address===terminal.address||machineOf(launched.address)!==machine) throw new Error('Herdr returned an invalid inspection placeholder.');
        for(let attempt=0;attempt<40&&!spaces().some(s=>s.id===fullSpace);attempt++) await cx.sleep(100);
        if(!spaces().some(s=>s.id===fullSpace)) throw new Error('Herdr has not created the inspection workspace. Try again after it reconnects.');
      }
      this.checkContext(cx);
      const before=new Set(panes().map(p=>p.pane));
      const anchor=existingTab&&panes().find(p=>p.tab===existing.tab);
      if(anchor) run('pane.split',{pane:anchor.pane,direction:'right',mod:'one-piece',props:{view:'inspect',target}});
      else run('tab.new',{space:fullSpace,name:`Inspect ${label(terminal)}`,mod:'one-piece',props:{view:'inspect',target}});
      let pane;
      for(let attempt=0;attempt<40;attempt++) {
        const tabs=spaces().find(s=>s.id===fullSpace)?.tabs??[];
        pane=panes().find(p=>!before.has(p.pane)&&p.mod==='one-piece'&&(anchor?p.tab===anchor.tab:tabs.some(t=>t.id===p.tab)));
        if(pane) break;
        await cx.sleep(100);
      }
      if(!pane) throw new Error('Herdr did not create the inspection view. The worker process is still running.');
      this.checkContext(cx);
      if(!inspectionTarget(terminals(),machines(),config().coordinators,target)) throw new Error('The session became unavailable while opening inspection.');
      save({inspections:{...config().inspections,[key]:{space:fullSpace,tab:pane.tab,pane:pane.pane}}});
      if(!existingSpace) run('space.rename',{id:fullSpace,name:label(terminal)});
      run('space.select',{id:fullSpace});run('tab.select',{id:pane.tab});
      run('pane.focus',{pane:pane.pane});
      return true;
    } catch(error) { notifyError(error); }
    finally {
      if(temporary) {
        try {await this.cleanupPlaceholder(temporary);}
        catch(error) {notifyError(new Error(`Temporary shell cleanup pending. Use Retry cleanup in the fleet sidebar. ${error.message}`));}
        finally {activePlaceholders.delete(placeholderKey(temporary));this.activePlaceholder=null;}
      }
      this.busy=false;if(!this.closed) cx.notify();
    }
  }

  checkContext(cx) {
    if(this.closed) throw new Error('Inspection cancelled.');
    cx.notify();
  }

  close() {
    this.closed=true;
    activePlaceholders.delete(this.activePlaceholder);
  }

  async cleanupPlaceholder(record) {
    const address=record.machine?`${record.machine}/${record.name}`:record.name;
    const result=await hc(['get',address]);
    if(result.code!==0) {
      let kind;
      try {kind=JSON.parse(result.stderr).error?.kind;} catch {}
      if(kind!=='not_found') throw new Error(result.stderr||'Could not check temporary shell.');
    } else {
      const terminal=JSON.parse(result.stdout);
      if(terminal.name!==record.name||terminal.labels?.['one-piece.placeholder']!==record.name||typeof terminal.address!=='string'||machineOf(terminal.address)!==record.machine) throw new Error('Temporary shell ownership could not be verified. No process was ended.');
      if(terminal.state==='live') await checked(['kill',address]);
    }
    cleanedPlaceholders.add(placeholderKey(record));
    save({placeholders:(config().placeholders??[]).filter(r=>r.name!==record.name||r.machine!==record.machine)});
  }

  rememberPlaceholders() {
    const records=config().placeholders??[];
    const live=terminals().filter(t=>t.state==='live'&&/^op-view-\d+-\d+$/.test(t.name??'')&&t.labels?.['one-piece.placeholder']===t.name)
      .map(t=>({name:t.name,machine:machineOf(t.address)}));
    for(const key of cleanedPlaceholders) if(!live.some(t=>placeholderKey(t)===key)) cleanedPlaceholders.delete(key);
    const found=live.filter(t=>!cleanedPlaceholders.has(placeholderKey(t)))
      .filter(t=>!records.some(r=>r.name===t.name&&r.machine===t.machine));
    if(found.length) save({placeholders:[...records,...found]});
  }

  async cleanupPlaceholders(cx) {
    if(this.cleaning) return;
    this.cleaning=true;cx.notify();
    try {
      for(const record of config().placeholders??[]) {
        if(activePlaceholders.has(placeholderKey(record))) continue;
        try {await this.cleanupPlaceholder(record);}
        catch(error) {notifyError(error);}
      }
    } finally {this.cleaning=false;cx.notify();}
  }

  async park(terminal,cx) {
    run('terminal.park',{terminal:terminal.address});
    for(let attempt=0;attempt<40;attempt++) {
      const current=terminals().find(t=>t.address===terminal.address&&t.created_ms===terminal.created_ms);
      if(!current||current.state!=='live') throw new Error('The session ended while opening inspection.');
      if(!panes().some(p=>p.terminal===terminal.address)&&!current.labels?.['herdr.space']&&!current.keep) return;
      await cx.sleep(100);
    }
    throw new Error('Herdr has not removed the writable pane. Inspection was not selected.');
  }

  refresh(cx) {
    const target=inspectionTarget(terminals(),machines(),config().coordinators,props().target);
    if(!target) {
      this.editor.set_value('This session is unavailable. No cached output is shown.');
      this.error='';this.updated=null;cx.notify();return;
    }
    if(this.reading) return;
    this.reading=true;
    cx.spawn(async c=>{
      try {
        const result=await checked(['read','--json','--lines','2000',target.address]);
        if(!inspectionTarget(terminals(),machines(),config().coordinators,props().target)) {this.refresh(c);return;}
        const output=JSON.parse(result.stdout);
        if(typeof output.text!=='string') throw new Error('Herdr returned no readable terminal output.');
        if(output.text!==this.editor.value()) this.editor.set_value(output.text);
        this.error='';this.updated=Date.now();
      } catch(error) {this.error=String(error.message??error);this.updated=null;this.editor.set_value('Output unavailable. '+this.error);}
      finally {this.reading=false;c.notify();}
    });
  }

  row(terminal,character,subtitle,action,selected=false) {
    const t=theme();
    return h_flex().id(`session-${terminal.address}`).px(10).py(6).gap(8).rounded(8).bg(selected?'#29454c':'#16292f').hover(s=>s.bg('#243e45')).cursor_pointer().on_click(action)
      .child(art(character,terminal.status,44))
      .child(v_flex().flex_1().min_w(0).gap(3).child(div().truncate().text_size(13).font_semibold().text_color(t.foreground).child(label(terminal)))
        .child(div().truncate().text_size(10).text_color(terminal.status==='blocked'?'#edc478':'#a4b8b7').child(subtitle)))
      .when(terminal.status==='blocked',el=>el.child(div().text_color('#edc478').child('!')));
  }

  sidebar(cx) {
    this.rememberShells();
    this.rememberPlaceholders();
    const cfg=config();
    const world=fleet(terminals(),machines(),cfg.coordinators);
    const workers=world.flatMap(m=>[...m.unassigned,...m.coordinators.flatMap(c=>c.workers)]);
    const characters=assignCharacters(workers,cfg.characters);
    if(Object.keys(characters).length!==Object.keys(cfg.characters).length) save({characters});
    const selected=focused();
    const content=v_flex().flex_1().min_h(0).overflow_y_scrollbar().gap(20).px(12).py(12);
    for(const machine of world) {
      const block=v_flex().gap(7).child(h_flex().items_center().justify_between()
        .child(v_flex().gap(3).child(div().text_size(13).font_semibold().text_color('#e4eeea').child(machineLabel(machine.machine)))
          .child(div().text_size(10).text_color('#8fa8a9').child(machine.machine??'local')))
        .child(button(`machine-settings-${machine.machine}`,'···',()=>this.setup(machine.machine))));
      if(machine.state!=='ready') {
        block.child(div().p(12).rounded(8).bg('#243238').text_size(12).text_color('#b2bfbe').child(machine.state==='loading'?'Connecting…':'Machine unavailable'));
        content.child(block);continue;
      }
      for(const coordinator of machine.coordinators) {
        const collapsed=this.collapsed[coordinator.terminal];
        const ship=h_flex().id(`ship-${coordinator.terminal}`).gap(6).items_center().cursor_pointer().rounded(8).hover(s=>s.bg('#1c343b'))
          .on_click((_e,c)=>{this.collapsed[coordinator.terminal]=!collapsed;c.notify();})
          .child(art('sunny','idle',84)).child(v_flex().flex_1().gap(4)
            .child(div().text_size(11).text_color('#e8bd70').font_semibold().child('THOUSAND SUNNY'))
            .child(div().text_size(10).text_color('#9eb4b3').child(`${coordinator.role} · ${coordinator.workers.length} workers`)))
          .child(div().text_color('#a0b7b8').child(collapsed?'›':'⌄'));
        block.child(ship);
        if(!collapsed) {
          block.child(this.row(coordinator.session,'luffy',`${coordinator.role} · ${coordinator.role==='firstmate'?'Pinned first':'Inspection only'}`,(_e,c)=>coordinator.role==='firstmate'?this.select(coordinator.session):c.spawn(a=>this.inspect(coordinator.session,a)),selected?.terminal===coordinator.terminal));
          for(const worker of coordinator.workers) {
            const character=characters[identity(worker)];
            block.child(this.row(worker,character.art,`${stateLabel(worker)}${character.number?` · Pirate ${character.number}`:''}`,(_e,c)=>c.spawn(a=>this.inspect(worker,a)),selected?.space===cfg.inspections[identity(worker)]?.space));
          }
        }
      }
      if(machine.unassigned.length) block.child(div().mt(8).text_size(10).text_color('#e8bd70').child('WORKERS · LINK FIRSTMATE IN SETUP'));
      for(const worker of machine.unassigned) block.child(this.row(worker,characters[identity(worker)].art,`${stateLabel(worker)} · Inspection only`,(_e,c)=>c.spawn(a=>this.inspect(worker,a))));
      const coordinatorSpaces=new Set(machine.coordinators.map(c=>c.session.space??cfg.inspections[identity(c.session)]?.space));
      const independentSpaces=spaces().filter(s=>s.machine===machine.machine&&!coordinatorSpaces.has(s.id)&&machine.independent.some(t=>t.space===s.id));
      if(independentSpaces.length) block.child(div().mt(8).text_size(10).text_color('#8fa8a9').child('UNSUPERVISED'));
      for(const space of independentSpaces) block.child(h_flex().id(`space-${space.id}`).px(12).py(10).rounded(7).bg(space.active?'#29454c':'#182e34').hover(s=>s.bg('#29454c')).cursor_pointer().on_click(()=>run('space.select',{id:space.id})).child(div().flex_1().truncate().text_color('#c3d5d0').text_size(12).child(space.name)));
      for(const missing of machine.missing) block.child(div().text_size(11).text_color('#e8bd70').child(`${missing.role} disconnected · ${missing.terminal}`));
      if(!machine.coordinators.length&&!machine.unassigned.length&&!independentSpaces.length) block.child(div().py(10).text_color('#92acab').text_size(12).child('No sessions on this machine.'));
      content.child(block);
    }
    const blockers=attention(world);
    const alerts=v_flex().gap(6).max_h(180).overflow_y_scrollbar();
    for(const item of blockers) {
      const terminal=item.terminal;
      alerts.child(v_flex().id(`attention-${terminal.address}`).p(9).gap(3).rounded(6).bg('#28372f').cursor_pointer().hover(s=>s.bg('#364638'))
        .on_click((_e,c)=>item.inspect?c.spawn(a=>this.inspect(terminal,a)):item.kind==='Independent'?c.spawn(a=>this.openIndependent(terminal,a)):this.select(terminal))
        .child(div().truncate().text_size(11).text_color('#edc478').child(`${item.kind} · ${label(terminal)}`))
        .child(div().text_size(10).text_color('#afc0b5').child(`${machineOf(terminal.address)??'local'} · ${item.inspect?'Inspect':'Open session'}`)));
    }
    return v_flex().id('fleet-sidebar').track_focus(this.handle).size_full().bg('#14272d').text_color('#dce6e3')
      .child(h_flex().h(64).px(20).gap(10).items_center().child(art('flag','idle',28)).child(v_flex().gap(4).child(div().text_size(14).font_semibold().child('GRAND FLEET')).child(div().text_size(10).text_color('#91acab').child('A place for every session'))))
      .child(content)
      .child(v_flex().p(14).gap(10).border_t(1).border_color('#30474c')
        .when(Boolean(cfg.placeholders?.length),el=>el.child(button('retry-cleanup',this.cleaning?'Cleaning temporary shells…':`Retry cleanup · ${cfg.placeholders.length} temporary shells`,(_e,c)=>c.spawn(a=>this.cleanupPlaceholders(a)))))
        .child(div().text_size(11).text_color(blockers.length?'#e8bd70':'#94b3aa').child(blockers.length?`${blockers.length} ${blockers.length===1?'session needs':'sessions need'} attention`:'No reported blockers'))
        .when(blockers.length>0,el=>el.child(alerts))
        .child(h_flex().gap(8).child(button('setup','Set up fleet',()=>this.setup())).child(button('motion',cfg.paused?'Play motion':'Pause motion',()=>save({paused:!cfg.paused})))));
  }

  inspectView() {
    const target=inspectionTarget(terminals(),machines(),config().coordinators,props().target);
    const coordinator=target&&config().coordinators.find(r=>matches(target,r));
    return v_flex().id('inspection').on_size_change((_size,c)=>c.notify()).size_full().min_h(0).bg('#142329').p(18).gap(12)
      .child(h_flex().items_center().gap(12).child(art(coordinator?'luffy':config().characters[target?identity(target):'']?.art??'pirate',target?.status,56))
        .child(v_flex().flex_1().gap(5).child(div().text_size(18).font_semibold().text_color('#e0ece6').child(target?label(target):'Session unavailable'))
          .child(div().text_size(11).text_color('#e8bd70').child(`INSPECTION ONLY · ${target?stateLabel(target):'Disconnected'}`)))
        .child(button('back-firstmate','Back to firstmate',()=>this.openFirstmate(),true)))
      .child(div().text_size(11).text_color('#9eb7b4').child(target?'Live terminal text · selection and copy enabled · direct input disabled':'Terminal output unavailable · direct input disabled'))
      .child(Editor.new(this.editor).flex_1().min_h(0).size_full())
      .child(div().text_size(10).text_color(this.error?'#edc478':'#8fa8a9').child(this.error||(!target?'Waiting for the session to reconnect':this.updated?'Updates every second · up to 2,000 history lines':'Waiting for output')));
  }

  async linkCoordinator(selected,home,role,overlay,cx) {
    if(this.linking) return;
    this.linking=true;
    let completed=false;
    const machine=selected&&machineOf(selected.address);
    const sameHome=r=>r.home===home&&machineOf(r.terminal)===machine;
    const validate=()=>{
      this.checkContext(cx);
      const live=terminals();
      const terminal=selected&&live.find(t=>identity(t)===identity(selected)&&t.state==='live');
      if(!terminal||!home||!Number.isFinite(terminal.created_ms)||!machines().some(m=>m.name===machine&&m.layout==='ready')) throw new Error('Select a live session and enter its firstmate home label.');
      if(config().coordinators.some(r=>r.terminal!==terminal.address&&sameHome(r)&&live.some(t=>matches(t,r)))) throw new Error('This home is already linked to another coordinator.');
      return terminal;
    };
    try {
      let terminal=validate();
      if(role==='firstmate') {
        if(isWorker(terminal)) throw new Error('A supervised worker cannot be linked as firstmate.');
        if(!terminal.space||!terminal.tab||!panes().some(p=>p.terminal===terminal.address&&p.tab===terminal.tab)) throw new Error('This session has no writable workspace. Open it in Herdr before linking as firstmate.');
      }
      if(role==='secondmate') {
        await this.park(terminal,cx);
        terminal=validate();
        if(panes().some(p=>p.terminal===terminal.address)||terminal.keep||terminal.labels?.['herdr.space']) throw new Error('The writable pane returned. Retry linking the secondmate.');
      }
      save({coordinators:[...config().coordinators.filter(r=>r.terminal!==terminal.address&&!sameHome(r)),{terminal:terminal.address,created:terminal.created_ms,home,role}]});
      if(role==='secondmate'&&!await this.inspect(terminal,cx)) {this.error='Inspection could not open. Retry linking the parked secondmate.';return;}
      this.checkContext(cx);
      completed=true;
      closeOverlay(overlay);
    } catch(error) {this.error=String(error.message??error);}
    finally {
      this.linking=false;
      if(!completed&&!this.closed) {
        try {cx.notify();} catch {}
      }
    }
  }

  setupView(cx) {
    const machine=props().machine??null;
    const available=terminals().filter(t=>machineOf(t.address)===machine&&t.state==='live'&&(this.role==='secondmate'||!isWorker(t))&&(t.space||config().inspections[identity(t)]||config().coordinators.some(r=>r.role==='secondmate'&&matches(t,r))));
    const content=v_flex().size_full().bg('#192f35').p(24).gap(14).text_color('#dce6e3');
    content.child(div().text_size(22).font_semibold().child('Make this fleet yours'));
    content.child(div().text_size(12).text_color('#a4bbb8').child(`Machine: ${machine??'local'} · identify an existing coordinator session explicitly.`));
    content.child(h_flex().gap(10).items_center().child(Input.new(this.aliasInput).flex_1()).child(button('save-alias','Save island name',()=>save({aliases:{...config().aliases,[machine??'local']:this.aliasInput.value().trim()||machine||'local'}}))));
    content.child(h_flex().gap(10).child(button('role-firstmate','Firstmate',(_e,c)=>{this.role='firstmate';this.selected=null;c.notify();},this.role==='firstmate'))
      .child(button('role-secondmate','Secondmate · inspection only',(_e,c)=>{this.role='secondmate';this.selected=null;c.notify();},this.role==='secondmate')));
    const list=v_flex().flex_1().min_h(0).gap(5).overflow_y_scrollbar();
    for(const terminal of available) list.child(button(`register-${terminal.address}`,`${label(terminal)} · ${terminal.address}${this.selected===terminal.address?' · Selected':''}`,(_e,c)=>{this.selected=terminal.address;c.notify();},this.selected===terminal.address));
    content.child(list);
    const homes=[...new Set(terminals().filter(t=>machineOf(t.address)===machine&&isWorker(t)).map(t=>t.labels['firstmate.home']))];
    content.child(div().text_size(11).text_color('#a4bbb8').child(homes.length?`Worker home labels: ${homes.join(', ')}`:'Enter the home label used by firstmate’s hc adapter.'));
    content.child(Input.new(this.homeInput).h(34));
    content.child(div().text_size(11).text_color('#e8bd70').child(this.error||'Linking identifies an existing session. It does not launch firstmate or delegate work.'));
    content.child(h_flex().gap(10).justify_end().child(button('cancel-setup','Cancel',()=>closeOverlay(props().overlay)))
      .child(button('save-firstmate',`Link ${this.role}`,(_e,c)=>{
        const selected=available.find(t=>t.address===this.selected);
        const home=this.homeInput.value().trim();
        const role=this.role,overlay=props().overlay;
        return c.spawn(a=>this.linkCoordinator(selected,home,role,overlay,a));
      },true)));
    return content;
  }

  header() {
    const space=spaces().find(s=>s.active);
    const coordinator=config().coordinators.find(r=>terminals().some(t=>matches(t,r)&&t.space===space?.id));
    const current=panes().find(p=>p.focused);
    const zoom=zoomTarget(panes(),focused()?.tab);
    const inspection=Object.entries(config().inspections).find(([_key,i])=>i.space===space?.id);
    const inspected=Boolean(inspection);
    const secondmate=inspection&&config().coordinators.find(r=>r.role==='secondmate'&&`${r.terminal}:${r.created}`===inspection[0]);
    const canAddTerminal=()=>{
      const pane=panes().find(p=>p.pane===current?.pane);
      const owner=pane&&spaces().find(s=>s.tabs.some(t=>t.id===pane.tab));
      return Boolean(pane&&paneReady(pane.pane)&&this.canAddTab(owner?.id));
    };
    return h_flex().size_full().px(18).gap(12).items_center().bg('#192e34')
      .child(div().flex_1().truncate().font_semibold().text_size(14).text_color('#dce6e3').child(space?.name??'Welcome aboard'))
      .child(div().text_size(11).text_color('#a2bab7').child(`${coordinator?'Coordinator workspace':secondmate?'Secondmate workspace':inspected?'Worker inspection':'Unsupervised'} · ${space?.machine??'local'}`))
      .when(canAddTerminal(),el=>el.child(button('new-terminal','+ Your terminal',()=>canAddTerminal()&&run('pane.split',{direction:panes().filter(p=>p.tab===current.tab).length>1?'down':'right',pane:current.pane}))))
      .when(Boolean(zoom&&paneReady(zoom.pane)),el=>el.child(button('zoom-grid',zoom.zoomed?'Restore grid':'Focus pane',()=>paneReady(zoom.pane)&&run('pane.zoom',{pane:zoom.pane}))))
      .child(button('restore-layout','Restore layout',()=>this.openRestore()))
      .child(button('setup-header','Fleet setup',()=>this.setup()));
  }

  canAddTab(spaceId) {
    const space=spaces().find(s=>s.id===spaceId);
    if(!space||!machines().some(m=>m.name===space.machine&&m.layout==='ready')) return false;
    if(terminals().some(t=>t.space===spaceId&&isWorker(t)&&!config().coordinators.some(r=>matches(t,r)))) return false;
    const inspections=Object.entries(config().inspections).filter(([_key,i])=>i.space===spaceId);
    return inspections.every(([key])=>config().coordinators.some(r=>r.role==='secondmate'&&`${r.terminal}:${r.created}`===key));
  }

  tabsView() {
    const space=spaces().find(s=>s.active);
    const row=h_flex().size_full().px(8).gap(6).items_center().overflow_x_scrollbar().bg('#192e34');
    if(!space) return row;
    for(const tab of space.tabs) row.child(h_flex().gap(3).flex_none()
      .child(button(`select-tab-${tab.id}`,tab.name||'Terminal',()=>run('tab.select',{id:tab.id}),tab.active))
      .child(button(`rename-tab-${tab.id}`,'Rename',()=>openOverlay({mod:'one-piece',kind:'dialog',width:420,height:200,props:{view:'rename-tab',tab:tab.id,space:space.id,name:tab.name}})))
      .child(button(`close-tab-${tab.id}`,'Close',()=>this.requestClose('tab',tab.id))));
    if(this.canAddTab(space.id)) row.child(button('add-tab','+ Your terminal',()=>{if(this.canAddTab(space.id)) run('tab.new',{space:space.id});}));
    return row;
  }

  renameTabView() {
    return v_flex().size_full().p(20).gap(12).bg('#192f35').text_color('#dce6e3')
      .child(div().child('Rename tab')).child(Input.new(this.tabName).h(34))
      .child(h_flex().gap(8).justify_end()
        .child(button('cancel-rename','Cancel',()=>closeOverlay(props().overlay)))
        .child(button('save-rename','Save',()=>{
          const p=props(),space=spaces().find(s=>s.id===p.space&&s.tabs.some(t=>t.id===p.tab));
          if(!space||!machines().some(m=>m.name===space.machine&&m.layout==='ready')) return;
          run('tab.rename',{id:p.tab,name:this.tabName.value().trim()});closeOverlay(p.overlay);
        },true)));
  }

  closeSnapshot(kind,id) {
    const all=panes();
    const pane=kind==='pane'&&all.find(p=>p.pane===id);
    const tab=kind==='tab'?id:pane?.tab;
    const space=spaces().find(s=>s.tabs.some(t=>t.id===tab));
    if(!space||!machines().some(m=>m.name===space.machine&&m.layout==='ready')) throw new Error('The close target changed or its machine is unavailable. Nothing was closed.');
    const affected=all.filter(p=>kind==='tab'?p.tab===tab:p.pane===id);
    if(!affected.length) throw new Error('The close target is no longer available. Nothing was closed.');
    const live=terminals();
    const records=affected.map(p=>{
      const terminal=p.terminal&&live.find(t=>t.address===p.terminal&&['live','finished'].includes(t.state));
      if(p.terminal&&(!terminal||!Number.isFinite(terminal.created_ms)||!machines().some(m=>m.name===machineOf(terminal.address)&&m.layout==='ready'))) throw new Error('A terminal changed or became unavailable. Nothing was closed.');
      if(terminal?.state==='live'&&(isWorker(terminal)||config().coordinators.some(r=>r.role==='secondmate'&&matches(terminal,r)))) throw new Error('Open this supervised session in inspection before closing its view. Nothing was closed.');
      return {pane:p.pane,mod:p.mod??null,terminal:terminal?.address??null,created:terminal?.created_ms??null,state:terminal?.state??null};
    }).sort((a,b)=>a.pane.localeCompare(b.pane));
    const preserved=Object.entries(config().inspections).filter(([_key,i])=>i.tab===tab&&affected.some(p=>p.mod==='one-piece'&&(!i.pane||p.pane===i.pane)))
      .map(([key])=>{
        const terminal=live.find(t=>identity(t)===key);
        if(!terminal||!['live','finished'].includes(terminal.state)||!machines().some(m=>m.name===machineOf(terminal.address)&&m.layout==='ready')||all.some(p=>p.terminal===terminal.address)||terminal.keep||terminal.labels?.['herdr.space']) return null;
        return {terminal:terminal.address,created:terminal.created_ms,state:terminal.state};
      }).filter(Boolean).sort((a,b)=>a.terminal.localeCompare(b.terminal));
    return {kind,id,tab,space:space.id,machine:space.machine,panes:records,preserved};
  }

  requestClose(kind,id) {
    try {
      const snapshot=this.closeSnapshot(kind,id);
      openOverlay({mod:'one-piece',kind:'dialog',width:580,height:380,props:{view:'close-scope',snapshot}});
    } catch(error) {notifyError(error);}
  }

  closeScope() {
    const p=props(),snapshot=p.snapshot;
    try {
      // Inspection processes are informational; only actual panes authorize closure.
      const {preserved:_previous,...target}=snapshot;
      const {preserved:_current,...current}=this.closeSnapshot(snapshot.kind,snapshot.id);
      if(JSON.stringify(current)!==JSON.stringify(target)) throw new Error('The close target changed. Review it again. Nothing was closed.');
      if(snapshot.kind==='tab') run('tab.close',{id:snapshot.id,confirmed:true});
      else if(panes().filter(p=>p.tab===snapshot.tab).length===1) run('tab.close',{id:snapshot.tab,confirmed:true});
      else run('pane.close',{pane:snapshot.id});
      closeOverlay(p.overlay);
    } catch(error) {notifyError(error);}
  }

  closeScopeView() {
    const snapshot=props().snapshot;
    const processes=snapshot.panes.filter(p=>p.terminal&&p.state==='live');
    const lines=snapshot.panes.filter(p=>p.terminal).map(p=>`${p.terminal} on ${machineOf(p.terminal)??'local'}: ${p.state==='finished'?'already ended; only its view closes.':'process ends.'}`);
    for(const pane of snapshot.panes.filter(p=>p.mod&&!p.terminal)) lines.push(`Pane ${pane.pane}: only its view closes; no terminal targeted.`);
    let preserved=[];
    try {preserved=this.closeSnapshot(snapshot.kind,snapshot.id).preserved;} catch {}
    for(const p of preserved) lines.push(`${p.terminal} on ${machineOf(p.terminal)??'local'}: ${p.state==='finished'?'already ended':'parked inspection process preserved'}; only its view closes.`);
    if(!processes.length) lines.push('No terminal process ends.');
    lines.push('Firstmate obligations remain unchanged.');
    return v_flex().size_full().p(24).gap(16).bg('#192f35').text_color('#dce6e3')
      .child(div().text_size(20).child(`Close ${snapshot.kind}?`))
      .child(div().flex_1().min_h(0).overflow_y_scrollbar().text_size(12).child(lines.join('\n')))
      .child(h_flex().gap(10).justify_end()
        .child(button('cancel-close','Cancel',()=>closeOverlay(props().overlay)))
        .child(button('confirm-close',processes.length?'End processes and close':'Close view',()=>this.closeScope(),true)));
  }

  paneHeader() {
    const pane=panes().find(p=>p.pane===props().pane);
    if(!pane) return div();
    const terminal=terminals().find(t=>t.address===pane.terminal);
    const coordinator=terminal&&config().coordinators.find(r=>matches(terminal,r));
    const supervisor=terminal&&isWorker(terminal);
    return h_flex().size_full().px(10).gap(8).items_center().bg('#1b3339').text_color('#dbe8e2')
      .when(Boolean(coordinator),el=>el.child(art('luffy',terminal.status,30)))
      .child(div().flex_1().truncate().text_size(11).child(coordinator?`Luffy · ${label(terminal)}`:supervisor?`${label(terminal)} · open inspection from the fleet`:pane.mod?'Inspection only':`${terminal?label(terminal):pane.title} · ${(config().shells??[]).some(r=>r.terminal===terminal?.address&&r.created===terminal?.created_ms&&r.newProcess)?'New shell':'Your terminal'}`))
      .when(paneReady(pane.pane),el=>el.child(button(`zoom-${pane.pane}`,pane.zoomed?'Grid':'Focus',()=>paneReady(pane.pane)&&run('pane.zoom',{pane:pane.pane}))))
      .when(Boolean(paneReady(pane.pane)&&terminal&&!coordinator&&!supervisor),el=>el.child(button(`close-${pane.pane}`,'Close',()=>this.requestClose('pane',pane.pane))));
  }

  render(cx) {
    switch(props()?.view) {
      case 'tabs':return this.tabsView();
      case 'rename-tab':return this.renameTabView();
      case 'close-scope':return this.closeScopeView();
      case 'header':return this.header();
      case 'pane':return this.paneHeader();
      case 'inspect':return this.inspectView();
      case 'setup':return this.setupView(cx);
      case 'firstmates':return this.firstmatesView();
      case 'restore':return this.restoreView();
      default:return this.sidebar(cx);
    }
  }
}
