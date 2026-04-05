// BeUnifyT v8 — core/modals.js
// Injects modal HTML into #modalContainer after shell renders.
// Extracted from INDEX.html (V6) — static modal overlays.

export function injectModals() {
  const mc = document.getElementById('modalContainer');
  if (!mc) return;
  mc.innerHTML = `<div class="ov" id="mIng"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mIngTitle">Nuevo Ingreso</div><button class="btn-x" onclick="closeOv('mIng')">✕</button></div>
  <div id="fiEventoBar" style="display:none;background:var(--gll);border:1.5px solid #bbf7d0;border-radius:var(--r);padding:6px 10px;margin-bottom:8px;font-size:11px;display:flex;align-items:center;gap:8px;flex-wrap:wrap"></div>
  <div id="fiEventoSel" style="display:none;margin-bottom:8px">
    <span class="flbl">📅 Evento</span>
    <select id="fiEventoId" onchange="onFormEventoChange()" style="font-weight:700;margin-top:3px">
      <option value="">— Sin evento —</option>
    </select>
  </div>
  <div class="fgrid" id="ingFormBody">
    <div class="fg"><span class="flbl">Nº Posición</span><input id="fiPos" type="number" min="1" placeholder="Auto" style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px"></div>
    <div class="fg s2"><span class="flbl">Matrícula <span class="freq">*</span></span>
      <div style="display:flex;gap:4px;position:relative">
        <div style="position:relative;flex:1">
          <input id="fiMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase;padding-right:32px" oninput="this.value=this.value.toUpperCase();checkMatOnInput(this.value);searchMatUnified(this.value)" onfocus="searchMatUnified(this.value)" onblur="setTimeout(()=>document.getElementById('fiMatResults').classList.remove('open'),200)" placeholder="🔍 Matrícula, nombre o empresa..." autocomplete="off">
          <span id="fiMatClearBtn" onclick="clearMatField()" style="display:none;position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:14px;color:var(--text3)">✕</span>
          <div class="dr" id="fiMatResults"></div>
        </div>
        <button class="btn btn-t btn-sm" onclick="openCamModal()" title="OCR Cámara">📷</button>
      </div>
      <div id="fiMatTag" style="display:none;margin-top:4px;align-items:center;gap:6px;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:4px 8px;font-size:11px">
        <span id="fiMatTagIcon">👤</span>
        <span id="fiMatTagName" style="font-weight:700;flex:1"></span>
        <button id="fiMatTagSave" onclick="saveMatAsChofer()" title="Guardar como conductor frecuente" style="display:none;background:#16a34a;color:#fff;border:none;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap">＋ Conductor</button>
        <button onclick="clearMatField()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0;line-height:1">✕</button>
      </div>
    </div>
    <div class="fg" id="fg-remolque"><span class="flbl" id="lbl-remolque">Remolque</span><input id="fiRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-tipoVeh"><span class="flbl">Tipo vehículo</span><div style="display:flex;gap:4px" id="tipoVehBtns"><button type="button" class="btn btn-sm btn-gh" id="tvTrailer" onclick="setToggle('fiTipoVeh','trailer')" style="flex:1">🚛 Trailer</button><button type="button" class="btn btn-sm btn-gh" id="tvB" onclick="setToggle('fiTipoVeh','semiremolque')" style="flex:1">🚚 B</button><button type="button" class="btn btn-sm btn-gh" id="tvA" onclick="setToggle('fiTipoVeh','camion')" style="flex:1">🚗 A</button></div><input type="hidden" id="fiTipoVeh"></div>
    <div class="fg" id="fg-descarga"><span class="flbl">Servicio Descarga/Carga</span><div style="display:flex;gap:4px"><button type="button" class="btn btn-sm btn-gh" id="dcHand" onclick="setToggle('fiDescarga','mano')" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-sm btn-gh" id="dcFork" onclick="setToggle('fiDescarga','maquinaria')" style="flex:1">🏗 Forklift</button></div><input type="hidden" id="fiDescarga"></div>
    <input type="hidden" id="fiChoferSearch">
    <div class="fg" id="fg-llamador"><span class="flbl" id="lbl-llamador">Llamador</span><input id="fiLlamador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-ref"><span class="flbl" id="lbl-ref">Referencia / Booking</span><div style="position:relative"><input id="fiRef" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase();searchRefAutoComplete(this.value)" autocomplete="off"><div class="dr" id="fiRefResults"></div></div></div>
    <div class="fg" id="fg-empresa"><span class="flbl" id="lbl-empresa">Empresa</span><input id="fiEmp" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-montador"><span class="flbl" id="lbl-montador">Montador</span><input id="fiMontador" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-expositor"><span class="flbl" id="lbl-expositor">Expositor</span><input id="fiExpositor" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <div class="fg"><span class="flbl" id="lbl-hall">Hall</span><div style="position:relative"><input id="fiHallInput" placeholder="2A, 3B..." oninput="filterHallSuggestions(this.value)" autocomplete="off" style="font-weight:700"><div class="dr" id="fiHallResults"></div></div><div id="fiHallTags" style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px"></div><input type="hidden" id="fiHall"></div>
      <div class="fg"><span class="flbl">Stand</span><input id="fiStand" style="font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg" id="fg-puertaHall"><span class="flbl">Puerta Hall</span><input id="fiPuertaHall" placeholder="Puerta del hall" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg" id="fg-acceso"><span class="flbl">Acceso</span><select id="fiPuerta"><option value="">--</option></select></div>
    </div>
    <!-- SEPARADOR DATOS PERSONALES -->
    <div style="grid-column:1/-1;border-top:2px solid var(--border2);margin:4px 0;padding-top:8px"><span style="font-size:11px;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:1px">👤 Datos del conductor</span></div>
    <div class="fg" id="fg-nombre"><span class="flbl" id="lbl-nombre">Nombre</span><input id="fiNom" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-apellido"><span class="flbl" id="lbl-apellido">Apellido</span><input id="fiApe" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg" id="fg-pasaporte"><span class="flbl" id="lbl-pasaporte">Pasaporte / DNI</span><input id="fiPas"></div>
    <div class="fg" id="fg-fechaNac"><span class="flbl">Fecha Nacimiento</span><input id="fiFechaNac" type="date"></div>
    <div class="fg" id="fg-fechaExp"><span class="flbl">Fecha Expiración Doc.</span><input id="fiFechaExp" type="date"></div>
    <div class="fg" id="fg-pais"><span class="flbl">País</span><input id="fiPais" placeholder="España, Polonia, Italia..."></div>
    <div class="fg" id="fg-telefono"><span class="flbl" id="lbl-tel">Teléfono</span><div style="display:flex;gap:4px"><input id="fiTelP" list="dlTelP" style="width:auto;flex-shrink:0;min-width:90px;max-width:110px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34 ✏"><datalist id="dlTelP"></datalist><input id="fiTel" type="tel"></div></div>
    <div class="fg" id="fg-email"><span class="flbl" id="lbl-email">Email</span><input id="fiEmail" type="email"></div>
    <div class="fg"><span class="flbl">Idioma ficha</span><select id="fiLang" onchange="updatePhrasePreview()"></select></div>
    <div id="fiPhraseWrap" style="display:none;grid-column:1/-1;background:#fffbeb;border:1.5px solid #f59e0b;border-radius:var(--r);padding:8px 12px">
      <div id="fiPhraseUserLine" style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:4px"></div>
      <div id="fiPhraseDriverLine" style="display:none;border-top:1px dashed #fde68a;padding-top:4px;font-size:13px;font-weight:700;color:#b45309"></div>
    </div>
    <div id="fiPhrase2Wrap" style="display:none;grid-column:1/-1;background:#f0f9ff;border:1.5px solid #93c5fd;border-radius:var(--r);padding:8px 12px">
      <div style="font-size:10px;font-weight:700;color:#1d4ed8;margin-bottom:4px">📝 Frase 2 (zona recortable)</div>
      <div id="fiPhrase2Line" style="font-size:12px;font-weight:600;color:#1e40af"></div>
    </div>
    <div class="fg s2" id="fg-comentario"><span class="flbl" id="lbl-comentario">Comentario</span><textarea id="fiComent" rows="2"></textarea></div>
    <select id="fiCarga" style="display:none"><option value="">--</option></select>
    <input type="hidden" id="fiRegRXL"><input type="hidden" id="fiSOT">
  </div>
  <div id="fiHistorial" style="display:none;margin-top:10px;padding:10px;background:var(--bll);border-radius:var(--r);border:1.5px solid #bfdbfe"><div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:6px">📋 Historial — clic para autorellenar</div><div id="fiHistList"></div></div>
  <div id="fiBlkWarn" style="display:none;margin-top:10px;padding:10px;border-radius:var(--r);border:2px solid var(--red)"><div id="fiBlkMsg" style="font-weight:800;font-size:13px"></div><div id="fiBlkDet" style="font-size:11px;margin-top:3px"></div></div>
  <div id="fiEspMatch" style="display:none;margin-top:10px;padding:10px;background:var(--gll);border-radius:var(--r);border:1.5px solid #bbf7d0"><div style="font-size:11px;font-weight:700;color:var(--green)">⏳ En lista de espera:</div><div id="fiEspDet" style="font-size:12px;margin-top:3px"></div></div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mIng')">Cancelar</button><button class="btn btn-t btn-sm" id="btnNormalA4Form" onclick="imprimirYGuardarConTpl('normal')">🖨 Normal</button><button class="btn btn-sm" id="btnTroquelA4Form" style="background:#7c3aed;color:#fff" onclick="imprimirYGuardarConTpl('troquel')">✂ Troquelado</button><button class="btn btn-p" id="btnIngLbl" onclick="saveIngreso()">Registrar entrada</button></div>
  <input type="hidden" id="fiId">
</div></div>
<!-- MODAL AGENDA -->
<div class="ov" id="mAg"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mAgTitle">Nueva Cita</div><button class="btn-x" onclick="closeOv('mAg')">✕</button></div>
  <div style="background:var(--bg3);border-radius:var(--r);padding:7px 12px;margin-bottom:10px;font-size:11px;color:var(--text3)">💡 Busca un chofer preregistrado para autocompletar o rellena manualmente</div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Fecha <span class="freq">*</span></span><input id="agFecha" type="date"></div>
    <div class="fg"><span class="flbl">Hora planificada <span class="freq">*</span></span><input id="agHora" type="time"></div>
    <div class="fg s2" id="agEvWrap"><span class="flbl">Evento</span><select id="agEvento" onchange="onAgEventoChange()" style="font-weight:700"><option value="">— Sin evento —</option></select></div>
    <div class="fg"><span class="flbl">Chofer preregistrado</span><div style="position:relative"><input id="agChoferSearch" placeholder="🔍 Buscar chofer..." oninput="searchChoferAg(this.value)" autocomplete="off"><div class="dr" id="agChoferResults"></div></div></div>
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="agMat" style="font-family:'JetBrains Mono',monospace;font-weight:700;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque</span><input id="agRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Tipo vehículo</span><select id="agTipoV"><option value="">--</option><option value="camion">🚛 Camión</option><option value="semiremolque">🚚 Semirremolque</option><option value="furgoneta">🚐 Furgoneta</option><option value="trailer">🚛 Trailer</option><option value="coche">🚗 Coche</option><option value="otro">📦 Otro</option></select></div>
    <div class="fg"><span class="flbl">Servicio Descarga/Carga</span><div style="display:flex;gap:4px"><button type="button" class="btn btn-sm btn-gh" id="agDcHand" onclick="setAgDescarga('mano')" style="flex:1">🤾 Handball</button><button type="button" class="btn btn-sm btn-gh" id="agDcFork" onclick="setAgDescarga('maquinaria')" style="flex:1">🏗 Forklift</button></div><input type="hidden" id="agDescarga"></div>
    <div class="fg"><span class="flbl">Conductor</span><input id="agCond"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="agEmp"></div>
    <div class="fg"><span class="flbl">Referencia</span><input id="agRef" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Montador</span><input id="agMontador"></div>
    <div class="fg"><span class="flbl">Expositor</span><input id="agExpositor"></div>
    <div class="fg"><span class="flbl">Hall</span><select id="agHall"><option value="">--</option></select></div>
    <div class="fg"><span class="flbl">Stand</span><input id="agStand"></div>

    <div class="fg"><span class="flbl">Puerta Hall</span><input id="agPuertaHall" placeholder="Puerta del pabellón"></div>
    <div class="fg"><span class="flbl">Acceso</span><input id="agPuerta"></div>
    <div class="fg"><span class="flbl">Pase</span><select id="agPase"><option value="">--</option><option value="temporal">🎫 Temporal</option><option value="evento">📋 Evento</option><option value="vip">⭐ VIP</option><option value="staff">🔧 Staff</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="agTel" type="tel"></div>
    <div class="fg"><span class="flbl">GPS URL</span><input id="agGps" placeholder="https://..."></div>
    <div class="fg"><span class="flbl">Tipo carga</span><select id="agCarga"><option value="">--</option><option value="EF">🔴 EF</option><option value="SUNDAY">🟣 SUNDAY</option><option value="PRIORITY">🟠 PRIORITY</option><option value="GOODS">🟢 GOODS</option><option value="EMPTY">⚪ EMPTY</option></select></div>
    <div class="fg"><span class="flbl">Gasto/Pago</span><select id="agGastoTipo"><option value="">--</option><option value="tarjeta">💳 Tarjeta</option><option value="efectivo">💵 Efectivo</option><option value="ambos">💳💵 Mixto</option></select></div>
    <div class="fg"><span class="flbl">Importe gasto</span><input id="agGastoImporte" type="number" step="0.01"></div>
    <div class="fg"><span class="flbl">Estado</span><select id="agEstado"><option value="PENDIENTE">⏳ Pendiente</option><option value="LLEGADO">✅ Llegado</option><option value="SALIDA">🔵 Salida</option></select></div>
    <div class="fg s2"><span class="flbl">Requisitos extras</span><div style="display:flex;gap:5px;margin-bottom:6px"><input id="agReqInput" placeholder="Añadir requisito..." style="flex:1"><button class="btn btn-s btn-sm" onclick="addReqAg()">+</button></div><div id="agReqsList" style="display:flex;flex-wrap:wrap;gap:4px"></div></div>
    <div class="fg s2" style="grid-column:1/-1;border-top:1.5px solid var(--border);margin-top:4px;padding-top:10px"><div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--text3);margin-bottom:6px">🪪 Documentación del conductor</div><div class="fgrid"><div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="agPas" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div><div class="fg"><span class="flbl">País / Nacionalidad</span><input id="agPais" placeholder="España, Polonia..."></div><div class="fg"><span class="flbl">Fecha Nacimiento</span><input id="agFechaNac" type="date"></div><div class="fg"><span class="flbl">Fecha Expiración Doc.</span><input id="agFechaExp" type="date"></div></div></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="agNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mAg')">Cancelar</button><button class="btn btn-p" id="btnAgLbl" onclick="saveAgenda()">Añadir cita</button></div>
  <input type="hidden" id="agId">
</div></div>
<!-- MODAL CONDUCTOR -->
<div class="ov" id="mCond"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mCondTitle">Nuevo Conductor</div><button class="btn-x" onclick="closeOv('mCond')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Nombre <span class="freq">*</span></span><input id="fcNom"></div>
    <div class="fg"><span class="flbl">Apellido <span class="freq">*</span></span><input id="fcApe"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="fcEmp"></div>
    <div class="fg"><span class="flbl">Matrícula habitual</span><input id="fcMat" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque habitual</span><input id="fcRem" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Hall habitual</span><select id="fcHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><div style="display:flex;gap:4px"><input id="fcTelP" list="dlTelP2" style="width:auto;flex-shrink:0;min-width:90px;max-width:110px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34 ✏"><datalist id="dlTelP2"></datalist><input id="fcTel" type="tel"></div></div>
    <div class="fg"><span class="flbl">Email</span><input id="fcEmail" type="email"></div>
    <div class="fg"><span class="flbl">Tipo vehículo</span><select id="fcTipoV"><option value="">--</option><option value="camion">🚛 Camión</option><option value="semiremolque">🚚 Semirremolque</option><option value="furgoneta">🚐 Furgoneta</option><option value="trailer">🚛 Trailer</option><option value="coche">🚗 Coche</option></select></div>
    <div class="fg"><span class="flbl">Idioma ficha 🖨</span><select id="fcIdioma"><option value="">--</option></select></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🏢 Contacto empresa (para ausencias)</div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Encargado / Responsable</span><input id="fcEncargado" placeholder="Nombre del responsable"></div>
      <div class="fg"><span class="flbl">Tel. encargado</span><div style="display:flex;gap:4px"><input id="fcEncTelP" style="width:auto;flex-shrink:0;min-width:80px;max-width:100px;font-family:'JetBrains Mono',monospace;font-size:12px" placeholder="+34"><input id="fcEncTel" type="tel"></div></div>
      <div class="fg s2"><span class="flbl">Email encargado</span><input id="fcEncEmail" type="email" placeholder="responsable@empresa.com"></div>
    </div>
  </div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Pasaporte / DNI</span><input id="fcPas" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="fg"><span class="flbl">País / Nacionalidad</span><input id="fcPais" placeholder="España, Polonia..."></div>
      <div class="fg"><span class="flbl">Fecha Nacimiento</span><input id="fcFechaNac" type="date"></div>
      <div class="fg"><span class="flbl">Fecha Expiración Doc.</span><input id="fcFechaExp" type="date"></div>
      <div class="fg s2"><span class="flbl">GPS URL</span><input id="fcGps" placeholder="https://maps.google.com/..."></div>
      <div class="fg s2"><span class="flbl">Notas</span><textarea id="fcNotas" rows="2"></textarea></div>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mCond')">Cancelar</button><button class="btn btn-p" id="btnCondLbl" onclick="saveCond()">Crear</button></div>
  <input type="hidden" id="fcId">
</div></div>
<!-- MODAL MOVIMIENTO -->
<div class="ov" id="mMov"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mMovTitle">Nuevo Movimiento</div><button class="btn-x" onclick="closeOv('mMov')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="fmMat" style="font-family:'JetBrains Mono',monospace;text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Remolque</span><input id="fmRem" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nombre</span><input id="fmNom"></div>
    <div class="fg"><span class="flbl">Apellido</span><input id="fmApe"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="fmEmp"></div>
    <div class="fg"><span class="flbl">Hall <span class="freq">*</span></span><select id="fmHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Tipo carga</span><select id="fmCarga"><option value="">--</option><option value="EF">🔴 EF</option><option value="SUNDAY">🟣 SUNDAY</option><option value="PRIORITY">🟠 PRIORITY</option><option value="GOODS">🟢 GOODS</option><option value="EMPTY">⚪ EMPTY</option></select></div>
    <div class="fg"><span class="flbl">Estado</span><select id="fmStatus"><option value="ALMACEN">📦 ALMACEN</option><option value="SOT">⏱ SOT</option><option value="FIRA">🟢 FIRA</option><option value="FINAL">✅ FINAL</option></select></div>
    <div class="fg"><span class="flbl">Posición</span><input id="fmPos" type="number" min="0"></div>
    <div class="fg"><span class="flbl">Nº Vuelta</span><input id="fmVuelta" type="number" value="1" min="1"></div>
    <div class="fg s2"><span class="flbl">Tacógrafo</span><input id="fmTaco" type="datetime-local"></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="fmNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mMov')">Cancelar</button><button class="btn btn-p" id="btnMovLbl" onclick="saveMov()">Añadir</button></div>
  <input type="hidden" id="fmId">
</div></div>
<!-- MODAL RECINTO -->
<div class="ov" id="mRecinto"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mRecTitle">Nuevo Recinto</div><button class="btn-x" onclick="closeOv('mRecinto')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre del recinto <span class="freq">*</span></span><input id="recNom" placeholder="Ej: FIRA BARCELONA GRAN VIA"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="recCiudad" placeholder="Barcelona"></div>
    <div class="fg"><span class="flbl">País</span><input id="recPais" placeholder="España"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🏭 Halls / Pabellones</div>
    <div style="display:flex;gap:4px;margin-bottom:8px"><input id="recHallInput" placeholder="Nombre hall (ej: 2A, 3B, CS...)" style="flex:1"><button class="btn btn-s btn-sm" onclick="addRecHall()">+ Hall</button></div>
    <div id="recHallList" style="display:flex;flex-wrap:wrap;gap:4px"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">🚪 Accesos / Puertas</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:5px;margin-bottom:6px">
      <input id="recPuertaNom" placeholder="Nombre puerta">
      <input id="recPuertaDir" placeholder="Dirección">
      <input id="recPuertaQR" placeholder="URL QR (https://...)">
      <button class="btn btn-s btn-sm" onclick="addRecPuerta()">+ Puerta</button>
    </div>
    <div id="recPuertasList" style="display:flex;flex-direction:column;gap:4px"></div>
  </div>
  <div class="modal-section">
    <div class="modal-section-title">📞 Atención al cliente</div>
    <div class="fgrid">
      <div class="fg"><span class="flbl">Teléfono</span><input id="recAtcTel" placeholder="+34 900..."></div>
      <div class="fg"><span class="flbl">Email</span><input id="recAtcEmail" type="email" placeholder="info@recinto.com"></div>
      <div class="fg s2"><span class="flbl">Notas / Info adicional</span><textarea id="recAtcNotas" rows="2" placeholder="Horarios, web, etc."></textarea></div>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mRecinto')">Cancelar</button><button class="btn btn-p" id="btnRecLbl" onclick="saveRecinto()">Crear</button></div>
  <input type="hidden" id="recId">
</div></div>
<!-- MODAL EVENTO -->
<div class="ov" id="mEvento"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mEvTitle">Nuevo Evento</div><button class="btn-x" onclick="closeOv('mEvento')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre <span class="freq">*</span></span><input id="evNom" placeholder="Nombre del evento o feria" autocomplete="off" spellcheck="false"></div>
    <div class="fg"><span class="flbl">Fecha inicio</span><input id="evIni" type="date"></div>
    <div class="fg"><span class="flbl">Fecha fin</span><input id="evFin" type="date"></div>
    <div class="fg"><span class="flbl">Emoji</span><input id="evIco" value="📋" maxlength="2" style="font-size:22px;text-align:center;max-width:70px"></div>
    <div class="fg s2"><span class="flbl">Recinto</span><select id="evRecintoId" onchange="onRecintoSelectChange()"><option value="">— Seleccionar recinto —</option></select></div>
    <div class="fg"><span class="flbl">Recinto (nombre)</span><input id="evRec" readonly style="background:var(--bg3);color:var(--text3)"></div>
    <div class="fg"><span class="flbl">Ciudad</span><input id="evCiudad" readonly style="background:var(--bg3);color:var(--text3)"></div>

    <div class="fg s2">
      <span class="flbl">Numeración posiciones (Ingresos)</span>
      <div style="display:flex;gap:8px;align-items:center">
        <label class="tgl" id="tglAcumPos"><input type="checkbox" id="evAcumPos" onchange="updTgl(this)"><span>Acumular por evento</span></label>
        <span style="font-size:10px;color:var(--text3)">Si desactivado, reinicia cada día desde 1</span>
      </div>
    </div>
    <div class="fg s2" id="evBgWrap" style="display:none">
      <span class="flbl">Imagen de fondo (JPG/PNG) — se usará como marca de agua</span>
      <div style="display:flex;align-items:center;gap:8px">
        <button class="btn btn-gh btn-sm" onclick="document.getElementById('evBgFile').click()">📁 Seleccionar imagen</button>
        <span id="evBgStatus" style="font-size:11px;color:var(--text3)">Sin imagen</span>
        <button class="btn btn-danger btn-xs" id="evBgClear" style="display:none" onclick="evBgData='';document.getElementById('evBgStatus').textContent='Sin imagen';document.getElementById('evBgClear').style.display='none'">✕</button>
      </div>
      <input type="file" id="evBgFile" accept="image/*,.pdf" style="display:none" onchange="loadEvBg(this)">
    </div>
    <div class="fg s2"><span class="flbl">Puertas / Accesos</span>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:5px;margin-bottom:6px">
        <input id="evPuertaNom" placeholder="Nombre puerta">
        <input id="evPuertaDir" placeholder="Dirección / info">
        <input id="evPuertaQR" placeholder="URL QR (https://...)">
        <button class="btn btn-s btn-sm" onclick="addPuertaEvento()">+ Puerta</button>
      </div>
      <div id="evPuertasList" style="display:flex;flex-direction:column;gap:4px"></div>
    </div>
  </div>
  <div class="modal-section"><div class="modal-section-title">🏭 Halls del evento <span style="font-size:9px;color:var(--text3);font-weight:400">(selecciona del recinto — si ninguno, usa todos)</span></div><div id="evHallsGrid" style="display:flex;flex-wrap:wrap;gap:5px"></div></div>
  <div class="modal-section"><div class="modal-section-title">Campos visibles en ficha ingreso</div><div id="evCamposGrid" style="display:flex;flex-wrap:wrap;gap:6px"></div></div>
  <div id="evPhrasesGrid" style="display:none"></div>
  <div style="border-top:0.5px solid var(--border);padding:8px 14px 6px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);margin-bottom:6px">👥 Usuarios asignados a este evento</div><div id="evUsuariosGrid" style="display:flex;flex-wrap:wrap;gap:5px"></div></div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mEvento')">Cancelar</button><button class="btn btn-p" id="btnEvLbl" onclick="saveEvento()">Crear</button></div>
  <input type="hidden" id="evId">
</div></div>
<!-- MODAL EN ESPERA -->
<div class="ov" id="mEE"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mEETitle">Nueva Espera</div><button class="btn-x" onclick="closeOv('mEE')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="eeM" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Hora aprox.</span><input id="eeHora" type="time"></div>
    <div class="fg"><span class="flbl">Prioridad</span><select id="eePrio"><option value="normal">Normal</option><option value="alta">🔶 Alta</option><option value="urgente">🔴 Urgente</option></select></div>
    <div class="fg"><span class="flbl">Conductor</span><input id="eeCond"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="eeEmp"></div>
    <div class="fg"><span class="flbl">Hall</span><select id="eeHall"><option value="">--</option><option>1</option><option>2A</option><option>2B</option><option>3A</option><option>3B</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>CS</option></select></div>
    <div class="fg"><span class="flbl">Teléfono</span><input id="eeTel" type="tel"></div>
    <div class="fg"><span class="flbl">Booking / Ref</span><input id="eeRef"></div>
    <div class="fg s2"><span class="flbl">Notas</span><textarea id="eeNotas" rows="2"></textarea></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mEE')">Cancelar</button><button class="btn btn-p" id="btnEELbl" onclick="saveEE()">Añadir</button></div>
  <input type="hidden" id="eeId">
</div></div>
<!-- MODAL ESPECIAL -->
<div class="ov" id="mLN"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mLNTitle">Especial</div><button class="btn-x" onclick="closeOv('mLN')">✕</button></div>
  <div class="fgrid">
    <div class="fg"><span class="flbl">Matrícula <span class="freq">*</span></span><input id="lnM" style="text-transform:uppercase;font-family:'JetBrains Mono',monospace" oninput="this.value=this.value.toUpperCase()"></div>
    <div class="fg"><span class="flbl">Nivel</span><select id="lnN"><option value="alerta">⚠️ Alerta</option><option value="bloqueo">🚫 Bloqueo</option></select></div>
    <div class="fg s2"><span class="flbl">Motivo <span class="freq">*</span></span><input id="lnMotivo"></div>
    <div class="fg"><span class="flbl">Empresa</span><input id="lnEmp"></div>
    <div class="fg"><span class="flbl">Válido hasta</span><input id="lnHasta" type="date"></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mLN')">Cancelar</button><button class="btn btn-r" id="btnLNLbl" onclick="saveLN()">Añadir</button></div>
  <input type="hidden" id="lnId">
</div></div>
<!-- MODAL MENSAJE -->
<div class="ov" id="mMsg"><div class="modal">
  <div class="mhdr"><div class="mttl">📢 Nuevo Mensaje</div><button class="btn-x" onclick="closeOv('mMsg')">✕</button></div>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div class="fg"><span class="flbl">Tipo</span><select id="msgTipo"><option value="info">ℹ️ Info</option><option value="alerta">⚠️ Alerta</option><option value="urgente">🔴 Urgente</option></select></div>
    <div class="fg"><span class="flbl">Título <span class="freq">*</span></span><input id="msgTitulo"></div>
    <div class="fg"><span class="flbl">Mensaje <span class="freq">*</span></span><textarea id="msgTexto" rows="3"></textarea></div>
    <div class="fg"><span class="flbl">Matrícula relacionada</span><input id="msgMat" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mMsg')">Cancelar</button><button class="btn btn-p" onclick="saveMsg()">📢 Enviar</button></div>
</div></div>
<!-- MODAL USUARIO -->
<div class="ov" id="mUser"><div class="modal">
  <div class="mhdr"><div class="mttl" id="mUserTitle">Nuevo Usuario</div><button class="btn-x" onclick="closeOv('mUser')">✕</button></div>
  <div class="fgrid">
    <div class="fg s2"><span class="flbl">Nombre completo <span class="freq">*</span></span><input id="fuNom"></div>
    <div class="fg"><span class="flbl">Nombre de usuario <span class="freq">*</span></span><input id="fuUsername" placeholder="sin espacios" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9._-]/g,'')"></div>
    <div class="fg"><span class="flbl">Email (para 2FA)</span><input id="fuEmail" type="email" placeholder="usuario@empresa.com"></div>
    <div class="fg"><span class="flbl">Contraseña</span><input id="fuPass" type="password" placeholder="Dejar vacío = no cambia" oninput="checkPassStrength(this.value)"></div>
    <div class="fg"><span class="flbl">Confirmar contraseña</span><input id="fuPass2" type="password" placeholder="Repetir contraseña"></div>
    <div class="fg"><span class="flbl">PIN (mín. 6 dígitos) — acceso rápido</span><input id="fuPin" type="password" maxlength="8" inputmode="numeric" placeholder="------"></div>
    <div class="fg"><span class="flbl">Confirmar PIN</span><input id="fuPin2" type="password" maxlength="8" inputmode="numeric" placeholder="------"></div>
    <div id="passStrengthWrap" style="display:none;grid-column:1/-1">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:4px;border-radius:2px;background:var(--bg4);overflow:hidden">
          <div id="passStrengthBar" style="height:100%;border-radius:2px;transition:width .3s,background .3s;width:0%"></div>
        </div>
        <span id="passStrengthLbl" style="font-size:10px;font-weight:700;min-width:40px"></span>
      </div>
    </div>
    <div class="fg"><span class="flbl">Idioma interfaz</span><select id="fuLang"></select></div>
    <div class="fg"><span class="flbl">Rol <span class="freq">*</span></span><select id="fuRol" onchange="updateRolPerms()"><option id="fuRolSA" value="superadmin" style="display:none">⭐ SuperAdmin</option><option value="supervisor">🔑 Supervisor</option><option value="controlador_rampa">🚦 Controlador Rampa</option><option value="editor">✏️ Editor</option><option value="visor">👁 Visor</option></select></div>
    <div class="fg s2" style="display:flex;align-items:center;gap:10px">
      <label class="tgl" id="tgl2FA"><input type="checkbox" id="fu2FA" onchange="updTgl(this)"><span>✉️ Verificación 2FA por email</span></label>
      <span style="font-size:10px;color:var(--text3)">Requiere email configurado</span>
    </div>
  </div>
  <div style="margin-top:12px;padding:10px;background:var(--bg3);border-radius:var(--r)" id="permsWrap">
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">PERMISOS</div>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Acción</th>
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Descripción</th>
        <th style="padding:4px 7px;text-align:center;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Activo</th>
      </tr></thead>
      <tbody id="permsTableBody">
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">➕ Añadir registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Crear nuevos ingresos / referencias</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpAdd" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">✏️ Editar registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Modificar datos de ingresos existentes</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpEdit" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🗑 Eliminar registros</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar ingresos (van a papelera)</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpDel" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">↩ Marcar estado</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Registrar entrada / salida de vehículos</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpStat" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🖨 Imprimir pase</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Imprimir y troquelado de pases</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpPrint" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">📥 Importar Excel</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Importar registros masivos desde archivo</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpImport" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">⬇ Exportar Excel</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Descargar listas en formato Excel</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpExp" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🗑 Limpiar tab</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar registros del día (no todo)</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpClean" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">⭐ Lista especial</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Gestionar blacklist y lista especial</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpBL" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">💾 Guardar plantilla</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Crear / modificar / asignar plantillas de impresión</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpSaveTpl" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">🔄 Día 0 / Eliminar plantilla</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Borrar plantillas y resetear canvas</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpDelTpl" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">✏️ Editar evento</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Modificar campos y configuración de eventos</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpEvEdit" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">▶ Activar evento</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Activar / desactivar evento global</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpActivarEv" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr style="border-bottom:0.5px solid var(--border)"><td style="padding:5px 7px;font-weight:600">💾 Exportar día (botón cabecera)</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Botón exportar datos del día en cabecera</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpSave" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr><td style="padding:5px 7px;font-weight:600">📢 Mensajes rampa</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Enviar mensajes a dispositivos en rampa</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpMsg" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      <tr><td style="padding:5px 7px;font-weight:600">⚙ Campos visibles</td><td style="padding:5px 7px;color:var(--text3);font-size:10px">Acceder a ⚙ Campos para configurar campos visibles</td><td style="padding:5px 7px;text-align:center"><label class="tgl" style="justify-content:center"><input type="checkbox" id="fpCampos" onchange="updTgl(this)"><span style="padding:3px 10px">—</span></label></td></tr>
      </tbody>
    </table>
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">PESTAÑAS VISIBLES (SuperAdmin configura)</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px" id="tabToggleGrid">
      <label class="tgl" id="tglDash"><input type="checkbox" id="ftDash" onchange="updTgl(this)"><span>📊 Dashboard</span></label>
      <label class="tgl" id="tglRef"><input type="checkbox" id="ftIng" onchange="updTgl(this)"><span>🔖 Referencia</span></label>
      <label class="tgl" id="tglIng2"><input type="checkbox" id="ftIng2" onchange="updTgl(this)"><span>🚛 Ingresos</span></label>
      <label class="tgl" id="tglFlota"><input type="checkbox" id="ftFlota" onchange="updTgl(this)"><span>📦 Embalaje</span></label>
      <label class="tgl" id="tglCond"><input type="checkbox" id="ftCond" onchange="updTgl(this)"><span>👤 Conductores</span></label>
      <label class="tgl" id="tglAg"><input type="checkbox" id="ftAg" onchange="updTgl(this)"><span>📅 Agenda</span></label>
      <label class="tgl" id="tglAn"><input type="checkbox" id="ftAn" onchange="updTgl(this)"><span>📈 Análisis</span></label>
      <label class="tgl" id="tglVeh"><input type="checkbox" id="ftVeh" onchange="updTgl(this)"><span>📜 Historial</span></label>
      <label class="tgl" id="tglAud"><input type="checkbox" id="ftAud" onchange="updTgl(this)"><span>📂 Archivos</span></label>
      <label class="tgl" id="tglPap"><input type="checkbox" id="ftPap" onchange="updTgl(this)"><span>🗑 Papelera</span></label>
      <label class="tgl" id="tglRec"><input type="checkbox" id="ftRec" onchange="updTgl(this)"><span>🏟 Recintos</span></label>
      <label class="tgl" id="tglEv"><input type="checkbox" id="ftEv" onchange="updTgl(this)"><span>📅 Eventos</span></label>
      <label class="tgl" id="tglUs"><input type="checkbox" id="ftUs" onchange="updTgl(this)"><span>👥 Usuarios</span></label>
      <label class="tgl" id="tglImp"><input type="checkbox" id="ftImp" onchange="updTgl(this)"><span>🖨 Impresión</span></label>
    </div>
  </div>
  <div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mUser')">Cancelar</button><button class="btn btn-p" id="btnUserLbl" onclick="saveUser()">Crear</button></div>
  <input type="hidden" id="fuId">
</div></div>
<!-- MODAL BORRAR -->
<div class="ov" id="mDel"><div class="modal modal-sm"><div class="mhdr"><div class="mttl" id="delTitle">Confirmar eliminación</div></div><div id="delDetail" style="font-size:13px;color:var(--text3);margin-bottom:16px"></div><div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mDel')">Cancelar</button><button class="btn btn-r" onclick="doDelete()">🗑 Eliminar</button></div></div></div>
<!-- MODAL DETALLE INGRESO -->
<div class="ov" id="mIngDetail"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl" id="mIngDetailTitle">Detalle Ingreso</div><button class="btn-x" onclick="closeOv('mIngDetail')">✕</button></div>
  <div id="mIngDetailBody"></div>
  <div class="ffoot">
    <button class="btn btn-gh" onclick="closeOv('mIngDetail')">Cerrar</button>
    <button class="btn btn-t btn-sm" id="mIngDetailPrint" onclick="">🖨 Normal</button>
    <button class="btn btn-sm" id="mIngDetailPrintTrq" style="background:#7c3aed;color:#fff" onclick="">✂ Troquelado</button>
    <button class="btn btn-edit btn-sm" id="mIngDetailEdit" onclick="">✏️ Editar</button>
  </div>
</div></div>
<!-- MODAL BUSQUEDA GLOBAL -->
<div class="ov" id="mGlobalSearch"><div class="modal modal-lg">
  <div class="mhdr"><div class="mttl">🔍 Búsqueda Global</div><button class="btn-x" onclick="closeOv('mGlobalSearch')">✕</button></div>
  <div style="position:relative;margin-bottom:12px">
    <input id="globalSearchInput" placeholder="Buscar posición, matrícula, nombre, empresa, referencia..." oninput="doGlobalSearch(this.value)" style="padding-left:36px;font-size:14px">
    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px">🔍</span>
  </div>
  <div id="globalSearchResults"></div>
</div></div>
<!-- MODAL BLACKLIST ALERT -->
<div class="ov" id="mBA"><div class="modal modal-sm"><div style="text-align:center;margin-bottom:12px"><div style="font-size:48px" id="baIcon">🚫</div><div style="font-size:16px;font-weight:900;margin-top:6px" id="baTitle">ACCESO DENEGADO</div></div><div id="baDetail" style="font-size:13px;margin-bottom:10px;padding:10px;background:var(--bg3);border-radius:var(--r)"></div><div id="baInstr" style="font-size:12px;color:var(--text3);margin-bottom:14px"></div><div class="ffoot"><button class="btn btn-r" onclick="closeOv('mBA')">Cerrar</button><button class="btn btn-a" id="baOverrideBtn" style="display:none" onclick="blOverride()">⚠️ Autorizar (Sup)</button></div></div></div>
<!-- MODAL LANG -->
<div class="ov" id="mLangPicker"><div class="modal modal-sm"><div class="mhdr"><div class="mttl">🌍 Idioma</div><button class="btn-x" onclick="closeOv('mLangPicker')">✕</button></div><div style="font-size:12px;color:var(--text3);margin-bottom:10px">Elige tu idioma. Se guarda en tu perfil.</div><div class="lang-grid" id="langGrid" style="max-height:240px"></div><div class="ffoot"><button class="btn btn-gh" onclick="closeOv('mLangPicker')">Cancelar</button><button class="btn btn-p" onclick="confirmLang()">✓ Confirmar</button></div></div></div>
<!-- MODAL CAMARA OCR -->
<div class="ov" id="mCam"><div class="modal"><div class="mhdr"><div class="mttl">📷 Escanear Matrícula</div><button class="btn-x" onclick="closeCam()">✕</button></div><div style="position:relative"><video id="camFeed" autoplay playsinline muted></video><canvas id="camCanvas" style="display:none"></canvas></div><div id="camResult" style="margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:900;text-align:center;min-height:30px;color:var(--blue)"></div><div id="camStatus" style="font-size:11px;color:var(--text3);text-align:center;margin-top:4px"></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-t" style="flex:1" onclick="captureOCR()">📸 Capturar</button><button class="btn btn-g" id="btnCamUse" style="display:none" onclick="useCamResult()">✓ Usar</button></div><div style="margin-top:8px;text-align:center"><input type="file" id="cameraInput" accept="image/*" capture="environment" style="display:none" onchange="processCameraCapture(this)"><button class="btn btn-gh btn-sm" onclick="document.getElementById('cameraInput').click()">📁 Elegir imagen</button></div></div></div>
<!-- APP HEADER -->
<div class="app-hdr" id="appHdr" style="display:none">
  <div style="display:flex;align-items:center;width:100%;max-width:1400px;margin:0 auto;gap:6px">
  <div class="logo" style="display:flex;align-items:center;gap:6px"><div class="logo-ico" style="font-size:22px">🔗</div><span class="logo-txt" style="font-size:15px;font-weight:500">Control<span style="color:#185FA5">Unificado</span><span class="v-badge" style="font-size:10px;background:#185FA5;color:#fff;padding:2px 5px;border-radius:3px;margin-left:4px">v5</span></span></div>
  <div class="hdr-cnt-wrap" id="hdrCnts" style="flex:1;display:flex;align-items:center;justify-content:center"></div>
  <button class="btn btn-gh btn-xs" onclick="openGlobalSearch()" title="Búsqueda global" style="margin-right:4px">🔍</button>
  <div class="hdr-right">
    <div class="sync-pill" id="syncPill" onclick="showSyncInfo()"><div class="sd sd-y" id="syncDot"></div></div>
`;
}
