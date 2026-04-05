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
import { injectModals } from '../core/modals.js';
import { renderCamposSubtab, cycleCampo, saveCamposCfg, resetCamposCfg, addCustomCampo } from '../core/fields.js';

// ─── MODAL STATE VARIABLES ──────────────────────────────
let evPuertasTemp=[], agReqsTemp=[], _recHallsTemp=[], _recPuertasTemp=[];
let editIngId=null, editMovId=null, editCondId=null, editAgId=null;
let editEvId=null, editRecId=null, editUserId=null, editEEId=null, editLNId=null;
let blkOverrideData=null, _ingSource="ingresos", CU=null, pendingDelFn=null, _lastMsgCount=0;
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
function openIngModal(i){
  editIngId=i?i.id:null;blkOverrideData=null;
  document.getElementById('mIngTitle').textContent=i?'Editar ingreso':'Nuevo ingreso';
  document.getElementById('btnIngLbl').textContent=i?'Guardar':'Registrar entrada';
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};
  set('fiId',i?.id);set('fiMat',i?.matricula);set('fiLlamador',i?.llamador);set('fiRef',i?.referencia);
  const _tag=document.getElementById('fiMatTag');if(_tag)_tag.style.display='none';
  if(i?.matricula){
    const _tc=DB.conductores.find(cd=>cd.matricula===i.matricula);
    if(_tc)setMatTag('👤',_tc.nombre+' '+_tc.apellido,_tc.empresa);
    else if(i.nombre)setMatTag('📋',`${i.nombre||''} ${i.apellido||''}`.trim(),i.empresa||'','ing');
  }
  set('fiEmp',i?.empresa);set('fiMontador',i?.montador);set('fiExpositor',i?.expositor);
  set('fiStand',i?.stand);set('fiPuertaHall',i?.puertaHall);set('fiRem',i?.remolque);set('fiNom',i?.nombre);set('fiApe',i?.apellido);
  set('fiPas',i?.pasaporte);set('fiFechaNac',i?.fechaNacimiento);set('fiFechaExp',i?.fechaExpiracion);set('fiPais',i?.pais);
  set('fiTelP',i?.telPais||'+34');set('fiTel',i?.telefono);set('fiEmail',i?.email);
  set('fiComent',i?.comentario);set('fiCarga',i?.tipoCarga||'');set('fiRegRXL',i?.regRXL||'');set('fiSOT',i?.oficinaSot||'');set('fiTipoVeh',i?.tipoVehiculo||'');set('fiDescarga',i?.descargaTipo||'');
  const posEl=document.getElementById('fiPos');
  if(posEl)posEl.value=i?.pos||'';
  _fiHalls=i?.halls?[...i.halls]:(i?.hall?[i.hall]:[]);
  renderHallTags();
  const _evSel=document.getElementById('fiEventoId');
  if(_evSel){
    if(i?.eventoId)_evSel.value=i.eventoId;
    else if(DB.activeEventId)_evSel.value=DB.activeEventId;
    else if(DB.defaultEventId)_evSel.value=DB.defaultEventId;
    else _evSel.value='';
  }
  document.getElementById('fiHistorial').style.display='none';
  document.getElementById('fiBlkWarn').style.display='none';
  document.getElementById('fiEspMatch').style.display='none';
  const _cs=document.getElementById('fiChoferSearch');if(_cs)_cs.value='';
  const _cr=document.getElementById('fiChoferResults');if(_cr)_cr.classList.remove('open');
  const _mt=document.getElementById('fiMatTag');if(_mt)_mt.style.display='none';
  const _mr=document.getElementById('fiMatResults');if(_mr)_mr.classList.remove('open');
  fillLangIng();if(document.getElementById('fiLang'))document.getElementById('fiLang').value=i?.lang||CU?.lang||'es';updatePhrasePreview();
  syncToggleButtons();fillPuertaSelect();if(i?.puerta)set('fiPuerta',i.puerta);
  const _cfgK=_ingSource==='ingresos2'?'ing2':'ing1';
  initPrintLayout(_cfgK);
  setTimeout(()=>{
    const saved=(DB.printCfgModes||{})[_cfgK]||'normal';
    setFormPrintMode(saved);
  },50);
  applyEventFieldVisibility();
  applyIngFormFieldVisibility();
  document.getElementById('mIng').classList.add('open');
}
let _fiHalls=[];
function renderHallTags(){
  const tagsEl=document.getElementById('fiHallTags');
  const inpEl=document.getElementById('fiHallInput');
  if(!tagsEl)return;
  tagsEl.innerHTML=_fiHalls.map((h,i)=>{
    const ev=getFormEvento();
    const evHalls=ev?.halls||[];
    const avail=!ev||!evHalls.length||evHalls.some(eh=>h.startsWith(eh)||eh===h);
    return`<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;background:${avail?'var(--bll)':'var(--rll)'};color:${avail?'var(--blue)':'var(--red)'};border:1px solid ${avail?'#bfdbfe':'#fecaca'};cursor:pointer" title="${avail?'Hall disponible':'⚠️ Hall no asignado al evento'}">${h}${!avail?' ⚠':''} <span onclick="removeHall(${i})" style="margin-left:2px;font-size:12px;opacity:.7">×</span></span>`;
  }).join('');
  const hid=document.getElementById('fiHall');if(hid)hid.value=_fiHalls[0]||'';
  if(inpEl)inpEl.value='';
  document.getElementById('fiHallResults')?.classList.remove('open');
}
function removeHall(idx){_fiHalls.splice(idx,1);renderHallTags();}
function filterHallSuggestions(q){
  const res=document.getElementById('fiHallResults');
  const ev=getFormEvento();
  const evHalls=ev?.halls||[];
  let allOpts=[];
  if(evHalls.length)allOpts=[...evHalls];
  else if(ev?.recintoId){const r=DB.recintos.find(x=>x.id===ev.recintoId);if(r&&r.halls)allOpts=[...r.halls];}
  if(!allOpts.length)allOpts=[...HALLS];
  const filtered=allOpts.filter(h=>(!q||h.toLowerCase().includes(q.toLowerCase()))&&!_fiHalls.includes(h));
  if(q&&q.trim()&&!allOpts.includes(q.trim())&&!_fiHalls.includes(q.trim())){
    filtered.push(q.trim()+'  ⚠ No en evento');
  }
  if(!filtered.length){res.classList.remove('open');return;}
  res.innerHTML=filtered.map(h=>{
    const isCustom=h.includes('⚠');
    const val=isCustom?h.replace(/\s+⚠.*/,''):h;
    return`<div class="dr-item" onmousedown="addHall('${val}')">🚪 ${h}</div>`;
  }).join('');
  res.classList.add('open');
}
function addHall(h){
  if(!_fiHalls.includes(h)){_fiHalls.push(h);}
  renderHallTags();
  const inp=document.getElementById('fiHallInput');if(inp)inp.value='';
  document.getElementById('fiHallResults')?.classList.remove('open');
}
function openIngModal2(i){_ingSource='ingresos2';openIngModal(i);}
function openFlotaModal(id){openMovModal(id);}
function openMovModal(m){editMovId=m?m.id:null;document.getElementById('mMovTitle').textContent=m?'Editar movimiento':'Nuevo movimiento';document.getElementById('btnMovLbl').textContent=m?'Guardar':'Añadir';const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};set('fmId',m?.id);set('fmMat',m?.matricula);set('fmRem',m?.remolque);set('fmNom',m?.nombre);set('fmApe',m?.apellido);set('fmEmp',m?.empresa);set('fmHall',m?.hall);set('fmCarga',m?.tipoCarga||'');set('fmStatus',m?.status||'ALMACEN');set('fmPos',m?.posicion);set('fmVuelta',m?.numVuelta||1);set('fmNotas',m?.notas);if(m?.tacografoHora){const el=document.getElementById('fmTaco');if(el)el.value=m.tacografoHora.replace(' ','T');}document.getElementById('mMov').classList.add('open');}
function openCondModal(c){editCondId=c?c.id:null;document.getElementById('mCondTitle').textContent=c?'Editar conductor':'Nuevo conductor';document.getElementById('btnCondLbl').textContent=c?'Guardar':'Crear';const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};set('fcId',c?.id);set('fcNom',c?.nombre);set('fcApe',c?.apellido);set('fcEmp',c?.empresa);set('fcMat',c?.matricula);set('fcRem',c?.remolque);set('fcHall',c?.hall);set('fcTelP',c?.telPais||'+34');set('fcTel',c?.telefono);set('fcEmail',c?.email);set('fcTipoV',c?.tipoVehiculo||'');set('fcPas',c?.pasaporte);set('fcPais',c?.pais);set('fcFechaNac',c?.fechaNacimiento);set('fcFechaExp',c?.fechaExpiracion);set('fcGps',c?.gpsUrl);set('fcNotas',c?.notas);set('fcEncargado',c?.encargado);set('fcEncTelP',c?.encargadoTelPais||'+34');set('fcEncTel',c?.encargadoTel);set('fcEncEmail',c?.encargadoEmail);fillIdiomaSelect();if(c?.idioma)setTimeout(()=>{const el=document.getElementById('fcIdioma');if(el)el.value=c.idioma;},0);document.getElementById('mCond').classList.add('open');}
function openAgendaModal(a){
  editAgId=a?a.id:null;agReqsTemp=a?.requisitos?[...a.requisitos]:[];
  document.getElementById('mAgTitle').textContent=a?'Editar cita':'Nueva cita';
  document.getElementById('btnAgLbl').textContent=a?'Guardar cambios':'Añadir cita';
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};
  set('agId',a?.id);set('agFecha',a?.fecha||new Date().toISOString().slice(0,10));set('agHora',a?.hora);
  set('agMat',a?.matricula);set('agRem',a?.remolque);set('agTipoV',a?.tipoVehiculo);set('agCond',a?.conductor);
  set('agEmp',a?.empresa);set('agRef',a?.referencia);set('agMontador',a?.montador);set('agExpositor',a?.expositor);
  set('agHall',a?.hall);set('agStand',a?.stand);set('agPuerta',a?.puerta);set('agPase',a?.pase);
  const agHSel=document.getElementById('agHall');if(agHSel){agHSel.innerHTML='<option value="">--</option>'+getRecintoHalls().map(h=>`<option value="${h}" ${a?.hall===h?'selected':''}>${h}</option>`).join('');}
  set('agPuertaHall',a?.puertaHall);set('agPas',a?.pasaporte);set('agPais',a?.pais);set('agFechaNac',a?.fechaNacimiento);set('agFechaExp',a?.fechaExpiracion);set('agTel',a?.telefono);set('agGps',a?.gpsUrl);set('agCarga',a?.tipoCarga||'');syncAgDescarga(a?.descargaTipo||'');
  set('agGastoTipo',a?.gastoTipo);set('agGastoImporte',a?.gastoImporte);set('agEstado',a?.estado||'PENDIENTE');set('agNotas',a?.notas);
  const evSel=document.getElementById('agEvento');if(evSel){const _dEv=DB.defaultEventId||DB.activeEventId||'';evSel.innerHTML='<option value="">— Sin evento —</option>'+DB.eventos.map(e=>`<option value="${e.id}" ${(a?.eventoId||(!a&&_dEv)||'')===e.id?'selected':''}>${e.ico||'📋'} ${e.nombre}</option>`).join('');if(!a&&_dEv)evSel.value=_dEv;onAgEventoChange();const _w=document.getElementById('agEvWrap');if(_w)_w.style.display=(DB.activeEventId&&!a)?'none':'block';}
  document.getElementById('agChoferSearch').value='';document.getElementById('agChoferResults').classList.remove('open');
  renderAgReqs();document.getElementById('mAg').classList.add('open');
}
function openEventoModal(ev){if(!canEditEvento()){toast('Sin permiso para editar eventos','var(--red)');return;}editEvId=ev?ev.id:null;evPuertasTemp=ev?.puertas?[...ev.puertas]:[];document.getElementById('mEvTitle').textContent=ev?'Editar evento':'Nuevo evento';document.getElementById('btnEvLbl').textContent=ev?'Guardar':'Crear';const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};set('evId',ev?.id);set('evNom',ev?.nombre);set('evIni',ev?.ini);set('evFin',ev?.fin);set('evIco',ev?.ico||'📋');set('evRec',ev?.recinto);set('evCiudad',ev?.ciudad);const recSel=document.getElementById('evRecintoId');if(recSel){recSel.innerHTML='<option value="">— Seleccionar recinto —</option>'+(DB.recintos||[]).map(r=>`<option value="${r.id}" ${ev?.recintoId===r.id?'selected':''}>${r.nombre} · ${r.ciudad||''} ${r.pais||''}</option>`).join('');if(ev?.recintoId)recSel.value=ev.recintoId;}const rec=ev?.recintoId?(DB.recintos||[]).find(x=>x.id===ev.recintoId):null;renderEvHallsGrid(rec?rec.halls:[],ev?.halls||[]);const grid=document.getElementById('evCamposGrid');if(grid)grid.innerHTML=EV_CAMPOS.map(k=>{const v=(ev?.campos?.[k]||'show');const colors={off:['var(--border)','var(--bg2)','var(--text4)','✕'],show:['var(--blue)','var(--blue)','#fff','✓'],required:['var(--red)','var(--red)','#fff','★']};const c=colors[v]||colors.show;return`<span id="evF${k}" data-val="${v}" onclick="cycleEvCampo('${k}')" style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:12px;border:1px solid ${c[0]};background:${c[1]};color:${c[2]};font-size:12px;font-weight:700;cursor:pointer;user-select:none;transition:all .15s;opacity:${v==='off'?'.4':'1'}">${c[3]} ${k}</span>`;}).join('');renderPuertasEv();if(document.getElementById('evPrintTemplate'))document.getElementById('evPrintTemplate').value=ev?.printTemplate||'fullgv';}
function openRecintoModal(r){
  editRecId=r?r.id:null;_recHallsTemp=r?.halls?[...r.halls]:[];_recPuertasTemp=r?.puertas?[...r.puertas]:[];
  document.getElementById('mRecTitle').textContent=r?'Editar recinto':'Nuevo recinto';
  document.getElementById('btnRecLbl').textContent=r?'Guardar':'Crear';
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||'';};
  set('recId',r?.id);set('recNom',r?.nombre);set('recCiudad',r?.ciudad);set('recPais',r?.pais);
  set('recAtcTel',r?.atencion?.tel);set('recAtcEmail',r?.atencion?.email);set('recAtcNotas',r?.atencion?.notas);
  renderRecHalls();renderRecPuertas();
  document.getElementById('mRecinto').classList.add('open');
}
function openUserModal(id){
  editUserId=id||null;const u=id?DB.usuarios.find(x=>x.id===id):null;
  document.getElementById('mUserTitle').textContent=u?'Editar usuario':'Nuevo usuario';
  document.getElementById('btnUserLbl').textContent=u?'Guardar':'Crear';
  const set=(eid,v)=>{const el=document.getElementById(eid);if(el)el.value=v||'';};
  set('fuId',u?.id);set('fuNom',u?.nombre);set('fuUsername',u?.username||'');set('fuEmail',u?.email||'');set('fuRol',u?.rol||'editor');(function(){const _ls=document.getElementById('fuLang');if(_ls){_ls.innerHTML=LANGS_UI.map(l=>`<option value="${l.code}">${l.flag.includes('<svg')?'🏴':l.flag} ${l.name}</option>`).join('');_ls.value=u?.lang||'es';}})();set('fuPin','');set('fuPin2','');set('fuPass','');set('fuPass2','');const _2fa=document.getElementById('fu2FA');if(_2fa){_2fa.checked=!!(u?.twoFA);updTgl(_2fa);}document.getElementById('passStrengthWrap').style.display='none';
  const saOpt=document.getElementById('fuRolSA');if(saOpt)saOpt.style.display=isSA()?'':'none';
  updateRolPerms();
  const defT={superadmin:['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','recintos','eventos','mensajes','usuarios','impresion'],supervisor:['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','recintos','eventos','usuarios','impresion'],controlador_rampa:['ingresos','ingresos2'],editor:['ingresos','ingresos2','conductores','agenda','impresion'],visor:['ingresos','ingresos2','agenda']};
  const tabs=u?.tabs||(u?defT[u.rol]:defT['editor'])||[];
  [['ftDash','dash'],['ftIng','ingresos'],['ftIng2','ingresos2'],['ftFlota','flota'],['ftCond','conductores'],['ftAg','agenda'],['ftAn','analytics'],['ftVeh','vehiculos'],['ftAud','auditoria'],['ftPap','papelera'],['ftRec','recintos'],['ftUs','usuarios'],['ftImp','impresion'],['ftEv','eventos']].forEach(([eid,tab])=>{const el=document.getElementById(eid);if(el){el.checked=tabs.includes(tab);updTgl(el);}});
  if(u){const p=u.permisos||{},isFull=u.rol==='supervisor'||u.rol==='superadmin';[['fpAdd','canAdd'],['fpEdit','canEdit'],['fpDel','canDel'],['fpStat','canStatus'],['fpExp','canExport'],['fpBL','canSpecial'],['fpEvEdit','canEditEvento'],['fpPrint','canPrint'],['fpImport','canImport'],['fpClean','canClean'],['fpSaveTpl','canSaveTpl'],['fpDelTpl','canDelTpl'],['fpActivarEv','canActivarEvento'],['fpMsg','canMensajes'],['fpCampos','canCampos']].forEach(([eid,pk])=>{const el=document.getElementById(eid);if(el){el.checked=isFull||!!(p[pk]);el.disabled=isFull;updTgl(el);}});}
  document.getElementById('mUser').classList.add('open');
}
function openMsgModal() {
  const ttl=prompt('Título del mensaje:');if(!ttl)return;
  const tipo=prompt('Tipo (info/alerta/urgente/ok):','info')||'info';
  const body=prompt('Mensaje (opcional):','');
  const msg={id:uid(),ts:nowLocal(),autor:(AppState.get('currentUser')?.nombre||'?'),tipo,titulo:ttl,mensaje:body||'',leido:[SID],pausado:false};
  DB.mensajesRampa.unshift(msg);
  saveDBNow();renderHdr();renderMensajesTab();
  toast('📢 Mensaje enviado','var(--blue)');
}
function showIngDetalle(id,source){
  const col=source||'ingresos';
  const i=(DB[col]||[]).find(x=>x.id===id);if(!i){showIngDetalleBase(id);return;}
  document.getElementById('mIngDetailTitle').textContent='🚛 '+i.matricula+(i.pos?' · Pos.'+i.pos:'')+(source==='ingresos2'?' [Ingresos libre]':'');
  document.getElementById('mIngDetailPrint').onclick=()=>{const _ck=source==='ingresos2'?'ing2':'ing1';_printWithActiveTpl&&_printWithActiveTpl(_ck,i,source==='ingresos2',_ck,'normal');};
  const trqBtn=document.getElementById('mIngDetailPrintTrq');if(trqBtn)trqBtn.onclick=()=>{const cfgK=source==='ingresos2'?'ing2':'ing1';const mode=(DB.printCfgModes||{})[cfgK]||'normal';if(mode==='normal')printIngresoFromObj&&printIngresoFromObj(i,source==='ingresos2');else{const _o=Object.assign({},i);_o._isLib=source==='ingresos2';printIngresoTroquelado&&printIngresoTroquelado(_o);}};
  document.getElementById('mIngDetailEdit').onclick=()=>{closeOv('mIngDetail');if(source==='ingresos2')openIngModal2(i);else openIngModal(i);};
  document.getElementById('mIngDetailPrint').style.display='';
  document.getElementById('mIngDetailEdit').style.display='';
  const halls=i.halls||[i.hall||''];
  document.getElementById('mIngDetailBody').innerHTML=`
    <div class="sg sg3" style="margin-bottom:12px">
      <div class="stat-box" style="border-top:3px solid var(--text)"><div class="stat-n" style="font-size:36px">${i.pos||'–'}</div><div class="stat-l">Posición</div></div>
      <div class="stat-box" style="border-top:3px solid var(--blue);grid-column:span 2"><div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:900;color:var(--blue)">${i.matricula}</div>${i.remolque?`<div style="font-size:11px;color:var(--text3);margin-top:3px">Remolque: <b>${i.remolque}</b></div>`:''}<div class="stat-l" style="margin-top:3px">${halls.map(h=>hBadge(h)).join(' ')}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
      ${[['👤 Nombre',i.nombre+' '+i.apellido],['🏢 Empresa',i.empresa],['📞 Teléfono',(i.telPais||'')+' '+(i.telefono||'')],['📍 Stand',i.stand],['📞 Llamador',i.llamador],['🔖 Referencia',i.referencia],['🔧 Montador',i.montador],['🎪 Expositor',i.expositor],['🚚 Remolque',i.remolque],['🪪 Pasaporte/DNI',i.pasaporte],['✉️ Email',i.email],['📅 Evento',i.eventoNombre],['🕐 Entrada',fmt(i.entrada)],['↩ Salida',i.salida?fmt(i.salida):'En recinto'],['👤 Creado por',i.creadoPor]].map(([l,v])=>v&&v.trim&&v.trim()?`<div style="padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">${l}</div><div style="font-weight:600">${v}</div></div>`:'').join('')}
      ${i.comentario?`<div style="grid-column:1/-1;padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">📝 Comentario</div><div>${i.comentario}</div></div>`:''}
    </div>
    ${!i.salida?'<div style="margin-top:10px;background:var(--gll);border:1.5px solid #bbf7d0;border-radius:var(--r);padding:8px 12px;font-weight:700;color:var(--green);font-size:13px">✓ En recinto</div>':'<div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:8px 12px;font-size:12px;color:var(--text3)">↩ Salida: '+fmt(i.salida)+'</div>'}`;
  document.getElementById('mIngDetail').classList.add('open');
}
function showIngDetalleBase(id){
  const i=DB.ingresos.find(x=>x.id===id)||(DB.ingresos2||[]).find(x=>x.id===id);
  if(!i)return;
  const src=DB.ingresos.find(x=>x.id===id)?undefined:'ingresos2';
  showIngDetalle(id,src);
}
function showAgDetalle(id){
  const a=DB.agenda.find(x=>x.id===id);if(!a)return;
  toast('📅 '+a.matricula+' · '+a.fecha+' '+a.hora+' · '+a.conductor,'var(--blue)',4000);
}
function showCondDetalle(id){
  const c=DB.conductores.find(x=>x.id===id);if(!c)return;
  toast('👤 '+c.nombre+' '+c.apellido+' · '+c.matricula+' · '+c.empresa,'var(--blue)',4000);
}

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
  injectModals();
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
window.openEmpresaModal = (id) => {
  const e = id ? (DB.empresas||[]).find(x=>x.id===id) : null;
  const eid = id||null;
  const html = `
    <div class="fgrid">
      <div class="fg s2"><span class="flbl">Nombre <span class="freq">*</span></span><input id="feNom" value="${e?.nombre||''}" placeholder="Nombre empresa" autocomplete="off"></div>
      <div class="fg"><span class="flbl">CIF / VAT</span><input id="feCif" value="${e?.cif||''}" placeholder="B12345678" autocomplete="off"></div>
      <div class="fg"><span class="flbl">Email</span><input id="feEmail" value="${e?.email||''}" placeholder="empresa@mail.com" type="email"></div>
      <div class="fg"><span class="flbl">Contacto</span><input id="feContacto" value="${e?.contacto||''}" placeholder="Nombre contacto"></div>
      <div class="fg"><span class="flbl">Teléfono</span><input id="feTel" value="${e?.telefono||''}" placeholder="+34600000000"></div>
      <div class="fg s2"><span class="flbl">Dirección</span><input id="feDirec" value="${e?.direccion||''}" placeholder="Calle, número, ciudad"></div>
      <div class="fg"><span class="flbl">Estado</span>
        <select id="feNivel">
          <option value="pending" ${(e?.nivel||'pending')==='pending'?'selected':''}>Pendiente</option>
          <option value="verified" ${e?.nivel==='verified'?'selected':''}>Verificada</option>
          <option value="blocked" ${e?.nivel==='blocked'?'selected':''}>Bloqueada</option>
        </select>
      </div>
      <div class="fg"><span class="flbl">Notas</span><input id="feNotas" value="${e?.notas||''}" placeholder="Observaciones"></div>
    </div>`;
  const mDiv = document.createElement('div');
  mDiv.className = 'ov open';
  mDiv.id = 'mEmpresaDyn';
  mDiv.innerHTML = `<div class="modal modal-lg">
    <div class="mhdr"><div class="mttl">${e?'Editar empresa':'Nueva empresa'}</div><button class="btn-x" onclick="document.getElementById('mEmpresaDyn').remove()">✕</button></div>
    ${html}
    <div class="ffoot">
      <button class="btn btn-gh" onclick="document.getElementById('mEmpresaDyn').remove()">Cancelar</button>
      <button class="btn btn-p" onclick="window._saveEmpresa('${eid||''}')">${e?'Guardar':'Crear'}</button>
    </div>
  </div>`;
  document.body.appendChild(mDiv);
};
window._saveEmpresa = (eid) => {
  const nom = (document.getElementById('feNom')?.value||'').trim();
  if(!nom){toast('Nombre obligatorio','var(--red)');return;}
  const e = {
    id: eid||uid(),
    nombre: nom,
    cif: (document.getElementById('feCif')?.value||'').trim(),
    email: (document.getElementById('feEmail')?.value||'').trim(),
    contacto: (document.getElementById('feContacto')?.value||'').trim(),
    telefono: (document.getElementById('feTel')?.value||'').trim(),
    direccion: (document.getElementById('feDirec')?.value||'').trim(),
    nivel: document.getElementById('feNivel')?.value||'pending',
    notas: (document.getElementById('feNotas')?.value||'').trim(),
  };
  if(!DB.empresas)DB.empresas=[];
  if(eid)DB.empresas=DB.empresas.map(x=>x.id===eid?e:x);
  else DB.empresas.push(e);
  saveDBNow();
  document.getElementById('mEmpresaDyn')?.remove();
  renderEmpresasTab();
  toast('✅ Empresa guardada','var(--green)');
};

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
window.cycleEvCampo = typeof cycleEvCampo !== 'undefined' ? cycleEvCampo : () => {};
window.removeHall = removeHall;
window.dlTemplateEmpresas = () => { _xlsxWrite([['Nombre','CIF','Contacto','Telefono','Email']], 'Empresas', 'plantilla_empresas.xlsx'); };
window.dlTemplateRecintos = () => { _xlsxWrite([['Nombre','Ciudad','País','Halls (;)']], 'Recintos', 'plantilla_recintos.xlsx'); };
window.dlTemplateEventos = () => { _xlsxWrite([['Nombre','Inicio','Fin','Recinto','Ciudad']], 'Eventos', 'plantilla_eventos.xlsx'); };
window.dlTemplateUsuarios = () => { _xlsxWrite([['Nombre','Email','Rol','PIN','Idioma']], 'Usuarios', 'plantilla_usuarios.xlsx'); };
// ─── MODAL VARIABLES ─────────────────────────────

