// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/operator.js
// CSS y HTML 100% extraidos de v6. Escaner fiel.
// Backend: Firestore en lugar de localStorage/Firebase RTDB
// ═══════════════════════════════════════════════════════════

import { AppState }                from '../state.js';
import { localDB }                 from '../db.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { logout }                  from '../auth.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';
const HALLS_DEFAULT = ['1','2A','2B','3A','3B','4','5','6','7','8','CS'];

let _unsubQ     = null;
let _entries    = [];
let _activeTab  = 'ingresos';
let _sub        = 'lista';
let _hallFilter = '';
let _fecha      = '';
let _soloActivos = true;
let _q          = '';
let _fieldCfg   = {};
let _perms      = {};
let _eventHalls = HALLS_DEFAULT;
let _afOn       = true;
let _posOn      = true;

// ── Init ─────────────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  const ev   = await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent', ev);
  if (user.gateId) AppState.set('currentGate', { id: user.gateId });
  _eventHalls = ev?.halls?.length ? ev.halls
    : ev?.recintoHalls?.length ? ev.recintoHalls
    : HALLS_DEFAULT;
  await _loadCfg(user.eventId, user.uid);
  const root = document.getElementById('app-root');
  root.innerHTML = _injectCSS() + _shellHTML(user, ev);
  _bindShell();
  _subscribeQueue();
}

async function _loadCfg(evId, uid) {
  try {
    const db = getDB();
    const { doc, getDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const cs = await getDoc(doc(db,'events',evId,'config','fields'));
    _fieldCfg = cs.exists() ? cs.data() : _defCfg();
    const os  = await getDoc(doc(db,'events',evId,'operators',uid));
    _perms = os.exists() ? (os.data().perms||_defPerms(os.data().role)) : _defPerms('operator');
  } catch { _fieldCfg=_defCfg(); _perms=_defPerms('operator'); }
}

function _defCfg() {
  return {
    ingresos:{
      remolque:{vis:true},tipoVeh:{vis:true,req:true},descarga:{vis:true,req:true},
      llamador:{vis:true},empresa:{vis:true,req:true},montador:{vis:true},
      expositor:{vis:true},hall:{vis:true},stand:{vis:true},nombre:{vis:true},
      apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},
      pasaporte:{vis:false},fechaNac:{vis:false},pais:{vis:false},
    },
    referencia:{
      remolque:{vis:true},numEjes:{vis:true},tipoMaq:{vis:true},
      empresa:{vis:true,req:true},hall:{vis:true},stand:{vis:true},llamador:{vis:true},
      nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},
      comentario:{vis:true},pasaporte:{vis:false},fechaNac:{vis:false},
    }
  };
}

function _defPerms(role) {
  const adm = role==='admin'||role==='supervisor';
  return {
    canEdit:true,canDelete:adm,canPrint:true,canExport:adm,
    canViewAgenda:adm,canEditAgenda:adm,canViewEmbalaje:adm,
    canBlacklist:adm,canConfigFields:role==='admin',canClean:adm,canVaciar:role==='admin',
  };
}

