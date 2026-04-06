// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — agenda.js — Módulo Agenda/Reservas
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, toast, nowLocal, debounce } from './utils.js';

const COLLECTION = 'agenda';
let _c, _u, _data=[], _filtered=[], _unsub, _search='';

export function render(c, u) { _c=c; _u=u; _data=[]; _filtered=[]; paint(); loadData(); return ()=>{ if(_unsub)_unsub(); }; }
function t(k){ return tr('agenda',k)||trFree('shell',k)||k; }

function paint(){
  const dk=_u.tema==='dark', bg=dk?'#1e293b':'#fff', bd=dk?'#334155':'#e2e8f0', p=_u.permisos||{};
  _c.innerHTML=`<div style="max-width:1100px;margin:0 auto">
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
      <input id="ag-s" placeholder="${t('search')}" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit;outline:none">
      ${p.canAdd?`<button id="ag-a" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>`:''}
    </div>
    <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:${dk?'#0f172a':'#f8fafc'}">
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('fecha')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('hora')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('empresa')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('vehiculo')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('hall')}</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600">${t('estado')}</th>
          <th style="padding:8px 12px;text-align:center">⚙</th>
        </tr></thead><tbody id="ag-tb"></tbody>
      </table></div>
      <div id="ag-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell','noData')}</div>
    </div></div>`;
  const si=_c.querySelector('#ag-s'); if(si) si.oninput=debounce(()=>{_search=si.value.trim().toLowerCase();applyFilter();renderRows();},250);
  const ab=_c.querySelector('#ag-a'); if(ab) ab.onclick=()=>openModal();
  renderRows();
}

async function loadData(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen(COLLECTION,docs=>{const r=_u.recinto||'';_data=r?docs.filter(d=>d.recinto===r):docs;applyFilter();renderRows();});}catch(e){console.warn('agenda load:',e);}}

function applyFilter(){if(!_search){_filtered=[..._data];return;}_filtered=_data.filter(d=>(d.empresa||'').toLowerCase().includes(_search)||(d.vehiculo||'').toLowerCase().includes(_search)||(d.fecha||'').includes(_search));}

function renderRows(){const tb=_c.querySelector('#ag-tb'),em=_c.querySelector('#ag-em');if(!tb)return;if(!_filtered.length){tb.innerHTML='';if(em)em.style.display='block';return;}if(em)em.style.display='none';const dk=_u.tema==='dark',p=_u.permisos||{};
  tb.innerHTML=_filtered.map(d=>{
    const st=d.estado||'planificado';
    const stStyle=st==='completado'?'background:#dcfce7;color:#166534':st==='enCurso'?'background:#dbeafe;color:#1e3a5f':st==='cancelado'?'background:#fecaca;color:#7f1d1d':'background:#f1f5f9;color:#64748b';
    return`<tr style="border-top:1px solid ${dk?'#334155':'#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.fecha||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.hora||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.empresa||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.vehiculo||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.hall||'—')}</td>
    <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;${stStyle}">${t(st)}</span></td>
    <td style="padding:8px 12px;text-align:center">
      ${p.canEdit?`<button onclick="window._beuEditAg('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">✏️</button>`:''}
      ${p.canDel?`<button onclick="window._beuDelAg('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">🗑</button>`:''}
    </td></tr>`;}).join('');}

function openModal(editId=null){const dk=_u.tema==='dark',r=editId?_data.find(d=>d.id===editId):{};const old=document.getElementById('beu-ag-modal');if(old)old.remove();
  const fs=[{k:'fecha',type:'date'},{k:'hora',type:'time'},{k:'empresa'},{k:'vehiculo'},{k:'hall'},{k:'stand'}];
  const m=document.createElement('div');m.id='beu-ag-modal';m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML=`<div style="background:${dk?'#1e293b':'#fff'};border-radius:14px;padding:20px;max-width:440px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.25);color:inherit">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:15px;font-weight:700">${editId?t('edit'):t('add')} ${t('title')}</div><button id="xag" style="background:none;border:none;font-size:18px;cursor:pointer;color:inherit">✕</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${fs.map(f=>`<div><label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t(f.k)}</label><input data-f="${f.k}" type="${f.type||'text'}" value="${safeHtml(r[f.k]||'')}" style="width:100%;padding:8px;border:1px solid ${dk?'#475569':'#e2e8f0'};border-radius:6px;font-size:12px;background:${dk?'#0f172a':'#f8fafc'};color:inherit"></div>`).join('')}</div>
    <div style="margin-top:10px"><label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t('estado')}</label>
      <select data-f="estado" style="width:100%;padding:8px;border:1px solid ${dk?'#475569':'#e2e8f0'};border-radius:6px;font-size:12px;background:${dk?'#0f172a':'#f8fafc'};color:inherit">
        ${['planificado','enCurso','completado','cancelado'].map(s=>`<option value="${s}"${(r.estado||'planificado')===s?' selected':''}>${t(s)}</option>`).join('')}
      </select></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="agn" style="padding:8px 16px;border:1px solid ${dk?'#475569':'#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="ags" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button></div></div>`;
  m.querySelector('#xag').onclick=()=>m.remove();m.querySelector('#agn').onclick=()=>m.remove();m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#ags').onclick=async()=>{const fd={recinto:_u.recinto||'',modificado:nowLocal(),modificadoPor:_u.uid};m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    try{if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${editId}`,fd);}else{fd.creadoPor=_u.uid;fd.creado=nowLocal();const{fsAdd}=await import('./firestore.js');await fsAdd(COLLECTION,fd);}toast(t('save')+' ✓','#10b981');m.remove();}catch(e){toast(trFree('shell','error'),'#ef4444');}};
  document.body.appendChild(m);}

window._beuEditAg=id=>openModal(id);
window._beuDelAg=async id=>{if(!confirm(t('confirm')+'?'))return;try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLLECTION}/${id}`);toast(t('delete')+' ✓','#f59e0b');}catch(e){toast(trFree('shell','error'),'#ef4444');}};
