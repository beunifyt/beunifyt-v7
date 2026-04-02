// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — modules/login.js
// Pantalla de login. Carga lazy desde app.js.
// Soporta: email+password y PIN numerico.
// ═══════════════════════════════════════════════════════════

import { loginWithEmail, loginWithPin } from '../auth.js';
import { AppState }                     from '../state.js';
import { toast }                        from '../utils.js';
import { to, setLang, LANGS }           from '../i18n.js';

export async function initLogin() {
  const root = document.getElementById('app-root');
  root.innerHTML = _renderLogin();
  _bindEvents();
}

function _renderLogin() {
  return `
<div class="login-wrap">
  <div class="login-card">

    <div class="login-logo">
      <svg width="40" height="40" viewBox="0 0 140 140">
        <rect width="140" height="140" rx="32" fill="#030812"/>
        <polygon points="70,10 122,40 122,100 70,130 18,100 18,40"
          stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
        <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
        <circle cx="70" cy="70" r="3.5" fill="#030812"/>
      </svg>
      <div>
        <div class="login-title">BeUnify<span>T</span></div>
        <div class="login-sub">Unified Control Platform v7</div>
      </div>
    </div>

    <div class="login-lang-row">
      <select id="loginLangSel" class="login-lang-sel">
        ${Object.entries(LANGS).map(([code, l]) =>
          `<option value="${code}">${l.flag} ${l.name}</option>`
        ).join('')}
      </select>
    </div>

    <div id="stepEmail">
      <div class="login-field">
        <label class="login-label">Email</label>
        <input type="email" id="loginEmail" autocomplete="email"
          placeholder="operador@empresa.com" class="login-input">
      </div>
      <div class="login-field">
        <label class="login-label" id="lbl-pass">Contrasena</label>
        <input type="password" id="loginPass" autocomplete="current-password"
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" class="login-input">
      </div>
      <div id="loginErr" class="login-err" style="display:none"></div>
      <button id="btnLogin" class="btn-login">
        <span id="btnLoginTxt">Iniciar sesion</span>
      </button>
    </div>

    <div id="stepPin" style="display:none">
      <div class="pin-label">Introduce tu PIN</div>
      <div class="pin-dots">
        <div class="pdot" id="pd0"></div>
        <div class="pdot" id="pd1"></div>
        <div class="pdot" id="pd2"></div>
        <div class="pdot" id="pd3"></div>
      </div>
      <div class="numpad">
        ${[1,2,3,4,5,6,7,8,9,'',0,'&larr;'].map((k,i) => `
          <button class="nk" data-k="${k}" ${k==='' ? 'disabled style="opacity:0"' : ''}>
            ${k}
          </button>`).join('')}
      </div>
      <div id="pinErr" class="login-err" style="display:none"></div>
      <button id="btnBack" class="btn-back">Volver</button>
    </div>

    <div class="login-version">v${window.APP_VERSION}</div>
  </div>
</div>

<style>
.login-wrap{
  position:fixed;inset:0;
  background:linear-gradient(135deg,#1e3a5f 0%,#030812 100%);
  display:flex;align-items:center;justify-content:center;
  padding:16px;overflow-y:auto
}
.login-card{
  background:#fff;border-radius:16px;padding:28px 24px;
  width:100%;max-width:400px;
  box-shadow:0 20px 60px rgba(0,0,0,.4);color:#111
}
.login-logo{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.login-title{font-size:22px;font-weight:900;letter-spacing:-.5px;color:#0f172a}
.login-title span{color:#6b7280;font-weight:400}
.login-sub{font-size:12px;color:#9ca3af;margin-top:1px}
.login-lang-row{margin-bottom:18px}
.login-lang-sel{
  width:100%;padding:7px 10px;border-radius:6px;
  border:1.5px solid #e2e8f0;font-size:13px;
  background:#f8fafc;color:#374151;cursor:pointer
}
.login-field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.login-label{font-size:11px;font-weight:700;color:#374151;
  text-transform:uppercase;letter-spacing:.05em}
.login-input{
  padding:10px 12px;border:1.5px solid #e2e8f0;border-radius:6px;
  font-size:14px;color:#111;background:#fff;width:100%;
  transition:border-color .15s;font-family:inherit
}
.login-input:focus{border-color:#3b82f6;outline:none;
  box-shadow:0 0 0 3px rgba(59,130,246,.1)}
.login-err{
  background:#fef2f2;border:1px solid #fecaca;border-radius:6px;
  padding:9px 12px;font-size:13px;color:#dc2626;margin-bottom:10px
}
.btn-login{
  width:100%;padding:12px;border-radius:6px;border:none;
  background:linear-gradient(90deg,#1a56db,#2563eb);color:#fff;
  font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;
  transition:opacity .15s;font-family:inherit
}
.btn-login:hover{opacity:.9}
.btn-login:disabled{opacity:.5;cursor:not-allowed}
.pin-label{font-size:14px;font-weight:700;color:#374151;
  text-align:center;margin-bottom:14px}
.pin-dots{display:flex;justify-content:center;gap:12px;margin-bottom:20px}
.pdot{width:16px;height:16px;border-radius:50%;
  border:2px solid #d1d5db;background:transparent;transition:all .2s}
.pdot.f{background:#1a56db;border-color:#1a56db}
.numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.nk{
  padding:15px;border-radius:6px;background:#f8fafc;
  border:1.5px solid #e2e8f0;font-size:20px;font-weight:700;
  color:#0f172a;cursor:pointer;transition:all .15s;
  text-align:center;font-family:inherit
}
.nk:hover{background:#1a56db;color:#fff;border-color:#1a56db}
.nk:active{transform:scale(.95)}
.btn-back{
  width:100%;padding:9px;border-radius:6px;border:1.5px solid #e2e8f0;
  background:#f8fafc;color:#6b7280;font-size:13px;cursor:pointer;
  font-family:inherit
}
.login-version{
  text-align:center;margin-top:18px;font-size:11px;color:#9ca3af;
  font-family:'JetBrains Mono',monospace
}
</style>`;
}

