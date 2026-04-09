// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — mensajes.js — Mensajes de rampa
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { safeHtml, toast, nowLocal } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';


function _isDark(){try{return getThemeColors(getCurrentTheme()).group==='dark';}catch(e){return false;}}
const C=()=>{try{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed',inp:t.inp||t.bg};}catch(e){return{bg:'#fff',card:'#fff',bg2:'#f8fafc',border:'#e2e8f0',text:'#0f172a',t3:'#64748b',blue:'#2563eb',bll:'#eff6ff',green:'#0d9f6e',red:'#dc2626',amber:'#d97706',purple:'#7c3aed',inp:'#f8fafc'};}};
let _c, _u, _data = [], _unsub;

export function render(c, u) { _c = c; _u = u; _data = []; paint(); loadData(); return () => { if (_unsub) _unsub(); }; }
function t(k) { return trFree('mensajes', k) || trFree('shell', k) || k; }

function paint() {
  const dk = _isDark(), bg = dk ? '#1e293b' : '#fff', bd = dk ? '#334155' : '#e2e8f0';
  _c.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700">📢 Mensajes</span>
        <button id="msg-new" style="padding:8px 14px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">+ Nuevo</button>
      </div>
      <div id="msg-list" style="display:grid;gap:8px"></div>
      <div id="msg-em" style="display:none;text-align:center;padding:40px;color:#94a3b8;font-size:13px">${t('noData')}</div>
    </div>`;
  _c.querySelector('#msg-new').onclick = () => openModal();
  renderList();
}

async function loadData() {
  try {
    const { fsListen } = await import('./firestore.js');
    if (_unsub) _unsub();
    _unsub = await fsListen('mensajes', docs => { _data = docs.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')); renderList(); });
  } catch (e) { console.warn('mensajes load:', e); }
}

function renderList() {
  const list = _c.querySelector('#msg-list'), em = _c.querySelector('#msg-em');
  if (!list) return;
  if (!_data.length) { list.innerHTML = ''; if (em) em.style.display = 'block'; return; }
  if (em) em.style.display = 'none';
  const dk = _isDark();
  list.innerHTML = _data.map(d => {
    const urgent = d.urgencia === 'alta';
    return `<div style="background:${dk ? '#1e293b' : '#fff'};border:1px solid ${urgent ? '#ef4444' : (dk ? '#334155' : '#e2e8f0')};border-radius:10px;padding:12px;${d.leido ? 'opacity:0.6;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:13px;font-weight:700">${urgent ? '🔴 ' : ''}${safeHtml(d.titulo || t('sinTitulo'))}</span>
        <span style="font-size:10px;color:#94a3b8">${safeHtml(d.fecha || '')}</span>
      </div>
      <div style="font-size:12px;color:#64748b;margin-bottom:8px">${safeHtml(d.contenido || '')}</div>
      <div style="display:flex;gap:6px">
        ${!d.leido ? `<button onclick="window._beuReadMsg('${d.id}')" style="padding:3px 10px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:10px;cursor:pointer">Marcar leído</button>` : ''}
        <button onclick="window._beuDelMsg('${d.id}')" style="padding:3px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:10px;cursor:pointer">${t('delete')}</button>
      </div>
    </div>`;
  }).join('');
}

function openModal() {
  const dk = _isDark();
  const old = document.getElementById('beu-msg-modal'); if (old) old.remove();
  const m = document.createElement('div'); m.id = 'beu-msg-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:8000;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `<div style="background:${dk ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:420px;width:100%;color:inherit">
    <div style="font-size:15px;font-weight:700;margin-bottom:16px">Nuevo mensaje</div>
    <div style="display:grid;gap:10px">
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Título</label><input id="msg-tit" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit"></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Contenido</label><textarea id="msg-cont" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit;min-height:80px;resize:vertical"></textarea></div>
      <div><label style="font-size:10px;font-weight:600;color:#64748b">Urgencia</label><select id="msg-urg" style="width:100%;padding:8px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:6px;font-size:12px;background:${dk ? '#0f172a' : '#f8fafc'};color:inherit">
        <option value="normal">Normal</option><option value="alta">Alta</option>
      </select></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
      <button id="mgn" style="padding:8px 16px;border:1px solid ${dk ? '#475569' : '#e2e8f0'};border-radius:8px;background:none;cursor:pointer;font-size:12px;color:inherit">${t('cancel')}</button>
      <button id="mgs" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700">Enviar</button>
    </div></div>`;
  m.querySelector('#mgn').onclick = () => m.remove(); m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#mgs').onclick = async () => {
    const titulo = m.querySelector('#msg-tit').value;
    const contenido = m.querySelector('#msg-cont').value;
    const urgencia = m.querySelector('#msg-urg').value;
    if (!titulo) return;
    try {
      const { fsAdd } = await import('./firestore.js');
      await fsAdd('mensajes', { titulo, contenido, urgencia, fecha: nowLocal(), autor: _u.nombre || _u.uid, leido: false });
      toast('Enviado ✓', '#10b981'); m.remove();
    } catch (e) { toast(t('error'), '#ef4444'); }
  };
  document.body.appendChild(m);
}

window._beuReadMsg = async id => { try { const { fsUpdate } = await import('./firestore.js'); await fsUpdate(`mensajes/${id}`, { leido: true }); } catch (e) {} };
window._beuDelMsg = async id => { if (!confirm(t('confirm') + '?')) return; try { const { fsDel } = await import('./firestore.js'); await fsDel(`mensajes/${id}`); } catch (e) { toast(t('error'), '#ef4444'); } };
