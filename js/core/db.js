// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — core/db.js
// Data loading, saving, realtime, CRUD operations.
// ═══════════════════════════════════════════════════════════════════════
import { AppState } from '../state.js';
import { toast, uid, nowLocal, normPlate, clone } from '../utils.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canStatus } from '../auth.js';
import { fsGet, fsSet, fsUpdate, fsAdd, fsDel, fsGetAll, fsListen, fsBatch } from '../firestore.js';
import { DB, iF, SID, curTab, _unsubs, registerFn, callFn } from './context.js';
import { logAudit, logExport, _getCU, getActiveEvent, fmt } from './shared.js';

// ─── CRUD HELPERS ────────────────────────────────────────────────────
export function _getCol(col) { return DB[col] || []; }

export function _nextPos(col) {
  const items = _getCol(col);
  if (!items.length) return '1';
  const maxPos = Math.max(...items.map(i => parseInt(i.pos) || 0), 0);
  return String(maxPos + 1);
}

export async function _saveOne(collection, item) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsSet(`${base}/${item.id}`, item, false);
}

export async function _deleteOne(collection, id) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsDel(`${base}/${id}`);
}

export async function saveDB() {
  // All saves are done individually per entity — no full DB write
}

export async function saveDBNow() { await saveDB(); }

// ─── AUDIT LOGGING ──────────────────────────────────────────────────
export async function _logEdit(action, mat, pos, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _getCU()?.nombre||'?', action, mat: normPlate(mat), pos, detail: detail||'' };
  DB.editHistory.unshift(entry);
  if (DB.editHistory.length > 500) DB.editHistory = DB.editHistory.slice(0, 500);
  await _saveOne('editHistory', entry);
}

export async function _logPasswordChange(userId, userName, email) {
  const entry = { id: uid(), ts: nowLocal(), type: 'password_change', entity: 'sesion', userId, userName, email, action: 'cambio_contrasena' };
  if (!DB.auditLog) DB.auditLog = [];
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry).catch(e=>{});
  const pwChanges = DB.auditLog.filter(a => a.type === 'password_change');
  if (pwChanges.length > 500) {
    const XLSX = window.XLSX;
    if (XLSX) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pwChanges), 'CambiosContrasena');
      XLSX.writeFile(wb, 'cambios_pass_' + new Date().toISOString().slice(0,10) + '.xlsx');
      toast('Auto-export: +500 cambios de contraseña', 'var(--amber)');
    }
  }
}

export async function _logAudit(action, entity, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _getCU()?.nombre||'?', action, entity, detail: detail||'' };
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry);
}

// ─── DATA LOADING ────────────────────────────────────────────────────
export async function _loadData() {
  const ev = AppState.get('currentEvent');
  const evId = ev?.id || DB.activeEventId;
  if (!evId) {
    const evs = await fsGetAll('events');
    DB.eventos = evs;
    if (evs.length) {
      DB.activeEventId = evs[0].id;
      AppState.set('currentEvent', evs[0]);
    }
    return;
  }
  const base = `events/${evId}`;
  try {
    const [ingresos, ingresos2, agenda, conductores, mensajes, movimientos] = await Promise.all([
      fsGetAll(`${base}/ingresos`),
      fsGetAll(`${base}/ingresos2`),
      fsGetAll(`${base}/agenda`),
      fsGetAll(`${base}/conductores`),
      fsGetAll(`${base}/mensajes`),
      fsGetAll(`${base}/movimientos`),
    ]);
    DB.ingresos = ingresos;
    DB.ingresos2 = ingresos2;
    DB.agenda = agenda;
    DB.conductores = conductores;
    DB.mensajesRampa = mensajes;
    DB.movimientos = movimientos;
    const sorted = [...ingresos, ...ingresos2].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||''));
    if (sorted.length) AppState.set('lastIngreso', sorted[0]);
  } catch(e) { console.warn('[db] loadData', e); }

  try {
    const allUsers = await fsGetAll('users');
    DB.usuarios = allUsers.filter(u => u.rol !== 'empresa');
    const curUser = AppState.get('currentUser');
    if (curUser && !DB.usuarios.find(u => u.id === curUser.id)) {
      DB.usuarios.push(curUser);
    }
    DB.eventos     = await fsGetAll('events');
    DB.recintos    = await fsGetAll('recintos');
    DB.empresas    = await fsGetAll('companies');
    DB.papelera    = await fsGetAll('papelera');
    DB.auditLog    = await fsGetAll('auditLog');
    DB.preregistros= await fsGetAll(`${base}/preregistros`);
    DB.editHistory = await fsGetAll(`${base}/editHistory`);
  } catch(e) { console.warn('[db] loadConfig', e); }
}

