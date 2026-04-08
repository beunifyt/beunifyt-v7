// BeUnifyT v8 — tabs/analytics4.js — AI Intelligence
import { DB, iF, SID, registerFn, callFn } from '../core/context.js';
import { esc, fmt } from '../core/shared.js';
import { isSA, isSup } from '../auth.js';
import { toast, uid, nowLocal } from '../utils.js';

// ─── STATE ──────────────────────────────────────────────────────────
if (!window._aiState) window._aiState = {
  sub: 'insights', loading: false, lastAnalysis: null, sensitivity: 'medium',
  recommendations: [], alerts: [], predictions: [],
};

// ─── LOCAL ANALYSIS ENGINE ──────────────────────────────────────────
// Heuristic-based analysis — no external API required

function _analyzeData() {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const DAY = 86400000;

  const allData = [...DB.ingresos, ...DB.ingresos2, ...(DB.movimientos || []), ...(DB.agenda || [])];
  const conductores = DB.conductores || [];
  const empresas = DB.empresas || [];
  const agenda = DB.agenda || [];

  const recommendations = [];
  const alerts = [];
  const predictions = [];

  // ── ANOMALY DETECTION ──
  // Volume anomaly: today vs 7-day average
  const last7 = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    last7.push(allData.filter(x => (x.entrada || x.ts || '').startsWith(d)).length);
  }
  const avg7 = last7.length ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : 0;
  const todayCount = allData.filter(x => (x.entrada || x.ts || '').startsWith(today)).length;

  if (avg7 > 0 && todayCount > avg7 * 1.5) {
    alerts.push({
      type: 'anomaly', severity: 'high', icon: '📈',
      title: 'Volumen inusualmente alto',
      desc: `Hoy: ${todayCount} registros vs promedio 7d: ${avg7}. Incremento de ${Math.round((todayCount / avg7 - 1) * 100)}%.`,
    });
  } else if (avg7 > 0 && todayCount < avg7 * 0.5 && new Date().getHours() > 12) {
    alerts.push({
      type: 'anomaly', severity: 'medium', icon: '📉',
      title: 'Volumen inusualmente bajo',
      desc: `Hoy: ${todayCount} registros vs promedio 7d: ${avg7}. Caída de ${Math.round((1 - todayCount / avg7) * 100)}%.`,
    });
  }

  // Pending exits: vehicles in recinto > 4 hours
  const longStay = allData.filter(i => {
    if (!i.entrada || i.salida) return false;
    const mins = (now - new Date(i.entrada).getTime()) / 60000;
    return mins > 240;
  });
  if (longStay.length > 0) {
    alerts.push({
      type: 'operational', severity: longStay.length > 5 ? 'high' : 'medium', icon: '⏰',
      title: `${longStay.length} vehículos +4h sin salida`,
      desc: `Hay ${longStay.length} registros con entrada pero sin salida registrada hace más de 4 horas.`,
    });
  }

  // ── DOCUMENT EXPIRATION ──
  const soon = conductores.filter(c => {
    if (!c.docExpiry) return false;
    const diff = (new Date(c.docExpiry).getTime() - now) / DAY;
    return diff > 0 && diff <= 30;
  });
  const expired = conductores.filter(c => c.docExpiry && c.docExpiry < today);

  if (expired.length > 0) {
    alerts.push({
      type: 'compliance', severity: 'high', icon: '🔴',
      title: `${expired.length} documentos vencidos`,
      desc: `${expired.length} conductores tienen documentación vencida. Requiere acción inmediata.`,
    });
  }
  if (soon.length > 0) {
    alerts.push({
      type: 'compliance', severity: 'medium', icon: '🟡',
      title: `${soon.length} documentos por vencer (30d)`,
      desc: `${soon.length} conductores tienen documentos que vencen en los próximos 30 días.`,
    });
  }

  // ── RECOMMENDATIONS ──
  // Form speed analysis
  const withTimes = allData.filter(i => i.entrada && i.salida);
  if (withTimes.length >= 10) {
    const times = withTimes.map(i => (new Date(i.salida) - new Date(i.entrada)) / 60000);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const p95 = Math.round(times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]);
    if (p95 > avg * 3) {
      recommendations.push({
        icon: '⚡', priority: 'high',
        title: 'Optimizar procesos lentos',
        desc: `El P95 de estancia (${p95}m) es ${Math.round(p95 / avg)}x mayor que el promedio (${avg}m). Hay outliers que ralentizan.`,
        action: 'Revisar los registros más lentos e identificar cuellos de botella.',
      });
    }
  }

  // Empresa inactivity
  const empActivity = {};
  allData.forEach(i => { if (i.empresa) empActivity[i.empresa] = Math.max(empActivity[i.empresa] || 0, new Date(i.entrada || i.ts || 0).getTime()); });
  const inactiveEmps = Object.entries(empActivity).filter(([, ts]) => (now - ts) / DAY > 30);
  if (inactiveEmps.length > 0) {
    recommendations.push({
      icon: '🏢', priority: 'medium',
      title: `${inactiveEmps.length} empresas inactivas (+30d)`,
      desc: `Estas empresas no han tenido actividad en los últimos 30 días.`,
      action: 'Contactar para verificar estado y necesidades.',
    });
  }

  // Hall utilization
  const hallCounts = {};
  allData.filter(i => (i.entrada || '').startsWith(today)).forEach(i => { if (i.hall) hallCounts[i.hall] = (hallCounts[i.hall] || 0) + 1; });
  const halls = Object.entries(hallCounts).sort((a, b) => b[1] - a[1]);
  if (halls.length > 1) {
    const topHall = halls[0];
    const lowHall = halls[halls.length - 1];
    if (topHall[1] > lowHall[1] * 3) {
      recommendations.push({
        icon: '🏟', priority: 'medium',
        title: 'Desbalance entre halls',
        desc: `${topHall[0]} tiene ${topHall[1]} registros vs ${lowHall[0]} con ${lowHall[1]}. Diferencia de ${Math.round(topHall[1] / lowHall[1])}x.`,
        action: 'Considerar redistribuir carga entre halls.',
      });
    }
  }

  // Agenda no-show
  const agToday = agenda.filter(a => a.fecha === today);
  const agMissed = agToday.filter(a => a.estado === 'NO_SHOW' || a.estado === 'PERDIDA');
  if (agToday.length > 3 && agMissed.length > 0) {
    const rate = Math.round(agMissed.length / agToday.length * 100);
    if (rate > 20) {
      recommendations.push({
        icon: '📅', priority: 'high',
        title: `Tasa de no-show alta: ${rate}%`,
        desc: `${agMissed.length} de ${agToday.length} citas hoy no se presentaron.`,
        action: 'Enviar recordatorios previos y revisar confirmaciones.',
      });
    }
  }

  // ── PREDICTIONS ──
  // Volume forecast (simple trend)
  if (last7.length >= 5) {
    const trend = (last7[0] - last7[last7.length - 1]) / last7.length;
    const forecast = Math.max(0, Math.round(avg7 + trend));
    predictions.push({
      icon: '📊', title: 'Volumen esperado mañana',
      value: forecast, unit: 'registros',
      confidence: last7.every(v => Math.abs(v - avg7) < avg7 * 0.3) ? 'alta' : 'media',
      desc: `Basado en tendencia de 7 días. Promedio: ${avg7}/día.`,
    });
  }

  // Peak hour prediction
  const hourCounts = {};
  for (let h = 0; h < 24; h++) hourCounts[h] = 0;
  allData.filter(x => {
    const d = (x.entrada || x.ts || '').slice(0, 10);
    return d && (now - new Date(d).getTime()) / DAY <= 7;
  }).forEach(x => {
    const h = parseInt((x.entrada || x.ts || '').slice(11, 13));
    if (!isNaN(h)) hourCounts[h]++;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (peakHour && peakHour[1] > 0) {
    predictions.push({
      icon: '🕐', title: 'Hora pico habitual',
      value: `${peakHour[0].padStart(2, '0')}:00`, unit: '',
      confidence: 'alta',
      desc: `${peakHour[1]} registros acumulados en la última semana a esa hora.`,
    });
  }

  // Churn risk (enterprises)
  const atRisk = Object.entries(empActivity)
    .filter(([, ts]) => { const d = (now - ts) / DAY; return d > 15 && d <= 45; })
    .map(([emp]) => emp);
  if (atRisk.length > 0) {
    predictions.push({
      icon: '⚠️', title: 'Riesgo de churn',
      value: atRisk.length, unit: 'empresas',
      confidence: 'media',
      desc: `${atRisk.slice(0, 3).join(', ')}${atRisk.length > 3 ? ` y ${atRisk.length - 3} más` : ''} con baja actividad reciente.`,
    });
  }

  return { recommendations, alerts, predictions, timestamp: new Date().toISOString() };
}

// ─── HEALTH SCORE ───────────────────────────────────────────────────
function _healthScore(analysis) {
  let score = 100;
  analysis.alerts.forEach(a => {
    if (a.severity === 'high') score -= 15;
    else if (a.severity === 'medium') score -= 8;
    else score -= 3;
  });
  analysis.recommendations.forEach(r => {
    if (r.priority === 'high') score -= 5;
    else score -= 2;
  });
  return Math.max(0, Math.min(100, score));
}

function _scoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function _scoreLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Atención';
  return 'Crítico';
}

