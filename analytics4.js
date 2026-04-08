// BeUnifyT v8 — tabs/analytics4.js — AI Intelligence (Extreme Analytics)
// Simulador dinámico, AI con APIs gratuitas/toggle, importar datos de otros eventos,
// what-if scenarios, recomendaciones automáticas, detección anomalías, reportes auto.
import { DB, iF, SID, registerFn, callFn, agF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, tr, TV, PP, SCFG, CCFG, HALLS, TRACKING_STEPS } from '../core/shared.js';
import { isSA, isSup, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB } from '../core/db.js';
import { toast, uid, nowLocal } from '../utils.js';

/* ═══════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════ */
if(!window._ai4){window._ai4={
  sub:'command',
  // AI toggles
  ai:{
    anthropic:{enabled:false,label:'Anthropic Claude',free:false,note:'Requiere API key',key:''},
    local:{enabled:true,label:'Análisis local',free:true,note:'Heurísticas + estadísticas'},
  },
  // Simulador
  sim:{
    scenario:'baseline',
    params:{throughputDelta:0,hallClosed:'',noShowPct:0,extraOps:0,hoursChange:0,weatherImpact:0,redistributeFrom:'',redistributeTo:''},
    results:null,
    history:[]
  },
  // Imported events for comparison
  importedEvents:[],
  // Recommendations
  recs:[],
  recsLoading:false,
  // Report
  lastReport:null,
  // Alerts
  alerts:[],alertsCfg:{stuckHours:4,noShowPct:10,throughputMin:5,occupancyMax:85,retrasoMax:30}
};}

/* ═══════════════════════════════════════════════════════════════════
   THEME HELPER
   ═══════════════════════════════════════════════════════════════════ */
