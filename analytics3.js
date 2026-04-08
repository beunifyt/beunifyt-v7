// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — analytics3.js — Precision Analytics
// Dashboard ejecutivo, temporal, dimensional, funnels, cohortes
// ═══════════════════════════════════════════════════════════
import { AppState } from './state.js';
import { safeHtml, toast, nowLocal, formatDate } from './utils.js';
import { getCurrentTheme, getThemeColors } from './themes.js';
import { crossRead } from './field-engine.js';

let _c,_u,_sub='executive',_source='all',_dateFrom='',_dateTo='',_gran='day',_allData={};
const C=()=>{const t=getThemeColors(getCurrentTheme());return{bg:t.bg,card:t.card,bg2:t.inp||t.bg,border:t.border,text:t.text,t3:t.t3,blue:t.acc,bll:t.accBg,green:t.green||'#0d9f6e',red:t.red||'#dc2626',amber:t.amber||'#d97706',purple:t.purple||'#7c3aed'};};

export function render(ct,us){_c=ct;_u=us;_allData={};loadAll().then(()=>paint());return()=>{};}

async function loadAll(){
  const[ing,ref,emb,ag,cd]=await Promise.all([crossRead('ingresos2'),crossRead('ingresos'),crossRead('movimientos'),crossRead('agenda'),crossRead('conductores')]);
  _allData={all:[...ing,...ref,...emb,...ag],ref,ing,emb,ag,cd,empresas:await crossRead('empresas').catch(()=>[])};
}
function getData(){let d=_allData[_source]||_allData.all||[];if(_dateFrom)d=d.filter(i=>(i.fecha||i.entrada||'')>=_dateFrom);if(_dateTo)d=d.filter(i=>(i.fecha||i.entrada||'').slice(0,10)<=_dateTo);return d;}
function cnt(arr,key){const m={};arr.forEach(i=>{const v=i[key];if(v)m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]);}
function avgT(arr){const t=arr.filter(i=>i.entrada&&i.salida).map(i=>new Date(i.salida)-new Date(i.entrada));return t.length?Math.round(t.reduce((a,b)=>a+b,0)/t.length/60000):0;}
function medT(arr){const t=arr.filter(i=>i.entrada&&i.salida).map(i=>new Date(i.salida)-new Date(i.entrada)).sort((a,b)=>a-b);if(!t.length)return 0;const m=Math.floor(t.length/2);return Math.round((t.length%2?t[m]:(t[m-1]+t[m])/2)/60000);}
function dayH(arr){const m={};arr.forEach(i=>{const d=(i.fecha||i.entrada||'').slice(0,10);if(d)m[d]=(m[d]||0)+1;});return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));}
function hourH(arr){const m={};for(let h=0;h<24;h++)m[String(h).padStart(2,'0')]=0;arr.forEach(i=>{const t=(i.fecha||i.entrada||'').slice(11,13);if(t)m[t]++;});return Object.entries(m);}
function heatD(arr){const m={},days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];for(let d=0;d<7;d++)for(let h=0;h<24;h++)m[`${d}-${h}`]=0;arr.forEach(i=>{const ts=i.fecha||i.entrada||'';if(!ts)return;const dt=new Date(ts);m[`${dt.getDay()}-${dt.getHours()}`]++;});return{m,days};}

