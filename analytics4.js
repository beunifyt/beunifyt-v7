// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics4.js — AI Intelligence
// Anomalías, predicciones, recomendaciones, reportes. Local.
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, nowLocal, formatDate } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { crossRead } from './field-engine.js';

let _c,_u,_sub='insights',_allData={},_lastReport='';
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};

export function render(ct,us){_c=ct;_u=us;_allData={};loadAll().then(()=>paint());return()=>{};}

async function loadAll(){
  const[ing,ref,emb,ag,cd]=await Promise.all([crossRead('ingresos2'),crossRead('ingresos'),crossRead('movimientos'),crossRead('agenda'),crossRead('conductores')]);
  _allData={all:[...ing,...ref,...emb,...ag],ref,ing,emb,ag,cd,empresas:await crossRead('empresas').catch(()=>[])};
}

function analyze(){
  const today=new Date().toISOString().slice(0,10),now=Date.now(),DAY=86400000;
  const all=_allData.all||[],cd=_allData.cd||[],ag=_allData.ag||[];
  const alerts=[],recs=[],preds=[];

  // Volume anomaly
  const last7=[];for(let i=1;i<=7;i++){const d=new Date(now-i*DAY).toISOString().slice(0,10);last7.push(all.filter(x=>(x.fecha||x.entrada||'').startsWith(d)).length);}
  const avg7=last7.length?Math.round(last7.reduce((a,b)=>a+b,0)/last7.length):0;
  const todayC=all.filter(x=>(x.fecha||x.entrada||'').startsWith(today)).length;
  if(avg7>0&&todayC>avg7*1.5)alerts.push({sev:'high',icon:'📈',title:'Volumen alto',desc:`Hoy: ${todayC} vs prom 7d: ${avg7} (+${Math.round((todayC/avg7-1)*100)}%)`});
  else if(avg7>0&&todayC<avg7*0.5&&new Date().getHours()>12)alerts.push({sev:'medium',icon:'📉',title:'Volumen bajo',desc:`Hoy: ${todayC} vs prom 7d: ${avg7}`});

  // Long stay
  const long=all.filter(i=>{if(!i.entrada||i.salida)return false;return(now-new Date(i.entrada).getTime())/60000>240;});
  if(long.length)alerts.push({sev:long.length>5?'high':'medium',icon:'⏰',title:`${long.length} vehículos +4h sin salida`,desc:`${long.length} registros llevan más de 4 horas en recinto.`});

  // Docs expired
  const expired=cd.filter(c=>c.docExpiry&&c.docExpiry<today);
  const soon=cd.filter(c=>{if(!c.docExpiry)return false;const d=(new Date(c.docExpiry).getTime()-now)/DAY;return d>0&&d<=30;});
  if(expired.length)alerts.push({sev:'high',icon:'🔴',title:`${expired.length} docs vencidos`,desc:'Documentación vencida. Requiere acción.'});
  if(soon.length)alerts.push({sev:'medium',icon:'🟡',title:`${soon.length} docs por vencer (30d)`,desc:'Vencen en los próximos 30 días.'});

  // Recs: slow processes
  const withT=all.filter(i=>i.entrada&&i.salida);
  if(withT.length>=10){const times=withT.map(i=>(new Date(i.salida)-new Date(i.entrada))/60000);const avg=Math.round(times.reduce((a,b)=>a+b,0)/times.length);const p95=Math.round(times.sort((a,b)=>a-b)[Math.floor(times.length*0.95)]);if(p95>avg*3)recs.push({icon:'⚡',pri:'high',title:'Procesos lentos',desc:`P95: ${p95}m vs promedio: ${avg}m (${Math.round(p95/avg)}x)`,action:'Revisar registros más lentos.'});}

  // Inactive companies
  const empAct={};all.forEach(i=>{if(i.empresa)empAct[i.empresa]=Math.max(empAct[i.empresa]||0,new Date(i.fecha||i.entrada||0).getTime());});
  const inact=Object.entries(empAct).filter(([,ts])=>(now-ts)/DAY>30);
  if(inact.length)recs.push({icon:'🏢',pri:'medium',title:`${inact.length} empresas inactivas (+30d)`,desc:'Sin actividad en 30 días.',action:'Contactar para verificar estado.'});

  // Hall imbalance
  const hallC={};all.filter(i=>(i.fecha||i.entrada||'').startsWith(today)).forEach(i=>{if(i.hall)hallC[i.hall]=(hallC[i.hall]||0)+1;});
  const halls=Object.entries(hallC).sort((a,b)=>b[1]-a[1]);
  if(halls.length>1&&halls[0][1]>halls[halls.length-1][1]*3)recs.push({icon:'🏟',pri:'medium',title:'Desbalance halls',desc:`${halls[0][0]}: ${halls[0][1]} vs ${halls[halls.length-1][0]}: ${halls[halls.length-1][1]}`,action:'Redistribuir carga.'});

  // Predictions
  if(last7.length>=5){const trend=(last7[0]-last7[last7.length-1])/last7.length;preds.push({icon:'📊',title:'Volumen mañana',value:Math.max(0,Math.round(avg7+trend)),unit:'registros',conf:last7.every(v=>Math.abs(v-avg7)<avg7*0.3)?'alta':'media'});}
  const hourC={};for(let h=0;h<24;h++)hourC[h]=0;all.filter(x=>{const d=(x.fecha||x.entrada||'').slice(0,10);return d&&(now-new Date(d).getTime())/DAY<=7;}).forEach(x=>{const h=parseInt((x.fecha||x.entrada||'').slice(11,13));if(!isNaN(h))hourC[h]++;});
  const peak=Object.entries(hourC).sort((a,b)=>b[1]-a[1])[0];
  if(peak&&peak[1]>0)preds.push({icon:'🕐',title:'Hora pico',value:String(peak[0]).padStart(2,'0')+':00',unit:'',conf:'alta'});
  const atRisk=Object.entries(empAct).filter(([,ts])=>{const d=(now-ts)/DAY;return d>15&&d<=45;}).map(([e])=>e);
  if(atRisk.length)preds.push({icon:'⚠️',title:'Riesgo churn',value:atRisk.length,unit:'empresas',conf:'media'});

  return{alerts,recs,preds};
}