const _t=()=>{const r=document.documentElement;const s=getComputedStyle(r);const g=v=>s.getPropertyValue(v).trim()||v;return{bg:g('--bg'),bg2:g('--bg2'),bg3:g('--bg3'),bg4:g('--bg4'),text:g('--text'),t2:g('--text2'),t3:g('--text3'),bd:g('--border'),bd2:g('--border2'),blue:g('--blue'),bll:g('--bll'),green:g('--green'),gll:g('--gll'),red:g('--red'),rll:g('--rll'),amber:g('--amber'),all:g('--all'),purple:'#8b5cf6',teal:g('--teal'),r:g('--r'),sh:g('--sh'),card:g('--bg2'),inp:g('--bg3')};};
const _card=(title,body,t,color)=>`<div style="background:${t.card};border:1px solid ${t.bd};border-radius:8px;padding:10px;box-shadow:${t.sh};${color?'border-top:3px solid '+color:''}">${title?`<div style="font-weight:800;font-size:11px;margin-bottom:6px;color:${t.t2}">${title}</div>`:''}${body}</div>`;
const _kpi=(label,value,sub,color,t)=>`<div style="text-align:center;padding:8px"><div style="font-size:22px;font-weight:900;color:${color||t.blue};line-height:1.1">${value}</div><div style="font-size:9px;font-weight:700;color:${t.t3};margin-top:2px">${label}</div>${sub?`<div style="font-size:8px;color:${t.t3};margin-top:1px">${sub}</div>`:''}</div>`;
const _avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const _pct=(a,b)=>b?Math.round(a/b*100):0;
const _countBy=(arr,key)=>{const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
const _dayKey=(ts)=>(ts||'').slice(0,10);
const _hourKey=(ts)=>(ts||'').slice(11,13);
const _minToH=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?String(Math.round(m%60)).padStart(2,'0')+'m':''}`:`${Math.round(m)}m`;
const _permanencia=(i)=>{if(!i.entrada||!i.salida)return null;return(new Date(i.salida)-new Date(i.entrada))/60000;};

/* ═══════════════════════════════════════════════════════════════════
   DATA SNAPSHOT
   ═══════════════════════════════════════════════════════════════════ */
function _snap(){
  const all=[...DB.ingresos,...DB.ingresos2];
  const mov=[...DB.movimientos||[]];
  const ag=[...DB.agenda||[]];
  const halls=getRecintoHalls();
  const today=new Date().toISOString().slice(0,10);
  const enRecinto=all.filter(i=>i.entrada&&!i.salida);
  const conSalida=all.filter(i=>i.salida);
  const hoy=all.filter(i=>(i.entrada||'').startsWith(today));
  const permanencias=all.map(_permanencia).filter(x=>x!==null&&x>0);
  const avgPerm=Math.round(_avg(permanencias));
  const agCompleted=ag.filter(a=>a.horaReal);
  const agOnTime=agCompleted.filter(a=>{const d=diffMins(a.hora,a.horaReal);return d!==null&&Math.abs(d)<=10;});
  const pctOnTime=_pct(agOnTime.length,agCompleted.length);
  const agNoShow=ag.filter(a=>a.estado==='PENDIENTE'&&a.fecha<today);
  const pctNoShow=_pct(agNoShow.length,ag.length);
  const byHall={};halls.forEach(h=>{byHall[h]=all.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;});
  const byHallActive={};halls.forEach(h=>{byHallActive[h]=enRecinto.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;});
  // Throughput per day
  const dailyMap={};all.forEach(i=>{const d=_dayKey(i.entrada);if(d)dailyMap[d]=(dailyMap[d]||0)+1;});
  const daily=Object.entries(dailyMap).sort((a,b)=>a[0].localeCompare(b[0]));
  const avgDaily=daily.length?_avg(daily.map(x=>x[1])):0;
  // Retrasos
  const retrasos=agCompleted.map(a=>diffMins(a.hora,a.horaReal)).filter(d=>d!==null&&d>0);
  const avgRetraso=Math.round(_avg(retrasos));
  // Stuck
  const stuck=enRecinto.filter(i=>(Date.now()-new Date(i.entrada).getTime())/3600000>4);

  return{all,mov,ag,halls,today,enRecinto,conSalida,hoy,avgPerm,permanencias,agCompleted,agOnTime,pctOnTime,agNoShow,pctNoShow,byHall,byHallActive,daily,avgDaily,retrasos,avgRetraso,stuck};
}

/* ═══════════════════════════════════════════════════════════════════
   LOCAL AI ENGINE (heurísticas puras, sin API)
   ═══════════════════════════════════════════════════════════════════ */
function _localRecommendations(snap){
  const recs=[];
  const {all,enRecinto,stuck,pctOnTime,pctNoShow,avgPerm,byHallActive,halls,avgDaily,avgRetraso,daily}=snap;
  const cfg=window._ai4.alertsCfg;

  // 1. Atascados
  if(stuck.length>0)recs.push({pri:'CRITICO',ico:'🚨',cat:'Operaciones',msg:`${stuck.length} vehículos llevan >4h en recinto sin salida`,action:`Revisar: ${stuck.slice(0,3).map(i=>i.matricula).join(', ')}`,impact:'Bloqueo de slots y colas',auto:true});
  // 2. Puntualidad baja
  if(pctOnTime<85&&pctOnTime>0)recs.push({pri:'ALTO',ico:'⏱',cat:'Agenda',msg:`Puntualidad al ${pctOnTime}%, por debajo del 85% objetivo`,action:'Revisar scheduling y comunicar a empresas con mayor retraso',impact:`Estimado ${Math.round(avgRetraso*all.length/100*0.15)}€ en costos de retraso`,auto:true});
  // 3. No-shows
  if(pctNoShow>5)recs.push({pri:'MEDIO',ico:'👻',cat:'Agenda',msg:`Tasa de no-show al ${pctNoShow}%, superior al 5% aceptable`,action:'Enviar recordatorios 24h antes y penalizar reincidentes',impact:'Slots desperdiciados que podrían usarse',auto:true});
  // 4. Desbalance halls
  const hallVals=Object.values(byHallActive).filter(v=>v>0);
  if(hallVals.length>1){
    const maxH=Math.max(...hallVals);const minH=Math.min(...hallVals);
    if(maxH>minH*3&&minH>0){
      const hallMax=Object.entries(byHallActive).sort((a,b)=>b[1]-a[1])[0][0];
      const hallMin=Object.entries(byHallActive).sort((a,b)=>a[1]-b[1]).filter(x=>x[1]>0)[0]?.[0]||'?';
      recs.push({pri:'MEDIO',ico:'⚖️',cat:'Capacidad',msg:`Hall ${hallMax} tiene ${maxH} vehículos vs ${hallMin} con solo ${minH}`,action:`Redistribuir próximas citas de ${hallMax} a ${hallMin}`,impact:'Mejorar throughput y reducir colas',auto:true});
    }
  }
  // 5. Permanencia excesiva
  if(avgPerm>180)recs.push({pri:'MEDIO',ico:'🕐',cat:'Operaciones',msg:`Permanencia promedio de ${_minToH(avgPerm)}, superior a 3h`,action:'Agilizar proceso de descarga y tracking',impact:'Liberar slots más rápido',auto:true});
  // 6. Tendencia descendente
  if(daily.length>=3){
    const last3=daily.slice(-3).map(x=>x[1]);
    const prev3=daily.slice(-6,-3).map(x=>x[1]);
    if(prev3.length>=2&&_avg(last3)<_avg(prev3)*0.7)recs.push({pri:'ALTO',ico:'📉',cat:'Tendencia',msg:`Throughput cayendo: ${Math.round(_avg(prev3))}/día → ${Math.round(_avg(last3))}/día`,action:'Investigar causa del descenso',impact:'Riesgo de no cumplir plazos',auto:true});
  }
  // 7. Hora pico sin refuerzo
  const hourCount={};all.forEach(i=>{const h=_hourKey(i.entrada);if(h)hourCount[h]=(hourCount[h]||0)+1;});
  const peakHour=Object.entries(hourCount).sort((a,b)=>b[1]-a[1])[0];
  if(peakHour&&peakHour[1]>avgDaily*0.3)recs.push({pri:'INFO',ico:'📊',cat:'Planificación',msg:`Hora pico: ${peakHour[0]}:00 con ${peakHour[1]} registros (${Math.round(peakHour[1]/all.length*100)}% del total)`,action:'Reforzar personal en esa franja',impact:'Reducir colas en hora punta',auto:true});
  // 8. Empresas problemáticas
  const empIssues={};snap.ag.forEach(a=>{if(!a.empresa)return;const d=diffMins(a.hora,a.horaReal);if(!empIssues[a.empresa])empIssues[a.empresa]={late:0,noshow:0,total:0};empIssues[a.empresa].total++;if(d>15)empIssues[a.empresa].late++;if(a.estado==='PENDIENTE'&&a.fecha<snap.today)empIssues[a.empresa].noshow++;});
  const worstEmp=Object.entries(empIssues).filter(([e,d])=>d.total>3&&(d.late/d.total>0.4||d.noshow/d.total>0.2)).sort((a,b)=>(b[1].late+b[1].noshow)-(a[1].late+a[1].noshow));
  worstEmp.slice(0,3).forEach(([emp,d])=>{recs.push({pri:'MEDIO',ico:'🏢',cat:'Empresas',msg:`${emp}: ${d.late} retrasos + ${d.noshow} no-shows de ${d.total} citas`,action:'Notificar y exigir mejora',impact:'Impacto en planning global',auto:true});});
  // 9. Conflictos de descarga
  const standActive={};enRecinto.forEach(i=>{if(!i.stand||!i.hall)return;const k=i.hall+'-'+i.stand;standActive[k]=(standActive[k]||0)+1;});
  const conflicts=Object.entries(standActive).filter(([k,v])=>v>1);
  if(conflicts.length)recs.push({pri:'CRITICO',ico:'🔀',cat:'Operaciones',msg:`${conflicts.length} stands con múltiples vehículos asignados`,action:'Resolver asignación duplicada inmediatamente',impact:'Bloqueo físico de descarga',auto:true});
  // 10. Documentación
  const condSinDocs=(DB.conductores||[]).filter(c=>!c.pasaporte&&!c.dni).length;
  if(condSinDocs>0)recs.push({pri:'INFO',ico:'📋',cat:'Compliance',msg:`${condSinDocs} conductores sin documentación registrada`,action:'Solicitar documentación antes de próxima entrada',impact:'Riesgo regulatorio',auto:true});
  // 11. Capacidad restante
  halls.forEach(h=>{const cap=50;const active=byHallActive[h]||0;if(active/cap>0.85)recs.push({pri:'ALTO',ico:'🏟',cat:'Capacidad',msg:`Hall ${h} al ${_pct(active,cap)}% de capacidad (${active}/${cap})`,action:'Desviar próximos ingresos a halls con espacio',impact:'Evitar saturación',auto:true});});
  // 12. Previsión meteorológica (placeholder)
  recs.push({pri:'INFO',ico:'🌤',cat:'Externo',msg:'Previsión meteorológica: consultar condiciones para ajustar throughput',action:'Si lluvia prevista: reducir targets un 20-30%',impact:'Prevenir frustración por objetivos incumplibles',auto:false});

  return recs.sort((a,b)=>{const p={CRITICO:0,ALTO:1,MEDIO:2,INFO:3};return(p[a.pri]||3)-(p[b.pri]||3);});
}

/* ═══════════════════════════════════════════════════════════════════
   ANTHROPIC AI (opcional, requiere API key)
   ═══════════════════════════════════════════════════════════════════ */
async function _aiAnalysis(snap){
  const ai=window._ai4.ai;
  if(!ai.anthropic.enabled||!ai.anthropic.key){toast('AI Anthropic no configurada','var(--amber)');return null;}
  const summary={
    totalRegistros:snap.all.length,enRecinto:snap.enRecinto.length,conSalida:snap.conSalida.length,
    pctPuntualidad:snap.pctOnTime,pctNoShow:snap.pctNoShow,avgPermanencia:snap.avgPerm,
    avgRetraso:snap.avgRetraso,atascados:snap.stuck.length,
    hallOcupacion:snap.byHallActive,throughputDiario:snap.avgDaily
  };
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':ai.anthropic.key,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',max_tokens:1500,
        messages:[{role:'user',content:`Eres un experto en logística de eventos feriales (montaje/desmontaje). Analiza estos datos y da 5-8 recomendaciones específicas y accionables. Responde SOLO en JSON array: [{pri:"CRITICO|ALTO|MEDIO|INFO",ico:"emoji",cat:"categoría",msg:"problema",action:"acción",impact:"impacto"}]. Datos: ${JSON.stringify(summary)}`}]
      })
    });
    const data=await resp.json();
    const text=data.content?.[0]?.text||'';
    const clean=text.replace(/```json|```/g,'').trim();
    return JSON.parse(clean);
  }catch(e){console.error('AI error:',e);toast('Error AI: '+e.message,'var(--red)');return null;}
}

/* ═══════════════════════════════════════════════════════════════════
   SIMULATOR ENGINE
   ═══════════════════════════════════════════════════════════════════ */
function _simulate(snap){
  const sim=window._ai4.sim;
  const p=sim.params;
  const halls=snap.halls;
  const baseThrough=snap.avgDaily;
  const basePunt=snap.pctOnTime;
  const baseNoShow=snap.pctNoShow;
  const baseByHall={...snap.byHallActive};

  // Apply deltas
  let simThrough=baseThrough*(1+p.throughputDelta/100);
  if(p.weatherImpact)simThrough*=(1-p.weatherImpact/100);
  if(p.extraOps)simThrough*=(1+p.extraOps*0.08);// each extra op adds ~8%
  if(p.hoursChange)simThrough*=(1+p.hoursChange/14);// proportional to base 14h

  let simNoShow=baseNoShow+p.noShowPct;
  let simPunt=basePunt;

  // Hall closed scenario
  let simByHall={...baseByHall};
  if(p.hallClosed&&simByHall[p.hallClosed]){
    const displaced=simByHall[p.hallClosed];
    delete simByHall[p.hallClosed];
    const remaining=Object.keys(simByHall);
    if(remaining.length){
      const perHall=Math.ceil(displaced/remaining.length);
      remaining.forEach(h=>{simByHall[h]=(simByHall[h]||0)+perHall;});
    }
    simThrough*=0.75;// losing a hall impacts throughput
    simPunt*=0.85;// puntuality drops
  }

  // Redistribution
  if(p.redistributeFrom&&p.redistributeTo&&simByHall[p.redistributeFrom]){
    const transfer=Math.ceil(simByHall[p.redistributeFrom]*0.3);
    simByHall[p.redistributeFrom]-=transfer;
    simByHall[p.redistributeTo]=(simByHall[p.redistributeTo]||0)+transfer;
  }

  // Calculate ETA
  const totalPending=snap.enRecinto.length;
  const simDaysToComplete=simThrough>0?Math.ceil(totalPending/simThrough):999;
  const baseDaysToComplete=baseThrough>0?Math.ceil(totalPending/baseThrough):999;

  // Costo
  const cfg=window._pa3?.cfg||{costoHoraRetraso:150};
  const baseCost=snap.avgRetraso*snap.all.length/100*(cfg.costoHoraRetraso||150)/60;
  const simCost=baseCost*(baseThrough>0?baseThrough/simThrough:1);

  return{
    baseline:{throughput:Math.round(baseThrough),puntualidad:basePunt,noShow:baseNoShow,daysToComplete:baseDaysToComplete,cost:Math.round(baseCost),byHall:baseByHall},
    simulated:{throughput:Math.round(simThrough),puntualidad:Math.round(simPunt),noShow:Math.round(simNoShow),daysToComplete:simDaysToComplete,cost:Math.round(simCost),byHall:simByHall},
    delta:{throughput:Math.round(simThrough-baseThrough),puntualidad:Math.round(simPunt-basePunt),noShow:Math.round(simNoShow-baseNoShow),days:simDaysToComplete-baseDaysToComplete,cost:Math.round(simCost-baseCost)},
    params:{...p}
  };
}

/* ═══════════════════════════════════════════════════════════════════
   ALERT ENGINE
   ═══════════════════════════════════════════════════════════════════ */
function _checkAlerts(snap){
  const cfg=window._ai4.alertsCfg;
  const alerts=[];
  if(snap.stuck.length>0)alerts.push({level:'CRITICO',msg:`${snap.stuck.length} vehículos >4h sin salida`,ts:new Date().toLocaleTimeString()});
  if(snap.pctNoShow>cfg.noShowPct)alerts.push({level:'ALTO',msg:`No-show al ${snap.pctNoShow}% (umbral: ${cfg.noShowPct}%)`,ts:new Date().toLocaleTimeString()});
  if(snap.avgDaily<cfg.throughputMin&&snap.avgDaily>0)alerts.push({level:'ALTO',msg:`Throughput diario ${Math.round(snap.avgDaily)} < mínimo ${cfg.throughputMin}`,ts:new Date().toLocaleTimeString()});
  snap.halls.forEach(h=>{const active=snap.byHallActive[h]||0;const cap=50;if(_pct(active,cap)>cfg.occupancyMax)alerts.push({level:'MEDIO',msg:`Hall ${h} al ${_pct(active,cap)}% ocupación`,ts:new Date().toLocaleTimeString()});});
  if(snap.avgRetraso>cfg.retrasoMax)alerts.push({level:'MEDIO',msg:`Retraso promedio ${snap.avgRetraso}m > umbral ${cfg.retrasoMax}m`,ts:new Date().toLocaleTimeString()});
  window._ai4.alerts=alerts;
  return alerts;
}

/* ═══════════════════════════════════════════════════════════════════
   IMPORT EVENT DATA
   ═══════════════════════════════════════════════════════════════════ */
function _importEventData(){
  const input=document.createElement('input');input.type='file';input.accept='.json,.xlsx';
  input.onchange=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.name.endsWith('.json')){
        const text=await file.text();
        const data=JSON.parse(text);
        window._ai4.importedEvents.push({name:file.name.replace('.json',''),data,ts:new Date().toISOString()});
        toast('✅ Evento importado','var(--green)');
      }else{
        // XLSX
        const buf=await file.arrayBuffer();
        const wb=XLSX.read(buf);
        const ws=wb.Sheets[wb.SheetNames[0]];
        const data=XLSX.utils.sheet_to_json(ws);
        window._ai4.importedEvents.push({name:file.name.replace(/\.(xlsx|xls)$/,''),data,ts:new Date().toISOString()});
        toast('✅ Evento importado','var(--green)');
      }
      renderAnalytics4();
    }catch(err){toast('Error: '+err.message,'var(--red)');}
  };
  input.click();
}

// Export current event snapshot for future import
function _exportSnapshot(){
  const all=[...DB.ingresos,...DB.ingresos2];
  const snap={
    evento:getActiveEvent(),
    ingresos:all,
    movimientos:DB.movimientos||[],
    agenda:DB.agenda||[],
    conductores:DB.conductores||[],
    exportDate:new Date().toISOString()
  };
  const blob=new Blob([JSON.stringify(snap,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='evento_snapshot_'+new Date().toISOString().slice(0,10)+'.json';a.click();
  toast('✅ Snapshot exportado','var(--green)');
}

/* ═══════════════════════════════════════════════════════════════════
   REPORT GENERATOR
   ═══════════════════════════════════════════════════════════════════ */
function _generateReport(snap,recs){
  const ev=getActiveEvent()||{nombre:'Sin evento'};
  const today=new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const sections=[
    `# Reporte Diario — ${ev.nombre||'Evento'}`,
    `**Fecha:** ${today}`,
    ``,
    `## Resumen Ejecutivo`,
    `- **Total registros:** ${snap.all.length}`,
    `- **En recinto:** ${snap.enRecinto.length}`,
    `- **Throughput diario:** ${Math.round(snap.avgDaily)} vehículos/día`,
    `- **Puntualidad:** ${snap.pctOnTime}%`,
    `- **No-shows:** ${snap.pctNoShow}%`,
    `- **Permanencia promedio:** ${_minToH(snap.avgPerm)}`,
    `- **Vehículos atascados:** ${snap.stuck.length}`,
    ``,
    `## Recomendaciones (${recs.length})`,
    ...recs.map((r,i)=>`${i+1}. **[${r.pri}]** ${r.msg}\n   → Acción: ${r.action}\n   → Impacto: ${r.impact}`),
    ``,
    `## Alertas activas`,
    ...(window._ai4.alerts||[]).map(a=>`- **[${a.level}]** ${a.msg} (${a.ts})`),
    ``,
    `---`,
    `*Generado automáticamente por BeUnifyT AI Intelligence*`
  ];
  return sections.join('\n');
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-TAB RENDERS
   ═══════════════════════════════════════════════════════════════════ */
