// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — tabs/ingresos.js
// Módulo Ingresos: Lista, Especial, Modificaciones, Campos
// ═══════════════════════════════════════════════════════════════════════
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { isSA, isSup, canEdit, canAdd, canDel, canClean, canExport, canImport, canStatus, canSpecial, canCampos } from '../auth.js';
import { DB, iF, SID, _autoFillOn, _posAutoOn, registerFn, callFn } from '../core/context.js';
import { esc, fmt, hBadge, telLink, thSort, getSort, sortArr, getRecintoHalls, getActiveEvent, getTabEvent, debounceSearch, tr, checkBL, _modal, gv } from '../core/shared.js';
import { saveIngreso, _getCol, _nextPos, softDelete, saveDB, marcarSalidaIng, reactivarIngreso, askDelIng, _logEdit } from '../core/db.js';

let _ingSource = 'ingresos';
window._ingSource = _ingSource;

// ─── COLUMNAS CONFIGURABLES ──────────────────────────────────────────
// Definición maestra de columnas disponibles
const ING_COLS_DEF = [
  { id:'pos',         label:'#',            req:true  },
  { id:'matricula',   label:'Matrícula',    req:true  },
  { id:'remolque',    label:'Remolque',     req:false },
  { id:'llamador',    label:'Llamador',     req:false },
  { id:'referencia',  label:'Ref.',         req:false },
  { id:'conductor',   label:'Conductor',    req:false },
  { id:'empresa',     label:'Empresa',      req:false },
  { id:'telefono',    label:'Tel.',         req:false },
  { id:'hall',        label:'Hall',         req:false },
  { id:'stand',       label:'Stand',        req:false },
  { id:'montador',    label:'Montador',     req:false },
  { id:'expositor',   label:'Expositor',    req:false },
  { id:'evento',      label:'Evento',       req:false },
  { id:'estado',      label:'Estado',       req:false },
  { id:'entrada',     label:'Entrada',      req:false },
  { id:'acciones',    label:'Acc.',         req:true  },
];
const ING_COLS_DEFAULT = ING_COLS_DEF.map(c => c.id);

function _loadColCfg() {
  try { return JSON.parse(localStorage.getItem('be_ing_cols') || 'null'); } catch(e) { return null; }
}
function _saveColCfg(cfg) {
  try { localStorage.setItem('be_ing_cols', JSON.stringify(cfg)); } catch(e) {}
}

let _ingColsVis   = _loadColCfg()?.vis   || [...ING_COLS_DEFAULT];
let _ingColsOrder = _loadColCfg()?.order || [...ING_COLS_DEFAULT];
let _ingColTpls   = JSON.parse(localStorage.getItem('be_ing_col_tpls') || '{}');

function _saveColTpls() {
  try { localStorage.setItem('be_ing_col_tpls', JSON.stringify(_ingColTpls)); } catch(e) {}
}

// ─── CAMPOS DEL FORMULARIO ───────────────────────────────────────────
const ING_FORM_DEFS = {
  vehiculo: {
    icon: '🚛', label: 'Vehículo',
    fields: [
      { id:'matricula',    label:'Matrícula',       req:true,  key:'matricula',    type:'text',   placeholder:'8611MTL' },
      { id:'remolque',     label:'Remolque',         req:false, key:'remolque',     type:'text',   placeholder:'TR-XXXX' },
      { id:'posicion',     label:'Posición',         req:false, key:'posicion',     type:'text',   placeholder:'Pos. en recinto' },
      { id:'llamador',     label:'Llamador',         req:false, key:'llamador',     type:'text',   placeholder:'Responsable llamada' },
      { id:'logistica',    label:'Logística',        req:false, key:'logistica',    type:'text',   placeholder:'Empresa logística' },
      { id:'tipo_veh',     label:'Tipo vehículo',    req:false, key:'tipoVehiculo', type:'select', options:['','Camión','Furgón','Trailer','Furgoneta','Otro'] },
      { id:'pais',         label:'País matrícula',   req:false, key:'pais',         type:'pais' },
    ],
  },
  conductor: {
    icon: '👤', label: 'Conductor',
    fields: [
      { id:'nombre',       label:'Nombre',           req:true,  key:'nombre',       type:'text',   placeholder:'Nombre' },
      { id:'apellido',     label:'Apellido',         req:false, key:'apellido',     type:'text',   placeholder:'Apellido' },
      { id:'empresa',      label:'Empresa',          req:false, key:'empresa',      type:'text',   placeholder:'Empresa transportista' },
      { id:'telefono',     label:'Teléfono',         req:false, key:'telefono',     type:'tel' },
      { id:'dni',          label:'DNI / Pasaporte',  req:false, key:'pasaporte',    type:'text',   placeholder:'Documento' },
      { id:'supervisor',   label:'Supervisor',       req:false, key:'supervisor',   type:'text',   placeholder:'Nombre supervisor' },
      { id:'tel_supervisor',label:'Tel. supervisor', req:false, key:'telSupervisor',type:'tel2' },
    ],
  },
  evento: {
    icon: '📅', label: 'Evento',
    fields: [
      { id:'montador',     label:'Montador',         req:false, key:'montador',     type:'text',   placeholder:'Empresa montadora' },
      { id:'expositor',    label:'Expositor',        req:false, key:'expositor',    type:'text',   placeholder:'Nombre expositor' },
      { id:'hall',         label:'Hall',             req:true,  key:'hall',         type:'text',   placeholder:'5A' },
      { id:'stand',        label:'Stand',            req:false, key:'stand',        type:'text',   placeholder:'E17' },
      { id:'referencia',   label:'Ref / Booking',    req:false, key:'referencia',   type:'text',   placeholder:'REF-0000' },
      { id:'puertaHall',   label:'Puerta Hall',      req:false, key:'puertaHall',   type:'text',   placeholder:'Puerta acceso' },
      { id:'acceso',       label:'Tipo acceso',      req:false, key:'acceso',       type:'select', options:['','Principal','Lateral','Trasero','Especial'] },
      { id:'fecha',        label:'Fecha',            req:true,  key:'fechaIngreso',  type:'date' },
      { id:'hora',         label:'Hora',             req:false, key:'hora',         type:'time' },
      { id:'notas',        label:'Notas',            req:false, key:'comentario',   type:'text',   placeholder:'Observaciones' },
    ],
  },
};

