// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — app.js
// Entry point. Inicializa servicios y enruta al modulo correcto.
// ═══════════════════════════════════════════════════════════

import { initDB }        from './db.js';
import { initFirestore } from './firestore.js';
import { initState, AppState } from './state.js';
import { loadLang }      from './i18n.js';

async function bootstrap() {
  try {
    // 1. IndexedDB local
    await initDB();

    // 2. Estado global
    await initState();

    // 3. Idioma
    const savedLang = localStorage.getItem('beu_lang') || 'es';
    await loadLang(savedLang);
    AppState.set('currentLang', savedLang);

    // 4. Firebase — DEBE completar antes de llamar a initAuth
    await initFirestore(window.FIREBASE_CONFIG);

    // 5. Auth — ahora Firebase ya esta listo
    const { initAuth } = await import('./auth.js');
    const user = await initAuth();

    // 6. Enrutar
    if (user) {
      await _routeByRole(user);
    } else {
      await _showLogin();
    }

  } catch (err) {
    console.error('[BeUnifyT] Error en bootstrap:', err);
    _showFatalError(err);
  }
}

async function _routeByRole(user) {
  AppState.set('currentUser', user);

  if (user.role === 'operator' || user.role === 'admin') {
    const { initOperator } = await import('./modules/operator.js');
    await initOperator();
  } else if (user.role === 'company') {
    const { initPortal } = await import('./modules/portal.js');
    await initPortal();
  } else {
    await _showLogin();
  }

  window.hideLoadingScreen?.();
}

async function _showLogin() {
  const { initLogin } = await import('./modules/login.js');
  await initLogin();
  window.hideLoadingScreen?.();
}

function _showFatalError(err) {
  window.hideLoadingScreen?.();
  const root = document.getElementById('app-root');
  if (!root) return;
  root.innerHTML = `
    <div style="
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;min-height:100vh;gap:16px;
      font-family:'Inter',sans-serif;padding:24px;text-align:center
    ">
      <div style="font-size:32px">⚠️</div>
      <div style="font-size:17px;font-weight:700;color:var(--text)">
        Error al iniciar BeUnifyT
      </div>
      <div style="font-size:13px;color:var(--text3);max-width:380px;line-height:1.5">
        ${err?.message || 'Error desconocido'}
      </div>
      <button onclick="location.reload()" style="
        margin-top:8px;padding:10px 24px;border-radius:8px;border:none;
        background:var(--blue);color:#fff;font-size:14px;
        font-weight:600;cursor:pointer;font-family:inherit
      ">Reintentar</button>
      <div style="font-size:11px;color:var(--text4);font-family:'JetBrains Mono',monospace">
        v${window.APP_VERSION}
      </div>
    </div>
  `;
}

bootstrap();