// ─── GAUGE SVG ──────────────────────────────────────────────────────
function _gaugeSVG(score) {
  const clr = _scoreColor(score);
  const angle = (score / 100) * 180;
  const rad = (a) => (a - 180) * Math.PI / 180;
  const cx = 80, cy = 75, r = 60;
  const x1 = cx + r * Math.cos(rad(0)), y1 = cy + r * Math.sin(rad(0));
  const x2 = cx + r * Math.cos(rad(angle)), y2 = cy + r * Math.sin(rad(angle));
  const large = angle > 180 ? 1 : 0;
  return `<svg viewBox="0 0 160 95" width="160" height="95">
    <path d="M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="var(--bg3)" stroke-width="12" stroke-linecap="round"/>
    <path d="M ${cx - r},${cy} A ${r},${r} 0 ${large} 1 ${x2},${y2}" fill="none" stroke="${clr}" stroke-width="12" stroke-linecap="round"/>
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="28" font-weight="900" fill="${clr}">${score}</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="10" fill="var(--text3)">${_scoreLabel(score)}</text>
  </svg>`;
}

// ─── RENDER ─────────────────────────────────────────────────────────
export function renderAnalytics4() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const S = window._aiState;

  // Run analysis
  const analysis = _analyzeData();
  S.recommendations = analysis.recommendations;
  S.alerts = analysis.alerts;
  S.predictions = analysis.predictions;
  S.lastAnalysis = analysis.timestamp;

  const score = _healthScore(analysis);

  // Sub tabs
  const subTabs = [
    ['insights', '🧠 Insights'], ['alerts', '🚨 Alertas'], ['predictions', '🔮 Predicciones'],
    ['reports', '📄 Reportes'], ['config', '⚙️ Config']
  ];
  const subHtml = subTabs.map(([id, lbl]) => {
    let badge = '';
    if (id === 'alerts' && analysis.alerts.length) badge = `<span style="background:var(--red);color:#fff;font-size:9px;padding:1px 5px;border-radius:8px;margin-left:2px">${analysis.alerts.length}</span>`;
    if (id === 'insights' && analysis.recommendations.length) badge = `<span style="background:var(--blue);color:#fff;font-size:9px;padding:1px 5px;border-radius:8px;margin-left:2px">${analysis.recommendations.length}</span>`;
    return `<button class="btn btn-xs ${S.sub === id ? 'btn-p' : 'btn-gh'}" onclick="window._aiState.sub='${id}';window._op.renderAnalytics4()">${lbl}${badge}</button>`;
  }).join('');

  let h = `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:12px;font-weight:800;color:var(--text)">🤖 AI Intelligence</span>
    <span style="flex:1"></span>
    ${subHtml}
  </div>`;

  // Health score + summary row
  h += `<div class="sg" style="grid-template-columns:180px 1fr 1fr 1fr;margin-bottom:10px">
    <div class="card" style="text-align:center;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center">${_gaugeSVG(score)}<div style="font-size:10px;font-weight:700;color:var(--text3);margin-top:4px">Health Score</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--red)">${analysis.alerts.filter(a => a.severity === 'high').length}</div><div class="stat-l">Alertas críticas</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--blue)">${analysis.recommendations.length}</div><div class="stat-l">Recomendaciones</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:#8b5cf6">${analysis.predictions.length}</div><div class="stat-l">Predicciones</div></div>
  </div>`;

  // ── INSIGHTS ──
  if (S.sub === 'insights') {
    if (analysis.recommendations.length) {
      h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:10px">💡 Recomendaciones del día</div>`;
      analysis.recommendations.forEach((r, i) => {
        const prClr = r.priority === 'high' ? 'var(--red)' : r.priority === 'medium' ? 'var(--amber)' : 'var(--green)';
        const prBg = r.priority === 'high' ? 'var(--rll)' : r.priority === 'medium' ? 'var(--all)' : 'var(--gll)';
        h += `<div style="background:${prBg};border:1px solid ${prClr}20;border-radius:var(--r);padding:10px;margin-bottom:8px;border-left:3px solid ${prClr}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:16px">${r.icon}</span>
            <span style="font-weight:700;font-size:12px;color:var(--text)">${esc(r.title)}</span>
            <span style="margin-left:auto;font-size:9px;font-weight:700;color:${prClr};text-transform:uppercase;background:${prClr}15;padding:2px 6px;border-radius:8px">${r.priority}</span>
          </div>
          <div style="font-size:11px;color:var(--text2);margin-bottom:4px">${esc(r.desc)}</div>
          <div style="font-size:10px;color:var(--text3)">💡 ${esc(r.action)}</div>
        </div>`;
      });
      h += '</div>';
    } else {
      h += `<div class="card" style="margin-bottom:10px;text-align:center;padding:30px">
        <div style="font-size:40px;margin-bottom:8px">✨</div>
        <div style="font-size:14px;font-weight:700;color:var(--green)">Todo en orden</div>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">No hay recomendaciones pendientes por el momento.</div>
      </div>`;
    }

    // Quick summary
    const today = new Date().toISOString().slice(0, 10);
    const todayData = [...DB.ingresos, ...DB.ingresos2].filter(i => (i.entrada || '').startsWith(today));
    const inRecinto = todayData.filter(i => !i.salida).length;
    const agPend = (DB.agenda || []).filter(a => a.fecha === today && a.estado === 'PENDIENTE').length;
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📋 Resumen rápido — ${today}</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.8">
        ${todayData.length > 0 ? `Hoy van <b>${todayData.length}</b> registros. ` : 'Sin registros hoy aún. '}
        ${inRecinto > 0 ? `<b>${inRecinto}</b> en recinto ahora. ` : ''}
        ${agPend > 0 ? `<b>${agPend}</b> citas pendientes. ` : ''}
        ${analysis.alerts.length > 0 ? `<span style="color:var(--red)"><b>${analysis.alerts.length}</b> alertas activas.</span> ` : '<span style="color:var(--green)">Sin alertas.</span> '}
      </div>
    </div>`;

  // ── ALERTS ──
  } else if (S.sub === 'alerts') {
    const sevOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...analysis.alerts].sort((a, b) => (sevOrder[a.severity] || 9) - (sevOrder[b.severity] || 9));

    if (sorted.length) {
      sorted.forEach(a => {
        const clr = a.severity === 'high' ? 'var(--red)' : a.severity === 'medium' ? 'var(--amber)' : 'var(--blue)';
        const bg = a.severity === 'high' ? 'var(--rll)' : a.severity === 'medium' ? 'var(--all)' : 'var(--bll)';
        h += `<div class="card" style="margin-bottom:8px;border-left:3px solid ${clr};background:${bg}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:16px">${a.icon}</span>
            <span style="font-weight:700;font-size:12px">${esc(a.title)}</span>
            <span style="margin-left:auto;font-size:9px;font-weight:700;color:${clr};text-transform:uppercase">${a.severity}</span>
          </div>
          <div style="font-size:11px;color:var(--text2)">${esc(a.desc)}</div>
          <div style="font-size:9px;color:var(--text3);margin-top:4px">Tipo: ${a.type}</div>
        </div>`;
      });
    } else {
      h += `<div class="card" style="text-align:center;padding:30px">
        <div style="font-size:40px;margin-bottom:8px">🟢</div>
        <div style="font-size:14px;font-weight:700;color:var(--green)">Sin alertas</div>
        <div style="font-size:11px;color:var(--text3)">El sistema opera con normalidad.</div>
      </div>`;
    }

  // ── PREDICTIONS ──
  } else if (S.sub === 'predictions') {
    if (analysis.predictions.length) {
      h += `<div class="sg sg3" style="margin-bottom:10px">`;
      analysis.predictions.forEach(p => {
        const confClr = p.confidence === 'alta' ? 'var(--green)' : p.confidence === 'media' ? 'var(--amber)' : 'var(--text3)';
        h += `<div class="card" style="padding:14px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span style="font-size:18px">${p.icon}</span>
            <span style="font-weight:700;font-size:12px">${esc(p.title)}</span>
          </div>
          <div style="font-size:28px;font-weight:900;color:var(--blue);margin-bottom:4px">${p.value} <span style="font-size:12px;font-weight:400;color:var(--text3)">${p.unit}</span></div>
          <div style="font-size:10px;color:var(--text2);margin-bottom:4px">${esc(p.desc)}</div>
          <div style="font-size:9px"><span style="color:${confClr};font-weight:700">● Confianza ${p.confidence}</span></div>
        </div>`;
      });
      h += '</div>';
    } else {
      h += `<div class="card" style="text-align:center;padding:30px">
        <div style="font-size:40px;margin-bottom:8px">🔮</div>
        <div style="font-size:14px;font-weight:700;color:var(--text3)">Datos insuficientes</div>
        <div style="font-size:11px;color:var(--text3)">Se necesitan más datos históricos para generar predicciones fiables.</div>
      </div>`;
    }

  // ── REPORTS ──
  } else if (S.sub === 'reports') {
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:10px">📄 Generar reporte AI</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button class="btn btn-sm btn-gh" onclick="window._op._aiReport('daily')">📅 Reporte diario</button>
        <button class="btn btn-sm btn-gh" onclick="window._op._aiReport('weekly')">📊 Reporte semanal</button>
        <button class="btn btn-sm btn-gh" onclick="window._op._aiReport('monthly')">📈 Reporte mensual</button>
        <button class="btn btn-sm" style="background:#7c3aed;color:#fff;border:none;border-radius:20px" onclick="window._op._aiReport('adhoc')">🧠 Análisis ad-hoc</button>
      </div>
    </div>`;

    // Last analysis timestamp
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🕐 Último análisis</div>
      <div style="font-size:11px;color:var(--text2)">${S.lastAnalysis ? new Date(S.lastAnalysis).toLocaleString() : 'Ejecutando ahora...'}</div>
      <button class="btn btn-xs btn-gh" style="margin-top:8px" onclick="window._op.renderAnalytics4()">🔄 Re-analizar</button>
    </div>`;

    // Generated report output
    const reportEl = document.getElementById('_aiReportOutput');
    if (window._lastAiReport) {
      h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📋 Resultado</div>
        <pre style="white-space:pre-wrap;font-size:11px;color:var(--text2);background:var(--bg3);padding:12px;border-radius:var(--r);max-height:400px;overflow-y:auto">${esc(window._lastAiReport)}</pre>
      </div>`;
    }

  // ── CONFIG ──
  } else if (S.sub === 'config') {
    const sens = ['low', 'medium', 'high'];
    const sensLabels = { low: '🟢 Baja', medium: '🟡 Media', high: '🔴 Alta' };
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:10px">⚙️ Sensibilidad de alertas</div>
      <div style="display:flex;gap:6px">
        ${sens.map(s => `<button class="btn btn-sm ${S.sensitivity === s ? 'btn-p' : 'btn-gh'}" onclick="window._aiState.sensitivity='${s}';window._op.renderAnalytics4()">${sensLabels[s]}</button>`).join('')}
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:8px">Ajusta cuán estrictas son las detecciones de anomalías y alertas.</div>
    </div>`;

    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:10px">📊 Estado del motor</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
        <div>Motor: <b>Heurístico local</b></div>
        <div>API externa: <b style="color:var(--text3)">No requerida</b></div>
        <div>Datos analizados: <b>${[...DB.ingresos, ...DB.ingresos2].length}</b> registros</div>
        <div>Conductores: <b>${(DB.conductores || []).length}</b></div>
        <div>Empresas: <b>${(DB.empresas || []).length}</b></div>
        <div>Última ejecución: <b>${S.lastAnalysis ? new Date(S.lastAnalysis).toLocaleTimeString() : '–'}</b></div>
      </div>
    </div>`;
  }

  el.innerHTML = h;
}