// Estado de campos: visible, required, label — cargado desde Firestore o localStorage
function _loadCamposState() {
  try { return JSON.parse(localStorage.getItem('be_ing_campos') || 'null'); } catch(e) { return null; }
}
function _defaultCamposState() {
  const s = {};
  Object.values(ING_FORM_DEFS).forEach(sec => sec.fields.forEach(f => {
    s[f.id] = { visible: true, required: f.req, label: f.label };
  }));
  return s;
}
let _camposState = _loadCamposState() || _defaultCamposState();
function _saveCamposState() {
  try { localStorage.setItem('be_ing_campos', JSON.stringify(_camposState)); } catch(e) {}
  // TODO: fsSet(`users/${_getCU()?.id}/camposCfg/ingresos`, _camposState)
}

// ─── PAISES HELPER ───────────────────────────────────────────────────
const PAISES_SEL = [
  {code:'+34',flag:'🇪🇸'},{code:'+33',flag:'🇫🇷'},{code:'+49',flag:'🇩🇪'},
  {code:'+39',flag:'🇮🇹'},{code:'+351',flag:'🇵🇹'},{code:'+44',flag:'🇬🇧'},
  {code:'+48',flag:'🇵🇱'},{code:'+31',flag:'🇳🇱'},{code:'+32',flag:'🇧🇪'},
];
function _paisSel(id='telPais', val='') {
  return `<select id="${id}" style="width:80px;flex-shrink:0;height:32px;border:1px solid var(--border);border-radius:6px;padding:0 4px;font-size:12px;background:var(--bg2)">
    ${PAISES_SEL.map(p=>`<option value="${p.code}" ${val===p.code?'selected':''}>${p.flag} ${p.code}</option>`).join('')}
  </select>`;
}

