// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — portal.js
// Portal empresa. Carga lazy cuando rol === 'empresa'.
// NUNCA usa listener persistente — polling cada 60s para estado en vivo.
// Tabs: Mi empresa · Mis vehículos · Asignar evento · Estado en vivo
// Incluye: CRUD vehículos, preregistro con/sin referencia,
//          incidencias, consentimiento RGPD + OTP email, multiidioma
// ═══════════════════════════════════════════════════════════════════════
import { AppState }    from '../state.js';
import { toast, uid, safeHtml, formatDate, nowLocal, normPlate, sha256 } from '../utils.js';
import { fsGet, fsSet, fsUpdate, fsAdd, fsDel, fsGetAll } from '../firestore.js';
import { logout }      from '../auth.js';

const esc = safeHtml;
const fmt = formatDate;

// ─── i18n PORTAL ─────────────────────────────────────────────────────
const PI18N = {
  es:{ portalTitle:'Portal Empresas',miEmpresa:'Mi empresa',misVeh:'Mis vehículos',asigEvento:'Asignar evento',estadoVivo:'Estado en vivo',nombreEmp:'Nombre empresa',cifVat:'CIF / NIF / VAT',contacto:'Persona de contacto',telefono:'Teléfono',email:'Email',guardar:'Guardar',cancelar:'Cancelar',addVeh:'Añadir vehículo',vehLblMat:'Matrícula *',vehLblTipo:'Tipo vehículo',vehLblConductor:'Conductor',vehLblTel:'Teléfono',vehLblRemolque:'Remolque',vehLblPais:'País',tipoTrailer:'Trailer',tipoSemi:'Semiremolque',tipoCamion:'Camión',tipoFurgoneta:'Furgoneta',tipoOtro:'Otro',conRef:'Con referencia / booking',sinRef:'Sin referencia',refLbl:'Referencia (booking)',expositor:'Expositor',hallLbl:'Hall',standLbl:'Stand',fechaPrev:'Fecha prevista',horaEst:'Hora estimada',sinHoraFija:'Sin hora fija',descargaLbl:'Tipo descarga',sigAsignar:'✅ Asignar al evento',registrarSinRef:'✅ Registrar sin referencia',nrefVeh:'Vehículo *',nrefDesde:'Fecha inicio',nrefHasta:'Fecha fin',nrefMes:'Mes estimado',nrefAnio:'Año',nrefEvento:'Evento',incLbl1:'Avería / cambio camión',incLbl2:'Cambio conductor',incLbl3:'Cambio fecha/hora',incLbl4:'Cambio referencia',enviarIncBtn:'⚡ Enviar incidencia',firmRgpd:'Consentimiento RGPD',c1:'He leído y acepto el documento de protección de datos y consiento el tratamiento de datos de los conductores.',c2:'Confirmo que soy representante legal o apoderado de la empresa.',enviarOTP:'Enviar código de firma por email',confirmarFirma:'Confirmar firma',reenviar:'Reenviar',otpDesc:'Introduce el código de 6 dígitos enviado a tu email.',salirBtn:'Salir',sinVeh:'Sin vehículos registrados aún',sinPrerr:'Ningún vehículo asignado a este evento',estThMat:'Matrícula',estThHora:'Hora',estThRef:'Ref.',estThHall:'Hall/Stand',estThEstado:'Estado',verif:'Verificada',semi:'Semiverificada',bloq:'Bloqueada',espera:'En espera',parking:'En parking/rampa',dentro:'Dentro Fira',sinAsig:'Sin asignar',prerreg:'Preregistrado',confirm:'Confirmado',pend:'Pendiente',filtTodos:'Todos',filtFira:'Dentro Fira',filtPark:'Rampa/Parking',filtEspera:'En espera',filtNone:'Sin asignar',conRefTab:'Con referencia',sinRefTab:'Sin referencia',buscarVeh:'Buscar matrícula, conductor, remolque…',thMatricula:'Matrícula',thTipo:'Tipo',thConductor:'Conductor',thEstado:'Estado',thIncidencia:'Incidencia',mesEnero:'Enero',mesFebrero:'Febrero',mesMarzo:'Marzo',mesAbril:'Abril',mesMayo:'Mayo',mesJunio:'Junio',mesJulio:'Julio',mesAgosto:'Agosto',mesSeptiembre:'Septiembre',mesOctubre:'Octubre',mesNoviembre:'Noviembre',mesDiciembre:'Diciembre',prevImpacto:'Previsión impacto',syncOk:'🟢 Sincronizado',exito:'¡Registro completado!',exitoDesc:'Ya tienes acceso al portal.',scroll:'Desplázate hasta el final para poder aceptar',firmaReg:'Firma registrada',conserv:'Conservación hasta',idiomaDok:'Idioma documento',siguienteLbl:'Siguiente',backLbl:'Volver',descManual:'🤲 Manual',descForklift:'🏗 Maquinaria',buscar:'Buscar' },
  en:{ portalTitle:'Company Portal',miEmpresa:'My company',misVeh:'My vehicles',asigEvento:'Assign event',estadoVivo:'Live status',nombreEmp:'Company name',cifVat:'VAT / Tax ID',contacto:'Contact person',telefono:'Phone',email:'Email',guardar:'Save',cancelar:'Cancel',addVeh:'Add vehicle',vehLblMat:'Plate *',vehLblTipo:'Vehicle type',vehLblConductor:'Driver',vehLblTel:'Phone',vehLblRemolque:'Trailer',vehLblPais:'Country',tipoTrailer:'Trailer',tipoSemi:'Semi-trailer',tipoCamion:'Truck',tipoFurgoneta:'Van',tipoOtro:'Other',conRef:'With reference / booking',sinRef:'Without reference',refLbl:'Reference (booking)',expositor:'Exhibitor',hallLbl:'Hall',standLbl:'Stand',fechaPrev:'Planned date',horaEst:'Estimated time',sinHoraFija:'No fixed time',descargaLbl:'Unloading type',sigAsignar:'✅ Assign to event',registrarSinRef:'✅ Register without reference',nrefVeh:'Vehicle *',nrefDesde:'Start date',nrefHasta:'End date',nrefMes:'Estimated month',nrefAnio:'Year',nrefEvento:'Event',incLbl1:'Breakdown / truck change',incLbl2:'Driver change',incLbl3:'Date/time change',incLbl4:'Reference change',enviarIncBtn:'⚡ Send incident',firmRgpd:'GDPR Consent',c1:'I have read and accept the data protection document.',c2:'I confirm I am the legal representative of the company.',enviarOTP:'Send signing code by email',confirmarFirma:'Confirm signature',reenviar:'Resend',otpDesc:'Enter the 6-digit code sent to your email.',salirBtn:'Sign out',sinVeh:'No vehicles registered yet',sinPrerr:'No vehicles assigned to this event',estThMat:'Plate',estThHora:'Time',estThRef:'Ref.',estThHall:'Hall/Stand',estThEstado:'Status',verif:'Verified',semi:'Semi-verified',bloq:'Blocked',espera:'Waiting',parking:'At parking/ramp',dentro:'Inside',sinAsig:'Unassigned',prerreg:'Pre-registered',confirm:'Confirmed',pend:'Pending',filtTodos:'All',filtFira:'Inside',filtPark:'Ramp',filtEspera:'Waiting',filtNone:'Unassigned',conRefTab:'With reference',sinRefTab:'Without reference',buscarVeh:'Search plate, driver, trailer…',thMatricula:'Plate',thTipo:'Type',thConductor:'Driver',thEstado:'Status',thIncidencia:'Incident',mesEnero:'January',mesFebrero:'February',mesMarzo:'March',mesAbril:'April',mesMayo:'May',mesJunio:'June',mesJulio:'July',mesAgosto:'August',mesSeptiembre:'September',mesOctubre:'October',mesNoviembre:'November',mesDiciembre:'December',prevImpacto:'Impact forecast',syncOk:'🟢 Synced',exito:'Registration complete!',exitoDesc:'You now have access to the portal.',scroll:'Scroll to the end to accept',firmaReg:'Signature recorded',conserv:'Retention until',idiomaDok:'Document language',siguienteLbl:'Next',backLbl:'Back',descManual:'🤲 Handball',descForklift:'🏗 Forklift',buscar:'Search' },
  fr:{ portalTitle:'Portail Entreprises',miEmpresa:'Mon entreprise',misVeh:'Mes véhicules',asigEvento:'Assigner événement',estadoVivo:'État en direct',nombreEmp:'Nom entreprise',cifVat:'N° TVA / SIREN',contacto:'Personne de contact',telefono:'Téléphone',email:'Email',guardar:'Enregistrer',cancelar:'Annuler',addVeh:'Ajouter véhicule',vehLblMat:'Immatriculation *',vehLblTipo:'Type véhicule',vehLblConductor:'Chauffeur',vehLblTel:'Téléphone',vehLblRemolque:'Remorque',vehLblPais:'Pays',tipoTrailer:'Remorque',tipoSemi:'Semi-remorque',tipoCamion:'Camion',tipoFurgoneta:'Fourgon',tipoOtro:'Autre',conRef:'Avec référence / booking',sinRef:'Sans référence',refLbl:'Référence (booking)',expositor:'Exposant',hallLbl:'Hall',standLbl:'Stand',fechaPrev:'Date prévue',horaEst:'Heure estimée',sinHoraFija:'Sans heure fixe',descargaLbl:'Type déchargement',sigAsignar:"✅ Assigner à l'événement",registrarSinRef:'✅ Enregistrer sans référence',nrefVeh:'Véhicule *',nrefDesde:'Date début',nrefHasta:'Date fin',nrefMes:'Mois estimé',nrefAnio:'Année',nrefEvento:'Événement',incLbl1:'Panne / changement camion',incLbl2:'Changement chauffeur',incLbl3:'Changement date/heure',incLbl4:'Changement référence',enviarIncBtn:'⚡ Envoyer incident',firmRgpd:'Consentement RGPD',c1:"J'ai lu et accepte le document de protection des données.",c2:"Je confirme être le représentant légal de l'entreprise.",enviarOTP:'Envoyer le code par email',confirmarFirma:'Confirmer la signature',reenviar:'Renvoyer',otpDesc:'Saisissez le code à 6 chiffres envoyé à votre email.',salirBtn:'Déconnexion',sinVeh:'Aucun véhicule enregistré',sinPrerr:'Aucun véhicule assigné',estThMat:'Immatriculation',estThHora:'Heure',estThRef:'Réf.',estThHall:'Hall/Stand',estThEstado:'Statut',verif:'Vérifiée',semi:'Semi-vérifiée',bloq:'Bloquée',espera:'En attente',parking:'Au parking/rampe',dentro:'Dans la Fira',sinAsig:'Non assigné',prerreg:'Préenregistré',confirm:'Confirmé',pend:'En attente',filtTodos:'Tous',filtFira:'Dans la Fira',filtPark:'Rampe',filtEspera:'Attente',filtNone:'Non assigné',conRefTab:'Avec référence',sinRefTab:'Sans référence',buscarVeh:'Rechercher…',thMatricula:'Immatriculation',thTipo:'Type',thConductor:'Chauffeur',thEstado:'Statut',thIncidencia:'Incident',mesEnero:'Janvier',mesFebrero:'Février',mesMarzo:'Mars',mesAbril:'Avril',mesMayo:'Mai',mesJunio:'Juin',mesJulio:'Juillet',mesAgosto:'Août',mesSeptiembre:'Septembre',mesOctubre:'Octobre',mesNoviembre:'Novembre',mesDiciembre:'Décembre',prevImpacto:'Prévision impact',syncOk:'🟢 Synchronisé',exito:'Inscription terminée !',exitoDesc:'Vous avez accès au portail.',scroll:"Faites défiler jusqu'à la fin",firmaReg:'Signature enregistrée',conserv:"Conservation jusqu'au",idiomaDok:'Langue document',siguienteLbl:'Suivant',backLbl:'Retour',descManual:'🤲 Manuel',descForklift:'🏗 Chariot',buscar:'Rechercher' },
  de:{ portalTitle:'Unternehmensportal',miEmpresa:'Mein Unternehmen',misVeh:'Meine Fahrzeuge',asigEvento:'Veranstaltung zuweisen',estadoVivo:'Live-Status',nombreEmp:'Firmenname',cifVat:'USt-IdNr.',contacto:'Ansprechpartner',telefono:'Telefon',email:'E-Mail',guardar:'Speichern',cancelar:'Abbrechen',addVeh:'Fahrzeug hinzufügen',vehLblMat:'Kennzeichen *',vehLblTipo:'Fahrzeugtyp',vehLblConductor:'Fahrer',vehLblTel:'Telefon',vehLblRemolque:'Anhänger',vehLblPais:'Land',tipoTrailer:'Trailer',tipoSemi:'Sattelauflieger',tipoCamion:'LKW',tipoFurgoneta:'Transporter',tipoOtro:'Sonstiges',conRef:'Mit Referenz / Buchung',sinRef:'Ohne Referenz',refLbl:'Referenz (Buchung)',expositor:'Aussteller',hallLbl:'Halle',standLbl:'Stand',fechaPrev:'Geplantes Datum',horaEst:'Geschätzte Zeit',sinHoraFija:'Keine feste Zeit',descargaLbl:'Entladungstyp',sigAsignar:'✅ Veranstaltung zuweisen',registrarSinRef:'✅ Ohne Referenz registrieren',nrefVeh:'Fahrzeug *',nrefDesde:'Startdatum',nrefHasta:'Enddatum',nrefMes:'Geschätzter Monat',nrefAnio:'Jahr',nrefEvento:'Veranstaltung',incLbl1:'Panne / LKW-Wechsel',incLbl2:'Fahrerwechsel',incLbl3:'Datum/Uhrzeit ändern',incLbl4:'Referenz ändern',enviarIncBtn:'⚡ Vorfall senden',firmRgpd:'DSGVO-Einwilligung',c1:'Ich habe das Datenschutzdokument gelesen und akzeptiere es.',c2:'Ich bestätige, dass ich der gesetzliche Vertreter bin.',enviarOTP:'Signaturcode per E-Mail senden',confirmarFirma:'Unterschrift bestätigen',reenviar:'Erneut senden',otpDesc:'Geben Sie den 6-stelligen Code ein.',salirBtn:'Abmelden',sinVeh:'Noch keine Fahrzeuge',sinPrerr:'Keine Fahrzeuge dieser Veranstaltung',estThMat:'Kennzeichen',estThHora:'Zeit',estThRef:'Ref.',estThHall:'Halle/Stand',estThEstado:'Status',verif:'Verifiziert',semi:'Teilverifiziert',bloq:'Gesperrt',espera:'Wartend',parking:'Auf Parkplatz/Rampe',dentro:'In der Fira',sinAsig:'Nicht zugewiesen',prerreg:'Vorregistriert',confirm:'Bestätigt',pend:'Ausstehend',filtTodos:'Alle',filtFira:'In der Fira',filtPark:'Rampe',filtEspera:'Wartend',filtNone:'Nicht zugewiesen',conRefTab:'Mit Referenz',sinRefTab:'Ohne Referenz',buscarVeh:'Suchen…',thMatricula:'Kennzeichen',thTipo:'Typ',thConductor:'Fahrer',thEstado:'Status',thIncidencia:'Vorfall',mesEnero:'Januar',mesFebrero:'Februar',mesMarzo:'März',mesAbril:'April',mesMayo:'Mai',mesJunio:'Juni',mesJulio:'Juli',mesAgosto:'August',mesSeptiembre:'September',mesOctubre:'Oktober',mesNoviembre:'November',mesDiciembre:'Dezember',prevImpacto:'Auswirkungsprognose',syncOk:'🟢 Synchronisiert',exito:'Registrierung abgeschlossen!',exitoDesc:'Sie haben Zugang zum Portal.',scroll:'Scrollen Sie bis zum Ende',firmaReg:'Unterschrift erfasst',conserv:'Aufbewahrung bis',idiomaDok:'Dokumentsprache',siguienteLbl:'Weiter',backLbl:'Zurück',descManual:'🤲 Handbetrieb',descForklift:'🏗 Gabelstapler',buscar:'Suchen' },
  it:{ portalTitle:'Portale Aziende',miEmpresa:'La mia azienda',misVeh:'I miei veicoli',asigEvento:'Assegna evento',estadoVivo:'Stato in diretta',nombreEmp:'Nome azienda',cifVat:'P.IVA',contacto:'Contatto',telefono:'Telefono',email:'Email',guardar:'Salva',cancelar:'Annulla',addVeh:'Aggiungi veicolo',vehLblMat:'Targa *',vehLblTipo:'Tipo veicolo',vehLblConductor:'Autista',vehLblTel:'Telefono',vehLblRemolque:'Rimorchio',vehLblPais:'Paese',tipoTrailer:'Rimorchio',tipoSemi:'Semirimorchio',tipoCamion:'Camion',tipoFurgoneta:'Furgone',tipoOtro:'Altro',conRef:'Con riferimento',sinRef:'Senza riferimento',refLbl:'Riferimento',expositor:'Espositore',hallLbl:'Padiglione',standLbl:'Stand',fechaPrev:'Data prevista',horaEst:'Ora stimata',sinHoraFija:'Senza ora fissa',descargaLbl:'Tipo scarico',sigAsignar:"✅ Assegna all'evento",registrarSinRef:'✅ Senza riferimento',nrefVeh:'Veicolo *',nrefDesde:'Data inizio',nrefHasta:'Data fine',nrefMes:'Mese stimato',nrefAnio:'Anno',nrefEvento:'Evento',incLbl1:'Guasto / cambio camion',incLbl2:'Cambio autista',incLbl3:'Cambio data/ora',incLbl4:'Cambio riferimento',enviarIncBtn:'⚡ Invia incidente',firmRgpd:'Consenso GDPR',c1:'Ho letto e accetto il documento.',c2:'Confermo di essere il rappresentante legale.',enviarOTP:'Invia codice via email',confirmarFirma:'Conferma firma',reenviar:'Reinvia',otpDesc:'Inserisci il codice a 6 cifre.',salirBtn:'Esci',sinVeh:'Nessun veicolo',sinPrerr:'Nessun veicolo assegnato',estThMat:'Targa',estThHora:'Ora',estThRef:'Rif.',estThHall:'Pad./Stand',estThEstado:'Stato',verif:'Verificata',semi:'Semi-verificata',bloq:'Bloccata',espera:'In attesa',parking:'Al parcheggio',dentro:'Dentro',sinAsig:'Non assegnato',prerreg:'Pre-registrato',confirm:'Confermato',pend:'In attesa',filtTodos:'Tutti',filtFira:'Dentro',filtPark:'Rampa',filtEspera:'Attesa',filtNone:'Non assegnato',conRefTab:'Con rif.',sinRefTab:'Senza rif.',buscarVeh:'Cerca…',thMatricula:'Targa',thTipo:'Tipo',thConductor:'Autista',thEstado:'Stato',thIncidencia:'Incidente',mesEnero:'Gennaio',mesFebrero:'Febbraio',mesMarzo:'Marzo',mesAbril:'Aprile',mesMayo:'Maggio',mesJunio:'Giugno',mesJulio:'Luglio',mesAgosto:'Agosto',mesSeptiembre:'Settembre',mesOctubre:'Ottobre',mesNoviembre:'Novembre',mesDiciembre:'Dicembre',prevImpacto:'Previsione impatto',syncOk:'🟢 Sincronizzato',exito:'Registrazione completata!',exitoDesc:'Hai accesso al portale.',scroll:'Scorri fino in fondo',firmaReg:'Firma registrata',conserv:'Conservazione fino al',idiomaDok:'Lingua documento',siguienteLbl:'Avanti',backLbl:'Indietro',descManual:'🤲 Manuale',descForklift:'🏗 Carrello',buscar:'Cerca' },
  pt:{ portalTitle:'Portal Empresas',miEmpresa:'Minha empresa',misVeh:'Meus veículos',asigEvento:'Atribuir evento',estadoVivo:'Estado ao vivo',nombreEmp:'Nome empresa',cifVat:'NIF / NIPC',contacto:'Contacto',telefono:'Telefone',email:'Email',guardar:'Guardar',cancelar:'Cancelar',addVeh:'Adicionar veículo',vehLblMat:'Matrícula *',vehLblTipo:'Tipo veículo',vehLblConductor:'Condutor',vehLblTel:'Telefone',vehLblRemolque:'Reboque',vehLblPais:'País',tipoTrailer:'Reboque',tipoSemi:'Semi-reboque',tipoCamion:'Caminhão',tipoFurgoneta:'Carrinha',tipoOtro:'Outro',conRef:'Com referência',sinRef:'Sem referência',refLbl:'Referência',expositor:'Expositor',hallLbl:'Pavilhão',standLbl:'Stand',fechaPrev:'Data prevista',horaEst:'Hora estimada',sinHoraFija:'Sem hora fixa',descargaLbl:'Tipo descarga',sigAsignar:'✅ Atribuir ao evento',registrarSinRef:'✅ Registar sem referência',nrefVeh:'Veículo *',nrefDesde:'Data início',nrefHasta:'Data fim',nrefMes:'Mês estimado',nrefAnio:'Ano',nrefEvento:'Evento',incLbl1:'Avaria / troca de camião',incLbl2:'Troca de condutor',incLbl3:'Alteração de data/hora',incLbl4:'Alteração de referência',enviarIncBtn:'⚡ Enviar incidente',firmRgpd:'Consentimento RGPD',c1:'Li e aceito o documento.',c2:'Confirmo ser representante legal.',enviarOTP:'Enviar código por email',confirmarFirma:'Confirmar assinatura',reenviar:'Reenviar',otpDesc:'Introduza o código de 6 dígitos.',salirBtn:'Sair',sinVeh:'Sem veículos',sinPrerr:'Sem veículos atribuídos',estThMat:'Matrícula',estThHora:'Hora',estThRef:'Ref.',estThHall:'Pavilhão/Stand',estThEstado:'Estado',verif:'Verificada',semi:'Semi-verificada',bloq:'Bloqueada',espera:'Em espera',parking:'No parque',dentro:'Dentro',sinAsig:'Não atribuído',prerreg:'Pré-registado',confirm:'Confirmado',pend:'Pendente',filtTodos:'Todos',filtFira:'Dentro',filtPark:'Rampa',filtEspera:'Espera',filtNone:'Não atribuído',conRefTab:'Com ref.',sinRefTab:'Sem ref.',buscarVeh:'Pesquisar…',thMatricula:'Matrícula',thTipo:'Tipo',thConductor:'Condutor',thEstado:'Estado',thIncidencia:'Incidente',mesEnero:'Janeiro',mesFebrero:'Fevereiro',mesMarzo:'Março',mesAbril:'Abril',mesMayo:'Maio',mesJunio:'Junho',mesJulio:'Julho',mesAgosto:'Agosto',mesSeptiembre:'Setembro',mesOctubre:'Outubro',mesNoviembre:'Novembro',mesDiciembre:'Dezembro',prevImpacto:'Previsão impacto',syncOk:'🟢 Sincronizado',exito:'Registo concluído!',exitoDesc:'Tem acesso ao portal.',scroll:'Role até ao final',firmaReg:'Assinatura registada',conserv:'Conservação até',idiomaDok:'Idioma documento',siguienteLbl:'Seguinte',backLbl:'Voltar',descManual:'🤲 Manual',descForklift:'🏗 Empilhadora',buscar:'Pesquisar' },
};

