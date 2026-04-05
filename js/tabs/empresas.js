// BeUnifyT v8 — tabs/empresas.js — Empresas
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderEmpresasTab() {

  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const emps = DB.empresas || [];
  let h = `<div class="sec-hdr"><span class="sec-ttl">🏢 Empresas (${emps.length})</span><div class="sec-act"><button class="btn btn-p btn-sm" onclick="openEmpresaModal()">+ Nueva empresa</button></div></div>`;
  if (!emps.length) h += '<div class="empty"><div class="ei">🏢</div><div class="et">Sin empresas</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>CIF</th><th>Contacto</th><th>Email</th><th></th></tr></thead><tbody>';
    emps.forEach(e => { h += `<tr><td style="font-weight:700">${esc(e.nombre||'–')}</td><td style="font-size:11px">${esc(e.cif||'–')}</td><td style="font-size:11px">${esc(e.contacto||'–')}</td><td style="font-size:11px">${esc(e.email||'–')}</td><td><button class="btn btn-edit btn-xs" onclick="openEmpresaModal('${e.id}')">✏️</button></td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderEmpresasTab', renderEmpresasTab);
window.renderEmpresasTab = renderEmpresasTab;
