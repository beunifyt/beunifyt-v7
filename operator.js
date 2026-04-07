// BeUnifyT — operator.js
// Shell: sidebar, navegación, goTab

function sa(el){document.querySelectorAll('.si').forEach(x=>x.classList.remove('on'));el.classList.add('on');}

// Módulos cargados dinámicamente — cache
const _tabCache = {};
const _TAB_MODULES = {
  ingresos:    './ingresos.js',
  ingresos2:   './ingresos2.js',
  flota:       './flota.js',
  conductores: './conductores.js',
  agenda:      './agenda.js',
  analytics:   './analytics.js',
  vehiculos:   './vehiculos.js',
  auditoria:   './auditoria.js',
  papelera:    './papelera.js',
  impresion:   './impresion.js',
  recintos:    './recintos.js',
  eventos:     './eventos.js',
  mensajes:    './mensajes.js',
  usuarios:    './usuarios.js',
  empresas:    './empresas.js',
  migracion:   './migracion.js',
  dash:        './dash.js',
};

async function goTab(tabId) {
  // Highlight sidebar
  document.querySelectorAll('.si[data-tab]').forEach(x=>x.classList.toggle('on', x.dataset.tab===tabId));
  // Si tiene módulo externo
  if (_TAB_MODULES[tabId]) {
    const mc = document.getElementById('mc');
    if (mc) mc.innerHTML = '<div style="padding:40px;text-align:center;opacity:.4"><div style="font-size:28px">⏳</div></div>';
    try {
      if (!_tabCache[tabId]) _tabCache[tabId] = await import(_TAB_MODULES[tabId]);
      const fn = _tabCache[tabId]['render'+tabId.charAt(0).toUpperCase()+tabId.slice(1)]
              || window['render'+tabId.charAt(0).toUpperCase()+tabId.slice(1)];
      if (fn) fn();
    } catch(e) {
      if (mc) mc.innerHTML = `<div style="padding:20px;text-align:center;color:#dc2626">Error cargando ${tabId}: ${e.message}</div>`;
    }
    return;
  }
  // Fallback: render inline
  const fns = {dash: window.renderDash};
  if (fns[tabId]) fns[tabId]();
}

function initSidebar(){
  const sb=document.querySelector('.sb');
  if(!sb)return;

  // Collapse toggle
  const tog=document.createElement('div');
  tog.className='sb-toggle'; tog.innerHTML='◀';
  sb.appendChild(tog);
  let collapsed=false;
  tog.addEventListener('click',e=>{
    e.stopPropagation();collapsed=!collapsed;
    sb.classList.toggle('collapsed',collapsed);
    tog.innerHTML=collapsed?'▶':'◀';
  });

  // Resize
  const rh=document.createElement('div');rh.className='sb-resize';sb.appendChild(rh);
  let isRes=false,rx0,rw0;
  rh.addEventListener('mousedown',e=>{if(collapsed)return;isRes=true;rx0=e.clientX;rw0=sb.offsetWidth;document.body.style.userSelect='none';document.body.style.cursor='col-resize';e.preventDefault();});
  document.addEventListener('mousemove',e=>{if(!isRes)return;sb.style.width=Math.max(52,Math.min(400,rw0+e.clientX-rx0))+'px';});
  document.addEventListener('mouseup',()=>{isRes=false;document.body.style.userSelect='';document.body.style.cursor='';});

  // Logo click → posición
  const ico=document.getElementById('sbIco');
  if(ico){
    let pm=null;
    ico.addEventListener('click',e=>{
      e.stopPropagation();
      if(pm){pm.remove();pm=null;return;}
      pm=document.createElement('div');pm.className='pos-menu';
      const rect=ico.getBoundingClientRect();
      pm.style.cssText=`position:fixed;z-index:9999;left:${rect.right+8}px;top:${rect.top}px`;
      [{ico:'⬅',l:'Izquierda',p:'left'},{ico:'➡',l:'Derecha',p:'right'},{ico:'⬆',l:'Arriba',p:'top'},{ico:'⬇',l:'Abajo',p:'bottom'}]
      .forEach(o=>{
        const b=document.createElement('div');b.className='pos-btn';
        b.innerHTML=`<span>${o.ico}</span><span>${o.l}</span>`;
        b.addEventListener('click',()=>{setSbPos(o.p);pm.remove();pm=null;});
        pm.appendChild(b);
      });
      document.body.appendChild(pm);
      setTimeout(()=>{const h=()=>{pm&&pm.remove();pm=null;document.removeEventListener('click',h);};document.addEventListener('click',h);},50);
    });
  }

  function setSbPos(pos){
    sb.className='sb';
    sb.removeAttribute('style');
    ['sb-top','sb-bottom','sb-right'].forEach(c=>sb.classList.remove(c));
    if(pos==='right'){sb.classList.add('sb-right');document.body.appendChild(sb);}
    else if(pos==='top'){sb.classList.add('sb-top');document.body.style.flexDirection='column';document.body.insertBefore(sb,document.querySelector('.main'));}
    else if(pos==='bottom'){sb.classList.add('sb-bottom');document.body.style.flexDirection='column';document.body.appendChild(sb);}
    else{document.body.style.flexDirection='row';document.body.insertBefore(sb,document.querySelector('.main'));}
    T('Panel → '+pos,'');
  }

  // Tooltips
  document.querySelectorAll('.si').forEach(el=>{const sp=el.querySelector('span');if(sp)el.setAttribute('data-tip',sp.textContent.trim());});
}

// ---- INIT ----


async function init(){
  templates=FS.load()||{};
  buildCtxMenu(); buildColPanel(); initSidebar(); rebuildTable();
  document.getElementById('ov').addEventListener('click',e=>{if(e.target===document.getElementById('ov'))closeM();});
  document.getElementById('detOv').addEventListener('click',e=>{if(e.target===document.getElementById('detOv'))document.getElementById('detOv').classList.remove('open');});
  initAutocomplete();
}

document.addEventListener('DOMContentLoaded', init);
window.goTab = goTab;
