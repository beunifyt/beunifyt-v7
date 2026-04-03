// BeUnifyT v7 — impresion.js
// Constructor de pases configurable por evento
import { AppState } from '../state.js';
import { getDB }    from '../firestore.js';
import { toast, safeHtml } from '../utils.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';

const CAMPOS_DISPONIBLES = [
  {id:'matricula', lbl:'Matrícula',        req:true},
  {id:'remolque',  lbl:'Remolque',         req:false},
  {id:'empresa',   lbl:'Empresa',          req:false},
  {id:'conductor', lbl:'Conductor',        req:false},
  {id:'hall',      lbl:'Hall / Pabellón',  req:false},
  {id:'stand',     lbl:'Stand',            req:false},
  {id:'llamador',  lbl:'Llamador',         req:false},
  {id:'referencia',lbl:'Referencia',       req:false},
  {id:'entrada',   lbl:'Hora entrada',     req:false},
  {id:'operador',  lbl:'Operador',         req:false},
  {id:'puerta',    lbl:'Puerta acceso',    req:false},
  {id:'tipoVeh',   lbl:'Tipo vehículo',    req:false},
  {id:'telefono',  lbl:'Teléfono',         req:false},
  {id:'comentario',lbl:'Comentario',       req:false},
  {id:'evento',    lbl:'Nombre evento',    req:false},
  {id:'qr',        lbl:'Código QR',        req:false},
];

const PAPELES = [
  {id:'A6L',   lbl:'A6 Apaisado (148×105mm)',  w:148,h:105},
  {id:'A6P',   lbl:'A6 Vertical (105×148mm)',   w:105,h:148},
  {id:'A5L',   lbl:'A5 Apaisado (210×148mm)',  w:210,h:148},
  {id:'A5P',   lbl:'A5 Vertical (148×210mm)',   w:148,h:210},
  {id:'A4L',   lbl:'A4 Apaisado (297×210mm)',  w:297,h:210},
  {id:'A4P',   lbl:'A4 Vertical (210×297mm)',   w:210,h:297},
  {id:'ticket',lbl:'Ticket 80mm (80×200mm)',     w:80, h:200},
  {id:'tira',  lbl:'Tira 1/3 A4 (99×210mm)',    w:99, h:210},
];

export async function initImpresion(container){
  const el=typeof container==='string'?document.getElementById(container):container;
  if(!el)return;
  const ev=AppState.get('currentEvent');
  let cfg=await _loadCfg(ev?.id);
  _render(el, cfg, ev);
}

async function _loadCfg(evId){
  if(!evId) return _defaultCfg();
  try{
    const db=getDB();
    const{doc,getDoc}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDoc(doc(db,'events',evId,'config','print'));
    return snap.exists()?snap.data():_defaultCfg();
  }catch{return _defaultCfg();}
}

function _defaultCfg(){
  return{
    ing:{papel:'A6L',campos:['matricula','remolque','empresa','conductor','hall','stand','referencia','entrada'],titulo:'PASE DE ENTRADA',logo:true,qr:true,copias:1},
    ref:{papel:'A6L',campos:['referencia','matricula','empresa','conductor','hall','stand','entrada','operador'],titulo:'PASE REFERENCIA',logo:true,qr:true,copias:1},
  };
}

