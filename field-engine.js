// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — field-engine.js
// Motor compartido: campos, columnas, plantillas, custom fields
// + Cross-read: lectura silenciosa entre colecciones
// ═══════════════════════════════════════════════════════════

import { safeHtml, toast, normPlate } from './utils.js';

const _states = {};
function _key(mod, s) { return `beu_${s}_${mod}`; }
function _load(mod, s, fb) { try { const v = JSON.parse(localStorage.getItem(_key(mod, s))); return v || fb; } catch(e) { return fb; } }
function _save(mod, s, d) { try { localStorage.setItem(_key(mod, s), JSON.stringify(d)); } catch(e) {} }

// ── INIT ──
export function initFields(mod, defs) {
  const ds = {};
  Object.values(defs).forEach(sec => sec.fields.forEach(f => {
    ds[f.id] = { visible: true, required: !!f.req, label: f.label, order: 0 };
  }));
  _states[mod] = { defs, campos: _load(mod, 'campos', ds), custom: _load(mod, 'custom', []), visCols: _load(mod, 'vis', null), tpls: _load(mod, 'tpls', {}) };
  return _states[mod];
}
export function getFieldState(mod) { return _states[mod]; }

// ── CAMPOS ──
export function toggleCampoVisible(mod, fid) {
  const st = _states[mod]; if (!st) return;
  const f = Object.values(st.defs).flatMap(s => s.fields).find(x => x.id === fid);
  if (f?.req) { toast('Campo requerido', '#d97706'); return; }
  if (!st.campos[fid]) st.campos[fid] = { visible: true, required: false, label: fid, order: 0 };
  st.campos[fid].visible = !st.campos[fid].visible;
  _save(mod, 'campos', st.campos);
}
export function setCampoRequired(mod, fid, v) { const st = _states[mod]; if (!st) return; if (!st.campos[fid]) st.campos[fid] = { visible: true, required: false, label: fid, order: 0 }; st.campos[fid].required = v; _save(mod, 'campos', st.campos); }
export function renameCampo(mod, fid, nl) { const st = _states[mod]; if (!st) return; if (!st.campos[fid]) st.campos[fid] = { visible: true, required: false, label: fid, order: 0 }; st.campos[fid].label = nl; _save(mod, 'campos', st.campos); }
export function resetCampos(mod) {
  const st = _states[mod]; if (!st) return;
  const ds = {}; Object.values(st.defs).forEach(sec => sec.fields.forEach(f => { ds[f.id] = { visible: true, required: !!f.req, label: f.label, order: 0 }; }));
  st.campos = ds; st.custom = [];
  _save(mod, 'campos', st.campos); _save(mod, 'custom', st.custom);
}

// ── CUSTOM FIELDS ──
export function addCustomField(mod, field) {
  const st = _states[mod]; if (!st) return;
  const id = 'custom_' + Date.now().toString(36);
  st.custom.push({ id, ...field });
  st.campos[id] = { visible: true, required: false, label: field.label, order: 999 };
  _save(mod, 'custom', st.custom); _save(mod, 'campos', st.campos);
  return id;
}
export function removeCustomField(mod, idx) {
  const st = _states[mod]; if (!st) return;
  const removed = st.custom.splice(idx, 1)[0];
  if (removed) delete st.campos[removed.id];
  _save(mod, 'custom', st.custom); _save(mod, 'campos', st.campos);
}

// ── FIELD ORDER (drag-and-drop persistence) ──
export function getFieldOrder(mod, secKey) {
  return _load(mod, `order_${secKey}`, null);
}
export function saveFieldOrder(mod, secKey, order) {
  _save(mod, `order_${secKey}`, order);
}
export function getOrderedFields(mod, secKey) {
  const st = _states[mod]; if (!st) return [];
  const sec = st.defs[secKey]; if (!sec) return [];
  const saved = getFieldOrder(mod, secKey);
  if (!saved) return sec.fields;
  // Reorder based on saved id list
  const ordered = [];
  saved.forEach(id => { const f = sec.fields.find(x => x.id === id); if (f) ordered.push(f); });
  // Add any new fields not in saved order
  sec.fields.forEach(f => { if (!ordered.find(x => x.id === f.id)) ordered.push(f); });
  return ordered;
}

