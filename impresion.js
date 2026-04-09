// ═══════════════════════════════════════
// impresion_pro.js — UI FINAL PRO
// ═══════════════════════════════════════
export function renderImpresion(el){
  el.innerHTML = `
  <div class="app">
    <div class="side">
      <div class="item active">Campos</div>
      <div class="item">Config</div>
      <div class="item">Plantillas</div>
    </div>
    <div class="main">
      <div class="bar">
        <div class="group">A+ A-</div>
        <div class="group">B I</div>
        <div class="spacer"></div>
        <button class="preview">Preview</button>
        <button class="print">Print</button>
      </div>
      <div class="canvas">
        <div class="paper"></div>
      </div>
    </div>
  </div>
  `;
}
const s=document.createElement("style");
s.innerHTML=`
.app{display:flex;height:100vh;font-family:sans-serif}
.side{width:200px;background:#0f172a;color:#fff;padding:10px}
.item{padding:8px;border-radius:6px;margin-bottom:4px}
.item.active{background:#7c3aed}
.main{flex:1;display:flex;flex-direction:column}
.bar{display:flex;padding:10px;border-bottom:1px solid #ddd}
.group{margin-right:10px}
.spacer{flex:1}
.print{background:#7c3aed;color:#fff;border:none;padding:6px 12px;border-radius:20px}
.canvas{flex:1;display:flex;justify-content:center;align-items:center;background:#eee}
.paper{width:400px;height:560px;background:#fff}
`;
document.head.appendChild(s);

// ── render() for operator.js v8 ──
export function render(container, usuario) { renderImpresion(container); }
