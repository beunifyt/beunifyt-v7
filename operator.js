// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js — Shell con sidebar (icono único)
// Click icono = menú posición | Doble click = collapse/expand
// ⚠ ERROR GRAVE PENDIENTE: id 'ingresos' = Referencia, id 'ingresos2' = Ingresos
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

export function renderShell(container,usuario){_container=container;_usuario=usuario;_activeTab=null;paintShell();}
function _saveSb(){try{localStorage.setItem('beu_sbpos',_sbPos);localStorage.setItem('beu_sbcol',_sbCollapsed?'1':'0');}catch(e){}}

function paintShell(){
  const u=_usuario,lang=u.idioma||AppState.get('currentLang'),isDark=u.tema==='dark';
  const bg=isDark?'#0f172a':'#f5f7fa',cardBg=isDark?'#1e293b':'#fff',border=isDark?'#334155':'#e2e8f0';
  const textMuted=isDark?'#94a3b8':'#64748b',accent='#3b82f6',accentBg=isDark?'rgba(59,130,246,.12)':'#eff6ff';
  document.body.style.background=bg;document.body.style.color=isDark?'#e2e8f0':'#1a1a1a';

  const isV=_sbPos==='top'||_sbPos==='bottom',dir=isV?'column':'row';

  // Sidebar
  const sbStyle=isV
    ?`width:100%;height:auto;max-height:200px;flex-direction:row;overflow-x:auto;border-${_sbPos==='top'?'bottom':'top'}:1px solid ${border};`
    :`width:${_sbCollapsed?52:224}px;height:100%;flex-direction:column;overflow-y:auto;border-${_sbPos==='left'?'right':'left'}:1px solid ${border};`;

  const sbHTML=`<nav id="beu-sb" style="${sbStyle}background:${cardBg};flex-shrink:0;display:flex;transition:width .22s;position:relative;scrollbar-width:none;">
    <div style="padding:${isV?'8px 14px':_sbCollapsed?'12px 6px':'16px 14px 12px'};border-bottom:${isV?'none':`1px solid ${border}`};flex-shrink:0">
      <div style="display:flex;align-items:center;gap:8px;${_sbCollapsed&&!isV?'justify-content:center':''}">
        <div id="beu-sb-ico" style="width:36px;height:36px;border-radius:10px;background:linear-gradient(145deg,${accent},#1a3fa0);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;box-shadow:0 3px 10px rgba(59,130,246,.28);flex-shrink:0;cursor:pointer;transition:transform .15s;user-select:none" title="Click: posición · Doble click: colapsar">Be</div>
        ${!_sbCollapsed||isV?`<div><div style="font-size:14px;font-weight:700;letter-spacing:-.2px">BeUnifyT</div><div style="font-size:10px;color:${textMuted}">Sistema de Control v8</div></div>`:''}
      </div>
    </div>
    <div style="${isV?'display:flex;gap:2px;padding:4px 8px;flex:1;overflow-x:auto;align-items:center':'flex:1;overflow-y:auto;padding:4px 0;scrollbar-width:none'}">
      ${u.tabs.map(tab=>{const label=tr('tabs',tab);if(label===null)return'';const ico=TAB_ICONS[tab]||'📄';
        if(isV)return`<button class="beu-si" data-tab="${tab}" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:${textMuted};border-radius:8px;white-space:nowrap">${ico}<span>${label}</span></button>`;
        if(_sbCollapsed)return`<button class="beu-si" data-tab="${tab}" title="${label}" style="display:flex;align-items:center;justify-content:center;padding:10px 0;border:none;background:none;cursor:pointer;font-size:16px;margin:1px 4px;border-radius:8px;width:44px">${ico}</button>`;
        return`<button class="beu-si" data-tab="${tab}" style="display:flex;align-items:center;gap:9px;padding:8px 14px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:${textMuted};margin:1px 8px;border-radius:8px;width:calc(100% - 16px);text-align:left">${ico}<span>${label}</span></button>`;
      }).join('')}
    </div>
    <div style="${isV?'display:flex;align-items:center;gap:6px;padding:4px 12px;flex-shrink:0':`margin-top:auto;border-top:1px solid ${border};padding:10px 14px;flex-shrink:0`}">
      <div style="display:flex;align-items:center;gap:8px;${_sbCollapsed&&!isV?'justify-content:center':''}">
        <button id="beu-theme" style="background:none;border:1px solid ${border};border-radius:6px;padding:4px 8px;cursor:pointer;font-size:13px;color:inherit">${isDark?'☀️':'🌙'}</button>
        <button id="beu-lang" style="background:none;border:1px solid ${border};border-radius:6px;padding:4px 8px;cursor:pointer;font-size:13px;color:inherit">${getFlag(lang)}</button>
        ${!_sbCollapsed||isV?`<span style="font-size:11px;font-weight:600;color:${textMuted}">${safeHtml(u.nombre)}</span>`:''}
        <button id="beu-logout" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:700;margin-left:auto">${trFree('shell','logout')}</button>
      </div>
    </div>
  </nav>`;

  const contentHTML=`<main id="beu-content" style="flex:1;overflow-y:auto;padding:16px;position:relative;min-width:0"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:${textMuted};font-size:13px">${trFree('shell','loading')}</div></main>`;
  const sbFirst=_sbPos==='left'||_sbPos==='top';
  _container.innerHTML=`<div id="beu-shell" style="display:flex;flex-direction:${dir};height:100vh;font-family:system-ui,sans-serif">${sbFirst?sbHTML+contentHTML:contentHTML+sbHTML}</div>`;

  // ── EVENTS ──
  _container.querySelectorAll('.beu-si').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));

  // SINGLE ICON: click=position menu, dblclick=collapse
  const ico=_container.querySelector('#beu-sb-ico');
  if(ico){
    let _clickTimer=null;
    ico.onclick=(e)=>{
      e.stopPropagation();
      if(_clickTimer){clearTimeout(_clickTimer);_clickTimer=null;_sbCollapsed=!_sbCollapsed;_saveSb();paintShell();if(_activeTab)activateTab(_activeTab);return;}
      _clickTimer=setTimeout(()=>{_clickTimer=null;_showPosMenu(ico,cardBg,border,accent,accentBg);},250);
    };
  }

  // Resize (left/right)
  if(!isV){
    const sb=_container.querySelector('#beu-sb');
    if(sb){let isRes=false,rx0,rw0;
      sb.onmousedown=(e)=>{const edge=_sbPos==='left'?sb.getBoundingClientRect().right:sb.getBoundingClientRect().left;if(Math.abs(e.clientX-edge)<6&&!_sbCollapsed){isRes=true;rx0=e.clientX;rw0=sb.offsetWidth;document.body.style.userSelect='none';document.body.style.cursor='col-resize';e.preventDefault();}};
      document.addEventListener('mousemove',(e)=>{if(!isRes)return;sb.style.width=Math.max(52,Math.min(400,rw0+(_sbPos==='left'?1:-1)*(e.clientX-rx0)))+'px';});
      document.addEventListener('mouseup',()=>{isRes=false;document.body.style.userSelect='';document.body.style.cursor='';});
    }
  }

  _container.querySelector('#beu-logout').onclick=async()=>{const{logout}=await import('./app.js');logout();};
  _container.querySelector('#beu-theme').onclick=async()=>{const nt=_usuario.tema==='dark'?'light':'dark';_usuario.tema=nt;AppState.set('theme',nt);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{tema:nt});}catch(e){}updateSession();paintShell();if(_activeTab)activateTab(_activeTab);};
  _container.querySelector('#beu-lang').onclick=()=>showLangPicker();

  _highlightTab();
  if(u.tabs.length>0)activateTab(_activeTab||u.tabs[0]);
}

