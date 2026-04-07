// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js — Shell sidebar
// Tabs desplazables, botón colapsar visible, resize mouse
// Temas: dropdown con 18 temas + 3 favoritos
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { tr, trFree, LANGS_UI, getFlag } from './langs.js';
import { toast, safeHtml } from './utils.js';
import { THEMES, LIGHT_THEMES, DARK_THEMES, getFavorites, toggleFavorite, getCurrentTheme, setCurrentTheme, getThemeColors } from './themes.js';

let _container=null,_usuario=null,_activeTab=null,_cleanup=null;
let _sbPos='left',_sbCol=false,_sbPm=null;
try{_sbPos=localStorage.getItem('beu_sbpos')||'left';}catch(e){}
try{_sbCol=localStorage.getItem('beu_sbcol')==='1';}catch(e){}

const MODS={dash:()=>import('./dashboard.js'),ingresos:()=>import('./ingresos.js'),ingresos2:()=>import('./ingresos2.js'),flota:()=>import('./flota.js'),conductores:()=>import('./conductores.js'),agenda:()=>import('./agenda.js'),analytics:()=>import('./analytics.js'),vehiculos:()=>import('./vehiculos.js'),auditoria:()=>import('./auditoria.js'),recintos:()=>import('./recintos.js'),usuarios:()=>import('./usuarios.js'),eventos:()=>import('./eventos.js'),papelera:()=>import('./papelera.js'),mensajes:()=>import('./mensajes.js'),impresion:()=>import('./impresion.js'),empresas:()=>import('./empresas.js'),migracion:()=>import('./migracion.js')};
const LOGO=`<svg viewBox="0 0 140 140" width="30" height="30"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>`;
const BRAND=`<span style="font-family:'Oxanium',system-ui,monospace;font-size:14px;font-weight:700;letter-spacing:-.3px"><span style="color:#00ffc8">Be</span><span style="color:#e2e8f0">Unify</span><span style="color:#00ffc8">T</span></span>`;

export function renderShell(c,u){_container=c;_usuario=u;_activeTab=null;_paint();}
function _save(){try{localStorage.setItem('beu_sbpos',_sbPos);localStorage.setItem('beu_sbcol',_sbCol?'1':'0');}catch(e){}}
function _repaint(){_paint();if(_activeTab)_goTab(_activeTab);}

function T(){
  const tid=getCurrentTheme();
  const t=getThemeColors(tid);
  return{...t,isDark:t.group==='dark',sbText:t.sbText||t.text};
}

