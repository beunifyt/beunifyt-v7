// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — themes.js — Sistema de temas
// 18 temas, 3 favoritos seleccionables por usuario
// ═══════════════════════════════════════════════════════════

export const THEMES = {
  linen:      { name:'Linen',        group:'light', bg:'#f4f5f7', card:'#fff',    sb:'#fff',    text:'#1e2431', t3:'#6b7a90', border:'#e4e7ec', acc:'#2c5ee8', accBg:'#eef2ff' },
  light:      { name:'Light Minimal', group:'light', bg:'#fafafa', card:'#fff',    sb:'#fff',    text:'#111111', t3:'#888888', border:'#e5e5e5', acc:'#111111', accBg:'#f5f5f5' },
  cardgrid:   { name:'Card Grid',    group:'light', bg:'#f4f6fb', card:'#fff',    sb:'#fff',    text:'#1a1d2e', t3:'#6b7280', border:'#e8eaf5', acc:'#4f46e5', accBg:'#eef2ff' },
  material:   { name:'Material',     group:'light', bg:'#f2f2f7', card:'#fff',    sb:'#fff',    text:'#1c1c1e', t3:'#8e8e93', border:'#e5e5ea', acc:'#007aff', accBg:'#e8f0fe' },
  corporate:  { name:'Corporate',    group:'light', bg:'#f0f2f5', card:'#fff',    sb:'#161616', text:'#161616', t3:'#6f6f6f', border:'#e0e0e0', acc:'#0f62fe', accBg:'#e8f1ff', sbText:'#fff' },
  neomorphic: { name:'Neomorphic',   group:'light', bg:'#e0e5ec', card:'#e0e5ec', sb:'#d4d9e0', text:'#3d4a5c', t3:'#7a8599', border:'#c8cdd5', acc:'#6366f1', accBg:'#e8e5ff' },
  pastel:     { name:'Pastel',       group:'light', bg:'#fde8f5', card:'rgba(255,255,255,.7)', sb:'#f0daf8', text:'#3d2b4e', t3:'#8b6fa0', border:'#e0c8f0', acc:'#c060e0', accBg:'#f5e8ff' },
  brutalist:  { name:'Brutalist',    group:'light', bg:'#f5f0e8', card:'#fff',    sb:'#1a1008', text:'#1a1008', t3:'#8a7a60', border:'#ece6d4', acc:'#d44000', accBg:'#fff0e8', sbText:'#f5f0e8' },
  fluid:      { name:'Fluid',        group:'light', bg:'#f8f9ff', card:'rgba(248,249,255,.85)', sb:'#fff', text:'#1a1b2e', t3:'#6b6d80', border:'#e0e0f0', acc:'#6366f1', accBg:'#eee8ff' },

  slate:      { name:'Slate',        group:'dark',  bg:'#1e2a3a', card:'#172638', sb:'#0f1c2c', text:'#eef2f8', t3:'#7a8fa8', border:'#2a3a4e', acc:'#d4a855', accBg:'rgba(212,168,85,.12)' },
  darkpro:    { name:'Dark Pro',     group:'dark',  bg:'#0a0c10', card:'#12151c', sb:'#080a0e', text:'#e8edf5', t3:'#5a6580', border:'#1e2538', acc:'#3b82f6', accBg:'rgba(59,130,246,.12)' },
  terminal:   { name:'Terminal',     group:'dark',  bg:'#000000', card:'#0a0a0a', sb:'#000000', text:'#00ff41', t3:'#008020', border:'#00ff4122', acc:'#00ff41', accBg:'rgba(0,255,65,.08)' },
  glass:      { name:'Glass',        group:'dark',  bg:'#0f0c29', card:'rgba(255,255,255,.07)', sb:'rgba(0,0,0,.3)', text:'#ffffff', t3:'#a0a8c0', border:'rgba(255,255,255,.1)', acc:'#8b5cf6', accBg:'rgba(139,92,246,.12)' },
  aurora:     { name:'Aurora',       group:'dark',  bg:'#050508', card:'rgba(5,5,8,.7)', sb:'#050508', text:'#e8eaf5', t3:'#7a7e90', border:'rgba(255,255,255,.08)', acc:'#7828ff', accBg:'rgba(120,40,255,.12)' },
  retina:     { name:'Retina',       group:'dark',  bg:'#060607', card:'#08090c', sb:'#060607', text:'#b8c0cc', t3:'#5080a0', border:'#1e2530', acc:'#f0a020', accBg:'rgba(240,160,32,.1)' },
  retinaDark: { name:'Retina Dark',  group:'dark',  bg:'#090b0d', card:'#0c1218', sb:'#050708', text:'#b8c8d8', t3:'#4a6070', border:'#1e2c38', acc:'#00c8ff', accBg:'rgba(0,200,255,.1)' },
  frosted:    { name:'Frosted macOS',group:'dark',  bg:'#1a1a2e', card:'rgba(255,255,255,.08)', sb:'rgba(255,255,255,.05)', text:'#f0f0f5', t3:'#8888a0', border:'rgba(255,255,255,.1)', acc:'#5882ff', accBg:'rgba(88,130,255,.12)' },
  fluidDark:  { name:'Fluid Motion', group:'dark',  bg:'#0a0a14', card:'rgba(10,10,20,.8)', sb:'#080810', text:'#e0e0f0', t3:'#6a6a80', border:'rgba(255,255,255,.08)', acc:'#ec4899', accBg:'rgba(236,72,153,.1)' },
};

const THEME_LIST = Object.entries(THEMES).map(([id, t]) => ({ id, ...t }));
export const LIGHT_THEMES = THEME_LIST.filter(t => t.group === 'light');
export const DARK_THEMES = THEME_LIST.filter(t => t.group === 'dark');

// ── Favoritos (máx 3) ──
export function getFavorites() {
  try { return JSON.parse(localStorage.getItem('beu_theme_favs') || '["linen","darkpro","terminal"]'); } catch(e) { return ['linen','darkpro','terminal']; }
}
export function setFavorites(favs) {
  try { localStorage.setItem('beu_theme_favs', JSON.stringify(favs.slice(0, 3))); } catch(e) {}
}
export function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else { if (favs.length >= 3) favs.shift(); favs.push(id); }
  setFavorites(favs);
  return favs;
}

// ── Current theme ──
export function getCurrentTheme() {
  try { return localStorage.getItem('beu_theme_id') || 'linen'; } catch(e) { return 'linen'; }
}
export function setCurrentTheme(id) {
  try { localStorage.setItem('beu_theme_id', id); } catch(e) {}
}
export function getThemeColors(id) {
  return THEMES[id || getCurrentTheme()] || THEMES.linen;
}