function paint(){
  if(!_c)return;
  const c=C(),data=getData(),today=new Date().toISOString().slice(0,10);
  const enR=data.filter(i=>i.estado==='EN_RECINTO'||(!i.salida&&i.entrada)).length;
  const hoy=data.filter(i=>(i.fecha||i.entrada||'').startsWith(today)).length;
  const conS=data.filter(i=>i.salida||i.estado==='SALIDA').length;
  const avg=avgT(data),med=medT(data);
  const byEmp=cnt(data,'empresa'),byTipo=cnt(data,'tipoVehiculo'),byHall=cnt(data,'hall'),byStatus=cnt(data,'estado');
  const byDay=dayH(data),byHour=hourH(data),heat=heatD(data);

  const btn=(id,lbl,cur)=>`<button onclick="window._prec.sub('${id}')" style="padding:4px 12px;border-radius:20px;font-size:11px;font-weight:${cur?'700':'500'};cursor:pointer;border:1.5px solid ${cur?c.blue:c.border};background:${cur?c.bll:c.bg2};color:${cur?c.blue:c.t3}">${lbl}</button>`;
  const sbtn=(id,lbl,cur)=>`<button onclick="window._prec.src('${id}')" style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:${cur?'700':'500'};cursor:pointer;border:1px solid ${cur?c.blue:c.border};background:${cur?c.bll:c.bg2};color:${cur?c.blue:c.t3}">${lbl}</button>`;
  const kpi=(v,l,col,sub)=>`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;text-align:center"><div style="font-size:28px;font-weight:800;color:${col}">${v}</div><div style="font-size:11px;color:${c.t3}">${l}</div>${sub?`<div style="font-size:9px;color:${c.t3};margin-top:2px">${sub}</div>`:''}</div>`;
  const bar=(arr,color)=>{if(!arr.length)return`<div style="text-align:center;padding:8px;color:${c.t3};font-size:11px">Sin datos</div>`;const mx=Math.max(...arr.map(x=>x[1]),1);return arr.slice(0,12).map(([k,v])=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="font-size:10px;min-width:70px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${c.t3}">${safeHtml(k)}</span><div style="flex:1;height:14px;background:${c.bg2};border-radius:3px;overflow:hidden"><div style="height:100%;width:${Math.round(v/mx*100)}%;background:${color};border-radius:3px"></div></div><span style="font-size:10px;font-weight:700;min-width:24px;text-align:right">${v}</span></div>`).join('');};
  const spark=(arr,color)=>{if(arr.length<2)return`<div style="text-align:center;font-size:11px;color:${c.t3}">Datos insuficientes</div>`;const mx=Math.max(...arr.map(x=>x[1]),1),w=300,h=60,step=w/(arr.length-1);const pts=arr.map((x,i)=>`${i*step},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');return`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px"><polygon points="0,${h} ${pts} ${(arr.length-1)*step},${h}" fill="${color}" opacity="0.1"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg><div style="display:flex;justify-content:space-between;font-size:9px;color:${c.t3}"><span>${arr[0][0]}</span><span>${arr[arr.length-1][0]}</span></div>`;};
  const donut=(items,colors)=>{const its=items.filter(x=>x[1]>0);if(!its.length)return`<div style="text-align:center;padding:16px;color:${c.t3};font-size:11px">Sin datos</div>`;const total=its.reduce((a,x)=>a+x[1],0),cls=colors||[c.blue,c.green,c.amber,c.red,c.purple,'#06b6d4','#ec4899','#64748b'];let offset=0;const slices=its.map((e,i)=>{const pct=e[1]/total,dash=pct*251.2,gap=251.2-dash,s=`<circle cx="50" cy="50" r="40" fill="none" stroke="${cls[i%cls.length]}" stroke-width="16" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" opacity=".85"/>`;offset+=dash;return s;});return`<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 100 100" width="100" height="100">${slices.join('')}<text x="50" y="53" text-anchor="middle" font-size="14" font-weight="800" fill="${c.text}">${total}</text></svg><div>${its.slice(0,6).map((e,i)=>`<div style="display:flex;align-items:center;gap:4px;font-size:10px"><span style="width:8px;height:8px;border-radius:50%;background:${cls[i%cls.length]};flex-shrink:0"></span><span style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeHtml(e[0])}</span><b>${e[1]}</b></div>`).join('')}</div></div>`;};
  const heatmap=(d)=>{const{m,days}=d,mx=Math.max(...Object.values(m),1);let h='<div style="display:grid;grid-template-columns:40px repeat(24,1fr);gap:1px;font-size:8px"><div></div>';for(let i=0;i<24;i++)h+=`<div style="text-align:center;color:${c.t3}">${String(i).padStart(2,'0')}</div>`;for(let d=0;d<7;d++){h+=`<div style="display:flex;align-items:center;color:${c.t3};font-weight:600">${days[d]}</div>`;for(let i=0;i<24;i++){const v=m[`${d}-${i}`],op=v>0?Math.max(0.15,v/mx):0.05;h+=`<div title="${days[d]} ${i}:00 → ${v}" style="aspect-ratio:1;border-radius:2px;background:${c.blue};opacity:${op}"></div>`;}}h+='</div>';return h;};

  let h=`<div style="max-width:1200px;margin:0 auto">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-size:22px;font-weight:700;color:${c.text}">📈 Precision Analytics</div><span style="flex:1"></span>
    ${[['executive','📊 Ejecutivo'],['temporal','📅 Temporal'],['dimensional','🏢 Dimensional'],['funnel','🔄 Funnel'],['cohorts','👥 Cohortes']].map(([id,lbl])=>btn(id,lbl,_sub===id)).join('')}
  </div>
  <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    ${[['all','🌐 Todo'],['ref','🔖 Ref'],['ing','🚛 Ing'],['emb','📦 Emb'],['ag','📅 Ag']].map(([v,l])=>sbtn(v,l,_source===v)).join('')}
    <span style="flex:1"></span>
    <input type="date" value="${_dateFrom}" onchange="window._prec.df(this.value)" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};color:${c.t3}">
    <input type="date" value="${_dateTo}" onchange="window._prec.dt(this.value)" style="border:1px solid ${c.border};border-radius:20px;padding:4px 8px;font-size:11px;background:${c.bg2};color:${c.t3}">
    <button onclick="window._prec.xls()" style="padding:4px 12px;border-radius:20px;font-size:11px;border:1px solid ${c.border};background:${c.bg2};color:${c.t3};cursor:pointer">⬇ Excel</button>
  </div>`;

  if(_sub==='executive'){
    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
      ${kpi(data.length,'Total',c.blue)}${kpi(enR,'En recinto',c.green)}${kpi(hoy,'Hoy',c.purple)}${kpi(avg+'<span style="font-size:11px">m</span>','Prom. estancia',c.amber,'Med: '+med+'m')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📈 Tendencia</div>${spark(byDay,c.blue)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🔥 Heatmap</div>${heatmap(heat)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🚗 Tipo vehículo</div>${donut(byTipo.slice(0,8))}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🏢 Top empresas</div>${bar(byEmp.slice(0,10),c.green)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🏟 Halls</div>${bar(byHall.slice(0,8),c.amber)}</div>
    </div>`;
  } else if(_sub==='temporal'){
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;margin-bottom:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📈 Tendencia diaria</div>${spark(byDay,c.blue)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🕐 Por hora</div>${bar(byHour.filter(x=>x[1]>0),c.purple)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🔥 Heatmap</div>${heatmap(heat)}</div>
    </div>`;
  } else if(_sub==='dimensional'){
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🏢 Empresas (top 15)</div>${bar(byEmp.slice(0,15),c.green)}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🏟 Halls</div>${bar(byHall,c.amber)}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🚗 Tipo vehículo</div>${donut(byTipo.slice(0,8))}</div>
      <div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">📊 Estados</div>${donut(byStatus.slice(0,6))}</div>
    </div>`;
  } else if(_sub==='funnel'){
    const tR=(_allData.ref||[]).length,tI=(_allData.ing||[]).length,tIn=data.filter(i=>i.entrada&&!i.salida).length,tOut=conS;
    const stages=[['📋 Referencias',tR],['🚛 Ingresos',tI],['🏟 En recinto',tIn],['✅ Con salida',tOut]];
    const mx=stages[0][1]||1;
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px;margin-bottom:14px"><div style="font-size:12px;font-weight:700;margin-bottom:12px">🔄 Funnel operacional</div>`;
    stages.forEach(([lbl,val],i)=>{const pct=Math.round(val/mx*100),drop=i>0?Math.round((1-val/(stages[i-1][1]||1))*100):0;
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:11px;min-width:100px;color:${c.t3}">${lbl}</span><div style="flex:1;height:24px;background:${c.bg2};border-radius:4px;overflow:hidden;position:relative"><div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${c.blue},${c.purple});border-radius:4px"></div><span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:#fff">${val}</span></div>${i>0?`<span style="font-size:9px;color:${c.red};font-weight:700">-${drop}%</span>`:'<span style="width:36px"></span>'}</div>`;});
    h+='</div>';
  } else if(_sub==='cohorts'){
    const empM=byEmp.slice(0,15).map(([emp,count])=>{const ed=data.filter(i=>i.empresa===emp),at=avgT(ed),exits=ed.filter(i=>i.salida).length,rate=Math.round(exits/(count||1)*100);return{emp,count,at,exits,rate};});
    h+=`<div style="background:${c.card};border:1px solid ${c.border};border-radius:12px;padding:14px"><div style="font-size:12px;font-weight:700;margin-bottom:8px">🏢 Cohorte por empresa</div>`;
    if(empM.length){
      h+=`<div style="max-height:400px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>${['Empresa','Vol.','Prom.','Salidas','%'].map(t=>`<th style="padding:6px 8px;text-align:left;font-size:10px;color:${c.t3};border-bottom:1px solid ${c.border}">${t}</th>`).join('')}</tr></thead><tbody>`;
      empM.forEach(m=>{const rc=m.rate>=80?c.green:m.rate>=50?c.amber:c.red;h+=`<tr style="border-top:1px solid ${c.border}"><td style="padding:5px 8px;max-width:120px;overflow:hidden;text-overflow:ellipsis">${safeHtml(m.emp)}</td><td style="font-weight:700">${m.count}</td><td>${m.at}m</td><td>${m.exits}</td><td><span style="color:${rc};font-weight:700">${m.rate}%</span></td></tr>`;});
      h+='</tbody></table></div>';
    } else h+=`<div style="text-align:center;padding:12px;color:${c.t3}">Sin datos</div>`;
    h+='</div>';
  }
  h+='</div>';
  _c.innerHTML=h;
}

window._prec={
  sub:(s)=>{_sub=s;paint();},src:(s)=>{_source=s;paint();},df:(v)=>{_dateFrom=v;paint();},dt:(v)=>{_dateTo=v;paint();},
  xls:async()=>{try{toast('⬇','#2c5ee8');const X=await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');const d=getData();const ws=X.utils.json_to_sheet(d.map(r=>({Matrícula:r.matricula||'',Empresa:r.empresa||'',Hall:r.hall||'',Estado:r.estado||'',Fecha:r.fecha||r.entrada||''})));const wb=X.utils.book_new();X.utils.book_append_sheet(wb,ws,'Precision');X.writeFile(wb,`precision_${new Date().toISOString().slice(0,10)}.xlsx`);toast('✅','#10b981');}catch(e){toast('❌','#ef4444');}},
};
