// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/operator.js
// Modulo operador: Ingresos, Referencia, Agenda, Embalaje
// Permisos por boton configurables por admin/supervisor
// ═══════════════════════════════════════════════════════════

import { AppState }           from '../state.js';
import { localDB }            from '../db.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { to, tc }             from '../i18n.js';
import { logout }             from '../auth.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';
let _unsubQ = null;
let _activeTab = 'ingresos';
let _fieldConfig = {}; // configuracion de campos por evento
let _perms = {};       // permisos del usuario actual

// ── Inicializar ──────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  const eventCfg = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', eventCfg);
  if (user.gateId) AppState.set('currentGate', { id: user.gateId });

  // Cargar configuracion de campos y permisos del evento
  await _loadFieldConfig(user.eventId, user.uid);

  const root = document.getElementById('app-root');
  root.innerHTML = _renderShell(user, eventCfg);
  _bindEvents();
  _subscribeQueue();
  setInterval(_updateHeader, 30000);
}

// ── Cargar config de campos y permisos ───────────────────────
async function _loadFieldConfig(eventId, uid) {
  try {
    const db = getDB();
    const { doc, getDoc } = await import(`${FB_CDN}/firebase-firestore.js`);

    // Config de campos del evento
    const cfgSnap = await getDoc(doc(db, 'events', eventId, 'config', 'fields'));
    _fieldConfig = cfgSnap.exists() ? cfgSnap.data() : _defaultFieldConfig();

    // Permisos del usuario
    const opSnap = await getDoc(doc(db, 'events', eventId, 'operators', uid));
    _perms = opSnap.exists() ? (opSnap.data().perms || _defaultPerms(opSnap.data().role)) : _defaultPerms('operator');

  } catch(e) {
    _fieldConfig = _defaultFieldConfig();
    _perms = _defaultPerms('operator');
  }
}

// Configuracion de campos por defecto (todo visible)
function _defaultFieldConfig() {
  return {
    ingresos: {
      remolque:   {vis:true, req:false},
      tipoVeh:    {vis:true, req:true},
      descarga:   {vis:true, req:true},
      llamador:   {vis:true, req:false},
      empresa:    {vis:true, req:true},
      montador:   {vis:true, req:false},
      expositor:  {vis:true, req:false},
      hall:       {vis:true, req:false},
      stand:      {vis:true, req:false},
      nombre:     {vis:true, req:false},
      apellido:   {vis:true, req:false},
      telefono:   {vis:true, req:false},
      idioma:     {vis:true, req:false},
      comentario: {vis:true, req:false},
      pasaporte:  {vis:false,req:false},
      fechaNac:   {vis:false,req:false},
      pais:       {vis:false,req:false},
    },
    referencia: {
      remolque:   {vis:true, req:false},
      numEjes:    {vis:true, req:false},
      tipoMaq:    {vis:true, req:false},
      empresa:    {vis:true, req:true},
      hall:       {vis:true, req:false},
      stand:      {vis:true, req:false},
      llamador:   {vis:true, req:false},
      nombre:     {vis:true, req:false},
      apellido:   {vis:true, req:false},
      telefono:   {vis:true, req:false},
      idioma:     {vis:true, req:false},
      comentario: {vis:true, req:false},
      pasaporte:  {vis:false,req:false},
      fechaNac:   {vis:false,req:false},
    }
  };
}

function _defaultPerms(role) {
  const base = {
    canEdit:        role !== 'readonly',
    canDelete:      role === 'admin' || role === 'supervisor',
    canPrint:       true,
    canExport:      role === 'admin' || role === 'supervisor',
    canViewAgenda:  false, // operador de rampa NO ve agenda
    canEditAgenda:  role === 'admin' || role === 'supervisor',
    canViewEmbalaje:role === 'admin' || role === 'supervisor',
    canBlacklist:   role === 'admin' || role === 'supervisor',
    canConfigFields:role === 'admin',
  };
  if (role === 'admin') Object.keys(base).forEach(k => base[k] = true);
  return base;
}

