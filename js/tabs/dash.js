// BeUnifyT v8 — tabs/dash.js — Dashboard
import { AppState } from '../state.js';
import { DB, iF, SID, registerFn, callFn } from '../core/context.js';
import { esc, fmt, hBadge, getActiveEvent } from '../core/shared.js';

let _dashEvFilter = null;
window._dashEvFilter = _dashEvFilter;

export function renderDash() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const userName = AppState.get('currentUser')?.nombre || '';
  const ev = DB.activeEventId ? DB.eventos.find(e => e.id === DB.activeEventId) : null;
  if (_dashEvFilter === null && ev) _dashEvFilter = ev.id;
  const selEv = _dashEvFilter ? DB.eventos.find(e => e.id === _dashEvFilter) : null;
  const allIngs = [...DB.ingresos, ...DB.ingresos2];
  const ings = selEv ? allIngs.filter(i => i.eventoId === selEv.id) : allIngs;
  const rIngs = selEv ? DB.ingresos.filter(i => i.eventoId === selEv.id) : DB.ingresos;
  const iIngs = selEv ? DB.ingresos2.filter(i => i.eventoId === selEv.id) : DB.ingresos2;
  const last7 = []; for (let d = 6; d >= 0; d--) { const dt = new Date(); dt.setDate(dt.getDate() - d); last7.push(dt.toISOString().slice(0, 10)); }
  const byDay = last7.map(d => ({ d, nRef: rIngs.filter(i => i.entrada?.startsWith(d)).length, nIng: iIngs.filter(i => i.entrada?.startsWith(d)).length }));
  const maxDay = Math.max(...byDay.map(x => x.nRef + x.nIng), 1);
  const enRec = ings.filter(i => !i.salida).length;
  const hoyRef = rIngs.filter(i => i.entrada?.startsWith(today)).length;
  const hoyIng = iIngs.filter(i => i.entrada?.startsWith(today)).length;
  const agHoy = DB.agenda.filter(a => a.fecha === today && (!selEv || a.eventoId === selEv.id));
  const msgs = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID)).length;
  const lastIngs = [...ings].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||'')).slice(0, 15);
  const totalRef = rIngs.length, totalIng = iIngs.length, totalBoth = totalRef + totalIng;
  const pctRef = totalBoth ? Math.round(totalRef / totalBoth * 100) : 50;
  const hallC = {}; ings.forEach(i => (i.halls||[i.hall||'']).filter(Boolean).forEach(h => { hallC[h] = (hallC[h]||0)+1; }));
  const topH = Object.entries(hallC).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxHall = topH.length ? topH[0][1] : 1;

  let h = '';
  const allEvs = DB.eventos.filter(e => DB.activeEventId ? e.id === DB.activeEventId : true);
  if (allEvs.length > 1) {
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    allEvs.forEach(e => { h += `<button class="btn btn-xs ${_dashEvFilter===e.id?'btn-p':'btn-gh'}" onclick="window._dashEvFilter='${e.id}';window._op.renderDash()">${e.ico||'📋'} ${esc(e.nombre)}</button>`; });
    h += `<button class="btn btn-xs ${!_dashEvFilter?'btn-p':'btn-gh'}" onclick="window._dashEvFilter=null;window._op.renderDash()">🌐 Todos</button></div>`;
  }
  h += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:14px 18px;background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:var(--r2);color:#fff">
    <div><div style="font-size:18px;font-weight:800">${greeting}, ${esc(userName.split(' ')[0])}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px">${selEv ? esc(selEv.ico||'') + ' ' + esc(selEv.nombre) : 'Sin evento activo'} · ${now.toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</div></div>
    <span style="flex:1"></span>
    <div style="text-align:right"><div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:900">${String(hour).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}</div></div>
  </div>`;
  const statCard = (n, l, color, icon) => `<div class="stat-box" style="border-top:3px solid ${color};display:flex;align-items:center;gap:8px"><div style="flex-shrink:0;color:${color}">${icon}</div><div><div class="stat-n" style="color:${color}">${n}</div><div class="stat-l">${l}</div></div></div>`;
  h += '<div class="sg sg6" style="margin-bottom:8px">';
  h += statCard(enRec, 'En recinto', 'var(--green)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>');
  h += statCard(rIngs.length, 'Referencias', 'var(--blue)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>');
  h += statCard(iIngs.length, 'Ingresos', 'var(--teal)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>');
  h += statCard(hoyRef + hoyIng, 'Hoy', '#00b89a', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>');
  h += statCard(agHoy.length, 'Agenda hoy', 'var(--amber)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>');
  h += statCard(msgs || 0, 'Mensajes', msgs ? 'var(--red)' : 'var(--border2)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>');
  h += '</div>';
  h += '<div class="sg sg3" style="margin-bottom:8px">';
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📊 Ingresos últimos 7 días</div>';
  byDay.forEach(x => {
    h += `<div class="bar-row"><span style="font-size:9px;min-width:38px;color:var(--text3)">${x.d.slice(5)}</span><div style="flex:1">`;
    h += `<div style="display:flex;align-items:center;gap:2px;margin-bottom:2px"><div style="height:5px;border-radius:2px;background:var(--blue);width:${Math.round(x.nRef/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nRef}</span></div>`;
    h += `<div style="display:flex;align-items:center;gap:2px"><div style="height:5px;border-radius:2px;background:var(--green);width:${Math.round(x.nIng/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nIng}</span></div>`;
    h += '</div></div>';
  });
  h += '</div>';
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🔄 Ref vs Ing <span style="color:var(--blue)">${totalRef}</span> / <span style="color:var(--green)">${totalIng}</span></div>`;
  h += `<div style="height:12px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px"><div style="background:var(--blue);width:${pctRef}%"></div><div style="background:var(--green);flex:1"></div></div>`;
  h += '<div style="display:flex;gap:6px"><div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--blue);font-size:20px">${hoyRef}</div><div class="stat-l">🔖 HOY REF</div></div>`;
  h += '<div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--green);font-size:20px">${hoyIng}</div><div class="stat-l">🚛 HOY ING</div></div></div></div>`;
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏭 Halls más activos</div>';
  if (topH.length) { topH.forEach(kv => { h += `<div class="bar-row"><span style="font-size:11px;min-width:28px;font-weight:700">${esc(kv[0])}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(kv[1]/maxHall*100)}%;background:#00896b"></div></div><span class="bar-val">${kv[1]}</span></div>`; }); }
  else h += '<div class="empty" style="padding:12px"><div class="es">Sin datos de hall</div></div>';
  h += '</div></div>';
  h += '<div class="sg sg2">';
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📅 Agenda hoy (${agHoy.length})</div>`;
  if (agHoy.length) {
    agHoy.slice(0, 6).forEach(a => {
      h += `<div style="display:flex;align-items:center;gap:4px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">`;
      h += `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;min-width:36px">${a.hora||'--:--'}</span>`;
      h += `<span class="mchip-sm">${esc(a.matricula||'—')}</span>`;
      h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px">${esc(a.empresa||a.conductor||'–')}</span>`;
      h += `<span class="${a.estado==='HECHO'?'ag-done':a.estado==='CANCELADO'?'ag-canc':'ag-pend'}">${a.estado||'PENDIENTE'}</span></div>`;
    });
  } else h += '<div class="empty" style="padding:12px"><div class="es">Sin citas hoy</div></div>';
  h += `<button class="btn btn-p btn-sm" style="margin-top:8px;width:100%" onclick="window._op.goTab('agenda')">Ver agenda →</button></div>`;
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🕐 Últimos ingresos</div>';
  if (lastIngs.length) {
    h += '<div class="tbl-wrap" style="max-height:260px;overflow-y:auto"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Empresa</th><th>Hall</th><th>Hora</th></tr></thead><tbody>';
    lastIngs.forEach(i => {
      h += `<tr><td><span class="mchip" style="font-size:10px">${esc(i.matricula)}</span></td><td style="font-size:10px">${esc(i.empresa||'–')}</td><td><span class="h-badge">${esc(i.hall||i.halls?.[0]||'–')}</span></td><td style="font-size:10px">${fmt(i.entrada,'t')}</td></tr>`;
    });
    h += '</tbody></table></div>';
  } else h += '<div class="empty" style="padding:12px"><div class="es">Sin ingresos registrados</div></div>';
  h += '</div></div>';
  if (msgs) h += `<div style="margin-top:10px;background:var(--rll);border:1.5px solid #fecaca;border-radius:var(--r2);padding:10px 14px;display:flex;align-items:center;gap:10px"><b>📢 ${msgs} mensaje(s) sin leer</b><button class="btn btn-gh btn-sm" onclick="window._op.goTab('mensajes')">Ver</button></div>`;
  el.innerHTML = h;
}

registerFn('renderDash', renderDash);
