// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — empresa_form.js — Registro empresa 5 pasos
// 1. Idioma  2. Datos empresa (VAT/CIF/autónomo/extranjera)
// 3. RGPD obligatorio  4. OTP email  5. Éxito
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { trFree, LANGS_UI } from './langs.js';
import { toast, sha256 } from './utils.js';
import { FIREBASE_CONFIG } from './config.js';

let _container = null;
let _regData = {};
let _otpHash = null;

export function renderRegistro(container) {
  _container = container;
  _regData = {};
  _otpHash = null;
  paintStep(1);
}

function paintStep(n) {
  const lang = AppState.get('currentLang') || 'es';

  const stepBar = (active) => `<div style="display:flex;gap:4px;margin-bottom:16px">${
    [1,2,3,4,5].map(i => `<div style="flex:1;height:4px;border-radius:2px;background:${i < active ? '#2563eb' : i === active ? '#93c5fd' : '#e5e7eb'}"></div>`).join('')
  }</div>`;

  const wrap = (inner) => `
    <div style="position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#1e3a5f,#0f172a);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto">
      <div style="background:#fff;border-radius:16px;padding:24px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4);max-height:90vh;overflow-y:auto;font-family:system-ui,sans-serif">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:16px;font-weight:800;font-style:italic">BeUnifyT</div>
          <div style="font-size:11px;color:#10b981;font-weight:700;margin-top:2px">🏢 Registro de Empresa</div>
        </div>
        ${inner}
      </div>
    </div>`;

  const lbl = (text) => `<label style="font-size:11px;font-weight:700;color:#6b7280;margin-bottom:4px;text-transform:uppercase;display:block">${text}</label>`;
  const inp = (id, ph, type='text', val='') => `<input id="${id}" type="${type}" placeholder="${ph}" value="${val}" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:10px;background:#fff;color:#0f172a;outline:none">`;
  const btn = (id, text, cls='p') => `<button id="${id}" style="width:100%;padding:11px;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;${cls==='p'?'background:#2563eb;color:#fff':cls==='g'?'background:#0d9f6e;color:#fff':'background:#fff;color:#374151;border:1.5px solid #d1d5db'}">${text}</button>`;
  const errDiv = (id) => `<div id="${id}" style="color:#e02424;font-size:12px;font-weight:700;margin-bottom:8px;display:none"></div>`;

  // ─── STEP 1: IDIOMA ──────────────────────
  if (n === 1) {
    _container.innerHTML = wrap(`
      ${stepBar(1)}
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">Selecciona tu idioma</div>
      <select id="regLang" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:16px;cursor:pointer">
        ${LANGS_UI.map(l => `<option value="${l.code}" ${l.code===lang?'selected':''}>${l.flag.includes('<svg')?'':l.flag} ${l.name}</option>`).join('')}
      </select>
      ${btn('s1next','Continuar →')}
      ${btn('s1back','← Volver al inicio','gh')}
    `);
    _container.querySelector('#s1next').onclick = () => {
      const sel = _container.querySelector('#regLang');
      AppState.set('currentLang', sel.value);
      _regData.lang = sel.value;
      paintStep(2);
    };
    _container.querySelector('#s1back').onclick = () => {
      import('./auth.js').then(m => m.renderLogin(_container));
    };
    return;
  }

  // ─── STEP 2: DATOS EMPRESA ───────────────
  if (n === 2) {
    _container.innerHTML = wrap(`
      ${stepBar(2)}
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">📋 Datos de la empresa</div>

      ${lbl('Nombre empresa *')}${inp('rNom','Sertrans S.L.','text',_regData.nombre||'')}

      ${lbl('Tipo de empresa *')}
      <select id="rTipoEmp" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:10px;cursor:pointer">
        <option value="eu_empresa" ${(_regData.tipoEmp||'')==='eu_empresa'?'selected':''}>Empresa UE (CIF/VAT)</option>
        <option value="eu_autonomo" ${(_regData.tipoEmp||'')==='eu_autonomo'?'selected':''}>Autónomo UE</option>
        <option value="extranjera" ${(_regData.tipoEmp||'')==='extranjera'?'selected':''}>Empresa extranjera (fuera UE)</option>
      </select>

      <div id="rFiscalFields"></div>

      ${lbl('Persona de contacto *')}${inp('rCont','Juan García','text',_regData.contacto||'')}
      ${lbl('Teléfono *')}${inp('rTel','+34 600 000 000','tel',_regData.tel||'')}
      ${lbl('Email *')}${inp('rEmail','empresa@ejemplo.com','email',_regData.email||'')}
      ${lbl('Contraseña * (mín. 8 caracteres)')}${inp('rPass','','password',_regData.pass||'')}

      ${errDiv('rErr2')}
      ${btn('s2next','Siguiente: RGPD →')}
      ${btn('s2back','←','gh')}
    `);

    const tipoSel = _container.querySelector('#rTipoEmp');
    const fiscalDiv = _container.querySelector('#rFiscalFields');

    function updateFiscalFields() {
      const tipo = tipoSel.value;
      if (tipo === 'eu_empresa') {
        fiscalDiv.innerHTML = `${lbl('CIF / VAT intracomunitario *')}${inp('rCif','ESB12345678 / DE123456789','text',_regData.cif||'')}
          ${lbl('País sede *')}${inp('rPais','España','text',_regData.pais||'')}
          ${lbl('Dirección fiscal')}${inp('rDir','Calle Ejemplo 1, 28001 Madrid','text',_regData.direccion||'')}`;
      } else if (tipo === 'eu_autonomo') {
        fiscalDiv.innerHTML = `${lbl('NIF / NIE *')}${inp('rCif','12345678A','text',_regData.cif||'')}
          ${lbl('País *')}${inp('rPais','España','text',_regData.pais||'')}
          ${lbl('Dirección fiscal')}${inp('rDir','','text',_regData.direccion||'')}`;
      } else {
        fiscalDiv.innerHTML = `${lbl('Tax ID / Registro fiscal *')}${inp('rCif','','text',_regData.cif||'')}
          ${lbl('País de origen *')}${inp('rPais','','text',_regData.pais||'')}
          ${lbl('Dirección')}${inp('rDir','','text',_regData.direccion||'')}`;
      }
    }
    tipoSel.onchange = updateFiscalFields;
    updateFiscalFields();

    _container.querySelector('#s2next').onclick = () => {
      const nom = (_container.querySelector('#rNom')?.value||'').trim();
      const cif = (_container.querySelector('#rCif')?.value||'').trim();
      const cont = (_container.querySelector('#rCont')?.value||'').trim();
      const tel = (_container.querySelector('#rTel')?.value||'').trim();
      const email = (_container.querySelector('#rEmail')?.value||'').trim().toLowerCase();
      const pass = (_container.querySelector('#rPass')?.value||'').trim();
      const pais = (_container.querySelector('#rPais')?.value||'').trim();
      const dir = (_container.querySelector('#rDir')?.value||'').trim();
      const err = _container.querySelector('#rErr2');

      if (!nom||!cif||!cont||!tel||!email||!pass) { err.textContent='Completa todos los campos obligatorios'; err.style.display='block'; return; }
      if (pass.length<8) { err.textContent='Contraseña mínimo 8 caracteres'; err.style.display='block'; return; }

      _regData = { ..._regData, nombre:nom, cif, contacto:cont, tel, email, pass, pais, direccion:dir, tipoEmp:tipoSel.value };
      paintStep(3);
    };
    _container.querySelector('#s2back').onclick = () => paintStep(1);
    return;
  }

  // ─── STEP 3: RGPD ───────────────────────
  if (n === 3) {
    _container.innerHTML = wrap(`
      ${stepBar(3)}
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">📄 Consentimiento RGPD</div>
      <div style="font-size:10px;color:#b45309;padding:5px 9px;background:#fffbeb;border-radius:6px;border:1px solid #fde68a;margin-bottom:8px">⬇️ Desplázate hasta el final para poder aceptar</div>

      <div id="rRgpdDoc" style="max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;font-size:12px;line-height:1.6;color:#374151;margin-bottom:10px">
        <h3 style="margin-bottom:8px">Protección de Datos — RGPD</h3>
        <p>El responsable del tratamiento es el organizador del evento. Los datos se tratarán exclusivamente para la gestión logística y de acceso al recinto. Se conservarán hasta 2 años después del evento.</p>
        <p style="margin-top:8px">De conformidad con el RGPD (UE) 2016/679, el interesado tiene derecho a acceder, rectificar, suprimir, limitar, portar y oponerse al tratamiento de sus datos. Contacto: privacidad@beunifyt.com</p>
        <p style="margin-top:8px">Los datos no serán cedidos a terceros salvo obligación legal o prestación del servicio contratado.</p>
        <p style="margin-top:8px;color:transparent">.</p>
      </div>

      <div id="rRgpdArea" style="opacity:.4;pointer-events:none;transition:opacity .3s">
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;margin-bottom:8px">
          <input type="checkbox" id="rC1" style="flex-shrink:0;margin-top:2px">
          He leído y acepto el documento de protección de datos y consiento el tratamiento de los datos de los conductores.
        </label>
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="rC2" style="flex-shrink:0;margin-top:2px">
          Confirmo que soy representante legal o apoderado de la empresa.
        </label>
      </div>

      ${errDiv('rErr3')}
      ${btn('s3next','📧 Enviar código de firma →')}
      ${btn('s3back','←','gh')}
    `);

    // Activar checkboxes al hacer scroll hasta el final
    const rgpdDoc = _container.querySelector('#rRgpdDoc');
    const rgpdArea = _container.querySelector('#rRgpdArea');
    rgpdDoc.onscroll = () => {
      if (rgpdDoc.scrollTop + rgpdDoc.clientHeight >= rgpdDoc.scrollHeight - 10) {
        rgpdArea.style.opacity = '1';
        rgpdArea.style.pointerEvents = 'auto';
      }
    };

    _container.querySelector('#s3next').onclick = async () => {
      const c1 = _container.querySelector('#rC1')?.checked;
      const c2 = _container.querySelector('#rC2')?.checked;
      const err = _container.querySelector('#rErr3');
      if (!c1 || !c2) { err.textContent='Marca ambas casillas para continuar'; err.style.display='block'; return; }
      err.style.display = 'none';

      // Generar OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      _otpHash = await sha256(otp + _regData.email);
      // En desarrollo mostrar en consola
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.info('[reg] OTP:', otp);
      paintStep(4);
    };
    _container.querySelector('#s3back').onclick = () => paintStep(2);
    return;
  }

  // ─── STEP 4: OTP ─────────────────────────
  if (n === 4) {
    const emailHint = _regData.email.replace(/(.{2}).+@/, '$1***@');
    _container.innerHTML = wrap(`
      ${stepBar(4)}
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:34px;margin-bottom:8px">📧</div>
        <div style="font-size:13px;font-weight:700;margin-bottom:4px">Código enviado</div>
        <div style="font-size:11px;color:#6b7280">Código enviado a ${emailHint}</div>
      </div>

      <div id="otpBoxes" style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">
        ${[0,1,2,3,4,5].map(i => `<div id="ob${i}" style="width:44px;height:54px;border:2px solid #d1d5db;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#0f172a"></div>`).join('')}
      </div>

      <input type="tel" id="rOtpInput" maxlength="6" inputmode="numeric" placeholder="000000"
        style="width:100%;text-align:center;font-size:24px;letter-spacing:8px;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;margin-bottom:8px;outline:none">

      ${errDiv('rErr4')}
      ${btn('s4confirm','✓ Confirmar firma y registrar','g')}
      ${btn('s4back','← Volver','gh')}
    `);

    const otpInput = _container.querySelector('#rOtpInput');
    otpInput.oninput = () => {
      const digits = otpInput.value.replace(/\D/g, '').slice(0, 6);
      otpInput.value = digits;
      for (let i = 0; i < 6; i++) {
        const b = _container.querySelector('#ob' + i);
        if (b) {
          b.textContent = digits[i] || '';
          b.style.borderColor = digits[i] ? '#2563eb' : '#d1d5db';
          b.style.background = digits[i] ? '#eff6ff' : '';
        }
      }
    };

    _container.querySelector('#s4confirm').onclick = async () => {
      const code = (otpInput.value || '').replace(/\D/g, '');
      const err = _container.querySelector('#rErr4');
      if (code.length !== 6) { err.textContent='Introduce el código de 6 dígitos'; err.style.display='block'; return; }

      const hashed = await sha256(code + _regData.email);
      if (hashed !== _otpHash) { err.textContent='Código incorrecto'; err.style.display='block'; return; }
      err.style.display = 'none';

      const confirmBtn = _container.querySelector('#s4confirm');
      confirmBtn.disabled = true; confirmBtn.textContent = 'Registrando…';

      try {
        const { initFirestore, fsSet } = await import('./firestore.js');
        await initFirestore(FIREBASE_CONFIG);
        const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
        const { createUserWithEmailAndPassword, updateProfile } = await import(`${FB}/firebase-auth.js`);
        const { getBEUAuth } = await import('./firestore.js');

        const cred = await createUserWithEmailAndPassword(getBEUAuth(), _regData.email, _regData.pass);
        await updateProfile(cred.user, { displayName: _regData.nombre });
        const empId = cred.user.uid;

        // Crear empresa
        await fsSet('companies/' + empId, {
          id: empId, nombre: _regData.nombre, cif: _regData.cif,
          tipoEmpresa: _regData.tipoEmp, contacto: _regData.contacto,
          tel: _regData.tel, email: _regData.email, pais: _regData.pais,
          direccion: _regData.direccion, nivel: 'semi', tipo: 'empresa',
          vehiculos: [], creadoTs: new Date().toISOString(),
        }, false);

        // Crear usuario
        await fsSet('users/' + empId, {
          id: empId, nombre: _regData.nombre, email: _regData.email,
          rol: 'empresa', idioma: _regData.lang || 'es', tema: 'light',
          empresaId: empId, nivel: 'semi',
          tabs: ['dash', 'ingresos', 'conductores', 'agenda'],
          permisos: { canAdd: true, canEdit: true, canDel: false, canExport: true },
        }, false);

        // Guardar consentimiento RGPD
        const retainUntil = new Date();
        retainUntil.setFullYear(retainUntil.getFullYear() + 2);
        await fsSet('companies/' + empId + '/consentimientos/rgpd_' + Date.now(), {
          empresaId: empId, ts: new Date().toISOString(),
          lang: _regData.lang || 'es',
          conservaHasta: retainUntil.toISOString().slice(0, 10),
          firmado: true, firmadoPor: _regData.nombre,
        }, false);

        _regData._uid = empId;
        paintStep(5);
      } catch (e) {
        confirmBtn.disabled = false; confirmBtn.textContent = '✓ Confirmar firma y registrar';
        const msg = (e?.code || '').includes('email-already-in-use')
          ? 'Este email ya está registrado. Usa el botón de acceso.'
          : 'Error: ' + (e?.message || '');
        err.textContent = msg; err.style.display = 'block';
      }
    };
    _container.querySelector('#s4back').onclick = () => paintStep(3);
    return;
  }

  // ─── STEP 5: ÉXITO ───────────────────────
  if (n === 5) {
    _container.innerHTML = wrap(`
      <div style="text-align:center">
        <div style="font-size:48px;margin-bottom:12px">✅</div>
        <div style="font-size:15px;font-weight:800;color:#0d9f6e;margin-bottom:8px">¡Registro completado!</div>
        <div style="font-size:12px;color:#374151;margin-bottom:16px;line-height:1.6">Tu empresa está registrada. Un administrador la verificará en breve. Ya puedes acceder a tu área.</div>
        ${btn('s5enter','→ Entrar al portal','g')}
      </div>
    `);

    _container.querySelector('#s5enter').onclick = async () => {
      try {
        const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
        const { signInWithEmailAndPassword } = await import(`${FB}/firebase-auth.js`);
        const { getBEUAuth } = await import('./firestore.js');
        const { fsGet } = await import('./firestore.js');
        const cred = await signInWithEmailAndPassword(getBEUAuth(), _regData.email, _regData.pass);
        const userData = await fsGet('users/' + cred.user.uid);
        const { buildUsuario, launchShell } = await import('./app.js');
        const usuario = buildUsuario(userData || { nombre: _regData.nombre, email: _regData.email, rol: 'empresa', idioma: _regData.lang || 'es' }, cred.user.uid);
        localStorage.setItem('beu_session', JSON.stringify({ uid: cred.user.uid, idioma: usuario.idioma, rol: usuario.rol, timestamp: Date.now() }));
        launchShell(usuario);
      } catch (e) {
        import('./auth.js').then(m => m.renderLogin(_container));
      }
    };
  }
}
