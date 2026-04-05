// BeUnifyT v8 — tabs/impresion_tab.js — Impresión
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderImpresion() {
  const el = document.getElementById('tabContent'); if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      <button class="btn btn-s btn-sm" onclick="window._op.subirPlantillaImp?.()">📤 Subir plantilla</button>
      <button class="btn btn-gh btn-sm" onclick="window._op.bajarPlantillaImp?.()">📥 Bajar plantilla</button>
      <button class="btn btn-p btn-sm" onclick="window._op.guardarConfigImp?.()">💾 Guardar config</button>
    </div>
    <div id="impresionContainer" style="flex:1;display:flex;flex-direction:column"></div>`;
  import('../modules/impresion.js').then(m => m.initImpresion('impresionContainer')).catch(e => {
    document.getElementById('impresionContainer').innerHTML = '<div class="empty"><div class="ei">🖨</div><div class="et">Error cargando módulo de impresión</div><div class="es">' + e.message + '</div></div>';
  });
}

registerFn('renderImpresion', renderImpresion);
window.renderImpresion = renderImpresion;
