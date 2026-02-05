// ============================================
// ACHIEVEMENTS - Sistema Badge e Traguardi
// ============================================

/**
 * Definizione di tutti i badge disponibili
 */
const BADGES = {
    // === DISTANZA ===
    first_cast: {
        id: 'first_cast',
        name: 'Primo Lancio',
        description: 'Registra il primo lancio',
        icon: '🎣',
        category: 'distance',
        rarity: 'common',
        requirement: { type: 'total_casts', value: 1 }
    },
    distance_100: {
        id: 'distance_100',
        name: 'Centoooo',
        description: 'Supera i 100m',
        icon: '💯',
        category: 'distance',
        rarity: 'common',
        requirement: { type: 'max_distance', value: 100 }
    },
    distance_120: {
        id: 'distance_120',
        name: 'Oltre il Limite',
        description: 'Supera i 120m',
        icon: '🔥',
        category: 'distance',
        rarity: 'uncommon',
        requirement: { type: 'max_distance', value: 120 }
    },
    distance_140: {
        id: 'distance_140',
        name: 'Cannone',
        description: 'Supera i 140m',
        icon: '💪',
        category: 'distance',
        rarity: 'rare',
        requirement: { type: 'max_distance', value: 140 }
    },
    distance_160: {
        id: 'distance_160',
        name: 'Cecchino',
        description: 'Supera i 160m',
        icon: '🎯',
        category: 'distance',
        rarity: 'epic',
        requirement: { type: 'max_distance', value: 160 }
    },
    distance_180: {
        id: 'distance_180',
        name: 'Elite',
        description: 'Supera i 180m',
        icon: '⭐',
        category: 'distance',
        rarity: 'legendary',
        requirement: { type: 'max_distance', value: 180 }
    },
    distance_200: {
        id: 'distance_200',
        name: 'Leggenda',
        description: 'Supera i 200m',
        icon: '👑',
        category: 'distance',
        rarity: 'mythic',
        requirement: { type: 'max_distance', value: 200 }
    },
    distance_220: {
        id: 'distance_220',
        name: 'Lunare',
        description: 'Supera i 220m',
        icon: '🌙',
        category: 'distance',
        rarity: 'mythic',
        requirement: { type: 'max_distance', value: 220 }
    },
    distance_250: {
        id: 'distance_250',
        name: 'Meteora',
        description: 'Supera i 250m',
        icon: '☄️',
        category: 'distance',
        rarity: 'mythic',
        requirement: { type: 'max_distance', value: 250 }
    },
    archer: {
        id: 'archer',
        name: 'Arciere',
        description: '10 lanci sopra 180m in una sessione',
        icon: '🏹',
        category: 'distance',
        rarity: 'epic',
        requirement: { type: 'session_above', value: 180, count: 10 }
    },

    // === MARE (giri mulinello) ===
    sea_wolf: {
        id: 'sea_wolf',
        name: 'Lupo di Mare',
        description: 'Prima sessione in mare',
        icon: '🌊',
        category: 'sea',
        rarity: 'common',
        requirement: { type: 'sea_sessions', value: 1 }
    },
    octopus: {
        id: 'octopus',
        name: 'Polpo',
        description: '100 lanci totali in mare',
        icon: '🐙',
        category: 'sea',
        rarity: 'uncommon',
        requirement: { type: 'sea_casts', value: 100 }
    },
    shark: {
        id: 'shark',
        name: 'Squalo',
        description: 'Supera i 200 giri in un lancio',
        icon: '🦈',
        category: 'sea',
        rarity: 'rare',
        requirement: { type: 'max_giri', value: 200 }
    },
    whale: {
        id: 'whale',
        name: 'Balena',
        description: 'Supera i 220 giri in un lancio',
        icon: '🐋',
        category: 'sea',
        rarity: 'epic',
        requirement: { type: 'max_giri', value: 220 }
    },
    kraken: {
        id: 'kraken',
        name: 'Kraken',
        description: 'Supera i 250 giri in un lancio',
        icon: '🦑',
        category: 'sea',
        rarity: 'legendary',
        requirement: { type: 'max_giri', value: 250 }
    },
    captain: {
        id: 'captain',
        name: 'Capitano',
        description: '25 sessioni in mare',
        icon: '⚓',
        category: 'sea',
        rarity: 'rare',
        requirement: { type: 'sea_sessions', value: 25 }
    },
    admiral: {
        id: 'admiral',
        name: 'Ammiraglio',
        description: '50 sessioni in mare',
        icon: '🚢',
        category: 'sea',
        rarity: 'epic',
        requirement: { type: 'sea_sessions', value: 50 }
    },

    // === CONSISTENZA ===
    consistent_10: {
        id: 'consistent_10',
        name: 'Costante',
        description: '10 lanci con variazione < 10%',
        icon: '📊',
        category: 'consistency',
        rarity: 'uncommon',
        requirement: { type: 'consistency_streak', value: 10 }
    },
    swiss_precision: {
        id: 'swiss_precision',
        name: 'Precisione Svizzera',
        description: '30 lanci con variazione < 10%',
        icon: '🎖️',
        category: 'consistency',
        rarity: 'epic',
        requirement: { type: 'consistency_streak', value: 30 }
    },
    perfectionist: {
        id: 'perfectionist',
        name: 'Perfezionista',
        description: '10 lanci entro il 5% della media',
        icon: '🎯',
        category: 'consistency',
        rarity: 'rare',
        requirement: { type: 'tight_consistency', value: 10, threshold: 5 }
    },
    surgical: {
        id: 'surgical',
        name: 'Chirurgico',
        description: '10 lanci con variazione < 2%',
        icon: '🔬',
        category: 'consistency',
        rarity: 'epic',
        requirement: { type: 'tight_consistency', value: 10, threshold: 2 }
    },
    virtuoso: {
        id: 'virtuoso',
        name: 'Virtuoso',
        description: '30 lanci con variazione < 2%',
        icon: '🎻',
        category: 'consistency',
        rarity: 'legendary',
        requirement: { type: 'tight_consistency', value: 30, threshold: 2 }
    },

    // === SESSIONI ===
    sessions_5: {
        id: 'sessions_5',
        name: 'Iniziato',
        description: '5 sessioni completate',
        icon: '📝',
        category: 'sessions',
        rarity: 'common',
        requirement: { type: 'total_sessions', value: 5 }
    },
    sessions_15: {
        id: 'sessions_15',
        name: 'Praticante',
        description: '15 sessioni completate',
        icon: '📚',
        category: 'sessions',
        rarity: 'uncommon',
        requirement: { type: 'total_sessions', value: 15 }
    },
    sessions_25: {
        id: 'sessions_25',
        name: 'Veterano',
        description: '25 sessioni completate',
        icon: '🎖️',
        category: 'sessions',
        rarity: 'rare',
        requirement: { type: 'total_sessions', value: 25 }
    },
    sessions_50: {
        id: 'sessions_50',
        name: 'Maestro',
        description: '50 sessioni completate',
        icon: '🏅',
        category: 'sessions',
        rarity: 'epic',
        requirement: { type: 'total_sessions', value: 50 }
    },
    sessions_100: {
        id: 'sessions_100',
        name: 'Senatore',
        description: '100 sessioni completate',
        icon: '🏛️',
        category: 'sessions',
        rarity: 'legendary',
        requirement: { type: 'total_sessions', value: 100 }
    },
    sessions_200: {
        id: 'sessions_200',
        name: 'Saggio',
        description: '200 sessioni completate',
        icon: '👴',
        category: 'sessions',
        rarity: 'mythic',
        requirement: { type: 'total_sessions', value: 200 }
    },

    // === LANCI TOTALI ===
    casts_50: {
        id: 'casts_50',
        name: 'Braccio Caldo',
        description: '50 lanci totali',
        icon: '💪',
        category: 'volume',
        rarity: 'common',
        requirement: { type: 'total_casts', value: 50 }
    },
    casts_250: {
        id: 'casts_250',
        name: 'Instancabile',
        description: '250 lanci totali',
        icon: '🔋',
        category: 'volume',
        rarity: 'uncommon',
        requirement: { type: 'total_casts', value: 250 }
    },
    casts_500: {
        id: 'casts_500',
        name: 'Maratoneta',
        description: '500 lanci totali',
        icon: '🏃',
        category: 'volume',
        rarity: 'rare',
        requirement: { type: 'total_casts', value: 500 }
    },
    casts_1000: {
        id: 'casts_1000',
        name: 'Mille e Uno',
        description: '1000 lanci totali',
        icon: '🌟',
        category: 'volume',
        rarity: 'epic',
        requirement: { type: 'total_casts', value: 1000 }
    },
    casts_2500: {
        id: 'casts_2500',
        name: 'Infuocato',
        description: '2500 lanci totali',
        icon: '🔥',
        category: 'volume',
        rarity: 'legendary',
        requirement: { type: 'total_casts', value: 2500 }
    },
    casts_5000: {
        id: 'casts_5000',
        name: 'Diamante',
        description: '5000 lanci totali',
        icon: '💎',
        category: 'volume',
        rarity: 'mythic',
        requirement: { type: 'total_casts', value: 5000 }
    },

    // === STREAK ===
    streak_2: {
        id: 'streak_2',
        name: 'Momentum',
        description: '2 giorni consecutivi',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        requirement: { type: 'daily_streak', value: 2 }
    },
    streak_3: {
        id: 'streak_3',
        name: 'Settimana Perfetta',
        description: '3 giorni consecutivi',
        icon: '📅',
        category: 'streak',
        rarity: 'uncommon',
        requirement: { type: 'daily_streak', value: 3 }
    },
    streak_4: {
        id: 'streak_4',
        name: 'Top',
        description: '4 giorni consecutivi',
        icon: '💎',
        category: 'streak',
        rarity: 'rare',
        requirement: { type: 'daily_streak', value: 4 }
    },
    streak_15: {
        id: 'streak_15',
        name: 'Mese di Fuoco',
        description: '15 giorni consecutivi',
        icon: '🏆',
        category: 'streak',
        rarity: 'legendary',
        requirement: { type: 'daily_streak', value: 15 }
    },
    streak_20: {
        id: 'streak_20',
        name: 'Vulcano',
        description: '20 giorni consecutivi',
        icon: '🌋',
        category: 'streak',
        rarity: 'legendary',
        requirement: { type: 'daily_streak', value: 20 }
    },
    streak_25: {
        id: 'streak_25',
        name: 'Everest',
        description: '25 giorni consecutivi',
        icon: '🏔️',
        category: 'streak',
        rarity: 'mythic',
        requirement: { type: 'daily_streak', value: 25 }
    },

    // === MIGLIORAMENTO ===
    improvement_10: {
        id: 'improvement_10',
        name: 'In Crescita',
        description: '+10% in un mese',
        icon: '📈',
        category: 'improvement',
        rarity: 'uncommon',
        requirement: { type: 'monthly_improvement', value: 10 }
    },
    improvement_20: {
        id: 'improvement_20',
        name: 'Salto di Qualità',
        description: '+20% in un mese',
        icon: '🚀',
        category: 'improvement',
        rarity: 'rare',
        requirement: { type: 'monthly_improvement', value: 20 }
    },
    record_breaker: {
        id: 'record_breaker',
        name: 'Record Breaker',
        description: 'Batti il tuo record personale',
        icon: '🏅',
        category: 'improvement',
        rarity: 'uncommon',
        requirement: { type: 'personal_record', value: 1 }
    },
    comeback: {
        id: 'comeback',
        name: 'Comeback',
        description: 'Migliora dopo 2 settimane di pausa',
        icon: '🔙',
        category: 'improvement',
        rarity: 'rare',
        requirement: { type: 'comeback', value: 14 }
    },
    plateau_breaker: {
        id: 'plateau_breaker',
        name: 'Rompi Plateau',
        description: 'Nuovo record dopo 10 sessioni senza miglioramenti',
        icon: '🧱',
        category: 'improvement',
        rarity: 'epic',
        requirement: { type: 'break_plateau', value: 10 }
    },
    lightning: {
        id: 'lightning',
        name: 'Fulmine',
        description: '+5m in una settimana',
        icon: '⚡',
        category: 'improvement',
        rarity: 'uncommon',
        requirement: { type: 'weekly_improvement', value: 5 }
    },

    // === SPECIALI ===
    night_owl: {
        id: 'night_owl',
        name: 'Nottambulo',
        description: 'Sessione dopo le 21:00',
        icon: '🦉',
        category: 'special',
        rarity: 'uncommon',
        requirement: { type: 'night_session', value: 1 }
    },
    early_bird: {
        id: 'early_bird',
        name: 'Mattiniero',
        description: 'Sessione prima delle 7:00',
        icon: '🐦',
        category: 'special',
        rarity: 'uncommon',
        requirement: { type: 'early_session', value: 1 }
    },
    wind_master: {
        id: 'wind_master',
        name: 'Domatore di Vento',
        description: 'Record con vento forte',
        icon: '💨',
        category: 'special',
        rarity: 'rare',
        requirement: { type: 'windy_record', value: 1 }
    },
    versatile: {
        id: 'versatile',
        name: 'Poliedrico',
        description: 'Usato tutte le tecniche',
        icon: '🎨',
        category: 'special',
        rarity: 'rare',
        requirement: { type: 'all_techniques', value: 1 }
    },

    // === RESISTENZA ===
    marathon: {
        id: 'marathon',
        name: 'Maratona',
        description: '50+ lanci in una sessione',
        icon: '🏋️',
        category: 'endurance',
        rarity: 'uncommon',
        requirement: { type: 'session_casts', value: 50 }
    },
    ironman: {
        id: 'ironman',
        name: 'Ironman',
        description: 'Sessione di oltre 2 ore',
        icon: '⏱️',
        category: 'endurance',
        rarity: 'rare',
        requirement: { type: 'session_duration', value: 120 }
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: '20 lanci in meno di 30 minuti',
        icon: '⚡',
        category: 'endurance',
        rarity: 'rare',
        requirement: { type: 'speed_session', value: 20, minutes: 30 }
    },
    steel_arm: {
        id: 'steel_arm',
        name: "Braccio d'Acciaio",
        description: '80 lanci in una sessione',
        icon: '🦾',
        category: 'endurance',
        rarity: 'legendary',
        requirement: { type: 'session_casts', value: 80 }
    },

    // === LOCATION ===
    explorer: {
        id: 'explorer',
        name: 'Esploratore',
        description: 'Allenamento in 5 luoghi diversi',
        icon: '🗺️',
        category: 'location',
        rarity: 'uncommon',
        requirement: { type: 'unique_locations', value: 5 }
    },
    home_sweet_home: {
        id: 'home_sweet_home',
        name: 'Casa Dolce Casa',
        description: '20 sessioni nello stesso luogo',
        icon: '🏠',
        category: 'location',
        rarity: 'rare',
        requirement: { type: 'same_location', value: 20 }
    },
    globetrotter: {
        id: 'globetrotter',
        name: 'Giramondo',
        description: 'Allenamento in 10 luoghi diversi',
        icon: '✈️',
        category: 'location',
        rarity: 'rare',
        requirement: { type: 'unique_locations', value: 10 }
    },
    world_traveler: {
        id: 'world_traveler',
        name: 'Globetrotter',
        description: '25 luoghi diversi',
        icon: '🌍',
        category: 'location',
        rarity: 'epic',
        requirement: { type: 'unique_locations', value: 25 }
    },
    loyal_to_field: {
        id: 'loyal_to_field',
        name: 'Fedele al Campo',
        description: '50 sessioni nello stesso luogo',
        icon: '📍',
        category: 'location',
        rarity: 'epic',
        requirement: { type: 'same_location', value: 50 }
    },

    // === ATTREZZATURA ===
    technician: {
        id: 'technician',
        name: 'Tecnico',
        description: 'Usato 3 canne diverse',
        icon: '🔧',
        category: 'equipment',
        rarity: 'uncommon',
        requirement: { type: 'unique_rods', value: 3 }
    },
    collector: {
        id: 'collector',
        name: 'Collezionista',
        description: 'Usato 3 mulinelli diversi',
        icon: '🎣',
        category: 'equipment',
        rarity: 'rare',
        requirement: { type: 'unique_reels', value: 3 }
    },

    // === DISTANZA CUMULATIVA ===
    first_km: {
        id: 'first_km',
        name: 'Primo Chilometro',
        description: '1 km totale lanciato',
        icon: '🛤️',
        category: 'cumulative',
        rarity: 'common',
        requirement: { type: 'total_distance', value: 1000 }
    },
    ten_km: {
        id: 'ten_km',
        name: '10K',
        description: '10 km totali lanciati',
        icon: '🛣️',
        category: 'cumulative',
        rarity: 'uncommon',
        requirement: { type: 'total_distance', value: 10000 }
    },
    marathon_total: {
        id: 'marathon_total',
        name: 'Maratona Totale',
        description: '42.195 km totali',
        icon: '🏃',
        category: 'cumulative',
        rarity: 'rare',
        requirement: { type: 'total_distance', value: 42195 }
    },
    world_tour: {
        id: 'world_tour',
        name: 'Giro del Mondo',
        description: '500 km totali',
        icon: '🌍',
        category: 'cumulative',
        rarity: 'legendary',
        requirement: { type: 'total_distance', value: 500000 }
    }
};

