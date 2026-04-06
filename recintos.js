// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — recintos.js — Gestión de recintos
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, toast, nowLocal } from './utils.js';

let _c, _u, _data = [];

export function render(c, u) { _c = c; _u = u; _data = []; paint(); loadData(); return () => {}; }
function t(k) { return trFree('shell', k) || k; }

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700">🏟 Recintos</span>
        <button id="rec-add" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>
      </div>
      <div id="rec-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>
      <div id="rec-em" style="display:none;text-align:center;padding:40px;color:#94a3b8;font-size:13px">${t('noData')}</div>
    </div>`;
  _c.querySelector('#rec-add').onclick = () => openModal();
  renderCards();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const all = await fsGetAll('recintos');
    const r = _u.recinto || '';
    _data = (_u.rol === 'admin' || _u.rol === 'superadmin') ? all : all.filter(d => d.id === r);
    renderCards();
  } catch (e) { console.warn('recintos load:', e); }
}

function renderCards() {
  const grid = _c.querySelector('#rec-grid'), em = _c.querySelector('#rec-em');
  if (!grid) return;
  if (!_data.length) { grid.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  grid.innerHTML = _data.map(d => `
    <div style="background:${dk ? '#1e293b' : '#fff'};border:1px solid ${dk ? '#334155' : '#e2e8f0'};border-radius:10px;padding:16px">
      <div style="font-size:14px;font-weight:700;margin-bottom:4px">${safeHtml(d.nombre || d.id)}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:8px">${safeHtml(d.ciudad || '—')}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">Halls: ${safeHtml((d.halls || []).join(', ') || '—')}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">Puertas: ${safeHtml((d.puertas || []).join(', ') || '—')}</div>
      <div style="display:flex;gap:6px">
        <button onclick="window._beuEditRec('${d.id}')" style="padding:4px 10px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">${t('edit')}</button>
        <button onclick="window._beuDelRec('${d.id}')" style="padding:4px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">${t('delete')}</button>
      </div>
    </div>`).join('');
}

function openModal(editId = null) {
  const dk = _u.tema === 'dark', r = editId ? _data.find(d => d.id === editId) : {};
  const old = document.getElementById('beu-rec-modal'); if (old) old.remove();
  const m = document.createElement('div'); m.id = 'beu-rec-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${dk ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:420px;width:100%;color:inherit">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">${editId ? t('edit') : t('add')} Recinto</div>
    <div style="display:grid;gap:10px">
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Nombre</label><input data-f="nombre" value="${safeHtml(r.nombre || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Ciudad</label><input data-f="ciudad" value="${safeHtml(r.ciudad || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Halls (separados por coma)</label><input data-f="halls" value="${safeHtml((r.halls || []).join(', '))}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Puertas (separadas por coma)</label><input data-f="puertas" value="${safeHtml((r.puertas || []).join(', '))}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="rcn" style="padding:8px 16px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="rcs" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;
  m.querySelector('#rcn').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#rcs').onclick = async () => {
    const fd = { modificado: nowLocal() };
    m.querySelectorAll('[data-f]').forEach(el => {
      if (el.dataset.f === 'halls' || el.dataset.f === 'puertas') fd[el.dataset.f] = el.value.split(',').map(s => s.trim()).filter(Boolean);
      else fd[el.dataset.f] = el.value || '';
    });
    try {
      if (editId) { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`recintos/${editId}`, fd); }
      else { const { fsAdd } = await import('./firestore.js'); await fsAdd('recintos', fd); }
      toast(t('save') + ' ✓', '#10b981'); m.remove(); loadData();
    } catch (e) { toast(t('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

window._beuEditRec = id => openModal(id);
window._beuDelRec = async id => { if (!confirm(t('confirm') + '?')) return; try { const { fsDel } = await import('./firestore.js'); await fsDel(`recintos/${id}`); _data = _data.filter(d => d.id !== id); renderCards(); toast(t('delete') + ' ✓', '#f59e0b'); } catch (e) { toast(t('error'), '#ef4444'); } };
