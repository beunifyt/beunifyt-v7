// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — auditoria.js — Gestión de archivos
// Documentos adjuntos, exports guardados
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, toast } from './utils.js';

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
      <div style="font-size:15px;font-weight:700;margin-bottom:12px">📂 Archivos</div>
      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:${dk ? '#0f172a' : '#f8fafc'}">
            <th style="padding:8px 12px;text-align:left;font-weight:600">Nombre</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Tipo</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Fecha</th>
            <th style="padding:8px 12px;text-align:center">Acciones</th>
          </tr></thead>
          <tbody id="aud-tb"></tbody>
        </table>
        <div id="aud-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${trFree('shell', 'noData')}</div>
      </div>
    </div>`;
  renderRows();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    _data = await fsGetAll('archivos');
    renderRows();
  } catch (e) { console.warn('archivos load:', e); }
}

function renderRows() {
  const tb = _c.querySelector('#aud-tb'), em = _c.querySelector('#aud-em');
  if (!tb) return;
  if (!_data.length) { tb.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _u.tema === 'dark';
  tb.innerHTML = _data.map(d => `<tr style="border-top:1px solid ${dk ? '#334155' : '#f1f5f9'}">
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.nombre || '—')}</td>
    <td style="padding:8px 12px">${safeHtml(d.tipo || '—')}</td>
    <td style="padding:8px 12px;font-size:11px">${safeHtml(d.fecha || '—')}</td>
    <td style="padding:8px 12px;text-align:center">
      ${d.url ? `<a href="${safeHtml(d.url)}" target="_blank" style="color:#3b82f6;font-size:11px;text-decoration:none">Descargar</a>` : '—'}
    </td></tr>`).join('');
}
