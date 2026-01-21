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
            btn.addEventListener('click', (e) => this.navigate(e.target.dataset.section));
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

        // Session Detail
        document.getElementById('backToSessions').addEventListener('click', () => this.showSessionsList());

        // Data Management
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());

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

        // Update sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Refresh data based on section
        if (section === 'dashboard') {
            this.updateDashboard();
        } else if (section === 'storico') {
            this.filterHistory();
        } else if (section === 'profilo') {
            this.loadProfile();
        } else if (section === 'nuovo-lancio') {
            this.checkActiveSession();
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
        this.showSessionActive();
        this.showToast('Sessione di allenamento iniziata!', 'success');

        // Reset form
        document.getElementById('startSessionForm').reset();
        this.setDefaultDateTime();
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

    // Delete Session (from history)
    deleteSession(sessionId) {
        if (confirm('Sei sicuro di voler eliminare questa sessione? Verranno eliminati tutti i lanci associati.')) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.saveData();
            this.showToast('Sessione eliminata', 'success');
            this.updateDashboard();
            this.filterHistory();
        }
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

        this.displaySessionHistory(filtered);
    }

    displaySessionHistory(sessions) {
        const container = document.getElementById('historySessionsList');

        if (sessions.length === 0) {
            container.innerHTML = '<p class="no-data-text">Nessuna sessione trovata</p>';
            return;
        }

        container.innerHTML = sessions.map(session => this.createSessionCardHTML(session)).join('');
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

        // Populate session info
        const infoContainer = document.getElementById('sessionDetailInfo');
        infoContainer.innerHTML = this.createSessionInfoHTML(session);

        // Populate casts list
        const castsContainer = document.getElementById('sessionDetailCastsList');
        if (session.lanci && session.lanci.length > 0) {
            castsContainer.innerHTML = session.lanci.map((lancio, index) =>
                this.createCastDetailHTML(lancio, index + 1)
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

    createCastDetailHTML(lancio, numero) {
        const data = new Date(lancio.data);
        const formattedTime = data.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="cast-detail-item">
                <div class="cast-detail-header">
                    <span class="cast-number">#${numero}</span>
                    <span class="cast-distance-large">${lancio.distanza.toFixed(1)}m</span>
                    <span class="cast-time">${formattedTime}</span>
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

        // Calculate final distance based on session type
        let distanzaFinale;
        let giri = null;

        if (this.currentSession.tipo === 'mare') {
            // Mare: calcola giri dal GPS
            const metriPerGiro = this.currentSession.metriPerGiro;
            if (metriPerGiro && metriPerGiro > 0) {
                giri = this.gpsResult.distance / metriPerGiro;
                distanzaFinale = this.gpsResult.distance;
            } else {
                this.showToast('Errore: metri per giro non configurati', 'error');
                return;
            }
        } else {
            // Campo: usa distanza GPS diretta
            distanzaFinale = this.gpsResult.distance;
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

        // Create cast object with GPS metadata
        const cast = {
            distanza: distanzaFinale,
            giri: giri,
            orario: new Date().toISOString(),
            note: note,
            gps: {
                misurato: true,

                // Posizioni per mappa
                startPosition: {
                    latitude: this.gpsResult.startPosition.latitude,
                    longitude: this.gpsResult.startPosition.longitude
                },
                endPosition: {
                    latitude: this.gpsResult.endPosition.latitude,
                    longitude: this.gpsResult.endPosition.longitude
                },

                // Angolo del lancio
                bearing: this.gpsResult.bearing,

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

        // Clear GPS result
        this.gpsResult = null;

        // Show success message
        let toastMessage;
        if (this.currentSession.tipo === 'mare') {
            toastMessage = `📍 GPS: ${distanzaFinale.toFixed(1)}m (${giri.toFixed(0)} giri) - ${this.gpsResult.quality}`;
        } else {
            toastMessage = `📍 GPS: ${distanzaFinale.toFixed(1)}m - ${this.gpsResult.quality}`;
        }
        this.showToast(toastMessage, 'success');
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
            maxZoom: 19,
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

        if (gpsCasts.length === 0) {
            this.showToast('Nessun lancio GPS in questa sessione', 'warning');
            return;
        }

        // Add markers for each GPS cast
        gpsCasts.forEach((cast, index) => {
            this.addCastMarkersToMap(cast, index + 1, session);
        });

        // Fit map to show all markers
        this.fitMapToMarkers();

        // Update session reference
        this.currentMapSession = sessionId;

        // Show map container
        document.getElementById('storicoMapContainer').style.display = 'block';
        document.getElementById('historySessionsList').style.display = 'none';

        // Force Leaflet to recalculate map size after display change
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);
    }

    closeMap() {
        // Hide map container
        document.getElementById('storicoMapContainer').style.display = 'none';
        document.getElementById('historySessionsList').style.display = 'block';

        // Clear markers
        if (this.map) {
            this.clearMapMarkers();
        }

        this.currentMapSession = null;
    }

    addCastMarkersToMap(cast, castNumber, session) {
        if (!cast.gps || !cast.gps.startPosition || !cast.gps.endPosition) return;

        const { startPosition, endPosition, bearing } = cast.gps;

        // Create custom icon for start marker (green)
        const startIcon = L.divIcon({
            className: 'custom-marker-start',
            html: '<div class="marker-pin marker-start">🟢</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        // Create custom icon for end marker (red)
        const endIcon = L.divIcon({
            className: 'custom-marker-end',
            html: '<div class="marker-pin marker-end">🔴</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        // Add start marker
        const startMarker = L.marker(
            [startPosition.latitude, startPosition.longitude],
            { icon: startIcon }
        ).bindPopup(this.createStartPopupHTML(cast, castNumber));

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
        startMarker.addTo(this.map);
        endMarker.addTo(this.map);
        castLine.addTo(this.map);
        distanceLabel.addTo(this.map);

        this.mapMarkers.push(startMarker, endMarker, castLine, distanceLabel);

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
