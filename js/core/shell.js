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
];

export const DEFAULT_TABS = {
  superadmin:['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios','empresas','migracion'],
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
<div id="modalContainer">
<!-- MODAL INGRESO -->
<div class="ov" id="mIng"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mIngTitle">Nuevo Ingreso</div><button class="btn-x" onclick="closeOv('mIng')">✕</button></div>
  <div id="fiEventoBar" style="display:none;background:var(--gll);border:1.5px solid #bbf7d0;border-radius:var(--r);padding:6px 10px;margin-bottom:8px;font-size:11px;display:flex;align-items:center;gap:8px;flex-wrap:wrap"></div>
  <div id="fiEventoSel" style="display:none;margin-bottom:8px">
    <span class="flbl">📅 Evento</span>
    <select id="fiEventoId" onchange="onFormEventoChange()" style="font-weight:700;margin-top:3px">
      <option value="">— Sin evento —</option>
    </select>
  </div>
  <div class="fgrid" id="ingFormBody">
    <div class="fg"><span class="flbl">Nº Posición</span><input id="fiPos" type="number" min="1" placeholder="Auto" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px"></div>
    <div class="fg s2"><span class="flbl">Matrícula <span class="freq">*</span></span>
      <div style="display:flex;gap:4px;position:relative">
        <div style="position:relative;flex:1">
          <input id="fiMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;padding-right:32px" oninput="this.value=this.value.toUpperCase();checkMatOnInput(this.value);searchMatUnified(this.value)" onfocus="searchMatUnified(this.value)" onblur="setTimeout(()=>document.getElementById('fiMatResults').classList.remove('open'),200)" placeholder="🔍 Matrícula, nombre o empresa..." autocomplete="off">
          <span id="fiMatClearBtn" onclick="clearMatField()" style="display:none;position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:14px;color:var(--text3)">✕</span>
          <div class="dr" id="fiMatResults"></div>
        </div>
        <button class="btn btn-t btn-sm" onclick="openCamModal()" title="OCR Cámara">📷</button>
      </div>
      <div id="fiMatTag" style="display:none;margin-top:4px;align-items:center;gap:6px;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:4px 8px;font-size:11px">
        <span id="fiMatTagIcon">👤</span>
        <span id="fiMatTagName" style="font-weight:700;flex:1"></span>
        <button id="fiMatTagSave" onclick="saveMatAsChofer()" title="Guardar como conductor frecuente" style="display:none;background:#16a34a;color:#fff;border:none;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap">＋ Conductor</button>
        <button onclick="clearMatField()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0;line-height:1">✕</button>
      </div>
    </div>
    <div class="fg" id="fg-remolque"><span class="flbl" id="lbl-remolque">Remolque</span><input id="fiRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-tipoVeh"><span class="flbl">Tipo vehículo</span><div style="display:flex;gap:4px" id="tipoVehBtns"><button type="button" class="btn btn-sm btn-gh" id="tvTrailer" onclick="setToggle('fiTipoVeh','trailer')" style="flex:1">🚛 Trailer</button><button type="button" class="btn btn-sm btn-gh" id="tvB" onclick="setToggle('fiTipoVeh','semiremolque')" style="flex:1">🚚 B</button><button type="button" class="btn btn-sm btn-gh" id="tvA" onclick="setToggle('fiTipoVeh','camion')" style="flex:1">🚗 A</button></div><input type="hidden" id="fiTipoVeh"></div>
    <div class="fg" id="fg-descarga"><span class="flbl">Servicio Descarga/Carga</span><div style="display:flex;gap:4px"><button type="button" class="btn btn-sm btn-gh" id="dcHand" onclick="setToggle('fiDescarga','mano')" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-sm btn-gh" id="dcFork" onclick="setToggle('fiDescarga','maquinaria')" style="flex:1">🏗 Forklift</button></div><input type="hidden" id="fiDescarga"></div>
    <input type="hidden" id="fiChoferSearch">
    <div class="fg" id="fg-llamador"><span class="flbl" id="lbl-llamador">Llamador</span><input id="fiLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-ref"><span class="flbl" id="lbl-ref">Referencia / Booking</span><div style="position:relative"><input id="fiRef" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase();searchRefAutoComplete(this.value)" autocomplete="off"><div class="dr" id="fiRefResults"></div></div></div>
    <div class="fg" id="fg-empresa"><span class="flbl" id="lbl-empresa">Empresa</span><input id="fiEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-montador"><span class="flbl" id="lbl-montador">Montador</span><input id="fiMontador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-expositor"><span class="flbl" id="lbl-expositor">Expositor</span><input id="fiExpositor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div class="fg"><span class="flbl" id="lbl-hall">Hall</span><div style="position:relative"><input id="fiHallInput" placeholder="2A, 3B..." oninput="filterHallSuggestions(this.value)" autocomplete="off" style="font-weight:700"><div class="dr" id="fiHallResults"></div></div><div id="fiHallTags" style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px"></div><input type="hidden" id="fiHall"></div>
      <div class="fg"><span class="flbl">Stand</span><input id="fiStand" style="font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg" id="fg-puertaHall"><span class="flbl">Puerta Hall</span><input id="fiPuertaHall" placeholder="Puerta del hall" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg" id="fg-acceso"><span class="flbl">Acceso</span><select id="fiPuerta"><option value="">--</option></select></div>
    </div>
    <!-- SEPARADOR DATOS PERSONALES -->
    <div style="grid-column:1/-1;border-top:2px solid var(--border2);margin:4px 0;padding-top:8px"><span style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:1px">👤 Datos del conductor</span></div>
    <div class="fg" id="fg-nombre"><span class="flbl" id="lbl-nombre">Nombre</span><input id="fiNom" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-apellido"><span class="flbl" id="lbl-apellido">Apellido</span><input id="fiApe" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-pasaporte"><span class="flbl" id="lbl-pasaporte">Pasaporte / DNI</span><input id="fiPas"></div>
    <div class="fg" id="fg-fechaNac"><span class="flbl">Fecha Nacimiento</span><input id="fiFechaNac" type="date"></div>
    <div class="fg" id="fg-fechaExp"><span class="flbl">Fecha Expiración Doc.</span><input id="fiFechaExp" type="date"></div>
    <div class="fg" id="fg-pais"><span class="flbl">País</span><input id="fiPais" placeholder="España, Polonia, Italia..."></div>
    <div class="fg" id="fg-telefono"><span class="flbl" id="lbl-tel">Teléfono</span><div style="display:flex;gap:4px"><input id="fiTelP" list="dlTelP" style="width:auto;flex-shrink:0;min-width:90px;max-width:110px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34 ✏"><datalist id="dlTelP"></datalist><input id="fiTel" type="tel"></div></div>
    <div class="fg" id="fg-email"><span class="flbl" id="lbl-email">Email</span><input id="fiEmail" type="email"></div>
    <div class="fg"><span class="flbl">Idioma ficha</span><select id="fiLang" onchange="updatePhrasePreview()"></select></div>
    <div id="fiPhraseWrap" style="display:none;grid-column:1/-1;background:#fffbeb;border:1.5px solid #f59e0b;border-radius:var(--r);padding:8px 12px">
      <div id="fiPhraseUserLine" style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:4px"></div>
      <div id="fiPhraseDriverLine" style="display:none;border-top:1px dashed #fde68a;padding-top:4px;font-size:13px;font-weight:700;color:#b45309"></div>
    </div>
    <div id="fiPhrase2Wrap" style="display:none;grid-column:1/-1;background:#f0f9ff;border:1.5px solid #93c5fd;border-radius:var(--r);padding:8px 12px">
      <div style="font-size:10px;font-weight:700;color:#1d4ed8;margin-bottom:4px">📝 Frase 2 (zona recortable)</div>
      <div id="fiPhrase2Line" style="font-size:12px;font-weight:600;color:#1e40af"></div>
    </div>
    <div class="fg s2" id="fg-comentario"><span class="flbl" id="lbl-comentario">Comentario</span><textarea id="fiComent" rows="2"></textarea></div>
    <select id="fiCarga" style="display:none"><option value="">--</option></select>
    <input type="hidden" id="fiRegRXL"><input type="hidden" id="fiSOT">
  </div>
  <div id="fiHistorial" style="display:none;margin-top:10px;padding:10px;background:var(--bll);border-radius:var(--r);border:1.5px solid #bfdbfe"><div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:6px">📋 Historial — clic para autorellenar</div><div id="fiHistList"></div></div>
  <div id="fiBlkWarn" style="display:none;margin-top:10px;padding:10px;border-radius:var(--r);border:2px solid var(--red)"><div id="fiBlkMsg" style="font-weight:800;font-size:13px"></div><div id="fiBlkDet" style="font-size:11px;margin-top:3px"></div></div>
  <div id="fiEspMatch" style="display:none;margin-top:10px;padding:10px;background:var(--gll);border-radius:var(--r);border:1.5px solid #bbf7d0"><div style="font-size:11px;font-weight:700;color:var(--green)">⏳ En lista de espera:</div><div id="fiEspDet" style="font-size:12px;margin-top:3px"></div></div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mIng')">Cancelar</button><button class="btn btn-t btn-sm" id="btnNormalA4Form" onclick="imprimirYGuardarConTpl('normal')">🖨 Normal</button><button class="btn btn-sm" id="btnTroquelA4Form" style="background:#7c3aed;color:#fff" onclick="imprimirYGuardarConTpl('troquel')">✂ Troquelado</button><button class="btn btn-p" id="btnIngLbl" onclick="saveIngreso()">Registrar entrada</button></div>
  <input type="hidden" id="fiId">
</div></div>
<!-- MODAL AGENDA -->
<div class="ov" id="mAg"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mAgTitle">Nueva Cita</div><button class="btn-x" onclick="closeOv('mAg')">✕</button></div>
  <div style="background:var(--bg3);border-radius:var(--r);padding:7px 12px;margin-bottom:10px;font-size:11px;color:var(--text3)">💡 Busca un chofer preregistrado para autocompletar o rellena manualmente</div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Fecha <span class="freq">*</span></span><input id="agFecha" type="date"></div>
    <div class="fg"><span class="flbl">Hora planificada <span class="freq">*</span></span><input id="agHora" type="time"></div>
    <div class="fg s2" id="agEvWrap"><span class="flbl">Evento</span><select id="agEvento" onchange="onAgEventoChange()" style="font-weight:700"><option value="">— Sin evento —</option></select></div>
    <div class="fg"><span class="flbl">Chofer preregistrado</span><div style="position:relative"><input id="agChoferSearch" placeholder="🔍 Buscar chofer..." oninput="searchChoferAg(this.value)" autocomplete="off"><div class="dr" id="agChoferResults"></div></div></div>
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="agMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque</span><input id="agRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Tipo vehículo</span><select id="agTipoV"><option value="">--</option><option value="camion">🚛 Camión</option><option value="semiremolque">🚚 Semirremolque</option><option value="furgoneta">🚐 Furgoneta</option><option value="trailer">🚛 Trailer</option><option value="coche">🚗 Coche</option><option value="otro">📦 Otro</option></select></div>
    <div class="fg"><span class="flbl">Servicio Descarga/Carga</span><div style="display:flex;gap:4px"><button type="button" class="btn btn-sm btn-gh" id="agDcHand" onclick="setAgDescarga('mano')" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-sm btn-gh" id="agDcFork" onclick="setAgDescarga('maquinaria')" style="flex:1">🏗 Forklift</button></div><input type="hidden" id="agDescarga"></div>
    <div class="fg"><span class="flbl">Conductor</span><input id="agCond"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="agEmp"></div>
    <div class="fg"><span class="flbl">Referencia</span><input id="agRef" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Montador</span><input id="agMontador"></div>
    <div class="fg"><span class="flbl">Expositor</span><input id="agExpositor"></div>
    <div class="fg"><span class="flbl">Hall</span><select id="agHall"><option value="">--</option></select></div>
    <div class="fg"><span class="flbl">Stand</span><input id="agStand"></div>

    <div class="fg"><span class="flbl">Puerta Hall</span><input id="agPuertaHall" placeholder="Puerta del pabellón"></div>
    <div class="fg"><span class="flbl">Acceso</span><input id="agPuerta"></div>
    <div class="fg"><span class="flbl">Pase</span><select id="agPase"><option value="">--</option><option value="temporal">🎫 Temporal</option><option value="evento">📋 Evento</option><option value="vip">⭐ VIP</option><option value="staff">🔧 Staff</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="agTel" type="tel"></div>
    <div class="fg"><span class="flbl">GPS URL</span><input id="agGps" placeholder="https://..."></div>
    <div class="fg"><span class="flbl">Tipo carga</span><select id="agCarga"><option value="">--</option><option value="EF">🔴 EF</option><option value="SUNDAY">🟣 SUNDAY</option><option value="PRIORITY">🟠 PRIORITY</option><option value="GOODS">🟢 GOODS</option><option value="EMPTY">⚪ EMPTY</option></select></div>
    <div class="fg"><span class="flbl">Gasto/Pago</span><select id="agGastoTipo"><option value="">--</option><option value="tarjeta">💳 Tarjeta</option><option value="efectivo">💵 Efectivo</option><option value="ambos">💳💵 Mixto</option></select></div>
    <div class="fg"><span class="flbl">Importe gasto</span><input id="agGastoImporte" type="number" step="0.01"></div>
    <div class="fg"><span class="flbl">Estado</span><select id="agEstado"><option value="PENDIENTE">⏳ Pendiente</option><option value="LLEGADO">✅ Llegado</option><option value="SALIDA">🔵 Salida</option></select></div>
    <div class="fg s2"><span class="flbl">Requisitos extras</span><div style="display:flex;gap:5px;margin-bottom:6px"><input id="agReqInput" placeholder="Añadir requisito..." style="flex:1"><button class="btn btn-s btn-sm" onclick="addReqAg()">+</button></div><div id="agReqsList" style="display:flex;flex-wrap:wrap;gap:4px"></div></div>
    <div class="fg s2" style="grid-column:1/-1;border-top:1.5px solid var(--border);margin-top:4px;padding-top:10px"><div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);margin-bottom:6px">🪪 Documentación del conductor</div><div class="fgrid"><div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="agPas" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div><div class="fg"><span class="flbl">País / Nacionalidad</span><input id="agPais" placeholder="España, Polonia..."></div><div class="fg"><span class="flbl">Fecha Nacimiento</span><input id="agFechaNac" type="date"></div><div class="fg"><span class="flbl">Fecha Expiración Doc.</span><input id="agFechaExp" type="date"></div></div></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="agNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mAg')">Cancelar</button><button class="btn btn-p" id="btnAgLbl" onclick="saveAgenda()">Añadir cita</button></div>
  <input type="hidden" id="agId">
