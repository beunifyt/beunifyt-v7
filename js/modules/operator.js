// BeUnifyT v7 — operator.js — Clon exacto de v6, todas las pestañas
import { AppState }                from '../state.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime } from '../utils.js';
import { logout }                  from '../auth.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
const HALLS_DEF = ['1','2A','2B','3A','3B','4','5','6','7','8','CS'];

let _unsub=null, _entries=[], _activeTab='ingresos', _sub='lista';
let _hall='', _fecha='', _activos=true, _q='';
let _cfg={}, _perms={}, _evHalls=HALLS_DEF, _af=true, _pos=true;

// ─── INIT ────────────────────────────────────────────────────
export async function initOperator() {
  const user=AppState.get('currentUser');
  const ev=await fsConfig.getEvent(user.eventId);
  AppState.set('currentEvent',ev);
  if(user.gateId) AppState.set('currentGate',{id:user.gateId});
  _evHalls=ev?.halls?.length?ev.halls:ev?.recintoHalls?.length?ev.recintoHalls:HALLS_DEF;
  await _loadCfg(user.eventId,user.uid);
  _injectCSS();
  const saved=localStorage.getItem('beu_theme')||'';
  if(saved&&saved!=='default') document.documentElement.setAttribute('data-theme',saved);
  document.getElementById('app-root').innerHTML=_shell(user,ev);
  _bind();
  _subscribe();
}

async function _loadCfg(eid,uid){
  try{
    const db=getDB();
    const{doc,getDoc}=await import(`${FB}/firebase-firestore.js`);
    const cs=await getDoc(doc(db,'events',eid,'config','fields'));
    _cfg=cs.exists()?cs.data():_defCfg();
    const os=await getDoc(doc(db,'events',eid,'operators',uid));
    _perms=os.exists()?(os.data().perms||_defPerms(os.data().role)):_defPerms('operator');
  }catch{_cfg=_defCfg();_perms=_defPerms('operator');}
}

function _defCfg(){return{ingresos:{remolque:{vis:true},tipoVeh:{vis:true,req:true},descarga:{vis:true,req:true},llamador:{vis:true},empresa:{vis:true,req:true},montador:{vis:true},expositor:{vis:true},hall:{vis:true},stand:{vis:true},nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},pasaporte:{vis:false},fechaNac:{vis:false},pais:{vis:false}},referencia:{remolque:{vis:true},numEjes:{vis:true},tipoMaq:{vis:true},empresa:{vis:true,req:true},hall:{vis:true},stand:{vis:true},llamador:{vis:true},nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},pasaporte:{vis:false},fechaNac:{vis:false}}};}
function _defPerms(r){const a=r==='admin'||r==='supervisor';return{canEdit:true,canDelete:a,canPrint:true,canExport:a,canViewAgenda:a,canEditAgenda:a,canViewEmbalaje:a,canBlacklist:a,canConfigFields:r==='admin',canClean:a,canVaciar:r==='admin'};}

