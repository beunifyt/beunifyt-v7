// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/admin.js
// Panel de administración. Solo rol "admin".
// Gestión de eventos, operadores y empresas.
// ═══════════════════════════════════════════════════════════

import { AppState }           from '../state.js';
import { localDB }            from '../db.js';
import { fsConfig, fsOperators, getDB } from '../firestore.js';
import { toast, safeHtml, uid } from '../utils.js';
import { logout }             from '../auth.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

let _activeTab = 'eventos';

// ── Inicializar admin ────────────────────────────────────────
export async function initAdmin() {
  const user = AppState.get('currentUser');
  if (user.role !== 'admin') {
    toast('Acceso denegado', 'var(--red)');
    return;
  }

  const root = document.getElementById('app-root');
  root.innerHTML = _renderShell(user);
  _bindEvents();
  await _loadTab('eventos');
}

// ── Shell ────────────────────────────────────────────────────
function _renderShell(user) {
  return `
<div id="adminWrap">

  <div class="adm-hdr">
    <div class="adm-logo">
      <svg width="26" height="26" viewBox="0 0 140 140">
        <rect width="140" height="140" rx="32" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40"
          stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <div>
        <div class="adm-title">Admin Panel</div>
        <div class="adm-sub">${safeHtml(user.email)}</div>
      </div>
    </div>
    <button class="btn-icon" id="admBtnLogout" title="Cerrar sesion">✕</button>
  </div>

  <div class="adm-tabs">
    <button class="adm-tab active" data-tab="eventos">📅 Eventos</button>
    <button class="adm-tab" data-tab="operadores">👷 Operadores</button>
    <button class="adm-tab" data-tab="empresas">🏢 Empresas</button>
  </div>

  <div id="admContent" class="adm-content">
    <div class="adm-loading">Cargando...</div>
  </div>

</div>

<style>
#adminWrap{display:flex;flex-direction:column;min-height:100vh;background:var(--bg)}
.adm-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 12px;height:48px;background:var(--bg2);
  border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100
}
.adm-logo{display:flex;align-items:center;gap:8px}
.adm-title{font-size:14px;font-weight:800;color:var(--text)}
.adm-sub{font-size:10px;color:var(--text3)}
.btn-icon{background:var(--bg3);border:1.5px solid var(--border);
  border-radius:var(--r);padding:4px 10px;font-size:15px;cursor:pointer;color:var(--text)}
.adm-tabs{display:flex;gap:2px;padding:4px 8px;background:var(--bg3);
  border-bottom:1px solid var(--border);position:sticky;top:48px;z-index:99}
.adm-tab{padding:5px 14px;border-radius:20px;background:transparent;
  color:var(--text3);font-size:12px;font-weight:500;border:none;
  white-space:nowrap;cursor:pointer;transition:all .15s}
.adm-tab.active{background:var(--purple);color:#fff;font-weight:700}
.adm-content{flex:1;padding:12px}
.adm-loading{text-align:center;color:var(--text3);font-size:13px;padding:40px}

/* Cards */
.adm-card{background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r);padding:12px 14px;margin-bottom:8px;
  display:flex;align-items:center;gap:10px}
.adm-card-info{flex:1;min-width:0}
.adm-card-title{font-size:14px;font-weight:700;color:var(--text)}
.adm-card-sub{font-size:12px;color:var(--text3);margin-top:2px}
.adm-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;flex-shrink:0}
.adm-badge.active{background:var(--gll);color:var(--green)}
.adm-badge.inactive{background:var(--bg3);color:var(--text3)}

/* Formulario */
.adm-form{background:var(--bg2);border:1.5px solid var(--border);
  border-radius:var(--r2);padding:14px;margin-bottom:12px}
.adm-form-title{font-size:12px;font-weight:700;color:var(--text2);
  text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px}
.adm-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.adm-span2{grid-column:1/-1}
.adm-fg{display:flex;flex-direction:column;gap:3px}
.adm-lbl{font-size:11px;font-weight:700;color:var(--text2)}
.adm-actions{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.btn-adm-pri{padding:8px 18px;border-radius:var(--r);border:none;
  background:var(--purple);color:#fff;font-size:13px;font-weight:700;
  cursor:pointer;font-family:inherit}
.btn-adm-sec{padding:8px 14px;border-radius:var(--r);
  border:1.5px solid var(--border2);background:var(--bg3);
  color:var(--text);font-size:13px;cursor:pointer;font-family:inherit}
.btn-adm-del{padding:5px 10px;border-radius:var(--r);
  border:1px solid #fecaca;background:var(--rll);
  color:var(--red);font-size:11px;cursor:pointer;font-family:inherit}
.adm-section-hdr{display:flex;align-items:center;justify-content:space-between;
  margin-bottom:8px}
.adm-section-title{font-size:12px;font-weight:700;color:var(--text2);
  text-transform:uppercase;letter-spacing:.05em}
</style>`;
}

