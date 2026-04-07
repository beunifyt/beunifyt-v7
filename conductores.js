// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo Ingresos COMPLETO
// Usa field-engine.js para campos, columnas, plantillas
// ⚠ ERROR GRAVE PENDIENTE: id 'ingresos2' debería ser 'ingresos'
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, formatDate, debounce, normPlate } from './utils.js';
import { initFields, getFieldState, getVisibleFormFields, initCols, getVisCols, renderCamposHTML, renderColPanelHTML } from './field-engine.js';

const MOD='conductores', COLL='accesos', TITLE='Ingresos';

// ── FIELD DEFINITIONS ──
const FIELD_DEFS={
  vehiculo:{icon:'🚛',label:'Vehículo',fields:[
    {id:'matricula',label:'Matrícula',req:1,desc:'Placa del vehículo',type:'text'},
    {id:'remolque',label:'Remolque',desc:'Matrícula del remolque',type:'text'},
    {id:'posicion',label:'Posición',desc:'Posición en recinto',type:'text'},
    {id:'llamador',label:'Llamador',desc:'Responsable llamada',type:'text'},
    {id:'logistica',label:'Logística',desc:'Empresa logística',type:'text'},
    {id:'tipo_veh',label:'Tipo vehículo',desc:'Camión, furgón...',type:'select',options:['','Camión','Furgón','Trailer','Furgoneta','Otro']},
    {id:'pais',label:'País',desc:'País de matrícula',type:'text'},
  ]},
  conductor:{icon:'👤',label:'Conductor',fields:[
    {id:'nombre',label:'Nombre',req:1,desc:'Nombre del conductor',type:'text'},
    {id:'apellido',label:'Apellido',desc:'Apellido',type:'text'},
    {id:'empresa',label:'Empresa',desc:'Empresa transportista',type:'text'},
    {id:'telefono',label:'Teléfono',desc:'Tel. conductor',type:'tel'},
    {id:'telPais',label:'Prefijo',desc:'Código país',type:'select',options:['+34 🇪🇸','+33 🇫🇷','+49 🇩🇪','+48 🇵🇱','+39 🇮🇹','+44 🇬🇧','+351 🇵🇹']},
    {id:'dni',label:'DNI/Pasaporte',desc:'Documento identidad',type:'text'},
    {id:'supervisor',label:'Supervisor',desc:'Nombre supervisor evento',type:'text'},
    {id:'tel_sup',label:'Tel. supervisor',desc:'Teléfono supervisor',type:'tel'},
  ]},
  evento:{icon:'📅',label:'Evento',fields:[
    {id:'montador',label:'Montador',desc:'Empresa montadora',type:'text'},
    {id:'expositor',label:'Expositor',desc:'Nombre del expositor',type:'text'},
    {id:'hall',label:'Hall',req:1,desc:'Hall de destino',type:'text'},
    {id:'stand',label:'Stand',desc:'Stand de entrega',type:'text'},
    {id:'referencia',label:'Ref/Booking',desc:'Número de reserva',type:'text'},
    {id:'puerta',label:'Puerta Hall',desc:'Puerta de acceso',type:'text'},
    {id:'acceso',label:'Tipo acceso',desc:'Principal, lateral...',type:'select',options:['','Principal','Lateral','Trasero','Especial']},
    {id:'fechaIng',label:'Fecha',req:1,desc:'Fecha de ingreso',type:'date'},
    {id:'horaIng',label:'Hora',desc:'Hora de ingreso',type:'time'},
    {id:'obs',label:'Notas',desc:'Observaciones',type:'text'},
  ]},
};

const ALL_COLS=[
  {id:'pos',label:'#',req:1},{id:'matricula',label:'Matrícula',req:1},
  {id:'remolque',label:'Remolque'},{id:'llamador',label:'Llamador'},
  {id:'referencia',label:'Ref.'},{id:'conductor',label:'Conductor'},
  {id:'empresa',label:'Empresa'},{id:'telefono',label:'Tel.'},
  {id:'hall',label:'Hall'},{id:'stand',label:'Stand'},
  {id:'estado',label:'Estado'},{id:'entrada',label:'Entrada'},
  {id:'acciones',label:'Acc.',req:1},
];

