// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — utils.js
// Funciones de utilidad compartidas por todos los módulos.
// ═══════════════════════════════════════════════════════════

// ── ID único ─────────────────────────────────────────────────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── HTML seguro — previene XSS ───────────────────────────────
// Usar siempre en vez de innerHTML con datos del usuario
export function safeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

// ── Toast / notificación ─────────────────────────────────────
let _toastTimeout;
export function toast(msg, color = 'var(--blue)', duration = 3000) {
  let el = document.getElementById('beu-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'beu-toast';
    el.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);
      background:var(--bg2);color:var(--text);border:1.5px solid var(--border2);
      border-left:4px solid ${color};border-radius:10px;
      padding:11px 18px;font-size:13px;font-weight:600;
      box-shadow:var(--sh2);z-index:9000;
      transition:transform .25s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;
      max-width:90vw;text-align:center;opacity:0;pointer-events:none;
      font-family:'Inter',sans-serif
    `;
    document.body.appendChild(el);
  }

  el.textContent = msg;
  el.style.borderLeftColor = color;
  el.style.transform = 'translateX(-50%) translateY(0)';
  el.style.opacity   = '1';

  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(80px)';
    el.style.opacity   = '0';
  }, duration);
}

// ── Formato de fecha ─────────────────────────────────────────
export function formatDate(isoString, lang = 'es') {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(lang, {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch { return isoString; }
}

export function formatTime(isoString, lang = 'es') {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleTimeString(lang, {
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return isoString; }
}

export function formatDateTime(isoString, lang = 'es') {
  if (!isoString) return '—';
  return `${formatDate(isoString, lang)} ${formatTime(isoString, lang)}`;
}

// ── Debounce ─────────────────────────────────────────────────
export function debounce(fn, ms = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Normalizar matrícula (quitar espacios, mayúsculas) ───────
export function normalizePlate(plate) {
  if (!plate) return '';
  return String(plate).trim().toUpperCase().replace(/\s+/g, '');
}

// ── Flag emoji desde código ISO-2 ───────────────────────────
export function countryFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '🌐';
  return iso2.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('');
}

// ── Truncar texto ────────────────────────────────────────────
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ── Hashear PIN con PBKDF2 (WebCrypto nativo) ────────────────
export async function hashPin(pin, salt) {
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 },
    key, 256
  );
  return Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(inputPin, storedHash, salt) {
  const hashed = await hashPin(inputPin, salt);
  return hashed === storedHash;
}

// ── Generar salt aleatorio ───────────────────────────────────
export function generateSalt() {
  return crypto.randomUUID();
}
