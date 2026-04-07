// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — ingresos2.js — Módulo INGRESOS
// Colección: ingresos2 | Tipos: A (furgoneta), B (camión 4 ejes)
// Cross-read: conductores (AutoFill). NO lee agenda.
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, uid, toast, nowLocal, formatDate, debounce, normPlate } from './utils.js';
import { initFields, getVisibleFormFields, initCols, getVisCols, renderCamposHTML, renderColPanelHTML, autoFillByPlate, nextPos, importExcel as feImport } from './field-engine.js';
import { scannerButtonHTML, scannerConfigHTML } from './scanner.js';

const MOD='agenda',COLL='agenda',TITLE='Agenda',ICON='📅',REQ_FIELD='titulo';
const HAS_ESPECIAL=true; // Ingresos SÍ tiene subtab Especial
const FIELD_DEFS={
  reserva:{icon:'📅',label:'Reserva',fields:[
    {id:'titulo',label:'Título',req:1,desc:'Título de la reserva',type:'text'},
    {id:'fecha',label:'Fecha',req:1,desc:'Fecha reservada',type:'date'},
    {id:'hora',label:'Hora',desc:'Hora inicio',type:'time'},
    {id:'horaFin',label:'Hora fin',desc:'Hora finalización',type:'time'},
    {id:'tipo',label:'Tipo',desc:'Tipo reserva',type:'select',options:['','Montaje','Desmontaje','Entrega','Recogida','Visita']},
    {id:'servicio',label:'Servicio',desc:'Forklift/Manual',type:'select',options:['','Forklift','Manual','Forklift + operario','Grúa','Manual 2 operarios']},
    {id:'referencia',label:'Referencia',desc:'Nº referencia (€1000)',type:'text'},
    {id:'estado',label:'Estado',desc:'Estado actual',type:'select',options:['PENDIENTE','CONFIRMADO','COMPLETADO','CANCELADO']},
  ]},
  contacto:{icon:'👤',label:'Contacto',fields:[
    {id:'nombre',label:'Nombre',desc:'Persona contacto',type:'text'},
    {id:'empresa',label:'Empresa',desc:'Empresa solicitante',type:'text'},
    {id:'telefono',label:'Teléfono',desc:'Tel. contacto',type:'tel'},
    {id:'email',label:'Email',desc:'Correo',type:'text'},
  ]},
  ubicacion:{icon:'📍',label:'Ubicación',fields:[
    {id:'hall',label:'Hall',desc:'Hall destino',type:'text'},
    {id:'stand',label:'Stand',desc:'Stand',type:'text'},
    {id:'matricula',label:'Matrícula',desc:'Vehículo asociado',type:'text'},
    {id:'obs',label:'Notas',desc:'Observaciones',type:'text'},
  ]},
};
const ALL_COLS=[{id:'pos',label:'#',req:1},{id:'titulo',label:'Título',req:1},{id:'fecha',label:'Fecha'},{id:'hora',label:'Hora'},{id:'tipo',label:'Tipo'},{id:'servicio',label:'Servicio'},{id:'referencia',label:'Ref.'},{id:'estado',label:'Estado'},{id:'nombre',label:'Contacto'},{id:'empresa',label:'Empresa'},{id:'hall',label:'Hall'},{id:'matricula',label:'Matrícula'},{id:'acciones',label:'Acc.',req:1}];
  {id:'pos',label:'#',req:1},{id:'matricula',label:'Matrícula',req:1},
  {id:'remolque',label:'Remolque'},{id:'tipoVehiculo',label:'Tipo'},
  {id:'llamador',label:'Llamador'},{id:'conductor',label:'Conductor'},
  {id:'empresa',label:'Empresa'},{id:'telefono',label:'Tel.'},
  {id:'hall',label:'Hall'},{id:'stand',label:'Stand'},
  {id:'estado',label:'Estado'},{id:'entrada',label:'Entrada'},
  {id:'acciones',label:'Acc.',req:1},
];
const ST={PENDIENTE:'Pendiente',CONFIRMADO:'Confirmado',COMPLETADO:'Completado',CANCELADO:'Cancelado'};
const ST_BG={PENDIENTE:'#fef9c3;color:#a16207',CONFIRMADO:'#dbeafe;color:#1d4ed8',COMPLETADO:'#dcfce7;color:#15803d',CANCELADO:'#f1f5f9;color:#64748b'};
function stP(s){return`<span style="display:inline-flex;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600;background:${ST_BG[s]||'#f8fafc;color:#94a3b8'}">${ST[s]||s||'—'}</span>`;}
function _tel(tp,t){if(!t)return'<span style="opacity:.3">–</span>';const f=(tp||'')+String(t).replace(/\s/g,''),w=f.replace('+','').replace(/\D/g,'');return`<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:${f}" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">📞</a><a href="https://wa.me/${w}" target="_blank" style="width:22px;height:22px;border-radius:6px;background:#dcfce7;color:#25D366;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:11px">💬</a><span style="font-size:11px;font-family:monospace;color:#6b7a90">${t}</span></div>`;}

