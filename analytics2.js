// BeUnifyT v8 — tabs/analytics2.js — Event Tracker
import { DB, iF, SID, registerFn, callFn } from '../core/context.js';
import { esc, fmt } from '../core/shared.js';
import { isSA, isSup } from '../auth.js';
import { toast, uid, nowLocal } from '../utils.js';

// ─── EVENT STORAGE (IndexedDB) ──────────────────────────────────────
const DB_NAME = 'beu_events';
const DB_VER = 1;
const STORE = 'events';
let _idb = null;

function _openIDB() {
  return new Promise((res, rej) => {
    if (_idb) return res(_idb);
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('module', 'module', { unique: false });
        s.createIndex('action', 'action', { unique: false });
        s.createIndex('timestamp', 'timestamp', { unique: false });
        s.createIndex('category', 'category', { unique: false });
      }
    };
    req.onsuccess = e => { _idb = e.target.result; res(_idb); };
    req.onerror = e => rej(e.target.error);
  });
}

// ─── EVENT TOGGLES ──────────────────────────────────────────────────
if (!window._evtToggles) window._evtToggles = {
  form_interactions: true,
  business_events: true,
  user_behavior: true,
  system_health: true,
  audit_trail: true,
};

// ─── TRACK EVENT ────────────────────────────────────────────────────
const _evtBatch = [];
let _batchTimer = null;

export async function trackEvent(evt) {
  const event = {
    id: uid(),
    timestamp: new Date().toISOString(),
    module: evt.module || 'system',
    action: evt.action || 'unknown',
    category: evt.category || 'system',
    userId: evt.userId || SID,
    companyId: evt.companyId || '',
    entity: evt.entity || null,
    metadata: evt.metadata || {},
    duration: evt.duration || 0,
    success: evt.success !== false,
    error: evt.error || '',
  };
  // Check toggle
  const cat = event.category;
  if (window._evtToggles && window._evtToggles[cat] === false) return;
  _evtBatch.push(event);
  if (!_batchTimer) {
    _batchTimer = setTimeout(_flushBatch, 500);
  }
}

async function _flushBatch() {
  _batchTimer = null;
  if (!_evtBatch.length) return;
  try {
    const db = await _openIDB();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const batch = _evtBatch.splice(0);
    batch.forEach(e => store.put(e));
  } catch (e) { console.warn('[tracker] flush error', e); }
}

// ─── GET EVENTS ─────────────────────────────────────────────────────
async function _getEvents(filters) {
  try {
    const db = await _openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        let data = req.result || [];
        if (filters?.module) data = data.filter(e => e.module === filters.module);
        if (filters?.action) data = data.filter(e => e.action === filters.action);
        if (filters?.category) data = data.filter(e => e.category === filters.category);
        if (filters?.dateFrom) data = data.filter(e => e.timestamp >= filters.dateFrom);
        if (filters?.dateTo) data = data.filter(e => e.timestamp <= filters.dateTo + 'T23:59');
        data.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        res(data);
      };
      req.onerror = () => rej(req.error);
    });
  } catch (e) { return []; }
}

async function _getEventCount() {
  try {
    const db = await _openIDB();
    return new Promise((res) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).count();
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(0);
    });
  } catch (e) { return 0; }
}

// ─── STATE ──────────────────────────────────────────────────────────
if (!window._trkState) window._trkState = {
  filter: 'all', dateFrom: '', dateTo: '', sub: 'live', searchQ: '',
};