// ─── RENDER PRINCIPAL ─────────────────────────────────────────────────
export function renderIngresos() {
  const today = new Date().toISOString().slice(0, 10);
  let items = [...DB.ingresos];
  if (DB.activeEventId) items = items.filter(i => !i.eventoId || i.eventoId === DB.activeEventId);
  const q = (iF.q || '').toLowerCase();
  if (q) items = items.filter(i =>
    `${i.pos||''} ${i.matricula||''} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.montador||''} ${i.expositor||''} ${i.comentario||''} ${i.telefono||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.puertaHall||''}`
      .toLowerCase().includes(q)
  );
  if (iF.fecha)   items = items.filter(i => i.entrada?.startsWith(iF.fecha));
  if (iF.hall)    items = items.filter(i => i.hall === iF.hall || (i.halls||[]).includes(iF.hall));
  if (iF.activos) items = items.filter(i => !i.salida);

  const sub = iF._sub || 'lista';

  document.getElementById('tabContent').innerHTML = `
    <!-- SUBTABS + ACCIONES -->
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[
        ['lista',      '📋 Lista'],
        ['listanegra', '⭐ Especial'],
        ['historial',  '📝 Modificaciones'],
        ...(canCampos() ? [['campos','⚙ Campos']] : []),
      ].map(([s,l]) => `<button class="btn btn-sm ${sub===s?'btn-p':'btn-gh'}" onclick="iF._sub='${s}';renderIngresos()">${l}</button>`).join('')}
      <span style="flex:1"></span>
      ${canAdd() && sub !== 'campos'
        ? `<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="_ingSource='ingresos';_openIngModalV8()">+ Añadir</button>
           <button class="btn btn-sm btn-gh" onclick="toggleAutoFill()" style="border-radius:20px">⚡ ${_autoFillOn?'ON':'OFF'}</button>
           <button class="btn btn-sm btn-gh" onclick="togglePosAuto()" style="border-radius:20px">🔢 ${_posAutoOn?'ON':'OFF'}</button>`
        : ''}
      ${sub !== 'historial' && sub !== 'campos'
        ? `<button class="btn btn-s btn-sm" onclick="if(!canImport()){toast('Sin permiso','var(--red)');return;}document.getElementById('xlsxIng').click()">📥</button>
           <button class="btn btn-gh btn-sm" onclick="dlTemplateIng()">📋</button>`
        : ''}
      ${sub !== 'historial' && sub !== 'campos' && canExport()
        ? `<button class="btn btn-gh btn-sm" onclick="exportIngresos()">⬇ Excel</button>` : ''}
      ${sub !== 'historial' && sub !== 'campos' && canClean()
        ? `<button class="btn btn-sm" onclick="cleanTab('ingresos')">🗑 Limpiar</button>` : ''}
      ${sub !== 'historial' && isSA()
        ? `<button class="btn btn-danger btn-sm" onclick="vaciarTab('ingresos')">💥 Vaciar</button>` : ''}
      ${sub === 'lista'
        ? `<button class="btn btn-gh btn-sm" onclick="_openColPanel()" title="Gestionar columnas">⚙ Cols</button>` : ''}
    </div>

    <!-- FILTROS (solo en lista y especial) -->
    ${sub !== 'historial' && sub !== 'campos' ? `
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px">
        <span class="sico">🔍</span>
        <input type="search" placeholder="Pos, matrícula, nombre..." value="${esc(iF.q||'')}"
          id="srch-ingresos" oninput="iF.q=this.value;debounceSearch('ingresos',renderIngresos)">
      </div>
      <input type="date" value="${iF.fecha||''}"
        oninput="iF.fecha=this.value;debounceSearch('ingresos-date',renderIngresos)"
        style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px">
      <span class="pill" style="border:1.5px solid ${iF.activos?'var(--blue)':'var(--border)'};background:${iF.activos?'var(--blue)':'var(--bg2)'};color:${iF.activos?'#fff':'var(--text3)'};cursor:pointer"
        onclick="iF.activos=!iF.activos;renderIngresos()">Solo activos</span>
      ${iF.q||iF.fecha||iF.hall||iF.activos
        ? `<span class="pill pill-r" onclick="iF.q='';iF.fecha='';iF.hall='';iF.activos=false;renderIngresos()">✕</span>` : ''}
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>
    <!-- FILTRO HALLS -->
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;cursor:pointer;
        border:1.5px solid ${!iF.hall?'#7dd3fc':'#93c5fd'};background:${!iF.hall?'#e0f2fe':'#dbeafe'};color:${!iF.hall?'#0369a1':'#1e40af'}"
        onclick="iF.hall='';renderIngresos()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;cursor:pointer;
        background:${iF.hall===h?'#3b82f6':'#dbeafe'};color:${iF.hall===h?'#fff':'#1e40af'};
        border:1.5px solid ${iF.hall===h?'#2563eb':'#93c5fd'}"
        onclick="iF.hall='${h}';renderIngresos()">${h}</span>`).join('')}
    </div>` : ''}

    <!-- CONTENIDO SEGÚN SUBTAB -->
    ${sub === 'lista'      ? _ingLista(items)
    : sub === 'listanegra' ? _ingEspecial()
    : sub === 'historial'  ? _ingModificaciones()
    : sub === 'campos'     ? _ingCampos()
    : _ingLista(items)}
  `;
}

// ─── LISTA ────────────────────────────────────────────────────────────
function _ingLista(items) {
  const s = getSort('ingresos');
  items = sortArr(items, s.col||'pos', s.dir||'desc');

  if (!items.length) {
    return `<div class="empty"><div class="ei">🚦</div><div class="et">${DB.ingresos.length?'Sin resultados':'Sin ingresos registrados'}</div></div>`;
  }

  const cols = _ingColsOrder.filter(c => _ingColsVis.includes(c));
  const colDefs = cols.map(id => ING_COLS_DEF.find(c => c.id === id)).filter(Boolean);
  const SORTABLE = ['pos','matricula','llamador','referencia','conductor','empresa','hall','estado','entrada'];

  const thead = colDefs.map(c => {
    const sortable = SORTABLE.includes(c.id);
    return sortable
      ? thSort('ingresos', c.id, c.label)
      : `<th oncontextmenu="event.preventDefault();_ingColCtx(event,'${c.id}')">${c.label}</th>`;
  }).join('');

  const tbody = items.map(i => {
    const _tev = getTabEvent('ingresos');
    const _isAlt = i.eventoNombre && _tev && i.eventoNombre !== _tev.nombre;
    return `<tr style="${_isAlt?'background:#f0f7ff':''}">
      ${cols.map(cid => _ingCell(i, cid)).join('')}
    </tr>`;
  }).join('');

  return `<div class="tbl-wrap">
    <table class="dtbl">
      <thead><tr>${thead}</tr></thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>`;
}

function _ingCell(i, cid) {
  switch(cid) {
    case 'pos':
      return `<td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>`;
    case 'matricula':
      return `<td>
        <span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}')" title="Ver detalle">${esc(i.matricula)}</span>
        ${i.remolque?`<br><span class="mchip-sm">${esc(i.remolque)}</span>`:''}
      </td>`;
    case 'remolque':
      return `<td style="font-size:11px;color:var(--text3)">${esc(i.remolque||'–')}</td>`;
    case 'llamador':
      return `<td style="font-size:11px">${esc(i.llamador||'–')}</td>`;
    case 'referencia':
      return `<td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${esc(i.referencia||'–')}</td>`;
    case 'conductor':
      return `<td>
        <b style="font-size:12px">${esc((i.nombre||'')+' '+(i.apellido||'')).trim()||'–'}</b>
        ${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${esc(i.empresa)}</span>`:''}
      </td>`;
    case 'empresa':
      return `<td style="font-size:11px;color:var(--text3)">${esc(i.empresa||'–')}</td>`;
    case 'telefono':
      return `<td>${telLink(i.telPais||'', i.telefono||'')}</td>`;
    case 'hall':
      return `<td>${(i.halls||[i.hall||'']).filter(Boolean).map(h=>hBadge(h)).join(' ')||'–'}</td>`;
    case 'stand':
      return `<td style="font-size:11px">${esc(i.stand||'–')}</td>`;
    case 'montador':
      return `<td style="font-size:11px;color:var(--text3)">${esc(i.montador||'–')}</td>`;
    case 'expositor':
      return `<td style="font-size:11px;color:var(--text3)">${esc(i.expositor||'–')}</td>`;
    case 'evento':
      return `<td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
        title="${esc(i.eventoNombre||'')}">${i.eventoNombre?i.eventoNombre.slice(0,12):'–'}</td>`;
    case 'estado':
      return `<td>${!i.salida
        ? '<span class="pill pill-g">✓ En recinto</span>'
        : `<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida,'t')}</span>`
      }</td>`;
    case 'entrada':
      return `<td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>`;
    case 'acciones':
      return `<td><div style="display:flex;gap:2px;flex-wrap:wrap">
        ${canEdit()||canStatus()||canPrint()?`<button class="btn btn-gh btn-xs" onclick="printIngreso('${i.id}')" title="Imprimir">🖨</button>`:''}
        <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" onclick="printTrqRef('${i.id}')" title="Troquelado">✂</button>
        ${canStatus()?`<button class="btn btn-xs" style="background:var(--purple);color:#fff" onclick="registrarPasoTracking('${i.id}','ingresos')" title="Tracking">📡</button>`:''}
        ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="_ingSource='ingresos';_openIngModalV8(DB.ingresos.find(x=>x.id==='${i.id}'))">✏️</button>`:''}
        ${!i.salida&&canStatus()?`<button class="btn btn-warning btn-xs" onclick="_salida('${i.id}')">↩ Salida</button>`:''}
        ${i.salida&&canStatus()?`<button class="btn btn-success btn-xs" onclick="_reactivar('${i.id}')" title="Reactivar">↺</button>`:''}
        ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelIng('${i.id}')">🗑</button>`:''}
      </div></td>`;
    default:
      return `<td>–</td>`;
  }
}

// ─── SALIDA / REACTIVAR con log ───────────────────────────────────────
async function _salida(id) {
  const item = DB.ingresos.find(x => x.id === id);
  if (!item) return;
  const antes = item.salida ? fmt(item.salida) : 'En recinto';
  await marcarSalidaIng(id);
  await _logEdit('salida', item.matricula, item.pos, `Estado: ${antes} → Salida`);
}
async function _reactivar(id) {
  const item = DB.ingresos.find(x => x.id === id);
  if (!item) return;
  await reactivarIngreso(id);
  await _logEdit('reactivar', item.matricula, item.pos, 'Salida → En recinto');
}
window._salida    = _salida;
window._reactivar = _reactivar;

// ─── CONTEXT MENU EN CABECERA TABLA ──────────────────────────────────
let _ctxColId = null;
function _ingColCtx(e, colId) {
  e.preventDefault();
  _ctxColId = colId;
  const existing = document.getElementById('ingColCtxMenu');
  if (existing) existing.remove();
  const vis = _ingColsVis.includes(colId);
  const menu = document.createElement('div');
  menu.id = 'ingColCtxMenu';
  menu.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:9999;
    background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:4px;
    box-shadow:0 6px 24px rgba(0,0,0,.15);min-width:180px`;
  menu.innerHTML = `
    <div class="ctx-item" onclick="_ingToggleCol('${colId}');document.getElementById('ingColCtxMenu').remove()">
      ${vis?'👁 Ocultar columna':'👁 Mostrar columna'}
    </div>
    <div style="height:1px;background:var(--border);margin:3px 0"></div>
    <div class="ctx-item" onclick="window._op.setSort('ingresos','${colId}');document.getElementById('ingColCtxMenu').remove()">▲ Ordenar A → Z</div>
    <div class="ctx-item" onclick="window._op.setSort('ingresos','${colId}');document.getElementById('ingColCtxMenu').remove()">▼ Ordenar Z → A</div>
    <div style="height:1px;background:var(--border);margin:3px 0"></div>
    <div class="ctx-item" onclick="_openColPanel();document.getElementById('ingColCtxMenu').remove()">⚙ Gestionar columnas</div>`;
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once:true }), 10);
}

