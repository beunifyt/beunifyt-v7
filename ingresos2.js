// BeUnifyT v8 — tabs/ingresos2.js — Ingresos con sidebar posicionable
import { DB, iF, registerFn, callFn } from '../core/context.js';
import { esc, fmt, hBadge, telLink, thSort, getSort, sortArr, getRecintoHalls, getTabEvent, debounceSearch } from '../core/shared.js';
import { canEdit, canAdd, canDel, canClean, canExport, canImport, canStatus, canCampos, isSA } from '../auth.js';

// ── sidebar state ──
let _sbPos = 'left';
let _sbCollapsed = false;
let _sbPm = null;

try {
  _sbPos = localStorage.getItem('beu_ing2_sbpos') || 'left';
  _sbCollapsed = localStorage.getItem('beu_ing2_sbcol') === '1';
} catch(e) {}

function _saveSbState() {
  try {
    localStorage.setItem('beu_ing2_sbpos', _sbPos);
    localStorage.setItem('beu_ing2_sbcol', _sbCollapsed ? '1' : '0');
  } catch(e) {}
}

// ── sidebar HTML ──
function _sidebarHTML() {
  const ev = getTabEvent();
  const evName = ev ? esc(ev.nombre || '') : 'Sin evento';
  const items = DB.ingresos2 || [];
  const activos = items.filter(i => !i.salida).length;
  const user = window._op?._currentUser?.() || {};
  const initials = ((user.nombre||'U')[0] + (user.apellido||'')[0]).toUpperCase();

  return `
  <div style="padding:16px 14px 12px;border-bottom:1px solid var(--border)" class="sb-head2">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px" class="sb-logo2">
      <div class="sb-ico2" id="ing2SbIco" title="Posicionar panel">Be</div>
      <div class="sb-brand2">
        <div style="font-size:14px;font-weight:700;color:var(--text);letter-spacing:-.2px">BeUnifyT</div>
        <div style="font-size:10px;color:var(--text3)">Sistema de Control v8</div>
      </div>
    </div>
    <div class="sb-ev2">
      <div class="sb-ev2-tag"><span class="sb-ev2-dot"></span>Evento activo</div>
      <div class="sb-ev2-n">${evName}</div>
    </div>
  </div>
  <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text4);padding:12px 16px 4px" class="sb-sec2">Principal</div>
  <div class="si2" data-tip="Dashboard" onclick="window._op.goTab('dash')">📊<span>Dashboard</span></div>
  <div class="si2 on" data-tip="Ingresos">🚛<span>Ingresos</span><span class="si2-n g">${activos}</span></div>
  <div class="si2" data-tip="Embalaje" onclick="window._op.goTab('flota')">📦<span>Embalaje</span></div>
  <div class="si2" data-tip="Conductores" onclick="window._op.goTab('conductores')">👤<span>Conductores</span></div>
  <div class="si2" data-tip="Agenda" onclick="window._op.goTab('agenda')">📅<span>Agenda</span></div>
  <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text4);padding:12px 16px 4px" class="sb-sec2">Gestión</div>
  <div class="si2" data-tip="Análisis" onclick="window._op.goTab('analytics')">📈<span>Análisis</span></div>
  <div class="si2" data-tip="Mensajes" onclick="window._op.goTab('mensajes')">💬<span>Mensajes</span></div>
  <div style="margin-top:auto;border-top:1px solid var(--border);padding:12px 16px" class="sb-foot2">
    <div style="display:flex;align-items:center;gap:9px;cursor:pointer">
      <div class="av2">${initials}</div>
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--text)">${esc(user.nombre||'Usuario')}</div>
        <div style="font-size:10px;color:var(--text3)">${esc(user.rol||'')}</div>
      </div>
    </div>
  </div>`;
}

// ── set sidebar position (restores flex direction properly) ──
function _setSbPos(pos) {
  _sbPos = pos;
  _saveSbState();
  renderIngresos2();
}