// ─── SEED ────────────────────────────────────────────────────────────
export async function _seedIfEmpty() {
  try {
    const user = AppState.get('currentUser');
    const existingUser = await fsGet('users/' + user.id).catch(() => null);
    if (!existingUser) {
      await fsSet('users/' + user.id, {
        id: user.id, nombre: user.nombre, email: user.email,
        rol: 'superadmin', lang: 'es',
        tabs: ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics',
               'vehiculos','auditoria','papelera','impresion','recintos','eventos',
               'mensajes','usuarios','empresas'],
      }, false);
    }
    const users = await fsGetAll('users').catch(() => []);
    if (users.length <= 1) {
      const { hashPin } = await import('../utils.js');
      const salt1 = 'salt_op_001', salt2 = 'salt_emp_001';
      const pin1 = await hashPin('1234', salt1);
      const pin2 = await hashPin('4321', salt2);
      await fsSet('users/test_operador', {
        id:'test_operador', nombre:'Operador Test', email:'operador@beunifyt.com',
        rol:'controlador_rampa', lang:'es', pinHash:pin1, pinSalt:salt1,
        tabs:['ingresos','ingresos2'],
      }, false);
      await fsSet('users/test_empresa', {
        id:'test_empresa', nombre:'Empresa Test', email:'empresa@beunifyt.com',
        rol:'empresa', lang:'es', pinHash:pin2, pinSalt:salt2,
      }, false);
    }
    const evs = await fsGetAll('events').catch(() => []);
    if (!evs.length) {
      const evId = 'ev_default';
      await fsSet('events/' + evId, {
        id: evId, nombre: 'Evento Demo 2026', ico: '📋',
        ini: '2026-04-01', fin: '2026-04-10',
        recinto: 'Recinto Demo', ciudad: 'Barcelona', activo: true,
      }, false);
      await fsSet('config/activeEvent', { id: evId }, false);
      DB.activeEventId = evId;
      AppState.set('currentEvent', { id: evId, nombre: 'Evento Demo 2026', ico: '📋' });
    }
  } catch(e) { console.warn('[db] seed', e); }
}

// ─── REALTIME ────────────────────────────────────────────────────────
export function _subscribeRealtime() {
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  const base = `events/${ev.id}`;
  fsListen(`${base}/ingresos`, docs => {
    DB.ingresos = docs;
    callFn('renderHdr');
    if (curTab === 'ingresos') callFn('renderIngresos');
    if (curTab === 'dash') callFn('renderDash');
  }).then(u => _unsubs.push(u));
  fsListen(`${base}/mensajes`, docs => {
    DB.mensajesRampa = docs;
    callFn('renderHdr');
    if (curTab === 'mensajes') callFn('renderMensajes');
  }).then(u => _unsubs.push(u));
}

// ─── CRUD OPERATIONS ────────────────────────────────────────────────
export async function saveIngreso(data, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso para editar', 'var(--red)'); return; }
  const isNew = !data.id;
  if (isNew) { data.id = uid(); data.pos = _nextPos(col); data.entrada = data.entrada || nowLocal(); data.creadoPor = _getCU()?.nombre||'?'; }
  data.eventoId = data.eventoId || DB.activeEventId;
  data.eventoNombre = data.eventoNombre || getActiveEvent()?.nombre || '';
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === data.id);
  if (idx >= 0) arr[idx] = data; else arr.push(data);
  await _saveOne(col, data);
  await _logEdit(isNew ? 'new' : 'edit', data.matricula, data.pos);
  AppState.set('lastIngreso', data);
  toast(isNew ? '✅ Entrada registrada' : '✅ Actualizado', 'var(--green)');
  callFn('goTab', curTab);
}

