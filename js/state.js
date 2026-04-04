// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — state.js
// AppState centralizado. Reemplaza las 44+ variables globales de v6.
// ═══════════════════════════════════════════════════════════════════════

const _state = {
  // Auth
  currentUser:   null,   // { id, nombre, rol, email, lang, tabs, perms }
  currentEvent:  null,   // { id, nombre, ico, puertas[], ... }
  currentGate:   null,   // string: puerta activa
  sessionExp:    null,   // timestamp

  // UI
  currentLang:   'es',
  theme:         'default',  // 'default'|'dark'|'soft'|'contrast'
  activeTab:     'dash',
  syncStatus:    'ok',       // 'ok'|'syncing'|'error'|'offline'
  autoFill:      true,
  posAuto:       true,

  // Data snapshots (populated by operator.js / modules)
  lastIngreso:   null,   // último ingreso registrado (para impresion preview)
  qrBaseUrl:     'https://beunifyt.web.app/track',

  // Misc flags
  isOnline:      navigator.onLine,
};

const _listeners = {};

export const AppState = {
  get(key) {
    return _state[key];
  },

  set(key, value) {
    if (!(key in _state)) {
      console.warn(`AppState: clave desconocida "${key}" — se ignora`);
      return;
    }
    const old = _state[key];
    _state[key] = value;
    (_listeners[key] || []).forEach(fn => { try { fn(value, old); } catch(e) { console.warn('AppState listener error', key, e); } });
  },

  /** Subscribe to changes. Returns unsubscribe function. */
  watch(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
    return () => { _listeners[key] = (_listeners[key] || []).filter(f => f !== fn); };
  },

  /** Snapshot of entire state (debugging / export) */
  snapshot() { return { ..._state }; },
};

// Track online status
window.addEventListener('online',  () => AppState.set('isOnline', true));
window.addEventListener('offline', () => AppState.set('isOnline', false));