const ST={EN_RECINTO:'En recinto',EN_CAMINO:'En camino',ESPERA:'En espera',RAMPA:'Rampa',SALIDA:'Salida',SIN_ASIGNAR:'Sin asignar'};
const ST_BG={EN_RECINTO:'#dcfce7;color:#15803d',EN_CAMINO:'#dbeafe;color:#1d4ed8',ESPERA:'#fef9c3;color:#a16207',RAMPA:'#ede9fe;color:#6d28d9',SALIDA:'#f1f5f9;color:#64748b',SIN_ASIGNAR:'#f8fafc;color:#94a3b8'};
function stP(s){return`<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;background:${ST_BG[s]||ST_BG.SIN_ASIGNAR}">${ST[s]||s||'—'}</span>`;}

let _c,_u,_data=[],_filtered=[],_unsub,_especiales=[],_historial=[];
let _sub='lista',_q='',_hallF='',_activos=false,_dateFrom='',_dateTo='',_statusF='';
let _sortCol='fecha',_sortDir='desc',_autoFill=false,_posAuto=false;

function dk(){return _u?.tema==='dark';}
const C=()=>{const d=dk();return{bg:d?'#0f172a':'#f4f5f7',card:d?'#1e293b':'#fff',bg2:d?'#0f172a':'#f8f9fc',border:d?'#334155':'#e4e7ec',text:d?'#e2e8f0':'#1a2235',t3:d?'#94a3b8':'#6b7a90',blue:'#2c5ee8',bll:d?'rgba(44,94,232,.1)':'#eef2ff',green:'#0d9f6e',red:'#dc2626',amber:'#d97706',purple:'#7c3aed'};};
function _s(k){return trFree('shell',k)||k;}

// ═══ ENTRY ═══
export function render(container,usuario){
  _c=container;_u=usuario;_data=[];_filtered=[];_sub='lista';
  initFields(MOD,FIELD_DEFS);
  initCols(MOD,ALL_COLS);
  // Hook field-engine refresh callbacks
  window._fe_refresh=(mod)=>{if(mod===MOD)rc();};
  window._fe_refreshcp=(mod)=>{if(mod===MOD)_rCP();};
  window._fe_allcols=(mod)=>mod===MOD?ALL_COLS:[];
  window._fe_onclosecp=(mod)=>{if(mod===MOD)closeCP();};
  paint();loadData();loadEsp();loadHist();
  return()=>{if(_unsub)_unsub();};
}