</div></div>
<!-- MODAL CONDUCTOR -->
<div class="ov" id="mCond"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mCondTitle">Nuevo Conductor</div><button class="btn-x" onclick="closeOv('mCond')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Nombre <span class="freq">*</span></span><input id="fcNom"></div>
    <div class="fg"><span class="flbl">Apellido <span class="freq">*</span></span><input id="fcApe"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="fcEmp"></div>
    <div class="fg"><span class="flbl">Matrícula habitual</span><input id="fcMat" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque habitual</span><input id="fcRem" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Hall habitual</span><select id="fcHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><div style="display:flex;gap:4px"><input id="fcTelP" list="dlTelP2" style="width:auto;flex-shrink:0;min-width:90px;max-width:110px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34 ✏"><datalist id="dlTelP2"></datalist><input id="fcTel" type="tel"></div></div>
    <div class="fg"><span class="flbl">Email</span><input id="fcEmail" type="email"></div>
    <div class="fg"><span class="flbl">Tipo vehículo</span><select id="fcTipoV"><option value="">--</option><option value="camion">🚛 Camión</option><option value="semiremolque">🚚 Semirremolque</option><option value="furgoneta">🚐 Furgoneta</option><option value="trailer">🚛 Trailer</option><option value="coche">🚗 Coche</option></select></div>
    <div class="fg"><span class="flbl">Idioma ficha 🖨</span><select id="fcIdioma"><option value="">--</option></select></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🏢 Contacto empresa (para ausencias)</div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Encargado / Responsable</span><input id="fcEncargado" placeholder="Nombre del responsable"></div>
      <div class="fg"><span class="flbl">Tel. encargado</span><div style="display:flex;gap:4px"><input id="fcEncTelP" style="width:auto;flex-shrink:0;min-width:80px;max-width:100px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34"><input id="fcEncTel" type="tel"></div></div>
      <div class="fg s2"><span class="flbl">Email encargado</span><input id="fcEncEmail" type="email" placeholder="responsable@empresa.com"></div>
    </div>
  </div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="fcPas" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><span class="flbl">País / Nacionalidad</span><input id="fcPais" placeholder="España, Polonia..."></div>
      <div class="fg"><span class="flbl">Fecha Nacimiento</span><input id="fcFechaNac" type="date"></div>
      <div class="fg"><span class="flbl">Fecha Expiración Doc.</span><input id="fcFechaExp" type="date"></div>
      <div class="fg s2"><span class="flbl">GPS URL</span><input id="fcGps" placeholder="https://maps.google.com/..."></div>
      <div class="fg s2"><span class="flbl">Notas</span><textarea id="fcNotas" rows="2"></textarea></div>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mCond')">Cancelar</button><button class="btn btn-p" id="btnCondLbl" onclick="saveCond()">Crear</button></div>
  <input type="hidden" id="fcId">
