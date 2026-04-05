// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — core/shared.js
// Constants, badges, sort, telLink, modal helpers, shared utilities.
// ═══════════════════════════════════════════════════════════════════════
import { safeHtml, formatDate, uid, nowLocal, normPlate } from '../utils.js';
import { isSA, isSup, hasPerm } from '../auth.js';
import { DB, iF, SID, CUR_LANG, registerFn, callFn } from './context.js';

export const esc = safeHtml;
export const fmt = formatDate;

export const EYE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

// ═══ V6 CONSTANTS ═══
export const HALLS=['1','2A','2B','3A','3B','4','5','6','7','8','CS'];
export const SCFG={ALMACEN:{l:'ALMACEN',i:'📦',cls:'s-alm',c:'var(--almacen)'},SOT:{l:'SOT',i:'⏱',cls:'s-sot',c:'var(--sot)'},FIRA:{l:'FIRA',i:'🟢',cls:'s-fira',c:'var(--fira)'},FINAL:{l:'FINAL',i:'✅',cls:'s-fin',c:'#6b7280'}};
export const CCFG={EF:{i:'🔴',c:'#dc2626'},SUNDAY:{i:'🟣',c:'#7c3aed'},PRIORITY:{i:'🟠',c:'#ea580c'},GOODS:{i:'🟢',c:'#16a34a'},EMPTY:{i:'⚪',c:'#64748b'}};
export const TV={camion:'🚛 Camión',semiremolque:'🚚 Semirremolque',furgoneta:'🚐 Furgoneta',trailer:'🚛 Trailer',coche:'🚗 Coche',moto:'🏍 Moto',otro:'📦 Otro'};
export const TV_FIRA={trailer:{lbl:'🚛 Trailer',id:'tvTrailer',val:'trailer'},semiremolque:{lbl:'🚚 B',id:'tvB',val:'semiremolque'},camion:{lbl:'🚗 A',id:'tvA',val:'camion'}};
export const TV_STD={trailer:{lbl:'🚛 Trailer',id:'tvTrailer',val:'trailer'},semiremolque:{lbl:'🚚 Semirrem.',id:'tvB',val:'semiremolque'},camion:{lbl:'🚗 Camión',id:'tvA',val:'camion'}};
export const GP={tarjeta:'💳 Tarjeta',efectivo:'💵 Efectivo',ambos:'💳💵 Mixto'};
export const PP={temporal:'🎫 Temporal',evento:'📋 Evento',vip:'⭐ VIP',staff:'🔧 Staff'};
export const EV_CAMPOS=['posicion','llamador','ref','empresa','hall','stand','puertaHall','montador','expositor','nombre','apellido','pasaporte','telefono','email','comentario','horario','fechaNacimiento','pais','remolque','tipoVehiculo','descargaTipo'];
export const PRINT_DEF=['posicion','matricula','telefono','empresa','hall','stand','puertaHall','llamador','ref','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','pais','email','comentario','horario'];
export const TRACKING_STEPS=[
  {id:'rampa',ico:'🅿️',name:'Rampa',fixed:true},
  {id:'cabina',ico:'🏢',name:'Cabina',fixed:true},
  {id:'salida_parking',ico:'🚗',name:'Salida Parking'},
  {id:'en_ruta',ico:'🛣️',name:'En Ruta al Recinto'},
  {id:'entrada_recinto',ico:'🏟️',name:'Entrada Recinto'},
  {id:'descarga',ico:'📦',name:'Serv. Desc/Carga'},
  {id:'carga',ico:'📦',name:'Carga'},
  {id:'en_espera',ico:'⏳',name:'En Espera'},
  {id:'retorno',ico:'🔙',name:'Retorno Parking'},
  {id:'terminado',ico:'✅',name:'Servicio Terminado',end:true}
];
export const PRINT_LABELS={posicion:'🔢 Posición',matricula:'🚛 Matrícula',telefono:'📱 Teléfono',nombre:'👤 Nombre',apellido:'👤 Apellido',empresa:'🏢 Empresa',hall:'🏭 Hall',stand:'📍 Stand',puertaHall:'🚪 Puerta Hall',llamador:'📞 Llamador',ref:'🔖 Ref/Booking',montador:'🔧 Montador',expositor:'🎪 Expositor',remolque:'🚚 Remolque',tipoVehiculo:'🚗 Tipo Vehículo',descargaTipo:'📦 Serv. Descarga/Carga',pasaporte:'🪪 Pasaporte/DNI',fechaNacimiento:'🎂 F. Nacimiento',pais:'🌍 País',email:'✉️ Email',comentario:'📝 Comentario',horario:'🕐 Horario Ingreso'};
export const PAISES=[{code:'+34',flag:'🇪🇸'},{code:'+33',flag:'🇫🇷'},{code:'+49',flag:'🇩🇪'},{code:'+39',flag:'🇮🇹'},{code:'+351',flag:'🇵🇹'},{code:'+44',flag:'🇬🇧'},{code:'+31',flag:'🇳🇱'},{code:'+32',flag:'🇧🇪'},{code:'+41',flag:'🇨🇭'},{code:'+43',flag:'🇦🇹'},{code:'+45',flag:'🇩🇰'},{code:'+46',flag:'🇸🇪'},{code:'+47',flag:'🇳🇴'},{code:'+48',flag:'🇵🇱'},{code:'+40',flag:'🇷🇴'},{code:'+36',flag:'🇭🇺'},{code:'+420',flag:'🇨🇿'},{code:'+421',flag:'🇸🇰'},{code:'+385',flag:'🇭🇷'},{code:'+386',flag:'🇸🇮'},{code:'+359',flag:'🇧🇬'},{code:'+30',flag:'🇬🇷'},{code:'+353',flag:'🇮🇪'},{code:'+358',flag:'🇫🇮'},{code:'+370',flag:'🇱🇹'},{code:'+371',flag:'🇱🇻'},{code:'+372',flag:'🇪🇪'},{code:'+380',flag:'🇺🇦'},{code:'+7',flag:'🇷🇺'},{code:'+90',flag:'🇹🇷'},{code:'+212',flag:'🇲🇦'},{code:'+1',flag:'🇺🇸'},{code:'+52',flag:'🇲🇽'},{code:'+55',flag:'🇧🇷'},{code:'+54',flag:'🇦🇷'},{code:'+57',flag:'🇨🇴'},{code:'+56',flag:'🇨🇱'},{code:'+61',flag:'🇦🇺'},{code:'+64',flag:'🇳🇿'}];