function _ingToggleCol(id) {
  const c = ING_COLS_DEF.find(x => x.id === id);
  if (c?.req) { toast('Columna requerida', 'var(--amber)'); return; }
  if (_ingColsVis.includes(id)) _ingColsVis = _ingColsVis.filter(x => x !== id);
  else _ingColsVis.push(id);
  _saveColCfg({ vis: _ingColsVis, order: _ingColsOrder });
  renderIngresos();
}
window._ingToggleCol = _ingToggleCol;
window._ingColCtx    = _ingColCtx;

// ─── PANEL DE COLUMNAS ────────────────────────────────────────────────
function _openColPanel() {
  const existing = document.getElementById('ingColPanel');
  if (existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'ingColPanel';
  panel.style.cssText = `position:fixed;top:0;right:0;width:290px;height:100vh;
    background:var(--bg);border-left:1px solid var(--border);
    box-shadow:-4px 0 20px rgba(0,0,0,.12);z-index:500;
    display:flex;flex-direction:column;animation:slideInRight .2s ease`;

  function renderPanelContent() {
    const tplHTML = Object.keys(_ingColTpls).length
      ? Object.keys(_ingColTpls).map(n => `
          <div class="tpl-row-item" style="display:flex;align-items:center;gap:4px;padding:6px 10px;
            background:var(--bg2);border:1px solid var(--border);border-radius:8px;margin-bottom:4px;cursor:pointer;
            ${_ingColTpls[n]._active?'border-color:var(--blue);background:#eff6ff;':''}"
            onclick="_applyColTpl('${n.replace(/'/g,"\\'")}')" id="coltpl-${n.replace(/[^a-z0-9]/gi,'_')}">
            <span style="flex:1;font-size:12px;font-weight:500">📋 ${n}</span>
            <span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();_renameColTpl('${n.replace(/'/g,"\\'")}')">✏️</span>
            <span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();_delColTpl('${n.replace(/'/g,"\\'")}')">✕</span>
          </div>`).join('')
      : '<div style="font-size:11px;padding:6px 10px;opacity:.4">Sin plantillas guardadas</div>';

    panel.innerHTML = `
      <div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div style="font-size:14px;font-weight:700">⚙ Columnas</div>
        <button class="btn btn-gh btn-sm" onclick="document.getElementById('ingColPanel').remove()">✕</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:12px 14px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);margin-bottom:8px">Visibilidad</div>
        ${ING_COLS_DEF.map(c => {
          const on = _ingColsVis.includes(c.id);
          return `<div style="display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;cursor:${c.req?'default':'pointer'};
            opacity:${c.req?.55:1};margin-bottom:2px;transition:background .1s"
            ${c.req?'':` onclick="_ingToggleCol('${c.id}');renderPanelContent()"`}
            onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''">
            <div style="width:34px;height:18px;border-radius:20px;background:${on?'var(--blue)':'var(--border)'};position:relative;flex-shrink:0;transition:background .18s">
              <div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on?'18':'2'}px;transition:left .18s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>
            </div>
            <span style="font-size:12px;font-weight:500;color:${on?'var(--blue)':'var(--text)'};flex:1">${c.label}</span>
            ${c.req?'<small style="opacity:.3;font-size:10px">(fija)</small>':''}
          </div>`;
        }).join('')}
        <button class="btn btn-gh btn-sm" style="width:100%;margin-top:10px;font-size:11px"
          onclick="_ingColsVis=[...ING_COLS_DEFAULT];_ingColsOrder=[...ING_COLS_DEFAULT];_saveColCfg({vis:_ingColsVis,order:_ingColsOrder});renderIngresos();renderPanelContent()">
          ↺ Restaurar predeterminadas
        </button>
      </div>
      <div style="padding:14px 16px;border-top:1px solid var(--border);flex-shrink:0">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);margin-bottom:8px">Plantillas</div>
        <div style="display:flex;gap:6px;margin-bottom:8px">
          <input id="colTplNameIn" placeholder="Nombre plantilla..." style="flex:1;border:1px solid var(--border);border-radius:8px;padding:7px 10px;font-size:12px;background:var(--bg2)">
          <button class="btn btn-p btn-sm" onclick="_saveColTplFromInput(renderPanelContent)">Guardar</button>
        </div>
        <div id="colTplList" style="max-height:150px;overflow-y:auto">${tplHTML}</div>
      </div>`;
  }
  renderPanelContent();
  document.body.appendChild(panel);
  window._colPanelRender = renderPanelContent;
}

function _saveColTplFromInput(cb) {
  const el = document.getElementById('colTplNameIn');
  const name = el?.value.trim();
  if (!name) { toast('Ingresá un nombre', 'var(--amber)'); return; }
  Object.keys(_ingColTpls).forEach(k => _ingColTpls[k]._active = false);
  _ingColTpls[name] = { vis: [..._ingColsVis], order: [..._ingColsOrder], _active: true };
  _saveColTpls();
  if (el) el.value = '';
  if (cb) cb();
  toast(`Plantilla "${name}" guardada`, 'var(--green)');
}
function _applyColTpl(name) {
  const t = _ingColTpls[name]; if (!t) return;
  _ingColsVis   = [...(t.vis   || ING_COLS_DEFAULT)];
  _ingColsOrder = [...(t.order || ING_COLS_DEFAULT)];
  Object.keys(_ingColTpls).forEach(k => _ingColTpls[k]._active = false);
  _ingColTpls[name]._active = true;
  _saveColTpls();
  _saveColCfg({ vis: _ingColsVis, order: _ingColsOrder });
  renderIngresos();
  if (window._colPanelRender) window._colPanelRender();
  toast(`Plantilla "${name}" activada`, 'var(--green)');
}
function _renameColTpl(oldName) {
  const newName = prompt('Nuevo nombre:', oldName);
  if (!newName || newName === oldName) return;
  if (_ingColTpls[newName]) { toast('Ya existe esa plantilla', 'var(--red)'); return; }
  _ingColTpls[newName] = { ..._ingColTpls[oldName] };
  delete _ingColTpls[oldName];
  _saveColTpls();
  if (window._colPanelRender) window._colPanelRender();
  toast('Plantilla renombrada', 'var(--green)');
}
function _delColTpl(name) {
  delete _ingColTpls[name];
  _saveColTpls();
  if (window._colPanelRender) window._colPanelRender();
  toast('Plantilla eliminada', 'var(--amber)');
}
window._openColPanel       = _openColPanel;
window._saveColTplFromInput= _saveColTplFromInput;
window._applyColTpl        = _applyColTpl;
window._renameColTpl       = _renameColTpl;
window._delColTpl          = _delColTpl;
window.ING_COLS_DEFAULT    = ING_COLS_DEFAULT;
window._saveColCfg         = _saveColCfg;