// ═══ DATA ═══
async function loadData(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen(COLL,docs=>{const r=_u.recinto||'';_data=r?docs.filter(d=>d.recinto===r):docs;applyF();rc();});}catch(e){console.warn(`${MOD}:`,e);}}
async function loadEsp(){try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLL}_especiales`,d=>{_especiales=d;if(_sub==='listanegra')rc();});}catch(e){}}
async function loadHist(){try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLL}_historial`,d=>{_historial=d;if(_sub==='historial')rc();});}catch(e){}}
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
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;flex-shrink:0">
    <div style="font-size:22px;font-weight:700;letter-spacing:-.4px;color:${c.text}">${TITLE}</div>
    <span style="font-size:11px;color:${c.t3}">${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
    <span style="flex:1"></span>
    ${p.canAdd?`<button id="_add" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo conductor</button>`:''}
  </div>
  <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:${c.card};border:1px solid ${c.border};border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.04)">
    <div style="display:flex;align-items:center;gap:3px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none;flex-wrap:wrap">
      ${[['lista','📋 Lista'],['historial','📝 Modif.'],...(p.canCampos?[['campos','⚙ Campos']]:[])].map(([s,l])=>`<button class="_st" data-s="${s}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:${_sub===s?'600':'500'};background:${_sub===s?c.bll:'transparent'};color:${_sub===s?c.blue:c.t3};cursor:pointer;border:${_sub===s?`1px solid ${c.blue}`:'1px solid transparent'};white-space:nowrap">${l}</button>`).join('')}
      <span style="flex:1"></span>
      <div style="display:flex;gap:3px;flex-shrink:0;align-items:center;flex-wrap:wrap">
        <button class="_tgl" data-a="af" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_autoFill?c.blue:c.border};background:${_autoFill?c.blue:c.bg2};color:${_autoFill?'#fff':c.t3}">⚡ AutoFill</button>
        <button class="_tgl" data-a="pos" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_posAuto?c.blue:c.border};background:${_posAuto?c.blue:c.bg2};color:${_posAuto?'#fff':c.t3}">🔢 Pos</button>
        <button class="_ab" data-a="imp" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Importar">📥</button>
        <button class="_ab" data-a="clip" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Copiar">📋</button>
        <button class="_ab" data-a="xls" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Excel">⬇</button>
        ${p.canClean?`<button class="_ab" data-a="clean" style="padding:4px 8px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:8px;font-size:12px;cursor:pointer" title="Limpiar">🗑</button>`:''}
        ${p.canDel?`<button class="_ab" data-a="nuke" style="padding:4px 8px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:8px;font-size:12px;cursor:pointer" title="Borrar todo">💥</button>`:''}
        ${_sub==='lista'?`<button class="_ab" data-a="cols" style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⚙ Cols</button>`:''}
      </div>
    </div>
    ${_sub!=='historial'&&_sub!=='campos'?`
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
      <div style="max-width:240px;min-width:120px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px"><span style="font-size:13px;opacity:.5">🔍</span><input id="_q" type="search" placeholder="Matrícula, conductor, empresa..." value="${safeHtml(_q)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit"></div>
      <input id="_df" type="date" value="${_dateFrom}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}" title="Desde">
      <input id="_dt" type="date" value="${_dateTo}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}" title="Hasta">
      <select id="_sf" style="border:1px solid ${c.border};border-radius:20px;padding:4px 10px;font-size:11px;background:${c.bg2};outline:none;height:30px;font-family:inherit;color:${c.t3}"><option value="">Todos</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}"${_statusF===k?' selected':''}>${v}</option>`).join('')}</select>
      <span id="_act" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_activos?c.blue:c.border};background:${_activos?c.blue:c.card};color:${_activos?'#fff':c.t3};user-select:none">Solo activos</span>
      ${_q||_hallF||_activos||_dateFrom||_dateTo||_statusF?`<span id="_clr" style="padding:4px 8px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;background:#fef2f2;color:${c.red};border:1px solid #fecaca">✕</span>`:''}
      <span style="font-size:10px;color:${c.t3};white-space:nowrap">${_filtered.length} reg.</span>
    </div>
    ${halls.length?`<div style="display:flex;gap:4px;padding:6px 12px;border-bottom:1px solid ${c.border};flex-wrap:wrap;flex-shrink:0">
      <span class="_hp" data-h="" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${!_hallF?'700':'500'};cursor:pointer;background:${!_hallF?c.bll:c.bg2};color:${!_hallF?c.blue:c.t3};border:1px solid ${!_hallF?c.blue:c.border}">Todos</span>
      ${halls.map(h=>`<span class="_hp" data-h="${h}" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${_hallF===h?'700':'500'};cursor:pointer;background:${_hallF===h?c.blue:c.bg2};color:${_hallF===h?'#fff':c.t3};border:1px solid ${_hallF===h?c.blue:c.border}">${h}</span>`).join('')}
    </div>`:''}`:''}
    <div id="_body" style="flex:1;overflow:auto"></div>
  </div></div>
  <div id="_cp" style="position:fixed;top:0;right:-300px;width:280px;height:100vh;background:${c.card};border-left:1px solid ${c.border};box-shadow:-4px 0 20px rgba(0,0,0,.08);z-index:500;display:flex;flex-direction:column;transition:right .25s"></div>`;
  _bindAll();rc();
}

function _bindAll(){
  const c=C();
  _c.querySelectorAll('._st').forEach(b=>b.onclick=()=>{_sub=b.dataset.s;paint();});
  _c.querySelectorAll('._hp').forEach(b=>b.onclick=()=>{_hallF=b.dataset.h;applyF();paint();});
  const qi=_c.querySelector('#_q');if(qi)qi.oninput=debounce(()=>{_q=qi.value.trim();applyF();rc();},250);
  const df=_c.querySelector('#_df');if(df)df.onchange=()=>{_dateFrom=df.value;applyF();paint();};
  const dt=_c.querySelector('#_dt');if(dt)dt.onchange=()=>{_dateTo=dt.value;applyF();paint();};
  const sf=_c.querySelector('#_sf');if(sf)sf.onchange=()=>{_statusF=sf.value;applyF();paint();};
  const act=_c.querySelector('#_act');if(act)act.onclick=()=>{_activos=!_activos;applyF();paint();};
  const clr=_c.querySelector('#_clr');if(clr)clr.onclick=()=>{_q='';_hallF='';_activos=false;_dateFrom='';_dateTo='';_statusF='';applyF();paint();};
  const add=_c.querySelector('#_add');if(add)add.onclick=()=>openModal();
  _c.querySelectorAll('._tgl').forEach(b=>{
    if(b.dataset.a==='af')b.onclick=()=>{_autoFill=!_autoFill;paint();toast(_autoFill?'AutoFill ON':'AutoFill OFF');};
    if(b.dataset.a==='pos')b.onclick=()=>{_posAuto=!_posAuto;paint();toast(_posAuto?'Pos auto ON':'Pos auto OFF');};
  });
  _c.querySelectorAll('._ab').forEach(b=>{
    if(b.dataset.a==='xls')b.onclick=()=>exportXLS();
    if(b.dataset.a==='cols')b.onclick=()=>openCP();
    if(b.dataset.a==='imp')b.onclick=()=>toast('📥 Importar (próximamente)',c.blue);
    if(b.dataset.a==='clip')b.onclick=()=>{try{navigator.clipboard.writeText(_filtered.map(d=>`${d.matricula}\t${d.empresa||''}\t${d.hall||''}\t${d.fecha||''}\t${ST[d.estado]||''}`).join('\n'));toast('📋 Copiado',c.green);}catch(e){toast('Error',c.red);}};
    if(b.dataset.a==='clean')b.onclick=async()=>{if(!confirm('¿Limpiar salidas?'))return;const{fsDel}=await import('./firestore.js');const sal=_data.filter(d=>d.estado==='SALIDA');for(const d of sal)await fsDel(`${COLL}/${d.id}`);toast(`🗑 ${sal.length} limpiados`,c.amber);};
    if(b.dataset.a==='nuke')b.onclick=async()=>{if(!confirm('⚠️ ¿BORRAR TODO?'))return;if(!confirm('¿Seguro?'))return;const{fsDel}=await import('./firestore.js');for(const d of _data)await fsDel(`${COLL}/${d.id}`);toast('💥 Borrado',c.red);};
  });
}

function rc(){const b=_c.querySelector('#_body');if(!b)return;if(_sub==='lista')b.innerHTML=rLista();else if(_sub==='listanegra')b.innerHTML=rEsp();else if(_sub==='historial')b.innerHTML=rHist();else if(_sub==='campos')b.innerHTML=renderCamposHTML(MOD,C());}

// ═══ LISTA ═══
function rLista(){
  if(!_filtered.length)return`<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">🚛</div><div style="font-weight:600;margin-top:6px">${_s('noData')}</div></div>`;
  const c=C(),p=_u.permisos||{},vis=getVisCols(MOD),cols=ALL_COLS.filter(x=>vis.includes(x.id));
  const th=cols.map(col=>{const sd=_sortCol===col.id?(_sortDir==='asc'?' ▲':' ▼'):'';return`<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${c.t3};border-bottom:1px solid ${c.border};white-space:nowrap;cursor:pointer;background:${c.bg2};user-select:none" onclick="window._cdSort('${col.id}')">${col.label}${sd}</th>`;}).join('');
  const tb=_filtered.map(d=>`<tr style="border-top:1px solid ${dk()?'#334155':'#f4f5f8'}">${cols.map(col=>_cell(d,col.id,p,c)).join('')}</tr>`).join('');
  return`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

function _cell(d,id,p,c){
  switch(id){
    case'pos':return`<td style="padding:8px 12px;font-weight:700;color:${c.t3}">${d.pos||''}</td>`;
    case'matricula':return`<td style="padding:8px 12px"><span style="background:#1a2235;color:#fff;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;cursor:pointer;display:inline-block;box-shadow:0 2px 6px rgba(26,34,53,.15)" onclick="window._cdDet('${d.id}')">${safeHtml(d.matricula||'—')}</span>${d.remolque?`<br><span style="background:${c.bg2};color:${c.t3};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:2px">${safeHtml(d.remolque)}</span>`:''}</td>`;
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
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdPrint('${d.id}')" title="Imprimir">🖨</button>
      <button style="font-size:11px;background:${c.purple};color:#fff;border:none;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdCut('${d.id}')" title="Troquelado">✂</button>
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdTrack('${d.id}')" title="Tracking">📡</button>
      ${p.canEdit?`<button style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdEdit('${d.id}')" title="Editar">✏️</button>`:''}
      ${d.estado==='EN_RECINTO'&&p.canEdit?`<button style="font-size:11px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdSal('${d.id}')" title="Salida">↩</button>`:''}
      ${d.estado==='SALIDA'&&p.canEdit?`<button style="font-size:11px;background:#ecfdf5;color:${c.green};border:1px solid #a7f3d0;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdReact('${d.id}')" title="Reactivar">↺</button>`:''}
      ${p.canDel?`<button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdDel('${d.id}')" title="Eliminar">🗑</button>`:''}
    </div></td>`;
    default:return'<td>–</td>';
  }
}

function _tel(tp,t){if(!t)return'<span style="opacity:.3">–</span>';const f=(tp||'')+String(t).replace(/\s/g,''),w=f.replace('+','').replace(/\D/g,'');return`<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:${f}" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">📞</a><a href="https://wa.me/${w}" target="_blank" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#25D366;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">💬</a><span style="font-size:11px;font-family:monospace;color:#6b7a90">${t}</span></div>`;}

