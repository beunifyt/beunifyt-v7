// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — auth.js
// Autenticacion completa: Firebase Auth + PIN PBKDF2 + sesion
// ═══════════════════════════════════════════════════════════

import { AppState }                          from './state.js';
import { localDB }                           from './db.js';
import { toast, hashPin, verifyPin, generateSalt } from './utils.js';
import { getDB, getFireAuth }                from './firestore.js';

const FB_CDN = 'https://www.gstatic.com/firebasejs/10.12.0';

// ── Inicializar Auth ─────────────────────────────────────────
export async function initAuth() {
  const { onAuthStateChanged } = await import(`${FB_CDN}/firebase-auth.js`);
  const auth = getFireAuth();

  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      unsub();
      if (fbUser) {
        try {
          const user = await _buildUserProfile(fbUser);
          resolve(user);
        } catch (e) {
          console.error('[Auth] Error perfil:', e);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
}

// ── Login email + password ───────────────────────────────────
export async function loginWithEmail(email, password) {
  const { signInWithEmailAndPassword } = await import(`${FB_CDN}/firebase-auth.js`);
  try {
    const cred = await signInWithEmailAndPassword(getFireAuth(), email, password);
    const user = await _buildUserProfile(cred.user);
    AppState.set('currentUser', user);
    await localDB.set('session', 'user', user);
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: _errMsg(err.code) };
  }
}

// ── Login con PIN (operadores) ───────────────────────────────
export async function loginWithPin(userId, inputPin) {
  try {
    const db = getDB();
    const { doc, getDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const eventId = AppState.get('currentEvent')?.id;
    if (!eventId) return { ok: false, error: 'No hay evento activo' };

    const snap = await getDoc(doc(db, 'events', eventId, 'operators', userId));
    if (!snap.exists()) return { ok: false, error: 'Usuario no encontrado' };

    const data = snap.data();

    // Migracion PIN legacy
    if (data.pin && !data.pinHash) {
      const ok = await _migrateLegacyPin(eventId, userId, data, inputPin);
      return ok ? { ok: true } : { ok: false, error: 'PIN incorrecto' };
    }

    if (!data.pinHash || !data.pinSalt) {
      return { ok: false, error: 'PIN no configurado' };
    }

    const valid = await verifyPin(inputPin, data.pinHash, data.pinSalt);
    return valid ? { ok: true } : { ok: false, error: 'PIN incorrecto' };

  } catch (err) {
    console.error('[Auth] loginWithPin:', err);
    return { ok: false, error: 'Error de conexion' };
  }
}

// ── Cerrar sesion ────────────────────────────────────────────
export async function logout() {
  try {
    const { signOut } = await import(`${FB_CDN}/firebase-auth.js`);
    await signOut(getFireAuth());
    await localDB.clearSession();
    AppState.set('currentUser',  null);
    AppState.set('currentEvent', null);
    AppState.set('currentGate',  null);
    location.reload();
  } catch (err) {
    toast('Error al cerrar sesion', 'var(--red)');
  }
}

export const getCurrentUser = () => AppState.get('currentUser');

// ── Cambiar PIN ──────────────────────────────────────────────
export async function setPin(eventId, userId, newPin) {
  try {
    const { doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const salt    = generateSalt();
    const pinHash = await hashPin(newPin, salt);
    await updateDoc(
      doc(getDB(), 'events', eventId, 'operators', userId),
      { pinHash, pinSalt: salt, pin: null }
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Error al guardar PIN' };
  }
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

async function _buildUserProfile(fbUser) {
  const db = getDB();
  const { doc, getDoc, collection, getDocs, query, where, limit }
    = await import(`${FB_CDN}/firebase-firestore.js`);

  // Cache local
  const cached = await localDB.get('session', 'user');
  if (cached && cached.uid === fbUser.uid) return cached;

  // Buscar en eventos activos
  const eventsSnap = await getDocs(
    query(collection(db, 'events'), where('active', '==', true), limit(5))
  );

  for (const eventDoc of eventsSnap.docs) {
    const eventId = eventDoc.id;

    const opSnap = await getDoc(doc(db, 'events', eventId, 'operators', fbUser.uid));
    if (opSnap.exists()) {
      const d = opSnap.data();
      return { uid: fbUser.uid, email: fbUser.email, name: d.name || fbUser.email,
               role: d.role || 'operator', eventId, gateId: d.gateId || null };
    }

    const coSnap = await getDoc(doc(db, 'events', eventId, 'companies', fbUser.uid));
    if (coSnap.exists()) {
      const d = coSnap.data();
      return { uid: fbUser.uid, email: fbUser.email, name: d.nombre || fbUser.email,
               role: 'company', eventId, companyId: fbUser.uid };
    }
  }

  return { uid: fbUser.uid, email: fbUser.email, name: fbUser.email, role: 'unknown' };
}

async function _migrateLegacyPin(eventId, userId, data, inputPin) {
  if (inputPin !== data.pin) return false;
  try {
    const { doc, updateDoc } = await import(`${FB_CDN}/firebase-firestore.js`);
    const salt    = generateSalt();
    const pinHash = await hashPin(inputPin, salt);
    await updateDoc(
      doc(getDB(), 'events', eventId, 'operators', userId),
      { pinHash, pinSalt: salt, pin: null, pinMigratedAt: new Date().toISOString() }
    );
    return true;
  } catch { return false; }
}

function _errMsg(code) {
  const m = {
    'auth/invalid-email':          'Email no valido',
    'auth/user-disabled':          'Usuario deshabilitado',
    'auth/user-not-found':         'Usuario no encontrado',
    'auth/wrong-password':         'Contrasena incorrecta',
    'auth/invalid-credential':     'Credenciales incorrectas',
    'auth/too-many-requests':      'Demasiados intentos. Espera unos minutos.',
    'auth/network-request-failed': 'Sin conexion a internet',
  };
  return m[code] || `Error de autenticacion (${code})`;
}
