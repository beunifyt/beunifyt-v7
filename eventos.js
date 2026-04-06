// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — eventos.js — Gestión de eventos
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
        <span style="font-size:15px;font-weight:700">📅 Eventos</span>
        <button id="ev-add" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>
      </div>
      <div id="ev-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>
      <div id="ev-em" style="display:none;text-align:center;padding:40px;color:#94a3b8;font-size:13px">${t('noData')}</div>
    </div>`;
  _c.querySelector('#ev-add').onclick = () => openModal();
  renderCards();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const all = await fsGetAll('eventos');
    const r = _u.recinto || '';
    _data = r && _u.rol !== 'admin' && _u.rol !== 'superadmin' ? all.filter(d => d.recinto === r) : all;
    renderCards();
  } catch (e) { console.warn('eventos load:', e); }
}

function renderCards() {
  const grid = _c.querySelector('#ev-grid'), em = _c.querySelector('#ev-em');
  if (!grid) return;
  if (!_data.length) { grid.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  grid.innerHTML = _data.map(d => {
    const activo = d.activo !== false;
    return `<div style="background:${dk ? '#1e293b' : '#fff'};border:1px solid ${activo ? '#10b981' : (dk ? '#334155' : '#e2e8f0')};border-radius:10px;padding:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:14px;font-weight:700">${safeHtml(d.nombre || d.id)}</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:10px;font-weight:700;${activo ? 'background:#dcfce7;color:#166534' : 'background:#fecaca;color:#7f1d1d'}">${activo ? 'Activo' : 'Inactivo'}</span>
      </div>
      <div style="font-size:11px;color:#64748b;margin-bottom:4px">Recinto: ${safeHtml(d.recinto || '—')}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${safeHtml(d.fechaInicio || '—')} → ${safeHtml(d.fechaFin || '—')}</div>
      <div style="display:flex;gap:6px">
        <button onclick="window._beuEditEv('${d.id}')" style="padding:4px 10px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">${t('edit')}</button>
        <button onclick="window._beuToggleEv('${d.id}')" style="padding:4px 10px;background:${activo ? '#f59e0b' : '#10b981'};color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">${activo ? 'Desactivar' : 'Activar'}</button>
      </div>
    </div>`;
  }).join('');
}

function openModal(editId = null) {
  const dk = _u.tema === 'dark', r = editId ? _data.find(d => d.id === editId) : {};
  const old = document.getElementById('beu-ev-modal'); if (old) old.remove();
  const m = document.createElement('div'); m.id = 'beu-ev-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${dk ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:420px;width:100%;color:inherit">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">${editId ? t('edit') : t('add')} Evento</div>
    <div style="display:grid;gap:10px">
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Nombre</label><input data-f="nombre" value="${safeHtml(r.nombre || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Recinto</label><input data-f="recinto" value="${safeHtml(r.recinto || _u.recinto || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div><label style="font-size:10px;font-weight:600;color:#64748b">Inicio</label><input data-f="fechaInicio" type="date" value="${safeHtml(r.fechaInicio || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
        <div><label style="font-size:10px;font-weight:600;color:#64748b">Fin</label><input data-f="fechaFin" type="date" value="${safeHtml(r.fechaFin || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="evn" style="padding:8px 16px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="evs" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;
  m.querySelector('#evn').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#evs').onclick = async () => {
    const fd = { modificado: nowLocal(), activo: true };
    m.querySelectorAll('[data-f]').forEach(el => { fd[el.dataset.f] = el.value || ''; });
    try {
      if (editId) { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`eventos/${editId}`, fd); }
      else { const { fsAdd } = await import('./firestore.js'); await fsAdd('eventos', fd); }
      toast(t('save') + ' ✓', '#10b981'); m.remove(); loadData();
    } catch (e) { toast(t('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

window._beuEditEv = id => openModal(id);
window._beuToggleEv = async id => {
  const item = _data.find(d => d.id === id); if (!item) return;
  try { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`eventos/${id}`, { activo: !item.activo }); item.activo = !item.activo; renderCards(); toast('✓', '#10b981'); } catch (e) { toast(t('error'), '#ef4444'); }
};
