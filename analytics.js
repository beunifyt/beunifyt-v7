// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics.js — Análisis tipo Tableau simplificado
// KPIs, gráficos SVG barras/donut, filtros fuente/fecha, export Excel
// Lee datos de: ingresos2, ingresos, movimientos, agenda, conductores
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, nowLocal } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { crossRead } from './field-engine.js';

let _c,_u,_source='all',_chart='resumen',_dateFrom='',_dateTo='',_allData=[];
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};

export function render(ct,us){_c=ct;_u=us;_allData=[];loadAll().then(()=>paint());return()=>{};}

async function loadAll(){
  const[ing,ref,emb,ag,cd]=await Promise.all([crossRead('ingresos2'),crossRead('ingresos'),crossRead('movimientos'),crossRead('agenda'),crossRead('conductores')]);
  _allData={all:[...ing,...ref,...emb,...ag],ref,ing,emb,ag,cd};
}

function getData(){
  let d=_allData[_source]||_allData.all||[];
  if(_dateFrom)d=d.filter(i=>(i.fecha||i.entrada||'')>=_dateFrom);
  if(_dateTo)d=d.filter(i=>(i.fecha||i.entrada||'').slice(0,10)<=_dateTo);
  return d;
}

function paint(){
  const c=C(),data=getData(),today=new Date().toISOString().slice(0,10);
  const enRecinto=data.filter(i=>i.estado==='EN_RECINTO'||(!i.salida&&i.entrada)).length;
  const hoy=data.filter(i=>(i.fecha||i.entrada||'').startsWith(today)).length;
  const total=data.length;
  const conSalida=data.filter(i=>i.salida||i.estado==='SALIDA').length;

  _c.innerHTML=`<div style="max-width:1200px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <div style="font-size:22px;font-weight:700;color:${c.text}">📈 Análisis</div>
      <span style="flex:1"></span>
      <button onclick="window._anlExport()" style="padding:6px 14px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer">⬇ Excel</button>
    </div>
    <!-- Filtros -->
    <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
      ${['all','ref','ing','emb','ag','cd'].map(s=>`<button class="_sf" data-s="${s}" style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:${_source===s?'700':'500'};cursor:pointer;border:1.5px solid ${_source===s?c.blue:c.border};background:${_source===s?c.bll:c.bg2};color:${_source===s?c.blue:c.t3}">${{all:'Todos',ref:'Referencia',ing:'Ingresos',emb:'Embalaje',ag:'Agenda',cd:'Conductores'}[s]}</button>`).join('')}
      <input type="date" value="${_dateFrom}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;color:${c.t3}" onchange="window._anlDateFrom(this.value)">
      <input type="date" value="${_dateTo}" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};outline:none;color:${c.t3}" onchange="window._anlDateTo(this.value)">
      <span style="font-size:10px;color:${c.t3}">${total} registros</span>
    </div>
    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px">
      ${_kpi('En recinto',enRecinto,c.green,c)}
      ${_kpi('Hoy',hoy,c.blue,c)}
      ${_kpi('Total',total,c.purple,c)}
      ${_kpi('Con salida',conSalida,c.amber,c)}
      ${_kpi('Conductores',(_allData.cd||[]).length,'#6366f1',c)}
    </div>
    <!-- Charts -->
    <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap">
      ${['resumen','hora','hall','empresa','tipo','estado'].map(ch=>`<button class="_ch" data-ch="${ch}" style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:${_chart===ch?'700':'500'};cursor:pointer;border:1.5px solid ${_chart===ch?c.blue:c.border};background:${_chart===ch?c.bll:c.bg2};color:${_chart===ch?c.blue:c.t3}">${{resumen:'📊 Tendencia',hora:'🕐 Por hora',hall:'🏭 Por hall',empresa:'🏢 Top empresas',tipo:'🚛 Tipo vehículo',estado:'📋 Estados'}[ch]}</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:14px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:16px;min-height:300px">
        <div id="_chartMain"></div>
      </div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:16px">
        <div id="_chartSide"></div>
      </div>
    </div>
  </div>`;
  _c.querySelectorAll('._sf').forEach(b=>b.onclick=()=>{_source=b.dataset.s;paint();});
  _c.querySelectorAll('._ch').forEach(b=>b.onclick=()=>{_chart=b.dataset.ch;paint();});
  renderCharts(data,c);
}

function _kpi(label,val,color,c){return`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:800;color:${color}">${val}</div><div style="font-size:11px;color:${c.t3};margin-top:2px">${label}</div></div>`;}

function renderCharts(data,c){
  const main=_c.querySelector('#_chartMain'),side=_c.querySelector('#_chartSide');
  if(!main||!side)return;
  const count=(arr,key)=>{const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);};
  const timeHist=()=>{const m={};data.forEach(i=>{const d=(i.fecha||i.entrada||'').slice(0,10);if(d)m[d]=(m[d]||0)+1;});return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));};
  const hourHist=()=>{const m={};for(let h=0;h<24;h++)m[String(h).padStart(2,'0')]=0;data.forEach(i=>{const t=(i.fecha||i.entrada||'').slice(11,13);if(t)m[t]=(m[t]||0)+1;});return Object.entries(m);};

  let mainHTML='',sideHTML='';
  if(_chart==='resumen'){const th=timeHist();mainHTML=_barChart(th,'Registros por día',c);sideHTML=_donut(count(data,'estado').slice(0,6),'Estados',c);}
  else if(_chart==='hora'){mainHTML=_barChart(hourHist(),'Distribución por hora',c);sideHTML=_donut(count(data,'tipoVehiculo').slice(0,6),'Tipo vehículo',c);}
  else if(_chart==='hall'){const h=count(data,'hall').slice(0,12);mainHTML=_barChart(h,'Por Hall',c);sideHTML=_donut(h.slice(0,6),'Halls',c);}
  else if(_chart==='empresa'){const e=count(data,'empresa').slice(0,15);mainHTML=_barChart(e,'Top empresas',c);sideHTML=`<div style="font-size:12px;font-weight:700;margin-bottom:8px">🏢 Ranking</div>${e.map((x,i)=>`<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid ${c.border}"><span>${i+1}. ${safeHtml(x[0])}</span><b>${x[1]}</b></div>`).join('')}`;}
  else if(_chart==='tipo'){mainHTML=_barChart(count(data,'tipoVehiculo'),'Tipo vehículo',c);sideHTML=_donut(count(data,'tipoCarga').slice(0,6),'Tipo carga',c);}
  else if(_chart==='estado'){mainHTML=_barChart(count(data,'estado'),'Estados',c);sideHTML=_donut(count(data,'estado'),'Estados',c);}
  main.innerHTML=mainHTML;side.innerHTML=sideHTML;
}