</div></div>
<!-- MODAL MOVIMIENTO -->
<div class="ov" id="mMov"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mMovTitle">Nuevo Movimiento</div><button class="btn-x" onclick="closeOv('mMov')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="fmMat" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque</span><input id="fmRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nombre</span><input id="fmNom"></div>
    <div class="fg"><span class="flbl">Apellido</span><input id="fmApe"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="fmEmp"></div>
    <div class="fg"><span class="flbl">Hall <span class="freq">*</span></span><select id="fmHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Tipo carga</span><select id="fmCarga"><option value="">--</option><option value="EF">🔴 EF</option><option value="SUNDAY">🟣 SUNDAY</option><option value="PRIORITY">🟠 PRIORITY</option><option value="GOODS">🟢 GOODS</option><option value="EMPTY">⚪ EMPTY</option></select></div>
    <div class="fg"><span class="flbl">Estado</span><select id="fmStatus"><option value="ALMACEN">📦 ALMACEN</option><option value="SOT">⏱ SOT</option><option value="FIRA">🟢 FIRA</option><option value="FINAL">✅ FINAL</option></select></div>
    <div class="fg"><span class="flbl">Posición</span><input id="fmPos" type="number" min="0"></div>
    <div class="fg"><span class="flbl">Nº Vuelta</span><input id="fmVuelta" type="number" value="1" min="1"></div>
    <div class="fg s2"><span class="flbl">Tacógrafo</span><input id="fmTaco" type="datetime-local"></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="fmNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mMov')">Cancelar</button><button class="btn btn-p" id="btnMovLbl" onclick="saveMov()">Añadir</button></div>
  <input type="hidden" id="fmId">