export const LANGS_UI = [
  {code:'es',flag:'🇪🇸',name:'Español'},{code:'en',flag:'🇬🇧',name:'English'},
  {code:'fr',flag:'🇫🇷',name:'Français'},{code:'de',flag:'🇩🇪',name:'Deutsch'},
  {code:'it',flag:'🇮🇹',name:'Italiano'},{code:'pt',flag:'🇵🇹',name:'Português'},
  {code:'ar',flag:'🇲🇦',name:'عربية'},{code:'pl',flag:'🇵🇱',name:'Polski'},
  {code:'ro',flag:'🇷🇴',name:'Română'},{code:'nl',flag:'🇳🇱',name:'Nederlands'},
  {code:'hu',flag:'🇭🇺',name:'Magyar'},{code:'cs',flag:'🇨🇿',name:'Čeština'},
  {code:'ca',flag:'🇪🇸',name:'Català'},{code:'eu',flag:'🇪🇸',name:'Euskara'},
  {code:'gl',flag:'🇪🇸',name:'Galego'},{code:'uk',flag:'🇺🇦',name:'Українська'},
  {code:'ru',flag:'🇷🇺',name:'Русский'},{code:'tr',flag:'🇹🇷',name:'Türkçe'},
  {code:'sv',flag:'🇸🇪',name:'Svenska'},{code:'fi',flag:'🇫🇮',name:'Suomi'},
  {code:'el',flag:'🇬🇷',name:'Ελληνικά'},{code:'bg',flag:'🇧🇬',name:'Български'},
  {code:'sk',flag:'🇸🇰',name:'Slovenčina'},{code:'sl',flag:'🇸🇮',name:'Slovenščina'},
  {code:'hr',flag:'🇭🇷',name:'Hrvatski'},
];

// ═══ TRANSLATION (stub — scales with JSON files later) ═══
export function tr(k) { return k; }

// ═══ BADGES ═══
export function hBadge(h) { return h ? `<span class="hbadge">${h}</span>` : '–'; }
export function sBadge(s) { const c = SCFG[s] || {l:s,i:'',cls:'s-fin'}; return `<span class="sbadge ${c.cls}">${c.i} ${c.l}</span>`; }
export function sAgBadge(s) { return `<span class="sbadge s-${s||'PENDIENTE'}">${s||'PENDIENTE'}</span>`; }
export function cBadge(c) { const x = CCFG[c]; return x ? `<span class="cbadge" style="color:${x.c}">${x.i} ${c}</span>` : '–'; }

