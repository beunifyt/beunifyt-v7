// BeUnifyT v8 — tabs/recintos.js — Recintos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderRecintos() {

  const el = document.getElementById('tabContent'); if (!el) return;
  const items = [...(DB.recintos||[])];
  let h = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span class="sec-ttl">🏟 Recintos (${items.length})</span><span style="flex:1"></span>${isSA()?'<button class="btn btn-p btn-sm" onclick="openRecintoModal()">+ Nuevo recinto</button>':''}</div>`;
  if (!items.length) h += '<div class="empty"><div class="ei">🏟</div><div class="et">Sin recintos</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Recinto</th><th>Ciudad</th><th>País</th><th>Halls</th><th></th></tr></thead><tbody>';
    items.forEach(r => { h += `<tr><td style="font-weight:700">${esc(r.nombre||'–')}</td><td style="font-size:11px">${esc(r.ciudad||'–')}</td><td style="font-size:11px">${esc(r.pais||'–')}</td><td style="font-size:11px">${esc((r.halls||[]).join(', ')||'–')}</td><td>${isSA()?`<button class="btn btn-edit btn-xs" onclick="openRecintoModal('${r.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="eliminar('${r.id}','recintos')">🗑</button>`:''}</td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderRecintos', renderRecintos);
window.renderRecintos = renderRecintos;