function t(key) {
  const lang = _lang();
  return (PI18N[lang] && PI18N[lang][key]) || (PI18N.es && PI18N.es[key]) || key;
}

// ─── STATE ────────────────────────────────────────────────────────────
let _empresa      = null;   // empresa doc from Firestore
let _vehiculos    = [];     // company vehicles
let _preregistros = [];     // preregistros for active event
let _eventos      = [];     // available events
let _consentimiento = null; // RGPD consent doc
let _curTab       = 'empresa';
let _liveInterval = null;
let _filtVeh      = '';     // vehicle search filter
let _filtEstado   = '';     // live status filter
let _preSubTab    = 'conRef'; // 'conRef' | 'sinRef'
let _otpHash      = null;
let _syncStatus   = 'ok';

const MESES = ['mesEnero','mesFebrero','mesMarzo','mesAbril','mesMayo','mesJunio','mesJulio','mesAgosto','mesSeptiembre','mesOctubre','mesNoviembre','mesDiciembre'];

function _lang() { return AppState.get('currentLang') || 'es'; }
function _user() { return AppState.get('currentUser'); }

// ─── ENTRY POINT ─────────────────────────────────────────────────────
export async function initPortal() {
  const user = _user();
  if (!user || user.rol !== 'empresa') { logout(); return; }

  _renderShell();
  await _loadData();
  _renderTab('empresa');

  // Polling for live status (no persistent listener)
  _liveInterval = setInterval(_pollLiveStatus, 60000);
}