// ─── MODAL SAVE/HELPER FUNCTIONS ─────────────────
function renderTipoVehButtons(ev){
  // Si el evento tiene tipoVehLabels usa esos, sino usa TV_FIRA por defecto (Fira GV)
  const labels=ev?.tipoVehLabels||TV_FIRA;
  const wrap=document.getElementById('tipoVehBtns');if(!wrap)return;
  wrap.innerHTML=Object.values(labels).map(t=>
    `<button type="button" class="btn btn-sm btn-gh" id="${t.id}" onclick="setToggle('fiTipoVeh','${t.val}')" style="flex:1">${t.lbl}</button>`
  ).join('');
  syncToggleButtons();
}

function closeOv(id){const el=document.getElementById(id);if(el)el.classList.remove('open');}

function applyIngFormFieldVisibility(){
  const ck=_getCamposKey(_ingSource==='ingresos2'?'ingresos2':'ingresos');
  Object.entries(_FMAP).forEach(([k,wid])=>{
    const el=document.getElementById(wid);if(!el)return;
    const cfg=DB.camposCfg?.[ck]?.current?.[k]??'show';
    el.style.display=cfg==='off'?'none':'';
    const lbl=el.querySelector('.flbl');if(!lbl)return;
    const old=lbl.querySelector('.freq-auto');if(old)old.remove();
    if(cfg==='required'){const s=document.createElement('span');s.className='freq freq-auto';s.textContent=' *';lbl.appendChild(s);}
  });
}