let _c,_u,_data=[],_filtered=[],_unsub,_especiales=[],_historial=[];
let _sub='lista',_q='',_hallF='',_activos=false,_dateFrom='',_dateTo='',_statusF='';
let _sortCol='pos',_sortDir='desc',_autoFill=true,_posAuto=true;
const PFX='_ag'; // prefix para window bindings único
function dk(){return _u?.tema==='dark';}
const C=()=>{const d=dk();return{bg:d?'#0f172a':'#f4f5f7',card:d?'#1e293b':'#fff',bg2:d?'#0f172a':'#f8f9fc',border:d?'#334155':'#e4e7ec',text:d?'#e2e8f0':'#1a2235',t3:d?'#94a3b8':'#6b7a90',blue:'#2c5ee8',bll:d?'rgba(44,94,232,.1)':'#eef2ff',green:'#0d9f6e',red:'#dc2626',amber:'#d97706',purple:'#7c3aed'};};

export function render(ct,us){
  _c=ct;_u=us;_data=[];_filtered=[];_sub='lista';
  initFields(MOD,FIELD_DEFS);initCols(MOD,ALL_COLS);
  window._fe_refresh=m=>{if(m===MOD){applyF();rc();}};window._fe_refreshcp=m=>{if(m===MOD)rCP();};window._fe_allcols=m=>m===MOD?ALL_COLS:[];window._fe_onclosecp=m=>{if(m===MOD)closeCP();};
  paint();lD();lE();lH();
  return()=>{if(_unsub)_unsub();};
}

