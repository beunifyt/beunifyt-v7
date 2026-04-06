// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos.js — Módulo Referencia (el original)
// Subtabs: lista, especial, historial, campos
// Se duplica para referencia, conductores, agenda
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, debounce } from './utils.js';

const COLLECTION = 'ingresos';
let _container = null;
let _usuario = null;
let _data = [];
let _filtered = [];
let _subtab = 'lista';
let _unsub = null;
let _searchTerm = '';

export function render(container, usuario) {
  _container = container;
  _usuario = usuario;
  _data = [];
  _filtered = [];
  _subtab = 'lista';
  paint();
  loadData();
  return cleanup;
}

function cleanup() {
  if (_unsub) { _unsub(); _unsub = null; }
}

function t(k) { return tr('ingresos', k) || trFree('shell', k) || k; }

function paint() {
  const isDark = _usuario.tema === 'dark';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const p = _usuario.permisos || {};

  _container.innerHTML = `
    <div style="max-width:1100px;margin:0 auto">
      <!-- SUBTABS -->
      <div style="display:flex;gap:0;border-bottom:1px solid ${border};margin-bottom:12px">
        ${['lista','especial','historial','campos'].map(st => {
          if (st === 'campos' && !p.canCampos) return '';
          return `<button class="beu-subtab" data-st="${st}" style="padding:8px 16px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:600;border-bottom:2px solid ${_subtab === st ? '#3b82f6' : 'transparent'};color:${_subtab === st ? '#3b82f6' : '#64748b'}">${t(st)}</button>`;
        }).join('')}
      </div>

      <!-- TOOLBAR -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
        <input id="ing-search" type="text" placeholder="${t('search') || 'Buscar'}" value="${safeHtml(_searchTerm)}" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid ${border};border-radius:8px;font-size:12px;background:${cardBg};color:inherit;outline:none">
        ${p.canAdd ? `<button id="ing-add" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>` : ''}
        ${p.canExport ? `<button id="ing-export" style="padding:8px 14px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${t('export')}</button>` : ''}
      </div>

      <!-- TABLA -->
      <div style="background:${cardBg};border:1px solid ${border};border-radius:10px;overflow:hidden">
        <div style="overflow-x:auto">
          <table id="ing-table" style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:${isDark ? '#0f172a' : '#f8fafc'}">
                <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap">${t('matricula')}</th>
                <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap">${t('empresa')}</th>
                <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap">${t('hall')}</th>
                <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap">${t('horaIngreso')}</th>
                <th style="padding:8px 12px;text-align:left;font-weight:600;white-space:nowrap">${t('estado')}</th>
                <th style="padding:8px 12px;text-align:center;font-weight:600">⚙</th>
              </tr>
            </thead>
            <tbody id="ing-tbody"></tbody>
          </table>
        </div>
        <div id="ing-empty" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell', 'noData')}</div>
      </div>
    </div>
  `;

  // Eventos subtabs
  _container.querySelectorAll('.beu-subtab').forEach(btn => {
    btn.onclick = () => { _subtab = btn.dataset.st; paint(); loadData(); };
  });

  // Búsqueda
  const searchInput = _container.querySelector('#ing-search');
  if (searchInput) {
    searchInput.oninput = debounce(() => {
      _searchTerm = searchInput.value.trim().toLowerCase();
      applyFilter();
      renderRows();
    }, 250);
  }

  // Añadir
  const addBtn = _container.querySelector('#ing-add');
  if (addBtn) addBtn.onclick = () => openModal();

  // Exportar
  const expBtn = _container.querySelector('#ing-export');
  if (expBtn) expBtn.onclick = () => exportData();

  renderRows();
}

async function loadData() {
  try {
    const { fsListen } = await import('./firestore.js');
    if (_unsub) _unsub();
    _unsub = await fsListen(COLLECTION, (docs) => {
      const recinto = _usuario.recinto || '';
      _data = recinto ? docs.filter(d => d.recinto === recinto) : docs;
      applyFilter();
      renderRows();
    });
  } catch (e) {
    console.warn('ingresos loadData error:', e);
  }
}

function applyFilter() {
  if (!_searchTerm) { _filtered = [..._data]; return; }
  _filtered = _data.filter(d =>
    (d.matricula || '').toLowerCase().includes(_searchTerm) ||
    (d.empresa || '').toLowerCase().includes(_searchTerm) ||
    (d.nombre || '').toLowerCase().includes(_searchTerm) ||
    (d.hall || '').toLowerCase().includes(_searchTerm)
  );
}

function renderRows() {
  const tbody = _container.querySelector('#ing-tbody');
  const empty = _container.querySelector('#ing-empty');
  if (!tbody) return;

  if (_filtered.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const isDark = _usuario.tema === 'dark';
  const p = _usuario.permisos || {};

  tbody.innerHTML = _filtered.map(d => `
    <tr style="border-top:1px solid ${isDark ? '#334155' : '#f1f5f9'}">
      <td style="padding:8px 12px;font-weight:600">${safeHtml(d.matricula || '—')}</td>
      <td style="padding:8px 12px">${safeHtml(d.empresa || '—')}</td>
      <td style="padding:8px 12px">${safeHtml(d.hall || '—')}</td>
      <td style="padding:8px 12px">${safeHtml(d.fecha || d.horaIngreso || '—')}</td>
      <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;${statusStyle(d.estado)}">${safeHtml(d.estado || '—')}</span></td>
      <td style="padding:8px 12px;text-align:center">
        ${p.canEdit ? `<button onclick="window._beuEditIng('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px" title="${t('edit')}">✏️</button>` : ''}
        ${p.canDel ? `<button onclick="window._beuDelIng('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px" title="${t('delete')}">🗑</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function statusStyle(estado) {
  switch (estado) {
    case 'EN_RECINTO': return 'background:#dcfce7;color:#166534';
    case 'SALIDA':     return 'background:#e2e8f0;color:#475569';
    case 'FUERA_OP':   return 'background:#fef3c7;color:#92400e';
    default:           return 'background:#f1f5f9;color:#64748b';
  }
}

// ─── MODAL CRUD ─────────────────────────────────────────
function openModal(editId = null) {
  const isDark = _usuario.tema === 'dark';
  const existing = document.getElementById('beu-ing-modal');
  if (existing) existing.remove();

  const record = editId ? _data.find(d => d.id === editId) : {};

  const fields = [
    { key:'matricula', type:'text' },
    { key:'remolque', type:'text' },
    { key:'empresa', type:'text' },
    { key:'montador', type:'text' },
    { key:'expositor', type:'text' },
    { key:'hall', type:'text' },
    { key:'stand', type:'text' },
    { key:'puerta', type:'text' },
    { key:'nombre', type:'text' },
    { key:'apellido', type:'text' },
    { key:'pasaporte', type:'text' },
    { key:'telefono', type:'tel' },
    { key:'email', type:'email' },
    { key:'referencia', type:'text' },
    { key:'obs', type:'textarea' },
  ];

  const modal = document.createElement('div');
  modal.id = 'beu-ing-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';

  modal.innerHTML = `
    <div style="background:${isDark ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.25);color:inherit">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:700">${editId ? t('edit') : t('add')} ${t('title')}</div>
        <button id="modal-close" style="background:none;border:none;font-size:18px;cursor:pointer;color:inherit">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${fields.map(f => `
          <div${f.key === 'obs' ? ' style="grid-column:span 2"' : ''}>
            <label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:2px">${t(f.key)}</label>
            ${f.type === 'textarea'
              ? `<textarea data-field="${f.key}" style="width:100%;padding:8px;border:1px solid ${isDark ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${isDark ? '#0f172a' : '#f8fafc'};color:inherit;resize:vertical;min-height:60px">${safeHtml(record[f.key] || '')}</textarea>`
              : `<input data-field="${f.key}" type="${f.type}" value="${safeHtml(record[f.key] || '')}" style="width:100%;padding:8px;border:1px solid ${isDark ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${isDark ? '#0f172a' : '#f8fafc'};color:inherit">`
            }
          </div>
        `).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
        <button id="modal-cancel" style="padding:8px 16px;border:1px solid ${isDark ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
        <button id="modal-save" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
      </div>
    </div>
  `;

  modal.querySelector('#modal-close').onclick = () => modal.remove();
  modal.querySelector('#modal-cancel').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.querySelector('#modal-save').onclick = async () => {
    const formData = { recinto: _usuario.recinto || '', modificado: nowLocal(), modificadoPor: _usuario.uid };
    modal.querySelectorAll('[data-field]').forEach(el => {
      formData[el.dataset.field] = el.value || '';
    });

    try {
      if (editId) {
        const { fsUpdate } = await import('./firestore.js');
        await fsUpdate(`${COLLECTION}/${editId}`, formData);
      } else {
        formData.fecha = nowLocal();
        formData.estado = 'EN_RECINTO';
        formData.creadoPor = _usuario.uid;
        const { fsAdd } = await import('./firestore.js');
        await fsAdd(COLLECTION, formData);
      }
      toast(t('save') + ' ✓', '#10b981');
      modal.remove();
    } catch (e) {
      toast(trFree('shell', 'error'), '#ef4444');
      console.error('Save error:', e);
    }
  };

  document.body.appendChild(modal);
}

async function deleteRecord(id) {
  if (!confirm(t('confirm') + '?')) return;
  try {
    const { fsDel } = await import('./firestore.js');
    await fsDel(`${COLLECTION}/${id}`);
    toast(t('delete') + ' ✓', '#f59e0b');
  } catch (e) {
    toast(trFree('shell', 'error'), '#ef4444');
  }
}

async function exportData() {
  try {
    // Carga dinámica de xlsx solo al exportar
    toast(trFree('shell', 'loading'), '#3b82f6');
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
    const ws = XLSX.utils.json_to_sheet(_filtered.map(d => ({
      [t('matricula')]: d.matricula,
      [t('empresa')]: d.empresa,
      [t('hall')]: d.hall,
      [t('horaIngreso')]: d.fecha,
      [t('estado')]: d.estado,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('title'));
    XLSX.writeFile(wb, `${t('title')}_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast(t('export') + ' ✓', '#10b981');
  } catch (e) {
    console.error('Export error:', e);
    toast(trFree('shell', 'error'), '#ef4444');
  }
}

// Exponer funciones al window para onclick inline
window._beuEditIng = (id) => openModal(id);
window._beuDelIng = (id) => deleteRecord(id);
