// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — recintos.js — Gestión de recintos
// CRUD: nombre, ciudad, país, halls, puertas, atención
// Solo SA/Supervisor puede editar
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';

let _c,_u,_data=[],_unsub,_q='',_sortCol='nombre',_sortDir='asc';
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};
function dk(){const t=getThemeColors(getCurrentTheme());return t.group==='dark';}

export function render(ct,us){
  _c=ct;_u=us;_data=[];_q='';
  paint();loadData();
  return()=>{if(_unsub)_unsub();};
}

async function loadData(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen('recintos',docs=>{_data=docs;applyF();rc();});}catch(e){}}
function applyF(){let it=[..._data];if(_q){const q=_q.toLowerCase();it=it.filter(d=>`${d.nombre||''} ${d.ciudad||''} ${d.pais||''}`.toLowerCase().includes(q));}it.sort((a,b)=>{const r=String(a[_sortCol]??'').localeCompare(String(b[_sortCol]??''));return _sortDir==='asc'?r:-r;});_data=it;}

function paint(){
  const c=C(),p=_u.permisos||{},isSA=_u.rol==='superadmin'||_u.rol==='supervisor';
  _c.innerHTML=`<div style="max-width:1200px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <div style="font-size:22px;font-weight:700;color:${c.text}">🏟 Recintos</div>
      <span style="flex:1"></span>
      ${isSA?`<button id="_addR" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo recinto</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
      <div style="max-width:240px;min-width:120px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px"><span style="opacity:.5">🔍</span><input id="_rq" type="search" placeholder="Buscar recinto..." value="${safeHtml(_q)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit"></div>
      <span style="font-size:10px;color:${c.t3}">${_data.length} recintos</span>
    </div>
    <div id="_rbody"></div>
  </div>`;
  const qi=_c.querySelector('#_rq');if(qi)qi.oninput=()=>{_q=qi.value.trim();applyF();rc();};
  const add=_c.querySelector('#_addR');if(add)add.onclick=()=>openModal();
  rc();
}

function rc(){
  const b=_c.querySelector('#_rbody');if(!b)return;
  const c=C(),isSA=_u.rol==='superadmin'||_u.rol==='supervisor';
  if(!_data.length){b.innerHTML=`<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">🏟</div><div style="font-weight:600;margin-top:6px">Sin recintos</div></div>`;return;}
  b.innerHTML=`<div style="display:grid;gap:12px">${_data.map(r=>`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:16px">
    <div style="display:flex;align-items:flex-start;gap:12px">
      <div style="flex:1">
        <div style="font-size:16px;font-weight:700;color:${c.text};margin-bottom:4px">${safeHtml(r.nombre||'Sin nombre')}</div>
        <div style="font-size:12px;color:${c.t3};margin-bottom:8px">${safeHtml(r.ciudad||'')}${r.ciudad&&r.pais?' · ':''}${safeHtml(r.pais||'')}</div>
        ${(r.halls||[]).length?`<div style="margin-bottom:6px"><span style="font-size:10px;font-weight:700;color:${c.t3};text-transform:uppercase">Halls:</span> <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:3px">${r.halls.map(h=>`<span style="background:${c.bll};color:${c.blue};font-size:10px;font-weight:600;padding:2px 8px;border-radius:6px;border:1px solid ${c.border}">${h}</span>`).join('')}</div></div>`:''}
        ${(r.puertas||[]).length?`<div style="font-size:11px;color:${c.t3}">🚪 ${r.puertas.map(p=>safeHtml(p.nombre||p)).join(', ')}</div>`:''}
        ${r.atencion?.tel?`<div style="font-size:11px;color:${c.t3};margin-top:3px">📞 ${safeHtml(r.atencion.tel)}</div>`:''}
      </div>
      ${isSA?`<div style="display:flex;gap:4px">
        <button style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:4px 8px;cursor:pointer" onclick="window._recEdit('${r.id}')">✏️</button>
        <button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:4px 8px;cursor:pointer" onclick="window._recDel('${r.id}')">🗑</button>
      </div>`:''}
    </div>
  </div>`).join('')}</div>`;
}

