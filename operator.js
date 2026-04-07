// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js — Shell sidebar
// Icono único (click=posición, dblclick=collapse)
// Logo hexagonal original, marca con colores fijos
// Tabs scrollables en sidebar
// ⚠ ERROR GRAVE PENDIENTE: ids ingresos/ingresos2 cruzados
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree, LANGS_UI, getFlag } from './langs.js';
import { toast, safeHtml } from './utils.js';

let _container=null,_usuario=null,_activeTab=null,_currentModuleCleanup=null;
let _sbPos='left',_sbCollapsed=false,_sbPm=null;
try{_sbPos=localStorage.getItem('beu_sbpos')||'left';}catch(e){}
try{_sbCollapsed=localStorage.getItem('beu_sbcol')==='1';}catch(e){}

const TAB_MODULES={
  dash:()=>import('./dashboard.js'),ingresos:()=>import('./ingresos.js'),ingresos2:()=>import('./ingresos2.js'),
  flota:()=>import('./flota.js'),conductores:()=>import('./conductores.js'),agenda:()=>import('./agenda.js'),
  analytics:()=>import('./analytics.js'),vehiculos:()=>import('./vehiculos.js'),auditoria:()=>import('./auditoria.js'),
  recintos:()=>import('./recintos.js'),usuarios:()=>import('./usuarios.js'),eventos:()=>import('./eventos.js'),
  papelera:()=>import('./papelera.js'),mensajes:()=>import('./mensajes.js'),impresion:()=>import('./impresion.js'),
  empresas:()=>import('./empresas.js'),migracion:()=>import('./migracion.js'),
};
const TAB_ICONS={dash:'📊',ingresos:'🔖',ingresos2:'🚛',flota:'📦',conductores:'👤',agenda:'📅',analytics:'📈',vehiculos:'📜',auditoria:'📂',recintos:'🏟',usuarios:'👥',eventos:'📅',papelera:'🗑',mensajes:'💬',impresion:'🖨',empresas:'🏢',migracion:'💾'};

const LOGO_SVG=`<svg viewBox="0 0 140 140" width="32" height="32"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>`;
const BRAND=`<span style="font-family:'Oxanium',system-ui,monospace;font-size:15px;font-weight:700;letter-spacing:-.3px"><span style="color:#00ffc8">Be</span><span style="color:#e2e8f0">Unify</span><span style="color:#00ffc8">T</span></span>`;

export function renderShell(container,usuario){_container=container;_usuario=usuario;_activeTab=null;paintShell();}
function _saveSb(){try{localStorage.setItem('beu_sbpos',_sbPos);localStorage.setItem('beu_sbcol',_sbCollapsed?'1':'0');}catch(e){}}

