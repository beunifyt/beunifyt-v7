// ═══════════════════════════════════════
// impresion.js — CANVA PRO FINAL
// ═══════════════════════════════════════

let _placed = {};
let _selected = null;
let _scale = 1;
let _history = [];
let _redo = [];
let _lang = "es";

const I18N = {
  es: { print:"Imprimir", preview:"Preview", fields:"Campos", config:"Config", templates:"Plantillas", qr:"QR" },
  en: { print:"Print", preview:"Preview", fields:"Fields", config:"Config", templates:"Templates", qr:"QR" }
};

export function renderImpresion(el){
  window._imp = api;

  el.innerHTML = `
  <div class="app">

    <div class="sidebar">
      <div class="menu active">${t("fields")}</div>
      <div class="menu">${t("config")}</div>
      <div class="menu">${t("qr")}</div>
      <div class="menu">${t("templates")}</div>

      <div class="fields">
        ${["nombre","empresa","telefono","matricula"].map(f=>`
          <div class="field" draggable="true" data-key="${f}">${f}</div>
        `).join("")}
      </div>
    </div>

    <div class="main">

      <div class="toolbar">
        <div class="group">
          <button onclick="_imp.resize(1)">A+</button>
          <button onclick="_imp.resize(-1)">A-</button>
        </div>

        <div class="group">
          <button onclick="_imp.bold()">B</button>
          <button onclick="_imp.italic()">I</button>
        </div>

        <div class="group">
          <button onclick="_imp.align('left')">⬅</button>
          <button onclick="_imp.align('center')">⬌</button>
          <button onclick="_imp.align('right')">➡</button>
        </div>

        <div class="spacer"></div>

        <button onclick="_imp.undo()">↩</button>
        <button onclick="_imp.redo()">↪</button>

        <button onclick="_imp.zoom(-0.1)">➖</button>
        <button onclick="_imp.zoom(0.1)">➕</button>

        <button onclick="_imp.preview()">${t("preview")}</button>
        <button class="print" onclick="_imp.print()">${t("print")}</button>
      </div>

      <div class="canvas-wrap">
        <div id="canvas" class="canvas"></div>
      </div>

    </div>
  </div>
  `;

  init();
}

function init(){
  const canvas = document.getElementById("canvas");

  document.querySelectorAll(".field").forEach(el=>{
    el.addEventListener("dragstart", e=>{
      e.dataTransfer.setData("key", el.dataset.key);
    });
  });

  canvas.addEventListener("dragover", e=>e.preventDefault());

  canvas.addEventListener("drop", e=>{
    e.preventDefault();
    saveHistory();

    const key = e.dataTransfer.getData("key");
    const rect = canvas.getBoundingClientRect();

    _placed[key + Date.now()] = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      text: key,
      size: 14,
      bold:false,
      italic:false
    };

    renderCanvas();
  });

  canvas.addEventListener("wheel", e=>{
    e.preventDefault();
    _scale += e.deltaY > 0 ? -0.05 : 0.05;
    _scale = Math.max(0.5, Math.min(2, _scale));
    renderCanvas();
  });

  renderCanvas();
}

function renderCanvas(){
  const canvas = document.getElementById("canvas");
  canvas.style.transform = `scale(${_scale})`;

  canvas.innerHTML = `
    <div class="paper">
      ${Object.entries(_placed).map(([k,v])=>`
        <div class="chip ${_selected===k?'selected':''}"
          style="
            left:${v.x}px;
            top:${v.y}px;
            font-size:${v.size}px;
            font-weight:${v.bold?'bold':'normal'};
            font-style:${v.italic?'italic':'normal'};
          "
          data-key="${k}">
          ${v.text}
        </div>
      `).join("")}
    </div>
  `;

  attachEvents();
}

function attachEvents(){
  document.querySelectorAll(".chip").forEach(el=>{
    const key = el.dataset.key;

    el.addEventListener("mousedown", e=>{
      _selected = key;
      saveHistory();

      let startX = e.clientX;
      let startY = e.clientY;
      let start = {..._placed[key]};

      function move(ev){
        _placed[key].x = start.x + (ev.clientX - startX);
        _placed[key].y = start.y + (ev.clientY - startY);
        renderCanvas();
      }

      function up(){
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      }

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);

      renderCanvas();
    });
  });
}

const api = {

  resize(v){
    if(!_selected) return;
    saveHistory();
    _placed[_selected].size += v;
    renderCanvas();
  },

  bold(){
    if(!_selected) return;
    saveHistory();
    _placed[_selected].bold = !_placed[_selected].bold;
    renderCanvas();
  },

  italic(){
    if(!_selected) return;
    saveHistory();
    _placed[_selected].italic = !_placed[_selected].italic;
    renderCanvas();
  },

  align(a){
    console.log("align",a);
  },

  zoom(v){
    _scale += v;
    renderCanvas();
  },

  undo(){
    if(!_history.length) return;
    _redo.push(JSON.stringify(_placed));
    _placed = JSON.parse(_history.pop());
    renderCanvas();
  },

  redo(){
    if(!_redo.length) return;
    _history.push(JSON.stringify(_placed));
    _placed = JSON.parse(_redo.pop());
    renderCanvas();
  },

  preview(){
    alert("Preview");
  },

  print(){
    window.print();
  },

  saveTemplate(){
    localStorage.setItem("imp_template", JSON.stringify(_placed));
  },

  loadTemplate(){
    _placed = JSON.parse(localStorage.getItem("imp_template")||"{}");
    renderCanvas();
  }
};

function saveHistory(){
  _history.push(JSON.stringify(_placed));
  _redo = [];
}

function t(k){
  return I18N[_lang][k] || k;
}

const style = document.createElement("style");
style.innerHTML = `
.app{display:flex;height:100vh;font-family:sans-serif}
.sidebar{width:240px;background:#0f172a;color:#fff;padding:10px}
.menu{padding:8px;margin-bottom:5px;border-radius:6px}
.menu.active{background:#7c3aed}
.field{background:#1e293b;margin-bottom:4px;padding:6px;border-radius:4px;cursor:grab}
.main{flex:1;display:flex;flex-direction:column}
.toolbar{display:flex;gap:6px;padding:10px;border-bottom:1px solid #ddd}
.group{display:flex;gap:4px}
.spacer{flex:1}
.print{background:#7c3aed;color:#fff;border:none;padding:6px 14px;border-radius:20px}
.canvas-wrap{flex:1;display:flex;justify-content:center;align-items:center;background:#f1f5f9}
.paper{width:400px;height:560px;background:#fff;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.chip{position:absolute;background:#eef2ff;padding:4px 8px;border-radius:6px;cursor:move}
.chip.selected{outline:2px solid #7c3aed}
`;
document.head.appendChild(style);

// ── render() for operator.js v8 ──
export function render(container, usuario) { renderImpresion(container); }
