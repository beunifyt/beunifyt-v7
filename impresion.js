// ═══════════════════════════════════════════════════════════════════
// BeUnifyT v7 — impresion.js
// Módulo completo de impresión de pases:
//   canvas drag-drop, A3/A4/A5, frase multiidioma, QR real,
//   QR Google Maps (Frase 3), datos reales/demo, nº copias,
//   zoom, deshacer/rehacer, borde, lock, exportar/importar JSON,
//   impresión por lotes, diálogo de selección de plantillas,
//   imagen de guía (no se imprime), modo troquelado.
// ═══════════════════════════════════════════════════════════════════

import { AppState }          from '../state.js';
import { getDB }             from '../firestore.js';
import { toast, safeHtml, formatDate } from '../utils.js';
const formatDateTime = formatDate; // alias

// localDB polyfill (localStorage-based)
const localDB = {
  async get(store, key) { try { const v = localStorage.getItem('beu_'+store+'_'+key); return v ? JSON.parse(v) : null; } catch(e) { return null; } },
  async set(store, key, val) { try { localStorage.setItem('beu_'+store+'_'+key, JSON.stringify(val)); } catch(e) {} },
  async del(store, key) { try { localStorage.removeItem('beu_'+store+'_'+key); } catch(e) {} },
};

// ── Constantes ────────────────────────────────────────────────────
const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
const QR_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
const QR_BASE_URL = 'https://beunifyt.web.app/track';

const PAPERS = {
  A3: { w:297, h:420, pw:1123, ph:1587 },
  A4: { w:210, h:297, pw:794,  ph:1123 },
  A5: { w:148, h:210, pw:559,  ph:794  },
};

const FONT_LIST = [
  'Arial','Arial Black','Calibri','Courier New','Georgia',
  'Helvetica','Impact','Tahoma','Times New Roman','Trebuchet MS','Verdana'
];

const LANGS_PRINT = {
  es:'Español', en:'English', fr:'Français', pt:'Português',
  de:'Deutsch', it:'Italiano', zh:'中文', ar:'العربية'
};

const FIELDS = [
  {k:'posicion',        l:'Nº Posición',      demo:'7'},
  {k:'matricula',       l:'Matrícula',         demo:'AB1234CD'},
  {k:'telefonoCompleto',l:'Teléfono',          demo:'+34 600 123456'},
  {k:'nombreCompleto',  l:'Nombre y Apellido', demo:'Jean Dupont'},
  {k:'empresa',         l:'Empresa',           demo:'Empresa Demo S.L.'},
  {k:'expositor',       l:'Expositor',         demo:'ExpoDemo SL'},
  {k:'montador',        l:'Montador',          demo:'MontajeXL'},
  {k:'hall',            l:'Hall',              demo:'Hall 5'},
  {k:'stand',           l:'Stand',             demo:'B-200'},
  {k:'puertaHall',      l:'Puerta Hall',       demo:'P3'},
  {k:'remolque',        l:'Remolque',          demo:'TR5678X'},
  {k:'tipoVehiculo',    l:'Tipo Vehículo',     demo:'Semiremolque'},
  {k:'descargaTipo',    l:'Descarga',          demo:'A Mano'},
  {k:'tipoCarga',       l:'Tipo Carga',        demo:'Mercancía'},
  {k:'referencia',      l:'Referencia',        demo:'REF-001'},
  {k:'llamador',        l:'Llamador',          demo:'12345'},
  {k:'pasaporte',       l:'Pasaporte/DNI',     demo:'12345678Z'},
  {k:'email',           l:'Email',             demo:'demo@empresa.com'},
  {k:'pais',            l:'País',              demo:'Francia'},
  {k:'fechaNacimiento', l:'F. Nacimiento',     demo:'01/01/1985'},
  {k:'comentario',      l:'Comentario',        demo:'Vista previa'},
  {k:'horario',         l:'Hora Ingreso',      demo:'09:45'},
  {k:'eventoNombre',    l:'Evento',            demo:'ALIMENTARIA 2026'},
  {k:'pase',            l:'Pase/Acceso',       demo:'Hall 5'},
  {k:'gpsUrl',          l:'GPS/Dirección',     demo:'Av. Reina Maria Cristina s/n'},
];

const FIELD_LABELS = {
  posicion:'Pos.',matricula:'Matricula',telefonoCompleto:'Telefono',
  nombreCompleto:'Nombre',empresa:'Empresa',expositor:'Expositor',
  montador:'Montador',hall:'Hall',stand:'Stand',puertaHall:'Puerta Hall',
  remolque:'Remolque',tipoVehiculo:'Tipo Veh.',descargaTipo:'Descarga',
  tipoCarga:'Tipo Carga',referencia:'Referencia',llamador:'Llamador',
  pasaporte:'Pasaporte',email:'Email',pais:'Pais',fechaNacimiento:'F.Nac.',
  comentario:'Comentario',horario:'Hora',eventoNombre:'Evento',
  pase:'Pase',gpsUrl:'GPS',
};


// ── TEMAS VISUALES ──────────────────────────────────────────────
const THEMES = {
  classic: { id:"classic", label:"Cl\u00e1sico", icon:"\ud83d\udcc4", desc:"Dise\u00f1o original" },
  dark:    { id:"dark",    label:"Dark Studio",   icon:"\ud83c\udf19", desc:"Oscuro profesional" },
  warm:    { id:"warm",    label:"Warm Editorial", icon:"\ud83c\udf3f", desc:"C\u00e1lido y limpio" },
  glass:   { id:"glass",   label:"Modern Glass",  icon:"\ud83d\udc8e", desc:"Moderno con propiedades" },
};
let _currentTheme = "classic";
function _loadThemePref() { try { return localStorage.getItem("beu_impTheme") || "classic"; } catch(e) { return "classic"; } }
function _saveThemePref(t) { try { localStorage.setItem("beu_impTheme", t); } catch(e) {} }

// ── Estado del módulo ─────────────────────────────────────────────
let _ck        = 'ing1';   // subtab activo: ing1 | ing2 | ag
let _placed    = {};       // chips en canvas: { key: {x,y,fs,line,...} }
let _selKey    = null;     // chip seleccionado
let _scale     = 1;        // escala actual del canvas
let _manualZoom = null;    // null = auto-fit
let _labelMode = { ing1:0, ing2:0, ag:0 };
let _nCopias   = 1;
let _printDataMode = 'demo'; // 'demo' | 'last'
let _batchEntries  = [];
let _selPrintTpls  = new Set();
let _cfgCache  = {};
let _tplsCache = null;

// Deshacer/Rehacer (50 pasos por pestaña)
const _hist    = { ing1:[], ing2:[], ag:[], emb:[] };
let   _histIdx = { ing1:-1, ing2:-1, ag:-1, emb:-1 };
let   _histLock = false;

// Drag & resize state
let _dragging=false, _chipKey=null, _sx=0,_sy=0,_sl=0,_st=0;
let _resizing=false, _rKey=null,   _rsx=0,_rsy=0,_rsW=0,_rsH=0;
const SNAP = 1.5;

// ── Firestore helpers ─────────────────────────────────────────────
async function _loadCfg(key) {
  if (_cfgCache[key]) return _cfgCache[key];
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    try {
      const db = getDB();
      const { doc, getDoc } = await import(`${FB}/firebase-firestore.js`);
      const snap = await getDoc(doc(db, 'events', ev.id, 'config', 'print'));
      if (snap.exists() && snap.data()[key]) {
        _cfgCache[key] = snap.data()[key];
        return _cfgCache[key];
      }
    } catch(e) {}
  }
  // Fallback to IndexedDB cache
  try {
    const cached = await localDB.get('cache', `printCfg_${key}`);
    if (cached) { _cfgCache[key] = cached; return cached; }
  } catch(e) {}
  _cfgCache[key] = _defCfg();
  return _cfgCache[key];
}

async function _saveCfg(key, cfg) {
  _cfgCache[key] = cfg;
  // Save to IndexedDB immediately (offline-safe)
  try { await localDB.set('cache', `printCfg_${key}`, cfg); } catch(e) {}
  // Then sync to Firestore
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  try {
    const db = getDB();
    const { doc, setDoc } = await import(`${FB}/firebase-firestore.js`);
    await setDoc(doc(db,'events',ev.id,'config','print'), {[key]: cfg}, {merge:true});
  } catch (e) { console.warn('[impresion] Firestore save error:', e); }
}

function _defCfg() {
  return {
    paperSize:'A4', font:'Arial', mode:'normal',
    qrTracking:false,
    ph1On:false, ph2On:false, ph3On:false,
    phrases:{}, phrase1Langs:{}, phrase2:'', puerta3:{},
    fieldLayout:{}, canvasCleared:false,
    bgOpacity:0.35, labelMode:0,
  };
}

// Templates — Firestore (event-scoped)
async function _loadTpls() {
  if (_tplsCache) return _tplsCache;
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    try {
      const db = getDB();
      const { collection, getDocs } = await import(`${FB}/firebase-firestore.js`);
      const snap = await getDocs(collection(db,'events',ev.id,'printTemplates'));
      _tplsCache = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      return _tplsCache;
    } catch(e) {}
  }
  // Fallback: localStorage
  try { _tplsCache = JSON.parse(localStorage.getItem('beu_printTpls') || '[]'); }
  catch { _tplsCache = []; }
  return _tplsCache;
}

async function _saveTpl(tpl) {
  const tpls = await _loadTpls();
  const idx = tpls.findIndex(t => t.name === tpl.name);
  if (idx >= 0) tpls[idx] = tpl; else tpls.push(tpl);
  _tplsCache = tpls;
  try { localStorage.setItem('beu_printTpls', JSON.stringify(tpls)); } catch(e) {}
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  try {
    const db = getDB();
    const { doc, setDoc } = await import(`${FB}/firebase-firestore.js`);
    await setDoc(doc(db,'events',ev.id,'printTemplates',tpl.name), tpl);
  } catch(e) {}
}

async function _deleteTpl(name) {
  const tpls = await _loadTpls();
  _tplsCache = tpls.filter(t => t.name !== name);
  try { localStorage.setItem('beu_printTpls', JSON.stringify(_tplsCache)); } catch(e) {}
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  try {
    const db = getDB();
    const { doc, deleteDoc } = await import(`${FB}/firebase-firestore.js`);
    await deleteDoc(doc(db,'events',ev.id,'printTemplates',name));
  } catch(e) {}
}

// ── Punto de entrada público ───────────────────────────────────────

// ── Render shell (estructura fija, no se re-renderiza) ─────────────

