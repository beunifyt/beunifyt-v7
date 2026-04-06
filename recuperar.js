// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — recuperar.js — Recuperar contraseña
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { toast } from './utils.js';

export function renderRecuperar(container) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;font-family:system-ui,sans-serif">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:380px;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="font-size:18px;font-weight:800;margin-bottom:20px;text-align:center">${trFree('auth', 'forgot')}</div>
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#64748b;display:block;margin-bottom:4px">${trFree('auth', 'email')}</label>
          <input id="rec-email" type="email" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
        </div>
        <div style="display:flex;gap:8px">
          <button id="rec-back" style="flex:1;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:none;cursor:pointer;font-size:13px">${trFree('shell', 'back')}</button>
          <button id="rec-send" style="flex:2;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Enviar</button>
        </div>
      </div>
    </div>`;

  container.querySelector('#rec-back').onclick = () => {
    import('./auth.js').then(m => m.renderLogin(container));
  };

  container.querySelector('#rec-send').onclick = async () => {
    const email = container.querySelector('#rec-email').value.trim();
    if (!email) { toast('Ingresa tu email', '#f59e0b'); return; }
    try {
      const { initFirestore } = await import('./firestore.js');
      const { FIREBASE_CONFIG } = await import('./config.js');
      await initFirestore(FIREBASE_CONFIG);
      const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
      const { sendPasswordResetEmail } = await import(`${FB}/firebase-auth.js`);
      const { getBEUAuth } = await import('./firestore.js');
      await sendPasswordResetEmail(getBEUAuth(), email);
      toast('Email de recuperación enviado ✓', '#10b981');
      setTimeout(() => import('./auth.js').then(m => m.renderLogin(container)), 2000);
    } catch (e) {
      toast('Error: ' + (e.message || 'No se pudo enviar'), '#ef4444');
    }
  };
}
