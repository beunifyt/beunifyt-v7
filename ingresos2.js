// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo Ingresos/Accesos
// Duplicado de ingresos.js con campos adaptados
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, debounce } from './utils.js';

const COLLECTION = 'accesos';
let _container, _usuario, _data = [], _filtered = [], _unsub, _search = '';

export function render(container, usuario) {
  _container = container; _usuario = usuario; _data = []; _filtered = [];
  paint(); loadData();
  return () => { if (_unsub) _unsub(); };
}

function t(k) { return tr('ingresos', k) || trFree('shell', k) || k; }

function paint() {
  const isDark = _usuario.tema === 'dark';
  const bg = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const p = _usuario.permisos || {};

  _container.innerHTML = `
    <div style="max-width:1100px;margin:0 auto">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
        <input id="acc-search" type="text" placeholder="${t('search')}" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid ${border};border-radius:8px;font-size:12px;background:${bg};color:inherit;outline:none">
        ${p.canAdd ? `<button id="acc-add" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>` : ''}
        ${p.canExport ? `<button id="acc-export" style="padding:8px 14px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${t('export')}</button>` : ''}
      </div>
      <div style="background:${bg};border:1px solid ${border};border-radius:10px;overflow:hidden">
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead><tr style="background:${isDark ? '#0f172a' : '#f8fafc'}">
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('matricula')}</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('remolque')}</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('empresa')}</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('hall')}</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('horaIngreso')}</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">${t('estado')}</th>
              <th style="padding:8px 12px;text-align:center">⚙</th>
            </tr></thead>
            <tbody id="acc-tbody"></tbody>
          </table>
        </div>
        <div id="acc-empty" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell','noData')}</div>
      </div>
    </div>`;

  const si = _container.querySelector('#acc-search');
  if (si) si.oninput = debounce(() => { _search = si.value.trim().toLowerCase(); applyFilter(); renderRows(); }, 250);
  const ab = _container.querySelector('#acc-add');
  if (ab) ab.onclick = () => openModal();
  const eb = _container.querySelector('#acc-export');
  if (eb) eb.onclick = () => exportData();
  renderRows();
}

async function loadData() {
  try {
    const { fsListen } = await import('./firestore.js');
    if (_unsub) _unsub();
    _unsub = await fsListen(COLLECTION, docs => {
      const r = _usuario.recinto || '';
      _data = r ? docs.filter(d => d.recinto === r) : docs;
      applyFilter(); renderRows();
    });
  } catch(e) { console.warn('ingresos2 load error:', e); }
}

function applyFilter() {
  if (!_search) { _filtered = [..._data]; return; }
  _filtered = _data.filter(d => (d.matricula||'').toLowerCase().includes(_search)||(d.empresa||'').toLowerCase().includes(_search)||(d.nombre||'').toLowerCase().includes(_search));
}

function renderRows() {
  const tb = _container.querySelector('#acc-tbody');
  const em = _container.querySelector('#acc-empty');
  if (!tb) return;
  if (!_filtered.length) { tb.innerHTML=''; if(em) em.style.display='block'; return; }
  if(em) em.style.display='none';
  const isDark = _usuario.tema==='dark'; const p = _usuario.permisos||{};
  tb.innerHTML = _filtered.map(d=>`<tr style="border-top:1px solid ${isDark?'#334155':'#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.matricula||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.remolque||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.empresa||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.hall||'—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.fecha||'—')}</td>
    <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;${statusStyle(d.estado)}">${safeHtml(d.estado||'—')}</span></td>
    <td style="padding:8px 12px;text-align:center">
      ${p.canEdit?`<button onclick="window._beuEditAcc('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">✏️</button>`:''}
      ${p.canDel?`<button onclick="window._beuDelAcc('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">🗑</button>`:''}
    </td></tr>`).join('');
}

function statusStyle(e){switch(e){case'EN_RECINTO':return'background:#dcfce7;color:#166534';case'SALIDA':return'background:#e2e8f0;color:#475569';default:return'background:#f1f5f9;color:#64748b';}}

function openModal(editId=null) {
  const isDark=_usuario.tema==='dark'; const r=editId?_data.find(d=>d.id===editId):{};
  const old=document.getElementById('beu-acc-modal'); if(old) old.remove();
  const fields=[{k:'matricula'},{k:'remolque'},{k:'empresa'},{k:'expositor'},{k:'hall'},{k:'stand'},{k:'puerta'},{k:'nombre'},{k:'apellido'},{k:'pasaporte'},{k:'telefono'},{k:'email'},{k:'referencia'},{k:'tipoVeh'},{k:'descarga'},{k:'obs',type:'textarea'}];
  const m=document.createElement('div');m.id='beu-acc-modal';
  m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML=`<div style="background:${isDark?'#1e293b':'#fff'};border-radius:14px;padding:20px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.25);color:inherit">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:15px;font-weight:700">${editId?t('edit'):t('add')}</div><button id="mc" style="background:none;border:none;font-size:18px;cursor:pointer;color:inherit">✕</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${fields.map(f=>`<div${f.type==='textarea'?' style="grid-column:span 2"':''}>
      <label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t(f.k)}</label>
      ${f.type==='textarea'?`<textarea data-f="${f.k}" style="width:100%;padding:8px;border:1px solid ${isDark?'#475569':'#e2e8f0'};border-radius:6px;font-size:12px;background:${isDark?'#0f172a':'#f8fafc'};color:inherit;resize:vertical;min-height:60px">${safeHtml(r[f.k]||'')}</textarea>`
      :`<input data-f="${f.k}" value="${safeHtml(r[f.k]||'')}" style="width:100%;padding:8px;border:1px solid ${isDark?'#475569':'#e2e8f0'};border-radius:6px;font-size:12px;background:${isDark?'#0f172a':'#f8fafc'};color:inherit">`}</div>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="mn" style="padding:8px 16px;border:1px solid ${isDark?'#475569':'#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="ms" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;
  m.querySelector('#mc').onclick=()=>m.remove(); m.querySelector('#mn').onclick=()=>m.remove(); m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#ms').onclick=async()=>{
    const fd={recinto:_usuario.recinto||'',modificado:nowLocal(),modificadoPor:_usuario.uid};
    m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    try{if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${editId}`,fd);}else{fd.fecha=nowLocal();fd.estado='EN_RECINTO';fd.creadoPor=_usuario.uid;const{fsAdd}=await import('./firestore.js');await fsAdd(COLLECTION,fd);}toast(t('save')+' ✓','#10b981');m.remove();}catch(e){toast(trFree('shell','error'),'#ef4444');}
  };
  document.body.appendChild(m);
}

async function exportData(){try{toast(trFree('shell','loading'),'#3b82f6');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const ws=X.utils.json_to_sheet(_filtered.map(d=>({[t('matricula')]:d.matricula,[t('empresa')]:d.empresa,[t('hall')]:d.hall,[t('horaIngreso')]:d.fecha,[t('estado')]:d.estado})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,t('title'));X.writeFile(wb,`${t('title')}_${new Date().toISOString().slice(0,10)}.xlsx`);toast(t('export')+' ✓','#10b981');}catch(e){toast(trFree('shell','error'),'#ef4444');}}

window._beuEditAcc=id=>openModal(id);
window._beuDelAcc=async id=>{if(!confirm(t('confirm')+'?'))return;try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLLECTION}/${id}`);toast(t('delete')+' ✓','#f59e0b');}catch(e){toast(trFree('shell','error'),'#ef4444');}};