function healthScore(a){let s=100;a.alerts.forEach(x=>{s-=x.sev==='high'?15:x.sev==='medium'?8:3;});a.recs.forEach(x=>{s-=x.pri==='high'?5:2;});return Math.max(0,Math.min(100,s));}
function sColor(s){return s>=80?'#10b981':s>=60?'#f59e0b':s>=40?'#f97316':'#ef4444';}
function sLabel(s){return s>=80?'Excelente':s>=60?'Bueno':s>=40?'Atención':'Crítico';}
function gauge(score,c){const cl=sColor(score),rad=a=>(a-180)*Math.PI/180,cx=80,cy=75,r=60,angle=score/100*180;const x2=cx+r*Math.cos(rad(angle)),y2=cy+r*Math.sin(rad(angle));return`<svg viewBox="0 0 160 95" width="160" height="95"><path d="M ${cx-r},${cy} A ${r},${r} 0 0 1 ${cx+r},${cy}" fill="none" stroke="${c.bg2}" stroke-width="12" stroke-linecap="round"/><path d="M ${cx-r},${cy} A ${r},${r} 0 ${angle>180?1:0} 1 ${x2},${y2}" fill="none" stroke="${cl}" stroke-width="12" stroke-linecap="round"/><text x="${cx}" y="${cy-8}" text-anchor="middle" font-size="28" font-weight="900" fill="${cl}">${score}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="10" fill="${c.t3}">${sLabel(score)}</text></svg>`;}

