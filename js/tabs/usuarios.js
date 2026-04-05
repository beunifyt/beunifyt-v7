// BeUnifyT v8 — tabs/usuarios.js — Usuarios
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderUsuarios() {

  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const usub = window._uSub || 'operadores';
  const q = (window._uQ || '').toLowerCase();
  const allU = DB.usuarios || [];
  let listBase = usub === 'empresas' ? allU.filter(u=>u.rol==='empresa') : allU.filter(u=>u.rol!=='empresa');
  if (q) listBase = listBase.filter(u => `${u.nombre||''} ${u.email||''}`.toLowerCase().includes(q));
  const rolMap = {superadmin:'⭐ SA',supervisor:'🔑 Sup',controlador_rampa:'🚦 Ctrl',editor:'✏️ Ed',visor:'👁 Visor',empresa:'🏢 Empresa'};
  let h = `<div style="display:flex;gap:4px;margin-bottom:8px"><button class="btn btn-sm ${usub==='operadores'?'btn-p':'btn-gh'}" onclick="window._uSub='operadores';renderUsuarios()">👤 Operadores</button><button class="btn btn-sm ${usub==='empresas'?'btn-p':'btn-gh'}" onclick="window._uSub='empresas';renderUsuarios()">🏢 Empresas</button></div>`;
  h += `<div style="display:flex;gap:6px;margin-bottom:8px"><div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar..." value="${esc(q)}" oninput="window._uQ=this.value;debounceSearch('usr',renderUsuarios)"></div><span style="font-size:11px;color:var(--text3)">${listBase.length} usuarios</span>${isSA()?'<button class="btn btn-p btn-sm" onclick="openUserModal()">+ Nuevo</button>':''}</div>`;
  if (!listBase.length) h += '<div class="empty"><div class="ei">👥</div><div class="et">Sin usuarios</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Rol</th><th>Idioma</th><th></th></tr></thead><tbody>';
    listBase.forEach(u => { h += `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td><span class="pill pill-b">${rolMap[u.rol]||u.rol}</span></td><td>${u.lang||'🌍'}</td><td>${isSA()?`<button class="btn btn-edit btn-xs" onclick="openUserModal('${u.id}')">✏️</button>`:''}</td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderUsuarios', renderUsuarios);
window.renderUsuarios = renderUsuarios;
