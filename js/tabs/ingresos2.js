// BeUnifyT v8 — tabs/ingresos2.js — Ingresos (sin referencia)
import { DB, iF, registerFn, callFn } from '../core/context.js';
import { esc, fmt, hBadge, telLink, thSort, getSort, sortArr, getRecintoHalls, getTabEvent, debounceSearch } from '../core/shared.js';
import { canEdit, canAdd, canDel, canClean, canExport, canImport, canStatus, canCampos, isSA } from '../auth.js';

export function renderIngresos2() {
  const today=new Date().toISOString().slice(0,10);
  let items=[...DB.ingresos2||[]];
  const aEvIds=(DB.activeEventIds&&DB.activeEventIds.length)?DB.activeEventIds:(DB.activeEventId?[DB.activeEventId]:[]);
  if(aEvIds.length)items=items.filter(i=>!i.eventoId||aEvIds.includes(i.eventoId));
  const q=(iF.q2||'').toLowerCase();
  if(q)items=items.filter(i=>`${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.comentario||''} ${i.telefono||''} ${i.eventoNombre||''}`.toLowerCase().includes(q));
  if(iF.hall2)items=items.filter(i=>(i.halls||[i.hall||'']).includes(iF.hall2));
  if(iF.activos2)items=items.filter(i=>!i.salida);
  const s=getSort('ingresos2');items=sortArr(items,s.col||'pos',s.dir||'desc');
  const sub2=iF._sub2||'lista';
  document.getElementById('tabContent').innerHTML=`
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(canCampos()?[['campos','⚙ Campos']]:[])]
        .map(([s,l])=>`<button class="btn btn-sm ${sub2===s?'btn-p':'btn-gh'}" onclick="iF['_sub2']='${s}';renderIngresos2()">${l}</button>`).join('')}
      <span style="flex:1"></span>
      ${canAdd()&&sub2!=='campos'?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="_ingSource='ingresos2';openIngModal()">+ Ingreso</button>`:''}
      ${sub2!=='historial'&&sub2!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" onclick="exportIngresos2()">⬇ Excel</button>`:''}
      ${sub2!=='historial'&&sub2!=='campos'&&canClean()?`<button class="btn btn-sm" onclick="cleanTab('ingresos2')">🗑 Limpiar</button>`:''}
    </div>
    ${sub2!=='historial'&&sub2!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, nombre..." value="${iF.q2||''}" oninput="iF.q2=this.value;debounceSearch('ingresos2',renderIngresos2)"></div>
      <span class="pill" style="border:1.5px solid ${iF.activos2?'var(--blue)':'var(--border)'};background:${iF.activos2?'var(--blue)':'var(--bg2)'};color:${iF.activos2?'#fff':'var(--text3)'}" onclick="iF.activos2=!iF.activos2;renderIngresos2()">Solo activos</span>
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>`:''}
    ${sub2==='lista'?`${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      ${thSort('ingresos2','pos','#')}${thSort('ingresos2','matricula','Matrícula')}${thSort('ingresos2','nombre','Conductor/Empresa')}${thSort('ingresos2','telefono','Tel.')}<th>Hall</th>${thSort('ingresos2','salida','Estado')}${thSort('ingresos2','entrada','Entrada')}<th>Acc.</th>
    </tr></thead><tbody>
      ${items.map(i=>`<tr>
        <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
        <td><span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}','ingresos2')">${i.matricula}</span></td>
        <td><b style="font-size:12px">${i.nombre||''} ${i.apellido||''}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${i.empresa}</span>`:''}</td>
        <td>${telLink(i.telPais||'',i.telefono||'')}</td>
        <td>${(i.halls||[i.hall||'']).filter(Boolean).map(h=>hBadge(h)).join(' ')||'–'}</td>
        <td>${!i.salida?'<span class="pill pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida,'t')}</span>`}</td>
        <td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          <button class="btn btn-gh btn-xs" onclick="printIngreso2('${i.id}')">🖨</button>
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openIngModal2(DB.ingresos2.find(x=>x.id==='${i.id}'))">✏️</button>`:''}
          ${!i.salida&&canStatus()?`<button class="btn btn-warning btn-xs" onclick="marcarSalidaIng2('${i.id}')">↩ Salida</button>`:''}
          ${i.salida&&canStatus()?`<button class="btn btn-success btn-xs" onclick="reactivarIngreso2('${i.id}')">↺</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelIng2('${i.id}')">🗑</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">Sin ingresos registrados</div></div>`}`:''}
    ${sub2!=='lista'?(sub2==='listanegra'?callFn('_ingLN'):sub2==='historial'?callFn('_ingHistorial','ingresos2'):sub2==='campos'?callFn('renderCamposSubtab','ingresos2'):''):''}`;
}

registerFn('renderIngresos2', renderIngresos2);
window.renderIngresos2 = renderIngresos2;