// ─── CSS EN HEAD ─────────────────────────────────────────────
function _injectCSS(){
  if(document.getElementById('beu-css'))return;
  const s=document.createElement('style');s.id='beu-css';
  s.textContent=`
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--pll:#f5f3ff;--r:6px;--r2:10px;--r3:16px;--sh:0 1px 3px rgba(0,0,0,.06);--sh2:0 4px 16px rgba(0,0,0,.1)}
[data-theme=dark]{--bg:#0f172a;--bg2:#1e293b;--bg3:#0f172a;--bg4:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;--text4:#475569;--border:#1e293b;--border2:#334155;--bll:#1e3a5f33;--gll:#00b89a15;--rll:#7f1d1d33;--all:#451a0333;--pll:#2e106533;--sh:0 1px 3px rgba(0,0,0,.4);--sh2:0 8px 32px rgba(0,0,0,.6)}
[data-theme=soft]{--bg:#fdf6e3;--bg2:#fffef9;--bg3:#f5ead0;--bg4:#eddfc0;--text:#2c2510;--text2:#5c4a1e;--text3:#8a7340;--text4:#b09060;--border:#e8d9b0;--border2:#d4c088;--bll:#e8f0ff;--gll:#e6f7ee;--rll:#fff1f1;--all:#fff8e1;--pll:#f3e8ff}
[data-theme=contrast]{--bg:#000;--bg2:#111;--bg3:#0a0a0a;--bg4:#1a1a1a;--text:#fff;--text2:#e0e0e0;--text3:#aaa;--border:#333;--border2:#555}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:15px;min-height:100vh;-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:inherit;font-size:14px;outline:none;width:100%;padding:8px 12px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg2);color:var(--text);transition:border-color .15s;-webkit-appearance:none;appearance:none}
input[type=date]{height:30px;font-size:11px;padding:4px 7px;width:auto;min-width:110px;max-width:130px}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.07)}
textarea{resize:vertical;min-height:60px}
button{cursor:pointer;border:none;border-radius:var(--r);transition:all .15s;font-weight:600;white-space:nowrap;font-family:inherit;display:inline-flex;align-items:center;gap:4px;justify-content:center}
button:active{transform:scale(.97)}
button:disabled{opacity:.45;cursor:not-allowed;transform:none}

/* HEADER — siempre oscuro, logo nunca cambia */
#appHdr{background:#030812 !important;border-bottom:1px solid #1e293b !important;padding:0 12px;height:44px;display:flex;align-items:center;position:sticky;top:0;z-index:200}
[data-theme=soft] #appHdr{background:#4a3728 !important;border-bottom-color:#6b4f38 !important}

/* LOGO — colores fijos, nunca cambian con el tema */
.beu-logo-wrap{display:flex;align-items:center;gap:7px;flex-shrink:0}
.beu-brand{font-size:16px;font-weight:900;letter-spacing:-.4px;white-space:nowrap;color:#e2e8f0 !important;font-family:'Inter',system-ui,sans-serif}
.beu-brand-t{color:#64748b !important;font-weight:400}
.beu-ev-pill{background:#1e293b !important;border:1px solid #334155 !important;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:#94a3b8 !important;white-space:nowrap}
.beu-cnt-wrap{display:flex;align-items:center;gap:4px;flex:1;justify-content:center;overflow-x:auto;padding:0 6px;scrollbar-width:none}
.beu-cnt{display:flex;flex-direction:column;align-items:center;padding:3px 7px;border:1.5px solid #334155;border-radius:var(--r);background:#1e293b;min-width:40px;flex-shrink:0}
.beu-cv{font-size:14px;font-weight:900;line-height:1;font-family:'JetBrains Mono',monospace;color:#e2e8f0}
.beu-cl{font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin-top:1px}
.beu-right{display:flex;align-items:center;gap:3px;flex-shrink:0}
.beu-sep{width:1px;height:20px;background:#334155;display:inline-block;margin:0 4px}
.beu-user{font-size:13px;font-weight:500;color:#94a3b8}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid #334155;background:#1e293b;font-size:11px;font-weight:700;color:#64748b}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}.sd-y{background:#f59e0b}.sd-r{background:#e02424}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.beu-btn{padding:3px 9px;font-size:12px;border-radius:20px;background:#1e293b;border:1px solid #334155;color:#94a3b8;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.beu-btn:hover{background:#334155}

/* TABS */
.tabs-bar{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;position:sticky;top:44px;z-index:99;scrollbar-width:none;justify-content:center;flex-wrap:wrap}
.tabs-bar::-webkit-scrollbar{display:none}
.btn-tab{padding:4px 10px;border-radius:20px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;border:none;white-space:nowrap;flex-shrink:0;transition:all .15s;display:inline-flex;align-items:center;gap:5px}
.btn-tab:hover{color:var(--text);background:rgba(37,99,235,.07)}
.btn-tab.active{background:linear-gradient(90deg,#2563eb,#cbd5e1);color:#fff;font-weight:700}

/* CONTENIDO */
.app-main{padding:6px 10px;max-width:1400px;margin:0 auto}
.btn{padding:4px 11px;font-size:12px;font-weight:600;border-radius:20px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:none;transition:all .15s}
.btn-sm{padding:3px 9px;font-size:12px;border-radius:20px}
.btn-xs{padding:2px 8px;font-size:10px;border-radius:20px}
.btn-p{background:#2563eb;color:#fff}.btn-p:hover{background:#1d4ed8}
.btn-s{background:var(--bg3);color:var(--text);border:1px solid var(--border2)}.btn-s:hover{background:var(--bg4)}
.btn-gh{background:var(--bg2);color:var(--text2);border:1px solid var(--border)}.btn-gh:hover{background:var(--bg3)}
.btn-a{background:var(--amber);color:#fff}
.btn-g{background:var(--green);color:#fff}
.btn-success{background:#f0fdf4;color:var(--green);border:1px solid #bbf7d0}
.btn-edit{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.btn-danger{background:var(--bg3);color:var(--text2);border:1px solid var(--border2)}
.btn-warning{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.tbl-wrap{overflow-x:auto;border-radius:var(--r);border:1.5px solid var(--border);box-shadow:var(--sh)}
.dtbl{width:100%;border-collapse:collapse;font-size:13px;color:var(--text)}
.dtbl th{background:var(--bg3);padding:7px 10px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border);white-space:nowrap}
.dtbl td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dtbl tr:last-child td{border-bottom:none}
.dtbl tr:hover td{background:var(--bg3)}
.mchip{background:#0f172a;color:#f7f8fc;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 8px;border-radius:5px;letter-spacing:.5px;white-space:nowrap;display:inline-block}
[data-theme=dark] .mchip{background:#e2e8f0;color:#0f172a}
.mchip-sm{background:var(--bg4);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;border:1px solid var(--border2);white-space:nowrap;display:inline-block}
.hbadge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:800;background:#dbeafe;color:#1e3a5f;white-space:nowrap}
.pill-g{display:inline-flex;align-items:center;gap:3px;background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px}
.pill-amber{display:inline-flex;align-items:center;gap:3px;background:var(--all);color:var(--amber);border:1px solid #fde68a;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px}
.sbox{position:relative;flex:1;min-width:160px;max-width:300px}.sbox input{padding:7px 10px 7px 30px;font-size:13px}
.sico{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px;pointer-events:none}
.card{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh);padding:14px}
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:1fr 1fr 1fr}
@media(max-width:560px){.sg3{grid-template-columns:1fr 1fr}.sg2{grid-template-columns:1fr}}
.empty{text-align:center;padding:40px 20px;color:var(--text3)}.ei{font-size:32px;margin-bottom:4px}.et{font-size:14px;font-weight:700}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:none;align-items:flex-start;justify-content:center;padding:14px;overflow-y:auto;backdrop-filter:blur(2px)}
.ov.open{display:flex}
@media(min-width:641px){.ov{align-items:center}}
.modal{background:var(--bg2);border-radius:var(--r3);box-shadow:var(--sh2);width:100%;max-width:600px;padding:20px;max-height:90vh;overflow-y:auto}
.modal-lg{max-width:720px}
.mhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.mttl{font-size:17px;font-weight:800;color:var(--text)}
.btn-x{background:var(--bg3);border:1.5px solid var(--border);padding:4px 10px;border-radius:var(--r);font-size:15px;color:var(--text3);cursor:pointer}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px}
.fg{display:flex;flex-direction:column;gap:3px}.fg.s2{grid-column:1/-1}
.flbl{font-size:11px;font-weight:700;color:var(--text2)}.freq{color:var(--red)}
.ffoot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid var(--border);position:sticky;bottom:0;background:var(--bg2);z-index:2}
.dr{position:absolute;top:100%;left:0;right:0;background:var(--bg2);border:1.5px solid var(--border2);border-radius:var(--r);z-index:200;max-height:180px;overflow-y:auto;box-shadow:var(--sh2);display:none}
.dr.open{display:block}
.dr-item{padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);font-size:12px}.dr-item:hover{background:var(--bg3)}
.s-PENDIENTE{background:#fffbeb;color:#92400e;border:1px solid #fde68a;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-LLEGADO{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-completado{background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
`;
  document.head.appendChild(s);
}

