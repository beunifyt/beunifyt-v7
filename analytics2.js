// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics2.js — Event Tracker
// Captura eventos granulares. IndexedDB local. Sin API externa.
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, nowLocal } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { crossRead } from './field-engine.js';

let _c,_u,_sub='live',_filter='all',_dateFrom='',_dateTo='';
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};

// ─── IndexedDB ──────────────────────────────────────────
const IDB='beu_events',STORE='events';
let _idb=null;
function odb(){return new Promise((res,rej)=>{if(_idb)return res(_idb);const r=indexedDB.open(IDB,1);r.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('module','module');s.createIndex('timestamp','timestamp');}};r.onsuccess=e=>{_idb=e.target.result;res(_idb);};r.onerror=e=>rej(e);});}

const _batch=[];let _bt=null;
window.trackEvent=function(evt){
  _batch.push({id:Date.now()+'_'+Math.random().toString(36).slice(2),timestamp:new Date().toISOString(),module:evt.module||'system',action:evt.action||'unknown',category:evt.category||'system',userId:evt.userId||'',metadata:evt.metadata||{},duration:evt.duration||0,success:evt.success!==false,error:evt.error||''});
  if(!_bt)_bt=setTimeout(()=>{_bt=null;if(!_batch.length)return;odb().then(db=>{const tx=db.transaction(STORE,'readwrite');const s=tx.objectStore(STORE);_batch.splice(0).forEach(e=>s.put(e));}).catch(()=>{});},500);
};

async function getEvents(f){try{const db=await odb();return new Promise(res=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).getAll();r.onsuccess=()=>{let d=r.result||[];if(f.module&&f.module!=='all')d=d.filter(e=>e.module===f.module);if(f.dateFrom)d=d.filter(e=>e.timestamp>=f.dateFrom);if(f.dateTo)d=d.filter(e=>e.timestamp<=f.dateTo+'T23:59');d.sort((a,b)=>b.timestamp.localeCompare(a.timestamp));res(d);};r.onerror=()=>res([]);});}catch(e){return[];}}
async function getCount(){try{const db=await odb();return new Promise(r=>{const q=db.transaction(STORE,'readonly').objectStore(STORE).count();q.onsuccess=()=>r(q.result);q.onerror=()=>r(0);});}catch(e){return 0;}}

// ─── Render ─────────────────────────────────────────────
export function render(ct,us){_c=ct;_u=us;paint();return()=>{};}

