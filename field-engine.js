// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — field-engine.js
// Motor compartido de campos, columnas y plantillas
// Reutilizable por: ingresos, referencia, conductores, embalaje, agenda
// ═══════════════════════════════════════════════════════════

import { safeHtml, toast } from './utils.js';
import { trFree } from './langs.js';

// ── CAMPOS STATE ──────────────────────────────────────────
// Cada módulo llama initFields(MODULE_ID, defaultDefs) al arrancar
// defaultDefs = { seccion: { icon, label, fields: [{id,label,req,desc,type}] } }
// type = 'text'|'number'|'date'|'time'|'select'|'textarea'

const _states = {};

function _key(mod, suffix) { return `beu_${suffix}_${mod}`; }
function _load(mod, suffix, fallback) { try { const v = JSON.parse(localStorage.getItem(_key(mod, suffix))); return v || fallback; } catch(e) { return fallback; } }
function _save(mod, suffix, data) { try { localStorage.setItem(_key(mod, suffix), JSON.stringify(data)); } catch(e) {} }

export function initFields(mod, defaultDefs) {
  const defState = {};
  Object.values(defaultDefs).forEach(sec => sec.fields.forEach(f => {
    defState[f.id] = { visible: true, required: !!f.req, label: f.label, order: 0 };
  }));
  _states[mod] = {
    defs: defaultDefs,
    campos: _load(mod, 'campos', defState),
    custom: _load(mod, 'custom', []),
    visCols: _load(mod, 'vis', null),
    tpls: _load(mod, 'tpls', {}),
  };
  return _states[mod];
}

export function getFieldState(mod) { return _states[mod]; }

// ── CAMPOS CRUD ───────────────────────────────────────────
export function toggleCampoVisible(mod, fieldId) {
  const st = _states[mod]; if (!st) return;
  const defs = Object.values(st.defs).flatMap(s => s.fields);
  const f = defs.find(x => x.id === fieldId);
  if (f?.req) { toast('Campo requerido', '#d97706'); return; }
  if (!st.campos[fieldId]) st.campos[fieldId] = { visible: true, required: false, label: fieldId, order: 0 };
  st.campos[fieldId].visible = !st.campos[fieldId].visible;
  _save(mod, 'campos', st.campos);
}

export function setCampoRequired(mod, fieldId, val) {
  const st = _states[mod]; if (!st) return;
  if (!st.campos[fieldId]) st.campos[fieldId] = { visible: true, required: false, label: fieldId, order: 0 };
  st.campos[fieldId].required = val;
  _save(mod, 'campos', st.campos);
}

export function renameCampo(mod, fieldId, newLabel) {
  const st = _states[mod]; if (!st) return;
  if (!st.campos[fieldId]) st.campos[fieldId] = { visible: true, required: false, label: fieldId, order: 0 };
  st.campos[fieldId].label = newLabel;
  _save(mod, 'campos', st.campos);
}

export function resetCampos(mod) {
  const st = _states[mod]; if (!st) return;
  const defState = {};
  Object.values(st.defs).forEach(sec => sec.fields.forEach(f => {
    defState[f.id] = { visible: true, required: !!f.req, label: f.label, order: 0 };
  }));
  st.campos = defState;
  st.custom = [];
  _save(mod, 'campos', st.campos);
  _save(mod, 'custom', st.custom);
}

// ── CUSTOM FIELDS ─────────────────────────────────────────
export function addCustomField(mod, field) {
  // field = { label, type, section }
  const st = _states[mod]; if (!st) return;
  const id = 'custom_' + Date.now().toString(36);
  st.custom.push({ id, ...field });
  st.campos[id] = { visible: true, required: false, label: field.label, order: 999 };
  _save(mod, 'custom', st.custom);
  _save(mod, 'campos', st.campos);
  return id;
}

export function removeCustomField(mod, idx) {
  const st = _states[mod]; if (!st) return;
  const removed = st.custom.splice(idx, 1)[0];
  if (removed) delete st.campos[removed.id];
  _save(mod, 'custom', st.custom);
  _save(mod, 'campos', st.campos);
}

