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

        return {
            distance: straightLineDistance,
            startPosition: startAvg,
            endPosition: endAvg,
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

// Export for module usage (when using ES modules)
// For now, also expose globally for compatibility
if (typeof window !== 'undefined') {
    window.GPSTracker = GPSTracker;
}
