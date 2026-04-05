// BeUnifyT v8 — tabs/auditoria.js — Archivos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderAuditoria() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const sub = window._audSub || 'sesiones';
  const q = (window._audQ || '').toLowerCase();
  let items;
  if (sub === 'sesiones') items = (DB.auditLog||[]).filter(e => e.entity === 'sesion');
  else if (sub === 'acciones') items = (DB.auditLog||[]).filter(e => e.entity !== 'sesion');
  else items = DB.exportLog || [];
  if (q) items = items.filter(e => JSON.stringify(e).toLowerCase().includes(q));
  const tabBtn = (id, label) => `<button class="btn btn-sm ${sub===id?'btn-p':'btn-gh'}" onclick="window._audSub='${id}';window._op.renderAuditoria()">${label}</button>`;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      ${tabBtn('sesiones','🔑 Sesiones')}${tabBtn('acciones','📋 Acciones')}${tabBtn('exportaciones','📥 Exports')}
      <span style="flex:1"></span>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportAuditLog()">⬇ Excel</button>':''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar..." value="${window._audQ||''}" oninput="window._audQ=this.value;debounceSearch('aud',window._op.renderAuditoria)"></div>
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>
    ${items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Acción</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>
      ${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||e.entity||'–')}</td><td style="font-size:11px">${e.ts||'–'}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">📋</div><div class="et">Sin registros</div></div>'}`;
}

registerFn('renderAuditoria', renderAuditoria);
window.renderAuditoria = renderAuditoria;