// ═══ ESPECIAL ═══
function rEsp(){
  const c=C(),pC={alta:'#ef4444',media:'#f59e0b',baja:'#22c55e'},pL={alta:'🔴 Alta',media:'🟡 Media',baja:'🟢 Baja'};
  const it=_especiales.filter(m=>m.activo!==false).sort((a,b)=>(b.ts||0)-(a.ts||0));
  return`<div style="padding:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div><div style="font-size:14px;font-weight:700">Vehículos especiales / alertas</div><div style="font-size:11px;color:${c.t3}">Pre-alertas activas para operadores de rampa</div></div><button style="padding:8px 14px;background:${c.blue};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer" onclick="window._cdNewAl()">+ Nueva alerta</button></div>${!it.length?'<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">🔔</div><div style="font-weight:600;margin-top:6px">Sin alertas activas</div></div>':it.map(m=>`<div style="background:${c.card};border:1px solid ${c.border};border-left:3px solid ${pC[m.prioridad]||pC.media};border-radius:12px;padding:12px 14px;margin-bottom:8px"><div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1"><div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap">${m.matricula?`<span style="background:#1a2235;color:#fff;font-family:monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px">${m.matricula}</span>`:''} ${m.referencia?`<span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid ${c.border}">${m.referencia}</span>`:''}<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:${pC[m.prioridad]||pC.media}22;color:${pC[m.prioridad]||pC.media}">${pL[m.prioridad]||pL.media}</span></div><div style="font-size:13px;font-weight:500;line-height:1.5;margin-bottom:4px">${safeHtml(m.mensaje||'')}</div><div style="font-size:11px;color:${c.t3}">Por: <b>${safeHtml(m.autor||'')}</b> · ${formatDate(m.ts)}</div></div><div style="display:flex;gap:4px"><button style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdEditAl('${m.id}')">✏️</button><button style="font-size:12px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window._cdDelAl('${m.id}')">🗑</button></div></div></div>`).join('')}</div>`;
}

