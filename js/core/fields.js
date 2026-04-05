// BeUnifyT v8 — core/fields.js — Dynamic field configuration per module
import { DB, registerFn, callFn } from './context.js';
import { esc, PRINT_DEF, PRINT_LABELS } from './shared.js';
import { isSA, canCampos } from '../auth.js';
import { saveDB } from './db.js';

const ALL_CAMPOS = {
  ingresos:   ['posicion','llamador','ref','empresa','hall','stand','puertaHall','acceso','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','fechaExpiracion','pais','telefono','email','comentario','horario'],
  ingresos2:  ['posicion','llamador','ref','empresa','hall','stand','puertaHall','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','pais','telefono','email','comentario'],
  agenda:     ['matricula','fecha','hora','remolque','conductor','empresa','referencia','montador','expositor','hall','stand','tipoCarga','telefono','notas','estado'],
  conductores:['nombre','apellido','empresa','matricula','remolque','hall','telefono','email','tipoVehiculo','pasaporte','pais','fechaNacimiento','idioma','notas'],
  movimientos:['posicion','matricula','remolque','nombre','empresa','hall','status','tipoCarga'],
};

const CAMPO_LABELS = {
  posicion:'🔢 Posición',matricula:'🚛 Matrícula',llamador:'📞 Llamador',ref:'🔖 Ref/Booking',
  empresa:'🏢 Empresa',hall:'🏭 Hall',stand:'📍 Stand',puertaHall:'🚪 Puerta Hall',
  acceso:'🔑 Acceso',montador:'🔧 Montador',expositor:'🎪 Expositor',remolque:'🚚 Remolque',
  tipoVehiculo:'🚗 Tipo Vehículo',descargaTipo:'📦 Descarga',nombre:'👤 Nombre',
  apellido:'👤 Apellido',pasaporte:'🪪 Pasaporte',fechaNacimiento:'🎂 F. Nacimiento',
  fechaExpiracion:'📅 F. Expiración',pais:'🌍 País',telefono:'📱 Teléfono',
  email:'✉️ Email',comentario:'📝 Comentario',horario:'🕐 Horario',
  fecha:'📅 Fecha',hora:'🕐 Hora',conductor:'👤 Conductor',referencia:'🔖 Referencia',
  tipoCarga:'📦 Tipo Carga',notas:'📝 Notas',estado:'🔄 Estado',
  status:'🔄 Status',idioma:'🌐 Idioma',
};

export function renderCamposSubtab(col) {
  if (!canCampos()) return '<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Sin permiso para configurar campos visibles.</div>';
  return _renderCamposSubtab(null, col);
}

function _renderCamposSubtab(el_unused, col) {
  const tabLabel = {ingresos:'Referencia',ingresos2:'Ingresos',agenda:'Agenda',conductores:'Conductores',movimientos:'Embalaje'}[col] || col;
  const campos = ALL_CAMPOS[col] || [];
  if (!DB._camposCfg) DB._camposCfg = {};
  if (!DB._camposCfg[col]) DB._camposCfg[col] = { visible: [...campos], hidden: [], custom: [] };
  const cfg = DB._camposCfg[col];

  let h = `<div style="max-width:600px">
    <div style="font-weight:800;font-size:13px;margin-bottom:8px">⚙ Campos visibles — ${tabLabel}</div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:12px">Activa o desactiva campos. Los cambios aplican a este módulo.</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">`;

  campos.forEach(c => {
    const visible = !cfg.hidden.includes(c);
    const label = CAMPO_LABELS[c] || c;
    h += `<span onclick="window._op.cycleCampo('${col}','${c}')" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:16px;border:1.5px solid ${visible?'var(--blue)':'var(--border)'};background:${visible?'var(--blue)':'var(--bg2)'};color:${visible?'#fff':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer;user-select:none;transition:all .15s">${visible?'✓':'✕'} ${label}</span>`;
  });

  h += `</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-gh btn-sm" onclick="window._op.resetCamposCfg('${col}')">↺ Resetear</button>
      ${isSA()?`<button class="btn btn-p btn-sm" onclick="window._op.addCustomCampo('${col}')">+ Campo personalizado</button>`:''}
    </div>
  </div>`;
  return h;
}

export function cycleCampo(col, campo) {
  if (!DB._camposCfg) DB._camposCfg = {};
  if (!DB._camposCfg[col]) DB._camposCfg[col] = { visible: [...(ALL_CAMPOS[col]||[])], hidden: [], custom: [] };
  const cfg = DB._camposCfg[col];
  const idx = cfg.hidden.indexOf(campo);
  if (idx >= 0) cfg.hidden.splice(idx, 1);
  else cfg.hidden.push(campo);
  saveDB();
  // Re-render the current tab
  const renderMap = {ingresos:'renderIngresos',ingresos2:'renderIngresos2',agenda:'renderAgenda',conductores:'renderConductores',movimientos:'renderFlota'};
  if (renderMap[col]) callFn(renderMap[col]);
}

export function saveCamposCfg(col) { saveDB(); }
export function resetCamposCfg(col) {
  if (!DB._camposCfg) DB._camposCfg = {};
  DB._camposCfg[col] = { visible: [...(ALL_CAMPOS[col]||[])], hidden: [], custom: [] };
  saveDB();
  const renderMap = {ingresos:'renderIngresos',ingresos2:'renderIngresos2',agenda:'renderAgenda',conductores:'renderConductores',movimientos:'renderFlota'};
  if (renderMap[col]) callFn(renderMap[col]);
  import('../utils.js').then(m => m.toast('↺ Campos reseteados', 'var(--blue)'));
}

export function addCustomCampo(col) {
  const name = prompt('Nombre del campo personalizado:');
  if (!name || !name.trim()) return;
  if (!DB._camposCfg) DB._camposCfg = {};
  if (!DB._camposCfg[col]) DB._camposCfg[col] = { visible: [], hidden: [], custom: [] };
  DB._camposCfg[col].custom.push(name.trim());
  saveDB();
  import('../utils.js').then(m => m.toast('✅ Campo añadido: ' + name.trim(), 'var(--green)'));
}

registerFn('renderCamposSubtab', renderCamposSubtab);
registerFn('cycleCampo', cycleCampo);
registerFn('resetCamposCfg', resetCamposCfg);
registerFn('addCustomCampo', addCustomCampo);
window.renderCamposSubtab = renderCamposSubtab;
window._renderCamposSubtab = _renderCamposSubtab;
