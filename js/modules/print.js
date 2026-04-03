// BeUnifyT v7 — print.js
import { AppState } from '../state.js';
import { getDB }    from '../firestore.js';
import { safeHtml, formatDateTime } from '../utils.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';

const CAMPOS_DEF = {
  matricula:{lbl:'Matrícula'},remolque:{lbl:'Remolque'},empresa:{lbl:'Empresa'},
  conductor:{lbl:'Conductor'},hall:{lbl:'Hall / Pabellón'},stand:{lbl:'Stand'},
  llamador:{lbl:'Llamador'},referencia:{lbl:'Referencia'},entrada:{lbl:'Hora entrada'},
  operador:{lbl:'Operador'},puerta:{lbl:'Puerta acceso'},tipoVeh:{lbl:'Tipo vehículo'},
  telefono:{lbl:'Teléfono'},comentario:{lbl:'Comentario'},evento:{lbl:'Nombre evento'},
};

async function _getPrintCfg(tipo){
  const ev=AppState.get('currentEvent');
  if(!ev?.id) return _defCfg(tipo);
  try{
    const db=getDB();
    const{doc,getDoc}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDoc(doc(db,'events',ev.id,'config','print'));
    if(snap.exists()){const d=snap.data();return d[tipo==='referencia'?'ref':'ing']||_defCfg(tipo);}
  }catch{}
  return _defCfg(tipo);
}

function _defCfg(tipo){
  return{
    papel:'A6L',titulo:tipo==='referencia'?'PASE REFERENCIA':'PASE DE ENTRADA',
    logo:true,qr:true,copias:1,
    campos:tipo==='referencia'
      ?['referencia','matricula','empresa','conductor','hall','stand','entrada','operador']
      :['matricula','remolque','empresa','conductor','hall','stand','referencia','entrada'],
  };
}

export async function printEntry(entry, evNombre){
  const tipo=entry.tipo==='referencia'?'referencia':'ing';
  const cfg=await _getPrintCfg(tipo);
  _openPrintWindow(entry, cfg, evNombre);
}