function _paint(){
  const u=_usuario,lang=u.idioma||AppState.get('currentLang'),t=T();
  document.body.style.background=t.bg;document.body.style.color=t.text;
  const isV=_sbPos==='top'||_sbPos==='bottom',w=_sbCol&&!isV?52:220;

  const logoHTML=_sbCol&&!isV
    ?`<div id="_sico" style="padding:8px 0;display:flex;justify-content:center;cursor:pointer;flex-shrink:0" title="Click: posición">${LOGO}</div>`
    :`<div id="_sico" style="padding:12px 12px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;background:#030812;border-radius:10px;margin:${isV?'4px':'6px 6px 2px'};flex-shrink:0" title="Click: posición">${LOGO}${BRAND}</div>`;

  const tabs=u.tabs.map(t=>{const l=tr('tabs',t);if(l===null)return'';
    if(isV)return`<button class="_si" data-t="${t}" style="display:flex;align-items:center;gap:5px;padding:6px 10px;border:none;background:none;cursor:pointer;font-size:11px;font-weight:500;color:${T().sbText||T().t3};border-radius:8px;white-space:nowrap;flex-shrink:0">${l}</button>`;
    if(_sbCol){const ic=l.slice(0,2);return`<button class="_si" data-t="${t}" title="${l}" style="display:flex;align-items:center;justify-content:center;padding:9px 0;border:none;background:none;cursor:pointer;font-size:15px;margin:1px 4px;border-radius:8px;width:44px">${ic}</button>`;}
    return`<button class="_si" data-t="${t}" style="display:flex;align-items:center;gap:8px;padding:7px 12px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:${T().sbText||T().t3};margin:1px 6px;border-radius:8px;width:calc(100% - 12px);text-align:left">${l}</button>`;
  }).join('');

  // Collapse button
  const colBtn=!isV?`<button id="_colBtn" style="position:absolute;${_sbPos==='left'?'right:-12px':'left:-12px'};top:50%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:${t.card};border:1px solid ${t.border};box-shadow:0 2px 8px rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;font-size:10px;color:${t.t3}">${_sbCol?(_sbPos==='left'?'▶':'◀'):(_sbPos==='left'?'◀':'▶')}</button>`:'';

  // Footer
  const favs=getFavorites();
  const favBtns=favs.map(fid=>{const ft=THEMES[fid];if(!ft)return'';return`<button class="_ftheme" data-tid="${fid}" style="width:20px;height:20px;border-radius:50%;border:2px solid ${fid===getCurrentTheme()?t.acc:'transparent'};background:${ft.bg};cursor:pointer;flex-shrink:0" title="${ft.name}"></button>`;}).join('');

  const foot=isV
    ?`<div style="display:flex;align-items:center;gap:5px;padding:4px 8px;flex-shrink:0;margin-left:auto">
        ${favBtns}
        <button id="_thd" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px" title="Temas">🎨</button>
        <button id="_lg" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${getFlag(lang)}</button>
        <span style="font-size:10px;color:${t.t3};max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(u.nombre)}</span>
        <button id="_lo" style="background:#ef4444;color:#fff;border:none;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:9px" title="Salir">✕</button>
      </div>`
    :(_sbCol
      ?`<div style="border-top:1px solid ${t.border};padding:8px 0;display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0">
          <button id="_thd" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px" title="Temas">🎨</button>
          <button id="_lg" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${getFlag(lang)}</button>
          <button id="_lo" style="background:#ef4444;color:#fff;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px" title="Salir">✕</button>
        </div>`
      :`<div style="border-top:1px solid ${t.border};padding:10px 12px;flex-shrink:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,${t.acc},#7c3aed);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0">${(u.nombre||'U')[0]}</div>
            <span style="font-size:11px;font-weight:600;color:${t.sbText||t.text};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(u.nombre)}</span>
          </div>
          <div style="display:flex;gap:3px;margin-bottom:6px">${favBtns}</div>
          <div style="display:flex;gap:4px">
            <button id="_thd" style="flex:1;background:${t.isDark?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:11px" title="Temas">🎨</button>
            <button id="_lg" style="flex:1;background:${t.isDark?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:12px">${getFlag(lang)}</button>
            <button id="_lo" style="flex:1;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:10px;font-weight:700">Salir</button>
          </div>
        </div>`);

  const sbCSS=isV
    ?`width:100%;height:auto;max-height:52px;flex-direction:row;overflow-x:auto;overflow-y:hidden;border-${_sbPos==='top'?'bottom':'top'}:1px solid ${t.border};scrollbar-width:none;`
    :`width:${w}px;height:100%;flex-direction:column;overflow:hidden;border-${_sbPos==='left'?'right':'left'}:1px solid ${t.border};scrollbar-width:none;`;

  const sbHTML=`<nav id="_sb" style="${sbCSS}background:${t.sb};flex-shrink:0;display:flex;transition:width .22s;position:relative;color:${t.sbText||t.text}">
    ${colBtn}
    ${logoHTML}
    <div style="${isV?'display:flex;gap:2px;flex:1;overflow-x:auto;align-items:center;padding:0 4px;scrollbar-width:none':'flex:1;overflow-y:auto;padding:2px 0;scrollbar-width:none'}">${tabs}</div>
    ${foot}
  </nav>`;
  const main=`<main id="_mc" style="flex:1;overflow-y:auto;padding:16px;position:relative;min-width:0"></main>`;
  const first=_sbPos==='left'||_sbPos==='top';
  _container.innerHTML=`<style>#_sb::-webkit-scrollbar,#_sb *::-webkit-scrollbar{display:none}._si:hover{background:${t.isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.04)'}!important}#_sb{scrollbar-width:none}</style>
  <div style="display:flex;flex-direction:${isV?'column':'row'};height:100vh;font-family:system-ui,sans-serif">${first?sbHTML+main:main+sbHTML}</div>`;

  // Events
  _container.querySelectorAll('._si').forEach(b=>b.onclick=()=>_goTab(b.dataset.t));
  _container.querySelectorAll('._ftheme').forEach(b=>b.onclick=()=>{setCurrentTheme(b.dataset.tid);_updSess();_repaint();});

  // Logo = position menu
  const sico=_container.querySelector('#_sico');
  if(sico){sico.onclick=(e)=>{e.stopPropagation();_showPos(sico,t);};}

  // Collapse button
  const colb=_container.querySelector('#_colBtn');
  if(colb)colb.onclick=()=>{_sbCol=!_sbCol;_save();_repaint();};

  // Resize drag (left/right)
  if(!isV){const sb=_container.querySelector('#_sb');if(sb){let ir=false,rx,rw;
    sb.addEventListener('mousedown',e=>{const edge=_sbPos==='left'?sb.getBoundingClientRect().right:sb.getBoundingClientRect().left;if(Math.abs(e.clientX-edge)<6&&!_sbCol){ir=true;rx=e.clientX;rw=sb.offsetWidth;document.body.style.userSelect='none';document.body.style.cursor='col-resize';e.preventDefault();}});
    document.addEventListener('mousemove',e=>{if(!ir)return;const nw=Math.max(52,Math.min(400,rw+(_sbPos==='left'?1:-1)*(e.clientX-rx)));sb.style.width=nw+'px';});
    document.addEventListener('mouseup',()=>{ir=false;document.body.style.userSelect='';document.body.style.cursor='';});
  }}

  _container.querySelector('#_lo').onclick=async()=>{const{logout}=await import('./app.js');logout();};
  _container.querySelector('#_thd').onclick=(e)=>{e.stopPropagation();_showThemes(e.target,t);};
  _container.querySelector('#_lg').onclick=()=>_langPick();
  _hlTab();
  if(u.tabs.length>0)_goTab(_activeTab||u.tabs[0]);
}

