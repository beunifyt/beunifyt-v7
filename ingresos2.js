// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo Ingresos/Accesos
// Visual con card + subtabs + filtros hall + tabla
// ⚠ ERROR GRAVE PENDIENTE: este archivo debería ser 'ingresos' (id cruzado)
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, debounce } from './utils.js';

const COLLECTION = 'accesos';
let _container, _usuario, _data = [], _filtered = [], _unsub;
let _search = '', _subtab = 'lista', _hallFilter = '', _activosOnly = false;

export function render(container, usuario) {
  _container = container; _usuario = usuario;
  _data = []; _filtered = []; _search = ''; _subtab = 'lista'; _hallFilter = ''; _activosOnly = false;
  paint(); loadData();
  return () => { if (_unsub) _unsub(); };
}

function t(k) { return tr('ingresos', k) || trFree('shell', k) || k; }

function paint() {
  const isDark = _usuario.tema === 'dark';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const bg3 = isDark ? '#0f172a' : '#f8fafc';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const accent = '#3b82f6';
  const accentBg = isDark ? 'rgba(59,130,246,.12)' : '#eff6ff';
  const p = _usuario.permisos || {};

  const halls = _getHalls();
  const count = _filtered.length;

  _container.innerHTML = `
    <div style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;height:100%">

      <!-- TOPBAR -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;flex-shrink:0">
        <div style="font-size:22px;font-weight:700;letter-spacing:-.4px">${t('title') || 'Ingresos'}</div>
        <span style="font-size:11px;color:${textMuted}">${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
        <span style="flex:1"></span>
        ${p.canAdd ? `<button id="ing2-add" style="padding:8px 16px;background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>` : ''}
      </div>

      <!-- CARD -->
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:${cardBg};border:1px solid ${border};border-radius:10px;box-shadow:0 2px 12px rgba(0,0,0,.04)">

        <!-- SUBTABS -->
        <div style="display:flex;align-items:center;gap:2px;padding:8px 12px;border-bottom:1px solid ${border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
          ${[['lista','📋 Lista'],['especial','⭐ Especial'],['historial','📝 Modif.'],...(p.canCampos ? [['campos','⚙ Campos']] : [])]
            .map(([s,l]) => `<button class="ing2-stab" data-st="${s}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:${_subtab===s?'600':'500'};background:${_subtab===s?accentBg:'transparent'};color:${_subtab===s?accent:textMuted};cursor:pointer;border:none;white-space:nowrap;transition:all .15s">${l}</button>`).join('')}
          <span style="flex:1"></span>
          <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">
            ${p.canExport ? `<button id="ing2-export" style="padding:4px 10px;background:${bg3};color:${textMuted};border:1px solid ${border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⬇ Excel</button>` : ''}
          </div>
        </div>

        ${_subtab === 'lista' || _subtab === 'especial' ? `
        <!-- SEARCH BAR -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid ${border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
          <div style="flex:1;min-width:140px;display:flex;align-items:center;background:${bg3};border:1.5px solid ${border};border-radius:20px;padding:4px 10px;gap:6px">
            <span style="font-size:14px;opacity:.5">🔍</span>
            <input id="ing2-search" type="search" placeholder="${t('search') || 'Matrícula, nombre...'}" value="${safeHtml(_search)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:inherit">
          </div>
          <span id="ing2-activos" style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_activosOnly?accent:border};background:${_activosOnly?accent:cardBg};color:${_activosOnly?'#fff':textMuted};user-select:none">Solo activos</span>
          <span style="font-size:10px;color:${textMuted}">${count} reg.</span>
        </div>

        <!-- HALLS -->
        ${halls.length ? `<div style="display:flex;gap:4px;padding:6px 12px;border-bottom:1px solid ${border};flex-wrap:wrap;flex-shrink:0">
          <span class="ing2-hp" data-hall="" style="padding:3px 11px;border-radius:20px;font-size:11px;font-weight:${!_hallFilter?'600':'500'};cursor:pointer;background:${!_hallFilter?accentBg:bg3};color:${!_hallFilter?accent:textMuted};border:1px solid ${!_hallFilter?accent:border};transition:all .15s">${trFree('shell','all') || 'Todos'}</span>
          ${halls.map(h => `<span class="ing2-hp" data-hall="${h}" style="padding:3px 11px;border-radius:20px;font-size:11px;font-weight:${_hallFilter===h?'600':'500'};cursor:pointer;background:${_hallFilter===h?accentBg:bg3};color:${_hallFilter===h?accent:textMuted};border:1px solid ${_hallFilter===h?accent:border};transition:all .15s">${h}</span>`).join('')}
        </div>` : ''}` : ''}

        <!-- TABLE BODY -->
        <div id="ing2-body" style="flex:1;overflow:auto"></div>
      </div>
    </div>`;

  // Events
  _container.querySelectorAll('.ing2-stab').forEach(b => { b.onclick = () => { _subtab = b.dataset.st; paint(); }; });
  _container.querySelectorAll('.ing2-hp').forEach(b => { b.onclick = () => { _hallFilter = b.dataset.hall; applyFilter(); paint(); }; });
  const si = _container.querySelector('#ing2-search');
  if (si) si.oninput = debounce(() => { _search = si.value.trim().toLowerCase(); applyFilter(); renderRows(); }, 250);
  const actBtn = _container.querySelector('#ing2-activos');
  if (actBtn) actBtn.onclick = () => { _activosOnly = !_activosOnly; applyFilter(); paint(); };
  const addBtn = _container.querySelector('#ing2-add');
  if (addBtn) addBtn.onclick = () => openModal();
  const expBtn = _container.querySelector('#ing2-export');
  if (expBtn) expBtn.onclick = () => exportData();

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

function _getHalls() {
  const set = new Set();
  _data.forEach(d => { if (d.hall) set.add(d.hall); });
  return [...set].sort();
}

function applyFilter() {
  let items = [..._data];
  if (_hallFilter) items = items.filter(d => d.hall === _hallFilter);
  if (_activosOnly) items = items.filter(d => d.estado === 'EN_RECINTO');
  if (_search) items = items.filter(d =>
    (d.matricula||'').toLowerCase().includes(_search) ||
    (d.empresa||'').toLowerCase().includes(_search) ||
    (d.nombre||'').toLowerCase().includes(_search) ||
    (d.hall||'').toLowerCase().includes(_search)
  );
  _filtered = items;
}

function renderRows() {
  const body = _container.querySelector('#ing2-body');
  if (!body) return;

  if (_subtab !== 'lista') {
    body.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8;font-size:13px">${_subtab === 'especial' ? '⭐ Alertas especiales (próximamente)' : _subtab === 'historial' ? '📝 Historial de modificaciones (próximamente)' : '⚙ Configuración de campos (próximamente)'}</div>`;
    return;
  }

  if (!_filtered.length) {
    body.innerHTML = `<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">🚛</div><div style="font-weight:600;margin-top:6px">${trFree('shell','noData') || 'Sin datos'}</div></div>`;
    return;
  }

  const isDark = _usuario.tema === 'dark';
  const border = isDark ? '#334155' : '#f1f5f9';
  const thBg = isDark ? '#0f172a' : '#f8fafc';
  const p = _usuario.permisos || {};

  body.innerHTML = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:${thBg}">
      <th style="padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap">${t('matricula')}</th>
      <th style="padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap">${t('empresa')}</th>
      <th style="padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px">${t('hall')}</th>
      <th style="padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px">${t('horaIngreso')}</th>
      <th style="padding:8px 12px;text-align:left;font-weight:700;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.4px">${t('estado')}</th>
      <th style="padding:8px 12px;text-align:center;font-weight:700;font-size:11px;color:#64748b">⚙</th>
    </tr></thead>
    <tbody>${_filtered.map(d => `<tr style="border-top:1px solid ${border}">
      <td style="padding:8px 12px"><span style="display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:6px;padding:2px 7px;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:.5px;cursor:pointer" onclick="window._beuDetAcc('${d.id}')">${safeHtml(d.matricula||'—')}</span></td>
      <td style="padding:8px 12px">${safeHtml(d.empresa||'—')}</td>
      <td style="padding:8px 12px"><span style="display:inline-flex;align-items:center;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe">${safeHtml(d.hall||'—')}</span></td>
      <td style="padding:8px 12px;font-size:11px;white-space:nowrap">${safeHtml(d.fecha||'—')}</td>
      <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;${_statusStyle(d.estado)}">${safeHtml(d.estado||'—')}</span></td>
      <td style="padding:8px 12px;text-align:center">
        <div style="display:flex;gap:3px;justify-content:center">
          ${p.canEdit ? `<button onclick="window._beuEditAcc('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:13px" title="${t('edit')}">✏️</button>` : ''}
          ${p.canDel ? `<button onclick="window._beuDelAcc('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:13px" title="${t('delete')}">🗑</button>` : ''}
        </div>
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function _statusStyle(e) {
  switch(e) {
    case 'EN_RECINTO': return 'background:#dcfce7;color:#166534';
    case 'SALIDA': return 'background:#e2e8f0;color:#475569';
    case 'EN_CAMINO': return 'background:#dbeafe;color:#1d4ed8';
    case 'ESPERA': return 'background:#fef9c3;color:#a16207';
    case 'RAMPA': return 'background:#ede9fe;color:#6d28d9';
    default: return 'background:#f1f5f9;color:#64748b';
  }
}

function openModal(editId = null) {
  const isDark = _usuario.tema === 'dark';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#475569' : '#e2e8f0';
  const inputBg = isDark ? '#0f172a' : '#f8fafc';
  const old = document.getElementById('beu-acc-modal'); if (old) old.remove();
  const r = editId ? _data.find(d => d.id === editId) : {};

  const fields = [
    {k:'matricula'},{k:'remolque'},{k:'empresa'},{k:'expositor'},
    {k:'hall'},{k:'stand'},{k:'puerta'},{k:'nombre'},
    {k:'apellido'},{k:'pasaporte'},{k:'telefono'},{k:'email'},
    {k:'referencia'},{k:'tipoVeh'},{k:'descarga'},{k:'obs',type:'textarea'}
  ];

  const m = document.createElement('div'); m.id = 'beu-acc-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${cardBg};border-radius:14px;padding:20px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.25);color:inherit">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px"><div style="font-size:15px;font-weight:700">${editId ? t('edit') : t('add')}</div><button id="mc" style="background:none;border:none;font-size:18px;cursor:pointer;color:inherit">✕</button></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${fields.map(f => `<div${f.type === 'textarea' ? ' style="grid-column:span 2"' : ''}>
      <label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t(f.k)}</label>
      ${f.type === 'textarea'
        ? `<textarea data-f="${f.k}" style="width:100%;padding:8px;border:1px solid ${border};border-radius:8px;font-size:12px;background:${inputBg};color:inherit;resize:vertical;min-height:60px">${safeHtml(r[f.k]||'')}</textarea>`
        : `<input data-f="${f.k}" value="${safeHtml(r[f.k]||'')}" style="width:100%;padding:8px;border:1px solid ${border};border-radius:8px;font-size:12px;background:${inputBg};color:inherit">`
      }</div>`).join('')}</div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid ${border}">
      <button id="mn" style="padding:8px 16px;border:1px solid ${border};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="ms" style="padding:8px 18px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;

  m.querySelector('#mc').onclick = () => m.remove();
  m.querySelector('#mn').onclick = () => m.remove();
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#ms').onclick = async () => {
    const fd = { recinto: _usuario.recinto || '', modificado: nowLocal(), modificadoPor: _usuario.uid };
    m.querySelectorAll('[data-f]').forEach(el => { fd[el.dataset.f] = el.value || ''; });
    try {
      if (editId) { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`${COLLECTION}/${editId}`, fd); }
      else { fd.fecha = nowLocal(); fd.estado = 'EN_RECINTO'; fd.creadoPor = _usuario.uid; const { fsAdd } = await import('./firestore.js'); await fsAdd(COLLECTION, fd); }
      toast(t('save') + ' ✓', '#10b981'); m.remove();
    } catch(e) { toast(trFree('shell','error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

async function exportData() {
  try {
    toast(trFree('shell','loading'), '#3b82f6');
    const X = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
    const ws = X.utils.json_to_sheet(_filtered.map(d => ({
      [t('matricula')]: d.matricula, [t('empresa')]: d.empresa,
      [t('hall')]: d.hall, [t('horaIngreso')]: d.fecha, [t('estado')]: d.estado
    })));
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, 'Ingresos');
    X.writeFile(wb, `Ingresos_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast(t('export') + ' ✓', '#10b981');
  } catch(e) { toast(trFree('shell','error'), '#ef4444'); }
}

window._beuEditAcc = id => openModal(id);
window._beuDetAcc = id => openModal(id);
window._beuDelAcc = async id => {
  if (!confirm(t('confirm') + '?')) return;
  try { const { fsDel } = await import('./firestore.js'); await fsDel(`${COLLECTION}/${id}`); toast(t('delete') + ' ✓', '#f59e0b'); }
  catch(e) { toast(trFree('shell','error'), '#ef4444'); }
};
