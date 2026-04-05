// BeUnifyT v8 — tabs/mensajes.js — Mensajes
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderMensajesTab() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const msgs = (DB.mensajesRampa||[]).slice().sort((a,b) => (b.ts||'').localeCompare(a.ts||''));
  const q = (window._msgQ||'').toLowerCase();
  const filtered = q ? msgs.filter(m => `${m.titulo||''} ${m.mensaje||''} ${m.autor||''} ${m.matricula||''}`.toLowerCase().includes(q)) : msgs;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${canEdit()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="window._op.openMsgModal()">+ Mensaje</button>':''}
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'mensajesRampa\')">⬇ Excel</button>':''}
      ${filtered.length?'<button class="btn btn-gh btn-sm" onclick="marcarTodosMsgLeidos()">✓ Leer todos</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarTab(\'mensajesRampa\')">💥 Vaciar</button>':''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar mensaje..." value="${window._msgQ||''}" oninput="window._msgQ=this.value;debounceSearch('msg',renderMensajesTab)"></div>
      <span style="font-size:10px;color:var(--text3)">${filtered.length} msg.</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#e0f2fe;color:#0369a1;border:1.5px solid #7dd3fc;cursor:pointer">Todos</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#fff1f1;color:#dc2626;border:1.5px solid #fecaca;cursor:pointer">Urgente</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#fffbeb;color:#b45309;border:1.5px solid #fde68a;cursor:pointer">Alerta</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#eef2ff;color:#1a56db;border:1.5px solid #bfdbfe;cursor:pointer">Info</span>
    </div>
    ${filtered.length ? filtered.map(m => {const unread=!(m.leido||[]).includes(SID);const tc={urgente:'var(--rll)',alerta:'var(--all)',info:'var(--bll)',ok:'var(--gll)'};return`<div style="padding:10px 14px;border-radius:var(--r2);border:1.5px solid var(--border);background:${tc[m.tipo]||'var(--bg2)'};${unread?'border-left:4px solid var(--blue)':''};margin-bottom:4px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><b style="font-size:12px">${esc(m.titulo||'')}</b>${m.tipo?`<span class="pill pill-${m.tipo==='urgente'?'r':'b'}">${esc(m.tipo)}</span>`:''}<span style="margin-left:auto;font-size:10px;color:var(--text3)">${fmt(m.ts)}</span>${unread?`<button class="btn btn-xs btn-gh" onclick="marcarMsgLeido('${m.id}')">✓</button>`:''}${isSA()?`<button class="btn btn-danger btn-xs" onclick="askDelMsg('${m.id}')">🗑</button>`:''}</div><div style="font-size:12px;color:var(--text2)">${esc(m.mensaje||'')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px">Por: ${esc(m.autor||'–')}</div></div>`;}).join('') : '<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>'}`;
}

registerFn('renderMensajesTab', renderMensajesTab);
window.renderMensajesTab = renderMensajesTab;