</div></div>
<!-- MODAL RECINTO -->
<div class="ov" id="mRecinto"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mRecTitle">Nuevo Recinto</div><button class="btn-x" onclick="closeOv('mRecinto')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre del recinto <span class="freq">*</span></span><input id="recNom" placeholder="Ej: FIRA BARCELONA GRAN VIA"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="recCiudad" placeholder="Barcelona"></div>
    <div class="fg"><span class="flbl">País</span><input id="recPais" placeholder="España"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🏭 Halls / Pabellones</div>
    <div style="display:flex;gap:4px;margin-bottom:8px"><input id="recHallInput" placeholder="Nombre hall (ej: 2A, 3B, CS...)" style="flex:1"><button class="btn btn-s btn-sm" onclick="addRecHall()">+ Hall</button></div>
    <div id="recHallList" style="display:flex;flex-wrap:wrap;gap:4px"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🚪 Accesos / Puertas</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:5px;margin-bottom:6px">
      <input id="recPuertaNom" placeholder="Nombre puerta">
      <input id="recPuertaDir" placeholder="Dirección">
      <input id="recPuertaQR" placeholder="URL QR (https://...)">
      <button class="btn btn-s btn-sm" onclick="addRecPuerta()">+ Puerta</button>
    </div>
    <div id="recPuertasList" style="display:flex;flex-direction:column;gap:4px"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">📞 Atención al cliente</div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Teléfono</span><input id="recAtcTel" placeholder="+34 900..."></div>
      <div class="fg"><span class="flbl">Email</span><input id="recAtcEmail" type="email" placeholder="info@recinto.com"></div>
      <div class="fg s2"><span class="flbl">Notas / Info adicional</span><textarea id="recAtcNotas" rows="2" placeholder="Horarios, web, etc."></textarea></div>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mRecinto')">Cancelar</button><button class="btn btn-p" id="btnRecLbl" onclick="saveRecinto()">Crear</button></div>
  <input type="hidden" id="recId">
