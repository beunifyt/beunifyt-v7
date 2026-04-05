// BeUnifyT v8 — tabs/agenda.js — Agenda
import { DB, iF, SID, registerFn, callFn, agF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, TV, PP } from '../core/shared.js';
import { isSA, isSup, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, vaciarTab, marcarAgLlegado, marcarAgSalida, askDelAg, registrarPasoTrackingAg } from '../core/db.js';
import { toast, uid, nowLocal } from '../utils.js';
import { renderCamposSubtab } from '../core/fields.js';

export function renderAgenda() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const today = new Date().toISOString().slice(0,10);
  const nowT = new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  let items = [...DB.agenda];
  const tabEv = getTabEvent('agenda');
  if (tabEv) items = items.filter(a => !a.eventoId || a.eventoId === tabEv.id);
  if (agF.desde) items = items.filter(a => a.fecha >= agF.desde);
  if (agF.hasta) items = items.filter(a => a.fecha <= agF.hasta);
  if (agF.hall) items = items.filter(a => a.hall === agF.hall);
  const q = (agF.q||'').toLowerCase();
  if (q) items = items.filter(a => `${a.matricula} ${a.conductor||''} ${a.empresa||''} ${a.referencia||''} ${a.hall||''}`.toLowerCase().includes(q));
  items = items.map(a => (a.estado==='PENDIENTE' && a.hora && a.hora < nowT && a.fecha === today) ? {...a,_late:true} : a);
  const sa = getSort('agenda'); items = sortArr(items, sa.col||'hora', sa.dir||'asc');
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <span style="flex:1"></span>
      ${canAdd()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="openAgendaModal()">+ Cita</button>':''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById('xlsAg')?.click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="dlTemplateAg()">📋 Plantilla</button>
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportAgenda()">⬇ Excel</button>':''}
      ${canClean()?'<button class="btn btn-sm" onclick="cleanTab(\'agenda\')">🗑 Limpiar</button>':''}
      ${isSA()?'<button class="btn btn-danger btn-sm" onclick="vaciarTab(\'agenda\')">💥 Vaciar</button>':''}
      <input type="file" id="xlsAg" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._op.importExcel?.(this,'agenda')">
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, conductor, empresa..." value="${agF.q||''}" oninput="agF.q=this.value;debounceSearch('agenda',renderAgenda)"></div>
      <input type="date" value="${agF.desde||''}" oninput="agF.desde=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Desde">
      <input type="date" value="${agF.hasta||''}" oninput="agF.hasta=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Hasta">
      ${agF.q||agF.hall||agF.desde||agF.hasta?'<span class="pill pill-r" onclick="agF.q=\'\';agF.hall=\'\';agF.desde=\'\';agF.hasta=\'\';renderAgenda()">✕</span>':''}
      <span style="font-size:10px;color:var(--text3)">${items.length} citas</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!agF.hall?'#7dd3fc':'#93c5fd'};background:${!agF.hall?'#e0f2fe':'#dbeafe'};color:${!agF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="agF.hall='';renderAgenda()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${agF.hall===h?'#3b82f6':'#dbeafe'};color:${agF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${agF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="agF.hall='${h}';renderAgenda()">${h}</span>`).join('')}
    </div>
    ${items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('agenda','estado','Estado')}${thSort('agenda','hora','Hora P.')}${thSort('agenda','horaReal','H. Real')}<th>Dif.</th>${thSort('agenda','matricula','Matrícula')}${thSort('agenda','conductor','Conductor')}${thSort('agenda','empresa','Empresa')}<th>Hall</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(a => {const d=a.horaReal?diffMins(a.hora,a.horaReal):null;return`<tr style="${a._late?'background:var(--rll)':''}">
        <td>${sAgBadge(a.estado||'PENDIENTE')}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${a.hora||'–'}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${a.horaReal||'–'}</td>
        <td><span style="font-size:11px">${a.horaReal?diffLabel(d):'–'}</span></td>
        <td><span class="mchip" onclick="showAgDetalle('${a.id}')">${a.matricula}</span></td>
        <td style="font-size:11px"><b>${a.conductor||'–'}</b></td>
        <td style="font-size:11px">${a.empresa||'–'}</td>
        <td>${hBadge(a.hall)}</td>
        <td><div style="display:flex;gap:2px">
          ${canStatus()&&a.estado!=='LLEGADO'&&a.estado!=='SALIDA'?`<button class="btn btn-success btn-xs" onclick="marcarAgLlegado('${a.id}')">✅</button>`:''}
          ${canStatus()&&a.estado==='LLEGADO'?`<button class="btn btn-edit btn-xs" onclick="marcarAgSalida('${a.id}')">🔵</button>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openAgendaModal(DB.agenda.find(x=>x.id==='${a.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelAg('${a.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>` : '<div class="empty"><div class="ei">📅</div><div class="et">Sin citas</div></div>'}`;
}

registerFn('renderAgenda', renderAgenda);
window.renderAgenda = renderAgenda;
