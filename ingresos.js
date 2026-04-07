// BeUnifyT — ingresos.js
// Módulo Ingresos: Lista, Especial, Modificaciones, Campos





// ---- hall filter ----
let cH='';
function sh(el,h){cH=h;document.querySelectorAll('.hp').forEach(x=>x.classList.remove('on'));el.classList.add('on');rebuildTable();}
function clrF(){const el=document.querySelector('[data-s]');if(el)el.value='';cH='';document.querySelectorAll('.hp').forEach(x=>x.classList.remove('on'));document.querySelector('.hp').classList.add('on');rebuildTable();}
function fil(){rebuildTable();}

// ============================================================
// COLUMN MANAGER
// ============================================================
const ALL_COLS=[
  {id:'pos',       label:'#',          req:true},
  {id:'matricula', label:'Matrícula',   req:true},
  {id:'remolque',  label:'Remolque',    req:false},
  {id:'llamador',  label:'Llamador',    req:false},
  {id:'referencia',label:'Ref.',        req:false},
  {id:'conductor', label:'Conductor',   req:false},
  {id:'empresa',   label:'Empresa',     req:false},
  {id:'telefono',  label:'Tel.',        req:false},
  {id:'hall',      label:'Hall',        req:false},
  {id:'stand',     label:'Stand',       req:false},
  {id:'estado',    label:'Estado',      req:false},
  {id:'entrada',   label:'Entrada',     req:false},
  {id:'acciones',  label:'Acc.',        req:true},
];
const DEF_VIS=ALL_COLS.map(c=>c.id);
let visCols=[...DEF_VIS], colOrd=[...DEF_VIS], sortCol='pos', sortDir='desc', templates={};

const FS={
  save(d){try{localStorage.setItem('be_tpls',JSON.stringify(d));}catch(e){}},
  load(){try{return JSON.parse(localStorage.getItem('be_tpls')||'{}');}catch(e){return{};}}
};

function cellVal(r,cid){
  const SL={move:'En camino',in:'En recinto',wait:'En espera',park:'Rampa',out:'Salida',none:'Sin asignar'};
  switch(cid){
    case 'pos':       return `<td class="p0">${r.p}</td>`;
    case 'matricula': return `<td><span class="mc" onclick="openDetalle(${r.p})">${r.m}</span>${r.r?`<br><span class="mcs">${r.r}</span>`:''}</td>`;
    case 'remolque':  return `<td class="dm sm">${r.r||'—'}</td>`;
    case 'llamador':  return `<td class="dm">${r.ll||'—'}</td>`;
    case 'referencia':return `<td class="dm sm">${r.ref||'—'}</td>`;
    case 'conductor': return `<td>${r.n?`<b style="font-size:12px">${r.n}</b>`:''} ${r.e?`<br><span class="dm sm">${r.e}</span>`:''} ${!r.n&&!r.e?'<span class="dm">—</span>':''}</td>`;
    case 'empresa':   return `<td class="dm sm">${r.e||'—'}</td>`;
    case 'telefono':  return `<td>${tl(r.tp,r.t)}</td>`;
    case 'hall':      return `<td><span class="hb">${r.h||'—'}</span></td>`;
    case 'stand':     return `<td class="dm sm">${r.st||'—'}</td>`;
    case 'estado':    return `<td><span class="st-${r.es}">${SL[r.es]||r.es}</span></td>`;
    case 'entrada':   return `<td class="dm sm nw">${r.en}</td>`;
    case 'acciones':  return `<td><div class="ar">
      <button class="xa" title="Imprimir" onclick="T('🖨 ${r.m}','')">🖨</button>
      <button class="xa" title="Troquelado" onclick="T('✂','')">✂</button>
      <button class="xa" title="Tracking" onclick="T('📡','')">📡</button>
      <button class="xa" title="Editar" onclick="T('✏️','')">✏️</button>
      ${r.es!=='out'?`<button class="xa" title="Salida" onclick="T('↩','')">↩</button>`:`<button class="xa" title="Reactivar" onclick="T('↺','')">↺</button>`}
      <button class="xa xd" title="Eliminar" onclick="T('🗑','')">🗑</button>
    </div></td>`;
    default: return '<td>—</td>';
  }
}

function sortData(rows){
  const K={pos:'p',matricula:'m',llamador:'ll',conductor:'n',empresa:'e',hall:'h',estado:'es',entrada:'en'};
  const k=K[sortCol]; if(!k)return rows;
  return [...rows].sort((a,b)=>{
    const r=String(a[k]||'').localeCompare(String(b[k]||''),undefined,{numeric:true});
    return sortDir==='asc'?r:-r;
  });
}

