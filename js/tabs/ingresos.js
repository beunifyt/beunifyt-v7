// BeUnifyT v8 — tabs/ingresos.js — Referencia
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { isSA, isSup, canEdit, canAdd, canDel, canClean, canExport, canImport, canStatus, canSpecial, canCampos } from '../auth.js';
import { DB, iF, SID, _autoFillOn, _posAutoOn, registerFn, callFn } from '../core/context.js';
import { esc, fmt, hBadge, telLink, thSort, getSort, sortArr, getRecintoHalls, getActiveEvent, getTabEvent, debounceSearch, tr, checkBL, _modal, gv } from '../core/shared.js';
import { saveIngreso, _getCol, _nextPos, softDelete, saveDB, marcarSalidaIng, reactivarIngreso, askDelIng } from '../core/db.js';

let _ingSource = 'ingresos';
window._ingSource = _ingSource;

export function renderIngresos() {
  const today = new Date().toISOString().slice(0, 10);
  let items = [...DB.ingresos];
  if (DB.activeEventId) items = items.filter(i => !i.eventoId || i.eventoId === DB.activeEventId);
  const q = (iF.q || '').toLowerCase();
  if (q) items = items.filter(i => `${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.montador||''} ${i.expositor||''} ${i.comentario||''} ${i.telefono||''} ${i.email||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.puertaHall||''} ${i.tipoCarga||''}`.toLowerCase().includes(q));
  if (iF.fecha) items = items.filter(i => i.entrada?.startsWith(iF.fecha));
  if (iF.hall) items = items.filter(i => i.hall === iF.hall || ((i.halls||[]).includes(iF.hall)));
  if (iF.activos) items = items.filter(i => !i.salida);
  items = items.sort((a,b) => (b.entrada||'').localeCompare(a.entrada||''));
  const sub = iF._sub || 'lista';
  document.getElementById('tabContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(canCampos()?[['campos','⚙ Campos']]:[])]
        .map(([s,l]) => `<button class="btn btn-sm ${sub===s?'btn-p':'btn-gh'}" onclick="iF._sub='${s}';renderIngresos()">${l}</button>`).join('')}
      <span style="flex:1"></span>
      ${canAdd()&&sub!=='campos'?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="_ingSource='ingresos';openIngModal()">+ Referencia</button><button class="btn btn-sm btn-gh" onclick="toggleAutoFill()" style="flex-shrink:0;border-radius:20px">⚡ ${_autoFillOn?'ON':'OFF'}</button><button class="btn btn-sm btn-gh" onclick="togglePosAuto()" style="flex-shrink:0;border-radius:20px">🔢 ${_posAutoOn?'ON':'OFF'}</button>`:''}
      ${sub!=='historial'&&sub!=='campos'?`<button class="btn btn-s btn-sm" onclick="if(!canImport()){toast('Sin permiso para importar','var(--red)');return;}document.getElementById('xlsxIng').click()">📥 Importar</button><button class="btn btn-gh btn-sm" onclick="dlTemplateIng()">📋 Plantilla</button>`:''}
      ${sub!=='historial'&&sub!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" onclick="exportIngresos()">⬇ Excel</button>`:''}
      ${sub!=='historial'&&sub!=='campos'&&canClean()?`<button class="btn btn-sm" onclick="cleanTab('ingresos')">🗑 Limpiar</button>`:''} ${sub!=='historial'&&isSA()?`<button class="btn btn-danger btn-sm" onclick="vaciarTab('ingresos')">💥 Vaciar</button>`:''}
    </div>
    ${sub!=='historial'&&sub!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Pos, matrícula, nombre..." value="${iF.q||''}" id="srch-ingresos" oninput="iF.q=this.value;debounceSearch('ingresos',renderIngresos)"></div>
      <input type="date" value="${iF.fecha||''}" oninput="iF.fecha=this.value;debounceSearch('ingresos-date',renderIngresos)" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px">
      <span class="pill" style="border:1.5px solid ${iF.activos?'var(--blue)':'var(--border)'};background:${iF.activos?'var(--blue)':'var(--bg2)'};color:${iF.activos?'#fff':'var(--text3)'}" onclick="iF.activos=!iF.activos;renderIngresos()">Solo activos</span>
      ${iF.q||iF.fecha||iF.hall||iF.activos?`<span class="pill pill-r" onclick="iF.q='';iF.fecha='';iF.hall='';iF.activos=false;iF._sub=iF._sub||'lista';renderIngresos()">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!iF.hall?'#7dd3fc':'#93c5fd'};background:${!iF.hall?'#e0f2fe':'#dbeafe'};color:${!iF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="iF.hall='';renderIngresos()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${iF.hall===h?'#3b82f6':'#dbeafe'};color:${iF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${iF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="iF.hall='${h}';renderIngresos()">${h}</span>`).join('')}
    </div>`:''}
    ${sub==='lista'?_ingLista(items):sub==='listanegra'?callFn('_ingLN'):sub==='historial'?callFn('_ingHistorial','ingresos'):sub==='campos'?callFn('renderCamposSubtab','ingresos'):_ingLista(items)}`;
}

