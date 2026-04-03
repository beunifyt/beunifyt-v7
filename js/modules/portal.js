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
  es: {
    portalTitle: 'Portal Empresas',
    miEmpresa: 'Mi empresa',
    misVeh: 'Mis vehículos',
    asigEvento: 'Asignar evento',
    estadoVivo: 'Estado en vivo',
    nombreEmp: 'Nombre empresa',
    cifVat: 'CIF / NIF / VAT',
    contacto: 'Persona de contacto',
    telefono: 'Teléfono',
    email: 'Email',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    addVeh: 'Añadir vehículo',
    salirBtn: 'Salir',
    registrarEmp: 'Registrar mi empresa →',
    accederPortal: 'Acceder al portal →',
    empresaBtn: 'Empresa / Expositor / Montador',
    operadorBtn: 'Operador',
    syncOk: 'Sincronizado',
    exito: '¡Registro completado!',
    exitoDesc: 'Ya tienes acceso al portal de preregistro.',
    firmaReg: 'Firma registrada',
    c1: 'He leído y acepto el documento de protección de datos y consiento el tratamiento de datos de los conductores.',
    c2: 'Confirmo que soy representante legal o apoderado de la empresa.',
    enviarOTP: 'Enviar código de firma por email',
    confirmarFirma: 'Confirmar firma',
    reenviar: 'Reenviar',
    otpDesc: 'Introduce el código de 6 dígitos enviado a tu email para firmar el documento RGPD.',
    scroll: 'Desplázate hasta el final para poder aceptar',
    conserv: 'Conservación hasta',
    idiomaDok: 'Idioma documento',
    sinVeh: 'Sin vehículos registrados aún',
    verif: 'Verificada',
    semi: 'Semiverificada',
    bloq: 'Bloqueada',
    espera: 'En espera',
    parking: 'En parking/rampa',
    dentro: 'Dentro Fira',
    sinAsig: 'Sin asignar',
    prerreg: 'Preregistrado',
    filtTodos: 'Todos los estados',
    filtFira: 'Dentro Fira',
    filtPark: 'Rampa/Parking',
    filtEspera: 'En espera',
    filtNone: 'Sin asignar',
    conRefTab: 'Con referencia',
    sinRefTab: 'Sin referencia',
    buscarVeh: 'Buscar matrícula, conductor, teléfono, remolque…',
    thMatricula: 'Matrícula',
    thTipo: 'Tipo',
    thConductor: 'Conductor',
    thEstado: 'Estado',
    vehLblMat: 'Matrícula *',
    vehLblTipo: 'Tipo vehículo',
    vehLblConductor: 'Nombre conductor',
    vehLblTel: 'Teléfono conductor',
    vehLblRemolque: 'Remolque',
    vehLblPais: 'País matrícula',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Semirremolque',
    tipoCamion: 'Camión',
    tipoFurgoneta: 'Furgoneta',
    tipoOtro: 'Otro',
    conRef: 'Con referencia / booking',
    sinRef: 'Sin referencia',
    refLbl: 'Referencia (booking)',
    expositor: 'Expositor',
    hallLbl: 'Hall',
    standLbl: 'Stand',
    fechaPrev: 'Fecha prevista',
    horaEst: 'Hora estimada',
    descargaLbl: 'Tipo descarga',
    sigAsignar: '✅ Asignar al evento',
    registrarSinRef: '✅ Registrar sin referencia',
    nrefVeh: 'Vehículo *',
    nrefDesde: 'Fecha inicio',
    nrefHasta: 'Fecha fin',
    incLbl1: 'Avería / cambio camión',
    incLbl2: 'Cambio conductor',
    incLbl3: 'Cambio fecha/hora',
    incLbl4: 'Cambio referencia',
    firmRgpd: 'Consentimiento RGPD',
    mesEnero: 'Enero',
    mesFebrero: 'Febrero',
    mesMarzo: 'Marzo',
    mesAbril: 'Abril',
    mesMayo: 'Mayo',
    mesJunio: 'Junio',
    mesJulio: 'Julio',
    mesAgosto: 'Agosto',
    mesSeptiembre: 'Septiembre',
    mesOctubre: 'Octubre',
    mesNoviembre: 'Noviembre',
    mesDiciembre: 'Diciembre',
    prevImpacto: 'Previsión impacto',
    datosEmp: 'Datos de la empresa',
    guardarBtn: '💾 Guardar',
    cancelarBtn: 'Cancelar',
    addVehBtn: 'Añadir vehículo',
    descManual: '🤲 Manual (Handball)',
    descForklift: '🏗 Forklift',
    asignarBtn: 'Asignar al evento',
    backLbl: 'Volver',
  },
  en: {
    portalTitle: 'Company Portal',
    miEmpresa: 'My company',
    misVeh: 'My vehicles',
    asigEvento: 'Assign event',
    estadoVivo: 'Live status',
    nombreEmp: 'Company name',
    cifVat: 'VAT / Tax ID',
    contacto: 'Contact person',
    telefono: 'Phone',
    email: 'Email',
    guardar: 'Save',
    cancelar: 'Cancel',
    addVeh: 'Add vehicle',
    salirBtn: 'Sign out',
    registrarEmp: 'Register my company →',
    accederPortal: 'Access portal →',
    empresaBtn: 'Company / Exhibitor / Installer',
    operadorBtn: 'Operator',
    syncOk: 'Synced',
    exito: 'Registration complete!',
    exitoDesc: 'You now have access to the pre-registration portal.',
    firmaReg: 'Signature recorded',
    c1: 'I have read and accept the data protection document and consent to the processing of drivers personal data.',
    c2: 'I confirm I am the legal representative or authorised representative of the company.',
    enviarOTP: 'Send signing code by email',
    confirmarFirma: 'Confirm signature',
    reenviar: 'Resend',
    otpDesc: 'Enter the 6-digit code sent to your email to sign the GDPR document.',
    scroll: 'Scroll to the end to accept',
    conserv: 'Retention until',
    idiomaDok: 'Document language',
    sinVeh: 'No vehicles registered yet',
    verif: 'Verified',
    semi: 'Semi-verified',
    bloq: 'Blocked',
    espera: 'Waiting',
    parking: 'At parking/ramp',
    dentro: 'Inside Fira',
    sinAsig: 'Unassigned',
    prerreg: 'Pre-registered',
    filtTodos: 'All statuses',
    filtFira: 'Inside Fira',
    filtPark: 'Ramp/Parking',
    filtEspera: 'Waiting',
    filtNone: 'Unassigned',
    conRefTab: 'With reference',
    sinRefTab: 'Without reference',
    buscarVeh: 'Search plate, driver, phone, trailer…',
    thMatricula: 'Plate',
    thTipo: 'Type',
    thConductor: 'Driver',
    thEstado: 'Status',
    vehLblMat: 'Plate *',
    vehLblTipo: 'Vehicle type',
    vehLblConductor: 'Driver name',
    vehLblTel: 'Driver phone',
    vehLblRemolque: 'Trailer',
    vehLblPais: 'Country',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Semi-trailer',
    tipoCamion: 'Truck',
    tipoFurgoneta: 'Van',
    tipoOtro: 'Other',
    conRef: 'With reference / booking',
    sinRef: 'Without reference',
    refLbl: 'Reference (booking)',
    expositor: 'Exhibitor',
    hallLbl: 'Hall',
    standLbl: 'Stand',
    fechaPrev: 'Planned date',
    horaEst: 'Estimated time',
    descargaLbl: 'Unloading type',
    sigAsignar: '✅ Assign to event',
    registrarSinRef: '✅ Register without reference',
    nrefVeh: 'Vehicle *',
    nrefDesde: 'Start date',
    nrefHasta: 'End date',
    incLbl1: 'Breakdown / truck change',
    incLbl2: 'Driver change',
    incLbl3: 'Date/time change',
    incLbl4: 'Reference change',
    firmRgpd: 'GDPR Consent',
    mesEnero: 'January',
    mesFebrero: 'February',
    mesMarzo: 'March',
    mesAbril: 'April',
    mesMayo: 'May',
    mesJunio: 'June',
    mesJulio: 'July',
    mesAgosto: 'August',
    mesSeptiembre: 'September',
    mesOctubre: 'October',
    mesNoviembre: 'November',
    mesDiciembre: 'December',
    prevImpacto: 'Impact forecast',
    datosEmp: 'Company data',
    guardarBtn: '💾 Save',
    cancelarBtn: 'Cancel',
    addVehBtn: 'Add vehicle',
    descManual: '🤲 Handball',
    descForklift: '🏗 Forklift',
    asignarBtn: 'Assign to event',
    backLbl: 'Back',
  },
  fr: {
    portalTitle: 'Portail Entreprises',
    miEmpresa: 'Mon entreprise',
    misVeh: 'Mes véhicules',
    asigEvento: 'Assigner événement',
    estadoVivo: 'État en direct',
    nombreEmp: 'Nom entreprise',
    cifVat: 'N° TVA / SIREN',
    contacto: 'Personne de contact',
    telefono: 'Téléphone',
    email: 'Email',
    guardar: 'Enregistrer',
    cancelar: 'Annuler',
    addVeh: 'Ajouter véhicule',
    salirBtn: 'Déconnexion',
    registrarEmp: 'Inscrire mon entreprise →',
    accederPortal: 'Accéder au portail →',
    empresaBtn: 'Entreprise / Exposant / Installateur',
    operadorBtn: 'Opérateur',
    syncOk: 'Synchronisé',
    exito: 'Inscription terminée !',
    exitoDesc: 'Vous avez maintenant accès au portail.',
    firmaReg: 'Signature enregistrée',
    c1: 'J\'ai lu et accepte le document de protection des données et consens au traitement des données des conducteurs.',
    c2: 'Je confirme que je suis le représentant légal de l\'entreprise.',
    enviarOTP: 'Envoyer le code par email',
    confirmarFirma: 'Confirmer la signature',
    reenviar: 'Renvoyer',
    otpDesc: 'Saisissez le code à 6 chiffres envoyé à votre email pour signer le document RGPD.',
    scroll: 'Faites défiler jusqu\'à la fin pour accepter',
    conserv: 'Conservation jusqu\'au',
    idiomaDok: 'Langue du document',
    sinVeh: 'Aucun véhicule enregistré',
    verif: 'Vérifiée',
    semi: 'Semi-vérifiée',
    bloq: 'Bloquée',
    espera: 'En attente',
    parking: 'Au parking/rampe',
    dentro: 'Dans la Fira',
    sinAsig: 'Non assigné',
    prerreg: 'Préenregistré',
    filtTodos: 'Tous les statuts',
    filtFira: 'Dans la Fira',
    filtPark: 'Rampe/Parking',
    filtEspera: 'En attente',
    filtNone: 'Non assigné',
    conRefTab: 'Avec référence',
    sinRefTab: 'Sans référence',
    buscarVeh: 'Rechercher immatriculation, chauffeur, téléphone, remorque…',
    thMatricula: 'Immatriculation',
    thTipo: 'Type',
    thConductor: 'Chauffeur',
    thEstado: 'Statut',
    vehLblMat: 'Immatriculation *',
    vehLblTipo: 'Type de véhicule',
    vehLblConductor: 'Nom du chauffeur',
    vehLblTel: 'Tél. chauffeur',
    vehLblRemolque: 'Remorque',
    vehLblPais: 'Pays',
    tipoTrailer: 'Remorque',
    tipoSemi: 'Semi-remorque',
    tipoCamion: 'Camion',
    tipoFurgoneta: 'Fourgonnette',
    tipoOtro: 'Autre',
    conRef: 'Avec référence / booking',
    sinRef: 'Sans référence',
    refLbl: 'Référence (booking)',
    expositor: 'Exposant',
    hallLbl: 'Hall',
    standLbl: 'Stand',
    fechaPrev: 'Date prévue',
    horaEst: 'Heure estimée',
    descargaLbl: 'Type déchargement',
    sigAsignar: '✅ Assigner à l\'événement',
    registrarSinRef: '✅ Enregistrer sans référence',
    nrefVeh: 'Véhicule *',
    nrefDesde: 'Date de début',
    nrefHasta: 'Date de fin',
    incLbl1: 'Panne / changement camion',
    incLbl2: 'Changement chauffeur',
    incLbl3: 'Changement date/heure',
    incLbl4: 'Changement référence',
    firmRgpd: 'Consentement RGPD',
    mesEnero: 'Janvier',
    mesFebrero: 'Février',
    mesMarzo: 'Mars',
    mesAbril: 'Avril',
    mesMayo: 'Mai',
    mesJunio: 'Juin',
    mesJulio: 'Juillet',
    mesAgosto: 'Août',
    mesSeptiembre: 'Septembre',
    mesOctubre: 'Octobre',
    mesNoviembre: 'Novembre',
    mesDiciembre: 'Décembre',
    prevImpacto: 'Prévision impact',
    datosEmp: 'Données de l\'entreprise',
    guardarBtn: '💾 Enregistrer',
    cancelarBtn: 'Annuler',
    addVehBtn: 'Ajouter véhicule',
    descManual: '🤲 Manuel (Handball)',
    descForklift: '🏗 Chariot élévateur',
    asignarBtn: 'Assigner à l\'événement',
    backLbl: 'Retour',
  },
  de: {
    portalTitle: 'Unternehmensportal',
    miEmpresa: 'Mein Unternehmen',
    misVeh: 'Meine Fahrzeuge',
    asigEvento: 'Veranstaltung zuweisen',
    estadoVivo: 'Live-Status',
    nombreEmp: 'Firmenname',
    cifVat: 'USt-IdNr.',
    contacto: 'Ansprechpartner',
    telefono: 'Telefon',
    email: 'E-Mail',
    guardar: 'Speichern',
    cancelar: 'Abbrechen',
    addVeh: 'Fahrzeug hinzufügen',
    salirBtn: 'Abmelden',
    registrarEmp: 'Mein Unternehmen registrieren →',
    accederPortal: 'Portal öffnen →',
    empresaBtn: 'Unternehmen / Aussteller / Aufbaufirma',
    operadorBtn: 'Betreiber',
    syncOk: 'Synchronisiert',
    exito: 'Registrierung abgeschlossen!',
    exitoDesc: 'Sie haben nun Zugang zum Vorregistrierungsportal.',
    firmaReg: 'Unterschrift erfasst',
    c1: 'Ich habe das Datenschutzdokument gelesen und akzeptiere es und stimme der Verarbeitung der Fahrerdaten zu.',
    c2: 'Ich bestätige, dass ich der gesetzliche Vertreter des Unternehmens bin.',
    enviarOTP: 'Signaturcode per E-Mail senden',
    confirmarFirma: 'Unterschrift bestätigen',
    reenviar: 'Erneut senden',
    otpDesc: 'Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde.',
    scroll: 'Scrollen Sie bis zum Ende, um zu akzeptieren',
    conserv: 'Aufbewahrung bis',
    idiomaDok: 'Dokumentsprache',
    sinVeh: 'Noch keine Fahrzeuge registriert',
    verif: 'Verifiziert',
    semi: 'Teilverifiziert',
    bloq: 'Gesperrt',
    espera: 'Wartend',
    parking: 'Auf Parkplatz/Rampe',
    dentro: 'In der Fira',
    sinAsig: 'Nicht zugewiesen',
    prerreg: 'Vorregistriert',
    filtTodos: 'Alle Status',
    filtFira: 'In der Fira',
    filtPark: 'Rampe/Parkplatz',
    filtEspera: 'Wartend',
    filtNone: 'Nicht zugewiesen',
    conRefTab: 'Mit Referenz',
    sinRefTab: 'Ohne Referenz',
    buscarVeh: 'Kennzeichen, Fahrer, Telefon, Anhänger suchen…',
    thMatricula: 'Kennzeichen',
    thTipo: 'Typ',
    thConductor: 'Fahrer',
    thEstado: 'Status',
    vehLblMat: 'Kennzeichen *',
    vehLblTipo: 'Fahrzeugtyp',
    vehLblConductor: 'Fahrername',
    vehLblTel: 'Fahrertelefon',
    vehLblRemolque: 'Anhänger',
    vehLblPais: 'Land',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Sattelauflieger',
    tipoCamion: 'LKW',
    tipoFurgoneta: 'Transporter',
    tipoOtro: 'Sonstiges',
    conRef: 'Mit Referenz / Buchung',
    sinRef: 'Ohne Referenz',
    refLbl: 'Referenz (Buchung)',
    expositor: 'Aussteller',
    hallLbl: 'Halle',
    standLbl: 'Stand',
    fechaPrev: 'Geplantes Datum',
    horaEst: 'Geschätzte Zeit',
    descargaLbl: 'Entladungstyp',
    sigAsignar: '✅ Veranstaltung zuweisen',
    registrarSinRef: '✅ Ohne Referenz registrieren',
    nrefVeh: 'Fahrzeug *',
    nrefDesde: 'Startdatum',
    nrefHasta: 'Enddatum',
    incLbl1: 'Panne / LKW-Wechsel',
    incLbl2: 'Fahrerwechsel',
    incLbl3: 'Datum/Uhrzeit ändern',
    incLbl4: 'Referenz ändern',
    firmRgpd: 'DSGVO-Einwilligung',
    mesEnero: 'Januar',
    mesFebrero: 'Februar',
    mesMarzo: 'März',
    mesAbril: 'April',
    mesMayo: 'Mai',
    mesJunio: 'Juni',
    mesJulio: 'Juli',
    mesAgosto: 'August',
    mesSeptiembre: 'September',
    mesOctubre: 'Oktober',
    mesNoviembre: 'November',
    mesDiciembre: 'Dezember',
    prevImpacto: 'Auswirkungsprognose',
    datosEmp: 'Unternehmensdaten',
    guardarBtn: '💾 Speichern',
    cancelarBtn: 'Abbrechen',
    addVehBtn: 'Fahrzeug hinzufügen',
    descManual: '🤲 Handbetrieb',
    descForklift: '🏗 Gabelstapler',
    asignarBtn: 'Veranstaltung zuweisen',
    backLbl: 'Zurück',
  },
  it: {
    portalTitle: 'Portale Aziende',
    miEmpresa: 'La mia azienda',
    misVeh: 'I miei veicoli',
    asigEvento: 'Assegna evento',
    estadoVivo: 'Stato in diretta',
    nombreEmp: 'Nome azienda',
    cifVat: 'P.IVA / CF',
    contacto: 'Persona di contatto',
    telefono: 'Telefono',
    email: 'Email',
    guardar: 'Salva',
    cancelar: 'Annulla',
    addVeh: 'Aggiungi veicolo',
    salirBtn: 'Esci',
    registrarEmp: 'Registra la mia azienda →',
    accederPortal: 'Accedi al portale →',
    empresaBtn: 'Azienda / Espositore / Allestitori',
    operadorBtn: 'Operatore',
    syncOk: 'Sincronizzato',
    exito: 'Registrazione completata!',
    exitoDesc: 'Hai ora accesso al portale di pre-registrazione.',
    firmaReg: 'Firma registrata',
    c1: 'Ho letto e accetto il documento sulla protezione dei dati e acconsento al trattamento dei dati degli autisti.',
    c2: 'Confermo di essere il rappresentante legale dell\'azienda.',
    enviarOTP: 'Invia codice di firma via email',
    confirmarFirma: 'Conferma firma',
    reenviar: 'Reinvia',
    otpDesc: 'Inserisci il codice a 6 cifre inviato via email per firmare il documento GDPR.',
    scroll: 'Scorri fino in fondo per accettare',
    conserv: 'Conservazione fino al',
    idiomaDok: 'Lingua documento',
    sinVeh: 'Nessun veicolo ancora registrato',
    verif: 'Verificata',
    semi: 'Semi-verificata',
    bloq: 'Bloccata',
    espera: 'In attesa',
    parking: 'Al parcheggio/rampa',
    dentro: 'Dentro la Fira',
    sinAsig: 'Non assegnato',
    prerreg: 'Pre-registrato',
    filtTodos: 'Tutti gli stati',
    filtFira: 'Dentro la Fira',
    filtPark: 'Rampa/Parcheggio',
    filtEspera: 'In attesa',
    filtNone: 'Non assegnato',
    conRefTab: 'Con riferimento',
    sinRefTab: 'Senza riferimento',
    buscarVeh: 'Cerca targa, autista, telefono, rimorchio…',
    thMatricula: 'Targa',
    thTipo: 'Tipo',
    thConductor: 'Autista',
    thEstado: 'Stato',
    vehLblMat: 'Targa *',
    vehLblTipo: 'Tipo veicolo',
    vehLblConductor: 'Nome autista',
    vehLblTel: 'Tel. autista',
    vehLblRemolque: 'Rimorchio',
    vehLblPais: 'Paese',
    tipoTrailer: 'Rimorchio',
    tipoSemi: 'Semirimorchio',
    tipoCamion: 'Camion',
    tipoFurgoneta: 'Furgone',
    tipoOtro: 'Altro',
    conRef: 'Con riferimento / booking',
    sinRef: 'Senza riferimento',
    refLbl: 'Riferimento (booking)',
    expositor: 'Espositore',
    hallLbl: 'Padiglione',
    standLbl: 'Stand',
    fechaPrev: 'Data prevista',
    horaEst: 'Ora stimata',
    descargaLbl: 'Tipo scarico',
    sigAsignar: '✅ Assegna all\'evento',
    registrarSinRef: '✅ Registra senza riferimento',
    nrefVeh: 'Veicolo *',
    nrefDesde: 'Data inizio',
    nrefHasta: 'Data fine',
    incLbl1: 'Guasto / cambio camion',
    incLbl2: 'Cambio autista',
    incLbl3: 'Cambio data/ora',
    incLbl4: 'Cambio riferimento',
    firmRgpd: 'Consenso GDPR',
    mesEnero: 'Gennaio',
    mesFebrero: 'Febbraio',
    mesMarzo: 'Marzo',
    mesAbril: 'Aprile',
    mesMayo: 'Maggio',
    mesJunio: 'Giugno',
    mesJulio: 'Luglio',
    mesAgosto: 'Agosto',
    mesSeptiembre: 'Settembre',
    mesOctubre: 'Ottobre',
    mesNoviembre: 'Novembre',
    mesDiciembre: 'Dicembre',
    prevImpacto: 'Previsione impatto',
    datosEmp: 'Dati dell\'azienda',
    guardarBtn: '💾 Salva',
    cancelarBtn: 'Annulla',
    addVehBtn: 'Aggiungi veicolo',
    descManual: '🤲 Manuale (Handball)',
    descForklift: '🏗 Carrello elevatore',
    asignarBtn: 'Assegna all\'evento',
    backLbl: 'Indietro',
  },
  pt: {
    portalTitle: 'Portal Empresas',
    miEmpresa: 'Minha empresa',
    misVeh: 'Meus veículos',
    asigEvento: 'Atribuir evento',
    estadoVivo: 'Estado ao vivo',
    nombreEmp: 'Nome empresa',
    cifVat: 'NIF / NIPC',
    contacto: 'Pessoa de contacto',
    telefono: 'Telefone',
    email: 'Email',
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    addVeh: 'Adicionar veículo',
    salirBtn: 'Sair',
    registrarEmp: 'Registar a minha empresa →',
    accederPortal: 'Aceder ao portal →',
    empresaBtn: 'Empresa / Expositor / Montador',
    operadorBtn: 'Operador',
    syncOk: 'Sincronizado',
    exito: 'Registo concluído!',
    exitoDesc: 'Já tem acesso ao portal de pré-registo.',
    firmaReg: 'Assinatura registada',
    c1: 'Li e aceito o documento de proteção de dados e consinto o tratamento dos dados dos motoristas.',
    c2: 'Confirmo que sou representante legal ou procurador da empresa.',
    enviarOTP: 'Enviar código de assinatura por email',
    confirmarFirma: 'Confirmar assinatura',
    reenviar: 'Reenviar',
    otpDesc: 'Introduza o código de 6 dígitos enviado para o seu email para assinar o documento RGPD.',
    scroll: 'Role até ao final para aceitar',
    conserv: 'Conservação até',
    idiomaDok: 'Idioma do documento',
    sinVeh: 'Ainda sem veículos registados',
    verif: 'Verificada',
    semi: 'Semi-verificada',
    bloq: 'Bloqueada',
    espera: 'Em espera',
    parking: 'No estacionamento/rampa',
    dentro: 'Dentro da Fira',
    sinAsig: 'Não atribuído',
    prerreg: 'Pré-registrado',
    filtTodos: 'Todos os estados',
    filtFira: 'Dentro da Fira',
    filtPark: 'Rampa/Estacionamento',
    filtEspera: 'Em espera',
    filtNone: 'Não atribuído',
    conRefTab: 'Com referência',
    sinRefTab: 'Sem referência',
    buscarVeh: 'Pesquisar matrícula, condutor, telefone, reboque…',
    thMatricula: 'Matrícula',
    thTipo: 'Tipo',
    thConductor: 'Condutor',
    thEstado: 'Estado',
    vehLblMat: 'Matrícula *',
    vehLblTipo: 'Tipo de veículo',
    vehLblConductor: 'Nome do condutor',
    vehLblTel: 'Tel. condutor',
    vehLblRemolque: 'Reboque',
    vehLblPais: 'País',
    tipoTrailer: 'Reboque',
    tipoSemi: 'Semi-reboque',
    tipoCamion: 'Caminhão',
    tipoFurgoneta: 'Carrinha',
    tipoOtro: 'Outro',
    conRef: 'Com referência / booking',
    sinRef: 'Sem referência',
    refLbl: 'Referência (booking)',
    expositor: 'Expositor',
    hallLbl: 'Pavilhão',
    standLbl: 'Stand',
    fechaPrev: 'Data prevista',
    horaEst: 'Hora estimada',
    descargaLbl: 'Tipo descarga',
    sigAsignar: '✅ Atribuir ao evento',
    registrarSinRef: '✅ Registar sem referência',
    nrefVeh: 'Veículo *',
    nrefDesde: 'Data início',
    nrefHasta: 'Data fim',
    incLbl1: 'Avaria / troca de camião',
    incLbl2: 'Troca de condutor',
    incLbl3: 'Alteração de data/hora',
    incLbl4: 'Alteração de referência',
    firmRgpd: 'Consentimento RGPD',
    mesEnero: 'Janeiro',
    mesFebrero: 'Fevereiro',
    mesMarzo: 'Março',
    mesAbril: 'Abril',
    mesMayo: 'Maio',
    mesJunio: 'Junho',
    mesJulio: 'Julho',
    mesAgosto: 'Agosto',
    mesSeptiembre: 'Setembro',
    mesOctubre: 'Outubro',
    mesNoviembre: 'Novembro',
    mesDiciembre: 'Dezembro',
    prevImpacto: 'Previsão impacto',
    datosEmp: 'Dados da empresa',
    guardarBtn: '💾 Guardar',
    cancelarBtn: 'Cancelar',
    addVehBtn: 'Adicionar veículo',
    descManual: '🤲 Manual (Handball)',
    descForklift: '🏗 Empilhadeira',
    asignarBtn: 'Atribuir ao evento',
    backLbl: 'Voltar',
  },
  pl: {
    portalTitle: 'Portal Firm',
    miEmpresa: 'Moja firma',
    misVeh: 'Moje pojazdy',
    asigEvento: 'Przypisz wydarzenie',
    estadoVivo: 'Status na zywo',
    nombreEmp: 'Nazwa firmy',
    cifVat: 'NIP / VAT',
    contacto: 'Osoba kontaktowa',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Zapisz',
    cancelar: 'Anuluj',
    addVeh: 'Dodaj pojazd',
    salirBtn: 'Wyloguj',
    registrarEmp: 'Zarejestruj firme',
    accederPortal: 'Wejdz do portalu',
    empresaBtn: 'Firma / Wystawca / Montazyst',
    operadorBtn: 'Operator',
    syncOk: 'Zsynchronizowano',
    exito: 'Rejestracja zakonczona!',
    exitoDesc: 'Masz dostep do portalu.',
    firmaReg: 'Podpis zarejestrowany',
    c1: 'Przeczytalam i akceptuje dokument.',
    c2: 'Potwierdzam ze jestem przedstawicielem firmy.',
    enviarOTP: 'Wyslij kod emailem',
    confirmarFirma: 'Potwierdz podpis',
    reenviar: 'Wysli ponownie',
    otpDesc: 'Wprowadz 6-cyfrowy kod.',
    scroll: 'Przewin do konca',
    conserv: 'Przechowywane do',
    idiomaDok: 'Jezyk dokumentu',
    sinVeh: 'Brak pojazdow',
    verif: 'Zweryfikowany',
    semi: 'Pol-zweryfikowany',
    bloq: 'Zablokowany',
    espera: 'W oczekiwaniu',
    parking: 'Na parkingu',
    dentro: 'Wewnatrz',
    sinAsig: 'Nieprzypisany',
    prerreg: 'Prerejestacja',
    filtTodos: 'Wszystkie statusy',
    filtFira: 'W Fira',
    filtPark: 'Rampa/Parking',
    filtEspera: 'Oczekiwanie',
    filtNone: 'Nieprzypisane',
    conRefTab: 'Z referencją',
    sinRefTab: 'Bez referencji',
    thMatricula: 'Tablica rej.',
    thTipo: 'Typ',
    thConductor: 'Kierowca',
    thEstado: 'Status',
    tipoTrailer: 'Przyczepa',
    tipoSemi: 'Naczepa',
    tipoCamion: 'Ciężarówka',
    tipoFurgoneta: 'Furgon',
    tipoOtro: 'Inne',
    sinRef: 'Bez referencji',
    refLbl: 'Referencja',
    expositor: 'Wystawca',
    hallLbl: 'Hala',
    standLbl: 'Stoisko',
    fechaPrev: 'Planowana data',
    horaEst: 'Szacowana godzina',
    descargaLbl: 'Typ rozladunku',
    sigAsignar: 'Przypisz do wydarzenia',
    registrarSinRef: 'Zarejestruj bez referencji',
    firmRgpd: 'Zgoda RODO',
    mesEnero: 'Styczeń',
    mesFebrero: 'Luty',
    mesMarzo: 'Marzec',
    mesAbril: 'Kwiecień',
    mesMayo: 'Maj',
    mesJunio: 'Czerwiec',
    mesJulio: 'Lipiec',
    mesAgosto: 'Sierpień',
    mesSeptiembre: 'Wrzesień',
    mesOctubre: 'Październik',
    mesNoviembre: 'Listopad',
    mesDiciembre: 'Grudzień',
    prevImpacto: 'Prognoza wplywu',
    datosEmp: 'Dane firmy',
    guardarBtn: 'Zapisz',
    cancelarBtn: 'Anuluj',
    descManual: '🤲 Ręcznie',
    descForklift: '🏗 Wózek widłowy',
    asignarBtn: 'Przypisz do wydarzenia',
    backLbl: 'Powrot',
  },
  ro: {
    portalTitle: 'Portal Companii',
    miEmpresa: 'Compania mea',
    misVeh: 'Vehiculele mele',
    asigEvento: 'Atribuie eveniment',
    estadoVivo: 'Status live',
    nombreEmp: 'Numele companiei',
    cifVat: 'CUI / TVA',
    contacto: 'Persoana de contact',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Salvati',
    cancelar: 'Anulati',
    addVeh: 'Adaugati vehicul',
    salirBtn: 'Deconectare',
    registrarEmp: 'Inregistreaza compania',
    accederPortal: 'Acces portal',
    empresaBtn: 'Companie / Expozant / Montator',
    operadorBtn: 'Operator',
    syncOk: 'Sincronizat',
    exito: 'Inregistrare finalizata!',
    exitoDesc: 'Aveti acces la portal.',
    firmaReg: 'Semnatura inregistrata',
    c1: 'Am citit si accept documentul.',
    c2: 'Confirm ca sunt reprezentant legal.',
    enviarOTP: 'Trimite cod pe email',
    confirmarFirma: 'Confirma semnatura',
    reenviar: 'Retrimite',
    otpDesc: 'Introduceti codul de 6 cifre.',
    scroll: 'Derulati pana la sfarsit',
    conserv: 'Conservare pana la',
    idiomaDok: 'Limba document',
    sinVeh: 'Fara vehicule',
    verif: 'Verificat',
    semi: 'Semi-verificat',
    bloq: 'Blocat',
    espera: 'In asteptare',
    parking: 'La parcare',
    dentro: 'Inauntru',
    sinAsig: 'Neatribuit',
    prerreg: 'Pre-inregistrat',
    filtTodos: 'Toate stările',
    filtFira: 'În Fira',
    filtPark: 'Rampă/Parcare',
    filtEspera: 'Așteptare',
    filtNone: 'Neatribuit',
    conRefTab: 'Cu referință',
    sinRefTab: 'Fără referință',
    thMatricula: 'Nr. înmatriculare',
    thTipo: 'Tip',
    thConductor: 'Șofer',
    thEstado: 'Stare',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Semiremorcă',
    tipoCamion: 'Camion',
    tipoFurgoneta: 'Furgon',
    tipoOtro: 'Altul',
    sinRef: 'Fara referinta',
    refLbl: 'Referinta',
    expositor: 'Expozant',
    hallLbl: 'Hala',
    standLbl: 'Stand',
    fechaPrev: 'Data planificata',
    horaEst: 'Ora estimata',
    descargaLbl: 'Tip descarcare',
    sigAsignar: 'Atribuiti evenimentului',
    registrarSinRef: 'Inregistrati fara referinta',
    firmRgpd: 'Consimtamant GDPR',
    prevImpacto: 'Previziune impact',
    datosEmp: 'Date companie',
    guardarBtn: 'Salvati',
    cancelarBtn: 'Anulati',
    asignarBtn: 'Atribuiti evenimentului',
    backLbl: 'Inapoi',
  },
  nl: {
    portalTitle: 'Bedrijfsportaal',
    miEmpresa: 'Mijn bedrijf',
    misVeh: 'Mijn voertuigen',
    asigEvento: 'Evenement toewijzen',
    estadoVivo: 'Live status',
    nombreEmp: 'Bedrijfsnaam',
    cifVat: 'BTW-nr.',
    contacto: 'Contactpersoon',
    telefono: 'Telefoon',
    email: 'E-mail',
    guardar: 'Opslaan',
    cancelar: 'Annuleren',
    addVeh: 'Voertuig toevoegen',
    salirBtn: 'Uitloggen',
    registrarEmp: 'Bedrijf registreren',
    accederPortal: 'Toegang portaal',
    empresaBtn: 'Bedrijf / Exposant / Installateur',
    operadorBtn: 'Operator',
    syncOk: 'Gesynchroniseerd',
    exito: 'Registratie voltooid!',
    exitoDesc: 'U heeft nu toegang.',
    firmaReg: 'Handtekening geregistreerd',
    c1: 'Ik heb gelezen en accepteer het document.',
    c2: 'Ik bevestig dat ik de wettelijke vertegenwoordiger ben.',
    enviarOTP: 'Stuur code via e-mail',
    confirmarFirma: 'Handtekening bevestigen',
    reenviar: 'Opnieuw verzenden',
    otpDesc: 'Voer de 6-cijferige code in.',
    scroll: 'Scroll naar het einde',
    conserv: 'Bewaard tot',
    idiomaDok: 'Documenttaal',
    sinVeh: 'Geen voertuigen',
    verif: 'Geverifieerd',
    semi: 'Semi-geverifieerd',
    bloq: 'Geblokkeerd',
    espera: 'In afwachting',
    parking: 'Op parkeerplaats',
    dentro: 'Binnen',
    sinAsig: 'Niet toegewezen',
    prerreg: 'Voorgeregistreerd',
    filtTodos: 'Alle statussen',
    filtFira: 'In de Fira',
    filtPark: 'Oprit/Parkeren',
    filtEspera: 'Wachtend',
    filtNone: 'Niet toegewezen',
    conRefTab: 'Met referentie',
    sinRefTab: 'Zonder referentie',
    thMatricula: 'Kenteken',
    thTipo: 'Type',
    thConductor: 'Chauffeur',
    thEstado: 'Status',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Semirremolque',
    tipoCamion: 'Vrachtwagen',
    tipoFurgoneta: 'Bestelwagen',
    tipoOtro: 'Overig',
    sinRef: 'Zonder referentie',
    refLbl: 'Referentie',
    expositor: 'Exposant',
    hallLbl: 'Hal',
    standLbl: 'Stand',
    fechaPrev: 'Geplande datum',
    horaEst: 'Geschat tijdstip',
    descargaLbl: 'Type lossen',
    sigAsignar: 'Toewijzen',
    registrarSinRef: 'Registreren zonder referentie',
    firmRgpd: 'AVG-toestemming',
    mesEnero: 'Januari',
    mesFebrero: 'Februari',
    mesMarzo: 'Maart',
    mesAbril: 'April',
    mesMayo: 'Mei',
    mesJunio: 'Juni',
    mesJulio: 'Juli',
    mesAgosto: 'Augustus',
    mesSeptiembre: 'September',
    mesOctubre: 'Oktober',
    mesNoviembre: 'November',
    mesDiciembre: 'December',
    prevImpacto: 'Impactprognose',
    datosEmp: 'Bedrijfsgegevens',
    guardarBtn: 'Opslaan',
    cancelarBtn: 'Annuleren',
    descManual: '🤲 Handmatig',
    descForklift: '🏗 Heftruck',
    asignarBtn: 'Toewijzen aan evenement',
    backLbl: 'Terug',
  },
  hu: {
    portalTitle: 'Vallalati Portal',
    miEmpresa: 'Az en cegem',
    misVeh: 'Az en jarmuim',
    asigEvento: 'Esemeny hozzarendelese',
    estadoVivo: 'Elo allapot',
    nombreEmp: 'Cegnev',
    cifVat: 'Adoszam',
    contacto: 'Kapcsolattarto',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Mentes',
    cancelar: 'Megse',
    addVeh: 'Jarmu hozzaadasa',
    salirBtn: 'Kijelentkezés',
    registrarEmp: 'Ceg regisztralasa',
    accederPortal: 'Portal megnyitasa',
    empresaBtn: 'Ceg / Kiallito / Szerelo',
    operadorBtn: 'Operator',
    syncOk: 'Szinkronizálva',
    exito: 'Regisztracio befejezve!',
    exitoDesc: 'Hozzafer a portalhoz.',
    firmaReg: 'Alairas rogzitve',
    c1: 'Elolvastam es elfogadom a dokumentumot.',
    c2: 'Megerositem hogy jogi kepviselo vagyok.',
    enviarOTP: 'Kod kuldes emailben',
    confirmarFirma: 'Alairas megerositese',
    reenviar: 'Ujrakuldes',
    otpDesc: 'Add meg a 6 jegyu kodot.',
    scroll: 'Goridon a vegere',
    conserv: 'Tarolva',
    idiomaDok: 'Dokumentum nyelve',
    sinVeh: 'Nincs jarmuve',
    verif: 'Ellenorizve',
    semi: 'Fel-ellenorizve',
    bloq: 'Letiltva',
    espera: 'Varakozas',
    parking: 'Parkoloba',
    dentro: 'Belul',
    sinAsig: 'Nincs hozzarendelve',
    prerreg: 'Elore regisztralt',
    filtTodos: 'Minden állapot',
    filtFira: 'A Firában',
    filtPark: 'Rámpán/Parkolóban',
    filtEspera: 'Várakozás',
    filtNone: 'Nincs hozzárendelve',
    conRefTab: 'Hivatkozással',
    sinRefTab: 'Hivatkozás nélkül',
    thMatricula: 'Rendszám',
    thTipo: 'Típus',
    thConductor: 'Sofőr',
    thEstado: 'Állapot',
    tipoTrailer: 'Pótkocsi',
    tipoSemi: 'Félpótkocsi',
    tipoCamion: 'Teherautó',
    tipoFurgoneta: 'Kisteherautó',
    tipoOtro: 'Egyéb',
    sinRef: 'Hivatkozas nelkul',
    refLbl: 'Hivatkozas',
    expositor: 'Kiallito',
    hallLbl: 'Csarnok',
    standLbl: 'Stand',
    fechaPrev: 'Tervezett datum',
    horaEst: 'Becsult idopont',
    descargaLbl: 'Lerakodas tipusa',
    sigAsignar: 'Esemenyhez rendeles',
    registrarSinRef: 'Regisztracio hivatkozas nelkul',
    firmRgpd: 'GDPR hozzajarulas',
    prevImpacto: 'Hatasprognozis',
    datosEmp: 'Ceg adatai',
    guardarBtn: 'Mentes',
    cancelarBtn: 'Megse',
    asignarBtn: 'Esemenyhez rendeles',
    backLbl: 'Vissza',
  },
  cs: {
    portalTitle: 'Firemni portal',
    miEmpresa: 'Moje firma',
    misVeh: 'Moje vozidla',
    asigEvento: 'Priradit udalost',
    estadoVivo: 'Zivý stav',
    nombreEmp: 'Nazev firmy',
    cifVat: 'DIC / ICO',
    contacto: 'Kontaktni osoba',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Ulozit',
    cancelar: 'Zrusit',
    addVeh: 'Pridat vozidlo',
    salirBtn: 'Odhlásit',
    registrarEmp: 'Registrovat firmu',
    accederPortal: 'Vstup do portalu',
    empresaBtn: 'Firma / Vystavovatel / Montaznik',
    operadorBtn: 'Operator',
    syncOk: 'Synchronizováno',
    exito: 'Registrace dokoncena!',
    exitoDesc: 'Mate pristup k portalu.',
    firmaReg: 'Podpis zaregistrovan',
    c1: 'Precetl jsem a akceptuji dokument.',
    c2: 'Potvrzuji ze jsem pravni zastupce.',
    enviarOTP: 'Odeslat kod emailem',
    confirmarFirma: 'Potvrdit podpis',
    reenviar: 'Znovu odeslat',
    otpDesc: 'Zadejte 6-mistny kod.',
    scroll: 'Posunout na konec',
    conserv: 'Uchovano do',
    idiomaDok: 'Jazyk dokumentu',
    sinVeh: 'Zadna vozidla',
    verif: 'Overeno',
    semi: 'Castecne overeno',
    bloq: 'Blokovano',
    espera: 'Cekani',
    parking: 'Na parkovisti',
    dentro: 'Uvnitr',
    sinAsig: 'Neprirazeno',
    prerreg: 'Pred-registrovano',
    filtTodos: 'Všechny stavy',
    filtFira: 'Ve Fira',
    filtPark: 'Rampa/Parkoviště',
    filtEspera: 'Čekání',
    filtNone: 'Nepřiřazeno',
    conRefTab: 'S referencí',
    sinRefTab: 'Bez reference',
    thMatricula: 'SPZ',
    thTipo: 'Typ',
    thConductor: 'Řidič',
    thEstado: 'Stav',
    tipoTrailer: 'Přívěs',
    tipoSemi: 'Návěs',
    tipoCamion: 'Kamion',
    tipoFurgoneta: 'Dodávka',
    tipoOtro: 'Jiný',
    sinRef: 'Bez reference',
    refLbl: 'Reference',
    expositor: 'Vystavovatel',
    hallLbl: 'Hala',
    standLbl: 'Stanek',
    fechaPrev: 'Planovane datum',
    horaEst: 'Odhadovany cas',
    descargaLbl: 'Typ vykladky',
    sigAsignar: 'Priradit k udalosti',
    registrarSinRef: 'Registrovat bez reference',
    firmRgpd: 'Souhlas GDPR',
    prevImpacto: 'Prognoza dopadu',
    datosEmp: 'Firemni udaje',
    guardarBtn: 'Ulozit',
    cancelarBtn: 'Zrusit',
    asignarBtn: 'Priradit k udalosti',
    backLbl: 'Zpet',
  },
  hr: {
    portalTitle: 'Portal tvrtki',
    miEmpresa: 'Moja tvrtka',
    misVeh: 'Moja vozila',
    asigEvento: 'Dodjeli dogadaj',
    estadoVivo: 'Zivi status',
    nombreEmp: 'Naziv tvrtke',
    cifVat: 'OIB / PDV',
    contacto: 'Kontakt osoba',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Spremi',
    cancelar: 'Odustani',
    addVeh: 'Dodaj vozilo',
    salirBtn: 'Odjava',
    registrarEmp: 'Registriraj tvrtku',
    accederPortal: 'Pristupi portalu',
    empresaBtn: 'Tvrtka / Izlagac / Monter',
    operadorBtn: 'Operator',
    syncOk: 'Sinkronizirano',
    exito: 'Registracija zavrsena!',
    exitoDesc: 'Imate pristup portalu.',
    firmaReg: 'Potpis registriran',
    c1: 'Procitao sam i prihvacam dokument.',
    c2: 'Potvrdim da sam zakonski zastupnik.',
    enviarOTP: 'Posalji kod emailom',
    confirmarFirma: 'Potvrdi potpis',
    reenviar: 'Posalji ponovo',
    otpDesc: 'Unesite 6-znamenkasti kod.',
    scroll: 'Pomicite se do kraja',
    conserv: 'Cuvano do',
    idiomaDok: 'Jezik dokumenta',
    sinVeh: 'Nema vozila',
    verif: 'Verificiran',
    semi: 'Polu-verificiran',
    bloq: 'Blokiran',
    espera: 'U cekanju',
    parking: 'Na parklistu',
    dentro: 'Unutra',
    sinAsig: 'Nedodjeljeno',
    prerreg: 'Preregistriran',
    filtTodos: 'Svi statusi',
    filtFira: 'U Fira',
    filtPark: 'Rampa/Parking',
    filtEspera: 'Čekanje',
    filtNone: 'Nedodijeljeno',
    conRefTab: 'S referencom',
    sinRefTab: 'Bez reference',
    thMatricula: 'Registracija',
    thTipo: 'Tip',
    thConductor: 'Vozač',
    thEstado: 'Status',
    tipoTrailer: 'Prikolica',
    tipoSemi: 'Poluprikolica',
    tipoCamion: 'Kamion',
    tipoFurgoneta: 'Kombi',
    tipoOtro: 'Ostalo',
    sinRef: 'Bez reference',
    refLbl: 'Referenca',
    expositor: 'Izlagac',
    hallLbl: 'Dvorana',
    standLbl: 'Stand',
    fechaPrev: 'Planirani datum',
    horaEst: 'Procijenjeno vrijeme',
    descargaLbl: 'Vrsta istovara',
    sigAsignar: 'Dodjeli dogadaju',
    registrarSinRef: 'Registriraj bez reference',
    firmRgpd: 'Pristanak GDPR',
    prevImpacto: 'Prognoza utjecaja',
    datosEmp: 'Podaci tvrtke',
    guardarBtn: 'Spremi',
    cancelarBtn: 'Odustani',
    asignarBtn: 'Dodjeli dogadaju',
    backLbl: 'Natrag',
  },
  uk: {
    portalTitle: 'Portal Kompanii',
    miEmpresa: 'Moia kompaniia',
    misVeh: 'Moi transportni zasoby',
    asigEvento: 'Pryznachyty podiu',
    estadoVivo: 'Zhyvyi stan',
    nombreEmp: 'Nazva kompanii',
    cifVat: 'IPN / PDV',
    contacto: 'Kontaktna osoba',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Zberehty',
    cancelar: 'Skasuvaty',
    addVeh: 'Dodaty transportnyi zasib',
    salirBtn: 'Вийти',
    registrarEmp: 'Zareiiestruvatysia',
    accederPortal: 'Vkhid do portalu',
    empresaBtn: 'Kompaniia / Eksponent / Monter',
    operadorBtn: 'Operator',
    syncOk: 'Синхронізовано',
    exito: 'Reiestratsiiu zaversheno!',
    exitoDesc: 'Maite dostup do portalu.',
    firmaReg: 'Pidpys zareiiestrovanyi',
    c1: 'Ia prochytav ta pryimaiu dokument.',
    c2: 'Pidtverddzhuiu shcho ia zakonyi predstavnyk.',
    enviarOTP: 'Nadislaty kod na email',
    confirmarFirma: 'Pidtverdyty pidpys',
    reenviar: 'Nadislaty znovu',
    otpDesc: 'Vvedit 6-tsyfrovyi kod.',
    scroll: 'Prohortatye do kintsia',
    conserv: 'Zberihaietsia do',
    idiomaDok: 'Mova dokumenta',
    sinVeh: 'Nemae transportnykh zasobiv',
    verif: 'Perevireno',
    semi: 'Chastково perevireno',
    bloq: 'Zablokovano',
    espera: 'Ocikuvannia',
    parking: 'Na parkovytsi',
    dentro: 'Vseredyni',
    sinAsig: 'Nepryznacheno',
    prerreg: 'Peredreiestrovanyi',
    filtTodos: 'Всі статуси',
    filtFira: 'У Fira',
    filtPark: 'Рампа/Паркінг',
    filtEspera: 'Очікування',
    filtNone: 'Не призначено',
    conRefTab: 'З референсом',
    sinRefTab: 'Без референса',
    thMatricula: 'Номер',
    thTipo: 'Тип',
    thConductor: 'Водій',
    thEstado: 'Статус',
    tipoTrailer: 'Причіп',
    tipoSemi: 'Напівпричіп',
    tipoCamion: 'Вантажівка',
    tipoFurgoneta: 'Фургон',
    tipoOtro: 'Інше',
    sinRef: 'Bez referentsii',
    refLbl: 'Referentsiia',
    expositor: 'Eksponent',
    hallLbl: 'Pavilion',
    standLbl: 'Stend',
    fechaPrev: 'Zapla novana data',
    horaEst: 'Oriientyrnyi chas',
    descargaLbl: 'Typ rozvantazhennia',
    sigAsignar: 'Pryznachyty do podii',
    registrarSinRef: 'Zareiiestruvatysia bez referentsii',
    firmRgpd: 'Zghoda GDPR',
    prevImpacto: 'Prohnoz vplyvu',
    datosEmp: 'Dani kompanii',
    guardarBtn: 'Zberehty',
    cancelarBtn: 'Skasuvaty',
    asignarBtn: 'Pryznachyty do podii',
    backLbl: 'Nazad',
  },
  ru: {
    portalTitle: 'Portal Kompanii',
    miEmpresa: 'Moia kompaniia',
    misVeh: 'Moi transportnye sredstva',
    asigEvento: 'Naznachit meropriiatie',
    estadoVivo: 'Zhivoi status',
    nombreEmp: 'Nazvanie kompanii',
    cifVat: 'INN / NDS',
    contacto: 'Kontaktnoe litso',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Sokhranit',
    cancelar: 'Otmena',
    addVeh: 'Dobavit transportnoe sredstvo',
    salirBtn: 'Выйти',
    registrarEmp: 'Zaregistrirovat kompaniiu',
    accederPortal: 'Vkhod v portal',
    empresaBtn: 'Kompaniia / Eksponent / Monter',
    operadorBtn: 'Operator',
    syncOk: 'Синхронизировано',
    exito: 'Registratsiia zavershena!',
    exitoDesc: 'U vas est dostup k portalu.',
    firmaReg: 'Podpis zaregistrirovan',
    c1: 'Ia prochital i prinimaiu dokument.',
    c2: 'Podtverzhdaiu chto ia iavliaiius zakonnym predstavitelem.',
    enviarOTP: 'Otpravit kod na email',
    confirmarFirma: 'Podtverdit podpis',
    reenviar: 'Otpravit snova',
    otpDesc: 'Vvedite 6-znachnyi kod.',
    scroll: 'Prokrutite do kontsa',
    conserv: 'Khraneniie do',
    idiomaDok: 'Iazyk dokumenta',
    sinVeh: 'Net transportnykh sredstv',
    verif: 'Provereno',
    semi: 'Chastichno provereno',
    bloq: 'Zablokirovano',
    espera: 'Ozhidanie',
    parking: 'Na parkovke',
    dentro: 'Vnutri',
    sinAsig: 'Ne naznacheno',
    prerreg: 'Predvaritelno zaregistrirovan',
    filtTodos: 'Все статусы',
    filtFira: 'В Fira',
    filtPark: 'Рампа/Парковка',
    filtEspera: 'Ожидание',
    filtNone: 'Не назначено',
    conRefTab: 'С референсом',
    sinRefTab: 'Без референса',
    thMatricula: 'Номер',
    thTipo: 'Тип',
    thConductor: 'Водитель',
    thEstado: 'Статус',
    tipoTrailer: 'Прицеп',
    tipoSemi: 'Полуприцеп',
    tipoCamion: 'Грузовик',
    tipoFurgoneta: 'Фургон',
    tipoOtro: 'Другое',
    sinRef: 'Bez referentsii',
    refLbl: 'Referentsiia',
    expositor: 'Eksponent',
    hallLbl: 'Pavilon',
    standLbl: 'Stend',
    fechaPrev: 'Zapla nirovannaia data',
    horaEst: 'Orientirovochnoe vremia',
    descargaLbl: 'Tip razgruzki',
    sigAsignar: 'Naznachit na meropriiatie',
    registrarSinRef: 'Zaregistrirovat bez referentsii',
    firmRgpd: 'Soglasie GDPR',
    mesEnero: 'Январь',
    mesFebrero: 'Февраль',
    mesMarzo: 'Март',
    mesAbril: 'Апрель',
    mesMayo: 'Май',
    mesJunio: 'Июнь',
    mesJulio: 'Июль',
    mesAgosto: 'Август',
    mesSeptiembre: 'Сентябрь',
    mesOctubre: 'Октябрь',
    mesNoviembre: 'Ноябрь',
    mesDiciembre: 'Декабрь',
    prevImpacto: 'Prognoz vozdeistviia',
    datosEmp: 'Dannye kompanii',
    guardarBtn: 'Sokhranit',
    cancelarBtn: 'Otmena',
    descManual: '🤲 Ручная',
    descForklift: '🏗 Погрузчик',
    asignarBtn: 'Naznachit na meropriiatie',
    backLbl: 'Nazad',
  },
  tr: {
    portalTitle: 'Sirket Portali',
    miEmpresa: 'Sirketim',
    misVeh: 'Araclarim',
    asigEvento: 'Etkinlik ata',
    estadoVivo: 'Canli durum',
    nombreEmp: 'Sirket adi',
    cifVat: 'Vergi No',
    contacto: 'Irtibat kisisi',
    telefono: 'Telefon',
    email: 'E-posta',
    guardar: 'Kaydet',
    cancelar: 'Iptal',
    addVeh: 'Arac ekle',
    salirBtn: 'Çıkış',
    registrarEmp: 'Sirketi kaydet',
    accederPortal: 'Portala gir',
    empresaBtn: 'Sirket / Katilimci / Montajci',
    operadorBtn: 'Operator',
    syncOk: 'Senkronize',
    exito: 'Kayit tamamlandi!',
    exitoDesc: 'Portala erisebilirsiniz.',
    firmaReg: 'Imza kaydedildi',
    c1: 'Belgeyi okudum ve kabul ediyorum.',
    c2: 'Yasal temsilci oldugumu onaylarim.',
    enviarOTP: 'Emaile kod gonder',
    confirmarFirma: 'Imzayi onayla',
    reenviar: 'Tekrar gonder',
    otpDesc: '6 haneli kodu girin.',
    scroll: 'Sona kadar kaydir',
    conserv: 'Saklanma',
    idiomaDok: 'Belge dili',
    sinVeh: 'Arac yok',
    verif: 'Dogrulandi',
    semi: 'Kismen dogrulandi',
    bloq: 'Engellendi',
    espera: 'Beklemede',
    parking: 'Otoparkta',
    dentro: 'Iceri',
    sinAsig: 'Atanmadi',
    prerreg: 'On kayitli',
    filtTodos: 'Tüm durumlar',
    filtFira: 'Fira içinde',
    filtPark: 'Rampa/Park',
    filtEspera: 'Bekleniyor',
    filtNone: 'Atanmamış',
    conRefTab: 'Referanslı',
    sinRefTab: 'Referanssız',
    thMatricula: 'Plaka',
    thTipo: 'Tür',
    thConductor: 'Sürücü',
    thEstado: 'Durum',
    tipoTrailer: 'Treyler',
    tipoSemi: 'Yarı-treyler',
    tipoCamion: 'Kamyon',
    tipoFurgoneta: 'Minibüs',
    tipoOtro: 'Diğer',
    sinRef: 'Referanssiz',
    refLbl: 'Referans',
    expositor: 'Katilimci',
    hallLbl: 'Salon',
    standLbl: 'Stant',
    fechaPrev: 'Planlanan tarih',
    horaEst: 'Tahmini saat',
    descargaLbl: 'Bosaltma turu',
    sigAsignar: 'Etkinlige ata',
    registrarSinRef: 'Referanssiz kaydet',
    firmRgpd: 'GDPR Onayi',
    mesEnero: 'Ocak',
    mesFebrero: 'Şubat',
    mesMarzo: 'Mart',
    mesAbril: 'Nisan',
    mesMayo: 'Mayıs',
    mesJunio: 'Haziran',
    mesJulio: 'Temmuz',
    mesAgosto: 'Ağustos',
    mesSeptiembre: 'Eylül',
    mesOctubre: 'Ekim',
    mesNoviembre: 'Kasım',
    mesDiciembre: 'Aralık',
    prevImpacto: 'Etki tahmini',
    datosEmp: 'Sirket verileri',
    guardarBtn: 'Kaydet',
    cancelarBtn: 'Iptal',
    descManual: '🤲 El ile',
    descForklift: '🏗 Forklift',
    asignarBtn: 'Etkinlige ata',
    backLbl: 'Geri',
  },
  ar: {
    portalTitle: 'بوابة الشركات',
    miEmpresa: 'شركتي',
    misVeh: 'مركباتي',
    asigEvento: 'تعيين حدث',
    estadoVivo: 'الحالة المباشرة',
    nombreEmp: 'اسم الشركة',
    cifVat: 'الرقم الضريبي',
    contacto: 'جهة الاتصال',
    telefono: 'الهاتف',
    email: 'البريد الالكتروني',
    guardar: 'حفظ',
    cancelar: 'الغاء',
    addVeh: 'اضافة مركبة',
    salirBtn: 'خروج',
    registrarEmp: 'تسجيل الشركة',
    accederPortal: 'الدخول للبوابة',
    empresaBtn: 'شركة / عارض / مركّب',
    operadorBtn: 'المشغل',
    syncOk: 'متزامن',
    exito: 'اكتمل التسجيل!',
    exitoDesc: 'يمكنك الوصول للبوابة.',
    firmaReg: 'تم تسجيل التوقيع',
    c1: 'قرأت وأقبل الوثيقة.',
    c2: 'اؤكد اني الممثل القانوني.',
    enviarOTP: 'ارسال الرمز',
    confirmarFirma: 'تأكيد التوقيع',
    reenviar: 'اعادة الارسال',
    otpDesc: 'ادخل الرمز المكون من 6 ارقام.',
    scroll: 'قم بالتمرير للنهاية',
    conserv: 'محفوظ حتى',
    idiomaDok: 'لغة الوثيقة',
    sinVeh: 'لا توجد مركبات',
    verif: 'تم التحقق',
    semi: 'تحقق جزئي',
    bloq: 'محظور',
    espera: 'قيد الانتظار',
    parking: 'في الموقف',
    dentro: 'داخل',
    sinAsig: 'غير معين',
    prerreg: 'مسجل مسبقا',
    filtTodos: 'جميع الحالات',
    filtFira: 'داخل الفيرا',
    filtPark: 'المنحدر/الموقف',
    filtEspera: 'انتظار',
    filtNone: 'غير معين',
    conRefTab: 'مع مرجع',
    sinRefTab: 'بدون مرجع',
    thMatricula: 'اللوحة',
    thTipo: 'النوع',
    thConductor: 'السائق',
    thEstado: 'الحالة',
    tipoTrailer: 'مقطورة',
    tipoSemi: 'نصف مقطورة',
    tipoCamion: 'شاحنة',
    tipoFurgoneta: 'شاحنة صغيرة',
    tipoOtro: 'أخرى',
    sinRef: 'بدون مرجع',
    refLbl: 'المرجع',
    expositor: 'العارض',
    hallLbl: 'القاعة',
    standLbl: 'الجناح',
    fechaPrev: 'التاريخ المخطط',
    horaEst: 'الوقت التقريبي',
    descargaLbl: 'نوع التفريغ',
    sigAsignar: 'تعيين للحدث',
    registrarSinRef: 'تسجيل بدون مرجع',
    firmRgpd: 'موافقة GDPR',
    mesEnero: 'يناير',
    mesFebrero: 'فبراير',
    mesMarzo: 'مارس',
    mesAbril: 'أبريل',
    mesMayo: 'مايو',
    mesJunio: 'يونيو',
    mesJulio: 'يوليو',
    mesAgosto: 'أغسطس',
    mesSeptiembre: 'سبتمبر',
    mesOctubre: 'أكتوبر',
    mesNoviembre: 'نوفمبر',
    mesDiciembre: 'ديسمبر',
    prevImpacto: 'توقع التاثير',
    datosEmp: 'بيانات الشركة',
    guardarBtn: 'حفظ',
    cancelarBtn: 'الغاء',
    descManual: '🤲 يدوي',
    descForklift: '🏗 رافعة شوكية',
    asignarBtn: 'تعيين للحدث',
    backLbl: 'رجوع',
  },
  sv: {
    portalTitle: 'Foretagsportal',
    miEmpresa: 'Mitt foretag',
    misVeh: 'Mina fordon',
    asigEvento: 'Tilldela evenemang',
    estadoVivo: 'Live-status',
    nombreEmp: 'Foretagsnamn',
    cifVat: 'Org.nr / Moms',
    contacto: 'Kontaktperson',
    telefono: 'Telefon',
    email: 'E-post',
    guardar: 'Spara',
    cancelar: 'Avbryt',
    addVeh: 'Lagg till fordon',
    salirBtn: 'Logga ut',
    registrarEmp: 'Registrera foretag',
    accederPortal: 'Ga till portalen',
    empresaBtn: 'Foretag / Utstellare / Installatör',
    operadorBtn: 'Operator',
    syncOk: 'Synkroniserad',
    exito: 'Registrering klar!',
    exitoDesc: 'Du har tillgang till portalen.',
    firmaReg: 'Underskrift registrerad',
    c1: 'Jag har last och accepterar dokumentet.',
    c2: 'Jag bekraftar att jag ar laglig representant.',
    enviarOTP: 'Skicka kod via e-post',
    confirmarFirma: 'Bekrafta underskrift',
    reenviar: 'Skicka igen',
    otpDesc: 'Ange den 6-siffriga koden.',
    scroll: 'Blattra till slutet',
    conserv: 'Bevarat till',
    idiomaDok: 'Dokumentsprak',
    sinVeh: 'Inga fordon',
    verif: 'Verifierad',
    semi: 'Halvverifierad',
    bloq: 'Blockerad',
    espera: 'Vantar',
    parking: 'Pa parkering',
    dentro: 'Inne',
    sinAsig: 'Ej tilldelad',
    prerreg: 'Forregistrerad',
    filtTodos: 'Alla statusar',
    filtFira: 'I Fira',
    filtPark: 'Ramp/Parkering',
    filtEspera: 'Väntar',
    filtNone: 'Ej tilldelad',
    conRefTab: 'Med referens',
    sinRefTab: 'Utan referens',
    thMatricula: 'Reg.skylt',
    thTipo: 'Typ',
    thConductor: 'Förare',
    thEstado: 'Status',
    tipoTrailer: 'Trailer',
    tipoSemi: 'Semitrailer',
    tipoCamion: 'Lastbil',
    tipoFurgoneta: 'Skåpbil',
    tipoOtro: 'Annat',
    sinRef: 'Utan referens',
    refLbl: 'Referens',
    expositor: 'Utstellare',
    hallLbl: 'Hall',
    standLbl: 'Monter',
    fechaPrev: 'Planerat datum',
    horaEst: 'Beraknad tid',
    descargaLbl: 'Lossningstyp',
    sigAsignar: 'Tilldela evenemang',
    registrarSinRef: 'Registrera utan referens',
    firmRgpd: 'GDPR-samtycke',
    prevImpacto: 'Konsekvensprognos',
    datosEmp: 'Foretagsuppgifter',
    guardarBtn: 'Spara',
    cancelarBtn: 'Avbryt',
    asignarBtn: 'Tilldela evenemang',
    backLbl: 'Tillbaka',
  },
  fi: {
    portalTitle: 'Yritysportaali',
    miEmpresa: 'Yritykseni',
    misVeh: 'Ajoneuvoni',
    asigEvento: 'Maarita tapahtuma',
    estadoVivo: 'Reaaliaikainen tila',
    nombreEmp: 'Yrityksen nimi',
    cifVat: 'Y-tunnus',
    contacto: 'Yhteyshenkilo',
    telefono: 'Puhelin',
    email: 'Sahkoposti',
    guardar: 'Tallenna',
    cancelar: 'Peruuta',
    addVeh: 'Lisaa ajoneuvo',
    salirBtn: 'Kirjaudu ulos',
    registrarEmp: 'Rekisteroidy yrityksena',
    accederPortal: 'Siirry portaaliin',
    empresaBtn: 'Yritys / Naytteilleasettaja / Asentaja',
    operadorBtn: 'Operaattori',
    syncOk: 'Synkronoitu',
    exito: 'Rekisterointi valmis!',
    exitoDesc: 'Teilla on paaay portaaliin.',
    firmaReg: 'Allekirjoitus rekisteroity',
    c1: 'Olen lukenut ja hyvaksyn asiakirjan.',
    c2: 'Vahvistan etta olen lakisaateinen edustaja.',
    enviarOTP: 'Laheta koodi sahkopostilla',
    confirmarFirma: 'Vahvista allekirjoitus',
    reenviar: 'Laheta uudelleen',
    otpDesc: 'Syota 6-numeroinen koodi.',
    scroll: 'Vierita loppuun',
    conserv: 'Sailytetaan asti',
    idiomaDok: 'Asiakirjan kieli',
    sinVeh: 'Ei ajoneuvoja',
    verif: 'Vahvistettu',
    semi: 'Osittain vahvistettu',
    bloq: 'Estetty',
    espera: 'Odottaa',
    parking: 'Parkkipaikalla',
    dentro: 'Sisalla',
    sinAsig: 'Ei maaritetty',
    prerreg: 'Esirekisteroity',
    filtTodos: 'Kaikki tilat',
    filtFira: 'Firassa',
    filtPark: 'Ramppi/Pysäköinti',
    filtEspera: 'Odottaa',
    filtNone: 'Ei määritetty',
    conRefTab: 'Viitteen kanssa',
    sinRefTab: 'Ilman viitettä',
    thMatricula: 'Rek.numero',
    thTipo: 'Tyyppi',
    thConductor: 'Kuljettaja',
    thEstado: 'Tila',
    tipoTrailer: 'Perävaunu',
    tipoSemi: 'Puoliperävaunu',
    tipoCamion: 'Kuorma-auto',
    tipoFurgoneta: 'Pakettiauto',
    tipoOtro: 'Muu',
    sinRef: 'Ilman viitetta',
    refLbl: 'Viite',
    expositor: 'Naytteilleasettaja',
    hallLbl: 'Halli',
    standLbl: 'Osasto',
    fechaPrev: 'Suunniteltu paivays',
    horaEst: 'Arvioitu aika',
    descargaLbl: 'Purkaustyyppi',
    sigAsignar: 'Maarita tapahtumalle',
    registrarSinRef: 'Rekisteroi ilman viitetta',
    firmRgpd: 'GDPR-suostumus',
    prevImpacto: 'Vaikutusennuste',
    datosEmp: 'Yrityksen tiedot',
    guardarBtn: 'Tallenna',
    cancelarBtn: 'Peruuta',
    asignarBtn: 'Maarita tapahtumalle',
    backLbl: 'Takaisin',
  },
  el: {
    portalTitle: 'Πύλη Εταιρειών',
    miEmpresa: 'Η εταιρεία μου',
    misVeh: 'Τα οχήματά μου',
    asigEvento: 'Ανάθεση εκδήλωσης',
    estadoVivo: 'Ζωντανή κατάσταση',
    nombreEmp: 'Επωνυμία',
    cifVat: 'ΑΦΜ / ΦΠΑ',
    contacto: 'Επαφή',
    telefono: 'Τηλέφωνο',
    email: 'Email',
    guardar: 'Αποθήκευση',
    cancelar: 'Ακύρωση',
    addVeh: 'Προσθήκη οχήματος',
    salirBtn: 'Αποσύνδεση',
    registrarEmp: 'Εγγραφή εταιρείας',
    accederPortal: 'Είσοδος στην πύλη',
    empresaBtn: 'Εταιρεία / Εκθέτης / Τεχνικός',
    operadorBtn: 'Χειριστής',
    syncOk: 'Συγχρονισμένο',
    exito: 'Εγγραφή ολοκληρώθηκε!',
    exitoDesc: 'Έχετε πρόσβαση στην πύλη.',
    firmaReg: 'Υπογραφή καταχωρήθηκε',
    c1: 'Διάβασα και αποδέχομαι το έγγραφο.',
    c2: 'Επιβεβαιώνω ότι είμαι νόμιμος εκπρόσωπος.',
    enviarOTP: 'Αποστολή κωδικού μέσω email',
    confirmarFirma: 'Επιβεβαίωση υπογραφής',
    reenviar: 'Αποστολή ξανά',
    otpDesc: 'Εισαγάγετε τον 6ψήφιο κωδικό.',
    scroll: 'Μετακινηθείτε στο τέλος',
    conserv: 'Αποθηκεύεται έως',
    idiomaDok: 'Γλώσσα εγγράφου',
    sinVeh: 'Δεν υπάρχουν οχήματα',
    verif: 'Επαληθευμένο',
    semi: 'Μερικώς επαληθευμένο',
    bloq: 'Αποκλεισμένο',
    espera: 'Σε αναμονή',
    parking: 'Στο πάρκινγκ',
    dentro: 'Εντός',
    sinAsig: 'Μη ανατεθειμένο',
    prerreg: 'Προεγγεγραμμένο',
    filtTodos: 'Όλες οι καταστάσεις',
    filtFira: 'Εντός Fira',
    filtPark: 'Ράμπα/Πάρκινγκ',
    filtEspera: 'Αναμονή',
    filtNone: 'Μη ανατεθειμένο',
    conRefTab: 'Με αναφορά',
    sinRefTab: 'Χωρίς αναφορά',
    thMatricula: 'Πινακίδα',
    thTipo: 'Τύπος',
    thConductor: 'Οδηγός',
    thEstado: 'Κατάσταση',
    tipoTrailer: 'Ρυμουλκούμενο',
    tipoSemi: 'Ημιρυμουλκούμενο',
    tipoCamion: 'Φορτηγό',
    tipoFurgoneta: 'Βαν',
    tipoOtro: 'Άλλο',
    sinRef: 'Χωρίς αναφορά',
    refLbl: 'Αναφορά',
    expositor: 'Εκθέτης',
    hallLbl: 'Αίθουσα',
    standLbl: 'Περίπτερο',
    fechaPrev: 'Προγραμματισμένη ημερομηνία',
    horaEst: 'Εκτιμώμενη ώρα',
    descargaLbl: 'Τύπος εκφόρτωσης',
    sigAsignar: 'Ανάθεση σε εκδήλωση',
    registrarSinRef: 'Εγγραφή χωρίς αναφορά',
    firmRgpd: 'Συγκατάθεση GDPR',
    prevImpacto: 'Πρόβλεψη επιπτώσεων',
    datosEmp: 'Στοιχεία εταιρείας',
    guardarBtn: 'Αποθήκευση',
    cancelarBtn: 'Ακύρωση',
    asignarBtn: 'Ανάθεση σε εκδήλωση',
    backLbl: 'Πίσω',
  },
  bg: {
    portalTitle: 'Фирмен портал',
    miEmpresa: 'Моята фирма',
    misVeh: 'Моите превозни средства',
    asigEvento: 'Присвояване на събитие',
    estadoVivo: 'Живо състояние',
    nombreEmp: 'Наименование на фирмата',
    cifVat: 'ЕИК / ДДС',
    contacto: 'Лице за контакт',
    telefono: 'Телефон',
    email: 'Имейл',
    guardar: 'Запазване',
    cancelar: 'Отказ',
    addVeh: 'Добавяне на превозно средство',
    salirBtn: 'Изход',
    registrarEmp: 'Регистрирайте фирма',
    accederPortal: 'Вход в портала',
    empresaBtn: 'Фирма / Изложител / Монтьор',
    operadorBtn: 'Оператор',
    syncOk: 'Синхронизирано',
    exito: 'Регистрацията е завършена!',
    exitoDesc: 'Имате достъп до портала.',
    firmaReg: 'Подписът е регистриран',
    c1: 'Прочетох и приемам документа.',
    c2: 'Потвърждавам, че съм законен представител.',
    enviarOTP: 'Изпрати код на имейл',
    confirmarFirma: 'Потвърдете подписа',
    reenviar: 'Изпратете отново',
    otpDesc: 'Въведете 6-цифрения код.',
    scroll: 'Превъртете до края',
    conserv: 'Съхранява се до',
    idiomaDok: 'Език на документа',
    sinVeh: 'Няма превозни средства',
    verif: 'Потвърден',
    semi: 'Частично потвърден',
    bloq: 'Блокиран',
    espera: 'В изчакване',
    parking: 'На паркинга',
    dentro: 'Вътре',
    sinAsig: 'Непотвърден',
    prerreg: 'Предрегистриран',
    filtTodos: 'Всички статуси',
    filtFira: 'В Fira',
    filtPark: 'Рампа/Паркинг',
    filtEspera: 'Изчакване',
    filtNone: 'Неприсвоено',
    conRefTab: 'С референция',
    sinRefTab: 'Без референция',
    thMatricula: 'Регистрация',
    thTipo: 'Тип',
    thConductor: 'Шофьор',
    thEstado: 'Статус',
    tipoTrailer: 'Ремарке',
    tipoSemi: 'Полуремарке',
    tipoCamion: 'Камион',
    tipoFurgoneta: 'Бус',
    tipoOtro: 'Друго',
    sinRef: 'Без референция',
    refLbl: 'Референция',
    expositor: 'Изложител',
    hallLbl: 'Зала',
    standLbl: 'Щанд',
    fechaPrev: 'Планирана дата',
    horaEst: 'Приблизителен час',
    descargaLbl: 'Вид разтоварване',
    sigAsignar: 'Присвояване на събитие',
    registrarSinRef: 'Регистрация без референция',
    firmRgpd: 'Съгласие GDPR',
    prevImpacto: 'Прогноза за въздействие',
    datosEmp: 'Данни на фирмата',
    guardarBtn: 'Запазване',
    cancelarBtn: 'Отказ',
    asignarBtn: 'Присвояване на събитие',
    backLbl: 'Назад',
  },
  sk: {
    portalTitle: 'Firemný portál',
    miEmpresa: 'Moja firma',
    misVeh: 'Moje vozidlá',
    asigEvento: 'Priradiť udalosť',
    estadoVivo: 'Živý stav',
    nombreEmp: 'Názov spoločnosti',
    cifVat: 'DIČ / IČ DPH',
    contacto: 'Kontaktná osoba',
    telefono: 'Telefón',
    email: 'Email',
    guardar: 'Uložiť',
    cancelar: 'Zrušiť',
    addVeh: 'Pridať vozidlo',
    salirBtn: 'Odhlásiť',
    registrarEmp: 'Registrovať firmu',
    accederPortal: 'Vstup do portálu',
    empresaBtn: 'Firma / Vystavovateľ / Montér',
    operadorBtn: 'Operátor',
    syncOk: 'Synchronizované',
    exito: 'Registrácia dokončená!',
    exitoDesc: 'Máte prístup k portálu.',
    firmaReg: 'Podpis zaregistrovaný',
    c1: 'Prečítal som a akceptujem dokument.',
    c2: 'Potvrdzujem, že som zákonný zástupca.',
    enviarOTP: 'Odoslať kód emailom',
    confirmarFirma: 'Potvrdiť podpis',
    reenviar: 'Znova odoslať',
    otpDesc: 'Zadajte 6-miestny kód.',
    scroll: 'Posuňte na koniec',
    conserv: 'Uložené do',
    idiomaDok: 'Jazyk dokumentu',
    sinVeh: 'Žiadne vozidlá',
    verif: 'Overené',
    semi: 'Čiastočne overené',
    bloq: 'Blokované',
    espera: 'Čakanie',
    parking: 'Na parkovisku',
    dentro: 'Vnútri',
    sinAsig: 'Nepriradené',
    prerreg: 'Predregistrovaný',
    filtTodos: 'Všetky stavy',
    filtFira: 'Vo Fira',
    filtPark: 'Rampa/Parkovisko',
    filtEspera: 'Čakanie',
    filtNone: 'Nepriradené',
    conRefTab: 'S referenciou',
    sinRefTab: 'Bez referencie',
    thMatricula: 'ŠPZ',
    thTipo: 'Typ',
    thConductor: 'Vodič',
    thEstado: 'Stav',
    tipoTrailer: 'Príves',
    tipoSemi: 'Návesy',
    tipoCamion: 'Kamión',
    tipoFurgoneta: 'Dodávka',
    tipoOtro: 'Iné',
    sinRef: 'Bez referencie',
    refLbl: 'Referencia',
    expositor: 'Vystavovateľ',
    hallLbl: 'Hala',
    standLbl: 'Stánok',
    fechaPrev: 'Plánovaný dátum',
    horaEst: 'Odhadovaný čas',
    descargaLbl: 'Typ vykládky',
    sigAsignar: 'Priradiť k udalosti',
    registrarSinRef: 'Registrovať bez referencie',
    firmRgpd: 'Súhlas GDPR',
    prevImpacto: 'Prognóza dopadu',
    datosEmp: 'Firemné údaje',
    guardarBtn: 'Uložiť',
    cancelarBtn: 'Zrušiť',
    asignarBtn: 'Priradiť k udalosti',
    backLbl: 'Späť',
  },
  sl: {
    portalTitle: 'Portal podjetij',
    miEmpresa: 'Moje podjetje',
    misVeh: 'Moja vozila',
    asigEvento: 'Dodelitev dogodka',
    estadoVivo: 'Stanje v živo',
    nombreEmp: 'Ime podjetja',
    cifVat: 'Davčna številka / DDV',
    contacto: 'Kontaktna oseba',
    telefono: 'Telefon',
    email: 'E-pošta',
    guardar: 'Shrani',
    cancelar: 'Prekliči',
    addVeh: 'Dodaj vozilo',
    salirBtn: 'Odjava',
    registrarEmp: 'Registriraj podjetje',
    accederPortal: 'Vstop v portal',
    empresaBtn: 'Podjetje / Razstavljalec / Monter',
    operadorBtn: 'Operater',
    syncOk: 'Sinhronizirano',
    exito: 'Registracija končana!',
    exitoDesc: 'Imate dostop do portala.',
    firmaReg: 'Podpis registriran',
    c1: 'Prebral sem in sprejmem dokument.',
    c2: 'Potrjujem, da sem zakoniti zastopnik.',
    enviarOTP: 'Pošlji kodo po e-pošti',
    confirmarFirma: 'Potrdi podpis',
    reenviar: 'Pošlji znova',
    otpDesc: 'Vnesite 6-mestno kodo.',
    scroll: 'Pomaknite se do konca',
    conserv: 'Shranjeno do',
    idiomaDok: 'Jezik dokumenta',
    sinVeh: 'Ni vozil',
    verif: 'Preverjeno',
    semi: 'Delno preverjeno',
    bloq: 'Blokirano',
    espera: 'V čakanju',
    parking: 'Na parkirišču',
    dentro: 'Znotraj',
    sinAsig: 'Nedodeljeno',
    prerreg: 'Predregistriran',
    filtTodos: 'Vsi statusi',
    filtFira: 'V Fira',
    filtPark: 'Rampa/Parkirišče',
    filtEspera: 'Čakanje',
    filtNone: 'Nedodeljeno',
    conRefTab: 'Z referenco',
    sinRefTab: 'Brez reference',
    thMatricula: 'Registrska',
    thTipo: 'Tip',
    thConductor: 'Voznik',
    thEstado: 'Status',
    tipoTrailer: 'Prikolica',
    tipoSemi: 'Polprikolica',
    tipoCamion: 'Tovornjak',
    tipoFurgoneta: 'Kombi',
    tipoOtro: 'Drugo',
    sinRef: 'Brez reference',
    refLbl: 'Referenca',
    expositor: 'Razstavljalec',
    hallLbl: 'Dvorana',
    standLbl: 'Razstavni prostor',
    fechaPrev: 'Načrtovani datum',
    horaEst: 'Ocenjeni čas',
    descargaLbl: 'Vrsta razkladanja',
    sigAsignar: 'Dodeli dogodku',
    registrarSinRef: 'Registriraj brez reference',
    firmRgpd: 'Soglasje GDPR',
    prevImpacto: 'Napoved vpliva',
    datosEmp: 'Podatki podjetja',
    guardarBtn: 'Shrani',
    cancelarBtn: 'Prekliči',
    asignarBtn: 'Dodeli dogodku',
    backLbl: 'Nazaj',
  },
  ca: {
    portalTitle: 'Portal Empreses',
    miEmpresa: 'La meva empresa',
    misVeh: 'Els meus vehicles',
    asigEvento: 'Assignar esdeveniment',
    estadoVivo: 'Estat en viu',
    nombreEmp: 'Nom empresa',
    cifVat: 'CIF / NIF / VAT',
    contacto: 'Persona de contacte',
    telefono: 'Telefon',
    email: 'Email',
    guardar: 'Desar',
    cancelar: 'Cancel·lar',
    addVeh: 'Afegir vehicle',
    salirBtn: 'Sortir',
    registrarEmp: 'Registrar la meva empresa',
    accederPortal: 'Accedir al portal',
    empresaBtn: 'Empresa / Expositor / Muntador',
    operadorBtn: 'Operador',
    syncOk: 'Sincronitzat',
    exito: 'Registre completat!',
    exitoDesc: 'Ja tens acces al portal.',
    firmaReg: 'Firma registrada',
    c1: 'He llegit i accepto el document.',
    c2: 'Confirmo que soc representant legal.',
    enviarOTP: 'Enviar codi per email',
    confirmarFirma: 'Confirmar firma',
    reenviar: 'Reenviar',
    otpDesc: 'Introdueix el codi de 6 digits.',
    scroll: 'Desplaceu fins al final',
    conserv: 'Conservació fins',
    idiomaDok: 'Idioma document',
    sinVeh: 'Sense vehicles',
    verif: 'Verificada',
    semi: 'Semi-verificada',
    bloq: 'Bloquejada',
    espera: 'En espera',
    parking: 'Al parking',
    dentro: 'Dins',
    sinAsig: 'No assignat',
    prerreg: 'Pre-registrat',
    filtTodos: 'Tots els estats',
    filtFira: 'Dins la Fira',
    filtPark: 'Rampa/Aparcament',
    filtEspera: 'En espera',
    filtNone: 'Sense assignar',
    conRefTab: 'Amb referència',
    sinRefTab: 'Sense referència',
    thMatricula: 'Matrícula',
    thTipo: 'Tipus',
    thConductor: 'Conductor',
    thEstado: 'Estat',
    tipoTrailer: 'Remolc',
    tipoSemi: 'Semirremolc',
    tipoCamion: 'Camió',
    tipoFurgoneta: 'Furgoneta',
    tipoOtro: 'Altre',
    sinRef: 'Sense referencia',
    refLbl: 'Referencia',
    expositor: 'Expositor',
    hallLbl: 'Hall',
    standLbl: 'Stand',
    fechaPrev: 'Data prevista',
    horaEst: 'Hora estimada',
    descargaLbl: 'Tipus descarrega',
    sigAsignar: 'Assignar a esdeveniment',
    registrarSinRef: 'Registrar sense referencia',
    firmRgpd: 'Consentiment RGPD',
    prevImpacto: 'Previsio impacte',
    datosEmp: 'Dades de la empresa',
    guardarBtn: 'Desar',
    cancelarBtn: 'Cancel·lar',
    asignarBtn: 'Assignar a esdeveniment',
    backLbl: 'Tornar',
  },
  gl: {
    portalTitle: 'Portal Empresas',
    miEmpresa: 'A mina empresa',
    misVeh: 'Os meus vehículos',
    asigEvento: 'Asignar evento',
    estadoVivo: 'Estado en vivo',
    nombreEmp: 'Nome empresa',
    cifVat: 'CIF / NIF / VAT',
    contacto: 'Persoa de contacto',
    telefono: 'Telefono',
    email: 'Email',
    guardar: 'Gardar',
    cancelar: 'Cancelar',
    addVeh: 'Engadir vehiculo',
    salirBtn: 'Saír',
    registrarEmp: 'Rexistrar a mina empresa',
    accederPortal: 'Acceder ao portal',
    empresaBtn: 'Empresa / Expositor / Montador',
    operadorBtn: 'Operador',
    syncOk: 'Sincronizado',
    exito: 'Rexistro completado!',
    exitoDesc: 'Xa tes acceso ao portal.',
    firmaReg: 'Firma rexistrada',
    c1: 'Lin e acepto o documento.',
    c2: 'Confirmo que son representante legal.',
    enviarOTP: 'Enviar codigo por email',
    confirmarFirma: 'Confirmar firma',
    reenviar: 'Reenviar',
    otpDesc: 'Introduce o codigo de 6 dixitos.',
    scroll: 'Desplazate ata o final',
    conserv: 'Conservacion ata',
    idiomaDok: 'Idioma documento',
    sinVeh: 'Sen vehículos',
    verif: 'Verificada',
    semi: 'Semi-verificada',
    bloq: 'Bloqueada',
    espera: 'En espera',
    parking: 'No parking',
    dentro: 'Dentro',
    sinAsig: 'Sen asignar',
    prerreg: 'Pre-rexistrado',
    filtTodos: 'Todos os estados',
    filtFira: 'Dentro da Fira',
    filtPark: 'Rampa/Aparcamento',
    filtEspera: 'En espera',
    filtNone: 'Sen asignar',
    conRefTab: 'Con referencia',
    sinRefTab: 'Sen referencia',
    thMatricula: 'Matrícula',
    thTipo: 'Tipo',
    thConductor: 'Condutor',
    thEstado: 'Estado',
    tipoTrailer: 'Remolque',
    tipoSemi: 'Semirremolque',
    tipoCamion: 'Camión',
    tipoFurgoneta: 'Furgoneta',
    tipoOtro: 'Outro',
    sinRef: 'Sen referencia',
    refLbl: 'Referencia',
    expositor: 'Expositor',
    hallLbl: 'Hall',
    standLbl: 'Stand',
    fechaPrev: 'Data prevista',
    horaEst: 'Hora estimada',
    descargaLbl: 'Tipo descarga',
    sigAsignar: 'Asignar ao evento',
    registrarSinRef: 'Rexistrar sen referencia',
    firmRgpd: 'Consentimento RXPD',
    prevImpacto: 'Prevision impacto',
    datosEmp: 'Datos da empresa',
    guardarBtn: 'Gardar',
    cancelarBtn: 'Cancelar',
    asignarBtn: 'Asignar ao evento',
    backLbl: 'Volver',
  },
  eu: {
    portalTitle: 'Enpresen Ataria',
    miEmpresa: 'Nire enpresa',
    misVeh: 'Nire ibilgailuak',
    asigEvento: 'Ekitaldi esleitu',
    estadoVivo: 'Egoera zuzenean',
    nombreEmp: 'Enpresaren izena',
    cifVat: 'IFZ / BEZ',
    contacto: 'Kontaktu-pertsona',
    telefono: 'Telefonoa',
    email: 'Emaila',
    guardar: 'Gorde',
    cancelar: 'Utzi',
    addVeh: 'Ibilgailua gehitu',
    salirBtn: 'Irten',
    registrarEmp: 'Enpresa erregistratu',
    accederPortal: 'Atzitu ataria',
    empresaBtn: 'Enpresa / Erakusle / Muntatzaile',
    operadorBtn: 'Operadore',
    syncOk: 'Sinkronizatuta',
    exito: 'Erregistroa osatuta!',
    exitoDesc: 'Atarirako sarbidea duzu.',
    firmaReg: 'Sinadura erregistratuta',
    c1: 'Dokumentua irakurri eta onartzen dut.',
    c2: 'Legezko ordezkaria naizela bermatzen dut.',
    enviarOTP: 'Bidali kodea emailez',
    confirmarFirma: 'Sinadura baieztatu',
    reenviar: 'Berriro bidali',
    otpDesc: 'Sartu 6 digituko kodea.',
    scroll: 'Mugitu amaieraraino',
    conserv: 'Gordetze-epea',
    idiomaDok: 'Dokumentuaren hizkuntza',
    sinVeh: 'Ez dago ibilgailurik',
    verif: 'Egiaztatuta',
    semi: 'Erdizka egiaztatuta',
    bloq: 'Blokeatuta',
    espera: 'Itxaroten',
    parking: 'Aparkalekuan',
    dentro: 'Barruan',
    sinAsig: 'Esleitu gabe',
    prerreg: 'Aurretiaz erregistratuta',
    filtTodos: 'Egoera guztiak',
    filtFira: 'Fira barruan',
    filtPark: 'Arrapala/Aparkamendua',
    filtEspera: 'Itxaroten',
    filtNone: 'Esleitu gabe',
    conRefTab: 'Erreferentziarekin',
    sinRefTab: 'Erreferentziarik gabe',
    thMatricula: 'Matrikula',
    thTipo: 'Mota',
    thConductor: 'Gidaria',
    thEstado: 'Egoera',
    tipoTrailer: 'Atoiaren',
    tipoSemi: 'Erdi-atoiaren',
    tipoCamion: 'Kamioia',
    tipoFurgoneta: 'Furgoneta',
    tipoOtro: 'Beste',
    sinRef: 'Erreferentziarik gabe',
    refLbl: 'Erreferentzia',
    expositor: 'Erakuslea',
    hallLbl: 'Areto',
    standLbl: 'Stand',
    fechaPrev: 'Aurreikusitako data',
    horaEst: 'Gutxi gorabeherako ordua',
    descargaLbl: 'Deskarga mota',
    sigAsignar: 'Ekitaldiari esleitu',
    registrarSinRef: 'Erreferentziarik gabe erregistratu',
    firmRgpd: 'GDPR adostasuna',
    prevImpacto: 'Eraginaren aurreikuspena',
    datosEmp: 'Enpresaren datuak',
    guardarBtn: 'Gorde',
    cancelarBtn: 'Utzi',
    asignarBtn: 'Ekitaldiari esleitu',
    backLbl: 'Itzuli',
  },
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
  // 'semi' and 'verified' can both access - semi sees only their own data
  // Only 'blocked' is denied
  if (user.nivel === 'blocked') {
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#374151"><div style="text-align:center;padding:32px"><div style="font-size:48px;margin-bottom:12px">🚫</div><div style="font-size:18px;font-weight:700;margin-bottom:8px">Cuenta bloqueada</div><div style="font-size:13px;color:#6b7280">Contacta con el administrador.</div></div></div>';
    return;
  }

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
  const LANGS = ['es','en','fr','de','it','pt','pl','ro','nl','hu','cs','hr','uk','ru','tr','ar','sv','fi','el','bg','sk','sl','ca','gl','eu'];

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
