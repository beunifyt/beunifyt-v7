// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — operator.js — Solo el cascarón (shell)
// Header + tabs autorizados + centro vacío
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';
import { tr, trFree, LANGS_UI, getFlag } from './langs.js';
import { toast, safeHtml } from './utils.js';

let _container = null;
let _usuario = null;
let _activeTab = null;
let _currentModuleCleanup = null;

// Mapeo de tabs a archivos de módulo
const TAB_MODULES = {
  dash:        () => import('./dashboard.js'),
  ingresos:    () => import('./ingresos.js'),
  ingresos2:   () => import('./ingresos2.js'),
  flota:       () => import('./flota.js'),
  conductores: () => import('./conductores.js'),
  agenda:      () => import('./agenda.js'),
  analytics:   () => import('./analytics.js'),
  vehiculos:   () => import('./vehiculos.js'),
  auditoria:   () => import('./auditoria.js'),
  recintos:    () => import('./recintos.js'),
  usuarios:    () => import('./usuarios.js'),
  eventos:     () => import('./eventos.js'),
  papelera:    () => import('./papelera.js'),
  mensajes:    () => import('./mensajes.js'),
  impresion:   () => import('./impresion.js'),
  empresas:    () => import('./empresas.js'),
  migracion:   () => import('./migracion.js'),
};

export function renderShell(container, usuario) {
  _container = container;
  _usuario = usuario;
  _activeTab = null;
  paintShell();
}

function paintShell() {
  const u = _usuario;
  const lang = u.idioma || AppState.get('currentLang');

  // Tema
  const isDark = u.tema === 'dark';
  document.body.style.background = isDark ? '#0f172a' : '#f5f7fa';
  document.body.style.color = isDark ? '#e2e8f0' : '#1a1a1a';

  _container.innerHTML = `
    <div id="beu-shell" style="display:flex;flex-direction:column;height:100vh;font-family:system-ui,sans-serif">

      <!-- HEADER -->
      <header id="beu-header" style="display:flex;align-items:center;justify-content:space-between;padding:8px 16px;background:${isDark ? '#1e293b' : '#fff'};border-bottom:1px solid ${isDark ? '#334155' : '#e2e8f0'};flex-shrink:0;gap:8px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:16px;font-weight:800">BeUnifyT</span>
          <span style="font-size:11px;color:#64748b">${safeHtml(u.recinto || '')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button id="langToggle" style="background:none;border:1px solid ${isDark ? '#475569' : '#e2e8f0'};border-radius:6px;padding:4px 8px;cursor:pointer;font-size:13px;color:inherit">${getFlag(lang)}</button>
          <button id="themeToggle" style="background:none;border:1px solid ${isDark ? '#475569' : '#e2e8f0'};border-radius:6px;padding:4px 8px;cursor:pointer;font-size:13px">${isDark ? '☀️' : '🌙'}</button>
          <span style="font-size:12px;font-weight:600;color:${isDark ? '#94a3b8' : '#475569'}">${safeHtml(u.nombre)}</span>
          <button id="logoutBtn" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:700">${trFree('shell', 'logout')}</button>
        </div>
      </header>

      <!-- TABS -->
      <nav id="beu-tabs" style="display:flex;gap:0;overflow-x:auto;background:${isDark ? '#1e293b' : '#fff'};border-bottom:1px solid ${isDark ? '#334155' : '#e2e8f0'};flex-shrink:0;padding:0 8px">
        ${u.tabs.map(tab => {
          const label = tr('tabs', tab);
          if (label === null) return ''; // No autorizado por langs
          return `<button class="beu-tab" data-tab="${tab}" style="padding:8px 14px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;color:${isDark ? '#94a3b8' : '#64748b'};border-bottom:2px solid transparent;transition:all .2s">${label}</button>`;
        }).join('')}
      </nav>

      <!-- CONTENIDO: vacío hasta click -->
      <main id="beu-content" style="flex:1;overflow-y:auto;padding:16px;position:relative">
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px">
          ${trFree('shell', 'loading')}
        </div>
      </main>

    </div>
  `;

  // ─── EVENTOS ──────────────────────────────────────────
  // Tabs
  _container.querySelectorAll('.beu-tab').forEach(btn => {
    btn.onclick = () => activateTab(btn.dataset.tab);
  });

  // Logout
  _container.querySelector('#logoutBtn').onclick = async () => {
    const { logout } = await import('./app.js');
    logout();
  };

  // Tema
  _container.querySelector('#themeToggle').onclick = async () => {
    const newTheme = _usuario.tema === 'dark' ? 'light' : 'dark';
    _usuario.tema = newTheme;
    AppState.set('theme', newTheme);
    try {
      const { fsUpdate } = await import('./firestore.js');
      await fsUpdate(`users/${_usuario.uid}`, { tema: newTheme });
    } catch (e) {}
    // Actualizar sesión
    updateSession();
    paintShell();
    if (_activeTab) activateTab(_activeTab);
  };

  // Idioma
  _container.querySelector('#langToggle').onclick = () => {
    showLangPicker();
  };

  // Cargar primer tab automáticamente
  if (_usuario.tabs.length > 0) {
    activateTab(_activeTab || _usuario.tabs[0]);
  }
}

