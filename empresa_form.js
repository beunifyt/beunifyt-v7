// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — empresa_form.js — Registro empresa 5 pasos
// Usa trFree('registro', k) — 25 idiomas
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { trFree, LANGS_UI } from './langs.js';
import { toast, sha256 } from './utils.js';
import { FIREBASE_CONFIG } from './config.js';

let _container = null;
let _regData = {};
let _otpHash = null;

export function renderRegistro(container) {
  _container = container; _regData = {}; _otpHash = null;
  paintStep(1);
}

function r(k) { return trFree('registro', k) || k; }

function paintStep(n) {
  const lang = AppState.get('currentLang') || 'es';
  const stepBar = (a) => `<div style="display:flex;gap:4px;margin-bottom:16px">${[1,2,3,4,5].map(i=>`<div style="flex:1;height:4px;border-radius:2px;background:${i<a?'#2563eb':i===a?'#93c5fd':'#e5e7eb'}"></div>`).join('')}</div>`;
  const wrap = (html) => `<div style="position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#1e3a5f,#0f172a);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto">
    <div style="background:#fff;border-radius:16px;padding:24px;max-width:440px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4);max-height:90vh;overflow-y:auto;font-family:system-ui,sans-serif;color:#1a1a1a">
      <div style="text-align:center;margin-bottom:16px"><div style="font-size:16px;font-weight:800;font-style:italic;color:#0f172a">BeUnifyT</div><div style="font-size:11px;color:#10b981;font-weight:700;margin-top:2px">🏢 ${trFree('auth','register')}</div></div>
      ${html}
    </div></div>`;
  const lbl = (t) => `<label style="font-size:11px;font-weight:700;color:#6b7280;margin-bottom:4px;text-transform:uppercase;display:block">${t}</label>`;
  const inp = (id,ph='',type='text',val='') => `<input id="${id}" type="${type}" placeholder="${ph}" value="${val}" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:10px;background:#fff;color:#0f172a;outline:none">`;
  const btnP = (id,t) => `<button id="${id}" style="width:100%;padding:11px;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;background:#2563eb;color:#fff">${t}</button>`;
  const btnG = (id,t) => `<button id="${id}" style="width:100%;padding:11px;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;background:#0d9f6e;color:#fff">${t}</button>`;
  const btnGh = (id,t) => `<button id="${id}" style="width:100%;padding:11px;border:none;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;background:#fff;color:#374151;border:1.5px solid #d1d5db">${t}</button>`;
  const errD = (id) => `<div id="${id}" style="color:#e02424;font-size:12px;font-weight:700;margin-bottom:8px;display:none"></div>`;

  if (n===1) {
    _container.innerHTML = wrap(`${stepBar(1)}
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">${r('sel')}</div>
      <select id="regLang" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:16px;cursor:pointer;background:#fff;color:#1a1a1a">
        ${LANGS_UI.map(l=>`<option value="${l.code}" ${l.code===lang?'selected':''}>${l.flag.includes('<svg')?'':l.flag} ${l.name}</option>`).join('')}
      </select>
      ${btnP('s1n',r('cont'))}${btnGh('s1b',r('vol'))}`);
    _container.querySelector('#s1n').onclick=()=>{ AppState.set('currentLang',_container.querySelector('#regLang').value); _regData.lang=_container.querySelector('#regLang').value; paintStep(2); };
    _container.querySelector('#s1b').onclick=()=>{ import('./auth.js').then(m=>m.renderLogin(_container)); };
    return;
  }
  if (n===2) {
    _container.innerHTML = wrap(`${stepBar(2)}
      <div style="font-size:13px;font-weight:700;margin-bottom:12px">${r('dat')}</div>
      ${lbl(r('nom')+' *')}${inp('rNom','','text',_regData.nombre||'')}
      ${lbl(r('tipo')+' *')}<select id="rTipo" style="width:100%;padding:10px 14px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;margin-bottom:10px;cursor:pointer;background:#fff;color:#1a1a1a">
        <option value="eu_empresa" ${(_regData.tipoEmp||'')==='eu_empresa'?'selected':''}>${r('euE')}</option>
        <option value="eu_autonomo" ${(_regData.tipoEmp||'')==='eu_autonomo'?'selected':''}>${r('euA')}</option>
        <option value="extranjera" ${(_regData.tipoEmp||'')==='extranjera'?'selected':''}>${r('ext')}</option>
      </select>
      <div id="rFiscal"></div>
      ${lbl(r('contact')+' *')}${inp('rCont','','text',_regData.contacto||'')}
      ${lbl(r('tel')+' *')}${inp('rTel','+34 600 000 000','tel',_regData.tel||'')}
      ${lbl(r('email')+' *')}${inp('rEmail','','email',_regData.email||'')}
      ${lbl(r('pass')+' *')}${inp('rPass','','password',_regData.pass||'')}
      ${errD('rE2')}${btnP('s2n',r('sigR'))}${btnGh('s2b',r('atr'))}`);
    const tipoSel=_container.querySelector('#rTipo'),fiscDiv=_container.querySelector('#rFiscal');
    function uf(){const t=tipoSel.value;
      if(t==='eu_empresa') fiscDiv.innerHTML=`${lbl(r('cif')+' *')}${inp('rCif','ESB12345678','text',_regData.cif||'')}${lbl(r('pSede')+' *')}${inp('rPais','','text',_regData.pais||'')}${lbl(r('dFis'))}${inp('rDir','','text',_regData.direccion||'')}`;
      else if(t==='eu_autonomo') fiscDiv.innerHTML=`${lbl(r('nif')+' *')}${inp('rCif','12345678A','text',_regData.cif||'')}${lbl(r('pais')+' *')}${inp('rPais','','text',_regData.pais||'')}${lbl(r('dFis'))}${inp('rDir','','text',_regData.direccion||'')}`;
      else fiscDiv.innerHTML=`${lbl(r('tax')+' *')}${inp('rCif','','text',_regData.cif||'')}${lbl(r('pOrig')+' *')}${inp('rPais','','text',_regData.pais||'')}${lbl(r('dir'))}${inp('rDir','','text',_regData.direccion||'')}`;
    } tipoSel.onchange=uf; uf();
    _container.querySelector('#s2n').onclick=()=>{
      const nom=v('rNom'),cif=v('rCif'),cont=v('rCont'),tel=v('rTel'),email=v('rEmail').toLowerCase(),pass=v('rPass'),pais=v('rPais'),dir=v('rDir'),err=_container.querySelector('#rE2');
      if(!nom||!cif||!cont||!tel||!email||!pass){err.textContent=r('eC');err.style.display='block';return;}
      if(pass.length<8){err.textContent=r('eP');err.style.display='block';return;}
      _regData={..._regData,nombre:nom,cif,contacto:cont,tel,email,pass,pais,direccion:dir,tipoEmp:tipoSel.value}; paintStep(3);
    };
    _container.querySelector('#s2b').onclick=()=>paintStep(1);
    return;
  }
  if (n===3) {
    _container.innerHTML = wrap(`${stepBar(3)}
      <div style="font-size:13px;font-weight:700;margin-bottom:8px">${r('rgT')}</div>
      <div style="font-size:10px;color:#b45309;padding:5px 9px;background:#fffbeb;border-radius:6px;border:1px solid #fde68a;margin-bottom:8px">${r('rgS')}</div>
      <div id="rRgpd" style="max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;font-size:12px;line-height:1.6;color:#374151;margin-bottom:10px">
        <h3 style="margin-bottom:8px">Protección de Datos — RGPD</h3>
        <p>El responsable del tratamiento es el organizador del evento. Los datos se tratarán exclusivamente para la gestión logística y de acceso al recinto. Se conservarán hasta 2 años después del evento.</p>
        <p style="margin-top:8px">De conformidad con el RGPD (UE) 2016/679, el interesado tiene derecho a acceder, rectificar, suprimir, limitar, portar y oponerse al tratamiento de sus datos. Contacto: privacidad@beunifyt.com</p>
        <p style="margin-top:8px">Los datos no serán cedidos a terceros salvo obligación legal.</p>
        <p style="margin-top:8px;color:transparent">.</p>
      </div>
      <div id="rArea" style="opacity:.4;pointer-events:none;transition:opacity .3s">
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;margin-bottom:8px"><input type="checkbox" id="rC1" style="flex-shrink:0;margin-top:2px">${r('rgC1')}</label>
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer"><input type="checkbox" id="rC2" style="flex-shrink:0;margin-top:2px">${r('rgC2')}</label>
      </div>
      ${errD('rE3')}${btnP('s3n',r('envC'))}${btnGh('s3b',r('atr'))}`);
    const rgpd=_container.querySelector('#rRgpd'),area=_container.querySelector('#rArea');
    rgpd.onscroll=()=>{if(rgpd.scrollTop+rgpd.clientHeight>=rgpd.scrollHeight-10){area.style.opacity='1';area.style.pointerEvents='auto';}};
    _container.querySelector('#s3n').onclick=async()=>{
      if(!_container.querySelector('#rC1').checked||!_container.querySelector('#rC2').checked){const e=_container.querySelector('#rE3');e.textContent=r('eCh');e.style.display='block';return;}
      const otp=String(Math.floor(100000+Math.random()*900000));
      _otpHash=await sha256(otp+_regData.email);
      if(location.hostname==='localhost'||location.hostname==='127.0.0.1')console.info('[reg] OTP:',otp);
      paintStep(4);
    };
    _container.querySelector('#s3b').onclick=()=>paintStep(2);
    return;
  }
  if (n===4) {
    const hint=_regData.email.replace(/(.{2}).+@/,'$1***@');
    _container.innerHTML = wrap(`${stepBar(4)}
      <div style="text-align:center;margin-bottom:16px"><div style="font-size:34px;margin-bottom:8px">📧</div><div style="font-size:13px;font-weight:700;margin-bottom:4px">${r('codE')}</div><div style="font-size:11px;color:#6b7280">${r('codA')} ${hint}</div></div>
      <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">${[0,1,2,3,4,5].map(i=>`<div id="ob${i}" style="width:44px;height:54px;border:2px solid #d1d5db;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#0f172a"></div>`).join('')}</div>
      <input type="tel" id="rOtp" maxlength="6" inputmode="numeric" placeholder="000000" style="width:100%;text-align:center;font-size:24px;letter-spacing:8px;padding:10px;border:1.5px solid #d1d5db;border-radius:8px;margin-bottom:8px;outline:none;background:#fff;color:#1a1a1a">
      ${errD('rE4')}${btnG('s4c',r('conf'))}${btnGh('s4b',r('atr'))}`);
    const otpIn=_container.querySelector('#rOtp');
    otpIn.oninput=()=>{const d=otpIn.value.replace(/\D/g,'').slice(0,6);otpIn.value=d;for(let i=0;i<6;i++){const b=_container.querySelector('#ob'+i);if(b){b.textContent=d[i]||'';b.style.borderColor=d[i]?'#2563eb':'#d1d5db';b.style.background=d[i]?'#eff6ff':'';}}};
    _container.querySelector('#s4c').onclick=async()=>{
      const code=(otpIn.value||'').replace(/\D/g,''),err=_container.querySelector('#rE4');
      if(code.length!==6){err.textContent=r('eO');err.style.display='block';return;}
      const h=await sha256(code+_regData.email);
      if(h!==_otpHash){err.textContent=r('eOM');err.style.display='block';return;}
      err.style.display='none';const btn=_container.querySelector('#s4c');btn.disabled=true;btn.textContent=r('reg');
      try{
        const{initFirestore,fsSet}=await import('./firestore.js');await initFirestore(FIREBASE_CONFIG);
        const FB='https://www.gstatic.com/firebasejs/10.12.0';
        const{createUserWithEmailAndPassword,updateProfile}=await import(`${FB}/firebase-auth.js`);
        const{getBEUAuth}=await import('./firestore.js');
        const cred=await createUserWithEmailAndPassword(getBEUAuth(),_regData.email,_regData.pass);
        await updateProfile(cred.user,{displayName:_regData.nombre});
        const uid=cred.user.uid;
        await fsSet('companies/'+uid,{id:uid,nombre:_regData.nombre,cif:_regData.cif,tipoEmpresa:_regData.tipoEmp,contacto:_regData.contacto,tel:_regData.tel,email:_regData.email,pais:_regData.pais,direccion:_regData.direccion,nivel:'semi',tipo:'empresa',vehiculos:[],creadoTs:new Date().toISOString()},false);
        await fsSet('users/'+uid,{id:uid,nombre:_regData.nombre,email:_regData.email,rol:'empresa',idioma:_regData.lang||'es',tema:'light',empresaId:uid,nivel:'semi',tabs:['dash','ingresos','conductores','agenda'],permisos:{canAdd:true,canEdit:true,canDel:false,canExport:true}},false);
        const ret=new Date();ret.setFullYear(ret.getFullYear()+2);
        await fsSet('companies/'+uid+'/consentimientos/rgpd_'+Date.now(),{empresaId:uid,ts:new Date().toISOString(),lang:_regData.lang||'es',conservaHasta:ret.toISOString().slice(0,10),firmado:true,firmadoPor:_regData.nombre},false);
        _regData._uid=uid;paintStep(5);
      }catch(e){btn.disabled=false;btn.textContent=r('conf');const msg=(e?.code||'').includes('email-already-in-use')?r('eEm'):'Error: '+(e?.message||'');err.textContent=msg;err.style.display='block';}
    };
    _container.querySelector('#s4b').onclick=()=>paintStep(3);
    return;
  }
  if (n===5) {
    _container.innerHTML = wrap(`<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">✅</div><div style="font-size:15px;font-weight:800;color:#0d9f6e;margin-bottom:8px">${r('ok')}</div><div style="font-size:12px;color:#374151;margin-bottom:16px;line-height:1.6">${r('okD')}</div>${btnG('s5e',r('ent'))}</div>`);
    _container.querySelector('#s5e').onclick=async()=>{try{const FB='https://www.gstatic.com/firebasejs/10.12.0';const{signInWithEmailAndPassword}=await import(`${FB}/firebase-auth.js`);const{getBEUAuth,fsGet}=await import('./firestore.js');const cred=await signInWithEmailAndPassword(getBEUAuth(),_regData.email,_regData.pass);const ud=await fsGet('users/'+cred.user.uid);const{buildUsuario,launchShell}=await import('./app.js');const u=buildUsuario(ud||{nombre:_regData.nombre,email:_regData.email,rol:'empresa',idioma:_regData.lang||'es'},cred.user.uid);localStorage.setItem('beu_session',JSON.stringify({uid:cred.user.uid,idioma:u.idioma,rol:u.rol,timestamp:Date.now()}));launchShell(u);}catch(e){import('./auth.js').then(m=>m.renderLogin(_container));}};
  }
}

function v(id){return(_container.querySelector('#'+id)?.value||'').trim();}