// ══════════════════════════════════════════════════════════════
// CSS EXACTO DE v6 — copiado del INDEX.html original
// ══════════════════════════════════════════════════════════════
function _injectCSS() {
  return `<style>
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--pll:#f5f3ff;--teal:#0e7490;--r:6px;--r2:10px;--r3:16px;--sh:0 1px 3px rgba(0,0,0,.06);--sh2:0 4px 16px rgba(0,0,0,.1)}
[data-theme="dark"]{--bg:#0f172a;--bg2:#1e293b;--bg3:#0f172a;--bg4:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;--text4:#475569;--border:#1e293b;--border2:#334155;--bll:#1e3a5f33;--gll:#00b89a15;--rll:#7f1d1d33;--all:#451a0333;--pll:#2e106533;--sh:0 1px 3px rgba(0,0,0,.4);--sh2:0 8px 32px rgba(0,0,0,.6)}
[data-theme="soft"]{--bg:#fdf6e3;--bg2:#fffef9;--bg3:#f5ead0;--bg4:#eddfc0;--text:#2c2510;--text2:#5c4a1e;--text3:#8a7340;--text4:#b09060;--border:#e8d9b0;--border2:#d4c088;--bll:#e8f0ff;--gll:#e6f7ee;--rll:#fff1f1;--all:#fff8e1;--pll:#f3e8ff;--sh:0 1px 3px rgba(0,0,0,.06);--sh2:0 4px 16px rgba(0,0,0,.12)}
[data-theme="contrast"]{--bg:#000;--bg2:#111;--bg3:#0a0a0a;--bg4:#1a1a1a;--text:#fff;--text2:#e0e0e0;--text3:#aaa;--text4:#888;--border:#333;--border2:#555;--bll:#001a3a;--gll:#001a0d;--rll:#1a0000;--all:#1a1000;--pll:#1a0033;--sh:0 2px 8px rgba(0,0,0,.8);--sh2:0 8px 32px rgba(0,0,0,.9)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,-apple-system,sans-serif;font-size:15px;min-height:100vh;-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:inherit;font-size:14px;outline:none;width:100%;padding:8px 12px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg2);color:var(--text);transition:border-color .15s;-webkit-appearance:none;appearance:none}
input[type=date]{height:30px;font-size:11px;padding:4px 7px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.07)}
textarea{resize:vertical;min-height:60px}
button{cursor:pointer;border:none;border-radius:var(--r);transition:all .15s;font-weight:600;white-space:nowrap;font-family:inherit;display:inline-flex;align-items:center;gap:4px;justify-content:center}
button:active{transform:scale(.97)}
button:disabled{opacity:.45;cursor:not-allowed;transform:none}
#appHdr{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 12px;height:44px;display:flex;align-items:center;position:sticky;top:0;z-index:200}
[data-theme="dark"] #appHdr,[data-theme="contrast"] #appHdr{background:#030812;border-bottom-color:#1e293b}
[data-theme="soft"] #appHdr{background:#f0e8d0;border-bottom-color:#d4c088}
.logo{display:flex;align-items:center;gap:7px;flex-shrink:0}
.logo-txt{font-size:16px;font-weight:900;letter-spacing:-.4px;white-space:nowrap;color:var(--text)}
.logo-txt span{color:var(--text3);font-weight:400}
.hdr-cnt-wrap{display:flex;align-items:center;gap:4px;flex:1;justify-content:center;overflow-x:auto;padding:0 6px;scrollbar-width:none}
.hdr-cnt{display:flex;flex-direction:column;align-items:center;padding:3px 7px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg3);min-width:40px;flex-shrink:0}
.hdr-cv{font-size:14px;font-weight:900;line-height:1;font-family:'JetBrains Mono',monospace;color:var(--text)}
.hdr-cl{font-size:8px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:1px}
.hdr-right{display:flex;align-items:center;gap:3px;flex-shrink:0}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}.sd-y{background:#f59e0b}.sd-r{background:var(--red)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.tabs-bar{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;position:sticky;top:44px;z-index:99;scrollbar-width:none;justify-content:center;flex-wrap:wrap}
.tabs-bar::-webkit-scrollbar{display:none}
.btn-tab{padding:4px 10px;border-radius:20px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;border:none;white-space:nowrap;flex-shrink:0;transition:all .15s;display:inline-flex;align-items:center;gap:5px}
.btn-tab:hover{color:var(--text);background:rgba(37,99,235,.07)}
.btn-tab.active{background:linear-gradient(90deg,#2563eb,#cbd5e1);color:#fff;font-weight:700}
.app-main{padding:6px 10px;max-width:1400px;margin:0 auto}
.btn{padding:4px 11px;font-size:12px;font-weight:600;border-radius:20px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:none;transition:all .15s}
.btn-sm{padding:3px 9px;font-size:12px;border-radius:20px}
.btn-xs{padding:2px 8px;font-size:10px;border-radius:20px}
.btn-p{background:#2563eb;color:#fff;border:none}.btn-p:hover{background:#1d4ed8}
.btn-s{background:var(--bg3);color:var(--text);border:1px solid var(--border2)}.btn-s:hover{background:var(--bg4)}
.btn-g{background:var(--green);color:#fff}
.btn-gh{background:var(--bg2);color:var(--text2);border:1px solid var(--border)}.btn-gh:hover{background:var(--bg3);border-color:var(--border2)}
.btn-a{background:var(--amber);color:#fff}
.btn-success{background:#f0fdf4;color:var(--green);border:1px solid #bbf7d0}
.btn-edit{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.btn-danger{background:var(--bg3);color:var(--text2);border:1px solid var(--border2)}
.btn-warning{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.tbl-wrap{overflow-x:auto;border-radius:var(--r);border:1.5px solid var(--border);box-shadow:var(--sh)}
.dtbl{width:100%;border-collapse:collapse;font-size:13px;color:var(--text)}
.dtbl th{background:var(--bg3);padding:7px 10px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dtbl td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dtbl tr:last-child td{border-bottom:none}
.dtbl tr:hover td{background:var(--bg3)}
.mchip{background:var(--text);color:var(--bg);font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 8px;border-radius:5px;letter-spacing:.5px;white-space:nowrap;display:inline-block}
.mchip-sm{background:var(--bg4);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid var(--border2);white-space:nowrap;display:inline-block}
.hbadge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:800;background:#dbeafe;color:#1e3a5f;white-space:nowrap}
.pill-g{display:inline-flex;align-items:center;gap:3px;background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px}
.pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer}
.pill-r{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.pill-hall{background:#dbeafe;color:#1e40af;border:1.5px solid #93c5fd;font-weight:700;border-radius:20px;padding:2px 8px;font-size:10px;cursor:pointer;display:inline-flex;align-items:center}.pill-hall:hover{background:#bfdbfe}.pill-hall.active{background:#3b82f6;color:#fff;border-color:#2563eb}
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:1fr 1fr 1fr}
@media(max-width:560px){.sg3{grid-template-columns:1fr 1fr}.sg2{grid-template-columns:1fr}}
.sbox{position:relative;flex:1;min-width:160px}.sbox input{padding:7px 10px 7px 30px;font-size:13px}
.sico{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px;pointer-events:none}
.card{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh);padding:14px}
.empty{text-align:center;padding:40px 20px;color:var(--text3)}.ei{font-size:32px;margin-bottom:4px}.et{font-size:14px;font-weight:700}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:14px;overflow-y:auto;backdrop-filter:blur(2px)}
.ov.open{display:flex}
@media(min-width:641px){.ov{align-items:center}}
.modal{background:var(--bg2);border-radius:var(--r3);box-shadow:var(--sh2);width:100%;max-width:600px;padding:20px;position:relative;max-height:90vh;overflow-y:auto}
.modal-lg{max-width:720px}
.mhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.mttl{font-size:17px;font-weight:800;color:var(--text)}
.btn-x{background:var(--bg3);border:1.5px solid var(--border);padding:4px 10px;border-radius:var(--r);font-size:15px;color:var(--text3);cursor:pointer}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px}
.fg{display:flex;flex-direction:column;gap:3px}.fg.s2{grid-column:1/-1}
.flbl{font-size:11px;font-weight:700;color:var(--text2)}
.freq{color:var(--red)}
.ffoot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg2);z-index:2}
.dr{position:absolute;top:100%;left:0;right:0;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r);z-index:200;max-height:180px;overflow-y:auto;box-shadow:var(--sh2);display:none}
.dr.open{display:block}
.dr-item{padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);font-size:12px}.dr-item:hover{background:var(--bg3)}
.s-PENDIENTE{background:#fffbeb;color:#92400e;border:1px solid #fde68a;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-LLEGADO{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-SALIDA{background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.toast-w{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:5px;pointer-events:none;min-width:180px;max-width:340px;width:90%}
.toast{background:#1e293b;color:#fff;padding:10px 16px;border-radius:var(--r2);font-size:13px;font-weight:700;box-shadow:var(--sh2);opacity:0;transform:translateY(8px);transition:all .25s;text-align:center}
.toast.show{opacity:1;transform:translateY(0)}
</style>`;
}

