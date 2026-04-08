// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics.js — Análisis visual
// Fuentes: ref, ingresos, agenda, conductores
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, toast, todayISO } from './utils.js';

let _c, _u, _datos = {};

export function render(c, u) {
  _c = c; _u = u; _datos = {};
  paint();
  loadAll();
  return () => {};
}

function t(k) { return trFree('analytics', k) || trFree('shell', k) || k; }

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';

  _c.innerHTML = `
    <div style="max-width:1100px;margin:0 auto">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center">
        <select id="an-source" style="padding:8px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit">
          <option value="all">${t('all')}</option>
          <option value="ingresos">Ingresos</option>
          <option value="referencias">Referencias</option>
          <option value="agenda">Agenda</option>
          <option value="conductores">Conductores</option>
        </select>
        <input id="an-from" type="date" style="padding:8px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit">
        <input id="an-to" type="date" value="${todayISO()}" style="padding:8px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit">
        <button id="an-refresh" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${t('filter')}</button>
        <button id="an-export" style="padding:8px 14px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${t('export')}</button>
      </div>

      <!-- CHARTS GRID -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:700;margin-bottom:10px">Tendencia diaria</div>
          <canvas id="chart-trend" height="200"></canvas>
        </div>
        <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:700;margin-bottom:10px">Por hora</div>
          <canvas id="chart-hour" height="200"></canvas>
        </div>
        <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:700;margin-bottom:10px">Top empresas</div>
          <div id="chart-empresas" style="font-size:12px"></div>
        </div>
        <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:700;margin-bottom:10px">Por hall</div>
          <div id="chart-halls" style="font-size:12px"></div>
        </div>
      </div>

      <!-- RESUMEN -->
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        <div id="an-total" style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800">—</div>
          <div style="font-size:11px;color:#64748b">Total registros</div>
        </div>
        <div id="an-recinto" style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800">—</div>
          <div style="font-size:11px;color:#64748b">En recinto</div>
        </div>
        <div id="an-salidas" style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800">—</div>
          <div style="font-size:11px;color:#64748b">Salidas</div>
        </div>
        <div id="an-empresas" style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800">—</div>
          <div style="font-size:11px;color:#64748b">Empresas</div>
        </div>
      </div>
    </div>`;

  _c.querySelector('#an-refresh').onclick = () => loadAll();
  _c.querySelector('#an-export').onclick = () => exportAnalytics();
}

async function loadAll() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const r = _u.recinto || '';
    const [ing, refs, ag, cond] = await Promise.all([
      fsGetAll('accesos').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('ingresos').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('agenda').then(d => r ? d.filter(x => x.recinto === r) : d),
      fsGetAll('conductores').then(d => r ? d.filter(x => x.recinto === r) : d),
    ]);
    _datos = { ingresos: ing, referencias: refs, agenda: ag, conductores: cond };
    renderCharts();
  } catch (e) { console.warn('analytics load:', e); }
}

