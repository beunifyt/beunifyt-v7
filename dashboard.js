// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — dashboard.js — Resumen visual (solo lectura)
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr } from './langs.js';
import { safeHtml, todayISO } from './utils.js';

export function render(container, usuario) {
  const t = (k) => tr('dash', k) || k;
  const isDark = usuario.tema === 'dark';
  const cardBg = isDark ? '#1e293b' : '#fff';
  const cardBorder = isDark ? '#334155' : '#e2e8f0';

  container.innerHTML = `
    <div style="max-width:960px;margin:0 auto">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:16px">${t('title')} — ${safeHtml(usuario.nombre)}</h2>

      <!-- STAT CARDS -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:20px">
        <div class="stat-card" id="stat-recinto" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800" id="val-recinto">—</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${t('enRecinto')}</div>
        </div>
        <div class="stat-card" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800" id="val-refs">—</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${t('referencias')}</div>
        </div>
        <div class="stat-card" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800" id="val-ingresos">—</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${t('ingresosHoy')}</div>
        </div>
        <div class="stat-card" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800" id="val-agenda">—</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${t('agendaHoy')}</div>
        </div>
        <div class="stat-card" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:800" id="val-msgs">—</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">${t('mensajes')}</div>
        </div>
      </div>

      <!-- ÚLTIMAS ENTRADAS -->
      <div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:10px;padding:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">${t('ultimasEntradas')}</div>
        <div id="dash-latest" style="font-size:12px;color:#64748b">
          ${tr('shell', 'loading') || 'Cargando...'}
        </div>
      </div>
    </div>
  `;

  // Cargar datos asíncronamente
  loadDashData(usuario);
}

async function loadDashData(usuario) {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const hoy = todayISO();

    // Estas queries dependen de la estructura de datos en Firestore
    // Se adaptan al recinto del usuario
    const recinto = usuario.recinto || '';

    // Intentar cargar datos (puede fallar si no hay datos aún)
    Promise.allSettled([
      fsGetAll('ingresos').then(data => {
        const enRecinto = data.filter(d => d.estado === 'EN_RECINTO' && (!recinto || d.recinto === recinto));
        const hoyData = data.filter(d => (d.fecha || '').startsWith(hoy) && (!recinto || d.recinto === recinto));
        const el1 = document.getElementById('val-recinto');
        const el2 = document.getElementById('val-ingresos');
        if (el1) el1.textContent = enRecinto.length;
        if (el2) el2.textContent = hoyData.length;

        // Últimas 5 entradas
        const latest = document.getElementById('dash-latest');
        if (latest) {
          const sorted = data.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, 5);
          if (sorted.length === 0) {
            latest.textContent = tr('shell', 'noData') || 'Sin datos';
          } else {
            latest.innerHTML = sorted.map(d =>
              `<div style="padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05)">${safeHtml(d.matricula || '—')} · ${safeHtml(d.empresa || '—')} · ${safeHtml(d.fecha || '—')}</div>`
            ).join('');
          }
        }
      }),
      fsGetAll('referencias').then(data => {
        const el = document.getElementById('val-refs');
        if (el) el.textContent = data.filter(d => !recinto || d.recinto === recinto).length;
      }),
      fsGetAll('agenda').then(data => {
        const el = document.getElementById('val-agenda');
        if (el) el.textContent = data.filter(d => (d.fecha || '').startsWith(hoy) && (!recinto || d.recinto === recinto)).length;
      }),
      fsGetAll('mensajes').then(data => {
        const el = document.getElementById('val-msgs');
        if (el) el.textContent = data.filter(d => !d.leido).length;
      }),
    ]);
  } catch (e) {
    console.warn('Dashboard data load error:', e);
  }
}
