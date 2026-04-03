// BeUnifyT v7 — app.js — Router principal
import { initDB }              from './db.js';
import { initFirestore }       from './firestore.js';
import { initState, AppState } from './state.js';
import { loadLang }            from './i18n.js';

async function bootstrap() {
  try {
    await initDB();
    await initState();
    const savedLang = localStorage.getItem('beu_lang') || 'es';
    await loadLang(savedLang);
    AppState.set('currentLang', savedLang);
    await initFirestore(window.FIREBASE_CONFIG);
    const { initAuth } = await import('./auth.js');
    const user = await initAuth();
    if (user) await _route(user);
    else await _showLogin();
  } catch (err) {
    console.error('[BeUnifyT] Error en bootstrap:', err);
    _fatalError(err);
  }
}

async function _route(user) {
  AppState.set('currentUser', user);
  const isAdmin = user.role === 'admin';
  const params = new URLSearchParams(location.search);

  // Admin panel — URL: ?admin
  if (isAdmin && params.has('admin')) {
    const { initAdmin } = await import('./modules/admin.js');
    await initAdmin();
  }
  // Dashboard — URL: ?dash
  else if (params.has('dash') && (isAdmin || user.role === 'supervisor')) {
    const root = document.getElementById('app-root');
    root.innerHTML = _dashShell();
    const { initDashboard } = await import('./modules/dashboard.js');
    await initDashboard('dashContainer');
  }
  // Mensajes — URL: ?msg
  else if (params.has('msg')) {
    const root = document.getElementById('app-root');
    root.innerHTML = _msgShell(user);
    const { initMensajes } = await import('./modules/mensajes.js');
    await initMensajes('msgContainer');
  }
  // Portal empresa
  else if (user.role === 'company') {
    const { initPortal } = await import('./modules/portal.js');
    await initPortal();
  }
  // Operador (default para admin, supervisor, operator)
  else {
    const { initOperator } = await import('./modules/operator.js');
    await initOperator();
  }

  window.hideLoadingScreen?.();
}

// Shell para dashboard y mensajes cuando se accede directamente
function _dashShell() {
  return `<div style="background:var(--bg);min-height:100vh">
    <div id="dashContainer"></div>
  </div>`;
}
function _msgShell(user) {
  return `<div style="background:var(--bg);min-height:100vh">
    <div id="msgContainer"></div>
  </div>`;
}

async function _showLogin() {
  const { initLogin } = await import('./modules/login.js');
  await initLogin();
  window.hideLoadingScreen?.();
}

function _fatalError(err) {
  window.hideLoadingScreen?.();
  const root = document.getElementById('app-root');
  if (!root) return;
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;font-family:'Inter',sans-serif;padding:24px;text-align:center;background:#f7f8fc">
      <svg viewBox="0 0 140 140" width="60" height="60"><rect width="140" height="140" rx="32" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
      <div style="font-size:17px;font-weight:700;color:#0f172a">Error al iniciar BeUnifyT</div>
      <div style="font-size:13px;color:#6b7280;max-width:380px;line-height:1.5">${err?.message||'Error desconocido'}</div>
      <button onclick="location.reload()" style="margin-top:8px;padding:10px 24px;border-radius:8px;border:none;background:#1a56db;color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Reintentar</button>
    </div>`;
}

bootstrap();
