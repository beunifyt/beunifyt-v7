// BeUnifyT v8 — tabs/impresion_tab.js — Impresión
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderImpresion() {

  const el = document.getElementById('tabContent'); if (!el) return;
  el.innerHTML = '<div id="impresionContainer" style="height:100%;display:flex;flex-direction:column"></div>';
  import('../modules/impresion.js').then(m => m.initImpresion('impresionContainer')).catch(e => {
    el.innerHTML = '<div class="empty"><div class="ei">🖨</div><div class="et">Error cargando módulo de impresión</div><div class="es">' + e.message + '</div></div>';
  });
}

registerFn('renderImpresion', renderImpresion);
window.renderImpresion = renderImpresion;
