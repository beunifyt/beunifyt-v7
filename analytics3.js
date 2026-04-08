// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics3.js — Precision Analytics (Logistics Intelligence)
// 80+ métricas logísticas: flujo, montaje/desmontaje, puntualidad, capacidad, anomalías, predicciones, eficiencia, benchmarks
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, todayISO, formatDate, uid } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { tr, trFree } from './langs.js';

let _c, _u, _datos={}, _sub='resumen', _dateFrom='', _dateTo='', _hallF='', _empresaF='';
let _cfg={totalTrailers:1100,montajeDias:7,desmontajeDias:3,horasOp:14,costoHoraRetraso:150,capacidadHall:{},slaMin:10,turnoM:'06:00',turnoT:'14:00',turnoN:'22:00'};
let _tgt={throughputHora:20,puntualidadPct:85,noShowPct:5,permanenciaMax:180};

export function render(ct, us) {
  _c = ct; _u = us;
  _loadData();
  return () => {};
}

const T = () => getThemeColors(getCurrentTheme());
const esc = safeHtml;
const _pct=(a,b)=>b?Math.round(a/b*100):0;
const _avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const _median=(arr)=>{if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const _p95=(arr)=>{if(!arr.length)return 0;const s=[...arr].sort((a,b)=>a-b);return s[Math.floor(s.length*0.95)]||s[s.length-1];};
const _std=(arr)=>{const m=_avg(arr);return Math.sqrt(_avg(arr.map(x=>(x-m)*(x-m))));};
const _minToH=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?String(Math.round(m%60)).padStart(2,'0')+'m':''}`:`${Math.round(m)}m`;
const _dayKey=(ts)=>(ts||'').slice(0,10);
const _hourKey=(ts)=>(ts||'').slice(11,13);
const _permanencia=(i)=>{if(!i.entrada||!i.salida)return null;return(new Date(i.salida)-new Date(i.entrada))/60000;};
const _countBy=(arr,key)=>{const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
const _timeHist=(arr,field)=>{const m={};arr.forEach(i=>{const d=_dayKey(i[field||'entrada']);if(d)m[d]=(m[d]||0)+1;});return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));};
const _hourHist=(arr,field)=>{const m={};for(let h=0;h<24;h++)m[String(h).padStart(2,'0')]=0;arr.forEach(i=>{const t2=_hourKey(i[field||'entrada']);if(t2)m[t2]=(m[t2]||0)+1;});return Object.entries(m).sort();};
const _semaforo=(val,green,yellow)=>{if(val>=green)return'🟢';if(val>=yellow)return'🟡';return'🔴';};

const _card=(title,body,t,color)=>`<div style="background:${t.card};border:1px solid ${t.border};border-radius:8px;padding:10px;box-shadow:0 1px 3px rgba(0,0,0,.06);${color?'border-top:3px solid '+color:''}">${title?`<div style="font-weight:800;font-size:11px;margin-bottom:6px;color:${t.t3}">${title}</div>`:''}${body}</div>`;
const _kpi=(label,value,sub,color,t)=>`<div style="text-align:center;padding:8px"><div style="font-size:22px;font-weight:900;color:${color||t.acc};line-height:1.1">${value}</div><div style="font-size:9px;font-weight:700;color:${t.t3};margin-top:2px">${label}</div>${sub?`<div style="font-size:8px;color:${t.t3};margin-top:1px">${sub}</div>`:''}</div>`;
const _bar=(items,color,t)=>{if(!items.length)return`<div style="padding:6px;text-align:center;font-size:10px;color:${t.t3}">Sin datos</div>`;const mx=Math.max(...items.map(x=>x[1]),1);return items.map(([k,v])=>`<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="font-size:9px;min-width:60px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t.t3}">${esc(k)}</span><div style="flex:1;height:12px;background:${t.bg};border-radius:6px;overflow:hidden"><div style="height:100%;width:${Math.round(v/mx*100)}%;background:${color};border-radius:6px"></div></div><span style="font-size:9px;font-weight:700;min-width:28px;text-align:right">${typeof v==='number'&&v%1!==0?v.toFixed(1):v}</span></div>`).join('');};
const _spark=(arr,color,w=240,h=50)=>{if(arr.length<2)return'';const mx=Math.max(...arr.map(x=>x[1]),1);const step=w/(arr.length-1);const pts=arr.map((x,i)=>`${i*step},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');const area=pts+` ${w},${h} 0,${h}`;return`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;display:block"><defs><linearGradient id="sg3${color.replace(/[^a-z0-9]/gi,'')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0.02"/></linearGradient></defs><polygon points="${area}" fill="url(#sg3${color.replace(/[^a-z0-9]/gi,'')})" /><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;};
const _donut=(items,size=90)=>{if(!items.length)return'';const total=items.reduce((a,x)=>a+x[1],0);if(!total)return'';const cx=size/2,cy=size/2,r=size/2-4,r2=r*0.55;let angle=-90;let paths='';const clrs=['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#64748b','#84cc16','#f97316'];items.forEach(([k,v],i)=>{const pct=v/total;const a1=angle*Math.PI/180;angle+=pct*360;const a2=angle*Math.PI/180;const large=pct>0.5?1:0;const x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),x3=cx+r2*Math.cos(a2),y3=cy+r2*Math.sin(a2),x4=cx+r2*Math.cos(a1),y4=cy+r2*Math.sin(a1);if(pct>0.001)paths+=`<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 ${large} 0 ${x4},${y4} Z" fill="${clrs[i%clrs.length]}" opacity="0.85"/>`;});return`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${paths}<text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="14" font-weight="900" fill="currentColor">${total}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.5">total</text></svg>`;};