// ─── SHELL ───────────────────────────────────────────────────
function _shell(user,ev){
  const tabs=[
    {id:'ingresos',  lbl:'Ingresos',  svg:'<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/>'},
    {id:'referencia',lbl:'Referencia',svg:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>'},
    ...(_perms.canViewAgenda?[{id:'agenda',  lbl:'Agenda',  svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>'}]:[]),
    ...(_perms.canViewEmbalaje?[{id:'embalaje',lbl:'Embalaje',svg:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>'}]:[]),
  ];
  return`
<div id="appHdr">
  <div style="display:flex;align-items:center;width:100%;max-width:1400px;margin:0 auto;gap:6px">
    <div class="beu-logo-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="22" height="22">
        <rect width="140" height="140" rx="28" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <span class="beu-brand">BeUnify<span class="beu-brand-t">T</span></span>
      <span class="beu-ev-pill">${safeHtml(ev?.name||'Evento')}</span>
    </div>
    <div class="beu-cnt-wrap">
      <div class="beu-cnt"><span class="beu-cv" id="cntHoy">0</span><span class="beu-cl">HOY</span></div>
      <div class="beu-cnt"><span class="beu-cv" id="cntRecinto">0</span><span class="beu-cl">RECINTO</span></div>
      <div class="beu-cnt" style="border-color:#7c4a00"><span class="beu-cv" id="cntRef" style="color:#f59e0b">0</span><span class="beu-cl">REF.</span></div>
    </div>
    <div class="beu-right">
      <div class="sync-pill" id="syncPill"><div class="sd sd-y" id="syncDot"></div></div>
      <span class="beu-sep"></span>
      <span class="beu-user" id="hdrUser">${safeHtml(user.name)}</span>
      <span class="beu-sep"></span>
      <button class="beu-btn" onclick="location.href='?dash'" title="Dashboard" style="font-size:13px">📊</button>
      <button class="beu-btn" onclick="location.href='?msg'" title="Mensajes" style="font-size:13px">💬</button>
      ${_perms.canConfigFields?`<button class="beu-btn" onclick="location.href='?admin'" title="Admin Panel" style="font-size:13px">⚙️</button>`:''}
      <span class="beu-sep"></span>
      <button class="beu-btn" id="btnTheme">☀️ Tema</button>
      <button class="beu-btn" id="btnLang" title="Idioma" style="font-size:14px;padding:3px 8px">🌐</button>
      <button class="beu-btn" id="btnSave" title="Exportar día" style="font-size:14px;padding:3px 8px">💾</button>
      <button class="beu-btn" id="btnDash" title="Dashboard" style="font-size:14px;padding:3px 8px">📊</button>
      <button class="beu-btn" id="btnMsg" title="Mensajes" style="font-size:14px;padding:3px 8px">💬</button>
      <button class="beu-btn" id="btnAdmin" title="Admin Panel" style="font-size:11px;font-weight:700;padding:3px 9px">⚙ Admin</button>
      <button class="beu-btn" id="btnLogout" style="font-weight:700">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
      </button>
    </div>
  </div>
</div>
<div class="tabs-bar" id="mainTabs">
  ${tabs.map(t=>`<button class="btn-tab${t.id===_activeTab?' active':''}" data-tab="${t.id}" onclick="window._opTab('${t.id}')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">${t.svg}</svg>${t.lbl}</button>`).join('')}
</div>
<div class="app-main" id="opContent"></div>`;
}

// ─── TOOLBAR COMUN ───────────────────────────────────────────
function _toolbar(tabId){
  const isRef=tabId==='referencia';
  const addBtn=isRef
    ?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;flex-shrink:0" onclick="window._openModal('referencia')">+ Referencia</button>`
    :`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;flex-shrink:0" onclick="window._openModal('ingresos')">+ Ingreso</button>`;
  return`<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
  ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(_perms.canConfigFields?[['campos','⚙ Campos']]:[])]
    .map(([s,l])=>`<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._opSub('${s}')">${l}</button>`).join('')}
  <span style="flex:1;min-width:8px"></span>
  ${_perms.canEdit?addBtn:''}
  ${_perms.canEdit?`<button class="btn btn-sm btn-gh" onclick="window._togAF()" id="btnAF" style="flex-shrink:0">⚡ ${_af?'ON':'OFF'}</button>`:''}
  ${_perms.canEdit?`<button class="btn btn-sm btn-gh" onclick="window._togPos()" id="btnPos" style="flex-shrink:0">🔢 ${_pos?'ON':'OFF'}</button>`:''}
  <button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="window._opImport()">📥 Importar</button>
  <button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opTpl()">📋 Plantilla</button>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opExcel('${tabId}')">⬇ Excel</button>`:''}
  ${_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._opClean()">🗑 Limpiar</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._opVaciar()">💥 Vaciar</button>`:''}
</div>`;
}

function _searchBar(tabId){
  return`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px;flex-wrap:nowrap">
  <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Pos, matrícula, nombre..." value="${safeHtml(_q)}" oninput="window._opQ(this.value)"></div>
  <input type="date" value="${_fecha}" oninput="window._opFecha(this.value)" style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px">
  <span style="border:1.5px solid ${_activos?'var(--blue)':'var(--border)'};background:${_activos?'var(--blue)':'var(--bg2)'};color:${_activos?'#fff':'var(--text3)'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0" onclick="window._opActivos()">Solo activos</span>
  <span style="font-size:10px;color:var(--text3);flex-shrink:0" id="regCount"></span>
</div>`;
}

function _hallBar(){
  return`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
  <span style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!_hall?'#7dd3fc':'#93c5fd'};background:${!_hall?'#e0f2fe':'#dbeafe'};color:${!_hall?'#0369a1':'#1e40af'};cursor:pointer;border-radius:20px" onclick="window._opHall('')">Todos</span>
  ${_evHalls.map(h=>`<span style="font-size:10px;font-weight:700;padding:3px 8px;background:${_hall===h?'#3b82f6':'#dbeafe'};color:${_hall===h?'#fff':'#1e40af'};border:1.5px solid ${_hall===h?'#2563eb':'#93c5fd'};cursor:pointer;border-radius:20px" onclick="window._opHall('${h}')">${h}</span>`).join('')}
</div>`;
}

// ─── TABLA LISTA ─────────────────────────────────────────────
function _renderTabla(tabId){
  const isRef=tabId==='referencia';
  let items=isRef?_entries.filter(e=>e.tipo==='referencia'):_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
  if(_q) items=items.filter(e=>_mq(e,_q));
  if(_activos) items=items.filter(e=>!e.salida);
  if(_hall) items=items.filter(e=>(e.hall||'')===_hall||(e.halls||[]).includes(_hall));
  if(_fecha) items=items.filter(e=>(e.ts||'').startsWith(_fecha));
  items=items.sort((a,b)=>(b.ts||b.entrada||'').localeCompare(a.ts||a.entrada||''));
  const el=document.getElementById('opContent');if(!el)return;
  const rc=document.getElementById('regCount');if(rc)rc.textContent=items.length+' reg.';

  let content='';
  if(_sub==='lista'){
    content=items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:40px">#</th>
      ${isRef?'<th style="width:130px;color:var(--amber)">Referencia</th>':''}<th>Matrícula</th>
      ${!isRef?'<th>Llamador</th><th>Ref</th>':'<th>Llamador</th>'}
      <th>Conductor/Empresa</th><th>Tel.</th><th>Hall</th><th>Stand</th>
      <th style="width:80px;font-size:10px">Evento</th><th>Estado</th><th>Entrada</th><th>Acc.</th>
    </tr></thead><tbody>
    ${items.map((i,idx)=>`<tr>
      <td style="font-weight:700;color:var(--text3)">${i.pos||items.length-idx}</td>
      ${isRef?`<td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'–')}</td>`:''}
      <td><span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}</td>
      ${!isRef?`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${safeHtml(i.referencia||'–')}</td>`:`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>`}
      <td><b style="font-size:12px">${safeHtml(((i.nombre||'')+' '+(i.apellido||'')).trim()||'–')}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.empresa)}</span>`:''}</td>
      <td style="font-size:11px">${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(i.telefono)}</a>`:'–'}</td>
      <td>${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:'–'}</td>
      <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis">${safeHtml((i.eventoNombre||'–').slice(0,12))}</td>
      <td>${!i.salida?'<span class="pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}</td>
      <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts||i.entrada)}</td>
      <td><div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">
        <div style="display:flex;gap:2px">
          ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${i.id}')" title="Imprimir" style="border-radius:50%;width:26px;height:26px;padding:0">🖨</button>`:''}
          ${_perms.canPrint?`<button class="btn btn-xs" onclick="window._opPrintTrq('${i.id}')" title="Troquelado" style="background:#7c3aed;color:#fff;border-radius:50%;width:26px;height:26px;padding:0">✂</button>`:''}
          ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${i.id}')" style="border-radius:50%;width:26px;height:26px;padding:0">✏️</button>`:''}
        </div>
        ${!i.salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${i.id}')" style="border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">↩ Salida</button>`:''}
        ${i.salida&&_perms.canEdit?`<button class="btn btn-success btn-xs" onclick="window._opReact('${i.id}')" style="border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700">↺</button>`:''}
        ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${i.id}')" style="border-radius:50%;width:26px;height:26px;padding:0">🗑</button>`:''}
      </div></td>
    </tr>`).join('')}
    </tbody></table></div>`
    :`<div class="empty"><div class="ei">${isRef?'📋':'🚛'}</div><div class="et">Sin ${isRef?'referencias':'ingresos'} registrados</div></div>`;
  } else if(_sub==='listanegra'){
    content=_renderListaNegra();
  } else if(_sub==='historial'){
    content=_renderHistorial(tabId);
  } else if(_sub==='campos'){
    content=_renderCampos(tabId);
  }

  el.innerHTML=_toolbar(tabId)+_searchBar(tabId)+_hallBar()+content;
  const rc2=document.getElementById('regCount');if(rc2)rc2.textContent=items.length+' reg.';
}

