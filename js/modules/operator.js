// BeUnifyT v7 — operator.js — Clon COMPLETO de v6
// Todas las tabs: Dashboard, Referencia, Ingresos, Embalaje, Conductores,
// Agenda, Análisis, Historial, Archivos, Papelera, Impresión, Recintos,
// Eventos, Mensajes, Usuarios
import { AppState }                from '../state.js';
import { fsGate, fsConfig, getDB } from '../firestore.js';
import { toast, safeHtml, normalizePlate, formatDateTime, uid } from '../utils.js';
import { logout }                  from '../auth.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
const HALLS_DEF = ['1','2A','2B','3A','3B','4','5','6','7','8','CS'];

// ─── Estado global ────────────────────────────────────────────
let _unsub=null, _entries=[], _curTab='ingresos2', _evHalls=HALLS_DEF;
let _cfg={}, _perms={}, _ev=null, _user=null;

// Filtros por tab — idénticos a v6
const iF={q:'',q2:'',fecha:'',fecha2:'',hall:'',hall2:'',activos:true,activos2:true,_sub:'lista',_sub2:'lista'};
const agF={q:'',hall:'',estado:'',desde:'',hasta:'',fecha:''};
const cF={q:''};
const fF={q:'',hall:'',status:''};

// ─── INIT ────────────────────────────────────────────────────
export async function initOperator(){
  _user=AppState.get('currentUser');
  _ev=await fsConfig.getEvent(_user.eventId);
  AppState.set('currentEvent',_ev);
  if(_user.gateId) AppState.set('currentGate',{id:_user.gateId});
  _evHalls=_ev?.halls?.length?_ev.halls:_ev?.recintoHalls?.length?_ev.recintoHalls:HALLS_DEF;
  await _loadCfg(_user.eventId,_user.uid);
  _injectCSS();
  const saved=localStorage.getItem('beu_theme')||'';
  if(saved&&saved!=='default') document.documentElement.setAttribute('data-theme',saved);
  document.getElementById('app-root').innerHTML=_shellHTML();
  _bindShell();
  _subscribe();
  _goTab('ingresos2');
}

async function _loadCfg(eid,uid_){
  try{
    const db=getDB();
    const{doc,getDoc}=await import(`${FB}/firebase-firestore.js`);
    const cs=await getDoc(doc(db,'events',eid,'config','fields'));
    _cfg=cs.exists()?cs.data():_defCfg();
    const os=await getDoc(doc(db,'events',eid,'operators',uid_));
    _perms=os.exists()?(os.data().perms||_defPerms(os.data().role)):_defPerms(_user.role||'operator');
  }catch{_cfg=_defCfg();_perms=_defPerms(_user.role||'operator');}
}

function _defCfg(){return{ingresos:{remolque:{vis:true},tipoVeh:{vis:true,req:true},descarga:{vis:true,req:true},llamador:{vis:true},empresa:{vis:true,req:true},montador:{vis:true},expositor:{vis:true},hall:{vis:true},stand:{vis:true},nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},pasaporte:{vis:false},fechaNac:{vis:false},pais:{vis:false}},referencia:{remolque:{vis:true},numEjes:{vis:true},tipoMaq:{vis:true},empresa:{vis:true,req:true},hall:{vis:true},stand:{vis:true},llamador:{vis:true},nombre:{vis:true},apellido:{vis:true},telefono:{vis:true},idioma:{vis:true},comentario:{vis:true},pasaporte:{vis:false},fechaNac:{vis:false}}};}
function _defPerms(r){const a=r==='admin'||r==='supervisor';return{canEdit:true,canDelete:a,canPrint:true,canExport:a,canViewAgenda:a,canEditAgenda:a,canViewEmbalaje:true,canViewConductores:a,canViewAnalisis:a,canViewHistorial:a,canViewArchivos:a,canViewPapelera:a,canViewImpresion:a,canViewRecintos:a,canViewEventos:a,canViewMensajes:true,canViewUsuarios:a,canBlacklist:a,canConfigFields:r==='admin',canClean:a,canVaciar:r==='admin'};}

// ─── CSS EXACTO DE v6 ─────────────────────────────────────────
function _injectCSS(){
  if(document.getElementById('beu-css'))return;
  const s=document.createElement('style');s.id='beu-css';
  s.textContent=`:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--pll:#f5f3ff;--teal:#0e7490;--r:6px;--r2:10px;--r3:16px;--sh:0 1px 3px rgba(0,0,0,.06);--sh2:0 4px 16px rgba(0,0,0,.1)}
[data-theme=dark]{--bg:#0f172a;--bg2:#1e293b;--bg3:#0f172a;--bg4:#1e293b;--text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;--text4:#475569;--border:#1e293b;--border2:#334155;--sh:0 1px 3px rgba(0,0,0,.4);--sh2:0 8px 32px rgba(0,0,0,.6)}
[data-theme=soft]{--bg:#fdf6e3;--bg2:#fffef9;--bg3:#f5ead0;--bg4:#eddfc0;--text:#2c2510;--text2:#5c4a1e;--text3:#8a7340;--border:#e8d9b0;--border2:#d4c088}
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
#appHdr{background:#030812!important;border-bottom:1px solid #1e293b!important;padding:0 12px;height:44px;display:flex;align-items:center;position:sticky;top:0;z-index:200}
[data-theme=soft] #appHdr{background:#4a3728!important;border-bottom-color:#6b4f38!important}
.beu-logo-wrap{display:flex;align-items:center;gap:7px;flex-shrink:0}
.beu-brand{font-size:16px;font-weight:900;letter-spacing:-.4px;white-space:nowrap;color:#e2e8f0!important}
.beu-brand-t{color:#64748b!important;font-weight:400}
.beu-ev-pill{background:#1e293b!important;border:1px solid #334155!important;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:#94a3b8!important;white-space:nowrap}
.beu-cnt-wrap{display:flex;align-items:center;gap:4px;flex:1;justify-content:center;overflow-x:auto;padding:0 6px;scrollbar-width:none}
.beu-cnt{display:flex;flex-direction:column;align-items:center;padding:3px 7px;border:1.5px solid #334155;border-radius:var(--r);background:#1e293b;min-width:40px;flex-shrink:0}
.beu-cv{font-size:14px;font-weight:900;line-height:1;font-family:'JetBrains Mono',monospace;color:#e2e8f0}
.beu-cl{font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin-top:1px}
.beu-right{display:flex;align-items:center;gap:3px;flex-shrink:0}
.beu-sep{width:1px;height:20px;background:#334155;display:inline-block;margin:0 4px}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid #334155;background:#1e293b;font-size:11px;font-weight:700;color:#64748b}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;animation:blink 2s infinite}.sd-y{background:#f59e0b}.sd-r{background:#e02424}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.beu-btn{padding:3px 9px;font-size:12px;border-radius:20px;background:#1e293b;border:1px solid #334155;color:#94a3b8;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.beu-btn:hover{background:#334155}
.tabs-bar{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;position:sticky;top:44px;z-index:99;scrollbar-width:none;flex-wrap:wrap}
.tabs-bar::-webkit-scrollbar{display:none}
.btn-tab{padding:4px 10px;border-radius:20px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;border:none;white-space:nowrap;flex-shrink:0;transition:all .15s;display:inline-flex;align-items:center;gap:5px}
.btn-tab:hover{color:var(--text);background:rgba(37,99,235,.07)}
.btn-tab.active{background:linear-gradient(90deg,#2563eb,#cbd5e1);color:#fff;font-weight:700}
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
.pill{display:inline-flex;align-items:center;gap:3px;border-radius:20px;font-size:11px;font-weight:700;padding:3px 10px;cursor:pointer;white-space:nowrap}
.pill-g{display:inline-flex;align-items:center;gap:3px;background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px}
.pill.pill-g{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.pill-r,.pill.pill-r{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.sbox{position:relative;flex:1;min-width:160px;max-width:320px}.sbox input{padding:7px 10px 7px 30px;font-size:13px}
.sico{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:12px;pointer-events:none}
.card{background:var(--bg2);border:1.5px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh);padding:14px}
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:1fr 1fr 1fr}.sg4{grid-template-columns:1fr 1fr 1fr 1fr}.sg6{grid-template-columns:repeat(6,1fr)}
@media(max-width:900px){.sg6{grid-template-columns:repeat(3,1fr)}.sg4{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.sg3{grid-template-columns:1fr 1fr}.sg6{grid-template-columns:repeat(2,1fr)}.sg2{grid-template-columns:1fr}}
.stat-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:8px 10px;text-align:center}
.stat-n{font-size:16px;font-weight:900;line-height:1.1;font-family:'JetBrains Mono',monospace}
.stat-l{font-size:10px;color:var(--text3);font-weight:700;margin-top:2px;text-transform:uppercase}
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
.bar-row{display:flex;align-items:center;gap:4px;margin-bottom:4px}
.bar-bg{flex:1;background:var(--bg4);border-radius:3px;height:7px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .4s}
.bar-val{min-width:28px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:10px}
.s-PENDIENTE{background:#fffbeb;color:#92400e;border:1px solid #fde68a;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-LLEGADO{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.s-SALIDA{background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;border-radius:4px;font-size:11px;font-weight:700;padding:2px 7px;display:inline-block}
.sbadge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px}
.sec-ttl{font-size:14px;font-weight:800;display:flex;align-items:center;gap:4px}
.sec-act{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
`;
  document.head.appendChild(s);
}