</div></div>
<!-- MODAL EVENTO -->
<div class="ov" id="mEvento"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mEvTitle">Nuevo Evento</div><button class="btn-x" onclick="closeOv('mEvento')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre <span class="freq">*</span></span><input id="evNom" placeholder="Nombre del evento o feria" autocomplete="off" spellcheck="false"></div>
    <div class="fg"><span class="flbl">Fecha inicio</span><input id="evIni" type="date"></div>
    <div class="fg"><span class="flbl">Fecha fin</span><input id="evFin" type="date"></div>
    <div class="fg"><span class="flbl">Emoji</span><input id="evIco" value="📋" maxlength="2" style="font-size:22px;text-align:center;max-width:70px"></div>
    <div class="fg s2"><span class="flbl">Recinto</span><select id="evRecintoId" onchange="onRecintoSelectChange()"><option value="">— Seleccionar recinto —</option></select></div>
    <div class="fg"><span class="flbl">Recinto (nombre)</span><input id="evRec" readonly style="background:var(--bg3);color:var(--text3)"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="evCiudad" readonly style="background:var(--bg3);color:var(--text3)"></div>

    <div class="fg s2">
      <span class="flbl">Numeración posiciones (Ingresos)</span>
      <div style="display:flex;gap:8px;align-items:center">
        <label class="tgl" id="tglAcumPos"><input type="checkbox" id="evAcumPos" onchange="updTgl(this)"><span>Acumular por evento</span></label>
        <span style="font-size:10px;color:var(--text3)">Si desactivado, reinicia cada día desde 1</span>
      </div>
    </div>
    <div class="fg s2" id="evBgWrap" style="display:none">
      <span class="flbl">Imagen de fondo (JPG/PNG) — se usará como marca de agua</span>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn btn-gh btn-sm" onclick="document.getElementById('evBgFile').click()">📁 Seleccionar imagen</button>
        <span id="evBgStatus" style="font-size:11px;color:var(--text3)">Sin imagen</span>
        <button class="btn btn-danger btn-xs" id="evBgClear" style="display:none" onclick="evBgData='';document.getElementById('evBgStatus').textContent='Sin imagen';document.getElementById('evBgClear').style.display='none'">✕</button>
      </div>
      <input type="file" id="evBgFile" accept="image/*,.pdf" style="display:none" onchange="loadEvBg(this)">
    </div>
    <div class="fg s2"><span class="flbl">Puertas / Accesos</span>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:5px;margin-bottom:6px">
        <input id="evPuertaNom" placeholder="Nombre puerta">
        <input id="evPuertaDir" placeholder="Dirección / info">
        <input id="evPuertaQR" placeholder="URL QR (https://...)">
        <button class="btn btn-s btn-sm" onclick="addPuertaEvento()">+ Puerta</button>
      </div>
      <div id="evPuertasList" style="display:flex;flex-direction:column;gap:4px"></div>
    </div>
  </div>
  <div class="modal-section"><div class="modal-section-title">🏭 Halls del evento <span style="font-size:9px;color:var(--text3);font-weight:400">(selecciona del recinto — si ninguno, usa todos)</span></div><div id="evHallsGrid" style="display:flex;flex-wrap:wrap;gap:5px"></div></div>
  <div class="modal-section"><div class="modal-section-title">Campos visibles en ficha ingreso</div><div id="evCamposGrid" style="display:flex;flex-wrap:wrap;gap:6px"></div></div>
  <div id="evPhrasesGrid" style="display:none"></div>
  <div style="border-top:0.5px solid var(--border);padding:8px 14px 6px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);margin-bottom:6px">👥 Usuarios asignados a este evento</div><div id="evUsuariosGrid" style="display:flex;flex-wrap:wrap;gap:5px"></div></div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mEvento')">Cancelar</button><button class="btn btn-p" id="btnEvLbl" onclick="saveEvento()">Crear</button></div>
  <input type="hidden" id="evId">
