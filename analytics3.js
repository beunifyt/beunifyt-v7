// BeUnifyT v8 — tabs/analytics3.js — Precision Analytics (Logistics Intelligence)
// 80+ métricas de logística: flujo, montaje/desmontaje, puntualidad, capacidad, anomalías, predicciones, eficiencia, benchmarks
import { DB, iF, SID, registerFn, callFn, agF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, tr, TV, PP, SCFG, CCFG, HALLS, TRACKING_STEPS } from '../core/shared.js';
import { isSA, isSup, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB } from '../core/db.js';
import { toast, uid, nowLocal } from '../utils.js';

/* ═══════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════ */
if(!window._pa3){window._pa3={
  sub:'resumen',dateFrom:'',dateTo:'',hall:'',empresa:'',
  cfg:{totalTrailers:1100,montajeDias:7,desmontajeDias:3,horasOp:14,costoHoraRetraso:150,capacidadHall:{},slaMin:10,turnoM:'06:00',turnoT:'14:00',turnoN:'22:00'},
  targets:{throughputHora:20,puntualidadPct:85,noShowPct:5,permanenciaMax:180},
  compare:null
};}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const _t=()=>{const r=document.documentElement;const s=getComputedStyle(r);const g=v=>s.getPropertyValue(v).trim()||v;return{bg:g('--bg'),bg2:g('--bg2'),bg3:g('--bg3'),bg4:g('--bg4'),text:g('--text'),t2:g('--text2'),t3:g('--text3'),bd:g('--border'),bd2:g('--border2'),blue:g('--blue'),bll:g('--bll'),green:g('--green'),gll:g('--gll'),red:g('--red'),rll:g('--rll'),amber:g('--amber'),all:g('--all'),purple:g('--purple'),teal:g('--teal'),r:g('--r'),sh:g('--sh'),acc:'#2563eb',abg:'#eef2ff',card:g('--bg2'),inp:g('--bg3')};};

const _card=(title,body,t,color)=>`<div style="background:${t.card};border:1px solid ${t.bd};border-radius:8px;padding:10px;box-shadow:${t.sh};${color?'border-top:3px solid '+color:''}">${title?`<div style="font-weight:800;font-size:11px;margin-bottom:6px;color:${t.t2}">${title}</div>`:''}${body}</div>`;

const _kpi=(label,value,sub,color,t)=>`<div style="text-align:center;padding:8px"><div style="font-size:22px;font-weight:900;color:${color||t.blue};line-height:1.1">${value}</div><div style="font-size:9px;font-weight:700;color:${t.t3};margin-top:2px">${label}</div>${sub?`<div style="font-size:8px;color:${t.t3};margin-top:1px">${sub}</div>`:''}</div>`;

const _bar=(items,color,t,max)=>{if(!items.length)return`<div style="padding:6px;text-align:center;font-size:10px;color:${t.t3}">Sin datos</div>`;const mx=max||Math.max(...items.map(x=>x[1]),1);return items.map(([k,v])=>`<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="font-size:9px;min-width:60px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t.t2}">${esc(k)}</span><div style="flex:1;height:12px;background:${t.bg3};border-radius:6px;overflow:hidden"><div style="height:100%;width:${Math.round(v/mx*100)}%;background:${color};border-radius:6px;transition:width .3s"></div></div><span style="font-size:9px;font-weight:700;color:${t.text};min-width:28px;text-align:right">${typeof v==='number'&&v%1!==0?v.toFixed(1):v}</span></div>`).join('');};

