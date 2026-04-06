// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — utils.js — Utilidades compartidas
// ═══════════════════════════════════════════════════════════

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function safeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function toast(msg, color = '#1a56db', duration = 2400) {
  const old = document.querySelector('.beu-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'beu-toast';
  t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${color};color:#fff;padding:9px 18px;border-radius:20px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:beuToastIn .2s ease;font-family:system-ui,sans-serif;max-width:360px;line-height:1.4`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, duration);
}

export function formatDate(str, opts) {
  if (!str) return '—';
  try {
    return new Date(String(str).replace(' ', 'T')).toLocaleString(undefined, opts || { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  } catch { return str; }
}

export function todayISO() { return new Date().toISOString().slice(0, 10); }

export function nowLocal() {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function debounce(fn, ms = 300) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export function throttle(fn, ms = 200) {
  let last = 0;
  return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } };
}

export function clone(obj) { try { return JSON.parse(JSON.stringify(obj)); } catch { return obj; } }

export function sortBy(arr, key, dir = 'asc') {
  return [...arr].sort((a, b) => {
    const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true });
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function normPlate(p) { return String(p || '').trim().toUpperCase().replace(/\s/g, ''); }

export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPin(pin, salt) {
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey('raw', enc.encode(pin + salt), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt:enc.encode(salt), iterations:100000 }, km, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}
