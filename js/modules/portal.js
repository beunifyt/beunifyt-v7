// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/portal.js
// Portal para empresas expositoras. Carga lazy desde app.js.
// Sin listener persistente — usa .once() + polling 45s.
// Máx conexiones simultaneas: 0 (no ocupa conexiones Firestore)
// ═══════════════════════════════════════════════════════════

import { AppState }              from '../state.js';
import { localDB }               from '../db.js';
import { fsCompany, fsConfig }   from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { tp, tc, loadLang }      from '../i18n.js';
import { logout }                from '../auth.js';

let _pollingInterval = null;
let _activeTab = 'flota';

// ── Inicializar portal ───────────────────────────────────────
export async function initPortal() {
  const user = AppState.get('currentUser');

  // Cargar config del evento
  const eventCfg = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', eventCfg);

  // Montar UI
  const root = document.getElementById('app-root');
  root.innerHTML = _renderShell(user, eventCfg);
  _bindEvents();

  // Primera carga de datos
  await _syncData();

  // Polling cada 45s (sin listener — cero conexiones permanentes)
  _pollingInterval = setInterval(_syncData, 45000);
}

// ── Shell HTML ───────────────────────────────────────────────
function _renderShell(user, event) {
  return `
<div id="portalWrap">

  <!-- HEADER -->
  <div class="p-hdr">
    <div class="p-logo">
      <svg width="26" height="26" viewBox="0 0 140 140">
        <rect width="140" height="140" rx="32" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40"
          stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <div>
        <div class="p-company-name" id="pCompanyName">Cargando...</div>
        <div class="p-event-name">${safeHtml(event?.name || 'BeUnifyT')}</div>
      </div>
    </div>
    <div class="p-hdr-right">
      <div class="sync-pill" id="pSyncPill">
        <div class="sd sd-y" id="pSyncDot"></div>
        <span id="pSyncTxt">Sync</span>
      </div>
      <button class="btn-icon" id="pBtnMenu">☰</button>
    </div>
  </div>

  <!-- STATS BAR -->
  <div class="p-stats" id="pStats">
    <div class="p-stat"><span class="p-stat-v" id="sTotalVeh">—</span><span class="p-stat-l">Flota</span></div>
    <div class="p-stat"><span class="p-stat-v" id="sEnRecinto">—</span><span class="p-stat-l">En recinto</span></div>
    <div class="p-stat"><span class="p-stat-v" id="sPendiente">—</span><span class="p-stat-l">Pendientes</span></div>
    <div class="p-stat"><span class="p-stat-v" id="sSalidos">—</span><span class="p-stat-l">Salidos</span></div>
  </div>

  <!-- TABS -->
  <div class="p-tabs">
    <button class="p-tab active" data-tab="flota">🚛 Mi flota</button>
    <button class="p-tab" data-tab="movimientos">📋 Movimientos</button>
    <button class="p-tab" data-tab="config">⚙️ Config</button>
  </div>

  <!-- CONTENIDO -->
  <div id="pContent" class="p-content">
    <div class="p-loading">Cargando datos...</div>
  </div>

  <!-- MENU -->
  <div id="pMenuOverlay" class="op-overlay" style="display:none">
    <div class="op-menu">
      <div class="op-menu-user">
        <div class="op-menu-name">${safeHtml(user.name)}</div>
        <div class="op-menu-role">Portal empresa</div>
      </div>
      <button class="op-menu-item" id="pBtnRefresh">🔄 Actualizar ahora</button>
      <button class="op-menu-item" id="pBtnLogout">🚪 Cerrar sesión</button>
    </div>
  </div>

  <!-- MODAL añadir vehiculo -->
  <div id="pVehModal" class="ov" style="display:none">
    <div class="modal modal-sm">
      <div class="mhdr">
        <div class="mttl" id="pVehModalTitle">Añadir vehículo</div>
        <button class="btn-x" id="pBtnCloseModal">✕</button>
      </div>
      <div class="fgrid">
        <div class="fg span2">
          <label class="flbl">Matrícula *</label>
          <input type="text" id="vMat" placeholder="1234ABC" autocomplete="off"
            style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;
            font-size:15px;font-weight:700;letter-spacing:2px">
        </div>
        <div class="fg">
          <label class="flbl">Tipo</label>
          <select id="vTipo">
            <option value="trailer">Tráiler</option>
            <option value="camion">Camión</option>
            <option value="furgoneta">Furgoneta</option>
            <option value="semi">Semirremolque</option>
            <option value="coche">Coche</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="fg">
          <label class="flbl">País</label>
          <input type="text" id="vPais" placeholder="ES" maxlength="2"
            style="text-transform:uppercase">
        </div>
        <div class="fg span2">
          <label class="flbl">Conductor</label>
          <input type="text" id="vConductor" placeholder="Nombre conductor" autocomplete="off">
        </div>
        <div class="fg">
          <label class="flbl">Teléfono</label>
          <input type="tel" id="vTel" placeholder="+34 600000000">
        </div>
        <div class="fg">
          <label class="flbl">Remolque</label>
          <input type="text" id="vRemolque" placeholder="REM-001">
        </div>
        <div class="fg span2">
          <label class="flbl">Stand / Referencia</label>
          <input type="text" id="vStand" placeholder="H3-B14">
        </div>
      </div>
      <div class="ffoot">
        <button class="btn-sec" id="pBtnCancelVeh">Cancelar</button>
        <button class="btn-pri" id="pBtnSaveVeh">Guardar vehículo</button>
      </div>
    </div>
  </div>

</div>

<style>
#portalWrap{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}

/* Header */
.p-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 12px;height:48px;background:var(--bg2);
  border-bottom:1px solid var(--border);
  position:sticky;top:0;z-index:100;box-shadow:var(--sh)
}
.p-logo{display:flex;align-items:center;gap:8px}
.p-company-name{font-size:14px;font-weight:800;color:var(--text);line-height:1.2}
.p-event-name{font-size:10px;color:var(--text3);font-weight:500}
.p-hdr-right{display:flex;align-items:center;gap:6px}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;
  border-radius:20px;border:1.5px solid var(--border);background:var(--bg3);
  font-size:11px;font-weight:700;color:var(--text3);cursor:pointer}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}
.sd-y{background:#f59e0b}.sd-r{background:var(--red)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.btn-icon{background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);padding:4px 10px;font-size:16px;cursor:pointer;color:var(--text)}

/* Stats */
.p-stats{display:flex;gap:6px;padding:8px 12px;background:var(--bg2);
  border-bottom:1px solid var(--border);overflow-x:auto}
.p-stat{display:flex;flex-direction:column;align-items:center;flex:1;
  padding:4px 8px;background:var(--bg3);border-radius:var(--r);
  border:1px solid var(--border);min-width:60px}
.p-stat-v{font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.1}
.p-stat-l{font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:1px}

/* Tabs */
.p-tabs{display:flex;gap:2px;padding:4px 8px;background:var(--bg3);
  border-bottom:1px solid var(--border);
  position:sticky;top:48px;z-index:99}
.p-tab{padding:5px 14px;border-radius:20px;background:transparent;
  color:var(--text3);font-size:12px;font-weight:500;border:none;
  white-space:nowrap;cursor:pointer;transition:all .15s}
.p-tab.active{background:var(--blue);color:#fff;font-weight:700}
.p-tab:hover:not(.active){background:var(--bll);color:var(--blue)}

/* Content */
.p-content{flex:1;padding:12px}
.p-loading{text-align:center;color:var(--text3);font-size:13px;padding:40px}

/* Flota tabla */
.flota-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.flota-title{font-size:13px;font-weight:700;color:var(--text2)}
.btn-add-veh{
  padding:6px 14px;border-radius:20px;border:none;
  background:var(--green);color:#fff;font-size:12px;
  font-weight:700;cursor:pointer;font-family:inherit
}
.veh-list{display:flex;flex-direction:column;gap:6px}
.veh-card{
  background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r);padding:10px 12px;
  display:flex;align-items:center;gap:10px
}
.veh-card.en-recinto{border-left:3px solid var(--green)}
.veh-card.pendiente{border-left:3px solid var(--amber)}
.veh-mat{font-size:15px;font-weight:900;font-family:'JetBrains Mono',monospace;
  letter-spacing:2px;flex-shrink:0;min-width:90px}
.veh-info{flex:1;min-width:0}
.veh-cond{font-size:12px;font-weight:600;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.veh-det{font-size:11px;color:var(--text3);margin-top:1px}
.veh-status{font-size:10px;font-weight:700;padding:2px 7px;
  border-radius:10px;flex-shrink:0;white-space:nowrap}
.veh-status.en-recinto{background:var(--gll);color:var(--green)}
.veh-status.pendiente{background:var(--all);color:var(--amber)}
.veh-status.salido{background:var(--bg3);color:var(--text3)}
.veh-actions{display:flex;gap:4px;flex-shrink:0}
.btn-veh-del{background:var(--rll);color:var(--red);border:1px solid #fecaca;
  border-radius:var(--r);padding:3px 8px;font-size:11px;cursor:pointer;font-family:inherit}

/* Modal */
.ov{position:fixed;inset:0;z-index:2100;background:rgba(0,0,0,.5);
  backdrop-filter:blur(2px);align-items:flex-start;justify-content:center;
  padding:14px;overflow-y:auto}
.ov.open{display:flex!important}
.modal{background:var(--bg2);border-radius:var(--r3);
  box-shadow:0 20px 60px rgba(0,0,0,.25);width:100%;max-width:540px;
  margin:auto;padding:22px;position:relative}
.modal-sm{max-width:400px}
.mhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.mttl{font-size:17px;font-weight:800}
.btn-x{background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);padding:4px 10px;font-size:15px;color:var(--text3);cursor:pointer}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.span2{grid-column:1/-1}
.fg{display:flex;flex-direction:column;gap:3px}
.flbl{font-size:11px;font-weight:700;color:var(--text2)}
.ffoot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;
  padding-top:12px;border-top:1px solid var(--border)}
.btn-pri{padding:9px 20px;border-radius:var(--r);border:none;
  background:var(--blue);color:#fff;font-size:14px;font-weight:700;
  cursor:pointer;font-family:inherit}
.btn-sec{padding:9px 16px;border-radius:var(--r);
  border:1.5px solid var(--border2);background:var(--bg3);
  color:var(--text);font-size:14px;cursor:pointer;font-family:inherit}

/* Movimientos */
.mov-list{display:flex;flex-direction:column;gap:6px}
.mov-item{background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r);padding:10px 12px;
  display:flex;align-items:center;gap:10px}
.mov-mat{font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;
  letter-spacing:1px;flex-shrink:0;min-width:80px}
.mov-info{flex:1;min-width:0}
.mov-emp{font-size:12px;color:var(--text);font-weight:600}
.mov-time{font-size:11px;color:var(--text3)}
.mov-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;flex-shrink:0}
.mov-badge.entrada{background:var(--gll);color:var(--green)}
.mov-badge.salida{background:var(--bg3);color:var(--text3)}

/* Sync info */
.sync-info{margin-top:10px;padding:6px 10px;background:var(--bg3);
  border-radius:var(--r);font-size:11px;color:var(--text3);text-align:center}

/* Overlay menu */
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
</style>`;
}