function getFormEvento(){const sel=document.getElementById('fiEventoId');if(sel&&sel.value)return DB.eventos.find(e=>e.id===sel.value)||null;return getActiveEvent();}

function onFormEventoChange(){const ev=getFormEvento();renderTipoVehButtons(ev);renderHallTags();const inp=document.getElementById('fiHallInput');if(inp)inp.value='';const res=document.getElementById('fiHallResults');if(res)res.classList.remove('open');fillPuertaSelect();}

function applyEventFieldVisibility(){
  const actEvs=getActiveEvents();
  // Populate evento selector
  const selWrap=document.getElementById('fiEventoSel');
  const selEl=document.getElementById('fiEventoId');
  if(selEl){
    const curVal=selEl.value;
    const allEvs2=DB.eventos||[];
    selEl.innerHTML='<option value="">— Sin evento —</option>'+allEvs2.map(e=>`<option value="${e.id}" ${(curVal||DB.defaultEventId||'')===(e.id)?'selected':''}>${e.ico||'📋'} ${e.nombre}</option>`).join('');
    if(!curVal&&DB.defaultEventId)selEl.value=DB.defaultEventId;
    if(selWrap)selWrap.style.display=(allEvs2.length>0&&!DB.activeEventId)?'block':'none';
  }
  const bar=document.getElementById('fiEventoBar');if(bar)bar.style.display='none';
  renderTipoVehButtons(getFormEvento());
  // Autocompletar pos según colección y reglas
  const posEl=document.getElementById('fiPos');
  if(posEl&&!posEl.value){
    const today=new Date().toISOString().slice(0,10);
    const ev=getFormEvento();
    let nextPos;
    if(_ingSource==='ingresos2'){
      if(ev?.acumularPos)nextPos=(DB.ingresos2||[]).filter(i=>i.eventoId===ev?.id).length+1;
      else nextPos=(DB.ingresos2||[]).filter(i=>i.entrada?.startsWith(today)).length+1;
    }else{
      nextPos=DB.ingresos.filter(i=>i.entrada?.startsWith(today)).length+1;
    }
    posEl.placeholder='Auto ('+nextPos+')';
  }
}