function paint(){
  if(!_c)return;
  const c=C(),a=analyze(),score=healthScore(a);
  const btn=(id,lbl,cur,badge)=>`<button onclick="window._ai.sub('${id}')" style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:${cur?'700':'500'};cursor:pointer;border:1.5px solid ${cur?c.blue:c.border};background:${cur?c.bll:c.bg2};color:${cur?c.blue:c.t3}">${lbl}${badge?` <span style="background:${c.red};color:#fff;font-size:9px;padding:1px 5px;border-radius:8px">${badge}</span>`:''}</button>`;
  const kpi=(v,l,col)=>`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;text-align:center"><div style="font-size:24px;font-weight:800;color:${col}">${v}</div><div style="font-size:11px;color:${c.t3}">${l}</div></div>`;

  let h=`<div style="max-width:1200px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-size:22px;font-weight:700;color:${c.text}">🤖 AI Intelligence</div><span style="flex:1"></span>
    ${btn('insights','🧠 Insights',_sub==='insights',a.recs.length||null)}${btn('alerts','🚨 Alertas',_sub==='alerts',a.alerts.length||null)}${btn('predictions','🔮 Predicciones',_sub==='predictions')}${btn('reports','📄 Reportes',_sub==='reports')}
  </div>
  <div style="display:grid;grid-template-columns:180px 1fr 1fr 1fr;gap:10px;margin-bottom:14px">
    <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">${gauge(score,c)}<div style="font-size:10px;font-weight:700;color:${c.t3}">Health Score</div></div>
    ${kpi(a.alerts.filter(x=>x.sev==='high').length,'Alertas críticas',c.red)}${kpi(a.recs.length,'Recomendaciones',c.blue)}${kpi(a.preds.length,'Predicciones',c.purple)}
  </div>`;

  if(_sub==='insights'){
    if(a.recs.length){
      h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;margin-bottom:14px"><div style="font-size:12px;font-weight:700;margin-bottom:10px">💡 Recomendaciones</div>`;
      a.recs.forEach(r=>{const pc=r.pri==='high'?c.red:r.pri==='medium'?c.amber:c.green;h+=`<div style="background:${pc}08;border:1px solid ${pc}20;border-left:3px solid ${pc};border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:16px">${r.icon}</span><span style="font-weight:700;font-size:12px">${safeHtml(r.title)}</span><span style="margin-left:auto;font-size:9px;font-weight:700;color:${pc};text-transform:uppercase;background:${pc}15;padding:2px 6px;border-radius:8px">${r.pri}</span></div><div style="font-size:11px;color:${c.t3}">${safeHtml(r.desc)}</div><div style="font-size:10px;color:${c.t3};margin-top:3px">💡 ${safeHtml(r.action)}</div></div>`;});
      h+='</div>';
    } else h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:30px;text-align:center;margin-bottom:14px"><div style="font-size:40px">✨</div><div style="font-size:14px;font-weight:700;color:${c.green}">Todo en orden</div></div>`;
    const today=new Date().toISOString().slice(0,10),tD=(_allData.all||[]).filter(i=>(i.fecha||i.entrada||'').startsWith(today)),inR=tD.filter(i=>!i.salida).length;
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:6px">📋 Resumen — ${today}</div><div style="font-size:12px;color:${c.t3};line-height:1.8">${tD.length?`Hoy: <b>${tD.length}</b> registros. `:'Sin registros hoy. '}${inR?`<b>${inR}</b> en recinto. `:''}${a.alerts.length?`<span style="color:${c.red}"><b>${a.alerts.length}</b> alertas.</span>`:`<span style="color:${c.green}">Sin alertas.</span>`}</div></div>`;

  } else if(_sub==='alerts'){
    const sorted=[...a.alerts].sort((a,b)=>({high:0,medium:1,low:2}[a.sev]||9)-({high:0,medium:1,low:2}[b.sev]||9));
    if(sorted.length){sorted.forEach(al=>{const cl=al.sev==='high'?c.red:al.sev==='medium'?c.amber:c.blue;h+=`<div style="background:${c.card};border:1px solid ${c.border};border-left:3px solid ${cl};border-radius:12px;padding:14px;margin-bottom:8px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="font-size:16px">${al.icon}</span><span style="font-weight:700;font-size:12px">${safeHtml(al.title)}</span><span style="margin-left:auto;font-size:9px;font-weight:700;color:${cl};text-transform:uppercase">${al.sev}</span></div><div style="font-size:11px;color:${c.t3}">${safeHtml(al.desc)}</div></div>`;});}
    else h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:30px;text-align:center"><div style="font-size:40px">🟢</div><div style="font-size:14px;font-weight:700;color:${c.green}">Sin alertas</div></div>`;

  } else if(_sub==='predictions'){
    if(a.preds.length){h+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">`;a.preds.forEach(p=>{const cc=p.conf==='alta'?c.green:c.amber;h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:18px">${p.icon}</span><span style="font-weight:700;font-size:12px">${safeHtml(p.title)}</span></div><div style="font-size:28px;font-weight:900;color:${c.blue}">${p.value} <span style="font-size:12px;color:${c.t3}">${p.unit}</span></div><div style="font-size:9px;margin-top:4px"><span style="color:${cc};font-weight:700">● Confianza ${p.conf}</span></div></div>`;});h+='</div>';}
    else h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:30px;text-align:center"><div style="font-size:40px">🔮</div><div style="font-size:14px;color:${c.t3}">Datos insuficientes</div></div>`;

  } else if(_sub==='reports'){
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;margin-bottom:12px"><div style="font-size:12px;font-weight:700;margin-bottom:10px">📄 Generar reporte</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="window._ai.rpt('daily')" style="padding:6px 14px;border-radius:20px;font-size:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.t3};cursor:pointer">📅 Diario</button>
        <button onclick="window._ai.rpt('weekly')" style="padding:6px 14px;border-radius:20px;font-size:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.t3};cursor:pointer">📊 Semanal</button>
        <button onclick="window._ai.rpt('adhoc')" style="padding:6px 14px;border-radius:20px;font-size:11px;border:1px solid ${c.purple};background:${c.purple};color:#fff;cursor:pointer">🧠 Ad-hoc</button>
      </div></div>`;
    if(_lastReport)h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:6px">📋 Resultado</div><pre style="white-space:pre-wrap;font-size:11px;color:${c.t3};background:${c.bg2};padding:12px;border-radius:8px;max-height:400px;overflow-y:auto">${safeHtml(_lastReport)}</pre></div>`;
  }
  h+='</div>';
  _c.innerHTML=h;
}

