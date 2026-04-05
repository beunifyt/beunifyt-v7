// BeUnifyT v8 — tabs/usuarios.js — Usuarios
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, vaciarTab, vaciarHistorial, vaciarPapelera, restaurar, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, marcarTodosMsgLeidos, registrarPasoTrackingAg, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, activarEvento, desactivarEvento, seleccionarEventoTrabajo } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderUsuarios() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const usub = window._uSub || 'operadores';
  const q = (window._uQ||'').toLowerCase();
  const allU = DB.usuarios || [];
  let listBase = usub === 'empresas' ? allU.filter(u=>u.rol==='empresa') : allU.filter(u=>u.rol!=='empresa');
  if (q) listBase = listBase.filter(u => `${u.nombre||''} ${u.email||''}`.toLowerCase().includes(q));
  const rolMap = {superadmin:'⭐ SA',supervisor:'🔑 Sup',controlador_rampa:'🚦 Ctrl',editor:'✏️ Ed',visor:'👁 Visor',empresa:'🏢 Empresa'};
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <span style="flex:1"></span>
      ${isSA()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openUserModal()">+ Usuario</button>':''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById(\'xlsUsr\')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="window._op.dlTemplateUsuarios?.()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'usuarios\')">⬇ Excel</button>':''}
      <input type="file" id="xlsUsr" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._op.importExcel?.(this,'usuarios')">
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Nombre, email..." value="${window._uQ||''}" oninput="window._uQ=this.value;debounceSearch('usr',renderUsuarios)"></div>
      <span style="font-size:10px;color:var(--text3)">${listBase.length} reg.</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${usub==='operadores'?'#3b82f6':'#dbeafe'};color:${usub==='operadores'?'#fff':'#1e40af'};border:1.5px solid #93c5fd;cursor:pointer" onclick="window._uSub='operadores';renderUsuarios()">Operadores</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${usub==='empresas'?'#059669':'#ecfdf5'};color:${usub==='empresas'?'#fff':'#059669'};border:1.5px solid #bbf7d0;cursor:pointer" onclick="window._uSub='empresas';renderUsuarios()">Empresas</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#dbeafe;color:#1e40af;border:1.5px solid #93c5fd;cursor:pointer">SA</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:#dbeafe;color:#1e40af;border:1.5px solid #93c5fd;cursor:pointer">Sup</span>
    </div>
    ${listBase.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Rol</th><th>Idioma</th><th>Acc.</th></tr></thead><tbody>
      ${listBase.map(u => `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td><span class="pill pill-b">${rolMap[u.rol]||u.rol}</span></td><td>${u.lang||'🌍'}</td><td>${isSA()?`<button class="btn btn-edit btn-xs" onclick="openUserModal('${u.id}')">✏️</button>`:''}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">👥</div><div class="et">Sin usuarios</div></div>'}`;
}

registerFn('renderUsuarios', renderUsuarios);
window.renderUsuarios = renderUsuarios;