function fillLangIng(){const el=document.getElementById('fiLang');if(!el)return;el.innerHTML=Object.entries(LANGS).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join('');}

function syncAgDescarga(v){
  const cur=document.getElementById('agDescarga');if(cur)cur.value=v||'';
  ['agDcHand','agDcFork'].forEach(id=>{
    const b=document.getElementById(id);if(!b)return;
    const bv=id==='agDcHand'?'mano':'maquinaria';
    b.className='btn btn-sm '+(v===bv?'btn-p':'btn-gh');
    b.style.opacity=v&&v!==bv?'.35':'1';
  });
}

function syncToggleButtons(){const tv=document.getElementById('fiTipoVeh')?.value||'';const dc=document.getElementById('fiDescarga')?.value||'';const map={tvTrailer:'trailer',tvB:'semiremolque',tvA:'camion'};Object.entries(map).forEach(([btnId,v])=>{const b=document.getElementById(btnId);if(b){const active=tv===v;b.className='btn btn-sm '+(active?'btn-p':'btn-gh');b.style.opacity=tv&&!active?'.35':'1';}});const dmap={dcHand:'mano',dcFork:'maquinaria'};Object.entries(dmap).forEach(([btnId,v])=>{const b=document.getElementById(btnId);if(b){const active=dc===v;b.className='btn btn-sm '+(active?'btn-p':'btn-gh');b.style.opacity=dc&&!active?'.35':'1';}});}

function fillPuertaSelect(){const sel=document.getElementById('fiPuerta');if(!sel)return;const ev=getActiveEvent();let puertas=ev?.puertas||[];if(!puertas.length&&ev?.recintoId){const r=(DB.recintos||[]).find(x=>x.id===ev.recintoId);if(r)puertas=r.puertas||[];}sel.innerHTML='<option value="">--</option>'+puertas.map(p=>`<option value="${p.nombre}">${p.nombre}</option>`).join('');}

