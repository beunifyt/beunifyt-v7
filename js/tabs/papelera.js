// BeUnifyT v8 — tabs/papelera.js — Papelera
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderPapelera() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = [...DB.papelera].sort((a,b)=>(b.ts||b._delTs||'').localeCompare(a.ts||a._delTs||''));
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'papelera\')">⬇ Excel</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarPapelera()">💥 Vaciar papelera</button>':''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${iF.qPap||''}" oninput="iF.qPap=this.value;debounceSearch('pap',renderPapelera)"></div>
      <span style="font-size:10px;color:var(--text3)">${items.length} elem.</span>
    </div>
    ${items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Origen</th><th>Matrícula</th><th>Empresa</th><th>Borrado por</th><th>Fecha</th><th></th></tr></thead><tbody>
      ${items.map(p => {const item=p.item||p;return`<tr><td><span class="pill pill-a">${esc(p.origen||p._from||'–')}</span></td><td><span class="mchip-sm">${esc(item.matricula||'–')}</span></td><td style="font-size:11px">${esc(item.empresa||'–')}</td><td style="font-size:11px">${esc(p.borradoPor||p._delBy||'–')}</td><td style="font-size:11px">${fmt(p.ts||p._delTs)}</td><td><button class="btn btn-s btn-xs" onclick="restaurar('${p.id}')">↩</button></td></tr>`;}).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">🗑</div><div class="et">Papelera vacía</div></div>'}`;
}

registerFn('renderPapelera', renderPapelera);
window.renderPapelera = renderPapelera;