function rebuildTable(){
  const mc=document.getElementById('mc');
  if(!mc)return;
  const q=(document.querySelector('[data-s]')?.value||'').toLowerCase();
  let rows=D.filter(r=>!q||`${r.p} ${r.m} ${r.n||''} ${r.e||''} ${r.ll||''} ${r.h||''}`.toLowerCase().includes(q));
  if(cH) rows=rows.filter(r=>r.h===cH);
  rows=sortData(rows);
  const cnt=document.getElementById('cnt');
  if(cnt) cnt.textContent=rows.length+' reg.';
  if(!rows.length){mc.innerHTML='<div style="text-align:center;padding:48px;opacity:.4"><div style="font-size:36px">🚦</div><div style="font-weight:600;margin-top:6px">Sin resultados</div></div>';return;}
  const cols=colOrd.filter(c=>visCols.includes(c));
  const colDefs=cols.map(id=>ALL_COLS.find(c=>c.id===id)).filter(Boolean);
  const SORT_IDS=['pos','matricula','llamador','conductor','empresa','hall','estado','entrada'];
  const thead=colDefs.map(c=>{
    const s=SORT_IDS.includes(c.id);
    const cls=c.id===sortCol?(sortDir==='asc'?'sort-asc':'sort-desc'):'';
    return `<th class="${cls}"${s?` onclick="colSort('${c.id}')"`:''} oncontextmenu="colCtx(event,'${c.id}')">${c.label}</th>`;
  }).join('');
  mc.innerHTML=`<table class="dtbl"><thead><tr>${thead}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(cid=>cellVal(r,cid)).join('')}</tr>`).join('')}</tbody></table>`;
}

function colSort(col){if(sortCol===col)sortDir=sortDir==='asc'?'desc':'asc';else{sortCol=col;sortDir='asc';}rebuildTable();}

// ---- Context menu ----
let _ctxCol=null, ctxEl;
function buildCtxMenu(){
  ctxEl=document.createElement('div');
  ctxEl.id='ctxMenu';
  ctxEl.style.cssText='position:fixed;z-index:9999;display:none;min-width:170px;border-radius:10px;padding:4px;box-shadow:0 6px 24px rgba(0,0,0,.15)';
  document.body.appendChild(ctxEl);
  document.addEventListener('click',()=>ctxEl.style.display='none');
  document.addEventListener('keydown',e=>{if(e.key==='Escape')ctxEl.style.display='none';});
}
function colCtx(e,id){
  e.preventDefault(); _ctxCol=id;
  const vis=visCols.includes(id);
  ctxEl.innerHTML=`
    <div class="ctx-item" onclick="ctxToggle()">${vis?'👁 Ocultar':'👁 Mostrar'} columna</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="colSort('${id}');ctxEl.style.display='none'">▲ A → Z</div>
    <div class="ctx-item" onclick="sortCol='${id}';sortDir='desc';rebuildTable();ctxEl.style.display='none'">▼ Z → A</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="openColPanel();ctxEl.style.display='none'">⚙ Gestionar columnas</div>`;
  ctxEl.style.display='block';
  const r=ctxEl.getBoundingClientRect();
  let x=e.clientX,y=e.clientY;
  if(x+r.width>window.innerWidth)x=window.innerWidth-r.width-8;
  if(y+r.height>window.innerHeight)y=window.innerHeight-r.height-8;
  ctxEl.style.left=x+'px';ctxEl.style.top=y+'px';
}
function ctxToggle(){if(_ctxCol)toggleCol(_ctxCol);ctxEl.style.display='none';}

// ---- Column panel ----
let panelEl;
function buildColPanel(){panelEl=document.createElement('div');panelEl.className='col-panel';document.body.appendChild(panelEl);}
function openColPanel(){renderPanel();panelEl.classList.add('open');}
function closeColPanel(){panelEl.classList.remove('open');}
function toggleCol(id){const c=ALL_COLS.find(x=>x.id===id);if(c&&c.req)return;if(visCols.includes(id))visCols=visCols.filter(x=>x!==id);else visCols.push(id);renderPanel();rebuildTable();}

function renderPanel(){
  const tplHTML=Object.keys(templates).length
    ?Object.keys(templates).map(n=>`<div class="tpl-item${templates[n]._active?' active':''}" onclick="applyTpl('${n.replace(/'/g,"\\'")}')"><span class="tpl-item-name">📋 ${n}</span><span class="tpl-item-del" onclick="delTpl(event,'${n.replace(/'/g,"\\'")}')">✕</span></div>`).join('')
    :'<div style="font-size:11px;padding:6px 10px;opacity:.4">Sin plantillas guardadas</div>';
  panelEl.innerHTML=`
    <div class="col-panel-head"><div class="col-panel-title">⚙ Columnas</div><button class="col-panel-close" onclick="closeColPanel()">✕</button></div>
    <div class="col-panel-body">
      <div class="col-panel-sec">Visibilidad</div>
      ${ALL_COLS.map(c=>{const on=visCols.includes(c.id);return`<div class="col-item${on?' col-on':''}" onclick="${c.req?'':` toggleCol('${c.id}')`}" style="${c.req?'opacity:.55;cursor:default':''}">
        <div class="col-toggle${on?' on':''}"><div class="col-toggle-knob"></div></div>
        <span class="col-item-lbl">${c.label}${c.req?' <small style="opacity:.4">(fija)</small>':''}</span>
      </div>`;}).join('')}
      <button class="col-reset-btn" onclick="visCols=[...DEF_VIS];colOrd=[...DEF_VIS];renderPanel();rebuildTable()">↺ Restaurar predeterminadas</button>
    </div>
    <div class="col-panel-foot">
      <div class="col-panel-sec" style="margin-top:0;padding-top:0">Plantillas</div>
      <div class="tpl-row"><input class="tpl-input" id="tplIn" placeholder="Nombre plantilla..."><button class="tpl-save" onclick="saveTpl()">Guardar</button></div>
      <div class="tpl-list">${tplHTML}</div>
    </div>`;
}

