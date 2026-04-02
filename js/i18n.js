// ═══════════════════════════════════════════════════════════
// BeUnifyT v7 — i18n.js
// Sistema de traduccion unificado. Reemplaza I18N + PI18N de v6.
// Carga lazy: solo idioma activo + ingles (fallback).
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';

const T = { common: {}, operator: {}, portal: {} };
const _loaded = new Set();

// Funcion unica — reemplaza ptr(), p(), t(), accesos directos
export function t(key, ns = 'common') {
  const lang = AppState.get('currentLang') || 'es';
  return (
    T[ns]?.[lang]?.[key]      ??
    T[ns]?.['en']?.[key]      ??
    T.common?.[lang]?.[key]   ??
    T.common?.['en']?.[key]   ??
    `[${key}]`
  );
}

export const tc = (key) => t(key, 'common');
export const to = (key) => t(key, 'operator');
export const tp = (key) => t(key, 'portal');

// Cargar idioma lazy
export async function loadLang(lang) {
  if (_loaded.has(lang)) return;
  try {
    const mod = lang === 'es' ? _ES : lang === 'en' ? _EN
      : await import(`../lang/${lang}.js`);
    if (mod.common)   T.common[lang]   = mod.common;
    if (mod.operator) T.operator[lang] = mod.operator;
    if (mod.portal)   T.portal[lang]   = mod.portal;
    _loaded.add(lang);
  } catch {
    console.warn(`[i18n] Idioma "${lang}" no disponible.`);
    if (lang !== 'en') await loadLang('en');
  }
}

export async function setLang(lang) {
  await loadLang(lang);
  AppState.set('currentLang', lang);
}

export const LANGS = {
  es: { name: 'Espanol',    flag: 'ES' },
  en: { name: 'English',    flag: 'GB' },
  fr: { name: 'Francais',   flag: 'FR' },
  de: { name: 'Deutsch',    flag: 'DE' },
  it: { name: 'Italiano',   flag: 'IT' },
  pt: { name: 'Portugues',  flag: 'PT' },
  nl: { name: 'Nederlands', flag: 'NL' },
  pl: { name: 'Polski',     flag: 'PL' },
  ro: { name: 'Romana',     flag: 'RO' },
  ru: { name: 'Russkiy',    flag: 'RU' },
  uk: { name: 'Ukrayinska', flag: 'UA' },
  cs: { name: 'Cestina',    flag: 'CZ' },
  sk: { name: 'Slovencina', flag: 'SK' },
  hu: { name: 'Magyar',     flag: 'HU' },
  bg: { name: 'Balgarski',  flag: 'BG' },
  hr: { name: 'Hrvatski',   flag: 'HR' },
  tr: { name: 'Turkce',     flag: 'TR' },
  ar: { name: 'Arabic',     flag: 'SA' },
  zh: { name: 'Chinese',    flag: 'CN' },
  eu: { name: 'Euskara',    flag: 'EU' },
  ca: { name: 'Catala',     flag: 'CA' },
};

// ══════════════════════════════════════════════════════════════
// ESPANOL — siempre disponible, sin import
// ══════════════════════════════════════════════════════════════
const _ES = {
  common: {
    guardar: 'Guardar', cancelar: 'Cancelar', eliminar: 'Eliminar',
    editar: 'Editar', cerrar: 'Cerrar', buscar: 'Buscar',
    filtrar: 'Filtrar', exportar: 'Exportar', importar: 'Importar',
    imprimir: 'Imprimir', nuevo: 'Nuevo', ver: 'Ver',
    aceptar: 'Aceptar', si: 'Si', no: 'No',
    cargando: 'Cargando...', sinDatos: 'Sin datos', error: 'Error',
    exito: 'Exito', advertencia: 'Atencion', idioma: 'Idioma',
    tema: 'Tema', cerrarSesion: 'Cerrar sesion', version: 'Version',
  },
  operator: {
    iniciarSesion: 'Iniciar sesion', usuario: 'Usuario',
    contrasena: 'Contrasena', pin: 'PIN', introducirPin: 'Introduce tu PIN',
    loginError: 'Credenciales incorrectas',
    entrada: 'Entrada', salida: 'Salida', enRecinto: 'En recinto', hoy: 'Hoy',
    tabIngresos: 'Ingresos', tabBuscar: 'Buscar', tabEmpresas: 'Empresas',
    tabConfig: 'Config', tabAuditoria: 'Auditoria',
    matricula: 'Matricula', empresa: 'Empresa', conductor: 'Conductor',
    remolque: 'Remolque', stand: 'Stand / Pabellon', tipo: 'Tipo vehiculo',
    registrarEntrada: 'Registrar entrada', registrarSalida: 'Registrar salida',
    vehiculoEnRecinto: 'Vehiculo en recinto', vehiculoSalido: 'Vehiculo ha salido',
    tipoTrailer: 'Trailer', tipoCamion: 'Camion', tipoFurgoneta: 'Furgoneta',
    tipoSemi: 'Semirremolque', tipoCoche: 'Coche', tipoOtro: 'Otro',
    incidencia: 'Incidencia', nuevaIncidencia: 'Nueva incidencia', motivo: 'Motivo',
    buscarMatricula: 'Buscar matricula...', noResultados: 'Sin resultados',
    sincronizando: 'Sincronizando...', sincronizado: 'Sincronizado',
    sinConexion: 'Sin conexion', errorSync: 'Error de sincronizacion',
  },
  portal: {
    bienvenida: 'Bienvenida', miEmpresa: 'Mi empresa',
    miFlota: 'Mi flota', asignarVehiculo: 'Asignar vehiculo',
    estadoVehiculos: 'Estado de vehiculos',
    matricula: 'Matricula', tipoVehiculo: 'Tipo de vehiculo',
    conductor: 'Conductor', telefono: 'Telefono', remolque: 'Remolque',
    pais: 'Pais', idiomaConductor: 'Idioma del conductor',
    enRecinto: 'En recinto', pendiente: 'Pendiente',
    salido: 'Salido', noRegistrado: 'No registrado',
    addVehiculo: 'Anadir vehiculo', editVehiculo: 'Editar vehiculo',
    delVehiculo: 'Eliminar vehiculo', importarExcel: 'Importar Excel',
    exportarExcel: 'Exportar Excel', descargarPlantilla: 'Descargar plantilla',
    incidencia: 'Incidencia', reportarIncidencia: 'Reportar incidencia',
    cambioMatricula: 'Cambio de matricula', cambioConductor: 'Cambio de conductor',
    flotaVacia: 'No tienes vehiculos registrados',
    addPrimeroVeh: 'Anade tu primer vehiculo para empezar',
    guardadoOk: 'Cambios guardados', vehiculoAddOk: 'Vehiculo anadido correctamente',
    vehiculoDelOk: 'Vehiculo eliminado',
  }
};