function renderCharts() {
  const all = [...(_datos.ingresos || []), ...(_datos.referencias || [])];

  // Resumen
  const total = all.length;
  const enRecinto = all.filter(d => d.estado === 'EN_RECINTO').length;
  const salidas = all.filter(d => d.estado === 'SALIDA').length;
  const empresasSet = new Set(all.map(d => d.empresa).filter(Boolean));

  setVal('an-total', total);
  setVal('an-recinto', enRecinto);
  setVal('an-salidas', salidas);
  setVal('an-empresas', empresasSet.size);

  // Top empresas
  const empCount = {};
  all.forEach(d => { if (d.empresa) empCount[d.empresa] = (empCount[d.empresa] || 0) + 1; });
  const topEmps = Object.entries(empCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const empEl = _c.querySelector('#chart-empresas');
  if (empEl) {
    empEl.innerHTML = topEmps.length
      ? topEmps.map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div style="flex:1;font-size:11px">${safeHtml(name)}</div>
            <div style="width:100px;height:14px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#3b82f6;border-radius:4px"></div></div>
            <div style="font-size:10px;font-weight:700;width:30px;text-align:right">${count}</div>
          </div>`;
        }).join('')
      : '<span style="color:#94a3b8">Sin datos</span>';
  }

  // Por hall
  const hallCount = {};
  all.forEach(d => { if (d.hall) hallCount[d.hall] = (hallCount[d.hall] || 0) + 1; });
  const hallsEl = _c.querySelector('#chart-halls');
  if (hallsEl) {
    const topHalls = Object.entries(hallCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    hallsEl.innerHTML = topHalls.length
      ? topHalls.map(([name, count]) => {
          const pct = Math.round((count / total) * 100);
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div style="flex:1;font-size:11px">${safeHtml(name)}</div>
            <div style="width:100px;height:14px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:#10b981;border-radius:4px"></div></div>
            <div style="font-size:10px;font-weight:700;width:30px;text-align:right">${count}</div>
          </div>`;
        }).join('')
      : '<span style="color:#94a3b8">Sin datos</span>';
  }

  // Tendencia y hora: barras simples con CSS (sin librería externa)
  renderTrend(all);
  renderHourDist(all);
}

function renderTrend(data) {
  const canvas = _c.querySelector('#chart-trend');
  if (!canvas) return;
  const days = {};
  data.forEach(d => { const day = (d.fecha || '').slice(0, 10); if (day) days[day] = (days[day] || 0) + 1; });
  const sorted = Object.entries(days).sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  const max = Math.max(...sorted.map(s => s[1]), 1);
  canvas.outerHTML = `<div style="display:flex;align-items:flex-end;gap:4px;height:160px">${sorted.map(([day, count]) =>
    `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
      <div style="font-size:10px;font-weight:700;margin-bottom:2px">${count}</div>
      <div style="width:100%;background:#3b82f6;border-radius:4px 4px 0 0;height:${(count/max)*120}px;min-height:2px"></div>
      <div style="font-size:9px;color:#94a3b8;margin-top:2px">${day.slice(5)}</div>
    </div>`
  ).join('')}</div>`;
}

function renderHourDist(data) {
  const canvas = _c.querySelector('#chart-hour');
  if (!canvas) return;
  const hours = Array(24).fill(0);
  data.forEach(d => {
    const h = parseInt((d.fecha || '').slice(11, 13));
    if (!isNaN(h)) hours[h]++;
  });
  const max = Math.max(...hours, 1);
  const active = hours.map((v, i) => [i, v]).filter(([, v]) => v > 0);
  canvas.outerHTML = `<div style="display:flex;align-items:flex-end;gap:2px;height:160px">${(active.length ? active : [[0,0]]).map(([h, count]) =>
    `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
      <div style="font-size:9px;font-weight:700;margin-bottom:1px">${count||''}</div>
      <div style="width:100%;background:#f59e0b;border-radius:3px 3px 0 0;height:${(count/max)*120}px;min-height:2px"></div>
      <div style="font-size:8px;color:#94a3b8;margin-top:1px">${h}h</div>
    </div>`
  ).join('')}</div>`;
}

function setVal(id, val) {
  const el = _c.querySelector(`#${id}`);
  if (el) el.querySelector('div').textContent = val;
}

async function exportAnalytics() {
  try {
    toast(t('loading'), '#3b82f6');
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
    const all = [...(_datos.ingresos || []), ...(_datos.referencias || [])];
    const ws = XLSX.utils.json_to_sheet(all.map(d => ({
      Matricula: d.matricula, Empresa: d.empresa, Hall: d.hall, Fecha: d.fecha, Estado: d.estado
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('title'));
    XLSX.writeFile(wb, `Analytics_${todayISO()}.xlsx`);
    toast(t('export') + ' ✓', '#10b981');
  } catch (e) { toast(t('error'), '#ef4444'); }
}