const _spark=(arr,color,w=240,h=50)=>{if(arr.length<2)return'';const mx=Math.max(...arr.map(x=>x[1]),1);const step=w/(arr.length-1);const pts=arr.map((x,i)=>`${i*step},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');const area=pts+` ${w},${h} 0,${h}`;return`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;display:block"><defs><linearGradient id="sg3_${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0.02"/></linearGradient></defs><polygon points="${area}" fill="url(#sg3_${color.replace('#','')})" /><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;};

const _donut=(items,colors,size=90)=>{if(!items.length)return'';const total=items.reduce((a,x)=>a+x[1],0);if(!total)return'';const cx=size/2,cy=size/2,r=size/2-4,r2=r*0.55;let angle=-90;let paths='';const clrs=colors||['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#64748b','#84cc16','#f97316'];items.forEach(([k,v],i)=>{const pct=v/total;const a1=angle*Math.PI/180;angle+=pct*360;const a2=angle*Math.PI/180;const large=pct>0.5?1:0;const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),x3=cx+r2*Math.cos(a2),y3=cy+r2*Math.sin(a2),x4=cx+r2*Math.cos(a1),y4=cy+r2*Math.sin(a1);if(pct>0.001)paths+=`<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 ${large} 0 ${x4},${y4} Z" fill="${clrs[i%clrs.length]}" opacity="0.85"/>`;});return`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">${total}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5">total</text></svg>`;};

const _semaforo=(val,green,yellow)=>{if(val>=green)return'🟢';if(val>=yellow)return'🟡';return'🔴';};
const _pct=(a,b)=>b?Math.round(a/b*100):0;
const _avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const _median=(arr)=>{if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const _p95=(arr)=>{if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b);return s[Math.floor(s.length*0.95)]||s[s.length-1];};
const _std=(arr)=>{const m=_avg(arr);return Math.sqrt(_avg(arr.map(x=>(x-m)*(x-m))));};
const _minToH=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?String(Math.round(m%60)).padStart(2,'0')+'m':''}`:`${Math.round(m)}m`;
const _countBy=(arr,key)=>{const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
const _sumBy=(arr,key,valKey)=>{const m={};arr.forEach(i=>{const k=i[key];if(k){if(!m[k])m[k]={sum:0,count:0};m[k].sum+=(i[valKey]||0);m[k].count++;}});return m;};
const _dayKey=(ts)=>(ts||'').slice(0,10);
const _hourKey=(ts)=>(ts||'').slice(11,13);
const _timeHist=(arr,field)=>{const m={};arr.forEach(i=>{const d=_dayKey(i[field||'entrada']);if(d)m[d]=(m[d]||0)+1;});return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));};
const _hourHist=(arr,field)=>{const m={};for(let h=0;h<24;h++)m[String(h).padStart(2,'0')]=0;arr.forEach(i=>{const t=_hourKey(i[field||'entrada']);if(t)m[t]=(m[t]||0)+1;});return Object.entries(m).sort();};

// Permanencia en minutos
const _permanencia=(i)=>{if(!i.entrada||!i.salida)return null;return(new Date(i.salida)-new Date(i.entrada))/60000;};
// Tracking step durations
const _trackDurations=(i)=>{if(!i.tracking||!Array.isArray(i.tracking))return[];const steps=i.tracking.sort((a,b)=>(a.ts||'').localeCompare(b.ts||''));const durs=[];for(let j=1;j<steps.length;j++){const d=(new Date(steps[j].ts)-new Date(steps[j-1].ts))/60000;durs.push({from:steps[j-1].step,to:steps[j].step,min:d});}return durs;};

// Turno classification
const _turno=(ts,cfg)=>{const h=parseInt(_hourKey(ts)||'0');const tM=parseInt((cfg.turnoM||'06:00').split(':')[0]);const tT=parseInt((cfg.turnoT||'14:00').split(':')[0]);const tN=parseInt((cfg.turnoN||'22:00').split(':')[0]);if(h>=tM&&h<tT)return'Mañana';if(h>=tT&&h<tN)return'Tarde';return'Noche';};

// Moving average forecast
const _forecast=(series,days=3)=>{if(series.length<3)return[];const vals=series.map(x=>x[1]);const ma=[];for(let i=0;i<days;i++){const window=vals.slice(-Math.min(5,vals.length));const avg=_avg(window);const lastDate=new Date(series[series.length-1][0]);lastDate.setDate(lastDate.getDate()+i+1);ma.push([lastDate.toISOString().slice(0,10),Math.round(avg)]);}return ma;};

// Curva S (acumulado)
const _curvaS=(daily,totalExpected)=>{let cum=0;return daily.map(([d,v])=>{cum+=v;return[d,cum,totalExpected];});};

/* ═══════════════════════════════════════════════════════════════════
   DATA AGGREGATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */
function _computeAll(){
  const S=window._pa3;const cfg=S.cfg;const tgt=S.targets;
  const ev=getActiveEvent();
  // All records
  let ref=[...DB.ingresos];let ing=[...DB.ingresos2];let mov=[...DB.movimientos||[]];let ag=[...DB.agenda||[]];let cond=[...DB.conductores||[]];let emp=[...DB.empresas||[]];
  // Date filter
  const fD=S.dateFrom,fDt=S.dateTo;
  const filterDate=(arr,field='entrada')=>{let r=arr;if(fD)r=r.filter(i=>(i[field]||i.ts||'')>=fD);if(fDt)r=r.filter(i=>(i[field]||i.ts||'')<=fDt+'T23:59');return r;};
  ref=filterDate(ref);ing=filterDate(ing);mov=filterDate(mov,'ts');ag=filterDate(ag,'fecha');
  // Hall filter
  if(S.hall){ref=ref.filter(i=>i.hall===S.hall||(i.halls||[]).includes(S.hall));ing=ing.filter(i=>i.hall===S.hall||(i.halls||[]).includes(S.hall));mov=mov.filter(i=>i.hall===S.hall);ag=ag.filter(i=>i.hall===S.hall);}
  // Empresa filter
  if(S.empresa){ref=ref.filter(i=>i.empresa===S.empresa);ing=ing.filter(i=>i.empresa===S.empresa);mov=mov.filter(i=>i.empresa===S.empresa);ag=ag.filter(i=>i.empresa===S.empresa);}

  const all=[...ref,...ing];
  const today=new Date().toISOString().slice(0,10);
  const nowMs=Date.now();
  const halls=getRecintoHalls();

  // ─── 1. FLUJO ───
  const throughputByDay=_timeHist(all,'entrada');
  const throughputByHour=_hourHist(all,'entrada');
  const enRecinto=all.filter(i=>i.entrada&&!i.salida);
  const conSalida=all.filter(i=>i.salida);
  const hoy=all.filter(i=>(i.entrada||'').startsWith(today));
  const permanencias=all.map(_permanencia).filter(x=>x!==null&&x>0);
  const avgPerm=Math.round(_avg(permanencias));
  const medPerm=Math.round(_median(permanencias));
  const p95Perm=Math.round(_p95(permanencias));
  const maxPerm=permanencias.length?Math.round(Math.max(...permanencias)):0;
  
  // Ratio entrada/salida por hora
  const entradaByHour=_hourHist(all,'entrada');
  const salidaByHour=_hourHist(conSalida,'salida');
  const flujoNeto=entradaByHour.map(([h,e])=>{const s=(salidaByHour.find(x=>x[0]===h)||[h,0])[1];return[h,e-s];});

  // Ocupación por hall
  const ocupByHall=halls.map(h=>{const inH=enRecinto.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;const cap=cfg.capacidadHall[h]||50;return{hall:h,ocup:inH,cap,pct:_pct(inH,cap)};});

  // Throughput por hall
  const throughputHall=_countBy(all,'hall').slice(0,12);

  // Cola estimada (en tracking step 'rampa' sin avanzar)
  const enCola=all.filter(i=>{if(!i.tracking||i.salida)return false;const last=i.tracking[i.tracking.length-1];return last&&(last.step==='rampa'||last.step==='cabina');}).length;

  // Tiempo entre steps
  const allTrackDurs=[];
  all.forEach(i=>{_trackDurations(i).forEach(d=>allTrackDurs.push(d));});
  const stepAvgs={};
  allTrackDurs.forEach(d=>{const k=d.from+'→'+d.to;if(!stepAvgs[k])stepAvgs[k]=[];stepAvgs[k].push(d.min);});
  const bottlenecks=Object.entries(stepAvgs).map(([k,arr])=>({step:k,avg:Math.round(_avg(arr)),max:Math.round(Math.max(...arr)),count:arr.length})).sort((a,b)=>b.avg-a.avg);

  // Eficiencia por turno
  const byTurno={};
  all.forEach(i=>{const t=_turno(i.entrada,cfg);byTurno[t]=(byTurno[t]||0)+1;});

  // ─── 2. MONTAJE / DESMONTAJE ───
  const evData=ev||{};
  const evIni=evData.ini||'';const evFin=evData.fin||'';
  const montajeDias=cfg.montajeDias||7;const desmontajeDias=cfg.desmontajeDias||3;
  const totalTrailers=cfg.totalTrailers||1100;
  
  // Calcular fase actual
  let fase='pre';
  if(evIni&&evFin){
    const hoy2=new Date(today);const ini=new Date(evIni);const fin=new Date(evFin);
    const montajeEnd=new Date(ini);// montaje es antes del inicio
    const desmontajeStart=new Date(fin);
    if(hoy2<ini)fase='montaje';
    else if(hoy2>fin)fase='desmontaje';
    else fase='evento';
  }

  // Progreso por hall por día
  const dailyByHall={};
  halls.forEach(h=>{
    const hallItems=all.filter(i=>i.hall===h||(i.halls||[]).includes(h));
    dailyByHall[h]=_timeHist(hallItems,'entrada');
  });

  // Curva S
  const dailyAll=throughputByDay;
  const curvaReal=_curvaS(dailyAll,totalTrailers);
  // Ideal: trailers/días distribuidos uniformemente
  const idealPerDay=Math.ceil(totalTrailers/(fase==='desmontaje'?desmontajeDias:montajeDias));

  // ETA por hall
  const etaByHall=halls.map(h=>{
    const done=all.filter(i=>(i.hall===h||(i.halls||[]).includes(h))&&i.salida).length;
    const total=all.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;
    const dailyH=dailyByHall[h]||[];
    const lastDays=dailyH.slice(-3);
    const avgDaily=lastDays.length?_avg(lastDays.map(x=>x[1])):0;
    const remaining=total-done;
    const etaDays=avgDaily>0?Math.ceil(remaining/avgDaily):999;
    return{hall:h,done,total,remaining,avgDaily:Math.round(avgDaily),etaDays};
  });

  // Velocidad de vaciado (desmontaje)
  const salidaByDay=_timeHist(conSalida,'salida');
  const vaciadoRate=salidaByDay.length?_avg(salidaByDay.slice(-3).map(x=>x[1])):0;

  // ─── 3. PUNTUALIDAD ───
  const agCompleted=ag.filter(a=>a.horaReal);
  const agOnTime=agCompleted.filter(a=>{const d=diffMins(a.hora,a.horaReal);return d!==null&&Math.abs(d)<=tgt.slaMin||cfg.slaMin||10;});
  const pctOnTime=_pct(agOnTime.length,agCompleted.length);
  const agNoShow=ag.filter(a=>a.estado==='PENDIENTE'&&a.fecha<today);
  const pctNoShow=_pct(agNoShow.length,ag.length);
  const retrasos=agCompleted.map(a=>diffMins(a.hora,a.horaReal)).filter(d=>d!==null&&d>0);
  const avgRetraso=Math.round(_avg(retrasos));
  
  // Retraso por empresa
  const retrasoEmpresa={};
  agCompleted.forEach(a=>{if(!a.empresa)return;const d=diffMins(a.hora,a.horaReal);if(d===null)return;if(!retrasoEmpresa[a.empresa])retrasoEmpresa[a.empresa]={sum:0,count:0,late:0};retrasoEmpresa[a.empresa].sum+=d;retrasoEmpresa[a.empresa].count++;if(d>10)retrasoEmpresa[a.empresa].late++;});
  const empRetrasoRank=Object.entries(retrasoEmpresa).map(([e,d])=>({empresa:e,avg:Math.round(d.sum/d.count),pctLate:_pct(d.late,d.count),count:d.count})).sort((a,b)=>b.avg-a.avg);

  // Retraso por conductor
  const retrasoCond={};
  agCompleted.forEach(a=>{if(!a.conductor)return;const d=diffMins(a.hora,a.horaReal);if(d===null)return;if(!retrasoCond[a.conductor])retrasoCond[a.conductor]={sum:0,count:0};retrasoCond[a.conductor].sum+=d;retrasoCond[a.conductor].count++;});
  const condRetrasoRank=Object.entries(retrasoCond).map(([c,d])=>({conductor:c,avg:Math.round(d.sum/d.count),count:d.count})).sort((a,b)=>b.avg-a.avg);

  // Distribución retrasos histograma
  const retrasoHist={'<5m':0,'5-10m':0,'10-20m':0,'20-30m':0,'30-60m':0,'>60m':0};
  retrasos.forEach(d=>{if(d<5)retrasoHist['<5m']++;else if(d<10)retrasoHist['5-10m']++;else if(d<20)retrasoHist['10-20m']++;else if(d<30)retrasoHist['20-30m']++;else if(d<60)retrasoHist['30-60m']++;else retrasoHist['>60m']++;});

  // Hora pico real vs planificada
  const agByHourPlan={};const agByHourReal={};
  ag.forEach(a=>{const hp=(a.hora||'').slice(0,2);if(hp)agByHourPlan[hp]=(agByHourPlan[hp]||0)+1;const hr=(a.horaReal||'').slice(0,2);if(hr)agByHourReal[hr]=(agByHourReal[hr]||0)+1;});

  // ─── 4. CAPACIDAD ───
  const descTipos=_countBy(all,'descargaTipo');
  const descTiempos={mano:[],maquinaria:[],mixto:[]};
  all.forEach(i=>{if(!i.descargaTipo||!i.entrada||!i.salida)return;const m=_permanencia(i);if(m>0&&m<600)descTiempos[i.descargaTipo]?.push(m);});
  const descAvg={mano:Math.round(_avg(descTiempos.mano)),maquinaria:Math.round(_avg(descTiempos.maquinaria)),mixto:Math.round(_avg(descTiempos.mixto))};

  // Balance de carga (desviación estándar entre halls)
  const hallCounts=halls.map(h=>all.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length);
  const balanceStd=Math.round(_std(hallCounts));

  // Conflicto de stand (2+ en mismo stand al mismo tiempo)
  const standConflicts=[];
  const activeByStand={};
  enRecinto.forEach(i=>{if(!i.stand||!i.hall)return;const k=i.hall+'-'+i.stand;if(!activeByStand[k])activeByStand[k]=[];activeByStand[k].push(i);});
  Object.entries(activeByStand).forEach(([k,items])=>{if(items.length>1)standConflicts.push({stand:k,count:items.length,items:items.map(i=>i.matricula)});});

  // Rotación por slot
  const rotByHall={};
  halls.forEach(h=>{const hallItems=all.filter(i=>i.hall===h||(i.halls||[]).includes(h));const days=new Set(hallItems.map(i=>_dayKey(i.entrada)).filter(Boolean));rotByHall[h]=days.size?Math.round(hallItems.length/days.size*10)/10:0;});

  // ─── 5. ANOMALÍAS ───
  const stuck=enRecinto.filter(i=>{const mins=(nowMs-new Date(i.entrada).getTime())/60000;return mins>tgt.permanenciaMax||180;});
  const noExit24h=enRecinto.filter(i=>{const hrs=(nowMs-new Date(i.entrada).getTime())/3600000;return hrs>24;});
  const skippedSteps=all.filter(i=>{if(!i.tracking||i.tracking.length<2)return false;const steps=i.tracking.map(t=>t.step);const order=TRACKING_STEPS.map(s=>s.id);let lastIdx=-1;for(const s of steps){const idx=order.indexOf(s);if(idx<lastIdx)return true;lastIdx=idx;}return false;});
  // Horarios muertos
  const deadHours=[];
  const hourCounts=_hourHist(all.filter(i=>(i.entrada||'').startsWith(today)),'entrada');
  const opStart=parseInt((cfg.turnoM||'06:00').split(':')[0]);
  const opEnd=parseInt((cfg.turnoN||'22:00').split(':')[0]);
  hourCounts.forEach(([h,v])=>{const hr=parseInt(h);if(hr>=opStart&&hr<opEnd&&v===0)deadHours.push(h+':00');});

  // Conductor frecuente sin carga
  const condFreq={};
  all.forEach(i=>{const c=i.nombre||i.conductor||'';if(!c)return;if(!condFreq[c])condFreq[c]={entries:0,withCargo:0};condFreq[c].entries++;if(i.descargaTipo&&i.descargaTipo!=='')condFreq[c].withCargo++;});
  const suspiciousCond=Object.entries(condFreq).filter(([c,d])=>d.entries>3&&d.withCargo/d.entries<0.3).map(([c,d])=>({conductor:c,...d}));

  // Inconsistencias tracking vs estado
  const inconsistencias=all.filter(i=>{if(!i.tracking)return false;const last=i.tracking[i.tracking.length-1];if(i.salida&&last&&last.step!=='terminado')return true;return false;});

  // Hall degradándose
  const hallTrend={};
  halls.forEach(h=>{const daily=dailyByHall[h]||[];if(daily.length<3)return;const last3=daily.slice(-3).map(x=>x[1]);const prev3=daily.slice(-6,-3).map(x=>x[1]);if(prev3.length<2)return;const avgLast=_avg(last3);const avgPrev=_avg(prev3);if(avgLast<avgPrev*0.7)hallTrend[h]={drop:Math.round((1-avgLast/avgPrev)*100),avgLast:Math.round(avgLast),avgPrev:Math.round(avgPrev)};});

  // ─── 6. PREDICCIONES ───
  const forecastDays=_forecast(throughputByDay,3);
  // Predicción hora pico mañana (basado en patrón promedio)
  const hourAvgs={};
  all.forEach(i=>{const h=_hourKey(i.entrada);if(h){if(!hourAvgs[h])hourAvgs[h]=[];hourAvgs[h].push(1);}});
  const predictedPeak=Object.entries(hourAvgs).map(([h,arr])=>[h,arr.length]).sort((a,b)=>b[1]-a[1])[0];
  // Proyección desmontaje
  const exitRate=salidaByDay.length>=2?_avg(salidaByDay.slice(-3).map(x=>x[1])):0;
  const remainingInRecinto=enRecinto.length;
  const daysToComplete=exitRate>0?Math.ceil(remainingInRecinto/exitRate):999;
  // Riesgo por hall
  const hallRisk=halls.map(h=>{const inH=enRecinto.filter(i=>i.hall===h||(i.halls||[]).includes(h)).length;const dailyH=dailyByHall[h]||[];const rate=dailyH.length>=2?_avg(dailyH.slice(-2).map(x=>x[1])):0;const daysLeft=rate>0?Math.ceil(inH/rate):999;const risk=daysLeft>(desmontajeDias-((throughputByDay.length||1)-1))?'ALTO':'BAJO';return{hall:h,pending:inH,rate:Math.round(rate),daysNeeded:daysLeft,risk};});

  // ─── 7. EFICIENCIA ───
  const byUser={};
  all.forEach(i=>{const u=i._createdBy||i.userId||'sistema';if(!byUser[u])byUser[u]={count:0,edits:0};byUser[u].count++;});
  (DB.editHistory||[]).forEach(e=>{const u=e.userId||'sistema';if(!byUser[u])byUser[u]={count:0,edits:0};byUser[u].edits++;});
  const userProductivity=Object.entries(byUser).map(([u,d])=>({user:u,registros:d.count,edits:d.edits})).sort((a,b)=>b.registros-a.registros);

  // Errores de datos
  const camposVacios=all.filter(i=>!i.empresa||!i.hall||!i.matricula).length;
  const errorRate=_pct(camposVacios,all.length);

  // Re-trabajo
  const editados=(DB.editHistory||[]).length;
  const retrabajoRate=_pct(editados,all.length);

  // Duplicados (misma matrícula mismo día)
  const dupes={};
  all.forEach(i=>{const k=i.matricula+'_'+_dayKey(i.entrada);dupes[k]=(dupes[k]||0)+1;});
  const dupeCount=Object.values(dupes).filter(v=>v>1).length;

  // Costo de retrasos
  const totalRetrasoMin=retrasos.reduce((a,b)=>a+b,0);
  const costoRetrasos=Math.round(totalRetrasoMin/60*(cfg.costoHoraRetraso||150));

  // ─── 8. COMPARATIVAS ───
  const byTipoVeh=_countBy(all,'tipoVehiculo');
  const byEmpresa=_countBy(all,'empresa').slice(0,15);
  const byDayOfWeek={Lu:0,Ma:0,Mi:0,Ju:0,Vi:0,Sa:0,Do:0};
  const dias=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  all.forEach(i=>{const d=new Date(i.entrada);if(!isNaN(d))byDayOfWeek[dias[d.getDay()]]++;});

  // Benchmark throughput
  const actualThroughputH=hoy.length/Math.max(1,(new Date().getHours()-opStart));
  const targetThroughputH=tgt.throughputHora||20;

  // Event health score
  const scores=[];
  scores.push(Math.min(100,_pct(conSalida.length,all.length)));// completion rate
  scores.push(pctOnTime);// puntualidad
  scores.push(100-Math.min(100,_pct(stuck.length,enRecinto.length||1)));// no stuck
  scores.push(100-errorRate);// data quality
  scores.push(Math.min(100,Math.round(actualThroughputH/targetThroughputH*100)));// throughput
  const healthScore=Math.round(_avg(scores));

  // Countdown
  let countdown=null;
  if(evFin){const diff=Math.ceil((new Date(evFin)-new Date())/(86400000));countdown=diff>0?diff:0;}

  return {
    all,ref,ing,mov,ag,cond,emp,halls,today,
    // Flujo
    throughputByDay,throughputByHour,enRecinto,conSalida,hoy,
    avgPerm,medPerm,p95Perm,maxPerm,permanencias,
    flujoNeto,ocupByHall,throughputHall,enCola,bottlenecks,byTurno,
    // Montaje/desmontaje
    fase,dailyByHall,curvaReal,idealPerDay,etaByHall,vaciadoRate,salidaByDay,
    totalTrailers,montajeDias,desmontajeDias,
    // Puntualidad
    agCompleted,agOnTime,pctOnTime,agNoShow,pctNoShow,retrasos,avgRetraso,
    empRetrasoRank,condRetrasoRank,retrasoHist,agByHourPlan,agByHourReal,
    // Capacidad
    descTipos,descAvg,balanceStd,standConflicts,rotByHall,
    // Anomalías
    stuck,noExit24h,skippedSteps,deadHours,suspiciousCond,inconsistencias,hallTrend,
    // Predicciones
    forecastDays,predictedPeak,exitRate,remainingInRecinto,daysToComplete,hallRisk,
    // Eficiencia
    userProductivity,camposVacios,errorRate,retrabajoRate,editados,dupeCount,costoRetrasos,totalRetrasoMin,
    // Comparativas
    byTipoVeh,byEmpresa,byDayOfWeek,actualThroughputH,targetThroughputH,
    // Salud
    healthScore,countdown,
    cfg,tgt
  };
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-TAB RENDERS
   ═══════════════════════════════════════════════════════════════════ */
function _renderResumen(D,t){
  const {healthScore,countdown,hoy,enRecinto,conSalida,all,avgPerm,enCola,pctOnTime,pctNoShow,actualThroughputH,targetThroughputH,fase,tgt,costoRetrasos}=D;
  let h='';
  // Health + Countdown
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('SALUD EVENTO',`${_semaforo(healthScore,75,50)} ${healthScore}`,'/100',healthScore>=75?t.green:healthScore>=50?t.amber:t.red,t),t,healthScore>=75?t.green:healthScore>=50?t.amber:t.red);
  h+=_card('',_kpi('FASE',fase.toUpperCase(),'','#8b5cf6',t),t,'#8b5cf6');
  if(countdown!==null)h+=_card('',_kpi('COUNTDOWN',countdown,'días restantes',countdown>3?t.blue:t.red,t),t,countdown>3?t.blue:t.red);
  else h+=_card('',_kpi('REGISTROS',all.length,'total',t.blue,t),t);
  h+=_card('',_kpi('HOY',hoy.length,`${Math.round(actualThroughputH)}/h vs ${targetThroughputH}/h obj`,actualThroughputH>=targetThroughputH?t.green:t.amber,t),t);
  h+=_card('',_kpi('EN COLA',enCola,'en rampa/cabina',enCola>10?t.red:t.green,t),t);
  h+=`</div>`;
  // KPI row 2
  h+=`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('EN RECINTO',enRecinto.length,'activos',t.green,t),t);
  h+=_card('',_kpi('CON SALIDA',conSalida.length,_pct(conSalida.length,all.length)+'%',t.blue,t),t);
  h+=_card('',_kpi('PERMANENCIA',_minToH(avgPerm),'promedio',t.teal,t),t);
  h+=_card('',_kpi('PUNTUALIDAD',pctOnTime+'%',_semaforo(pctOnTime,tgt.throughputHora,60),pctOnTime>=85?t.green:t.amber,t),t);
  h+=_card('',_kpi('NO-SHOW',pctNoShow+'%','',pctNoShow<=5?t.green:t.red,t),t);
  h+=_card('',_kpi('COSTO RETRASOS','€'+costoRetrasos,'estimado',t.red,t),t);
  h+=`</div>`;
  // Tendencia + Flujo neto
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('📈 Tendencia diaria',_spark(D.throughputByDay,t.blue)+`<div style="display:flex;justify-content:space-between;font-size:8px;color:${t.t3};margin-top:2px"><span>${D.throughputByDay[0]?D.throughputByDay[0][0]:''}</span><span>${D.throughputByDay.length?D.throughputByDay[D.throughputByDay.length-1][0]:''}</span></div>`+(D.forecastDays.length?`<div style="font-size:9px;color:${t.t3};margin-top:4px">Forecast: ${D.forecastDays.map(f=>f[0].slice(5)+':'+f[1]).join(', ')}</div>`:''),t);
  h+=_card('🔄 Flujo neto por hora (entradas-salidas)',_bar(D.flujoNeto.filter(x=>x[1]!==0).map(([h2,v])=>[h2+'h',v]),v=>v>=0?t.green:t.red,t),t);
  h+=`</div>`;
  // Ocupación halls + Throughput
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🏟 Ocupación por Hall',D.ocupByHall.map(o=>`<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="font-size:9px;font-weight:700;min-width:30px">${o.hall}</span><div style="flex:1;height:14px;background:${t.bg3};border-radius:7px;overflow:hidden;position:relative"><div style="height:100%;width:${o.pct}%;background:${o.pct>80?t.red:o.pct>60?t.amber:t.green};border-radius:7px;transition:width .3s"></div><span style="position:absolute;right:4px;top:0;font-size:8px;font-weight:700;line-height:14px;color:${t.text}">${o.ocup}/${o.cap}</span></div><span style="font-size:9px;font-weight:700;min-width:30px;text-align:right">${o.pct}%</span></div>`).join(''),t);
  h+=_card('🚛 Top Empresas',_bar(D.byEmpresa.slice(0,8),t.teal,t),t);
  h+=_card('🚗 Tipo Vehículo',`<div style="display:flex;align-items:center;gap:8px">${_donut(D.byTipoVeh.slice(0,6))}<div style="display:flex;flex-direction:column;gap:2px">${D.byTipoVeh.slice(0,6).map(([k,v],i)=>`<div style="font-size:9px"><span style="color:${['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'][i%6]}">●</span> ${esc(k)}: <b>${v}</b></div>`).join('')}</div></div>`,t);
  h+=`</div>`;
  return h;
}