async function activateTab(tabId) {
  const content = _container.querySelector('#beu-content');
  const isDark = _usuario.tema === 'dark';

  // Limpiar módulo anterior
  if (_currentModuleCleanup) {
    try { _currentModuleCleanup(); } catch(e) {}
    _currentModuleCleanup = null;
  }

  // Marcar tab activo
  _activeTab = tabId;
  AppState.set('activeTab', tabId);
  _container.querySelectorAll('.beu-tab').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.style.color = isActive ? '#3b82f6' : (isDark ? '#94a3b8' : '#64748b');
    btn.style.borderBottomColor = isActive ? '#3b82f6' : 'transparent';
  });

  // Cargar módulo
  content.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8;font-size:13px">${trFree('shell', 'loading')}</div>`;

  const loader = TAB_MODULES[tabId];
  if (!loader) {
    content.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${tabId}" no disponible</div>`;
    return;
  }

  try {
    const mod = await loader();
    content.innerHTML = '';
    if (mod.render) {
      const cleanup = mod.render(content, _usuario);
      if (typeof cleanup === 'function') _currentModuleCleanup = cleanup;
    } else {
      content.innerHTML = `<div style="text-align:center;padding:40px;color:#94a3b8">Módulo "${tabId}" cargado</div>`;
    }
  } catch (e) {
    console.error(`Error loading ${tabId}:`, e);
    content.innerHTML = `<div style="text-align:center;padding:40px"><div style="font-size:14px;font-weight:700;color:#ef4444">Error en ${tabId}</div><div style="font-size:12px;color:#94a3b8;margin-top:8px">${safeHtml(e.message)}</div></div>`;
  }
}

function showLangPicker() {
  const existing = document.getElementById('beu-lang-modal');
  if (existing) { existing.remove(); return; }

  const isDark = _usuario.tema === 'dark';
  const modal = document.createElement('div');
  modal.id = 'beu-lang-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9000;display:flex;align-items:center;justify-content:center`;

  const currentLang = _usuario.idioma;
  modal.innerHTML = `
    <div style="background:${isDark ? '#1e293b' : '#fff'};border-radius:14px;padding:20px;max-width:360px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.2)">
      <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">
        ${LANGS_UI.map(l => `
          <div class="lang-pick" data-code="${l.code}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:12px;border:1px solid ${l.code === currentLang ? '#3b82f6' : (isDark ? '#475569' : '#e2e8f0')};background:${l.code === currentLang ? (isDark ? '#1e3a5f' : '#eff6ff') : 'transparent'};color:inherit">
            ${l.flag} ${l.name}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.querySelectorAll('.lang-pick').forEach(el => {
    el.onclick = async () => {
      const code = el.dataset.code;
      _usuario.idioma = code;
      AppState.set('currentLang', code);
      try {
        const { fsUpdate } = await import('./firestore.js');
        await fsUpdate(`users/${_usuario.uid}`, { idioma: code });
      } catch (e) {}
      updateSession();
      modal.remove();
      toast(trFree('shell', 'lang_ok'), '#10b981');
      // Re-pintar shell y tab activo
      paintShell();
      if (_activeTab) activateTab(_activeTab);
    };
  });

  document.body.appendChild(modal);
}

function updateSession() {
  const session = JSON.parse(localStorage.getItem('beu_session') || '{}');
  session.idioma = _usuario.idioma;
  session.tema = _usuario.tema;
  localStorage.setItem('beu_session', JSON.stringify(session));
}