// ─── MODAL NUEVO / EDITAR INGRESO — 3 secciones ───────────────────────
function _openIngModalV8(item = null) {
  const isEdit = !!item;
  const today  = nowLocal().slice(0, 10);
  const nowT   = nowLocal().slice(11, 16);

  // Construir campos visibles dinámicamente desde _camposState
  function buildSec(secId) {
    const def = ING_FORM_DEFS[secId];
    const fields = def.fields.filter(f => {
      const st = _camposState[f.id];
      return st ? st.visible : true;
    });
    if (!fields.length) return '';

    let html = '';
    for (let i = 0; i < fields.length; i += 2) {
      const pair = fields.slice(i, i + 2);
      const flds = pair.map(f => {
        const st    = _camposState[f.id] || { label: f.label, required: f.req };
        const label = st.label || f.label;
        const req   = st.required || f.req;
        const val   = isEdit && item[f.key] ? esc(item[f.key]) : (f.id === 'hall' ? (DB.activeHall||'') : '');

        if (f.type === 'text' || f.type === 'date' || f.type === 'time') {
          return `<div class="fg">
            <label>${label}${req?' *':''}</label>
            <input type="${f.type === 'text' ? 'text' : f.type}" id="if-${f.id}"
              ${f.placeholder ? `placeholder="${f.placeholder}"` : ''}
              value="${f.type==='date'?(val||today):f.type==='time'?(val||nowT):val}"
              ${f.id==='matricula'?`oninput="this.value=this.value.toUpperCase();_checkEspecial(this.value)"`:''}
              ${req?'required':''}>
            ${f.id === 'matricula' ? '<div id="matSugBox" class="sug-box"></div>' : ''}
          </div>`;
        }
        if (f.type === 'select') {
          return `<div class="fg">
            <label>${label}${req?' *':''}</label>
            <select id="if-${f.id}" ${req?'required':''}>
              ${f.options.map(o => `<option value="${o}" ${val===o?'selected':''}>${o||'— Seleccionar —'}</option>`).join('')}
            </select>
          </div>`;
        }
        if (f.type === 'tel') {
          const pais = isEdit ? (item.telPais||'+34') : '+34';
          return `<div class="fg">
            <label>${label}${req?' *':''}</label>
            <div style="display:flex;gap:4px">
              ${_paisSel('if-telpais', pais)}
              <input type="tel" id="if-${f.id}" placeholder="600 000 000" value="${val}" style="flex:1">
            </div>
          </div>`;
        }
        if (f.type === 'tel2') {
          return `<div class="fg">
            <label>${label}</label>
            <div style="display:flex;gap:4px">
              ${_paisSel('if-telpais2', isEdit?(item.telPaisSup||'+34'):'+34')}
              <input type="tel" id="if-${f.id}" placeholder="600 000 000" value="${val}" style="flex:1">
            </div>
          </div>`;
        }
        if (f.type === 'pais') {
          return `<div class="fg">
            <label>${label}</label>
            <select id="if-${f.id}">
              ${PAISES_SEL.map(p=>`<option value="${p.code}" ${val===p.code?'selected':''}>${p.flag} ${p.code}</option>`).join('')}
            </select>
          </div>`;
        }
        return '';
      }).join('');
      html += pair.length === 2 ? `<div class="g2">${flds}</div>` : flds;
    }
    return `<div style="margin-bottom:12px;padding:14px;border-radius:12px;background:var(--bg2);border:1px solid var(--border)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:12px;display:flex;align-items:center;gap:6px">
        ${def.icon} ${def.label}
      </div>
      ${html}
    </div>`;
  }

  const body = `
    ${buildSec('vehiculo')}
    ${buildSec('conductor')}
    ${buildSec('evento')}
  `;

  _modal({
    title: isEdit ? `✏️ Editar ${esc(item.matricula)}` : '+ Nuevo ingreso',
    body,
    okText: isEdit ? 'Guardar cambios' : 'Crear ingreso',
    okClass: 'btn-p',
    onOpen: () => {
      _initMatSuggestions();
      _initScannerBtn();
    },
    onOk: async () => {
      const mat = document.getElementById('if-matricula')?.value.trim().toUpperCase();
      if (!mat) { toast('Matrícula requerida', 'var(--red)'); return false; }
      const hall = document.getElementById('if-hall')?.value.trim();
      if (!hall) { toast('Hall requerido', 'var(--red)'); return false; }

      const data = {
        id:         isEdit ? item.id : uid(),
        pos:        isEdit ? item.pos : _nextPos('ingresos'),
        matricula:  mat,
        remolque:   gv('if-remolque'),
        posicion:   gv('if-posicion'),
        llamador:   gv('if-llamador'),
        logistica:  gv('if-logistica'),
        tipoVehiculo: gv('if-tipo_veh'),
        pais:       gv('if-pais'),
        nombre:     gv('if-nombre'),
        apellido:   gv('if-apellido'),
        empresa:    gv('if-empresa'),
        telPais:    gv('if-telpais') || '+34',
        telefono:   gv('if-telefono'),
        pasaporte:  gv('if-dni'),
        supervisor: gv('if-supervisor'),
        telPaisSup: gv('if-telpais2'),
        telSupervisor: gv('if-tel_supervisor'),
        montador:   gv('if-montador'),
        expositor:  gv('if-expositor'),
        hall,
        halls:      [hall],
        stand:      gv('if-stand'),
        referencia: gv('if-referencia'),
        puertaHall: gv('if-puertaHall'),
        acceso:     gv('if-acceso'),
        comentario: gv('if-notas'),
        entrada:    isEdit ? item.entrada : nowLocal(),
        eventoId:   DB.activeEventId || '',
        eventoNombre: getActiveEvent()?.nombre || '',
        salida:     isEdit ? item.salida : null,
        _sid:       SID,
      };

      // Log edición si es editar
      if (isEdit) {
        const diffs = [];
        ['matricula','hall','stand','nombre','empresa','llamador','referencia'].forEach(k => {
          if (String(item[k]||'') !== String(data[k]||'')) {
            diffs.push(`${k}: "${item[k]||''}" → "${data[k]||''}"`);
          }
        });
        if (diffs.length) {
          await _logEdit('editar', mat, data.pos, diffs.join(' | '));
        }
      }

      await saveIngreso(data);
      toast(isEdit ? 'Ingreso actualizado' : 'Ingreso creado', 'var(--green)');
      renderIngresos();
    },
  });
}