function _getThemeCSS(th) {
  var D = {
    classic:{lb:"var(--bg2)",lw:"280px",lbd:"1px solid var(--border)",lp:"7px",rb:"var(--bg3)",tb:"var(--bg2)",tbd:"1px solid var(--border)",tp:"4px 7px",sc:"var(--text3)",sb:"var(--bg2)",cb:"inherit",cp:"8px",pb:"#fff",pbd:"1px solid #aaa",ps:"none",bb:"var(--bg2)",cb1:"#3b5bdb",cb2:"rgba(235,245,255,.93)",cs:"#2563eb",css:"0 0 0 2px rgba(59,91,219,.3)",gh:"#3b5bdb",gv:"#e53e3e",sb1:".5px solid var(--border)",sr:"5px",shb:"var(--bg3)",shc:"var(--text3)",fb:".5px solid var(--border)",fbg:"var(--bg)",fr:"4px",fc:"inherit",to:"var(--border2)",tn:"var(--blue)",sc1:"var(--border)",sh:"14px",mb:"var(--bg2)",mr:"10px",ms:"0 8px 32px rgba(0,0,0,.2)",mc:"inherit",bx:""},
    dark:{lb:"#16213e",lw:"260px",lbd:"1px solid #1e2d45",lp:"8px",rb:"#0d1321",tb:"#0f1729",tbd:"1px solid #1e2d45",tp:"6px 10px",sc:"#5e7ea1",sb:"#0f1729",cb:"#0d1321",cp:"12px",pb:"#fff",pbd:"1px solid #2a3a52",ps:"0 4px 24px rgba(0,0,0,.5)",bb:"#0f1729",cb1:"#6c63ff",cb2:"rgba(108,99,255,.08)",cs:"#a29bfe",css:"0 0 0 2px rgba(108,99,255,.3),0 0 12px rgba(108,99,255,.15)",gh:"#6c63ff",gv:"#ff6b6b",sb1:"1px solid #1e2d45",sr:"6px",shb:"#16213e",shc:"#5e7ea1",fb:"1px solid #2a3a52",fbg:"#1a1a2e",fr:"20px",fc:"#c8d6e5",to:"#2a3a52",tn:"#6c63ff",sc1:"#1e2d45",sh:"16px",mb:"#16213e",mr:"12px",ms:"0 12px 48px rgba(0,0,0,.5)",mc:"#c8d6e5",bx:"#impLeft .btn{background:#1a1a2e;border:1px solid #2a3a52;color:#c8d6e5}#impLeft .btn:hover{border-color:#4a6a8a;background:#1e2d45}#impLeft .btn-p{background:#6c63ff!important;color:#fff!important;border-color:#6c63ff!important;box-shadow:0 2px 8px rgba(108,99,255,.3)}#impToolbar .btn{background:transparent;border:1px solid #1e2d45;color:#7a8ba8;border-radius:6px}#impToolbar .btn:hover{background:#1e2d45;color:#c8d6e5}#impToolbar .btn-p{background:#6c63ff!important;color:#fff!important;border-color:#6c63ff!important}#impLeft select,#impLeft input:not([type=range]):not([type=color]):not([type=file]):not([type=checkbox]){background:#1a1a2e;border:1px solid #2a3a52;color:#c8d6e5}#impLeft textarea{background:#1a1a2e;border-color:#2a3a52;color:#c8d6e5}"},
    warm:{lb:"#fff",lw:"270px",lbd:"1px solid #e8e3da",lp:"8px",rb:"#f7f5f0",tb:"#faf8f4",tbd:"1px solid #e8e3da",tp:"5px 12px",sc:"#8a7e6b",sb:"#fff",cb:"repeating-conic-gradient(#eae6dd 0% 25%,#f2efe8 0% 50%) 0/16px 16px",cp:"12px",pb:"#fff",pbd:"1px solid #e8e3da",ps:"0 2px 16px rgba(0,0,0,.08)",bb:"#fff",cb1:"rgba(45,80,22,.4)",cb2:"rgba(45,80,22,.06)",cs:"#2d5016",css:"0 0 0 2px rgba(45,80,22,.2)",gh:"#2d5016",gv:"#c0392b",sb1:"1px solid #e8e3da",sr:"0",shb:"#faf8f4",shc:"#8a7e6b",fb:"none;border-bottom:1px solid #f0ebe1",fbg:"transparent",fr:"4px",fc:"#5a4e3c",to:"#ddd6c8",tn:"#2d5016",sc1:"#e8e3da",sh:"18px",mb:"#fff",mr:"12px",ms:"0 8px 32px rgba(0,0,0,.12)",mc:"#3d3425",bx:"#impToolbar .btn{background:#fff;border:1.5px solid #ddd6c8;color:#5a4e3c;border-radius:5px}#impToolbar .btn:hover{border-color:#b0a48f;background:#f0ebe1}#impToolbar .btn-p{background:#2d5016!important;color:#fff!important;border-color:#2d5016!important;box-shadow:inset 0 2px 4px rgba(0,0,0,.15)}#impLeft .btn{border:1.5px solid #ddd6c8;color:#5a4e3c;border-radius:5px;background:#fff}#impLeft .btn:hover{border-color:#b0a48f}#impLeft .btn-p{background:#2d5016!important;color:#fff!important;border-color:#2d5016!important}"},
    glass:{lb:"#fff",lw:"260px",lbd:"none",lp:"8px",rb:"#e8ecf1",tb:"#fff",tbd:"1px solid #e2e8f0",tp:"6px 10px",sc:"#94a3b8",sb:"#fff",cb:"#e8ecf1",cp:"12px",pb:"#fff",pbd:"none",ps:"0 4px 20px rgba(0,0,0,.08)",bb:"#fff",cb1:"rgba(102,126,234,.4)",cb2:"rgba(102,126,234,.06)",cs:"#667eea",css:"0 0 0 2px rgba(102,126,234,.2)",gh:"#667eea",gv:"#e53e3e",sb1:"1px solid #e2e8f0",sr:"8px",shb:"#f8fafc",shc:"#94a3b8",fb:"none",fbg:"transparent",fr:"6px",fc:"#475569",to:"#e2e8f0",tn:"#667eea",sc1:"#e2e8f0",sh:"20px",mb:"#fff",mr:"14px",ms:"0 12px 40px rgba(0,0,0,.12)",mc:"#334155",bx:"#impToolbar .btn{background:#fff;border:1.5px solid #e2e8f0;color:#64748b;border-radius:6px;min-width:28px;min-height:28px}#impToolbar .btn:hover{border-color:#94a3b8;background:#f8fafc}#impToolbar .btn-p{background:#667eea!important;color:#fff!important;border-color:#667eea!important;box-shadow:0 2px 6px rgba(102,126,234,.25)}#impLeft .btn{border:1.5px solid #e2e8f0;color:#64748b;border-radius:6px;background:#fff}#impLeft .btn:hover{border-color:#94a3b8}#impLeft .btn-p{background:#667eea!important;color:#fff!important;border-color:#667eea!important}"},
  };
  var t=D[th]||D.classic;
  return "#impWrap{display:flex;height:calc(100vh - var(--hdr-h,90px));overflow:hidden}"
    +"#impLeft{width:"+t.lw+";min-width:"+t.lw+";flex-shrink:0;overflow-y:auto;background:"+t.lb+";padding:"+t.lp+";display:flex;flex-direction:column;gap:5px;border-right:"+t.lbd+"}"
    +"#impRight{flex:1;overflow:hidden;display:flex;flex-direction:column;background:"+t.rb+"}"
    +"#impToolbar{display:flex;align-items:center;gap:3px;padding:"+t.tp+";background:"+t.tb+";border-bottom:"+t.tbd+";flex-shrink:0;flex-wrap:wrap}"
    +"#impStatus{padding:2px 10px;font-size:9px;color:"+t.sc+";background:"+t.sb+";border-bottom:"+t.tbd+";flex-shrink:0;display:flex;align-items:center;gap:8px;min-height:18px}"
    +"#impCvArea{flex:1;overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:"+t.cp+";background:"+t.cb+"}"
    +"#impCvBottom{padding:2px 7px;font-size:9px;color:"+t.sc+";background:"+t.bb+";border-top:"+t.tbd+";flex-shrink:0;text-align:center}"
    +"#impPv{position:relative;background:"+t.pb+";border:"+t.pbd+";overflow:hidden;transform-origin:top left;flex-shrink:0;box-shadow:"+t.ps+"}"
    +"#impPvWrap{flex-shrink:0}"
    +".imp-pfc{position:absolute;border:1.5px solid "+t.cb1+";background:"+t.cb2+";border-radius:2px;padding:2px 16px 2px 4px;font-weight:700;cursor:move;z-index:10;display:block;line-height:1.4;user-select:none;white-space:normal;word-break:break-word;overflow:hidden;min-width:20px;min-height:14px;box-sizing:border-box}"
    +".imp-pfc.pfc-sel{border:2px solid "+t.cs+";box-shadow:"+t.css+";z-index:20}"
    +".imp-pfc.pfc-locked{cursor:default;border-style:dashed;opacity:.8}"
    +".imp-pfc .pfc-rm{position:absolute;top:1px;right:2px;font-size:9px;color:#aaa;cursor:pointer;line-height:1;z-index:5}"
    +".imp-pfc .pfc-rm:hover{color:var(--red)}"
    +".imp-pfc .pfc-rh{position:absolute;bottom:0;right:0;width:10px;height:10px;cursor:se-resize;z-index:30}"
    +".imp-pfc .pfc-rh::after{content:'';position:absolute;bottom:1px;right:1px;width:0;height:0;border-style:solid;border-width:0 0 6px 6px;border-color:transparent transparent "+t.cb1+" transparent;opacity:.7}"
    +".imp-gh{position:absolute;left:0;right:0;height:1px;background:"+t.gh+";pointer-events:none;z-index:50;display:none}"
    +".imp-gv{position:absolute;top:0;bottom:0;width:1px;background:"+t.gv+";pointer-events:none;z-index:50;display:none}"
    +".imp-fpi{display:flex;align-items:center;gap:3px;padding:2px 5px;border-radius:"+t.fr+";border:"+t.fb+";background:"+t.fbg+";font-size:10px;font-weight:500;user-select:none;margin-bottom:2px;color:"+t.fc+"}"
    +".imp-sec{border:"+t.sb1+";border-radius:"+t.sr+";overflow:hidden}"
    +".imp-sec-hdr{display:flex;align-items:center;gap:4px;padding:4px 6px;background:"+t.shb+";font-size:9px;font-weight:700;text-transform:uppercase;color:"+t.shc+"}"
    +".imp-tgl{display:flex;align-items:center;gap:4px;cursor:pointer;margin-left:auto}"
    +".imp-tgl-t{width:24px;height:13px;border-radius:7px;background:"+t.to+";position:relative;flex-shrink:0;transition:background .15s}"
    +".imp-tgl-t.on{background:"+t.tn+"}"
    +".imp-tgl-t .th{width:9px;height:9px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:left .15s}"
    +".imp-tgl-t.on .th{left:13px}"
    +".imp-sep{width:1px;height:"+t.sh+";background:"+t.sc1+";flex-shrink:0;margin:0 1px}"
    +".imp-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:300;display:none;align-items:center;justify-content:center}"
    +".imp-modal{background:"+t.mb+";border-radius:"+t.mr+";padding:16px;min-width:320px;max-width:500px;box-shadow:"+t.ms+";color:"+t.mc+"}"
    +".imp-bentry{display:flex;align-items:center;gap:6px;padding:5px;border-radius:5px;border:.5px solid var(--border);background:var(--bg3);margin-bottom:3px}"
    +t.bx;
}

function _buildThemePicker() {
  var h='<div id="impThemePicker" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 12px;background:var(--bg2);border-bottom:1px solid var(--border);flex-shrink:0">';
  h+='<span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-right:6px">Tema</span>';
  Object.values(THEMES).forEach(function(t){
    var active=(_currentTheme===t.id);
    var st=active?'background:#7c3aed;color:#fff;border-color:#7c3aed;box-shadow:0 2px 8px rgba(124,58,237,.3)':'background:var(--bg3);color:var(--text2);border:.5px solid var(--border)';
    h+='<button class="btn btn-xs" onclick="window._imp.setTheme(\''+t.id+'\')" title="'+t.desc+'" style="padding:4px 12px;border-radius:20px;font-size:10px;font-weight:600;display:flex;align-items:center;gap:4px;transition:all .2s;'+st+'">'+t.icon+' '+t.label+'</button>';
  });
  h+='</div>';
  return h;
}

function _setTheme(themeId) {
  if (!THEMES[themeId]) return;
  _currentTheme = themeId;
  _saveThemePref(themeId);
  var container = document.getElementById('impThemePicker');
  if (container) container = container.parentElement;
  if (container) {
    _renderShell(container);
    _finalizeGlobal();
    _switchSub(_ck, true).then(function(){ toast('\ud83c\udfa8 Tema: '+THEMES[themeId].label, 'var(--blue)'); });
  }
}

