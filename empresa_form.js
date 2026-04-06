// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — empresa_form.js — Registro nueva empresa
// Reutilizable en registro, portal empresa, tab empresas admin
// ═══════════════════════════════════════════════════════════

import { trFree } from './langs.js';
import { toast } from './utils.js';

export function renderRegistro(container) {
  const t = (k) => trFree('auth', k) || k;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;font-family:system-ui,sans-serif">
      <div style="background:#fff;border-radius:16px;padding:32px;width:100%;max-width:480px;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="font-size:18px;font-weight:800;margin-bottom:20px;text-align:center">${t('register')}</div>
        <div style="display:grid;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:#64748b">Nombre empresa</label><input id="reg-name" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"></div>
          <div><label style="font-size:11px;font-weight:600;color:#64748b">Email</label><input id="reg-email" type="email" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"></div>
          <div><label style="font-size:11px;font-weight:600;color:#64748b">Contraseña</label><input id="reg-pass" type="password" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"></div>
          <div><label style="font-size:11px;font-weight:600;color:#64748b">Teléfono</label><input id="reg-tel" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"></div>
          <div><label style="font-size:11px;font-weight:600;color:#64748b">País</label><input id="reg-pais" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px"></div>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px">
          <button id="reg-back" style="flex:1;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:none;cursor:pointer;font-size:13px">${trFree('shell', 'back')}</button>
          <button id="reg-submit" style="flex:2;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">${t('register')}</button>
        </div>
      </div>
    </div>`;

  container.querySelector('#reg-back').onclick = () => {
    import('./auth.js').then(m => m.renderLogin(container));
  };

  container.querySelector('#reg-submit').onclick = async () => {
    const nombre = container.querySelector('#reg-name').value.trim();
    const email = container.querySelector('#reg-email').value.trim();
    const pass = container.querySelector('#reg-pass').value;
    if (!nombre || !email || !pass) { toast('Completa todos los campos', '#f59e0b'); return; }

    try {
      const { initFirestore, fsSet } = await import('./firestore.js');
      const { FIREBASE_CONFIG } = await import('./config.js');
      await initFirestore(FIREBASE_CONFIG);

      const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
      const { getAuth, createUserWithEmailAndPassword } = await import(`${FB}/firebase-auth.js`);
      const { getBEUAuth } = await import('./firestore.js');
      const auth = getBEUAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      await fsSet(`users/${cred.user.uid}`, {
        nombre, email, rol: 'empresa',
        idioma: 'es', tema: 'light',
        tabs: ['dash', 'ingresos', 'conductores', 'agenda'],
        permisos: { canAdd: true, canEdit: true, canDel: false, canExport: true },
        recinto: '', creado: new Date().toISOString()
      });

      await fsSet(`empresas/${cred.user.uid}`, {
        nombre, email,
        telefono: container.querySelector('#reg-tel').value,
        pais: container.querySelector('#reg-pais').value,
        creado: new Date().toISOString()
      });

      toast('Empresa registrada ✓', '#10b981');
      // Auto-login
      const { buildUsuario, launchShell } = await import('./app.js');
      const userData = await import('./firestore.js').then(m => m.fsGet(`users/${cred.user.uid}`));
      const usuario = buildUsuario(userData, cred.user.uid);
      localStorage.setItem('beu_session', JSON.stringify({ uid: cred.user.uid, idioma: usuario.idioma, rol: usuario.rol, timestamp: Date.now() }));
      launchShell(usuario);
    } catch (e) {
      console.error('Register error:', e);
      toast(e.message || 'Error al registrar', '#ef4444');
    }
  };
}
