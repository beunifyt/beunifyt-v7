// ═══════════════════════════════════════════════════════════
// BeUnifyT v8 — langs.js — Servicio activo de traducción
// No es un diccionario pasivo: filtra por tabs autorizados
// ═══════════════════════════════════════════════════════════

import { AppState } from './state.js';

// ─── BANDERAS / IDIOMAS UI ──────────────────────────────
export const LANGS_UI = [
  { code:'es', flag:'🇪🇸', name:'Español' },
  { code:'ca', flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#FCDD09"/><rect y="1.75" width="20" height="1.75" fill="#DA121A"/><rect y="5.25" width="20" height="1.75" fill="#DA121A"/><rect y="8.75" width="20" height="1.75" fill="#DA121A"/><rect y="12.25" width="20" height="1.75" fill="#DA121A"/></svg>', name:'Català' },
  { code:'eu', flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#D52B1E"/><rect x="8" width="4" height="14" fill="#007A3D"/><rect y="5" width="20" height="4" fill="#007A3D"/><line x1="0" y1="0" x2="20" y2="14" stroke="#FFF" stroke-width="2.5"/><line x1="20" y1="0" x2="0" y2="14" stroke="#FFF" stroke-width="2.5"/><rect x="8" width="4" height="14" fill="#007A3D"/><rect y="5" width="20" height="4" fill="#007A3D"/></svg>', name:'Euskara' },
  { code:'gl', flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#FFF"/><polygon points="0,0 5,0 20,14 15,14" fill="#00A2E2"/></svg>', name:'Galego' },
  { code:'en', flag:'🇬🇧', name:'English' },
  { code:'fr', flag:'🇫🇷', name:'Français' },
  { code:'de', flag:'🇩🇪', name:'Deutsch' },
  { code:'it', flag:'🇮🇹', name:'Italiano' },
  { code:'pt', flag:'🇵🇹', name:'Português' },
  { code:'pl', flag:'🇵🇱', name:'Polski' },
  { code:'ro', flag:'🇷🇴', name:'Română' },
  { code:'nl', flag:'🇳🇱', name:'Nederlands' },
  { code:'hu', flag:'🇭🇺', name:'Magyar' },
  { code:'cs', flag:'🇨🇿', name:'Čeština' },
  { code:'hr', flag:'🇭🇷', name:'Hrvatski' },
  { code:'uk', flag:'🇺🇦', name:'Українська' },
  { code:'ru', flag:'🇷🇺', name:'Русский' },
  { code:'tr', flag:'🇹🇷', name:'Türkçe' },
  { code:'ar', flag:'🇸🇦', name:'العربية' },
  { code:'sv', flag:'🇸🇪', name:'Svenska' },
  { code:'fi', flag:'🇫🇮', name:'Suomi' },
  { code:'el', flag:'🇬🇷', name:'Ελληνικά' },
  { code:'bg', flag:'🇧🇬', name:'Български' },
  { code:'sk', flag:'🇸🇰', name:'Slovenčina' },
  { code:'sl', flag:'🇸🇮', name:'Slovenščina' },
];

// ─── DICCIONARIOS POR MÓDULO ────────────────────────────
// Cada módulo tiene sus traducciones. Se pueden añadir sin tocar otros.

const DICT = {
  // ── SHELL (header, tabs, genéricos) ──
  shell: {
    es: { logout:'Cerrar sesión', settings:'Ajustes', lang_ok:'Idioma guardado', search:'Buscar', noData:'Sin datos', loading:'Cargando...', error:'Error', save:'Guardar', cancel:'Cancelar', add:'Añadir', edit:'Editar', delete:'Eliminar', export:'Exportar', import:'Importar', confirm:'Confirmar', back:'Volver', close:'Cerrar', yes:'Sí', no:'No', filter:'Filtrar', all:'Todos', today:'Hoy', print:'Imprimir' },
    en: { logout:'Log out', settings:'Settings', lang_ok:'Language saved', search:'Search', noData:'No data', loading:'Loading...', error:'Error', save:'Save', cancel:'Cancel', add:'Add', edit:'Edit', delete:'Delete', export:'Export', import:'Import', confirm:'Confirm', back:'Back', close:'Close', yes:'Yes', no:'No', filter:'Filter', all:'All', today:'Today', print:'Print' },
    fr: { logout:'Déconnexion', settings:'Paramètres', lang_ok:'Langue sauvegardée', search:'Rechercher', noData:'Aucune donnée', loading:'Chargement...', error:'Erreur', save:'Enregistrer', cancel:'Annuler', add:'Ajouter', edit:'Modifier', delete:'Supprimer', export:'Exporter', import:'Importer', confirm:'Confirmer', back:'Retour', close:'Fermer', yes:'Oui', no:'Non', filter:'Filtrer', all:'Tous', today:"Aujourd'hui", print:'Imprimer' },
    de: { logout:'Abmelden', settings:'Einstellungen', lang_ok:'Sprache gespeichert', search:'Suchen', noData:'Keine Daten', loading:'Laden...', error:'Fehler', save:'Speichern', cancel:'Abbrechen', add:'Hinzufügen', edit:'Bearbeiten', delete:'Löschen', export:'Exportieren', import:'Importieren', confirm:'Bestätigen', back:'Zurück', close:'Schließen', yes:'Ja', no:'Nein', filter:'Filtern', all:'Alle', today:'Heute', print:'Drucken' },
    it: { logout:'Esci', settings:'Impostazioni', lang_ok:'Lingua salvata', search:'Cerca', noData:'Nessun dato', loading:'Caricamento...', error:'Errore', save:'Salva', cancel:'Annulla', add:'Aggiungi', edit:'Modifica', delete:'Elimina', export:'Esporta', import:'Importa', confirm:'Conferma', back:'Indietro', close:'Chiudi', yes:'Sì', no:'No', filter:'Filtra', all:'Tutti', today:'Oggi', print:'Stampa' },
    pt: { logout:'Sair', settings:'Configurações', lang_ok:'Idioma salvo', search:'Pesquisar', noData:'Sem dados', loading:'Carregando...', error:'Erro', save:'Salvar', cancel:'Cancelar', add:'Adicionar', edit:'Editar', delete:'Excluir', export:'Exportar', import:'Importar', confirm:'Confirmar', back:'Voltar', close:'Fechar', yes:'Sim', no:'Não', filter:'Filtrar', all:'Todos', today:'Hoje', print:'Imprimir' },
    pl: { logout:'Wyloguj', settings:'Ustawienia', lang_ok:'Język zapisany', search:'Szukaj', noData:'Brak danych', loading:'Ładowanie...', error:'Błąd', save:'Zapisz', cancel:'Anuluj', add:'Dodaj', edit:'Edytuj', delete:'Usuń', export:'Eksportuj', import:'Importuj', confirm:'Potwierdź', back:'Wróć', close:'Zamknij', yes:'Tak', no:'Nie', filter:'Filtruj', all:'Wszystkie', today:'Dziś', print:'Drukuj' },
    ro: { logout:'Deconectare', settings:'Setări', lang_ok:'Limbă salvată', search:'Căutare', noData:'Fără date', loading:'Se încarcă...', error:'Eroare', save:'Salvează', cancel:'Anulează', add:'Adaugă', edit:'Editează', delete:'Șterge', export:'Exportă', import:'Importă', confirm:'Confirmă', back:'Înapoi', close:'Închide', yes:'Da', no:'Nu', filter:'Filtrează', all:'Toate', today:'Azi', print:'Tipărire' },
  },

  // ── TABS (nombres de pestañas) ──
  tabs: {
    es: { dash:'📊 Dashboard', ingresos:'🔖 Referencia', ingresos2:'🚛 Ingresos', flota:'📦 Embalaje', conductores:'👤 Conductores', agenda:'📅 Agenda', analytics:'📈 Análisis', vehiculos:'📜 Historial', auditoria:'📂 Archivos', recintos:'🏟 Recintos', usuarios:'👥 Usuarios', eventos:'📅 Eventos', papelera:'🗑 Papelera', mensajes:'📢 Mensajes', impresion:'🖨 Impresión', empresas:'🏢 Empresas', migracion:'💾 Migración' },
    en: { dash:'📊 Dashboard', ingresos:'🔖 Reference', ingresos2:'🚛 Access', flota:'📦 Packaging', conductores:'👤 Drivers', agenda:'📅 Agenda', analytics:'📈 Analytics', vehiculos:'📜 History', auditoria:'📂 Files', recintos:'🏟 Venues', usuarios:'👥 Users', eventos:'📅 Events', papelera:'🗑 Trash', mensajes:'📢 Messages', impresion:'🖨 Print', empresas:'🏢 Companies', migracion:'💾 Migration' },
    fr: { dash:'📊 Tableau', ingresos:'🔖 Référence', ingresos2:'🚛 Accès', flota:'📦 Emballage', conductores:'👤 Chauffeurs', agenda:'📅 Agenda', analytics:'📈 Analytique', vehiculos:'📜 Historique', auditoria:'📂 Fichiers', recintos:'🏟 Lieux', usuarios:'👥 Utilisateurs', eventos:'📅 Événements', papelera:'🗑 Corbeille', mensajes:'📢 Messages', impresion:'🖨 Impression', empresas:'🏢 Entreprises', migracion:'💾 Migration' },
    de: { dash:'📊 Dashboard', ingresos:'🔖 Referenz', ingresos2:'🚛 Zugang', flota:'📦 Verpackung', conductores:'👤 Fahrer', agenda:'📅 Agenda', analytics:'📈 Analytik', vehiculos:'📜 Verlauf', auditoria:'📂 Dateien', recintos:'🏟 Veranstaltungsorte', usuarios:'👥 Benutzer', eventos:'📅 Events', papelera:'🗑 Papierkorb', mensajes:'📢 Nachrichten', impresion:'🖨 Druck', empresas:'🏢 Firmen', migracion:'💾 Migration' },
    it: { dash:'📊 Dashboard', ingresos:'🔖 Riferimento', ingresos2:'🚛 Accessi', flota:'📦 Imballaggio', conductores:'👤 Autisti', agenda:'📅 Agenda', analytics:'📈 Analisi', vehiculos:'📜 Cronologia', auditoria:'📂 File', recintos:'🏟 Sedi', usuarios:'👥 Utenti', eventos:'📅 Eventi', papelera:'🗑 Cestino', mensajes:'📢 Messaggi', impresion:'🖨 Stampa', empresas:'🏢 Aziende', migracion:'💾 Migrazione' },
    pt: { dash:'📊 Painel', ingresos:'🔖 Referência', ingresos2:'🚛 Acessos', flota:'📦 Embalagem', conductores:'👤 Motoristas', agenda:'📅 Agenda', analytics:'📈 Análise', vehiculos:'📜 Histórico', auditoria:'📂 Arquivos', recintos:'🏟 Recintos', usuarios:'👥 Usuários', eventos:'📅 Eventos', papelera:'🗑 Lixeira', mensajes:'📢 Mensagens', impresion:'🖨 Impressão', empresas:'🏢 Empresas', migracion:'💾 Migração' },
    pl: { dash:'📊 Pulpit', ingresos:'🔖 Referencja', ingresos2:'🚛 Wejścia', flota:'📦 Pakowanie', conductores:'👤 Kierowcy', agenda:'📅 Agenda', analytics:'📈 Analityka', vehiculos:'📜 Historia', auditoria:'📂 Pliki', recintos:'🏟 Obiekty', usuarios:'👥 Użytkownicy', eventos:'📅 Wydarzenia', papelera:'🗑 Kosz', mensajes:'📢 Wiadomości', impresion:'🖨 Druk', empresas:'🏢 Firmy', migracion:'💾 Migracja' },
    ro: { dash:'📊 Panou', ingresos:'🔖 Referință', ingresos2:'🚛 Intrări', flota:'📦 Ambalare', conductores:'👤 Șoferi', agenda:'📅 Agendă', analytics:'📈 Analiză', vehiculos:'📜 Istoric', auditoria:'📂 Fișiere', recintos:'🏟 Locații', usuarios:'👥 Utilizatori', eventos:'📅 Evenimente', papelera:'🗑 Coș', mensajes:'📢 Mesaje', impresion:'🖨 Tipărire', empresas:'🏢 Companii', migracion:'💾 Migrare' },
  },

  // ── LOGIN / AUTH ──
  auth: {
    es: { title:'Iniciar sesión', email:'Email', password:'Contraseña', login:'Acceder', register:'Registrar empresa', forgot:'¿Olvidaste tu contraseña?', error_cred:'Credenciales incorrectas', error_net:'Error de conexión', welcome:'Bienvenido' },
    en: { title:'Log in', email:'Email', password:'Password', login:'Sign in', register:'Register company', forgot:'Forgot your password?', error_cred:'Invalid credentials', error_net:'Connection error', welcome:'Welcome' },
    fr: { title:'Connexion', email:'Email', password:'Mot de passe', login:'Se connecter', register:"Enregistrer une entreprise", forgot:'Mot de passe oublié ?', error_cred:'Identifiants incorrects', error_net:'Erreur de connexion', welcome:'Bienvenue' },
    de: { title:'Anmelden', email:'Email', password:'Passwort', login:'Einloggen', register:'Firma registrieren', forgot:'Passwort vergessen?', error_cred:'Ungültige Anmeldedaten', error_net:'Verbindungsfehler', welcome:'Willkommen' },
    it: { title:'Accedi', email:'Email', password:'Password', login:'Entra', register:'Registra azienda', forgot:'Password dimenticata?', error_cred:'Credenziali errate', error_net:'Errore di connessione', welcome:'Benvenuto' },
    pt: { title:'Entrar', email:'Email', password:'Senha', login:'Acessar', register:'Registrar empresa', forgot:'Esqueceu a senha?', error_cred:'Credenciais inválidas', error_net:'Erro de conexão', welcome:'Bem-vindo' },
    pl: { title:'Zaloguj się', email:'Email', password:'Hasło', login:'Zaloguj', register:'Zarejestruj firmę', forgot:'Zapomniałeś hasła?', error_cred:'Nieprawidłowe dane', error_net:'Błąd połączenia', welcome:'Witamy' },
    ro: { title:'Conectare', email:'Email', password:'Parolă', login:'Accesează', register:'Înregistrează companie', forgot:'Ai uitat parola?', error_cred:'Date incorecte', error_net:'Eroare de conexiune', welcome:'Bine ai venit' },
  },

  // ── INGRESOS (campos formulario) ──
  ingresos: {
    es: { title:'Referencia', matricula:'Matrícula Tractora', remolque:'Remolque', empresa:'Empresa', montador:'Montador', expositor:'Expositor', hall:'Hall', stand:'Stand', puerta:'Puerta Hall', nombre:'Nombre', apellido:'Apellido', pasaporte:'Pasaporte / DNI', telefono:'Teléfono', email:'Email', horaIngreso:'Hora Ingreso', llamador:'Nº Llamador', referencia:'Referencia', firmaConduct:'Firma Conductor', firmaControl:'Sello Control', enRecinto:'EN RECINTO', salida:'SALIDA REGISTRADA', fueraOp:'⚠ FUERA OPERATIVA', opOk:'OPERATIVA OK', obs:'Observaciones', datosVeh:'DATOS VEHÍCULO', datosRes:'DATOS RESERVA', datosPer:'DATOS PERSONALES', oficina:'USO OFICINA', fechaNac:'Fecha Nacimiento', fechaExp:'Fecha Expiración', pais:'País', tipoVeh:'Tipo Vehículo', descarga:'Serv. Descarga/Carga', descMano:'Handball', descMaq:'Forklift', lista:'Lista', especial:'Especial', historial:'Historial', campos:'Campos' },
    en: { title:'Reference', matricula:'Tractor Plate', remolque:'Trailer', empresa:'Company', montador:'Installer', expositor:'Exhibitor', hall:'Hall', stand:'Stand', puerta:'Hall Gate', nombre:'First Name', apellido:'Last Name', pasaporte:'Passport / ID', telefono:'Phone', email:'Email', horaIngreso:'Parking Entry', llamador:'Caller No.', referencia:'Reference', firmaConduct:'Driver Signature', firmaControl:'Access Stamp', enRecinto:'ON PREMISES', salida:'EXIT REGISTERED', fueraOp:'⚠ NOT IN OPERATION', opOk:'OPERATION OK', obs:'Observations', datosVeh:'VEHICLE DATA', datosRes:'BOOKING DETAILS', datosPer:'DRIVER DATA', oficina:'OFFICE USE', fechaNac:'Date of Birth', fechaExp:'Expiry Date', pais:'Country', tipoVeh:'Vehicle Type', descarga:'Unloading', descMano:'By Hand', descMaq:'Machinery', lista:'List', especial:'Special', historial:'History', campos:'Fields' },
    fr: { title:'Référence', matricula:'Immatriculation', remolque:'Remorque', empresa:'Société', montador:'Installateur', expositor:'Exposant', hall:'Hall', stand:'Stand', puerta:'Porte Hall', nombre:'Prénom', apellido:'Nom', pasaporte:'Passeport', telefono:'Téléphone', email:'Email', horaIngreso:'Entrée', llamador:'N° Appelant', referencia:'Référence', firmaConduct:'Signature Conducteur', firmaControl:'Cachet Contrôle', enRecinto:"DANS L'ENCEINTE", salida:'SORTIE', fueraOp:'⚠ HORS OPÉRATION', opOk:'OPÉRATION OK', obs:'Observations', datosVeh:'DONNÉES VÉHICULE', datosRes:'DONNÉES RÉSERVATION', datosPer:'DONNÉES CONDUCTEUR', oficina:'USAGE BUREAU', fechaNac:'Date de Naissance', fechaExp:"Date d'Expiration", pais:'Pays', tipoVeh:'Type de Véhicule', descarga:'Déchargement', descMano:'À la Main', descMaq:'Machinerie', lista:'Liste', especial:'Spécial', historial:'Historique', campos:'Champs' },
    de: { title:'Referenz', matricula:'Kennzeichen', remolque:'Anhänger', empresa:'Firma', montador:'Monteur', expositor:'Aussteller', hall:'Halle', stand:'Stand', puerta:'Hallentor', nombre:'Vorname', apellido:'Nachname', pasaporte:'Reisepass', telefono:'Telefon', email:'Email', horaIngreso:'Einfahrt', llamador:'Anrufer Nr.', referencia:'Referenz', firmaConduct:'Unterschrift Fahrer', firmaControl:'Stempel', enRecinto:'IM GELÄNDE', salida:'AUSFAHRT', fueraOp:'⚠ AUSSER BETRIEB', opOk:'BETRIEB OK', obs:'Bemerkungen', datosVeh:'FAHRZEUGDATEN', datosRes:'BUCHUNGSDETAILS', datosPer:'FAHRERDATEN', oficina:'BÜRO', fechaNac:'Geburtsdatum', fechaExp:'Ablaufdatum', pais:'Land', tipoVeh:'Fahrzeugtyp', descarga:'Entladung', descMano:'Manuell', descMaq:'Maschinell', lista:'Liste', especial:'Spezial', historial:'Verlauf', campos:'Felder' },
  },

  // ── CONDUCTORES ──
  conductores: {
    es: { title:'Conductores', nombre:'Nombre', apellido:'Apellido', pasaporte:'Pasaporte / DNI', telefono:'Teléfono', email:'Email', empresa:'Empresa', pais:'País', fechaNac:'Fecha Nacimiento', vehiculos:'Vehículos asignados', activo:'Activo', inactivo:'Inactivo' },
    en: { title:'Drivers', nombre:'First Name', apellido:'Last Name', pasaporte:'Passport / ID', telefono:'Phone', email:'Email', empresa:'Company', pais:'Country', fechaNac:'Date of Birth', vehiculos:'Assigned vehicles', activo:'Active', inactivo:'Inactive' },
    fr: { title:'Chauffeurs', nombre:'Prénom', apellido:'Nom', pasaporte:'Passeport', telefono:'Téléphone', email:'Email', empresa:'Société', pais:'Pays', fechaNac:'Date de Naissance', vehiculos:'Véhicules assignés', activo:'Actif', inactivo:'Inactif' },
    de: { title:'Fahrer', nombre:'Vorname', apellido:'Nachname', pasaporte:'Reisepass', telefono:'Telefon', email:'Email', empresa:'Firma', pais:'Land', fechaNac:'Geburtsdatum', vehiculos:'Zugewiesene Fahrzeuge', activo:'Aktiv', inactivo:'Inaktiv' },
  },

  // ── AGENDA ──
  agenda: {
    es: { title:'Agenda', fecha:'Fecha', hora:'Hora', empresa:'Empresa', vehiculo:'Vehículo', hall:'Hall', stand:'Stand', estado:'Estado', planificado:'Planificado', enCurso:'En curso', completado:'Completado', cancelado:'Cancelado' },
    en: { title:'Agenda', fecha:'Date', hora:'Time', empresa:'Company', vehiculo:'Vehicle', hall:'Hall', stand:'Stand', estado:'Status', planificado:'Planned', enCurso:'In progress', completado:'Completed', cancelado:'Cancelled' },
    fr: { title:'Agenda', fecha:'Date', hora:'Heure', empresa:'Société', vehiculo:'Véhicule', hall:'Hall', stand:'Stand', estado:'Statut', planificado:'Planifié', enCurso:'En cours', completado:'Terminé', cancelado:'Annulé' },
    de: { title:'Agenda', fecha:'Datum', hora:'Uhrzeit', empresa:'Firma', vehiculo:'Fahrzeug', hall:'Halle', stand:'Stand', estado:'Status', planificado:'Geplant', enCurso:'Laufend', completado:'Abgeschlossen', cancelado:'Storniert' },
  },

  // ── DASHBOARD ──
  dash: {
    es: { title:'Dashboard', enRecinto:'En recinto', referencias:'Referencias', ingresosHoy:'Ingresos hoy', agendaHoy:'Agenda hoy', mensajes:'Mensajes', ultimos7:'Últimos 7 días', hallsActivos:'Halls activos', ultimasEntradas:'Últimas entradas' },
    en: { title:'Dashboard', enRecinto:'On premises', referencias:'References', ingresosHoy:'Access today', agendaHoy:'Agenda today', mensajes:'Messages', ultimos7:'Last 7 days', hallsActivos:'Active halls', ultimasEntradas:'Latest entries' },
    fr: { title:'Tableau de bord', enRecinto:"Dans l'enceinte", referencias:'Références', ingresosHoy:"Accès aujourd'hui", agendaHoy:"Agenda aujourd'hui", mensajes:'Messages', ultimos7:'7 derniers jours', hallsActivos:'Halls actifs', ultimasEntradas:'Dernières entrées' },
    de: { title:'Dashboard', enRecinto:'Im Gelände', referencias:'Referenzen', ingresosHoy:'Zugang heute', agendaHoy:'Agenda heute', mensajes:'Nachrichten', ultimos7:'Letzte 7 Tage', hallsActivos:'Aktive Hallen', ultimasEntradas:'Letzte Einträge' },
  },
};

// ─── FALLBACK: idiomas no definidos → inglés → español ──
const FALLBACK_CHAIN = ['en', 'es'];

// ─── FUNCIÓN PRINCIPAL: tr(modulo, clave) ───────────────
export function tr(modulo, clave) {
  const lang = AppState.get('currentLang') || 'es';
  const user = AppState.get('currentUser');

  // Guardián: si piden un tab que el usuario no tiene (excepto shell, tabs, auth)
  const protectedModules = ['ingresos', 'ingresos2', 'flota', 'conductores', 'agenda', 'analytics', 'vehiculos', 'auditoria', 'recintos', 'usuarios', 'eventos', 'papelera', 'mensajes', 'impresion', 'empresas', 'migracion', 'dash'];
  if (user && user.tabs && protectedModules.includes(modulo) && !user.tabs.includes(modulo)) {
    return null; // No autorizado
  }

  const modDict = DICT[modulo];
  if (!modDict) return clave;

  // Buscar en idioma actual → fallback chain
  if (modDict[lang] && modDict[lang][clave] !== undefined) return modDict[lang][clave];
  for (const fb of FALLBACK_CHAIN) {
    if (modDict[fb] && modDict[fb][clave] !== undefined) return modDict[fb][clave];
  }
  return clave;
}

// ─── TRADUCCIÓN LIBRE (sin guardia de tabs) ─────────────
export function trFree(modulo, clave) {
  const lang = AppState.get('currentLang') || 'es';
  const modDict = DICT[modulo];
  if (!modDict) return clave;
  if (modDict[lang] && modDict[lang][clave] !== undefined) return modDict[lang][clave];
  for (const fb of FALLBACK_CHAIN) {
    if (modDict[fb] && modDict[fb][clave] !== undefined) return modDict[fb][clave];
  }
  return clave;
}

// ─── DETECTAR IDIOMA DEL NAVEGADOR ──────────────────────
export function detectLang(navLang) {
  const code = (navLang || 'es').split('-')[0].toLowerCase();
  const supported = LANGS_UI.map(l => l.code);
  return supported.includes(code) ? code : 'en';
}

// ─── OBTENER BANDERA PARA UN CÓDIGO ─────────────────────
export function getFlag(code) {
  const l = LANGS_UI.find(x => x.code === code);
  return l ? l.flag : '🌐';
}

// ─── REGISTRAR TRADUCCIONES DE MÓDULOS EXTERNOS ─────────
export function registerDict(modulo, langCode, translations) {
  if (!DICT[modulo]) DICT[modulo] = {};
  DICT[modulo][langCode] = { ...(DICT[modulo][langCode] || {}), ...translations };
}
