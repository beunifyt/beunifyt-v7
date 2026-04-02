// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/operator.js
// Visual identica a v6. Backend: Firestore + IndexedDB.
// ═══════════════════════════════════════════════════════════

import { AppState }              from '../state.js';
import { localDB }               from '../db.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { logout }                from '../auth.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

let _unsubQ     = null;
let _entries    = [];
let _activeTab  = 'ingresos';
let _sub        = 'lista';
let _hallFilter = '';
let _soloActivos = true;
let _q          = '';
let _fieldCfg   = {};
let _perms      = {};

// ── Inicializar ──────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  const ev   = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', ev);
  if (user.gateId) AppState.set('currentGate', { id: user.gateId });
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
    _perms = os.exists() ? (os.data().perms || _defPerms(os.data().role)) : _defPerms('operator');
  } catch { _fieldCfg=_defCfg(); _perms=_defPerms('operator'); }
}

function _defCfg() {
  return {
    ingresos:{
      remolque:{vis:true},  tipoVeh:{vis:true,req:true}, descarga:{vis:true,req:true},
      llamador:{vis:true},  empresa:{vis:true,req:true},  montador:{vis:true},
      expositor:{vis:true}, hall:{vis:true},              stand:{vis:true},
      nombre:{vis:true},    apellido:{vis:true},           telefono:{vis:true},
      idioma:{vis:true},    comentario:{vis:true},         pasaporte:{vis:false},
      fechaNac:{vis:false}, pais:{vis:false},
    },
    referencia:{
      remolque:{vis:true},  numEjes:{vis:true},  tipoMaq:{vis:true},
      empresa:{vis:true,req:true}, hall:{vis:true}, stand:{vis:true},
      llamador:{vis:true},  nombre:{vis:true},   apellido:{vis:true},
      telefono:{vis:true},  idioma:{vis:true},   comentario:{vis:true},
      pasaporte:{vis:false},fechaNac:{vis:false},
    }
  };
}

function _defPerms(role) {
  const adm = role==='admin'||role==='supervisor';
  return {
    canEdit:true, canDelete:adm, canPrint:true, canExport:adm,
    canViewAgenda:adm, canEditAgenda:adm, canViewEmbalaje:adm,
    canBlacklist:adm, canConfigFields:role==='admin',
    canClean:adm, canVaciar:role==='admin',
  };
}

