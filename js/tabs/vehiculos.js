// BeUnifyT v8 — tabs/vehiculos.js — Historial
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderVehiculos() {

  const el = document.getElementById('tabContent'); if (!el) return;
  const hist = [...DB.editHistory].sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0, 200);
  const icoMap = {new:'✅',edit:'✏️',salida:'↩',reactivar:'↺',delete:'🗑'};
  let h = `<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px"><span class="sec-ttl">📜 Historial de Modificaciones</span><span style="font-size:11px;color:var(--text3)">${hist.length} reg.</span><span style="flex:1"></span>${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarHistorial()">💥 Vaciar</button>':''}</div>`;
  if (!hist.length) h += '<div class="empty"><div class="ei">📜</div><div class="et">Sin historial</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>';
    hist.forEach(r => { h += `<tr><td style="font-size:11px;color:var(--text3)">${r.pos?'#'+r.pos:''}</td><td><span class="mchip-sm">${esc(r.mat||'–')}</span></td><td style="font-size:11px">${icoMap[r.action]||r.action||'•'}</td><td style="font-size:11px;font-weight:700">${esc(r.user||'–')}</td><td style="font-size:11px;color:var(--text3);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.detail||'–')}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap">${fmt(r.ts)}</td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderVehiculos', renderVehiculos);
window.renderVehiculos = renderVehiculos;