export async function registrarSalida(id, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso', 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  item.salida = nowLocal();
  await _saveOne(col, item);
  await _logEdit('salida', item.matricula, item.pos);
  toast('↩ Salida registrada', 'var(--blue)');
  callFn('goTab', curTab);
}

export async function reactivar(id, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso', 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  delete item.salida;
  await _saveOne(col, item);
  await _logEdit('reactivar', item.matricula, item.pos);
  toast('↺ Reactivado', 'var(--blue)');
  callFn('goTab', curTab);
}

export async function eliminar(id, col) {
  if (!isSA()) { toast('Solo SuperAdmin', 'var(--red)'); return; }
  if (!confirm('¿Eliminar? El elemento irá a la papelera.')) return;
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === id); if (idx < 0) return;
  const item = arr[idx];
  const trash = { id: uid(), origen: col, item: clone(item), borradoPor: _getCU()?.nombre||'?', ts: nowLocal() };
  DB.papelera.push(trash);
  await _saveOne('papelera', trash);
  arr.splice(idx, 1);
  await _deleteOne(col, id);
  await _logEdit('delete', item.matricula||item.nombre||id, item.pos||'');
  toast('🗑 Eliminado', 'var(--red)');
  callFn('goTab', curTab);
}

export async function restaurar(trashId) {
  const idx = DB.papelera.findIndex(x => x.id === trashId); if (idx < 0) return;
  const t = DB.papelera[idx];
  const item = t.item;
  const col = t.origen;
  if (!_getCol(col).find(x => x.id === item.id)) {
    _getCol(col).push(item);
    await _saveOne(col, item);
  }
  DB.papelera.splice(idx, 1);
  await _deleteOne('papelera', trashId);
  toast('↩ Restaurado', 'var(--green)');
  callFn('renderPapelera');
}

export async function vaciarPapelera() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm(`¿Vaciar papelera (${DB.papelera.length} elementos)?`)) return;
  const ops = DB.papelera.map(p => ({ type:'delete', path:`papelera/${p.id}` }));
  if (ops.length) await fsBatch(ops);
  DB.papelera = [];
  toast('💥 Papelera vaciada', 'var(--red)');
  callFn('renderPapelera');
}

export async function vaciarHistorial() {
  if (!isSA()) return;
  if (!confirm('¿Vaciar historial de modificaciones?')) return;
  DB.editHistory = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) await fsBatch((await fsGetAll(`events/${ev.id}/editHistory`)).map(e => ({ type:'delete', path:`events/${ev.id}/editHistory/${e.id}` })));
  toast('💥 Historial vaciado', 'var(--red)');
  callFn('renderVehiculos');
}

export async function vaciarTab(col) {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  const names = { ingresos:'Referencias', ingresos2:'Ingresos', movimientos:'Embalaje', agenda:'Agenda', conductores:'Conductores' };
  if (!confirm(`¿Vaciar ${names[col]||col}? Backup antes.`)) return;
  DB[col] = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('limpiar_tab', col, 'Vaciado por ' + (_getCU()?.nombre||'?'));
  toast(`💥 ${names[col]||col} vaciado`, 'var(--amber)');
  callFn('goTab', curTab);
}

export async function resetAllData() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm('⚠️ BORRAR TODOS LOS DATOS del evento activo.\nEsta acción NO se puede deshacer.\nHaz un backup Excel primero.')) return;
  const ev = AppState.get('currentEvent');
  if (!ev?.id) { toast('Sin evento activo', 'var(--amber)'); return; }
  for (const col of ['ingresos','ingresos2','movimientos','conductores','agenda','mensajes','editHistory']) {
    DB[col] = [];
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('reset_total', 'all', ev.nombre);
  toast('💥 Datos del evento eliminados', 'var(--red)');
  callFn('goTab', 'dash');
}

