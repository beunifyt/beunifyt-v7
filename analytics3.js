// BeUnifyT v8 — tabs/analytics3.js — Precision Analytics
import { DB, iF, SID, registerFn, callFn } from '../core/context.js';
import { esc, fmt } from '../core/shared.js';
import { isSA, isSup } from '../auth.js';
import { toast, uid, nowLocal } from '../utils.js';

// ─── STATE ──────────────────────────────────────────────────────────
if (!window._precState) window._precState = {
  source: 'all', dateFrom: '', dateTo: '', sub: 'executive',
  compareMode: false, compareDateFrom: '', compareDateTo: '',
  granularity: 'day', drillDim: null, drillVal: null,
};

// ─── HELPERS ────────────────────────────────────────────────────────
function _getData(src, from, to) {
  const sources = {
    all: [...DB.ingresos, ...DB.ingresos2, ...(DB.movimientos || []), ...(DB.agenda || [])],
    ref: DB.ingresos, ing: DB.ingresos2, flota: DB.movimientos || [],
    agenda: DB.agenda || [], conductores: DB.conductores || [],
  };
  let data = sources[src] || sources.all;
  if (from) data = data.filter(i => (i.entrada || i.ts || '') >= from);
  if (to) data = data.filter(i => (i.entrada || i.ts || '') <= to + 'T23:59');
  return data;
}