// ── Shell HTML ───────────────────────────────────────────────
function _renderShell(user, event) {
  const tabs = [
    {id:'ingresos',   lbl:'Ingresos',   ico:'🚛'},
    {id:'referencia', lbl:'Referencia', ico:'📋'},
    ...((_perms.canViewAgenda)  ? [{id:'agenda',   lbl:'Agenda',   ico:'📅'}] : []),
    ...((_perms.canViewEmbalaje)? [{id:'embalaje', lbl:'Embalaje', ico:'📦'}] : []),
  ];

  return `
<div id="opWrap">

  <!-- HEADER -->
  <div class="op-hdr">
    <div class="op-logo">
      <svg width="28" height="28" viewBox="0 0 140 140">
        <rect width="140" height="140" rx="32" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <div class="op-event" id="opEventName">${safeHtml(event?.name||'BeUnifyT')}</div>
    </div>
    <div class="op-counts" id="opCounts">
      <div class="op-cnt"><span class="op-cv" id="cntHoy">0</span><span class="op-cl">Hoy</span></div>
      <div class="op-cnt"><span class="op-cv" id="cntRecinto">0</span><span class="op-cl">Recinto</span></div>
      <div class="op-cnt op-cnt-ref"><span class="op-cv" id="cntRef">0</span><span class="op-cl">Ref.</span></div>
    </div>
    <div class="op-hdr-r">
      <div class="sync-pill" id="syncPill"><div class="sd sd-g" id="syncDot"></div><span id="syncTxt">OK</span></div>
      <button class="btn-ico" id="btnSearch" title="Buscar matricula">🔍</button>
      <button class="btn-ico" id="btnMenu">☰</button>
    </div>
  </div>

  <!-- TABS -->
  <div class="op-tabs">
    ${tabs.map(t=>`<button class="op-tab${t.id===_activeTab?' active':''}" data-tab="${t.id}">${t.ico} ${t.lbl}</button>`).join('')}
  </div>

  <!-- BUSCADOR RAPIDO (oculto por defecto) -->
  <div id="searchBar" style="display:none;padding:6px 10px;background:var(--bg2);border-bottom:1px solid var(--border)">
    <input type="text" id="quickSearch" placeholder="Buscar matricula, empresa, referencia..."
      autocomplete="off" style="text-transform:uppercase;font-size:14px"
      oninput="window._opSearch(this.value)">
    <div id="quickResults" style="margin-top:6px"></div>
  </div>

  <!-- CONTENIDO -->
  <div id="opContent" class="op-content"></div>

  <!-- MENU LATERAL -->
  <div id="opOverlay" class="ov-side" style="display:none" onclick="if(event.target===this)this.style.display='none'">
    <div class="side-menu">
      <div class="side-user">
        <div class="side-name">${safeHtml(user.name)}</div>
        <div class="side-role">${safeHtml(user.role)} · ${safeHtml(user.gateId||'—')}</div>
        <div class="side-event">${safeHtml(event?.name||'—')}</div>
      </div>
      ${_perms.canConfigFields?`<button class="side-item" id="btnConfigFields">⚙️ Configurar campos</button>`:''}
      ${_perms.canExport?`<button class="side-item" id="btnExport">📥 Exportar datos</button>`:''}
      ${_perms.canBlacklist?`<button class="side-item" id="btnBlacklist">⛔ Blacklist</button>`:''}
      <button class="side-item" id="btnTema">🎨 Cambiar tema</button>
      <button class="side-item" id="btnLogout">🚪 Cerrar sesion</button>
    </div>
  </div>

</div>

<style>
#opWrap{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}

/* Header */
.op-hdr{
  display:flex;align-items:center;gap:6px;padding:0 10px;height:48px;
  background:var(--bg2);border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;box-shadow:var(--sh)
}
.op-logo{display:flex;align-items:center;gap:7px;flex-shrink:0}
.op-event{font-size:12px;font-weight:700;color:var(--text);max-width:100px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.op-counts{display:flex;gap:5px;flex:1;justify-content:center}
.op-cnt{display:flex;flex-direction:column;align-items:center;
  padding:2px 9px;border:1.5px solid var(--border2);
  border-radius:var(--r);background:var(--bg3);min-width:42px}
.op-cnt-ref{border-color:var(--amber)}
.op-cv{font-size:15px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1}
.op-cl{font-size:8px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:1px}
.op-hdr-r{display:flex;align-items:center;gap:4px;flex-shrink:0}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;
  border-radius:20px;border:1.5px solid var(--border);background:var(--bg3);
  font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}
.sd-y{background:#f59e0b}.sd-r{background:var(--red)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.btn-ico{background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);padding:4px 9px;font-size:15px;cursor:pointer;color:var(--text)}

/* Tabs */
.op-tabs{display:flex;gap:2px;padding:4px 8px;background:var(--bg3);
  border-bottom:1px solid var(--border);
  position:sticky;top:48px;z-index:99;overflow-x:auto;scrollbar-width:none}
.op-tab{padding:5px 14px;border-radius:20px;background:transparent;
  color:var(--text3);font-size:12px;font-weight:500;border:none;
  white-space:nowrap;cursor:pointer;transition:all .15s;font-family:inherit}
.op-tab.active{background:linear-gradient(90deg,var(--blue),#60a5fa);color:#fff;font-weight:700}
.op-tab[data-tab="referencia"].active{background:linear-gradient(90deg,var(--amber),#fbbf24)}
.op-tab[data-tab="agenda"].active{background:linear-gradient(90deg,var(--green),#34d399)}
.op-tab[data-tab="embalaje"].active{background:linear-gradient(90deg,var(--purple),#a78bfa)}
.op-tab:hover:not(.active){background:var(--bg4)}

/* Content */
.op-content{flex:1;padding:10px;overflow-y:auto}

/* Form card */
.form-card{background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r2);padding:12px;margin-bottom:10px}
.form-card.ref-card{border-color:var(--amber);border-left:3px solid var(--amber)}
.form-card.ag-card{border-color:var(--green);border-left:3px solid var(--green)}
.form-title{font-size:11px;font-weight:800;color:var(--text3);
  text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;
  display:flex;align-items:center;gap:6px}
.form-title span{color:var(--text)}

/* Grid de campos */
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:7px}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:7px}
.fg1{margin-bottom:7px}
.span2{grid-column:1/-1}
.fg-item{display:flex;flex-direction:column;gap:3px}
.flbl{font-size:11px;font-weight:700;color:var(--text2)}
.freq{color:var(--red)}
.mat-field input{
  font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:900;
  letter-spacing:3px;text-transform:uppercase;color:var(--text)
}
.ref-field input{
  font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;
  text-transform:uppercase;color:var(--amber)
}

/* Toggle buttons tipo/descarga */
.toggle-group{display:flex;gap:4px}
.tgl-btn{
  flex:1;padding:7px 4px;border-radius:var(--r);
  border:1.5px solid var(--border2);background:var(--bg3);
  color:var(--text2);font-size:11px;font-weight:600;cursor:pointer;
  text-align:center;transition:all .15s;font-family:inherit
}
.tgl-btn.sel{border-color:var(--blue);background:var(--bll);color:var(--blue);font-weight:700}
.tgl-btn.sel-amber{border-color:var(--amber);background:var(--all);color:var(--amber);font-weight:700}
.tgl-btn.sel-red{border-color:var(--red);background:var(--rll);color:var(--red);font-weight:700}
.tgl-btn.sel-green{border-color:var(--green);background:var(--gll);color:var(--green);font-weight:700}

/* Separador sección */
.section-sep{
  grid-column:1/-1;border-top:1.5px solid var(--border2);
  margin:4px 0;padding-top:8px;
  font-size:10px;font-weight:800;color:var(--text3);
  text-transform:uppercase;letter-spacing:.1em
}

/* Boton registrar */
.btn-registrar{
  width:100%;padding:13px;border-radius:var(--r);border:none;
  background:linear-gradient(90deg,var(--green),#34d399);
  color:#fff;font-size:15px;font-weight:800;cursor:pointer;
  margin-top:4px;transition:opacity .15s;font-family:inherit;
  letter-spacing:.02em
}
.btn-registrar.ref{background:linear-gradient(90deg,var(--amber),#fbbf24)}
.btn-registrar.ag{background:linear-gradient(90deg,#8b5cf6,#a78bfa)}
.btn-registrar:disabled{opacity:.5;cursor:not-allowed}

/* BL warning */
.bl-warn{
  background:var(--rll);border:2px solid var(--red);
  border-radius:var(--r);padding:10px 12px;margin-bottom:8px;
  font-size:13px;font-weight:700;color:var(--red)
}

/* Cola */
.queue-lbl{font-size:10px;font-weight:800;color:var(--text3);
  text-transform:uppercase;letter-spacing:.08em;
  margin-bottom:6px;margin-top:4px;
  display:flex;align-items:center;justify-content:space-between}
.q-list{display:flex;flex-direction:column;gap:5px}
.q-item{
  background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r);padding:9px 11px;
  display:flex;align-items:center;gap:9px;cursor:pointer;
  transition:border-color .15s
}
.q-item:hover{border-color:var(--blue)}
.q-item.en-recinto{border-left:2.5px solid var(--green)}
.q-item.referencia{border-left:2.5px solid var(--amber)}
.q-item.salido{opacity:.5}
.q-mat{font-size:14px;font-weight:900;font-family:'JetBrains Mono',monospace;
  letter-spacing:2px;flex-shrink:0;min-width:80px}
.q-ref{font-size:10px;font-weight:700;color:var(--amber);
  font-family:'JetBrains Mono',monospace;letter-spacing:1px}
.q-info{flex:1;min-width:0}
.q-emp{font-size:12px;font-weight:600;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.q-time{font-size:10px;color:var(--text3)}
.q-badge{font-size:9px;font-weight:800;padding:2px 7px;
  border-radius:10px;flex-shrink:0;white-space:nowrap}
.q-badge.en{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.q-badge.ref{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.q-badge.sal{background:var(--bg3);color:var(--text3)}
.q-btn-sal{padding:4px 9px;border-radius:var(--r);
  border:1px solid var(--border2);background:var(--bg3);
  color:var(--text2);font-size:10px;cursor:pointer;font-family:inherit;
  flex-shrink:0;font-weight:700}
.q-btn-sal:hover{background:var(--blue);color:#fff;border-color:var(--blue)}
.q-btn-print{padding:4px 8px;border-radius:var(--r);
  border:1px solid var(--border2);background:var(--bg3);
  color:var(--text3);font-size:11px;cursor:pointer;font-family:inherit;flex-shrink:0}

/* Agenda items */
.ag-item{
  background:var(--bg2);border:1.5px solid var(--border);
  border-left:3px solid var(--green);
  border-radius:var(--r);padding:9px 11px;margin-bottom:5px;cursor:pointer
}
.ag-item.matched{border-left-color:var(--blue)}
.ag-item.completed{border-left-color:var(--text3);opacity:.6}
.ag-ref{font-size:12px;font-weight:900;font-family:'JetBrains Mono',monospace;
  letter-spacing:1px;color:var(--amber)}
.ag-emp{font-size:13px;font-weight:700;color:var(--text);margin-top:2px}
.ag-det{font-size:11px;color:var(--text3);margin-top:2px}
.ag-status{font-size:10px;font-weight:700;padding:2px 7px;
  border-radius:10px;display:inline-block;margin-top:4px}
.ag-status.pend{background:var(--all);color:var(--amber)}
.ag-status.match{background:var(--bll);color:var(--blue)}
.ag-status.done{background:var(--bg3);color:var(--text3)}

/* Side menu */
.ov-side{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;
  display:flex;justify-content:flex-end}
.side-menu{background:var(--bg2);width:260px;height:100%;
  padding:20px 14px;display:flex;flex-direction:column;gap:4px;
  overflow-y:auto}
.side-user{padding-bottom:14px;border-bottom:1px solid var(--border);margin-bottom:8px}
.side-name{font-size:15px;font-weight:700;color:var(--text)}
.side-role{font-size:12px;color:var(--text3);margin-top:2px}
.side-event{font-size:11px;color:var(--blue);margin-top:2px}
.side-item{padding:11px 12px;border-radius:var(--r);border:none;
  background:transparent;color:var(--text);font-size:14px;cursor:pointer;
  text-align:left;width:100%;transition:background .15s;font-family:inherit}
.side-item:hover{background:var(--bg3)}
</style>`;
}