// ── init sidebar interactivity ──
function _initSb() {
  const wrap = document.getElementById('ing2Wrap');
  const sb = document.getElementById('ing2Sb');
  if (!sb || !wrap) return;

  // Collapse toggle
  const tog = sb.querySelector('.sb-toggle2');
  if (tog) {
    tog.innerHTML = _sbCollapsed ? '▶' : '◀';
    tog.onclick = (e) => {
      e.stopPropagation();
      _sbCollapsed = !_sbCollapsed;
      sb.classList.toggle('collapsed', _sbCollapsed);
      tog.innerHTML = _sbCollapsed ? '▶' : '◀';
      _saveSbState();
    };
  }
  if (_sbCollapsed) sb.classList.add('collapsed');

  // Resize handle (only for left/right)
  const rh = sb.querySelector('.sb-resize2');
  if (rh && (_sbPos === 'left' || _sbPos === 'right')) {
    let isRes = false, rx0, rw0;
    rh.onmousedown = (e) => {
      if (_sbCollapsed) return;
      isRes = true; rx0 = e.clientX; rw0 = sb.offsetWidth;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    };
    const _mm = (e) => { if (!isRes) return; sb.style.width = Math.max(52, Math.min(400, rw0 + e.clientX - rx0)) + 'px'; };
    const _mu = () => { isRes = false; document.body.style.userSelect = ''; document.body.style.cursor = ''; };
    document.addEventListener('mousemove', _mm);
    document.addEventListener('mouseup', _mu);
  }

  // Position menu on icon click
  const ico = document.getElementById('ing2SbIco');
  if (ico) {
    ico.onclick = (e) => {
      e.stopPropagation();
      if (_sbPm) { _sbPm.remove(); _sbPm = null; return; }
      _sbPm = document.createElement('div');
      _sbPm.className = 'pos-menu2';
      const rect = ico.getBoundingClientRect();
      _sbPm.style.cssText = `position:fixed;z-index:9999;left:${rect.right + 8}px;top:${rect.top}px`;
      [{ico:'⬅',l:'Izquierda',p:'left'},{ico:'➡',l:'Derecha',p:'right'},{ico:'⬆',l:'Arriba',p:'top'},{ico:'⬇',l:'Abajo',p:'bottom'}]
      .forEach(o => {
        const b = document.createElement('button');
        b.className = 'pos-btn2';
        b.innerHTML = `<span>${o.ico}</span><span>${o.l}</span>`;
        if (o.p === _sbPos) b.style.cssText += 'color:var(--blue);font-weight:700;background:var(--bll)';
        b.onclick = () => { _sbPm.remove(); _sbPm = null; _setSbPos(o.p); };
        _sbPm.appendChild(b);
      });
      document.body.appendChild(_sbPm);
      setTimeout(() => {
        const h = () => { if (_sbPm) { _sbPm.remove(); _sbPm = null; } document.removeEventListener('click', h); };
        document.addEventListener('click', h);
      }, 50);
    };
  }

  // Tooltips for collapsed
  sb.querySelectorAll('.si2').forEach(el => {
    const sp = el.querySelector('span');
    if (sp) el.setAttribute('data-tip', sp.textContent.trim());
  });
}

// ── Build layout: sidebar + main, respecting position ──
function _buildLayout(contentHTML) {
  const isVert = (_sbPos === 'top' || _sbPos === 'bottom');
  const dirClass = isVert ? ' dir-col' : '';
  const posClass = (_sbPos !== 'left') ? ` sb-${_sbPos}` : '';
  const sbHTML = `<nav class="ing2-sb${posClass}" id="ing2Sb">
    <div class="sb-toggle2"></div>
    ${!isVert ? '<div class="sb-resize2"></div>' : ''}
    ${_sidebarHTML()}
  </nav>`;
  const mainHTML = `<div class="ing2-main">${contentHTML}</div>`;

  if (_sbPos === 'right' || _sbPos === 'bottom') {
    return `<div class="ing2-wrap${dirClass}" id="ing2Wrap">${mainHTML}${sbHTML}</div>`;
  }
  return `<div class="ing2-wrap${dirClass}" id="ing2Wrap">${sbHTML}${mainHTML}</div>`;
}

