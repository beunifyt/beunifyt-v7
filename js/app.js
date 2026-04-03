// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — app.js
// Entry point. Bootstrap: IndexedDB → Firestore → AppState → Auth
// ═══════════════════════════════════════════════════════════════════════
import { initFirestore }  from './firestore.js';
import { initAuth }       from './auth.js';
import { AppState }       from './state.js';

// ─── FIREBASE CONFIG ── injected from index.html via window.BEU_CONFIG ─
const FIREBASE_CONFIG = window.BEU_CONFIG || {
  apiKey:            'AIzaSyBKMfHEcnRAJJ9zotIXu3hluFpyjwQDfq4',
  authDomain:        'beunifyt-prod.firebaseapp.com',
  projectId:         'beunifyt-prod',
  storageBucket:     'beunifyt-prod.appspot.com',
  messagingSenderId: '000000000000',
  appId:             '1:000000000000:web:000000000000000000000000',
  databaseURL:       'https://beunifyt-prod-default-rtdb.europe-west1.firebasedatabase.app',
};

async function bootstrap() {
  // 1. Apply saved theme immediately (before any render)
  _applyTheme();

  // 2. Init Firestore
  await initFirestore(FIREBASE_CONFIG);

  // 3. Load saved language
  const savedLang = _getSavedLang();
  if (savedLang) AppState.set('currentLang', savedLang);

  // 4. Auth → decides which module to render
  await initAuth();
}

function _applyTheme() {
  try {
    const theme = localStorage.getItem('beu_theme') || 'default';
    document.documentElement.setAttribute('data-theme', theme);
    AppState.set('theme', theme);
  } catch {}
}

function _getSavedLang() {
  try { return localStorage.getItem('beu_lang') || null; } catch { return null; }
}

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────
window.addEventListener('unhandledrejection', e => {
  console.error('[BEU] Unhandled promise rejection:', e.reason);
});

// ─── BOOT ────────────────────────────────────────────────────────────
bootstrap().catch(err => {
  console.error('[BEU] Bootstrap failed:', err);
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui">
      <div style="text-align:center;padding:32px">
        <div style="font-size:48px;margin-bottom:16px">⚠️</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:8px">Error de inicio</div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:20px">${err?.message || 'Error desconocido'}</div>
        <button onclick="location.reload()" style="padding:10px 24px;border:none;border-radius:20px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;cursor:pointer">Reintentar</button>
      </div>
    </div>`;
});
