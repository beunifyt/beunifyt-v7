// language-manager.js — Gestor idiomas global
import { I18N, LANGS_UI } from './langs.js';

class LanguageManager {
  constructor() {
    this.CUR_LANG = 'es';
    this.modules = {};
  }

  registerModule(name, fn) {
    this.modules[name] = fn;
  }

  async saveFirestore(uid, lang) {
    try {
      if (!window._firestore || !uid) return false;
      await window._firestore.set(`users/${uid}/settings`, { language: lang }, false);
      return true;
    } catch(e) {
      return false;
    }
  }

  saveLocalStorage(lang) {
    try {
      localStorage.setItem('beu_lang', lang);
    } catch(e) {}
  }

  updateAllSelectors(lang) {
    document.querySelectorAll('[data-lang-select]').forEach(sel => {
      sel.value = lang;
    });
  }

  async setLanguage(code, uid = null) {
    if (!LANGS_UI.find(l => l.code === code)) return false;
    
    this.CUR_LANG = code;
    window.CUR_LANG = code;
    
    if (uid) await this.saveFirestore(uid, code);
    this.saveLocalStorage(code);
    this.updateAllSelectors(code);
    
    Object.values(this.modules).forEach(fn => {
      try { fn(code); } catch(e) {}
    });
    
    return true;
  }

  async loadFirestore(uid) {
    try {
      if (!window._firestore || !uid) return null;
      const doc = await window._firestore.get(`users/${uid}/settings`);
      return doc?.language || null;
    } catch(e) {
      return null;
    }
  }

  loadLocalStorage() {
    try {
      return localStorage.getItem('beu_lang');
    } catch(e) {
      return null;
    }
  }

  async init(uid = null) {
    let lang = uid ? await this.loadFirestore(uid) : null;
    if (!lang) lang = this.loadLocalStorage();
    if (!lang) lang = 'es';
    
    await this.setLanguage(lang, uid);
    return lang;
  }
}

export const langManager = new LanguageManager();
window.langManager = langManager;
window.changeLanguage = (code) => langManager.setLanguage(code);