// ── VISIBLE FORM FIELDS ──
export function getVisibleFormFields(mod) {
  const st = _states[mod]; if (!st) return [];
  const result = [];
  Object.entries(st.defs).forEach(([secKey, sec]) => {
    const fields = getOrderedFields(mod, secKey);
    fields.filter(f => { const cs = st.campos[f.id]; return !cs || cs.visible; })
    .forEach(f => result.push({ ...f, label: st.campos[f.id]?.label || f.label, required: st.campos[f.id]?.required ?? f.req, section: secKey, sectionLabel: sec.label, sectionIcon: sec.icon }));
  });
  st.custom.forEach(cf => {
    const cs = st.campos[cf.id];
    if (cs && !cs.visible) return;
    result.push({ id: cf.id, label: cs?.label || cf.label, required: cs?.required || false, type: cf.type || 'text', section: cf.section || 'custom', sectionLabel: 'Personalizado', sectionIcon: '🔧', isCustom: true });
  });
  return result;
}

// ── COLUMNS ──
export function initCols(mod, allCols) { const st = _states[mod]; if (!st) return; if (!st.visCols) st.visCols = allCols.map(c => c.id); return st.visCols; }
export function toggleCol(mod, colId, allCols) { const st = _states[mod]; if (!st) return; const col = allCols.find(c => c.id === colId); if (col?.req) return; if (st.visCols.includes(colId)) st.visCols = st.visCols.filter(x => x !== colId); else st.visCols.push(colId); _save(mod, 'vis', st.visCols); }
export function resetCols(mod, allCols) { const st = _states[mod]; if (!st) return; st.visCols = allCols.map(c => c.id); _save(mod, 'vis', st.visCols); }
export function getVisCols(mod) { return _states[mod]?.visCols || []; }

// ── TEMPLATES ──
export function saveTpl(mod, name) { const st = _states[mod]; if (!st || !name) return; Object.keys(st.tpls).forEach(k => st.tpls[k]._active = false); st.tpls[name] = { vis: [...st.visCols], _active: true }; _save(mod, 'tpls', st.tpls); }
export function applyTpl(mod, name) { const st = _states[mod]; if (!st) return; const t = st.tpls[name]; if (!t) return; st.visCols = [...t.vis]; Object.keys(st.tpls).forEach(k => st.tpls[k]._active = false); st.tpls[name]._active = true; _save(mod, 'vis', st.visCols); _save(mod, 'tpls', st.tpls); }
export function deleteTpl(mod, name) { const st = _states[mod]; if (!st) return; delete st.tpls[name]; _save(mod, 'tpls', st.tpls); }
export function getTpls(mod) { return _states[mod]?.tpls || {}; }

// ═══════════════════════════════════════════════════════════
// CROSS-READ — lectura silenciosa entre colecciones
// No depende de tabs visibles, solo de Firestore
// ═══════════════════════════════════════════════════════════
const _crossCache = {};

export async function crossRead(collection) {
  // Devuelve datos de otra colección (lectura puntual, no listener)
  if (_crossCache[collection] && (Date.now() - _crossCache[collection].ts < 30000)) {
    return _crossCache[collection].data; // cache 30s
  }
  try {
    const { fsGetAll } = await import('./firestore.js');
    const data = await fsGetAll(collection);
    _crossCache[collection] = { data, ts: Date.now() };
    return data;
  } catch(e) { return []; }
}

// Buscar conductor por matrícula (cross-read conductores)
export async function findConductor(matricula) {
  if (!matricula) return null;
  const mat = normPlate(matricula);
  const conductores = await crossRead('conductores');
  return conductores.find(c => normPlate(c.matricula) === mat || normPlate(c.vehiculo) === mat) || null;
}

// Buscar referencia en agenda (cross-read silencioso)
export async function findAgendaByRef(ref) {
  if (!ref || ref.length < 3) return null;
  const agenda = await crossRead('agenda');
  const q = ref.toUpperCase();
  return agenda.find(a => (a.referencia || '').toUpperCase() === q) || null;
}

// Buscar historial de matrícula en ingresos + referencia
export async function findHistorial(matricula) {
  if (!matricula) return [];
  const mat = normPlate(matricula);
  const [ing, ref] = await Promise.all([crossRead('ingresos2'), crossRead('ingresos')]);
  return [...ing, ...ref].filter(d => normPlate(d.matricula) === mat).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
}

