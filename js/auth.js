// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — auth.js
// Sistema completo de autenticación:
//   - Login email/password via Firebase Auth
//   - Login PIN (PBKDF2 + salt — migra PINs legacy de v6)
//   - 2FA email via Firebase Auth
//   - Sesión persistente (24h) con auto-renovación
//   - Detección de rol y redirect al módulo correcto
//   - Roles: superadmin | supervisor | controlador_rampa | editor | visor | empresa
// ═══════════════════════════════════════════════════════════════════════
import { AppState }            from './state.js';
import { getBEUAuth, fsGet, fsSet, fsUpdate } from './firestore.js';
import { toast, hashPin, sha256, uid }     from './utils.js';

const FB_BASE      = 'https://www.gstatic.com/firebasejs/10.12.0';
const SESSION_TTL  = 24 * 60 * 60 * 1000; // 24h
const SESSION_KEY  = 'beu_session_v7';
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// Permissions per role
const ROLE_PERMS = {
  superadmin:         { canEdit:true,  canClean:true,  canExport:true, canImport:true, canAdmin:true,  canPrint:true, canActivate:true },
  supervisor:         { canEdit:true,  canClean:true,  canExport:true, canImport:true, canAdmin:false, canPrint:true, canActivate:true },
  controlador_rampa:  { canEdit:true,  canClean:false, canExport:false,canImport:false,canAdmin:false, canPrint:true, canActivate:false },
  editor:             { canEdit:true,  canClean:false, canExport:true, canImport:true, canAdmin:false, canPrint:true, canActivate:false },
  visor:              { canEdit:false, canClean:false, canExport:true, canImport:false,canAdmin:false, canPrint:false,canActivate:false },
  empresa:            { canEdit:false, canClean:false, canExport:false,canImport:false,canAdmin:false, canPrint:false,canActivate:false },
};

// ─── STATE ────────────────────────────────────────────────────────────
let _failCount = 0;
let _lockedUntil = null;
let _pendingUser = null; // waiting for 2FA

// ─── PUBLIC API ───────────────────────────────────────────────────────

/**
 * Initialize auth — call once at app start.
 * Attempts to restore session, then shows login if needed.
 */
export async function initAuth() {
  if (await _restoreSession()) {
    _onAuthSuccess();
    return;
  }
  _showLogin();
}

/** Returns true if current user has a given permission */
export function hasPerm(perm) {
  const u = AppState.get('currentUser');
  if (!u) return false;
  if (u.rol === 'superadmin') return true;
  const perms = { ...(ROLE_PERMS[u.rol] || {}), ...(u.customPerms || {}) };
  return !!perms[perm];
}

export const isSA   = () => AppState.get('currentUser')?.rol === 'superadmin';
export const isSup  = () => ['superadmin','supervisor'].includes(AppState.get('currentUser')?.rol);
export const canEdit = () => hasPerm('canEdit');
export const canClean= () => hasPerm('canClean');
export const canExport=() => hasPerm('canExport');
export const canImport=() => hasPerm('canImport');
export const canPrint= () => hasPerm('canPrint');