// ═══ HISTORIAL ═══
function rHist(){
  const c=C(),aI={new:'➕',edit:'✏️',salida:'↩',reactivar:'↺'},aC={new:c.purple,edit:c.blue,salida:c.amber,reactivar:c.green};
  const it=[..._historial].sort((a,b)=>(b.ts||0)-(a.ts||0));
  const byD={};it.forEach(e=>{const d=formatDate(e.ts,{weekday:'long',day:'2-digit',month:'long'});if(!byD[d])byD[d]=[];byD[d].push(e);});
  return`<div style="padding:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div><div style="font-size:14px;font-weight:700">Historial de modificaciones</div><div style="font-size:11px;color:${c.t3}">Últimos cambios en ${TITLE}</div></div></div>${!it.length?'<div style="text-align:center;padding:40px;color:#94a3b8"><div style="font-size:36px">📋</div><div style="font-weight:600;margin-top:6px">Sin modificaciones</div></div>':`<div style="position:relative"><div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:${c.border}"></div>${Object.entries(byD).map(([day,evts])=>`<div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.t3};margin-bottom:8px;padding-left:38px">${day}</div>${evts.map(e=>`<div style="display:flex;gap:10px;margin-bottom:7px"><div style="width:18px;height:18px;border-radius:50%;background:${aC[e.action]||c.t3};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:3px;box-shadow:0 0 0 3px ${c.bg};z-index:1">${aI[e.action]||'•'}</div><div style="flex:1;background:${c.card};border:1px solid ${c.border};border-radius:10px;padding:8px 12px"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px"><span style="background:${c.bg2};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px">${safeHtml(e.mat||'')}</span><span style="font-size:10px;font-weight:700;color:${aC[e.action]||c.t3}">${(e.action||'').toUpperCase()}</span></div>${e.detail?`<div style="font-size:12px;line-height:1.5;margin-bottom:3px">${safeHtml(e.detail)}</div>`:''}<div style="font-size:10px;color:${c.t3}">${safeHtml(e.user||'')} · ${formatDate(e.ts,{hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div>`).join('')}</div>`}</div>`;
}

