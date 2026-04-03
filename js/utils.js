// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — utils.js
// Utilidades compartidas: uid, toast, safeHtml, formatDate, etc.
// ═══════════════════════════════════════════════════════════════════════

/** Genera un ID único (similar a v6 uid()) */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Escapa HTML para prevenir XSS */
export function safeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Toast notification */
export function toast(msg, color = '#1a56db', duration = 2400) {
  const existing = document.querySelector('.beu-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'beu-toast';
  t.style.cssText = `
    position:fixed;bottom:20px;right:20px;
    background:${color};color:#fff;
    padding:9px 18px;border-radius:20px;
    font-size:13px;font-weight:700;
    z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2);
    animation:beuToastIn .2s ease;
    font-family:'Inter',system-ui,sans-serif;
    max-width:360px;line-height:1.4;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
}

// Add toast animation once
if (!document.getElementById('beu-toast-style')) {
  const s = document.createElement('style');
  s.id = 'beu-toast-style';
  s.textContent = '@keyframes beuToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}';
  document.head.appendChild(s);
}

/** Format datetime string to locale display */
export function formatDate(str, opts) {
  if (!str) return '—';
  try {
    const d = new Date(String(str).replace(' ', 'T'));
    return d.toLocaleString(undefined, opts || { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  } catch { return str; }
}

/** Today's date as YYYY-MM-DD */
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Now as "YYYY-MM-DD HH:MM:SS" local time */
export function nowLocal() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Debounce — retrasa fn hasta que paren de llamarse durante `ms` ms */
export function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Throttle — ejecuta fn máx una vez cada `ms` ms */
export function throttle(fn, ms = 200) {
  let last = 0;
  return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
}

/** Simple deep clone (JSON-safe objects only) */
export function clone(obj) {
  try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; }
}

/** Sort array of objects by key */
export function sortBy(arr, key, dir = 'asc') {
  return [...arr].sort((a, b) => {
    const av = a[key] ?? '', bv = b[key] ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return dir === 'asc' ? cmp : -cmp;
  });
}

/** Plate normalizer — uppercase, no spaces */
export function normPlate(p) { return String(p || '').trim().toUpperCase().replace(/\s/g, ''); }

/** SHA-256 hash via WebCrypto (returns hex string) */
export async function sha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** PBKDF2 PIN hash — same as v7 plan spec */
export async function hashPin(pin, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pin + salt), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt), iterations:100000 }, km, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}
