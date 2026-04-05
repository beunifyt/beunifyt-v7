// BeUnifyT v8 — tabs/eventos.js — Eventos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderEventosTab() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = DB.eventos || [];
  const actId = DB.activeEventId;
  const q = (window._evQ||'').toLowerCase();
  const filtered = q ? items.filter(e => `${e.nombre||''} ${e.recinto||''} ${e.ciudad||''}`.toLowerCase().includes(q)) : items;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${isSA()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openEventoModal()">+ Evento</button>':''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById(\'xlsEv\')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="window._op.dlTemplateEventos?.()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportEventos()">⬇ Excel</button>':''}
      <input type="file" id="xlsEv" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._op.importExcel?.(this,'eventos')">
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar evento..." value="${window._evQ||''}" oninput="window._evQ=this.value;debounceSearch('ev',renderEventosTab)"></div>
      <span style="font-size:10px;color:var(--text3)">${filtered.length} eventos</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#e0f2fe;color:#0369a1;border:1.5px solid #7dd3fc;cursor:pointer">Todos</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#ecfdf5;color:#059669;border:1.5px solid #bbf7d0;cursor:pointer">Activos</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#dbeafe;color:#1e40af;border:1.5px solid #93c5fd;cursor:pointer">Inactivos</span>
    </div>
    ${filtered.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Evento</th><th>Fechas</th><th>Recinto</th><th>Estado</th><th>Acc.</th></tr></thead><tbody>
      ${filtered.map(ev => {const isAct=ev.id===actId;return`<tr style="${isAct?'background:var(--gll)':''}"><td style="font-weight:700">${ev.ico||'📋'} ${esc(ev.nombre)}</td><td style="font-size:11px">${esc(ev.ini||'–')} → ${esc(ev.fin||'–')}</td><td style="font-size:11px">${esc(ev.recinto||'–')}</td><td>${isAct?'<span class="pill pill-g"><span class="live"></span> ACTIVO</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">Inactivo</span>'}</td><td><div style="display:flex;gap:2px"><button class="btn btn-xs" onclick="seleccionarEventoTrabajo('${ev.id}')">${DB.userWorkEventId===ev.id?'✓ En uso':'Trabajar'}</button>${!isAct&&isSA()?`<button class="btn btn-s btn-xs" onclick="activarEvento('${ev.id}')">▶</button>`:''}${isAct&&isSA()?`<button class="btn btn-warning btn-xs" onclick="desactivarEvento()">⏹</button>`:''}${isSA()?`<button class="btn btn-edit btn-xs" onclick="openEventoModal('${ev.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="askDelEvento('${ev.id}')">🗑</button>`:''}</div></td></tr>`;}).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">📅</div><div class="et">Sin eventos</div></div>'}`;
}

registerFn('renderEventosTab', renderEventosTab);
window.renderEventosTab = renderEventosTab;
