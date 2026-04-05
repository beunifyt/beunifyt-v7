// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v8 — core/context.js
// Central context: shared state, DB, filters, function registry.
// Every module imports from here instead of cross-importing each other.
// ═══════════════════════════════════════════════════════════════════════
import { AppState }    from '../state.js';
import { uid, nowLocal } from '../utils.js';

// ─── LOCAL STATE (shared across all modules) ─────────────────────────
export const DB = {
  ingresos:[], ingresos2:[], movimientos:[], conductores:[], agenda:[],
  mensajesRampa:[], listaNegra:[], enEspera:[], auditLog:[], exportLog:[], editHistory:[],
  eventos:[], recintos:[], usuarios:[], papelera:[], preregistros:[],
  empresas:[], vehiculos:[],
  activeEventId: null, activeEventIds:[], defaultEventId: null,
  printCfg1:{}, printCfg2:{}, printCfgAg:{}, printTemplates:[], printCfgModes:{},
  tabSorts: {},
};

// ─── FILTER STATE ────────────────────────────────────────────────────
export const iF = {
  q:'', fecha:'', hall:'', activos:false,
  q2:'', fecha2:'', hall2:'', activos2:false,
  qF:'', statusF:'', hallF:'',
  qC:'', empresaC:'',
  qAg:'', fechaAg:'', estadoAg:'', hallAg:'',
  _sub:'lista', _sub2:'lista',
};

// ─── SESSION ─────────────────────────────────────────────────────────
export const SID = uid();
export let curTab = 'dash';
export function setCurTab(t) { curTab = t; }

// ─── TOGGLES ─────────────────────────────────────────────────────────
export let _autoFillOn = false;
export let _posAutoOn  = true;
export function setAutoFill(v) { _autoFillOn = v; }
export function setPosAuto(v) { _posAutoOn = v; }

// ─── EDIT TRACKING IDS ──────────────────────────────────────────────
export let editIngId=null, editAgId=null, editCondId=null, editMovId=null;
export let editEvId=null, editEEId=null, editLNId=null, editUserId=null;

// ─── EXTRA FILTER STATE ─────────────────────────────────────────────
export let fF = {q:'',status:'',hall:''};
export let cF = {q:'',empresa:''};
export let agF = {q:'',fecha:'',estado:'',evento:'',desde:'',hasta:'',hall:''};

// ─── LANGUAGE ────────────────────────────────────────────────────────
export let CUR_LANG = 'es';
export function setCurLang(l) { CUR_LANG = l; }

// ─── FIRESTORE UNSUBS ───────────────────────────────────────────────
export const _unsubs = [];

// ─── FUNCTION REGISTRY ──────────────────────────────────────────────
// Modules register their render/action functions here.
// This avoids circular imports — any module can call any function via registry.
const _registry = {};

export function registerFn(name, fn) {
  _registry[name] = fn;
}

export function callFn(name, ...args) {
  if (_registry[name]) return _registry[name](...args);
  console.warn('[ctx] function not registered:', name);
}

export function getFn(name) {
  return _registry[name] || (() => {});
}

export function getAllFns() {
  return { ..._registry };
}

// ─── EXPOSE ON WINDOW ───────────────────────────────────────────────
window.DB = DB;
window.iF = iF;