function _renderShell(el) {
  el.innerHTML = `
<style id="impThemeStyle">${_getThemeCSS(_currentTheme)}</style>

${_buildThemePicker()}
<div id="impWrap">
  <!-- ══ PANEL IZQUIERDO ══ -->
  <div id="impLeft">
    <!-- Subtabs -->
    <div style="display:flex;gap:3px">
      <button class="btn btn-xs btn-p"  id="impTabIng1" onclick="window._imp.switchSub('ing1')">🔖 Ref</button>
      <button class="btn btn-xs btn-gh" id="impTabIng2" onclick="window._imp.switchSub('ing2')">🚛 Ing</button>
      <button class="btn btn-xs btn-gh" id="impTabAg"   onclick="window._imp.switchSub('ag')">📅 Ag</button>
      <button class="btn btn-xs btn-gh" id="impTabEmb"  onclick="window._imp.switchSub('emb')">📦 Emb</button>
    </div>
    <!-- Fuente -->
    <div style="display:flex;align-items:center;gap:4px">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;white-space:nowrap">Fuente</span>
      <select id="impSelFont" onchange="window._imp.setFont(this.value)" style="flex:1;font-size:10px;padding:2px 4px;border-radius:4px;border:.5px solid var(--border)">
        ${FONT_LIST.map(f => `<option>${f}</option>`).join('')}
      </select>
    </div>
    <!-- Papel + Modo -->
    <div style="display:flex;gap:3px;align-items:center;flex-wrap:wrap">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;width:30px">Papel</span>
      <div id="impPaperBtns" style="display:flex;gap:2px"></div>
      <div class="imp-sep"></div>
      <button id="impModeBtn" class="btn btn-xs btn-gh" onclick="window._imp.toggleMode()" title="Normal / Troquelado">📄 Normal</button>
      <div class="imp-sep"></div>
      <button id="impRotBtn" class="btn btn-xs btn-gh" onclick="window._imp.toggleRotation()" title="Vertical / Horizontal">↕ Vertical</button>
    </div>
    <!-- Zoom -->
    <div style="display:flex;align-items:center;gap:4px">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;white-space:nowrap">Zoom</span>
      <input type="range" id="impZoomSlider" min="20" max="200" value="100" style="flex:1;height:3px;padding:0;border:none" oninput="window._imp.setZoom(this.value)">
      <span id="impZoomLbl" style="font-size:9px;min-width:30px;text-align:right">100%</span>
      <button class="btn btn-xs btn-gh" onclick="window._imp.setZoom('auto')" style="padding:1px 5px;font-size:9px">Auto</button>
    </div>
    <!-- Copias -->
    <div style="display:flex;align-items:center;gap:4px">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;white-space:nowrap">Copias</span>
      <div style="display:flex;gap:2px" id="impCopyBtns"></div>
      <span id="impCopiasLbl" style="font-size:9px;color:var(--blue);font-weight:700"></span>
    </div>
    <!-- QR Tracking -->
    <div class="imp-sec">
      <div class="imp-sec-hdr">QR Tracking
        <div class="imp-tgl" onclick="window._imp.toggleQR()">
          <div id="impQrTrack" class="imp-tgl-t"><div class="th"></div></div>
          <span id="impQrLbl" style="font-size:9px;font-weight:700;color:var(--text3)">OFF</span>
        </div>
        <button class="btn btn-xs btn-gh" id="impQrAddBtn" onclick="window._imp.addSpecialChip('_qr')" style="padding:1px 5px;font-size:9px;margin-left:3px">+</button>
      </div>
    </div>
    <!-- Frases -->
    <div id="impFrasesArea"></div>
    <!-- Campos -->
    <div class="imp-sec">
      <div class="imp-sec-hdr" style="cursor:pointer" onclick="window._imp.toggleFields()">
        Campos <span style="flex:1"></span><span id="impFldArrow">▸</span>
      </div>
      <div id="impFldBody" style="display:none;flex-direction:column;padding:3px 5px 5px;max-height:240px;overflow-y:auto">
        <div id="impPalette"></div>
      </div>
    </div>
    <!-- Imagen de guía -->
    <div class="imp-sec">
      <div class="imp-sec-hdr">Imagen guía
        <span style="font-size:8px;font-weight:400;text-transform:none;margin-left:3px;color:var(--text3)">no se imprime</span>
      </div>
      <div style="padding:5px 6px">
        <div style="border:1.5px dashed var(--border);border-radius:4px;padding:5px;text-align:center;cursor:pointer;font-size:10px;color:var(--text3)" onclick="document.getElementById('impBgInput').click()">
          🗺 Subir imagen de guía
          <input type="file" id="impBgInput" accept="image/*" style="display:none" onchange="window._imp.loadBG(this)">
        </div>
        <div style="display:flex;align-items:center;gap:4px;margin-top:4px">
          <span style="font-size:9px">Opac:</span>
          <input type="range" id="impBgOp" min="5" max="80" value="35" step="5" style="flex:1;height:3px;padding:0;border:none" oninput="window._imp.setBGOpacity(this.value)">
          <span id="impBgOpLbl" style="font-size:9px;min-width:22px">35%</span>
          <button class="btn btn-xs btn-gh" onclick="window._imp.clearBG()" style="padding:1px 4px;font-size:9px">✕</button>
        </div>
      </div>
    </div>
    <!-- Guardar plantilla -->
    <div style="border-top:.5px solid var(--border);padding-top:5px">
      <div id="impTplConfirm" style="display:none;background:var(--all,#fffbeb);border:.5px solid #fde68a;border-radius:4px;padding:5px;margin-bottom:4px;font-size:10px">
        <div style="font-weight:700;margin-bottom:3px">¿Confirmar guardado?</div>
        <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:4px">
          <span id="impTplFmt" style="background:var(--blue);color:#fff;padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700"></span>
          <span id="impTplSz"  style="background:var(--bg4);color:var(--text);padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700"></span>
          <span id="impTplNm"  style="background:var(--bg4);color:var(--text);padding:1px 6px;border-radius:10px;font-size:9px;font-weight:700"></span>
        </div>
        <div style="display:flex;gap:3px">
          <button class="btn btn-xs btn-gh" style="flex:1" onclick="document.getElementById('impTplConfirm').style.display='none'">Cancelar</button>
          <button class="btn btn-xs btn-p" style="flex:1;background:#7950f2;border-radius:20px" onclick="window._imp.confirmSaveTpl()">💾 Guardar</button>
        </div>
      </div>
      <div style="display:flex;gap:3px">
        <input id="impTplName" placeholder="Nombre plantilla..." style="flex:1;font-size:10px;padding:3px 6px;border:.5px solid var(--border);border-radius:4px">
        <button class="btn btn-xs" style="background:#7950f2;color:#fff;border-radius:20px" onclick="window._imp.preSaveTpl()">💾</button>
      </div>
    </div>
    <!-- Acciones -->
    <div style="display:flex;gap:2px;flex-wrap:wrap">
      <button class="btn btn-xs btn-gh" onclick="window._imp.exportCanvas()" title="Exportar como JSON">📦 Export</button>
      <button class="btn btn-xs btn-gh" onclick="document.getElementById('impImportFile').click()" title="Importar desde JSON">📥 Import</button>
      <input type="file" id="impImportFile" accept=".json" style="display:none" onchange="window._imp.importCanvas(this)">
      <button class="btn btn-xs btn-gh" onclick="window._imp.openBatch()" title="Impresión por lotes">🗂 Lotes</button>
      <button class="btn btn-xs btn-gh" onclick="window._imp.autoLayout()" title="Auto-posicionar campos">⚡ Auto</button>
    </div>
    <!-- Lista plantillas -->
    <div id="impTplList"></div>
  </div>

  <!-- ══ PANEL DERECHO ══ -->
  <div id="impRight">
    <!-- Toolbar -->
    <div id="impToolbar">
      <button class="btn btn-xs btn-p" onclick="window._imp.resizeSel(1)">A+</button>
      <button class="btn btn-xs btn-p" onclick="window._imp.resizeSel(5)">A++</button>
      <button class="btn btn-xs btn-p" onclick="window._imp.resizeSel(-1)">A−</button>
      <div class="imp-sep"></div>
      <button id="impBtnBold"   class="btn btn-xs btn-gh" onclick="window._imp.toggleStyle('bold')"      title="Ctrl+B"><b>B</b></button>
      <button id="impBtnItalic" class="btn btn-xs btn-gh" onclick="window._imp.toggleStyle('italic')"    title="Ctrl+I"><i>I</i></button>
      <button id="impBtnUnder"  class="btn btn-xs btn-gh" onclick="window._imp.toggleStyle('underline')" title="Ctrl+U"><u>U</u></button>
      <div class="imp-sep"></div>
      <button id="impBtnAlL" class="btn btn-xs btn-gh" onclick="window._imp.setAlign('left')"   title="Ctrl+L">
        <svg width="11" height="9" viewBox="0 0 11 9"><line x1="0" y1="1" x2="11" y2="1" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="4" x2="7" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button id="impBtnAlC" class="btn btn-xs btn-gh" onclick="window._imp.setAlign('center')" title="Ctrl+E">
        <svg width="11" height="9" viewBox="0 0 11 9"><line x1="0" y1="1" x2="11" y2="1" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="4" x2="9" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <button id="impBtnAlR" class="btn btn-xs btn-gh" onclick="window._imp.setAlign('right')"  title="Ctrl+R">
        <svg width="11" height="9" viewBox="0 0 11 9"><line x1="0" y1="1" x2="11" y2="1" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="4" x2="11" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="0" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <div class="imp-sep"></div>
      <div style="position:relative;display:inline-flex">
        <button class="btn btn-xs btn-gh" onclick="document.getElementById('impCpTxt').click()" style="gap:2px">
          <span id="impCpTxtPrev" style="width:10px;height:10px;border-radius:2px;background:#000;border:1px solid var(--border2);display:inline-block;flex-shrink:0"></span>Txt
        </button>
        <input type="color" id="impCpTxt" value="#000000" style="position:absolute;opacity:0;width:1px;height:1px" onchange="window._imp.setColor(this.value)">
      </div>
      <div style="position:relative;display:inline-flex">
        <button class="btn btn-xs btn-gh" onclick="document.getElementById('impCpBg').click()" style="gap:2px">
          <span id="impCpBgPrev" style="width:10px;height:10px;border-radius:2px;background:#eef2ff;border:1px solid var(--border2);display:inline-block;flex-shrink:0"></span>Fondo
        </button>
        <input type="color" id="impCpBg" value="#eef2ff" style="position:absolute;opacity:0;width:1px;height:1px" onchange="window._imp.setBgColor(this.value)">
      </div>
      <div class="imp-sep"></div>
      <button id="impBtnBorder" class="btn btn-xs btn-gh" onclick="window._imp.toggleBorder()" title="Borde">▭ Borde</button>
      <div style="position:relative;display:inline-flex">
        <button class="btn btn-xs btn-gh" onclick="document.getElementById('impCpBorder').click()" title="Color borde">
          <span id="impCpBorderPrev" style="width:10px;height:10px;border-radius:2px;border:2px solid #3b5bdb;display:inline-block;background:transparent"></span>
        </button>
        <input type="color" id="impCpBorder" value="#3b5bdb" style="position:absolute;opacity:0;width:1px;height:1px" onchange="window._imp.setBorderColor(this.value)">
      </div>
      <div class="imp-sep"></div>
      <button id="impLineBtn" class="btn btn-xs btn-gh" onclick="window._imp.toggleLineSel()" title="Línea bajo campo">✏ Línea</button>
      <button id="impLockBtn" class="btn btn-xs btn-gh" onclick="window._imp.toggleLock()"    title="Bloquear campo">🔓</button>
      <button id="impLblBtn"  class="btn btn-xs btn-gh" onclick="window._imp.toggleLabelMode()">📋 Etiq+Val</button>
      <div class="imp-sep"></div>
      <button class="btn btn-xs btn-gh" onclick="window._imp.undo()" title="Ctrl+Z">↩</button>
      <button class="btn btn-xs btn-gh" onclick="window._imp.redo()" title="Ctrl+Y">↪</button>
      <div class="imp-sep"></div>
      <button class="btn btn-xs btn-gh" onclick="window._imp.doPreview()" title="Vista previa">👁 Preview</button>
      <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" onclick="window._imp.openPrintDialog()">🖨 Imprimir…</button>
      <button class="btn btn-xs btn-gh" onclick="window._imp.clearAll()">🗑 Limpiar</button>
      <span style="flex:1"></span>
      <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" onclick="window._imp.resetDia0()">🔄 Día 0</button>
    </div>
    <div id="impStatus">
      <span id="impSelInfo" style="flex:1">← selecciona un campo en la ficha</span>
      <span id="impScaleInfo" style="font-size:9px;color:var(--text3)"></span>
    </div>
    <!-- Canvas -->
    <div id="impCvArea">
      <div id="impPvWrap">
        <div id="impPv"
          ondragover="event.preventDefault()"
          ondrop="window._imp.onDrop(event)"
          onclick="window._imp.onPvClick(event)">
          <img id="impBgImg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;display:none;opacity:.35">
          <div id="impCutLine" style="position:absolute;left:0;right:0;top:50%;height:2px;background:#000;pointer-events:none;z-index:6;display:none"></div>
          <div class="imp-gh" id="impGH"></div>
          <div class="imp-gv" id="impGV"></div>
        </div>
      </div>
    </div>
    <div id="impCvBottom">Guía azul = alineación horizontal · Roja = vertical · Se muestran al arrastrar</div>
  </div>
</div>

<!-- ═══ PRINT DIALOG ═══ -->
<div id="impPrintModal" class="imp-modal-bg">
  <div class="imp-modal" style="min-width:380px">
    <div style="font-size:14px;font-weight:700;margin-bottom:8px">🖨 Seleccionar formatos a imprimir</div>
    <div id="impPrintTplList" style="display:flex;flex-direction:column;gap:4px;max-height:240px;overflow-y:auto;margin-bottom:10px"></div>
    <div style="display:flex;gap:4px;align-items:center;margin-bottom:10px">
      <span style="font-size:11px;font-weight:600">Datos:</span>
      <button class="btn btn-xs btn-p"  onclick="window._imp.setPrintData('demo')" id="impPdDemo">Demo</button>
      <button class="btn btn-xs btn-gh" onclick="window._imp.setPrintData('last')" id="impPdLast">Último ingreso</button>
      <span id="impPrintDataLbl" style="font-size:10px;color:var(--text3);margin-left:4px">Demo</span>
    </div>
    <div style="display:flex;gap:4px;justify-content:flex-end">
      <button class="btn btn-sm btn-gh" onclick="window._imp.closeModal('impPrintModal')">Cancelar</button>
      <button class="btn btn-sm" style="background:#7c3aed;color:#fff;border-radius:20px" onclick="window._imp.execPrint()">🖨 Imprimir seleccionados</button>
    </div>
  </div>
</div>

<!-- ═══ BATCH MODAL ═══ -->
<div id="impBatchModal" class="imp-modal-bg">
  <div class="imp-modal" style="min-width:420px">
    <div style="font-size:14px;font-weight:700;margin-bottom:8px">🗂 Impresión por lotes</div>
    <div id="impBatchEntries" style="display:flex;flex-direction:column;gap:3px;max-height:220px;overflow-y:auto;margin-bottom:8px"></div>
    <div style="display:flex;gap:4px;margin-bottom:10px">
      <input id="impBatchMat" placeholder="Matrícula" style="flex:1;font-size:11px">
      <input id="impBatchNom" placeholder="Nombre" style="flex:1;font-size:11px">
      <button class="btn btn-xs btn-p" onclick="window._imp.addBatchEntry()">+ Añadir</button>
    </div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px">
      Formato activo del canvas. <span style="color:var(--blue);font-weight:600" id="impBatchCount">0 entradas</span>
    </div>
    <div style="display:flex;gap:4px;justify-content:flex-end">
      <button class="btn btn-sm btn-gh" onclick="window._imp.closeModal('impBatchModal')">Cancelar</button>
      <button class="btn btn-sm" style="background:#16a34a;color:#fff;border-radius:20px" onclick="window._imp.execBatch()">🗂 Imprimir todos</button>
    </div>
  </div>
</div>
`;

  // Init copias buttons
  _setCopias(1);
}

// ── Exponer API global para onclick inline ─────────────────────────
function _exposeGlobal() {
  window._imp = {
    switchSub:     (k) => _switchSub(k),
    setFont:       (f) => _setFont(f),
    setPaper:      (s) => _setPaper(s),
    toggleMode:    ()  => _toggleMode(),
    toggleRotation:()  => _toggleRotation(),
    setZoom:       (v) => _setZoom(v),
    toggleQR:      ()  => _toggleQR(),
    addSpecialChip:(k) => _addSpecialChip(k),
    toggleFields:  ()  => _toggleFields(),
    loadBG:        (i) => _loadBG(i),
    setBGOpacity:  (v) => _setBGOpacity(v),
    clearBG:       ()  => _clearBG(),
    preSaveTpl:    ()  => _preSaveTpl(),
    confirmSaveTpl:()  => _confirmSaveTpl(),
    exportCanvas:  ()  => _exportCanvas(),
    importCanvas:  (i) => _importCanvas(i),
    openBatch:     ()  => _openBatch(),
    addBatchEntry: ()  => _addBatchEntry(),
    execBatch:     ()  => _execBatch(),
    autoLayout:    ()  => _autoLayout(),
    // Toolbar
    resizeSel:     (d) => _resizeSel(d),
    toggleStyle:   (p) => _toggleStyle(p),
    setAlign:      (a) => _setAlignSel(a),
    setColor:      (v) => _setColor(v),
    setBgColor:    (v) => _setBgColor(v),
    toggleBorder:  ()  => _toggleBorder(),
    setBorderColor:(v) => _setBorderColor(v),
    toggleLineSel: ()  => _toggleLineSel(),
    toggleLock:    ()  => _toggleLock(),
    toggleLabelMode:() => _toggleLabelMode(),
    undo:          ()  => _undo(),
    redo:          ()  => _redo(),
    clearAll:      ()  => _clearAll(),
    resetDia0:     ()  => _resetDia0(),
    doPreview:     ()  => _doPreview(),
    openPrintDialog:() => _openPrintDialog(),
    setPrintData:  (m) => _setPrintData(m),
    execPrint:     ()  => _execPrint(),
    closeModal:    (id)=> _closeModal(id),
    loadTpl:       (n) => _loadTpl(n),
    editTpl:       (n) => _editTpl(n),
    delTpl:        (n) => _delTpl(n),
    togglePrintTpl:(id,el)=> _togglePrintTpl(id,el),
    onDrop:        (e) => _onDrop(e),
    onPvClick:     (e) => _onPvClick(e),
    setTheme:      (t) => _setTheme(t),
  };
}

