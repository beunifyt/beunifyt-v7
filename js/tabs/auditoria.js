// BeUnifyT v8 — tabs/auditoria.js — Archivos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderAuditoria() {

  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const sub = window._audSub || 'sesiones';
  let subContent = '';
  if (sub === 'sesiones') {
    const items = (DB.auditLog||[]).filter(e => e.entity === 'sesion');
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Estado</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||'–')}</td><td style="font-size:11px">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">🔑</div><div class="et">Sin sesiones</div></div>';
  } else {
    const items = (DB.auditLog||[]).filter(e => e.entity !== 'sesion');
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Acción</th><th>Usuario</th><th>Entidad</th><th>Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px">${esc(e.entity||'–')}</td><td style="font-size:11px">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">📋</div><div class="et">Sin acciones</div></div>';
  }
  const tabBtn = (id, label) => `<button class="btn btn-sm ${sub===id?'btn-p':'btn-gh'}" onclick="window._audSub='${id}';window._op.renderAuditoria()">${label}</button>`;
  el.innerHTML = `<div style="display:flex;gap:4px;margin-bottom:8px">${tabBtn('sesiones','🔑 Sesiones')}${tabBtn('acciones','📋 Acciones')}${isSA()?'<button class="btn btn-gh btn-sm" onclick="exportAuditLog()">⬇ Excel</button>':''}</div>${subContent}`;
}

registerFn('renderAuditoria', renderAuditoria);
window.renderAuditoria = renderAuditoria;