function _renderCommand(snap,t){
  const recs=_localRecommendations(snap);
  window._ai4.recs=recs;
  const alerts=_checkAlerts(snap);
  const priColors={CRITICO:t.red,ALTO:'#ea580c',MEDIO:t.amber,INFO:t.blue};
  let h='';
  // Alert banner
  if(alerts.length)h+=`<div style="background:${t.rll};border:1px solid #fecaca;border-radius:8px;padding:8px;margin-bottom:8px"><div style="font-weight:800;font-size:11px;color:${t.red};margin-bottom:4px">🔔 ${alerts.length} ALERTAS ACTIVAS</div>${alerts.map(a=>`<div style="font-size:10px;margin:2px 0"><span style="font-weight:700;color:${priColors[a.level]||t.text}">[${a.level}]</span> ${a.msg}</div>`).join('')}</div>`;
  // Health score
  const scores=[];
  scores.push(Math.min(100,_pct(snap.conSalida.length,snap.all.length)));
  scores.push(snap.pctOnTime);
  scores.push(100-Math.min(100,_pct(snap.stuck.length,snap.enRecinto.length||1)));
  const health=Math.round(_avg(scores));
  h+=`<div style="display:grid;grid-template-columns:120px 1fr;gap:8px;margin-bottom:8px">`;
  h+=`<div style="text-align:center">`+_card('',`<div style="font-size:36px;font-weight:900;color:${health>=75?t.green:health>=50?t.amber:t.red}">${health}</div><div style="font-size:9px;color:${t.t3}">HEALTH SCORE</div><div style="font-size:8px;color:${t.t3}">/100</div>`,t,health>=75?t.green:health>=50?t.amber:t.red)+`</div>`;
  // Recommendations
  h+=`<div>`;
  h+=_card(`🧠 ${recs.length} Recomendaciones inteligentes`,recs.length?`<div style="max-height:400px;overflow-y:auto">${recs.map((r,i)=>`<div style="display:flex;gap:8px;padding:6px;margin:3px 0;background:${t.bg3};border-radius:6px;border-left:3px solid ${priColors[r.pri]||t.blue}"><div style="font-size:16px;flex-shrink:0">${r.ico}</div><div style="flex:1"><div style="display:flex;align-items:center;gap:4px;margin-bottom:2px"><span style="font-size:9px;font-weight:900;padding:1px 6px;border-radius:10px;background:${priColors[r.pri]};color:#fff">${r.pri}</span><span style="font-size:9px;color:${t.t3}">${r.cat}</span></div><div style="font-size:11px;font-weight:600">${r.msg}</div><div style="font-size:10px;color:${t.teal};margin-top:2px">→ ${r.action}</div><div style="font-size:9px;color:${t.t3};margin-top:1px">Impacto: ${r.impact}</div></div></div>`).join('')}</div>`:'<div style="text-align:center;padding:20px;color:'+t.t3+'">✅ Todo funcionando correctamente</div>',t);
  h+=`</div></div>`;
  return h;
}

