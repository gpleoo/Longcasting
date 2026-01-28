// ============================================
// INTERNATIONALIZATION (i18n) MODULE
// ============================================

/**
 * Lingue supportate
 */
const SUPPORTED_LANGUAGES = ['it', 'en', 'es', 'fr'];

/**
 * Lingua di default
 */
const DEFAULT_LANGUAGE = 'it';

/**
 * Oggetto traduzioni per tutte le lingue
 */
const translations = {
    it: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.session': 'Sessione Allenamento',
        'nav.history': 'Storico',
        'nav.partners': '🤝 Partner',
        'nav.settings': '⚙️ Impostazioni',
        'nav.profile': 'Profilo',

        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.totalSessions': 'Sessioni Totali',
        'dashboard.totalCasts': 'Lanci Totali',
        'dashboard.avgDistance': 'Distanza Media',
        'dashboard.personalRecord': 'Record Personale',
        'dashboard.maxDistance': 'Distanza Massima',
        'dashboard.improvement30d': 'Miglioramento 30gg',
        'dashboard.distanceTrend': 'Andamento Distanze',
        'dashboard.recentSessions': 'Ultime Sessioni',
        'dashboard.recentCasts': 'Ultimi Lanci',
        'dashboard.noData': 'Nessun dato disponibile. Aggiungi il tuo primo lancio!',
        'dashboard.noCasts': 'Nessun lancio registrato',
        'dashboard.viewAll': 'Vedi Tutto',

        // Session
        'session.title': 'Sessione Allenamento',
        'session.notStarted': 'Nessuna Sessione Attiva',
        'session.startNew': 'Inizia una nuova sessione di allenamento per registrare i tuoi lanci',
        'session.sessionData': 'Dati della Sessione',
        'session.startDate': 'Data Inizio Sessione *',
        'session.sessionType': 'Tipo Sessione *',
        'session.typeField': '📍 Campo (metri)',
        'session.typeSea': '🌊 Mare (giri mulinello)',
        'session.location': 'Luogo *',
        'session.locationPlaceholder': 'es. Campo gara, Spiaggia...',
        'session.castingDirection': 'Direzione Campo (gradi) *',
        'session.castingDirectionPlaceholder': '0-359° (0=Nord, 90=Est)',
        'session.castingDirectionHelper': '0°=Nord, 90°=Est, 180°=Sud, 270°=Ovest',
        'session.leadWeight': 'Peso Piombo *',
        'session.leadWeightPlaceholder': 'es. Ogiva 150g, Guardiano 175g',
        'session.technique': 'Tecnica di Lancio *',
        'session.techniquePlaceholder': 'es. Overhead, Pendulum, Ground Cast',
        'session.equipment': 'Attrezzatura',
        'session.rodModel': 'Modello/Marca Canna',
        'session.rodModelPlaceholder': 'es. Shimano Nexave, Zziplex',
        'session.rodLength': 'Lunghezza Canna (metri)',
        'session.rodLengthPlaceholder': 'es. 4.2',
        'session.rodCastingWeight': 'Grammatura Canna (gr)',
        'session.rodCastingWeightPlaceholder': 'es. 100-200',
        'session.reel': 'Mulinello',
        'session.reelPlaceholder': 'es. Shimano 8000',
        'session.line': 'Filo/Shock Leader',
        'session.linePlaceholder': 'es. 0.28mm + SL 0.60mm',
        'session.metersPerTurn': 'Metri per Giro Mulinello',
        'session.metersPerTurnPlaceholder': 'es. 0.82',
        'session.autoFilled': 'Auto-compilato in base al mulinello',
        'session.initialWeather': 'Condizioni Meteo Iniziali',
        'session.wind': 'Vento',
        'session.windPlaceholder': 'es. Calmo, Brezza 10 km/h',
        'session.windDirection': 'Direzione Vento',
        'session.windDirectionPlaceholder': 'es. A favore, Contrario',
        'session.temperature': 'Temperatura (°C)',
        'session.temperaturePlaceholder': 'es. 18.5',
        'session.humidity': 'Umidità (%)',
        'session.humidityPlaceholder': 'es. 65',
        'session.notes': 'Note Sessione',
        'session.notesPlaceholder': 'Annotazioni generali...',
        'session.startSession': 'Inizia Sessione di Allenamento',
        'session.sessionInProgress': '📍 Sessione in Corso',
        'session.started': 'Iniziata:',
        'session.casts': 'Lanci:',
        'session.gpsMeasurement': '📍 Misurazione GPS Distanza',
        'session.gpsMeasurementDesc': 'Misura la distanza camminando dal punto di lancio al piombo',
        'session.gpsStart': 'START Misurazione GPS',
        'session.gpsStop': 'STOP e Salva Lancio',
        'session.manualEntry': '✍️ Inserimento Manuale Distanza',
        'session.distance': 'Distanza (metri) *',
        'session.distancePlaceholder': 'es. 125.5',
        'session.calculatedDistance': 'Distanza calcolata:',
        'session.addManualCast': 'Aggiungi Lancio Manuale',
        'session.castNotes': 'Note (opzionale)',
        'session.castNotesPlaceholder': 'Sensazioni su questo lancio...',
        'session.confirmWeather': 'Conferma Condizioni Meteo',
        'session.confirmWeatherDesc': 'Le condizioni sono cambiate? Aggiorna i dati qui sotto',
        'session.sessionCasts': 'Lanci della Sessione',
        'session.noCastsYet': 'Nessun lancio ancora registrato in questa sessione',
        'session.endSession': 'Termina Sessione di Allenamento',
        'session.start': 'Inizia Sessione',
        'session.active': 'Sessione Attiva',
        'session.type': 'Tipo Sessione',
        'session.field': 'Campo',
        'session.sea': 'Mare',
        'session.end': 'Termina Sessione',
        'session.addCast': 'Aggiungi Lancio',
        'session.directionSet': 'Direzione impostata:',
        'session.directionNotSet': 'Direzione non ancora impostata - Clicca il pulsante sopra',
        'session.openFieldDirectionMap': '🗺️ Imposta Direzione Campo sulla Mappa',

        // Map
        'map.title': '🗺️ Mappa Lanci GPS',
        'map.setFieldDirection': '🗺️ Imposta Direzione Campo',
        'map.closeMap': 'Chiudi Mappa',
        'map.confirm': '✓ Conferma',
        'map.castingPoint': 'Punto Lancio',
        'map.leadFall': 'Caduta Piombo',
        'map.trajectory': 'Traiettoria',

        // History
        'history.title': 'Storico Sessioni',
        'history.filterLocation': 'Filtra per Luogo',
        'history.allLocations': 'Tutti i luoghi',
        'history.period': 'Periodo',
        'history.all': 'Tutti',
        'history.last7days': 'Ultimi 7 giorni',
        'history.last30days': 'Ultimi 30 giorni',
        'history.last3months': 'Ultimi 3 mesi',
        'history.lastYear': 'Ultimo anno',
        'history.week': 'Ultima settimana',
        'history.month': 'Ultimo mese',
        'history.months3': 'Ultimi 3 mesi',
        'history.sortBy': 'Ordina per',
        'history.dateNewest': 'Data (più recente)',
        'history.dateOldest': 'Data (più vecchio)',
        'history.dateDesc': 'Data (più recente)',
        'history.dateAsc': 'Data (meno recente)',
        'history.noSessions': 'Nessuna sessione trovata',
        'history.previous': 'Precedente',
        'history.next': 'Successiva',
        'history.page': 'Pagina',
        'history.of': 'di',
        'history.backToSessions': 'Torna alle Sessioni',
        'history.sessionDetail': 'Dettaglio Sessione',
        'history.sessionCasts': 'Lanci della Sessione',
        'history.deleteSession': 'Elimina Sessione',
        'history.backToList': 'Torna alle Sessioni',

        // Partners
        'partners.title': '🤝 Partner & Sponsor',
        'partners.subtitle': 'Scopri i nostri partner ufficiali e gli sponsor che supportano la community del longcasting',
        'partners.shops': 'Negozi di Pesca',
        'partners.associations': 'Associazioni',
        'partners.coaches': 'Maestri di Lancio e Pesca',
        'partners.website': 'Sito Web',
        'partners.call': 'Chiama',
        'partners.email': 'Email',
        'partners.becomePartner': 'Diventa Partner',
        'partners.becomePartnerDesc': 'Sei un\'azienda, un\'associazione o un istruttore? Unisciti alla nostra rete di partner ufficiali!',
        'partners.contactUs': 'Contattaci',
        'partners.become': 'Diventa Partner',
        'partners.becomeText': 'Sei un\'azienda, un\'associazione o un istruttore? Unisciti alla nostra rete di partner ufficiali!',
        'partners.contact': 'Contattaci',

        // Settings
        'settings.title': '⚙️ Impostazioni',
        'settings.language': '🌍 Lingua / Language',
        'settings.languageDesc': 'Seleziona la lingua dell\'applicazione',
        'settings.units': '📏 Unità di Misura',
        'settings.unitsDesc': 'Personalizza le unità di misura utilizzate nell\'app',
        'settings.distance': 'Distanza',
        'settings.weight': 'Peso',
        'settings.temperature': 'Temperatura',
        'settings.wind': 'Velocità Vento',
        'settings.timeFormat': 'Formato Ora',
        'settings.dateFormat': 'Formato Data',
        'settings.saveUnits': 'Salva Unità di Misura',
        'settings.backup': '☁️ Backup & Cloud',
        'settings.backupDesc': 'Gestisci i tuoi dati e il backup su cloud',
        'settings.exportData': 'Esporta Dati (JSON)',
        'settings.importData': 'Importa Dati (JSON)',
        'settings.deleteAllData': 'Cancella Tutti i Dati',
        'settings.export': 'Esporta Dati (JSON)',
        'settings.import': 'Importa Dati (JSON)',
        'settings.deleteAll': 'Cancella Tutti i Dati',
        'settings.cloudSync': '📱 Sincronizzazione Cloud',
        'settings.cloudSyncDesc': 'Funzionalità di sincronizzazione cloud disponibile nella versione premium',
        'settings.cloudPremium': 'Funzionalità di sincronizzazione cloud disponibile nella versione premium',
        'settings.installApp': '📱 Installa Applicazione',
        'settings.installAppDesc': 'Installa Longcasting Pro sul tuo dispositivo per un\'esperienza ottimale',
        'settings.install': 'Installa Applicazione',
        'settings.installDesc': 'Installa Longcasting Pro sul tuo dispositivo per un\'esperienza ottimale',
        'settings.about': 'ℹ️ Informazioni',
        'settings.version': 'Versione 1.0.0',
        'settings.copyright': '© 2026 Longcasting Pro. Tutti i diritti riservati.',

        // Profile
        'profile.title': 'Profilo Atleta',
        'profile.personalData': 'Dati Personali',
        'profile.firstName': 'Nome *',
        'profile.firstNamePlaceholder': 'Il tuo nome',
        'profile.lastName': 'Cognome *',
        'profile.lastNamePlaceholder': 'Il tuo cognome',
        'profile.age': 'Età *',
        'profile.agePlaceholder': 'es. 35',
        'profile.gender': 'Sesso *',
        'profile.male': 'Maschio',
        'profile.female': 'Femmina',
        'profile.other': 'Altro',
        'profile.physicalData': 'Dati Fisici',
        'profile.height': 'Altezza (cm) *',
        'profile.heightPlaceholder': 'es. 175',
        'profile.weight': 'Peso (kg) *',
        'profile.weightPlaceholder': 'es. 75.5',
        'profile.bmi': 'BMI (calcolato automaticamente)',
        'profile.experience': 'Livello di Esperienza',
        'profile.beginner': 'Principiante',
        'profile.intermediate': 'Intermedio',
        'profile.advanced': 'Avanzato',
        'profile.professional': 'Professionista',
        'profile.preferences': 'Preferenze',
        'profile.distanceGoal': 'Obiettivo di Distanza (m)',
        'profile.distanceGoalPlaceholder': 'es. 150',
        'profile.trainingField': 'Campo di Allenamento',
        'profile.trainingFieldPlaceholder': 'es. Campo Gara XYZ',
        'profile.saveProfile': 'Salva Profilo',
        'profile.dataManagement': 'Gestione Dati',
        'profile.exportData': 'Esporta Dati',
        'profile.importData': 'Importa Dati',
        'profile.deleteAllData': 'Elimina Tutti i Dati',
        'profile.personal': 'Informazioni Personali',
        'profile.name': 'Nome',
        'profile.surname': 'Cognome',
        'profile.physical': 'Dati Fisici',
        'profile.save': 'Salva Profilo',

        // Common
        'common.save': 'Salva',
        'common.cancel': 'Annulla',
        'common.delete': 'Elimina',
        'common.edit': 'Modifica',
        'common.close': 'Chiudi',
        'common.confirm': 'Conferma',
        'common.search': 'Cerca',
        'common.select': 'Seleziona',
        'common.loading': 'Caricamento...',
        'common.error': 'Errore',
        'common.success': 'Successo',
        'common.warning': 'Attenzione',
        'common.retry': 'Riprova',
        'common.continueWithout': 'Continua Senza',

        // GPS & Validation
        'gps.acquiring': 'Acquisizione posizione GPS...',
        'gps.acquired': 'Sessione avviata! Punto perno GPS acquisito.',
        'gps.notSupported': 'Geolocalizzazione non supportata',
        'gps.errorTitle': 'Errore GPS',
        'gps.errorMessage': 'Impossibile acquisire la posizione GPS',
        'gps.retryQuestion': 'Vuoi riprovare ad acquisire il GPS o avviare la sessione senza punto perno?',
        'gps.retryButton': 'Riprova GPS',
        'gps.continueButton': 'Continua Senza GPS',
        'gps.attempt': 'Tentativo',
        'gps.of': 'di',
        'validation.required': 'Questo campo è obbligatorio',
        'validation.fillRequired': 'Compila tutti i campi obbligatori (*) prima di continuare',
        'validation.invalidNumber': 'Inserisci un numero valido'
    },
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.session': 'Training Session',
        'nav.history': 'History',
        'nav.partners': '🤝 Partners',
        'nav.settings': '⚙️ Settings',
        'nav.profile': 'Profile',

        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.totalSessions': 'Total Sessions',
        'dashboard.totalCasts': 'Total Casts',
        'dashboard.avgDistance': 'Average Distance',
        'dashboard.personalRecord': 'Personal Record',
        'dashboard.maxDistance': 'Max Distance',
        'dashboard.improvement30d': '30d Improvement',
        'dashboard.distanceTrend': 'Distance Trend',
        'dashboard.recentSessions': 'Recent Sessions',
        'dashboard.recentCasts': 'Recent Casts',
        'dashboard.noData': 'No data available. Add your first cast!',
        'dashboard.noCasts': 'No casts recorded',
        'dashboard.viewAll': 'View All',

        // Session
        'session.title': 'Training Session',
        'session.notStarted': 'No Active Session',
        'session.startNew': 'Start a new training session to record your casts',
        'session.sessionData': 'Session Data',
        'session.startDate': 'Session Start Date *',
        'session.sessionType': 'Session Type *',
        'session.typeField': '📍 Field (meters)',
        'session.typeSea': '🌊 Sea (reel turns)',
        'session.location': 'Location *',
        'session.locationPlaceholder': 'e.g. Competition field, Beach...',
        'session.castingDirection': 'Field Direction (degrees) *',
        'session.castingDirectionPlaceholder': '0-359° (0=North, 90=East)',
        'session.castingDirectionHelper': '0°=North, 90°=East, 180°=South, 270°=West',
        'session.leadWeight': 'Lead Weight *',
        'session.leadWeightPlaceholder': 'e.g. Ogive 150g, Guardian 175g',
        'session.technique': 'Casting Technique *',
        'session.techniquePlaceholder': 'e.g. Overhead, Pendulum, Ground Cast',
        'session.equipment': 'Equipment',
        'session.rodModel': 'Rod Model/Brand',
        'session.rodModelPlaceholder': 'e.g. Shimano Nexave, Zziplex',
        'session.rodLength': 'Rod Length (meters)',
        'session.rodLengthPlaceholder': 'e.g. 4.2',
        'session.rodCastingWeight': 'Rod Casting Weight (gr)',
        'session.rodCastingWeightPlaceholder': 'e.g. 100-200',
        'session.reel': 'Reel',
        'session.reelPlaceholder': 'e.g. Shimano 8000',
        'session.line': 'Line/Shock Leader',
        'session.linePlaceholder': 'e.g. 0.28mm + SL 0.60mm',
        'session.metersPerTurn': 'Meters per Reel Turn',
        'session.metersPerTurnPlaceholder': 'e.g. 0.82',
        'session.autoFilled': 'Auto-filled based on reel',
        'session.initialWeather': 'Initial Weather Conditions',
        'session.wind': 'Wind',
        'session.windPlaceholder': 'e.g. Calm, Breeze 10 km/h',
        'session.windDirection': 'Wind Direction',
        'session.windDirectionPlaceholder': 'e.g. Favorable, Against, Side R',
        'session.temperature': 'Temperature (°C)',
        'session.temperaturePlaceholder': 'e.g. 18.5',
        'session.humidity': 'Humidity (%)',
        'session.humidityPlaceholder': 'e.g. 65',
        'session.notes': 'Session Notes',
        'session.notesPlaceholder': 'General notes...',
        'session.startSession': 'Start Training Session',
        'session.sessionInProgress': '📍 Session in Progress',
        'session.started': 'Started:',
        'session.casts': 'Casts:',
        'session.gpsMeasurement': '📍 GPS Distance Measurement',
        'session.gpsMeasurementDesc': 'Measure distance by walking from casting point to lead',
        'session.gpsStart': 'START GPS Measurement',
        'session.gpsStop': 'STOP and Save Cast',
        'session.manualEntry': '✍️ Manual Distance Entry',
        'session.distance': 'Distance (meters) *',
        'session.distancePlaceholder': 'e.g. 125.5',
        'session.calculatedDistance': 'Calculated distance:',
        'session.addManualCast': 'Add Manual Cast',
        'session.castNotes': 'Notes (optional)',
        'session.castNotesPlaceholder': 'Feelings about this cast...',
        'session.confirmWeather': 'Confirm Weather Conditions',
        'session.confirmWeatherDesc': 'Have conditions changed? Update data below',
        'session.sessionCasts': 'Session Casts',
        'session.noCastsYet': 'No casts recorded yet in this session',
        'session.endSession': 'End Training Session',
        'session.start': 'Start Session',
        'session.active': 'Active Session',
        'session.type': 'Session Type',
        'session.field': 'Field',
        'session.sea': 'Sea',
        'session.end': 'End Session',
        'session.addCast': 'Add Cast',
        'session.directionSet': 'Direction set:',
        'session.directionNotSet': 'Direction not set yet - Click the button above',
        'session.openFieldDirectionMap': '🗺️ Set Field Direction on Map',

        // Map
        'map.title': '🗺️ GPS Casts Map',
        'map.setFieldDirection': '🗺️ Set Field Direction',
        'map.closeMap': 'Close Map',
        'map.confirm': '✓ Confirm',
        'map.castingPoint': 'Casting Point',
        'map.leadFall': 'Lead Fall',
        'map.trajectory': 'Trajectory',

        // History
        'history.title': 'Session History',
        'history.filterLocation': 'Filter by Location',
        'history.allLocations': 'All locations',
        'history.period': 'Period',
        'history.all': 'All',
        'history.last7days': 'Last 7 days',
        'history.last30days': 'Last 30 days',
        'history.last3months': 'Last 3 months',
        'history.lastYear': 'Last year',
        'history.week': 'Last week',
        'history.month': 'Last month',
        'history.months3': 'Last 3 months',
        'history.sortBy': 'Sort by',
        'history.dateNewest': 'Date (newest)',
        'history.dateOldest': 'Date (oldest)',
        'history.dateDesc': 'Date (newest)',
        'history.dateAsc': 'Date (oldest)',
        'history.noSessions': 'No sessions found',
        'history.previous': 'Previous',
        'history.next': 'Next',
        'history.page': 'Page',
        'history.of': 'of',
        'history.backToSessions': 'Back to Sessions',
        'history.sessionDetail': 'Session Detail',
        'history.sessionCasts': 'Session Casts',
        'history.deleteSession': 'Delete Session',
        'history.backToList': 'Back to Sessions',

        // Partners
        'partners.title': '🤝 Partners & Sponsors',
        'partners.subtitle': 'Discover our official partners and sponsors supporting the longcasting community',
        'partners.shops': 'Fishing Shops',
        'partners.associations': 'Associations',
        'partners.coaches': 'Casting Coaches',
        'partners.website': 'Website',
        'partners.call': 'Call',
        'partners.email': 'Email',
        'partners.becomePartner': 'Become a Partner',
        'partners.becomePartnerDesc': 'Are you a company, association or instructor? Join our official partner network!',
        'partners.contactUs': 'Contact Us',
        'partners.become': 'Become a Partner',
        'partners.becomeText': 'Are you a company, association or instructor? Join our official partner network!',
        'partners.contact': 'Contact Us',

        // Settings
        'settings.title': '⚙️ Settings',
        'settings.language': '🌍 Language / Idioma',
        'settings.languageDesc': 'Select application language',
        'settings.units': '📏 Units of Measure',
        'settings.unitsDesc': 'Customize the units of measure used in the app',
        'settings.distance': 'Distance',
        'settings.weight': 'Weight',
        'settings.temperature': 'Temperature',
        'settings.wind': 'Wind Speed',
        'settings.timeFormat': 'Time Format',
        'settings.dateFormat': 'Date Format',
        'settings.saveUnits': 'Save Units of Measure',
        'settings.backup': '☁️ Backup & Cloud',
        'settings.backupDesc': 'Manage your data and cloud backup',
        'settings.exportData': 'Export Data (JSON)',
        'settings.importData': 'Import Data (JSON)',
        'settings.deleteAllData': 'Delete All Data',
        'settings.export': 'Export Data (JSON)',
        'settings.import': 'Import Data (JSON)',
        'settings.deleteAll': 'Delete All Data',
        'settings.cloudSync': '📱 Cloud Sync',
        'settings.cloudSyncDesc': 'Cloud synchronization feature available in premium version',
        'settings.cloudPremium': 'Cloud synchronization feature available in premium version',
        'settings.installApp': '📱 Install Application',
        'settings.installAppDesc': 'Install Longcasting Pro on your device for an optimal experience',
        'settings.install': 'Install Application',
        'settings.installDesc': 'Install Longcasting Pro on your device for an optimal experience',
        'settings.about': 'ℹ️ About',
        'settings.version': 'Version 1.0.0',
        'settings.copyright': '© 2026 Longcasting Pro. All rights reserved.',

        // Profile
        'profile.title': 'Athlete Profile',
        'profile.personalData': 'Personal Data',
        'profile.firstName': 'First Name *',
        'profile.firstNamePlaceholder': 'Your first name',
        'profile.lastName': 'Last Name *',
        'profile.lastNamePlaceholder': 'Your last name',
        'profile.age': 'Age *',
        'profile.agePlaceholder': 'e.g. 35',
        'profile.gender': 'Gender *',
        'profile.male': 'Male',
        'profile.female': 'Female',
        'profile.other': 'Other',
        'profile.physicalData': 'Physical Data',
        'profile.height': 'Height (cm) *',
        'profile.heightPlaceholder': 'e.g. 175',
        'profile.weight': 'Weight (kg) *',
        'profile.weightPlaceholder': 'e.g. 75.5',
        'profile.bmi': 'BMI (auto-calculated)',
        'profile.experience': 'Experience Level',
        'profile.beginner': 'Beginner',
        'profile.intermediate': 'Intermediate',
        'profile.advanced': 'Advanced',
        'profile.professional': 'Professional',
        'profile.preferences': 'Preferences',
        'profile.distanceGoal': 'Distance Goal (m)',
        'profile.distanceGoalPlaceholder': 'e.g. 150',
        'profile.trainingField': 'Training Field',
        'profile.trainingFieldPlaceholder': 'e.g. XYZ Competition Field',
        'profile.saveProfile': 'Save Profile',
        'profile.dataManagement': 'Data Management',
        'profile.exportData': 'Export Data',
        'profile.importData': 'Import Data',
        'profile.deleteAllData': 'Delete All Data',
        'profile.personal': 'Personal Information',
        'profile.name': 'First Name',
        'profile.surname': 'Last Name',
        'profile.physical': 'Physical Data',
        'profile.save': 'Save Profile',

        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        'common.search': 'Search',
        'common.select': 'Select',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.warning': 'Warning',
        'common.retry': 'Retry',
        'common.continueWithout': 'Continue Without',

        // GPS & Validation
        'gps.acquiring': 'Acquiring GPS position...',
        'gps.acquired': 'Session started! GPS pivot point acquired.',
        'gps.notSupported': 'Geolocation not supported',
        'gps.errorTitle': 'GPS Error',
        'gps.errorMessage': 'Unable to acquire GPS position',
        'gps.retryQuestion': 'Do you want to retry GPS acquisition or start the session without pivot point?',
        'gps.retryButton': 'Retry GPS',
        'gps.continueButton': 'Continue Without GPS',
        'gps.attempt': 'Attempt',
        'gps.of': 'of',
        'validation.required': 'This field is required',
        'validation.fillRequired': 'Fill all required fields (*) before continuing',
        'validation.invalidNumber': 'Enter a valid number'
    },
    es: {
        // Navigation
        'nav.dashboard': 'Panel',
        'nav.session': 'Sesión de Entrenamiento',
        'nav.history': 'Historial',
        'nav.partners': '🤝 Socios',
        'nav.settings': '⚙️ Configuración',
        'nav.profile': 'Perfil',

        // Dashboard
        'dashboard.title': 'Panel',
        'dashboard.totalSessions': 'Sesiones Totales',
        'dashboard.totalCasts': 'Lanzamientos Totales',
        'dashboard.avgDistance': 'Distancia Media',
        'dashboard.personalRecord': 'Récord Personal',
        'dashboard.maxDistance': 'Distancia Máxima',
        'dashboard.improvement30d': 'Mejora 30 días',
        'dashboard.distanceTrend': 'Tendencia de Distancias',
        'dashboard.recentSessions': 'Sesiones Recientes',
        'dashboard.recentCasts': 'Lanzamientos Recientes',
        'dashboard.noData': 'No hay datos disponibles. ¡Añade tu primer lanzamiento!',
        'dashboard.noCasts': 'No hay lanzamientos registrados',
        'dashboard.viewAll': 'Ver Todo',

        // Session (abbreviated for space)
        'session.title': 'Sesión de Entrenamiento',
        'session.notStarted': 'Sin Sesión Activa',
        'session.startNew': 'Inicia una nueva sesión de entrenamiento para registrar tus lanzamientos',
        'session.start': 'Iniciar Sesión',
        'session.end': 'Finalizar Sesión',
        'session.addCast': 'Añadir Lanzamiento',

        // Common
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
        'common.close': 'Cerrar',
        'common.confirm': 'Confirmar',
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',

        // GPS
        'gps.acquiring': 'Adquiriendo posición GPS...',
        'gps.acquired': '¡Sesión iniciada! Punto de pivote GPS adquirido.',
        'gps.notSupported': 'Geolocalización no soportada',
        'gps.errorTitle': 'Error de GPS',
        'gps.errorMessage': 'No se puede adquirir la posición GPS',
        'gps.retryButton': 'Reintentar GPS',
        'gps.continueButton': 'Continuar Sin GPS',
        'validation.fillRequired': 'Completa todos los campos obligatorios (*) antes de continuar'
    },
    fr: {
        // Navigation
        'nav.dashboard': 'Tableau de Bord',
        'nav.session': 'Session d\'Entraînement',
        'nav.history': 'Historique',
        'nav.partners': '🤝 Partenaires',
        'nav.settings': '⚙️ Paramètres',
        'nav.profile': 'Profil',

        // Dashboard
        'dashboard.title': 'Tableau de Bord',
        'dashboard.totalSessions': 'Sessions Totales',
        'dashboard.totalCasts': 'Lancers Totaux',
        'dashboard.avgDistance': 'Distance Moyenne',
        'dashboard.personalRecord': 'Record Personnel',
        'dashboard.maxDistance': 'Distance Maximale',
        'dashboard.improvement30d': 'Amélioration 30j',
        'dashboard.distanceTrend': 'Évolution des Distances',
        'dashboard.recentSessions': 'Sessions Récentes',
        'dashboard.recentCasts': 'Lancers Récents',
        'dashboard.noData': 'Aucune donnée disponible. Ajoutez votre premier lancer!',
        'dashboard.noCasts': 'Aucun lancer enregistré',
        'dashboard.viewAll': 'Voir Tout',

        // Session (abbreviated for space)
        'session.title': 'Session d\'Entraînement',
        'session.notStarted': 'Aucune Session Active',
        'session.startNew': 'Démarrez une nouvelle session d\'entraînement pour enregistrer vos lancers',
        'session.start': 'Démarrer Session',
        'session.end': 'Terminer Session',
        'session.addCast': 'Ajouter Lancer',

        // Common
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'common.close': 'Fermer',
        'common.confirm': 'Confirmer',
        'common.loading': 'Chargement...',
        'common.error': 'Erreur',
        'common.success': 'Succès',

        // GPS
        'gps.acquiring': 'Acquisition position GPS...',
        'gps.acquired': 'Session démarrée! Point de pivot GPS acquis.',
        'gps.notSupported': 'Géolocalisation non supportée',
        'gps.errorTitle': 'Erreur GPS',
        'gps.errorMessage': 'Impossible d\'acquérir la position GPS',
        'gps.retryButton': 'Réessayer GPS',
        'gps.continueButton': 'Continuer Sans GPS',
        'validation.fillRequired': 'Remplissez tous les champs obligatoires (*) avant de continuer'
    }
};