// ── Cargar tab ────────────────────────────────────────────────
async function _loadTab(tab) {
  _activeTab = tab;
  const content = document.getElementById('admContent');
  if (!content) return;
  content.innerHTML = '<div class="adm-loading">Cargando...</div>';

  if (tab === 'eventos')    await _renderEventos();
  else if (tab === 'operadores') await _renderOperadores();
  else if (tab === 'empresas')   await _renderEmpresas();
}

// ══════════════════════════════════════════════════════════════
// TAB EVENTOS
// ══════════════════════════════════════════════════════════════
async function _renderEventos() {
  const content = document.getElementById('admContent');
  const events  = await fsConfig.listEvents();

  content.innerHTML = `
    <!-- Crear evento -->
    <div class="adm-form">
      <div class="adm-form-title">➕ Nuevo evento</div>
      <div class="adm-grid">
        <div class="adm-fg adm-span2">
          <label class="adm-lbl">Nombre del evento *</label>
          <input type="text" id="evNombre" placeholder="MWC Barcelona 2027">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Fecha inicio</label>
          <input type="date" id="evFechaIni">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Fecha fin</label>
          <input type="date" id="evFechaFin">
        </div>
        <div class="adm-fg adm-span2">
          <label class="adm-lbl">Puertas (separadas por coma)</label>
          <input type="text" id="evPuertas" placeholder="puerta-1, puerta-2, puerta-3">
        </div>
      </div>
      <div class="adm-actions">
        <button class="btn-adm-pri" id="btnCrearEvento">Crear evento</button>
      </div>
    </div>

    <!-- Lista eventos -->
    <div class="adm-section-hdr">
      <div class="adm-section-title">${events.length} evento${events.length !== 1 ? 's' : ''}</div>
    </div>
    ${events.length ? events.map(e => `
      <div class="adm-card">
        <div class="adm-card-info">
          <div class="adm-card-title">${safeHtml(e.name || e.nombre)}</div>
          <div class="adm-card-sub">${safeHtml(e.startDate || '')}${e.endDate ? ' → ' + safeHtml(e.endDate) : ''} · ID: ${e.id}</div>
        </div>
        <div class="adm-badge ${e.active ? 'active' : 'inactive'}">${e.active ? 'Activo' : 'Inactivo'}</div>
        <button class="btn-adm-del" data-id="${e.id}" id="btnToggleEv-${e.id}">
          ${e.active ? 'Desactivar' : 'Activar'}
        </button>
      </div>`).join('') : '<div class="adm-loading">Sin eventos creados</div>'}`;

  // Crear evento
  document.getElementById('btnCrearEvento')?.addEventListener('click', _crearEvento);

  // Toggle activo/inactivo
  events.forEach(e => {
    document.getElementById(`btnToggleEv-${e.id}`)?.addEventListener('click', async () => {
      await _toggleEvento(e.id, !e.active);
      await _renderEventos();
    });
  });
}

async function _crearEvento() {
  const nombre = document.getElementById('evNombre')?.value.trim();
  if (!nombre) { toast('El nombre es obligatorio', 'var(--red)'); return; }

  const btn = document.getElementById('btnCrearEvento');
  btn.disabled = true;
  btn.textContent = 'Creando...';

  try {
    const db = getDB();
    const { collection, addDoc, serverTimestamp } = await import(`${FB_CDN}/firebase-firestore.js`);

    const puertas = (document.getElementById('evPuertas')?.value || 'puerta-1')
      .split(',').map(p => p.trim()).filter(Boolean);

    const docRef = await addDoc(collection(db, 'events'), {
      name:      nombre,
      startDate: document.getElementById('evFechaIni')?.value || '',
      endDate:   document.getElementById('evFechaFin')?.value || '',
      gates:     puertas,
      active:    true,
      createdAt: serverTimestamp(),
    });

    toast(`✅ Evento "${nombre}" creado · ID: ${docRef.id}`, 'var(--green)', 4000);
    await _renderEventos();

  } catch (err) {
    console.error('[Admin] Error crear evento:', err);
    toast('Error al crear el evento', 'var(--red)');
    btn.disabled = false;
    btn.textContent = 'Crear evento';
  }
}