// ─── SUBTAB: ESPECIAL (lista negra) ──────────────────────────
function _renderListaNegra(){
  return`<div style="background:var(--rll);border:1.5px solid var(--red);border-radius:var(--r2);padding:12px 14px;margin-bottom:10px;font-size:13px">
    <div style="font-size:11px;font-weight:800;color:var(--red);text-transform:uppercase;margin-bottom:8px">⛔ Lista negra — matrículas bloqueadas</div>
    ${_perms.canBlacklist?`<button class="btn btn-sm" style="background:var(--red);color:#fff;border:none;margin-bottom:8px" onclick="window._openBL()">+ Añadir matrícula</button>`:''}
    <div id="blList"><div style="color:var(--text3);font-size:12px">Cargando...</div></div>
  </div>`;
}

// ─── SUBTAB: MODIFICACIONES (historial) ──────────────────────
function _renderHistorial(tabId){
  const isRef=tabId==='referencia';
  const items=_entries.filter(e=>isRef?e.tipo==='referencia':e.tipo!=='referencia'&&e.tipo!=='embalaje');
  if(!items.length) return`<div class="empty"><div class="et">Sin historial de modificaciones</div></div>`;
  return`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
    <th>Matrícula</th><th>Operación</th><th>Operador</th><th>Fecha/Hora</th>
  </tr></thead><tbody>
  ${items.map(i=>`<tr>
    <td><span class="mchip">${safeHtml(i.matricula||'—')}</span></td>
    <td style="font-size:12px">${i.salida?`<span style="color:var(--text3)">↩ Salida ${formatDateTime(i.salida)}</span>`:`<span class="pill-g">✓ Entrada</span>`}</td>
    <td style="font-size:12px">${safeHtml(i.operador||'—')}</td>
    <td style="font-size:11px">${formatDateTime(i.ts||i.entrada)}</td>
  </tr>`).join('')}
  </tbody></table></div>`;
}

// ─── SUBTAB: CAMPOS ──────────────────────────────────────────
function _renderCampos(tabId){
  if(!_perms.canConfigFields) return`<div class="empty"><div class="et">Sin permiso para configurar campos</div></div>`;
  const isRef=tabId==='referencia';
  const cfgKey=isRef?'referencia':'ingresos';
  const campos=Object.entries(_cfg[cfgKey]||{});
  return`<div class="card">
    <div style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;margin-bottom:10px">
      ⚙ Configurar campos visibles — ${isRef?'Referencia':'Ingresos'}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px">
      ${campos.map(([k,v])=>`<label style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border);cursor:pointer">
        <input type="checkbox" ${v.vis?'checked':''} onchange="window._toggleCampo('${cfgKey}','${k}',this.checked)" style="width:16px;height:16px;accent-color:var(--blue)">
        <span style="font-size:13px;font-weight:600;flex:1">${k}</span>
        ${v.req?`<span style="font-size:9px;background:var(--rll);color:var(--red);padding:1px 5px;border-radius:3px;font-weight:700">REQ</span>`:''}
      </label>`).join('')}
    </div>
    <div style="margin-top:10px;display:flex;gap:6px">
      <button class="btn btn-p btn-sm" onclick="window._saveCampos('${cfgKey}')">💾 Guardar configuración</button>
      <button class="btn btn-gh btn-sm" onclick="window._opSub('lista')">← Volver</button>
    </div>
  </div>`;
}

// ─── AGENDA ──────────────────────────────────────────────────
function _renderAgenda(){
  const el=document.getElementById('opContent');if(!el)return;
  el.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
  ${[['lista','📋 Lista'],['historial','📝 Historial'],...(_perms.canEditAgenda?[['campos','⚙ Campos']]:[])]
    .map(([s,l])=>`<button class="btn btn-sm ${_sub===s?'btn-p':'btn-gh'}" onclick="window._agSub('${s}')">${l}</button>`).join('')}
  <span style="flex:1"></span>
  ${_perms.canEditAgenda?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none" onclick="window._openAgModal()">+ Añadir servicio</button>`:''}
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._agExcel()">⬇ Excel</button>`:''}
</div>
<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
  <button class="btn btn-p btn-sm" id="agFiltPend" onclick="window._agLoad('pendiente',window._agQ||'')">⏳ Pendientes</button>
  <button class="btn btn-gh btn-sm" id="agFiltHoy" onclick="window._agLoad('hoy',window._agQ||'')">📅 Hoy</button>
  <button class="btn btn-gh btn-sm" id="agFiltTodos" onclick="window._agLoad('todos',window._agQ||'')">Todos</button>
</div>
<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
  ${_evHalls.map(h=>`<span style="font-size:10px;font-weight:700;padding:3px 8px;background:#dbeafe;color:#1e40af;border:1.5px solid #93c5fd;cursor:pointer;border-radius:20px" onclick="window._agHall('${h}')">${h}</span>`).join('')}
</div>
<div class="sbox" style="margin-bottom:8px;max-width:100%"><span class="sico">🔍</span>
  <input type="search" placeholder="Referencia, empresa, matrícula..." style="text-transform:uppercase" oninput="window._agQ=this.value.toUpperCase();window._agLoad('todos',this.value.toUpperCase())">
</div>
<div id="agCnt" style="font-size:10px;color:var(--text3);margin-bottom:4px"></div>
<div id="agContent"><div class="empty"><div class="et">Cargando agenda...</div></div></div>`;
  window._agQ='';
  _agLoad('pendiente','');
}

window._agSub=function(s){_sub=s;_renderAgenda();};
window._agHall=function(h){_agLoad('todos','',h);};
window._agQ='';

async function _agLoad(filtro='pendiente',q='',hallF=''){
  const el=document.getElementById('agContent');
  const cnt=document.getElementById('agCnt');
  if(!el)return;
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{collection,getDocs,query,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),limit(300)));
    let items=snap.docs.map(d=>({id:d.id,...d.data()}));
    if(q) items=items.filter(i=>(i.referencia||'').includes(q)||(i.empresa||'').toUpperCase().includes(q)||(i.matricula||'').includes(q));
    if(hallF) items=items.filter(i=>(i.hall||'')===hallF);
    if(filtro==='pendiente') items=items.filter(i=>!i.matricula&&i.estado!=='completado');
    if(filtro==='hoy'){const hoy=new Date().toISOString().slice(0,10);items=items.filter(i=>(i.fecha||'').slice(0,10)===hoy);}
    if(cnt)cnt.textContent=items.length+' servicios';
    if(!items.length){el.innerHTML='<div class="empty"><div class="et">Sin servicios en agenda</div></div>';return;}
    el.innerHTML=`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:130px;color:var(--amber)">Referencia</th>
      <th>Empresa</th><th>Hall/Stand</th><th>Fecha</th><th>Hora</th>
      <th>Matrícula</th><th>Estado</th><th>Acc.</th>
    </tr></thead><tbody>
    ${items.map(i=>`<tr>
      <td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'—')}</td>
      <td><b style="font-size:12px">${safeHtml(i.empresa||'—')}</b></td>
      <td style="font-size:11px">${i.hall?`<span class="hbadge">${safeHtml(i.hall)}</span>`:''} ${safeHtml(i.stand||'')}</td>
      <td style="font-size:11px">${safeHtml(i.fecha||'—')}</td>
      <td style="font-size:11px">${safeHtml(i.hora||'—')}</td>
      <td>${i.matricula?`<span class="mchip" style="font-size:11px">${safeHtml(i.matricula)}</span>`:`<span style="color:var(--text4);font-size:11px;font-style:italic">sin mat.</span>`}</td>
      <td><span class="s-${i.estado==='completado'?'completado':i.matricula?'LLEGADO':'PENDIENTE'}">${i.estado==='completado'?'Completado':i.matricula?'Vinculado':'Pendiente'}</span></td>
      <td><div style="display:flex;gap:2px">
        ${_perms.canEditAgenda?`<button class="btn btn-edit btn-xs" onclick="window._openAgModal(${JSON.stringify(i).replace(/"/g,'&quot;')})">✏️</button>`:''}
        ${i.matricula?'':`<button class="btn btn-sm btn-gh" style="font-size:10px;padding:2px 8px" onclick="window._vincularAg('${i.id}','${safeHtml(i.referencia||'')}')">🔗 Vincular mat.</button>`}
      </div></td>
    </tr>`).join('')}
    </tbody></table></div>`;
  }catch(err){el.innerHTML=`<div class="empty"><div class="et" style="color:var(--red)">Error cargando agenda</div></div>`;}
}