// ═══ DATA ═══
async function lD(){try{const{fsListen}=await import('./firestore.js');if(_unsub)_unsub();_unsub=await fsListen(COLL,docs=>{const r=_u.recinto||'';_data=r?docs.filter(d=>d.recinto===r):docs;applyF();rc();});}catch(e){}}
async function lE(){if(!HAS_ESPECIAL)return;try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLL}_especiales`,d=>{_especiales=d;if(_sub==='listanegra')rc();});}catch(e){}}
async function lH(){try{const{fsListen}=await import('./firestore.js');await fsListen(`${COLL}_historial`,d=>{_historial=d;if(_sub==='historial')rc();});}catch(e){}}
function _halls(){const s=new Set();_data.forEach(d=>{if(d.hall)s.add(d.hall);});return[...s].sort();}
function applyF(){let it=[..._data];if(_hallF)it=it.filter(d=>d.hall===_hallF);if(_activos)it=it.filter(d=>d.estado==='EN_RECINTO');if(_statusF)it=it.filter(d=>d.estado===_statusF);if(_dateFrom)it=it.filter(d=>(d.fecha||'')>=_dateFrom);if(_dateTo)it=it.filter(d=>(d.fecha||'').slice(0,10)<=_dateTo);if(_q){const q=_q.toLowerCase();it=it.filter(d=>`${d.matricula||''} ${d.nombre||''} ${d.apellido||''} ${d.empresa||''} ${d.llamador||''} ${d.hall||''} ${d.stand||''} ${d.telefono||''}`.toLowerCase().includes(q));}it.sort((a,b)=>{const r=String(a[_sortCol]??'').localeCompare(String(b[_sortCol]??''),undefined,{numeric:true});return _sortDir==='asc'?r:-r;});_filtered=it;}

// ═══ PAINT ═══
function paint(){
  const c=C(),p=_u.permisos||{},halls=_halls();applyF();
  const subTabs=[['lista','📋 Lista'],...(HAS_ESPECIAL?[['listanegra','⭐ Especial']]:[]),['historial','📝 Modif.'],...(p.canCampos?[['campos','⚙ Campos']]:[])];
  _c.innerHTML=`<div style="max-width:1400px;margin:0 auto;display:flex;flex-direction:column;height:100%">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;flex-shrink:0">
    <div style="font-size:22px;font-weight:700;color:${c.text}">${TITLE}</div>
    <span style="font-size:11px;color:${c.t3}">${new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
    <span style="flex:1"></span>
    ${p.canAdd?`<button id="_add" style="padding:8px 18px;background:${c.green};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer">+ Nueva reserva</button>`:''}
  </div>
  <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:${c.card};border:1px solid ${c.border};border-radius:12px">
    <div style="display:flex;align-items:center;gap:3px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;flex-wrap:wrap;scrollbar-width:none">
      ${subTabs.map(([s,l])=>`<button class="_st" data-s="${s}" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:${_sub===s?'600':'500'};background:${_sub===s?c.bll:'transparent'};color:${_sub===s?c.blue:c.t3};cursor:pointer;border:${_sub===s?'1px solid '+c.blue:'1px solid transparent'};white-space:nowrap">${l}</button>`).join('')}
      <span style="flex:1"></span>
      <div style="display:flex;gap:3px;flex-shrink:0;align-items:center;flex-wrap:wrap">
        <button class="_tgl" data-a="af" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_autoFill?c.blue:c.border};background:${_autoFill?c.blue:c.bg2};color:${_autoFill?'#fff':c.t3}">⚡ AutoFill</button>
        <button class="_tgl" data-a="pos" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_posAuto?c.blue:c.border};background:${_posAuto?c.blue:c.bg2};color:${_posAuto?'#fff':c.t3}">🔢 Pos</button>
        <label style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" title="Importar Excel">📥<input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="window.${PFX}Imp(this)"></label>
        <button class="_ab" data-a="clip" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer">📋</button>
        <button class="_ab" data-a="xls" style="padding:4px 8px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer">⬇</button>
        ${p.canClean?`<button class="_ab" data-a="clean" style="padding:4px 8px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:8px;font-size:12px;cursor:pointer">🗑</button>`:''}
        ${p.canDel?`<button class="_ab" data-a="nuke" style="padding:4px 8px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:8px;font-size:12px;cursor:pointer">💥</button>`:''}
        <button class="_ab" data-a="cols" style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:20px;font-size:11px;cursor:pointer;font-weight:600">⚙ Cols</button>
        ${scannerConfigHTML()}
      </div>
    </div>
    ${_sub!=='historial'&&_sub!=='campos'?`
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid ${c.border};overflow-x:auto;flex-shrink:0;scrollbar-width:none">
      <div style="max-width:240px;min-width:120px;display:flex;align-items:center;background:${c.bg2};border:1px solid ${c.border};border-radius:20px;padding:4px 10px;gap:6px"><span style="font-size:13px;opacity:.5">🔍</span><input id="_q" type="search" placeholder="Buscar..." value="${safeHtml(_q)}" style="border:none;background:transparent;flex:1;font-size:12px;outline:none;color:${c.text};font-family:inherit;max-width:180px"></div>
      <input id="_df" type="date" value="${_dateFrom}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;color:${c.t3}" title="Desde">
      <input id="_dt" type="date" value="${_dateTo}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;height:30px;color:${c.t3}" title="Hasta">
      <select id="_sf" style="border:1px solid ${c.border};border-radius:20px;padding:4px 10px;font-size:11px;background:${c.bg2};outline:none;height:30px;color:${c.t3}"><option value="">Todos</option>${Object.entries(ST).map(([k,v])=>`<option value="${k}"${_statusF===k?' selected':''}>${v}</option>`).join('')}</select>
      <span id="_act" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1.5px solid ${_activos?c.blue:c.border};background:${_activos?c.blue:c.card};color:${_activos?'#fff':c.t3}">Solo activos</span>
      ${_q||_hallF||_activos||_dateFrom||_dateTo||_statusF?`<span id="_clr" style="padding:4px 8px;border-radius:20px;font-size:11px;cursor:pointer;background:#fef2f2;color:${c.red};border:1px solid #fecaca">✕</span>`:''}
      <span style="font-size:10px;color:${c.t3}">${_filtered.length} reg.</span>
    </div>
    ${halls.length?`<div style="display:flex;gap:4px;padding:6px 12px;border-bottom:1px solid ${c.border};flex-wrap:wrap;flex-shrink:0"><span class="_hp" data-h="" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${!_hallF?'700':'500'};cursor:pointer;background:${!_hallF?c.bll:c.bg2};color:${!_hallF?c.blue:c.t3};border:1px solid ${!_hallF?c.blue:c.border}">Todos</span>${halls.map(h=>`<span class="_hp" data-h="${h}" style="padding:3px 11px;border-radius:20px;font-size:10px;font-weight:${_hallF===h?'700':'500'};cursor:pointer;background:${_hallF===h?c.blue:c.bg2};color:${_hallF===h?'#fff':c.t3};border:1px solid ${_hallF===h?c.blue:c.border}">${h}</span>`).join('')}</div>`:''}`:''}
    <div id="_body" style="flex:1;overflow:auto"></div>
  </div></div>
  <div id="_cp" style="position:fixed;top:0;right:-300px;width:280px;height:100vh;background:${c.card};border-left:1px solid ${c.border};z-index:500;display:flex;flex-direction:column;transition:right .25s"></div>`;
  bindEvts();rc();
}

function bindEvts(){
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
    if(b.dataset.a==='af')b.onclick=()=>{_autoFill=!_autoFill;paint();toast(_autoFill?'⚡ AutoFill ON':'AutoFill OFF');};
    if(b.dataset.a==='pos')b.onclick=()=>{_posAuto=!_posAuto;paint();toast(_posAuto?'🔢 Pos auto ON':'Pos auto OFF');};
  });
  _c.querySelectorAll('._ab').forEach(b=>{
    if(b.dataset.a==='xls')b.onclick=()=>xls();
    if(b.dataset.a==='cols')b.onclick=()=>openCP();
    if(b.dataset.a==='clip')b.onclick=()=>{try{navigator.clipboard.writeText(_filtered.map(d=>`${d.pos||''}\t${d.matricula}\t${d.nombre||''}\t${d.empresa||''}\t${d.hall||''}\t${ST[d.estado]||''}\t${d.fecha||''}`).join('\n'));toast('📋 Copiado',c.green);}catch(e){}};
    if(b.dataset.a==='clean')b.onclick=async()=>{if(!confirm('¿Limpiar salidas?'))return;const{fsDel}=await import('./firestore.js');const s=_data.filter(d=>d.estado==='SALIDA');for(const d of s)await fsDel(`${COLL}/${d.id}`);toast(`🗑 ${s.length} limpiados`,c.amber);};
    if(b.dataset.a==='nuke')b.onclick=async()=>{if(!confirm('⚠️ ¿BORRAR TODO?'))return;if(!confirm('¿Seguro?'))return;const{fsDel}=await import('./firestore.js');for(const d of _data)await fsDel(`${COLL}/${d.id}`);toast('💥 Borrado',c.red);};
  });
}

function rc(){const b=_c.querySelector('#_body');if(!b)return;if(_sub==='lista')b.innerHTML=rLista();else if(_sub==='listanegra')b.innerHTML=rEsp();else if(_sub==='historial')b.innerHTML=rHist();else if(_sub==='campos')b.innerHTML=renderCamposHTML(MOD,C());}

// ═══ LISTA ═══
function rLista(){
  if(!_filtered.length)return`<div style="text-align:center;padding:48px;color:#94a3b8"><div style="font-size:36px">${ICON}</div><div style="font-weight:600;margin-top:6px">Sin registros</div></div>`;
  const c=C(),p=_u.permisos||{},vis=getVisCols(MOD),cols=ALL_COLS.filter(x=>vis.includes(x.id));
  const th=cols.map(col=>{const sd=_sortCol===col.id?(_sortDir==='asc'?' ▲':' ▼'):'';return`<th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${c.t3};border-bottom:1px solid ${c.border};white-space:nowrap;cursor:pointer;background:${c.bg2}" onclick="window.${PFX}Sort('${col.id}')">${col.label}${sd}</th>`;}).join('');
  const tb=_filtered.map(d=>`<tr style="border-top:1px solid ${dk()?'#334155':'#f4f5f8'}">${cols.map(col=>cell(d,col.id,p,c)).join('')}</tr>`).join('');
  return`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

function cell(d,id,p,c){
  switch(id){
    case'pos':return`<td style="padding:8px 12px;font-weight:700;color:${c.t3}">${d.pos||''}</td>`;
    case'matricula':return`<td style="padding:8px 12px"><span style="background:#1a2235;color:#fff;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;cursor:pointer;display:inline-block" onclick="window.${PFX}Edit('${d.id}')">${safeHtml(d.matricula||'—')}</span>${d.remolque?`<br><span style="background:${c.bg2};color:${c.t3};font-family:monospace;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:2px">${safeHtml(d.remolque)}</span>`:''}</td>`;
    case'remolque':return`<td style="padding:8px 12px;font-size:11px;color:${c.t3}">${safeHtml(d.remolque||'–')}</td>`;
    case'tipoVehiculo':return`<td style="padding:8px 12px;font-size:11px">${safeHtml(d.tipoVehiculo||'–')}</td>`;
    case'llamador':return`<td style="padding:8px 12px;font-size:11px">${safeHtml(d.llamador||'–')}</td>`;
    case'conductor':return`<td style="padding:8px 12px">${d.nombre?`<b style="font-size:12px">${safeHtml(d.nombre)} ${safeHtml(d.apellido||'')}</b>`:''}${d.empresa?`<br><span style="font-size:11px;color:${c.t3}">${safeHtml(d.empresa)}</span>`:''}${!d.nombre&&!d.empresa?'–':''}</td>`;
    case'empresa':return`<td style="padding:8px 12px;font-size:11px;color:${c.t3}">${safeHtml(d.empresa||'–')}</td>`;
    case'telefono':return`<td style="padding:8px 12px">${_tel(d.telPais||'+34',d.telefono)}</td>`;
    case'hall':return`<td style="padding:8px 12px"><span style="background:${c.bll};color:${c.blue};font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;border:1px solid #c7d7f8">${safeHtml(d.hall||'–')}</span></td>`;
    case'stand':return`<td style="padding:8px 12px;font-size:11px">${safeHtml(d.stand||'–')}</td>`;
    case'estado':return`<td style="padding:8px 12px">${stP(d.estado)}</td>`;
    case'entrada':return`<td style="padding:8px 12px;font-size:11px;white-space:nowrap">${formatDate(d.fecha)}</td>`;
    case'acciones':return`<td style="padding:8px 12px"><div style="display:flex;gap:3px;flex-wrap:wrap">
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Print('${d.id}')">🖨</button>
      <button style="font-size:11px;background:${c.purple};color:#fff;border:none;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Cut('${d.id}')">✂</button>
      <button style="font-size:11px;background:none;border:1px solid ${c.border};border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Track('${d.id}')">📡</button>
      ${p.canEdit?`<button style="font-size:11px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Edit('${d.id}')">✏️</button>`:''}
      ${d.estado==='EN_RECINTO'&&p.canEdit?`<button style="font-size:11px;background:#fffbeb;color:${c.amber};border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Sal('${d.id}')">↩</button>`:''}
      ${d.estado==='SALIDA'&&p.canEdit?`<button style="font-size:11px;background:#ecfdf5;color:${c.green};border:1px solid #a7f3d0;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}React('${d.id}')">↺</button>`:''}
      ${p.canDel?`<button style="font-size:11px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}Del('${d.id}')">🗑</button>`:''}
    </div></td>`;
    default:return'<td>–</td>';
  }
}

// ═══ ESPECIAL ═══
function rEsp(){
  const c=C(),pC={alta:'#ef4444',media:'#f59e0b',baja:'#22c55e'},pL={alta:'🔴 Alta',media:'🟡 Media',baja:'🟢 Baja'};
  const it=_especiales.filter(m=>m.activo!==false).sort((a,b)=>(b.ts||0)-(a.ts||0));
  return`<div style="padding:14px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div><div style="font-size:14px;font-weight:700">Alertas especiales — ${TITLE}</div><div style="font-size:11px;color:${c.t3}">Pre-alertas para operadores de rampa</div></div><button style="padding:8px 14px;background:${c.blue};color:#fff;border:none;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer" onclick="window.${PFX}NewAl()">+ Nueva alerta</button></div>${!it.length?`<div style="text-align:center;padding:40px;color:#94a3b8">🔔 Sin alertas</div>`:it.map(m=>`<div style="background:${c.card};border:1px solid ${c.border};border-left:3px solid ${pC[m.prioridad]||pC.media};border-radius:12px;padding:12px 14px;margin-bottom:8px"><div style="display:flex;gap:10px"><div style="flex:1"><div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap">${m.matricula?`<span style="background:#1a2235;color:#fff;font-family:monospace;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px">${m.matricula}</span>`:''}<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:${pC[m.prioridad]}22;color:${pC[m.prioridad]}">${pL[m.prioridad]}</span></div><div style="font-size:13px;margin-top:3px">${safeHtml(m.mensaje||'')}</div><div style="font-size:10px;color:${c.t3};margin-top:3px">${safeHtml(m.autor||'')} · ${formatDate(m.ts)}</div></div><div style="display:flex;gap:4px"><button style="font-size:12px;background:#fef3c7;color:#92400e;border:1px solid #fde68a;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}EditAl('${m.id}')">✏️</button><button style="font-size:12px;background:#fef2f2;color:${c.red};border:1px solid #fecaca;border-radius:6px;padding:3px 7px;cursor:pointer" onclick="window.${PFX}DelAl('${m.id}')">🗑</button></div></div></div>`).join('')}</div>`;
}

