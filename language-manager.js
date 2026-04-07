// ═══════════════════════════════════════════════════════════
// LANGUAGE-MANAGER.JS — Director de idiomas global
// Sincroniza: Firestore → localStorage → UI (3 selectores)
// ═══════════════════════════════════════════════════════════

import { I18N, LANGS_UI, LANGS } from './langs.js';

class LanguageManager {
  constructor() {
    this.CUR_LANG = 'es';
    this.modules = {};
  }

  // Registra módulo que necesita actualizarse
  registerModule(name, updateFn) {
    this.modules[name] = updateFn;
  }

  // 🔴 PRIMERO: Guardar en Firestore
  async saveToFirestore(uid, lang) {
    try {
      if (!window._firestore || !uid) return false;
      await window._firestore.set(`users/${uid}/settings`, { language: lang }, false);
      console.log(`✅ Idioma guardado Firestore: ${lang}`);
      return true;
    } catch (e) {
      console.error('❌ Error Firestore:', e);
      return false;
    }
  }

  // 🟡 SEGUNDO: Guardar en localStorage
  saveToLocalStorage(lang) {
    try {
      localStorage.setItem('beu_lang', lang);
      localStorage.setItem('beu_lang_ts', Date.now());
      console.log(`✅ Idioma guardado localStorage: ${lang}`);
    } catch (e) {
      console.warn('⚠️ localStorage no disponible');
    }
  }

  // 🟢 TERCERO: Actualizar UI global
  updateAllSelectors(lang) {
    const selectors = document.querySelectorAll('[data-lang-select]');
    selectors.forEach(sel => {
      sel.value = lang;
      sel.innerHTML = this._buildLangOptions();
    });
    console.log(`✅ Actualizados ${selectors.length} selectores de idioma`);
  }

  // Construye opciones del selector
  _buildLangOptions() {
    return LANGS_UI.map(l => 
      `<option value="${l.code}" title="${l.name}">${l.flag} ${l.code.toUpperCase()}</option>`
    ).join('');
  }

  // 🎯 FLUJO COMPLETO: Cambiar idioma
  async setLanguage(code, uid = null) {
    // Validar código
    if (!LANGS[code] || !I18N[code]) {
      console.error(`❌ Idioma inválido: ${code}`);
      return false;
    }

    console.log(`🌍 Cambiando idioma a: ${code}`);

    // 1️⃣ Guardar en Firestore (si hay UID)
    if (uid) {
      const fsSaved = await this.saveToFirestore(uid, code);
      if (!fsSaved) console.warn('⚠️ No se guardó en Firestore');
    }

    // 2️⃣ Guardar en localStorage
    this.saveToLocalStorage(code);

    // 3️⃣ Actualizar variable global
    this.CUR_LANG = code;
    window.CUR_LANG = code;

    // 4️⃣ Actualizar todos los selectores visibles
    this.updateAllSelectors(code);

    // 5️⃣ Re-renderizar módulos activos
    this._updateActiveModules(code);

    // 6️⃣ Cerrar modal idioma si existe
    document.getElementById('langModal')?.remove();

    console.log(`✅ IDIOMA COMPLETAMENTE ACTUALIZADO: ${code}`);
    return true;
  }

  // Actualiza todos los módulos registrados
  _updateActiveModules(lang) {
    Object.entries(this.modules).forEach(([name, updateFn]) => {
      try {
        if (typeof updateFn === 'function') {
          updateFn(lang);
          console.log(`  ✓ ${name} actualizado`);
        }
      } catch (e) {
        console.error(`  ✗ Error actualizando ${name}:`, e);
      }
    });
  }

  // Lee idioma de Firestore (al iniciar)
  async loadFromFirestore(uid) {
    try {
      if (!window._firestore || !uid) return null;
      const doc = await window._firestore.get(`users/${uid}/settings`);
      const lang = doc?.language;
      if (lang && LANGS[lang]) {
        console.log(`✅ Idioma cargado de Firestore: ${lang}`);
        return lang;
      }
    } catch (e) {
      console.warn('⚠️ No se cargó Firestore:', e);
    }
    return null;
  }

  // Lee idioma de localStorage (fallback)
  loadFromLocalStorage() {
    try {
      const lang = localStorage.getItem('beu_lang');
      if (lang && LANGS[lang]) {
        console.log(`✅ Idioma cargado de localStorage: ${lang}`);
        return lang;
      }
    } catch (e) {
      console.warn('⚠️ localStorage no disponible');
    }
    return null;
  }

  // 🚀 INICIALIZACIÓN: Cargar idioma guardado
  async init(uid = null) {
    console.log('🚀 Inicializando Language Manager...');

    // Intenta Firestore primero
    let lang = uid ? await this.loadFromFirestore(uid) : null;

    // Fallback a localStorage
    if (!lang) lang = this.loadFromLocalStorage();

    // Fallback a español
    if (!lang) lang = 'es';

    // Actualizar todo
    await this.setLanguage(lang, uid);

    return lang;
  }

  // Función helper para modules
  tr(key) {
    return (I18N[this.CUR_LANG] && I18N[this.CUR_LANG][key]) || I18N.es[key] || key;
  }
}

// Exportar singleton global
export const langManager = new LanguageManager();
window.langManager = langManager;

// Exponer función de cambio para onclick
window.changeLanguage = (code) => langManager.setLanguage(code);
