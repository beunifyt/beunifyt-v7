// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — state.js — Estado centralizado
// ═══════════════════════════════════════════════════════════

const _state = {
  currentUser:   null,
  currentEvent:  null,
  currentGate:   null,
  sessionExp:    null,

  currentLang:   'es',
  theme:         'light',
  activeTab:     'dash',
  syncStatus:    'ok',

  lastIngreso:   null,
  isOnline:      navigator.onLine,
};

const _listeners = {};

export const AppState = {
  get(key) { return _state[key]; },

  set(key, value) {
    if (!(key in _state)) {
      console.warn(`AppState: clave desconocida "${key}"`);
      return;
    }
    const old = _state[key];
    _state[key] = value;
    (_listeners[key] || []).forEach(fn => {
      try { fn(value, old); } catch(e) { console.warn('AppState listener error', key, e); }
    });
  },

  watch(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
    return () => { _listeners[key] = (_listeners[key] || []).filter(f => f !== fn); };
  },

  snapshot() { return { ..._state }; },
};

window.addEventListener('online',  () => AppState.set('isOnline', true));
window.addEventListener('offline', () => AppState.set('isOnline', false));
