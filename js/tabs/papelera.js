// BeUnifyT v8 — tabs/papelera.js — Papelera
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderPapelera() {

  const el = document.getElementById('tabContent'); if (!el) return;
  const items = [...DB.papelera].sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
  let h = `<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px"><span class="sec-ttl">🗑 Papelera (${items.length})</span><span style="flex:1"></span>${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarPapelera()">🗑 Vaciar</button>':''}</div>`;
  if (!items.length) h += '<div class="empty"><div class="ei">🗑</div><div class="et">Papelera vacía</div></div>';
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Origen</th><th>Matrícula</th><th>Empresa</th><th>Borrado por</th><th>Fecha</th><th></th></tr></thead><tbody>';
    items.forEach(p => { const item=p.item||{}; h += `<tr><td><span class="pill pill-a">${esc(p.origen||p._from||'–')}</span></td><td><span class="mchip-sm">${esc(item.matricula||'–')}</span></td><td style="font-size:11px">${esc(item.empresa||'–')}</td><td style="font-size:11px">${esc(p.borradoPor||p._delBy||'–')}</td><td style="font-size:11px">${fmt(p.ts||p._delTs)}</td><td><button class="btn btn-s btn-xs" onclick="restaurar('${p.id}')">↩ Restaurar</button></td></tr>`; });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

registerFn('renderPapelera', renderPapelera);
window.renderPapelera = renderPapelera;
