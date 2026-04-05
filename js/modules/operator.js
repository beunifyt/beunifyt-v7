// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js (NUEVO — entry point modular)
// Importa todos los módulos core y tabs, registra window._op y aliases.
// ═══════════════════════════════════════════════════════════════════════
import { AppState } from '../state.js';
import { toast, uid, safeHtml, formatDate, nowLocal, normPlate, clone } from '../utils.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canClean, canExport, canImport, canPrint, canStatus, canSpecial, canCampos, canMensajes, logout } from '../auth.js';
import { fsGet, fsSet, fsUpdate, fsAdd, fsDel, fsGetAll, fsListen, fsBatch } from '../firestore.js';

// ─── CORE MODULES ───────────────────────────────────────────────────
import { DB, iF, SID, curTab, setCurTab, _unsubs, registerFn, callFn, getFn, getAllFns, _autoFillOn, _posAutoOn, setAutoFill, setPosAuto, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, cBadge, sAgBadge, sortArr, getSort, setSort, thSort, telLink, getRecintoHalls, getActiveEvent, getTabEvent, debounceSearch, _modal, gv, askDel, checkBL, logAudit, logExport, _getCU, autoMsg, tr, HALLS, SCFG, CCFG, TV, PP, TRACKING_STEPS, PRINT_DEF, PRINT_LABELS, PAISES } from '../core/shared.js';
import { _loadData, _seedIfEmpty, _subscribeRealtime, saveDB, saveDBNow, saveIngreso, registrarSalida, reactivar, eliminar, restaurar, vaciarPapelera, vaciarHistorial, vaciarTab, resetAllData, softDelete, _saveOne, _deleteOne, _getCol, _nextPos, importExcel, exportExcel, exportAuditLog, seleccionarEventoTrabajo, activarEvento, desactivarEvento, registrarPasoTracking, registrarPasoTrackingAg, marcarSalidaIng, reactivarIngreso, marcarSalidaIng2, reactivarIngreso2, marcarAgLlegado, marcarAgSalida, marcarTodosMsgLeidos, cambiarEstMov, marcarMsgLeido, askDelIng, askDelIng2, askDelAg, askDelCond, askDelMov, askDelMsg, askDelLN, askDelEE, askDelEvento, setDefaultEvento, restoreEventoVersion, restoreEventoDeleted } from '../core/db.js';
import { _renderShell, cacheEL, goTab, renderHdr, _applyTheme, cycleTheme, toggleThemeMenu, selectTheme, openLangPicker, setLang, tabDragStart, tabDragOver, tabDrop, tabDragEnd, _bindGlobalKeyboard, handleLogout, DEFAULT_TABS } from '../core/shell.js';
import { renderCamposSubtab, cycleCampo, saveCamposCfg, resetCamposCfg, addCustomCampo } from '../core/fields.js';

// ─── TAB MODULES ────────────────────────────────────────────────────
import { renderDash } from '../tabs/dash.js';
import { renderIngresos } from '../tabs/ingresos.js';
import { renderIngresos2 } from '../tabs/ingresos2.js';
import { renderFlota } from '../tabs/flota.js';
import { renderConductores } from '../tabs/conductores.js';
import { renderAgenda } from '../tabs/agenda.js';
import { renderAnalytics } from '../tabs/analytics.js';
import { renderVehiculos } from '../tabs/vehiculos.js';
import { renderAuditoria } from '../tabs/auditoria.js';
import { renderPapelera } from '../tabs/papelera.js';
import { renderImpresion } from '../tabs/impresion_tab.js';
import { renderRecintos } from '../tabs/recintos.js';
import { renderEventosTab } from '../tabs/eventos.js';
import { renderMensajesTab } from '../tabs/mensajes.js';
import { renderUsuarios } from '../tabs/usuarios.js';
import { renderEmpresasTab } from '../tabs/empresas.js';
import { renderMigracion } from '../tabs/migracion.js';