window._agLoad=_agLoad;
window._agExcel=()=>toast('Exportar agenda — disponible en admin','var(--blue)');
window._vincularAg=async function(agId,ref){
  const mat=prompt(`Vincular matrícula a la referencia ${ref}:`);
  if(!mat||!mat.trim())return;
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);
    await updateDoc(doc(db,'events',user.eventId,'agenda',agId),{matricula:mat.toUpperCase().trim(),matriculaTs:new Date().toISOString()});
    toast(`✅ ${mat.toUpperCase()} vinculada a ${ref}`,'var(--green)');
    _agLoad('todos','');
  }catch{toast('Error al vincular','var(--red)');}
};

window._openAgModal=function(item={}){
  const m=document.createElement('div');m.className='ov open';
  m.innerHTML=`<div class="modal">
    <div class="mhdr"><div class="mttl">📅 ${item.id?'Editar servicio':'Nuevo servicio en agenda'}</div><button class="btn-x" onclick="this.closest('.ov').remove()">✕</button></div>
    <div class="fgrid">
      <div class="fg s2"><span class="flbl">Referencia <span class="freq">*</span></span><input id="agRef" value="${safeHtml(item.referencia||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg s2"><span class="flbl">Empresa</span><input id="agEmp" value="${safeHtml(item.empresa||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><span class="flbl">Fecha prevista</span><input id="agFecha" type="date" value="${safeHtml(item.fecha||'')}"></div>
      <div class="fg"><span class="flbl">Hora prevista</span><input id="agHora" type="time" value="${safeHtml(item.hora||'')}"></div>
      <div class="fg"><span class="flbl">Hall</span><select id="agHall"><option value="">--</option>${_evHalls.map(h=>`<option value="${h}"${item.hall===h?' selected':''}>${h}</option>`).join('')}</select></div>
      <div class="fg"><span class="flbl">Stand</span><input id="agStand" value="${safeHtml(item.stand||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><span class="flbl">Matrícula (si se conoce)</span><input id="agMat" value="${safeHtml(item.matricula||'')}" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><span class="flbl">Conductor</span><input id="agCond" value="${safeHtml(item.conductor||'')}"></div>
      <div class="fg"><span class="flbl">Teléfono conductor</span><input id="agTel" value="${safeHtml(item.tel||'')}" type="tel"></div>
      <div class="fg"><span class="flbl">Estado</span><select id="agEst"><option value="PENDIENTE"${!item.estado||item.estado==='PENDIENTE'?' selected':''}>⏳ Pendiente</option><option value="LLEGADO"${item.estado==='LLEGADO'?' selected':''}>✅ Llegado</option><option value="completado"${item.estado==='completado'?' selected':''}>🔵 Completado</option></select></div>
      <div class="fg s2"><span class="flbl">Notas</span><textarea id="agNotas" rows="2">${safeHtml(item.notas||'')}</textarea></div>
    </div>
    <div class="ffoot">
      <button class="btn btn-gh" onclick="this.closest('.ov').remove()">Cancelar</button>
      <button class="btn btn-p" onclick="window._saveAg('${item.id||''}')">💾 Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('agRef')?.focus(),50);
};

window._saveAg=async function(editId){
  const ref=(document.getElementById('agRef')?.value||'').trim().toUpperCase();
  if(!ref){toast('La referencia es obligatoria','var(--red)');return;}
  const user=AppState.get('currentUser');
  const data={referencia:ref,empresa:document.getElementById('agEmp')?.value.trim().toUpperCase()||'',fecha:document.getElementById('agFecha')?.value||'',hora:document.getElementById('agHora')?.value||'',hall:document.getElementById('agHall')?.value||'',stand:document.getElementById('agStand')?.value.trim().toUpperCase()||'',matricula:document.getElementById('agMat')?.value.trim().toUpperCase()||'',conductor:document.getElementById('agCond')?.value.trim()||'',tel:document.getElementById('agTel')?.value.trim()||'',estado:document.getElementById('agEst')?.value||'PENDIENTE',notas:document.getElementById('agNotas')?.value.trim()||''};
  try{
    const db=getDB();
    if(editId){const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',user.eventId,'agenda',editId),data);}
    else{const{collection,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);await addDoc(collection(db,'events',user.eventId,'agenda'),{...data,creadoTs:serverTimestamp()});}
    document.querySelector('.ov.open')?.remove();
    toast(`✅ Servicio ${ref} guardado`,'var(--green)');
    _agLoad('todos','');
  }catch(err){toast('Error al guardar','var(--red)');}
};

// ─── EMBALAJE ────────────────────────────────────────────────
async function _renderEmbalaje(){
  const el=document.getElementById('opContent');if(!el)return;
  // Cargar historial embalaje
  const user=AppState.get('currentUser');
  let histItems=[];
  try{
    const db=getDB();
    const{collection,query,where,getDocs,orderBy,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue'),where('tipo','==','embalaje'),limit(50)));
    histItems=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
  }catch{}

  el.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:nowrap">
  <span style="font-size:13px;font-weight:700">📦 Control de Embalaje</span>
  <span style="flex:1"></span>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._embExcel()">⬇ Excel</button>`:''}
</div>

<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">📤 Registrar movimiento</div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Matrícula <span class="freq">*</span></span>
      <input id="eMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()">
    </div>
    <div class="fg"><span class="flbl">Conductor fijo</span><input id="eCond" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Empresa transporte</span><input id="eEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Tipo movimiento <span class="freq">*</span></span>
      <div style="display:flex;gap:4px">
        <button type="button" class="btn btn-gh btn-sm" id="eR" onclick="window._tgl('eTipo','retirada',this,document.getElementById('eD'))" style="flex:1">📤 Retirada vacíos</button>
        <button type="button" class="btn btn-gh btn-sm" id="eD" onclick="window._tgl('eTipo','devolucion',this,document.getElementById('eR'))" style="flex:1">📥 Devolución material</button>
      </div><input type="hidden" id="eTipo">
    </div>
    <div class="fg"><span class="flbl">Material</span><input id="eMat2" placeholder="Palés, jaulas, cajas..."></div>
    <div class="fg"><span class="flbl">Cantidad</span><input id="eCant" type="number" min="1" placeholder="0"></div>
    <div class="fg"><span class="flbl">Origen (pabellón/zona)</span><input id="eOrig" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Destino</span><input id="eDest" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Incidencia / Nota</span><textarea id="eNota" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._submitEmb()">📦 Registrar movimiento</button></div>
