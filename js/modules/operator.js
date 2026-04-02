// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/operator.js
// Interfaz del operador de puerta. Carga lazy desde app.js.
// Listener real-time a la cola de su puerta asignada.
// ═══════════════════════════════════════════════════════════

import { AppState }           from '../state.js';
import { localDB }            from '../db.js';
import { fsGate, fsConfig }   from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { to, tc }             from '../i18n.js';
import { logout }             from '../auth.js';

let _unsubscribeQueue = null;
let _activeTab = 'ingresos';

// ── Inicializar módulo operador ──────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');

  // Cargar config del evento
  const eventCfg = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', eventCfg);
  if (user.gateId) AppState.set('currentGate', { id: user.gateId });

  // Montar UI
  const root = document.getElementById('app-root');
  root.innerHTML = _renderShell(user, eventCfg);
  _bindEvents();

  // Suscribir a la cola en tiempo real
  _subscribeToQueue();

  // Actualizar contadores cada 30s
  setInterval(_updateCounters, 30000);
}

// ── Shell HTML ───────────────────────────────────────────────
function _renderShell(user, event) {
  return `
<div id="opWrap">

  <!-- HEADER -->
  <div class="op-hdr" id="opHdr">
    <div class="op-logo">
      <svg width="28" height="28" viewBox="0 0 140 140">
        <rect width="140" height="140" rx="32" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40"
          stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <span class="op-event-name">${safeHtml(event?.name || 'BeUnifyT')}</span>
    </div>

    <div class="op-counters" id="opCounters">
      <div class="op-cnt"><span class="op-cnt-v" id="cntEntradas">0</span><span class="op-cnt-l">Hoy</span></div>
      <div class="op-cnt"><span class="op-cnt-v" id="cntRecinto">0</span><span class="op-cnt-l">Recinto</span></div>
    </div>

    <div class="op-hdr-right">
      <div class="sync-pill" id="syncPill">
        <div class="sd sd-g" id="syncDot"></div>
        <span id="syncTxt">OK</span>
      </div>
      <button class="btn-icon" id="btnMenu" title="Menu">☰</button>
    </div>
  </div>

  <!-- TABS -->
  <div class="op-tabs" id="opTabs">
    <button class="op-tab active" data-tab="ingresos">🚛 Ingresos</button>
    <button class="op-tab" data-tab="buscar">🔍 Buscar</button>
    <button class="op-tab" data-tab="config">⚙️ Config</button>
  </div>

  <!-- CONTENIDO -->
  <div id="opContent" class="op-content">
    ${_renderTabIngresos()}
  </div>

  <!-- MENU LATERAL -->
  <div id="opMenuOverlay" class="op-overlay" style="display:none">
    <div class="op-menu">
      <div class="op-menu-user">
        <div class="op-menu-name">${safeHtml(user.name)}</div>
        <div class="op-menu-role">${safeHtml(user.role)} · ${safeHtml(user.gateId || '')}</div>
      </div>
      <button class="op-menu-item" id="btnLogout">🚪 Cerrar sesión</button>
    </div>
  </div>

</div>

<style>
#opWrap{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}

/* Header */
.op-hdr{
  display:flex;align-items:center;gap:8px;
  padding:0 12px;height:48px;
  background:var(--bg2);border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;box-shadow:var(--sh)
}
.op-logo{display:flex;align-items:center;gap:7px;flex-shrink:0}
.op-event-name{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;
  max-width:120px;overflow:hidden;text-overflow:ellipsis}
.op-counters{display:flex;gap:6px;flex:1;justify-content:center}
.op-cnt{display:flex;flex-direction:column;align-items:center;
  padding:2px 10px;border:1.5px solid var(--border2);border-radius:var(--r);
  background:var(--bg3);min-width:44px}
.op-cnt-v{font-size:15px;font-weight:900;line-height:1;font-family:'JetBrains Mono',monospace}
.op-cnt-l{font-size:8px;color:var(--text3);font-weight:700;text-transform:uppercase}
.op-hdr-right{display:flex;align-items:center;gap:4px;flex-shrink:0}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;
  border-radius:20px;border:1.5px solid var(--border);background:var(--bg3);
  cursor:pointer;font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}
.sd-y{background:#f59e0b}.sd-r{background:var(--red)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.btn-icon{background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);padding:4px 10px;font-size:16px;cursor:pointer;color:var(--text)}

/* Tabs */
.op-tabs{display:flex;gap:2px;padding:4px 8px;background:var(--bg3);
  border-bottom:1px solid var(--border);overflow-x:auto;
  position:sticky;top:48px;z-index:99}
.op-tab{padding:5px 14px;border-radius:20px;background:transparent;
  color:var(--text3);font-size:12px;font-weight:500;border:none;
  white-space:nowrap;cursor:pointer;transition:all .15s}
.op-tab.active{background:var(--blue);color:#fff;font-weight:700}
.op-tab:hover:not(.active){background:var(--bll);color:var(--blue)}

/* Content */
.op-content{flex:1;padding:12px;overflow-y:auto}

/* Formulario de ingreso */
.ing-form{background:var(--bg2);border-radius:var(--r2);
  border:1.5px solid var(--border);padding:14px;margin-bottom:12px}
.ing-form-title{font-size:13px;font-weight:700;color:var(--text2);
  margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.form-grid .span2{grid-column:1/-1}
.fg{display:flex;flex-direction:column;gap:3px}
.flbl{font-size:11px;font-weight:700;color:var(--text2)}
.btn-registrar{
  width:100%;padding:13px;border-radius:var(--r);border:none;
  background:var(--green);color:#fff;font-size:15px;font-weight:700;
  cursor:pointer;margin-top:10px;transition:opacity .15s;font-family:inherit
}
.btn-registrar:hover{opacity:.9}
.btn-registrar:active{transform:scale(.98)}

/* Cola de vehículos */
.queue-title{font-size:11px;font-weight:700;color:var(--text3);
  text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.queue-list{display:flex;flex-direction:column;gap:6px}
.queue-item{
  background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r);padding:10px 12px;
  display:flex;align-items:center;gap:10px;cursor:pointer;
  transition:border-color .15s
}
.queue-item:hover{border-color:var(--blue)}
.queue-item.en-recinto{border-left:3px solid var(--green)}
.queue-item.salido{opacity:.5}
.qi-mat{font-size:16px;font-weight:900;font-family:'JetBrains Mono',monospace;
  letter-spacing:2px;flex-shrink:0}
.qi-info{flex:1;min-width:0}
.qi-emp{font-size:12px;font-weight:600;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qi-time{font-size:11px;color:var(--text3)}
.qi-status{font-size:10px;font-weight:700;padding:2px 7px;
  border-radius:10px;flex-shrink:0}
.qi-status.entrada{background:var(--gll);color:var(--green)}
.qi-status.salida{background:var(--bg3);color:var(--text3)}

/* Overlay menú */
.op-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;
  display:flex;justify-content:flex-end}
.op-menu{background:var(--bg2);width:260px;height:100%;padding:24px 16px;
  display:flex;flex-direction:column;gap:4px}
.op-menu-user{padding:12px 0 16px;border-bottom:1px solid var(--border);margin-bottom:8px}
.op-menu-name{font-size:16px;font-weight:700;color:var(--text)}
.op-menu-role{font-size:12px;color:var(--text3);margin-top:2px}
.op-menu-item{padding:11px 14px;border-radius:var(--r);border:none;
  background:transparent;color:var(--text);font-size:14px;cursor:pointer;
  text-align:left;width:100%;transition:background .15s;font-family:inherit}
.op-menu-item:hover{background:var(--bg3)}

/* Buscar tab */
.search-wrap{display:flex;flex-direction:column;gap:10px}
.search-box{position:relative}
.search-box input{padding:10px 12px 10px 36px;font-size:15px;border-radius:var(--r2);width:100%}
.search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);
  color:var(--text3);font-size:14px;pointer-events:none}
#searchResults{display:flex;flex-direction:column;gap:6px}
</style>`;
}

