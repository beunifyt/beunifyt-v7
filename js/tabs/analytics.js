// BeUnifyT v8 — tabs/analytics.js — Análisis
import { DB, iF, SID, registerFn, callFn, agF } from '../core/context.js';
import { esc, fmt, hBadge, sBadge, sAgBadge, cBadge, thSort, getSort, sortArr, telLink, debounceSearch, getRecintoHalls, getActiveEvent, getTabEvent, diffMins, diffClass, diffLabel, addH, tr, TV, PP, SCFG, CCFG, LANGS_UI } from '../core/shared.js';
import { isSA, isSup, canEdit, canAdd, canDel, canExport, canImport, canClean, canStatus, canCampos } from '../auth.js';
import { saveDB, marcarAgLlegado, marcarAgSalida, vaciarTab } from '../core/db.js';
import { toast, uid, nowLocal } from '../utils.js';
import { renderCamposSubtab } from '../core/fields.js';

if (!window._anlState) window._anlState = { source:'all', chart:'resumen', dateFrom:'', dateTo:'' };

function renderAnalytics() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const S = window._anlState;
  const today = new Date().toISOString().slice(0, 10);

  // Data sources
  const sources = {
    all:       [...DB.ingresos, ...DB.ingresos2, ...(DB.movimientos||[]), ...(DB.agenda||[])],
    ref:       DB.ingresos,
    ing:       DB.ingresos2,
    flota:     DB.movimientos || [],
    agenda:    DB.agenda || [],
    conductores: DB.conductores || [],
  };
  let data = sources[S.source] || sources.all;

  // Date filter
  if (S.dateFrom) data = data.filter(i => (i.entrada||i.ts||'') >= S.dateFrom);
  if (S.dateTo)   data = data.filter(i => (i.entrada||i.ts||'') <= S.dateTo+'T23:59');

  // Auto-export warning
  const autoExportWarn = data.length > 500 ? `<div style="background:var(--all);border:1px solid #fde68a;border-radius:var(--r);padding:6px 10px;font-size:11px;font-weight:600;color:#92400e;margin-bottom:8px">⚠️ +500 registros (${data.length}). <button class="btn btn-gh btn-xs" onclick="window._op._anlExport()">⬇ Auto-exportar Excel con fecha</button></div>` : '';

  // KPIs
  const enRecinto = data.filter(i => !i.salida && i.entrada).length;
  const hoy = data.filter(i => (i.entrada||'').startsWith(today)).length;
  const conSalida = data.filter(i => i.salida).length;

  // Breakdowns
  const _count = (arr, key) => {
    const m = {}; arr.forEach(i => { const v = i[key]; if (v) m[v] = (m[v]||0)+1; });
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  };
  const _timeHist = (arr) => {
    const m = {}; arr.forEach(i => { const d = (i.entrada||i.ts||'').slice(0,10); if (d) m[d]=(m[d]||0)+1; });
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  };
  const _hourHist = (arr) => {
    const m = {}; for(let h=0;h<24;h++) m[String(h).padStart(2,'0')]=0;
    arr.forEach(i => { const t = (i.entrada||i.ts||'').slice(11,13); if (t) m[t]=(m[t]||0)+1; });
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  };
  const _avgTime = (arr) => {
    const times = arr.filter(i=>i.entrada&&i.salida).map(i => new Date(i.salida)-new Date(i.entrada));
    return times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length/60000) : 0;
  };

  const byEmpresa = _count(data, 'empresa').slice(0,10);
  const byTipo    = _count(data, 'tipoVehiculo').slice(0,8);
  const byHall    = _count(data, 'hall').slice(0,8);
  const byStatus  = _count(data, 'status').slice(0,6);
  const byDay     = _timeHist(data);
  const byHour    = _hourHist(data);
  const avgMin    = _avgTime(data);

  const barMax = (arr) => arr.length ? arr[0][1] : 1;
  const barChart = (arr, color, title) => {
    if (!arr.length) return '<div style="padding:8px;text-align:center;font-size:11px;color:var(--text3)">Sin datos</div>';
    const mx = barMax(arr);
    return arr.map(([k,v]) => `<div class="bar-row"><span style="font-size:10px;min-width:70px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${esc(k)}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(v/mx*100)}%;background:${color}"></div></div><span class="bar-val">${v}</span></div>`).join('');
  };
  const sparkLine = (arr, color) => {
    if (arr.length < 2) return '';
    const mx = Math.max(...arr.map(x=>x[1]),1);
    const w = 280, h = 60, step = w/(arr.length-1);
    const pts = arr.map((x,i) => `${i*step},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;display:block"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  };

  // Source selector + date filters
  let h = `${autoExportWarn}
  <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:10px;font-weight:700;color:var(--text3)">FUENTE:</span>
    ${[['all','🌐 Todo'],['ref','🔖 Ref'],['ing','🚛 Ing'],['flota','📦 Embalaje'],['agenda','📅 Agenda'],['conductores','👤 Cond.']].map(([v,l])=>`<button class="btn btn-xs ${S.source===v?'btn-p':'btn-gh'}" onclick="window._anlState.source='${v}';window._op.renderAnalytics()">${l}</button>`).join('')}
    <span style="flex:1"></span>
    <input type="date" value="${S.dateFrom||''}" oninput="window._anlState.dateFrom=this.value;window._op.renderAnalytics()" title="Desde">
    <input type="date" value="${S.dateTo||''}" oninput="window._anlState.dateTo=this.value;window._op.renderAnalytics()" title="Hasta">
    ${S.dateFrom||S.dateTo?`<button class="btn btn-xs btn-gh" onclick="window._anlState.dateFrom='';window._anlState.dateTo='';window._op.renderAnalytics()">✕</button>`:''}
    <button class="btn btn-gh btn-sm" onclick="window._op._anlExport()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
    <button class="btn btn-sm" style="background:#7c3aed;color:#fff;border:none;border-radius:20px" onclick="window._op._anlSmartInsights()">🧠 Insights</button>
  </div>`;

  // KPI cards
  h += `<div class="sg sg4" style="margin-bottom:10px">
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--blue)">${data.length}</div><div class="stat-l">Total registros</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--green)">${enRecinto}</div><div class="stat-l">En recinto</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--teal)">${hoy}</div><div class="stat-l">Hoy</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--amber)">${avgMin}<span style="font-size:11px">m</span></div><div class="stat-l">Prom. estancia</div></div>
  </div>`;

  // Charts grid — Row 1: Trend + Hour distribution
  h += `<div class="sg sg2" style="margin-bottom:10px">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Tendencia diaria</div>${sparkLine(byDay,'#3b82f6')}<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:2px"><span>${byDay[0]?byDay[0][0]:''}</span><span>${byDay.length?byDay[byDay.length-1][0]:''}</span></div></div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🕐 Distribución por hora</div>${barChart(byHour.filter(x=>x[1]>0),'#6366f1','')}</div>
  </div>`;

  // Row 2: Donut vehicle type + Top empresas + Halls
  const donutSVG = (items, colors) => {
    if (!items.length) return '<div style="padding:16px;text-align:center;font-size:11px;color:var(--text3)">Sin datos</div>';
    const total = items.reduce((a,x) => a+x[1], 0);
    const cx=60, cy=60, r=50, r2=30;
    let angle = -90;
    let paths = '';
    const clrs = colors || ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#64748b'];
    items.forEach(([k,v], i) => {
      const pct = v/total;
      const a1 = angle * Math.PI/180;
      angle += pct * 360;
      const a2 = angle * Math.PI/180;
      const large = pct > 0.5 ? 1 : 0;
      const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
      const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
      const x3=cx+r2*Math.cos(a2), y3=cy+r2*Math.sin(a2);
      const x4=cx+r2*Math.cos(a1), y4=cy+r2*Math.sin(a1);
      paths += '<path d="M'+x1+','+y1+' A'+r+','+r+' 0 '+large+' 1 '+x2+','+y2+' L'+x3+','+y3+' A'+r2+','+r2+' 0 '+large+' 0 '+x4+','+y4+' Z" fill="'+clrs[i%clrs.length]+'" opacity="0.85"/>';
    });
    const legend = items.slice(0,6).map(([k,v],i) => '<div style="display:flex;align-items:center;gap:4px;font-size:10px"><div style="width:8px;height:8px;border-radius:2px;background:'+clrs[i%clrs.length]+';flex-shrink:0"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">'+esc(k)+'</span><b>'+v+'</b></div>').join('');
    return '<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 120 120" width="100" height="100">'+paths+'<text x="60" y="58" text-anchor="middle" font-size="16" font-weight="900" fill="var(--text)">'+total+'</text><text x="60" y="72" text-anchor="middle" font-size="8" fill="var(--text3)">total</text></svg><div style="display:flex;flex-direction:column;gap:3px;flex:1">'+legend+'</div></div>';
  };

  // Descarga breakdown
  const descC = {mano:0, maquinaria:0, mixto:0};
  data.forEach(i => { if(i.descargaTipo) descC[i.descargaTipo]=(descC[i.descargaTipo]||0)+1; });
  const descTotal = Object.values(descC).reduce((a,b)=>a+b,0);

  h += `<div class="sg sg3" style="margin-bottom:10px">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🚗 Tipo vehículo</div>${donutSVG(byTipo)}</div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏢 Top empresas</div>${barChart(byEmpresa,'var(--teal)','')}</div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏟 Por Hall</div>${barChart(byHall,'var(--amber)','')}</div>
  </div>`;

  // Row 3: Descarga + Status + Ref vs Ing
  const refData = (sources.ref||[]).filter(i => (!S.dateFrom||(i.entrada||'')>=S.dateFrom) && (!S.dateTo||(i.entrada||'')<=S.dateTo+'T23:59'));
  const ingData = (sources.ing||[]).filter(i => (!S.dateFrom||(i.entrada||'')>=S.dateFrom) && (!S.dateTo||(i.entrada||'')<=S.dateTo+'T23:59'));
  const totalRef=refData.length, totalIng=ingData.length, totalBoth=totalRef+totalIng;
  const pctRef = totalBoth ? Math.round(totalRef/totalBoth*100) : 50;

  h += `<div class="sg sg3">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📦 Tipo descarga</div>
      ${descTotal ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        <div style="text-align:center;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">${descC.mano||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MANUAL</div></div>
        <div style="text-align:center;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--blue)">${descC.maquinaria||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MAQUINARIA</div></div>
        <div style="text-align:center;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--text3)">${descC.mixto||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MIXTO</div></div>
      </div>` : '<div style="padding:12px;text-align:center;font-size:11px;color:var(--text3)">Sin datos</div>'}
    </div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🔄 Ref vs Ing</div>
      <div style="height:14px;border-radius:7px;overflow:hidden;display:flex;margin-bottom:10px"><div style="background:var(--blue);width:${pctRef}%"></div><div style="background:var(--green);flex:1"></div></div>
      <div style="display:flex;gap:8px">
        <div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:8px"><div style="font-size:22px;font-weight:900;color:var(--blue)">${totalRef}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">🔖 REF (${pctRef}%)</div></div>
        <div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:8px"><div style="font-size:22px;font-weight:900;color:var(--green)">${totalIng}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">🚛 ING (${100-pctRef}%)</div></div>
      </div>
    </div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📊 Estado actual</div>${donutSVG([['En recinto',enRecinto],['Con salida',conSalida],['Hoy',hoy]].filter(x=>x[1]>0),['#10b981','#6366f1','#f59e0b'])}</div>
  </div>`;

  el.innerHTML = h;
}


function _anlExport() {
  const S = window._anlState;
  const sources = { all:[...DB.ingresos,...DB.ingresos2,...(DB.movimientos||[]),...(DB.agenda||[])], ref:DB.ingresos, ing:DB.ingresos2, flota:DB.movimientos||[], agenda:DB.agenda||[], conductores:DB.conductores||[] };
  let data = sources[S.source] || sources.all;
  if (S.dateFrom) data = data.filter(i => (i.entrada||i.ts||'') >= S.dateFrom);
  if (S.dateTo)   data = data.filter(i => (i.entrada||i.ts||'') <= S.dateTo+'T23:59');
  if (!data.length) { toast('Sin datos','var(--amber)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Analisis');
  const fn = 'analisis_' + new Date().toISOString().slice(0,10) + '.xlsx';
  XLSX.writeFile(wb, fn);
  toast('✅ Exportado', 'var(--green)');
}

function _anlSmartInsights() {
  toast('🧠 Insights: ' + DB.ingresos.length + ' refs, ' + (DB.ingresos2||[]).length + ' ings, ' + (DB.movimientos||[]).length + ' mov', 'var(--blue)');
}

registerFn('renderAnalytics', renderAnalytics);
registerFn('_anlExport', _anlExport);
registerFn('_anlSmartInsights', _anlSmartInsights);
window.renderAnalytics = renderAnalytics;