export function moveField(mod, section, fromIdx, toIdx) {
  const st = _states[mod]; if (!st) return;
  const sec = st.defs[section]; if (!sec) return;
  const arr = sec.fields;
  const [item] = arr.splice(fromIdx, 1);
  arr.splice(toIdx, 0, item);
  // No need to persist defs to localStorage for now, they reset on reload
  // For persistent reorder, would need to store order in campos state
}

// ── VISIBLE FIELDS for form ───────────────────────────────
export function getVisibleFormFields(mod) {
  const st = _states[mod]; if (!st) return [];
  const result = [];
  Object.entries(st.defs).forEach(([secKey, sec]) => {
    const fields = sec.fields.filter(f => {
      const cs = st.campos[f.id];
      return !cs || cs.visible;
    }).map(f => ({
      ...f,
      label: st.campos[f.id]?.label || f.label,
      required: st.campos[f.id]?.required ?? f.req,
      section: secKey,
      sectionLabel: sec.label,
      sectionIcon: sec.icon,
    }));
    result.push(...fields);
  });
  // Add custom fields
  st.custom.forEach(cf => {
    const cs = st.campos[cf.id];
    if (cs && !cs.visible) return;
    result.push({
      id: cf.id,
      label: cs?.label || cf.label,
      required: cs?.required || false,
      type: cf.type || 'text',
      section: cf.section || 'custom',
      sectionLabel: 'Personalizado',
      sectionIcon: '🔧',
      isCustom: true,
    });
  });
  return result;
}

// ── COLUMNS ───────────────────────────────────────────────
export function initCols(mod, allCols) {
  const st = _states[mod]; if (!st) return;
  if (!st.visCols) st.visCols = allCols.map(c => c.id);
  return st.visCols;
}

export function toggleCol(mod, colId, allCols) {
  const st = _states[mod]; if (!st) return;
  const col = allCols.find(c => c.id === colId);
  if (col?.req) return;
  if (st.visCols.includes(colId)) st.visCols = st.visCols.filter(x => x !== colId);
  else st.visCols.push(colId);
  _save(mod, 'vis', st.visCols);
}

export function resetCols(mod, allCols) {
  const st = _states[mod]; if (!st) return;
  st.visCols = allCols.map(c => c.id);
  _save(mod, 'vis', st.visCols);
}

export function getVisCols(mod) { return _states[mod]?.visCols || []; }

// ── TEMPLATES ─────────────────────────────────────────────
export function saveTpl(mod, name) {
  const st = _states[mod]; if (!st || !name) return;
  Object.keys(st.tpls).forEach(k => st.tpls[k]._active = false);
  st.tpls[name] = { vis: [...st.visCols], _active: true };
  _save(mod, 'tpls', st.tpls);
}

export function applyTpl(mod, name, allCols) {
  const st = _states[mod]; if (!st) return;
  const t = st.tpls[name]; if (!t) return;
  st.visCols = [...t.vis];
  Object.keys(st.tpls).forEach(k => st.tpls[k]._active = false);
  st.tpls[name]._active = true;
  _save(mod, 'vis', st.visCols);
  _save(mod, 'tpls', st.tpls);
}

export function deleteTpl(mod, name) {
  const st = _states[mod]; if (!st) return;
  delete st.tpls[name];
  _save(mod, 'tpls', st.tpls);
}

export function getTpls(mod) { return _states[mod]?.tpls || {}; }

