// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo Ingresos COMPLETO
// Subtabs: Lista, Especial, Modif, Campos
// Botones: +Añadir, AutoFill, Pos, Import, Clipboard, Excel, Limpiar, Borrar, Cols
// Acciones fila: 🖨 ✂ 📡 ✏️ ↩/↺ 🗑
// Panel columnas + plantillas, sort, context menu
// Campos: editar nombre, obligatorio, agregar custom
// Autocomplete matrícula + scanner
// Alertas especiales con CRUD
// Historial timeline con filtro
// ⚠ ERROR GRAVE PENDIENTE: id 'ingresos2' debería ser 'ingresos'
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, formatDate, debounce, sortBy, normPlate } from './utils.js';

const MODULE='ingresos2', COLLECTION='accesos', TITLE='Ingresos';
let _c,_u,_data=[],_filtered=[],_unsub,_especiales=[],_historial=[];
let _sub='lista',_q='',_hallF='',_activos=false,_dateFrom='',_dateTo='',_statusF='';
let _sortCol='fecha',_sortDir='desc',_autoFill=false,_posAuto=false;

// ── COLUMNS ──
const ALL_COLS=[
  {id:'pos',label:'#',req:1},{id:'matricula',label:'Matrícula',req:1},
  {id:'remolque',label:'Remolque'},{id:'llamador',label:'Llamador'},
  {id:'referencia',label:'Ref.'},{id:'conductor',label:'Conductor'},
  {id:'empresa',label:'Empresa'},{id:'telefono',label:'Tel.'},
  {id:'hall',label:'Hall'},{id:'stand',label:'Stand'},
  {id:'estado',label:'Estado'},{id:'entrada',label:'Entrada'},
  {id:'acciones',label:'Acc.',req:1},
];
const DEF_VIS=ALL_COLS.map(c=>c.id);
let _vis=[...DEF_VIS],_tpls={};
try{_tpls=JSON.parse(localStorage.getItem(`beu_tpls_${MODULE}`)||'{}');}catch(e){}
try{const v=JSON.parse(localStorage.getItem(`beu_vis_${MODULE}`));if(v)_vis=v;}catch(e){}
function _saveVis(){try{localStorage.setItem(`beu_vis_${MODULE}`,JSON.stringify(_vis));}catch(e){}}
function _saveTpls(){try{localStorage.setItem(`beu_tpls_${MODULE}`,JSON.stringify(_tpls));}catch(e){}}

// ── CAMPOS DEFS ──
const CAMPOS_DEFS={
  vehiculo:{icon:'🚛',label:'Vehículo',fields:[
    {id:'matricula',label:'Matrícula',req:1,desc:'Placa del vehículo'},
    {id:'remolque',label:'Remolque',desc:'Matrícula del remolque'},
    {id:'posicion',label:'Posición',desc:'Posición en recinto'},
    {id:'llamador',label:'Llamador',desc:'Responsable llamada'},
    {id:'logistica',label:'Logística',desc:'Empresa logística'},
    {id:'tipo_veh',label:'Tipo vehículo',desc:'Camión, furgón...'},
    {id:'pais',label:'País',desc:'País de matrícula'},
  ]},
  conductor:{icon:'👤',label:'Conductor',fields:[
    {id:'nombre',label:'Nombre',req:1,desc:'Nombre del conductor'},
    {id:'apellido',label:'Apellido',desc:'Apellido'},
    {id:'empresa',label:'Empresa',desc:'Empresa transportista'},
    {id:'telefono',label:'Teléfono',desc:'Tel. conductor'},
    {id:'dni',label:'DNI/Pasaporte',desc:'Documento identidad'},
    {id:'supervisor',label:'Supervisor',desc:'Nombre supervisor evento'},
    {id:'tel_sup',label:'Tel. supervisor',desc:'Teléfono supervisor'},
  ]},
  evento:{icon:'📅',label:'Evento',fields:[
    {id:'montador',label:'Montador',desc:'Empresa montadora'},
    {id:'expositor',label:'Expositor',desc:'Nombre del expositor'},
    {id:'hall',label:'Hall',req:1,desc:'Hall de destino'},
    {id:'stand',label:'Stand',desc:'Stand de entrega'},
    {id:'referencia',label:'Ref/Booking',desc:'Número de reserva'},
    {id:'puerta',label:'Puerta Hall',desc:'Puerta de acceso'},
    {id:'acceso',label:'Tipo acceso',desc:'Principal, lateral...'},
    {id:'fecha',label:'Fecha',req:1,desc:'Fecha de ingreso'},
    {id:'hora',label:'Hora',desc:'Hora de ingreso'},
    {id:'notas',label:'Notas',desc:'Observaciones'},
  ]},
};
let _camposState={};
function _defaultCampos(){const s={};Object.values(CAMPOS_DEFS).forEach(sec=>sec.fields.forEach(f=>{s[f.id]={visible:true,required:!!f.req,label:f.label};}));return s;}
try{const cs=JSON.parse(localStorage.getItem(`beu_campos_${MODULE}`));_camposState=cs||_defaultCampos();}catch(e){_camposState=_defaultCampos();}
let _customFields=[];
try{_customFields=JSON.parse(localStorage.getItem(`beu_custom_${MODULE}`)||'[]');}catch(e){}
function _saveCampos(){try{localStorage.setItem(`beu_campos_${MODULE}`,JSON.stringify(_camposState));}catch(e){}}
function _saveCustom(){try{localStorage.setItem(`beu_custom_${MODULE}`,JSON.stringify(_customFields));}catch(e){}}