function _render(el, cfg, ev){
  el.innerHTML=`
<div style="padding:10px">
  <!-- TABS TIPO PASE -->
  <div style="display:flex;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:12px">
    <button class="btn btn-p btn-sm" id="tabIng" onclick="window._impTab('ing')" style="border-radius:20px">🚛 Pase Ingresos</button>
    <button class="btn btn-gh btn-sm" id="tabRef" onclick="window._impTab('ref')" style="border-radius:20px">📋 Pase Referencia</button>
    <span style="flex:1"></span>
    <button class="btn btn-sm" style="background:var(--green);color:#fff;border:none" onclick="window._impPreview()">👁 Vista previa</button>
    <button class="btn btn-p btn-sm" onclick="window._impSave()">💾 Guardar configuración</button>
  </div>

  <div id="impContent"></div>
</div>`;

  window._impCfg=cfg;
  window._impTab=function(tipo){
    document.getElementById('tabIng').className=`btn btn-${tipo==='ing'?'p':'gh'} btn-sm`;
    document.getElementById('tabIng').style.borderRadius='20px';
    document.getElementById('tabRef').className=`btn btn-${tipo==='ref'?'p':'gh'} btn-sm`;
    document.getElementById('tabRef').style.borderRadius='20px';
    _renderTabImp(tipo);
  };
  window._impTab('ing');

  window._impSave=async function(){
    const ev=AppState.get('currentEvent');
    if(!ev?.id){toast('Sin evento activo','var(--red)');return;}
    try{
      const db=getDB();
      const{doc,setDoc}=await import(`${FB}/firebase-firestore.js`);
      await setDoc(doc(db,'events',ev.id,'config','print'),window._impCfg,{merge:true});
      toast('✅ Configuración de impresión guardada','var(--green)');
    }catch{toast('Error al guardar','var(--red)');}
  };

  window._impPreview=function(){
    const tipo=document.getElementById('tabIng')?.classList.contains('btn-p')?'ing':'ref';
    const cfg=window._impCfg[tipo];
    _openPreview(cfg,tipo);
  };
}

function _renderTabImp(tipo){
  const c=window._impCfg[tipo];
  const papel=PAPELES.find(p=>p.id===c.papel)||PAPELES[0];
  const content=document.getElementById('impContent');
  if(!content)return;
  content.innerHTML=`
<div style="display:grid;grid-template-columns:1fr 320px;gap:16px">

  <!-- CONFIGURACION -->
  <div>
    <!-- Papel -->
    <div class="card" style="margin-bottom:10px">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px;letter-spacing:.08em">📄 Papel</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${PAPELES.map(p=>`<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--r);border:1.5px solid ${c.papel===p.id?'var(--blue)':'var(--border)'};background:${c.papel===p.id?'var(--bll)':'var(--bg3)'};cursor:pointer;font-size:12px">
          <input type="radio" name="papel_${tipo}" value="${p.id}" ${c.papel===p.id?'checked':''} onchange="window._impCfg['${tipo}'].papel='${p.id}';window._impTab('${tipo}')" style="width:auto;accent-color:var(--blue)">
          <span>${p.lbl}</span>
        </label>`).join('')}
      </div>
    </div>

    <!-- Título -->
    <div class="card" style="margin-bottom:10px">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px;letter-spacing:.08em">📝 Título del pase</div>
      <input value="${safeHtml(c.titulo||'')}" oninput="window._impCfg['${tipo}'].titulo=this.value" style="font-weight:700;font-size:14px" placeholder="PASE DE ENTRADA">
      <div style="display:flex;gap:12px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <input type="checkbox" ${c.logo?'checked':''} onchange="window._impCfg['${tipo}'].logo=this.checked" style="width:16px;height:16px;accent-color:var(--blue)"> Logo BeUnifyT
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <input type="checkbox" ${c.qr?'checked':''} onchange="window._impCfg['${tipo}'].qr=this.checked" style="width:16px;height:16px;accent-color:var(--blue)"> Código QR
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <span>Copias:</span>
          <select onchange="window._impCfg['${tipo}'].copias=+this.value" style="width:auto;padding:4px 8px;font-size:13px">
            ${[1,2,3].map(n=>`<option value="${n}" ${c.copias===n?'selected':''}>${n}</option>`).join('')}
          </select>
        </label>
      </div>
    </div>

    <!-- Campos — orden de arrastre -->
    <div class="card">
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px;letter-spacing:.08em">📋 Campos en el pase (arrastra para ordenar)</div>
      <div id="camposList" style="display:flex;flex-direction:column;gap:4px">
        ${CAMPOS_DISPONIBLES.map(campo=>{
          const activo=c.campos.includes(campo.id);
          const orden=c.campos.indexOf(campo.id)+1;
          return`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--r);border:1.5px solid ${activo?'var(--border2)':'var(--border)'};background:${activo?'var(--bg2)':'var(--bg3)'};opacity:${activo?1:.6}">
            <span style="color:var(--text3);font-size:14px;cursor:grab">⠿</span>
            <label style="display:flex;align-items:center;gap:6px;flex:1;cursor:pointer;font-size:13px">
              <input type="checkbox" ${activo?'checked':''} ${campo.req?'disabled':''} onchange="window._toggleCampoImp('${tipo}','${campo.id}',this.checked)" style="width:16px;height:16px;accent-color:var(--blue)">
              <span style="font-weight:${activo?'600':'400'}">${campo.lbl}</span>
              ${campo.req?`<span style="font-size:9px;background:var(--rll);color:var(--red);padding:1px 5px;border-radius:3px;font-weight:700">SIEMPRE</span>`:''}
            </label>
            ${activo&&orden?`<span style="font-size:10px;color:var(--text3);font-weight:700">Pos. ${orden}</span>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- PREVIEW MINIATURA -->
  <div>
    <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px;letter-spacing:.08em">👁 Previsualización</div>
    <div style="background:#f0f2f8;border-radius:var(--r2);padding:12px;display:flex;align-items:center;justify-content:center;min-height:200px">
      ${_miniPreview(c,papel)}
    </div>
    <div style="margin-top:8px;font-size:11px;color:var(--text3);text-align:center">${papel.lbl}</div>
    <button onclick="window._impPreview()" style="width:100%;margin-top:8px;padding:8px;background:var(--blue);color:#fff;border:none;border-radius:var(--r);font-weight:700;font-size:13px;cursor:pointer">
      👁 Abrir vista previa real
    </button>
  </div>
</div>`;

  window._toggleCampoImp=function(tipo,campoId,activo){
    const c=window._impCfg[tipo];
    if(activo&&!c.campos.includes(campoId)) c.campos.push(campoId);
    else if(!activo) c.campos=c.campos.filter(x=>x!==campoId);
    _renderTabImp(tipo);
  };
}

