// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics2.js — Event Tracker
// IndexedDB · Toggles · Heatmaps · Funnel · Errors · Perf
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, todayISO, formatDate, uid } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { crossRead } from './field-engine.js';
import { tr, trFree } from './langs.js';

let _c,_u,_sub='live',_fil='all',_df='',_dt='',_evts=[],_total=0;
const T=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,inp:t.inp||t.bg,bd:t.border,tx:t.text,t3:t.t3,acc:t.acc,abg:t.accBg,grn:t.green||'#0d9f6e',red:t.red||'#dc2626',amb:t.amber||'#d97706',pur:t.purple||'#7c3aed',row:t.rowHover||t.bg};};

const IDB='beu_evt_v2',STO='events';let _db=null;
function odb(){return new Promise((ok,no)=>{if(_db)return ok(_db);const r=indexedDB.open(IDB,1);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains(STO)){const s=d.createObjectStore(STO,{keyPath:'id'});s.createIndex('ts','ts');s.createIndex('mod','mod');}};r.onsuccess=e=>{_db=e.target.result;ok(_db);};r.onerror=e=>no(e);});}

const _q=[];let _ft=null;
const _tog={form:true,crud:true,nav:true,auth:true,sys:true,perf:true};
try{const s=localStorage.getItem('beu_evt_tog');if(s)Object.assign(_tog,JSON.parse(s));}catch(e){}
function _saveTog(){try{localStorage.setItem('beu_evt_tog',JSON.stringify(_tog));}catch(e){}}

const _sessId=uid();
window.trackEvent=function(e){const cat=e.cat||e.category||'sys';_q.push({id:uid(),ts:new Date().toISOString(),mod:e.mod||e.module||'sys',act:e.act||e.action||'?',cat,uid:e.uid||'',meta:e.meta||{},ms:e.ms||0,ok:e.ok!==false,err:e.err||'',sess:_sessId});if(!_ft)_ft=setTimeout(_flush,400);};
async function _flush(){_ft=null;if(!_q.length)return;try{const d=await odb(),tx=d.transaction(STO,'readwrite'),s=tx.objectStore(STO);_q.splice(0).forEach(e=>s.put(e));}catch(e){}}

async function qry(f={}){try{const d=await odb();return new Promise(ok=>{const r=d.transaction(STO,'readonly').objectStore(STO).getAll();r.onsuccess=()=>{let a=r.result||[];if(f.mod&&f.mod!=='all')a=a.filter(e=>e.mod===f.mod);if(f.df)a=a.filter(e=>e.ts>=f.df);if(f.dt)a=a.filter(e=>e.ts<=f.dt+'T23:59:59');a.sort((x,y)=>y.ts.localeCompare(x.ts));ok(a);};r.onerror=()=>ok([]);});}catch(e){return[];}}
async function cnt(){try{const d=await odb();return new Promise(ok=>{const r=d.transaction(STO,'readonly').objectStore(STO).count();r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(0);});}catch(e){return 0;}}