const ST={EN_RECINTO:'En recinto',EN_CAMINO:'En camino',ESPERA:'En espera',RAMPA:'Rampa',SALIDA:'Salida',SIN_ASIGNAR:'Sin asignar'};
const ST_BG={EN_RECINTO:'#dcfce7;color:#15803d',EN_CAMINO:'#dbeafe;color:#1d4ed8',ESPERA:'#fef9c3;color:#a16207',RAMPA:'#ede9fe;color:#6d28d9',SALIDA:'#f1f5f9;color:#64748b',SIN_ASIGNAR:'#f8fafc;color:#94a3b8'};
function stP(s){return`<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;background:${ST_BG[s]||ST_BG.SIN_ASIGNAR}">${ST[s]||s||'—'}</span>`;}
function dk(){return _u?.tema==='dark';}
const C=()=>{const d=dk();return{bg:d?'#0f172a':'#f4f5f7',card:d?'#1e293b':'#fff',bg2:d?'#0f172a':'#f8f9fc',border:d?'#334155':'#e4e7ec',text:d?'#e2e8f0':'#1a2235',t3:d?'#94a3b8':'#6b7a90',blue:'#2c5ee8',bll:d?'rgba(44,94,232,.1)':'#eef2ff',green:'#0d9f6e',red:'#dc2626',amber:'#d97706',purple:'#7c3aed'};};
function _s(k){return trFree('shell',k)||k;}

// ═══ ENTRY ═══
export function render(container,usuario){
  _c=container;_u=usuario;_data=[];_filtered=[];_sub='lista';
  paint();loadData();loadEsp();loadHist();
  return()=>{if(_unsub)_unsub();};
}

// ═══ DATA ═══
async function loadData(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen(COLLECTION,docs=>{const r=_u.recinto||'';_data=r?docs.filter(d=>d.recinto===r):docs;applyF();rc();});}catch(e){console.warn(`${MODULE}:`,e);}}
async function loadEsp(){try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLLECTION}_especiales`,d=>{_especiales=d;if(_sub==='listanegra')rc();});}catch(e){}}
async function loadHist(){try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLLECTION}_historial`,d=>{_historial=d;if(_sub==='historial')rc();});}catch(e){}}
function _halls(){const s=new Set();_data.forEach(d=>{if(d.hall)s.add(d.hall);});return[...s].sort();}

function applyF(){
  let it=[..._data];
  if(_hallF)it=it.filter(d=>d.hall===_hallF);
  if(_activos)it=it.filter(d=>d.estado==='EN_RECINTO');
  if(_statusF)it=it.filter(d=>d.estado===_statusF);
  if(_dateFrom)it=it.filter(d=>(d.fecha||'')>=_dateFrom);
  if(_dateTo)it=it.filter(d=>(d.fecha||'').slice(0,10)<=_dateTo);
  if(_q){const q=_q.toLowerCase();it=it.filter(d=>`${d.matricula||''} ${d.nombre||''} ${d.apellido||''} ${d.empresa||''} ${d.llamador||''} ${d.hall||''} ${d.referencia||''} ${d.stand||''} ${d.telefono||''}`.toLowerCase().includes(q));}
  it.sort((a,b)=>{const r=String(a[_sortCol]??'').localeCompare(String(b[_sortCol]??''),undefined,{numeric:true});return _sortDir==='asc'?r:-r;});
  _filtered=it;
}

