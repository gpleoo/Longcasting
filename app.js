// ============================================
// GPS TRACKER CLASS (Professional Module)
// ============================================
class GPSTracker {
    constructor() {
        this.isTracking = false;
        this.watchId = null;
        this.trackingPoints = [];
        this.startPosition = null;
        this.currentPosition = null;
        this.startTime = null;
        this.timerInterval = null;

        // Statistics
        this.totalDistance = 0;
        this.averageAccuracy = 0;
        this.pointsCollected = 0;

        // Configuration
        this.config = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
            minAccuracy: 50, // meters - scarta punti con accuracy peggiore
            maxSpeed: 15, // m/s - velocità massima realistica (filtro anti-salti)
            smoothingWindow: 3 // numero di punti per media mobile
        };
    }

    // Check if GPS is available
    isGPSAvailable() {
        return 'geolocation' in navigator;
    }

    // Start GPS tracking
    async start() {
        if (!this.isGPSAvailable()) {
            throw new Error('GPS non disponibile su questo dispositivo');
        }

        if (this.isTracking) {
            throw new Error('Tracking GPS già in corso');
        }

        // Reset state
        this.reset();
        this.isTracking = true;
        this.startTime = Date.now();

        // Get initial position
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.startPosition = this.createGPSPoint(position);
                    this.trackingPoints.push(this.startPosition);
                    this.currentPosition = this.startPosition;

                    // Start continuous watching
                    this.watchId = navigator.geolocation.watchPosition(
                        (pos) => this.onPositionUpdate(pos),
                        (error) => this.onPositionError(error),
                        this.config
                    );

                    // Start timer
                    this.startTimer();

                    resolve(this.startPosition);
                },
                (error) => {
                    this.isTracking = false;
                    reject(this.handleGPSError(error));
                },
                this.config
            );
        });
    }

    // Stop GPS tracking
    stop() {
        if (!this.isTracking) {
            return null;
        }

        this.isTracking = false;

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Calculate final statistics
        return this.calculateFinalStats();
    }

    // Reset tracker state
    reset() {
        this.trackingPoints = [];
        this.startPosition = null;
        this.currentPosition = null;
        this.totalDistance = 0;
        this.averageAccuracy = 0;
        this.pointsCollected = 0;
        this.startTime = null;

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Create GPS point object
    createGPSPoint(position) {
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp,
            speed: position.coords.speed
        };
    }

    // Handle position update
    onPositionUpdate(position) {
        const newPoint = this.createGPSPoint(position);

        // Filter: Reject points with poor accuracy
        if (newPoint.accuracy > this.config.minAccuracy) {
            console.warn(`GPS point rejected: accuracy too low (${newPoint.accuracy.toFixed(1)}m)`);
            return;
        }

        // Filter: Reject unrealistic speed jumps
        if (this.currentPosition) {
            const timeDelta = (newPoint.timestamp - this.currentPosition.timestamp) / 1000; // seconds
            const distance = this.calculateDistance(this.currentPosition, newPoint);
            const speed = distance / timeDelta;

            if (speed > this.config.maxSpeed) {
                console.warn(`GPS point rejected: unrealistic speed (${speed.toFixed(1)} m/s)`);
                return;
            }
        }

        // Add point to tracking
        this.trackingPoints.push(newPoint);
        this.pointsCollected++;

        // Update current position
        this.currentPosition = newPoint;

        // Update average accuracy
        this.updateAverageAccuracy();

        // Trigger callback if set
        if (this.onUpdate) {
            this.onUpdate(this.getCurrentStats());
        }
    }

    // Handle position error
    onPositionError(error) {
        console.error('GPS Error:', error);
        if (this.onError) {
            this.onError(this.handleGPSError(error));
        }
    }

    // Handle GPS errors
    handleGPSError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return new Error('Permesso GPS negato. Abilita la geolocalizzazione nelle impostazioni.');
            case error.POSITION_UNAVAILABLE:
                return new Error('Posizione GPS non disponibile. Assicurati di essere all\'aperto.');
            case error.TIMEOUT:
                return new Error('Timeout GPS. Riprova.');
            default:
                return new Error('Errore GPS sconosciuto.');
        }
    }

    // Calculate distance between two GPS points using Haversine formula
    calculateDistance(point1, point2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = point1.latitude * Math.PI / 180;
        const φ2 = point2.latitude * Math.PI / 180;
        const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
        const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    // Calculate bearing (angle) between two GPS points
    calculateBearing(point1, point2) {
        const φ1 = point1.latitude * Math.PI / 180;
        const φ2 = point2.latitude * Math.PI / 180;
        const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        let θ = Math.atan2(y, x);

        // Convert to degrees (0-360)
        let bearing = (θ * 180 / Math.PI + 360) % 360;

        return bearing; // 0° = North, 90° = East, 180° = South, 270° = West
    }

    // Calculate average position from multiple GPS points
    getAveragePosition(points) {
        if (!points || points.length === 0) return null;

        const sum = points.reduce((acc, p) => ({
            latitude: acc.latitude + p.latitude,
            longitude: acc.longitude + p.longitude,
            accuracy: acc.accuracy + p.accuracy
        }), { latitude: 0, longitude: 0, accuracy: 0 });

        return {
            latitude: sum.latitude / points.length,
            longitude: sum.longitude / points.length,
            accuracy: sum.accuracy / points.length
        };
    }

    // Get straight-line distance (real-time)
    getStraightLineDistance() {
        if (this.trackingPoints.length < 2) return 0;

        const numPoints = Math.min(10, this.trackingPoints.length);
        const startPoints = this.trackingPoints.slice(0, numPoints);
        const startAvg = this.getAveragePosition(startPoints);

        return this.calculateDistance(startAvg, this.currentPosition);
    }

    // Apply smoothing to distance (moving average)
    getSmoothedDistance() {
        if (this.trackingPoints.length < 2) {
            return 0;
        }

        // Calculate distance for last N points
        const window = Math.min(this.config.smoothingWindow, this.trackingPoints.length - 1);
        let smoothedDistance = 0;

        for (let i = this.trackingPoints.length - window; i < this.trackingPoints.length; i++) {
            if (i > 0) {
                smoothedDistance += this.calculateDistance(
                    this.trackingPoints[i - 1],
                    this.trackingPoints[i]
                );
            }
        }

        // Scale to total distance
        const ratio = (this.trackingPoints.length - 1) / window;
        return smoothedDistance * ratio;
    }

    // Update average accuracy
    updateAverageAccuracy() {
        if (this.trackingPoints.length === 0) {
            this.averageAccuracy = 0;
            return;
        }

        const sum = this.trackingPoints.reduce((acc, point) => acc + point.accuracy, 0);
        this.averageAccuracy = sum / this.trackingPoints.length;
    }

    // Get current statistics
    getCurrentStats() {
        return {
            distance: this.getStraightLineDistance(),  // ✅ Linea retta
            accuracy: this.averageAccuracy,
            points: this.pointsCollected,
            duration: this.getElapsedTime(),
            quality: this.getQualityRating()
        };
    }

    // Calculate final statistics
    calculateFinalStats() {
        const minPoints = Math.min(10, Math.floor(this.trackingPoints.length / 2));

        // Calculate average START position (first N points)
        const startPoints = this.trackingPoints.slice(0, minPoints);
        const startAvg = this.getAveragePosition(startPoints);

        // Calculate average END position (last N points)
        const endPoints = this.trackingPoints.slice(-minPoints);
        const endAvg = this.getAveragePosition(endPoints);

        // Calculate straight-line distance
        const straightLineDistance = this.calculateDistance(startAvg, endAvg);

        // Calculate bearing (angle) of the cast
        const bearing = this.calculateBearing(startAvg, endAvg);

        return {
            distance: straightLineDistance,  // ✅ Distanza linea retta
            startPosition: startAvg,         // ✅ Posizione START media
            endPosition: endAvg,             // ✅ Posizione END media
            bearing: bearing,                // ✅ Angolo del lancio
            accuracy: this.averageAccuracy,
            points: this.pointsCollected,
            duration: this.getElapsedTime(),
            quality: this.getQualityRating(),
            allPoints: this.trackingPoints
        };
    }

    // Get elapsed time in seconds
    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    // Get quality rating based on accuracy and points
    getQualityRating() {
        if (this.pointsCollected < 5) return 'Scarsa';
        if (this.averageAccuracy > 20) return 'Bassa';
        if (this.averageAccuracy > 10) return 'Media';
        if (this.averageAccuracy > 5) return 'Buona';
        return 'Ottima';
    }

    // Format duration as MM:SS
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Start timer for UI updates
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.onTimerUpdate) {
                this.onTimerUpdate(this.getElapsedTime());
            }
        }, 1000);
    }
}

