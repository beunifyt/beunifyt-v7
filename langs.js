// ═══════════════════════════════════════════════════════════
// LANGS.JS — Sistema Multiidioma BeUnifyT V7
// ═══════════════════════════════════════════════════════════

export const LANGS_UI=[
  {code:'es',flag:'🇪🇸',name:'Español'},
  {code:'ca',flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#FCDD09"/><rect y="1.75" width="20" height="1.75" fill="#DA121A"/><rect y="5.25" width="20" height="1.75" fill="#DA121A"/><rect y="8.75" width="20" height="1.75" fill="#DA121A"/><rect y="12.25" width="20" height="1.75" fill="#DA121A"/></svg>',name:'Català'},
  {code:'eu',flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#D52B1E"/><rect x="8" width="4" height="14" fill="#007A3D"/><rect y="5" width="20" height="4" fill="#007A3D"/><line x1="0" y1="0" x2="20" y2="14" stroke="#FFFFFF" stroke-width="2.5"/><line x1="20" y1="0" x2="0" y2="14" stroke="#FFFFFF" stroke-width="2.5"/><rect x="8" width="4" height="14" fill="#007A3D"/><rect y="5" width="20" height="4" fill="#007A3D"/></svg>',name:'Euskara'},
  {code:'gl',flag:'<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:middle;border-radius:1px;border:0.5px solid #bbb"><rect width="20" height="14" fill="#FFFFFF"/><polygon points="0,0 5,0 20,14 15,14" fill="#00A2E2"/></svg>',name:'Galego'},
  {code:'en',flag:'🇬🇧',name:'English'},
  {code:'fr',flag:'🇫🇷',name:'Français'},
  {code:'de',flag:'🇩🇪',name:'Deutsch'},
  {code:'it',flag:'🇮🇹',name:'Italiano'},
  {code:'pt',flag:'🇵🇹',name:'Português'},
  {code:'pl',flag:'🇵🇱',name:'Polski'},
  {code:'ro',flag:'🇷🇴',name:'Română'},
  {code:'nl',flag:'🇳🇱',name:'Nederlands'},
  {code:'hu',flag:'🇭🇺',name:'Magyar'},
  {code:'cs',flag:'🇨🇿',name:'Čeština'},
  {code:'hr',flag:'🇭🇷',name:'Hrvatski'},
  {code:'uk',flag:'🇺🇦',name:'Українська'},
  {code:'ru',flag:'🇷🇺',name:'Русский'},
  {code:'tr',flag:'🇹🇷',name:'Türkçe'},
  {code:'ar',flag:'🇸🇦',name:'العربية'},
  {code:'sv',flag:'🇸🇪',name:'Svenska'},
  {code:'fi',flag:'🇫🇮',name:'Suomi'},
  {code:'el',flag:'🇬🇷',name:'Ελληνικά'},
  {code:'bg',flag:'🇧🇬',name:'Български'},
  {code:'sk',flag:'🇸🇰',name:'Slovenčina'},
  {code:'sl',flag:'🇸🇮',name:'Slovenščina'}
];

export const LANGS={
  es:{n:'🇪🇸 Español',T:'PASE DE ENTRADA',Mat:'Matrícula Tractora',Rem:'Remolque',Emp:'Empresa',Mon:'Montador',Exp:'Expositor',Hal:'Hall',Std:'Stand',PuH:'Puerta Hall',Nom:'Nombre',Ape:'Apellido',Pas:'Pasaporte / DNI',Tel:'Teléfono',Eml:'Email',Ent:'Hora Ingreso',Cal:'Nº Llamador',Ref:'Referencia',SC:'Firma del Conductor',SA:'Sello / Firma Control de Acceso',OK:'EN RECINTO',OUT:'SALIDA REGISTRADA',NoOp:'⚠ FUERA OPERATIVA',OpOk:'OPERATIVA OK',Obs:'Observaciones',DatosVeh:'DATOS VEHÍCULO',DatosRes:'DATOS RESERVA',DatosPer:'DATOS PERSONALES',OfRXL:'USO OFICINA RXL',FechaNac:'Fecha Nacimiento',FechaExp:'Fecha Expiración',Pais:'País',Tipo:'Tipo Vehículo',Descarga:'Serv. Descarga/Carga',DescMano:'Handball',DescMaq:'Forklift'},
  en:{n:'🇬🇧 English',T:'ENTRY PASS',Mat:'Tractor Plate',Rem:'Trailer',Emp:'Company',Mon:'Installer',Exp:'Exhibitor',Hal:'Hall',Std:'Stand',PuH:'Hall Gate',Nom:'First Name',Ape:'Last Name',Pas:'Passport / ID',Tel:'Phone',Eml:'Email',Ent:'Parking Entry',Cal:'Caller No.',Ref:'Reference',SC:'Driver Signature',SA:'Access Control Stamp',OK:'ON PREMISES',OUT:'EXIT REGISTERED',NoOp:'⚠ NOT IN OPERATION',OpOk:'OPERATION OK',Obs:'Observations',DatosVeh:'VEHICLE DATA',DatosRes:'BOOKING DETAILS',DatosPer:'DRIVER DATA',OfRXL:'OFFICE USE RXL',FechaNac:'Date of Birth',FechaExp:'Expiry Date',Pais:'Country',Tipo:'Vehicle Type',Descarga:'Unloading',DescMano:'By Hand',DescMaq:'Machinery'},
  fr:{n:'🇫🇷 Français',T:'LAISSEZ-PASSER',Mat:'Immatriculation',Rem:'Remorque',Emp:'Société',Mon:'Installateur',Exp:'Exposant',Hal:'Hall',Std:'Stand',PuH:'Porte Hall',Nom:'Prénom',Ape:'Nom',Pas:'Passeport',Tel:'Téléphone',Eml:'Email',Ent:'Entrée',Cal:'N° Appelant',Ref:'Référence',SC:'Signature Conducteur',SA:'Cachet Contrôle',OK:'DANS L\'ENCEINTE',OUT:'SORTIE',NoOp:'⚠ HORS OPÉRATION',OpOk:'OPÉRATION OK',Obs:'Observations',DatosVeh:'DONNÉES VÉHICULE',DatosRes:'DONNÉES RÉSERVATION',DatosPer:'DONNÉES CONDUCTEUR',OfRXL:'USAGE BUREAU RXL',FechaNac:'Date de Naissance',FechaExp:'Date d\'Expiration',Pais:'Pays',Tipo:'Type de Véhicule',Descarga:'Déchargement',DescMano:'À la Main',DescMaq:'Machinerie'},
  de:{n:'🇩🇪 Deutsch',T:'EINLASSAUSWEIS',Mat:'Kennzeichen',Rem:'Anhänger',Emp:'Firma',Mon:'Monteur',Exp:'Aussteller',Hal:'Halle',Std:'Stand',PuH:'Hallentor',Nom:'Vorname',Ape:'Nachname',Pas:'Reisepass',Tel:'Telefon',Eml:'Email',Ent:'Einfahrt',Cal:'Anrufer Nr.',Ref:'Referenz',SC:'Unterschrift Fahrer',SA:'Stempel Zugangskontrolle',OK:'IM GELÄNDE',OUT:'AUSFAHRT',NoOp:'⚠ AUSSER BETRIEB',OpOk:'BETRIEB OK',Obs:'Bemerkungen',DatosVeh:'FAHRZEUGDATEN',DatosRes:'BUCHUNGSDETAILS',DatosPer:'FAHRERDATEN',OfRXL:'BÜRO RXL',FechaNac:'Geburtsdatum',FechaExp:'Ablaufdatum',Pais:'Land',Tipo:'Fahrzeugtyp',Descarga:'Entladung',DescMano:'Manuell',DescMaq:'Maschinell'},
  it:{n:'🇮🇹 Italiano',T:'PASS DI INGRESSO',Mat:'Targa',Rem:'Rimorchio',Emp:'Azienda',Mon:'Montatore',Exp:'Espositore',Hal:'Padiglione',Std:'Stand',PuH:'Porta Hall',Nom:'Nome',Ape:'Cognome',Pas:'Passaporto',Tel:'Telefono',Eml:'Email',Ent:'Ingresso',Cal:'N° Chiamante',Ref:'Riferimento',SC:'Firma Conducente',SA:'Timbro Controllo',OK:'IN RECINTO',OUT:'USCITA',NoOp:'⚠ FUORI OPERATIVA',OpOk:'OPERATIVA OK',Obs:'Note',DatosVeh:'DATI VEICOLO',DatosRes:'DATI PRENOTAZIONE',DatosPer:'DATI CONDUCENTE',OfRXL:'USO UFFICIO RXL',FechaNac:'Data di Nascita',FechaExp:'Data di Scadenza',Pais:'Paese',Tipo:'Tipo Veicolo',Descarga:'Scarico',DescMano:'A Mano',DescMaq:'Macchinari'},
  pl:{n:'🇵🇱 Polski',T:'PRZEPUSTKA',Mat:'Rejestracja',Rem:'Przyczepa',Emp:'Firma',Mon:'Monter',Exp:'Wystawca',Hal:'Hala',Std:'Stoisko',PuH:'Brama Hali',Nom:'Imię',Ape:'Nazwisko',Pas:'Paszport',Tel:'Telefon',Eml:'Email',Ent:'Wejście',Cal:'Nr Wywołania',Ref:'Referencja',SC:'Podpis Kierowcy',SA:'Pieczęć Kontroli',OK:'NA TERENIE',OUT:'WYJŚCIE',NoOp:'⚠ POZA OPERACJĄ',OpOk:'OPERACJA OK',Obs:'Uwagi',DatosVeh:'DANE POJAZDU',DatosRes:'DANE REZERWACJI',DatosPer:'DANE KIEROWCY',OfRXL:'BIURO RXL',FechaNac:'Data Urodzenia',FechaExp:'Data Wygaśnięcia',Pais:'Kraj',Tipo:'Typ Pojazdu',Descarga:'Rozładunek',DescMano:'Ręczny',DescMaq:'Maszynowy'},
  ro:{n:'🇷🇴 Română',T:'PERMIS DE INTRARE',Mat:'Înmatriculare',Rem:'Remorcă',Emp:'Companie',Mon:'Montator',Exp:'Expozant',Hal:'Hală',Std:'Stand',PuH:'Poartă Hală',Nom:'Prenume',Ape:'Nume',Pas:'Pașaport',Tel:'Telefon',Eml:'Email',Ent:'Intrare',Cal:'Nr. Apelant',Ref:'Referință',SC:'Semnătura Șoferului',SA:'Ștampila Control',OK:'ÎN INCINTĂ',OUT:'IEȘIRE',NoOp:'⚠ ÎN AFARA OP.',OpOk:'OPERATIV OK',Obs:'Observații',DatosVeh:'DATE VEHICUL',DatosRes:'DATE REZERVARE',DatosPer:'DATE ŞOFER',OfRXL:'BIROU RXL',FechaNac:'Data Naşterii',FechaExp:'Data Expirării',Pais:'Ţară',Tipo:'Tip Vehicul',Descarga:'Descărcare',DescMano:'Manual',DescMaq:'Mecanic'},
  nl:{n:'🇳🇱 Nederlands',T:'TOEGANGSPAS',Mat:'Kenteken',Rem:'Aanhanger',Emp:'Bedrijf',Mon:'Monteur',Exp:'Exposant',Hal:'Hal',Std:'Stand',PuH:'Halpoort',Nom:'Voornaam',Ape:'Achternaam',Pas:'Paspoort',Tel:'Telefoon',Eml:'Email',Ent:'Ingang',Cal:'Beller Nr.',Ref:'Referentie',SC:'Handtekening Bestuurder',SA:'Stempel Toegangscontrole',OK:'OP TERREIN',OUT:'UITGANG',NoOp:'⚠ BUITEN OPERATIE',OpOk:'OPERATIE OK',Obs:'Opmerkingen',DatosVeh:'VOERTUIGGEGEVENS',DatosRes:'BOEKINGSDETAILS',DatosPer:'GEGEVENS BESTUURDER',OfRXL:'KANTOOR RXL',FechaNac:'Geboortedatum',FechaExp:'Vervaldatum',Pais:'Land',Tipo:'Voertuigtype',Descarga:'Lossen',DescMano:'Handmatig',DescMaq:'Mechanisch'},
  pt:{n:'🇵🇹 Português',T:'PASSE DE ENTRADA',Mat:'Matrícula',Rem:'Reboque',Emp:'Empresa',Mon:'Montador',Exp:'Expositor',Hal:'Hall',Std:'Stand',PuH:'Porta Hall',Nom:'Nome',Ape:'Apelido',Pas:'Passaporte',Tel:'Telefone',Eml:'Email',Ent:'Entrada',Cal:'N° Chamador',Ref:'Referência',SC:'Assinatura Condutor',SA:'Carimbo Controlo',OK:'NO RECINTO',OUT:'SAÍDA',NoOp:'⚠ FORA DE OPERAÇÃO',OpOk:'OPERAÇÃO OK',Obs:'Observações',DatosVeh:'DADOS VEÍCULO',DatosRes:'DADOS RESERVA',DatosPer:'DADOS CONDUTOR',OfRXL:'USO ESCRITÓRIO RXL',FechaNac:'Data de Nascimento',FechaExp:'Data de Expiração',Pais:'País',Tipo:'Tipo de Veículo',Descarga:'Descarga',DescMano:'Manual',DescMaq:'Maquinaria'},
  hu:{n:'🇭🇺 Magyar',T:'BELÉPÉSI ENGEDÉLY',Mat:'Rendszám',Rem:'Pótkocsi',Emp:'Cég',Mon:'Szerelő',Exp:'Kiállító',Hal:'Csarnok',Std:'Stand',PuH:'Csarnok kapu',Nom:'Keresztnév',Ape:'Vezetéknév',Pas:'Útlevél',Tel:'Telefon',Eml:'Email',Ent:'Belépés',Cal:'Hívó száma',Ref:'Referencia',SC:'Sofőr aláírása',SA:'Ellenőrzési pecsét',OK:'A TERÜLETEN',OUT:'KILÉPÉS',NoOp:'⚠ ÜZEMEN KÍVÜL',OpOk:'ÜZEM OK',Obs:'Megjegyzések',DatosVeh:'JÁRMŰ ADATOK',DatosRes:'FOGLALÁS ADATOK',DatosPer:'SOFŐR ADATOK',OfRXL:'IRODA RXL',FechaNac:'Születési Dátum',FechaExp:'Lejárati Dátum',Pais:'Ország',Tipo:'Jármű Típus',Descarga:'Kirakodás',DescMano:'Kézi',DescMaq:'Gépi'},
  hr:{n:'🇭🇷 Hrvatski',T:'ULAZNA PROPUSNICA',Mat:'Registracija',Rem:'Prikolica',Emp:'Tvrtka',Mon:'Monter',Exp:'Izlagač',Hal:'Dvorana',Std:'Štand',PuH:'Vrata hale',Nom:'Ime',Ape:'Prezime',Pas:'Putovnica',Tel:'Telefon',Eml:'Email',Ent:'Ulaz',Cal:'Broj pozivatelja',Ref:'Referenca',SC:'Potpis vozača',SA:'Pečat kontrole',OK:'NA PROSTORU',OUT:'IZLAZ',NoOp:'⚠ IZVAN POGONA',OpOk:'POGON OK',Obs:'Napomene',DatosVeh:'PODACI VOZILA',DatosRes:'DETALJI REZERVACIJE',DatosPer:'PODACI VOZAČA',OfRXL:'URED RXL',FechaNac:'Datum Rođenja',FechaExp:'Datum Isteka',Pais:'Zemlja',Tipo:'Vrsta Vozila',Descarga:'Istovar',DescMano:'Ručno',DescMaq:'Strojno'},
  cs:{n:'🇨🇿 Čeština',T:'VSTUPNÍ PRŮKAZ',Mat:'SPZ',Rem:'Přívěs',Emp:'Firma',Mon:'Montér',Exp:'Vystavovatel',Hal:'Hala',Std:'Stánek',PuH:'Brána haly',Nom:'Jméno',Ape:'Příjmení',Pas:'Pas/OP',Tel:'Telefon',Eml:'Email',Ent:'Vstup',Cal:'Číslo Volajícího',Ref:'Reference',SC:'Podpis Řidiče',SA:'Razítko Kontroly',OK:'V AREÁLU',OUT:'VÝJEZD',NoOp:'⚠ MIMO PROVOZ',OpOk:'PROVOZ OK',Obs:'Poznámky',DatosVeh:'ÚDAJE VOZIDLA',DatosRes:'ÚDAJE REZERVACE',DatosPer:'ÚDAJE ŘIDIČE',OfRXL:'KANCELÁŘ RXL',FechaNac:'Datum narození',FechaExp:'Datum expirace',Pais:'Země',Tipo:'Typ vozidla',Descarga:'Vykládka',DescMano:'Ručně',DescMaq:'Strojně'},
  sk:{n:'🇸🇰 Slovenčina',T:'VSTUPNÝ PREUKAZ',Mat:'ŠPZ',Rem:'Prívěs',Emp:'Firma',Mon:'Montér',Exp:'Vystavovateľ',Hal:'Hala',Std:'Stánok',PuH:'Brána haly',Nom:'Meno',Ape:'Priezvisko',Pas:'Pas/OP',Tel:'Telefón',Eml:'Email',Ent:'Vstup',Cal:'Číslo Volajúceho',Ref:'Referencia',SC:'Podpis Vodiča',SA:'Pečiatka Kontroly',OK:'V AREÁLI',OUT:'VÝJAZD',NoOp:'⚠ MIMO PREVÁDZKY',OpOk:'PREVÁDZKA OK',Obs:'Poznámky',DatosVeh:'ÚDAJE VOZIDLA',DatosRes:'REZERVAČNÉ ÚDAJE',DatosPer:'ÚDAJE VODIČA',OfRXL:'KANCELÁRIA RXL',FechaNac:'Dátum narodenia',FechaExp:'Dátum expirácie',Pais:'Krajina',Tipo:'Typ vozidla',Descarga:'Vykládka',DescMano:'Ručne',DescMaq:'Strojovo'}
};

export const I18N={
  es:{dash:'📊 Dashboard',ingresos:'🔖 Referencia',ingresos2:'🚛 Ingresos',flota:'📦 Embalaje',conductores:'👤 Conductores',agenda:'📅 Agenda',analytics:'📈 Análisis',vehiculos:'📜 Historial',auditoria:'📂 Archivos',recintos:'🏟 Recintos',usuarios:'👥 Usuarios',eventos:'📅 Eventos',papelera:'🗑 Papelera',mensajes:'📢 Mensajes',lang_ok:'Idioma guardado',impresion:'🖨 Impresión'},
  en:{dash:'📊 Dashboard',ingresos:'🔖 Reference',ingresos2:'🚛 Access',flota:'📦 Packaging',conductores:'👤 Drivers',agenda:'📅 Agenda',analytics:'📈 Analytics',vehiculos:'📜 History',auditoria:'📂 Files',recintos:'🏟 Venues',usuarios:'👥 Users',eventos:'📅 Events',papelera:'🗑 Trash',mensajes:'📢 Messages',lang_ok:'Language saved',impresion:'🖨 Print'},
  fr:{dash:'📊 Tableau',ingresos:'🔖 Référence',ingresos2:'🚛 Accès',flota:'📦 Emballage',conductores:'👤 Chauffeurs',agenda:'📅 Agenda',analytics:'📈 Analytique',vehiculos:'📜 Historique',auditoria:'📂 Fichiers',recintos:'🏟 Lieux',usuarios:'👥 Utilisateurs',eventos:'📅 Événements',papelera:'🗑 Corbeille',mensajes:'📢 Messages',lang_ok:'Langue sauvegardée',impresion:'🖨 Impression'},
  de:{dash:'📊 Dashboard',ingresos:'🔖 Referenz',ingresos2:'🚛 Zugang',flota:'📦 Verpackung',conductores:'👤 Fahrer',agenda:'📅 Agenda',analytics:'📈 Analytik',vehiculos:'📜 Verlauf',auditoria:'📂 Dateien',recintos:'🏟 Veranstaltungsorte',usuarios:'👥 Benutzer',eventos:'📅 Events',papelera:'🗑 Papierkorb',mensajes:'📢 Nachrichten',lang_ok:'Sprache gespeichert',impresion:'🖨 Druck'},
  pl:{dash:'📊 Pulpit',ingresos:'🔖 Referencja',ingresos2:'🚛 Wejścia',flota:'📦 Pakowanie',conductores:'👤 Kierowcy',agenda:'📅 Agenda',analytics:'📈 Analityka',vehiculos:'📜 Historia',auditoria:'📂 Pliki',recintos:'🏟 Obiekty',usuarios:'👥 Użytkownicy',eventos:'📅 wydarzenia',papelera:'🗑 Kosz',mensajes:'📢 Wiadomości',lang_ok:'Język zapisany',impresion:'🖨 Druk'},
  ro:{dash:'📊 Panou',ingresos:'🔖 Referință',ingresos2:'🚛 Intrări',flota:'📦 Ambalare',conductores:'👤 Șoferi',agenda:'📅 Agendă',analytics:'📈 Analiză',vehiculos:'📜 Istoric',auditoria:'📂 Fișiere',recintos:'🏟 Locații',usuarios:'👥 Utilizatori',eventos:'📅 Evenimente',papelera:'🗑 Coș',mensajes:'📢 Mesaje',lang_ok:'Limbă salvată',impresion:'🖨 Tipărire'},
  it:{dash:'📊 Dashboard',ingresos:'🔖 Riferimento',ingresos2:'🚛 Accessi',flota:'📦 Imballaggio',conductores:'👤 Autisti',agenda:'📅 Agenda',analytics:'📈 Analisi',vehiculos:'📜 Cronologia',auditoria:'📂 File',recintos:'🏟 Sedi',usuarios:'👥 Utenti',eventos:'📅 Eventi',papelera:'🗑 Cestino',mensajes:'📢 Messaggi',lang_ok:'Lingua salvata',impresion:'🖨 Stampa'},
  cs:{dash:'📊 Dashboard',ingresos:'🔖 Reference',ingresos2:'🚛 Vstupy',flota:'📦 Balení',conductores:'👤 Řidiči',agenda:'📅 Agenda',analytics:'📈 Analýza',vehiculos:'📜 Historie',auditoria:'📂 Soubory',recintos:'🏟 Prostory',usuarios:'👥 Uživatelé',eventos:'📅 Události',papelera:'🗑 Koš',mensajes:'📢 Zprávy',lang_ok:'Jazyk uložen',impresion:'🖨 Tisk'},
  nl:{dash:'📊 Dashboard',ingresos:'🔖 Referentie',ingresos2:'🚛 Toegang',flota:'📦 Verpakking',conductores:'👤 Chauffeurs',agenda:'📅 Agenda',analytics:'📈 Analyse',vehiculos:'📜 Geschiedenis',auditoria:'📂 Bestanden',recintos:'🏟 Locaties',usuarios:'👥 Gebruikers',eventos:'📅 Evenementen',papelera:'🗑 Prullenbak',mensajes:'📢 Berichten',lang_ok:'Taal opgeslagen',impresion:'🖨 Afdrukken'},
  pt:{dash:'📊 Painel',ingresos:'🔖 Referência',ingresos2:'🚛 Acessos',flota:'📦 Embalagem',conductores:'👤 Motoristas',agenda:'📅 Agenda',analytics:'📈 Análise',vehiculos:'📜 Histórico',auditoria:'📂 Arquivos',recintos:'🏟 Recintos',usuarios:'👥 Usuários',eventos:'📅 Eventos',papelera:'🗑 Lixeira',mensajes:'📢 Mensagens',lang_ok:'Idioma salvo',impresion:'🖨 Impressão'},
  hu:{dash:'📊 Irányítópult',ingresos:'🔖 Referencia',ingresos2:'🚛 Belépés',flota:'📦 Csomagolás',conductores:'👤 Sofőrök',agenda:'📅 Napirend',analytics:'📈 Elemzés',vehiculos:'📜 Előzmények',auditoria:'📂 Fájlok',recintos:'🏟 Helyszínek',usuarios:'👥 Felhasználók',eventos:'📅 Események',papelera:'🗑 Szemetes',mensajes:'📢 Üzenetek',lang_ok:'Nyelv mentve',impresion:'🖨 Nyomtatás'}
};

// Completar idiomas faltantes con inglés como fallback
LANGS_UI.forEach(l=>{if(!LANGS[l.code])LANGS[l.code]=LANGS.en;});
LANGS_UI.forEach(l=>{if(!I18N[l.code])I18N[l.code]=I18N.en;});

// Estado global de idioma
export let CUR_LANG='es';
export let pendingLangCode='es';

// Funciones de idioma
export function tr(k){return(I18N[CUR_LANG]&&I18N[CUR_LANG][k])||I18N.es[k]||k;}

export function setLang(l){CUR_LANG=l||'es';}

export function selectLang2(code){pendingLangCode=code;const items=document.querySelectorAll('.lang-item');items.forEach(el=>el.classList.remove('sel'));document.querySelector(`.lang-item[onclick*="${code}"]`)?.classList.add('sel');}

export function buildLangGrid(gid,sel,fn){const el=document.getElementById(gid);if(!el)return;el.innerHTML=LANGS_UI.map(l=>`<div class="lang-item${l.code===sel?' sel':''}" onclick="${fn}('${l.code}')" title="${l.name}"><div style="height:22px;display:flex;align-items:center;justify-content:center">${l.flag.includes('<svg')?l.flag:`<span style="font-size:20px">${l.flag}</span>`}</div><div style="font-size:9px;font-weight:700;margin-top:2px">${l.name}</div></div>`).join('');}

// Expose to window global
if (typeof window !== 'undefined') {
  window.LANGS = LANGS;
  window.LANGS_UI = LANGS_UI;
  window.I18N = I18N;
  window.CUR_LANG = CUR_LANG;
  window.setLang = setLang;
  window.tr = tr;
}