function _renderFlujo(D,t){
  let h='';
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🕐 Distribución por hora',_bar(D.throughputByHour.filter(x=>x[1]>0),t.blue,t),t);
  h+=_card('📊 Permanencia en recinto',`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;text-align:center">${[['Promedio',_minToH(D.avgPerm),t.blue],['Mediana',_minToH(D.medPerm),t.teal],['P95',_minToH(D.p95Perm),t.amber],['Máximo',_minToH(D.maxPerm),t.red]].map(([l,v,c])=>`<div style="background:${t.bg3};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${c}">${v}</div><div style="font-size:8px;color:${t.t3}">${l}</div></div>`).join('')}</div>`,t);
  h+=`</div>`;
  // Bottlenecks
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🚧 Cuellos de botella (tracking)',D.bottlenecks.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3}"><th style="padding:3px 6px;text-align:left">Step</th><th>Prom.</th><th>Máx.</th><th>#</th></tr>${D.bottlenecks.slice(0,8).map(b=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:3px 6px;font-weight:600">${b.step}</td><td style="text-align:center;color:${b.avg>30?t.red:t.amber}">${b.avg}m</td><td style="text-align:center">${b.max}m</td><td style="text-align:center">${b.count}</td></tr>`).join('')}</table>`:`<div style="font-size:10px;color:${t.t3};text-align:center;padding:12px">Sin datos de tracking</div>`,t,t.amber);
  h+=_card('🔄 Por turno',`<div style="display:flex;gap:8px;justify-content:center">${Object.entries(D.byTurno).map(([turno,count])=>`<div style="text-align:center;background:${t.bg3};border-radius:8px;padding:10px 16px"><div style="font-size:20px;font-weight:900;color:${t.blue}">${count}</div><div style="font-size:9px;color:${t.t3}">${turno}</div></div>`).join('')}</div>`,t);
  h+=`</div>`;
  // Rotación y flujo neto
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('🔁 Rotación diaria por Hall',_bar(Object.entries(D.rotByHall).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),'#8b5cf6',t),t);
  h+=_card('📦 Descarga por tipo',`<div style="display:flex;gap:8px;justify-content:center">${D.descTipos.map(([k,v])=>`<div style="text-align:center;background:${t.bg3};border-radius:8px;padding:8px 14px"><div style="font-size:18px;font-weight:900;color:${t.teal}">${v}</div><div style="font-size:9px;color:${t.t3}">${k}</div><div style="font-size:8px;color:${t.t3}">~${D.descAvg[k]||'?'}m</div></div>`).join('')}</div>`,t);
  h+=`</div>`;
  return h;
}

