// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — mensajes.js
// Módulo de mensajes de rampa. Usado por operator.js renderMensajes().
// Incluye: crear, pausar/reactivar, marcar leído, limpiar, exportar,
//          auto-expiración de mensajes, notificación visual en header.
// ═══════════════════════════════════════════════════════════════════════
import { AppState }    from '../state.js';
import { toast, uid, safeHtml, formatDate, nowLocal } from '../utils.js';
import { fsSet, fsDel, fsGetAll } from '../firestore.js';

const esc = safeHtml;
const fmt = formatDate;

// ─── STATE ────────────────────────────────────────────────────────────
let _db       = null;   // reference to operator DB passed in
let _sid      = null;   // session ID for read tracking
let _canEdit  = false;
let _isSA     = false;
let _containerId = null;

// Tipo → visual config
const TIPO_CFG = {
  urgente: { ico:'🔴', bg:'var(--rll)', color:'var(--red)',  border:'#fecaca', label:'Urgente'  },
  alerta:  { ico:'⚠️', bg:'var(--all)', color:'var(--amber)',border:'#fde68a', label:'Alerta'   },
  ok:      { ico:'✅', bg:'var(--gll)', color:'var(--green)',border:'#bbf7d0', label:'OK'        },
  info:    { ico:'ℹ️', bg:'var(--bll)', color:'var(--blue)', border:'#bfdbfe', label:'Info'     },
};
function _tipoCfg(tipo) { return TIPO_CFG[tipo] || TIPO_CFG.info; }

// ─── PUBLIC INIT ──────────────────────────────────────────────────────
/**
 * Called by operator.js renderMensajes().
 * @param {string} containerId — div to render into
 * @param {object} db          — operator DB reference
 * @param {string} sid         — session instance ID
 * @param {Function} canEditFn — permission check
 * @param {Function} isSAFn    — SA check
 */
export function initMensajes(containerId, db, sid, canEditFn, isSAFn) {
  _containerId = containerId;
  _db          = db;
  _sid         = sid;
  _canEdit     = typeof canEditFn === 'function' ? canEditFn() : !!canEditFn;
  _isSA        = typeof isSAFn   === 'function' ? isSAFn()   : !!isSAFn;
  _autoExpire();
  _render();
  // Expose API for inline handlers
  window._msgs = _api;
}

// ─── AUTO EXPIRE ─────────────────────────────────────────────────────
function _autoExpire() {
  const now = Date.now();
  let changed = false;
  (_db.mensajesRampa || []).forEach(m => {
    if (!m.pausado && m.expiraTs && now > m.expiraTs) {
      m.pausado = true; changed = true;
    }
    // Mark as read for this session
    if (!m.leido) m.leido = [];
    if (!m.leido.includes(_sid)) { m.leido.push(_sid); changed = true; }
  });
  if (changed) _saveAll();
}