function updatePhrasePreview(){
  // Phrase 2 - translate like phrase 1
  const p2w=document.getElementById('fiPhrase2Wrap');
  if(p2w){
    const ev2=getActiveEvent();const dLang2=document.getElementById('fiLang')?.value||'es';const uLang2=CUR_LANG||'es';
    if(ev2?.phrase2){
      p2w.style.display='block';
      const p2src=ev2.phrase2;
      // Check if translation exists
      if(!ev2.phrases2)ev2.phrases2={};
      ev2.phrases2[uLang2]=p2src; // base language
      const p2translated=ev2.phrases2[dLang2];
      const dInfo2=LANGS_UI.find(l=>l.code===dLang2)||{flag:'',name:dLang2};
      const uInfo2=LANGS_UI.find(l=>l.code===uLang2)||{flag:'🇪🇸',name:'Español'};
      if(dLang2===uLang2){
        document.getElementById('fiPhrase2Line').innerHTML=uInfo2.flag+' '+p2src;
      }else if(p2translated){
        document.getElementById('fiPhrase2Line').innerHTML=dInfo2.flag+' '+p2translated+'<br><span style="font-size:10px;color:var(--text3)">'+uInfo2.flag+' '+p2src+'</span>';
      }else{
        document.getElementById('fiPhrase2Line').innerHTML=dInfo2.flag+' <span style="color:#1d4ed8;font-style:italic;font-size:11px">traduciendo...</span><br><span style="font-size:10px;color:var(--text3)">'+uInfo2.flag+' '+p2src+'</span>';
        freeTranslatePhrase2(p2src,uLang2,dLang2,dInfo2,ev2);
      }
    }else{p2w.style.display='none';}
  }const wrap=document.getElementById('fiPhraseWrap');if(!wrap)return;const driverLang=document.getElementById('fiLang')?.value||'es';const uLang=CUR_LANG||'es';const ev=getActiveEvent();if(!ev||!ev.phrases){wrap.style.display='none';return;}const evPhrases=ev.phrases||{};const phraseUser=evPhrases[uLang]||evPhrases.es||'';if(!phraseUser){wrap.style.display='none';return;}wrap.style.display='block';const uInfo=LANGS_UI.find(l=>l.code===uLang)||{flag:'🇪🇸',name:'Español'};document.getElementById('fiPhraseUserLine').innerHTML=`🔔 ${uInfo.flag} ${phraseUser}`;const dLine=document.getElementById('fiPhraseDriverLine');if(driverLang===uLang){dLine.style.display='none';return;}const dInfo=LANGS_UI.find(l=>l.code===driverLang)||{flag:'',name:driverLang};const existing=evPhrases[driverLang];if(existing){dLine.style.display='block';dLine.innerHTML=`${dInfo.flag} ${existing}`;return;}dLine.style.display='block';dLine.innerHTML=`${dInfo.flag} <span style="color:#b45309;font-style:italic;font-size:11px">traduciendo...</span>`;freeTranslatePhrase(phraseUser,uLang,driverLang,dInfo,ev);}

function canEditEvento(){return isSA()||hasPerm('canEditEvento');}

function addRecHall(){const inp=document.getElementById('recHallInput');const v=(inp.value||'').trim().toUpperCase();if(!v)return;if(!_recHallsTemp.includes(v))_recHallsTemp.push(v);inp.value='';renderRecHalls();}

