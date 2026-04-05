// BeUnifyT v8 — tabs/agenda.js — Agenda
import { DB, iF, SID, registerFn, callFn, agF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, tr, TV, PP, SCFG, CCFG, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, marcarAgLlegado, marcarAgSalida, vaciarTab } from '../core/db.js';
import { toast, uid, nowLocal } from '../utils.js';
import { renderCamposSubtab } from '../core/fields.js';

export function renderAgenda(){
  const today=new Date().toISOString().slice(0,10),nowT=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  const _agSub=window._agSubTab||'lista';
  // If print subtab, just render header + print config
  if(_agSub==='print'){
    const dayAll=DB.agenda.filter(a=>a.fecha===today);
    document.getElementById('tabContent').innerHTML=
      '<div class="sec-hdr">'+
      _evSelector('agenda')+
      '<div class="sec-act">'+
      (canAdd()?'<button class="btn btn-p btn-sm" onclick="openAgendaModal()">+ Nueva cita</button><button class="btn btn-sm btn-gh af-toggle-btn" onclick="toggleAutoFill()" style="font-size:11px;padding:5px 9px">⚡ ON</button>':'')+
      '</div></div>'+
      '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+
      '<button class="btn btn-sm btn-gh" onclick="window._agSubTab=\'lista\';renderAgenda()">📋 Lista</button>'+
      '<button class="btn btn-sm btn-p">🖨 Impresión</button>'+
      '</div>'+
      _ingPrintCfg('ag');
    setTimeout(()=>{initPrintLayout('ag');initPcCanvas('ag');},100);
    return;
  }
  let items=[...DB.agenda];
  // Filter by tab event
  const tabEv=getTabEvent('agenda');
  if(tabEv)items=items.filter(a=>!a.eventoId||a.eventoId===tabEv.id||a.eventoNombre===tabEv.nombre);
  if(agF.desde)items=items.filter(a=>a.fecha>=agF.desde);
  if(agF.hasta)items=items.filter(a=>a.fecha<=agF.hasta);
  if(agF.fecha)items=items.filter(a=>a.fecha===agF.fecha);
  if(agF.hall)items=items.filter(a=>a.hall===agF.hall);
  if(agF.estado)items=items.filter(a=>a.estado===agF.estado);
  const q=(agF.q||'').toLowerCase();if(q)items=items.filter(a=>`${a.matricula} ${a.conductor||''} ${a.empresa||''} ${a.referencia||''} ${a.montador||''} ${a.expositor||''} ${a.hall||''} ${a.remolque||''}`.toLowerCase().includes(q));
  if(agF.evento)items=items.filter(a=>(a.eventoNombre||a.empresa||'').toLowerCase().includes(agF.evento.toLowerCase()));
  if(agF.fecha===today)items=items.map(a=>(a.estado==='PENDIENTE'&&a.hora&&a.hora<nowT)?{...a,_late:true}:a);
  const sa=getSort('agenda');items=sortArr(items,sa.col||'hora',sa.dir||'asc');
  const dayAll=DB.agenda.filter(a=>a.fecha===agF.fecha);
  document.getElementById('tabContent').innerHTML=`

    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <button class="btn btn-sm ${_agSub==='lista'?'btn-p':'btn-gh'}" onclick="window._agSubTab='lista';renderAgenda()" style="flex-shrink:0">📋 Lista</button>
      <button class="btn btn-sm ${_agSub==='especial'?'btn-p':'btn-gh'}" onclick="window._agSubTab='especial';renderAgenda()" style="flex-shrink:0">⭐ Especial</button>
      <button class="btn btn-sm ${_agSub==='historial'?'btn-p':'btn-gh'}" onclick="window._agSubTab='historial';renderAgenda()" style="flex-shrink:0">📝 Modificaciones</button>
      ${canCampos()?`<button class="btn btn-sm ${_agSub==='campos'?'btn-p':'btn-gh'}" onclick="window._agSubTab='campos';renderAgenda()" style="flex-shrink:0">⚙ Campos</button>`:''}
      <span style="flex:1;min-width:8px"></span>
      <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:0 6px;flex-shrink:0;border-right:1px solid var(--border);margin-right:2px">
        <span style="color:var(--blue)">${dayAll.length} hoy</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--green)">${dayAll.filter(a=>a.estado==='LLEGADO').length} ✅</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--amber)">${dayAll.filter(a=>a.estado==='PENDIENTE').length} ⏳</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--text3)">${dayAll.filter(a=>a.estado==='SALIDA').length} 🔵</span>
      </span>
      ${_agSub!=='campos'&&canAdd()?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="openAgendaModal()">+ Nueva cita</button>`:''}
      ${_agSub!=='campos'?`<button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="document.getElementById('xlsxAg').click()">📥 Importar</button><button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="dlTemplateAg()">📋 Plantilla</button>`:''}
      ${_agSub!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="exportAgenda()">⬇ Excel</button>`:''}
      ${_agSub!=='campos'&&canClean()?`<button class="btn btn-sm" style="flex-shrink:0" onclick="cleanTab('agenda')">🗑 Limpiar</button>`:''}
      ${_agSub!=='campos'&&isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('agenda')">💥 Vaciar</button>`:''}
    </div>
    ${_agSub==='campos'?renderCamposSubtab('agenda'):''}
    ${_agSub!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, conductor, empresa, hall..." value="${agF.q||''}" oninput="agF.q=this.value;debounceSearch('agenda',renderAgenda)"></div>
      <input type="date" value="${agF.desde||''}" oninput="agF.desde=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Desde">
      <input type="date" value="${agF.hasta||''}" oninput="agF.hasta=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Hasta">
      ${agF.q||agF.hall||agF.estado||agF.desde||agF.hasta?`<span class="pill pill-r" style="flex-shrink:0" onclick="agF={q:'',hall:'',estado:'',evento:'',desde:'',hasta:'',fecha:''};renderAgenda()">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3);flex-shrink:0">${items.length} citas</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!agF.hall?'#7dd3fc':'#93c5fd'};background:${!agF.hall?'#e0f2fe':'#dbeafe'};color:${!agF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="agF.hall='';renderAgenda()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${agF.hall===h?'#3b82f6':'#dbeafe'};color:${agF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${agF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="agF.hall='${h}';renderAgenda()">${h}</span>`).join('')}
    </div>`:''} 
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('agenda','estado','Estado')}${thSort('agenda','hora','Hora P.')}${thSort('agenda','horaReal','Hora R.')}<th>Dif.</th>${thSort('agenda','matricula','Matrícula')}${thSort('agenda','conductor','Conductor')}${thSort('agenda','empresa','Empresa')}<th>Hall</th><th>Extras</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(a=>{const d=a.horaReal?diffMins(a.hora,a.horaReal):null;return`<tr style="${a._late?'background:var(--rll)':''}">
        <td>${sAgBadge(a.estado||'PENDIENTE')}${a._late?'<br><span style="font-size:9px;color:var(--red)">⏰</span>':''}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${a.hora||'–'}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${a.horaReal||'–'}</td>
        <td><span class="${diffClass(d)}" style="font-size:11px">${a.horaReal?diffLabel(d):'–'}</span></td>
        <td><span class="mchip" style="cursor:pointer" onclick="showAgDetalle('${a.id}')">${a.matricula}</span>${a.remolque?`<br><span class="mchip-sm">${a.remolque}</span>`:''}</td>
        <td style="font-size:11px"><b>${a.conductor||'–'}</b>${a.tipoVehiculo?`<br><span style="font-size:10px">${TV[a.tipoVehiculo]||a.tipoVehiculo}</span>`:''}</td>
        <td style="font-size:11px">${a.referencia?`<b style="font-family:'JetBrains Mono',monospace">${a.referencia}</b><br>`:''}<span style="color:var(--text3)">${a.empresa||''}</span>${a.montador?`<br>Mont: ${a.montador}`:''}</td>
        <td>${hBadge(a.hall)}${a.stand?`<br><span style="font-size:10px">Std: ${a.stand}</span>`:''}</td>
        <td style="font-size:10px">${a.gpsUrl?`<a href="${a.gpsUrl}" target="_blank" class="gps-pill">📍</a> `:''}${a.pase?`<span class="pase-pill">${PP[a.pase]||a.pase}</span> `:''}${a.requisitos?.length?`📋${a.requisitos.length}`:''}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          ${canStatus()&&a.estado!=='LLEGADO'&&a.estado!=='SALIDA'?`<button class="btn btn-success btn-xs" onclick="marcarAgLlegado('${a.id}')">✅</button>`:''}
          ${canStatus()&&a.estado==='LLEGADO'?`<button class="btn btn-edit btn-xs" onclick="marcarAgSalida('${a.id}')">🔵</button>`:''}
          <button class="btn btn-gh btn-xs" onclick="printAgendaItem(DB.agenda.find(x=>x.id==='${a.id}'))" title="Imprimir">🖨</button>
          <button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="registrarPasoTrackingAg('${a.id}')">📡</button>
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openAgendaModal(DB.agenda.find(x=>x.id==='${a.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelAg('${a.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>`:`<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">Sin citas registradas</div>`}`;
}


registerFn('renderAgenda', renderAgenda);
window.renderAgenda = renderAgenda;
