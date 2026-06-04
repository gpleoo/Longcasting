/**
 * Test per js/GPSTracker.js — matematica delle misurazioni GPS.
 * Eseguibile sia in browser (run-tests.html) sia in node.
 */

// In browser la classe è già globale (window.GPSTracker); evitiamo di
// ridichiarare l'identificatore `GPSTracker` (collisione con la classe).
const GPSTrackerClass = (typeof window !== 'undefined' && window.GPSTracker)
    ? window.GPSTracker
    : (typeof require !== 'undefined' ? require('../js/GPSTracker.js') : undefined);

// Tolleranza per confronti tra numeri in virgola mobile
function approx(actual, expected, tol, msg) {
    const ok = Math.abs(actual - expected) <= tol;
    console.assert(ok, `${msg} (atteso ${expected} ±${tol}, ottenuto ${actual})`);
    return ok;
}

// Distanza Haversine su valori noti
function testCalculateDistance() {
    console.log('Testing GPSTracker.calculateDistance...');
    const gps = new GPSTrackerClass();

    // Stesso punto → 0
    approx(
        gps.calculateDistance({ latitude: 41.9, longitude: 12.5 }, { latitude: 41.9, longitude: 12.5 }),
        0, 0.001, 'stesso punto = 0 m'
    );

    // 1° di latitudine ≈ 111195 m (R=6371000)
    approx(
        gps.calculateDistance({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 }),
        111195, 50, '1° di latitudine ≈ 111195 m'
    );

    // Lancio realistico ~200 m verso nord
    const metersNorth = 200;
    const dLat = metersNorth / 111195; // gradi
    approx(
        gps.calculateDistance({ latitude: 41.9, longitude: 12.5 }, { latitude: 41.9 + dLat, longitude: 12.5 }),
        200, 1, 'lancio ~200 m verso nord'
    );

    console.log('✅ calculateDistance tests passed');
}

// Bearing sulle direzioni cardinali
function testCalculateBearing() {
    console.log('Testing GPSTracker.calculateBearing...');
    const gps = new GPSTrackerClass();
    const origin = { latitude: 0, longitude: 0 };

    const north = gps.calculateBearing(origin, { latitude: 1, longitude: 0 });
    console.assert(north < 1 || north > 359, `nord ≈ 0° (ottenuto ${north})`);

    approx(gps.calculateBearing(origin, { latitude: 0, longitude: 1 }), 90, 1, 'est ≈ 90°');
    approx(gps.calculateBearing(origin, { latitude: -1, longitude: 0 }), 180, 1, 'sud ≈ 180°');
    approx(gps.calculateBearing(origin, { latitude: 0, longitude: -1 }), 270, 1, 'ovest ≈ 270°');

    console.log('✅ calculateBearing tests passed');
}

// Media pesata per accuratezza (GPS-4)
function testWeightedAverage() {
    console.log('Testing GPSTracker.getAveragePosition (pesata)...');
    const gps = new GPSTrackerClass();

    // Accuratezze uguali → media aritmetica
    const equal = gps.getAveragePosition([
        { latitude: 0, longitude: 0, accuracy: 1 },
        { latitude: 10, longitude: 0, accuracy: 1 }
    ]);
    approx(equal.latitude, 5, 1e-9, 'accuratezze uguali → media semplice (lat 5)');

    // Accuratezze diverse → spostata verso il punto più preciso (accuracy minore)
    const weighted = gps.getAveragePosition([
        { latitude: 0, longitude: 0, accuracy: 1 },   // molto preciso
        { latitude: 10, longitude: 0, accuracy: 10 }  // impreciso
    ]);
    console.assert(weighted.latitude < 0.2,
        `media pesata vicina al punto preciso (ottenuto ${weighted.latitude})`);

    // Robustezza: accuratezza mancante/zero non genera NaN
    const safe = gps.getAveragePosition([
        { latitude: 4, longitude: 0 },
        { latitude: 6, longitude: 0, accuracy: 0 }
    ]);
    console.assert(!isNaN(safe.latitude), 'nessun NaN con accuracy mancante/zero');

    console.log('✅ getAveragePosition tests passed');
}

// Incertezza di posizione (GPS-3)
function testPositionUncertainty() {
    console.log('Testing GPSTracker.getPositionUncertainty...');
    const gps = new GPSTrackerClass();

    // Punti coincidenti → incertezza = accuratezza dichiarata (dispersione 0)
    approx(
        gps.getPositionUncertainty([
            { latitude: 41.9, longitude: 12.5, accuracy: 5 },
            { latitude: 41.9, longitude: 12.5, accuracy: 5 }
        ]),
        5, 0.001, 'punti coincidenti → incertezza = accuracy (5 m)'
    );

    // Punti sparsi (~111 m) → domina la dispersione spaziale
    const spread = gps.getPositionUncertainty([
        { latitude: 0, longitude: 0, accuracy: 1 },
        { latitude: 0.001, longitude: 0, accuracy: 1 }
    ]);
    console.assert(spread > 50, `dispersione domina su punti sparsi (ottenuto ${spread})`);

    // Lista vuota → Infinity
    console.assert(!isFinite(gps.getPositionUncertainty([])), 'lista vuota → Infinity');

    console.log('✅ getPositionUncertainty tests passed');
}

// Propagazione dell'incertezza nella distanza (GPS-3) in calculateFinalStats
function testDistanceUncertainty() {
    console.log('Testing GPSTracker.calculateFinalStats (incertezza distanza)...');
    const gps = new GPSTrackerClass();

    // Cluster di partenza (accuracy 4) e arrivo (~200 m a nord, accuracy 6)
    const dLat = 200 / 111195;
    gps.trackingPoints = [
        { latitude: 41.9, longitude: 12.5, accuracy: 4, timestamp: 1 },
        { latitude: 41.9, longitude: 12.5, accuracy: 4, timestamp: 2 },
        { latitude: 41.9 + dLat, longitude: 12.5, accuracy: 6, timestamp: 3 },
        { latitude: 41.9 + dLat, longitude: 12.5, accuracy: 6, timestamp: 4 }
    ];
    gps.pointsCollected = 4;
    gps.averageAccuracy = 5;
    gps.startTime = Date.now();

    const stats = gps.calculateFinalStats();

    approx(stats.distance, 200, 2, 'distanza ≈ 200 m');
    // σ_d = sqrt(4² + 6²) ≈ 7.21 m
    approx(stats.distanceUncertainty, Math.sqrt(16 + 36), 0.5, 'σ_d = sqrt(σ_start²+σ_end²) ≈ 7.2 m');
    console.assert(stats.startUncertainty > 0 && stats.endUncertainty > 0,
        'incertezze degli estremi presenti e positive');

    console.log('✅ calculateFinalStats uncertainty tests passed');
}

// Run all tests
function runAllTests() {
    console.log('\n========================================');
    console.log('Running GPSTracker Tests');
    console.log('========================================\n');

    testCalculateDistance();
    testCalculateBearing();
    testWeightedAverage();
    testPositionUncertainty();
    testDistanceUncertainty();

    console.log('\n========================================');
    console.log('All GPSTracker Tests Completed');
    console.log('========================================\n');
}

// Export
if (typeof module !== 'undefined') {
    module.exports = { runAllTests };
}

if (typeof window !== 'undefined') {
    window.runGPSTrackerTests = runAllTests;
}
