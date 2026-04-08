// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics4.js — AI Intelligence (Extreme Analytics)
// Simulador, AI toggles, importar eventos, what-if, recomendaciones, reportes
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, todayISO, formatDate, uid } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { tr, trFree } from './langs.js';

let _c, _u, _datos={}, _sub='command';
let _ai={local:{enabled:true,label:'Análisis local',free:true,note:'Heurísticas + estadísticas'},anthropic:{enabled:false,label:'Anthropic Claude',free:false,note:'Requiere API key',key:''}};
let _sim={params:{throughputDelta:0,hallClosed:'',noShowPct:0,extraOps:0,hoursChange:0,weatherImpact:0,redistributeFrom:'',redistributeTo:''},history:[]};
let _importedEvents=[], _recs=[], _lastReport=null;
let _alertsCfg={stuckHours:4,noShowPct:10,throughputMin:5,occupancyMax:85,retrasoMax:30};
let _alerts=[];

export function render(ct, us) { _c=ct; _u=us; _loadData(); return ()=>{}; }

const T=()=>getThemeColors(getCurrentTheme());
const esc=safeHtml;
const _pct=(a,b)=>b?Math.round(a/b*100):0;
const _avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const _dayKey=(ts)=>(ts||'').slice(0,10);
const _hourKey=(ts)=>(ts||'').slice(11,13);
const _minToH=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?String(Math.round(m%60)).padStart(2,'0')+'m':''}`:`${Math.round(m)}m`;
const _permanencia=(i)=>{if(!i.entrada||!i.salida)return null;return(new Date(i.salida)-new Date(i.entrada))/60000;};
const _countBy=(arr,key)=>{const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
const _diffMins=(p,r)=>{if(!p||!r)return null;try{const tp=new Date('1970-01-01T'+(p.length>5?p.slice(-5):p));const tr2=new Date('1970-01-01T'+(r.length>5?r.slice(-5):r));return Math.round((tr2-tp)/60000);}catch(e){return null;}};
const _card=(title,body,t,color)=>`<div style="background:${t.card};border:1px solid ${t.border};border-radius:8px;padding:10px;box-shadow:0 1px 3px rgba(0,0,0,.06);${color?'border-top:3px solid '+color:''}">${title?`<div style="font-weight:800;font-size:11px;margin-bottom:6px;color:${t.t3}">${title}</div>`:''}${body}</div>`;
const _kpi=(label,value,sub,color,t)=>`<div style="text-align:center;padding:8px"><div style="font-size:22px;font-weight:900;color:${color||t.acc};line-height:1.1">${value}</div><div style="font-size:9px;font-weight:700;color:${t.t3};margin-top:2px">${label}</div>${sub?`<div style="font-size:8px;color:${t.t3};margin-top:1px">${sub}</div>`:''}</div>`;

async function _loadData(){
  try{
    const{fsGetAll}=await import('./firestore.js');
    const r=_u.recinto||'';
    const[ref,ing,ag,cond,mov,emp,recintos]=await Promise.all([
      fsGetAll('ingresos').then(d=>r?d.filter(x=>x.recinto===r):d),
      fsGetAll('accesos').then(d=>r?d.filter(x=>x.recinto===r):d),
      fsGetAll('agenda').then(d=>r?d.filter(x=>x.recinto===r):d),
      fsGetAll('conductores').then(d=>r?d.filter(x=>x.recinto===r):d),
      fsGetAll('movimientos').catch(()=>[]),
      fsGetAll('empresas').catch(()=>[]),
      fsGetAll('recintos').catch(()=>[]),
    ]);
    _datos={ref,ing,ag,cond,mov,emp,recintos};
    _paint();
  }catch(e){console.warn('analytics4 load:',e);_datos={};_paint();}
}

function _snap(){
  const all=[...(_datos.ref||[]),...(_datos.ing||[])];
  const ag=[...(_datos.ag||[])];
  const today=todayISO();
  const nowMs=Date.now();
  const recintoData=(_datos.recintos||[]).find(r2=>r2.nombre===_u.recinto)||{};
  const halls=(recintoData.halls||['1','2A','2B','3A','3B','4','5','6','7','8','CS']);
  const enRecinto=all.filter(i=>i.entrada&&!i.salida);
  const conSalida=all.filter(i=>i.salida);
  const hoy=all.filter(i=>(i.entrada||'').startsWith(today));
  const permanencias=all.map(_permanencia).filter(x=>x!==null&&x>0);
  const avgPerm=Math.round(_avg(permanencias));
  const agCompleted=ag.filter(a=>a.horaReal);
  const agOnTime=agCompleted.filter(a=>{const d=_diffMins(a.hora,a.horaReal);return d!==null&&Math.abs(d)<=10;});
  const pctOnTime=_pct(agOnTime.length,agCompleted.length);
  const agNoShow=ag.filter(a=>a.estado==='PENDIENTE'&&a.fecha<today);
  const pctNoShow=_pct(agNoShow.length,ag.length);
  const byHallActive={};halls.forEach(h=>{byHallActive[h]=enRecinto.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;});
  const dailyMap={};all.forEach(i=>{const d=_dayKey(i.entrada);if(d)dailyMap[d]=(dailyMap[d]||0)+1;});
  const daily=Object.entries(dailyMap).sort((a,b)=>a[0].localeCompare(b[0]));
  const avgDaily=daily.length?_avg(daily.map(x=>x[1])):0;
  const retrasos=agCompleted.map(a=>_diffMins(a.hora,a.horaReal)).filter(d=>d!==null&&d>0);
  const avgRetraso=Math.round(_avg(retrasos));
  const stuck=enRecinto.filter(i=>(nowMs-new Date(i.entrada).getTime())/3600000>(_alertsCfg.stuckHours||4));
  return{all,ag,halls,today,enRecinto,conSalida,hoy,avgPerm,agCompleted,agOnTime,pctOnTime,agNoShow,pctNoShow,byHallActive,daily,avgDaily,retrasos,avgRetraso,stuck};
}

// ─── LOCAL AI ───
function _localRecs(snap){
  const recs=[];
  const{all,enRecinto,stuck,pctOnTime,pctNoShow,avgPerm,byHallActive,halls,avgDaily,avgRetraso,daily,ag}=snap;
  const today=snap.today;
  if(stuck.length)recs.push({pri:'CRITICO',ico:'🚨',cat:'Operaciones',msg:`${stuck.length} vehículos >4h sin salida`,action:`Revisar: ${stuck.slice(0,3).map(i=>i.matricula).join(', ')}`,impact:'Bloqueo de slots'});
  if(pctOnTime<85&&pctOnTime>0)recs.push({pri:'ALTO',ico:'⏱',cat:'Agenda',msg:`Puntualidad ${pctOnTime}% (objetivo 85%)`,action:'Comunicar a empresas con mayor retraso',impact:'~€'+Math.round(avgRetraso*all.length/100*2.5)+' en costos'});
  if(pctNoShow>5)recs.push({pri:'MEDIO',ico:'👻',cat:'Agenda',msg:`No-show ${pctNoShow}% (>5%)`,action:'Recordatorios 24h antes + penalizar',impact:'Slots desperdiciados'});
  const hallVals=Object.values(byHallActive).filter(v=>v>0);
  if(hallVals.length>1){const mx=Math.max(...hallVals),mn=Math.min(...hallVals);if(mx>mn*3&&mn>0){const hMax=Object.entries(byHallActive).sort((a,b)=>b[1]-a[1])[0][0];const hMin=Object.entries(byHallActive).sort((a,b)=>a[1]-b[1]).filter(x=>x[1]>0)[0]?.[0]||'?';recs.push({pri:'MEDIO',ico:'⚖️',cat:'Capacidad',msg:`Hall ${hMax} (${mx}) vs ${hMin} (${mn}) — desbalanceado`,action:`Redistribuir de ${hMax} a ${hMin}`,impact:'Mejorar throughput'});}}
  if(avgPerm>180)recs.push({pri:'MEDIO',ico:'🕐',cat:'Operaciones',msg:`Permanencia promedio ${_minToH(avgPerm)} (>3h)`,action:'Agilizar descarga y tracking',impact:'Liberar slots'});
  if(daily.length>=3){const l3=daily.slice(-3).map(x=>x[1]),p3=daily.slice(-6,-3).map(x=>x[1]);if(p3.length>=2&&_avg(l3)<_avg(p3)*0.7)recs.push({pri:'ALTO',ico:'📉',cat:'Tendencia',msg:`Throughput cayendo: ${Math.round(_avg(p3))}/d → ${Math.round(_avg(l3))}/d`,action:'Investigar causa',impact:'Riesgo de deadline'});}
  const hourCount={};all.forEach(i=>{const h=_hourKey(i.entrada);if(h)hourCount[h]=(hourCount[h]||0)+1;});
  const peak=Object.entries(hourCount).sort((a,b)=>b[1]-a[1])[0];
  if(peak&&peak[1]>avgDaily*0.3)recs.push({pri:'INFO',ico:'📊',cat:'Planificación',msg:`Hora pico ${peak[0]}:00 (${peak[1]} reg, ${Math.round(peak[1]/all.length*100)}%)`,action:'Reforzar personal',impact:'Reducir colas'});
  const empIssues={};ag.forEach(a=>{if(!a.empresa)return;const d=_diffMins(a.hora,a.horaReal);if(!empIssues[a.empresa])empIssues[a.empresa]={late:0,noshow:0,total:0};empIssues[a.empresa].total++;if(d>15)empIssues[a.empresa].late++;if(a.estado==='PENDIENTE'&&a.fecha<today)empIssues[a.empresa].noshow++;});
  Object.entries(empIssues).filter(([e,d])=>d.total>3&&(d.late/d.total>0.4||d.noshow/d.total>0.2)).sort((a,b)=>(b[1].late+b[1].noshow)-(a[1].late+a[1].noshow)).slice(0,3).forEach(([emp,d])=>{recs.push({pri:'MEDIO',ico:'🏢',cat:'Empresas',msg:`${emp}: ${d.late} retrasos + ${d.noshow} no-shows / ${d.total}`,action:'Notificar y exigir mejora',impact:'Planning global'});});
  const standActive={};enRecinto.forEach(i=>{if(!i.stand||!i.hall)return;const k=i.hall+'-'+i.stand;standActive[k]=(standActive[k]||0)+1;});
  const conflicts=Object.entries(standActive).filter(([k,v])=>v>1);
  if(conflicts.length)recs.push({pri:'CRITICO',ico:'🔀',cat:'Operaciones',msg:`${conflicts.length} stands con doble asignación`,action:'Resolver inmediatamente',impact:'Bloqueo físico'});
  halls.forEach(h=>{const cap=50,active=byHallActive[h]||0;if(active/cap>0.85)recs.push({pri:'ALTO',ico:'🏟',cat:'Capacidad',msg:`Hall ${h} al ${_pct(active,cap)}%`,action:'Desviar próximos ingresos',impact:'Evitar saturación'});});
  const condSinDocs=(_datos.cond||[]).filter(c2=>!c2.pasaporte&&!c2.dni).length;
  if(condSinDocs>0)recs.push({pri:'INFO',ico:'📋',cat:'Compliance',msg:`${condSinDocs} conductores sin documentación`,action:'Solicitar antes de próxima entrada',impact:'Riesgo regulatorio'});
  return recs.sort((a,b)=>{const p={CRITICO:0,ALTO:1,MEDIO:2,INFO:3};return(p[a.pri]||3)-(p[b.pri]||3);});
}

// ─── ANTHROPIC AI ───
async function _aiAnalysis(snap){
  if(!_ai.anthropic.enabled||!_ai.anthropic.key){toast('AI no configurada','#d97706');return null;}
  const summary={total:snap.all.length,enRecinto:snap.enRecinto.length,puntualidad:snap.pctOnTime,noShow:snap.pctNoShow,permanencia:snap.avgPerm,retraso:snap.avgRetraso,atascados:snap.stuck.length,halls:snap.byHallActive,throughput:snap.avgDaily};
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':_ai.anthropic.key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:`Eres experto en logística de eventos feriales. Analiza y da 5-8 recomendaciones. Responde SOLO JSON array: [{pri:"CRITICO|ALTO|MEDIO|INFO",ico:"emoji",cat:"categoría",msg:"problema",action:"acción",impact:"impacto"}]. Datos: ${JSON.stringify(summary)}`}]})});
    const data=await resp.json();
    const text=data.content?.[0]?.text||'';
    return JSON.parse(text.replace(/```json|```/g,'').trim());
  }catch(e){console.error('AI:',e);toast('Error AI','#ef4444');return null;}
}

// ─── SIMULATOR ───
function _simulate(snap){
  const p=_sim.params;
  const base={throughput:Math.round(snap.avgDaily),puntualidad:snap.pctOnTime,noShow:snap.pctNoShow,daysToComplete:snap.avgDaily>0?Math.ceil(snap.enRecinto.length/snap.avgDaily):999,cost:Math.round(snap.avgRetraso*snap.all.length/100*2.5),byHall:{...snap.byHallActive}};
  let simT=base.throughput*(1+p.throughputDelta/100);
  if(p.weatherImpact)simT*=(1-p.weatherImpact/100);
  if(p.extraOps)simT*=(1+p.extraOps*0.08);
  if(p.hoursChange)simT*=(1+p.hoursChange/14);
  let simP=base.puntualidad,simNS=base.noShow+p.noShowPct;
  let simHall={...base.byHall};
  if(p.hallClosed&&simHall[p.hallClosed]){const dis=simHall[p.hallClosed];delete simHall[p.hallClosed];const rem=Object.keys(simHall);if(rem.length){const per=Math.ceil(dis/rem.length);rem.forEach(h=>{simHall[h]=(simHall[h]||0)+per;});}simT*=0.75;simP*=0.85;}
  if(p.redistributeFrom&&p.redistributeTo&&simHall[p.redistributeFrom]){const tr2=Math.ceil(simHall[p.redistributeFrom]*0.3);simHall[p.redistributeFrom]-=tr2;simHall[p.redistributeTo]=(simHall[p.redistributeTo]||0)+tr2;}
  const simDays=simT>0?Math.ceil(snap.enRecinto.length/simT):999;
  const simCost=base.cost*(base.throughput>0?base.throughput/simT:1);
  const sim2={throughput:Math.round(simT),puntualidad:Math.round(simP),noShow:Math.round(simNS),daysToComplete:simDays,cost:Math.round(simCost),byHall:simHall};
  const delta={throughput:sim2.throughput-base.throughput,puntualidad:sim2.puntualidad-base.puntualidad,noShow:sim2.noShow-base.noShow,days:sim2.daysToComplete-base.daysToComplete,cost:sim2.cost-base.cost};
  return{baseline:base,simulated:sim2,delta};
}

// ─── ALERTS ───
function _checkAlerts(snap){
  const a=[];
  if(snap.stuck.length)a.push({level:'CRITICO',msg:`${snap.stuck.length} vehículos >4h`,ts:new Date().toLocaleTimeString()});
  if(snap.pctNoShow>_alertsCfg.noShowPct)a.push({level:'ALTO',msg:`No-show ${snap.pctNoShow}%`,ts:new Date().toLocaleTimeString()});
  if(snap.avgDaily>0&&snap.avgDaily<_alertsCfg.throughputMin)a.push({level:'ALTO',msg:`Throughput ${Math.round(snap.avgDaily)} < mín ${_alertsCfg.throughputMin}`,ts:new Date().toLocaleTimeString()});
  snap.halls.forEach(h=>{if(_pct(snap.byHallActive[h]||0,50)>_alertsCfg.occupancyMax)a.push({level:'MEDIO',msg:`Hall ${h} al ${_pct(snap.byHallActive[h]||0,50)}%`,ts:new Date().toLocaleTimeString()});});
  if(snap.avgRetraso>_alertsCfg.retrasoMax)a.push({level:'MEDIO',msg:`Retraso ${snap.avgRetraso}m > ${_alertsCfg.retrasoMax}m`,ts:new Date().toLocaleTimeString()});
  _alerts=a;return a;
}

// ─── REPORT ───
function _genReport(snap,recs){
  const ev=AppState.get('currentEvent')||{nombre:'Sin evento'};
  const today=new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  return[`# Reporte — ${ev.nombre||'Evento'}`,`**${today}**`,'',`## Resumen`,`- Total: ${snap.all.length} | En recinto: ${snap.enRecinto.length} | Through/día: ${Math.round(snap.avgDaily)}`,`- Puntualidad: ${snap.pctOnTime}% | No-show: ${snap.pctNoShow}% | Perm: ${_minToH(snap.avgPerm)} | Atascados: ${snap.stuck.length}`,'',`## Recomendaciones (${recs.length})`,...recs.map((r,i)=>`${i+1}. [${r.pri}] ${r.msg} → ${r.action}`),'',`## Alertas`,..._alerts.map(a=>`- [${a.level}] ${a.msg}`),'','---','*BeUnifyT AI Intelligence*'].join('\n');
}