function _renderSimulador(snap,t){
  const sim=window._ai4.sim;
  const halls=snap.halls;
  const results=_simulate(snap);
  sim.results=results;
  const {baseline,simulated,delta}=results;
  const deltaColor=(v,inv)=>{const pos=inv?v<0:v>0;return pos?t.green:v===0?t.t3:t.red;};
  const deltaSign=(v)=>v>0?'+'+v:v;

  let h=`<div style="display:grid;grid-template-columns:280px 1fr;gap:8px">`;
  // Controls panel
  h+=`<div>`+_card('🎛 Parámetros del escenario',`<div style="display:flex;flex-direction:column;gap:6px;font-size:11px">
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Throughput Δ%</label><input type="range" min="-50" max="100" value="${sim.params.throughputDelta}" oninput="window._ai4.sim.params.throughputDelta=+this.value;renderAnalytics4()" style="width:100%"><span style="font-size:10px;font-weight:700">${sim.params.throughputDelta>0?'+':''}${sim.params.throughputDelta}%</span></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">No-show extra %</label><input type="range" min="0" max="50" value="${sim.params.noShowPct}" oninput="window._ai4.sim.params.noShowPct=+this.value;renderAnalytics4()" style="width:100%"><span style="font-size:10px">${sim.params.noShowPct}%</span></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Operadores extra</label><input type="range" min="-3" max="10" value="${sim.params.extraOps}" oninput="window._ai4.sim.params.extraOps=+this.value;renderAnalytics4()" style="width:100%"><span style="font-size:10px">${sim.params.extraOps>0?'+':''}${sim.params.extraOps}</span></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Horas extra/menos</label><input type="range" min="-6" max="6" value="${sim.params.hoursChange}" oninput="window._ai4.sim.params.hoursChange=+this.value;renderAnalytics4()" style="width:100%"><span style="font-size:10px">${sim.params.hoursChange>0?'+':''}${sim.params.hoursChange}h</span></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Impacto clima %</label><input type="range" min="0" max="50" value="${sim.params.weatherImpact}" oninput="window._ai4.sim.params.weatherImpact=+this.value;renderAnalytics4()" style="width:100%"><span style="font-size:10px">-${sim.params.weatherImpact}%</span></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Cerrar hall</label><select onchange="window._ai4.sim.params.hallClosed=this.value;renderAnalytics4()" style="width:100%"><option value="">Ninguno</option>${halls.map(h2=>`<option value="${h2}" ${sim.params.hallClosed===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Redistribuir de</label><select onchange="window._ai4.sim.params.redistributeFrom=this.value;renderAnalytics4()" style="width:100%"><option value="">—</option>${halls.map(h2=>`<option value="${h2}" ${sim.params.redistributeFrom===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Redistribuir a</label><select onchange="window._ai4.sim.params.redistributeTo=this.value;renderAnalytics4()" style="width:100%"><option value="">—</option>${halls.map(h2=>`<option value="${h2}" ${sim.params.redistributeTo===h2?'selected':''}>${h2}</option>`).join('')}</select></div>
    <button class="btn btn-xs btn-gh" onclick="window._ai4.sim.params={throughputDelta:0,hallClosed:'',noShowPct:0,extraOps:0,hoursChange:0,weatherImpact:0,redistributeFrom:'',redistributeTo:''};renderAnalytics4()">↺ Reset</button>
    <button class="btn btn-xs btn-p" onclick="window._ai4.sim.history.push({...window._ai4.sim.results,ts:new Date().toLocaleTimeString()});toast('✅ Guardado','var(--green)')">💾 Guardar escenario</button>
  </div>`,t,'#8b5cf6')+`</div>`;

  // Results panel
  h+=`<div>`;
  // Comparison table
  h+=_card('📊 Baseline vs Simulación',`<table style="width:100%;font-size:11px;border-collapse:collapse"><tr style="background:${t.bg3};font-weight:700"><th style="padding:6px;text-align:left">Métrica</th><th style="text-align:center">Actual</th><th style="text-align:center">Simulado</th><th style="text-align:center">Δ</th></tr>
    <tr style="border-bottom:1px solid ${t.bd}"><td style="padding:6px">🚛 Throughput/día</td><td style="text-align:center;font-weight:700">${baseline.throughput}</td><td style="text-align:center;font-weight:700;color:${deltaColor(delta.throughput)}">${simulated.throughput}</td><td style="text-align:center;color:${deltaColor(delta.throughput)};font-weight:700">${deltaSign(delta.throughput)}</td></tr>
    <tr style="border-bottom:1px solid ${t.bd}"><td style="padding:6px">⏱ Puntualidad %</td><td style="text-align:center">${baseline.puntualidad}%</td><td style="text-align:center;color:${deltaColor(delta.puntualidad)}">${simulated.puntualidad}%</td><td style="text-align:center;color:${deltaColor(delta.puntualidad)}">${deltaSign(delta.puntualidad)}%</td></tr>
    <tr style="border-bottom:1px solid ${t.bd}"><td style="padding:6px">👻 No-show %</td><td style="text-align:center">${baseline.noShow}%</td><td style="text-align:center;color:${deltaColor(delta.noShow,true)}">${simulated.noShow}%</td><td style="text-align:center;color:${deltaColor(delta.noShow,true)}">${deltaSign(delta.noShow)}%</td></tr>
    <tr style="border-bottom:1px solid ${t.bd}"><td style="padding:6px">📅 Días para completar</td><td style="text-align:center">${baseline.daysToComplete===999?'∞':baseline.daysToComplete}</td><td style="text-align:center;font-weight:700;color:${deltaColor(-delta.days)}">${simulated.daysToComplete===999?'∞':simulated.daysToComplete}</td><td style="text-align:center;color:${deltaColor(-delta.days)}">${delta.days>0?'+':''}${delta.days}d</td></tr>
    <tr><td style="padding:6px">💰 Costo retrasos €</td><td style="text-align:center">€${baseline.cost}</td><td style="text-align:center;color:${deltaColor(-delta.cost)}">${simulated.cost}</td><td style="text-align:center;color:${deltaColor(-delta.cost,true)}">${deltaSign(delta.cost)}€</td></tr>
  </table>`,t);
  // Hall distribution comparison
  h+=`<div style="margin-top:8px">`+_card('🏟 Distribución por Hall',`<div style="display:flex;gap:4px;flex-wrap:wrap">${halls.map(h2=>{const base=baseline.byHall[h2]||0;const sim2=simulated.byHall[h2]||0;const d=sim2-base;return`<div style="text-align:center;background:${t.bg3};border-radius:6px;padding:6px 10px;min-width:55px"><div style="font-weight:900;font-size:9px">${h2}</div><div style="font-size:12px;font-weight:700">${base}→<span style="color:${d>0?t.red:d<0?t.green:t.t3}">${sim2}</span></div>${d!==0?`<div style="font-size:9px;color:${d>0?t.red:t.green}">${d>0?'+':''}${d}</div>`:''}</div>`;}).join('')}</div>`,t)+`</div>`;
  // History
  if(sim.history.length)h+=`<div style="margin-top:8px">`+_card('📋 Escenarios guardados',`<div style="max-height:150px;overflow-y:auto">${sim.history.map((s,i)=>`<div style="font-size:10px;margin:2px 0;padding:4px;background:${t.bg3};border-radius:4px"><b>#${i+1}</b> (${s.ts}) Through: ${s.baseline.throughput}→${s.simulated.throughput} | Días: ${s.baseline.daysToComplete}→${s.simulated.daysToComplete}</div>`).join('')}</div>`,t)+`</div>`;
  h+=`</div></div>`;
  return h;
}

function _renderAIConfig(snap,t){
  const ai=window._ai4.ai;
  let h='';
  h+=_card('🤖 Configuración AI',`<div style="display:flex;flex-direction:column;gap:8px">
    ${Object.entries(ai).map(([key,cfg])=>`<div style="display:flex;align-items:center;gap:8px;padding:8px;background:${t.bg3};border-radius:6px">
      <label style="cursor:pointer;display:flex;align-items:center;gap:4px" onclick="window._ai4.ai.${key}.enabled=!window._ai4.ai.${key}.enabled;renderAnalytics4()"><span style="font-size:14px;width:20px;height:20px;border:2px solid ${cfg.enabled?t.blue:t.bd};border-radius:4px;display:flex;align-items:center;justify-content:center;background:${cfg.enabled?t.blue:'transparent'};color:#fff;font-weight:900">${cfg.enabled?'✓':''}</span><span style="font-size:12px;font-weight:700">${cfg.label}</span></label>
      <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${cfg.free?t.gll:t.all};color:${cfg.free?t.green:t.amber}">${cfg.free?'GRATIS':'DE PAGO'}</span>
      <span style="font-size:10px;color:${t.t3};flex:1">${cfg.note}</span>
      ${key==='anthropic'&&cfg.enabled?`<input type="password" placeholder="API Key..." value="${cfg.key||''}" onchange="window._ai4.ai.anthropic.key=this.value" style="font-size:10px;width:200px">`:''} 
    </div>`).join('')}
  </div>`,t);
  // Run AI analysis button
  h+=`<div style="margin-top:8px;display:flex;gap:6px">`;
  h+=`<button class="btn btn-sm btn-p" onclick="window._op._ai4RunLocal()">🧠 Análisis Local</button>`;
  if(ai.anthropic.enabled)h+=`<button class="btn btn-sm" style="background:#8b5cf6;color:#fff;border:none;border-radius:20px" onclick="window._op._ai4RunAI()">🤖 Análisis AI</button>`;
  h+=`</div>`;
  // Alertas config
  h+=`<div style="margin-top:8px">`+_card('🔔 Configuración de alertas',`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11px">
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Horas atascado</label><input type="number" value="${window._ai4.alertsCfg.stuckHours}" onchange="window._ai4.alertsCfg.stuckHours=+this.value" style="width:100%"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">No-show umbral %</label><input type="number" value="${window._ai4.alertsCfg.noShowPct}" onchange="window._ai4.alertsCfg.noShowPct=+this.value" style="width:100%"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Throughput mínimo</label><input type="number" value="${window._ai4.alertsCfg.throughputMin}" onchange="window._ai4.alertsCfg.throughputMin=+this.value" style="width:100%"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Ocupación máx %</label><input type="number" value="${window._ai4.alertsCfg.occupancyMax}" onchange="window._ai4.alertsCfg.occupancyMax=+this.value" style="width:100%"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Retraso máx (min)</label><input type="number" value="${window._ai4.alertsCfg.retrasoMax}" onchange="window._ai4.alertsCfg.retrasoMax=+this.value" style="width:100%"></div>
  </div>`,t)+`</div>`;
  return h;
}

function _renderEventos(snap,t){
  const imported=window._ai4.importedEvents;
  let h='';
  h+=`<div style="display:flex;gap:6px;margin-bottom:8px">
    <button class="btn btn-sm btn-p" onclick="window._op._ai4Import()">📥 Importar evento</button>
    <button class="btn btn-sm btn-gh" onclick="window._op._ai4ExportSnap()">📤 Exportar actual</button>
  </div>`;
  if(imported.length){
    h+=imported.map((ev,idx)=>{
      const data=Array.isArray(ev.data)?ev.data:(ev.data.ingresos||[]);
      const total=data.length;
      const conSalida=data.filter(i=>i.salida).length;
      const perms=data.map(_permanencia).filter(x=>x!==null&&x>0);
      const avgP=Math.round(_avg(perms));
      const byHall=_countBy(data,'hall');
      return _card(`📋 ${ev.name}`,`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:6px">
        <div style="text-align:center;background:${t.bg3};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${t.blue}">${total}</div><div style="font-size:8px;color:${t.t3}">Registros</div></div>
        <div style="text-align:center;background:${t.bg3};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${t.green}">${conSalida}</div><div style="font-size:8px;color:${t.t3}">Con salida</div></div>
        <div style="text-align:center;background:${t.bg3};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${t.teal}">${_minToH(avgP)}</div><div style="font-size:8px;color:${t.t3}">Perm. prom</div></div>
        <div style="text-align:center;background:${t.bg3};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${t.purple}">${byHall.length}</div><div style="font-size:8px;color:${t.t3}">Halls</div></div>
      </div>
      <div style="font-size:9px;color:${t.t3}">Importado: ${ev.ts?.slice(0,10)||'?'} · <button class="btn btn-xs btn-gh" onclick="window._ai4.importedEvents.splice(${idx},1);renderAnalytics4()">🗑 Eliminar</button></div>`,t);
    }).join('<div style="margin:6px 0"></div>');
    // Comparison table vs current
    h+=`<div style="margin-top:8px">`+_card('🔄 Comparativa: Actual vs Importados',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3};font-weight:700"><th style="padding:4px 6px;text-align:left">Evento</th><th>Registros</th><th>Completados</th><th>Perm. prom</th></tr>
      <tr style="border-bottom:1px solid ${t.bd};background:${t.bll}"><td style="padding:4px 6px;font-weight:700">📍 ACTUAL</td><td style="text-align:center">${snap.all.length}</td><td style="text-align:center">${_pct(snap.conSalida.length,snap.all.length)}%</td><td style="text-align:center">${_minToH(snap.avgPerm)}</td></tr>
      ${imported.map(ev=>{const data=Array.isArray(ev.data)?ev.data:(ev.data.ingresos||[]);const t2=data.length;const cs=data.filter(i=>i.salida).length;const ap=Math.round(_avg(data.map(_permanencia).filter(x=>x!==null&&x>0)));return`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:4px 6px">${ev.name}</td><td style="text-align:center">${t2}</td><td style="text-align:center">${_pct(cs,t2)}%</td><td style="text-align:center">${_minToH(ap)}</td></tr>`;}).join('')}
    </table>`,t)+`</div>`;
  }else{
    h+=`<div style="text-align:center;padding:40px;color:${t.t3}"><div style="font-size:28px;margin-bottom:8px">📦</div>Sin eventos importados. Importa snapshots de eventos anteriores para comparar.</div>`;
  }
  return h;
}

function _renderReporte(snap,t){
  const recs=window._ai4.recs.length?window._ai4.recs:_localRecommendations(snap);
  const report=_generateReport(snap,recs);
  window._ai4.lastReport=report;
  return _card('📄 Reporte automático',`<div style="background:${t.bg3};border-radius:6px;padding:12px;font-size:11px;max-height:500px;overflow-y:auto;white-space:pre-wrap;font-family:'JetBrains Mono',monospace;line-height:1.6">${esc(report)}</div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-sm btn-p" onclick="window._op._ai4CopyReport()">📋 Copiar</button><button class="btn btn-sm btn-gh" onclick="window._op._ai4DownloadReport()">⬇ Descargar .md</button></div>`,t);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN RENDER
   ═══════════════════════════════════════════════════════════════════ */
export function renderAnalytics4(){
  const el=document.getElementById('tabContent');if(!el)return;
  const S=window._ai4;const t=_t();const snap=_snap();

  const subs=[
    ['command','🧠 Centro de mando'],['simulador','🎛 Simulador'],
    ['eventos','📦 Eventos'],['reporte','📄 Reporte'],['aiconfig','🤖 AI Config']
  ];

  let h=`<div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center;margin-bottom:6px;border-bottom:1px solid ${t.bd};padding-bottom:6px">`;
  h+=subs.map(([id,l])=>`<button class="btn btn-xs ${S.sub===id?'btn-p':'btn-gh'}" onclick="window._ai4.sub='${id}';renderAnalytics4()">${l}</button>`).join('');
  h+=`<span style="flex:1"></span>`;
  const activeAI=Object.entries(S.ai).filter(([k,v])=>v.enabled).map(([k,v])=>v.label);
  h+=`<span style="font-size:9px;color:${t.t3}">AI: ${activeAI.join(', ')||'ninguna'}</span>`;
  h+=`</div>`;

  switch(S.sub){
    case 'simulador':h+=_renderSimulador(snap,t);break;
    case 'eventos':h+=_renderEventos(snap,t);break;
    case 'reporte':h+=_renderReporte(snap,t);break;
    case 'aiconfig':h+=_renderAIConfig(snap,t);break;
    default:h+=_renderCommand(snap,t);
  }
  el.innerHTML=h;
}

/* ═══════════════════════════════════════════════════════════════════
   ACTIONS
   ═══════════════════════════════════════════════════════════════════ */
function _ai4RunLocal(){
  const snap=_snap();
  window._ai4.recs=_localRecommendations(snap);
  toast(`🧠 ${window._ai4.recs.length} recomendaciones generadas`,'var(--green)');
  window._ai4.sub='command';
  renderAnalytics4();
}

async function _ai4RunAI(){
  toast('🤖 Consultando AI...','var(--blue)');
  const snap=_snap();
  const aiRecs=await _aiAnalysis(snap);
  if(aiRecs&&Array.isArray(aiRecs)){
    window._ai4.recs=[...aiRecs,..._localRecommendations(snap)];
    toast(`🤖 ${aiRecs.length} recomendaciones AI + ${_localRecommendations(snap).length} locales`,'var(--green)');
  }
  window._ai4.sub='command';
  renderAnalytics4();
}

function _ai4CopyReport(){
  if(window._ai4.lastReport){navigator.clipboard.writeText(window._ai4.lastReport);toast('📋 Copiado','var(--green)');}
}

function _ai4DownloadReport(){
  if(!window._ai4.lastReport)return;
  const blob=new Blob([window._ai4.lastReport],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='reporte_'+new Date().toISOString().slice(0,10)+'.md';a.click();
  toast('✅ Descargado','var(--green)');
}

registerFn('renderAnalytics4',renderAnalytics4);
registerFn('_ai4RunLocal',_ai4RunLocal);
registerFn('_ai4RunAI',_ai4RunAI);
registerFn('_ai4Import',_importEventData);
registerFn('_ai4ExportSnap',_exportSnapshot);
registerFn('_ai4CopyReport',_ai4CopyReport);
registerFn('_ai4DownloadReport',_ai4DownloadReport);
window.renderAnalytics4=renderAnalytics4;
