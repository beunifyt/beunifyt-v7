// ═══════════════════════════════════════
// impresion_lab.js — UX LAB 10 layouts
// ═══════════════════════════════════════
let layout = "l1";
export function renderImpresion(el){
  window.impLab = { set:l=>{layout=l;render()} };
  el.innerHTML = `
    <div style="padding:10px">
      ${[1,2,3,4,5,6,7,8,9,10].map(n=>`
        <button onclick="impLab.set('l${n}')">${n}</button>
      `).join("")}
    </div>
    <div id="root"></div>
  `;
  render();
}
function render(){
  const r = document.getElementById("root");
  r.innerHTML = layouts[layout]();
}
const baseCanvas = `<div class="paper"></div>`;
const baseToolbar = `<div class="tb">Toolbar</div>`;
const baseSide = `<div class="side">Side</div>`;
const layouts = {
l1:()=>`<div class="g">${baseSide}<div>${baseToolbar}${baseCanvas}</div></div>`,
l2:()=>`<div>${baseToolbar}${baseCanvas}</div>`,
l3:()=>`<div class="g"><div>DO WR FL IM CF</div><div>${baseToolbar}${baseCanvas}</div></div>`,
l4:()=>`<div><div>DO WR</div>${baseToolbar}${baseCanvas}</div>`,
l5:()=>`<div>${baseCanvas}<div class="float">${baseToolbar}</div></div>`,
l6:()=>`<div class="split">${baseSide}${baseCanvas}${baseToolbar}</div>`,
l7:()=>`<div>${baseCanvas}<button>PRINT</button></div>`,
l8:()=>`<div>STEP 1 2 3 ${baseCanvas}</div>`,
l9:()=>`<div class="g">${baseSide}<div>${baseToolbar}${baseCanvas}</div></div>`,
l10:()=>`<div class="dash">${baseSide}${baseCanvas}${baseToolbar}</div>`
};
const s = document.createElement("style");
s.innerHTML = `
.g{display:grid;grid-template-columns:200px 1fr}
.paper{width:300px;height:400px;background:#fff;margin:20px auto}
.tb{padding:10px}
.side{background:#111;color:#fff;padding:10px}
.float{position:fixed;bottom:10px}
.dash{display:grid;grid-template-columns:200px 1fr 200px}
`;
document.head.appendChild(s);