const _diffMins=(p,r)=>{if(!p||!r)return null;try{const tp=new Date('1970-01-01T'+(p.length>5?p.slice(-5):p));const tr2=new Date('1970-01-01T'+(r.length>5?r.slice(-5):r));return Math.round((tr2-tp)/60000);}catch(e){return null;}};
const _forecast=(series,days=3)=>{if(series.length<3)return[];const vals=series.map(x=>x[1]);const ma=[];for(let i=0;i<days;i++){const win=vals.slice(-Math.min(5,vals.length));const avg=_avg(win);const lastDate=new Date(series[series.length-1][0]);lastDate.setDate(lastDate.getDate()+i+1);ma.push([lastDate.toISOString().slice(0,10),Math.round(avg)]);}return ma;};
const _turno=(ts)=>{const h=parseInt(_hourKey(ts)||'0');const tM=parseInt((_cfg.turnoM||'06:00').split(':')[0]);const tT=parseInt((_cfg.turnoT||'14:00').split(':')[0]);const tN=parseInt((_cfg.turnoN||'22:00').split(':')[0]);if(h>=tM&&h<tT)return'Mañana';if(h>=tT&&h<tN)return'Tarde';return'Noche';};

// ─── DATA LOADING ───
async function _loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const r = _u.recinto || '';
    const [ref, ing, ag, cond, mov, emp, eventos, recintos] = await Promise.all([
      fsGetAll('ingresos').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('accesos').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('agenda').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('conductores').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('movimientos').catch(() => []),
      fsGetAll('empresas').catch(() => []),
      fsGetAll('eventos').catch(() => []),
      fsGetAll('recintos').catch(() => []),
    ]);
    _datos = { ref, ing, ag, cond, mov, emp, eventos, recintos };
    _paint();
  } catch (e) { console.warn('analytics3 load:', e); _datos={}; _paint(); }
}