// ═══ PAINT ═══
function paint(){
  const c=C(),p=_u.permisos||{},halls=_halls();applyF();
  _c.innerHTML=`<div style="max-width:1400px;margin:0 auto;display:flex;flex-direction:column;height:100%">
  <!-- TOP -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;flex-shrink:0">
    <div style="font-size:22px;font-weight:700;letter-spacing:-.4px;color:${c.text}">${TITLE}</div>
    <span style="font-size:11px;color:${c.t3}">${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
    <span style="flex:1"></span>
    ${p.canAdd?`<button id="_add" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Añadir ingreso</button>`:''}
  </div>
  <!-- CARD -->
  <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:${c.card};border:1px solid ${c.border};border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.04)">
    <!-- SUBTABS + TOOLBAR -->
    <div style="display:flex;align-items:center;gap:3px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none;flex-wrap:wrap">
      ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modif.'],...(p.canCampos?[['campos','⚙ Campos']]:[])].map(([s,l])=>`<button class="_st" data-s="${s}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:${_sub===s?'600':'500'};background:${_sub===s?c.bll:'transparent'};color:${_sub===s?c.blue:c.t3};cursor:pointer;border:${_sub===s?`1px solid ${c.blue}`:'1px solid transparent'};white-space:nowrap">${l}</button>`).join('')}
      <span style="flex:1"></span>
      <div style="display:flex;gap:3px;flex-shrink:0;align-items:center;flex-wrap:wrap">
        <button class="_tgl${_autoFill?' _on':''}" data-act="autofill" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_autoFill?c.blue:c.border};background:${_autoFill?c.blue:c.bg2};color:${_autoFill?'#fff':c.t3}">⚡ AutoFill</button>
        <button class="_tgl${_posAuto?' _on':''}" data-act="pos" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_posAuto?c.blue:c.border};background:${_posAuto?c.blue:c.bg2};color:${_posAuto?'#fff':c.t3}">🔢 Pos</button>
        <button class="_ab" data-act="import" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Importar Excel">📥</button>
        <button class="_ab" data-act="clipboard" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Copiar tabla">📋</button>
        <button class="_ab" data-act="excel" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Exportar Excel">⬇</button>
        ${p.canClean?`<button class="_ab" data-act="clean" style="padding:4px 8px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:8px;font-size:12px;cursor:pointer" title="Limpiar salidas">🗑</button>`:''}
        ${p.canDel?`<button class="_ab" data-act="nuke" style="padding:4px 8px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:8px;font-size:12px;cursor:pointer" title="Borrar todo">💥</button>`:''}
        ${_sub==='lista'?`<button class="_ab" data-act="cols" style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⚙ Cols</button>`:''}
      </div>
    </div>
    ${_sub!=='historial'&&_sub!=='campos'?`
    <!-- FILTERS -->
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
      <div style="flex:1;min-width:140px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px">
        <span style="font-size:13px;opacity:.5">🔍</span>
        <input id="_q" type="search" placeholder="Matrícula, conductor, empresa..." value="${safeHtml(_q)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit">
      </div>
      <input id="_df" type="date" value="${_dateFrom}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}" title="Desde">
      <input id="_dt" type="date" value="${_dateTo}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}" title="Hasta">
      <select id="_sf" style="border:1px solid ${c.border};border-radius:20px;padding:4px 10px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}">
        <option value="">Todos los estados</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}"${_statusF===k?' selected':''}>${v}</option>`).join('')}
      </select>
      <span id="_act" style="display:inline-flex;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_activos?c.blue:c.border};background:${_activos?c.blue:c.card};color:${_activos?'#fff':c.t3};user-select:none">Solo activos</span>
      ${_q||_hallF||_activos||_dateFrom||_dateTo||_statusF?`<span id="_clr" style="padding:4px 8px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:#fef2f2;color:${c.red};border:1px solid #fecaca">✕</span>`:''}
      <span style="font-size:10px;color:${c.t3};white-space:nowrap">${_filtered.length} reg.</span>
    </div>
    <!-- HALLS -->
    ${halls.length?`<div style="display:flex;gap:4px;padding:6px 12px;border-bottom:1px solid ${c.border};flex-wrap:wrap;flex-shrink:0">
      <span class="_hp" data-h="" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${!_hallF?'700':'500'};cursor:pointer;background:${!_hallF?c.bll:c.bg2};color:${!_hallF?c.blue:c.t3};border:1px solid ${!_hallF?c.blue:c.border}">Todos</span>
      ${halls.map(h=>`<span class="_hp" data-h="${h}" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${_hallF===h?'700':'500'};cursor:pointer;background:${_hallF===h?c.blue:c.bg2};color:${_hallF===h?'#fff':c.t3};border:1px solid ${_hallF===h?c.blue:c.border}">${h}</span>`).join('')}
    </div>`:''}`:''}
    <div id="_body" style="flex:1;overflow:auto"></div>
  </div></div>
  <div id="_cp" style="position:fixed;top:0;right:-300px;width:280px;height:100vh;background:${c.card};border-left:1px solid ${c.border};box-shadow:-4px 0 20px rgba(0,0,0,.08);z-index:500;display:flex;flex-direction:column;transition:right .25s"></div>`;
  _bind();rc();
}

function _bind(){
  const c=C();
  _c.querySelectorAll('._st').forEach(b=>b.onclick=()=>{_sub=b.dataset.s;paint();});
  _c.querySelectorAll('._hp').forEach(b=>b.onclick=()=>{_hallF=b.dataset.h;applyF();paint();});
  const qi=_c.querySelector('#_q');if(qi)qi.oninput=debounce(()=>{_q=qi.value.trim();applyF();rc();},250);
  const df=_c.querySelector('#_df');if(df)df.onchange=()=>{_dateFrom=df.value;applyF();paint();};
  const dt=_c.querySelector('#_dt');if(dt)dt.onchange=()=>{_dateTo=dt.value;applyF();paint();};
  const sf=_c.querySelector('#_sf');if(sf)sf.onchange=()=>{_statusF=sf.value;applyF();paint();};
  const act=_c.querySelector('#_act');if(act)act.onclick=()=>{_activos=!_activos;applyF();paint();};
  const clr=_c.querySelector('#_clr');if(clr)clr.onclick=()=>{_q='';_hallF='';_activos=false;_dateFrom='';_dateTo='';_statusF='';applyF();paint();};
  const add=_c.querySelector('#_add');if(add)add.onclick=()=>openIngModal();
  _c.querySelectorAll('._tgl').forEach(b=>{
    if(b.dataset.act==='autofill')b.onclick=()=>{_autoFill=!_autoFill;paint();toast(_autoFill?'AutoFill ON':'AutoFill OFF');};
    if(b.dataset.act==='pos')b.onclick=()=>{_posAuto=!_posAuto;paint();toast(_posAuto?'Pos auto ON':'Pos auto OFF');};
  });
  _c.querySelectorAll('._ab').forEach(b=>{
    if(b.dataset.act==='excel')b.onclick=()=>exportXLS();
    if(b.dataset.act==='cols')b.onclick=()=>openCP();
    if(b.dataset.act==='import')b.onclick=()=>toast('📥 Importar Excel (próximamente)',c.blue);
    if(b.dataset.act==='clipboard')b.onclick=()=>{try{const t=_filtered.map(d=>`${d.matricula}\t${d.empresa||''}\t${d.hall||''}\t${d.fecha||''}\t${ST[d.estado]||''}`).join('\n');navigator.clipboard.writeText(t);toast('📋 Copiado al portapapeles',c.green);}catch(e){toast('Error al copiar',c.red);}};
    if(b.dataset.act==='clean')b.onclick=async()=>{if(!confirm('¿Limpiar registros con salida?'))return;try{const{fsDel}=await import('./firestore.js');const sal=_data.filter(d=>d.estado==='SALIDA');for(const d of sal)await fsDel(`${COLLECTION}/${d.id}`);toast(`🗑 ${sal.length} registros limpiados`,c.amber);}catch(e){toast(_s('error'),c.red);}};
    if(b.dataset.act==='nuke')b.onclick=async()=>{if(!confirm('⚠️ ¿BORRAR TODO? Esta acción no se puede deshacer.'))return;if(!confirm('¿Estás seguro?'))return;try{const{fsDel}=await import('./firestore.js');for(const d of _data)await fsDel(`${COLLECTION}/${d.id}`);toast('💥 Todo borrado',c.red);}catch(e){toast(_s('error'),c.red);}};
  });
}

function rc(){const b=_c.querySelector('#_body');if(!b)return;if(_sub==='lista')b.innerHTML=rLista();else if(_sub==='listanegra')b.innerHTML=rEsp();else if(_sub==='historial')b.innerHTML=rHist();else if(_sub==='campos')b.innerHTML=rCampos();}

// ═══ LISTA ═══
function rLista(){
  if(!_filtered.length)return`<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">🚛</div><div style="font-weight:600;margin-top:6px">${_s('noData')}</div></div>`;
  const c=C(),p=_u.permisos||{},cols=ALL_COLS.filter(x=>_vis.includes(x.id));
  const sortable=['pos','matricula','llamador','referencia','conductor','empresa','hall','estado','entrada'];
  const th=cols.map(col=>{const sd=_sortCol===col.id?(_sortDir==='asc'?' ▲':' ▼'):'';return`<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${c.t3};border-bottom:1px solid ${c.border};white-space:nowrap;cursor:pointer;background:${c.bg2};user-select:none" onclick="window._i2Sort('${col.id}')" oncontextmenu="window._i2Ctx(event,'${col.id}')">${col.label}${sd}</th>`;}).join('');
  const tb=_filtered.map(d=>`<tr style="border-top:1px solid ${dk()?'#334155':'#f4f5f8'}">${cols.map(col=>_cell(d,col.id,p)).join('')}</tr>`).join('');
  return`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

function _cell(d,id,p){
  const c=C();
  switch(id){
    case'pos':return`<td style="padding:8px 12px;font-weight:700;color:${c.t3}">${d.pos||''}</td>`;
    case'matricula':return`<td style="padding:8px 12px"><span style="background:#1a2235;color:#fff;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;cursor:pointer;display:inline-block;box-shadow:0 2px 6px rgba(26,34,53,.15)" onclick="window._i2Det('${d.id}')">${safeHtml(d.matricula||'—')}</span>${d.remolque?`<br><span style="background:${c.bg2};color:${c.t3};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:2px">${safeHtml(d.remolque)}</span>`:''}</td>`;
    case'remolque':return`<td style="padding:8px 12px;font-size:11px;color:${c.t3}">${safeHtml(d.remolque||'–')}</td>`;
    case'llamador':return`<td style="padding:8px 12px;font-size:11px">${safeHtml(d.llamador||'–')}</td>`;
    case'referencia':return`<td style="padding:8px 12px;font-size:11px;font-family:monospace;color:${c.t3}">${safeHtml(d.referencia||'–')}</td>`;
    case'conductor':return`<td style="padding:8px 12px">${d.nombre?`<b style="font-size:12px">${safeHtml(d.nombre)} ${safeHtml(d.apellido||'')}</b>`:''}${d.empresa?`<br><span style="font-size:11px;color:${c.t3}">${safeHtml(d.empresa)}</span>`:''}${!d.nombre&&!d.empresa?`<span style="color:${c.t3}">–</span>`:''}</td>`;
    case'empresa':return`<td style="padding:8px 12px;font-size:11px;color:${c.t3}">${safeHtml(d.empresa||'–')}</td>`;
    case'telefono':return`<td style="padding:8px 12px">${_tel(d.telPais||'+34',d.telefono)}</td>`;
    case'hall':return`<td style="padding:8px 12px"><span style="background:${c.bll};color:${c.blue};font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;border:1px solid #c7d7f8">${safeHtml(d.hall||'–')}</span></td>`;
    case'stand':return`<td style="padding:8px 12px;font-size:11px">${safeHtml(d.stand||'–')}</td>`;
    case'estado':return`<td style="padding:8px 12px">${stP(d.estado)}</td>`;
    case'entrada':return`<td style="padding:8px 12px;font-size:11px;white-space:nowrap">${formatDate(d.fecha)}</td>`;
    case'acciones':return`<td style="padding:8px 12px"><div style="display:flex;gap:3px;flex-wrap:wrap">
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Print('${d.id}')" title="Imprimir">🖨</button>
      <button style="font-size:11px;background:${c.purple};color:#fff;border:none;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Cut('${d.id}')" title="Troquelado">✂</button>
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Track('${d.id}')" title="Tracking">📡</button>
      ${p.canEdit?`<button style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Edit('${d.id}')" title="Editar">✏️</button>`:''}
      ${d.estado==='EN_RECINTO'&&p.canEdit?`<button style="font-size:11px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Sal('${d.id}')" title="Salida">↩</button>`:''}
      ${d.estado==='SALIDA'&&p.canEdit?`<button style="font-size:11px;background:#ecfdf5;color:${c.green};border:1px solid #a7f3d0;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2React('${d.id}')" title="Reactivar">↺</button>`:''}
      ${p.canDel?`<button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2Del('${d.id}')" title="Eliminar">🗑</button>`:''}
    </div></td>`;
    default:return'<td>–</td>';
  }
}

function _tel(tp,t){if(!t)return'<span style="opacity:.3">–</span>';const f=(tp||'')+String(t).replace(/\s/g,''),w=f.replace('+','').replace(/\D/g,'');return`<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:${f}" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px;transition:all .12s">📞</a><a href="https://wa.me/${w}" target="_blank" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#25D366;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px;transition:all .12s">💬</a><span style="font-size:11px;font-family:monospace;color:#6b7a90">${t}</span></div>`;}

