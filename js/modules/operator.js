// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/operator.js
// Visual 100% identica a v6. Backend: Firestore + IndexedDB.
// Halls desde evento configurado. Botones circulares v6.
// ═══════════════════════════════════════════════════════════

import { AppState }              from '../state.js';
import { localDB }               from '../db.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { logout }                from '../auth.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

const HALLS_DEFAULT = ['1','2A','2B','3A','3B','4','5','6','7','8','CS'];

let _unsubQ    = null;
let _entries   = [];
let _activeTab = 'ingresos';
let _sub       = 'lista';
let _hallFilter= '';
let _fecha     = '';
let _soloActivos = true;
let _q         = '';
let _fieldCfg  = {};
let _perms     = {};
let _eventHalls= HALLS_DEFAULT;

// ── Inicializar ──────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  const ev   = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', ev);
  if (user.gateId) AppState.set('currentGate', { id: user.gateId });

  // Halls del evento (ev.halls) o del recinto (ev.recintoHalls) o default
  _eventHalls = ev?.halls?.length ? ev.halls
    : ev?.recintoHalls?.length ? ev.recintoHalls
    : HALLS_DEFAULT;

  await _loadCfg(user.eventId, user.uid);

  const root = document.getElementById('app-root');
  root.innerHTML = _shellHTML(user, ev);
  _bindShell();
  _subscribeQueue();
}

async function _loadCfg(evId, uid) {
  try {
    const db = getDB();
    const { doc, getDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const cs = await getDoc(doc(db,'events',evId,'config','fields'));
    _fieldCfg = cs.exists() ? cs.data() : _defCfg();
    const os  = await getDoc(doc(db,'events',evId,'operators',uid));
    _perms = os.exists() ? (os.data().perms||_defPerms(os.data().role)) : _defPerms('operator');
  } catch { _fieldCfg=_defCfg(); _perms=_defPerms('operator'); }
}

function _defCfg() {
  return {
    ingresos:{
      remolque:{vis:true},tipoVeh:{vis:true,req:true},descarga:{vis:true,req:true},
      llamador:{vis:true},empresa:{vis:true,req:true},montador:{vis:true},
      expositor:{vis:true},hall:{vis:true},stand:{vis:true},
      nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},
      idioma:{vis:true},comentario:{vis:true},pasaporte:{vis:false},
      fechaNac:{vis:false},pais:{vis:false},
    },
    referencia:{
      remolque:{vis:true},numEjes:{vis:true},tipoMaq:{vis:true},
      empresa:{vis:true,req:true},hall:{vis:true},stand:{vis:true},
      llamador:{vis:true},nombre:{vis:true},apellido:{vis:true},
      telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},
      pasaporte:{vis:false},fechaNac:{vis:false},
    }
  };
}

function _defPerms(role) {
  const adm = role==='admin'||role==='supervisor';
  return {
    canEdit:true,canDelete:adm,canPrint:true,canExport:adm,
    canViewAgenda:adm,canEditAgenda:adm,canViewEmbalaje:adm,
    canBlacklist:adm,canConfigFields:role==='admin',
    canClean:adm,canVaciar:role==='admin',
  };
}

