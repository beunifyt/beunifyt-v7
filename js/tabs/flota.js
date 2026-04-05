// BeUnifyT v8 — tabs/flota.js — Embalaje
import { DB, iF, SID, registerFn, callFn, agF, fF, cF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, askDel, _modal, gv, logAudit, logExport, _getCU, tr, SCFG, CCFG, TV, PP, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, saveDBNow, softDelete, _saveOne, _getCol, _nextPos, exportExcel, importExcel, vaciarTab, vaciarHistorial, activarEvento, desactivarEvento, seleccionarEventoTrabajo, restaurar, vaciarPapelera, exportAuditLog, marcarAgLlegado, marcarAgSalida, cambiarEstMov, marcarMsgLeido, eliminar } from '../core/db.js';
import { toast, uid, nowLocal, normPlate } from '../utils.js';
import { AppState } from '../state.js';
import { renderCamposSubtab } from '../core/fields.js';
import { DEFAULT_TABS } from '../core/shell.js';

export function renderFlota() {
  const now=new Date();let items=[...DB.movimientos];
  const q=(fF.q||'').toLowerCase();if(q)items=items.filter(m=>`${m.matricula} ${m.nombre||''} ${m.empresa||''} ${m.hall||''} ${m.remolque||''} ${m.status||''}`.toLowerCase().includes(q));
  if(fF.status)items=items.filter(m=>m.status===fF.status);if(fF.hall)items=items.filter(m=>m.hall===fF.hall);
  const sf=getSort('flota');items=sf.col?sortArr(items,sf.col,sf.dir):items.sort((a,b)=>(a.posicion||999)-(b.posicion||999));
  document.getElementById('tabContent').innerHTML=`
    <div class="sg sg4" style="margin-bottom:4px">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<div class="stat-box" style="border-top:3px solid ${SCFG[s]?.c||'var(--border)'}"><div class="stat-n" style="color:${SCFG[s]?.c||'var(--text)'}">${DB.movimientos.filter(m=>m.status===s).length}</div><div class="stat-l">${SCFG[s]?.i||''} ${s}</div></div>`).join('')}</div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:2;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${fF.q||''}" oninput="fF.q=this.value;debounceSearch('flota',renderFlota)"></div>
      ${fF.q||fF.hall?`<span class="pill pill-r" style="flex-shrink:0" onclick="fF.q='';fF.status='';fF.hall='';renderFlota()">✕</span>`:''}
      <span style="flex:1"></span>
      ${canAdd()?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="openMovModal()">+ Movimiento</button>`:''}
      ${canExport()?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="exportFlota()">⬇ Excel</button>`:''}
      ${isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('movimientos')">💥 Vaciar</button>`:''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!fF.hall?'#7dd3fc':'#93c5fd'};background:${!fF.hall?'#e0f2fe':'#dbeafe'};color:${!fF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="fF.hall='';renderFlota()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${fF.hall===h?'#3b82f6':'#dbeafe'};color:${fF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${fF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="fF.hall='${h}';renderFlota()">${h}</span>`).join('')}
    </div>
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('flota','posicion','#')}${thSort('flota','matricula','Tractora')}<th>Remolque</th>${thSort('flota','nombre','Conductor')}${thSort('flota','empresa','Empresa')}<th>Hall</th><th>Carga</th>${thSort('flota','status','Estado')}<th>Acc.</th></tr></thead><tbody>
      ${items.map(m=>{return`<tr>
        <td style="font-weight:800">${m.posicion||'–'}</td><td><span class="mchip">${m.matricula}</span></td>
        <td>${m.remolque?`<span class="mchip-sm">${m.remolque}</span>`:'-'}</td>
        <td style="font-size:11px">${m.nombre||''} ${m.apellido||''}</td>
        <td style="font-size:11px">${m.empresa||'–'}</td><td>${hBadge(m.hall)}</td><td>${cBadge(m.tipoCarga)}</td>
        <td>${sBadge(m.status)}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          ${canStatus()?`<select style="padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--border);max-width:90px" onchange="cambiarEstMov('${m.id}',this.value)">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<option value="${s}" ${m.status===s?'selected':''}>${s}</option>`).join('')}</select>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openMovModal(DB.movimientos.find(x=>x.id==='${m.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelMov('${m.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">Sin movimientos</div></div>`}`;
}

registerFn('renderFlota', renderFlota);
window.renderFlota = renderFlota;