function openModal(editId=null){
  const c=C(),old=document.getElementById('_mRec');if(old)old.remove();
  const r=editId?_data.find(d=>d.id===editId):{};
  let halls=[...(r.halls||[])],puertas=[...(r.puertas||[])];
  const m=document.createElement('div');m.id='_mRec';
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';
  const is=`width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none`;
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};width:100%;max-width:600px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}"><div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nuevo'} Recinto</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_mRec').remove()">✕</button></div>
    <div style="padding:16px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="grid-column:span 2"><label style="font-size:11px;font-weight:600;color:${c.t3}">Nombre *</label><input id="_rNom" value="${safeHtml(r.nombre||'')}" placeholder="FIRA BARCELONA" style="${is}"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Ciudad</label><input id="_rCiu" value="${safeHtml(r.ciudad||'')}" placeholder="Barcelona" style="${is}"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">País</label><input id="_rPais" value="${safeHtml(r.pais||'')}" placeholder="España" style="${is}"></div>
      </div>
      <div style="margin-bottom:14px;padding:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:10px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.blue};margin-bottom:8px">🏭 Halls</div>
        <div style="display:flex;gap:4px;margin-bottom:8px"><input id="_rHall" placeholder="Ej: 2A, 3B, CS..." style="${is};flex:1"><button id="_addH" style="padding:6px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer">+ Hall</button></div>
        <div id="_rHalls" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
      <div style="margin-bottom:14px;padding:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:10px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.blue};margin-bottom:8px">🚪 Puertas</div>
        <div style="display:flex;gap:4px;margin-bottom:8px"><input id="_rPuN" placeholder="Nombre puerta" style="${is};flex:1"><input id="_rPuD" placeholder="Dirección" style="${is};flex:1"><button id="_addP" style="padding:6px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer">+</button></div>
        <div id="_rPuertas"></div>
      </div>
      <div style="padding:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:10px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.blue};margin-bottom:8px">📞 Atención</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Teléfono</label><input id="_rTel" value="${safeHtml(r.atencion?.tel||'')}" style="${is}"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Email</label><input id="_rEmail" value="${safeHtml(r.atencion?.email||'')}" style="${is}"></div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}"><button style="padding:9px 18px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer" onclick="this.closest('#_mRec').remove()">Cancelar</button><button id="_svR" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">${editId?'Guardar':'Crear'}</button></div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  const renderH=()=>{m.querySelector('#_rHalls').innerHTML=halls.map((h,i)=>`<span style="background:${c.bll};color:${c.blue};font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:4px">${h}<span style="cursor:pointer;opacity:.5" onclick="this.dispatchEvent(new CustomEvent('rmh',{bubbles:true,detail:${i}}))">✕</span></span>`).join('');};
  const renderP=()=>{m.querySelector('#_rPuertas').innerHTML=puertas.map((p,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:4px 0"><span style="font-size:12px">🚪 ${safeHtml(p.nombre||p)}</span><span style="font-size:10px;color:${c.t3}">${safeHtml(p.dir||'')}</span><span style="cursor:pointer;opacity:.4;font-size:11px" onclick="this.dispatchEvent(new CustomEvent('rmp',{bubbles:true,detail:${i}}))">✕</span></div>`).join('');};
  renderH();renderP();
  m.querySelector('#_addH').onclick=()=>{const v=m.querySelector('#_rHall').value.trim();if(v){halls.push(v);m.querySelector('#_rHall').value='';renderH();}};
  m.querySelector('#_addP').onclick=()=>{const n=m.querySelector('#_rPuN').value.trim(),d=m.querySelector('#_rPuD').value.trim();if(n){puertas.push({nombre:n,dir:d});m.querySelector('#_rPuN').value='';m.querySelector('#_rPuD').value='';renderP();}};
  m.addEventListener('rmh',e=>{halls.splice(e.detail,1);renderH();});
  m.addEventListener('rmp',e=>{puertas.splice(e.detail,1);renderP();});
  m.querySelector('#_svR').onclick=async()=>{
    const fd={nombre:m.querySelector('#_rNom').value.trim(),ciudad:m.querySelector('#_rCiu').value.trim(),pais:m.querySelector('#_rPais').value.trim(),halls,puertas,atencion:{tel:m.querySelector('#_rTel').value.trim(),email:m.querySelector('#_rEmail').value.trim()},modificado:nowLocal()};
    if(!fd.nombre){toast('Nombre requerido','#ef4444');return;}
    try{if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`recintos/${editId}`,fd);}else{const{fsAdd}=await import('./firestore.js');await fsAdd('recintos',fd);}toast('✅ Recinto guardado','#10b981');m.remove();}catch(e){toast('❌ Error','#ef4444');}
  };
  document.body.appendChild(m);
}

window._recEdit=(id)=>openModal(id);
window._recDel=async(id)=>{if(!confirm('¿Eliminar recinto?'))return;try{const{fsDel}=await import('./firestore.js');await fsDel(`recintos/${id}`);toast('🗑','#f59e0b');}catch(e){}};
