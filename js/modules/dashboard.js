// BeUnifyT v7 — dashboard.js
import { AppState } from '../state.js';
import { getDB }    from '../firestore.js';
import { safeHtml, formatDateTime } from '../utils.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
let _refreshInterval=null;

export async function initDashboard(container){
  const el=typeof container==='string'?document.getElementById(container):container;
  if(!el)return;
  el.innerHTML=`<div id="dashWrap" style="padding:10px"></div>`;
  await _loadDash();
  if(_refreshInterval)clearInterval(_refreshInterval);
  _refreshInterval=setInterval(_loadDash,60000);
}

export function destroyDashboard(){
  if(_refreshInterval){clearInterval(_refreshInterval);_refreshInterval=null;}
}

async function _loadDash(){
  const wrap=document.getElementById('dashWrap');
  if(!wrap)return;
  const user=AppState.get('currentUser');
  const ev=AppState.get('currentEvent');
  if(!ev?.id){wrap.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text3)">Sin evento activo</div>`;return;}

  try{
    const db=getDB();
    const{collection,query,getDocs,where,orderBy,limit}=await import(`${FB}/firebase-firestore.js`);

    // Cargar todos los registros del gate
    const snap=await getDocs(query(
      collection(db,'events',ev.id,'gates',user.gateId||'puerta-1','queue'),
      limit(500)
    ));
    const entries=snap.docs.map(d=>({id:d.id,...d.data()}));

    const hoy=new Date().toDateString();
    const hoyEntries=entries.filter(e=>new Date(e.ts||e.entrada).toDateString()===hoy);
    const enRecinto=entries.filter(e=>!e.salida);
    const refs=entries.filter(e=>e.tipo==='referencia');
    const refsHoy=hoyEntries.filter(e=>e.tipo==='referencia');

    // Por hall
    const porHall={};
    enRecinto.forEach(e=>{const h=e.hall||'Sin hall';porHall[h]=(porHall[h]||0)+1;});

    // Por hora (hoy)
    const porHora={};
    hoyEntries.forEach(e=>{
      const h=new Date(e.ts||e.entrada).getHours();
      porHora[h]=(porHora[h]||0)+1;
    });
    const horaMax=Object.entries(porHora).sort((a,b)=>b[1]-a[1])[0];

    // Últimas entradas
    const ultimas=entries.sort((a,b)=>(b.ts||b.entrada||'').localeCompare(a.ts||a.entrada||'')).slice(0,5);

    wrap.innerHTML=`
<!-- STATS TOP -->
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:16px">
  ${_stat('Entradas hoy','📅',hoyEntries.length,'var(--blue)')}
  ${_stat('En recinto','🟢',enRecinto.length,'var(--green)')}
  ${_stat('Referencias hoy','📋',refsHoy.length,'var(--amber)')}
  ${_stat('Total registros','📊',entries.length,'var(--purple)')}
  ${_stat('Salidas hoy','↩',hoyEntries.filter(e=>e.salida).length,'var(--text3)')}
  ${horaMax?_stat('Hora pico','⏰',horaMax[0]+'h ('+horaMax[1]+')','var(--teal)'):'<div></div>'}
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
  <!-- POR HALL -->
  <div class="card">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">📍 En recinto por hall</div>
    ${Object.entries(porHall).sort((a,b)=>b[1]-a[1]).map(([h,n])=>{
      const pct=enRecinto.length?Math.round(n/enRecinto.length*100):0;
      return`<div style="margin-bottom:6px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
          <span style="font-weight:600">${safeHtml(h)}</span>
          <span style="color:var(--text3)">${n} (${pct}%)</span>
        </div>
        <div style="background:var(--bg4);border-radius:3px;height:6px">
          <div style="width:${pct}%;background:var(--blue);height:100%;border-radius:3px;transition:width .4s"></div>
        </div>
      </div>`;
    }).join('')||'<div style="color:var(--text3);font-size:13px">Sin datos</div>'}
  </div>

  <!-- POR HORA -->
  <div class="card">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">⏰ Entradas por hora (hoy)</div>
    <div style="display:flex;align-items:flex-end;gap:3px;height:80px">
      ${Array.from({length:24},(_,h)=>{
        const n=porHora[h]||0;
        const max=Math.max(...Object.values(porHora),1);
        const pct=Math.round(n/max*100);
        const activo=new Date().getHours()===h;
        return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px" title="${h}h: ${n} entradas">
          <div style="font-size:8px;color:var(--text3)">${n||''}</div>
          <div style="width:100%;background:${activo?'var(--blue)':'var(--bll)'};border-radius:2px 2px 0 0;height:${pct}%;min-height:${n?2:0}px;transition:height .4s"></div>
          <div style="font-size:7px;color:var(--text4)">${h}</div>
        </div>`;
      }).join('')}
    </div>
  </div>
</div>

<!-- ULTIMAS ENTRADAS -->
<div class="card">
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em;display:flex;align-items:center;justify-content:space-between">
    <span>🕐 Últimas entradas</span>
    <button onclick="window._dashRefresh()" style="padding:2px 8px;border-radius:20px;border:1px solid var(--border);background:var(--bg3);font-size:10px;cursor:pointer;color:var(--text2)">🔄 Actualizar</button>
  </div>
  ${ultimas.length?`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr>
      <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border)">Matrícula</th>
      <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border)">Empresa</th>
      <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border)">Hall</th>
      <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border)">Hora</th>
      <th style="text-align:left;padding:5px 8px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);border-bottom:1.5px solid var(--border)">Estado</th>
    </tr></thead><tbody>
    ${ultimas.map(e=>`<tr>
      <td style="padding:5px 8px;border-bottom:1px solid var(--border)">
        <span style="background:#0f172a;color:#f7f8fc;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px">${safeHtml(e.matricula||'—')}</span>
      </td>
      <td style="padding:5px 8px;border-bottom:1px solid var(--border);font-size:11px">${safeHtml(e.empresa||'—')}</td>
      <td style="padding:5px 8px;border-bottom:1px solid var(--border)">${e.hall?`<span style="background:#dbeafe;color:#1e3a5f;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:700">${safeHtml(e.hall)}</span>`:'–'}</td>
      <td style="padding:5px 8px;border-bottom:1px solid var(--border);font-size:11px">${formatDateTime(e.ts||e.entrada)}</td>
      <td style="padding:5px 8px;border-bottom:1px solid var(--border)">${!e.salida?'<span style="background:#ecfdf5;color:#0d9f6e;border:1px solid #bbf7d0;border-radius:4px;font-size:10px;font-weight:700;padding:2px 6px">✓ En recinto</span>':`<span style="color:var(--text3);font-size:11px">↩ Salida</span>`}</td>
    </tr>`).join('')}
    </tbody></table></div>`
  :`<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Sin entradas registradas hoy</div>`}
</div>`;
  }catch(err){
    wrap.innerHTML=`<div style="text-align:center;padding:40px;color:var(--red)">Error cargando datos del dashboard</div>`;
  }
}

function _stat(lbl,ico,val,color){
  return`<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:12px;text-align:center;border-top:3px solid ${color}">
    <div style="font-size:20px;margin-bottom:4px">${ico}</div>
    <div style="font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${color};line-height:1.1">${val}</div>
    <div style="font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;margin-top:3px">${lbl}</div>
  </div>`;
}

window._dashRefresh=_loadDash;