// ─── REGISTER RENDER FUNCTIONS ──────────────────────────────────────
// These are already registered by each module's registerFn() call,
// but we register aliases and missing ones here:
registerFn('renderMensajes', renderMensajesTab);
registerFn('renderImpresion', renderImpresion);
registerFn('askDel', askDel);

// ─── TOGGLE HELPERS ─────────────────────────────────────────────────
function toggleAutoFill() {
  setAutoFill(!_autoFillOn);
  try { localStorage.setItem('beu_af', _autoFillOn?'1':'0'); } catch(e) {}
  renderIngresos();
  toast((_autoFillOn ? '⚡ Autorrelleno ON' : 'Autorrelleno OFF'), 'var(--blue)');
}

function togglePosAuto() {
  setPosAuto(!_posAutoOn);
  try { localStorage.setItem('beu_pa', _posAutoOn?'1':'0'); } catch(e) {}
  renderIngresos();
  toast((_posAutoOn ? '🔢 Posición AUTO ON' : 'Posición manual'), 'var(--blue)');
}

// ─── MODAL FUNCTIONS (shared across tabs) ───────────────────────────
function openIngModal(i, col) {
  col = col || window._ingSource || 'ingresos';
  // Delegate to the existing modal code
  // TODO: migrate full modal logic
  toast('Modal ingreso — migración pendiente', 'var(--amber)');
}
function openIngModal2(i) { window._ingSource = 'ingresos2'; openIngModal(i); }
function openFlotaModal(id) { toast('Modal flota — migración pendiente', 'var(--amber)'); }
function openCondModal(id) { toast('Modal conductor — migración pendiente', 'var(--amber)'); }
function openAgendaModal(id) { toast('Modal agenda — migración pendiente', 'var(--amber)'); }
function openEventoModal(id) { toast('Modal evento — migración pendiente', 'var(--amber)'); }
function openRecintoModal(id) { toast('Modal recinto — migración pendiente', 'var(--amber)'); }
function openUserModal(id) { toast('Modal usuario — migración pendiente', 'var(--amber)'); }
function openMovModal(m) { toast('Modal movimiento — migración pendiente', 'var(--amber)'); }
function openMsgModal() {
  import('../core/shared.js').then(({ _modal, gv }) => {
    _modal('Nuevo mensaje de rampa', `
      <div class="fg"><label class="flbl">Título <span class="freq">*</span></label><input id="msgTtl" placeholder="Mensaje urgente..."></div>
      <div class="fg"><label class="flbl">Tipo</label><select id="msgTipo"><option value="info">ℹ️ Info</option><option value="alerta">⚠️ Alerta</option><option value="urgente">🚨 Urgente</option><option value="ok">✅ OK</option></select></div>
      <div class="fg"><label class="flbl">Mensaje</label><textarea id="msgBody" rows="3"></textarea></div>
    `, async () => {
      const ttl = gv('msgTtl'); if (!ttl) { toast('Título obligatorio','var(--red)'); return; }
      const msg = { id:uid(), ts:nowLocal(), autor:(AppState.get('currentUser')?.nombre||'?'), tipo:gv('msgTipo'), titulo:ttl, mensaje:gv('msgBody'), leido:[SID], pausado:false };
      DB.mensajesRampa.unshift(msg);
      await import('../core/db.js').then(db => db._saveOne('mensajesRampa', msg));
      callFn('renderHdr');
      callFn('renderMensajesTab');
      toast('📢 Mensaje enviado','var(--blue)');
    });
  });
}
function showIngDetalle(id, source) { toast('Detalle ingreso — migración pendiente', 'var(--amber)'); }
function showAgDetalle(id) { toast('Detalle agenda — migración pendiente', 'var(--amber)'); }
function showCondDetalle(id) { toast('Detalle conductor — migración pendiente', 'var(--amber)'); }

