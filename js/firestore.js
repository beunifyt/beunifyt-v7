// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — firestore.js
// Adaptador Firestore. Todos los módulos importan getDB() desde aquí.
// Firebase config se inyecta desde index.html vía initFirestore().
// ═══════════════════════════════════════════════════════════════════════

const FB_BASE = 'https://www.gstatic.com/firebasejs/10.12.0';

let _db   = null;
let _app  = null;
let _auth = null;

/** Llamado desde index.html con la config real */
export async function initFirestore(config) {
  const { initializeApp } = await import(`${FB_BASE}/firebase-app.js`);
  const { getFirestore }  = await import(`${FB_BASE}/firebase-firestore.js`);
  const { getAuth }       = await import(`${FB_BASE}/firebase-auth.js`);
  _app  = initializeApp(config);
  _db   = getFirestore(_app);
  _auth = getAuth(_app);
  return { db: _db, auth: _auth };
}

/** Returns the Firestore instance (throws if not initialized) */
export function getDB() {
  if (!_db) throw new Error('Firestore not initialized — call initFirestore() first');
  return _db;
}

/** Returns Firebase Auth instance */
export function getAuth() {
  if (!_auth) throw new Error('Firebase Auth not initialized');
  return _auth;
}

// ─── HELPERS ──────────────────────────────────────────────────────────
// Partitioned by event: events/{eventId}/...

/** Read a single document */
export async function fsGet(path) {
  const { doc, getDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
  const snap = await getDoc(doc(_db, ...path.split('/')));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Write / merge a document */
export async function fsSet(path, data, merge = true) {
  const { doc, setDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
  await setDoc(doc(_db, ...path.split('/')), data, { merge });
}

/** Update specific fields */
export async function fsUpdate(path, data) {
  const { doc, updateDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
  await updateDoc(doc(_db, ...path.split('/')), data);
}

/** Add document to collection (auto-ID) */
export async function fsAdd(collPath, data) {
  const { collection, addDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
  const ref = await addDoc(collection(_db, ...collPath.split('/')), data);
  return ref.id;
}

/** Delete a document */
export async function fsDel(path) {
  const { doc, deleteDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
  await deleteDoc(doc(_db, ...path.split('/')));
}

/** Get all documents from a collection */
export async function fsGetAll(collPath) {
  const { collection, getDocs } = await import(`${FB_BASE}/firebase-firestore.js`);
  const snap = await getDocs(collection(_db, ...collPath.split('/')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Real-time listener. Returns unsubscribe function. */
export async function fsListen(collPath, callback, queryFns = []) {
  const { collection, query, onSnapshot } = await import(`${FB_BASE}/firebase-firestore.js`);
  const col = collection(_db, ...collPath.split('/'));
  const q   = queryFns.length ? query(col, ...queryFns) : col;
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Batch write (up to 500 ops) */
export async function fsBatch(ops) {
  const { writeBatch, doc } = await import(`${FB_BASE}/firebase-firestore.js`);
  const batch = writeBatch(_db);
  for (const op of ops) {
    const ref = doc(_db, ...op.path.split('/'));
    if      (op.type === 'set')    batch.set(ref, op.data, { merge: op.merge ?? true });
    else if (op.type === 'update') batch.update(ref, op.data);
    else if (op.type === 'delete') batch.delete(ref);
  }
  await batch.commit();
}
