// BeUnifyT operator.js — i18n fix 2026-04-06T13:30 — NO _M() inside _MOD_I18N
function tr(k){ const l=AppState.get('currentLang')||'es'; return(window.I18N&&window.I18N[l]&&window.I18N[l][k])||( window.I18N&&window.I18N.es&&window.I18N.es[k])||k; }
const _SHELL_I18N={
  es:{theme:'Tema',logout:'Salir',logoutQ:'¿Cerrar sesión?',noEvent:'Sin evento',light:'Claro',dark:'Oscuro',soft:'Suave',contrast:'Alto contraste'},
  en:{theme:'Theme',logout:'Sign out',logoutQ:'Sign out?',noEvent:'No event',light:'Light',dark:'Dark',soft:'Soft',contrast:'High contrast'},
  fr:{theme:'Thème',logout:'Déconnexion',logoutQ:'Se déconnecter ?',noEvent:'Aucun événement',light:'Clair',dark:'Sombre',soft:'Doux',contrast:'Contraste élevé'},
  de:{theme:'Design',logout:'Abmelden',logoutQ:'Abmelden?',noEvent:'Kein Event',light:'Hell',dark:'Dunkel',soft:'Sanft',contrast:'Hoher Kontrast'},
  it:{theme:'Tema',logout:'Esci',logoutQ:'Disconnettersi?',noEvent:'Nessun evento',light:'Chiaro',dark:'Scuro',soft:'Morbido',contrast:'Alto contrasto'},
  pt:{theme:'Tema',logout:'Sair',logoutQ:'Encerrar sessão?',noEvent:'Sem evento',light:'Claro',dark:'Escuro',soft:'Suave',contrast:'Alto contraste'},
  ca:{theme:'Tema',logout:'Sortir',logoutQ:'Tancar sessió?',noEvent:'Sense esdeveniment',light:'Clar',dark:'Fosc',soft:'Suau',contrast:'Alt contrast'},
  eu:{theme:'Gaia',logout:'Irten',logoutQ:'Saioa itxi?',noEvent:'Ekitaldirik ez',light:'Argia',dark:'Iluna',soft:'Leuna',contrast:'Kontraste altua'},
  gl:{theme:'Tema',logout:'Saír',logoutQ:'Pechar sesión?',noEvent:'Sen evento',light:'Claro',dark:'Escuro',soft:'Suave',contrast:'Alto contraste'},
};
function _t(k){const l=AppState.get('currentLang')||'es';return(_SHELL_I18N[l]&&_SHELL_I18N[l][k])||_SHELL_I18N.en[k]||_SHELL_I18N.es[k]||k;}
function _tabLabel(tid){const l=AppState.get('currentLang')||'es';return(window.I18N&&window.I18N[l]&&window.I18N[l][tid])||(window.I18N&&window.I18N.es&&window.I18N.es[tid])||tid;}
function _curFlag(){const l=AppState.get('currentLang')||'es';const info=(window.LANGS_UI||[]).find(x=>x.code===l);if(!info)return'🇪🇸';return info.flag.includes('<svg')?info.flag:`<span style="font-size:16px">${info.flag}</span>`;}
function _L(k){const l=AppState.get('currentLang')||'es';return(window.LANGS&&window.LANGS[l]&&window.LANGS[l][k])||(window.LANGS&&window.LANGS.es&&window.LANGS.es[k])||k;}
const _MOD_I18N={
  es:{newEntry:'Nueva entrada',editEntry:'Editar ingreso',newVeh:'Añadir vehículo',editVeh:'Editar vehículo embalaje',comment:'Comentario',driverLang:'Idioma conductor',position:'Posición',cargoType:'Tipo Carga',status:'Estado',save:'Guardar',cancel:'Cancelar',plateMandatory:'Matrícula obligatoria',saved:'✅ Guardado',add:'+ Añadir',newDriver:'Nuevo conductor',editDriver:'Editar conductor',newBooking:'Nueva reserva',editBooking:'Editar reserva',date:'Fecha',time:'Hora',schedTime:'Hora prevista',realTime:'Hora real',bookingStatus:'Estado',notes:'Notas',refBooking:'Referencia/Booking',blocked:'🚫 MATRÍCULA BLOQUEADA',continueQ:'¿Continuar de todas formas?',reason:'Motivo',specialList:'en lista especial',
    goodMorning:'Buenos días',goodAfternoon:'Buenas tardes',goodEvening:'Buenas noches',noActiveEvent:'Sin evento activo',onPremises:'En recinto',references:'Referencias',entries:'Ingresos',today:'Hoy',agendaToday:'Agenda hoy',messages:'Mensajes',last7days:'Ingresos últimos 7 días',refVsIng:'Ref vs Ing',activeHalls:'Halls más activos',noHallData:'Sin datos de hall',noApptToday:'Sin citas hoy',viewAgenda:'Ver agenda →',lastEntries:'Últimos ingresos',noEntriesReg:'Sin ingresos registrados',unreadMsg:'mensaje(s) sin leer',view:'Ver',all:'Todos',
    list:'Lista',special:'Especial',modifications:'Modificaciones',fields:'Campos',import:'Importar',template:'Plantilla',excel:'Excel',clean:'Limpiar',empty:'Vaciar',activeOnly:'Solo activos',searchPlaceholder:'Pos, matrícula, nombre...',reg:'reg.',noRecords:'Sin registros',noPermImport:'Sin permiso para importar',
    pos:'Pos',plate:'Matrícula',name:'Nombre',company:'Empresa',hall:'Hall',stand:'Stand',entry:'Entrada',exit:'Salida',caller:'Llamador',ref:'Ref',trailer:'Remolque',installer:'Montador',exhibitor:'Expositor',phone:'Teléfono',
    markExit:'Marcar salida',reactivate:'Reactivar',delete:'Eliminar',edit:'Editar',print:'Imprimir',details:'Detalles',confirm:'Confirmar',
    packaging:'Embalaje',warehouse:'ALMACEN',
    drivers:'Conductores',usualPlate:'Matrícula habitual',
    agenda:'Agenda',pending:'PENDIENTE',done:'HECHO',cancelled:'CANCELADO',
    analytics:'Análisis',
    history:'Historial',
    files:'Archivos',
    trash:'Papelera',restore:'Restaurar',deletePerm:'Eliminar definitivo',emptyTrash:'Vaciar papelera',
    printing:'Impresión',
    venues:'Recintos',newVenue:'Nuevo recinto',editVenue:'Editar recinto',venueName:'Nombre recinto',halls:'Halls',gates:'Puertas',
    events:'Eventos',newEvent:'Nuevo evento',editEvent:'Editar evento',eventName:'Nombre evento',startDate:'Fecha inicio',endDate:'Fecha fin',activate:'Activar',deactivate:'Desactivar',
    msgTab:'Mensajes',newMsg:'Nuevo mensaje',urgency:'Urgencia',pause:'Pausar',resume:'Reanudar',read:'Leído',
    users:'Usuarios',newUser:'Nuevo usuario',editUser:'Editar usuario',role:'Rol',tabs:'Tabs',password:'Contraseña',pin:'PIN',
    companies:'Empresas',level:'Nivel',vehicles:'Vehículos',contact:'Contacto',
    migration:'Migración',exportAll:'Exportar todo',importAll:'Importar todo',
  },
  en:{newEntry:'New entry',editEntry:'Edit entry',newVeh:'Add vehicle',editVeh:'Edit packaging vehicle',comment:'Comment',driverLang:'Driver language',position:'Position',cargoType:'Cargo type',status:'Status',save:'Save',cancel:'Cancel',plateMandatory:'Plate is required',saved:'✅ Saved',add:'+ Add',newDriver:'New driver',editDriver:'Edit driver',newBooking:'New booking',editBooking:'Edit booking',date:'Date',time:'Time',schedTime:'Scheduled time',realTime:'Actual time',bookingStatus:'Status',notes:'Notes',refBooking:'Reference/Booking',blocked:'🚫 PLATE BLOCKED',continueQ:'Continue anyway?',reason:'Reason',specialList:'on special list',
    goodMorning:'Good morning',goodAfternoon:'Good afternoon',goodEvening:'Good evening',noActiveEvent:'No active event',onPremises:'On premises',references:'References',entries:'Entries',today:'Today',agendaToday:'Agenda today',messages:'Messages',last7days:'Entries last 7 days',refVsIng:'Ref vs Ent',activeHalls:'Most active halls',noHallData:'No hall data',noApptToday:'No appointments today',viewAgenda:'View agenda →',lastEntries:'Latest entries',noEntriesReg:'No entries registered',unreadMsg:'unread message(s)',view:'View',all:'All',
    list:'List',special:'Special',modifications:'Changes',fields:'Fields',import:'Import',template:'Template',excel:'Excel',clean:'Clean',empty:'Empty',activeOnly:'Active only',searchPlaceholder:'Pos, plate, name...',reg:'rec.',noRecords:'No records',noPermImport:'No import permission',
    pos:'Pos',plate:'Plate',name:'Name',company:'Company',hall:'Hall',stand:'Stand',entry:'Entry',exit:'Exit',caller:'Caller',ref:'Ref',trailer:'Trailer',installer:'Installer',exhibitor:'Exhibitor',phone:'Phone',
    markExit:'Mark exit',reactivate:'Reactivate',delete:'Delete',edit:'Edit',print:'Print',details:'Details',confirm:'Confirm',
    packaging:'Packaging',warehouse:'WAREHOUSE',
    drivers:'Drivers',usualPlate:'Usual plate',
    agenda:'Agenda',pending:'PENDING',done:'DONE',cancelled:'CANCELLED',
    analytics:'Analytics',history:'History',files:'Files',
    trash:'Trash',restore:'Restore',deletePerm:'Delete permanently',emptyTrash:'Empty trash',
    printing:'Print',
    venues:'Venues',newVenue:'New venue',editVenue:'Edit venue',venueName:'Venue name',halls:'Halls',gates:'Gates',
    events:'Events',newEvent:'New event',editEvent:'Edit event',eventName:'Event name',startDate:'Start date',endDate:'End date',activate:'Activate',deactivate:'Deactivate',
    msgTab:'Messages',newMsg:'New message',urgency:'Urgency',pause:'Pause',resume:'Resume',read:'Read',
    users:'Users',newUser:'New user',editUser:'Edit user',role:'Role',tabs:'Tabs',password:'Password',pin:'PIN',
    companies:'Companies',level:'Level',vehicles:'Vehicles',contact:'Contact',
    migration:'Migration',exportAll:'Export all',importAll:'Import all',
  },
  fr:{newEntry:'Nouvelle entrée',editEntry:'Modifier entrée',newVeh:'Ajouter véhicule',editVeh:'Modifier véhicule',comment:'Commentaire',driverLang:'Langue conducteur',position:'Position',cargoType:'Type cargaison',status:'Statut',save:'Enregistrer',cancel:'Annuler',plateMandatory:'Immatriculation obligatoire',saved:'✅ Enregistré',add:'+ Ajouter',newDriver:'Nouveau conducteur',editDriver:'Modifier conducteur',newBooking:'Nouvelle réservation',editBooking:'Modifier réservation',date:'Date',time:'Heure',schedTime:'Heure prévue',realTime:'Heure réelle',bookingStatus:'Statut',notes:'Notes',refBooking:'Référence/Réservation',blocked:'🚫 PLAQUE BLOQUÉE',continueQ:'Continuer quand même ?',reason:'Motif',specialList:'en liste spéciale',
    goodMorning:'Bonjour',goodAfternoon:'Bon après-midi',goodEvening:'Bonsoir',noActiveEvent:'Aucun événement actif',onPremises:'Sur site',references:'Références',entries:'Entrées',today:'Aujourd\'hui',agendaToday:'Agenda du jour',messages:'Messages',last7days:'Entrées 7 derniers jours',refVsIng:'Réf vs Ent',activeHalls:'Halls les plus actifs',noHallData:'Aucune donnée hall',noApptToday:'Aucun rendez-vous',viewAgenda:'Voir agenda →',lastEntries:'Dernières entrées',noEntriesReg:'Aucune entrée enregistrée',unreadMsg:'message(s) non lu(s)',view:'Voir',all:'Tous',
    list:'Liste',special:'Spécial',modifications:'Modifications',fields:'Champs',import:'Importer',template:'Modèle',excel:'Excel',clean:'Nettoyer',empty:'Vider',activeOnly:'Actifs seul.',searchPlaceholder:'Pos, plaque, nom...',reg:'enr.',noRecords:'Aucun enregistrement',noPermImport:'Pas d\'autorisation d\'import',
    pos:'Pos',plate:'Plaque',name:'Nom',company:'Société',hall:'Hall',stand:'Stand',entry:'Entrée',exit:'Sortie',caller:'Appelant',ref:'Réf',trailer:'Remorque',installer:'Installateur',exhibitor:'Exposant',phone:'Téléphone',
    markExit:'Marquer sortie',reactivate:'Réactiver',delete:'Supprimer',edit:'Modifier',print:'Imprimer',details:'Détails',confirm:'Confirmer',
    packaging:'Emballage',warehouse:'ENTREPÔT',drivers:'Chauffeurs',usualPlate:'Plaque habituelle',
    agenda:'Agenda',pending:'EN ATTENTE',done:'FAIT',cancelled:'ANNULÉ',
    analytics:'Analytique',history:'Historique',files:'Fichiers',
    trash:'Corbeille',restore:'Restaurer',deletePerm:'Suppr. définitif',emptyTrash:'Vider corbeille',printing:'Impression',
    venues:'Lieux',newVenue:'Nouveau lieu',editVenue:'Modifier lieu',venueName:'Nom du lieu',halls:'Halls',gates:'Portes',
    events:'Événements',newEvent:'Nouvel événement',editEvent:'Modifier événement',eventName:'Nom événement',startDate:'Date début',endDate:'Date fin',activate:'Activer',deactivate:'Désactiver',
    msgTab:'Messages',newMsg:'Nouveau message',urgency:'Urgence',pause:'Pause',resume:'Reprendre',read:'Lu',
    users:'Utilisateurs',newUser:'Nouvel utilisateur',editUser:'Modifier utilisateur',role:'Rôle',tabs:'Onglets',password:'Mot de passe',pin:'PIN',
    companies:'Entreprises',level:'Niveau',vehicles:'Véhicules',contact:'Contact',
    migration:'Migration',exportAll:'Tout exporter',importAll:'Tout importer',
  },
  de:{newEntry:'Neuer Eintrag',editEntry:'Eintrag bearbeiten',newVeh:'Fahrzeug hinzufügen',editVeh:'Fahrzeug bearbeiten',comment:'Kommentar',driverLang:'Fahrersprache',position:'Position',cargoType:'Ladungstyp',status:'Status',save:'Speichern',cancel:'Abbrechen',plateMandatory:'Kennzeichen erforderlich',saved:'✅ Gespeichert',add:'+ Hinzufügen',newDriver:'Neuer Fahrer',editDriver:'Fahrer bearbeiten',newBooking:'Neue Buchung',editBooking:'Buchung bearbeiten',date:'Datum',time:'Uhrzeit',schedTime:'Geplante Zeit',realTime:'Tatsächliche Zeit',bookingStatus:'Status',notes:'Notizen',refBooking:'Referenz/Buchung',blocked:'🚫 KENNZEICHEN BLOCKIERT',continueQ:'Trotzdem fortfahren?',reason:'Grund',specialList:'auf Sonderliste',
    goodMorning:'Guten Morgen',goodAfternoon:'Guten Tag',goodEvening:'Guten Abend',noActiveEvent:'Kein aktives Event',onPremises:'Im Gelände',references:'Referenzen',entries:'Einträge',today:'Heute',agendaToday:'Agenda heute',messages:'Nachrichten',last7days:'Einträge letzte 7 Tage',refVsIng:'Ref vs Ein',activeHalls:'Aktivste Hallen',noHallData:'Keine Hallendaten',noApptToday:'Keine Termine heute',viewAgenda:'Agenda ansehen →',lastEntries:'Letzte Einträge',noEntriesReg:'Keine Einträge',unreadMsg:'ungelesene Nachricht(en)',view:'Ansehen',all:'Alle',
    list:'Liste',special:'Spezial',modifications:'Änderungen',fields:'Felder',import:'Importieren',template:'Vorlage',excel:'Excel',clean:'Bereinigen',empty:'Leeren',activeOnly:'Nur aktive',searchPlaceholder:'Pos, Kennz., Name...',reg:'Eintr.',noRecords:'Keine Einträge',noPermImport:'Keine Importberechtigung',
    pos:'Pos',plate:'Kennzeichen',name:'Name',company:'Firma',hall:'Halle',stand:'Stand',entry:'Eingang',exit:'Ausgang',caller:'Anrufer',ref:'Ref',trailer:'Anhänger',installer:'Monteur',exhibitor:'Aussteller',phone:'Telefon',
    markExit:'Ausfahrt',reactivate:'Reaktivieren',delete:'Löschen',edit:'Bearbeiten',print:'Drucken',details:'Details',confirm:'Bestätigen',
    packaging:'Verpackung',warehouse:'LAGER',drivers:'Fahrer',usualPlate:'Übliches Kennz.',
    agenda:'Agenda',pending:'AUSSTEHEND',done:'ERLEDIGT',cancelled:'STORNIERT',
    analytics:'Analytik',history:'Verlauf',files:'Dateien',
    trash:'Papierkorb',restore:'Wiederherstellen',deletePerm:'Endgültig löschen',emptyTrash:'Papierkorb leeren',printing:'Druck',
    venues:'Veranstaltungsorte',newVenue:'Neuer Ort',editVenue:'Ort bearbeiten',venueName:'Ortsname',halls:'Hallen',gates:'Tore',
    events:'Events',newEvent:'Neues Event',editEvent:'Event bearbeiten',eventName:'Eventname',startDate:'Startdatum',endDate:'Enddatum',activate:'Aktivieren',deactivate:'Deaktivieren',
    msgTab:'Nachrichten',newMsg:'Neue Nachricht',urgency:'Dringlichkeit',pause:'Pausieren',resume:'Fortsetzen',read:'Gelesen',
    users:'Benutzer',newUser:'Neuer Benutzer',editUser:'Benutzer bearbeiten',role:'Rolle',tabs:'Tabs',password:'Passwort',pin:'PIN',
    companies:'Unternehmen',level:'Stufe',vehicles:'Fahrzeuge',contact:'Kontakt',
    migration:'Migration',exportAll:'Alles exportieren',importAll:'Alles importieren',
  },
  it:{newEntry:'Nuovo ingresso',editEntry:'Modifica ingresso',newVeh:'Aggiungi veicolo',editVeh:'Modifica veicolo',comment:'Commento',driverLang:'Lingua conducente',position:'Posizione',cargoType:'Tipo carico',status:'Stato',save:'Salva',cancel:'Annulla',plateMandatory:'Targa obbligatoria',saved:'✅ Salvato',add:'+ Aggiungi',newDriver:'Nuovo conducente',editDriver:'Modifica conducente',newBooking:'Nuova prenotazione',editBooking:'Modifica prenotazione',date:'Data',time:'Ora',schedTime:'Ora prevista',realTime:'Ora reale',bookingStatus:'Stato',notes:'Note',refBooking:'Riferimento/Prenotazione',blocked:'🚫 TARGA BLOCCATA',continueQ:'Continuare comunque?',reason:'Motivo',specialList:'in lista speciale',
    goodMorning:'Buongiorno',goodAfternoon:'Buon pomeriggio',goodEvening:'Buonasera',noActiveEvent:'Nessun evento attivo',onPremises:'In sede',references:'Riferimenti',entries:'Ingressi',today:'Oggi',agendaToday:'Agenda oggi',messages:'Messaggi',last7days:'Ingressi ultimi 7 giorni',refVsIng:'Rif vs Ing',activeHalls:'Halls più attivi',noHallData:'Nessun dato hall',noApptToday:'Nessun appuntamento',viewAgenda:'Vedi agenda →',lastEntries:'Ultimi ingressi',noEntriesReg:'Nessun ingresso registrato',unreadMsg:'messaggi non letti',view:'Vedi',all:'Tutti',
    list:'Lista',special:'Speciale',modifications:'Modifiche',fields:'Campi',import:'Importa',template:'Modello',excel:'Excel',clean:'Pulisci',empty:'Svuota',activeOnly:'Solo attivi',searchPlaceholder:'Pos, targa, nome...',reg:'reg.',noRecords:'Nessun record',noPermImport:'Nessun permesso importazione',
    pos:'Pos',plate:'Targa',name:'Nome',company:'Azienda',hall:'Hall',stand:'Stand',entry:'Ingresso',exit:'Uscita',caller:'Chiamante',ref:'Rif',trailer:'Rimorchio',installer:'Montatore',exhibitor:'Espositore',phone:'Telefono',
    markExit:'Segna uscita',reactivate:'Riattiva',delete:'Elimina',edit:'Modifica',print:'Stampa',details:'Dettagli',confirm:'Conferma',
    packaging:'Imballaggio',warehouse:'MAGAZZINO',drivers:'Autisti',usualPlate:'Targa abituale',
    agenda:'Agenda',pending:'IN ATTESA',done:'FATTO',cancelled:'ANNULLATO',
    analytics:'Analisi',history:'Cronologia',files:'File',
    trash:'Cestino',restore:'Ripristina',deletePerm:'Elimina definitivo',emptyTrash:'Svuota cestino',printing:'Stampa',
    venues:'Sedi',newVenue:'Nuova sede',editVenue:'Modifica sede',venueName:'Nome sede',halls:'Halls',gates:'Porte',
    events:'Eventi',newEvent:'Nuovo evento',editEvent:'Modifica evento',eventName:'Nome evento',startDate:'Data inizio',endDate:'Data fine',activate:'Attiva',deactivate:'Disattiva',
    msgTab:'Messaggi',newMsg:'Nuovo messaggio',urgency:'Urgenza',pause:'Pausa',resume:'Riprendi',read:'Letto',
    users:'Utenti',newUser:'Nuovo utente',editUser:'Modifica utente',role:'Ruolo',tabs:'Tabs',password:'Password',pin:'PIN',
    companies:'Aziende',level:'Livello',vehicles:'Veicoli',contact:'Contatto',
    migration:'Migrazione',exportAll:'Esporta tutto',importAll:'Importa tutto',
  },
  pt:{newEntry:'Nova entrada',editEntry:'Editar entrada',newVeh:'Adicionar veículo',editVeh:'Editar veículo',comment:'Comentário',driverLang:'Idioma condutor',position:'Posição',cargoType:'Tipo carga',status:'Estado',save:'Guardar',cancel:'Cancelar',plateMandatory:'Matrícula obrigatória',saved:'✅ Guardado',add:'+ Adicionar',newDriver:'Novo condutor',editDriver:'Editar condutor',newBooking:'Nova reserva',editBooking:'Editar reserva',date:'Data',time:'Hora',schedTime:'Hora prevista',realTime:'Hora real',bookingStatus:'Estado',notes:'Notas',refBooking:'Referência/Reserva',blocked:'🚫 MATRÍCULA BLOQUEADA',continueQ:'Continuar mesmo assim?',reason:'Motivo',specialList:'em lista especial',
    goodMorning:'Bom dia',goodAfternoon:'Boa tarde',goodEvening:'Boa noite',noActiveEvent:'Sem evento ativo',onPremises:'No recinto',references:'Referências',entries:'Entradas',today:'Hoje',agendaToday:'Agenda hoje',messages:'Mensagens',last7days:'Entradas últimos 7 dias',refVsIng:'Ref vs Ent',activeHalls:'Halls mais ativos',noHallData:'Sem dados hall',noApptToday:'Sem compromissos',viewAgenda:'Ver agenda →',lastEntries:'Últimas entradas',noEntriesReg:'Sem entradas registadas',unreadMsg:'mensagem(ns) não lida(s)',view:'Ver',all:'Todos',
    list:'Lista',special:'Especial',modifications:'Modificações',fields:'Campos',import:'Importar',template:'Modelo',excel:'Excel',clean:'Limpar',empty:'Esvaziar',activeOnly:'Só ativos',searchPlaceholder:'Pos, matrícula, nome...',reg:'reg.',noRecords:'Sem registos',noPermImport:'Sem permissão importação',
    pos:'Pos',plate:'Matrícula',name:'Nome',company:'Empresa',hall:'Hall',stand:'Stand',entry:'Entrada',exit:'Saída',caller:'Chamador',ref:'Ref',trailer:'Reboque',installer:'Montador',exhibitor:'Expositor',phone:'Telefone',
    markExit:'Marcar saída',reactivate:'Reativar',delete:'Eliminar',edit:'Editar',print:'Imprimir',details:'Detalhes',confirm:'Confirmar',
    packaging:'Embalagem',warehouse:'ARMAZÉM',drivers:'Motoristas',usualPlate:'Matrícula habitual',
    agenda:'Agenda',pending:'PENDENTE',done:'FEITO',cancelled:'CANCELADO',
    analytics:'Análise',history:'Histórico',files:'Arquivos',
    trash:'Lixeira',restore:'Restaurar',deletePerm:'Eliminar definitivo',emptyTrash:'Esvaziar lixeira',printing:'Impressão',
    venues:'Recintos',newVenue:'Novo recinto',editVenue:'Editar recinto',venueName:'Nome recinto',halls:'Halls',gates:'Portas',
    events:'Eventos',newEvent:'Novo evento',editEvent:'Editar evento',eventName:'Nome evento',startDate:'Data início',endDate:'Data fim',activate:'Ativar',deactivate:'Desativar',
    msgTab:'Mensagens',newMsg:'Nova mensagem',urgency:'Urgência',pause:'Pausar',resume:'Retomar',read:'Lido',
    users:'Utilizadores',newUser:'Novo utilizador',editUser:'Editar utilizador',role:'Função',tabs:'Tabs',password:'Palavra-passe',pin:'PIN',
    companies:'Empresas',level:'Nível',vehicles:'Veículos',contact:'Contacto',
    migration:'Migração',exportAll:'Exportar tudo',importAll:'Importar tudo',
  },
  ca:{newEntry:'Nova entrada',editEntry:'Editar ingrés',newVeh:'Afegir vehicle',editVeh:'Editar vehicle',comment:'Comentari',driverLang:'Idioma conductor',position:'Posició',cargoType:'Tipus càrrega',status:'Estat',save:'Desar',cancel:'Cancel·lar',plateMandatory:'Matrícula obligatòria',saved:'✅ Desat',add:'+ Afegir',newDriver:'Nou conductor',editDriver:'Editar conductor',newBooking:'Nova reserva',editBooking:'Editar reserva',date:'Data',time:'Hora',schedTime:'Hora prevista',realTime:'Hora real',bookingStatus:'Estat',notes:'Notes',refBooking:'Referència/Reserva',blocked:'🚫 MATRÍCULA BLOQUEJADA',continueQ:'Continuar igualment?',reason:'Motiu',specialList:'a llista especial',
    goodMorning:'Bon dia',goodAfternoon:'Bona tarda',goodEvening:'Bona nit',noActiveEvent:'Sense esdeveniment actiu',onPremises:'Al recinte',references:'Referències',entries:'Ingressos',today:'Avui',agendaToday:'Agenda d\'avui',messages:'Missatges',last7days:'Ingressos últims 7 dies',refVsIng:'Ref vs Ing',activeHalls:'Halls més actius',noHallData:'Sense dades hall',noApptToday:'Sense cites avui',viewAgenda:'Veure agenda →',lastEntries:'Últims ingressos',noEntriesReg:'Sense ingressos registrats',unreadMsg:'missatge(s) no llegit(s)',view:'Veure',all:'Tots',
    list:'Llista',special:'Especial',modifications:'Modificacions',fields:'Camps',import:'Importar',template:'Plantilla',excel:'Excel',clean:'Netejar',empty:'Buidar',activeOnly:'Només actius',searchPlaceholder:'Pos, matrícula, nom...',reg:'reg.',noRecords:'Sense registres',noPermImport:'Sense permís d\'importació',
    pos:'Pos',plate:'Matrícula',name:'Nom',company:'Empresa',hall:'Hall',stand:'Stand',entry:'Entrada',exit:'Sortida',caller:'Trucador',ref:'Ref',trailer:'Remolc',installer:'Muntador',exhibitor:'Expositor',phone:'Telèfon',
    markExit:'Marcar sortida',reactivate:'Reactivar',delete:'Eliminar',edit:'Editar',print:'Imprimir',details:'Detalls',confirm:'Confirmar',
    packaging:'Embalatge',warehouse:'MAGATZEM',drivers:'Conductors',usualPlate:'Matrícula habitual',
    agenda:'Agenda',pending:'PENDENT',done:'FET',cancelled:'CANCEL·LAT',
    analytics:'Anàlisi',history:'Historial',files:'Arxius',
    trash:'Paperera',restore:'Restaurar',deletePerm:'Eliminar definitiu',emptyTrash:'Buidar paperera',printing:'Impressió',
    venues:'Recintes',newVenue:'Nou recinte',editVenue:'Editar recinte',venueName:'Nom recinte',halls:'Halls',gates:'Portes',
    events:'Esdeveniments',newEvent:'Nou esdeveniment',editEvent:'Editar esdeveniment',eventName:'Nom esdeveniment',startDate:'Data inici',endDate:'Data fi',activate:'Activar',deactivate:'Desactivar',
    msgTab:'Missatges',newMsg:'Nou missatge',urgency:'Urgència',pause:'Pausar',resume:'Reprendre',read:'Llegit',
    users:'Usuaris',newUser:'Nou usuari',editUser:'Editar usuari',role:'Rol',tabs:'Pestanyes',password:'Contrasenya',pin:'PIN',
    companies:'Empreses',level:'Nivell',vehicles:'Vehicles',contact:'Contacte',
    migration:'Migració',exportAll:'Exportar tot',importAll:'Importar tot',
  },
};
function _M(k){const l=AppState.get('currentLang')||'es';return(_MOD_I18N[l]&&_MOD_I18N[l][k])||_MOD_I18N.en[k]||_MOD_I18N.es[k]||k;}

function getSort(tab) {
  const defs = {ingresos:{col:'pos',dir:'desc'},ingresos2:{col:'pos',dir:'desc'},agenda:{col:'hora',dir:'asc'},flota:{col:'posicion',dir:'asc'},vehiculos:{col:'entrada',dir:'desc'}};
  return (DB.tabSorts && DB.tabSorts[tab]) || defs[tab] || {col:'',dir:'asc'};
}
function setSort(tab, col) {
  const cur = getSort(tab);
  const dir = (cur.col === col && cur.dir === 'asc') ? 'desc' : 'asc';
  if (!DB.tabSorts) DB.tabSorts = {};
  DB.tabSorts[tab] = {col, dir};
  const renders = {ingresos:renderIngresos,ingresos2:renderIngresos2,flota:renderFlota,conductores:renderConductores,agenda:renderAgenda,vehiculos:renderVehiculos};
  if (renders[tab]) renders[tab]();
}
function thSort(tab, col, label) {
  const s = getSort(tab);
  const isActive = s.col === col;
  const ico = isActive ? (s.dir === 'asc' ? String.fromCharCode(8593) : String.fromCharCode(8595)) : String.fromCharCode(8661);
  const colStyle = isActive ? 'color:var(--blue);font-weight:600;' : '';
  return `<th style="cursor:pointer;user-select:none;white-space:nowrap;${colStyle}" onclick="window._op.setSort('${tab}','${col}')">${label} <span style="font-size:9px">${ico}</span></th>`;
}

function telLink(telPais, tel) {
  if (!tel || !tel.trim()) return '–';
  var full = (telPais||'') + tel.trim().replace(/\s+/g,'');
  var wa = full.replace('+','').replace(/[^0-9]/g,'');
  var ph = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.45 1.17h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  var ws = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.18 8.18 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.52 5.843L.057 23.5l5.805-1.522A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.513-5.16-1.406l-.37-.22-3.444.903.92-3.352-.24-.386A9.961 9.961 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';
  return '<div style="display:flex;align-items:center;gap:4px;white-space:nowrap"><a href="tel:' + full + '" style="color:var(--green);text-decoration:none;display:flex" title="Llamar">' + ph + '</a><a href="https://wa.me/' + wa + '" target="_blank" style="color:#25D366;text-decoration:none;display:flex" title="WhatsApp">' + ws + '</a><span style="font-size:11px">' + tel + '</span></div>';
}

// ═══════════════════════════════════════════════════════════════════════
// BeUnifyT v7 — operator.js
// Módulo completo del operador. Carga lazy tras auth exitosa.
// Todas las tabs: Dashboard, Referencia, Ingresos, Embalaje, Conductores,
// Agenda, Análisis, Historial, Archivos, Papelera, Impresión, Recintos,
// Eventos, Mensajes, Usuarios
// ═══════════════════════════════════════════════════════════════════════
import { AppState }    from '../state.js';
import { toast, uid, safeHtml, formatDate, nowLocal, sortBy, normPlate, clone } from '../utils.js';
import { isSA, isSup, hasPerm, canEdit, canAdd, canDel, canClean, canExport, canImport, canPrint, canStatus, canSpecial, canCampos, canMensajes, logout } from '../auth.js';
import { fsGet, fsSet, fsUpdate, fsAdd, fsDel, fsGetAll, fsListen, fsBatch } from '../firestore.js';

const esc = safeHtml;
const fmt = formatDate;
const EYE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

// ─── DEBOUNCE FOR SEARCH (Fix 6) ─────────────────────────────────────
const _debounceTimers = {};
function _debouncedSearch(key, fn, delay = 180) {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(fn, delay);
}
window._dbs = (key, fnName) => _debouncedSearch(key, () => { if(window._op[fnName]) window._op[fnName](); });
// Global debounceSearch used by inline oninput handlers
function debounceSearch(key, fn, delay = 180) {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(fn, delay);
}
window.debounceSearch = debounceSearch;

// ─── CACHED DOM ELEMENTS ──────────────────────────────────────────────
const EL = {};
function cacheEL() {
  ['appHdr','mainTabs','mainContent','hdrCnts','syncPill'].forEach(id => { EL[id] = document.getElementById(id); });
}

// ─── LOCAL STATE ──────────────────────────────────────────────────────
let DB = {
  ingresos:[], ingresos2:[], movimientos:[], conductores:[], agenda:[],
  mensajesRampa:[], listaNegra:[], enEspera:[], auditLog:[], exportLog:[], editHistory:[],
  eventos:[], recintos:[], usuarios:[], papelera:[], preregistros:[],
  empresas:[], vehiculos:[],
  activeEventId: null, activeEventIds:[], defaultEventId: null,
  printCfg1:{}, printCfg2:{}, printCfgAg:{}, printTemplates:[], printCfgModes:{},
};

let curTab = 'dash';
let SID    = uid(); // session instance ID
let _autoFillOn = false;
let _posAutoOn  = true;
let iF = {
  // ingresos
  q:'', fecha:'', hall:'', activos:false,
  // ingresos2  
  q2:'', fecha2:'', hall2:'', activos2:false,
  // flota
  qF:'', statusF:'', hallF:'',
  // conductores
  qC:'', empresaC:'',
  // agenda
  qAg:'', fechaAg:'', estadoAg:'', hallAg:'',
};
window._iF = iF; // expose for inline handlers

// Firestore unsubscribe handles
const _unsubs = [];

// ─── ENTRY POINT ─────────────────────────────────────────────────────
export async function initOperator() {
  const user = AppState.get('currentUser');
  if (!user) { import('../auth.js').then(m => m.initAuth()); return; }

  _renderShell();
  cacheEL();
  _applyTheme();
  _bindGlobalKeyboard();

  // Load data from Firestore
  await _loadData();

  // Seed initial data if Firestore is empty
  await _seedIfEmpty();

  // Subscribe to real-time updates for key collections
  _subscribeRealtime();

  // Restore last tab
  try { curTab = localStorage.getItem('beu_tab') || 'dash'; } catch(e) {}
  _validateTab();

  // Restore saved tab order
  try {
    const savedOrder = JSON.parse(localStorage.getItem('beu_tabOrder'));
    if (savedOrder && savedOrder.length) {
      const bar = document.getElementById('mainTabs');
      if (bar) {
        const btns = [...bar.querySelectorAll('.btn-tab')];
        savedOrder.forEach(tabId => {
          const btn = btns.find(b => b.dataset.tab === tabId);
          if (btn) bar.appendChild(btn);
        });
      }
    }
  } catch(e) {}

  goTab(curTab);
}

// ─── SEED INITIAL DATA ────────────────────────────────────────────────
async function _seedIfEmpty() {
  try {
    const user = AppState.get('currentUser');
    // Create user record in Firestore if missing
    const existingUser = await fsGet('users/' + user.id).catch(() => null);
    if (!existingUser) {
      await fsSet('users/' + user.id, {
        id: user.id, nombre: user.nombre, email: user.email,
        rol: 'superadmin', lang: 'es',
        tabs: ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics',
               'vehiculos','auditoria','papelera','impresion','recintos','eventos',
               'mensajes','usuarios','empresas'],
      }, false);
    }
    // Create test users if none exist
    const users = await fsGetAll('users').catch(() => []);
    if (users.length <= 1) {
      const { hashPin } = await import('../utils.js');
      const salt1 = 'salt_op_001', salt2 = 'salt_emp_001';
      const pin1 = await hashPin('1234', salt1);
      const pin2 = await hashPin('4321', salt2);
      await fsSet('users/test_operador', {
        id:'test_operador', nombre:'Operador Test', email:'operador@beunifyt.com',
        rol:'controlador_rampa', lang:'es', pinHash:pin1, pinSalt:salt1,
        tabs:['ingresos','ingresos2'],
      }, false);
      await fsSet('users/test_empresa', {
        id:'test_empresa', nombre:'Empresa Test', email:'empresa@beunifyt.com',
        rol:'empresa', lang:'es', pinHash:pin2, pinSalt:salt2,
      }, false);
    }
    // Create default event if none exist
    const evs = await fsGetAll('events').catch(() => []);
    if (!evs.length) {
      const evId = 'ev_default';
      await fsSet('events/' + evId, {
        id: evId, nombre: 'Evento Demo 2026', ico: '📋',
        ini: '2026-04-01', fin: '2026-04-10',
        recinto: 'Recinto Demo', ciudad: 'Barcelona', activo: true,
      }, false);
      await fsSet('config/activeEvent', { id: evId }, false);
      DB.activeEventId = evId;
      AppState.set('currentEvent', { id: evId, nombre: 'Evento Demo 2026', ico: '📋' });
    }
  } catch(e) { console.warn('[operator] seed', e); }
}

// ─── DATA LOADING ─────────────────────────────────────────────────────
async function _loadData() {
  const ev = AppState.get('currentEvent');
  const evId = ev?.id || DB.activeEventId;
  if (!evId) {
    // Load events list to pick one
    const evs = await fsGetAll('events');
    DB.eventos = evs;
    if (evs.length) {
      DB.activeEventId = evs[0].id;
      AppState.set('currentEvent', evs[0]);
    }
    return;
  }
  const base = `events/${evId}`;
  try {
    const [ingresos, ingresos2, agenda, conductores, mensajes, movimientos] = await Promise.all([
      fsGetAll(`${base}/ingresos`),
      fsGetAll(`${base}/ingresos2`),
      fsGetAll(`${base}/agenda`),
      fsGetAll(`${base}/conductores`),
      fsGetAll(`${base}/mensajes`),
      fsGetAll(`${base}/movimientos`),
    ]);
    DB.ingresos     = ingresos;
    DB.ingresos2    = ingresos2;
    DB.agenda       = agenda;
    DB.conductores  = conductores;
    DB.mensajesRampa= mensajes;
    DB.movimientos  = movimientos;
    // Set last ingreso for print preview
    const sorted = [...ingresos, ...ingresos2].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||''));
    if (sorted.length) AppState.set('lastIngreso', sorted[0]);
  } catch(e) { console.warn('[operator] loadData', e); }

  // Load config, events, users, etc.
  try {
    const allUsers = await fsGetAll('users');
    DB.usuarios = allUsers.filter(u => u.rol !== 'empresa');
    // Ensure current SA is in the list
    const curUser = AppState.get('currentUser');
    if (curUser && !DB.usuarios.find(u => u.id === curUser.id)) {
      DB.usuarios.push(curUser);
    }
    DB.eventos     = await fsGetAll('events');
    DB.recintos    = await fsGetAll('recintos');
    DB.empresas    = await fsGetAll('companies');
    DB.papelera    = await fsGetAll('papelera');
    DB.auditLog    = await fsGetAll('auditLog');
    DB.preregistros= await fsGetAll(`${base}/preregistros`);
    DB.editHistory = await fsGetAll(`${base}/editHistory`);
  } catch(e) { console.warn('[operator] loadConfig', e); }
}

async function saveDB() {
  // All saves are done individually per entity — no full DB write
  // Called after local DB mutation, actual Firestore writes happen in CRUD functions
}

async function _saveOne(collection, item) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsSet(`${base}/${item.id}`, item, false);
}

async function _deleteOne(collection, id) {
  const ev = AppState.get('currentEvent');
  const base = ev?.id ? `events/${ev.id}/${collection}` : collection;
  await fsDel(`${base}/${id}`);
}

function _subscribeRealtime() {
  const ev = AppState.get('currentEvent');
  if (!ev?.id) return;
  const base = `events/${ev.id}`;
  // Real-time listener for ingresos
  fsListen(`${base}/ingresos`, docs => {
    DB.ingresos = docs;
    renderHdr();
    if (curTab === 'ingresos') renderIngresos();
    if (curTab === 'dash') renderDash();
  }).then(u => _unsubs.push(u));
  // Real-time listener for mensajes
  fsListen(`${base}/mensajes`, docs => {
    DB.mensajesRampa = docs;
    renderHdr();
    if (curTab === 'mensajes') renderMensajes();
  }).then(u => _unsubs.push(u));
}

// ─── SHELL HTML ───────────────────────────────────────────────────────
function _renderShell() {
  const user = AppState.get('currentUser');
  const tabs = _getAllowedTabs(user);

  document.body.innerHTML = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f7f8fc;--bg2:#fff;--bg3:#f0f2f8;--bg4:#e4e7f1;--text:#0f172a;--text2:#334155;--text3:#6b7280;--text4:#9ca3af;--border:#e4e7f1;--border2:#c8cdd9;--blue:#1a56db;--bll:#eef2ff;--green:#0d9f6e;--gll:#ecfdf5;--red:#e02424;--rll:#fff1f1;--amber:#c47b10;--all:#fffbeb;--purple:#6d28d9;--teal:#0d9f6e;--r:6px;--r2:10px;--sh:0 1px 3px rgba(0,0,0,.06)}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:13px;-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden;display:flex;flex-direction:column}
input,select,textarea{font-family:inherit;font-size:12px;outline:none;padding:5px 8px;border:1.5px solid var(--border2);border-radius:var(--r);background:var(--bg2);color:var(--text);-webkit-appearance:none}
input:focus,select:focus,textarea:focus{border-color:var(--blue)}
textarea{resize:vertical}
button{cursor:pointer;border:none;border-radius:var(--r);font-weight:600;font-family:inherit;display:inline-flex;align-items:center;gap:4px;justify-content:center;transition:all .15s;white-space:nowrap}
button:disabled{opacity:.4;cursor:not-allowed}
button:active:not(:disabled){transform:scale(.97)}
.btn{padding:4px 11px;font-size:12px;border-radius:20px;border:none}
.btn-sm{padding:3px 9px;font-size:11px;border-radius:20px}
.btn-xs{padding:2px 7px;font-size:10px;border-radius:20px}
.btn-p{background:#2563eb;color:#fff}.btn-p:hover{background:#1d4ed8}
.btn-s{background:#0d9f6e;color:#fff}.btn-s:hover{background:#0a8a5e}
.btn-r,.btn-danger{background:#fee2e2;color:#dc2626;border:1px solid #fecaca}
.btn-gh{background:var(--bg2);color:var(--text2);border:1px solid var(--border)}.btn-gh:hover{background:var(--bg3)}
.btn-edit{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.btn-warning{background:#fef3c7;color:#b45309;border:1px solid #fde68a}
.tgl{display:inline-flex;align-items:center;gap:3px;padding:4px 9px;border-radius:16px;border:1.5px solid var(--border2);background:var(--bg3);color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;user-select:none;opacity:.6;transition:all .15s}
.tgl.on{border-color:var(--blue);background:var(--blue);color:#fff;opacity:1}
.tgl input{display:none}
.btn-tab{padding:5px 11px;border-radius:20px;background:transparent;color:var(--text3);font-size:12px;font-weight:500;border:none;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;flex-shrink:0}
.btn-tab.active{background:linear-gradient(90deg,#2563eb,#cbd5e1);color:#fff;font-weight:700}
.btn-tab:hover:not(.active){background:rgba(26,86,219,.07);color:var(--text)}
/* Header */
#appHdr{display:flex;align-items:center;gap:4px;padding:0 10px;height:44px;background:var(--bg2);border-bottom:1.5px solid var(--border);flex-shrink:0;box-shadow:var(--sh)}
#hdrCnts{display:flex;align-items:center;gap:6px;flex:1;justify-content:center}
.hdr-cnt{display:flex;flex-direction:column;align-items:center;border:1px solid var(--border2);border-radius:var(--r);padding:1px 7px;min-width:48px}
.hdr-cv{font-size:13px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.2}
.hdr-cl{font-size:8px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
.ev-pill{background:var(--bg3);border:1px solid var(--border2);color:var(--text2);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:800;cursor:pointer}
.sync-pill{display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1.5px solid var(--border2);background:var(--bg3);font-size:11px;font-weight:700;color:var(--text3)}
.sd{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
/* Tabs bar */
#mainTabs{display:flex;align-items:center;gap:2px;padding:2px 8px;background:var(--bg3);border-bottom:1px solid var(--border);overflow-x:auto;flex-shrink:0;scrollbar-width:none}
/* Content */
#mainContent{flex:1;overflow:hidden;display:flex;flex-direction:column}
.app-main{flex:1;overflow-y:auto;padding:10px 14px;max-width:1400px;margin:0 auto;width:100%}
/* Cards / grid */
.sg{display:grid;gap:8px}.sg2{grid-template-columns:1fr 1fr}.sg3{grid-template-columns:repeat(3,1fr)}.sg4{grid-template-columns:repeat(4,1fr)}.sg6{grid-template-columns:repeat(6,1fr)}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:12px;box-shadow:var(--sh)}
.stat-box{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:10px 14px;box-shadow:var(--sh)}
.stat-n{font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;line-height:1.1}
.stat-l{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px}
/* Tables */
.tbl-wrap{overflow-x:auto;border-radius:var(--r2);border:1px solid var(--border)}
.dtbl{width:100%;border-collapse:collapse;font-size:12px}
.dtbl thead{background:var(--bg3)}
.dtbl th{padding:7px 10px;font-weight:700;font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;border-bottom:1.5px solid var(--border);text-align:left;white-space:nowrap}
.dtbl td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
.dtbl tbody tr:hover{background:var(--bg3)}
.dtbl tbody tr:last-child td{border-bottom:none}
/* Chips */
.mchip{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:6px;padding:2px 7px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.5px}
.mchip-sm{display:inline-flex;align-items:center;background:#1e293b;color:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700}
/* Search box */
.sbox{display:flex;align-items:center;background:var(--bg2);border:1.5px solid var(--border2);border-radius:20px;padding:4px 10px;gap:6px}
.sbox input{border:none;background:transparent;flex:1;font-size:12px}
.sico{font-size:14px;flex-shrink:0;opacity:.5}
/* Section header */
.sec-hdr{display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:wrap}
.sec-ttl{font-size:14px;font-weight:800}
.sec-act{display:flex;align-items:center;gap:4px;margin-left:auto;flex-wrap:wrap}
/* Bar charts */
.bar-row{display:flex;align-items:center;gap:6px;padding:2px 0}
.bar-bg{flex:1;height:6px;background:var(--bg4);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width .3s}
.bar-val{font-size:10px;font-weight:700;min-width:24px;text-align:right;color:var(--text3)}
/* Status badges */
.sbadge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700}
.pill-g{background:var(--gll);color:var(--green);border:1px solid #bbf7d0}
.pill-b{background:var(--bll);color:var(--blue);border:1px solid #bfdbfe}
.pill-r{background:var(--rll);color:var(--red);border:1px solid #fecaca}
.pill-a{background:var(--all);color:var(--amber);border:1px solid #fde68a}
.live{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite;margin-right:3px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px}
.modal-box{background:var(--bg2);border-radius:var(--r2);padding:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.15)}
.modal-hdr{display:flex;align-items:center;margin-bottom:16px}
.modal-ttl{font-size:16px;font-weight:800;flex:1}
.fg{margin-bottom:10px}
.flbl{display:block;font-size:11px;font-weight:700;color:var(--text3);margin-bottom:3px;text-transform:uppercase}
.freq{color:var(--red)}
/* Empty states */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:var(--text3)}
.ei{font-size:40px;margin-bottom:8px}
.et{font-size:16px;font-weight:700}
.es{font-size:12px;margin-top:4px}
/* Agenda badges */
.ag-pend{background:#fef3c7;color:#b45309;border:1px solid #fde68a;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-done{background:var(--gll);color:var(--green);border:1px solid #bbf7d0;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
.ag-canc{background:var(--bg3);color:var(--text3);border:1px solid var(--border);border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700}
/* Hall badge */
.h-badge{display:inline-flex;align-items:center;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe}
@media (max-width:900px){.sg6{grid-template-columns:repeat(3,1fr)}.sg3{grid-template-columns:repeat(2,1fr)}.sg2{grid-template-columns:1fr}}
@media (max-width:600px){.sg6,.sg4,.sg3,.sg2{grid-template-columns:1fr}}

.btn-tab.tab-dragging{opacity:.4;cursor:grabbing}
.btn-tab.tab-drag-over{border-color:var(--blue)!important;background:var(--bll)!important}
</style>

<div id="appHdr" style="background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 12px;height:44px;position:sticky;top:0;z-index:200">
  <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
    <svg viewBox="0 0 140 140" width="36" height="36"><rect width="140" height="140" rx="28" fill="#030812"/><polygon points="70,10 122,40 122,100 70,130 18,100 18,40" stroke="#00ffc8" stroke-width="2" fill="#00ffc808"/><polygon points="70,28 106,49 106,91 70,112 34,91 34,49" stroke="#00ffc8" stroke-width="1.2" fill="none" opacity="0.4"/><circle cx="70" cy="70" r="9" fill="#00ffc8"/><circle cx="70" cy="70" r="3.5" fill="#030812"/></svg>
    <span style="font-family:'Oxanium',monospace;font-size:18px;font-weight:700;color:var(--text);letter-spacing:-.3px"><span style="color:#00ffc8">Be</span>Unify<span style="color:#00ffc8">T</span></span>
    <span class="v-badge">v7</span>
  </div>
  <div id="hdrCnts" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px"></div>
  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
    <button id="btnTheme" style="border:1px solid var(--border2);border-radius:20px;background:var(--bg3);color:var(--text2);font-size:11px;padding:3px 10px;cursor:pointer;display:flex;align-items:center;gap:4px" onclick="window._op.toggleThemeMenu()"><span id="themeIcon">☀️</span> <span id="themeLbl">'+_t('theme')+'</span> ▾</button>
    <div id="syncPill" class="sync-pill"><div class="sd"></div></div>
    <span style="width:1px;height:20px;background:var(--border);margin:0 2px;display:inline-block"></span>
    <button id="langFlagBtn" style="border:none;background:none;cursor:pointer;display:flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--text2)" onclick="window._op.openLangPicker()">${_curFlag()}</button>
    <span style="font-size:12px;font-weight:500;color:var(--text2)">${esc(user?.nombre || 'Usuario')}</span>
    <span style="width:1px;height:20px;background:var(--border);margin:0 2px;display:inline-block"></span>
    <button class="btn btn-gh btn-sm" id="logoutBtn" onclick="window._op.handleLogout()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> '+_t('logout')+'</button>
  </div>
</div>

<div id="mainTabs">
  ${tabs.map(t => `<button class="btn-tab" data-tab="${t.id}" onclick="window._op.goTab('${t.id}')" draggable="true" ondragstart="window._op.tabDragStart(event)" ondragover="window._op.tabDragOver(event)" ondrop="window._op.tabDrop(event)" ondragend="window._op.tabDragEnd(event)">${t.ico} ${_tabLabel(t.id)}</button>`).join('')}
</div>

<div id="mainContent">
  <div class="app-main" id="tabContent">
    <!-- Tab content injected here -->
  </div>
</div>

<!-- MODAL CONTAINER -->
<div id="modalContainer"></div>
`;
}

// ─── TABS ─────────────────────────────────────────────────────────────
const SVG = {
  dash:       '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  ingresos:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
  ingresos2:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>',
  flota:      '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
  conductores:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>',
  agenda:     '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>',
  analytics:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  vehiculos:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  auditoria:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  papelera:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  impresion:  '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  recintos:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  eventos:    '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  mensajes:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  usuarios:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  empresas:   '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
};

const TAB_DEFS = [
  {id:'dash',       label:'Dashboard',   ico:SVG.dash},
  {id:'ingresos',   label:'Referencia',  ico:SVG.ingresos},
  {id:'ingresos2',  label:'Ingresos',    ico:SVG.ingresos2},
  {id:'flota',      label:'Embalaje',    ico:SVG.flota},
  {id:'conductores',label:'Conductores', ico:SVG.conductores},
  {id:'agenda',     label:'Agenda',      ico:SVG.agenda},
  {id:'analytics',  label:'Análisis',    ico:SVG.analytics},
  {id:'vehiculos',  label:'Historial',   ico:SVG.vehiculos},
  {id:'auditoria',  label:'Archivos',    ico:SVG.auditoria},
  {id:'papelera',   label:'Papelera',    ico:SVG.papelera},
  {id:'impresion',  label:'Impresión',   ico:SVG.impresion},
  {id:'recintos',   label:'Recintos',    ico:SVG.recintos},
  {id:'eventos',    label:'Eventos',     ico:SVG.eventos},
  {id:'mensajes',   label:'Mensajes',    ico:SVG.mensajes},
  {id:'usuarios',   label:'Usuarios',    ico:SVG.usuarios},
  {id:'empresas',   label:'Empresas',    ico:SVG.empresas},
  {id:'migracion',  label:'Migración',   ico:'<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'},
];

const DEFAULT_TABS = {
  superadmin:        ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios','empresas','migracion'],
  supervisor:        ['dash','ingresos','ingresos2','flota','conductores','agenda','analytics','vehiculos','auditoria','papelera','impresion','recintos','eventos','mensajes','usuarios'],
  controlador_rampa: ['ingresos','ingresos2'],
  editor:            ['ingresos','ingresos2','conductores','agenda','impresion'],
  visor:             ['ingresos','ingresos2','agenda'],
};

function _getAllowedTabs(user) {
  if (!user) return [];
  const allowed = user.tabs || DEFAULT_TABS[user.rol] || ['dash','ingresos'];
  return TAB_DEFS.filter(t => allowed.includes(t.id));
}

function _validateTab() {
  const user = AppState.get('currentUser');
  const allowed = _getAllowedTabs(user).map(t => t.id);
  if (!allowed.includes(curTab)) curTab = allowed[0] || 'dash';
}

function goTab(tab) {
  curTab = tab;
  try { localStorage.setItem('beu_tab', tab); } catch(e) {}
  // Clear content first to avoid stale views
  const tc = document.getElementById('tabContent');
  if (tc) tc.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text3)"><div class="spinner" style="margin:0 auto"></div></div>';
  document.querySelectorAll('#mainTabs .btn-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  renderHdr();
  const map = {
    dash:        renderDash,
    ingresos:    renderIngresos,
    ingresos2:   renderIngresos2,
    flota:       renderFlota,
    conductores: renderConductores,
    agenda:      renderAgenda,
    analytics:   renderAnalytics,
    vehiculos:   renderVehiculos,
    auditoria:   renderAuditoria,
    papelera:    renderPapelera,
    impresion:   renderImpresion,
    recintos:    renderRecintos,
    eventos:     renderEventosTab,
    mensajes:    renderMensajes,
    usuarios:    renderUsuarios,
    empresas:    renderEmpresasTab,
    migracion:   renderMigracion,
  };
  try { (map[tab] || renderDash)(); } catch(e) { console.error('[goTab]', tab, e); if(tc) tc.innerHTML = '<div class="empty"><div class="ei">⚠️</div><div class="et">'+_M('status')+': '+tab+'</div><div class="es">'+e.message+'</div></div>'; }
}

// ─── HEADER ───────────────────────────────────────────────────────────
function renderHdr() {
  const el = document.getElementById('hdrCnts'); if (!el) return;
  const today = new Date().toISOString().slice(0, 10);
  const msgs  = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID) && !m.pausado && (!m.expiraTs || Date.now() < m.expiraTs)).length;
  const agH   = DB.agenda.filter(a => a.fecha === today && a.estado === 'PENDIENTE').length;
  const ev    = getActiveEvent();
  const hoy   = DB.ingresos.filter(i => i.entrada?.startsWith(today)).length + (DB.ingresos2||[]).filter(i => i.entrada?.startsWith(today)).length;
  const rec   = DB.ingresos.filter(i => !i.salida).length;
  const ref   = DB.ingresos.filter(i => !i.salida && (i.referencia||i.llamador)).length;
  el.innerHTML = `
    ${ev ? `<span class="ev-pill" style="cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="window._op.goTab('eventos')">${ev.ico||'📋'} ${esc(ev.nombre)}</span>` : `<span style="font-size:11px;color:var(--text3)">${_t('noEvent')}</span>`}
    <div style="display:flex;gap:4px;align-items:center">
      ${msgs ? `<div class="hdr-cnt" style="border-color:var(--red);background:var(--rll);cursor:pointer" onclick="window._op.goTab('mensajes')"><div class="hdr-cv" style="color:var(--red)">${msgs}</div><div class="hdr-cl">MSG</div></div>` : ''}
      ${agH  ? `<div class="hdr-cnt" style="border-color:#c7d2fe;background:#eef2ff;cursor:pointer" onclick="window._op.goTab('agenda')"><div class="hdr-cv" style="color:#4f46e5">${agH}</div><div class="hdr-cl">AGENDA</div></div>` : ''}
    </div>`;
}

function getActiveEvent() {
  if (!DB.activeEventId) return null;
  return DB.eventos.find(e => e.id === DB.activeEventId) || null;
}

function getTabEvent(tab) { return getActiveEvent(); }

// ─── DASHBOARD ────────────────────────────────────────────────────────
let _dashEvFilter = null;

function renderDash() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const hour = now.getHours();
  const greeting = hour < 12 ? _M('goodMorning') : hour < 20 ? _M('goodAfternoon') : _M('goodEvening');
  const userName = AppState.get('currentUser')?.nombre || '';
  const ev = DB.activeEventId ? DB.eventos.find(e => e.id === (DB.activeEventId)) : null;
  if (_dashEvFilter === null && ev) _dashEvFilter = ev.id;
  const selEv = _dashEvFilter ? DB.eventos.find(e => e.id === _dashEvFilter) : null;
  const allIngs = [...DB.ingresos, ...DB.ingresos2];
  const ings    = selEv ? allIngs.filter(i => i.eventoId === selEv.id) : allIngs;
  const rIngs   = selEv ? DB.ingresos.filter(i => i.eventoId === selEv.id) : DB.ingresos;
  const iIngs   = selEv ? DB.ingresos2.filter(i => i.eventoId === selEv.id) : DB.ingresos2;
  // Last 7 days
  const last7 = []; for (let d = 6; d >= 0; d--) { const dt = new Date(); dt.setDate(dt.getDate() - d); last7.push(dt.toISOString().slice(0, 10)); }
  const byDay = last7.map(d => ({ d, nRef: rIngs.filter(i => i.entrada?.startsWith(d)).length, nIng: iIngs.filter(i => i.entrada?.startsWith(d)).length }));
  const maxDay = Math.max(...byDay.map(x => x.nRef + x.nIng), 1);
  // Stats
  const enRec   = ings.filter(i => !i.salida).length;
  const hoyRef  = rIngs.filter(i => i.entrada?.startsWith(today)).length;
  const hoyIng  = iIngs.filter(i => i.entrada?.startsWith(today)).length;
  const agHoy   = DB.agenda.filter(a => a.fecha === today && (!selEv || a.eventoId === selEv.id));
  const msgs    = DB.mensajesRampa.filter(m => !(m.leido||[]).includes(SID)).length;
  const lastIngs= [...ings].sort((a,b) => (b.entrada||'').localeCompare(a.entrada||'')).slice(0, 15);
  const totalRef = rIngs.length, totalIng = iIngs.length, totalBoth = totalRef + totalIng;
  const pctRef = totalBoth ? Math.round(totalRef / totalBoth * 100) : 50;
  // Hall stats
  const hallC = {}; ings.forEach(i => (i.halls||[i.hall||'']).filter(Boolean).forEach(h => { hallC[h] = (hallC[h]||0)+1; }));
  const topH = Object.entries(hallC).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxHall = topH.length ? topH[0][1] : 1;

  let h = '';
  // Event selector
  const allEvs = DB.eventos.filter(e => DB.activeEventId ? e.id === DB.activeEventId : true);
  if (allEvs.length > 1) {
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">';
    allEvs.forEach(e => { h += `<button class="btn btn-xs ${_dashEvFilter===e.id?'btn-p':'btn-gh'}" onclick="window._dashEvFilter='${e.id}';window._op.renderDash()">${e.ico||'📋'} ${esc(e.nombre)}</button>`; });
    h += `<button class="btn btn-xs ${!_dashEvFilter?'btn-p':'btn-gh'}" onclick="window._dashEvFilter=null;window._op.renderDash()">🌐 ${_M('all')}</button></div>`;
  }
  // Greeting
  h += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:14px 18px;background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:var(--r2);color:#fff">
    <div><div style="font-size:18px;font-weight:800">${greeting}, ${esc(userName.split(' ')[0])}</div><div style="font-size:11px;color:#94a3b8;margin-top:2px">${selEv ? esc(selEv.ico||'') + ' ' + esc(selEv.nombre) : _M('noActiveEvent')} · ${now.toLocaleDateString(AppState.get('currentLang')||'es',{weekday:'long',day:'numeric',month:'long'})}</div></div>
    <span style="flex:1"></span>
    <div style="text-align:right"><div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:900">${String(hour).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}</div></div>
  </div>`;
  // Stat cards
  h += '<div class="sg sg6" style="margin-bottom:8px">';
  const statCard = (n, l, color, icon) => `<div class="stat-box" style="border-top:3px solid ${color};display:flex;align-items:center;gap:8px"><div style="flex-shrink:0;color:${color}">${icon}</div><div><div class="stat-n" style="color:${color}">${n}</div><div class="stat-l">${l}</div></div></div>`;
  h += statCard(enRec, _M('onPremises'), 'var(--green)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>');
  h += statCard(rIngs.length, _M('references'), 'var(--blue)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg>');
  h += statCard(iIngs.length, _M('entries'), 'var(--teal)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>');
  h += statCard(hoyRef + hoyIng, _M('today'), '#00b89a', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>');
  h += statCard(agHoy.length, _M('agendaToday'), 'var(--amber)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>');
  h += statCard(msgs || 0, _M('messages'), msgs ? 'var(--red)' : 'var(--border2)', '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>');
  h += '</div>';

  // Charts row
  h += '<div class="sg sg3" style="margin-bottom:8px">';
  // Chart 1: 7 days
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📊 '+_M('last7days')+'</div>`;
  byDay.forEach(x => {
    h += `<div class="bar-row"><span style="font-size:9px;min-width:38px;color:var(--text3)">${x.d.slice(5)}</span><div style="flex:1">`;
    h += `<div style="display:flex;align-items:center;gap:2px;margin-bottom:2px"><div style="height:5px;border-radius:2px;background:var(--blue);width:${Math.round(x.nRef/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nRef}</span></div>`;
    h += `<div style="display:flex;align-items:center;gap:2px"><div style="height:5px;border-radius:2px;background:var(--green);width:${Math.round(x.nIng/maxDay*100)}%"></div><span style="font-size:8px;color:var(--text3)">${x.nIng}</span></div>`;
    h += '</div></div>';
  });
  h += '</div>';
  // Chart 2: Ref vs Ing
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🔄 Ref vs Ing <span style="color:var(--blue)">${totalRef}</span> / <span style="color:var(--green)">${totalIng}</span></div>`;
  h += `<div style="height:12px;border-radius:6px;overflow:hidden;display:flex;margin-bottom:8px"><div style="background:var(--blue);width:${pctRef}%"></div><div style="background:var(--green);flex:1"></div></div>`;
  h += '<div style="display:flex;gap:6px"><div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--blue);font-size:20px">${hoyRef}</div><div class="stat-l">🔖 HOY REF</div></div>`;
  h += '<div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:6px">';
  h += `<div class="stat-n" style="color:var(--green);font-size:20px">${hoyIng}</div><div class="stat-l">🚛 HOY ING</div></div></div></div>`;
  // Chart 3: Halls
  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🏭 ' + _M('activeHalls') + '</div>';
  if (topH.length) { topH.forEach(kv => { h += `<div class="bar-row"><span style="font-size:11px;min-width:28px;font-weight:700">${esc(kv[0])}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(kv[1]/maxHall*100)}%;background:#00896b"></div></div><span class="bar-val">${kv[1]}</span></div>`; }); }
  else h += '<div class="empty" style="padding:12px"><div class="es">' + _M('noHallData') + '</div></div>';
  h += '</div></div>';

  // Agenda + últimos ingresos
  h += '<div class="sg sg2">';
  h += `<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">📅 Agenda hoy (${agHoy.length})</div>`;
  if (agHoy.length) {
    agHoy.slice(0, 6).forEach(a => {
      h += `<div style="display:flex;align-items:center;gap:4px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px">`;
      h += `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;min-width:36px">${a.hora||'--:--'}</span>`;
      h += `<span class="mchip-sm">${esc(a.matricula||'—')}</span>`;
      h += `<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px">${esc(a.empresa||a.conductor||'–')}</span>`;
      h += `<span class="${a.estado==='HECHO'?'ag-done':a.estado==='CANCELADO'?'ag-canc':'ag-pend'}">${a.estado||'PENDIENTE'}</span></div>`;
    });
  } else h += '<div class="empty" style="padding:12px"><div class="es">' + _M('noApptToday') + '</div></div>';
  h += `<button class="btn btn-p btn-sm" style="margin-top:8px;width:100%" onclick="window._op.goTab('agenda')">' + _M('viewAgenda') + '</button></div>`;

  h += '<div class="card"><div style="font-weight:800;margin-bottom:8px;font-size:12px">🕐 ' + _M('lastEntries') + '</div>';
  if (lastIngs.length) {
    h += '<div class="tbl-wrap" style="max-height:260px;overflow-y:auto"><table class="dtbl"><thead><tr><th>'+_M('plate')+'</th><th>'+_M('company')+'</th><th>'+_M('hall')+'</th><th>'+_M('time')+'</th></tr></thead><tbody>';
    lastIngs.forEach(i => {
      h += `<tr><td><span class="mchip" style="font-size:10px">${esc(i.matricula)}</span></td><td style="font-size:10px">${esc(i.empresa||'–')}</td><td><span class="h-badge">${esc(i.hall||i.halls?.[0]||'–')}</span></td><td style="font-size:10px">${fmt(i.entrada,'t')}</td></tr>`;
    });
    h += '</tbody></table></div>';
  } else h += '<div class="empty" style="padding:12px"><div class="es">' + _M('noEntriesReg') + '</div></div>';
  h += '</div></div>';

  if (msgs) h += `<div style="margin-top:10px;background:var(--rll);border:1.5px solid #fecaca;border-radius:var(--r2);padding:10px 14px;display:flex;align-items:center;gap:10px"><b>📢 ${msgs} ${_M('unreadMsg')}</b><button class="btn btn-gh btn-sm" onclick="window._op.goTab('mensajes')">${_M('view')}</button></div>`;

  el.innerHTML = h;
}

// ─── INGRESOS (Referencia) ────────────────────────────────────────────
function renderIngresos(){
  const today=new Date().toISOString().slice(0,10);
  let items=[...DB.ingresos];
  // Filter by tab event if selected, otherwise by active events
  if(DB.activeEventId)items=items.filter(i=>!i.eventoId||i.eventoId===DB.activeEventId);
  const q=(iF.q||'').toLowerCase();
  if(q)items=items.filter(i=>`${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.montador||''} ${i.expositor||''} ${i.comentario||''} ${i.telefono||''} ${i.email||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.puertaHall||''} ${i.tipoCarga||''}`.toLowerCase().includes(q));
  if(iF.fecha)items=items.filter(i=>i.entrada?.startsWith(iF.fecha));
  if(iF.hall)items=items.filter(i=>i.hall===iF.hall||((i.halls||[]).includes(iF.hall)));
  if(iF.activos)items=items.filter(i=>!i.salida);
  items=items.sort((a,b)=>(b.entrada||'').localeCompare(a.entrada||''));
  const sub=iF._sub||'lista';const ev=getActiveEvent();
  document.getElementById('tabContent').innerHTML=`
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 '+_M('list')],['listanegra','⭐ '+_M('special')],['historial','📝 '+_M('modifications')],...(canCampos()?[['campos','⚙ '+_M('fields')]]:[])] .map(([s,l])=>`<button class="btn btn-sm ${sub===s?'btn-p':'btn-gh'}" onclick="iF._sub='${s}';renderIngresos()">${l}</button>`).join('')}
      <span style="flex:1"></span>
      ${canAdd()&&sub!=='campos'?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700" onclick="_ingSource='ingresos';openIngModal()">+ ${_M('references')}</button><button class="btn btn-sm btn-gh af-toggle-btn" onclick="toggleAutoFill()" style="flex-shrink:0;border-radius:20px">⚡ ${_autoFillOn?tr('on')||'ON':tr('off')||'OFF'}</button><button class="btn btn-sm btn-gh pos-toggle-btn" onclick="togglePosAuto()" style="flex-shrink:0;border-radius:20px">🔢 ${_posAutoOn?tr('on')||'ON':tr('off')||'OFF'}</button>`:''}
      ${sub!=='historial'&&sub!=='campos'?`<button class="btn btn-s btn-sm" onclick="if(!canImport()){toast('${_M('noPermImport')}','var(--red)');return;}document.getElementById('xlsxIng').click()">📥 ${_M('import')}</button><button class="btn btn-gh btn-sm" onclick="dlTemplateIng()">📋 ${_M('template')}</button>`:''}
      ${sub!=='historial'&&sub!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" onclick="exportIngresos()">⬇ ${_M('excel')}</button>`:''}
      ${sub!=='historial'&&sub!=='campos'&&canClean()?`<button class="btn btn-sm" onclick="cleanTab('ingresos')">🗑 ${_M('clean')}</button>`:''} ${sub!=='historial'&&isSA()?`<button class="btn btn-danger btn-sm" onclick="vaciarTab('ingresos')">💥 ${_M('empty')}</button>`:''}
    </div>
    ${sub!=='historial'&&sub!=='print'&&sub!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="${_M('searchPlaceholder')}" value="${iF.q||''}" id="srch-ingresos" oninput="iF.q=this.value;debounceSearch('ingresos',renderIngresos)"></div>
      <input type="date" value="${iF.fecha||''}" oninput="iF.fecha=this.value;debounceSearch('ingresos-date',renderIngresos)" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px">
      <span class="pill" style="border:1.5px solid ${iF.activos?'var(--blue)':'var(--border)'};background:${iF.activos?'var(--blue)':'var(--bg2)'};color:${iF.activos?'#fff':'var(--text3)'}" onclick="iF.activos=!iF.activos;renderIngresos()">${_M('activeOnly')}</span>
      ${iF.q||iF.fecha||iF.hall||iF.activos?`<span class="pill pill-r" onclick="iF={q:'',fecha:'',hall:'',activos:false,_sub:iF._sub||'lista'};renderIngresos()">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3)">${items.length} ${_M('reg')}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!iF.hall?'#7dd3fc':'#93c5fd'};background:${!iF.hall?'#e0f2fe':'#dbeafe'};color:${!iF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="iF.hall='';renderIngresos()">${_M('all')}</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${iF.hall===h?'#3b82f6':'#dbeafe'};color:${iF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${iF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="iF.hall='${h}';renderIngresos()">${h}</span>`).join('')}
    </div>`:''}
    ${sub==='lista'?_ingLista(items):sub==='listanegra'?_ingLN():sub==='historial'?_ingHistorial('ingresos'):sub==='campos'?renderCamposSubtab('ingresos'):sub==='print'?_ingPrintCfg('ing1'):_ingLista(items)}`;
  if(sub==='print'){iF._sub='lista';goTab('impresion',null);window._impSub='ing1';renderImpresion();return;}
}
function _ingLista(items){
  const s=getSort('ingresos');
  items=sortArr(items,s.col||'pos',s.dir||'desc');
  return`
  ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('ingresos','pos','#')}${thSort('ingresos','matricula',_M('plate'))}${thSort('ingresos','llamador',_M('caller'))}${thSort('ingresos','referencia',_M('ref'))}${thSort('ingresos','nombre',_M('name')+'/'+_M('company'))}${thSort('ingresos','telefono',_M('phone'))}<th>${_L('Hal')}</th><th>${_L('Std')}</th><th style="font-size:10px">Evento</th>${thSort('ingresos','salida',_M('status'))}${thSort('ingresos','entrada',_M('entry'))}<th>Acc.</th></tr></thead><tbody>
    ${items.map(i=>{const _evN=i.eventoNombre||'';const _tev=getTabEvent('ingresos');const _isAlt=_evN&&_tev&&_evN!==_tev.nombre;return`<tr style="${_isAlt?'background:#f0f7ff':''}">
      <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
      <td><span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}')" title="Ver detalle">${i.matricula}</span>${i.remolque?`<br><span class="mchip-sm">${i.remolque}</span>`:''}</td>
      <td style="font-size:11px">${i.llamador||'–'}</td>
      <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${i.referencia||'–'}</td>
      <td><b style="font-size:12px">${i.nombre||''} ${i.apellido||''}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${i.empresa}</span>`:''}</td>
      <td>${telLink(i.telPais||'',i.telefono||'')}</td>
      <td>${(i.halls||[i.hall||'']).filter(Boolean).map(h=>hBadge(h)).join(' ')||'–'}</td><td style="font-size:11px">${i.stand||'–'}</td>
      <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.eventoNombre||''}">${i.eventoNombre?i.eventoNombre.slice(0,12):'–'}</td>
      <td>${!i.salida?'<span class="pill pill-g">✓ '+_M('onPremises')+'</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida,'t')}</span>`}</td>
      <td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>
      <td><div style="display:flex;gap:2px;flex-wrap:wrap">
        <button class="btn btn-gh btn-xs" onclick="printIngreso('${i.id}')" title="Imprimir Normal">🖨</button>
        <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" title="Imprimir Troquelado A4" onclick="printTrqRef('${i.id}')">✂</button>
        ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="_ingSource='ingresos';openIngModal(DB.ingresos.find(x=>x.id==='${i.id}'))">✏️</button>`:''}
        ${!i.salida&&canStatus()?`<button class="btn btn-warning btn-xs" onclick="marcarSalidaIng('${i.id}')">↩ Salida</button><button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="registrarPasoTracking('${i.id}','ingresos')">📡</button>`:''}
        ${i.salida&&canStatus()?`<button class="btn btn-success btn-xs" onclick="reactivarIngreso('${i.id}')" title="Reactivar / Error salida">↺</button>`:''}
        ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelIng('${i.id}')">🗑</button>`:''}
      </div></td>
    </tr>`;}).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">🚦</div><div class="et">${DB.ingresos.length?'Sin resultados':'' + _M('noEntriesReg') + ''}</div></div>`}`;}
function _ingEspera(){
  const items=DB.enEspera.filter(e=>e.estado==='pendiente').sort((a,b)=>{const p={urgente:0,alta:1,normal:2};return(p[a.prioridad]||2)-(p[b.prioridad]||2);});
  return`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:5px 10px;margin-bottom:4px;font-size:11px;color:var(--text3);display:flex;align-items:center;gap:4px">🔗 <b>Datos compartidos</b> — esta lista es la misma en todas las pestañas</div>
  <div class="sec-act" style="margin-bottom:10px">${canAdd()?`<button class="btn btn-p btn-sm" onclick="openEEModal()">+ En espera</button>`:''}</div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--blue)"><div class="stat-n" style="color:var(--blue)">${items.length}</div><div class="stat-l">⏳ Pendientes</div></div>
    <div class="stat-box" style="border-top:3px solid var(--green)"><div class="stat-n" style="color:var(--green)">${DB.enEspera.filter(e=>e.estado==='llegado').length}</div><div class="stat-l">✅ Llegados</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--text3)">${DB.enEspera.filter(e=>e.estado==='cancelado').length}</div><div class="stat-l">❌ Cancelados</div></div>
  </div>
  ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Prioridad</th><th>Conductor</th><th>Empresa</th><th>${_L('Hal')}</th><th>Hora</th><th>Acc.</th></tr></thead><tbody>
    ${items.map(e=>`<tr><td><span class="mchip">${e.matricula}</span></td>
      <td><span style="font-size:11px;font-weight:800;color:${e.prioridad==='urgente'?'var(--red)':e.prioridad==='alta'?'var(--amber)':'var(--text3)'}">${e.prioridad==='urgente'?'🔴':e.prioridad==='alta'?'🔶':'●'} ${e.prioridad}</span></td>
      <td style="font-size:11px">${e.conductor||'–'}</td><td style="font-size:11px">${e.empresa||'–'}</td><td>${hBadge(e.hall)}</td><td style="font-size:11px">${e.hora||fmt(e.ts,'t')}</td>
      <td><div style="display:flex;gap:2px">
        ${canAdd()?`<button class="btn btn-success btn-xs" onclick="marcarEELlegado('${e.id}')">✅</button>`:''}
        ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openEEModal(DB.enEspera.find(x=>x.id==='${e.id}'))">✏️</button>`:''}
        ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelEE('${e.id}')">🗑</button>`:''}
      </div></td></tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">⏳</div><div class="et">Lista de espera vacía</div></div>`}`;}
function _ingLN(){
  const items=DB.listaNegra;
  return`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:5px 10px;margin-bottom:4px;font-size:11px;color:var(--text3);display:flex;align-items:center;gap:4px">🔗 <b>Datos compartidos</b> — esta lista es la misma en todas las pestañas</div>
  <div class="sec-act" style="margin-bottom:10px">${canSpecial()?`<button class="btn btn-r btn-sm" onclick="openLNModal()">+ ${_M('add')} ${_M('plate')}</button>`:''} ${canExport()?`<button class="btn btn-gh btn-sm" onclick="exportListaNegra()">⬇ Excel</button>`:''}</div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--red)"><div class="stat-n" style="color:var(--red)">${items.filter(i=>i.nivel==='bloqueo').length}</div><div class="stat-l">🚫 Bloqueadas</div></div>
    <div class="stat-box" style="border-top:3px solid var(--amber)"><div class="stat-n" style="color:var(--amber)">${items.filter(i=>i.nivel==='alerta').length}</div><div class="stat-l">⚠️ Alertas</div></div>
    <div class="stat-box"><div class="stat-n">${items.length}</div><div class="stat-l">Hoy</div></div>
  </div>
  ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>"+_M("level")+"</th><th>Motivo</th><th>Empresa</th><th>Válido hasta</th><th>Acc.</th></tr></thead><tbody>
    ${items.map(ln=>`<tr><td><span class="mchip">${ln.matricula}</span></td>
      <td><span style="font-weight:800;color:${ln.nivel==='bloqueo'?'var(--red)':'var(--amber)'}">${ln.nivel==='bloqueo'?'🚫 BLOQUEO':'⚠️ ALERTA'}</span></td>
      <td style="font-size:11px">${ln.motivo||'–'}</td><td style="font-size:11px">${ln.empresa||'–'}</td><td style="font-size:11px">${ln.hasta||'–'}</td>
      <td><div style="display:flex;gap:2px">${canSpecial()?`<button class="btn btn-edit btn-xs" onclick="openLNModal(DB.listaNegra.find(x=>x.id==='${ln.id}'))">✏️</button>`:''} ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelLN('${ln.id}')">🗑</button>`:''}</div></td>
    </tr>`).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">🚫</div><div class="et">Especial vacía</div></div>`}`;}
function pauseMsg(id){const m=DB.mensajesRampa.find(x=>x.id===id);if(!m)return;m.pausado=!m.pausado;saveDBNow();renderMensajesTab();renderHdr();}
function _ingMsgs(){
  const _nowTs=Date.now();
  const items=[...DB.mensajesRampa].sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0,80);
  let changed=false;
  DB.mensajesRampa.forEach(m=>{
    if(!m.leido)m.leido=[];
    if(!m.leido.includes(SID)){m.leido.push(SID);changed=true;}
    if(!m.pausado&&m.expiraTs&&_nowTs>m.expiraTs){m.pausado=true;changed=true;}
  });
  if(changed){saveDBNow();_lastMsgCount=0;}
  return`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:5px 10px;margin-bottom:4px;font-size:11px;color:var(--text3);display:flex;align-items:center;gap:4px">🔗 <b>Datos compartidos</b> — los mensajes son los mismos en todas las pestañas</div>
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
    <button class="btn btn-p btn-sm" onclick="openMsgModal()">📢 '+_M('newMsg')+'</button>
    <button class="btn btn-gh btn-sm" onclick="marcarTodosMsgLeidos()">✓ Todos leídos</button>
    ${isSup()&&DB.mensajesRampa.length?`<button class="btn btn-danger btn-sm" onclick="if(confirm(_M('clean')+'?')){DB.mensajesRampa=[];saveDB();renderMensajesTab();renderHdr();}">🗑 Limpiar</button>`:''}
    ${canExport()?`<button class="btn btn-gh btn-sm" onclick="exportMensajes()">⬇ Excel</button>`:''}
  </div>
  ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Tipo</th><th>Título</th><th>"+_M("messages")+"</th><th>Matrícula</th><th>Hora</th><th>Autor</th><th></th></tr></thead><tbody>
    ${items.map(m=>{const isExpired=m.expiraTs&&_nowTs>m.expiraTs;const ur=!m.leido?.includes(SID)&&!m.pausado&&!isExpired;return`<tr style="${m.pausado||isExpired?'opacity:.45;background:var(--bg3)':ur?'background:var(--rll)':''}">
      <td>${m.tipo==='urgente'?'🔴':m.tipo==='alerta'?'⚠️':'ℹ️'}${m.pausado?' ⏸':isExpired?' ⏰':''}</td>
      <td style="font-weight:${ur?800:600};font-size:12px">${m.titulo||'–'}</td>
      <td style="font-size:11px">${m.mensaje||'–'}</td>
      <td>${m.matricula?`<span class="mchip-sm">${m.matricula}</span>`:'-'}</td>
      <td style="font-size:10px;white-space:nowrap">${fmt(m.ts,'t')}</td>
      <td style="font-size:10px">${m.autor||'–'}</td>
      <td><div style="display:flex;gap:2px">
        <button class="btn btn-xs btn-gh" title="${m.pausado?''+_M('reactivate')+'':''+_M('pause')+''}" onclick="pauseMsg('${m.id}')">${m.pausado?'▶':'⏸'}</button>
        ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelMsg('${m.id}')">🗑</button>`:''}
      </div></td>
    </tr>`;}).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>`}`;}
function _ingPrintCfg(cfgKey){
  const isAg=cfgKey==='ag',isTab2=cfgKey==='ing2';
  const cfg=isAg?DB.printCfgAg:isTab2?DB.printCfg2:DB.printCfg1;
  const mode=(DB.printCfgModes||{})[cfgKey]||'normal';
  const paperSize=cfg.paperSize||'A4';
  const font=cfg.font||'Arial';
  const ph3=cfg.puerta3||{};
  const ph2Val=(cfg.phrase2||'').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const uLang=CUR_LANG||'es';
  const uInfo=LANGS_UI.find(l=>l.code===uLang)||{flag:'🇪🇸',name:'Español'};
  const ph1Val=((cfg.phrases||{})[uLang]||'').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const _dm=DB.printCfgModes||{};
  const tpls=(DB.printTemplates||[]).map((t,idx)=>{
    const _dIng1=_dm['dest_ing1']===t.name,_dIng2=_dm['dest_ing2']===t.name,_dAg=_dm['dest_ag']===t.name;
    const _dStyle=(on)=>on?'background:#16a34a;color:#fff;border-color:#16a34a':'background:var(--bg3);color:var(--text3);border-color:var(--border)';
    return`<div style="display:flex;align-items:flex-start;gap:5px;padding:5px 7px;border-radius:5px;background:var(--bg3);border:0.5px solid var(--border)">
      <div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0">
        <span style="font-size:11px;font-weight:600;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="loadPrintTemplate('${t.name}','${cfgKey}')">📋 ${t.name} <span style="font-size:9px;opacity:.6">${t.mode==='troquel'?'✂ Troquel':'📄 Normal'} ${t.paperSize||'A4'}</span></span>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          <span onclick="toggleTplDest('${t.name}','dest_ing1','${cfgKey}')" title="Asignar a Referencia lista" style="cursor:pointer;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;border:0.5px solid;${_dStyle(_dIng1)}">Ref${_dIng1?' ✓':''}</span>
          <span onclick="toggleTplDest('${t.name}','dest_ing2','${cfgKey}')" title="Asignar a Ingresos lista" style="cursor:pointer;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;border:0.5px solid;${_dStyle(_dIng2)}">Ing${_dIng2?' ✓':''}</span>
          <span onclick="toggleTplDest('${t.name}','dest_ag','${cfgKey}')" title="Asignar a Agenda lista" style="cursor:pointer;padding:1px 6px;border-radius:10px;font-size:10px;font-weight:700;border:0.5px solid;${_dStyle(_dAg)}">Ag${_dAg?' ✓':''}</span>
        </div>
      </div>
      <button class="btn btn-xs btn-gh" onclick="loadPrintTemplate('${t.name}','${cfgKey}')">Cargar</button>
      <button class="btn btn-xs btn-gh" onclick="editPrintTpl(${idx},'${cfgKey}')" title="Renombrar plantilla">✏️</button>
      <div style="margin-left:6px"><button class="btn btn-xs btn-danger" onclick="delPrintTpl(${idx},'${cfgKey}')" ${_M('delete')}>✕</button></div>
    </div>`;
  }).join('');

  // Serialise placed fields for JS initialisation
  const placedJSON=JSON.stringify(cfg.fieldLayout||{});

  const FONT_LIST=['Arial','Arial Black','Calibri','Courier New','Georgia','Helvetica','Impact','Tahoma','Times New Roman','Trebuchet MS','Verdana'];
  const fontOpts=FONT_LIST.map(f=>`<option ${f===font?'selected':''}>${f}</option>`).join('');

  return `<div id="pcfg-${cfgKey}" style="background:var(--bg2);border-radius:var(--r2);padding:10px">
  <style>
  #pv-${cfgKey}{position:relative;background:#fff;border:1px solid #aaa;overflow:visible;width:min(794px,calc(100vw - 260px));height:min(1123px,calc((100vw - 260px)*297/210));flex-shrink:0;font-family:'Arial',sans-serif}
  .pfc-${cfgKey}{position:absolute;border:1.5px solid #000;background:rgba(255,255,255,.96);border-radius:2px;padding:1px 4px;font-size:8px;font-weight:700;cursor:move;z-index:10;display:flex;align-items:baseline;line-height:1.4;user-select:none;min-width:50px;max-width:200px}
  .pfc-${cfgKey}.pfc-sel{border:2px solid #3b5bdb;background:#eff6ff;z-index:20}
  .pfc-${cfgKey} .pfc-line{flex:1;min-width:20px;border-bottom:1px solid #000;height:1px;margin:0 2px;align-self:flex-end;margin-bottom:2px}
  .pfc-${cfgKey} .pfc-val{font-weight:400;margin-left:3px}
  .pfc-${cfgKey} .pfc-rm{font-size:9px;color:#aaa;cursor:pointer;margin-left:3px;flex-shrink:0}
  .pfc-${cfgKey} .pfc-rm:hover{color:#e00}
  .guide-h-${cfgKey}{position:absolute;left:0;right:0;height:1px;background:#3b5bdb;pointer-events:none;z-index:50;display:none}
  .guide-v-${cfgKey}{position:absolute;top:0;bottom:0;width:1px;background:#e53e3e;pointer-events:none;z-index:50;display:none}
  .fp-item-${cfgKey}{display:flex;align-items:center;gap:4px;padding:3px 6px;border-radius:5px;border:0.5px solid var(--border);background:var(--bg);font-size:11px;font-weight:500;user-select:none}
  .fp-item-${cfgKey}.fp-done{opacity:.4}
  .fp-item-${cfgKey} .fp-drag-h{cursor:grab;display:flex;align-items:center;gap:4px;flex:1}
  .fp-item-${cfgKey}.fp-done .fp-drag-h{cursor:default;text-decoration:line-through}
  </style>

  <div style="display:grid;grid-template-columns:300px 1fr;gap:14px;overflow-x:auto;margin-top:-8px">

  <!-- LEFT PANEL -->
  <div style="display:flex;flex-direction:column;gap:6px;position:sticky;top:0;align-self:start;max-height:calc(100vh - 70px);overflow-y:auto;padding-right:3px">

    <div style="display:flex;align-items:center;gap:5px">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase">Fuente</span>
      <select onchange="setPrintCfgFont('${cfgKey}',this.value)" style="flex:1;font-size:11px;padding:2px 5px;border-radius:5px;border:0.5px solid var(--border);background:var(--bg)">${fontOpts}</select>
    </div>
    <div style="display:flex;gap:4px;align-items:center">
      <span style="font-size:9px;color:var(--text3);font-weight:700;text-transform:uppercase;width:38px">Papel</span>
      ${['A3','A4','A5'].map(sz=>`<button class="btn btn-xs ${paperSize===sz?'btn-p':'btn-gh'}" style="padding:2px 10px;font-size:11px;font-weight:700" onclick="setPaperSize('${cfgKey}','${sz}')">${sz}</button>`).join('')}
    </div>
    <div style="border:0.5px solid var(--border);border-radius:6px;overflow:hidden">
      <div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:var(--bg3);border-bottom:${cfg.qrTracking!==false?'0.5px solid var(--border)':'none'}">
        <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);flex:1">QR Tracking</span>
        <div style="display:flex;align-items:center;gap:5px;cursor:pointer" onclick="toggleQR('${cfgKey}')">
          <div style="width:26px;height:14px;border-radius:7px;background:${cfg.qrTracking!==false?'var(--blue)':'var(--border2)'};position:relative;flex-shrink:0">
            <div style="width:10px;height:10px;border-radius:50%;background:#fff;position:absolute;top:2px;${cfg.qrTracking!==false?'left:14px':'left:2px'}"></div>
          </div>
          <span style="font-size:10px;font-weight:700;color:${cfg.qrTracking!==false?'var(--blue)':'var(--text3)'}">${cfg.qrTracking!==false?'ON':'OFF'}</span>
        </div>
        <button class="btn btn-xs ${cfg.qrTracking!==false?'btn-p':'btn-gh'}" onclick="pcQuickAddPhrase('qr','${cfgKey}')" title="Añadir QR al canvas" style="padding:1px 6px;font-size:10px">+</button>
      </div>
    </div>
    ${['p1','p2','p3'].map(pk=>{
      const isOn=pk==='p1'?cfg.ph1On===true:pk==='p2'?cfg.ph2On!==false:cfg.ph3On===true;
      const labels={'p1':'Frase 1 — bajo matrícula','p2':`Frase 2 — pie ficha${mode==='troquel'?' / tira':''}`,'p3':'Frase 3 — QR de acceso'};
      const bodyHtml=pk==='p3'?`<div style="display:flex;flex-direction:column;gap:3px;padding:5px 7px">
          <input id="pcp3n-${cfgKey}" placeholder="Dirección / nombre puerta (14px)..." value="${(ph3.nombre||'').replace(/"/g,'&quot;')}" style="font-size:11px;border:0.5px solid var(--border);border-radius:5px;padding:3px 6px;background:var(--bg);width:100%" oninput="savePuerta3('${cfgKey}')">
          <input id="pcp3u-${cfgKey}" placeholder="Link Google Maps → QR automático..." value="${(ph3.url||'').replace(/"/g,'&quot;')}" style="font-size:11px;border:0.5px solid var(--border);border-radius:5px;padding:3px 6px;background:var(--bg);width:100%" oninput="savePuerta3('${cfgKey}')">
        </div>`
        :`<textarea id="pcph${pk.slice(1)}-${cfgKey}" rows="2" style="width:100%;font-size:11px;border:none;border-top:0.5px solid var(--border);padding:4px 7px;resize:none;background:var(--bg)" oninput="pcSavePhrase('${cfgKey}')">${pk==='p1'?ph1Val:ph2Val}</textarea>`;
      return`<div style="border:0.5px solid var(--border);border-radius:6px;overflow:hidden">
        <div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:var(--bg3)">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);flex:1">${labels[pk]}</span>
          <div style="display:flex;align-items:center;gap:5px;cursor:pointer" onclick="pcTogglePhrase('${pk}','${cfgKey}')">
            <div style="width:26px;height:14px;border-radius:7px;background:${isOn?'var(--blue)':'var(--border2)'};position:relative;flex-shrink:0">
              <div style="width:10px;height:10px;border-radius:50%;background:#fff;position:absolute;top:2px;${isOn?'left:14px':'left:2px'}"></div>
            </div>
            <span style="font-size:10px;font-weight:700;color:${isOn?'var(--blue)':'var(--text3)'}">${isOn?'ON':'OFF'}</span>
          </div>
          <button class="btn btn-xs ${isOn?'btn-p':'btn-gh'}" onclick="pcQuickAddPhrase('${pk}','${cfgKey}')" title="Añadir frase al canvas" style="padding:1px 6px;font-size:10px" ${isOn?'':'disabled'}>+</button>
        </div>
        ${isOn?bodyHtml:''}
      </div>`;
    }).join('')}
    <div style="border:0.5px solid var(--border);border-radius:6px;overflow:hidden;margin-top:10px">
      <div id="pc-fld-hdr-${cfgKey}" style="display:flex;align-items:center;gap:5px;padding:5px 8px;background:var(--bg3);cursor:pointer" onclick="pcToggleFields('${cfgKey}')">
        <span style="font-size:10px;font-weight:700;color:var(--text3)">Campos</span>
        <span style="flex:1"></span>
        <span id="pc-fld-arrow-${cfgKey}" style="font-size:12px;color:var(--text3)">▸</span>
      </div>
      <div id="pc-fld-body-${cfgKey}" style="display:none;flex-direction:column;gap:2px;padding:4px 7px 6px;max-height:280px;overflow-y:auto">
        <div id="pc-palette-${cfgKey}" style="display:flex;flex-direction:column;gap:2px;"></div>
      </div>
    </div>
    <div style="border:1.5px dashed var(--border);border-radius:6px;padding:10px 8px;font-size:11px;color:var(--text3);text-align:center;cursor:pointer;margin-top:10px" onclick="document.getElementById('pcbg-${cfgKey}').click()">
      <div style="font-size:22px;margin-bottom:4px">🗺</div>
      <div style="font-weight:500">Subir imagen de guía</div>
      <input type="file" id="pcbg-${cfgKey}" accept="image/*" style="display:none" onchange="pcLoadBG(this,'${cfgKey}')">
      <div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px">Opacidad:</span><input type="range" min="5" max="80" value="${Math.round((cfg.bgOpacity||0.35)*100)}" step="5" style="flex:1;height:4px" oninput="const img=document.getElementById('pcbg-img-${cfgKey}');if(img)img.style.opacity=this.value/100;this.nextElementSibling.textContent=this.value+'%';const _c2=${cfgKey==='ag'?'DB.printCfgAg':cfgKey==='ing2'?'DB.printCfg2':'DB.printCfg1'};_c2.bgOpacity=this.value/100;saveDB()"><span style="font-size:9px;min-width:28px">${Math.round((cfg.bgOpacity||0.35)*100)}%</span><button class="btn btn-xs btn-gh" onclick="const img=document.getElementById('pcbg-img-${cfgKey}');if(img){img.src='';img.style.display='none';}const _c2=${cfgKey==='ag'?'DB.printCfgAg':cfgKey==='ing2'?'DB.printCfg2':'DB.printCfg1'};delete _c2.bgImage;delete _c2.bgOpacity;saveDB()">✕</button></div>
    </div>
    <div style="border-top:0.5px solid var(--border);padding-top:6px;margin-top:10px">
      <div id="pctpl-confirm-${cfgKey}" style="display:none;background:var(--all);border:0.5px solid #fde68a;border-radius:5px;padding:6px 8px;margin-bottom:5px;font-size:11px">
        <div style="font-weight:700;margin-bottom:4px">'+_M('confirm')+' '+_M('save')+'?'+'</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px">
          <span id="pctpl-cfmt-${cfgKey}" style="background:var(--blue);color:#fff;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700"></span>
          <span id="pctpl-csz-${cfgKey}" style="background:var(--bg4);color:var(--text);padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700"></span>
          <span id="pctpl-cnm-${cfgKey}" style="background:var(--bg4);color:var(--text);padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700"></span>
        </div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-xs btn-gh" style="flex:1" onclick="document.getElementById('pctpl-confirm-${cfgKey}').style.display='none'">Cancelar</button>
          <button class="btn btn-xs btn-p" style="flex:1;background:#7950f2;border-color:#7950f2;border-radius:20px" onclick="confirmSavePrintTemplate('${cfgKey}')">💾 Guardar</button>
        </div>
      </div>
      <div style="display:flex;gap:4px">
        <input id="pctpl-name-${cfgKey}" placeholder="Nombre plantilla..." style="flex:1;font-size:11px;padding:4px 7px;border:0.5px solid var(--border);border-radius:5px;background:var(--bg)">
        <button class="btn btn-sm" style="background:#7950f2;color:#fff;border-radius:20px" onclick="if(!canSaveTpl()){toast('Sin permiso para guardar plantillas','var(--red)');return;}preSavePrintTemplate('${cfgKey}')">💾 Guardar</button>
      </div>
    </div>
    ${tpls?`<div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:4px">Plantillas guardadas</div><div style="display:flex;flex-direction:column;gap:3px">${tpls}</div></div>`:''}
  </div>

  <!-- RIGHT PANEL: LIVE PREVIEW -->
  <div style="display:flex;flex-direction:column;gap:0;position:sticky;top:60px;align-self:start;max-height:calc(100vh - 70px);overflow-y:auto;padding-right:2px">
    <div style="display:flex;align-items:center;gap:5px;padding-bottom:3px;flex-wrap:nowrap;position:sticky;top:0;background:var(--bg);z-index:20;padding-top:1px">
      <button class="btn btn-sm btn-p" style="padding:3px 8px;font-size:10px" onclick="pcResizeSel('${cfgKey}',1)">A+</button>
      <button class="btn btn-sm btn-p" style="padding:3px 8px;font-size:10px" onclick="pcResizeSel('${cfgKey}',5)">A++</button>
      <button class="btn btn-sm btn-p" style="padding:3px 8px;font-size:10px" onclick="pcResizeSel('${cfgKey}',-1)">A−</button>
      <div style="width:1px;height:16px;background:var(--border);flex-shrink:0;margin:0 1px"></div>
      <button class="btn btn-sm btn-t" style="padding:3px 9px;font-size:10px" onclick="imprimirYGuardarConTpl('normal')">🖨 Normal</button>
      <button class="btn btn-sm" style="padding:3px 9px;font-size:10px;background:#7c3aed;color:#fff;border-color:#7c3aed;border-radius:20px" onclick="imprimirYGuardarConTpl('troquel')">✂ Troquelado</button>
      <div style="width:24px;flex-shrink:0"></div>
      <button class="btn btn-sm btn-gh" style="padding:3px 8px;font-size:10px" onclick="pcToggleLabelMode('${cfgKey}')" id="pc-lblbtn-${cfgKey}">📋 Etiq+Valor</button>
      <button class="btn btn-sm" style="padding:3px 8px;font-size:10px" onclick="if(!canDelTpl()){toast(_M('noPermImport'),'var(--red)');return;}pcClearAll('${cfgKey}')">🗑 Limpiar</button>
      <div style="width:16px;flex-shrink:0"></div>
      <button class="btn btn-sm btn-gh" style="padding:3px 9px;font-size:10px" onclick="printPreviewWithCfg('${cfgKey}')">👁 Vista previa</button>
      <span style="flex:1"></span>
      <button class="btn btn-sm" style="padding:3px 9px;font-size:10px;background:#7c3aed;color:#fff;border-color:#7c3aed;border-radius:20px" onclick="if(!canDelTpl()){toast(_M('noPermImport'),'var(--red)');return;}resetPrintCfgDia0('${cfgKey}')">🔄 Día 0</button>
    </div>
    <span id="pc-selinfo-${cfgKey}" style="display:none"></span>

    <div style="position:relative">
    <div id="pv-${cfgKey}" ondragover="event.preventDefault()" ondrop="pcDrop(event,'${cfgKey}')" onclick="pcClickPv(event,'${cfgKey}')">
      <img id="pcbg-img-${cfgKey}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none;display:none;opacity:0.35">
      <div id="pc-cut-${cfgKey}" style="position:absolute;left:0;right:0;top:50%;height:2px;background:#000;pointer-events:none;z-index:6;display:${mode==='troquel'?'block':'none'}"></div>
      <div class="guide-h-${cfgKey}" id="pc-gh-${cfgKey}"></div>
      <div class="guide-v-${cfgKey}" id="pc-gv-${cfgKey}"></div>
      <!-- Fixed header (hidden if canvas was cleared) -->
      <div id="pc-hdr-${cfgKey}" style="position:absolute;top:0;left:0;right:0;padding:5px 8px 4px;border-bottom:1.5px solid #000;background:rgba(255,255,255,.97);z-index:4;font-family:'${font}',Arial,sans-serif;display:block">
        <div style="display:${cfg.canvasCleared?'none':'flex'};justify-content:space-between;margin-bottom:3px">
          <div><div style="font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.3px">${mode==='troquel'?'LAISSEZ-PASSER':'PASE DE ENTRADA'}</div><div id="pc-ev-lbl-${cfgKey}" style="font-size:6px;color:#555"></div></div>
          <div style="font-size:6px;color:#777;text-align:right">DD/MM/YYYY<br>HH:MM</div>
        </div>
        <div style="display:${cfg.canvasCleared?'none':'flex'};gap:4px">
          <div style="width:28px;border:1.5px solid #000;border-radius:2px;text-align:center;padding:2px 0"><div style="font-size:4px;text-transform:uppercase;color:#666">Pos.</div><div style="font-size:16px;font-weight:900;line-height:1;color:#000">7</div></div>
          <div style="flex:1;border:1.5px solid #000;border-radius:2px;padding:2px 5px"><div style="font-size:5px;text-transform:uppercase;color:#666">Matrícula</div><div style="font-size:12px;font-weight:900;color:#000">AB1234CD</div><div style="font-size:6px;color:#555">TR5678X</div></div>
          <div style="border:1.5px solid #000;border-radius:2px;padding:2px 5px;min-width:55px"><div style="font-size:5px;text-transform:uppercase;color:#666">Teléfono</div><div style="font-size:7px;font-weight:700;color:#000">+34 600 123456</div></div>
          ${cfg.qrTracking!==false?'<div style="width:30px;border:1.5px solid #000;border-radius:2px;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 7 7" shape-rendering="crispEdges"><rect x="0" y="0" width="3" height="3" fill="#000"/><rect x="1" y="1" width="1" height="1" fill="#fff"/><rect x="4" y="0" width="3" height="3" fill="#000"/><rect x="5" y="1" width="1" height="1" fill="#fff"/><rect x="0" y="4" width="3" height="3" fill="#000"/><rect x="1" y="5" width="1" height="1" fill="#fff"/><rect x="3" y="3" width="4" height="4" fill="#000"/><rect x="4" y="4" width="2" height="2" fill="#fff"/></svg></div>':''}
        </div>
        <div id="pc-ph1-${cfgKey}" style="margin-top:3px;border:1px solid #000;padding:2px 5px;font-size:6.5px;font-weight:700;line-height:1.3;display:${cfg.ph1On===true&&(cfg.phrases||{})[uLang]?'block':'none'}">${((cfg.phrases||{})[uLang]||"").substring(0,80)}</div>
      </div>
      <!-- Normal footer -->
      <div id="pc-nfoot-${cfgKey}" style="position:absolute;bottom:8px;left:0;right:0;padding:0 8px;z-index:4;font-family:'${font}',Arial,sans-serif;display:${mode==='normal'?'block':'none'}">
        <div id="pc-ph2-${cfgKey}" style="border:1px solid #000;padding:2px 5px;font-size:6.5px;font-weight:700;line-height:1.3;margin-bottom:3px;display:${cfg.ph2On!==false&&cfg.phrase2?'block':'none'}">${(cfg.phrase2||"").substring(0,100)}</div>
        ${ph3.nombre||ph3.url?`<div style="display:flex;align-items:center;gap:4px;border:1px solid #000;padding:2px 5px;margin-bottom:3px"><svg width="14" height="14" viewBox="0 0 5 5" shape-rendering="crispEdges"><rect width="2" height="2" fill="#000"/><rect x="1" y="1" width="1" height="1" fill="#fff"/><rect x="3" width="2" height="2" fill="#000"/><rect y="3" width="2" height="2" fill="#000"/><rect x="2" y="2" width="3" height="3" fill="#000"/></svg><div><div style="font-size:5px;font-weight:800;text-transform:uppercase">Acceso</div><div style="font-size:6px;font-weight:700">${ph3.nombre||ph3.url}</div></div></div>`:''}
        <div style="font-size:5.5px;color:#888">BeUnifyT · ID: AB12 · DD/MM/YYYY</div>
      </div>
      <!-- Troquelado strip footer -->
      <div id="pc-tfoot-${cfgKey}" style="position:absolute;top:50%;left:0;right:0;bottom:0;background:rgba(255,255,255,.97);padding:4px 8px;z-index:4;font-family:'${font}',Arial,sans-serif;display:${mode==='troquel'?'block':'none'}">
        <div style="display:flex;align-items:center;gap:4px;padding-bottom:3px;border-bottom:1px solid #aaa;margin-bottom:3px">
          <div style="border-right:1px solid #000;padding-right:4px;text-align:center;min-width:22px"><div style="font-size:18px;font-weight:900;color:#000;line-height:1">7</div><div style="font-size:4px;text-transform:uppercase;color:#666">Pos.</div></div>
          <div style="border-right:1px solid #000;padding-right:4px"><div style="font-size:4px;text-transform:uppercase;color:#666">Matrícula</div><div style="font-size:10px;font-weight:700;color:#000">AB1234CD</div></div>
          <div style="border-right:1px solid #000;padding-right:4px"><div style="font-size:4px;text-transform:uppercase;color:#666">Teléfono</div><div style="font-size:7.5px;color:#000">+34 600123456</div></div>
          ${cfg.qrTracking!==false?'<div style="margin-left:auto"><svg width="20" height="20" viewBox="0 0 5 5" shape-rendering="crispEdges"><rect width="2" height="2" fill="#000"/><rect x="1" y="1" width="1" height="1" fill="#fff"/><rect x="3" width="2" height="2" fill="#000"/><rect y="3" width="2" height="2" fill="#000"/><rect x="2" y="2" width="3" height="3" fill="#000"/></svg></div>':''}
        </div>
        ${(cfg.ph2On!==false&&cfg.phrase2)?`<div style="border:1px solid #000;padding:2px 5px;font-size:6px;font-weight:700;line-height:1.3;margin-bottom:2px">${cfg.phrase2.substring(0,100)}</div>`:''}
        ${ph3.nombre||ph3.url?`<div style="display:flex;align-items:center;gap:4px;border:1px solid #000;padding:2px 5px"><svg width="12" height="12" viewBox="0 0 5 5" shape-rendering="crispEdges"><rect width="2" height="2" fill="#000"/><rect x="1" y="1" width="1" height="1" fill="#fff"/><rect x="3" width="2" height="2" fill="#000"/><rect y="3" width="2" height="2" fill="#000"/><rect x="2" y="2" width="3" height="3" fill="#000"/></svg><div style="font-size:6px;font-weight:700;color:#000">${ph3.nombre||ph3.url}</div></div>`:''}
      </div>
    </div>
    </div>
    <div style="font-size:9px;color:var(--text3);text-align:center;margin-top:3px">Guía azul = alineación horizontal · Guía roja = alineación vertical · Se muestran al arrastrar</div>
  </div>
  </div>
  </div>
  <div style="display:none" id="pci-${cfgKey}">
  (function(){
  const CK='${cfgKey}';
  const SNAP_THR=1.5;
  const PF_FIELDS=[
    {k:'nombreCompleto',l:_L('Nom')+' '+_L('Ape'),demo:'Juan García'},
    {k:'empresa',l:_L('Emp'),demo:'Empresa Demo S.L.'},
    {k:'expositor',l:_L('Exp'),demo:'ExpoDemo SL'},
    {k:'montador',l:_L('Mon'),demo:'MontajeXL'},
    {k:'hall',l:_L('Hal'),demo:'Hall 5'},
    {k:'stand',l:_L('Std'),demo:'B-200'},
    {k:'puertaHall',l:_L('PuH'),demo:'P3'},
    {k:'remolque',l:_L('Rem'),demo:'TR5678X'},
    {k:'tipoVehiculo',l:_L('Tipo'),demo:'Semirremolque'},
    {k:'descargaTipo',l:_L('Descarga'),demo:'Manual'},
    {k:'tipoCarga',l:_M('cargoType'),demo:'Mercancía'},
    {k:'referencia',l:_L('Ref'),demo:'REF-001'},
    {k:'llamador',l:_L('Cal'),demo:'12345'},
    {k:'telefonoCompleto',l:_L('Tel'),demo:'+34 600 123456'},
    {k:'pasaporte',l:_L('Pas'),demo:'12345678Z'},
    {k:'email',l:'Email',demo:'demo@empresa.com'},
    {k:'pais',l:'País',demo:'España'},
    {k:'fechaNacimiento',l:'F. Nacimiento',demo:'01/01/1985'},
    {k:'comentario',l:'Comentario',demo:'Vista previa'},
    {k:'horario',l:'Hora Ingreso',demo:'09:45'},
    {k:'eventoNombre',l:'Evento',demo:'ALIMENTARIA 2026'},
    {k:'pase',l:'Pase/Acceso',demo:'Hall 5'},
    {k:'gpsUrl',l:'GPS/Dirección',demo:'Metal·lúrgia 52'},
    {k:'_qr',l:'QR Tracking',demo:'[QR]',isSpecial:true},
    {k:'_ph1',l:'Frase 1',demo:'Texto frase 1',isSpecial:true},
    {k:'_ph2',l:'Frase 2',demo:'Texto frase 2',isSpecial:true},
  ];
  const AUTO_LAYOUT=[
    {k:'empresa',x:5,y:28,fs:8,line:false},{k:'expositor',x:52,y:28,fs:8,line:false},
    {k:'hall',x:5,y:33,fs:8,line:false},{k:'stand',x:52,y:33,fs:8,line:false},
    {k:'puertaHall',x:5,y:38,fs:8,line:false},{k:'remolque',x:52,y:38,fs:8,line:false},
    {k:'tipoVehiculo',x:5,y:43,fs:8,line:true},{k:'descargaTipo',x:52,y:43,fs:8,line:true},
    {k:'referencia',x:5,y:48,fs:8,line:true},{k:'montador',x:52,y:48,fs:8,line:true},
    {k:'nombreCompleto',x:5,y:53,fs:8,line:false},{k:'telefonoCompleto',x:52,y:53,fs:8,line:false},
    {k:'tipoCarga',x:5,y:58,fs:8,line:true},{k:'llamador',x:52,y:58,fs:8,line:false},
    {k:'email',x:5,y:63,fs:7,line:false},{k:'comentario',x:5,y:67,fs:7,line:true},
  ];

  function getCfg(){return CK==='ag'?DB.printCfgAg:CK==='ing2'?DB.printCfg2:DB.printCfg1;}
  function getFont(){return getCfg().font||'Arial';}
  // Restore labelMode from cfg
  if(getCfg().labelMode!==undefined){_pcLabelMode[CK]=getCfg().labelMode;}

  // Load saved layout from cfg
  let placed=Object.assign({}, getCfg().fieldLayout||{});
  let selKey=null,isDragging=false,chipKey=null,startX=0,startY=0,startL=0,startT=0;
  let pcDragKey=null;

  function gfd(k){if(k==='_qr')return{k:'_qr',l:'QR',demo:'[QR]'};if(k==='_ph1')return{k:'_ph1',l:'F1',demo:'Frase 1'};if(k==='_ph2')return{k:'_ph2',l:'F2',demo:'Frase 2'};return PF_FIELDS.find(x=>x.k===k)||{k,l:k,demo:'—'};}

  function chipHTML(k){
    const f=gfd(k),p=placed[k];
    if(!p)return'';
    const rm='<span class="pfc-rm" data-rm="'+k+'">✕</span>';
    if(p.line)return'<span style="font-weight:700">'+f.l+':</span><span class="pfc-line"></span>'+rm;
    return'<span style="font-weight:700">'+f.l+':</span><span class="pfc-val">'+f.demo+'</span>'+rm;
  }

  function createChip(k,xp,yp,fs,line){
    const f=gfd(k);
    placed[k]={x:parseFloat(xp),y:parseFloat(yp),fs:fs||8,line:!!line};
    const el=document.createElement('div');
    el.className='pfc-'+CK;el.id='pfc-'+CK+'-'+k;
    el.style.left=xp+'%';el.style.top=yp+'%';
    el.style.fontSize=(fs||8)+'px';el.style.fontFamily=getFont()+',Arial,sans-serif';
    el.setAttribute('data-k',k);
    el.innerHTML=chipHTML(k);
    el.addEventListener('mousedown',chipDown);
    document.getElementById('pv-'+CK).appendChild(el);
    renderPalette();saveLayout();
  }

  function refreshChip(k){
    const c=document.getElementById('pfc-'+CK+'-'+k);if(!c)return;
    const p=placed[k];if(!p)return;
    c.innerHTML=chipHTML(k);
    c.style.fontSize=p.fs+'px';
  }

  function renderPalette(){
    const pal=document.getElementById('pc-palette-'+CK);if(!pal)return;
    pal.innerHTML=PF_FIELDS.map(function(f){
      const p=placed[f.k];
      const dotBg=p?'var(--border)':'#3b5bdb';
      const dot='<div style="width:6px;height:6px;border-radius:50%;background:'+dotBg+';flex-shrink:0"></div>';
      const chk=p?'<span style="margin-left:3px;font-size:9px;color:#a5b4fc">✓</span>':'';
      const dragH='<div class="fp-drag-h" draggable="'+(p?'false':'true')+'" ondragstart="window.pcDragKey=\''+f.k+'\';event.dataTransfer.effectAllowed=\'move\'">'+dot+'<span>'+f.l+'</span>'+chk+'</div>';
      const btn=p?('<button style="padding:1px 5px;border-radius:20px;font-size:9px;font-weight:600;cursor:pointer;border:0.5px solid '+(p.line?'#f59e0b':'var(--border)')+';background:'+(p.line?'#f59e0b':'var(--bg3)')+';color:'+(p.line?'#fff':'var(--text3)')+'" onclick="pcToggleLine(''+CK+'',''+f.k+'')">'+  (p.line?'✏':'📋')+'</button>'):'';
      return'<div class="fp-item-'+CK+(p?' fp-done':'')+'" id="fpi-'+CK+'-'+f.k+'">'+dragH+btn+'</div>';
    }).join('');
  }

  function saveLayout(){
    const cfg=getCfg();cfg.fieldLayout=Object.assign({},placed);saveDB();
  }

  window['pcDrop']||(window['pcDrop']=function(e,ck){
    e.preventDefault();
    if(!window.pcDragKey||placed[window.pcDragKey])return;
    const pv=document.getElementById('pv-'+ck).getBoundingClientRect();
    const x=((e.clientX-pv.left)/pv.width*100).toFixed(1);
    const y=((e.clientY-pv.top)/pv.height*100).toFixed(1);
    // Delegate to each cfgKey's createChip via global map
    if(window['pcCreateChip_'+ck])window['pcCreateChip_'+ck](window.pcDragKey,x,y,8,false);
    window.pcDragKey=null;
  });
  window['pcCreateChip_'+CK]=createChip;

  window['pcClickPv']||(window['pcClickPv']=function(e,ck){
    if(!e.target.closest('.pfc-'+ck)){
      document.querySelectorAll('.pfc-'+ck).forEach(c=>c.classList.remove('pfc-sel'));
      if(window['pcSelKey_'+ck])window['pcSelKey_'+ck]=null;
      const si=document.getElementById('pc-selinfo-'+ck);if(si)si.textContent='← selecciona un campo en la ficha';
      const lb=document.getElementById('pc-linebtn-'+ck);if(lb)lb.style.background='';
    }
  });

  window['pcToggleLine']||(window['pcToggleLine']=function(ck,k){
    if(!window['pcPlaced_'+ck]||!window['pcPlaced_'+ck][k])return;
    window['pcPlaced_'+ck][k].line=!window['pcPlaced_'+ck][k].line;
    if(window['pcRefreshChip_'+ck])window['pcRefreshChip_'+ck](k);
    renderPalette();
    const cfg=getCfg();cfg.fieldLayout=Object.assign({},window['pcPlaced_'+ck]);saveDB();
  });

  window['pcAutoPlace']||(window['pcAutoPlace']=function(ck){
    if(window['pcClearAll_'+ck])window['pcClearAll_'+ck]();
  });
  window['pcMake_'+CK]=function(k,x,y,fs,line){make(k,x,y,fs,line);};
  window['pcAutoPlace_'+CK]=function(){
    pcClearAllLocal();
    AUTO_LAYOUT.forEach(i=>createChip(i.k,i.x,i.y,i.fs,i.line));
  };
  window['pcAutoPlace']=(function(orig){return function(ck){if(window['pcAutoPlace_'+ck])window['pcAutoPlace_'+ck]();else if(orig)orig(ck);};})(window['pcAutoPlace']);

  function pcClearAllLocal(){
    Object.keys(placed).forEach(k=>{const c=document.getElementById('pfc-'+CK+'-'+k);if(c)c.remove();});
    placed={};selKey=null;saveLayout();renderPalette();
    // Hide fixed header/footer blocks
    const hdr2=document.getElementById('pc-hdr-'+CK);
    const nfoot2=document.getElementById('pc-nfoot-'+CK);
    const tfoot2=document.getElementById('pc-tfoot-'+CK);
    if(hdr2)hdr2.style.display='none';
    if(nfoot2)nfoot2.style.display='none';
    if(tfoot2)tfoot2.style.display='none';
    const cfg2=CK==='ag'?DB.printCfgAg:CK==='ing2'?DB.printCfg2:DB.printCfg1;
    if(cfg2){cfg2.canvasCleared=true;saveDB();}
  }
  window['pcClearAll']||(window['pcClearAll']=function(ck){if(window['pcClearAll_'+ck])window['pcClearAll_'+ck]();});
  window['pcClearAll_'+CK]=pcClearAllLocal;

  window['pcResizeSel']||(window['pcResizeSel']=function(ck,d){
    const sk=window['pcSelKey_'+ck];const pl=window['pcPlaced_'+ck];
    if(!sk||!pl||!pl[sk])return;
    pl[sk].fs=Math.max(5,Math.min(24,(pl[sk].fs||8)+d));
    const c=document.getElementById('pfc-'+ck+'-'+sk);if(c)c.style.fontSize=pl[sk].fs+'px';
    const cfg=ck==='ag'?DB.printCfgAg:ck==='ing2'?DB.printCfg2:DB.printCfg1;
    cfg.fieldLayout=Object.assign({},pl);saveDB();
    const si=document.getElementById('pc-selinfo-'+ck);
    if(si)si.textContent=(window['pcGetFld_'+ck]?window['pcGetFld_'+ck](sk)?.l||sk:sk)+' · '+pl[sk].fs+'px';
  });
  window['pcGetFld_'+CK]=(k)=>PF_FIELDS.find(x=>x.k===k);

  window['pcToggleLineSel']||(window['pcToggleLineSel']=function(ck){
    const sk=window['pcSelKey_'+ck];if(!sk)return;
    if(window['pcToggleLine'])window['pcToggleLine'](ck,sk);
  });

  // Snap guide logic
  function showSnap(nx,ny,excludeK){
    const anchors_h=[0,25,50,75,100];
    const anchors_v=[0,25,50,75,100];
    let sx=nx,sy=ny,sxSrc='',sySrc='';
    anchors_v.forEach(v=>{if(Math.abs(nx-v)<SNAP_THR){sx=v;sxSrc=v+'%';}});
    anchors_h.forEach(h=>{if(Math.abs(ny-h)<SNAP_THR){sy=h;sySrc=h+'%';}});
    Object.entries(placed).forEach(([k,p])=>{
      if(k===excludeK)return;
      if(Math.abs(p.x-nx)<SNAP_THR){sx=p.x;sxSrc=gfd(k).l;}
      if(Math.abs(p.y-ny)<SNAP_THR){sy=p.y;sySrc=gfd(k).l;}
    });
    const gv=document.getElementById('pc-gv-'+CK);
    const gh=document.getElementById('pc-gh-'+CK);
    if(gv){gv.style.display=sxSrc?'block':'none';if(sxSrc)gv.style.left=sx+'%';}
    if(gh){gh.style.display=sySrc?'block':'none';if(sySrc)gh.style.top=sy+'%';}
    return{x:sx,y:sy};
  }
  function hideSnap(){
    const gv=document.getElementById('pc-gv-'+CK);const gh=document.getElementById('pc-gh-'+CK);
    if(gv)gv.style.display='none';if(gh)gh.style.display='none';
  }

  function chipDown(e){
    if(e.target.getAttribute('data-rm')){
      const k=e.target.getAttribute('data-rm');
      const c=document.getElementById('pfc-'+CK+'-'+k);if(c)c.remove();
      delete placed[k];if(selKey===k)selKey=null;
      renderPalette();saveLayout();return;
    }
    e.preventDefault();e.stopPropagation();
    const k=e.currentTarget.getAttribute('data-k');
    selKey=k;window['pcSelKey_'+CK]=k;
    document.querySelectorAll('.pfc-'+CK).forEach(c=>c.classList.remove('pfc-sel'));
    const chip=document.getElementById('pfc-'+CK+'-'+k);if(chip)chip.classList.add('pfc-sel');
    const si=document.getElementById('pc-selinfo-'+CK);
    if(si)si.textContent=gfd(k).l+' · '+(placed[k]?.fs||8)+'px · '+(placed[k]?.line?'✏ línea':'📋 dato');
    isDragging=true;chipKey=k;
    const pv=document.getElementById('pv-'+CK).getBoundingClientRect();
    startX=e.clientX;startY=e.clientY;startL=placed[k].x;startT=placed[k].y;
  }

  // Expose placed and refresh for external access
  window['pcPlaced_'+CK]=placed;
  window['pcRefreshChip_'+CK]=refreshChip;

  // Mouse move / up for THIS cfgKey's chips
  const pvEl=document.getElementById('pv-'+CK);
  document.addEventListener('mousemove',function pcMM(e){
    if(!isDragging||!chipKey)return;
    const pv=document.getElementById('pv-'+CK);if(!pv)return;
    const r=pv.getBoundingClientRect();
    const dx=(e.clientX-startX)/r.width*100;
    const dy=(e.clientY-startY)/r.height*100;
    let nx=Math.max(0,Math.min(90,startL+dx));
    let ny=Math.max(0,Math.min(96,startT+dy));
    const snapped=showSnap(nx,ny,chipKey);
    nx=snapped.x;ny=snapped.y;
    placed[chipKey].x=nx;placed[chipKey].y=ny;
    const c=document.getElementById('pfc-'+CK+'-'+chipKey);
    if(c){c.style.left=nx+'%';c.style.top=ny+'%';}
  });
  document.addEventListener('mouseup',function pcMU(){
    if(isDragging){hideSnap();saveLayout();}
    isDragging=false;chipKey=null;
  });

  function pcSavePhrase(ck){
    const cfg=ck==='ag'?DB.printCfgAg:ck==='ing2'?DB.printCfg2:DB.printCfg1;
    const el1=document.getElementById('pcph1-'+ck);
    const el2=document.getElementById('pcph2-'+ck);
    const el3n=document.getElementById('pcp3n-'+ck);
    const el3u=document.getElementById('pcp3u-'+ck);
    const uLang=CUR_LANG||'es';
    if(el1){if(!cfg.phrases)cfg.phrases={};const v=el1.value.trim();if(v)cfg.phrases[uLang]=v;else delete cfg.phrases[uLang];}
    if(el2){const v=el2.value.trim();if(v)cfg.phrase2=v;else delete cfg.phrase2;}
    if(el3n&&el3u)cfg.puerta3={nombre:el3n.value.trim(),url:el3u.value.trim()};
    saveDB();
    // Live update canvas phrase preview
    var _uL=CUR_LANG||'es';
    var _ph1el=document.getElementById('pc-ph1-'+ck);
    if(_ph1el){var _v=(cfg.phrases&&cfg.phrases[_uL])||'';_ph1el.textContent=_v;_ph1el.style.display=cfg.ph1On===true&&_v?'block':'none';}
    var _ph2el=document.getElementById('pc-ph2-'+ck);
    if(_ph2el){var _v2=cfg.phrase2||'';_ph2el.textContent=_v2.substring(0,100);_ph2el.style.display=cfg.ph2On!==false&&_v2?'block':'none';}
  }
  window['pcSavePhrase']=pcSavePhrase;

  function pcLoadBG(inp,ck){
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();r.onload=e=>{
      const img=document.getElementById('pcbg-img-'+ck);
      if(img){img.src=e.target.result;img.style.display='block';}
      const _cfg=getCfg();
      _cfg.bgImage=e.target.result;
      _cfg.bgOpacity=_cfg.bgOpacity||0.35;
      saveDB();
    };
    r.readAsDataURL(f);
  }
  window['pcLoadBG']=pcLoadBG;
  // Expose palette render and quick-add for fields toggle
  window['pcRenderPalette_'+CK]=function(){renderPalette();};
  window['pcQuickAddKey_'+CK]=function(fk){
    if(!placed[fk]){
      const AUTO_Y=Object.keys(placed).length;
      const yp=(28+AUTO_Y*6).toFixed(1);
      createChip(fk,5,yp,8,false);
      toast('Campo añadido al canvas','var(--blue)');
    }else toast('Campo ya está en el canvas','var(--text3)');
  };

  // Restore saved layout
  if(getCfg().fieldLayout){
    Object.entries(getCfg().fieldLayout).forEach(([k,p])=>{
      if(p&&typeof p.x==='number')createChip(k,p.x,p.y,p.fs,p.line);
    });
  }

  // Update event label
  const ev=getActiveEvent();
  const evLbl=document.getElementById('pc-ev-lbl-'+CK);
  if(evLbl&&ev)evLbl.textContent=ev.nombre||'';

  renderPalette();
  })();
  </div>`;
}
function setPaperSize(cfgKey,size){
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  cfg.paperSize=size;saveDB();
  if(cfgKey==='ing2'){iF._sub2='print';renderIngresos2();}
  else if(cfgKey==='ag'){window._impSub='ag';renderImpresion();}
  else{window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
  toast('📄 Papel '+size,'var(--blue)');
}
function setPrintCfgFont(cfgKey,font){
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  cfg.font=font;saveDB();
  if(cfgKey==='ag'){goTab('impresion',null);window._impSub='ag';renderImpresion();}
  else if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
}
function savePuerta3(cfgKey){
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  cfg.puerta3={
    nombre:(document.getElementById('tabPuerta3Nom_'+cfgKey)?.value||'').trim(),
    url:(document.getElementById('tabPuerta3Url_'+cfgKey)?.value||'').trim()
  };
  saveDB();
  if(cfgKey==='ag'){goTab('impresion',null);window._impSub='ag';renderImpresion();}
  else if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
  toast('🚪 QR de puerta guardado','var(--green)');
}
function setPrintCfgMode(cfgKey,mode){
  if(!DB.printCfgModes)DB.printCfgModes={};
  DB.printCfgModes[cfgKey]=mode;
  saveDB();
  if(cfgKey==='ag'){goTab('impresion',null);window._impSub='ag';renderImpresion();}
  else if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
}
function setPrintCfgSize(cfgKey,size){
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  cfg.paperSize=size;saveDB();
  if(cfgKey==='ag'){goTab('impresion',null);window._impSub='ag';renderImpresion();}
  else if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
}
function saveTabPhrases(cfgKey){
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  const uLang=CUR_LANG||'es';
  const el1=document.getElementById('tabPhrase1_'+cfgKey);
  if(el1){
    const ph1=el1.value.trim();
    if(!cfg.phrases)cfg.phrases={};
    if(ph1)cfg.phrases[uLang]=ph1;else delete cfg.phrases[uLang];
  }
  const el2=document.getElementById('tabPhrase2_'+cfgKey);
  if(el2){
    const ph2=el2.value.trim();
    if(ph2)cfg.phrase2=ph2;else delete cfg.phrase2;
  }
  // Only save and toast if elements were actually in the DOM
  if(el1||el2){saveDB();if(el1&&el2)toast('💾 Frases guardadas','var(--green)');}
}
function printPreviewWithCfg(cfgKey){
  // Sync active template into cfg before preview (if one is "En vivo")
  if(cfgKey!=='ag'){
    const _activeName=(DB.printCfgModes||{})[cfgKey+'_activeTpl'];
    if(_activeName){
      const _tpl=(DB.printTemplates||[]).find(t=>t.name===_activeName);
      if(_tpl){
        const _cfg2=cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
        if(_tpl.fieldOrder)_cfg2.fieldOrder=[..._tpl.fieldOrder];
        if(_tpl.hiddenFields)_cfg2.hiddenFields=[..._tpl.hiddenFields];
        if(_tpl.paperSize)_cfg2.paperSize=_tpl.paperSize;
        if(_tpl.phrases)_cfg2.phrases={..._tpl.phrases};
        if(_tpl.font)_cfg2.font=_tpl.font;
        if(_tpl.puerta3)_cfg2.puerta3={..._tpl.puerta3};
        if(_tpl.phrase2!==undefined)_cfg2.phrase2=_tpl.phrase2;
        if(_tpl.qrTracking!==undefined)_cfg2.qrTracking=_tpl.qrTracking;
        if(_tpl.fieldLayout)_cfg2.fieldLayout={..._tpl.fieldLayout};else delete _cfg2.fieldLayout;
        _cfg2.canvasCleared=_tpl.canvasCleared||false;
        if(_tpl.mode)DB.printCfgModes[cfgKey]=_tpl.mode;
        _cfg2.ph1On=_tpl.ph1On===true;
        _cfg2.ph2On=_tpl.ph2On!==false;
        _cfg2.ph3On=_tpl.ph3On===true;
      }
    }
  }
  initPrintLayout(cfgKey);
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  const mode=(DB.printCfgModes||{})[cfgKey]||'normal';
  const size=cfg.paperSize||'A4';
  // If canvas was explicitly cleared AND has no fields placed, show blank preview
  const hasLayout=cfg.fieldLayout&&Object.keys(cfg.fieldLayout).length>0;
  if(cfg.canvasCleared&&!hasLayout){
    const w=window.open('','_blank','width=900,height=700');
    if(w){
      const pW=size==='A3'?'297mm':size==='A5'?'148mm':'210mm';
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Vista previa — vacía</title><script>document.addEventListener('keydown',function(e){if(e.key==='Escape')window.close();});<\/script>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px}
.page{width:${pW};min-height:285mm;background:#fff;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
.msg{font-size:15px;font-weight:700;color:#64748b}.sub{font-size:12px;color:#94a3b8}
.btn{cursor:pointer;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:700;background:#111;color:#fff}
</style></head><body>
<div class="page">
  <div style="font-size:48px">📋</div>
  <div class="msg">Canvas vacío — sin campos configurados</div>
  <div class="sub">Añade campos desde el panel izquierdo y vuelve a hacer Vista previa</div>
</div>
<button class="btn" onclick="window.close()">✕ Cerrar</button>
</body></html>`);
      w.document.close();
    }else toast('⚠ Activa ventanas emergentes','var(--amber)');
    return;
  }
  const isLib=cfgKey==='ing2';
  const _isAgPreview=cfgKey==='ag';
  const favId=cfg.favEventId||null;
  const ev=favId?DB.eventos.find(e=>e.id===favId):getActiveEvent();
  const tabPhrases=cfg.phrases||{};
  const uLang=CUR_LANG||'es';
  // Use last real ingreso if available, else demo data
  const _srcArr=cfgKey==='ing2'?(DB.ingresos2||[]):cfgKey==='ag'?DB.agenda:[...DB.ingresos];
  const _lastReal=_srcArr.length?_srcArr[_srcArr.length-1]:null;
  const _demoData={id:'preview-'+Date.now(),pos:'3',matricula:'AB1234CD',remolque:'TR5678X',nombre:'Jean',apellido:'Dupont',empresa:'Empresa Demo S.L.',hall:'5',halls:['5','3A'],stand:'B-200',puertaHall:'P3',llamador:'12345',referencia:'REF-001',montador:'MontajeXL',expositor:'ExpoDemo',telefono:'600123456',telPais:'+34',email:'demo@empresa.com',pasaporte:'12345678Z',pais:'España',lang:uLang,fechaNacimiento:'1985-03-15',tipoVehiculo:'semiremolque',descargaTipo:'mano',tipoCarga:'GOODS',entrada:nowL(),eventoNombre:ev?.nombre||'Demo Evento',eventoId:ev?.id,comentario:'Vista previa con datos reales'};
  const fake=_lastReal?Object.assign({},_lastReal,{_tabPhrases:tabPhrases,_phrase2:cfg.phrase2||'',_font:cfg.font||'Arial',_puerta3:cfg.puerta3||{},_isAg:cfgKey==='ag',_isLib:cfgKey==='ing2'||cfgKey==='ag',lang:_lastReal.lang||uLang}):Object.assign(_demoData,{_tabPhrases:tabPhrases,_phrase2:cfg.phrase2||'',_font:cfg.font||'Arial',_puerta3:cfg.puerta3||{},_isAg:cfgKey==='ag',_isLib:cfgKey==='ing2'||cfgKey==='ag'});
  if(_lastReal)toast('👁 Vista previa con último '+(_lastReal.matricula||'ingreso'),'var(--blue)');
  window._printSizeOverride=size;
  if(mode==='troquel'){const o=Object.assign({},fake);o._isLib=isLib||_isAgPreview;printIngresoTroquelado(o);}
  else printIngresoFromObj(fake,isLib||_isAgPreview);
  setTimeout(()=>{window._printSizeOverride=null;},500);
}
function savePrintTemplateFromCfg(cfgKey){
  const nameEl=document.getElementById('pctpl-name-'+cfgKey);
  const name=(nameEl?.value||'').trim();
  if(!name){toast('Escribe un nombre para la plantilla','var(--amber)');nameEl?.focus();return;}
  const cfg=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  const mode=(DB.printCfgModes||{})[cfgKey]||'normal';
  if(!DB.printTemplates)DB.printTemplates=[];
  const existing=DB.printTemplates.findIndex(t=>t.name===name);
  const tpl={name,mode,paperSize:cfg.paperSize||'A4',font:cfg.font||'Arial',cfgKey,
    fieldOrder:[...(cfg.fieldOrder||PRINT_DEF)],
    hiddenFields:[...(cfg.hiddenFields||[])],
    phrases:{...(cfg.phrases||{})},
    phrase2:cfg.phrase2||'',
    puerta3:{...(cfg.puerta3||{})},
    favEventId:cfg.favEventId||null,
    qrTracking:cfg.qrTracking!==false,
    fieldLayout:cfg.fieldLayout?{...cfg.fieldLayout}:null,
    canvasCleared:cfg.canvasCleared||false,
    bgImage:cfg.bgImage||'',
    bgOpacity:cfg.bgOpacity||0.35,
    ph1On:cfg.ph1On===true,
    ph2On:cfg.ph2On!==false,
    ph3On:cfg.ph3On===true,
    labelMode:cfg.labelMode||0};
  if(existing>=0)DB.printTemplates[existing]=tpl;else DB.printTemplates.push(tpl);
  // Mark this template as the active one "En vivo"
  if(!DB.printCfgModes)DB.printCfgModes={};
  DB.printCfgModes[cfgKey+'_activeTpl']=name;
  saveDB();
  if(nameEl)nameEl.value='';
  if(cfgKey==='ag'){goTab('impresion',null);window._impSub='ag';renderImpresion();}
  else if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
  toast('💾 Plantilla "'+name+'" guardada','var(--green)');
}
function cfgHideAll(cfgKey){const c2=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;c2.hiddenFields=[...PRINT_DEF];saveDB();initPrintLayout(cfgKey);}
function toggleQR(cfgKey){const c2=cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;c2.qrTracking=!(c2.qrTracking!==false);saveDB();if(cfgKey==='ing2'){iF._sub2='print';renderIngresos2();}else{iF._sub='print';renderIngresos();}setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);if(c2.qrTracking&&window['pcMake_'+cfgKey]){const _pl=window['pcPlaced_'+cfgKey]||{};if(!_pl['_qr'])window['pcMake_'+cfgKey]('_qr',75,3,20,false);}},200);toast(c2.qrTracking?'📱 QR añadido al canvas — arrastralo':'📱 QR desactivado','var(--blue)');}
function cfgShowAll(cfgKey){const c2=cfgKey==='ag'?DB.printCfgAg:cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;c2.hiddenFields=[];saveDB();initPrintLayout(cfgKey);}
function savePrintTemplate(cfgKey){
  // legacy — redirect to new flow
  savePrintTemplateFromCfg(cfgKey);
}
function _ingEventos(tab){
  if(!isSup())return'<div class="empty"><div class="et">Sin permiso</div></div>';
  const isTab2=tab==='ing2';
  const cfg=isTab2?DB.printCfg2:DB.printCfg1;
  const favId=cfg.favEventId||null;
  const items=DB.eventos||[];const actIds=DB.activeEventId?[DB.activeEventId]:[];
  const renderFn=isTab2?'renderIngresos2':'renderIngresos';
  return`
  <!-- Evento favorito de esta pestaña -->
  <div style="background:var(--bll);border:1.5px solid #bfdbfe;border-radius:var(--r2);padding:10px 14px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:900;color:var(--blue);text-transform:uppercase;margin-bottom:6px">⭐ Condiciones de impresión</div>
    <div style="display:flex;gap:3px;margin-bottom:6px">
      <button class="btn btn-sm ${!isTab2?'btn-p':'btn-gh'}" onclick="renderPrintCfg('ing1')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>Referencia</button>
      <button class="btn btn-sm ${isTab2?'btn-p':'btn-gh'}" onclick="renderPrintCfg('ing2')"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3"/></svg>Ingresos</button>
      <span style="flex:1"></span>
      <button class="btn btn-sm btn-gh" id="btnPreviewNormal_${isTab2?'ing2':'ing1'}" onclick="printPreviewWithCfg('${isTab2?'ing2':'ing1'}')">👁 Vista previa</button>
      <button class="btn btn-sm" id="btnPreviewTrq_${isTab2?'ing2':'ing1'}" style="background:#7c3aed;color:#fff;border:none;border-radius:20px" onclick="(function(k){if(!DB.printCfgModes)DB.printCfgModes={};DB.printCfgModes[k]='troquel';printPreviewWithCfg(k);})('${isTab2?'ing2':'ing1'}')">✂ Vista troquelado</button>
      <button class="btn btn-sm btn-gh" onclick="savePrintTemplateFromCfg('${isTab2?'ing2':'ing1'}')">💾 Guardar plantilla</button>
    </div>
    <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px">
      <select style="flex:1;min-width:180px;max-width:280px" onchange="setFavEvento('${tab||'ing1'}',this.value)">
        <option value="">— Sin evento favorito —</option>
        ${items.map(ev=>`<option value="${ev.id}" ${favId===ev.id?'selected':''}>${ev.ico||'📋'} ${ev.nombre}</option>`).join('')}
      </select>
      ${favId?`<span class="pill pill-b">⭐ ${(DB.eventos.find(e=>e.id===favId)||{}).nombre||'–'}</span>`:''}
    </div>
    ${favId?`
    <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📋 Campos a imprimir — activa/desactiva individualmente:</div>
    <div id="${isTab2?'printChips2':'printChips1'}" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px">
      ${PRINT_DEF.map(f=>{const hidden=(cfg.hiddenFields||[]).includes(f);return`<span onclick="togglePF('${f}','${isTab2?'ing2':'ing1'}')" style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:12px;border:1px solid ${hidden?'var(--border)':'var(--blue)'};background:${hidden?'var(--bg2)':'var(--blue)'};color:${hidden?'var(--text4)':'#fff'};font-size:10px;font-weight:700;cursor:pointer;user-select:none;transition:all .15s;opacity:${hidden?'.45':'1'}">${hidden?'✕':'✓'} ${PRINT_LABELS[f]||f}</span>`;}).join('')}
    </div>
    <div style="font-size:10px;color:var(--text3);margin-bottom:6px">Arrastra para reordenar. Los cambios son independientes entre Referencia e Ingresos.</div>
    <div id="${isTab2?'printLayoutGrid2':'printLayoutGrid'}" class="plg"></div>
    ${(DB.printTemplates||[]).length?`<div style="margin-top:10px;padding:8px 10px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border)"><div style="font-size:10px;font-weight:900;color:var(--text3);text-transform:uppercase;margin-bottom:6px">💾 Plantillas guardadas</div><div style="display:flex;flex-wrap:wrap;gap:5px">${(DB.printTemplates||[]).map(t=>`<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bll);border:1px solid #bfdbfe;border-radius:12px;padding:2px 9px;font-size:11px;font-weight:700;color:var(--blue);cursor:pointer" onclick="loadPrintTemplate('${t.name}','${isTab2?'ing2':'ing1'}')">📋 ${t.name}</span>`).join('')}</div></div>`:''}
    `:'<div style="font-size:11px;color:var(--text3)">Selecciona un evento favorito para configurar los campos de impresión.</div>'}
  </div>
  <div style="margin-bottom:4px;display:flex;gap:6px;flex-wrap:wrap">
    ${isSA()?`<button class="btn btn-p btn-sm" onclick="openEventoModal()">+ Nuevo evento</button>`:''}
    ${isSA()?`<button class="btn btn-gh btn-sm" onclick="exportEventos()">⬇ Eventos Excel</button>`:''}
    ${isSA()?`<button class="btn btn-s btn-sm" onclick="exportAll()">📦 Backup completo</button>`:''}
    ${actIds.length&&isSA()?`<button class="btn btn-warning btn-sm" onclick="if(confirm(_M('deactivate')+'?')){DB.activeEventId=null;saveDB();${renderFn}();renderHdr();}">⏹ Desactivar evento</button>`:''}
  </div>
  ${actIds.length?`<div style="background:var(--gll);border:1.5px solid #bbf7d0;border-radius:var(--r2);padding:8px 12px;margin-bottom:4px;font-size:12px"><b>✅ Eventos activos:</b> ${actIds.map(id=>{const ev=DB.eventos.find(x=>x.id===id);return ev?`<span class="ev-pill" style="margin-left:4px">${ev.ico||'📋'} ${ev.nombre}${DB.defaultEventId===id?' ⭐':''}</span>`:''}).join('')}</div>`:''}
  ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>${_M('events')}</th><th>Fechas</th><th>"+_M("venues")+"</th><th>Estado</th><th>Puertas</th><th>Acc.</th></tr></thead><tbody>
    ${items.map(ev=>{const isActive=actIds.includes(ev.id);const isDefault=DB.defaultEventId===ev.id;const isFav=favId===ev.id;return`<tr style="${isActive?'background:var(--gll)':isFav?'background:var(--bll)':''}">
      <td>${ev.ico||'📋'} <b>${ev.nombre}</b>${isFav?' <span style="font-size:10px;color:var(--blue)">⭐FAV</span>':''}</td>
      <td style="font-size:11px">${ev.ini||'–'} → ${ev.fin||'–'}</td>
      <td style="font-size:11px">${ev.recinto||'–'} ${ev.ciudad?'· '+ev.ciudad:''}</td>
      <td>${isActive?`<span class="pill pill-g"><span class="live"></span> ACTIVO${isDefault?' ⭐ DEF':''}</span>`:'<span style="font-size:11px;color:var(--text3)">Inactivo</span>'}</td>
      <td style="font-size:10px">${(ev.puertas||[]).map(p=>`<span style="background:var(--bg3);padding:1px 5px;border-radius:3px;margin:1px;display:inline-block">🚪${p.nombre}${p.qr?` <a href="${p.qr}" target="_blank" style="font-size:9px">🔗</a>`:''}</span>`).join('')||'–'}</td>
      <td><div style="display:flex;gap:2px;flex-wrap:wrap">
        ${!isActive&&canActivarEvento()?`<button class="btn btn-success btn-xs" onclick="activarEvento('${ev.id}')">▶ Activar</button>`:isActive&&isSA()?`<button class="btn btn-danger btn-xs" onclick="desactivarEvento('${ev.id}')">⏹ Desactivar</button>`:''}
        ${isActive&&!isDefault?`<button class="btn btn-warning btn-xs" onclick="setDefaultEvento('${ev.id}')" title="Predefinido global">⭐</button>`:''}
        ${canEditEvento()?`<button class="btn btn-edit btn-xs" onclick="openEventoModal(DB.eventos.find(x=>x.id==='${ev.id}'))">✏️</button>`:''}
        ${isSA()?`<button class="btn btn-danger btn-xs" onclick="askDelEvento('${ev.id}')">🗑</button>`:''}
      </div></td>
    </tr>`;}).join('')}
  </tbody></table></div>`:`<div class="empty"><div class="ei">📋</div><div class="et">Sin eventos configurados</div></div>`}
  ${isSA()&&(DB.eventoHistorial||[]).length?`<div style="margin-top:18px"><div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:6px">📋 Historial de cambios en eventos</div><div class="tbl-wrap"><table class="dtbl"><thead><tr><th>${_M('events')}</th><th>Modificado por</th><th>Fecha</th><th></th></tr></thead><tbody>${(DB.eventoHistorial||[]).map((ev,i)=>`<tr><td><b>${ev.nombre}</b></td><td>${ev._editedBy||'?'}</td><td style="font-size:11px">${ev._editedTs||''}</td><td><button class="btn btn-xs btn-gh" onclick="restoreEventoVersion(${i})">↩ Restaurar</button></td></tr>`).join('')}</tbody></table></div></div>`:''}
  ${isSA()&&(DB.eventosPapelera||[]).length?`<div style="margin-top:12px"><div style="font-size:11px;font-weight:700;color:var(--red);text-transform:uppercase;margin-bottom:6px">🗑 Eventos eliminados</div><div class="tbl-wrap"><table class="dtbl"><thead><tr><th>${_M('events')}</th><th>Eliminado por</th><th>Fecha</th><th></th></tr></thead><tbody>${(DB.eventosPapelera||[]).map((ev,i)=>`<tr><td><b>${ev.nombre}</b></td><td>${ev._deletedBy||'?'}</td><td style="font-size:11px">${ev._deletedTs||''}</td><td><button class="btn btn-xs btn-p" onclick="restoreEventoDeleted(${i})">↩ Restaurar</button></td></tr>`).join('')}</tbody></table></div></div>`:''}
`;}
// setFavEvento — asigna evento favorito a una tab
function setFavEvento(cfgKey,evId){
  const cfg=cfgKey==='ing2'?DB.printCfg2:DB.printCfg1;
  cfg.favEventId=evId||null;saveDB();
  if(cfgKey==='ing2'){goTab('impresion',null);window._impSub='ing2';renderImpresion();}
  else{goTab('impresion',null);window._impSub='ing1';renderImpresion();}
  setTimeout(()=>{initPrintLayout(cfgKey);initPcCanvas(cfgKey);});
  toast('⭐ Evento favorito actualizado','var(--blue)');
}

// ═══ RENDER INGRESOS SIN REFERENCIA ═══





















// setFavEvento — asigna evento favorito a una tab


// ═══ RENDER INGRESOS SIN REFERENCIA ═══

// ─── INGRESOS2 ────────────────────────────────────────────────────────
function renderIngresos2(){
  const today=new Date().toISOString().slice(0,10);
  let items=[...DB.ingresos2||[]];
  const aEvIds=(DB.activeEventIds&&DB.activeEventIds.length)?DB.activeEventIds:(DB.activeEventId?[DB.activeEventId]:[]);
  if(aEvIds.length)items=items.filter(i=>!i.eventoId||aEvIds.includes(i.eventoId));
  const q=(iF.q2||'').toLowerCase();
  if(q)items=items.filter(i=>`${i.pos||''} ${i.matricula} ${i.nombre||''} ${i.apellido||''} ${i.empresa||''} ${i.llamador||''} ${i.referencia||''} ${(i.halls||[i.hall||'']).join(' ')} ${i.stand||''} ${i.remolque||''} ${i.montador||''} ${i.expositor||''} ${i.comentario||''} ${i.telefono||''} ${i.email||''} ${i.pasaporte||''} ${i.eventoNombre||''} ${i.puertaHall||''} ${i.tipoCarga||''}`.toLowerCase().includes(q));
  if(iF.hall2)items=items.filter(i=>(i.halls||[i.hall||'']).includes(iF.hall2));
  if(iF.activos2)items=items.filter(i=>!i.salida);
  const s=getSort('ingresos2');items=sortArr(items,s.col||'pos',s.dir||'desc');
  const ev=getActiveEvent();
  const sub2=iF._sub2||'lista';
  document.getElementById('tabContent').innerHTML=`
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      ${[['lista','📋 '+_M('list')],['listanegra','⭐ '+_M('special')],['historial','📝 '+_M('modifications')],...(canCampos()?[['campos','⚙ '+_M('fields')]]:[])] .map(([s,l])=>`<button class="btn btn-sm ${sub2===s?'btn-p':'btn-gh'}" onclick="iF['_sub2']='${s}';renderIngresos2()" style="flex-shrink:0">${l}</button>`).join('')}
      <span style="flex:1;min-width:8px"></span>
      ${canAdd()&&sub2!=='campos'?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="_ingSource='ingresos2';openIngModal()">+ Ingreso</button><button class="btn btn-sm btn-gh af-toggle-btn" onclick="toggleAutoFill()" style="flex-shrink:0;border-radius:20px">⚡ ${_autoFillOn?tr('on')||'ON':tr('off')||'OFF'}</button><button class="btn btn-sm btn-gh pos-toggle-btn" onclick="togglePosAuto()" style="flex-shrink:0;border-radius:20px">🔢 ${_posAutoOn?tr('on')||'ON':tr('off')||'OFF'}</button>`:''}
      ${sub2!=='historial'&&sub2!=='campos'?`<button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="if(!canImport()){toast(_M('noPermImport'),'var(--red)');return;}document.getElementById('xlsxIng2').click()">📥 Importar</button><button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="dlTemplateIng2()">📋 Plantilla</button>`:''}
      ${sub2!=='historial'&&sub2!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="exportIngresos2()">⬇ Excel</button>`:''}
      ${sub2!=='historial'&&sub2!=='campos'&&canClean()?`<button class="btn btn-sm" style="flex-shrink:0" onclick="cleanTab('ingresos2')">🗑 Limpiar</button>`:''}${sub2!=='historial'&&sub2!=='campos'&&isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('ingresos2')">💥 Vaciar</button>`:''}
    </div>
    ${sub2!=='historial'&&sub2!=='print'&&sub2!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, nombre..." value="${iF.q2||''}" id="srch-ingresos2" oninput="iF.q2=this.value;debounceSearch('ingresos2',renderIngresos2)"></div>
      <input type="date" value="${iF.fecha2||''}" oninput="iF.fecha2=this.value;debounceSearch('ingresos2-date',renderIngresos2)" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px">
      <span class="pill" style="border:1.5px solid ${iF.activos2?'var(--blue)':'var(--border)'};background:${iF.activos2?'var(--blue)':'var(--bg2)'};color:${iF.activos2?'#fff':'var(--text3)'}" onclick="iF.activos2=!iF.activos2;renderIngresos2()">${_M('activeOnly')}</span>
      ${iF.q2||iF.fecha2||iF.hall2||iF.activos2?`<span class="pill pill-r" onclick="iF.q2='';iF.fecha2='';iF.hall2='';iF.activos2=false;renderIngresos2()">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3)">${items.length} reg.</span>
    </div>
    ${sub2!=='campos'?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!iF.hall2?'#7dd3fc':'#93c5fd'};background:${!iF.hall2?'#e0f2fe':'#dbeafe'};color:${!iF.hall2?'#0369a1':'#1e40af'};cursor:pointer" onclick="iF.hall2='';renderIngresos2()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${iF.hall2===h?'var(--blue)':'var(--border)'};background:${iF.hall2===h?'var(--blue)':'var(--bg2)'};color:${iF.hall2===h?'#fff':'var(--text3)'};cursor:pointer" onclick="iF.hall2='${h}';renderIngresos2()">${h}</span>`).join('')}
    </div>`:''}`:''}
    ${sub2==='lista'?`
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>
      ${thSort('ingresos2','pos','#')}${thSort('ingresos2','matricula',_M('plate'))}${thSort('ingresos2','llamador',_M('caller'))}${thSort('ingresos2','referencia',_M('ref'))}${thSort('ingresos2','nombre',_M('name')+'/'+_M('company'))}${thSort('ingresos2','telefono',_M('phone'))}<th>${_L('Hal')}</th><th>${_L('Std')}</th><th style="font-size:10px">Evento</th>${thSort('ingresos2','salida',_M('status'))}${thSort('ingresos2','entrada',_M('entry'))}<th>Acc.</th>
    </tr></thead><tbody>
      ${items.map(i=>`<tr>
        <td style="font-weight:700;color:var(--text3)">${i.pos||''}</td>
        <td><span class="mchip" style="cursor:pointer" onclick="showIngDetalle('${i.id}','ingresos2')">${i.matricula}</span>${i.remolque?`<br><span class="mchip-sm">${i.remolque}</span>`:''}</td>
        <td style="font-size:11px">${i.llamador||'–'}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${i.referencia||'–'}</td>
        <td><b style="font-size:12px">${i.nombre||''} ${i.apellido||''}</b>${i.empresa?`<br><span style="font-size:11px;color:var(--text3)">${i.empresa}</span>`:''}</td>
        <td>${telLink(i.telPais||'',i.telefono||'')}</td>
        <td>${(i.halls||[i.hall||'']).filter(Boolean).map(h=>hBadge(h)).join(' ')||'–'}</td>
        <td style="font-size:11px">${i.stand||'–'}</td>
        <td style="font-size:9px;color:var(--text3);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.eventoNombre||''}">${i.eventoNombre?i.eventoNombre.slice(0,12):'–'}</td>
        <td>${!i.salida?'<span class="pill pill-g">✓ '+_M('onPremises')+'</span>':`<span style="font-size:10px;color:var(--text3)">↩ ${fmt(i.salida,'t')}</span>`}</td>
        <td style="font-size:11px;white-space:nowrap">${fmt(i.entrada)}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          <button class="btn btn-gh btn-xs" onclick="printIngreso2('${i.id}')" title="Imprimir Normal">🖨</button>
          <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border-radius:20px" title="Imprimir Troquelado A4" onclick="printTrqIng('${i.id}')">✂</button>
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openIngModal2(DB.ingresos2.find(x=>x.id==='${i.id}'))">✏️</button>`:''}
          ${!i.salida&&canStatus()?`<button class="btn btn-warning btn-xs" onclick="marcarSalidaIng2('${i.id}')">↩ Salida</button><button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="registrarPasoTracking('${i.id}','ingresos2')">📡</button>`:''}
          ${i.salida&&canStatus()?`<button class="btn btn-success btn-xs" onclick="reactivarIngreso2('${i.id}')" title="Reactivar">↺</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelIng2('${i.id}')">🗑</button>`:''}
        </div></td>
      </tr>`).join('')}
    </tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">' + _M('noEntriesReg') + '</div></div>`}`:''}
    ${sub2!=='lista'?(sub2==='listanegra'?_ingLN():sub2==='historial'?_ingHistorial('ingresos2'):sub2==='campos'?renderCamposSubtab('ingresos2'):sub2==='print'?_ingPrintCfg('ing2'):_ingPrintCfg('ing2')):''}`;  if(sub2==='print'){iF._sub2='lista';goTab('impresion',null);window._impSub='ing2';renderImpresion();return;}
}
// Alias rápido para ingresos2
function openIngModal2(i){_ingSource='ingresos2';openIngModal(i);}
function printIngreso2(id){
  const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i){toast('No encontrado','var(--red)');return;}
  saveTabPhrases('ing2');
  _printWithActiveTpl('ing2',i,true,'ing2','normal');
}
function marcarSalidaIng2(id){const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;i.salida=nowL();saveDBNow();renderIngresos2();renderHdr();}
function reactivarIngreso2(id){const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;i.salida=null;saveDBNow();renderIngresos2();renderHdr();toast('↺ Salida anulada','var(--amber)');}
function askDelIng2(id){const i=(DB.ingresos2||[]).find(x=>x.id===id);if(!i)return;askDel('Eliminar ingreso libre','<b>'+i.matricula+'</b>',()=>{softDelete('ingresos2',id,renderIngresos2);});}
function showIngDetalle(id,source){
  const col=source||'ingresos';
  const i=(DB[col]||[]).find(x=>x.id===id);if(!i){showIngDetalleBase(id);return;}
  document.getElementById('mIngDetailTitle').textContent='🚛 '+i.matricula+(i.pos?' · Pos.'+i.pos:'')+(source==='ingresos2'?' [Ingresos libre]':'');
  document.getElementById('mIngDetailPrint').onclick=()=>{const _ck=source==='ingresos2'?'ing2':'ing1';_printWithActiveTpl(_ck,i,source==='ingresos2',_ck,'normal');};
  const trqBtn=document.getElementById('mIngDetailPrintTrq');if(trqBtn)trqBtn.onclick=()=>{const cfgK=source==='ingresos2'?'ing2':'ing1';const mode=(DB.printCfgModes||{})[cfgK]||'normal';if(mode==='normal')printIngresoFromObj(i,source==='ingresos2');else{const _o=Object.assign({},i);_o._isLib=source==='ingresos2';printIngresoTroquelado(_o);}};
  document.getElementById('mIngDetailEdit').onclick=()=>{closeOv('mIngDetail');if(source==='ingresos2')openIngModal2(i);else openIngModal(i);};
  document.getElementById('mIngDetailPrint').style.display='';
  document.getElementById('mIngDetailEdit').style.display='';
  const halls=i.halls||[i.hall||''];
  document.getElementById('mIngDetailBody').innerHTML=`
    <div class="sg sg3" style="margin-bottom:6px">
      <div class="stat-box" style="border-top:3px solid var(--text)"><div class="stat-n" style="font-size:36px">${i.pos||'–'}</div><div class="stat-l">Posición</div></div>
      <div class="stat-box" style="border-top:3px solid var(--blue);grid-column:span 2"><div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:900;color:var(--blue)">${i.matricula}</div>${i.remolque?`<div style="font-size:11px;color:var(--text3);margin-top:3px">Remolque: <b>${i.remolque}</b></div>`:''}<div class="stat-l" style="margin-top:3px">${halls.map(h=>hBadge(h)).join(' ')}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
      ${[['👤 Nombre',i.nombre+' '+i.apellido],['🏢 Empresa',i.empresa],['📞 Teléfono',(i.telPais||'')+' '+(i.telefono||'')],['📍 Stand',i.stand],['📞 Llamador',i.llamador],['🔖 Referencia',i.referencia],['🔧 Montador',i.montador],['🎪 Expositor',i.expositor],['🚚 Remolque',i.remolque],['🪪 Pasaporte/DNI',i.pasaporte],['✉️ Email',i.email],['📅 Evento',i.eventoNombre],['🕐 Entrada',fmt(i.entrada)],['↩ Salida',i.salida?fmt(i.salida):''+_M('onPremises')+''],['👤 Creado por',i.creadoPor]].map(([l,v])=>v&&v.trim&&v.trim()?`<div style="padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">${l}</div><div style="font-weight:600">${v}</div></div>`:'').join('')}
      ${i.comentario?`<div style="grid-column:1/-1;padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">📝 Comentario</div><div>${i.comentario}</div></div>`:''}
    </div>
    ${!i.salida?'<div style="margin-top:10px;background:var(--gll);border:1.5px solid #bbf7d0;border-radius:var(--r);padding:8px 12px;font-weight:700;color:var(--green);font-size:13px">✓ '+_M('onPremises')+'</div>':'<div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:8px 12px;font-size:12px;color:var(--text3)">↩ Salida: '+fmt(i.salida)+'</div>'}`;
  document.getElementById('mIngDetail').classList.add('open');
}
function showIngDetalleBase(id){
  // fallback: buscar en ambas colecciones
  const i=DB.ingresos.find(x=>x.id===id)||(DB.ingresos2||[]).find(x=>x.id===id);
  if(!i)return;
  const src=DB.ingresos.find(x=>x.id===id)?undefined:'ingresos2';
  showIngDetalle(id,src);
}
let _ingSource='ingresos';
function exportIngresos2(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;};if(!(DB.ingresos2||[]).length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();const fn='ingresos_libre_'+new Date().toISOString().slice(0,10)+'.xlsx';XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet((DB.ingresos2||[]).map(i=>({Pos:i.pos||'',Matricula:i.matricula,Nombre:i.nombre||'',Apellido:i.apellido||'',Empresa:i.empresa||'',Hall:(i.halls||[i.hall||'']).join('/')+'',Stand:i.stand||'',Remolque:i.remolque||'',Telefono:i.telefono||'',Comentario:i.comentario||'',Entrada:fmt(i.entrada),Salida:i.salida?fmt(i.salida):''+_M('onPremises')+''}))),'Ingresos');XLSX.writeFile(wb,fn);logExport('Ingresos-SinRef',fn);toast(_M('saved'));}

// ═══ RENDER MATRÍCULAS ═══


function renderFlota(){
  const now=new Date();let items=[...DB.movimientos];
  const q=(fF.q||'').toLowerCase();if(q)items=items.filter(m=>`${m.matricula} ${m.nombre||''} ${m.empresa||''} ${m.hall||''} ${m.remolque||''} ${m.status||''}`.toLowerCase().includes(q));
  if(fF.status)items=items.filter(m=>m.status===fF.status);if(fF.hall)items=items.filter(m=>m.hall===fF.hall);
  const sf=getSort('flota');items=sf.col?sortArr(items,sf.col,sf.dir):items.sort((a,b)=>(a.posicion||999)-(b.posicion||999));
  document.getElementById('tabContent').innerHTML=`
    
    <div class="sg sg4" style="margin-bottom:4px">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<div class="stat-box" style="border-top:3px solid ${SCFG[s]?.c||'var(--border)'}"><div class="stat-n" style="color:${SCFG[s]?.c||'var(--text)'}">${DB.movimientos.filter(m=>m.status===s).length}</div><div class="stat-l">${SCFG[s]?.i||''} ${s}</div></div>`).join('')}</div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:2;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa, conductor..." value="${fF.q||''}" oninput="fF.q=this.value;debounceSearch('flota',renderFlota)"></div>
      ${fF.q||fF.hall?`<span class="pill pill-r" style="flex-shrink:0" onclick="fF={q:'',status:'',hall:''};renderFlota()">✕</span>`:''}
      <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._flotaSub='historial';renderFlota()">📝 '+_M('modifications')+'</button>
      <span style="flex:1"></span>
      ${canAdd()?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="openMovModal()">+ Movimiento</button>`:''}
      <button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="document.getElementById('xlsxFlota').click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="dlTemplateFlota()">📋 Plantilla</button>
      ${canExport()?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="exportFlota()">⬇ Excel</button>`:''}
      ${isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('movimientos')">💥 Vaciar</button>`:''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!fF.hall?'#7dd3fc':'#93c5fd'};background:${!fF.hall?'#e0f2fe':'#dbeafe'};color:${!fF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="fF.hall='';renderFlota()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${fF.hall===h?'#3b82f6':'#dbeafe'};color:${fF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${fF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="fF.hall='${h}';renderFlota()">${h}</span>`).join('')}
    </div>
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('flota','posicion','#')}${thSort('flota','matricula',_L('Mat'))}<th>${_L('Rem')}</th>${thSort('flota','nombre',_M('drivers'))}${thSort('flota','empresa',_M('company'))}<th>${_L('Hal')}</th><th>${_M('cargoType')}</th>${thSort('flota','status',_M('status'))}<th>Tacógrafo</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(m=>{const sotOv=m.status==='SOT'&&m.tacografoHora&&new Date(addH(m.tacografoHora,9))<=now;return`<tr style="${sotOv?'background:var(--rll)':''}">
        <td style="font-weight:800">${m.posicion||'–'}</td><td><span class="mchip">${m.matricula}</span></td>
        <td>${m.remolque?`<span class="mchip-sm">${m.remolque}</span>`:'-'}</td>
        <td style="font-size:11px">${m.nombre||''} ${m.apellido||''}</td>
        <td style="font-size:11px">${m.empresa||'–'}</td><td>${hBadge(m.hall)}</td><td>${cBadge(m.tipoCarga)}</td>
        <td>${sBadge(m.status)}${sotOv?'<span style="color:var(--red);font-size:10px"> ⚠️</span>':''}</td>
        <td style="font-size:10px;font-family:'JetBrains Mono',monospace">${m.tacografoHora?fmt(m.tacografoHora,'t'):'-'}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          ${canStatus()?`<select style="padding:2px 4px;font-size:10px;border-radius:4px;border:1px solid var(--border);max-width:90px" onchange="cambiarEstMov('${m.id}',this.value)">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<option value="${s}" ${m.status===s?'selected':''}>${SCFG[s]?.i||''} ${s}</option>`).join('')}</select>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openMovModal(DB.movimientos.find(x=>x.id==='${m.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelMov('${m.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>`:`<div class="empty"><div class="ei">🚛</div><div class="et">Sin movimientos</div></div>`}`;}

// ═══ RENDER CONDUCTORES ═══


function renderConductores(){
  const tabEv=getTabEvent('conductores');
  const q=(cF.q||'').toLowerCase();
  let items=DB.conductores.filter(c=>!q||`${c.nombre||''} ${c.apellido||''} ${c.empresa||''} ${c.matricula||''} ${c.remolque||''} ${c.telefono||''} ${c.email||''} ${c.tipoVehiculo||''} ${c.hall||''} ${c.idioma||''}`.toLowerCase().includes(q));
  document.getElementById('tabContent').innerHTML=`
    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <div class="sbox" style="flex:2;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Nombre, matrícula, empresa, tel, hall..." value="${cF.q||''}" oninput="cF.q=this.value;debounceSearch('conductores',renderConductores)"></div>
      ${cF.q?`<span class="pill pill-r" style="flex-shrink:0" onclick="cF={q:''};renderConductores()">✕</span>`:''}
      <button class="btn btn-sm btn-gh" style="flex-shrink:0" onclick="window._condSub='historial';renderConductores()">📝 '+_M('modifications')+'</button>
      <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:0 6px;flex-shrink:0;border-left:1px solid var(--border);margin-left:2px">
        <span style="color:var(--blue)">${DB.conductores.length} total</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--green)">${DB.conductores.filter(cd=>[...DB.ingresos,...(DB.ingresos2||[])].some(i=>i.matricula===cd.matricula&&!i.salida)).length} ✅ recinto</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--text3)">${DB.conductores.filter(cd=>[...DB.ingresos,...(DB.ingresos2||[])].some(i=>i.matricula===cd.matricula&&i.entrada?.startsWith(new Date().toISOString().slice(0,10)))).length} 🔵 hoy</span>
      </span>
      <div style="width:40px;flex-shrink:0"></div>
      ${canAdd()?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border-color:#0d9f6e;font-weight:600;border-radius:20px" onclick="openCondModal()">+ Añadir</button>`:''}
      <button class="btn btn-s btn-sm" onclick="document.getElementById('xlsxCond').click()">📥 Importar</button>
      <button class="btn btn-gh btn-sm" onclick="downloadPlantillaCond()">📋 Plantilla</button>
      ${canExport()?`<button class="btn btn-gh btn-sm" onclick="exportConductores()">⬇ Excel</button>`:''}
      <div style="width:40px;flex-shrink:0"></div>
      ${canClean()?`<button class="btn btn-sm" style="background:var(--red);color:#fff;border:none;border-radius:20px;flex-shrink:0" onclick="cleanTab('conductores')">🗑 Limpiar</button>`:''}
      ${isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('conductores')">💥 Vaciar</button>`:''}
    </div>
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('conductores','matricula',_M('plate'))}${thSort('conductores','nombre',_M('name'))}${thSort('conductores','empresa',_M('company'))}<th>${_M('phone')}</th>${thSort('conductores','hall',_M('hall'))}<th>${_M('driverLang')}</th><th>Eventos</th><th>Ingresos</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(c=>{const l=LANGS_UI.find(x=>x.code===(c.idioma||''));return`<tr>
        <td>${c.matricula?`<span class="mchip" style="cursor:pointer" onclick="showCondDetalle('${c.id}')">${c.matricula}</span>`:'-'}${c.remolque?`<br><span class="mchip-sm">${c.remolque}</span>`:''}</td>
        <td><b style="font-size:12px">${c.nombre} ${c.apellido}</b>${c.tipoVehiculo?`<br><span style="font-size:10px;color:var(--text3)">${TV[c.tipoVehiculo]||c.tipoVehiculo}</span>`:''}</td>
        <td style="font-size:11px">${c.empresa||'–'}</td>
        <td>${telLink(c.telPais||'',c.telefono||'')}</td>
        <td>${hBadge(c.hall)}</td><td style="font-size:14px" title="${l?.name||''}">${l?l.flag:'–'}</td>
        <td style="font-size:10px;color:var(--text3)">${(c.eventosNombres||[]).join(', ')||'–'}</td>
        <td style="text-align:center;font-weight:800;color:var(--blue)">${DB.ingresos.filter(i=>i.matricula===c.matricula).length}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openCondModal(DB.conductores.find(x=>x.id==='${c.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelCond('${c.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>`:`<div class="empty"><div class="ei">👤</div><div class="et">${DB.conductores.length?'Sin resultados':'Sin conductores'}</div></div>`}`;}

// ═══ RENDER AGENDA ═══


function renderAgenda(){
  const today=new Date().toISOString().slice(0,10),nowT=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  const _agSub=window._agSubTab||'lista';
  // If print subtab, just render header + print config
  if(_agSub==='print'){
    const dayAll=DB.agenda.filter(a=>a.fecha===today);
    document.getElementById('tabContent').innerHTML=
      '<div class="sec-hdr">'+
      _evSelector('agenda')+
      '<div class="sec-act">'+
      (canAdd()?'<button class="btn btn-p btn-sm" onclick="openAgendaModal()">+ Nueva cita</button><button class="btn btn-sm btn-gh af-toggle-btn" onclick="toggleAutoFill()" style="font-size:11px;padding:5px 9px">⚡ ON</button>':'')+
      '</div></div>'+
      '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">'+
      '<button class="btn btn-sm btn-gh" onclick="window._agSubTab=\'lista\';renderAgenda()">📋 '+_M('list')+'</button>'+
      '<button class="btn btn-sm btn-p">🖨 Impresión</button>'+
      '</div>'+
      _ingPrintCfg('ag');
    setTimeout(()=>{initPrintLayout('ag');initPcCanvas('ag');},100);
    return;
  }
  let items=[...DB.agenda];
  // Filter by tab event
  const tabEv=getTabEvent('agenda');
  if(tabEv)items=items.filter(a=>!a.eventoId||a.eventoId===tabEv.id||a.eventoNombre===tabEv.nombre);
  if(agF.desde)items=items.filter(a=>a.fecha>=agF.desde);
  if(agF.hasta)items=items.filter(a=>a.fecha<=agF.hasta);
  if(agF.fecha)items=items.filter(a=>a.fecha===agF.fecha);
  if(agF.hall)items=items.filter(a=>a.hall===agF.hall);
  if(agF.estado)items=items.filter(a=>a.estado===agF.estado);
  const q=(agF.q||'').toLowerCase();if(q)items=items.filter(a=>`${a.matricula} ${a.conductor||''} ${a.empresa||''} ${a.referencia||''} ${a.montador||''} ${a.expositor||''} ${a.hall||''} ${a.remolque||''}`.toLowerCase().includes(q));
  if(agF.evento)items=items.filter(a=>(a.eventoNombre||a.empresa||'').toLowerCase().includes(agF.evento.toLowerCase()));
  if(agF.fecha===today)items=items.map(a=>(a.estado==='PENDIENTE'&&a.hora&&a.hora<nowT)?{...a,_late:true}:a);
  const sa=getSort('agenda');items=sortArr(items,sa.col||'hora',sa.dir||'asc');
  const dayAll=DB.agenda.filter(a=>a.fecha===agF.fecha);
  document.getElementById('tabContent').innerHTML=`

    <div style="display:flex;align-items:center;gap:3px;padding:4px 0;flex-wrap:wrap;min-height:34px;border-bottom:1px solid var(--border);margin-bottom:4px;overflow-x:auto;scrollbar-width:none">
      <button class="btn btn-sm ${_agSub==='lista'?'btn-p':'btn-gh'}" onclick="window._agSubTab='lista';renderAgenda()" style="flex-shrink:0">📋 ${_M('list')}</button>
      <button class="btn btn-sm ${_agSub==='especial'?'btn-p':'btn-gh'}" onclick="window._agSubTab='especial';renderAgenda()" style="flex-shrink:0">⭐ ${_M('special')}</button>
      <button class="btn btn-sm ${_agSub==='historial'?'btn-p':'btn-gh'}" onclick="window._agSubTab='historial';renderAgenda()" style="flex-shrink:0">📝 ${_M('modifications')}</button>
      ${canCampos()?`<button class="btn btn-sm ${_agSub==='campos'?'btn-p':'btn-gh'}" onclick="window._agSubTab='campos';renderAgenda()" style="flex-shrink:0">⚙ ${_M('fields')}</button>`:''}
      <span style="flex:1;min-width:8px"></span>
      <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:0 6px;flex-shrink:0;border-right:1px solid var(--border);margin-right:2px">
        <span style="color:var(--blue)">${dayAll.length} hoy</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--green)">${dayAll.filter(a=>a.estado==='LLEGADO').length} ✅</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--amber)">${dayAll.filter(a=>a.estado==='PENDIENTE').length} ⏳</span><span style="color:var(--border2)">·</span>
        <span style="color:var(--text3)">${dayAll.filter(a=>a.estado==='SALIDA').length} 🔵</span>
      </span>
      ${_agSub!=='campos'&&canAdd()?`<button class="btn btn-sm" style="background:#0d9f6e;color:#fff;border:none;border-radius:20px;font-weight:700;flex-shrink:0" onclick="openAgendaModal()">+ Nueva cita</button>`:''}
      ${_agSub!=='campos'?`<button class="btn btn-s btn-sm" style="flex-shrink:0" onclick="document.getElementById('xlsxAg').click()">📥 Importar</button><button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="dlTemplateAg()">📋 Plantilla</button>`:''}
      ${_agSub!=='campos'&&canExport()?`<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="exportAgenda()">⬇ Excel</button>`:''}
      ${_agSub!=='campos'&&canClean()?`<button class="btn btn-sm" style="flex-shrink:0" onclick="cleanTab('agenda')">🗑 Limpiar</button>`:''}
      ${_agSub!=='campos'&&isSA()?`<button class="btn btn-danger btn-sm" style="flex-shrink:0" onclick="vaciarTab('agenda')">💥 Vaciar</button>`:''}
    </div>
    ${_agSub==='campos'?renderCamposSubtab('agenda'):''}
    ${_agSub!=='campos'?`<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border);padding-bottom:4px">
      <div class="sbox" style="flex:1;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, conductor, empresa, hall..." value="${agF.q||''}" oninput="agF.q=this.value;debounceSearch('agenda',renderAgenda)"></div>
      <input type="date" value="${agF.desde||''}" oninput="agF.desde=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Desde">
      <input type="date" value="${agF.hasta||''}" oninput="agF.hasta=this.value;renderAgenda()" style="height:32px;padding:4px 8px;font-size:11px;box-sizing:border-box;width:auto;min-width:110px;max-width:130px" title="Hasta">
      ${agF.q||agF.hall||agF.estado||agF.desde||agF.hasta?`<span class="pill pill-r" style="flex-shrink:0" onclick="agF={q:'',hall:'',estado:'',evento:'',desde:'',hasta:'',fecha:''};renderAgenda()">✕</span>`:''}
      <span style="font-size:10px;color:var(--text3);flex-shrink:0">${items.length} citas</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">
      <span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;border:1.5px solid ${!agF.hall?'#7dd3fc':'#93c5fd'};background:${!agF.hall?'#e0f2fe':'#dbeafe'};color:${!agF.hall?'#0369a1':'#1e40af'};cursor:pointer" onclick="agF.hall='';renderAgenda()">Todos</span>
      ${getRecintoHalls().map(h=>`<span class="pill" style="font-size:10px;font-weight:700;padding:3px 8px;background:${agF.hall===h?'#3b82f6':'#dbeafe'};color:${agF.hall===h?'#fff':'#1e40af'};border:1.5px solid ${agF.hall===h?'#2563eb':'#93c5fd'};cursor:pointer" onclick="agF.hall='${h}';renderAgenda()">${h}</span>`).join('')}
    </div>`:''} 
    ${items.length?`<div class="tbl-wrap"><table class="dtbl"><thead><tr>${thSort('agenda','estado',_M('status'))}${thSort('agenda','hora',_M('schedTime'))}${thSort('agenda','horaReal',_M('realTime'))}<th>Dif.</th>${thSort('agenda','matricula',_M('plate'))}${thSort('agenda','conductor',_M('drivers'))}${thSort('agenda','empresa',_M('company'))}<th>${_L('Hal')}</th><th>Extras</th><th>Acc.</th></tr></thead><tbody>
      ${items.map(a=>{const d=a.horaReal?diffMins(a.hora,a.horaReal):null;return`<tr style="${a._late?'background:var(--rll)':''}">
        <td>${sAgBadge(a.estado||'PENDIENTE')}${a._late?'<br><span style="font-size:9px;color:var(--red)">⏰</span>':''}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${a.hora||'–'}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700">${a.horaReal||'–'}</td>
        <td><span class="${diffClass(d)}" style="font-size:11px">${a.horaReal?diffLabel(d):'–'}</span></td>
        <td><span class="mchip" style="cursor:pointer" onclick="showAgDetalle('${a.id}')">${a.matricula}</span>${a.remolque?`<br><span class="mchip-sm">${a.remolque}</span>`:''}</td>
        <td style="font-size:11px"><b>${a.conductor||'–'}</b>${a.tipoVehiculo?`<br><span style="font-size:10px">${TV[a.tipoVehiculo]||a.tipoVehiculo}</span>`:''}</td>
        <td style="font-size:11px">${a.referencia?`<b style="font-family:'JetBrains Mono',monospace">${a.referencia}</b><br>`:''}<span style="color:var(--text3)">${a.empresa||''}</span>${a.montador?`<br>Mont: ${a.montador}`:''}</td>
        <td>${hBadge(a.hall)}${a.stand?`<br><span style="font-size:10px">Std: ${a.stand}</span>`:''}</td>
        <td style="font-size:10px">${a.gpsUrl?`<a href="${a.gpsUrl}" target="_blank" class="gps-pill">📍</a> `:''}${a.pase?`<span class="pase-pill">${PP[a.pase]||a.pase}</span> `:''}${a.requisitos?.length?`📋${a.requisitos.length}`:''}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          ${canStatus()&&a.estado!=='LLEGADO'&&a.estado!=='SALIDA'?`<button class="btn btn-success btn-xs" onclick="marcarAgLlegado('${a.id}')">✅</button>`:''}
          ${canStatus()&&a.estado==='LLEGADO'?`<button class="btn btn-edit btn-xs" onclick="marcarAgSalida('${a.id}')">🔵</button>`:''}
          <button class="btn btn-gh btn-xs" onclick="printAgendaItem(DB.agenda.find(x=>x.id==='${a.id}'))" title="Imprimir">🖨</button>
          <button class="btn btn-xs" style="background:var(--purple);color:#fff" title="Registrar paso tracking" onclick="registrarPasoTrackingAg('${a.id}')">📡</button>
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="openAgendaModal(DB.agenda.find(x=>x.id==='${a.id}'))">✏️</button>`:''}
          ${canDel()?`<button class="btn btn-danger btn-xs" onclick="askDelAg('${a.id}')">🗑</button>`:''}
        </div></td>
      </tr>`;}).join('')}
    </tbody></table></div>`:`<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">'+_M('noRecords')+'</div>`}`;
}
// ═══ RENDER ANALYTICS ═══

// Analytics state
if (!window._anlState) window._anlState = { source:'all', chart:'resumen', dateFrom:'', dateTo:'' };

function renderAnalytics() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const S = window._anlState;
  const today = new Date().toISOString().slice(0, 10);

  // Data sources
  const sources = {
    all:       [...DB.ingresos, ...DB.ingresos2, ...(DB.movimientos||[]), ...(DB.agenda||[])],
    ref:       DB.ingresos,
    ing:       DB.ingresos2,
    flota:     DB.movimientos || [],
    agenda:    DB.agenda || [],
    conductores: DB.conductores || [],
  };
  let data = sources[S.source] || sources.all;

  // Date filter
  if (S.dateFrom) data = data.filter(i => (i.entrada||i.ts||'') >= S.dateFrom);
  if (S.dateTo)   data = data.filter(i => (i.entrada||i.ts||'') <= S.dateTo+'T23:59');

  // Auto-export warning
  const autoExportWarn = data.length > 500 ? `<div style="background:var(--all);border:1px solid #fde68a;border-radius:var(--r);padding:6px 10px;font-size:11px;font-weight:600;color:#92400e;margin-bottom:8px">⚠️ +500 registros (${data.length}). <button class="btn btn-gh btn-xs" onclick="window._op._anlExport()">⬇ Auto-exportar Excel con fecha</button></div>` : '';

  // KPIs
  const enRecinto = data.filter(i => !i.salida && i.entrada).length;
  const hoy = data.filter(i => (i.entrada||'').startsWith(today)).length;
  const conSalida = data.filter(i => i.salida).length;

  // Breakdowns
  const _count = (arr, key) => {
    const m = {}; arr.forEach(i => { const v = i[key]; if (v) m[v] = (m[v]||0)+1; });
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  };
  const _timeHist = (arr) => {
    const m = {}; arr.forEach(i => { const d = (i.entrada||i.ts||'').slice(0,10); if (d) m[d]=(m[d]||0)+1; });
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  };
  const _hourHist = (arr) => {
    const m = {}; for(let h=0;h<24;h++) m[String(h).padStart(2,'0')]=0;
    arr.forEach(i => { const t = (i.entrada||i.ts||'').slice(11,13); if (t) m[t]=(m[t]||0)+1; });
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  };
  const _avgTime = (arr) => {
    const times = arr.filter(i=>i.entrada&&i.salida).map(i => new Date(i.salida)-new Date(i.entrada));
    return times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length/60000) : 0;
  };

  const byEmpresa = _count(data, 'empresa').slice(0,10);
  const byTipo    = _count(data, 'tipoVehiculo').slice(0,8);
  const byHall    = _count(data, 'hall').slice(0,8);
  const byStatus  = _count(data, 'status').slice(0,6);
  const byDay     = _timeHist(data);
  const byHour    = _hourHist(data);
  const avgMin    = _avgTime(data);

  const barMax = (arr) => arr.length ? arr[0][1] : 1;
  const barChart = (arr, color, title) => {
    if (!arr.length) return '<div style="padding:8px;text-align:center;font-size:11px;color:var(--text3)">'+_M('noRecords')+'</div>';
    const mx = barMax(arr);
    return arr.map(([k,v]) => `<div class="bar-row"><span style="font-size:10px;min-width:70px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2)">${esc(k)}</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(v/mx*100)}%;background:${color}"></div></div><span class="bar-val">${v}</span></div>`).join('');
  };
  const sparkLine = (arr, color) => {
    if (arr.length < 2) return '';
    const mx = Math.max(...arr.map(x=>x[1]),1);
    const w = 280, h = 60, step = w/(arr.length-1);
    const pts = arr.map((x,i) => `${i*step},${h-Math.round(x[1]/mx*(h-6))}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px;display:block"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  };

  // Source selector + date filters
  let h = `${autoExportWarn}
  <div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
    <span style="font-size:10px;font-weight:700;color:var(--text3)">FUENTE:</span>
    ${[['all','🌐 Todo'],['ref','🔖 Ref'],['ing','🚛 Ing'],['flota','📦 Embalaje'],['agenda','📅 Agenda'],['conductores','👤 Cond.']].map(([v,l])=>`<button class="btn btn-xs ${S.source===v?'btn-p':'btn-gh'}" onclick="window._anlState.source='${v}';window._op.renderAnalytics()">${l}</button>`).join('')}
    <span style="flex:1"></span>
    <input type="date" value="${S.dateFrom||''}" oninput="window._anlState.dateFrom=this.value;window._op.renderAnalytics()" title="Desde">
    <input type="date" value="${S.dateTo||''}" oninput="window._anlState.dateTo=this.value;window._op.renderAnalytics()" title="Hasta">
    ${S.dateFrom||S.dateTo?`<button class="btn btn-xs btn-gh" onclick="window._anlState.dateFrom='';window._anlState.dateTo='';window._op.renderAnalytics()">✕</button>`:''}
    <button class="btn btn-gh btn-sm" onclick="window._op._anlExport()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
    <button class="btn btn-sm" style="background:#7c3aed;color:#fff;border:none;border-radius:20px" onclick="window._op._anlSmartInsights()">🧠 Insights</button>
  </div>`;

  // KPI cards
  h += `<div class="sg sg4" style="margin-bottom:10px">
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--blue)">${data.length}</div><div class="stat-l">Total registros</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--green)">${enRecinto}</div><div class="stat-l">${_M('onPremises')}</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--teal)">${hoy}</div><div class="stat-l">Hoy</div></div>
    <div class="card" style="text-align:center;padding:12px"><div class="stat-n" style="font-size:24px;color:var(--amber)">${avgMin}<span style="font-size:11px">m</span></div><div class="stat-l">Prom. estancia</div></div>
  </div>`;

  // Charts grid — Row 1: Trend + Hour distribution
  h += `<div class="sg sg2" style="margin-bottom:10px">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📈 Tendencia diaria</div>${sparkLine(byDay,'#3b82f6')}<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:2px"><span>${byDay[0]?byDay[0][0]:''}</span><span>${byDay.length?byDay[byDay.length-1][0]:''}</span></div></div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🕐 Distribución por hora</div>${barChart(byHour.filter(x=>x[1]>0),'#6366f1','')}</div>
  </div>`;

  // Row 2: Donut vehicle type + Top empresas + Halls
  const donutSVG = (items, colors) => {
    if (!items.length) return '<div style="padding:16px;text-align:center;font-size:11px;color:var(--text3)">'+_M('noRecords')+'</div>';
    const total = items.reduce((a,x) => a+x[1], 0);
    const cx=60, cy=60, r=50, r2=30;
    let angle = -90;
    let paths = '';
    const clrs = colors || ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#64748b'];
    items.forEach(([k,v], i) => {
      const pct = v/total;
      const a1 = angle * Math.PI/180;
      angle += pct * 360;
      const a2 = angle * Math.PI/180;
      const large = pct > 0.5 ? 1 : 0;
      const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
      const x2=cx+r*Math.cos(a2), y2=cy+r*Math.sin(a2);
      const x3=cx+r2*Math.cos(a2), y3=cy+r2*Math.sin(a2);
      const x4=cx+r2*Math.cos(a1), y4=cy+r2*Math.sin(a1);
      paths += '<path d="M'+x1+','+y1+' A'+r+','+r+' 0 '+large+' 1 '+x2+','+y2+' L'+x3+','+y3+' A'+r2+','+r2+' 0 '+large+' 0 '+x4+','+y4+' Z" fill="'+clrs[i%clrs.length]+'" opacity="0.85"/>';
    });
    const legend = items.slice(0,6).map(([k,v],i) => '<div style="display:flex;align-items:center;gap:4px;font-size:10px"><div style="width:8px;height:8px;border-radius:2px;background:'+clrs[i%clrs.length]+';flex-shrink:0"></div><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px">'+esc(k)+'</span><b>'+v+'</b></div>').join('');
    return '<div style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 120 120" width="100" height="100">'+paths+'<text x="60" y="58" text-anchor="middle" font-size="16" font-weight="900" fill="var(--text)">'+total+'</text><text x="60" y="72" text-anchor="middle" font-size="8" fill="var(--text3)">total</text></svg><div style="display:flex;flex-direction:column;gap:3px;flex:1">'+legend+'</div></div>';
  };

  // Descarga breakdown
  const descC = {mano:0, maquinaria:0, mixto:0};
  data.forEach(i => { if(i.descargaTipo) descC[i.descargaTipo]=(descC[i.descargaTipo]||0)+1; });
  const descTotal = Object.values(descC).reduce((a,b)=>a+b,0);

  h += `<div class="sg sg3" style="margin-bottom:10px">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🚗 Tipo vehículo</div>${donutSVG(byTipo)}</div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏢 Top empresas</div>${barChart(byEmpresa,'var(--teal)','')}</div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">🏟 Por Hall</div>${barChart(byHall,'var(--amber)','')}</div>
  </div>`;

  // Row 3: Descarga + Status + Ref vs Ing
  const refData = (sources.ref||[]).filter(i => (!S.dateFrom||(i.entrada||'')>=S.dateFrom) && (!S.dateTo||(i.entrada||'')<=S.dateTo+'T23:59'));
  const ingData = (sources.ing||[]).filter(i => (!S.dateFrom||(i.entrada||'')>=S.dateFrom) && (!S.dateTo||(i.entrada||'')<=S.dateTo+'T23:59'));
  const totalRef=refData.length, totalIng=ingData.length, totalBoth=totalRef+totalIng;
  const pctRef = totalBoth ? Math.round(totalRef/totalBoth*100) : 50;

  h += `<div class="sg sg3">
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">📦 Tipo descarga</div>
      ${descTotal ? `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
        <div style="text-align:center;background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--green)">${descC.mano||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MANUAL</div></div>
        <div style="text-align:center;background:var(--bll);border:1px solid #bfdbfe;border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--blue)">${descC.maquinaria||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MAQUINARIA</div></div>
        <div style="text-align:center;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:8px"><div style="font-size:20px;font-weight:900;color:var(--text3)">${descC.mixto||0}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">MIXTO</div></div>
      </div>` : '<div style="padding:12px;text-align:center;font-size:11px;color:var(--text3)">'+_M('noRecords')+'</div>'}
    </div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:8px">🔄 Ref vs Ing</div>
      <div style="height:14px;border-radius:7px;overflow:hidden;display:flex;margin-bottom:10px"><div style="background:var(--blue);width:${pctRef}%"></div><div style="background:var(--green);flex:1"></div></div>
      <div style="display:flex;gap:8px">
        <div style="flex:1;text-align:center;background:var(--bll);border-radius:var(--r);padding:8px"><div style="font-size:22px;font-weight:900;color:var(--blue)">${totalRef}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">🔖 REF (${pctRef}%)</div></div>
        <div style="flex:1;text-align:center;background:var(--gll);border-radius:var(--r);padding:8px"><div style="font-size:22px;font-weight:900;color:var(--green)">${totalIng}</div><div style="font-size:9px;font-weight:700;color:var(--text3)">🚛 ING (${100-pctRef}%)</div></div>
      </div>
    </div>
    <div class="card"><div style="font-weight:800;font-size:12px;margin-bottom:6px">📊 Estado actual</div>${donutSVG([[''+_M('onPremises')+'',enRecinto],['Con salida',conSalida],['Hoy',hoy]].filter(x=>x[1]>0),['#10b981','#6366f1','#f59e0b'])}</div>
  </div>`;

  el.innerHTML = h;
}

// Export analytics to Excel
function _anlExport() {
  const S = window._anlState;
  const sources = { all:[...DB.ingresos,...DB.ingresos2,...(DB.movimientos||[]),...(DB.agenda||[])], ref:DB.ingresos, ing:DB.ingresos2, flota:DB.movimientos||[], agenda:DB.agenda||[], conductores:DB.conductores||[] };
  let data = sources[S.source] || sources.all;
  if (S.dateFrom) data = data.filter(i => (i.entrada||i.ts||'') >= S.dateFrom);
  if (S.dateTo)   data = data.filter(i => (i.entrada||i.ts||'') <= S.dateTo+'T23:59');
  if (!data.length) { toast(_M('noRecords'),'var(--amber)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Analisis');
  const fn = `beunifyt_analisis_${S.source}_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast(`✅ ${fn}`, 'var(--green)');
}

// ─── LOCAL AI INSIGHTS (Fix 13 — no paid API) ─────────────────────────
function _anlSmartInsights() {
  const allIngs = [...DB.ingresos, ...DB.ingresos2];
  const flota = DB.movimientos || [];
  const agenda = DB.agenda || [];
  const total = allIngs.length + flota.length + agenda.length;
  if (!total) { toast(''+_M('noRecords')+'','var(--amber)'); return; }

  const insights = [];
  const today = new Date().toISOString().slice(0,10);

  // 1. Volume analysis
  const todayCount = allIngs.filter(i=>(i.entrada||'').startsWith(today)).length;
  const avgDaily = (() => {
    const days = {}; allIngs.forEach(i => { const d = (i.entrada||'').slice(0,10); if(d) days[d]=(days[d]||0)+1; });
    const vals = Object.values(days); return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  })();
  if (todayCount > avgDaily * 1.5 && avgDaily > 0) insights.push({ico:'📈',type:'alerta',text:`Hoy (${todayCount}) supera la media diaria (${avgDaily}) en un ${Math.round((todayCount/avgDaily-1)*100)}%. Posible pico de actividad.`});
  else if (todayCount < avgDaily * 0.5 && avgDaily > 3) insights.push({ico:'📉',type:'info',text:`Hoy (${todayCount}) está por debajo de la media diaria (${avgDaily}). Día tranquilo.`});

  // 2. Pending exits
  const sinSalida = allIngs.filter(i => i.entrada && !i.salida);
  if (sinSalida.length > 10) insights.push({ico:'⚠️',type:'alerta',text:`${sinSalida.length} vehículos en recinto sin registrar salida. Revisar pendientes.`});

  // 3. Top empresa dominance
  const empC = {}; allIngs.forEach(i => { if(i.empresa) empC[i.empresa]=(empC[i.empresa]||0)+1; });
  const empTop = Object.entries(empC).sort((a,b)=>b[1]-a[1]);
  if (empTop.length > 0 && allIngs.length > 10) {
    const pct = Math.round(empTop[0][1]/allIngs.length*100);
    if (pct > 40) insights.push({ico:'🏢',type:'info',text:`"${empTop[0][0]}" concentra el ${pct}% del tráfico total.`});
  }

  // 4. Peak hour
  const hourC = {}; allIngs.forEach(i => { const h = (i.entrada||'').slice(11,13); if(h) hourC[h]=(hourC[h]||0)+1; });
  const peakH = Object.entries(hourC).sort((a,b)=>b[1]-a[1]);
  if (peakH.length) insights.push({ico:'🕐',type:'info',text:`Hora pico: ${peakH[0][0]}:00 con ${peakH[0][1]} entradas. Planificar recursos.`});

  // 5. Avg stay time
  const stays = allIngs.filter(i=>i.entrada&&i.salida).map(i=>(new Date(i.salida)-new Date(i.entrada))/60000);
  if (stays.length > 5) {
    const avg = Math.round(stays.reduce((a,b)=>a+b,0)/stays.length);
    const max = Math.round(Math.max(...stays));
    insights.push({ico:'⏱',type:'info',text:`Estancia media: ${avg} min. Máxima: ${max} min (${Math.round(max/60)}h).`});
    if (max > 480) insights.push({ico:'🚨',type:'alerta',text:`Hay vehículos con estancias de +8h. Verificar si es normal.`});
  }

  // 6. Missing data
  const sinEmpresa = allIngs.filter(i=>!i.empresa).length;
  const sinMat = allIngs.filter(i=>!i.matricula).length;
  if (sinEmpresa > allIngs.length * 0.2 && sinEmpresa > 5) insights.push({ico:'📝',type:'mejora',text:`${sinEmpresa} registros sin empresa (${Math.round(sinEmpresa/allIngs.length*100)}%). Mejorar completitud de datos.`});
  if (sinMat > 0) insights.push({ico:'🚗',type:'mejora',text:`${sinMat} registros sin matrícula.`});

  // 7. Hall distribution
  const hallC = {}; allIngs.forEach(i => { if(i.hall) hallC[i.hall]=(hallC[i.hall]||0)+1; });
  const hallTop = Object.entries(hallC).sort((a,b)=>b[1]-a[1]);
  if (hallTop.length > 1) {
    const top = hallTop[0], bottom = hallTop[hallTop.length-1];
    if (top[1] > bottom[1] * 3) insights.push({ico:'🏟',type:'info',text:`Distribución desigual: Hall ${top[0]} (${top[1]}) vs Hall ${bottom[0]} (${bottom[1]}). Considerar balanceo.`});
  }

  // 8. Agenda compliance
  if (agenda.length > 5) {
    const llegados = agenda.filter(a=>a.estado==='LLEGADO'||a.estado==='SALIDA').length;
    const pctComp = Math.round(llegados/agenda.length*100);
    insights.push({ico:'📅',type:'info',text:`Cumplimiento agenda: ${pctComp}% (${llegados}/${agenda.length} confirmados).`});
  }

  if (!insights.length) insights.push({ico:'✅',type:'info',text:'Todo parece normal. Sin alertas ni anomalías detectadas.'});

  // Render modal
  const typeColors = {alerta:'var(--rll)',info:'var(--bll)',mejora:'var(--all)'};
  const typeBorders = {alerta:'#fecaca',info:'#bfdbfe',mejora:'#fde68a'};
  const body = insights.map(ins => `<div style="padding:10px 14px;background:${typeColors[ins.type]||'var(--bg3)'};border:1px solid ${typeBorders[ins.type]||'var(--border)'};border-radius:var(--r);margin-bottom:6px;display:flex;gap:10px;align-items:flex-start">
    <span style="font-size:18px;flex-shrink:0">${ins.ico}</span>
    <span style="font-size:12px;line-height:1.5">${ins.text}</span>
  </div>`).join('');

  const div = document.createElement('div'); div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box" style="max-width:520px"><div class="modal-hdr"><div class="modal-ttl">🧠 Análisis inteligente (${insights.length} insights)</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>
    <div style="font-size:11px;color:var(--text3);margin-bottom:10px">Análisis 100% local — sin envío de datos a servidores externos</div>
    ${body}
  </div>`;
  document.getElementById('dynModal')?.remove();
  document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

// ─── HISTORIAL ────────────────────────────────────────────────────────
function renderVehiculos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const hist = [...DB.editHistory].sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0, 200);
  const q = (iF.qHist||'').toLowerCase();
  const filtered = q ? hist.filter(h => `${h.mat||''} ${h.user||''} ${h.action||''} ${h.detail||''}`.toLowerCase().includes(q)) : hist;

    let h = `
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${esc(iF.qVeh||'')}" oninput="window._iF.qVeh=this.value;window._dbs('veh','renderVehiculos')" style="font-size:12px"></div>
    ${iF.qVeh?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qVeh='';window._op.renderVehiculos()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${filtered.length} reg.</span>
    <span style="flex:1"></span>
    ${canImport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.importExcel(\'vehiculos\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateVehiculos()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'vehiculos\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarTab(\'vehiculos\')">💥 Vaciar</button>':''}
  </div>`;

  if (!filtered.length) { h += '<div class="empty"><div class="ei">📜</div><div class="et">Sin historial</div></div>'; }
  else {
    const icoMap = { new:'✅',edit:'✏️',salida:'↩',reactivar:'↺',new_ing2:'✅',edit_ing2:'✏️',delete:'🗑' };
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>';
    filtered.forEach(r => {
      h += `<tr>
        <td style="font-size:11px;color:var(--text3)">${r.pos?'#'+r.pos:''}</td>
        <td><span class="mchip-sm">${esc(r.mat||'–')}</span></td>
        <td style="font-size:11px">${icoMap[r.action]||r.action||'•'}</td>
        <td style="font-size:11px;font-weight:700">${esc(r.user||'–')}</td>
        <td style="font-size:11px;color:var(--text3);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.detail||'–')}</td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap">${fmt(r.ts)}</td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── ARCHIVOS / AUDITORIA ────────────────────────────────────────────
function renderAuditoria() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const sub = window._audSub || 'sesiones';
  const q = (window._audQ || '').toLowerCase();
  let subContent = '';

  if (sub === 'sesiones') {
    let items = (DB.auditLog||[]).filter(e => e.entity === 'sesion');
    if (q) items = items.filter(e => `${e.user||''} ${e.detail||''}`.toLowerCase().includes(q));
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Estado</th><th>Usuario</th><th>Detalle</th><th>Fecha/Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||'–')}</td><td style="font-size:11px;white-space:nowrap">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">🔑</div><div class="et">Sin eventos de sesión</div></div>';
  } else if (sub === 'acciones') {
    let items = (DB.auditLog||[]).filter(e => e.entity !== 'sesion');
    if (q) items = items.filter(e => `${e.user||''} ${e.action||''} ${e.entity||''} ${e.detail||''}`.toLowerCase().includes(q));
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Acción</th><th>Usuario</th><th>Entidad</th><th>Detalle</th><th>Hora</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px">${e.action||'–'}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td style="font-size:11px">${esc(e.entity||'–')}</td><td style="font-size:11px;color:var(--text3)">${esc(e.detail||'–')}</td><td style="font-size:11px;white-space:nowrap">${e.ts||'–'}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">📋</div><div class="et">Sin acciones</div></div>';
  } else if (sub === 'exportaciones') {
    const items = sortBy(DB.exportLog||[], 'ts', 'desc');
    subContent = items.length ? `<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Pestaña</th><th>Archivo</th></tr></thead><tbody>${items.map(e => `<tr><td style="font-size:11px;white-space:nowrap">${fmt(e.ts)}</td><td style="font-weight:700">${esc(e.user||'–')}</td><td><span class="pill pill-b">${esc(e.tab||'–')}</span></td><td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(e.filename||'–')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><div class="ei">📥</div><div class="et">Sin exportaciones</div></div>';
  }

  const tabBtn = (id, label, cnt) => `<button class="btn btn-sm ${sub===id?'btn-p':'btn-gh'}" onclick="window._audSub='${id}';window._op.renderAuditoria()">${label}${cnt?` <span style="background:rgba(255,255,255,.3);padding:1px 5px;border-radius:10px;font-size:9px;margin-left:3px">${cnt}</span>`:''}</button>`;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:8px;flex-wrap:wrap">
      <div class="sbox" style="flex:1;min-width:160px"><span class="sico">🔍</span><input type="text" placeholder="Buscar..." value="${esc(window._audQ||'')}" oninput="window._audQ=this.value;window._dbs('aud','renderAuditoria')"></div>
      ${tabBtn('sesiones','🔑 Sesiones',(DB.auditLog||[]).filter(e=>e.entity==='sesion').length)}
      ${tabBtn('acciones','📋 Acciones',(DB.auditLog||[]).filter(e=>e.entity!=='sesion').length)}
      ${tabBtn('exportaciones','📥 Exportaciones',(DB.exportLog||[]).length)}
      ${isSA()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportAuditLog()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    </div>
    ${subContent}`;
}

// ─── PAPELERA ─────────────────────────────────────────────────────────
function renderPapelera() {
  const el = document.getElementById('tabContent'); if (!el) return;
  let items = [...DB.papelera];
  const q = (iF.qPap||'').toLowerCase();
  if (q) items = items.filter(p => JSON.stringify(p.item||{}).toLowerCase().includes(q));
  const sorted = sortBy(items, 'ts', 'desc');

    let h = `
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:nowrap;border-bottom:1px solid var(--border);padding-bottom:4px;overflow-x:auto;scrollbar-width:none">
    <div class="sbox" style="flex:0 1 240px;min-width:120px"><span class="sico">🔍</span><input type="search" placeholder="Matrícula, empresa..." value="${esc(iF.qPap||'')}" oninput="window._iF.qPap=this.value;window._dbs('pap','renderPapelera')" style="font-size:12px"></div>
    ${iF.qPap?`<span class="pill" style="cursor:pointer;background:var(--rll);color:var(--red);border:1px solid #fecaca;font-size:11px;flex-shrink:0" onclick="window._iF.qPap='';window._op.renderPapelera()">✕</span>`:''}
    <span style="font-size:10px;color:var(--text3)">${sorted.length} elem.</span>
    <span style="flex:1"></span>
    ${canExport()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.exportExcel(\'papelera\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    ${isSA()?'<button class="btn btn-danger btn-sm" onclick="window._op.vaciarPapelera()">🗑 '+_M('emptyTrash')+'</button>':''}
  </div>`;
  if (!sorted.length) { h += '<div class="empty"><div class="ei">🗑</div><div class="et">Papelera vacía</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Origen</th><th>Matrícula</th><th>Empresa</th><th>Borrado por</th><th>Fecha</th><th></th></tr></thead><tbody>';
    sorted.forEach(p => {
      const item = p.item || {};
      h += `<tr>
        <td><span class="pill pill-a">${esc(p.origen||'–')}</span></td>
        <td><span class="mchip-sm">${esc(item.matricula||'–')}</span></td>
        <td style="font-size:11px">${esc(item.empresa||'–')}</td>
        <td style="font-size:11px;color:var(--text3)">${esc(p.borradoPor||'–')}</td>
        <td style="font-size:11px;white-space:nowrap">${fmt(p.ts)}</td>
        <td><button class="btn btn-s btn-xs" onclick="window._op.restaurar('${p.id}')">↩ Restaurar</button></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── IMPRESIÓN ────────────────────────────────────────────────────────
function renderImpresion() {
  const el = document.getElementById('tabContent'); if (!el) return;
  el.innerHTML = '<div id="impresionContainer" style="height:100%;display:flex;flex-direction:column"></div>';
  import('./impresion.js').then(m => m.initImpresion('impresionContainer')).catch(e => {
    el.innerHTML = '<div class="empty"><div class="ei">🖨</div><div class="et">'+_M('status')+': '+_M('printing')+'</div><div class="es">' + e.message + '</div></div>';
  });
}

// ─── RECINTOS ────────────────────────────────────────────────────────
function renderRecintos() {
  const el = document.getElementById('tabContent'); if (!el) return;
  let items = [...(DB.recintos||[])];
  const q = (window._recQ || '').toLowerCase();
  if (q) items = items.filter(r => `${r.nombre||''} ${r.ciudad||''} ${r.pais||''} ${(r.halls||[]).join(' ')}`.toLowerCase().includes(q));
  const sk = window._recSort || 'nombre';
  const sd = window._recSortDir || 'asc';
  items.sort((a,b) => { const va=(a[sk]||'').toString().toLowerCase(), vb=(b[sk]||'').toString().toLowerCase(); return sd==='asc'?va.localeCompare(vb):vb.localeCompare(va); });

  const sortH = (col,lbl) => {
    const ico = sk===col ? (sd==='asc'?'↑':'↓') : '↕';
    return `<th style="cursor:pointer;user-select:none" onclick="window._recSort='${col}';window._recSortDir=window._recSort==='${col}'&&window._recSortDir==='asc'?'desc':'asc';window._op.renderRecintos()">${lbl} <span style="font-size:9px">${ico}</span></th>`;
  };

  let h = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
    <div class="sbox" style="flex:1;min-width:160px"><span class="sico">🔍</span><input type="search" placeholder="Buscar recinto, ciudad, hall..." value="${esc(window._recQ||'')}" oninput="window._recQ=this.value;window._dbs('rec','renderRecintos')"></div>
    <span style="font-size:11px;color:var(--text3)">${items.length} recintos</span>
    ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openRecintoModal(null)">+ '+_M('newVenue')+'</button>':''}
    ${canImport()?'<button class="btn btn-gh btn-sm" onclick="window._op.importExcel(\'recintos\')">📥 Importar</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.dlTemplateRecintos()">📋 Plantilla</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'recintos\')">⬇ Excel</button>':''}
  </div>`;

  if (!items.length) { h += '<div class="empty"><div class="ei">🏟</div><div class="et">Sin recintos configurados</div></div>'; }
  else {
    h += `<div class="tbl-wrap"><table class="dtbl"><thead><tr>${sortH('nombre','Recinto')}${sortH('ciudad','Ciudad')}${sortH('pais','País')}<th>Halls</th><th>Puertas</th><th></th></tr></thead><tbody>`;
    items.forEach(r => {
      const halls = (r.halls||[]).join(', ') || '–';
      const puertas = (r.puertas||[]).map(p=>p.nombre||p).join(', ') || '–';
      h += `<tr>
        <td style="font-weight:700">${esc(r.nombre||'–')}</td>
        <td style="font-size:11px">${esc(r.ciudad||'–')}</td>
        <td style="font-size:11px">${esc(r.pais||'–')}</td>
        <td style="font-size:11px">${esc(halls)}</td>
        <td style="font-size:11px">${esc(puertas)}</td>
        <td><div style="display:flex;gap:2px">
          ${isSA()?`<button class="btn btn-edit btn-xs" onclick="window._op.openRecintoModal('${r.id}')">✏️</button><button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${r.id}','recintos')">🗑</button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

function dlTemplateRecintos() {
  _xlsxWrite([
    ['Nombre','Ciudad','País','Halls (separar con ;)','Puertas (separar con ;)'],
    ['Fira Barcelona','Barcelona','España','H1;H2;H3;H4','P1;P2;P3']
  ], 'Recintos', 'plantilla_recintos.xlsx');
}

// ─── EVENTOS ──────────────────────────────────────────────────────────
function renderEventosTab() {
  const el = document.getElementById('tabContent'); if (!el) return;
  const items = DB.eventos;
  const actId = DB.activeEventId;

  let h = `<div class="sec-hdr">
    <span class="sec-ttl">📅 Eventos (${items.length})</span>
    <div class="sec-act">
      ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openEventoModal(null)">+ Nuevo evento</button>':''}
      ${canImport()?'<button class="btn btn-gh btn-sm" onclick="window._op.importExcel(\'eventos\')">📥 Importar</button>':''}
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'eventos\')">⬇ Excel</button>':''}
    </div>
  </div>`;

  if (!items.length) { h += '<div class="empty"><div class="ei">📅</div><div class="et">Sin eventos configurados</div></div>'; }
  else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>'+_M('events')+'</th><th>Fechas</th><th>"+_M("venues")+"</th><th>Estado</th><th></th></tr></thead><tbody>';
    items.forEach(ev => {
      const isAct = ev.id === actId;
      h += `<tr style="${isAct?'background:var(--gll)':''}">
        <td><span style="font-weight:700">${ev.ico||'📋'} ${esc(ev.nombre)}</span></td>
        <td style="font-size:11px">${esc(ev.ini||'–')} → ${esc(ev.fin||'–')}</td>
        <td style="font-size:11px">${esc(ev.recinto||'–')} ${ev.ciudad?'· '+esc(ev.ciudad):''}</td>
        <td>${isAct?'<span class="pill pill-g"><span class="live"></span> ACTIVO</span>':'<span class="pill" style="background:var(--bg3);color:var(--text3);border:1px solid var(--border)">Inactivo</span>'}</td>
        <td><div style="display:flex;gap:2px;flex-wrap:wrap">
          <button class="btn btn-xs" onclick="window._op.seleccionarEventoTrabajo('${ev.id}')" style="${DB.userWorkEventId===ev.id?'background:#2563eb;color:#fff;border-color:#2563eb':''}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${DB.userWorkEventId===ev.id?'En uso':'Trabajar'}</button>
          ${!isAct&&(isSA()||hasPerm('canActivate'))?`<button class="btn btn-s btn-xs" onclick="window._op.activarEvento('${ev.id}')">▶ Activar</button>`:''}
          ${isAct&&(isSA()||hasPerm('canActivate'))?`<button class="btn btn-warning btn-xs" onclick="window._op.desactivarEvento()">⏹ Desactivar</button>`:''}
          ${(isSA()||hasPerm('canEditEvento'))?`<button class="btn btn-edit btn-xs" onclick="window._op.openEventoModal('${ev.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${ev.id}','eventos')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

// ─── MENSAJES ────────────────────────────────────────────────────────
function renderMensajes() {
  const el = document.getElementById('tabContent'); if (!el) return;
  // Delegate to mensajes module
  import('./mensajes.js').then(m => m.initMensajes('tabContent', DB, SID, canEdit, isSA)).catch(() => {
    _renderMensajesInline(el);
  });
}

function _renderMensajesInline(el) {
  const msgs = DB.mensajesRampa.slice().sort((a,b) => (b.ts||'').localeCompare(a.ts||''));
  let h = `<div class="sec-hdr">
    <span class="sec-ttl">📢 ${_M('messages')} (${msgs.length})</span>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-p btn-sm" onclick="window._op.openMsgModal()">+ Nuevo mensaje</button>':''}
      ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'mensajesRampa\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
    </div>
  </div>`;

  if (!msgs.length) { h += '<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>'; }
  else {
    h += '<div style="display:flex;flex-direction:column;gap:6px">';
    msgs.forEach(m => {
      const unread = !(m.leido||[]).includes(SID);
      const typeColors = { urgente:'var(--rll)',alerta:'var(--all)',info:'var(--bll)',ok:'var(--gll)' };
      h += `<div style="padding:10px 14px;border-radius:var(--r2);border:1.5px solid var(--border);background:${typeColors[m.tipo]||'var(--bg2)'};${unread?'border-left:4px solid var(--blue)':''}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-weight:800;font-size:13px">${esc(m.titulo||'Sin título')}</span>
          ${m.tipo?`<span class="pill pill-${m.tipo==='urgente'?'r':m.tipo==='alerta'?'a':'b'}">${esc(m.tipo)}</span>`:''}
          ${m.matricula?`<span class="mchip-sm" style="font-size:10px">${esc(m.matricula)}</span>`:''}
          <span style="margin-left:auto;font-size:10px;color:var(--text3)">${fmt(m.ts)}</span>
          ${canEdit()?`<button class="btn btn-xs btn-gh" onclick="window._op.marcarMsgLeido('${m.id}')">✓ Leído</button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${m.id}','mensajesRampa')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div>
        <div style="font-size:12px;color:var(--text2)">${esc(m.mensaje||'')}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px">Por: ${esc(m.autor||'–')}</div>
      </div>`;
    });
    h += '</div>';
  }
  el.innerHTML = h;
}

// ─── USUARIOS ────────────────────────────────────────────────────────
function renderUsuarios() {
  if (!isSup()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">Sin permiso</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const usub = window._uSub || 'operadores';
  const q = (window._uQ || '').toLowerCase();
  const allU = DB.usuarios || [];
  const empresasU = allU.filter(u => u.rol === 'empresa');
  const operadoresU = allU.filter(u => u.rol !== 'empresa');
  let listBase = usub === 'empresas' ? empresasU : operadoresU;
  if (q) listBase = listBase.filter(u => `${u.nombre||''} ${u.username||''} ${u.email||''}`.toLowerCase().includes(q));
  const rolMap = { superadmin:'⭐ SA', supervisor:'🔑 Sup', controlador_rampa:'🚦 Ctrl', editor:'✏️ Ed', visor:'👁 Visor', empresa:'🏢 Empresa' };

  let h = `<div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:10px">
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${usub==='operadores'?'#3b82f6':'var(--bg2)'};color:${usub==='operadores'?'#fff':'var(--text3)'};border-right:1px solid var(--border)" onclick="window._uSub='operadores';window._op.renderUsuarios()">👤 Operadores (${operadoresU.length})</div>
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${usub==='empresas'?'#00896b':'var(--bg2)'};color:${usub==='empresas'?'#fff':'var(--text3)'}" onclick="window._uSub='empresas';window._op.renderUsuarios()">🏢 Empresas (${empresasU.length})</div>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
    <div class="sbox" style="flex:0 1 260px;min-width:140px"><span class="sico">🔍</span><input type="search" placeholder="Buscar nombre, email..." value="${esc(q)}" oninput="window._uQ=this.value;window._dbs('usr','renderUsuarios')" style="font-size:12px"></div>
    <span style="font-size:11px;color:var(--text3)">${listBase.length} usuarios</span>
    ${isSA()?'<button class="btn btn-p btn-sm" onclick="window._op.openUserModal(null)">+ Nuevo usuario</button>':''}
    ${isSA()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.importExcel(\'usuarios\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar</button>':''}
    ${isSA()?'<button class="btn btn-gh btn-sm" style="flex-shrink:0" onclick="window._op.dlTemplateUsuarios()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>' + '<button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'usuarios\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>':''}
  </div>`;

  if (!listBase.length) { h += '<div class="empty"><div class="ei">👥</div><div class="et">Sin usuarios</div></div>'; }
  else if (usub === 'empresas') {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Email</th><th>'+_M('driverLang')+'</th><th></th></tr></thead><tbody>';
    listBase.forEach(u => {
      h += `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td style="font-size:11px;color:var(--text3)">${esc(u.email||'–')}</td><td style="font-size:13px">${u.lang||'🌍'}</td><td><div style="display:flex;gap:2px">${isSA()||AppState.get('currentUser')?.id===u.id?`<button class="btn btn-edit btn-xs" onclick="window._op.openUserModal('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}${isSA()&&AppState.get('currentUser')?.id!==u.id?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminarUsuario('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}</div></td></tr>`;
    });
    h += '</tbody></table></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Nombre</th><th>Rol</th><th>'+_M('driverLang')+'</th><th>Pestañas</th><th></th></tr></thead><tbody>';
    const TN = { dash:'📊',ingresos:'🔖',ingresos2:'🚛',flota:'📦',conductores:'👤',agenda:'📅',analytics:'📈',vehiculos:'📜',auditoria:'📂',papelera:'🗑',impresion:'🖨',recintos:'🏟',eventos:'📅',mensajes:'📢',usuarios:'👥' };
    listBase.forEach(u => {
      const tabs = (u.tabs || DEFAULT_TABS[u.rol] || []).map(t => TN[t]||t).join(' ');
      h += `<tr><td style="font-weight:700">${esc(u.nombre)}</td><td><span class="pill pill-b" style="font-size:10px">${rolMap[u.rol]||esc(u.rol)}</span></td><td style="font-size:13px">${u.lang||'🌍'}</td><td style="font-size:11px">${tabs}</td><td><div style="display:flex;gap:2px">${isSA()||AppState.get('currentUser')?.id===u.id?`<button class="btn btn-edit btn-xs" onclick="window._op.openUserModal('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}${isSA()&&AppState.get('currentUser')?.id!==u.id?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminarUsuario('${u.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}</div></td></tr>`;
    });
    h += '</tbody></table></div>';
  }


  el.innerHTML = h;
}

// ─── CRUD OPERATIONS ──────────────────────────────────────────────────
const _user = () => AppState.get('currentUser');

async function _logEdit(action, mat, pos, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _user()?.nombre||'?', action, mat: normPlate(mat), pos, detail: detail||'' };
  DB.editHistory.unshift(entry);
  if (DB.editHistory.length > 500) DB.editHistory = DB.editHistory.slice(0, 500);
  await _saveOne('editHistory', entry);
}

async function _logPasswordChange(userId, userName, email) {
  const entry = { id: uid(), ts: nowLocal(), type: 'password_change', entity: 'sesion', userId, userName, email, action: 'cambio_contrasena' };
  if (!DB.auditLog) DB.auditLog = [];
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry).catch(e=>{});
  const pwChanges = DB.auditLog.filter(a => a.type === 'password_change');
  if (pwChanges.length > 500) {
    const XLSX = window.XLSX;
    if (XLSX) {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pwChanges), 'CambiosContrasena');
      XLSX.writeFile(wb, 'cambios_pass_' + new Date().toISOString().slice(0,10) + '.xlsx');
      toast('Auto-export: +500 cambios de contraseña', 'var(--amber)');
    }
  }
}

async function _logAudit(action, entity, detail) {
  const entry = { id: uid(), ts: nowLocal(), user: _user()?.nombre||'?', action, entity, detail: detail||'' };
  DB.auditLog.unshift(entry);
  await _saveOne('auditLog', entry);
}

// Generic CRUD helpers
function _getCol(col) { return DB[col] || []; }

function _nextPos(col) {
  const items = _getCol(col);
  if (!items.length) return '1';
  const maxPos = Math.max(...items.map(i => parseInt(i.pos)||0), 0);
  return String(maxPos + 1);
}

async function saveIngreso(data, col = 'ingresos') {
  if (!canEdit()) { toast('Sin permiso para editar', 'var(--red)'); return; }
  const isNew = !data.id;
  if (isNew) { data.id = uid(); data.pos = _nextPos(col); data.entrada = data.entrada || nowLocal(); data.creadoPor = _user()?.nombre||'?'; }
  data.eventoId = data.eventoId || DB.activeEventId;
  data.eventoNombre = data.eventoNombre || getActiveEvent()?.nombre || '';
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === data.id);
  if (idx >= 0) arr[idx] = data; else arr.push(data);
  await _saveOne(col, data);
  await _logEdit(isNew ? 'new' : 'edit', data.matricula, data.pos);
  AppState.set('lastIngreso', data);
  toast(isNew ? '✅ Entrada registrada' : '✅ Actualizado', 'var(--green)');
  goTab(curTab);
}

async function registrarSalida(id, col = 'ingresos') {
  if (!canEdit()) { toast(_M('noPermImport'), 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  item.salida = nowLocal();
  await _saveOne(col, item);
  await _logEdit('salida', item.matricula, item.pos);
  toast('↩ Salida registrada', 'var(--blue)');
  goTab(curTab);
}

async function reactivar(id, col = 'ingresos') {
  if (!canEdit()) { toast(_M('noPermImport'), 'var(--red)'); return; }
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  delete item.salida;
  await _saveOne(col, item);
  await _logEdit('reactivar', item.matricula, item.pos);
  toast('↺ Reactivado', 'var(--blue)');
  goTab(curTab);
}

async function eliminar(id, col) {
  if (!isSA()) { toast('SuperAdmin', 'var(--red)'); return; }
  if (!confirm(_M('delete')+'?')) return;
  const arr = _getCol(col);
  const idx = arr.findIndex(x => x.id === id); if (idx < 0) return;
  const item = arr[idx];
  const trash = { id: uid(), origen: col, item: clone(item), borradoPor: _user()?.nombre||'?', ts: nowLocal() };
  DB.papelera.push(trash);
  await _saveOne('papelera', trash);
  arr.splice(idx, 1);
  await _deleteOne(col, id);
  await _logEdit('delete', item.matricula||item.nombre||id, item.pos||'');
  toast('🗑 Eliminado', 'var(--red)');
  goTab(curTab);
}

async function restaurar(trashId) {
  const idx = DB.papelera.findIndex(x => x.id === trashId); if (idx < 0) return;
  const t = DB.papelera[idx];
  const item = t.item;
  const col = t.origen;
  if (!_getCol(col).find(x => x.id === item.id)) {
    _getCol(col).push(item);
    await _saveOne(col, item);
  }
  DB.papelera.splice(idx, 1);
  await _deleteOne('papelera', trashId);
  toast('↩ Restaurado', 'var(--green)');
  renderPapelera();
}

async function vaciarPapelera() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm(`¿Vaciar papelera (${DB.papelera.length} elementos)?`)) return;
  const ops = DB.papelera.map(p => ({ type:'delete', path:`papelera/${p.id}` }));
  if (ops.length) await fsBatch(ops);
  DB.papelera = [];
  toast('💥 Papelera vaciada', 'var(--red)');
  renderPapelera();
}

async function vaciarHistorial() {
  if (!isSA()) return;
  if (!confirm('¿Vaciar historial de modificaciones?')) return;
  DB.editHistory = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) await fsBatch((await fsGetAll(`events/${ev.id}/editHistory`)).map(e => ({ type:'delete', path:`events/${ev.id}/editHistory/${e.id}` })));
  toast('💥 Historial vaciado', 'var(--red)');
  renderVehiculos();
}

async function vaciarTab(col) {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  const names = { ingresos:'Referencias', ingresos2:'Ingresos', movimientos:'Embalaje', agenda:'Agenda', conductores:'Conductores' };
  if (!confirm(`¿Vaciar ${names[col]||col}? Backup antes.`)) return;
  DB[col] = [];
  const ev = AppState.get('currentEvent');
  if (ev?.id) {
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('limpiar_tab', col, 'Vaciado por ' + (_user()?.nombre||'?'));
  toast(`💥 ${names[col]||col} vaciado`, 'var(--amber)');
  goTab(curTab);
}

async function setFlotaStatus(id, status) {
  const item = DB.movimientos.find(x => x.id === id); if (!item) return;
  item.status = status;
  await _saveOne('movimientos', item);
}

async function setAgendaEstado(id, estado) {
  const item = DB.agenda.find(x => x.id === id); if (!item) return;
  item.estado = estado;
  await _saveOne('agenda', item);
  renderAgenda();
}


function seleccionarEventoTrabajo(id) {
  DB.userWorkEventId = id;
  const ev = DB.eventos.find(e => e.id === id);
  // Save per-user work event in their Firestore doc
  const cu = AppState.get('currentUser');
  if (cu) {
    cu.workEventId = id;
    AppState.set('currentUser', cu);
    fsSet('users/' + cu.id, { ...cu, workEventId: id }, false).catch(e=>{});
  }
  // Use this event for new entries
  DB.activeEventId = id;
  AppState.set('currentEvent', ev || null);
  toast('✅ Trabajando en: ' + (ev?.nombre || id), 'var(--green)');
  renderEventosTab(); renderHdr();
}

async function activarEvento(id) {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para activar eventos','var(--red)'); return; }
  DB.activeEventId = id;
  const ev = DB.eventos.find(e => e.id === id) || null;
  AppState.set('currentEvent', ev);
  await fsSet('config/activeEvent', { id }, false);
  await _logAudit('activar_evento', 'eventos', id);
  toast('▶ Evento activado', 'var(--green)');
  renderEventosTab(); renderHdr();
}

async function desactivarEvento() {
  if (!isSA() && !hasPerm('canActivate')) { toast('Sin permiso para desactivar eventos','var(--red)'); return; }
  DB.activeEventId = null;
  AppState.set('currentEvent', null);
  await fsSet('config/activeEvent', { id: null }, false);
  toast('⏹ Evento desactivado', 'var(--amber)');
  renderEventosTab(); renderHdr();
}

async function marcarMsgLeido(id) {
  const msg = DB.mensajesRampa.find(x => x.id === id); if (!msg) return;
  if (!msg.leido) msg.leido = [];
  if (!msg.leido.includes(SID)) msg.leido.push(SID);
  await _saveOne('mensajesRampa', msg);
  renderHdr(); _renderMensajesInline(document.getElementById('tabContent'));
}

async function resetAllData() {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (!confirm('⚠️ BORRAR TODOS LOS DATOS del evento activo.\nEsta acción NO se puede deshacer.\nHaz un backup Excel primero.')) return;
  const ev = AppState.get('currentEvent');
  if (!ev?.id) { toast('Sin evento activo', 'var(--amber)'); return; }
  for (const col of ['ingresos','ingresos2','movimientos','conductores','agenda','mensajes','editHistory']) {
    DB[col] = [];
    const all = await fsGetAll(`events/${ev.id}/${col}`);
    if (all.length) await fsBatch(all.map(e => ({ type:'delete', path:`events/${ev.id}/${col}/${e.id}` })));
  }
  await _logAudit('reset_total', 'all', ev.nombre);
  toast('💥 Datos del evento eliminados', 'var(--red)');
  goTab('dash');
}

// ─── EXPORT EXCEL ─────────────────────────────────────────────────────
async function exportExcel(col) {
  if (!canExport()) { toast(_M('noPermImport'), 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => exportExcel(col); document.head.appendChild(s); return;
  }
  const data = DB[col] || [];
  if (!data.length) { toast('Sin datos para exportar', 'var(--amber)'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), col);
  const fn = `${col}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  DB.exportLog = DB.exportLog || [];
  const entry = { id:uid(), ts:nowLocal(), user:_user()?.nombre||'?', rol:_user()?.rol||'?', tab:col, filename:fn };
  DB.exportLog.unshift(entry);
  await _saveOne('exportLog', entry);
  toast(`📥 Exportado: ${fn}`, 'var(--blue)');
}

async function exportAuditLog() {
  if (!isSA()) return;
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>exportAuditLog();document.head.appendChild(s);return; }
  const wb = XLSX.utils.book_new();
  const sess = (DB.auditLog||[]).filter(e=>e.entity==='sesion');
  const acts = (DB.auditLog||[]).filter(e=>e.entity!=='sesion');
  if (sess.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sess), 'Sesiones');
  if (acts.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(acts), 'Acciones');
  if ((DB.exportLog||[]).length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(DB.exportLog), 'Exportaciones');
  const fn = `auditoria_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast('✅ Audit log exportado', 'var(--green)');
}

async function importExcel(inp, col) {
  if (!canImport()) { toast(_M('noPermImport'), 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') { const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>importExcel(inp,col);document.head.appendChild(s);return; }
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval:'' });
      let added = 0;
      for (const row of rows) {
        const mat = normPlate(row.Matricula || row.matricula || '');
        if (!mat) continue;
        const item = { ...row, id: uid(), matricula: mat, pos: _nextPos(col), creadoPor:'Import', entrada: row.entrada||nowLocal() };
        _getCol(col).push(item);
        await _saveOne(col, item);
        added++;
      }
      toast(`✅ ${added} importados`, 'var(--green)');
      goTab(curTab);
    } catch(err) { toast('❌ ' + err.message, 'var(--red)'); }
    inp.value = '';
  };
  r.readAsBinaryString(f);
}

// ─── SIMPLE MODALS (inline forms) ─────────────────────────────────────
function _modal(title, bodyHtml, onSave) {
  const id = 'dynModal';
  const existing = document.getElementById(id); if (existing) existing.remove();
  const bg = document.createElement('div');
  bg.id = id; bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal-box">
    <div class="modal-hdr"><div class="modal-ttl">${title}</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="document.getElementById('${id}').remove()">✕</button></div>
    ${bodyHtml}
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn btn-gh btn-sm" onclick="document.getElementById('${id}').remove()">Cancelar</button>
      <button class="btn btn-p btn-sm" id="dynModalSave">Guardar</button>
    </div>
  </div>`;
  document.body.appendChild(bg);
  document.getElementById('dynModalSave').onclick = async () => {
    try {
      await onSave();
      document.getElementById(id)?.remove();
    } catch(e) {
      console.error('[modal save]', e);
    }
  };
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  setTimeout(() => bg.querySelector('input,select,textarea')?.focus(), 100);
}

function gv(id) { return (document.getElementById(id)?.value || '').trim(); }

function openIngModal(id, col = 'ingresos') {
  const existing = id ? _getCol(col).find(x => x.id === id) : null;
  const i = existing || {};
  const langOpts = [
    ['es','Español'],['ca','Català'],['eu','Euskara'],['gl','Galego'],
    ['en','English'],['fr','Français'],['de','Deutsch'],['it','Italiano'],
    ['pt','Português'],['pl','Polski'],['ro','Română'],['nl','Nederlands'],
    ['hu','Magyar'],['cs','Čeština'],['hr','Hrvatski'],['uk','Українська'],
    ['ru','Русский'],['tr','Türkçe'],['ar','عربية'],['sv','Svenska'],
    ['fi','Suomi'],['el','Ελληνικά'],['bg','Български'],['sk','Slovenčina'],['sl','Slovenščina'],
  ].map(([v,l])=>`<option value="${v}" ${(i.lang||'es')===v?'selected':''}>${l}</option>`).join('');
  const tvOpts = [['','— Tipo —'],['trailer','🚛 Trailer'],['semiremolque','🚚 Semiremolque'],['camion','🚗 Camión'],['furgoneta','🚐 Furgoneta'],['otro','📦 Otro']]
    .map(([v,l])=>`<option value="${v}" ${(i.tipoVehiculo||'')===v?'selected':''}>${l}</option>`).join('');
  const dcOpts = [['','— Descarga —'],['mano','🤲 Manual'],['maquinaria','🏗 Maquinaria'],['mixto','Mixto']]
    .map(([v,l])=>`<option value="${v}" ${(i.descargaTipo||'')===v?'selected':''}>${l}</option>`).join('');
  _modal(existing ? _M('editEntry') : _M('newEntry'), `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">${_L('Mat')} <span class="freq">*</span></label><div style="display:flex;gap:4px"><input id="mMat" value="${esc(i.matricula||'')}" style="text-transform:uppercase;flex:1" placeholder="AB1234CD"><button type="button" class="btn btn-gh" onclick="window._op.openCamScan()" style="padding:4px 10px;flex-shrink:0" title="Escanear matrícula">📷</button></div></div>
      <div class="fg"><label class="flbl">${_L('Rem')}</label><input id="mRem" value="${esc(i.remolque||'')}" placeholder="TR5678X"></div>
      <div class="fg"><label class="flbl">${_L('Nom')}</label><input id="mNom" value="${esc(i.nombre||'')}" placeholder="Juan"></div>
      <div class="fg"><label class="flbl">${_L('Ape')}</label><input id="mApe" value="${esc(i.apellido||'')}" placeholder="García"></div>
      <div class="fg"><label class="flbl">${_L('Emp')}</label><input id="mEmp" value="${esc(i.empresa||'')}" placeholder="Empresa SL"></div>
      <div class="fg"><label class="flbl">${_L('Hal')}</label><input id="mHall" value="${esc(i.hall||'')}" placeholder="5A"></div>
      <div class="fg"><label class="flbl">${_L('Std')}</label><input id="mStand" value="${esc(i.stand||'')}" placeholder="A-101"></div>
      <div class="fg"><label class="flbl">${_L('PuH')}</label><input id="mPuerta" value="${esc(i.puertaHall||'')}" placeholder="P3"></div>
      <div class="fg"><label class="flbl">${_L('Cal')}</label><input id="mRef" value="${esc(i.llamador||i.referencia||'')}" placeholder="12345"></div>
      <div class="fg"><label class="flbl">${_M('refBooking')}</label><input id="mBooking" value="${esc(i.ref||i.referencia||'')}" placeholder="REF-001"></div>
      <div class="fg"><label class="flbl">${_L('Mon')}</label><input id="mMont" value="${esc(i.montador||'')}" placeholder="Montaje SL"></div>
      <div class="fg"><label class="flbl">${_L('Exp')}</label><input id="mExpo" value="${esc(i.expositor||'')}" placeholder="Expo SL"></div>
      <div class="fg"><label class="flbl">${_L('Tel')}</label><input id="mTel" value="${esc(i.telefono||'')}" placeholder="+34 600000000"></div>
      <div class="fg"><label class="flbl">${_L('Eml')}</label><input id="mEmail" type="email" value="${esc(i.email||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Pas')}</label><input id="mPas" value="${esc(i.pasaporte||'')}"></div>
      <div class="fg"><label class="flbl">${_L('FechaNac')}</label><input id="mFnac" type="date" value="${esc(i.fechaNacimiento||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Pais')}</label><input id="mPais" value="${esc(i.pais||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Tipo')}</label><select id="mTipoV">${tvOpts}</select></div>
      <div class="fg"><label class="flbl">${_L('Descarga')}</label><select id="mDesc">${dcOpts}</select></div>
      <div class="fg"><label class="flbl">${_L('Ent')}</label><input id="mHorario" value="${esc(i.horario||'')}" placeholder="09:45"></div>
      <div class="fg"><label class="flbl">${_M('driverLang')}</label><select id="mLang">${langOpts}</select></div>
    </div>
    <div class="fg" style="margin-top:4px"><label class="flbl">${_M('comment')}</label><textarea id="mComent" rows="2">${esc(i.comentario||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('mMat'));
    if (!mat) { toast(_M('plateMandatory'), 'var(--red)'); return; }
    const data = {
      id: i.id || uid(),
      matricula: mat, remolque: gv('mRem'), nombre: gv('mNom'), apellido: gv('mApe'),
      empresa: gv('mEmp'), hall: gv('mHall'), halls: [gv('mHall')].filter(Boolean),
      stand: gv('mStand'), puertaHall: gv('mPuerta'),
      llamador: gv('mRef'), referencia: gv('mBooking'), ref: gv('mBooking'),
      montador: gv('mMont'), expositor: gv('mExpo'),
      telefono: gv('mTel'), email: gv('mEmail'),
      pasaporte: gv('mPas'), fechaNacimiento: gv('mFnac'), pais: gv('mPais'),
      tipoVehiculo: gv('mTipoV'), descargaTipo: gv('mDesc'),
      horario: gv('mHorario'), lang: gv('mLang') || 'es',
      comentario: gv('mComent'),
      entrada: i.entrada || nowLocal(), pos: i.pos || _nextPos(col),
      eventoId: DB.activeEventId, eventoNombre: getActiveEvent()?.nombre||'',
      creadoPor: _user()?.nombre || '?',
    };
    // Check lista negra before saving
    const _bl = checkBL(mat);
    if (_bl) {
      if (_bl.nivel === 'bloqueo') {
        if (!confirm(`${_M('blocked')}\n${mat}\n${_M('reason')}: ${_bl.motivo}\n\n${_M('continueQ')}`)) return;
      } else {
        toast(`⭐ ${mat} ${_M('specialList')}: ${_bl.motivo}`, 'var(--amber)');
      }
    }
    await saveIngreso(data, col);
  });
}

function openFlotaModal(id) {
  const existing = id ? DB.movimientos.find(x => x.id === id) : null;
  const i = existing || {};
  _modal(existing ? _M('editVeh') : _M('newVeh'), `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">${_L('Mat')} <span class="freq">*</span></label><input id="fMat" value="${esc(i.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">${_M('position')}</label><input id="fPos" value="${esc(i.posicion||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Rem')}</label><input id="fRem" value="${esc(i.remolque||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Emp')}</label><input id="fEmp" value="${esc(i.empresa||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Hal')}</label><input id="fHall" value="${esc(i.hall||'')}"></div>
      <div class="fg"><label class="flbl">${_M('cargoType')}</label><input id="fCarga" value="${esc(i.tipoCarga||'')}"></div>
      <div class="fg"><label class="flbl">${_M('status')}</label><select id="fStatus">${['ALMACEN','SOT','FIRA','FINAL'].map(s=>`<option value="${s}" ${i.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
  `, async () => {
    const mat = normPlate(gv('fMat')); if (!mat) { toast(_M('plateMandatory'),'var(--red)');return; }
    const data = { id:i.id||uid(), matricula:mat, posicion:gv('fPos'), remolque:gv('fRem'), empresa:gv('fEmp'), hall:gv('fHall'), tipoCarga:gv('fCarga'), status:gv('fStatus') };
    if (!DB.movimientos.find(x=>x.id===data.id)) DB.movimientos.push(data); else { const idx=DB.movimientos.findIndex(x=>x.id===data.id); if(idx>=0)DB.movimientos[idx]=data; }
    await _saveOne('movimientos', data);
    toast(_M('saved'),'var(--green)');
    renderFlota();
  });
}

function openCondModal(id) {
  const existing = id ? DB.conductores.find(x => x.id === id) : null;
  const c = existing || {};
  _modal(existing ? _M('editDriver') : _M('newDriver'), `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">${_L('Nom')} <span class="freq">*</span></label><input id="cNom" value="${esc(c.nombre||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Ape')}</label><input id="cApe" value="${esc(c.apellido||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Mat')}</label><input id="cMat" value="${esc(c.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">${_L('Emp')}</label><input id="cEmp" value="${esc(c.empresa||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Tel')}</label><input id="cTel" value="${esc(c.telefono||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Pas')}</label><input id="cPass" value="${esc(c.pasaporte||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Pais')}</label><input id="cPais" value="${esc(c.pais||'')}"></div>
    </div>
  `, async () => {
    const nom = gv('cNom'); if (!nom) { toast(_L('Nom')+' ⚠','var(--red)');return; }
    const data = { id:c.id||uid(), nombre:nom, apellido:gv('cApe'), matricula:normPlate(gv('cMat')), empresa:gv('cEmp'), telefono:gv('cTel'), pasaporte:gv('cPass'), pais:gv('cPais') };
    if (!DB.conductores.find(x=>x.id===data.id)) DB.conductores.push(data); else { const idx=DB.conductores.findIndex(x=>x.id===data.id); if(idx>=0)DB.conductores[idx]=data; }
    await _saveOne('conductores', data);
    toast(_M('saved'),'var(--green)');
    renderConductores();
  });
}

function openAgendaModal(id) {
  const existing = id ? DB.agenda.find(x => x.id === id) : null;
  const a = existing || {};
  const today = new Date().toISOString().slice(0, 10);
  _modal(existing ? _M('editBooking') : _M('newBooking'), `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">${_L('Mat')} <span class="freq">*</span></label><input id="aMat" value="${esc(a.matricula||'')}" style="text-transform:uppercase"></div>
      <div class="fg"><label class="flbl">${_M('date')}</label><input id="aFecha" type="date" value="${a.fecha||today}"></div>
      <div class="fg"><label class="flbl">${_M('schedTime')}</label><input id="aHora" type="time" value="${a.hora||''}"></div>
      <div class="fg"><label class="flbl">${_L('Emp')}</label><input id="aEmp" value="${esc(a.empresa||a.conductor||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Ref')}</label><input id="aRef" value="${esc(a.referencia||'')}"></div>
      <div class="fg"><label class="flbl">${_L('Hal')}</label><input id="aHall" value="${esc(a.hall||'')}"></div>
      <div class="fg"><label class="flbl">'+_M('status')+'</label><select id="aEst"><option>PENDIENTE</option><option>HECHO</option><option>CANCELADO</option></select></div>
    </div>
    <div class="fg"><label class="flbl">${_M('notes')}</label><textarea id="aNotas" rows="2">${esc(a.notas||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('aMat')); if (!mat) { toast(_M('plateMandatory'),'var(--red)');return; }
    const data = { id:a.id||uid(), matricula:mat, fecha:gv('aFecha'), hora:gv('aHora'), empresa:gv('aEmp'), conductor:gv('aEmp'), referencia:gv('aRef'), hall:gv('aHall'), estado:gv('aEst'), notas:gv('aNotas'), eventoId:DB.activeEventId };
    if (!DB.agenda.find(x=>x.id===data.id)) DB.agenda.push(data); else { const idx=DB.agenda.findIndex(x=>x.id===data.id); if(idx>=0)DB.agenda[idx]=data; }
    await _saveOne('agenda', data);
    toast(_M('saved'),'var(--green)');
    renderAgenda();
  });
  if (existing) { setTimeout(()=>{ document.getElementById('aEst').value = a.estado||'PENDIENTE'; }, 50); }
}

function openEventoModal(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  const existing = id ? DB.eventos.find(x => x.id === id) : null;
  const ev = existing || {};
  _modal(existing ? _M('editEvent') : _M('newEvent'), `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Nombre <span class="freq">*</span></label><input id="evNom" value="${esc(ev.nombre||'')}"></div>
      <div class="fg"><label class="flbl">Icono (emoji)</label><input id="evIco" value="${esc(ev.ico||'📋')}" placeholder="📋"></div>
      <div class="fg"><label class="flbl">${_M('startDate')}</label><input id="evIni" type="date" value="${ev.ini||''}"></div>
      <div class="fg"><label class="flbl">${_M('endDate')}</label><input id="evFin" type="date" value="${ev.fin||''}"></div>
      <div class="fg"><label class="flbl">"+_M("venues")+"</label><input id="evRec" value="${esc(ev.recinto||'')}"></div>
      <div class="fg"><label class="flbl">"+_M("position")+"</label><input id="evCiu" value="${esc(ev.ciudad||'')}"></div>
    </div>
  `, async () => {
    const nom = gv('evNom'); if (!nom) { toast(_M('plateMandatory'),'var(--red)');return; }
    const data = { id:ev.id||uid(), nombre:nom, ico:gv('evIco')||'📋', ini:gv('evIni'), fin:gv('evFin'), recinto:gv('evRec'), ciudad:gv('evCiu') };
    if (!DB.eventos.find(x=>x.id===data.id)) DB.eventos.push(data); else { const idx=DB.eventos.findIndex(x=>x.id===data.id); if(idx>=0)DB.eventos[idx]=data; }
    await fsSet(`events/${data.id}`, data, true);
    toast('✅ Evento guardado','var(--green)');
    renderEventosTab();
  });
}

function openRecintoModal(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  const existing = id ? DB.recintos.find(x => x.id === id) : null;
  const r = existing || {};
  _modal(existing ? 'Editar recinto' : ''+_M('newVenue')+'', `
    <div class="fg"><label class="flbl">Nombre <span class="freq">*</span></label><input id="rNom" value="${esc(r.nombre||'')}"></div>
    <div class="fg"><label class="flbl">"+_M("position")+"</label><input id="rCiu" value="${esc(r.ciudad||'')}"></div>
    <div class="fg"><label class="flbl">País</label><input id="rPais" value="${esc(r.pais||'')}"></div>
    <div class="fg"><label class="flbl">Dirección</label><input id="rDir" value="${esc(r.direccion||'')}"></div>
    <div class="fg"><label class="flbl">Puertas (separadas por coma)</label><input id="rPuertas" value="${esc((r.puertas||[]).map(p=>p.nombre).join(','))}" placeholder="Puerta 1, Puerta 2"></div>
  `, async () => {
    const nom = gv('rNom'); if (!nom) { toast(_M('plateMandatory'),'var(--red)');return; }
    const puertas = gv('rPuertas').split(',').map(s=>s.trim()).filter(Boolean).map(s=>({id:uid(),nombre:s}));
    const data = { id:r.id||uid(), nombre:nom, ciudad:gv('rCiu'), pais:gv('rPais'), direccion:gv('rDir'), puertas };
    if (!DB.recintos.find(x=>x.id===data.id)) DB.recintos.push(data); else { const idx=DB.recintos.findIndex(x=>x.id===data.id); if(idx>=0)DB.recintos[idx]=data; }
    await fsSet(`recintos/${data.id}`, data, false);
    toast('✅ Recinto guardado','var(--green)');
    renderRecintos();
  });
}

function openUserModal(id) {
  if (!isSA() && AppState.get('currentUser')?.id !== id) { toast(_M('noPermImport'),'var(--red)'); return; }
  const existing = id ? DB.usuarios.find(x => x.id === id) : null;
  const u = existing || {};
  const rol = u.rol || 'supervisor';
  const defTabs = DEFAULT_TABS[rol] || DEFAULT_TABS.visor || [];
  const userTabs = u.tabs || defTabs;

  const PERMS = [
    ['canAdd',         '➕ Añadir registros',       'Crear nuevos ingresos / referencias'],
    ['canEdit',        '✏️ Editar registros',         'Modificar datos existentes'],
    ['canDel',         '🗑 Eliminar registros',       'Borrar ingresos (van a papelera)'],
    ['canStatus',      '↩ Marcar estado',             'Registrar entrada / salida'],
    ['canPrint',       '🖨 Imprimir pase',            'Imprimir y troquelado'],
    ['canImport',      '📥 Importar Excel',           'Importar registros masivos'],
    ['canExport',      '⬇ Exportar Excel',           'Descargar listas'],
    ['canClean',       '🗑 Limpiar tab',             'Borrar registros del día'],
    ['canSpecial',     '⭐ Lista especial',           'Gestionar blacklist'],
    ['canSaveTpl',     '💾 Guardar plantilla',        'Crear/modificar plantillas impresión'],
    ['canDelTpl',      '🔄 '+_M('delete')+'',       'Borrar plantillas y resetear canvas'],
    ['canMensajes',    '📢 Mensajes rampa',           'Enviar mensajes al panel'],
    ['canCampos',      '⚙ Configurar campos',        'Mostrar/ocultar campos por evento'],
    ['canActivate',    '▶ Activar evento',           'Activar/desactivar evento global'],
  ];

  const isFull = rol === 'superadmin' || rol === 'supervisor';
  const permsHtml = PERMS.map(([pk, label, desc]) => {
    const checked = isFull || !!(u.permisos?.[pk]);
    const dis = isFull ? 'opacity:.5;pointer-events:none' : '';
    return `<tr style="border-bottom:0.5px solid var(--border)">
      <td style="padding:5px 7px;font-weight:600;font-size:11px">${label}</td>
      <td style="padding:5px 7px;color:var(--text3);font-size:10px">${desc}</td>
      <td style="padding:5px 7px;text-align:center">
        <label class="tgl ${checked?'on':''}" id="tgl_${pk}" style="${dis}">
          <input type="checkbox" id="fp_${pk}" ${checked?'checked':''} ${isFull?'disabled':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
          <span style="padding:2px 8px">${checked?'ON':'—'}</span>
        </label>
      </td></tr>`;
  }).join('');

  const tabsHtml = TAB_DEFS.map(t => {
    const on = userTabs.includes(t.id);
    return `<label class="tgl ${on?'on':''}" id="tgl_tab_${t.id}">
      <input type="checkbox" id="ft_${t.id}" ${on?'checked':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
      <span>${t.ico} ${t.label}</span>
    </label>`;
  }).join('');

  _modal(existing ? _M('editUser') : _M('newUser'), `
    <div class="sg sg2">
      <div class="fg" style="grid-column:1/-1"><label class="flbl">"+_L("Nom")+" "+_L("Ape")+" <span class="freq">*</span></label><input id="uNom" value="${esc(u.nombre||'')}"></div>
      <div class="fg"><label class="flbl">"+_M("name")+" <span class="freq">*</span></label><input id="uUsername" value="${esc(u.username||'')}"></div>
      <div class="fg"><label class="flbl">"+_L("Eml")+" (2FA)</label><input id="uEmail" type="email" value="${esc(u.email||'')}"></div>
      ${!existing?`
      <div class="fg"><label class="flbl">"+_M("password")+"</label>
        <div style="position:relative;display:flex;align-items:center">
          <input id="uPass" type="password" placeholder="mín. 8 caracteres" style="padding-right:36px;width:100%">
          <button type="button" onclick="(function(){var i=document.getElementById('uPass');i.type=i.type==='password'?'text':'password';})()" style="position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text3);display:flex">${EYE_SVG}</button>
        </div>
      </div>
      <div class="fg"><label class="flbl">PIN (mín. 6 dígitos)</label>
        <div style="position:relative;display:flex;align-items:center">
          <input id="uPin" type="password" maxlength="8" inputmode="numeric" placeholder="------" style="padding-right:36px;width:100%">
          <button type="button" onclick="(function(){var i=document.getElementById('uPin');i.type=i.type==='password'?'text':'password';})()" style="position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text3);display:flex">${EYE_SVG}</button>
        </div>
      </div>`:''}
      <div class="fg"><label class="flbl">Idioma</label>
        <select id="uLang">${['es','ca','eu','gl','en','fr','de','it','pt','pl','ro','nl','hu','cs','hr','uk','ru','tr','ar','sv','fi','el','bg','sk','sl'].map(l=>`<option value="${l}" ${(u.lang||'es')===l?'selected':''}>${l.toUpperCase()}</option>`).join('')}</select>
      </div>
      <div class="fg"><label class="flbl">Rol <span class="freq">*</span></label>
        <select id="uRol" onchange="window._op.onRolChange(this.value)">
          ${isSA()?`<option value="superadmin" ${rol==='superadmin'?'selected':''}>⭐ SuperAdmin</option>`:''}
          ${['supervisor','controlador_rampa','editor','visor','empresa'].map(r=>`<option value="${r}" ${rol===r?'selected':''}>${{supervisor:'🔑 Supervisor',controlador_rampa:'🚦 Controlador Rampa',editor:'✏️ Editor',visor:'👁 Visor',empresa:'🏢 Empresa'}[r]}</option>`).join('')}
        </select>
      </div>
      <div class="fg" style="grid-column:1/-1;display:flex;align-items:center;gap:10px">
        <label class="tgl ${u.twoFA?'on':''}" id="tgl2FA">
          <input type="checkbox" id="fu2FA" ${u.twoFA?'checked':''} onchange="this.closest('.tgl').classList.toggle('on',this.checked)">
          <span>✉️ Verificación 2FA por email</span>
        </label>
        <span style="font-size:10px;color:var(--text3)">Requiere email configurado</span>
      </div>
    </div>
    <div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:10px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Permisos</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:var(--bg2)">
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Acción</th>
        <th style="padding:4px 7px;text-align:left;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Descripción</th>
        <th style="padding:4px 7px;text-align:center;font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;border-bottom:1px solid var(--border)">Activo</th>
      </tr></thead><tbody>${permsHtml}</tbody></table>
    </div>
    <div style="margin-top:10px;background:var(--bg3);border-radius:var(--r);padding:10px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Pestañas habilitadas</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px" id="tabToggleGrid">${tabsHtml}</div>
    </div>
  `, async () => {
    const nom = gv('uNom'); if (!nom) { toast(_M('plateMandatory'),'var(--red)'); return; }
    const rol2 = gv('uRol');
    const tabs = [...document.querySelectorAll('#tabToggleGrid input:checked')].map(x => x.id.replace('ft_',''));
    const pin  = gv('uPin');
    const pass = gv('uPass');
    const email = gv('uEmail');
    const twoFA = document.getElementById('fu2FA')?.checked || false;
    const permisos = {};
    PERMS.forEach(([pk]) => { permisos[pk] = document.getElementById('fp_'+pk)?.checked || false; });

    const btn = document.querySelector('#dynModal .btn-p');
    if (btn) { btn.disabled=true; btn.textContent='Guardando…'; }

    try {
      let userId = u.id || uid();
      if (!existing && email && pass && pass.length >= 8) {
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
          const { getBEUAuth } = await import('../firestore.js');
          const cred = await createUserWithEmailAndPassword(getBEUAuth(), email, pass);
          await updateProfile(cred.user, { displayName: nom });
          userId = cred.user.uid;
        } catch(e) {
          if (e.code !== 'auth/email-already-in-use') {
            toast('❌ Error Firebase: ' + e.message, 'var(--red)');
            if (btn) { btn.disabled=false; btn.textContent='Guardar'; }
            return;
          }
        }
      }
      const data = { id:userId, nombre:nom, username:gv('uUsername'), email, rol:rol2, lang:gv('uLang'), tabs, twoFA, permisos };
      if (pin && pin.length >= 4) {
        const { hashPin: hp, uid: _uid } = await import('../utils.js');
        const salt = _uid();
        data.pinHash = await hp(pin, salt);
        data.pinSalt = salt;
      }
      const idx2 = DB.usuarios.findIndex(x=>x.id===data.id);
      if (idx2>=0) DB.usuarios[idx2]=data; else DB.usuarios.push(data);
      await fsSet('users/'+data.id, data, false);
      toast('✅ Usuario guardado','var(--green)');
      renderUsuarios();
    } catch(e) {
      toast('❌ ' + e.message, 'var(--red)');
      if (btn) { btn.disabled=false; btn.textContent='Guardar'; }
    }
  });
}
function eliminarUsuario(id) {
  if (!isSA()) { toast('Solo SA','var(--red)'); return; }
  if (!confirm('¿Eliminar usuario?')) return;
  DB.usuarios = DB.usuarios.filter(u => u.id !== id);
  fsDel(`users/${id}`);
  toast('🗑 Eliminado','var(--red)');
  renderUsuarios();
}

function openMsgModal() {
  _modal('Nuevo mensaje de rampa', `
    <div class="fg"><label class="flbl">Título <span class="freq">*</span></label><input id="msgTtl" placeholder="..."></div>
    <div class="fg"><label class="flbl">Tipo</label><select id="msgTipo"><option value="info">ℹ️ Info</option><option value="alerta">⚠️ Alerta</option><option value="urgente">🚨 Urgente</option><option value="ok">✅ OK</option></select></div>
    <div class="fg"><label class="flbl">Matrícula (opcional)</label><input id="msgMat" placeholder="AB1234CD" style="text-transform:uppercase"></div>
    <div class="fg"><label class="flbl">"+_M("messages")+"</label><textarea id="msgBody" rows="3"></textarea></div>
  `, async () => {
    const ttl = gv('msgTtl'); if (!ttl) { toast('Título obligatorio','var(--red)');return; }
    const msg = { id:uid(), ts:nowLocal(), autor:_user()?.nombre||'?', tipo:gv('msgTipo'), titulo:ttl, matricula:normPlate(gv('msgMat')), mensaje:gv('msgBody'), leido:[SID], pausado:false };
    DB.mensajesRampa.unshift(msg);
    await _saveOne('mensajesRampa', msg);
    renderHdr();
    _renderMensajesInline(document.getElementById('tabContent'));
    toast('📢 Mensaje enviado','var(--blue)');
  });
}

function showDetalle(id, col = 'ingresos') {
  const item = _getCol(col).find(x => x.id === id); if (!item) return;
  const fields = [
    ['Matrícula', item.matricula], ['Posición', item.pos], ['Remolque', item.remolque],
    ['Nombre', (item.nombre||'') + ' ' + (item.apellido||'')], ['Empresa', item.empresa],
    ['Montador', item.montador], ['Expositor', item.expositor], ['Hall', item.hall],
    ['Stand', item.stand], ['Referencia', item.referencia||item.llamador], ['Teléfono', item.telefono],
    ['Pasaporte', item.pasaporte], ['Email', item.email], ['País', item.pais],
    ['Tipo Vehículo', item.tipoVehiculo], ['Descarga', item.descargaTipo],
    ['Tipo Carga', item.tipoCarga], ['Comentario', item.comentario],
    ['Hora entrada', fmt(item.entrada)], ['Hora salida', item.salida ? fmt(item.salida) : '—'],
    ['Creado por', item.creadoPor], ['Evento', item.eventoNombre],
  ].filter(([,v]) => v && String(v).trim());

  const body = `<div class="sg sg2" style="gap:6px">
    ${fields.map(([l,v]) => `<div style="padding:5px 8px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:1px">${l}</div><div style="font-weight:600">${esc(String(v))}</div></div>`).join('')}
  </div>
  <div style="display:flex;gap:4px;margin-top:12px;flex-wrap:wrap">
    ${canEdit()&&!item.salida?`<button class="btn btn-warning btn-sm" onclick="window._op.registrarSalida('${id}','${col}');document.getElementById('dynModal')?.remove()">↩ Registrar Salida</button>`:''}
    ${canEdit()?`<button class="btn btn-edit btn-sm" onclick="document.getElementById('dynModal')?.remove();window._op.openIngModal('${id}','${col}')">✏️ ${_M('edit')}</button>`:''}
    ${isSA()?`<button class="btn btn-danger btn-sm" onclick="document.getElementById('dynModal')?.remove();window._op.eliminar('${id}','${col}')">🗑 Eliminar</button>`:''}
  </div>`;

  const div = document.createElement('div');
  div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box"><div class="modal-hdr"><div class="modal-ttl"><span class="mchip" style="font-size:14px;margin-right:8px">${esc(item.matricula)}</span>${esc(item.empresa||'–')}</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>${body}</div>`;
  document.getElementById('dynModal')?.remove();
  document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

// ─── THEME ────────────────────────────────────────────────────────────
const THEME_ORDER = ['light','dark','soft','contrast'];
const THEME_ICONS = {light:'☀️', dark:'🌙', soft:'🌅', contrast:'⚡'};
const THEME_NAMES = () => ({light:_t('light'), dark:_t('dark'), soft:_t('soft'), contrast:_t('contrast')});

function _applyTheme(theme) {
  const t = theme || AppState.get('theme') || localStorage.getItem('beu_theme') || 'light';
  const root = document.documentElement;
  if (t === 'light') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
  const ico = document.getElementById('themeIcon');
  if (ico) ico.textContent = THEME_ICONS[t] || '☀️';
  const lbl = document.getElementById('themeLbl');
  if (lbl) lbl.textContent = _t('theme');
  try { localStorage.setItem('beu_theme', t); } catch(e) {}
  AppState.set('theme', t);
}

function openLangPicker() {
  const cur = AppState.get('currentLang') || 'es';
  const flags = window.LANGS_UI || [];
  const css = `<style>.lg-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.lg-item{display:flex;flex-direction:column;align-items:center;justify-content:center;width:64px;height:52px;border-radius:8px;cursor:pointer;border:2px solid var(--border);background:var(--bg2);transition:all .15s}.lg-item:hover{background:var(--bg3);border-color:var(--blue)}.lg-item.sel{border-color:var(--green);background:var(--gll)}</style>`;
  const body = `${css}<div class="lg-grid">${flags.map(l=>{
    const fl = l.flag.includes('<svg') ? l.flag : `<span style="font-size:22px">${l.flag}</span>`;
    return `<div class="lg-item${l.code===cur?' sel':''}" onclick="window._op.setLang('${l.code}');document.getElementById('dynModal')?.remove()" title="${l.name}"><div style="height:22px;display:flex;align-items:center;justify-content:center">${fl}</div><div style="font-size:9px;font-weight:700;margin-top:2px;color:var(--text2)">${l.name}</div></div>`;
  }).join('')}</div>`;
  const div = document.createElement('div'); div.id = 'dynModal'; div.className = 'modal-bg';
  div.innerHTML = `<div class="modal-box"><div class="modal-hdr"><div class="modal-ttl">🌐</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="this.closest('.modal-bg').remove()">✕</button></div>${body}</div>`;
  document.getElementById('dynModal')?.remove(); document.body.appendChild(div);
  div.onclick = e => { if (e.target === div) div.remove(); };
}

async function setLang(lang) {
  AppState.set('currentLang', lang);
  if(typeof CUR_LANG!=='undefined') CUR_LANG=lang;
  if(window.setLang && window.setLang!==setLang) window.setLang(lang);
  try { localStorage.setItem('beu_lang', lang); } catch(e) {}
  const user = AppState.get('currentUser');
  if (user) { user.lang = lang; await fsUpdate(`users/${user.id}`, { lang }); }
  // Re-render tabs
  const tabBar = document.getElementById('mainTabs');
  if (tabBar) {
    tabBar.querySelectorAll('.btn-tab').forEach(b => {
      const tid = b.dataset.tab;
      const def = TAB_DEFS.find(t => t.id === tid);
      if (def) b.innerHTML = `${def.ico} ${_tabLabel(tid)}`;
    });
  }
  // Re-render header labels
  const themeLbl = document.getElementById('themeLbl');
  if (themeLbl) themeLbl.textContent = _t('theme');
  const flagBtn = document.getElementById('langFlagBtn');
  if (flagBtn) flagBtn.innerHTML = _curFlag();
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) { const svg = logoutBtn.querySelector('svg'); logoutBtn.innerHTML = ''; if(svg) logoutBtn.appendChild(svg); logoutBtn.append(' ' + _t('logout')); }
  renderHdr();
  // Re-render active tab content
  const cur = curTab || localStorage.getItem('beu_tab') || 'dash';
  goTab(cur);
  toast(`🌐 ${lang.toUpperCase()}`, 'var(--green)');
}

async function tabDragStart(e) {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.tab);
  e.currentTarget.classList.add('tab-dragging');
}
function tabDragOver(e) {
  e.preventDefault();
  document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('tab-drag-over'));
  e.currentTarget.classList.add('tab-drag-over');
}
function tabDrop(e) {
  e.preventDefault();
  const from = e.dataTransfer.getData('text/plain');
  const to   = e.currentTarget.dataset.tab;
  if (from === to) return;
  const bar  = document.getElementById('mainTabs');
  const btns = [...bar.querySelectorAll('.btn-tab')];
  const fromEl = btns.find(b => b.dataset.tab === from);
  const toEl   = btns.find(b => b.dataset.tab === to);
  if (fromEl && toEl) bar.insertBefore(fromEl, toEl);
  // Save order
  const newOrder = [...bar.querySelectorAll('.btn-tab')].map(b => b.dataset.tab);
  try { localStorage.setItem('beu_tabOrder', JSON.stringify(newOrder)); } catch(e){}
}
function tabDragEnd(e) {
  document.querySelectorAll('.btn-tab').forEach(b => { b.classList.remove('tab-dragging'); b.classList.remove('tab-drag-over'); });
}

function printTroquelado(id) {
  AppState.set('lastIngreso', id);
  window._op.goTab('impresion');
}

function registrarTracking(id, col) {
  const i = _getCol(col).find(x => x.id === id);
  if (!i) return;
  const ts = nowLocal();
  if (!i.tracking) i.tracking = [];
  i.tracking.push({ ts, user: _user()?.nombre || '?', lat: null });
  _saveOne(col, i).catch(e=>{});
  toast('📍 Tracking registrado', 'var(--blue)');
}

function toggleAutoFill() {
  _autoFillOn = !_autoFillOn;
  try { localStorage.setItem('beu_af', _autoFillOn?'1':'0'); } catch(e){}
  renderIngresos();
  toast((_autoFillOn ? '⚡ Autorrelleno ON' : 'Autorrelleno OFF'), 'var(--blue)');
}

function togglePosAuto() {
  _posAutoOn = !_posAutoOn;
  try { localStorage.setItem('beu_pa', _posAutoOn?'1':'0'); } catch(e){}
  renderIngresos();
  toast((_posAutoOn ? '🔢 Posición AUTO ON' : 'Posición manual'), 'var(--blue)');
}

function cycleTheme() {
  toggleThemeMenu();
}

function toggleThemeMenu() {
  let menu = document.getElementById('themeDropMenu');
  if (menu) { menu.remove(); return; }
  const btn = document.getElementById('btnTheme');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  menu = document.createElement('div');
  menu.id = 'themeDropMenu';
  menu.style.cssText = 'position:fixed;top:'+(rect.bottom+4)+'px;right:'+(window.innerWidth-rect.right)+'px;background:var(--bg2);border:1.5px solid var(--border2);border-radius:10px;padding:6px;z-index:9999;min-width:170px;box-shadow:0 8px 24px rgba(0,0,0,.15)';
  const cur = localStorage.getItem('beu_theme') || 'light';
  menu.innerHTML = THEME_ORDER.map(th => {
    const active = th === cur;
    return '<div onclick="window._op.selectTheme(\''+th+'\')" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;color:var(--text);background:'+(active?'var(--bll)':'transparent')+';font-weight:'+(active?'700':'400')+'" onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\''+(active?'var(--bll)':'transparent')+'\'">'+
      '<span style="font-size:16px">'+THEME_ICONS[th]+'</span><span>'+THEME_NAMES()[th]+'</span>'+(active?'<span style="margin-left:auto;color:var(--green)">✓</span>':'')+
    '</div>';
  }).join('');
  document.body.appendChild(menu);
  setTimeout(() => {
    document.addEventListener('click', function _tc(e) {
      if (!e.target.closest('#themeDropMenu') && !e.target.closest('#btnTheme')) {
        const m = document.getElementById('themeDropMenu'); if (m) m.remove();
        document.removeEventListener('click', _tc);
      }
    });
  }, 10);
}

function selectTheme(theme) {
  const m = document.getElementById('themeDropMenu'); if (m) m.remove();
  _applyTheme(theme);
}

function handleLogout() {
  if (!confirm(_t('logoutQ'))) return;
  _unsubs.forEach(u => { try { u(); } catch(e) {} });
  logout();
}

// ─── KEYBOARD ────────────────────────────────────────────────────────
function _bindGlobalKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { document.getElementById('dynModal')?.remove(); }
    if ((e.ctrlKey||e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const inp = document.querySelector('#mainContent input[type="text"]');
      if (inp) inp.focus();
    }
  });
}

// ─── CAMPOS SUBTAB ───────────────────────────────────────────────────
function _renderCamposSubtab(el_unused, col) {
  const tabLabel = {ingresos:'Referencia',ingresos2:'Ingresos',agenda:'Agenda',conductores:'Conductores',movimientos:'Embalaje'}[col] || col;
  const ALL_CAMPOS = {
    ingresos:   ['posicion','llamador','ref','empresa','hall','stand','puertaHall','acceso','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','fechaExpiracion','pais','telefono','email','comentario','horario'],
    ingresos2:  ['posicion','llamador','ref','empresa','hall','stand','puertaHall','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','pais','telefono','email','comentario'],
    agenda:     ['matricula','fecha','hora','remolque','conductor','empresa','referencia','montador','expositor','hall','stand','tipoCarga','telefono','notas','estado'],
    conductores:['nombre','apellido','empresa','matricula','remolque','hall','telefono','email','tipoVehiculo','pasaporte','pais','fechaNacimiento','idioma','notas'],
    movimientos:['posicion','matricula','remolque','nombre','empresa','hall','status','tipoCarga'],
  };
  const LABELS = {posicion:'Nº Posición',llamador:'Llamador',ref:'Referencia',empresa:'Empresa',hall:'Hall',stand:'Stand',puertaHall:'Puerta Hall',acceso:'Acceso',montador:'Montador',expositor:'Expositor',remolque:'Remolque',tipoVehiculo:'Tipo Vehículo',descargaTipo:'Descarga',nombre:'Nombre',apellido:'Apellido',pasaporte:'Pasaporte/DNI',fechaNacimiento:'F. Nacimiento',fechaExpiracion:'F. Expiración',pais:'País',telefono:'Teléfono',email:'Email',comentario:'Comentario',horario:'Hora',fecha:'Fecha',hora:'Hora planif.',conductor:'Conductor',referencia:'Referencia',tipoCarga:'Tipo Carga',notas:'Notas',estado:'Estado',matricula:'Matrícula',idioma:'Idioma',status:'Estado'};
  if (!DB.camposCfg) DB.camposCfg = {};
  if (!DB.camposCfg[col]) DB.camposCfg[col] = {};
  const cfg = DB.camposCfg[col];
  const campos = ALL_CAMPOS[col] || [];
  const stateLabel = {off:'✕ Oculto', show:'✓ Visible', required:'★ Oblig.'};
  const stateColor = {off:'var(--border2);background:var(--bg3);color:var(--text3)', show:'var(--blue);background:var(--blue);color:#fff', required:'var(--red);background:var(--red);color:#fff'};

  const backTab = {ingresos:'ingresos',ingresos2:'ingresos2',agenda:'agenda',conductores:'conductores',movimientos:'flota'}[col]||'dash';

  let h = `<div style="display:flex;align-items:center;gap:3px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:8px;flex-wrap:nowrap;overflow-x:auto">
    <button class="btn btn-gh btn-sm" onclick="window._op.goTab('${backTab}')">← Volver</button>
    <span style="flex:1;font-size:11px;color:var(--text3)">Campos visibles — ${tabLabel}</span>
    ${canCampos()?`<button class="btn btn-p btn-sm" onclick="window._op.saveCamposCfg('${col}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar</button>`:''}
    <button class="btn btn-gh btn-sm" onclick="window._op.resetCamposCfg('${col}')">↺ Resetear</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">`;

  campos.forEach(k => {
    const state = cfg[k] || 'show';
    const sc = stateColor[state];
    h += `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border-radius:16px;border:1.5px solid ${sc};font-size:11px;font-weight:700;cursor:pointer" onclick="window._op.cycleCampo('${col}','${k}')">${stateLabel[state]} ${LABELS[k]||k}</span>`;
  });

  h += `</div>
  <div style="border-top:1px solid var(--border);padding-top:10px">
    <div style="font-size:11px;font-weight:500;margin-bottom:6px">Añadir campo personalizado</div>
    <div style="display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap">
      <div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:140px">
        <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">Nombre</span>
        <input id="newCampoNom" placeholder="Ej: Zona, Acceso especial..." style="border:1px solid var(--border2);border-radius:6px;padding:5px 8px;font-size:12px;background:var(--bg2);width:100%">
      </div>
      <div style="display:flex;flex-direction:column;gap:3px">
        <span style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">Tipo</span>
        <select id="newCampoTipo" style="border:1px solid var(--border2);border-radius:6px;padding:5px 8px;font-size:12px;background:var(--bg2)">
          <option value="text">Texto libre</option>
          <option value="number">Número</option>
          <option value="bool">Sí / No</option>
          <option value="date">Fecha</option>
        </select>
      </div>
      <button class="btn btn-p btn-sm" onclick="window._op.addCustomCampo('${col}')">+ Crear campo</button>
    </div>
  </div>`;

  return h;
}

function cycleCampo(col, key) {
  if (!DB.camposCfg) DB.camposCfg = {};
  if (!DB.camposCfg[col]) DB.camposCfg[col] = {};
  const cur = DB.camposCfg[col][key] || 'show';
  const next = {off:'show', show:'required', required:'off'}[cur];
  DB.camposCfg[col][key] = next;
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

function saveCamposCfg(col) {
  if (!DB.camposCfg) return;
  _saveOne('camposCfg', DB.camposCfg[col] || {}).catch(e=>{});
  toast('✅ Configuración guardada', 'var(--green)');
}

function resetCamposCfg(col) {
  if (!confirm('¿Resetear todos los campos a Visible?')) return;
  DB.camposCfg[col] = {};
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

function addCustomCampo(col) {
  const nom = document.getElementById('newCampoNom')?.value?.trim();
  if (!nom) { toast(_M('plateMandatory'), 'var(--red)'); return; }
  const tipo = document.getElementById('newCampoTipo')?.value || 'text';
  if (!DB.customCampos) DB.customCampos = {};
  if (!DB.customCampos[col]) DB.customCampos[col] = [];
  const key = 'custom_' + nom.toLowerCase().replace(/\s+/g, '_');
  if (DB.customCampos[col].find(c => c.key === key)) { toast('Ya existe', 'var(--amber)'); return; }
  DB.customCampos[col].push({ key, label: nom, tipo });
  toast('✅ Campo creado — plantilla Excel actualizada', 'var(--green)');
  _renderCamposSubtab(document.getElementById('tabContent'), col);
}

// ─── LISTA NEGRA (Especial) ──────────────────────────────────────────
function _renderListaNegra(el) {
  const items = DB.listaNegra || [];
  let h = `<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='lista';window._op.renderIngresos()">📋 '+_M('list')+'</button>
    <button class="btn btn-sm btn-p">⭐ Especial (${items.length})</button>
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='espera';window._op.renderIngresos()">⏳ En espera (${(DB.enEspera||[]).filter(e=>e.estado==='pendiente').length})</button>
  </div>
  <div class="sec-hdr">
    <div class="sec-ttl">⭐ Especial / Lista negra</div>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-r btn-sm" onclick="window._op.openLNModal(null)">+ '+_M('add')+' '+_M('plate')+'</button>':''}
      <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(\'listaNegra\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
    </div>
  </div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--red)"><div class="stat-n" style="color:var(--red)">${items.filter(i=>i.nivel==='bloqueo').length}</div><div class="stat-l">🚫 Bloqueadas</div></div>
    <div class="stat-box" style="border-top:3px solid var(--amber)"><div class="stat-n" style="color:var(--amber)">${items.filter(i=>i.nivel==='alerta').length}</div><div class="stat-l">⚠️ Alertas</div></div>
    <div class="stat-box"><div class="stat-n">${items.length}</div><div class="stat-l">Total</div></div>
  </div>`;
  if (!items.length) {
    h += '<div class="empty"><div class="ei">⭐</div><div class="et">Sin matrículas en especial</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>"+_M("level")+"</th><th>Motivo</th><th>Empresa</th><th>Válido hasta</th><th>Usuario</th><th></th></tr></thead><tbody>';
    items.forEach(ln => {
      const color = ln.nivel==='bloqueo' ? 'var(--red)' : 'var(--amber)';
      h += `<tr>
        <td><span class="mchip">${esc(ln.matricula)}</span></td>
        <td><span style="font-weight:800;color:${color}">${ln.nivel==='bloqueo'?'🚫 BLOQUEO':'⚠️ ALERTA'}</span></td>
        <td style="font-size:11px">${esc(ln.motivo||'–')}</td>
        <td style="font-size:11px">${esc(ln.empresa||'–')}</td>
        <td style="font-size:11px">${esc(ln.hasta||'–')}</td>
        <td style="font-size:10px;color:var(--text3)">${esc(ln.usuario||'–')}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openLNModal('${ln.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${ln.id}','listaNegra')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

function _renderEnEspera(el) {
  const items = (DB.enEspera || []).filter(e => e.estado === 'pendiente')
    .sort((a,b) => { const p={urgente:0,alta:1,normal:2}; return (p[a.prioridad]||2)-(p[b.prioridad]||2); });
  let h = `<div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='lista';window._op.renderIngresos()">📋 '+_M('list')+'</button>
    <button class="btn btn-sm btn-gh" onclick="window._ingSub='listanegra';window._op.renderIngresos()">⭐ Especial (${(DB.listaNegra||[]).length})</button>
    <button class="btn btn-sm btn-p">⏳ En espera (${items.length})</button>
  </div>
  <div class="sec-hdr">
    <div class="sec-ttl">⏳ En espera</div>
    <div class="sec-act">
      ${canEdit()?'<button class="btn btn-p btn-sm" onclick="window._op.openEEModal(null)">+ En espera</button>':''}
    </div>
  </div>
  <div class="sg sg3" style="margin-bottom:10px">
    <div class="stat-box" style="border-top:3px solid var(--blue)"><div class="stat-n" style="color:var(--blue)">${items.length}</div><div class="stat-l">⏳ Pendientes</div></div>
    <div class="stat-box" style="border-top:3px solid var(--green)"><div class="stat-n" style="color:var(--green)">${(DB.enEspera||[]).filter(e=>e.estado==='llegado').length}</div><div class="stat-l">✅ Llegados</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--text3)">${(DB.enEspera||[]).filter(e=>e.estado==='cancelado').length}</div><div class="stat-l">❌ Cancelados</div></div>
  </div>`;
  if (!items.length) {
    h += '<div class="empty"><div class="ei">⏳</div><div class="et">Lista de espera vacía</div></div>';
  } else {
    h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Matrícula</th><th>Prioridad</th><th>Conductor</th><th>Empresa</th><th>'+_L('Hal')+'</th><th>Booking</th><th>Hora</th><th></th></tr></thead><tbody>';
    items.forEach(e => {
      const prioColor = e.prioridad==='urgente'?'var(--red)':e.prioridad==='alta'?'var(--amber)':'var(--text3)';
      h += `<tr>
        <td><span class="mchip">${esc(e.matricula)}</span></td>
        <td><span style="font-size:11px;font-weight:800;color:${prioColor}">${e.prioridad==='urgente'?'🔴':e.prioridad==='alta'?'🔶':'●'} ${e.prioridad||'normal'}</span></td>
        <td style="font-size:11px">${esc(e.conductor||'–')}</td>
        <td style="font-size:11px">${esc(e.empresa||'–')}</td>
        <td><span class="h-badge">${esc(e.hall||'–')}</span></td>
        <td style="font-size:11px;font-family:'JetBrains Mono',monospace">${esc(e.booking||'–')}</td>
        <td style="font-size:11px">${esc(e.hora||'–')}</td>
        <td><div style="display:flex;gap:2px">
          ${canEdit()?`<button class="btn btn-s btn-xs" title="Llegó" onclick="window._op.marcarEELlegado('${e.id}')">✅</button>`:''}
          ${canEdit()?`<button class="btn btn-edit btn-xs" onclick="window._op.openEEModal('${e.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
          ${isSA()?`<button class="btn btn-danger btn-xs" onclick="window._op.eliminar('${e.id}','enEspera')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button>`:''}
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  }
  el.innerHTML = h;
}

function checkBL(mat) {
  return (DB.listaNegra||[]).find(x => x.matricula===mat.toUpperCase() && (!x.hasta||x.hasta>=new Date().toISOString().slice(0,10))) || null;
}
function checkEE(mat) {
  return (DB.enEspera||[]).find(e => e.matricula===mat.toUpperCase() && e.estado==='pendiente') || null;
}

function openLNModal(id) {
  const existing = id ? (DB.listaNegra||[]).find(x=>x.id===id) : null;
  const ln = existing || {};
  _modal(existing ? 'Editar especial' : 'Nueva matrícula especial', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="lnMat" value="${esc(ln.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
      <div class="fg"><label class="flbl">"+_M("level")+"</label>
        <select id="lnNivel">
          <option value="alerta" ${ln.nivel==='alerta'?'selected':''}>⚠️ Alerta</option>
          <option value="bloqueo" ${ln.nivel==='bloqueo'?'selected':''}>🚫 Bloqueo</option>
          <option value="vip" ${ln.nivel==='vip'?'selected':''}>⭐ VIP</option>
          <option value="prioritario" ${ln.nivel==='prioritario'?'selected':''}>🔶 Prioritario</option>
        </select>
      </div>
      <div class="fg" style="grid-column:1/-1"><label class="flbl">Motivo <span class="freq">*</span></label><input id="lnMotivo" value="${esc(ln.motivo||'')}" placeholder="Motivo del marcado"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="lnEmp" value="${esc(ln.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Válido hasta</label><input id="lnHasta" type="date" value="${esc(ln.hasta||'')}"></div>
    </div>
  `, async () => {
    const mat = normPlate(gv('lnMat')); const motivo = gv('lnMotivo');
    if (!mat || !motivo) { toast('Matrícula y motivo obligatorios','var(--red)'); return; }
    const data = { id:ln.id||uid(), matricula:mat, nivel:gv('lnNivel'), motivo, empresa:gv('lnEmp'), hasta:gv('lnHasta')||null, ts:nowLocal(), usuario:_user()?.nombre||'' };
    if (!DB.listaNegra) DB.listaNegra = [];
    const idx = DB.listaNegra.findIndex(x=>x.id===data.id);
    if (idx>=0) DB.listaNegra[idx]=data; else DB.listaNegra.push(data);
    await _saveOne('listaNegra', data);
    toast(_M('saved'),'var(--green)');
    _renderListaNegra(document.getElementById('tabContent'));
  });
}

function openEEModal(id) {
  const existing = id ? (DB.enEspera||[]).find(x=>x.id===id) : null;
  const e = existing || {};
  _modal(existing ? 'Editar en espera' : 'Nueva en espera', `
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula <span class="freq">*</span></label><input id="eeMat" value="${esc(e.matricula||'')}" style="text-transform:uppercase" placeholder="AB1234CD"></div>
      <div class="fg"><label class="flbl">Prioridad</label>
        <select id="eePrio">
          <option value="normal" ${(e.prioridad||'normal')==='normal'?'selected':''}>● Normal</option>
          <option value="alta" ${e.prioridad==='alta'?'selected':''}>🔶 Alta</option>
          <option value="urgente" ${e.prioridad==='urgente'?'selected':''}>🔴 Urgente</option>
        </select>
      </div>
      <div class="fg"><label class="flbl">Conductor</label><input id="eeCond" value="${esc(e.conductor||'')}"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="eeEmp" value="${esc(e.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Teléfono</label><input id="eeTel" value="${esc(e.telefono||'')}"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="eeHall" value="${esc(e.hall||'')}"></div>
      <div class="fg"><label class="flbl">Booking/Referencia</label><input id="eeRef" value="${esc(e.booking||'')}"></div>
      <div class="fg"><label class="flbl">Hora estimada</label><input id="eeHora" type="time" value="${esc(e.hora||'')}"></div>
    </div>
    <div class="fg"><label class="flbl">Notas</label><textarea id="eeNotas" rows="2">${esc(e.notas||'')}</textarea></div>
  `, async () => {
    const mat = normPlate(gv('eeMat'));
    if (!mat) { toast(_M('plateMandatory'),'var(--red)'); return; }
    const data = { id:e.id||uid(), matricula:mat, prioridad:gv('eePrio'), conductor:gv('eeCond'), empresa:gv('eeEmp'), telefono:gv('eeTel'), hall:gv('eeHall'), booking:gv('eeRef'), hora:gv('eeHora'), notas:gv('eeNotas'), estado:'pendiente', ts:nowLocal(), creadoPor:_user()?.nombre||'' };
    if (!DB.enEspera) DB.enEspera = [];
    const idx = DB.enEspera.findIndex(x=>x.id===data.id);
    if (idx>=0) DB.enEspera[idx]=data; else DB.enEspera.push(data);
    await _saveOne('enEspera', data);
    toast('⏳ En espera añadido','var(--blue)');
    renderHdr();
    _renderEnEspera(document.getElementById('tabContent'));
  });
}

function marcarEELlegado(id) {
  const e = (DB.enEspera||[]).find(x=>x.id===id); if (!e) return;
  e.estado = 'llegado';
  _saveOne('enEspera', e).catch(e=>{});
  // Pre-fill nueva entrada modal
  openIngModal(null, 'ingresos');
  setTimeout(() => {
    const set = (id, v) => { const el=document.getElementById(id); if(el&&v) el.value=v; };
    set('mMat', e.matricula); set('mNom', e.conductor); set('mEmp', e.empresa);
    set('mHall', e.hall); set('mBooking', e.booking); set('mTel', e.telefono);
  }, 100);
  toast('✅ Marcado como llegado','var(--green)');
  window._ingSub = 'lista';
}


// ─── EXCEL TEMPLATES ──────────────────────────────────────────────────
function _xlsxWrite(data, sheetName, filename) {
  const XLSX = window.XLSX;
  if (!XLSX) { toast('XLSX no disponible','var(--red)'); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
  toast('📋 Plantilla descargada', 'var(--blue)');
}

function dlTemplateIngresos() {
  _xlsxWrite([
    ['Matricula','Llamador','Referencia','Nombre','Apellido','Empresa','Montador','Expositor','Hall','Stand','PuertaHall','Remolque','TipoVehiculo','Descarga','Pasaporte','Telefono','Email','Pais','FechaNacimiento','Comentario','Idioma','Pos'],
    ['Matrícula (oblig.)','Llamador','Ref.','Nombre','Apellido','Empresa','Montador','Expositor','Hall','Stand','Puerta Hall','Remolque','camion/semiremolque/furgoneta','mano/maquinaria','Pasaporte/DNI','Teléfono','Email','País','YYYY-MM-DD','Comentario','es/en/fr...','Pos.'],
    ['1234ABC','12345','REF-001','Juan','García','ACME SL','','','H1','A101','P3','','semiremolque','mano','','600123456','','España','1985-01-01','','es','']
  ], 'Referencia', 'plantilla_referencia.xlsx');
}

function dlTemplateIngresos2() {
  _xlsxWrite([
    ['Matricula','Nombre','Apellido','Empresa','Hall','Stand','PuertaHall','Remolque','TipoVehiculo','Descarga','Telefono','Email','Comentario','Idioma','Pos'],
    ['Matrícula (oblig.)','Nombre','Apellido','Empresa','Hall','Stand','Puerta Hall','Remolque','camion/semiremolque','mano/maquinaria','Teléfono','Email','Comentario','es/en/fr...','Pos.'],
    ['1234ABC','Juan','García','ACME SL','H1','A101','P3','','','','600123456','','','es','']
  ], 'Ingresos', 'plantilla_ingresos.xlsx');
}

function dlTemplateAgenda() {
  _xlsxWrite([
    ['Matricula','Fecha','HoraPlan','Remolque','Conductor','Empresa','Referencia','Montador','Expositor','Hall','Stand','TipoCarga','Telefono','Notas','Evento'],
    ['Matrícula (oblig.)','YYYY-MM-DD','HH:MM','Remolque','Conductor','Empresa','Ref.','Montador','Expositor','Hall','Stand','GOODS/EF/...','Teléfono','Notas','Evento'],
    ['1234ABC','2026-04-01','09:00','REM001','Juan García','ACME SL','REF123','','','H1','A101','GOODS','600123456','','ALIMENTARIA 2026']
  ], 'Agenda', 'plantilla_agenda.xlsx');
}

function dlTemplateFlota() {
  _xlsxWrite([
    ['Matricula','Remolque','Nombre','Apellido','Empresa','Hall','TipoCarga','Status','Posicion'],
    ['Matrícula (oblig.)','Remolque','Nombre','Apellido','Empresa','Hall','GOODS/EF/SUNDAY/PRIORITY/EMPTY','ALMACEN/SOT/FIRA/FINAL','Nº'],
    ['1234ABC','REM001','Juan','García','ACME SL','H1','GOODS','ALMACEN','1']
  ], 'Embalaje', 'plantilla_embalaje.xlsx');
}

function dlTemplateConductores() {
  _xlsxWrite([
    ['Nombre','Apellido','Empresa','Matricula','Remolque','Hall','TelPais','Telefono','Email','TipoVehiculo','Pasaporte','Pais','FechaNacimiento','Idioma','Notas'],
    ['Nombre (oblig.)','Apellido','Empresa','Matrícula habitual','Remolque habitual','Hall habitual','+34',  'Teléfono','Email','camion/semiremolque/furgoneta','Pasaporte/DNI','País','YYYY-MM-DD','es/en/fr...','Notas'],
    ['Juan','García','ACME SL','1234ABC','','H1','+34','600123456','juan@empresa.com','camion','12345678Z','España','1985-01-01','es','']
  ], 'Conductores', 'plantilla_conductores.xlsx');
}

function dlTemplateUsuarios() {
  _xlsxWrite([
    ['Nombre','Username','Email','Contrasena','PIN','Rol','Idioma'],
    ['Nombre completo (oblig.)','usuario (sin espacios)','email@empresa.com','Contraseña (mín. 8)','PIN mín.6 dígitos','supervisor/controlador_rampa/editor/visor','es/en/fr...'],
    ['Juan García','juangarcia','juan@empresa.com','MiPass2026!','123456','controlador_rampa','es'],
    ['Ana López','analopez','ana@empresa.com','MiPass2026!','654321','supervisor','es']
  ], 'Usuarios', 'plantilla_usuarios.xlsx');
}

function dlTemplateEmpresas() {
  _xlsxWrite([
    ['Nombre','CIF','Contacto','Telefono','Email','Idioma'],
    ['Nombre empresa (oblig.)','CIF/NIF/VAT','Persona contacto','Teléfono','Email empresa','es/en/fr...'],
    ['Montajes Pro SL','B12345678','Ana Martínez','+34 600 123 456','ana@montajes.com','es'],
    ['ExpoDemo SL','B87654321','Piotr Kowalski','+48 600 987 654','piotr@expodemo.com','pl']
  ], 'Empresas', 'plantilla_empresas.xlsx');
}

function dlTemplateVehiculos() {
  _xlsxWrite([
    ['Matricula','Conductor','Empresa','Telefono','TelPais','Remolque','TipoVehiculo','Idioma'],
    ['Matrícula (oblig.)','Nombre conductor','Empresa','Teléfono','+34','Remolque','camion/semiremolque/furgoneta/trailer','es/en/fr...'],
    ['AB1234CD','Juan García','ACME SL','600123456','+34','','semiremolque','es']
  ], 'Historial', 'plantilla_historial.xlsx');
}

// ─── EMPRESAS TAB ────────────────────────────────────────────────────
function renderEmpresasTab() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  const emps = DB.empresas || [];
  const pres = DB.preregistros || [];
  const sub  = window._empSub || 'empresas';
  const q    = (window._empSearch || '').toLowerCase();

  let filtered = sub === 'empresas'
    ? emps.filter(e => !q || `${e.nombre||''} ${e.cif||''} ${e.email||''} ${e.contacto||''}`.toLowerCase().includes(q))
    : pres.filter(p => !q || `${p.matricula||''} ${p.empresaNombre||''} ${p.ref||''} ${p.eventoNombre||''}`.toLowerCase().includes(q));

  const nBadge = n => n === 'verified' ? '<span class="pill pill-g">✓ Verificada</span>'
    : n === 'blocked' ? '<span class="pill pill-r">✕ Bloqueada</span>'
    : '<span class="pill pill-b">~ Semi</span>';

  let h = `<div class="sg sg4" style="margin-bottom:10px">
    <div class="stat-box"><div class="stat-n">${emps.length}</div><div class="stat-l">Empresas</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--green)">${emps.filter(e=>e.nivel==='verified').length}</div><div class="stat-l">Verificadas</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--blue)">${emps.reduce((a,e)=>a+(e.vehiculos||[]).length,0)}</div><div class="stat-l">Vehículos</div></div>
    <div class="stat-box"><div class="stat-n" style="color:var(--teal)">${pres.length}</div><div class="stat-l">Preregistros</div></div>
  </div>
  <div style="display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;width:fit-content;margin-bottom:10px">
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='empresas'?'#2563eb':'var(--bg2)'};color:${sub==='empresas'?'#fff':'var(--text3)'}" onclick="window._empSub='empresas';window._empSearch='';window._op.renderEmpresasTab()">🏢 Empresas (${emps.length})</div>
    <div style="padding:5px 16px;font-size:11px;font-weight:700;cursor:pointer;background:${sub==='preregistros'?'#2563eb':'var(--bg2)'};color:${sub==='preregistros'?'#fff':'var(--text3)'}" onclick="window._empSub='preregistros';window._empSearch='';window._op.renderEmpresasTab()">📋 Preregistros (${pres.length})</div>
  </div>
  <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
    <div class="sbox" style="flex:1;min-width:200px"><span class="sico">🔍</span><input type="text" placeholder="Buscar…" value="${esc(window._empSearch||'')}" oninput="window._empSearch=this.value;window._op.renderEmpresasTab()"></div>
    <span style="font-size:11px;color:var(--text3)">${filtered.length} registros</span>
    ${sub==='empresas'?'<button class="btn btn-p btn-sm" onclick="window._op.openEmpresaModal(null)">+ Empresa</button>':''}
    ${canImport()?'<button class="btn btn-gh btn-sm" onclick="window._op.importExcel(\'empresas\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Importar</button>':''}
    ${canExport()?'<button class="btn btn-gh btn-sm" onclick="window._op.dlTemplateEmpresas()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Plantilla</button>':''}
    <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel(sub==='empresas'?'empresas':'preregistros')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Excel</button>
  </div>`;

  if (sub === 'empresas') {
    if (!filtered.length) { h += '<div class="empty"><div class="ei">🏢</div><div class="et">Sin empresas registradas</div></div>'; }
    else {
      h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>CIF/VAT</th><th>Contacto</th><th>Email</th><th>Tipo</th><th>Vehículos</th><th>Prereg.</th><th>"+_M("level")+"</th><th></th></tr></thead><tbody>';
      filtered.forEach(emp => {
        const nv = (emp.vehiculos||[]).length;
        const np = pres.filter(p => p.empresaId === emp.id).length;
        h += `<tr>
          <td style="font-weight:700">${esc(emp.nombre||'–')}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${esc(emp.cif||'–')}</td>
          <td style="font-size:11px">${esc(emp.contacto||'–')}</td>
          <td style="font-size:11px;color:var(--text3)">${esc(emp.email||'–')}</td>
          <td style="font-size:11px">${esc(emp.tipo||'–')}</td>
          <td style="text-align:center;font-weight:700;color:var(--blue)">${nv}</td>
          <td style="text-align:center;font-weight:700;color:var(--teal)">${np}</td>
          <td>${nBadge(emp.nivel)}</td>
          <td><div style="display:flex;gap:2px">
            ${isSA() ? `<button class="btn btn-gh btn-xs" onclick="window._op.verPortalEmpresa('${emp.id}')">👁 Portal</button>` : ''}
            ${isSA() ? `<button class="btn btn-edit btn-xs" onclick="window._op.openEmpresaModal('${emp.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>` : ''}
            ${isSA() && emp.nivel !== 'verified' ? `<button class="btn btn-s btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','verified')">✓</button>` : ''}
            ${isSA() && emp.nivel !== 'blocked'  ? `<button class="btn btn-danger btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','blocked')">✕</button>` : ''}
            ${isSA() && emp.nivel === 'blocked'  ? `<button class="btn btn-gh btn-xs" onclick="window._op.setEmpresaNivel('${emp.id}','semi')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 000-8h-1"/></svg></button>` : ''}
          </div></td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    }
  } else {
    if (!filtered.length) { h += '<div class="empty"><div class="ei">📋</div><div class="et">Sin preregistros</div></div>'; }
    else {
      h += '<div class="tbl-wrap"><table class="dtbl"><thead><tr><th>Empresa</th><th>'+_M('events')+'</th><th>Matrícula</th><th>Conductor</th><th>Ref.</th><th>'+_L('Hal')+'</th><th>'+_L('Std')+'</th><th>Fecha plan.</th><th>Estado</th></tr></thead><tbody>';
      filtered.forEach(p => {
        const stColors = { preregistrado:'var(--bll)', en_camino:'var(--all)', en_recinto:'var(--gll)' };
        h += `<tr>
          <td style="font-weight:700">${esc(p.empresaNombre||p.empresa||'–')}</td>
          <td style="font-size:11px;color:var(--text3)">${esc(p.eventoNombre||'–')}</td>
          <td><span class="mchip-sm">${esc(p.matricula||'–')}</span></td>
          <td style="font-size:11px">${esc(p.nombre||'–')}</td>
          <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${esc(p.ref||'–')}</td>
          <td><span class="h-badge">${esc(p.hall||'–')}</span></td>
          <td style="font-size:11px">${esc(p.stand||'–')}</td>
          <td style="font-size:11px">${esc(p.fechaPlan||'–')}</td>
          <td><span class="pill" style="background:${stColors[p.estado]||'var(--bg3)'};font-size:10px;font-weight:700">${esc(p.estado||'–')}</span></td>
        </tr>`;
      });
      h += '</tbody></table></div>';
    }
  }
  el.innerHTML = h;
}

// ─── MIGRACIÓN ───────────────────────────────────────────────────────
// Auto-backup timer
let _autoBackupInterval = null;
function _startAutoBackup() {
  if (_autoBackupInterval) return;
  const FOUR_H = 4 * 60 * 60 * 1000;
  _autoBackupInterval = setInterval(() => {
    try {
      const cols = ['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','usuarios','empresas'];
      let totalRecs = 0;
      cols.forEach(c => totalRecs += (DB[c]||[]).length);
      if (totalRecs === 0) return;
      const wb = XLSX.utils.book_new();
      cols.forEach(c => {
        const d = DB[c]||[];
        if (d.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d), c.slice(0,31));
      });
      const fn = `beunifyt_autobackup_${new Date().toISOString().slice(0,16).replace(/:/g,'-')}.xlsx`;
      XLSX.writeFile(wb, fn);
      const ts = new Date().toISOString();
      try { localStorage.setItem('beu_lastBackup', ts); } catch(e) {}
      toast('💾 Auto-backup: '+fn, 'var(--green)');
      // Auto-email if enabled
      if (localStorage.getItem('beu_autoEmail')==='1') {
        const em = localStorage.getItem('beu_backupEmail');
        if (em) {
          const subj = encodeURIComponent('BeUnifyT Auto-Backup '+new Date().toISOString().slice(0,10));
          const body = encodeURIComponent('Backup automático adjunto. Generado: '+new Date().toLocaleString());
          window.open('mailto:'+em+'?subject='+subj+'&body='+body, '_blank');
        }
      }
    } catch(e) { console.warn('[backup]', e); }
  }, FOUR_H);
}

function _analyzeduplicates(col) {
  const data = DB[col] || [];
  if (!data.length) return { total:0, dupes:0, details:[] };
  const seen = new Map();
  const dupes = [];
  data.forEach(item => {
    const key = (item.matricula||'')+'|'+(item.empresa||'')+'|'+(item.nombre||'');
    if (seen.has(key)) { dupes.push({ key, ids:[seen.get(key), item.id] }); }
    else seen.set(key, item.id);
  });
  return { total:data.length, dupes:dupes.length, details:dupes.slice(0,20) };
}

function renderMigracion() {
  if (!isSA()) { document.getElementById('tabContent').innerHTML = '<div class="empty"><div class="et">SuperAdmin</div></div>'; return; }
  const el = document.getElementById('tabContent'); if (!el) return;
  _startAutoBackup();

  const COLECCIONES = [
    { key:'ingresos',     label:'Referencia',   col:'ingresos' },
    { key:'ingresos2',    label:'Ingresos',      col:'ingresos2' },
    { key:'conductores',  label:'Conductores',   col:'conductores' },
    { key:'agenda',       label:'Agenda',        col:'agenda' },
    { key:'movimientos',  label:'Embalaje',      col:'movimientos' },
    { key:'mensajesRampa',label:'Mensajes',      col:'mensajesRampa' },
    { key:'editHistory',  label:'Historial',     col:'editHistory' },
    { key:'usuarios',     label:'Usuarios',      col:'usuarios' },
    { key:'empresas',     label:'Empresas',      col:'empresas' },
    { key:'preregistros', label:'Preregistros',  col:'preregistros' },
  ];

  const lastBk = (() => { try { return localStorage.getItem('beu_lastBackup'); } catch(e) { return null; } })();
  const lastBkStr = lastBk ? new Date(lastBk).toLocaleString() : 'Nunca';

  // Duplicate analysis
  const dupeResults = COLECCIONES.map(c => ({ ...c, ..._analyzeduplicates(c.key) }));
  const totalDupes = dupeResults.reduce((a,c) => a + c.dupes, 0);

  const autoEmailOn = (() => { try { return localStorage.getItem('beu_autoEmail')==='1'; } catch(e) { return false; } })();
  const savedEmail = (() => { try { return localStorage.getItem('beu_backupEmail')||AppState.get('currentUser')?.email||''; } catch(e) { return ''; } })();

  el.innerHTML = `
<div style="max-width:700px">
  <div class="sec-hdr"><span class="sec-ttl">📦 Migración y Backups</span></div>
  
  <!-- AUTO-BACKUP STATUS -->
  <div style="background:var(--gll);border:1px solid #bbf7d0;border-radius:var(--r2);padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
    <div><div style="font-weight:700;font-size:13px">💾 Auto-backup activo</div><div style="font-size:11px;color:var(--text3)">Cada 4 horas · Último: ${lastBkStr}</div></div>
    <span style="flex:1"></span>
    <button class="btn btn-gh btn-sm" onclick="window._op.exportarTodo()">⬇ Backup manual ahora</button>
  </div>

  <!-- AUTO-EMAIL SERVICE -->
  <div style="background:${autoEmailOn?'var(--bll)':'var(--bg3)'};border:1px solid ${autoEmailOn?'#bfdbfe':'var(--border)'};border-radius:var(--r2);padding:14px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="font-weight:700;font-size:13px">📧 Auto-envío por email</div>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin-left:auto">
        <span style="font-size:11px;font-weight:700;color:${autoEmailOn?'var(--green)':'var(--text3)'}">${autoEmailOn?'ACTIVO':'INACTIVO'}</span>
        <div onclick="window._op._toggleAutoEmail()" style="width:36px;height:20px;border-radius:10px;background:${autoEmailOn?'var(--green)':'var(--border2)'};position:relative;cursor:pointer;transition:background .2s">
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${autoEmailOn?'left:18px':'left:2px'};transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>
        </div>
      </label>
    </div>
    <div style="display:flex;gap:6px;align-items:center">
      <input id="migEmail" type="email" placeholder="tu@email.com" value="${esc(savedEmail)}" style="flex:1;font-size:12px" onchange="try{localStorage.setItem('beu_backupEmail',this.value)}catch(e){}">
      <button class="btn btn-p btn-sm" onclick="window._op._sendBackupEmail()">📨 Enviar ahora</button>
    </div>
    <div style="font-size:10px;color:var(--text3);margin-top:6px">${autoEmailOn ? '✅ Cada 4h se descargará backup y se abrirá email con el archivo para enviar.' : 'Activa para recibir recordatorio de backup cada 4 horas.'}</div>
  </div>

  <!-- DUPLICATE ANALYSIS -->
  <div style="background:${totalDupes?'var(--all)':'var(--bg3)'};border:1px solid ${totalDupes?'#fde68a':'var(--border)'};border-radius:var(--r2);padding:14px;margin-bottom:12px">
    <div style="font-weight:700;font-size:13px;margin-bottom:6px">🔍 Análisis de duplicados</div>
    ${totalDupes ? `<div style="font-size:12px;color:#92400e;margin-bottom:6px">⚠️ ${totalDupes} posibles duplicados</div>` : '<div style="font-size:12px;color:var(--green)">✅ Sin duplicados</div>'}
    <div style="display:flex;flex-wrap:wrap;gap:4px">${dupeResults.filter(c=>c.total>0).map(c=>`<span class="pill" style="font-size:10px;background:${c.dupes?'var(--rll)':'var(--bg2)'};border:1px solid ${c.dupes?'#fecaca':'var(--border)'}">${c.label}: ${c.total} ${c.dupes?'('+c.dupes+' dupl.)':''}</span>`).join('')}</div>
  </div>

  <!-- MIGRATION INSTRUCTIONS -->
  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r2);padding:14px;margin-bottom:16px">
    <div style="font-weight:700;margin-bottom:8px">📖 Migración v6 → v7</div>
    <ol style="font-size:12px;color:var(--text2);line-height:2;margin-left:16px">
      <li>En v6: cada tab → <b>⬇ Excel</b> → descargar</li>
      <li>En v7: botón <b>📥 Importar</b> de cada colección</li>
      <li>O usar <b>⬇ Exportar TODO</b> / <b>📥 Importar TODO</b></li>
    </ol>
  </div>

  <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-p" onclick="window._op.exportarTodo()">⬇ Exportar TODO</button>
    <label class="btn" style="background:#0d9f6e;color:#fff;cursor:pointer">
      📥 Importar TODO
      <input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importarTodo(this)">
    </label>
  </div>

  <div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text2)">Por colección:</div>
  <div style="display:flex;flex-direction:column;gap:6px">
    ${COLECCIONES.map(col => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2)">
        <div style="flex:1">
          <span style="font-weight:700">${col.label}</span>
          <span style="font-size:11px;color:var(--text3);margin-left:8px">${(DB[col.key]||[]).length} registros</span>
        </div>
        <button class="btn btn-gh btn-sm" onclick="window._op.exportExcel('${col.key}')">⬇ Excel</button>
        <label class="btn btn-gh btn-sm" style="cursor:pointer">
          📥 Importar
          <input type="file" accept=".xlsx,.xls" style="display:none" onchange="window._op.importExcel(this,'${col.key}')">
        </label>
      </div>
    `).join('')}
  </div>

  <div style="margin-top:16px;padding:12px;background:var(--rll);border:1.5px solid #fecaca;border-radius:var(--r2);font-size:12px">
    ⚠️ La importación <b>añade</b> registros. Vacía la colección primero si quieres reemplazar.
  </div>
</div>`;
}

function _sendBackupEmail() {
  const email = document.getElementById('migEmail')?.value;
  if (!email) { toast('Introduce un email','var(--red)'); return; }
  try { localStorage.setItem('beu_backupEmail', email); } catch(e) {}
  exportarTodo();
  const subject = encodeURIComponent('BeUnifyT Backup ' + new Date().toISOString().slice(0,10));
  const body = encodeURIComponent('Adjunta el archivo Excel de backup que se acaba de descargar.\n\nBackup generado: ' + new Date().toLocaleString());
  window.open('mailto:'+email+'?subject='+subject+'&body='+body, '_blank');
  toast('📨 Backup descargado + email abierto', 'var(--green)');
}

function _toggleAutoEmail() {
  const cur = localStorage.getItem('beu_autoEmail') === '1';
  localStorage.setItem('beu_autoEmail', cur ? '0' : '1');
  if (!cur) {
    const email = document.getElementById('migEmail')?.value;
    if (email) localStorage.setItem('beu_backupEmail', email);
    toast('✅ Auto-email activado cada 4h', 'var(--green)');
  } else {
    toast('Auto-email desactivado', 'var(--text3)');
  }
  renderMigracion();
}

async function exportarTodo() {
  if (!isSA()) return;
  if (typeof XLSX === 'undefined') {
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>exportarTodo(); document.head.appendChild(s); return;
  }
  const wb = XLSX.utils.book_new();
  const cols = ['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','editHistory','usuarios','empresas','preregistros'];
  let count = 0;
  for (const col of cols) {
    const data = DB[col] || [];
    if (data.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), col.slice(0,31));
      count++;
    }
  }
  if (!count) { toast('Sin datos para exportar', 'var(--amber)'); return; }
  const fn = `beunifyt_v7_backup_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fn);
  toast(`✅ Exportado: ${fn}`, 'var(--green)');
}

async function importarTodo(inp) {
  if (!isSA()) { toast('Solo SA', 'var(--red)'); return; }
  if (typeof XLSX === 'undefined') {
    const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>importarTodo(inp); document.head.appendChild(s); return;
  }
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async e => {
    try {
      const wb = XLSX.read(e.target.result, { type:'binary' });
      let totalImported = 0;
      const ev = AppState.get('currentEvent');
      for (const sheetName of wb.SheetNames) {
        const col = sheetName;
        if (!DB.hasOwnProperty(col) && !['ingresos','ingresos2','conductores','agenda','movimientos','mensajesRampa','editHistory','usuarios','empresas','preregistros'].includes(col)) continue;
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval:'' });
        if (!rows.length) continue;
        if (!DB[col]) DB[col] = [];
        for (const row of rows) {
          if (!row.id) row.id = uid();
          // Add to Firestore
          const path = ['usuarios','empresas'].includes(col)
            ? `${col}/${row.id}`
            : ev?.id ? `events/${ev.id}/${col}/${row.id}` : `${col}/${row.id}`;
          await fsSet(path, row, false).catch(() => {});
          if (!DB[col].find(x=>x.id===row.id)) DB[col].push(row);
          totalImported++;
        }
      }
      toast(`✅ ${totalImported} registros importados`, 'var(--green)');
      renderMigracion();
    } catch(err) { toast('❌ ' + err.message, 'var(--red)'); }
    inp.value = '';
  };
  r.readAsBinaryString(f);
}

function onRolChange(rol) {
  const tabs = DEFAULT_TABS[rol] || DEFAULT_TABS.visor || [];
  document.querySelectorAll('.uTabChk').forEach(chk => {
    chk.checked = tabs.includes(chk.value);
  });
}


// ═══════════════════════════════════════════════════════════════════════
// V6 CONSTANTS — cloned from BeUnifyT_v6.html
// ═══════════════════════════════════════════════════════════════════════
const HALLS=['1','2A','2B','3A','3B','4','5','6','7','8','CS'];
const SCFG={ALMACEN:{l:'ALMACEN',i:'📦',cls:'s-alm',c:'var(--almacen)'},SOT:{l:'SOT',i:'⏱',cls:'s-sot',c:'var(--sot)'},FIRA:{l:'FIRA',i:'🟢',cls:'s-fira',c:'var(--fira)'},FINAL:{l:'FINAL',i:'✅',cls:'s-fin',c:'#6b7280'}};
const CCFG={EF:{i:'🔴',c:'#dc2626'},SUNDAY:{i:'🟣',c:'#7c3aed'},PRIORITY:{i:'🟠',c:'#ea580c'},GOODS:{i:'🟢',c:'#16a34a'},EMPTY:{i:'⚪',c:'#64748b'}};
const TV={camion:'🚛 Camión',semiremolque:'🚚 Semirremolque',furgoneta:'🚐 Furgoneta',trailer:'🚛 Trailer',coche:'🚗 Coche',moto:'🏍 Moto',otro:'📦 Otro'};
const TV_FIRA={trailer:{lbl:'🚛 Trailer',id:'tvTrailer',val:'trailer'},semiremolque:{lbl:'🚚 B',id:'tvB',val:'semiremolque'},camion:{lbl:'🚗 A',id:'tvA',val:'camion'}};
const TV_STD={trailer:{lbl:'🚛 Trailer',id:'tvTrailer',val:'trailer'},semiremolque:{lbl:'🚚 Semirrem.',id:'tvB',val:'semiremolque'},camion:{lbl:'🚗 Camión',id:'tvA',val:'camion'}};
const GP={tarjeta:'💳 Tarjeta',efectivo:'💵 Efectivo',ambos:'💳💵 Mixto'};
const PP={temporal:'🎫 Temporal',evento:'📋 Evento',vip:'⭐ VIP',staff:'🔧 Staff'};
const EV_CAMPOS=['posicion','llamador','ref','empresa','hall','stand','puertaHall','montador','expositor','nombre','apellido','pasaporte','telefono','email','comentario','horario','fechaNacimiento','pais','remolque','tipoVehiculo','descargaTipo'];
const PRINT_DEF=['posicion','matricula','telefono','empresa','hall','stand','puertaHall','llamador','ref','montador','expositor','remolque','tipoVehiculo','descargaTipo','nombre','apellido','pasaporte','fechaNacimiento','pais','email','comentario','horario'];
const TRACKING_STEPS=[
  {id:'rampa',ico:'🅿️',name:'Rampa',fixed:true},
  {id:'cabina',ico:'🏢',name:'Cabina',fixed:true},
  {id:'salida_parking',ico:'🚗',name:'Salida Parking'},
  {id:'en_ruta',ico:'🛣️',name:'En Ruta al Recinto'},
  {id:'entrada_recinto',ico:'🏟️',name:'Entrada Recinto'},
  {id:'descarga',ico:'📦',name:'Serv. Desc/Carga'},
  {id:'carga',ico:'📦',name:'Carga'},
  {id:'en_espera',ico:'⏳',name:'En Espera'},
  {id:'retorno',ico:'🔙',name:'Retorno Parking'},
  {id:'terminado',ico:'✅',name:'Servicio Terminado',end:true}
];
const PRINT_LABELS={posicion:'🔢 Posición',matricula:'🚛 Matrícula',telefono:'📱 Teléfono',nombre:'👤 Nombre',apellido:'👤 Apellido',empresa:'🏢 Empresa',hall:'🏭 Hall',stand:'📍 Stand',puertaHall:'🚪 Puerta Hall',llamador:'📞 Llamador',ref:'🔖 Ref/Booking',montador:'🔧 Montador',expositor:'🎪 Expositor',remolque:'🚚 Remolque',tipoVehiculo:'🚗 Tipo Vehículo',descargaTipo:'📦 Serv. Descarga/Carga',pasaporte:'🪪 Pasaporte/DNI',fechaNacimiento:'🎂 F. Nacimiento',pais:'🌍 País',email:'✉️ Email',comentario:'📝 Comentario',horario:'🕐 Horario Ingreso'};
const PAISES=[{code:'+34',flag:'🇪🇸'},{code:'+33',flag:'🇫🇷'},{code:'+49',flag:'🇩🇪'},{code:'+39',flag:'🇮🇹'},{code:'+351',flag:'🇵🇹'},{code:'+44',flag:'🇬🇧'},{code:'+31',flag:'🇳🇱'},{code:'+32',flag:'🇧🇪'},{code:'+41',flag:'🇨🇭'},{code:'+43',flag:'🇦🇹'},{code:'+45',flag:'🇩🇰'},{code:'+46',flag:'🇸🇪'},{code:'+47',flag:'🇳🇴'},{code:'+48',flag:'🇵🇱'},{code:'+40',flag:'🇷🇴'},{code:'+36',flag:'🇭🇺'},{code:'+420',flag:'🇨🇿'},{code:'+421',flag:'🇸🇰'},{code:'+385',flag:'🇭🇷'},{code:'+386',flag:'🇸🇮'},{code:'+359',flag:'🇧🇬'},{code:'+30',flag:'🇬🇷'},{code:'+353',flag:'🇮🇪'},{code:'+358',flag:'🇫🇮'},{code:'+370',flag:'🇱🇹'},{code:'+371',flag:'🇱🇻'},{code:'+372',flag:'🇪🇪'},{code:'+380',flag:'🇺🇦'},{code:'+7',flag:'🇷🇺'},{code:'+90',flag:'🇹🇷'},{code:'+212',flag:'🇲🇦'},{code:'+1',flag:'🇺🇸'},{code:'+52',flag:'🇲🇽'},{code:'+55',flag:'🇧🇷'},{code:'+54',flag:'🇦🇷'},{code:'+57',flag:'🇨🇴'},{code:'+56',flag:'🇨🇱'},{code:'+61',flag:'🇦🇺'},{code:'+64',flag:'🇳🇿'}];


const I18N_OP = { es:{on:'ON',off:'OFF'}, en:{on:'ON',off:'OFF'} };
let CUR_LANG = 'es';

// CU alias for V6 compat
function _getCU() { return AppState.get('currentUser'); }

// ═══════════════════════════════════════════════════════════════════════
// V6 UTILITY FUNCTIONS — cloned exactly
// ═══════════════════════════════════════════════════════════════════════
function hBadge(h){return h?`<span class="hbadge">${h}</span>`:'–';}
function sBadge(s){const c=SCFG[s]||{l:s,i:'',cls:'s-fin'};return`<span class="sbadge ${c.cls}">${c.i} ${c.l}</span>`;}
function sAgBadge(s){return`<span class="sbadge s-${s||'PENDIENTE'}">${s||'PENDIENTE'}</span>`;}
function cBadge(c){const x=CCFG[c];return x?`<span class="cbadge" style="color:${x.c}">${x.i} ${c}</span>`:'–';}
function diffMins(p,r){if(!p||!r)return null;try{const tp=new Date('1970-01-01T'+(p.length>5?p.slice(-5):p));const tr2=new Date('1970-01-01T'+(r.length>5?r.slice(-5):r));return Math.round((tr2-tp)/60000);}catch(e){return null;}}
function diffClass(d){if(d===null)return'';if(Math.abs(d)<=10)return'diff-ok';if(d>10)return'diff-tard';return'diff-ant';}
function diffLabel(d){if(d===null)return'–';if(Math.abs(d)<=2)return'✓ Puntual';if(d>0)return`+${d}min`;return`${Math.abs(d)}min ant.`;}
function addH(ts,h){if(!ts)return null;const d=new Date(String(ts).replace(' ','T'));d.setHours(d.getHours()+h);return d.toISOString().replace('T',' ').slice(0,19);}

function sortArr(arr,col,dir){
  if(!col)return arr;
  return [...arr].sort((a,b)=>{
    let va=a[col],vb=b[col];
    const aN=va===undefined||va===null||va==='';
    const bN=vb===undefined||vb===null||vb==='';
    if(aN&&bN)return 0; if(aN)return 1; if(bN)return -1;
    const n=parseFloat(va),m=parseFloat(vb);
    const cmp=(!isNaN(n)&&!isNaN(m))?(n-m):String(va).localeCompare(String(vb),'es',{numeric:true});
    return dir==='desc'?-cmp:cmp;
  });
}

function getRecintoHalls(){const ev=getActiveEvent();if(ev?.halls&&ev.halls.length)return ev.halls;if(ev?.recintoId){const r=DB.recintos.find(x=>x.id===ev.recintoId);if(r&&r.halls&&r.halls.length)return r.halls;}return HALLS;}

function logAudit(a,e,d){if(!DB.auditLog)DB.auditLog=[];const CU=_getCU();DB.auditLog.unshift({id:uid(),ts:nowLocal(),user:CU?.nombre||'?',action:a,entity:e,detail:d});if(DB.auditLog.length>300)DB.auditLog=DB.auditLog.slice(0,300);}

function logExport(tab,filename){if(!DB.exportLog)DB.exportLog=[];const CU=_getCU();DB.exportLog.unshift({id:uid(),ts:nowLocal(),user:CU?.nombre||'?',tab,filename});}


function autoMsg(tipo,titulo,mensaje,mat='',horasExpira=null){const CU=_getCU();const expiraTs=horasExpira?Date.now()+(horasExpira*60*60*1000):null;const m={id:uid(),ts:nowLocal(),autor:CU?.nombre||'Sistema',tipo,titulo,mensaje,matricula:mat,leido:[SID],pausado:false,expiraTs};DB.mensajesRampa.unshift(m);if(DB.mensajesRampa.length>100)DB.mensajesRampa=DB.mensajesRampa.slice(0,100);saveDB();}

let pendingDelFn = null;
let _lastMsgCount = 0;
let _fiHalls = [];
let editIngId=null, editAgId=null, editCondId=null, editMovId=null, editEvId=null, editEEId=null, editLNId=null, editUserId=null;
let fF = {q:'',status:'',hall:''};
let cF = {q:'',empresa:''};
let agF = {q:'',fecha:'',estado:'',evento:'',desde:'',hasta:'',hall:''};

// ═══════════════════════════════════════════════════════════════════════
// V6 MODAL — generic confirm/delete modal
// ═══════════════════════════════════════════════════════════════════════

function askDel(title,detail,fn){
  const existing = document.getElementById('beuDelModal');
  if (existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = 'beuDelModal';
  ov.className = 'ov open';
  ov.innerHTML = `<div class="modal modal-sm"><div class="mhdr"><span class="mttl">⚠️ ${title}</span></div><div style="padding:10px 0;font-size:13px;color:var(--text2)">${detail}</div><div style="font-size:11px;color:var(--text3);margin-bottom:12px">Esta acción no se puede deshacer</div><div class="ffoot"><button class="btn btn-gh" onclick="document.getElementById('beuDelModal').remove()">Cancelar</button><button class="btn btn-danger" id="beuDelConfirm" style="background:var(--red);color:#fff">${_M('delete')}</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('beuDelConfirm').addEventListener('click', () => { ov.remove(); if (fn) fn(); });
}


function softDelete(coleccion,id,renderFn){
  if(!DB.papelera)DB.papelera=[];
  const item=(DB[coleccion]||[]).find(x=>x.id===id);
  if(item){DB.papelera.unshift({...item,_from:coleccion,_delTs:nowLocal(),_delBy:_getCU()?.nombre||'?'});if(DB.papelera.length>200)DB.papelera=DB.papelera.slice(0,200);}
  DB[coleccion]=(DB[coleccion]||[]).filter(x=>x.id!==id);
  logAudit('delete',coleccion,'Eliminado: '+(item?.matricula||item?.nombre||id));
  saveDB();
  if(renderFn)renderFn();
  renderHdr();
}

async function saveDBNow() { await saveDB(); }

// ═══════════════════════════════════════════════════════════════════════
// V6 ACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════
function marcarSalidaIng(id){const i=DB.ingresos.find(x=>x.id===id);if(!i)return;i.salida=nowLocal();saveDB();renderIngresos();renderHdr();toast('↩ Salida registrada','var(--green)');}
function reactivarIngreso(id){const i=DB.ingresos.find(x=>x.id===id);if(!i)return;i.salida=null;saveDB();renderIngresos();renderHdr();toast('↺ Reactivado','var(--amber)');}

function askDelIng(id){const i=DB.ingresos.find(x=>x.id===id);if(!i)return;askDel('Eliminar ingreso','<b>'+i.matricula+'</b>',()=>{softDelete('ingresos',id,renderIngresos);});}
function askDelLN(id){const ln=DB.listaNegra.find(x=>x.id===id);if(!ln)return;askDel('Eliminar de especial','<b>'+ln.matricula+'</b>',()=>{DB.listaNegra=DB.listaNegra.filter(x=>x.id!==id);saveDB();renderIngresos();});}
function askDelEE(id){askDel('Eliminar de espera','',()=>{DB.enEspera=DB.enEspera.filter(x=>x.id!==id);saveDB();renderIngresos();});}
function askDelAg(id){const a=DB.agenda.find(x=>x.id===id);if(!a)return;askDel('Eliminar cita','<b>'+(a.matricula||'')+'</b>',()=>{softDelete('agenda',id,renderAgenda);});}
function askDelCond(id){const c=DB.conductores.find(x=>x.id===id);if(!c)return;askDel('Eliminar conductor','<b>'+c.nombre+'</b>',()=>{softDelete('conductores',id,renderConductores);});}
function askDelMov(id){const m=DB.movimientos.find(x=>x.id===id);if(!m)return;askDel('Eliminar movimiento','<b>'+m.matricula+'</b>',()=>{softDelete('movimientos',id,renderFlota);});}
function askDelEvento(id){if(!isSA()){toast('SuperAdmin','var(--red)');return;}const ev=DB.eventos.find(x=>x.id===id);if(!ev)return;askDel('Eliminar evento','<b>'+ev.nombre+'</b>',()=>{if(!DB.eventosPapelera)DB.eventosPapelera=[];DB.eventosPapelera.unshift({...ev,_deletedBy:_getCU()?.nombre||'?',_deletedTs:nowLocal()});DB.eventos=DB.eventos.filter(x=>x.id!==id);if(DB.activeEventId===id){DB.activeEventId=null;DB.activeEventIds=[];}logAudit('del_evento','evento','Eliminado: '+ev.nombre);saveDB();renderEventosTab();});}
function askDelMsg(id){askDel('Eliminar mensaje','',()=>{DB.mensajesRampa=DB.mensajesRampa.filter(x=>x.id!==id);saveDB();renderMensajesTab();renderHdr();});}

function marcarAgLlegado(id){const a=DB.agenda.find(x=>x.id===id);if(!a)return;a.estado='LLEGADO';a.horaReal=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});saveDB();renderAgenda();renderHdr();toast('✅ Llegada registrada','var(--green)');}
function marcarAgSalida(id){const a=DB.agenda.find(x=>x.id===id);if(!a)return;a.estado='SALIDA';a.horaSalida=nowLocal();saveDB();renderAgenda();toast('🔵 Salida registrada');}

function marcarTodosMsgLeidos(){DB.mensajesRampa.forEach(m=>{if(!m.leido)m.leido=[];if(!m.leido.includes(SID))m.leido.push(SID);});saveDB();renderMensajesTab();renderHdr();}

function cambiarEstMov(id,status){const m=DB.movimientos.find(x=>x.id===id);if(!m)return;m.status=status;m.lastStatusTs=nowLocal();saveDB();renderFlota();renderHdr();}

function setDefaultEvento(id){DB.defaultEventId=id;saveDB();toast('✅ Evento por defecto','var(--green)');renderEventosTab();}
function restoreEventoVersion(idx){const h=(DB.eventoHistorial||[]);if(!h[idx])return;const ev=h[idx];const existing=DB.eventos.find(x=>x.id===ev.id);if(existing)Object.assign(existing,ev);else DB.eventos.push({...ev});saveDB();toast('↺ Versión restaurada','var(--green)');renderEventosTab();}
function restoreEventoDeleted(idx){const p=(DB.eventosPapelera||[]);if(!p[idx])return;DB.eventos.push({...p[idx]});DB.eventosPapelera.splice(idx,1);saveDB();toast('↺ Evento restaurado','var(--green)');renderEventosTab();}

// ═══ TRACKING ═══
function registrarPasoTracking(id,col){
  col=col||'ingresos';
  const item=(DB[col]||[]).find(x=>x.id===id);
  if(!item)return;
  if(!item.tracking)item.tracking=[];
  const next=TRACKING_STEPS.find(s=>!item.tracking.find(t=>t.step===s.id));
  if(!next){toast('Tracking completo','var(--amber)');return;}
  item.tracking.push({step:next.id,ts:nowLocal(),user:_getCU()?.nombre||'?'});
  logAudit('tracking',col,item.matricula+' → '+next.name);
  saveDB();
  if(col==='ingresos')renderIngresos();else if(col==='ingresos2')renderIngresos2();
  toast('📡 '+next.name,'var(--green)');
}

function registrarPasoTrackingAg(agId){
  const item=DB.agenda.find(x=>x.id===agId);
  if(!item)return;
  if(!item.tracking)item.tracking=[];
  const next=TRACKING_STEPS.find(s=>!item.tracking.find(t=>t.step===s.id));
  if(!next){toast('Tracking completo','var(--amber)');return;}
  item.tracking.push({step:next.id,ts:nowLocal(),user:_getCU()?.nombre||'?'});
  saveDB();renderAgenda();
  toast('📡 '+next.name,'var(--green)');
}

// ═══ PRINT (delegated to impresion module when available, fallback simple) ═══
function printIngreso(id){
  const i=DB.ingresos.find(x=>x.id===id);
  if(!i){toast('No encontrado','var(--red)');return;}
  toast('🖨 Imprimiendo...','var(--blue)');
  // Delegate to impresion module if loaded
  if(window._imp&&window._imp.printIngreso)window._imp.printIngreso(id);
}
function printTrqRef(id){toast('✂ Troquelado en preparación','var(--purple)');if(window._imp&&window._imp.printTrqRef)window._imp.printTrqRef(id);}
function printTrqIng(id){toast('✂ Troquelado en preparación','var(--purple)');if(window._imp&&window._imp.printTrqIng)window._imp.printTrqIng(id);}
function printAgendaItem(id){toast('🖨 Imprimiendo agenda','var(--blue)');if(window._imp&&window._imp.printAgendaItem)window._imp.printAgendaItem(id);}

// ═══ DETAIL VIEWS ═══

function showAgDetalle(id){
  const a=DB.agenda.find(x=>x.id===id);if(!a)return;
  _modal('Agenda — '+a.matricula,`<div class="sg sg2">
    <div class="fg"><span class="flbl">Matrícula</span><span class="mchip">${a.matricula}</span></div>
    <div class="fg"><span class="flbl">Fecha/Hora</span>${a.fecha} ${a.hora||''}</div>
    <div class="fg"><span class="flbl">Conductor</span>${a.conductor||'–'}</div>
    <div class="fg"><span class="flbl">Empresa</span>${a.empresa||'–'}</div>
    <div class="fg"><span class="flbl">Hall</span>${hBadge(a.hall)}</div>
    <div class="fg"><span class="flbl">Stand</span>${a.stand||'–'}</div>
    <div class="fg"><span class="flbl">Estado</span>${sAgBadge(a.estado)}</div>
    <div class="fg"><span class="flbl">Hora Real</span>${a.horaReal||'–'}</div>
    <div class="fg"><span class="flbl">Notas</span>${a.notas||'–'}</div>
  </div>`,null);
  setTimeout(()=>{const s=document.getElementById('dynModalSave');if(s)s.style.display='none';},50);
}

function showCondDetalle(id){
  const c=DB.conductores.find(x=>x.id===id);if(!c)return;
  _modal('Conductor — '+(c.nombre||''),`<div class="sg sg2">
    <div class="fg"><span class="flbl">Nombre</span><b>${c.nombre||''} ${c.apellido||''}</b></div>
    <div class="fg"><span class="flbl">Empresa</span>${c.empresa||'–'}</div>
    <div class="fg"><span class="flbl">Matrícula</span>${c.matricula?`<span class="mchip">${c.matricula}</span>`:'–'}</div>
    <div class="fg"><span class="flbl">Teléfono</span>${c.telefono||'–'}</div>
    <div class="fg"><span class="flbl">Hall</span>${hBadge(c.hall)}</div>
  </div>`,null);
  setTimeout(()=>{const s=document.getElementById('dynModalSave');if(s)s.style.display='none';},50);
}

// ═══ EXPORT FUNCTIONS ═══
function exportIngresos(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}if(!DB.ingresos.length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.ingresos.map(i=>({Pos:i.pos||'',Matricula:i.matricula,Llamador:i.llamador||'',Referencia:i.referencia||'',Nombre:i.nombre||'',Apellido:i.apellido||'',Empresa:i.empresa||'',Montador:i.montador||'',Expositor:i.expositor||'',Hall:(i.halls||[i.hall||'']).join('/'),Stand:i.stand||'',Remolque:i.remolque||'',Telefono:i.telefono||'',Email:i.email||'',Comentario:i.comentario||'',Entrada:fmt(i.entrada),Salida:i.salida?fmt(i.salida):''+_M('onPremises')+''}))),'Ingresos');const fn='ingresos_'+new Date().toISOString().slice(0,10)+'.xlsx';XLSX.writeFile(wb,fn);logExport('Ingresos',fn);toast(_M('saved'));}
function exportFlota(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}if(!DB.movimientos.length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.movimientos.map(m=>({Pos:m.posicion||'',Estado:m.status,Tractora:m.matricula,Remolque:m.remolque||'',Empresa:m.empresa||'',Hall:m.hall||''}))),'Flota');const fn='flota_'+new Date().toISOString().slice(0,10)+'.xlsx';XLSX.writeFile(wb,fn);logExport('Flota',fn);toast(_M('saved'));}
function exportConductores(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}if(!DB.conductores.length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.conductores.map(c=>({Nombre:c.nombre,Apellido:c.apellido,Empresa:c.empresa||'',Matricula:c.matricula||'',Telefono:c.telefono||''}))),'Conductores');XLSX.writeFile(wb,'conductores.xlsx');logExport('Conductores','conductores.xlsx');toast(_M('saved'));}
function exportAgenda(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}if(!DB.agenda.length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.agenda.map(a=>({Fecha:a.fecha,HoraPlan:a.hora,HoraReal:a.horaReal||'',Matricula:a.matricula,Conductor:a.conductor||'',Empresa:a.empresa||'',Hall:a.hall||'',Estado:a.estado}))),'Agenda');const fn='agenda_'+new Date().toISOString().slice(0,10)+'.xlsx';XLSX.writeFile(wb,fn);logExport('Agenda',fn);toast(_M('saved'));}
function exportListaNegra(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}if(!DB.listaNegra.length){toast(_M('noRecords'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.listaNegra.map(ln=>({Matricula:ln.matricula,Nivel:ln.nivel,Motivo:ln.motivo,Empresa:ln.empresa||'',Hasta:ln.hasta||''}))),'ListaNegra');XLSX.writeFile(wb,'listanegra.xlsx');toast(_M('saved'));}
function exportMensajes(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.mensajesRampa.map(m=>({Tipo:m.tipo,Titulo:m.titulo,Mensaje:m.mensaje,Autor:m.autor,Fecha:m.ts}))),'Mensajes');XLSX.writeFile(wb,'mensajes.xlsx');toast(_M('saved'));}
function exportEventos(){if(!canExport()){toast(_M('noPermImport'),'var(--red)');return;}const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(DB.eventos.map(e=>({Nombre:e.nombre,Inicio:e.ini,Fin:e.fin,Recinto:e.recinto||'',Ciudad:e.ciudad||'',Activo:e.activo?'SI':'NO'}))),'Eventos');XLSX.writeFile(wb,'eventos.xlsx');toast(_M('saved'));}

// ═══ TEMPLATE FUNCTIONS ═══
function dlTemplateIng(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Matricula','Llamador','Referencia','Nombre','Apellido','Empresa','Montador','Expositor','Hall','Stand','Remolque','Pasaporte','Telefono','Email','Comentario','Idioma','Pos']]),'Referencia');XLSX.writeFile(wb,'plantilla_referencia.xlsx');toast('📥 Plantilla','var(--blue)');}
function dlTemplateIng2(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Matricula','Nombre','Apellido','Empresa','Hall','Stand','Remolque','Telefono','Comentario','Pos']]),'Ingresos');XLSX.writeFile(wb,'plantilla_ingresos.xlsx');toast('📥 Plantilla','var(--blue)');}
function dlTemplateAg(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Matricula','Fecha','HoraPlan','Remolque','Conductor','Empresa','Hall','Stand','Telefono','Notas']]),'Agenda');XLSX.writeFile(wb,'plantilla_agenda.xlsx');toast('📥 Plantilla','var(--blue)');}
function downloadPlantillaCond(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Nombre','Apellido','Empresa','Matricula','Remolque','Telefono','Hall','TipoVehiculo','Idioma']]),'Conductores');XLSX.writeFile(wb,'plantilla_conductores.xlsx');toast('📥 Plantilla','var(--blue)');}

// ═══ RENDER HELPERS ═══
function _ingHistorial(collection){
  const hist=(DB.editHistory||[]).filter(h=>!collection||(h.collection===collection||!h.collection));
  const clearBtn=isSA()?`<button class="btn btn-danger btn-sm" onclick="vaciarHistorial('${collection}')">💥 Vaciar</button>`:'';
  if(!hist.length)return`<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px">${clearBtn}</div><div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">Sin modificaciones registradas</div>`;
  const icoMap={new:'✅ Nuevo',edit:'✏️ Editado',salida:'↩ Salida',reactivar:'↺ Reactivado'};
  return`<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px"><span style="font-size:11px;color:var(--text3)">${hist.length} registros</span>${clearBtn}</div>
  <div class="tbl-wrap"><table class="dtbl"><thead><tr><th>#</th><th>Matrícula</th><th>Acción</th><th>Usuario</th><th>Hora</th></tr></thead><tbody>
    ${hist.map(h=>`<tr><td style="font-weight:800;color:var(--text3);font-size:11px">${h.pos?'#'+h.pos:''}</td><td><span class="mchip-sm">${h.mat||'–'}</span></td><td style="font-size:11px">${icoMap[h.action]||h.action||''}</td><td style="font-size:11px;color:var(--text3)">${h.user||'–'}</td><td style="font-size:11px;font-family:'JetBrains Mono',monospace">${fmt(h.ts)}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function renderCamposSubtab(col){
  if(!canCampos())return '<div style="padding:16px;text-align:center;color:var(--text3);font-size:12px">Sin permiso para configurar campos visibles.</div>';
  return _renderCamposSubtab(null, col);
}

function renderMensajesTab(){
  const el=document.getElementById('tabContent');if(!el)return;
  const msgs=DB.mensajesRampa||[];
  el.innerHTML=`<div class="sec-hdr"><div class="sec-ttl">📢 ${_M('messages')} (${msgs.length})</div><div class="sec-act">${canExport()?'<button class="btn btn-gh btn-sm" onclick="exportMensajes()">⬇ Excel</button>':''}${isSup()?`<button class="btn btn-p btn-sm" onclick="window._op.openMsgModal()">+ ${_M('messages')}</button>`:''}${msgs.length?`<button class="btn btn-gh btn-sm" onclick="marcarTodosMsgLeidos()">✓ ${_M('read')} ${_M('all')}</button>`:''}</div></div>
  ${msgs.length?msgs.map(m=>{const leido=m.leido&&m.leido.includes(SID);return`<div style="padding:8px 12px;border-radius:var(--r);border:1.5px solid ${leido?'var(--border)':'var(--red)'};background:${leido?'var(--bg2)':'var(--rll)'};margin-bottom:4px"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:12px">${m.titulo||m.tipo||'Mensaje'}</b><span style="font-size:10px;color:var(--text3)">${fmt(m.ts)}</span></div><div style="font-size:12px;color:var(--text2);margin-top:3px">${m.mensaje||''}</div><div style="display:flex;gap:4px;margin-top:4px"><span style="font-size:10px;color:var(--text3)">Por: ${m.autor||'?'}</span>${!leido?`<button class="btn btn-xs btn-gh" onclick="window._op.marcarMsgLeido('${m.id}')">✓ Leído</button>`:''}<button class="btn btn-xs btn-danger" onclick="askDelMsg('${m.id}')">🗑</button></div></div>`;}).join(''):`<div class="empty"><div class="ei">📢</div><div class="et">Sin mensajes</div></div>`}`;
}

function openMovModal(m){
  editMovId=m?m.id:null;
  _modal(m?'Editar movimiento':'Nuevo movimiento',`
    <div class="sg sg2">
      <div class="fg"><label class="flbl">Matrícula *</label><input id="fmMat" value="${esc(m?.matricula||'')}"></div>
      <div class="fg"><label class="flbl">Remolque</label><input id="fmRem" value="${esc(m?.remolque||'')}"></div>
      <div class="fg"><label class="flbl">Nombre</label><input id="fmNom" value="${esc(m?.nombre||'')}"></div>
      <div class="fg"><label class="flbl">Empresa</label><input id="fmEmp" value="${esc(m?.empresa||'')}"></div>
      <div class="fg"><label class="flbl">Hall</label><input id="fmHall" value="${esc(m?.hall||'')}"></div>
      <div class="fg"><label class="flbl">Status</label><select id="fmStatus"><option value="ALMACEN">ALMACEN</option><option value="SOT">SOT</option><option value="FIRA">FIRA</option><option value="FINAL">FINAL</option></select></div>
      <div class="fg"><label class="flbl">Posición</label><input id="fmPos" type="number" value="${m?.posicion||''}"></div>
    </div>`, async () => {
    const mat=normPlate(gv('fmMat'));if(!mat){toast(_M('plateMandatory'),'var(--red)');return;}
    const data={id:editMovId||uid(),matricula:mat,remolque:gv('fmRem'),nombre:gv('fmNom'),empresa:gv('fmEmp'),hall:gv('fmHall'),status:gv('fmStatus')||'ALMACEN',posicion:gv('fmPos'),entrada:m?.entrada||nowLocal()};
    if(!DB.movimientos)DB.movimientos=[];
    const idx=DB.movimientos.findIndex(x=>x.id===data.id);
    if(idx>=0)DB.movimientos[idx]=data;else DB.movimientos.push(data);
    document.getElementById('dynModal').remove();
    saveDB();renderFlota();toast(_M('saved'),'var(--green)');
  });
  setTimeout(()=>{if(m?.status){const s=document.getElementById('fmStatus');if(s)s.value=m.status;}},50);
}


// ─── EXPOSE API ───────────────────────────────────────────────────────
window._iF = iF;
window._dashEvFilter = _dashEvFilter;
window._audSub = 'sesiones';
window._uSub = 'operadores';
window._uQ = '';
window._audQ = '';
window._ingSource = 'ingresos';

// ═══ CAMERA PLATE SCANNER ═══════════════════════════════════════════
let _camStream = null;
let _camResultMat = '';

function openCamScan() {
  // Inject modal if not present
  if (!document.getElementById('camModal')) {
    const d = document.createElement('div');
    d.id = 'camModal';
    d.className = 'modal-bg';
    d.innerHTML = `<div class="modal-box" style="max-width:440px">
      <div class="modal-hdr"><div class="modal-ttl">📷 Escanear Matrícula</div><button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3)" onclick="window._op.closeCamScan()">✕</button></div>
      <div style="position:relative;border-radius:var(--r);overflow:hidden;background:#000">
        <video id="camFeed" autoplay playsinline muted style="width:100%;max-height:260px;object-fit:cover;display:none"></video>
        <canvas id="camCanvas" style="display:none"></canvas>
        <div id="camPlaceholder" style="padding:40px;text-align:center;color:#999;font-size:12px">Iniciando cámara...</div>
      </div>
      <div id="camResult" style="margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:900;text-align:center;min-height:30px;color:var(--blue)"></div>
      <div id="camStatus" style="font-size:11px;color:var(--text3);text-align:center;margin-top:4px"></div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
        <button class="btn btn-p" style="flex:1" onclick="window._op.captureOCR()">📸 Capturar</button>
        <button class="btn btn-g" id="btnCamUse" style="display:none" onclick="window._op.useCamResult()">✓ Usar</button>
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;justify-content:center">
        <input type="file" id="camFileInput" accept="image/*" capture="environment" style="display:none" onchange="window._op.processCamFile(this)">
        <button class="btn btn-gh btn-sm" onclick="document.getElementById('camFileInput').click()">📁 Elegir imagen</button>
        <button class="btn btn-gh btn-sm" onclick="window._op.switchCam()">🔄 Cambiar cámara</button>
      </div>
      <div style="margin-top:10px;padding:8px;background:var(--bg3);border-radius:var(--r);font-size:10px;color:var(--text3)">
        <b>Manual:</b> Si OCR no detecta, escribe directamente en el campo matrícula.
      </div>
    </div>`;
    document.body.appendChild(d);
    d.onclick = e => { if (e.target === d) { window._op.closeCamScan(); } };
  }
  document.getElementById('camModal').style.display = 'flex';
  document.getElementById('camResult').textContent = '';
  document.getElementById('camStatus').textContent = '';
  document.getElementById('btnCamUse').style.display = 'none';
  _camResultMat = '';
  _startCamera('environment');
}

let _camFacing = 'environment';
function switchCam() {
  _camFacing = _camFacing === 'environment' ? 'user' : 'environment';
  _startCamera(_camFacing);
}

async function _startCamera(facing) {
  try {
    if (_camStream) { _camStream.getTracks().forEach(t => t.stop()); _camStream = null; }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } } });
    _camStream = stream;
    const v = document.getElementById('camFeed');
    if (v) { v.srcObject = stream; v.style.display = 'block'; }
    const ph = document.getElementById('camPlaceholder');
    if (ph) ph.style.display = 'none';
  } catch (e) {
    const ph = document.getElementById('camPlaceholder');
    if (ph) ph.textContent = 'Cámara no disponible. Usa "Elegir imagen".';
    document.getElementById('camStatus').textContent = '📁 Usa el botón para seleccionar foto';
  }
}

function closeCamScan() {
  if (_camStream) { _camStream.getTracks().forEach(t => t.stop()); _camStream = null; }
  const m = document.getElementById('camModal');
  if (m) m.style.display = 'none';
}

function captureOCR() {
  const v = document.getElementById('camFeed');
  const c = document.getElementById('camCanvas');
  if (!v || !v.srcObject) { document.getElementById('camStatus').textContent = 'Sin cámara activa. Usa "Elegir imagen".'; return; }
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  c.toBlob(blob => _processPlateImage(blob), 'image/jpeg', 0.92);
}

function processCamFile(inp) {
  const file = inp.files[0]; if (!file) return;
  document.getElementById('camStatus').textContent = '⏳ Analizando...';
  _processPlateImage(file);
  inp.value = '';
}

async function _processPlateImage(blob) {
  const st = document.getElementById('camStatus');
  st.textContent = '⏳ Analizando imagen...';
  try {
    const b64 = await _blobToB64(blob);
    // Try Tesseract.js first (free, local)
    if (!window.Tesseract) {
      st.textContent = '⏳ Cargando OCR (primera vez)...';
      await _loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    }
    if (window.Tesseract) {
      const worker = await Tesseract.createWorker('eng', 1, { logger: m => { if (m.status === 'recognizing text') st.textContent = `⏳ OCR ${Math.round(m.progress*100)}%`; } });
      const { data: { text } } = await worker.recognize(blob);
      await worker.terminate();
      const plate = _extractPlate(text);
      if (plate) {
        _camResultMat = plate;
        document.getElementById('camResult').textContent = plate;
        document.getElementById('btnCamUse').style.display = 'inline-flex';
        st.textContent = '✅ Matrícula detectada';
        return;
      }
    }
    st.textContent = '❌ No detectada. Captura más cerca o escribe manualmente.';
  } catch (e) {
    st.textContent = '❌ Error OCR: ' + (e.message||e);
  }
}

function _extractPlate(text) {
  const clean = text.toUpperCase().replace(/[^A-Z0-9\s\n\-]/g, '');
  const lines = clean.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length >= 4 && l.length <= 12);
  // European plate pattern: 4 digits + 3 letters, or letters + digits combos
  const patterns = [
    /\b\d{4}\s?[A-Z]{3}\b/,           // Spain: 1234 ABC
    /\b[A-Z]{2}\s?\d{3,4}\s?[A-Z]{2}\b/, // Generic EU
    /\b[A-Z]{1,3}\s?\d{2,4}\s?[A-Z]{1,3}\b/, // General
    /\b\d{2,4}\s?[A-Z]{2,4}\b/,       // Digits + Letters
  ];
  for (const line of lines) {
    for (const pat of patterns) {
      const m = line.match(pat);
      if (m) return m[0].replace(/\s+/g, '');
    }
  }
  // Fallback: longest alphanumeric segment
  if (lines.length) return lines.sort((a,b) => b.length - a.length)[0].replace(/\s+/g, '');
  return null;
}

function _blobToB64(blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); }); }
function _loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }

function useCamResult() {
  if (!_camResultMat) return;
  const mat = document.getElementById('mMat');
  if (mat) mat.value = _camResultMat;
  closeCamScan();
  toast('✅ Matrícula: ' + _camResultMat, 'var(--green)');
}

// ═══ END CAMERA SCANNER ═════════════════════════════════════════════

window._op = {
  goTab,
  renderDash, renderIngresos, renderIngresos2, renderFlota, renderConductores,
  renderAgenda, renderAnalytics, renderVehiculos, renderAuditoria, renderPapelera,
  renderImpresion, renderRecintos, renderEventosTab, renderMensajes: renderMensajesTab, renderUsuarios,
  openIngModal, openFlotaModal, openCondModal, openAgendaModal, openEventoModal,
  openRecintoModal, openUserModal, openMsgModal, openMovModal, showDetalle: showIngDetalle,
  openCamScan, closeCamScan, captureOCR, useCamResult, processCamFile, switchCam,
  registrarSalida, reactivar, eliminar, eliminarUsuario,
  setFlotaStatus: cambiarEstMov, setAgendaEstado, activarEvento, desactivarEvento,
  restaurar, vaciarPapelera, vaciarTab, vaciarHistorial, marcarMsgLeido,
  exportExcel, exportAuditLog, importExcel,
  onRolChange,
  openEmpresaModal: (id) => {
    const e = id ? (DB.empresas||[]).find(x=>x.id===id) : null;
    const emp = e || {};
    _modal(e ? 'Editar empresa' : 'Nueva empresa', `
      <div class="sg sg2">
        <div class="fg"><label class="flbl">Nombre *</label><input id="emNom" value="${esc(emp.nombre||'')}"></div>
        <div class="fg"><label class="flbl">CIF/VAT</label><input id="emCif" value="${esc(emp.cif||'')}"></div>
        <div class="fg"><label class="flbl">Email *</label><input id="emEmail" type="email" value="${esc(emp.email||'')}"></div>
        <div class="fg"><label class="flbl">Contacto</label><input id="emCont" value="${esc(emp.contacto||'')}"></div>
        <div class="fg"><label class="flbl">Teléfono</label><input id="emTel" value="${esc(emp.tel||'')}"></div>
        ${!e ? `<div class="fg"><label class="flbl">"+_M("password")+" *</label>
          <div style="position:relative;display:flex;align-items:center">
            <input id="emPass" type="password" placeholder="Mín. 8 caracteres" style="padding-right:36px">
            <button type="button" onclick="(function(){var i=document.getElementById('emPass');i.type=i.type==='password'?'text':'password';})()" style="position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text3);display:flex">${EYE_SVG}</button>
          </div>
        </div>` : ''}
      </div>
    `, async () => {
      const nom = gv('emNom'); if (!nom) { toast(_M('plateMandatory'),'var(--red)'); throw new Error('cancel'); }
      const email = gv('emEmail');
      const pass = gv('emPass');
      let empId = emp.id || uid();
      // Create Firebase Auth user for new empresa
      if (!e && email && pass) {
        if (pass.length < 8) { toast('Contraseña mínimo 8 caracteres','var(--red)'); throw new Error('cancel'); }
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
          const { getBEUAuth } = await import('../firestore.js');
          const cred = await createUserWithEmailAndPassword(getBEUAuth(), email, pass);
          await updateProfile(cred.user, { displayName: nom });
          empId = cred.user.uid;
        } catch(err) {
          if (err.code === 'auth/email-already-in-use') toast('Email ya registrado','var(--amber)');
          else { toast('Error: '+err.message,'var(--red)'); throw err; }
        }
      }
      const data = { id:empId, nombre:nom, cif:gv('emCif'), email, contacto:gv('emCont'), tel:gv('emTel'), nivel:emp.nivel||'semi', tipo:'empresa', vehiculos:emp.vehiculos||[] };
      if (!DB.empresas) DB.empresas = [];
      const idx = DB.empresas.findIndex(x=>x.id===data.id);
      if (idx>=0) DB.empresas[idx]=data; else DB.empresas.push(data);
      await fsSet('companies/'+data.id, data, false);
      // Also create user doc for portal access
      if (!e) {
        await fsSet('users/'+data.id, { id:data.id, nombre:nom, email, rol:'empresa', empresaId:data.id, nivel:'semi', lang:'es' }, false);
      }
      toast('✅ Empresa guardada','var(--green)');
      renderEmpresasTab();
    });
  },
  verPortalEmpresa: async (id) => {
    const emp = (DB.empresas||[]).find(x=>x.id===id); if(!emp) return;
    const prev = AppState.get('currentUser');
    AppState.set('currentUser', { ...prev, rol:'empresa', empresaId:id, nombre:emp.nombre, _saPreview:true, _saUser:prev });
    const m = await import('./portal.js');
    m.initPortal();
  },
  setEmpresaNivel: async (id, nivel) => {
    const emp = (DB.empresas||[]).find(x=>x.id===id); if(!emp) return;
    emp.nivel = nivel;
    await fsSet('companies/' + id, emp, false);
    toast(nivel==='verified'?'✅ Verificada':nivel==='blocked'?'🚫 Bloqueada':'↩ Semi','var(--blue)');
    renderEmpresasTab();
  },
  resetAllData, openLangPicker, setLang, handleLogout, cycleTheme, selectTheme, toggleThemeMenu, _anlExport, _anlSmartInsights,
  renderMigracion, exportarTodo, importarTodo, _sendBackupEmail, _toggleAutoEmail,
  openLNModal, openEEModal, marcarEELlegado, cycleCampo, saveCamposCfg, resetCamposCfg, addCustomCampo,
  renderHdr, renderEmpresasTab, renderMensajesTab,
  setSort, dlTemplateVehiculos: dlTemplateFlota,
  tabDragStart, tabDragOver, tabDrop, tabDragEnd,
  // Export & template
  exportIngresos, exportIngresos2, exportFlota, exportConductores, exportAgenda,
  exportListaNegra, exportMensajes, exportEventos,
  dlTemplateIng, dlTemplateIng2, dlTemplateAg, dlTemplateFlota, downloadPlantillaCond,
  dlTemplateEmpresas, dlTemplateUsuarios, dlTemplateRecintos,
};

// ── Global aliases so inline onclick handlers work ──
window.goTab = goTab;
window.renderIngresos = renderIngresos;
window.renderIngresos2 = renderIngresos2;
window.renderFlota = renderFlota;
window.renderConductores = renderConductores;
window.renderAgenda = renderAgenda;
window.renderMensajesTab = renderMensajesTab;
window.renderHdr = renderHdr;
window.openIngModal = openIngModal;
window.openFlotaModal = openFlotaModal;
window.openCondModal = openCondModal;
window.openAgendaModal = openAgendaModal;
window.openMovModal = openMovModal;
window.openEventoModal = openEventoModal;
window.openRecintoModal = openRecintoModal;
window.openUserModal = openUserModal;

// Action aliases
window.showIngDetalle = showIngDetalle;
window.showAgDetalle = showAgDetalle;
window.showCondDetalle = showCondDetalle;
window.marcarSalidaIng = marcarSalidaIng;
window.reactivarIngreso = reactivarIngreso;
window.marcarSalidaIng2 = marcarSalidaIng2;
window.reactivarIngreso2 = reactivarIngreso2;
window.askDelIng = askDelIng;
window.askDelIng2 = askDelIng2;
window.askDelLN = askDelLN;
window.askDelEE = askDelEE;
window.askDelAg = askDelAg;
window.askDelCond = askDelCond;
window.askDelMov = askDelMov;
window.askDelEvento = askDelEvento;
window.askDelMsg = askDelMsg;
window.askDel = askDel;
window.marcarAgLlegado = marcarAgLlegado;
window.marcarAgSalida = marcarAgSalida;
window.marcarTodosMsgLeidos = marcarTodosMsgLeidos;
window.marcarEELlegado = (id) => window._op.marcarEELlegado && window._op.marcarEELlegado(id);
window.cambiarEstMov = cambiarEstMov;
window.setDefaultEvento = setDefaultEvento;
window.restoreEventoVersion = restoreEventoVersion;
window.restoreEventoDeleted = restoreEventoDeleted;
window.registrarPasoTracking = registrarPasoTracking;
window.registrarPasoTrackingAg = registrarPasoTrackingAg;

// Print aliases
window.printIngreso = printIngreso;
window.printTrqRef = printTrqRef;
window.printTrqIng = printTrqIng;
window.printAgendaItem = printAgendaItem;
window.printIngreso2 = printIngreso2;

// Export/template aliases
window.exportIngresos = exportIngresos;
window.exportIngresos2 = exportIngresos2;
window.exportFlota = exportFlota;
window.exportConductores = exportConductores;
window.exportAgenda = exportAgenda;
window.exportListaNegra = exportListaNegra;
window.exportMensajes = exportMensajes;
window.exportEventos = exportEventos;
window.dlTemplateIng = dlTemplateIng;
window.dlTemplateIng2 = dlTemplateIng2;
window.dlTemplateAg = dlTemplateAg;
window.dlTemplateFlota = dlTemplateFlota;
window.downloadPlantillaCond = downloadPlantillaCond;

// Utility aliases for inline handlers
window.toast = toast;
window.iF = iF;
window.DB = DB;
window.hBadge = hBadge;
window.sBadge = sBadge;
window.cBadge = cBadge;
window.sAgBadge = sAgBadge;
window.sortArr = sortArr;
window.getRecintoHalls = getRecintoHalls;
window.saveDB = saveDB;
window.saveDBNow = saveDBNow;
window.logAudit = logAudit;
window.softDelete = softDelete;
window.tr = tr;

// Compat aliases
window.cleanTab = (tab) => window._op.vaciarTab && window._op.vaciarTab(tab);
window.vaciarTab = (tab) => window._op.vaciarTab && window._op.vaciarTab(tab);
window.vaciarHistorial = (col) => window._op.vaciarHistorial && window._op.vaciarHistorial(col);
window.sortIngTable = (col) => setSort('ingresos', col);
window.debounceSearch = (k, fn) => { clearTimeout(window._dbt); window._dbt = setTimeout(fn, 200); };
window.renderCamposSubtab = renderCamposSubtab;
window._renderCamposSubtab = _renderCamposSubtab;
window._ingSource = _ingSource;
window.canImport = canImport;
window.canExport = canExport;
window.canAdd = canAdd;
window.canEdit = canEdit;
window.canDel = canDel;
window.canClean = canClean;
window.canStatus = canStatus;
window.canSpecial = canSpecial;
window.canCampos = canCampos;
window.canPrint = canPrint;
window.isSA = isSA;
window.isSup = isSup;
window.toggleAutoFill = toggleAutoFill;
window.togglePosAuto = togglePosAuto;
window.nowL = nowLocal;
window.fmt = fmt;
window.esc = esc;
window.uid = uid;
window.normPlate = normPlate;

// ── Print config & template aliases ──
window.openIngModal2 = typeof openIngModal2 !== 'undefined' ? openIngModal2 : (i) => { _ingSource='ingresos2'; openIngModal(i); };
window.pauseMsg = typeof pauseMsg !== 'undefined' ? pauseMsg : () => {};
window.savePuerta3 = typeof savePuerta3 !== 'undefined' ? savePuerta3 : () => {};
window.setPaperSize = typeof setPaperSize !== 'undefined' ? setPaperSize : () => {};
window.setPrintCfgFont = typeof setPrintCfgFont !== 'undefined' ? setPrintCfgFont : () => {};
window.setPrintCfgMode = typeof setPrintCfgMode !== 'undefined' ? setPrintCfgMode : () => {};
window.setPrintCfgSize = typeof setPrintCfgSize !== 'undefined' ? setPrintCfgSize : () => {};
window.setFavEvento = typeof setFavEvento !== 'undefined' ? setFavEvento : () => {};
window.toggleQR = typeof toggleQR !== 'undefined' ? toggleQR : () => {};
window.printPreviewWithCfg = typeof printPreviewWithCfg !== 'undefined' ? printPreviewWithCfg : () => {};
window.savePrintTemplateFromCfg = typeof savePrintTemplateFromCfg !== 'undefined' ? savePrintTemplateFromCfg : () => {};
window.pcLoadBG = typeof pcLoadBG !== 'undefined' ? pcLoadBG : () => {};
window.pcSavePhrase = typeof pcSavePhrase !== 'undefined' ? pcSavePhrase : () => {};

// Stubs for print config functions (delegated to impresion module)
window.canDelTpl = () => isSA();
window.canSaveTpl = () => hasPerm('canSaveTpl');
window.confirmSavePrintTemplate = window.confirmSavePrintTemplate || (() => {});
window.delPrintTpl = window.delPrintTpl || (() => {});
window.editPrintTpl = window.editPrintTpl || (() => {});
window.exportAll = window.exportAll || (() => { if(window._op.exportarTodo) window._op.exportarTodo(); });
window.imprimirYGuardarConTpl = window.imprimirYGuardarConTpl || (() => {});
window.loadPrintTemplate = window.loadPrintTemplate || (() => {});
window.preSavePrintTemplate = window.preSavePrintTemplate || (() => {});
window.renderPrintCfg = window.renderPrintCfg || (() => {});
window.resetPrintCfgDia0 = window.resetPrintCfgDia0 || (() => {});
window.pcClearAll = window.pcClearAll || (() => {});
window.pcClickPv = window.pcClickPv || (() => {});
window.pcQuickAddPhrase = window.pcQuickAddPhrase || (() => {});
window.pcResizeSel = window.pcResizeSel || (() => {});
window.pcToggleFields = window.pcToggleFields || (() => {});
window.pcToggleLabelMode = window.pcToggleLabelMode || (() => {});
window.pcToggleLine = window.pcToggleLine || (() => {});
window.pcTogglePhrase = window.pcTogglePhrase || (() => {});
window.togglePF = window.togglePF || (() => {});
window.toggleTplDest = window.toggleTplDest || (() => {});

// ── Missing onclick handlers exposed to window ──
window.addCustomCampo = typeof addCustomCampo !== 'undefined' ? addCustomCampo : () => {};
window.addPuertaEvento = typeof addPuertaEvento !== 'undefined' ? addPuertaEvento : () => {};
window.addRecHall = typeof addRecHall !== 'undefined' ? addRecHall : () => {};
window.addRecPuerta = typeof addRecPuerta !== 'undefined' ? addRecPuerta : () => {};
window.addReqAg = typeof addReqAg !== 'undefined' ? addReqAg : () => {};
window.blOverride = typeof blOverride !== 'undefined' ? blOverride : () => {};
window.checkPassStrength = typeof checkPassStrength !== 'undefined' ? checkPassStrength : () => {};
window.clearMatField = typeof clearMatField !== 'undefined' ? clearMatField : () => {};
window.closeCam = typeof closeCam !== 'undefined' ? closeCam : () => {};
window.closeOv = typeof closeOv !== 'undefined' ? closeOv : () => {};
window.confirmLang = typeof confirmLang !== 'undefined' ? confirmLang : () => {};
window.cycleCampo = typeof cycleCampo !== 'undefined' ? cycleCampo : () => {};
window.dlTemplateEmpresas = typeof dlTemplateEmpresas !== 'undefined' ? dlTemplateEmpresas : () => {};
window.dlTemplateRecintos = typeof dlTemplateRecintos !== 'undefined' ? dlTemplateRecintos : () => {};
window.dlTemplateUsuarios = typeof dlTemplateUsuarios !== 'undefined' ? dlTemplateUsuarios : () => {};
window.dlTemplateVehiculos = typeof dlTemplateVehiculos !== 'undefined' ? dlTemplateVehiculos : () => {};
window.doDelete = typeof doDelete !== 'undefined' ? doDelete : () => {};
window.doGlobalSearch = typeof doGlobalSearch !== 'undefined' ? doGlobalSearch : () => {};
window.exportarTodo = typeof exportarTodo !== 'undefined' ? exportarTodo : () => {};
window.filterHallSuggestions = typeof filterHallSuggestions !== 'undefined' ? filterHallSuggestions : () => {};
window.handleLogout = typeof handleLogout !== 'undefined' ? handleLogout : () => {};
window.importarTodo = typeof importarTodo !== 'undefined' ? importarTodo : () => {};
window.loadEvBg = typeof loadEvBg !== 'undefined' ? loadEvBg : () => {};
window.onAgEventoChange = typeof onAgEventoChange !== 'undefined' ? onAgEventoChange : () => {};
window.onFormEventoChange = typeof onFormEventoChange !== 'undefined' ? onFormEventoChange : () => {};
window.onRecintoSelectChange = typeof onRecintoSelectChange !== 'undefined' ? onRecintoSelectChange : () => {};
window.openCamModal = typeof openCamModal !== 'undefined' ? openCamModal : () => {};
window.openEEModal = typeof openEEModal !== 'undefined' ? openEEModal : () => {};
window.openGlobalSearch = typeof openGlobalSearch !== 'undefined' ? openGlobalSearch : () => {};
window.openLNModal = typeof openLNModal !== 'undefined' ? openLNModal : () => {};
window.openLangPicker = typeof openLangPicker !== 'undefined' ? openLangPicker : () => {};
window.processCameraCapture = typeof processCameraCapture !== 'undefined' ? processCameraCapture : () => {};
window.resetCamposCfg = typeof resetCamposCfg !== 'undefined' ? resetCamposCfg : () => {};
window.saveAgenda = typeof saveAgenda !== 'undefined' ? saveAgenda : () => {};
window.saveCamposCfg = typeof saveCamposCfg !== 'undefined' ? saveCamposCfg : () => {};
window.saveCond = typeof saveCond !== 'undefined' ? saveCond : () => {};
window.saveEE = typeof saveEE !== 'undefined' ? saveEE : () => {};
window.saveEvento = typeof saveEvento !== 'undefined' ? saveEvento : () => {};
window.saveIngreso = typeof saveIngreso !== 'undefined' ? saveIngreso : () => {};
window.saveLN = typeof saveLN !== 'undefined' ? saveLN : () => {};
window.saveMatAsChofer = typeof saveMatAsChofer !== 'undefined' ? saveMatAsChofer : () => {};
window.saveMov = typeof saveMov !== 'undefined' ? saveMov : () => {};
window.saveMsg = typeof saveMsg !== 'undefined' ? saveMsg : () => {};
window.saveRecinto = typeof saveRecinto !== 'undefined' ? saveRecinto : () => {};
window.saveUser = typeof saveUser !== 'undefined' ? saveUser : () => {};
window.searchChoferAg = typeof searchChoferAg !== 'undefined' ? searchChoferAg : () => {};
window.seleccionarEventoTrabajo = typeof seleccionarEventoTrabajo !== 'undefined' ? seleccionarEventoTrabajo : () => {};
window.selectTheme = typeof selectTheme !== 'undefined' ? selectTheme : () => {};
window.setAgDescarga = typeof setAgDescarga !== 'undefined' ? setAgDescarga : () => {};
window.setEmpresaNivel = typeof setEmpresaNivel !== 'undefined' ? setEmpresaNivel : () => {};
window.setSort = typeof setSort !== 'undefined' ? setSort : () => {};
window.setToggle = typeof setToggle !== 'undefined' ? setToggle : () => {};
window.showSyncInfo = typeof showSyncInfo !== 'undefined' ? showSyncInfo : () => {};
window.toggleThemeMenu = typeof toggleThemeMenu !== 'undefined' ? toggleThemeMenu : () => {};
window.updTgl = typeof updTgl !== 'undefined' ? updTgl : () => {};
window.updatePhrasePreview = typeof updatePhrasePreview !== 'undefined' ? updatePhrasePreview : () => {};
window.updateRolPerms = typeof updateRolPerms !== 'undefined' ? updateRolPerms : () => {};
window.verPortalEmpresa = typeof verPortalEmpresa !== 'undefined' ? verPortalEmpresa : () => {};