// ══════════════════════════════════════════════════════════════
// INGLES — fallback universal
// ══════════════════════════════════════════════════════════════
const _EN = {
  common: {
    guardar: 'Save', cancelar: 'Cancel', eliminar: 'Delete',
    editar: 'Edit', cerrar: 'Close', buscar: 'Search',
    filtrar: 'Filter', exportar: 'Export', importar: 'Import',
    imprimir: 'Print', nuevo: 'New', ver: 'View',
    aceptar: 'Accept', si: 'Yes', no: 'No',
    cargando: 'Loading...', sinDatos: 'No data', error: 'Error',
    exito: 'Success', advertencia: 'Warning', idioma: 'Language',
    tema: 'Theme', cerrarSesion: 'Log out', version: 'Version',
  },
  operator: {
    iniciarSesion: 'Sign in', usuario: 'User', contrasena: 'Password',
    pin: 'PIN', introducirPin: 'Enter your PIN', loginError: 'Invalid credentials',
    entrada: 'Entry', salida: 'Exit', enRecinto: 'On site', hoy: 'Today',
    tabIngresos: 'Entries', tabBuscar: 'Search', tabEmpresas: 'Companies',
    tabConfig: 'Settings', tabAuditoria: 'Audit',
    matricula: 'Plate', empresa: 'Company', conductor: 'Driver',
    remolque: 'Trailer', stand: 'Stand / Hall', tipo: 'Vehicle type',
    registrarEntrada: 'Register entry', registrarSalida: 'Register exit',
    vehiculoEnRecinto: 'Vehicle on site', vehiculoSalido: 'Vehicle has exited',
    tipoTrailer: 'Trailer', tipoCamion: 'Truck', tipoFurgoneta: 'Van',
    tipoSemi: 'Semi-trailer', tipoCoche: 'Car', tipoOtro: 'Other',
    incidencia: 'Incident', nuevaIncidencia: 'New incident', motivo: 'Reason',
    buscarMatricula: 'Search plate...', noResultados: 'No results',
    sincronizando: 'Syncing...', sincronizado: 'Synced',
    sinConexion: 'Offline', errorSync: 'Sync error',
  },
  portal: {
    bienvenida: 'Welcome', miEmpresa: 'My company',
    miFlota: 'My fleet', asignarVehiculo: 'Assign vehicle',
    estadoVehiculos: 'Vehicle status',
    matricula: 'Plate', tipoVehiculo: 'Vehicle type',
    conductor: 'Driver', telefono: 'Phone', remolque: 'Trailer',
    pais: 'Country', idiomaConductor: 'Driver language',
    enRecinto: 'On site', pendiente: 'Pending',
    salido: 'Exited', noRegistrado: 'Not registered',
    addVehiculo: 'Add vehicle', editVehiculo: 'Edit vehicle',
    delVehiculo: 'Delete vehicle', importarExcel: 'Import Excel',
    exportarExcel: 'Export Excel', descargarPlantilla: 'Download template',
    incidencia: 'Incident', reportarIncidencia: 'Report incident',
    cambioMatricula: 'Plate change', cambioConductor: 'Driver change',
    flotaVacia: 'No vehicles registered',
    addPrimeroVeh: 'Add your first vehicle to get started',
    guardadoOk: 'Changes saved', vehiculoAddOk: 'Vehicle added successfully',
    vehiculoDelOk: 'Vehicle deleted',
  }
};