// ─── AUTOCOMPLETE MATRÍCULA ───────────────────────────────────────────
function _initMatSuggestions() {
  const inp = document.getElementById('if-matricula');
  const box = document.getElementById('matSugBox');
  if (!inp || !box) return;

  inp.addEventListener('input', () => {
    const q = inp.value.toUpperCase();
    _checkEspecial(q);
    if (!q || q.length < 2) { box.style.display = 'none'; return; }

    const src = [...(DB.ingresos||[]), ...(DB.preregistros||[])];
    const seen = new Set();
    const matches = src.filter(r => {
      const m = r.matricula?.toUpperCase();
      if (!m || seen.has(m) || !m.includes(q)) return false;
      seen.add(m); return true;
    }).slice(0, 6);

    if (!matches.length) { box.style.display = 'none'; return; }

    box.innerHTML = matches.map(r => `
      <div class="sug-item" onclick="_fillFromRecord('${esc(r.matricula||'')}')">
        <span style="font-family:monospace;font-weight:700">${esc(r.matricula)}</span>
        <span style="opacity:.5;font-size:11px;margin-left:6px">${esc(r.nombre||'')} ${r.empresa?'· '+esc(r.empresa):''}</span>
      </div>`).join('');
    box.style.display = 'block';
  });
  inp.addEventListener('blur', () => setTimeout(() => box.style.display = 'none', 200));
}

function _fillFromRecord(mat) {
  const r = [...(DB.ingresos||[]), ...(DB.preregistros||[])].find(x => x.matricula?.toUpperCase() === mat.toUpperCase());
  if (!r) return;
  const map = {
    'if-matricula': 'matricula', 'if-remolque': 'remolque', 'if-nombre': 'nombre',
    'if-apellido': 'apellido',   'if-empresa': 'empresa',   'if-llamador': 'llamador',
    'if-telefono': 'telefono',   'if-hall': 'hall',          'if-referencia': 'referencia',
    'if-expositor': 'expositor', 'if-montador': 'montador',  'if-stand': 'stand',
  };
  Object.entries(map).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el && r[key]) el.value = r[key];
  });
  const box = document.getElementById('matSugBox');
  if (box) box.style.display = 'none';
  toast('Datos precargados desde historial ✓', 'var(--green)');
}
window._fillFromRecord = _fillFromRecord;

// ─── ESCÁNER MATRÍCULA ───────────────────────────────────────────────
function _initScannerBtn() {
  const inp = document.getElementById('if-matricula');
  if (!inp) return;
  const wrap = inp.parentElement;
  if (!wrap || wrap.querySelector('.scan-btn')) return;
  wrap.style.position = 'relative';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'scan-btn';
  btn.title = 'Escanear matrícula';
  btn.innerHTML = '📷';
  btn.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:16px;cursor:pointer;opacity:.4;transition:opacity .15s;padding:0;line-height:1';
  btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
  btn.addEventListener('mouseleave', () => btn.style.opacity = '.4');
  btn.addEventListener('click', () => {
    toast('📷 Escaneando matrícula...', 'var(--blue)');
    // En producción: invocar API de cámara / OCR
    // Por ahora simulación:
    setTimeout(() => {
      if (window._scannerAPI) {
        window._scannerAPI().then(mat => {
          if (mat) { inp.value = mat; inp.dispatchEvent(new Event('input')); }
        });
      } else {
        toast('Escáner no disponible en este dispositivo', 'var(--amber)');
      }
    }, 300);
  });
  inp.style.paddingRight = '36px';
  wrap.appendChild(btn);
}