// ═══ THEME PICKER ═══
function _showThemes(el,t){
  const old=document.getElementById('_thPick');if(old){old.remove();return;}
  const m=document.createElement('div');m.id='_thPick';
  m.style.cssText=`position:fixed;z-index:9999;background:${t.card};border:1px solid ${t.border};border-radius:14px;padding:14px;box-shadow:0 8px 32px rgba(0,0,0,.2);width:280px;max-height:70vh;overflow-y:auto`;
  const rect=el.getBoundingClientRect();
  if(_sbPos==='right')m.style.right=(window.innerWidth-rect.left+8)+'px';
  else m.style.left=(rect.right+8)+'px';
  m.style.bottom='12px';

  const cur=getCurrentTheme(),favs=getFavorites();
  const renderT=(id,th)=>{
    const isFav=favs.includes(id);
    return`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;background:${id===cur?t.accBg:'transparent'};border:1px solid ${id===cur?t.acc:'transparent'}" onclick="window._setTheme('${id}')">
      <div style="width:24px;height:24px;border-radius:6px;background:${th.bg};border:1px solid ${th.border};flex-shrink:0;position:relative"><div style="position:absolute;bottom:1px;right:1px;width:8px;height:8px;border-radius:50%;background:${th.acc}"></div></div>
      <span style="font-size:12px;font-weight:${id===cur?'700':'500'};flex:1;color:${t.text}">${th.name}</span>
      <span style="font-size:14px;cursor:pointer;opacity:${isFav?.9:.25}" onclick="event.stopPropagation();window._togFav('${id}')" title="${isFav?'Quitar favorito':'Agregar favorito (máx 3)'}">${isFav?'⭐':'☆'}</span>
    </div>`;
  };

  m.innerHTML=`<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${t.t3};margin-bottom:6px">☀️ Claros</div>
    ${LIGHT_THEMES.map(th=>renderT(th.id,th)).join('')}
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${t.t3};margin:10px 0 6px">🌙 Oscuros</div>
    ${DARK_THEMES.map(th=>renderT(th.id,th)).join('')}
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid ${t.border};font-size:10px;color:${t.t3}">⭐ Favoritos aparecen en la sidebar para cambio rápido</div>`;

  document.body.appendChild(m);
  setTimeout(()=>{const h=e=>{if(!m.contains(e.target)){m.remove();document.removeEventListener('click',h);}};document.addEventListener('click',h);},50);
}

window._setTheme=(id)=>{
  setCurrentTheme(id);
  _usuario.tema=THEMES[id]?.group==='dark'?'dark':'light';
  _updSess();
  document.getElementById('_thPick')?.remove();
  _repaint();
  toast(`🎨 ${THEMES[id]?.name||id}`,'#10b981');
};
window._togFav=(id)=>{
  toggleFavorite(id);
  document.getElementById('_thPick')?.remove();
  _repaint();
};