// ─── DATA LOAD ────────────────────────────────────────────────────────
async function _loadData() {
  const user = _user();
  try {
    // Load company profile
    const empId = user.empresaId || user.id;
    _empresa = await fsGet(`companies/${empId}`);
    if (!_empresa) {
      _empresa = { id: empId, nombre: user.nombre || '', email: user.email || '', vehiculos: [], nivel: 'semi', cif: '', contacto: '', tel: '' };
      await fsSet(`companies/${empId}`, _empresa, false);
    }
    // Load vehicles
    _vehiculos = await fsGetAll(`companies/${empId}/vehicles`);
    // Load available events
    _eventos = await fsGetAll('events');
    // Load preregistros for active event
    const activeEv = _eventos.find(e => e.id === (await fsGet('config/activeEvent'))?.id);
    if (activeEv) {
      _preregistros = await fsGetAll(`events/${activeEv.id}/preregistros`).then(all => all.filter(p => p.empresaId === empId));
    }
    // Load consent
    const consents = await fsGetAll(`companies/${empId}/consentimientos`);
    _consentimiento = consents.length ? consents[consents.length - 1] : null;
  } catch(e) { console.warn('[portal] loadData', e); }
}

async function _saveEmpresa() {
  try {
    await fsSet(`companies/${_empresa.id}`, _empresa, false);
    _setSyncStatus('ok');
  } catch(e) { _setSyncStatus('error'); }
}