async function _toggleEvento(eventId, active) {
  try {
    const db = getDB();
    const { doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    await updateDoc(doc(db, 'events', eventId), { active });
    toast(`Evento ${active ? 'activado' : 'desactivado'}`, 'var(--blue)', 1500);
  } catch (err) {
    toast('Error al actualizar evento', 'var(--red)');
  }
}

// ══════════════════════════════════════════════════════════════
// TAB OPERADORES
// ══════════════════════════════════════════════════════════════
async function _renderOperadores() {
  const content  = document.getElementById('admContent');
  const events   = await fsConfig.listEvents();
  const activeEv = events.find(e => e.active) || events[0];

  if (!activeEv) {
    content.innerHTML = '<div class="adm-loading">Crea un evento primero</div>';
    return;
  }

  const operators = await fsOperators.list(activeEv.id);

  content.innerHTML = `
    <!-- Crear operador -->
    <div class="adm-form">
      <div class="adm-form-title">➕ Nuevo operador</div>
      <div class="adm-grid">
        <div class="adm-fg adm-span2">
          <label class="adm-lbl">UID Firebase Auth *</label>
          <input type="text" id="opUID" placeholder="UID del usuario en Authentication">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Nombre</label>
          <input type="text" id="opNombre" placeholder="Carlos García">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Puerta asignada</label>
          <input type="text" id="opPuerta" placeholder="puerta-1">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Rol</label>
          <select id="opRol">
            <option value="operator">Operador</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Evento</label>
          <select id="opEvento">
            ${events.map(e => `<option value="${e.id}" ${e.id === activeEv.id ? 'selected' : ''}>${safeHtml(e.name || e.id)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="adm-actions">
        <button class="btn-adm-pri" id="btnCrearOp">Crear operador</button>
      </div>
    </div>

    <!-- Lista operadores -->
    <div class="adm-section-hdr">
      <div class="adm-section-title">${operators.length} operador${operators.length !== 1 ? 'es' : ''} · ${safeHtml(activeEv.name || activeEv.id)}</div>
    </div>
    ${operators.length ? operators.map(op => `
      <div class="adm-card">
        <div class="adm-card-info">
          <div class="adm-card-title">${safeHtml(op.name || op.id)}</div>
          <div class="adm-card-sub">Puerta: ${safeHtml(op.gateId || '—')} · Rol: ${safeHtml(op.role || 'operator')}</div>
          <div class="adm-card-sub" style="font-size:10px;font-family:'JetBrains Mono',monospace">UID: ${op.id}</div>
        </div>
        <div class="adm-badge active">${safeHtml(op.role || 'operator')}</div>
      </div>`).join('') : '<div class="adm-loading">Sin operadores en este evento</div>'}`;

  document.getElementById('btnCrearOp')?.addEventListener('click', _crearOperador);
}

async function _crearOperador() {
  const uid_op  = document.getElementById('opUID')?.value.trim();
  const nombre  = document.getElementById('opNombre')?.value.trim();
  const puerta  = document.getElementById('opPuerta')?.value.trim() || 'puerta-1';
  const rol     = document.getElementById('opRol')?.value || 'operator';
  const eventId = document.getElementById('opEvento')?.value;

  if (!uid_op)  { toast('El UID es obligatorio', 'var(--red)'); return; }
  if (!eventId) { toast('Selecciona un evento', 'var(--red)'); return; }

  const btn = document.getElementById('btnCrearOp');
  btn.disabled = true;
  btn.textContent = 'Creando...';

  try {
    await fsOperators.upsert(eventId, uid_op, {
      name:   nombre || uid_op,
      gateId: puerta,
      role:   rol,
    });
    toast(`✅ Operador creado en ${eventId}`, 'var(--green)');
    await _renderOperadores();
  } catch (err) {
    console.error('[Admin] Error crear operador:', err);
    toast('Error al crear el operador', 'var(--red)');
    btn.disabled = false;
    btn.textContent = 'Crear operador';
  }
}

// ══════════════════════════════════════════════════════════════
// TAB EMPRESAS
// ══════════════════════════════════════════════════════════════
async function _renderEmpresas() {
  const content = document.getElementById('admContent');
  const events  = await fsConfig.listEvents();
  const activeEv = events.find(e => e.active) || events[0];

  if (!activeEv) {
    content.innerHTML = '<div class="adm-loading">Crea un evento primero</div>';
    return;
  }

  // Cargar empresas del evento activo
  let companies = [];
  try {
    const db = getDB();
    const { collection, getDocs } = await import(`${FB_CDN}/firebase-firestore.js`);
    const snap = await getDocs(
      collection(db, 'events', activeEv.id, 'companies')
    );
    companies = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Admin] Error cargar empresas:', err);
  }

  content.innerHTML = `
    <!-- Crear empresa -->
    <div class="adm-form">
      <div class="adm-form-title">➕ Nueva empresa</div>
      <div class="adm-grid">
        <div class="adm-fg adm-span2">
          <label class="adm-lbl">UID Firebase Auth *</label>
          <input type="text" id="coUID" placeholder="UID del usuario empresa">
        </div>
        <div class="adm-fg adm-span2">
          <label class="adm-lbl">Nombre empresa *</label>
          <input type="text" id="coNombre" placeholder="Samsung Electronics">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">CIF / VAT</label>
          <input type="text" id="coCIF" placeholder="B12345678">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Email contacto</label>
          <input type="email" id="coEmail" placeholder="logistics@empresa.com">
        </div>
        <div class="adm-fg">
          <label class="adm-lbl">Evento</label>
          <select id="coEvento">
            ${events.map(e => `<option value="${e.id}" ${e.id === activeEv.id ? 'selected' : ''}>${safeHtml(e.name || e.id)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="adm-actions">
        <button class="btn-adm-pri" id="btnCrearEmpresa">Crear empresa</button>
      </div>
    </div>

    <!-- Lista empresas -->
    <div class="adm-section-hdr">
      <div class="adm-section-title">${companies.length} empresa${companies.length !== 1 ? 's' : ''} · ${safeHtml(activeEv.name || activeEv.id)}</div>
    </div>
    ${companies.length ? companies.map(co => `
      <div class="adm-card">
        <div class="adm-card-info">
          <div class="adm-card-title">${safeHtml(co.nombre || co.name || co.id)}</div>
          <div class="adm-card-sub">${safeHtml(co.email || '')}${co.cif ? ' · ' + safeHtml(co.cif) : ''}</div>
          <div class="adm-card-sub" style="font-size:10px;font-family:'JetBrains Mono',monospace">UID: ${co.id}</div>
        </div>
        <div class="adm-badge active">empresa</div>
      </div>`).join('') : '<div class="adm-loading">Sin empresas en este evento</div>'}`;

  document.getElementById('btnCrearEmpresa')?.addEventListener('click', _crearEmpresa);
}

async function _crearEmpresa() {
  const uid_co  = document.getElementById('coUID')?.value.trim();
  const nombre  = document.getElementById('coNombre')?.value.trim();
  const cif     = document.getElementById('coCIF')?.value.trim();
  const email   = document.getElementById('coEmail')?.value.trim();
  const eventId = document.getElementById('coEvento')?.value;

  if (!uid_co)  { toast('El UID es obligatorio', 'var(--red)'); return; }
  if (!nombre)  { toast('El nombre es obligatorio', 'var(--red)'); return; }
  if (!eventId) { toast('Selecciona un evento', 'var(--red)'); return; }

  const btn = document.getElementById('btnCrearEmpresa');
  btn.disabled = true;
  btn.textContent = 'Creando...';

  try {
    const db = getDB();
    const { doc, setDoc, serverTimestamp } = await import(`${FB_CDN}/firebase-firestore.js`);

    await setDoc(
      doc(db, 'events', eventId, 'companies', uid_co),
      { nombre, cif: cif || '', email: email || '',
        createdAt: serverTimestamp(), active: true },
      { merge: true }
    );

    toast(`✅ Empresa "${nombre}" creada`, 'var(--green)');
    await _renderEmpresas();

  } catch (err) {
    console.error('[Admin] Error crear empresa:', err);
    toast('Error al crear la empresa', 'var(--red)');
    btn.disabled = false;
    btn.textContent = 'Crear empresa';
  }
}

// ── Bind eventos ─────────────────────────────────────────────
function _bindEvents() {
  document.querySelectorAll('.adm-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      await _loadTab(tab.dataset.tab);
    });
  });

  document.getElementById('admBtnLogout')?.addEventListener('click', logout);
}
