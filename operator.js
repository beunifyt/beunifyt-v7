// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js — Shell sidebar
// UN SOLO ICONO: SVG logo = click pos menu, dblclick collapse
// Menú posición adaptado a todas las posiciones de sidebar
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { tr, trFree, LANGS_UI, getFlag } from './langs.js';
import { toast, safeHtml } from './utils.js';

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

function _paint(){
  const u=_usuario,lang=u.idioma||AppState.get('currentLang'),dk=u.tema==='dark';
  const bg=dk?'#0f172a':'#f5f7fa',card=dk?'#1e293b':'#fff',bdr=dk?'#334155':'#e2e8f0',tm=dk?'#94a3b8':'#64748b',ac='#3b82f6',abg=dk?'rgba(59,130,246,.12)':'#eff6ff';
  document.body.style.background=bg;document.body.style.color=dk?'#e2e8f0':'#1a1a1a';
  const isV=_sbPos==='top'||_sbPos==='bottom',w=_sbCol&&!isV?52:220;

  // Logo section — ONLY ONE element, clickable
  const logoHTML=_sbCol&&!isV
    ?`<div id="_sico" style="padding:8px 0;display:flex;justify-content:center;cursor:pointer;flex-shrink:0" title="Click: posición · Doble click: colapsar">${LOGO}</div>`
    :`<div id="_sico" style="padding:${isV?'6px 10px':'12px 12px 8px'};display:flex;align-items:center;gap:8px;cursor:pointer;background:#030812;border-radius:10px;margin:${isV?'4px':'6px 6px 2px'};flex-shrink:0" title="Click: posición · Doble click: colapsar">${LOGO}${!isV||!_sbCol?BRAND:''}</div>`;

  // Tabs
  const tabs=u.tabs.map(t=>{const l=tr('tabs',t);if(l===null)return'';
    if(isV)return`<button class="_si" data-t="${t}" style="display:flex;align-items:center;gap:5px;padding:6px 10px;border:none;background:none;cursor:pointer;font-size:11px;font-weight:500;color:${tm};border-radius:8px;white-space:nowrap;flex-shrink:0">${l}</button>`;
    if(_sbCol){const ic=l.slice(0,2);return`<button class="_si" data-t="${t}" title="${l}" style="display:flex;align-items:center;justify-content:center;padding:9px 0;border:none;background:none;cursor:pointer;font-size:15px;margin:1px 4px;border-radius:8px;width:44px">${ic}</button>`;}
    return`<button class="_si" data-t="${t}" style="display:flex;align-items:center;gap:8px;padding:7px 12px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:${tm};margin:1px 6px;border-radius:8px;width:calc(100% - 12px);text-align:left">${l}</button>`;
  }).join('');

  // Footer
  const foot=isV
    ?`<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;flex-shrink:0;margin-left:auto"><button id="_th" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${dk?'☀️':'🌙'}</button><button id="_lg" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${getFlag(lang)}</button><span style="font-size:10px;color:${tm};max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(u.nombre)}</span><button id="_lo" style="background:#ef4444;color:#fff;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700" title="Cerrar sesión">✕</button></div>`
    :(_sbCol
      ?`<div style="border-top:1px solid ${bdr};padding:8px 0;display:flex;flex-direction:column;align-items:center;gap:5px;flex-shrink:0"><button id="_th" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${dk?'☀️':'🌙'}</button><button id="_lg" style="background:none;border:none;cursor:pointer;font-size:13px;padding:3px">${getFlag(lang)}</button><button id="_lo" style="background:#ef4444;color:#fff;border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px" title="Salir">✕</button></div>`
      :`<div style="border-top:1px solid ${bdr};padding:8px 10px;flex-shrink:0"><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,${ac},#7c3aed);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0">${(u.nombre||'U')[0]}</div><span style="font-size:11px;font-weight:600;color:${dk?'#e2e8f0':'#1a1a1a'};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(u.nombre)}</span></div><div style="display:flex;gap:4px"><button id="_th" style="flex:1;background:${dk?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:12px">${dk?'☀️':'🌙'}</button><button id="_lg" style="flex:1;background:${dk?'#334155':'#f1f5f9'};border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:12px">${getFlag(lang)}</button><button id="_lo" style="flex:1;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;padding:5px;cursor:pointer;font-size:10px;font-weight:700">Salir</button></div></div>`);

  const sbHTML=`<nav id="_sb" style="${isV?`width:100%;height:auto;max-height:52px;flex-direction:row;overflow-x:auto;overflow-y:hidden;border-${_sbPos==='top'?'bottom':'top'}:1px solid ${bdr};`:`width:${w}px;height:100%;flex-direction:column;overflow-y:auto;overflow-x:hidden;border-${_sbPos==='left'?'right':'left'}:1px solid ${bdr};`}background:${card};flex-shrink:0;display:flex;transition:width .22s;scrollbar-width:none;">
    ${logoHTML}
    <div style="${isV?'display:flex;gap:2px;flex:1;overflow-x:auto;align-items:center;padding:0 4px;scrollbar-width:none':'flex:1;overflow-y:auto;padding:2px 0;scrollbar-width:none'}">${tabs}</div>
    ${foot}
  </nav>`;
  const main=`<main id="_mc" style="flex:1;overflow-y:auto;padding:16px;position:relative;min-width:0"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:${tm};font-size:13px">${trFree('shell','loading')}</div></main>`;
  const first=_sbPos==='left'||_sbPos==='top';
  _container.innerHTML=`<style>#_sb::-webkit-scrollbar,#_sb div::-webkit-scrollbar{display:none}._si:hover{background:${dk?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'}!important}</style><div style="display:flex;flex-direction:${isV?'column':'row'};height:100vh;font-family:system-ui,sans-serif">${first?sbHTML+main:main+sbHTML}</div>`;

  // Events
  _container.querySelectorAll('._si').forEach(b=>b.onclick=()=>_goTab(b.dataset.t));

  // SINGLE ICON — click=pos menu, dblclick=collapse
  const sico=_container.querySelector('#_sico');
  if(sico){let _ct=null;
    sico.onclick=(e)=>{e.stopPropagation();
      if(_ct){clearTimeout(_ct);_ct=null;_sbCol=!_sbCol;_save();_repaint();return;}
      _ct=setTimeout(()=>{_ct=null;_showPos(sico,card,bdr,ac,abg,dk);},280);
    };
  }

  // Resize (left/right only)
  if(!isV){const sb=_container.querySelector('#_sb');if(sb){let ir=false,rx,rw;
    sb.addEventListener('mousedown',e=>{const edge=_sbPos==='left'?sb.getBoundingClientRect().right:sb.getBoundingClientRect().left;if(Math.abs(e.clientX-edge)<6&&!_sbCol){ir=true;rx=e.clientX;rw=sb.offsetWidth;document.body.style.userSelect='none';document.body.style.cursor='col-resize';e.preventDefault();}});
    document.addEventListener('mousemove',e=>{if(!ir)return;sb.style.width=Math.max(52,Math.min(400,rw+(_sbPos==='left'?1:-1)*(e.clientX-rx)))+'px';});
    document.addEventListener('mouseup',()=>{ir=false;document.body.style.userSelect='';document.body.style.cursor='';});
  }}

  _container.querySelector('#_lo').onclick=async()=>{const{logout}=await import('./app.js');logout();};
  _container.querySelector('#_th').onclick=async()=>{const nt=_usuario.tema==='dark'?'light':'dark';_usuario.tema=nt;AppState.set('theme',nt);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{tema:nt});}catch(e){}_updSess();_repaint();};
  _container.querySelector('#_lg').onclick=()=>_langPick();
  _hlTab();
  if(u.tabs.length>0)_goTab(_activeTab||u.tabs[0]);
}