async function _saveVehiculo(v) {
  try {
    await fsSet(`companies/${_empresa.id}/vehicles/${v.id}`, v, false);
    _setSyncStatus('ok');
  } catch(e) { _setSyncStatus('error'); }
}

async function _savePreregistro(p) {
  const evId = _getActiveEventId();
  if (!evId) return;
  try {
    await fsSet(`events/${evId}/preregistros/${p.id}`, p, false);
    _setSyncStatus('ok');
  } catch(e) { _setSyncStatus('error'); }
}

function _getActiveEventId() {
  return _eventos.find(e => e.activo)?.id || _eventos[0]?.id || null;
}

function _setSyncStatus(s) {
  _syncStatus = s;
  const el = document.getElementById('pSyncStatus');
  if (el) el.textContent = s === 'ok' ? t('syncOk') : '🔴 Error';
}

async function _pollLiveStatus() {
  const evId = _getActiveEventId();
  if (!evId || !_empresa) return;
  try {
    const fresh = await fsGetAll(`events/${evId}/preregistros`);
    _preregistros = fresh.filter(p => p.empresaId === _empresa.id);
    if (_curTab === 'estado') _renderEstado();
    _setSyncStatus('ok');
  } catch(e) { _setSyncStatus('error'); }
}

// ─── SHELL ────────────────────────────────────────────────────────────
function _renderShell() {
  const user = _user();
  const LANGS = ['es','en','fr','de','it','pt','pl','ro','nl'];

  document.body.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--teal:#0d9f6e;--r:6px;--r2:10px}
body{font-family:'Inter',system-ui,sans-serif;font-size:13px;background:var(--bg);color:var(--text);min-height:100vh;-webkit-font-smoothing:antialiased}
input,select,textarea{font-family:inherit;font-size:13px;outline:none;padding:7px 10px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg2);color:var(--text)}
input:focus,select:focus,textarea:focus{border-color:var(--blue)}
textarea{resize:vertical}
button{cursor:pointer;border:none;border-radius:var(--r);font-weight:600;font-family:inherit;display:inline-flex;align-items:center;gap:5px;justify-content:center;transition:all .15s;white-space:nowrap}
button:disabled{opacity:.4;cursor:not-allowed}
.btn{padding:7px 16px;font-size:13px;border-radius:20px}
.btn-sm{padding:5px 12px;font-size:12px;border-radius:20px}
.btn-xs{padding:3px 9px;font-size:11px;border-radius:20px}
.btn-p{background:#2563eb;color:#fff}.btn-p:hover{background:#1d4ed8}
.btn-s{background:var(--green);color:#fff}.btn-s:hover{background:#0a8a5e}
.btn-gh{background:var(--bg2);color:var(--text2);border:1px solid var(--border)}.btn-gh:hover{background:var(--bg3)}
.btn-r{background:#fee2e2;color:#dc2626;border:1px solid #fecaca}
/* Header */
#pHdr{display:flex;align-items:center;gap:8px;padding:0 16px;height:50px;background:#0f172a;flex-shrink:0;position:sticky;top:0;z-index:100}
/* Tabs */
#pTabs{display:flex;align-items:center;gap:2px;padding:0 8px;background:var(--bg2);border-bottom:2px solid var(--border);overflow-x:auto;scrollbar-width:none}
.p-tab{padding:12px 14px;font-size:12px;font-weight:600;color:var(--text3);border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:5px;margin-bottom:-2px;transition:all .15s}
.p-tab:hover{color:var(--text);border-bottom-color:var(--border)}
.p-tab.active{color:var(--blue);border-bottom-color:var(--blue);font-weight:700}
/* Body */
#pBody{max-width:900px;margin:0 auto;padding:20px 16px}
/* Cards */
.p-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.p-card-title{font-size:16px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px}
/* Form grid */
.fg{margin-bottom:12px}.fg label{display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px}
.fg input,.fg select,.fg textarea{width:100%}
.sg2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sg3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
/* Vehicle cards */
.veh-card{border:1.5px solid var(--border);border-radius:var(--r2);padding:12px 14px;display:flex;align-items:flex-start;gap:10px;background:var(--bg2);transition:border-color .15s}
.veh-card:hover{border-color:var(--blue)}
.mchip{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:6px;padding:3px 9px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700}
.mchip-sm{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:4px;padding:1px 6px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700}
/* Status badges */
.sbadge{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700}
/* Status colors */
.st-verif{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.st-semi{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.st-bloq{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.st-fira{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.st-park{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.st-esp{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.st-none{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite;margin-right:3px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
/* Tables */
.tbl-wrap{overflow-x:auto;border-radius:var(--r2);border:1px solid var(--border)}
.dtbl{width:100%;border-collapse:collapse;font-size:12px}
.dtbl thead{background:var(--bg3)}
.dtbl th{padding:8px 10px;font-weight:700;font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;border-bottom:1.5px solid var(--border);text-align:left;white-space:nowrap}
.dtbl td{padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
.dtbl tbody tr:hover{background:var(--bg3)}
.dtbl tbody tr:last-child td{border-bottom:none}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{background:var(--bg2);border-radius:var(--r2);padding:24px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.15)}
.modal-hdr{display:flex;align-items:center;margin-bottom:16px}
/* Empty */
.empty{display:flex;flex-direction:column;align-items:center;padding:48px 20px;color:var(--text3);text-align:center}
.empty-ico{font-size:48px;margin-bottom:8px}
.empty-txt{font-size:16px;font-weight:700}
/* RGPD */
.rgpd-body{max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);padding:12px;background:var(--bg3);font-size:12px;line-height:1.6;color:var(--text2);margin-bottom:12px}
@media (max-width:640px){.sg2,.sg3{grid-template-columns:1fr}}
</style>

<div id="pHdr">
  <svg viewBox="0 0 140 140" width="26" height="26" style="flex-shrink:0">
    <rect width="140" height="140" rx="28" fill="#030812"/>
    <polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/>
    <circle cx="70" cy="70" r="9" fill="#00ffc8"/>
  </svg>
  <span style="font-family:monospace;font-size:15px;font-weight:700;color:#fff"><span style="color:#00ffc8">Be</span>Unify<span style="color:#00ffc8">T</span></span>
  <span style="background:rgba(0,255,200,.15);border:1px solid rgba(0,255,200,.3);color:#00ffc8;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-left:4px">🏢 Portal</span>
  <span style="flex:1"></span>
  <span id="pSyncStatus" style="font-size:11px;color:#94a3b8;margin-right:6px"></span>
  <span style="font-size:12px;font-weight:600;color:#e2e8f0;margin-right:8px">${esc(user?.nombre || '')}</span>
  <!-- Lang picker -->
  <div style="position:relative">
    <button style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#e2e8f0;border-radius:20px;padding:4px 10px;font-size:11px" id="pLangBtn" onclick="document.getElementById('pLangMenu').style.display=document.getElementById('pLangMenu').style.display==='none'?'block':'none'">
      🌐 <span id="pLangCode">${_lang().toUpperCase()}</span> ▾
    </button>
    <div id="pLangMenu" style="display:none;position:absolute;right:0;top:calc(100% + 4px);background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px;z-index:9999;min-width:130px;box-shadow:0 8px 24px #0008">
      ${LANGS.map(l => `<div onclick="window._portal.setLang('${l}')" style="padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:#e2e8f0;hover:background:#334155">${l.toUpperCase()}</div>`).join('')}
    </div>
  </div>
  <button class="btn btn-xs" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#e2e8f0;margin-left:8px" onclick="window._portal.handleLogout()">→ ${t('salirBtn')}</button>
</div>

<div id="pTabs">
  <div class="p-tab active" id="pt-empresa" onclick="window._portal.goTab('empresa')">🏢 <span>${t('miEmpresa')}</span></div>
  <div class="p-tab" id="pt-vehiculos" onclick="window._portal.goTab('vehiculos')">🚛 <span>${t('misVeh')}</span></div>
  <div class="p-tab" id="pt-asig" onclick="window._portal.goTab('asig')">📅 <span>${t('asigEvento')}</span></div>
  <div class="p-tab" id="pt-estado" onclick="window._portal.goTab('estado')"><span class="live"></span><span>${t('estadoVivo')}</span></div>
</div>

<div id="pBody"></div>
<div id="pModalContainer"></div>
`;
  window._portal = _api;
}

// ─── TAB ROUTING ──────────────────────────────────────────────────────
function _renderTab(tab) {
  _curTab = tab;
  document.querySelectorAll('.p-tab').forEach(t => t.classList.remove('active'));
  const btn = document.getElementById('pt-' + (tab === 'asig' ? 'asig' : tab));
  if (btn) btn.classList.add('active');
  const body = document.getElementById('pBody'); if (!body) return;
  if      (tab === 'empresa')   _renderEmpresa(body);
  else if (tab === 'vehiculos') _renderVehiculos(body);
  else if (tab === 'asig')      _renderAsigEvento(body);
  else if (tab === 'estado')    _renderEstado();
}

// ─── TAB: MI EMPRESA ─────────────────────────────────────────────────
function _renderEmpresa(body) {
  if (!body) return;
  const emp = _empresa || {};
  const con = _consentimiento;
  const nBadge = emp.nivel === 'verified'
    ? `<span class="sbadge st-verif">✓ ${t('verif')}</span>`
    : emp.nivel === 'blocked'
    ? `<span class="sbadge st-bloq">✕ ${t('bloq')}</span>`
    : `<span class="sbadge st-semi">~ ${t('semi')}</span>`;

  body.innerHTML = `
<div class="p-card">
  <div class="p-card-title">🏢 ${t('miEmpresa')} ${nBadge}</div>
  <div class="sg2">
    <div class="fg"><label>${t('nombreEmp')}</label><input id="pNom" value="${esc(emp.nombre||'')}" oninput="_pDirty=true"></div>
    <div class="fg"><label>${t('cifVat')}</label><input id="pCif" value="${esc(emp.cif||'')}" oninput="_pDirty=true"></div>
    <div class="fg"><label>${t('contacto')}</label><input id="pCont" value="${esc(emp.contacto||'')}" oninput="_pDirty=true"></div>
    <div class="fg"><label>${t('telefono')}</label><input id="pTel" value="${esc(emp.tel||'')}" oninput="_pDirty=true"></div>
    <div class="fg"><label>${t('email')}</label><input id="pEmail" type="email" value="${esc(emp.email||'')}" oninput="_pDirty=true"></div>
    <div class="fg"><label>Web / LinkedIn</label><input id="pWeb" value="${esc(emp.web||'')}" oninput="_pDirty=true"></div>
  </div>
  <div class="fg"><label>Tipo empresa</label>
    <select id="pTipo" oninput="_pDirty=true">
      <option value="expositor" ${emp.tipo==='expositor'?'selected':''}>Expositor</option>
      <option value="montador" ${emp.tipo==='montador'?'selected':''}>Montador</option>
      <option value="transportista" ${emp.tipo==='transportista'?'selected':''}>Transportista</option>
      <option value="otro" ${emp.tipo==='otro'?'selected':''}>Otro</option>
    </select>
  </div>
  <button class="btn btn-p" onclick="window._portal.saveEmpresa()">💾 ${t('guardar')}</button>
</div>

<div class="p-card">
  <div class="p-card-title">🛡 ${t('firmRgpd')}</div>
  ${con
    ? `<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r2)">
        <span style="font-size:24px">✅</span>
        <div><div style="font-weight:700;color:var(--green)">${t('firmaReg')}</div>
        <div style="font-size:11px;color:var(--text3)">${t('conserv')}: ${fmt(con.conservaHasta)} · ${t('idiomaDok')}: ${(con.lang||'es').toUpperCase()}</div></div>
      </div>`
    : `<div style="padding:12px 16px;background:var(--all);border:1px solid #fde68a;border-radius:var(--r2);margin-bottom:12px;font-size:12px;color:var(--amber)">
        ⚠️ Consentimiento RGPD pendiente. Necesario para preregistrar vehículos.
      </div>
      <button class="btn btn-p" onclick="window._portal.openRGPD()">📋 Firmar consentimiento RGPD</button>`
  }
</div>`;
  window._pDirty = false;
}

// ─── TAB: MIS VEHÍCULOS ───────────────────────────────────────────────
function _renderVehiculos(body) {
  if (!body) body = document.getElementById('pBody');
  const q = _filtVeh.toLowerCase();
  const vehs = _vehiculos.filter(v =>
    !q || `${v.matricula} ${v.conductor||''} ${v.tel||''} ${v.remolque||''} ${v.empresa||''}`.toLowerCase().includes(q)
  );

  body.innerHTML = `
<div class="p-card">
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
    <div style="font-size:16px;font-weight:800">${t('misVeh')} (${_vehiculos.length})</div>
    <span style="flex:1"></span>
    <div style="display:flex;align-items:center;gap:5px;background:var(--bg3);border:1.5px solid var(--border2);border-radius:20px;padding:4px 12px">
      <span style="opacity:.5;font-size:14px">🔍</span>
      <input type="text" placeholder="${t('buscarVeh')}" value="${esc(_filtVeh)}" oninput="window._filtVeh=this.value;window._portal.goTab('vehiculos')" style="border:none;background:transparent;font-size:12px;min-width:200px">
    </div>
    <button class="btn btn-p btn-sm" onclick="window._portal.openVehModal(null)">+ ${t('addVeh')}</button>
  </div>
  ${vehs.length === 0
    ? `<div class="empty"><div class="empty-ico">🚛</div><div class="empty-txt">${t('sinVeh')}</div></div>`
    : `<div style="display:flex;flex-direction:column;gap:8px">${vehs.map(v => _vehCard(v)).join('')}</div>`
  }
</div>`;
  window._filtVeh = _filtVeh;
}

function _vehCard(v) {
  const tipoLabel = { trailer:t('tipoTrailer'), semiremolque:t('tipoSemi'), camion:t('tipoCamion'), furgoneta:t('tipoFurgoneta'), otro:t('tipoOtro') }[v.tipo] || (v.tipo || '—');
  const pre = _preregistros.find(p => p.vehId === v.id);
  return `
<div class="veh-card">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
      <span class="mchip">${esc(v.matricula)}</span>
      <span style="font-size:11px;color:var(--text3);font-weight:600">${tipoLabel}</span>
      ${v.pais ? `<span style="font-size:11px;color:var(--text3)">${esc(v.pais)}</span>` : ''}
      ${pre ? `<span class="sbadge st-verif" style="font-size:10px">✓ Preregistrado</span>` : ''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--text2)">
      ${v.conductor ? `<span>👤 ${esc(v.conductor)}</span>` : ''}
      ${v.tel ? `<span>📱 ${esc(v.tel)}</span>` : ''}
      ${v.remolque ? `<span>🚛 ${esc(v.remolque)}</span>` : ''}
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
    <button class="btn btn-gh btn-xs" onclick="window._portal.openVehModal('${v.id}')">✏️</button>
    <button class="btn btn-xs btn-r" onclick="window._portal.deleteVehiculo('${v.id}')">🗑</button>
    <button class="btn btn-xs" style="background:var(--bll);color:var(--blue);border:1px solid #bfdbfe" onclick="window._portal.openIncidencia('${v.id}')">⚡ Inc.</button>
  </div>
</div>`;
}

// ─── TAB: ASIGNAR EVENTO ─────────────────────────────────────────────
function _renderAsigEvento(body) {
  if (!body) body = document.getElementById('pBody');
  const evs = _eventos;
  const activeEvId = _getActiveEventId();
  const activeEv = evs.find(e => e.id === activeEvId);

  // Pre-check RGPD
  if (!_consentimiento) {
    body.innerHTML = `<div class="p-card"><div class="p-card-title">⚠️ RGPD Requerido</div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Antes de registrar vehículos necesitas firmar el consentimiento RGPD.</p>
      <button class="btn btn-p" onclick="window._portal.goTab('empresa');setTimeout(()=>window._portal.openRGPD(),200)">Firmar RGPD →</button></div>`;
    return;
  }

  if (!evs.length) {
    body.innerHTML = `<div class="empty"><div class="empty-ico">📅</div><div class="empty-txt">Sin eventos disponibles</div></div>`;
    return;
  }

  // Subtabs: con ref / sin ref
  body.innerHTML = `
<div class="p-card">
  <div class="p-card-title">📅 ${t('asigEvento')}</div>
  ${activeEv ? `<div style="padding:8px 14px;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);margin-bottom:16px;font-size:13px;font-weight:600;color:var(--green)">
    <span class="live"></span>${activeEv.ico||'📋'} ${esc(activeEv.nombre)} ${activeEv.ini?'· '+activeEv.ini:''}
  </div>` : ''}

  <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:16px">
    <div style="padding:6px 16px;font-size:12px;font-weight:700;cursor:pointer;background:${_preSubTab==='conRef'?'#2563eb':'var(--bg2)'};color:${_preSubTab==='conRef'?'#fff':'var(--text3)'}" onclick="window._portal.setPreSubTab('conRef')">📋 ${t('conRefTab')}</div>
    <div style="padding:6px 16px;font-size:12px;font-weight:700;cursor:pointer;background:${_preSubTab==='sinRef'?'#2563eb':'var(--bg2)'};color:${_preSubTab==='sinRef'?'#fff':'var(--text3)'}" onclick="window._portal.setPreSubTab('sinRef')">🚚 ${t('sinRefTab')}</div>
  </div>

  <div id="asigContent">${_buildAsigContent()}</div>
</div>`;
}

function _buildAsigContent() {
  if (_preSubTab === 'conRef') return _buildFormConRef();
  return _buildFormSinRef();
}

function _buildFormConRef() {
  const vehs = _vehiculos;
  if (!vehs.length) return `<div class="empty"><div class="empty-ico">🚛</div><div class="empty-txt">${t('sinVeh')}</div><button class="btn btn-p" style="margin-top:12px" onclick="window._portal.goTab('vehiculos')">+ ${t('addVeh')}</button></div>`;
  return `
<div style="font-size:12px;color:var(--text3);margin-bottom:12px;padding:8px 12px;background:var(--bll);border-radius:var(--r)">${t('conRef')} — ${t('conRefSub')||'Hall, stand y referencia asignados'}</div>
<div class="sg2">
  <div class="fg"><label>${t('nrefVeh')}</label>
    <select id="aVeh" style="width:100%"><option value="">— ${t('nrefVeh')} —</option>
      ${vehs.map(v=>`<option value="${v.id}">${esc(v.matricula)} · ${esc(v.conductor||'')}</option>`).join('')}
    </select>
  </div>
  <div class="fg"><label>${t('refLbl')}</label><input id="aRef" placeholder="REF-001234"></div>
  <div class="fg"><label>${t('expositor')}</label><input id="aExpo"></div>
  <div class="fg"><label>${t('hallLbl')}</label><input id="aHall" placeholder="5A"></div>
  <div class="fg"><label>${t('standLbl')}</label><input id="aStand" placeholder="B-200"></div>
  <div class="fg"><label>${t('fechaPrev')}</label><input id="aFecha" type="date"></div>
  <div class="fg"><label>${t('horaEst')}</label><input id="aHora" type="time"></div>
  <div class="fg"><label>${t('descargaLbl')}</label>
    <select id="aDesc"><option value="mano">${t('descManual')}</option><option value="maquinaria">${t('descForklift')}</option></select>
  </div>
</div>
<button class="btn btn-s" onclick="window._portal.savePreregistro('conRef')">${t('sigAsignar')}</button>`;
}

function _buildFormSinRef() {
  const vehs = _vehiculos;
  const meses = MESES.map((m, i) => `<option value="${i+1}">${t(m)}</option>`).join('');
  const yr = new Date().getFullYear();
  if (!vehs.length) return `<div class="empty"><div class="empty-ico">🚛</div><div class="empty-txt">${t('sinVeh')}</div><button class="btn btn-p" style="margin-top:12px" onclick="window._portal.goTab('vehiculos')">+ ${t('addVeh')}</button></div>`;
  return `
<div style="font-size:12px;color:var(--text3);margin-bottom:12px;padding:8px 12px;background:var(--bg3);border-radius:var(--r)">${t('sinRef')} — ${t('sinRefCardSub')||'Acceso libre · asigna período estimado'}</div>
<div class="sg2">
  <div class="fg"><label>${t('nrefVeh')}</label>
    <select id="srVeh" style="width:100%"><option value="">— ${t('nrefVeh')} —</option>
      ${vehs.map(v=>`<option value="${v.id}">${esc(v.matricula)} · ${esc(v.conductor||'')}</option>`).join('')}
    </select>
  </div>
  <div class="fg"><label>${t('hallLbl')}</label><input id="srHall" placeholder="5A"></div>
  <div class="fg"><label>${t('standLbl')}</label><input id="srStand"></div>
  <div class="fg"><label>${t('nrefDesde')}</label><input id="srDesde" type="date"></div>
  <div class="fg"><label>${t('nrefHasta')}</label><input id="srHasta" type="date"></div>
  <div class="fg"><label>${t('nrefMes')}</label>
    <select id="srMes" style="width:100%"><option value="">—</option>${meses}</select>
  </div>
  <div class="fg"><label>${t('nrefAnio')}</label>
    <select id="srAnio" style="width:100%">${[yr,yr+1,yr+2].map(y=>`<option value="${y}">${y}</option>`).join('')}</select>
  </div>
</div>
<button class="btn btn-s" onclick="window._portal.savePreregistro('sinRef')">${t('registrarSinRef')}</button>`;
}

// ─── TAB: ESTADO EN VIVO ─────────────────────────────────────────────
function _renderEstado() {
  const body = document.getElementById('pBody'); if (!body) return;
  const q = (_filtEstado||'').toLowerCase();
  const pres = _preregistros.filter(p =>
    !q || p.estado === q
  );

  const stCount = {};
  _preregistros.forEach(p => { stCount[p.estado || 'sinAsig'] = (stCount[p.estado || 'sinAsig'] || 0) + 1; });

  const filts = [
    ['', t('filtTodos'), _preregistros.length],
    ['en_recinto', t('filtFira'), stCount.en_recinto || 0],
    ['parking', t('filtPark'), stCount.parking || 0],
    ['en_espera', t('filtEspera'), stCount.en_espera || 0],
    ['sinAsig', t('filtNone'), stCount.sinAsig || 0],
  ];

  body.innerHTML = `
<div class="p-card">
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
    <div style="font-size:16px;font-weight:800"><span class="live"></span>${t('estadoVivo')}</div>
    <span style="font-size:11px;color:var(--text3)">Actualiza cada 60s</span>
    <span style="flex:1"></span>
    <button class="btn btn-gh btn-sm" onclick="window._portal.pollNow()">🔄 Actualizar</button>
  </div>
  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
    ${filts.map(([v,l,c]) => `<button class="btn btn-xs ${_filtEstado===v?'btn-p':'btn-gh'}" onclick="window._filtEstado='${v}';window._portal.renderEstadoPublic()">${l}${c?' ('+c+')':''}</button>`).join('')}
  </div>
  ${pres.length === 0
    ? `<div class="empty"><div class="empty-ico">📡</div><div class="empty-txt">${t('sinPrerr')}</div></div>`
    : `<div class="tbl-wrap"><table class="dtbl"><thead><tr>
        <th>${t('thMatricula')}</th><th>${t('thTipo')}</th><th>${t('thConductor')}</th>
        <th>${t('estThRef')}</th><th>${t('estThHall')}</th><th>${t('estThEstado')}</th><th>${t('thIncidencia')}</th>
      </tr></thead><tbody>
        ${pres.map(p => {
          const veh = _vehiculos.find(v => v.id === p.vehId) || {};
          const stMap = { en_recinto:{cls:'st-fira',l:t('dentro')}, parking:{cls:'st-park',l:t('parking')}, en_espera:{cls:'st-esp',l:t('espera')}, preregistrado:{cls:'st-semi',l:t('prerreg')} };
          const st = stMap[p.estado] || {cls:'st-none',l:t('sinAsig')};
          return `<tr>
            <td><span class="mchip-sm">${esc(veh.matricula||p.matricula||'—')}</span></td>
            <td style="font-size:11px">${esc(veh.tipo||'—')}</td>
            <td style="font-size:11px">${esc(veh.conductor||'—')}</td>
            <td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(p.ref||'—')}</td>
            <td style="font-size:11px">${esc(p.hall||'—')} ${p.stand?'· '+esc(p.stand):''}</td>
            <td><span class="sbadge ${st.cls}">${st.l}</span></td>
            <td>${p.incidencia?`<span style="font-size:10px;color:var(--amber)">⚡ ${esc(p.incidencia.tipo||'')}</span>`:'—'}</td>
          </tr>`;
        }).join('')}
      </tbody></table></div>`
  }
</div>`;
}

// ─── MODALS ───────────────────────────────────────────────────────────
function _modal(title, bodyHtml, onSave, saveLabel) {
  const id = 'pModal'; document.getElementById(id)?.remove();
  const bg = document.createElement('div'); bg.id = id; bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal-box">
    <div class="modal-hdr">
      <div style="font-size:16px;font-weight:800;flex:1">${title}</div>
      <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="document.getElementById('pModal').remove()">✕</button>
    </div>
    ${bodyHtml}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-gh btn-sm" onclick="document.getElementById('pModal').remove()">${t('cancelar')}</button>
      <button class="btn btn-p btn-sm" id="pModalSave">${saveLabel||t('guardar')}</button>
    </div>
  </div>`;
  document.body.appendChild(bg);
  document.getElementById('pModalSave').onclick = () => { onSave(); document.getElementById(id)?.remove(); };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  setTimeout(() => bg.querySelector('input,select,textarea')?.focus(), 80);
}

function _gv(id) { return (document.getElementById(id)?.value || '').trim(); }

// ─── PUBLIC API ───────────────────────────────────────────────────────
const _api = {
  goTab(tab) { _renderTab(tab); },

  setPreSubTab(sub) { _preSubTab = sub; const c = document.getElementById('asigContent'); if (c) c.innerHTML = _buildAsigContent(); },

  setLang(lang) {
    AppState.set('currentLang', lang);
    try { localStorage.setItem('beu_lang', lang); } catch {}
    const el = document.getElementById('pLangCode'); if (el) el.textContent = lang.toUpperCase();
    document.getElementById('pLangMenu').style.display = 'none';
    toast('🌐 ' + lang.toUpperCase(), 'var(--green)');
    _renderTab(_curTab);
  },

  async saveEmpresa() {
    _empresa.nombre   = _gv('pNom');
    _empresa.cif      = _gv('pCif');
    _empresa.contacto = _gv('pCont');
    _empresa.tel      = _gv('pTel');
    _empresa.email    = _gv('pEmail');
    _empresa.web      = _gv('pWeb');
    _empresa.tipo     = _gv('pTipo');
    await _saveEmpresa();
    toast('💾 Guardado', 'var(--green)');
  },

  openVehModal(id) {
    const v = id ? _vehiculos.find(x => x.id === id) : null;
    const isNew = !v;
    _modal(isNew ? `+ ${t('addVeh')}` : `✏️ ${t('addVeh')}`, `
      <div class="sg2">
        <div class="fg"><label>${t('vehLblMat')}</label><input id="vMat" value="${esc(v?.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
        <div class="fg"><label>${t('vehLblTipo')}</label>
          <select id="vTipo">
            ${['trailer','semiremolque','camion','furgoneta','otro'].map(tp=>`<option value="${tp}" ${v?.tipo===tp?'selected':''}>${{trailer:t('tipoTrailer'),semiremolque:t('tipoSemi'),camion:t('tipoCamion'),furgoneta:t('tipoFurgoneta'),otro:t('tipoOtro')}[tp]}</option>`).join('')}
          </select>
        </div>
        <div class="fg"><label>${t('vehLblPais')}</label><input id="vPais" value="${esc(v?.pais||'')}"></div>
        <div class="fg"><label>${t('vehLblRemolque')}</label><input id="vRem" value="${esc(v?.remolque||'')}" placeholder="TR5678X"></div>
        <div class="fg"><label>${t('vehLblConductor')}</label><input id="vCond" value="${esc(v?.conductor||'')}"></div>
        <div class="fg"><label>${t('vehLblTel')}</label><input id="vTel" value="${esc(v?.tel||'')}"></div>
      </div>
    `, async () => {
      const mat = normPlate(_gv('vMat'));
      if (!mat) { toast('Matrícula obligatoria', 'var(--red)'); return; }
      const data = { id: v?.id||uid(), matricula:mat, tipo:_gv('vTipo'), pais:_gv('vPais'), remolque:_gv('vRem'), conductor:_gv('vCond'), tel:_gv('vTel'), empresaId:_empresa.id };
      if (isNew) _vehiculos.push(data); else { const idx=_vehiculos.findIndex(x=>x.id===data.id); if(idx>=0)_vehiculos[idx]=data; }
      await _saveVehiculo(data);
      toast('✅ Vehículo guardado', 'var(--green)');
      _renderTab('vehiculos');
    });
  },

  async deleteVehiculo(id) {
    if (!confirm('¿Eliminar vehículo?')) return;
    _vehiculos = _vehiculos.filter(v => v.id !== id);
    await fsDel(`companies/${_empresa.id}/vehicles/${id}`);
    toast('🗑 Eliminado', 'var(--red)');
    _renderTab('vehiculos');
  },

  async savePreregistro(tipo) {
    const isConRef = tipo === 'conRef';
    const vehId = _gv(isConRef ? 'aVeh' : 'srVeh');
    if (!vehId) { toast(t('nrefVeh') + ' — requerido', 'var(--red)'); return; }
    const veh = _vehiculos.find(v => v.id === vehId);
    if (!veh) return;
    const evId = _getActiveEventId();
    const ev = _eventos.find(e => e.id === evId);
    const pre = {
      id: uid(), vehId, matricula: veh.matricula, empresaId: _empresa.id,
      empresaNombre: _empresa.nombre, eventoId: evId, eventoNombre: ev?.nombre || '',
      tipo, estado: 'preregistrado', creadoTs: new Date().toISOString(),
    };
    if (isConRef) {
      pre.ref       = _gv('aRef');
      pre.expositor = _gv('aExpo');
      pre.hall      = _gv('aHall');
      pre.stand     = _gv('aStand');
      pre.fechaPlan = _gv('aFecha');
      pre.horaPlan  = _gv('aHora');
      pre.descargaTipo = _gv('aDesc');
    } else {
      pre.hall      = _gv('srHall');
      pre.stand     = _gv('srStand');
      pre.desde     = _gv('srDesde');
      pre.hasta     = _gv('srHasta');
      pre.mes       = _gv('srMes');
      pre.anio      = _gv('srAnio');
    }
    _preregistros.push(pre);
    await _savePreregistro(pre);
    toast('✅ ' + (isConRef ? t('sigAsignar') : t('registrarSinRef')), 'var(--green)');
    _renderTab('estado');
  },

  openIncidencia(vehId) {
    const veh = _vehiculos.find(v => v.id === vehId);
    if (!veh) return;
    _modal(`⚡ ${t('enviarIncBtn').replace('⚡ ','')} — ${esc(veh.matricula)}`, `
      <div class="fg"><label>Tipo de incidencia</label>
        <select id="incTipo" style="width:100%">
          <option value="averia">${t('incLbl1')}</option>
          <option value="conductor">${t('incLbl2')}</option>
          <option value="fecha">${t('incLbl3')}</option>
          <option value="referencia">${t('incLbl4')}</option>
        </select>
      </div>
      <div class="fg"><label>Detalle</label><textarea id="incDet" rows="3" placeholder="Describe la incidencia..."></textarea></div>
      <div style="font-size:12px;color:var(--amber);background:var(--all);border:1px solid #fde68a;border-radius:var(--r);padding:8px;margin-top:4px">⚡ El operador de rampa recibirá esta incidencia en tiempo real.</div>
    `, async () => {
      const pre = _preregistros.find(p => p.vehId === vehId);
      if (!pre) { toast('Vehículo no está preregistrado en este evento', 'var(--amber)'); return; }
      pre.incidencia = { tipo: _gv('incTipo'), detalle: _gv('incDet'), ts: new Date().toISOString() };
      await _savePreregistro(pre);
      // Notify operator via mensajes module
      const { autoMsg } = await import('./mensajes.js').catch(() => ({ autoMsg: null }));
      if (autoMsg) {
        try {
          const fakeDB = { mensajesRampa: [] };
          autoMsg('alerta', `⚡ Incidencia: ${veh.matricula}`, `${_gv('incTipo')} — ${_gv('incDet')}`, veh.matricula, fakeDB, 'portal');
        } catch {}
      }
      toast('✅ Incidencia enviada', 'var(--green)');
    }, t('enviarIncBtn'));
  },

  openRGPD() {
    let _scrolled = false;
    const retainUntil = new Date(); retainUntil.setFullYear(retainUntil.getFullYear() + 2);
    const id = 'pModal'; document.getElementById(id)?.remove();
    const bg = document.createElement('div'); bg.id = id; bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal-box">
      <div class="modal-hdr"><div style="font-size:16px;font-weight:800;flex:1">🛡 ${t('firmRgpd')}</div>
        <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="document.getElementById('pModal').remove()">✕</button>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${t('scroll')}</div>
      <div class="rgpd-body" id="rgpdBody" onscroll="if(this.scrollTop+this.clientHeight>=this.scrollHeight-10){window._rgpdScrolled=true;document.getElementById('rgpdAccept').disabled=false;}">
        <h3 style="margin-bottom:8px">${t('firmRgpd')}</h3>
        <p>El responsable del tratamiento de datos es el organizador del evento. Los datos de los conductores serán tratados únicamente para la gestión logística y de acceso. Los datos se conservarán hasta ${retainUntil.toLocaleDateString()}.</p>
        <p style="margin-top:8px">De conformidad con el RGPD (UE) 2016/679, el interesado tiene derecho a acceder, rectificar y suprimir sus datos, a la limitación del tratamiento, a la portabilidad y a oponerse al mismo.</p>
        <p style="margin-top:8px">Los datos no serán cedidos a terceros salvo obligación legal.</p>
        <p style="margin-top:8px" id="rgpdPad" style="color:transparent">.</p>
      </div>
      <div style="margin-bottom:12px">
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;margin-bottom:8px"><input type="checkbox" id="ck1" style="flex-shrink:0;margin-top:2px">${t('c1')}</label>
        <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer"><input type="checkbox" id="ck2" style="flex-shrink:0;margin-top:2px">${t('c2')}</label>
      </div>
      <div id="otpSection" style="display:none">
        <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${t('otpDesc')}</div>
        <input id="otpInput" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="width:100%;font-size:24px;letter-spacing:8px;text-align:center;margin-bottom:8px">
        <button class="btn btn-gh btn-sm" onclick="window._portal.rgpdResendOTP()">↩ ${t('reenviar')}</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
        <button class="btn btn-gh btn-sm" onclick="document.getElementById('pModal').remove()">${t('cancelar')}</button>
        <button class="btn btn-p btn-sm" id="rgpdAccept" disabled onclick="window._portal.rgpdNext()">→ ${t('enviarOTP')}</button>
      </div>
    </div>`;
    document.body.appendChild(bg);
    window._rgpdScrolled = false;
    window._rgpdStep = 'consent';
    bg.onclick = e => { if (e.target === bg) bg.remove(); };
  },

  async rgpdNext() {
    if (window._rgpdStep === 'consent') {
      const ck1 = document.getElementById('ck1')?.checked;
      const ck2 = document.getElementById('ck2')?.checked;
      if (!ck1 || !ck2) { toast('Marca ambas casillas', 'var(--amber)'); return; }
      // Send OTP
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      _otpHash = await sha256(otp + (_empresa?.id || ''));
      if (location.hostname === 'localhost') console.info('[portal] OTP (dev):', otp);
      window._rgpdStep = 'otp';
      document.getElementById('otpSection').style.display = '';
      document.getElementById('rgpdAccept').textContent = t('confirmarFirma');
      document.getElementById('rgpdAccept').onclick = () => _api.rgpdConfirm();
      toast('📧 Código enviado a ' + (_empresa?.email||'tu email'), 'var(--blue)');
    }
  },

  async rgpdConfirm() {
    const code = (document.getElementById('otpInput')?.value || '').trim();
    if (code.length !== 6) { toast('Introduce el código de 6 dígitos', 'var(--amber)'); return; }
    const hashed = await sha256(code + (_empresa?.id || ''));
    if (hashed !== _otpHash) { toast('Código incorrecto', 'var(--red)'); return; }
    // Save consent
    const retainUntil = new Date(); retainUntil.setFullYear(retainUntil.getFullYear() + 2);
    const con = {
      id: uid(), empresaId: _empresa.id, ts: new Date().toISOString(),
      lang: _lang(), conservaHasta: retainUntil.toISOString().slice(0,10),
      firmado: true, firmadoPor: _user()?.nombre || '',
    };
    await fsSet(`companies/${_empresa.id}/consentimientos/${con.id}`, con, false);
    _consentimiento = con;
    document.getElementById('pModal')?.remove();
    toast('✅ ' + t('firmaReg'), 'var(--green)');
    _renderTab('empresa');
  },

  async rgpdResendOTP() {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    _otpHash = await sha256(otp + (_empresa?.id || ''));
    if (location.hostname === 'localhost') console.info('[portal] OTP (dev):', otp);
    toast('📧 Código reenviado', 'var(--blue)');
  },

  async pollNow() { await _pollLiveStatus(); _renderEstado(); },

  renderEstadoPublic() { _renderEstado(); },

  handleLogout() {
    if (confirm(t('salirBtn') + '?')) {
      if (_liveInterval) clearInterval(_liveInterval);
      logout();
    }
  },
};