// ═══════════════════════════════════════════════════════════
// TAB INGRESOS
// ═══════════════════════════════════════════════════════════
function _renderIngresos() {
  const cfg = _fieldConfig.ingresos || _defaultFieldConfig().ingresos;
  return `
<div id="tabIngresos">
  <div class="form-card">
    <div class="form-title">🚛 <span>Registrar Ingreso</span></div>

    <!-- MATRICULA + REMOLQUE -->
    <div class="fg2">
      <div class="fg-item span2 mat-field">
        <label class="flbl">Matricula <span class="freq">*</span></label>
        <input type="text" id="iMat" placeholder="🔍 Matricula o nombre..." autocomplete="off"
          oninput="this.value=this.value.toUpperCase();window._checkBL(this.value,'i')"
          onkeydown="if(event.key==='Enter')window._iSubmit()">
      </div>
      ${_fld(cfg,'remolque',`<div class="fg-item"><label class="flbl">Remolque</label>
        <input type="text" id="iRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    </div>

    <!-- BL WARNING -->
    <div id="iBlWarn" class="bl-warn" style="display:none"></div>

    <!-- TIPO VEHICULO -->
    ${_fld(cfg,'tipoVeh',`<div class="fg-item fg1">
      <label class="flbl">Tipo vehiculo <span class="freq">*</span></label>
      <div class="toggle-group" id="iTipoGroup">
        <button class="tgl-btn" data-v="furgoneta" onclick="window._tgl('iTipo',this,'i')">🚐 A Furgoneta</button>
        <button class="tgl-btn" data-v="camion"    onclick="window._tgl('iTipo',this,'i')">🚚 B Camion</button>
      </div>
      <input type="hidden" id="iTipo">
    </div>`)}

    <!-- TIPO DESCARGA -->
    ${_fld(cfg,'descarga',`<div class="fg-item fg1">
      <label class="flbl">Servicio descarga/carga <span class="freq">*</span></label>
      <div class="toggle-group" id="iDescargaGroup">
        <button class="tgl-btn" data-v="mano"      onclick="window._tgl('iDescarga',this,'i')">🤾 Handball</button>
        <button class="tgl-btn" data-v="forklift"  onclick="window._tgl('iDescarga',this,'i')">🏗 Forklift → Ref</button>
      </div>
      <input type="hidden" id="iDescarga">
    </div>`)}

    <!-- DATOS SERVICIO -->
    <div class="fg2">
      ${_fld(cfg,'empresa',   `<div class="fg-item"><label class="flbl">Empresa${_req(cfg,'empresa')}</label><input type="text" id="iEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'montador',  `<div class="fg-item"><label class="flbl">Montador</label><input type="text" id="iMontador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'expositor', `<div class="fg-item"><label class="flbl">Expositor</label><input type="text" id="iExpositor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'llamador',  `<div class="fg-item"><label class="flbl">Llamador</label><input type="text" id="iLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    </div>

    <!-- HALL / STAND -->
    <div class="fg3">
      ${_fld(cfg,'hall',  `<div class="fg-item"><label class="flbl">Hall / Pabellon</label><input type="text" id="iHall" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'stand', `<div class="fg-item"><label class="flbl">Stand</label><input type="text" id="iStand" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'idioma',`<div class="fg-item"><label class="flbl">Idioma conductor</label><select id="iIdioma">${_idiomaOpts()}</select></div>`)}
    </div>

    <!-- DATOS CONDUCTOR -->
    <div class="section-sep">👤 Conductor</div>
    <div class="fg2">
      ${_fld(cfg,'nombre',   `<div class="fg-item"><label class="flbl">Nombre</label><input type="text" id="iNom" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'apellido', `<div class="fg-item"><label class="flbl">Apellido</label><input type="text" id="iApe" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'telefono', `<div class="fg-item"><label class="flbl">Telefono</label><div style="display:flex;gap:4px"><input type="text" id="iTelP" placeholder="+34" style="width:70px;font-family:var(--font-mono,monospace);flex-shrink:0"><input type="tel" id="iTel"></div></div>`)}
      ${_fld(cfg,'pasaporte',`<div class="fg-item"><label class="flbl">Pasaporte / DNI</label><input type="text" id="iPas" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'fechaNac', `<div class="fg-item"><label class="flbl">Fecha nacimiento</label><input type="date" id="iFechaNac"></div>`)}
      ${_fld(cfg,'pais',     `<div class="fg-item"><label class="flbl">Pais</label><input type="text" id="iPais"></div>`)}
      ${_fld(cfg,'comentario',`<div class="fg-item span2"><label class="flbl">Comentario</label><textarea id="iComent" rows="2"></textarea></div>`)}
    </div>

    <button class="btn-registrar" id="btnIng" onclick="window._iSubmit()">✅ Registrar Ingreso</button>
  </div>

  <!-- COLA -->
  <div class="queue-lbl">
    <span>Ultimas entradas</span>
    <span id="queueCount" style="font-size:11px;color:var(--text3)"></span>
  </div>
  <div class="q-list" id="queueList">
    <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Cargando...</div>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// TAB REFERENCIA
// ═══════════════════════════════════════════════════════════
function _renderReferencia() {
  const cfg = _fieldConfig.referencia || _defaultFieldConfig().referencia;
  return `
<div id="tabReferencia">
  <div class="form-card ref-card">
    <div class="form-title" style="color:var(--amber)">📋 <span>Registrar Referencia</span></div>

    <!-- REFERENCIA (campo principal) -->
    <div class="fg1 ref-field">
      <label class="flbl">Referencia / Booking <span class="freq">*</span></label>
      <div style="position:relative">
        <input type="text" id="rRef" placeholder="REF-XXXXXX" autocomplete="off"
          style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--amber)"
          oninput="this.value=this.value.toUpperCase();window._searchRef(this.value)">
        <div id="rRefResults" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:50;
          background:var(--bg2);border:1.5px solid var(--amber);border-radius:0 0 var(--r) var(--r);
          max-height:200px;overflow-y:auto;box-shadow:var(--sh2)"></div>
      </div>
      <div id="rRefMatch" style="display:none;margin-top:5px;padding:7px 10px;
        background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);
        font-size:12px;font-weight:700;color:var(--green)"></div>
    </div>

    <!-- MATRICULA -->
    <div class="fg2">
      <div class="fg-item mat-field">
        <label class="flbl">Matricula <span style="color:var(--text3);font-weight:400">(puede no estar precargada)</span></label>
        <input type="text" id="rMat" placeholder="Matricula del vehiculo" autocomplete="off"
          style="text-transform:uppercase"
          oninput="this.value=this.value.toUpperCase();window._checkBL(this.value,'r')">
      </div>
      ${_fld(cfg,'remolque',`<div class="fg-item"><label class="flbl">Remolque</label><input type="text" id="rRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    </div>

    <!-- BL WARNING -->
    <div id="rBlWarn" class="bl-warn" style="display:none"></div>

    <!-- TIPO VEHICULO / MAQUINARIA -->
    <div class="fg2">
      ${_fld(cfg,'numEjes',`<div class="fg-item"><label class="flbl">Numero de ejes</label>
        <div class="toggle-group">
          <button class="tgl-btn" data-v="5"  onclick="window._tgl('rEjes',this,'r')">5 ejes</button>
          <button class="tgl-btn" data-v="6"  onclick="window._tgl('rEjes',this,'r')">6 ejes</button>
          <button class="tgl-btn" data-v="7+" onclick="window._tgl('rEjes',this,'r')">7+ ejes</button>
        </div>
        <input type="hidden" id="rEjes"></div>`)}
      ${_fld(cfg,'tipoMaq',`<div class="fg-item"><label class="flbl">Maquinaria</label>
        <div class="toggle-group">
          <button class="tgl-btn" data-v="forklift"  onclick="window._tgl('rMaq',this,'r')">🏗 Forklift</button>
          <button class="tgl-btn" data-v="grua"      onclick="window._tgl('rMaq',this,'r')">🏗 Grua</button>
          <button class="tgl-btn" data-v="plataforma" onclick="window._tgl('rMaq',this,'r')">🔼 Plataforma</button>
        </div>
        <input type="hidden" id="rMaq"></div>`)}
    </div>

    <!-- DATOS SERVICIO -->
    <div class="fg2">
      ${_fld(cfg,'empresa',  `<div class="fg-item"><label class="flbl">Empresa${_req(cfg,'empresa')}</label><input type="text" id="rEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'llamador', `<div class="fg-item"><label class="flbl">Llamador</label><input type="text" id="rLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'hall',     `<div class="fg-item"><label class="flbl">Hall / Pabellon</label><input type="text" id="rHall" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'stand',    `<div class="fg-item"><label class="flbl">Stand</label><input type="text" id="rStand" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>`)}
    </div>

    <!-- CONDUCTOR -->
    <div class="section-sep">👤 Conductor</div>
    <div class="fg2">
      ${_fld(cfg,'nombre',   `<div class="fg-item"><label class="flbl">Nombre</label><input type="text" id="rNom" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'apellido', `<div class="fg-item"><label class="flbl">Apellido</label><input type="text" id="rApe" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'telefono', `<div class="fg-item"><label class="flbl">Telefono</label><div style="display:flex;gap:4px"><input type="text" id="rTelP" placeholder="+34" style="width:70px;flex-shrink:0"><input type="tel" id="rTel"></div></div>`)}
      ${_fld(cfg,'idioma',   `<div class="fg-item"><label class="flbl">Idioma</label><select id="rIdioma">${_idiomaOpts()}</select></div>`)}
      ${_fld(cfg,'pasaporte',`<div class="fg-item"><label class="flbl">Pasaporte / DNI</label><input type="text" id="rPas" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fld(cfg,'fechaNac', `<div class="fg-item"><label class="flbl">Fecha nacimiento</label><input type="date" id="rFechaNac"></div>`)}
      ${_fld(cfg,'comentario',`<div class="fg-item span2"><label class="flbl">Comentario</label><textarea id="rComent" rows="2"></textarea></div>`)}
    </div>

    <button class="btn-registrar ref" id="btnRef" onclick="window._rSubmit()">📋 Registrar Referencia</button>
  </div>

  <!-- COLA REFERENCIAS -->
  <div class="queue-lbl">
    <span>Referencias recientes</span>
    <span id="refQueueCount" style="font-size:11px;color:var(--text3)"></span>
  </div>
  <div class="q-list" id="refQueueList">
    <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Cargando...</div>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// TAB AGENDA (solo admin/supervisor)
// ═══════════════════════════════════════════════════════════
function _renderAgenda() {
  return `
<div id="tabAgenda">
  <div class="form-card ag-card">
    <div class="form-title" style="color:var(--green)">📅 <span>Buscar en Agenda</span></div>
    <div class="fg1">
      <label class="flbl">Buscar por referencia, empresa o matricula</label>
      <input type="text" id="agSearch" placeholder="REF-, empresa, matricula..."
        autocomplete="off" style="text-transform:uppercase"
        oninput="this.value=this.value.toUpperCase();window._searchAgenda(this.value)">
    </div>
    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
      <button class="tgl-btn" id="agFiltPend" onclick="window._agFilter('pendiente')" style="flex:0 0 auto;padding:5px 12px">⏳ Pendientes</button>
      <button class="tgl-btn" id="agFiltHoy"  onclick="window._agFilter('hoy')"       style="flex:0 0 auto;padding:5px 12px">📅 Hoy</button>
      <button class="tgl-btn" id="agFiltTodo" onclick="window._agFilter('todos')"     style="flex:0 0 auto;padding:5px 12px">Todos</button>
      ${_perms.canEditAgenda?`<button class="tgl-btn sel-green" onclick="window._openAddAgenda()" style="flex:0 0 auto;padding:5px 12px;margin-left:auto">+ Anadir servicio</button>`:''}
    </div>
  </div>

  <div class="queue-lbl">
    <span>Servicios en agenda</span>
    <span id="agCount" style="font-size:11px;color:var(--text3)"></span>
  </div>
  <div id="agendaList">
    <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Cargando agenda...</div>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// TAB EMBALAJE
// ═══════════════════════════════════════════════════════════
function _renderEmbalaje() {
  return `
<div id="tabEmbalaje">
  <div class="form-card" style="border-left:3px solid var(--purple)">
    <div class="form-title" style="color:var(--purple)">📦 <span>Registrar Embalaje</span></div>
    <div class="fg2">
      <div class="fg-item mat-field">
        <label class="flbl">Matricula <span class="freq">*</span></label>
        <input type="text" id="eMat" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="fg-item">
        <label class="flbl">Conductor fijo</label>
        <input type="text" id="eConductor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="fg-item span2">
        <label class="flbl">Tipo movimiento <span class="freq">*</span></label>
        <div class="toggle-group">
          <button class="tgl-btn" data-v="retirada"   onclick="window._tgl('eTipo',this,'e')">📤 Retirada vacios</button>
          <button class="tgl-btn" data-v="devolucion" onclick="window._tgl('eTipo',this,'e')">📥 Devolucion material</button>
        </div>
        <input type="hidden" id="eTipo">
      </div>
      <div class="fg-item">
        <label class="flbl">Material</label>
        <input type="text" id="eMaterial" placeholder="Pales, jaulas, cajas...">
      </div>
      <div class="fg-item">
        <label class="flbl">Cantidad</label>
        <input type="number" id="eCantidad" min="1" placeholder="0">
      </div>
      <div class="fg-item">
        <label class="flbl">Origen</label>
        <input type="text" id="eOrigen" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="fg-item">
        <label class="flbl">Destino</label>
        <input type="text" id="eDestino" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()">
      </div>
      <div class="fg-item span2">
        <label class="flbl">Incidencia / Nota</label>
        <textarea id="eNota" rows="2"></textarea>
      </div>
    </div>
    <button class="btn-registrar" style="background:linear-gradient(90deg,var(--purple),#a78bfa)" onclick="window._eSubmit()">📦 Registrar Movimiento</button>
  </div>
  <div class="queue-lbl"><span>Movimientos de embalaje</span></div>
  <div class="q-list" id="embList">
    <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Sin movimientos registrados</div>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// HELPERS FORMULARIO
// ═══════════════════════════════════════════════════════════
function _fld(cfg, key, html) {
  if (!cfg[key] || cfg[key].vis === false) return '';
  return html;
}
function _req(cfg, key) {
  return cfg[key]?.req ? ' <span class="freq">*</span>' : '';
}
function _idiomaOpts() {
  const langs = ['es','en','fr','de','it','pt','nl','pl','ro','ru','uk','cs','sk','hu','bg','hr','tr','ar','zh'];
  const names = {es:'Espanol',en:'English',fr:'Francais',de:'Deutsch',it:'Italiano',
    pt:'Portugues',nl:'Nederlands',pl:'Polski',ro:'Romana',ru:'Ruso',uk:'Ucraniano',
    cs:'Checo',sk:'Eslovaco',hu:'Hungaro',bg:'Bulgaro',hr:'Croata',tr:'Turco',ar:'Arabe',zh:'Chino'};
  return `<option value="">--</option>` + langs.map(l=>`<option value="${l}">${names[l]||l}</option>`).join('');
}

// ═══════════════════════════════════════════════════════════
// SUSCRIPCION FIRESTORE
// ═══════════════════════════════════════════════════════════
function _subscribeQueue() {
  const user = AppState.get('currentUser');
  if (_unsubQ) _unsubQ();
  _unsubQ = fsGate.subscribeQueue(
    user.eventId,
    user.gateId || 'puerta-1',
    (entries) => _renderQueueList(entries),
    (err) => { console.error('[Op] Queue error:', err); _setSyncStatus('error'); }
  );
  _setSyncStatus('ok');
}

function _renderQueueList(entries) {
  // Actualizar header
  const hoy = new Date().toDateString();
  const cntH = entries.filter(e => new Date(e.ts).toDateString()===hoy).length;
  const cntR = entries.filter(e => !e.salida).length;
  const cntRef = entries.filter(e => e.tipo==='referencia' && !e.salida).length;
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('cntHoy', cntH); set('cntRecinto', cntR); set('cntRef', cntRef);

  if (_activeTab !== 'ingresos' && _activeTab !== 'referencia') return;

  const listId  = _activeTab === 'referencia' ? 'refQueueList' : 'queueList';
  const countId = _activeTab === 'referencia' ? 'refQueueCount' : 'queueCount';
  const list    = document.getElementById(listId);
  const cnt     = document.getElementById(countId);
  if (!list) return;

  const filtered = _activeTab === 'referencia'
    ? entries.filter(e => e.tipo === 'referencia')
    : entries.filter(e => e.tipo !== 'referencia');

  if (cnt) cnt.textContent = `${filtered.length} registros`;

  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Sin entradas registradas</div>`;
    return;
  }

  list.innerHTML = filtered.map(e => `
    <div class="q-item ${e.salida?'salido':e.tipo==='referencia'?'referencia':'en-recinto'}"
      data-id="${e.id}">
      <div>
        <div class="q-mat">${safeHtml(e.matricula||'—')}</div>
        ${e.referencia?`<div class="q-ref">${safeHtml(e.referencia)}</div>`:''}
      </div>
      <div class="q-info">
        <div class="q-emp">${safeHtml(e.empresa||e.conductor||'—')}</div>
        <div class="q-time">${formatDateTime(e.ts)}${e.hall?' · '+safeHtml(e.hall):''}</div>
      </div>
      <div class="q-badge ${e.salida?'sal':e.tipo==='referencia'?'ref':'en'}">
        ${e.salida?'Salida':e.tipo==='referencia'?'Ref':'En recinto'}
      </div>
      ${!e.salida&&_perms.canEdit?`<button class="q-btn-sal" onclick="window._regSalida('${e.id}')">Salida</button>`:''}
      ${_perms.canPrint?`<button class="q-btn-print" onclick="window._printEntry('${e.id}')">🖨</button>`:''}
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════
// SUBMIT INGRESOS
// ═══════════════════════════════════════════════════════════
window._iSubmit = async function() {
  const mat = normalizePlate(document.getElementById('iMat')?.value);
  if (!mat) { toast('La matricula es obligatoria', 'var(--red)'); return; }

  const descarga = document.getElementById('iDescarga')?.value;
  if (descarga === 'forklift') {
    if (!confirm('Este vehiculo usa forklift. Deberia pasar por Referencia.\n\nRegistrar como Ingreso de todos modos?')) return;
  }

  const user = AppState.get('currentUser');
  const btn  = document.getElementById('btnIng');
  if (btn) { btn.disabled=true; btn.textContent='Registrando...'; }

  try {
    const entry = {
      matricula:  mat,
      remolque:   _v('iRem'),
      tipo:       _v('iTipo') || 'ingreso',
      tipoIngreso:'ingreso',
      descarga:   descarga,
      empresa:    _v('iEmp'),
      montador:   _v('iMontador'),
      expositor:  _v('iExpositor'),
      llamador:   _v('iLlamador'),
      hall:       _v('iHall'),
      stand:      _v('iStand'),
      idioma:     _v('iIdioma'),
      conductor:  (_v('iNom')+' '+_v('iApe')).trim(),
      nombre:     _v('iNom'),
      apellido:   _v('iApe'),
      telPais:    _v('iTelP'),
      telefono:   _v('iTel'),
      pasaporte:  _v('iPas'),
      fechaNac:   _v('iFechaNac'),
      pais:       _v('iPais'),
      comentario: _v('iComent'),
      operadorId: user.uid,
      operador:   user.name,
    };

    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', entry);
    _clearForm('i');
    toast(`✅ ${mat} — Ingreso registrado`, 'var(--green)');

  } catch(err) {
    console.error('[Op] Error ingreso:', err);
    toast('Error al registrar ingreso', 'var(--red)');
  } finally {
    if (btn) { btn.disabled=false; btn.textContent='✅ Registrar Ingreso'; }
  }
};

// ═══════════════════════════════════════════════════════════
// SUBMIT REFERENCIA
// ═══════════════════════════════════════════════════════════
window._rSubmit = async function() {
  const ref = (_v('rRef')||'').trim().toUpperCase();
  if (!ref) { toast('La referencia es obligatoria', 'var(--red)'); return; }

  const mat = normalizePlate(document.getElementById('rMat')?.value || '');
  const user = AppState.get('currentUser');
  const btn  = document.getElementById('btnRef');
  if (btn) { btn.disabled=true; btn.textContent='Registrando...'; }

  try {
    const entry = {
      matricula:  mat || '—',
      referencia: ref,
      remolque:   _v('rRem'),
      tipo:       'referencia',
      numEjes:    _v('rEjes'),
      maquinaria: _v('rMaq'),
      empresa:    _v('rEmp'),
      llamador:   _v('rLlamador'),
      hall:       _v('rHall'),
      stand:      _v('rStand'),
      conductor:  (_v('rNom')+' '+_v('rApe')).trim(),
      nombre:     _v('rNom'),
      apellido:   _v('rApe'),
      telPais:    _v('rTelP'),
      telefono:   _v('rTel'),
      idioma:     _v('rIdioma'),
      pasaporte:  _v('rPas'),
      fechaNac:   _v('rFechaNac'),
      comentario: _v('rComent'),
      operadorId: user.uid,
      operador:   user.name,
      matAsociada: mat ? true : false,
    };

    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', entry);

    // Si tiene matricula nueva, actualizar la referencia en agenda
    if (mat) _updateAgendaMatch(ref, mat);

    _clearForm('r');
    toast(`📋 Ref ${ref}${mat?' · '+mat:''} registrada`, 'var(--amber)');

  } catch(err) {
    console.error('[Op] Error referencia:', err);
    toast('Error al registrar referencia', 'var(--red)');
  } finally {
    if (btn) { btn.disabled=false; btn.textContent='📋 Registrar Referencia'; }
  }
};

// ═══════════════════════════════════════════════════════════
// SUBMIT EMBALAJE
// ═══════════════════════════════════════════════════════════
window._eSubmit = async function() {
  const mat  = normalizePlate(document.getElementById('eMat')?.value);
  const tipo = _v('eTipo');
  if (!mat)  { toast('La matricula es obligatoria', 'var(--red)'); return; }
  if (!tipo) { toast('Selecciona el tipo de movimiento', 'var(--red)'); return; }

  const user = AppState.get('currentUser');
  try {
    const entry = {
      matricula:  mat,
      tipo:       'embalaje',
      tipoMov:    tipo,
      conductor:  _v('eConductor'),
      material:   _v('eMaterial'),
      cantidad:   _v('eCantidad'),
      origen:     _v('eOrigen'),
      destino:    _v('eDestino'),
      nota:       _v('eNota'),
      operadorId: user.uid,
      operador:   user.name,
    };
    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', entry);
    _clearForm('e');
    toast(`📦 ${mat} — ${tipo} registrado`, 'var(--purple)');
  } catch(err) {
    toast('Error al registrar movimiento', 'var(--red)');
  }
};

// ═══════════════════════════════════════════════════════════
// REGISTRAR SALIDA
// ═══════════════════════════════════════════════════════════
window._regSalida = async function(entryId) {
  if (!confirm('Confirmar salida del vehiculo?')) return;
  const user = AppState.get('currentUser');
  try {
    await fsGate.registerExit(user.eventId, user.gateId||'puerta-1', entryId, {
      operadorSalida: user.name
    });
    toast('Salida registrada', 'var(--blue)', 1500);
  } catch(err) {
    toast('Error al registrar salida', 'var(--red)');
  }
};

// ═══════════════════════════════════════════════════════════
// BUSQUEDA Y BLACKLIST
// ═══════════════════════════════════════════════════════════
window._checkBL = async function(mat, prefix) {
  if (!mat || mat.length < 4) return;
  const warnId = prefix==='i' ? 'iBlWarn' : 'rBlWarn';
  const warn = document.getElementById(warnId);
  if (!warn) return;
  // Verificar blacklist en Firestore
  try {
    const db = getDB();
    const user = AppState.get('currentUser');
    const { collection, query, where, getDocs } = await import(`${FB_CDN}/firebase-firestore.js`);
    const q = query(
      collection(db, 'events', user.eventId, 'blacklist'),
      where('matricula', '==', mat.toUpperCase().trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const bl = snap.docs[0].data();
      warn.innerHTML = `⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matricula en lista negra')}`;
      warn.style.display = 'block';
    } else {
      warn.style.display = 'none';
    }
  } catch(e) { warn.style.display = 'none'; }
};

window._opSearch = async function(q) {
  const res = document.getElementById('quickResults');
  if (!res || !q || q.length < 2) { if(res) res.innerHTML=''; return; }
  const user = AppState.get('currentUser');
  const entries = await fsGate.searchPlate(user.eventId, q);
  if (!entries.length) { res.innerHTML=`<div style="color:var(--text3);font-size:12px;padding:8px">Sin resultados para "${q}"</div>`; return; }
  res.innerHTML = entries.slice(0,10).map(e=>`
    <div style="padding:7px 10px;border-bottom:0.5px solid var(--border);font-size:12px">
      <span style="font-weight:700;font-family:'JetBrains Mono',monospace">${safeHtml(e.matricula)}</span>
      ${e.referencia?`<span style="color:var(--amber);margin-left:8px">${safeHtml(e.referencia)}</span>`:''}
      <span style="color:var(--text3);margin-left:8px">${safeHtml(e.empresa||'—')}</span>
      <span style="float:right;color:${e.salida?'var(--text3)':'var(--green)'};font-weight:700">
        ${e.salida?'Salida':'En recinto'}
      </span>
    </div>`).join('');
};

window._searchRef = async function(val) {
  if (!val || val.length < 3) return;
  const res = document.getElementById('rRefResults');
  const match = document.getElementById('rRefMatch');
  if (!res || !match) return;

  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { collection, query, where, getDocs, orderBy, limit } = await import(`${FB_CDN}/firebase-firestore.js`);
    const q = query(
      collection(db, 'events', user.eventId, 'agenda'),
      where('referencia', '>=', val),
      where('referencia', '<=', val + '\uf8ff'),
      limit(5)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(d=>({id:d.id,...d.data()}));
      res.style.display='block';
      res.innerHTML = items.map(item=>`
        <div onclick="window._fillRefFromAgenda(${JSON.stringify(item).replace(/"/g,'&quot;')})"
          style="padding:8px 10px;cursor:pointer;border-bottom:0.5px solid var(--border);font-size:12px;
          background:var(--bg2)">
          <div style="font-weight:700;color:var(--amber)">${safeHtml(item.referencia)}</div>
          <div style="color:var(--text2)">${safeHtml(item.empresa||'—')} · ${safeHtml(item.hall||'')} ${safeHtml(item.stand||'')}</div>
        </div>`).join('');
    } else {
      res.style.display='none';
      match.style.display='none';
    }
  } catch(e) { res.style.display='none'; }
};

window._fillRefFromAgenda = function(item) {
  const setVal = (id, val) => { const el=document.getElementById(id); if(el&&val) el.value=val; };
  setVal('rRef', item.referencia);
  setVal('rEmp', item.empresa);
  setVal('rHall', item.hall);
  setVal('rStand', item.stand);
  setVal('rNom', item.conductor?.split(' ')[0]);
  setVal('rApe', item.conductor?.split(' ').slice(1).join(' '));
  const res = document.getElementById('rRefResults');
  const match = document.getElementById('rRefMatch');
  if (res) res.style.display='none';
  if (match) {
    match.innerHTML = `✅ Referencia encontrada en agenda · ${safeHtml(item.empresa||'')}`;
    match.style.display='block';
  }
};

window._searchAgenda = async function(q) {
  const list = document.getElementById('agendaList');
  if (!list) return;
  await _loadAgenda(q);
};

window._agFilter = function(filter) {
  document.querySelectorAll('#tabAgenda .tgl-btn').forEach(b=>b.classList.remove('sel-green'));
  event.target.classList.add('sel-green');
  _loadAgenda('', filter);
};

async function _loadAgenda(searchQ='', filter='pendiente') {
  const list = document.getElementById('agendaList');
  const cnt = document.getElementById('agCount');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px">Cargando...</div>';

  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { collection, getDocs, query, where, orderBy, limit } = await import(`${FB_CDN}/firebase-firestore.js`);
    let q = collection(db, 'events', user.eventId, 'agenda');
    const snap = await getDocs(query(q, limit(100)));
    let items = snap.docs.map(d=>({id:d.id,...d.data()}));

    if (searchQ) {
      const sq = searchQ.toUpperCase();
      items = items.filter(i =>
        (i.referencia||'').toUpperCase().includes(sq) ||
        (i.empresa||'').toUpperCase().includes(sq) ||
        (i.matricula||'').toUpperCase().includes(sq)
      );
    }
    if (filter==='pendiente') items = items.filter(i=>i.estado!=='completado');
    if (filter==='hoy') {
      const hoy = new Date().toISOString().slice(0,10);
      items = items.filter(i=>(i.fecha||'').slice(0,10)===hoy);
    }

    if (cnt) cnt.textContent = `${items.length} servicios`;
    if (!items.length) {
      list.innerHTML='<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Sin servicios</div>';
      return;
    }
    list.innerHTML = items.map(item=>`
      <div class="ag-item ${item.estado==='completado'?'completed':item.matricula?'matched':''}">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="ag-ref">${safeHtml(item.referencia||'—')}</div>
          <span class="ag-status ${item.estado==='completado'?'done':item.matricula?'match':'pend'}">
            ${item.estado==='completado'?'Completado':item.matricula?'Matricula vinculada':'Pendiente'}
          </span>
        </div>
        <div class="ag-emp">${safeHtml(item.empresa||'—')}</div>
        <div class="ag-det">
          ${item.fecha?'📅 '+safeHtml(item.fecha)+' ':'' }
          ${item.hall?'🏢 '+safeHtml(item.hall)+' ':''}
          ${item.stand?'📌 '+safeHtml(item.stand)+' ':''}
          ${item.matricula?'🚛 '+safeHtml(item.matricula):''}
        </div>
      </div>`).join('');
  } catch(err) {
    list.innerHTML='<div style="color:var(--red);padding:16px;font-size:13px">Error cargando agenda</div>';
  }
}

async function _updateAgendaMatch(ref, mat) {
  try {
    const user = AppState.get('currentUser');
    const db = getDB();
    const { collection, query, where, getDocs, doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const q = query(collection(db,'events',user.eventId,'agenda'), where('referencia','==',ref));
    const snap = await getDocs(q);
    snap.docs.forEach(async d => {
      await updateDoc(doc(db,'events',user.eventId,'agenda',d.id), {
        matricula: mat, matriculaTs: new Date().toISOString()
      });
    });
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════════
// IMPRIMIR
// ═══════════════════════════════════════════════════════════
window._printEntry = async function(entryId) {
  try {
    const { printEntry } = await import('./print.js');
    const user = AppState.get('currentUser');
    const event = AppState.get('currentEvent');
    // Buscar el entry en la cache local
    const entries = await localDB.getAll('recent_entries');
    const entry = entries.find(e=>e.id===entryId) || {id:entryId,matricula:'—'};
    await printEntry(entry, event?.name||'BeUnifyT');
  } catch(err) {
    toast('Error al imprimir', 'var(--red)');
  }
};

// ═══════════════════════════════════════════════════════════
// TOGGLE BUTTONS (tipo vehiculo, descarga, etc.)
// ═══════════════════════════════════════════════════════════
window._tgl = function(hiddenId, btn, prefix) {
  const group = btn.parentElement;
  group.querySelectorAll('.tgl-btn').forEach(b=>b.className='tgl-btn');
  btn.classList.add('sel');
  const hidden = document.getElementById(hiddenId);
  if (hidden) hidden.value = btn.dataset.v;
};

// ═══════════════════════════════════════════════════════════
// LIMPIAR FORMULARIO
// ═══════════════════════════════════════════════════════════
function _clearForm(prefix) {
  const ids = {
    i: ['iMat','iRem','iEmp','iMontador','iExpositor','iLlamador','iHall','iStand',
        'iNom','iApe','iTelP','iTel','iPas','iFechaNac','iPais','iComent','iTipo','iDescarga','iIdioma'],
    r: ['rRef','rMat','rRem','rEmp','rLlamador','rHall','rStand','rNom','rApe',
        'rTelP','rTel','rIdioma','rPas','rFechaNac','rComent','rEjes','rMaq'],
    e: ['eMat','eConductor','eMaterial','eCantidad','eOrigen','eDestino','eNota','eTipo'],
  };
  (ids[prefix]||[]).forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  document.querySelectorAll('.tgl-btn').forEach(b=>{
    b.className='tgl-btn';
  });
  document.querySelectorAll('.bl-warn').forEach(w=>w.style.display='none');
  document.querySelectorAll('.dr').forEach(d=>d.innerHTML='');
}

// ═══════════════════════════════════════════════════════════
// BIND EVENTOS
// ═══════════════════════════════════════════════════════════
function _bindEvents() {
  // Tabs
  document.querySelectorAll('.op-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      _activeTab = tab.dataset.tab;
      document.querySelectorAll('.op-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('opContent');
      if (!content) return;
      if (_activeTab==='ingresos')   content.innerHTML=_renderIngresos();
      if (_activeTab==='referencia') content.innerHTML=_renderReferencia();
      if (_activeTab==='agenda')     { content.innerHTML=_renderAgenda(); _loadAgenda(); }
      if (_activeTab==='embalaje')   content.innerHTML=_renderEmbalaje();
    });
  });

  // Busqueda rapida
  document.getElementById('btnSearch')?.addEventListener('click', ()=>{
    const bar = document.getElementById('searchBar');
    if (bar) {
      bar.style.display = bar.style.display==='none'?'block':'none';
      if (bar.style.display==='block') document.getElementById('quickSearch')?.focus();
    }
  });

  // Menu lateral
  document.getElementById('btnMenu')?.addEventListener('click', ()=>{
    const ov = document.getElementById('opOverlay');
    if (ov) ov.style.display='flex';
  });
  document.getElementById('btnLogout')?.addEventListener('click', logout);
  document.getElementById('btnTema')?.addEventListener('click', ()=>{
    const themes=['default','dark','soft','contrast'];
    const curr = AppState.get('theme')||'default';
    const next = themes[(themes.indexOf(curr)+1)%themes.length];
    AppState.set('theme',next);
    toast(`Tema: ${next}`, 'var(--blue)', 1200);
  });

  // Cargar tab inicial
  const content = document.getElementById('opContent');
  if (content) content.innerHTML = _renderIngresos();
}

// ── Utils ──────────────────────────────────────────────────
function _v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function _setSyncStatus(s) {
  const dot=document.getElementById('syncDot');
  const txt=document.getElementById('syncTxt');
  if(!dot||!txt) return;
  const m={ok:['sd-g','OK'],syncing:['sd-y','...'],error:['sd-r','Error']};
  dot.className=`sd ${m[s]?.[0]||'sd-y'}`;
  txt.textContent=m[s]?.[1]||'...';
}
function _updateHeader() {}