// ── Tab Ingresos ─────────────────────────────────────────────
function _renderTabIngresos() {
  return `
<div id="tabIngresos">
  <!-- Formulario nuevo ingreso -->
  <div class="ing-form">
    <div class="ing-form-title">🚛 Registrar entrada</div>
    <div class="form-grid">
      <div class="fg span2">
        <label class="flbl">Matrícula *</label>
        <input type="text" id="fMat" placeholder="1234ABC" autocomplete="off"
          style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;
          font-size:16px;font-weight:700;letter-spacing:2px">
      </div>
      <div class="fg">
        <label class="flbl">Empresa</label>
        <input type="text" id="fEmp" placeholder="Nombre empresa" autocomplete="off">
      </div>
      <div class="fg">
        <label class="flbl">Tipo</label>
        <select id="fTipo">
          <option value="trailer">Tráiler</option>
          <option value="camion">Camión</option>
          <option value="furgoneta">Furgoneta</option>
          <option value="semi">Semirremolque</option>
          <option value="coche">Coche</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="fg">
        <label class="flbl">Conductor</label>
        <input type="text" id="fConductor" placeholder="Nombre" autocomplete="off">
      </div>
      <div class="fg">
        <label class="flbl">Stand / Pabellón</label>
        <input type="text" id="fStand" placeholder="H3-B14" autocomplete="off">
      </div>
      <div class="fg">
        <label class="flbl">Remolque</label>
        <input type="text" id="fRemolque" placeholder="REM-001" autocomplete="off">
      </div>
    </div>
    <button class="btn-registrar" id="btnRegistrar">✅ Registrar entrada</button>
  </div>

  <!-- Cola de vehículos -->
  <div class="queue-title">Últimas entradas</div>
  <div class="queue-list" id="queueList">
    <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">
      Cargando...
    </div>
  </div>
</div>`;
}