function _openPrintWindow(entry, cfg, evNombre){
  const papel=_papeles[cfg.papel]||_papeles['A6L'];
  const campos=(cfg.campos||[]).filter(c=>CAMPOS_DEF[c]);
  const data={
    matricula:entry.matricula||'—',remolque:entry.remolque||'—',
    empresa:entry.empresa||'—',conductor:entry.conductor||((entry.nombre||'')+(entry.apellido?' '+entry.apellido:'')).trim()||'—',
    hall:entry.hall||(entry.halls||[])[0]||'—',stand:entry.stand||'—',
    llamador:entry.llamador||'—',referencia:entry.referencia||'—',
    entrada:formatDateTime(entry.ts||entry.entrada),
    operador:entry.operador||'—',puerta:entry.puerta||entry.gateId||'—',
    tipoVeh:entry.tipo||entry.tipoVehiculo||'—',telefono:entry.telefono||'—',
    comentario:entry.comentario||'—',evento:evNombre||'—',
  };
  const copias=cfg.copias||1;
  const w=window.open('','_blank',`width=${papel.w*3+100},height=${papel.h*3+100},menubar=no,toolbar=no`);
  if(!w){alert('Activa ventanas emergentes para imprimir');return;}
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${safeHtml(cfg.titulo||'Pase')}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:${papel.w}mm ${papel.h}mm;margin:0}
body{font-family:'Inter',sans-serif;background:#f0f2f8;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:100vh;padding:16px;gap:12px}
.page{width:${papel.w}mm;height:${papel.h}mm;background:#fff;border:1px solid #e0e0e0;box-shadow:0 4px 16px rgba(0,0,0,.1);padding:${papel.w<100?'4':'6'}mm;display:flex;flex-direction:column;position:relative;break-after:page}
.header{display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #0f172a;padding-bottom:${papel.w<100?'2':'3'}mm;margin-bottom:${papel.w<100?'2':'3'}mm}
.logo-row{display:flex;align-items:center;gap:5px}
.logo-box{width:18px;height:18px;background:#030812;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.logo-dot{width:8px;height:8px;border-radius:50%;background:#00ffc8}
.title{font-size:${papel.w<100?'8':'10'}pt;font-weight:900;color:#0f172a;letter-spacing:-.01em;text-transform:uppercase}
.mat-big{font-family:'JetBrains Mono',monospace;font-size:${papel.w<100?'16':'20'}pt;font-weight:900;color:#0f172a;letter-spacing:2px;line-height:1}
.campo{display:flex;justify-content:space-between;align-items:center;padding:${papel.w<100?'1.2':'1.8'}px 0;border-bottom:.5px solid #f0f0f0;gap:6px}
.campo-lbl{color:#6b7280;font-weight:700;text-transform:uppercase;font-size:${papel.w<100?'6':'7'}pt;letter-spacing:.04em;flex-shrink:0}
.campo-val{color:#0f172a;font-weight:700;font-size:${papel.w<100?'7.5':'9'}pt;text-align:right;word-break:break-word;max-width:65%}
.campo-val.mono{font-family:'JetBrains Mono',monospace;letter-spacing:.5px}
.qr-box{position:absolute;bottom:${papel.w<100?'4':'5'}mm;right:${papel.w<100?'4':'5'}mm;width:${papel.w<100?'14':'18'}mm;height:${papel.w<100?'14':'18'}mm;border:2px solid #0f172a;display:flex;align-items:center;justify-content:center;font-size:6pt;font-weight:700;color:#0f172a;text-align:center;line-height:1.2}
.footer{margin-top:auto;padding-top:3px;font-size:5.5pt;color:#94a3b8;border-top:.5px solid #e0e0e0;display:flex;justify-content:space-between}
.btn-row{display:flex;gap:8px;margin-bottom:8px}
.btn{padding:8px 20px;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}
@media print{body{background:#fff;padding:0}.btn-row{display:none}.page{box-shadow:none;border:none;margin:0}}
</style></head><body>
<div class="btn-row">
  <button class="btn" style="background:#0f172a;color:#fff" onclick="window.print()">🖨 Imprimir</button>
  <button class="btn" style="background:#f0f2f8;color:#0f172a;border:1px solid #e0e0e0" onclick="window.close()">✕ Cerrar</button>
</div>
${Array(copias).fill('').map(()=>`
<div class="page">
  <div class="header">
    <div>
      ${cfg.logo?`<div class="logo-row"><div class="logo-box"><div class="logo-dot"></div></div><span style="font-size:7pt;font-weight:900;color:#64748b;letter-spacing:-.02em">BeUnify<span style="font-weight:400">T</span></span></div>`:''}
      <div class="title">${safeHtml(cfg.titulo||'PASE')}</div>
    </div>
    <div class="mat-big">${safeHtml(data.matricula)}</div>
  </div>
  ${campos.filter(c=>c!=='matricula').map(c=>`
  <div class="campo">
    <span class="campo-lbl">${CAMPOS_DEF[c]?.lbl||c}</span>
    <span class="campo-val${['matricula','referencia','remolque'].includes(c)?' mono':''}">${safeHtml(data[c]||'—')}</span>
  </div>`).join('')}
  ${cfg.qr?`<div class="qr-box">QR<br><span style="font-size:5pt">${safeHtml(data.matricula)}</span></div>`:''}
  <div class="footer">
    <span>${safeHtml(data.evento)}</span>
    <span>${new Date().toLocaleDateString('es-ES')}</span>
  </div>
</div>`).join('')}
</body></html>`);
  w.document.close();
  setTimeout(()=>{ try{w.focus();w.print();}catch{} },800);
}

const _papeles={
  A6L:{w:148,h:105},A6P:{w:105,h:148},
  A5L:{w:210,h:148},A5P:{w:148,h:210},
  A4L:{w:297,h:210},A4P:{w:210,h:297},
  ticket:{w:80,h:200},tira:{w:99,h:210},
};

export async function exportToExcel(items, filename){
  if(!window.XLSX){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload=res;s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  const wb=window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(
    items.map(i=>({
      Pos:i.pos||'',Matricula:i.matricula||'',Remolque:i.remolque||'',
      Llamador:i.llamador||'',Referencia:i.referencia||'',
      Nombre:i.nombre||'',Apellido:i.apellido||'',Empresa:i.empresa||'',
      Hall:i.hall||(i.halls||[]).join('/')||'',Stand:i.stand||'',
      Montador:i.montador||'',Expositor:i.expositor||'',
      Telefono:i.telefono||'',Email:i.email||'',
      Idioma:i.idioma||'',Comentario:i.comentario||'',
      Entrada:formatDateTime(i.ts||i.entrada),
      Salida:i.salida?formatDateTime(i.salida):'En recinto',
      Operador:i.operador||'',Evento:i.eventoNombre||'',
    }))
  ),filename.slice(0,31));
  window.XLSX.writeFile(wb,`${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
}