</div></div>
<!-- MODAL EN ESPERA -->
<div class="ov" id="mEE"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mEETitle">Nueva Espera</div><button class="btn-x" onclick="closeOv('mEE')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="eeM" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Hora aprox.</span><input id="eeHora" type="time"></div>
    <div class="fg"><span class="flbl">Prioridad</span><select id="eePrio"><option value="normal">Normal</option><option value="alta">🔶 Alta</option><option value="urgente">🔴 Urgente</option></select></div>
    <div class="fg"><span class="flbl">Conductor</span><input id="eeCond"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="eeEmp"></div>
    <div class="fg"><span class="flbl">Hall</span><select id="eeHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="eeTel" type="tel"></div>
    <div class="fg"><span class="flbl">Booking / Ref</span><input id="eeRef"></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="eeNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mEE')">Cancelar</button><button class="btn btn-p" id="btnEELbl" onclick="saveEE()">Añadir</button></div>
  <input type="hidden" id="eeId">
</div></div>
<!-- MODAL ESPECIAL -->
<div class="ov" id="mLN"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mLNTitle">Especial</div><button class="btn-x" onclick="closeOv('mLN')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="lnM" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nivel</span><select id="lnN"><option value="alerta">⚠️ Alerta</option><option value="bloqueo">🚫 Bloqueo</option></select></div>
    <div class="fg s2"><span class="flbl">Motivo <span class="freq">*</span></span><input id="lnMotivo"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="lnEmp"></div>
    <div class="fg"><span class="flbl">Válido hasta</span><input id="lnHasta" type="date"></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mLN')">Cancelar</button><button class="btn btn-r" id="btnLNLbl" onclick="saveLN()">Añadir</button></div>
  <input type="hidden" id="lnId">
</div></div>
<!-- MODAL MENSAJE -->
<div class="ov" id="mMsg"><div class="modal">
  <div class="mhdr"><div class="mttl">📢 Nuevo Mensaje</div><button class="btn-x" onclick="closeOv('mMsg')">✕</button></div>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div class="fg"><span class="flbl">Tipo</span><select id="msgTipo"><option value="info">ℹ️ Info</option><option value="alerta">⚠️ Alerta</option><option value="urgente">🔴 Urgente</option></select></div>
    <div class="fg"><span class="flbl">Título <span class="freq">*</span></span><input id="msgTitulo"></div>
    <div class="fg"><span class="flbl">Mensaje <span class="freq">*</span></span><textarea id="msgTexto" rows="3"></textarea></div>
    <div class="fg"><span class="flbl">Matrícula relacionada</span><input id="msgMat" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mMsg')">Cancelar</button><button class="btn btn-p" onclick="saveMsg()">📢 Enviar</button></div>