// ============================================
// LONGCAST PRO - MAIN APPLICATION
// ============================================
class LongCastApp {
    constructor() {
        this.sessions = []; // Array of completed training sessions
        this.profile = null;
        this.chart = null;
        this.currentSession = null; // Active training session
        this.gpsTracker = new GPSTracker(); // GPS Tracker instance
        this.gpsResult = null; // Temporary GPS result storage

        // Map management
        this.map = null; // Leaflet map instance
        this.mapMarkers = []; // Array of map markers
        this.currentMapSession = null; // Session displayed on map

        // Pagination for storico
        this.currentPage = 1;
        this.sessionsPerPage = 5;
        this.filteredSessions = []; // Store filtered sessions for pagination

        // Settings
        this.settings = {
            language: 'it',
            units: {
                distance: 'm',
                weight: 'g',
                temperature: 'c',
                wind: 'kmh',
                time: '24h',
                date: 'dmy'
            }
        };

        this.suggestions = {
            tecniche: [],
            pesoPiombo: [],
            vento: [],
            direzioneVento: [],
            cannaModello: [],
            luoghi: [],
            grammatura: [],
            mulinello: [],
            filo: [],
            lunghezzaCanna: [],
            temperatura: [],
            umidita: [],
            note: []
        };

        // Internationalization (i18n) - Translations
        this.translations = {
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
                'common.warning': 'Attenzione'
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
                'common.warning': 'Warning'
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
                'dashboard.maxDistance': 'Distancia Máxima',
                'dashboard.recentSessions': 'Sesiones Recientes',
                'dashboard.noData': '¡No hay datos disponibles. Comienza tu primera sesión de entrenamiento!',
                'dashboard.viewAll': 'Ver Todo',

                // Session
                'session.title': 'Sesión de Entrenamiento',
                'session.notStarted': 'Sin Sesión Activa',
                'session.startNew': 'Inicia una nueva sesión de entrenamiento para registrar tus lanzamientos',
                'session.start': 'Iniciar Sesión',
                'session.active': 'Sesión Activa',
                'session.location': 'Ubicación',
                'session.castingDirection': 'Dirección del Campo (grados) *',
                'session.castingDirectionPlaceholder': '0-359° (0=Norte, 90=Este)',
                'session.castingDirectionHelper': '0°=Norte, 90°=Este, 180°=Sur, 270°=Oeste',
                'session.type': 'Tipo de Sesión',
                'session.field': 'Campo',
                'session.sea': 'Mar',
                'session.end': 'Finalizar Sesión',
                'session.addCast': 'Añadir Lanzamiento',

                // History
                'history.title': 'Historial de Sesiones',
                'history.filterLocation': 'Filtrar por Ubicación',
                'history.allLocations': 'Todas las ubicaciones',
                'history.period': 'Período',
                'history.all': 'Todos',
                'history.week': 'Última semana',
                'history.month': 'Último mes',
                'history.months3': 'Últimos 3 meses',
                'history.sortBy': 'Ordenar por',
                'history.dateDesc': 'Fecha (más reciente)',
                'history.dateAsc': 'Fecha (más antigua)',
                'history.noSessions': 'No se encontraron sesiones',
                'history.previous': 'Anterior',
                'history.next': 'Siguiente',
                'history.deleteSession': 'Eliminar Sesión',
                'history.backToList': 'Volver a Sesiones',

                // Partners
                'partners.title': 'Socios y Patrocinadores',
                'partners.subtitle': 'Descubre nuestros socios oficiales y patrocinadores que apoyan la comunidad de longcasting',
                'partners.shops': 'Tiendas de Pesca',
                'partners.associations': 'Asociaciones',
                'partners.coaches': 'Instructores de Lanzamiento',
                'partners.website': 'Sitio Web',
                'partners.call': 'Llamar',
                'partners.email': 'Email',
                'partners.become': 'Conviértete en Socio',
                'partners.becomeText': '¿Eres una empresa, asociación o instructor? ¡Únete a nuestra red oficial de socios!',
                'partners.contact': 'Contáctanos',

                // Settings
                'settings.title': 'Configuración',
                'settings.language': 'Idioma / Language',
                'settings.languageDesc': 'Seleccionar idioma de la aplicación',
                'settings.units': 'Unidades de Medida',
                'settings.unitsDesc': 'Personaliza las unidades de medida utilizadas en la app',
                'settings.distance': 'Distancia',
                'settings.weight': 'Peso',
                'settings.temperature': 'Temperatura',
                'settings.wind': 'Velocidad del Viento',
                'settings.timeFormat': 'Formato de Hora',
                'settings.dateFormat': 'Formato de Fecha',
                'settings.saveUnits': 'Guardar Unidades',
                'settings.backup': 'Copia de Seguridad y Nube',
                'settings.backupDesc': 'Gestiona tus datos y copia de seguridad en la nube',
                'settings.export': 'Exportar Datos (JSON)',
                'settings.import': 'Importar Datos (JSON)',
                'settings.deleteAll': 'Eliminar Todos los Datos',
                'settings.cloudSync': 'Sincronización en la Nube',
                'settings.cloudPremium': 'Función de sincronización en la nube disponible en la versión premium',
                'settings.install': 'Instalar Aplicación',
                'settings.installDesc': 'Instala Longcasting Pro en tu dispositivo para una experiencia óptima',

                // Profile
                'profile.title': 'Perfil del Atleta',
                'profile.personal': 'Información Personal',
                'profile.name': 'Nombre',
                'profile.surname': 'Apellido',
                'profile.age': 'Edad',
                'profile.gender': 'Género',
                'profile.male': 'Masculino',
                'profile.female': 'Femenino',
                'profile.other': 'Otro',
                'profile.physical': 'Datos Físicos',
                'profile.height': 'Altura (cm)',
                'profile.weight': 'Peso (kg)',
                'profile.bmi': 'IMC',
                'profile.save': 'Guardar Perfil',

                // Common
                'common.save': 'Guardar',
                'common.cancel': 'Cancelar',
                'common.delete': 'Eliminar',
                'common.edit': 'Editar',
                'common.close': 'Cerrar',
                'common.confirm': 'Confirmar',
                'common.search': 'Buscar',
                'common.loading': 'Cargando...',
                'common.error': 'Error',
                'common.success': 'Éxito',
                'common.warning': 'Advertencia'
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
                'dashboard.maxDistance': 'Distance Maximale',
                'dashboard.recentSessions': 'Sessions Récentes',
                'dashboard.noData': 'Aucune donnée disponible. Commencez votre première session d\'entraînement!',
                'dashboard.viewAll': 'Voir Tout',

                // Session
                'session.title': 'Session d\'Entraînement',
                'session.notStarted': 'Aucune Session Active',
                'session.startNew': 'Démarrez une nouvelle session d\'entraînement pour enregistrer vos lancers',
                'session.start': 'Démarrer Session',
                'session.active': 'Session Active',
                'session.location': 'Lieu',
                'session.castingDirection': 'Direction du Terrain (degrés) *',
                'session.castingDirectionPlaceholder': '0-359° (0=Nord, 90=Est)',
                'session.castingDirectionHelper': '0°=Nord, 90°=Est, 180°=Sud, 270°=Ouest',
                'session.type': 'Type de Session',
                'session.field': 'Terrain',
                'session.sea': 'Mer',
                'session.end': 'Terminer Session',
                'session.addCast': 'Ajouter Lancer',

                // History
                'history.title': 'Historique des Sessions',
                'history.filterLocation': 'Filtrer par Lieu',
                'history.allLocations': 'Tous les lieux',
                'history.period': 'Période',
                'history.all': 'Tous',
                'history.week': 'Dernière semaine',
                'history.month': 'Dernier mois',
                'history.months3': 'Derniers 3 mois',
                'history.sortBy': 'Trier par',
                'history.dateDesc': 'Date (plus récent)',
                'history.dateAsc': 'Date (plus ancien)',
                'history.noSessions': 'Aucune session trouvée',
                'history.previous': 'Précédent',
                'history.next': 'Suivant',
                'history.deleteSession': 'Supprimer Session',
                'history.backToList': 'Retour aux Sessions',

                // Partners
                'partners.title': 'Partenaires & Sponsors',
                'partners.subtitle': 'Découvrez nos partenaires officiels et sponsors qui soutiennent la communauté du longcasting',
                'partners.shops': 'Magasins de Pêche',
                'partners.associations': 'Associations',
                'partners.coaches': 'Instructeurs de Lancer',
                'partners.website': 'Site Web',
                'partners.call': 'Appeler',
                'partners.email': 'Email',
                'partners.become': 'Devenir Partenaire',
                'partners.becomeText': 'Êtes-vous une entreprise, une association ou un instructeur? Rejoignez notre réseau de partenaires officiels!',
                'partners.contact': 'Nous Contacter',

                // Settings
                'settings.title': 'Paramètres',
                'settings.language': 'Langue / Language',
                'settings.languageDesc': 'Sélectionner la langue de l\'application',
                'settings.units': 'Unités de Mesure',
                'settings.unitsDesc': 'Personnalisez les unités de mesure utilisées dans l\'app',
                'settings.distance': 'Distance',
                'settings.weight': 'Poids',
                'settings.temperature': 'Température',
                'settings.wind': 'Vitesse du Vent',
                'settings.timeFormat': 'Format d\'Heure',
                'settings.dateFormat': 'Format de Date',
                'settings.saveUnits': 'Enregistrer Unités',
                'settings.backup': 'Sauvegarde & Cloud',
                'settings.backupDesc': 'Gérez vos données et sauvegarde cloud',
                'settings.export': 'Exporter Données (JSON)',
                'settings.import': 'Importer Données (JSON)',
                'settings.deleteAll': 'Supprimer Toutes les Données',
                'settings.cloudSync': 'Synchronisation Cloud',
                'settings.cloudPremium': 'Fonction de synchronisation cloud disponible dans la version premium',
                'settings.install': 'Installer Application',
                'settings.installDesc': 'Installez Longcasting Pro sur votre appareil pour une expérience optimale',

                // Profile
                'profile.title': 'Profil Athlète',
                'profile.personal': 'Informations Personnelles',
                'profile.name': 'Prénom',
                'profile.surname': 'Nom',
                'profile.age': 'Âge',
                'profile.gender': 'Genre',
                'profile.male': 'Masculin',
                'profile.female': 'Féminin',
                'profile.other': 'Autre',
                'profile.physical': 'Données Physiques',
                'profile.height': 'Taille (cm)',
                'profile.weight': 'Poids (kg)',
                'profile.bmi': 'IMC',
                'profile.save': 'Enregistrer Profil',

                // Common
                'common.save': 'Enregistrer',
                'common.cancel': 'Annuler',
                'common.delete': 'Supprimer',
                'common.edit': 'Modifier',
                'common.close': 'Fermer',
                'common.confirm': 'Confirmer',
                'common.search': 'Rechercher',
                'common.loading': 'Chargement...',
                'common.error': 'Erreur',
                'common.success': 'Succès',
                'common.warning': 'Attention'
            }
        };

        // Database mulinelli con metri per giro (predefiniti)
        this.mulinelliDB = {
            'Shimano 8000': 0.82,
            'Shimano 10000': 0.91,
            'Shimano 14000': 1.05,
            'Daiwa 5000': 0.79,
            'Daiwa 6000': 0.88,
            'Daiwa 7000': 0.95,
            'Penn Spinfisher 8500': 0.89,
            'Okuma 8K': 0.85
        };

        // Configurazione mulinelli custom (salvata in localStorage)
        this.mulinelliConfig = {};

