// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — auth.js — Solo login + verificación
// Registro empresa, recuperar clave, OTP → archivos separados
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree, LANGS_UI, getFlag } from './langs.js';
import { toast, safeHtml } from './utils.js';
import { FIREBASE_CONFIG } from './config.js';

let _container = null;

export function renderLogin(container) {
  _container = container;
  paint();
}

function paint() {
  const lang = AppState.get('currentLang') || 'es';
  const t = (k) => trFree('auth', k);

  _container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;font-family:system-ui,sans-serif">
      <div style="background:var(--card-bg,#fff);border-radius:16px;padding:32px;width:100%;max-width:380px;box-shadow:0 4px 24px rgba(0,0,0,.08)">

        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px">BeUnifyT</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px">unified access control</div>
        </div>

        <div style="text-align:center;margin-bottom:20px">
          <button id="langBtn" style="background:none;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:14px">
            ${getFlag(lang)} ${lang.toUpperCase()}
          </button>
          <div id="langDrop" style="display:none;position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-top:4px;box-shadow:0 8px 24px rgba(0,0,0,.12);max-height:240px;overflow-y:auto;z-index:100;left:50%;transform:translateX(-50%);width:280px;display:none;flex-wrap:wrap;gap:4px;justify-content:center"></div>
        </div>

        <div id="loginError" style="display:none;background:#fef2f2;color:#dc2626;border-radius:8px;padding:8px 12px;font-size:12px;margin-bottom:12px;text-align:center"></div>

        <div style="margin-bottom:12px">
          <label style="font-size:11px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">${t('email')}</label>
          <input id="loginEmail" type="email" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none" autocomplete="email">
        </div>

        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">${t('password')}</label>
          <input id="loginPass" type="password" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none" autocomplete="current-password">
        </div>

        <button id="loginBtn" style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s">
          ${t('login')}
        </button>

        <div style="display:flex;justify-content:space-between;margin-top:14px;font-size:12px">
          <a href="#" id="forgotLink" style="color:#3b82f6;text-decoration:none">${t('forgot')}</a>
          <a href="#" id="registerLink" style="color:#3b82f6;text-decoration:none">${t('register')}</a>
        </div>

      </div>
    </div>
  `;

  // Eventos
  const langBtn = _container.querySelector('#langBtn');
  const langDrop = _container.querySelector('#langDrop');

  // Construir dropdown de idiomas
  langDrop.innerHTML = LANGS_UI.map(l =>
    `<div class="lang-opt" data-code="${l.code}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:12px;border:1px solid ${l.code === lang ? '#3b82f6' : 'transparent'};background:${l.code === lang ? '#eff6ff' : 'transparent'}">${l.flag} ${l.name}</div>`
  ).join('');

  langBtn.onclick = () => {
    langDrop.style.display = langDrop.style.display === 'none' ? 'flex' : 'none';
  };

  langDrop.querySelectorAll('.lang-opt').forEach(el => {
    el.onclick = () => {
      AppState.set('currentLang', el.dataset.code);
      langDrop.style.display = 'none';
      paint(); // Re-pintar login en nuevo idioma
    };
  });

  // Login
  _container.querySelector('#loginBtn').onclick = () => doLogin();
  _container.querySelector('#loginPass').onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };

  // Registro empresa
  _container.querySelector('#registerLink').onclick = (e) => {
    e.preventDefault();
    import('./empresa_form.js').then(m => m.renderRegistro(_container)).catch(() => toast('Error cargando registro', '#dc2626'));
  };

  // Recuperar clave
  _container.querySelector('#forgotLink').onclick = (e) => {
    e.preventDefault();
    import('./recuperar.js').then(m => m.renderRecuperar(_container)).catch(() => toast('Error cargando recuperación', '#dc2626'));
  };
}

async function doLogin() {
  const email = _container.querySelector('#loginEmail').value.trim();
  const pass = _container.querySelector('#loginPass').value;
  const errBox = _container.querySelector('#loginError');
  const btn = _container.querySelector('#loginBtn');
  const t = (k) => trFree('auth', k);

  if (!email || !pass) { showError(errBox, t('error_cred')); return; }

  btn.disabled = true;
  btn.textContent = '...';

  try {
    // Cargar Firebase AQUÍ — no antes
    const { initFirestore, fsGet, fsUpdate } = await import('./firestore.js');
    await initFirestore(FIREBASE_CONFIG);

    const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
    const { getAuth, signInWithEmailAndPassword } = await import(`${FB}/firebase-auth.js`);
    const { getBEUAuth } = await import('./firestore.js');
    const auth = getBEUAuth();

    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;

    // Buscar datos del usuario en Firestore
    const userData = await fsGet(`users/${uid}`);
    if (!userData) {
      showError(errBox, t('error_cred'));
      btn.disabled = false;
      btn.textContent = t('login');
      return;
    }

    // Construir objeto usuario
    const { buildUsuario, launchShell } = await import('./app.js');
    const usuario = buildUsuario(userData, uid);

    // Si el idioma elegido en login difiere del guardado → actualizar
    const loginLang = AppState.get('currentLang');
    if (loginLang !== usuario.idioma) {
      usuario.idioma = loginLang;
      await fsUpdate(`users/${uid}`, { idioma: loginLang }).catch(() => {});
    }

    // Guardar sesión
    localStorage.setItem('beu_session', JSON.stringify({
      uid, idioma: usuario.idioma, rol: usuario.rol, timestamp: Date.now()
    }));

    AppState.set('currentUser', usuario);
    AppState.set('currentLang', usuario.idioma);
    AppState.set('theme', usuario.tema);

    toast(t('welcome') + ', ' + safeHtml(usuario.nombre), '#10b981');
    launchShell(usuario);

  } catch (e) {
    console.error('Login error:', e);
    const msg = e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found'
      ? t('error_cred') : t('error_net');
    showError(errBox, msg);
    btn.disabled = false;
    btn.textContent = t('login');
  }
}

function showError(box, msg) {
  box.textContent = msg;
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 4000);
}
