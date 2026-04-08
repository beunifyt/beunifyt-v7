// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — eventos.js — Gestión de eventos/ferias
// CRUD vinculado a recintos, fecha inicio/fin, halls, activar/desactivar
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';

let _c,_u,_data=[],_recintos=[],_unsub,_unsub2,_q='';
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};

export function render(ct,us){
  _c=ct;_u=us;_data=[];_recintos=[];_q='';
  paint();loadData();
  return()=>{if(_unsub)_unsub();if(_unsub2)_unsub2();};
}

async function loadData(){
  try{
    const{fsListen}=await import('./firestore.js');
    if(_unsub)_unsub();_unsub=await fsListen('eventos',docs=>{_data=docs;rc();});
    if(_unsub2)_unsub2();_unsub2=await fsListen('recintos',docs=>{_recintos=docs;});
  }catch(e){}
}

function paint(){
  const c=C(),isSA=_u.rol==='superadmin'||_u.rol==='supervisor';
  _c.innerHTML=`<div style="max-width:1200px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <div style="font-size:22px;font-weight:700;color:${c.text}">📅 Eventos</div>
      <span style="flex:1"></span>
      ${isSA?`<button id="_addE" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo evento</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
      <div style="max-width:240px;min-width:120px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px"><span style="opacity:.5">🔍</span><input id="_eq" type="search" placeholder="Buscar evento..." value="${safeHtml(_q)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit"></div>
    </div>
    <div id="_ebody"></div>
  </div>`;
  const qi=_c.querySelector('#_eq');if(qi)qi.oninput=()=>{_q=qi.value.trim();rc();};
  const add=_c.querySelector('#_addE');if(add)add.onclick=()=>openModal();
  rc();
}

function rc(){
  const b=_c.querySelector('#_ebody');if(!b)return;
  const c=C(),isSA=_u.rol==='superadmin'||_u.rol==='supervisor';
  let items=[..._data];
  if(_q){const q=_q.toLowerCase();items=items.filter(d=>`${d.nombre||''} ${d.recinto||''}`.toLowerCase().includes(q));}
  const actId=AppState.get('activeEventId');
  if(!items.length){b.innerHTML=`<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">📅</div><div style="font-weight:600;margin-top:6px">Sin eventos</div></div>`;return;}
  b.innerHTML=`<div style="display:grid;gap:12px">${items.map(ev=>{
    const isAct=ev.id===actId;
    const rec=_recintos.find(r=>r.id===ev.recintoId);
    return`<div style="background:${c.card};border:${isAct?'2px solid '+c.green:'1px solid '+c.border};border-radius:12px;padding:16px;${isAct?'box-shadow:0 0 0 3px rgba(13,159,110,.15)':''}">
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="font-size:28px;flex-shrink:0">${ev.ico||'📋'}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:16px;font-weight:700;color:${c.text}">${safeHtml(ev.nombre||'')}</span>
          ${isAct?`<span style="background:${c.green};color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px">ACTIVO</span>`:''}
        </div>
        <div style="font-size:12px;color:${c.t3};margin-bottom:6px">
          ${rec?`🏟 ${safeHtml(rec.nombre)} · ${safeHtml(rec.ciudad||'')}`:safeHtml(ev.recinto||'')}
        </div>
        <div style="display:flex;gap:10px;font-size:11px;color:${c.t3}">
          ${ev.fechaInicio?`<span>📆 ${ev.fechaInicio}${ev.fechaFin?' → '+ev.fechaFin:''}</span>`:''}
          ${(ev.halls||[]).length?`<span>🏭 ${ev.halls.join(', ')}</span>`:''}
        </div>
      </div>
      ${isSA?`<div style="display:flex;gap:4px;flex-shrink:0">
        ${!isAct?`<button style="font-size:10px;background:${c.green};color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:700" onclick="window._evAct('${ev.id}')">▶ Activar</button>`:`<button style="font-size:10px;background:${c.amber};color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:700" onclick="window._evDeact()">⏹</button>`}
        <button style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:4px 8px;cursor:pointer" onclick="window._evEdit('${ev.id}')">✏️</button>
        <button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:4px 8px;cursor:pointer" onclick="window._evDel('${ev.id}')">🗑</button>
      </div>`:''}
    </div></div>`;}).join('')}</div>`;
}