// ═══ ESPECIAL ═══
function rEsp(){
  const c=C(),pC={alta:'#ef4444',media:'#f59e0b',baja:'#22c55e'},pL={alta:'🔴 Alta',media:'🟡 Media',baja:'🟢 Baja'};
  const it=_especiales.filter(m=>m.activo!==false).sort((a,b)=>(b.ts||0)-(a.ts||0));
  return`<div style="padding:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div><div style="font-size:14px;font-weight:700">Vehículos especiales / alertas</div><div style="font-size:11px;color:${c.t3}">Pre-alertas activas para operadores de rampa</div></div><button style="padding:8px 14px;background:${c.blue};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer" onclick="window._i2NewAl()">+ Nueva alerta</button></div>${!it.length?`<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">🔔</div><div style="font-weight:600;margin-top:6px">Sin alertas activas</div></div>`:it.map(m=>`<div style="background:${c.card};border:1px solid ${c.border};border-left:3px solid ${pC[m.prioridad]||pC.media};border-radius:12px;padding:12px 14px;margin-bottom:8px"><div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1"><div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap">${m.matricula?`<span style="background:#1a2235;color:#fff;font-family:monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px">${m.matricula}</span>`:''} ${m.referencia?`<span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid ${c.border}">${m.referencia}</span>`:''}<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:${pC[m.prioridad]||pC.media}22;color:${pC[m.prioridad]||pC.media}">${pL[m.prioridad]||pL.media}</span></div><div style="font-size:13px;font-weight:500;line-height:1.5;margin-bottom:4px">${safeHtml(m.mensaje||'')}</div><div style="font-size:11px;color:${c.t3}">Por: <b>${safeHtml(m.autor||'Sistema')}</b> · ${formatDate(m.ts)}</div></div><div style="display:flex;gap:4px;flex-shrink:0"><button style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2EditAl('${m.id}')">✏️</button><button style="font-size:12px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._i2DelAl('${m.id}')">🗑</button></div></div></div>`).join('')}</div>`;
}

