// ============================================
// GPS TRACKER CLASS (Professional Module)
// ============================================

/**
 * Classe per il tracking GPS professionale
 * Supporta calcolo distanze Haversine, bearing, e filtraggio punti
 */
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

    /**
     * Acquisisce una posizione "stabile" mediando più letture GPS nel tempo,
     * stando fermi. Base per il punto perno (GPS-1) e il punto d'arrivo (GPS-2).
     * Termina al raggiungimento dell'incertezza target (dopo minDuration) o a
     * maxDuration. Con fallback: se non arriva alcun fix valido, fa reject.
     *
     * @param {object} [options]
     * @param {number} [options.minDuration=6000]  ms minimi di raccolta
     * @param {number} [options.maxDuration=15000] ms massimi di raccolta
     * @param {number} [options.targetUncertainty=3] m: termina prima se l'incertezza scende sotto
     * @param {number} [options.minSamples=5]       campioni minimi per terminare prima
     * @param {Function} [options.onProgress]       callback({elapsed, samples, accuracy, uncertainty, progress})
     * @returns {Promise<{latitude,longitude,accuracy,uncertainty,samples,quality}>}
     */
    acquireStablePosition(options = {}) {
        const cfg = {
            minDuration: options.minDuration ?? 6000,
            maxDuration: options.maxDuration ?? 15000,
            targetUncertainty: options.targetUncertainty ?? 3,
            minSamples: options.minSamples ?? 5,
            minAccuracy: options.minAccuracy ?? this.config.minAccuracy
        };
        const onProgress = options.onProgress;

        return new Promise((resolve, reject) => {
            if (!this.isGPSAvailable()) {
                reject(new Error('GPS non disponibile su questo dispositivo'));
                return;
            }

            const points = [];
            const startedAt = Date.now();
            let watchId = null;
            let ticker = null;
            let settled = false;

            const cleanup = () => {
                if (watchId !== null) {
                    navigator.geolocation.clearWatch(watchId);
                    watchId = null;
                }
                if (ticker !== null) {
                    clearInterval(ticker);
                    ticker = null;
                }
            };

            const finish = () => {
                if (settled) return;
                settled = true;
                cleanup();
                if (points.length === 0) {
                    reject(new Error('Nessuna posizione GPS valida acquisita'));
                    return;
                }
                const center = this.getAveragePosition(points);
                const uncertainty = this.getPositionUncertainty(points, center);
                resolve({
                    latitude: center.latitude,
                    longitude: center.longitude,
                    accuracy: center.accuracy,
                    uncertainty: uncertainty,
                    samples: points.length,
                    quality: this.getQualityForAccuracy(center.accuracy, points.length)
                });
            };

            const evaluate = () => {
                if (settled) return;
                const elapsed = Date.now() - startedAt;
                let uncertainty = Infinity;
                let accuracy = null;
                if (points.length > 0) {
                    const center = this.getAveragePosition(points);
                    uncertainty = this.getPositionUncertainty(points, center);
                    accuracy = center.accuracy;
                }
                if (onProgress) {
                    onProgress({
                        elapsed,
                        samples: points.length,
                        accuracy,
                        uncertainty: isFinite(uncertainty) ? uncertainty : null,
                        progress: Math.min(1, elapsed / cfg.maxDuration)
                    });
                }
                // Terminazione: tempo massimo, oppure convergenza dopo il minimo.
                if (elapsed >= cfg.maxDuration) {
                    finish();
                } else if (elapsed >= cfg.minDuration &&
                           points.length >= cfg.minSamples &&
                           uncertainty <= cfg.targetUncertainty) {
                    finish();
                }
            };

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const p = this.createGPSPoint(position);
                    // Scarta letture troppo imprecise
                    if (typeof p.accuracy === 'number' && p.accuracy > cfg.minAccuracy) {
                        return;
                    }
                    points.push(p);
                    evaluate();
                },
                (error) => {
                    // Errore: fallisci solo se non abbiamo ancora nulla,
                    // altrimenti ignora e continua fino a maxDuration.
                    if (points.length === 0 && !settled) {
                        settled = true;
                        cleanup();
                        reject(this.handleGPSError(error));
                    }
                },
                { enableHighAccuracy: true, timeout: cfg.maxDuration, maximumAge: 0 }
            );

            // Tick periodico: aggiorna UI e garantisce il rispetto di maxDuration
            // anche se non arrivano nuovi fix.
            ticker = setInterval(evaluate, 500);
        });
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

    // Calcola la posizione media da più punti GPS.
    // Media PESATA per accuratezza (GPS-4): i punti più precisi (accuracy
    // minore) pesano di più, con peso = 1/accuracy² (inverso della varianza).
    getAveragePosition(points) {
        if (!points || points.length === 0) return null;

        let sumW = 0, sumLat = 0, sumLng = 0, sumAcc = 0;
        for (const p of points) {
            const acc = (typeof p.accuracy === 'number' && p.accuracy > 0) ? p.accuracy : 1;
            const w = 1 / (acc * acc);
            sumW += w;
            sumLat += p.latitude * w;
            sumLng += p.longitude * w;
            sumAcc += (typeof p.accuracy === 'number' ? p.accuracy : 0);
        }
        if (sumW === 0) sumW = points.length; // fallback: media semplice

        return {
            latitude: sumLat / sumW,
            longitude: sumLng / sumW,
            accuracy: sumAcc / points.length // accuracy media (informativa)
        };
    }

    // Stima dell'incertezza (1σ, in metri) di un cluster di punti mediati (GPS-3).
    // Scelta CONSERVATIVA/onesta: gli errori GPS sono fortemente correlati nel
    // breve periodo (multipath, atmosfera, geometria satelliti), quindi NON si
    // divide per sqrt(N) — mediare non riduce l'errore come se fosse casuale.
    // Si usa il massimo tra l'accuratezza media dichiarata dal GPS e la
    // dispersione spaziale empirica dei punti rispetto al centro.
    getPositionUncertainty(points, center = null) {
        if (!points || points.length === 0) return Infinity;

        const c = center || this.getAveragePosition(points);
        const meanAccuracy = points.reduce((s, p) => s + (p.accuracy || 0), 0) / points.length;

        let sumSq = 0;
        for (const p of points) {
            const d = this.calculateDistance(c, p);
            sumSq += d * d;
        }
        const spatialStd = Math.sqrt(sumSq / points.length);

        return Math.max(meanAccuracy, spatialStd);
    }

    // Rating qualità per una data accuratezza/numero di punti (riusabile).
    getQualityForAccuracy(accuracy, points) {
        if (points < 5) return 'Scarsa';
        if (accuracy > 20) return 'Bassa';
        if (accuracy > 10) return 'Media';
        if (accuracy > 5) return 'Buona';
        return 'Ottima';
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
            distance: this.getStraightLineDistance(),
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

        // Incertezza della distanza (GPS-3): propagazione degli errori dei
        // due estremi. σ_d = sqrt(σ_start² + σ_end²).
        const startUncertainty = this.getPositionUncertainty(startPoints, startAvg);
        const endUncertainty = this.getPositionUncertainty(endPoints, endAvg);
        const distanceUncertainty = Math.sqrt(
            startUncertainty * startUncertainty + endUncertainty * endUncertainty
        );

        return {
            distance: straightLineDistance,
            distanceUncertainty: distanceUncertainty,
            startPosition: startAvg,
            endPosition: endAvg,
            startUncertainty: startUncertainty,
            endUncertainty: endUncertainty,
            bearing: bearing,
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
        return this.getQualityForAccuracy(this.averageAccuracy, this.pointsCollected);
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

// Export for module usage (when using ES modules)
// For now, also expose globally for compatibility
if (typeof window !== 'undefined') {
    window.GPSTracker = GPSTracker;
}

// Export CommonJS per i test in node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPSTracker;
}
