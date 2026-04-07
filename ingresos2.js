// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo Ingresos COMPLETO
// Subtabs: Lista, Especial, Modificaciones, Campos
// Panel columnas con plantillas, sort, context menu, filtros hall
// Autocomplete matrícula + scanner, alertas especiales, historial timeline
// ⚠ ERROR GRAVE PENDIENTE: id 'ingresos2' debería ser 'ingresos'
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, formatDate, debounce, sortBy, normPlate } from './utils.js';

const MODULE = 'ingresos2';
const COLLECTION = 'accesos';
const TITLE = 'Ingresos';

let _c, _u, _data = [], _filtered = [], _unsub;
let _sub = 'lista', _search = '', _hallFilter = '', _activosOnly = false, _dateFilter = '', _statusFilter = '';
let _sortCol = 'fecha', _sortDir = 'desc';

// Column system
const ALL_COLS = [
  {id:'pos',label:'#',req:true},{id:'matricula',label:'Matrícula',req:true},
  {id:'remolque',label:'Remolque'},{id:'llamador',label:'Llamador'},
  {id:'referencia',label:'Ref.'},{id:'conductor',label:'Conductor'},
  {id:'empresa',label:'Empresa'},{id:'telefono',label:'Tel.'},
  {id:'hall',label:'Hall'},{id:'stand',label:'Stand'},
  {id:'estado',label:'Estado'},{id:'entrada',label:'Entrada'},
  {id:'acciones',label:'Acc.',req:true},
];
const DEF_VIS = ALL_COLS.map(c => c.id);
let _visCols = [...DEF_VIS];
let _colTpls = {};
try { _colTpls = JSON.parse(localStorage.getItem(`beu_tpls_${MODULE}`) || '{}'); } catch(e) {}
try { const v = JSON.parse(localStorage.getItem(`beu_vis_${MODULE}`)); if (v) _visCols = v; } catch(e) {}

// Especiales (alertas)
let _especiales = [];
// Historial (modificaciones)
let _historial = [];
// Campos config
let _camposState = {};
ALL_COLS.forEach(c => _camposState[c.id] = { visible: true, required: !!c.req, label: c.label });
try { const cs = JSON.parse(localStorage.getItem(`beu_campos_${MODULE}`)); if (cs) _camposState = cs; } catch(e) {}

function _s(k) { return trFree('shell', k) || k; }
function _saveVisCols() { try { localStorage.setItem(`beu_vis_${MODULE}`, JSON.stringify(_visCols)); } catch(e) {} }
function _saveTpls() { try { localStorage.setItem(`beu_tpls_${MODULE}`, JSON.stringify(_colTpls)); } catch(e) {} }
function _saveCampos() { try { localStorage.setItem(`beu_campos_${MODULE}`, JSON.stringify(_camposState)); } catch(e) {} }

const STATUS = { EN_RECINTO:'En recinto', EN_CAMINO:'En camino', ESPERA:'En espera', RAMPA:'Rampa', SALIDA:'Salida', SIN_ASIGNAR:'Sin asignar' };
const ST_CLASS = { EN_RECINTO:'dcfce7;color:#15803d', EN_CAMINO:'dbeafe;color:#1d4ed8', ESPERA:'fef9c3;color:#a16207', RAMPA:'ede9fe;color:#6d28d9', SALIDA:'f1f5f9;color:#64748b', SIN_ASIGNAR:'f8fafc;color:#94a3b8' };
function stPill(s) { const bg = ST_CLASS[s] || ST_CLASS.SIN_ASIGNAR; return `<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;background:#${bg}">${STATUS[s]||s||'—'}</span>`; }

function isDark() { return _u?.tema === 'dark'; }
function v(k) { return isDark() ? k[1] : k[0]; }
const C = () => ({
  bg: v(['#f4f5f7','#0f172a']), card: v(['#fff','#1e293b']), bg2: v(['#f8f9fc','#0f172a']),
  border: v(['#e4e7ec','#334155']), text: v(['#1a2235','#e2e8f0']), text3: v(['#6b7a90','#94a3b8']),
  blue: '#2c5ee8', bll: v(['#eef2ff','rgba(44,94,232,.1)']), green: '#0d9f6e',
});