function openModal(editId=null){
  const c=C(),old=document.getElementById('_mEv');if(old)old.remove();
  const r=editId?_data.find(d=>d.id===editId):{};
  const m=document.createElement('div');m.id='_mEv';
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';
  const is=`width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none`;
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};width:100%;max-width:560px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}"><div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nuevo'} Evento</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_mEv').remove()">✕</button></div>
    <div style="padding:16px 22px">
      <div style="display:grid;grid-template-columns:1fr auto;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Nombre *</label><input id="_eNom" value="${safeHtml(r.nombre||'')}" placeholder="ALIMENTARIA 2026" style="${is}"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Emoji</label><input id="_eIco" value="${r.ico||'📋'}" maxlength="2" style="${is};text-align:center;font-size:22px;max-width:60px"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Fecha inicio</label><input id="_eIni" type="date" value="${r.fechaInicio||''}" style="${is}"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Fecha fin</label><input id="_eFin" type="date" value="${r.fechaFin||''}" style="${is}"></div>
      </div>
      <div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.t3}">Recinto</label><select id="_eRec" style="${is}"><option value="">— Seleccionar —</option>${_recintos.map(rc=>`<option value="${rc.id}"${r.recintoId===rc.id?' selected':''}>${safeHtml(rc.nombre)} (${safeHtml(rc.ciudad||'')})</option>`).join('')}</select></div>
      <div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.t3}">Halls (separar con coma)</label><input id="_eHalls" value="${(r.halls||[]).join(', ')}" placeholder="1, 2A, 3B, CS" style="${is}"></div>
      <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Notas</label><input id="_eNotas" value="${safeHtml(r.notas||'')}" placeholder="Observaciones" style="${is}"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}"><button style="padding:9px 18px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer" onclick="this.closest('#_mEv').remove()">Cancelar</button><button id="_svE" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">${editId?'Guardar':'Crear'}</button></div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_svE').onclick=async()=>{
    const fd={nombre:m.querySelector('#_eNom').value.trim(),ico:m.querySelector('#_eIco').value.trim()||'📋',fechaInicio:m.querySelector('#_eIni').value,fechaFin:m.querySelector('#_eFin').value,recintoId:m.querySelector('#_eRec').value,halls:m.querySelector('#_eHalls').value.split(',').map(s=>s.trim()).filter(Boolean),notas:m.querySelector('#_eNotas').value.trim(),modificado:nowLocal()};
    const rec=_recintos.find(r=>r.id===fd.recintoId);if(rec){fd.recinto=rec.nombre;fd.ciudad=rec.ciudad;fd.pais=rec.pais;}
    if(!fd.nombre){toast('Nombre requerido','#ef4444');return;}
    try{if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`eventos/${editId}`,fd);}else{const{fsAdd}=await import('./firestore.js');await fsAdd('eventos',fd);}toast('✅ Evento guardado','#10b981');m.remove();}catch(e){toast('❌ Error','#ef4444');}
  };
  document.body.appendChild(m);
}

window._evEdit=(id)=>openModal(id);
window._evDel=async(id)=>{if(!confirm('¿Eliminar evento?'))return;try{const{fsDel}=await import('./firestore.js');await fsDel(`eventos/${id}`);toast('🗑','#f59e0b');}catch(e){}};
window._evAct=async(id)=>{try{const{fsSet}=await import('./firestore.js');await fsSet('config/activeEvent',{id});AppState.set('activeEventId',id);toast('▶ Evento activado','#10b981');rc();}catch(e){}};
window._evDeact=async()=>{try{const{fsSet}=await import('./firestore.js');await fsSet('config/activeEvent',{id:null});AppState.set('activeEventId',null);toast('⏹ Desactivado','#d97706');rc();}catch(e){}};