// ─── CHECK ESPECIAL ──────────────────────────────────────────────────
function _checkEspecial(val) {
  if (!val || val.length < 3) return;
  const v = val.toUpperCase();
  const match = (DB.mensajesRampa || []).find(m =>
    m.activo !== false && (
      (m.matricula && m.matricula.toUpperCase() === v) ||
      (m.referencia && m.referencia.toUpperCase() === v)
    )
  );
  if (!match) return;

  const prev = document.getElementById('especialAlert');
  if (prev) prev.remove();

  const pCol = { alta:'#ef4444', media:'#f59e0b', baja:'#22c55e' };
  const col = pCol[match.prioridad] || pCol.media;
  const div = document.createElement('div');
  div.id = 'especialAlert';
  div.style.cssText = `position:fixed;bottom:70px;left:50%;transform:translateX(-50%);z-index:9998;
    background:var(--bg);border:2px solid ${col};border-radius:16px;
    box-shadow:0 8px 32px rgba(0,0,0,.18);padding:14px 18px;
    min-width:300px;max-width:480px;animation:especialIn .3s cubic-bezier(.34,1.56,.64,1)`;
  div.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:10px">
      <span style="font-size:22px;flex-shrink:0">🔔</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${col};margin-bottom:4px">
          Alerta especial · ${(match.prioridad||'media').toUpperCase()}
        </div>
        <div style="font-size:13px;font-weight:600;line-height:1.4">${esc(match.mensaje||match.texto||'')}</div>
        <div style="font-size:11px;opacity:.5;margin-top:5px">
          ${match.matricula?`🚛 ${match.matricula}`:''} ${match.referencia?`📋 ${match.referencia}`:''} · ${match.autor||'Sistema'}
        </div>
      </div>
      <button onclick="document.getElementById('especialAlert').remove()"
        style="background:none;border:none;font-size:16px;cursor:pointer;opacity:.35;flex-shrink:0;line-height:1;padding:0">✕</button>
    </div>`;
  document.body.appendChild(div);
  if (!document.getElementById('especialAlertStyle')) {
    const s = document.createElement('style');
    s.id = 'especialAlertStyle';
    s.textContent = '@keyframes especialIn{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(.96)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}';
    document.head.appendChild(s);
  }
  setTimeout(() => {
    if (div.parentNode) {
      div.style.transition = 'opacity .3s,transform .3s';
      div.style.opacity = '0';
      div.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => div.remove(), 300);
    }
  }, 12000);
}
window._checkEspecial = _checkEspecial;

// ─── ESPECIAL TAB ─────────────────────────────────────────────────────
function _ingEspecial() {
  const items = (DB.mensajesRampa || [])
    .filter(m => m.activo !== false)
    .sort((a, b) => (b.ts||'').localeCompare(a.ts||''));

  const pCol   = { alta:'#ef4444', media:'#f59e0b', baja:'#22c55e' };
  const pLabel = { alta:'🔴 Alta',  media:'🟡 Media', baja:'🟢 Baja' };

  return `<div style="padding:14px;max-width:860px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:14px;font-weight:700">Vehículos especiales / alertas activas</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">Pre-alertas para operadores de rampa. Aparecen al escanear o escribir la matrícula.</div>
      </div>
      ${canSpecial()||canAdd()
        ? `<button class="btn btn-p btn-sm" onclick="_openNuevaAlerta()">+ Nueva alerta</button>` : ''}
    </div>
    ${!items.length
      ? `<div class="empty"><div class="ei">🔔</div><div class="et">Sin alertas activas</div></div>`
      : items.map(m => `
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:14px;
          padding:13px 15px;margin-bottom:10px;
          border-left:3px solid ${pCol[m.prioridad]||pCol.media}">
          <div style="display:flex;align-items:flex-start;gap:10px">
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;flex-wrap:wrap">
                ${m.matricula?`<span class="mchip" style="cursor:default">${esc(m.matricula)}</span>`:''}
                ${m.referencia?`<span style="background:var(--bg2);border:1px solid var(--border);font-size:11px;padding:2px 8px;border-radius:6px;font-family:monospace">${esc(m.referencia)}</span>`:''}
                <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;
                  background:${pCol[m.prioridad]||pCol.media}22;color:${pCol[m.prioridad]||pCol.media}">
                  ${pLabel[m.prioridad]||pLabel.media}
                </span>
              </div>
              <div style="font-size:13px;font-weight:500;line-height:1.5;margin-bottom:5px">${esc(m.mensaje||m.texto||'')}</div>
              <div style="font-size:11px;color:var(--text3)">Por: <b>${esc(m.autor||'Sistema')}</b> · ${fmt(m.ts,'dt')}</div>
            </div>
            ${canSpecial()||canEdit()
              ? `<div style="display:flex;gap:4px;flex-shrink:0">
                  <button class="btn btn-edit btn-xs" onclick="_openNuevaAlerta('${m.id}')">✏️</button>
                  <button class="btn btn-danger btn-xs" onclick="_delAlerta('${m.id}')">🗑</button>
                </div>` : ''}
          </div>
        </div>`).join('')}
  </div>`;
}

function _openNuevaAlerta(editId = null) {
  const item = editId ? (DB.mensajesRampa||[]).find(x=>x.id===editId) : null;
  _modal({
    title: item ? `✏️ Editar alerta` : '+ Nueva alerta especial',
    body: `
      <div class="g2">
        <div class="fg"><label>Matrícula</label>
          <input id="alf-mat" type="text" placeholder="8611MTL" value="${esc(item?.matricula||'')}" oninput="this.value=this.value.toUpperCase()">
        </div>
        <div class="fg"><label>Ref / Booking</label>
          <input id="alf-ref" type="text" placeholder="REF-0000" value="${esc(item?.referencia||'')}" oninput="this.value=this.value.toUpperCase()">
        </div>
      </div>
      <div class="fg"><label>Mensaje *</label>
        <input id="alf-msg" type="text" placeholder="Descripción del mensaje para el operador..." value="${esc(item?.mensaje||item?.texto||'')}">
      </div>
      <div class="g2">
        <div class="fg"><label>Autor / Origen</label>
          <input id="alf-autor" type="text" placeholder="Oficina / Recinto" value="${esc(item?.autor||'')}">
        </div>
        <div class="fg"><label>Prioridad</label>
          <select id="alf-prio">
            <option value="alta" ${(item?.prioridad||'')==='alta'?'selected':''}>🔴 Alta</option>
            <option value="media" ${(!item||item.prioridad==='media')?'selected':''}>🟡 Media</option>
            <option value="baja" ${(item?.prioridad||'')==='baja'?'selected':''}>🟢 Baja</option>
          </select>
        </div>
      </div>`,
    okText: item ? 'Guardar' : 'Crear alerta',
    okClass: 'btn-p',
    onOk: async () => {
      const msg = document.getElementById('alf-msg')?.value.trim();
      if (!msg) { toast('Mensaje requerido', 'var(--red)'); return false; }
      const obj = {
        id:         editId || uid(),
        ts:         nowLocal(),
        matricula:  document.getElementById('alf-mat')?.value.trim().toUpperCase() || '',
        referencia: document.getElementById('alf-ref')?.value.trim().toUpperCase() || '',
        mensaje:    msg,
        texto:      msg,
        autor:      document.getElementById('alf-autor')?.value.trim() || 'Usuario',
        prioridad:  document.getElementById('alf-prio')?.value || 'media',
        activo:     true,
        eventoId:   DB.activeEventId || '',
        _sid:       SID,
      };
      if (!DB.mensajesRampa) DB.mensajesRampa = [];
      const idx = DB.mensajesRampa.findIndex(x => x.id === obj.id);
      if (idx >= 0) DB.mensajesRampa[idx] = obj; else DB.mensajesRampa.unshift(obj);
      // TODO: _saveOne('mensajesRampa', obj)
      await saveDB();
      toast('Alerta guardada', 'var(--green)');
      iF._sub = 'listanegra';
      renderIngresos();
    },
  });
}

async function _delAlerta(id) {
  if (!confirm('¿Eliminar esta alerta?')) return;
  DB.mensajesRampa = (DB.mensajesRampa||[]).filter(x => x.id !== id);
  await saveDB();
  toast('Alerta eliminada', 'var(--amber)');
  iF._sub = 'listanegra';
  renderIngresos();
}
window._openNuevaAlerta = _openNuevaAlerta;
window._delAlerta       = _delAlerta;

// ─── MODIFICACIONES TAB ───────────────────────────────────────────────
function _ingModificaciones() {
  const filtro = iF._modFiltro || '';
  let items = (DB.editHistory || []).filter(e => !filtro || e.action === filtro);

  // Agrupar por día
  const byDay = {};
  items.forEach(e => {
    const d = new Date(e.ts).toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long' });
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(e);
  });

  const aIcon = { editar:'✏️', salida:'↩', reactivar:'↺', crear:'➕' };
  const aCol  = { editar:'var(--blue)', salida:'var(--amber)', reactivar:'var(--green)', crear:'var(--purple)' };

  return `<div style="padding:14px;max-width:860px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:14px;font-weight:700">Historial de modificaciones</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">Últimos cambios registrados en el módulo Ingresos</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <select class="sbox" style="height:30px;padding:0 8px;font-size:11px"
          onchange="iF._modFiltro=this.value;renderIngresos()">
          <option value="" ${!filtro?'selected':''}>Todas las acciones</option>
          <option value="editar"    ${filtro==='editar'?'selected':''}>✏️ Ediciones</option>
          <option value="salida"    ${filtro==='salida'?'selected':''}>↩ Salidas</option>
          <option value="reactivar" ${filtro==='reactivar'?'selected':''}>↺ Reactivaciones</option>
          <option value="crear"     ${filtro==='crear'?'selected':''}>➕ Creaciones</option>
        </select>
        ${isSA()?`<button class="btn btn-danger btn-sm" onclick="if(confirm('¿Limpiar historial?')){DB.editHistory=[];saveDB();renderIngresos();}">🗑 Limpiar</button>`:''}
      </div>
    </div>
    ${!Object.keys(byDay).length
      ? `<div class="empty"><div class="ei">📋</div><div class="et">Sin modificaciones registradas</div></div>`
      : `<div style="position:relative">
          <div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:var(--border)"></div>
          ${Object.entries(byDay).map(([day, evts]) => `
            <div style="margin-bottom:20px">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
                color:var(--text3);margin-bottom:10px;padding-left:38px">${day}</div>
              ${evts.map(e => `
                <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
                  <!-- dot -->
                  <div style="width:18px;height:18px;border-radius:50%;
                    background:${aCol[e.action]||'var(--text3)'};
                    display:flex;align-items:center;justify-content:center;
                    font-size:9px;flex-shrink:0;margin-top:3px;
                    box-shadow:0 0 0 3px var(--bg);z-index:1">${aIcon[e.action]||'•'}</div>
                  <!-- contenido -->
                  <div style="flex:1;background:var(--bg);border:1px solid var(--border);
                    border-radius:10px;padding:9px 12px">
                    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px">
                      <span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${e.mat||''}')">${esc(e.mat||'')}</span>
                      <span style="font-size:10px;font-weight:700;color:${aCol[e.action]||'var(--text3)'}">${(e.action||'').toUpperCase()}</span>
                      ${e.pos?`<span style="font-size:11px;color:var(--text3)">Pos. #${e.pos}</span>`:''}
                    </div>
                    ${e.detail
                      ? `<div style="font-size:12px;color:var(--text);line-height:1.5;margin-bottom:4px">${esc(e.detail)}</div>`
                      : ''}
                    <div style="font-size:10px;color:var(--text3)">
                      ${esc(e.user||'?')} · ${fmt(e.ts,'t')}
                    </div>
                  </div>
                </div>`).join('')}
            </div>`).join('')}
        </div>`}
  </div>`;
}

// ─── CAMPOS TAB ───────────────────────────────────────────────────────
function _ingCampos() {
  const SECS_META = {
    vehiculo:  { icon:'🚛', label:'Vehículo' },
    conductor: { icon:'👤', label:'Conductor' },
    evento:    { icon:'📅', label:'Evento' },
  };
  return `<div style="padding:16px;max-width:720px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:14px;font-weight:700">Configuración de campos</div>
        <div style="font-size:12px;color:var(--text3);margin-top:2px">Activá, ocultá o renombrá los campos del formulario de ingreso</div>
      </div>
      <button class="btn btn-gh btn-sm" onclick="_resetCampos()">↺ Restaurar</button>
    </div>
    ${Object.entries(ING_FORM_DEFS).map(([secId, def]) => `
      <div style="margin-bottom:14px;background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden">
        <div style="padding:10px 15px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;
          font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--blue)">
          ${def.icon} ${def.label}
        </div>
        ${def.fields.map(f => {
          const st = _camposState[f.id] || { visible:true, required:f.req, label:f.label };
          return `<div style="display:flex;align-items:center;gap:10px;padding:9px 14px;
            border-radius:10px;margin:3px 6px;transition:background .1s"
            onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''">
            <!-- toggle -->
            <div style="width:34px;height:18px;border-radius:20px;background:${st.visible?'var(--blue)':'var(--border)'};
              position:relative;flex-shrink:0;cursor:pointer;transition:background .18s"
              onclick="_toggleCampo('${f.id}')">
              <div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;
                top:2px;left:${st.visible?'18':'2'}px;transition:left .18s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px">
                <span id="campo-lbl-${f.id}" style="font-size:12px;font-weight:600">${esc(st.label||f.label)}</span>
                ${f.req?'<small style="opacity:.3;font-size:10px">(requerido)</small>':''}
                <span style="font-size:11px;opacity:.3;cursor:pointer" onclick="_editCampoLabel('${f.id}')" title="Renombrar">✏️</span>
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text3);cursor:pointer;white-space:nowrap">
              <input type="checkbox" ${st.required?'checked':''} ${f.req?'disabled':''}
                onchange="_camposState['${f.id}'].required=this.checked;_saveCamposState()"
                style="accent-color:var(--blue)"> Obligatorio
            </label>
          </div>`;
        }).join('')}
      </div>`).join('')}
  </div>`;
}

