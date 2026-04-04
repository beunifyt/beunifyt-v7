// BeUnifyT v7 — app.js — Entry point
import { initFirestore } from './firestore.js';
import { initAuth }      from './auth.js';
import { AppState }      from './state.js';

const FIREBASE_CONFIG = window.BEU_CONFIG || {
  apiKey:            'AIzaSyBKMfHEcnRAJJ9zotIXu3hluFpyjwQDfq4',
  authDomain:        'beunifyt-prod.firebaseapp.com',
  projectId:         'beunifyt-prod',
  storageBucket:     'beunifyt-prod.firebasestorage.app',
  messagingSenderId: '392352190516',
  appId:             '1:392352190516:web:fb4431ca96ab29a5feba61',
};

function _status(m) { try { window.setSplashStatus?.(m); } catch(e) {} }

async function bootstrap() {
  _status('applying theme…');
  try { const t = localStorage.getItem('beu_theme')||'default'; document.documentElement.setAttribute('data-theme',t); AppState.set('theme',t); } catch(e) {}
  try { const l = localStorage.getItem('beu_lang'); if(l) AppState.set('currentLang',l); } catch(e) {}
  _status('connecting firebase…');
  await initFirestore(FIREBASE_CONFIG);
  _status('checking session…');
  await initAuth();
}

window.addEventListener('unhandledrejection', e => console.error('[BEU]', e.reason));
bootstrap().catch(e => { console.error('[BEU] Bootstrap:', e); try { window.showError?.(e?.message||String(e)); } catch(e) {} });