/**
 * Livelli utente
 */
const LEVELS = [
    { level: 1, name: 'Principiante', minXP: 0, icon: '🌱' },
    { level: 2, name: 'Apprendista', minXP: 100, icon: '🌿' },
    { level: 3, name: 'Praticante', minXP: 300, icon: '🌳' },
    { level: 4, name: 'Esperto', minXP: 600, icon: '⭐' },
    { level: 5, name: 'Veterano', minXP: 1000, icon: '🌟' },
    { level: 6, name: 'Maestro', minXP: 1500, icon: '💫' },
    { level: 7, name: 'Campione', minXP: 2200, icon: '🏆' },
    { level: 8, name: 'Elite', minXP: 3000, icon: '👑' },
    { level: 9, name: 'Leggenda', minXP: 4000, icon: '🔱' },
    { level: 10, name: 'Mito', minXP: 5500, icon: '🌠' }
];

/**
 * Classe AchievementManager per gestione badge e progressi
 */
class AchievementManager {
    static STORAGE_KEY = 'longcast_achievements';

    constructor() {
        this.unlockedBadges = this.loadUnlockedBadges();
        this.stats = this.loadStats();
        this.listeners = [];
    }

    loadUnlockedBadges() {
        try {
            const data = localStorage.getItem(AchievementManager.STORAGE_KEY);
            return data ? JSON.parse(data).badges || {} : {};
        } catch (e) {
            return {};
        }
    }