/**
 * Classe per la gestione delle traduzioni
 */
class I18n {
    constructor(defaultLang = DEFAULT_LANGUAGE) {
        this.currentLanguage = defaultLang;
        this.translations = translations;
    }

    /**
     * Ottiene la traduzione per una chiave
     * @param {string} key - Chiave di traduzione
     * @param {string} lang - Lingua (opzionale, usa current se non specificata)
     * @returns {string} Traduzione o chiave se non trovata
     */
    t(key, lang = null) {
        const language = lang || this.currentLanguage;
        return this.translations[language]?.[key]
            || this.translations[DEFAULT_LANGUAGE]?.[key]
            || key;
    }

    /**
     * Cambia la lingua corrente
     * @param {string} lang - Codice lingua (it, en, es, fr)
     */
    setLanguage(lang) {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
            this.currentLanguage = lang;
            return true;
        }
        return false;
    }

    /**
     * Ottiene la lingua corrente
     * @returns {string} Codice lingua
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Ottiene le lingue supportate
     * @returns {string[]} Array di codici lingua
     */
    getSupportedLanguages() {
        return SUPPORTED_LANGUAGES;
    }

    /**
     * Applica le traduzioni a tutti gli elementi con data-i18n
     */
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Translate placeholders with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }
}

// Crea istanza globale
const i18n = new I18n();

// Export for module usage
if (typeof window !== 'undefined') {
    window.I18n = I18n;
    window.i18n = i18n;
    window.translations = translations;
    window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
    window.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
}
