// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — firestore.js
// Adaptador Firestore. Sin limite de conexiones simultaneas.
// Datos particionados: cada usuario carga SOLO sus datos.
// ═══════════════════════════════════════════════════════════

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

let _app  = null;
let _db   = null;
let _auth = null;
let _ready = false;

// ── Inicializar Firebase (await obligatorio antes de usar auth) ──
export async function initFirestore(config) {
  if (_ready) return _db;

  const { initializeApp }    = await import(`${FB_CDN}/firebase-app.js`);
  const { getFirestore }     = await import(`${FB_CDN}/firebase-firestore.js`);
  const { getAuth }          = await import(`${FB_CDN}/firebase-auth.js`);

  _app   = initializeApp(config);
  _db    = getFirestore(_app);
  _auth  = getAuth(_app);
  _ready = true;

  console.info('[Firestore] Firebase inicializado correctamente');
  return _db;
}

export const getDB       = () => _db;
export const getFireAuth = () => _auth;
export const getApp      = () => _app;
export const isReady     = () => _ready;

// ══════════════════════════════════════════════════════════════
// Config del evento (solo lectura)
// ══════════════════════════════════════════════════════════════
export const fsConfig = {
  async getEvent(eventId) {
    const { doc, getDoc } = await _fs();
    const snap = await getDoc(doc(_db, 'events', eventId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async listEvents() {
    const { collection, getDocs, orderBy, query } = await _fs();
    const q    = query(collection(_db, 'events'), orderBy('startDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ══════════════════════════════════════════════════════════════
// Empresa — solo su companyId (lectura unica, sin listener)
// ══════════════════════════════════════════════════════════════
export const fsCompany = {

  async getProfile(eventId, companyId) {
    const { doc, getDoc } = await _fs();
    const snap = await getDoc(doc(_db, 'events', eventId, 'companies', companyId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async updateProfile(eventId, companyId, data) {
    const { doc, updateDoc, serverTimestamp } = await _fs();
    await updateDoc(
      doc(_db, 'events', eventId, 'companies', companyId),
      { ...data, updatedAt: serverTimestamp() }
    );
  },

  async getVehicles(eventId, companyId) {
    const { collection, getDocs } = await _fs();
    const snap = await getDocs(
      collection(_db, 'events', eventId, 'companies', companyId, 'vehicles')
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addVehicle(eventId, companyId, vehicle) {
    const { collection, addDoc, serverTimestamp } = await _fs();
    const ref = await addDoc(
      collection(_db, 'events', eventId, 'companies', companyId, 'vehicles'),
      { ...vehicle, createdAt: serverTimestamp() }
    );
    return ref.id;
  },

  async updateVehicle(eventId, companyId, vehicleId, data) {
    const { doc, updateDoc, serverTimestamp } = await _fs();
    await updateDoc(
      doc(_db, 'events', eventId, 'companies', companyId, 'vehicles', vehicleId),
      { ...data, updatedAt: serverTimestamp() }
    );
  },

  async deleteVehicle(eventId, companyId, vehicleId) {
    const { doc, deleteDoc } = await _fs();
    await deleteDoc(
      doc(_db, 'events', eventId, 'companies', companyId, 'vehicles', vehicleId)
    );
  },

  async getEntries(eventId, companyId, limitN = 50) {
    const { collection, getDocs, orderBy, query, limit } = await _fs();
    const q = query(
      collection(_db, 'events', eventId, 'companies', companyId, 'entries'),
      orderBy('ts', 'desc'),
      limit(limitN)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ══════════════════════════════════════════════════════════════
// Puerta — listener real-time solo para operadores (max 35)
// ══════════════════════════════════════════════════════════════
export const fsGate = {

  subscribeQueue(eventId, gateId, onUpdate, onError) {
    let unsubscribe = null;
    _fs().then(({ collection, query, orderBy, limit, onSnapshot }) => {
      const q = query(
        collection(_db, 'events', eventId, 'gates', gateId, 'queue'),
        orderBy('ts', 'desc'),
        limit(100)
      );
      unsubscribe = onSnapshot(
        q,
        snap => onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        onError
      );
    });
    return () => { if (unsubscribe) unsubscribe(); };
  },

  async registerEntry(eventId, gateId, vehicle) {
    const { collection, addDoc, doc, setDoc, serverTimestamp } = await _fs();
    const entry = {
      ...vehicle,
      gateId,
      ts: new Date().toISOString(),
      type: 'entry',
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(
      collection(_db, 'events', eventId, 'gates', gateId, 'queue'),
      entry
    );
    if (vehicle.companyId) {
      await setDoc(
        doc(_db, 'events', eventId, 'companies', vehicle.companyId, 'entries', ref.id),
        { ...entry, id: ref.id }
      );
    }
    return ref.id;
  },

  async registerExit(eventId, gateId, entryId, extraData = {}) {
    const { doc, updateDoc, serverTimestamp } = await _fs();
    await updateDoc(
      doc(_db, 'events', eventId, 'gates', gateId, 'queue', entryId),
      { salida: new Date().toISOString(), exitGateId: gateId,
        ...extraData, updatedAt: serverTimestamp() }
    );
  },

  async searchPlate(eventId, plate) {
    const { collectionGroup, query, where, getDocs } = await _fs();
    const q = query(
      collectionGroup(_db, 'queue'),
      where('matricula', '==', plate.toUpperCase().trim())
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

// ══════════════════════════════════════════════════════════════
// Operadores (gestion admin)
// ══════════════════════════════════════════════════════════════
export const fsOperators = {
  async list(eventId) {
    const { collection, getDocs } = await _fs();
    const snap = await getDocs(collection(_db, 'events', eventId, 'operators'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async upsert(eventId, operatorId, data) {
    const { doc, setDoc, serverTimestamp } = await _fs();
    await setDoc(
      doc(_db, 'events', eventId, 'operators', operatorId),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }
};

async function _fs() {
  return import(`${FB_CDN}/firebase-firestore.js`);
}