// ─── RENDER ─────────────────────────────────────────────────────────
export async function renderAnalytics2() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const S = window._trkState;

  el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)"><div class="spinner" style="margin:0 auto"></div></div>';

  const events = await _getEvents({
    module: S.filter === 'all' ? null : S.filter,
    dateFrom: S.dateFrom || null,
    dateTo: S.dateTo || null,
  });

  const totalCount = await _getEventCount();
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter(e => e.timestamp.startsWith(today));
  const errEvents = events.filter(e => !e.success);

  // Category counts
  const catCounts = {};
  events.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  const moduleCounts = {};
  events.forEach(e => { moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1; });
  const actionCounts = {};
  events.forEach(e => { actionCounts[e.action] = (actionCounts[e.action] || 0) + 1; });

  // Per-hour today
  const hourMap = {};
  for (let i = 0; i < 24; i++) hourMap[String(i).padStart(2, '0')] = 0;
  todayEvents.forEach(e => { const h = e.timestamp.slice(11, 13); if (h) hourMap[h]++; });
  const hourArr = Object.entries(hourMap);
  const hourMax = Math.max(...hourArr.map(x => x[1]), 1);

  // Module colors
  const MOD_CLR = { ingresos: '#3b82f6', ingresos2: '#10b981', conductores: '#f59e0b', agenda: '#8b5cf6', flota: '#06b6d4', auth: '#ef4444', system: '#64748b' };
  const CAT_ICO = { form_interactions: '📝', business_events: '💼', user_behavior: '👤', system_health: '⚙️', audit_trail: '📋' };

  const barChart = (arr, color) => {
    if (!arr.length) return '<div style="padding:8px;text-align:center;font-size:11px;color:var(--text3)">Sin eventos</div>';
    const mx = Math.max(...arr.map(x => x[1]), 1);
    return arr.filter(x => x[1] > 0).slice(0, 10).map(([k, v]) =>
      `<div class="bar-row"><span style="font-size:10px;min-width:70px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${esc(k)}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(v / mx * 100)}%;background:${color}"></div></div><span class="bar-val">${v}</span></div>`
    ).join('');
  };

  // Toggles HTML
  const togglesHtml = Object.entries(window._evtToggles).map(([k, v]) =>
    `<label style="display:inline-flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;padding:3px 8px;background:${v ? 'var(--gll)' : 'var(--bg3)'};border-radius:12px;border:1px solid ${v ? '#bbf7d0' : 'var(--border)'}" onclick="window._evtToggles['${k}']=!window._evtToggles['${k}'];window._op.renderAnalytics2()">
      <span>${CAT_ICO[k] || '📌'}</span><span>${k.replace(/_/g, ' ')}</span>
      <span style="font-weight:800;color:${v ? 'var(--green)' : 'var(--text3)'}">${v ? 'ON' : 'OFF'}</span>
    </label>`
  ).join(' ');

  // Sub tabs
  const subTabs = [['live', '🔴 Live'], ['history', '📜 Historial'], ['config', '⚙️ Config']];
  const subHtml = subTabs.map(([id, lbl]) =>
    `<button class="btn btn-xs ${S.sub === id ? 'btn-p' : 'btn-gh'}" onclick="window._trkState.sub='${id}';window._op.renderAnalytics2()">${lbl}</button>`
  ).join('');

  let h = `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:12px;font-weight:800;color:var(--text)">🎯 Event Tracker</span>
    <span style="flex:1"></span>
    ${subHtml}
  </div>`;

  // KPI cards
  h += `<div class="sg sg4" style="margin-bottom:10px">
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--blue)">${totalCount}</div><div class="stat-l">Total eventos</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--green)">${todayEvents.length}</div><div class="stat-l">Hoy</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--red)">${errEvents.length}</div><div class="stat-l">Errores</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--amber)">${Object.keys(moduleCounts).length}</div><div class="stat-l">Módulos activos</div></div>
  </div>`;

  if (S.sub === 'live') {
    // Filter bar
    h += `<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <span style="font-size:10px;font-weight:700;color:var(--text3)">MÓDULO:</span>
      ${[['all', '🌐 Todo'], ['ingresos', '🔖 Ref'], ['ingresos2', '🚛 Ing'], ['conductores', '👤 Cond'], ['agenda', '📅 Ag'], ['auth', '🔐 Auth'], ['system', '⚙️ Sys']].map(([v, l]) =>
        `<button class="btn btn-xs ${S.filter === v ? 'btn-p' : 'btn-gh'}" onclick="window._trkState.filter='${v}';window._op.renderAnalytics2()">${l}</button>`
      ).join('')}
      <span style="flex:1"></span>
      <input type="date" value="${S.dateFrom || ''}" oninput="window._trkState.dateFrom=this.value;window._op.renderAnalytics2()" title="Desde" style="font-size:11px">
      <input type="date" value="${S.dateTo || ''}" oninput="window._trkState.dateTo=this.value;window._op.renderAnalytics2()" title="Hasta" style="font-size:11px">
      ${S.dateFrom || S.dateTo ? `<button class="btn btn-xs btn-gh" onclick="window._trkState.dateFrom='';window._trkState.dateTo='';window._op.renderAnalytics2()">✕</button>` : ''}
      <button class="btn btn-gh btn-sm" onclick="window._op._trkExport()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export</button>
    </div>`;

    // Charts row
    h += `<div class="sg sg3" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📊 Por módulo</div>${barChart(Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]), 'var(--blue)')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">⚡ Por acción</div>${barChart(Object.entries(actionCounts).sort((a, b) => b[1] - a[1]), 'var(--teal)')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🕐 Hoy por hora</div>
        <div style="display:flex;align-items:flex-end;gap:2px;height:60px;padding-top:4px">
          ${hourArr.map(([h, v]) => `<div title="${h}:00 → ${v}" style="flex:1;background:${v > 0 ? 'var(--blue)' : 'var(--bg3)'};border-radius:2px 2px 0 0;height:${Math.max(v / hourMax * 100, 4)}%;min-height:2px;opacity:${v > 0 ? 0.8 : 0.3}"></div>`).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:8px;color:var(--text3);margin-top:2px"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
      </div>
    </div>`;

    // Event list (last 50)
    const recent = events.slice(0, 50);
    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📋 Últimos eventos (${events.length} total)</div>`;
    if (recent.length) {
      h += `<div style="max-height:400px;overflow-y:auto"><table class="tbl"><thead><tr>
        <th style="width:140px">Hora</th><th>Módulo</th><th>Acción</th><th>Categoría</th><th>OK</th><th>Duración</th>
      </tr></thead><tbody>`;
      recent.forEach(e => {
        const t = e.timestamp.slice(11, 19);
        const d = e.timestamp.slice(0, 10);
        const clr = MOD_CLR[e.module] || '#64748b';
        h += `<tr>
          <td style="font-size:10px;white-space:nowrap;color:var(--text3)">${d} ${t}</td>
          <td><span style="background:${clr}15;color:${clr};padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700">${esc(e.module)}</span></td>
          <td style="font-size:11px">${esc(e.action)}</td>
          <td style="font-size:10px;color:var(--text3)">${CAT_ICO[e.category] || ''} ${esc(e.category)}</td>
          <td>${e.success ? '<span style="color:var(--green)">✓</span>' : '<span style="color:var(--red)">✗</span>'}</td>
          <td style="font-size:10px">${e.duration ? e.duration + 'ms' : '–'}</td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    } else {
      h += '<div style="padding:20px;text-align:center;font-size:12px;color:var(--text3)">No hay eventos registrados. Los eventos se capturan automáticamente al usar el sistema.</div>';
    }
    h += '</div>';

  } else if (S.sub === 'history') {
    // Category breakdown
    h += `<div class="sg sg2" style="margin-bottom:10px">
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📂 Por categoría</div>${barChart(Object.entries(catCounts).sort((a, b) => b[1] - a[1]), '#8b5cf6')}</div>
      <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📊 Por módulo</div>${barChart(Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]), 'var(--blue)')}</div>
    </div>`;

    // Daily trend
    const dayMap = {};
    events.forEach(e => { const d = e.timestamp.slice(0, 10); dayMap[d] = (dayMap[d] || 0) + 1; });
    const dayArr = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0]));
    const dayMax = Math.max(...dayArr.map(x => x[1]), 1);

    h += `<div class="card" style="margin-bottom:10px"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Tendencia diaria</div>`;
    if (dayArr.length > 1) {
      const w = 280, ht = 60, step = w / (dayArr.length - 1);
      const pts = dayArr.map((x, i) => `${i * step},${ht - Math.round(x[1] / dayMax * (ht - 6))}`).join(' ');
      h += `<svg viewBox="0 0 ${w} ${ht}" style="width:100%;height:${ht}px;display:block"><polyline points="${pts}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/></svg>`;
      h += `<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:2px"><span>${dayArr[0][0]}</span><span>${dayArr[dayArr.length - 1][0]}</span></div>`;
    } else {
      h += '<div style="text-align:center;font-size:11px;color:var(--text3);padding:12px">Necesita más de 1 día de datos</div>';
    }
    h += '</div>';

  } else if (S.sub === 'config') {
    h += `<div class="card" style="margin-bottom:10px">
      <div style="font-weight:800;font-size:12px;margin-bottom:10px">⚙️ Categorías de eventos</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">${togglesHtml}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px">Activa o desactiva categorías para controlar qué eventos se capturan.</div>
    </div>`;

    h += `<div class="card" style="margin-bottom:10px">
      <div style="font-weight:800;font-size:12px;margin-bottom:10px">🗑️ Gestión de datos</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-gh" onclick="window._op._trkExport()">📥 Exportar todo (JSON)</button>
        <button class="btn btn-sm" style="background:var(--red);color:#fff;border:none;border-radius:20px" onclick="window._op._trkClear()">🗑️ Limpiar eventos</button>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:8px">Total almacenado: <b>${totalCount}</b> eventos</div>
    </div>`;
  }

  el.innerHTML = h;
}

// ─── EXPORT ─────────────────────────────────────────────────────────
async function _trkExport() {
  const events = await _getEvents({});
  if (!events.length) { toast('Sin eventos', 'var(--amber)'); return; }
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'events_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  toast('✅ Exportado', 'var(--green)');
}

// ─── CLEAR ──────────────────────────────────────────────────────────
async function _trkClear() {
  if (!confirm('¿Eliminar todos los eventos? Esta acción no se puede deshacer.')) return;
  try {
    const db = await _openIDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    toast('🗑️ Eventos eliminados', 'var(--green)');
    renderAnalytics2();
  } catch (e) { toast('Error al limpiar', 'var(--red)'); }
}

// ─── REGISTER ───────────────────────────────────────────────────────
registerFn('renderAnalytics2', renderAnalytics2);
registerFn('_trkExport', _trkExport);
registerFn('_trkClear', _trkClear);
window.renderAnalytics2 = renderAnalytics2;
window.trackEvent = trackEvent;