// ─── GENERATE REPORT ────────────────────────────────────────────────
function _aiReport(type) {
  const today = new Date().toISOString().slice(0, 10);
  const allData = [...DB.ingresos, ...DB.ingresos2, ...(DB.movimientos || [])];
  const conductores = DB.conductores || [];
  const agenda = DB.agenda || [];
  const analysis = _analyzeData();

  let report = '';
  const sep = '═'.repeat(50);

  if (type === 'daily') {
    const todayData = allData.filter(i => (i.entrada || '').startsWith(today));
    const inRecinto = todayData.filter(i => !i.salida).length;
    const exits = todayData.filter(i => i.salida).length;
    const agPend = agenda.filter(a => a.fecha === today).length;

    report = `${sep}\n  REPORTE DIARIO — ${today}\n${sep}\n\n`;
    report += `📊 RESUMEN\n  Registros hoy: ${todayData.length}\n  En recinto: ${inRecinto}\n  Con salida: ${exits}\n  Agenda: ${agPend} citas\n\n`;
    report += `🚨 ALERTAS (${analysis.alerts.length})\n`;
    analysis.alerts.forEach(a => { report += `  ${a.icon} [${a.severity.toUpperCase()}] ${a.title}\n    ${a.desc}\n`; });
    report += `\n💡 RECOMENDACIONES (${analysis.recommendations.length})\n`;
    analysis.recommendations.forEach(r => { report += `  ${r.icon} [${r.priority}] ${r.title}\n    ${r.action}\n`; });

  } else if (type === 'weekly') {
    const now = Date.now();
    const weekData = allData.filter(i => { const d = i.entrada || i.ts; return d && (now - new Date(d).getTime()) < 7 * 86400000; });
    report = `${sep}\n  REPORTE SEMANAL — Semana del ${today}\n${sep}\n\n`;
    report += `📊 RESUMEN 7 DÍAS\n  Total registros: ${weekData.length}\n  Promedio diario: ${Math.round(weekData.length / 7)}\n  Conductores activos: ${conductores.filter(c => !c.disabled).length}\n\n`;
    report += `🔮 PREDICCIONES\n`;
    analysis.predictions.forEach(p => { report += `  ${p.icon} ${p.title}: ${p.value} ${p.unit} (confianza ${p.confidence})\n`; });

  } else if (type === 'monthly') {
    const month = today.slice(0, 7);
    const monthData = allData.filter(i => (i.entrada || i.ts || '').startsWith(month));
    report = `${sep}\n  REPORTE MENSUAL — ${month}\n${sep}\n\n`;
    report += `📊 RESUMEN MES\n  Total registros: ${monthData.length}\n  Promedio diario: ${Math.round(monthData.length / 30)}\n\n`;
    report += `🏢 TOP EMPRESAS\n`;
    const empC = {};
    monthData.forEach(i => { if (i.empresa) empC[i.empresa] = (empC[i.empresa] || 0) + 1; });
    Object.entries(empC).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([e, c], i) => { report += `  ${i + 1}. ${e}: ${c} registros\n`; });

  } else {
    report = `${sep}\n  ANÁLISIS AD-HOC — ${new Date().toLocaleString()}\n${sep}\n\n`;
    report += `Health Score: ${_healthScore(analysis)}/100\n\n`;
    report += `🚨 ALERTAS: ${analysis.alerts.length}\n`;
    analysis.alerts.forEach(a => { report += `  ${a.icon} ${a.title} — ${a.desc}\n`; });
    report += `\n💡 RECOMENDACIONES: ${analysis.recommendations.length}\n`;
    analysis.recommendations.forEach(r => { report += `  ${r.icon} ${r.title}\n    Acción: ${r.action}\n`; });
    report += `\n🔮 PREDICCIONES: ${analysis.predictions.length}\n`;
    analysis.predictions.forEach(p => { report += `  ${p.icon} ${p.title}: ${p.value} ${p.unit}\n`; });
  }

  window._lastAiReport = report;
  toast('📄 Reporte generado', 'var(--green)');
  renderAnalytics4();
}

// ─── REGISTER ───────────────────────────────────────────────────────
registerFn('renderAnalytics4', renderAnalytics4);
registerFn('_aiReport', _aiReport);
window.renderAnalytics4 = renderAnalytics4;