// ═══════════════════════════════════════════════════════════
// ENTRY
// ═══════════════════════════════════════════════════════════
export function render(container, usuario) {
  _c = container; _u = usuario;
  _data = []; _filtered = []; _sub = 'lista';
  paint(); loadData(); loadEspeciales(); loadHistorial();
  return () => { if (_unsub) _unsub(); };
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
async function loadData() {
  try {
    const { fsListen } = await import('./firestore.js');
    if (_unsub) _unsub();
    _unsub = await fsListen(COLLECTION, docs => {
      const r = _u.recinto || '';
      _data = r ? docs.filter(d => d.recinto === r) : docs;
      applyFilter(); renderContent();
    });
  } catch(e) { console.warn(`${MODULE} load:`, e); }
}
async function loadEspeciales() {
  try {
    const { fsListen } = await import('./firestore.js');
    await fsListen(`${COLLECTION}_especiales`, docs => { _especiales = docs; if (_sub === 'listanegra') renderContent(); });
  } catch(e) { _especiales = []; }
}
async function loadHistorial() {
  try {
    const { fsListen } = await import('./firestore.js');
    await fsListen(`${COLLECTION}_historial`, docs => { _historial = docs; if (_sub === 'historial') renderContent(); });
  } catch(e) { _historial = []; }
}

function _getHalls() {
  const s = new Set(); _data.forEach(d => { if (d.hall) s.add(d.hall); }); return [...s].sort();
}

function applyFilter() {
  let items = [..._data];
  if (_hallFilter) items = items.filter(d => d.hall === _hallFilter);
  if (_activosOnly) items = items.filter(d => d.estado === 'EN_RECINTO');
  if (_statusFilter) items = items.filter(d => d.estado === _statusFilter);
  if (_dateFilter) items = items.filter(d => (d.fecha || '').startsWith(_dateFilter));
  if (_search) {
    const q = _search.toLowerCase();
    items = items.filter(d => `${d.matricula||''} ${d.nombre||''} ${d.apellido||''} ${d.empresa||''} ${d.llamador||''} ${d.hall||''} ${d.referencia||''} ${d.stand||''}`.toLowerCase().includes(q));
  }
  // Sort
  items.sort((a, b) => {
    const av = String(a[_sortCol] ?? ''), bv = String(b[_sortCol] ?? '');
    const r = av.localeCompare(bv, undefined, { numeric: true });
    return _sortDir === 'asc' ? r : -r;
  });
  _filtered = items;
}

// ═══════════════════════════════════════════════════════════
// PAINT SHELL
// ═══════════════════════════════════════════════════════════
function paint() {
  const c = C();
  const p = _u.permisos || {};
  const halls = _getHalls();
  applyFilter();

  _c.innerHTML = `
  <div style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;height:100%">
    <!-- TOPBAR -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;flex-shrink:0">
      <div style="font-size:22px;font-weight:700;letter-spacing:-.4px;color:${c.text}">${TITLE}</div>
      <span style="font-size:11px;color:${c.text3}">${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
      <span style="flex:1"></span>
      ${p.canAdd ? `<button id="_add" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Añadir ingreso</button>` : ''}
    </div>
    <!-- CARD -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:${c.card};border:1px solid ${c.border};border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.04)">
      <!-- SUBTABS + ACTIONS -->
      <div style="display:flex;align-items:center;gap:3px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none;flex-wrap:wrap">
        ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modif.'],...(p.canCampos?[['campos','⚙ Campos']]:[])].map(([s,l])=>`<button class="_stab" data-st="${s}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:${_sub===s?'600':'500'};background:${_sub===s?c.bll:'transparent'};color:${_sub===s?c.blue:c.text3};cursor:pointer;border:${_sub===s?`1px solid ${c.blue}`:'1px solid transparent'};white-space:nowrap">${l}</button>`).join('')}
        <span style="flex:1"></span>
        <div style="display:flex;gap:3px;flex-shrink:0;align-items:center;flex-wrap:wrap">
          ${p.canExport&&_sub==='lista'?`<button class="_btn" data-act="export" style="padding:4px 10px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⬇ Excel</button>`:''}
          ${_sub==='lista'?`<button class="_btn" data-act="cols" style="padding:4px 10px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⚙ Cols</button>`:''}
        </div>
      </div>
      ${_sub!=='historial'&&_sub!=='campos'?`
      <!-- FILTERS -->
      <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
        <div style="flex:1;min-width:140px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px">
          <span style="font-size:13px;opacity:.5">🔍</span>
          <input id="_q" type="search" placeholder="${_s('search')}" value="${safeHtml(_search)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit">
        </div>
        <input id="_date" type="date" value="${_dateFilter}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 10px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.text3}">
        <select id="_status" style="border:1px solid ${c.border};border-radius:20px;padding:4px 10px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.text3}">
          <option value="">Todos los estados</option>
          ${Object.entries(STATUS).map(([k,v])=>`<option value="${k}"${_statusFilter===k?' selected':''}>${v}</option>`).join('')}
        </select>
        <span id="_activos" style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_activosOnly?c.blue:c.border};background:${_activosOnly?c.blue:c.card};color:${_activosOnly?'#fff':c.text3};user-select:none">Solo activos</span>
        ${_search||_hallFilter||_activosOnly||_dateFilter||_statusFilter?`<span id="_clearF" style="display:inline-flex;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:#fef2f2;color:#dc2626;border:1px solid #fecaca">✕</span>`:''}
        <span style="font-size:10px;color:${c.text3};white-space:nowrap">${_filtered.length} reg.</span>
      </div>
      <!-- HALLS -->
      ${halls.length?`<div style="display:flex;gap:4px;padding:6px 12px;border-bottom:1px solid ${c.border};flex-wrap:wrap;flex-shrink:0">
        <span class="_hp" data-h="" style="padding:3px 11px;border-radius:20px;font-size:11px;font-weight:${!_hallFilter?'700':'500'};cursor:pointer;background:${!_hallFilter?c.bll:c.bg2};color:${!_hallFilter?c.blue:c.text3};border:1px solid ${!_hallFilter?c.blue:c.border}">${_s('all')}</span>
        ${halls.map(h=>`<span class="_hp" data-h="${h}" style="padding:3px 11px;border-radius:20px;font-size:11px;font-weight:${_hallFilter===h?'700':'500'};cursor:pointer;background:${_hallFilter===h?c.blue:c.bg2};color:${_hallFilter===h?'#fff':c.text3};border:1px solid ${_hallFilter===h?c.blue:c.border}">${h}</span>`).join('')}
      </div>`:''}`:''}
      <!-- CONTENT -->
      <div id="_body" style="flex:1;overflow:auto"></div>
    </div>
  </div>
  <!-- COL PANEL -->
  <div id="_colPanel" style="position:fixed;top:0;right:-300px;width:280px;height:100vh;background:${c.card};border-left:1px solid ${c.border};box-shadow:-4px 0 20px rgba(0,0,0,.08);z-index:500;display:flex;flex-direction:column;transition:right .25s"></div>`;

  // Events
  _bindEvents();
  renderContent();
}

function _bindEvents() {
  const c = C();
  _c.querySelectorAll('._stab').forEach(b => b.onclick = () => { _sub = b.dataset.st; paint(); });
  _c.querySelectorAll('._hp').forEach(b => b.onclick = () => { _hallFilter = b.dataset.h; applyFilter(); paint(); });
  const qi = _c.querySelector('#_q');
  if (qi) qi.oninput = debounce(() => { _search = qi.value.trim(); applyFilter(); renderContent(); }, 250);
  const di = _c.querySelector('#_date');
  if (di) di.onchange = () => { _dateFilter = di.value; applyFilter(); paint(); };
  const si = _c.querySelector('#_status');
  if (si) si.onchange = () => { _statusFilter = si.value; applyFilter(); paint(); };
  const act = _c.querySelector('#_activos');
  if (act) act.onclick = () => { _activosOnly = !_activosOnly; applyFilter(); paint(); };
  const clr = _c.querySelector('#_clearF');
  if (clr) clr.onclick = () => { _search=''; _hallFilter=''; _activosOnly=false; _dateFilter=''; _statusFilter=''; applyFilter(); paint(); };
  const add = _c.querySelector('#_add');
  if (add) add.onclick = () => openIngModal();
  _c.querySelectorAll('._btn').forEach(b => {
    if (b.dataset.act === 'export') b.onclick = () => exportData();
    if (b.dataset.act === 'cols') b.onclick = () => openColPanel();
  });
}

// ═══════════════════════════════════════════════════════════
// RENDER CONTENT (subtab router)
// ═══════════════════════════════════════════════════════════
function renderContent() {
  const body = _c.querySelector('#_body');
  if (!body) return;
  if (_sub === 'lista') body.innerHTML = renderLista();
  else if (_sub === 'listanegra') body.innerHTML = renderEspecial();
  else if (_sub === 'historial') body.innerHTML = renderHistorial();
  else if (_sub === 'campos') body.innerHTML = renderCampos();
}

// ═══════════════════════════════════════════════════════════
// LISTA — tabla con columnas, sort, context menu
// ═══════════════════════════════════════════════════════════
function renderLista() {
  if (!_filtered.length) return `<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">🚛</div><div style="font-weight:600;margin-top:6px">${_s('noData')}</div></div>`;
  const c = C(); const p = _u.permisos || {};
  const cols = ALL_COLS.filter(col => _visCols.includes(col.id));
  const sortable = ['pos','matricula','llamador','referencia','conductor','empresa','hall','estado','entrada'];

  const thead = cols.map(col => {
    const isSorted = _sortCol === col.id;
    const cls = isSorted ? (_sortDir === 'asc' ? ' ▲' : ' ▼') : '';
    return `<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${c.text3};border-bottom:1px solid ${c.border};white-space:nowrap;cursor:pointer;background:${c.bg2};user-select:none"
      onclick="window._beu2Sort('${col.id}')" oncontextmenu="window._beu2Ctx(event,'${col.id}')">${col.label}${cls}</th>`;
  }).join('');

  const tbody = _filtered.map(d => `<tr style="border-top:1px solid ${isDark()?'#334155':'#f4f5f8'}">
    ${cols.map(col => _cellVal(d, col.id, p)).join('')}
  </tr>`).join('');

  return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

function _cellVal(d, cid, p) {
  const c = C();
  switch(cid) {
    case 'pos': return `<td style="padding:8px 12px;font-weight:700;color:${c.text3}">${d.pos||d._pos||''}</td>`;
    case 'matricula': return `<td style="padding:8px 12px"><span style="background:#1a2235;color:#fff;font-family:monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;cursor:pointer;display:inline-block;box-shadow:0 2px 6px rgba(26,34,53,.15)" onclick="window._beu2Det('${d.id}')">${safeHtml(d.matricula||'—')}</span>${d.remolque?`<br><span style="background:${c.bg2};color:${c.text3};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:2px">${safeHtml(d.remolque)}</span>`:''}</td>`;
    case 'remolque': return `<td style="padding:8px 12px;font-size:11px;color:${c.text3}">${safeHtml(d.remolque||'–')}</td>`;
    case 'llamador': return `<td style="padding:8px 12px;font-size:11px">${safeHtml(d.llamador||'–')}</td>`;
    case 'referencia': return `<td style="padding:8px 12px;font-size:11px;font-family:monospace;color:${c.text3}">${safeHtml(d.referencia||'–')}</td>`;
    case 'conductor': return `<td style="padding:8px 12px">${d.nombre?`<b style="font-size:12px">${safeHtml(d.nombre)} ${safeHtml(d.apellido||'')}</b>`:''} ${d.empresa?`<br><span style="font-size:11px;color:${c.text3}">${safeHtml(d.empresa)}</span>`:''} ${!d.nombre&&!d.empresa?`<span style="color:${c.text3}">–</span>`:''}</td>`;
    case 'empresa': return `<td style="padding:8px 12px;font-size:11px;color:${c.text3}">${safeHtml(d.empresa||'–')}</td>`;
    case 'telefono': return `<td style="padding:8px 12px">${_telLink(d.telPais||'+34', d.telefono)}</td>`;
    case 'hall': return `<td style="padding:8px 12px"><span style="background:${c.bll};color:${c.blue};font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-block;border:1px solid #c7d7f8">${safeHtml(d.hall||'–')}</span></td>`;
    case 'stand': return `<td style="padding:8px 12px;font-size:11px">${safeHtml(d.stand||'–')}</td>`;
    case 'estado': return `<td style="padding:8px 12px">${stPill(d.estado)}</td>`;
    case 'entrada': return `<td style="padding:8px 12px;font-size:11px;white-space:nowrap">${formatDate(d.fecha)}</td>`;
    case 'acciones': return `<td style="padding:8px 12px"><div style="display:flex;gap:3px;flex-wrap:wrap">
      <button style="font-size:12px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2Print('${d.id}')">🖨</button>
      ${p.canEdit?`<button style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2Edit('${d.id}')">✏️</button>`:''}
      ${d.estado==='EN_RECINTO'&&p.canEdit?`<button style="font-size:12px;background:#fffbeb;color:#d97706;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2Salida('${d.id}')">↩</button>`:''}
      ${d.estado==='SALIDA'&&p.canEdit?`<button style="font-size:12px;background:#ecfdf5;color:#0d9f6e;border:1px solid #a7f3d0;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2React('${d.id}')">↺</button>`:''}
      ${p.canDel?`<button style="font-size:12px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2Del('${d.id}')">🗑</button>`:''}
    </div></td>`;
    default: return '<td>–</td>';
  }
}

function _telLink(tp, t) {
  if (!t) return '<span style="opacity:.3">–</span>';
  const f = (tp||'')+String(t).replace(/\s/g,''), w = f.replace('+','').replace(/\D/g,'');
  return `<div style="display:flex;align-items:center;gap:4px;white-space:nowrap">
    <a href="tel:${f}" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">📞</a>
    <a href="https://wa.me/${w}" target="_blank" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#25D366;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">💬</a>
    <span style="font-size:11px;font-family:monospace;color:#6b7a90">${t}</span>
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// ESPECIAL — alertas
// ═══════════════════════════════════════════════════════════
function renderEspecial() {
  const c = C();
  const pCol = { alta:'#ef4444', media:'#f59e0b', baja:'#22c55e' };
  const pLbl = { alta:'🔴 Alta', media:'🟡 Media', baja:'🟢 Baja' };
  const items = _especiales.filter(m => m.activo !== false).sort((a,b) => (b.ts||0) - (a.ts||0));
  return `<div style="padding:14px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div><div style="font-size:14px;font-weight:700">Vehículos especiales / alertas</div><div style="font-size:11px;color:${c.text3}">Pre-alertas activas para operadores</div></div>
      <button style="padding:8px 14px;background:${c.blue};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer" onclick="window._beu2NewAlert()">+ Nueva alerta</button>
    </div>
    ${!items.length?`<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">🔔</div><div style="font-weight:600;margin-top:6px">Sin alertas activas</div></div>`:
    items.map(m=>`<div style="background:${c.card};border:1px solid ${c.border};border-left:3px solid ${pCol[m.prioridad]||pCol.media};border-radius:12px;padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap">
            ${m.matricula?`<span style="background:#1a2235;color:#fff;font-family:monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px">${m.matricula}</span>`:''}
            ${m.referencia?`<span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid ${c.border}">${m.referencia}</span>`:''}
            <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:${pCol[m.prioridad]||pCol.media}22;color:${pCol[m.prioridad]||pCol.media}">${pLbl[m.prioridad]||pLbl.media}</span>
          </div>
          <div style="font-size:13px;font-weight:500;line-height:1.5;margin-bottom:4px">${safeHtml(m.mensaje||'')}</div>
          <div style="font-size:11px;color:${c.text3}">Por: <b>${safeHtml(m.autor||'Sistema')}</b> · ${formatDate(m.ts)}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2EditAlert('${m.id}')">✏️</button>
          <button style="font-size:12px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._beu2DelAlert('${m.id}')">🗑</button>
        </div>
      </div>
    </div>`).join('')}
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// HISTORIAL — timeline
// ═══════════════════════════════════════════════════════════
function renderHistorial() {
  const c = C();
  const aIcon = { new:'➕', edit:'✏️', salida:'↩', reactivar:'↺' };
  const aCol = { new:'#7c3aed', edit:'#2c5ee8', salida:'#d97706', reactivar:'#0d9f6e' };
  const items = [..._historial].sort((a,b) => (b.ts||0) - (a.ts||0));
  const byDay = {};
  items.forEach(e => { const d = formatDate(e.ts, {weekday:'long',day:'2-digit',month:'long'}); if(!byDay[d])byDay[d]=[]; byDay[d].push(e); });

  return `<div style="padding:14px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div><div style="font-size:14px;font-weight:700">Historial de modificaciones</div><div style="font-size:11px;color:${c.text3}">Últimos cambios en ${TITLE}</div></div>
    </div>
    ${!items.length?`<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">📋</div><div style="font-weight:600;margin-top:6px">Sin modificaciones</div></div>`:`
    <div style="position:relative">
      <div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:${c.border}"></div>
      ${Object.entries(byDay).map(([day,evts])=>`<div style="margin-bottom:18px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.text3};margin-bottom:8px;padding-left:38px">${day}</div>
        ${evts.map(e=>`<div style="display:flex;gap:10px;margin-bottom:7px;align-items:flex-start">
          <div style="width:18px;height:18px;border-radius:50%;background:${aCol[e.action]||c.text3};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:3px;box-shadow:0 0 0 3px ${c.bg};z-index:1">${aIcon[e.action]||'•'}</div>
          <div style="flex:1;background:${c.card};border:1px solid ${c.border};border-radius:10px;padding:8px 12px">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
              <span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px">${safeHtml(e.mat||'')}</span>
              <span style="font-size:10px;font-weight:700;color:${aCol[e.action]||c.text3}">${(e.action||'').toUpperCase()}</span>
            </div>
            ${e.detail?`<div style="font-size:12px;line-height:1.5;margin-bottom:3px">${safeHtml(e.detail)}</div>`:''}
            <div style="font-size:10px;color:${c.text3}">${safeHtml(e.user||'')} · ${formatDate(e.ts,{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>`).join('')}
      </div>`).join('')}
    </div>`}
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// CAMPOS — config visibilidad
// ═══════════════════════════════════════════════════════════
function renderCampos() {
  const c = C();
  const SECS = [
    {icon:'🚛',label:'Vehículo',ids:['pos','matricula','remolque','llamador','referencia']},
    {icon:'👤',label:'Conductor',ids:['conductor','empresa','telefono']},
    {icon:'📅',label:'Evento',ids:['hall','stand','estado','entrada','acciones']},
  ];
  return `<div style="padding:14px;max-width:680px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div><div style="font-size:14px;font-weight:700">Configuración de campos</div><div style="font-size:11px;color:${c.text3}">Activá, ocultá o renombrá los campos</div></div>
      <button style="padding:5px 12px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer" onclick="window._beu2ResetCampos()">↺ Restaurar</button>
    </div>
    ${SECS.map(sec=>`<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};display:flex;align-items:center;gap:7px">${sec.icon} ${sec.label}</div>
      ${sec.ids.map(id=>{const col=ALL_COLS.find(x=>x.id===id);if(!col)return'';const on=_visCols.includes(id);return`<div style="display:flex;align-items:center;gap:10px;padding:8px 14px">
        <div style="width:34px;height:18px;border-radius:20px;background:${on?c.blue:c.border};position:relative;flex-shrink:0;cursor:${col.req?'default':'pointer'};transition:background .18s" onclick="window._beu2ToggleCampo('${id}')"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on?'18':'2'}px;transition:left .18s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div>
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:${on?c.blue:c.text}">${col.label}${col.req?' <small style="opacity:.35">(fija)</small>':''}</div></div>
        <label style="font-size:11px;color:${c.text3};display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" style="accent-color:${c.blue}"> Obligatorio</label>
      </div>`;}).join('')}
    </div>`).join('')}
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// COL PANEL
// ═══════════════════════════════════════════════════════════
function openColPanel() {
  const panel = _c.querySelector('#_colPanel');
  if (!panel) return;
  panel.style.right = '0';
  _renderColPanel();
}
function closeColPanel() {
  const panel = _c.querySelector('#_colPanel');
  if (panel) panel.style.right = '-300px';
}
function _renderColPanel() {
  const c = C(); const panel = _c.querySelector('#_colPanel'); if (!panel) return;
  panel.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <span style="font-size:14px;font-weight:700">⚙ Columnas</span>
      <button style="padding:4px 10px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="window._beu2CloseCol()">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:12px 14px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px">Visibilidad</div>
      ${ALL_COLS.map(col=>{const on=_visCols.includes(col.id);return`<div style="display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;cursor:${col.req?'default':'pointer'};opacity:${col.req?.55:1};margin-bottom:2px" ${col.req?'':`onclick="window._beu2ToggleCol('${col.id}')"`}>
        <div style="width:34px;height:18px;border-radius:20px;background:${on?c.blue:c.border};position:relative;flex-shrink:0"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on?'18':'2'}px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div>
        <span style="font-size:12px;font-weight:500;color:${on?c.blue:c.text};flex:1">${col.label}${col.req?` <small style="opacity:.3">(fija)</small>`:''}</span>
      </div>`;}).join('')}
      <button style="width:100%;margin-top:10px;padding:7px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer;font-family:inherit" onclick="window._beu2ResetCols()">↺ Restaurar</button>
    </div>
    <div style="padding:12px 14px;border-top:1px solid ${c.border};flex-shrink:0">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.text3};margin-bottom:8px">Plantillas</div>
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <input id="_tplIn" placeholder="Nombre plantilla..." style="flex:1;border:1px solid ${c.border};border-radius:8px;padding:7px 10px;font-size:12px;font-family:inherit;outline:none;background:${c.bg2};color:${c.text}">
        <button style="padding:7px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" onclick="window._beu2SaveTpl()">Guardar</button>
      </div>
      ${Object.keys(_colTpls).length?Object.keys(_colTpls).map(n=>`<div style="display:flex;align-items:center;gap:5px;padding:7px 10px;background:${_colTpls[n]._active?c.bll:c.bg2};border:1px solid ${_colTpls[n]._active?c.blue:c.border};border-radius:8px;cursor:pointer;margin-bottom:4px" onclick="window._beu2ApplyTpl('${n}')">
        <span style="flex:1;font-size:12px;font-weight:500">📋 ${n}</span>
        <span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();window._beu2DelTpl('${n}')">✕</span>
      </div>`).join(''):`<div style="font-size:11px;padding:4px;opacity:.4">Sin plantillas guardadas</div>`}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
// MODAL — nuevo/editar ingreso
// ═══════════════════════════════════════════════════════════
function openIngModal(editId = null) {
  const c = C();
  const old = document.getElementById('beu-ing2-modal'); if (old) old.remove();
  const r = editId ? _data.find(d => d.id === editId) : {};
  const m = document.createElement('div'); m.id = 'beu-ing2-modal';
  m.style.cssText = `position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px`;
  m.innerHTML = `<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:660px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}">
      <div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nueva Entrada'}</div>
      <button style="padding:5px 12px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#beu-ing2-modal').remove()">✕ Cerrar</button>
    </div>
    <div style="padding:16px 22px">
      <div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">🚛 Vehículo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Matrícula *</label><input data-f="matricula" value="${safeHtml(r.matricula||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Remolque</label><input data-f="remolque" value="${safeHtml(r.remolque||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Llamador</label><input data-f="llamador" value="${safeHtml(r.llamador||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Tipo vehículo</label><select data-f="tipoVeh" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"><option value="">— Tipo —</option><option>Camión</option><option>Furgón</option><option>Trailer</option><option>Furgoneta</option></select></div>
        </div>
      </div>
      <div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">👤 Conductor</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Nombre</label><input data-f="nombre" value="${safeHtml(r.nombre||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Apellido</label><input data-f="apellido" value="${safeHtml(r.apellido||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Empresa</label><input data-f="empresa" value="${safeHtml(r.empresa||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Teléfono</label><input data-f="telefono" value="${safeHtml(r.telefono||'')}" type="tel" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        </div>
      </div>
      <div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">📅 Evento</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Hall *</label><input data-f="hall" value="${safeHtml(r.hall||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Stand</label><input data-f="stand" value="${safeHtml(r.stand||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Referencia</label><input data-f="referencia" value="${safeHtml(r.referencia||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
          <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Expositor</label><input data-f="expositor" value="${safeHtml(r.expositor||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        </div>
        <div style="margin-top:10px"><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Notas</label><input data-f="obs" value="${safeHtml(r.obs||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" placeholder="Observaciones"></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}">
      <button style="padding:9px 18px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer;font-family:inherit" onclick="this.closest('#beu-ing2-modal').remove()">Cancelar</button>
      <button id="_saveIng" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${editId?'Guardar':'Crear Ingreso'}</button>
    </div>
  </div>`;
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#_saveIng').onclick = async () => {
    const fd = { recinto: _u.recinto || '', modificado: nowLocal(), modificadoPor: _u.uid };
    m.querySelectorAll('[data-f]').forEach(el => { fd[el.dataset.f] = el.value || ''; });
    if (!fd.matricula) { toast('Matrícula requerida', '#ef4444'); return; }
    fd.matricula = normPlate(fd.matricula);
    try {
      if (editId) {
        const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`${COLLECTION}/${editId}`, fd);
        _logHist('edit', fd.matricula, 'Edición de registro');
      } else {
        fd.fecha = nowLocal(); fd.estado = 'EN_RECINTO'; fd.creadoPor = _u.uid;
        const { fsAdd } = await import('./firestore.js'); await fsAdd(COLLECTION, fd);
        _logHist('new', fd.matricula, 'Nuevo ingreso creado');
      }
      toast(_s('save') + ' ✓', '#10b981'); m.remove();
    } catch(e) { toast(_s('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

// ═══════════════════════════════════════════════════════════
// MODAL ALERTA
// ═══════════════════════════════════════════════════════════
function openAlertModal(editId = null) {
  const c = C();
  const old = document.getElementById('beu-alert-modal'); if (old) old.remove();
  const r = editId ? _especiales.find(d => d.id === editId) : {};
  const m = document.createElement('div'); m.id = 'beu-alert-modal';
  m.style.cssText = `position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px`;
  m.innerHTML = `<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:500px;color:${c.text};overflow:hidden">
    <div style="padding:18px 22px 12px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between">
      <div style="font-size:18px;font-weight:700">${editId?'✏️ Editar alerta':'+ Nueva alerta especial'}</div>
      <button style="padding:5px 12px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#beu-alert-modal').remove()">✕</button>
    </div>
    <div style="padding:16px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Matrícula</label><input data-a="matricula" value="${safeHtml(r.matricula||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Ref / Booking</label><input data-a="referencia" value="${safeHtml(r.referencia||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
      </div>
      <div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Mensaje *</label><input data-a="mensaje" value="${safeHtml(r.mensaje||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" placeholder="Descripción para el operador..."></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Autor</label><input data-a="autor" value="${safeHtml(r.autor||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" placeholder="Oficina / Recinto"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.text3};display:block;margin-bottom:3px">Prioridad</label><select data-a="prioridad" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"><option value="alta"${r.prioridad==='alta'?' selected':''}>🔴 Alta</option><option value="media"${r.prioridad==='media'||!r.prioridad?' selected':''}>🟡 Media</option><option value="baja"${r.prioridad==='baja'?' selected':''}>🟢 Baja</option></select></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}">
      <button style="padding:8px 16px;background:${c.bg2};color:${c.text3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit" onclick="this.closest('#beu-alert-modal').remove()">Cancelar</button>
      <button id="_saveAlert" style="padding:8px 18px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Guardar alerta</button>
    </div>
  </div>`;
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#_saveAlert').onclick = async () => {
    const fd = { ts: Date.now(), activo: true };
    m.querySelectorAll('[data-a]').forEach(el => { fd[el.dataset.a] = el.value || ''; });
    if (!fd.mensaje) { toast('Mensaje requerido', '#ef4444'); return; }
    try {
      if (editId) {
        const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`${COLLECTION}_especiales/${editId}`, fd);
      } else {
        const { fsAdd } = await import('./firestore.js'); await fsAdd(`${COLLECTION}_especiales`, fd);
      }
      toast('Alerta guardada ✓', '#10b981'); m.remove();
    } catch(e) { toast(_s('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

// ═══════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════
async function _logHist(action, mat, detail) {
  try {
    const { fsAdd } = await import('./firestore.js');
    await fsAdd(`${COLLECTION}_historial`, { ts: Date.now(), user: _u.nombre || _u.uid, action, mat, detail, collection: MODULE });
  } catch(e) {}
}

async function _markSalida(id) {
  const d = _data.find(x => x.id === id); if (!d) return;
  try {
    const { fsUpdate } = await import('./firestore.js');
    await fsUpdate(`${COLLECTION}/${id}`, { estado: 'SALIDA', salida: nowLocal(), modificado: nowLocal(), modificadoPor: _u.uid });
    _logHist('salida', d.matricula, `Estado: En recinto → Salida`);
    toast('↩ Salida registrada', '#d97706');
  } catch(e) { toast(_s('error'), '#ef4444'); }
}

async function _reactivar(id) {
  const d = _data.find(x => x.id === id); if (!d) return;
  try {
    const { fsUpdate } = await import('./firestore.js');
    await fsUpdate(`${COLLECTION}/${id}`, { estado: 'EN_RECINTO', salida: null, modificado: nowLocal(), modificadoPor: _u.uid });
    _logHist('reactivar', d.matricula, `Estado: Salida → En recinto`);
    toast('↺ Reactivado', '#0d9f6e');
  } catch(e) { toast(_s('error'), '#ef4444'); }
}

async function _deleteRec(id) {
  if (!confirm(_s('confirm') + '?')) return;
  const d = _data.find(x => x.id === id);
  try {
    const { fsDel } = await import('./firestore.js'); await fsDel(`${COLLECTION}/${id}`);
    if (d) _logHist('edit', d.matricula, 'Registro eliminado');
    toast(_s('delete') + ' ✓', '#f59e0b');
  } catch(e) { toast(_s('error'), '#ef4444'); }
}

async function exportData() {
  try {
    toast(_s('loading'), '#2c5ee8');
    const X = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
    const ws = X.utils.json_to_sheet(_filtered.map(d => ({
      Matrícula: d.matricula, Remolque: d.remolque, Empresa: d.empresa, Conductor: d.nombre,
      Hall: d.hall, Stand: d.stand, Estado: STATUS[d.estado]||d.estado, Entrada: d.fecha, Referencia: d.referencia
    })));
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, TITLE);
    X.writeFile(wb, `${TITLE}_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast('Exportado ✓', '#10b981');
  } catch(e) { toast(_s('error'), '#ef4444'); }
}

// ═══════════════════════════════════════════════════════════
// WINDOW BINDINGS
// ═══════════════════════════════════════════════════════════
window._beu2Sort = (col) => { if(_sortCol===col) _sortDir=_sortDir==='asc'?'desc':'asc'; else{_sortCol=col;_sortDir='asc';} applyFilter(); renderContent(); };
window._beu2Ctx = (e, col) => { e.preventDefault(); /* TODO: context menu */ };
window._beu2Det = (id) => openIngModal(id);
window._beu2Edit = (id) => openIngModal(id);
window._beu2Del = (id) => _deleteRec(id);
window._beu2Salida = (id) => _markSalida(id);
window._beu2React = (id) => _reactivar(id);
window._beu2Print = (id) => toast('🖨 Impresión (módulo impresión)', '#2c5ee8');
window._beu2NewAlert = () => openAlertModal();
window._beu2EditAlert = (id) => openAlertModal(id);
window._beu2DelAlert = async (id) => { try { const{fsDel}=await import('./firestore.js'); await fsDel(`${COLLECTION}_especiales/${id}`); toast('Alerta eliminada','#f59e0b'); } catch(e){toast(_s('error'),'#ef4444');} };
window._beu2CloseCol = () => closeColPanel();
window._beu2ToggleCol = (id) => { const col=ALL_COLS.find(c=>c.id===id); if(col?.req)return; if(_visCols.includes(id))_visCols=_visCols.filter(x=>x!==id);else _visCols.push(id); _saveVisCols(); _renderColPanel(); applyFilter(); renderContent(); };
window._beu2ResetCols = () => { _visCols=[...DEF_VIS]; _saveVisCols(); _renderColPanel(); applyFilter(); renderContent(); };
window._beu2SaveTpl = () => { const el=_c.querySelector('#_tplIn'); const n=el?.value.trim(); if(!n){toast('Nombre requerido','#ef4444');return;} Object.keys(_colTpls).forEach(k=>_colTpls[k]._active=false); _colTpls[n]={vis:[..._visCols],_active:true}; _saveTpls(); el.value=''; _renderColPanel(); toast(`Plantilla "${n}" guardada`,'#10b981'); };
window._beu2ApplyTpl = (n) => { const t=_colTpls[n]; if(!t)return; _visCols=[...t.vis]; Object.keys(_colTpls).forEach(k=>_colTpls[k]._active=false); _colTpls[n]._active=true; _saveVisCols(); _saveTpls(); _renderColPanel(); applyFilter(); renderContent(); toast(`Plantilla "${n}" activada`,'#10b981'); };
window._beu2DelTpl = (n) => { delete _colTpls[n]; _saveTpls(); _renderColPanel(); toast('Eliminada','#f59e0b'); };
window._beu2ToggleCampo = (id) => { const col=ALL_COLS.find(c=>c.id===id); if(col?.req){toast('Campo requerido','#d97706');return;} if(_visCols.includes(id))_visCols=_visCols.filter(x=>x!==id);else _visCols.push(id); _saveVisCols(); paint(); };
window._beu2ResetCampos = () => { _visCols=[...DEF_VIS]; _saveVisCols(); ALL_COLS.forEach(c=>_camposState[c.id]={visible:true,required:!!c.req,label:c.label}); _saveCampos(); paint(); toast('Campos restaurados','#10b981'); };
