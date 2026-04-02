// BeUnifyT v7 — admin.js — Panel completo
import { AppState }    from '../state.js';
import { fsConfig, fsOperators, getDB } from '../firestore.js';
import { toast, safeHtml, uid } from '../utils.js';
import { logout }      from '../auth.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
let _adminTab='eventos';

export async function initAdmin(){
  const user=AppState.get('currentUser');
  if(user.role!=='admin'){toast('Acceso denegado','var(--red)');return;}
  const root=document.getElementById('app-root');
  root.innerHTML=_shell(user);
  _bindAdmin();
  await _loadTab('eventos');
}

function _shell(user){
  return`
<div id="admHdr" style="background:#030812;border-bottom:1px solid #1e293b;padding:0 12px;height:44px;display:flex;align-items:center;gap:6px;position:sticky;top:0;z-index:200">
  <svg viewBox="0 0 140 140" width="22" height="22"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
  <span style="font-size:16px;font-weight:900;color:#e2e8f0">BeUnify<span style="color:#64748b;font-weight:400">T</span></span>
  <span style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;color:#6366f1">Admin Panel</span>
  <span style="flex:1"></span>
  <span style="font-size:13px;color:#94a3b8">${safeHtml(user.email||user.name)}</span>
  <button onclick="window.location.href='/')" style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:#94a3b8;cursor:pointer">← App</button>
  <button id="admLogout" style="background:#1e293b;border:1px solid #334155;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;color:#94a3b8;cursor:pointer">Salir</button>
</div>
<div style="display:flex;align-items:center;gap:2px;padding:2px 8px;background:#f0f2f8;border-bottom:1px solid #e4e7f1;flex-wrap:wrap;justify-content:center;position:sticky;top:44px;z-index:99" id="admTabs">
  ${[['eventos','📅 Eventos'],['recintos','🏢 Recintos'],['operadores','👷 Operadores'],['empresas','🏭 Empresas'],['impresion','🖨 Impresión'],['campos','⚙ Campos'],['blacklist','⛔ Blacklist'],['agenda','📅 Agenda'],['seguridad','🔐 Seguridad']].map(([id,lbl])=>
    `<button class="adm-tab btn-tab${_adminTab===id?' active':''}" data-tab="${id}" onclick="window._admTab('${id}')">${lbl}</button>`
  ).join('')}
</div>
<div class="app-main" id="admContent"></div>`;
}

function _bindAdmin(){
  document.getElementById('admLogout')?.addEventListener('click',logout);
  window._admTab=async function(tab){
    _adminTab=tab;
    document.querySelectorAll('.adm-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    await _loadTab(tab);
  };
}

async function _loadTab(tab){
  const el=document.getElementById('admContent');
  if(!el)return;
  el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text3)">Cargando...</div>`;
  if(tab==='eventos')    await _tabEventos(el);
  else if(tab==='recintos')   await _tabRecintos(el);
  else if(tab==='operadores') await _tabOperadores(el);
  else if(tab==='empresas')   await _tabEmpresas(el);
  else if(tab==='impresion')  { const{initImpresion}=await import('./impresion.js');el.innerHTML='<div id="impWrap"></div>';await initImpresion('impWrap');}
  else if(tab==='campos')     await _tabCampos(el);
  else if(tab==='blacklist')  await _tabBlacklist(el);
  else if(tab==='agenda')     await _tabAgendaAdmin(el);
  else if(tab==='seguridad')  _tabSeguridad(el);
}

