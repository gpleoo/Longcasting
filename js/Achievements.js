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
        description: 'Hai registrato il tuo primo lancio',
        icon: '🎣',
        category: 'distance',
        rarity: 'common',
        requirement: { type: 'total_casts', value: 1 }
    },
    distance_100: {
        id: 'distance_100',
        name: 'Centenario',
        description: 'Hai superato i 100 metri',
        icon: '💯',
        category: 'distance',
        rarity: 'common',
        requirement: { type: 'max_distance', value: 100 }
    },
    distance_120: {
        id: 'distance_120',
        name: 'Oltre il Limite',
        description: 'Hai superato i 120 metri',
        icon: '🔥',
        category: 'distance',
        rarity: 'uncommon',
        requirement: { type: 'max_distance', value: 120 }
    },
    distance_140: {
        id: 'distance_140',
        name: 'Cannone',
        description: 'Hai superato i 140 metri',
        icon: '💪',
        category: 'distance',
        rarity: 'rare',
        requirement: { type: 'max_distance', value: 140 }
    },
    distance_160: {
        id: 'distance_160',
        name: 'Cecchino',
        description: 'Hai superato i 160 metri',
        icon: '🎯',
        category: 'distance',
        rarity: 'epic',
        requirement: { type: 'max_distance', value: 160 }
    },
    distance_180: {
        id: 'distance_180',
        name: 'Elite',
        description: 'Hai superato i 180 metri',
        icon: '⭐',
        category: 'distance',
        rarity: 'legendary',
        requirement: { type: 'max_distance', value: 180 }
    },
    distance_200: {
        id: 'distance_200',
        name: 'Leggenda',
        description: 'Hai superato i 200 metri',
        icon: '👑',
        category: 'distance',
        rarity: 'mythic',
        requirement: { type: 'max_distance', value: 200 }
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
    consistent_25: {
        id: 'consistent_25',
        name: 'Macchina',
        description: '25 lanci con variazione < 10%',
        icon: '🤖',
        category: 'consistency',
        rarity: 'rare',
        requirement: { type: 'consistency_streak', value: 25 }
    },
    consistent_50: {
        id: 'consistent_50',
        name: 'Precisione Svizzera',
        description: '50 lanci con variazione < 10%',
        icon: '🎖️',
        category: 'consistency',
        rarity: 'epic',
        requirement: { type: 'consistency_streak', value: 50 }
    },

    // === SESSIONI ===
    sessions_5: {
        id: 'sessions_5',
        name: 'Iniziato',
        description: 'Hai completato 5 sessioni',
        icon: '📝',
        category: 'sessions',
        rarity: 'common',
        requirement: { type: 'total_sessions', value: 5 }
    },
    sessions_25: {
        id: 'sessions_25',
        name: 'Praticante',
        description: 'Hai completato 25 sessioni',
        icon: '📚',
        category: 'sessions',
        rarity: 'uncommon',
        requirement: { type: 'total_sessions', value: 25 }
    },
    sessions_50: {
        id: 'sessions_50',
        name: 'Veterano',
        description: 'Hai completato 50 sessioni',
        icon: '🎖️',
        category: 'sessions',
        rarity: 'rare',
        requirement: { type: 'total_sessions', value: 50 }
    },
    sessions_100: {
        id: 'sessions_100',
        name: 'Maestro',
        description: 'Hai completato 100 sessioni',
        icon: '🏅',
        category: 'sessions',
        rarity: 'epic',
        requirement: { type: 'total_sessions', value: 100 }
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

    // === STREAK ===
    streak_3: {
        id: 'streak_3',
        name: 'Momentum',
        description: '3 giorni consecutivi di allenamento',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        requirement: { type: 'daily_streak', value: 3 }
    },
    streak_7: {
        id: 'streak_7',
        name: 'Settimana Perfetta',
        description: '7 giorni consecutivi',
        icon: '📅',
        category: 'streak',
        rarity: 'uncommon',
        requirement: { type: 'daily_streak', value: 7 }
    },
    streak_14: {
        id: 'streak_14',
        name: 'Due Settimane',
        description: '14 giorni consecutivi',
        icon: '💎',
        category: 'streak',
        rarity: 'rare',
        requirement: { type: 'daily_streak', value: 14 }
    },
    streak_30: {
        id: 'streak_30',
        name: 'Mese di Fuoco',
        description: '30 giorni consecutivi',
        icon: '🏆',
        category: 'streak',
        rarity: 'legendary',
        requirement: { type: 'daily_streak', value: 30 }
    },

    // === MIGLIORAMENTO ===
    improvement_10: {
        id: 'improvement_10',
        name: 'In Crescita',
        description: 'Migliorato del 10% in un mese',
        icon: '📈',
        category: 'improvement',
        rarity: 'uncommon',
        requirement: { type: 'monthly_improvement', value: 10 }
    },
    improvement_20: {
        id: 'improvement_20',
        name: 'Salto di Qualità',
        description: 'Migliorato del 20% in un mese',
        icon: '🚀',
        category: 'improvement',
        rarity: 'rare',
        requirement: { type: 'monthly_improvement', value: 20 }
    },
    new_record: {
        id: 'new_record',
        name: 'Record Breaker',
        description: 'Hai battuto il tuo record personale',
        icon: '🏅',
        category: 'improvement',
        rarity: 'uncommon',
        requirement: { type: 'personal_record', value: 1 }
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
        description: 'Record personale con vento forte',
        icon: '💨',
        category: 'special',
        rarity: 'rare',
        requirement: { type: 'windy_record', value: 1 }
    },
    all_techniques: {
        id: 'all_techniques',
        name: 'Poliedrico',
        description: 'Usato tutte le tecniche di lancio',
        icon: '🎨',
        category: 'special',
        rarity: 'rare',
        requirement: { type: 'all_techniques', value: 1 }
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

    /**
     * Carica badge sbloccati da storage
     */
    loadUnlockedBadges() {
        try {
            const data = localStorage.getItem(AchievementManager.STORAGE_KEY);
            return data ? JSON.parse(data).badges || {} : {};
        } catch (e) {
            return {};
        }
    }

    /**
     * Carica statistiche
     */
    loadStats() {
        try {
            const data = localStorage.getItem(AchievementManager.STORAGE_KEY);
            return data ? JSON.parse(data).stats || this.getDefaultStats() : this.getDefaultStats();
        } catch (e) {
            return this.getDefaultStats();
        }
    }

    /**
     * Statistiche di default
     */
    getDefaultStats() {
        return {
            xp: 0,
            totalCasts: 0,
            totalSessions: 0,
            maxDistance: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastSessionDate: null,
            recordsCount: 0,
            consistencyStreak: 0
        };
    }

    /**
     * Salva dati
     */
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

    /**
     * Aggiorna statistiche da sessioni
     * @param {Array} sessions - Tutte le sessioni (o sessioni filtrate per tipo)
     */
    updateFromSessions(sessions) {
        if (!sessions || sessions.length === 0) {
            // Reset stats and badges when no sessions
            this.stats = this.getDefaultStats();
            this.unlockedBadges = {};
            return;
        }

        // Reset badges and stats to recalculate from scratch based on provided sessions
        // This ensures Campo/Mare separation works correctly
        this.unlockedBadges = {};
        this.stats = this.getDefaultStats();

        // Calcola statistiche
        let totalCasts = 0;
        let maxDistance = 0;
        const dates = new Set();
        const techniques = new Set();

        sessions.forEach(session => {
            if (session.lanci) {
                totalCasts += session.lanci.length;
                session.lanci.forEach(lancio => {
                    if (lancio.distanza > maxDistance) {
                        maxDistance = lancio.distanza;
                    }
                });
            }
            if (session.dataInizio) {
                dates.add(session.dataInizio.split('T')[0]);
            }
            if (session.tecnica) {
                techniques.add(session.tecnica);
            }
        });

        // Aggiorna stats
        this.stats.totalCasts = totalCasts;
        this.stats.totalSessions = sessions.length;
        this.stats.maxDistance = maxDistance;

        // Calcola streak
        this.stats.currentStreak = this.calculateStreak(Array.from(dates).sort());

        // Calcola XP
        this.calculateXP(sessions);

        // Verifica badge
        const newBadges = this.checkAllBadges(sessions, techniques);

        this.save();

        return newBadges;
    }

    /**
     * Calcola streak giorni consecutivi
     */
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

        // Verifica se lo streak è ancora attivo
        const lastDate = sortedDates[sortedDates.length - 1];
        const daysSinceLastSession = (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastSession > 1) {
            streak = 0;
        }

        this.stats.bestStreak = Math.max(this.stats.bestStreak, maxStreak);
        return streak;
    }

    /**
     * Calcola XP totali
     */
    calculateXP(sessions) {
        let xp = 0;

        // XP per lanci
        xp += this.stats.totalCasts * 2;

        // XP per sessioni
        xp += this.stats.totalSessions * 10;

        // XP per distanza
        xp += Math.floor(this.stats.maxDistance);

        // XP per badge sbloccati
        const badgeXP = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200, mythic: 500 };
        Object.keys(this.unlockedBadges).forEach(badgeId => {
            const badge = BADGES[badgeId];
            if (badge) {
                xp += badgeXP[badge.rarity] || 10;
            }
        });

        // XP per streak
        xp += this.stats.bestStreak * 5;

        // XP per record
        xp += this.stats.recordsCount * 20;

        this.stats.xp = xp;
    }

    /**
     * Ottieni livello corrente
     */
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

    /**
     * Verifica tutti i badge
     */
    checkAllBadges(sessions, techniques) {
        const newBadges = [];

        Object.values(BADGES).forEach(badge => {
            if (this.unlockedBadges[badge.id]) return; // Già sbloccato

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

    /**
     * Verifica requisito singolo badge
     */
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
                return this.checkConsistencyStreak(sessions) >= req.value;

            case 'monthly_improvement':
                return this.checkMonthlyImprovement(sessions) >= req.value;

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
                    s.vento === 'forte' &&
                    s.lanci?.some(l => l.distanza === this.stats.maxDistance)
                );

            case 'all_techniques':
                const allTechniques = ['overhead', 'pendulum', 'ground-cast', 'off-ground'];
                return allTechniques.every(t =>
                    Array.from(techniques).some(ut => ut.toLowerCase().includes(t.split('-')[0]))
                );

            default:
                return false;
        }
    }

    /**
     * Verifica streak di consistenza
     */
    checkConsistencyStreak(sessions) {
        let streak = 0;
        let maxStreak = 0;

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

            if (maxDev < 10) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 0;
            }
        }

        return maxStreak;
    }

    /**
     * Verifica miglioramento mensile
     */
    checkMonthlyImprovement(sessions) {
        const now = new Date();
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 1));

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

    /**
     * Calcola distanza media da sessioni
     */
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

    /**
     * Ottieni tutti i badge (sbloccati e non)
     */
    getAllBadges() {
        return Object.values(BADGES).map(badge => ({
            ...badge,
            unlocked: !!this.unlockedBadges[badge.id],
            unlockedAt: this.unlockedBadges[badge.id]?.unlockedAt
        }));
    }

    /**
     * Ottieni badge per categoria
     */
    getBadgesByCategory(category) {
        return this.getAllBadges().filter(b => b.category === category);
    }

    /**
     * Ottieni statistiche badge
     */
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

    /**
     * Ottieni prossimi badge raggiungibili
     */
    getNextAchievableBadges(limit = 3) {
        const locked = this.getAllBadges().filter(b => !b.unlocked);

        // Calcola progresso per ogni badge
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
                default:
                    progress = 0;
            }

            return { ...badge, progress: Math.min(progress, 99) };
        });

        // Ordina per progresso (più vicini al completamento prima)
        return withProgress
            .filter(b => b.progress > 0)
            .sort((a, b) => b.progress - a.progress)
            .slice(0, limit);
    }

    /**
     * Registra listener per nuovi badge
     */
    onBadgeUnlocked(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notifica listeners
     */
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