async function paint(){
  if(!_c)return;
  const c=C();
  const events=await getEvents({module:_filter,dateFrom:_dateFrom,dateTo:_dateTo});
  const total=await getCount();
  const today=new Date().toISOString().slice(0,10);
  const todayEv=events.filter(e=>e.timestamp.startsWith(today));
  const errEv=events.filter(e=>!e.success);
  const modC={},actC={};
  events.forEach(e=>{modC[e.module]=(modC[e.module]||0)+1;actC[e.action]=(actC[e.action]||0)+1;});
  const hourMap={};for(let i=0;i<24;i++)hourMap[String(i).padStart(2,'0')]=0;
  todayEv.forEach(e=>{const h=e.timestamp.slice(11,13);if(h)hourMap[h]++;});
  const hArr=Object.entries(hourMap),hMax=Math.max(...hArr.map(x=>x[1]),1);

  const btn=(id,lbl,cur)=>`<button onclick="window._trk.sub('${id}')" style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:${cur?'700':'500'};cursor:pointer;border:1.5px solid ${cur?c.blue:c.border};background:${cur?c.bll:c.bg2};color:${cur?c.blue:c.t3}">${lbl}</button>`;
  const fbtn=(id,lbl,cur)=>`<button onclick="window._trk.fil('${id}')" style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:${cur?'700':'500'};cursor:pointer;border:1px solid ${cur?c.blue:c.border};background:${cur?c.bll:c.bg2};color:${cur?c.blue:c.t3}">${lbl}</button>`;
  const kpi=(v,l,col)=>`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:800;color:${col}">${v}</div><div style="font-size:11px;color:${c.t3}">${l}</div></div>`;
  const bar=(arr,color)=>{if(!arr.length)return`<div style="text-align:center;padding:8px;color:${c.t3};font-size:11px">Sin datos</div>`;const mx=Math.max(...arr.map(x=>x[1]),1);return arr.filter(x=>x[1]>0).slice(0,10).map(([k,v])=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:10px;min-width:70px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${c.t3}">${safeHtml(k)}</span><div style="flex:1;height:14px;background:${c.bg2};border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.round(v/mx*100)}%;background:${color};border-radius:3px"></div></div><span style="font-size:10px;font-weight:700;min-width:24px;text-align:right">${v}</span></div>`).join('');};

  let h=`<div style="max-width:1200px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-size:22px;font-weight:700;color:${c.text}">🎯 Event Tracker</div>
    <span style="flex:1"></span>
    ${btn('live','🔴 Live',_sub==='live')}${btn('history','📜 Historial',_sub==='history')}${btn('config','⚙️ Config',_sub==='config')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
    ${kpi(total,'Total eventos',c.blue)}${kpi(todayEv.length,'Hoy',c.green)}${kpi(errEv.length,'Errores',c.red)}${kpi(Object.keys(modC).length,'Módulos',c.amber)}
  </div>`;

  if(_sub==='live'){
    h+=`<div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
      ${[['all','🌐 Todo'],['ingresos','🔖 Ref'],['ingresos2','🚛 Ing'],['conductores','👤 Cond'],['agenda','📅 Ag'],['system','⚙️ Sys']].map(([v,l])=>fbtn(v,l,_filter===v)).join('')}
      <span style="flex:1"></span>
      <input type="date" value="${_dateFrom}" onchange="window._trk.df(this.value)" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};color:${c.t3}">
      <input type="date" value="${_dateTo}" onchange="window._trk.dt(this.value)" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};color:${c.t3}">
      <button onclick="window._trk.exp()" style="padding:4px 12px;border-radius:20px;font-size:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.t3};cursor:pointer">⬇ Export</button>
    </div>`;
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📊 Por módulo</div>${bar(Object.entries(modC).sort((a,b)=>b[1]-a[1]),c.blue)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">⚡ Por acción</div>${bar(Object.entries(actC).sort((a,b)=>b[1]-a[1]),c.purple)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🕐 Hoy por hora</div>
        <div style="display:flex;align-items:flex-end;gap:2px;height:60px">${hArr.map(([h,v])=>`<div title="${h}:00 → ${v}" style="flex:1;background:${v>0?c.blue:c.bg2};border-radius:2px 2px 0 0;height:${Math.max(v/hMax*100,4)}%;min-height:2px;opacity:${v>0?0.8:0.3}"></div>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;font-size:8px;color:${c.t3};margin-top:2px"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
      </div>
    </div>`;
    const recent=events.slice(0,50);
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📋 Últimos eventos (${events.length})</div>`;
    if(recent.length){
      h+=`<div style="max-height:400px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>${['Hora','Módulo','Acción','Categoría','OK','ms'].map(t=>`<th style="padding:6px 8px;text-align:left;font-size:10px;color:${c.t3};border-bottom:1px solid ${c.border}">${t}</th>`).join('')}</tr></thead><tbody>`;
      const MC={ingresos:'#3b82f6',ingresos2:'#10b981',conductores:'#f59e0b',agenda:'#8b5cf6',system:'#64748b'};
      recent.forEach(e=>{h+=`<tr style="border-top:1px solid ${c.border}"><td style="padding:5px 8px;white-space:nowrap;color:${c.t3}">${e.timestamp.slice(0,10)} ${e.timestamp.slice(11,19)}</td><td><span style="background:${(MC[e.module]||'#64748b')}15;color:${MC[e.module]||'#64748b'};padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700">${safeHtml(e.module)}</span></td><td>${safeHtml(e.action)}</td><td style="color:${c.t3}">${safeHtml(e.category)}</td><td>${e.success?'<span style="color:'+c.green+'">✓</span>':'<span style="color:'+c.red+'">✗</span>'}</td><td>${e.duration?e.duration+'ms':'–'}</td></tr>`;});
      h+='</tbody></table></div>';
    } else h+=`<div style="text-align:center;padding:20px;color:${c.t3}">Sin eventos registrados aún.</div>`;
    h+='</div>';

  } else if(_sub==='history'){
    const dayMap={};events.forEach(e=>{const d=e.timestamp.slice(0,10);dayMap[d]=(dayMap[d]||0)+1;});
    const dayArr=Object.entries(dayMap).sort((a,b)=>a[0].localeCompare(b[0]));
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📂 Por categoría</div>${bar(Object.entries(Object.fromEntries(events.reduce((m,e)=>{m.set(e.category,(m.get(e.category)||0)+1);return m;},new Map()))).sort((a,b)=>b[1]-a[1]),c.purple)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📊 Por módulo</div>${bar(Object.entries(modC).sort((a,b)=>b[1]-a[1]),c.blue)}</div>
    </div>`;
    if(dayArr.length>1){
      const dMax=Math.max(...dayArr.map(x=>x[1]),1),w=300,ht=60,step=w/(dayArr.length-1);
      const pts=dayArr.map((x,i)=>`${i*step},${ht-Math.round(x[1]/dMax*(ht-6))}`).join(' ');
      h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📈 Tendencia</div><svg viewBox="0 0 ${w} ${ht}" style="width:100%;height:${ht}px"><polyline points="${pts}" fill="none" stroke="${c.blue}" stroke-width="2" stroke-linecap="round"/></svg><div style="display:flex;justify-content:space-between;font-size:9px;color:${c.t3}"><span>${dayArr[0][0]}</span><span>${dayArr[dayArr.length-1][0]}</span></div></div>`;
    }

  } else if(_sub==='config'){
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;margin-bottom:12px"><div style="font-size:12px;font-weight:700;margin-bottom:10px">🗑️ Gestión</div>
      <div style="display:flex;gap:8px"><button onclick="window._trk.exp()" style="padding:6px 14px;border-radius:20px;font-size:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.t3};cursor:pointer">📥 Exportar JSON</button><button onclick="window._trk.clr()" style="padding:6px 14px;border-radius:20px;font-size:11px;border:1px solid #fecaca;background:#fef2f2;color:${c.red};cursor:pointer">🗑️ Limpiar</button></div>
      <div style="font-size:10px;color:${c.t3};margin-top:8px">Total almacenado: <b>${total}</b> eventos</div>
    </div>`;
  }
  h+='</div>';
  _c.innerHTML=h;
}

// ─── Window bindings ────────────────────────────────────
window._trk={
  sub:(s)=>{_sub=s;paint();},
  fil:(f)=>{_filter=f;paint();},
  df:(v)=>{_dateFrom=v;paint();},
  dt:(v)=>{_dateTo=v;paint();},
  exp:async()=>{const ev=await getEvents({});if(!ev.length){toast('Sin eventos','#d97706');return;}const b=new Blob([JSON.stringify(ev,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='events_'+new Date().toISOString().slice(0,10)+'.json';a.click();toast('✅ Exportado','#10b981');},
  clr:async()=>{if(!confirm('¿Eliminar todos los eventos?'))return;try{const db=await odb();db.transaction(STORE,'readwrite').objectStore(STORE).clear();toast('🗑️ Limpiado','#10b981');paint();}catch(e){toast('Error','#ef4444');}},
};