function _showPosMenu(ico,cardBg,border,accent,accentBg){
  if(_sbPm){_sbPm.remove();_sbPm=null;return;}
  _sbPm=document.createElement('div');
  _sbPm.style.cssText=`position:fixed;z-index:9999;background:${cardBg};border:1px solid ${border};border-radius:10px;padding:5px;box-shadow:0 6px 24px rgba(0,0,0,.12);min-width:150px`;
  const rect=ico.getBoundingClientRect();_sbPm.style.left=(rect.right+8)+'px';_sbPm.style.top=rect.top+'px';
  [{i:'⬅',l:'Izquierda',p:'left'},{i:'➡',l:'Derecha',p:'right'},{i:'⬆',l:'Arriba',p:'top'},{i:'⬇',l:'Abajo',p:'bottom'}].forEach(o=>{
    const b=document.createElement('button');
    b.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:${o.p===_sbPos?'700':'500'};cursor:pointer;color:${o.p===_sbPos?accent:'inherit'};border:none;background:${o.p===_sbPos?accentBg:'none'};width:100%;text-align:left;font-family:inherit`;
    b.innerHTML=`<span>${o.i}</span><span>${o.l}</span>`;
    b.onclick=()=>{_sbPm.remove();_sbPm=null;_sbPos=o.p;_saveSb();paintShell();if(_activeTab)activateTab(_activeTab);};
    _sbPm.appendChild(b);
  });
  // Collapse option
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
  catch(e){console.error(`Error loading ${tabId}:`,e);content.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:14px;font-weight:700;color:#ef4444">Error en ${tabId}</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${safeHtml(e.message)}</div></div>`;}
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