</div>

<!-- ESTADISTICAS EMBALAJE -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:10px;text-align:center">
    <div style="font-size:20px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--blue)">${histItems.length}</div>
    <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:2px">Total movimientos</div>
  </div>
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:10px;text-align:center">
    <div style="font-size:20px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--amber)">${histItems.filter(i=>i.tipoMov==='retirada').length}</div>
    <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:2px">Retiradas</div>
  </div>
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:10px;text-align:center">
    <div style="font-size:20px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--green)">${histItems.filter(i=>i.tipoMov==='devolucion').length}</div>
    <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:2px">Devoluciones</div>
  </div>
</div>

<!-- HISTORIAL EMBALAJE -->
${histItems.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Matrícula</th><th>Conductor</th><th>Tipo</th><th>Material</th><th>Cantidad</th><th>Origen</th><th>Destino</th><th>Hora</th>
</tr></thead><tbody>
${histItems.map(i=>`<tr>
  <td><span class="mchip">${safeHtml(i.matricula||'—')}</span></td>
  <td style="font-size:12px">${safeHtml(i.conductor||'—')}</td>
  <td><span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;background:${i.tipoMov==='retirada'?'var(--all)':'var(--gll)'};color:${i.tipoMov==='retirada'?'var(--amber)':'var(--green)'}">${i.tipoMov==='retirada'?'📤 Retirada':'📥 Devolución'}</span></td>
  <td style="font-size:11px">${safeHtml(i.material||'—')}</td>
  <td style="font-size:12px;font-weight:700;text-align:center">${i.cantidad||'—'}</td>
  <td style="font-size:11px">${safeHtml(i.origen||'—')}</td>
  <td style="font-size:11px">${safeHtml(i.destino||'—')}</td>
  <td style="font-size:11px">${formatDateTime(i.ts)}</td>
</tr>`).join('')}
</tbody></table></div>`
:`<div class="empty"><div class="ei">📦</div><div class="et">Sin movimientos de embalaje registrados</div></div>`}`;
}