// ── Switch subtab ──────────────────────────────────────────────────
async function _switchSub(key, initial=false) {
  if (!initial) {
    const cfg = _cfgCache[_ck];
    if (cfg) { cfg.fieldLayout = { ..._placed }; await _saveCfg(_ck, cfg); }
  }
  _ck = key;
  _placed = {};
  _selKey = null;
  // Update subtab buttons
  ['ing1','ing2','ag','emb'].forEach(k => {
    const b = document.getElementById({ing1:'impTabIng1',ing2:'impTabIng2',ag:'impTabAg',emb:'impTabEmb'}[k]);
    if (b) b.className = 'btn btn-xs ' + (k === _ck ? 'btn-p' : 'btn-gh');
  });
  _updatePaperBtns();
  _updateModeBtn();
  _updateQRToggle();
  await _updateFrases();
  _applyScale();
  await _loadStateFromCfg();
  _renderPalette();
  await _renderTplList();
  // Reset history for this subtab
  _pushHistory();
}

// ── Canvas scale ──────────────────────────────────────────────────
function _applyScale() {
  const cfg = _cfgCache[_ck] || _defCfg();
  const paper = PAPERS[cfg.paperSize || 'A4'];
  const isLand = cfg.landscape === true;
  const pw = isLand ? paper.ph : paper.pw;
  const ph = isLand ? paper.pw : paper.ph;
  const cvArea = document.getElementById('impCvArea');
  const pv     = document.getElementById('impPv');
  const pvWrap = document.getElementById('impPvWrap');
  if (!pv || !cvArea) return;
  const availW = cvArea.clientWidth  - 16;
  const availH = cvArea.clientHeight - 16;
  const autoSc = Math.min(availW / pw, availH / ph, 1);
  const sc = _manualZoom !== null ? _manualZoom / 100 : autoSc;
  _scale = Math.max(sc, 0.05);
  pv.style.width  = pw + 'px';
  pv.style.height = ph + 'px';
  pv.style.transform = `scale(${_scale})`;
  pv.style.transformOrigin = 'top left';
  pvWrap.style.width  = Math.round(pw * _scale) + 'px';
  pvWrap.style.height = Math.round(ph * _scale) + 'px';
  const zl = document.getElementById('impZoomLbl'); if(zl) zl.textContent = Math.round(_scale * 100) + '%';
  const zs = document.getElementById('impZoomSlider'); if(zs) zs.value = Math.round(_scale * 100);
  const si = document.getElementById('impScaleInfo');
  if(si) si.textContent = `${cfg.paperSize||'A4'}${isLand?' ↔':' ↕'} · ${pw}×${ph}px · ${Math.round(_scale*100)}%`;
  _updateRotBtn();
}

function _setZoom(v) {
  _manualZoom = v === 'auto' ? null : parseInt(v);
  _applyScale();
}

// ── Load state from config ────────────────────────────────────────
async function _loadStateFromCfg() {
  const cfg = await _loadCfg(_ck);
  _placed = {};
  document.querySelectorAll('.imp-pfc').forEach(e => e.remove());
  // BG image
  const bgImg = document.getElementById('impBgImg');
  if (cfg.bgImage && bgImg) {
    bgImg.src = cfg.bgImage; bgImg.style.display = 'block';
    bgImg.style.opacity = String(cfg.bgOpacity || 0.35);
  } else if (bgImg) { bgImg.src = ''; bgImg.style.display = 'none'; }
  // Font
  const selFont = document.getElementById('impSelFont');
  if (selFont) selFont.value = cfg.font || 'Arial';
  // Label mode
  _labelMode[_ck] = cfg.labelMode || 0;
  _updateLblBtn();
  // Cut line
  const cut = document.getElementById('impCutLine');
  if (cut) cut.style.display = cfg.mode === 'troquel' ? 'block' : 'none';
  // Restore chips
  const saved = cfg.fieldLayout || {};
  Object.keys(saved).forEach(k => {
    const p = saved[k];
    if (p && typeof p.x === 'number') {
      _placed[k] = { ...p };
      _makeChip(k, p.x, p.y, p.fs, p.line);
    }
  });
}

// ── Chip engine ───────────────────────────────────────────────────
function _getFont() { return (_cfgCache[_ck]?.font) || 'Arial'; }

function _chipHtml(k) {
  const bk = k.replace(/_\d+$/, '');
  const f  = FIELDS.find(x => x.k === bk) || { k:bk, l:bk, demo:'—' };
  const p  = _placed[k];
  if (!p) return '';
  const cfg = _cfgCache[_ck] || _defCfg();
  const lm  = _labelMode[_ck] || 0;
  const iStyle = `width:100%;word-break:break-word;white-space:pre-wrap;display:block;`
    + (p.align      ? `text-align:${p.align};` : '')
    + (p.bold       ? 'font-weight:900;' : '')
    + (p.italic     ? 'font-style:italic;' : '')
    + (p.underline  ? 'text-decoration:underline;' : '')
    + (p.color      ? `color:${p.color};` : '');

  if (k === '_qr') {
    const sz = (p.fs || 20) * 2;
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 5 5" shape-rendering="crispEdges"><rect width="2" height="2" fill="#000"/><rect x="1" y="1" width="1" height="1" fill="#fff"/><rect x="3" width="2" height="2" fill="#000"/><rect y="3" width="2" height="2" fill="#000"/><rect x="2" y="2" width="3" height="3" fill="#000"/><rect x="3" y="3" width="2" height="2" fill="#fff"/></svg>`;
  }
  if (k === '_ph1') {
    const ph1L = cfg.phrase1Langs || {};
    const op   = ph1L['es'] || (cfg.phrases?.['es']) || 'Frase 1...';
    const drv  = ph1L['fr'] || op;
    return `<span style="${iStyle}">${safeHtml(op)}${drv !== op ? '\n[fr] ' + safeHtml(drv) : ''}</span>`;
  }
  if (k === '_ph2') {
    return `<span style="${iStyle}">${safeHtml(cfg.phrase2 || 'Frase 2...')}</span>`;
  }
  if (k === '_ph3') {
    const ph3 = cfg.puerta3 || {};
    return `<span style="${iStyle}">${safeHtml(ph3.nombre || 'Frase 3 / QR acceso')}${ph3.url ? '\n' + ph3.url.substring(0,40) : ''}</span>`;
  }
  if (lm === 0) return `<span style="${iStyle}"><b style="font-weight:inherit">${f.l}</b>: ${f.demo}</span>`;
  if (lm === 1) return `<span style="${iStyle}"><b>${f.l}</b>: <span style="display:inline-block;min-width:40px;border-bottom:1px solid currentColor;height:1px;vertical-align:bottom;margin-left:3px"></span></span>`;
  return `<span style="${iStyle}">${f.demo}</span>`;
}

function _makeChip(k, xp, yp, fs, line) {
  const existing = _placed[k];
  _placed[k] = { x:parseFloat(xp), y:parseFloat(yp), fs:parseFloat(fs)||8, line:!!line, ...(existing||{}) };
  _placed[k].x = parseFloat(xp); _placed[k].y = parseFloat(yp);
  _placed[k].fs = parseFloat(fs)||8; _placed[k].line = !!line;
  const pv = document.getElementById('impPv'); if (!pv) return;
  let el = document.getElementById('chip-' + k);
  if (!el) {
    el = document.createElement('div');
    el.className = 'imp-pfc'; el.id = 'chip-' + k;
    el.setAttribute('data-k', k);
    el.addEventListener('mousedown', _chipDown);
    pv.appendChild(el);
  }
  const p = _placed[k];
  const bgC = p.bgColor || 'rgba(235,245,255,.93)';
  const bdC = p.borderColor || '#3b5bdb';
  const bdW = p.borderOn ? '2px' : '1.5px';
  const bdSt = p.locked ? 'dashed' : 'solid';
  el.style.cssText = `position:absolute;border:${bdW} ${bdSt} ${bdC};background:${bgC};border-radius:2px;`
    + `padding:2px 16px 2px 4px;font-size:${p.fs||8}px;cursor:${p.locked?'default':'move'};`
    + `z-index:10;display:block;line-height:1.4;user-select:none;overflow:hidden;`
    + `min-width:20px;min-height:14px;box-sizing:border-box;`
    + `font-family:${_getFont()},Arial,sans-serif;left:${xp}%;top:${yp}%`
    + (p.line   ? ';border-bottom:2.5px solid #f59e0b' : '')
    + (p.w      ? `;width:${p.w}%` : '')
    + (p.h      ? `;height:${p.h}%` : '');
  el.innerHTML = _chipHtml(k)
    + `<span class="pfc-rm" data-k="${k}">✕</span>`
    + `<span class="pfc-rh" data-k="${k}"></span>`;
  el.querySelector('.pfc-rm').onclick = e => {
    e.stopPropagation();
    if (!_placed[e.target.dataset.k]?.locked) _delChip(e.target.dataset.k);
  };
  el.querySelector('.pfc-rh').addEventListener('mousedown', _resizeDown);
  _renderPalette();
}

function _refreshChip(k) {
  const el = document.getElementById('chip-' + k);
  if (!el || !_placed[k]) return;
  const p = _placed[k];
  el.style.background    = p.bgColor || 'rgba(235,245,255,.93)';
  el.style.borderColor   = p.borderColor || '#3b5bdb';
  el.style.borderWidth   = p.borderOn ? '2px' : '1.5px';
  el.style.fontSize      = p.fs + 'px';
  el.style.fontFamily    = _getFont() + ',Arial,sans-serif';
  el.style.borderBottom  = p.line ? '2.5px solid #f59e0b' : '';
  if (p.w) el.style.width  = p.w + '%';
  if (p.h) el.style.height = p.h + '%';
  el.innerHTML = _chipHtml(k)
    + `<span class="pfc-rm" data-k="${k}">✕</span>`
    + `<span class="pfc-rh" data-k="${k}"></span>`;
  el.querySelector('.pfc-rm').onclick = e => {
    e.stopPropagation();
    if (!_placed[e.target.dataset.k]?.locked) _delChip(e.target.dataset.k);
  };
  el.querySelector('.pfc-rh').addEventListener('mousedown', _resizeDown);
  if (k === _selKey) _updateToolbarState(k);
}

function _delChip(k) {
  _pushHistory();
  const el = document.getElementById('chip-' + k); if (el) el.remove();
  delete _placed[k];
  if (_selKey === k) _selKey = null;
  _renderPalette();
  _saveLayout();
}

function _saveLayout() {
  const cfg = _cfgCache[_ck];
  if (cfg) { cfg.fieldLayout = { ..._placed }; _saveCfg(_ck, cfg); }
}

// ── History ───────────────────────────────────────────────────────
function _pushHistory() {
  if (_histLock) return;
  const snap = JSON.stringify(_placed);
  const hist = _hist[_ck];
  hist.splice(_histIdx[_ck] + 1);
  hist.push(snap);
  if (hist.length > 50) hist.shift();
  _histIdx[_ck] = hist.length - 1;
}

function _restoreSnap(snap) {
  _histLock = true;
  document.querySelectorAll('.imp-pfc').forEach(e => e.remove());
  _placed = {};
  try { _placed = JSON.parse(snap); } catch(e) {}
  Object.keys(_placed).forEach(k => {
    const p = _placed[k];
    if (p && typeof p.x === 'number') _makeChip(k, p.x, p.y, p.fs, p.line);
  });
  _saveLayout(); _renderPalette();
  _histLock = false;
}

function _undo() {
  const hist = _hist[_ck], idx = _histIdx[_ck];
  if (idx <= 0) return;
  _histIdx[_ck]--;
  _restoreSnap(hist[_histIdx[_ck]]);
}
function _redo() {
  const hist = _hist[_ck], idx = _histIdx[_ck];
  if (idx >= hist.length - 1) return;
  _histIdx[_ck]++;
  _restoreSnap(hist[_histIdx[_ck]]);
}

// ── Snap guides ───────────────────────────────────────────────────
function _showGuides(nx, ny, excl) {
  const gh = document.getElementById('impGH'), gv = document.getElementById('impGV');
  const aH = [0,25,50,75,100], aV = [0,25,50,75,100];
  Object.entries(_placed).forEach(([k, p]) => { if (k!==excl){aH.push(p.y);aV.push(p.x);} });
  let sx=nx, sy=ny, sh=false, sv=false;
  aV.forEach(v => { if (Math.abs(nx-v) < SNAP) { sx=v; sv=true; } });
  aH.forEach(h => { if (Math.abs(ny-h) < SNAP) { sy=h; sh=true; } });
  if (gh) { gh.style.display=sh?'block':'none'; gh.style.top=sy+'%'; }
  if (gv) { gv.style.display=sv?'block':'none'; gv.style.left=sx+'%'; }
  return { x:sx, y:sy };
}
function _hideGuides() {
  const gh=document.getElementById('impGH'), gv=document.getElementById('impGV');
  if (gh) gh.style.display='none'; if (gv) gv.style.display='none';
}