        this.init();
    }

    init() {
        // Check if localStorage is available
        this.checkStorageAvailability();
        this.loadData();
        this.loadSuggestions();
        this.loadMulinelliConfig();
        this.updateDatalistSuggestions();
        this.setupEventListeners();
        this.setupPersistenceListeners();
        this.updateDashboard();
        this.loadProfile();
        this.loadSettings();
        this.applyTranslations();
        this.setDefaultDateTime();
        this.checkActiveSession();
    }

    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage non disponibile:', e);
            alert('ATTENZIONE: Il salvataggio dati potrebbe non funzionare. Per iOS: aggiungi questa app alla Home Screen per garantire il salvataggio dei dati.');
            return false;
        }
    }

    // Setup listeners for better data persistence on iOS
    setupPersistenceListeners() {
        // Save before page unload (iOS)
        window.addEventListener('beforeunload', () => {
            this.saveData();
            this.saveSuggestions();
            this.saveSession();
        });

        // Save when page goes to background (iOS Safari)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveData();
                this.saveSuggestions();
                this.saveSession();
            }
        });

        // Save when iOS Safari freezes the page
        window.addEventListener('pagehide', () => {
            this.saveData();
            this.saveSuggestions();
            this.saveSession();
        });

        // Periodic auto-save every 30 seconds
        setInterval(() => {
            this.saveData();
            this.saveSuggestions();
            this.saveSession();
        }, 30000);
    }

    // Data Management
    loadData() {
        try {
            const savedSessions = localStorage.getItem('longcast_sessions');
            const savedProfile = localStorage.getItem('longcast_profile');
            const savedActiveSession = sessionStorage.getItem('longcast_active_session');

            if (savedSessions) {
                this.sessions = JSON.parse(savedSessions);
                console.log('✅ Caricate', this.sessions.length, 'sessioni da localStorage');
            } else {
                console.log('ℹ️ Nessuna sessione salvata in localStorage');
            }

            if (savedProfile) {
                this.profile = JSON.parse(savedProfile);
                console.log('✅ Profilo caricato');
            }

            if (savedActiveSession) {
                this.currentSession = JSON.parse(savedActiveSession);
                console.log('✅ Sessione attiva recuperata con', this.currentSession.lanci.length, 'lanci');
            }
        } catch (error) {
            console.error('❌ Errore nel caricare i dati:', error);
            // Reset to defaults on error
            this.sessions = [];
            this.profile = null;
            this.currentSession = null;
        }
    }

    saveData() {
        try {
            const sessionsJson = JSON.stringify(this.sessions);
            localStorage.setItem('longcast_sessions', sessionsJson);
            console.log('✅ Sessioni salvate:', this.sessions.length, 'sessioni');

            if (this.profile) {
                localStorage.setItem('longcast_profile', JSON.stringify(this.profile));
                console.log('✅ Profilo salvato');
            }
        } catch (error) {
            console.error('❌ Errore nel salvare i dati:', error);
            // Try to free space by removing old data if quota exceeded
            if (error.name === 'QuotaExceededError') {
                try {
                    // Keep only last 20 sessions
                    if (this.sessions.length > 20) {
                        this.sessions = this.sessions.slice(-20);
                        localStorage.setItem('longcast_sessions', JSON.stringify(this.sessions));
                        console.log('✅ Sessioni salvate dopo pulizia:', this.sessions.length);
                    }
                } catch (e) {
                    console.error('❌ Impossibile salvare i dati anche dopo pulizia:', e);
                    alert('ERRORE: Impossibile salvare i dati. Memoria piena o localStorage disabilitato.');
                }
            }
        }
    }

    saveSession() {
        try {
            if (this.currentSession) {
                sessionStorage.setItem('longcast_active_session', JSON.stringify(this.currentSession));
            } else {
                sessionStorage.removeItem('longcast_active_session');
            }
        } catch (error) {
            console.error('Errore nel salvare la sessione attiva:', error);
        }
    }

    // Suggestions Management
    loadSuggestions() {
        try {
            const saved = localStorage.getItem('longcast_suggestions');
            if (saved) {
                this.suggestions = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Errore nel caricare i suggerimenti:', error);
            this.suggestions = {
                tecniche: [],
                pesoPiombo: [],
                vento: [],
                direzioneVento: [],
                cannaModello: [],
                luoghi: [],
                grammatura: [],
                mulinello: [],
                filo: [],
                lunghezzaCanna: [],
                temperatura: [],
                umidita: [],
                note: []
            };
        }
    }

    saveSuggestions() {
        try {
            localStorage.setItem('longcast_suggestions', JSON.stringify(this.suggestions));
            console.log('✅ Suggerimenti salvati');
        } catch (error) {
            console.error('❌ Errore nel salvare i suggerimenti:', error);
        }
    }

    // Mulinelli Configuration Management
    loadMulinelliConfig() {
        try {
            const saved = localStorage.getItem('longcast_mulinelli_config');
            if (saved) {
                this.mulinelliConfig = JSON.parse(saved);
                console.log('✅ Configurazione mulinelli caricata:', Object.keys(this.mulinelliConfig).length, 'mulinelli custom');
            }
        } catch (error) {
            console.error('❌ Errore nel caricare configurazione mulinelli:', error);
            this.mulinelliConfig = {};
        }
    }

    saveMulinelliConfig() {
        try {
            localStorage.setItem('longcast_mulinelli_config', JSON.stringify(this.mulinelliConfig));
            console.log('✅ Configurazione mulinelli salvata');
        } catch (error) {
            console.error('❌ Errore nel salvare configurazione mulinelli:', error);
        }
    }

    getMulinelloMetriPerGiro(nomeMuslinello) {
        // Controlla prima config custom, poi database predefinito
        if (this.mulinelliConfig[nomeMuslinello] !== undefined) {
            return this.mulinelliConfig[nomeMuslinello];
        }
        if (this.mulinelliDB[nomeMuslinello] !== undefined) {
            return this.mulinelliDB[nomeMuslinello];
        }
        return null;
    }

    addSuggestion(type, value) {
        if (!value || value.trim() === '') return;

        const trimmedValue = value.trim();
        if (!this.suggestions[type].includes(trimmedValue)) {
            this.suggestions[type].push(trimmedValue);
            this.saveSuggestions();
            this.updateDatalistSuggestions();
        }
    }

    updateDatalistSuggestions() {
        // Tecnica
        const tecnicaList = document.getElementById('tecnica-list');
        if (tecnicaList) {
            tecnicaList.innerHTML = this.suggestions.tecniche.map(t =>
                `<option value="${this.escapeHtml(t)}">`
            ).join('');
        }

        // Peso Piombo
        const pesoPiomboList = document.getElementById('peso-piombo-list');
        if (pesoPiomboList) {
            pesoPiomboList.innerHTML = this.suggestions.pesoPiombo.map(p =>
                `<option value="${this.escapeHtml(p)}">`
            ).join('');
        }

        // Vento
        const ventoList = document.getElementById('vento-list');
        if (ventoList) {
            ventoList.innerHTML = this.suggestions.vento.map(v =>
                `<option value="${this.escapeHtml(v)}">`
            ).join('');
        }

        // Direzione Vento
        const direzioneList = document.getElementById('direzione-vento-list');
        if (direzioneList) {
            direzioneList.innerHTML = this.suggestions.direzioneVento.map(d =>
                `<option value="${this.escapeHtml(d)}">`
            ).join('');
        }

        // Canna Modello
        const cannaModelloList = document.getElementById('canna-modello-list');
        if (cannaModelloList) {
            cannaModelloList.innerHTML = this.suggestions.cannaModello.map(c =>
                `<option value="${this.escapeHtml(c)}">`
            ).join('');
        }

        // Luoghi
        const luogoList = document.getElementById('luogo-list');
        if (luogoList) {
            luogoList.innerHTML = this.suggestions.luoghi.map(l =>
                `<option value="${this.escapeHtml(l)}">`
            ).join('');
        }

        // Grammatura
        const grammaturaList = document.getElementById('grammatura-list');
        if (grammaturaList) {
            grammaturaList.innerHTML = this.suggestions.grammatura.map(g =>
                `<option value="${this.escapeHtml(g)}">`
            ).join('');
        }

        // Mulinello
        const mulinelloList = document.getElementById('mulinello-list');
        if (mulinelloList) {
            mulinelloList.innerHTML = this.suggestions.mulinello.map(m =>
                `<option value="${this.escapeHtml(m)}">`
            ).join('');
        }

        // Filo
        const filoList = document.getElementById('filo-list');
        if (filoList) {
            filoList.innerHTML = this.suggestions.filo.map(f =>
                `<option value="${this.escapeHtml(f)}">`
            ).join('');
        }

        // Lunghezza Canna
        const lunghezzaCannaList = document.getElementById('lunghezza-canna-list');
        if (lunghezzaCannaList) {
            lunghezzaCannaList.innerHTML = this.suggestions.lunghezzaCanna.map(l =>
                `<option value="${this.escapeHtml(l)}">`
            ).join('');
        }

        // Temperatura
        const temperaturaList = document.getElementById('temperatura-list');
        if (temperaturaList) {
            temperaturaList.innerHTML = this.suggestions.temperatura.map(t =>
                `<option value="${this.escapeHtml(t)}">`
            ).join('');
        }

        // Umidità
        const umiditaList = document.getElementById('umidita-list');
        if (umiditaList) {
            umiditaList.innerHTML = this.suggestions.umidita.map(u =>
                `<option value="${this.escapeHtml(u)}">`
            ).join('');
        }

        // Note
        const noteList = document.getElementById('note-list');
        if (noteList) {
            noteList.innerHTML = this.suggestions.note.map(n =>
                `<option value="${this.escapeHtml(n)}">`
            ).join('');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.navigate(section);
                }
            });
        });

        // Session Forms
        document.getElementById('startSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startSession();
        });

        document.getElementById('addCastForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCastToSession();
        });

        document.getElementById('endSessionBtn').addEventListener('click', () => {
            this.endSession();
        });

        // Change Field Direction
        document.getElementById('changeDirectionBtn').addEventListener('click', () => {
            this.changeFieldDirection();
        });

        // Field Direction Setup - Slider
        document.getElementById('fieldDirectionSlider').addEventListener('input', (e) => {
            const angle = parseInt(e.target.value);
            this.updateFieldDirection(angle);
        });

        // Field Direction Setup - Quick Direction Buttons
        document.querySelectorAll('.quick-direction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = parseInt(e.target.dataset.direction);
                this.updateFieldDirection(direction);
            });
        });

        // Field Direction Setup - Confirm Button
        document.getElementById('confirmFieldDirectionBtn').addEventListener('click', () => {
            this.confirmFieldDirection();
        });

        // Profile Form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // BMI Calculation
        document.getElementById('peso').addEventListener('input', () => this.calculateBMI());
        document.getElementById('altezza').addEventListener('input', () => this.calculateBMI());

        // Filters
        document.getElementById('filter-luogo').addEventListener('input', () => this.filterHistory());
        document.getElementById('filter-periodo').addEventListener('change', () => this.filterHistory());
        document.getElementById('sort-by').addEventListener('change', () => this.filterHistory());

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage('prev'));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage('next'));

        // Session Detail
        document.getElementById('backToSessions').addEventListener('click', () => this.showSessionsList());

        // Data Management
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());

        // Settings
        document.querySelectorAll('input[name="language"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        });
        document.getElementById('saveUnitsBtn').addEventListener('click', () => this.saveUnits());
        document.getElementById('exportBtnSettings').addEventListener('click', () => this.exportData());
        document.getElementById('importBtnSettings').addEventListener('click', () => {
            document.getElementById('importFileSettings').click();
        });
        document.getElementById('importFileSettings').addEventListener('change', (e) => this.importData(e));
        document.getElementById('resetBtnSettings').addEventListener('click', () => this.clearAllData());

        // Campo/Mare Logic
        document.getElementById('session-tipo').addEventListener('change', () => this.handleTipoSessioneChange());
        document.getElementById('session-mulinello').addEventListener('input', () => this.handleMulinelloChange());
        document.getElementById('session-metri-per-giro').addEventListener('change', () => this.handleMetriPerGiroChange());
        document.getElementById('cast-distanza').addEventListener('input', () => this.calculateDistanzaMare());

        // GPS Tracking
        document.getElementById('gpsStartBtn').addEventListener('click', () => this.startGPSTracking());
        document.getElementById('gpsStopBtn').addEventListener('click', () => this.stopGPSTracking());

        // GPS Confirm Modal
        document.getElementById('gpsConfirmSave').addEventListener('click', () => this.saveGPSCast());
        document.getElementById('gpsConfirmCancel').addEventListener('click', () => this.cancelGPSCast());

        // Map Controls
        document.getElementById('closeMapBtn').addEventListener('click', () => this.closeMap());
    }

    // Navigation
    navigate(section) {
        // Close map if navigating away from storico section
        if (section !== 'storico') {
            document.getElementById('storicoMapContainer').style.display = 'none';
            document.getElementById('historySessionsList').style.display = 'block';
        }

        // Update sections - hide all first
        document.querySelectorAll('.section').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(section);
        if (selectedSection) {
            selectedSection.classList.add('active');
            selectedSection.style.display = 'block';
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const navBtn = document.querySelector(`[data-section="${section}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        // Refresh data based on section
        if (section === 'dashboard') {
            this.updateDashboard();
        } else if (section === 'storico') {
            this.filterHistory();
        } else if (section === 'profilo') {
            this.loadProfile();
        } else if (section === 'nuovo-lancio') {
            this.checkActiveSession();
        } else if (section === 'impostazioni') {
            this.loadSettings();
        }
    }

    // Campo/Mare Management
    handleTipoSessioneChange() {
        const tipo = document.getElementById('session-tipo').value;
        const metriPerGiroGroup = document.getElementById('metri-per-giro-group');

        if (tipo === 'mare') {
            // Mostra campo metri-per-giro
            metriPerGiroGroup.style.display = 'block';
        } else {
            // Nascondi campo metri-per-giro
            metriPerGiroGroup.style.display = 'none';
        }
    }

    handleMulinelloChange() {
        const mulinelloNome = document.getElementById('session-mulinello').value.trim();
        const metriPerGiroInput = document.getElementById('session-metri-per-giro');
        const tipo = document.getElementById('session-tipo').value;

        // Auto-compila metri-per-giro se mulinello conosciuto e tipo=mare
        if (tipo === 'mare' && mulinelloNome) {
            const metriPerGiro = this.getMulinelloMetriPerGiro(mulinelloNome);
            if (metriPerGiro !== null) {
                metriPerGiroInput.value = metriPerGiro;
                const source = this.mulinelliConfig[mulinelloNome] !== undefined ? 'custom' : 'predefinito';
                console.log(`✅ Mulinello "${mulinelloNome}" riconosciuto (${source}): ${metriPerGiro} m/giro`);
            }
        }
    }

    handleMetriPerGiroChange() {
        const mulinelloNome = document.getElementById('session-mulinello').value.trim();
        const metriPerGiro = parseFloat(document.getElementById('session-metri-per-giro').value);
        const tipo = document.getElementById('session-tipo').value;

        // Salva configurazione mulinello se valida
        if (tipo === 'mare' && mulinelloNome && !isNaN(metriPerGiro) && metriPerGiro > 0) {
            this.mulinelliConfig[mulinelloNome] = metriPerGiro;
            this.saveMulinelliConfig();
            console.log(`💾 Salvato mulinello "${mulinelloNome}": ${metriPerGiro} m/giro`);
        }
    }

    calculateDistanzaMare() {
        if (!this.currentSession) return;
        if (this.currentSession.tipo !== 'mare') return;

        const giri = parseFloat(document.getElementById('cast-distanza').value);
        const metriPerGiro = this.currentSession.metriPerGiro;

        if (giri && metriPerGiro) {
            const distanzaCalcolata = giri * metriPerGiro;
            document.getElementById('cast-distanza-calc').style.display = 'block';
            document.getElementById('cast-distanza-calc-value').textContent = distanzaCalcolata.toFixed(1) + ' m';
        } else {
            document.getElementById('cast-distanza-calc').style.display = 'none';
        }
    }

    updateCastDistanzaField() {
        if (!this.currentSession) return;

        const label = document.getElementById('cast-distanza-label');
        const input = document.getElementById('cast-distanza');

        if (this.currentSession.tipo === 'mare') {
            label.textContent = 'Giri Mulinello *';
            input.placeholder = 'es. 150';
            input.step = '1';
        } else {
            label.textContent = 'Distanza (metri) *';
            input.placeholder = 'es. 125.5';
            input.step = '0.1';
        }
    }

    // Session Management
    checkActiveSession() {
        if (this.currentSession) {
            this.showSessionActive();
        } else {
            this.showSessionNotStarted();
        }
    }

    showSessionNotStarted() {
        document.getElementById('sessionNotStarted').style.display = 'block';
        document.getElementById('sessionActive').style.display = 'none';
    }

    showSessionActive() {
        document.getElementById('sessionNotStarted').style.display = 'none';
        document.getElementById('sessionActive').style.display = 'block';
        this.updateSessionUI();
        this.updateCastDistanzaField();
    }

    startSession() {
        const formData = new FormData(document.getElementById('startSessionForm'));

        const tipo = formData.get('session-tipo');
        const pesoPiombo = formData.get('session-peso-piombo');
        const tecnica = formData.get('session-tecnica');
        const cannaModello = formData.get('session-canna-modello');
        const vento = formData.get('session-vento');
        const direzioneVento = formData.get('session-direzione-vento');
        const luogo = formData.get('session-luogo');
        const cannaGrammatura = formData.get('session-canna-grammatura');
        const mulinello = formData.get('session-mulinello');
        const filo = formData.get('session-filo');
        const cannaLunghezza = formData.get('session-canna-lunghezza');
        const temperatura = formData.get('session-temperatura');
        const umidita = formData.get('session-umidita');
        const note = formData.get('session-note');
        const metriPerGiro = tipo === 'mare' ? parseFloat(formData.get('session-metri-per-giro')) : null;

        // Acquire GPS position for field pivot point
        if (!navigator.geolocation) {
            this.showToast('Geolocalizzazione non supportata dal browser', 'error');
            return;
        }

        this.showToast('Acquisizione posizione GPS...', 'info');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Create session with pivot point
                this.currentSession = {
                    id: Date.now(),
                    tipo: tipo,
                    dataInizio: formData.get('session-data'),
                    luogo: luogo,
                    pesoPiombo: pesoPiombo,
                    tecnica: tecnica,
                    cannaModello: cannaModello,
                    cannaLunghezza: cannaLunghezza,
                    cannaGrammatura: cannaGrammatura,
                    mulinello: mulinello,
                    metriPerGiro: metriPerGiro,
                    filo: filo,
                    vento: vento,
                    direzioneVento: direzioneVento,
                    temperatura: temperatura,
                    umidita: umidita,
                    note: note,
                    puntoPerno: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    },
                    direzioneCampo: 0, // Initial direction (North), will be set by user
                    lanci: []
                };

                // Save suggestions
                this.addSuggestion('pesoPiombo', pesoPiombo);
                this.addSuggestion('tecniche', tecnica);
                this.addSuggestion('cannaModello', cannaModello);
                this.addSuggestion('vento', vento);
                this.addSuggestion('direzioneVento', direzioneVento);
                this.addSuggestion('luoghi', luogo);
                this.addSuggestion('grammatura', cannaGrammatura);
                this.addSuggestion('mulinello', mulinello);
                this.addSuggestion('filo', filo);
                this.addSuggestion('lunghezzaCanna', cannaLunghezza);
                this.addSuggestion('temperatura', temperatura);
                this.addSuggestion('umidita', umidita);
                this.addSuggestion('note', note);

                this.saveSession();

                // Reset form
                document.getElementById('startSessionForm').reset();
                this.setDefaultDateTime();

                // Open map in field direction setup mode
                this.showToast('Posizione acquisita! Imposta la direzione del campo sulla mappa.', 'success');
                this.openFieldDirectionSetup();
            },
            (error) => {
                console.error('GPS Error:', error);
                this.showToast('Errore acquisizione GPS: ' + error.message, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    updateSessionUI() {
        if (!this.currentSession) return;

        // Update session info
        const startDate = new Date(this.currentSession.dataInizio);
        document.getElementById('sessionStartTime').textContent = startDate.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('sessionCastCount').textContent = this.currentSession.lanci.length;
        document.getElementById('sessionLocation').textContent = this.currentSession.luogo;

        // Update session details
        const details = [];

        details.push({ label: 'Tecnica', value: this.currentSession.tecnica });
        details.push({ label: 'Peso Piombo', value: this.currentSession.pesoPiombo });

        if (this.currentSession.cannaModello) {
            details.push({ label: 'Modello Canna', value: this.currentSession.cannaModello });
        }

        if (this.currentSession.cannaLunghezza) {
            details.push({ label: 'Lunghezza', value: this.currentSession.cannaLunghezza + 'm' });
        }

        if (this.currentSession.cannaGrammatura) {
            details.push({ label: 'Grammatura', value: this.currentSession.cannaGrammatura + 'g' });
        }

        if (this.currentSession.mulinello) {
            details.push({ label: 'Mulinello', value: this.currentSession.mulinello });
        }

        if (this.currentSession.filo) {
            details.push({ label: 'Filo', value: this.currentSession.filo });
        }

        if (this.currentSession.vento) {
            details.push({ label: 'Vento', value: this.currentSession.vento });
        }

        if (this.currentSession.direzioneVento) {
            details.push({ label: 'Dir. Vento', value: this.currentSession.direzioneVento });
        }

        if (this.currentSession.temperatura) {
            details.push({ label: 'Temperatura', value: this.currentSession.temperatura + '°C' });
        }

        if (this.currentSession.umidita) {
            details.push({ label: 'Umidità', value: this.currentSession.umidita + '%' });
        }

        const detailsHTML = details.map(d => `
            <div class="session-detail-item">
                <span class="session-detail-label">${d.label}</span>
                <span class="session-detail-value">${d.value}</span>
            </div>
        `).join('');

        document.getElementById('sessionDetails').innerHTML = detailsHTML;

        // Pre-fill weather fields with current session data
        document.getElementById('cast-vento').value = this.currentSession.vento || '';
        document.getElementById('cast-direzione-vento').value = this.currentSession.direzioneVento || '';
        document.getElementById('cast-temperatura').value = this.currentSession.temperatura || '';
        document.getElementById('cast-umidita').value = this.currentSession.umidita || '';

        // Update current direction display
        if (this.currentSession.direzioneCampo !== undefined) {
            document.getElementById('currentDirection').textContent = this.currentSession.direzioneCampo + '°';
        }

        // Update session casts list
        this.updateSessionCastsList();
    }

    addCastToSession() {
        if (!this.currentSession) return;

        let distanzaInput = parseFloat(document.getElementById('cast-distanza').value);
        const note = document.getElementById('cast-note').value;

        // Calculate distance based on session type
        let distanzaFinale;
        let giri = null;

        if (this.currentSession.tipo === 'mare') {
            // Mare: distanzaInput = giri, calcoliamo distanza
            giri = distanzaInput;
            distanzaFinale = giri * this.currentSession.metriPerGiro;
            console.log(`🌊 Mare: ${giri} giri × ${this.currentSession.metriPerGiro} m/giro = ${distanzaFinale.toFixed(1)} m`);
        } else {
            // Campo: distanzaInput = metri
            distanzaFinale = distanzaInput;
        }

        // Get weather data (might have been updated)
        const vento = document.getElementById('cast-vento').value;
        const direzioneVento = document.getElementById('cast-direzione-vento').value;
        const temperatura = document.getElementById('cast-temperatura').value;
        const umidita = document.getElementById('cast-umidita').value;

        // Update session weather if changed
        this.currentSession.vento = vento;
        this.currentSession.direzioneVento = direzioneVento;
        this.currentSession.temperatura = temperatura;
        this.currentSession.umidita = umidita;

        // Save weather suggestions
        this.addSuggestion('vento', vento);
        this.addSuggestion('direzioneVento', direzioneVento);
        this.addSuggestion('temperatura', temperatura);
        this.addSuggestion('umidita', umidita);

        // Create cast object
        const cast = {
            distanza: distanzaFinale,
            giri: giri,
            orario: new Date().toISOString(),
            note: note
        };

        this.currentSession.lanci.push(cast);
        this.saveSession();

        // Update UI
        this.updateSessionUI();

        // Clear form
        document.getElementById('cast-distanza').value = '';
        document.getElementById('cast-note').value = '';

        // Scroll to distance field and focus
        const distanzaField = document.getElementById('cast-distanza');
        setTimeout(() => {
            distanzaField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            distanzaField.focus();
        }, 100);

        // Show toast with appropriate message
        let toastMessage;
        if (this.currentSession.tipo === 'mare') {
            toastMessage = `🌊 Lancio registrato: ${giri} giri = ${distanzaFinale.toFixed(1)}m`;
        } else {
            toastMessage = `📍 Lancio registrato: ${distanzaFinale.toFixed(1)}m`;
        }
        this.showToast(toastMessage, 'success');
    }

    updateSessionCastsList() {
        if (!this.currentSession || this.currentSession.lanci.length === 0) {
            document.getElementById('sessionCastsList').innerHTML = '<p class="no-data-text">Nessun lancio ancora registrato in questa sessione</p>';
            return;
        }

        const castsHTML = this.currentSession.lanci.map((cast, index) => {
            const orario = new Date(cast.orario);
            const orarioFormatted = orario.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // GPS badge if measured with GPS
            const gpsBadge = cast.gps && cast.gps.misurato ?
                `<span class="gps-badge" title="Misurato con GPS - Precisione: ±${cast.gps.accuracy.toFixed(1)}m">📍 GPS</span>` :
                '';

            return `
                <div class="cast-item">
                    <div class="cast-distance">${cast.distanza.toFixed(1)}m ${gpsBadge}</div>
                    <div class="cast-info">
                        <div class="cast-technique">Lancio #${index + 1}</div>
                        <div class="cast-details">
                            ${cast.note ? cast.note : 'Nessuna nota'}
                        </div>
                    </div>
                    <div>
                        <div class="cast-date">${orarioFormatted}</div>
                        <div class="cast-actions">
                            <button class="delete" data-index="${index}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('sessionCastsList').innerHTML = castsHTML;

        // Add delete listeners
        document.querySelectorAll('#sessionCastsList .delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.deleteSessionCast(index);
            });
        });
    }

    deleteSessionCast(index) {
        if (!this.currentSession) return;

        if (confirm('Eliminare questo lancio dalla sessione?')) {
            this.currentSession.lanci.splice(index, 1);
            this.saveSession();
            this.updateSessionUI();
            this.showToast('Lancio eliminato', 'success');
        }
    }

    generateAutomaticNotes(session) {
        if (!session.lanci || session.lanci.length === 0) {
            return "Sessione terminata senza lanci registrati.";
        }

        const distances = session.lanci.map(l => l.distanza);
        const avgDistance = session.distanzaMedia;
        const maxDistance = session.distanzaMassima;
        const minDistance = session.distanzaMinima;

        // Calculate trend (first half vs second half)
        const half = Math.floor(distances.length / 2);
        const firstHalf = distances.slice(0, half);
        const secondHalf = distances.slice(half);
        const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const improvement = secondHalfAvg - firstHalfAvg;

        // Calculate consistency (standard deviation)
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
        const stdDev = Math.sqrt(variance);
        const consistencyPercent = ((1 - (stdDev / avgDistance)) * 100).toFixed(1);

        // Compare with last 5 sessions
        const recentSessions = this.sessions.slice(-5);
        let historicalComparison = "";

        if (recentSessions.length > 0) {
            const avgOfRecent = recentSessions.reduce((sum, s) => sum + (s.distanzaMedia || 0), 0) / recentSessions.length;
            const maxOfRecent = Math.max(...recentSessions.map(s => s.distanzaMassima || 0));
            const avgDiff = avgDistance - avgOfRecent;
            const maxDiff = maxDistance - maxOfRecent;

            if (avgDiff > 2) {
                historicalComparison = `Ottima performance! Media superiore di ${avgDiff.toFixed(1)}m rispetto alle ultime ${recentSessions.length} sessioni. `;
            } else if (avgDiff < -2) {
                historicalComparison = `Media inferiore di ${Math.abs(avgDiff).toFixed(1)}m rispetto alle sessioni recenti. Potrebbe essere necessario rivedere la tecnica. `;
            } else {
                historicalComparison = `Performance in linea con le ultime sessioni (±${Math.abs(avgDiff).toFixed(1)}m). `;
            }

            if (maxDistance > maxOfRecent) {
                historicalComparison += `Nuovo record personale: ${maxDistance.toFixed(1)}m! `;
            }
        }

        // Generate trend analysis
        let trendAnalysis = "";
        if (improvement > 3) {
            trendAnalysis = `Tendenza positiva: miglioramento di ${improvement.toFixed(1)}m tra prima e seconda metà della sessione. Buon riscaldamento progressivo. `;
        } else if (improvement < -3) {
            trendAnalysis = `Calo di performance: -${Math.abs(improvement).toFixed(1)}m nella seconda metà. Possibile affaticamento o perdita di concentrazione. `;
        } else {
            trendAnalysis = `Performance costante durante tutta la sessione. `;
        }

        // Generate consistency feedback
        let consistencyFeedback = "";
        if (consistencyPercent > 90) {
            consistencyFeedback = `Eccellente consistenza (${consistencyPercent}%). Tecnica molto stabile. `;
        } else if (consistencyPercent > 80) {
            consistencyFeedback = `Buona consistenza (${consistencyPercent}%). Lanci abbastanza uniformi. `;
        } else {
            consistencyFeedback = `Consistenza da migliorare (${consistencyPercent}%). Ampia variazione tra lanci (±${stdDev.toFixed(1)}m). `;
        }

        // Generate suggestions
        let suggestions = "\n\n💡 Suggerimenti:\n";

        if (improvement < -3) {
            suggestions += "• Fai pause più frequenti per evitare l'affaticamento\n";
            suggestions += "• Mantieni la concentrazione anche negli ultimi lanci\n";
        }

        if (stdDev > 10) {
            suggestions += "• Lavora sulla ripetibilità del gesto tecnico\n";
            suggestions += "• Concentrati sulla fluidità del movimento\n";
        }

        if (session.lanci.length < 10) {
            suggestions += "• Prova ad aumentare il numero di lanci per sessione\n";
        }

        if (avgDistance < 160 && recentSessions.length > 0) {
            suggestions += "• Considera di sperimentare con pesi del piombo diversi\n";
            suggestions += "• Rivedi la tecnica con un istruttore\n";
        }

        if (maxDistance - avgDistance > 20) {
            suggestions += "• Analizza il lancio migliore per replicare la tecnica\n";
        }

        // Build final note
        const note = `📊 Analisi Automatica Sessione\n\n` +
            `Lanci: ${session.lanci.length} | Media: ${avgDistance.toFixed(1)}m | Max: ${maxDistance.toFixed(1)}m | Min: ${minDistance.toFixed(1)}m\n\n` +
            trendAnalysis + consistencyFeedback + "\n\n" +
            (historicalComparison ? `📈 Confronto Storico:\n${historicalComparison}\n` : '') +
            suggestions;

        return note;
    }

    endSession() {
        if (!this.currentSession) return;

        if (this.currentSession.lanci.length === 0) {
            if (!confirm('La sessione non contiene lanci. Terminarla comunque?')) {
                return;
            }
        }

        const confirmation = confirm(
            `Terminare la sessione di allenamento?\n\n` +
            `Lanci registrati: ${this.currentSession.lanci.length}\n` +
            `La sessione verrà salvata nello storico.`
        );

        if (!confirmation) return;

        // Mark session as completed with end time
        this.currentSession.dataFine = new Date().toISOString();
        this.currentSession.completata = true;

        // Calculate session stats
        if (this.currentSession.lanci.length > 0) {
            const distanze = this.currentSession.lanci.map(l => l.distanza);
            this.currentSession.distanzaMedia = distanze.reduce((a, b) => a + b, 0) / distanze.length;
            this.currentSession.distanzaMassima = Math.max(...distanze);
            this.currentSession.distanzaMinima = Math.min(...distanze);
        }

        // Generate automatic intelligent notes
        this.currentSession.note = this.generateAutomaticNotes(this.currentSession);

        // Save completed session to sessions array
        this.sessions.push({...this.currentSession});
        this.saveData();

        // Clear active session
        this.currentSession = null;
        this.saveSession();

        this.showToast('Sessione di allenamento terminata e salvata!', 'success');

        // Update UI
        this.showSessionNotStarted();
        this.updateDashboard();

        // Reset form
        this.setDefaultDateTime();
    }

    // Change Field Direction during active session
    changeFieldDirection() {
        if (!this.currentSession) {
            this.showToast('Errore: nessuna sessione attiva', 'error');
            return;
        }

        const newDirection = parseInt(document.getElementById('new-direction').value);

        if (isNaN(newDirection) || newDirection < 0 || newDirection > 359) {
            this.showToast('Inserisci una direzione valida (0-359°)', 'warning');
            return;
        }

        // Update session direction
        this.currentSession.direzioneCampo = newDirection;
        this.saveSession();

        // Update UI
        document.getElementById('currentDirection').textContent = newDirection + '°';
        document.getElementById('new-direction').value = '';

        this.showToast(`Direzione campo aggiornata: ${newDirection}°`, 'success');
    }

    // Open Field Direction Setup Mode
    openFieldDirectionSetup() {
        if (!this.currentSession || !this.currentSession.puntoPerno) {
            this.showToast('Errore: dati sessione non validi', 'error');
            return;
        }

        // Navigate to history section to access map
        this.showSection('storico');

        // Initialize map if needed
        if (!this.map) {
            this.map = L.map('storicoMap').setView([0, 0], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 22,
                minZoom: 3
            }).addTo(this.map);
        }

        // Show map in fullscreen
        const mapContainer = document.getElementById('storicoMapContainer');
        mapContainer.style.display = 'block';
        mapContainer.classList.add('fullscreen');
        document.body.style.overflow = 'hidden';

        // Hide sessions list
        document.getElementById('historySessionsList').style.display = 'none';

        // Show field direction panel
        document.getElementById('fieldDirectionPanel').style.display = 'block';

        // Update map title
        document.querySelector('.map-header h3').textContent = '🗺️ Imposta Direzione Campo';

        // Center map on pivot point
        const lat = this.currentSession.puntoPerno.latitude;
        const lng = this.currentSession.puntoPerno.longitude;
        this.map.setView([lat, lng], 18);

        // Force map resize
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);

        // Clear any existing markers
        this.clearMapMarkers();

        // Add pivot point marker
        const pivotMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #00FF00; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
            })
        }).addTo(this.map);
        pivotMarker.bindPopup('📍 Punto di Lancio (Perno Campo)');
        this.mapMarkers.push(pivotMarker);

        // Draw initial field at 0° (North)
        this.updateFieldDirection(0);
    }

    // Update Field Direction on Map
    updateFieldDirection(angle) {
        if (!this.currentSession || !this.currentSession.puntoPerno || !this.map) return;

        // Update current session direction (temporary until confirmed)
        this.currentSession.direzioneCampo = angle;

        // Clear previous field lines (keep pivot marker)
        const pivotMarker = this.mapMarkers[0]; // Save pivot marker
        this.clearMapMarkers();
        if (pivotMarker) {
            this.mapMarkers.push(pivotMarker);
            pivotMarker.addTo(this.map);
        }

        // Draw casting field with new direction
        const lat = this.currentSession.puntoPerno.latitude;
        const lng = this.currentSession.puntoPerno.longitude;
        this.drawCastingField(lat, lng, angle);

        // Update UI displays
        document.getElementById('fieldDirectionDisplay').textContent = angle + '°';
        document.getElementById('fieldDirectionSlider').value = angle;

        // Update cardinal direction text
        const cardinalDirection = this.getCardinalDirection(angle);
        document.getElementById('fieldDirectionCardinal').textContent = cardinalDirection;

        // Update slider background gradient
        const slider = document.getElementById('fieldDirectionSlider');
        const percentage = (angle / 359) * 100;
        slider.style.background = `linear-gradient(to right, var(--primary) ${percentage}%, var(--border) ${percentage}%)`;
    }

    // Get Cardinal Direction from angle
    getCardinalDirection(angle) {
        const directions = [
            { name: 'Nord', min: 0, max: 22.5 },
            { name: 'Nord-Est', min: 22.5, max: 67.5 },
            { name: 'Est', min: 67.5, max: 112.5 },
            { name: 'Sud-Est', min: 112.5, max: 157.5 },
            { name: 'Sud', min: 157.5, max: 202.5 },
            { name: 'Sud-Ovest', min: 202.5, max: 247.5 },
            { name: 'Ovest', min: 247.5, max: 292.5 },
            { name: 'Nord-Ovest', min: 292.5, max: 337.5 },
            { name: 'Nord', min: 337.5, max: 360 }
        ];

        for (const dir of directions) {
            if (angle >= dir.min && angle < dir.max) {
                return dir.name;
            }
        }
        return 'Nord';
    }

    // Confirm Field Direction and Start Session
    confirmFieldDirection() {
        if (!this.currentSession) {
            this.showToast('Errore: nessuna sessione attiva', 'error');
            return;
        }

        const direction = this.currentSession.direzioneCampo;

        // Save session with confirmed direction
        this.saveSession();

        // Close map and field direction panel
        this.closeFieldDirectionSetup();

        // Show session active view
        this.showSessionActive();

        this.showToast(`Sessione avviata! Direzione campo: ${direction}° (${this.getCardinalDirection(direction)})`, 'success');
    }

    // Close Field Direction Setup
    closeFieldDirectionSetup() {
        const mapContainer = document.getElementById('storicoMapContainer');
        mapContainer.classList.remove('fullscreen');
        document.body.style.overflow = '';

        // Hide field direction panel
        document.getElementById('fieldDirectionPanel').style.display = 'none';

        // Restore map title
        document.querySelector('.map-header h3').textContent = '🗺️ Mappa Lanci GPS';

        // Clear map markers
        this.clearMapMarkers();

        // Navigate back to session view
        this.showSection('sessione');
    }

    // Delete Session (from history)
    deleteSession(sessionId) {
        if (confirm('Sei sicuro di voler eliminare questa sessione? Verranno eliminati tutti i lanci associati.')) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.saveData();
            this.showToast('Sessione eliminata', 'success');
            this.updateDashboard();
            this.showSessionsList(); // Return to sessions list
        }
    }

    deleteCast(sessionId, castId) {
        if (!confirm('Sei sicuro di voler eliminare questo lancio?')) {
            return;
        }

        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            this.showToast('Sessione non trovata', 'error');
            return;
        }

        // Remove the cast from the session
        session.lanci = session.lanci.filter(l => l.id !== castId);

        // Recalculate session statistics
        if (session.lanci.length > 0) {
            const distanze = session.lanci.map(l => l.distanza);
            session.distanzaMedia = distanze.reduce((a, b) => a + b, 0) / distanze.length;
            session.distanzaMassima = Math.max(...distanze);
            session.distanzaMinima = Math.min(...distanze);
        } else {
            // If no more casts, delete the entire session
            if (confirm('Non ci sono più lanci in questa sessione. Vuoi eliminare anche la sessione?')) {
                this.deleteSession(sessionId);
                return;
            }
        }

        this.saveData();
        this.showToast('Lancio eliminato', 'success');

        // Refresh the session detail view
        this.showSessionDetail(sessionId);
        this.updateDashboard();
    }

    // Update Dashboard
    updateDashboard() {
        if (this.sessions.length === 0) {
            this.showEmptyDashboard();
            return;
        }

        this.updateStats();
        this.updateChart();
        this.updateRecentSessions();
    }

    showEmptyDashboard() {
        document.getElementById('stat-media').textContent = '-- m';
        document.getElementById('stat-record').textContent = '-- m';
        document.getElementById('stat-totale').textContent = '0';
        document.getElementById('stat-miglioramento').textContent = '-- %';

        document.getElementById('chartCanvas').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';

        document.getElementById('recentCastsList').innerHTML = '<p class="no-data-text">Nessuna sessione registrata</p>';
    }

    updateStats() {
        // Collect all casts from all sessions
        const allCasts = this.sessions.flatMap(s => s.lanci || []);

        if (allCasts.length === 0) {
            this.showEmptyDashboard();
            return;
        }

        const distanze = allCasts.map(c => c.distanza);

        // Media totale
        const media = distanze.reduce((a, b) => a + b, 0) / distanze.length;
        document.getElementById('stat-media').textContent = media.toFixed(1) + ' m';

        // Record assoluto
        const record = Math.max(...distanze);
        document.getElementById('stat-record').textContent = record.toFixed(1) + ' m';

        // Totale lanci
        document.getElementById('stat-totale').textContent = allCasts.length;

        // Miglioramento tra sessioni
        const improvement = this.calculateSessionImprovement();
        const improvementText = improvement !== null ?
            (improvement > 0 ? '+' : '') + improvement.toFixed(1) + '%' :
            '-- %';
        document.getElementById('stat-miglioramento').textContent = improvementText;
    }

    calculateSessionImprovement() {
        if (this.sessions.length < 2) {
            return null;
        }

        // Sort sessions by date
        const sortedSessions = [...this.sessions].sort((a, b) =>
            new Date(a.dataInizio) - new Date(b.dataInizio)
        );

        // Get last 2 sessions that have casts
        const sessionsWithCasts = sortedSessions.filter(s => s.lanci && s.lanci.length > 0);

        if (sessionsWithCasts.length < 2) {
            return null;
        }

        // Compare last session with previous one
        const lastSession = sessionsWithCasts[sessionsWithCasts.length - 1];
        const previousSession = sessionsWithCasts[sessionsWithCasts.length - 2];

        const lastAvg = lastSession.distanzaMedia ||
            lastSession.lanci.reduce((sum, l) => sum + l.distanza, 0) / lastSession.lanci.length;
        const prevAvg = previousSession.distanzaMedia ||
            previousSession.lanci.reduce((sum, l) => sum + l.distanza, 0) / previousSession.lanci.length;

        return ((lastAvg - prevAvg) / prevAvg) * 100;
    }

    updateChart() {
        const canvas = document.getElementById('chartCanvas');
        const ctx = canvas.getContext('2d');

        // Sort sessions by date
        const sortedSessions = [...this.sessions].sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));

        if (sortedSessions.length === 0) {
            canvas.style.display = 'none';
            document.getElementById('noDataMessage').style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        document.getElementById('noDataMessage').style.display = 'none';

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;

        const padding = 60;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;

        // Get session averages
        const sessionAverages = sortedSessions.map(s => {
            if (s.lanci && s.lanci.length > 0) {
                return s.distanzaMedia || s.lanci.reduce((sum, l) => sum + l.distanza, 0) / s.lanci.length;
            }
            return 0;
        });

        const maxDistance = Math.max(...sessionAverages);
        const minDistance = Math.min(...sessionAverages);
        const range = maxDistance - minDistance || 1;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxDistance - (range / 5) * i;
            ctx.fillStyle = '#a0aec0';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(1) + 'm', padding - 10, y + 4);
        }

        // Draw line
        ctx.strokeStyle = '#00D9FF';
        ctx.lineWidth = 3;
        ctx.beginPath();

        sortedSessions.forEach((session, i) => {
            const avg = sessionAverages[i];
            const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((avg - minDistance) / range) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        sortedSessions.forEach((session, i) => {
            const avg = sessionAverages[i];
            const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((avg - minDistance) / range) * chartHeight;

            // Outer circle
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#00D9FF';
            ctx.fill();

            // Inner circle
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#0A0E27';
            ctx.fill();
        });

        // X-axis labels (show max 10 labels)
        const labelInterval = Math.ceil(sortedSessions.length / 10);
        ctx.fillStyle = '#a0aec0';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        sortedSessions.forEach((session, i) => {
            if (i % labelInterval === 0 || i === sortedSessions.length - 1) {
                const x = padding + (chartWidth / (sortedSessions.length - 1 || 1)) * i;
                const date = new Date(session.dataInizio);
                const label = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
                ctx.fillText(label, x, canvas.height - padding + 20);
            }
        });
    }

    updateRecentSessions() {
        const recentSessions = [...this.sessions]
            .sort((a, b) => new Date(b.dataInizio) - new Date(a.dataInizio))
            .slice(0, 3);

        const container = document.getElementById('recentCastsList');

        if (recentSessions.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessuna sessione registrata</p>';
            return;
        }

        container.innerHTML = recentSessions.map(session => this.createSessionCardHTML(session, true)).join('');
    }

    createSessionCardHTML(session, compact = false) {
        const date = new Date(session.dataInizio);
        const formattedDate = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const numLanci = session.lanci ? session.lanci.length : 0;
        const mediaDistanza = session.distanzaMedia ? session.distanzaMedia.toFixed(1) : '--';
        const maxDistanza = session.distanzaMassima ? session.distanzaMassima.toFixed(1) : '--';

        // Check if session has GPS casts
        const hasGPSCasts = session.lanci && session.lanci.some(cast => cast.gps && cast.gps.misurato && cast.gps.startPosition);

        return `
            <div class="session-card" onclick="app.showSessionDetail(${session.id})">
                <div class="session-card-header">
                    <div>
                        <div class="session-card-title">${this.escapeHtml(session.luogo || 'Sessione')}</div>
                        <div class="session-card-date">${formattedDate} • ${formattedTime}</div>
                    </div>
                    ${hasGPSCasts ? `
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); app.showSessionOnMap(${session.id})" style="margin-left: auto;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Mappa
                    </button>
                    ` : ''}
                </div>
                <div class="session-card-stats">
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Lanci</span>
                        <span class="session-card-stat-value">${numLanci}</span>
                    </div>
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Media</span>
                        <span class="session-card-stat-value">${mediaDistanza}m</span>
                    </div>
                    <div class="session-card-stat">
                        <span class="session-card-stat-label">Massima</span>
                        <span class="session-card-stat-value">${maxDistanza}m</span>
                    </div>
                </div>
                <div class="session-card-info">
                    ${session.tecnica ? `<span>${this.escapeHtml(session.tecnica)}</span>` : ''}
                    ${session.pesoPiombo ? `<span>${this.escapeHtml(session.pesoPiombo)}</span>` : ''}
                    ${session.vento ? `<span>${this.escapeHtml(session.vento)}</span>` : ''}
                </div>
            </div>
        `;
    }

    createCastHTML(cast) {
        const date = new Date(cast.data);
        const formattedDate = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="cast-item">
                <div class="cast-distance">${cast.distanza.toFixed(1)}m</div>
                <div class="cast-info">
                    <div class="cast-technique">${cast.tecnica || 'N/A'}</div>
                    <div class="cast-details">
                        ${cast.pesoPiombo || 'N/A'}
                        ${cast.vento ? ' • ' + cast.vento : ''}
                        ${cast.luogo ? ' • ' + cast.luogo : ''}
                    </div>
                </div>
                <div>
                    <div class="cast-date">${formattedDate}</div>
                    <div class="cast-actions">
                        <button class="delete" data-id="${cast.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Filter History
    filterHistory() {
        // Close map when filters are applied
        document.getElementById('storicoMapContainer').style.display = 'none';
        document.getElementById('historySessionsList').style.display = 'block';

        const luogoFilter = document.getElementById('filter-luogo').value;
        const periodoFilter = parseInt(document.getElementById('filter-periodo').value);
        const sortBy = document.getElementById('sort-by').value;

        let filtered = [...this.sessions];

        // Filter by location
        if (luogoFilter && luogoFilter.trim()) {
            filtered = filtered.filter(s =>
                s.luogo && s.luogo.toLowerCase().includes(luogoFilter.toLowerCase())
            );
        }

        // Filter by period
        if (periodoFilter && periodoFilter !== 'tutti') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - periodoFilter);
            filtered = filtered.filter(s => new Date(s.dataInizio) >= cutoff);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'data-desc':
                    return new Date(b.dataInizio) - new Date(a.dataInizio);
                case 'data-asc':
                    return new Date(a.dataInizio) - new Date(b.dataInizio);
                default:
                    return 0;
            }
        });

        // Store filtered sessions and reset to page 1
        this.filteredSessions = filtered;
        this.currentPage = 1;
        this.displaySessionHistory();
    }

    displaySessionHistory() {
        const container = document.getElementById('historySessionsList');
        const sessions = this.filteredSessions;

        if (sessions.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessuna sessione trovata</p>';
            document.getElementById('paginationControls').style.display = 'none';
            return;
        }

        // Calculate pagination
        const totalPages = Math.ceil(sessions.length / this.sessionsPerPage);
        const startIndex = (this.currentPage - 1) * this.sessionsPerPage;
        const endIndex = startIndex + this.sessionsPerPage;
        const paginatedSessions = sessions.slice(startIndex, endIndex);

        // Display sessions for current page
        container.innerHTML = paginatedSessions.map(session => this.createSessionCardHTML(session)).join('');

        // Update pagination controls
        this.updatePaginationControls(totalPages);
    }

    updatePaginationControls(totalPages) {
        const paginationControls = document.getElementById('paginationControls');

        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }

        paginationControls.style.display = 'flex';

        // Update page info
        const totalSessions = this.filteredSessions.length;
        const startNum = (this.currentPage - 1) * this.sessionsPerPage + 1;
        const endNum = Math.min(this.currentPage * this.sessionsPerPage, totalSessions);

        document.getElementById('pageInfo').textContent =
            `Sessioni ${startNum}-${endNum} di ${totalSessions} (Pagina ${this.currentPage}/${totalPages})`;

        // Update button states
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
    }

    goToPage(direction) {
        const totalPages = Math.ceil(this.filteredSessions.length / this.sessionsPerPage);

        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
        }

        this.displaySessionHistory();

        // Scroll to top of sessions list
        document.getElementById('historySessionsList').scrollIntoView({ behavior: 'smooth' });
    }

    showSessionDetail(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            this.showToast('Sessione non trovata', 'error');
            return;
        }

        // Hide sessions list, show detail view
        document.getElementById('sessionsList').style.display = 'none';
        document.getElementById('sessionDetail').style.display = 'block';

        // Update title
        document.getElementById('sessionDetailTitle').textContent = `Sessione del ${new Date(session.dataInizio).toLocaleDateString('it-IT')}`;

        // Wire up delete session button
        const deleteBtn = document.getElementById('deleteSessionBtn');
        deleteBtn.onclick = () => this.deleteSession(sessionId);

        // Populate session info
        const infoContainer = document.getElementById('sessionDetailInfo');
        infoContainer.innerHTML = this.createSessionInfoHTML(session);

        // Populate casts list (most recent first)
        const castsContainer = document.getElementById('sessionDetailCastsList');
        if (session.lanci && session.lanci.length > 0) {
            // Reverse the array to show most recent first
            const reversedLanci = [...session.lanci].reverse();
            castsContainer.innerHTML = reversedLanci.map((lancio, index) =>
                this.createCastDetailHTML(lancio, index + 1, session.id)
            ).join('');
        } else {
            castsContainer.innerHTML = '<p class="no-data-text">Nessun lancio in questa sessione</p>';
        }
    }

    showSessionsList() {
        document.getElementById('sessionsList').style.display = 'block';
        document.getElementById('sessionDetail').style.display = 'none';

        // Close map if it's open
        document.getElementById('storicoMapContainer').style.display = 'none';
        document.getElementById('historySessionsList').style.display = 'block';

        this.filterHistory(); // Refresh list
    }

    createSessionInfoHTML(session) {
        const dataInizio = new Date(session.dataInizio);
        const dataFine = session.dataFine ? new Date(session.dataFine) : null;

        const durata = dataFine ?
            Math.round((dataFine - dataInizio) / (1000 * 60)) :
            'In corso';

        const numLanci = session.lanci ? session.lanci.length : 0;
        let mediaDistanza = 0;
        let maxDistanza = 0;
        let minDistanza = 0;

        if (session.lanci && session.lanci.length > 0) {
            const distanze = session.lanci.map(l => l.distanza);
            mediaDistanza = session.distanzaMedia || (distanze.reduce((a, b) => a + b, 0) / distanze.length);
            maxDistanza = session.distanzaMassima || Math.max(...distanze);
            minDistanza = session.distanzaMinima || Math.min(...distanze);
        }

        // Check if session has GPS casts
        const hasGPSCasts = session.lanci && session.lanci.some(cast => cast.gps && cast.gps.misurato && cast.gps.startPosition);

        return `
            <div class="session-header">
                <h3>📍 ${this.escapeHtml(session.luogo || 'N/A')}</h3>
                <div class="session-stats">
                    <span class="session-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        Durata: <strong>${typeof durata === 'number' ? durata + ' min' : durata}</strong>
                    </span>
                    <span class="session-stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        Lanci: <strong>${numLanci}</strong>
                    </span>
                    ${hasGPSCasts ? `
                    <button class="btn btn-primary btn-small" onclick="app.showSessionOnMap(${session.id}); app.showSessionsList();" style="margin-left: auto;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Mostra Mappa GPS
                    </button>
                    ` : ''}
                </div>
            </div>

            <div class="session-details">
                <div class="detail-section">
                    <h4>📊 Statistiche</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Media</span>
                            <span class="detail-value">${mediaDistanza.toFixed(1)}m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Massima</span>
                            <span class="detail-value">${maxDistanza.toFixed(1)}m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Minima</span>
                            <span class="detail-value">${minDistanza.toFixed(1)}m</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>🎣 Attrezzatura</h4>
                    <div class="detail-grid">
                        ${session.cannaModello ? `<div class="detail-item"><span class="detail-label">Canna</span><span class="detail-value">${this.escapeHtml(session.cannaModello)}</span></div>` : ''}
                        ${session.cannaLunghezza ? `<div class="detail-item"><span class="detail-label">Lunghezza</span><span class="detail-value">${session.cannaLunghezza}m</span></div>` : ''}
                        ${session.cannaGrammatura ? `<div class="detail-item"><span class="detail-label">Grammatura</span><span class="detail-value">${this.escapeHtml(session.cannaGrammatura)}</span></div>` : ''}
                        ${session.mulinello ? `<div class="detail-item"><span class="detail-label">Mulinello</span><span class="detail-value">${this.escapeHtml(session.mulinello)}</span></div>` : ''}
                        ${session.filo ? `<div class="detail-item"><span class="detail-label">Filo</span><span class="detail-value">${this.escapeHtml(session.filo)}</span></div>` : ''}
                        ${session.tecnica ? `<div class="detail-item"><span class="detail-label">Tecnica</span><span class="detail-value">${this.escapeHtml(session.tecnica)}</span></div>` : ''}
                        ${session.pesoPiombo ? `<div class="detail-item"><span class="detail-label">Piombo</span><span class="detail-value">${this.escapeHtml(session.pesoPiombo)}</span></div>` : ''}
                    </div>
                </div>

                ${session.vento || session.direzioneVento || session.temperatura || session.umidita ? `
                <div class="detail-section">
                    <h4>🌤️ Condizioni Iniziali</h4>
                    <div class="detail-grid">
                        ${session.vento ? `<div class="detail-item"><span class="detail-label">Vento</span><span class="detail-value">${this.escapeHtml(session.vento)}</span></div>` : ''}
                        ${session.direzioneVento ? `<div class="detail-item"><span class="detail-label">Direzione</span><span class="detail-value">${this.escapeHtml(session.direzioneVento)}</span></div>` : ''}
                        ${session.temperatura ? `<div class="detail-item"><span class="detail-label">Temperatura</span><span class="detail-value">${session.temperatura}°C</span></div>` : ''}
                        ${session.umidita ? `<div class="detail-item"><span class="detail-label">Umidità</span><span class="detail-value">${session.umidita}%</span></div>` : ''}
                    </div>
                </div>
                ` : ''}

                ${session.note ? `
                <div class="detail-section">
                    <h4>📝 Note Sessione</h4>
                    <p class="session-notes">${this.escapeHtml(session.note)}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    createCastDetailHTML(lancio, numero, sessionId) {
        const data = new Date(lancio.data);
        const formattedTime = data.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="cast-detail-item" data-cast-id="${lancio.id}">
                <div class="cast-detail-header">
                    <div class="cast-header-left">
                        <span class="cast-number">#${numero}</span>
                        <span class="cast-distance-large">${lancio.distanza.toFixed(1)}m</span>
                        <span class="cast-time">${formattedTime}</span>
                    </div>
                    <button class="btn-delete-cast" onclick="app.deleteCast(${sessionId}, ${lancio.id})" title="Elimina lancio">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
                ${lancio.vento || lancio.direzioneVento || lancio.temperatura || lancio.umidita || lancio.note ? `
                <div class="cast-detail-info">
                    ${lancio.vento ? `<span class="cast-info-badge">🌬️ ${this.escapeHtml(lancio.vento)}</span>` : ''}
                    ${lancio.direzioneVento ? `<span class="cast-info-badge">➜ ${this.escapeHtml(lancio.direzioneVento)}</span>` : ''}
                    ${lancio.temperatura ? `<span class="cast-info-badge">🌡️ ${lancio.temperatura}°C</span>` : ''}
                    ${lancio.umidita ? `<span class="cast-info-badge">💧 ${lancio.umidita}%</span>` : ''}
                    ${lancio.note ? `<div class="cast-note">${this.escapeHtml(lancio.note)}</div>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    // Profile Management
    saveProfile() {
        const formData = new FormData(document.getElementById('profileForm'));

        this.profile = {
            nome: formData.get('nome'),
            cognome: formData.get('cognome'),
            eta: parseInt(formData.get('eta')),
            sesso: formData.get('sesso'),
            altezza: parseInt(formData.get('altezza')),
            peso: parseFloat(formData.get('peso')),
            livello: formData.get('livello'),
            obiettivo: formData.get('obiettivo') ? parseFloat(formData.get('obiettivo')) : null,
            campoAllenamento: formData.get('campo-allenamento')
        };

        this.saveData();
        this.showToast('Profilo salvato con successo!', 'success');
    }

    loadProfile() {
        if (!this.profile) return;

        document.getElementById('nome').value = this.profile.nome || '';
        document.getElementById('cognome').value = this.profile.cognome || '';
        document.getElementById('eta').value = this.profile.eta || '';
        document.getElementById('sesso').value = this.profile.sesso || '';
        document.getElementById('altezza').value = this.profile.altezza || '';
        document.getElementById('peso').value = this.profile.peso || '';
        document.getElementById('livello').value = this.profile.livello || '';
        document.getElementById('obiettivo').value = this.profile.obiettivo || '';
        document.getElementById('campo-allenamento').value = this.profile.campoAllenamento || '';

        this.calculateBMI();
    }

    calculateBMI() {
        const peso = parseFloat(document.getElementById('peso').value);
        const altezza = parseFloat(document.getElementById('altezza').value);

        if (peso && altezza) {
            const bmi = peso / Math.pow(altezza / 100, 2);
            let category = '';

            if (bmi < 18.5) category = 'Sottopeso';
            else if (bmi < 25) category = 'Normale';
            else if (bmi < 30) category = 'Sovrappeso';
            else category = 'Obesità';

            document.getElementById('bmi').value = `${bmi.toFixed(1)} (${category})`;
        } else {
            document.getElementById('bmi').value = '';
        }
    }

    // Settings Management
    loadSettings() {
        const savedSettings = localStorage.getItem('longcast_settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }

        // Apply language setting
        const languageRadio = document.querySelector(`input[name="language"][value="${this.settings.language}"]`);
        if (languageRadio) {
            languageRadio.checked = true;
        }

        // Apply units settings - check if elements exist
        if (this.settings.units) {
            const unitDistance = document.getElementById('unitDistance');
            const unitWeight = document.getElementById('unitWeight');
            const unitTemp = document.getElementById('unitTemp');
            const unitWind = document.getElementById('unitWind');
            const unitTime = document.getElementById('unitTime');
            const unitDate = document.getElementById('unitDate');

            if (unitDistance) unitDistance.value = this.settings.units.distance;
            if (unitWeight) unitWeight.value = this.settings.units.weight;
            if (unitTemp) unitTemp.value = this.settings.units.temperature;
            if (unitWind) unitWind.value = this.settings.units.wind;
            if (unitTime) unitTime.value = this.settings.units.time;
            if (unitDate) unitDate.value = this.settings.units.date;
        }
    }

    // Translate a key
    t(key) {
        const lang = this.settings.language;
        return this.translations[lang]?.[key] || this.translations['it']?.[key] || key;
    }

    // Apply translations to all elements with data-i18n attribute
    applyTranslations() {
        // Translate text content with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Check if it's a placeholder, value, or text content
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
            const translation = this.t(key);
            element.placeholder = translation;
        });

        // Translate title attributes with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            element.title = translation;
        });
    }

    changeLanguage(lang) {
        this.settings.language = lang;
        localStorage.setItem('longcast_settings', JSON.stringify(this.settings));
        this.applyTranslations();
        this.showToast(`${this.t('settings.language')}: ${lang.toUpperCase()}`, 'success');
    }

    saveUnits() {
        const unitDistance = document.getElementById('unitDistance');
        const unitWeight = document.getElementById('unitWeight');
        const unitTemp = document.getElementById('unitTemp');
        const unitWind = document.getElementById('unitWind');
        const unitTime = document.getElementById('unitTime');
        const unitDate = document.getElementById('unitDate');

        if (!unitDistance || !unitWeight || !unitTemp || !unitWind || !unitTime || !unitDate) {
            this.showToast('Errore: elementi non trovati', 'error');
            return;
        }

        this.settings.units = {
            distance: unitDistance.value,
            weight: unitWeight.value,
            temperature: unitTemp.value,
            wind: unitWind.value,
            time: unitTime.value,
            date: unitDate.value
        };

        localStorage.setItem('longcast_settings', JSON.stringify(this.settings));
        this.showToast('Unità di misura salvate con successo!', 'success');
    }

    // Data Import/Export
    exportData() {
        const data = {
            sessions: this.sessions,
            profile: this.profile,
            suggestions: this.suggestions,
            exportDate: new Date().toISOString(),
            version: '2.0' // Session-based version
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `longcast-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Dati esportati con successo!', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (confirm('Importare i dati? Questo sovrascriverà i dati attuali.')) {
                    // Support both old (casts) and new (sessions) format
                    if (data.sessions) {
                        this.sessions = data.sessions;
                    } else if (data.casts) {
                        // Convert old format to new format
                        this.sessions = this.convertCastsToSessions(data.casts);
                    }

                    if (data.profile) this.profile = data.profile;

                    if (data.suggestions) {
                        this.suggestions = data.suggestions;
                    }

                    this.saveData();
                    this.saveSuggestions();
                    this.updateDashboard();
                    this.updateDatalistSuggestions();
                    this.loadProfile();

                    this.showToast('Dati importati con successo!', 'success');
                }
            } catch (error) {
                this.showToast('Errore durante l\'importazione dei dati', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    }

    convertCastsToSessions(casts) {
        // Group casts by date (same day = same session)
        const sessionMap = new Map();

        casts.forEach(cast => {
            const date = new Date(cast.data);
            const dateKey = date.toISOString().split('T')[0];

            if (!sessionMap.has(dateKey)) {
                sessionMap.set(dateKey, {
                    id: Date.now() + Math.random(),
                    dataInizio: cast.data,
                    dataFine: cast.data,
                    luogo: cast.luogo || 'Importato',
                    completata: true,
                    lanci: []
                });
            }

            const session = sessionMap.get(dateKey);
            session.lanci.push(cast);

            // Update session metadata from first cast
            if (session.lanci.length === 1) {
                session.tecnica = cast.tecnica;
                session.pesoPiombo = cast.pesoPiombo;
                session.cannaLunghezza = cast.cannaLunghezza;
                session.cannaGrammatura = cast.cannaGrammatura;
                session.mulinello = cast.mulinello;
                session.filo = cast.filo;
                session.vento = cast.vento;
                session.direzioneVento = cast.direzioneVento;
                session.temperatura = cast.temperatura;
                session.umidita = cast.umidita;
            }
        });

        // Calculate stats for each session
        const sessions = Array.from(sessionMap.values());
        sessions.forEach(session => {
            if (session.lanci.length > 0) {
                const distanze = session.lanci.map(l => l.distanza);
                session.distanzaMedia = distanze.reduce((a, b) => a + b, 0) / distanze.length;
                session.distanzaMassima = Math.max(...distanze);
                session.distanzaMinima = Math.min(...distanze);
            }
        });

        return sessions;
    }

    clearAllData() {
        if (confirm('Sei sicuro di voler eliminare TUTTI i dati? Questa azione è irreversibile!')) {
            if (confirm('Conferma ancora: eliminare tutti i dati?')) {
                this.sessions = [];
                this.profile = null;
                this.currentSession = null;
                this.suggestions = {
                    tecniche: [],
                    pesoPiombo: [],
                    vento: [],
                    direzioneVento: [],
                    cannaModello: [],
                    luoghi: [],
                    grammatura: [],
                    mulinello: [],
                    filo: [],
                    lunghezzaCanna: [],
                    temperatura: [],
                    umidita: [],
                    note: []
                };
                localStorage.clear();
                sessionStorage.clear();

                this.updateDashboard();
                this.showSessionNotStarted();
                this.updateDatalistSuggestions();
                document.getElementById('profileForm').reset();

                this.showToast('Tutti i dati sono stati eliminati', 'warning');
            }
        }
    }

    // Utilities
    setDefaultDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const datetime = now.toISOString().slice(0, 16);

        const sessionDataInput = document.getElementById('session-data');
        if (sessionDataInput) {
            sessionDataInput.value = datetime;
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // GPS TRACKING METHODS
    // ============================================

    async startGPSTracking() {
        if (!this.currentSession) {
            this.showToast('Devi prima avviare una sessione di allenamento', 'error');
            return;
        }

        // Check GPS availability
        if (!this.gpsTracker.isGPSAvailable()) {
            this.showToast('GPS non disponibile su questo dispositivo', 'error');
            return;
        }

        try {
            // Update UI
            document.getElementById('gpsStartBtn').style.display = 'none';
            document.getElementById('gpsStopBtn').style.display = 'block';

            this.showToast('Inizializzazione GPS...', 'success');

            // Setup GPS callbacks
            this.gpsTracker.onUpdate = (stats) => this.updateGPSUI(stats);
            this.gpsTracker.onTimerUpdate = (seconds) => this.updateGPSTimer(seconds);
            this.gpsTracker.onError = (error) => {
                this.showToast(error.message, 'error');
                this.resetGPSUI();
            };

            // Start GPS tracking
            await this.gpsTracker.start();

            // Show GPS status and tracking UI
            document.getElementById('gpsStatus').style.display = 'block';
            document.getElementById('gpsTracking').style.display = 'block';

            this.showToast('GPS attivo! Lancia e cammina fino al piombo', 'success');

        } catch (error) {
            console.error('GPS Start Error:', error);
            this.showToast(error.message || 'Errore nell\'avvio del GPS', 'error');
            this.resetGPSUI();
        }
    }

    stopGPSTracking() {
        if (!this.gpsTracker.isTracking) {
            return;
        }

        // Stop GPS and get final stats
        const stats = this.gpsTracker.stop();

        if (!stats) {
            this.showToast('Errore nel recupero dei dati GPS', 'error');
            this.resetGPSUI();
            return;
        }

        // Validate distance
        if (stats.distance < 10) {
            const confirm = window.confirm(
                'La distanza misurata è molto bassa (< 10m).\n' +
                'Vuoi cancellare questa misurazione?'
            );
            if (confirm) {
                this.resetGPSUI();
                this.showToast('Misurazione GPS cancellata', 'warning');
                return;
            }
        }

        if (stats.distance > 500) {
            const confirm = window.confirm(
                'La distanza misurata è molto alta (> 500m).\n' +
                'Questo potrebbe essere un errore del GPS.\n' +
                'Vuoi continuare comunque?'
            );
            if (!confirm) {
                this.resetGPSUI();
                this.showToast('Misurazione GPS cancellata', 'warning');
                return;
            }
        }

        // Store result temporarily
        this.gpsResult = stats;

        // Show confirmation modal
        this.showGPSConfirmModal(stats);
    }

    updateGPSUI(stats) {
        // Update status display
        const satellites = stats.points > 0 ? Math.min(12, Math.floor(stats.points / 3) + 4) : '--';
        document.getElementById('gpsSatellites').textContent = satellites;
        document.getElementById('gpsAccuracy').textContent = stats.accuracy > 0 ?
            `±${stats.accuracy.toFixed(1)} m` : '-- m';
        document.getElementById('gpsQuality').textContent = stats.quality;
        document.getElementById('gpsPoints').textContent = stats.points;

        // Update quality color
        const qualityElement = document.getElementById('gpsQuality');
        qualityElement.style.color = this.getQualityColor(stats.quality);

        // Update distance display (straight-line)
        document.getElementById('gpsDistanceValue').textContent = stats.distance.toFixed(1) + ' m';
    }

    updateGPSTimer(seconds) {
        const formatted = this.gpsTracker.formatDuration(seconds);
        document.getElementById('gpsTrackingTime').textContent = formatted;
    }

    getQualityColor(quality) {
        switch (quality) {
            case 'Ottima': return '#43e97b';
            case 'Buona': return '#38f9d7';
            case 'Media': return '#f5af19';
            case 'Bassa': return '#ed8936';
            case 'Scarsa': return '#f56565';
            default: return 'var(--text-secondary)';
        }
    }

    showGPSConfirmModal(stats) {
        const modal = document.getElementById('gpsConfirmModal');

        // Populate modal with stats
        document.getElementById('gpsResultDistance').textContent = stats.distance.toFixed(1) + ' m';
        document.getElementById('gpsResultAccuracy').textContent = `±${stats.accuracy.toFixed(1)} m`;
        document.getElementById('gpsResultPoints').textContent = stats.points;
        document.getElementById('gpsResultDuration').textContent = this.gpsTracker.formatDuration(stats.duration);
        document.getElementById('gpsResultQuality').textContent = stats.quality;
        document.getElementById('gpsResultQuality').style.color = this.getQualityColor(stats.quality);

        // Clear note field
        document.getElementById('gpsResultNote').value = '';

        // Show modal
        modal.style.display = 'flex';

        // Hide GPS UI
        this.resetGPSUI();
    }

    hideGPSConfirmModal() {
        const modal = document.getElementById('gpsConfirmModal');
        modal.style.display = 'none';
    }

    saveGPSCast() {
        if (!this.gpsResult || !this.currentSession) {
            this.showToast('Errore: dati GPS non disponibili', 'error');
            this.hideGPSConfirmModal();
            return;
        }

        const note = document.getElementById('gpsResultNote').value.trim();

        // Determine start position: use puntoPerno if available, otherwise use GPS start
        let startPosition, endPosition, bearing, distance;

        if (this.currentSession.puntoPerno) {
            // Use session pivot point as start position
            startPosition = {
                latitude: this.currentSession.puntoPerno.latitude,
                longitude: this.currentSession.puntoPerno.longitude
            };
            endPosition = {
                latitude: this.gpsResult.endPosition.latitude,
                longitude: this.gpsResult.endPosition.longitude
            };

            // Recalculate distance and bearing from pivot point to end position
            distance = this.gpsTracker.calculateDistance(startPosition, endPosition);
            bearing = this.gpsTracker.calculateBearing(startPosition, endPosition);
        } else {
            // Fallback to original GPS start position (for backward compatibility)
            startPosition = {
                latitude: this.gpsResult.startPosition.latitude,
                longitude: this.gpsResult.startPosition.longitude
            };
            endPosition = {
                latitude: this.gpsResult.endPosition.latitude,
                longitude: this.gpsResult.endPosition.longitude
            };
            distance = this.gpsResult.distance;
            bearing = this.gpsResult.bearing;
        }

        // Calculate final distance based on session type
        let distanzaFinale;
        let giri = null;

        if (this.currentSession.tipo === 'mare') {
            // Mare: calcola giri dal GPS
            const metriPerGiro = this.currentSession.metriPerGiro;
            if (metriPerGiro && metriPerGiro > 0) {
                giri = distance / metriPerGiro;
                distanzaFinale = distance;
            } else {
                this.showToast('Errore: metri per giro non configurati', 'error');
                return;
            }
        } else {
            // Campo: usa distanza GPS diretta
            distanzaFinale = distance;
        }

        // Get weather data
        const vento = document.getElementById('cast-vento').value;
        const direzioneVento = document.getElementById('cast-direzione-vento').value;
        const temperatura = document.getElementById('cast-temperatura').value;
        const umidita = document.getElementById('cast-umidita').value;

        // Update session weather
        this.currentSession.vento = vento;
        this.currentSession.direzioneVento = direzioneVento;
        this.currentSession.temperatura = temperatura;
        this.currentSession.umidita = umidita;

        // Calcola deviazione angolare rispetto alla direzione campo
        let angoloDiDeviazione = null;
        if (this.currentSession.direzioneCampo !== undefined && bearing !== undefined) {
            angoloDiDeviazione = this.calculateCastDeviation(bearing, this.currentSession.direzioneCampo);
        }

        // Create cast object with GPS metadata
        const cast = {
            distanza: distanzaFinale,
            giri: giri,
            orario: new Date().toISOString(),
            note: note,
            gps: {
                misurato: true,

                // Posizioni per mappa
                startPosition: startPosition,
                endPosition: endPosition,

                // Angolo del lancio
                bearing: bearing,

                // Angolo di deviazione rispetto alla direzione campo ideale
                angoloDiDeviazione: angoloDiDeviazione,

                // Statistiche GPS
                accuracy: this.gpsResult.accuracy,
                points: this.gpsResult.points,
                duration: this.gpsResult.duration,
                quality: this.gpsResult.quality
            }
        };

        // Add cast to session
        this.currentSession.lanci.push(cast);
        this.saveSession();

        // Update UI
        this.updateSessionUI();

        // Hide modal
        this.hideGPSConfirmModal();

        // Show success message (before clearing gpsResult)
        let toastMessage;
        if (this.currentSession.tipo === 'mare') {
            toastMessage = `📍 GPS: ${distanzaFinale.toFixed(1)}m (${giri.toFixed(0)} giri) - ${this.gpsResult.quality}`;
        } else {
            toastMessage = `📍 GPS: ${distanzaFinale.toFixed(1)}m - ${this.gpsResult.quality}`;
        }
        this.showToast(toastMessage, 'success');

        // Clear GPS result
        this.gpsResult = null;
    }

    cancelGPSCast() {
        if (confirm('Sei sicuro di voler cancellare questa misurazione GPS?')) {
            this.gpsResult = null;
            this.hideGPSConfirmModal();
            this.showToast('Misurazione GPS cancellata', 'warning');
        }
    }

    resetGPSUI() {
        // Hide tracking UI
        document.getElementById('gpsStatus').style.display = 'none';
        document.getElementById('gpsTracking').style.display = 'none';

        // Reset buttons
        document.getElementById('gpsStartBtn').style.display = 'block';
        document.getElementById('gpsStopBtn').style.display = 'none';

        // Reset displays
        document.getElementById('gpsDistanceValue').textContent = '0.0 m';
        document.getElementById('gpsTrackingTime').textContent = '00:00';
        document.getElementById('gpsSatellites').textContent = '--';
        document.getElementById('gpsAccuracy').textContent = '-- m';
        document.getElementById('gpsQuality').textContent = '--';
        document.getElementById('gpsPoints').textContent = '0';

        // Reset GPS tracker
        this.gpsTracker.reset();
    }

    // ============================================
    // MAP METHODS
    // ============================================

    initMap(containerId) {
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded');
            this.showToast('Errore nel caricamento della mappa', 'error');
            return null;
        }

        // Remove existing map if any
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Create map instance
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Map container ${containerId} not found`);
            return null;
        }

        // Initialize map with default center (Italy)
        this.map = L.map(containerId).setView([41.9028, 12.4964], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 22, // Increased for detailed zoom up to ~10 meters
            minZoom: 3
        }).addTo(this.map);

        // Add scale control
        L.control.scale({ imperial: false, metric: true }).addTo(this.map);

        return this.map;
    }

    clearMapMarkers() {
        // Remove all markers from map
        this.mapMarkers.forEach(marker => {
            if (this.map) {
                this.map.removeLayer(marker);
            }
        });
        this.mapMarkers = [];
    }

    showSessionOnMap(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            console.error('Session not found:', sessionId);
            return;
        }

        // Initialize map if not already done
        if (!this.map) {
            this.initMap('storicoMap');
        }

        // Clear previous markers
        this.clearMapMarkers();

        // Filter GPS casts
        const gpsCasts = session.lanci.filter(cast => cast.gps && cast.gps.misurato && cast.gps.startPosition);

        console.log('GPS Casts found:', gpsCasts.length, 'out of', session.lanci.length, 'total casts');
        console.log('Sample GPS cast:', gpsCasts[0]);

        if (gpsCasts.length === 0) {
            this.showToast('Nessun lancio GPS in questa sessione', 'warning');
            console.log('All casts:', session.lanci.map(c => ({ id: c.id, hasGps: !!c.gps, misurato: c.gps?.misurato, hasStart: !!c.gps?.startPosition })));
            return;
        }

        // Draw pivot point marker if session has it
        if (session.puntoPerno) {
            const pivotIcon = L.divIcon({
                className: 'custom-marker-pivot',
                html: '<div style="background: #00FF00; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 15px rgba(0,255,0,0.6);"></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const pivotMarker = L.marker(
                [session.puntoPerno.latitude, session.puntoPerno.longitude],
                { icon: pivotIcon }
            ).bindPopup('<strong>📍 Punto di Lancio (Perno Campo)</strong><br>Tutti i lanci partono da qui');

            pivotMarker.addTo(this.map);
            this.mapMarkers.push(pivotMarker);
        }

        // Disegna il campo da longcasting se la sessione ha direzione campo
        if (session.direzioneCampo !== undefined && gpsCasts.length > 0) {
            let centerLat, centerLng;

            // Use pivot point if available, otherwise use first cast start position
            if (session.puntoPerno) {
                centerLat = session.puntoPerno.latitude;
                centerLng = session.puntoPerno.longitude;
            } else {
                const firstCast = gpsCasts[0];
                centerLat = firstCast.gps.startPosition.latitude;
                centerLng = firstCast.gps.startPosition.longitude;
            }

            this.drawCastingField(centerLat, centerLng, session.direzioneCampo);
        }

        // Add markers for each GPS cast
        gpsCasts.forEach((cast, index) => {
            this.addCastMarkersToMap(cast, index + 1, session);
        });

        // Fit map to show all markers
        this.fitMapToMarkers();

        // Update session reference
        this.currentMapSession = sessionId;

        // Show map container in fullscreen mode
        const mapContainer = document.getElementById('storicoMapContainer');
        mapContainer.style.display = 'block';
        mapContainer.classList.add('fullscreen');
        document.getElementById('historySessionsList').style.display = 'none';

        // Hide body overflow to prevent scrolling
        document.body.style.overflow = 'hidden';

        // Force Leaflet to recalculate map size after display change
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);
    }

    closeMap() {
        // Hide map container and remove fullscreen mode
        const mapContainer = document.getElementById('storicoMapContainer');
        mapContainer.style.display = 'none';
        mapContainer.classList.remove('fullscreen');
        document.getElementById('historySessionsList').style.display = 'block';

        // Hide field direction panel if visible
        document.getElementById('fieldDirectionPanel').style.display = 'none';

        // Restore map title
        document.querySelector('.map-header h3').textContent = '🗺️ Mappa Lanci GPS';

        // Restore body overflow
        document.body.style.overflow = '';

        // Clear markers
        if (this.map) {
            this.clearMapMarkers();
        }

        this.currentMapSession = null;
    }

    addCastMarkersToMap(cast, castNumber, session) {
        if (!cast.gps || !cast.gps.startPosition || !cast.gps.endPosition) return;

        const { startPosition, endPosition, bearing } = cast.gps;

        // Only show individual start markers if session doesn't have pivot point
        // (with pivot point, all casts start from the same point shown as green pivot marker)
        if (!session.puntoPerno) {
            // Create custom icon for start marker (green)
            const startIcon = L.divIcon({
                className: 'custom-marker-start',
                html: '<div class="marker-pin marker-start">🟢</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            // Add start marker
            const startMarker = L.marker(
                [startPosition.latitude, startPosition.longitude],
                { icon: startIcon }
            ).bindPopup(this.createStartPopupHTML(cast, castNumber));

            startMarker.addTo(this.map);
            this.mapMarkers.push(startMarker);
        }

        // Create custom icon for end marker (red)
        const endIcon = L.divIcon({
            className: 'custom-marker-end',
            html: '<div class="marker-pin marker-end">🔴</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        // Add end marker
        const endMarker = L.marker(
            [endPosition.latitude, endPosition.longitude],
            { icon: endIcon }
        ).bindPopup(this.createEndPopupHTML(cast, castNumber));

        // Add line between start and end
        const castLine = L.polyline([
            [startPosition.latitude, startPosition.longitude],
            [endPosition.latitude, endPosition.longitude]
        ], {
            color: '#00D9FF',
            weight: 3,
            opacity: 0.8
        });

        // Add distance label at midpoint
        const midLat = (startPosition.latitude + endPosition.latitude) / 2;
        const midLon = (startPosition.longitude + endPosition.longitude) / 2;

        const distanceLabel = L.marker([midLat, midLon], {
            icon: L.divIcon({
                className: 'distance-label',
                html: `<div class="distance-label-content">${cast.distanza.toFixed(1)}m</div>`,
                iconSize: [80, 30]
            })
        });

        // Add all to map and store references
        endMarker.addTo(this.map);
        castLine.addTo(this.map);
        distanceLabel.addTo(this.map);

        this.mapMarkers.push(endMarker, castLine, distanceLabel);

        // Add reference line if session has direzioneRiferimento
        if (session.direzioneRiferimento && session.direzioneRiferimento.impostata) {
            this.addReferenceLineToMap(session.direzioneRiferimento, cast);
        }
    }

    addReferenceLineToMap(direzioneRif, cast) {
        // Draw ideal reference line (yellow dashed)
        const refLine = L.polyline([
            [direzioneRif.puntoPartenza.latitude, direzioneRif.puntoPartenza.longitude],
            [direzioneRif.puntoArrivo.latitude, direzioneRif.puntoArrivo.longitude]
        ], {
            color: '#FFD700',
            weight: 2,
            opacity: 0.7,
            dashArray: '10, 10'
        });

        refLine.addTo(this.map);
        this.mapMarkers.push(refLine);
    }

    // Disegna il campo da longcasting sulla mappa
    drawCastingField(centerLat, centerLng, bearing) {
        if (!this.map) return;

        const fieldDistances = [150, 175, 200, 225, 250]; // Distanze in metri
        const coneAngle = 15; // Gradi di apertura laterale

        // 1. LINEA ROSSA - Traiettoria Ideale (250m)
        const idealEndPoint = this.calculateDestinationPoint(centerLat, centerLng, bearing, 250);
        const idealLine = L.polyline([
            [centerLat, centerLng],
            [idealEndPoint.lat, idealEndPoint.lng]
        ], {
            color: '#FF0000',
            weight: 3,
            opacity: 1.0
        });
        idealLine.addTo(this.map);
        this.mapMarkers.push(idealLine);

        // 2. LINEE MAGENTA - Cono del campo (±15°)
        const leftBearing = (bearing - coneAngle + 360) % 360;
        const rightBearing = (bearing + coneAngle) % 360;

        const leftEndPoint = this.calculateDestinationPoint(centerLat, centerLng, leftBearing, 250);
        const rightEndPoint = this.calculateDestinationPoint(centerLat, centerLng, rightBearing, 250);

        const leftConeLine = L.polyline([
            [centerLat, centerLng],
            [leftEndPoint.lat, leftEndPoint.lng]
        ], {
            color: '#FF00FF',
            weight: 2,
            opacity: 0.8
        });

        const rightConeLine = L.polyline([
            [centerLat, centerLng],
            [rightEndPoint.lat, rightEndPoint.lng]
        ], {
            color: '#FF00FF',
            weight: 2,
            opacity: 0.8
        });

        leftConeLine.addTo(this.map);
        rightConeLine.addTo(this.map);
        this.mapMarkers.push(leftConeLine, rightConeLine);

        // 3. ARCHI NERI - Linee di distanza (150, 175, 200, 225, 250m)
        fieldDistances.forEach(distance => {
            const arcPoints = [];
            // Genera punti per l'arco da -15° a +15°
            for (let angle = -coneAngle; angle <= coneAngle; angle += 1) {
                const currentBearing = (bearing + angle + 360) % 360;
                const point = this.calculateDestinationPoint(centerLat, centerLng, currentBearing, distance);
                arcPoints.push([point.lat, point.lng]);
            }

            const arc = L.polyline(arcPoints, {
                color: '#000000',
                weight: 1.5,
                opacity: 0.6
            });

            arc.addTo(this.map);
            this.mapMarkers.push(arc);
        });
    }

    // Calcola punto di destinazione dato lat, lng, bearing e distanza
    calculateDestinationPoint(lat, lng, bearing, distance) {
        const R = 6371000; // Raggio Terra in metri
        const bearingRad = bearing * Math.PI / 180;
        const latRad = lat * Math.PI / 180;
        const lngRad = lng * Math.PI / 180;

        const newLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(distance / R) +
            Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
        );

        const newLngRad = lngRad + Math.atan2(
            Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
            Math.cos(distance / R) - Math.sin(latRad) * Math.sin(newLatRad)
        );

        return {
            lat: newLatRad * 180 / Math.PI,
            lng: newLngRad * 180 / Math.PI
        };
    }

    // Calcola l'angolo di deviazione tra il bearing del lancio e il bearing ideale
    calculateCastDeviation(castBearing, idealBearing) {
        let deviation = castBearing - idealBearing;

        // Normalizza l'angolo tra -180 e +180
        while (deviation > 180) deviation -= 360;
        while (deviation < -180) deviation += 360;

        return deviation;
    }

    createStartPopupHTML(cast, castNumber) {
        const orario = new Date(cast.data).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="map-popup">
                <div class="map-popup-title">🟢 Punto Lancio #${castNumber}</div>
                <div class="map-popup-info">
                    <div class="map-popup-row">
                        <span class="map-popup-label">Orario</span>
                        <span class="map-popup-value">${orario}</span>
                    </div>
                    <div class="map-popup-row">
                        <span class="map-popup-label">Distanza</span>
                        <span class="map-popup-value highlight">${cast.distanza.toFixed(1)}m</span>
                    </div>
                    <div class="map-popup-row">
                        <span class="map-popup-label">Precisione GPS</span>
                        <span class="map-popup-value">±${cast.gps.accuracy.toFixed(1)}m</span>
                    </div>
                    <div class="map-popup-row">
                        <span class="map-popup-label">Qualità</span>
                        <span class="map-popup-value">${cast.gps.quality}</span>
                    </div>
                    ${cast.gps.angoloDiDeviazione !== null && cast.gps.angoloDiDeviazione !== undefined ? `
                    <div class="map-popup-row">
                        <span class="map-popup-label">Deviazione</span>
                        <span class="map-popup-value" style="color: ${Math.abs(cast.gps.angoloDiDeviazione) <= 5 ? '#00FF00' : Math.abs(cast.gps.angoloDiDeviazione) <= 10 ? '#FFD700' : '#FF6B6B'}">
                            ${cast.gps.angoloDiDeviazione > 0 ? '+' : ''}${cast.gps.angoloDiDeviazione.toFixed(1)}° ${cast.gps.angoloDiDeviazione > 0 ? '(destra)' : cast.gps.angoloDiDeviazione < 0 ? '(sinistra)' : '(perfetto)'}
                        </span>
                    </div>
                    ` : ''}
                    ${cast.note ? `
                    <div class="map-popup-row">
                        <span class="map-popup-label">Note</span>
                        <span class="map-popup-value">${this.escapeHtml(cast.note)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createEndPopupHTML(cast, castNumber) {
        return `
            <div class="map-popup">
                <div class="map-popup-title">🔴 Caduta Piombo #${castNumber}</div>
                <div class="map-popup-info">
                    <div class="map-popup-row">
                        <span class="map-popup-label">Distanza</span>
                        <span class="map-popup-value highlight">${cast.distanza.toFixed(1)}m</span>
                    </div>
                    <div class="map-popup-row">
                        <span class="map-popup-label">Angolo</span>
                        <span class="map-popup-value">${cast.gps.bearing ? cast.gps.bearing.toFixed(1) + '°' : 'N/A'}</span>
                    </div>
                    ${cast.gps.angoloDiDeviazione !== null && cast.gps.angoloDiDeviazione !== undefined ? `
                    <div class="map-popup-row">
                        <span class="map-popup-label">Deviazione</span>
                        <span class="map-popup-value" style="color: ${Math.abs(cast.gps.angoloDiDeviazione) <= 5 ? '#00FF00' : Math.abs(cast.gps.angoloDiDeviazione) <= 10 ? '#FFD700' : '#FF6B6B'}">
                            ${cast.gps.angoloDiDeviazione > 0 ? '+' : ''}${cast.gps.angoloDiDeviazione.toFixed(1)}° ${cast.gps.angoloDiDeviazione > 0 ? '(destra)' : cast.gps.angoloDiDeviazione < 0 ? '(sinistra)' : '(perfetto)'}
                        </span>
                    </div>
                    ` : ''}
                    ${cast.tecnica ? `
                    <div class="map-popup-row">
                        <span class="map-popup-label">Tecnica</span>
                        <span class="map-popup-value">${this.escapeHtml(cast.tecnica)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    fitMapToMarkers() {
        if (!this.map || this.mapMarkers.length === 0) return;

        // Get bounds of all markers
        const latLngs = [];
        this.mapMarkers.forEach(marker => {
            if (marker instanceof L.Marker) {
                latLngs.push(marker.getLatLng());
            } else if (marker instanceof L.Polyline) {
                latLngs.push(...marker.getLatLngs());
            }
        });

        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    calculateDeviationAnalysis(cast, direzioneRiferimento) {
        if (!cast.gps || !cast.gps.bearing || !direzioneRiferimento || !direzioneRiferimento.impostata) {
            return null;
        }

        const castBearing = cast.gps.bearing;
        const refBearing = direzioneRiferimento.angoloDirezione;

        // Calculate angular difference (-180 to +180)
        let diff = castBearing - refBearing;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        // Determine direction
        const direzione = diff > 0 ? 'destra' : diff < 0 ? 'sinistra' : 'perfetto';

        // Calculate cross-track distance (lateral deviation)
        const distanza = cast.distanza;
        const diffRad = Math.abs(diff) * Math.PI / 180;
        const distanzaLaterale = distanza * Math.sin(diffRad);

        return {
            angoloEffettivo: castBearing,
            angoloRiferimento: refBearing,
            differenzaAngolare: diff,
            direzioneDeviazione: direzione,
            distanzaLaterale: distanzaLaterale
        };
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new LongCastApp();
});