// ─── EXPORT FUNCTIONS ───────────────────────────────────────────────
function _xlsxWrite(data, sheetName, filename) {
  const XLSX = window.XLSX;
  if (!XLSX) { toast('XLSX no disponible','var(--red)'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  toast('📋 Plantilla descargada', 'var(--blue)');
}
function exportIngresos() { exportExcel('ingresos'); }
function exportIngresos2() { exportExcel('ingresos2'); }
function exportFlota() { exportExcel('movimientos'); }
function exportConductores() { exportExcel('conductores'); }
function exportAgenda() { exportExcel('agenda'); }
function exportListaNegra() { exportExcel('listaNegra'); }
function exportMensajes() { exportExcel('mensajesRampa'); }
function exportEventos() { exportExcel('eventos'); }
function dlTemplateIng() { _xlsxWrite([['Matricula','Llamador','Referencia','Nombre','Apellido','Empresa','Hall','Stand','Remolque','Telefono','Comentario','Pos']],'Referencia','plantilla_referencia.xlsx'); }
function dlTemplateIng2() { _xlsxWrite([['Matricula','Nombre','Apellido','Empresa','Hall','Stand','Remolque','Telefono','Comentario','Pos']],'Ingresos','plantilla_ingresos.xlsx'); }
function dlTemplateAg() { _xlsxWrite([['Matricula','Fecha','HoraPlan','Conductor','Empresa','Hall','Stand','Telefono','Notas']],'Agenda','plantilla_agenda.xlsx'); }
function dlTemplateFlota() { _xlsxWrite([['Matricula','Remolque','Empresa','Hall','TipoCarga','Status','Posicion']],'Embalaje','plantilla_embalaje.xlsx'); }
function downloadPlantillaCond() { _xlsxWrite([['Nombre','Apellido','Empresa','Matricula','Telefono','Hall']],'Conductores','plantilla_conductores.xlsx'); }

// ─── PRINT (delegate to impresion module) ───────────────────────────
function printIngreso(id) {
  if (window._imp && window._imp.printIngreso) window._imp.printIngreso(id);
  else toast('🖨 Módulo impresión no cargado', 'var(--amber)');
}
function printIngreso2(id) { printIngreso(id); }
function printTrqRef(id) { printIngreso(id); }
function printTrqIng(id) { printIngreso(id); }
function printAgendaItem(a) { printIngreso(a?.id); }

// ─── HISTORIAL RENDERER ────────────────────────────────────────────
function _ingHistorial(collection) {
  const hist = (DB.editHistory||[]).filter(h => !collection || (h.collection === collection || !h.collection));
  const clearBtn = isSA() ? `<button class="btn btn-danger btn-sm" onclick="vaciarHistorial('${collection}')">💥 Vaciar</button>` : '';
  if (!hist.length) return `<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px">${clearBtn}</div><div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">Sin modificaciones registradas</div>`;
  const icoMap = {new:'✅ Nuevo',edit:'✏️ Editado',salida:'↩ Salida',reactivar:'↺ Reactivado'};
  return `<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px"><span style="font-size:11px;color:var(--text3)">${hist.length} registros</span>${clearBtn}</div>
  <div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Hora</th></tr></thead><tbody>
    ${hist.map(h=>`<tr><td style="font-weight:800;color:var(--text3);font-size:11px">${h.pos?'#'+h.pos:''}</td><td><span class="mchip-sm">${h.mat||'–'}</span></td><td style="font-size:11px">${icoMap[h.action]||h.action||''}</td><td style="font-size:11px;color:var(--text3)">${h.user||'–'}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace">${fmt(h.ts)}</td></tr>`).join('')}
  </tbody></table></div>`;
}
registerFn('_ingHistorial', _ingHistorial);

function renderMensajesInline() { renderMensajesTab(); }

// ─── V6 COMPAT ──────────────────────────────────────────────────────
function onRolChange(rol) {
  const tabs = DEFAULT_TABS[rol] || DEFAULT_TABS.visor || [];
  document.querySelectorAll('.uTabChk').forEach(chk => { chk.checked = tabs.includes(chk.value); });
}

// ─── BACKUP ─────────────────────────────────────────────────────────
function exportarTodo() {
  if (typeof XLSX === 'undefined') { toast('Cargando XLSX...','var(--amber)'); return; }
  const cols = ['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','usuarios','empresas'];
  const wb = XLSX.utils.book_new();
  cols.forEach(c => { const d = DB[c]||[]; if (d.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d), c.slice(0,31)); });
  XLSX.writeFile(wb, `beunifyt_backup_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('💾 Backup descargado', 'var(--green)');
}

function importarTodo() { toast('Usar tab Migración para importar', 'var(--amber)'); }
function _sendBackupEmail() { toast('Función email pendiente', 'var(--amber)'); }
function _toggleAutoEmail() { toast('Auto-email pendiente', 'var(--amber)'); }

// ─── ENTRY POINT ────────────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  if (!user) { import('../auth.js').then(m => m.initAuth()); return; }

  _renderShell();
  cacheEL();
  _applyTheme();
  _bindGlobalKeyboard();

  await _loadData();
  await _seedIfEmpty();
  _subscribeRealtime();

  // Restore last tab
  try { setCurTab(localStorage.getItem('beu_tab') || 'dash'); } catch(e) {}

  // Restore tab order
  try {
    const savedOrder = JSON.parse(localStorage.getItem('beu_tabOrder'));
    if (savedOrder && savedOrder.length) {
      const bar = document.getElementById('mainTabs');
      if (bar) {
        const btns = [...bar.querySelectorAll('.btn-tab')];
        savedOrder.forEach(tabId => {
          const btn = btns.find(b => b.dataset.tab === tabId);
          if (btn) bar.appendChild(btn);
        });
      }
    }
  } catch(e) {}

  goTab(curTab);
}

// ─── EXPOSE window._op ─────────────────────────────────────────────
window._op = {
  goTab, renderHdr, renderDash, renderIngresos, renderIngresos2,
  renderFlota, renderConductores, renderAgenda, renderAnalytics,
  renderVehiculos, renderAuditoria, renderPapelera, renderImpresion,
  renderRecintos, renderEventosTab, renderMensajes: renderMensajesTab,
  renderUsuarios, renderEmpresasTab, renderMigracion, renderMensajesTab,
  openIngModal, openIngModal2, openFlotaModal, openCondModal, openAgendaModal,
  openEventoModal, openRecintoModal, openUserModal, openMovModal, openMsgModal,
  showIngDetalle, showAgDetalle, showCondDetalle,
  marcarSalidaIng, reactivarIngreso, marcarSalidaIng2, reactivarIngreso2,
  askDelIng, askDelIng2, askDelAg, askDelCond, askDelMov, askDelMsg,
  askDelLN, askDelEE, askDelEvento,
  marcarAgLlegado, marcarAgSalida, marcarTodosMsgLeidos, marcarMsgLeido,
  cambiarEstMov, registrarPasoTracking, registrarPasoTrackingAg,
  activarEvento, desactivarEvento, seleccionarEventoTrabajo,
  setDefaultEvento, restoreEventoVersion, restoreEventoDeleted,
  vaciarTab, vaciarPapelera, vaciarHistorial, resetAllData,
  exportIngresos, exportIngresos2, exportFlota, exportConductores,
  exportAgenda, exportListaNegra, exportMensajes, exportEventos,
  dlTemplateIng, dlTemplateIng2, dlTemplateAg, dlTemplateFlota, downloadPlantillaCond,
  dlTemplateVehiculos: dlTemplateFlota,
  printIngreso, printIngreso2, printTrqRef, printTrqIng, printAgendaItem,
  exportarTodo, importarTodo, _sendBackupEmail, _toggleAutoEmail,
  handleLogout, cycleTheme, selectTheme, toggleThemeMenu,
  openLangPicker, setLang,
  tabDragStart, tabDragOver, tabDrop, tabDragEnd,
  setSort, toggleAutoFill, togglePosAuto,
  cycleCampo, saveCamposCfg, resetCamposCfg, addCustomCampo,
  renderCamposSubtab,
};

// ─── WINDOW ALIASES (for inline onclick handlers) ───────────────────
Object.entries(window._op).forEach(([k, fn]) => {
  if (typeof fn === 'function' && !window[k]) window[k] = fn;
});

// Missing onclick aliases
window.eliminar = eliminar;
window.exportAuditLog = exportAuditLog;
window.restaurar = restaurar;
window.openMsgModal = openMsgModal;
window.openEmpresaModal = (id) => { toast('Modal empresa — migración pendiente', 'var(--amber)'); };

// Extra compat aliases
window.cleanTab = (tab) => vaciarTab(tab);
window.vaciarTab = vaciarTab;
window.canImport = canImport;
window.canExport = canExport;
window.canAdd = canAdd;
window.canEdit = canEdit;
window.canDel = canDel;
window.canClean = canClean;
window.canStatus = canStatus;
window.canSpecial = canSpecial;
window.canCampos = canCampos;
window.canPrint = canPrint;
window.isSA = isSA;
window.isSup = isSup;
window.nowL = nowLocal;
window.uid = uid;
window.toast = toast;

// ─── MISSING REGISTERED FUNCTIONS ───────────────────────────────────
function _ingLN() {
  const items = DB.listaNegra || [];
  if (!items.length) return '<div class="empty" style="padding:20px"><div class="ei">⭐</div><div class="et">Sin registros especiales</div></div>';
  let h = '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Nivel</th><th>Motivo</th><th>Empresa</th><th>Acc.</th></tr></thead><tbody>';
  items.forEach(ln => {
    h += `<tr><td><span class="mchip">${esc(ln.matricula)}</span></td><td>${ln.nivel==='bloqueo'?'<span class="pill pill-r">🚫 Bloqueo</span>':'<span class="pill pill-a">⭐ Especial</span>'}</td><td style="font-size:11px">${esc(ln.motivo||'–')}</td><td style="font-size:11px">${esc(ln.empresa||'–')}</td><td>${isSA()?`<button class="btn btn-danger btn-xs" onclick="askDelLN('${ln.id}')">🗑</button>`:''}</td></tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}
registerFn('_ingLN', _ingLN);
window._ingLN = _ingLN;

// ─── READ LOCALSTORAGE ON INIT ──────────────────────────────────────
try { if(localStorage.getItem('beu_af')==='1') { import('../core/context.js').then(c=>c.setAutoFill(true)); } } catch(e){}
try { if(localStorage.getItem('beu_pa')==='0') { import('../core/context.js').then(c=>c.setPosAuto(false)); } } catch(e){}

// ─── ADDITIONAL WINDOW ALIASES (validator fix) ──────────────────────
window.exportExcel = exportExcel;
window.importExcel = importExcel;
window.dlTemplateEmpresas = () => { _xlsxWrite([['Nombre','CIF','Contacto','Telefono','Email']], 'Empresas', 'plantilla_empresas.xlsx'); };
window.dlTemplateRecintos = () => { _xlsxWrite([['Nombre','Ciudad','País','Halls (;)']], 'Recintos', 'plantilla_recintos.xlsx'); };
window.dlTemplateEventos = () => { _xlsxWrite([['Nombre','Inicio','Fin','Recinto','Ciudad']], 'Eventos', 'plantilla_eventos.xlsx'); };
window.dlTemplateUsuarios = () => { _xlsxWrite([['Nombre','Email','Rol','PIN','Idioma']], 'Usuarios', 'plantilla_usuarios.xlsx'); };