function _ingLista(items) {
  const s = getSort('ingresos');
  items = sortArr(items, s.col||'pos', s.dir||'desc');
  return `${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('ingresos','pos','#')}${thSort('ingresos','matricula','Matrícula')}${thSort('ingresos','llamador','Llamador')}${thSort('ingresos','referencia','Ref')}${thSort('ingresos','nombre','Conductor/Empresa')}${thSort('ingresos','telefono','Tel.')}<th>Hall</th><th>Stand</th><th style="font-size:10px">Evento</th>${thSort('ingresos','salida','Estado')}${thSort('ingresos','entrada','Entrada')}<th>Acc.</th></tr></thead><tbody>
    ${items.map(i=>{const _evN=i.eventoNombre||'';const _tev=getTabEvent('ingresos');const _isAlt=_evN&&_tev&&_evN!==_tev.nombre;return`<tr style="${_isAlt?'background:#f0f7ff':''}">
      <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
      <td><span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}')" title="Ver detalle">${i.matricula}</span>${i.remolque?`<br><span class="mchip-sm">${i.remolque}</span>`:''}</td>
      <td style="font-size:11px">${i.llamador||'–'}</td>
      <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${i.referencia||'–'}</td>
      <td><b style="font-size:12px">${i.nombre||''} ${i.apellido||''}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${i.empresa}</span>`:''}</td>
      <td>${telLink(i.telPais||'',i.telefono||'')}</td>
      <td>${(i.halls||[i.hall||'']).filter(Boolean).map(h=>hBadge(h)).join(' ')||'–'}</td><td style="font-size:11px">${i.stand||'–'}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.eventoNombre||''}">${i.eventoNombre?i.eventoNombre.slice(0,12):'–'}</td>
      <td>${!i.salida?'<span class="pill pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida,'t')}</span>`}</td>
      <td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>
      <td><div style="display:flex;gap:2px;flex-wrap:wrap">
        <button class="btn btn-gh btn-xs" onclick="printIngreso('${i.id}')" title="Imprimir Normal">🖨</button>
        <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" title="Imprimir Troquelado A4" onclick="printTrqRef('${i.id}')">✂</button>
        ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="_ingSource='ingresos';openIngModal(DB.ingresos.find(x=>x.id==='${i.id}'))">✏️</button>`:''}
        ${!i.salida&&canStatus()?`<button class="btn btn-warning btn-xs" onclick="marcarSalidaIng('${i.id}')">↩ Salida</button><button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="registrarPasoTracking('${i.id}','ingresos')">📡</button>`:''}
        ${i.salida&&canStatus()?`<button class="btn btn-success btn-xs" onclick="reactivarIngreso('${i.id}')" title="Reactivar / Error salida">↺</button>`:''}
        ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelIng('${i.id}')">🗑</button>`:''}
      </div></td>
    </tr>`;}).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">🚦</div><div class="et">${DB.ingresos.length?'Sin resultados':'Sin ingresos registrados'}</div></div>`}`;
}

registerFn('renderIngresos', renderIngresos);
window.renderIngresos = renderIngresos;