// ══════════════════════════════════════════════════════════════
// SHELL HTML — header + tabs exactos de v6
// ══════════════════════════════════════════════════════════════
function _shellHTML(user, ev) {
  const tabs = [
    {id:'ingresos',   lbl:'Ingresos',   svg:'<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/>'},
    {id:'referencia', lbl:'Referencia', svg:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>'},
    ...(_perms.canViewAgenda  ?[{id:'agenda',   lbl:'Agenda',   svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>'}]:[]),
    ...(_perms.canViewEmbalaje?[{id:'embalaje', lbl:'Embalaje', svg:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'}]:[]),
  ];

  return `
<div id="appHdr">
  <div style="display:flex;align-items:center;width:100%;max-width:1400px;margin:0 auto;gap:6px">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="22" height="22">
        <rect width="140" height="140" rx="28" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <span class="logo-txt">BeUnify<span>T</span></span>
      <span style="background:var(--bg3);border:1px solid var(--border2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:var(--text2);white-space:nowrap">${safeHtml(ev?.name||'Evento')}</span>
    </div>

    <div class="hdr-cnt-wrap">
      <div class="hdr-cnt"><span class="hdr-cv" id="cntHoy">0</span><span class="hdr-cl">HOY</span></div>
      <div class="hdr-cnt"><span class="hdr-cv" id="cntRecinto">0</span><span class="hdr-cl">RECINTO</span></div>
      <div class="hdr-cnt" style="border-color:var(--amber)"><span class="hdr-cv" id="cntRef" style="color:var(--amber)">0</span><span class="hdr-cl">REF.</span></div>
    </div>

    <div class="hdr-right">
      <div class="sync-pill" id="syncPill"><div class="sd sd-y" id="syncDot"></div></div>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 5px"></span>
      <span id="hdrUser" style="font-size:13px;font-weight:500;color:var(--text2)">${safeHtml(user.name)}</span>
      <span style="width:1px;height:20px;background:var(--border);display:inline-block;margin:0 5px"></span>
      <button class="btn btn-gh btn-sm" id="btnTheme" style="font-size:12px;border-radius:20px;padding:3px 9px">☀️ Tema</button>
      <button class="btn btn-gh btn-sm" id="btnLang" title="Idioma" style="font-size:14px;padding:3px 8px;border-radius:20px">🌐</button>
      <button class="btn btn-gh btn-sm" id="btnSaveDay" title="Exportar dia" style="font-size:14px;padding:3px 8px;border-radius:20px">💾</button>
      <button class="btn btn-gh btn-sm" id="btnLogout" style="border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
      </button>
    </div>
  </div>
</div>

<div class="tabs-bar" id="mainTabs">
  ${tabs.map(t=>`<button class="btn-tab${t.id===_activeTab?' active':''}" data-tab="${t.id}" onclick="window._opTab('${t.id}')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">${t.svg}</svg>${t.lbl}</button>`).join('')}
</div>

<div class="app-main" id="opContent"></div>
<div class="toast-w" id="toastWrap"></div>`;
}

// ══════════════════════════════════════════════════════════════
// RENDER TABLA — identica a v6 pixel a pixel
// ══════════════════════════════════════════════════════════════
function _renderTabla(tabId) {
  const isRef = tabId === 'referencia';
  let items = isRef
    ? _entries.filter(e=>e.tipo==='referencia')
    : _entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
  if (_q)           items=items.filter(e=>_matchQ(e,_q));
  if (_soloActivos) items=items.filter(e=>!e.salida);
  if (_hallFilter)  items=items.filter(e=>(e.hall||'')===_hallFilter||(e.halls||[]).includes(_hallFilter));
  if (_fecha)       items=items.filter(e=>(e.ts||'').startsWith(_fecha));
  items=items.sort((a,b)=>((b.ts||b.entrada||'')).localeCompare((a.ts||a.entrada||'')));

  const btnAdd = isRef
    ? `<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openModal('referencia')">+ Referencia</button>`
    : `<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openModal('ingresos')">+ Ingreso</button>`;

  const cnt = document.getElementById('opContent');
  if (!cnt) return;

  cnt.innerHTML = `
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:nowrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
  ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(_perms.canConfigFields?[['campos','⚙ Campos']]:[])]
    .map(([s,l])=>`<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._opSub('${s}')">${l}</button>`).join('')}
  <span style="flex:1;min-width:8px"></span>
  ${_perms.canEdit?btnAdd:''}
  ${_perms.canEdit?`<button class="btn btn-sm btn-gh" onclick="window._opToggleAF()" id="btnAF" style="flex-shrink:0;border-radius:20px">⚡ ${_afOn?'ON':'OFF'}</button>`:''}
  ${_perms.canEdit?`<button class="btn btn-sm btn-gh" onclick="window._opTogglePos()" id="btnPos" style="flex-shrink:0;border-radius:20px">🔢 ${_posOn?'ON':'OFF'}</button>`:''}
  <button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="window._opImportar()">📥 Importar</button>
  <button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opPlantilla()">📋 Plantilla</button>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._exportExcel('${tabId}')">⬇ Excel</button>`:''}
  ${_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._limpiarTab()">🗑 Limpiar</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._vaciarTab()">💥 Vaciar</button>`:''}
</div>

<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
  <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Pos, matrícula, nombre..." value="${safeHtml(_q)}" oninput="window._opQ(this.value)"></div>
  <input type="date" value="${_fecha}" oninput="window._opFecha(this.value)" style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px">
  <span class="pill" style="border:1.5px solid ${_soloActivos?'var(--blue)':'var(--border)'};background:${_soloActivos?'var(--blue)':'var(--bg2)'};color:${_soloActivos?'#fff':'var(--text3)'};flex-shrink:0" onclick="window._opActivos()">Solo activos</span>
  ${_q||_fecha||_hallFilter?`<span class="pill pill-r" onclick="window._opClearFilters()" style="flex-shrink:0">✕</span>`:''}
  <span style="font-size:10px;color:var(--text3);flex-shrink:0">${items.length} reg.</span>
</div>

<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
  <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!_hallFilter?'#7dd3fc':'#93c5fd'};background:${!_hallFilter?'#e0f2fe':'#dbeafe'};color:${!_hallFilter?'#0369a1':'#1e40af'};cursor:pointer" onclick="window._opHall('')">Todos</span>
  ${_eventHalls.map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${_hallFilter===h?'#3b82f6':'#dbeafe'};color:${_hallFilter===h?'#fff':'#1e40af'};border:1.5px solid ${_hallFilter===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="window._opHall('${h}')">${h}</span>`).join('')}
</div>

${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th style="width:40px">#</th>
  <th style="width:${isRef?'130px':'110px'}">${isRef?'Referencia':'Matrícula'}</th>
  ${isRef?'<th style="width:110px">Matrícula</th>':''}
  <th>Llamador</th>
  <th>${isRef?'Empresa':'Ref'}</th>
  <th>Conductor/Empresa</th>
  <th>Tel.</th>
  <th>Hall</th>
  <th>Stand</th>
  <th style="font-size:10px;width:80px">Evento</th>
  <th>Estado</th>
  <th>Entrada</th>
  <th>Acc.</th>
</tr></thead><tbody>
${items.map((i,idx)=>`<tr>
  <td style="font-weight:700;color:var(--text3)">${i.pos||items.length-idx}</td>
  <td>${isRef
    ?`<span style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'–')}</span>`
    :`<span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}`}
  </td>
  ${isRef?`<td><span class="mchip" style="cursor:pointer;font-size:11px" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}</td>`:''}
  <td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>
  <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${isRef?safeHtml(i.empresa||'–'):safeHtml(i.referencia||'–')}</td>
  <td><b style="font-size:12px">${safeHtml(((i.nombre||'')+' '+(i.apellido||'')).trim()||'–')}</b>${i.empresa&&!isRef?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.empresa)}</span>`:''}</td>
  <td style="font-size:11px">${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(i.telefono)}</a>`:'–'}</td>
  <td>${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:(i.halls?.length?`<span class="hbadge">${safeHtml(i.halls[0])}</span>`:'–')}</td>
  <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
  <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml((i.eventoNombre||'–').slice(0,12))}</td>
  <td>${!i.salida?'<span class="pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}</td>
  <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts||i.entrada)}</td>
  <td><div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">
    <div style="display:flex;gap:2px">
      ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${i.id}')" title="Imprimir" style="border-radius:50%;width:26px;height:26px;padding:0">🖨</button>`:''}
      ${_perms.canPrint?`<button class="btn btn-xs" onclick="window._opPrintTrq('${i.id}')" title="Troquelado" style="background:#7c3aed;color:#fff;border-radius:50%;width:26px;height:26px;padding:0">✂</button>`:''}
      ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${i.id}')" style="border-radius:50%;width:26px;height:26px;padding:0">✏️</button>`:''}
    </div>
    ${!i.salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${i.id}')" style="border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">↩ Salida</button>`:''}
    ${i.salida&&_perms.canEdit?`<button class="btn btn-success btn-xs" onclick="window._opReactivar('${i.id}')" style="border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">↺</button>`:''}
    ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${i.id}')" style="border-radius:50%;width:26px;height:26px;padding:0">🗑</button>`:''}
  </div></td>
</tr>`).join('')}
</tbody></table></div>`
:`<div class="empty"><div class="ei">${isRef?'📋':'🚛'}</div><div class="et">Sin ${isRef?'referencias':'ingresos'} registrados</div></div>`}`;
}

// ══════════════════════════════════════════════════════════════
// MODAL NUEVO INGRESO / REFERENCIA — identico a v6
// ══════════════════════════════════════════════════════════════
function _renderModal(tipo, editEntry) {
  const isRef = tipo==='referencia';
  const cfg   = isRef?(_fieldCfg.referencia||_defCfg().referencia):(_fieldCfg.ingresos||_defCfg().ingresos);
  const e     = editEntry||{};
  document.getElementById('_opModal')?.remove();
  const modal = document.createElement('div');
  modal.id='_opModal';
  modal.className='ov open';
  modal.innerHTML=`
<div class="modal modal-lg">
  <div class="mhdr">
    <div class="mttl">${isRef?'📋 Referencia / Booking':'🚛 Nuevo Ingreso'}</div>
    <button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button>
  </div>

  ${isRef?`<div class="fg s2" style="margin-bottom:8px">
    <span class="flbl">Referencia / Booking <span class="freq">*</span></span>
    <div style="position:relative">
      <input id="mRef" value="${safeHtml(e.referencia||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;text-transform:uppercase;border-color:var(--amber)" placeholder="REF-XXXXXX" autocomplete="off" oninput="this.value=this.value.toUpperCase();window._searchRefAC(this.value)">
      <div id="mRefAC" class="dr"></div>
    </div>
    <div id="mRefMatch" style="display:none;margin-top:4px;padding:6px 10px;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);font-size:12px;font-weight:700;color:var(--green)"></div>
  </div>`:''}

  <div class="fgrid">
    <div class="fg s2">
      <span class="flbl">Matrícula${isRef?'':' <span class="freq">*</span>'}</span>
      <div style="position:relative">
        <input id="mMat" value="${safeHtml(e.matricula||e.mat||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:16px" placeholder="🔍 Matrícula..." autocomplete="off" oninput="this.value=this.value.toUpperCase();window._checkBL(this.value)">
      </div>
      <div id="mBlWarn" style="display:none;margin-top:4px;padding:8px 10px;background:var(--rll);border:2px solid var(--red);border-radius:var(--r);font-size:12px;font-weight:700;color:var(--red)"></div>
    </div>
    ${_fv(cfg,'remolque',`<div class="fg"><span class="flbl">Remolque</span><input id="mRem" value="${safeHtml(e.remolque||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    ${!isRef?_fv(cfg,'tipoVeh',`<div class="fg s2"><span class="flbl">Tipo vehículo <span class="freq">*</span></span><div style="display:flex;gap:4px"><button type="button" class="btn btn-gh btn-sm" id="tvA" onclick="window._tgl('mTipoVeh','furgoneta',this,document.getElementById('tvB'))" style="flex:1">🚐 A Furgoneta</button><button type="button" class="btn btn-gh btn-sm" id="tvB" onclick="window._tgl('mTipoVeh','camion',this,document.getElementById('tvA'))" style="flex:1">🚚 B Camión</button></div><input type="hidden" id="mTipoVeh" value="${safeHtml(e.tipo||'')}"></div>`):''}
    ${!isRef?_fv(cfg,'descarga',`<div class="fg s2"><span class="flbl">Servicio descarga/carga <span class="freq">*</span></span><div style="display:flex;gap:4px"><button type="button" class="btn btn-gh btn-sm" id="dcH" onclick="window._tgl('mDescarga','mano',this,document.getElementById('dcF'))" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-gh btn-sm" id="dcF" onclick="window._tglFork()" style="flex:1">🏗 Forklift → Ref</button></div><input type="hidden" id="mDescarga" value="${safeHtml(e.descarga||'')}"></div>`):''}
    ${isRef?_fv(cfg,'numEjes',`<div class="fg"><span class="flbl">Nº ejes</span><div style="display:flex;gap:3px">${['5','6','7+'].map(n=>`<button type="button" class="btn btn-gh btn-sm" data-v="${n}" onclick="window._tglEje(this)" style="flex:1">${n}</button>`).join('')}</div><input type="hidden" id="mEjes" value="${safeHtml(e.numEjes||'')}"></div>`):''}
    ${isRef?_fv(cfg,'tipoMaq',`<div class="fg"><span class="flbl">Maquinaria</span><select id="mMaq"><option value="">--</option><option value="forklift"${e.maquinaria==='forklift'?' selected':''}>🏗 Forklift</option><option value="grua"${e.maquinaria==='grua'?' selected':''}>🏗 Grúa</option><option value="plataforma"${e.maquinaria==='plataforma'?' selected':''}>🔼 Plataforma</option></select></div>`):''}
    ${_fv(cfg,'empresa',`<div class="fg"><span class="flbl">Empresa${_req(cfg,'empresa')}</span><input id="mEmp" value="${safeHtml(e.empresa||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    ${!isRef?_fv(cfg,'montador',`<div class="fg"><span class="flbl">Montador</span><input id="mMontador" value="${safeHtml(e.montador||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
    ${!isRef?_fv(cfg,'expositor',`<div class="fg"><span class="flbl">Expositor</span><input id="mExpositor" value="${safeHtml(e.expositor||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
    ${_fv(cfg,'llamador',`<div class="fg"><span class="flbl">Llamador</span><input id="mLlamador" value="${safeHtml(e.llamador||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    <div class="fg"><span class="flbl">Hall / Pabellón</span>
      <select id="mHall"><option value="">--</option>${_eventHalls.map(h=>`<option value="${h}"${e.hall===h?' selected':''}>${h}</option>`).join('')}</select>
    </div>
    <div class="fg"><span class="flbl">Stand</span><input id="mStand" value="${safeHtml(e.stand||'')}" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
    <div style="grid-column:1/-1;border-top:2px solid var(--border2);margin:4px 0;padding-top:8px"><span style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:1px">👤 Datos del conductor</span></div>
    ${_fv(cfg,'nombre',`<div class="fg"><span class="flbl">Nombre</span><input id="mNom" value="${safeHtml(e.nombre||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    ${_fv(cfg,'apellido',`<div class="fg"><span class="flbl">Apellido</span><input id="mApe" value="${safeHtml(e.apellido||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    ${_fv(cfg,'telefono',`<div class="fg"><span class="flbl">Teléfono</span><div style="display:flex;gap:4px"><input id="mTelP" value="${safeHtml(e.telPais||'+34')}" placeholder="+34" style="width:80px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:12px"><input id="mTel" value="${safeHtml(e.telefono||'')}" type="tel"></div></div>`)}
    ${_fv(cfg,'idioma',`<div class="fg"><span class="flbl">Idioma conductor</span><select id="mIdioma">${_idOpts(e.idioma)}</select></div>`)}
    ${_fv(cfg,'pasaporte',`<div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="mPas" value="${safeHtml(e.pasaporte||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
    ${_fv(cfg,'fechaNac',`<div class="fg"><span class="flbl">Fecha nacimiento</span><input id="mFechaNac" value="${safeHtml(e.fechaNac||'')}" type="date"></div>`)}
    ${_fv(cfg,'pais',`<div class="fg"><span class="flbl">País</span><input id="mPais" value="${safeHtml(e.pais||'')}"></div>`)}
    ${_fv(cfg,'comentario',`<div class="fg s2"><span class="flbl">Comentario</span><textarea id="mComent" rows="2">${safeHtml(e.comentario||'')}</textarea></div>`)}
  </div>

  <div class="ffoot">
    <button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button>
    <button class="btn ${isRef?'btn-a':'btn-p'}" onclick="window._submitModal('${tipo}','${e.id||''}')">
      ${isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso'}
    </button>
  </div>
</div>`;
  document.body.appendChild(modal);
  // Sincronizar toggles si hay valores
  if (e.tipo==='furgoneta')  { document.getElementById('tvA')?.classList.add('btn-p'); }
  if (e.tipo==='camion')     { document.getElementById('tvB')?.classList.add('btn-p'); }
  if (e.descarga==='mano')   { document.getElementById('dcH')?.classList.add('btn-p'); }
  if (e.descarga==='forklift'){ document.getElementById('dcF')?.classList.add('btn-a'); }
  if (e.numEjes) {
    document.querySelectorAll('#_opModal [data-v]').forEach(b=>{
      if(b.dataset.v===e.numEjes) b.classList.add('btn-a');
    });
  }
  setTimeout(()=>document.getElementById(isRef?'mRef':'mMat')?.focus(), 50);
}

// ══════════════════════════════════════════════════════════════
// SUBMIT
// ══════════════════════════════════════════════════════════════
window._submitModal = async function(tipo, editId) {
  const isRef = tipo==='referencia';
  const mat   = normalizePlate(_v('mMat'));
  const ref   = (_v('mRef')||'').trim().toUpperCase();
  if (isRef&&!ref)  { toast('La referencia es obligatoria','var(--red)'); return; }
  if (!mat&&!isRef) { toast('La matrícula es obligatoria','var(--red)'); return; }
  if (!isRef&&_v('mDescarga')==='forklift') {
    if (!confirm('Este vehículo usa forklift — debería ir por Referencia.\n¿Registrar como Ingreso de todas formas?')) return;
  }
  const user=AppState.get('currentUser');
  const btn =document.querySelector('#_opModal .btn-p,#_opModal .btn-a');
  if (btn){btn.disabled=true;btn.textContent='Guardando...';}
  try {
    const entry={
      matricula:mat||'—', referencia:ref||null,
      remolque:_v('mRem'), tipo:isRef?'referencia':(_v('mTipoVeh')||'ingreso'),
      descarga:_v('mDescarga'), numEjes:_v('mEjes'), maquinaria:_v('mMaq'),
      empresa:_v('mEmp'), montador:_v('mMontador'), expositor:_v('mExpositor'),
      llamador:_v('mLlamador'), hall:_v('mHall'), stand:_v('mStand'),
      nombre:_v('mNom'), apellido:_v('mApe'),
      conductor:(_v('mNom')+' '+_v('mApe')).trim(),
      telPais:_v('mTelP'), telefono:_v('mTel'), idioma:_v('mIdioma'),
      pasaporte:_v('mPas'), fechaNac:_v('mFechaNac'), pais:_v('mPais'),
      comentario:_v('mComent'),
      operadorId:user.uid, operador:user.name,
      eventoNombre:AppState.get('currentEvent')?.name||'',
      pos:_entries.length+1,
    };
    if (editId) {
      const db=getDB();
      const {doc,updateDoc}=await import(`${FB_CDN}/firebase-firestore.js`);
      await updateDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',editId),entry);
    } else {
      await fsGate.registerEntry(user.eventId,user.gateId||'puerta-1',entry);
      if (isRef&&mat) _linkAgenda(ref,mat);
    }
    document.getElementById('_opModal')?.remove();
    toast(isRef?`📋 ${ref}${mat?' · '+mat:''} registrado`:`✅ ${mat} registrado`,isRef?'var(--amber)':'var(--green)');
  } catch(err){
    console.error('[Op]',err);
    toast('Error al guardar','var(--red)');
    if(btn){btn.disabled=false;btn.textContent=isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso';}
  }
};

// ══════════════════════════════════════════════════════════════
// FIRESTORE SUBSCRIPCION
// ══════════════════════════════════════════════════════════════
function _subscribeQueue(){
  const user=AppState.get('currentUser');
  if(_unsubQ)_unsubQ();
  _unsubQ=fsGate.subscribeQueue(
    user.eventId,user.gateId||'puerta-1',
    (entries)=>{_entries=entries;_updateCounters();_rerenderActive();},
    (err)=>{console.error('[Op]',err);_setSyncStatus('error');}
  );
  _setSyncStatus('ok');
}

function _updateCounters(){
  const hoy=new Date().toDateString();
  const hoyN=_entries.filter(e=>new Date(e.ts||e.entrada).toDateString()===hoy).length;
  const rec=_entries.filter(e=>!e.salida).length;
  const refs=_entries.filter(e=>e.tipo==='referencia'&&!e.salida).length;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('cntHoy',hoyN);s('cntRecinto',rec);s('cntRef',refs);
}

function _rerenderActive(){
  if(_activeTab==='ingresos')   _renderTabla('ingresos');
  if(_activeTab==='referencia') _renderTabla('referencia');
}

// ══════════════════════════════════════════════════════════════
// ACCIONES FILA
// ══════════════════════════════════════════════════════════════
window._opSalida=async function(id){
  if(!confirm('¿Confirmar salida?'))return;
  const user=AppState.get('currentUser');
  try{
    await fsGate.registerExit(user.eventId,user.gateId||'puerta-1',id,{operadorSalida:user.name});
    toast('Salida registrada','var(--blue)',1500);
  }catch{toast('Error al registrar salida','var(--red)');}
};
window._opReactivar=async function(id){
  if(!confirm('¿Reactivar este vehículo (anular salida)?'))return;
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{doc,updateDoc}=await import(`${FB_CDN}/firebase-firestore.js`);
    await updateDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id),{salida:null});
    toast('↺ Salida anulada','var(--amber)');
  }catch{toast('Error','var(--red)');}
};
window._opPrint=async function(id){
  try{const{printEntry}=await import('./print.js');const e=_entries.find(x=>x.id===id)||{id,matricula:'—'};await printEntry(e,AppState.get('currentEvent')?.name||'BeUnifyT');}
  catch{toast('Error al imprimir','var(--red)');}
};
window._opPrintTrq=function(){toast('Impresión troquelada — configura en Impresión','var(--purple)');};
window._opEdit=function(id){const e=_entries.find(x=>x.id===id);if(!e)return;_renderModal(e.tipo==='referencia'?'referencia':'ingresos',e);};
window._opDel=async function(id){
  if(!confirm('¿Eliminar este registro?'))return;
  const user=AppState.get('currentUser');
  try{const db=getDB();const{doc,deleteDoc}=await import(`${FB_CDN}/firebase-firestore.js`);await deleteDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id));toast('Eliminado','var(--amber)',1500);}
  catch{toast('Error al eliminar','var(--red)');}
};
window._opDetail=function(id){
  const e=_entries.find(x=>x.id===id);if(!e)return;
  alert([`Matrícula: ${e.matricula}`,`Empresa: ${e.empresa||'—'}`,`Ref: ${e.referencia||'—'}`,`Hall: ${e.hall||'—'}`,`Stand: ${e.stand||'—'}`,`Conductor: ${e.conductor||'—'}`,`Entrada: ${formatDateTime(e.ts||e.entrada)}`,`Salida: ${e.salida?formatDateTime(e.salida):'En recinto'}`].join('\n'));
};

// ══════════════════════════════════════════════════════════════
// AGENDA
// ══════════════════════════════════════════════════════════════
function _renderAgenda(){
  const cnt=document.getElementById('opContent');if(!cnt)return;
  cnt.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none">
  <span style="font-size:13px;font-weight:700">📅 Agenda de servicios</span>
  <span style="flex:1"></span>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._agExcel()">⬇ Excel</button>`:''}
</div>
<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
  <button class="btn btn-p btn-sm" onclick="window._agLoad('pendiente')">⏳ Pendientes</button>
  <button class="btn btn-gh btn-sm" onclick="window._agLoad('hoy')">📅 Hoy</button>
  <button class="btn btn-gh btn-sm" onclick="window._agLoad('todos')">Todos</button>
</div>
<div class="sbox" style="margin-bottom:8px"><span class="sico">🔍</span><input type="search" placeholder="Referencia, empresa, matrícula..." style="text-transform:uppercase" oninput="window._agSearch(this.value.toUpperCase())"></div>
<div id="agCnt" style="font-size:10px;color:var(--text3);margin-bottom:4px"></div>
<div id="agendaContent"><div class="empty"><div class="et">Cargando...</div></div></div>`;
  _agLoad('pendiente');
}

async function _agLoad(filtro='pendiente',q=''){
  const el=document.getElementById('agendaContent');
  const cnt=document.getElementById('agCnt');
  if(!el)return;
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{collection,getDocs,query,limit}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),limit(200)));
    let items=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(q)items=items.filter(i=>(i.referencia||'').includes(q)||(i.empresa||'').toUpperCase().includes(q)||(i.matricula||'').includes(q));
    if(filtro==='pendiente')items=items.filter(i=>i.estado!=='completado');
    if(filtro==='hoy'){const hoy=new Date().toISOString().slice(0,10);items=items.filter(i=>(i.fecha||'').slice(0,10)===hoy);}
    if(cnt)cnt.textContent=items.length+' servicios';
    if(!items.length){el.innerHTML='<div class="empty"><div class="et">Sin servicios</div></div>';return;}
    el.innerHTML=`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Referencia</th><th>Empresa</th><th>Hall/Stand</th><th>Fecha</th><th>Matrícula</th><th>Estado</th></tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--amber)">${safeHtml(i.referencia||'—')}</td>
      <td><b>${safeHtml(i.empresa||'—')}</b></td>
      <td style="font-size:11px">${safeHtml(i.hall||'')} ${safeHtml(i.stand||'')}</td>
      <td style="font-size:11px">${safeHtml(i.fecha||'—')}</td>
      <td>${i.matricula?`<span class="mchip-sm">${safeHtml(i.matricula)}</span>`:'<span style="color:var(--text4);font-size:11px">sin mat.</span>'}</td>
      <td><span class="s-${i.estado||'PENDIENTE'}">${safeHtml(i.estado||'PENDIENTE')}</span></td>
    </tr>`).join('')}
    </tbody></table></div>`;
  }catch{el.innerHTML=`<div class="empty"><div class="et" style="color:var(--red)">Error cargando agenda</div></div>`;}
}

window._agLoad=_agLoad;
window._agSearch=(q)=>_agLoad('todos',q);
window._agExcel=()=>toast('Exportar agenda — disponible en admin','var(--blue)');

// ══════════════════════════════════════════════════════════════
// EMBALAJE
// ══════════════════════════════════════════════════════════════
function _renderEmbalaje(){
  const cnt=document.getElementById('opContent');if(!cnt)return;
  cnt.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px">
  <span style="font-size:13px;font-weight:700">📦 Control de Embalaje</span>
</div>
<div class="card">
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="eMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Conductor fijo</span><input id="eCond" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Tipo movimiento <span class="freq">*</span></span>
      <div style="display:flex;gap:4px">
        <button type="button" class="btn btn-gh btn-sm" id="eR" onclick="window._tgl('eTipo','retirada',this,document.getElementById('eD'))" style="flex:1">📤 Retirada vacíos</button>
        <button type="button" class="btn btn-gh btn-sm" id="eD" onclick="window._tgl('eTipo','devolucion',this,document.getElementById('eR'))" style="flex:1">📥 Devolución material</button>
      </div><input type="hidden" id="eTipo">
    </div>
    <div class="fg"><span class="flbl">Material</span><input id="eMat2" placeholder="Palés, jaulas, cajas..."></div>
    <div class="fg"><span class="flbl">Cantidad</span><input id="eCant" type="number" min="1"></div>
    <div class="fg"><span class="flbl">Origen</span><input id="eOrig" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Destino</span><input id="eDest" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Nota / Incidencia</span><textarea id="eNota" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._submitEmb()">📦 Registrar movimiento</button></div>
</div>`;
}

window._submitEmb=async function(){
  const mat=normalizePlate(document.getElementById('eMat')?.value);
  const tipo=document.getElementById('eTipo')?.value;
  if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
  if(!tipo){toast('Selecciona el tipo de movimiento','var(--red)');return;}
  const user=AppState.get('currentUser');
  try{
    await fsGate.registerEntry(user.eventId,user.gateId||'puerta-1',{
      matricula:mat,tipo:'embalaje',tipoMov:tipo,
      conductor:_v('eCond'),material:_v('eMat2'),cantidad:_v('eCant'),
      origen:_v('eOrig'),destino:_v('eDest'),nota:_v('eNota'),
      operadorId:user.uid,operador:user.name,
    });
    ['eMat','eCond','eMat2','eCant','eOrig','eDest','eNota','eTipo'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.querySelectorAll('#eR,#eD').forEach(b=>{b.className='btn btn-gh btn-sm';if(b.style)b.style.flex='1';});
    toast('📦 Movimiento registrado','var(--purple)');
  }catch{toast('Error al registrar','var(--red)');}
};

// ══════════════════════════════════════════════════════════════
// CONTROLES
// ══════════════════════════════════════════════════════════════
window._opTab=function(tab){
  _activeTab=tab;_sub='lista';
  document.querySelectorAll('.btn-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='ingresos')   _renderTabla('ingresos');
  if(tab==='referencia') _renderTabla('referencia');
  if(tab==='agenda')     _renderAgenda();
  if(tab==='embalaje')   _renderEmbalaje();
};
window._opSub=(s)=>{_sub=s;_rerenderActive();};
window._opQ=(q)=>{_q=q;_rerenderActive();};
window._opFecha=(f)=>{_fecha=f;_rerenderActive();};
window._opActivos=()=>{_soloActivos=!_soloActivos;_rerenderActive();};
window._opHall=(h)=>{_hallFilter=h;_rerenderActive();};
window._opClearFilters=()=>{_q='';_fecha='';_hallFilter='';_rerenderActive();};
window._openModal=(t)=>_renderModal(t);
window._opToggleAF=()=>{_afOn=!_afOn;_rerenderActive();};
window._opTogglePos=()=>{_posOn=!_posOn;_rerenderActive();};
window._opImportar=()=>toast('Importar Excel — disponible próximamente','var(--blue)');
window._opPlantilla=()=>toast('Plantilla Excel — disponible próximamente','var(--blue)');
window._limpiarTab=()=>toast('Limpiar — usa el admin panel','var(--amber)');
window._vaciarTab=()=>toast('Vaciar — requiere confirmación admin','var(--red)');
window._exportExcel=async function(tab){
  if(!_perms.canExport){toast('Sin permiso para exportar','var(--red)');return;}
  try{const{exportToExcel}=await import('./print.js');const items=tab==='referencia'?_entries.filter(e=>e.tipo==='referencia'):_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');await exportToExcel(items,`beunifyt-${tab}`);}
  catch{toast('Error al exportar','var(--red)');}
};

// Toggles tipo vehículo / descarga — como v6
window._tgl=function(hidId,val,activeBtn,otherBtn){
  document.getElementById(hidId).value=val;
  if(activeBtn){activeBtn.className=activeBtn.className.replace(/btn-[a-z]+(?=\s|$)/,'').trim();activeBtn.classList.add(val==='forklift'?'btn-a':'btn-p');}
  if(otherBtn){otherBtn.className=otherBtn.className.replace(/btn-[a-z]+(?=\s|$)/,'').trim();otherBtn.classList.add('btn-gh');}
};
window._tglFork=function(){
  const h=document.getElementById('dcH'),f=document.getElementById('dcF');
  if(h){h.className='btn btn-gh btn-sm';h.style.flex='1';}
  if(f){f.className='btn btn-a btn-sm';f.style.flex='1';}
  document.getElementById('mDescarga').value='forklift';
};
window._tglEje=function(btn){
  btn.parentElement.querySelectorAll('.btn').forEach(b=>{b.className='btn btn-gh btn-sm';b.style.flex='1';});
  btn.className='btn btn-a btn-sm';btn.style.flex='1';
  document.getElementById('mEjes').value=btn.dataset.v;
};

// Blacklist check
window._checkBL=async function(mat){
  if(!mat||mat.length<4)return;
  const warn=document.getElementById('mBlWarn');if(!warn)return;
  try{
    const user=AppState.get('currentUser');const db=getDB();
    const{collection,query,where,getDocs}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'blacklist'),where('matricula','==',mat.toUpperCase().trim())));
    if(!snap.empty){const bl=snap.docs[0].data();warn.innerHTML=`⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matrícula en lista negra')}`;warn.style.display='block';}
    else warn.style.display='none';
  }catch{warn.style.display='none';}
};

// Autocompletado referencia desde agenda
window._searchRefAC=async function(val){
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(!ac||!match||val.length<3){if(ac)ac.classList.remove('open');return;}
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{collection,query,where,getDocs,limit}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','>=',val),where('referencia','<=',val+'\uf8ff'),limit(5)));
    if(!snap.empty){
      const items=snap.docs.map(d=>({id:d.id,...d.data()}));
      ac.classList.add('open');
      ac.innerHTML=items.map(it=>`<div class="dr-item" onclick="window._fillRef(${JSON.stringify(it).replace(/"/g,'&quot;')})"><span style="font-weight:700;color:var(--amber)">${safeHtml(it.referencia)}</span> <span style="color:var(--text2)">${safeHtml(it.empresa||'—')}</span></div>`).join('');
    }else{ac.classList.remove('open');}
  }catch{if(ac)ac.classList.remove('open');}
};

window._fillRef=function(item){
  const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null)el.value=v;};
  sv('mRef',item.referencia);sv('mEmp',item.empresa);sv('mHall',item.hall);sv('mStand',item.stand);
  sv('mNom',item.conductor?.split(' ')[0]);sv('mApe',item.conductor?.split(' ').slice(1).join(' '));
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(ac)ac.classList.remove('open');
  if(match){match.innerHTML=`✅ Referencia en agenda · ${safeHtml(item.empresa||'')}${item.hall?' · Hall '+safeHtml(item.hall):''}`;match.style.display='block';}
};

async function _linkAgenda(ref,mat){
  try{
    const user=AppState.get('currentUser');const db=getDB();
    const{collection,query,where,getDocs,doc,updateDoc}=await import(`${FB_CDN}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','==',ref)));
    snap.docs.forEach(async d=>await updateDoc(doc(db,'events',user.eventId,'agenda',d.id),{matricula:mat,matriculaTs:new Date().toISOString()}));
  }catch{}
}

// ══════════════════════════════════════════════════════════════
// BIND SHELL
// ══════════════════════════════════════════════════════════════
function _bindShell(){
  document.getElementById('btnLogout')?.addEventListener('click',logout);
  document.getElementById('btnTheme')?.addEventListener('click',()=>{
    const themes=['default','dark','soft','contrast'];
    const curr=AppState.get('theme')||'default';
    const next=themes[(themes.indexOf(curr)+1)%themes.length];
    document.documentElement.setAttribute('data-theme',next);
    AppState.set('theme',next);
    toast(`Tema: ${next}`,'var(--blue)',1200);
  });
  document.getElementById('btnLang')?.addEventListener('click',()=>toast('Selector de idioma — próximamente','var(--blue)'));
  document.getElementById('btnSaveDay')?.addEventListener('click',()=>window._exportExcel(_activeTab==='referencia'?'referencia':'ingresos'));
  // Aplicar tema guardado
  const savedTheme=AppState.get('theme');
  if(savedTheme)document.documentElement.setAttribute('data-theme',savedTheme);
  _renderTabla('ingresos');
}

// ══════════════════════════════════════════════════════════════
// SYNC STATUS
// ══════════════════════════════════════════════════════════════
function _setSyncStatus(s){
  const dot=document.getElementById('syncDot');if(!dot)return;
  const m={ok:'sd-g',syncing:'sd-y',error:'sd-r'};
  dot.className=`sd ${m[s]||'sd-y'}`;
}

// ══════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════
function _v(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function _fv(cfg,key,html){return(!cfg[key]||cfg[key].vis===false)?'':html;}
function _req(cfg,key){return cfg[key]?.req?' <span class="freq">*</span>':'';}
function _matchQ(e,q){
  const s=q.toLowerCase();
  return`${e.pos||''} ${e.matricula||''} ${e.nombre||''} ${e.apellido||''} ${e.empresa||''} ${e.llamador||''} ${e.referencia||''} ${e.hall||''} ${(e.halls||[]).join(' ')} ${e.stand||''} ${e.remolque||''} ${e.comentario||''} ${e.telefono||''} ${e.conductor||''}`.toLowerCase().includes(s);
}
function _idOpts(sel=''){
  const langs=[['es','Español'],['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['pt','Português'],['nl','Nederlands'],['pl','Polski'],['ro','Română'],['ru','Русский'],['uk','Українська'],['cs','Čeština'],['sk','Slovenčina'],['hu','Magyar'],['bg','Български'],['hr','Hrvatski'],['tr','Türkçe'],['ar','العربية'],['zh','中文']];
  return`<option value="">--</option>`+langs.map(([v,l])=>`<option value="${v}"${sel===v?' selected':''}>${l}</option>`).join('');
}
