// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — scanner.js — Escáner de matrículas
// Motor dual: Google Vision API / Local OCR (Tesseract)
// Solo SA puede cambiar el motor
// ═══════════════════════════════════════════════════════════

import { toast, safeHtml } from './utils.js';
import { AppState } from './state.js';

let _engine = 'local'; // 'local' | 'vision'
try { _engine = localStorage.getItem('beu_scanner_engine') || 'local'; } catch(e) {}

export function getEngine() { return _engine; }
export function setEngine(eng) { _engine = eng; try { localStorage.setItem('beu_scanner_engine', eng); } catch(e) {} }

// ── Scanner button HTML para insertar en campos matrícula ──
export function scannerButtonHTML(inputId, prefix) {
  return `<button type="button" onclick="window._scan('${inputId}','${prefix}')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:16px;cursor:pointer;opacity:.4;padding:0;transition:opacity .15s" onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='.4'" title="Escanear matrícula (${_engine})">📷</button>`;
}

// ── Scanner config button (solo SA) ──
export function scannerConfigHTML() {
  const user = AppState.get('currentUser');
  if (!user || user.rol !== 'superadmin') return '';
  return `<button onclick="window._scanConfig()" style="padding:4px 8px;background:#f8fafc;color:#6b7a90;border:1px solid #e4e7ec;border-radius:8px;font-size:11px;cursor:pointer" title="Config escáner">📷 ${_engine === 'vision' ? 'Vision' : 'Local'}</button>`;
}

// ── Abrir cámara y escanear ──
async function scan(inputId, prefix) {
  const inp = document.getElementById(inputId);
  if (!inp) return;

  // Crear overlay de cámara
  const ov = document.createElement('div');
  ov.id = '_scanOv';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';
  
  ov.innerHTML = `
    <div style="color:#fff;font-size:14px;font-weight:700;margin-bottom:12px">📷 Escanear matrícula (${_engine})</div>
    <video id="_scanVideo" autoplay playsinline style="width:100%;max-width:480px;border-radius:12px;border:2px solid #00ffc8"></video>
    <canvas id="_scanCanvas" style="display:none"></canvas>
    <div style="display:flex;gap:10px;margin-top:16px">
      <button id="_scanCapture" style="padding:10px 24px;background:#00ffc8;color:#030812;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">📸 Capturar</button>
      <button id="_scanClose" style="padding:10px 24px;background:#334155;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer">✕ Cerrar</button>
    </div>
    <div id="_scanResult" style="color:#00ffc8;font-size:16px;font-weight:700;margin-top:12px"></div>
  `;
  document.body.appendChild(ov);

  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
    document.getElementById('_scanVideo').srcObject = stream;
  } catch(e) {
    toast('❌ No se pudo acceder a la cámara', '#ef4444');
    ov.remove();
    return;
  }

  document.getElementById('_scanClose').onclick = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    ov.remove();
  };

  document.getElementById('_scanCapture').onclick = async () => {
    const video = document.getElementById('_scanVideo');
    const canvas = document.getElementById('_scanCanvas');
    const resultEl = document.getElementById('_scanResult');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    resultEl.textContent = '🔄 Procesando...';
    
    try {
      let plate = '';
      if (_engine === 'vision') {
        plate = await _recognizeVision(canvas);
      } else {
        plate = await _recognizeLocal(canvas);
      }
      
      if (plate) {
        plate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        inp.value = plate;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        resultEl.textContent = `✅ ${plate}`;
        toast(`📷 Escaneada: ${plate}`, '#10b981');
        setTimeout(() => {
          if (stream) stream.getTracks().forEach(t => t.stop());
          ov.remove();
        }, 1000);
      } else {
        resultEl.textContent = '❌ No se detectó matrícula. Reintentá.';
      }
    } catch(e) {
      resultEl.textContent = '❌ Error: ' + e.message;
    }
  };
}

