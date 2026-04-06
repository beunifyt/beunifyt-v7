// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — app.js — Punto de entrada
// Revisa sesión → login o carga directa
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { detectLang } from './langs.js';

const SPLASH = document.getElementById('splash');
const APP = document.getElementById('app');

async function boot() {
  try {
    // Detectar idioma temporal del navegador
    const browserLang = detectLang(navigator.language);
    AppState.set('currentLang', browserLang);

    // ¿Hay sesión guardada?
    const raw = localStorage.getItem('beu_session');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        const age = Date.now() - (session.timestamp || 0);
        // Sesión válida 24h
        if (age < 86400000 && session.uid) {
          AppState.set('currentLang', session.idioma || browserLang);
          await resumeSession(session);
          return;
        }
      } catch (e) { /* sesión corrupta, ir a login */ }
      localStorage.removeItem('beu_session');
    }

    // No hay sesión → pintar login
    showLogin();
  } catch (e) {
    console.error('Boot error:', e);
    showLogin();
  }
}

async function resumeSession(session) {
  try {
    const { initFirestore } = await import('./firestore.js');
    const { FIREBASE_CONFIG } = await import('./config.js');
    await initFirestore(FIREBASE_CONFIG);

    const { fsGet } = await import('./firestore.js');
    const userData = await fsGet(`users/${session.uid}`);
    if (!userData) {
      localStorage.removeItem('beu_session');
      showLogin();
      return;
    }

    const usuario = buildUsuario(userData, session.uid);
    AppState.set('currentUser', usuario);
    AppState.set('currentLang', usuario.idioma);
    launchShell(usuario);
  } catch (e) {
    console.error('Resume error:', e);
    localStorage.removeItem('beu_session');
    showLogin();
  }
}

function showLogin() {
  SPLASH.style.display = 'none';
  APP.style.display = 'block';
  import('./auth.js').then(m => m.renderLogin(APP));
}

export function launchShell(usuario) {
  SPLASH.style.display = 'none';
  APP.style.display = 'block';
  APP.innerHTML = '';
  import('./operator.js').then(m => m.renderShell(APP, usuario));
}

export function buildUsuario(data, uid) {
  return {
    uid,
    nombre: data.nombre || '',
    email: data.email || '',
    rol: data.rol || 'operador',
    idioma: data.idioma || AppState.get('currentLang') || 'es',
    tema: data.tema || 'light',
    recinto: data.recinto || '',
    tabs: data.tabs || ['dash'],
    permisos: data.permisos || {},
    evento: data.evento || null,
    pin: data.pin || null,
    twoFA: data.twoFA || false,
  };
}

export function logout() {
  localStorage.removeItem('beu_session');
  AppState.set('currentUser', null);
  AppState.set('activeTab', 'dash');
  APP.innerHTML = '';
  showLogin();
}

// Arrancar
boot();