function _renderMontaje(D,t){
  let h='';
  // Curva S
  const curva=D.curvaReal;
  const ideal=D.idealPerDay;
  h+=_card('📐 Curva S — Progreso acumulado vs ideal',curva.length?(() => {
    const mx=Math.max(D.totalTrailers,...curva.map(x=>x[1]));
    const w=600,ht=180,pad=40;
    const step=(w-pad*2)/(curva.length-1||1);
    const y=(v)=>ht-pad-(v/mx)*(ht-pad*2);
    const realPts=curva.map((x,i)=>`${pad+i*step},${y(x[1])}`).join(' ');
    let idealCum=0;
    const idealPts=curva.map((x,i)=>{idealCum+=ideal;return`${pad+i*step},${y(Math.min(idealCum,D.totalTrailers))}`;}).join(' ');
    return `<svg viewBox="0 0 ${w} ${ht}" style="width:100%;height:${ht}px"><line x1="${pad}" y1="${y(D.totalTrailers)}" x2="${w-pad}" y2="${y(D.totalTrailers)}" stroke="${t.t3}" stroke-dasharray="4" stroke-width="1"/><text x="${pad-2}" y="${y(D.totalTrailers)+4}" font-size="8" fill="${t.t3}" text-anchor="end">${D.totalTrailers}</text><polyline points="${idealPts}" fill="none" stroke="${t.t3}" stroke-width="1.5" stroke-dasharray="6" opacity="0.5"/><polyline points="${realPts}" fill="none" stroke="${t.blue}" stroke-width="2.5" stroke-linecap="round"/>${curva.map((x,i)=>`<circle cx="${pad+i*step}" cy="${y(x[1])}" r="3" fill="${t.blue}"/>`).join('')}<text x="${w-pad}" y="${ht-8}" font-size="8" fill="${t.t3}" text-anchor="end">— Real — — Ideal</text></svg><div style="display:flex;justify-content:space-between;font-size:8px;color:${t.t3}"><span>${curva[0]?curva[0][0]:''}</span><span>${curva.length?curva[curva.length-1][0]:''}</span></div>`;
  })():`<div style="text-align:center;font-size:10px;color:${t.t3};padding:20px">Sin datos suficientes</div>`,t,t.blue);
  // ETA por hall
  h+=`<div style="margin-top:8px">`;
  h+=_card('⏱ ETA por Hall — Estimación de completado',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3};font-weight:700"><th style="padding:4px 6px;text-align:left">Hall</th><th>Procesados</th><th>Pendientes</th><th>Prom/día</th><th>ETA días</th><th>Riesgo</th></tr>${D.etaByHall.filter(e=>e.total>0).map(e=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:4px 6px;font-weight:700">${e.hall}</td><td style="text-align:center">${e.done}/${e.total}</td><td style="text-align:center;color:${e.remaining>0?t.amber:t.green}">${e.remaining}</td><td style="text-align:center">${e.avgDaily}</td><td style="text-align:center;font-weight:700;color:${e.etaDays>D.desmontajeDias?t.red:t.green}">${e.etaDays===999?'∞':e.etaDays+'d'}</td><td style="text-align:center">${e.etaDays>D.desmontajeDias?'🔴 ALTO':'🟢 OK'}</td></tr>`).join('')}</table>`,t,t.amber);
  h+=`</div>`;
  // Vaciado diario
  h+=`<div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('📤 Salidas por día (velocidad vaciado)',_spark(D.salidaByDay,'#10b981')+`<div style="font-size:9px;color:${t.t3};margin-top:4px">Rate actual: ${Math.round(D.vaciadoRate)} salidas/día · Restantes: ${D.remainingInRecinto} · ETA: ${D.daysToComplete===999?'∞':D.daysToComplete+'d'}</div>`,t,t.green);
  h+=_card('📊 Progreso por Hall (último día)',_bar(D.halls.map(h2=>{const d=(D.dailyByHall[h2]||[]);const last=d.length?d[d.length-1][1]:0;return[h2,last];}).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),t.purple,t),t);
  h+=`</div>`;
  return h;
}

function _renderPuntualidad(D,t){
  let h='';
  // KPIs
  h+=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('PUNTUALIDAD',D.pctOnTime+'%','',D.pctOnTime>=85?t.green:D.pctOnTime>=60?t.amber:t.red,t),t,D.pctOnTime>=85?t.green:t.amber);
  h+=_card('',_kpi('NO-SHOWS',D.pctNoShow+'%',D.agNoShow.length+' citas',D.pctNoShow<=5?t.green:t.red,t),t);
  h+=_card('',_kpi('RETRASO PROM.',D.avgRetraso+'m','',D.avgRetraso<=10?t.green:t.red,t),t);
  h+=_card('',_kpi('CITAS TOTAL',D.ag.length,'',t.blue,t),t);
  h+=_card('',_kpi('COMPLETADAS',D.agCompleted.length,_pct(D.agCompleted.length,D.ag.length)+'%',t.teal,t),t);
  h+=`</div>`;
  // Histograma retrasos
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('📊 Distribución de retrasos',_bar(Object.entries(D.retrasoHist).filter(x=>x[1]>0),t.amber,t),t);
  h+=_card('🕐 Hora pico: planificada vs real',(() => {
    const plan=Object.entries(D.agByHourPlan).sort().filter(x=>x[1]>0);
    const real=Object.entries(D.agByHourReal).sort().filter(x=>x[1]>0);
    if(!plan.length)return`<div style="font-size:10px;color:${t.t3};text-align:center;padding:12px">Sin datos</div>`;
    return `<div style="font-size:9px;margin-bottom:4px"><span style="color:${t.blue}">■</span> Plan <span style="color:${t.green}">■</span> Real</div>`+_spark(plan,t.blue)+_spark(real,t.green);
  })(),t);
  h+=`</div>`;
  // Rankings
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('🏢 Retraso por empresa (peores)',D.empRetrasoRank.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3}"><th style="padding:3px 6px;text-align:left">Empresa</th><th>Prom.</th><th>% Tarde</th><th>#</th></tr>${D.empRetrasoRank.slice(0,8).map(e=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:3px 6px">${esc(e.empresa)}</td><td style="text-align:center;color:${e.avg>15?t.red:t.amber}">${e.avg>0?'+':''} ${e.avg}m</td><td style="text-align:center">${e.pctLate}%</td><td style="text-align:center">${e.count}</td></tr>`).join('')}</table>`:`<div style="font-size:10px;color:${t.t3};text-align:center">Sin datos</div>`,t,t.red);
  h+=_card('👤 Retraso por conductor (peores)',D.condRetrasoRank.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3}"><th style="padding:3px 6px;text-align:left">Conductor</th><th>Prom.</th><th>#</th></tr>${D.condRetrasoRank.slice(0,8).map(c=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:3px 6px">${esc(c.conductor)}</td><td style="text-align:center;color:${c.avg>15?t.red:t.amber}">${c.avg>0?'+':''}${c.avg}m</td><td style="text-align:center">${c.count}</td></tr>`).join('')}</table>`:`<div style="font-size:10px;color:${t.t3};text-align:center">Sin datos</div>`,t);
  h+=`</div>`;
  return h;
}

function _renderAnomalias(D,t){
  let h='';
  // Contadores
  const issues=[
    {ico:'🚨',label:'Atascados (>'+D.tgt.permanenciaMax+'m)',count:D.stuck.length,color:t.red},
    {ico:'⏰',label:'Sin salida >24h',count:D.noExit24h.length,color:t.red},
    {ico:'⚠️',label:'Steps saltados',count:D.skippedSteps.length,color:t.amber},
    {ico:'💀',label:'Horarios muertos hoy',count:D.deadHours.length,color:t.amber},
    {ico:'🔀',label:'Conflictos de stand',count:D.standConflicts.length,color:t.red},
    {ico:'❓',label:'Conductores sospechosos',count:D.suspiciousCond.length,color:t.purple},
    {ico:'🔗',label:'Inconsistencias tracking',count:D.inconsistencias.length,color:t.amber},
  ];
  h+=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">${issues.map(i=>`<div style="background:${t.card};border:1px solid ${t.bd};border-radius:8px;padding:8px;text-align:center;border-left:3px solid ${i.count>0?i.color:t.green}"><div style="font-size:20px;font-weight:900;color:${i.count>0?i.color:t.green}">${i.ico} ${i.count}</div><div style="font-size:9px;color:${t.t3}">${i.label}</div></div>`).join('')}</div>`;
  // Detalle atascados
  if(D.stuck.length)h+=_card('🚨 Vehículos atascados',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3}"><th style="padding:3px;text-align:left">Matrícula</th><th>Hall</th><th>Empresa</th><th>Entrada</th><th>Horas</th></tr>${D.stuck.slice(0,15).map(i=>{const hrs=Math.round((Date.now()-new Date(i.entrada))/3600000);return`<tr style="border-bottom:1px solid ${t.bd};background:${hrs>24?t.rll:''}"><td style="padding:3px;font-weight:700">${i.matricula}</td><td>${i.hall||'–'}</td><td style="font-size:9px">${i.empresa||'–'}</td><td style="font-size:9px">${fmt(i.entrada)}</td><td style="font-weight:700;color:${hrs>24?t.red:t.amber}">${hrs}h</td></tr>`;}).join('')}</table>`,t,t.red);
  // Halls degradándose
  if(Object.keys(D.hallTrend).length)h+=`<div style="margin-top:8px">`+_card('📉 Halls degradándose',Object.entries(D.hallTrend).map(([h2,d])=>`<div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="font-weight:700;font-size:11px">${h2}</span><span style="font-size:10px;color:${t.red}">↓ ${d.drop}%</span><span style="font-size:9px;color:${t.t3}">(${d.avgPrev}→${d.avgLast}/día)</span></div>`).join(''),t,t.red)+`</div>`;
  // Stand conflicts
  if(D.standConflicts.length)h+=`<div style="margin-top:8px">`+_card('🔀 Conflictos de stand',D.standConflicts.map(s=>`<div style="font-size:10px;margin:2px 0"><span style="font-weight:700">${s.stand}</span>: ${s.count} vehículos → ${s.items.join(', ')}</div>`).join(''),t,t.red)+`</div>`;
  return h||`<div style="text-align:center;padding:40px;color:${t.t3}">✅ Sin anomalías detectadas</div>`;
}