// ── Chip drag ─────────────────────────────────────────────────────
function _chipDown(e) {
  if (e.target.classList.contains('pfc-rm') || e.target.classList.contains('pfc-rh')) return;
  const ch = e.currentTarget, k = ch.getAttribute('data-k');
  if (_placed[k]?.locked) return;
  document.querySelectorAll('.imp-pfc').forEach(c => { c.classList.remove('pfc-sel'); c.style.boxShadow=''; });
  ch.classList.add('pfc-sel'); ch.style.boxShadow='0 0 0 2px rgba(59,91,219,.3)';
  _selKey = k; _updateToolbarState(k);
  const bk = k.replace(/_\d+$/, ''), f = FIELDS.find(x => x.k===bk) || {l:k};
  const p = _placed[k] || {};
  document.getElementById('impSelInfo').textContent = `${f.l} · ${p.fs||8}px · ${p.align||'izq'} · ${Math.round(_scale*100)}%`;
  _dragging=true; _chipKey=k; _sx=e.clientX; _sy=e.clientY;
  _sl = parseFloat(ch.style.left)||0; _st = parseFloat(ch.style.top)||0;
  e.preventDefault();
}

function _resizeDown(e) {
  e.stopPropagation(); e.preventDefault();
  const k = e.currentTarget.getAttribute('data-k');
  if (_placed[k]?.locked) return;
  const pv=document.getElementById('impPv'); if (!pv) return;
  const pvR=pv.getBoundingClientRect(), elR=document.getElementById('chip-'+k).getBoundingClientRect();
  _resizing=true; _rKey=k; _rsx=e.clientX; _rsy=e.clientY;
  _rsW = _placed[k].w || (elR.width  / pvR.width  * 100);
  _rsH = _placed[k].h || (elR.height / pvR.height * 100);
}

function _bindGlobalEvents() {
  _exposeGlobal();
  document.addEventListener('mousemove', _onMouseMove);
  document.addEventListener('mouseup',   _onMouseUp);
  document.addEventListener('keydown',   _onKeyDown);
  window.addEventListener('resize', () => _applyScale());
}

function _onMouseMove(e) {
  if (_dragging && _chipKey) {
    const pv = document.getElementById('impPv'); if (!pv) return;
    const r = pv.getBoundingClientRect();
    let nx = Math.max(0, Math.min(92, _sl + (e.clientX-_sx)/r.width*100));
    let ny = Math.max(0, Math.min(96, _st + (e.clientY-_sy)/r.height*100));
    const sn = _showGuides(nx, ny, _chipKey); nx=sn.x; ny=sn.y;
    const ch = document.getElementById('chip-' + _chipKey);
    if (ch) { ch.style.left=nx+'%'; ch.style.top=ny+'%'; }
    if (_placed[_chipKey]) { _placed[_chipKey].x=nx; _placed[_chipKey].y=ny; }
  }
  if (_resizing && _rKey) {
    const pv = document.getElementById('impPv'); if (!pv) return;
    const r = pv.getBoundingClientRect();
    const dx = (e.clientX-_rsx)/r.width*100, dy = (e.clientY-_rsy)/r.height*100;
    const el = document.getElementById('chip-' + _rKey);
    if (!el || !_placed[_rKey]) return;
    const nw = Math.max(2, _rsW+dx), nh = Math.max(1, _rsH+dy);
    _placed[_rKey].w=nw; el.style.width=nw+'%';
    _placed[_rKey].h=nh; el.style.height=nh+'%';
  }
}

function _onMouseUp() {
  if (_dragging && _chipKey) { _pushHistory(); _saveLayout(); _hideGuides(); }
  if (_resizing && _rKey)   { _pushHistory(); _saveLayout(); }
  _dragging=false; _chipKey=null; _resizing=false; _rKey=null;
}

function _onKeyDown(e) {
  if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key==='z'||e.key==='Z'){e.preventDefault();_undo();}
    if (e.key==='y'||e.key==='Y'){e.preventDefault();_redo();}
    if (_selKey) {
      if (e.key==='b'||e.key==='B'){e.preventDefault();_toggleStyle('bold');}
      if (e.key==='i'||e.key==='I'){e.preventDefault();_toggleStyle('italic');}
      if (e.key==='u'||e.key==='U'){e.preventDefault();_toggleStyle('underline');}
      if (e.key==='l'||e.key==='L'){e.preventDefault();_setAlignSel('left');}
      if (e.key==='e'||e.key==='E'){e.preventDefault();_setAlignSel('center');}
      if (e.key==='r'||e.key==='R'){e.preventDefault();_setAlignSel('right');}
    }
  }
  if ((e.key==='Delete'||e.key==='Backspace') && _selKey && !e.ctrlKey) {
    e.preventDefault(); _delChip(_selKey); _selKey=null;
  }
}

function _onDrop(e) {
  e.preventDefault();
  const k = window.pcDragKey; if (!k) return;
  const pv = document.getElementById('impPv'); if (!pv) return;
  const r = pv.getBoundingClientRect();
  const x = ((e.clientX-r.left)/r.width*100).toFixed(1);
  const y = ((e.clientY-r.top)/r.height*100).toFixed(1);
  let fk = k; for (let i=2; _placed[fk]; i++) fk = k+'_'+i;
  _pushHistory(); _makeChip(fk, x, y, 8, false);
  window.pcDragKey = null;
}

function _onPvClick(e) {
  if (!e.target.closest('.imp-pfc')) {
    document.querySelectorAll('.imp-pfc').forEach(c => { c.classList.remove('pfc-sel'); c.style.boxShadow=''; });
    _selKey = null;
    document.getElementById('impSelInfo').textContent = '← selecciona un campo en la ficha';
    const lb=document.getElementById('impLineBtn');if(lb){lb.style.background='';lb.style.color='';}
    const lk=document.getElementById('impLockBtn');if(lk){lk.textContent='🔓';lk.style.background='';}
  }
}

// ── Palette ───────────────────────────────────────────────────────
function _renderPalette() {
  const pal = document.getElementById('impPalette'); if (!pal) return;
  const counts = {};
  Object.keys(_placed).forEach(k => { const b=k.replace(/_\d+$/,''); counts[b]=(counts[b]||0)+1; });
  pal.innerHTML = FIELDS.map(f => {
    const cnt=counts[f.k]||0, isP=cnt>0;
    const dot = `<div style="width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${isP?'#94a3b8':'#3b5bdb'};margin-right:3px"></div>`;
    const badge = cnt>1
      ? `<span style="font-size:8px;background:#3b5bdb;color:#fff;border-radius:8px;padding:0 4px;margin-left:2px">×${cnt}</span>`
      : (isP ? '<span style="font-size:8px;color:#a5b4fc;margin-left:2px">✓</span>' : '');
    const addBtn = `<button data-bk="${f.k}" style="padding:1px 4px;border-radius:20px;font-size:9px;background:#e0f2fe;color:#0369a1;border:.5px solid #7dd3fc;cursor:pointer;flex-shrink:0">+</button>`;
    const lineBtn = isP ? `<button data-bk2="${f.k}" style="padding:1px 3px;border-radius:20px;font-size:8px;border:.5px solid #cbd5e1;background:var(--bg3);color:var(--text3);cursor:pointer;flex-shrink:0">✏</button>` : '';
    return `<div class="imp-fpi" id="impFpi-${f.k}">
      <div draggable="true" data-fk="${f.k}" style="display:flex;align-items:center;flex:1;cursor:grab;min-width:0">${dot}
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${isP?'opacity:.6':''}">${f.l.length>16?f.l.substring(0,15)+'…':f.l}</span>${badge}
      </div>${lineBtn}${addBtn}
    </div>`;
  }).join('');

  pal.querySelectorAll('[draggable="true"]').forEach(el => {
    el.ondragstart = ev => { window.pcDragKey = el.dataset.fk; ev.dataTransfer.effectAllowed='move'; };
  });
  pal.querySelectorAll('[data-bk]').forEach(btn => {
    btn.onclick = () => {
      let k = btn.dataset.bk;
      for (let i=2; _placed[k]; i++) k = btn.dataset.bk + '_' + i;
      const cnt = Object.keys(_placed).filter(pk => pk===btn.dataset.bk||pk.startsWith(btn.dataset.bk+'_')).length;
      _pushHistory(); _makeChip(k, 5+(cnt*8)%60, 28+(cnt*10)%55, 8, false);
    };
  });
  pal.querySelectorAll('[data-bk2]').forEach(btn => {
    btn.onclick = () => {
      const bk = btn.dataset.bk2;
      const k  = _placed[bk] ? bk : Object.keys(_placed).find(pk => pk.startsWith(bk+'_'));
      if (k && _placed[k]) { _pushHistory(); _placed[k].line=!_placed[k].line; _refreshChip(k); _saveLayout(); }
    };
  });
}

// ── Toolbar actions ───────────────────────────────────────────────
function _updateToolbarState(k) {
  const p = _placed[k] || {};
  const act = (id, on) => { const b=document.getElementById(id); if(b){b.style.background=on?'var(--blue)':'';b.style.color=on?'#fff':'';} };
  act('impBtnBold',p.bold); act('impBtnItalic',p.italic); act('impBtnUnder',p.underline);
  ['impBtnAlL','impBtnAlC','impBtnAlR'].forEach(id => act(id, false));
  act({left:'impBtnAlL',center:'impBtnAlC',right:'impBtnAlR'}[p.align||'left'], true);
  const cp=document.getElementById('impCpTxtPrev');    if(cp)cp.style.background=p.color||'#000';
  const bp=document.getElementById('impCpBgPrev');     if(bp)bp.style.background=p.bgColor||'rgba(235,245,255,.93)';
  const bdp=document.getElementById('impCpBorderPrev');if(bdp)bdp.style.borderColor=p.borderColor||'#3b5bdb';
  act('impBtnBorder', p.borderOn);
  const lb=document.getElementById('impLineBtn');if(lb){lb.style.background=p.line?'#f59e0b':'';lb.style.color=p.line?'#fff':'';}
  const lk=document.getElementById('impLockBtn');if(lk){lk.textContent=p.locked?'🔒':'🔓';lk.style.background=p.locked?'var(--amber)':'';}
}

function _toggleStyle(prop) { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey][prop]=!_placed[_selKey][prop]; _refreshChip(_selKey); _saveLayout(); _updateToolbarState(_selKey); }
function _setAlignSel(a)    { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].align=a; _refreshChip(_selKey); _saveLayout(); _updateToolbarState(_selKey); }
function _setColor(v)       { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].color=v; document.getElementById('impCpTxtPrev').style.background=v; _refreshChip(_selKey); _saveLayout(); }
function _setBgColor(v)     { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].bgColor=v; document.getElementById('impCpBgPrev').style.background=v; _refreshChip(_selKey); _saveLayout(); }
function _toggleBorder()    { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].borderOn=!_placed[_selKey].borderOn; _refreshChip(_selKey); _saveLayout(); _updateToolbarState(_selKey); }
function _setBorderColor(v) { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].borderColor=v; document.getElementById('impCpBorderPrev').style.borderColor=v; _refreshChip(_selKey); _saveLayout(); }
function _toggleLineSel()   { if(!_selKey||!_placed[_selKey])return; _pushHistory(); _placed[_selKey].line=!_placed[_selKey].line; _refreshChip(_selKey); _saveLayout(); _updateToolbarState(_selKey); }
function _toggleLock()      {
  if(!_selKey||!_placed[_selKey])return;
  _placed[_selKey].locked=!_placed[_selKey].locked;
  _refreshChip(_selKey); _saveLayout(); _updateToolbarState(_selKey);
  toast(_placed[_selKey].locked?'🔒 Campo bloqueado':'🔓 Campo desbloqueado','var(--amber)');
}
function _resizeSel(d) {
  if(!_selKey||!_placed[_selKey])return;
  _pushHistory();
  _placed[_selKey].fs = Math.max(5, Math.min(72, (_placed[_selKey].fs||8)+d));
  const el = document.getElementById('chip-'+_selKey); if(el) el.style.fontSize=_placed[_selKey].fs+'px';
  _saveLayout();
}
function _toggleLabelMode() {
  const lm = _labelMode[_ck], nxt=(lm+1)%3;
  _labelMode[_ck]=nxt;
  const cfg = _cfgCache[_ck]; if(cfg){ cfg.labelMode=nxt; _saveCfg(_ck,cfg); }
  _updateLblBtn();
  document.querySelectorAll('.imp-pfc').forEach(el => { const k=el.getAttribute('data-k'); if(k)_refreshChip(k); });
}
function _updateLblBtn() {
  const btn=document.getElementById('impLblBtn'), lm=_labelMode[_ck];
  if(!btn)return;
  if(lm===0){btn.style.background='';btn.style.color='';btn.textContent='📋 Etiq+Val';}
  else if(lm===1){btn.style.background='var(--blue)';btn.style.color='#fff';btn.textContent='📋 Etiq+Lín';}
  else{btn.style.background='var(--green)';btn.style.color='#fff';btn.textContent='📋 Solo Val';}
}
function _clearAll() {
  _pushHistory();
  document.querySelectorAll('.imp-pfc').forEach(e=>e.remove());
  _placed={}; _hideGuides();
  const cfg=_cfgCache[_ck]; if(cfg){cfg.canvasCleared=true; _saveCfg(_ck,cfg);}
  _renderPalette();
}
function _autoLayout() {
  _pushHistory(); _clearAll();
  const AUTO = [
    {k:'empresa',x:5,y:28,fs:8},{k:'expositor',x:52,y:28,fs:8},
    {k:'hall',x:5,y:33,fs:8},{k:'stand',x:52,y:33,fs:8},
    {k:'puertaHall',x:5,y:38,fs:8},{k:'remolque',x:52,y:38,fs:8},
    {k:'tipoVehiculo',x:5,y:43,fs:8,line:true},{k:'descargaTipo',x:52,y:43,fs:8,line:true},
    {k:'referencia',x:5,y:48,fs:8,line:true},{k:'montador',x:52,y:48,fs:8,line:true},
    {k:'nombreCompleto',x:5,y:53,fs:8},{k:'telefonoCompleto',x:52,y:53,fs:8},
    {k:'tipoCarga',x:5,y:58,fs:8,line:true},{k:'llamador',x:52,y:58,fs:8},
  ];
  AUTO.forEach(i => _makeChip(i.k, i.x, i.y, i.fs, i.line||false));
  toast('⚡ Auto-layout aplicado','var(--blue)');
}