// ── Eventos ──────────────────────────────────────────────────
let _pin = '';

function _bindEvents() {
  const saved = localStorage.getItem('beu_lang') || 'es';
  const sel   = document.getElementById('loginLangSel');
  if (sel) sel.value = saved;

  sel?.addEventListener('change', async (e) => {
    await setLang(e.target.value);
  });

  document.getElementById('btnLogin')
    ?.addEventListener('click', _handleEmailLogin);

  document.getElementById('loginPass')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') _handleEmailLogin(); });

  document.querySelectorAll('.nk').forEach(btn => {
    btn.addEventListener('click', () => _handlePin(btn.dataset.k));
  });

  document.getElementById('btnBack')?.addEventListener('click', () => {
    _pin = '';
    document.getElementById('stepPin').style.display   = 'none';
    document.getElementById('stepEmail').style.display = '';
    _clearDots();
  });
}

async function _handleEmailLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass  = document.getElementById('loginPass')?.value;
  const btn   = document.getElementById('btnLogin');
  const err   = document.getElementById('loginErr');

  if (!email || !pass) { _showErr(err, 'Rellena todos los campos'); return; }

  btn.disabled = true;
  document.getElementById('btnLoginTxt').textContent = 'Conectando...';
  err.style.display = 'none';

  const result = await loginWithEmail(email, pass);

  if (result.ok) {
    location.reload();
  } else {
    _showErr(err, result.error);
    btn.disabled = false;
    document.getElementById('btnLoginTxt').textContent = 'Iniciar sesion';
  }
}

async function _handlePin(key) {
  if (key === '←' || key === '&larr;') {
    _pin = _pin.slice(0, -1);
  } else if (_pin.length < 4 && key !== '') {
    _pin += key;
  }
  _updateDots();
  if (_pin.length === 4) {
    const user = AppState.get('currentUser');
    if (!user) return;
    const result = await loginWithPin(user.uid, _pin);
    if (result.ok) {
      location.reload();
    } else {
      _showErr(document.getElementById('pinErr'), 'PIN incorrecto');
      _pin = '';
      _clearDots();
    }
  }
}

function _updateDots() {
  for (let i = 0; i < 4; i++) {
    document.getElementById(`pd${i}`)?.classList.toggle('f', i < _pin.length);
  }
}

function _clearDots() {
  for (let i = 0; i < 4; i++) document.getElementById(`pd${i}`)?.classList.remove('f');
}

function _showErr(el, msg) {
  if (!el) return;
  el.textContent   = msg;
  el.style.display = 'block';
}
