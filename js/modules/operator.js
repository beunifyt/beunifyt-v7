function telLink(telPais, tel) {
  if (!tel || !tel.trim()) return '–';
  var full = (telPais||'') + tel.trim().replace(/\s+/g,'');
  var wa = full.replace('+','').replace(/[^0-9]/g,'');
  var ph = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.45 1.17h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  var ws = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.18 8.18 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.52 5.843L.057 23.5l5.805-1.522A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.513-5.16-1.406l-.37-.22-3.444.903.92-3.352-.24-.386A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';
  return '<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:' + full + '" style="color:var(--green);text-decoration:none;display:flex" title="Llamar">' + ph + '</a><a href="https://wa.me/' + wa + '" target="_blank" style="color:#25D366;text-decoration:none;display:flex" title="WhatsApp">' + ws + '</a><span style="font-size:11px">' + tel + '</span></div>';
}

// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — operator.js
// Módulo completo del operador. Carga lazy tras auth exitosa.
// Todas las tabs: Dashboard, Referencia, Ingresos, Embalaje, Conductores,
// Agenda, Análisis, Historial, Archivos, Papelera, Impresión, Recintos,
// Eventos, Mensajes, Usuarios
// ═══════════════════════════════════════════════════════════════════════
import { AppState }    from '../state.js';
import { toast, uid, safeHtml, formatDate, nowLocal, sortBy, normPlate, clone } from '../utils.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canClean, canExport, canImport, canPrint, canStatus, canSpecial, canCampos, canMensajes, logout } from '../auth.js';
import { fsGet, fsSet, fsUpdate, fsAdd, fsDel, fsGetAll, fsListen, fsBatch } from '../firestore.js';

const esc = safeHtml;
const fmt = formatDate;

// ─── CACHED DOM ELEMENTS ──────────────────────────────────────────────
const EL = {};
function cacheEL() {
  ['appHdr','mainTabs','mainContent','hdrCnts','syncPill'].forEach(id => { EL[id] = document.getElementById(id); });
}

// ─── LOCAL STATE ──────────────────────────────────────────────────────
let DB = {
  ingresos:[], ingresos2:[], movimientos:[], conductores:[], agenda:[],
  mensajesRampa:[], listaNegra:[], enEspera:[], auditLog:[], exportLog:[], editHistory:[],
  eventos:[], recintos:[], usuarios:[], papelera:[], preregistros:[],
  empresas:[], vehiculos:[],
  activeEventId: null, activeEventIds:[], defaultEventId: null,
  printCfg1:{}, printCfg2:{}, printCfgAg:{}, printTemplates:[], printCfgModes:{},
};

let curTab = 'dash';
let SID    = uid(); // session instance ID
let _autoFillOn = false;
let _posAutoOn  = true;
let iF = {
  // ingresos
  q:'', fecha:'', hall:'', activos:false,
  // ingresos2  
  q2:'', fecha2:'', hall2:'', activos2:false,
  // flota
  qF:'', statusF:'', hallF:'',
  // conductores
  qC:'', empresaC:'',
  // agenda
  qAg:'', fechaAg:'', estadoAg:'', hallAg:'',
};
window._iF = iF; // expose for inline handlers

// Firestore unsubscribe handles
const _unsubs = [];

// ─── ENTRY POINT ─────────────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  if (!user) { import('../auth.js').then(m => m.initAuth()); return; }

  _renderShell();
  cacheEL();
  _applyTheme();
  _bindGlobalKeyboard();

  // Load data from Firestore
  await _loadData();

  // Seed initial data if Firestore is empty
  await _seedIfEmpty();

  // Subscribe to real-time updates for key collections
  _subscribeRealtime();

  // Restore last tab
  try { curTab = localStorage.getItem('beu_tab') || 'dash'; } catch(e) {}
  _validateTab();

  goTab(curTab);
}

// ─── SEED INITIAL DATA ────────────────────────────────────────────────
async function _seedIfEmpty() {
  try {
    const user = AppState.get('currentUser');
    // Create user record in Firestore if missing
    const existingUser = await fsGet('users/' + user.id).catch(() => null);
    if (!existingUser) {
      await fsSet('users/' + user.id, {
        id: user.id, nombre: user.nombre, email: user.email,
        rol: 'superadmin', lang: 'es',
        tabs: ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics',
               'vehiculos','auditoria','papelera','impresion','recintos','eventos',
               'mensajes','usuarios','empresas'],
      }, false);
    }
    // Create test users if none exist
    const users = await fsGetAll('users').catch(() => []);
    if (users.length <= 1) {
      const { hashPin } = await import('../utils.js');
      const salt1 = 'salt_op_001', salt2 = 'salt_emp_001';
      const pin1 = await hashPin('1234', salt1);
      const pin2 = await hashPin('4321', salt2);
      await fsSet('users/test_operador', {
        id:'test_operador', nombre:'Operador Test', email:'operador@beunifyt.com',
        rol:'controlador_rampa', lang:'es', pinHash:pin1, pinSalt:salt1,
        tabs:['ingresos','ingresos2'],
      }, false);
      await fsSet('users/test_empresa', {
        id:'test_empresa', nombre:'Empresa Test', email:'empresa@beunifyt.com',
        rol:'empresa', lang:'es', pinHash:pin2, pinSalt:salt2,
      }, false);
    }
    // Create default event if none exist
    const evs = await fsGetAll('events').catch(() => []);
    if (!evs.length) {
      const evId = 'ev_default';
      await fsSet('events/' + evId, {
        id: evId, nombre: 'Evento Demo 2026', ico: '📋',
        ini: '2026-04-01', fin: '2026-04-10',
        recinto: 'Recinto Demo', ciudad: 'Barcelona', activo: true,
      }, false);
      await fsSet('config/activeEvent', { id: evId }, false);
      DB.activeEventId = evId;
      AppState.set('currentEvent', { id: evId, nombre: 'Evento Demo 2026', ico: '📋' });
    }
  } catch(e) { console.warn('[operator] seed', e); }
}

// ─── DATA LOADING ─────────────────────────────────────────────────────
async function _loadData() {
  const ev = AppState.get('currentEvent');
  const evId = ev?.id || DB.activeEventId;
  if (!evId) {
    // Load events list to pick one
    const evs = await fsGetAll('events');
    DB.eventos = evs;
    if (evs.length) {
      DB.activeEventId = evs[0].id;
      AppState.set('currentEvent', evs[0]);
    }
    return;
  }
  const base = `events/${evId}`;
  try {
    const [ingresos, ingresos2, agenda, conductores, mensajes, movimientos] = await Promise.all([
      fsGetAll(`${base}/ingresos`),
      fsGetAll(`${base}/ingresos2`),
      fsGetAll(`${base}/agenda`),
      fsGetAll(`${base}/conductores`),
      fsGetAll(`${base}/mensajes`),
      fsGetAll(`${base}/movimientos`),
    ]);
    DB.ingresos     = ingresos;
    DB.ingresos2    = ingresos2;
    DB.agenda       = agenda;
    DB.conductores  = conductores;
    DB.mensajesRampa= mensajes;
    DB.movimientos  = movimientos;
    // Set last ingreso for print preview
    const sorted = [...ingresos, ...ingresos2].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||''));
    if (sorted.length) AppState.set('lastIngreso', sorted[0]);
  } catch(e) { console.warn('[operator] loadData', e); }

  // Load config, events, users, etc.
  try {
    const allUsers = await fsGetAll('users');
    DB.usuarios = allUsers.filter(u => u.rol !== 'empresa');
    // Ensure current SA is in the list
    const curUser = AppState.get('currentUser');
    if (curUser && !DB.usuarios.find(u => u.id === curUser.id)) {
      DB.usuarios.push(curUser);
    }
    DB.eventos     = await fsGetAll('events');
    DB.recintos    = await fsGetAll('recintos');
    DB.empresas    = await fsGetAll('companies');
    DB.papelera    = await fsGetAll('papelera');
    DB.auditLog    = await fsGetAll('auditLog');
    DB.preregistros= await fsGetAll(`${base}/preregistros`);
    DB.editHistory = await fsGetAll(`${base}/editHistory`);
  } catch(e) { console.warn('[operator] loadConfig', e); }
}

async function saveDB() {
  // All saves are done individually per entity — no full DB write
  // Called after local DB mutation, actual Firestore writes happen in CRUD functions
}

async function _saveOne(collection, item) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsSet(`${base}/${item.id}`, item, false);
}

async function _deleteOne(collection, id) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsDel(`${base}/${id}`);
}

function _subscribeRealtime() {
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  const base = `events/${ev.id}`;
  // Real-time listener for ingresos
  fsListen(`${base}/ingresos`, docs => {
    DB.ingresos = docs;
    renderHdr();
    if (curTab === 'ingresos') renderIngresos();
    if (curTab === 'dash') renderDash();
  }).then(u => _unsubs.push(u));
  // Real-time listener for mensajes
  fsListen(`${base}/mensajes`, docs => {
    DB.mensajesRampa = docs;
    renderHdr();
    if (curTab === 'mensajes') renderMensajes();
  }).then(u => _unsubs.push(u));
}

