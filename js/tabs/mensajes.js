// BeUnifyT v8 — tabs/mensajes.js — Mensajes
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderMensajesTab() {

  const el = document.getElementById('tabContent'); if (!el) return;
  const msgs = DB.mensajesRampa.slice().sort((a,b) => (b.ts||'').localeCompare(a.ts||''));
  let h = `<div class="sec-hdr"><span class="sec-ttl">📢 Mensajes (${msgs.length})</span><div class="sec-act">${canEdit()?'<button class="btn btn-p btn-sm" onclick="window._op.openMsgModal()">+ Mensaje</button>':''}${msgs.length?'<button class="btn btn-gh btn-sm" onclick="marcarTodosMsgLeidos()">✓ Leer todos</button>':''}</div></div>`;
  if (!msgs.length) h += '<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>';
  else {
    msgs.forEach(m => { const unread=!(m.leido||[]).includes(SID); const tc={urgente:'var(--rll)',alerta:'var(--all)',info:'var(--bll)',ok:'var(--gll)'}; h += `<div style="padding:10px 14px;border-radius:var(--r2);border:1.5px solid var(--border);background:${tc[m.tipo]||'var(--bg2)'};${unread?'border-left:4px solid var(--blue)':''};margin-bottom:4px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><b>${esc(m.titulo||'')}</b>${m.tipo?`<span class="pill pill-${m.tipo==='urgente'?'r':'b'}">${esc(m.tipo)}</span>`:''}<span style="margin-left:auto;font-size:10px;color:var(--text3)">${fmt(m.ts)}</span>${unread?`<button class="btn btn-xs btn-gh" onclick="marcarMsgLeido('${m.id}')">✓</button>`:''}${isSA()?`<button class="btn btn-danger btn-xs" onclick="askDelMsg('${m.id}')">🗑</button>`:''}</div><div style="font-size:12px;color:var(--text2)">${esc(m.mensaje||'')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px">Por: ${esc(m.autor||'–')}</div></div>`; });
  }
  el.innerHTML = h;
}

registerFn('renderMensajesTab', renderMensajesTab);
window.renderMensajesTab = renderMensajesTab;
