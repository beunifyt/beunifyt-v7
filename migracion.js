// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — migracion.js — Backup y migración
// Solo superadmin
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { toast, todayISO } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';

let _c, _u;


function _isDark(){try{return getThemeColors(getCurrentTheme()).group==='dark';}catch(e){return false;}}
export function render(c, u) { _c = c; _u = u; paint(); return () => {}; }
function t(k) { return trFree('migracion', k) || trFree('shell', k) || k; }

function paint() {
  const dk = _isDark(), bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:600px;margin:0 auto">
      <div style="font-size:15px;font-weight:700;margin-bottom:16px">💾 Migración y Backup</div>

      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:20px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">Exportar todo</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:12px">Descarga un archivo JSON con todos los datos: usuarios, ingresos, referencias, agenda, conductores, empresas, recintos, eventos, mensajes.</div>
        <button id="mig-export" style="padding:10px 20px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">${t('export')} JSON</button>
      </div>

      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;padding:20px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">Importar</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:12px">Sube un archivo JSON exportado previamente para restaurar datos.</div>
        <input type="file" id="mig-file" accept=".json" style="font-size:12px">
        <button id="mig-import" style="margin-top:8px;padding:10px 20px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">${t('import')} JSON</button>
      </div>

      <div style="background:${bg};border:1px solid #ef4444;border-radius:10px;padding:20px">
        <div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:8px">Zona peligrosa</div>
        <div style="font-size:12px;color:#64748b;margin-bottom:12px">Borrar TODOS los datos de este entorno. Esta acción es irreversible.</div>
        <button id="mig-wipe" style="padding:10px 20px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">Borrar todo</button>
      </div>
    </div>`;

  _c.querySelector('#mig-export').onclick = () => doExport();
  _c.querySelector('#mig-import').onclick = () => doImport();
  _c.querySelector('#mig-wipe').onclick = () => doWipe();
}

const COLLECTIONS = ['users', 'ingresos', 'accesos', 'referencias', 'agenda', 'conductores', 'empresas', 'recintos', 'eventos', 'mensajes', 'plantillas', 'historial', 'archivos', 'papelera'];

async function doExport() {
  try {
    toast('Exportando...', '#3b82f6');
    const { fsGetAll } = await import('./firestore.js');
    const backup = {};
    for (const col of COLLECTIONS) {
      try { backup[col] = await fsGetAll(col); } catch { backup[col] = []; }
    }
    backup._meta = { fecha: new Date().toISOString(), usuario: _u.uid, version: 'v8' };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `BeUnifyT_backup_${todayISO()}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast('Backup exportado ✓', '#10b981');
  } catch (e) { toast(t('error'), '#ef4444'); console.error(e); }
}

async function doImport() {
  const file = _c.querySelector('#mig-file').files[0];
  if (!file) { toast(t('selArchivo'), '#f59e0b'); return; }
  if (!confirm('¿Importar datos? Los registros existentes con el mismo ID se sobrescribirán.')) return;
  try {
    toast('Importando...', '#3b82f6');
    const text = await file.text();
    const data = JSON.parse(text);
    const { fsSet } = await import('./firestore.js');
    let count = 0;
    for (const col of COLLECTIONS) {
      if (data[col] && Array.isArray(data[col])) {
        for (const doc of data[col]) {
          if (doc.id) {
            const { id, ...rest } = doc;
            await fsSet(`${col}/${id}`, rest);
            count++;
          }
        }
      }
    }
    toast(`Importados ${count} registros ✓`, '#10b981');
  } catch (e) { toast('Error al importar: ' + e.message, '#ef4444'); }
}

async function doWipe() {
  if (!confirm('⚠ ¿BORRAR TODOS LOS DATOS? Esta acción es IRREVERSIBLE.')) return;
  if (!confirm('¿Estás COMPLETAMENTE seguro?')) return;
  try {
    toast('Borrando...', '#ef4444');
    const { fsGetAll, fsDel } = await import('./firestore.js');
    for (const col of COLLECTIONS) {
      try {
        const docs = await fsGetAll(col);
        for (const d of docs) await fsDel(`${col}/${d.id}`);
      } catch {}
    }
    toast(t('borrado'), '#ef4444');
  } catch (e) { toast(t('error'), '#ef4444'); }
}
