// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — auth.js — Login
// Dos botones iguales: Acceder + Registrar Empresa
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { trFree, LANGS_UI } from './langs.js';
import { toast, safeHtml } from './utils.js';
import { FIREBASE_CONFIG } from './config.js';

let _container = null;

export function renderLogin(container) { _container = container; paint(); }

function flagHtml(code) {
  const l = LANGS_UI.find(x => x.code === code);
  if (!l) return '🌐';
  return l.flag.includes('<svg') ? l.flag : `<span style="font-size:18px">${l.flag}</span>`;
}

function paint() {
  const lang = AppState.get('currentLang') || 'es';
  const t = (k) => trFree('auth', k);

  // Forzar fondo claro en login — sin importar tema guardado
  document.body.style.background = '#f5f7fa';
  document.body.style.color = '#1a1a1a';

  _container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;font-family:system-ui,sans-serif;background:#f5f7fa">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:380px;box-shadow:0 4px 24px rgba(0,0,0,.08);position:relative;color:#1a1a1a">

        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;font-style:italic;color:#0f172a">BeUnifyT</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;letter-spacing:1px">unified access control</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;position:relative">
          <button id="langBtn" style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px;color:#1a1a1a">
            ${flagHtml(lang)} ${lang.toUpperCase()}
          </button>
          <div id="langDrop" style="display:none;position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.12);max-height:300px;overflow-y:auto;z-index:100;width:220px;flex-direction:column;gap:2px;color:#1a1a1a"></div>
        </div>

        <div id="loginError" style="display:none;background:#fef2f2;color:#dc2626;border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:12px;text-align:center"></div>

        <div style="margin-bottom:12px">
          <label style="font-size:11px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">${t('email')}</label>
          <input id="loginEmail" type="email" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;background:#fff;color:#1a1a1a" autocomplete="email">
        </div>

        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">${t('password')}</label>
          <input id="loginPass" type="password" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;background:#fff;color:#1a1a1a" autocomplete="current-password">
        </div>

        <!-- DOS BOTONES DEL MISMO TAMAÑO -->
        <button id="loginBtn" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px">
          ${t('login')}
        </button>

        <button id="registerBtn" style="width:100%;padding:12px;background:#10b981;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">
          ${t('register')}
        </button>

        <div style="text-align:center;margin-top:12px">
          <a href="#" id="forgotLink" style="color:#3b82f6;text-decoration:none;font-size:12px">${t('forgot')}</a>
        </div>
      </div>
    </div>`;

  // Dropdown vertical
  const langBtn = _container.querySelector('#langBtn');
  const langDrop = _container.querySelector('#langDrop');
  langDrop.innerHTML = LANGS_UI.map(l => {
    const fH = l.flag.includes('<svg') ? l.flag : `<span style="font-size:16px">${l.flag}</span>`;
    return `<div class="lang-opt" data-code="${l.code}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;white-space:nowrap;color:#1a1a1a;${l.code===lang?'background:#eff6ff;font-weight:700;':''}">${fH} ${l.name}</div>`;
  }).join('');
  langBtn.onclick = (e) => { e.stopPropagation(); langDrop.style.display = langDrop.style.display==='flex'?'none':'flex'; };
  langDrop.querySelectorAll('.lang-opt').forEach(el => {
    el.onmouseenter = () => { if(el.dataset.code!==lang) el.style.background='#f8fafc'; };
    el.onmouseleave = () => { if(el.dataset.code!==lang) el.style.background=''; };
    el.onclick = () => { AppState.set('currentLang', el.dataset.code); langDrop.style.display='none'; paint(); };
  });
  document.addEventListener('click', () => { langDrop.style.display='none'; });

  _container.querySelector('#loginBtn').onclick = () => doLogin();
  _container.querySelector('#loginPass').onkeydown = (e) => { if(e.key==='Enter') doLogin(); };
  _container.querySelector('#registerBtn').onclick = () => { import('./empresa_form.js').then(m=>m.renderRegistro(_container)).catch(()=>toast(trFree('shell','error'),'#dc2626')); };
  _container.querySelector('#forgotLink').onclick = (e) => { e.preventDefault(); import('./recuperar.js').then(m=>m.renderRecuperar(_container)).catch(()=>toast(trFree('shell','error'),'#dc2626')); };
}

async function doLogin() {
  const email = _container.querySelector('#loginEmail').value.trim();
  const pass = _container.querySelector('#loginPass').value;
  const errBox = _container.querySelector('#loginError');
  const btn = _container.querySelector('#loginBtn');
  const t = (k) => trFree('auth', k);
  if (!email || !pass) { showError(errBox, t('error_cred')); return; }
  btn.disabled = true; btn.textContent = '...';
  try {
    const { initFirestore, fsGet, fsUpdate } = await import('./firestore.js');
    await initFirestore(FIREBASE_CONFIG);
    const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
    const { signInWithEmailAndPassword } = await import(`${FB}/firebase-auth.js`);
    const { getBEUAuth } = await import('./firestore.js');
    const cred = await signInWithEmailAndPassword(getBEUAuth(), email, pass);
    const uid = cred.user.uid;
    const userData = await fsGet(`users/${uid}`);
    if (!userData) { showError(errBox, t('error_cred')); btn.disabled=false; btn.textContent=t('login'); return; }
    const { buildUsuario, launchShell } = await import('./app.js');
    const usuario = buildUsuario(userData, uid);
    const loginLang = AppState.get('currentLang');
    if (loginLang !== usuario.idioma) { usuario.idioma = loginLang; await fsUpdate(`users/${uid}`, { idioma: loginLang }).catch(()=>{}); }
    localStorage.setItem('beu_session', JSON.stringify({ uid, idioma:usuario.idioma, rol:usuario.rol, timestamp:Date.now() }));
    AppState.set('currentUser', usuario); AppState.set('currentLang', usuario.idioma); AppState.set('theme', usuario.tema);
    toast(t('welcome')+', '+safeHtml(usuario.nombre), '#10b981');
    launchShell(usuario);
  } catch (e) {
    console.error('Login error:', e);
    const msg = (e.code==='auth/invalid-credential'||e.code==='auth/wrong-password'||e.code==='auth/user-not-found') ? t('error_cred') : t('error_net');
    showError(errBox, msg); btn.disabled=false; btn.textContent=t('login');
  }
}

function showError(box, msg) { box.textContent=msg; box.style.display='block'; setTimeout(()=>{box.style.display='none';},4000); }
