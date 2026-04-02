// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — app.js
// Entry point. Inicializa servicios y enruta al módulo correcto.
// ═══════════════════════════════════════════════════════════

import { initDB }       from './db.js';
import { initFirestore } from './firestore.js';
import { initAuth, getCurrentUser } from './auth.js';
import { initState, AppState } from './state.js';
import { loadLang }     from './i18n.js';
import { toast }        from './utils.js';

// ── Bootstrap ───────────────────────────────────────────────
async function bootstrap() {
  try {
    // 1. Base de datos local (IndexedDB) — siempre primero
    await initDB();

    // 2. Estado global centralizado
    await initState();

    // 3. Idioma por defecto (es + en fallback)
    const savedLang = localStorage.getItem('beu_lang') || 'es';
    await loadLang(savedLang);
    AppState.set('currentLang', savedLang);

    // 4. Firestore
    initFirestore(window.FIREBASE_CONFIG);

    // 5. Auth — detecta si hay sesión activa
    const user = await initAuth();

    // 6. Enrutar según resultado de auth
    if (user) {
      await routeByRole(user);
    } else {
      await showLogin();
    }

  } catch (err) {
    console.error('[BeUnifyT] Error en bootstrap:', err);
    showFatalError(err);
  }
}

// ── Router por rol ──────────────────────────────────────────
async function routeByRole(user) {
  const role = user.role; // 'operator' | 'company' | 'admin'

  AppState.set('currentUser', user);

  if (role === 'operator' || role === 'admin') {
    const { initOperator } = await import('./modules/operator.js');
    await initOperator();

  } else if (role === 'company') {
    const { initPortal } = await import('./modules/portal.js');
    await initPortal();

  } else {
    // Rol desconocido — volver al login
    await showLogin();
  }

  // Ocultar loading screen cuando la UI está montada
  window.hideLoadingScreen?.();
}

// ── Login screen ────────────────────────────────────────────
async function showLogin() {
  const { initLogin } = await import('./modules/login.js');
  await initLogin();
  window.hideLoadingScreen?.();
}

// ── Error fatal (no recuperable) ────────────────────────────
function showFatalError(err) {
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
        font-weight:600;cursor:pointer
      ">Reintentar</button>
      <div style="font-size:11px;color:var(--text4);font-family:'JetBrains Mono',monospace">
        v${window.APP_VERSION}
      </div>
    </div>
  `;
}

// ── Arrancar ─────────────────────────────────────────────────
bootstrap();
