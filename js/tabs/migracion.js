// BeUnifyT v8 — tabs/migracion.js — Migración
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, registrarPasoTracking, registrarPasoTrackingAg, marcarSalidaIng, reactivarIngreso, marcarSalidaIng2, reactivarIngreso2, askDelIng, askDelIng2, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, marcarAgLlegado, marcarTodosMsgLeidos, setDefaultEvento } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderMigracion() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const lastBk = (() => { try { return localStorage.getItem('beu_lastBackup'); } catch(e) { return null; } })();
  const lastBkStr = lastBk ? new Date(lastBk).toLocaleString() : 'Nunca';
  const COLS = [
    {key:'ingresos',label:'Referencia',col:'ingresos'},
    {key:'ingresos2',label:'Ingresos',col:'ingresos2'},
    {key:'movimientos',label:'Embalaje',col:'movimientos'},
    {key:'conductores',label:'Conductores',col:'conductores'},
    {key:'agenda',label:'Agenda',col:'agenda'},
    {key:'mensajesRampa',label:'Mensajes',col:'mensajesRampa'},
    {key:'usuarios',label:'Usuarios',col:'usuarios'},
    {key:'empresas',label:'Empresas',col:'empresas'},
    {key:'recintos',label:'Recintos',col:'recintos'},
    {key:'eventos',label:'Eventos',col:'eventos'},
  ];
  let h = `<div style="max-width:740px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <span class="sec-ttl">📦 Migración y Backups</span>
      <span style="flex:1"></span>
      <button class="btn btn-p btn-sm" onclick="window._op.exportarTodo()">💾 Backup completo</button>
      <button class="btn btn-s btn-sm" onclick="window._op.importarTodo()">📥 Importar todo</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div class="stat-box" style="flex:1;text-align:center"><div class="stat-n" style="color:var(--green)">Auto</div><div class="stat-l">Backup 4h</div><div style="font-size:9px;color:var(--text3);margin-top:2px">Último: ${lastBkStr}</div></div>
      <div class="stat-box" style="flex:1;text-align:center"><div class="stat-n" style="color:var(--blue)">${COLS.reduce((a,c) => a + (DB[c.key]||[]).length, 0)}</div><div class="stat-l">Total registros</div></div>
    </div>
    <div style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Colecciones</div>`;
  COLS.forEach(c => {
    const count = (DB[c.key]||[]).length;
    h += `<div style="border:1px solid var(--border);border-radius:var(--r2);margin-bottom:6px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg3)">
        <span style="font-size:12px;font-weight:700;flex:1">${c.label}</span>
        <span style="font-size:11px;color:var(--text3);background:var(--bg2);padding:1px 8px;border-radius:10px">${count} reg.</span>
        <button class="btn btn-s btn-xs" onclick="if(!canImport()){toast('Sin permiso','var(--red)');return;}document.getElementById('xlsMig_${c.key}')?.click()">📥 Importar</button>
        <button class="btn btn-gh btn-xs" onclick="window._op.dlTemplate_${c.key}?.() || toast('Plantilla pendiente','var(--amber)')">📋 Plantilla</button>
        <button class="btn btn-gh btn-xs" onclick="exportExcel('${c.key}')">⬇ Excel</button>
        <button class="btn btn-xs" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)" onclick="cleanTab('${c.col}')">🗑 Limpiar</button>
        <button class="btn btn-danger btn-xs" onclick="vaciarTab('${c.col}')">💥 Vaciar</button>
        <input type="file" id="xlsMig_${c.key}" accept=".xlsx,.xls,.csv" style="display:none" onchange="importExcel(this,'${c.col}')">
      </div>
    </div>`;
  });
  h += `<div style="margin-top:14px;padding:12px;background:var(--bg3);border-radius:var(--r2);border:1px solid var(--border)">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px">📖 Guía de migración V6 → V8</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.8">
        1. En V6: cada tab → ⬇ Excel → descargar<br>
        2. Aquí: bajar 📋 Plantilla del mismo tab<br>
        3. Copiar datos de V6 al formato plantilla<br>
        4. 📥 Importar por colección<br>
        5. Verificar datos + limpiar duplicados
      </div>
    </div>
  </div>`;
  el.innerHTML = h;
}

registerFn('renderMigracion', renderMigracion);
window.renderMigracion = renderMigracion;