function saveTpl(){const el=document.getElementById('tplIn');const n=el?.value.trim();if(!n){T('Ingresá un nombre','');return;}Object.keys(templates).forEach(k=>templates[k]._active=false);templates[n]={visible:[...visCols],order:[...colOrd],_active:true};FS.save(templates);if(el)el.value='';renderPanel();T('Plantilla "'+n+'" guardada','');}
function applyTpl(n){const t=templates[n];if(!t)return;visCols=[...(t.visible||DEF_VIS)];colOrd=[...(t.order||DEF_VIS)];Object.keys(templates).forEach(k=>templates[k]._active=false);templates[n]._active=true;FS.save(templates);renderPanel();rebuildTable();T('Plantilla "'+n+'" activada','');}
function delTpl(e,n){e.stopPropagation();delete templates[n];FS.save(templates);renderPanel();T('Plantilla eliminada','');}

// ---- Detalle registro ----
const HISTORIAL=[
  {p:273,m:"8611MTL",n:"Juan García",e:"Trans. Norte",tp:"+34",t:"612345678",ll:"ACME",h:"5",ref:"REF-001"},
  {p:272,m:"8788MTL",n:"Carlos Ruiz",e:"Trans. Iberica",tp:"+34",t:"68101",ll:"--",h:"5",ref:"REF-002"},
  {p:271,m:"GX936KJ",n:"Ana Martinez",e:"Logistica Sur",tp:"+34",t:"9687",ll:"--",h:"3A",ref:"REF-003"},
];
function openDetalle(pid){
  const r=D.find(x=>x.p===pid)||D[0];
  const SL={move:'En camino',in:'En recinto',wait:'En espera',park:'Rampa',out:'Salida',none:'Sin asignar'};
  document.getElementById('detBody').innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <span style="font-size:24px;font-weight:800;font-family:monospace;letter-spacing:1px">${r.m}</span>
      <span class="st-${r.es}">${SL[r.es]||r.es}</span>
      ${r.r?`<span class="mcs">${r.r}</span>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;margin-bottom:16px">
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Conductor</div><b>${r.n||'—'}</b></div>
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Empresa</div>${r.e||'—'}</div>
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Teléfono</div>${tl(r.tp,r.t)}</div>
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Llamador</div>${r.ll||'—'}</div>
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Hall</div><span class="hb">${r.h||'—'}</span></div>
      <div><div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Entrada</div>${r.en}</div>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="xa" onclick="T('🖨 ${r.m}','')">🖨 Imprimir</button>
      <button class="xa" onclick="T('✂','')">✂ Troquelado</button>
      <button class="xa" onclick="T('📡','')">📡 Tracking</button>
      <button class="xa" onclick="T('✏️','');document.getElementById('detOv').classList.remove('open')">✏️ Editar</button>
      ${r.es!=='out'?`<button class="xa" onclick="T('↩ Salida','');document.getElementById('detOv').classList.remove('open')">↩ Salida</button>`
        :`<button class="xa" onclick="T('↺ Reactivado','')">↺ Reactivar</button>`}
      <button class="xa xd" onclick="T('🗑','');document.getElementById('detOv').classList.remove('open')">🗑 Eliminar</button>
    </div>`;
  document.getElementById('detOv').classList.add('open');
}

// ---- Autocomplete ----
function initAutocomplete(){
  const matIn=document.querySelector('.new-mat');
  const sugBox=document.getElementById('matSug');
  if(!matIn||!sugBox)return;
  matIn.addEventListener('input',()=>{
    const q=matIn.value.toUpperCase();
    if(!q||q.length<2){sugBox.style.display='none';return;}
    const matches=[...D,...HISTORIAL].filter((h,i,a)=>a.findIndex(x=>x.m===h.m)===i&&h.m.includes(q));
    if(!matches.length){sugBox.style.display='none';return;}
    sugBox.innerHTML=matches.slice(0,6).map(h=>`<div class="sug-item" onclick="fillFromHistory('${h.m}')">
      <span style="font-family:monospace;font-weight:700">${h.m}</span>
      <span style="opacity:.5;font-size:11px;margin-left:6px">${h.n||''} ${h.e?'· '+h.e:''}</span>
    </div>`).join('');
    sugBox.style.display='block';
  });
  matIn.addEventListener('blur',()=>setTimeout(()=>sugBox.style.display='none',200));
  // Scanner btn
  const wrap=matIn.parentElement;
  const scanBtn=document.createElement('button');
  scanBtn.type='button';
  scanBtn.innerHTML='📷';
  scanBtn.style.cssText='position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:16px;cursor:pointer;opacity:.4;transition:opacity .15s;padding:0';
  scanBtn.addEventListener('mouseenter',()=>scanBtn.style.opacity='1');
  scanBtn.addEventListener('mouseleave',()=>scanBtn.style.opacity='.4');
  scanBtn.addEventListener('click',()=>{
    T('📷 Escaneando...','');
    setTimeout(()=>{
      const r=['8611MTL','WW486TL','GX936KJ','8443DSR'][Math.floor(Math.random()*4)];
      matIn.value=r;matIn.dispatchEvent(new Event('input'));T('✅ Escaneada: '+r,'');
    },1500);
  });
  wrap.appendChild(scanBtn);
  matIn.style.paddingRight='34px';
}

function fillFromHistory(mat){
  const h=[...D,...HISTORIAL].find(x=>x.m===mat);if(!h)return;
  ['.new-n','.new-e','.new-ll','.new-h','.new-ref'].forEach(s=>{
    const key={'.new-n':'n','.new-e':'e','.new-ll':'ll','.new-h':'h','.new-ref':'ref'}[s];
    const el=document.querySelector(s);if(el&&h[key])el.value=h[key];
  });
  document.querySelector('.new-mat').value=mat;
  document.getElementById('matSug').style.display='none';
  T('Datos precargados ✓','');
}

// ============================================================
// CAMPOS TAB
// ============================================================
const CAMPOS_DEFS={
  vehiculo:{icon:'🚛',label:'Vehículo',fields:[
    {id:'matricula',  label:'Matrícula',      req:true,  desc:'Placa del vehículo'},
    {id:'remolque',   label:'Remolque',       req:false, desc:'Matrícula del remolque'},
    {id:'posicion',   label:'Posición',       req:false, desc:'Posición en recinto'},
    {id:'llamador',   label:'Llamador',       req:false, desc:'Responsable llamada'},
    {id:'logistica',  label:'Logística',      req:false, desc:'Empresa logística'},
    {id:'tipo_veh',   label:'Tipo vehículo',  req:false, desc:'Camión, furgón...'},
    {id:'pais',       label:'País',           req:false, desc:'País de matrícula'},
  ]},
  conductor:{icon:'👤',label:'Conductor',fields:[
    {id:'nombre',     label:'Nombre',         req:true,  desc:'Nombre del conductor'},
    {id:'apellido',   label:'Apellido',       req:false, desc:'Apellido'},
    {id:'empresa',    label:'Empresa',        req:false, desc:'Empresa transportista'},
    {id:'telefono',   label:'Teléfono',       req:false, desc:'Tel. conductor'},
    {id:'dni',        label:'DNI/Pasaporte',  req:false, desc:'Documento identidad'},
    {id:'supervisor', label:'Supervisor',     req:false, desc:'Nombre supervisor evento'},
    {id:'tel_sup',    label:'Tel. supervisor',req:false, desc:'Teléfono supervisor'},
  ]},
  evento:{icon:'📅',label:'Evento',fields:[
    {id:'montador',   label:'Montador',       req:false, desc:'Empresa montadora'},
    {id:'expositor',  label:'Expositor',      req:false, desc:'Nombre del expositor'},
    {id:'hall',       label:'Hall',           req:true,  desc:'Hall de destino'},
    {id:'stand',      label:'Stand',          req:false, desc:'Stand de entrega'},
    {id:'referencia', label:'Ref/Booking',    req:false, desc:'Número de reserva'},
    {id:'puerta',     label:'Puerta Hall',    req:false, desc:'Puerta de acceso'},
    {id:'acceso',     label:'Tipo acceso',    req:false, desc:'Principal, lateral...'},
    {id:'fecha',      label:'Fecha',          req:true,  desc:'Fecha de ingreso'},
    {id:'hora',       label:'Hora',           req:false, desc:'Hora de ingreso'},
    {id:'notas',      label:'Notas',          req:false, desc:'Observaciones'},
  ]},
};

function loadCamposState(){try{return JSON.parse(localStorage.getItem('be_campos')||'null');}catch(e){return null;}}
function defaultCamposState(){const s={};Object.values(CAMPOS_DEFS).forEach(sec=>sec.fields.forEach(f=>{s[f.id]={visible:true,required:f.req,label:f.label};}));return s;}
let camposState=loadCamposState()||defaultCamposState();
function saveCamposState(){localStorage.setItem('be_campos',JSON.stringify(camposState));}

function renderCamposTab(){
  const mc=document.getElementById('mc');
  if(!mc)return;
  mc.innerHTML=`<div style="padding:18px;max-width:700px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:15px;font-weight:700">Configuración de campos</div>
        <div style="font-size:12px;opacity:.5;margin-top:2px">Activá, ocultá o renombrá los campos del formulario de ingreso</div>
      </div>
      <button class="bn" onclick="resetCampos()">↺ Restaurar</button>
    </div>
    ${Object.entries(CAMPOS_DEFS).map(([sec,def])=>`
      <div class="campos-sec">
        <div class="campos-sec-head"><span>${def.icon}</span><span>${def.label}</span></div>
        ${def.fields.map(f=>{
          const st=camposState[f.id]||{visible:true,required:f.req,label:f.label};
          return `<div class="campos-row" id="cr-${f.id}">
            <div class="col-toggle${st.visible?' on':''}" onclick="toggleCampo('${f.id}')"><div class="col-toggle-knob"></div></div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px">
                <span id="clbl-${f.id}" style="font-size:12px;font-weight:600">${st.label}</span>
                ${f.req?'<span style="font-size:9px;opacity:.35">(requerido)</span>':''}
                <span style="font-size:11px;opacity:.3;cursor:pointer" onclick="editCampoLabel('${f.id}')" title="Renombrar">✏️</span>
              </div>
              <div style="font-size:11px;opacity:.45">${f.desc}</div>
            </div>
            <label style="display:flex;align-items:center;gap:4px;font-size:11px;opacity:.6;cursor:pointer;white-space:nowrap">
              <input type="checkbox" ${st.required?'checked':''} ${f.req?'disabled':''}
                onchange="camposState['${f.id}'].required=this.checked;saveCamposState()"
                style="accent-color:var(--acc,#2c5ee8)"> Obligatorio
            </label>
          </div>`;
        }).join('')}
      </div>`).join('')}
  </div>`;
}

function toggleCampo(id){
  if(!camposState[id])camposState[id]={visible:true,required:false,label:id};
  camposState[id].visible=!camposState[id].visible;
  saveCamposState();renderCamposTab();
}
function editCampoLabel(id){
  const el=document.getElementById('clbl-'+id);
  if(!el)return;
  const cur=camposState[id]?.label||id;
  const inp=document.createElement('input');
  inp.value=cur;
  inp.style.cssText='font-size:12px;font-weight:600;border:none;border-bottom:2px solid var(--acc,#2c5ee8);background:transparent;color:inherit;outline:none;width:120px;padding:1px 2px';
  inp.addEventListener('blur',()=>{
    if(!camposState[id])camposState[id]={visible:true,required:false,label:id};
    camposState[id].label=inp.value.trim()||cur;
    saveCamposState();renderCamposTab();
  });
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')inp.blur();if(e.key==='Escape'){inp.value=cur;inp.blur();}});
  el.replaceWith(inp);inp.focus();inp.select();
}
function resetCampos(){camposState=defaultCamposState();saveCamposState();renderCamposTab();T('Campos restaurados','');}

// ============================================================
// SIDEBAR — fijo, 4 posiciones
// ============================================================



window.renderIngresos = typeof renderIngresos !== 'undefined' ? renderIngresos : () => rebuildTable();
