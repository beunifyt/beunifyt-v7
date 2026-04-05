// BeUnifyT v8 — tabs/empresas.js — Empresas
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar, registrarPasoTracking, registrarPasoTrackingAg, marcarSalidaIng, reactivarIngreso, marcarSalidaIng2, reactivarIngreso2, askDelIng, askDelIng2, askDelAg, askDelCond, askDelMov, askDelMsg, askDelEvento, marcarAgLlegado, marcarTodosMsgLeidos, setDefaultEvento } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderEmpresasTab() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const emps = DB.empresas || [];
  const q = (window._empSearch || '').toLowerCase();
  const filtered = emps.filter(e => !q || `${e.nombre||''} ${e.cif||''} ${e.email||''} ${e.contacto||''}`.toLowerCase().includes(q));
  const sub = window._empSub || 'todas';
  const list = sub === 'verificadas' ? filtered.filter(e => e.nivel === 'verified') : sub === 'pendientes' ? filtered.filter(e => e.nivel !== 'verified') : filtered;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <span style="flex:1"></span>
      ${canAdd()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openEmpresaModal()">+ Empresa</button>':''}
      <button class="btn btn-s btn-sm" onclick="if(!canImport()){toast(\'Sin permiso\',\'var(--red)\');return;}document.getElementById(\'xlsxEmp\')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="dlTemplateEmpresas()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportExcel(\'empresas\')">⬇ Excel</button>':''}
      ${canClean()?'<button class="btn btn-sm" onclick="cleanTab(\'empresas\')">🗑 Limpiar</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarTab(\'empresas\')">💥 Vaciar</button>':''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Empresa, CIF, contacto..." value="${window._empSearch||''}" oninput="window._empSearch=this.value;debounceSearch('empresas',renderEmpresasTab)"></div>
      <input type="date" value="" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px">
      <span style="font-size:10px;color:var(--text3)">${list.length} reg.</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${sub==='todas'?'#7dd3fc':'#93c5fd'};background:${sub==='todas'?'#e0f2fe':'#dbeafe'};color:${sub==='todas'?'#0369a1':'#1e40af'};cursor:pointer" onclick="window._empSub='todas';renderEmpresasTab()">Todas</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${sub==='verificadas'?'#059669':'#ecfdf5'};color:${sub==='verificadas'?'#fff':'#059669'};border:1.5px solid #bbf7d0;cursor:pointer" onclick="window._empSub='verificadas';renderEmpresasTab()">Verificadas</span>
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${sub==='pendientes'?'#d97706':'#fffbeb'};color:${sub==='pendientes'?'#fff':'#d97706'};border:1.5px solid #fde68a;cursor:pointer" onclick="window._empSub='pendientes';renderEmpresasTab()">Pendientes</span>
    </div>
    ${list.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>CIF/VAT</th><th>Contacto</th><th>Email</th><th>Estado</th><th>Acc.</th></tr></thead><tbody>
      ${list.map(e => `<tr>
        <td style="font-weight:700">${esc(e.nombre||'–')}</td>
        <td style="font-size:11px">${esc(e.cif||'–')}</td>
        <td style="font-size:11px">${esc(e.contacto||'–')}</td>
        <td style="font-size:11px">${esc(e.email||'–')}</td>
        <td>${e.nivel==='verified'?'<span class="pill pill-g">Verificada</span>':e.nivel==='blocked'?'<span class="pill pill-r">Bloqueada</span>':'<span class="pill pill-a">Pendiente</span>'}</td>
        <td><div style="display:flex;gap:2px">
          <button class="btn btn-xs" style="background:var(--bll);color:var(--blue);border:1px solid #bfdbfe" onclick="window._op.verPortalEmpresa&&window._op.verPortalEmpresa('${e.id}')" title="Ver portal como esta empresa"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ver portal</button>
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openEmpresaModal('${e.id}')">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="eliminar('${e.id}','empresas')">🗑</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">🏢</div><div class="et">Sin empresas</div></div>'}`;
}

registerFn('renderEmpresasTab', renderEmpresasTab);
window.renderEmpresasTab = renderEmpresasTab;