    loadStats() {
        try {
            const data = localStorage.getItem(AchievementManager.STORAGE_KEY);
            return data ? JSON.parse(data).stats || this.getDefaultStats() : this.getDefaultStats();
        } catch (e) {
            return this.getDefaultStats();
        }
    }

    getDefaultStats() {
        return {
            xp: 0,
            totalCasts: 0,
            totalSessions: 0,
            maxDistance: 0,
            totalDistance: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastSessionDate: null,
            recordsCount: 0,
            consistencyStreak: 0,
            // Sea stats
            seaSessions: 0,
            seaCasts: 0,
            maxGiri: 0
        };
    }

    save() {
        try {
            localStorage.setItem(AchievementManager.STORAGE_KEY, JSON.stringify({
                badges: this.unlockedBadges,
                stats: this.stats
            }));
        } catch (e) {
            console.error('Errore salvataggio achievements:', e);
        }
    }

    updateFromSessions(sessions) {
        if (!sessions || sessions.length === 0) {
            this.stats = this.getDefaultStats();
            this.unlockedBadges = {};
            return;
        }

        // Reset per ricalcolare da zero
        this.unlockedBadges = {};
        this.stats = this.getDefaultStats();

        // Calcola statistiche
        let totalCasts = 0;
        let maxDistance = 0;
        let totalDistance = 0;
        let seaSessions = 0;
        let seaCasts = 0;
        let maxGiri = 0;
        const dates = new Set();
        const techniques = new Set();
        const locations = new Set();
        const rods = new Set();
        const reels = new Set();
        const locationCounts = {};

        sessions.forEach(session => {
            // Conta sessioni mare
            if (session.tipo === 'mare') {
                seaSessions++;
            }

            if (session.lanci) {
                totalCasts += session.lanci.length;

                // Conta lanci mare
                if (session.tipo === 'mare') {
                    seaCasts += session.lanci.length;
                }

                session.lanci.forEach(lancio => {
                    if (lancio.distanza > maxDistance) {
                        maxDistance = lancio.distanza;
                    }
                    totalDistance += lancio.distanza || 0;

                    // Track giri per mare
                    if (lancio.giri && lancio.giri > maxGiri) {
                        maxGiri = lancio.giri;
                    }
                });
            }

            if (session.dataInizio) {
                dates.add(session.dataInizio.split('T')[0]);
            }
            if (session.tecnica) {
                techniques.add(session.tecnica);
            }
            if (session.luogo) {
                locations.add(session.luogo);
                locationCounts[session.luogo] = (locationCounts[session.luogo] || 0) + 1;
            }
            if (session.cannaModello) {
                rods.add(session.cannaModello);
            }
            if (session.mulinello) {
                reels.add(session.mulinello);
            }
        });

        // Aggiorna stats
        this.stats.totalCasts = totalCasts;
        this.stats.totalSessions = sessions.length;
        this.stats.maxDistance = maxDistance;
        this.stats.totalDistance = totalDistance;
        this.stats.seaSessions = seaSessions;
        this.stats.seaCasts = seaCasts;
        this.stats.maxGiri = maxGiri;
        this.stats.uniqueLocations = locations.size;
        this.stats.maxSameLocation = Math.max(...Object.values(locationCounts), 0);
        this.stats.uniqueRods = rods.size;
        this.stats.uniqueReels = reels.size;

        // Calcola streak
        this.stats.currentStreak = this.calculateStreak(Array.from(dates).sort());

        // Calcola XP
        this.calculateXP(sessions);

        // Verifica badge
        const newBadges = this.checkAllBadges(sessions, techniques);

        this.save();
        return newBadges;
    }