export function softDelete(coleccion, id, renderFn) {
  if (!DB.papelera) DB.papelera = [];
  const item = (DB[coleccion]||[]).find(x => x.id === id);
  if (item) { DB.papelera.unshift({...item, _from:coleccion, _delTs:nowLocal(), _delBy:_getCU()?.nombre||'?'}); if (DB.papelera.length > 200) DB.papelera = DB.papelera.slice(0, 200); }
  DB[coleccion] = (DB[coleccion]||[]).filter(x => x.id !== id);
  logAudit('delete', coleccion, 'Eliminado: '+(item?.matricula||item?.nombre||id));
  saveDB();
  if (renderFn) renderFn();
  callFn('renderHdr');
}

// ─── EVENT OPERATIONS ───────────────────────────────────────────────
export function seleccionarEventoTrabajo(id) {
  DB.userWorkEventId = id;
  const ev = DB.eventos.find(e => e.id === id);
  const cu = AppState.get('currentUser');
  if (cu) {
    cu.workEventId = id;
    AppState.set('currentUser', cu);
    fsSet('users/' + cu.id, { ...cu, workEventId: id }, false).catch(e=>{});
  }
  DB.activeEventId = id;
  AppState.set('currentEvent', ev || null);
  toast('✅ Trabajando en: ' + (ev?.nombre || id), 'var(--green)');
  callFn('renderEventosTab'); callFn('renderHdr');
}

export async function activarEvento(id) {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para activar eventos','var(--red)'); return; }
  DB.activeEventId = id;
  const ev = DB.eventos.find(e => e.id === id) || null;
  AppState.set('currentEvent', ev);
  await fsSet('config/activeEvent', { id }, false);
  await _logAudit('activar_evento', 'eventos', id);
  toast('▶ Evento activado', 'var(--green)');
  callFn('renderEventosTab'); callFn('renderHdr');
}

export async function desactivarEvento() {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para desactivar eventos','var(--red)'); return; }
  DB.activeEventId = null;
  AppState.set('currentEvent', null);
  await fsSet('config/activeEvent', { id: null }, false);
  toast('⏹ Evento desactivado', 'var(--amber)');
  callFn('renderEventosTab'); callFn('renderHdr');
}

// ─── IMPORT/EXPORT ──────────────────────────────────────────────────
export async function importExcel(inp, col) {
  if (!canImport()) { toast('Sin permiso', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>importExcel(inp,col);document.head.appendChild(s);return; }
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:'' });
      let added = 0;
      for (const row of rows) {
        const mat = normPlate(row.Matricula || row.matricula || '');
        if (!mat) continue;
        const item = { ...row, id: uid(), matricula: mat, pos: _nextPos(col), creadoPor:'Import', entrada: row.entrada||nowLocal() };
        _getCol(col).push(item);
        await _saveOne(col, item);
        added++;
      }
      toast(`✅ ${added} importados`, 'var(--green)');
      callFn('goTab', curTab);
    } catch(err) { toast('❌ ' + err.message, 'var(--red)'); }
    inp.value = '';
  };
  r.readAsBinaryString(f);
}