// ─── RENDER ───────────────────────────────────────────────────────────
function _render() {
  const el = document.getElementById(_containerId); if (!el) return;
  const now = Date.now();
  const msgs = [...(_db.mensajesRampa || [])].sort((a,b) => (b.ts||'').localeCompare(a.ts||'')).slice(0, 100);
  const unread = msgs.filter(m => !(m.leido||[]).includes(_sid) && !m.pausado && (!m.expiraTs||now<m.expiraTs)).length;

  let h = `
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">
  <div style="font-size:14px;font-weight:800">📢 Mensajes de Rampa (${msgs.length})</div>
  ${unread ? `<span style="background:var(--red);color:#fff;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700">${unread} sin leer</span>` : ''}
  <span style="flex:1"></span>
  ${_canEdit ? '<button class="btn btn-p btn-sm" onclick="window._msgs.openNew()">📢 Nuevo</button>' : ''}
  <button class="btn btn-gh btn-sm" onclick="window._msgs.marcarTodos()">✓ Todos leídos</button>
  ${_isSA && msgs.length ? '<button class="btn btn-danger btn-sm" onclick="window._msgs.limpiarTodos()">🗑 Limpiar</button>' : ''}
  <button class="btn btn-gh btn-sm" onclick="window._msgs.exportar()">⬇ Excel</button>
</div>
<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:5px 10px;margin-bottom:10px;font-size:11px;color:var(--text3)">
  🔗 Los mensajes son visibles en tiempo real para todos los operadores conectados
</div>`;

  if (!msgs.length) {
    h += '<div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;color:var(--text3)"><div style="font-size:48px;margin-bottom:8px">📢</div><div style="font-size:16px;font-weight:700">Sin mensajes</div><div style="font-size:12px;margin-top:4px">Los mensajes de rampa aparecerán aquí</div></div>';
  } else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    msgs.forEach(m => {
      const isExpired = m.expiraTs && now > m.expiraTs;
      const isUnread  = !(m.leido||[]).includes(_sid) && !m.pausado && !isExpired;
      const cfg       = _tipoCfg(m.tipo);
      const opacity   = m.pausado || isExpired ? 'opacity:.5;' : '';
      h += `
<div style="padding:12px 16px;border-radius:var(--r2);border:1.5px solid ${cfg.border};background:${cfg.bg};${opacity}${isUnread?'border-left:4px solid '+cfg.color+';':''}position:relative">
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">
    <span style="font-size:16px;line-height:1">${cfg.ico}</span>
    <span style="font-weight:800;font-size:13px;color:var(--text)">${esc(m.titulo||'Sin título')}</span>
    <span style="padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;background:${cfg.color};color:#fff">${cfg.label}</span>
    ${m.matricula ? `<span style="background:#1e293b;color:#f1f5f9;border-radius:5px;padding:1px 6px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${esc(m.matricula)}</span>` : ''}
    ${m.pausado ? '<span style="font-size:11px;color:var(--text3)">⏸ Pausado</span>' : ''}
    ${isExpired ? '<span style="font-size:11px;color:var(--text3)">⏰ Expirado</span>' : ''}
    ${m.expiraTs && !isExpired ? `<span style="font-size:10px;color:var(--text3)">⏱ Expira: ${fmt(new Date(m.expiraTs).toISOString())}</span>` : ''}
    <span style="margin-left:auto;font-size:10px;color:var(--text3);white-space:nowrap">${fmt(m.ts)}</span>
  </div>
  <div style="font-size:13px;color:var(--text2);line-height:1.5">${esc(m.mensaje||'')}</div>
  <div style="display:flex;align-items:center;gap:4px;margin-top:8px">
    <span style="font-size:10px;color:var(--text3)">Por: ${esc(m.autor||'–')}</span>
    ${m.leido?.length > 1 ? `<span style="font-size:10px;color:var(--text3)"> · ${m.leido.length} leído(s)</span>` : ''}
    <span style="flex:1"></span>
    <button class="btn btn-xs btn-gh" onclick="window._msgs.togglePausa('${m.id}')" title="${m.pausado?'Reactivar':'Pausar'}">
      ${m.pausado ? '▶ Reactivar' : '⏸ Pausar'}
    </button>
    ${_canEdit ? `<button class="btn btn-xs btn-gh" onclick="window._msgs.editMsg('${m.id}')">✏️</button>` : ''}
    ${_isSA ? `<button class="btn btn-danger btn-xs" onclick="window._msgs.eliminar('${m.id}')">🗑</button>` : ''}
  </div>
</div>`;
    });
    h += '</div>';
  }

  el.innerHTML = h;
}

// ─── SAVE HELPERS ────────────────────────────────────────────────────
async function _saveOne(msg) {
  const ev = AppState.get('currentEvent');
  if (ev?.id) await fsSet(`events/${ev.id}/mensajes/${msg.id}`, msg, false);
}

async function _deleteOne(id) {
  const ev = AppState.get('currentEvent');
  if (ev?.id) await fsDel(`events/${ev.id}/mensajes/${id}`);
}

function _saveAll() {
  // Persist all messages (batch would be ideal but keep it simple)
  (_db.mensajesRampa || []).forEach(m => _saveOne(m).catch(() => {}));
}

// ─── ACTIONS ─────────────────────────────────────────────────────────
function _openModal(title, bodyHtml, onSave) {
  const id = 'msgsModal';
  document.getElementById(id)?.remove();
  const bg = document.createElement('div');
  bg.id = id;
  bg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px';
  bg.innerHTML = `
<div style="background:var(--bg2,#fff);border-radius:10px;padding:20px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.15)">
  <div style="display:flex;align-items:center;margin-bottom:16px">
    <div style="font-size:16px;font-weight:800;flex:1">${title}</div>
    <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3,#6b7280)" onclick="document.getElementById('${id}').remove()">✕</button>
  </div>
  ${bodyHtml}
  <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
    <button style="padding:6px 16px;border-radius:20px;border:1px solid var(--border,#e4e7f1);background:var(--bg2,#fff);font-weight:600;cursor:pointer" onclick="document.getElementById('${id}').remove()">Cancelar</button>
    <button style="padding:6px 16px;border-radius:20px;border:none;background:#2563eb;color:#fff;font-weight:600;cursor:pointer" id="msgsModalSave">Guardar</button>
  </div>
</div>`;
  document.body.appendChild(bg);
  document.getElementById('msgsModalSave').onclick = () => { onSave(); document.getElementById(id)?.remove(); };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  setTimeout(() => bg.querySelector('input,select,textarea')?.focus(), 80);
}

function _gv(id) { return (document.getElementById(id)?.value || '').trim(); }

const _api = {
  openNew() {
    _openModal('📢 Nuevo mensaje de rampa', `
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Tipo</label>
        <select id="msTipo" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px">
          <option value="info">ℹ️ Info</option>
          <option value="alerta">⚠️ Alerta</option>
          <option value="urgente">🔴 Urgente</option>
          <option value="ok">✅ OK</option>
        </select>
      </div>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Título <span style="color:var(--red,#e02424)">*</span></label>
        <input id="msTitulo" placeholder="Ej: Acceso puerta 3 cerrado" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px">
      </div>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Matrícula (opcional)</label>
        <input id="msMat" placeholder="AB1234CD" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px;text-transform:uppercase">
      </div>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Mensaje <span style="color:var(--red,#e02424)">*</span></label>
        <textarea id="msTexto" rows="3" placeholder="Describe la situación..." style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px;resize:vertical"></textarea>
      </div>
      <div style="margin-bottom:4px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Expira en (horas, 0 = sin expiración)</label>
        <input id="msExpira" type="number" min="0" max="72" value="0" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px">
      </div>
    `, async () => {
      const titulo = _gv('msTitulo'); const texto = _gv('msTexto');
      if (!titulo || !texto) { toast('Título y mensaje son obligatorios', 'var(--red,#e02424)'); return; }
      const user = AppState.get('currentUser');
      const horas = parseFloat(_gv('msExpira')) || 0;
      const msg = {
        id: uid(), tipo: _gv('msTipo'), titulo, mensaje: texto,
        matricula: (_gv('msMat')).toUpperCase(),
        ts: nowLocal(), autor: user?.nombre || '?',
        leido: [_sid], pausado: false,
        expiraTs: horas > 0 ? Date.now() + horas * 3600000 : null,
      };
      if (!_db.mensajesRampa) _db.mensajesRampa = [];
      _db.mensajesRampa.unshift(msg);
      if (_db.mensajesRampa.length > 200) _db.mensajesRampa = _db.mensajesRampa.slice(0, 200);
      await _saveOne(msg);
      toast('📢 Mensaje enviado', 'var(--blue,#1a56db)');
      _render();
    });
  },

  editMsg(id) {
    const m = (_db.mensajesRampa||[]).find(x => x.id === id); if (!m) return;
    _openModal('✏️ Editar mensaje', `
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Tipo</label>
        <select id="msTipo" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px">
          ${['info','alerta','urgente','ok'].map(t => `<option value="${t}" ${m.tipo===t?'selected':''}>${_tipoCfg(t).ico} ${_tipoCfg(t).label}</option>`).join('')}
        </select>
      </div>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Título</label>
        <input id="msTitulo" value="${esc(m.titulo||'')}" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px">
      </div>
      <div style="margin-bottom:10px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Matrícula</label>
        <input id="msMat" value="${esc(m.matricula||'')}" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px;text-transform:uppercase">
      </div>
      <div style="margin-bottom:4px">
        <label style="display:block;font-size:11px;font-weight:700;color:var(--text3,#6b7280);margin-bottom:3px;text-transform:uppercase">Mensaje</label>
        <textarea id="msTexto" rows="3" style="width:100%;padding:6px 10px;border:1.5px solid var(--border2,#c8cdd9);border-radius:6px;background:var(--bg2,#fff);font-size:13px;resize:vertical">${esc(m.mensaje||'')}</textarea>
      </div>
    `, async () => {
      m.tipo     = _gv('msTipo');
      m.titulo   = _gv('msTitulo');
      m.matricula= _gv('msMat').toUpperCase();
      m.mensaje  = _gv('msTexto');
      await _saveOne(m);
      toast('✅ Mensaje actualizado', 'var(--green,#0d9f6e)');
      _render();
    });
  },

  async togglePausa(id) {
    const m = (_db.mensajesRampa||[]).find(x => x.id === id); if (!m) return;
    m.pausado = !m.pausado;
    await _saveOne(m);
    _render();
    toast(m.pausado ? '⏸ Pausado' : '▶ Reactivado', 'var(--blue,#1a56db)');
  },

  async eliminar(id) {
    if (!confirm('¿Eliminar mensaje?')) return;
    _db.mensajesRampa = (_db.mensajesRampa||[]).filter(x => x.id !== id);
    await _deleteOne(id);
    toast('🗑 Eliminado', 'var(--red,#e02424)');
    _render();
  },

  async marcarTodos() {
    (_db.mensajesRampa||[]).forEach(m => {
      if (!m.leido) m.leido = [];
      if (!m.leido.includes(_sid)) m.leido.push(_sid);
    });
    _saveAll();
    _render();
    toast('✓ Todos marcados como leídos', 'var(--green,#0d9f6e)');
  },

  async limpiarTodos() {
    if (!confirm(`¿Eliminar todos los mensajes (${(_db.mensajesRampa||[]).length})?`)) return;
    const ev = AppState.get('currentEvent');
    if (ev?.id) {
      const all = await fsGetAll(`events/${ev.id}/mensajes`);
      for (const m of all) await fsDel(`events/${ev.id}/mensajes/${m.id}`);
    }
    _db.mensajesRampa = [];
    toast('💥 Mensajes eliminados', 'var(--red,#e02424)');
    _render();
  },

  exportar() {
    if (typeof XLSX === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = () => _api.exportar(); document.head.appendChild(s); return;
    }
    const data = (_db.mensajesRampa||[]).map(m => ({
      Fecha: m.ts||'', Tipo: m.tipo||'', Titulo: m.titulo||'',
      Mensaje: m.mensaje||'', Matricula: m.matricula||'',
      Autor: m.autor||'', Pausado: m.pausado?'Sí':'No',
    }));
    if (!data.length) { toast('Sin mensajes para exportar', 'var(--amber,#c47b10)'); return; }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Mensajes');
    const fn = `mensajes_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fn);
    toast(`📥 Exportado: ${fn}`, 'var(--blue,#1a56db)');
  },
};

// ─── AUTO MESSAGE (called by operator for system alerts) ──────────────
export function autoMsg(tipo, titulo, mensaje, mat = '', db, sid, horasExpira = null) {
  if (!db) return;
  if (!db.mensajesRampa) db.mensajesRampa = [];
  const user = AppState.get('currentUser');
  const msg = {
    id: uid(), tipo, titulo, mensaje, matricula: mat,
    ts: nowLocal(), autor: user?.nombre || 'Sistema',
    leido: [sid||''], pausado: false,
    expiraTs: horasExpira ? Date.now() + horasExpira * 3600000 : null,
  };
  db.mensajesRampa.unshift(msg);
  if (db.mensajesRampa.length > 200) db.mensajesRampa = db.mensajesRampa.slice(0, 200);
  const ev = AppState.get('currentEvent');
  if (ev?.id) fsSet(`events/${ev.id}/mensajes/${msg.id}`, msg, false).catch(() => {});
}

/** Count unread messages for header badge */
export function countUnread(mensajesRampa, sid) {
  const now = Date.now();
  return (mensajesRampa||[]).filter(m =>
    !(m.leido||[]).includes(sid) && !m.pausado && (!m.expiraTs || now < m.expiraTs)
  ).length;
}