function paintShell(){
  const u=_usuario,lang=u.idioma||AppState.get('currentLang'),isDark=u.tema==='dark';
  const bg=isDark?'#0f172a':'#f5f7fa',cardBg=isDark?'#1e293b':'#fff',border=isDark?'#334155':'#e2e8f0';
  const textMuted=isDark?'#94a3b8':'#64748b',accent='#3b82f6',accentBg=isDark?'rgba(59,130,246,.12)':'#eff6ff';
  document.body.style.background=bg;document.body.style.color=isDark?'#e2e8f0':'#1a1a1a';

  const isV=_sbPos==='top'||_sbPos==='bottom',dir=isV?'column':'row';
  const sbW=_sbCollapsed&&!isV?52:220;

  // ── SIDEBAR ──
  const sbStyle=isV
    ?`width:100%;height:auto;max-height:52px;flex-direction:row;overflow-x:auto;overflow-y:hidden;border-${_sbPos==='top'?'bottom':'top'}:1px solid ${border};scrollbar-width:none;`
    :`width:${sbW}px;height:100%;flex-direction:column;overflow-y:auto;overflow-x:hidden;border-${_sbPos==='left'?'right':'left'}:1px solid ${border};scrollbar-width:none;`;

  const logoSection=isV
    ?`<div style="display:flex;align-items:center;gap:6px;padding:8px 10px;flex-shrink:0;background:#030812;border-radius:8px;margin:4px" id="beu-sb-ico">${LOGO_SVG}${!_sbCollapsed?BRAND:''}</div>`
    :(_sbCollapsed
      ?`<div style="padding:10px 0;display:flex;justify-content:center;cursor:pointer" id="beu-sb-ico">${LOGO_SVG}</div>`
      :`<div style="padding:14px 12px 10px;display:flex;align-items:center;gap:8px;cursor:pointer;background:#030812;border-radius:10px;margin:8px 8px 4px" id="beu-sb-ico">${LOGO_SVG}${BRAND}</div>`);

  const tabsHTML=u.tabs.map(tab=>{
    const label=tr('tabs',tab);if(label===null)return'';
    const ico=TAB_ICONS[tab]||'📄';
    if(isV)return`<button class="beu-si" data-tab="${tab}" style="display:flex;align-items:center;gap:5px;padding:6px 10px;border:none;background:none;cursor:pointer;font-size:11px;font-weight:500;color:${textMuted};border-radius:8px;white-space:nowrap;flex-shrink:0">${ico} ${label}</button>`;
    if(_sbCollapsed)return`<button class="beu-si" data-tab="${tab}" title="${label}" style="display:flex;align-items:center;justify-content:center;padding:9px 0;border:none;background:none;cursor:pointer;font-size:15px;margin:1px 4px;border-radius:8px;width:44px">${ico}</button>`;
    return`<button class="beu-si" data-tab="${tab}" style="display:flex;align-items:center;gap:8px;padding:7px 12px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:${textMuted};margin:1px 6px;border-radius:8px;width:calc(100% - 12px);text-align:left">${ico}<span>${label}</span></button>`;
  }).join('');

  const footerHTML=isV
    ?`<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;flex-shrink:0;margin-left:auto">
        <button id="beu-theme" style="background:none;border:none;cursor:pointer;font-size:14px;padding:4px">${isDark?'☀️':'🌙'}</button>
        <button id="beu-lang" style="background:none;border:none;cursor:pointer;font-size:14px;padding:4px">${getFlag(lang)}</button>
        <span style="font-size:11px;color:${textMuted}">${safeHtml(u.nombre)}</span>
        <button id="beu-logout" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:10px;font-weight:700">✕</button>
      </div>`
    :(_sbCollapsed
      ?`<div style="border-top:1px solid ${border};padding:8px 0;display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0">
          <button id="beu-theme" style="background:none;border:none;cursor:pointer;font-size:14px;padding:4px">${isDark?'☀️':'🌙'}</button>
          <button id="beu-lang" style="background:none;border:none;cursor:pointer;font-size:14px;padding:4px">${getFlag(lang)}</button>
          <button id="beu-logout" style="background:#ef4444;color:#fff;border:none;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;font-weight:700" title="Cerrar sesión">✕</button>
        </div>`
      :`<div style="border-top:1px solid ${border};padding:10px 12px;flex-shrink:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,${accent},#7c3aed);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${(u.nombre||'U')[0]}</div>
            <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;color:${isDark?'#e2e8f0':'#1a1a1a'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(u.nombre)}</div></div>
          </div>
          <div style="display:flex;gap:4px">
            <button id="beu-theme" style="flex:1;background:${isDark?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:12px">${isDark?'☀️':'🌙'}</button>
            <button id="beu-lang" style="flex:1;background:${isDark?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:12px">${getFlag(lang)}</button>
            <button id="beu-logout" style="flex:1;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:10px;font-weight:700">Salir</button>
          </div>
        </div>`);

  const sbHTML=`<nav id="beu-sb" style="${sbStyle}background:${cardBg};flex-shrink:0;display:flex;transition:width .22s;position:relative;">
    ${logoSection}
    <div style="${isV?'display:flex;gap:2px;flex:1;overflow-x:auto;align-items:center;padding:0 4px;scrollbar-width:none':'flex:1;overflow-y:auto;padding:2px 0;scrollbar-width:none'}">
      ${tabsHTML}
    </div>
    ${footerHTML}
  </nav>`;

  const contentHTML=`<main id="beu-content" style="flex:1;overflow-y:auto;padding:16px;position:relative;min-width:0"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:${textMuted};font-size:13px">${trFree('shell','loading')}</div></main>`;
  const sbFirst=_sbPos==='left'||_sbPos==='top';
  _container.innerHTML=`<style>#beu-sb::-webkit-scrollbar{display:none}#beu-sb div::-webkit-scrollbar{display:none}.beu-si:hover{background:${isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'}!important}</style>
  <div id="beu-shell" style="display:flex;flex-direction:${dir};height:100vh;font-family:system-ui,sans-serif">${sbFirst?sbHTML+contentHTML:contentHTML+sbHTML}</div>`;

  // ── EVENTS ──
  _container.querySelectorAll('.beu-si').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));

  // Single icon: click=pos menu, dblclick=collapse
  const ico=_container.querySelector('#beu-sb-ico');
  if(ico){let _ct=null;ico.style.cursor='pointer';
    ico.onclick=(e)=>{e.stopPropagation();if(_ct){clearTimeout(_ct);_ct=null;_sbCollapsed=!_sbCollapsed;_saveSb();paintShell();if(_activeTab)activateTab(_activeTab);return;}_ct=setTimeout(()=>{_ct=null;_showPosMenu(ico,cardBg,border,accent,accentBg,isDark);},250);};
  }

  // Resize
  if(!isV){const sb=_container.querySelector('#beu-sb');if(sb){let ir=false,rx,rw;
    sb.addEventListener('mousedown',e=>{const edge=_sbPos==='left'?sb.getBoundingClientRect().right:sb.getBoundingClientRect().left;if(Math.abs(e.clientX-edge)<6&&!_sbCollapsed){ir=true;rx=e.clientX;rw=sb.offsetWidth;document.body.style.userSelect='none';document.body.style.cursor='col-resize';e.preventDefault();}});
    document.addEventListener('mousemove',e=>{if(!ir)return;sb.style.width=Math.max(52,Math.min(400,rw+(_sbPos==='left'?1:-1)*(e.clientX-rx)))+'px';});
    document.addEventListener('mouseup',()=>{ir=false;document.body.style.userSelect='';document.body.style.cursor='';});
  }}

  _container.querySelector('#beu-logout').onclick=async()=>{const{logout}=await import('./app.js');logout();};
  _container.querySelector('#beu-theme').onclick=async()=>{const nt=_usuario.tema==='dark'?'light':'dark';_usuario.tema=nt;AppState.set('theme',nt);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{tema:nt});}catch(e){}updateSession();paintShell();if(_activeTab)activateTab(_activeTab);};
  _container.querySelector('#beu-lang').onclick=()=>showLangPicker();
  _highlightTab();
  if(u.tabs.length>0)activateTab(_activeTab||u.tabs[0]);
}

