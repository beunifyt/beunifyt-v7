// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — vehiculos.js — Historial de cambios
// Log: quién modificó qué y cuándo
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, formatDate } from './utils.js';

let _c, _u, _data = [];

export function render(c, u) {
  _c = c; _u = u; _data = [];
  paint(); loadData();
  return () => {};
}

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:900px;margin:0 auto">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px">📜 Historial de cambios</div>
      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:${dk ? '#0f172a' : '#f8fafc'}">
            <th style="padding:8px 12px;text-align:left;font-weight:600">Fecha</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Usuario</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Acción</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Detalle</th>
          </tr></thead>
          <tbody id="hist-tb"></tbody>
        </table>
        <div id="hist-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell', 'noData')}</div>
      </div>
    </div>`;
  renderRows();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    _data = (await fsGetAll('historial')).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
    renderRows();
  } catch (e) { console.warn('historial load:', e); }
}

function renderRows() {
  const tb = _c.querySelector('#hist-tb'), em = _c.querySelector('#hist-em');
  if (!tb) return;
  if (!_data.length) { tb.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  tb.innerHTML = _data.slice(0, 100).map(d => `<tr style="border-top:1px solid ${dk ? '#334155' : '#f1f5f9'}">
    <td style="padding:8px 12px;font-size:11px">${formatDate(d.fecha)}</td>
    <td style="padding:8px 12px">${safeHtml(d.usuario || '—')}</td>
    <td style="padding:8px 12px"><span style="padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;background:${actionColor(d.accion)}">${safeHtml(d.accion || '—')}</span></td>
    <td style="padding:8px 12px;font-size:11px;color:#64748b;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(d.detalle || '—')}</td>
  </tr>`).join('');
}

function actionColor(a) {
  if (a === 'crear') return '#dcfce7';
  if (a === 'editar') return '#dbeafe';
  if (a === 'eliminar') return '#fecaca';
  return '#f1f5f9';
}