function grp(a,k){const m={};a.forEach(e=>{const v=e[k]||'?';m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function avgMs(a){const t=a.filter(e=>e.ms>0);return t.length?Math.round(t.reduce((s,e)=>s+e.ms,0)/t.length):0;}
function p95Ms(a){const t=a.filter(e=>e.ms>0).map(e=>e.ms).sort((a,b)=>a-b);return t.length?t[Math.floor(t.length*.95)]:0;}
function errRate(a){return a.length?Math.round(a.filter(e=>!e.ok).length/a.length*100):0;}
function byHour(a){const m={};for(let i=0;i<24;i++)m[String(i).padStart(2,'0')]=0;a.forEach(e=>{const h=e.ts.slice(11,13);if(h)m[h]++;});return Object.entries(m);}
function byDay(a){const m={};a.forEach(e=>{const d=e.ts.slice(0,10);m[d]=(m[d]||0)+1;});return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));}
function byWeekday(a){const d=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],m=[0,0,0,0,0,0,0];a.forEach(e=>{m[new Date(e.ts).getDay()]++;});return d.map((n,i)=>[n,m[i]]);}
function heatmap(a){const m={},d=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];for(let i=0;i<7;i++)for(let h=0;h<24;h++)m[`${i}-${h}`]=0;a.forEach(e=>{const dt=new Date(e.ts);m[`${dt.getDay()}-${dt.getHours()}`]++;});return{m,d};}
function sessionTL(a){const s={};a.forEach(e=>{if(!e.sess)return;if(!s[e.sess])s[e.sess]={start:e.ts,end:e.ts,n:0,mods:new Set()};s[e.sess].end=e.ts;s[e.sess].n++;s[e.sess].mods.add(e.mod);});return Object.entries(s).map(([id,v])=>({id,start:v.start,end:v.end,n:v.n,mods:[...v.mods],dur:new Date(v.end)-new Date(v.start)})).sort((a,b)=>b.start.localeCompare(a.start));}
function formFunnel(a){return[['Abiertos',a.filter(e=>e.act==='form_open').length],['Campos',a.filter(e=>e.act==='form_field_input').length],['Errores',a.filter(e=>e.act==='form_field_error').length],['Enviados',a.filter(e=>e.act==='form_submit').length],['Abandonados',a.filter(e=>e.act==='form_abandon').length]];}
function topErrors(a){const m={};a.filter(e=>!e.ok&&e.err).forEach(e=>{m[e.err]=(m[e.err]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10);}
function perfByMod(a){return grp(a,'mod').map(([mod])=>{const me=a.filter(e=>e.mod===mod);return{mod,avg:avgMs(me),p95:p95Ms(me),n:me.length,err:errRate(me)};}).filter(m=>m.n>0);}
function actScore(a){const now=Date.now(),D=864e5;const r=a.filter(e=>(now-new Date(e.ts).getTime())<7*D).length;const p=a.filter(e=>{const d=now-new Date(e.ts).getTime();return d>=7*D&&d<14*D;}).length||1;return Math.min(100,Math.round(r/p*50));}

function _bar(a,c,t){if(!a.length)return`<div style="text-align:center;padding:8px;color:${t.t3};font-size:11px">—</div>`;const mx=Math.max(...a.map(x=>x[1]),1);return a.filter(x=>x[1]>0).slice(0,12).map(([k,v])=>`<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px"><span style="font-size:9px;min-width:55px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${t.t3}">${safeHtml(k)}</span><div style="flex:1;height:12px;background:${t.inp};border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.round(v/mx*100)}%;background:${c};border-radius:3px"></div></div><span style="font-size:9px;font-weight:700;min-width:18px;text-align:right">${v}</span></div>`).join('');}
function _spark(a,c,t,h=55){if(a.length<2)return'';const mx=Math.max(...a.map(x=>x[1]),1),w=300,s=w/(a.length-1);const pts=a.map((x,i)=>`${i*s},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');return`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px"><polygon points="0,${h} ${pts} ${(a.length-1)*s},${h}" fill="${c}" opacity=".08"/><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg><div style="display:flex;justify-content:space-between;font-size:8px;color:${t.t3}"><span>${a[0][0]}</span><span>${a[a.length-1][0]}</span></div>`;}
function _heatmap(data,t){const{m,d}=data,mx=Math.max(...Object.values(m),1);let h='<div style="display:grid;grid-template-columns:32px repeat(24,1fr);gap:1px;font-size:7px"><div></div>';for(let i=0;i<24;i++)h+=`<div style="text-align:center;color:${t.t3}">${String(i).padStart(2,'0')}</div>`;for(let i=0;i<7;i++){h+=`<div style="display:flex;align-items:center;color:${t.t3};font-weight:600;font-size:7px">${d[i]}</div>`;for(let j=0;j<24;j++){const v=m[`${i}-${j}`],op=v>0?Math.max(.15,v/mx):.04;h+=`<div title="${d[i]} ${j}:00→${v}" style="aspect-ratio:1;border-radius:2px;background:${t.acc};opacity:${op}"></div>`;}}h+='</div>';return h;}
function _kpi(v,l,c,t,s){return`<div style="background:${t.card};border:1px solid ${t.bd};border-radius:12px;padding:12px;text-align:center"><div style="font-size:24px;font-weight:800;color:${c}">${v}</div><div style="font-size:10px;color:${t.t3}">${l}</div>${s?`<div style="font-size:9px;color:${t.t3}">${s}</div>`:''}</div>`;}
function _funnel(st,t){if(!st.length)return'';const mx=st[0][1]||1;return st.map(([l,v],i)=>{const p=Math.round(v/mx*100),dr=i>0?Math.round((1-v/(st[i-1][1]||1))*100):0;return`<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:10px;min-width:80px;color:${t.t3}">${l}</span><div style="flex:1;height:20px;background:${t.inp};border-radius:4px;overflow:hidden;position:relative"><div style="height:100%;width:${p}%;background:linear-gradient(90deg,${t.acc},${t.pur});border-radius:4px"></div><span style="position:absolute;left:6px;top:50%;transform:translateY(-50%);font-size:9px;font-weight:700;color:#fff">${v}</span></div>${i>0?`<span style="font-size:8px;color:${t.red};font-weight:700">-${dr}%</span>`:'<span style="width:28px"></span>'}</div>`;}).join('');}
function _card(ti,bd,t){return`<div style="background:${t.card};border:1px solid ${t.bd};border-radius:12px;padding:12px"><div style="font-size:11px;font-weight:700;margin-bottom:6px">${ti}</div>${bd}</div>`;}
function _btn(id,l,cur,t){return`<button onclick="window._trk.s('${id}')" style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:${cur?'700':'500'};cursor:pointer;border:1px solid ${cur?t.acc:t.bd};background:${cur?t.abg:t.card};color:${cur?t.acc:t.t3}">${l}</button>`;}

export function render(ct,us){_c=ct;_u=us;_load();return()=>{};}
async function _load(){_evts=await qry({mod:_fil==='all'?undefined:_fil,df:_df||undefined,dt:_dt||undefined});_total=await cnt();_paint();}

function _paint(){
  if(!_c)return;const t=T(),td=todayISO(),tE=_evts.filter(e=>e.ts.startsWith(td)),eE=_evts.filter(e=>!e.ok);
  const modC=grp(_evts,'mod'),actC=grp(_evts,'act'),hrs=byHour(tE),days=byDay(_evts),wk=byWeekday(_evts),heat=heatmap(_evts);
  const sess=sessionTL(_evts),perf=perfByMod(_evts),fun=formFunnel(_evts),errs=topErrors(_evts);
  const sc=actScore(_evts);
  const MC={ingresos:'#3b82f6',ingresos2:'#10b981',conductores:'#f59e0b',agenda:'#8b5cf6',sys:'#64748b',auth:'#ef4444',flota:'#06b6d4'};

  const subs=[['live','🔴 Live'],['timeline','📅 Timeline'],['sessions','👤 Sessions'],['funnel','🔄 Funnel'],['errors','⚠️ Errores'],['perf','⚡ Perf'],['heatmap','🔥 Heatmap'],['config','⚙️']];
  let h=`<div style="max-width:1200px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><div style="font-size:20px;font-weight:700;color:${t.tx}">🎯 Event Tracker</div><span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${sc>=70?t.grn:sc>=40?t.amb:t.red};color:#fff;font-weight:700">${sc}/100</span><span style="flex:1"></span>${subs.map(([id,l])=>_btn(id,l,_sub===id,t)).join('')}</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:10px">${_kpi(_total,'Total',t.acc,t)}${_kpi(tE.length,'Hoy',t.grn,t)}${_kpi(eE.length,'Errores',t.red,t,errRate(_evts)+'%')}${_kpi(sess.length,'Sesiones',t.pur,t)}${_kpi(avgMs(_evts)+'<small>ms</small>','Latencia',t.amb,t,'P95:'+p95Ms(_evts))}</div>`;

  if(_sub==='live'){
    h+=`<div style="display:flex;gap:3px;margin-bottom:8px;flex-wrap:wrap;align-items:center">${[['all','Todo'],['ingresos','Ref'],['ingresos2','Ing'],['conductores','Cond'],['agenda','Ag'],['sys','Sys']].map(([v,l])=>`<button onclick="window._trk.f('${v}')" style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:${_fil===v?'700':'500'};cursor:pointer;border:1px solid ${_fil===v?t.acc:t.bd};background:${_fil===v?t.abg:t.card};color:${_fil===v?t.acc:t.t3}">${l}</button>`).join('')}<span style="flex:1"></span><input type="date" value="${_df}" onchange="window._trk.df(this.value)" style="border:1px solid ${t.bd};border-radius:20px;padding:3px 6px;font-size:10px;background:${t.inp};color:${t.t3}"><input type="date" value="${_dt}" onchange="window._trk.dt(this.value)" style="border:1px solid ${t.bd};border-radius:20px;padding:3px 6px;font-size:10px;background:${t.inp};color:${t.t3}"><button onclick="window._trk.exp()" style="padding:3px 10px;border-radius:20px;font-size:10px;border:1px solid ${t.bd};background:${t.card};color:${t.t3};cursor:pointer">⬇</button></div>`;
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">${_card('📊 Módulo',_bar(modC,t.acc,t),t)}${_card('⚡ Acción',_bar(actC,t.pur,t),t)}${_card('🕐 Hoy/hora',`<div style="display:flex;align-items:flex-end;gap:1px;height:45px">${hrs.map(([x,v])=>{const mx=Math.max(...hrs.map(z=>z[1]),1);return`<div title="${x}:00→${v}" style="flex:1;background:${v>0?t.acc:t.inp};border-radius:2px 2px 0 0;height:${Math.max(v/mx*100,3)}%;opacity:${v>0?.8:.2}"></div>`;}).join('')}</div>`,t)}</div>`;
    const rec=_evts.slice(0,80);
    h+=_card(`📋 Eventos (${_evts.length})`,rec.length?`<div style="max-height:320px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr>${['Hora','Mod','Acción','Cat','OK','ms'].map(x=>`<th style="padding:4px 5px;text-align:left;font-size:8px;color:${t.t3};border-bottom:1px solid ${t.bd}">${x}</th>`).join('')}</tr></thead><tbody>${rec.map(e=>`<tr style="border-top:1px solid ${t.bd}"><td style="padding:3px 5px;color:${t.t3};font-size:9px">${e.ts.slice(5,10)} ${e.ts.slice(11,19)}</td><td><span style="background:${(MC[e.mod]||'#64748b')}18;color:${MC[e.mod]||'#64748b'};padding:1px 5px;border-radius:5px;font-size:8px;font-weight:700">${safeHtml(e.mod)}</span></td><td>${safeHtml(e.act)}</td><td style="color:${t.t3}">${safeHtml(e.cat)}</td><td>${e.ok?'<span style="color:'+t.grn+'">✓</span>':'<span style="color:'+t.red+'">✗</span>'}</td><td>${e.ms||'–'}</td></tr>`).join('')}</tbody></table></div>`:`<div style="text-align:center;padding:16px;color:${t.t3}">Sin eventos</div>`,t);
  } else if(_sub==='timeline'){
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">${_card('📈 Tendencia',_spark(days,t.acc,t),t)}${_card('📊 Día semana',_bar(wk,t.pur,t),t)}</div>`;
    h+=_card('📂 Categorías',_bar(grp(_evts,'cat'),t.amb,t),t);
  } else if(_sub==='sessions'){
    const sl=sess.slice(0,30);
    h+=_card(`👤 Sesiones (${sess.length})`,sl.length?`<div style="max-height:350px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr>${['Inicio','Eventos','Módulos','Duración'].map(x=>`<th style="padding:4px 6px;text-align:left;font-size:8px;color:${t.t3};border-bottom:1px solid ${t.bd}">${x}</th>`).join('')}</tr></thead><tbody>${sl.map(s=>`<tr style="border-top:1px solid ${t.bd}"><td style="padding:3px 6px;color:${t.t3};font-size:9px">${s.start.slice(0,16).replace('T',' ')}</td><td style="font-weight:700">${s.n}</td><td style="font-size:9px">${s.mods.join(', ')}</td><td>${Math.round(s.dur/1000)}s</td></tr>`).join('')}</tbody></table></div>`:'<div style="text-align:center;padding:16px;color:'+t.t3+'">—</div>',t);
  } else if(_sub==='funnel'){
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${_card('🔄 Formularios',_funnel(fun,t),t)}${_card('📊 CRUD',_bar(grp(_evts.filter(e=>['create','update','delete','view'].includes(e.act)),'act'),t.grn,t),t)}</div>`;
  } else if(_sub==='errors'){
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">${_card('🔝 Top errores',errs.length?_bar(errs,t.red,t):'<div style="text-align:center;padding:10px;color:'+t.grn+'">✨ Sin errores</div>',t)}${_card('📊 Error/módulo',_bar(perf.filter(m=>m.err>0).map(m=>[m.mod,m.err]),t.red,t),t)}</div>`;
    const el=_evts.filter(e=>!e.ok).slice(0,40);
    h+=_card('📋 Log',el.length?`<div style="max-height:250px;overflow-y:auto;font-size:9px">${el.map(e=>`<div style="padding:4px 0;border-bottom:1px solid ${t.bd};display:flex;gap:6px"><span style="color:${t.t3};min-width:100px">${e.ts.slice(0,16).replace('T',' ')}</span><span style="color:${t.red};font-weight:700">${safeHtml(e.mod)}</span><span>${safeHtml(e.err||e.act)}</span></div>`).join('')}</div>`:'<div style="text-align:center;padding:10px;color:'+t.grn+'">—</div>',t);
  } else if(_sub==='perf'){
    h+=_card('⚡ Performance',perf.length?`<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr>${['Módulo','N','Avg ms','P95','Err%'].map(x=>`<th style="padding:5px 6px;text-align:left;font-size:8px;color:${t.t3};border-bottom:1px solid ${t.bd}">${x}</th>`).join('')}</tr></thead><tbody>${perf.map(m=>`<tr style="border-top:1px solid ${t.bd}"><td style="padding:4px 6px;font-weight:700">${safeHtml(m.mod)}</td><td>${m.n}</td><td>${m.avg}</td><td>${m.p95}</td><td><span style="color:${m.err>10?t.red:m.err>5?t.amb:t.grn};font-weight:700">${m.err}%</span></td></tr>`).join('')}</tbody></table>`:'<div style="text-align:center;padding:10px;color:'+t.t3+'">—</div>',t);
  } else if(_sub==='heatmap'){
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${_card('🔥 Hora/día',_heatmap(heat,t),t)}${_card('📊 Horaria',_bar(byHour(_evts).filter(x=>x[1]>0),t.acc,t),t)}</div>`;
  } else if(_sub==='config'){
    const tH=Object.entries(_tog).map(([k,v])=>`<label style="display:inline-flex;align-items:center;gap:3px;font-size:10px;cursor:pointer;padding:3px 8px;background:${v?t.abg:t.inp};border-radius:20px;border:1px solid ${v?t.acc:t.bd}" onclick="window._trk.tog('${k}')"><span style="font-weight:700;color:${v?t.grn:t.t3}">${v?'ON':'OFF'}</span> ${k}</label>`).join(' ');
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${_card('⚙️ Categorías',`<div style="display:flex;flex-wrap:wrap;gap:4px">${tH}</div>`,t)}${_card('🗑️ Datos',`<div style="display:flex;gap:6px"><button onclick="window._trk.exp()" style="padding:5px 12px;border-radius:20px;font-size:10px;border:1px solid ${t.bd};background:${t.card};color:${t.t3};cursor:pointer">📥 JSON</button><button onclick="window._trk.clr()" style="padding:5px 12px;border-radius:20px;font-size:10px;border:1px solid #fecaca;background:#fef2f2;color:${t.red};cursor:pointer">🗑️</button></div><div style="font-size:9px;color:${t.t3};margin-top:6px">Total: <b>${_total}</b></div>`,t)}</div>`;
  }
  h+='</div>';_c.innerHTML=h;
}

window._trk={s:(v)=>{_sub=v;_load();},f:(v)=>{_fil=v;_load();},df:(v)=>{_df=v;_load();},dt:(v)=>{_dt=v;_load();},tog:(k)=>{_tog[k]=!_tog[k];_saveTog();_paint();},exp:async()=>{const e=await qry({});if(!e.length){toast('Sin eventos','#d97706');return;}const b=new Blob([JSON.stringify(e,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='events_'+todayISO()+'.json';a.click();toast('✅','#10b981');},clr:async()=>{if(!confirm('¿Eliminar TODO?'))return;try{(await odb()).transaction(STO,'readwrite').objectStore(STO).clear();_evts=[];_total=0;toast('🗑️','#10b981');_paint();}catch(e){toast('Error','#ef4444');}}};