// ─── SHELL HTML ───────────────────────────────────────────────────────
function _renderShell() {
  const user = AppState.get('currentUser');
  const tabs = _getAllowedTabs(user);

  document.body.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--teal:#0d9f6e;--r:6px;--r2:10px;--sh:0 1px 3px rgba(0,0,0,.06)}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:13px;-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden;display:flex;flex-direction:column}
input,select,textarea{font-family:inherit;font-size:12px;outline:none;padding:5px 8px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg2);color:var(--text);-webkit-appearance:none}
input:focus,select:focus,textarea:focus{border-color:var(--blue)}
textarea{resize:vertical}
button{cursor:pointer;border:none;border-radius:var(--r);font-weight:600;font-family:inherit;display:inline-flex;align-items:center;gap:4px;justify-content:center;transition:all .15s;white-space:nowrap}
button:disabled{opacity:.4;cursor:not-allowed}
button:active:not(:disabled){transform:scale(.97)}
.btn{padding:4px 11px;font-size:12px;border-radius:20px;border:none}
.btn-sm{padding:3px 9px;font-size:11px;border-radius:20px}
.btn-xs{padding:2px 7px;font-size:10px;border-radius:20px}
.btn-p{background:#2563eb;color:#fff}.btn-p:hover{background:#1d4ed8}
.btn-s{background:#0d9f6e;color:#fff}.btn-s:hover{background:#0a8a5e}
.btn-r,.btn-danger{background:#fee2e2;color:#dc2626;border:1px solid #fecaca}
.btn-gh{background:var(--bg2);color:var(--text2);border:1px solid var(--border)}.btn-gh:hover{background:var(--bg3)}
.btn-edit{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.btn-warning{background:#fef3c7;color:#b45309;border:1px solid #fde68a}
.tgl{display:inline-flex;align-items:center;gap:3px;padding:4px 9px;border-radius:16px;border:1.5px solid var(--border2);background:var(--bg3);color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;user-select:none;opacity:.6;transition:all .15s}
.tgl.on{border-color:var(--blue);background:var(--blue);color:#fff;opacity:1}
.tgl input{display:none}
.btn-tab{padding:5px 11px;border-radius:20px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;border:none;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;flex-shrink:0}
.btn-tab.active{background:linear-gradient(90deg,#2563eb,#cbd5e1);color:#fff;font-weight:700}
.btn-tab:hover:not(.active){background:rgba(26,86,219,.07);color:var(--text)}
/* Header */
#appHdr{display:flex;align-items:center;gap:4px;padding:0 10px;height:44px;background:var(--bg2);border-bottom:1.5px solid var(--border);flex-shrink:0;box-shadow:var(--sh)}
#hdrCnts{display:flex;align-items:center;gap:6px;flex:1;justify-content:center}
.hdr-cnt{display:flex;flex-direction:column;align-items:center;border:1px solid var(--border2);border-radius:var(--r);padding:1px 7px;min-width:48px}
.hdr-cv{font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.2}
.hdr-cl{font-size:8px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.ev-pill{background:var(--bg3);border:1px solid var(--border2);color:var(--text2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:800;cursor:pointer}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid var(--border2);background:var(--bg3);font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
/* Tabs bar */
#mainTabs{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0;scrollbar-width:none}
/* Content */
#mainContent{flex:1;overflow:hidden;display:flex;flex-direction:column}
.app-main{flex:1;overflow-y:auto;padding:10px 14px;max-width:1400px;margin:0 auto;width:100%}
/* Cards / grid */
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:repeat(3,1fr)}.sg4{grid-template-columns:repeat(4,1fr)}.sg6{grid-template-columns:repeat(6,1fr)}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:12px;box-shadow:var(--sh)}
.stat-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:10px 14px;box-shadow:var(--sh)}
.stat-n{font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.1}
.stat-l{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
/* Tables */
.tbl-wrap{overflow-x:auto;border-radius:var(--r2);border:1px solid var(--border)}
.dtbl{width:100%;border-collapse:collapse;font-size:12px}
.dtbl thead{background:var(--bg3)}
.dtbl th{padding:7px 10px;font-weight:700;font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;border-bottom:1.5px solid var(--border);text-align:left;white-space:nowrap}
.dtbl td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
.dtbl tbody tr:hover{background:var(--bg3)}
.dtbl tbody tr:last-child td{border-bottom:none}
/* Chips */
.mchip{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:6px;padding:2px 7px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.5px}
.mchip-sm{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700}
/* Search box */
.sbox{display:flex;align-items:center;background:var(--bg2);border:1.5px solid var(--border2);border-radius:20px;padding:4px 10px;gap:6px}
.sbox input{border:none;background:transparent;flex:1;font-size:12px}
.sico{font-size:14px;flex-shrink:0;opacity:.5}
/* Section header */
.sec-hdr{display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:wrap}
.sec-ttl{font-size:14px;font-weight:800}
.sec-act{display:flex;align-items:center;gap:4px;margin-left:auto;flex-wrap:wrap}
/* Bar charts */
.bar-row{display:flex;align-items:center;gap:6px;padding:2px 0}
.bar-bg{flex:1;height:6px;background:var(--bg4);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .3s}
.bar-val{font-size:10px;font-weight:700;min-width:24px;text-align:right;color:var(--text3)}
/* Status badges */
.sbadge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.pill-g{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.pill-b{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.pill-r{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.pill-a{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite;margin-right:3px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{background:var(--bg2);border-radius:var(--r2);padding:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.15)}
.modal-hdr{display:flex;align-items:center;margin-bottom:16px}
.modal-ttl{font-size:16px;font-weight:800;flex:1}
.fg{margin-bottom:10px}
.flbl{display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:3px;text-transform:uppercase}
.freq{color:var(--red)}
/* Empty states */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:var(--text3)}
.ei{font-size:40px;margin-bottom:8px}
.et{font-size:16px;font-weight:700}
.es{font-size:12px;margin-top:4px}
/* Agenda badges */
.ag-pend{background:#fef3c7;color:#b45309;border:1px solid #fde68a;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-done{background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-canc{background:var(--bg3);color:var(--text3);border:1px solid var(--border);border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
/* Hall badge */
.h-badge{display:inline-flex;align-items:center;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe}
@media (max-width:900px){.sg6{grid-template-columns:repeat(3,1fr)}.sg3{grid-template-columns:repeat(2,1fr)}.sg2{grid-template-columns:1fr}}
@media (max-width:600px){.sg6,.sg4,.sg3,.sg2{grid-template-columns:1fr}}

.btn-tab.tab-dragging{opacity:.4;cursor:grabbing}
.btn-tab.tab-drag-over{border-color:var(--blue)!important;background:var(--bll)!important}
</style>

<div id="appHdr" style="background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;height:44px;position:sticky;top:0;z-index:200">
  <div style="display:flex;align-items:center;gap:7px;flex-shrink:0">
    <svg viewBox="0 0 140 140" width="28" height="28"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/></svg>
    <span style="font-family:monospace;font-size:14px;font-weight:700;color:var(--text)"><span style="color:#00b89a">Be</span>Unify<span style="color:#00b89a">T</span></span>
  </div>
  <div id="hdrCnts" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px"></div>
  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
    <button style="border:1px solid var(--border2);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:11px;padding:3px 10px;cursor:pointer" onclick="window._op.cycleTheme()">🎨 Tema</button>
    <div id="syncPill" class="sync-pill"><div class="sd"></div></div>
    <span style="width:1px;height:20px;background:var(--border);margin:0 2px;display:inline-block"></span>
    <button style="border:none;background:none;font-size:11px;font-weight:500;color:var(--text2);cursor:pointer" onclick="window._op.openLangPicker()">🌐</button>
    <span style="font-size:12px;font-weight:500;color:var(--text2)">${esc(user?.nombre || 'Usuario')}</span>
    <span style="width:1px;height:20px;background:var(--border);margin:0 2px;display:inline-block"></span>
    <button class="btn btn-gh btn-sm" onclick="window._op.handleLogout()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</button>
  </div>
</div>

<div id="mainTabs">
  ${tabs.map(t => `<button class="btn-tab" data-tab="${t.id}" onclick="window._op.goTab('${t.id}')" draggable="true" ondragstart="window._op.tabDragStart(event)" ondragover="window._op.tabDragOver(event)" ondrop="window._op.tabDrop(event)" ondragend="window._op.tabDragEnd(event)">${t.ico} ${t.label}</button>`).join('')}
</div>

<div id="mainContent">
  <div class="app-main" id="tabContent">
    <!-- Tab content injected here -->
  </div>
</div>

<!-- MODAL CONTAINER -->
<div id="modalContainer"></div>
`;
}

// ─── TABS ─────────────────────────────────────────────────────────────
const SVG = {
  dash:       '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  ingresos:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
  ingresos2:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>',
  flota:      '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
  conductores:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>',
  agenda:     '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>',
  analytics:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  vehiculos:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  auditoria:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  papelera:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  impresion:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  recintos:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  eventos:    '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  mensajes:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  usuarios:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  empresas:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
};

const TAB_DEFS = [
  {id:'dash',       label:'Dashboard',   ico:SVG.dash},
  {id:'ingresos',   label:'Referencia',  ico:SVG.ingresos},
  {id:'ingresos2',  label:'Ingresos',    ico:SVG.ingresos2},
  {id:'flota',      label:'Embalaje',    ico:SVG.flota},
  {id:'conductores',label:'Conductores', ico:SVG.conductores},
  {id:'agenda',     label:'Agenda',      ico:SVG.agenda},
  {id:'analytics',  label:'Análisis',    ico:SVG.analytics},
  {id:'vehiculos',  label:'Historial',   ico:SVG.vehiculos},
  {id:'auditoria',  label:'Archivos',    ico:SVG.auditoria},
  {id:'papelera',   label:'Papelera',    ico:SVG.papelera},
  {id:'impresion',  label:'Impresión',   ico:SVG.impresion},
  {id:'recintos',   label:'Recintos',    ico:SVG.recintos},
  {id:'eventos',    label:'Eventos',     ico:SVG.eventos},
  {id:'mensajes',   label:'Mensajes',    ico:SVG.mensajes},
  {id:'usuarios',   label:'Usuarios',    ico:SVG.usuarios},
  {id:'empresas',   label:'Empresas',    ico:SVG.empresas},
  {id:'migracion',  label:'Migración',   ico:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'},
];

const DEFAULT_TABS = {
  superadmin:        ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios','empresas','migracion'],
  supervisor:        ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios'],
  controlador_rampa: ['ingresos','ingresos2'],
  editor:            ['ingresos','ingresos2','conductores','agenda','impresion'],
  visor:             ['ingresos','ingresos2','agenda'],
};

function _getAllowedTabs(user) {
  if (!user) return [];
  const allowed = user.tabs || DEFAULT_TABS[user.rol] || ['dash','ingresos'];
  return TAB_DEFS.filter(t => allowed.includes(t.id));
}

function _validateTab() {
  const user = AppState.get('currentUser');
  const allowed = _getAllowedTabs(user).map(t => t.id);
  if (!allowed.includes(curTab)) curTab = allowed[0] || 'dash';
}

function goTab(tab) {
  curTab = tab;
  try { localStorage.setItem('beu_tab', tab); } catch(e) {}
  document.querySelectorAll('#mainTabs .btn-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  renderHdr();
  const map = {
    dash:        renderDash,
    ingresos:    renderIngresos,
    ingresos2:   renderIngresos2,
    flota:       renderFlota,
    conductores: renderConductores,
    agenda:      renderAgenda,
    analytics:   renderAnalytics,
    vehiculos:   renderVehiculos,
    auditoria:   renderAuditoria,
    papelera:    renderPapelera,
    impresion:   renderImpresion,
    recintos:    renderRecintos,
    eventos:     renderEventosTab,
    mensajes:    renderMensajes,
    usuarios:    renderUsuarios,
    empresas:    renderEmpresasTab,
    migracion:   renderMigracion,
  };
  (map[tab] || renderDash)();
}

// ─── HEADER ───────────────────────────────────────────────────────────
function renderHdr() {
  const el = document.getElementById('hdrCnts'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const msgs  = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID) && !m.pausado && (!m.expiraTs || Date.now() < m.expiraTs)).length;
  const agH   = DB.agenda.filter(a => a.fecha === today && a.estado === 'PENDIENTE').length;
  const ev    = getActiveEvent();
  const hoy   = DB.ingresos.filter(i => i.entrada?.startsWith(today)).length + (DB.ingresos2||[]).filter(i => i.entrada?.startsWith(today)).length;
  const rec   = DB.ingresos.filter(i => !i.salida).length;
  const ref   = DB.ingresos.filter(i => !i.salida && (i.referencia||i.llamador)).length;
  el.innerHTML = `
    ${ev ? `<span class="ev-pill" style="cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="window._op.goTab('eventos')">${ev.ico||'📋'} ${esc(ev.nombre)}</span>` : '<span style="font-size:11px;color:var(--text3)">Sin evento</span>'}
    <div style="display:flex;gap:4px;align-items:center">
      ${msgs ? `<div class="hdr-cnt" style="border-color:var(--red);background:var(--rll);cursor:pointer" onclick="window._op.goTab('mensajes')"><div class="hdr-cv" style="color:var(--red)">${msgs}</div><div class="hdr-cl">MSG</div></div>` : ''}
      ${agH  ? `<div class="hdr-cnt" style="border-color:#c7d2fe;background:#eef2ff;cursor:pointer" onclick="window._op.goTab('agenda')"><div class="hdr-cv" style="color:#4f46e5">${agH}</div><div class="hdr-cl">AGENDA</div></div>` : ''}
    </div>`;
}

function getActiveEvent() {
  if (!DB.activeEventId) return null;
  return DB.eventos.find(e => e.id === DB.activeEventId) || null;
}

function getTabEvent(tab) { return getActiveEvent(); }

// ─── DASHBOARD ────────────────────────────────────────────────────────
let _dashEvFilter = null;

function renderDash() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const ev = DB.activeEventId ? DB.eventos.find(e => e.id === (DB.activeEventId)) : null;
  if (_dashEvFilter === null && ev) _dashEvFilter = ev.id;
  const selEv = _dashEvFilter ? DB.eventos.find(e => e.id === _dashEvFilter) : null;
  const allIngs = [...DB.ingresos, ...DB.ingresos2];
  const ings    = selEv ? allIngs.filter(i => i.eventoId === selEv.id) : allIngs;
  const rIngs   = selEv ? DB.ingresos.filter(i => i.eventoId === selEv.id) : DB.ingresos;
  const iIngs   = selEv ? DB.ingresos2.filter(i => i.eventoId === selEv.id) : DB.ingresos2;
  // Last 7 days
  const last7 = []; for (let d = 6; d >= 0; d--) { const dt = new Date(); dt.setDate(dt.getDate() - d); last7.push(dt.toISOString().slice(0, 10)); }
  const byDay = last7.map(d => ({ d, nRef: rIngs.filter(i => i.entrada?.startsWith(d)).length, nIng: iIngs.filter(i => i.entrada?.startsWith(d)).length }));
  const maxDay = Math.max(...byDay.map(x => x.nRef + x.nIng), 1);
  // Stats
  const enRec   = ings.filter(i => !i.salida).length;
  const hoyRef  = rIngs.filter(i => i.entrada?.startsWith(today)).length;
  const hoyIng  = iIngs.filter(i => i.entrada?.startsWith(today)).length;
  const agHoy   = DB.agenda.filter(a => a.fecha === today && (!selEv || a.eventoId === selEv.id));
  const msgs    = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID)).length;
  const lastIngs= [...ings].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||'')).slice(0, 15);
  const totalRef = rIngs.length, totalIng = iIngs.length, totalBoth = totalRef + totalIng;
  const pctRef = totalBoth ? Math.round(totalRef / totalBoth * 100) : 50;
  // Hall stats
  const hallC = {}; ings.forEach(i => (i.halls||[i.hall||'']).filter(Boolean).forEach(h => { hallC[h] = (hallC[h]||0)+1; }));
  const topH = Object.entries(hallC).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxHall = topH.length ? topH[0][1] : 1;

  let h = '';
  // Event selector
  const allEvs = DB.eventos.filter(e => DB.activeEventId ? e.id === DB.activeEventId : true);
  if (allEvs.length > 1) {
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    allEvs.forEach(e => { h += `<button class="btn btn-xs ${_dashEvFilter===e.id?'btn-p':'btn-gh'}" onclick="window._dashEvFilter='${e.id}';window._op.renderDash()">${e.ico||'📋'} ${esc(e.nombre)}</button>`; });
    h += `<button class="btn btn-xs ${!_dashEvFilter?'btn-p':'btn-gh'}" onclick="window._dashEvFilter=null;window._op.renderDash()">🌐 Todos</button></div>`;
  }
  // Stat cards
  h += '<div class="sg sg6" style="margin-bottom:8px">';
  const statCard = (n, l, color, icon) => `<div class="stat-box" style="border-top:3px solid ${color};display:flex;align-items:center;gap:8px"><div style="flex-shrink:0;color:${color}">${icon}</div><div><div class="stat-n" style="color:${color}">${n}</div><div class="stat-l">${l}</div></div></div>`;
  h += statCard(enRec, 'En recinto', 'var(--green)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>');
  h += statCard(rIngs.length, 'Referencias', 'var(--blue)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>');
  h += statCard(iIngs.length, 'Ingresos', 'var(--teal)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>');
  h += statCard(hoyRef + hoyIng, 'Hoy', '#00b89a', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>');
  h += statCard(agHoy.length, 'Agenda hoy', 'var(--amber)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>');
  h += statCard(msgs || 0, 'Mensajes', msgs ? 'var(--red)' : 'var(--border2)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>');
  h += '</div>';

  // Charts row
  h += '<div class="sg sg3" style="margin-bottom:8px">';
  // Chart 1: 7 days
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📊 Ingresos últimos 7 días</div>';
  byDay.forEach(x => {
    h += `<div class="bar-row"><span style="font-size:9px;min-width:38px;color:var(--text3)">${x.d.slice(5)}</span><div style="flex:1">`;
    h += `<div style="display:flex;align-items:center;gap:2px;margin-bottom:2px"><div style="height:5px;border-radius:2px;background:var(--blue);width:${Math.round(x.nRef/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nRef}</span></div>`;
    h += `<div style="display:flex;align-items:center;gap:2px"><div style="height:5px;border-radius:2px;background:var(--green);width:${Math.round(x.nIng/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nIng}</span></div>`;
    h += '</div></div>';
  });
  h += '</div>';
  // Chart 2: Ref vs Ing
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🔄 Ref vs Ing <span style="color:var(--blue)">${totalRef}</span> / <span style="color:var(--green)">${totalIng}</span></div>`;
  h += `<div style="height:12px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px"><div style="background:var(--blue);width:${pctRef}%"></div><div style="background:var(--green);flex:1"></div></div>`;
  h += '<div style="display:flex;gap:6px"><div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--blue);font-size:20px">${hoyRef}</div><div class="stat-l">🔖 HOY REF</div></div>`;
  h += '<div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--green);font-size:20px">${hoyIng}</div><div class="stat-l">🚛 HOY ING</div></div></div></div>`;
  // Chart 3: Halls
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏭 Halls más activos</div>';
  if (topH.length) { topH.forEach(kv => { h += `<div class="bar-row"><span style="font-size:11px;min-width:28px;font-weight:700">${esc(kv[0])}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(kv[1]/maxHall*100)}%;background:#00896b"></div></div><span class="bar-val">${kv[1]}</span></div>`; }); }
  else h += '<div class="empty" style="padding:12px"><div class="es">Sin datos de hall</div></div>';
  h += '</div></div>';

  // Agenda + últimos ingresos
  h += '<div class="sg sg2">';
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📅 Agenda hoy (${agHoy.length})</div>`;
  if (agHoy.length) {
    agHoy.slice(0, 6).forEach(a => {
      h += `<div style="display:flex;align-items:center;gap:4px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">`;
      h += `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;min-width:36px">${a.hora||'--:--'}</span>`;
      h += `<span class="mchip-sm">${esc(a.matricula||'—')}</span>`;
      h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px">${esc(a.empresa||a.conductor||'–')}</span>`;
      h += `<span class="${a.estado==='HECHO'?'ag-done':a.estado==='CANCELADO'?'ag-canc':'ag-pend'}">${a.estado||'PENDIENTE'}</span></div>`;
    });
  } else h += '<div class="empty" style="padding:12px"><div class="es">Sin citas hoy</div></div>';
  h += `<button class="btn btn-p btn-sm" style="margin-top:8px;width:100%" onclick="window._op.goTab('agenda')">Ver agenda →</button></div>`;

  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🕐 Últimos ingresos</div>';
  if (lastIngs.length) {
    h += '<div class="tbl-wrap" style="max-height:260px;overflow-y:auto"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Empresa</th><th>Hall</th><th>Hora</th></tr></thead><tbody>';
    lastIngs.forEach(i => {
      h += `<tr><td><span class="mchip" style="font-size:10px">${esc(i.matricula)}</span></td><td style="font-size:10px">${esc(i.empresa||'–')}</td><td><span class="h-badge">${esc(i.hall||i.halls?.[0]||'–')}</span></td><td style="font-size:10px">${fmt(i.entrada,'t')}</td></tr>`;
    });
    h += '</tbody></table></div>';
  } else h += '<div class="empty" style="padding:12px"><div class="es">Sin ingresos registrados</div></div>';
  h += '</div></div>';

  if (msgs) h += `<div style="margin-top:10px;background:var(--rll);border:1.5px solid #fecaca;border-radius:var(--r2);padding:10px 14px;display:flex;align-items:center;gap:10px"><b>📢 ${msgs} mensaje(s) sin leer</b><button class="btn btn-gh btn-sm" onclick="window._op.goTab('mensajes')">Ver</button></div>`;

  el.innerHTML = h;
}

// ─── INGRESOS (Referencia) ────────────────────────────────────────────
function renderIngresos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const _ingSub = window._ingSub || 'lista';
  // Route to subtabs
  if (_ingSub === 'listanegra') { _renderListaNegra(el); return; }
  if (_ingSub === 'espera')     { _renderEnEspera(el); return; }
  if (_ingSub === 'campos')     { _renderCamposSubtab(el, 'ingresos'); return; }
  let items = [...DB.ingresos];
  if (DB.activeEventId) items = items.filter(i => !i.eventoId || i.eventoId === DB.activeEventId);
  const q = (iF.q || '').toLowerCase();
  if (q) items = items.filter(i => `${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.montador||''} ${i.expositor||''} ${i.comentario||''} ${i.telefono||''} ${i.email||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.tipoCarga||''}`.toLowerCase().includes(q));
  if (iF.activos) items = items.filter(i => !i.salida);
  if (iF.hall)    items = items.filter(i => (i.halls||[i.hall||'']).includes(iF.hall));
  const sorted = sortBy(items, iF.sortCol||'pos', iF.sortDir||'desc');
  const today = new Date().toISOString().slice(0, 10);
  const hoy = items.filter(i => i.entrada?.startsWith(today)).length;
  const enRec = items.filter(i => !i.salida).length;

  let h = `
  <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
    <button class="btn btn-sm btn-p" style="flex-shrink:0">📋 Lista</button>
    <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._ingSub='listanegra';window._op.renderIngresos()">⭐ Especial (${(DB.listaNegra||[]).length})</button>
    <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._op.goTab('vehiculos')">✏️ Modificaciones</button>
    <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._ingSub='espera';window._op.renderIngresos()">⏳ En espera (${(DB.enEspera||[]).filter(e=>e.estado==='pendiente').length})</button>
    ${canCampos()?'<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._ingSub=\'campos\';window._op.renderIngresos()">⊙ Campos</button>':''}
    <span style="flex:1"></span>
    ${canAdd()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._op.openIngModal(null)">+ Ingreso</button>':''}
    <button class="btn btn-sm af-toggle-btn ${_autoFillOn?\'btn-p\':\'btn-gh\'}" onclick="window._op.toggleAutoFill()" style="flex-shrink:0" title="Autorrelleno con último ingreso"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="13" cy="12" r="8"/><path d="M13 8v4l3 3"/><path d="M3 3l18 18"/></svg> ${_autoFillOn?\'ON\':\'OFF\'}</button>
    <button class="btn btn-sm pos-toggle-btn ${_posAutoOn?\'btn-p\':\'btn-gh\'}" onclick="window._op.togglePosAuto()" style="flex-shrink:0" title="Numeración automática posiciones"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> ${_posAutoOn?\'ON\':\'OFF\'}</button>
    ${canImport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateIngresos()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button><label class="btn btn-gh btn-sm" style="cursor:pointer;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Importar<input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,\'ingresos\')"></label>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.exportExcel(\'ingresos\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${canClean()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.vaciarTab(\'ingresos\')">🗑 Limpiar</button>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._op.vaciarTab(\'ingresos\')">💥 Vaciar</button>':''}
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
    <div class="sbox" style="flex:0 1 240px;min-width:120px">
      <span class="sico">🔍</span>
      <input type="search" placeholder="Pos, matricula, nombre..." value="${esc(iF.q||'')}" oninput="window._iF.q=this.value;window._op.renderIngresos()" id="qIngInput" style="font-size:12px">
    </div>
    <input type="date" value="${iF.fecha||''}" oninput="window._iF.fecha=this.value;window._op.renderIngresos()" style="height:30px;padding:3px 6px;font-size:11px;width:115px;box-sizing:border-box">
    <span class="pill" style="font-size:11px;cursor:pointer;flex-shrink:0;border:1.5px solid ${iF.activos?'var(--blue)':'var(--border)'};background:${iF.activos?'var(--blue)':'var(--bg2)'};color:${iF.activos?'#fff':'var(--text3)'}" onclick="window._iF.activos=!window._iF.activos;window._op.renderIngresos()">Solo activos</span>
    ${iF.q||iF.fecha||iF.activos?'<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF={q:\'\',fecha:\'\',hall:\'\',activos:false};window._op.renderIngresos()">✕</span>':''}
    <span style="font-size:10px;color:var(--text3)">${sorted.length} reg.</span>
  </div>
  ${getRecintoHalls().length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:5px">
    <span class="pill" style="font-size:10px;font-weight:700;padding:2px 8px;cursor:pointer;background:${!iF.hall?'#e0f2fe':'#dbeafe'};color:${!iF.hall?'#0369a1':'#1e40af'};border:1.5px solid ${!iF.hall?'#7dd3fc':'#93c5fd'}" onclick="window._iF.hall='';window._op.renderIngresos()">Todos</span>
    ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:2px 8px;cursor:pointer;background:${iF.hall===h?'#3b82f6':'#dbeafe'};color:${iF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${iF.hall===h?'#2563eb':'#93c5fd'}" onclick="window._iF.hall='${h}';window._op.renderIngresos()">${h}</span>`).join('')}
  </div>` : ''}

    if (!sorted.length) {
    h += '<div class="empty"><div class="ei">🔖</div><div class="et">Sin referencias</div><div class="es">Registra la primera entrada</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('ingresos','pos','#')}${thSort('ingresos','matricula','Matrícula')}${thSort('ingresos','empresa','Empresa')}${thSort('ingresos','montador','Montador')}${'<th>Hall</th>'}${'<th>Stand</th>'}${thSort('ingresos','referencia','Ref.')}${'<th>Tel.</th>'}${thSort('ingresos','entrada','Entrada')}${'<th>Estado</th>'}${'<th></th>'}</tr></thead><tbody>';
    sorted.forEach(i => {
      const inRec = !i.salida;
      h += `<tr style="${inRec?'background:var(--gll)':''}">
        <td style="font-weight:800;color:var(--text3);font-size:11px">${i.pos||'–'}</td>
        <td><span class="mchip" style="cursor:pointer;font-size:11px" onclick="window._op.showDetalle('${i.id}','ingresos')">${esc(i.matricula)}</span></td>
        <td style="font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.empresa||'–')}</td>
        <td style="font-size:11px">${esc(i.montador||'–')}</td>
        <td><span class="h-badge">${esc(i.hall||i.halls?.[0]||'–')}</span></td>
        <td style="font-size:11px">${esc(i.stand||'–')}</td>
        <td style="font-size:11px;color:var(--text3)">${esc(i.referencia||i.llamador||'–')}</td>
        <td>${telLink(i.telPais||'', i.telefono||'')}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap">${fmt(i.entrada)}</td>
        <td>${inRec?'<span class="pill pill-g"><span class="live"></span>En recinto</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">↩ Salida</span>'}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          ${canPrint()?`<button class="btn btn-gh btn-xs" onclick="window._op.printIngreso('${i.id}')" title="Imprimir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>`:''}
          ${canPrint()?`<button class="btn btn-xs" style="background:#7c3aed;color:#fff;border:none;border-radius:20px" onclick="window._op.printTroquelado('\${i.id}')" title="Imprimir Troquelado A4"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></button>`:''}
          ${inRec&&canStatus()?`<button class="btn btn-gh btn-xs" onclick="window._op.registrarTracking('\${i.id}','ingresos')" title="Tracking paso"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></button>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openIngModal('${i.id}','ingresos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${canStatus()&&inRec?`<button class="btn btn-xs" style="background:var(--amber);color:#fff;border-radius:20px" onclick="window._op.registrarSalida('${i.id}','ingresos')" title="Registrar salida"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 000-8h-1"/></svg></button>`:''}
          ${canStatus()&&!inRec?`<button class="btn btn-xs btn-s" onclick="window._op.reactivar('${i.id}','ingresos')" title="Reactivar">↺</button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${i.id}','ingresos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
  // Preserve search focus
  const inp = document.getElementById('qIngInput');
  if (inp && iF.q) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}

// ─── INGRESOS2 ────────────────────────────────────────────────────────
function renderIngresos2() {
  const el = document.getElementById('tabContent'); if (!el) return;
  let items = [...DB.ingresos2];
  if (DB.activeEventId) items = items.filter(i => !i.eventoId || i.eventoId === DB.activeEventId);
  const q = (iF.q2 || '').toLowerCase();
  if (q) items = items.filter(i => `${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.remolque||''} ${i.comentario||''} ${i.telefono||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.tipoCarga||''}`.toLowerCase().includes(q));
  if (iF.activos2) items = items.filter(i => !i.salida);
  const sorted = sortBy(items, iF.sortCol2||'pos', iF.sortDir2||'desc');
  const today = new Date().toISOString().slice(0, 10);

    let h = `
  <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
    <button class="btn btn-sm btn-p" style="flex-shrink:0">📋 Lista</button>
    <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._ingSub2='listanegra';window._op.renderIngresos2()">⭐ Especial</button>
    <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._op.goTab('vehiculos')">✏️ Modificaciones</button>
    ${canCampos()?'<button class="btn btn-sm btn-gh" style="flex-shrink:0">⊙ Campos</button>':''}
    <span style="flex:1"></span>
    ${canAdd()?'<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._op.openIngModal(null,'ingresos2')">+ Ingreso</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateIngresos2()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.exportExcel('ingresos2')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${canImport()?'<label class="btn btn-gh btn-sm" style="cursor:pointer;flex-shrink:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Importar<input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,'ingresos2')"></label>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._op.vaciarTab('ingresos2')">💥 Vaciar</button>':''}
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Pos, matrícula, nombre..." value="${esc(iF.q2||'')}" oninput="window._iF.q2=this.value;window._op.renderIngresos2()" style="font-size:12px"></div>
    <input type="date" value="${iF.fecha2||''}" oninput="window._iF.fecha2=this.value;window._op.renderIngresos2()" style="height:30px;padding:3px 6px;font-size:11px;width:115px;box-sizing:border-box">
    <span class="pill" style="font-size:11px;cursor:pointer;flex-shrink:0;border:1.5px solid ${iF.activos2?'var(--blue)':'var(--border)'};background:${iF.activos2?'var(--blue)':'var(--bg2)'};color:${iF.activos2?'#fff':'var(--text3)'}" onclick="window._iF.activos2=!window._iF.activos2;window._op.renderIngresos2()">Solo activos</span>
    ${iF.q2||iF.fecha2||iF.activos2?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.q2='';window._iF.fecha2='';window._iF.activos2=false;window._op.renderIngresos2()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${sorted2.length} reg.</span>
  </div>
  if (!sorted.length) {
    h += '<div class="empty"><div class="ei">🚛</div><div class="et">Sin ingresos</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Nombre/Conductor</th><th>Empresa</th><th>Hall</th><th>Tel.</th><th>Hora entrada</th><th>Estado</th><th></th></tr></thead><tbody>';
    sorted.forEach(i => {
      const inRec = !i.salida;
      const nombre = ((i.nombre||'') + ' ' + (i.apellido||'')).trim();
      h += `<tr style="${inRec?'background:var(--gll)':''}">
        <td style="font-weight:800;color:var(--text3);font-size:11px">${i.pos||'–'}</td>
        <td><span class="mchip" style="cursor:pointer;font-size:11px" onclick="window._op.showDetalle('${i.id}','ingresos2')">${esc(i.matricula)}</span></td>
        <td style="font-size:11px">${esc(nombre||i.conductor||'–')}</td>
        <td style="font-size:11px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.empresa||'–')}</td>
        <td><span class="h-badge">${esc(i.hall||i.halls?.[0]||'–')}</span></td>
        <td>${telLink(i.telPais||'', i.telefono||'')}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap">${fmt(i.entrada)}</td>
        <td>${inRec?'<span class="pill pill-g"><span class="live"></span>En recinto</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">↩ Salida</span>'}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openIngModal('${i.id}','ingresos2')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${canStatus()&&inRec?`<button class="btn btn-xs btn-warning" onclick="window._op.registrarSalida('${i.id}','ingresos2')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 000-8h-1"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${i.id}','ingresos2')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── FLOTA (Embalaje) ─────────────────────────────────────────────────
function renderFlota() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const STATUSES = ['ALMACEN','SOT','FIRA','FINAL'];
  const items = sortBy(DB.movimientos, 'posicion', 'asc');
  const q = (iF.qFlota||'').toLowerCase();
  let filtered = q ? items.filter(i => `${i.matricula} ${i.empresa||''} ${i.hall||''} ${i.tipoCarga||''} ${i.status||''} ${i.posicion||''}`.toLowerCase().includes(q)) : [...items];
  if (iF.statusF) filtered = filtered.filter(i => i.status === iF.statusF);
  if (iF.hallF)   filtered = filtered.filter(i => i.hall === iF.hallF);

  const SCFG_L = {ALMACEN:{i:'📦',c:'#3b82f6'},SOT:{i:'⏱',c:'#0d9f6e'},FIRA:{i:'🟢',c:'#f59e0b'},FINAL:{i:'✅',c:'#6b7280'}};
  let h = `
  <div class="sg sg4" style="margin-bottom:6px">
    ${STATUSES.map(s=>`<div class="stat-box" style="border-top:3px solid ${SCFG_L[s]?.c};cursor:pointer;background:${iF.statusF===s?SCFG_L[s]?.c+'22':'var(--bg2)'}" onclick="window._iF.statusF=window._iF.statusF==='${s}'?'':'${s}';window._op.renderFlota()">
      <div class="stat-n" style="color:${SCFG_L[s]?.c}">${(DB.movimientos||[]).filter(m=>m.status===s).length}</div>
      <div class="stat-l">${SCFG_L[s]?.i} ${s}</div>
    </div>`).join('')}
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${esc(iF.qFlota||'')}" oninput="window._iF.qFlota=this.value;window._op.renderFlota()" style="font-size:12px"></div>
    ${iF.qFlota||iF.statusF?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qFlota='';window._iF.statusF='';window._op.renderFlota()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3);flex-shrink:0">${filtered.length} veh.</span>
    <span style="flex:1"></span>
    ${canAdd()?'<button class="btn btn-p btn-sm" onclick="window._op.openFlotaModal(null)">+ Añadir</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateFlota()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('movimientos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${canImport()?'<label class="btn btn-gh btn-sm" style="cursor:pointer"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Importar<input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,'movimientos')"></label>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarTab('movimientos')">💥 Vaciar</button>':''}
  </div>

  if (!filtered.length) { h += '<div class="empty"><div class="ei">📦</div><div class="et">Sin vehículos en embalaje</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Pos</th><th>Matrícula</th><th>Remolque</th><th>Empresa</th><th>Hall</th><th>Tipo Carga</th><th>Estado</th><th></th></tr></thead><tbody>';
    filtered.forEach(i => {
      const stColors = {ALMACEN:'var(--bll)',SOT:'var(--gll)',FIRA:'var(--all)',FINAL:'#fdf4ff'};
      const stTxt = {ALMACEN:'var(--blue)',SOT:'var(--green)',FIRA:'var(--amber)',FINAL:'#7c3aed'};
      h += `<tr>
        <td style="font-weight:800">${i.posicion||'–'}</td>
        <td><span class="mchip" style="font-size:11px">${esc(i.matricula)}</span></td>
        <td style="font-size:11px">${esc(i.remolque||'–')}</td>
        <td style="font-size:11px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(i.empresa||'–')}</td>
        <td><span class="h-badge">${esc(i.hall||'–')}</span></td>
        <td style="font-size:11px">${esc(i.tipoCarga||'–')}</td>
        <td>
          <select style="font-size:10px;padding:2px 5px;border-radius:10px;background:${stColors[i.status]||'var(--bg3)'};color:${stTxt[i.status]||'var(--text)'};border:1px solid var(--border);font-weight:700" onchange="window._op.setFlotaStatus('${i.id}',this.value)">
            ${STATUSES.map(s => `<option value="${s}" ${i.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openFlotaModal('${i.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${i.id}','movimientos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── CONDUCTORES ──────────────────────────────────────────────────────
function renderConductores() {
  const el = document.getElementById('tabContent'); if (!el) return;
  if (window._condSub === 'campos') { _renderCamposSubtab(el, 'conductores'); return; }
  const q = (iF.qCond||'').toLowerCase();
  let items = DB.conductores;
  if (q) items = items.filter(i => `${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.telefono||''} ${i.pasaporte||''}`.toLowerCase().includes(q));
  const sorted = sortBy(items, 'nombre', 'asc');

    let h = `
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Nombre, matrícula, empresa..." value="${esc(iF.qC||'')}" oninput="window._iF.qC=this.value;window._op.renderConductores()" style="font-size:12px"></div>
    ${iF.qC||iF.empresaC?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qC='';window._iF.empresaC='';window._op.renderConductores()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${filtered.length} cond.</span>
    <span style="flex:1"></span>
    ${canCampos()?`<button class="btn btn-sm ${window._condSub==='campos'?'btn-p':'btn-gh'}" onclick="window._condSub='campos';window._op.renderConductores()">⊙ Campos</button>`:''}  ${canAdd()?'<button class="btn btn-p btn-sm" onclick="window._op.openCondModal(null)">+ Conductor</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateConductores()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('conductores')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${canImport()?'<label class="btn btn-gh btn-sm" style="cursor:pointer"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Importar<input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,'conductores')"></label>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarTab('conductores')">💥 Vaciar</button>':''}
  </div>
  if (!sorted.length) { h += '<div class="empty"><div class="ei">👤</div><div class="et">Sin conductores</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Matrícula</th><th>Empresa</th><th>Teléfono</th><th>Pasaporte/DNI</th><th>País</th><th></th></tr></thead><tbody>';
    sorted.forEach(c => {
      h += `<tr>
        <td style="font-weight:700">${esc((c.nombre||'')+' '+(c.apellido||''))}</td>
        <td><span class="mchip-sm">${esc(c.matricula||'–')}</span></td>
        <td style="font-size:11px">${esc(c.empresa||'–')}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(c.telefono||'–')}</td>
        <td style="font-size:11px">${esc(c.pasaporte||'–')}</td>
        <td style="font-size:11px">${esc(c.pais||'–')}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openCondModal('${c.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${c.id}','conductores')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── AGENDA ───────────────────────────────────────────────────────────
function renderAgenda() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const fecha = iF.agFecha || today;
  let items = DB.agenda.filter(a => a.fecha === fecha);
  if (DB.activeEventId) items = items.filter(a => !a.eventoId || a.eventoId === DB.activeEventId);
  const q = (iF.qAg||'').toLowerCase();
  if (q) items = items.filter(a => `${a.matricula} ${a.empresa||''} ${a.conductor||''} ${a.referencia||''}`.toLowerCase().includes(q));
  const sorted = sortBy(items, 'hora', 'asc');

    let h = `
  <div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
    ${['PENDIENTE','CONFIRMADO','CANCELADO'].map(e=>`<button class="btn btn-sm ${iF.estadoAg===e?'btn-p':'btn-gh'}" style="flex-shrink:0" onclick="window._iF.estadoAg=window._iF.estadoAg==='${e}'?'':'${e}';window._op.renderAgenda()">${e==='PENDIENTE'?'⏳':e==='CONFIRMADO'?'✅':'❌'} ${e}</button>`).join('')}
    <span style="flex:1"></span>
    ${canAdd()?'<button class="btn btn-p btn-sm" style="flex-shrink:0" onclick="window._op.openAgendaModal(null)">+ Cita</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateAgenda()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.exportExcel('agenda')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._op.vaciarTab('agenda')">💥 Vaciar</button>':''}
  </div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap">
    <input type="date" value="${iF.agFecha||fecha}" onchange="window._iF.agFecha=this.value;window._op.renderAgenda()" style="font-size:11px;padding:3px 6px;height:30px;min-width:110px;max-width:130px;box-sizing:border-box">
    <div class="sbox" style="flex:0 1 220px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Buscar empresa, hall..." value="${esc(iF.qAg||'')}" oninput="window._iF.qAg=this.value;window._op.renderAgenda()" style="font-size:12px"></div>
    ${iF.qAg||iF.estadoAg||iF.agFecha!==fecha?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qAg='';window._iF.estadoAg='';window._iF.agFecha='';window._op.renderAgenda()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${filteredAg.length} citas</span>
  </div>
  if (!sorted.length) { h += '<div class="empty"><div class="ei">📅</div><div class="et">Sin citas para esta fecha</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Hora</th><th>Matrícula</th><th>Conductor/Empresa</th><th>Referencia</th><th>Hall</th><th>Estado</th><th></th></tr></thead><tbody>';
    sorted.forEach(a => {
      h += `<tr>
        <td style="font-family:'JetBrains Mono',monospace;font-weight:700">${a.hora||'–'}</td>
        <td><span class="mchip-sm">${esc(a.matricula||'–')}</span></td>
        <td style="font-size:11px">${esc(a.empresa||a.conductor||'–')}</td>
        <td style="font-size:11px;color:var(--text3)">${esc(a.referencia||'–')}</td>
        <td><span class="h-badge">${esc(a.hall||'–')}</span></td>
        <td><span class="${a.estado==='HECHO'?'ag-done':a.estado==='CANCELADO'?'ag-canc':'ag-pend'}">${a.estado||'PENDIENTE'}</span></td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openAgendaModal('${a.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${canEdit()?`<select style="font-size:10px;padding:2px 5px;border-radius:8px;border:1px solid var(--border)" onchange="window._op.setAgendaEstado('${a.id}',this.value)"><option>PENDIENTE</option><option>HECHO</option><option>CANCELADO</option></select>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${a.id}','agenda')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── ANALYTICS ────────────────────────────────────────────────────────
function renderAnalytics() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const allIngs = [...DB.ingresos, ...DB.ingresos2];

  // Tipo vehículo breakdown
  const tvC = {}; allIngs.forEach(i => { if (i.tipoVehiculo) tvC[i.tipoVehiculo] = (tvC[i.tipoVehiculo]||0)+1; });
  const tvTop = Object.entries(tvC).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const tvMax = tvTop.length ? tvTop[0][1] : 1;
  // Descarga breakdown
  const descC = { mano:0, maquinaria:0 }; allIngs.forEach(i => { if (i.descargaTipo) descC[i.descargaTipo] = (descC[i.descargaTipo]||0)+1; });
  // Empresa breakdown
  const empC = {}; allIngs.forEach(i => { if (i.empresa) empC[i.empresa] = (empC[i.empresa]||0)+1; });
  const empTop = Object.entries(empC).sort((a,b) => b[1]-a[1]).slice(0, 8);
  const empMax = empTop.length ? empTop[0][1] : 1;

  let h = `<div class="sg sg3" style="margin-bottom:8px">
    <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🚗 Tipo vehículo</div>
      ${tvTop.map(kv => `<div class="bar-row"><span style="font-size:10px;min-width:90px;color:var(--text2)">${esc(kv[0])}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(kv[1]/tvMax*100)}%;background:#3b82f6"></div></div><span class="bar-val">${kv[1]}</span></div>`).join('') || '<div class="empty" style="padding:8px"><div class="es">Sin datos</div></div>'}
    </div>
    <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📦 Tipo descarga</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div style="text-align:center;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);padding:10px"><div class="stat-n" style="color:var(--green);font-size:20px">${descC.mano||0}</div><div class="stat-l">🤾 A Mano</div></div>
        <div style="text-align:center;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:10px"><div class="stat-n" style="color:var(--blue);font-size:20px">${descC.maquinaria||0}</div><div class="stat-l">🏗 Maquinaria</div></div>
      </div>
    </div>
    <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏢 Top empresas</div>
      ${empTop.map(kv => `<div class="bar-row"><span style="font-size:10px;min-width:90px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px">${esc(kv[0])}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(kv[1]/empMax*100)}%;background:var(--teal)"></div></div><span class="bar-val">${kv[1]}</span></div>`).join('') || '<div class="empty" style="padding:8px"><div class="es">Sin datos</div></div>'}
    </div>
  </div>
  <div class="card"><div style="font-weight:800;margin-bottom:4px">📊 Resumen general</div>
    <div class="sg sg4">
      <div style="text-align:center;padding:8px;background:var(--gll);border-radius:var(--r)"><div class="stat-n" style="color:var(--green)">${allIngs.filter(i=>!i.salida).length}</div><div class="stat-l">En recinto</div></div>
      <div style="text-align:center;padding:8px;background:var(--bll);border-radius:var(--r)"><div class="stat-n" style="color:var(--blue)">${allIngs.filter(i=>i.entrada?.startsWith(today)).length}</div><div class="stat-l">Hoy</div></div>
      <div style="text-align:center;padding:8px;background:var(--bg3);border-radius:var(--r)"><div class="stat-n">${DB.ingresos.length}</div><div class="stat-l">Total Ref.</div></div>
      <div style="text-align:center;padding:8px;background:var(--bg3);border-radius:var(--r)"><div class="stat-n">${DB.ingresos2.length}</div><div class="stat-l">Total Ing.</div></div>
    </div>
  </div>`;
  el.innerHTML = h;
}

// ─── HISTORIAL ────────────────────────────────────────────────────────
function renderVehiculos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const hist = [...DB.editHistory].sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0, 200);
  const q = (iF.qHist||'').toLowerCase();
  const filtered = q ? hist.filter(h => `${h.mat||''} ${h.user||''} ${h.action||''} ${h.detail||''}`.toLowerCase().includes(q)) : hist;

    let h = `
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${esc(iF.qVeh||'')}" oninput="window._iF.qVeh=this.value;window._op.renderVehiculos()" style="font-size:12px"></div>
    ${iF.qVeh?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qVeh='';window._op.renderVehiculos()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${filtVeh.length} reg.</span>
    <span style="flex:1"></span>
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateVehiculos()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('vehiculos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarTab('vehiculos')">💥 Vaciar</button>':''}
  </div>
  if (!filtered.length) { h += '<div class="empty"><div class="ei">📜</div><div class="et">Sin historial</div></div>'; }
  else {
    const icoMap = { new:'✅',edit:'✏️',salida:'↩',reactivar:'↺',new_ing2:'✅',edit_ing2:'✏️',delete:'🗑' };
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>';
    filtered.forEach(r => {
      h += `<tr>
        <td style="font-size:11px;color:var(--text3)">${r.pos?'#'+r.pos:''}</td>
        <td><span class="mchip-sm">${esc(r.mat||'–')}</span></td>
        <td style="font-size:11px">${icoMap[r.action]||r.action||'•'}</td>
        <td style="font-size:11px;font-weight:700">${esc(r.user||'–')}</td>
        <td style="font-size:11px;color:var(--text3);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.detail||'–')}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap">${fmt(r.ts)}</td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── ARCHIVOS / AUDITORIA ────────────────────────────────────────────
function renderAuditoria() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const sub = window._audSub || 'sesiones';
  const q = (window._audQ || '').toLowerCase();
  let subContent = '';

  if (sub === 'sesiones') {
    let items = (DB.auditLog||[]).filter(e => e.entity === 'sesion');
    if (q) items = items.filter(e => `${e.user||''} ${e.detail||''}`.toLowerCase().includes(q));
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Estado</th><th>Usuario</th><th>Detalle</th><th>Fecha/Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||'–')}</td><td style="font-size:11px;white-space:nowrap">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">🔑</div><div class="et">Sin eventos de sesión</div></div>';
  } else if (sub === 'acciones') {
    let items = (DB.auditLog||[]).filter(e => e.entity !== 'sesion');
    if (q) items = items.filter(e => `${e.user||''} ${e.action||''} ${e.entity||''} ${e.detail||''}`.toLowerCase().includes(q));
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Acción</th><th>Usuario</th><th>Entidad</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px">${esc(e.entity||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||'–')}</td><td style="font-size:11px;white-space:nowrap">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">📋</div><div class="et">Sin acciones</div></div>';
  } else if (sub === 'exportaciones') {
    const items = sortBy(DB.exportLog||[], 'ts', 'desc');
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Pestaña</th><th>Archivo</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px;white-space:nowrap">${fmt(e.ts)}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td><span class="pill pill-b">${esc(e.tab||'–')}</span></td><td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(e.filename||'–')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">📥</div><div class="et">Sin exportaciones</div></div>';
  }

  const tabBtn = (id, label, cnt) => `<button class="btn btn-sm ${sub===id?'btn-p':'btn-gh'}" onclick="window._audSub='${id}';window._op.renderAuditoria()">${label}${cnt?` <span style="background:rgba(255,255,255,.3);padding:1px 5px;border-radius:10px;font-size:9px;margin-left:3px">${cnt}</span>`:''}</button>`;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">
      <div class="sbox" style="flex:1;min-width:160px"><span class="sico">🔍</span><input type="text" placeholder="Buscar..." value="${esc(window._audQ||'')}" oninput="window._audQ=this.value;window._op.renderAuditoria()"></div>
      ${tabBtn('sesiones','🔑 Sesiones',(DB.auditLog||[]).filter(e=>e.entity==='sesion').length)}
      ${tabBtn('acciones','📋 Acciones',(DB.auditLog||[]).filter(e=>e.entity!=='sesion').length)}
      ${tabBtn('exportaciones','📥 Exportaciones',(DB.exportLog||[]).length)}
      ${isSA()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportAuditLog()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    </div>
    ${subContent}`;
}

// ─── PAPELERA ─────────────────────────────────────────────────────────
function renderPapelera() {
  const el = document.getElementById('tabContent'); if (!el) return;
  let items = [...DB.papelera];
  const q = (iF.qPap||'').toLowerCase();
  if (q) items = items.filter(p => JSON.stringify(p.item||{}).toLowerCase().includes(q));
  const sorted = sortBy(items, 'ts', 'desc');

    let h = `
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${esc(iF.qPap||'')}" oninput="window._iF.qPap=this.value;window._op.renderPapelera()" style="font-size:12px"></div>
    ${iF.qPap?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qPap='';window._op.renderPapelera()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${filtPap.length} elem.</span>
    <span style="flex:1"></span>
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarPapelera()">🗑 Vaciar papelera</button>':''}
  </div>
  if (!sorted.length) { h += '<div class="empty"><div class="ei">🗑</div><div class="et">Papelera vacía</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Origen</th><th>Matrícula</th><th>Empresa</th><th>Borrado por</th><th>Fecha</th><th></th></tr></thead><tbody>';
    sorted.forEach(p => {
      const item = p.item || {};
      h += `<tr>
        <td><span class="pill pill-a">${esc(p.origen||'–')}</span></td>
        <td><span class="mchip-sm">${esc(item.matricula||'–')}</span></td>
        <td style="font-size:11px">${esc(item.empresa||'–')}</td>
        <td style="font-size:11px;color:var(--text3)">${esc(p.borradoPor||'–')}</td>
        <td style="font-size:11px;white-space:nowrap">${fmt(p.ts)}</td>
        <td><button class="btn btn-s btn-xs" onclick="window._op.restaurar('${p.id}')">↩ Restaurar</button></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── IMPRESIÓN ────────────────────────────────────────────────────────
function renderImpresion() {
  const el = document.getElementById('tabContent'); if (!el) return;
  el.innerHTML = '<div id="impresionContainer" style="height:100%;display:flex;flex-direction:column"></div>';
  import('./impresion.js').then(m => m.initImpresion('impresionContainer')).catch(e => {
    el.innerHTML = '<div class="empty"><div class="ei">🖨</div><div class="et">Error cargando módulo de impresión</div><div class="es">' + e.message + '</div></div>';
  });
}

// ─── RECINTOS ────────────────────────────────────────────────────────
function renderRecintos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = DB.recintos;

  let h = `<div class="sec-hdr">
    <span class="sec-ttl">🏟 Recintos (${items.length})</span>
    <div class="sec-act">
      ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openRecintoModal(null)">+ Nuevo recinto</button>':''}
    </div>
  </div>`;

  if (!items.length) { h += '<div class="empty"><div class="ei">🏟</div><div class="et">Sin recintos configurados</div></div>'; }
  else {
    h += '<div class="sg sg3">';
    items.forEach(r => {
      h += `<div class="card" style="position:relative">
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">${esc(r.nombre)}</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:6px">${esc(r.ciudad||'')} ${esc(r.pais||'')}</div>
        ${r.puertas?.length ? `<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${r.puertas.map(p=>`<span style="background:var(--bg3);padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">🚪 ${esc(p.nombre)}</span>`).join('')}</div>` : ''}
        ${isSA()?`<div style="display:flex;gap:4px;margin-top:6px"><button class="btn btn-edit btn-xs" onclick="window._op.openRecintoModal('${r.id}')">✏️ Editar</button><button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${r.id}','recintos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button></div>`:''}
      </div>`;
    });
    h += '</div>';
  }
  el.innerHTML = h;
}

// ─── EVENTOS ──────────────────────────────────────────────────────────
function renderEventosTab() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = DB.eventos;
  const actId = DB.activeEventId;

  let h = `<div class="sec-hdr">
    <span class="sec-ttl">📅 Eventos (${items.length})</span>
    <div class="sec-act">
      ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openEventoModal(null)">+ Nuevo evento</button>':''}
    </div>
  </div>`;

  if (!items.length) { h += '<div class="empty"><div class="ei">📅</div><div class="et">Sin eventos configurados</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Evento</th><th>Fechas</th><th>Recinto</th><th>Estado</th><th></th></tr></thead><tbody>';
    items.forEach(ev => {
      const isAct = ev.id === actId;
      h += `<tr style="${isAct?'background:var(--gll)':''}">
        <td><span style="font-weight:700">${ev.ico||'📋'} ${esc(ev.nombre)}</span></td>
        <td style="font-size:11px">${esc(ev.ini||'–')} → ${esc(ev.fin||'–')}</td>
        <td style="font-size:11px">${esc(ev.recinto||'–')} ${ev.ciudad?'· '+esc(ev.ciudad):''}</td>
        <td>${isAct?'<span class="pill pill-g"><span class="live"></span> ACTIVO</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">Inactivo</span>'}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          <button class="btn btn-xs" onclick="window._op.seleccionarEventoTrabajo('${ev.id}')" style="${DB.userWorkEventId===ev.id?'background:#2563eb;color:#fff;border-color:#2563eb':''}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${DB.userWorkEventId===ev.id?'En uso':'Trabajar'}</button>
          ${!isAct&&(isSA()||hasPerm('canActivate'))?`<button class="btn btn-s btn-xs" onclick="window._op.activarEvento('${ev.id}')">▶ Activar</button>`:''}
          ${isAct&&(isSA()||hasPerm('canActivate'))?`<button class="btn btn-warning btn-xs" onclick="window._op.desactivarEvento()">⏹ Desactivar</button>`:''}
          ${(isSA()||hasPerm('canEditEvento'))?`<button class="btn btn-edit btn-xs" onclick="window._op.openEventoModal('${ev.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${ev.id}','eventos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── MENSAJES ────────────────────────────────────────────────────────
function renderMensajes() {
  const el = document.getElementById('tabContent'); if (!el) return;
  // Delegate to mensajes module
  import('./mensajes.js').then(m => m.initMensajes('tabContent', DB, SID, canEdit, isSA)).catch(() => {
    _renderMensajesInline(el);
  });
}

function _renderMensajesInline(el) {
  const msgs = DB.mensajesRampa.slice().sort((a,b) => (b.ts||'').localeCompare(a.ts||''));
  let h = `<div class="sec-hdr">
    <span class="sec-ttl">📢 Mensajes de Rampa (${msgs.length})</span>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-p btn-sm" onclick="window._op.openMsgModal()">+ Nuevo mensaje</button>':''}
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'mensajesRampa\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    </div>
  </div>`;

  if (!msgs.length) { h += '<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>'; }
  else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    msgs.forEach(m => {
      const unread = !(m.leido||[]).includes(SID);
      const typeColors = { urgente:'var(--rll)',alerta:'var(--all)',info:'var(--bll)',ok:'var(--gll)' };
      h += `<div style="padding:10px 14px;border-radius:var(--r2);border:1.5px solid var(--border);background:${typeColors[m.tipo]||'var(--bg2)'};${unread?'border-left:4px solid var(--blue)':''}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-weight:800;font-size:13px">${esc(m.titulo||'Sin título')}</span>
          ${m.tipo?`<span class="pill pill-${m.tipo==='urgente'?'r':m.tipo==='alerta'?'a':'b'}">${esc(m.tipo)}</span>`:''}
          ${m.matricula?`<span class="mchip-sm" style="font-size:10px">${esc(m.matricula)}</span>`:''}
          <span style="margin-left:auto;font-size:10px;color:var(--text3)">${fmt(m.ts)}</span>
          ${canEdit()?`<button class="btn btn-xs btn-gh" onclick="window._op.marcarMsgLeido('${m.id}')">✓ Leído</button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${m.id}','mensajesRampa')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div>
        <div style="font-size:12px;color:var(--text2)">${esc(m.mensaje||'')}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px">Por: ${esc(m.autor||'–')}</div>
      </div>`;
    });
    h += '</div>';
  }
  el.innerHTML = h;
}

// ─── USUARIOS ────────────────────────────────────────────────────────
function renderUsuarios() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const usub = window._uSub || 'operadores';
  const q = (window._uQ || '').toLowerCase();
  const allU = DB.usuarios || [];
  const empresasU = allU.filter(u => u.rol === 'empresa');
  const operadoresU = allU.filter(u => u.rol !== 'empresa');
  let listBase = usub === 'empresas' ? empresasU : operadoresU;
  if (q) listBase = listBase.filter(u => `${u.nombre||''} ${u.username||''} ${u.email||''}`.toLowerCase().includes(q));
  const rolMap = { superadmin:'⭐ SA', supervisor:'🔑 Sup', controlador_rampa:'🚦 Ctrl', editor:'✏️ Ed', visor:'👁 Visor', empresa:'🏢 Empresa' };

  let h = `<div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:10px">
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${usub==='operadores'?'#3b82f6':'var(--bg2)'};color:${usub==='operadores'?'#fff':'var(--text3)'};border-right:1px solid var(--border)" onclick="window._uSub='operadores';window._op.renderUsuarios()">👤 Operadores (${operadoresU.length})</div>
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${usub==='empresas'?'#00896b':'var(--bg2)'};color:${usub==='empresas'?'#fff':'var(--text3)'}" onclick="window._uSub='empresas';window._op.renderUsuarios()">🏢 Empresas (${empresasU.length})</div>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
    <div class="sbox" style="flex:0 1 260px;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar nombre, email..." value="${esc(q)}" oninput="window._uQ=this.value;window._op.renderUsuarios()" style="font-size:12px"></div>
    <span style="font-size:11px;color:var(--text3)">${listBase.length} usuarios</span>
    ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openUserModal(null)">+ Nuevo usuario</button>':''}
    ${isSA()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateUsuarios()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'usuarios\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
  </div>`;

  if (!listBase.length) { h += '<div class="empty"><div class="ei">👥</div><div class="et">Sin usuarios</div></div>'; }
  else if (usub === 'empresas') {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Email</th><th>Idioma</th><th></th></tr></thead><tbody>';
    listBase.forEach(u => {
      h += `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td style="font-size:11px;color:var(--text3)">${esc(u.email||'–')}</td><td style="font-size:13px">${u.lang||'🌍'}</td><td><div style="display:flex;gap:2px">${isSA()||AppState.get('currentUser')?.id===u.id?`<button class="btn btn-edit btn-xs" onclick="window._op.openUserModal('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}${isSA()&&AppState.get('currentUser')?.id!==u.id?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminarUsuario('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}</div></td></tr>`;
    });
    h += '</tbody></table></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Rol</th><th>Idioma</th><th>Pestañas</th><th></th></tr></thead><tbody>';
    const TN = { dash:'📊',ingresos:'🔖',ingresos2:'🚛',flota:'📦',conductores:'👤',agenda:'📅',analytics:'📈',vehiculos:'📜',auditoria:'📂',papelera:'🗑',impresion:'🖨',recintos:'🏟',eventos:'📅',mensajes:'📢',usuarios:'👥' };
    listBase.forEach(u => {
      const tabs = (u.tabs || DEFAULT_TABS[u.rol] || []).map(t => TN[t]||t).join(' ');
      h += `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td><span class="pill pill-b" style="font-size:10px">${rolMap[u.rol]||esc(u.rol)}</span></td><td style="font-size:13px">${u.lang||'🌍'}</td><td style="font-size:11px">${tabs}</td><td><div style="display:flex;gap:2px">${isSA()||AppState.get('currentUser')?.id===u.id?`<button class="btn btn-edit btn-xs" onclick="window._op.openUserModal('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}${isSA()&&AppState.get('currentUser')?.id!==u.id?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminarUsuario('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}</div></td></tr>`;
    });
    h += '</tbody></table></div>';
  }


  el.innerHTML = h;
}

// ─── CRUD OPERATIONS ──────────────────────────────────────────────────
const _user = () => AppState.get('currentUser');

async function _logEdit(action, mat, pos, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _user()?.nombre||'?', action, mat: normPlate(mat), pos, detail: detail||'' };
  DB.editHistory.unshift(entry);
  if (DB.editHistory.length > 500) DB.editHistory = DB.editHistory.slice(0, 500);
  await _saveOne('editHistory', entry);
}

async function _logPasswordChange(userId, userName, email) {
  const entry = { id: uid(), ts: nowLocal(), type: 'password_change', entity: 'sesion', userId, userName, email, action: 'cambio_contrasena' };
  if (!DB.auditLog) DB.auditLog = [];
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry).catch(e=>{});
  const pwChanges = DB.auditLog.filter(a => a.type === 'password_change');
  if (pwChanges.length > 500) {
    const XLSX = window.XLSX;
    if (XLSX) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pwChanges), 'CambiosContrasena');
      XLSX.writeFile(wb, 'cambios_pass_' + new Date().toISOString().slice(0,10) + '.xlsx');
      toast('Auto-export: +500 cambios de contraseña', 'var(--amber)');
    }
  }
}

async function _logAudit(action, entity, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _user()?.nombre||'?', action, entity, detail: detail||'' };
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry);
}

// Generic CRUD helpers
function _getCol(col) { return DB[col] || []; }

function _nextPos(col) {
  const items = _getCol(col);
  if (!items.length) return '1';
  const maxPos = Math.max(...items.map(i => parseInt(i.pos)||0), 0);
  return String(maxPos + 1);
}

async function saveIngreso(data, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso para editar', 'var(--red)'); return; }
  const isNew = !data.id;
  if (isNew) { data.id = uid(); data.pos = _nextPos(col); data.entrada = data.entrada || nowLocal(); data.creadoPor = _user()?.nombre||'?'; }
  data.eventoId = data.eventoId || DB.activeEventId;
  data.eventoNombre = data.eventoNombre || getActiveEvent()?.nombre || '';
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === data.id);
  if (idx >= 0) arr[idx] = data; else arr.push(data);
  await _saveOne(col, data);
  await _logEdit(isNew ? 'new' : 'edit', data.matricula, data.pos);
  AppState.set('lastIngreso', data);
  toast(isNew ? '✅ Entrada registrada' : '✅ Actualizado', 'var(--green)');
  goTab(curTab);
}

async function registrarSalida(id, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso', 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  item.salida = nowLocal();
  await _saveOne(col, item);
  await _logEdit('salida', item.matricula, item.pos);
  toast('↩ Salida registrada', 'var(--blue)');
  goTab(curTab);
}

async function reactivar(id, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso', 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  delete item.salida;
  await _saveOne(col, item);
  await _logEdit('reactivar', item.matricula, item.pos);
  toast('↺ Reactivado', 'var(--blue)');
  goTab(curTab);
}

async function eliminar(id, col) {
  if (!isSA()) { toast('Solo SuperAdmin', 'var(--red)'); return; }
  if (!confirm('¿Eliminar? El elemento irá a la papelera.')) return;
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === id); if (idx < 0) return;
  const item = arr[idx];
  const trash = { id: uid(), origen: col, item: clone(item), borradoPor: _user()?.nombre||'?', ts: nowLocal() };
  DB.papelera.push(trash);
  await _saveOne('papelera', trash);
  arr.splice(idx, 1);
  await _deleteOne(col, id);
  await _logEdit('delete', item.matricula||item.nombre||id, item.pos||'');
  toast('🗑 Eliminado', 'var(--red)');
  goTab(curTab);
}

async function restaurar(trashId) {
  const idx = DB.papelera.findIndex(x => x.id === trashId); if (idx < 0) return;
  const t = DB.papelera[idx];
  const item = t.item;
  const col = t.origen;
  if (!_getCol(col).find(x => x.id === item.id)) {
    _getCol(col).push(item);
    await _saveOne(col, item);
  }
  DB.papelera.splice(idx, 1);
  await _deleteOne('papelera', trashId);
  toast('↩ Restaurado', 'var(--green)');
  renderPapelera();
}

async function vaciarPapelera() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm(`¿Vaciar papelera (${DB.papelera.length} elementos)?`)) return;
  const ops = DB.papelera.map(p => ({ type:'delete', path:`papelera/${p.id}` }));
  if (ops.length) await fsBatch(ops);
  DB.papelera = [];
  toast('💥 Papelera vaciada', 'var(--red)');
  renderPapelera();
}

async function vaciarHistorial() {
  if (!isSA()) return;
  if (!confirm('¿Vaciar historial de modificaciones?')) return;
  DB.editHistory = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) await fsBatch((await fsGetAll(`events/${ev.id}/editHistory`)).map(e => ({ type:'delete', path:`events/${ev.id}/editHistory/${e.id}` })));
  toast('💥 Historial vaciado', 'var(--red)');
  renderVehiculos();
}

async function vaciarTab(col) {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  const names = { ingresos:'Referencias', ingresos2:'Ingresos', movimientos:'Embalaje', agenda:'Agenda', conductores:'Conductores' };
  if (!confirm(`¿Vaciar ${names[col]||col}? Backup antes.`)) return;
  DB[col] = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('limpiar_tab', col, 'Vaciado por ' + (_user()?.nombre||'?'));
  toast(`💥 ${names[col]||col} vaciado`, 'var(--amber)');
  goTab(curTab);
}

async function setFlotaStatus(id, status) {
  const item = DB.movimientos.find(x => x.id === id); if (!item) return;
  item.status = status;
  await _saveOne('movimientos', item);
}

async function setAgendaEstado(id, estado) {
  const item = DB.agenda.find(x => x.id === id); if (!item) return;
  item.estado = estado;
  await _saveOne('agenda', item);
  renderAgenda();
}


function seleccionarEventoTrabajo(id) {
  DB.userWorkEventId = id;
  const ev = DB.eventos.find(e => e.id === id);
  // Save per-user work event in their Firestore doc
  const cu = AppState.get('currentUser');
  if (cu) {
    cu.workEventId = id;
    AppState.set('currentUser', cu);
    fsSet('users/' + cu.id, { ...cu, workEventId: id }, false).catch(e=>{});
  }
  // Use this event for new entries
  DB.activeEventId = id;
  AppState.set('currentEvent', ev || null);
  toast('✅ Trabajando en: ' + (ev?.nombre || id), 'var(--green)');
  renderEventosTab(); renderHdr();
}

async function activarEvento(id) {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para activar eventos','var(--red)'); return; }
  DB.activeEventId = id;
  const ev = DB.eventos.find(e => e.id === id) || null;
  AppState.set('currentEvent', ev);
  await fsSet('config/activeEvent', { id }, false);
  await _logAudit('activar_evento', 'eventos', id);
  toast('▶ Evento activado', 'var(--green)');
  renderEventosTab(); renderHdr();
}

async function desactivarEvento() {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para desactivar eventos','var(--red)'); return; }
  DB.activeEventId = null;
  AppState.set('currentEvent', null);
  await fsSet('config/activeEvent', { id: null }, false);
  toast('⏹ Evento desactivado', 'var(--amber)');
  renderEventosTab(); renderHdr();
}

async function marcarMsgLeido(id) {
  const msg = DB.mensajesRampa.find(x => x.id === id); if (!msg) return;
  if (!msg.leido) msg.leido = [];
  if (!msg.leido.includes(SID)) msg.leido.push(SID);
  await _saveOne('mensajesRampa', msg);
  renderHdr(); _renderMensajesInline(document.getElementById('tabContent'));
}

async function resetAllData() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm('⚠️ BORRAR TODOS LOS DATOS del evento activo.\nEsta acción NO se puede deshacer.\nHaz un backup Excel primero.')) return;
  const ev = AppState.get('currentEvent');
  if (!ev?.id) { toast('Sin evento activo', 'var(--amber)'); return; }
  for (const col of ['ingresos','ingresos2','movimientos','conductores','agenda','mensajes','editHistory']) {
    DB[col] = [];
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('reset_total', 'all', ev.nombre);
  toast('💥 Datos del evento eliminados', 'var(--red)');
  goTab('dash');
}

// ─── EXPORT EXCEL ─────────────────────────────────────────────────────
async function exportExcel(col) {
  if (!canExport()) { toast('Sin permiso para exportar', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => exportExcel(col); document.head.appendChild(s); return;
  }
  const data = DB[col] || [];
  if (!data.length) { toast('Sin datos para exportar', 'var(--amber)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), col);
  const fn = `${col}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  DB.exportLog = DB.exportLog || [];
  const entry = { id:uid(), ts:nowLocal(), user:_user()?.nombre||'?', rol:_user()?.rol||'?', tab:col, filename:fn };
  DB.exportLog.unshift(entry);
  await _saveOne('exportLog', entry);
  toast(`📥 Exportado: ${fn}`, 'var(--blue)');
}

async function exportAuditLog() {
  if (!isSA()) return;
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>exportAuditLog();document.head.appendChild(s);return; }
  const wb = XLSX.utils.book_new();
  const sess = (DB.auditLog||[]).filter(e=>e.entity==='sesion');
  const acts = (DB.auditLog||[]).filter(e=>e.entity!=='sesion');
  if (sess.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sess), 'Sesiones');
  if (acts.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(acts), 'Acciones');
  if ((DB.exportLog||[]).length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(DB.exportLog), 'Exportaciones');
  const fn = `auditoria_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast('✅ Audit log exportado', 'var(--green)');
}

async function importExcel(inp, col) {
  if (!canImport()) { toast('Sin permiso', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>importExcel(inp,col);document.head.appendChild(s);return; }
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:'' });
      let added = 0;
      for (const row of rows) {
        const mat = normPlate(row.Matricula || row.matricula || '');
        if (!mat) continue;
        const item = { ...row, id: uid(), matricula: mat, pos: _nextPos(col), creadoPor:'Import', entrada: row.entrada||nowLocal() };
        _getCol(col).push(item);
        await _saveOne(col, item);
        added++;
      }
      toast(`✅ ${added} importados`, 'var(--green)');
      goTab(curTab);
    } catch(err) { toast('❌ ' + err.message, 'var(--red)'); }
    inp.value = '';
  };
  r.readAsBinaryString(f);
}

// ─── SIMPLE MODALS (inline forms) ─────────────────────────────────────
function _modal(title, bodyHtml, onSave) {
  const id = 'dynModal';
  const existing = document.getElementById(id); if (existing) existing.remove();
  const bg = document.createElement('div');
  bg.id = id; bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal-box">
    <div class="modal-hdr"><div class="modal-ttl">${title}</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="document.getElementById('${id}').remove()">✕</button></div>
    ${bodyHtml}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-gh btn-sm" onclick="document.getElementById('${id}').remove()">Cancelar</button>
      <button class="btn btn-p btn-sm" id="dynModalSave">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(bg);
  document.getElementById('dynModalSave').onclick = () => { onSave(); document.getElementById(id)?.remove(); };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  setTimeout(() => bg.querySelector('input,select,textarea')?.focus(), 100);
}

function gv(id) { return (document.getElementById(id)?.value || '').trim(); }

function openIngModal(id, col = 'ingresos') {
  const existing = id ? _getCol(col).find(x => x.id === id) : null;
  const i = existing || {};
  const langOpts = [
    ['es','Español'],['ca','Català'],['eu','Euskara'],['gl','Galego'],
    ['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],
    ['pt','Português'],['pl','Polski'],['ro','Română'],['nl','Nederlands'],
    ['hu','Magyar'],['cs','Čeština'],['hr','Hrvatski'],['uk','Українська'],
    ['ru','Русский'],['tr','Türkçe'],['ar','عربية'],['sv','Svenska'],
    ['fi','Suomi'],['el','Ελληνικά'],['bg','Български'],['sk','Slovenčina'],['sl','Slovenščina'],
  ].map(([v,l])=>`<option value="${v}" ${(i.lang||'es')===v?'selected':''}>${l}</option>`).join('');
  const tvOpts = [['','— Tipo —'],['trailer','🚛 Trailer'],['semiremolque','🚚 Semiremolque'],['camion','🚗 Camión'],['furgoneta','🚐 Furgoneta'],['otro','📦 Otro']]
    .map(([v,l])=>`<option value="${v}" ${(i.tipoVehiculo||'')===v?'selected':''}>${l}</option>`).join('');
  const dcOpts = [['','— Descarga —'],['mano','🤲 Manual'],['maquinaria','🏗 Maquinaria'],['mixto','Mixto']]
    .map(([v,l])=>`<option value="${v}" ${(i.descargaTipo||'')===v?'selected':''}>${l}</option>`).join('');
  _modal(existing ? 'Editar ingreso' : 'Nueva entrada', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="mMat" value="${esc(i.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
      <div class="fg"><label class="flbl">Remolque</label><input id="mRem" value="${esc(i.remolque||'')}" placeholder="TR5678X"></div>
      <div class="fg"><label class="flbl">Nombre</label><input id="mNom" value="${esc(i.nombre||'')}" placeholder="Juan"></div>
      <div class="fg"><label class="flbl">Apellido</label><input id="mApe" value="${esc(i.apellido||'')}" placeholder="García"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="mEmp" value="${esc(i.empresa||'')}" placeholder="Empresa SL"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="mHall" value="${esc(i.hall||'')}" placeholder="5A"></div>
      <div class="fg"><label class="flbl">Stand</label><input id="mStand" value="${esc(i.stand||'')}" placeholder="A-101"></div>
      <div class="fg"><label class="flbl">Puerta Hall</label><input id="mPuerta" value="${esc(i.puertaHall||'')}" placeholder="P3"></div>
      <div class="fg"><label class="flbl">Llamador</label><input id="mRef" value="${esc(i.llamador||i.referencia||'')}" placeholder="12345"></div>
      <div class="fg"><label class="flbl">Referencia/Booking</label><input id="mBooking" value="${esc(i.ref||i.referencia||'')}" placeholder="REF-001"></div>
      <div class="fg"><label class="flbl">Montador</label><input id="mMont" value="${esc(i.montador||'')}" placeholder="Montaje SL"></div>
      <div class="fg"><label class="flbl">Expositor</label><input id="mExpo" value="${esc(i.expositor||'')}" placeholder="Expo SL"></div>
      <div class="fg"><label class="flbl">Teléfono</label><input id="mTel" value="${esc(i.telefono||'')}" placeholder="+34 600000000"></div>
      <div class="fg"><label class="flbl">Email</label><input id="mEmail" type="email" value="${esc(i.email||'')}"></div>
      <div class="fg"><label class="flbl">Pasaporte/DNI</label><input id="mPas" value="${esc(i.pasaporte||'')}"></div>
      <div class="fg"><label class="flbl">F. Nacimiento</label><input id="mFnac" type="date" value="${esc(i.fechaNacimiento||'')}"></div>
      <div class="fg"><label class="flbl">País</label><input id="mPais" value="${esc(i.pais||'')}"></div>
      <div class="fg"><label class="flbl">Tipo Vehículo</label><select id="mTipoV">${tvOpts}</select></div>
      <div class="fg"><label class="flbl">Descarga</label><select id="mDesc">${dcOpts}</select></div>
      <div class="fg"><label class="flbl">Hora Ingreso</label><input id="mHorario" value="${esc(i.horario||'')}" placeholder="09:45"></div>
      <div class="fg"><label class="flbl">Idioma conductor</label><select id="mLang">${langOpts}</select></div>
    </div>
    <div class="fg" style="margin-top:4px"><label class="flbl">Comentario</label><textarea id="mComent" rows="2">${esc(i.comentario||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('mMat'));
    if (!mat) { toast('Matrícula obligatoria', 'var(--red)'); return; }
    const data = {
      id: i.id || uid(),
      matricula: mat, remolque: gv('mRem'), nombre: gv('mNom'), apellido: gv('mApe'),
      empresa: gv('mEmp'), hall: gv('mHall'), halls: [gv('mHall')].filter(Boolean),
      stand: gv('mStand'), puertaHall: gv('mPuerta'),
      llamador: gv('mRef'), referencia: gv('mBooking'), ref: gv('mBooking'),
      montador: gv('mMont'), expositor: gv('mExpo'),
      telefono: gv('mTel'), email: gv('mEmail'),
      pasaporte: gv('mPas'), fechaNacimiento: gv('mFnac'), pais: gv('mPais'),
      tipoVehiculo: gv('mTipoV'), descargaTipo: gv('mDesc'),
      horario: gv('mHorario'), lang: gv('mLang') || 'es',
      comentario: gv('mComent'),
      entrada: i.entrada || nowLocal(), pos: i.pos || _nextPos(col),
      eventoId: DB.activeEventId, eventoNombre: getActiveEvent()?.nombre||'',
      creadoPor: _user()?.nombre || '?',
    };
    // Check lista negra before saving
    const _bl = checkBL(mat);
    if (_bl) {
      if (_bl.nivel === 'bloqueo') {
        if (!confirm(`🚫 MATRÍCULA BLOQUEADA\n${mat}\nMotivo: ${_bl.motivo}\n\n¿Continuar de todas formas?`)) return;
      } else {
        toast(`⭐ ${mat} en lista especial: ${_bl.motivo}`, 'var(--amber)');
      }
    }
    await saveIngreso(data, col);
  });
}

function openFlotaModal(id) {
  const existing = id ? DB.movimientos.find(x => x.id === id) : null;
  const i = existing || {};
  _modal(existing ? 'Editar vehículo embalaje' : 'Añadir vehículo', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="fMat" value="${esc(i.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">Posición</label><input id="fPos" value="${esc(i.posicion||'')}"></div>
      <div class="fg"><label class="flbl">Remolque</label><input id="fRem" value="${esc(i.remolque||'')}"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="fEmp" value="${esc(i.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="fHall" value="${esc(i.hall||'')}"></div>
      <div class="fg"><label class="flbl">Tipo Carga</label><input id="fCarga" value="${esc(i.tipoCarga||'')}"></div>
      <div class="fg"><label class="flbl">Estado</label><select id="fStatus">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<option value="${s}" ${i.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
  `, async () => {
    const mat = normPlate(gv('fMat')); if (!mat) { toast('Matrícula obligatoria','var(--red)');return; }
    const data = { id:i.id||uid(), matricula:mat, posicion:gv('fPos'), remolque:gv('fRem'), empresa:gv('fEmp'), hall:gv('fHall'), tipoCarga:gv('fCarga'), status:gv('fStatus') };
    if (!DB.movimientos.find(x=>x.id===data.id)) DB.movimientos.push(data); else { const idx=DB.movimientos.findIndex(x=>x.id===data.id); if(idx>=0)DB.movimientos[idx]=data; }
    await _saveOne('movimientos', data);
    toast('✅ Guardado','var(--green)');
    renderFlota();
  });
}

function openCondModal(id) {
  const existing = id ? DB.conductores.find(x => x.id === id) : null;
  const c = existing || {};
  _modal(existing ? 'Editar conductor' : 'Nuevo conductor', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Nombre <span class="freq">*</span></label><input id="cNom" value="${esc(c.nombre||'')}"></div>
      <div class="fg"><label class="flbl">Apellido</label><input id="cApe" value="${esc(c.apellido||'')}"></div>
      <div class="fg"><label class="flbl">Matrícula habitual</label><input id="cMat" value="${esc(c.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="cEmp" value="${esc(c.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Teléfono</label><input id="cTel" value="${esc(c.telefono||'')}"></div>
      <div class="fg"><label class="flbl">Pasaporte/DNI</label><input id="cPass" value="${esc(c.pasaporte||'')}"></div>
      <div class="fg"><label class="flbl">País</label><input id="cPais" value="${esc(c.pais||'')}"></div>
    </div>
  `, async () => {
    const nom = gv('cNom'); if (!nom) { toast('Nombre obligatorio','var(--red)');return; }
    const data = { id:c.id||uid(), nombre:nom, apellido:gv('cApe'), matricula:normPlate(gv('cMat')), empresa:gv('cEmp'), telefono:gv('cTel'), pasaporte:gv('cPass'), pais:gv('cPais') };
    if (!DB.conductores.find(x=>x.id===data.id)) DB.conductores.push(data); else { const idx=DB.conductores.findIndex(x=>x.id===data.id); if(idx>=0)DB.conductores[idx]=data; }
    await _saveOne('conductores', data);
    toast('✅ Guardado','var(--green)');
    renderConductores();
  });
}

function openAgendaModal(id) {
  const existing = id ? DB.agenda.find(x => x.id === id) : null;
  const a = existing || {};
  const today = new Date().toISOString().slice(0, 10);
  _modal(existing ? 'Editar cita' : 'Nueva cita agenda', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="aMat" value="${esc(a.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">Fecha</label><input id="aFecha" type="date" value="${a.fecha||today}"></div>
      <div class="fg"><label class="flbl">Hora plan</label><input id="aHora" type="time" value="${a.hora||''}"></div>
      <div class="fg"><label class="flbl">Empresa / Conductor</label><input id="aEmp" value="${esc(a.empresa||a.conductor||'')}"></div>
      <div class="fg"><label class="flbl">Referencia</label><input id="aRef" value="${esc(a.referencia||'')}"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="aHall" value="${esc(a.hall||'')}"></div>
      <div class="fg"><label class="flbl">Estado</label><select id="aEst"><option>PENDIENTE</option><option>HECHO</option><option>CANCELADO</option></select></div>
    </div>
    <div class="fg"><label class="flbl">Notas</label><textarea id="aNotas" rows="2">${esc(a.notas||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('aMat')); if (!mat) { toast('Matrícula obligatoria','var(--red)');return; }
    const data = { id:a.id||uid(), matricula:mat, fecha:gv('aFecha'), hora:gv('aHora'), empresa:gv('aEmp'), conductor:gv('aEmp'), referencia:gv('aRef'), hall:gv('aHall'), estado:gv('aEst'), notas:gv('aNotas'), eventoId:DB.activeEventId };
    if (!DB.agenda.find(x=>x.id===data.id)) DB.agenda.push(data); else { const idx=DB.agenda.findIndex(x=>x.id===data.id); if(idx>=0)DB.agenda[idx]=data; }
    await _saveOne('agenda', data);
    toast('✅ Guardado','var(--green)');
    renderAgenda();
  });
  if (existing) { setTimeout(()=>{ document.getElementById('aEst').value = a.estado||'PENDIENTE'; }, 50); }
}

function openEventoModal(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  const existing = id ? DB.eventos.find(x => x.id === id) : null;
  const ev = existing || {};
  _modal(existing ? 'Editar evento' : 'Nuevo evento', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Nombre <span class="freq">*</span></label><input id="evNom" value="${esc(ev.nombre||'')}"></div>
      <div class="fg"><label class="flbl">Icono (emoji)</label><input id="evIco" value="${esc(ev.ico||'📋')}" placeholder="📋"></div>
      <div class="fg"><label class="flbl">Fecha inicio</label><input id="evIni" type="date" value="${ev.ini||''}"></div>
      <div class="fg"><label class="flbl">Fecha fin</label><input id="evFin" type="date" value="${ev.fin||''}"></div>
      <div class="fg"><label class="flbl">Recinto</label><input id="evRec" value="${esc(ev.recinto||'')}"></div>
      <div class="fg"><label class="flbl">Ciudad</label><input id="evCiu" value="${esc(ev.ciudad||'')}"></div>
    </div>
  `, async () => {
    const nom = gv('evNom'); if (!nom) { toast('Nombre obligatorio','var(--red)');return; }
    const data = { id:ev.id||uid(), nombre:nom, ico:gv('evIco')||'📋', ini:gv('evIni'), fin:gv('evFin'), recinto:gv('evRec'), ciudad:gv('evCiu') };
    if (!DB.eventos.find(x=>x.id===data.id)) DB.eventos.push(data); else { const idx=DB.eventos.findIndex(x=>x.id===data.id); if(idx>=0)DB.eventos[idx]=data; }
    await fsSet(`events/${data.id}`, data, true);
    toast('✅ Evento guardado','var(--green)');
    renderEventosTab();
  });
}

function openRecintoModal(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  const existing = id ? DB.recintos.find(x => x.id === id) : null;
  const r = existing || {};
  _modal(existing ? 'Editar recinto' : 'Nuevo recinto', `
    <div class="fg"><label class="flbl">Nombre <span class="freq">*</span></label><input id="rNom" value="${esc(r.nombre||'')}"></div>
    <div class="fg"><label class="flbl">Ciudad</label><input id="rCiu" value="${esc(r.ciudad||'')}"></div>
    <div class="fg"><label class="flbl">País</label><input id="rPais" value="${esc(r.pais||'')}"></div>
    <div class="fg"><label class="flbl">Dirección</label><input id="rDir" value="${esc(r.direccion||'')}"></div>
    <div class="fg"><label class="flbl">Puertas (separadas por coma)</label><input id="rPuertas" value="${esc((r.puertas||[]).map(p=>p.nombre).join(','))}" placeholder="Puerta 1, Puerta 2"></div>
  `, async () => {
    const nom = gv('rNom'); if (!nom) { toast('Nombre obligatorio','var(--red)');return; }
    const puertas = gv('rPuertas').split(',').map(s=>s.trim()).filter(Boolean).map(s=>({id:uid(),nombre:s}));
    const data = { id:r.id||uid(), nombre:nom, ciudad:gv('rCiu'), pais:gv('rPais'), direccion:gv('rDir'), puertas };
    if (!DB.recintos.find(x=>x.id===data.id)) DB.recintos.push(data); else { const idx=DB.recintos.findIndex(x=>x.id===data.id); if(idx>=0)DB.recintos[idx]=data; }
    await fsSet(`recintos/${data.id}`, data, false);
    toast('✅ Recinto guardado','var(--green)');
    renderRecintos();
  });
}

function openUserModal(id) {
  if (!isSA() && AppState.get('currentUser')?.id !== id) { toast('Sin permiso','var(--red)'); return; }
  const existing = id ? DB.usuarios.find(x => x.id === id) : null;
  const u = existing || {};
  const rol = u.rol || 'supervisor';
  const defTabs = DEFAULT_TABS[rol] || DEFAULT_TABS.visor || [];
  const userTabs = u.tabs || defTabs;

  const PERMS = [
    ['canAdd',         '➕ Añadir registros',       'Crear nuevos ingresos / referencias'],
    ['canEdit',        '✏️ Editar registros',         'Modificar datos existentes'],
    ['canDel',         '🗑 Eliminar registros',       'Borrar ingresos (van a papelera)'],
    ['canStatus',      '↩ Marcar estado',             'Registrar entrada / salida'],
    ['canPrint',       '🖨 Imprimir pase',            'Imprimir y troquelado'],
    ['canImport',      '📥 Importar Excel',           'Importar registros masivos'],
    ['canExport',      '⬇ Exportar Excel',           'Descargar listas'],
    ['canClean',       '🗑 Limpiar tab',             'Borrar registros del día'],
    ['canSpecial',     '⭐ Lista especial',           'Gestionar blacklist'],
    ['canSaveTpl',     '💾 Guardar plantilla',        'Crear/modificar plantillas impresión'],
    ['canDelTpl',      '🔄 Eliminar plantilla',       'Borrar plantillas y resetear canvas'],
    ['canMensajes',    '📢 Mensajes rampa',           'Enviar mensajes al panel'],
    ['canCampos',      '⚙ Configurar campos',        'Mostrar/ocultar campos por evento'],
    ['canActivate',    '▶ Activar evento',           'Activar/desactivar evento global'],
  ];

  const isFull = rol === 'superadmin' || rol === 'supervisor';
  const permsHtml = PERMS.map(([pk, label, desc]) => {
    const checked = isFull || !!(u.permisos?.[pk]);
    const dis = isFull ? 'opacity:.5;pointer-events:none' : '';
    return `<tr style="border-bottom:0.5px solid var(--border)">
      <td style="padding:5px 7px;font-weight:600;font-size:11px">${label}</td>
      <td style="padding:5px 7px;color:var(--text3);font-size:10px">${desc}</td>
      <td style="padding:5px 7px;text-align:center">
        <label class="tgl ${checked?'on':''}" id="tgl_${pk}" style="${dis}">
          <input type="checkbox" id="fp_${pk}" ${checked?'checked':''} ${isFull?'disabled':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
          <span style="padding:2px 8px">${checked?'ON':'—'}</span>
        </label>
      </td></tr>`;
  }).join('');

  const tabsHtml = TAB_DEFS.map(t => {
    const on = userTabs.includes(t.id);
    return `<label class="tgl ${on?'on':''}" id="tgl_tab_${t.id}">
      <input type="checkbox" id="ft_${t.id}" ${on?'checked':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
      <span>${t.ico} ${t.label}</span>
    </label>`;
  }).join('');

  _modal(existing ? 'Editar usuario' : 'Nuevo usuario', `
    <div class="sg sg2">
      <div class="fg" style="grid-column:1/-1"><label class="flbl">Nombre completo <span class="freq">*</span></label><input id="uNom" value="${esc(u.nombre||'')}"></div>
      <div class="fg"><label class="flbl">Nombre usuario <span class="freq">*</span></label><input id="uUsername" value="${esc(u.username||'')}"></div>
      <div class="fg"><label class="flbl">Email (2FA)</label><input id="uEmail" type="email" value="${esc(u.email||'')}"></div>
      ${!existing?`
      <div class="fg"><label class="flbl">Contraseña</label>
        <div style="position:relative;display:flex;align-items:center">
          <input id="uPass" type="password" placeholder="mín. 8 caracteres" style="padding-right:36px;width:100%">
          <button type="button" onclick="(function(){var i=document.getElementById('uPass');i.type=i.type==='password'?'text':'password';})()" style="position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text3);display:flex">${EYE_SVG}</button>
        </div>
      </div>
      <div class="fg"><label class="flbl">PIN (mín. 6 dígitos)</label>
        <div style="position:relative;display:flex;align-items:center">
          <input id="uPin" type="password" maxlength="8" inputmode="numeric" placeholder="------" style="padding-right:36px;width:100%">
          <button type="button" onclick="(function(){var i=document.getElementById('uPin');i.type=i.type==='password'?'text':'password';})()" style="position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text3);display:flex">${EYE_SVG}</button>
        </div>
      </div>`:''}
      <div class="fg"><label class="flbl">Idioma</label>
        <select id="uLang">${['es','ca','eu','gl','en','fr','de','it','pt','pl','ro','nl','hu','cs','hr','uk','ru','tr','ar','sv','fi','el','bg','sk','sl'].map(l=>`<option value="${l}" ${(u.lang||'es')===l?'selected':''}>${l.toUpperCase()}</option>`).join('')}</select>
      </div>
      <div class="fg"><label class="flbl">Rol <span class="freq">*</span></label>
        <select id="uRol" onchange="window._op.onRolChange(this.value)">
          ${isSA()?`<option value="superadmin" ${rol==='superadmin'?'selected':''}>⭐ SuperAdmin</option>`:''}
          ${['supervisor','controlador_rampa','editor','visor','empresa'].map(r=>`<option value="${r}" ${rol===r?'selected':''}>${{supervisor:'🔑 Supervisor',controlador_rampa:'🚦 Controlador Rampa',editor:'✏️ Editor',visor:'👁 Visor',empresa:'🏢 Empresa'}[r]}</option>`).join('')}
        </select>
      </div>
      <div class="fg" style="grid-column:1/-1;display:flex;align-items:center;gap:10px">
        <label class="tgl ${u.twoFA?'on':''}" id="tgl2FA">
          <input type="checkbox" id="fu2FA" ${u.twoFA?'checked':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
          <span>✉️ Verificación 2FA por email</span>
        </label>
        <span style="font-size:10px;color:var(--text3)">Requiere email configurado</span>
      </div>
    </div>
    <div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:10px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Permisos</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:var(--bg2)">
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Acción</th>
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Descripción</th>
        <th style="padding:4px 7px;text-align:center;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Activo</th>
      </tr></thead><tbody>${permsHtml}</tbody></table>
    </div>
    <div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:10px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Pestañas habilitadas</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px" id="tabToggleGrid">${tabsHtml}</div>
    </div>
  `, async () => {
    const nom = gv('uNom'); if (!nom) { toast('Nombre obligatorio','var(--red)'); return; }
    const rol2 = gv('uRol');
    const tabs = [...document.querySelectorAll('#tabToggleGrid input:checked')].map(x => x.id.replace('ft_',''));
    const pin  = gv('uPin');
    const pass = gv('uPass');
    const email = gv('uEmail');
    const twoFA = document.getElementById('fu2FA')?.checked || false;
    const permisos = {};
    PERMS.forEach(([pk]) => { permisos[pk] = document.getElementById('fp_'+pk)?.checked || false; });

    const btn = document.querySelector('#dynModal .btn-p');
    if (btn) { btn.disabled=true; btn.textContent='Guardando…'; }

    try {
      let userId = u.id || uid();
      if (!existing && email && pass && pass.length >= 8) {
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
          const { getBEUAuth } = await import('../firestore.js');
          const cred = await createUserWithEmailAndPassword(getBEUAuth(), email, pass);
          await updateProfile(cred.user, { displayName: nom });
          userId = cred.user.uid;
        } catch(e) {
          if (e.code !== 'auth/email-already-in-use') {
            toast('❌ Error Firebase: ' + e.message, 'var(--red)');
            if (btn) { btn.disabled=false; btn.textContent='Guardar'; }
            return;
          }
        }
      }
      const data = { id:userId, nombre:nom, username:gv('uUsername'), email, rol:rol2, lang:gv('uLang'), tabs, twoFA, permisos };
      if (pin && pin.length >= 4) {
        const { hashPin: hp, uid: _uid } = await import('../utils.js');
        const salt = _uid();
        data.pinHash = await hp(pin, salt);
        data.pinSalt = salt;
      }
      const idx2 = DB.usuarios.findIndex(x=>x.id===data.id);
      if (idx2>=0) DB.usuarios[idx2]=data; else DB.usuarios.push(data);
      await fsSet('users/'+data.id, data, false);
      toast('✅ Usuario guardado','var(--green)');
      renderUsuarios();
    } catch(e) {
      toast('❌ ' + e.message, 'var(--red)');
      if (btn) { btn.disabled=false; btn.textContent='Guardar'; }
    }
  });
}
function eliminarUsuario(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  if (!confirm('¿Eliminar usuario?')) return;
  DB.usuarios = DB.usuarios.filter(u => u.id !== id);
  fsDel(`users/${id}`);
  toast('🗑 Eliminado','var(--red)');
  renderUsuarios();
}

function openMsgModal() {
  _modal('Nuevo mensaje de rampa', `
    <div class="fg"><label class="flbl">Título <span class="freq">*</span></label><input id="msgTtl" placeholder="Mensaje urgente..."></div>
    <div class="fg"><label class="flbl">Tipo</label><select id="msgTipo"><option value="info">ℹ️ Info</option><option value="alerta">⚠️ Alerta</option><option value="urgente">🚨 Urgente</option><option value="ok">✅ OK</option></select></div>
    <div class="fg"><label class="flbl">Matrícula (opcional)</label><input id="msgMat" placeholder="AB1234CD" style="text-transform:uppercase"></div>
    <div class="fg"><label class="flbl">Mensaje</label><textarea id="msgBody" rows="3"></textarea></div>
  `, async () => {
    const ttl = gv('msgTtl'); if (!ttl) { toast('Título obligatorio','var(--red)');return; }
    const msg = { id:uid(), ts:nowLocal(), autor:_user()?.nombre||'?', tipo:gv('msgTipo'), titulo:ttl, matricula:normPlate(gv('msgMat')), mensaje:gv('msgBody'), leido:[SID], pausado:false };
    DB.mensajesRampa.unshift(msg);
    await _saveOne('mensajesRampa', msg);
    renderHdr();
    _renderMensajesInline(document.getElementById('tabContent'));
    toast('📢 Mensaje enviado','var(--blue)');
  });
}

function showDetalle(id, col = 'ingresos') {
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  const fields = [
    ['Matrícula', item.matricula], ['Posición', item.pos], ['Remolque', item.remolque],
    ['Nombre', (item.nombre||'') + ' ' + (item.apellido||'')], ['Empresa', item.empresa],
    ['Montador', item.montador], ['Expositor', item.expositor], ['Hall', item.hall],
    ['Stand', item.stand], ['Referencia', item.referencia||item.llamador], ['Teléfono', item.telefono],
    ['Pasaporte', item.pasaporte], ['Email', item.email], ['País', item.pais],
    ['Tipo Vehículo', item.tipoVehiculo], ['Descarga', item.descargaTipo],
    ['Tipo Carga', item.tipoCarga], ['Comentario', item.comentario],
    ['Hora entrada', fmt(item.entrada)], ['Hora salida', item.salida ? fmt(item.salida) : '—'],
    ['Creado por', item.creadoPor], ['Evento', item.eventoNombre],
  ].filter(([,v]) => v && String(v).trim());

  const body = `<div class="sg sg2" style="gap:6px">
    ${fields.map(([l,v]) => `<div style="padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">${l}</div><div style="font-weight:600">${esc(String(v))}</div></div>`).join('')}
  </div>
  <div style="display:flex;gap:4px;margin-top:12px;flex-wrap:wrap">
    ${canEdit()&&!item.salida?`<button class="btn btn-warning btn-sm" onclick="window._op.registrarSalida('${id}','${col}');document.getElementById('dynModal')?.remove()">↩ Registrar Salida</button>`:''}
    ${canEdit()?`<button class="btn btn-edit btn-sm" onclick="document.getElementById('dynModal')?.remove();window._op.openIngModal('${id}','${col}')">✏️ Editar</button>`:''}
    ${isSA()?`<button class="btn btn-danger btn-sm" onclick="document.getElementById('dynModal')?.remove();window._op.eliminar('${id}','${col}')">🗑 Eliminar</button>`:''}
  </div>`;

  const div = document.createElement('div');
  div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box"><div class="modal-hdr"><div class="modal-ttl"><span class="mchip" style="font-size:14px;margin-right:8px">${esc(item.matricula)}</span>${esc(item.empresa||'–')}</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>${body}</div>`;
  document.getElementById('dynModal')?.remove();
  document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

// ─── THEME ────────────────────────────────────────────────────────────
function _applyTheme() {
  const theme = AppState.get('theme') || localStorage.getItem('beu_theme') || 'default';
  document.documentElement.setAttribute('data-theme', theme);
}

function openLangPicker() {
  const langs = ['es','en','fr','de','it','pt','ar','pl','ro','nl','hu','cs','ca','eu','gl','uk','ru','tr','sv','fi','el','bg','sk','sl'];
  const cur = AppState.get('currentLang') || 'es';
  const body = `<div style="display:flex;flex-wrap:wrap;gap:6px">${langs.map(l=>`<button class="btn btn-sm ${l===cur?'btn-p':'btn-gh'}" onclick="window._op.setLang('${l}');document.getElementById('dynModal')?.remove()">${l.toUpperCase()}</button>`).join('')}</div>`;
  const div = document.createElement('div'); div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box"><div class="modal-hdr"><div class="modal-ttl">🌐 Idioma</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>${body}</div>`;
  document.getElementById('dynModal')?.remove(); document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

async function setLang(lang) {
  AppState.set('currentLang', lang);
  try { localStorage.setItem('beu_lang', lang); } catch(e) {}
  const user = AppState.get('currentUser');
  if (user) { user.lang = lang; await fsUpdate(`users/${user.id}`, { lang }); }
  toast(`🌐 Idioma: ${lang.toUpperCase()}`, 'var(--green)');
}

async function tabDragStart(e) {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.tab);
  e.currentTarget.classList.add('tab-dragging');
}
function tabDragOver(e) {
  e.preventDefault();
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('tab-drag-over'));
  e.currentTarget.classList.add('tab-drag-over');
}
function tabDrop(e) {
  e.preventDefault();
  const from = e.dataTransfer.getData('text/plain');
  const to   = e.currentTarget.dataset.tab;
  if (from === to) return;
  const bar  = document.getElementById('mainTabs');
  const btns = [...bar.querySelectorAll('.btn-tab')];
  const fromEl = btns.find(b => b.dataset.tab === from);
  const toEl   = btns.find(b => b.dataset.tab === to);
  if (fromEl && toEl) bar.insertBefore(fromEl, toEl);
  // Save order
  const newOrder = [...bar.querySelectorAll('.btn-tab')].map(b => b.dataset.tab);
  try { localStorage.setItem('beu_tabOrder', JSON.stringify(newOrder)); } catch(e){}
}
function tabDragEnd(e) {
  document.querySelectorAll('.btn-tab').forEach(b => { b.classList.remove('tab-dragging'); b.classList.remove('tab-drag-over'); });
}

function printTroquelado(id) {
  AppState.set('lastIngreso', id);
  window._op.goTab('impresion');
}

function registrarTracking(id, col) {
  const i = _getCol(col).find(x => x.id === id);
  if (!i) return;
  const ts = nowLocal();
  if (!i.tracking) i.tracking = [];
  i.tracking.push({ ts, user: _user()?.nombre || '?', lat: null });
  _saveOne(col, i).catch(e=>{});
  toast('📍 Tracking registrado', 'var(--blue)');
}

function toggleAutoFill() {
  _autoFillOn = !_autoFillOn;
  try { localStorage.setItem('beu_af', _autoFillOn?'1':'0'); } catch(e){}
  renderIngresos();
  toast((_autoFillOn ? '⚡ Autorrelleno ON' : 'Autorrelleno OFF'), 'var(--blue)');
}

function togglePosAuto() {
  _posAutoOn = !_posAutoOn;
  try { localStorage.setItem('beu_pa', _posAutoOn?'1':'0'); } catch(e){}
  renderIngresos();
  toast((_posAutoOn ? '🔢 Posición AUTO ON' : 'Posición manual'), 'var(--blue)');
}

function cycleTheme() {
  const themes = ['default','dark','soft','contrast'];
  const cur = localStorage.getItem('beu_theme') || 'default';
  const next = themes[(themes.indexOf(cur)+1) % themes.length];
  localStorage.setItem('beu_theme', next);
  document.documentElement.setAttribute('data-theme', next);
  AppState.set('theme', next);
}

function handleLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  _unsubs.forEach(u => { try { u(); } catch(e) {} });
  logout();
}

// ─── KEYBOARD ────────────────────────────────────────────────────────
function _bindGlobalKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { document.getElementById('dynModal')?.remove(); }
    if ((e.ctrlKey||e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const inp = document.querySelector('#mainContent input[type="text"]');
      if (inp) inp.focus();
    }
  });
}

// ─── CAMPOS SUBTAB ───────────────────────────────────────────────────
function _renderCamposSubtab(el, col) {
  const tabLabel = {ingresos:'Referencia',ingresos2:'Ingresos',agenda:'Agenda',conductores:'Conductores'}[col] || col;
  const ALL_CAMPOS = {
    ingresos:   ['posicion','llamador','ref','empresa','hall','stand','puertaHall','acceso','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','fechaExpiracion','pais','telefono','email','comentario','horario'],
    ingresos2:  ['posicion','llamador','ref','empresa','hall','stand','puertaHall','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','pais','telefono','email','comentario'],
    agenda:     ['matricula','fecha','hora','remolque','conductor','empresa','referencia','montador','expositor','hall','stand','tipoCarga','telefono','notas','estado'],
    conductores:['nombre','apellido','empresa','matricula','remolque','hall','telefono','email','tipoVehiculo','pasaporte','pais','fechaNacimiento','idioma','notas'],
  };
  const LABELS = {posicion:'Nº Posición',llamador:'Llamador',ref:'Referencia',empresa:'Empresa',hall:'Hall',stand:'Stand',puertaHall:'Puerta Hall',acceso:'Acceso',montador:'Montador',expositor:'Expositor',remolque:'Remolque',tipoVehiculo:'Tipo Vehículo',descargaTipo:'Descarga',nombre:'Nombre',apellido:'Apellido',pasaporte:'Pasaporte/DNI',fechaNacimiento:'F. Nacimiento',fechaExpiracion:'F. Expiración',pais:'País',telefono:'Teléfono',email:'Email',comentario:'Comentario',horario:'Hora',fecha:'Fecha',hora:'Hora planif.',conductor:'Conductor',referencia:'Referencia',tipoCarga:'Tipo Carga',notas:'Notas',estado:'Estado',matricula:'Matrícula',idioma:'Idioma'};
  if (!DB.camposCfg) DB.camposCfg = {};
  if (!DB.camposCfg[col]) DB.camposCfg[col] = {};
  const cfg = DB.camposCfg[col];
  const campos = ALL_CAMPOS[col] || [];
  const cycleState = {off:'show', show:'required', required:'off'};
  const stateLabel = {off:'✕ Oculto', show:'✓ Visible', required:'★ Oblig.'};
  const stateColor = {off:'var(--border2);background:var(--bg3);color:var(--text3)', show:'var(--blue);background:var(--blue);color:#fff', required:'var(--red);background:var(--red);color:#fff'};

  let h = `<div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:nowrap;overflow-x:auto">
    <button class="btn btn-gh btn-sm" onclick="window._condSub='';window._op.renderConductores()">← Volver</button>
    <span style="flex:1;font-size:11px;color:var(--text3)">Campos visibles — ${tabLabel}</span>
    ${canCampos()?'<button class="btn btn-p btn-sm" onclick="window._op.saveCamposCfg(''+col+'')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar</button>':''}
    <button class="btn btn-gh btn-sm" onclick="window._op.resetCamposCfg('${col}')">↺ Resetear</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">`;

  campos.forEach(k => {
    const state = cfg[k] || 'show';
    const sc = stateColor[state];
    h += `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border-radius:16px;border:1.5px solid ${sc};font-size:11px;font-weight:700;cursor:pointer" onclick="window._op.cycleCampo('${col}','${k}')">${stateLabel[state]} ${LABELS[k]||k}</span>`;
  });

  h += `</div>
  <div style="border-top:1px solid var(--border);padding-top:10px">
    <div style="font-size:11px;font-weight:500;margin-bottom:6px">Añadir campo personalizado</div>
    <div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap">
      <div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:140px">
        <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">Nombre</span>
        <input id="newCampoNom" placeholder="Ej: Zona, Acceso especial..." style="border:1px solid var(--border2);border-radius:6px;padding:5px 8px;font-size:12px;background:var(--bg2);width:100%">
      </div>
      <div style="display:flex;flex-direction:column;gap:3px">
        <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">Tipo</span>
        <select id="newCampoTipo" style="border:1px solid var(--border2);border-radius:6px;padding:5px 8px;font-size:12px;background:var(--bg2)">
          <option value="text">Texto libre</option>
          <option value="number">Número</option>
          <option value="bool">Sí / No</option>
          <option value="date">Fecha</option>
        </select>
      </div>
      <button class="btn btn-p btn-sm" onclick="window._op.addCustomCampo('${col}')">+ Crear campo</button>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-top:4px;font-style:italic">Al crear un campo, la plantilla Excel se regenera automáticamente con la nueva columna.</div>
  </div>`;

  el.innerHTML = h;
}

function cycleCampo(col, key) {
  if (!DB.camposCfg) DB.camposCfg = {};
  if (!DB.camposCfg[col]) DB.camposCfg[col] = {};
  const cur = DB.camposCfg[col][key] || 'show';
  const next = {off:'show', show:'required', required:'off'}[cur];
  DB.camposCfg[col][key] = next;
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

function saveCamposCfg(col) {
  if (!DB.camposCfg) return;
  _saveOne('camposCfg', DB.camposCfg[col] || {}).catch(e=>{});
  toast('✅ Configuración guardada', 'var(--green)');
}

function resetCamposCfg(col) {
  if (!confirm('¿Resetear todos los campos a Visible?')) return;
  DB.camposCfg[col] = {};
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

function addCustomCampo(col) {
  const nom = document.getElementById('newCampoNom')?.value?.trim();
  if (!nom) { toast('Nombre obligatorio', 'var(--red)'); return; }
  const tipo = document.getElementById('newCampoTipo')?.value || 'text';
  if (!DB.customCampos) DB.customCampos = {};
  if (!DB.customCampos[col]) DB.customCampos[col] = [];
  const key = 'custom_' + nom.toLowerCase().replace(/\s+/g, '_');
  if (DB.customCampos[col].find(c => c.key === key)) { toast('Ya existe', 'var(--amber)'); return; }
  DB.customCampos[col].push({ key, label: nom, tipo });
  toast('✅ Campo creado — plantilla Excel actualizada', 'var(--green)');
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

// ─── LISTA NEGRA (Especial) ──────────────────────────────────────────
function _renderListaNegra(el) {
  const items = DB.listaNegra || [];
  let h = `<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='lista';window._op.renderIngresos()">📋 Lista</button>
    <button class="btn btn-sm btn-p">⭐ Especial (${items.length})</button>
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='espera';window._op.renderIngresos()">⏳ En espera (${(DB.enEspera||[]).filter(e=>e.estado==='pendiente').length})</button>
  </div>
  <div class="sec-hdr">
    <div class="sec-ttl">⭐ Especial / Lista negra</div>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-r btn-sm" onclick="window._op.openLNModal(null)">+ Añadir matrícula</button>':''}
      <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('listaNegra')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
    </div>
  </div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--red)"><div class="stat-n" style="color:var(--red)">${items.filter(i=>i.nivel==='bloqueo').length}</div><div class="stat-l">🚫 Bloqueadas</div></div>
    <div class="stat-box" style="border-top:3px solid var(--amber)"><div class="stat-n" style="color:var(--amber)">${items.filter(i=>i.nivel==='alerta').length}</div><div class="stat-l">⚠️ Alertas</div></div>
    <div class="stat-box"><div class="stat-n">${items.length}</div><div class="stat-l">Total</div></div>
  </div>`;
  if (!items.length) {
    h += '<div class="empty"><div class="ei">⭐</div><div class="et">Sin matrículas en especial</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Nivel</th><th>Motivo</th><th>Empresa</th><th>Válido hasta</th><th>Usuario</th><th></th></tr></thead><tbody>';
    items.forEach(ln => {
      const color = ln.nivel==='bloqueo' ? 'var(--red)' : 'var(--amber)';
      h += `<tr>
        <td><span class="mchip">${esc(ln.matricula)}</span></td>
        <td><span style="font-weight:800;color:${color}">${ln.nivel==='bloqueo'?'🚫 BLOQUEO':'⚠️ ALERTA'}</span></td>
        <td style="font-size:11px">${esc(ln.motivo||'–')}</td>
        <td style="font-size:11px">${esc(ln.empresa||'–')}</td>
        <td style="font-size:11px">${esc(ln.hasta||'–')}</td>
        <td style="font-size:10px;color:var(--text3)">${esc(ln.usuario||'–')}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openLNModal('${ln.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${ln.id}','listaNegra')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

function _renderEnEspera(el) {
  const items = (DB.enEspera || []).filter(e => e.estado === 'pendiente')
    .sort((a,b) => { const p={urgente:0,alta:1,normal:2}; return (p[a.prioridad]||2)-(p[b.prioridad]||2); });
  let h = `<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='lista';window._op.renderIngresos()">📋 Lista</button>
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='listanegra';window._op.renderIngresos()">⭐ Especial (${(DB.listaNegra||[]).length})</button>
    <button class="btn btn-sm btn-p">⏳ En espera (${items.length})</button>
  </div>
  <div class="sec-hdr">
    <div class="sec-ttl">⏳ En espera</div>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-p btn-sm" onclick="window._op.openEEModal(null)">+ En espera</button>':''}
    </div>
  </div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--blue)"><div class="stat-n" style="color:var(--blue)">${items.length}</div><div class="stat-l">⏳ Pendientes</div></div>
    <div class="stat-box" style="border-top:3px solid var(--green)"><div class="stat-n" style="color:var(--green)">${(DB.enEspera||[]).filter(e=>e.estado==='llegado').length}</div><div class="stat-l">✅ Llegados</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--text3)">${(DB.enEspera||[]).filter(e=>e.estado==='cancelado').length}</div><div class="stat-l">❌ Cancelados</div></div>
  </div>`;
  if (!items.length) {
    h += '<div class="empty"><div class="ei">⏳</div><div class="et">Lista de espera vacía</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Prioridad</th><th>Conductor</th><th>Empresa</th><th>Hall</th><th>Booking</th><th>Hora</th><th></th></tr></thead><tbody>';
    items.forEach(e => {
      const prioColor = e.prioridad==='urgente'?'var(--red)':e.prioridad==='alta'?'var(--amber)':'var(--text3)';
      h += `<tr>
        <td><span class="mchip">${esc(e.matricula)}</span></td>
        <td><span style="font-size:11px;font-weight:800;color:${prioColor}">${e.prioridad==='urgente'?'🔴':e.prioridad==='alta'?'🔶':'●'} ${e.prioridad||'normal'}</span></td>
        <td style="font-size:11px">${esc(e.conductor||'–')}</td>
        <td style="font-size:11px">${esc(e.empresa||'–')}</td>
        <td><span class="h-badge">${esc(e.hall||'–')}</span></td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(e.booking||'–')}</td>
        <td style="font-size:11px">${esc(e.hora||'–')}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-s btn-xs" title="Llegó" onclick="window._op.marcarEELlegado('${e.id}')">✅</button>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openEEModal('${e.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${e.id}','enEspera')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

function checkBL(mat) {
  return (DB.listaNegra||[]).find(x => x.matricula===mat.toUpperCase() && (!x.hasta||x.hasta>=new Date().toISOString().slice(0,10))) || null;
}
function checkEE(mat) {
  return (DB.enEspera||[]).find(e => e.matricula===mat.toUpperCase() && e.estado==='pendiente') || null;
}

function openLNModal(id) {
  const existing = id ? (DB.listaNegra||[]).find(x=>x.id===id) : null;
  const ln = existing || {};
  _modal(existing ? 'Editar especial' : 'Nueva matrícula especial', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="lnMat" value="${esc(ln.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
      <div class="fg"><label class="flbl">Nivel</label>
        <select id="lnNivel">
          <option value="alerta" ${ln.nivel==='alerta'?'selected':''}>⚠️ Alerta</option>
          <option value="bloqueo" ${ln.nivel==='bloqueo'?'selected':''}>🚫 Bloqueo</option>
          <option value="vip" ${ln.nivel==='vip'?'selected':''}>⭐ VIP</option>
          <option value="prioritario" ${ln.nivel==='prioritario'?'selected':''}>🔶 Prioritario</option>
        </select>
      </div>
      <div class="fg" style="grid-column:1/-1"><label class="flbl">Motivo <span class="freq">*</span></label><input id="lnMotivo" value="${esc(ln.motivo||'')}" placeholder="Motivo del marcado"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="lnEmp" value="${esc(ln.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Válido hasta</label><input id="lnHasta" type="date" value="${esc(ln.hasta||'')}"></div>
    </div>
  `, async () => {
    const mat = normPlate(gv('lnMat')); const motivo = gv('lnMotivo');
    if (!mat || !motivo) { toast('Matrícula y motivo obligatorios','var(--red)'); return; }
    const data = { id:ln.id||uid(), matricula:mat, nivel:gv('lnNivel'), motivo, empresa:gv('lnEmp'), hasta:gv('lnHasta')||null, ts:nowLocal(), usuario:_user()?.nombre||'' };
    if (!DB.listaNegra) DB.listaNegra = [];
    const idx = DB.listaNegra.findIndex(x=>x.id===data.id);
    if (idx>=0) DB.listaNegra[idx]=data; else DB.listaNegra.push(data);
    await _saveOne('listaNegra', data);
    toast('✅ Guardado','var(--green)');
    _renderListaNegra(document.getElementById('tabContent'));
  });
}

function openEEModal(id) {
  const existing = id ? (DB.enEspera||[]).find(x=>x.id===id) : null;
  const e = existing || {};
  _modal(existing ? 'Editar en espera' : 'Nueva en espera', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="eeMat" value="${esc(e.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
      <div class="fg"><label class="flbl">Prioridad</label>
        <select id="eePrio">
          <option value="normal" ${(e.prioridad||'normal')==='normal'?'selected':''}>● Normal</option>
          <option value="alta" ${e.prioridad==='alta'?'selected':''}>🔶 Alta</option>
          <option value="urgente" ${e.prioridad==='urgente'?'selected':''}>🔴 Urgente</option>
        </select>
      </div>
      <div class="fg"><label class="flbl">Conductor</label><input id="eeCond" value="${esc(e.conductor||'')}"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="eeEmp" value="${esc(e.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Teléfono</label><input id="eeTel" value="${esc(e.telefono||'')}"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="eeHall" value="${esc(e.hall||'')}"></div>
      <div class="fg"><label class="flbl">Booking/Referencia</label><input id="eeRef" value="${esc(e.booking||'')}"></div>
      <div class="fg"><label class="flbl">Hora estimada</label><input id="eeHora" type="time" value="${esc(e.hora||'')}"></div>
    </div>
    <div class="fg"><label class="flbl">Notas</label><textarea id="eeNotas" rows="2">${esc(e.notas||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('eeMat'));
    if (!mat) { toast('Matrícula obligatoria','var(--red)'); return; }
    const data = { id:e.id||uid(), matricula:mat, prioridad:gv('eePrio'), conductor:gv('eeCond'), empresa:gv('eeEmp'), telefono:gv('eeTel'), hall:gv('eeHall'), booking:gv('eeRef'), hora:gv('eeHora'), notas:gv('eeNotas'), estado:'pendiente', ts:nowLocal(), creadoPor:_user()?.nombre||'' };
    if (!DB.enEspera) DB.enEspera = [];
    const idx = DB.enEspera.findIndex(x=>x.id===data.id);
    if (idx>=0) DB.enEspera[idx]=data; else DB.enEspera.push(data);
    await _saveOne('enEspera', data);
    toast('⏳ En espera añadido','var(--blue)');
    renderHdr();
    _renderEnEspera(document.getElementById('tabContent'));
  });
}

function marcarEELlegado(id) {
  const e = (DB.enEspera||[]).find(x=>x.id===id); if (!e) return;
  e.estado = 'llegado';
  _saveOne('enEspera', e).catch(e=>{});
  // Pre-fill nueva entrada modal
  openIngModal(null, 'ingresos');
  setTimeout(() => {
    const set = (id, v) => { const el=document.getElementById(id); if(el&&v) el.value=v; };
    set('mMat', e.matricula); set('mNom', e.conductor); set('mEmp', e.empresa);
    set('mHall', e.hall); set('mBooking', e.booking); set('mTel', e.telefono);
  }, 100);
  toast('✅ Marcado como llegado','var(--green)');
  window._ingSub = 'lista';
}


// ─── EXCEL TEMPLATES ──────────────────────────────────────────────────
function _xlsxWrite(data, sheetName, filename) {
  const XLSX = window.XLSX;
  if (!XLSX) { toast('XLSX no disponible','var(--red)'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  toast('📋 Plantilla descargada', 'var(--blue)');
}

function dlTemplateIngresos() {
  _xlsxWrite([
    ['Matricula','Llamador','Referencia','Nombre','Apellido','Empresa','Montador','Expositor','Hall','Stand','PuertaHall','Remolque','TipoVehiculo','Descarga','Pasaporte','Telefono','Email','Pais','FechaNacimiento','Comentario','Idioma','Pos'],
    ['Matrícula (oblig.)','Llamador','Ref.','Nombre','Apellido','Empresa','Montador','Expositor','Hall','Stand','Puerta Hall','Remolque','camion/semiremolque/furgoneta','mano/maquinaria','Pasaporte/DNI','Teléfono','Email','País','YYYY-MM-DD','Comentario','es/en/fr...','Pos.'],
    ['1234ABC','12345','REF-001','Juan','García','ACME SL','','','H1','A101','P3','','semiremolque','mano','','600123456','','España','1985-01-01','','es','']
  ], 'Referencia', 'plantilla_referencia.xlsx');
}

function dlTemplateIngresos2() {
  _xlsxWrite([
    ['Matricula','Nombre','Apellido','Empresa','Hall','Stand','PuertaHall','Remolque','TipoVehiculo','Descarga','Telefono','Email','Comentario','Idioma','Pos'],
    ['Matrícula (oblig.)','Nombre','Apellido','Empresa','Hall','Stand','Puerta Hall','Remolque','camion/semiremolque','mano/maquinaria','Teléfono','Email','Comentario','es/en/fr...','Pos.'],
    ['1234ABC','Juan','García','ACME SL','H1','A101','P3','','','','600123456','','','es','']
  ], 'Ingresos', 'plantilla_ingresos.xlsx');
}

function dlTemplateAgenda() {
  _xlsxWrite([
    ['Matricula','Fecha','HoraPlan','Remolque','Conductor','Empresa','Referencia','Montador','Expositor','Hall','Stand','TipoCarga','Telefono','Notas','Evento'],
    ['Matrícula (oblig.)','YYYY-MM-DD','HH:MM','Remolque','Conductor','Empresa','Ref.','Montador','Expositor','Hall','Stand','GOODS/EF/...','Teléfono','Notas','Evento'],
    ['1234ABC','2026-04-01','09:00','REM001','Juan García','ACME SL','REF123','','','H1','A101','GOODS','600123456','','ALIMENTARIA 2026']
  ], 'Agenda', 'plantilla_agenda.xlsx');
}

function dlTemplateFlota() {
  _xlsxWrite([
    ['Matricula','Remolque','Nombre','Apellido','Empresa','Hall','TipoCarga','Status','Posicion'],
    ['Matrícula (oblig.)','Remolque','Nombre','Apellido','Empresa','Hall','GOODS/EF/SUNDAY/PRIORITY/EMPTY','ALMACEN/SOT/FIRA/FINAL','Nº'],
    ['1234ABC','REM001','Juan','García','ACME SL','H1','GOODS','ALMACEN','1']
  ], 'Embalaje', 'plantilla_embalaje.xlsx');
}

function dlTemplateConductores() {
  _xlsxWrite([
    ['Nombre','Apellido','Empresa','Matricula','Remolque','Hall','TelPais','Telefono','Email','TipoVehiculo','Pasaporte','Pais','FechaNacimiento','Idioma','Notas'],
    ['Nombre (oblig.)','Apellido','Empresa','Matrícula habitual','Remolque habitual','Hall habitual','+34',  'Teléfono','Email','camion/semiremolque/furgoneta','Pasaporte/DNI','País','YYYY-MM-DD','es/en/fr...','Notas'],
    ['Juan','García','ACME SL','1234ABC','','H1','+34','600123456','juan@empresa.com','camion','12345678Z','España','1985-01-01','es','']
  ], 'Conductores', 'plantilla_conductores.xlsx');
}

function dlTemplateUsuarios() {
  _xlsxWrite([
    ['Nombre','Username','Email','Contrasena','PIN','Rol','Idioma'],
    ['Nombre completo (oblig.)','usuario (sin espacios)','email@empresa.com','Contraseña (mín. 8)','PIN mín.6 dígitos','supervisor/controlador_rampa/editor/visor','es/en/fr...'],
    ['Juan García','juangarcia','juan@empresa.com','MiPass2026!','123456','controlador_rampa','es'],
    ['Ana López','analopez','ana@empresa.com','MiPass2026!','654321','supervisor','es']
  ], 'Usuarios', 'plantilla_usuarios.xlsx');
}

function dlTemplateEmpresas() {
  _xlsxWrite([
    ['Nombre','CIF','Contacto','Telefono','Email','Idioma'],
    ['Nombre empresa (oblig.)','CIF/NIF/VAT','Persona contacto','Teléfono','Email empresa','es/en/fr...'],
    ['Montajes Pro SL','B12345678','Ana Martínez','+34 600 123 456','ana@montajes.com','es'],
    ['ExpoDemo SL','B87654321','Piotr Kowalski','+48 600 987 654','piotr@expodemo.com','pl']
  ], 'Empresas', 'plantilla_empresas.xlsx');
}

function dlTemplateVehiculos() {
  _xlsxWrite([
    ['Matricula','Conductor','Empresa','Telefono','TelPais','Remolque','TipoVehiculo','Idioma'],
    ['Matrícula (oblig.)','Nombre conductor','Empresa','Teléfono','+34','Remolque','camion/semiremolque/furgoneta/trailer','es/en/fr...'],
    ['AB1234CD','Juan García','ACME SL','600123456','+34','','semiremolque','es']
  ], 'Historial', 'plantilla_historial.xlsx');
}

// ─── EMPRESAS TAB ────────────────────────────────────────────────────
function renderEmpresasTab() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const emps = DB.empresas || [];
  const pres = DB.preregistros || [];
  const sub  = window._empSub || 'empresas';
  const q    = (window._empSearch || '').toLowerCase();

  let filtered = sub === 'empresas'
    ? emps.filter(e => !q || `${e.nombre||''} ${e.cif||''} ${e.email||''} ${e.contacto||''}`.toLowerCase().includes(q))
    : pres.filter(p => !q || `${p.matricula||''} ${p.empresaNombre||''} ${p.ref||''} ${p.eventoNombre||''}`.toLowerCase().includes(q));

  const nBadge = n => n === 'verified' ? '<span class="pill pill-g">✓ Verificada</span>'
    : n === 'blocked' ? '<span class="pill pill-r">✕ Bloqueada</span>'
    : '<span class="pill pill-b">~ Semi</span>';

  let h = `<div class="sg sg4" style="margin-bottom:10px">
    <div class="stat-box"><div class="stat-n">${emps.length}</div><div class="stat-l">Empresas</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--green)">${emps.filter(e=>e.nivel==='verified').length}</div><div class="stat-l">Verificadas</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--blue)">${emps.reduce((a,e)=>a+(e.vehiculos||[]).length,0)}</div><div class="stat-l">Vehículos</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--teal)">${pres.length}</div><div class="stat-l">Preregistros</div></div>
  </div>
  <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:10px">
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='empresas'?'#2563eb':'var(--bg2)'};color:${sub==='empresas'?'#fff':'var(--text3)'}" onclick="window._empSub='empresas';window._empSearch='';window._op.renderEmpresasTab()">🏢 Empresas (${emps.length})</div>
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='preregistros'?'#2563eb':'var(--bg2)'};color:${sub==='preregistros'?'#fff':'var(--text3)'}" onclick="window._empSub='preregistros';window._empSearch='';window._op.renderEmpresasTab()">📋 Preregistros (${pres.length})</div>
  </div>
  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
    <div class="sbox" style="flex:1;min-width:200px"><span class="sico">🔍</span><input type="text" placeholder="Buscar…" value="${esc(window._empSearch||'')}" oninput="window._empSearch=this.value;window._op.renderEmpresasTab()"></div>
    <span style="font-size:11px;color:var(--text3)">${filtered.length} registros</span>
    ${sub==='empresas'?'<button class="btn btn-p btn-sm" onclick="window._op.openEmpresaModal(null)">+ Empresa</button>':''}
    <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(sub==='empresas'?'empresas':'preregistros')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
  </div>`;

  if (sub === 'empresas') {
    if (!filtered.length) { h += '<div class="empty"><div class="ei">🏢</div><div class="et">Sin empresas registradas</div></div>'; }
    else {
      h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>CIF/VAT</th><th>Contacto</th><th>Email</th><th>Tipo</th><th>Vehículos</th><th>Prereg.</th><th>Nivel</th><th></th></tr></thead><tbody>';
      filtered.forEach(emp => {
        const nv = (emp.vehiculos||[]).length;
        const np = pres.filter(p => p.empresaId === emp.id).length;
        h += `<tr>
          <td style="font-weight:700">${esc(emp.nombre||'–')}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${esc(emp.cif||'–')}</td>
          <td style="font-size:11px">${esc(emp.contacto||'–')}</td>
          <td style="font-size:11px;color:var(--text3)">${esc(emp.email||'–')}</td>
          <td style="font-size:11px">${esc(emp.tipo||'–')}</td>
          <td style="text-align:center;font-weight:700;color:var(--blue)">${nv}</td>
          <td style="text-align:center;font-weight:700;color:var(--teal)">${np}</td>
          <td>${nBadge(emp.nivel)}</td>
          <td><div style="display:flex;gap:2px">
            ${isSA() ? `<button class="btn btn-gh btn-xs" onclick="window._op.verPortalEmpresa('${emp.id}')">👁 Portal</button>` : ''}
            ${isSA() ? `<button class="btn btn-edit btn-xs" onclick="window._op.openEmpresaModal('${emp.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>` : ''}
            ${isSA() && emp.nivel !== 'verified' ? `<button class="btn btn-s btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','verified')">✓</button>` : ''}
            ${isSA() && emp.nivel !== 'blocked'  ? `<button class="btn btn-danger btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','blocked')">✕</button>` : ''}
            ${isSA() && emp.nivel === 'blocked'  ? `<button class="btn btn-gh btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','semi')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 000-8h-1"/></svg></button>` : ''}
          </div></td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    }
  } else {
    if (!filtered.length) { h += '<div class="empty"><div class="ei">📋</div><div class="et">Sin preregistros</div></div>'; }
    else {
      h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>Evento</th><th>Matrícula</th><th>Conductor</th><th>Ref.</th><th>Hall</th><th>Stand</th><th>Fecha plan.</th><th>Estado</th></tr></thead><tbody>';
      filtered.forEach(p => {
        const stColors = { preregistrado:'var(--bll)', en_camino:'var(--all)', en_recinto:'var(--gll)' };
        h += `<tr>
          <td style="font-weight:700">${esc(p.empresaNombre||p.empresa||'–')}</td>
          <td style="font-size:11px;color:var(--text3)">${esc(p.eventoNombre||'–')}</td>
          <td><span class="mchip-sm">${esc(p.matricula||'–')}</span></td>
          <td style="font-size:11px">${esc(p.nombre||'–')}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${esc(p.ref||'–')}</td>
          <td><span class="h-badge">${esc(p.hall||'–')}</span></td>
          <td style="font-size:11px">${esc(p.stand||'–')}</td>
          <td style="font-size:11px">${esc(p.fechaPlan||'–')}</td>
          <td><span class="pill" style="background:${stColors[p.estado]||'var(--bg3)'};font-size:10px;font-weight:700">${esc(p.estado||'–')}</span></td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    }
  }
  el.innerHTML = h;
}

// ─── MIGRACIÓN ───────────────────────────────────────────────────────
function renderMigracion() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Solo SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;

  const COLECCIONES = [
    { key:'ingresos',     label:'Referencia',   col:'ingresos' },
    { key:'ingresos2',    label:'Ingresos',      col:'ingresos2' },
    { key:'conductores',  label:'Conductores',   col:'conductores' },
    { key:'agenda',       label:'Agenda',        col:'agenda' },
    { key:'movimientos',  label:'Embalaje',      col:'movimientos' },
    { key:'mensajesRampa',label:'Mensajes',      col:'mensajesRampa' },
    { key:'editHistory',  label:'Historial',     col:'editHistory' },
    { key:'usuarios',     label:'Usuarios',      col:'usuarios' },
    { key:'empresas',     label:'Empresas',      col:'empresas' },
    { key:'preregistros', label:'Preregistros',  col:'preregistros' },
  ];

  el.innerHTML = `
<div style="max-width:700px">
  <div class="sec-hdr"><span class="sec-ttl">📦 Migración de datos v6 → v7</span></div>
  
  <div style="background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r2);padding:16px;margin-bottom:16px">
    <div style="font-weight:700;margin-bottom:8px">📖 Cómo migrar datos de v6</div>
    <ol style="font-size:13px;color:var(--text2);line-height:2;margin-left:16px">
      <li>En v6: ir a cada tab → botón <b>⬇ Excel</b> → descargar</li>
      <li>En v7 (aquí): botón <b>📥 Importar</b> de cada colección</li>
      <li>O usar <b>⬇ Exportar TODO</b> / <b>📥 Importar TODO</b> para todas a la vez</li>
    </ol>
  </div>

  <!-- EXPORT / IMPORT ALL -->
  <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
    <button class="btn btn-p" onclick="window._op.exportarTodo()">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      ⬇ Exportar TODO (v7 → Excel)
    </button>
    <label class="btn" style="background:#0d9f6e;color:#fff;cursor:pointer">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      📥 Importar TODO (Excel → v7)
      <input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importarTodo(this)">
    </label>
  </div>

  <!-- PER-COLLECTION TABLE -->
  <div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text2)">Por colección:</div>
  <div style="display:flex;flex-direction:column;gap:6px">
    ${COLECCIONES.map(col => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2)">
        <div style="flex:1">
          <span style="font-weight:700">${col.label}</span>
          <span id="migCount_${col.key}" style="font-size:11px;color:var(--text3);margin-left:8px">${(DB[col.key]||[]).length} registros</span>
        </div>
        <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('${col.key}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
        <label class="btn btn-gh btn-sm" style="cursor:pointer">
          📥 Importar
          <input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,'${col.key}')">
        </label>
      </div>
    `).join('')}
  </div>

  <div style="margin-top:20px;padding:14px;background:var(--rll);border:1.5px solid #fecaca;border-radius:var(--r2);font-size:12px">
    ⚠️ La importación <b>añade</b> registros a los existentes. Para reemplazar, vacía la colección primero desde la tab correspondiente.
  </div>
</div>`;
}

async function exportarTodo() {
  if (!isSA()) return;
  if (typeof XLSX === 'undefined') {
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>exportarTodo(); document.head.appendChild(s); return;
  }
  const wb = XLSX.utils.book_new();
  const cols = ['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','editHistory','usuarios','empresas','preregistros'];
  let count = 0;
  for (const col of cols) {
    const data = DB[col] || [];
    if (data.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), col.slice(0,31));
      count++;
    }
  }
  if (!count) { toast('Sin datos para exportar', 'var(--amber)'); return; }
  const fn = `beunifyt_v7_backup_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast(`✅ Exportado: ${fn}`, 'var(--green)');
}

async function importarTodo(inp) {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') {
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>importarTodo(inp); document.head.appendChild(s); return;
  }
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary' });
      let totalImported = 0;
      const ev = AppState.get('currentEvent');
      for (const sheetName of wb.SheetNames) {
        const col = sheetName;
        if (!DB.hasOwnProperty(col) && !['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','editHistory','usuarios','empresas','preregistros'].includes(col)) continue;
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:'' });
        if (!rows.length) continue;
        if (!DB[col]) DB[col] = [];
        for (const row of rows) {
          if (!row.id) row.id = uid();
          // Add to Firestore
          const path = ['usuarios','empresas'].includes(col)
            ? `${col}/${row.id}`
            : ev?.id ? `events/${ev.id}/${col}/${row.id}` : `${col}/${row.id}`;
          await fsSet(path, row, false).catch(() => {});
          if (!DB[col].find(x=>x.id===row.id)) DB[col].push(row);
          totalImported++;
        }
      }
      toast(`✅ ${totalImported} registros importados`, 'var(--green)');
      renderMigracion();
    } catch(err) { toast('❌ ' + err.message, 'var(--red)'); }
    inp.value = '';
  };
  r.readAsBinaryString(f);
}

function onRolChange(rol) {
  const tabs = DEFAULT_TABS[rol] || DEFAULT_TABS.visor || [];
  document.querySelectorAll('.uTabChk').forEach(chk => {
    chk.checked = tabs.includes(chk.value);
  });
}

// ─── EXPOSE API ───────────────────────────────────────────────────────
window._iF = iF; // expose filter state for inline handlers
window._dashEvFilter = _dashEvFilter;
window._audSub = 'sesiones';
window._uSub = 'operadores';
window._uQ = '';
window._audQ = '';

window._op = {
  goTab,
  renderDash, renderIngresos, renderIngresos2, renderFlota, renderConductores,
  renderAgenda, renderAnalytics, renderVehiculos, renderAuditoria, renderPapelera,
  renderImpresion, renderRecintos, renderEventosTab, renderMensajes, renderUsuarios,
  openIngModal, openFlotaModal, openCondModal, openAgendaModal, openEventoModal,
  openRecintoModal, openUserModal, openMsgModal, showDetalle,
  registrarSalida, reactivar, eliminar, eliminarUsuario,
  setFlotaStatus, setAgendaEstado, activarEvento, desactivarEvento,
  restaurar, vaciarPapelera, vaciarTab, vaciarHistorial, marcarMsgLeido,
  exportExcel, exportAuditLog, importExcel,
  onRolChange,
  openEmpresaModal: (id) => {
    const e = id ? (DB.empresas||[]).find(x=>x.id===id) : null;
    const emp = e || {};
    _modal(e ? 'Editar empresa' : 'Nueva empresa', `
      <div class="sg sg2">
        <div class="fg"><label class="flbl">Nombre *</label><input id="emNom" value="${esc(emp.nombre||'')}"></div>
        <div class="fg"><label class="flbl">CIF/VAT</label><input id="emCif" value="${esc(emp.cif||'')}"></div>
        <div class="fg"><label class="flbl">Email</label><input id="emEmail" type="email" value="${esc(emp.email||'')}"></div>
        <div class="fg"><label class="flbl">Contacto</label><input id="emCont" value="${esc(emp.contacto||'')}"></div>
        <div class="fg"><label class="flbl">Teléfono</label><input id="emTel" value="${esc(emp.tel||'')}"></div>
        <div class="fg"><label class="flbl">Tipo</label>
          <select id="emTipo"><option value="expositor">Expositor</option><option value="montador">Montador</option><option value="transportista">Transportista</option><option value="otro">Otro</option></select>
        </div>
      </div>
    `, async () => {
      const nom = gv('emNom'); if (!nom) { toast('Nombre obligatorio','var(--red)'); return; }
      const data = { id: emp.id||uid(), nombre:nom, cif:gv('emCif'), email:gv('emEmail'), contacto:gv('emCont'), tel:gv('emTel'), tipo:gv('emTipo'), nivel: emp.nivel||'semi', vehiculos:emp.vehiculos||[] };
      if (!DB.empresas) DB.empresas = [];
      const idx = DB.empresas.findIndex(x=>x.id===data.id);
      if (idx>=0) DB.empresas[idx]=data; else DB.empresas.push(data);
      await fsSet('companies/' + data.id, data, false);
      toast('✅ Empresa guardada','var(--green)');
      renderEmpresasTab();
    });
    setTimeout(()=>{ const s=document.getElementById('emTipo'); if(s) s.value=emp.tipo||'expositor'; },50);
  },
  verPortalEmpresa: async (id) => {
    // SA previews portal as this empresa — sets a temp SA-preview flag
    const emp = (DB.empresas||[]).find(x=>x.id===id); if(!emp) return;
    const prev = AppState.get('currentUser');
    AppState.set('currentUser', { ...prev, rol:'empresa', empresaId:id, nombre:emp.nombre, _saPreview:true, _saUser:prev });
    const m = await import('./portal.js');
    m.initPortal();
  },
  setEmpresaNivel: async (id, nivel) => {
    const emp = (DB.empresas||[]).find(x=>x.id===id); if(!emp) return;
    emp.nivel = nivel;
    await fsSet('companies/' + id, emp, false);
    toast(nivel==='verified'?'✅ Verificada':nivel==='blocked'?'🚫 Bloqueada':'↩ Semi','var(--blue)');
    renderEmpresasTab();
  },
  resetAllData, openLangPicker, setLang, handleLogout,
  renderMigracion, exportarTodo, importarTodo,
  openLNModal, openEEModal, marcarEELlegado, cycleCampo, saveCamposCfg, resetCamposCfg, addCustomCampo,
  renderAuditoria, renderHdr,
  // Auto-exposed
  openEventoModal,
  activarEvento,
  vaciarTab,
  renderVehiculos,
  renderIngresos,
  openCondModal,
  openLangPicker,
  showDetalle,
  exportarTodo,
  desactivarEvento,
  renderIngresos2,
  renderFlota,
  setLang,
  vaciarHistorial,
  eliminar,
  openFlotaModal,
  renderPapelera,
  vaciarPapelera,
  openUserModal,
  exportAuditLog,
  openMsgModal,
  setAgendaEstado,
  reactivar,
  openAgendaModal,
  marcarMsgLeido,
  importarTodo,
  eliminarUsuario,
  importExcel,
  renderConductores,
  renderUsuarios,
  handleLogout,
  renderEmpresasTab,
};