function _miniPreview(cfg,papel){
  const ratio=papel.h/papel.w;
  const w=180, h=Math.round(w*ratio);
  const campos=CAMPOS_DISPONIBLES.filter(c=>cfg.campos.includes(c.id));
  return`<div style="width:${w}px;height:${h}px;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);padding:8px;font-family:'Inter',sans-serif;overflow:hidden;position:relative">
    ${cfg.logo?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1.5px solid #0f172a;padding-bottom:4px">
      <div style="width:14px;height:14px;background:#030812;border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center">
        <div style="width:6px;height:6px;border-radius:50%;background:#00ffc8"></div>
      </div>
      <span style="font-size:8px;font-weight:900;color:#0f172a">${safeHtml(cfg.titulo||'PASE')}</span>
    </div>`:`<div style="font-size:8px;font-weight:900;color:#0f172a;margin-bottom:4px;border-bottom:1.5px solid #0f172a;padding-bottom:3px">${safeHtml(cfg.titulo||'PASE')}</div>`}
    ${campos.slice(0,8).map(c=>`<div style="display:flex;justify-content:space-between;font-size:6px;padding:1px 0;border-bottom:0.5px solid #f0f0f0">
      <span style="color:#6b7280;font-weight:600">${c.lbl.toUpperCase()}</span>
      <span style="color:#0f172a;font-weight:700">${c.id==='matricula'?'AB1234CD':c.id==='hall'?'5':'—'}</span>
    </div>`).join('')}
    ${cfg.qr?`<div style="position:absolute;bottom:6px;right:6px;width:20px;height:20px;border:1.5px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:8px">QR</div>`:''}
  </div>`;
}

function _openPreview(cfg,tipo){
  const papel=PAPELES.find(p=>p.id===cfg.papel)||PAPELES[0];
  const campos=CAMPOS_DISPONIBLES.filter(c=>cfg.campos.includes(c.id));
  const demo={matricula:'AB1234CD',remolque:'REM-001',empresa:'Demo Empresa S.L.',conductor:'Juan García',hall:'5',stand:'B-200',llamador:'12345',referencia:'REF-001234',entrada:new Date().toLocaleString('es-ES'),operador:'Carlos R.',puerta:'Puerta 3',tipoVeh:'Tráiler',telefono:'+34 600 000 000',comentario:'Demo de impresión',evento:AppState.get('currentEvent')?.name||'BeUnifyT'};
  const w=window.open('','_blank',`width=${papel.w*3+100},height=${papel.h*3+100}`);
  if(!w){toast('⚠ Activa ventanas emergentes para ver la vista previa','var(--amber)');return;}
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vista previa — ${safeHtml(cfg.titulo||'Pase')}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:${papel.w}mm ${papel.h}mm;margin:0}
body{font-family:'Inter','Segoe UI',Arial,sans-serif;background:#f0f2f8;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px}
.page{width:${papel.w}mm;height:${papel.h}mm;background:#fff;border:1px solid #e0e0e0;box-shadow:0 4px 16px rgba(0,0,0,.1);padding:5mm;display:flex;flex-direction:column;position:relative}
.header{display:flex;align-items:center;gap:6px;border-bottom:2px solid #0f172a;padding-bottom:3mm;margin-bottom:3mm}
.logo-box{width:16px;height:16px;background:#030812;border-radius:3px;display:flex;align-items:center;justify-content:center}
.title{font-size:11pt;font-weight:900;color:#0f172a;letter-spacing:-.02em}
.campo{display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:0.5px solid #e0e0e0;font-size:8pt}
.campo-lbl{color:#6b7280;font-weight:700;text-transform:uppercase;font-size:7pt;letter-spacing:.04em}
.campo-val{color:#0f172a;font-weight:700;font-family:'Courier New',monospace;font-size:9pt}
.campo-val.mat{font-size:13pt;letter-spacing:2px}
.qr-box{position:absolute;bottom:5mm;right:5mm;width:18mm;height:18mm;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:700;color:#0f172a;text-align:center}
.btn-row{display:flex;gap:8px}
.btn{padding:8px 16px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer}
@media print{body{background:#fff}.btn-row{display:none}}
</style></head><body>
<div class="btn-row"><button class="btn" style="background:#0f172a;color:#fff" onclick="window.print()">🖨 Imprimir</button><button class="btn" style="background:#f0f2f8;color:#0f172a;border:1px solid #e0e0e0" onclick="window.close()">✕ Cerrar</button></div>
${Array(cfg.copias||1).fill('').map(()=>`
<div class="page">
  ${cfg.logo?`<div class="header">
    <div class="logo-box"><div style="width:7px;height:7px;border-radius:50%;background:#00ffc8"></div></div>
    <div class="title">${safeHtml(cfg.titulo||'PASE')}</div>
  </div>`:`<div style="font-size:11pt;font-weight:900;color:#0f172a;border-bottom:2px solid #0f172a;padding-bottom:3mm;margin-bottom:3mm">${safeHtml(cfg.titulo||'PASE')}</div>`}
  ${campos.map(c=>`<div class="campo">
    <span class="campo-lbl">${c.lbl}</span>
    <span class="campo-val${c.id==='matricula'?' mat':''}">${safeHtml(demo[c.id]||'—')}</span>
  </div>`).join('')}
  ${cfg.qr?`<div class="qr-box">QR<br>${safeHtml(demo.matricula)}</div>`:''}
  <div style="margin-top:auto;padding-top:3mm;font-size:6pt;color:#94a3b8;border-top:0.5px solid #e0e0e0;display:flex;justify-content:space-between">
    <span>${safeHtml(demo.evento)}</span><span>${new Date().toLocaleDateString('es-ES')}</span>
  </div>
</div>`).join('')}
</body></html>`);
  w.document.close();
}