// ═══ HISTORIAL ═══
function rHist(){
  const c=C(),aI={new:'➕',edit:'✏️',salida:'↩',reactivar:'↺'},aC={new:c.purple,edit:c.blue,salida:c.amber,reactivar:c.green};
  const it=[..._historial].sort((a,b)=>(b.ts||0)-(a.ts||0));
  const byD={};it.forEach(e=>{const d=formatDate(e.ts,{weekday:'long',day:'2-digit',month:'long'});if(!byD[d])byD[d]=[];byD[d].push(e);});
  return`<div style="padding:14px"><div style="font-size:14px;font-weight:700;margin-bottom:12px">Historial — ${TITLE}</div>${!it.length?'<div style="text-align:center;padding:40px;color:#94a3b8">📋 Sin modificaciones</div>':`<div style="position:relative"><div style="position:absolute;left:20px;top:0;bottom:0;width:2px;background:${c.border}"></div>${Object.entries(byD).map(([day,evts])=>`<div style="margin-bottom:18px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.t3};margin-bottom:8px;padding-left:38px">${day}</div>${evts.map(e=>`<div style="display:flex;gap:10px;margin-bottom:7px"><div style="width:18px;height:18px;border-radius:50%;background:${aC[e.action]||c.t3};display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:3px;box-shadow:0 0 0 3px ${c.bg};z-index:1">${aI[e.action]||'•'}</div><div style="flex:1;background:${c.card};border:1px solid ${c.border};border-radius:10px;padding:8px 12px"><span style="font-family:monospace;font-size:10px;background:${c.bg2};padding:2px 6px;border-radius:4px">${safeHtml(e.mat||'')}</span> <span style="font-size:10px;font-weight:700;color:${aC[e.action]||c.t3}">${(e.action||'').toUpperCase()}</span>${e.detail?`<div style="font-size:12px;margin-top:3px">${safeHtml(e.detail)}</div>`:''}<div style="font-size:10px;color:${c.t3};margin-top:2px">${safeHtml(e.user||'')} · ${formatDate(e.ts,{hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('')}</div>`).join('')}</div>`}</div>`;
}

// ═══ COL PANEL ═══
function openCP(){const p=_c.querySelector('#_cp');if(p)p.style.right='0';rCP();}
function closeCP(){const p=_c.querySelector('#_cp');if(p)p.style.right='-300px';}
function rCP(){const p=_c.querySelector('#_cp');if(p)p.innerHTML=renderColPanelHTML(MOD,ALL_COLS,C());}

// ═══ MODAL NUEVO/EDITAR — con scanner + AutoFill ═══
function openModal(editId=null){
  const c=C(),old=document.getElementById('_m'+MOD);if(old)old.remove();
  const r=editId?_data.find(d=>d.id===editId):{};
  const fields=getVisibleFormFields(MOD);
  const sections={};fields.forEach(f=>{if(!sections[f.section])sections[f.section]={icon:f.sectionIcon,label:f.sectionLabel,fields:[]};sections[f.section].fields.push(f);});
  const m=document.createElement('div');m.id='_m'+MOD;
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';
  let fh='';
  Object.entries(sections).forEach(([sk,sec])=>{
    fh+=`<div style="margin-bottom:12px;padding:14px;border-radius:12px;background:${c.bg2};border:1px solid ${c.border}"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};margin-bottom:12px">${sec.icon} ${sec.label}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">`;
    sec.fields.forEach(f=>{
      const v=safeHtml(r[f.id]||'');
      const is=`width:100%;padding:8px 11px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};font-family:inherit;outline:none`;
      let inp;
      if(f.type==='select'&&f.options){
        inp=`<select id="_f_${f.id}" data-f="${f.id}" style="${is}">${f.options.map(o=>{const ov=typeof o==='string'?o.split(' ')[0]:o;return`<option value="${ov}"${v===ov?' selected':''}>${o||'— Seleccionar —'}</option>`;}).join('')}</select>`;
      } else {
        const extra=f.id==='matricula'?` oninput="this.value=this.value.toUpperCase();window.${PFX}AF(this.value)"`:f.type==='date'?` value="${v||new Date().toISOString().slice(0,10)}"`:f.type==='time'?` value="${v||new Date().toTimeString().slice(0,5)}"`:` value="${v}"`;
        inp=`<div style="position:relative"><input id="_f_${f.id}" data-f="${f.id}" type="${f.type||'text'}" placeholder="${f.label}" style="${is};${f.id==='matricula'?'padding-right:36px':''}"${extra}>${f.id==='matricula'?scannerButtonHTML('_f_matricula',PFX):''}</div>`;
      }
      fh+=`<div${f.type==='textarea'?' style="grid-column:span 2"':''}><label style="font-size:11px;font-weight:600;color:${c.t3};display:block;margin-bottom:3px">${f.label}${f.required?' *':''}</label>${inp}</div>`;
    });
    fh+='</div></div>';
  });
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};box-shadow:0 20px 60px rgba(0,0,0,.14);width:100%;max-width:660px;max-height:92vh;overflow-y:auto;color:${c.text}">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px 12px;border-bottom:1px solid ${c.border}"><div style="font-size:18px;font-weight:700">${editId?'✏️ Editar':'+ Nuevo'} ${TITLE}</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_m${MOD}').remove()">✕ Cerrar</button></div>
    <div id="_afMsg" style="display:none;padding:8px 22px;background:#ecfdf5;color:#15803d;font-size:12px;font-weight:600"></div>
    <div style="padding:16px 22px">${fh}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}">
      <button style="padding:9px 18px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:10px;font-size:12px;cursor:pointer" onclick="this.closest('#_m${MOD}').remove()">Cancelar</button>
      <button id="_sv" style="padding:9px 22px;background:${c.blue};color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">${editId?'Guardar':'Crear'}</button>
    </div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sv').onclick=async()=>{
    const fd={recinto:_u.recinto||'',modificado:nowLocal(),modificadoPor:_u.uid};
    m.querySelectorAll('[data-f]').forEach(el=>{fd[el.dataset.f]=el.value||'';});
    if(!fd.matricula){toast('Matrícula requerida','#ef4444');return;}
    fd.matricula=normPlate(fd.matricula);
    if(_posAuto&&!editId)fd.pos=nextPos(_data);
    try{
      if(editId){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${editId}`,fd);_log('edit',fd.matricula,'Edición');}
      else{fd.fecha=fd.fecha||nowLocal();fd.estado='EN_RECINTO';fd.creadoPor=_u.uid;const{fsAdd}=await import('./firestore.js');await fsAdd(COLL,fd);_log('new',fd.matricula,'Nuevo ingreso');}
      toast('✅ Guardado','#10b981');m.remove();
    }catch(e){toast('❌ Error','#ef4444');}
  };
  document.body.appendChild(m);
}

