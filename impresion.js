// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — impresion.js — Diseño de pases (bajo demanda)
// xlsx.js y qrcode.js se cargan solo al necesitar
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree } from './langs.js';
import { safeHtml, toast } from './utils.js';

let _c, _u, _plantillas = [], _selectedPlantilla = null;

export function render(c, u) {
  _c = c; _u = u;
  paint();
  loadPlantillas();
  return () => {};
}

function t(k) { return tr('impresion', k) || trFree('shell', k) || k; }

function paint() {
  const dk = _u.tema === 'dark', bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';

  _c.innerHTML = `
    <div style="max-width:1100px;margin:0 auto">
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:center">
        <select id="imp-plantilla" style="padding:8px 12px;border:1px solid ${bd};border-radius:8px;font-size:12px;background:${bg};color:inherit;min-width:200px">
          <option value="">— ${t('select') || 'Seleccionar plantilla'} —</option>
        </select>
        <button id="imp-new" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ ${t('add') || 'Nueva'}</button>
        <button id="imp-print" style="padding:8px 14px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${trFree('shell', 'print')}</button>
        <button id="imp-qr" style="padding:8px 14px;background:#8b5cf6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">QR</button>
      </div>

      <!-- PREVIEW -->
      <div style="display:grid;grid-template-columns:1fr 300px;gap:16px">
        <div id="imp-canvas" style="background:${bg};border:1px solid ${bd};border-radius:10px;min-height:500px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;padding:20px">
          ${t('select') || 'Selecciona una plantilla para previsualizar'}
        </div>
        <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:14px">
          <div style="font-size:13px;font-weight:700;margin-bottom:10px">${t('settings') || 'Configuración'}</div>
          <div id="imp-config" style="font-size:12px;color:#64748b">
            <div style="margin-bottom:8px">
              <label style="font-size:10px;font-weight:600;display:block;margin-bottom:2px">${t('size') || 'Tamaño'}</label>
              <select id="imp-size" style="width:100%;padding:6px;border:1px solid ${bd};border-radius:6px;font-size:12px;background:${bg};color:inherit">
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="A3">A3</option>
              </select>
            </div>
            <div style="margin-bottom:8px">
              <label style="font-size:10px;font-weight:600;display:block;margin-bottom:2px">${t('destino') || 'Destino'}</label>
              <select id="imp-dest" style="width:100%;padding:6px;border:1px solid ${bd};border-radius:6px;font-size:12px;background:${bg};color:inherit">
                <option value="ref">Referencia</option>
                <option value="ing">Ingresos</option>
                <option value="ag">Agenda</option>
                <option value="emb">Embalaje</option>
              </select>
            </div>
            <div id="imp-fields-list" style="margin-top:12px"></div>
          </div>
        </div>
      </div>
    </div>`;

  _c.querySelector('#imp-print').onclick = () => doPrint();
  _c.querySelector('#imp-qr').onclick = () => generateQR();
  _c.querySelector('#imp-new').onclick = () => newPlantilla();
  _c.querySelector('#imp-plantilla').onchange = (e) => selectPlantilla(e.target.value);
}

async function loadPlantillas() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    const all = await fsGetAll('plantillas');
    const recinto = _u.recinto || '';
    _plantillas = recinto ? all.filter(p => p.recinto === recinto) : all;
    const sel = _c.querySelector('#imp-plantilla');
    if (sel) {
      const opts = _plantillas.map(p => `<option value="${p.id}">${safeHtml(p.nombre || p.id)}</option>`).join('');
      sel.innerHTML = `<option value="">— Seleccionar —</option>` + opts;
    }
  } catch (e) { console.warn('plantillas load:', e); }
}

function selectPlantilla(id) {
  _selectedPlantilla = _plantillas.find(p => p.id === id) || null;
  const canvas = _c.querySelector('#imp-canvas');
  if (!_selectedPlantilla) {
    canvas.innerHTML = '<span style="color:#94a3b8">Selecciona una plantilla</span>';
    return;
  }
  // Preview básico
  const p = _selectedPlantilla;
  canvas.innerHTML = `
    <div style="text-align:center;width:100%">
      <div style="font-size:16px;font-weight:800;margin-bottom:8px">${safeHtml(p.nombre)}</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:16px">${safeHtml(p.size || 'A4')} · ${safeHtml(p.destino || 'ref')}</div>
      <div style="border:2px dashed #cbd5e1;border-radius:8px;padding:40px;color:#94a3b8;font-size:12px">
        Vista previa del pase<br>Campos: ${(p.campos || []).join(', ') || 'ninguno'}
      </div>
    </div>`;
}

async function newPlantilla() {
  const nombre = prompt('Nombre de la plantilla:');
  if (!nombre) return;
  try {
    const { fsAdd } = await import('./firestore.js');
    await fsAdd('plantillas', {
      nombre, recinto: _u.recinto || '', size: 'A4', destino: 'ref',
      campos: ['matricula', 'empresa', 'hall', 'nombre'], creado: new Date().toISOString()
    });
    toast('Plantilla creada ✓', '#10b981');
    loadPlantillas();
  } catch (e) { toast(trFree('shell', 'error'), '#ef4444'); }
}

function doPrint() {
  if (!_selectedPlantilla) { toast('Selecciona una plantilla', '#f59e0b'); return; }
  window.print();
}

async function generateQR() {
  try {
    toast('Generando QR...', '#8b5cf6');
    // Carga dinámica de qrcode
    if (!window.QRCode) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    const canvas = _c.querySelector('#imp-canvas');
    canvas.innerHTML = '<div id="qr-target" style="text-align:center;padding:20px"></div>';
    new window.QRCode(document.getElementById('qr-target'), {
      text: `https://beunifyt.web.app/track/${_selectedPlantilla?.id || 'demo'}`,
      width: 200, height: 200
    });
  } catch (e) { toast('Error generando QR', '#ef4444'); }
}