// ─── COMPUTE ALL METRICS ───
function _compute() {
  let ref=[...(_datos.ref||[])]; let ing=[...(_datos.ing||[])]; let ag=[...(_datos.ag||[])]; let mov=[...(_datos.mov||[])]; let cond=[...(_datos.cond||[])]; let emp=[...(_datos.emp||[])];
  // Date filter
  if(_dateFrom){ref=ref.filter(i=>(i.entrada||'')>=_dateFrom);ing=ing.filter(i=>(i.entrada||'')>=_dateFrom);ag=ag.filter(i=>(i.fecha||'')>=_dateFrom);}
  if(_dateTo){ref=ref.filter(i=>(i.entrada||'')<=_dateTo+'T23:59');ing=ing.filter(i=>(i.entrada||'')<=_dateTo+'T23:59');ag=ag.filter(i=>(i.fecha||'')<=_dateTo);}
  if(_hallF){ref=ref.filter(i=>i.hall===_hallF||(i.halls||[]).includes(_hallF));ing=ing.filter(i=>i.hall===_hallF||(i.halls||[]).includes(_hallF));ag=ag.filter(i=>i.hall===_hallF);}
  if(_empresaF){ref=ref.filter(i=>i.empresa===_empresaF);ing=ing.filter(i=>i.empresa===_empresaF);ag=ag.filter(i=>i.empresa===_empresaF);}

  const all=[...ref,...ing];
  const today=todayISO();
  const nowMs=Date.now();
  const ev=AppState.get('currentEvent')||{};
  const recintoData=(_datos.recintos||[]).find(r2=>r2.nombre===_u.recinto)||{};
  const halls=(recintoData.halls||['1','2A','2B','3A','3B','4','5','6','7','8','CS']);

  // Flujo
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

  // Flujo neto
  const entradaByHour=_hourHist(all,'entrada');
  const salidaByHour=_hourHist(conSalida,'salida');
  const flujoNeto=entradaByHour.map(([h2,e])=>{const s=(salidaByHour.find(x=>x[0]===h2)||[h2,0])[1];return[h2+'h',e-s];});

  // Ocupación
  const ocupByHall=halls.map(h2=>{const inH=enRecinto.filter(i=>i.hall===h2||(i.halls||[]).includes(h2)).length;const cap=_cfg.capacidadHall[h2]||50;return{hall:h2,ocup:inH,cap,pct:_pct(inH,cap)};});
  const throughputHall=_countBy(all,'hall').slice(0,12);
  const enCola=all.filter(i=>{if(!i.tracking||i.salida)return false;const last=(i.tracking||[])[i.tracking.length-1];return last&&(last.step==='rampa'||last.step==='cabina');}).length;

  // Bottlenecks
  const allTrackDurs=[];
  all.forEach(i=>{if(!i.tracking||!Array.isArray(i.tracking))return;const steps=[...i.tracking].sort((a,b)=>(a.ts||'').localeCompare(b.ts||''));for(let j=1;j<steps.length;j++){const d=(new Date(steps[j].ts)-new Date(steps[j-1].ts))/60000;allTrackDurs.push({from:steps[j-1].step,to:steps[j].step,min:d});}});
  const stepAvgs={};
  allTrackDurs.forEach(d=>{const k=d.from+'→'+d.to;if(!stepAvgs[k])stepAvgs[k]=[];stepAvgs[k].push(d.min);});
  const bottlenecks=Object.entries(stepAvgs).map(([k,arr])=>({step:k,avg:Math.round(_avg(arr)),max:Math.round(Math.max(...arr)),count:arr.length})).sort((a,b)=>b.avg-a.avg);

  // Turno
  const byTurno={};all.forEach(i=>{const t2=_turno(i.entrada);byTurno[t2]=(byTurno[t2]||0)+1;});

  // Montaje/desmontaje
  const totalTrailers=_cfg.totalTrailers;const montajeDias=_cfg.montajeDias;const desmontajeDias=_cfg.desmontajeDias;
  let fase='pre';
  if(ev.ini&&ev.fin){const h2=new Date(today);if(h2<new Date(ev.ini))fase='montaje';else if(h2>new Date(ev.fin))fase='desmontaje';else fase='evento';}
  const dailyByHall={};halls.forEach(h2=>{dailyByHall[h2]=_timeHist(all.filter(i=>i.hall===h2||(i.halls||[]).includes(h2)),'entrada');});
  const idealPerDay=Math.ceil(totalTrailers/(fase==='desmontaje'?desmontajeDias:montajeDias));
  const curvaReal=(()=>{let cum=0;return throughputByDay.map(([d,v])=>{cum+=v;return[d,cum,totalTrailers];});})();
  const etaByHall=halls.map(h2=>{const done=all.filter(i=>(i.hall===h2||(i.halls||[]).includes(h2))&&i.salida).length;const total=all.filter(i=>i.hall===h2||(i.halls||[]).includes(h2)).length;const daily=dailyByHall[h2]||[];const lastDays=daily.slice(-3);const avgD=lastDays.length?_avg(lastDays.map(x=>x[1])):0;const remaining=total-done;const etaDays=avgD>0?Math.ceil(remaining/avgD):999;return{hall:h2,done,total,remaining,avgDaily:Math.round(avgD),etaDays};});
  const salidaByDay=_timeHist(conSalida,'salida');
  const vaciadoRate=salidaByDay.length?_avg(salidaByDay.slice(-3).map(x=>x[1])):0;
  const exitRate=vaciadoRate;
  const remainingInRecinto=enRecinto.length;
  const daysToComplete=exitRate>0?Math.ceil(remainingInRecinto/exitRate):999;

  // Puntualidad
  const agCompleted=ag.filter(a=>a.horaReal);
  const agOnTime=agCompleted.filter(a=>{const d=_diffMins(a.hora,a.horaReal);return d!==null&&Math.abs(d)<=(_cfg.slaMin||10);});
  const pctOnTime=_pct(agOnTime.length,agCompleted.length);
  const agNoShow=ag.filter(a=>a.estado==='PENDIENTE'&&a.fecha<today);
  const pctNoShow=_pct(agNoShow.length,ag.length);
  const retrasos=agCompleted.map(a=>_diffMins(a.hora,a.horaReal)).filter(d=>d!==null&&d>0);
  const avgRetraso=Math.round(_avg(retrasos));
  const empRetrasoRank=(()=>{const m={};agCompleted.forEach(a=>{if(!a.empresa)return;const d=_diffMins(a.hora,a.horaReal);if(d===null)return;if(!m[a.empresa])m[a.empresa]={sum:0,count:0,late:0};m[a.empresa].sum+=d;m[a.empresa].count++;if(d>10)m[a.empresa].late++;});return Object.entries(m).map(([e,d])=>({empresa:e,avg:Math.round(d.sum/d.count),pctLate:_pct(d.late,d.count),count:d.count})).sort((a,b)=>b.avg-a.avg);})();
  const condRetrasoRank=(()=>{const m={};agCompleted.forEach(a=>{if(!a.conductor)return;const d=_diffMins(a.hora,a.horaReal);if(d===null)return;if(!m[a.conductor])m[a.conductor]={sum:0,count:0};m[a.conductor].sum+=d;m[a.conductor].count++;});return Object.entries(m).map(([c,d])=>({conductor:c,avg:Math.round(d.sum/d.count),count:d.count})).sort((a,b)=>b.avg-a.avg);})();
  const retrasoHist={'<5m':0,'5-10m':0,'10-20m':0,'20-30m':0,'30-60m':0,'>60m':0};
  retrasos.forEach(d=>{if(d<5)retrasoHist['<5m']++;else if(d<10)retrasoHist['5-10m']++;else if(d<20)retrasoHist['10-20m']++;else if(d<30)retrasoHist['20-30m']++;else if(d<60)retrasoHist['30-60m']++;else retrasoHist['>60m']++;});

  // Capacidad
  const descTipos=_countBy(all,'descargaTipo');
  const descTiempos={mano:[],maquinaria:[],mixto:[]};
  all.forEach(i=>{if(!i.descargaTipo||!i.entrada||!i.salida)return;const m=_permanencia(i);if(m>0&&m<600&&descTiempos[i.descargaTipo])descTiempos[i.descargaTipo].push(m);});
  const descAvg={mano:Math.round(_avg(descTiempos.mano)),maquinaria:Math.round(_avg(descTiempos.maquinaria)),mixto:Math.round(_avg(descTiempos.mixto))};
  const hallCounts=halls.map(h2=>all.filter(i=>i.hall===h2||(i.halls||[]).includes(h2)).length);
  const balanceStd=Math.round(_std(hallCounts));
  const standConflicts=[];
  const activeByStand={};
  enRecinto.forEach(i=>{if(!i.stand||!i.hall)return;const k=i.hall+'-'+i.stand;if(!activeByStand[k])activeByStand[k]=[];activeByStand[k].push(i);});
  Object.entries(activeByStand).forEach(([k,items])=>{if(items.length>1)standConflicts.push({stand:k,count:items.length,items:items.map(i=>i.matricula)});});
  const rotByHall={};halls.forEach(h2=>{const hItems=all.filter(i=>i.hall===h2||(i.halls||[]).includes(h2));const days=new Set(hItems.map(i=>_dayKey(i.entrada)).filter(Boolean));rotByHall[h2]=days.size?Math.round(hItems.length/days.size*10)/10:0;});

  // Anomalías
  const stuck=enRecinto.filter(i=>(nowMs-new Date(i.entrada).getTime())/60000>(_tgt.permanenciaMax||180));
  const noExit24h=enRecinto.filter(i=>(nowMs-new Date(i.entrada).getTime())/3600000>24);
  const deadHours=[];const hourCountsToday=_hourHist(all.filter(i=>(i.entrada||'').startsWith(today)),'entrada');const opStart=parseInt((_cfg.turnoM||'06:00').split(':')[0]);const opEnd=parseInt((_cfg.turnoN||'22:00').split(':')[0]);hourCountsToday.forEach(([h2,v])=>{const hr=parseInt(h2);if(hr>=opStart&&hr<opEnd&&v===0)deadHours.push(h2+':00');});
  const hallTrend={};halls.forEach(h2=>{const daily=dailyByHall[h2]||[];if(daily.length<3)return;const last3=daily.slice(-3).map(x=>x[1]);const prev3=daily.slice(-6,-3).map(x=>x[1]);if(prev3.length<2)return;const aL=_avg(last3);const aP=_avg(prev3);if(aL<aP*0.7)hallTrend[h2]={drop:Math.round((1-aL/aP)*100),avgLast:Math.round(aL),avgPrev:Math.round(aP)};});

  // Predicciones
  const forecastDays=_forecast(throughputByDay,3);
  const hourAvgs={};all.forEach(i=>{const h2=_hourKey(i.entrada);if(h2){if(!hourAvgs[h2])hourAvgs[h2]=[];hourAvgs[h2].push(1);}});
  const predictedPeak=Object.entries(hourAvgs).map(([h2,arr])=>[h2,arr.length]).sort((a,b)=>b[1]-a[1])[0];
  const hallRisk=halls.map(h2=>{const inH=enRecinto.filter(i=>i.hall===h2||(i.halls||[]).includes(h2)).length;const dailyH=dailyByHall[h2]||[];const rate=dailyH.length>=2?_avg(dailyH.slice(-2).map(x=>x[1])):0;const daysLeft=rate>0?Math.ceil(inH/rate):999;const risk=daysLeft>desmontajeDias?'ALTO':'BAJO';return{hall:h2,pending:inH,rate:Math.round(rate),daysNeeded:daysLeft,risk};});

  // Eficiencia
  const camposVacios=all.filter(i=>!i.empresa||!i.hall||!i.matricula).length;
  const errorRate=_pct(camposVacios,all.length);
  const totalRetrasoMin=retrasos.reduce((a,b)=>a+b,0);
  const costoRetrasos=Math.round(totalRetrasoMin/60*(_cfg.costoHoraRetraso||150));
  const byTipoVeh=_countBy(all,'tipoVehiculo');
  const byEmpresa=_countBy(all,'empresa').slice(0,15);
  const byDayOfWeek={Lu:0,Ma:0,Mi:0,Ju:0,Vi:0,Sa:0,Do:0};
  const dias=['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  all.forEach(i=>{const d=new Date(i.entrada);if(!isNaN(d))byDayOfWeek[dias[d.getDay()]]++;});
  const actualThroughputH=hoy.length/Math.max(1,(new Date().getHours()-opStart));

  // Health score
  const scores=[];
  scores.push(Math.min(100,_pct(conSalida.length,all.length)));
  scores.push(pctOnTime||100);
  scores.push(100-Math.min(100,_pct(stuck.length,enRecinto.length||1)));
  scores.push(100-errorRate);
  scores.push(Math.min(100,Math.round(actualThroughputH/(_tgt.throughputHora||20)*100)));
  const healthScore=Math.round(_avg(scores));

  let countdown=null;if(ev.fin){const diff=Math.ceil((new Date(ev.fin)-new Date())/(86400000));countdown=diff>0?diff:0;}

  const empresas=[...new Set(all.map(i=>i.empresa).filter(Boolean))].sort();

  return{all,ref,ing,ag,mov,cond,emp,halls,today,empresas,
    throughputByDay,throughputByHour,enRecinto,conSalida,hoy,avgPerm,medPerm,p95Perm,maxPerm,permanencias,
    flujoNeto,ocupByHall,throughputHall,enCola,bottlenecks,byTurno,
    fase,dailyByHall,curvaReal,idealPerDay,etaByHall,vaciadoRate,salidaByDay,totalTrailers:_cfg.totalTrailers,montajeDias:_cfg.montajeDias,desmontajeDias:_cfg.desmontajeDias,
    exitRate,remainingInRecinto,daysToComplete,
    agCompleted,agOnTime,pctOnTime,agNoShow,pctNoShow,retrasos,avgRetraso,empRetrasoRank,condRetrasoRank,retrasoHist,
    descTipos,descAvg,balanceStd,standConflicts,rotByHall,
    stuck,noExit24h,deadHours,hallTrend,
    forecastDays,predictedPeak,hallRisk,
    camposVacios,errorRate,costoRetrasos,totalRetrasoMin,
    byTipoVeh,byEmpresa,byDayOfWeek,actualThroughputH,
    healthScore,countdown};
}

// ─── MAIN PAINT ───
function _paint() {
  if (!_c) return;
  const t = T();
  const D = _compute();
  const halls = D.halls;
  const empresas = D.empresas;

  const subs=[['resumen','📊 Resumen'],['flujo','🔄 Flujo'],['montaje','📐 Montaje/Desm.'],['puntualidad','⏱ Puntualidad'],['anomalias','🚨 Anomalías'],['predicciones','🔮 Predicciones'],['eficiencia','⚡ Eficiencia'],['config','⚙️ Config']];

  let h=`<div style="max-width:1200px;margin:0 auto"><div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center;margin-bottom:6px;border-bottom:1px solid ${t.border};padding-bottom:6px">`;
  h+=subs.map(([id,l])=>`<button style="padding:3px 8px;font-size:10px;border-radius:20px;border:1px solid ${_sub===id?t.acc:t.border};background:${_sub===id?t.acc:'transparent'};color:${_sub===id?'#fff':t.t3};font-weight:700;cursor:pointer" onclick="window._pa3.go('${id}')">${l}</button>`).join('');
  h+=`<span style="flex:1"></span>`;
  h+=`<select style="font-size:10px;padding:2px 6px;border-radius:12px;border:1px solid ${t.border};background:${t.card};color:${t.text}" onchange="window._pa3.hall(this.value)"><option value="">🏟 Todos halls</option>${halls.map(h2=>`<option value="${h2}" ${_hallF===h2?'selected':''}>${h2}</option>`).join('')}</select>`;
  h+=`<select style="font-size:10px;padding:2px 6px;border-radius:12px;border:1px solid ${t.border};background:${t.card};color:${t.text};max-width:120px" onchange="window._pa3.emp(this.value)"><option value="">🏢 Todas</option>${empresas.map(e2=>`<option value="${esc(e2)}" ${_empresaF===e2?'selected':''}>${esc(e2).slice(0,20)}</option>`).join('')}</select>`;
  h+=`<input type="date" value="${_dateFrom}" onchange="window._pa3.df(this.value)" style="font-size:10px;padding:2px 4px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}">`;
  h+=`<input type="date" value="${_dateTo}" onchange="window._pa3.dt(this.value)" style="font-size:10px;padding:2px 4px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}">`;
  if(_dateFrom||_dateTo||_hallF||_empresaF)h+=`<button style="padding:2px 7px;font-size:10px;border-radius:20px;border:1px solid ${t.border};background:transparent;color:${t.t3};cursor:pointer" onclick="window._pa3.reset()">✕</button>`;
  h+=`</div>`;

  switch(_sub){
    case 'flujo':h+=_renderFlujo(D,t);break;
    case 'montaje':h+=_renderMontaje(D,t);break;
    case 'puntualidad':h+=_renderPuntualidad(D,t);break;
    case 'anomalias':h+=_renderAnomalias(D,t);break;
    case 'predicciones':h+=_renderPredicciones(D,t);break;
    case 'eficiencia':h+=_renderEficiencia(D,t);break;
    case 'config':h+=_renderConfig(D,t);break;
    default:h+=_renderResumen(D,t);
  }
  h+=`</div>`;
  _c.innerHTML=h;
}

// ─── SUB RENDERS ───
function _renderResumen(D,t){
  const grn='#10b981',red='#ef4444',amb='#f59e0b',blue=t.acc||'#3b82f6',pur='#8b5cf6',teal='#0d9f6e';
  let h='';
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('SALUD EVENTO',`${_semaforo(D.healthScore,75,50)} ${D.healthScore}`,'/100',D.healthScore>=75?grn:D.healthScore>=50?amb:red,t),t,D.healthScore>=75?grn:D.healthScore>=50?amb:red);
  h+=_card('',_kpi('FASE',D.fase.toUpperCase(),'',pur,t),t,pur);
  h+=D.countdown!==null?_card('',_kpi('COUNTDOWN',D.countdown,'días restantes',D.countdown>3?blue:red,t),t,D.countdown>3?blue:red):_card('',_kpi('REGISTROS',D.all.length,'total',blue,t),t);
  h+=_card('',_kpi('HOY',D.hoy.length,`${Math.round(D.actualThroughputH)}/h`,D.actualThroughputH>=(_tgt.throughputHora||20)?grn:amb,t),t);
  h+=_card('',_kpi('EN COLA',D.enCola,'rampa/cabina',D.enCola>10?red:grn,t),t);
  h+=`</div>`;
  h+=`<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('EN RECINTO',D.enRecinto.length,'activos',grn,t),t);
  h+=_card('',_kpi('CON SALIDA',D.conSalida.length,_pct(D.conSalida.length,D.all.length)+'%',blue,t),t);
  h+=_card('',_kpi('PERMANENCIA',_minToH(D.avgPerm),'promedio',teal,t),t);
  h+=_card('',_kpi('PUNTUALIDAD',D.pctOnTime+'%','',D.pctOnTime>=85?grn:amb,t),t);
  h+=_card('',_kpi('NO-SHOW',D.pctNoShow+'%','',D.pctNoShow<=5?grn:red,t),t);
  h+=_card('',_kpi('€ RETRASOS','€'+D.costoRetrasos,'estimado',red,t),t);
  h+=`</div>`;
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('📈 Tendencia diaria',_spark(D.throughputByDay,blue)+(D.forecastDays.length?`<div style="font-size:9px;color:${t.t3};margin-top:4px">Forecast: ${D.forecastDays.map(f=>f[0].slice(5)+':'+f[1]).join(', ')}</div>`:''),t);
  h+=_card('🔄 Flujo neto/hora',_bar(D.flujoNeto.filter(x=>x[1]!==0),blue,t),t);
  h+=`</div>`;
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">`;
  h+=_card('🏟 Ocupación Hall',D.ocupByHall.map(o=>`<div style="display:flex;align-items:center;gap:4px;margin:2px 0"><span style="font-size:9px;font-weight:700;min-width:30px">${o.hall}</span><div style="flex:1;height:14px;background:${t.bg};border-radius:7px;overflow:hidden;position:relative"><div style="height:100%;width:${o.pct}%;background:${o.pct>80?red:o.pct>60?amb:grn};border-radius:7px"></div><span style="position:absolute;right:4px;top:0;font-size:8px;font-weight:700;line-height:14px">${o.ocup}/${o.cap}</span></div><span style="font-size:9px;font-weight:700;min-width:30px;text-align:right">${o.pct}%</span></div>`).join(''),t);
  h+=_card('🚛 Top Empresas',_bar(D.byEmpresa.slice(0,8),teal,t),t);
  h+=_card('🚗 Tipo Vehículo',`<div style="display:flex;align-items:center;gap:8px">${_donut(D.byTipoVeh.slice(0,6))}<div style="display:flex;flex-direction:column;gap:2px">${D.byTipoVeh.slice(0,6).map(([k,v],i)=>`<div style="font-size:9px"><span style="color:${['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'][i%6]}">●</span> ${esc(k)}: <b>${v}</b></div>`).join('')}</div></div>`,t);
  h+=`</div>`;
  return h;
}
function _renderFlujo(D,t){
  const blue=t.acc||'#3b82f6',teal='#0d9f6e',amb='#f59e0b';
  let h='';
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🕐 Por hora',_bar(D.throughputByHour.filter(x=>x[1]>0),blue,t),t);
  h+=_card('📊 Permanencia',`<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;text-align:center">${[['Prom',_minToH(D.avgPerm),blue],['Mediana',_minToH(D.medPerm),teal],['P95',_minToH(D.p95Perm),amb],['Máx',_minToH(D.maxPerm),'#ef4444']].map(([l,v,c])=>`<div style="background:${t.bg};border-radius:6px;padding:6px"><div style="font-size:16px;font-weight:900;color:${c}">${v}</div><div style="font-size:8px;color:${t.t3}">${l}</div></div>`).join('')}</div>`,t);
  h+=`</div>`;
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('🚧 Cuellos de botella',D.bottlenecks.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg}"><th style="padding:3px 6px;text-align:left">Step</th><th>Prom.</th><th>Máx.</th><th>#</th></tr>${D.bottlenecks.slice(0,8).map(b=>`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:3px 6px;font-weight:600">${b.step}</td><td style="text-align:center;color:${b.avg>30?'#ef4444':amb}">${b.avg}m</td><td style="text-align:center">${b.max}m</td><td style="text-align:center">${b.count}</td></tr>`).join('')}</table>`:`<div style="font-size:10px;color:${t.t3};text-align:center;padding:12px">Sin datos tracking</div>`,t,amb);
  h+=_card('🔄 Por turno',`<div style="display:flex;gap:8px;justify-content:center">${Object.entries(D.byTurno).map(([turno,count])=>`<div style="text-align:center;background:${t.bg};border-radius:8px;padding:10px 16px"><div style="font-size:20px;font-weight:900;color:${blue}">${count}</div><div style="font-size:9px;color:${t.t3}">${turno}</div></div>`).join('')}</div>`,t);
  h+=`</div>`;
  return h;
}
function _renderMontaje(D,t){
  const blue=t.acc||'#3b82f6',grn='#10b981',pur='#8b5cf6',red='#ef4444',amb='#f59e0b';
  let h='';
  const curva=D.curvaReal;const ideal=D.idealPerDay;
  h+=_card('📐 Curva S',curva.length>=2?(()=>{const mx=Math.max(D.totalTrailers,...curva.map(x=>x[1]));const w=600,ht=180,pad=40;const step=(w-pad*2)/Math.max(curva.length-1,1);const y=(v)=>ht-pad-(v/mx)*(ht-pad*2);const realPts=curva.map((x,i)=>`${pad+i*step},${y(x[1])}`).join(' ');let idealCum=0;const idealPts=curva.map((x,i)=>{idealCum+=ideal;return`${pad+i*step},${y(Math.min(idealCum,D.totalTrailers))}`;}).join(' ');return`<svg viewBox="0 0 ${w} ${ht}" style="width:100%;height:${ht}px"><line x1="${pad}" y1="${y(D.totalTrailers)}" x2="${w-pad}" y2="${y(D.totalTrailers)}" stroke="${t.t3}" stroke-dasharray="4" stroke-width="1"/><text x="${pad-2}" y="${y(D.totalTrailers)+4}" font-size="8" fill="${t.t3}" text-anchor="end">${D.totalTrailers}</text><polyline points="${idealPts}" fill="none" stroke="${t.t3}" stroke-width="1.5" stroke-dasharray="6" opacity="0.5"/><polyline points="${realPts}" fill="none" stroke="${blue}" stroke-width="2.5" stroke-linecap="round"/><text x="${w-pad}" y="${ht-8}" font-size="8" fill="${t.t3}" text-anchor="end">— Real — — Ideal</text></svg>`;})():`<div style="text-align:center;font-size:10px;color:${t.t3};padding:20px">Datos insuficientes</div>`,t,blue);
  h+=`<div style="margin-top:8px">`+_card('⏱ ETA por Hall',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg};font-weight:700"><th style="padding:4px 6px;text-align:left">Hall</th><th>Hecho</th><th>Pend.</th><th>Prom/d</th><th>ETA</th><th>Riesgo</th></tr>${D.etaByHall.filter(e=>e.total>0).map(e=>`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:4px 6px;font-weight:700">${e.hall}</td><td style="text-align:center">${e.done}/${e.total}</td><td style="text-align:center;color:${e.remaining>0?amb:grn}">${e.remaining}</td><td style="text-align:center">${e.avgDaily}</td><td style="text-align:center;font-weight:700;color:${e.etaDays>D.desmontajeDias?red:grn}">${e.etaDays===999?'∞':e.etaDays+'d'}</td><td style="text-align:center">${e.etaDays>D.desmontajeDias?'🔴':'🟢'}</td></tr>`).join('')}</table>`,t,amb)+`</div>`;
  h+=`<div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
  h+=_card('📤 Salidas/día',_spark(D.salidaByDay,grn)+`<div style="font-size:9px;color:${t.t3};margin-top:4px">Rate: ${Math.round(D.vaciadoRate)}/día · Pend: ${D.remainingInRecinto} · ETA: ${D.daysToComplete===999?'∞':D.daysToComplete+'d'}</div>`,t,grn);
  h+=_card('📊 Último día/Hall',_bar(D.halls.map(h2=>{const d=(D.dailyByHall[h2]||[]);const last=d.length?d[d.length-1][1]:0;return[h2,last];}).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),pur,t),t);
  h+=`</div>`;
  return h;
}
function _renderPuntualidad(D,t){
  const grn='#10b981',red='#ef4444',amb='#f59e0b',blue=t.acc||'#3b82f6',teal='#0d9f6e';
  let h='';
  h+=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('PUNT.',D.pctOnTime+'%','',D.pctOnTime>=85?grn:amb,t),t,D.pctOnTime>=85?grn:amb);
  h+=_card('',_kpi('NO-SHOWS',D.pctNoShow+'%',D.agNoShow.length,D.pctNoShow<=5?grn:red,t),t);
  h+=_card('',_kpi('RETRASO',D.avgRetraso+'m','promedio',D.avgRetraso<=10?grn:red,t),t);
  h+=_card('',_kpi('CITAS',D.ag.length,'total',blue,t),t);
  h+=_card('',_kpi('COMPLET.',D.agCompleted.length,_pct(D.agCompleted.length,D.ag.length)+'%',teal,t),t);
  h+=`</div>`;
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('📊 Distribución retrasos',_bar(Object.entries(D.retrasoHist).filter(x=>x[1]>0),amb,t),t);
  h+=_card('🏢 Peores empresas',D.empRetrasoRank.length?`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg}"><th style="padding:3px 6px;text-align:left">Empresa</th><th>Prom</th><th>%Tarde</th></tr>${D.empRetrasoRank.slice(0,6).map(e=>`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:3px 6px">${esc(e.empresa)}</td><td style="text-align:center;color:${e.avg>15?red:amb}">${e.avg>0?'+':''}${e.avg}m</td><td style="text-align:center">${e.pctLate}%</td></tr>`).join('')}</table>`:'Sin datos',t,red);
  h+=`</div>`;
  return h;
}
function _renderAnomalias(D,t){
  const red='#ef4444',amb='#f59e0b',grn='#10b981',pur='#8b5cf6';
  const issues=[{ico:'🚨',label:'Atascados',count:D.stuck.length,c:red},{ico:'⏰',label:'>24h sin salida',count:D.noExit24h.length,c:red},{ico:'💀',label:'Horas muertas',count:D.deadHours.length,c:amb},{ico:'🔀',label:'Conflictos stand',count:D.standConflicts.length,c:red}];
  let h=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">${issues.map(i=>`<div style="background:${t.card};border:1px solid ${t.border};border-radius:8px;padding:8px;text-align:center;border-left:3px solid ${i.count>0?i.c:grn}"><div style="font-size:20px;font-weight:900;color:${i.count>0?i.c:grn}">${i.ico} ${i.count}</div><div style="font-size:9px;color:${t.t3}">${i.label}</div></div>`).join('')}</div>`;
  if(D.stuck.length)h+=_card('🚨 Atascados',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg}"><th style="padding:3px;text-align:left">Matrícula</th><th>Hall</th><th>Empresa</th><th>Horas</th></tr>${D.stuck.slice(0,10).map(i=>{const hrs=Math.round((Date.now()-new Date(i.entrada))/3600000);return`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:3px;font-weight:700">${i.matricula}</td><td>${i.hall||'–'}</td><td style="font-size:9px">${i.empresa||'–'}</td><td style="font-weight:700;color:${hrs>24?red:amb}">${hrs}h</td></tr>`;}).join('')}</table>`,t,red);
  if(Object.keys(D.hallTrend).length)h+=`<div style="margin-top:8px">`+_card('📉 Halls degradándose',Object.entries(D.hallTrend).map(([h2,d])=>`<div style="font-size:10px;margin:2px 0"><b>${h2}</b> ↓${d.drop}% (${d.avgPrev}→${d.avgLast}/día)</div>`).join(''),t,red)+`</div>`;
  if(!D.stuck.length&&!Object.keys(D.hallTrend).length&&!D.standConflicts.length)h+=`<div style="text-align:center;padding:40px;color:${t.t3}">✅ Sin anomalías</div>`;
  return h;
}
function _renderPredicciones(D,t){
  const blue=t.acc||'#3b82f6',grn='#10b981',red='#ef4444',pur='#8b5cf6';
  let h='';
  h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">`;
  h+=_card('🔮 Forecast',D.forecastDays.length?`<div style="display:flex;gap:8px;justify-content:center">${D.forecastDays.map(([d,v])=>`<div style="text-align:center;background:${t.bg};border-radius:8px;padding:10px 16px"><div style="font-size:20px;font-weight:900;color:${pur}">${v}</div><div style="font-size:9px;color:${t.t3}">${d.slice(5)}</div></div>`).join('')}</div>`:'Necesita ≥3 días',t,pur);
  h+=_card('⏰ Hora pico',D.predictedPeak?`<div style="text-align:center"><div style="font-size:28px;font-weight:900;color:${blue}">${D.predictedPeak[0]}:00</div><div style="font-size:10px;color:${t.t3}">${D.predictedPeak[1]} registros</div></div>`:'Sin datos',t);
  h+=`</div>`;
  h+=_card('🎯 Riesgo por Hall',`<table style="width:100%;font-size:10px;border-collapse:collapse"><tr style="background:${t.bg};font-weight:700"><th style="padding:4px 6px;text-align:left">Hall</th><th>Pend.</th><th>Rate/d</th><th>Días</th><th>Riesgo</th></tr>${D.hallRisk.filter(r2=>r2.pending>0).map(r2=>`<tr style="border-bottom:1px solid ${t.border}"><td style="padding:4px 6px;font-weight:700">${r2.hall}</td><td style="text-align:center">${r2.pending}</td><td style="text-align:center">${r2.rate}</td><td style="text-align:center;color:${r2.risk==='ALTO'?red:grn}">${r2.daysNeeded===999?'∞':r2.daysNeeded}</td><td style="text-align:center">${r2.risk==='ALTO'?'🔴':'🟢'}</td></tr>`).join('')}</table>`,t);
  h+=`<div style="margin-top:8px">`+_card('📅 Por día semana',_bar(Object.entries(D.byDayOfWeek).filter(x=>x[1]>0),blue,t),t)+`</div>`;
  return h;
}
function _renderEficiencia(D,t){
  const grn='#10b981',red='#ef4444',amb='#f59e0b',blue=t.acc||'#3b82f6';
  let h='';
  h+=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px">`;
  h+=_card('',_kpi('ERRORES',D.errorRate+'%',D.camposVacios+' incompletos',D.errorRate<=5?grn:red,t),t);
  h+=_card('',_kpi('€ RETRASOS','€'+D.costoRetrasos,Math.round(D.totalRetrasoMin)+'min',red,t),t);
  h+=_card('',_kpi('BALANCE','σ='+D.balanceStd,'halls',D.balanceStd<10?grn:amb,t),t);
  h+=_card('',_kpi('DESCARGA',D.descTipos.length?D.descTipos[0][0]:'–','tipo principal',blue,t),t);
  h+=`</div>`;
  h+=_card('📦 Descarga por tipo',`<div style="display:flex;gap:8px;justify-content:center">${D.descTipos.map(([k,v])=>`<div style="text-align:center;background:${t.bg};border-radius:8px;padding:8px 14px"><div style="font-size:18px;font-weight:900;color:${grn}">${v}</div><div style="font-size:9px;color:${t.t3}">${k}</div><div style="font-size:8px;color:${t.t3}">~${D.descAvg[k]||'?'}m</div></div>`).join('')}</div>`,t);
  return h;
}
function _renderConfig(D,t){
  return _card('⚙️ Configuración',`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Total trailers</label><input type="number" value="${_cfg.totalTrailers}" onchange="window._pa3.cfg('totalTrailers',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Días montaje</label><input type="number" value="${_cfg.montajeDias}" onchange="window._pa3.cfg('montajeDias',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Días desmontaje</label><input type="number" value="${_cfg.desmontajeDias}" onchange="window._pa3.cfg('desmontajeDias',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">€/hora retraso</label><input type="number" value="${_cfg.costoHoraRetraso}" onchange="window._pa3.cfg('costoHoraRetraso',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">SLA puntualidad (min)</label><input type="number" value="${_cfg.slaMin}" onchange="window._pa3.cfg('slaMin',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Target throughput/h</label><input type="number" value="${_tgt.throughputHora}" onchange="window._pa3.tgt('throughputHora',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Permanencia máx (min)</label><input type="number" value="${_tgt.permanenciaMax}" onchange="window._pa3.tgt('permanenciaMax',+this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
    <div><label style="font-size:9px;font-weight:700;color:${t.t3}">Turno mañana</label><input type="time" value="${_cfg.turnoM}" onchange="window._pa3.cfg('turnoM',this.value)" style="width:100%;padding:4px 6px;border:1px solid ${t.border};border-radius:6px;background:${t.card};color:${t.text}"></div>
  </div>`,t);
}

// ─── GLOBAL API ───
window._pa3 = {
  go: (s) => { _sub = s; _paint(); },
  hall: (v) => { _hallF = v; _paint(); },
  emp: (v) => { _empresaF = v; _paint(); },
  df: (v) => { _dateFrom = v; _paint(); },
  dt: (v) => { _dateTo = v; _paint(); },
  reset: () => { _dateFrom=''; _dateTo=''; _hallF=''; _empresaF=''; _paint(); },
  cfg: (k,v) => { _cfg[k]=v; _paint(); },
  tgt: (k,v) => { _tgt[k]=v; _paint(); },
};