// ── RENDER CAMPOS TAB (shared) ────────────────────────────
export function renderCamposHTML(mod, colors) {
  const st = _states[mod]; if (!st) return '';
  const c = colors;
  const prefix = mod.replace(/[^a-z0-9]/g, '');

  let html = `<div style="padding:14px;max-width:700px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div><div style="font-size:14px;font-weight:700">Configuración de campos</div>
      <div style="font-size:11px;color:${c.t3}">Activá, ocultá o renombrá los campos del formulario</div></div>
      <button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer" onclick="window._fe_reset('${mod}')">↺ Restaurar</button>
    </div>`;

  Object.entries(st.defs).forEach(([secKey, sec]) => {
    html += `<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};display:flex;align-items:center;gap:7px">${sec.icon} ${sec.label}</div>`;
    sec.fields.forEach((f, idx) => {
      const cs = st.campos[f.id] || { visible: true, required: !!f.req, label: f.label };
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px" draggable="true" data-sec="${secKey}" data-idx="${idx}">
        <div style="cursor:grab;opacity:.3;font-size:14px" title="Arrastrar">⠿</div>
        <div style="width:34px;height:18px;border-radius:20px;background:${cs.visible ? c.blue : c.border};position:relative;flex-shrink:0;cursor:pointer;transition:background .18s" onclick="window._fe_tog('${mod}','${f.id}')"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${cs.visible ? '18' : '2'}px;transition:left .18s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px">
            <span id="_fl_${prefix}_${f.id}" style="font-size:12px;font-weight:600">${safeHtml(cs.label)}</span>
            ${f.req ? '<span style="font-size:9px;opacity:.35">(requerido)</span>' : ''}
            <span style="font-size:11px;opacity:.3;cursor:pointer" onclick="window._fe_ren('${mod}','${f.id}','_fl_${prefix}_${f.id}')" title="Renombrar">✏️</span>
          </div>
          <div style="font-size:11px;opacity:.45">${f.desc || ''}</div>
        </div>
        <label style="display:flex;align-items:center;gap:4px;font-size:11px;opacity:.6;cursor:pointer;white-space:nowrap">
          <input type="checkbox" ${cs.required ? 'checked' : ''} ${f.req ? 'disabled' : ''} onchange="window._fe_req('${mod}','${f.id}',this.checked)" style="accent-color:${c.blue}"> Obligatorio
        </label>
      </div>`;
    });
    html += '</div>';
  });

  // Custom fields
  if (st.custom.length) {
    html += `<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed;display:flex;align-items:center;gap:7px">🔧 Campos personalizados</div>`;
    st.custom.forEach((cf, i) => {
      html += `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px">
        <span style="font-size:12px;font-weight:600;flex:1">${safeHtml(cf.label)} <small style="opacity:.4">(${cf.type}) — ${cf.section || 'sin sección'}</small></span>
        <button style="font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;padding:2px 6px;cursor:pointer" onclick="window._fe_delcustom('${mod}',${i})">✕</button>
      </div>`;
    });
    html += '</div>';
  }

  html += `<button style="padding:8px 14px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer;width:100%" onclick="window._fe_addcustom('${mod}')">+ Agregar campo personalizado</button></div>`;
  return html;
}

// ── RENDER COL PANEL (shared) ─────────────────────────────
export function renderColPanelHTML(mod, allCols, colors) {
  const st = _states[mod]; if (!st) return '';
  const c = colors;
  const tpls = st.tpls;

  let html = `<div style="padding:14px 16px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
    <span style="font-size:14px;font-weight:700">⚙ Columnas</span>
    <button style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="window._fe_closecp('${mod}')">✕</button>
  </div>
  <div style="flex:1;overflow-y:auto;padding:12px 14px">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.t3};margin-bottom:8px">Visibilidad</div>`;

  allCols.forEach(col => {
    const on = st.visCols.includes(col.id);
    html += `<div style="display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;cursor:${col.req ? 'default' : 'pointer'};opacity:${col.req ? .55 : 1};margin-bottom:2px" ${col.req ? '' : `onclick="window._fe_togcol('${mod}','${col.id}')"`}>
      <div style="width:34px;height:18px;border-radius:20px;background:${on ? c.blue : c.border};position:relative;flex-shrink:0"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on ? '18' : '2'}px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div>
      <span style="font-size:12px;font-weight:500;color:${on ? c.blue : c.text};flex:1">${col.label}${col.req ? ' <small style="opacity:.3">(fija)</small>' : ''}</span>
    </div>`;
  });

  html += `<button style="width:100%;margin-top:10px;padding:7px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer;font-family:inherit" onclick="window._fe_resetcols('${mod}')">↺ Restaurar</button></div>`;

  html += `<div style="padding:12px 14px;border-top:1px solid ${c.border};flex-shrink:0">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.t3};margin-bottom:8px">Plantillas</div>
    <div style="display:flex;gap:6px;margin-bottom:8px">
      <input id="_tplIn_${mod}" placeholder="Nombre plantilla..." style="flex:1;border:1px solid ${c.border};border-radius:8px;padding:7px 10px;font-size:12px;font-family:inherit;outline:none;background:${c.bg2};color:${c.text}">
      <button style="padding:7px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" onclick="window._fe_savetpl('${mod}')">Guardar</button>
    </div>`;

  if (Object.keys(tpls).length) {
    Object.keys(tpls).forEach(n => {
      html += `<div style="display:flex;align-items:center;gap:5px;padding:7px 10px;background:${tpls[n]._active ? c.bll : c.bg2};border:1px solid ${tpls[n]._active ? c.blue : c.border};border-radius:8px;cursor:pointer;margin-bottom:4px" onclick="window._fe_applytpl('${mod}','${n}')">
        <span style="flex:1;font-size:12px;font-weight:500">📋 ${n}</span>
        <span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();window._fe_deltpl('${mod}','${n}')">✕</span>
      </div>`;
    });
  } else {
    html += '<div style="font-size:11px;padding:4px;opacity:.4">Sin plantillas guardadas</div>';
  }
  html += '</div>';
  return html;
}

// ── GLOBAL WINDOW BINDINGS ────────────────────────────────
// These are shared across all modules — each call includes mod id
window._fe_tog = (mod, fid) => { toggleCampoVisible(mod, fid); window._fe_refresh?.(mod); };
window._fe_req = (mod, fid, v) => { setCampoRequired(mod, fid, v); };
window._fe_ren = (mod, fid, elId) => {
  const el = document.getElementById(elId); if (!el) return;
  const st = _states[mod]; if (!st) return;
  const cur = st.campos[fid]?.label || fid;
  const inp = document.createElement('input'); inp.value = cur;
  inp.style.cssText = 'font-size:12px;font-weight:600;border:none;border-bottom:2px solid #2c5ee8;background:transparent;color:inherit;outline:none;width:120px;padding:1px 2px';
  inp.onblur = () => { renameCampo(mod, fid, inp.value.trim() || cur); window._fe_refresh?.(mod); };
  inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = cur; inp.blur(); } };
  el.replaceWith(inp); inp.focus(); inp.select();
};
window._fe_reset = (mod) => { resetCampos(mod); window._fe_refresh?.(mod); toast('Campos restaurados', '#10b981'); };
window._fe_addcustom = (mod) => {
  const name = prompt('Nombre del campo:'); if (!name) return;
  const type = prompt('Tipo (texto, numero, fecha, alfanumerico):', 'texto'); if (!type) return;
  const st = _states[mod]; if (!st) return;
  const sections = Object.keys(st.defs);
  const section = prompt(`Sección (${sections.join(', ')}):`, sections[0]); if (!section) return;
  addCustomField(mod, { label: name.trim(), type: type.trim(), section: section.trim() });
  window._fe_refresh?.(mod);
  toast(`Campo "${name}" agregado`, '#10b981');
};
window._fe_delcustom = (mod, idx) => { removeCustomField(mod, idx); window._fe_refresh?.(mod); toast('Campo eliminado', '#f59e0b'); };
window._fe_togcol = (mod, colId) => { const allCols = window._fe_allcols?.(mod) || []; toggleCol(mod, colId, allCols); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); };
window._fe_resetcols = (mod) => { const allCols = window._fe_allcols?.(mod) || []; resetCols(mod, allCols); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); };
window._fe_closecp = (mod) => { window._fe_onclosecp?.(mod); };
window._fe_savetpl = (mod) => {
  const el = document.getElementById(`_tplIn_${mod}`); const n = el?.value.trim();
  if (!n) { toast('Nombre requerido', '#ef4444'); return; }
  saveTpl(mod, n); el.value = '';
  window._fe_refreshcp?.(mod);
  toast(`Plantilla "${n}" guardada`, '#10b981');
};
window._fe_applytpl = (mod, name) => { const allCols = window._fe_allcols?.(mod) || []; applyTpl(mod, name, allCols); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); toast(`"${name}" activada`, '#10b981'); };
window._fe_deltpl = (mod, name) => { deleteTpl(mod, name); window._fe_refreshcp?.(mod); toast('Eliminada', '#f59e0b'); };