// ═══ MODAL ALERTA ═══
function openAlM(eid=null){
  const c=C(),old=document.getElementById('_al'+MOD);if(old)old.remove();
  const r=eid?_especiales.find(d=>d.id===eid):{};
  const m=document.createElement('div');m.id='_al'+MOD;
  m.style.cssText='position:fixed;inset:0;background:rgba(15,20,35,.4);backdrop-filter:blur(5px);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML=`<div style="background:${c.card};border-radius:20px;border:1px solid ${c.border};width:100%;max-width:500px;color:${c.text}"><div style="padding:18px 22px 12px;border-bottom:1px solid ${c.border};display:flex;justify-content:space-between"><div style="font-size:18px;font-weight:700">${eid?'✏️':'+'} Alerta</div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="this.closest('#_al${MOD}').remove()">✕</button></div><div style="padding:16px 22px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px"><div><label style="font-size:11px;font-weight:600;color:${c.t3}">Matrícula</label><input data-a="matricula" value="${safeHtml(r.matricula||'')}" style="width:100%;padding:8px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};outline:none" oninput="this.value=this.value.toUpperCase()"></div><div><label style="font-size:11px;font-weight:600;color:${c.t3}">Ref</label><input data-a="referencia" value="${safeHtml(r.referencia||'')}" style="width:100%;padding:8px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};outline:none"></div></div><div style="margin-bottom:10px"><label style="font-size:11px;font-weight:600;color:${c.t3}">Mensaje *</label><input data-a="mensaje" value="${safeHtml(r.mensaje||'')}" style="width:100%;padding:8px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};outline:none" placeholder="Descripción..."></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label style="font-size:11px;font-weight:600;color:${c.t3}">Autor</label><input data-a="autor" value="${safeHtml(r.autor||'')}" style="width:100%;padding:8px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};outline:none"></div><div><label style="font-size:11px;font-weight:600;color:${c.t3}">Prioridad</label><select data-a="prioridad" style="width:100%;padding:8px;border:1px solid ${c.border};border-radius:9px;font-size:13px;background:${c.card};color:${c.text};outline:none"><option value="alta"${r.prioridad==='alta'?' selected':''}>🔴 Alta</option><option value="media"${!r.prioridad||r.prioridad==='media'?' selected':''}>🟡 Media</option><option value="baja"${r.prioridad==='baja'?' selected':''}>🟢 Baja</option></select></div></div></div><div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 18px;border-top:1px solid ${c.border}"><button style="padding:8px 16px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;cursor:pointer" onclick="this.closest('#_al${MOD}').remove()">Cancelar</button><button id="_sva" style="padding:8px 18px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Guardar</button></div></div>`;
  m.onclick=e=>{if(e.target===m)m.remove();};
  m.querySelector('#_sva').onclick=async()=>{const fd={ts:Date.now(),activo:true};m.querySelectorAll('[data-a]').forEach(el=>{fd[el.dataset.a]=el.value||'';});if(!fd.mensaje){toast('Mensaje requerido','#ef4444');return;}try{if(eid){const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}_especiales/${eid}`,fd);}else{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLL}_especiales`,fd);}toast('✅ Alerta guardada','#10b981');m.remove();}catch(e){toast('❌','#ef4444');}};
  document.body.appendChild(m);
}