// ═══ HISTORIAL ═══
function rHist(){
  const c=C(),aI={new:'➕',edit:'✏️',salida:'↩',reactivar:'↺'},aC={new:c.purple,edit:c.blue,salida:c.amber,reactivar:c.green};
  const it=[..._historial].sort((a,b)=>(b.ts||0)-(a.ts||0));
  const byD={};it.forEach(e=>{const d=formatDate(e.ts,{weekday:'long',day:'2-digit',month:'long'});if(!byD[d])byD[d]=[];byD[d].push(e);});
  return`<div style="padding:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div><div style="font-size:14px;font-weight:700">Historial de modificaciones</div><div style="font-size:11px;color:${c.t3}">Últimos cambios en ${TITLE}</div></div></div>${!it.length?`<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">📋</div><div style="font-weight:600;margin-top:6px">Sin modificaciones</div></div>`:`<div style="position:relative"><div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:${c.border}"></div>${Object.entries(byD).map(([day,evts])=>`<div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.t3};margin-bottom:8px;padding-left:38px">${day}</div>${evts.map(e=>`<div style="display:flex;gap:10px;margin-bottom:7px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:${aC[e.action]||c.t3};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:3px;box-shadow:0 0 0 3px ${c.bg};z-index:1">${aI[e.action]||'•'}</div><div style="flex:1;background:${c.card};border:1px solid ${c.border};border-radius:10px;padding:8px 12px"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px"><span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px">${safeHtml(e.mat||'')}</span><span style="font-size:10px;font-weight:700;color:${aC[e.action]||c.t3}">${(e.action||'').toUpperCase()}</span></div>${e.detail?`<div style="font-size:12px;line-height:1.5;margin-bottom:3px">${safeHtml(e.detail)}</div>`:''}<div style="font-size:10px;color:${c.t3}">${safeHtml(e.user||'')} · ${formatDate(e.ts,{hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div>`).join('')}</div>`}</div>`;
}

// ═══ CAMPOS ═══
function rCampos(){
  const c=C();
  return`<div style="padding:14px;max-width:700px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div><div style="font-size:14px;font-weight:700">Configuración de campos</div><div style="font-size:11px;color:${c.t3}">Activá, ocultá o renombrá los campos del formulario</div></div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer" onclick="window._i2ResetCampos()">↺ Restaurar</button></div>
  ${Object.entries(CAMPOS_DEFS).map(([sec,def])=>`<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};display:flex;align-items:center;gap:7px">${def.icon} ${def.label}</div>
  ${def.fields.map(f=>{const st=_camposState[f.id]||{visible:true,required:!!f.req,label:f.label};return`<div style="display:flex;align-items:center;gap:10px;padding:8px 14px"><div style="width:34px;height:18px;border-radius:20px;background:${st.visible?c.blue:c.border};position:relative;flex-shrink:0;cursor:pointer;transition:background .18s" onclick="window._i2TogCampo('${f.id}')"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${st.visible?'18':'2'}px;transition:left .18s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:5px"><span id="_cl${f.id}" style="font-size:12px;font-weight:600">${safeHtml(st.label)}</span>${f.req?'<span style="font-size:9px;opacity:.35">(requerido)</span>':''}<span style="font-size:11px;opacity:.3;cursor:pointer" onclick="window._i2RenCampo('${f.id}')" title="Renombrar">✏️</span></div><div style="font-size:11px;opacity:.45">${f.desc||''}</div></div><label style="display:flex;align-items:center;gap:4px;font-size:11px;opacity:.6;cursor:pointer;white-space:nowrap"><input type="checkbox" ${st.required?'checked':''} ${f.req?'disabled':''} onchange="window._i2ReqCampo('${f.id}',this.checked)" style="accent-color:${c.blue}"> Obligatorio</label></div>`;}).join('')}
  </div>`).join('')}
  ${_customFields.length?`<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.purple};display:flex;align-items:center;gap:7px">🔧 Campos personalizados</div>${_customFields.map((cf,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 14px"><span style="font-size:12px;font-weight:600;flex:1">${safeHtml(cf.label)} <small style="opacity:.4">(${cf.type})</small></span><button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:2px 6px;cursor:pointer" onclick="window._i2DelCustom(${i})">✕</button></div>`).join('')}</div>`:''} 
  <button style="padding:8px 14px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer;width:100%" onclick="window._i2AddCustom()">+ Agregar campo personalizado</button>
  </div>`;
}

// ═══ COL PANEL ═══
function openCP(){const p=_c.querySelector('#_cp');if(!p)return;p.style.right='0';_rCP();}
function closeCP(){const p=_c.querySelector('#_cp');if(p)p.style.right='-300px';}
function _rCP(){
  const c=C(),p=_c.querySelector('#_cp');if(!p)return;
  p.innerHTML=`<div style="padding:14px 16px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;flex-shrink:0"><span style="font-size:14px;font-weight:700">⚙ Columnas</span><button style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="window._i2CloseCP()">✕</button></div>
  <div style="flex:1;overflow-y:auto;padding:12px 14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.t3};margin-bottom:8px">Visibilidad</div>
  ${ALL_COLS.map(col=>{const on=_vis.includes(col.id);return`<div style="display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;cursor:${col.req?'default':'pointer'};opacity:${col.req?.55:1};margin-bottom:2px" ${col.req?'':`onclick="window._i2TogCol('${col.id}')"`}><div style="width:34px;height:18px;border-radius:20px;background:${on?c.blue:c.border};position:relative;flex-shrink:0"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on?'18':'2'}px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div><span style="font-size:12px;font-weight:500;color:${on?c.blue:c.text};flex:1">${col.label}${col.req?' <small style="opacity:.3">(fija)</small>':''}</span></div>`;}).join('')}
  <button style="width:100%;margin-top:10px;padding:7px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer;font-family:inherit" onclick="window._i2ResetCols()">↺ Restaurar</button></div>
  <div style="padding:12px 14px;border-top:1px solid ${c.border};flex-shrink:0"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.t3};margin-bottom:8px">Plantillas</div><div style="display:flex;gap:6px;margin-bottom:8px"><input id="_tIn" placeholder="Nombre plantilla..." style="flex:1;border:1px solid ${c.border};border-radius:8px;padding:7px 10px;font-size:12px;font-family:inherit;outline:none;background:${c.bg2};color:${c.text}"><button style="padding:7px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" onclick="window._i2SaveTpl()">Guardar</button></div>
  ${Object.keys(_tpls).length?Object.keys(_tpls).map(n=>`<div style="display:flex;align-items:center;gap:5px;padding:7px 10px;background:${_tpls[n]._active?c.bll:c.bg2};border:1px solid ${_tpls[n]._active?c.blue:c.border};border-radius:8px;cursor:pointer;margin-bottom:4px" onclick="window._i2ApplyTpl('${n}')"><span style="flex:1;font-size:12px;font-weight:500">📋 ${n}</span><span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();window._i2DelTpl('${n}')">✕</span></div>`).join(''):`<div style="font-size:11px;padding:4px;opacity:.4">Sin plantillas guardadas</div>`}</div>`;
}

// ═══ MODAL INGRESO ═══
function openIngModal(editId=null){
  const c=C(),old=document.getElementById('_im');if(old)old.remove();
  const r=editId?_data.find(d=>d.id===editId):{};
  const m=document.createElement('div');m.id='_im';
  m.style.cssText=`position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px`;
  const fi=(k,v,ph,up)=>`<div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">${k}</label><input data-f="${k.toLowerCase().replace(/[^a-z]/g,'')}" value="${safeHtml(v||'')}" placeholder="${ph||''}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" ${up?'oninput="this.value=this.value.toUpperCase()"':''}></div>`;
  const sec=(icon,title,html)=>`<div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">${icon} ${title}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${html}</div></div>`;

  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:660px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}"><div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nueva Entrada'}</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_im').remove()">✕ Cerrar</button></div>
    <div style="padding:16px 22px">
      ${sec('🚛','Vehículo',`
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Matrícula *</label><input data-f="matricula" value="${safeHtml(r.matricula||'')}" placeholder="8611MTL" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Remolque</label><input data-f="remolque" value="${safeHtml(r.remolque||'')}" placeholder="TR-XXXX" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Posición</label><input data-f="posicion" value="${safeHtml(r.posicion||'')}" placeholder="Pos. en recinto" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Llamador</label><input data-f="llamador" value="${safeHtml(r.llamador||'')}" placeholder="Responsable" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Logística</label><input data-f="logistica" value="${safeHtml(r.logistica||'')}" placeholder="Empresa logística" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Tipo vehículo</label><select data-f="tipoVeh" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"><option value="">— Tipo —</option><option${r.tipoVeh==='Camión'?' selected':''}>Camión</option><option${r.tipoVeh==='Furgón'?' selected':''}>Furgón</option><option${r.tipoVeh==='Trailer'?' selected':''}>Trailer</option><option${r.tipoVeh==='Furgoneta'?' selected':''}>Furgoneta</option></select></div>
      `)}
      ${sec('👤','Conductor',`
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Nombre</label><input data-f="nombre" value="${safeHtml(r.nombre||'')}" placeholder="Nombre" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Apellido</label><input data-f="apellido" value="${safeHtml(r.apellido||'')}" placeholder="Apellido" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Empresa</label><input data-f="empresa" value="${safeHtml(r.empresa||'')}" placeholder="Empresa" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Teléfono</label><div style="display:flex;gap:5px"><select data-f="telPais" style="width:76px;flex-shrink:0;border:1px solid ${c.border};border-radius:9px;padding:7px 5px;font-size:12px;background:${c.card};font-family:inherit;color:${c.text}"><option value="+34"${(r.telPais||'+34')==='+34'?' selected':''}>🇪🇸 +34</option><option value="+33"${r.telPais==='+33'?' selected':''}>🇫🇷 +33</option><option value="+49"${r.telPais==='+49'?' selected':''}>🇩🇪 +49</option><option value="+48"${r.telPais==='+48'?' selected':''}>🇵🇱 +48</option><option value="+39"${r.telPais==='+39'?' selected':''}>🇮🇹 +39</option><option value="+44"${r.telPais==='+44'?' selected':''}>🇬🇧 +44</option></select><input data-f="telefono" type="tel" value="${safeHtml(r.telefono||'')}" placeholder="600 000 000" style="flex:1;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">DNI / Pasaporte</label><input data-f="dni" value="${safeHtml(r.dni||'')}" placeholder="Opcional" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Supervisor</label><input data-f="supervisor" value="${safeHtml(r.supervisor||'')}" placeholder="Nombre supervisor" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
      `)}
      ${sec('📅','Evento',`
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Montador</label><input data-f="montador" value="${safeHtml(r.montador||'')}" placeholder="Empresa montadora" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Expositor</label><input data-f="expositor" value="${safeHtml(r.expositor||'')}" placeholder="Nombre expositor" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Hall *</label><input data-f="hall" value="${safeHtml(r.hall||'')}" placeholder="5A" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Stand</label><input data-f="stand" value="${safeHtml(r.stand||'')}" placeholder="E17" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Ref / Booking</label><input data-f="referencia" value="${safeHtml(r.referencia||'')}" placeholder="REF-0000" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Puerta Hall</label><input data-f="puerta" value="${safeHtml(r.puerta||'')}" placeholder="Puerta acceso" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Fecha *</label><input data-f="fechaIng" type="date" value="${(r.fechaIng||new Date().toISOString().slice(0,10))}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Hora</label><input data-f="horaIng" type="time" value="${(r.horaIng||new Date().toTimeString().slice(0,5))}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
      `)}
      <div style="margin-bottom:12px"><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Notas</label><input data-f="obs" value="${safeHtml(r.obs||'')}" placeholder="Observaciones" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}">
      <button style="padding:9px 18px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer;font-family:inherit" onclick="this.closest('#_im').remove()">Cancelar</button>
      <button id="_sv" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${editId?'Guardar':'Crear Ingreso'}</button>
    </div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sv').onclick=async()=>{
    const fd={recinto:_u.recinto||'',modificado:nowLocal(),modificadoPor:_u.uid};
    m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    if(!fd.matricula){toast('Matrícula requerida','#ef4444');return;}
    fd.matricula=normPlate(fd.matricula);
    try{
      if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${editId}`,fd);_log('edit',fd.matricula,'Edición');}
      else{fd.fecha=nowLocal();fd.estado='EN_RECINTO';fd.creadoPor=_u.uid;const{fsAdd}=await import('./firestore.js');await fsAdd(COLLECTION,fd);_log('new',fd.matricula,'Nuevo ingreso');}
      toast(_s('save')+' ✓','#10b981');m.remove();
    }catch(e){toast(_s('error'),'#ef4444');}
  };
  document.body.appendChild(m);
}

// ═══ MODAL ALERTA ═══
function openAlM(eid=null){
  const c=C(),old=document.getElementById('_am');if(old)old.remove();
  const r=eid?_especiales.find(d=>d.id===eid):{};
  const m=document.createElement('div');m.id='_am';
  m.style.cssText=`position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px`;
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:500px;color:${c.text};overflow:hidden">
    <div style="padding:18px 22px 12px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between"><div style="font-size:18px;font-weight:700">${eid?'✏️ Editar alerta':'+ Nueva alerta especial'}</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_am').remove()">✕</button></div>
    <div style="padding:16px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Matrícula</label><input data-a="matricula" value="${safeHtml(r.matricula||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Ref / Booking</label><input data-a="referencia" value="${safeHtml(r.referencia||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
      </div>
      <div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Mensaje *</label><input data-a="mensaje" value="${safeHtml(r.mensaje||'')}" placeholder="Descripción para el operador..." style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Autor</label><input data-a="autor" value="${safeHtml(r.autor||'')}" placeholder="Oficina / Recinto" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">Prioridad</label><select data-a="prioridad" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"><option value="alta"${r.prioridad==='alta'?' selected':''}>🔴 Alta</option><option value="media"${!r.prioridad||r.prioridad==='media'?' selected':''}>🟡 Media</option><option value="baja"${r.prioridad==='baja'?' selected':''}>🟢 Baja</option></select></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}"><button style="padding:8px 16px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer;font-family:inherit" onclick="this.closest('#_am').remove()">Cancelar</button><button id="_sva" style="padding:8px 18px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">Guardar alerta</button></div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sva').onclick=async()=>{
    const fd={ts:Date.now(),activo:true};m.querySelectorAll('[data-a]').forEach(el=>{fd[el.dataset.a]=el.value||'';});
    if(!fd.mensaje){toast('Mensaje requerido','#ef4444');return;}
    try{if(eid){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}_especiales/${eid}`,fd);}else{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLLECTION}_especiales`,fd);}toast('Alerta guardada ✓','#10b981');m.remove();}catch(e){toast(_s('error'),'#ef4444');}
  };
  document.body.appendChild(m);
}

// ═══ ACTIONS ═══
async function _log(action,mat,detail){try{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLLECTION}_historial`,{ts:Date.now(),user:_u.nombre||_u.uid,action,mat,detail,collection:MODULE});}catch(e){}}
async function _sal(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${id}`,{estado:'SALIDA',salida:nowLocal(),modificado:nowLocal(),modificadoPor:_u.uid});_log('salida',d.matricula,'En recinto → Salida');toast('↩ Salida','#d97706');}catch(e){toast(_s('error'),'#ef4444');}}
async function _react(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLLECTION}/${id}`,{estado:'EN_RECINTO',salida:null,modificado:nowLocal(),modificadoPor:_u.uid});_log('reactivar',d.matricula,'Salida → En recinto');toast('↺ Reactivado','#0d9f6e');}catch(e){toast(_s('error'),'#ef4444');}}
async function _del(id){if(!confirm(_s('confirm')+'?'))return;const d=_data.find(x=>x.id===id);try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLLECTION}/${id}`);if(d)_log('edit',d.matricula,'Eliminado');toast(_s('delete')+' ✓','#f59e0b');}catch(e){toast(_s('error'),'#ef4444');}}
async function exportXLS(){try{toast(_s('loading'),'#2c5ee8');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const ws=X.utils.json_to_sheet(_filtered.map(d=>({Matrícula:d.matricula,Remolque:d.remolque,Llamador:d.llamador,Conductor:d.nombre,Empresa:d.empresa,Tel:d.telefono,Hall:d.hall,Stand:d.stand,Estado:ST[d.estado]||d.estado,Entrada:d.fecha,Ref:d.referencia})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,TITLE);X.writeFile(wb,`${TITLE}_${new Date().toISOString().slice(0,10)}.xlsx`);toast('Exportado ✓','#10b981');}catch(e){toast(_s('error'),'#ef4444');}}

// ═══ WINDOW BINDINGS ═══
window._i2Sort=(col)=>{if(_sortCol===col)_sortDir=_sortDir==='asc'?'desc':'asc';else{_sortCol=col;_sortDir='asc';}applyF();rc();};
window._i2Ctx=(e,col)=>{e.preventDefault();/* TODO context menu */};
window._i2Det=(id)=>openIngModal(id);
window._i2Edit=(id)=>openIngModal(id);
window._i2Del=(id)=>_del(id);
window._i2Sal=(id)=>_sal(id);
window._i2React=(id)=>_react(id);
window._i2Print=(id)=>toast('🖨 Impresión (módulo impresión)','#2c5ee8');
window._i2Cut=(id)=>toast('✂ Troquelado (próximamente)','#7c3aed');
window._i2Track=(id)=>toast('📡 Tracking (próximamente)','#2c5ee8');
window._i2NewAl=()=>openAlM();
window._i2EditAl=(id)=>openAlM(id);
window._i2DelAl=async(id)=>{try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLLECTION}_especiales/${id}`);toast('Eliminada','#f59e0b');}catch(e){toast(_s('error'),'#ef4444');}};
window._i2CloseCP=()=>closeCP();
window._i2TogCol=(id)=>{const col=ALL_COLS.find(c=>c.id===id);if(col?.req)return;if(_vis.includes(id))_vis=_vis.filter(x=>x!==id);else _vis.push(id);_saveVis();_rCP();applyF();rc();};
window._i2ResetCols=()=>{_vis=[...DEF_VIS];_saveVis();_rCP();applyF();rc();};
window._i2SaveTpl=()=>{const el=_c.querySelector('#_tIn');const n=el?.value.trim();if(!n){toast('Nombre requerido','#ef4444');return;}Object.keys(_tpls).forEach(k=>_tpls[k]._active=false);_tpls[n]={vis:[..._vis],_active:true};_saveTpls();el.value='';_rCP();toast(`Plantilla "${n}" guardada`,'#10b981');};
window._i2ApplyTpl=(n)=>{const t=_tpls[n];if(!t)return;_vis=[...t.vis];Object.keys(_tpls).forEach(k=>_tpls[k]._active=false);_tpls[n]._active=true;_saveVis();_saveTpls();_rCP();applyF();rc();toast(`"${n}" activada`,'#10b981');};
window._i2DelTpl=(n)=>{delete _tpls[n];_saveTpls();_rCP();toast('Eliminada','#f59e0b');};
window._i2TogCampo=(id)=>{const f=Object.values(CAMPOS_DEFS).flatMap(s=>s.fields).find(x=>x.id===id);if(f?.req){toast('Campo requerido','#d97706');return;}if(!_camposState[id])_camposState[id]={visible:true,required:false,label:id};_camposState[id].visible=!_camposState[id].visible;_saveCampos();rc();};
window._i2RenCampo=(id)=>{const el=document.getElementById('_cl'+id);if(!el)return;const cur=_camposState[id]?.label||id;const inp=document.createElement('input');inp.value=cur;inp.style.cssText='font-size:12px;font-weight:600;border:none;border-bottom:2px solid #2c5ee8;background:transparent;color:inherit;outline:none;width:120px;padding:1px 2px';inp.onblur=()=>{if(!_camposState[id])_camposState[id]={visible:true,required:false,label:id};_camposState[id].label=inp.value.trim()||cur;_saveCampos();rc();};inp.onkeydown=(e)=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape'){inp.value=cur;inp.blur();}};el.replaceWith(inp);inp.focus();inp.select();};
window._i2ReqCampo=(id,v)=>{if(!_camposState[id])_camposState[id]={visible:true,required:false,label:id};_camposState[id].required=v;_saveCampos();};
window._i2ResetCampos=()=>{_camposState=_defaultCampos();_saveCampos();_customFields=[];_saveCustom();rc();toast('Campos restaurados','#10b981');};
window._i2AddCustom=()=>{const name=prompt('Nombre del campo:');if(!name)return;const type=prompt('Tipo (texto, numero, fecha, alfanumerico):','texto');if(!type)return;_customFields.push({label:name.trim(),type:type.trim()});_saveCustom();rc();toast(`Campo "${name}" agregado`,'#10b981');};
window._i2DelCustom=(i)=>{_customFields.splice(i,1);_saveCustom();rc();toast('Campo eliminado','#f59e0b');};