function _showPosMenu(ico,cardBg,border,accent,accentBg,isDark){
  if(_sbPm){_sbPm.remove();_sbPm=null;return;}
  _sbPm=document.createElement('div');
  _sbPm.style.cssText=`position:fixed;z-index:9999;background:${cardBg};border:1px solid ${border};border-radius:10px;padding:5px;box-shadow:0 6px 24px rgba(0,0,0,.15);min-width:150px`;
  const rect=ico.getBoundingClientRect();
  _sbPm.style.left=(rect.right+8)+'px';_sbPm.style.top=rect.top+'px';
  [{i:'⬅',l:'Izquierda',p:'left'},{i:'➡',l:'Derecha',p:'right'},{i:'⬆',l:'Arriba',p:'top'},{i:'⬇',l:'Abajo',p:'bottom'}].forEach(o=>{
    const b=document.createElement('button');
    b.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:${o.p===_sbPos?'700':'500'};cursor:pointer;color:${o.p===_sbPos?accent:'inherit'};border:none;background:${o.p===_sbPos?accentBg:'none'};width:100%;text-align:left;font-family:inherit`;
    b.innerHTML=`<span>${o.i}</span><span>${o.l}</span>`;
    b.onclick=()=>{_sbPm.remove();_sbPm=null;_sbPos=o.p;_saveSb();paintShell();if(_activeTab)activateTab(_activeTab);};
    _sbPm.appendChild(b);
  });
  const sep=document.createElement('div');sep.style.cssText=`height:1px;background:${border};margin:4px 0`;_sbPm.appendChild(sep);
  const cb=document.createElement('button');
  cb.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;color:inherit;border:none;background:none;width:100%;text-align:left;font-family:inherit`;
  cb.innerHTML=`<span>${_sbCollapsed?'◁':'▷'}</span><span>${_sbCollapsed?'Expandir':'Colapsar'}</span>`;
  cb.onclick=()=>{_sbPm.remove();_sbPm=null;_sbCollapsed=!_sbCollapsed;_saveSb();paintShell();if(_activeTab)activateTab(_activeTab);};
  _sbPm.appendChild(cb);
  document.body.appendChild(_sbPm);
  setTimeout(()=>{const h=()=>{if(_sbPm){_sbPm.remove();_sbPm=null;}document.removeEventListener('click',h);};document.addEventListener('click',h);},50);
}

function _highlightTab(){
  const isDark=_usuario.tema==='dark',accent='#3b82f6',accentBg=isDark?'rgba(59,130,246,.12)':'#eff6ff',textMuted=isDark?'#94a3b8':'#64748b';
  _container.querySelectorAll('.beu-si').forEach(b=>{const a=b.dataset.tab===_activeTab;b.style.background=a?accentBg:'transparent';b.style.color=a?accent:textMuted;b.style.fontWeight=a?'700':'500';});
}

async function activateTab(tabId){
  const content=_container.querySelector('#beu-content');
  if(_currentModuleCleanup){try{_currentModuleCleanup();}catch(e){}_currentModuleCleanup=null;}
  _activeTab=tabId;AppState.set('activeTab',tabId);_highlightTab();
  content.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8;font-size:13px">${trFree('shell','loading')}</div>`;
  const loader=TAB_MODULES[tabId];
  if(!loader){content.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${tabId}" no disponible</div>`;return;}
  try{const mod=await loader();content.innerHTML='';if(mod.render){const cleanup=mod.render(content,_usuario);if(typeof cleanup==='function')_currentModuleCleanup=cleanup;}else{content.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${tabId}" cargado</div>`;}}
  catch(e){console.error(`Error ${tabId}:`,e);content.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:14px;font-weight:700;color:#ef4444">Error en ${tabId}</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${safeHtml(e.message)}</div></div>`;}
}

function showLangPicker(){
  const existing=document.getElementById('beu-lang-modal');if(existing){existing.remove();return;}
  const isDark=_usuario.tema==='dark',currentLang=_usuario.idioma;
  const modal=document.createElement('div');modal.id='beu-lang-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9000;display:flex;align-items:center;justify-content:center';
  modal.innerHTML=`<div style="background:${isDark?'#1e293b':'#fff'};border-radius:14px;padding:20px;max-width:360px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.2)"><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${LANGS_UI.map(l=>`<div class="lang-pick" data-code="${l.code}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;border:1px solid ${l.code===currentLang?'#3b82f6':(isDark?'#475569':'#e2e8f0')};background:${l.code===currentLang?(isDark?'#1e3a5f':'#eff6ff'):'transparent'};color:inherit">${l.flag} ${l.name}</div>`).join('')}</div></div>`;
  modal.onclick=(e)=>{if(e.target===modal)modal.remove();};
  modal.querySelectorAll('.lang-pick').forEach(el=>{el.onclick=async()=>{const code=el.dataset.code;_usuario.idioma=code;AppState.set('currentLang',code);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{idioma:code});}catch(e){}updateSession();modal.remove();toast(trFree('shell','lang_ok'),'#10b981');paintShell();if(_activeTab)activateTab(_activeTab);};});
  document.body.appendChild(modal);
}

function updateSession(){const s=JSON.parse(localStorage.getItem('beu_session')||'{}');s.idioma=_usuario.idioma;s.tema=_usuario.tema;localStorage.setItem('beu_session',JSON.stringify(s));}