// ═══ ACTIONS ═══
async function _log(a,mat,det){try{const{fsAdd}=await import('./firestore.js');await fsAdd(`${COLL}_historial`,{ts:Date.now(),user:_u.nombre||_u.uid,action:a,mat,detail:det,collection:MOD});}catch(e){}}
async function _sal(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${id}`,{estado:'SALIDA',salida:nowLocal(),modificado:nowLocal()});_log('salida',d.matricula,'Salida');toast('↩ Salida','#d97706');}catch(e){}}
async function _react(id){const d=_data.find(x=>x.id===id);if(!d)return;try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`${COLL}/${id}`,{estado:'EN_RECINTO',salida:null,modificado:nowLocal()});_log('reactivar',d.matricula,'Reactivado');toast('↺','#0d9f6e');}catch(e){}}
async function _del(id){if(!confirm('¿Eliminar?'))return;const d=_data.find(x=>x.id===id);try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLL}/${id}`);if(d)_log('edit',d.matricula,'Eliminado');toast('🗑','#f59e0b');}catch(e){}}
async function xls(){try{toast('⬇','#2c5ee8');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const ws=X.utils.json_to_sheet(_filtered.map(d=>({Pos:d.pos,Matrícula:d.matricula,Remolque:d.remolque,Tipo:d.tipoVehiculo,Llamador:d.llamador,Conductor:`${d.nombre||''} ${d.apellido||''}`.trim(),Empresa:d.empresa,Tel:d.telefono,Hall:d.hall,Stand:d.stand,Estado:ST[d.estado]||d.estado,Entrada:d.fecha})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,TITLE);X.writeFile(wb,`${TITLE}_${new Date().toISOString().slice(0,10)}.xlsx`);toast('✅','#10b981');}catch(e){toast('❌','#ef4444');}}

// ═══ AUTOFILL — cross-read conductores ═══
async function _doAutoFill(mat){
  if(!_autoFill||!mat||mat.length<4)return;
  const result=await autoFillByPlate(mat);
  if(!result)return;
  const d=result.data;
  const set=(id,v)=>{const el=document.getElementById('_f_'+id);if(el&&v&&!el.value)el.value=v;};
  set('nombre',d.nombre);set('apellido',d.apellido);set('empresa',d.empresa);
  set('telefono',d.telefono);set('remolque',d.remolque);set('hall',d.hall);
  set('stand',d.stand);set('expositor',d.expositor);set('dni',d.dni);
  if(d.telPais){const el=document.getElementById('_f_telPais');if(el)el.value=d.telPais.split(' ')[0];}
  const msg=document.getElementById('_afMsg');
  if(msg){msg.style.display='block';msg.textContent=`✅ AutoFill desde ${result.source}: ${d.nombre||d.matricula||''}`;}
}

// ═══ WINDOW BINDINGS ═══
window[PFX+'Sort']=(col)=>{if(_sortCol===col)_sortDir=_sortDir==='asc'?'desc':'asc';else{_sortCol=col;_sortDir='asc';}applyF();rc();};
window[PFX+'Edit']=(id)=>openModal(id);
window[PFX+'Del']=(id)=>_del(id);
window[PFX+'Sal']=(id)=>_sal(id);
window[PFX+'React']=(id)=>_react(id);
window[PFX+'Print']=(id)=>toast('🖨 Impresión (módulo impresión)','#2c5ee8');
window[PFX+'Cut']=(id)=>toast('✂ Troquelado (próximamente)','#7c3aed');
window[PFX+'Track']=(id)=>toast('📡 Tracking (próximamente)','#2c5ee8');
window[PFX+'NewAl']=()=>openAlM();
window[PFX+'EditAl']=(id)=>openAlM(id);
window[PFX+'DelAl']=async(id)=>{try{const{fsDel}=await import('./firestore.js');await fsDel(`${COLL}_especiales/${id}`);toast('Eliminada','#f59e0b');}catch(e){}};
window[PFX+'Imp']=async(inp)=>{const f=inp.files[0];if(!f)return;await feImport(f,COLL,REQ_FIELD,()=>{});inp.value='';};
window[PFX+'AF']=(mat)=>_doAutoFill(mat);