function renderRecHalls(){const el=document.getElementById('recHallList');if(el)el.innerHTML=_recHallsTemp.map((h,i)=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:var(--r);background:var(--bll);border:1.5px solid #bfdbfe;font-size:12px;font-weight:700;color:var(--blue)">🏭 ${h}<button class="btn btn-danger btn-xs" style="padding:1px 4px;font-size:9px" onclick="_recHallsTemp.splice(${i},1);renderRecHalls()">✕</button></span>`).join('');}

function addRecPuerta(){const nom=(document.getElementById('recPuertaNom').value||'').trim();if(!nom)return;_recPuertasTemp.push({nombre:nom,direccion:(document.getElementById('recPuertaDir').value||'').trim(),qr:(document.getElementById('recPuertaQR').value||'').trim()});document.getElementById('recPuertaNom').value='';document.getElementById('recPuertaDir').value='';document.getElementById('recPuertaQR').value='';renderRecPuertas();}

function renderRecPuertas(){const el=document.getElementById('recPuertasList');if(el)el.innerHTML=_recPuertasTemp.map((p,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg2);font-size:12px"><span style="font-weight:700">🚪 ${p.nombre}</span>${p.direccion?`<span style="color:var(--text3)">📍 ${p.direccion}</span>`:''} ${p.qr?`<a href="${p.qr}" target="_blank" style="color:var(--blue);font-size:10px">🔗 QR</a>`:''}<button class="btn btn-danger btn-xs" onclick="_recPuertasTemp.splice(${i},1);renderRecPuertas()">✕</button></div>`).join('');}

function saveRecinto(){
  const nom=(document.getElementById('recNom').value||'').trim();if(!nom){toast('Nombre obligatorio','var(--red)');return;}
  const r={id:editRecId||uid(),nombre:nom,ciudad:(document.getElementById('recCiudad').value||'').trim(),pais:(document.getElementById('recPais').value||'').trim(),halls:[..._recHallsTemp],puertas:[..._recPuertasTemp],atencion:{tel:(document.getElementById('recAtcTel').value||'').trim(),email:(document.getElementById('recAtcEmail').value||'').trim(),notas:(document.getElementById('recAtcNotas').value||'').trim()}};
  if(editRecId)DB.recintos=DB.recintos.map(x=>x.id===editRecId?r:x);else DB.recintos.push(r);
  saveDB();closeOv('mRecinto');renderRecintos();toast('✅ Recinto guardado');
}

function setMatTag(icon,name,empresa,src){
  const tag=document.getElementById('fiMatTag');
  if(!tag)return;
  document.getElementById('fiMatTagIcon').textContent=icon;
  document.getElementById('fiMatTagName').textContent=name+(empresa?' · '+empresa:'');
  tag.style.display='flex';
  // Solo mostrar botón "Guardar en conductores" si viene de historial (no ya es conductor)
  const saveBtn=document.getElementById('fiMatTagSave');
  if(saveBtn)saveBtn.style.display=(src==='ing'||src==='veh')?'inline-block':'none';
}

function saveMatAsChofer(){
  const mat=(document.getElementById('fiMat')?.value||'').trim().toUpperCase();
  if(!mat){toast('Matrícula requerida','var(--red)');return;}
  // Verificar si ya existe
  const exists=DB.conductores.find(cd=>cd.matricula===mat);
  if(exists){
    if(!confirm('⚠️ '+mat+' ya existe en conductores ('+exists.nombre+' '+exists.apellido+').\n¿Abrir para editar?'))return;
    closeOv('mIng');
    setTimeout(()=>openCondModal(exists),200);
    return;
  }
  // Leer datos del formulario actual
  const get=id=>(document.getElementById(id)?.value||'').trim();
  const nom=get('fiNom'),ape=get('fiApe');
  if(!nom&&!ape){toast('Rellena al menos nombre y apellido antes de guardar','var(--amber)');return;}
  // Pre-llenar modal conductor con los datos del formulario
  const prefill={
    matricula:mat,
    nombre:nom,apellido:ape,
    empresa:get('fiEmp'),
    remolque:get('fiRem'),
    hall:_fiHalls[0]||'',
    telPais:get('fiTelP')||'+34',
    telefono:get('fiTel'),
    email:get('fiEmail'),
    tipoVehiculo:get('fiTipoVeh'),
    pasaporte:get('fiPas'),
    pais:get('fiPais'),
    fechaNacimiento:get('fiFechaNac'),
    fechaExpiracion:get('fiFechaExp'),
    idioma:get('fiLang'),
    notas:''
  };
  // Abrir modal conductor prellenado (sin cerrar el de ingreso)
  openCondModalFromIng(prefill);
}

function clearMatField(){
  const matEl=document.getElementById('fiMat');
  if(matEl)matEl.value='';
  const tag=document.getElementById('fiMatTag');if(tag)tag.style.display='none';
  const res=document.getElementById('fiMatResults');if(res)res.classList.remove('open');
  // Clear conductor-filled fields
  ['fiRem','fiNom','fiApe','fiEmp','fiTelP','fiTel','fiEmail','fiPas','fiPais','fiFechaNac','fiFechaExp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=el.id==='fiTelP'?'+34':'';});
  document.getElementById('fiTipoVeh').value='';
  document.getElementById('fiDescarga').value='';
  syncToggleButtons();
  _fiHalls=[];renderHallTags();
  toast('🗑 Campos de conductor borrados','var(--text3)');
}

function _formSaveIngreso(){
  const mat=(document.getElementById('fiMat').value||'').trim().toUpperCase();if(!mat){toast('Matrícula obligatoria','var(--red)');return;}
  const emp=(document.getElementById('fiEmp').value||'').trim(),hall=document.getElementById('fiHall').value,ev=getFormEvento();
  if(fieldCfg('empresa')==='required'&&!emp){toast('Empresa obligatoria','var(--red)');return;}
  if(fieldCfg('hall')==='required'&&!hall){toast('Hall obligatorio','var(--red)');return;}
  const ln=checkBL(mat);if(ln&&!blkOverrideData){blkOverrideData={mat};showBlkAlert(ln,mat,true);return;}
  blkOverrideData=null;_doSaveIng(mat,emp,hall,ev);
}

function onAgEventoChange(){
  const evId=document.getElementById('agEvento').value;
  const ev=evId?DB.eventos.find(e=>e.id===evId):null;
  // Update hall dropdown to show only halls of this event/recinto
  const agHSel=document.getElementById('agHall');
  if(agHSel){
    const halls=ev?.halls?.length?ev.halls:(ev?.recintoId?(DB.recintos||[]).find(r=>r.id===ev.recintoId)?.halls||[]:getRecintoHalls());
    agHSel.innerHTML='<option value="">--</option>'+halls.map(h=>`<option value="${h}">${h}</option>`).join('');
  }
}

function addReqAg(){const v=(document.getElementById('agReqInput').value||'').trim();if(!v)return;agReqsTemp.push(v);document.getElementById('agReqInput').value='';renderAgReqs();}

function removeReqAg(i){agReqsTemp.splice(i,1);renderAgReqs();}

function renderAgReqs(){const el=document.getElementById('agReqsList');if(el)el.innerHTML=agReqsTemp.map((r,i)=>`<span class="req-chip">${r}<button onclick="removeReqAg(${i})">✕</button></span>`).join('');}

function saveAgenda(){
  const mat=(document.getElementById('agMat').value||'').trim().toUpperCase(),fecha=document.getElementById('agFecha').value,hora=document.getElementById('agHora').value;
  if(!mat||!fecha||!hora){toast('Matrícula, fecha y hora obligatorios','var(--red)');return;}
  const eId=document.getElementById('agEvento').value,ev=eId?DB.eventos.find(x=>x.id===eId):null;
  const old=editAgId?DB.agenda.find(x=>x.id===editAgId):null;
  const a={id:editAgId||uid(),fecha,hora,eventoId:eId||null,eventoNombre:ev?.nombre||'',matricula:mat,remolque:(document.getElementById('agRem').value||'').trim().toUpperCase(),tipoVehiculo:document.getElementById('agTipoV').value,conductor:(document.getElementById('agCond').value||'').trim(),empresa:(document.getElementById('agEmp').value||'').trim(),referencia:(document.getElementById('agRef').value||'').trim().toUpperCase(),montador:(document.getElementById('agMontador').value||'').trim(),expositor:(document.getElementById('agExpositor').value||'').trim(),hall:(document.getElementById('agHall').value||'').trim(),stand:(document.getElementById('agStand').value||'').trim(),puerta:(document.getElementById('agPuerta').value||'').trim(),puertaHall:(document.getElementById('agPuertaHall').value||'').trim(),pasaporte:(document.getElementById('agPas').value||'').trim().toUpperCase(),pais:(document.getElementById('agPais').value||'').trim(),fechaNacimiento:document.getElementById('agFechaNac').value||'',fechaExpiracion:document.getElementById('agFechaExp').value||'',pase:document.getElementById('agPase').value,descargaTipo:document.getElementById('agDescarga')?.value||'',telefono:(document.getElementById('agTel').value||'').trim(),gpsUrl:(document.getElementById('agGps').value||'').trim(),tipoCarga:document.getElementById('agCarga').value,gastoTipo:document.getElementById('agGastoTipo').value,gastoImporte:document.getElementById('agGastoImporte').value||null,estado:document.getElementById('agEstado').value||'PENDIENTE',horaReal:old?.horaReal||null,requisitos:[...agReqsTemp],notas:(document.getElementById('agNotas').value||'').trim(),creadoPor:CU?.nombre||'?',ts:old?.ts||nowL()};
  if(editAgId)DB.agenda=DB.agenda.map(x=>x.id===editAgId?a:x);else DB.agenda.push(a);
  saveDB();closeOv('mAg');window._agSubTab='lista';renderAgenda();renderHdr();logAudit(editAgId?'edit_ag':'new_ag','agenda',mat+' '+fecha+' '+hora);toast('✅ Cita guardada','var(--green)');
}

function saveCond(){const nom=(document.getElementById('fcNom').value||'').trim(),ape=(document.getElementById('fcApe').value||'').trim();if(!nom||!ape){toast('Nombre y apellido obligatorios','var(--red)');return;}const c={id:editCondId||uid(),nombre:nom,apellido:ape,empresa:(document.getElementById('fcEmp').value||'').trim(),matricula:(document.getElementById('fcMat').value||'').trim().toUpperCase(),remolque:(document.getElementById('fcRem').value||'').trim().toUpperCase(),hall:document.getElementById('fcHall').value,telPais:document.getElementById('fcTelP').value,telefono:(document.getElementById('fcTel').value||'').trim(),email:(document.getElementById('fcEmail').value||'').trim(),idioma:document.getElementById('fcIdioma').value,tipoVehiculo:document.getElementById('fcTipoV').value,pasaporte:(document.getElementById('fcPas').value||'').trim().toUpperCase(),pais:(document.getElementById('fcPais').value||'').trim(),fechaNacimiento:document.getElementById('fcFechaNac').value||'',fechaExpiracion:document.getElementById('fcFechaExp').value||'',gpsUrl:(document.getElementById('fcGps').value||'').trim(),notas:(document.getElementById('fcNotas').value||'').trim(),encargado:(document.getElementById('fcEncargado').value||'').trim(),encargadoTelPais:document.getElementById('fcEncTelP').value,encargadoTel:(document.getElementById('fcEncTel').value||'').trim(),encargadoEmail:(document.getElementById('fcEncEmail').value||'').trim()};if(editCondId)DB.conductores=DB.conductores.map(x=>x.id===editCondId?c:x);else DB.conductores.push(c);
  saveDB();closeOv('mCond');renderConductores();
  if(window._condSaveAfterFromIng){
    window._condSaveAfterFromIng=false;
    setMatTag('👤',c.nombre+' '+c.apellido,c.empresa,'chofer');
    const saveBtn=document.getElementById('fiMatTagSave');if(saveBtn)saveBtn.style.display='none';
    toast('✅ Conductor guardado y vinculado a la matrícula','var(--green)',4000);
  } else {
    toast('✅ Conductor guardado');
  }}

function saveMov(){const mat=(document.getElementById('fmMat').value||'').trim().toUpperCase(),hall=document.getElementById('fmHall').value;if(!mat||!hall){toast('Matrícula y hall obligatorios','var(--red)');return;}const tacoRaw=document.getElementById('fmTaco').value;const m={id:editMovId||uid(),matricula:mat,remolque:(document.getElementById('fmRem').value||'').trim().toUpperCase(),nombre:(document.getElementById('fmNom').value||'').trim(),apellido:(document.getElementById('fmApe').value||'').trim(),empresa:(document.getElementById('fmEmp').value||'').trim(),hall,tipoCarga:document.getElementById('fmCarga').value,status:document.getElementById('fmStatus').value,posicion:parseInt(document.getElementById('fmPos').value)||0,numVuelta:parseInt(document.getElementById('fmVuelta').value)||1,tacografoHora:tacoRaw?tacoRaw.replace('T',' '):null,notas:(document.getElementById('fmNotas').value||'').trim(),lastStatusTs:nowL(),ts:editMovId?(DB.movimientos.find(x=>x.id===editMovId)?.ts||nowL()):nowL()};if(editMovId)DB.movimientos=DB.movimientos.map(x=>x.id===editMovId?m:x);else DB.movimientos.push(m);saveDB();closeOv('mMov');renderFlota();renderHdr();toast('✅ Guardado');}

function addPuertaEvento(){const nom=(document.getElementById('evPuertaNom').value||'').trim();if(!nom)return;evPuertasTemp.push({nombre:nom,direccion:(document.getElementById('evPuertaDir').value||'').trim(),qr:(document.getElementById('evPuertaQR').value||'').trim()});document.getElementById('evPuertaNom').value='';document.getElementById('evPuertaDir').value='';document.getElementById('evPuertaQR').value='';renderPuertasEv();}

function removePuertaEv(i){evPuertasTemp.splice(i,1);renderPuertasEv();}

function renderPuertasEv(){const el=document.getElementById('evPuertasList');if(el)el.innerHTML=evPuertasTemp.map((p,i)=>`<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg2);font-size:12px;flex-wrap:wrap"><span style="font-weight:700">🚪 ${p.nombre}</span>${p.direccion?`<span style="color:var(--text3)">📍 ${p.direccion}</span>`:''} ${p.qr?`<a href="${p.qr}" target="_blank" style="color:var(--blue);font-size:10px;text-decoration:none">🔗 QR Link</a>`:''}<button class="btn btn-danger btn-xs" onclick="removePuertaEv(${i})">✕</button></div>`).join('');}

function saveEvento(){const nom=(document.getElementById('evNom').value||'').trim();if(!nom){toast('Nombre obligatorio','var(--red)');return;}const campos={};EV_CAMPOS.forEach(k=>{const el=document.getElementById('evF'+k);if(el)campos[k]=el.dataset?.val||el.value||'show';});
  // Preservar traducciones existentes, actualizar solo el idioma del usuario
  const oldEv=editEvId?DB.eventos.find(x=>x.id===editEvId):null;
  let phrases={...(oldEv?.phrases||{})};
  /* phrases managed in print config, not events */
  const evHalls=[...document.querySelectorAll('.evHallCb:checked')].map(cb=>cb.value);
  const printName=(document.getElementById('evPrintName')?.value||'').trim();
  const acumularPos=document.getElementById('evAcumPos')?.checked||false;
  const phrase2='';
  const oldEv2=editEvId?DB.eventos.find(x=>x.id===editEvId):null;
  const phrases2={...(oldEv2?.phrases2||{})};
  const _evUsr=[...document.querySelectorAll('[data-ev-user]:checked')].map(el=>el.dataset.evUser);
  const _prevUsr=editEvId?(DB.eventos.find(x=>x.id===editEvId)?.usuariosAsignados||[]):[];
  const ev={id:editEvId||uid(),phrase2,phrases2,nombre:nom,ini:document.getElementById('evIni').value,fin:document.getElementById('evFin').value,ico:document.getElementById('evIco').value||'📋',recintoId:document.getElementById('evRecintoId')?.value||'',recinto:document.getElementById('evRec').value,ciudad:document.getElementById('evCiudad').value,halls:evHalls,campos,puertas:[...evPuertasTemp],phrases,printTemplate:document.getElementById('evPrintTemplate')?.value||'fullgv',printName,acumularPos,bgImage:evBgData||'',usuariosAsignados:_evUsr.length?_evUsr:_prevUsr};
  // Save named print template
  if(printName){if(!DB.printTemplates)DB.printTemplates=[];if(!DB.printTemplates.find(t=>t.name===printName))DB.printTemplates.push({name:printName,type:ev.printTemplate,fields:ev.campos,hiddenFields:[...(DB.printCfg2?.hiddenFields||[])]});}
  const _oldEv2=editEvId?DB.eventos.find(x=>x.id===editEvId):null;if(!DB.eventoHistorial)DB.eventoHistorial=[];if(_oldEv2)DB.eventoHistorial.unshift({..._oldEv2,_editedBy:CU?.nombre||'?',_editedTs:nowL()});if(DB.eventoHistorial.length>50)DB.eventoHistorial=DB.eventoHistorial.slice(0,50);logAudit(editEvId?'edit_evento':'new_evento','evento',(editEvId?'Editado: ':'Creado: ')+ev.nombre);
  if(editEvId)DB.eventos=DB.eventos.map(x=>x.id===editEvId?ev:x);else DB.eventos.push(ev);
  /* phrases not stored in events anymore */
  saveDB();closeOv('mEvento');renderIngresos();toast('✅ Evento guardado');}

function renderEvHallsGrid(allHalls,selectedHalls){const grid=document.getElementById('evHallsGrid');if(!grid)return;if(!allHalls||!allHalls.length){grid.innerHTML='<span style="font-size:11px;color:var(--text3)">Selecciona un recinto para ver los halls disponibles</span>';return;}grid.innerHTML=allHalls.map(h=>{const sel=selectedHalls.includes(h);return`<label style="display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:var(--r);border:1.5px solid ${sel?'var(--blue)':'var(--border)'};background:${sel?'var(--blue)':'var(--bg2)'};color:${sel?'#fff':'var(--text3)'};font-size:12px;font-weight:800;cursor:pointer;user-select:none;transition:all .15s"><input type="checkbox" class="evHallCb" value="${h}" ${sel?'checked':''} onchange="const l=this.closest('label');const c=this.checked;l.style.borderColor=c?'var(--blue)':'var(--border)';l.style.background=c?'var(--blue)':'var(--bg2)';l.style.color=c?'#fff':'var(--text3)'" style="display:none">${h}</label>`;}).join('')+`<button class="btn btn-xs btn-gh" onclick="document.querySelectorAll('.evHallCb').forEach(cb=>{cb.checked=true;const l=cb.closest('label');l.style.borderColor='var(--blue)';l.style.background='var(--blue)';l.style.color='#fff'})" style="margin-left:6px">✓ Todos</button><button class="btn btn-xs btn-gh" onclick="document.querySelectorAll('.evHallCb').forEach(cb=>{cb.checked=false;const l=cb.closest('label');l.style.borderColor='var(--border)';l.style.background='var(--bg2)';l.style.color='var(--text3)'})">✕ Ninguno</button>`;}

function saveEE(){const mat=(document.getElementById('eeM').value||'').trim().toUpperCase();if(!mat){toast('Matrícula obligatoria','var(--red)');return;}const e={id:editEEId||uid(),matricula:mat,hora:document.getElementById('eeHora').value,prioridad:document.getElementById('eePrio').value,conductor:(document.getElementById('eeCond').value||'').trim(),empresa:(document.getElementById('eeEmp').value||'').trim(),telefono:(document.getElementById('eeTel').value||'').trim(),hall:document.getElementById('eeHall').value,booking:(document.getElementById('eeRef').value||'').trim().toUpperCase(),notas:(document.getElementById('eeNotas').value||'').trim(),estado:'pendiente',ts:nowL(),creadoPor:CU?.nombre||''};if(editEEId)DB.enEspera=DB.enEspera.map(x=>x.id===editEEId?e:x);else DB.enEspera.push(e);autoMsg(e.prioridad==='urgente'?'urgente':e.prioridad==='alta'?'alerta':'info','⏳ '+mat+' en espera',mat+' · Hall: '+(e.hall||'?'),mat);saveDB();closeOv('mEE');renderIngresos();renderHdr();toast('⏳ En espera añadido');}

function saveLN(){const mat=(document.getElementById('lnM').value||'').trim().toUpperCase(),mot=(document.getElementById('lnMotivo').value||'').trim();if(!mat||!mot){toast('Matrícula y motivo obligatorios','var(--red)');return;}const ln={id:editLNId||uid(),matricula:mat,nivel:document.getElementById('lnN').value,motivo:mot,empresa:(document.getElementById('lnEmp').value||'').trim(),hasta:document.getElementById('lnHasta').value||null,ts:nowL(),usuario:CU?.nombre||''};if(editLNId)DB.listaNegra=DB.listaNegra.map(x=>x.id===editLNId?ln:x);else DB.listaNegra.push(ln);autoMsg('alerta','⭐ Especial',mat+' — '+ln.nivel.toUpperCase()+': '+mot,mat);logAudit('create','listaNegra',mat+' ('+ln.nivel+')');saveDB();closeOv('mLN');renderIngresos();toast('🚫 '+mat+' añadida');}

function saveMsg(){if(!canMensajes()){toast('Sin permiso para enviar mensajes','var(--red)');return;};const tit=(document.getElementById('msgTitulo').value||'').trim(),txt=(document.getElementById('msgTexto').value||'').trim();if(!tit||!txt){toast('Título y mensaje obligatorios','var(--red)');return;}const m={id:uid(),tipo:document.getElementById('msgTipo').value,titulo:tit,mensaje:txt,matricula:(document.getElementById('msgMat').value||'').trim().toUpperCase(),ts:nowL(),autor:CU?.nombre||'?',leido:[]};DB.mensajesRampa.unshift(m);if(DB.mensajesRampa.length>200)DB.mensajesRampa=DB.mensajesRampa.slice(0,200);saveDBNow();closeOv('mMsg');renderIngresos();renderHdr();toast('📢 Enviado');}

function updateRolPerms(){const rol=(document.getElementById('fuRol')||{}).value||'editor';const full=rol==='supervisor'||rol==='superadmin';['fpAdd','fpEdit','fpDel','fpStat','fpExp','fpBL','fpPrint','fpImport','fpClean','fpSaveTpl','fpDelTpl','fpEvEdit','fpActivarEv','fpMsg'].forEach(id=>{const el=document.getElementById(id);if(el){el.checked=full;el.disabled=full;updTgl(el);}});const pw=document.getElementById('permsWrap');if(pw)pw.style.opacity=full?'.6':'1';}

function updTgl(el){const lbl=el.closest('.tgl');if(!lbl)return;if(el.checked){lbl.classList.add('on');}else{lbl.classList.remove('on');}}

function doDelete(){if(pendingDelFn){pendingDelFn();pendingDelFn=null;}closeOv('mDel');}

function setFormPrintMode(mode){
  const cfgK=(_ingSource||'ingresos')==='ingresos2'?'ing2':'ing1';
  if(!DB.printCfgModes)DB.printCfgModes={};
  DB.printCfgModes[cfgK]=mode;
  saveDB();
  const btnN=document.getElementById('btnNormalA4Form');
  const btnT=document.getElementById('btnTroquelA4Form');
  if(btnN&&btnT){
    if(mode==='normal'){
      btnN.style.background='var(--teal)';btnN.style.color='#fff';btnN.style.borderColor='var(--teal)';
      btnT.style.background='var(--bg3)';btnT.style.color='var(--text)';btnT.style.borderColor='var(--border2)';
    } else {
      btnT.style.background='#7c3aed';btnT.style.color='#fff';btnT.style.borderColor='#7c3aed';
      btnN.style.background='var(--bg3)';btnN.style.color='var(--text)';btnN.style.borderColor='var(--border2)';
    }
  }
}


async function saveUser(){
  const nom=(document.getElementById('fuNom').value||'').trim();
  const username=(document.getElementById('fuUsername').value||'').trim();
  const email=(document.getElementById('fuEmail').value||'').trim();
  const pass=document.getElementById('fuPass').value;
  const pass2=document.getElementById('fuPass2').value;
  const pin=document.getElementById('fuPin').value;
  const pin2=document.getElementById('fuPin2').value;
  const twoFA=document.getElementById('fu2FA')?.checked||false;
  if(!nom){toast('Nombre obligatorio','var(--red)');return;}
  if(!username){toast('Nombre de usuario obligatorio','var(--red)');return;}
  // Check username unique
  const existingU=DB.usuarios.find(x=>x.username===username&&x.id!==editUserId);
  if(existingU){toast('Nombre de usuario ya existe','var(--red)');return;}
  if(pass&&pass!==pass2){toast('Las contraseñas no coinciden','var(--red)');return;}
  if(pin&&(pin.length<6||pin.length>8||!/^\d+$/.test(pin))){toast('PIN: mínimo 6 dígitos numéricos','var(--red)');return;}
  if(pin&&pin!==pin2){toast('Los PINs no coinciden','var(--red)');return;}
  if(twoFA&&!email){toast('Email requerido para activar 2FA','var(--amber)');return;}
  const _gp=id=>!!(document.getElementById(id)?.checked);const permisos={canAdd:_gp('fpAdd'),canEdit:_gp('fpEdit'),canDel:_gp('fpDel'),canStatus:_gp('fpStat'),canExport:_gp('fpExp'),canSpecial:_gp('fpBL'),canEditEvento:_gp('fpEvEdit'),canPrint:_gp('fpPrint'),canImport:_gp('fpImport'),canClean:_gp('fpClean'),canSaveTpl:_gp('fpSaveTpl'),canDelTpl:_gp('fpDelTpl'),canActivarEvento:_gp('fpActivarEv'),canMensajes:_gp('fpMsg'),canCampos:_gp('fpCampos')};
  const tabMap=[['ftDash','dash'],['ftIng','ingresos'],['ftIng2','ingresos2'],['ftFlota','flota'],['ftCond','conductores'],['ftAg','agenda'],['ftAn','analytics'],['ftVeh','vehiculos'],['ftAud','auditoria'],['ftPap','papelera'],['ftRec','recintos'],['ftUs','usuarios'],['ftImp','impresion'],['ftEv','eventos']];
  const tabs=tabMap.filter(([eid])=>document.getElementById(eid)?.checked).map(([,tab])=>tab);
  const oldUser=editUserId?DB.usuarios.find(x=>x.id===editUserId):null;
  // Hash password con PBKDF2 si se proporcionó
  let passwordHash=oldUser?.passwordHash||'';
  let passwordSalt=oldUser?.passwordSalt||'';
  if(pass){const result=await hashPassword(pass,null);passwordHash=result.hash;passwordSalt=result.salt;}
  const isNew=!editUserId;
  const u={
    id:editUserId||uid(),nombre:nom,username,email,
    passwordHash,passwordSalt,twoFA,
    rol:document.getElementById('fuRol').value,
    lang:document.getElementById('fuLang').value||'es',
    pin:pin||(oldUser?.pin||''),
    permisos,tabs,
    loginAttempts:oldUser?.loginAttempts||0,
    lockedUntil:oldUser?.lockedUntil||null,
    mustChangePassword:isNew?true:(oldUser?.mustChangePassword||false)
  };
  if(editUserId)DB.usuarios=DB.usuarios.map(x=>x.id===editUserId?u:x);else DB.usuarios.push(u);
  if(CU?.id===u.id){CU=u;setLang(u.lang||'es');applyLang();}
  saveDB();closeOv('mUser');renderUsuarios();toast('✅ Usuario guardado');
}

// ─── WINDOW ALIASES FOR MODAL HANDLERS ──────────────────────────────
window.closeOv = closeOv;
window.saveIngreso = _formSaveIngreso;
window.saveMov = saveMov;
window.saveCond = saveCond;
window.saveAgenda = saveAgenda;
window.saveEvento = saveEvento;
window.saveRecinto = saveRecinto;
window.saveUser = saveUser;
window.saveLN = saveLN;
window.saveEE = saveEE;
window.saveMsg = saveMsg;
window.doDelete = doDelete;
window.addRecHall = addRecHall;
window.addRecPuerta = addRecPuerta;
window.addPuertaEvento = addPuertaEvento;
window.addReqAg = addReqAg;
window.removeReqAg = removeReqAg;
window.renderAgReqs = renderAgReqs;
window.renderRecHalls = renderRecHalls;
window.renderRecPuertas = renderRecPuertas;
window.renderPuertasEv = renderPuertasEv;
window.removePuertaEv = typeof removePuertaEv!=='undefined'?removePuertaEv:(i)=>{evPuertasTemp.splice(i,1);renderPuertasEv();};
window.renderEvHallsGrid = renderEvHallsGrid;
window.updateRolPerms = updateRolPerms;
window.updTgl = updTgl;
window.syncToggleButtons = syncToggleButtons;
window.syncAgDescarga = syncAgDescarga;
window.fillPuertaSelect = fillPuertaSelect;
window.fillLangIng = fillLangIng;
window.fillIdiomaSelect = typeof fillIdiomaSelect!=='undefined'?fillIdiomaSelect:()=>{};
window.onFormEventoChange = onFormEventoChange;
window.onAgEventoChange = onAgEventoChange;
window.applyEventFieldVisibility = applyEventFieldVisibility;
window.applyIngFormFieldVisibility = applyIngFormFieldVisibility;
window.updatePhrasePreview = updatePhrasePreview;
window.setFormPrintMode = setFormPrintMode;
window.setMatTag = setMatTag;
window.getFormEvento = getFormEvento;
window.saveMatAsChofer = saveMatAsChofer;
window.clearMatField = clearMatField;
window.canEditEvento = canEditEvento;
window.blOverride = window.blOverride||(() => {});
window.captureOCR = window.captureOCR||(() => {});
window.closeCam = window.closeCam||(() => { closeOv('mCam'); });
window.confirmLang = window.confirmLang||(() => { closeOv('mLangPicker'); });
window.imprimirYGuardarConTpl = window.imprimirYGuardarConTpl||(() => {});
window.openCamModal = window.openCamModal||(() => {});
window.openGlobalSearch = window.openGlobalSearch||(() => {});
window.processCameraCapture = window.processCameraCapture||(() => {});
window.setAgDescarga = window.setAgDescarga||((v) => { syncAgDescarga(v); });
window.setToggle = window.setToggle||((id,v) => { const el=document.getElementById(id);if(el){el.value=v;syncToggleButtons();} });
window.showSyncInfo = window.showSyncInfo||(() => {});
window.useCamResult = window.useCamResult||(() => {});
window.checkPassStrength = window.checkPassStrength||(() => {});
window.removeHall = removeHall;
window.cycleEvCampo = window.cycleEvCampo||((k) => {});
window.onRecintoSelectChange = window.onRecintoSelectChange||(() => {});
window.checkMatOnInput = window.checkMatOnInput||(() => {});
window.searchMatUnified = window.searchMatUnified||(() => {});
window.searchRefAutoComplete = window.searchRefAutoComplete||(() => {});
window.searchChoferAg = window.searchChoferAg||(() => {});
window.loadEvBg = window.loadEvBg||(() => {});
window.renderTipoVehButtons = typeof renderTipoVehButtons!=='undefined'?renderTipoVehButtons:()=>{};
window.doGlobalSearch = window.doGlobalSearch||(() => {});
window.removePuertaEv = window.removePuertaEv;
window._recHallsTemp = _recHallsTemp;
window._recPuertasTemp = _recPuertasTemp;
window.evPuertasTemp = evPuertasTemp;
window.agReqsTemp = agReqsTemp;
window.filterHallSuggestions = filterHallSuggestions;