function _showPos(el,card,bdr,ac,abg,dk){
  if(_sbPm){_sbPm.remove();_sbPm=null;return;}
  _sbPm=document.createElement('div');
  _sbPm.style.cssText=`position:fixed;z-index:9999;background:${card};border:1px solid ${bdr};border-radius:10px;padding:5px;box-shadow:0 6px 24px rgba(0,0,0,.15);min-width:150px`;
  const rect=el.getBoundingClientRect();
  // Position menu intelligently based on sidebar position
  if(_sbPos==='right'){_sbPm.style.right=(window.innerWidth-rect.left+8)+'px';_sbPm.style.top=rect.top+'px';}
  else if(_sbPos==='bottom'){_sbPm.style.left=rect.left+'px';_sbPm.style.bottom=(window.innerHeight-rect.top+8)+'px';}
  else if(_sbPos==='top'){_sbPm.style.left=rect.left+'px';_sbPm.style.top=(rect.bottom+8)+'px';}
  else{_sbPm.style.left=(rect.right+8)+'px';_sbPm.style.top=rect.top+'px';}

  [{i:'⬅',l:'Izquierda',p:'left'},{i:'➡',l:'Derecha',p:'right'},{i:'⬆',l:'Arriba',p:'top'},{i:'⬇',l:'Abajo',p:'bottom'}].forEach(o=>{
    const b=document.createElement('button');
    b.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:${o.p===_sbPos?'700':'500'};cursor:pointer;color:${o.p===_sbPos?ac:'inherit'};border:none;background:${o.p===_sbPos?abg:'none'};width:100%;text-align:left;font-family:inherit`;
    b.innerHTML=`<span>${o.i}</span><span>${o.l}</span>`;
    b.onclick=()=>{_sbPm.remove();_sbPm=null;_sbPos=o.p;_save();_repaint();};
    _sbPm.appendChild(b);
  });
  const sep=document.createElement('div');sep.style.cssText=`height:1px;background:${bdr};margin:4px 0`;_sbPm.appendChild(sep);
  const cb=document.createElement('button');
  cb.style.cssText=`display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;font-size:12px;cursor:pointer;color:inherit;border:none;background:none;width:100%;text-align:left;font-family:inherit`;
  cb.innerHTML=`<span>${_sbCol?'◁':'▷'}</span><span>${_sbCol?'Expandir':'Colapsar'}</span>`;
  cb.onclick=()=>{_sbPm.remove();_sbPm=null;_sbCol=!_sbCol;_save();_repaint();};
  _sbPm.appendChild(cb);
  document.body.appendChild(_sbPm);
  setTimeout(()=>{const h=()=>{if(_sbPm){_sbPm.remove();_sbPm=null;}document.removeEventListener('click',h);};document.addEventListener('click',h);},50);
}

function _hlTab(){
  const dk=_usuario.tema==='dark',ac='#3b82f6',abg=dk?'rgba(59,130,246,.12)':'#eff6ff',tm=dk?'#94a3b8':'#64748b';
  _container.querySelectorAll('._si').forEach(b=>{const a=b.dataset.t===_activeTab;b.style.background=a?abg:'transparent';b.style.color=a?ac:tm;b.style.fontWeight=a?'700':'500';});
}

async function _goTab(id){
  const mc=_container.querySelector('#_mc');
  if(_cleanup){try{_cleanup();}catch(e){}_cleanup=null;}
  _activeTab=id;AppState.set('activeTab',id);_hlTab();
  mc.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8;font-size:13px">${trFree('shell','loading')}</div>`;
  const loader=MODS[id];if(!loader){mc.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${id}" no disponible</div>`;return;}
  try{const mod=await loader();mc.innerHTML='';if(mod.render){const cl=mod.render(mc,_usuario);if(typeof cl==='function')_cleanup=cl;}else mc.innerHTML=`<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${id}" cargado</div>`;}
  catch(e){console.error(`Error ${id}:`,e);mc.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:14px;font-weight:700;color:#ef4444">Error en ${id}</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${safeHtml(e.message)}</div></div>`;}
}

function _langPick(){const ex=document.getElementById('_lm');if(ex){ex.remove();return;}const dk=_usuario.tema==='dark',cl=_usuario.idioma;const m=document.createElement('div');m.id='_lm';m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9000;display:flex;align-items:center;justify-content:center';m.innerHTML=`<div style="background:${dk?'#1e293b':'#fff'};border-radius:14px;padding:20px;max-width:360px;width:90%;max-height:80vh;overflow-y:auto"><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${LANGS_UI.map(l=>`<div class="_lp" data-c="${l.code}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;border:1px solid ${l.code===cl?'#3b82f6':(dk?'#475569':'#e2e8f0')};background:${l.code===cl?(dk?'#1e3a5f':'#eff6ff'):'transparent'};color:inherit">${l.flag} ${l.name}</div>`).join('')}</div></div>`;m.onclick=e=>{if(e.target===m)m.remove();};m.querySelectorAll('._lp').forEach(el=>{el.onclick=async()=>{const c=el.dataset.c;_usuario.idioma=c;AppState.set('currentLang',c);try{const{fsUpdate}=await import('./firestore.js');await fsUpdate(`users/${_usuario.uid}`,{idioma:c});}catch(e){}_updSess();m.remove();toast(trFree('shell','lang_ok'),'#10b981');_repaint();};});document.body.appendChild(m);}
function _updSess(){const s=JSON.parse(localStorage.getItem('beu_session')||'{}');s.idioma=_usuario.idioma;s.tema=_usuario.tema;localStorage.setItem('beu_session',JSON.stringify(s));}