</div></div>
<!-- MODAL USUARIO -->
<div class="ov" id="mUser"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mUserTitle">Nuevo Usuario</div><button class="btn-x" onclick="closeOv('mUser')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre completo <span class="freq">*</span></span><input id="fuNom"></div>
    <div class="fg"><span class="flbl">Nombre de usuario <span class="freq">*</span></span><input id="fuUsername" placeholder="sin espacios" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9._-]/g,'')"></div>
    <div class="fg"><span class="flbl">Email (para 2FA)</span><input id="fuEmail" type="email" placeholder="usuario@empresa.com"></div>
    <div class="fg"><span class="flbl">Contraseña</span><input id="fuPass" type="password" placeholder="Dejar vacío = no cambia" oninput="checkPassStrength(this.value)"></div>
    <div class="fg"><span class="flbl">Confirmar contraseña</span><input id="fuPass2" type="password" placeholder="Repetir contraseña"></div>
    <div class="fg"><span class="flbl">PIN (mín. 6 dígitos) — acceso rápido</span><input id="fuPin" type="password" maxlength="8" inputmode="numeric" placeholder="------"></div>
    <div class="fg"><span class="flbl">Confirmar PIN</span><input id="fuPin2" type="password" maxlength="8" inputmode="numeric" placeholder="------"></div>
    <div id="passStrengthWrap" style="display:none;grid-column:1/-1">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:4px;border-radius:2px;background:var(--bg4);overflow:hidden">
          <div id="passStrengthBar" style="height:100%;border-radius:2px;transition:width .3s,background .3s;width:0%"></div>
        </div>
        <span id="passStrengthLbl" style="font-size:10px;font-weight:700;min-width:40px"></span>
      </div>
    </div>
    <div class="fg"><span class="flbl">Idioma interfaz</span><select id="fuLang"></select></div>
    <div class="fg"><span class="flbl">Rol <span class="freq">*</span></span><select id="fuRol" onchange="updateRolPerms()"><option id="fuRolSA" value="superadmin" style="display:none">⭐ SuperAdmin</option><option value="supervisor">🔑 Supervisor</option><option value="controlador_rampa">🚦 Controlador Rampa</option><option value="editor">✏️ Editor</option><option value="visor">👁 Visor</option></select></div>
    <div class="fg s2" style="display:flex;align-items:center;gap:10px">
      <label class="tgl" id="tgl2FA"><input type="checkbox" id="fu2FA" onchange="updTgl(this)"><span>✉️ Verificación 2FA por email</span></label>
      <span style="font-size:10px;color:var(--text3)">Requiere email configurado</span>
    </div>
  </div>
  <div style="margin-top:12px;padding:10px;background:var(--bg3);border-radius:var(--r)" id="permsWrap">
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">PERMISOS</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Acción</th>
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Descripción</th>
        <th style="padding:4px 7px;text-align:center;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Activo</th>
      </tr></thead>
      <tbody id="permsTableBody">
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">➕ Añadir registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Crear nuevos ingresos / referencias</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpAdd" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">✏️ Editar registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Modificar datos de ingresos existentes</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpEdit" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🗑 Eliminar registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar ingresos (van a papelera)</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpDel" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">↩ Marcar estado</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Registrar entrada / salida de vehículos</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpStat" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🖨 Imprimir pase</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Imprimir y troquelado de pases</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpPrint" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">📥 Importar Excel</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Importar registros masivos desde archivo</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpImport" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">⬇ Exportar Excel</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Descargar listas en formato Excel</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpExp" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🗑 Limpiar tab</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar registros del día (no todo)</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpClean" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">⭐ Lista especial</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Gestionar blacklist y lista especial</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpBL" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">💾 Guardar plantilla</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Crear / modificar / asignar plantillas de impresión</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpSaveTpl" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🔄 Día 0 / Eliminar plantilla</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar plantillas y resetear canvas</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpDelTpl" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">✏️ Editar evento</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Modificar campos y configuración de eventos</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpEvEdit" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">▶ Activar evento</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Activar / desactivar evento global</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpActivarEv" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">💾 Exportar día (botón cabecera)</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Botón exportar datos del día en cabecera</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpSave" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr><td style="padding:5px 7px;font-weight:600">📢 Mensajes rampa</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Enviar mensajes a dispositivos en rampa</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpMsg" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr><td style="padding:5px 7px;font-weight:600">⚙ Campos visibles</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Acceder a ⚙ Campos para configurar campos visibles</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpCampos" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      </tbody>
    </table>
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">PESTAÑAS VISIBLES (SuperAdmin configura)</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px" id="tabToggleGrid">
      <label class="tgl" id="tglDash"><input type="checkbox" id="ftDash" onchange="updTgl(this)"><span>📊 Dashboard</span></label>
      <label class="tgl" id="tglRef"><input type="checkbox" id="ftIng" onchange="updTgl(this)"><span>🔖 Referencia</span></label>
      <label class="tgl" id="tglIng2"><input type="checkbox" id="ftIng2" onchange="updTgl(this)"><span>🚛 Ingresos</span></label>
      <label class="tgl" id="tglFlota"><input type="checkbox" id="ftFlota" onchange="updTgl(this)"><span>📦 Embalaje</span></label>
      <label class="tgl" id="tglCond"><input type="checkbox" id="ftCond" onchange="updTgl(this)"><span>👤 Conductores</span></label>
      <label class="tgl" id="tglAg"><input type="checkbox" id="ftAg" onchange="updTgl(this)"><span>📅 Agenda</span></label>
      <label class="tgl" id="tglAn"><input type="checkbox" id="ftAn" onchange="updTgl(this)"><span>📈 Análisis</span></label>
      <label class="tgl" id="tglVeh"><input type="checkbox" id="ftVeh" onchange="updTgl(this)"><span>📜 Historial</span></label>
      <label class="tgl" id="tglAud"><input type="checkbox" id="ftAud" onchange="updTgl(this)"><span>📂 Archivos</span></label>
      <label class="tgl" id="tglPap"><input type="checkbox" id="ftPap" onchange="updTgl(this)"><span>🗑 Papelera</span></label>
      <label class="tgl" id="tglRec"><input type="checkbox" id="ftRec" onchange="updTgl(this)"><span>🏟 Recintos</span></label>
      <label class="tgl" id="tglEv"><input type="checkbox" id="ftEv" onchange="updTgl(this)"><span>📅 Eventos</span></label>
      <label class="tgl" id="tglUs"><input type="checkbox" id="ftUs" onchange="updTgl(this)"><span>👥 Usuarios</span></label>
      <label class="tgl" id="tglImp"><input type="checkbox" id="ftImp" onchange="updTgl(this)"><span>🖨 Impresión</span></label>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mUser')">Cancelar</button><button class="btn btn-p" id="btnUserLbl" onclick="saveUser()">Crear</button></div>
  <input type="hidden" id="fuId">
