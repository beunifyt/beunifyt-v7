// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — conductores.js — Módulo Conductores
// Duplicado de estructura ingresos con campos conductor
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, toast, nowLocal, debounce } from './utils.js';

const COLLECTION = 'conductores';
let _c, _u, _data=[], _filtered=[], _unsub, _search='';

export function render(c, u) { _c=c; _u=u; _data=[]; _filtered=[]; paint(); loadData(); return ()=>{ if(_unsub)_unsub(); }; }
function t(k){ return tr('conductores',k)||trFree('shell',k)||k; }

function paint(){
  const dk=_u.tema==='dark', bg=dk?'#1e293b':'#fff', bd=dk?'#334155':'#e2e8f0', p=_u.permisos||{};
  _c.innerHTML=`<div style="max-width:1100px;margin:0 auto">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
      <input id="cd-s" placeholder="${t('search')}" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit;outline:none">
      ${p.canAdd?`<button id="cd-a" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>`:''}
    </div>
    <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:${dk?'#0f172a':'#f8fafc'}">
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('nombre')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('apellido')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('empresa')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('telefono')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('pasaporte')}</th>
          <th style="padding:8px 12px;text-align:center">⚙</th>
        </tr></thead><tbody id="cd-tb"></tbody>
      </table></div>
      <div id="cd-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell','noData')}</div>
    </div></div>`;
  const si=_c.querySelector('#cd-s'); if(si) si.oninput=debounce(()=>{_search=si.value.trim().toLowerCase();applyFilter();renderRows();},250);
  const ab=_c.querySelector('#cd-a'); if(ab) ab.onclick=()=>openModal();
  renderRows();
}

async function loadData(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen(COLLECTION,docs=>{const r=_u.recinto||'';_data=r?docs.filter(d=>d.recinto===r):docs;applyFilter();renderRows();});}catch(e){console.warn('conductores load:',e);}}

function applyFilter(){if(!_search){_filtered=[..._data];return;}_filtered=_data.filter(d=>(d.nombre||'').toLowerCase().includes(_search)||(d.apellido||'').toLowerCase().includes(_search)||(d.empresa||'').toLowerCase().includes(_search)||(d.pasaporte||'').toLowerCase().includes(_search));}

function renderRows(){const tb=_c.querySelector('#cd-tb'),em=_c.querySelector('#cd-em');if(!tb)return;if(!_filtered.length){tb.innerHTML='';if(em)em.style.display='block';return;}if(em)em.style.display='none';const dk=_u.tema==='dark',p=_u.permisos||{};
  tb.innerHTML=_filtered.map(d=>`<tr style="border-top:1px solid ${dk?'#334155':'#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.nombre||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.apellido||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.empresa||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.telefono||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.pasaporte||'—')}</td>
    <td style="padding:8px 12px;text-align:center">
      ${p.canEdit?`<button onclick="window._beuEditCd('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">✏️</button>`:''}
      ${p.canDel?`<button onclick="window._beuDelCd('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">🗑</button>`:''}
    </td></tr>`).join('');}

function openModal(editId=null){const dk=_u.tema==='dark',r=editId?_data.find(d=>d.id===editId):{};const old=document.getElementById('beu-cd-modal');if(old)old.remove();
  const fs=[{k:'nombre'},{k:'apellido'},{k:'pasaporte'},{k:'telefono'},{k:'email'},{k:'empresa'},{k:'pais'},{k:'fechaNac'}];
  const m=document.createElement('div');m.id='beu-cd-modal';m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML=`<div style="background:${dk?'#1e293b':'#fff'};border-radius:14px;padding:20px;max-width:480px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.25);color:inherit">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:15px;font-weight:700">${editId?t('edit'):t('add')} ${t('title')}</div><button id="xc" style="background:none;border:none;font-size:18px;cursor:pointer;color:inherit">✕</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${fs.map(f=>`<div><label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t(f.k)}</label><input data-f="${f.k}" value="${safeHtml(r[f.k]||'')}" style="width:100%;padding:8px;border:1px solid ${dk?'#475569':'#e2e8f0'};border-radius:6px;font-size:12px;background:${dk?'#0f172a':'#f8fafc'};color:inherit"></div>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="cn" style="padding:8px 16px;border:1px solid ${dk?'#475569':'#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="cs" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button></div></div>`;
  m.querySelector('#xc').onclick=()=>m.remove();m.querySelector('#cn').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#cs').onclick=async()=>{const fd={recinto:_u.recinto||'',modificado:nowLocal(),modificadoPor:_u.uid};m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    try{if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${editId}`,fd);}else{fd.creadoPor=_u.uid;fd.creado=nowLocal();const{fsAdd}=await import('./firestore.js');await fsAdd(COLLECTION,fd);}toast(t('save')+' ✓','#10b981');m.remove();}catch(e){toast(trFree('shell','error'),'#ef4444');}};
  document.body.appendChild(m);}

window._beuEditCd=id=>openModal(id);
window._beuDelCd=async id=>{if(!confirm(t('confirm')+'?'))return;try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLLECTION}/${id}`);toast(t('delete')+' ✓','#f59e0b');}catch(e){toast(trFree('shell','error'),'#ef4444');}};