// AutoFill: busca en conductores + historial y devuelve datos para precargar
export async function autoFillByPlate(matricula) {
  if (!matricula) return null;
  const mat = normPlate(matricula);
  // 1. Buscar en conductores
  const cond = await findConductor(mat);
  if (cond) return { source: 'conductores', data: cond };
  // 2. Buscar en historial (último ingreso/referencia)
  const hist = await findHistorial(mat);
  if (hist.length) return { source: 'historial', data: hist[0] };
  return null;
}

// ── POS: auto-incremento atómico ──
export function nextPos(data) {
  if (!data || !data.length) return 1;
  const max = data.reduce((m, d) => Math.max(m, parseInt(d.pos) || 0), 0);
  return max + 1;
}

// ═══════════════════════════════════════════════════════════
// IMPORT EXCEL — función compartida
// ═══════════════════════════════════════════════════════════
export async function importExcel(file, collection, requiredField, onDone) {
  if (!file) return;
  // Cargar XLSX dinámicamente
  let XLSX;
  try {
    XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
  } catch(e) {
    toast('Error cargando XLSX', '#ef4444');
    return;
  }
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
        let added = 0;
        const { fsAdd } = await import('./firestore.js');
        for (const row of rows) {
          // Normalizar keys: primera letra mayúscula → minúscula
          const item = {};
          Object.entries(row).forEach(([k, v]) => {
            const key = k.charAt(0).toLowerCase() + k.slice(1);
            item[key] = typeof v === 'string' ? v.trim() : v;
          });
          // Validar campo requerido
          const reqVal = item[requiredField] || item[requiredField.charAt(0).toUpperCase() + requiredField.slice(1)];
          if (!reqVal) continue;
          if (item.matricula) item.matricula = normPlate(item.matricula);
          item.creadoPor = 'Importación';
          item.fecha = item.fecha || new Date().toISOString().slice(0, 16).replace('T', ' ');
          await fsAdd(collection, item);
          added++;
        }
        toast(`✅ ${added} importados`, '#10b981');
        if (onDone) onDone();
        resolve(added);
      } catch(err) {
        toast('❌ ' + err.message, '#ef4444');
        resolve(0);
      }
    };
    r.readAsBinaryString(file);
  });
}

// ═══════════════════════════════════════════════════════════
// RENDER HELPERS (shared HTML generators)
// ═══════════════════════════════════════════════════════════

export function renderCamposHTML(mod, c) {
  const st = _states[mod]; if (!st) return '';
  const pfx = mod.replace(/[^a-z0-9]/g, '');
  let h = `<div id="_campos_${pfx}" style="padding:14px;max-width:700px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div><div style="font-size:14px;font-weight:700">Configuración de campos</div><div style="font-size:11px;color:${c.t3}">Activá, ocultá, renombrá o arrastrá para reordenar</div></div><button style="padding:5px 12px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer" onclick="window._fe_reset('${mod}')">↺ Restaurar</button></div>`;
  Object.entries(st.defs).forEach(([secKey, sec]) => {
    const fields = getOrderedFields(mod, secKey);
    h += `<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.blue};display:flex;align-items:center;gap:7px">${sec.icon} ${sec.label}</div><div id="_sec_${pfx}_${secKey}">`;
    fields.forEach((f, idx) => {
      const cs = st.campos[f.id] || { visible: true, required: !!f.req, label: f.label };
      h += `<div class="_dragrow" draggable="true" data-mod="${mod}" data-sec="${secKey}" data-fid="${f.id}" data-idx="${idx}" style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid ${c.border}22;transition:background .15s">
        <div class="_dragH" style="cursor:grab;opacity:.25;font-size:14px;flex-shrink:0;user-select:none;padding:2px 4px" title="Arrastrar para reordenar">⠿</div>
        <div style="width:34px;height:18px;border-radius:20px;background:${cs.visible ? c.blue : c.border};position:relative;flex-shrink:0;cursor:pointer" onclick="window._fe_tog('${mod}','${f.id}')"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${cs.visible ? '18' : '2'}px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px"><span id="_fl_${pfx}_${f.id}" style="font-size:12px;font-weight:600">${safeHtml(cs.label)}</span>${f.req ? '<span style="font-size:9px;opacity:.35">(requerido)</span>' : ''}<span style="font-size:11px;opacity:.3;cursor:pointer" onclick="window._fe_ren('${mod}','${f.id}','_fl_${pfx}_${f.id}')">✏️</span></div>
          <div style="font-size:11px;opacity:.45">${f.desc || ''}</div>
        </div>
        <label style="display:flex;align-items:center;gap:4px;font-size:11px;opacity:.6;cursor:pointer;white-space:nowrap"><input type="checkbox" ${cs.required ? 'checked' : ''} ${f.req ? 'disabled' : ''} onchange="window._fe_req('${mod}','${f.id}',this.checked)" style="accent-color:${c.blue}"> Obligatorio</label>
      </div>`;
    });
    h += '</div></div>';
  });
  if (st.custom.length) {
    h += `<div style="margin-bottom:12px;background:${c.bg2};border:1px solid ${c.border};border-radius:12px;overflow:hidden"><div style="padding:10px 14px;border-bottom:1px solid ${c.border};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed">🔧 Campos personalizados</div>`;
    st.custom.forEach((cf, i) => { h += `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px"><span style="font-size:12px;font-weight:600;flex:1">${safeHtml(cf.label)} <small style="opacity:.4">(${cf.type}) — ${cf.section}</small></span><button style="font-size:11px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;padding:2px 6px;cursor:pointer" onclick="window._fe_delcustom('${mod}',${i})">✕</button></div>`; });
    h += '</div>';
  }
  h += `<button style="padding:8px 14px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer;width:100%" onclick="window._fe_addcustom('${mod}')">+ Agregar campo personalizado</button></div>`;
  // Attach drag events after render
  setTimeout(() => _initDrag(pfx, mod), 50);
  return h;
}