window._submitEmb=async function(){
  const mat=normalizePlate(document.getElementById('eMat')?.value);
  const tipo=document.getElementById('eTipo')?.value;
  if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
  if(!tipo){toast('Selecciona el tipo de movimiento','var(--red)');return;}
  const user=AppState.get('currentUser');
  const btn=document.querySelector('button[onclick*="_submitEmb"]');
  if(btn){btn.disabled=true;btn.textContent='Registrando...';}
  try{
    await fsGate.registerEntry(user.eventId,user.gateId||'puerta-1',{
      matricula:mat,tipo:'embalaje',tipoMov:tipo,
      conductor:_v('eCond'),empresa:_v('eEmp'),material:_v('eMat2'),
      cantidad:_v('eCant'),origen:_v('eOrig'),destino:_v('eDest'),nota:_v('eNota'),
      operadorId:user.uid,operador:user.name,
    });
    ['eMat','eCond','eEmp','eMat2','eCant','eOrig','eDest','eNota','eTipo'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.querySelectorAll('#eR,#eD').forEach(b=>{b.className='btn btn-gh btn-sm';(b).style.flex='1';});
    toast('📦 Movimiento registrado','var(--purple)');
    _renderEmbalaje();
  }catch{toast('Error al registrar','var(--red)');}finally{if(btn){btn.disabled=false;btn.textContent='📦 Registrar movimiento';}}
};
window._embExcel=()=>toast('Exportar embalaje — disponible en admin','var(--blue)');

// ─── MODAL INGRESO/REFERENCIA ─────────────────────────────────
function _openModal(tipo,editEntry){
  const isRef=tipo==='referencia';
  const cfg=isRef?(_cfg.referencia||_defCfg().referencia):(_cfg.ingresos||_defCfg().ingresos);
  const e=editEntry||{};
  document.getElementById('_opMod')?.remove();
  const m=document.createElement('div');
  m.id='_opMod';m.className='ov open';
  m.innerHTML=`<div class="modal modal-lg">
    <div class="mhdr">
      <div class="mttl">${isRef?'📋 Referencia / Booking':'🚛 Nuevo Ingreso'}</div>
      <button class="btn-x" onclick="document.getElementById('_opMod').remove()">✕</button>
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
        <span class="flbl">Matrícula${!isRef?' <span class="freq">*</span>':''}</span>
        <div style="position:relative">
          <input id="mMat" value="${safeHtml(e.matricula||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:16px" placeholder="🔍 Matrícula..." autocomplete="off" oninput="this.value=this.value.toUpperCase();window._checkBL(this.value)">
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
      <div class="fg"><span class="flbl">Hall / Pabellón</span><select id="mHall"><option value="">--</option>${_evHalls.map(h=>`<option value="${h}"${e.hall===h?' selected':''}>${h}</option>`).join('')}</select></div>
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
      <button class="btn btn-gh" onclick="document.getElementById('_opMod').remove()">Cancelar</button>
      <button class="btn ${isRef?'btn-a':'btn-p'}" onclick="window._submitModal('${tipo}','${e.id||''}')">
        ${isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso'}
      </button>
    </div>
  </div>`;
  document.body.appendChild(m);
  if(e.tipo==='furgoneta'){const b=document.getElementById('tvA');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.tipo==='camion'){const b=document.getElementById('tvB');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.descarga==='mano'){const b=document.getElementById('dcH');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.descarga==='forklift'){const b=document.getElementById('dcF');if(b){b.className='btn btn-a btn-sm';b.style.flex='1';}}
  if(e.numEjes){document.querySelectorAll('#_opMod [data-v]').forEach(b=>{if(b.dataset.v===e.numEjes){b.className='btn btn-a btn-sm';b.style.flex='1';}});}
  setTimeout(()=>document.getElementById(isRef?'mRef':'mMat')?.focus(),50);
}

// ─── SUBMIT MODAL ────────────────────────────────────────────
window._submitModal=async function(tipo,editId){
  const isRef=tipo==='referencia';
  const mat=normalizePlate(_v('mMat'));
  const ref=(_v('mRef')||'').trim().toUpperCase();
  if(isRef&&!ref){toast('La referencia es obligatoria','var(--red)');return;}
  if(!mat&&!isRef){toast('La matrícula es obligatoria','var(--red)');return;}
  if(!isRef&&_v('mDescarga')==='forklift'){if(!confirm('Este vehículo usa forklift — debería ir por Referencia.\n¿Registrar como Ingreso de todas formas?'))return;}
  const user=AppState.get('currentUser');
  const btn=document.querySelector('#_opMod .btn-p,#_opMod .btn-a');
  if(btn){btn.disabled=true;btn.textContent='Guardando...';}
  try{
    const entry={matricula:mat||'—',referencia:ref||null,remolque:_v('mRem'),tipo:isRef?'referencia':(_v('mTipoVeh')||'ingreso'),descarga:_v('mDescarga'),numEjes:_v('mEjes'),maquinaria:_v('mMaq'),empresa:_v('mEmp'),montador:_v('mMontador'),expositor:_v('mExpositor'),llamador:_v('mLlamador'),hall:_v('mHall'),stand:_v('mStand'),nombre:_v('mNom'),apellido:_v('mApe'),conductor:(_v('mNom')+' '+_v('mApe')).trim(),telPais:_v('mTelP'),telefono:_v('mTel'),idioma:_v('mIdioma'),pasaporte:_v('mPas'),fechaNac:_v('mFechaNac'),pais:_v('mPais'),comentario:_v('mComent'),operadorId:user.uid,operador:user.name,eventoNombre:AppState.get('currentEvent')?.name||'',pos:_entries.length+1};
    if(editId){const db=getDB();const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',editId),entry);}
    else{await fsGate.registerEntry(user.eventId,user.gateId||'puerta-1',entry);if(isRef&&mat)_linkAg(ref,mat);}
    document.getElementById('_opMod')?.remove();
    toast(isRef?`📋 ${ref}${mat?' · '+mat:''} registrado`:`✅ ${mat} registrado`,isRef?'var(--amber)':'var(--green)');
  }catch(err){console.error(err);toast('Error al guardar','var(--red)');if(btn){btn.disabled=false;btn.textContent=isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso';}}
};

// ─── BLACKLIST MODAL ─────────────────────────────────────────
window._openBL=function(){
  const m=document.createElement('div');m.className='ov open';
  m.innerHTML=`<div class="modal"><div class="mhdr"><div class="mttl">⛔ Añadir a lista negra</div><button class="btn-x" onclick="this.closest('.ov').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="blMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nivel alerta</span><select id="blNivel"><option value="informativo">ℹ️ Informativo</option><option value="ALERTA" selected>⚠️ Alerta</option><option value="BLOQUEO">⛔ Bloqueo total</option></select></div>
    <div class="fg s2"><span class="flbl">Motivo</span><input id="blMotivo" placeholder="Razón del bloqueo..."></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="this.closest('.ov').remove()">Cancelar</button><button class="btn" style="background:var(--red);color:#fff" onclick="window._saveBL()">⛔ Añadir a blacklist</button></div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('blMat')?.focus(),50);
};

window._saveBL=async function(){
  const mat=normalizePlate(document.getElementById('blMat')?.value);
  if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
  const user=AppState.get('currentUser');
  try{
    const db=getDB();
    const{collection,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
    await addDoc(collection(db,'events',user.eventId,'blacklist'),{matricula:mat,nivel:document.getElementById('blNivel')?.value||'ALERTA',motivo:document.getElementById('blMotivo')?.value.trim()||'',creadoPor:user.name,ts:serverTimestamp()});
    document.querySelector('.ov.open')?.remove();
    toast(`⛔ ${mat} añadida a blacklist`,'var(--red)');
  }catch{toast('Error','var(--red)');}
};

// ─── ACCIONES FILA ────────────────────────────────────────────
window._opSalida=async function(id){
  if(!confirm('¿Confirmar salida?'))return;
  const user=AppState.get('currentUser');
  try{await fsGate.registerExit(user.eventId,user.gateId||'puerta-1',id,{operadorSalida:user.name});toast('Salida registrada','var(--blue)',1500);}
  catch{toast('Error al registrar salida','var(--red)');}
};
window._opReact=async function(id){
  if(!confirm('¿Reactivar este vehículo (anular salida)?'))return;
  const user=AppState.get('currentUser');
  try{const db=getDB();const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id),{salida:null});toast('↺ Salida anulada','var(--amber)');}
  catch{toast('Error','var(--red)');}
};
window._opPrint=async function(id){
  try{const{printEntry}=await import('./print.js');const e=_entries.find(x=>x.id===id)||{id,matricula:'—'};await printEntry(e,AppState.get('currentEvent')?.name||'BeUnifyT');}
  catch{toast('Error al imprimir','var(--red)');}
};
window._opPrintTrq=()=>toast('Impresión troquelada — configura en Impresión','var(--purple)');
window._opEdit=function(id){const e=_entries.find(x=>x.id===id);if(!e)return;_openModal(e.tipo==='referencia'?'referencia':'ingresos',e);};
window._opDel=async function(id){
  if(!confirm('¿Eliminar este registro?'))return;
  const user=AppState.get('currentUser');
  try{const db=getDB();const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'events',user.eventId,'gates',user.gateId||'puerta-1','queue',id));toast('Eliminado','var(--amber)',1500);}
  catch{toast('Error al eliminar','var(--red)');}
};
window._opDetail=function(id){
  const e=_entries.find(x=>x.id===id);if(!e)return;
  alert([`Matrícula: ${e.matricula}`,`Empresa: ${e.empresa||'—'}`,`Ref: ${e.referencia||'—'}`,`Hall: ${e.hall||'—'}`,`Stand: ${e.stand||'—'}`,`Conductor: ${e.conductor||'—'}`,`Entrada: ${formatDateTime(e.ts||e.entrada)}`,`Salida: ${e.salida?formatDateTime(e.salida):'En recinto'}`].join('\n'));
};

// ─── CAMPOS TOGGLE ────────────────────────────────────────────
window._toggleCampo=function(cfgKey,campo,vis){if(!_cfg[cfgKey])_cfg[cfgKey]={};if(!_cfg[cfgKey][campo])_cfg[cfgKey][campo]={};_cfg[cfgKey][campo].vis=vis;};
window._saveCampos=async function(cfgKey){
  const user=AppState.get('currentUser');
  try{
    const db=getDB();const{doc,setDoc}=await import(`${FB}/firebase-firestore.js`);
    await setDoc(doc(db,'events',user.eventId,'config','fields'),_cfg,{merge:true});
    toast('✅ Configuración guardada','var(--green)');
    _sub='lista';_renderTabla(cfgKey);
  }catch{toast('Error al guardar','var(--red)');}
};

// ─── FIRESTORE SUBSCRIBE ─────────────────────────────────────
function _subscribe(){
  const user=AppState.get('currentUser');
  if(_unsub)_unsub();
  _unsub=fsGate.subscribeQueue(user.eventId,user.gateId||'puerta-1',
    (entries)=>{_entries=entries;_updateCnts();_rerender();},
    (err)=>{console.error('[Op]',err);_sync('error');}
  );
  _sync('ok');
}

function _updateCnts(){
  const hoy=new Date().toDateString();
  const hN=_entries.filter(e=>new Date(e.ts||e.entrada).toDateString()===hoy).length;
  const rN=_entries.filter(e=>!e.salida).length;
  const rfN=_entries.filter(e=>e.tipo==='referencia'&&!e.salida).length;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('cntHoy',hN);s('cntRecinto',rN);s('cntRef',rfN);
}

function _rerender(){
  if(_activeTab==='ingresos')   _renderTabla('ingresos');
  if(_activeTab==='referencia') _renderTabla('referencia');
}

// ─── BLACKLIST CHECK ─────────────────────────────────────────
window._checkBL=async function(mat){
  if(!mat||mat.length<4)return;
  const warn=document.getElementById('mBlWarn');if(!warn)return;
  try{
    const user=AppState.get('currentUser');const db=getDB();
    const{collection,query,where,getDocs}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'blacklist'),where('matricula','==',mat.toUpperCase().trim())));
    if(!snap.empty){const bl=snap.docs[0].data();warn.innerHTML=`⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matrícula en lista negra')}`;warn.style.display='block';}
    else warn.style.display='none';
  }catch{warn.style.display='none';}
};

// ─── REFERENCIA AUTOCOMPLETE ──────────────────────────────────
window._searchRefAC=async function(val){
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(!ac||!match||val.length<3){if(ac)ac.classList.remove('open');return;}
  const user=AppState.get('currentUser');
  try{
    const db=getDB();const{collection,query,where,getDocs,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','>=',val),where('referencia','<=',val+'\uf8ff'),limit(5)));
    if(!snap.empty){ac.classList.add('open');ac.innerHTML=snap.docs.map(d=>{const it={id:d.id,...d.data()};return`<div class="dr-item" onclick="window._fillRef(${JSON.stringify(it).replace(/"/g,'&quot;')})"><span style="font-weight:700;color:var(--amber)">${safeHtml(it.referencia)}</span> <span style="color:var(--text2)">${safeHtml(it.empresa||'—')}</span>${it.matricula?` <span class="mchip-sm">${safeHtml(it.matricula)}</span>`:''}</div>`;}).join('');}
    else ac.classList.remove('open');
  }catch{if(ac)ac.classList.remove('open');}
};

window._fillRef=function(item){
  const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null)el.value=v;};
  sv('mRef',item.referencia);sv('mEmp',item.empresa);sv('mHall',item.hall);sv('mStand',item.stand);
  sv('mNom',item.conductor?.split(' ')[0]);sv('mApe',item.conductor?.split(' ').slice(1).join(' '));
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(ac)ac.classList.remove('open');
  if(match){match.innerHTML=`✅ Ref en agenda · ${safeHtml(item.empresa||'')}${item.hall?' · Hall '+safeHtml(item.hall):''}${item.matricula?' · '+safeHtml(item.matricula):''}`;match.style.display='block';}
};

async function _linkAg(ref,mat){
  try{const user=AppState.get('currentUser');const db=getDB();const{collection,query,where,getDocs,doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);const snap=await getDocs(query(collection(db,'events',user.eventId,'agenda'),where('referencia','==',ref)));snap.docs.forEach(async d=>await updateDoc(doc(db,'events',user.eventId,'agenda',d.id),{matricula:mat,matriculaTs:new Date().toISOString()}));}catch{}
}

// ─── CONTROLES ────────────────────────────────────────────────
window._opTab=function(tab){
  _activeTab=tab;_sub='lista';
  document.querySelectorAll('.btn-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='ingresos')    _renderTabla('ingresos');
  if(tab==='referencia')  _renderTabla('referencia');
  if(tab==='agenda')      _renderAgenda();
  if(tab==='embalaje')    _renderEmbalaje();
};
window._opSub=(s)=>{_sub=s;_rerender();};
window._opQ=(q)=>{_q=q;_rerender();};
window._opFecha=(f)=>{_fecha=f;_rerender();};
window._opActivos=()=>{_activos=!_activos;_rerender();};
window._opHall=(h)=>{_hall=h;_rerender();};
window._openModal=_openModal;
window._togAF=()=>{_af=!_af;_rerender();};
window._togPos=()=>{_pos=!_pos;_rerender();};
window._opImport=()=>toast('Importar Excel — disponible próximamente','var(--blue)');
window._opTpl=()=>toast('Plantilla Excel — disponible próximamente','var(--blue)');
window._opClean=()=>toast('Limpiar — usa el admin panel','var(--amber)');
window._opVaciar=()=>toast('Vaciar — requiere confirmación admin','var(--red)');
window._opExcel=async function(tab){
  if(!_perms.canExport){toast('Sin permiso para exportar','var(--red)');return;}
  try{const{exportToExcel}=await import('./print.js');const items=tab==='referencia'?_entries.filter(e=>e.tipo==='referencia'):_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');await exportToExcel(items,`beunifyt-${tab}`);}
  catch{toast('Error al exportar','var(--red)');}
};

// ─── TOGGLES ──────────────────────────────────────────────────
window._tgl=function(hidId,val,activeBtn,otherBtn){
  document.getElementById(hidId).value=val;
  if(activeBtn){activeBtn.className=`btn ${val==='forklift'||val==='devolucion'?'btn-a':'btn-p'} btn-sm`;activeBtn.style.flex='1';}
  if(otherBtn){otherBtn.className='btn btn-gh btn-sm';otherBtn.style.flex='1';}
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

// ─── BIND ─────────────────────────────────────────────────────
function _bind(){
  document.getElementById('btnLogout')?.addEventListener('click',logout);
  document.getElementById('btnTheme')?.addEventListener('click',()=>{
    const themes=['default','dark','soft','contrast'];
    const curr=localStorage.getItem('beu_theme')||'default';
    const next=themes[(themes.indexOf(curr)+1)%themes.length];
    document.documentElement.setAttribute('data-theme',next==='default'?'':next);
    localStorage.setItem('beu_theme',next);
    AppState.set('theme',next);
    toast(`Tema: ${next}`,'var(--blue)',1200);
  document.getElementById('btnDash')?.addEventListener('click',()=>{ window.location.href=window.location.pathname+'?dash'; });
  document.getElementById('btnMsg')?.addEventListener('click',()=>{ window.location.href=window.location.pathname+'?msg'; });
  document.getElementById('btnAdmin')?.addEventListener('click',()=>{ window.location.href=window.location.pathname+'?admin'; });
  });
  document.getElementById('btnLang')?.addEventListener('click',()=>toast('Selector de idioma — próximamente','var(--blue)'));
  document.getElementById('btnSave')?.addEventListener('click',()=>window._opExcel(_activeTab==='referencia'?'referencia':'ingresos'));
  _renderTabla('ingresos');
}

// ─── SYNC ─────────────────────────────────────────────────────
function _sync(s){const dot=document.getElementById('syncDot');if(!dot)return;const m={ok:'sd-g',syncing:'sd-y',error:'sd-r'};dot.className=`sd ${m[s]||'sd-y'}`;}

// ─── UTILS ────────────────────────────────────────────────────
function _v(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function _fv(cfg,key,html){return(!cfg[key]||cfg[key].vis===false)?'':html;}
function _req(cfg,key){return cfg[key]?.req?' <span class="freq">*</span>':'';}
function _mq(e,q){const s=q.toLowerCase();return`${e.pos||''} ${e.matricula||''} ${e.nombre||''} ${e.apellido||''} ${e.empresa||''} ${e.llamador||''} ${e.referencia||''} ${e.hall||''} ${(e.halls||[]).join(' ')} ${e.stand||''} ${e.remolque||''} ${e.comentario||''} ${e.telefono||''} ${e.conductor||''}`.toLowerCase().includes(s);}
function _idOpts(sel=''){return`<option value="">--</option>`+[['es','Español'],['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['pt','Português'],['nl','Nederlands'],['pl','Polski'],['ro','Română'],['ru','Русский'],['uk','Українська'],['cs','Čeština'],['sk','Slovenčina'],['hu','Magyar'],['bg','Български'],['hr','Hrvatski'],['tr','Türkçe'],['ar','العربية'],['zh','中文']].map(([v,l])=>`<option value="${v}"${sel===v?' selected':''}>${l}</option>`).join('');}
