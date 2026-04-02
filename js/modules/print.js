// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/print.js
// Modulo de impresion. Carga 100% lazy — 0KB hasta que se usa.
// Se importa con: const { printEntry } = await import('./print.js')
// ═══════════════════════════════════════════════════════════

import { safeHtml, formatDateTime } from '../utils.js';

// ── Cargar fuentes de impresion (solo cuando se necesitan) ───
let _fontsLoaded = false;
async function _loadPrintFonts() {
  if (_fontsLoaded) return;
  if (document.getElementById('print-fonts')) { _fontsLoaded = true; return; }
  const link = document.createElement('link');
  link.id   = 'print-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap';
  document.head.appendChild(link);
  await new Promise(r => { link.onload = r; setTimeout(r, 2000); });
  _fontsLoaded = true;
}

// ═══════════════════════════════════════════════════════════
// TICKET DE ENTRADA — formato A6 / media hoja
// ═══════════════════════════════════════════════════════════
export async function printEntry(entry, eventName = 'BeUnifyT') {
  await _loadPrintFonts();

  const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${entry.matricula}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A6 landscape;margin:0}
body{
  font-family:'IBM Plex Sans','Segoe UI',Arial,sans-serif;
  background:#fff;color:#000;
  width:148mm;height:105mm;font-size:9pt;
  overflow:hidden
}
.page{padding:5mm 7mm;height:105mm;display:flex;flex-direction:column;gap:2mm}
.top{display:flex;align-items:center;gap:4mm;border-bottom:2px solid #000;padding-bottom:3mm}
.mat-box{
  border:3px solid #000;border-radius:5px;
  padding:2px 10px;text-align:center;flex:1
}
.mat-v{font-size:22pt;font-weight:700;font-family:'Courier New',monospace;letter-spacing:3px;line-height:1.1}
.mat-l{font-size:5pt;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:2px}
.type-box{
  border:2px solid #000;border-radius:5px;
  padding:2px 8px;text-align:center;min-width:28mm
}
.type-v{font-size:14pt;font-weight:700;line-height:1.1}
.type-l{font-size:5pt;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:1px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm;flex:1}
.field{border-bottom:1px solid #ccc;padding:0.5mm 1mm;min-height:7mm}
.field-l{font-size:5.5pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#777}
.field-v{font-size:10pt;font-weight:500;margin-top:0.5mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.field-mono{font-family:'Courier New',monospace;letter-spacing:2px}
.alert{
  background:#fef2f2;border:1.5px solid #dc2626;border-radius:3px;
  padding:1mm 3mm;font-size:7pt;font-weight:700;color:#dc2626
}
.footer{
  margin-top:auto;border-top:1px solid #ddd;padding-top:1mm;
  font-size:6pt;color:#aaa;display:flex;justify-content:space-between
}
.btn-wrap{position:fixed;bottom:8px;right:8px;display:flex;gap:5px;z-index:999}
@media print{.btn-wrap{display:none}}
</style></head><body>
<div class="page">
  <div class="top">
    <div class="mat-box">
      <div class="mat-v">${safeHtml(entry.matricula || '—')}</div>
      <div class="mat-l">Matricula</div>
    </div>
    ${entry.tipo ? `
    <div class="type-box">
      <div class="type-v">${safeHtml(_tipoIcon(entry.tipo))}</div>
      <div class="type-l">${safeHtml(entry.tipo)}</div>
    </div>` : ''}
    ${entry.remolque ? `
    <div class="type-box">
      <div class="type-v" style="font-size:10pt;font-family:'Courier New',monospace">${safeHtml(entry.remolque)}</div>
      <div class="type-l">Remolque</div>
    </div>` : ''}
  </div>

  <div class="grid">
    <div class="field">
      <div class="field-l">Empresa</div>
      <div class="field-v">${safeHtml(entry.empresa || '—')}</div>
    </div>
    <div class="field">
      <div class="field-l">Stand / Pabellon</div>
      <div class="field-v field-mono">${safeHtml(entry.stand || '—')}</div>
    </div>
    <div class="field">
      <div class="field-l">Conductor</div>
      <div class="field-v">${safeHtml(entry.conductor || '—')}</div>
    </div>
    <div class="field">
      <div class="field-l">Hora entrada</div>
      <div class="field-v field-mono">${formatDateTime(entry.ts)}</div>
    </div>
    <div class="field">
      <div class="field-l">Puerta</div>
      <div class="field-v field-mono">${safeHtml(entry.gateId || '—')}</div>
    </div>
    <div class="field">
      <div class="field-l">Operador</div>
      <div class="field-v">${safeHtml(entry.operador || '—')}</div>
    </div>
  </div>

  <div class="footer">
    <span>${safeHtml(eventName)}</span>
    <span>${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</span>
  </div>
</div>

<div class="btn-wrap">
  <button onclick="window.print()" style="
    background:#111;color:#fff;border:none;border-radius:20px;
    padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer">
    Imprimir
  </button>
  <button onclick="window.close()" style="
    background:#fff;color:#111;border:1.5px solid #ccc;border-radius:20px;
    padding:7px 12px;font-size:12px;cursor:pointer">
    Cerrar
  </button>
</div>
</body></html>`;

  _openPrintWindow(html);
}

// ═══════════════════════════════════════════════════════════
// LISTADO DE ENTRADAS — formato A4
// ═══════════════════════════════════════════════════════════
export async function printEntryList(entries, title = 'Listado de entradas', eventName = 'BeUnifyT') {
  await _loadPrintFonts();

  const rows = entries.map(e => `
    <tr>
      <td class="mono">${safeHtml(e.matricula || '—')}</td>
      <td>${safeHtml(e.empresa || '—')}</td>
      <td>${safeHtml(e.conductor || '—')}</td>
      <td>${safeHtml(e.tipo || '—')}</td>
      <td class="mono">${safeHtml(e.stand || '—')}</td>
      <td class="mono">${formatDateTime(e.ts)}</td>
      <td class="mono">${e.salida ? formatDateTime(e.salida) : '—'}</td>
      <td>
        <span style="
          display:inline-block;padding:1px 6px;border-radius:4px;font-size:7pt;font-weight:700;
          background:${e.salida ? '#f1f5f9' : '#ecfdf5'};
          color:${e.salida ? '#64748b' : '#059669'}
        ">${e.salida ? 'Salida' : 'En recinto'}</span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${safeHtml(title)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4 landscape;margin:10mm}
body{font-family:'IBM Plex Sans','Segoe UI',Arial,sans-serif;font-size:8pt;color:#111}
.doc-header{display:flex;justify-content:space-between;align-items:flex-start;
  margin-bottom:6mm;padding-bottom:3mm;border-bottom:2px solid #000}
.doc-title{font-size:14pt;font-weight:700}
.doc-sub{font-size:8pt;color:#6b7280;margin-top:1mm}
.doc-meta{text-align:right;font-size:7pt;color:#6b7280;line-height:1.6}
table{width:100%;border-collapse:collapse}
th{background:#0f172a;color:#fff;padding:3mm 2mm;text-align:left;
  font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
td{padding:2.5mm 2mm;border-bottom:0.5pt solid #e2e8f0;font-size:8pt;
  vertical-align:top}
tr:nth-child(even) td{background:#f8fafc}
.mono{font-family:'Courier New',monospace;font-weight:600;letter-spacing:1px}
.doc-footer{margin-top:4mm;font-size:6.5pt;color:#9ca3af;
  display:flex;justify-content:space-between;border-top:0.5pt solid #e2e8f0;padding-top:2mm}
.total{font-size:9pt;font-weight:700;margin-top:3mm}
.btn-wrap{position:fixed;bottom:8px;right:8px;display:flex;gap:5px;z-index:999}
@media print{.btn-wrap{display:none}}
</style></head><body>
<div class="doc-header">
  <div>
    <div class="doc-title">${safeHtml(title)}</div>
    <div class="doc-sub">${safeHtml(eventName)}</div>
  </div>
  <div class="doc-meta">
    Total: ${entries.length} vehículos<br>
    En recinto: ${entries.filter(e => !e.salida).length}<br>
    Generado: ${new Date().toLocaleString('es-ES')}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Matrícula</th>
      <th>Empresa</th>
      <th>Conductor</th>
      <th>Tipo</th>
      <th>Stand</th>
      <th>Entrada</th>
      <th>Salida</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="doc-footer">
  <span>${safeHtml(eventName)} · BeUnifyT v7</span>
  <span>Página 1</span>
</div>

<div class="btn-wrap">
  <button onclick="window.print()" style="
    background:#111;color:#fff;border:none;border-radius:20px;
    padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer">
    Imprimir
  </button>
  <button onclick="window.close()" style="
    background:#fff;color:#111;border:1.5px solid #ccc;border-radius:20px;
    padding:7px 12px;font-size:12px;cursor:pointer">
    Cerrar
  </button>
</div>
</body></html>`;

  _openPrintWindow(html, true);
}

// ═══════════════════════════════════════════════════════════
// EXPORTAR EXCEL
// ═══════════════════════════════════════════════════════════
export async function exportToExcel(entries, filename = 'beunifyt-export') {
  // Cargar SheetJS lazy
  if (!window.XLSX) {
    await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  }

  const data = entries.map(e => ({
    'Matrícula':  e.matricula || '',
    'Empresa':    e.empresa   || '',
    'Conductor':  e.conductor || '',
    'Tipo':       e.tipo      || '',
    'Stand':      e.stand     || '',
    'Remolque':   e.remolque  || '',
    'Puerta':     e.gateId    || '',
    'Entrada':    e.ts        || '',
    'Salida':     e.salida    || '',
    'Estado':     e.salida ? 'Salida' : 'En recinto',
    'Operador':   e.operador  || '',
  }));

  const wb = window.XLSX.utils.book_new();
  const ws = window.XLSX.utils.json_to_sheet(data);
  window.XLSX.utils.book_append_sheet(wb, ws, 'Entradas');
  window.XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function _openPrintWindow(html, landscape = false) {
  const w = window.open('', '_blank',
    landscape ? 'width=1100,height=700,scrollbars=yes' : 'width=700,height=550,scrollbars=yes'
  );
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => { try { w.focus(); } catch(e){} }, 400);
  } else {
    alert('Activa las ventanas emergentes para imprimir');
  }
}

function _tipoIcon(tipo) {
  const icons = {
    trailer: '🚛', camion: '🚚', furgoneta: '🚐',
    semi: '🚛', coche: '🚗', otro: '🚙'
  };
  return icons[tipo] || '🚙';
}

async function _loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