// ═══ POSITION MENU ═══
function _showPos(el,t){
  if(_sbPm){_sbPm.remove();_sbPm=null;return;}
  _sbPm=document.createElement('div');
  _sbPm.style.cssText=`position:fixed;z-index:9999;background:${t.card};border:1px solid ${t.border};border-radius:10px;padding:5px;box-shadow:0 6px 24px rgba(0,0,0,.15);min-width:150px`;
  const rect=el.getBoundingClientRect();
  if(_sbPos==='right'){_sbPm.style.right=(window.innerWidth-rect.left+8)+'px';_sbPm.style.top=rect.top+'px';}
  else if(_sbPos==='bottom'){_sbPm.style.left=rect.left+'px';_sbPm.style.bottom=(window.innerHeight-rect.top+8)+'px';}
  else if(_sbPos==='top'){_sbPm.style.left=rect.left+'px';_sbPm.style.top=(rect.bottom+8)+'px';}
  else{_sbPm.style.left=(rect.right+8)+'px';_sbPm.style.top=rect.top+'px';}
  [{i:'⬅',l:'Izquierda',p:'left'},{i:'➡',l:'Derecha',p:'right'},{i:'⬆',l:'Arriba',p:'top'},{i:'⬇',l:'Abajo',p:'bottom'}].forEach(o=>{
    const b=document.createElement('button');
    b.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:${o.p===_sbPos?'700':'500'};cursor:pointer;color:${o.p===_sbPos?t.acc:'inherit'};border:none;background:${o.p===_sbPos?t.accBg:'none'};width:100%;text-align:left;font-family:inherit`;
    b.innerHTML=`<span>${o.i}</span><span>${o.l}</span>`;
    b.onclick=()=>{_sbPm.remove();_sbPm=null;_sbPos=o.p;_save();_repaint();};
    _sbPm.appendChild(b);
  });
  document.body.appendChild(_sbPm);
  setTimeout(()=>{const h=()=>{if(_sbPm){_sbPm.remove();_sbPm=null;}document.removeEventListener('click',h);};document.addEventListener('click',h);},50);
}

// ═══ TAB NAVIGATION ═══
function _hlTab(){
  const t=T();
  _container.querySelectorAll('._si').forEach(b=>{const a=b.dataset.t===_activeTab;b.style.background=a?t.accBg:'transparent';b.style.color=a?t.acc:(t.sbText||t.t3);b.style.fontWeight=a?'700':'500';});
}

async function _goTab(id){
  const mc=_container.querySelector('#_mc');
  if(_cleanup){try{_cleanup();}catch(e){}_cleanup=null;}
  _activeTab=id;AppState.set('activeTab',id);_hlTab();
  mc.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8;font-size:13px">Cargando...</div>`;
  const loader=MODS[id];if(!loader){mc.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${id}" no disponible</div>`;return;}
  try{const mod=await loader();mc.innerHTML='';if(mod.render){const cl=mod.render(mc,_usuario);if(typeof cl==='function')_cleanup=cl;}else mc.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${id}" cargado</div>`;}
  catch(e){console.error(`Error ${id}:`,e);mc.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:14px;font-weight:700;color:#ef4444">Error en ${id}</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${safeHtml(e.message)}</div></div>`;}
}

// ═══ LANG PICKER ═══
function _langPick(){const ex=document.getElementById('_lm');if(ex){ex.remove();return;}const t=T(),cl=_usuario.idioma;const m=document.createElement('div');m.id='_lm';m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9000;display:flex;align-items:center;justify-content:center';m.innerHTML=`<div style="background:${t.card};border-radius:14px;padding:20px;max-width:360px;width:90%;max-height:80vh;overflow-y:auto"><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${LANGS_UI.map(l=>`<div class="_lp" data-c="${l.code}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;border:1px solid ${l.code===cl?t.acc:t.border};background:${l.code===cl?t.accBg:'transparent'};color:${t.text}">${l.flag} ${l.name}</div>`).join('')}</div></div>`;m.onclick=e=>{if(e.target===m)m.remove();};m.querySelectorAll('._lp').forEach(el=>{el.onclick=async()=>{const c=el.dataset.c;_usuario.idioma=c;AppState.set('currentLang',c);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{idioma:c});}catch(e){}_updSess();m.remove();toast(trFree('shell','lang_ok'),'#10b981');_repaint();};});document.body.appendChild(m);}

function _updSess(){const s=JSON.parse(localStorage.getItem('beu_session')||'{}');s.idioma=_usuario.idioma;s.tema=_usuario.tema;s.themeId=getCurrentTheme();localStorage.setItem('beu_session',JSON.stringify(s));}