// ── DRAG AND DROP logic ──
function _initDrag(pfx, mod) {
  const container = document.getElementById('_campos_' + pfx);
  if (!container) return;
  let dragEl = null, dragSec = null;
  container.querySelectorAll('._dragrow').forEach(row => {
    row.addEventListener('dragstart', (e) => {
      dragEl = row;
      dragSec = row.dataset.sec;
      row.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', row.dataset.fid);
    });
    row.addEventListener('dragend', () => {
      if (dragEl) dragEl.style.opacity = '1';
      dragEl = null;
      container.querySelectorAll('._dragrow').forEach(r => {
        r.style.borderTop = '';
        r.style.borderBottom = '';
      });
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragEl || row.dataset.sec !== dragSec) return;
      e.dataTransfer.dropEffect = 'move';
      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      container.querySelectorAll('._dragrow').forEach(r => { r.style.borderTop = ''; r.style.borderBottom = ''; });
      if (e.clientY < mid) {
        row.style.borderTop = '2px solid #3b82f6';
      } else {
        row.style.borderBottom = '2px solid #3b82f6';
      }
    });
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragEl || row.dataset.sec !== dragSec || dragEl === row) return;
      const sec = row.dataset.sec;
      const secContainer = document.getElementById(`_sec_${pfx}_${sec}`);
      if (!secContainer) return;
      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        secContainer.insertBefore(dragEl, row);
      } else {
        secContainer.insertBefore(dragEl, row.nextSibling);
      }
      // Save new order
      const newOrder = [];
      secContainer.querySelectorAll('._dragrow').forEach(r => newOrder.push(r.dataset.fid));
      saveFieldOrder(mod, sec, newOrder);
      dragEl.style.opacity = '1';
      container.querySelectorAll('._dragrow').forEach(r => { r.style.borderTop = ''; r.style.borderBottom = ''; });
      toast('Orden guardado', '#10b981');
    });
  });
}

