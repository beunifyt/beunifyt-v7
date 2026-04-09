// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — usuarios.js — Gestión de usuarios
// Define tabs, permisos, recinto, idioma, 2FA
// ═══════════════════════════════════════════════════════════

import { trFree, tr } from './langs.js';
import { safeHtml, toast, nowLocal } from './utils.js';

const ALL_TABS = ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','analytics2','analytics3','analytics4','vehiculos','auditoria','recintos','usuarios','eventos','papelera','mensajes','impresion','empresas','migracion'];
const ALL_PERMS = ['canAdd','canEdit','canDel','canExport','canImport','canPrint','canStatus','canSpecial','canCampos'];

let _c, _u, _data = [];

export function render(c, u) { _c = c; _u = u; _data = []; paint(); loadData(); return () => {}; }
function t(k) { return trFree('shell', k) || k; }

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:1000px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700">👥 Usuarios</span>
        <button id="usr-add" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add')}</button>
      </div>
      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:${dk ? '#0f172a' : '#f8fafc'}">
            <th style="padding:8px 12px;text-align:left;font-weight:600">Nombre</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Email</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Rol</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Recinto</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Tabs</th>
            <th style="padding:8px 12px;text-align:center">⚙</th>
          </tr></thead>
          <tbody id="usr-tb"></tbody>
        </table></div>
        <div id="usr-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${t('noData')}</div>
      </div>
    </div>`;
  _c.querySelector('#usr-add').onclick = () => openModal();
  renderRows();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const all = await fsGetAll('users');
    const r = _u.recinto || '';
    _data = (_u.rol === 'admin' || _u.rol === 'superadmin') ? all : all.filter(d => d.recinto === r);
    renderRows();
  } catch (e) { console.warn('usuarios load:', e); }
}

function renderRows() {
  const tb = _c.querySelector('#usr-tb'), em = _c.querySelector('#usr-em');
  if (!tb) return;
  if (!_data.length) { tb.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  tb.innerHTML = _data.map(d => `<tr style="border-top:1px solid ${dk ? '#334155' : '#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.nombre || '—')}</td>
    <td style="padding:8px 12px;font-size:11px">${safeHtml(d.email || '—')}</td>
    <td style="padding:8px 12px"><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${rolColor(d.rol)}">${safeHtml(d.rol || '—')}</span></td>
    <td style="padding:8px 12px;font-size:11px">${safeHtml(d.recinto || '—')}</td>
    <td style="padding:8px 12px;font-size:10px;color:#94a3b8;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(d.tabs || []).join(', ')}</td>
    <td style="padding:8px 12px;text-align:center">
      <button onclick="window._beuEditUsr('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:14px">✏️</button>
    </td></tr>`).join('');
}

function rolColor(r) {
  if (r === 'admin' || r === 'superadmin') return '#dbeafe';
  if (r === 'supervisor') return '#fef3c7';
  return '#f1f5f9';
}

function openModal(editId = null) {
  const dk = _u.tema === 'dark', r = editId ? _data.find(d => d.id === editId) : {};
  const old = document.getElementById('beu-usr-modal'); if (old) old.remove();
  const m = document.createElement('div'); m.id = 'beu-usr-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${dk ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:560px;width:100%;max-height:85vh;overflow-y:auto;color:inherit">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">${editId ? t('edit') : t('add')} Usuario</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Nombre</label><input data-f="nombre" value="${safeHtml(r.nombre || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Email</label><input data-f="email" type="email" value="${safeHtml(r.email || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Rol</label><select data-f="rol" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit">
        ${['operador','supervisor','admin','superadmin','empresa'].map(ro => `<option value="${ro}"${(r.rol || 'operador') === ro ? ' selected' : ''}>${ro}</option>`).join('')}
      </select></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Recinto</label><input data-f="recinto" value="${safeHtml(r.recinto || '')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Idioma</label><input data-f="idioma" value="${safeHtml(r.idioma || 'es')}" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Tema</label><select data-f="tema" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit">
        <option value="light"${(r.tema || 'light') === 'light' ? ' selected' : ''}>Light</option>
        <option value="dark"${r.tema === 'dark' ? ' selected' : ''}>Dark</option>
      </select></div>
    </div>
    <div style="margin-top:12px"><label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:6px">Tabs autorizados</label>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${ALL_TABS.map(tab => `<label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;padding:3px 8px;border-radius:6px;background:${dk ? '#0f172a' : '#f1f5f9'};cursor:pointer"><input type="checkbox" data-tab="${tab}" ${(r.tabs || []).includes(tab) ? 'checked' : ''}>${trFree('tabs',tab)||tab}</label>`).join('')}</div>
    </div>
    <div style="margin-top:12px"><label style="font-size:10px;font-weight:600;color:#64748b;display:block;margin-bottom:6px">Permisos</label>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${ALL_PERMS.map(p => `<label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;padding:3px 8px;border-radius:6px;background:${dk ? '#0f172a' : '#f1f5f9'};cursor:pointer"><input type="checkbox" data-perm="${p}" ${(r.permisos || {})[p] ? 'checked' : ''}>${trFree('permisos',p)||p}</label>`).join('')}</div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="un" style="padding:8px 16px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="us" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">${t('save')}</button>
    </div></div>`;
  m.querySelector('#un').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#us').onclick = async () => {
    const fd = { modificado: nowLocal() };
    m.querySelectorAll('[data-f]').forEach(el => { fd[el.dataset.f] = el.value || ''; });
    fd.tabs = []; m.querySelectorAll('[data-tab]:checked').forEach(el => fd.tabs.push(el.dataset.tab));
    fd.permisos = {}; m.querySelectorAll('[data-perm]').forEach(el => { fd.permisos[el.dataset.perm] = el.checked; });
    try {
      if (editId) { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`users/${editId}`, fd); }
      else { const { fsAdd } = await import('./firestore.js'); await fsAdd('users', fd); }
      toast(t('save') + ' ✓', '#10b981'); m.remove(); loadData();
    } catch (e) { toast(t('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

window._beuEditUsr = id => openModal(id);