// ── Sincronizar datos desde Firestore ────────────────────────
async function _syncData() {
  const user    = AppState.get('currentUser');
  const eventId = user.eventId;
  const companyId = user.companyId || user.uid;

  _setSyncStatus('syncing');

  try {
    // Cargar perfil empresa
    const profile = await fsCompany.getProfile(eventId, companyId);
    const nameEl  = document.getElementById('pCompanyName');
    if (nameEl && profile) nameEl.textContent = profile.nombre || profile.name || 'Mi empresa';

    // Cargar vehículos (lectura única — sin listener)
    const vehicles = await fsCompany.getVehicles(eventId, companyId);
    await localDB.upsertMany('my_vehicles', vehicles);

    // Cargar entradas recientes
    const entries = await fsCompany.getEntries(eventId, companyId, 100);
    await localDB.upsertMany('recent_entries', entries);

    // Actualizar stats
    _updateStats(vehicles, entries);

    // Renderizar tab activo
    _renderActiveTab(vehicles, entries);

    _setSyncStatus('ok');

  } catch (err) {
    console.error('[Portal] Error sync:', err);
    _setSyncStatus('error');
    toast('Error al sincronizar datos', 'var(--red)');
  }
}

// ── Stats bar ────────────────────────────────────────────────
function _updateStats(vehicles, entries) {
  const total    = vehicles.length;
  const enRecinto = entries.filter(e => !e.salida).length;
  const pendiente = vehicles.filter(v =>
    !entries.find(e => e.matricula === v.matricula)
  ).length;
  const salidos   = entries.filter(e => e.salida).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('sTotalVeh',  total);
  set('sEnRecinto', enRecinto);
  set('sPendiente', pendiente);
  set('sSalidos',   salidos);
}

