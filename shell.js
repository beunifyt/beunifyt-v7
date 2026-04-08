// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — core/shell.js
// Shell HTML, header, tabs, theme, keyboard, lang, tab drag/drop.
// ═══════════════════════════════════════════════════════════════════════
import { AppState } from '../state.js';
import { safeHtml } from '../utils.js';
import { isSA, logout } from '../auth.js';
import { fsUpdate } from '../firestore.js';
import { DB, iF, SID, curTab, setCurTab, _unsubs, registerFn, callFn } from './context.js';
import { esc, fmt, getActiveEvent } from './shared.js';

// ─── CACHED DOM ─────────────────────────────────────────────────────
const EL = {};
export function cacheEL() {
  ['appHdr','mainTabs','mainContent','hdrCnts','syncPill'].forEach(id => { EL[id] = document.getElementById(id); });
}

// ─── SVG ICONS ──────────────────────────────────────────────────────
const SVG = {
  dash:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  ingresos:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
  ingresos2:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>',
  flota:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
  conductores:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>',
  agenda:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>',
  analytics:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  vehiculos:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  auditoria:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  papelera:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  impresion:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  recintos:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  eventos:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  mensajes:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  usuarios:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  empresas:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  analytics2:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  analytics3:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9"/><path d="M21 3l-9 9"/><path d="M15 3h6v6"/></svg>',
  analytics4:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M12 2a4 4 0 014 4c0 1.1-.9 2-2 2h-4a2 2 0 01-2-2 4 4 0 014-4z"/><path d="M8 8v8a4 4 0 008 0V8"/><line x1="6" y1="12" x2="18" y2="12"/></svg>',
};