// ═══ TIME DIFF ═══
export function diffMins(p, r) {
  if (!p || !r) return null;
  try {
    const tp = new Date('1970-01-01T' + (p.length > 5 ? p.slice(-5) : p));
    const tr2 = new Date('1970-01-01T' + (r.length > 5 ? r.slice(-5) : r));
    return Math.round((tr2 - tp) / 60000);
  } catch(e) { return null; }
}
export function diffClass(d) { if (d === null) return ''; if (Math.abs(d) <= 10) return 'diff-ok'; if (d > 10) return 'diff-tard'; return 'diff-ant'; }
export function diffLabel(d) { if (d === null) return '–'; if (Math.abs(d) <= 2) return '✓ Puntual'; if (d > 0) return `+${d}min`; return `${Math.abs(d)}min ant.`; }
export function addH(ts, h) { if (!ts) return null; const d = new Date(String(ts).replace(' ', 'T')); d.setHours(d.getHours() + h); return d.toISOString().replace('T', ' ').slice(0, 19); }

// ═══ SORT ═══
export function sortArr(arr, col, dir) {
  if (!col) return arr;
  return [...arr].sort((a, b) => {
    let va = a[col], vb = b[col];
    const aN = va === undefined || va === null || va === '';
    const bN = vb === undefined || vb === null || vb === '';
    if (aN && bN) return 0; if (aN) return 1; if (bN) return -1;
    const n = parseFloat(va), m = parseFloat(vb);
    const cmp = (!isNaN(n) && !isNaN(m)) ? (n - m) : String(va).localeCompare(String(vb), 'es', { numeric: true });
    return dir === 'desc' ? -cmp : cmp;
  });
}

export function getSort(tab) {
  const defs = {ingresos:{col:'pos',dir:'desc'},ingresos2:{col:'pos',dir:'desc'},agenda:{col:'hora',dir:'asc'},flota:{col:'posicion',dir:'asc'},vehiculos:{col:'entrada',dir:'desc'}};
  return (DB.tabSorts && DB.tabSorts[tab]) || defs[tab] || {col:'',dir:'asc'};
}

export function setSort(tab, col) {
  const cur = getSort(tab);
  const dir = (cur.col === col && cur.dir === 'asc') ? 'desc' : 'asc';
  if (!DB.tabSorts) DB.tabSorts = {};
  DB.tabSorts[tab] = {col, dir};
  // Call the appropriate render function via registry
  const renders = {ingresos:'renderIngresos',ingresos2:'renderIngresos2',flota:'renderFlota',conductores:'renderConductores',agenda:'renderAgenda',vehiculos:'renderVehiculos'};
  if (renders[tab]) callFn(renders[tab]);
}

export function thSort(tab, col, label) {
  const s = getSort(tab);
  const isActive = s.col === col;
  const ico = isActive ? (s.dir === 'asc' ? String.fromCharCode(8593) : String.fromCharCode(8595)) : String.fromCharCode(8661);
  const colStyle = isActive ? 'color:var(--blue);font-weight:600;' : '';
  return `<th style="cursor:pointer;user-select:none;white-space:nowrap;${colStyle}" onclick="window._op.setSort('${tab}','${col}')">${label} <span style="font-size:9px">${ico}</span></th>`;
}

// ═══ TEL LINK ═══
export function telLink(telPais, tel) {
  if (!tel || !tel.trim()) return '–';
  var full = (telPais || '') + tel.trim().replace(/\s+/g, '');
  var wa = full.replace('+', '').replace(/[^0-9]/g, '');
  var ph = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.45 1.17h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  var ws = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.18 8.18 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.52 5.843L.057 23.5l5.805-1.522A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.513-5.16-1.406l-.37-.22-3.444.903.92-3.352-.24-.386A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';
  return '<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:' + full + '" style="color:var(--green);text-decoration:none;display:flex" title="Llamar">' + ph + '</a><a href="https://wa.me/' + wa + '" target="_blank" style="color:#25D366;text-decoration:none;display:flex" title="WhatsApp">' + ws + '</a><span style="font-size:11px">' + tel + '</span></div>';
}