// ── Render tab activo ────────────────────────────────────────
function _renderActiveTab(vehicles, entries) {
  if (_activeTab === 'flota')        _renderFlota(vehicles, entries);
  else if (_activeTab === 'movimientos') _renderMovimientos(entries);
  else if (_activeTab === 'config')  _renderConfig();
}

// ── Tab Flota ────────────────────────────────────────────────
function _renderFlota(vehicles, entries) {
  const content = document.getElementById('pContent');
  if (!content) return;

  if (!vehicles.length) {
    content.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:40px;margin-bottom:12px">🚛</div>
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">
          No tienes vehículos registrados
        </div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:20px">
          Añade tu flota para gestionar accesos
        </div>
        <button class="btn-add-veh" id="btnAddVehEmpty">+ Añadir vehículo</button>
      </div>`;
    document.getElementById('btnAddVehEmpty')
      ?.addEventListener('click', _openVehModal);
    return;
  }

  content.innerHTML = `
    <div class="flota-header">
      <div class="flota-title">${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''}</div>
      <button class="btn-add-veh" id="btnAddVeh">+ Añadir</button>
    </div>
    <div class="veh-list">
      ${vehicles.map(v => {
        const entry   = entries.find(e => e.matricula === v.matricula && !e.salida);
        const salida  = entries.find(e => e.matricula === v.matricula && e.salida);
        const status  = entry ? 'en-recinto' : salida ? 'salido' : 'pendiente';
        const statusLabel = entry ? 'En recinto' : salida ? 'Salido' : 'Pendiente';
        return `
        <div class="veh-card ${status}">
          <div class="veh-mat">${safeHtml(v.matricula)}</div>
          <div class="veh-info">
            <div class="veh-cond">${safeHtml(v.conductor || '—')}</div>
            <div class="veh-det">${safeHtml(v.tipo || '')}${v.stand ? ' · ' + safeHtml(v.stand) : ''}</div>
          </div>
          <div class="veh-status ${status}">${statusLabel}</div>
          <div class="veh-actions">
            <button class="btn-veh-del" data-id="${v.id}" data-mat="${safeHtml(v.matricula)}">✕</button>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="sync-info" id="pSyncInfo">Actualizado hace un momento</div>`;

  document.getElementById('btnAddVeh')
    ?.addEventListener('click', _openVehModal);

  // Eliminar vehículo
  document.querySelectorAll('.btn-veh-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mat = btn.dataset.mat;
      if (!confirm(`¿Eliminar ${mat} de la flota?`)) return;
      const user = AppState.get('currentUser');
      await fsCompany.deleteVehicle(user.eventId, user.companyId || user.uid, btn.dataset.id);
      toast(`${mat} eliminado`, 'var(--amber)');
      await _syncData();
    });
  });
}

// ── Tab Movimientos ──────────────────────────────────────────
function _renderMovimientos(entries) {
  const content = document.getElementById('pContent');
  if (!content) return;

  if (!entries.length) {
    content.innerHTML = `<div class="p-loading">Sin movimientos registrados</div>`;
    return;
  }

  content.innerHTML = `
    <div class="mov-list">
      ${entries.map(e => `
        <div class="mov-item">
          <div class="mov-mat">${safeHtml(e.matricula || '—')}</div>
          <div class="mov-info">
            <div class="mov-emp">${safeHtml(e.empresa || e.conductor || '—')}</div>
            <div class="mov-time">${formatDateTime(e.ts)}</div>
          </div>
          <div class="mov-badge ${e.salida ? 'salida' : 'entrada'}">
            ${e.salida ? 'Salida' : 'Entrada'}
          </div>
        </div>`).join('')}
    </div>
    <div class="sync-info">Últimos 100 movimientos</div>`;
}

// ── Tab Config ────────────────────────────────────────────────
function _renderConfig() {
  const user  = AppState.get('currentUser');
  const event = AppState.get('currentEvent');
  const content = document.getElementById('pContent');
  if (!content) return;

  content.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:var(--bg2);border:1.5px solid var(--border);
        border-radius:var(--r2);padding:14px">
        <div style="font-size:11px;font-weight:700;color:var(--text2);
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">
          Sesión activa
        </div>
        <div style="font-size:13px;color:var(--text2);line-height:1.8">
          <b>Empresa:</b> ${safeHtml(user.name)}<br>
          <b>Email:</b> ${safeHtml(user.email)}<br>
          <b>Evento:</b> ${safeHtml(event?.name || '—')}
        </div>
      </div>
      <div style="background:var(--bg2);border:1.5px solid var(--border);
        border-radius:var(--r2);padding:14px">
        <div style="font-size:11px;font-weight:700;color:var(--text2);
          text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">
          Tema
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${['default','dark','soft','contrast'].map(t => `
            <button onclick="window._setTheme('${t}')" style="
              padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);
              background:var(--bg3);color:var(--text);font-size:12px;
              cursor:pointer;font-family:inherit">${t}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

// ── Modal añadir vehículo ────────────────────────────────────
function _openVehModal() {
  const modal = document.getElementById('pVehModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('vMat')?.focus();
  }
}

function _closeVehModal() {
  const modal = document.getElementById('pVehModal');
  if (modal) modal.style.display = 'none';
  ['vMat','vConductor','vTel','vRemolque','vStand'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

async function _saveVehicle() {
  const mat = normalizePlate(document.getElementById('vMat')?.value);
  if (!mat) { toast('La matrícula es obligatoria', 'var(--red)'); return; }

  const user = AppState.get('currentUser');
  const btn  = document.getElementById('pBtnSaveVeh');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    const vehicle = {
      matricula:  mat,
      tipo:       document.getElementById('vTipo')?.value      || 'otro',
      pais:       (document.getElementById('vPais')?.value || 'ES').toUpperCase().slice(0,2),
      conductor:  document.getElementById('vConductor')?.value.trim() || '',
      tel:        document.getElementById('vTel')?.value.trim()       || '',
      remolque:   document.getElementById('vRemolque')?.value.trim()  || '',
      stand:      document.getElementById('vStand')?.value.trim()     || '',
    };

    await fsCompany.addVehicle(user.eventId, user.companyId || user.uid, vehicle);
    _closeVehModal();
    toast(`✅ ${mat} añadido a la flota`, 'var(--green)');
    await _syncData();

  } catch (err) {
    console.error('[Portal] Error añadir vehículo:', err);
    toast('Error al guardar el vehículo', 'var(--red)');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar vehículo';
  }
}

// ── Bind eventos ─────────────────────────────────────────────
function _bindEvents() {
  // Tabs
  document.querySelectorAll('.p-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _activeTab = tab.dataset.tab;

      const vehicles = await localDB.getAll('my_vehicles');
      const entries  = await localDB.getAll('recent_entries');
      _renderActiveTab(vehicles, entries);
    });
  });

  // Menú
  document.getElementById('pBtnMenu')?.addEventListener('click', () => {
    document.getElementById('pMenuOverlay').style.display = 'flex';
  });
  document.getElementById('pMenuOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'pMenuOverlay') e.target.style.display = 'none';
  });
  document.getElementById('pBtnLogout')?.addEventListener('click', logout);
  document.getElementById('pBtnRefresh')?.addEventListener('click', async () => {
    document.getElementById('pMenuOverlay').style.display = 'none';
    await _syncData();
    toast('Datos actualizados', 'var(--green)', 1500);
  });

  // Modal vehículo
  document.getElementById('pBtnCloseModal')?.addEventListener('click', _closeVehModal);
  document.getElementById('pBtnCancelVeh')?.addEventListener('click', _closeVehModal);
  document.getElementById('pBtnSaveVeh')?.addEventListener('click', _saveVehicle);
  document.getElementById('vMat')?.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  // Tema global
  window._setTheme = (theme) => {
    AppState.set('theme', theme);
    toast(`Tema: ${theme}`, 'var(--blue)', 1500);
  };
}

// ── Sync status indicator ────────────────────────────────────
function _setSyncStatus(status) {
  const dot = document.getElementById('pSyncDot');
  const txt = document.getElementById('pSyncTxt');
  if (!dot || !txt) return;
  const map = { ok: ['sd-g','OK'], syncing: ['sd-y','...'], error: ['sd-r','Error'] };
  dot.className = `sd ${map[status]?.[0] || 'sd-y'}`;
  txt.textContent = map[status]?.[1] || '...';
}