// ─── IMPORT/EXPORT ───
function _importEvent(){
  const input=document.createElement('input');input.type='file';input.accept='.json,.xlsx';
  input.onchange=async(e)=>{const file=e.target.files[0];if(!file)return;try{if(file.name.endsWith('.json')){const data=JSON.parse(await file.text());_importedEvents.push({name:file.name.replace('.json',''),data,ts:new Date().toISOString()});}else{const wb=XLSX.read(await file.arrayBuffer());_importedEvents.push({name:file.name.replace(/\.(xlsx|xls)$/,''),data:XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]),ts:new Date().toISOString()});}toast('✅ Importado','#10b981');_paint();}catch(err){toast('Error: '+err.message,'#ef4444');}};
  input.click();
}
function _exportSnap(){
  const all=[...(_datos.ref||[]),...(_datos.ing||[])];
  const blob=new Blob([JSON.stringify({evento:AppState.get('currentEvent'),ingresos:all,movimientos:_datos.mov||[],agenda:_datos.ag||[],conductores:_datos.cond||[],date:new Date().toISOString()},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='snapshot_'+todayISO()+'.json';a.click();toast('✅','#10b981');
}

// ─── SUB RENDERS ───
function _renderCommand(snap,t){
  const recs=_localRecs(snap);_recs=recs;const alerts=_checkAlerts(snap);
  const priC={CRITICO:'#ef4444',ALTO:'#ea580c',MEDIO:'#f59e0b',INFO:t.acc||'#3b82f6'};
  let h='';
  if(alerts.length)h+=`<div style="background:rgba(239,68,68,.08);border:1px solid #fecaca;border-radius:8px;padding:8px;margin-bottom:8px"><div style="font-weight:800;font-size:11px;color:#ef4444;margin-bottom:4px">🔔 ${alerts.length} ALERTAS</div>${alerts.map(a=>`<div style="font-size:10px;margin:2px 0"><b style="color:${priC[a.level]||t.text}">[${a.level}]</b> ${a.msg}</div>`).join('')}</div>`;
  const scores=[Math.min(100,_pct(snap.conSalida.length,snap.all.length)),snap.pctOnTime||100,100-Math.min(100,_pct(snap.stuck.length,snap.enRecinto.length||1))];
  const health=Math.round(_avg(scores));
  h+=`<div style="display:grid;grid-template-columns:120px 1fr;gap:8px;margin-bottom:8px">`;
  h+=`<div>`+_card('',`<div style="font-size:36px;font-weight:900;color:${health>=75?'#10b981':health>=50?'#f59e0b':'#ef4444'};text-align:center">${health}</div><div style="font-size:9px;color:${t.t3};text-align:center">HEALTH /100</div>`,t,health>=75?'#10b981':health>=50?'#f59e0b':'#ef4444')+`</div>`;
  h+=`<div>`+_card(`🧠 ${recs.length} Recomendaciones`,recs.length?`<div style="max-height:400px;overflow-y:auto">${recs.map(r=>`<div style="display:flex;gap:8px;padding:6px;margin:3px 0;background:${t.bg};border-radius:6px;border-left:3px solid ${priC[r.pri]||t.acc}"><div style="font-size:16px;flex-shrink:0">${r.ico}</div><div style="flex:1"><div style="display:flex;gap:4px;margin-bottom:2px"><span style="font-size:9px;font-weight:900;padding:1px 6px;border-radius:10px;background:${priC[r.pri]};color:#fff">${r.pri}</span><span style="font-size:9px;color:${t.t3}">${r.cat}</span></div><div style="font-size:11px;font-weight:600">${r.msg}</div><div style="font-size:10px;color:#0d9f6e;margin-top:2px">→ ${r.action}</div><div style="font-size:9px;color:${t.t3}">Impacto: ${r.impact}</div></div></div>`).join('')}</div>`:`<div style="text-align:center;padding:20px;color:${t.t3}">✅ Todo OK</div>`,t)+`</div></div>`;
  return h;
}

function _renderSimulador(snap,t){
  const res=_simulate(snap);const{baseline:base,simulated:sim2,delta}=res;
  const halls=snap.halls;
  const dC=(v,inv)=>{const pos=inv?v<0:v>0;return pos?'#10b981':v===0?t.t3:'#ef4444';};
  const dS=(v)=>v>0?'+'+v:String(v);
  const inp=`style="width:100%;accent-color:${t.acc}"`;
  const lbl=`style="font-size:9px;font-weight:700;color:${t.t3}"`;
  const selS=`style="width:100%;font-size:10px;padding:2px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"`;

  let h=`<div style="display:grid;grid-template-columns:280px 1fr;gap:8px">`;
  h+=`<div>`+_card('🎛 Parámetros',`<div style="display:flex;flex-direction:column;gap:6px;font-size:11px">
    <div><label ${lbl}>Throughput Δ%</label><input type="range" min="-50" max="100" value="${_sim.params.throughputDelta}" oninput="window._ai4.sp('throughputDelta',+this.value)" ${inp}><span style="font-size:10px;font-weight:700">${_sim.params.throughputDelta>0?'+':''}${_sim.params.throughputDelta}%</span></div>
    <div><label ${lbl}>No-show extra %</label><input type="range" min="0" max="50" value="${_sim.params.noShowPct}" oninput="window._ai4.sp('noShowPct',+this.value)" ${inp}><span style="font-size:10px">${_sim.params.noShowPct}%</span></div>
    <div><label ${lbl}>Operadores extra</label><input type="range" min="-3" max="10" value="${_sim.params.extraOps}" oninput="window._ai4.sp('extraOps',+this.value)" ${inp}><span style="font-size:10px">${_sim.params.extraOps>0?'+':''}${_sim.params.extraOps}</span></div>
    <div><label ${lbl}>Horas extra</label><input type="range" min="-6" max="6" value="${_sim.params.hoursChange}" oninput="window._ai4.sp('hoursChange',+this.value)" ${inp}><span style="font-size:10px">${_sim.params.hoursChange>0?'+':''}${_sim.params.hoursChange}h</span></div>
    <div><label ${lbl}>Impacto clima %</label><input type="range" min="0" max="50" value="${_sim.params.weatherImpact}" oninput="window._ai4.sp('weatherImpact',+this.value)" ${inp}><span style="font-size:10px">-${_sim.params.weatherImpact}%</span></div>
    <div><label ${lbl}>Cerrar hall</label><select onchange="window._ai4.sp('hallClosed',this.value)" ${selS}><option value="">Ninguno</option>${halls.map(h2=>`<option value="${h2}" ${_sim.params.hallClosed===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <div><label ${lbl}>Redistribuir de</label><select onchange="window._ai4.sp('redistributeFrom',this.value)" ${selS}><option value="">—</option>${halls.map(h2=>`<option value="${h2}" ${_sim.params.redistributeFrom===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <div><label ${lbl}>Redistribuir a</label><select onchange="window._ai4.sp('redistributeTo',this.value)" ${selS}><option value="">—</option>${halls.map(h2=>`<option value="${h2}" ${_sim.params.redistributeTo===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <button style="padding:4px 8px;font-size:10px;border-radius:20px;border:1px solid ${t.border};background:transparent;color:${t.t3};cursor:pointer" onclick="window._ai4.simReset()">↺ Reset</button>
    <button style="padding:4px 8px;font-size:10px;border-radius:20px;border:none;background:${t.acc};color:#fff;cursor:pointer;font-weight:700" onclick="window._ai4.simSave()">💾 Guardar</button>
  </div>`,t,'#8b5cf6')+`</div>`;

  h+=`<div>`;
  h+=_card('📊 Baseline vs Simulación',`<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="background:${t.bg};font-weight:700"><th style="padding:6px;text-align:left">Métrica</th><th style="text-align:center">Actual</th><th style="text-align:center">Simulado</th><th style="text-align:center">Δ</th></tr>
    <tr style="border-bottom:1px solid ${t.border}"><td style="padding:6px">🚛 Through/día</td><td style="text-align:center;font-weight:700">${base.throughput}</td><td style="text-align:center;font-weight:700;color:${dC(delta.throughput)}">${sim2.throughput}</td><td style="text-align:center;color:${dC(delta.throughput)};font-weight:700">${dS(delta.throughput)}</td></tr>
    <tr style="border-bottom:1px solid ${t.border}"><td style="padding:6px">⏱ Puntualidad</td><td style="text-align:center">${base.puntualidad}%</td><td style="text-align:center;color:${dC(delta.puntualidad)}">${sim2.puntualidad}%</td><td style="text-align:center;color:${dC(delta.puntualidad)}">${dS(delta.puntualidad)}%</td></tr>
    <tr style="border-bottom:1px solid ${t.border}"><td style="padding:6px">👻 No-show</td><td style="text-align:center">${base.noShow}%</td><td style="text-align:center;color:${dC(delta.noShow,true)}">${sim2.noShow}%</td><td style="text-align:center;color:${dC(delta.noShow,true)}">${dS(delta.noShow)}%</td></tr>
    <tr style="border-bottom:1px solid ${t.border}"><td style="padding:6px">📅 Días</td><td style="text-align:center">${base.daysToComplete===999?'∞':base.daysToComplete}</td><td style="text-align:center;font-weight:700;color:${dC(-delta.days)}">${sim2.daysToComplete===999?'∞':sim2.daysToComplete}</td><td style="text-align:center;color:${dC(-delta.days)}">${dS(delta.days)}d</td></tr>
    <tr><td style="padding:6px">💰 Costo €</td><td style="text-align:center">€${base.cost}</td><td style="text-align:center;color:${dC(-delta.cost)}">€${sim2.cost}</td><td style="text-align:center;color:${dC(-delta.cost,true)}">${dS(delta.cost)}€</td></tr></table>`,t);
  h+=`<div style="margin-top:8px">`+_card('🏟 Halls',`<div style="display:flex;gap:4px;flex-wrap:wrap">${halls.map(h2=>{const b=base.byHall[h2]||0,s=sim2.byHall[h2]||0,d=s-b;return`<div style="text-align:center;background:${t.bg};border-radius:6px;padding:6px 10px;min-width:55px"><div style="font-weight:900;font-size:9px">${h2}</div><div style="font-size:12px;font-weight:700">${b}→<span style="color:${d>0?'#ef4444':d<0?'#10b981':t.t3}">${s}</span></div></div>`;}).join('')}</div>`,t)+`</div>`;
  if(_sim.history.length)h+=`<div style="margin-top:8px">`+_card('📋 Guardados',`<div style="max-height:120px;overflow-y:auto">${_sim.history.map((s,i)=>`<div style="font-size:10px;margin:2px 0;padding:4px;background:${t.bg};border-radius:4px"><b>#${i+1}</b> (${s.ts}) T:${s.base}→${s.sim} D:${s.bDays}→${s.sDays}</div>`).join('')}</div>`,t)+`</div>`;
  h+=`</div></div>`;
  return h;
}

function _renderEventos(snap,t){
  let h=`<div style="display:flex;gap:6px;margin-bottom:8px"><button style="padding:4px 10px;font-size:11px;border-radius:20px;border:none;background:${t.acc};color:#fff;cursor:pointer;font-weight:700" onclick="window._ai4.imp()">📥 Importar evento</button><button style="padding:4px 10px;font-size:11px;border-radius:20px;border:1px solid ${t.border};background:transparent;color:${t.t3};cursor:pointer" onclick="window._ai4.exp()">📤 Exportar actual</button></div>`;
  if(_importedEvents.length){
    h+=_importedEvents.map((ev,idx)=>{const data=Array.isArray(ev.data)?ev.data:(ev.data.ingresos||[]);const total=data.length;const cs=data.filter(i=>i.salida).length;const ap=Math.round(_avg(data.map(_permanencia).filter(x=>x!==null&&x>0)));return _card(`📋 ${ev.name}`,`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:4px">${[['Registros',total,t.acc],['Con salida',cs,'#10b981'],['Perm.',_minToH(ap),'#0d9f6e']].map(([l,v,c])=>`<div style="text-align:center;background:${t.bg};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${c}">${v}</div><div style="font-size:8px;color:${t.t3}">${l}</div></div>`).join('')}</div><div style="font-size:9px;color:${t.t3}">${ev.ts?.slice(0,10)||'?'} · <span style="cursor:pointer;color:#ef4444" onclick="window._ai4.delImp(${idx})">🗑</span></div>`,t);}).join('<div style="margin:6px 0"></div>');
    h+=`<div style="margin-top:8px">`+_card('🔄 Comparativa',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg};font-weight:700"><th style="padding:4px 6px;text-align:left">Evento</th><th>Reg.</th><th>Compl.%</th><th>Perm.</th></tr><tr style="border-bottom:1px solid ${t.border};background:${t.card}"><td style="padding:4px 6px;font-weight:700">📍 ACTUAL</td><td style="text-align:center">${snap.all.length}</td><td style="text-align:center">${_pct(snap.conSalida.length,snap.all.length)}%</td><td style="text-align:center">${_minToH(snap.avgPerm)}</td></tr>${_importedEvents.map(ev=>{const data=Array.isArray(ev.data)?ev.data:(ev.data.ingresos||[]);const t2=data.length;const cs=data.filter(i=>i.salida).length;const ap=Math.round(_avg(data.map(_permanencia).filter(x=>x!==null&&x>0)));return`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:4px 6px">${ev.name}</td><td style="text-align:center">${t2}</td><td style="text-align:center">${_pct(cs,t2)}%</td><td style="text-align:center">${_minToH(ap)}</td></tr>`;}).join('')}</table>`,t)+`</div>`;
  }else h+=`<div style="text-align:center;padding:40px;color:${t.t3}"><div style="font-size:28px;margin-bottom:8px">📦</div>Sin eventos importados</div>`;
  return h;
}

function _renderReporte(snap,t){
  const recs=_recs.length?_recs:_localRecs(snap);
  const report=_genReport(snap,recs);_lastReport=report;
  return _card('📄 Reporte automático',`<div style="background:${t.bg};border-radius:6px;padding:12px;font-size:11px;max-height:500px;overflow-y:auto;white-space:pre-wrap;font-family:monospace;line-height:1.6;color:${t.text}">${esc(report)}</div><div style="margin-top:8px;display:flex;gap:6px"><button style="padding:4px 10px;font-size:11px;border-radius:20px;border:none;background:${t.acc};color:#fff;cursor:pointer;font-weight:700" onclick="window._ai4.copyReport()">📋 Copiar</button><button style="padding:4px 10px;font-size:11px;border-radius:20px;border:1px solid ${t.border};background:transparent;color:${t.t3};cursor:pointer" onclick="window._ai4.dlReport()">⬇ .md</button></div>`,t);
}

function _renderAIConfig(snap,t){
  const inpS=`style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text};font-size:11px"`;
  let h='';
  h+=_card('🤖 AI Providers',`<div style="display:flex;flex-direction:column;gap:8px">${Object.entries(_ai).map(([key,cfg])=>`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:${t.bg};border-radius:6px"><span style="font-size:14px;width:20px;height:20px;border:2px solid ${cfg.enabled?t.acc:t.border};border-radius:4px;display:flex;align-items:center;justify-content:center;background:${cfg.enabled?t.acc:'transparent'};color:#fff;font-weight:900;cursor:pointer" onclick="window._ai4.togAI('${key}')">${cfg.enabled?'✓':''}</span><span style="font-size:12px;font-weight:700">${cfg.label}</span><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${cfg.free?'rgba(16,185,129,.1)':'rgba(245,158,11,.1)'};color:${cfg.free?'#10b981':'#f59e0b'}">${cfg.free?'GRATIS':'PAGO'}</span><span style="font-size:10px;color:${t.t3};flex:1">${cfg.note}</span>${key==='anthropic'&&cfg.enabled?`<input type="password" placeholder="API Key..." value="${cfg.key||''}" onchange="window._ai4.setKey(this.value)" style="font-size:10px;width:200px;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}">`:''}</div>`).join('')}</div>`,t);
  h+=`<div style="margin-top:8px;display:flex;gap:6px"><button style="padding:4px 10px;font-size:11px;border-radius:20px;border:none;background:#10b981;color:#fff;cursor:pointer;font-weight:700" onclick="window._ai4.runLocal()">🧠 Local</button>${_ai.anthropic.enabled?`<button style="padding:4px 10px;font-size:11px;border-radius:20px;border:none;background:#8b5cf6;color:#fff;cursor:pointer;font-weight:700" onclick="window._ai4.runAI()">🤖 AI</button>`:''}</div>`;
  h+=`<div style="margin-top:8px">`+_card('🔔 Alertas',`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11px">${[['Horas atascado',_alertsCfg.stuckHours,'stuckHours'],['No-show %',_alertsCfg.noShowPct,'noShowPct'],['Through mín',_alertsCfg.throughputMin,'throughputMin'],['Ocup. máx %',_alertsCfg.occupancyMax,'occupancyMax'],['Retraso máx m',_alertsCfg.retrasoMax,'retrasoMax']].map(([l,v,k])=>`<div><label style="font-size:9px;font-weight:700;color:${t.t3}">${l}</label><input type="number" value="${v}" onchange="window._ai4.setAlert('${k}',+this.value)" ${inpS}></div>`).join('')}</div>`,t)+`</div>`;
  return h;
}

// ─── MAIN PAINT ───
function _paint(){
  if(!_c)return;
  const t=T();const snap=_snap();
  const subs=[['command','🧠 Mando'],['simulador','🎛 Simulador'],['eventos','📦 Eventos'],['reporte','📄 Reporte'],['aiconfig','🤖 AI Config']];
  let h=`<div style="max-width:1200px;margin:0 auto"><div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center;margin-bottom:6px;border-bottom:1px solid ${t.border};padding-bottom:6px">`;
  h+=subs.map(([id,l])=>`<button style="padding:3px 8px;font-size:10px;border-radius:20px;border:1px solid ${_sub===id?t.acc:t.border};background:${_sub===id?t.acc:'transparent'};color:${_sub===id?'#fff':t.t3};font-weight:700;cursor:pointer" onclick="window._ai4.go('${id}')">${l}</button>`).join('');
  h+=`<span style="flex:1"></span>`;
  const activeAI=Object.entries(_ai).filter(([k,v])=>v.enabled).map(([k,v])=>v.label);
  h+=`<span style="font-size:9px;color:${t.t3}">AI: ${activeAI.join(', ')||'ninguna'}</span>`;
  h+=`</div>`;
  switch(_sub){
    case 'simulador':h+=_renderSimulador(snap,t);break;
    case 'eventos':h+=_renderEventos(snap,t);break;
    case 'reporte':h+=_renderReporte(snap,t);break;
    case 'aiconfig':h+=_renderAIConfig(snap,t);break;
    default:h+=_renderCommand(snap,t);
  }
  h+=`</div>`;_c.innerHTML=h;
}

// ─── GLOBAL API ───
window._ai4={
  go:(s)=>{_sub=s;_paint();},
  sp:(k,v)=>{_sim.params[k]=v;_paint();},
  simReset:()=>{_sim.params={throughputDelta:0,hallClosed:'',noShowPct:0,extraOps:0,hoursChange:0,weatherImpact:0,redistributeFrom:'',redistributeTo:''};_paint();},
  simSave:()=>{const snap=_snap();const r=_simulate(snap);_sim.history.push({ts:new Date().toLocaleTimeString(),base:r.baseline.throughput,sim:r.simulated.throughput,bDays:r.baseline.daysToComplete,sDays:r.simulated.daysToComplete});toast('✅ Guardado','#10b981');},
  imp:_importEvent,
  exp:_exportSnap,
  delImp:(i)=>{_importedEvents.splice(i,1);_paint();},
  togAI:(k)=>{_ai[k].enabled=!_ai[k].enabled;_paint();},
  setKey:(v)=>{_ai.anthropic.key=v;},
  setAlert:(k,v)=>{_alertsCfg[k]=v;},
  runLocal:()=>{const snap=_snap();_recs=_localRecs(snap);toast(`🧠 ${_recs.length} recomendaciones`,'#10b981');_sub='command';_paint();},
  runAI:async()=>{toast('🤖 Consultando...','#3b82f6');const snap=_snap();const ai=await _aiAnalysis(snap);if(ai&&Array.isArray(ai)){_recs=[...ai,..._localRecs(snap)];toast(`🤖 ${ai.length}+${_localRecs(snap).length}`,'#10b981');}else{_recs=_localRecs(snap);}_sub='command';_paint();},
  copyReport:()=>{if(_lastReport){navigator.clipboard.writeText(_lastReport);toast('📋','#10b981');}},
  dlReport:()=>{if(!_lastReport)return;const blob=new Blob([_lastReport],{type:'text/markdown'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reporte_'+todayISO()+'.md';a.click();toast('✅','#10b981');},
};