function _barChart(entries,title,c){
  if(!entries.length)return`<div style="text-align:center;padding:40px;color:${c.t3}">Sin datos</div>`;
  const max=Math.max(...entries.map(e=>e[1]),1);
  const colors=[c.blue,c.green,c.purple,c.amber,c.red,'#6366f1','#ec4899','#14b8a6'];
  return`<div style="font-size:12px;font-weight:700;margin-bottom:12px">${title}</div>
    <svg viewBox="0 0 ${Math.max(entries.length*40,200)} 180" style="width:100%;height:220px">
      ${entries.map((e,i)=>{const h=Math.max((e[1]/max)*150,2);const x=i*40+10;const col=colors[i%colors.length];
        return`<rect x="${x}" y="${160-h}" width="28" height="${h}" rx="4" fill="${col}" opacity=".85"/>
          <text x="${x+14}" y="${172}" text-anchor="middle" font-size="8" fill="${c.t3}">${e[0].length>6?e[0].slice(0,6)+'…':e[0]}</text>
          <text x="${x+14}" y="${155-h}" text-anchor="middle" font-size="9" font-weight="700" fill="${c.text}">${e[1]}</text>`;
      }).join('')}
    </svg>`;
}

function _donut(entries,title,c){
  if(!entries.length)return`<div style="text-align:center;padding:20px;color:${c.t3}">Sin datos</div>`;
  const total=entries.reduce((s,e)=>s+e[1],0);
  const colors=[c.blue,c.green,c.purple,c.amber,c.red,'#6366f1'];
  let offset=0;
  const slices=entries.map((e,i)=>{const pct=e[1]/total;const dash=pct*251.2;const gap=251.2-dash;const s=`<circle cx="50" cy="50" r="40" fill="none" stroke="${colors[i%colors.length]}" stroke-width="16" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" opacity=".85"/>`;offset+=dash;return s;});
  return`<div style="font-size:12px;font-weight:700;margin-bottom:8px">${title}</div>
    <svg viewBox="0 0 100 100" style="width:140px;height:140px;margin:0 auto;display:block">${slices.join('')}<text x="50" y="53" text-anchor="middle" font-size="14" font-weight="800" fill="${c.text}">${total}</text></svg>
    <div style="margin-top:8px">${entries.map((e,i)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;padding:2px 0"><span style="width:8px;height:8px;border-radius:50%;background:${colors[i%colors.length]};flex-shrink:0"></span><span style="flex:1">${safeHtml(e[0]||'—')}</span><b>${e[1]}</b><span style="color:${c.t3}">${Math.round(e[1]/total*100)}%</span></div>`).join('')}</div>`;
}

window._anlDateFrom=(v)=>{_dateFrom=v;paint();};
window._anlDateTo=(v)=>{_dateTo=v;paint();};
window._anlExport=async()=>{try{toast('⬇','#2c5ee8');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const d=getData();const ws=X.utils.json_to_sheet(d.map(r=>({Matrícula:r.matricula||r.codigo||'',Nombre:r.nombre||r.titulo||'',Empresa:r.empresa||'',Hall:r.hall||'',Estado:r.estado||'',Fecha:r.fecha||r.entrada||''})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,'Analytics');X.writeFile(wb,`analytics_${new Date().toISOString().slice(0,10)}.xlsx`);toast('✅','#10b981');}catch(e){toast('❌','#ef4444');}};