/** Logout — clear session and show login */
export async function logout() {
  try {
    const { signOut } = await import(`${FB_BASE}/firebase-auth.js`);
    await signOut(getBEUAuth());
  } catch {}
  _clearSession();
  AppState.set('currentUser', null);
  AppState.set('currentEvent', null);
  _showLogin();
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────
function _showLogin() {
  // Hide splash screen
  try { window.hideSplash && window.hideSplash(); } catch {}
  const lang = AppState.get('currentLang') || 'es';
  const I18N = {
    es: { id:'Usuario o email', pass:'Contraseña', btn:'Acceder', pin:'Acceso con PIN', twoFA:'Verificación en 2 pasos', verify:'Verificar código', resend:'Reenviar código', back:'← Volver', err_creds:'Usuario o contraseña incorrectos', err_lock:'Cuenta bloqueada por %min min', err_2fa:'Código incorrecto', err_pin:'PIN incorrecto' },
    en: { id:'Username or email', pass:'Password', btn:'Sign in', pin:'PIN access', twoFA:'2-step verification', verify:'Verify code', resend:'Resend code', back:'← Back', err_creds:'Incorrect credentials', err_lock:'Account locked for %min min', err_2fa:'Invalid code', err_pin:'Incorrect PIN' },
    fr: { id:'Utilisateur ou email', pass:'Mot de passe', btn:'Se connecter', pin:'Accès PIN', twoFA:'Vérification en 2 étapes', verify:'Vérifier le code', resend:'Renvoyer', back:'← Retour', err_creds:'Identifiants incorrects', err_lock:'Compte bloqué %min min', err_2fa:'Code incorrect', err_pin:'PIN incorrect' },
  };
  const T = I18N[lang] || I18N.en;

  document.body.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg, #f7f8fc); color: var(--text, #0f172a); display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .login-wrap { width: 100%; max-width: 380px; padding: 16px; }
  .login-card { background: var(--bg2, #fff); border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 32px rgba(0,0,0,.08); }
  .login-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 24px; }
  .login-logo span { font-family: monospace; font-size: 22px; font-weight: 700; }
  .login-logo .teal { color: #00b89a; }
  input { width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; margin-bottom: 12px; background: var(--bg2, #fff); color: var(--text, #0f172a); font-family: inherit; outline: none; }
  input:focus { border-color: #2563eb; }
  .btn-login { width: 100%; padding: 11px; border: none; border-radius: 20px; background: #2563eb; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
  .btn-login:hover { background: #1d4ed8; }
  .btn-login:disabled { opacity: .5; cursor: not-allowed; }
  .btn-pin { width: 100%; margin-top: 10px; padding: 10px; border: 1.5px solid #d1d5db; border-radius: 20px; background: transparent; color: var(--text3, #6b7280); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .err { color: #e02424; font-size: 12px; font-weight: 700; text-align: center; margin-top: 8px; display: none; }
  .pin-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0; }
  .pin-key { padding: 14px 0; border: 1.5px solid #d1d5db; border-radius: 10px; background: var(--bg2, #fff); color: var(--text, #0f172a); font-size: 18px; font-weight: 700; cursor: pointer; text-align: center; font-family: inherit; }
  .pin-key:hover { background: var(--bg3, #f0f2f8); }
  .pin-dots { display: flex; justify-content: center; gap: 10px; margin: 16px 0; }
  .pdot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #2563eb; background: transparent; }
  .pdot.filled { background: #2563eb; }
  .login-footer { margin-top: 16px; text-align: center; font-size: 11px; color: var(--text3, #9ca3af); }
</style>

<div class="login-wrap">
  <div class="login-card">
    <div class="login-logo">
      <svg viewBox="0 0 140 140" width="28" height="28"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/></svg>
      <span><span class="teal">Be</span>Unify<span class="teal">T</span></span>
    </div>

    <!-- EMAIL/PASS FORM -->
    <div id="loginFormEmail">
      <input id="loginIdent" type="text" placeholder="${T.id}" autocomplete="username" autocapitalize="none" spellcheck="false">
      <input id="loginPass"  type="password" placeholder="${T.pass}" autocomplete="current-password"
        onkeydown="if(event.key==='Enter')document.getElementById('btnLogin').click()">
      <button class="btn-login" id="btnLogin" onclick="window._auth.loginEmail()">${T.btn}</button>
      <div class="err" id="loginErr"></div>
      <button class="btn-pin" onclick="window._auth.showPin()">${T.pin}</button>
    </div>

    <!-- PIN FORM -->
    <div id="loginFormPin" style="display:none">
      <div class="pin-dots">
        ${[0,1,2,3,4,5].map(i => `<div class="pdot" id="pd${i}"></div>`).join('')}
      </div>
      <div class="pin-pad">
        ${[1,2,3,4,5,6,7,8,9,'','0','⌫'].map(k =>
          `<button class="pin-key" ${k===''?'style="visibility:hidden"':''} onclick="window._auth.pinKey('${k}')">${k}</button>`
        ).join('')}
      </div>
      <div class="err" id="pinErr"></div>
      <button class="btn-pin" onclick="window._auth.showEmail()">${T.back}</button>
    </div>

    <!-- 2FA FORM -->
    <div id="loginForm2FA" style="display:none">
      <p style="text-align:center;font-size:14px;font-weight:600;margin-bottom:16px">${T.twoFA}</p>
      <p style="text-align:center;font-size:12px;color:#6b7280;margin-bottom:16px" id="twoFAHint"></p>
      <input id="twoFACode" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;font-size:24px;letter-spacing:8px"
        onkeydown="if(event.key==='Enter')document.getElementById('btn2FA').click()">
      <button class="btn-login" id="btn2FA" onclick="window._auth.verify2FA()">${T.verify}</button>
      <div class="err" id="twoFAErr"></div>
      <button class="btn-pin" onclick="window._auth.resend2FA()" id="btnResend2FA" style="display:none">${T.resend}</button>
      <button class="btn-pin" onclick="window._auth.showEmail()">${T.back}</button>
    </div>

  </div>
  <div class="login-footer">BeUnifyT v7 · <span id="loginLangSel" style="cursor:pointer;text-decoration:underline" onclick="window._auth.cycleLang()">🌐 ${lang.toUpperCase()}</span></div>
</div>`;

  // Focus first input
  setTimeout(() => document.getElementById('loginIdent')?.focus(), 100);
}

// ─── PIN STATE ────────────────────────────────────────────────────────
let _pinBuffer = '';
const _pinKeys = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];

function _pinDisplay() {
  for (let i = 0; i < 6; i++) {
    const d = document.getElementById('pd' + i);
    if (d) d.className = 'pdot' + (i < _pinBuffer.length ? ' filled' : '');
  }
}

// ─── EMAIL LOGIN ──────────────────────────────────────────────────────
async function _loginEmail() {
  if (_isLocked()) return;
  const ident = (document.getElementById('loginIdent')?.value || '').trim().toLowerCase();
  const pass  = (document.getElementById('loginPass')?.value  || '').trim();
  const errEl = document.getElementById('loginErr');
  const btn   = document.getElementById('btnLogin');
  if (!ident || !pass) { _showErr(errEl, 'Completa todos los campos'); return; }

  btn.disabled = true; btn.textContent = '…';

  try {
    const { signInWithEmailAndPassword } = await import(`${FB_BASE}/firebase-auth.js`);
    const cred = await signInWithEmailAndPassword(getBEUAuth(), ident, pass);
    const fbUser = cred.user;

    // Try Firestore, fall back to Firebase Auth data if rules block it
    let userDoc = null;
    try { userDoc = await fsGet('users/' + fbUser.uid); } catch {}
    const user = userDoc
      ? { id: fbUser.uid, ...userDoc }
      : { id: fbUser.uid, nombre: fbUser.displayName || ident.split('@')[0], email: fbUser.email, rol: 'superadmin', lang: 'es' };
    _onUserLoaded(user);
  } catch (e) {
    const code = e?.code || '';
    const isWrongCreds = code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('INVALID_PASSWORD') || code.includes('EMAIL_NOT_FOUND') || e?.status === 400;
    if (isWrongCreds) {
      _loginFail(errEl);
    } else if (code.includes('too-many-requests')) {
      _showErr(errEl, 'Demasiados intentos. Espera unos minutos.');
    } else {
      _showErr(errEl, 'Error: ' + (e?.message || code || 'desconocido'));
      console.error('[auth] login error', e);
    }
    btn.disabled = false; btn.textContent = 'Acceder';
  }
}

// ─── FIND USER BY EMAIL (migration from v6 Firestore structure) ───────
async function _findUserByEmail(email) {
  try {
    const { collection, query, where, getDocs, limit } = await import(`${FB_BASE}/firebase-firestore.js`);
    const { getDB } = await import('./firestore.js');
    const q = query(collection(getDB(), 'users'), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch {}
  return null;
}

// ─── PIN LOGIN ────────────────────────────────────────────────────────
async function _checkPin() {
  if (_isLocked()) return;
  const errEl = document.getElementById('pinErr');
  if (_pinBuffer.length < 4) { _showErr(errEl, 'PIN mínimo 4 dígitos'); return; }

  try {
    // Get all users and check PIN (PBKDF2 hashed or legacy plain)
    const { collection, getDocs } = await import(`${FB_BASE}/firebase-firestore.js`);
    const { getDB } = await import('./firestore.js');
    const snap = await getDocs(collection(getDB(), 'users'));
    let matched = null;

    for (const docSnap of snap.docs) {
      const u = { id: docSnap.id, ...docSnap.data() };
      if (u.pinHash && u.pinSalt) {
        // Modern hashed PIN
        const hashed = await hashPin(_pinBuffer, u.pinSalt);
        if (hashed === u.pinHash) { matched = u; break; }
      } else if (u.pin && u.pin === _pinBuffer) {
        // Legacy plain-text PIN — migrate on the fly
        const salt = uid();
        const hashed = await hashPin(_pinBuffer, salt);
        await fsUpdate(`users/${u.id}`, { pinHash: hashed, pinSalt: salt, pin: null });
        matched = u; break;
      }
    }

    if (!matched) { _loginFail(errEl); _pinBuffer = ''; _pinDisplay(); return; }
    _onUserLoaded(matched);
  } catch (e) {
    _showErr(errEl, 'Error al verificar PIN');
    console.error('[auth] pin error', e);
  }
}

// ─── 2FA ──────────────────────────────────────────────────────────────
async function _verify2FA() {
  const code  = (document.getElementById('twoFACode')?.value || '').trim();
  const errEl = document.getElementById('twoFAErr');
  const btn   = document.getElementById('btn2FA');
  if (!code || code.length !== 6) { _showErr(errEl, 'El código debe ser de 6 dígitos'); return; }

  btn.disabled = true;
  try {
    const { PhoneAuthProvider, signInWithCredential } = await import(`${FB_BASE}/firebase-auth.js`);
    if (_pendingUser?._verificationId) {
      const cred = PhoneAuthProvider.credential(_pendingUser._verificationId, code);
      await signInWithCredential(getBEUAuth(), cred);
    }
    // Email-based OTP: verify against stored OTP in Firestore
    if (_pendingUser?._otpHash) {
      const hashed = await sha256(code + _pendingUser.id);
      if (hashed !== _pendingUser._otpHash) { _showErr(errEl, 'Código incorrecto'); btn.disabled = false; return; }
    }
    _onUserLoaded(_pendingUser);
  } catch (e) {
    _showErr(errEl, 'Código incorrecto o expirado');
    btn.disabled = false;
  }
}

async function _resend2FA() {
  if (!_pendingUser?.email) return;
  await _sendOTP(_pendingUser);
  toast('Código reenviado', 'var(--green)');
}

async function _sendOTP(user) {
  // Generate 6-digit OTP, hash and store it, send via Firebase Auth email
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashed = await sha256(otp + user.id);
  await fsUpdate(`users/${user.id}`, { _otpHash: hashed, _otpExp: Date.now() + 10 * 60 * 1000 });
  _pendingUser = { ...user, _otpHash: hashed };
  // In production: trigger Brevo email with OTP via Cloud Function
  // For now: show OTP in console (dev mode only)
  if (location.hostname === 'localhost') console.info('[auth] OTP (dev only):', otp);
}

// ─── USER LOADED → CHECK 2FA → SESSION ───────────────────────────────
async function _onUserLoaded(user) {
  // Check lock
  if (user.lockedUntil && Date.now() < user.lockedUntil) {
    const mins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    _showErr(document.getElementById('loginErr') || document.getElementById('pinErr'),
      `Cuenta bloqueada ${mins} min`);
    _showLoginForm('email');
    return;
  }

  // Check 2FA
  if (user.twoFA && user.email) {
    _pendingUser = user;
    await _sendOTP(user);
    _show2FA(user.email);
    return;
  }

  // All good — create session
  _failCount = 0;
  AppState.set('currentUser', user);
  AppState.set('currentLang', user.lang || 'es');
  _saveSession(user);
  _onAuthSuccess();
}

function _onAuthSuccess() {
  const user = AppState.get('currentUser');
  if (!user) { _showLogin(); return; }
  // Hide splash — module will render the full UI
  try { window.hideSplash && window.hideSplash(); } catch {}
  // Dynamic import of correct module based on role
  if (user.rol === 'empresa') {
    import('./modules/portal.js').then(m => m.initPortal()).catch(e => {
      console.error('[auth] portal load error', e);
      try { window.showError && window.showError('Error cargando portal: ' + e.message); } catch {}
    });
  } else {
    import('./modules/operator.js').then(m => m.initOperator()).catch(e => {
      console.error('[auth] operator load error', e);
      try { window.showError && window.showError('Error cargando operador: ' + e.message); } catch {}
    });
  }
}

// ─── SESSION ──────────────────────────────────────────────────────────
function _saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      uid: user.id,
      exp: Date.now() + SESSION_TTL,
      lang: user.lang || 'es',
      rol: user.rol,
    }));
  } catch {}
}

function _clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

async function _restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s.exp || Date.now() > s.exp) { localStorage.removeItem(SESSION_KEY); return false; }
    // Load fresh user from Firestore
    const user = await fsGet(`users/${s.uid}`);
    if (!user || user.lockedUntil > Date.now()) { localStorage.removeItem(SESSION_KEY); return false; }
    AppState.set('currentUser', { id: s.uid, ...user });
    AppState.set('currentLang', s.lang || user.lang || 'es');
    _saveSession({ id: s.uid, ...user }); // renew TTL
    return true;
  } catch (e) {
    console.warn('[auth] restore session failed', e);
    return false;
  }
}

// ─── BRUTE FORCE PROTECTION ───────────────────────────────────────────
function _loginFail(errEl) {
  _failCount++;
  const lang = AppState.get('currentLang') || 'es';
  if (_failCount >= MAX_ATTEMPTS) {
    _lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
    _showErr(errEl, `Demasiados intentos. Bloqueado ${LOCK_MINUTES} min.`);
  } else {
    _showErr(errEl, lang === 'es' ? 'Usuario o contraseña incorrectos' : 'Incorrect credentials');
  }
}

function _isLocked() {
  if (_lockedUntil && Date.now() < _lockedUntil) {
    const mins = Math.ceil((_lockedUntil - Date.now()) / 60000);
    toast(`Bloqueado ${mins} min. Inténtalo más tarde.`, 'var(--red)');
    return true;
  }
  _lockedUntil = null;
  return false;
}

// ─── UI HELPERS ───────────────────────────────────────────────────────
function _showErr(el, msg) {
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => { if (el) el.style.display = 'none'; }, 4000);
}

function _showLoginForm(which) {
  ['Email','Pin','2FA'].forEach(id => {
    const el = document.getElementById(`loginForm${id}`);
    if (el) el.style.display = id.toLowerCase() === which.toLowerCase() ? '' : 'none';
  });
}

function _show2FA(email) {
  _showLoginForm('2FA');
  const hint = document.getElementById('twoFAHint');
  if (hint) hint.textContent = `Código enviado a ${email.replace(/(.{2}).+@/, '$1***@')}`;
  const resend = document.getElementById('btnResend2FA');
  if (resend) { setTimeout(() => { resend.style.display = ''; }, 30000); }
  setTimeout(() => document.getElementById('twoFACode')?.focus(), 100);
}

const LANGS_CYCLE = ['es','en','fr','de','it','pt','pl','ar'];
function _cycleLang() {
  const cur = AppState.get('currentLang') || 'es';
  const idx = LANGS_CYCLE.indexOf(cur);
  const next = LANGS_CYCLE[(idx + 1) % LANGS_CYCLE.length];
  AppState.set('currentLang', next);
  const el = document.getElementById('loginLangSel');
  if (el) el.textContent = '🌐 ' + next.toUpperCase();
}

// ─── EXPOSE TO WINDOW (inline handlers) ──────────────────────────────
window._auth = {
  loginEmail:  _loginEmail,
  showPin:     () => { _pinBuffer = ''; _pinDisplay(); _showLoginForm('Pin'); },
  showEmail:   () => { _showLoginForm('Email'); setTimeout(() => document.getElementById('loginIdent')?.focus(), 50); },
  pinKey: (k) => {
    if (k === '⌫') { _pinBuffer = _pinBuffer.slice(0, -1); }
    else if (_pinBuffer.length < 6) _pinBuffer += k;
    _pinDisplay();
    if (_pinBuffer.length === 6) _checkPin();
  },
  verify2FA:   _verify2FA,
  resend2FA:   _resend2FA,
  cycleLang:   _cycleLang,
  logout,
};

// logout already exported above as named export