// ═══ HALLS ═══
export function getRecintoHalls() {
  const ev = getActiveEvent();
  if (ev?.halls && ev.halls.length) return ev.halls;
  if (ev?.recintoId) {
    const r = DB.recintos.find(x => x.id === ev.recintoId);
    if (r && r.halls && r.halls.length) return r.halls;
  }
  return HALLS;
}

export function getActiveEvent() {
  if (!DB.activeEventId) return null;
  return DB.eventos.find(e => e.id === DB.activeEventId) || null;
}

export function getTabEvent(tab) { return getActiveEvent(); }

// ═══ DEBOUNCE ═══
const _debounceTimers = {};
export function debounceSearch(key, fn, delay = 180) {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(fn, delay);
}

// ═══ MODAL ═══
export function _modal(title, bodyHtml, onSave) {
  const id = 'dynModal';
  const existing = document.getElementById(id); if (existing) existing.remove();
  const bg = document.createElement('div');
  bg.id = id; bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal-box">
    <div class="modal-hdr"><div class="modal-ttl">${title}</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="document.getElementById('${id}').remove()">✕</button></div>
    ${bodyHtml}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-gh btn-sm" onclick="document.getElementById('${id}').remove()">Cancelar</button>
      <button class="btn btn-p btn-sm" id="dynModalSave">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(bg);
  document.getElementById('dynModalSave').onclick = async () => {
    try {
      await onSave();
      document.getElementById(id)?.remove();
    } catch(e) { console.error('[modal save]', e); }
  };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  setTimeout(() => bg.querySelector('input,select,textarea')?.focus(), 100);
}

export function gv(id) { return (document.getElementById(id)?.value || '').trim(); }

export function askDel(title, detail, fn) {
  const existing = document.getElementById('beuDelModal');
  if (existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = 'beuDelModal';
  ov.className = 'ov open';
  ov.innerHTML = `<div class="modal modal-sm"><div class="mhdr"><span class="mttl">⚠️ ${title}</span></div><div style="padding:10px 0;font-size:13px;color:var(--text2)">${detail}</div><div style="font-size:11px;color:var(--text3);margin-bottom:12px">Esta acción no se puede deshacer</div><div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('beuDelModal').remove()">Cancelar</button><button class="btn btn-danger" id="beuDelConfirm" style="background:var(--red);color:#fff">Eliminar</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('beuDelConfirm').addEventListener('click', () => { ov.remove(); if (fn) fn(); });
}

// ═══ CHECK BLACKLIST ═══
export function checkBL(mat) {
  if (!mat || !DB.listaNegra?.length) return null;
  const norm = normPlate(mat);
  return DB.listaNegra.find(ln => normPlate(ln.matricula) === norm) || null;
}

// ═══ AUDIT/LOG HELPERS ═══
export function logAudit(a, e, d) {
  if (!DB.auditLog) DB.auditLog = [];
  const CU = _getCU();
  DB.auditLog.unshift({id:uid(), ts:nowLocal(), user:CU?.nombre||'?', action:a, entity:e, detail:d});
  if (DB.auditLog.length > 300) DB.auditLog = DB.auditLog.slice(0, 300);
}

export function logExport(tab, filename) {
  if (!DB.exportLog) DB.exportLog = [];
  const CU = _getCU();
  DB.exportLog.unshift({id:uid(), ts:nowLocal(), user:CU?.nombre||'?', tab, filename});
}

export function _getCU() {
  return AppState.get('currentUser');
}

export function autoMsg(tipo, titulo, mensaje, mat='', horasExpira=null) {
  const CU = _getCU();
  const expiraTs = horasExpira ? Date.now() + (horasExpira * 60 * 60 * 1000) : null;
  const m = {id:uid(), ts:nowLocal(), autor:CU?.nombre||'Sistema', tipo, titulo, mensaje, matricula:mat, leido:[SID], pausado:false, expiraTs};
  DB.mensajesRampa.unshift(m);
  if (DB.mensajesRampa.length > 100) DB.mensajesRampa = DB.mensajesRampa.slice(0, 100);
  callFn('saveDB');
}

// ═══ EXPOSE ON WINDOW ═══
window.hBadge = hBadge;
window.sBadge = sBadge;
window.cBadge = cBadge;
window.sAgBadge = sAgBadge;
window.sortArr = sortArr;
window.getRecintoHalls = getRecintoHalls;
window.tr = tr;
window.fmt = fmt;
window.esc = esc;
window.debounceSearch = debounceSearch;
window.normPlate = normPlate;
