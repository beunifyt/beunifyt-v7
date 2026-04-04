// BeUnifyT v7 — firestore.js
// Adaptador Firestore. Todos los módulos importan getDB() y getBEUAuth() desde aquí.
const FB = 'https://www.gstatic.com/firebasejs/10.12.0';

let _db   = null;
let _app  = null;
let _auth = null;

export async function initFirestore(config) {
  const { initializeApp }  = await import(`${FB}/firebase-app.js`);
  const { getFirestore }   = await import(`${FB}/firebase-firestore.js`);
  const { getAuth }        = await import(`${FB}/firebase-auth.js`);
  _app  = initializeApp(config);
  _db   = getFirestore(_app);
  _auth = getAuth(_app);
  return { db: _db, auth: _auth };
}

/** Returns Firestore DB instance */
export function getDB() {
  if (!_db) throw new Error('Firestore not initialized');
  return _db;
}

/** Returns Firebase Auth instance */
export function getBEUAuth() {
  if (!_auth) throw new Error('Firebase Auth not initialized');
  return _auth;
}

// ─── CRUD HELPERS ────────────────────────────────────────────────────
export async function fsGet(path) {
  const { doc, getDoc } = await import(`${FB}/firebase-firestore.js`);
  const snap = await getDoc(doc(_db, ...path.split('/')));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function fsSet(path, data, merge = true) {
  const { doc, setDoc } = await import(`${FB}/firebase-firestore.js`);
  await setDoc(doc(_db, ...path.split('/')), data, { merge });
}

export async function fsUpdate(path, data) {
  const { doc, updateDoc } = await import(`${FB}/firebase-firestore.js`);
  await updateDoc(doc(_db, ...path.split('/')), data);
}

export async function fsAdd(collPath, data) {
  const { collection, addDoc } = await import(`${FB}/firebase-firestore.js`);
  const ref = await addDoc(collection(_db, ...collPath.split('/')), data);
  return ref.id;
}

export async function fsDel(path) {
  const { doc, deleteDoc } = await import(`${FB}/firebase-firestore.js`);
  await deleteDoc(doc(_db, ...path.split('/')));
}

export async function fsGetAll(collPath) {
  const { collection, getDocs } = await import(`${FB}/firebase-firestore.js`);
  const snap = await getDocs(collection(_db, ...collPath.split('/')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fsListen(collPath, callback, queryFns = []) {
  const { collection, query, onSnapshot } = await import(`${FB}/firebase-firestore.js`);
  const col = collection(_db, ...collPath.split('/'));
  const q   = queryFns.length ? query(col, ...queryFns) : col;
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function fsBatch(ops) {
  const { writeBatch, doc } = await import(`${FB}/firebase-firestore.js`);
  const batch = writeBatch(_db);
  for (const op of ops) {
    const ref = doc(_db, ...op.path.split('/'));
    if      (op.type === 'set')    batch.set(ref, op.data, { merge: op.merge ?? true });
    else if (op.type === 'update') batch.update(ref, op.data);
    else if (op.type === 'delete') batch.delete(ref);
  }
  await batch.commit();
}