// ═══════════════════════════════════════════════════════════
// SHELL — identico a v6
// ═══════════════════════════════════════════════════════════
function _shellHTML(user, ev) {
  const tabs = [
    {id:'ingresos',   lbl:'Ingresos',   svg:'<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/>'},
    {id:'referencia', lbl:'Referencia', svg:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>'},
    ...(_perms.canViewAgenda  ?[{id:'agenda',   lbl:'Agenda',   svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>'}]:[]),
    ...(_perms.canViewEmbalaje?[{id:'embalaje', lbl:'Embalaje', svg:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'}]:[]),
  ];

  return `
<div id="appHdr" style="background:var(--bg2);border-bottom:1px solid var(--border);padding:0 12px;height:44px;display:flex;align-items:center;position:sticky;top:0;z-index:200">
  <div style="display:flex;align-items:center;width:100%;max-width:1400px;margin:0 auto;gap:6px">
    <div class="logo" style="display:flex;align-items:center;gap:6px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="22" height="22">
        <rect width="140" height="140" rx="28" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <span style="font-family:system-ui,sans-serif;font-size:14px;font-weight:700;color:var(--text)">
        <span style="color:#00b89a">Be</span>Unify<span style="color:#00b89a">T</span>
      </span>
      <span style="background:var(--bg3);border:1px solid var(--border2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:var(--text2);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${safeHtml(ev?.name||'Evento')}
      </span>
    </div>

    <div class="hdr-cnt-wrap" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;overflow-x:auto;scrollbar-width:none">
      <div class="hdr-cnt"><span class="hdr-cv" id="cntHoy">0</span><span class="hdr-cl">HOY</span></div>
      <div class="hdr-cnt"><span class="hdr-cv" id="cntRecinto">0</span><span class="hdr-cl">RECINTO</span></div>
      <div class="hdr-cnt" style="border-color:var(--amber)"><span class="hdr-cv" id="cntRef" style="color:var(--amber)">0</span><span class="hdr-cl">REF.</span></div>
    </div>

    <div class="hdr-right">
      <div class="sync-pill" id="syncPill"><div class="sd sd-y" id="syncDot"></div><span id="syncTxt"></span></div>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 4px"></span>
      <span id="hdrUser" style="font-size:13px;font-weight:500;color:var(--text2);padding:0 2px">${safeHtml(user.name)}</span>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 4px"></span>
      <button class="btn btn-gh btn-sm" id="btnTheme" style="font-size:12px;border-radius:20px;padding:3px 9px">☀️ Tema</button>
      <button class="btn btn-gh btn-sm" id="btnLogout" style="border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
      </button>
    </div>
  </div>
</div>

<div class="tabs-bar" id="mainTabs" style="position:sticky;top:44px;z-index:199">
  ${tabs.map(t=>`
    <button class="btn-tab${t.id===_activeTab?' active':''}" data-tab="${t.id}" onclick="window._opTab('${t.id}')">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">${t.svg}</svg>
      ${t.lbl}
    </button>`).join('')}
</div>

<div class="app-main" id="opContent" style="padding:6px 10px;max-width:1400px;margin:0 auto"></div>`;
}

// ═══════════════════════════════════════════════════════════
// RENDER INGRESOS — tabla identica a v6
// ═══════════════════════════════════════════════════════════
function _renderIngresos() {
  const cfg  = _fieldCfg.ingresos || _defCfg().ingresos;
  const halls = _getHalls();
  let   items = _entries.filter(e => e.tipo !== 'referencia' && e.tipo !== 'embalaje');
  if (_q)          items = items.filter(e => _matchQ(e, _q));
  if (_soloActivos)items = items.filter(e => !e.salida);
  if (_hallFilter) items = items.filter(e => (e.hall||'') === _hallFilter);

  const cnt = document.getElementById('opContent');
  if (!cnt) return;

  cnt.innerHTML = `
    <!-- SUBTABS + ACCIONES -->
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:nowrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 Lista'],['especial','⭐ Especial'],['campos','⚙ Campos']].map(([s,l])=>
        `<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._opSub('${s}')">${l}</button>`
      ).join('')}
      <span style="flex:1;min-width:8px"></span>
      <button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openIngModal()">+ Ingreso</button>
      ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._exportExcel('ingresos')">⬇ Excel</button>`:''}
      ${_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._limpiarTab('ingresos')">🗑 Limpiar</button>`:''}
    </div>

    <!-- BUSCADOR + FILTROS -->
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px;position:relative">
        <span class="sico" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px;pointer-events:none">🔍</span>
        <input type="search" placeholder="Matrícula, nombre, empresa..." value="${safeHtml(_q)}"
          style="padding:7px 10px 7px 30px;font-size:13px;width:100%"
          oninput="window._opQ(this.value)">
      </div>
      <span class="pill" style="border:1.5px solid ${_soloActivos?'var(--blue)':'var(--border)'};background:${_soloActivos?'var(--blue)':'var(--bg2)'};color:${_soloActivos?'#fff':'var(--text3)'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap"
        onclick="window._opActivos()">Solo activos</span>
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>

    <!-- FILTRO HALLS -->
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill-hall${!_hallFilter?' active':''}" onclick="window._opHall('')">Todos</span>
      ${halls.map(h=>`<span class="pill-hall${_hallFilter===h?' active':''}" onclick="window._opHall('${h}')">${h}</span>`).join('')}
    </div>

    <!-- TABLA -->
    ${items.length ? `
    <div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:36px">#</th>
      <th style="width:110px">Matrícula</th>
      <th>Llamador</th>
      <th>Ref</th>
      <th>Conductor/Empresa</th>
      <th>Tel.</th>
      <th style="width:60px">Hall</th>
      <th>Stand</th>
      <th style="width:90px">Evento</th>
      <th>Estado</th>
      <th>Entrada</th>
      <th>Acc.</th>
    </tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
      <td>
        <span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>
        ${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}
      </td>
      <td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>
      <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${safeHtml(i.referencia||'–')}</td>
      <td>
        <b style="font-size:12px">${safeHtml((i.nombre||'')+' '+(i.apellido||'')).trim()||'–'}</b>
        ${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.empresa)}</span>`:''}
      </td>
      <td style="font-size:11px;white-space:nowrap">
        ${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(i.telefono)}</a>`:'–'}
      </td>
      <td>${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:'–'}</td>
      <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(i.eventoNombre||'–')}</td>
      <td>
        ${!i.salida
          ? '<span class="pill pill-g">✓ En recinto</span>'
          : `<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}
      </td>
      <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts)}</td>
      <td><div style="display:flex;gap:2px;flex-wrap:wrap">
        ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${i.id}')" title="Imprimir">🖨</button>`:''}
        ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${i.id}')">✏️</button>`:''}
        ${!i.salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${i.id}')">↩ Salida</button>`:''}
        ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${i.id}')">🗑</button>`:''}
      </div></td>
    </tr>`).join('')}
    </tbody></table></div>`
    : `<div class="empty" style="text-align:center;padding:40px 20px;color:var(--text3)">
        <div style="font-size:48px;margin-bottom:10px">🚛</div>
        <div style="font-size:14px;font-weight:700">Sin ingresos registrados</div>
      </div>`}`;
}

// ═══════════════════════════════════════════════════════════
// RENDER REFERENCIA — misma tabla, columna REF destacada
// ═══════════════════════════════════════════════════════════
function _renderReferencia() {
  const halls = _getHalls();
  let items   = _entries.filter(e => e.tipo === 'referencia');
  if (_q)           items = items.filter(e => _matchQ(e, _q));
  if (_soloActivos) items = items.filter(e => !e.salida);
  if (_hallFilter)  items = items.filter(e => (e.hall||'') === _hallFilter);

  const cnt = document.getElementById('opContent');
  if (!cnt) return;

  cnt.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:nowrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 Lista'],['especial','⭐ Especial'],['campos','⚙ Campos']].map(([s,l])=>
        `<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._opSub('${s}')">${l}</button>`
      ).join('')}
      <span style="flex:1"></span>
      <button class="btn btn-sm" style="background:var(--amber);color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openRefModal()">+ Referencia</button>
      ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._exportExcel('referencia')">⬇ Excel</button>`:''}
    </div>

    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px;position:relative">
        <span class="sico" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px;pointer-events:none">🔍</span>
        <input type="search" placeholder="Referencia, matrícula, empresa..." value="${safeHtml(_q)}"
          style="padding:7px 10px 7px 30px;font-size:13px;width:100%"
          oninput="window._opQ(this.value)">
      </div>
      <span class="pill" style="border:1.5px solid ${_soloActivos?'var(--blue)':'var(--border)'};background:${_soloActivos?'var(--blue)':'var(--bg2)'};color:${_soloActivos?'#fff':'var(--text3)'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap"
        onclick="window._opActivos()">Solo activos</span>
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill-hall${!_hallFilter?' active':''}" onclick="window._opHall('')">Todos</span>
      ${halls.map(h=>`<span class="pill-hall${_hallFilter===h?' active':''}" onclick="window._opHall('${h}')">${h}</span>`).join('')}
    </div>

    ${items.length ? `
    <div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:36px">#</th>
      <th style="width:140px;color:var(--amber)">Referencia ⭐</th>
      <th style="width:110px">Matrícula</th>
      <th>Llamador</th>
      <th>Empresa</th>
      <th>Tel.</th>
      <th>Hall</th>
      <th>Stand</th>
      <th>Estado</th>
      <th>Entrada</th>
      <th>Acc.</th>
    </tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'–')}</td>
      <td>
        <span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>
        ${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}
      </td>
      <td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>
      <td>
        <b style="font-size:12px">${safeHtml(i.empresa||'–')}</b>
        ${i.nombre?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.nombre+' '+(i.apellido||'')).trim()}</span>`:''}
      </td>
      <td style="font-size:11px;white-space:nowrap">
        ${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(i.telefono)}</a>`:'–'}
      </td>
      <td>${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:'–'}</td>
      <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
      <td>
        ${!i.salida
          ? '<span class="pill pill-g">✓ En recinto</span>'
          : `<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}
      </td>
      <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts)}</td>
      <td><div style="display:flex;gap:2px;flex-wrap:wrap">
        ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${i.id}')">🖨</button>`:''}
        ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${i.id}')">✏️</button>`:''}
        ${!i.salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${i.id}')">↩ Salida</button>`:''}
        ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${i.id}')">🗑</button>`:''}
      </div></td>
    </tr>`).join('')}
    </tbody></table></div>`
    : `<div class="empty" style="text-align:center;padding:40px 20px;color:var(--text3)">
        <div style="font-size:48px;margin-bottom:10px">📋</div>
        <div style="font-size:14px;font-weight:700">Sin referencias registradas</div>
      </div>`}`;
}

// ═══════════════════════════════════════════════════════════
// MODAL NUEVO INGRESO — identico a v6
// ═══════════════════════════════════════════════════════════
function _renderIngModal(tipo) {
  const isRef = tipo === 'referencia';
  const cfg   = isRef ? (_fieldCfg.referencia||_defCfg().referencia) : (_fieldCfg.ingresos||_defCfg().ingresos);
  const title = isRef ? '📋 Nueva Referencia' : '🚛 Nuevo Ingreso';
  const color = isRef ? 'var(--amber)' : 'var(--blue)';

  // Eliminar modal previo si existe
  document.getElementById('_opModal')?.remove();

  const modal = document.createElement('div');
  modal.id = '_opModal';
  modal.className = 'ov open';
  modal.innerHTML = `
  <div class="modal modal-lg">
    <div class="mhdr">
      <div class="mttl" style="color:${color}">${title}</div>
      <button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button>
    </div>

    ${isRef ? `
    <div class="fg s2" style="margin-bottom:8px">
      <span class="flbl">Referencia / Booking <span class="freq">*</span></span>
      <div style="position:relative">
        <input id="mRef" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;text-transform:uppercase;border-color:var(--amber)"
          placeholder="REF-XXXXXX" autocomplete="off"
          oninput="this.value=this.value.toUpperCase();window._searchRefAC(this.value)">
        <div id="mRefAC" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:999;background:var(--bg2);border:1.5px solid var(--amber);border-radius:0 0 8px 8px;max-height:180px;overflow-y:auto;box-shadow:var(--sh2)"></div>
      </div>
      <div id="mRefMatch" style="display:none;margin-top:4px;padding:6px 10px;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);font-size:12px;font-weight:700;color:var(--green)"></div>
    </div>` : ''}

    <div class="fgrid" id="mIngFormBody">
      <div class="fg s2">
        <span class="flbl">Matrícula <span class="freq">*</span></span>
        <input id="mMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:16px"
          placeholder="🔍 Matrícula..." autocomplete="off"
          oninput="this.value=this.value.toUpperCase();window._checkBL(this.value)">
        <div id="mBlWarn" style="display:none;margin-top:4px;padding:8px 10px;background:var(--rll);border:2px solid var(--red);border-radius:var(--r);font-size:12px;font-weight:700;color:var(--red)"></div>
      </div>

      ${_fv(cfg,'remolque',`<div class="fg"><span class="flbl">Remolque</span><input id="mRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}

      ${!isRef ? _fv(cfg,'tipoVeh',`
      <div class="fg s2">
        <span class="flbl">Tipo vehiculo <span class="freq">*</span></span>
        <div style="display:flex;gap:4px">
          <button type="button" class="btn btn-sm btn-gh" id="tvA" onclick="window._tgl('mTipoVeh','furgoneta','tvA','tvB')" style="flex:1">🚐 A Furgoneta</button>
          <button type="button" class="btn btn-sm btn-gh" id="tvB" onclick="window._tgl('mTipoVeh','camion','tvB','tvA')" style="flex:1">🚚 B Camion</button>
        </div>
        <input type="hidden" id="mTipoVeh">
      </div>`) : ''}

      ${!isRef ? _fv(cfg,'descarga',`
      <div class="fg s2">
        <span class="flbl">Servicio descarga/carga <span class="freq">*</span></span>
        <div style="display:flex;gap:4px">
          <button type="button" class="btn btn-sm btn-gh" id="dcH" onclick="window._tgl('mDescarga','mano','dcH','dcF')" style="flex:1">🤾 Handball</button>
          <button type="button" class="btn btn-sm btn-gh" id="dcF" onclick="window._tglForklift()" style="flex:1">🏗 Forklift → Ref</button>
        </div>
        <input type="hidden" id="mDescarga">
      </div>`) : ''}

      ${isRef ? _fv(cfg,'numEjes',`
      <div class="fg">
        <span class="flbl">Num. ejes</span>
        <div style="display:flex;gap:3px">
          <button type="button" class="btn btn-sm btn-gh" data-v="5"  onclick="window._tglEje(this)" style="flex:1">5</button>
          <button type="button" class="btn btn-sm btn-gh" data-v="6"  onclick="window._tglEje(this)" style="flex:1">6</button>
          <button type="button" class="btn btn-sm btn-gh" data-v="7+" onclick="window._tglEje(this)" style="flex:1">7+</button>
        </div>
        <input type="hidden" id="mEjes">
      </div>`) : ''}

      ${isRef ? _fv(cfg,'tipoMaq',`
      <div class="fg">
        <span class="flbl">Maquinaria</span>
        <select id="mMaq">
          <option value="">--</option>
          <option value="forklift">🏗 Forklift</option>
          <option value="grua">🏗 Grua</option>
          <option value="plataforma">🔼 Plataforma</option>
        </select>
      </div>`) : ''}

      ${_fv(cfg,'empresa',`<div class="fg"><span class="flbl">Empresa${_req(cfg,'empresa')}</span><input id="mEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${!isRef?_fv(cfg,'montador',`<div class="fg"><span class="flbl">Montador</span><input id="mMontador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${!isRef?_fv(cfg,'expositor',`<div class="fg"><span class="flbl">Expositor</span><input id="mExpositor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${_fv(cfg,'llamador',`<div class="fg"><span class="flbl">Llamador</span><input id="mLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}

      <div class="fg"><span class="flbl">Hall / Pabellon</span><input id="mHall" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
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
// SUBMIT MODAL
// ═══════════════════════════════════════════════════════════
window._submitModal = async function(tipo) {
  const isRef = tipo === 'referencia';
  const mat   = normalizePlate(_v('mMat'));
  const ref   = (_v('mRef')||'').trim().toUpperCase();

  if (isRef && !ref) { toast('La referencia es obligatoria', 'var(--red)'); return; }
  if (!mat && !isRef) { toast('La matricula es obligatoria', 'var(--red)'); return; }

  const descarga = _v('mDescarga');
  if (!isRef && descarga === 'forklift') {
    if (!confirm('Este vehiculo usa forklift. Deberia ir por Referencia.\n¿Registrar como Ingreso de todos modos?')) return;
  }

  const user = AppState.get('currentUser');
  const btn  = document.querySelector('#_opModal .btn-p, #_opModal .btn-a');
  if (btn) { btn.disabled=true; btn.textContent='Guardando...'; }

  try {
    const entry = {
      matricula:  mat || (isRef?'—':''),
      referencia: ref || null,
      remolque:   _v('mRem'),
      tipo:       isRef ? 'referencia' : (_v('mTipoVeh')||'ingreso'),
      tipoIngreso:isRef ? 'referencia' : 'ingreso',
      descarga:   _v('mDescarga'),
      numEjes:    _v('mEjes'),
      maquinaria: _v('mMaq'),
      empresa:    _v('mEmp'),
      montador:   _v('mMontador'),
      expositor:  _v('mExpositor'),
      llamador:   _v('mLlamador'),
      hall:       _v('mHall'),
      stand:      _v('mStand'),
      nombre:     _v('mNom'),
      apellido:   _v('mApe'),
      conductor:  (_v('mNom')+' '+_v('mApe')).trim(),
      telPais:    _v('mTelP'),
      telefono:   _v('mTel'),
      idioma:     _v('mIdioma'),
      pasaporte:  _v('mPas'),
      fechaNac:   _v('mFechaNac'),
      pais:       _v('mPais'),
      comentario: _v('mComent'),
      operadorId: user.uid,
      operador:   user.name,
      eventoNombre: AppState.get('currentEvent')?.name || '',
      pos:        _entries.length + 1,
    };

    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', entry);

    if (isRef && mat) _linkAgenda(ref, mat);

    document.getElementById('_opModal')?.remove();
    toast(isRef ? `📋 Ref ${ref}${mat?' · '+mat:''} registrada` : `✅ ${mat} registrado`, isRef?'var(--amber)':'var(--green)');

  } catch(err) {
    console.error('[Op] Error submit:', err);
    toast('Error al guardar', 'var(--red)');
    if (btn) { btn.disabled=false; btn.textContent = isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso'; }
  }
};

// ═══════════════════════════════════════════════════════════
// SUSCRIPCION FIRESTORE
// ═══════════════════════════════════════════════════════════
function _subscribeQueue() {
  const user = AppState.get('currentUser');
  if (_unsubQ) _unsubQ();
  _unsubQ = fsGate.subscribeQueue(
    user.eventId,
    user.gateId || 'puerta-1',
    (entries) => {
      _entries = entries;
      _updateCounters();
      _rerenderActive();
    },
    (err) => { console.error('[Op]', err); _setSyncStatus('error'); }
  );
  _setSyncStatus('ok');
}

function _updateCounters() {
  const hoy  = new Date().toDateString();
  const hoyN = _entries.filter(e => new Date(e.ts).toDateString()===hoy).length;
  const rec  = _entries.filter(e => !e.salida).length;
  const refs = _entries.filter(e => e.tipo==='referencia' && !e.salida).length;
  const s = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  s('cntHoy', hoyN); s('cntRecinto', rec); s('cntRef', refs);
}

function _rerenderActive() {
  if (_activeTab==='ingresos')   _renderIngresos();
  if (_activeTab==='referencia') _renderReferencia();
}

// ═══════════════════════════════════════════════════════════
// ACCIONES DE FILA
// ═══════════════════════════════════════════════════════════
window._opSalida = async function(id) {
  if (!confirm('Confirmar salida del vehiculo?')) return;
  const user = AppState.get('currentUser');
  try {
    await fsGate.registerExit(user.eventId, user.gateId||'puerta-1', id, { operadorSalida: user.name });
    toast('Salida registrada', 'var(--blue)', 1500);
  } catch { toast('Error al registrar salida', 'var(--red)'); }
};

window._opPrint = async function(id) {
  try {
    const { printEntry } = await import('./print.js');
    const entry = _entries.find(e=>e.id===id) || {id,matricula:'—'};
    await printEntry(entry, AppState.get('currentEvent')?.name||'BeUnifyT');
  } catch { toast('Error al imprimir', 'var(--red)'); }
};

window._opEdit = function(id) {
  const entry = _entries.find(e=>e.id===id);
  if (!entry) return;
  const isRef = entry.tipo==='referencia';
  _renderIngModal(isRef?'referencia':'ingresos');
  setTimeout(() => {
    const setV = (id,v) => { const el=document.getElementById(id); if(el&&v) el.value=v; };
    setV('mRef', entry.referencia);
    setV('mMat', entry.matricula);
    setV('mRem', entry.remolque);
    setV('mEmp', entry.empresa);
    setV('mMontador', entry.montador);
    setV('mExpositor', entry.expositor);
    setV('mLlamador', entry.llamador);
    setV('mHall', entry.hall);
    setV('mStand', entry.stand);
    setV('mNom', entry.nombre);
    setV('mApe', entry.apellido);
    setV('mTelP', entry.telPais);
    setV('mTel', entry.telefono);
    setV('mIdioma', entry.idioma);
    setV('mPas', entry.pasaporte);
    setV('mComent', entry.comentario);
  }, 50);
};

window._opDel = async function(id) {
  if (!confirm('Eliminar este registro?')) return;
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { doc, deleteDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    await deleteDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id));
    toast('Registro eliminado', 'var(--amber)', 1500);
  } catch { toast('Error al eliminar', 'var(--red)'); }
};

window._opDetail = function(id) {
  const e = _entries.find(x=>x.id===id);
  if (!e) return;
  alert(`Matricula: ${e.matricula}\nEmpresa: ${e.empresa||'—'}\nRef: ${e.referencia||'—'}\nHall: ${e.hall||'—'}\nStand: ${e.stand||'—'}\nEntrada: ${formatDateTime(e.ts)}\nSalida: ${e.salida?formatDateTime(e.salida):'En recinto'}`);
};

// ═══════════════════════════════════════════════════════════
// CONTROLES DE FILTRO Y BUSQUEDA
// ═══════════════════════════════════════════════════════════
window._opTab = function(tab) {
  _activeTab = tab;
  _sub = 'lista';
  document.querySelectorAll('.btn-tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  if (tab==='ingresos')   _renderIngresos();
  if (tab==='referencia') _renderReferencia();
  if (tab==='agenda')     _renderAgenda();
  if (tab==='embalaje')   _renderEmbalaje();
};

window._opSub     = (s)  => { _sub=s; _rerenderActive(); };
window._opQ       = (q)  => { _q=q; _rerenderActive(); };
window._opActivos = ()   => { _soloActivos=!_soloActivos; _rerenderActive(); };
window._opHall    = (h)  => { _hallFilter=h; _rerenderActive(); };

window._openIngModal = () => _renderIngModal('ingresos');
window._openRefModal = () => _renderIngModal('referencia');

window._tgl = function(hidId, val, activeId, otherIds) {
  document.getElementById(hidId).value = val;
  [activeId, ...(Array.isArray(otherIds)?otherIds:[otherIds])].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'btn btn-sm ' + (id===activeId ? 'btn-p' : 'btn-gh');
  });
};

window._tglForklift = function() {
  const dcH = document.getElementById('dcH');
  const dcF = document.getElementById('dcF');
  if (dcH) dcH.className='btn btn-sm btn-gh';
  if (dcF) dcF.className='btn btn-sm btn-a';
  document.getElementById('mDescarga').value='forklift';
};

window._tglEje = function(btn) {
  btn.parentElement.querySelectorAll('.btn').forEach(b=>b.className='btn btn-sm btn-gh');
  btn.className='btn btn-sm btn-a';
  document.getElementById('mEjes').value=btn.dataset.v;
};

window._checkBL = async function(mat) {
  if (!mat||mat.length<4) return;
  const warn = document.getElementById('mBlWarn');
  if (!warn) return;
  try {
    const user = AppState.get('currentUser');
    const db = getDB();
    const { collection, query, where, getDocs } = await import(`${FB_CDN}/firebase-firestore.js`);
    const snap = await getDocs(query(
      collection(db,'events',user.eventId,'blacklist'),
      where('matricula','==',mat.toUpperCase().trim())
    ));
    if (!snap.empty) {
      const bl = snap.docs[0].data();
      warn.innerHTML=`⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matricula en lista negra')}`;
      warn.style.display='block';
    } else { warn.style.display='none'; }
  } catch { warn.style.display='none'; }
};

window._searchRefAC = async function(val) {
  const ac    = document.getElementById('mRefAC');
  const match = document.getElementById('mRefMatch');
  if (!ac||!match||val.length<3) { if(ac) ac.style.display='none'; return; }
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { collection, query, where, getDocs, limit } = await import(`${FB_CDN}/firebase-firestore.js`);
    const snap = await getDocs(query(
      collection(db,'events',user.eventId,'agenda'),
      where('referencia','>=',val),
      where('referencia','<=',val+'\uf8ff'),
      limit(5)
    ));
    if (!snap.empty) {
      const items = snap.docs.map(d=>({id:d.id,...d.data()}));
      ac.style.display='block';
      ac.innerHTML=items.map(it=>`
        <div onclick="window._fillRef(${JSON.stringify(it).replace(/"/g,'&quot;')})"
          style="padding:8px 12px;cursor:pointer;border-bottom:0.5px solid var(--border);font-size:12px">
          <span style="font-weight:700;color:var(--amber)">${safeHtml(it.referencia)}</span>
          <span style="color:var(--text2);margin-left:8px">${safeHtml(it.empresa||'—')}</span>
        </div>`).join('');
    } else { ac.style.display='none'; }
  } catch { if(ac) ac.style.display='none'; }
};

window._fillRef = function(item) {
  const setV = (id,v) => { const el=document.getElementById(id); if(el&&v) el.value=v; };
  setV('mRef', item.referencia);
  setV('mEmp', item.empresa);
  setV('mHall', item.hall);
  setV('mStand', item.stand);
  setV('mNom', item.conductor?.split(' ')[0]);
  setV('mApe', item.conductor?.split(' ').slice(1).join(' '));
  const ac    = document.getElementById('mRefAC');
  const match = document.getElementById('mRefMatch');
  if (ac) ac.style.display='none';
  if (match) { match.innerHTML=`✅ Referencia en agenda · ${safeHtml(item.empresa||'')}${item.hall?' · Hall '+safeHtml(item.hall):''}`;match.style.display='block'; }
};

async function _linkAgenda(ref, mat) {
  try {
    const user = AppState.get('currentUser');
    const db   = getDB();
    const { collection, query, where, getDocs, doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const snap = await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','==',ref)));
    snap.docs.forEach(async d => await updateDoc(doc(db,'events',user.eventId,'agenda',d.id),{matricula:mat,matriculaTs:new Date().toISOString()}));
  } catch {}
}

window._exportExcel = async function(tab) {
  if (!_perms.canExport) { toast('Sin permiso para exportar','var(--red)'); return; }
  try {
    const { exportToExcel } = await import('./print.js');
    const items = tab==='referencia' ? _entries.filter(e=>e.tipo==='referencia') : _entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
    await exportToExcel(items, `beunifyt-${tab}`);
  } catch { toast('Error al exportar', 'var(--red)'); }
};

window._limpiarTab = function(tab) {
  if (!confirm('Limpiar registros de esta pestana?')) return;
  toast('Funcion disponible en admin panel', 'var(--amber)');
};

// ═══════════════════════════════════════════════════════════
// AGENDA y EMBALAJE (simplificados — visual igual a v6)
// ═══════════════════════════════════════════════════════════
function _renderAgenda() {
  const cnt = document.getElementById('opContent');
  if (!cnt) return;
  cnt.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px;overflow-x:auto;scrollbar-width:none">
      <span style="font-size:13px;font-weight:700">📅 Agenda de servicios</span>
      <span style="flex:1"></span>
      ${_perms.canEditAgenda?`<button class="btn btn-g btn-sm" onclick="window._addAgenda()">+ Anadir servicio</button>`:''}
      ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._exportAgenda()">⬇ Excel</button>`:''}
    </div>
    <div style="display:flex;gap:4px;margin-bottom:8px">
      <button class="btn btn-sm btn-gh" onclick="window._agFiltro('pendiente')">⏳ Pendientes</button>
      <button class="btn btn-sm btn-gh" onclick="window._agFiltro('hoy')">📅 Hoy</button>
      <button class="btn btn-sm btn-gh" onclick="window._agFiltro('todos')">Todos</button>
    </div>
    <div class="sbox" style="position:relative;margin-bottom:8px">
      <span style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px">🔍</span>
      <input type="search" placeholder="Referencia, empresa, matricula..."
        style="padding:7px 10px 7px 30px;font-size:13px;width:100%;text-transform:uppercase"
        oninput="window._agSearch(this.value.toUpperCase())">
    </div>
    <div id="agendaContent"><div style="text-align:center;padding:30px;color:var(--text3)">Cargando agenda...</div></div>`;
  _loadAgenda();
}

function _renderEmbalaje() {
  const cnt = document.getElementById('opContent');
  if (!cnt) return;
  cnt.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px">
      <span style="font-size:13px;font-weight:700">📦 Control de Embalaje</span>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="fgrid">
        <div class="fg s2">
          <span class="flbl">Matricula <span class="freq">*</span></span>
          <input id="eMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div class="fg"><span class="flbl">Conductor fijo</span><input id="eCond" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg s2">
          <span class="flbl">Tipo movimiento <span class="freq">*</span></span>
          <div style="display:flex;gap:4px">
            <button type="button" class="btn btn-gh btn-sm" id="eR" onclick="window._tgl('eTipo','retirada','eR','eD')" style="flex:1">📤 Retirada vacios</button>
            <button type="button" class="btn btn-gh btn-sm" id="eD" onclick="window._tgl('eTipo','devolucion','eD','eR')" style="flex:1">📥 Devolucion material</button>
          </div>
          <input type="hidden" id="eTipo">
        </div>
        <div class="fg"><span class="flbl">Material</span><input id="eMat2" placeholder="Pales, jaulas..."></div>
        <div class="fg"><span class="flbl">Cantidad</span><input id="eCant" type="number" min="1"></div>
        <div class="fg"><span class="flbl">Origen</span><input id="eOrig" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><span class="flbl">Destino</span><input id="eDest" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg s2"><span class="flbl">Nota</span><textarea id="eNota" rows="2"></textarea></div>
      </div>
      <div class="ffoot">
        <button class="btn btn-p" onclick="window._submitEmbalaje()">📦 Registrar movimiento</button>
      </div>
    </div>
    <div id="embList"><div style="text-align:center;padding:20px;color:var(--text3)">Sin movimientos registrados</div></div>`;
}

window._submitEmbalaje = async function() {
  const mat  = normalizePlate(document.getElementById('eMat')?.value);
  const tipo = document.getElementById('eTipo')?.value;
  if (!mat)  { toast('La matricula es obligatoria','var(--red)'); return; }
  if (!tipo) { toast('Selecciona el tipo de movimiento','var(--red)'); return; }
  const user = AppState.get('currentUser');
  try {
    await fsGate.registerEntry(user.eventId, user.gateId||'puerta-1', {
      matricula:mat, tipo:'embalaje', tipoMov:tipo,
      conductor:document.getElementById('eCond')?.value.trim(),
      material:document.getElementById('eMat2')?.value.trim(),
      cantidad:document.getElementById('eCant')?.value,
      origen:document.getElementById('eOrig')?.value.trim(),
      destino:document.getElementById('eDest')?.value.trim(),
      nota:document.getElementById('eNota')?.value.trim(),
      operadorId:user.uid, operador:user.name,
    });
    ['eMat','eCond','eMat2','eCant','eOrig','eDest','eNota','eTipo'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.querySelectorAll('#eR,#eD').forEach(b=>b.className='btn btn-gh btn-sm');
    toast('📦 Movimiento registrado','var(--purple)');
  } catch { toast('Error al registrar','var(--red)'); }
};

async function _loadAgenda(searchQ='', filtro='pendiente') {
  const el = document.getElementById('agendaContent');
  if (!el) return;
  const user = AppState.get('currentUser');
  try {
    const db = getDB();
    const { collection, getDocs, query, limit } = await import(`${FB_CDN}/firebase-firestore.js`);
    let snap = await getDocs(query(collection(db,'events',user.eventId,'agenda'),limit(200)));
    let items = snap.docs.map(d=>({id:d.id,...d.data()}));
    if (searchQ) { const sq=searchQ.toUpperCase(); items=items.filter(i=>(i.referencia||'').includes(sq)||(i.empresa||'').toUpperCase().includes(sq)||(i.matricula||'').includes(sq)); }
    if (filtro==='pendiente') items=items.filter(i=>i.estado!=='completado');
    if (filtro==='hoy') { const hoy=new Date().toISOString().slice(0,10); items=items.filter(i=>(i.fecha||'').slice(0,10)===hoy); }
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
  } catch(err) { el.innerHTML=`<div style="color:var(--red);padding:16px">Error cargando agenda</div>`; }
}

window._agSearch = (q)     => _loadAgenda(q, 'todos');
window._agFiltro = (filtro) => _loadAgenda('', filtro);
window._addAgenda = ()      => toast('Anadir servicio de agenda — disponible en admin', 'var(--blue)');
window._exportAgenda = ()   => toast('Exportar agenda — disponible en admin', 'var(--blue)');

// ═══════════════════════════════════════════════════════════
// BIND SHELL
// ═══════════════════════════════════════════════════════════
function _bindShell() {
  document.getElementById('btnLogout')?.addEventListener('click', logout);
  document.getElementById('btnTheme')?.addEventListener('click', () => {
    const themes = ['default','dark','soft','contrast'];
    const curr   = AppState.get('theme')||'default';
    const next   = themes[(themes.indexOf(curr)+1)%themes.length];
    AppState.set('theme', next);
    toast(`Tema: ${next}`, 'var(--blue)', 1200);
  });
  // Render tab inicial
  _renderIngresos();
}

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════
function _v(id)  { const el=document.getElementById(id); return el ? el.value.trim() : ''; }
function _fv(cfg, key, html) { return (!cfg[key]||cfg[key].vis===false) ? '' : html; }
function _req(cfg, key) { return cfg[key]?.req ? ' <span class="freq">*</span>' : ''; }
function _matchQ(e, q) {
  const s = q.toLowerCase();
  return `${e.pos||''} ${e.matricula||''} ${e.nombre||''} ${e.apellido||''} ${e.empresa||''} ${e.llamador||''} ${e.referencia||''} ${e.hall||''} ${e.stand||''} ${e.remolque||''} ${e.comentario||''} ${e.telefono||''} ${e.conductor||''}`.toLowerCase().includes(s);
}
function _getHalls() {
  const halls = new Set();
  _entries.forEach(e => { if(e.hall) halls.add(e.hall); });
  return [...halls].sort();
}
function _setSyncStatus(s) {
  const dot=document.getElementById('syncDot');
  const txt=document.getElementById('syncTxt');
  if(!dot||!txt) return;
  const m={ok:['sd-g',''],syncing:['sd-y','...'],error:['sd-r','Error']};
  dot.className=`sd ${m[s]?.[0]||'sd-y'}`;
  txt.textContent=m[s]?.[1]||'...';
}
function _idOpts() {
  return `<option value="">--</option>` + ['es','en','fr','de','it','pt','nl','pl','ro','ru','uk','cs','sk','hu','bg','hr','tr','ar','zh'].map(l=>`<option value="${l}">${l}</option>`).join('');
}
