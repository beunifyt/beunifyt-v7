// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — papelera.js — Registros eliminados
// Solo admin/supervisor
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, toast } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';


function _isDark(){try{return getThemeColors(getCurrentTheme()).group==='dark';}catch(e){return false;}}
const C=()=>{try{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed',inp:t.inp||t.bg};}catch(e){return{bg:'#fff',card:'#fff',bg2:'#f8fafc',border:'#e2e8f0',text:'#0f172a',t3:'#64748b',blue:'#2563eb',bll:'#eff6ff',green:'#0d9f6e',red:'#dc2626',amber:'#d97706',purple:'#7c3aed',inp:'#f8fafc'};}};
let _c, _u, _data = [];

export function render(c, u) {
  _c = c; _u = u; _data = [];
  paint(); loadData();
  return () => {};
}

function t(k) { return trFree('shell', k) || k; }

function paint() {
  const dk = _isDark(), bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700">🗑 Papelera</span>
        <button id="pap-empty" style="padding:6px 12px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">Vaciar papelera</button>
      </div>
      <div style="background:${bg};border:1px solid ${bd};border-radius:10px;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:${dk ? '#0f172a' : '#f8fafc'}">
            <th style="padding:8px 12px;text-align:left;font-weight:600">Origen</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Dato</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600">Eliminado</th>
            <th style="padding:8px 12px;text-align:center">Acciones</th>
          </tr></thead>
          <tbody id="pap-tb"></tbody>
        </table>
        <div id="pap-em" style="display:none;text-align:center;padding:32px;color:#94a3b8;font-size:13px">${t('noData')}</div>
      </div>
    </div>`;
  _c.querySelector('#pap-empty').onclick = () => vaciar();
  renderRows();
}

async function loadData() {
  try {
    const { fsGetAll } = await import('./firestore.js');
    _data = await fsGetAll('papelera');
    renderRows();
  } catch (e) { console.warn('papelera load:', e); }
}

function renderRows() {
  const tb = _c.querySelector('#pap-tb'), em = _c.querySelector('#pap-em');
  if (!tb) return;
  if (!_data.length) { tb.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _isDark();
  tb.innerHTML = _data.map(d => `<tr style="border-top:1px solid ${dk ? '#334155' : '#f1f5f9'}">
    <td style="padding:8px 12px">${safeHtml(d.origen || '—')}</td>
    <td style="padding:8px 12px;font-weight:600">${safeHtml(d.dato || d.matricula || d.nombre || '—')}</td>
    <td style="padding:8px 12px;font-size:11px;color:#94a3b8">${safeHtml(d.eliminado || '—')}</td>
    <td style="padding:8px 12px;text-align:center">
      <button onclick="window._beuRestore('${d.id}')" style="background:#10b981;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:10px;cursor:pointer;margin-right:4px">Restaurar</button>
      <button onclick="window._beuPermDel('${d.id}')" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:3px 8px;font-size:10px;cursor:pointer">Borrar</button>
    </td></tr>`).join('');
}

async function vaciar() {
  if (!confirm('¿Vaciar toda la papelera? Esta acción es irreversible.')) return;
  try {
    const { fsDel } = await import('./firestore.js');
    for (const d of _data) await fsDel(`papelera/${d.id}`);
    _data = []; renderRows();
    toast('Papelera vaciada ✓', '#10b981');
  } catch (e) { toast(t('error'), '#ef4444'); }
}

window._beuRestore = async (id) => {
  try {
    const item = _data.find(d => d.id === id);
    if (!item || !item.origen) return;
    const { fsSet, fsDel } = await import('./firestore.js');
    const { origen, eliminado, ...restData } = item;
    await fsSet(`${origen}/${id}`, restData);
    await fsDel(`papelera/${id}`);
    _data = _data.filter(d => d.id !== id); renderRows();
    toast('Restaurado ✓', '#10b981');
  } catch (e) { toast(t('error'), '#ef4444'); }
};

window._beuPermDel = async (id) => {
  if (!confirm('¿Borrar definitivamente?')) return;
  try {
    const { fsDel } = await import('./firestore.js');
    await fsDel(`papelera/${id}`);
    _data = _data.filter(d => d.id !== id); renderRows();
    toast('Eliminado ✓', '#f59e0b');
  } catch (e) { toast(t('error'), '#ef4444'); }
};
