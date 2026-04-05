// BeUnifyT v8 — tabs/migracion.js — Migración
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderMigracion() {

  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const lastBk = (() => { try { return localStorage.getItem('beu_lastBackup'); } catch(e) { return null; } })();
  const lastBkStr = lastBk ? new Date(lastBk).toLocaleString() : 'Nunca';
  const COLS = [{key:'ingresos',label:'Referencia'},{key:'ingresos2',label:'Ingresos'},{key:'conductores',label:'Conductores'},{key:'agenda',label:'Agenda'},{key:'movimientos',label:'Embalaje'},{key:'mensajesRampa',label:'Mensajes'},{key:'usuarios',label:'Usuarios'},{key:'empresas',label:'Empresas'}];
  el.innerHTML = `<div style="max-width:700px">
    <div class="sec-hdr"><span class="sec-ttl">📦 Migración y Backups</span></div>
    <div style="background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r2);padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div><div style="font-weight:700">💾 Auto-backup activo</div><div style="font-size:11px;color:var(--text3)">Último: ${lastBkStr}</div></div>
      <span style="flex:1"></span>
      <button class="btn btn-gh btn-sm" onclick="window._op.exportarTodo()">⬇ Backup manual</button>
    </div>
    <div style="font-weight:700;margin-bottom:8px">📊 Estado de datos:</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px">${COLS.map(c=>`<span class="pill pill-b">${c.label}: ${(DB[c.key]||[]).length}</span>`).join('')}</div>
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r2);padding:14px">
      <div style="font-weight:700;margin-bottom:8px">📖 Importar datos</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Usa los botones "📥 Importar" de cada pestaña individual para importar datos Excel.</div>
    </div>
  </div>`;
}

registerFn('renderMigracion', renderMigracion);
window.renderMigracion = renderMigracion;