// ── Suscribir a la cola en tiempo real ───────────────────────
function _subscribeToQueue() {
  const user    = AppState.get('currentUser');
  const eventId = user.eventId;
  const gateId  = user.gateId || 'puerta-1';

  if (_unsubscribeQueue) _unsubscribeQueue();

  _unsubscribeQueue = fsGate.subscribeQueue(
    eventId, gateId,
    (entries) => _renderQueue(entries),
    (err) => {
      console.error('[Operator] Error queue:', err);
      _setSyncStatus('error');
    }
  );

  _setSyncStatus('ok');
}

function _renderQueue(entries) {
  const list = document.getElementById('queueList');
  if (!list) return;

  // Actualizar contadores
  const hoy    = new Date().toDateString();
  const hoyN   = entries.filter(e => new Date(e.ts).toDateString() === hoy).length;
  const recinto = entries.filter(e => !e.salida).length;
  const cntE   = document.getElementById('cntEntradas');
  const cntR   = document.getElementById('cntRecinto');
  if (cntE) cntE.textContent = hoyN;
  if (cntR) cntR.textContent = recinto;

  if (!entries.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--text3);
      font-size:13px;padding:20px">Sin entradas registradas</div>`;
    return;
  }

  list.innerHTML = entries.map(e => `
    <div class="queue-item ${e.salida ? 'salido' : 'en-recinto'}"
      data-id="${e.id}" onclick="window._opOpenEntry('${e.id}')">
      <div class="qi-mat">${safeHtml(e.matricula || '—')}</div>
      <div class="qi-info">
        <div class="qi-emp">${safeHtml(e.empresa || e.conductor || '—')}</div>
        <div class="qi-time">${formatDateTime(e.ts)}</div>
      </div>
      <div class="qi-status ${e.salida ? 'salida' : 'entrada'}">
        ${e.salida ? 'Salida' : 'En recinto'}
      </div>
    </div>
  `).join('');
}

// ── Registrar entrada ─────────────────────────────────────────
async function _handleRegistrar() {
  const mat = normalizePlate(document.getElementById('fMat')?.value);
  if (!mat) { toast('La matrícula es obligatoria', 'var(--red)'); return; }

  const user    = AppState.get('currentUser');
  const eventId = user.eventId;
  const gateId  = user.gateId || 'puerta-1';

  const btn = document.getElementById('btnRegistrar');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    const entry = {
      matricula:  mat,
      empresa:    document.getElementById('fEmp')?.value.trim()       || '',
      tipo:       document.getElementById('fTipo')?.value             || 'otro',
      conductor:  document.getElementById('fConductor')?.value.trim() || '',
      stand:      document.getElementById('fStand')?.value.trim()     || '',
      remolque:   document.getElementById('fRemolque')?.value.trim()  || '',
      operadorId: user.uid,
      operador:   user.name,
    };

    await fsGate.registerEntry(eventId, gateId, entry);

    // Limpiar formulario
    ['fMat','fEmp','fConductor','fStand','fRemolque'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('fMat')?.focus();

    toast(`✅ ${mat} registrado`, 'var(--green)');

  } catch (err) {
    console.error('[Operator] Error registrar:', err);
    toast('Error al registrar entrada', 'var(--red)');
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Registrar entrada';
  }
}