export async function exportExcel(col) {
  if (!canExport()) { toast('Sin permiso para exportar', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => exportExcel(col); document.head.appendChild(s); return;
  }
  const data = DB[col] || [];
  if (!data.length) { toast('Sin datos para exportar', 'var(--amber)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), col);
  const fn = `${col}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  DB.exportLog = DB.exportLog || [];
  const entry = { id:uid(), ts:nowLocal(), user:_getCU()?.nombre||'?', rol:_getCU()?.rol||'?', tab:col, filename:fn };
  DB.exportLog.unshift(entry);
  await _saveOne('exportLog', entry);
  toast(`📥 Exportado: ${fn}`, 'var(--blue)');
}

export async function exportAuditLog() {
  if (!isSA()) return;
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>exportAuditLog();document.head.appendChild(s);return; }
  const wb = XLSX.utils.book_new();
  const sess = (DB.auditLog||[]).filter(e=>e.entity==='sesion');
  const acts = (DB.auditLog||[]).filter(e=>e.entity!=='sesion');
  if (sess.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sess), 'Sesiones');
  if (acts.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(acts), 'Acciones');
  if ((DB.exportLog||[]).length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(DB.exportLog), 'Exportaciones');
  const fn = `auditoria_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast('✅ Audit log exportado', 'var(--green)');
}

// ─── TRACKING ───────────────────────────────────────────────────────
import { TRACKING_STEPS } from './shared.js';

export function registrarPasoTracking(id, col) {
  col = col || 'ingresos';
  const item = (DB[col]||[]).find(x => x.id === id);
  if (!item) return;
  if (!item.tracking) item.tracking = [];
  const next = TRACKING_STEPS.find(s => !item.tracking.find(t => t.step === s.id));
  if (!next) { toast('Tracking completo', 'var(--amber)'); return; }
  item.tracking.push({step:next.id, ts:nowLocal(), user:_getCU()?.nombre||'?'});
  logAudit('tracking', col, item.matricula+' → '+next.name);
  saveDB();
  if (col === 'ingresos') callFn('renderIngresos');
  else if (col === 'ingresos2') callFn('renderIngresos2');
  toast('📡 ' + next.name, 'var(--green)');
}

export function registrarPasoTrackingAg(agId) {
  const item = DB.agenda.find(x => x.id === agId);
  if (!item) return;
  if (!item.tracking) item.tracking = [];
  const next = TRACKING_STEPS.find(s => !item.tracking.find(t => t.step === s.id));
  if (!next) { toast('Tracking completo', 'var(--amber)'); return; }
  item.tracking.push({step:next.id, ts:nowLocal(), user:_getCU()?.nombre||'?'});
  saveDB(); callFn('renderAgenda');
  toast('📡 ' + next.name, 'var(--green)');
}

// ─── V6 COMPAT ACTIONS ──────────────────────────────────────────────
export function marcarSalidaIng(id) { const i=DB.ingresos.find(x=>x.id===id);if(!i)return;i.salida=nowLocal();saveDB();callFn('renderIngresos');callFn('renderHdr');toast('↩ Salida registrada','var(--green)'); }
export function reactivarIngreso(id) { const i=DB.ingresos.find(x=>x.id===id);if(!i)return;i.salida=null;saveDB();callFn('renderIngresos');callFn('renderHdr');toast('↺ Reactivado','var(--amber)'); }
export function marcarSalidaIng2(id) { const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;i.salida=nowLocal();saveDBNow();callFn('renderIngresos2');callFn('renderHdr'); }
export function reactivarIngreso2(id) { const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;i.salida=null;saveDBNow();callFn('renderIngresos2');callFn('renderHdr');toast('↺ Salida anulada','var(--amber)'); }
export function marcarAgLlegado(id) { const a=DB.agenda.find(x=>x.id===id);if(!a)return;a.estado='LLEGADO';a.horaReal=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});saveDB();callFn('renderAgenda');callFn('renderHdr');toast('✅ Llegada registrada','var(--green)'); }
export function marcarAgSalida(id) { const a=DB.agenda.find(x=>x.id===id);if(!a)return;a.estado='SALIDA';a.horaSalida=nowLocal();saveDB();callFn('renderAgenda');toast('🔵 Salida registrada'); }
export function marcarTodosMsgLeidos() { DB.mensajesRampa.forEach(m=>{if(!m.leido)m.leido=[];if(!m.leido.includes(SID))m.leido.push(SID);});saveDB();callFn('renderMensajesTab');callFn('renderHdr'); }
export function cambiarEstMov(id, status) { const m=DB.movimientos.find(x=>x.id===id);if(!m)return;m.status=status;m.lastStatusTs=nowLocal();saveDB();callFn('renderFlota');callFn('renderHdr'); }
export function marcarMsgLeido(id) { const msg=DB.mensajesRampa.find(x=>x.id===id);if(!msg)return;if(!msg.leido)msg.leido=[];if(!msg.leido.includes(SID))msg.leido.push(SID);_saveOne('mensajesRampa',msg);callFn('renderHdr');callFn('renderMensajesTab'); }

// ─── DELETE HELPERS ─────────────────────────────────────────────────
export function askDelIng(id) { const i=DB.ingresos.find(x=>x.id===id);if(!i)return;callFn('askDel','Eliminar ingreso','<b>'+i.matricula+'</b>',()=>{softDelete('ingresos',id,()=>callFn('renderIngresos'));}); }
export function askDelIng2(id) { const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;callFn('askDel','Eliminar ingreso libre','<b>'+i.matricula+'</b>',()=>{softDelete('ingresos2',id,()=>callFn('renderIngresos2'));}); }
export function askDelAg(id) { const a=DB.agenda.find(x=>x.id===id);if(!a)return;callFn('askDel','Eliminar cita','<b>'+(a.matricula||'')+'</b>',()=>{softDelete('agenda',id,()=>callFn('renderAgenda'));}); }
export function askDelCond(id) { const c=DB.conductores.find(x=>x.id===id);if(!c)return;callFn('askDel','Eliminar conductor','<b>'+c.nombre+'</b>',()=>{softDelete('conductores',id,()=>callFn('renderConductores'));}); }
export function askDelMov(id) { const m=DB.movimientos.find(x=>x.id===id);if(!m)return;callFn('askDel','Eliminar movimiento','<b>'+m.matricula+'</b>',()=>{softDelete('movimientos',id,()=>callFn('renderFlota'));}); }
export function askDelMsg(id) { callFn('askDel','Eliminar mensaje','',()=>{DB.mensajesRampa=DB.mensajesRampa.filter(x=>x.id!==id);saveDB();callFn('renderMensajesTab');callFn('renderHdr');}); }
export function askDelLN(id) { const ln=DB.listaNegra.find(x=>x.id===id);if(!ln)return;callFn('askDel','Eliminar de especial','<b>'+ln.matricula+'</b>',()=>{DB.listaNegra=DB.listaNegra.filter(x=>x.id!==id);saveDB();callFn('renderIngresos');}); }
export function askDelEE(id) { callFn('askDel','Eliminar de espera','',()=>{DB.enEspera=DB.enEspera.filter(x=>x.id!==id);saveDB();callFn('renderIngresos');}); }
export function askDelEvento(id) { if(!isSA()){toast('Solo SuperAdmin','var(--red)');return;}const ev=DB.eventos.find(x=>x.id===id);if(!ev)return;callFn('askDel','Eliminar evento','<b>'+ev.nombre+'</b>',()=>{if(!DB.eventosPapelera)DB.eventosPapelera=[];DB.eventosPapelera.unshift({...ev,_deletedBy:_getCU()?.nombre||'?',_deletedTs:nowLocal()});DB.eventos=DB.eventos.filter(x=>x.id!==id);if(DB.activeEventId===id){DB.activeEventId=null;DB.activeEventIds=[];}logAudit('del_evento','evento','Eliminado: '+ev.nombre);saveDB();callFn('renderEventosTab');}); }

export function setDefaultEvento(id) { DB.defaultEventId=id;saveDB();toast('✅ Evento por defecto','var(--green)');callFn('renderEventosTab'); }
export function restoreEventoVersion(idx) { const h=(DB.eventoHistorial||[]);if(!h[idx])return;const ev=h[idx];const existing=DB.eventos.find(x=>x.id===ev.id);if(existing)Object.assign(existing,ev);else DB.eventos.push({...ev});saveDB();toast('↺ Versión restaurada','var(--green)');callFn('renderEventosTab'); }
export function restoreEventoDeleted(idx) { const p=(DB.eventosPapelera||[]);if(!p[idx])return;DB.eventos.push({...p[idx]});DB.eventosPapelera.splice(idx,1);saveDB();toast('↺ Evento restaurado','var(--green)');callFn('renderEventosTab'); }

// ─── REGISTER ───────────────────────────────────────────────────────
registerFn('saveDB', saveDB);
registerFn('saveDBNow', saveDBNow);
registerFn('softDelete', softDelete);
registerFn('askDel', callFn.bind(null, 'askDel'));

// Expose on window
window.saveDB = saveDB;
window.saveDBNow = saveDBNow;
window.logAudit = logAudit;
window.softDelete = softDelete;