</div></div>
<!-- MODAL BORRAR -->
<div class="ov" id="mDel"><div class="modal modal-sm"><div class="mhdr"><div class="mttl" id="delTitle">Confirmar eliminación</div></div><div id="delDetail" style="font-size:13px;color:var(--text3);margin-bottom:16px"></div><div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mDel')">Cancelar</button><button class="btn btn-r" onclick="doDelete()">🗑 Eliminar</button></div></div></div>
<!-- MODAL DETALLE INGRESO -->
<div class="ov" id="mIngDetail"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mIngDetailTitle">Detalle Ingreso</div><button class="btn-x" onclick="closeOv('mIngDetail')">✕</button></div>
  <div id="mIngDetailBody"></div>
  <div class="ffoot">
    <button class="btn btn-gh" onclick="closeOv('mIngDetail')">Cerrar</button>
    <button class="btn btn-t btn-sm" id="mIngDetailPrint" onclick="">🖨 Normal</button>
    <button class="btn btn-sm" id="mIngDetailPrintTrq" style="background:#7c3aed;color:#fff" onclick="">✂ Troquelado</button>
    <button class="btn btn-edit btn-sm" id="mIngDetailEdit" onclick="">✏️ Editar</button>
  </div>
</div></div>
<!-- MODAL BUSQUEDA GLOBAL -->
<div class="ov" id="mGlobalSearch"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl">🔍 Búsqueda Global</div><button class="btn-x" onclick="closeOv('mGlobalSearch')">✕</button></div>
  <div style="position:relative;margin-bottom:12px">
    <input id="globalSearchInput" placeholder="Buscar posición, matrícula, nombre, empresa, referencia..." oninput="doGlobalSearch(this.value)" style="padding-left:36px;font-size:14px">
    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px">🔍</span>
  </div>
  <div id="globalSearchResults"></div>
</div></div>
<!-- MODAL BLACKLIST ALERT -->
<div class="ov" id="mBA"><div class="modal modal-sm"><div style="text-align:center;margin-bottom:12px"><div style="font-size:48px" id="baIcon">🚫</div><div style="font-size:16px;font-weight:900;margin-top:6px" id="baTitle">ACCESO DENEGADO</div></div><div id="baDetail" style="font-size:13px;margin-bottom:10px;padding:10px;background:var(--bg3);border-radius:var(--r)"></div><div id="baInstr" style="font-size:12px;color:var(--text3);margin-bottom:14px"></div><div class="ffoot"><button class="btn btn-r" onclick="closeOv('mBA')">Cerrar</button><button class="btn btn-a" id="baOverrideBtn" style="display:none" onclick="blOverride()">⚠️ Autorizar (Sup)</button></div></div></div>
<!-- MODAL LANG -->
<div class="ov" id="mLangPicker"><div class="modal modal-sm"><div class="mhdr"><div class="mttl">🌍 Idioma</div><button class="btn-x" onclick="closeOv('mLangPicker')">✕</button></div><div style="font-size:12px;color:var(--text3);margin-bottom:10px">Elige tu idioma. Se guarda en tu perfil.</div><div class="lang-grid" id="langGrid" style="max-height:240px"></div><div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mLangPicker')">Cancelar</button><button class="btn btn-p" onclick="confirmLang()">✓ Confirmar</button></div></div></div>
<!-- MODAL CAMARA OCR -->
<div class="ov" id="mCam"><div class="modal"><div class="mhdr"><div class="mttl">📷 Escanear Matrícula</div><button class="btn-x" onclick="closeCam()">✕</button></div><div style="position:relative"><video id="camFeed" autoplay playsinline muted></video><canvas id="camCanvas" style="display:none"></canvas></div><div id="camResult" style="margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:900;text-align:center;min-height:30px;color:var(--blue)"></div><div id="camStatus" style="font-size:11px;color:var(--text3);text-align:center;margin-top:4px"></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-t" style="flex:1" onclick="captureOCR()">📸 Capturar</button><button class="btn btn-g" id="btnCamUse" style="display:none" onclick="useCamResult()">✓ Usar</button></div><div style="margin-top:8px;text-align:center"><input type="file" id="cameraInput" accept="image/*" capture="environment" style="display:none" onchange="processCameraCapture(this)"><button class="btn btn-gh btn-sm" onclick="document.getElementById('cameraInput').click()">📁 Elegir imagen</button></div></div></div>
<!-- APP HEADER -->

</div>
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
    analytics:'renderAnalytics', vehiculos:'renderVehiculos', auditoria:'renderAuditoria',
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