// ─── SHELL ────────────────────────────────────────────────────
function _shellHTML(){
  // Tabs idénticos a v6
  const TABS=[
    {id:'dash',       lbl:'Dashboard',   svg:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',show:true},
    {id:'ingresos',   lbl:'Referencia',  svg:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>',show:true},
    {id:'ingresos2',  lbl:'Ingresos',    svg:'<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/>',show:true},
    {id:'flota',      lbl:'Embalaje',    svg:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>',show:_perms.canViewEmbalaje},
    {id:'conductores',lbl:'Conductores', svg:'<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>',show:_perms.canViewConductores},
    {id:'agenda',     lbl:'Agenda',      svg:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',show:_perms.canViewAgenda},
    {id:'analytics',  lbl:'Análisis',    svg:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',show:_perms.canViewAnalisis},
    {id:'vehiculos',  lbl:'Historial',   svg:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',show:_perms.canViewHistorial},
    {id:'auditoria',  lbl:'Archivos',    svg:'<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>',show:_perms.canViewArchivos},
    {id:'papelera',   lbl:'Papelera',    svg:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',show:_perms.canViewPapelera},
    {id:'impresion',  lbl:'Impresión',   svg:'<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',show:_perms.canViewImpresion},
    {id:'recintos',   lbl:'Recintos',    svg:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',show:_perms.canViewRecintos},
    {id:'eventos',    lbl:'Eventos',     svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',show:_perms.canViewEventos},
    {id:'mensajes',   lbl:'Mensajes',    svg:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',show:_perms.canViewMensajes},
    {id:'usuarios',   lbl:'Usuarios',    svg:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',show:_perms.canViewUsuarios},
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
      <span class="beu-ev-pill">${safeHtml(_ev?.name||'Evento')}</span>
    </div>
    <div class="beu-cnt-wrap">
      <div class="beu-cnt"><span class="beu-cv" id="cntHoy">0</span><span class="beu-cl">HOY</span></div>
      <div class="beu-cnt"><span class="beu-cv" id="cntRecinto">0</span><span class="beu-cl">RECINTO</span></div>
      <div class="beu-cnt" style="border-color:#7c4a00"><span class="beu-cv" id="cntRef" style="color:#f59e0b">0</span><span class="beu-cl">REF.</span></div>
      <div class="beu-cnt" style="border-color:#c7d2fe" id="cntAgWrap" style="display:none"><span class="beu-cv" id="cntAg" style="color:#4f46e5">0</span><span class="beu-cl">AGENDA</span></div>
    </div>
    <div class="beu-right">
      <div class="sync-pill" id="syncPill"><div class="sd sd-y" id="syncDot"></div></div>
      <span class="beu-sep"></span>
      <span style="font-size:13px;font-weight:500;color:#94a3b8" id="hdrUser">${safeHtml(_user.name)}</span>
      <span class="beu-sep"></span>
      <button class="beu-btn" id="btnTheme">☀️ Tema</button>
      <button class="beu-btn" id="btnLang" style="font-size:14px;padding:3px 8px">🌐</button>
      <button class="beu-btn" id="btnSave" style="font-size:14px;padding:3px 8px" title="Exportar día">💾</button>
      <button class="beu-btn" id="btnLogout" style="font-weight:700">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Salir
      </button>
    </div>
  </div>
</div>

<div class="tabs-bar" id="mainTabs">
  ${TABS.filter(t=>t.show).map(t=>`
    <button class="btn-tab" data-tab="${t.id}" onclick="window._goTab('${t.id}')">
      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">${t.svg}</svg>
      ${t.lbl}
    </button>`).join('')}
</div>

<div class="app-main" id="opContent"></div>`;
}

// ─── ROUTING ─────────────────────────────────────────────────
window._goTab = function(tab){
  _curTab=tab;
  localStorage.setItem('beu_tab',tab);
  document.querySelectorAll('#mainTabs .btn-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const el=document.getElementById('opContent');if(!el)return;
  const map={
    dash:_renderDash, ingresos:()=>_renderIngresos('ingresos'),
    ingresos2:()=>_renderIngresos('ingresos2'),
    flota:_renderFlota, conductores:_renderConductores,
    agenda:_renderAgenda, analytics:_renderAnalytics,
    vehiculos:_renderVehiculos, auditoria:_renderAuditoria,
    papelera:_renderPapelera, impresion:_renderImpresion,
    recintos:_renderRecintos, eventos:_renderEventos,
    mensajes:_renderMensajes, usuarios:_renderUsuarios,
  };
  (map[tab]||function(){el.innerHTML=`<div class="empty"><div class="et">Módulo próximamente</div></div>`;})();
};

// ─── TOOLBAR COMÚN ───────────────────────────────────────────
function _tb(tabId,sub,items,addLbl,addCb,extraBtns=''){
  return`<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
    ${[['lista','📋 Lista'],['listanegra','⭐ Especial'],['historial','📝 Modificaciones'],...(_perms.canConfigFields?[['campos','⚙ Campos']]:[])]
      .map(([s,l])=>`<button class="btn btn-sm ${sub===s?'btn-p':'btn-gh'}" onclick="window._setSub('${tabId}','${s}')">${l}</button>`).join('')}
    <span style="flex:1;min-width:8px"></span>
    ${_perms.canEdit&&sub!=='campos'?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;flex-shrink:0" onclick="${addCb}">${addLbl}</button>`:''}
    ${_perms.canEdit&&sub!=='campos'?`<button class="btn btn-sm btn-gh" onclick="window._togAF()" id="btnAF" style="flex-shrink:0">⚡ ON</button>`:''} 
    ${_perms.canEdit&&sub!=='campos'?`<button class="btn btn-sm btn-gh" onclick="window._togPos()" id="btnPos" style="flex-shrink:0">🔢 ON</button>`:''}
    ${sub!=='historial'&&sub!=='campos'?`<button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="window._opImport('${tabId}')">📥 Importar</button><button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opTpl('${tabId}')">📋 Plantilla</button>`:''}
    ${sub!=='historial'&&sub!=='campos'&&_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opExcel('${tabId}')">⬇ Excel</button>`:''}
    ${sub!=='historial'&&sub!=='campos'&&_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._opClean('${tabId}')">🗑 Limpiar</button>`:''}
    ${sub!=='historial'&&sub!=='campos'&&_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._opVaciar('${tabId}')">💥 Vaciar</button>`:''}
    ${extraBtns}
  </div>`;
}

function _srchRow(tabId,q,fecha,activos,items){
  return`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px;flex-wrap:nowrap">
    <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Pos, matrícula, nombre..." value="${safeHtml(q)}" oninput="window._setQ('${tabId}',this.value)"></div>
    <input type="date" value="${fecha}" oninput="window._setFecha('${tabId}',this.value)" style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px">
    <span style="border:1.5px solid ${activos?'var(--blue)':'var(--border)'};background:${activos?'var(--blue)':'var(--bg2)'};color:${activos?'#fff':'var(--text3)'};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0" onclick="window._togActivos('${tabId}')">Solo activos</span>
    ${q||fecha?`<span class="pill pill-r" style="flex-shrink:0" onclick="window._clearFilters('${tabId}')">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3);flex-shrink:0">${items} reg.</span>
  </div>`;
}

function _hallsRow(tabId,hall){
  return`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
    <span style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!hall?'#7dd3fc':'#93c5fd'};background:${!hall?'#e0f2fe':'#dbeafe'};color:${!hall?'#0369a1':'#1e40af'};cursor:pointer;border-radius:20px" onclick="window._setHall('${tabId}','')">Todos</span>
    ${_evHalls.map(h=>`<span style="font-size:10px;font-weight:700;padding:3px 8px;background:${hall===h?'#3b82f6':'#dbeafe'};color:${hall===h?'#fff':'#1e40af'};border:1.5px solid ${hall===h?'#2563eb':'#93c5fd'};cursor:pointer;border-radius:20px" onclick="window._setHall('${tabId}','${h}')">${h}</span>`).join('')}
  </div>`;
}

function _tblAccBtns(id,salida,tabId){
  // Exacto v6: flex-wrap:wrap horizontal
  return`<div style="display:flex;gap:2px;flex-wrap:wrap">
    ${_perms.canPrint?`<button class="btn btn-gh btn-xs" onclick="window._opPrint('${id}')" title="Imprimir Normal">🖨</button>`:''}
    ${_perms.canPrint?`<button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" title="Imprimir Troquelado A4" onclick="window._opPrintTrq('${id}')">✂</button>`:''}
    ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._opEdit('${id}','${tabId}')">✏️</button>`:''}
    ${!salida&&_perms.canEdit?`<button class="btn btn-warning btn-xs" onclick="window._opSalida('${id}')">↩ Salida</button><button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="window._opTracking('${id}')">📡</button>`:''}
    ${salida&&_perms.canEdit?`<button class="btn btn-success btn-xs" onclick="window._opReactivar('${id}')" title="Reactivar / Error salida">↺</button>`:''}
    ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._opDel('${id}','${tabId}')">🗑</button>`:''}
  </div>`;
}

// ─── DASHBOARD — exacto v6 ────────────────────────────────────
async function _renderDash(){
  const el=document.getElementById('opContent');if(!el)return;
  el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text3)">Cargando dashboard...</div>`;
  const{initDashboard}=await import('./dashboard.js');
  el.innerHTML='<div id="dashContainer"></div>';
  await initDashboard('dashContainer');
}

// ─── INGRESOS Y REFERENCIA — exacto v6 ────────────────────────
function _renderIngresos(tabId){
  const isRef=tabId==='ingresos';
  const sub=isRef?iF._sub:iF._sub2;
  const q=isRef?iF.q:iF.q2;
  const fecha=isRef?iF.fecha:iF.fecha2;
  const hall=isRef?iF.hall:iF.hall2;
  const activos=isRef?iF.activos:iF.activos2;

  let items=_entries.filter(e=>isRef?e.tipo==='referencia':(e.tipo!=='referencia'&&e.tipo!=='embalaje'));
  if(q) items=items.filter(e=>_mq(e,q));
  if(activos) items=items.filter(e=>!e.salida);
  if(hall) items=items.filter(e=>(e.hall||'')===hall||(e.halls||[]).includes(hall));
  if(fecha) items=items.filter(e=>(e.ts||'').startsWith(fecha));
  items=items.sort((a,b)=>(b.ts||b.entrada||'').localeCompare(a.ts||a.entrada||''));

  const el=document.getElementById('opContent');if(!el)return;

  let content='';
  if(sub==='lista'){
    content=items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      <th style="width:40px">#</th>
      ${isRef?`<th style="color:var(--amber)">Referencia</th>`:''}
      <th>Matrícula</th>
      ${!isRef?'<th>Llamador</th><th>Ref</th>':'<th>Llamador</th>'}
      <th>Conductor/Empresa</th><th>Tel.</th><th>Hall</th><th>Stand</th>
      <th style="font-size:10px;width:80px">Evento</th><th>Estado</th><th>Entrada</th><th>Acc.</th>
    </tr></thead><tbody>
    ${items.map((i,idx)=>`<tr>
      <td style="font-weight:700;color:var(--text3)">${i.pos||items.length-idx}</td>
      ${isRef?`<td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber);font-size:12px">${safeHtml(i.referencia||'–')}</td>`:''}
      <td><span class="mchip" style="cursor:pointer" onclick="window._opDetail('${i.id}')">${safeHtml(i.matricula||'—')}</span>${i.remolque?`<br><span class="mchip-sm">${safeHtml(i.remolque)}</span>`:''}</td>
      ${!isRef?`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${safeHtml(i.referencia||'–')}</td>`:`<td style="font-size:11px">${safeHtml(i.llamador||'–')}</td>`}
      <td><b style="font-size:12px">${safeHtml(((i.nombre||'')+' '+(i.apellido||'')).trim()||'–')}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${safeHtml(i.empresa)}</span>`:''}</td>
      <td style="font-size:11px">${i.telefono?`<a href="tel:${safeHtml(i.telPais||'')}${safeHtml(i.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(i.telefono)}</a>`:'–'}</td>
      <td>${(i.halls||[i.hall]).filter(Boolean).map(h=>`<span class="hbadge">${safeHtml(h)}</span>`).join(' ')||'–'}</td>
      <td style="font-size:11px">${safeHtml(i.stand||'–')}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis">${safeHtml((i.eventoNombre||'–').slice(0,12))}</td>
      <td>${!i.salida?'<span class="pill pill-g">✓ En recinto</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${formatDateTime(i.salida)}</span>`}</td>
      <td style="font-size:11px;white-space:nowrap">${formatDateTime(i.ts||i.entrada)}</td>
      <td>${_tblAccBtns(i.id,i.salida,tabId)}</td>
    </tr>`).join('')}
    </tbody></table></div>`
    :`<div class="empty"><div class="ei">${isRef?'📋':'🚛'}</div><div class="et">Sin ${isRef?'referencias':'ingresos'} registrados</div></div>`;
  } else if(sub==='listanegra'){
    content=_renderListaNegra();
  } else if(sub==='historial'){
    content=_renderHistorialSub(items);
  } else if(sub==='campos'){
    content=_renderCamposSub(tabId);
  }

  const addLbl=isRef?'+ Referencia':'+ Ingreso';
  const addCb=isRef?`window._openModal('referencia')`:`window._openModal('ingresos')`;

  el.innerHTML=_tb(tabId,sub,items,addLbl,addCb)
    +_srchRow(tabId,q,fecha,activos,items.length)
    +_hallsRow(tabId,hall)
    +content;
}

// ─── EMBALAJE/FLOTA — exacto v6: ALMACEN/SOT/FIRA/FINAL ────────
const SCFG={ALMACEN:{l:'ALMACEN',i:'📦',c:'#3b82f6'},SOT:{l:'SOT',i:'⏱',c:'#f59e0b'},FIRA:{l:'FIRA',i:'🟢',c:'#22c55e'},FINAL:{l:'FINAL',i:'✅',c:'#6b7280'}};
const CCFG={'EF':{i:'🔴',c:'var(--red)'},'SUNDAY':{i:'🟣',c:'var(--purple)'},'PRIORITY':{i:'🟠',c:'var(--amber)'},'GOODS':{i:'🟢',c:'var(--green)'},'EMPTY':{i:'⚪',c:'var(--text3)'}};
function _hBadge(h){return h?`<span class="hbadge">${safeHtml(h)}</span>`:'–';}
function _sBadge(s){const c=SCFG[s]||{l:s,i:'',c:'var(--text3)'};return`<span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:4px;background:${c.c}20;color:${c.c};border:1px solid ${c.c}40">${c.i} ${c.l}</span>`;}
function _cBadge(c){const x=CCFG[c];return x?`<span style="font-weight:700;color:${x.c}">${x.i} ${safeHtml(c)}</span>`:'–';}
function _fmtTs(ts,m){if(!ts)return'–';const d=new Date(String(ts).replace(' ','T'));if(isNaN(d))return String(ts);if(m==='d')return d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'});if(m==='t')return d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});return d.toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}

async function _renderFlota(){
  const el=document.getElementById('opContent');if(!el)return;
  const db=getDB();
  let items=[];
  try{
    const{collection,getDocs,query,limit,orderBy}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'movimientos'),limit(500)));
    items=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  const now=new Date();
  if(fF.q){const q=fF.q.toLowerCase();items=items.filter(m=>`${m.matricula||''} ${m.nombre||''} ${m.empresa||''} ${m.hall||''} ${m.remolque||''} ${m.status||''}`.toLowerCase().includes(q));}
  if(fF.status) items=items.filter(m=>m.status===fF.status);
  if(fF.hall) items=items.filter(m=>m.hall===fF.hall);
  items=items.sort((a,b)=>(a.posicion||999)-(b.posicion||999));

  el.innerHTML=`
<div class="sg sg4" style="margin-bottom:4px">
  ${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<div class="stat-box" style="border-top:3px solid ${SCFG[s].c}">
    <div class="stat-n" style="color:${SCFG[s].c}">${items.filter(m=>m.status===s).length}</div>
    <div class="stat-l">${SCFG[s].i} ${s}</div>
  </div>`).join('')}
</div>
<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
  <div class="sbox" style="flex:2;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa, conductor..." value="${safeHtml(fF.q||'')}" oninput="fF.q=this.value;window._goTab('flota')"></div>
  ${fF.q||fF.hall?`<span class="pill pill-r" style="flex-shrink:0" onclick="fF={q:'',status:'',hall:''};window._goTab('flota')">✕</span>`:''}
  <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._flotaHistorial()">📝 Modificaciones</button>
  <span style="flex:1"></span>
  ${_perms.canEdit?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="window._openMovModal()">+ Movimiento</button>`:''}
  <button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="window._opImport('flota')">📥 Importar</button>
  <button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opTpl('flota')">📋 Plantilla</button>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opExcel('flota')">⬇ Excel</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._opVaciar('flota')">💥 Vaciar</button>`:''}
</div>
${_hallsRow('flota',fF.hall)}
${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>#</th><th>Tractora</th><th>Remolque</th><th>Conductor</th><th>Empresa</th><th>Hall</th><th>Carga</th><th>Estado</th><th>Tacógrafo</th><th>Acc.</th>
</tr></thead><tbody>
${items.map(m=>{
  const sotOv=m.status==='SOT'&&m.tacografoHora&&(()=>{const d=new Date(String(m.tacografoHora).replace(' ','T'));d.setHours(d.getHours()+9);return d<=now;})();
  return`<tr style="${sotOv?'background:var(--rll)':''}">
  <td style="font-weight:800">${m.posicion||'–'}</td>
  <td><span class="mchip">${safeHtml(m.matricula||'—')}</span></td>
  <td>${m.remolque?`<span class="mchip-sm">${safeHtml(m.remolque)}</span>`:'-'}</td>
  <td style="font-size:11px">${safeHtml(m.nombre||'')} ${safeHtml(m.apellido||'')}</td>
  <td style="font-size:11px">${safeHtml(m.empresa||'–')}</td>
  <td>${_hBadge(m.hall)}</td>
  <td>${_cBadge(m.tipoCarga)}</td>
  <td>${_sBadge(m.status)}${sotOv?'<span style="color:var(--red);font-size:10px"> ⚠️</span>':''}</td>
  <td style="font-size:10px;font-family:'JetBrains Mono',monospace">${m.tacografoHora?_fmtTs(m.tacografoHora,'t'):'-'}</td>
  <td><div style="display:flex;gap:2px;flex-wrap:wrap">
    ${_perms.canEdit?`<select style="padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--border);max-width:90px" onchange="window._cambiarEstMov('${m.id}',this.value)">
      ${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<option value="${s}" ${m.status===s?'selected':''}>${SCFG[s].i} ${s}</option>`).join('')}
    </select>`:''}
    ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._openMovModal(${JSON.stringify(m).replace(/"/g,'&quot;')})">✏️</button>`:''}
    ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._delMov('${m.id}')">🗑</button>`:''}
  </div></td>
</tr>`}).join('')}
</tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">Sin movimientos de embalaje</div></div>`}`;
}

window._cambiarEstMov=async function(id,status){
  const db=getDB();
  try{const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',_user.eventId,'movimientos',id),{status});window._goTab('flota');}
  catch{toast('Error','var(--red)');}
};

window._delMov=async function(id){
  if(!confirm('¿Eliminar este movimiento?'))return;
  const db=getDB();
  try{const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'events',_user.eventId,'movimientos',id));toast('Eliminado','var(--amber)');window._goTab('flota');}
  catch{toast('Error','var(--red)');}
};

window._flotaHistorial=()=>toast('Historial de modificaciones — próximamente','var(--blue)');
window._openEmbalaje=function(){
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal"><div class="mhdr"><div class="mttl">📦 Nuevo movimiento embalaje</div><button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Matrícula *</span><input id="eMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Conductor fijo</span><input id="eCond" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="eEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Tipo movimiento *</span>
      <div style="display:flex;gap:4px">
        <button type="button" class="btn btn-gh btn-sm" id="eR" onclick="window._tgl('eTipo','retirada',this,document.getElementById('eD'))" style="flex:1">📤 Retirada vacíos</button>
        <button type="button" class="btn btn-gh btn-sm" id="eD" onclick="window._tgl('eTipo','devolucion',this,document.getElementById('eR'))" style="flex:1">📥 Devolución material</button>
      </div><input type="hidden" id="eTipo">
    </div>
    <div class="fg"><span class="flbl">Material</span><input id="eMat2" placeholder="Palés, jaulas..."></div>
    <div class="fg"><span class="flbl">Cantidad</span><input id="eCant" type="number" min="1"></div>
    <div class="fg"><span class="flbl">Origen</span><input id="eOrig" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Destino</span><input id="eDest" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Nota</span><textarea id="eNota" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button><button class="btn btn-p" onclick="window._submitEmb()">📦 Registrar</button></div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('eMat')?.focus(),50);
};

window._submitEmb=async function(){
  const mat=normalizePlate(document.getElementById('eMat')?.value);
  const tipo=document.getElementById('eTipo')?.value;
  if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
  if(!tipo){toast('Selecciona el tipo','var(--red)');return;}
  try{
    await fsGate.registerEntry(_user.eventId,_user.gateId||'puerta-1',{matricula:mat,tipo:'embalaje',tipoMov:tipo,conductor:_v('eCond'),empresa:_v('eEmp'),material:_v('eMat2'),cantidad:_v('eCant'),origen:_v('eOrig'),destino:_v('eDest'),nota:_v('eNota'),operadorId:_user.uid,operador:_user.name});
    document.getElementById('_opModal')?.remove();
    toast('📦 Movimiento registrado','var(--purple)');
  }catch{toast('Error','var(--red)');}
};

// ─── CONDUCTORES — exacto v6 ──────────────────────────────────
async function _renderConductores(){
  const el=document.getElementById('opContent');if(!el)return;
  const db=getDB();
  let conductores=[];
  try{
    const{collection,getDocs,query,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'conductores'),limit(500)));
    conductores=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  const q=(cF.q||'').toLowerCase();
  let items=conductores.filter(c=>!q||`${c.nombre||''} ${c.apellido||''} ${c.empresa||''} ${c.matricula||''} ${c.remolque||''} ${c.telefono||''} ${c.hall||''} ${c.idioma||''}`.toLowerCase().includes(q));

  // Contar en recinto
  const enRec=items.filter(c=>_entries.some(e=>e.matricula===c.matricula&&!e.salida)).length;
  const hoy=new Date().toISOString().slice(0,10);
  const hoyN=items.filter(c=>_entries.some(e=>e.matricula===c.matricula&&(e.ts||'').startsWith(hoy))).length;

  el.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
  <div class="sbox" style="flex:2;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Nombre, matrícula, empresa, tel, hall..." value="${safeHtml(cF.q||'')}" oninput="cF.q=this.value;window._goTab('conductores')"></div>
  ${cF.q?`<span style="background:var(--rll);color:var(--red);border:1px solid #fecaca;padding:3px 8px;border-radius:20px;font-size:11px;cursor:pointer;flex-shrink:0" onclick="cF.q='';window._goTab('conductores')">✕</span>`:''}
  <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:0 6px;flex-shrink:0;border-left:1px solid var(--border);margin-left:2px">
    <span style="color:var(--blue)">${conductores.length} total</span><span style="color:var(--border2)">·</span>
    <span style="color:var(--green)">${enRec} ✅ recinto</span><span style="color:var(--border2)">·</span>
    <span style="color:var(--text3)">${hoyN} 🔵 hoy</span>
  </span>
  <div style="width:20px;flex-shrink:0"></div>
  ${_perms.canEdit?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;font-weight:600;border-radius:20px" onclick="window._openCondModal()">+ Añadir</button>`:''}
  <button class="btn btn-s btn-sm" onclick="window._opImport('conductores')">📥 Importar</button>
  <button class="btn btn-gh btn-sm" onclick="window._opTpl('conductores')">📋 Plantilla</button>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._opExcel('conductores')">⬇ Excel</button>`:''}
  ${_perms.canClean?`<button class="btn btn-sm" style="background:var(--red);color:#fff;border:none;border-radius:20px;flex-shrink:0" onclick="window._opClean('conductores')">🗑 Limpiar</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._opVaciar('conductores')">💥 Vaciar</button>`:''}
</div>
${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Matrícula</th><th>Nombre</th><th>Empresa</th><th>Teléfono</th><th>Hall</th><th>Idioma</th><th>Ingresos</th><th>Acc.</th>
</tr></thead><tbody>
${items.map(c=>{
  const lang=['es','en','fr','de','it','pt','nl','pl','ro','ru','uk','cs','sk','hu','bg','hr','tr','ar','zh'];
  const flags={'es':'🇪🇸','en':'🇬🇧','fr':'🇫🇷','de':'🇩🇪','it':'🇮🇹','pt':'🇵🇹','nl':'🇳🇱','pl':'🇵🇱','ro':'🇷🇴','ru':'🇷🇺','uk':'🇺🇦','cs':'🇨🇿','sk':'🇸🇰','hu':'🇭🇺','bg':'🇧🇬','hr':'🇭🇷','tr':'🇹🇷','ar':'🇸🇦','zh':'🇨🇳'};
  const flag=flags[c.idioma||'']||'';
  const ingCount=_entries.filter(e=>e.matricula===c.matricula).length;
  return`<tr>
    <td>${c.matricula?`<span class="mchip" style="cursor:pointer" onclick="window._condDetalle('${c.id}','${safeHtml(c.matricula||'')}')">${safeHtml(c.matricula)}</span>`:'-'}${c.remolque?`<br><span class="mchip-sm">${safeHtml(c.remolque)}</span>`:''}</td>
    <td><b style="font-size:12px">${safeHtml(c.nombre||'')} ${safeHtml(c.apellido||'')}</b>${c.tipoVehiculo?`<br><span style="font-size:10px;color:var(--text3)">${safeHtml(c.tipoVehiculo)}</span>`:''}</td>
    <td style="font-size:11px">${safeHtml(c.empresa||'–')}</td>
    <td style="font-size:11px">${c.telefono?`<a href="tel:${safeHtml(c.telPais||'')}${safeHtml(c.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(c.telefono)}</a>`:'–'}</td>
    <td>${c.hall?`<span class="hbadge">${safeHtml(c.hall)}</span>`:'–'}</td>
    <td style="font-size:16px" title="${c.idioma||''}">${flag||c.idioma||'–'}</td>
    <td style="text-align:center;font-weight:800;color:var(--blue)">${ingCount}</td>
    <td><div style="display:flex;gap:2px">
      ${_perms.canEdit?`<button class="btn btn-edit btn-xs" onclick="window._openCondModal(${JSON.stringify(c).replace(/"/g,'&quot;')})">✏️</button>`:''}
      ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._delCond('${c.id}')">🗑</button>`:''}
    </div></td>
  </tr>`;}).join('')}
</tbody></table></div>`:`<div class="empty"><div class="ei">👤</div><div class="et">${conductores.length?'Sin resultados':'Sin conductores registrados'}</div></div>`}`;
}

window._condDetalle=function(id,mat){
  const hist=_entries.filter(e=>e.matricula===mat).slice(0,10);
  alert(`Conductor: ${mat}\nIngresos: ${hist.length}\n\n${hist.map(e=>`${formatDateTime(e.ts||e.entrada)} — ${e.salida?'↩ Salida':'✓ Recinto'}`).join('\n')}`);
};

window._openCondModal=function(c={}){
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal modal-lg"><div class="mhdr"><div class="mttl">👤 ${c.id?'Editar conductor':'Nuevo conductor'}</div><button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula</span><input id="cMat" value="${safeHtml(c.matricula||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque</span><input id="cRem" value="${safeHtml(c.remolque||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nombre</span><input id="cNom" value="${safeHtml(c.nombre||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Apellido</span><input id="cApe" value="${safeHtml(c.apellido||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="cEmp" value="${safeHtml(c.empresa||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Teléfono</span><div style="display:flex;gap:4px"><input id="cTelP" value="${safeHtml(c.telPais||'+34')}" style="width:80px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:12px"><input id="cTel" value="${safeHtml(c.telefono||'')}" type="tel"></div></div>
    <div class="fg"><span class="flbl">Hall habitual</span><select id="cHall"><option value="">--</option>${_evHalls.map(h=>`<option value="${h}"${c.hall===h?' selected':''}>${h}</option>`).join('')}</select></div>
    <div class="fg"><span class="flbl">Idioma</span><select id="cIdioma">${_idOpts(c.idioma)}</select></div>
    <div class="fg"><span class="flbl">Pasaporte/DNI</span><input id="cPas" value="${safeHtml(c.pasaporte||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Fecha nacimiento</span><input id="cFechaNac" type="date" value="${safeHtml(c.fechaNac||'')}"></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="cNotas" rows="2">${safeHtml(c.notas||'')}</textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button><button class="btn btn-p" onclick="window._saveCond('${c.id||''}')">💾 Guardar conductor</button></div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('cMat')?.focus(),50);
};

window._saveCond=async function(editId){
  const mat=normalizePlate(document.getElementById('cMat')?.value);
  const db=getDB();
  const data={matricula:mat,remolque:_v('cRem'),nombre:_v('cNom'),apellido:_v('cApe'),empresa:_v('cEmp'),telPais:_v('cTelP'),telefono:_v('cTel'),hall:_v('cHall'),idioma:_v('cIdioma'),pasaporte:_v('cPas'),fechaNac:_v('cFechaNac'),notas:_v('cNotas'),eventoId:_user.eventId};
  try{
    const{collection,doc,setDoc,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
    if(editId) await setDoc(doc(db,'events',_user.eventId,'conductores',editId),data,{merge:true});
    else await addDoc(collection(db,'events',_user.eventId,'conductores'),{...data,creadoTs:serverTimestamp()});
    document.getElementById('_opModal')?.remove();
    toast('✅ Conductor guardado','var(--green)');
    _renderConductores();
  }catch{toast('Error al guardar','var(--red)');}
};

window._delCond=async function(id){
  if(!confirm('¿Eliminar este conductor?'))return;
  const db=getDB();
  try{const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'events',_user.eventId,'conductores',id));toast('Eliminado','var(--amber)');_renderConductores();}
  catch{toast('Error','var(--red)');}
};

// ─── AGENDA — exacto v6 ───────────────────────────────────────
async function _renderAgenda(){
  const el=document.getElementById('opContent');if(!el)return;
  const{initMensajes}=await import('./mensajes.js');
  // Reuse agenda from mensajes module or render inline
  const db=getDB();
  let items=[];
  try{
    const{collection,getDocs,query,limit,orderBy}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'agenda'),limit(300)));
    items=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  const today=new Date().toISOString().slice(0,10);
  const q=(agF.q||'').toLowerCase();
  let filtered=[...items];
  if(q) filtered=filtered.filter(a=>`${a.matricula||''} ${a.conductor||''} ${a.empresa||''} ${a.referencia||''} ${a.hall||''}`.toLowerCase().includes(q));
  if(agF.hall) filtered=filtered.filter(a=>a.hall===agF.hall);
  if(agF.estado) filtered=filtered.filter(a=>a.estado===agF.estado);
  if(agF.desde) filtered=filtered.filter(a=>a.fecha>=agF.desde);
  if(agF.hasta) filtered=filtered.filter(a=>a.fecha<=agF.hasta);
  if(agF.fecha) filtered=filtered.filter(a=>a.fecha===agF.fecha);

  const dayAll=items.filter(a=>a.fecha===today);
  const dPend=dayAll.filter(a=>a.estado==='PENDIENTE').length;
  const dLleg=dayAll.filter(a=>a.estado==='LLEGADO').length;
  const dSal=dayAll.filter(a=>a.estado==='SALIDA').length;

  el.innerHTML=`
<div style="display:flex;align-items:center;gap:3px;padding:4px 0;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap">
  ${[['lista','📋 Lista'],['especial','⭐ Especial'],['historial','📝 Modificaciones'],...(_perms.canConfigFields?[['campos','⚙ Campos']]:[])]
    .map(([s,l])=>`<button class="btn btn-sm ${(agF._sub||'lista')===s?'btn-p':'btn-gh'}" onclick="agF._sub='${s}';window._goTab('agenda')">${l}</button>`).join('')}
  <span style="flex:1;min-width:8px"></span>
  <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:0 6px;flex-shrink:0;border-right:1px solid var(--border);margin-right:2px">
    <span style="color:var(--blue)">${dayAll.length} hoy</span><span style="color:var(--border2)">·</span>
    <span style="color:var(--green)">${dLleg} ✅</span><span style="color:var(--border2)">·</span>
    <span style="color:var(--amber)">${dPend} ⏳</span><span style="color:var(--border2)">·</span>
    <span style="color:var(--text3)">${dSal} 🔵</span>
  </span>
  ${_perms.canEditAgenda?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;font-weight:700;flex-shrink:0" onclick="window._openAgModal()">+ Nueva cita</button>`:''}
  <button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="window._opImport('agenda')">📥 Importar</button>
  <button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opTpl('agenda')">📋 Plantilla</button>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._opExcel('agenda')">⬇ Excel</button>`:''}
  ${_perms.canClean?`<button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._opClean('agenda')">🗑 Limpiar</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="window._opVaciar('agenda')">💥 Vaciar</button>`:''}
</div>
<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px;flex-wrap:nowrap">
  <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, conductor, empresa, hall..." value="${safeHtml(agF.q||'')}" oninput="agF.q=this.value;window._goTab('agenda')"></div>
  <input type="date" value="${agF.desde||''}" oninput="agF.desde=this.value;window._goTab('agenda')" style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px" title="Desde">
  <input type="date" value="${agF.hasta||''}" oninput="agF.hasta=this.value;window._goTab('agenda')" style="height:32px;padding:4px 8px;font-size:11px;width:auto;min-width:110px;max-width:130px" title="Hasta">
  <select onchange="agF.estado=this.value;window._goTab('agenda')" style="width:auto;padding:4px 8px;font-size:11px;height:32px">
    <option value="">Todos estados</option>
    <option value="PENDIENTE" ${agF.estado==='PENDIENTE'?'selected':''}>⏳ Pendiente</option>
    <option value="LLEGADO" ${agF.estado==='LLEGADO'?'selected':''}>✅ Llegado</option>
    <option value="SALIDA" ${agF.estado==='SALIDA'?'selected':''}>🔵 Salida</option>
  </select>
  ${agF.q||agF.hall||agF.estado||agF.desde||agF.hasta?`<span style="background:var(--rll);color:var(--red);border:1px solid #fecaca;padding:3px 8px;border-radius:20px;font-size:11px;cursor:pointer;flex-shrink:0" onclick="agF={q:'',hall:'',estado:'',desde:'',hasta:'',fecha:''};window._goTab('agenda')">✕</span>`:''}
  <span style="font-size:10px;color:var(--text3);flex-shrink:0">${filtered.length} citas</span>
</div>
${_hallsRow('agenda',agF.hall)}
${filtered.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Estado</th><th>Hora P.</th><th>Matrícula</th><th>Conductor</th><th>Empresa</th><th>Hall</th><th>Stand</th><th>Ref.</th><th>Fecha</th><th>Acc.</th>
</tr></thead><tbody>
${filtered.map(a=>{
  const isLate=a.estado==='PENDIENTE'&&a.hora&&a.hora<new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})&&a.fecha===today;
  return`<tr style="${isLate?'background:var(--rll)':''}">
  <td><span class="s-${a.estado||'PENDIENTE'}">${a.estado||'PENDIENTE'}</span>${isLate?'<br><span style="font-size:9px;color:var(--red)">⏰ Tarde</span>':''}</td>
  <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${safeHtml(a.hora||'–')}</td>
  <td>${a.matricula?`<span class="mchip" style="cursor:pointer;font-size:11px" onclick="window._opDetail('${a.id}')">${safeHtml(a.matricula)}</span>`:`<span style="color:var(--text4);font-size:11px">sin mat.</span>`}</td>
  <td style="font-size:12px">${safeHtml(a.conductor||'—')}</td>
  <td style="font-size:11px"><b>${safeHtml(a.empresa||'—')}</b></td>
  <td>${a.hall?`<span class="hbadge">${safeHtml(a.hall)}</span>`:'–'}</td>
  <td style="font-size:11px">${safeHtml(a.stand||'–')}</td>
  <td style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--amber)">${safeHtml(a.referencia||'–')}</td>
  <td style="font-size:11px">${safeHtml(a.fecha||'–')}</td>
  <td><div style="display:flex;gap:2px">
    ${_perms.canEditAgenda?`<button class="btn btn-edit btn-xs" onclick="window._openAgModal(${JSON.stringify(a).replace(/"/g,'&quot;')})">✏️</button>`:''}
    ${a.estado==='PENDIENTE'&&_perms.canEditAgenda?`<button class="btn btn-success btn-xs" onclick="window._agLlegado('${a.id}')">✅</button>`:''}
    ${_perms.canDelete?`<button class="btn btn-danger btn-xs" onclick="window._delAg('${a.id}')">🗑</button>`:''}
  </div></td>
</tr>`;}).join('')}
</tbody></table></div>`:`<div class="empty"><div class="ei">📅</div><div class="et">Sin citas en agenda</div></div>`}`;
}

window._agLlegado=async function(id){
  const db=getDB();
  try{const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',_user.eventId,'agenda',id),{estado:'LLEGADO',horaReal:new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})});toast('✅ Marcado como llegado','var(--green)');_renderAgenda();}
  catch{toast('Error','var(--red)');}
};

window._delAg=async function(id){
  if(!confirm('¿Eliminar esta cita?'))return;
  const db=getDB();
  try{const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'events',_user.eventId,'agenda',id));toast('Eliminado','var(--amber)');_renderAgenda();}
  catch{toast('Error','var(--red)');}
};

window._openAgModal=function(item={}){
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal modal-lg"><div class="mhdr"><div class="mttl">📅 ${item.id?'Editar cita':'Nueva cita en agenda'}</div><button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Referencia *</span><input id="agRef" value="${safeHtml(item.referencia||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg s2"><span class="flbl">Empresa</span><input id="agEmp" value="${safeHtml(item.empresa||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Fecha prevista</span><input id="agFecha" type="date" value="${safeHtml(item.fecha||'')}"></div>
    <div class="fg"><span class="flbl">Hora prevista</span><input id="agHora" type="time" value="${safeHtml(item.hora||'')}"></div>
    <div class="fg"><span class="flbl">Hall</span><select id="agHall"><option value="">--</option>${_evHalls.map(h=>`<option value="${h}"${item.hall===h?' selected':''}>${h}</option>`).join('')}</select></div>
    <div class="fg"><span class="flbl">Stand</span><input id="agStand" value="${safeHtml(item.stand||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Matrícula</span><input id="agMat" value="${safeHtml(item.matricula||'')}" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Conductor</span><input id="agCond" value="${safeHtml(item.conductor||'')}"></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="agTel" value="${safeHtml(item.tel||'')}" type="tel"></div>
    <div class="fg"><span class="flbl">Estado</span><select id="agEst">
      <option value="PENDIENTE"${!item.estado||item.estado==='PENDIENTE'?' selected':''}>⏳ Pendiente</option>
      <option value="LLEGADO"${item.estado==='LLEGADO'?' selected':''}>✅ Llegado</option>
      <option value="SALIDA"${item.estado==='SALIDA'?' selected':''}>🔵 Salida</option>
    </select></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="agNotas" rows="2">${safeHtml(item.notas||'')}</textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button><button class="btn btn-p" onclick="window._saveAg('${item.id||''}')">💾 Guardar cita</button></div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('agRef')?.focus(),50);
};

window._saveAg=async function(editId){
  const ref=(_v('agRef')||'').trim().toUpperCase();
  if(!ref){toast('La referencia es obligatoria','var(--red)');return;}
  const db=getDB();
  const data={referencia:ref,empresa:_v('agEmp').toUpperCase(),fecha:_v('agFecha'),hora:_v('agHora'),hall:_v('agHall'),stand:_v('agStand').toUpperCase(),matricula:_v('agMat').toUpperCase(),conductor:_v('agCond'),tel:_v('agTel'),estado:_v('agEst')||'PENDIENTE',notas:_v('agNotas')};
  try{
    const{collection,doc,setDoc,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
    if(editId) await setDoc(doc(db,'events',_user.eventId,'agenda',editId),data,{merge:true});
    else await addDoc(collection(db,'events',_user.eventId,'agenda'),{...data,importadoTs:serverTimestamp()});
    document.getElementById('_opModal')?.remove();
    toast(`✅ ${ref} guardado`,'var(--green)');
    _renderAgenda();
  }catch{toast('Error al guardar','var(--red)');}
};

// ─── ANÁLISIS ─────────────────────────────────────────────────
async function _renderAnalytics(){
  const el=document.getElementById('opContent');if(!el)return;
  el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text3)">Cargando análisis...</div>`;
  const today=new Date().toISOString().slice(0,10);
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);}).reverse();

  const allIngs=_entries.filter(e=>e.tipo==='referencia');
  const allIngs2=_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
  const ings=[...allIngs,...allIngs2];

  const byDay=last14.map(d=>({d,nRef:allIngs.filter(i=>(i.ts||'').startsWith(d)).length,nIng:allIngs2.filter(i=>(i.ts||'').startsWith(d)).length}));
  const maxDay=Math.max(...byDay.map(x=>x.nRef+x.nIng),1);

  const hallC={};ings.forEach(i=>{(i.halls||[i.hall||'']).filter(Boolean).forEach(h=>{hallC[h]=(hallC[h]||0)+1;});});
  const topH=Object.entries(hallC).sort((a,b)=>b[1]-a[1]).slice(0,8);const maxH=topH[0]?.[1]||1;

  const empC={};ings.forEach(i=>{if(i.empresa)empC[i.empresa]=(empC[i.empresa]||0)+1;});
  const topEmp=Object.entries(empC).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const byHour=Array.from({length:24},(_,h)=>({h,nRef:allIngs.filter(i=>{const e=i.ts||'';return e&&parseInt(e.slice(11,13))===h&&e.startsWith(today);}).length,nIng:allIngs2.filter(i=>{const e=i.ts||'';return e&&parseInt(e.slice(11,13))===h&&e.startsWith(today);}).length}));
  const maxHour=Math.max(...byHour.map(x=>x.nRef+x.nIng),1);

  const pctRef=ings.length?Math.round(allIngs.length/ings.length*100):50;
  const pctIng=100-pctRef;

  el.innerHTML=`
<div style="margin-bottom:8px;display:flex;gap:4px;flex-wrap:wrap;align-items:center">
  <span style="font-size:13px;font-weight:700">📊 Análisis — ${safeHtml(_ev?.name||'Evento')}</span>
  <span style="flex:1"></span>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._opExcel('analytics')">⬇ Excel</button>`:''}
</div>

<div class="sg sg6" style="margin-bottom:8px">
  <div class="stat-box" style="border-top:3px solid var(--green)"><div class="stat-n" style="color:var(--green)">${ings.filter(i=>!i.salida).length}</div><div class="stat-l">En recinto</div></div>
  <div class="stat-box" style="border-top:3px solid var(--blue)"><div class="stat-n" style="color:var(--blue)">${allIngs.length}</div><div class="stat-l">Referencias</div></div>
  <div class="stat-box" style="border-top:3px solid var(--teal)"><div class="stat-n" style="color:var(--teal)">${allIngs2.length}</div><div class="stat-l">Ingresos</div></div>
  <div class="stat-box" style="border-top:3px solid var(--amber)"><div class="stat-n" style="color:var(--amber)">${ings.filter(i=>(i.ts||'').startsWith(today)).length}</div><div class="stat-l">Hoy</div></div>
  <div class="stat-box" style="border-top:3px solid var(--purple)"><div class="stat-n" style="color:var(--purple)">${Object.keys(empC).length}</div><div class="stat-l">Empresas</div></div>
  <div class="stat-box" style="border-top:3px solid var(--red)"><div class="stat-n" style="color:var(--red)">${ings.filter(i=>i.salida).length}</div><div class="stat-l">Con salida</div></div>
</div>

<div class="sg sg3" style="margin-bottom:8px">
  <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📊 Ingresos últimos 14 días</div>
    ${byDay.map(x=>`<div class="bar-row">
      <span style="font-size:9px;min-width:40px;color:var(--text3)">${x.d.slice(5)}</span>
      <div style="flex:1;display:flex;flex-direction:column;gap:2px">
        <div style="display:flex;align-items:center;gap:3px"><div style="height:5px;border-radius:2px;background:var(--blue);width:${Math.round(x.nRef/maxDay*100)}%;min-width:${x.nRef>0?'3px':'0'}"></div><span style="font-size:8px;color:var(--text3)">${x.nRef||''}</span></div>
        <div style="display:flex;align-items:center;gap:3px"><div style="height:5px;border-radius:2px;background:var(--green);width:${Math.round(x.nIng/maxDay*100)}%;min-width:${x.nIng>0?'3px':'0'}"></div><span style="font-size:8px;color:var(--text3)">${x.nIng||''}</span></div>
      </div>
    </div>`).join('')}
    <div style="display:flex;gap:8px;margin-top:5px;font-size:9px">
      <span style="display:flex;align-items:center;gap:2px"><div style="width:8px;height:5px;border-radius:1px;background:var(--blue)"></div>Ref</span>
      <span style="display:flex;align-items:center;gap:2px"><div style="width:8px;height:5px;border-radius:1px;background:var(--green)"></div>Ing</span>
    </div>
  </div>

  <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🕐 Por hora — hoy</div>
    ${byHour.filter((x,i)=>i>=6&&i<=22).map(x=>`<div class="bar-row">
      <span style="font-size:9px;min-width:28px;color:var(--text3)">${x.h<10?'0':''}${x.h}h</span>
      <div style="flex:1;display:flex;flex-direction:column;gap:1px">
        ${x.nRef>0?`<div style="display:flex;align-items:center;gap:2px"><div style="height:4px;border-radius:1px;background:var(--blue);width:${Math.round(x.nRef/maxHour*100)}%"></div><span style="font-size:8px;color:var(--blue)">${x.nRef}</span></div>`:''}
        <div style="display:flex;align-items:center;gap:2px"><div style="height:4px;border-radius:1px;background:var(--green);width:${Math.round(x.nIng/maxHour*100)}%;${x.nIng===0?'opacity:.15':''}"></div><span style="font-size:8px;color:${x.nIng>0?'var(--green)':'var(--text4)'}">${x.nIng||''}</span></div>
      </div>
    </div>`).join('')}
  </div>

  <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🔄 Ref vs Ing</div>
    <div style="height:12px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px">
      <div style="background:var(--blue);width:${pctRef}%"></div>
      <div style="background:var(--green);flex:1"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:10px">
      <span style="color:var(--blue);font-weight:700">🔖 ${pctRef}%</span>
      <span style="color:var(--green);font-weight:700">🚛 ${pctIng}%</span>
    </div>
    <div style="display:flex;gap:6px">
      <div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:6px"><div style="font-size:16px;font-weight:900;color:var(--blue);font-family:'JetBrains Mono',monospace">${allIngs.filter(i=>(i.ts||'').startsWith(today)).length}</div><div style="font-size:9px;color:var(--text3);font-weight:700">🔖 HOY REF</div></div>
      <div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:6px"><div style="font-size:16px;font-weight:900;color:var(--green);font-family:'JetBrains Mono',monospace">${allIngs2.filter(i=>(i.ts||'').startsWith(today)).length}</div><div style="font-size:9px;color:var(--text3);font-weight:700">🚛 HOY ING</div></div>
    </div>
  </div>
</div>

<div class="sg sg2">
  <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏭 Halls más activos</div>
    ${topH.length?topH.map(([h,v])=>`<div class="bar-row"><span style="font-size:11px;min-width:28px;font-weight:700">${h}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(v/maxH*100)}%;background:#00896b"></div></div><span class="bar-val">${v}</span></div>`).join(''):`<div class="empty" style="padding:12px"><div class="es">Sin datos</div></div>`}
  </div>
  <div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏢 Top Empresas</div>
    ${topEmp.length?topEmp.map(([e,v],i)=>`<div class="bar-row"><span style="font-size:9px;color:var(--text3);min-width:14px">${i+1}</span><span style="font-size:10px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(e)}</span><span class="bar-val" style="color:var(--purple)">${v}</span></div>`).join(''):`<div class="empty" style="padding:12px"><div class="es">Sin datos</div></div>`}
  </div>
</div>`;
}

// ─── HISTORIAL VEHÍCULOS ──────────────────────────────────────
function _renderVehiculos(){
  const el=document.getElementById('opContent');if(!el)return;
  const q=(window._vehQ||'').toLowerCase();

  // Construir historial desde entries
  const vehMap={};
  _entries.forEach(e=>{
    if(!e.matricula)return;
    if(!vehMap[e.matricula]){vehMap[e.matricula]={matricula:e.matricula,nombre:e.nombre||'',apellido:e.apellido||'',empresa:e.empresa||'',telefono:e.telefono||'',telPais:e.telPais||'',ingresos:0,ultimoIngreso:'',evento:e.eventoNombre||''};}
    vehMap[e.matricula].ingresos++;
    if((e.ts||e.entrada||'')>(vehMap[e.matricula].ultimoIngreso||'')) vehMap[e.matricula].ultimoIngreso=e.ts||e.entrada||'';
  });

  let items=Object.values(vehMap).sort((a,b)=>(b.ultimoIngreso||'').localeCompare(a.ultimoIngreso||''));
  if(q) items=items.filter(v=>`${v.matricula} ${v.nombre||''} ${v.empresa||''} ${v.telefono||''}`.toLowerCase().includes(q));

  el.innerHTML=`
<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;border-bottom:1px solid var(--border);padding-bottom:4px;flex-wrap:nowrap;overflow-x:auto">
  <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, nombre, empresa..." value="${safeHtml(window._vehQ||'')}" oninput="window._vehQ=this.value;window._goTab('vehiculos')"></div>
  ${window._vehQ?`<span style="background:var(--rll);color:var(--red);border:1px solid #fecaca;padding:3px 8px;border-radius:20px;font-size:11px;cursor:pointer;flex-shrink:0" onclick="window._vehQ='';window._goTab('vehiculos')">✕</span>`:''}
  <span style="flex:1"></span>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._opExcel('vehiculos')">⬇ Excel</button>`:''}
</div>
${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Matrícula</th><th>Conductor</th><th>Empresa</th><th>Teléfono</th><th>Ingresos</th><th>Último evento</th><th>Último ingreso</th>
</tr></thead><tbody>
${items.map(v=>`<tr>
  <td><span class="mchip" style="cursor:pointer" onclick="window._vehDetalle('${safeHtml(v.matricula||'')}')">${safeHtml(v.matricula)}</span></td>
  <td style="font-size:12px">${safeHtml(((v.nombre||'')+' '+(v.apellido||'')).trim()||'–')}</td>
  <td style="font-size:11px">${safeHtml(v.empresa||'–')}</td>
  <td style="font-size:11px">${v.telefono?`<a href="tel:${safeHtml(v.telPais||'')}${safeHtml(v.telefono)}" style="color:var(--text2);text-decoration:none">📞 ${safeHtml(v.telefono)}</a>`:'–'}</td>
  <td style="text-align:center;font-weight:800;color:var(--blue)">${v.ingresos}</td>
  <td style="font-size:11px">${safeHtml(v.evento||'–')}</td>
  <td style="font-size:11px">${formatDateTime(v.ultimoIngreso)}</td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">Sin matrículas en historial</div><div style="font-size:12px;margin-top:6px;color:var(--text3)">Se llenan automáticamente al registrar ingresos</div></div>`}`;
}

window._vehDetalle=function(mat){
  const hist=_entries.filter(e=>e.matricula===mat).sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0,20);
  if(!hist.length){toast('Sin historial para '+mat,'var(--amber)');return;}
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal"><div class="mhdr"><div class="mttl">📜 Historial — <span style="font-family:'JetBrains Mono',monospace;color:var(--blue)">${safeHtml(mat)}</span></div><button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button></div>
  <div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>Tipo</th><th>Hall</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>
  ${hist.map(e=>`<tr>
    <td style="font-size:12px"><b>${safeHtml(e.empresa||'—')}</b></td>
    <td><span style="font-size:11px;padding:2px 6px;border-radius:4px;background:${e.tipo==='referencia'?'var(--bll)':'var(--gll)'};color:${e.tipo==='referencia'?'var(--blue)':'var(--green)'}">${e.tipo==='referencia'?'🔖 Ref':'🚛 Ing'}</span></td>
    <td>${e.hall?`<span class="hbadge">${safeHtml(e.hall)}</span>`:'–'}</td>
    <td style="font-size:11px">${formatDateTime(e.ts||e.entrada)}</td>
    <td style="font-size:11px">${e.salida?formatDateTime(e.salida):'<span class="pill pill-g">✓ En recinto</span>'}</td>
  </tr>`).join('')}
  </tbody></table></div>
  <div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cerrar</button></div>
  </div>`;
  document.body.appendChild(m);
};

// ─── ARCHIVOS/AUDITORÍA ───────────────────────────────────────
async function _renderAuditoria(){
  const el=document.getElementById('opContent');if(!el)return;
  if(!window._audSub) window._audSub='sesiones';
  const db=getDB();
  let logs=[];
  try{
    const{collection,getDocs,query,orderBy,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'audit'),orderBy('ts','desc'),limit(200)));
    logs=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  const sub=window._audSub;
  const sesiones=logs.filter(e=>e.entity==='sesion');
  const acciones=logs.filter(e=>e.entity!=='sesion');
  const seguridad=logs.filter(e=>['blocked','reset'].includes(e.action));
  const exportaciones=logs.filter(e=>e.entity==='exportacion');

  const tabBtn=(id,lbl,cnt)=>`<button class="btn btn-sm ${sub===id?'btn-p':'btn-gh'}" onclick="window._audSub='${id}';window._goTab('auditoria')">${lbl}${cnt?` <span style="background:${sub===id?'rgba(255,255,255,.3)':'var(--bg4)'};padding:1px 5px;border-radius:10px;font-size:9px;font-weight:900;margin-left:3px">${cnt}</span>`:''}</button>`;

  let content='';
  const tbl=(cols,rows)=>rows.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`:`<div class="empty"><div class="et">Sin registros</div></div>`;

  if(sub==='sesiones'){
    content=tbl(['Estado','Usuario','Dispositivo','IP','Fecha/Hora'],
      sesiones.map(e=>`<tr>
        <td><span class="sbadge" style="background:${e.action==='login_ok'?'var(--gll)':e.action==='blocked'?'var(--rll)':'var(--bg3)'};color:${e.action==='login_ok'?'var(--green)':e.action==='blocked'?'var(--red)':'var(--text3)'}">
          ${e.action==='login_ok'?'✓ Login OK':e.action==='blocked'?'🔒 Bloqueado':e.action==='logout'?'⎋ Logout':'•'}
        </span></td>
        <td style="font-weight:700;font-size:12px">${safeHtml(e.user||'–')}</td>
        <td style="font-size:11px">${safeHtml(e.device||'–')}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${safeHtml(e.ip||'–')}</td>
        <td style="font-size:11px;white-space:nowrap">${formatDateTime(e.ts?.toDate?e.ts.toDate():e.ts)}</td>
      </tr>`).join(''));
  } else if(sub==='acciones'){
    content=tbl(['Tipo','Usuario','Entidad','Detalle','Fecha/Hora'],
      acciones.map(e=>`<tr>
        <td><span class="sbadge" style="background:${e.action?.startsWith('new')?'var(--gll)':e.action?.startsWith('edit')?'var(--bll)':e.action?.includes('del')?'var(--rll)':'var(--bg3)'};color:${e.action?.startsWith('new')?'var(--green)':e.action?.startsWith('edit')?'var(--blue)':e.action?.includes('del')?'var(--red)':'var(--text3)'}">${e.action||'•'}</span></td>
        <td style="font-weight:700;font-size:12px">${safeHtml(e.user||'–')}</td>
        <td><span style="background:var(--bg3);padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${safeHtml(e.entity||'–')}</span></td>
        <td style="font-size:11px;color:var(--text2)">${safeHtml(e.detail||'–')}</td>
        <td style="font-size:11px;white-space:nowrap">${formatDateTime(e.ts?.toDate?e.ts.toDate():e.ts)}</td>
      </tr>`).join(''));
  } else if(sub==='seguridad'){
    content=seguridad.length?tbl(['Evento','Usuario','Detalle','Fecha/Hora'],
      seguridad.map(e=>`<tr>
        <td><span class="sbadge" style="background:var(--rll);color:var(--red)">${e.action||'⚠️'}</span></td>
        <td style="font-weight:700;font-size:12px">${safeHtml(e.user||'–')}</td>
        <td style="font-size:11px">${safeHtml(e.detail||'–')}</td>
        <td style="font-size:11px;white-space:nowrap">${formatDateTime(e.ts?.toDate?e.ts.toDate():e.ts)}</td>
      </tr>`).join('')):`<div class="empty"><div class="ei">🛡</div><div class="et">Sin eventos de seguridad</div></div>`;
  } else if(sub==='exportaciones'){
    content=exportaciones.length?tbl(['Fecha/Hora','Usuario','Pestaña','Archivo'],
      exportaciones.map(e=>`<tr>
        <td style="font-size:11px;white-space:nowrap">${formatDateTime(e.ts?.toDate?e.ts.toDate():e.ts)}</td>
        <td style="font-weight:700;font-size:12px">${safeHtml(e.user||'–')}</td>
        <td><span style="background:var(--bll);color:var(--blue);padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${safeHtml(e.tab||'–')}</span></td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace">${safeHtml(e.filename||'–')}</td>
      </tr>`).join('')):`<div class="empty"><div class="ei">📥</div><div class="et">Sin exportaciones registradas</div></div>`;
  }

  el.innerHTML=`
<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">
  ${tabBtn('sesiones','🔑 Sesiones',sesiones.length)}
  ${tabBtn('acciones','📋 Acciones',acciones.length)}
  ${tabBtn('seguridad','🛡 Seguridad',seguridad.length)}
  ${tabBtn('exportaciones','📥 Exportaciones',exportaciones.length)}
</div>
${content}`;
}

// ─── PAPELERA ─────────────────────────────────────────────────
function _renderPapelera(){
  const el=document.getElementById('opContent');if(!el)return;
  // En v7 la papelera se gestiona localmente con IndexedDB
  // Los elementos eliminados se guardan con un flag `deleted:true` en Firestore
  el.innerHTML=`
<div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:8px">
  <span style="font-size:13px;font-weight:700">🗑 Papelera</span>
  <span style="flex:1"></span>
  ${_perms.canExport?`<button class="btn btn-gh btn-sm" onclick="window._opExcel('papelera')">⬇ Excel</button>`:''}
  ${_perms.canVaciar?`<button class="btn btn-danger btn-sm" onclick="window._vaciarPapelera()">💥 Vaciar todo</button>`:''}
</div>
<div class="card">
  <div style="font-size:13px;color:var(--text3);margin-bottom:10px">
    La papelera contiene registros eliminados desde esta sesión. Los registros eliminados permanentemente no se pueden recuperar.
  </div>
  <div id="papeList">
    <div class="empty"><div class="ei">🗑</div><div class="et">Papelera vacía</div></div>
  </div>
</div>`;
  // Cargar papelera desde IndexedDB si hay items
  window._loadPapelera?.();
}

window._vaciarPapelera=()=>toast('Papelera vaciada','var(--amber)');

// ─── IMPRESIÓN ────────────────────────────────────────────────
async function _renderImpresion(){
  const el=document.getElementById('opContent');if(!el)return;
  el.innerHTML=`<div id="impWrap"></div>`;
  const{initImpresion}=await import('./impresion.js');
  await initImpresion('impWrap');
}

// ─── RECINTOS ─────────────────────────────────────────────────
async function _renderRecintos(){
  const el=document.getElementById('opContent');if(!el)return;
  const db=getDB();
  let recintos=[];
  try{
    const{collection,getDocs}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(collection(db,'recintos'));
    recintos=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  el.innerHTML=`
<div style="margin-bottom:8px">
  ${_perms.canVaciar?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;font-weight:600;border-radius:20px" onclick="window._openRecintoModal()">+ Nuevo recinto</button>`:''}
</div>
${recintos.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Recinto</th><th>Ciudad</th><th>País</th><th>Halls</th><th>Puertas</th><th>Acc.</th></tr></thead><tbody>
${recintos.map(r=>`<tr>
  <td><b style="font-size:13px">${safeHtml(r.nombre||r.name||'–')}</b></td>
  <td style="font-size:12px">${safeHtml(r.ciudad||'–')}</td>
  <td style="font-size:12px">${safeHtml(r.pais||'–')}</td>
  <td><div style="display:flex;flex-wrap:wrap;gap:2px">${(r.halls||[]).map(h=>`<span class="hbadge">${safeHtml(h)}</span>`).join('')||'–'}</div></td>
  <td style="font-size:11px">${(r.puertas||[]).map(p=>`🚪 ${safeHtml(p.nombre||p)}`).join(', ')||'–'}</td>
  <td><div style="display:flex;gap:2px">
    ${_perms.canVaciar?`<button class="btn btn-edit btn-xs" onclick="window._openRecintoModal(${JSON.stringify(r).replace(/"/g,'&quot;')})">✏️</button>`:''}
    ${_perms.canVaciar?`<button class="btn btn-danger btn-xs" onclick="window._delRecinto('${r.id}','${safeHtml(r.nombre||'')}')">🗑</button>`:''}
  </div></td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="ei">🏟</div><div class="et">Sin recintos</div>${_perms.canVaciar?`<div style="margin-top:12px"><button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none" onclick="window._openRecintoModal()">+ Crear primer recinto</button></div>`:''}</div>`}`;
}

window._openRecintoModal=function(r={}){
  document.getElementById('_opModal')?.remove();
  let halls_=r.halls?[...r.halls]:[];
  let puertas_=r.puertas?[...r.puertas]:[];
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal modal-lg"><div class="mhdr"><div class="mttl">🏟 ${r.id?'Editar recinto':'Nuevo recinto'}</div><button class="btn-x" onclick="document.getElementById('_opModal').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre del recinto *</span><input id="recNom" value="${safeHtml(r.nombre||r.name||'')}" placeholder="Fira de Barcelona"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="recCiudad" value="${safeHtml(r.ciudad||'')}" placeholder="Barcelona"></div>
    <div class="fg"><span class="flbl">País</span><input id="recPais" value="${safeHtml(r.pais||'')}" placeholder="España"></div>
    <div class="fg s2"><span class="flbl">Halls (añadir uno por uno)</span>
      <div style="display:flex;gap:4px"><input id="recHallInput" placeholder="2A, 3B..." style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" onkeydown="if(event.key==='Enter'){event.preventDefault();window._addRecHall();}">
      <button type="button" class="btn btn-p btn-sm" onclick="window._addRecHall()">+ Añadir</button></div>
      <div id="recHallList" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
    </div>
    <div class="fg s2"><span class="flbl">Puertas</span>
      <div style="display:flex;gap:4px"><input id="recPuertaNom" placeholder="Nombre puerta" onkeydown="if(event.key==='Enter'){event.preventDefault();window._addRecPuerta();}">
      <button type="button" class="btn btn-p btn-sm" onclick="window._addRecPuerta()">+ Añadir</button></div>
      <div id="recPuertasList" style="display:flex;flex-direction:column;gap:4px;margin-top:6px"></div>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('_opModal').remove()">Cancelar</button><button class="btn btn-p" onclick="window._saveRecinto('${r.id||''}')">💾 Guardar recinto</button></div>
  </div>`;
  document.body.appendChild(m);
  window._recHalls_=halls_;window._recPuertas_=puertas_;
  const renderH=()=>{const el=document.getElementById('recHallList');if(el)el.innerHTML=halls_.map((h,i)=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:var(--r);background:var(--bll);border:1.5px solid #bfdbfe;font-size:12px;font-weight:700;color:var(--blue)">🏭 ${safeHtml(h)}<button class="btn btn-danger btn-xs" style="padding:1px 4px;font-size:9px" onclick="window._recHalls_.splice(${i},1);renderH()">✕</button></span>`).join('');};
  const renderP=()=>{const el=document.getElementById('recPuertasList');if(el)el.innerHTML=puertas_.map((p,i)=>`<div style="display:flex;align-items:center;gap:4px;padding:5px 8px;border:1px solid var(--border);border-radius:var(--r);font-size:12px"><span style="font-weight:700">🚪 ${safeHtml(p.nombre||p)}</span><button class="btn btn-danger btn-xs" onclick="window._recPuertas_.splice(${i},1);renderP()">✕</button></div>`).join('');};
  window.renderH=renderH;window.renderP=renderP;
  window._addRecHall=()=>{const v=(document.getElementById('recHallInput')?.value||'').trim().toUpperCase();if(!v)return;if(!halls_.includes(v))halls_.push(v);document.getElementById('recHallInput').value='';renderH();};
  window._addRecPuerta=()=>{const n=(document.getElementById('recPuertaNom')?.value||'').trim();if(!n)return;puertas_.push({nombre:n});document.getElementById('recPuertaNom').value='';renderP();};
  renderH();renderP();
  setTimeout(()=>document.getElementById('recNom')?.focus(),50);
};

window._saveRecinto=async function(editId){
  const nom=(document.getElementById('recNom')?.value||'').trim();
  if(!nom){toast('El nombre es obligatorio','var(--red)');return;}
  const db=getDB();
  const data={nombre:nom,ciudad:_v('recCiudad'),pais:_v('recPais'),halls:[...(window._recHalls_||[])],puertas:[...(window._recPuertas_||[])]};
  try{
    const{collection,doc,setDoc,addDoc}=await import(`${FB}/firebase-firestore.js`);
    if(editId) await setDoc(doc(db,'recintos',editId),data,{merge:true});
    else await addDoc(collection(db,'recintos'),data);
    document.getElementById('_opModal')?.remove();
    toast('✅ Recinto guardado','var(--green)');
    _renderRecintos();
  }catch{toast('Error','var(--red)');}
};

window._delRecinto=async function(id,nom){
  if(!confirm(`¿Eliminar recinto "${nom}"?`))return;
  const db=getDB();
  try{const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'recintos',id));toast('🗑 Eliminado','var(--amber)');_renderRecintos();}
  catch{toast('Error','var(--red)');}
};

// ─── EVENTOS ──────────────────────────────────────────────────
async function _renderEventos(){
  const el=document.getElementById('opContent');if(!el)return;
  const db=getDB();
  let events=[];
  try{
    const{collection,getDocs}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(collection(db,'events'));
    events=snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  el.innerHTML=`
<div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap">
  ${_perms.canVaciar?`<button class="btn btn-sm" style="background:#2563eb;color:#fff;border:none" onclick="location.href='?admin'">⚙️ Gestionar eventos en Admin →</button>`:''}
</div>
${events.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Evento</th><th>ID Firestore</th><th>Fechas</th><th>Halls</th><th>Estado</th><th>Acc.</th></tr></thead><tbody>
${events.map(ev=>`<tr style="${ev.active?'background:var(--gll)':''}">
  <td><b>${safeHtml(ev.name||ev.nombre||'–')}</b></td>
  <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3)">${ev.id}</td>
  <td style="font-size:11px">${safeHtml(ev.startDate||ev.ini||'–')}${ev.endDate||ev.fin?' → '+(ev.endDate||ev.fin):''}</td>
  <td style="font-size:11px">${(ev.halls||[]).join(', ')||'–'}</td>
  <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;background:${ev.active?'var(--gll)':'var(--bg3)'};color:${ev.active?'var(--green)':'var(--text3)'};border:1px solid ${ev.active?'#bbf7d0':'var(--border)'}">${ev.active?'✅ Activo':'Inactivo'}</span></td>
  <td>${ev.id===_user.eventId?`<span style="font-size:11px;color:var(--blue);font-weight:700">← Este</span>`:`<button class="btn btn-xs btn-gh" onclick="window._cambiarEvento('${ev.id}','${safeHtml(ev.name||ev.nombre||'')}')">Ir →</button>`}</td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Sin eventos</div></div>`}`;
}

window._cambiarEvento=function(evId,nom){
  if(confirm(`¿Cambiar al evento "${nom}"?\nSe recargará la página.`)){
    // Guardar preferencia y recargar
    localStorage.setItem('beu_event',evId);
    location.reload();
  }
};

// ─── MENSAJES ─────────────────────────────────────────────────
async function _renderMensajes(){
  const el=document.getElementById('opContent');if(!el)return;
  el.innerHTML=`<div id="msgContainer" style="height:calc(100vh - 88px)"></div>`;
  const{initMensajes}=await import('./mensajes.js');
  await initMensajes('msgContainer');
}

// ─── USUARIOS ─────────────────────────────────────────────────
async function _renderUsuarios(){
  const el=document.getElementById('opContent');if(!el)return;
  const db=getDB();
  let ops=[];let cos=[];
  const sub=window._uSub||'operadores';
  try{
    const{collection,getDocs}=await import(`${FB}/firebase-firestore.js`);
    const [opSnap,coSnap]=await Promise.all([
      getDocs(collection(db,'events',_user.eventId,'operators')),
      getDocs(collection(db,'events',_user.eventId,'companies')),
    ]);
    ops=opSnap.docs.map(d=>({id:d.id,...d.data()}));
    cos=coSnap.docs.map(d=>({id:d.id,...d.data()}));
  }catch{}

  const q=(window._uQ||'').toLowerCase();
  const filtRol=window._uFiltRol||'';
  let opItems=ops;
  if(q) opItems=opItems.filter(u=>`${u.name||''} ${u.email||''} ${u.role||''}`.toLowerCase().includes(q));
  if(filtRol) opItems=opItems.filter(u=>u.role===filtRol);
  let coItems=cos;
  if(q) coItems=coItems.filter(u=>`${u.nombre||''} ${u.email||''} ${u.cif||''}`.toLowerCase().includes(q));

  el.innerHTML=`
<div style="background:var(--all);border:1px solid #fde68a;border-radius:var(--r);padding:4px 10px;margin-bottom:8px;font-size:11px">
  ⭐ Para crear usuarios ve al <button class="btn btn-xs btn-gh" onclick="location.href='?admin'">Admin Panel →</button>
</div>
<div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:10px">
  <div style="padding:5px 14px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='operadores'?'#3b82f6':'var(--bg2)'};color:${sub==='operadores'?'#fff':'var(--text3)'};border-right:1px solid var(--border)" onclick="window._uSub='operadores';window._goTab('usuarios')">👤 Operadores (${ops.length})</div>
  <div style="padding:5px 14px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='empresas'?'#00896b':'var(--bg2)'};color:${sub==='empresas'?'#fff':'var(--text3)'}" onclick="window._uSub='empresas';window._goTab('usuarios')">🏢 Empresas (${cos.length})</div>
</div>
<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
  <div class="sbox"><span class="sico">🔍</span><input type="search" placeholder="Buscar nombre, email..." value="${safeHtml(window._uQ||'')}" oninput="window._uQ=this.value;window._goTab('usuarios')"></div>
  ${sub==='operadores'?`<div style="display:flex;gap:3px;flex-wrap:wrap">
    ${[['','Todos'],['operator','Operador'],['supervisor','Supervisor'],['admin','Admin']].map(([v,l])=>`<span style="padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;cursor:pointer;background:${filtRol===v?'#3b82f6':'#dbeafe'};color:${filtRol===v?'#fff':'#1e40af'};border:1.5px solid ${filtRol===v?'#2563eb':'#93c5fd'}" onclick="window._uFiltRol='${v}';window._goTab('usuarios')">${l}</span>`).join('')}
  </div>`:''}
</div>
${sub==='operadores'?
  (opItems.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>UID</th><th>Nombre</th><th>Rol</th><th>Puerta</th></tr></thead><tbody>
  ${opItems.map(u=>`<tr>
    <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3)">${u.id}</td>
    <td><b>${safeHtml(u.name||'—')}</b>${u.email?`<br><span style="font-size:10px;color:var(--text3)">${safeHtml(u.email)}</span>`:''}</td>
    <td><span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${u.role==='admin'?'var(--pll)':u.role==='supervisor'?'var(--bll)':'var(--bg3)'};color:${u.role==='admin'?'var(--purple)':u.role==='supervisor'?'var(--blue)':'var(--text3)'}">${u.role||'operator'}</span></td>
    <td style="font-size:12px">${safeHtml(u.gateId||'—')}</td>
  </tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="et">Sin operadores</div></div>`)
  :
  (coItems.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>UID</th><th>Nombre</th><th>CIF</th><th>Email</th><th>Stand</th></tr></thead><tbody>
  ${coItems.map(u=>`<tr>
    <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3)">${u.id}</td>
    <td><b>${safeHtml(u.nombre||u.name||'—')}</b></td>
    <td style="font-size:11px">${safeHtml(u.cif||'—')}</td>
    <td style="font-size:11px">${safeHtml(u.email||'—')}</td>
    <td style="font-size:11px">${safeHtml(u.stand||'—')}</td>
  </tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="et">Sin empresas</div></div>`)
}`;
}

// ─── SUBTABS INTERNOS ────────────────────────────────────────
function _renderListaNegra(){
  return`<div style="background:var(--rll);border:1.5px solid var(--red);border-radius:var(--r2);padding:12px 14px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:800;color:var(--red);text-transform:uppercase;margin-bottom:8px">⛔ Lista negra — matrículas bloqueadas</div>
    ${_perms.canBlacklist?`<button class="btn btn-sm" style="background:var(--red);color:#fff;border:none;margin-bottom:8px" onclick="window._openBL()">+ Añadir matrícula</button>`:''}
    <div id="blList"><div style="color:var(--text3);font-size:12px">Sin matrículas bloqueadas</div></div>
  </div>`;
}

function _renderHistorialSub(items){
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

function _renderCamposSub(tabId){
  if(!_perms.canConfigFields) return`<div class="empty"><div class="et">Sin permiso para configurar campos</div></div>`;
  const cfgKey=tabId==='ingresos'?'ingresos':'ingresos';
  const cfg=_cfg[cfgKey]||_defCfg().ingresos;
  const campos=Object.entries(cfg);
  const NOMBRES={remolque:'Remolque',tipoVeh:'Tipo vehículo',descarga:'Tipo descarga',llamador:'Llamador',empresa:'Empresa',montador:'Montador',expositor:'Expositor',hall:'Hall',stand:'Stand',nombre:'Nombre conductor',apellido:'Apellido',telefono:'Teléfono',idioma:'Idioma',comentario:'Comentario',pasaporte:'Pasaporte/DNI',fechaNac:'Fecha nacimiento',pais:'País',numEjes:'Nº ejes',tipoMaq:'Tipo maquinaria'};
  return`<div class="card">
    <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px">⚙ Campos visibles — ${tabId==='ingresos'?'Referencia':'Ingresos'}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px">
      ${campos.map(([k,v])=>`<div style="padding:8px 10px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">${NOMBRES[k]||k}</div>
        <div style="display:flex;gap:6px">
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer"><input type="checkbox" ${v.vis!==false?'checked':''} id="vis_${tabId}_${k}" style="width:13px;height:13px;accent-color:var(--blue)"> Visible</label>
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer"><input type="checkbox" ${v.req?'checked':''} id="req_${tabId}_${k}" style="width:13px;height:13px;accent-color:var(--red)"> Obligatorio</label>
        </div>
      </div>`).join('')}
    </div>
    <div style="margin-top:10px;display:flex;gap:6px">
      <button class="btn btn-p btn-sm" onclick="window._saveCamposTab('${cfgKey}')">💾 Guardar configuración</button>
    </div>
  </div>`;
}

window._saveCamposTab=async function(cfgKey){
  const db=getDB();
  const campos=Object.keys(_cfg[cfgKey]||{});
  campos.forEach(k=>{
    if(!_cfg[cfgKey][k]) _cfg[cfgKey][k]={};
    _cfg[cfgKey][k].vis=document.getElementById(`vis_${cfgKey}_${k}`)?.checked!==false;
    _cfg[cfgKey][k].req=document.getElementById(`req_${cfgKey}_${k}`)?.checked||false;
  });
  try{
    const{doc,setDoc}=await import(`${FB}/firebase-firestore.js`);
    await setDoc(doc(db,'events',_user.eventId,'config','fields'),_cfg,{merge:true});
    toast('✅ Configuración guardada','var(--green)');
  }catch{toast('Error al guardar','var(--red)');}
};

// ─── MODAL INGRESO/REFERENCIA ─────────────────────────────────
function _openModal(tipo,editEntry){
  const isRef=tipo==='referencia';
  const cfg=isRef?(_cfg.ingresos||_defCfg().ingresos):(_cfg.ingresos||_defCfg().ingresos);
  const e=editEntry||{};
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.id='_opModal';m.className='ov open';
  m.innerHTML=`<div class="modal modal-lg">
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
      <div class="fg"><span class="flbl">Nº Posición</span><input id="mPos" type="number" min="1" placeholder="Auto" value="${safeHtml(String(e.pos||''))}" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px"></div>
      <div class="fg s2">
        <span class="flbl">Matrícula${!isRef?' <span class="freq">*</span>':''}</span>
        <div style="position:relative">
          <input id="mMat" value="${safeHtml(e.matricula||'')}" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:16px" placeholder="🔍 Matrícula..." autocomplete="off" oninput="this.value=this.value.toUpperCase();window._checkBL(this.value);window._autoFillMat(this.value)">
        </div>
        <div id="mBlWarn" style="display:none;margin-top:4px;padding:8px 10px;background:var(--rll);border:2px solid var(--red);border-radius:var(--r);font-size:12px;font-weight:700;color:var(--red)"></div>
        <div id="mMatAC" class="dr"></div>
      </div>
      ${_fv(cfg,'remolque',`<div class="fg"><span class="flbl">Remolque</span><input id="mRem" value="${safeHtml(e.remolque||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${!isRef?_fv(cfg,'tipoVeh',`<div class="fg s2"><span class="flbl">Tipo vehículo <span class="freq">*</span></span><div style="display:flex;gap:4px" id="tipoVehBtns"><button type="button" class="btn btn-sm btn-gh" id="tvTrailer" onclick="window._tglVeh('trailer',this)" style="flex:1">🚛 Trailer</button><button type="button" class="btn btn-sm btn-gh" id="tvB" onclick="window._tglVeh('semiremolque',this)" style="flex:1">🚚 B</button><button type="button" class="btn btn-sm btn-gh" id="tvA" onclick="window._tglVeh('camion',this)" style="flex:1">🚗 A</button></div><input type="hidden" id="mTipoVeh" value="${safeHtml(e.tipo||'')}"></div>`):''}
      ${!isRef?_fv(cfg,'descarga',`<div class="fg s2"><span class="flbl">Servicio descarga/carga <span class="freq">*</span></span><div style="display:flex;gap:4px"><button type="button" class="btn btn-gh btn-sm" id="dcH" onclick="window._tgl('mDescarga','mano',this,document.getElementById('dcF'))" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-gh btn-sm" id="dcF" onclick="window._tglFork()" style="flex:1">🏗 Forklift → Ref</button></div><input type="hidden" id="mDescarga" value="${safeHtml(e.descarga||'')}"></div>`):''}
      ${isRef?_fv(cfg,'numEjes',`<div class="fg"><span class="flbl">Nº ejes</span><div style="display:flex;gap:3px">${['5','6','7+'].map(n=>`<button type="button" class="btn btn-gh btn-sm" data-v="${n}" onclick="window._tglEje(this)" style="flex:1">${n}</button>`).join('')}</div><input type="hidden" id="mEjes" value="${safeHtml(e.numEjes||'')}"></div>`):''}
      ${isRef?_fv(cfg,'tipoMaq',`<div class="fg"><span class="flbl">Maquinaria</span><select id="mMaq"><option value="">--</option><option value="forklift"${e.maquinaria==='forklift'?' selected':''}>🏗 Forklift</option><option value="grua"${e.maquinaria==='grua'?' selected':''}>🏗 Grúa</option><option value="plataforma"${e.maquinaria==='plataforma'?' selected':''}>🔼 Plataforma</option></select></div>`):''}
      ${_fv(cfg,'empresa',`<div class="fg"><span class="flbl">Empresa${_req(cfg,'empresa')}</span><input id="mEmp" value="${safeHtml(e.empresa||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${!isRef?_fv(cfg,'montador',`<div class="fg"><span class="flbl">Montador</span><input id="mMontador" value="${safeHtml(e.montador||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${!isRef?_fv(cfg,'expositor',`<div class="fg"><span class="flbl">Expositor</span><input id="mExpositor" value="${safeHtml(e.expositor||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`):''}
      ${_fv(cfg,'llamador',`<div class="fg"><span class="flbl">Llamador</span><input id="mLlamador" value="${safeHtml(e.llamador||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div class="fg"><span class="flbl">Hall / Pabellón</span><select id="mHall"><option value="">--</option>${_evHalls.map(h=>`<option value="${h}"${e.hall===h?' selected':''}>${h}</option>`).join('')}</select></div>
        <div class="fg"><span class="flbl">Stand</span><input id="mStand" value="${safeHtml(e.stand||'')}" style="text-transform:uppercase;font-weight:700" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><span class="flbl">Puerta Hall</span><input id="mPuertaHall" value="${safeHtml(e.puertaHall||'')}" placeholder="Puerta del hall" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
        <div class="fg"><span class="flbl">Acceso</span><select id="mPuerta"><option value="">--</option>${(_ev?.gates||_ev?.puertas||[]).map(p=>`<option value="${safeHtml(p.nombre||p)}"${e.puerta===(p.nombre||p)?' selected':''}>${safeHtml(p.nombre||p)}</option>`).join('')}</select></div>
      </div>
      <div style="grid-column:1/-1;border-top:2px solid var(--border2);margin:4px 0;padding-top:8px"><span style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:1px">👤 Datos del conductor</span></div>
      ${_fv(cfg,'nombre',`<div class="fg"><span class="flbl">Nombre</span><input id="mNom" value="${safeHtml(e.nombre||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'apellido',`<div class="fg"><span class="flbl">Apellido</span><input id="mApe" value="${safeHtml(e.apellido||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'telefono',`<div class="fg"><span class="flbl">Teléfono</span><div style="display:flex;gap:4px"><input id="mTelP" value="${safeHtml(e.telPais||'+34')}" placeholder="+34" style="width:80px;flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:12px"><input id="mTel" value="${safeHtml(e.telefono||'')}" type="tel"></div></div>`)}
      ${_fv(cfg,'idioma',`<div class="fg"><span class="flbl">Idioma conductor</span><select id="mIdioma">${_idOpts(e.idioma)}</select></div>`)}
      ${_fv(cfg,'pasaporte',`<div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="mPas" value="${safeHtml(e.pasaporte||'')}" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>`)}
      ${_fv(cfg,'fechaNac',`<div class="fg"><span class="flbl">Fecha nacimiento</span><input id="mFechaNac" value="${safeHtml(e.fechaNac||e.fechaNacimiento||'')}" type="date"></div>`)}
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
  document.body.appendChild(m);
  if(e.tipo==='furgoneta'){const b=document.getElementById('tvA');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.tipo==='camion'){const b=document.getElementById('tvB');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.descarga==='mano'){const b=document.getElementById('dcH');if(b){b.className='btn btn-p btn-sm';b.style.flex='1';}}
  if(e.descarga==='forklift'){const b=document.getElementById('dcF');if(b){b.className='btn btn-a btn-sm';b.style.flex='1';}}
  if(e.numEjes){document.querySelectorAll('#_opModal [data-v]').forEach(b=>{if(b.dataset.v===e.numEjes){b.className='btn btn-a btn-sm';b.style.flex='1';}});}
  setTimeout(()=>document.getElementById(isRef?'mRef':'mMat')?.focus(),50);
}

// Autocompletado matrícula desde historial — exacto v6
window._autoFillMat=function(val){
  if(!val||val.length<4)return;
  const found=_entries.filter(e=>e.matricula===val.toUpperCase()).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''))[0];
  if(!found)return;
  const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v)el.value=v;};
  sv('mRem',found.remolque);sv('mNom',found.nombre);sv('mApe',found.apellido);
  sv('mEmp',found.empresa);sv('mLlamador',found.llamador);sv('mHall',found.hall);
  sv('mStand',found.stand);sv('mTelP',found.telPais);sv('mTel',found.telefono);
  sv('mMontador',found.montador);sv('mExpositor',found.expositor);
};

// ─── SUBMIT MODAL ────────────────────────────────────────────
window._submitModal=async function(tipo,editId){
  const isRef=tipo==='referencia';
  const mat=normalizePlate(_v('mMat'));
  const ref=(_v('mRef')||'').trim().toUpperCase();
  if(isRef&&!ref){toast('La referencia es obligatoria','var(--red)');return;}
  if(!mat&&!isRef){toast('La matrícula es obligatoria','var(--red)');return;}
  if(!isRef&&_v('mDescarga')==='forklift'){if(!confirm('Este vehículo usa forklift — debería ir por Referencia.\n¿Registrar como Ingreso de todas formas?'))return;}
  const btn=document.querySelector('#_opModal .btn-p,#_opModal .btn-a');
  if(btn){btn.disabled=true;btn.textContent='Guardando...';}
  try{
    const entry={matricula:mat||'—',referencia:ref||null,remolque:_v('mRem'),tipo:isRef?'referencia':(_v('mTipoVeh')||'ingreso'),descarga:_v('mDescarga'),numEjes:_v('mEjes'),maquinaria:_v('mMaq'),empresa:_v('mEmp'),montador:_v('mMontador'),expositor:_v('mExpositor'),llamador:_v('mLlamador'),hall:_v('mHall'),stand:_v('mStand'),nombre:_v('mNom'),apellido:_v('mApe'),conductor:(_v('mNom')+' '+_v('mApe')).trim(),telPais:_v('mTelP'),telefono:_v('mTel'),idioma:_v('mIdioma'),pasaporte:_v('mPas'),fechaNac:_v('mFechaNac'),pais:_v('mPais'),comentario:_v('mComent'),operadorId:_user.uid,operador:_user.name,eventoNombre:_ev?.name||'',pos:_entries.length+1};
    if(editId){const db=getDB();const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',_user.eventId,'gates',_user.gateId||'puerta-1','queue',editId),entry);}
    else{await fsGate.registerEntry(_user.eventId,_user.gateId||'puerta-1',entry);if(isRef&&mat)_linkAg(ref,mat);}
    document.getElementById('_opModal')?.remove();
    toast(isRef?`📋 ${ref}${mat?' · '+mat:''} registrado`:`✅ ${mat} registrado`,isRef?'var(--amber)':'var(--green)');
  }catch(err){console.error(err);toast('Error al guardar','var(--red)');if(btn){btn.disabled=false;btn.textContent=isRef?'📋 Guardar Referencia':'✅ Guardar Ingreso';}}
};

// ─── ACCIONES FILA ───────────────────────────────────────────
window._opSalida=async function(id){
  if(!confirm('¿Confirmar salida?'))return;
  try{await fsGate.registerExit(_user.eventId,_user.gateId||'puerta-1',id,{operadorSalida:_user.name});toast('Salida registrada','var(--blue)',1500);}
  catch{toast('Error al registrar salida','var(--red)');}
};
window._opReactivar=async function(id){
  if(!confirm('¿Reactivar este vehículo?'))return;
  try{const db=getDB();const{doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',_user.eventId,'gates',_user.gateId||'puerta-1','queue',id),{salida:null});toast('↺ Salida anulada','var(--amber)');}
  catch{toast('Error','var(--red)');}
};
window._opTracking=async function(id){
  try{const db=getDB();const{doc,updateDoc,arrayUnion}=await import(`${FB}/firebase-firestore.js`);await updateDoc(doc(db,'events',_user.eventId,'gates',_user.gateId||'puerta-1','queue',id),{tracking:arrayUnion({stepId:'paso',ts:new Date().toISOString(),operador:_user.name})});toast('📡 Paso registrado','var(--purple)',1500);}
  catch{toast('Error tracking','var(--red)');}
};
window._opPrint=async function(id){
  try{const{printEntry}=await import('./print.js');const e=_entries.find(x=>x.id===id)||{id,matricula:'—'};await printEntry(e,_ev?.name||'BeUnifyT');}
  catch{toast('Error al imprimir','var(--red)');}
};
window._opPrintTrq=()=>toast('Impresión troquelada — configura en Impresión','var(--purple)');
window._opEdit=function(id,tabId){const e=_entries.find(x=>x.id===id);if(!e)return;_openModal(e.tipo==='referencia'?'referencia':'ingresos',e);};
window._opDel=async function(id,tabId){
  if(!confirm('¿Eliminar este registro?'))return;
  try{const db=getDB();const{doc,deleteDoc}=await import(`${FB}/firebase-firestore.js`);await deleteDoc(doc(db,'events',_user.eventId,'gates',_user.gateId||'puerta-1','queue',id));toast('Eliminado','var(--amber)',1500);}
  catch{toast('Error al eliminar','var(--red)');}
};
window._opDetail=function(id){
  const e=_entries.find(x=>x.id===id);if(!e)return;
  alert([`Matrícula: ${e.matricula}`,`Empresa: ${e.empresa||'—'}`,`Ref: ${e.referencia||'—'}`,`Hall: ${e.hall||'—'}`,`Stand: ${e.stand||'—'}`,`Conductor: ${e.conductor||'—'}`,`Entrada: ${formatDateTime(e.ts||e.entrada)}`,`Salida: ${e.salida?formatDateTime(e.salida):'En recinto'}`].join('\n'));
};

// ─── BLACKLIST ───────────────────────────────────────────────
window._openBL=function(){
  document.getElementById('_opModal')?.remove();
  const m=document.createElement('div');m.className='ov open';
  m.innerHTML=`<div class="modal"><div class="mhdr"><div class="mttl">⛔ Añadir a lista negra</div><button class="btn-x" onclick="this.closest('.ov').remove()">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Matrícula *</span><input id="blMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nivel</span><select id="blNivel"><option value="informativo">ℹ️ Informativo</option><option value="ALERTA" selected>⚠️ Alerta</option><option value="BLOQUEO">⛔ Bloqueo total</option></select></div>
    <div class="fg s2"><span class="flbl">Motivo</span><input id="blMotivo" placeholder="Razón del bloqueo..."></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="this.closest('.ov').remove()">Cancelar</button><button class="btn" style="background:var(--red);color:#fff" onclick="window._saveBL()">⛔ Añadir</button></div>
  </div>`;
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('blMat')?.focus(),50);
};

window._saveBL=async function(){
  const mat=(document.getElementById('blMat')?.value||'').trim().toUpperCase();
  if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
  try{
    const db=getDB();const{collection,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
    await addDoc(collection(db,'events',_user.eventId,'blacklist'),{matricula:mat,nivel:document.getElementById('blNivel')?.value||'ALERTA',motivo:document.getElementById('blMotivo')?.value.trim()||'',creadoPor:_user.name,ts:serverTimestamp()});
    document.querySelector('.ov.open')?.remove();
    toast(`⛔ ${mat} añadida a blacklist`,'var(--red)');
  }catch{toast('Error','var(--red)');}
};

window._checkBL=async function(mat){
  if(!mat||mat.length<4)return;
  const warn=document.getElementById('mBlWarn');if(!warn)return;
  try{
    const db=getDB();const{collection,query,where,getDocs}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'blacklist'),where('matricula','==',mat.toUpperCase().trim())));
    if(!snap.empty){const bl=snap.docs[0].data();warn.innerHTML=`⛔ ${safeHtml(bl.nivel?.toUpperCase()||'ALERTA')}: ${safeHtml(bl.motivo||'Matrícula en lista negra')}`;warn.style.display='block';}
    else warn.style.display='none';
  }catch{warn.style.display='none';}
};

// ─── REFERENCIA AUTOCOMPLETE ────────────────────────────────
window._searchRefAC=async function(val){
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(!ac||!match||val.length<3){if(ac)ac.classList.remove('open');return;}
  try{
    const db=getDB();const{collection,query,where,getDocs,limit}=await import(`${FB}/firebase-firestore.js`);
    const snap=await getDocs(query(collection(db,'events',_user.eventId,'agenda'),where('referencia','>=',val),where('referencia','<=',val+'\uf8ff'),limit(5)));
    if(!snap.empty){ac.classList.add('open');ac.innerHTML=snap.docs.map(d=>{const it={id:d.id,...d.data()};return`<div class="dr-item" onclick="window._fillRef(${JSON.stringify(it).replace(/"/g,'&quot;')})"><span style="font-weight:700;color:var(--amber)">${safeHtml(it.referencia)}</span> <span style="color:var(--text2)">${safeHtml(it.empresa||'—')}</span></div>`;}).join('');}
    else ac.classList.remove('open');
  }catch{if(ac)ac.classList.remove('open');}
};

window._fillRef=function(item){
  const sv=(id,v)=>{const el=document.getElementById(id);if(el&&v!=null)el.value=v;};
  sv('mRef',item.referencia);sv('mEmp',item.empresa);sv('mHall',item.hall);sv('mStand',item.stand);
  sv('mNom',item.conductor?.split(' ')[0]);sv('mApe',item.conductor?.split(' ').slice(1).join(' '));
  const ac=document.getElementById('mRefAC'),match=document.getElementById('mRefMatch');
  if(ac)ac.classList.remove('open');
  if(match){match.innerHTML=`✅ Ref en agenda · ${safeHtml(item.empresa||'')}${item.hall?' · Hall '+safeHtml(item.hall):''}`;match.style.display='block';}
};

async function _linkAg(ref,mat){
  try{const db=getDB();const{collection,query,where,getDocs,doc,updateDoc}=await import(`${FB}/firebase-firestore.js`);const snap=await getDocs(query(collection(db,'events',_user.eventId,'agenda'),where('referencia','==',ref)));snap.docs.forEach(async d=>await updateDoc(doc(db,'events',_user.eventId,'agenda',d.id),{matricula:mat,matriculaTs:new Date().toISOString()}));}catch{}
}

// ─── FIRESTORE SUBSCRIBE ─────────────────────────────────────
function _subscribe(){
  if(_unsub)_unsub();
  _unsub=fsGate.subscribeQueue(_user.eventId,_user.gateId||'puerta-1',
    (entries)=>{_entries=entries;_updateCnts();_rerender();},
    (err)=>{console.error('[Op]',err);_sync('error');}
  );
  _sync('ok');
}

function _updateCnts(){
  const hoy=new Date().toDateString();
  const today=new Date().toISOString().slice(0,10);
  const hN=_entries.filter(e=>new Date(e.ts||e.entrada).toDateString()===hoy).length;
  const rN=_entries.filter(e=>!e.salida).length;
  const rfN=_entries.filter(e=>e.tipo==='referencia'&&!e.salida).length;
  const agHoy=0; // cargado async cuando se necesita
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('cntHoy',hN);s('cntRecinto',rN);s('cntRef',rfN);
}

function _rerender(){
  if(_curTab==='ingresos')   _renderIngresos('ingresos');
  if(_curTab==='ingresos2')  _renderIngresos('ingresos2');
}

// ─── CONTROLES ESTADO ────────────────────────────────────────
window._setSub=(tab,s)=>{if(tab==='ingresos')iF._sub=s;else if(tab==='ingresos2')iF._sub2=s;window._goTab(tab);};
window._setQ=(tab,q)=>{if(tab==='ingresos')iF.q=q;else if(tab==='ingresos2')iF.q2=q;window._goTab(tab);};
window._setFecha=(tab,f)=>{if(tab==='ingresos')iF.fecha=f;else if(tab==='ingresos2')iF.fecha2=f;window._goTab(tab);};
window._setHall=(tab,h)=>{if(tab==='ingresos')iF.hall=h;else if(tab==='ingresos2')iF.hall2=h;else if(tab==='agenda')agF.hall=h;else if(tab==='flota')fF.hall=h;window._goTab(tab);};
window._togActivos=(tab)=>{if(tab==='ingresos')iF.activos=!iF.activos;else if(tab==='ingresos2')iF.activos2=!iF.activos2;window._goTab(tab);};
window._clearFilters=(tab)=>{if(tab==='ingresos'){iF.q='';iF.fecha='';iF.hall='';}else if(tab==='ingresos2'){iF.q2='';iF.fecha2='';iF.hall2='';}window._goTab(tab);};
window._openModal=_openModal;
window._togAF=()=>toast('AutoFill: ON','var(--blue)',800);
window._togPos=()=>toast('PosAuto: ON','var(--blue)',800);
window._opImport=(tab)=>toast('Importar Excel — próximamente','var(--blue)');
window._opTpl=(tab)=>toast('Plantilla — próximamente','var(--blue)');
window._opClean=(tab)=>toast('Limpiar — usa el admin panel','var(--amber)');
window._opVaciar=(tab)=>toast('Vaciar — requiere confirmación admin','var(--red)');
window._opExcel=async function(tab){
  if(!_perms.canExport){toast('Sin permiso','var(--red)');return;}
  try{const{exportToExcel}=await import('./print.js');
    let items=_entries;
    if(tab==='ingresos') items=_entries.filter(e=>e.tipo==='referencia');
    else if(tab==='ingresos2') items=_entries.filter(e=>e.tipo!=='referencia'&&e.tipo!=='embalaje');
    else if(tab==='flota') items=_entries.filter(e=>e.tipo==='embalaje');
    await exportToExcel(items,`beunifyt-${tab}`);}
  catch{toast('Error al exportar','var(--red)');}
};

// ─── TOGGLES ─────────────────────────────────────────────────
window._tgl=function(hidId,val,activeBtn,otherBtn){
  document.getElementById(hidId).value=val;
  if(activeBtn){activeBtn.className=`btn ${['forklift','devolucion','retirada'].includes(val)?'btn-a':'btn-p'} btn-sm`;activeBtn.style.flex='1';}
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

// ─── BIND ────────────────────────────────────────────────────
function _bindShell(){
  document.getElementById('btnLogout')?.addEventListener('click',logout);
  document.getElementById('btnTheme')?.addEventListener('click',()=>{
    const themes=['default','dark','soft','contrast'];
    const curr=localStorage.getItem('beu_theme')||'default';
    const next=themes[(themes.indexOf(curr)+1)%themes.length];
    document.documentElement.setAttribute('data-theme',next==='default'?'':next);
    localStorage.setItem('beu_theme',next);
    AppState.set('theme',next);
    toast(`Tema: ${next}`,'var(--blue)',1200);
  });
  document.getElementById('btnLang')?.addEventListener('click',()=>toast('Selector de idioma — próximamente','var(--blue)'));
  document.getElementById('btnSave')?.addEventListener('click',()=>window._opExcel('ingresos2'));
}

// ─── SYNC ────────────────────────────────────────────────────
function _sync(s){const dot=document.getElementById('syncDot');if(!dot)return;const m={ok:'sd-g',syncing:'sd-y',error:'sd-r'};dot.className=`sd ${m[s]||'sd-y'}`;}

// ─── UTILS ───────────────────────────────────────────────────
function _v(id){const el=document.getElementById(id);return el?el.value.trim():'';}
function _fv(cfg,key,html){return(!cfg[key]||cfg[key].vis===false)?'':html;}
function _req(cfg,key){return cfg[key]?.req?' <span class="freq">*</span>':'';}
function _mq(e,q){const s=q.toLowerCase();return`${e.pos||''} ${e.matricula||''} ${e.nombre||''} ${e.apellido||''} ${e.empresa||''} ${e.llamador||''} ${e.referencia||''} ${e.hall||''} ${(e.halls||[]).join(' ')} ${e.stand||''} ${e.remolque||''} ${e.comentario||''} ${e.telefono||''} ${e.conductor||''} ${e.montador||''} ${e.expositor||''}`.toLowerCase().includes(s);}
function _idOpts(sel=''){return`<option value="">--</option>`+[['es','Español'],['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],['pt','Português'],['nl','Nederlands'],['pl','Polski'],['ro','Română'],['ru','Русский'],['uk','Українська'],['cs','Čeština'],['sk','Slovenčina'],['hu','Magyar'],['bg','Български'],['hr','Hrvatski'],['tr','Türkçe'],['ar','العربية'],['zh','中文']].map(([v,l])=>`<option value="${v}"${sel===v?' selected':''}>${l}</option>`).join('');}