// ── Bind eventos ─────────────────────────────────────────────
function _bindEvents() {
  // Tabs
  document.querySelectorAll('.op-tab').forEach(tab => {
    tab.addEventListener('click', () => _switchTab(tab.dataset.tab));
  });

  // Registrar
  document.getElementById('btnRegistrar')
    ?.addEventListener('click', _handleRegistrar);

  document.getElementById('fMat')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') _handleRegistrar(); });

  // Mayúsculas automáticas en matrícula
  document.getElementById('fMat')
    ?.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

  // Menú
  document.getElementById('btnMenu')
    ?.addEventListener('click', () => {
      document.getElementById('opMenuOverlay').style.display = 'flex';
    });

  document.getElementById('opMenuOverlay')
    ?.addEventListener('click', (e) => {
      if (e.target.id === 'opMenuOverlay') {
        e.target.style.display = 'none';
      }
    });

  document.getElementById('btnLogout')
    ?.addEventListener('click', logout);

  // Función global para abrir entrada desde la lista
  window._opOpenEntry = (id) => {
    toast(`Entrada: ${id}`, 'var(--blue)', 1500);
  };
}

// ── Cambiar tab ───────────────────────────────────────────────
function _switchTab(tab) {
  _activeTab = tab;
  document.querySelectorAll('.op-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  const content = document.getElementById('opContent');
  if (tab === 'ingresos') {
    content.innerHTML = _renderTabIngresos();
    document.getElementById('btnRegistrar')
      ?.addEventListener('click', _handleRegistrar);
    document.getElementById('fMat')
      ?.addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });
    document.getElementById('fMat')
      ?.addEventListener('keydown', e => { if (e.key === 'Enter') _handleRegistrar(); });
  } else if (tab === 'buscar') {
    content.innerHTML = _renderTabBuscar();
    document.getElementById('searchInput')
      ?.addEventListener('input', _handleSearch);
  } else if (tab === 'config') {
    content.innerHTML = _renderTabConfig();
  }
}

// ── Tab Buscar ────────────────────────────────────────────────
function _renderTabBuscar() {
  return `
<div class="search-wrap">
  <div class="search-box">
    <span class="search-ico">🔍</span>
    <input type="text" id="searchInput" placeholder="Buscar matrícula..."
      autocomplete="off" style="text-transform:uppercase">
  </div>
  <div id="searchResults"></div>
</div>`;
}

async function _handleSearch(e) {
  const q = e.target.value.trim().toUpperCase();
  const results = document.getElementById('searchResults');
  if (!results) return;
  if (q.length < 2) { results.innerHTML = ''; return; }

  const user    = AppState.get('currentUser');
  const entries = await fsGate.searchPlate(user.eventId, q);

  if (!entries.length) {
    results.innerHTML = `<div style="color:var(--text3);font-size:13px;
      padding:16px;text-align:center">Sin resultados para "${q}"</div>`;
    return;
  }

  results.innerHTML = entries.map(e => `
    <div class="queue-item">
      <div class="qi-mat">${safeHtml(e.matricula)}</div>
      <div class="qi-info">
        <div class="qi-emp">${safeHtml(e.empresa || '—')}</div>
        <div class="qi-time">${formatDateTime(e.ts)}</div>
      </div>
      <div class="qi-status ${e.salida ? 'salida' : 'entrada'}">
        ${e.salida ? 'Salida' : 'En recinto'}
      </div>
    </div>`).join('');
}

// ── Tab Config ────────────────────────────────────────────────
function _renderTabConfig() {
  const user  = AppState.get('currentUser');
  const event = AppState.get('currentEvent');
  return `
<div style="display:flex;flex-direction:column;gap:10px">
  <div class="ing-form">
    <div class="ing-form-title">Sesión activa</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.8">
      <b>Usuario:</b> ${safeHtml(user.name)}<br>
      <b>Rol:</b> ${safeHtml(user.role)}<br>
      <b>Puerta:</b> ${safeHtml(user.gateId || '—')}<br>
      <b>Evento:</b> ${safeHtml(event?.name || '—')}
    </div>
  </div>
  <div class="ing-form">
    <div class="ing-form-title">Tema</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${['default','dark','soft','contrast'].map(t => `
        <button onclick="window._setTheme('${t}')" style="
          padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);
          background:var(--bg3);color:var(--text);font-size:12px;cursor:pointer;
          font-family:inherit">${t}</button>`).join('')}
    </div>
  </div>
</div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function _setSyncStatus(status) {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncTxt');
  if (!dot || !txt) return;
  dot.className = `sd ${status === 'ok' ? 'sd-g' : status === 'error' ? 'sd-r' : 'sd-y'}`;
  txt.textContent = status === 'ok' ? 'OK' : status === 'error' ? 'Error' : '...';
}

function _updateCounters() {
  // Los contadores se actualizan via el listener de la cola
}

// Tema global
window._setTheme = (theme) => {
  AppState.set('theme', theme);
  toast(`Tema: ${theme}`, 'var(--blue)', 1500);
};
