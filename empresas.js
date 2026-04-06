// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — empresas.js — Listado de empresas
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, toast, nowLocal, debounce } from './utils.js';

let _c, _u, _data = [], _filtered = [], _search = '';

export function render(c, u) { _c = c; _u = u; _data = []; _filtered = []; paint(); loadData(); return () => {}; }
function t(k) { return trFree('empresas', k) || trFree('shell', k) || k; }

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:1000px;margin:0 auto">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
        <input id="emp-s" placeholder="${t('search')}" style="flex:1;min-width:180px;padding:8px 12px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit;outline:none">
        <button id="emp-a" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>
      </div>
      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:${dk ? '#0f172a' : '#f8fafc'}">
            <th style="padding:8px 12px;text-align:left;font-weight:600">Empresa</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Contacto</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Teléfono</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Nivel</th>
            <th style="padding:8px 12px;text-align:center">⚙</th>
          </tr></thead>
          <tbody id="emp-tb"></tbody>
        </table></div>
        <div id="emp-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${t('noData')}</div>
      </div>
    </div>`;
  const si = _c.querySelector('#emp-s'); if (si) si.oninput = debounce(() => { _search = si.value.trim().toLowerCase(); applyFilter(); renderRows(); }, 250);
  _c.querySelector('#emp-a').onclick = () => openModal();
  renderRows();
}

async function loadData() {
  try { const { fsGetAll } = await import('./firestore.js'); _data = await fsGetAll('empresas'); applyFilter(); renderRows(); }
  catch (e) { console.warn('empresas load:', e); }
}

function applyFilter() { _filtered = _search ? _data.filter(d => (d.nombre || '').toLowerCase().includes(_search) || (d.contacto || '').toLowerCase().includes(_search)) : [..._data]; }

function renderRows() {
  const tb = _c.querySelector('#emp-tb'), em = _c.querySelector('#emp-em');
  if (!tb) return;
  if (!_filtered.length) { tb.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  tb.innerHTML = _filtered.map(d => `<tr style="border-top:1px solid ${dk ? '#334155' : '#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.nombre || '—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.contacto || '—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.telefono || '—')}</td>
    <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#f1f5f9">${safeHtml(d.nivel || '—')}</span></td>
    <td style="padding:8px 12px;text-align:center">
      <button onclick="window._beuEditEmp('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">✏️</button>
      <button onclick="window._beuDelEmp('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">🗑</button>
    </td></tr>`).join('');
}

function openModal(editId = null) {
  const dk = _u.tema === 'dark', r = editId ? _data.find(d => d.id === editId) : {};
  const old = document.getElementById('beu-emp-modal'); if (old) old.remove();
  const m = document.createElement('div'); m.id = 'beu-emp-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${dk ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:440px;width:100%;color:inherit">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">${editId ? t('edit') : t('add')} Empresa</div>
    <div style="display:grid;gap:10px">
      ${[{k:'nombre',l:t('nombre')},{k:'contacto',l:t('contacto')},{k:'telefono',l:t('telefono')},{k:'email',l:t('email')},{k:'nivel',l:t('nivel')},{k:'direccion',l:t('direccion')}].map(f => `<div><label style="font-size:10px;font-weight:600;color:#64748b">${f.l}</label><input data-f="${f.k}" value="${safeHtml(r[f.k] || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>`).join('')}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="en" style="padding:8px 16px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="es2" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;
  m.querySelector('#en').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#es2').onclick = async () => {
    const fd = { modificado: nowLocal() };
    m.querySelectorAll('[data-f]').forEach(el => { fd[el.dataset.f] = el.value || ''; });
    try {
      if (editId) { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`empresas/${editId}`, fd); }
      else { const { fsAdd } = await import('./firestore.js'); await fsAdd('empresas', fd); }
      toast(t('save') + ' ✓', '#10b981'); m.remove(); loadData();
    } catch (e) { toast(t('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

window._beuEditEmp = id => openModal(id);
window._beuDelEmp = async id => { if (!confirm(t('confirm') + '?')) return; try { const { fsDel } = await import('./firestore.js'); await fsDel(`empresas/${id}`); _data = _data.filter(d => d.id !== id); applyFilter(); renderRows(); toast(t('delete') + ' ✓', '#f59e0b'); } catch (e) { toast(t('error'), '#ef4444'); } };