// ─── TAB DEFINITIONS ────────────────────────────────────────────────
export const TAB_DEFS = [
  {id:'dash',label:'Dashboard',ico:SVG.dash},
  {id:'ingresos',label:'Referencia',ico:SVG.ingresos},
  {id:'ingresos2',label:'Ingresos',ico:SVG.ingresos2},
  {id:'flota',label:'Embalaje',ico:SVG.flota},
  {id:'conductores',label:'Conductores',ico:SVG.conductores},
  {id:'agenda',label:'Agenda',ico:SVG.agenda},
  {id:'analytics',label:'Análisis',ico:SVG.analytics},
  {id:'vehiculos',label:'Historial',ico:SVG.vehiculos},
  {id:'auditoria',label:'Archivos',ico:SVG.auditoria},
  {id:'papelera',label:'Papelera',ico:SVG.papelera},
  {id:'impresion',label:'Impresión',ico:SVG.impresion},
  {id:'recintos',label:'Recintos',ico:SVG.recintos},
  {id:'eventos',label:'Eventos',ico:SVG.eventos},
  {id:'mensajes',label:'Mensajes',ico:SVG.mensajes},
  {id:'usuarios',label:'Usuarios',ico:SVG.usuarios},
  {id:'empresas',label:'Empresas',ico:SVG.empresas},
  {id:'migracion',label:'Migración',ico:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'},
  {id:'analytics2',label:'Event Tracker',ico:SVG.analytics2},
  {id:'analytics3',label:'Precision',ico:SVG.analytics3},
  {id:'analytics4',label:'AI Intel',ico:SVG.analytics4},
];

export const DEFAULT_TABS = {
  superadmin:['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','analytics2','analytics3','analytics4','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios','empresas','migracion'],
  supervisor:['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios'],
  controlador_rampa:['ingresos','ingresos2'],
  editor:['ingresos','ingresos2','conductores','agenda','impresion'],
  visor:['ingresos','ingresos2','agenda'],
};

export function _getAllowedTabs(user) {
  if (!user) return [];
  const allowed = user.tabs || DEFAULT_TABS[user.rol] || ['dash','ingresos'];
  return TAB_DEFS.filter(t => allowed.includes(t.id));
}

function _validateTab() {
  const user = AppState.get('currentUser');
  const allowed = _getAllowedTabs(user).map(t => t.id);
  if (!allowed.includes(curTab)) setCurTab(allowed[0] || 'dash');
}

// ─── SHELL CSS ──────────────────────────────────────────────────────
export const SHELL_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--teal:#0d9f6e;--r:6px;--r2:10px;--sh:0 1px 3px rgba(0,0,0,.06)}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:13px;-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden;display:flex;flex-direction:column}
[data-theme="dark"]{--bg:#0f172a;--bg2:#1e293b;--bg3:#0f172a;--bg4:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;--text4:#475569;--border:#1e293b;--border2:#334155;--bll:#1e3a5f33;--gll:#00b89a15;--rll:#7f1d1d33;--all:#451a0333;--pll:#2e106533;--sh:0 1px 3px rgba(0,0,0,.4)}
[data-theme="soft"]{--bg:#fdf6e3;--bg2:#fffef9;--bg3:#f5ead0;--bg4:#eddfc0;--text:#2c2510;--text2:#5c4a1e;--text3:#8a7340;--text4:#b09060;--border:#e8d9b0;--border2:#d4c088;--bll:#e8f0ff;--gll:#e6f7ee;--rll:#fff1f1;--all:#fff8e1;--pll:#f3e8ff;--sh:0 1px 3px rgba(0,0,0,.06)}
[data-theme="contrast"]{--bg:#000;--bg2:#111;--bg3:#0a0a0a;--bg4:#1a1a1a;--text:#fff;--text2:#e0e0e0;--text3:#aaa;--text4:#888;--border:#333;--border2:#555;--bll:#001a3a;--gll:#001a0d;--rll:#1a0000;--all:#1a1000;--pll:#1a0033;--sh:0 2px 8px rgba(0,0,0,.8)}
[data-theme="dark"] #appHdr,[data-theme="contrast"] #appHdr{background:#030812!important;border-bottom-color:#1e293b!important}
[data-theme="soft"] #appHdr{background:#f0e8d0!important;border-bottom-color:#d4c088!important}
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
#appHdr{display:flex;align-items:center;gap:4px;padding:0 10px;height:44px;background:var(--bg2);border-bottom:1.5px solid var(--border);flex-shrink:0;box-shadow:var(--sh)}
#hdrCnts{display:flex;align-items:center;gap:6px;flex:1;justify-content:center}
.hdr-cnt{display:flex;flex-direction:column;align-items:center;border:1px solid var(--border2);border-radius:var(--r);padding:1px 7px;min-width:48px}
.hdr-cv{font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.2}
.hdr-cl{font-size:8px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.ev-pill{background:var(--bg3);border:1px solid var(--border2);color:var(--text2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:800;cursor:pointer}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid var(--border2);background:var(--bg3);font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
#mainTabs{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0;scrollbar-width:none}
#mainContent{flex:1;overflow:hidden;display:flex;flex-direction:column}
.app-main{flex:1;overflow-y:auto;padding:10px 14px;max-width:1400px;margin:0 auto;width:100%}
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:repeat(3,1fr)}.sg4{grid-template-columns:repeat(4,1fr)}.sg6{grid-template-columns:repeat(6,1fr)}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:12px;box-shadow:var(--sh)}
.stat-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:10px 14px;box-shadow:var(--sh)}
.stat-n{font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.1}
.stat-l{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.tbl-wrap{overflow-x:auto;border-radius:var(--r2);border:1px solid var(--border)}
.dtbl{width:100%;border-collapse:collapse;font-size:12px}
.dtbl thead{background:var(--bg3)}
.dtbl th{padding:7px 10px;font-weight:700;font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;border-bottom:1.5px solid var(--border);text-align:left;white-space:nowrap}
.dtbl td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
.dtbl tbody tr:hover{background:var(--bg3)}
.dtbl tbody tr:last-child td{border-bottom:none}
.mchip{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:6px;padding:2px 7px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.5px}
.mchip-sm{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700}
.sbox{display:flex;align-items:center;background:var(--bg2);border:1.5px solid var(--border2);border-radius:20px;padding:4px 10px;gap:6px}
.sbox input{border:none;background:transparent;flex:1;font-size:12px}
.sico{font-size:14px;flex-shrink:0;opacity:.5}
.sec-hdr{display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:wrap}
.sec-ttl{font-size:14px;font-weight:800}
.sec-act{display:flex;align-items:center;gap:4px;margin-left:auto;flex-wrap:wrap}
.bar-row{display:flex;align-items:center;gap:6px;padding:2px 0}
.bar-bg{flex:1;height:6px;background:var(--bg4);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .3s}
.bar-val{font-size:10px;font-weight:700;min-width:24px;text-align:right;color:var(--text3)}
.sbadge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.pill-g{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.pill-b{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.pill-r{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.pill-a{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite;margin-right:3px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{background:var(--bg2);border-radius:var(--r2);padding:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.15)}
.modal-hdr{display:flex;align-items:center;margin-bottom:16px}
.modal-ttl{font-size:16px;font-weight:800;flex:1}
.fg{margin-bottom:10px}
.flbl{display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:3px;text-transform:uppercase}
.freq{color:var(--red)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:var(--text3)}
.ei{font-size:40px;margin-bottom:8px}
.et{font-size:16px;font-weight:700}
.es{font-size:12px;margin-top:4px}
.ag-pend{background:#fef3c7;color:#b45309;border:1px solid #fde68a;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-done{background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-canc{background:var(--bg3);color:var(--text3);border:1px solid var(--border);border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.h-badge{display:inline-flex;align-items:center;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe}
@media (max-width:900px){.sg6{grid-template-columns:repeat(3,1fr)}.sg3{grid-template-columns:repeat(2,1fr)}.sg2{grid-template-columns:1fr}}
@media (max-width:600px){.sg6,.sg4,.sg3,.sg2{grid-template-columns:1fr}}
.btn-tab.tab-dragging{opacity:.4;cursor:grabbing}
.btn-tab.tab-drag-over{border-color:var(--blue)!important;background:var(--bll)!important}
`;

// ─── RENDER SHELL ───────────────────────────────────────────────────
export function _renderShell() {
  const user = AppState.get('currentUser');
  const tabs = _getAllowedTabs(user);
  document.body.innerHTML = `
<style>${SHELL_CSS}</style>
<div id="appHdr" style="background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;height:44px;position:sticky;top:0;z-index:200">
  <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
    <svg viewBox="0 0 140 140" width="36" height="36"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
    <span style="font-family:'Oxanium',monospace;font-size:18px;font-weight:700;color:var(--text);letter-spacing:-.3px"><span style="color:#00ffc8">Be</span>Unify<span style="color:#00ffc8">T</span></span>
    <span class="v-badge">v8</span>
  </div>
  <div id="hdrCnts" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px"></div>
  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
    <button id="btnTheme" style="border:1px solid var(--border2);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:11px;padding:3px 10px;cursor:pointer;display:flex;align-items:center;gap:4px" onclick="window._op.toggleThemeMenu()"><span id="themeIcon">☀️</span> <span id="themeLbl">Tema</span> ▾</button>
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
  <div class="app-main" id="tabContent"></div>
</div>
<div id="modalContainer"></div>
`;
}

// ─── GO TAB ─────────────────────────────────────────────────────────
export function goTab(tab) {
  setCurTab(tab);
  try { localStorage.setItem('beu_tab', tab); } catch(e) {}
  const tc = document.getElementById('tabContent');
  if (tc) tc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)"><div class="spinner" style="margin:0 auto"></div></div>';
  document.querySelectorAll('#mainTabs .btn-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  renderHdr();
  // Call the registered render function for this tab
  const renderName = {
    dash:'renderDash', ingresos:'renderIngresos', ingresos2:'renderIngresos2',
    flota:'renderFlota', conductores:'renderConductores', agenda:'renderAgenda',
    analytics:'renderAnalytics', analytics2:'renderAnalytics2', analytics3:'renderAnalytics3', analytics4:'renderAnalytics4', vehiculos:'renderVehiculos', auditoria:'renderAuditoria',
    papelera:'renderPapelera', impresion:'renderImpresion', recintos:'renderRecintos',
    eventos:'renderEventosTab', mensajes:'renderMensajes', usuarios:'renderUsuarios',
    empresas:'renderEmpresasTab', migracion:'renderMigracion',
  }[tab] || 'renderDash';
  try {
    callFn(renderName);
  } catch(e) {
    console.error('[goTab]', tab, e);
    if (tc) tc.innerHTML = '<div class="empty"><div class="ei">⚠️</div><div class="et">Error cargando '+tab+'</div><div class="es">'+e.message+'</div></div>';
  }
}

// ─── HEADER ─────────────────────────────────────────────────────────
export function renderHdr() {
  const el = document.getElementById('hdrCnts'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const msgs = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID) && !m.pausado && (!m.expiraTs || Date.now() < m.expiraTs)).length;
  const agH = DB.agenda.filter(a => a.fecha === today && a.estado === 'PENDIENTE').length;
  const ev = getActiveEvent();
  el.innerHTML = `
    ${ev ? `<span class="ev-pill" style="cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="window._op.goTab('eventos')">${ev.ico||'📋'} ${esc(ev.nombre)}</span>` : '<span style="font-size:11px;color:var(--text3)">Sin evento</span>'}
    <div style="display:flex;gap:4px;align-items:center">
      ${msgs ? `<div class="hdr-cnt" style="border-color:var(--red);background:var(--rll);cursor:pointer" onclick="window._op.goTab('mensajes')"><div class="hdr-cv" style="color:var(--red)">${msgs}</div><div class="hdr-cl">MSG</div></div>` : ''}
      ${agH ? `<div class="hdr-cnt" style="border-color:#c7d2fe;background:#eef2ff;cursor:pointer" onclick="window._op.goTab('agenda')"><div class="hdr-cv" style="color:#4f46e5">${agH}</div><div class="hdr-cl">AGENDA</div></div>` : ''}
    </div>`;
}

// ─── THEME ──────────────────────────────────────────────────────────
const THEME_ORDER = ['light','dark','soft','contrast'];
const THEME_ICONS = {light:'☀️', dark:'🌙', soft:'🌅', contrast:'⚡'};
const THEME_NAMES = {light:'Claro', dark:'Oscuro', soft:'Suave', contrast:'Alto contraste'};

export function _applyTheme(theme) {
  const t = theme || AppState.get('theme') || localStorage.getItem('beu_theme') || 'light';
  const root = document.documentElement;
  if (t === 'light') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
  const ico = document.getElementById('themeIcon');
  if (ico) ico.textContent = THEME_ICONS[t] || '☀️';
  const lbl = document.getElementById('themeLbl');
  if (lbl) lbl.textContent = 'Tema';
  try { localStorage.setItem('beu_theme', t); } catch(e) {}
  AppState.set('theme', t);
}

export function toggleThemeMenu() {
  let menu = document.getElementById('themeDropMenu');
  if (menu) { menu.remove(); return; }
  const btn = document.getElementById('btnTheme'); if (!btn) return;
  const rect = btn.getBoundingClientRect();
  menu = document.createElement('div');
  menu.id = 'themeDropMenu';
  menu.style.cssText = 'position:fixed;top:'+(rect.bottom+4)+'px;right:'+(window.innerWidth-rect.right)+'px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:10px;padding:6px;z-index:9999;min-width:170px;box-shadow:0 8px 24px rgba(0,0,0,.15)';
  const cur = localStorage.getItem('beu_theme') || 'light';
  menu.innerHTML = THEME_ORDER.map(th => {
    const active = th === cur;
    return '<div onclick="window._op.selectTheme(\''+th+'\')" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;color:var(--text);background:'+(active?'var(--bll)':'transparent')+';font-weight:'+(active?'700':'400')+'" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\''+(active?'var(--bll)':'transparent')+'\'">'+
      '<span style="font-size:16px">'+THEME_ICONS[th]+'</span><span>'+THEME_NAMES[th]+'</span>'+(active?'<span style="margin-left:auto;color:var(--green)">✓</span>':'')+
    '</div>';
  }).join('');
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', function _tc(e) {
      if (!e.target.closest('#themeDropMenu') && !e.target.closest('#btnTheme')) {
        const m = document.getElementById('themeDropMenu'); if (m) m.remove();
        document.removeEventListener('click', _tc);
      }
    });
  }, 10);
}

export function selectTheme(theme) {
  const m = document.getElementById('themeDropMenu'); if (m) m.remove();
  _applyTheme(theme);
}

export function cycleTheme() { toggleThemeMenu(); }

// ─── LANG ───────────────────────────────────────────────────────────
export function openLangPicker() {
  const langs = ['es','en','fr','de','it','pt','ar','pl','ro','nl','hu','cs','ca','eu','gl','uk','ru','tr','sv','fi','el','bg','sk','sl'];
  const cur = AppState.get('currentLang') || 'es';
  const body = `<div style="display:flex;flex-wrap:wrap;gap:6px">${langs.map(l=>`<button class="btn btn-sm ${l===cur?'btn-p':'btn-gh'}" onclick="window._op.setLang('${l}');document.getElementById('dynModal')?.remove()">${l.toUpperCase()}</button>`).join('')}</div>`;
  const div = document.createElement('div'); div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box"><div class="modal-hdr"><div class="modal-ttl">🌐 Idioma</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>${body}</div>`;
  document.getElementById('dynModal')?.remove(); document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

export async function setLang(lang) {
  AppState.set('currentLang', lang);
  try { localStorage.setItem('beu_lang', lang); } catch(e) {}
  const user = AppState.get('currentUser');
  if (user) { user.lang = lang; await fsUpdate(`users/${user.id}`, { lang }); }
  import('../utils.js').then(m => m.toast(`🌐 Idioma: ${lang.toUpperCase()}`, 'var(--green)'));
}

// ─── TAB DRAG/DROP ──────────────────────────────────────────────────
export function tabDragStart(e) { e.dataTransfer.setData('text/plain', e.currentTarget.dataset.tab); e.currentTarget.classList.add('tab-dragging'); }
export function tabDragOver(e) { e.preventDefault(); document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('tab-drag-over')); e.currentTarget.classList.add('tab-drag-over'); }
export function tabDrop(e) {
  e.preventDefault();
  const from = e.dataTransfer.getData('text/plain');
  const to = e.currentTarget.dataset.tab;
  if (from === to) return;
  const bar = document.getElementById('mainTabs');
  const btns = [...bar.querySelectorAll('.btn-tab')];
  const fromEl = btns.find(b => b.dataset.tab === from);
  const toEl = btns.find(b => b.dataset.tab === to);
  if (fromEl && toEl) bar.insertBefore(fromEl, toEl);
  const newOrder = [...bar.querySelectorAll('.btn-tab')].map(b => b.dataset.tab);
  try { localStorage.setItem('beu_tabOrder', JSON.stringify(newOrder)); } catch(e) {}
}
export function tabDragEnd(e) { document.querySelectorAll('.btn-tab').forEach(b => { b.classList.remove('tab-dragging'); b.classList.remove('tab-drag-over'); }); }

// ─── KEYBOARD ───────────────────────────────────────────────────────
export function _bindGlobalKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { document.getElementById('dynModal')?.remove(); }
    if ((e.ctrlKey||e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const inp = document.querySelector('#mainContent input[type="text"]');
      if (inp) inp.focus();
    }
  });
}

// ─── LOGOUT ─────────────────────────────────────────────────────────
export function handleLogout() {
  if (!confirm('¿Cerrar sesión?')) return;
  _unsubs.forEach(u => { try { u(); } catch(e) {} });
  logout();
}

// ─── REGISTER ───────────────────────────────────────────────────────
registerFn('goTab', goTab);
registerFn('renderHdr', renderHdr);
window.goTab = goTab;
window.renderHdr = renderHdr;