// ═══ COL PANEL ═══
function openCP(){const p=_c.querySelector('#_cp');if(p)p.style.right='0';_rCP();}
function closeCP(){const p=_c.querySelector('#_cp');if(p)p.style.right='-300px';}
function _rCP(){const p=_c.querySelector('#_cp');if(p)p.innerHTML=renderColPanelHTML(MOD,ALL_COLS,C());}

// ═══ MODAL INGRESO — uses getVisibleFormFields ═══
function openModal(editId=null){
  const c=C(),old=document.getElementById('_im');if(old)old.remove();
  const r=editId?_data.find(d=>d.id===editId):{};
  const fields=getVisibleFormFields(MOD);

  // Group by section
  const sections={};
  fields.forEach(f=>{if(!sections[f.section])sections[f.section]={icon:f.sectionIcon,label:f.sectionLabel,fields:[]};sections[f.section].fields.push(f);});

  const m=document.createElement('div');m.id='_im';
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';

  let formHTML='';
  Object.entries(sections).forEach(([secKey,sec])=>{
    formHTML+=`<div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">${sec.icon} ${sec.label}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">`;
    sec.fields.forEach(f=>{
      const val=safeHtml(r[f.id]||'');
      const inputStyle=`width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none`;
      let inp='';
      if(f.type==='select'&&f.options){
        inp=`<select data-f="${f.id}" style="${inputStyle}">${f.options.map(o=>`<option value="${o.split(' ')[0]}"${val===o.split(' ')[0]?' selected':''}>${o||'— Seleccionar —'}</option>`).join('')}</select>`;
      }else if(f.type==='textarea'){
        inp=`<textarea data-f="${f.id}" style="${inputStyle};min-height:60px;resize:vertical">${val}</textarea>`;
      }else{
        const extra=f.id==='matricula'?' oninput="this.value=this.value.toUpperCase()"':'';
        inp=`<input data-f="${f.id}" type="${f.type||'text'}" value="${val}" placeholder="${f.label}" style="${inputStyle}"${extra}>`;
      }
      formHTML+=`<div${f.type==='textarea'?' style="grid-column:span 2"':''}><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">${f.label}${f.required?' *':''}</label>${inp}</div>`;
    });
    formHTML+='</div></div>';
  });

  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:660px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}"><div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nueva Entrada'}</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_im').remove()">✕ Cerrar</button></div>
    <div style="padding:16px 22px">${formHTML}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}">
      <button style="padding:9px 18px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer;font-family:inherit" onclick="this.closest('#_im').remove()">Cancelar</button>
      <button id="_sv" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${editId?'Guardar':'Crear Conductor'}</button>
    </div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sv').onclick=async()=>{
    const fd={recinto:_u.recinto||'',modificado:nowLocal(),modificadoPor:_u.uid};
    m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    if(!fd.matricula){toast('Matrícula requerida','#ef4444');return;}
    fd.matricula=normPlate(fd.matricula);
    try{
      if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${editId}`,fd);_log('edit',fd.matricula,'Edición');}
      else{fd.fecha=nowLocal();fd.estado='EN_RECINTO';fd.creadoPor=_u.uid;const{fsAdd}=await import('./firestore.js');await fsAdd(COLL,fd);_log('new',fd.matricula,'Nuevo ingreso');}
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
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:500px;color:${c.text};overflow:hidden">
    <div style="padding:18px 22px 12px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between"><div style="font-size:18px;font-weight:700">${eid?'✏️ Editar alerta':'+ Nueva alerta'}</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_am').remove()">✕</button></div>
    <div style="padding:16px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Matrícula</label><input data-a="matricula" value="${safeHtml(r.matricula||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Ref</label><input data-a="referencia" value="${safeHtml(r.referencia||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none" oninput="this.value=this.value.toUpperCase()"></div>
      </div>
      <div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.t3}">Mensaje *</label><input data-a="mensaje" value="${safeHtml(r.mensaje||'')}" placeholder="Descripción..." style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Autor</label><input data-a="autor" value="${safeHtml(r.autor||'')}" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"></div>
        <div><label style="font-size:11px;font-weight:600;color:${c.t3}">Prioridad</label><select data-a="prioridad" style="width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none"><option value="alta"${r.prioridad==='alta'?' selected':''}>🔴 Alta</option><option value="media"${!r.prioridad||r.prioridad==='media'?' selected':''}>🟡 Media</option><option value="baja"${r.prioridad==='baja'?' selected':''}>🟢 Baja</option></select></div>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}"><button style="padding:8px 16px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_am').remove()">Cancelar</button><button id="_sva" style="padding:8px 18px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Guardar</button></div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sva').onclick=async()=>{
    const fd={ts:Date.now(),activo:true};m.querySelectorAll('[data-a]').forEach(el=>{fd[el.dataset.a]=el.value||'';});
    if(!fd.mensaje){toast('Mensaje requerido','#ef4444');return;}
    try{if(eid){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}_especiales/${eid}`,fd);}else{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLL}_especiales`,fd);}toast('Alerta guardada ✓','#10b981');m.remove();}catch(e){toast(_s('error'),'#ef4444');}
  };
  document.body.appendChild(m);
}

// ═══ ACTIONS ═══
async function _log(action,mat,detail){try{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLL}_historial`,{ts:Date.now(),user:_u.nombre||_u.uid,action,mat,detail,collection:MOD});}catch(e){}}
async function _sal(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${id}`,{estado:'SALIDA',salida:nowLocal(),modificado:nowLocal(),modificadoPor:_u.uid});_log('salida',d.matricula,'En recinto → Salida');toast('↩ Salida','#d97706');}catch(e){toast(_s('error'),'#ef4444');}}
async function _react(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${id}`,{estado:'EN_RECINTO',salida:null,modificado:nowLocal(),modificadoPor:_u.uid});_log('reactivar',d.matricula,'Salida → En recinto');toast('↺ Reactivado','#0d9f6e');}catch(e){toast(_s('error'),'#ef4444');}}
async function _del(id){if(!confirm(_s('confirm')+'?'))return;const d=_data.find(x=>x.id===id);try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLL}/${id}`);if(d)_log('edit',d.matricula,'Eliminado');toast(_s('delete')+' ✓','#f59e0b');}catch(e){toast(_s('error'),'#ef4444');}}
async function exportXLS(){try{toast(_s('loading'),'#2c5ee8');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const ws=X.utils.json_to_sheet(_filtered.map(d=>({Matrícula:d.matricula,Remolque:d.remolque,Llamador:d.llamador,Conductor:d.nombre,Empresa:d.empresa,Tel:d.telefono,Hall:d.hall,Stand:d.stand,Estado:ST[d.estado]||d.estado,Entrada:d.fecha,Ref:d.referencia})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,TITLE);X.writeFile(wb,`${TITLE}_${new Date().toISOString().slice(0,10)}.xlsx`);toast('Exportado ✓','#10b981');}catch(e){toast(_s('error'),'#ef4444');}}

// ═══ WINDOW BINDINGS ═══
window._cdSort=(col)=>{if(_sortCol===col)_sortDir=_sortDir==='asc'?'desc':'asc';else{_sortCol=col;_sortDir='asc';}applyF();rc();};
window._cdDet=(id)=>openModal(id);
window._cdEdit=(id)=>openModal(id);
window._cdDel=(id)=>_del(id);
window._cdSal=(id)=>_sal(id);
window._cdReact=(id)=>_react(id);
window._cdPrint=(id)=>toast('🖨 Impresión (módulo impresión)','#2c5ee8');
window._cdCut=(id)=>toast('✂ Troquelado (próximamente)','#7c3aed');
window._cdTrack=(id)=>toast('📡 Tracking (próximamente)','#2c5ee8');
window._cdNewAl=()=>openAlM();
window._cdEditAl=(id)=>openAlM(id);
window._cdDelAl=async(id)=>{try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLL}_especiales/${id}`);toast('Eliminada','#f59e0b');}catch(e){toast(_s('error'),'#ef4444');}};