function genReport(type){
  const today=new Date().toISOString().slice(0,10),a=analyze(),all=_allData.all||[],sep='═'.repeat(50);
  let r='';
  if(type==='daily'){const td=all.filter(i=>(i.fecha||i.entrada||'').startsWith(today));r=`${sep}\n  REPORTE DIARIO — ${today}\n${sep}\n\nRegistros hoy: ${td.length}\nEn recinto: ${td.filter(i=>!i.salida).length}\nCon salida: ${td.filter(i=>i.salida).length}\n\n🚨 ALERTAS (${a.alerts.length})\n${a.alerts.map(x=>`  ${x.icon} [${x.sev}] ${x.title}\n    ${x.desc}`).join('\n')}\n\n💡 RECOMENDACIONES (${a.recs.length})\n${a.recs.map(x=>`  ${x.icon} ${x.title}\n    ${x.action}`).join('\n')}`;}
  else if(type==='weekly'){const now=Date.now(),wd=all.filter(i=>{const d=i.fecha||i.entrada;return d&&(now-new Date(d).getTime())<7*86400000;});r=`${sep}\n  REPORTE SEMANAL\n${sep}\n\nTotal 7 días: ${wd.length}\nPromedio diario: ${Math.round(wd.length/7)}\n\n🔮 PREDICCIONES\n${a.preds.map(p=>`  ${p.icon} ${p.title}: ${p.value} ${p.unit} (${p.conf})`).join('\n')}`;}
  else{r=`${sep}\n  ANÁLISIS AD-HOC — ${new Date().toLocaleString()}\n${sep}\n\nHealth Score: ${healthScore(a)}/100\n\n🚨 ALERTAS: ${a.alerts.length}\n${a.alerts.map(x=>`  ${x.icon} ${x.title} — ${x.desc}`).join('\n')}\n\n💡 RECOMENDACIONES: ${a.recs.length}\n${a.recs.map(x=>`  ${x.icon} ${x.title}\n    ${x.action}`).join('\n')}\n\n🔮 PREDICCIONES: ${a.preds.length}\n${a.preds.map(x=>`  ${x.icon} ${x.title}: ${x.value} ${x.unit}`).join('\n')}`;}
  _lastReport=r;toast('📄 Reporte generado','#10b981');paint();
}

window._ai={sub:(s)=>{_sub=s;paint();},rpt:(t)=>genReport(t)};