// ── Paper / Font / Mode / QR ──────────────────────────────────────
function _setPaper(sz) {
  _pushHistory();
  const cfg = _cfgCache[_ck] || _defCfg();
  cfg.paperSize = sz; _cfgCache[_ck]=cfg; _saveCfg(_ck, cfg);
  _updatePaperBtns(); _applyScale();
  toast('📄 Papel ' + sz, 'var(--blue)');
}
function _updatePaperBtns() {
  const p = (_cfgCache[_ck]?.paperSize) || 'A4';
  const wrap = document.getElementById('impPaperBtns'); if(!wrap)return;
  wrap.innerHTML = ['A3','A4','A5'].map(sz =>
    `<button class="btn btn-xs ${p===sz?'btn-p':'btn-gh'}" onclick="window._imp.setPaper('${sz}')">${sz}</button>`
  ).join('');
}
function _setFont(f) {
  const cfg = _cfgCache[_ck] || _defCfg();
  cfg.font = f; _cfgCache[_ck]=cfg; _saveCfg(_ck, cfg);
  document.querySelectorAll('.imp-pfc').forEach(el => el.style.fontFamily = f+',Arial,sans-serif');
}
function _toggleMode() {
  const cfg = _cfgCache[_ck] || _defCfg();
  cfg.mode = cfg.mode === 'troquel' ? 'normal' : 'troquel';
  _cfgCache[_ck]=cfg; _saveCfg(_ck, cfg);
  _updateModeBtn();
  const cut = document.getElementById('impCutLine');
  if(cut) cut.style.display = cfg.mode==='troquel' ? 'block' : 'none';
}
function _updateModeBtn() {
  const cfg = _cfgCache[_ck]; const isTrq = cfg?.mode==='troquel';
  const btn = document.getElementById('impModeBtn'); if(!btn)return;
  btn.textContent  = isTrq ? '✂ Troquel' : '📄 Normal';
  btn.style.background = isTrq ? '#7c3aed' : '';
  btn.style.color      = isTrq ? '#fff' : '';
}
function _toggleQR() {
  const cfg = _cfgCache[_ck] || _defCfg();
  cfg.qrTracking = !cfg.qrTracking; _cfgCache[_ck]=cfg; _saveCfg(_ck, cfg);
  _updateQRToggle();
}
function _updateQRToggle() {
  const on = _cfgCache[_ck]?.qrTracking;
  const track = document.getElementById('impQrTrack'); if(track) track.className='imp-tgl-t'+(on?' on':'');
  const lbl   = document.getElementById('impQrLbl');   if(lbl){lbl.textContent=on?'ON':'OFF';lbl.style.color=on?'var(--blue)':'var(--text3)';}
}

function _toggleRotation() {
  const cfg = _cfgCache[_ck] || _defCfg();
  cfg.landscape = !cfg.landscape;
  _cfgCache[_ck] = cfg; _saveCfg(_ck, cfg);
  _updateRotBtn();
  _applyScale();
  toast(cfg.landscape ? '↔ Horizontal' : '↕ Vertical', 'var(--blue)');
}
function _updateRotBtn() {
  const isL = _cfgCache[_ck]?.landscape;
  const btn = document.getElementById('impRotBtn'); if (!btn) return;
  btn.textContent = isL ? '↔ Horizontal' : '↕ Vertical';
}
function _addSpecialChip(k) {
  if (!_placed[k]) { _pushHistory(); _makeChip(k, 75, 5, 20, false); }
  else toast('Ya está en el canvas', 'var(--text3)');
}

// ── BG Image ──────────────────────────────────────────────────────
function _loadBG(inp) {
  const f = inp.files[0]; if(!f)return;
  const r = new FileReader(); r.onload = async e => {
    const img = document.getElementById('impBgImg');
    if(img){img.src=e.target.result;img.style.display='block';img.style.opacity='.35';}
    const cfg = _cfgCache[_ck] || _defCfg();
    cfg.bgImage=e.target.result; cfg.bgOpacity=.35;
    _cfgCache[_ck]=cfg; await _saveCfg(_ck, cfg);
  };
  r.readAsDataURL(f);
}
function _setBGOpacity(v) {
  const img=document.getElementById('impBgImg'); if(img) img.style.opacity=v/100;
  document.getElementById('impBgOpLbl').textContent=v+'%';
  const cfg=_cfgCache[_ck]; if(cfg){cfg.bgOpacity=v/100; _saveCfg(_ck,cfg);}
}
function _clearBG() {
  const img=document.getElementById('impBgImg'); if(img){img.src='';img.style.display='none';}
  const cfg=_cfgCache[_ck]; if(cfg){delete cfg.bgImage;delete cfg.bgOpacity; _saveCfg(_ck,cfg);}
}

