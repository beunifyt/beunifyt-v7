// BeUnifyT v8 — tabs/eventos.js — Eventos
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderEventosTab() {

  const el = document.getElementById('tabContent'); if (!el) return;
  const items = DB.eventos;
  const actId = DB.activeEventId;
  let h = `<div class="sec-hdr"><span class="sec-ttl">📅 Eventos (${items.length})</span><div class="sec-act">${isSA()?'<button class="btn btn-p btn-sm" onclick="openEventoModal()">+ Nuevo evento</button>':''}${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportEventos()">⬇ Excel</button>':''}</div></div>`;
  if (!items.length) h += '<div class="empty"><div class="ei">📅</div><div class="et">Sin eventos</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Evento</th><th>Fechas</th><th>Recinto</th><th>Estado</th><th></th></tr></thead><tbody>';
    items.forEach(ev => { const isAct=ev.id===actId; h += `<tr style="${isAct?'background:var(--gll)':''}"><td><span style="font-weight:700">${ev.ico||'📋'} ${esc(ev.nombre)}</span></td><td style="font-size:11px">${esc(ev.ini||'–')} → ${esc(ev.fin||'–')}</td><td style="font-size:11px">${esc(ev.recinto||'–')}</td><td>${isAct?'<span class="pill pill-g"><span class="live"></span> ACTIVO</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">Inactivo</span>'}</td><td><div style="display:flex;gap:2px"><button class="btn btn-xs" onclick="seleccionarEventoTrabajo('${ev.id}')">${DB.userWorkEventId===ev.id?'✓ En uso':'Trabajar'}</button>${!isAct&&isSA()?`<button class="btn btn-s btn-xs" onclick="activarEvento('${ev.id}')">▶</button>`:''}${isAct&&isSA()?`<button class="btn btn-warning btn-xs" onclick="desactivarEvento()">⏹</button>`:''}${isSA()?`<button class="btn btn-edit btn-xs" onclick="openEventoModal('${ev.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="askDelEvento('${ev.id}')">🗑</button>`:''}</div></td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderEventosTab', renderEventosTab);
window.renderEventosTab = renderEventosTab;