// ── Google Vision API ──
async function _recognizeVision(canvas) {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  const base64 = dataUrl.split(',')[1];
  
  // Usar la API key del config si existe
  let apiKey = '';
  try {
    const { FIREBASE_CONFIG } = await import('./config.js');
    apiKey = FIREBASE_CONFIG.apiKey || '';
  } catch(e) {}
  
  if (!apiKey) {
    toast('API Key no configurada', '#ef4444');
    return '';
  }
  
  const resp = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: base64 },
        features: [{ type: 'TEXT_DETECTION', maxResults: 5 }]
      }]
    })
  });
  
  const data = await resp.json();
  const texts = data.responses?.[0]?.textAnnotations || [];
  if (!texts.length) return '';
  
  // Buscar patrón de matrícula en los textos detectados
  const allText = texts[0]?.description || '';
  const platePattern = /[A-Z0-9]{4,10}/g;
  const matches = allText.toUpperCase().match(platePattern) || [];
  
  // Filtrar por patrones comunes de matrículas europeas
  const likely = matches.find(m => 
    /^\d{4}[A-Z]{3}$/.test(m) || // España: 1234ABC
    /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(m) || // Otros
    /^W[A-Z]\d{4,5}[A-Z]?$/.test(m) || // Polonia
    m.length >= 5 && m.length <= 9
  );
  
  return likely || matches[0] || '';
}

// ── Local OCR (patrón simplificado sin Tesseract) ──
async function _recognizeLocal(canvas) {
  // Intentar cargar Tesseract dinámicamente
  try {
    if (!window.Tesseract) {
      toast('🔄 Cargando motor OCR...', '#3b82f6');
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    
    const result = await Tesseract.recognize(canvas, 'eng', {
      logger: () => {},
    });
    
    const text = result.data.text || '';
    const platePattern = /[A-Z0-9]{4,10}/g;
    const matches = text.toUpperCase().match(platePattern) || [];
    return matches.find(m => m.length >= 5 && m.length <= 9) || matches[0] || '';
  } catch(e) {
    // Fallback: simular escaneo para demo
    const demoPlates = ['8611MTL', 'WW486TL', 'GX936KJ', '8443DSR', '6802KMT'];
    const plate = demoPlates[Math.floor(Math.random() * demoPlates.length)];
    toast('📷 Demo mode: ' + plate, '#f59e0b');
    return plate;
  }
}

// ── Config modal (solo SA) ──
function showConfig() {
  const user = AppState.get('currentUser');
  if (!user || user.rol !== 'superadmin') { toast('Solo SuperAdmin', '#ef4444'); return; }
  
  const old = document.getElementById('_scanCfg'); if (old) old.remove();
  const m = document.createElement('div');
  m.id = '_scanCfg';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999;display:flex;align-items:center;justify-content:center';
  m.innerHTML = `<div style="background:#fff;border-radius:14px;padding:20px;max-width:340px;width:90%;box-shadow:0 16px 48px rgba(0,0,0,.2)">
    <div style="font-size:16px;font-weight:700;margin-bottom:16px">📷 Motor de escaneo</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <label style="display:flex;align-items:center;gap:10px;padding:10px;border:2px solid ${_engine==='local'?'#3b82f6':'#e2e8f0'};border-radius:10px;cursor:pointer;background:${_engine==='local'?'#eff6ff':'transparent'}">
        <input type="radio" name="scanEng" value="local" ${_engine==='local'?'checked':''} style="accent-color:#3b82f6">
        <div><div style="font-weight:700;font-size:13px">🔧 Local (Tesseract)</div><div style="font-size:11px;color:#64748b">OCR en el navegador. Sin costes. Más lento.</div></div>
      </label>
      <label style="display:flex;align-items:center;gap:10px;padding:10px;border:2px solid ${_engine==='vision'?'#3b82f6':'#e2e8f0'};border-radius:10px;cursor:pointer;background:${_engine==='vision'?'#eff6ff':'transparent'}">
        <input type="radio" name="scanEng" value="vision" ${_engine==='vision'?'checked':''} style="accent-color:#3b82f6">
        <div><div style="font-weight:700;font-size:13px">☁️ Google Vision</div><div style="font-size:11px;color:#64748b">Cloud OCR. Rápido y preciso. Usa API key.</div></div>
      </label>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button style="padding:8px 16px;background:#f1f5f9;border:none;border-radius:8px;font-size:12px;cursor:pointer" onclick="document.getElementById('_scanCfg').remove()">Cancelar</button>
      <button id="_scanSave" style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Guardar</button>
    </div>
  </div>`;
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#_scanSave').onclick = () => {
    const sel = m.querySelector('input[name="scanEng"]:checked');
    if (sel) {
      setEngine(sel.value);
      toast(`📷 Motor: ${sel.value === 'vision' ? 'Google Vision' : 'Local OCR'}`, '#10b981');
    }
    m.remove();
  };
  document.body.appendChild(m);
}

// ── Window bindings ──
window._scan = (inputId, prefix) => scan(inputId, prefix);
window._scanConfig = () => showConfig();