// ── Main render ──
export function renderIngresos2() {
  const today = new Date().toISOString().slice(0, 10);
  let items = [...DB.ingresos2 || []];
  const aEvIds = (DB.activeEventIds && DB.activeEventIds.length) ? DB.activeEventIds : (DB.activeEventId ? [DB.activeEventId] : []);
  if (aEvIds.length) items = items.filter(i => !i.eventoId || aEvIds.includes(i.eventoId));
  const q = (iF.q2 || '').toLowerCase();
  if (q) items = items.filter(i => `${i.pos || ''} ${i.matricula} ${i.nombre || ''} ${i.apellido || ''} ${i.empresa || ''} ${i.llamador || ''} ${i.referencia || ''} ${(i.halls || [i.hall || '']).join(' ')} ${i.stand || ''} ${i.remolque || ''} ${i.comentario || ''} ${i.telefono || ''} ${i.eventoNombre || ''}`.toLowerCase().includes(q));
  if (iF.hall2) items = items.filter(i => (i.halls || [i.hall || '']).includes(iF.hall2));
  if (iF.activos2) items = items.filter(i => !i.salida);
  const s = getSort('ingresos2'); items = sortArr(items, s.col || 'pos', s.dir || 'desc');
  const sub2 = iF._sub2 || 'lista';
  const halls = getRecintoHalls ? getRecintoHalls() : [];

  const contentHTML = `
    <div class="ing2-topbar">
      <div style="font-size:22px;font-weight:700;color:var(--text);letter-spacing:-.4px">Ingresos</div>
      <span style="font-size:11px;color:var(--text4)">${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short',year:'numeric'})}</span>
      <span style="flex:1"></span>
      ${canAdd() && sub2 !== 'campos' ? `<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="_ingSource='ingresos2';openIngModal()">+ Ingreso</button>` : ''}
    </div>
    <div class="ing2-card">
      <div class="ing2-stabs">
        ${[['lista', '📋 Lista'], ['listanegra', '⭐ Especial'], ['historial', '📝 Modif.'], ...(canCampos() ? [['campos', '⚙ Campos']] : [])]
          .map(([s, l]) => `<button class="ing2-stab${sub2 === s ? ' on' : ''}" onclick="iF['_sub2']='${s}';renderIngresos2()">${l}</button>`).join('')}
        <span style="flex:1"></span>
        <div style="display:flex;gap:4px;flex-shrink:0;align-items:center;flex-wrap:wrap">
          ${sub2 !== 'historial' && sub2 !== 'campos' && canExport() ? `<button class="btn btn-gh btn-xs" onclick="exportIngresos2()">⬇ Excel</button>` : ''}
          ${sub2 !== 'historial' && sub2 !== 'campos' && canClean() ? `<button class="btn btn-xs" style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca" onclick="cleanTab('ingresos2')">🗑 Limpiar</button>` : ''}
        </div>
      </div>
      ${sub2 !== 'historial' && sub2 !== 'campos' ? `
      <div class="ing2-fbar">
        <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, nombre..." value="${iF.q2 || ''}" oninput="iF.q2=this.value;debounceSearch('ingresos2',renderIngresos2)"></div>
        <span class="pill" style="border:1.5px solid ${iF.activos2 ? 'var(--blue)' : 'var(--border)'};background:${iF.activos2 ? 'var(--blue)' : 'var(--bg2)'};color:${iF.activos2 ? '#fff' : 'var(--text3)'};cursor:pointer" onclick="iF.activos2=!iF.activos2;renderIngresos2()">Solo activos</span>
        <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
      </div>
      ${halls.length ? `<div class="ing2-halls">
        <span class="ing2-hp${!iF.hall2 ? ' on' : ''}" onclick="iF.hall2='';renderIngresos2()">Todos</span>
        ${halls.map(h => `<span class="ing2-hp${iF.hall2 === h ? ' on' : ''}" onclick="iF.hall2='${h}';renderIngresos2()">${h}</span>`).join('')}
      </div>` : ''}` : ''}
      <div class="ing2-body">
      ${sub2 === 'lista' ? `${items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr>
        ${thSort('ingresos2', 'pos', '#')}${thSort('ingresos2', 'matricula', 'Matrícula')}${thSort('ingresos2', 'nombre', 'Conductor/Empresa')}${thSort('ingresos2', 'telefono', 'Tel.')}<th>Hall</th>${thSort('ingresos2', 'salida', 'Estado')}${thSort('ingresos2', 'entrada', 'Entrada')}<th>Acc.</th>
      </tr></thead><tbody>
        ${items.map(i => `<tr>
          <td style="font-weight:700;color:var(--text3)">${i.pos || ''}</td>
          <td><span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}','ingresos2')">${i.matricula}</span></td>
          <td><b style="font-size:12px">${i.nombre || ''} ${i.apellido || ''}</b>${i.empresa ? `<br><span style="font-size:11px;color:var(--text3)">${i.empresa}</span>` : ''}</td>
          <td>${telLink(i.telPais || '', i.telefono || '')}</td>
          <td>${(i.halls || [i.hall || '']).filter(Boolean).map(h => hBadge(h)).join(' ') || '–'}</td>
          <td>${!i.salida ? '<span class="pill pill-g">✓ En recinto</span>' : `<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida, 't')}</span>`}</td>
          <td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>
          <td><div style="display:flex;gap:2px;flex-wrap:wrap">
            <button class="btn btn-gh btn-xs" onclick="printIngreso2('${i.id}')">🖨</button>
            ${canEdit() ? `<button class="btn btn-edit btn-xs" onclick="openIngModal2(DB.ingresos2.find(x=>x.id==='${i.id}'))">✏️</button>` : ''}
            ${!i.salida && canStatus() ? `<button class="btn btn-warning btn-xs" onclick="marcarSalidaIng2('${i.id}')">↩ Salida</button>` : ''}
            ${i.salida && canStatus() ? `<button class="btn btn-success btn-xs" onclick="reactivarIngreso2('${i.id}')">↺</button>` : ''}
            ${canDel() ? `<button class="btn btn-danger btn-xs" onclick="askDelIng2('${i.id}')">🗑</button>` : ''}
          </div></td>
        </tr>`).join('')}
      </tbody></table></div>` : `<div class="empty"><div class="ei">🚛</div><div class="et">Sin ingresos registrados</div></div>`}` : ''}
      ${sub2 !== 'lista' ? (sub2 === 'listanegra' ? callFn('_ingLN') : sub2 === 'historial' ? callFn('_ingHistorial', 'ingresos2') : sub2 === 'campos' ? callFn('renderCamposSubtab', 'ingresos2') : '') : ''}
      </div>
    </div>`;

  const tc = document.getElementById('tabContent');
  if (tc) {
    tc.style.padding = '0';
    tc.style.maxWidth = 'none';
    tc.innerHTML = _buildLayout(contentHTML);
    _initSb();
  }
}

registerFn('renderIngresos2', renderIngresos2);
window.renderIngresos2 = renderIngresos2;
