// ═══════════════════════════════════════
// impresion.js — UX LAB integrado con tu lógica
// ═══════════════════════════════════════

import { AppState } from './state.js';
import { getDB } from './firestore.js';
import { toast } from './utils.js';

// ───────────────────────────────────────
// 🔁 ESTADO ORIGINAL RESPETADO
// ───────────────────────────────────────
let _placed = {};
let _selKey = null;
let _scale = 1;

// 🧪 Layout activo
let _layout = "layout1";

// ───────────────────────────────────────
// 🚀 ENTRY POINT
// ───────────────────────────────────────
export function renderImpresion(el) {
  window._imp = api;

  el.innerHTML = `
    <div style="padding:10px;border-bottom:1px solid #ccc">
      <b>🧪 UX LAB:</b>
      ${[...Array(10)].map((_,i)=>`
        <button onclick="_imp.setLayout('layout${i+1}')">${i+1}</button>
      `).join("")}
    </div>

    <div id="impRoot"></div>
  `;

  render();
}

// ───────────────────────────────────────
// 🧠 RENDER
// ───────────────────────────────────────
function render() {
  const root = document.getElementById("impRoot");
  root.innerHTML = getLayoutHTML(_layout);

  renderCanvas();
}

// ───────────────────────────────────────
// 🎨 LAYOUTS (10 COMPETIDORES)
// ───────────────────────────────────────
function getLayoutHTML(l) {

  const sidebar = `
    <div class="sidebar">
      <div class="section">📄 Campos</div>
      <div class="section">⚙️ Config</div>
      <div class="section">💬 Frases</div>
      <div class="section">🖼 Imagen</div>
      <div class="section">💾 Plantillas</div>
    </div>
  `;

  const toolbar = `
    <div class="toolbar">
      <button onclick="_imp.resize(1)">A+</button>
      <button onclick="_imp.resize(-1)">A-</button>
      <button onclick="_imp.bold()">B</button>
      <button onclick="_imp.italic()">I</button>
      <button onclick="_imp.print()" class="primary">🖨</button>
    </div>
  `;

  const canvas = `<div id="canvas"></div>`;

  switch(l){

    case "layout1": return `<div class="grid">${sidebar}<div>${toolbar}${canvas}</div></div>`;
    case "layout2": return `<div>${toolbar}${canvas}</div>`;
    case "layout3": return `<div class="grid"><div class="sidebar tabs">📄 ⚙️ 💬</div><div>${toolbar}${canvas}</div></div>`;
    case "layout4": return `<div><div class="topnav">📄 ⚙️ 💬</div>${toolbar}${canvas}</div>`;
    case "layout5": return `<div>${canvas}<div class="floating">${toolbar}</div></div>`;
    case "layout6": return `<div class="split">${sidebar}${canvas}${toolbar}</div>`;
    case "layout7": return `<div class="focus">${canvas}<button class="primary big">🖨</button></div>`;
    case "layout8": return `<div class="wizard">Paso 1 → 2 → 3 ${canvas}</div>`;
    case "layout9": return `<div class="grid compact">${sidebar}<div>${toolbar}${canvas}</div></div>`;
    case "layout10": return `<div class="dashboard">${sidebar}${canvas}<div>${toolbar}</div></div>`;
  }
}

// ───────────────────────────────────────
// 🧩 CANVAS REAL (SIMPLIFICADO)
// ───────────────────────────────────────
function renderCanvas() {
  const el = document.getElementById("canvas");
  if (!el) return;

  el.innerHTML = `
    <div class="paper">
      ${Object.keys(_placed).map(k=>`
        <div class="chip">${k}</div>
      `).join("")}
    </div>
  `;
}

// ───────────────────────────────────────
// ⚙️ API (usa tu lógica real luego)
// ───────────────────────────────────────
const api = {
  setLayout(l){ _layout = l; render(); },

  resize(v){ console.log("resize", v); },
  bold(){ console.log("bold"); },
  italic(){ console.log("italic"); },

  print(){
    toast?.("Imprimir...");
    console.log("PRINT con datos reales aquí");
  }
};

// ───────────────────────────────────────
// 🎨 CSS PRO
// ───────────────────────────────────────
const style = document.createElement("style");
style.innerHTML = `
.grid{display:grid;grid-template-columns:240px 1fr}
.sidebar{background:#0f172a;color:#fff;padding:10px}
.section{background:#1e293b;margin-bottom:6px;padding:8px;border-radius:6px}
.toolbar{display:flex;gap:6px;padding:10px}
.primary{background:#7c3aed;color:#fff;border:none;padding:6px 12px;border-radius:6px}
.paper{width:300px;height:420px;background:#fff;margin:20px auto;box-shadow:0 10px 30px rgba(0,0,0,.2)}
.chip{padding:4px 8px;background:#eee;margin:4px;border-radius:4px}
.floating{position:fixed;bottom:20px;left:50%;transform:translateX(-50%)}
.dashboard{display:grid;grid-template-columns:200px 1fr 200px}
`;
document.head.appendChild(style);
