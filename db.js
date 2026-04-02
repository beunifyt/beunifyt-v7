// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — db.js
// IndexedDB local. Reemplaza localStorage (límite 5MB → sin límite).
// Asíncrono: nunca bloquea la UI del operador.
// ═══════════════════════════════════════════════════════════

const DB_NAME    = 'beunifyt_v7';
const DB_VERSION = 1;

let _db = null;

// ── Abrir / crear la base de datos ──────────────────────────
export async function initDB() {
  if (_db) return _db;

  _db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Sesión del usuario activo
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session');
      }

      // Cola de vehículos de la puerta activa (solo operadores)
      if (!db.objectStoreNames.contains('gate_queue')) {
        const store = db.createObjectStore('gate_queue', { keyPath: 'id' });
        store.createIndex('matricula', 'matricula', { unique: false });
        store.createIndex('ts', 'ts', { unique: false });
      }

      // Vehículos de la empresa activa (solo portales empresa)
      if (!db.objectStoreNames.contains('my_vehicles')) {
        const store = db.createObjectStore('my_vehicles', { keyPath: 'id' });
        store.createIndex('matricula', 'matricula', { unique: false });
      }

      // Entradas recientes (cache local para búsqueda offline)
      if (!db.objectStoreNames.contains('recent_entries')) {
        const store = db.createObjectStore('recent_entries', { keyPath: 'id' });
        store.createIndex('matricula', 'matricula', { unique: false });
        store.createIndex('ts', 'ts', { unique: false });
      }

      // Cache general clave-valor
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache');
      }
    };
  });

  return _db;
}

// ── API pública ──────────────────────────────────────────────
export const localDB = {

  // ── Operaciones clave-valor (store: session, cache) ──
  async get(store, key) {
    await _ensureDB();
    return _tx(store, 'readonly', s => s.get(key));
  },

  async set(store, key, value) {
    await _ensureDB();
    return _tx(store, 'readwrite', s => s.put(value, key));
  },

  async del(store, key) {
    await _ensureDB();
    return _tx(store, 'readwrite', s => s.delete(key));
  },

  async clear(store) {
    await _ensureDB();
    return _tx(store, 'readwrite', s => s.clear());
  },

  // ── Operaciones con keyPath (store: gate_queue, my_vehicles, recent_entries) ──
  async getAll(store) {
    await _ensureDB();
    return _tx(store, 'readonly', s => s.getAll());
  },

  async getById(store, id) {
    await _ensureDB();
    return _tx(store, 'readonly', s => s.get(id));
  },

  async upsert(store, record) {
    await _ensureDB();
    return _tx(store, 'readwrite', s => s.put(record));
  },

  async upsertMany(store, records) {
    await _ensureDB();
    const db = _db;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const s  = tx.objectStore(store);
      records.forEach(r => s.put(r));
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  },

  async remove(store, id) {
    await _ensureDB();
    return _tx(store, 'readwrite', s => s.delete(id));
  },

  async findByIndex(store, indexName, value) {
    await _ensureDB();
    return _tx(store, 'readonly', s => s.index(indexName).getAll(value));
  },

  async count(store) {
    await _ensureDB();
    return _tx(store, 'readonly', s => s.count());
  },

  // Limpiar todo al cerrar sesión
  async clearSession() {
    await _ensureDB();
    await Promise.all([
      localDB.clear('session'),
      localDB.clear('gate_queue'),
      localDB.clear('my_vehicles'),
      localDB.clear('recent_entries'),
      localDB.clear('cache'),
    ]);
  }
};

// ── Helpers internos ─────────────────────────────────────────
async function _ensureDB() {
  if (!_db) await initDB();
}

function _tx(store, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx  = _db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