// ── EVENTOS ────────────────────────────────────────────────────
async function _tabEventos(el){
  const db=getDB();
  const{collection,getDocs,addDoc,doc,updateDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  const snap=await getDocs(collection(db,'events'));
  const events=snap.docs.map(d=>({id:d.id,...d.data()}));

  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">➕ Nuevo evento</div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre del evento *</span><input id="evNom" placeholder="MWC Barcelona 2027"></div>
    <div class="fg"><span class="flbl">Fecha inicio</span><input id="evIni" type="date"></div>
    <div class="fg"><span class="flbl">Fecha fin</span><input id="evFin" type="date"></div>
    <div class="fg"><span class="flbl">Recinto</span><input id="evRec" placeholder="Fira de Barcelona"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="evCiudad" placeholder="Barcelona"></div>
    <div class="fg s2"><span class="flbl">Halls (separados por coma)</span><input id="evHalls" placeholder="1, 2A, 2B, 3A, 3B, 4, 5, 6, CS"></div>
    <div class="fg s2"><span class="flbl">Puertas (separadas por coma)</span><input id="evPuertas" placeholder="puerta-1, puerta-2, puerta-3"></div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._crearEvento()">✅ Crear evento</button></div>
</div>

<div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px;letter-spacing:.08em">${events.length} eventos</div>
${events.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Nombre</th><th>Recinto</th><th>Ciudad</th><th>Fechas</th><th>Halls</th><th>Estado</th><th>Acc.</th>
</tr></thead><tbody>
${events.map(ev=>`<tr>
  <td><b>${safeHtml(ev.name||ev.nombre||'—')}</b><br><span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${ev.id}</span></td>
  <td style="font-size:12px">${safeHtml(ev.recinto||'—')}</td>
  <td style="font-size:12px">${safeHtml(ev.ciudad||'—')}</td>
  <td style="font-size:11px">${safeHtml(ev.startDate||ev.ini||'—')}${ev.endDate||ev.fin?' → '+(ev.endDate||ev.fin):''}</td>
  <td style="font-size:11px">${(ev.halls||[]).join(', ')||'—'}</td>
  <td><span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;background:${ev.active?'var(--gll)':'var(--bg3)'};color:${ev.active?'var(--green)':'var(--text3)'};border:1px solid ${ev.active?'#bbf7d0':'var(--border)'}">${ev.active?'Activo':'Inactivo'}</span></td>
  <td><div style="display:flex;gap:4px">
    <button class="btn btn-${ev.active?'warning':'success'} btn-xs" onclick="window._toggleEvento('${ev.id}',${!ev.active})">${ev.active?'Desactivar':'Activar'}</button>
    <button class="btn btn-edit btn-xs" onclick="window._editEvento('${ev.id}')">✏️</button>
  </div></td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Sin eventos creados</div></div>`}`;

  window._crearEvento=async function(){
    const nom=(document.getElementById('evNom')?.value||'').trim();
    if(!nom){toast('El nombre es obligatorio','var(--red)');return;}
    const halls=(document.getElementById('evHalls')?.value||'').split(',').map(h=>h.trim()).filter(Boolean);
    const puertas=(document.getElementById('evPuertas')?.value||'').split(',').map(p=>p.trim()).filter(Boolean);
    const btn=document.querySelector('button[onclick*="_crearEvento"]');
    if(btn){btn.disabled=true;btn.textContent='Creando...';}
    try{
      const ref=await addDoc(collection(db,'events'),{name:nom,startDate:document.getElementById('evIni')?.value||'',endDate:document.getElementById('evFin')?.value||'',recinto:document.getElementById('evRec')?.value.trim()||'',ciudad:document.getElementById('evCiudad')?.value.trim()||'',halls,gates:puertas,active:true,createdAt:serverTimestamp()});
      toast(`✅ Evento "${nom}" creado · ID: ${ref.id}`,'var(--green)',5000);
      await _tabEventos(el);
    }catch(err){toast('Error al crear evento','var(--red)');if(btn){btn.disabled=false;btn.textContent='✅ Crear evento';}}
  };
  window._toggleEvento=async function(evId,active){
    await updateDoc(doc(db,'events',evId),{active});
    toast(`Evento ${active?'activado':'desactivado'}`,'var(--blue)',1500);
    await _tabEventos(el);
  };
  window._editEvento=function(evId){toast(`Editar evento ${evId} — próximamente`,'var(--blue)');};
}

// ── RECINTOS ───────────────────────────────────────────────────
async function _tabRecintos(el){
  const db=getDB();
  const{collection,getDocs,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  let recintos=[];
  try{const snap=await getDocs(collection(db,'recintos'));recintos=snap.docs.map(d=>({id:d.id,...d.data()}));}catch{}

  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">➕ Nuevo recinto</div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre del recinto *</span><input id="recNom" placeholder="Fira de Barcelona"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="recCiudad" placeholder="Barcelona"></div>
    <div class="fg"><span class="flbl">País</span><input id="recPais" placeholder="España"></div>
    <div class="fg s2"><span class="flbl">Halls del recinto (separados por coma)</span><input id="recHalls" placeholder="1, 2A, 2B, 3A, 3B, 4, 5, 6, 7, 8, CS"></div>
    <div class="fg s2"><span class="flbl">Puertas habituales</span><input id="recPuertas" placeholder="puerta-1, puerta-2, puerta-norte, puerta-sur"></div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._crearRecinto()">✅ Crear recinto</button></div>
</div>
${recintos.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Recinto</th><th>Ciudad</th><th>País</th><th>Halls</th><th>Puertas</th></tr></thead><tbody>
${recintos.map(r=>`<tr>
  <td><b>${safeHtml(r.nombre||r.name||'—')}</b></td>
  <td>${safeHtml(r.ciudad||'—')}</td><td>${safeHtml(r.pais||'—')}</td>
  <td style="font-size:11px">${(r.halls||[]).join(', ')||'—'}</td>
  <td style="font-size:11px">${(r.puertas||[]).join(', ')||'—'}</td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Sin recintos configurados</div></div>`}`;

  window._crearRecinto=async function(){
    const nom=(document.getElementById('recNom')?.value||'').trim();
    if(!nom){toast('El nombre es obligatorio','var(--red)');return;}
    const halls=(document.getElementById('recHalls')?.value||'').split(',').map(h=>h.trim()).filter(Boolean);
    const puertas=(document.getElementById('recPuertas')?.value||'').split(',').map(p=>p.trim()).filter(Boolean);
    try{
      await addDoc(collection(db,'recintos'),{nombre:nom,ciudad:document.getElementById('recCiudad')?.value.trim()||'',pais:document.getElementById('recPais')?.value.trim()||'',halls,puertas,createdAt:serverTimestamp()});
      toast(`✅ Recinto "${nom}" creado`,'var(--green)');
      await _tabRecintos(el);
    }catch{toast('Error al crear recinto','var(--red)');}
  };
}

// ── OPERADORES ─────────────────────────────────────────────────
async function _tabOperadores(el){
  const db=getDB();
  const{collection,getDocs,doc,setDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  const evSnap=await getDocs(collection(db,'events'));
  const events=evSnap.docs.map(d=>({id:d.id,...d.data()}));
  const activeEv=events.find(e=>e.active)||events[0];
  let ops=[];
  if(activeEv){
    const opSnap=await getDocs(collection(db,'events',activeEv.id,'operators'));
    ops=opSnap.docs.map(d=>({id:d.id,...d.data()}));
  }

  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">➕ Nuevo operador</div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">UID Firebase Auth *</span><input id="opUID" placeholder="UID del usuario (de Authentication)"></div>
    <div class="fg"><span class="flbl">Nombre</span><input id="opNom" placeholder="Carlos García"></div>
    <div class="fg"><span class="flbl">Rol</span><select id="opRol"><option value="operator">Operador</option><option value="supervisor">Supervisor</option><option value="admin">Admin</option></select></div>
    <div class="fg"><span class="flbl">Puerta asignada</span><input id="opPuerta" placeholder="puerta-1"></div>
    <div class="fg"><span class="flbl">Evento</span><select id="opEv">${events.map(e=>`<option value="${e.id}" ${activeEv?.id===e.id?'selected':''}>${safeHtml(e.name||e.id)}</option>`).join('')}</select></div>
    <div class="fg"><span class="flbl">Email (opcional)</span><input id="opEmail" type="email" placeholder="operador@empresa.com"></div>
  </div>
  <div style="border-top:1px solid var(--border);margin-top:10px;padding-top:10px">
    <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px">🔐 Permisos del operador</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px" id="permsGrid">
      ${[['canEdit','Registrar/editar entradas'],['canDelete','Eliminar registros'],['canPrint','Imprimir pases'],['canExport','Exportar Excel'],['canViewAgenda','Ver agenda'],['canEditAgenda','Editar agenda'],['canViewEmbalaje','Ver embalaje'],['canBlacklist','Gestionar blacklist'],['canConfigFields','Configurar campos'],['canClean','Limpiar tab'],['canVaciar','Vaciar datos']].map(([k,lbl])=>`
        <label style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border);cursor:pointer;font-size:12px">
          <input type="checkbox" id="perm_${k}" checked style="width:14px;height:14px;accent-color:var(--blue)">
          <span>${lbl}</span>
        </label>`).join('')}
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._crearOp()">✅ Crear operador</button></div>
</div>
${ops.length?`<div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:6px">${ops.length} operadores · ${safeHtml(activeEv?.name||'—')}</div>
<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>UID</th><th>Nombre</th><th>Rol</th><th>Puerta</th><th>Permisos</th></tr></thead><tbody>
${ops.map(op=>`<tr>
  <td style="font-family:'JetBrains Mono',monospace;font-size:10px">${op.id}</td>
  <td><b>${safeHtml(op.name||'—')}</b></td>
  <td><span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${op.role==='admin'?'var(--pll)':op.role==='supervisor'?'var(--bll)':'var(--bg3)'};color:${op.role==='admin'?'var(--purple)':op.role==='supervisor'?'var(--blue)':'var(--text3)'}">${op.role||'operator'}</span></td>
  <td style="font-size:12px">${safeHtml(op.gateId||'—')}</td>
  <td style="font-size:10px;color:var(--text3)">${Object.entries(op.perms||{}).filter(([k,v])=>v).map(([k])=>k.replace('can','')).join(', ')||'defecto'}</td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Sin operadores en este evento</div></div>`}`;

  window._crearOp=async function(){
    const uid_op=(document.getElementById('opUID')?.value||'').trim();
    if(!uid_op){toast('El UID es obligatorio','var(--red)');return;}
    const evId=document.getElementById('opEv')?.value;
    if(!evId){toast('Selecciona un evento','var(--red)');return;}
    const perms={};
    ['canEdit','canDelete','canPrint','canExport','canViewAgenda','canEditAgenda','canViewEmbalaje','canBlacklist','canConfigFields','canClean','canVaciar'].forEach(k=>{
      perms[k]=document.getElementById(`perm_${k}`)?.checked||false;
    });
    try{
      await setDoc(doc(db,'events',evId,'operators',uid_op),{name:document.getElementById('opNom')?.value.trim()||uid_op,gateId:document.getElementById('opPuerta')?.value.trim()||'puerta-1',role:document.getElementById('opRol')?.value||'operator',email:document.getElementById('opEmail')?.value.trim()||'',perms,eventId:evId,createdAt:serverTimestamp()},{merge:true});
      toast('✅ Operador creado','var(--green)');
      await _tabOperadores(el);
    }catch(err){toast('Error al crear operador','var(--red)');}
  };
}

// ── EMPRESAS ───────────────────────────────────────────────────
async function _tabEmpresas(el){
  const db=getDB();
  const{collection,getDocs,doc,setDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  const evSnap=await getDocs(collection(db,'events'));
  const events=evSnap.docs.map(d=>({id:d.id,...d.data()}));
  const activeEv=events.find(e=>e.active)||events[0];
  let cos=[];
  if(activeEv){
    try{const snap=await getDocs(collection(db,'events',activeEv.id,'companies'));cos=snap.docs.map(d=>({id:d.id,...d.data()}));}catch{}
  }

  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">➕ Nueva empresa</div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">UID Firebase Auth *</span><input id="coUID" placeholder="UID del usuario empresa"></div>
    <div class="fg s2"><span class="flbl">Nombre empresa *</span><input id="coNom" placeholder="Samsung Electronics S.A."></div>
    <div class="fg"><span class="flbl">CIF / VAT</span><input id="coCIF" placeholder="B12345678"></div>
    <div class="fg"><span class="flbl">Email contacto</span><input id="coEmail" type="email" placeholder="logistics@empresa.com"></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="coTel" type="tel" placeholder="+34 600 000 000"></div>
    <div class="fg"><span class="flbl">Evento</span><select id="coEv">${events.map(e=>`<option value="${e.id}" ${activeEv?.id===e.id?'selected':''}>${safeHtml(e.name||e.id)}</option>`).join('')}</select></div>
    <div class="fg"><span class="flbl">Stand / Hall principal</span><input id="coStand" placeholder="Hall 5 · Stand B-200"></div>
  </div>
  <div class="ffoot"><button class="btn btn-p" onclick="window._crearEmpresa()">✅ Crear empresa</button></div>
</div>
${cos.length?`<div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:6px">${cos.length} empresas · ${safeHtml(activeEv?.name||'—')}</div>
<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>UID</th><th>Nombre</th><th>CIF</th><th>Email</th><th>Stand</th></tr></thead><tbody>
${cos.map(co=>`<tr>
  <td style="font-family:'JetBrains Mono',monospace;font-size:10px">${co.id}</td>
  <td><b>${safeHtml(co.nombre||co.name||'—')}</b></td>
  <td style="font-size:11px">${safeHtml(co.cif||'—')}</td>
  <td style="font-size:11px">${safeHtml(co.email||'—')}</td>
  <td style="font-size:11px">${safeHtml(co.stand||'—')}</td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Sin empresas en este evento</div></div>`}`;

  window._crearEmpresa=async function(){
    const uid_co=(document.getElementById('coUID')?.value||'').trim();
    const nom=(document.getElementById('coNom')?.value||'').trim();
    if(!uid_co||!nom){toast('UID y nombre son obligatorios','var(--red)');return;}
    const evId=document.getElementById('coEv')?.value;
    try{
      await setDoc(doc(db,'events',evId,'companies',uid_co),{nombre:nom,cif:document.getElementById('coCIF')?.value.trim()||'',email:document.getElementById('coEmail')?.value.trim()||'',tel:document.getElementById('coTel')?.value.trim()||'',stand:document.getElementById('coStand')?.value.trim()||'',active:true,createdAt:serverTimestamp()},{merge:true});
      toast(`✅ Empresa "${nom}" creada`,'var(--green)');
      await _tabEmpresas(el);
    }catch{toast('Error al crear empresa','var(--red)');}
  };
}

// ── CAMPOS POR EVENTO ──────────────────────────────────────────
async function _tabCampos(el){
  const db=getDB();
  const{collection,getDocs,doc,setDoc}=await import(`${FB}/firebase-firestore.js`);
  const evSnap=await getDocs(collection(db,'events'));
  const events=evSnap.docs.map(d=>({id:d.id,...d.data()}));
  const activeEv=events.find(e=>e.active)||events[0];
  let cfgFields={};
  if(activeEv){
    try{const snap=await (await import(`${FB}/firebase-firestore.js`)).getDoc(doc(db,'events',activeEv.id,'config','fields'));if(snap.exists())cfgFields=snap.data();}catch{}
  }

  const TODOS=[['ingresos','🚛 Ingresos'],[  'referencia','📋 Referencia']];
  const CAMPOS_ING=['remolque','tipoVeh','descarga','llamador','empresa','montador','expositor','hall','stand','nombre','apellido','telefono','idioma','comentario','pasaporte','fechaNac','pais'];
  const CAMPOS_REF=['remolque','numEjes','tipoMaq','empresa','hall','stand','llamador','nombre','apellido','telefono','idioma','comentario','pasaporte','fechaNac'];
  const NOMBRES={remolque:'Remolque',tipoVeh:'Tipo vehículo',descarga:'Tipo descarga',llamador:'Llamador',empresa:'Empresa',montador:'Montador',expositor:'Expositor',hall:'Hall',stand:'Stand',nombre:'Nombre conductor',apellido:'Apellido',telefono:'Teléfono',idioma:'Idioma conductor',comentario:'Comentario',pasaporte:'Pasaporte/DNI',fechaNac:'Fecha nacimiento',pais:'País',numEjes:'Nº ejes',tipoMaq:'Tipo maquinaria'};

  el.innerHTML=`
<div style="margin-bottom:10px">
  <span style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3)">Evento: </span>
  <select id="cfgEvSel" onchange="window._reloadCfgCampos(this.value)" style="width:auto;display:inline-block;padding:4px 10px;font-size:13px">
    ${events.map(e=>`<option value="${e.id}" ${activeEv?.id===e.id?'selected':''}>${safeHtml(e.name||e.id)}</option>`).join('')}
  </select>
</div>

${TODOS.map(([tab,tabLbl])=>`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">${tabLbl} — campos visibles</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px">
    ${(tab==='ingresos'?CAMPOS_ING:CAMPOS_REF).map(k=>{
      const v=cfgFields[tab]?.[k]||{vis:true,req:false};
      return`<div style="padding:8px 10px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border)">
        <div style="font-size:12px;font-weight:600;margin-bottom:4px">${NOMBRES[k]||k}</div>
        <div style="display:flex;gap:6px">
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer">
            <input type="checkbox" ${v.vis!==false?'checked':''} id="vis_${tab}_${k}" style="width:13px;height:13px;accent-color:var(--blue)"> Visible
          </label>
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer">
            <input type="checkbox" ${v.req?'checked':''} id="req_${tab}_${k}" style="width:13px;height:13px;accent-color:var(--red)"> Obligatorio
          </label>
        </div>
      </div>`;
    }).join('')}
  </div>
</div>`).join('')}

<div class="ffoot">
  <button class="btn btn-p" onclick="window._guardarCampos()">💾 Guardar configuración de campos</button>
</div>`;

  window._guardarCampos=async function(){
    const evId=document.getElementById('cfgEvSel')?.value;
    if(!evId){toast('Selecciona un evento','var(--red)');return;}
    const cfg={};
    TODOS.forEach(([tab])=>{
      cfg[tab]={};
      (tab==='ingresos'?CAMPOS_ING:CAMPOS_REF).forEach(k=>{
        cfg[tab][k]={vis:document.getElementById(`vis_${tab}_${k}`)?.checked!==false,req:document.getElementById(`req_${tab}_${k}`)?.checked||false};
      });
    });
    try{
      await setDoc(doc(db,'events',evId,'config','fields'),cfg,{merge:true});
      toast('✅ Configuración guardada — operadores la verán al recargar','var(--green)');
    }catch{toast('Error al guardar','var(--red)');}
  };
  window._reloadCfgCampos=(evId)=>{_tabCampos(el);};
}

// ── BLACKLIST ──────────────────────────────────────────────────
async function _tabBlacklist(el){
  const db=getDB();
  const{collection,getDocs,addDoc,doc,deleteDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  const evSnap=await getDocs(collection(db,'events'));
  const events=evSnap.docs.map(d=>({id:d.id,...d.data()}));
  const activeEv=events.find(e=>e.active)||events[0];
  let items=[];
  if(activeEv){
    try{const snap=await getDocs(collection(db,'events',activeEv.id,'blacklist'));items=snap.docs.map(d=>({id:d.id,...d.data()}));}catch{}
  }

  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px;letter-spacing:.08em">⛔ Añadir a lista negra</div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula *</span><input id="blMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;font-size:15px" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nivel</span><select id="blNivel"><option value="informativo">ℹ️ Informativo</option><option value="ALERTA" selected>⚠️ Alerta</option><option value="BLOQUEO">⛔ Bloqueo total</option></select></div>
    <div class="fg s2"><span class="flbl">Motivo</span><input id="blMotivo" placeholder="Razón del bloqueo..."></div>
    <div class="fg"><span class="flbl">Evento</span><select id="blEv">${events.map(e=>`<option value="${e.id}" ${activeEv?.id===e.id?'selected':''}>${safeHtml(e.name||e.id)}</option>`).join('')}</select></div>
  </div>
  <div class="ffoot"><button class="btn" style="background:var(--red);color:#fff" onclick="window._addBL()">⛔ Añadir</button></div>
</div>
${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Nivel</th><th>Motivo</th><th>Creado por</th><th>Acc.</th></tr></thead><tbody>
${items.map(i=>`<tr>
  <td><span style="background:#0f172a;color:#f7f8fc;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 8px;border-radius:5px">${safeHtml(i.matricula||'—')}</span></td>
  <td><span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;background:${i.nivel==='BLOQUEO'?'var(--rll)':'var(--all)'};color:${i.nivel==='BLOQUEO'?'var(--red)':'var(--amber)'}">${i.nivel||'ALERTA'}</span></td>
  <td style="font-size:12px">${safeHtml(i.motivo||'—')}</td>
  <td style="font-size:11px">${safeHtml(i.creadoPor||'—')}</td>
  <td><button class="btn btn-danger btn-xs" onclick="window._delBL('${i.id}','${activeEv?.id||''}')">🗑</button></td>
</tr>`).join('')}
</tbody></table></div>`:`<div class="empty"><div class="et">Lista negra vacía</div></div>`}`;

  window._addBL=async function(){
    const mat=(document.getElementById('blMat')?.value||'').trim().toUpperCase();
    if(!mat){toast('La matrícula es obligatoria','var(--red)');return;}
    const evId=document.getElementById('blEv')?.value;
    const user=AppState.get('currentUser');
    try{
      await addDoc(collection(db,'events',evId,'blacklist'),{matricula:mat,nivel:document.getElementById('blNivel')?.value||'ALERTA',motivo:document.getElementById('blMotivo')?.value.trim()||'',creadoPor:user.name,ts:serverTimestamp()});
      toast(`⛔ ${mat} añadida a blacklist`,'var(--red)');
      await _tabBlacklist(el);
    }catch{toast('Error','var(--red)');}
  };
  window._delBL=async function(docId,evId){
    if(!confirm('¿Eliminar de la blacklist?'))return;
    await deleteDoc(doc(db,'events',evId,'blacklist',docId));
    toast('Eliminada de blacklist','var(--amber)');
    await _tabBlacklist(el);
  };
}

// ── AGENDA ADMIN ───────────────────────────────────────────────
async function _tabAgendaAdmin(el){
  const db=getDB();
  const{collection,getDocs,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
  const evSnap=await getDocs(collection(db,'events'));
  const events=evSnap.docs.map(d=>({id:d.id,...d.data()}));
  const activeEv=events.find(e=>e.active)||events[0];
  let items=[];
  if(activeEv){
    try{const snap=await getDocs(collection(db,'events',activeEv.id,'agenda'));items=snap.docs.map(d=>({id:d.id,...d.data()}));}catch{}
  }

  el.innerHTML=`
<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
  <span style="font-size:13px;font-weight:700">📅 Agenda — ${safeHtml(activeEv?.name||'—')}</span>
  <span style="flex:1"></span>
  <label class="btn btn-s btn-sm" style="cursor:pointer">📥 Importar Excel<input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="window._importAgenda(this,document.getElementById('agAdmEv').value)"></label>
  <button class="btn btn-gh btn-sm" onclick="window._dlPlantillaAg()">📋 Plantilla</button>
  ${items.length?`<button class="btn btn-gh btn-sm" onclick="window._exportAgenda()">⬇ Excel</button>`:''}
  <select id="agAdmEv" style="width:auto;padding:4px 10px;font-size:13px">${events.map(e=>`<option value="${e.id}" ${activeEv?.id===e.id?'selected':''}>${safeHtml(e.name||e.id)}</option>`).join('')}</select>
</div>
<div style="font-size:10px;color:var(--text3);margin-bottom:8px">${items.length} servicios · Pendientes: ${items.filter(i=>!i.matricula&&i.estado!=='completado').length} · Vinculados: ${items.filter(i=>i.matricula).length}</div>
${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
  <th>Referencia</th><th>Empresa</th><th>Hall/Stand</th><th>Fecha</th><th>Hora</th><th>Matrícula</th><th>Estado</th><th>Notas</th>
</tr></thead><tbody>
${items.slice(0,100).map(i=>`<tr>
  <td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--amber)">${safeHtml(i.referencia||'—')}</td>
  <td><b style="font-size:12px">${safeHtml(i.empresa||'—')}</b></td>
  <td style="font-size:11px">${safeHtml(i.hall||'')} ${safeHtml(i.stand||'')}</td>
  <td style="font-size:11px">${safeHtml(i.fecha||'—')}</td>
  <td style="font-size:11px">${safeHtml(i.hora||'—')}</td>
  <td>${i.matricula?`<span style="background:#0f172a;color:#f7f8fc;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px">${safeHtml(i.matricula)}</span>`:'<span style="color:var(--text4);font-size:11px">sin mat.</span>'}</td>
  <td><span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;background:${i.estado==='completado'?'var(--bg3)':i.matricula?'var(--bll)':'var(--all)'};color:${i.estado==='completado'?'var(--text3)':i.matricula?'var(--blue)':'var(--amber)'}">${i.estado==='completado'?'Completado':i.matricula?'Vinculado':'Pendiente'}</span></td>
  <td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis">${safeHtml(i.notas||'—')}</td>
</tr>`).join('')}
${items.length>100?`<tr><td colspan="8" style="text-align:center;padding:10px;color:var(--text3);font-size:12px">Mostrando 100 de ${items.length} servicios</td></tr>`:''}
</tbody></table></div>`:`<div class="empty"><div class="ei">📅</div><div class="et">Sin servicios en agenda</div><div style="font-size:12px;margin-top:6px">Importa un Excel o añade servicios manualmente</div></div>`}`;

  window._importAgenda=async function(input,evId){
    if(!window.XLSX){
      await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    }
    const file=input.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=async(e)=>{
      try{
        const wb=window.XLSX.read(e.target.result,{type:'binary'});
        const rows=window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false});
        let added=0;
        const{collection,addDoc,serverTimestamp:sts}=await import(`${FB}/firebase-firestore.js`);
        const col=collection(db,'events',evId,'agenda');
        for(const row of rows){
          const ref=String(row['Referencia']||row['referencia']||row['REF']||'').trim().toUpperCase();
          if(!ref)continue;
          await addDoc(col,{referencia:ref,empresa:String(row['Empresa']||row['empresa']||'').trim().toUpperCase(),fecha:String(row['Fecha']||row['fecha']||'').trim(),hora:String(row['Hora']||row['hora']||'').trim(),hall:String(row['Hall']||row['hall']||'').trim().toUpperCase(),stand:String(row['Stand']||row['stand']||'').trim().toUpperCase(),matricula:String(row['Matricula']||row['Matrícula']||row['matricula']||'').trim().toUpperCase()||'',conductor:String(row['Conductor']||row['conductor']||'').trim(),tel:String(row['Telefono']||row['telefono']||'').trim(),notas:String(row['Notas']||row['notas']||'').trim(),estado:'PENDIENTE',importadoTs:sts()});
          added++;
        }
        toast(`✅ ${added} servicios importados`,'var(--green)');
        await _tabAgendaAdmin(el);
      }catch(err){toast('Error al importar: '+err.message,'var(--red)');}
      input.value='';
    };
    reader.readAsBinaryString(file);
  };

  window._dlPlantillaAg=function(){
    if(!window.XLSX){toast('Cargando librería...','var(--blue)');return;}
    const wb=window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet([{Referencia:'REF-001234',Empresa:'EMPRESA DEMO',Fecha:'2027-02-26',Hora:'09:00',Hall:'5',Stand:'B-200',Matricula:'AB1234CD',Conductor:'Juan García',Telefono:'+34600000000',Notas:'Servicio forklift'}]),'Agenda');
    window.XLSX.writeFile(wb,'plantilla_agenda_beunifyt.xlsx');
  };

  window._exportAgenda=async function(){
    if(!window.XLSX){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    const wb=window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(items.map(i=>({Referencia:i.referencia||'',Empresa:i.empresa||'',Fecha:i.fecha||'',Hora:i.hora||'',Hall:i.hall||'',Stand:i.stand||'',Matricula:i.matricula||'',Estado:i.estado||'PENDIENTE',Notas:i.notas||''}))),activeEv?.name||'Agenda');
    window.XLSX.writeFile(wb,`agenda_${activeEv?.name||'beunifyt'}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
}

// ── SEGURIDAD ──────────────────────────────────────────────────
function _tabSeguridad(el){
  el.innerHTML=`
<div class="card" style="margin-bottom:12px">
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:10px">🔐 Estado de Firebase Security Rules</div>
  <div style="background:var(--all);border:1.5px solid #fde68a;border-radius:var(--r);padding:10px 12px;margin-bottom:10px;font-size:13px;color:var(--amber)">
    ⚠️ Las reglas actuales permiten acceso a cualquier usuario autenticado. Aplica las reglas estrictas antes de dar acceso a clientes reales.
  </div>
  <div style="font-size:13px;margin-bottom:12px;line-height:1.7">Las reglas de seguridad controlan quién puede leer y escribir cada colección. Cuando estés listo, aplica estas reglas en <b>Firebase Console → Firestore → Reglas</b>.</div>
  <button class="btn btn-p" onclick="window._copiarRules()">📋 Copiar reglas al portapapeles</button>
  <button class="btn btn-gh btn-sm" style="margin-left:8px" onclick="window.open('https://console.firebase.google.com','_blank')">Abrir Firebase Console →</button>
</div>
<div class="card">
  <div style="font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);margin-bottom:8px">Reglas recomendadas</div>
  <pre style="background:var(--bg3);border-radius:var(--r);padding:12px;font-size:11px;font-family:'JetBrains Mono',monospace;overflow-x:auto;color:var(--text);line-height:1.6">${RULES_TEXT}</pre>
</div>`;

  window._copiarRules=function(){
    navigator.clipboard.writeText(RULES_TEXT).then(()=>toast('✅ Reglas copiadas al portapapeles','var(--green)')).catch(()=>toast('Selecciona el texto manualmente','var(--amber)'));
  };
}

const RULES_TEXT=`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() { return request.auth != null; }
    function isAdminOf(evId) {
      return isAuth() && exists(/databases/$(database)/documents/events/$(evId)/operators/$(request.auth.uid))
        && get(/databases/$(database)/documents/events/$(evId)/operators/$(request.auth.uid)).data.role == 'admin';
    }
    function isOperatorOf(evId) {
      return isAuth() && exists(/databases/$(database)/documents/events/$(evId)/operators/$(request.auth.uid));
    }

    match /events/{evId} {
      allow read: if isAuth();
      allow create, update, delete: if isAdminOf(evId);
      match /operators/{uid} {
        allow read: if isAuth() && (isAdminOf(evId) || request.auth.uid == uid);
        allow write: if isAdminOf(evId);
      }
      match /companies/{coId} {
        allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId) || request.auth.uid == coId);
        allow create: if isAdminOf(evId);
        allow update: if isAdminOf(evId) || request.auth.uid == coId;
        allow delete: if isAdminOf(evId);
        match /vehicles/{vId} {
          allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId) || request.auth.uid == coId);
          allow write: if request.auth.uid == coId;
        }
        match /entries/{eId} {
          allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId) || request.auth.uid == coId);
          allow create: if isOperatorOf(evId) || isAdminOf(evId);
          allow update, delete: if isAdminOf(evId);
        }
      }
      match /gates/{gateId} {
        allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId));
        allow write: if isAdminOf(evId) || isOperatorOf(evId);
        match /queue/{entryId} {
          allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId));
          allow create, update: if isOperatorOf(evId) || isAdminOf(evId);
          allow delete: if isAdminOf(evId);
        }
      }
      match /agenda/{id} {
        allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId));
        allow write: if isAdminOf(evId);
      }
      match /blacklist/{id} {
        allow read: if isAuth() && (isAdminOf(evId) || isOperatorOf(evId));
        allow write: if isAdminOf(evId);
      }
      match /mensajes/{canal}/msgs/{msgId} {
        allow read: if isAuth() && isOperatorOf(evId);
        allow create: if isAuth() && isOperatorOf(evId);
        allow update, delete: if isAdminOf(evId);
      }
      match /config/{cfgId} {
        allow read: if isAuth();
        allow write: if isAdminOf(evId);
      }
    }
    match /recintos/{rId} {
      allow read: if isAuth();
      allow write: if request.auth.token.superadmin == true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;