function _renderPredicciones(D,t){
  let h='';
  // Forecast
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🔮 Forecast próximos días',D.forecastDays.length?`<div style="display:flex;gap:8px;justify-content:center">${D.forecastDays.map(([d,v])=>`<div style="text-align:center;background:${t.bg3};border-radius:8px;padding:10px 16px"><div style="font-size:20px;font-weight:900;color:${t.purple}">${v}</div><div style="font-size:9px;color:${t.t3}">${d.slice(5)}</div></div>`).join('')}</div>`:`<div style="font-size:10px;color:${t.t3};text-align:center;padding:12px">Necesita ≥3 días de datos</div>`,t,'#8b5cf6');
  h+=_card('⏰ Hora pico predicha',D.predictedPeak?`<div style="text-align:center"><div style="font-size:28px;font-weight:900;color:${t.blue}">${D.predictedPeak[0]}:00</div><div style="font-size:10px;color:${t.t3}">Basado en ${D.predictedPeak[1]} registros históricos</div></div>`:'Sin datos',t);
  h+=`</div>`;
  // Riesgo por hall
  h+=_card('🎯 Riesgo por Hall',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3};font-weight:700"><th style="padding:4px 6px;text-align:left">Hall</th><th>Pendientes</th><th>Rate/día</th><th>Días necesarios</th><th>Riesgo</th></tr>${D.hallRisk.filter(r=>r.pending>0).map(r=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:4px 6px;font-weight:700">${r.hall}</td><td style="text-align:center">${r.pending}</td><td style="text-align:center">${r.rate}</td><td style="text-align:center;font-weight:700;color:${r.risk==='ALTO'?t.red:t.green}">${r.daysNeeded===999?'∞':r.daysNeeded}</td><td style="text-align:center">${r.risk==='ALTO'?'🔴 ALTO':'🟢 OK'}</td></tr>`).join('')}</table>`,t);
  // Proyección global
  h+=`<div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('📤 Proyección de completado',`<div style="text-align:center"><div style="font-size:14px;font-weight:900;color:${D.daysToComplete>D.desmontajeDias?t.red:t.green}">${D.daysToComplete===999?'∞':D.daysToComplete} días</div><div style="font-size:10px;color:${t.t3}">al ritmo de ${Math.round(D.exitRate)} salidas/día</div><div style="font-size:10px;color:${t.t3};margin-top:4px">${D.remainingInRecinto} vehículos restantes</div>${D.daysToComplete>D.desmontajeDias?`<div style="font-size:10px;color:${t.red};font-weight:700;margin-top:4px">⚠️ Superará deadline de ${D.desmontajeDias} días</div>`:''}</div>`,t,D.daysToComplete>D.desmontajeDias?t.red:t.green);
  h+=_card('📅 Por día de la semana',_bar(Object.entries(D.byDayOfWeek).filter(x=>x[1]>0),t.blue,t),t);
  h+=`</div>`;
  return h;
}

function _renderEficiencia(D,t){
  let h='';
  h+=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('ERRORES DATOS',D.errorRate+'%',D.camposVacios+' incompletos',D.errorRate<=5?t.green:t.red,t),t);
  h+=_card('',_kpi('RE-TRABAJO',D.retrabajoRate+'%',D.editados+' ediciones',t.amber,t),t);
  h+=_card('',_kpi('DUPLICADOS',D.dupeCount,'misma matrícula/día',D.dupeCount<=2?t.green:t.amber,t),t);
  h+=_card('',_kpi('COSTO RETRASOS','€'+D.costoRetrasos,Math.round(D.totalRetrasoMin)+'min total',t.red,t),t);
  h+=_card('',_kpi('BALANCE HALLS','σ='+D.balanceStd,'desviación estándar',D.balanceStd<10?t.green:t.amber,t),t);
  h+=`</div>`;
  // Productividad por usuario
  h+=_card('👤 Productividad por operador',D.userProductivity.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg3};font-weight:700"><th style="padding:3px 6px;text-align:left">Usuario</th><th>Registros</th><th>Ediciones</th></tr>${D.userProductivity.slice(0,10).map(u=>`<tr style="border-bottom:1px solid ${t.bd}"><td style="padding:3px 6px">${esc(u.user)}</td><td style="text-align:center;font-weight:700">${u.registros}</td><td style="text-align:center">${u.edits}</td></tr>`).join('')}</table>`:`<div style="font-size:10px;color:${t.t3};text-align:center">Sin datos</div>`,t);
  return h;
}