    calculateStreak(sortedDates) {
        if (sortedDates.length === 0) return 0;

        let streak = 1;
        let maxStreak = 1;
        const today = new Date().toISOString().split('T')[0];

        for (let i = sortedDates.length - 1; i > 0; i--) {
            const current = new Date(sortedDates[i]);
            const previous = new Date(sortedDates[i - 1]);
            const diffDays = (current - previous) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else if (diffDays > 1) {
                break;
            }
        }

        const lastDate = sortedDates[sortedDates.length - 1];
        const daysSinceLastSession = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastSession > 1) {
            streak = 0;
        }

        this.stats.bestStreak = Math.max(this.stats.bestStreak, maxStreak);
        return streak;
    }

    calculateXP(sessions) {
        let xp = 0;
        xp += this.stats.totalCasts * 2;
        xp += this.stats.totalSessions * 10;
        xp += Math.floor(this.stats.maxDistance);

        const badgeXP = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200, mythic: 500 };
        Object.keys(this.unlockedBadges).forEach(badgeId => {
            const badge = BADGES[badgeId];
            if (badge) {
                xp += badgeXP[badge.rarity] || 10;
            }
        });

        xp += this.stats.bestStreak * 5;
        xp += this.stats.recordsCount * 20;
        this.stats.xp = xp;
    }

    getCurrentLevel() {
        let currentLevel = LEVELS[0];

        for (const level of LEVELS) {
            if (this.stats.xp >= level.minXP) {
                currentLevel = level;
            } else {
                break;
            }
        }

        const nextLevel = LEVELS.find(l => l.minXP > this.stats.xp);
        const progress = nextLevel
            ? ((this.stats.xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
            : 100;

        return {
            ...currentLevel,
            currentXP: this.stats.xp,
            nextLevel: nextLevel,
            progress: Math.round(progress),
            xpToNext: nextLevel ? nextLevel.minXP - this.stats.xp : 0
        };
    }

    checkAllBadges(sessions, techniques) {
        const newBadges = [];

        Object.values(BADGES).forEach(badge => {
            if (this.unlockedBadges[badge.id]) return;

            const unlocked = this.checkBadgeRequirement(badge, sessions, techniques);

            if (unlocked) {
                this.unlockedBadges[badge.id] = {
                    unlockedAt: new Date().toISOString(),
                    badge: badge
                };
                newBadges.push(badge);
            }
        });

        return newBadges;
    }

    checkBadgeRequirement(badge, sessions, techniques) {
        const req = badge.requirement;

        switch (req.type) {
            case 'total_casts':
                return this.stats.totalCasts >= req.value;

            case 'max_distance':
                return this.stats.maxDistance >= req.value;

            case 'total_sessions':
                return this.stats.totalSessions >= req.value;

            case 'daily_streak':
                return this.stats.currentStreak >= req.value || this.stats.bestStreak >= req.value;

            case 'personal_record':
                return this.stats.recordsCount >= req.value;

            case 'consistency_streak':
                return this.checkConsistencyStreak(sessions, 10) >= req.value;

            case 'tight_consistency':
                return this.checkConsistencyStreak(sessions, req.threshold) >= req.value;

            case 'monthly_improvement':
                return this.checkMonthlyImprovement(sessions) >= req.value;

            case 'weekly_improvement':
                return this.checkWeeklyImprovement(sessions) >= req.value;

            case 'night_session':
                return sessions.some(s => {
                    const hour = new Date(s.dataInizio).getHours();
                    return hour >= 21 || hour < 5;
                });

            case 'early_session':
                return sessions.some(s => {
                    const hour = new Date(s.dataInizio).getHours();
                    return hour < 7 && hour >= 5;
                });

            case 'windy_record':
                return sessions.some(s =>
                    (s.vento === 'forte' || s.vento?.toLowerCase().includes('forte')) &&
                    s.lanci?.some(l => l.distanza === this.stats.maxDistance)
                );

            case 'all_techniques':
                const allTechniques = ['overhead', 'pendulum', 'ground', 'off-ground'];
                return allTechniques.every(t =>
                    Array.from(techniques).some(ut => ut.toLowerCase().includes(t.split('-')[0]))
                );

            // === NUOVI TIPI ===
            case 'sea_sessions':
                return this.stats.seaSessions >= req.value;

            case 'sea_casts':
                return this.stats.seaCasts >= req.value;

            case 'max_giri':
                return this.stats.maxGiri >= req.value;

            case 'session_casts':
                return sessions.some(s => s.lanci && s.lanci.length >= req.value);

            case 'session_duration':
                return sessions.some(s => {
                    if (!s.dataInizio || !s.dataFine) return false;
                    const start = new Date(s.dataInizio);
                    const end = new Date(s.dataFine);
                    const durationMinutes = (end - start) / (1000 * 60);
                    return durationMinutes >= req.value;
                });

            case 'speed_session':
                return sessions.some(s => {
                    if (!s.dataInizio || !s.dataFine || !s.lanci) return false;
                    const start = new Date(s.dataInizio);
                    const end = new Date(s.dataFine);
                    const durationMinutes = (end - start) / (1000 * 60);
                    return s.lanci.length >= req.value && durationMinutes <= req.minutes;
                });

            case 'session_above':
                return sessions.some(s => {
                    if (!s.lanci) return false;
                    const aboveCount = s.lanci.filter(l => l.distanza >= req.value).length;
                    return aboveCount >= req.count;
                });

            case 'unique_locations':
                return this.stats.uniqueLocations >= req.value;

            case 'same_location':
                return this.stats.maxSameLocation >= req.value;

            case 'unique_rods':
                return this.stats.uniqueRods >= req.value;

            case 'unique_reels':
                return this.stats.uniqueReels >= req.value;

            case 'total_distance':
                return this.stats.totalDistance >= req.value;

            case 'comeback':
            case 'break_plateau':
                // Questi richiedono logica più complessa, per ora false
                return false;

            default:
                return false;
        }
    }

    checkConsistencyStreak(sessions, thresholdPercent = 10) {
        let maxStreak = 0;
        let streak = 0;

        const allDistances = [];
        sessions.forEach(s => {
            if (s.lanci) {
                s.lanci.forEach(l => allDistances.push(l.distanza));
            }
        });

        if (allDistances.length < 10) return 0;

        for (let i = 9; i < allDistances.length; i++) {
            const window = allDistances.slice(i - 9, i + 1);
            const avg = window.reduce((a, b) => a + b, 0) / 10;
            const maxDev = Math.max(...window.map(d => Math.abs(d - avg) / avg * 100));

            if (maxDev < thresholdPercent) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 0;
            }
        }

        return maxStreak;
    }

    checkMonthlyImprovement(sessions) {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const lastMonth = sessions.filter(s => new Date(s.dataInizio) >= oneMonthAgo);
        const prevMonth = sessions.filter(s => {
            const date = new Date(s.dataInizio);
            return date >= twoMonthsAgo && date < oneMonthAgo;
        });

        if (lastMonth.length === 0 || prevMonth.length === 0) return 0;

        const avgLast = this.calculateAvgDistance(lastMonth);
        const avgPrev = this.calculateAvgDistance(prevMonth);

        return avgPrev > 0 ? ((avgLast - avgPrev) / avgPrev) * 100 : 0;
    }

    checkWeeklyImprovement(sessions) {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const lastWeek = sessions.filter(s => new Date(s.dataInizio) >= oneWeekAgo);
        const prevWeek = sessions.filter(s => {
            const date = new Date(s.dataInizio);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        });

        if (lastWeek.length === 0 || prevWeek.length === 0) return 0;

        const maxLast = Math.max(...lastWeek.flatMap(s => s.lanci?.map(l => l.distanza) || [0]));
        const maxPrev = Math.max(...prevWeek.flatMap(s => s.lanci?.map(l => l.distanza) || [0]));

        return maxLast - maxPrev;
    }

    calculateAvgDistance(sessions) {
        let total = 0;
        let count = 0;

        sessions.forEach(s => {
            if (s.lanci) {
                s.lanci.forEach(l => {
                    total += l.distanza;
                    count++;
                });
            }
        });

        return count > 0 ? total / count : 0;
    }

    getAllBadges() {
        return Object.values(BADGES).map(badge => ({
            ...badge,
            unlocked: !!this.unlockedBadges[badge.id],
            unlockedAt: this.unlockedBadges[badge.id]?.unlockedAt
        }));
    }

    getBadgesByCategory(category) {
        return this.getAllBadges().filter(b => b.category === category);
    }

    getBadgeStats() {
        const all = Object.keys(BADGES).length;
        const unlocked = Object.keys(this.unlockedBadges).length;

        const byRarity = {};
        Object.values(BADGES).forEach(badge => {
            if (!byRarity[badge.rarity]) {
                byRarity[badge.rarity] = { total: 0, unlocked: 0 };
            }
            byRarity[badge.rarity].total++;
            if (this.unlockedBadges[badge.id]) {
                byRarity[badge.rarity].unlocked++;
            }
        });

        return {
            total: all,
            unlocked: unlocked,
            percentage: Math.round((unlocked / all) * 100),
            byRarity
        };
    }

    getNextAchievableBadges(limit = 3) {
        const locked = this.getAllBadges().filter(b => !b.unlocked);

        const withProgress = locked.map(badge => {
            let progress = 0;
            const req = badge.requirement;

            switch (req.type) {
                case 'total_casts':
                    progress = (this.stats.totalCasts / req.value) * 100;
                    break;
                case 'max_distance':
                    progress = (this.stats.maxDistance / req.value) * 100;
                    break;
                case 'total_sessions':
                    progress = (this.stats.totalSessions / req.value) * 100;
                    break;
                case 'daily_streak':
                    progress = (Math.max(this.stats.currentStreak, this.stats.bestStreak) / req.value) * 100;
                    break;
                case 'sea_sessions':
                    progress = (this.stats.seaSessions / req.value) * 100;
                    break;
                case 'sea_casts':
                    progress = (this.stats.seaCasts / req.value) * 100;
                    break;
                case 'max_giri':
                    progress = (this.stats.maxGiri / req.value) * 100;
                    break;
                case 'total_distance':
                    progress = (this.stats.totalDistance / req.value) * 100;
                    break;
                case 'unique_locations':
                    progress = ((this.stats.uniqueLocations || 0) / req.value) * 100;
                    break;
                case 'same_location':
                    progress = ((this.stats.maxSameLocation || 0) / req.value) * 100;
                    break;
                case 'unique_rods':
                    progress = ((this.stats.uniqueRods || 0) / req.value) * 100;
                    break;
                case 'unique_reels':
                    progress = ((this.stats.uniqueReels || 0) / req.value) * 100;
                    break;
                default:
                    progress = 0;
            }

            return { ...badge, progress: Math.min(progress, 99) };
        });

        return withProgress
            .filter(b => b.progress > 0)
            .sort((a, b) => b.progress - a.progress)
            .slice(0, limit);
    }

    onBadgeUnlocked(callback) {
        this.listeners.push(callback);
    }

    notifyBadgeUnlocked(badge) {
        this.listeners.forEach(cb => cb(badge));
    }
}

// Export
if (typeof window !== 'undefined') {
    window.BADGES = BADGES;
    window.LEVELS = LEVELS;
    window.AchievementManager = AchievementManager;
}