function _count(arr, key) {
  const m = {};
  arr.forEach(i => { const v = i[key]; if (v) m[v] = (m[v] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function _avgTime(arr) {
  const times = arr.filter(i => i.entrada && i.salida).map(i => new Date(i.salida) - new Date(i.entrada));
  return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60000) : 0;
}

function _medianTime(arr) {
  const times = arr.filter(i => i.entrada && i.salida).map(i => new Date(i.salida) - new Date(i.entrada)).sort((a, b) => a - b);
  if (!times.length) return 0;
  const mid = Math.floor(times.length / 2);
  return Math.round((times.length % 2 ? times[mid] : (times[mid - 1] + times[mid]) / 2) / 60000);
}

function _p95Time(arr) {
  const times = arr.filter(i => i.entrada && i.salida).map(i => new Date(i.salida) - new Date(i.entrada)).sort((a, b) => a - b);
  if (!times.length) return 0;
  return Math.round(times[Math.floor(times.length * 0.95)] / 60000);
}

function _dayHist(arr) {
  const m = {};
  arr.forEach(i => { const d = (i.entrada || i.ts || '').slice(0, 10); if (d) m[d] = (m[d] || 0) + 1; });
  return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
}

function _weekHist(arr) {
  const m = {};
  arr.forEach(i => {
    const d = (i.entrada || i.ts || '').slice(0, 10);
    if (!d) return;
    const dt = new Date(d);
    const wk = new Date(dt.setDate(dt.getDate() - dt.getDay()));
    const key = wk.toISOString().slice(0, 10);
    m[key] = (m[key] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
}

function _hourHist(arr) {
  const m = {};
  for (let h = 0; h < 24; h++) m[String(h).padStart(2, '0')] = 0;
  arr.forEach(i => { const t = (i.entrada || i.ts || '').slice(11, 13); if (t) m[t]++; });
  return Object.entries(m);
}

function _heatmapData(arr) {
  const m = {};
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) m[`${d}-${h}`] = 0;
  arr.forEach(i => {
    const ts = i.entrada || i.ts || '';
    if (!ts) return;
    const dt = new Date(ts);
    m[`${dt.getDay()}-${dt.getHours()}`]++;
  });
  return { m, days };
}

// ─── CHART BUILDERS ─────────────────────────────────────────────────
function _sparkLine(arr, color, h2) {
  if (arr.length < 2) return '<div style="text-align:center;font-size:11px;color:var(--text3);padding:8px">Datos insuficientes</div>';
  const mx = Math.max(...arr.map(x => x[1]), 1);
  const w = 300, h = h2 || 60, step = w / (arr.length - 1);
  const pts = arr.map((x, i) => `${i * step},${h - Math.round(x[1] / mx * (h - 6))}`).join(' ');
  const areaPts = `0,${h} ${pts} ${(arr.length - 1) * step},${h}`;
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;display:block">
    <polygon points="${areaPts}" fill="${color}" opacity="0.1"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  </svg>
  <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:2px"><span>${arr[0][0]}</span><span>${arr[arr.length - 1][0]}</span></div>`;
}

function _barChart(arr, color) {
  if (!arr.length) return '<div style="padding:8px;text-align:center;font-size:11px;color:var(--text3)">Sin datos</div>';
  const mx = Math.max(...arr.map(x => x[1]), 1);
  return arr.slice(0, 12).map(([k, v]) =>
    `<div class="bar-row"><span style="font-size:10px;min-width:70px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${esc(k)}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(v / mx * 100)}%;background:${color}"></div></div><span class="bar-val">${v}</span></div>`
  ).join('');
}

function _donutSVG(items, colors) {
  if (!items.length || !items.some(x => x[1] > 0)) return '<div style="padding:16px;text-align:center;font-size:11px;color:var(--text3)">Sin datos</div>';
  items = items.filter(x => x[1] > 0);
  const total = items.reduce((a, x) => a + x[1], 0);
  const cx = 60, cy = 60, r = 50, r2 = 30;
  let angle = -90;
  let paths = '';
  const clrs = colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
  items.forEach(([k, v], i) => {
    const pct = v / total;
    const a1 = angle * Math.PI / 180;
    angle += pct * 360;
    const a2 = angle * Math.PI / 180;
    const large = pct > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const x3 = cx + r2 * Math.cos(a2), y3 = cy + r2 * Math.sin(a2);
    const x4 = cx + r2 * Math.cos(a1), y4 = cy + r2 * Math.sin(a1);
    paths += `<path d="M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 ${large} 0 ${x4},${y4} Z" fill="${clrs[i % clrs.length]}" opacity="0.85"/>`;
  });
  const legend = items.slice(0, 6).map(([k, v], i) => `<div style="display:flex;align-items:center;gap:4px;font-size:10px"><div style="width:8px;height:8px;border-radius:2px;background:${clrs[i % clrs.length]};flex-shrink:0"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">${esc(k)}</span><b>${v}</b> <span style="color:var(--text3);font-size:9px">(${Math.round(v / total * 100)}%)</span></div>`).join('');
  return `<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 120 120" width="100" height="100">${paths}<text x="60" y="58" text-anchor="middle" font-size="16" font-weight="900" fill="var(--text)">${total}</text><text x="60" y="72" text-anchor="middle" font-size="8" fill="var(--text3)">total</text></svg><div style="display:flex;flex-direction:column;gap:3px;flex:1">${legend}</div></div>`;
}

function _heatmap(data) {
  const { m, days } = data;
  const mx = Math.max(...Object.values(m), 1);
  let html = '<div style="display:grid;grid-template-columns:40px repeat(24,1fr);gap:1px;font-size:8px">';
  html += '<div></div>';
  for (let h = 0; h < 24; h++) html += `<div style="text-align:center;color:var(--text3)">${String(h).padStart(2, '0')}</div>`;
  for (let d = 0; d < 7; d++) {
    html += `<div style="display:flex;align-items:center;color:var(--text3);font-weight:600">${days[d]}</div>`;
    for (let h = 0; h < 24; h++) {
      const v = m[`${d}-${h}`];
      const op = v > 0 ? Math.max(0.15, v / mx) : 0.05;
      html += `<div title="${days[d]} ${h}:00 → ${v}" style="aspect-ratio:1;border-radius:2px;background:var(--blue);opacity:${op}"></div>`;
    }
  }
  html += '</div>';
  return html;
}

function _funnelChart(stages) {
  if (!stages.length) return '';
  const mx = stages[0][1] || 1;
  return stages.map(([label, val], i) => {
    const pct = Math.round(val / mx * 100);
    const dropoff = i > 0 ? Math.round((1 - val / (stages[i - 1][1] || 1)) * 100) : 0;
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span style="font-size:10px;min-width:80px;color:var(--text2)">${esc(label)}</span>
      <div style="flex:1;height:24px;background:var(--bg3);border-radius:4px;overflow:hidden;position:relative">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#3b82f6,#6366f1);border-radius:4px;transition:width .3s"></div>
        <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:#fff">${val}</span>
      </div>
      ${i > 0 ? `<span style="font-size:9px;color:var(--red);font-weight:700">-${dropoff}%</span>` : '<span style="width:36px"></span>'}
    </div>`;
  }).join('');
}

// ─── KPI CARD ───────────────────────────────────────────────────────
function _kpi(value, label, color, sub) {
  return `<div class="card" style="text-align:center;padding:12px">
    <div class="stat-n" style="font-size:22px;color:${color}">${value}</div>
    <div class="stat-l">${label}</div>
    ${sub ? `<div style="font-size:9px;color:var(--text3);margin-top:2px">${sub}</div>` : ''}
  </div>`;
}

// ─── DELTA INDICATOR ────────────────────────────────────────────────
function _delta(current, previous) {
  if (!previous) return '';
  const diff = current - previous;
  const pct = Math.round((diff / (previous || 1)) * 100);
  const clr = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text3)';
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
  return `<span style="font-size:10px;color:${clr};font-weight:700">${arrow} ${Math.abs(pct)}%</span>`;
}

// ─── RENDER ─────────────────────────────────────────────────────────
export function renderAnalytics3() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const S = window._precState;
  const today = new Date().toISOString().slice(0, 10);

  const data = _getData(S.source, S.dateFrom, S.dateTo);

  // Compare period data
  let compData = null;
  if (S.compareMode && S.compareDateFrom && S.compareDateTo) {
    compData = _getData(S.source, S.compareDateFrom, S.compareDateTo);
  }

  // Metrics
  const enRecinto = data.filter(i => !i.salida && i.entrada).length;
  const hoy = data.filter(i => (i.entrada || '').startsWith(today)).length;
  const conSalida = data.filter(i => i.salida).length;
  const avgMin = _avgTime(data);
  const medMin = _medianTime(data);
  const p95Min = _p95Time(data);

  // Breakdowns
  const byEmpresa = _count(data, 'empresa');
  const byTipo = _count(data, 'tipoVehiculo');
  const byHall = _count(data, 'hall');
  const byStatus = _count(data, 'status');
  const byDay = _dayHist(data);
  const byWeek = _weekHist(data);
  const byHour = _hourHist(data);
  const heat = _heatmapData(data);

  // Conductor metrics
  const conductores = DB.conductores || [];
  const activeCond = conductores.filter(c => !c.disabled).length;
  const docsExpired = conductores.filter(c => c.docExpiry && c.docExpiry < today).length;
  const empresas = DB.empresas || [];
  const activeEmp = empresas.filter(e => !e.disabled).length;

  // Funnel: ref → ingreso → en recinto → salida
  const totalRef = DB.ingresos.length;
  const totalIng = DB.ingresos2.length;
  const totalInside = [...DB.ingresos, ...DB.ingresos2].filter(i => i.entrada && !i.salida).length;
  const totalExit = [...DB.ingresos, ...DB.ingresos2].filter(i => i.salida).length;

  // Sub tabs
  const subTabs = [
    ['executive', '📊 Ejecutivo'], ['temporal', '📅 Temporal'], ['dimensional', '🏢 Dimensional'],
    ['funnel', '🔄 Funnel'], ['cohorts', '👥 Cohortes'], ['compare', '⚖️ Comparar']
  ];
  const subHtml = subTabs.map(([id, lbl]) =>
    `<button class="btn btn-xs ${S.sub === id ? 'btn-p' : 'btn-gh'}" onclick="window._precState.sub='${id}';window._op.renderAnalytics3()">${lbl}</button>`
  ).join('');

  let h = `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:12px;font-weight:800;color:var(--text)">📈 Precision Analytics</span>
    <span style="flex:1"></span>
    ${subHtml}
  </div>`;

  // Source + date filter
  h += `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:10px;font-weight:700;color:var(--text3)">FUENTE:</span>
    ${[['all', '🌐 Todo'], ['ref', '🔖 Ref'], ['ing', '🚛 Ing'], ['flota', '📦 Emb'], ['agenda', '📅 Ag']].map(([v, l]) =>
      `<button class="btn btn-xs ${S.source === v ? 'btn-p' : 'btn-gh'}" onclick="window._precState.source='${v}';window._op.renderAnalytics3()">${l}</button>`
    ).join('')}
    <span style="flex:1"></span>
    <input type="date" value="${S.dateFrom || ''}" oninput="window._precState.dateFrom=this.value;window._op.renderAnalytics3()" title="Desde" style="font-size:11px">
    <input type="date" value="${S.dateTo || ''}" oninput="window._precState.dateTo=this.value;window._op.renderAnalytics3()" title="Hasta" style="font-size:11px">
    ${S.dateFrom || S.dateTo ? `<button class="btn btn-xs btn-gh" onclick="window._precState.dateFrom='';window._precState.dateTo='';window._op.renderAnalytics3()">✕</button>` : ''}
    <button class="btn btn-gh btn-sm" onclick="window._op._precExport()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
  </div>`;

  // ── EXECUTIVE ──
  if (S.sub === 'executive') {
    h += `<div class="sg sg4" style="margin-bottom:10px">
      ${_kpi(data.length, 'Total registros', 'var(--blue)', compData ? _delta(data.length, compData.length) : '')}
      ${_kpi(enRecinto, 'En recinto', 'var(--green)', '')}
      ${_kpi(hoy, 'Hoy', 'var(--teal)', '')}
      ${_kpi(avgMin + '<span style="font-size:11px">m</span>', 'Prom. estancia', 'var(--amber)', `Med: ${medMin}m · P95: ${p95Min}m`)}
    </div>`;

    h += `<div class="sg sg4" style="margin-bottom:10px">
      ${_kpi(activeCond, 'Conductores', '#8b5cf6', docsExpired ? `<span style="color:var(--red)">${docsExpired} docs vencidos</span>` : '')}
      ${_kpi(activeEmp, 'Empresas', '#06b6d4', '')}
      ${_kpi(conSalida, 'Con salida', '#10b981', '')}
      ${_kpi(Math.round(conSalida / (data.length || 1) * 100) + '%', 'Tasa completado', '#3b82f6', '')}
    </div>`;

    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Tendencia</div>${_sparkLine(S.granularity === 'week' ? byWeek : byDay, '#3b82f6')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🔥 Mapa de calor</div>${_heatmap(heat)}</div>
    </div>`;

    h += `<div class="sg sg3" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🚗 Tipo vehículo</div>${_donutSVG(byTipo.slice(0, 8))}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏢 Top empresas</div>${_barChart(byEmpresa.slice(0, 10), 'var(--teal)')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏟 Por Hall</div>${_barChart(byHall.slice(0, 8), 'var(--amber)')}</div>
    </div>`;

  // ── TEMPORAL ──
  } else if (S.sub === 'temporal') {
    const granBtns = [['day', 'Día'], ['week', 'Semana']].map(([v, l]) =>
      `<button class="btn btn-xs ${S.granularity === v ? 'btn-p' : 'btn-gh'}" onclick="window._precState.granularity='${v}';window._op.renderAnalytics3()">${l}</button>`
    ).join('');
    h += `<div style="margin-bottom:8px;display:flex;gap:4px;align-items:center"><span style="font-size:10px;font-weight:700;color:var(--text3)">GRANULARIDAD:</span>${granBtns}</div>`;

    const trendData = S.granularity === 'week' ? byWeek : byDay;
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Tendencia ${S.granularity === 'week' ? 'semanal' : 'diaria'}</div>${_sparkLine(trendData, '#3b82f6', 80)}</div>`;
    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🕐 Distribución horaria</div>${_barChart(byHour.filter(x => x[1] > 0), '#6366f1')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🔥 Heatmap día/hora</div>${_heatmap(heat)}</div>
    </div>`;

  // ── DIMENSIONAL ──
  } else if (S.sub === 'dimensional') {
    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏢 Empresas (top 15)</div>${_barChart(byEmpresa.slice(0, 15), 'var(--teal)')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏟 Halls</div>${_barChart(byHall.slice(0, 10), 'var(--amber)')}</div>
    </div>`;
    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🚗 Tipo vehículo</div>${_donutSVG(byTipo.slice(0, 8))}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📊 Estado</div>${_donutSVG(byStatus.slice(0, 6))}</div>
    </div>`;

    // Descarga breakdown
    const descC = { mano: 0, maquinaria: 0, mixto: 0 };
    data.forEach(i => { if (i.descargaTipo) descC[i.descargaTipo]++; });
    const descTotal = Object.values(descC).reduce((a, b) => a + b, 0);
    if (descTotal) {
      h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📦 Tipo descarga</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div style="text-align:center;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);padding:10px"><div style="font-size:22px;font-weight:900;color:var(--green)">${descC.mano}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MANUAL</div></div>
          <div style="text-align:center;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:10px"><div style="font-size:22px;font-weight:900;color:var(--blue)">${descC.maquinaria}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MAQUINARIA</div></div>
          <div style="text-align:center;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:10px"><div style="font-size:22px;font-weight:900;color:var(--text3)">${descC.mixto}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MIXTO</div></div>
        </div>
      </div>`;
    }

  // ── FUNNEL ──
  } else if (S.sub === 'funnel') {
    const funnelStages = [
      ['📋 Referencias', totalRef],
      ['🚛 Ingresos', totalIng],
      ['🏟 En recinto', totalInside],
      ['✅ Con salida', totalExit],
    ];
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:12px">🔄 Funnel operacional</div>${_funnelChart(funnelStages)}</div>`;

    // Status funnel
    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📊 Distribución estado</div>${_donutSVG([['En recinto', enRecinto], ['Con salida', conSalida]].filter(x => x[1] > 0), ['#10b981', '#6366f1'])}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Ref vs Ing</div>
        <div style="height:14px;border-radius:7px;overflow:hidden;display:flex;margin-bottom:10px"><div style="background:var(--blue);width:${Math.round(totalRef / (totalRef + totalIng || 1) * 100)}%"></div><div style="background:var(--green);flex:1"></div></div>
        <div style="display:flex;gap:8px">
          <div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--blue)">${totalRef}</div><div style="font-size:9px;font-weight:700">🔖 REF</div></div>
          <div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">${totalIng}</div><div style="font-size:9px;font-weight:700">🚛 ING</div></div>
        </div>
      </div>
    </div>`;

  // ── COHORTS ──
  } else if (S.sub === 'cohorts') {
    // Cohort by empresa: volume, avg time, completion rate
    const empMetrics = byEmpresa.slice(0, 15).map(([emp, count]) => {
      const empData = data.filter(i => i.empresa === emp);
      const avgT = _avgTime(empData);
      const exits = empData.filter(i => i.salida).length;
      const rate = Math.round(exits / (count || 1) * 100);
      return { emp, count, avgT, exits, rate };
    });

    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🏢 Cohorte por empresa</div>`;
    if (empMetrics.length) {
      h += `<div style="max-height:400px;overflow-y:auto"><table class="tbl"><thead><tr>
        <th>Empresa</th><th style="text-align:center">Vol.</th><th style="text-align:center">Prom. min</th><th style="text-align:center">Salidas</th><th style="text-align:center">% completado</th>
      </tr></thead><tbody>`;
      empMetrics.forEach(m => {
        const rClr = m.rate >= 80 ? 'var(--green)' : m.rate >= 50 ? 'var(--amber)' : 'var(--red)';
        h += `<tr><td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis">${esc(m.emp)}</td>
          <td style="text-align:center;font-weight:700">${m.count}</td>
          <td style="text-align:center">${m.avgT}m</td>
          <td style="text-align:center">${m.exits}</td>
          <td style="text-align:center"><span style="color:${rClr};font-weight:700">${m.rate}%</span></td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    } else {
      h += '<div style="text-align:center;font-size:11px;color:var(--text3);padding:12px">Sin datos suficientes</div>';
    }
    h += '</div>';

  // ── COMPARE ──
  } else if (S.sub === 'compare') {
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:8px">⚖️ Comparar períodos</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">PERÍODO A (principal)</div>
          <div style="display:flex;gap:4px"><input type="date" value="${S.dateFrom || ''}" oninput="window._precState.dateFrom=this.value;window._op.renderAnalytics3()" style="flex:1;font-size:11px"><input type="date" value="${S.dateTo || ''}" oninput="window._precState.dateTo=this.value;window._op.renderAnalytics3()" style="flex:1;font-size:11px"></div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">PERÍODO B (comparar)</div>
          <div style="display:flex;gap:4px"><input type="date" value="${S.compareDateFrom || ''}" oninput="window._precState.compareDateFrom=this.value;window._precState.compareMode=true;window._op.renderAnalytics3()" style="flex:1;font-size:11px"><input type="date" value="${S.compareDateTo || ''}" oninput="window._precState.compareDateTo=this.value;window._precState.compareMode=true;window._op.renderAnalytics3()" style="flex:1;font-size:11px"></div>
        </div>
      </div>
    </div>`;

    if (compData) {
      const compEnRecinto = compData.filter(i => !i.salida && i.entrada).length;
      const compAvg = _avgTime(compData);
      const compSalida = compData.filter(i => i.salida).length;

      h += `<div class="sg sg2" style="margin-bottom:10px">
        <div class="card" style="border-left:3px solid var(--blue)"><div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:8px">PERÍODO A</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--blue)">${data.length}</div><div style="font-size:9px;color:var(--text3)">Total</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--green)">${enRecinto}</div><div style="font-size:9px;color:var(--text3)">En recinto</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--amber)">${avgMin}m</div><div style="font-size:9px;color:var(--text3)">Prom.</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--teal)">${conSalida}</div><div style="font-size:9px;color:var(--text3)">Salidas</div></div>
          </div>
        </div>
        <div class="card" style="border-left:3px solid #8b5cf6"><div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:8px">PERÍODO B</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:#8b5cf6">${compData.length}</div><div style="font-size:9px;color:var(--text3)">Total ${_delta(data.length, compData.length)}</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--green)">${compEnRecinto}</div><div style="font-size:9px;color:var(--text3)">En recinto</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--amber)">${compAvg}m</div><div style="font-size:9px;color:var(--text3)">Prom.</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:900;color:var(--teal)">${compSalida}</div><div style="font-size:9px;color:var(--text3)">Salidas</div></div>
          </div>
        </div>
      </div>`;
    } else {
      h += '<div style="padding:20px;text-align:center;font-size:12px;color:var(--text3)">Selecciona ambos períodos para comparar</div>';
    }
  }

  el.innerHTML = h;
}

// ─── EXPORT ─────────────────────────────────────────────────────────
function _precExport() {
  const S = window._precState;
  const data = _getData(S.source, S.dateFrom, S.dateTo);
  if (!data.length) { toast('Sin datos', 'var(--amber)'); return; }
  const XLSX = window.XLSX;
  if (!XLSX) { toast('XLSX no disponible', 'var(--red)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Precision');

  // Add metrics sheet
  const metrics = [
    ['Métrica', 'Valor'],
    ['Total registros', data.length],
    ['En recinto', data.filter(i => !i.salida && i.entrada).length],
    ['Con salida', data.filter(i => i.salida).length],
    ['Prom. estancia (min)', _avgTime(data)],
    ['Mediana estancia (min)', _medianTime(data)],
    ['P95 estancia (min)', _p95Time(data)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metrics), 'Métricas');
  const fn = 'precision_' + new Date().toISOString().slice(0, 10) + '.xlsx';
  XLSX.writeFile(wb, fn);
  toast('✅ Exportado', 'var(--green)');
}

// ─── REGISTER ───────────────────────────────────────────────────────
registerFn('renderAnalytics3', renderAnalytics3);
registerFn('_precExport', _precExport);
window.renderAnalytics3 = renderAnalytics3;