function _renderConfig(D,t){
  const cfg=D.cfg;const tgt=D.tgt;
  return _card('⚙️ Configuración del evento',`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Total trailers</label><input type="number" value="${cfg.totalTrailers}" onchange="window._pa3.cfg.totalTrailers=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Días montaje</label><input type="number" value="${cfg.montajeDias}" onchange="window._pa3.cfg.montajeDias=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Días desmontaje</label><input type="number" value="${cfg.desmontajeDias}" onchange="window._pa3.cfg.desmontajeDias=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Horas operación/día</label><input type="number" value="${cfg.horasOp}" onchange="window._pa3.cfg.horasOp=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">€/hora retraso</label><input type="number" value="${cfg.costoHoraRetraso}" onchange="window._pa3.cfg.costoHoraRetraso=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">SLA puntualidad (min)</label><input type="number" value="${cfg.slaMin||10}" onchange="window._pa3.cfg.slaMin=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Turno mañana</label><input type="time" value="${cfg.turnoM}" onchange="window._pa3.cfg.turnoM=this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Turno tarde</label><input type="time" value="${cfg.turnoT}" onchange="window._pa3.cfg.turnoT=this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Turno noche</label><input type="time" value="${cfg.turnoN}" onchange="window._pa3.cfg.turnoN=this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Target throughput/h</label><input type="number" value="${tgt.throughputHora}" onchange="window._pa3.targets.throughputHora=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Target puntualidad %</label><input type="number" value="${tgt.puntualidadPct}" onchange="window._pa3.targets.puntualidadPct=+this.value;renderAnalytics3()" style="width:100%"></div>
      <div><label style="font-weight:700;font-size:10px;color:${t.t3}">Permanencia máx (min)</label><input type="number" value="${tgt.permanenciaMax}" onchange="window._pa3.targets.permanenciaMax=+this.value;renderAnalytics3()" style="width:100%"></div>
    </div>
    <div style="margin-top:8px;font-size:10px;color:${t.t3}">
      <b>Capacidad por hall:</b> ${D.halls.map(h=>`<span style="display:inline-flex;align-items:center;gap:2px;margin:2px">${h}: <input type="number" value="${cfg.capacidadHall[h]||50}" onchange="window._pa3.cfg.capacidadHall['${h}']=+this.value;renderAnalytics3()" style="width:50px;font-size:10px;padding:2px 4px"></span>`).join(' ')}
    </div>
  `,t);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN RENDER
   ═══════════════════════════════════════════════════════════════════ */
export function renderAnalytics3(){
  const el=document.getElementById('tabContent');if(!el)return;
  const S=window._pa3;
  const t=_t();
  const D=_computeAll();
  const halls=D.halls;
  const empresas=[...new Set(D.all.map(i=>i.empresa).filter(Boolean))].sort();

  const subs=[
    ['resumen','📊 Resumen'],['flujo','🔄 Flujo'],['montaje','📐 Montaje/Desm.'],
    ['puntualidad','⏱ Puntualidad'],['anomalias','🚨 Anomalías'],
    ['predicciones','🔮 Predicciones'],['eficiencia','⚡ Eficiencia'],['config','⚙️ Config']
  ];

  let h=`<div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center;margin-bottom:6px;border-bottom:1px solid ${t.bd};padding-bottom:6px">`;
  h+=subs.map(([id,l])=>`<button class="btn btn-xs ${S.sub===id?'btn-p':'btn-gh'}" onclick="window._pa3.sub='${id}';renderAnalytics3()">${l}</button>`).join('');
  h+=`<span style="flex:1"></span>`;
  // Filtros
  h+=`<select style="font-size:10px;padding:2px 6px;border-radius:12px;border:1px solid ${t.bd};background:${t.card}" onchange="window._pa3.hall=this.value;renderAnalytics3()"><option value="">🏟 Todos halls</option>${halls.map(h2=>`<option value="${h2}" ${S.hall===h2?'selected':''}>${h2}</option>`).join('')}</select>`;
  h+=`<select style="font-size:10px;padding:2px 6px;border-radius:12px;border:1px solid ${t.bd};background:${t.card};max-width:120px" onchange="window._pa3.empresa=this.value;renderAnalytics3()"><option value="">🏢 Todas</option>${empresas.map(e=>`<option value="${esc(e)}" ${S.empresa===e?'selected':''}>${esc(e).slice(0,20)}</option>`).join('')}</select>`;
  h+=`<input type="date" value="${S.dateFrom}" onchange="window._pa3.dateFrom=this.value;renderAnalytics3()" style="font-size:10px;padding:2px 4px" title="Desde">`;
  h+=`<input type="date" value="${S.dateTo}" onchange="window._pa3.dateTo=this.value;renderAnalytics3()" style="font-size:10px;padding:2px 4px" title="Hasta">`;
  if(S.dateFrom||S.dateTo||S.hall||S.empresa)h+=`<button class="btn btn-xs btn-gh" onclick="window._pa3.dateFrom='';window._pa3.dateTo='';window._pa3.hall='';window._pa3.empresa='';renderAnalytics3()">✕</button>`;
  h+=`<button class="btn btn-xs btn-gh" onclick="window._op._pa3Export()" title="Exportar">⬇ Excel</button>`;
  h+=`</div>`;

  // Sub-tab content
  switch(S.sub){
    case 'flujo':h+=_renderFlujo(D,t);break;
    case 'montaje':h+=_renderMontaje(D,t);break;
    case 'puntualidad':h+=_renderPuntualidad(D,t);break;
    case 'anomalias':h+=_renderAnomalias(D,t);break;
    case 'predicciones':h+=_renderPredicciones(D,t);break;
    case 'eficiencia':h+=_renderEficiencia(D,t);break;
    case 'config':h+=_renderConfig(D,t);break;
    default:h+=_renderResumen(D,t);
  }

  el.innerHTML=h;
}

function _pa3Export(){
  const D=_computeAll();
  if(!D.all.length){toast('Sin datos','var(--amber)');return;}
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(D.all),'Datos');
  // KPIs sheet
  const kpis=[
    {metrica:'Total registros',valor:D.all.length},
    {metrica:'En recinto',valor:D.enRecinto.length},
    {metrica:'Con salida',valor:D.conSalida.length},
    {metrica:'Permanencia promedio (min)',valor:D.avgPerm},
    {metrica:'Permanencia P95 (min)',valor:D.p95Perm},
    {metrica:'Puntualidad %',valor:D.pctOnTime},
    {metrica:'No-show %',valor:D.pctNoShow},
    {metrica:'Retraso promedio (min)',valor:D.avgRetraso},
    {metrica:'Errores datos %',valor:D.errorRate},
    {metrica:'Health Score',valor:D.healthScore},
    {metrica:'Costo retrasos €',valor:D.costoRetrasos},
  ];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(kpis),'KPIs');
  // Hall analysis
  const hallData=D.ocupByHall.map(o=>({Hall:o.hall,Ocupacion:o.ocup,Capacidad:o.cap,Pct:o.pct+'%',Rotacion:D.rotByHall[o.hall]||0}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(hallData),'Halls');
  XLSX.writeFile(wb,'precision_analytics_'+new Date().toISOString().slice(0,10)+'.xlsx');
  toast('✅ Exportado','var(--green)');
}

registerFn('renderAnalytics3',renderAnalytics3);
registerFn('_pa3Export',_pa3Export);
window.renderAnalytics3=renderAnalytics3;