export function renderColPanelHTML(mod, allCols, c) {
  const st = _states[mod]; if (!st) return '';
  let h = `<div style="padding:14px 16px;border-bottom:1px solid ${c.border};display:flex;align-items:center;justify-content:space-between;flex-shrink:0"><span style="font-size:14px;font-weight:700">⚙ Columnas</span><button style="padding:4px 10px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:12px;cursor:pointer" onclick="window._fe_closecp('${mod}')">✕</button></div><div style="flex:1;overflow-y:auto;padding:12px 14px"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.t3};margin-bottom:8px">Visibilidad</div>`;
  allCols.forEach(col => { const on = st.visCols.includes(col.id); h += `<div style="display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:8px;cursor:${col.req ? 'default' : 'pointer'};opacity:${col.req ? .55 : 1};margin-bottom:2px" ${col.req ? '' : `onclick="window._fe_togcol('${mod}','${col.id}')"`}><div style="width:34px;height:18px;border-radius:20px;background:${on ? c.blue : c.border};position:relative"><div style="position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;top:2px;left:${on ? '18' : '2'}px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div></div><span style="font-size:12px;font-weight:500;color:${on ? c.blue : c.text};flex:1">${col.label}${col.req ? ' <small style="opacity:.3">(fija)</small>' : ''}</span></div>`; });
  h += `<button style="width:100%;margin-top:10px;padding:7px;background:${c.bg2};color:${c.t3};border:1px solid ${c.border};border-radius:8px;font-size:11px;cursor:pointer" onclick="window._fe_resetcols('${mod}')">↺ Restaurar</button></div>`;
  h += `<div style="padding:12px 14px;border-top:1px solid ${c.border};flex-shrink:0"><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:${c.t3};margin-bottom:8px">Plantillas</div><div style="display:flex;gap:6px;margin-bottom:8px"><input id="_tplIn_${mod}" placeholder="Nombre..." style="flex:1;border:1px solid ${c.border};border-radius:8px;padding:7px 10px;font-size:12px;outline:none;background:${c.bg2};color:${c.text}"><button style="padding:7px 14px;background:${c.blue};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer" onclick="window._fe_savetpl('${mod}')">Guardar</button></div>`;
  const tpls = st.tpls;
  if (Object.keys(tpls).length) Object.keys(tpls).forEach(n => { h += `<div style="display:flex;align-items:center;gap:5px;padding:7px 10px;background:${tpls[n]._active ? c.bll : c.bg2};border:1px solid ${tpls[n]._active ? c.blue : c.border};border-radius:8px;cursor:pointer;margin-bottom:4px" onclick="window._fe_applytpl('${mod}','${n}')"><span style="flex:1;font-size:12px">📋 ${n}</span><span style="font-size:11px;opacity:.4;cursor:pointer;padding:2px 4px" onclick="event.stopPropagation();window._fe_deltpl('${mod}','${n}')">✕</span></div>`; });
  else h += '<div style="font-size:11px;opacity:.4">Sin plantillas</div>';
  h += '</div>';
  return h;
}

// ── GLOBAL BINDINGS ──
window._fe_tog = (mod, fid) => { toggleCampoVisible(mod, fid); window._fe_refresh?.(mod); };
window._fe_req = (mod, fid, v) => { setCampoRequired(mod, fid, v); };
window._fe_ren = (mod, fid, elId) => {
  const el = document.getElementById(elId); if (!el) return;
  const st = _states[mod]; const cur = st?.campos[fid]?.label || fid;
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
  window._fe_refresh?.(mod); toast(`Campo "${name}" agregado`, '#10b981');
};
window._fe_delcustom = (mod, idx) => { removeCustomField(mod, idx); window._fe_refresh?.(mod); toast('Campo eliminado', '#f59e0b'); };
window._fe_togcol = (mod, colId) => { const ac = window._fe_allcols?.(mod) || []; toggleCol(mod, colId, ac); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); };
window._fe_resetcols = (mod) => { const ac = window._fe_allcols?.(mod) || []; resetCols(mod, ac); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); };
window._fe_closecp = (mod) => { window._fe_onclosecp?.(mod); };
window._fe_savetpl = (mod) => { const el = document.getElementById(`_tplIn_${mod}`); const n = el?.value.trim(); if (!n) { toast('Nombre requerido', '#ef4444'); return; } saveTpl(mod, n); el.value = ''; window._fe_refreshcp?.(mod); toast(`"${n}" guardada`, '#10b981'); };
window._fe_applytpl = (mod, name) => { applyTpl(mod, name); window._fe_refreshcp?.(mod); window._fe_refresh?.(mod); toast(`"${name}" activada`, '#10b981'); };
window._fe_deltpl = (mod, name) => { deleteTpl(mod, name); window._fe_refreshcp?.(mod); toast('Eliminada', '#f59e0b'); };