function _toggleCampo(id) {
  if (!_camposState[id]) _camposState[id] = { visible:true, required:false, label:id };
  _camposState[id].visible = !_camposState[id].visible;
  _saveCamposState();
  iF._sub = 'campos';
  renderIngresos();
}
function _editCampoLabel(id) {
  const el = document.getElementById('campo-lbl-' + id);
  if (!el) return;
  const cur = _camposState[id]?.label || id;
  const inp = document.createElement('input');
  inp.value = cur;
  inp.style.cssText = 'font-size:12px;font-weight:600;border:none;border-bottom:2px solid var(--blue);background:transparent;color:inherit;outline:none;width:130px;padding:1px 2px';
  inp.addEventListener('blur', () => {
    if (!_camposState[id]) _camposState[id] = { visible:true, required:false, label:id };
    _camposState[id].label = inp.value.trim() || cur;
    _saveCamposState();
    iF._sub = 'campos';
    renderIngresos();
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') inp.blur();
    if (e.key === 'Escape') { inp.value = cur; inp.blur(); }
  });
  el.replaceWith(inp);
  inp.focus(); inp.select();
}
function _resetCampos() {
  _camposState = _defaultCamposState();
  _saveCamposState();
  iF._sub = 'campos';
  renderIngresos();
  toast('Campos restaurados', 'var(--green)');
}
window._toggleCampo    = _toggleCampo;
window._editCampoLabel = _editCampoLabel;
window._resetCampos    = _resetCampos;

// ─── EXPORTS & REGISTRO ──────────────────────────────────────────────
registerFn('renderIngresos', renderIngresos);
registerFn('_ingLN',         _ingEspecial);
registerFn('_ingHistorial',  _ingModificaciones);

window.renderIngresos  = renderIngresos;
window._openIngModalV8 = _openIngModalV8;
