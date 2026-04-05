// BeUnifyT v8 — tabs/vehiculos.js — Historial
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderVehiculos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const hist = [...DB.editHistory].sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0, 200);
  const icoMap = {new:'✅',edit:'✏️',salida:'↩',reactivar:'↺',delete:'🗑'};
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'editHistory\')">⬇ Excel</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarHistorial()">💥 Vaciar</button>':''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, usuario..." value="${iF.qHist||''}" oninput="iF.qHist=this.value;debounceSearch('hist',renderVehiculos)"></div>
      <span style="font-size:10px;color:var(--text3)">${hist.length} reg.</span>
    </div>
    ${hist.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>
      ${hist.map(r => `<tr><td style="font-size:11px;color:var(--text3)">${r.pos?'#'+r.pos:''}</td><td><span class="mchip-sm">${esc(r.mat||'–')}</span></td><td style="font-size:11px">${icoMap[r.action]||r.action||''}</td><td style="font-size:11px;font-weight:700">${esc(r.user||'–')}</td><td style="font-size:11px;color:var(--text3);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.detail||'–')}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace">${fmt(r.ts)}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">📜</div><div class="et">Sin historial</div></div>'}`;
}

registerFn('renderVehiculos', renderVehiculos);
window.renderVehiculos = renderVehiculos;
