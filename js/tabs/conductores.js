// BeUnifyT v8 — tabs/conductores.js — Conductores
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderConductores() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const q = (cF.q||'').toLowerCase();
  let items = DB.conductores.filter(c => !q || `${c.nombre||''} ${c.apellido||''} ${c.empresa||''} ${c.matricula||''} ${c.telefono||''} ${c.hall||''}`.toLowerCase().includes(q));
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <span style="flex:1"></span>
      ${canAdd()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openCondModal()">+ Conductor</button>':''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById(\'xlsCond\')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="downloadPlantillaCond()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportConductores()">⬇ Excel</button>':''}
      ${canClean()?'<button class="btn btn-sm" onclick="cleanTab(\'conductores\')">🗑 Limpiar</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarTab(\'conductores\')">💥 Vaciar</button>':''}
      <input type="file" id="xlsCond" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._op.importExcel?.(this,'conductores')">
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Nombre, matrícula, empresa..." value="${cF.q||''}" oninput="cF.q=this.value;debounceSearch('conductores',renderConductores)"></div>
      ${cF.q?'<span class="pill pill-r" onclick="cF.q=\'\';renderConductores()">✕</span>':''}
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>
    ${items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('conductores','matricula','Matrícula')}${thSort('conductores','nombre','Nombre')}${thSort('conductores','empresa','Empresa')}<th>Tel.</th><th>Hall</th><th>Idioma</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(c => {const l=LANGS_UI.find(x=>x.code===(c.idioma||''));return`<tr>
        <td>${c.matricula?`<span class="mchip" onclick="showCondDetalle('${c.id}')">${c.matricula}</span>`:'-'}</td>
        <td><b>${c.nombre||''} ${c.apellido||''}</b></td>
        <td style="font-size:11px">${c.empresa||'–'}</td>
        <td>${telLink(c.telPais||'',c.telefono||'')}</td>
        <td>${hBadge(c.hall)}</td><td style="font-size:14px">${l?l.flag:'–'}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openCondModal(DB.conductores.find(x=>x.id==='${c.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelCond('${c.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">👤</div><div class="et">Sin conductores</div></div>'}`;
}

registerFn('renderConductores', renderConductores);
window.renderConductores = renderConductores;