// ── Frases (multiidioma v6) ───────────────────────────────────────
async function _updateFrases() {
  const cfg = await _loadCfg(_ck);
  const ph3 = cfg.puerta3 || {};
  const ph1L = cfg.phrase1Langs || {};
  let html = '';
  // Frase 1 — por idioma
  const isOn1 = cfg.ph1On === true;
  html += `<div class="imp-sec"><div class="imp-sec-hdr">Frase 1 — multiidioma
    <div class="imp-tgl" onclick="window._imp._togglePh('p1')">
      <div class="imp-tgl-t${isOn1?' on':''}"><div class="th"></div></div>
      <span style="font-size:9px;font-weight:700;color:${isOn1?'var(--blue)':'var(--text3)'}">${isOn1?'ON':'OFF'}</span>
    </div>
    <button class="btn btn-xs ${isOn1?'btn-p':'btn-gh'}" onclick="window._imp.addSpecialChip('_ph1')" style="padding:1px 4px;font-size:9px;margin-left:3px" ${isOn1?'':'disabled'}>+</button>
  </div>`;
  if (isOn1) {
    html += `<div style="padding:4px 6px;display:flex;flex-direction:column;gap:3px">`;
    for (const [lc, name] of Object.entries(LANGS_PRINT)) {
      const val = ph1L[lc] || (lc==='es' ? (cfg.phrases?.['es']||'') : '');
      html += `<div style="display:flex;align-items:center;gap:3px">
        <span style="font-size:9px;font-weight:600;color:var(--text3);width:20px;flex-shrink:0">${lc}</span>
        <input data-lc="${lc}" class="imp-ph1-inp" placeholder="${safeHtml(name)}..." value="${safeHtml(val)}" style="flex:1;font-size:10px;padding:2px 5px;border:.5px solid var(--border);border-radius:3px" oninput="window._imp._savePh1Lang(this)">
      </div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  // Frase 2
  const isOn2 = cfg.ph2On !== false;
  html += `<div class="imp-sec"><div class="imp-sec-hdr">Frase 2 — pie ficha
    <div class="imp-tgl" onclick="window._imp._togglePh('p2')">
      <div class="imp-tgl-t${isOn2?' on':''}"><div class="th"></div></div>
      <span style="font-size:9px;font-weight:700;color:${isOn2?'var(--blue)':'var(--text3)'}">${isOn2?'ON':'OFF'}</span>
    </div>
    <button class="btn btn-xs ${isOn2?'btn-p':'btn-gh'}" onclick="window._imp.addSpecialChip('_ph2')" style="padding:1px 4px;font-size:9px;margin-left:3px" ${isOn2?'':'disabled'}>+</button>
  </div>`;
  if (isOn2) html += `<textarea id="impPh2Inp" rows="2" style="width:100%;font-size:10px;border:none;border-top:.5px solid var(--border);padding:3px 6px;background:var(--bg)" oninput="window._imp._savePh2()">${safeHtml(cfg.phrase2||'')}</textarea>`;
  html += `</div>`;
  // Frase 3 — QR Google Maps
  const isOn3 = cfg.ph3On === true;
  html += `<div class="imp-sec"><div class="imp-sec-hdr">Frase 3 — QR Google Maps
    <div class="imp-tgl" onclick="window._imp._togglePh('p3')">
      <div class="imp-tgl-t${isOn3?' on':''}"><div class="th"></div></div>
      <span style="font-size:9px;font-weight:700;color:${isOn3?'var(--blue)':'var(--text3)'}">${isOn3?'ON':'OFF'}</span>
    </div>
    <button class="btn btn-xs ${isOn3?'btn-p':'btn-gh'}" onclick="window._imp.addSpecialChip('_ph3')" style="padding:1px 4px;font-size:9px;margin-left:3px" ${isOn3?'':'disabled'}>+</button>
  </div>`;
  if (isOn3) {
    html += `<div style="padding:4px 6px;display:flex;flex-direction:column;gap:3px">
      <input id="impP3n" placeholder="Nombre del lugar visible en el pase" value="${safeHtml(ph3.nombre||'')}" style="font-size:10px;border:.5px solid var(--border);border-radius:3px;padding:2px 5px" oninput="window._imp._savePh3()">
      <input id="impP3u" placeholder="Pega aquí el link de Google Maps → se genera QR" value="${safeHtml(ph3.url||'')}" style="font-size:10px;border:.5px solid var(--border);border-radius:3px;padding:2px 5px" oninput="window._imp._savePh3()">
      ${ph3.url ? `<span style="font-size:9px;color:var(--green);font-weight:600">✓ QR se generará al imprimir con este link</span>` : ''}
    </div>`;
  }
  html += `</div>`;
  document.getElementById('impFrasesArea').innerHTML = html;
}

// Expose phrase helpers on global _imp
async function _togglePh(pk) {
  const cfg = await _loadCfg(_ck);
  if (pk==='p1') cfg.ph1On=!cfg.ph1On;
  else if (pk==='p2') cfg.ph2On=!(cfg.ph2On!==false);
  else cfg.ph3On=!cfg.ph3On;
  _cfgCache[_ck]=cfg; await _saveCfg(_ck, cfg);
  await _updateFrases();
}
async function _savePh1Lang(inp) {
  const cfg = await _loadCfg(_ck);
  if (!cfg.phrase1Langs) cfg.phrase1Langs={};
  const lc = inp.getAttribute('data-lc'), v=inp.value.trim();
  if (v) cfg.phrase1Langs[lc]=v; else delete cfg.phrase1Langs[lc];
  if (lc==='es'){if(!cfg.phrases)cfg.phrases={};cfg.phrases['es']=v;}
  _cfgCache[_ck]=cfg; await _saveCfg(_ck,cfg);
  if (_placed['_ph1']) _refreshChip('_ph1');
}
async function _savePh2() {
  const cfg = await _loadCfg(_ck);
  const el = document.getElementById('impPh2Inp');
  if (el){cfg.phrase2=el.value; _cfgCache[_ck]=cfg; await _saveCfg(_ck,cfg);}
  if (_placed['_ph2']) _refreshChip('_ph2');
}
async function _savePh3() {
  const cfg = await _loadCfg(_ck);
  cfg.puerta3={
    nombre:(document.getElementById('impP3n')?.value||'').trim(),
    url:(document.getElementById('impP3u')?.value||'').trim()
  };
  _cfgCache[_ck]=cfg; await _saveCfg(_ck,cfg);
  if (_placed['_ph3']) _refreshChip('_ph3');
  await _updateFrases();
}
function _toggleFields() {
  const b=document.getElementById('impFldBody'),a=document.getElementById('impFldArrow');
  if(!b)return; const open=b.style.display!=='none';
  b.style.display=open?'none':'flex'; if(a)a.textContent=open?'▸':'▾';
  if(!open&&!document.getElementById('impPalette')?.children.length)_renderPalette();
}

// Add phrase helpers to global object after exposeGlobal
function _extendGlobal() {
  Object.assign(window._imp, {
    _togglePh, _savePh1Lang, _savePh2, _savePh3,
  });
}

// ── Copias ────────────────────────────────────────────────────────
function _setCopias(n) {
  _nCopias = n;
  const wrap = document.getElementById('impCopyBtns'); if(!wrap)return;
  wrap.innerHTML = [1,2,3,5].map(v =>
    `<button class="btn btn-xs ${v===n?'btn-p':'btn-gh'}" onclick="window._imp._setCopias(${v})">×${v}</button>`
  ).join('');
  const lbl=document.getElementById('impCopiasLbl');
  if(lbl) lbl.textContent = n>1 ? `×${n} copias` : '';
}

// ── Build print HTML ──────────────────────────────────────────────
function _buildPrintHtml(cfg, ing) {
  const layout = cfg.fieldLayout || {};
  if (!Object.keys(layout).length) return null;
  const paper = PAPERS[cfg.paperSize||'A4'];
  const pW = cfg.paperSize==='A3'?'297mm':cfg.paperSize==='A5'?'148mm':'210mm';
  const pH = cfg.paperSize==='A3'?'420mm':cfg.paperSize==='A5'?'148mm':'297mm';
  const font = cfg.font||'Arial';
  const isTrq = cfg.mode==='troquel';
  const lm = cfg.labelMode || 0;
  const ingLang = ing.lang || 'es';
  const uLang   = AppState.get('currentLang') || 'es';

  // Real field values
  const tel = (ing.telPais||'') + (ing.telPais?' ':'') + (ing.telefono||'');
  const VAL = {
    posicion: ing.pos||'', matricula: ing.matricula||'',
    telefonoCompleto: tel.trim(),
    nombreCompleto: ((ing.nombre||'')+' '+(ing.apellido||'')).trim(),
    empresa:ing.empresa||'', expositor:ing.expositor||'', montador:ing.montador||'',
    hall:ing.hall||'', stand:ing.stand||'', puertaHall:ing.puertaHall||'',
    remolque:ing.remolque||'',
    tipoVehiculo: ({trailer:'Trailer',semiremolque:'B Semiremolque',camion:'A Camión'}[ing.tipoVehiculo]||ing.tipoVehiculo||''),
    descargaTipo: ({mano:'A Mano',maquinaria:'Maquinaria'}[ing.descargaTipo]||ing.descargaTipo||''),
    tipoCarga:ing.tipoCarga||'', referencia:ing.referencia||'',
    llamador:ing.llamador||'', pasaporte:ing.pasaporte||'', email:ing.email||'',
    pais:ing.pais||'', fechaNacimiento:ing.fechaNacimiento||'',
    comentario:ing.comentario||'', horario: _formatHorario(ing.entrada),
    eventoNombre:ing.eventoNombre||'', pase:ing.pase||'', gpsUrl:ing.gpsUrl||'',
  };

  // Phrase 1 — operator lang + driver lang if different
  const ph1Langs = cfg.phrase1Langs || {};
  const ph1op  = ph1Langs[uLang]   || (cfg.phrases?.[uLang])  || '';
  const ph1drv = ph1Langs[ingLang] || (cfg.phrases?.[ingLang]) || ph1op;

  // Phrase 2
  const phrase2 = cfg.ph2On!==false ? (cfg.phrase2||'') : '';
  // Phrase 3 / QR Maps
  const ph3 = cfg.ph3On===true ? (cfg.puerta3||{}) : {};
  // QR tracking URL
  const qrUrl = `${QR_BASE_URL}?id=${(ing.id||'DEMO').slice(0,8).toUpperCase()}`;

  // Build chips HTML
  let chipsHtml = '';
  let qrInits   = [];
  Object.entries(layout).forEach(([k, p]) => {
    const bk = k.replace(/_\d+$/, '');
    const fs = p.fs || 8, fsLbl = Math.max(fs-2, 5);
    const pStyle = `position:absolute;left:${p.x}%;top:${p.y}%;`
      + `font-family:'${font}',Arial,sans-serif;line-height:1.4;box-sizing:border-box;overflow:hidden;`
      + (p.w ? `width:${p.w}%;` : '')
      + (p.h ? `height:${p.h}%;` : '')
      + (p.bgColor&&p.bgColor!=='rgba(235,245,255,.93)' ? `background:${p.bgColor};` : '')
      + (p.borderOn ? `border:${p.borderOn?'2':'1.5'}px solid ${p.borderColor||'#3b5bdb'};border-radius:2px;padding:2px 4px;` : '')
      + (p.align  ? `text-align:${p.align};` : '')
      + (p.bold   ? 'font-weight:900;' : 'font-weight:700;')
      + (p.italic ? 'font-style:italic;'     : '')
      + (p.underline ? 'text-decoration:underline;' : '')
      + (p.color  ? `color:${p.color};` : 'color:#000;')
      + (p.line   ? 'border-bottom:2px solid #f59e0b;' : '');

    let inner = '';
    if (k === '_qr') {
      const sz = Math.round(fs*2);
      inner = `<div id="pqr_qr" style="display:inline-block;width:${sz}px;height:${sz}px"></div>`;
      if (cfg.qrTracking !== false) qrInits.push(`makeQR('pqr_qr','${qrUrl}',${sz})`);
    } else if (k === '_ph1') {
      if (ph1op) inner += `<span style="font-size:${fs}px;display:block">${safeHtml(ph1op)}</span>`;
      if (ph1drv && ph1drv !== ph1op) inner += `<span style="font-size:${fsLbl+1}px;color:#92400e;display:block">[${ingLang}] ${safeHtml(ph1drv)}</span>`;
    } else if (k === '_ph2') {
      inner = `<span style="font-size:${fs}px;display:block">${safeHtml(phrase2)}</span>`;
    } else if (k === '_ph3') {
      if (ph3.nombre) inner += `<span style="font-size:${fs}px;font-weight:700;display:block">${safeHtml(ph3.nombre)}</span>`;
      if (ph3.url) {
        const qsz = Math.round(fs*4);
        inner += `<div id="pqr_ph3" style="display:inline-block;margin-top:2px;width:${qsz}px;height:${qsz}px"></div>`;
        qrInits.push(`makeQR('pqr_ph3','${safeHtml(ph3.url)}',${qsz})`);
      }
    } else {
      const val = VAL[bk] || '', lbl = FIELD_LABELS[bk] || bk;
      if (lm===2) {
        inner = `<span style="font-size:${fs}px">${safeHtml(val)}</span>`;
      } else if (lm===1||p.line) {
        inner = `<span style="font-size:${fsLbl}px;color:#888;text-transform:uppercase;letter-spacing:.4px">${lbl} </span><span style="display:inline-block;width:60px;border-bottom:1px solid #000;vertical-align:bottom">&nbsp;</span>`;
      } else {
        inner = `<span style="font-size:${fsLbl}px;color:#888;text-transform:uppercase;letter-spacing:.4px">${lbl}: </span><span style="font-size:${fs}px;font-weight:700">${safeHtml(val)}</span>`;
      }
    }
    chipsHtml += `<div style="${pStyle}">${inner}</div>`;
  });

  const cutHtml = isTrq ? '<div style="position:absolute;top:50%;left:0;right:0;height:2px;background:#000;z-index:6"></div>' : '';
  // BG image — only visible in preview, @media print hides it
  const bgHtml  = cfg.bgImage
    ? `<img src="${cfg.bgImage}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;opacity:${cfg.bgOpacity||.35}" class="beu-no-print">`
    : '';

  const qrScript = qrInits.length ? `
(function(){
  function makeQR(id,url,sz){var el=document.getElementById(id);if(!el||!url)return;try{new QRCode(el,{text:url,width:sz,height:sz,correctLevel:QRCode.CorrectLevel.M});}catch(e){}}
  function gen(){${qrInits.join(';')}}
  if(typeof QRCode!=='undefined'){gen();}else{var s=document.createElement('script');s.src='${QR_CDN}';s.onload=gen;document.head.appendChild(s);}
  setTimeout(function(){window.print();},900);
})();` : 'setTimeout(function(){window.print();},400);';

  return `<!DOCTYPE html><html lang="${ingLang}"><head><meta charset="UTF-8">
<title>${safeHtml(ing.matricula||'Pase')}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:${pW} ${pH};margin:0}
body{font-family:'${font}',Arial,sans-serif;background:#f0f0f0;display:flex;align-items:flex-start;justify-content:center;padding:16px;gap:12px;flex-direction:column}
.page{position:relative;width:${pW};height:${pH};background:#fff;overflow:hidden;border:1px solid #ccc;box-shadow:0 4px 16px rgba(0,0,0,.1)}
.beu-no-print{pointer-events:none}
@media print{body{background:#fff;padding:0}.no-print{display:none!important}.beu-no-print{display:none!important}.page{box-shadow:none;border:none}}
</style></head><body>
<div class="page">${bgHtml}${cutHtml}${chipsHtml}</div>
<div class="no-print" style="display:flex;gap:8px;align-items:center">
  <button onclick="window.print()" style="background:#111;color:#fff;border:none;border-radius:20px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer">🖨 Imprimir ${cfg.paperSize||'A4'}</button>
  <button onclick="window.close()" style="background:#eee;color:#333;border:1.5px solid #ccc;border-radius:20px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer">✕ Cerrar</button>
  <span style="font-size:11px;color:#666">${_printDataMode==='last'?'Datos: último ingreso real':'Datos: demo'}</span>
</div>
<script>
document.addEventListener('keydown',function(e){if(e.key==='Escape')window.close();});
${qrScript}
<\/script></body></html>`;
}

function _formatHorario(entrada) {
  if (!entrada) return '';
  try { return new Date(entrada.replace(' ','T')).toLocaleString(undefined,{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  catch { return entrada; }
}

// ── Get ingreso data ──────────────────────────────────────────────
function _getIngData() {
  if (_printDataMode === 'last') {
    // Try to get last real entry from AppState / localDB cache
    const lastEntry = AppState.get('lastPrintEntry');
    if (lastEntry) return lastEntry;
  }
  // Demo data
  return {
    id:'DEMO001AB',matricula:'AB1234CD',remolque:'TR5678X',
    nombre:'Jean',apellido:'Dupont',empresa:'ACME France SRL',
    hall:'5',stand:'B-200',puertaHall:'P3',llamador:'12345',referencia:'REF-001234',
    montador:'MontajeXL',expositor:'ExpoDemo SRL',
    telefono:'600123456',telPais:'+33',email:'jean.dupont@acme.fr',
    pasaporte:'23AB456789',pais:'Francia',lang:'fr',fechaNacimiento:'15/03/1985',
    tipoVehiculo:'semiremolque',descargaTipo:'mano',tipoCarga:'GOODS',
    entrada:new Date().toISOString().replace('T',' ').slice(0,16),
    eventoNombre:AppState.get('currentEvent')?.name||'ALIMENTARIA 2026',
    comentario:'Vista previa',pase:'Hall 5',
    gpsUrl:'https://maps.google.com/?q=Av.+Reina+Maria+Cristina+s/n+Barcelona',
  };
}

// ── Preview / Print ───────────────────────────────────────────────
async function _doPreview() {
  const cfg = await _loadCfg(_ck);
  cfg.fieldLayout = { ..._placed };
  if (!Object.keys(_placed).length) { toast('Canvas vacío — arrastra campos primero','var(--amber)'); return; }
  const ing  = _getIngData();
  const html = _buildPrintHtml(cfg, ing);
  if (!html) return;
  for (let i=0; i<_nCopias; i++) {
    const w = window.open('','_blank','width=880,height=1100,scrollbars=yes');
    if (w) { w.document.write(html); w.document.close(); }
    else { toast('Activa ventanas emergentes','var(--amber)'); break; }
  }
  if (_printDataMode==='last') {
    const last = _getIngData();
    toast(`👁 Preview con ${last.matricula||'último ingreso'}`, 'var(--blue)');
  }
}

async function _openPrintDialog() {
  _selPrintTpls = new Set(['__active__']);
  const tpls = await _loadTpls();
  const el   = document.getElementById('impPrintTplList');
  let html = `<div style="font-size:10px;color:var(--text3);margin-bottom:4px">Tilda los formatos a imprimir. Cada uno abre en su ventana.</div>`;
  html += `<div class="imp-bentry" id="impPtpl_active" style="cursor:pointer;border:2px solid var(--blue);background:rgba(26,86,219,.07)" onclick="window._imp.togglePrintTpl('__active__',this)">
    <input type="checkbox" checked style="flex-shrink:0">
    <div><div style="font-size:11px;font-weight:700">Canvas activo (${_ck})</div>
    <div style="font-size:10px;color:var(--text3)">${(_cfgCache[_ck]?.paperSize||'A4')} · ${(_cfgCache[_ck]?.mode||'normal')}</div></div>
  </div>`;
  tpls.forEach((t,i) => {
    html += `<div class="imp-bentry" id="impPtpl_${i}" style="cursor:pointer" onclick="window._imp.togglePrintTpl('${i}',this)">
      <input type="checkbox" id="impPtplChk_${i}" style="flex-shrink:0">
      <div><div style="font-size:11px;font-weight:700">${safeHtml(t.name)}</div>
      <div style="font-size:10px;color:var(--text3)">${t.paperSize||'A4'} · ${t.mode||'normal'} · ${{ing1:'Ref',ing2:'Ing',ag:'Ag'}[t.cfgKey]||'—'}</div></div>
    </div>`;
  });
  el.innerHTML = html;
  document.getElementById('impPrintModal').style.display = 'flex';
}
function _togglePrintTpl(id, el) {
  const chk = el.querySelector('input[type=checkbox]');
  if (_selPrintTpls.has(id)) {
    _selPrintTpls.delete(id); if(chk)chk.checked=false; el.style.border='.5px solid var(--border)'; el.style.background='';
  } else {
    _selPrintTpls.add(id); if(chk)chk.checked=true; el.style.border='2px solid var(--blue)'; el.style.background='rgba(26,86,219,.07)';
  }
}
function _setPrintData(mode) {
  _printDataMode = mode;
  document.getElementById('impPrintDataLbl').textContent = mode==='last'
    ? 'Último ingreso real' : 'Demo';
  document.getElementById('impPdDemo').className = 'btn btn-xs ' + (mode==='demo'?'btn-p':'btn-gh');
  document.getElementById('impPdLast').className = 'btn btn-xs ' + (mode==='last'?'btn-p':'btn-gh');
}
async function _execPrint() {
  _closeModal('impPrintModal');
  const ing  = _getIngData();
  const tpls = await _loadTpls();
  for (const id of _selPrintTpls) {
    let cfg;
    if (id === '__active__') {
      cfg = { ...(await _loadCfg(_ck)), fieldLayout:{..._placed} };
    } else {
      const tpl = tpls[parseInt(id)]; if(!tpl) continue;
      cfg = Object.assign(_defCfg(), tpl);
    }
    const html = _buildPrintHtml(cfg, ing);
    if (!html) continue;
    for (let i=0; i<_nCopias; i++) {
      const w = window.open('','_blank','width=880,height=1100');
      if (w) { w.document.write(html); w.document.close(); }
    }
  }
}

// ── Batch printing ────────────────────────────────────────────────
function _openBatch() {
  _batchEntries = []; _renderBatchList();
  document.getElementById('impBatchModal').style.display = 'flex';
}
function _addBatchEntry() {
  const mat = (document.getElementById('impBatchMat')?.value||'').trim();
  const nom = (document.getElementById('impBatchNom')?.value||'').trim();
  if (!mat) { toast('Introduce matrícula','var(--amber)'); return; }
  _batchEntries.push({
    id:'BATCH'+Date.now(), matricula:mat, nombre:nom, apellido:'',
    empresa:'', hall:'', stand:'', lang:'es', telefono:'', telPais:'',
    remolque:'', referencia:'', eventoNombre:'',
    entrada: new Date().toISOString().replace('T',' ').slice(0,16),
  });
  document.getElementById('impBatchMat').value = '';
  document.getElementById('impBatchNom').value = '';
  _renderBatchList();
}
function _renderBatchList() {
  const el = document.getElementById('impBatchEntries'); if(!el)return;
  if (!_batchEntries.length) {
    el.innerHTML='<div style="font-size:10px;color:var(--text3);text-align:center;padding:8px">Sin entradas. Añade matrículas arriba.</div>';
  } else {
    el.innerHTML = _batchEntries.map((e,i) =>
      `<div class="imp-bentry">
        <div style="flex:1;font-size:11px"><b>${safeHtml(e.matricula)}</b> ${safeHtml(e.nombre)}</div>
        <button onclick="window._imp._removeBatchEntry(${i})" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:12px;padding:0 4px">✕</button>
      </div>`
    ).join('');
  }
  const cnt = document.getElementById('impBatchCount');
  if (cnt) cnt.textContent = _batchEntries.length + ' entradas';
}
function _removeBatchEntry(i) { _batchEntries.splice(i,1); _renderBatchList(); }
async function _execBatch() {
  _closeModal('impBatchModal');
  if (!_batchEntries.length) { toast('Sin entradas','var(--amber)'); return; }
  const cfg = { ...(await _loadCfg(_ck)), fieldLayout:{..._placed} };
  if (!Object.keys(_placed).length) { toast('Canvas vacío','var(--amber)'); return; }
  let done = 0;
  _batchEntries.forEach((ing, i) => {
    setTimeout(() => {
      const html = _buildPrintHtml(cfg, ing);
      if (!html) return;
      const w = window.open('','_blank','width=880,height=1100');
      if (w) { w.document.write(html); w.document.close(); }
      done++;
      if (done === _batchEntries.length) toast(`✅ ${done} pases enviados a impresión`, 'var(--green)');
    }, i * 400);
  });
}

// ── Export / Import JSON ──────────────────────────────────────────
async function _exportCanvas() {
  const cfg = await _loadCfg(_ck);
  cfg.fieldLayout = { ..._placed };
  const data = {
    name: `BeUnifyT_${_ck}_${new Date().toISOString().slice(0,10)}`,
    cfgKey: _ck, exportedAt: new Date().toISOString(),
    cfg: JSON.parse(JSON.stringify(cfg)),
    labelMode: _labelMode[_ck] || 0,
    version: 7,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href=url; a.download=data.name+'.json'; a.click();
  URL.revokeObjectURL(url);
  toast('📦 Exportado: '+data.name+'.json','var(--green)');
}
async function _importCanvas(inp) {
  const f = inp.files[0]; if(!f)return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.cfg) { toast('Archivo no válido','var(--red)'); return; }
      _pushHistory();
      const targetKey = data.cfgKey || _ck;
      Object.assign(_cfgCache[targetKey] || _defCfg(), data.cfg);
      _cfgCache[targetKey] = data.cfg;
      if (data.labelMode !== undefined) _labelMode[targetKey] = data.labelMode;
      await _saveCfg(targetKey, _cfgCache[targetKey]);
      if (targetKey !== _ck) { _ck = targetKey; }
      document.querySelectorAll('.imp-pfc').forEach(el => el.remove());
      _placed = {};
      _updatePaperBtns(); _updateModeBtn(); _updateQRToggle();
      await _updateFrases();
      _applyScale();
      await _loadStateFromCfg();
      _renderPalette();
      await _renderTplList();
      toast('📥 Importado: '+(data.name||'plantilla'),'var(--blue)');
    } catch (err) { toast('Error al importar: '+err.message,'var(--red)'); }
  };
  r.readAsText(f); inp.value='';
}

// ── Templates ─────────────────────────────────────────────────────
async function _preSaveTpl() {
  const name = (document.getElementById('impTplName')?.value||'').trim();
  if (!name) { toast('Escribe un nombre','var(--amber)'); return; }
  const panel = document.getElementById('impTplConfirm'); if(panel)panel.style.display='block';
  const fmts = {ing1:'🔖 Ref',ing2:'🚛 Ing',ag:'📅 Ag'};
  document.getElementById('impTplFmt').textContent = fmts[_ck]||_ck;
  document.getElementById('impTplSz').textContent  = '📄 '+(_cfgCache[_ck]?.paperSize||'A4');
  document.getElementById('impTplNm').textContent  = name;
}
async function _confirmSaveTpl() {
  const name = (document.getElementById('impTplName')?.value||'').trim(); if(!name)return;
  const cfg  = await _loadCfg(_ck);
  cfg.fieldLayout = { ..._placed };
  const tpl = {
    name, cfgKey:_ck, paperSize:cfg.paperSize||'A4', font:cfg.font||'Arial',
    fieldLayout: JSON.parse(JSON.stringify(_placed)),
    mode: cfg.mode||'normal', phrases: {...(cfg.phrases||{})},
    phrase1Langs: {...(cfg.phrase1Langs||{})}, phrase2:cfg.phrase2||'',
    puerta3: {...(cfg.puerta3||{})}, qrTracking:cfg.qrTracking||false,
    ph1On:cfg.ph1On||false, ph2On:cfg.ph2On!==false, ph3On:cfg.ph3On||false,
    bgOpacity:cfg.bgOpacity||.35, labelMode:_labelMode[_ck]||0,
    savedAt:new Date().toISOString(),
  };
  await _saveTpl(tpl);
  const panel=document.getElementById('impTplConfirm'); if(panel)panel.style.display='none';
  toast(`💾 Plantilla "${name}" guardada`,'var(--green)');
  await _renderTplList();
}
async function _loadTpl(name) {
  const tpls = await _loadTpls();
  const tpl  = tpls.find(t => t.name===name); if(!tpl)return;
  _pushHistory();
  const targetKey = tpl.cfgKey || _ck;
  _cfgCache[targetKey] = Object.assign(_defCfg(), tpl);
  await _saveCfg(targetKey, _cfgCache[targetKey]);
  _labelMode[targetKey] = tpl.labelMode || 0;
  if (targetKey !== _ck) { _ck = targetKey; _updateSubTabBtns(); }
  document.querySelectorAll('.imp-pfc').forEach(el=>el.remove()); _placed={};
  _updatePaperBtns(); _updateModeBtn(); _updateQRToggle();
  await _updateFrases(); _applyScale();
  await _loadStateFromCfg(); _renderPalette();
  toast(`📋 Plantilla "${name}" cargada`,'var(--blue)');
}
function _editTpl(name) {
  _loadTpl(name).then(() => {
    setTimeout(() => {
      const inp=document.getElementById('impTplName'); if(inp){inp.value=name;inp.focus();inp.select();}
    }, 200);
  });
}
async function _delTpl(name) {
  if (!confirm(`¿Eliminar plantilla "${name}"?`)) return;
  await _deleteTpl(name);
  toast('🗑 Plantilla eliminada','var(--red)');
  await _renderTplList();
}
async function _renderTplList() {
  const el = document.getElementById('impTplList'); if(!el)return;
  const tpls = await _loadTpls();
  if (!tpls.length) { el.innerHTML=''; return; }
  el.innerHTML = `<div style="font-size:9px;font-weight:700;text-transform:uppercase;color:var(--text3);margin:4px 0 3px">Plantillas guardadas</div>`
    + tpls.map(t => {
      var fl = t.fieldLayout || {};
      var fc = Object.keys(fl).length;
      var ml = Object.entries(fl).slice(0,5).map(function(e){ var p=e[1]; return '<div style="position:absolute;left:'+Math.round((p.x||0)*0.4)+'px;top:'+Math.round((p.y||0)*0.4)+'px;width:'+Math.min(18,(p.w||15)*0.4)+'px;height:2px;background:#94a3b8;border-radius:1px"></div>'; }).join('');
      return `<div style="padding:5px;border-radius:6px;background:var(--bg3);border:.5px solid var(--border);margin-bottom:3px;display:flex;align-items:center;gap:6px">
        <div style="width:36px;height:48px;background:#fff;border:1px solid var(--border);border-radius:3px;flex-shrink:0;position:relative;overflow:hidden">${ml}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="window._imp.loadTpl('${safeHtml(t.name)}')">📋 ${safeHtml(t.name)}</div>
          <div style="font-size:8px;color:var(--text3)">${t.paperSize||'A4'} · ${t.mode==='troquel'?'✂':'📄'} · ${{ing1:'Ref',ing2:'Ing',ag:'Ag',emb:'Emb'}[t.cfgKey]||'—'} · ${fc} campos</div>
          <div style="font-size:7px;color:var(--text3)">${t.savedAt?new Date(t.savedAt).toLocaleDateString():''}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0">
          <button onclick="window._imp.editTpl('${safeHtml(t.name)}')" class="btn btn-xs btn-gh" style="padding:1px 5px;font-size:9px" title="Editar">✏️</button>
          <button onclick="window._imp.loadTpl('${safeHtml(t.name)}')" class="btn btn-xs btn-gh" style="padding:1px 5px;font-size:9px" title="Cargar">📋</button>
          <button onclick="window._imp.delTpl('${safeHtml(t.name)}')" class="btn btn-xs btn-gh" style="padding:1px 5px;font-size:9px;color:var(--red)" title="Eliminar">✕</button>
        </div>
      </div>`;
    }).join('');
}

function _updateSubTabBtns() {
  ['ing1','ing2','ag','emb'].forEach(k => {
    const b=document.getElementById({ing1:'impTabIng1',ing2:'impTabIng2',ag:'impTabAg',emb:'impTabEmb'}[k]);
    if(b) b.className='btn btn-xs '+(k===_ck?'btn-p':'btn-gh');
  });
}

// ── Reset ─────────────────────────────────────────────────────────
async function _resetDia0() {
  if (!confirm('⚠️ Borrará el canvas, frases, imagen y plantillas guardadas. ¿Continuar?')) return;
  for (const k of ['ing1','ing2','ag','emb']) {
    _cfgCache[k] = _defCfg();
    await _saveCfg(k, _cfgCache[k]);
    try { await localDB.del('cache',`printCfg_${k}`); } catch(e) {}
    _labelMode[k] = 0; _hist[k]=[]; _histIdx[k]=-1;
  }
  _tplsCache = [];
  try { localStorage.removeItem('beu_printTpls'); } catch(e) {}
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    try {
      const db=getDB();
      const { collection, getDocs, deleteDoc, doc } = await import(`${FB}/firebase-firestore.js`);
      const snap = await getDocs(collection(db,'events',ev.id,'printTemplates'));
      await Promise.all(snap.docs.map(d=>deleteDoc(doc(db,'events',ev.id,'printTemplates',d.id))));
    } catch(e) {}
  }
  document.querySelectorAll('.imp-pfc').forEach(e=>e.remove()); _placed={}; _selKey=null;
  _updatePaperBtns(); _updateModeBtn(); _updateQRToggle(); await _updateFrases();
  _applyScale(); _renderPalette(); await _renderTplList(); _updateLblBtn();
  toast('🔄 Todo reseteado a día 0','#7c3aed');
}

// ── Modal ─────────────────────────────────────────────────────────
function _closeModal(id) {
  const el=document.getElementById(id); if(el)el.style.display='none';
}

// ── Extend global after all functions defined ─────────────────────
function _finalizeGlobal() {
  Object.assign(window._imp, {
    _togglePh,_savePh1Lang,_savePh2,_savePh3,
    _setCopias,_removeBatchEntry,
    setPaper: _setPaper,
    setTheme: _setTheme,
  });
}

// ── Main export ──────────────────────────────────────────────────
async function _initImpresionInner(containerId) {
  const el = document.getElementById(containerId);
  if(!el){
    console.error('[impresion] Container not found:', containerId);
    var tc = document.getElementById('tabContent');
    if(tc) tc.innerHTML='<div style="padding:20px;color:red">Error: contenedor "'+containerId+'" no encontrado</div>';
    return;
  }
  try {
    _currentTheme = _loadThemePref();
    await Promise.all([_loadCfg('ing1'),_loadCfg('ing2'),_loadCfg('ag'),_loadCfg('emb')]);
    await _loadTpls();
    _renderShell(el);
    _bindGlobalEvents();
    _finalizeGlobal();
    await _switchSub(_ck, true);
  } catch(err) {
    console.error('[impresion] Init error:', err);
    el.innerHTML='<div style="padding:20px;color:red;font-size:13px"><b>Error en impresion:</b><br>'+err.message+'<br><pre style="font-size:10px;margin-top:8px;white-space:pre-wrap">'+err.stack+'</pre></div>';
  }
}

export async function initImpresion(containerId) {
  console.log('[impresion] initImpresion called with:', containerId);
  return _initImpresionInner(containerId);
}

// ── Re-export for external callers ────────────────────────────────
export function setLastPrintEntry(entry) {
  // Called from operator.js after an entry is registered
  // Stores the last real entry for "último ingreso" preview mode
  try { AppState.set('lastPrintEntry', entry); } catch(e) {}
}

export async function printEntry(entry, eventName, cfgOverride) {
  // Called directly from other modules (e.g., operator.js print button per row)
  entry.eventoNombre = entry.eventoNombre || eventName || '';
  const cfg = cfgOverride || (await _loadCfg(entry._cfgKey || 'ing1'));
  cfg.fieldLayout = cfg.fieldLayout || _placed;
  const html = _buildPrintHtml(cfg, entry);
  if (!html) { toast('Sin plantilla configurada','var(--amber)'); return; }
  const w = window.open('','_blank','width=880,height=1100,scrollbars=yes');
  if (w) { w.document.write(html); w.document.close(); }
  else toast('Activa ventanas emergentes','var(--amber)');
}

// ── AUTO-INIT: si operator.js no llama initImpresion, nos inicializamos solos ──
setTimeout(function() {
  if (document.getElementById('impThemePicker')) return; // ya inicializado
  var tc = document.getElementById('tabContent');
  if (!tc) return;
  var txt = tc.textContent || '';
  if (txt.toLowerCase().indexOf('impresion') >= 0 || txt.toLowerCase().indexOf('cargado') >= 0) {
    console.log('[impresion] Auto-init detectado');
    tc.innerHTML = '<div id="impresionContainer" style="height:100%;display:flex;flex-direction:column"></div>';
    initImpresion('impresionContainer');
  }
}, 200);