// ═══════════════════════════════════════════════════════════
// SHELL — header + tabs identicos a v6
// ═══════════════════════════════════════════════════════════
function _shellHTML(user, ev) {
  const tabs = [
    {id:'ingresos',   lbl:'Ingresos',   svg:'<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/>'},
    {id:'referencia', lbl:'Referencia', svg:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>'},
    ...(_perms.canViewAgenda  ?[{id:'agenda',   lbl:'Agenda',   svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>'}]:[]),
    ...(_perms.canViewEmbalaje?[{id:'embalaje', lbl:'Embalaje', svg:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'}]:[]),
  ];

  return `
<div class="app-hdr" id="appHdr">
  <div style="display:flex;align-items:center;width:100%;max-width:1400px;margin:0 auto;gap:6px">
    <div class="logo" style="display:flex;align-items:center;gap:6px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="22" height="22">
        <rect width="140" height="140" rx="28" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <span class="logo-txt">BeUnify<span>T</span></span>
      <span style="background:var(--bg3);border:1px solid var(--border2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:var(--text2);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${safeHtml(ev?.name||'Evento')}
      </span>
    </div>

    <div class="hdr-cnt-wrap">
      <div class="hdr-cnt"><span class="hdr-cv" id="cntHoy">0</span><span class="hdr-cl">HOY</span></div>
      <div class="hdr-cnt"><span class="hdr-cv" id="cntRecinto">0</span><span class="hdr-cl">RECINTO</span></div>
      <div class="hdr-cnt" style="border-color:var(--amber)"><span class="hdr-cv" id="cntRef" style="color:var(--amber)">0</span><span class="hdr-cl">REF.</span></div>
    </div>

    <div class="hdr-right">
      <div class="sync-pill" id="syncPill"><div class="sd sd-y" id="syncDot"></div></div>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 5px"></span>
      <span id="hdrUser" style="font-size:13px;font-weight:500;color:var(--text2)">${safeHtml(user.name)}</span>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 5px"></span>
      <button class="btn btn-gh btn-sm" id="btnTheme" style="font-size:13px;border-radius:20px;padding:3px 9px">☀️ Tema</button>
      <button class="btn btn-gh btn-sm" id="btnLogout" style="border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
      </button>
    </div>
  </div>
</div>

<div class="tabs-bar" id="mainTabs">
  ${tabs.map(t=>`
    <button class="btn-tab${t.id===_activeTab?' active':''}" data-tab="${t.id}" onclick="window._opTab('${t.id}')">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">${t.svg}</svg>
      ${t.lbl}
    </button>`).join('')}
</div>

<div class="app-main" id="opContent"></div>`;
}

// ═══════════════════════════════════════════════════════════
// RENDER TABLA — identica a v6 con botones circulares grandes
// ═══════════════════════════════════════════════════════════
function _renderTabla(tabId) {
  const isRef = tabId === 'referencia';
  const cfg   = isRef ? (_fieldCfg.referencia||_defCfg().referencia) : (_fieldCfg.ingresos||_defCfg().ingresos);

  let items = isRef
    ? _entries.filter(e => e.tipo==='referencia')
    : _entries.filter(e => e.tipo!=='referencia' && e.tipo!=='embalaje');

  if (_q)           items = items.filter(e => _matchQ(e,_q));
  if (_soloActivos) items = items.filter(e => !e.salida);
  if (_hallFilter)  items = items.filter(e => (e.hall||'')=== _hallFilter || (e.halls||[]).includes(_hallFilter));
  if (_fecha)       items = items.filter(e => (e.ts||'').startsWith(_fecha));

  const btnAdd = isRef
    ? `<button class="btn btn-sm" style="background:var(--amber);color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openModal('referencia')">+ Referencia</button>`
    : `<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openModal('ingresos')">+ Ingreso</button>`;

  const cnt = document.getElementById('opContent');
  if (!cnt) return;

  cnt.innerHTML = `
    <!-- SUBTABS + ACCIONES — identico v6 -->
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:nowrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(_perms.canConfigFields?[['campos','⚙ Campos']]:[])]
        .map(([s,l])=>`<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._opSub('${s}')">${l}</button>`).join('')}
      <span style="flex:1"></span>
      ${_perms.canEdit?btnAdd:''}
      ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._exportExcel('${tabId}')">⬇ Excel</button>`:''}
      ${_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._limpiarTab('${tabId}')">🗑 Limpiar</button>`:''}
    </div>

    <!-- BUSCADOR + FECHA + ACTIVOS — identico v6 -->
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span>
        <input type="search" placeholder="Pos, matrícula, nombre..." value="${safeHtml(_q)}"
          id="srch-${tabId}" style="padding:7px 10px 7px 30px;font-size:13px"
          oninput="window._opQ(this.value)">
      </div>
      <input type="date" value="${_fecha}" oninput="window._opFecha(this.value)"
        style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px">
      <span class="pill" style="border:1.5px solid ${_soloActivos?'var(--blue)':'var(--border)'};background:${_soloActivos?'var(--blue)':'var(--bg2)'};color:${_soloActivos?'#fff':'var(--text3)'};cursor:pointer;white-space:nowrap;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700"
        onclick="window._opActivos()">Solo activos</span>
      ${_q||_fecha||_hallFilter?`<span class="pill pill-r" onclick="window._opClearFilters()" style="cursor:pointer">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3);flex-shrink:0">${items.length} reg.</span>
    </div>

    <!-- FILTRO HALLS — pills exactos de v6 -->
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!_hallFilter?'#7dd3fc':'#93c5fd'};background:${!_hallFilter?'#e0f2fe':'#dbeafe'};color:${!_hallFilter?'#0369a1':'#1e40af'};cursor:pointer"
        onclick="window._opHall('')">Todos</span>
      ${_eventHalls.map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${_hallFilter===h?'#3b82f6':'#dbeafe'};color:${_hallFilter===h?'#fff':'#1e40af'};border:1.5px solid ${_hallFilter===h?'#2563eb':'#93c5fd'};cursor:pointer"
        onclick="window._opHall('${h}')">${h}</span>`).join('')}
    </div>

    <!-- TABLA — identica v6 con botones circulares grandes -->
    ${items.length ? `
    <div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:40px">#</th>
      ${isRef?`<th style="color:var(--amber);width:130px">Referencia</th>`:''}
      <th>Matrícula</th>
      ${!isRef?`<th>Llamador</th><th>Ref</th>`:'<th>Llamador</th>'}
      <th>Conductor/Empresa</th>
      <th>Tel.</th>
      <th>Hall</th>
      <th>Stand</th>
      <th style="font-size:10px">Evento</th>
      <th>Estado</th>
      <th>Entrada</th>
      <th>Acc.</th>
    </tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
      ${isRef?`<td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'–')}</td>`:''}
      <td>
        <span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>
        ${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}
      </td>
      ${!isRef?`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>
      <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${safeHtml(i.referencia||'–')}</td>`
      :`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>`}
      <td>
        <b style="font-size:12px">${safeHtml(((i.nombre||'')+' '+(i.apellido||'')).trim()||'–')}</b>
        ${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.empresa)}</span>`:''}
      </td>
      <td style="font-size:11px;white-space:nowrap">
        ${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none;font-size:11px">📞 ${safeHtml(i.telefono)}</a>`:'–'}
      </td>
      <td>${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:(i.halls?.length?`<span class="hbadge">${safeHtml(i.halls[0])}</span>`:'–')}</td>
      <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml((i.eventoNombre||'–').slice(0,12))}</td>
      <td>${!i.salida?'<span class="pill pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}</td>
      <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts)}</td>
      <td>
        <!-- Botones en columna como v6: imprimir+editar arriba, salida morada grande, eliminar -->
        <div style="display:flex;gap:2px;flex-wrap:wrap;align-items:center">
          ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${i.id}')" title="Imprimir">🖨</button>`:''}
          ${_perms.canPrint?`<button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" title="Imprimir Troquelado" onclick="window._opPrintTrq('${i.id}')">✂</button>`:''}
          ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${i.id}')">✏️</button>`:''}
          ${!i.salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${i.id}')">↩ Salida</button>`:''}
          ${i.salida&&_perms.canEdit?`<button class="btn btn-success btn-xs" onclick="window._opReactivar('${i.id}')" title="Reactivar">↺</button>`:''}
          ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${i.id}')">🗑</button>`:''}
        </div>
      </td>
    </tr>`).join('')}
    </tbody></table></div>`
    : `<div class="empty" style="text-align:center;padding:40px 20px;color:var(--text3)">
        <div style="font-size:48px;margin-bottom:10px">${isRef?'📋':'🚛'}</div>
        <div style="font-size:14px;font-weight:700">${isRef?'Sin referencias':'Sin ingresos'} registrados</div>
      </div>`}`;
}

// ═══════════════════════════════════════════════════════════
// MODAL — identico a v6
// ═══════════════════════════════════════════════════════════
function _renderModal(tipo) {
  const isRef = tipo === 'referencia';
  const cfg   = isRef ? (_fieldCfg.referencia||_defCfg().referencia) : (_fieldCfg.ingresos||_defCfg().ingresos);
  document.getElementById('_opModal')?.remove();
  const modal = document.createElement('div');
  modal.id = '_opModal';
  modal.className = 'ov open';
  modal.innerHTML = `
  <div class="modal modal-lg">
    <div class="mhdr">
      <div class="mttl">${isRef?'📋 Nueva Referencia':'🚛 Nuevo Ingreso'}</div>
      <button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button>
    </div>

    ${isRef?`
    <div class="fg s2" style="margin-bottom:8px">
      <span class="flbl">Referencia / Booking <span class="freq">*</span></span>
      <div style="position:relative">
        <input id="mRef" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;text-transform:uppercase;border-color:var(--amber)"
          placeholder="REF-XXXXXX" autocomplete="off"
          oninput="this.value=this.value.toUpperCase();window._searchRefAC(this.value)">
        <div id="mRefAC" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:999;background:var(--bg2);border:1.5px solid var(--amber);border-radius:0 0 8px 8px;max-height:180px;overflow-y:auto;box-shadow:var(--sh2)"></div>
      </div>
      <div id="mRefMatch" style="display:none;margin-top:4px;padding:6px 10px;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);font-size:12px;font-weight:700;color:var(--green)"></div>
    </div>`:''}

    <div class="fgrid">
      <div class="fg s2">
        <span class="flbl">Matrícula <span class="freq">*</span></span>
        <input id="mMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:16px"
          placeholder="🔍 Matrícula..." autocomplete="off"
          oninput="this.value=this.value.toUpperCase();window._checkBL(this.value)">
        <div id="mBlWarn" style="display:none;margin-top:4px;padding:8px 10px;background:var(--rll);border:2px solid var(--red);border-radius:var(--r);font-size:12px;font-weight:700;color:var(--red)"></div>
      </div>
      ${_fv(cfg,'remolque',`<div class="fg"><span class="flbl">Remolque</span><input id="mRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${!isRef?_fv(cfg,'tipoVeh',`
      <div class="fg s2"><span class="flbl">Tipo vehiculo <span class="freq">*</span></span>
        <div style="display:flex;gap:4px">
          <button type="button" class="btn btn-gh btn-sm" id="tvA" onclick="window._tgl('mTipoVeh','furgoneta','tvA','tvB')" style="flex:1">🚐 A Furgoneta</button>
          <button type="button" class="btn btn-gh btn-sm" id="tvB" onclick="window._tgl('mTipoVeh','camion','tvB','tvA')" style="flex:1">🚚 B Camion</button>
        </div><input type="hidden" id="mTipoVeh">
      </div>`):''}
      ${!isRef?_fv(cfg,'descarga',`
      <div class="fg s2"><span class="flbl">Servicio descarga/carga <span class="freq">*</span></span>
        <div style="display:flex;gap:4px">
          <button type="button" class="btn btn-gh btn-sm" id="dcH" onclick="window._tgl('mDescarga','mano','dcH','dcF')" style="flex:1">🤾 Handball</button>
          <button type="button" class="btn btn-gh btn-sm" id="dcF" onclick="window._tglFork()" style="flex:1">🏗 Forklift → Ref</button>
        </div><input type="hidden" id="mDescarga">
      </div>`):''}
      ${isRef?_fv(cfg,'numEjes',`
      <div class="fg"><span class="flbl">Num. ejes</span>
        <div style="display:flex;gap:3px">
          <button type="button" class="btn btn-gh btn-sm" data-v="5" onclick="window._tglEje(this)" style="flex:1">5</button>
          <button type="button" class="btn btn-gh btn-sm" data-v="6" onclick="window._tglEje(this)" style="flex:1">6</button>
          <button type="button" class="btn btn-gh btn-sm" data-v="7+" onclick="window._tglEje(this)" style="flex:1">7+</button>
        </div><input type="hidden" id="mEjes">
      </div>`):''}
      ${isRef?_fv(cfg,'tipoMaq',`<div class="fg"><span class="flbl">Maquinaria</span><select id="mMaq"><option value="">--</option><option value="forklift">🏗 Forklift</option><option value="grua">🏗 Grua</option><option value="plataforma">🔼 Plataforma</option></select></div>`):''}
      ${_fv(cfg,'empresa',`<div class="fg"><span class="flbl">Empresa${_req(cfg,'empresa')}</span><input id="mEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${!isRef?_fv(cfg,'montador',`<div class="fg"><span class="flbl">Montador</span><input id="mMontador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${!isRef?_fv(cfg,'expositor',`<div class="fg"><span class="flbl">Expositor</span><input id="mExpositor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${_fv(cfg,'llamador',`<div class="fg"><span class="flbl">Llamador</span><input id="mLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      <div class="fg">
        <span class="flbl">Hall / Pabellon</span>
        <select id="mHall">
          <option value="">--</option>
          ${_eventHalls.map(h=>`<option value="${h}">${h}</option>`).join('')}
        </select>
      </div>
      <div class="fg"><span class="flbl">Stand</span><input id="mStand" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
      <div style="grid-column:1/-1;border-top:2px solid var(--border2);margin:4px 0;padding-top:8px">
        <span style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:1px">👤 Datos del conductor</span>
      </div>
      ${_fv(cfg,'nombre',`<div class="fg"><span class="flbl">Nombre</span><input id="mNom" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'apellido',`<div class="fg"><span class="flbl">Apellido</span><input id="mApe" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'telefono',`<div class="fg"><span class="flbl">Telefono</span><div style="display:flex;gap:4px"><input id="mTelP" placeholder="+34" style="width:80px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:12px"><input id="mTel" type="tel"></div></div>`)}
      ${_fv(cfg,'idioma',`<div class="fg"><span class="flbl">Idioma conductor</span><select id="mIdioma">${_idOpts()}</select></div>`)}
      ${_fv(cfg,'pasaporte',`<div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="mPas" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'fechaNac',`<div class="fg"><span class="flbl">Fecha nacimiento</span><input id="mFechaNac" type="date"></div>`)}
      ${_fv(cfg,'pais',`<div class="fg"><span class="flbl">Pais</span><input id="mPais"></div>`)}
      ${_fv(cfg,'comentario',`<div class="fg s2"><span class="flbl">Comentario</span><textarea id="mComent" rows="2"></textarea></div>`)}
    </div>

    <div class="ffoot">
      <button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button>
      <button class="btn ${isRef?'btn-a':'btn-p'}" onclick="window._submitModal('${tipo}')">
        ${isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso'}
      </button>
    </div>
    <input type="hidden" id="mTipo" value="${tipo}">
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('mMat')?.focus();
}

// ═══════════════════════════════════════════════════════════
// SUBMIT
// ═══════════════════════════════════════════════════════════
window._submitModal = async function(tipo) {
  const isRef = tipo==='referencia';
  const mat   = normalizePlate(_v('mMat'));
  const ref   = (_v('mRef')||'').trim().toUpperCase();
  if (isRef&&!ref) { toast('La referencia es obligatoria','var(--red)'); return; }
  if (!mat&&!isRef){ toast('La matricula es obligatoria','var(--red)'); return; }
  if (!isRef&&_v('mDescarga')==='forklift') {
    if (!confirm('Este vehiculo usa forklift — deberia ir por Referencia.\n¿Registrar como Ingreso de todos modos?')) return;
  }
  const user = AppState.get('currentUser');
  const btn  = document.querySelector('#_opModal .btn-p,#_opModal .btn-a');
  if (btn) { btn.disabled=true; btn.textContent='Guardando...'; }
  try {
    const entry = {
      matricula:  mat||'—',  referencia:ref||null,
      remolque:   _v('mRem'), tipo:isRef?'referencia':(_v('mTipoVeh')||'ingreso'),
      tipoIngreso:isRef?'referencia':'ingreso',
      descarga:   _v('mDescarga'), numEjes:_v('mEjes'), maquinaria:_v('mMaq'),
      empresa:    _v('mEmp'),    montador:_v('mMontador'), expositor:_v('mExpositor'),
      llamador:   _v('mLlamador'),hall:_v('mHall'),       stand:_v('mStand'),
      nombre:     _v('mNom'),    apellido:_v('mApe'),
      conductor:  (_v('mNom')+' '+_v('mApe')).trim(),
      telPais:    _v('mTelP'),   telefono:_v('mTel'),     idioma:_v('mIdioma'),
      pasaporte:  _v('mPas'),    fechaNac:_v('mFechaNac'),pais:_v('mPais'),
      comentario: _v('mComent'),
      operadorId: user.uid, operador:user.name,
      eventoNombre: AppState.get('currentEvent')?.name||'',
      pos: _entries.length+1,
    };
    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', entry);
    if (isRef&&mat) _linkAgenda(ref,mat);
    document.getElementById('_opModal')?.remove();
    toast(isRef?`📋 Ref ${ref}${mat?' · '+mat:''} registrada`:`✅ ${mat} registrado`, isRef?'var(--amber)':'var(--green)');
  } catch(err) {
    console.error('[Op]',err);
    toast('Error al guardar','var(--red)');
    if (btn) { btn.disabled=false; btn.textContent=isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso'; }
  }
};

// ═══════════════════════════════════════════════════════════
// SUSCRIPCION FIRESTORE
// ═══════════════════════════════════════════════════════════
function _subscribeQueue() {
  const user = AppState.get('currentUser');
  if (_unsubQ) _unsubQ();
  _unsubQ = fsGate.subscribeQueue(
    user.eventId, user.gateId||'puerta-1',
    (entries) => { _entries=entries; _updateCounters(); _rerenderActive(); },
    (err) => { console.error('[Op]',err); _setSyncStatus('error'); }
  );
  _setSyncStatus('ok');
}

function _updateCounters() {
  const hoy  = new Date().toDateString();
  const hoyN = _entries.filter(e=>new Date(e.ts).toDateString()===hoy).length;
  const rec  = _entries.filter(e=>!e.salida).length;
  const refs = _entries.filter(e=>e.tipo==='referencia'&&!e.salida).length;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('cntHoy',hoyN); s('cntRecinto',rec); s('cntRef',refs);
}

function _rerenderActive() {
  if (_activeTab==='ingresos')   _renderTabla('ingresos');
  if (_activeTab==='referencia') _renderTabla('referencia');
}

// ═══════════════════════════════════════════════════════════
// ACCIONES DE FILA
// ═══════════════════════════════════════════════════════════
window._opSalida = async function(id) {
  if (!confirm('Confirmar salida?')) return;
  const user = AppState.get('currentUser');
  try {
    await fsGate.registerExit(user.eventId,user.gateId||'puerta-1',id,{operadorSalida:user.name});
    toast('Salida registrada','var(--blue)',1500);
  } catch { toast('Error al registrar salida','var(--red)'); }
};

window._opReactivar = async function(id) {
  if (!confirm('Reactivar este vehiculo (anular salida)?')) return;
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    await updateDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id),{salida:null});
    toast('↺ Salida anulada','var(--amber)');
  } catch { toast('Error','var(--red)'); }
};

window._opPrint = async function(id) {
  try {
    const { printEntry } = await import('./print.js');
    const entry = _entries.find(e=>e.id===id)||{id,matricula:'—'};
    await printEntry(entry, AppState.get('currentEvent')?.name||'BeUnifyT');
  } catch { toast('Error al imprimir','var(--red)'); }
};

window._opPrintTrq = function(id) {
  toast('Impresion troquelada — configura el formato en Impresion','var(--purple)');
};

window._opEdit = function(id) {
  const e = _entries.find(x=>x.id===id);
  if (!e) return;
  _renderModal(e.tipo==='referencia'?'referencia':'ingresos');
  setTimeout(()=>{
    const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v!==undefined)el.value=v;};
    sv('mRef',e.referencia); sv('mMat',e.matricula); sv('mRem',e.remolque);
    sv('mEmp',e.empresa); sv('mMontador',e.montador); sv('mExpositor',e.expositor);
    sv('mLlamador',e.llamador); sv('mHall',e.hall); sv('mStand',e.stand);
    sv('mNom',e.nombre); sv('mApe',e.apellido); sv('mTelP',e.telPais);
    sv('mTel',e.telefono); sv('mIdioma',e.idioma); sv('mPas',e.pasaporte);
    sv('mComent',e.comentario);
  },50);
};

window._opDel = async function(id) {
  if (!confirm('Eliminar este registro?')) return;
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { doc, deleteDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    await deleteDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id));
    toast('Eliminado','var(--amber)',1500);
  } catch { toast('Error al eliminar','var(--red)'); }
};

window._opDetail = function(id) {
  const e = _entries.find(x=>x.id===id);
  if (!e) return;
  const lines = [
    `Matricula: ${e.matricula}`, `Empresa: ${e.empresa||'—'}`,
    `Referencia: ${e.referencia||'—'}`, `Hall: ${e.hall||'—'}`,
    `Stand: ${e.stand||'—'}`, `Conductor: ${e.conductor||'—'}`,
    `Entrada: ${formatDateTime(e.ts)}`,
    `Salida: ${e.salida?formatDateTime(e.salida):'En recinto'}`,
  ];
  alert(lines.join('\n'));
};

// ═══════════════════════════════════════════════════════════
// AGENDA y EMBALAJE
// ═══════════════════════════════════════════════════════════
function _renderAgenda() {
  const cnt = document.getElementById('opContent');
  if (!cnt) return;
  cnt.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none">
      <span style="font-size:13px;font-weight:700">📅 Agenda de servicios</span>
      <span style="flex:1"></span>
      ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._agExcel()">⬇ Excel</button>`:''}
    </div>
    <div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
      <button class="btn btn-p btn-sm" onclick="window._agLoad('pendiente')">⏳ Pendientes</button>
      <button class="btn btn-gh btn-sm" onclick="window._agLoad('hoy')">📅 Hoy</button>
      <button class="btn btn-gh btn-sm" onclick="window._agLoad('todos')">Todos</button>
    </div>
    <div class="sbox" style="position:relative;margin-bottom:8px">
      <span class="sico" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px">🔍</span>
      <input type="search" placeholder="Referencia, empresa, matricula..."
        style="padding:7px 10px 7px 30px;font-size:13px;width:100%;text-transform:uppercase"
        oninput="window._agSearch(this.value.toUpperCase())">
    </div>
    <div id="agCnt" style="font-size:10px;color:var(--text3);margin-bottom:4px"></div>
    <div id="agendaContent"><div style="text-align:center;padding:30px;color:var(--text3)">Cargando...</div></div>`;
  _agLoad('pendiente');
}

async function _agLoad(filtro='pendiente', q='') {
  const el  = document.getElementById('agendaContent');
  const cnt = document.getElementById('agCnt');
  if (!el) return;
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { collection, getDocs, query, limit } = await import(`${FB_CDN}/firebase-firestore.js`);
    const snap = await getDocs(query(collection(db,'events',user.eventId,'agenda'),limit(200)));
    let items  = snap.docs.map(d=>({id:d.id,...d.data()}));
    if (q)              items=items.filter(i=>(i.referencia||'').includes(q)||(i.empresa||'').toUpperCase().includes(q)||(i.matricula||'').includes(q));
    if (filtro==='pendiente') items=items.filter(i=>i.estado!=='completado');
    if (filtro==='hoy') { const hoy=new Date().toISOString().slice(0,10); items=items.filter(i=>(i.fecha||'').slice(0,10)===hoy); }
    if (cnt) cnt.textContent = items.length+' servicios';
    if (!items.length) { el.innerHTML='<div style="text-align:center;padding:30px;color:var(--text3)">Sin servicios</div>'; return; }
    el.innerHTML=`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th>Referencia</th><th>Empresa</th><th>Hall/Stand</th><th>Fecha</th><th>Matricula</th><th>Estado</th>
    </tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--amber)">${safeHtml(i.referencia||'—')}</td>
      <td><b>${safeHtml(i.empresa||'—')}</b></td>
      <td style="font-size:11px">${safeHtml(i.hall||'')} ${safeHtml(i.stand||'')}</td>
      <td style="font-size:11px">${safeHtml(i.fecha||'—')}</td>
      <td>${i.matricula?`<span class="mchip-sm">${safeHtml(i.matricula)}</span>`:'<span style="color:var(--text4);font-size:11px">sin mat.</span>'}</td>
      <td><span class="s-${i.estado||'PENDIENTE'}">${safeHtml(i.estado||'PENDIENTE')}</span></td>
    </tr>`).join('')}
    </tbody></table></div>`;
  } catch { el.innerHTML=`<div style="color:var(--red);padding:16px">Error cargando agenda</div>`; }
}

window._agLoad   = _agLoad;
window._agSearch = (q) => _agLoad('todos',q);
window._agExcel  = () => toast('Exportar agenda — disponible en admin','var(--blue)');

function _renderEmbalaje() {
  const cnt = document.getElementById('opContent');
  if (!cnt) return;
  cnt.innerHTML=`
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px">
      <span style="font-size:13px;font-weight:700">📦 Control de Embalaje</span>
    </div>
    <div class="card">
      <div class="fgrid">
        <div class="fg s2"><span class="flbl">Matricula <span class="freq">*</span></span>
          <input id="eMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><span class="flbl">Conductor fijo</span><input id="eCond" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg s2"><span class="flbl">Tipo movimiento <span class="freq">*</span></span>
          <div style="display:flex;gap:4px">
            <button type="button" class="btn btn-gh btn-sm" id="eR" onclick="window._tgl('eTipo','retirada','eR','eD')" style="flex:1">📤 Retirada vacios</button>
            <button type="button" class="btn btn-gh btn-sm" id="eD" onclick="window._tgl('eTipo','devolucion','eD','eR')" style="flex:1">📥 Devolucion material</button>
          </div><input type="hidden" id="eTipo">
        </div>
        <div class="fg"><span class="flbl">Material</span><input id="eMat2" placeholder="Pales, jaulas..."></div>
        <div class="fg"><span class="flbl">Cantidad</span><input id="eCant" type="number" min="1"></div>
        <div class="fg"><span class="flbl">Origen</span><input id="eOrig" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><span class="flbl">Destino</span><input id="eDest" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg s2"><span class="flbl">Nota</span><textarea id="eNota" rows="2"></textarea></div>
      </div>
      <div class="ffoot"><button class="btn btn-p" onclick="window._submitEmb()">📦 Registrar movimiento</button></div>
    </div>`;
}

window._submitEmb = async function() {
  const mat=normalizePlate(document.getElementById('eMat')?.value);
  const tipo=document.getElementById('eTipo')?.value;
  if(!mat){toast('La matricula es obligatoria','var(--red)');return;}
  if(!tipo){toast('Selecciona el tipo','var(--red)');return;}
  const user=AppState.get('currentUser');
  try {
    await fsGate.registerEntry(user.eventId,user.gateId||'puerta-1',{
      matricula:mat,tipo:'embalaje',tipoMov:tipo,
      conductor:_v('eCond'),material:_v('eMat2'),cantidad:_v('eCant'),
      origen:_v('eOrig'),destino:_v('eDest'),nota:_v('eNota'),
      operadorId:user.uid,operador:user.name,
    });
    ['eMat','eCond','eMat2','eCant','eOrig','eDest','eNota','eTipo'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.querySelectorAll('#eR,#eD').forEach(b=>b.className='btn btn-gh btn-sm');
    toast('📦 Movimiento registrado','var(--purple)');
  } catch{toast('Error','var(--red)');}
};

// ═══════════════════════════════════════════════════════════
// CONTROLES
// ═══════════════════════════════════════════════════════════
window._opTab = function(tab) {
  _activeTab=tab; _sub='lista';
  document.querySelectorAll('.btn-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='ingresos')   _renderTabla('ingresos');
  if(tab==='referencia') _renderTabla('referencia');
  if(tab==='agenda')     _renderAgenda();
  if(tab==='embalaje')   _renderEmbalaje();
};

window._opSub      = (s) => { _sub=s; _rerenderActive(); };
window._opQ        = (q) => { _q=q; _rerenderActive(); };
window._opFecha    = (f) => { _fecha=f; _rerenderActive(); };
window._opActivos  = ()  => { _soloActivos=!_soloActivos; _rerenderActive(); };
window._opHall     = (h) => { _hallFilter=h; _rerenderActive(); };
window._opClearFilters = ()=>{ _q='';_fecha='';_hallFilter='';_rerenderActive(); };
window._openModal  = (t) => _renderModal(t);

window._tgl = function(hidId,val,activeId,otherId) {
  document.getElementById(hidId).value=val;
  const a=document.getElementById(activeId);
  const o=document.getElementById(otherId);
  if(a) a.className='btn btn-sm btn-p';
  if(o) o.className='btn btn-sm btn-gh';
};
window._tglFork = function(){
  const h=document.getElementById('dcH'),f=document.getElementById('dcF');
  if(h)h.className='btn btn-sm btn-gh';
  if(f)f.className='btn btn-sm btn-a';
  document.getElementById('mDescarga').value='forklift';
};
window._tglEje = function(btn) {
  btn.parentElement.querySelectorAll('.btn').forEach(b=>b.className='btn btn-sm btn-gh');
  btn.className='btn btn-sm btn-a';
  document.getElementById('mEjes').value=btn.dataset.v;
};

window._checkBL = async function(mat) {
  if(!mat||mat.length<4) return;
  const warn=document.getElementById('mBlWarn');
  if(!warn) return;
  try {
    const user=AppState.get('currentUser');
    const db=getDB();
    const {collection,query,where,getDocs}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'blacklist'),where('matricula','==',mat.toUpperCase().trim())));
    if(!snap.empty){
      const bl=snap.docs[0].data();
      warn.innerHTML=`⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matricula en lista negra')}`;
      warn.style.display='block';
    } else { warn.style.display='none'; }
  } catch { warn.style.display='none'; }
};

window._searchRefAC = async function(val) {
  const ac=document.getElementById('mRefAC');
  const match=document.getElementById('mRefMatch');
  if(!ac||!match||val.length<3){if(ac)ac.style.display='none';return;}
  const user=AppState.get('currentUser');
  try {
    const db=getDB();
    const {collection,query,where,getDocs,limit}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','>=',val),where('referencia','<=',val+'\uf8ff'),limit(5)));
    if(!snap.empty){
      const items=snap.docs.map(d=>({id:d.id,...d.data()}));
      ac.style.display='block';
      ac.innerHTML=items.map(it=>`
        <div onclick="window._fillRef(${JSON.stringify(it).replace(/"/g,'&quot;')})"
          style="padding:8px 12px;cursor:pointer;border-bottom:0.5px solid var(--border);font-size:12px;background:var(--bg2)">
          <span style="font-weight:700;color:var(--amber)">${safeHtml(it.referencia)}</span>
          <span style="color:var(--text2);margin-left:8px">${safeHtml(it.empresa||'—')}</span>
        </div>`).join('');
    } else { ac.style.display='none'; }
  } catch { if(ac)ac.style.display='none'; }
};

window._fillRef = function(item) {
  const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v)el.value=v;};
  sv('mRef',item.referencia);sv('mEmp',item.empresa);
  sv('mHall',item.hall);sv('mStand',item.stand);
  sv('mNom',item.conductor?.split(' ')[0]);
  sv('mApe',item.conductor?.split(' ').slice(1).join(' '));
  const ac=document.getElementById('mRefAC');
  const match=document.getElementById('mRefMatch');
  if(ac)ac.style.display='none';
  if(match){match.innerHTML=`✅ Ref en agenda · ${safeHtml(item.empresa||'')}${item.hall?' · Hall '+safeHtml(item.hall):''}`;match.style.display='block';}
};

async function _linkAgenda(ref,mat) {
  try {
    const user=AppState.get('currentUser');const db=getDB();
    const {collection,query,where,getDocs,doc,updateDoc}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','==',ref)));
    snap.docs.forEach(async d=>await updateDoc(doc(db,'events',user.eventId,'agenda',d.id),{matricula:mat,matriculaTs:new Date().toISOString()}));
  } catch{}
}

window._exportExcel = async function(tab) {
  if(!_perms.canExport){toast('Sin permiso','var(--red)');return;}
  try {
    const {exportToExcel}=await import('./print.js');
    const items=tab==='referencia'?_entries.filter(e=>e.tipo==='referencia'):_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
    await exportToExcel(items,`beunifyt-${tab}`);
  } catch{toast('Error al exportar','var(--red)');}
};

window._limpiarTab = ()=>toast('Limpiar — disponible en admin panel','var(--amber)');

// ── BIND SHELL ──────────────────────────────────────────────
function _bindShell() {
  document.getElementById('btnLogout')?.addEventListener('click', logout);
  document.getElementById('btnTheme')?.addEventListener('click', ()=>{
    const themes=['default','dark','soft','contrast'];
    const curr=AppState.get('theme')||'default';
    const next=themes[(themes.indexOf(curr)+1)%themes.length];
    AppState.set('theme',next);
    toast(`Tema: ${next}`,'var(--blue)',1200);
  });
  _renderTabla('ingresos');
}

// ── UTILS ────────────────────────────────────────────────────
function _v(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function _fv(cfg,key,html){return(!cfg[key]||cfg[key].vis===false)?'':html;}
function _req(cfg,key){return cfg[key]?.req?' <span class="freq">*</span>':'';}
function _matchQ(e,q){
  const s=q.toLowerCase();
  return`${e.pos||''} ${e.matricula||''} ${e.nombre||''} ${e.apellido||''} ${e.empresa||''} ${e.llamador||''} ${e.referencia||''} ${e.hall||''} ${(e.halls||[]).join(' ')} ${e.stand||''} ${e.remolque||''} ${e.comentario||''} ${e.telefono||''} ${e.conductor||''}`.toLowerCase().includes(s);
}
function _setSyncStatus(s){
  const dot=document.getElementById('syncDot');
  if(!dot)return;
  const m={ok:'sd-g',syncing:'sd-y',error:'sd-r'};
  dot.className=`sd ${m[s]||'sd-y'}`;
}
function _idOpts(){
  return`<option value="">--</option>`+['es','en','fr','de','it','pt','nl','pl','ro','ru','uk','cs','sk','hu','bg','hr','tr','ar','zh'].map(l=>`<option value="${l}">${l}</option>`).join('');
}
