// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — state.js
// AppState centralizado. Reemplaza las 44 variables globales de v6.
// Patrón: getter/setter con validación + sistema de listeners reactivos.
// ═══════════════════════════════════════════════════════════

// ── Estado interno ───────────────────────────────────────────
const _state = {
  // Usuario
  currentUser:    null,   // { uid, email, role, name, eventId, gateId? }

  // Evento activo
  currentEvent:   null,   // { id, name, dates, gates }
  currentGate:    null,   // { id, name, location } — solo operadores

  // Idioma y tema
  currentLang:    'es',
  theme:          'default',

  // Sincronización
  syncStatus:     'ok',   // 'ok' | 'syncing' | 'error' | 'offline'
  lastSync:       null,   // Date

  // UI
  activeTab:      null,   // tab activo en operador o portal
  searchQuery:    '',     // búsqueda activa

  // Flags
  isOnline:       true,
  isLoading:      false,
};

// ── Listeners reactivos ──────────────────────────────────────
const _listeners = {};

// ── AppState público ─────────────────────────────────────────
export const AppState = {

  // Obtener valor
  get(key) {
    if (!(key in _state)) {
      console.warn(`[AppState] Clave desconocida: "${key}"`);
      return undefined;
    }
    return _state[key];
  },

  // Establecer valor con validación
  set(key, value) {
    if (!(key in _state)) {
      throw new Error(`[AppState] Clave no permitida: "${key}". Añádela primero a _state.`);
    }
    const prev = _state[key];
    _state[key] = value;

    // Notificar a todos los listeners de esta clave
    if (_listeners[key]) {
      _listeners[key].forEach(fn => {
        try { fn(value, prev); }
        catch (e) { console.error(`[AppState] Error en listener de "${key}":`, e); }
      });
    }
  },

  // Suscribirse a cambios de una clave
  // Devuelve función para desuscribirse
  watch(key, fn) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(fn);
    return () => {
      _listeners[key] = _listeners[key].filter(f => f !== fn);
    };
  },

  // Snapshot del estado completo (solo lectura, para debug)
  snapshot() {
    return { ..._state };
  }
};

// ── Inicialización ───────────────────────────────────────────
export async function initState() {
  // Restaurar tema guardado
  const savedTheme = localStorage.getItem('beu_theme') || 'default';
  _state.theme = savedTheme;

  // Escuchar cambios de tema para aplicar al DOM
  AppState.watch('theme', (newTheme) => {
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    localStorage.setItem('beu_theme', newTheme);
  });

  // Escuchar cambios de idioma
  AppState.watch('currentLang', (newLang) => {
    localStorage.setItem('beu_lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
  });

  // Escuchar conectividad
  window.addEventListener('online',  () => AppState.set('isOnline', true));
  window.addEventListener('offline', () => AppState.set('isOnline', false));
  _state.isOnline = navigator.onLine;
}
