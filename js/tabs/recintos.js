// BeUnifyT v8 — tabs/recintos.js — Recintos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderRecintos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = [...(DB.recintos||[])];
  const q = (window._recQ||'').toLowerCase();
  const filtered = q ? items.filter(r => `${r.nombre||''} ${r.ciudad||''} ${r.pais||''}`.toLowerCase().includes(q)) : items;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${isSA()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openRecintoModal()">+ Recinto</button>':''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById(\'xlsRec\')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="window._op.dlTemplateRecintos?.()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'recintos\')">⬇ Excel</button>':''}
      <input type="file" id="xlsRec" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._op.importExcel?.(this,'recintos')">
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Recinto, ciudad, país..." value="${window._recQ||''}" oninput="window._recQ=this.value;debounceSearch('rec',renderRecintos)"></div>
      <span style="font-size:10px;color:var(--text3)">${filtered.length} reg.</span>
    </div>
    ${filtered.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Recinto</th><th>Ciudad</th><th>País</th><th>Halls</th><th>Acc.</th></tr></thead><tbody>
      ${filtered.map(r => `<tr><td style="font-weight:700">${esc(r.nombre||'–')}</td><td style="font-size:11px">${esc(r.ciudad||'–')}</td><td style="font-size:11px">${esc(r.pais||'–')}</td><td style="font-size:11px">${esc((r.halls||[]).join(', ')||'–')}</td><td>${isSA()?`<button class="btn btn-edit btn-xs" onclick="openRecintoModal('${r.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="eliminar('${r.id}','recintos')">🗑</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">🏟</div><div class="et">Sin recintos</div></div>'}`;
}

registerFn('renderRecintos', renderRecintos);
window.renderRecintos = renderRecintos;
